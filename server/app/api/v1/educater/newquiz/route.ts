import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEducatorSession } from "@/app/lib/auth";
import { CreateQuizRequest } from "@/app/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: NextRequest){
    const session = await getEducatorSession();
    if(!session){
        return NextResponse.json({
            error: "Unauthorized"
        },{
            status:401
        });
    }
    const {quizName, classId, dueDate, isLive, isResultOut} = await request.json() as CreateQuizRequest;
    const newQuiz = await prisma.quiz.create({
        data:{
            class_id: classId,
            title: quizName,
            is_live: isLive,
            due_date: dueDate,
            is_result_out: isResultOut
        }
    });
    return NextResponse.json({
        quiz_id: newQuiz.quiz_id
    },{status: 200})
}