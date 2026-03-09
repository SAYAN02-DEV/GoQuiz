import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getStudentSession } from "@/app/lib/auth";
import { PastQuiz } from "@/app/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });


export async function GET(request: NextRequest){
    const session = await getStudentSession();
    if(!session){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        )
    }
    const studentId = session.student_id;
    const {quizId} = await request.json() as PastQuiz;
    const quiz = await prisma.quiz.findUnique({
        where: {quiz_id: quizId},
        include: {
            questions:{
                include:{
                    options: true
                }
            }
        }
    });
    const attempt = await prisma.quiz_Attempt.create({
        data:{
            student_id: studentId,
            quiz_id: quizId,
            points: 0,
            is_Live: false,
            attempt_date: new Date(),
            is_complete: false,
        }
    });
    return NextResponse.json(
        {
            quiz: quiz,
            attempt_id: attempt.attempt_id,
        },
        {status: 200}
    )
}