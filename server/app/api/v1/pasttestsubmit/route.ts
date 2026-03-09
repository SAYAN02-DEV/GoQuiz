import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getStudentSession } from "@/app/lib/auth";
import { pastEvaluate } from "@/app/lib/evaluatepast";
import { PastTestSubmit } from "@/app/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: NextRequest){
    const session = await getStudentSession();
    if(!session){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        )
    }
    const studentId = session.student_id;
    const {attemptId} = await request.json() as PastTestSubmit;
    const submit = await prisma.quiz_Attempt.update({
        where: {
            attempt_id: attemptId,
        },
        data: {
            is_complete: true,
        }
    });
    const totalPoints = await pastEvaluate(attemptId);
    NextResponse.json({totalPoints: totalPoints},{status:200});
}