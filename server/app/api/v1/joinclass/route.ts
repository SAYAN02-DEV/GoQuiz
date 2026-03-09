import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getStudentSession } from "@/app/lib/auth";
import { JoinClass } from "@/app/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: NextRequest) {
    const session = await getStudentSession();
    if(!session){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        )
    }
    const {classId, secretKey} = await request.json() as JoinClass;
    if(!secretKey){
        return NextResponse.json(
            {error: "secret key is required"},
            {status: 400}
        )
    }
    const classInfo = await prisma.class.findFirst({where: {class_id:classId}});
    if(!classInfo){
        return NextResponse.json(
            {error: "class not found"},
            {status: 404}
        )
    }
    const existing = await prisma.class_Admission.findFirst({
        where: {student_id: session.student_id, class_id: classId}
    });
    if(existing){
        return NextResponse.json(
            {error: "Already joined this class"},
            {status: 409}
        )
    }
    else if(classInfo.secret_key === secretKey){
        const newAdmission = await prisma.class_Admission.create({
            data:{
                student_id: session.student_id,
                class_id: classId
            }
        });
        return NextResponse.json(
            {classAdmissionId: newAdmission.admission_id},
            {status: 201}
        )
    } else {
        return NextResponse.json(
            {error: "Invalid secret key"},
            {status: 403}
        )
    }
}