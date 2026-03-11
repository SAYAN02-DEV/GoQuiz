"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

type OptionDraft = { text: string; is_correct: boolean };
type QuestionDraft = {
    id: number;
    question_type: 1 | 2 | 3; // 1=SCQ 2=MCQ 3=Integer
    text: string;
    correct_points: number;
    negative_points: number;
    correct_integer_answer: number | null;
    options: OptionDraft[];
};

let nextId = 1;

function makeQuestion(): QuestionDraft {
    return {
        id: nextId++,
        question_type: 1,
        text: "",
        correct_points: 4,
        negative_points: 1,
        correct_integer_answer: null,
        options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
        ],
    };
}

export default function AddQuestionsPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = Number(params.quiz_id);

    const [questions, setQuestions] = useState<QuestionDraft[]>([makeQuestion()]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    // ── AI generation state ────────────────────────────────────────────────
    const [aiOpen, setAiOpen] = useState(false);
    const [aiTab, setAiTab] = useState<"prompt" | "image">("prompt");
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiCount, setAiCount] = useState(5);
    const [aiImage, setAiImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [aiMode, setAiMode] = useState<"append" | "replace">("append");
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function generateWithAI() {
        setAiError("");
        if (aiTab === "prompt" && !aiPrompt.trim()) { setAiError("Please enter a prompt."); return; }
        if (aiTab === "image" && !aiImage) { setAiError("Please select an image."); return; }
        setAiLoading(true);
        try {
            const body = aiTab === "prompt"
                ? { mode: "prompt", prompt: aiPrompt, count: aiCount }
                : { mode: "image", imageBase64: aiImage!.base64, mimeType: aiImage!.mimeType };

            const res = await fetch("/api/v1/educater/ai-generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setAiError(data.error ?? "Generation failed"); return; }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const generated: QuestionDraft[] = (data.questions as any[]).map((q: any) => ({
                id: nextId++,
                question_type: (q.question_type as 1 | 2 | 3) ?? 1,
                text: q.text ?? "",
                correct_points: q.correct_points ?? 4,
                negative_points: q.negative_points ?? 1,
                correct_integer_answer: q.correct_integer_answer ?? null,
                options: (q.options ?? []).map((o: any) => ({ text: o.text ?? "", is_correct: !!o.is_correct })),
            }));

            setQuestions(prev => aiMode === "replace" ? generated : [...prev, ...generated]);
            setAiOpen(false);
            setAiPrompt("");
            setAiImage(null);
        } catch (e: unknown) {
            setAiError(e instanceof Error ? e.message : "Unexpected error");
        } finally {
            setAiLoading(false);
        }
    }

    function handleImageFile(file: File | null) {
        if (!file) { setAiImage(null); return; }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(",")[1];
            setAiImage({ base64, mimeType: file.type || "image/jpeg", name: file.name });
        };
        reader.readAsDataURL(file);
    }

    useEffect(() => {
        async function loadExisting() {
            const res = await fetch(`/api/v1/educater/questions?quiz_id=${quizId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.questions && data.questions.length > 0) {
                    setIsEditMode(true);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setQuestions(data.questions.map((q: any) => ({
                        id: nextId++,
                        question_type: q.question_type as 1 | 2 | 3,
                        text: q.text,
                        correct_points: q.correct_points,
                        negative_points: q.negative_points,
                        correct_integer_answer: q.correct_integer_answer ?? null,
                        options: (q.options ?? []).map((o: any) => ({
                            text: o.text,
                            is_correct: o.is_correct,
                        })),
                    })));
                }
            }
            setLoading(false);
        }
        loadExisting();
    }, [quizId]);

    function updateQuestion(id: number, patch: Partial<QuestionDraft>) {
        setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));
    }

    function updateOption(qId: number, idx: number, patch: Partial<OptionDraft>) {
        setQuestions(qs => qs.map(q => {
            if (q.id !== qId) return q;
            const options = q.options.map((o, i) => i === idx ? { ...o, ...patch } : o);
            return { ...q, options };
        }));
    }

    function setSCQCorrect(qId: number, idx: number) {
        setQuestions(qs => qs.map(q => {
            if (q.id !== qId) return q;
            const options = q.options.map((o, i) => ({ ...o, is_correct: i === idx }));
            return { ...q, options };
        }));
    }

    function addOption(qId: number) {
        setQuestions(qs => qs.map(q => {
            if (q.id !== qId) return q;
            return { ...q, options: [...q.options, { text: "", is_correct: false }] };
        }));
    }

    function removeOption(qId: number, idx: number) {
        setQuestions(qs => qs.map(q => {
            if (q.id !== qId) return q;
            if (q.options.length <= 2) return q;
            return { ...q, options: q.options.filter((_, i) => i !== idx) };
        }));
    }

    function changeType(qId: number, type: 1 | 2 | 3) {
        setQuestions(qs => qs.map(q => {
            if (q.id !== qId) return q;
            return {
                ...q,
                question_type: type,
                correct_integer_answer: type === 3 ? 0 : null,
                options: type === 3 ? [] : (q.options.length === 0
                    ? [{ text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }]
                    : q.options.map(o => ({ ...o, is_correct: false }))),
            };
        }));
    }

    function removeQuestion(id: number) {
        setQuestions(qs => qs.length === 1 ? qs : qs.filter(q => q.id !== id));
    }

    function validate(): string | null {
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const n = i + 1;
            if (!q.text.trim()) return `Question ${n}: text is required.`;
            if (q.question_type === 3) {
                if (q.correct_integer_answer === null) return `Question ${n}: integer answer is required.`;
            } else {
                if (q.options.some(o => !o.text.trim())) return `Question ${n}: all option texts are required.`;
                if (!q.options.some(o => o.is_correct)) return `Question ${n}: mark at least one correct option.`;
            }
        }
        return null;
    }

    async function save() {
        const err = validate();
        if (err) { alert(err); return; }
        setSaving(true);
        const res = await fetch("/api/v1/educater/questions", {
            method: isEditMode ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quiz_id: quizId, questions }),
        });
        setSaving(false);
        if (res.ok) {
            router.push("/educater/dashboard");
        } else {
            const d = await res.json();
            alert(d.error ?? "Failed to save questions");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center">
                <p className="text-[#94a3b8] font-medium">Loading questions…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f3ef]">
            {/* Top Bar */}
            <div className="bg-white border-b border-[#f1ede8] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#f27f0d] flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    </div>
                    <span className="text-xl font-black text-[#f27f0d]">GoQuiz</span>
                    <span className="ml-2 text-sm font-semibold text-[#94a3b8]">{isEditMode ? "Edit Questions" : "Add Questions"} — Quiz #{quizId}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/educater/dashboard")}
                        className="h-9 px-4 rounded-xl border border-[#e2e8f0] text-[#64748b] text-sm font-bold hover:bg-[#f8fafc] transition cursor-pointer"
                    >
                        Skip for now
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition cursor-pointer disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                        {saving ? "Saving…" : `${isEditMode ? "Update" : "Save"} ${questions.length} Question${questions.length !== 1 ? "s" : ""}`}
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-5">

                {/* ── AI Generate Panel ─────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <button
                        onClick={() => setAiOpen(v => !v)}
                        className="w-full flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-[#fff9f4] transition group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f27f0d] to-[#f5a623] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>auto_awesome</span>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-black text-[#0f172a]">Generate with AI</p>
                            <p className="text-xs text-[#94a3b8] font-medium">From a text prompt or a photo of a question paper</p>
                        </div>
                        <span className={`material-symbols-outlined text-[#94a3b8] transition-transform ${aiOpen ? "rotate-180" : ""}`} style={{ fontSize: 20 }}>expand_more</span>
                    </button>

                    {aiOpen && (
                        <div className="border-t border-[#f1ede8] px-6 py-5 flex flex-col gap-4">
                            {/* Tab switcher */}
                            <div className="flex gap-2">
                                {(["prompt", "image"] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => { setAiTab(tab); setAiError(""); }}
                                        className={`flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-bold transition cursor-pointer ${aiTab === tab ? "bg-[#f27f0d] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                            {tab === "prompt" ? "edit_note" : "photo_camera"}
                                        </span>
                                        {tab === "prompt" ? "Text Prompt" : "Photo of Paper"}
                                    </button>
                                ))}
                            </div>

                            {/* Prompt tab */}
                            {aiTab === "prompt" && (
                                <div className="flex flex-col gap-3">
                                    <textarea
                                        rows={3}
                                        className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm font-medium text-[#0f172a] focus:outline-none focus:border-[#f27f0d] resize-none"
                                        placeholder="e.g. Make a quiz on C++ pointers and memory management, mix of MCQ and integer questions…"
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                    />
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs font-bold text-[#64748b] shrink-0">Number of questions:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={aiCount}
                                            onChange={e => setAiCount(Math.min(30, Math.max(1, Number(e.target.value))))}
                                            className="w-20 h-9 rounded-xl border border-[#e2e8f0] px-3 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#f27f0d]"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Image tab */}
                            {aiTab === "image" && (
                                <div className="flex flex-col gap-3">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0] ?? null); }}
                                        className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-[#e2e8f0] hover:border-[#f27f0d] cursor-pointer transition bg-[#fafaf9] hover:bg-[#fff9f4]"
                                    >
                                        {aiImage ? (
                                            <>
                                                <span className="material-symbols-outlined text-[#f27f0d]" style={{ fontSize: 28 }}>check_circle</span>
                                                <p className="text-xs font-bold text-[#0f172a]">{aiImage.name}</p>
                                                <p className="text-[10px] text-[#94a3b8]">Click to change</p>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[#94a3b8]" style={{ fontSize: 28 }}>upload_file</span>
                                                <p className="text-xs font-semibold text-[#64748b]">Click or drag &amp; drop a photo of the question paper</p>
                                                <p className="text-[10px] text-[#94a3b8]">JPG, PNG, WEBP supported</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={e => handleImageFile(e.target.files?.[0] ?? null)}
                                    />
                                </div>
                            )}

                            {/* Append/Replace toggle */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-[#64748b]">Add generated questions:</span>
                                <div className="flex gap-1">
                                    {(["append", "replace"] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setAiMode(m)}
                                            className={`h-7 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${aiMode === m ? "bg-[#0f172a] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}
                                        >
                                            {m === "append" ? "After existing" : "Replace all"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {aiError && <p className="text-xs font-bold text-red-500">{aiError}</p>}

                            <button
                                onClick={generateWithAI}
                                disabled={aiLoading}
                                className="self-start flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-[#f27f0d] to-[#f5a623] text-white text-sm font-bold cursor-pointer hover:opacity-90 transition disabled:opacity-50"
                            >
                                {aiLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                                        Generating…
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
                                        Generate Questions
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
                {/* ── end AI panel ─────────────────────────────────────────────── */}
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
                        {/* Question header */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#94a3b8] uppercase tracking-widest">Question {idx + 1}</span>
                            <button
                                onClick={() => removeQuestion(q.id)}
                                className="text-[#94a3b8] hover:text-[#ef4444] transition cursor-pointer"
                                title="Remove question"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                            </button>
                        </div>

                        {/* Type selector */}
                        <div className="flex gap-2">
                            {([1, 2, 3] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => changeType(q.id, t)}
                                    className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${q.question_type === t ? "bg-[#f27f0d] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}
                                >
                                    {t === 1 ? "Single Choice" : t === 2 ? "Multiple Choice" : "Integer"}
                                </button>
                            ))}
                        </div>

                        {/* Question text */}
                        <textarea
                            rows={2}
                            className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#f27f0d] resize-none"
                            placeholder="Enter question text…"
                            value={q.text}
                            onChange={e => updateQuestion(q.id, { text: e.target.value })}
                        />

                        {/* Points */}
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Correct Points</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="h-10 rounded-xl border border-[#e2e8f0] px-3 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#f27f0d]"
                                    value={q.correct_points}
                                    onChange={e => updateQuestion(q.id, { correct_points: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Negative Points</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="h-10 rounded-xl border border-[#e2e8f0] px-3 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#f27f0d]"
                                    value={q.negative_points}
                                    onChange={e => updateQuestion(q.id, { negative_points: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Integer answer */}
                        {q.question_type === 3 && (
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Correct Integer Answer</label>
                                <input
                                    type="number"
                                    className="h-10 w-48 rounded-xl border border-[#e2e8f0] px-3 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#f27f0d]"
                                    value={q.correct_integer_answer ?? ""}
                                    onChange={e => updateQuestion(q.id, { correct_integer_answer: Number(e.target.value) })}
                                />
                            </div>
                        )}

                        {/* Options (SCQ / MCQ) */}
                        {q.question_type !== 3 && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">
                                    Options {q.question_type === 1 ? "(select one correct)" : "(select all correct)"}
                                </label>
                                {q.options.map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-3">
                                        {q.question_type === 1 ? (
                                            <button
                                                onClick={() => setSCQCorrect(q.id, oi)}
                                                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition cursor-pointer ${opt.is_correct ? "border-[#f27f0d] bg-[#f27f0d]" : "border-[#cbd5e1]"}`}
                                            >
                                                {opt.is_correct && <span className="w-2 h-2 rounded-full bg-white" />}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => updateOption(q.id, oi, { is_correct: !opt.is_correct })}
                                                className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition cursor-pointer ${opt.is_correct ? "border-[#f27f0d] bg-[#f27f0d]" : "border-[#cbd5e1]"}`}
                                            >
                                                {opt.is_correct && <span className="material-symbols-outlined text-white" style={{ fontSize: 12 }}>check</span>}
                                            </button>
                                        )}
                                        <input
                                            className="flex-1 h-10 rounded-xl border border-[#e2e8f0] px-3 text-sm font-medium text-[#0f172a] focus:outline-none focus:border-[#f27f0d]"
                                            placeholder={`Option ${oi + 1}`}
                                            value={opt.text}
                                            onChange={e => updateOption(q.id, oi, { text: e.target.value })}
                                        />
                                        <button
                                            onClick={() => removeOption(q.id, oi)}
                                            className="text-[#94a3b8] hover:text-[#ef4444] cursor-pointer shrink-0"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addOption(q.id)}
                                    className="self-start mt-1 text-xs font-bold text-[#f27f0d] hover:underline cursor-pointer"
                                >
                                    + Add option
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Add Question button */}
                <button
                    onClick={() => setQuestions(qs => [...qs, makeQuestion()])}
                    className="flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-[#f27f0d] text-[#f27f0d] text-sm font-bold hover:bg-[#fff4e8] transition cursor-pointer"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                    Add Question
                </button>
            </div>
        </div>
    );
}
