import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEducatorSession } from "@/app/lib/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function GET() {
    const session = await getEducatorSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classes = await prisma.class.findMany({
        where: { creater_id: session.educator_id },
        include: {
            quizes: {
                select: {
                    quiz_id: true,
                    title: true,
                    is_live: true,
                    is_result_out: true,
                    due_date: true,
                },
                orderBy: { quiz_id: "desc" },
            },
            students: { select: { student_id: true } },
        },
        orderBy: { class_id: "desc" },
    });

    const result = classes.map((c) => ({
        class_id: c.class_id,
        name: c.name,
        secret_key: c.secret_key,
        student_count: c.students.length,
        quizzes: c.quizes,
    }));

    return NextResponse.json({ classes: result }, { status: 200 });
}
