import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEducatorSession } from "@/app/lib/auth";
import { redis, RedisKeys, QuizMeta } from "@/app/lib/redis";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: NextRequest) {
    const session = await getEducatorSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { quiz_id: number };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { quiz_id } = body;
    if (!quiz_id) {
        return NextResponse.json({ error: "quiz_id is required" }, { status: 400 });
    }

    // Verify the quiz belongs to this educator
    const quiz = await prisma.quiz.findUnique({
        where: { quiz_id },
        include: { class: true },
    });
    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    if (quiz.class.creater_id !== session.educator_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!quiz.is_live) {
        return NextResponse.json({ error: "Quiz is not live" }, { status: 400 });
    }

    // Load quiz meta so we know which question_ids are valid
    const metaRaw = await redis.get(RedisKeys.quizMeta(quiz_id));
    if (!metaRaw) {
        return NextResponse.json(
            { error: "No live session found in Redis for this quiz" },
            { status: 404 }
        );
    }
    const quizMeta = JSON.parse(metaRaw) as QuizMeta;
    const validQuestionIds = new Set(quizMeta.questions.map((q) => q.question_id));

    // Read all registered students from the leaderboard sorted set
    const lbKey = RedisKeys.leaderboard(quiz_id);
    const members = await redis.zrange(lbKey, 0, -1); // all student_ids

    let syncedCount = 0;
    const attemptMap: { student_id: number; attempt_id: number }[] = [];

    for (const memberStr of members) {
        const studentId = parseInt(memberStr, 10);
        const pointsStr = await redis.get(RedisKeys.attemptPoints(quiz_id, studentId));
        const totalPoints = pointsStr ? parseInt(pointsStr, 10) : 0;

        const answersRaw = await redis.hgetall(RedisKeys.attemptAnswers(quiz_id, studentId));

        await prisma.$transaction(async (tx) => {
            // Create the attempt record
            const attempt = await tx.quiz_Attempt.create({
                data: {
                    student_id: studentId,
                    quiz_id,
                    points: totalPoints,
                    is_Live: true,
                    attempt_date: new Date(),
                    is_complete: true,
                },
            });

            attemptMap.push({ student_id: studentId, attempt_id: attempt.attempt_id });

            // Write each answered question
            for (const [questionIdStr, answerJson] of Object.entries(answersRaw)) {
                const questionId = parseInt(questionIdStr, 10);
                if (!validQuestionIds.has(questionId)) continue;

                const ans = JSON.parse(answerJson) as {
                    question_type: number;
                    option_id: number | null;
                    selected_option_ids: number[];
                    integer_answer: number | null;
                };

                const studentAnswer = await tx.student_Answer.create({
                    data: {
                        attempt_id: attempt.attempt_id,
                        question_id: questionId,
                        option_id: ans.option_id ?? null,
                        integer_answer: ans.integer_answer ?? null,
                    },
                });

                if (ans.question_type === 2 && ans.selected_option_ids.length > 0) {
                    await tx.student_Answer_Option.createMany({
                        data: ans.selected_option_ids.map((oid) => ({
                            student_answer_id: studentAnswer.student_answer_id,
                            option_id: oid,
                        })),
                    });
                }
            }
        });

        syncedCount++;
    }

    // Mark quiz as no longer live in Postgres
    await prisma.quiz.update({
        where: { quiz_id },
        data: { is_live: false, is_result_out: true },
    });

    // Notify connected students via WebSocket (through Redis pub/sub)
    await redis.publish(
        RedisKeys.quizEndedChannel(quiz_id),
        JSON.stringify({ quiz_id, attempts: attemptMap })
    );

    // Clean up Redis keys for this quiz
    const keysToDelete = [
        RedisKeys.quizMeta(quiz_id),
        RedisKeys.leaderboard(quiz_id),
        RedisKeys.studentNames(quiz_id),
    ];
    for (const memberStr of members) {
        const studentId = parseInt(memberStr, 10);
        keysToDelete.push(RedisKeys.attemptAnswers(quiz_id, studentId));
        keysToDelete.push(RedisKeys.attemptPoints(quiz_id, studentId));
    }
    if (keysToDelete.length) {
        await redis.del(...keysToDelete);
    }

    return NextResponse.json({ success: true, students_synced: syncedCount }, { status: 200 });
}
