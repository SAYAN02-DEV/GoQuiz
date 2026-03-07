import { cookies } from "next/headers";

export async function getEducatorSession(){
    const token = (await cookies()).get("session")?.value;
    if(!token){
        return null;
    }
    const [headerB64, bodyB64, sigB64] = token.split(".");
    if(!headerB64 || !bodyB64 || !sigB64){
        return null;
    }
    const secret = process.env.JWT_SECRET;
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        Buffer.from(sigB64, "base64url"),
        new TextEncoder().encode(`${headerB64}.${bodyB64}`)
    );
    if(!valid){
        return null;
    }
    const payload = JSON.parse(Buffer.from(bodyB64, "base64url").toString());
    if(payload.exp<Math.floor(Date.now()/1000)){
        return null;
    }
    return payload as { educater_id: number, email: string};
}