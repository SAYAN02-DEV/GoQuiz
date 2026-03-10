import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEducatorSession } from "@/app/lib/auth";
import { CreateQuestionsRequest } from "@/app/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function GET(request: NextRequest) {
    const session = await getEducatorSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizId = Number(request.nextUrl.searchParams.get("quiz_id"));
    if (!quizId) {
        return NextResponse.json({ error: "quiz_id is required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
        where: { quiz_id: quizId },
        include: { class: true },
    });

    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    if (quiz.class.creater_id !== session.educator_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const questions = await prisma.question.findMany({
        where: { quiz_id: quizId },
        include: { options: true },
        orderBy: { question_id: "asc" },
    });

    return NextResponse.json({ quiz_id: quizId, questions });
}

export async function PUT(request: NextRequest) {
    const session = await getEducatorSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: CreateQuestionsRequest;
    try {
        body = await request.json() as CreateQuestionsRequest;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { quiz_id, questions } = body;

    if (!quiz_id || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: "quiz_id and a non-empty questions array are required" }, { status: 400 });
    }

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

    const attemptCount = await prisma.quiz_Attempt.count({ where: { quiz_id } });
    if (attemptCount > 0) {
        return NextResponse.json(
            { error: "Cannot edit questions after students have already attempted this quiz." },
            { status: 409 }
        );
    }

    // Delete all existing questions (cascades to options via DB foreign keys)
    await prisma.question.deleteMany({ where: { quiz_id } });

    const created = await prisma.$transaction(
        questions.map((q) =>
            prisma.question.create({
                data: {
                    quiz_id,
                    text: q.text,
                    image_link: q.image_link ?? "null",
                    question_type: q.question_type,
                    correct_points: q.correct_points,
                    negative_points: q.negative_points,
                    correct_integer_answer: q.correct_integer_answer ?? null,
                    options: {
                        create: (q.options ?? []).map((opt) => ({
                            text: opt.text,
                            image_link: opt.image_link ?? "null",
                            is_correct: opt.is_correct,
                        })),
                    },
                },
                include: { options: true },
            })
        )
    );

    return NextResponse.json({ quiz_id, questions_updated: created.length });
}

export async function POST(request: NextRequest) {
    const session = await getEducatorSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: CreateQuestionsRequest;
    try {
        body = await request.json() as CreateQuestionsRequest;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { quiz_id, questions } = body;

    if (!quiz_id || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: "quiz_id and a non-empty questions array are required" }, { status: 400 });
    }
    
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

    const createdQuestions = await prisma.$transaction(
        questions.map((q) =>
            prisma.question.create({
                data: {
                    quiz_id,
                    text: q.text,
                    image_link: q.image_link ?? "null",
                    question_type: q.question_type,
                    correct_points: q.correct_points,
                    negative_points: q.negative_points,
                    correct_integer_answer: q.correct_integer_answer ?? null,
                    options: {
                        create: (q.options ?? []).map((opt) => ({
                            text: opt.text,
                            image_link: opt.image_link ?? "null",
                            is_correct: opt.is_correct,
                        })),
                    },
                },
                include: { options: true },
            })
        )
    );

    return NextResponse.json(
        { quiz_id, questions_created: createdQuestions.length, questions: createdQuestions },
        { status: 201 }
    );
}
