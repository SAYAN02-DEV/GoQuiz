import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
    const encode = (obj: object) =>
        Buffer.from(JSON.stringify(obj)).toString("base64url");

    const header = encode({ alg: "HS256", typ: "JWT" });
    const body = encode(payload);
    const data = `${header}.${body}`;

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    return `${data}.${Buffer.from(sig).toString("base64url")}`;
}

export async function POST(request: NextRequest) {
    let id_token: string | undefined;
    try {
        const body = await request.json();
        id_token = body?.id_token;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!id_token) {
        return NextResponse.json({ error: "id_token is required" }, { status: 400 });
    }

    const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`
    );
    if (!googleRes.ok) {
        return NextResponse.json({ error: "Invalid or expired Google token" }, { status: 401 });
    }

    const googleData = await googleRes.json();

    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (CLIENT_ID && googleData.aud !== CLIENT_ID) {
        return NextResponse.json({ error: "Token audience mismatch" }, { status: 401 });
    }

    const email: string = googleData.email;
    const name: string = googleData.name ?? "";

    if (!email) {
        return NextResponse.json({ error: "Google token missing email" }, { status: 400 });
    }

    let student = await prisma.student.findFirst({ where: { email } });
    if (!student) {
        student = await prisma.student.create({
            data: {
                name,
                email,
                phone: "",
            },
        });
    }

    const JWT_SECRET = process.env.JWT_SECRET ?? "change-this-secret-in-production";
    const token = await signJWT(
        {
            student_id: student.student_id,
            email: student.email,
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        },
        JWT_SECRET
    );

    const response = NextResponse.json({
        student_id: student.student_id,
        name: student.name,
        email: student.email,
    });

    response.cookies.set("student_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
    });

    return response;
}
