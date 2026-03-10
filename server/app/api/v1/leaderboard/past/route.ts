import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getStudentSession } from "@/app/lib/auth";

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

    const quiz = await prisma.quiz.findUnique({ where: { quiz_id: quizId } });
    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (!quiz.is_result_out) {
        return NextResponse.json({ error: "Results are not published yet" }, { status: 403 });
    }

    const attempts = await prisma.quiz_Attempt.findMany({
        where: {
            quiz_id: quizId,
            is_complete: true,
            is_Live: false,
        },
        orderBy: {
            points: "desc",
        },
        include: {
            student: {
                select: {
                    student_id: true,
                    name: true,
                },
            },
        },
    });

    const leaderboard = attempts.map((attempt, index) => ({
        rank: index + 1,
        student_id: attempt.student.student_id,
        name: attempt.student.name,
        points: attempt.points,
        attempt_date: attempt.attempt_date,
    }));

    return NextResponse.json({ quiz_id: quizId, is_live: quiz.is_live, leaderboard }, { status: 200 });
}
