import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getEducatorSession } from "@/app/lib/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const JSON_SCHEMA_DESCRIPTION = `
Return a JSON array (no markdown fences, raw JSON only) of question objects.
Each object has these exact fields:
{
  "question_type": 1 | 2 | 3,   // 1=Single Choice, 2=Multiple Choice, 3=Integer
  "text": string,                 // the question text
  "correct_points": number,       // points awarded for correct answer (default 4)
  "negative_points": number,      // points deducted for wrong answer (default 1)
  "correct_integer_answer": number | null,  // null unless question_type === 3
  "options": [                    // empty array if question_type === 3
    { "text": string, "is_correct": boolean }
  ]
}
Rules:
- For question_type 1 (SCQ): exactly one option must have is_correct=true.
- For question_type 2 (MCQ): one or more options must have is_correct=true.
- For question_type 3 (Integer): options must be [] and correct_integer_answer must be set.
- Each SCQ/MCQ question must have between 2 and 6 options.
- Do NOT include any explanation, markdown, or text outside the JSON array.
`;

function buildPromptInstruction(prompt: string, count: number): string {
    return `Generate exactly ${count} quiz questions on the following topic/instructions:\n"${prompt}"\n\n${JSON_SCHEMA_DESCRIPTION}`;
}

function buildImageInstruction(): string {
    return `Extract all quiz/exam questions from this image and convert them into structured question objects.\n\n${JSON_SCHEMA_DESCRIPTION}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAIResponse(text: string): any[] {
    // Strip markdown code fences if the model added them anyway
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error("Expected a JSON array");
    return parsed;
}

export async function POST(request: NextRequest) {
    const session = await getEducatorSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
        mode: "prompt" | "image";
        prompt?: string;
        count?: number;
        imageBase64?: string;
        mimeType?: string;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { mode } = body;

    if (mode !== "prompt" && mode !== "image") {
        return NextResponse.json({ error: "mode must be 'prompt' or 'image'" }, { status: 400 });
    }

    try {
        let responseText: string;

        if (mode === "prompt") {
            const { prompt, count } = body;
            if (!prompt?.trim()) {
                return NextResponse.json({ error: "prompt is required" }, { status: 400 });
            }
            const numQuestions = Math.min(Math.max(Number(count) || 5, 1), 30);

            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ text: buildPromptInstruction(prompt.trim(), numQuestions) }],
            });
            responseText = result.text ?? "";
        } else {
            // image mode
            const { imageBase64, mimeType } = body;
            if (!imageBase64) {
                return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
            }
            const safeMime = (mimeType ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";

            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [
                    {
                        inlineData: {
                            mimeType: safeMime,
                            data: imageBase64,
                        },
                    },
                    { text: buildImageInstruction() },
                ],
            });
            responseText = result.text ?? "";
        }

        const questions = parseAIResponse(responseText);
        return NextResponse.json({ questions }, { status: 200 });
    } catch (err: unknown) {
        console.error("[ai-generate] error:", err instanceof Error ? err.message : err);

        // Surface friendly rate-limit / quota messages without leaking raw internals
        let userMessage = "AI generation failed. Please try again.";
        try {
            const raw = err instanceof Error ? err.message : String(err);
            const parsed = JSON.parse(raw);
            const apiErr = parsed?.error;
            if (apiErr?.status === "RESOURCE_EXHAUSTED") {
                const retryMatch = apiErr.message?.match(/(\d+(?:\.\d+)?)s/);
                const retrySec = retryMatch ? Math.ceil(Number(retryMatch[1])) : null;
                userMessage = retrySec
                    ? `Gemini API rate limit hit. Please retry in ${retrySec} seconds.`
                    : "Gemini API rate limit hit. Please wait a moment and try again.";
            } else if (apiErr?.message) {
                userMessage = apiErr.message.split("\n")[0];
            }
        } catch { /* not JSON — keep default message */ }

        return NextResponse.json({ error: userMessage }, { status: 429 });
    }
}
