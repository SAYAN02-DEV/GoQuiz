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

    // Verify the attempt belongs to this student
    const attempt = await prisma.quiz_Attempt.findUnique({ where: { attempt_id: attemptId } });
    if (!attempt) {
        return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    if (attempt.student_id !== studentId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (attempt.is_complete) {
        return NextResponse.json({ error: "Attempt already submitted" }, { status: 409 });
    }

    await prisma.quiz_Attempt.update({
        where: { attempt_id: attemptId },
        data: { is_complete: true },
    });
    const totalPoints = await pastEvaluate(attemptId);
    return NextResponse.json({ totalPoints: totalPoints }, { status: 200 });
}