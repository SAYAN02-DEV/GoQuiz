import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEducatorSession } from "@/app/lib/auth";
import { CreateClassRequest } from "@/app/types";

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
    const {className, secretKey} = await request.json() as CreateClassRequest;
    if(!secretKey){
        return NextResponse.json(
            {error: "Secret key is required"},
            {status: 400}
        )
    }
    const newClass = await prisma.class.create({
        data:{
            name: className,
            creater_id: session.educator_id,
            secret_key:secretKey,
        }
    });
    return NextResponse.json(
        {class_id: newClass.class_id},
        {status: 200}
    );

}