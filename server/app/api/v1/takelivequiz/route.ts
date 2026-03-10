import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getStudentSession } from "@/app/lib/auth";
import { redis, RedisKeys, QuizMeta } from "@/app/lib/redis";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// TTL for cached quiz meta: 6 hours (quiz shouldn't run longer than that)
const QUIZ_META_TTL_SECONDS = 6 * 60 * 60;

export async function GET(request: NextRequest) {
    const session = await getStudentSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const quizIdParam = searchParams.get("quiz_id");

    if (!quizIdParam) {
        return NextResponse.json({ error: "quiz_id is required" }, { status: 400 });
    }
    const quizId = parseInt(quizIdParam, 10);
    if (isNaN(quizId)) {
        return NextResponse.json({ error: "quiz_id must be a number" }, { status: 400 });
    }

    // ── 1. Resolve quiz meta (Redis-first, Postgres fallback) ─────────────────
    const metaKey = RedisKeys.quizMeta(quizId);
    let quizMeta: QuizMeta | null = null;

    const cached = await redis.get(metaKey);
    if (cached) {
        console.log(`[takelivequiz] quiz ${quizId}: meta loaded from REDIS`);
        quizMeta = JSON.parse(cached) as QuizMeta;
    } else {
        console.log(`[takelivequiz] quiz ${quizId}: Redis miss — loading from POSTGRES`);
        // Cache miss: load from Postgres and populate Redis
        const quiz = await prisma.quiz.findUnique({
            where: { quiz_id: quizId },
            include: {
                questions: {
                    include: { options: true },
                },
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }
        if (!quiz.is_live) {
            return NextResponse.json(
                { error: "This is not a live quiz. Use the past quiz endpoint." },
                { status: 400 }
            );
        }

        quizMeta = {
            quiz_id: quiz.quiz_id,
            title: quiz.title,
            questions: quiz.questions.map((q) => ({
                question_id: q.question_id,
                question_type: q.question_type,
                correct_points: q.correct_points,
                negative_points: q.negative_points,
                correct_integer_answer: q.correct_integer_answer ?? null,
                options: q.options.map((o) => ({
                    option_id: o.option_id,
                    is_correct: o.is_correct,
                })),
            })),
        };

        await redis.set(metaKey, JSON.stringify(quizMeta), "EX", QUIZ_META_TTL_SECONDS);
    }

    // ── 2. Authorisation: student must be enrolled ────────────────────────────
    // We need the class_id; load from Postgres only if we hit the cache (quiz not loaded yet)
    let classId: number;
    if (cached) {
        // We only have metaKey cached, not the class_id — fetch lightweight
        const row = await prisma.quiz.findUnique({
            where: { quiz_id: quizId },
            select: { class_id: true, is_live: true },
        });
        if (!row) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }
        if (!row.is_live) {
            return NextResponse.json(
                { error: "This is not a live quiz. Use the past quiz endpoint." },
                { status: 400 }
            );
        }
        classId = row.class_id;
    } else {
        // quiz was loaded above from Postgres — re-read class_id from quizMeta is not possible,
        // but we have it via closure from the Prisma query (TypeScript narrowing won't help here,
        // so we do a cheap select — it's one indexed PK lookup)
        const row = await prisma.quiz.findUnique({
            where: { quiz_id: quizId },
            select: { class_id: true },
        });
        classId = row!.class_id;
    }

    const enrollment = await prisma.class_Admission.findFirst({
        where: { student_id: session.student_id, class_id: classId },
    });
    if (!enrollment) {
        return NextResponse.json({ error: "You are not enrolled in this class" }, { status: 403 });
    }

    // ── 3. Register student in the live session (idempotent) ─────────────────
    const studentId = session.student_id;
    const namesKey = RedisKeys.studentNames(quizId);
    const lbKey = RedisKeys.leaderboard(quizId);
    const pointsKey = RedisKeys.attemptPoints(quizId, studentId);

    // Fetch student name (needed for leaderboard display)
    const studentRow = await prisma.student.findUnique({
        where: { student_id: studentId },
        select: { name: true },
    });
    const studentName = studentRow?.name ?? `Student ${studentId}`;

    // HSETNX so it's idempotent — won't overwrite if already set
    await redis.hsetnx(namesKey, String(studentId), studentName);
    await redis.expire(namesKey, QUIZ_META_TTL_SECONDS);

    // Add with score 0 only if not already in the leaderboard
    const existingScore = await redis.zscore(lbKey, String(studentId));
    if (existingScore === null) {
        await redis.zadd(lbKey, 0, String(studentId));
        await redis.expire(lbKey, QUIZ_META_TTL_SECONDS);
    }

    // Initialise points counter if not already set
    await redis.setnx(pointsKey, "0");
    await redis.expire(pointsKey, QUIZ_META_TTL_SECONDS);

    // ── 4. Build client-safe quiz payload (strip answer data) ─────────────────
    // Reload full question text/options from Postgres for the response.
    // (Redis only stores evaluation metadata, not display text.)
    const quizDisplay = await prisma.quiz.findUnique({
        where: { quiz_id: quizId },
        include: {
            questions: {
                include: {
                    options: {
                        select: {
                            option_id: true,
                            text: true,
                            image_link: true,
                            // is_correct intentionally omitted
                        },
                    },
                },
            },
        },
    });

    return NextResponse.json(
        {
            student_id: studentId,
            quiz: {
                quiz_id: quizDisplay!.quiz_id,
                title: quizDisplay!.title,
                questions: quizDisplay!.questions.map((q) => ({
                    question_id: q.question_id,
                    text: q.text,
                    image_link: q.image_link,
                    question_type: q.question_type,
                    correct_points: q.correct_points,
                    negative_points: q.negative_points,
                    options: q.options,
                })),
            },
        },
        { status: 200 }
    );
}
