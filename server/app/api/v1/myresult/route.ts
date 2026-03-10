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
    const attemptIdParam = searchParams.get("attempt_id");

    if (!attemptIdParam) {
        return NextResponse.json({ error: "attempt_id is required" }, { status: 400 });
    }

    const attemptId = parseInt(attemptIdParam, 10);
    if (isNaN(attemptId)) {
        return NextResponse.json({ error: "attempt_id must be a number" }, { status: 400 });
    }

    const attempt = await prisma.quiz_Attempt.findUnique({
        where: { attempt_id: attemptId },
        include: {
            quiz: {
                select: { quiz_id: true, title: true, class_id: true },
            },
            answers: {
                include: {
                    question: {
                        select: {
                            question_id: true,
                            text: true,
                            question_type: true,
                            correct_points: true,
                            negative_points: true,
                            correct_integer_answer: true,
                            options: {
                                select: { option_id: true, text: true, is_correct: true },
                            },
                        },
                    },
                    selected_option: {
                        select: { option_id: true, text: true, is_correct: true },
                    },
                    mcq_selected_options: {
                        include: {
                            option: { select: { option_id: true, text: true, is_correct: true } },
                        },
                    },
                },
            },
        },
    });

    if (!attempt) {
        return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    if (attempt.student_id !== session.student_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!attempt.is_complete) {
        return NextResponse.json({ error: "Quiz not yet submitted" }, { status: 400 });
    }

    return NextResponse.json(attempt, { status: 200 });
}
