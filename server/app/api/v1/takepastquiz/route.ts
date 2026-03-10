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

    const quiz = await prisma.quiz.findUnique({
        where: { quiz_id: quizId },
        include: {
            questions: { include: { options: true } },
        },
    });

    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    if (quiz.is_live) {
        return NextResponse.json({ error: "This is a live quiz. Use the live quiz endpoint." }, { status: 400 });
    }

    // Verify the student is enrolled in the class
    const enrollment = await prisma.class_Admission.findFirst({
        where: { student_id: session.student_id, class_id: quiz.class_id },
    });
    if (!enrollment) {
        return NextResponse.json({ error: "You are not enrolled in this class" }, { status: 403 });
    }

    // Return existing incomplete attempt if one already exists (prevent duplicates)
    const existing = await prisma.quiz_Attempt.findFirst({
        where: { student_id: session.student_id, quiz_id: quizId, is_complete: false },
    });
    if (existing) {
        return NextResponse.json({ quiz, attempt_id: existing.attempt_id }, { status: 200 });
    }

    const attempt = await prisma.quiz_Attempt.create({
        data: {
            student_id: session.student_id,
            quiz_id: quizId,
            points: 0,
            is_Live: false,
            attempt_date: new Date(),
            is_complete: false,
        },
    });

    return NextResponse.json({ quiz, attempt_id: attempt.attempt_id }, { status: 200 });
}