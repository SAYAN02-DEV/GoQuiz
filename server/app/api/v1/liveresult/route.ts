import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getStudentSession } from "@/app/lib/auth";
import { redis, RedisKeys } from "@/app/lib/redis";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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

    const studentId = session.student_id;

    // Read current points from Redis
    const pointsStr = await redis.get(RedisKeys.attemptPoints(quizId, studentId));
    const points = pointsStr ? parseInt(pointsStr, 10) : 0;

    // Check if the educator has ended the quiz and a DB attempt exists
    const attempt = await prisma.quiz_Attempt.findFirst({
        where: { student_id: studentId, quiz_id: quizId, is_Live: true },
        select: { attempt_id: true },
        orderBy: { attempt_date: "desc" },
    });

    return NextResponse.json({
        points,
        attempt_id: attempt?.attempt_id ?? null,
    });
}
