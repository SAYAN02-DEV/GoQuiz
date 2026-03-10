import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getStudentSession } from "@/app/lib/auth";
import { SubmitAnswerRequest } from "@/app/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: NextRequest) {
    const session = await getStudentSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: SubmitAnswerRequest;
    try {
        body = await request.json() as SubmitAnswerRequest;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { attempt_id, question_id, option_id, selected_option_ids, integer_answer } = body;

    if (!attempt_id || !question_id) {
        return NextResponse.json({ error: "attempt_id and question_id are required" }, { status: 400 });
    }

    // Verify the attempt belongs to this student and is still open
    const attempt = await prisma.quiz_Attempt.findUnique({ where: { attempt_id } });
    if (!attempt) {
        return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    if (attempt.student_id !== session.student_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (attempt.is_complete) {
        return NextResponse.json({ error: "This attempt is already submitted" }, { status: 409 });
    }

    // Verify the question belongs to the same quiz
    const question = await prisma.question.findUnique({ where: { question_id } });
    if (!question || question.quiz_id !== attempt.quiz_id) {
        return NextResponse.json({ error: "Question not found in this quiz" }, { status: 404 });
    }

    // Upsert: delete existing answer for this question, then recreate
    await prisma.$transaction(async (tx) => {
        const existing = await tx.student_Answer.findFirst({
            where: { attempt_id, question_id },
        });

        if (existing) {
            await tx.student_Answer_Option.deleteMany({
                where: { student_answer_id: existing.student_answer_id },
            });
            await tx.student_Answer.delete({
                where: { student_answer_id: existing.student_answer_id },
            });
        }

        const newAnswer = await tx.student_Answer.create({
            data: {
                attempt_id,
                question_id,
                option_id: option_id ?? null,
                integer_answer: integer_answer ?? null,
            },
        });

        if (selected_option_ids && selected_option_ids.length > 0) {
            await tx.student_Answer_Option.createMany({
                data: selected_option_ids.map((oid) => ({
                    student_answer_id: newAnswer.student_answer_id,
                    option_id: oid,
                })),
            });
        }
    });

    return NextResponse.json({ success: true }, { status: 200 });
}
