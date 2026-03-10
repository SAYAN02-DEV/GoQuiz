"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface ClassItem { class_id: number; name: string; }
interface Quiz {
    quiz_id: number;
    title: string;
    due_date: string;
    is_live: boolean;
    is_result_out: boolean;
    question_count: number;
    attempt: { attempt_id: number; is_complete: boolean; points: number } | null;
}

export default function DashboardPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [joinClassId, setJoinClassId] = useState("");
    const [joinKey, setJoinKey] = useState("");
    const [joinError, setJoinError] = useState("");
    const [showJoin, setShowJoin] = useState(false);

    useEffect(() => {
        fetch("/api/v1/myclasses")
            .then((r) => {
                if (r.status === 401) { router.push("/login"); return null; }
                return r.json();
            })
            .then((data) => {
                if (!data) return;
                setClasses(data.classes ?? []);
                if (data.classes?.length) setSelectedClass(data.classes[0]);
            })
            .finally(() => setLoadingClasses(false));
    }, [router]);

    useEffect(() => {
        if (!selectedClass) return;
        setLoadingQuizzes(true);
        fetch(`/api/v1/quizzes?class_id=${selectedClass.class_id}`)
            .then((r) => r.json())
            .then((data) => setQuizzes(data.quizzes ?? []))
            .finally(() => setLoadingQuizzes(false));
    }, [selectedClass]);

    async function handleJoinClass() {
        setJoinError("");
        const res = await fetch("/api/v1/joinclass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ classId: parseInt(joinClassId), secretKey: joinKey }),
        });
        const data = await res.json();
        if (!res.ok) { setJoinError(data.error ?? "Failed to join"); return; }
        setShowJoin(false);
        setJoinClassId(""); setJoinKey("");
        // Refresh classes
        const r = await fetch("/api/v1/myclasses");
        const d = await r.json();
        setClasses(d.classes ?? []);
        setSelectedClass(d.classes?.at(-1) ?? null);
    }

    function handleQuizClick(q: Quiz) {
        if (q.is_live) {
            router.push(`/LiveQuiz/${q.quiz_id}`);
        } else if (q.attempt?.is_complete) {
            router.push(`/QuizResult?attempt_id=${q.attempt.attempt_id}`);
        } else {
            router.push(`/PastQuiz/${q.quiz_id}`);
        }
    }

    const liveQuizzes = quizzes.filter((q) => q.is_live);
    const pastQuizzes = quizzes.filter((q) => !q.is_live);

    return (
        <div className="min-h-screen bg-[#f5f3ef] flex flex-col">
            <Header />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

                {/* Class selector */}
                <div className="flex items-center gap-3 flex-wrap">
                    {loadingClasses ? (
                        <span className="text-sm text-[#94a3b8]">Loading classes…</span>
                    ) : classes.length === 0 ? (
                        <span className="text-sm text-[#94a3b8]">No classes yet.</span>
                    ) : (
                        classes.map((c) => (
                            <button
                                key={c.class_id}
                                onClick={() => setSelectedClass(c)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                                    selectedClass?.class_id === c.class_id
                                        ? "bg-[#f27f0d] text-white"
                                        : "bg-white text-[#0f172a] border border-[#e2e8f0] hover:border-[#f27f0d]"
                                }`}
                            >
                                {c.name}
                            </button>
                        ))
                    )}
                    <button
                        onClick={() => setShowJoin(true)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-dashed border-[#f27f0d] text-[#f27f0d] hover:bg-[#fff4e8] transition-colors cursor-pointer"
                    >
                        + Join Class
                    </button>
                </div>

                {/* Join class modal */}
                {showJoin && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
                            <h2 className="text-lg font-black text-[#0f172a]">Join a Class</h2>
                            <input
                                type="number"
                                placeholder="Class ID"
                                value={joinClassId}
                                onChange={(e) => setJoinClassId(e.target.value)}
                                className="border border-[#e2e8f0] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#f27f0d]"
                            />
                            <input
                                type="text"
                                placeholder="Secret Key"
                                value={joinKey}
                                onChange={(e) => setJoinKey(e.target.value)}
                                className="border border-[#e2e8f0] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#f27f0d]"
                            />
                            {joinError && <p className="text-sm text-red-500">{joinError}</p>}
                            <div className="flex gap-2">
                                <button onClick={handleJoinClass} className="flex-1 py-2 rounded-xl bg-[#f27f0d] text-white text-sm font-bold cursor-pointer hover:bg-[#e0720a]">Join</button>
                                <button onClick={() => { setShowJoin(false); setJoinError(""); }} className="flex-1 py-2 rounded-xl border border-[#e2e8f0] text-sm font-semibold cursor-pointer">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {loadingQuizzes ? (
                    <p className="text-sm text-[#94a3b8]">Loading quizzes…</p>
                ) : (
                    <>
                        {/* Live quizzes */}
                        {liveQuizzes.length > 0 && (
                            <section>
                                <h2 className="text-base font-black text-[#0f172a] mb-3 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    Live Now
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {liveQuizzes.map((q) => (
                                        <QuizCard key={q.quiz_id} quiz={q} onClick={() => handleQuizClick(q)} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Past quizzes */}
                        {pastQuizzes.length > 0 && (
                            <section>
                                <h2 className="text-base font-black text-[#0f172a] mb-3">Past Quizzes</h2>
                                <div className="flex flex-col gap-3">
                                    {pastQuizzes.map((q) => (
                                        <QuizCard key={q.quiz_id} quiz={q} onClick={() => handleQuizClick(q)} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {quizzes.length === 0 && selectedClass && (
                            <p className="text-sm text-[#94a3b8]">No quizzes in this class yet.</p>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}

function QuizCard({ quiz, onClick }: { quiz: Quiz; onClick: () => void }) {
    const due = new Date(quiz.due_date).toLocaleDateString();
    let statusLabel = "Start";
    let statusColor = "bg-[#f27f0d] text-white";

    if (quiz.is_live) {
        statusLabel = "Join Live";
        statusColor = "bg-red-500 text-white";
    } else if (quiz.attempt?.is_complete) {
        statusLabel = quiz.attempt.points + " pts · View Result";
        statusColor = "bg-[#e2e8f0] text-[#0f172a]";
    } else if (quiz.attempt) {
        statusLabel = "Resume";
    }

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl border border-[#e2e8f0] px-5 py-4 flex items-center justify-between cursor-pointer hover:border-[#f27f0d] transition-colors"
        >
            <div>
                <p className="font-bold text-[#0f172a] text-sm">{quiz.title}</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">{quiz.question_count} questions · Due {due}</p>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${statusColor}`}>{statusLabel}</span>
        </div>
    );
}
