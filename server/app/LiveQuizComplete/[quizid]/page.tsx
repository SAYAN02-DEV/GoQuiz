"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function LiveQuizCompletePage() {
    const params = useParams();
    const router = useRouter();
    const quizId = Number(params.quizid);

    const [points, setPoints] = useState<number | null>(null);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        let studentId: number | null = null;

        // Fetch current student's points and id
        fetch(`/api/v1/liveresult?quiz_id=${quizId}`)
            .then(r => { if (r.status === 401) { router.push("/login"); return null; } return r.json(); })
            .then(data => {
                if (!data) return;
                setPoints(data.points ?? 0);
            });

        fetch("/api/v1/me")
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data && !data.error) studentId = data.student_id; });

        // Connect socket and wait for quiz_ended event
        const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8002");
        socketRef.current = socket;
        socket.emit("join_quiz", { quiz_id: quizId });

        socket.on("quiz_ended", (data: { attempts: { student_id: number; attempt_id: number }[] }) => {
            const mine = data.attempts.find(a => a.student_id === studentId);
            if (mine) {
                setAttemptId(mine.attempt_id);
            }
        });

        return () => {
            socket.emit("leave_quiz", { quiz_id: quizId });
            socket.disconnect();
        };
    }, [quizId, router]);

    return (
        <div>
            <Header />
            <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 flex flex-col items-center gap-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#fff4e8] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#f27f0d] text-4xl">emoji_events</span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-black text-[#0f172a]">Quiz Complete!</h1>
                        <p className="mt-1 text-sm font-medium text-[#64748b]">You have answered all questions.</p>
                    </div>

                    {points === null ? (
                        <p className="text-sm text-[#94a3b8]">Loading your score…</p>
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-5xl font-black text-[#f27f0d]">{points}</span>
                            <span className="text-xs font-bold text-[#94a3b8] tracking-widest uppercase">Points Earned</span>
                        </div>
                    )}

                    {attemptId ? (
                        <div className="flex flex-col items-center gap-3 w-full">
                            <p className="text-xs font-medium text-green-600 bg-green-50 px-4 py-2 rounded-xl w-full">
                                Results have been finalized by your educator!
                            </p>
                            <button
                                onClick={() => router.push(`/QuizResult?attempt_id=${attemptId}`)}
                                className="w-full h-12 rounded-xl bg-[#f27f0d] text-white font-bold text-sm hover:bg-[#e0720a] transition cursor-pointer"
                            >
                                View Full Results
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 w-full">
                            <div className="flex items-center gap-2 text-xs font-medium text-[#64748b] bg-[#f5f3ef] px-4 py-3 rounded-xl w-full justify-center">
                                <span className="w-2 h-2 rounded-full bg-[#f27f0d] animate-pulse inline-block" />
                                Waiting for educator to finalize results…
                            </div>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="text-sm font-bold text-[#64748b] hover:text-[#0f172a] transition cursor-pointer"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
