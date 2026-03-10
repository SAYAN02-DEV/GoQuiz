import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/app/lib/auth";
import { redis, RedisKeys } from "@/app/lib/redis";

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

    const lbKey = RedisKeys.leaderboard(quizId);
    const namesKey = RedisKeys.studentNames(quizId);

    let raw: string[];
    try {
        // ZREVRANGE with scores: top 100 entries, highest score first
        raw = await redis.zrevrange(lbKey, 0, 99, "WITHSCORES");
    } catch {
        return NextResponse.json({ error: "Live leaderboard unavailable (Redis offline)" }, { status: 503 });
    }

    if (!raw.length) {
        return NextResponse.json({ leaderboard: [] }, { status: 200 });
    }

    // raw = [member, score, member, score, ...]
    const studentIds: string[] = [];
    for (let i = 0; i < raw.length; i += 2) {
        studentIds.push(raw[i]);
    }

    const names = studentIds.length
        ? await redis.hmget(namesKey, ...studentIds)
        : [];

    const leaderboard = studentIds.map((id, idx) => ({
        rank: idx + 1,
        student_id: parseInt(id, 10),
        name: names[idx] ?? `Student ${id}`,
        points: parseInt(raw[idx * 2 + 1], 10),
    }));

    return NextResponse.json({ leaderboard }, { status: 200 });
}
