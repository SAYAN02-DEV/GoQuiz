"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const Q_TYPE: Record<number, string> = { 1: "SCQ", 2: "MCQ", 3: "Integer" };

type Option = { option_id: number; text: string; is_correct: boolean };
type Answer = {
    student_answer_id: number;
    question_id: number;
    option_id: number | null;
    integer_answer: number | null;
    question: {
        question_id: number;
        text: string;
        question_type: number;
        correct_points: number;
        negative_points: number;
        correct_integer_answer: number | null;
        options: Option[];
    };
    selected_option: Option | null;
    mcq_selected_options: { option: Option }[];
};
type Attempt = {
    attempt_id: number;
    points: number;
    is_Live: boolean;
    attempt_date: string;
    quiz: { quiz_id: number; title: string };
    answers: Answer[];
};

function isCorrect(a: Answer): boolean {
    const q = a.question;
    if (q.question_type === 1) return a.selected_option?.is_correct === true;
    if (q.question_type === 2) {
        const correctIds = new Set(q.options.filter(o => o.is_correct).map(o => o.option_id));
        const selectedIds = new Set(a.mcq_selected_options.map(so => so.option.option_id));
        if (correctIds.size !== selectedIds.size) return false;
        for (const id of correctIds) if (!selectedIds.has(id)) return false;
        return true;
    }
    return a.integer_answer === q.correct_integer_answer;
}

function userAnswerText(a: Answer): string {
    if (a.question.question_type === 1) return a.selected_option?.text ?? "(no answer)";
    if (a.question.question_type === 2) return a.mcq_selected_options.map(so => so.option.text).join(", ") || "(no answer)";
    return a.integer_answer?.toString() ?? "(no answer)";
}

function correctAnswerText(a: Answer): string | null {
    const q = a.question;
    if (q.question_type === 1) return q.options.find(o => o.is_correct)?.text ?? null;
    if (q.question_type === 2) return q.options.filter(o => o.is_correct).map(o => o.text).join(", ");
    return q.correct_integer_answer?.toString() ?? null;
}

function CircleProgress({ percent }: { percent: number }) {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    return (
        <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={r} fill="none" stroke="#f1ede8" strokeWidth="10" />
            <circle
                cx="70" cy="70" r={r} fill="none"
                stroke="#f27f0d" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 70 70)"
            />
            <text x="70" y="65" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="900" fill="#0f172a">{percent}%</text>
            <text x="70" y="85" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill="#94a3b8" letterSpacing="1">SUCCESS SCORE</text>
        </svg>
    );
}

function QuizResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const attemptId = searchParams.get("attempt_id");

    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [studentName, setStudentName] = useState("Student");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (!attemptId) { setError("No attempt_id provided"); setLoading(false); return; }
        Promise.all([
            fetch(`/api/v1/myresult?attempt_id=${attemptId}`).then(r => r.json()),
            fetch("/api/v1/me").then(r => r.json()),
        ]).then(([resultData, meData]) => {
            if (resultData.error) { setError(resultData.error); return; }
            setAttempt(resultData);
            if (!meData.error) setStudentName(meData.name);
        }).catch(() => setError("Failed to load results"))
          .finally(() => setLoading(false));
    }, [attemptId]);

    if (loading) return (
        <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center">
            <p className="text-[#64748b] font-medium">Loading results…</p>
        </div>
    );
    if (error || !attempt) return (
        <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center">
            <p className="text-red-500 font-medium">{error || "Failed to load"}</p>
        </div>
    );

    const results = attempt.answers.map((a, i) => ({
        idx: i,
        correct: isCorrect(a),
        category: Q_TYPE[a.question.question_type] ?? "Q",
        question: a.question.text,
        userAnswer: userAnswerText(a),
        correctAnswer: isCorrect(a) ? null : correctAnswerText(a),
    }));

    const totalPossible = attempt.answers.reduce((s, a) => s + a.question.correct_points, 0);
    const correctCount = results.filter(r => r.correct).length;
    const total = results.length;
    const percent = totalPossible > 0 ? Math.max(0, Math.min(100, Math.round((attempt.points / totalPossible) * 100))) : 0;
    const quizDate = new Date(attempt.attempt_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    const visible = showAll ? results : results.slice(0, 3);

    return (
        <div className="min-h-screen bg-[#f5f3ef] p-6 md:p-10">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#0f172a]">Congratulations, {studentName}!</h1>
                        <p className="text-sm font-medium text-[#64748b] mt-1">
                            You&apos;ve completed the{" "}
                            <span className="text-[#f27f0d] font-bold">{attempt.quiz.title}</span> quiz.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push(`/Leaderboard/${attempt.quiz.quiz_id}`)}
                            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition cursor-pointer"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>leaderboard</span>
                            View Leaderboard
                        </button>
                        <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[#e2e8f0] bg-white text-sm font-bold text-[#0f172a] hover:shadow-sm transition cursor-pointer">
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>share</span>
                            Share Results
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ── Left: Score card ── */}
                    <div className="w-full lg:w-64 shrink-0 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-5">
                        <CircleProgress percent={percent} />

                        <div className="flex justify-around w-full border-t border-[#f1ede8] pt-4">
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-2xl font-black text-[#22c55e]">{correctCount}/{total}</span>
                                <span className="text-xs font-semibold text-[#94a3b8]">Correct</span>
                            </div>
                            <div className="w-px bg-[#f1ede8]" />
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-2xl font-black text-[#ef4444]">{total - correctCount}/{total}</span>
                                <span className="text-xs font-semibold text-[#94a3b8]">Missed</span>
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-3 border-t border-[#f1ede8] pt-4">
                            {[
                                { icon: "stars", label: "Total Points", value: `${attempt.points} pts` },
                                { icon: "leaderboard", label: "Max Points", value: `${totalPossible} pts` },
                                { icon: "calendar_today", label: "Date", value: quizDate },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-[#64748b] font-medium">
                                        <span className="material-symbols-outlined text-[#f27f0d]" style={{ fontSize: 18 }}>{s.icon}</span>
                                        {s.label}
                                    </div>
                                    <span className="text-sm font-black text-[#0f172a]">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Right: Review answers ── */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">
                        <div>
                            <h2 className="text-lg font-black text-[#0f172a]">Review Answers</h2>
                            <p className="text-xs font-medium text-[#94a3b8] mt-0.5">Go through your responses and check the correct answers.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {visible.map((r, i) => (
                                <div key={i} className={`rounded-xl border p-4 ${r.correct ? "border-[#f1ede8]" : "border-[#fee2e2]"}`}>

                                    {/* Question row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                            <span className={`material-symbols-outlined mt-0.5 shrink-0 ${r.correct ? "text-[#22c55e]" : "text-[#ef4444]"}`} style={{ fontSize: 18 }}>
                                                {r.correct ? "check_circle" : "cancel"}
                                            </span>
                                            <p className="text-sm font-bold text-[#0f172a]">
                                                {i + 1}. {r.question}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.correct ? "text-[#f27f0d] bg-[#fff4e8]" : "text-[#ef4444] bg-[#fee2e2]"}`}>
                                            {r.category}
                                        </span>
                                    </div>

                                    {/* Answer */}
                                    <div className="mt-2 ml-7 flex flex-col gap-1">
                                        <p className="text-xs text-[#64748b]">
                                            Your answer:{" "}
                                            <span className={`font-bold ${r.correct ? "text-[#0f172a]" : "text-[#ef4444]"}`}>
                                                {r.userAnswer}
                                            </span>
                                        </p>
                                        {!r.correct && r.correctAnswer && (
                                            <p className="text-xs text-[#64748b]">
                                                Correct answer:{" "}
                                                <span className="font-bold text-[#22c55e]">{r.correctAnswer}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Points earned/lost */}
                                    <button
                                        className="mt-3 ml-7 text-[10px] font-bold tracking-widest uppercase text-[#f27f0d] cursor-pointer"
                                        onClick={() => setExpanded((e) => ({ ...e, [i]: !e[i] }))}
                                    >
                                        Points {expanded[i] ? "▲" : "▼"}
                                    </button>

                                    {expanded[i] && (
                                        <div className={`mt-2 ml-7 rounded-lg p-3 text-xs text-[#64748b] leading-relaxed ${r.correct ? "bg-[#f8f7f5]" : "bg-[#fff8f1]"} border-l-2 ${r.correct ? "border-[#f27f0d]" : "border-[#ef4444]"}`}>
                                            {r.correct
                                                ? `+${attempt.answers[i].question.correct_points} points earned`
                                                : `-${attempt.answers[i].question.negative_points} points deducted`}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {!showAll && results.length > 3 && (
                            <button
                                onClick={() => setShowAll(true)}
                                className="text-sm font-bold text-[#f27f0d] hover:underline cursor-pointer self-center"
                            >
                                Load {results.length - 3} more responses
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QuizResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center"><p className="text-[#64748b] font-medium">Loading…</p></div>}>
            <QuizResultContent />
        </Suspense>
    );
}
