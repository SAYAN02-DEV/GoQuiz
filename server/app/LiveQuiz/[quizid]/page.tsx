"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const LABELS = ["A", "B", "C", "D", "E", "F"];

interface Option { option_id: number; text: string; image_link: string; }
interface Question {
    question_id: number;
    text: string;
    image_link: string;
    question_type: number;
    correct_points: number;
    negative_points: number;
    options: Option[];
}
interface Quiz { quiz_id: number; title: string; questions: Question[]; }
interface LeaderboardEntry { rank: number; student_id: number; name: string; points: number; }

type Answers = Record<number, {
    option_id?: number;
    selected_option_ids?: number[];
    integer_answer?: number;
    submitted?: boolean;
    points_earned?: number;
}>;

export default function LiveQuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = Number(params.quizid);

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [myPoints, setMyPoints] = useState(0);
    const [myStudentId, setMyStudentId] = useState<number | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [showBoard, setShowBoard] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const submittedRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        fetch(`/api/v1/takelivequiz?quiz_id=${quizId}`)
            .then((r) => {
                if (r.status === 401) { router.push("/login"); return null; }
                return r.json();
            })
            .then((data) => {
                if (!data) return;
                if (data.error) { setError(data.error); return; }
                setQuiz(data.quiz);
                if (data.student_id) setMyStudentId(data.student_id);
            })
            .finally(() => setLoading(false));
    }, [quizId, router]);

    useEffect(() => {
        // Fetch initial leaderboard snapshot over HTTP so it shows before first answer
        fetch(`/api/v1/leaderboard/live?quiz_id=${quizId}`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data?.leaderboard?.length) setLeaderboard(data.leaderboard); })
            .catch(() => {});

        const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8002");
        socketRef.current = socket;
        socket.emit("join_quiz", { quiz_id: quizId });
        socket.on("leaderboard_update", (data: { leaderboard: LeaderboardEntry[] }) => {
            setLeaderboard(data.leaderboard);
        });
        return () => { socket.emit("leave_quiz", { quiz_id: quizId }); socket.disconnect(); };
    }, [quizId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f5f3ef]"><p className="text-[#94a3b8]">Loadingâ€¦</p></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#f5f3ef]"><p className="text-red-500">{error}</p></div>;
    if (!quiz) return null;

    const total = quiz.questions.length;
    const question = quiz.questions[currentIndex];
    const progress = ((currentIndex + 1) / total) * 100;
    const remaining = total - (currentIndex + 1);
    const currentAnswer = answers[question.question_id];

    async function submitAnswer(ans: Answers[number]) {
        if (submittedRef.current.has(question.question_id)) return;
        submittedRef.current.add(question.question_id);
        setAnswers((prev) => ({ ...prev, [question.question_id]: { ...ans, submitted: true } }));
        console.log(`[LiveQuiz] Submitting answer for question ${question.question_id}`, ans);
        const res = await fetch("/api/v1/submitliveanswer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quiz_id: quizId, question_id: question.question_id, ...ans }),
        });
        const data = await res.json();
        console.log(`[LiveQuiz] submitliveanswer response: status=${res.status}`, data);
        if (res.ok) {
            setMyPoints((p) => p + (data.points_earned ?? 0));
            setAnswers((prev) => ({ ...prev, [question.question_id]: { ...ans, submitted: true, points_earned: data.points_earned } }));
        } else {
            console.error(`[LiveQuiz] Submit failed: ${data.error}`);
        }
    }

    function selectSCQ(option_id: number) { submitAnswer({ option_id }); }
    function toggleMCQ(option_id: number) {
        if (currentAnswer?.submitted) return;
        const prev = currentAnswer?.selected_option_ids ?? [];
        const next = prev.includes(option_id) ? prev.filter((id) => id !== option_id) : [...prev, option_id];
        setAnswers((a) => ({ ...a, [question.question_id]: { selected_option_ids: next } }));
    }
    function submitMCQ() { submitAnswer({ selected_option_ids: currentAnswer?.selected_option_ids ?? [] }); }

    const isSubmitted = !!currentAnswer?.submitted;

    return (
        <div>
            <Header />
            <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-6">
                <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm overflow-hidden">

                    {/* Top bar */}
                    <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-[#0f172a]">Quiz Progress</span>
                                <span className="text-sm font-bold text-[#f27f0d]">{currentIndex + 1} / {total}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#f1ede8]">
                                <div className="h-2 rounded-full bg-[#f27f0d] transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="mt-1.5 text-xs font-medium text-[#f27f0d]">
                                {remaining} question{remaining !== 1 ? "s" : ""} remaining to complete the module.
                            </p>
                        </div>

                        {/* Live score + leaderboard toggle */}
                        <button
                            onClick={() => setShowBoard((v) => !v)}
                            className="flex items-center gap-1 shrink-0 border border-[#f1ede8] rounded-2xl px-4 py-2 cursor-pointer hover:border-[#f27f0d] transition-colors"
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-[#f27f0d]">{myPoints}</span>
                                <span className="text-[9px] font-bold text-[#94a3b8] tracking-widest uppercase">Points</span>
                            </div>
                        </button>
                    </div>

                    {/* Live leaderboard panel */}
                    {showBoard && (
                        <div className="mx-4 mb-4 rounded-2xl border border-[#f1ede8] overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#f27f0d] to-[#f5a623] px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
                                    <span className="text-xs font-black text-white tracking-wider uppercase">Live Leaderboard</span>
                                </div>
                                <span className="text-[10px] font-bold text-white/80">{leaderboard.length} participant{leaderboard.length !== 1 ? "s" : ""}</span>
                            </div>
                            {leaderboard.length === 0 ? (
                                <div className="px-4 py-6 flex flex-col items-center gap-1">
                                    <span className="material-symbols-outlined text-[#f1ede8] text-4xl">leaderboard</span>
                                    <p className="text-xs text-[#94a3b8] font-medium">Waiting for answers…</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#f1ede8]">
                                    {leaderboard.slice(0, 10).map((e) => {
                                        const isMe = e.student_id === myStudentId;
                                        const medal = e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : null;
                                        return (
                                            <div key={e.student_id} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isMe ? "bg-[#fff4e8]" : "bg-white hover:bg-[#fafaf9]"}`}>
                                                {/* Rank */}
                                                <div className="w-7 shrink-0 text-center">
                                                    {medal ? (
                                                        <span className="text-base leading-none">{medal}</span>
                                                    ) : (
                                                        <span className="text-xs font-black text-[#94a3b8]">#{e.rank}</span>
                                                    )}
                                                </div>
                                                {/* Name */}
                                                <span className={`flex-1 text-xs font-semibold truncate ${isMe ? "text-[#f27f0d]" : "text-[#0f172a]"}`}>
                                                    {e.name}{isMe && <span className="ml-1 text-[10px] font-bold text-[#f27f0d] opacity-70">(you)</span>}
                                                </span>
                                                {/* Points bar */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="w-16 h-1.5 rounded-full bg-[#f1ede8] overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-[#f27f0d] transition-all duration-500"
                                                            style={{ width: `${leaderboard[0].points > 0 ? Math.round((e.points / leaderboard[0].points) * 100) : 0}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-black w-12 text-right ${isMe ? "text-[#f27f0d]" : "text-[#0f172a]"}`}>{e.points} pts</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {/* If I'm not in top 10, show my row at the bottom */}
                                    {myStudentId !== null && !leaderboard.slice(0, 10).some(e => e.student_id === myStudentId) && (() => {
                                        const me = leaderboard.find(e => e.student_id === myStudentId);
                                        if (!me) return null;
                                        return (
                                            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#fff4e8] border-t-2 border-[#f27f0d]">
                                                <div className="w-7 shrink-0 text-center">
                                                    <span className="text-xs font-black text-[#f27f0d]">#{me.rank}</span>
                                                </div>
                                                <span className="flex-1 text-xs font-semibold truncate text-[#f27f0d]">{me.name} <span className="text-[10px] opacity-70">(you)</span></span>
                                                <span className="text-xs font-black text-[#f27f0d]">{me.points} pts</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Question image */}
                    <div className="relative mx-4">
                        {question.image_link && question.image_link !== "null" ? (
                            <img src={question.image_link} alt="Question visual" className="w-full h-52 object-cover rounded-2xl" />
                        ) : (
                            <div className="w-full h-28 rounded-2xl bg-[#f1ede8] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#f27f0d] text-4xl">quiz</span>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-[#f27f0d] text-white text-xs font-bold mb-2">
                                {quiz.title}
                            </span>
                            <h2 className="text-white text-2xl font-black drop-shadow-lg">Question {currentIndex + 1}</h2>
                        </div>
                    </div>

                    {/* Question text */}
                    <div className="px-6 pt-5 pb-3">
                        <p className="text-[#0f172a] text-base font-bold leading-snug">{question.text}</p>
                        {isSubmitted && currentAnswer.points_earned !== undefined && (
                            <p className={`mt-1.5 text-xs font-bold ${currentAnswer.points_earned > 0 ? "text-green-500" : currentAnswer.points_earned < 0 ? "text-red-500" : "text-[#94a3b8]"}`}>
                                {currentAnswer.points_earned > 0 ? `+${currentAnswer.points_earned}` : currentAnswer.points_earned} pts earned
                            </p>
                        )}
                        {!isSubmitted && (
                            <p className="mt-1.5 text-xs font-medium text-[#94a3b8] italic">
                                {question.question_type === 1 && "Select one answer â€” submits immediately."}
                                {question.question_type === 2 && "Select all correct answers, then confirm."}
                                {question.question_type === 3 && "Enter your answer, then confirm."}
                            </p>
                        )}
                    </div>

                    {/* Options / Input */}
                    <div className="px-6 flex flex-col gap-2.5 pb-4">
                        {question.question_type === 3 ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Enter your answer"
                                    value={currentAnswer?.integer_answer ?? ""}
                                    disabled={isSubmitted}
                                    onChange={(e) => setAnswers((a) => ({ ...a, [question.question_id]: { integer_answer: parseInt(e.target.value, 10) || undefined } }))}
                                    className="flex-1 border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#f27f0d] disabled:opacity-60"
                                />
                                {!isSubmitted && (
                                    <button onClick={() => submitAnswer({ integer_answer: currentAnswer?.integer_answer })} className="px-4 rounded-xl bg-[#f27f0d] text-white text-sm font-bold cursor-pointer">Confirm</button>
                                )}
                            </div>
                        ) : (
                            question.options.map((opt, idx) => {
                                const isSCQSelected = question.question_type === 1 && currentAnswer?.option_id === opt.option_id;
                                const isMCQSelected = question.question_type === 2 && (currentAnswer?.selected_option_ids ?? []).includes(opt.option_id);
                                const isSelected = isSCQSelected || isMCQSelected;
                                return (
                                    <button
                                        key={opt.option_id}
                                        onClick={() => {
                                            if (isSubmitted) return;
                                            question.question_type === 1 ? selectSCQ(opt.option_id) : toggleMCQ(opt.option_id);
                                        }}
                                        disabled={isSubmitted && question.question_type === 1}
                                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-all cursor-pointer ${
                                            isSelected
                                                ? "border-[#f27f0d] bg-[#fff4e8] text-[#0f172a]"
                                                : "border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#f27f0d]/40"
                                        } disabled:cursor-not-allowed disabled:opacity-70`}
                                    >
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                            isSelected ? "bg-[#f27f0d] text-white" : "bg-[#f1ede8] text-[#64748b]"
                                        }`}>
                                            {LABELS[idx]}
                                        </span>
                                        {opt.text}
                                    </button>
                                );
                            })
                        )}
                        {question.question_type === 2 && !isSubmitted && (
                            <button onClick={submitMCQ} className="mt-1 w-full h-10 rounded-xl bg-[#f27f0d] text-white text-sm font-bold cursor-pointer hover:bg-[#e0720a]">
                                Confirm Selection
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between px-6 py-5 border-t border-[#f1ede8]">
                        <button
                            onClick={() => setCurrentIndex((i) => i - 1)}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-1.5 text-sm font-bold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            â† Previous
                        </button>
                        {currentIndex < total - 1 ? (
                            <button
                                onClick={() => setCurrentIndex((i) => i + 1)}
                                className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition-colors cursor-pointer"
                            >
                                Next Question
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push(`/LiveQuizComplete/${quizId}`)}
                                className="flex items-center gap-2 h-11 px-6 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors cursor-pointer"
                            >
                                Finish Quiz
                            </button>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
