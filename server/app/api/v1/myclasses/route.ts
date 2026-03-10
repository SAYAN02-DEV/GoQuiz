import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getStudentSession } from "@/app/lib/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function GET() {
    const session = await getStudentSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admissions = await prisma.class_Admission.findMany({
        where: { student_id: session.student_id },
        include: {
            class: {
                select: { class_id: true, name: true },
            },
        },
    });

    const classes = admissions.map((a) => ({
        class_id: a.class.class_id,
        name: a.class.name,
    }));

    return NextResponse.json({ classes }, { status: 200 });
}
