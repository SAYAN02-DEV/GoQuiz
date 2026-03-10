"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Quiz = {
    quiz_id: number;
    title: string;
    is_live: boolean;
    is_result_out: boolean;
    due_date: string;
};
type Class = {
    class_id: number;
    name: string;
    secret_key: string;
    student_count: number;
    quizzes: Quiz[];
};

function QuizStatusBadge({ q }: { q: Quiz }) {
    if (q.is_live) return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff4e8] text-[#f27f0d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f27f0d] animate-pulse" />LIVE
        </span>
    );
    if (q.is_result_out) return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#16a34a]">RESULTS OUT</span>
    );
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">SCHEDULED</span>;
}

export default function EducaterDashboardPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [endingQuizId, setEndingQuizId] = useState<number | null>(null);

    // Modals
    const [showCreateClass, setShowCreateClass] = useState(false);
    const [showCreateQuiz, setShowCreateQuiz] = useState(false);

    // Create class form
    const [newClassName, setNewClassName] = useState("");
    const [newClassKey, setNewClassKey] = useState("");
    const [classCreating, setClassCreating] = useState(false);

    // Create quiz form
    const [newQuizName, setNewQuizName] = useState("");
    const [newQuizLive, setNewQuizLive] = useState(false);
    const [newQuizDue, setNewQuizDue] = useState("");
    const [quizCreating, setQuizCreating] = useState(false);

    const load = useCallback(async () => {
        const res = await fetch("/api/v1/educater/myclasses");
        if (res.status === 401) { router.push("/educater/login"); return; }
        const data = await res.json();
        const list: Class[] = data.classes ?? [];
        setClasses(list);
        if (list.length > 0 && selectedClassId === null) setSelectedClassId(list[0].class_id);
        setLoading(false);
    }, [router, selectedClassId]);

    useEffect(() => { load(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    const selectedClass = classes.find(c => c.class_id === selectedClassId) ?? null;

    async function createClass() {
        if (!newClassName.trim() || !newClassKey.trim()) return;
        setClassCreating(true);
        const res = await fetch("/api/v1/educater/newclass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ className: newClassName.trim(), secretKey: newClassKey.trim() }),
        });
        const data = await res.json();
        setClassCreating(false);
        if (res.ok) {
            setNewClassName(""); setNewClassKey("");
            setShowCreateClass(false);
            setSelectedClassId(null);
            setLoading(true);
            await load();
            setSelectedClassId(data.class_id);
        } else {
            alert(data.error ?? "Failed to create class");
        }
    }

    async function createQuiz() {
        if (!newQuizName.trim() || !newQuizDue || !selectedClassId) return;
        setQuizCreating(true);
        const res = await fetch("/api/v1/educater/newquiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                quizName: newQuizName.trim(),
                classId: selectedClassId,
                isLive: newQuizLive,
                dueDate: new Date(newQuizDue),
                isResultOut: false,
            }),
        });
        const data = await res.json();
        setQuizCreating(false);
        if (res.ok) {
            setNewQuizName(""); setNewQuizDue(""); setNewQuizLive(false);
            setShowCreateQuiz(false);
            router.push(`/educater/quiz/${data.quiz_id}/questions`);
        } else {
            alert(data.error ?? "Failed to create quiz");
        }
    }

    async function endLiveQuiz(quizId: number) {
        if (!confirm("End this live quiz? Results will be saved to the database.")) return;
        setEndingQuizId(quizId);
        const res = await fetch("/api/v1/educater/endlivequiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quiz_id: quizId }),
        });
        setEndingQuizId(null);
        if (res.ok) { await load(); }
        else { const d = await res.json(); alert(d.error ?? "Failed to end quiz"); }
    }

    return (
        <div className="min-h-screen bg-[#f5f3ef]">

            {/* ── Top Bar ── */}
            <div className="bg-white border-b border-[#f1ede8] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#f27f0d] flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    </div>
                    <span className="text-xl font-black text-[#f27f0d]">GoQuiz</span>
                    <span className="ml-2 text-sm font-semibold text-[#94a3b8]">Educator Dashboard</span>
                </div>
                <button
                    onClick={() => setShowCreateClass(true)}
                    className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition cursor-pointer"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    New Class
                </button>
            </div>

            <div className="flex max-w-6xl mx-auto gap-6 p-6">

                {/* ── Sidebar: class list ── */}
                <div className="w-60 shrink-0 flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase px-2 mb-1">Your Classes</p>
                    {loading ? (
                        <p className="text-sm text-[#94a3b8] px-2">Loading…</p>
                    ) : classes.length === 0 ? (
                        <p className="text-sm text-[#94a3b8] px-2">No classes yet.</p>
                    ) : classes.map((c) => (
                        <button
                            key={c.class_id}
                            onClick={() => setSelectedClassId(c.class_id)}
                            className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                                c.class_id === selectedClassId
                                    ? "bg-white shadow-sm border border-[#f1ede8] text-[#0f172a]"
                                    : "text-[#64748b] hover:bg-white hover:shadow-sm"
                            }`}
                        >
                            <span className="text-sm font-bold truncate">{c.name}</span>
                            <span className="text-xs text-[#94a3b8]">{c.student_count} students · {c.quizzes.length} quizzes</span>
                        </button>
                    ))}
                </div>

                {/* ── Main: quiz list for selected class ── */}
                <div className="flex-1">
                    {!selectedClass ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 flex items-center justify-center">
                            <p className="text-[#94a3b8] font-medium">
                                {classes.length === 0 ? "Create your first class to get started." : "Select a class."}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {/* Class header */}
                            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-black text-[#0f172a]">{selectedClass.name}</h1>
                                    <p className="text-xs text-[#94a3b8] mt-0.5">
                                        Secret key: <span className="font-bold text-[#0f172a]">{selectedClass.secret_key}</span>
                                        <span className="ml-3">{selectedClass.student_count} students</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCreateQuiz(true)}
                                    className="flex items-center gap-2 h-9 px-4 rounded-xl border border-[#f27f0d] text-[#f27f0d] text-sm font-bold hover:bg-[#fff4e8] transition cursor-pointer"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                                    New Quiz
                                </button>
                            </div>

                            {/* Quiz cards */}
                            {selectedClass.quizzes.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-sm p-10 flex items-center justify-center">
                                    <p className="text-[#94a3b8] font-medium">No quizzes yet. Create one!</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {selectedClass.quizzes.map((q) => (
                                        <div key={q.quiz_id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#fff4e8] flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-[#f27f0d]" style={{ fontSize: 20 }}>
                                                    {q.is_live ? "live_tv" : "quiz"}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-bold text-[#0f172a] truncate">{q.title}</p>
                                                    <QuizStatusBadge q={q} />
                                                </div>
                                                <p className="text-xs text-[#94a3b8] mt-0.5">
                                                    Due: {new Date(q.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    <span className="ml-2">ID: {q.quiz_id}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => router.push(`/educater/quiz/${q.quiz_id}/questions`)}
                                                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#f1f5f9] text-[#64748b] text-xs font-bold hover:bg-[#e2e8f0] transition cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                                                    Edit Questions
                                                </button>
                                                {q.is_live && (
                                                    <button
                                                        onClick={() => endLiveQuiz(q.quiz_id)}
                                                        disabled={endingQuizId === q.quiz_id}
                                                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#fee2e2] text-[#ef4444] text-xs font-bold hover:bg-[#fecaca] transition cursor-pointer disabled:opacity-50"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>stop_circle</span>
                                                        {endingQuizId === q.quiz_id ? "Ending…" : "End Quiz"}
                                                    </button>
                                                )}
                                                {(q.is_live || q.is_result_out) && (
                                                    <button
                                                        onClick={() => router.push(`/Leaderboard/${q.quiz_id}`)}
                                                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#f1f5f9] text-[#64748b] text-xs font-bold hover:bg-[#e2e8f0] transition cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>leaderboard</span>
                                                        Leaderboard
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Create Class Modal ── */}
            {showCreateClass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-[#0f172a]">Create New Class</h2>
                            <button onClick={() => setShowCreateClass(false)} className="text-[#94a3b8] hover:text-[#0f172a] cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Class Name</label>
                                <input
                                    className="w-full h-11 rounded-xl border border-[#e2e8f0] px-4 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#f27f0d]"
                                    placeholder="e.g. Physics XI A"
                                    value={newClassName}
                                    onChange={e => setNewClassName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Secret Join Key</label>
                                <input
                                    className="w-full h-11 rounded-xl border border-[#e2e8f0] px-4 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#f27f0d]"
                                    placeholder="e.g. PHY2026"
                                    value={newClassKey}
                                    onChange={e => setNewClassKey(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={createClass}
                            disabled={classCreating || !newClassName.trim() || !newClassKey.trim()}
                            className="h-11 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition cursor-pointer disabled:opacity-50"
                        >
                            {classCreating ? "Creating…" : "Create Class"}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Create Quiz Modal ── */}
            {showCreateQuiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-[#0f172a]">Create New Quiz</h2>
                            <button onClick={() => setShowCreateQuiz(false)} className="text-[#94a3b8] hover:text-[#0f172a] cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <p className="text-xs text-[#94a3b8] -mt-2">For: <span className="font-bold text-[#0f172a]">{selectedClass?.name}</span></p>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Quiz Title</label>
                                <input
                                    className="w-full h-11 rounded-xl border border-[#e2e8f0] px-4 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#f27f0d]"
                                    placeholder="e.g. Unit 3 — Thermodynamics"
                                    value={newQuizName}
                                    onChange={e => setNewQuizName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Due Date</label>
                                <input
                                    type="datetime-local"
                                    className="w-full h-11 rounded-xl border border-[#e2e8f0] px-4 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#f27f0d]"
                                    value={newQuizDue}
                                    onChange={e => setNewQuizDue(e.target.value)}
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div
                                    onClick={() => setNewQuizLive(v => !v)}
                                    className={`w-10 h-6 rounded-full transition-colors ${newQuizLive ? "bg-[#f27f0d]" : "bg-[#e2e8f0]"} relative`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${newQuizLive ? "translate-x-5" : "translate-x-1"}`} />
                                </div>
                                <span className="text-sm font-bold text-[#0f172a]">Start as Live Quiz</span>
                            </label>
                        </div>
                        <button
                            onClick={createQuiz}
                            disabled={quizCreating || !newQuizName.trim() || !newQuizDue}
                            className="h-11 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition cursor-pointer disabled:opacity-50"
                        >
                            {quizCreating ? "Creating…" : "Create Quiz"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
