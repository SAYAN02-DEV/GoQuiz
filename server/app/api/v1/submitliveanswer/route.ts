import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/app/lib/auth";
import { redis, RedisKeys, QuizMeta, AnswerQueueItem } from "@/app/lib/redis";

export async function POST(request: NextRequest) {
    const session = await getStudentSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
        quiz_id: number;
        question_id: number;
        option_id?: number;
        selected_option_ids?: number[];
        integer_answer?: number;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { quiz_id, question_id, option_id, selected_option_ids, integer_answer } = body;

    if (!quiz_id || !question_id) {
        return NextResponse.json({ error: "quiz_id and question_id are required" }, { status: 400 });
    }

    // ── 1. Load quiz meta from Redis ──────────────────────────────────────────
    // The student must have called GET /takelivequiz first; if the key is missing
    // the quiz is not live or the TTL expired.
    const metaRaw = await redis.get(RedisKeys.quizMeta(quiz_id));
    if (!metaRaw) {
        return NextResponse.json(
            { error: "Live session not found. Call GET /takelivequiz first." },
            { status: 404 }
        );
    }
    const quizMeta = JSON.parse(metaRaw) as QuizMeta;

    const question = quizMeta.questions.find((q) => q.question_id === question_id);
    if (!question) {
        return NextResponse.json({ error: "Question not found in this quiz" }, { status: 404 });
    }

    const studentId = session.student_id;

    // ── 2. Idempotency: reject re-submission for the same question ────────────
    const answersKey = RedisKeys.attemptAnswers(quiz_id, studentId);
    const alreadyAnswered = await redis.hexists(answersKey, String(question_id));
    if (alreadyAnswered) {
        return NextResponse.json(
            { error: "You have already answered this question" },
            { status: 409 }
        );
    }

    // ── 3. Evaluate the answer inline ─────────────────────────────────────────
    let pointsEarned = 0;

    if (question.question_type === 1) {
        // SCQ
        if (option_id == null) {
            return NextResponse.json({ error: "option_id is required for SCQ" }, { status: 400 });
        }
        const chosen = question.options.find((o) => o.option_id === option_id);
        if (!chosen) {
            return NextResponse.json({ error: "option_id not valid for this question" }, { status: 400 });
        }
        if (chosen.is_correct) {
            pointsEarned = question.correct_points;
        } else {
            pointsEarned = -question.negative_points;
        }
    } else if (question.question_type === 2) {
        // MCQ
        if (!selected_option_ids || selected_option_ids.length === 0) {
            return NextResponse.json(
                { error: "selected_option_ids is required for MCQ" },
                { status: 400 }
            );
        }
        const correctIds = question.options
            .filter((o) => o.is_correct)
            .map((o) => o.option_id);
        const allCorrect = correctIds.every((id) => selected_option_ids.includes(id));
        const noneWrong = selected_option_ids.every((id) => correctIds.includes(id));
        if (allCorrect && noneWrong) {
            pointsEarned = question.correct_points;
        } else if (selected_option_ids.length > 0) {
            pointsEarned = -question.negative_points;
        }
    } else if (question.question_type === 3) {
        // Integer
        if (integer_answer == null) {
            return NextResponse.json(
                { error: "integer_answer is required for Integer type" },
                { status: 400 }
            );
        }
        if (integer_answer === question.correct_integer_answer) {
            pointsEarned = question.correct_points;
        } else {
            pointsEarned = -question.negative_points;
        }
    } else {
        return NextResponse.json({ error: "Unknown question type" }, { status: 400 });
    }

    // ── 4. Persist answer + update running points in Redis ────────────────────
    const answerPayload = JSON.stringify({
        question_type: question.question_type,
        option_id: option_id ?? null,
        selected_option_ids: selected_option_ids ?? [],
        integer_answer: integer_answer ?? null,
        points_earned: pointsEarned,
    });

    const TTL = await redis.ttl(RedisKeys.quizMeta(quiz_id));
    const safeTTL = TTL > 0 ? TTL : 6 * 60 * 60;

    // HSET answer, INCRBY points — done atomically via a pipeline
    await redis
        .pipeline()
        .hset(answersKey, String(question_id), answerPayload)
        .expire(answersKey, safeTTL)
        .incrby(RedisKeys.attemptPoints(quiz_id, studentId), pointsEarned)
        .expire(RedisKeys.attemptPoints(quiz_id, studentId), safeTTL)
        .exec();

    // ── 5. Push job onto the answer queue for the worker ─────────────────────
    const job: AnswerQueueItem = {
        quiz_id,
        student_id: studentId,
        question_id,
        question_type: question.question_type,
        option_id: option_id ?? null,
        selected_option_ids: selected_option_ids ?? [],
        integer_answer: integer_answer ?? null,
        points_earned: pointsEarned,
    };
    await redis.rpush(RedisKeys.answerQueue(), JSON.stringify(job));

    return NextResponse.json(
        {
            success: true,
            points_earned: pointsEarned,
        },
        { status: 200 }
    );
}
