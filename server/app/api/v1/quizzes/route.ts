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
    const classIdParam = searchParams.get("class_id");

    if (!classIdParam) {
        return NextResponse.json({ error: "class_id is required" }, { status: 400 });
    }

    const classId = parseInt(classIdParam, 10);
    if (isNaN(classId)) {
        return NextResponse.json({ error: "class_id must be a number" }, { status: 400 });
    }

    // Verify the student is enrolled in this class
    const enrollment = await prisma.class_Admission.findFirst({
        where: { student_id: session.student_id, class_id: classId },
    });
    if (!enrollment) {
        return NextResponse.json({ error: "You are not enrolled in this class" }, { status: 403 });
    }

    const quizzes = await prisma.quiz.findMany({
        where: { class_id: classId, is_live: false },
        select: {
            quiz_id: true,
            title: true,
            due_date: true,
            is_result_out: true,
            _count: { select: { questions: true } },
        },
        orderBy: { due_date: "desc" },
    });

    // Include the student's attempt status for each quiz
    const studentAttempts = await prisma.quiz_Attempt.findMany({
        where: {
            student_id: session.student_id,
            quiz: { class_id: classId },
            is_Live: false,
        },
        select: { quiz_id: true, attempt_id: true, is_complete: true, points: true },
    });

    const attemptMap = new Map(studentAttempts.map((a) => [a.quiz_id, a]));

    const result = quizzes.map((q) => ({
        quiz_id: q.quiz_id,
        title: q.title,
        due_date: q.due_date,
        is_result_out: q.is_result_out,
        question_count: q._count.questions,
        attempt: attemptMap.get(q.quiz_id) ?? null,
    }));

    return NextResponse.json({ class_id: classId, quizzes: result }, { status: 200 });
}
