"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

type Entry = { rank: number; student_id: number; name: string; points: number };

function avatarUrl(studentId: number, size: number) {
    return `https://i.pravatar.cc/${size}?img=${(studentId % 70) + 1}`;
}

function RankBadge({ rank }: { rank: number }) {
    return (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#f27f0d] text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
            {rank}
        </div>
    );
}

export default function LeaderboardPage() {
    const { quizid } = useParams<{ quizid: string }>();
    const quizId = Number(quizid);

    const [entries, setEntries] = useState<Entry[]>([]);
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [myStudentId, setMyStudentId] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // fetch initial leaderboard (live first, fallback to past)
    useEffect(() => {
        const init = async () => {
            try {
                const meRes = await fetch("/api/v1/me");
                const me = await meRes.json();
                if (!me.error) setMyStudentId(me.student_id);

                const liveRes = await fetch(`/api/v1/leaderboard/live?quiz_id=${quizId}`);
                const liveData = await liveRes.json();
                if (!liveData.error) {
                    setEntries(liveData.leaderboard ?? []);
                    setIsLive(true);
                    setLoading(false);
                    return;
                }

                const pastRes = await fetch(`/api/v1/leaderboard/past?quiz_id=${quizId}`);
                const pastData = await pastRes.json();
                if (pastData.error) { setError(pastData.error); }
                else { setEntries(pastData.leaderboard ?? []); }
            } catch {
                setError("Failed to load leaderboard");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [quizId]);

    // socket.io for live updates
    useEffect(() => {
        if (!isLive) return;
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8001";
        const socket = io(wsUrl, { transports: ["websocket"] });
        socketRef.current = socket;
        socket.emit("join_quiz", { quiz_id: quizId });
        socket.on("leaderboard_update", (data: { leaderboard: Entry[] }) => {
            setEntries(data.leaderboard ?? []);
        });
        return () => { socket.disconnect(); };
    }, [isLive, quizId]);

    if (loading) return (
        <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center">
            <p className="text-[#64748b] font-medium">Loading leaderboard…</p>
        </div>
    );
    if (error) return (
        <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center">
            <p className="text-red-500 font-medium">{error}</p>
        </div>
    );

    const top3Raw = entries.slice(0, 3);
    // arrange podium: 2nd on left, 1st in center, 3rd on right
    const podium = top3Raw.length === 3
        ? [top3Raw[1], top3Raw[0], top3Raw[2]]
        : top3Raw;
    const tableRows = showAll ? entries.slice(3) : entries.slice(3, 3 + 5);

    return (
        <div className="min-h-screen bg-[#f5f3ef] p-6 md:p-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#0f172a]">Leaderboard</h1>
                        <p className="text-sm font-medium text-[#94a3b8] mt-1">
                            {isLive ? "Live rankings · updates in real time" : `Top performers · Quiz #${quizId}`}
                        </p>
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fff4e8] border border-[#f27f0d]">
                            <span className="w-2 h-2 rounded-full bg-[#f27f0d] animate-pulse" />
                            <span className="text-sm font-bold text-[#f27f0d]">LIVE</span>
                        </div>
                    )}
                </div>

                {entries.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 flex items-center justify-center">
                        <p className="text-[#94a3b8] font-medium">No entries yet.</p>
                    </div>
                ) : (
                    <>
                        {/* ── Podium ── */}
                        <div className="flex items-end justify-center gap-4">
                            {podium.map((p) => {
                                const isFirst = p.rank === 1;
                                return (
                                    <div
                                        key={p.student_id}
                                        className={`flex flex-col items-center gap-2 rounded-2xl px-8 py-5 transition-all ${
                                            isFirst
                                                ? "bg-[#fff4e8] border-2 border-[#f27f0d] scale-105 shadow-lg"
                                                : "bg-white border border-[#e2e8f0]"
                                        }`}
                                    >
                                        <div className="relative">
                                            {isFirst && (
                                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl">🏆</span>
                                            )}
                                            <img
                                                src={avatarUrl(p.student_id, isFirst ? 80 : 64)}
                                                alt={p.name}
                                                className={`rounded-full object-cover border-4 ${isFirst ? "w-20 h-20 border-[#f27f0d]" : "w-16 h-16 border-[#e2e8f0]"}`}
                                            />
                                            <RankBadge rank={p.rank} />
                                        </div>
                                        <p className="text-base font-black text-[#0f172a] mt-1">{p.name}</p>
                                        <p className="text-sm font-bold text-[#f27f0d]">
                                            {p.points.toLocaleString()} pts
                                        </p>
                                        {isFirst && (
                                            <span className="px-3 py-0.5 rounded-full bg-[#f27f0d] text-white text-[10px] font-black tracking-widest uppercase">
                                                ★ TOP
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Table ── */}
                        {tableRows.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="grid grid-cols-[48px_1fr_120px_60px] gap-4 px-6 py-3 border-b border-[#f1ede8]">
                                    {["RANK", "STUDENT", "SCORE", ""].map((h, i) => (
                                        <span key={i} className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase">{h}</span>
                                    ))}
                                </div>

                                {tableRows.map((r) => {
                                    const isYou = r.student_id === myStudentId;
                                    return (
                                        <div
                                            key={r.student_id}
                                            className={`grid grid-cols-[48px_1fr_120px_60px] gap-4 items-center px-6 py-3.5 border-b border-[#f8f7f5] last:border-0 transition-colors ${
                                                isYou ? "bg-[#fff4e8]" : "hover:bg-[#fafaf9]"
                                            }`}
                                        >
                                            <span className={`text-sm font-black ${isYou ? "text-[#f27f0d]" : "text-[#0f172a]"}`}>{r.rank}</span>

                                            <div className="flex items-center gap-3 min-w-0">
                                                <img src={avatarUrl(r.student_id, 36)} alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                                <p className={`text-sm font-bold truncate ${isYou ? "text-[#f27f0d]" : "text-[#0f172a]"}`}>
                                                    {r.name}{isYou ? " (You)" : ""}
                                                </p>
                                            </div>

                                            <span className={`text-sm font-black ${isYou ? "text-[#f27f0d]" : "text-[#0f172a]"}`}>
                                                {r.points.toLocaleString()}
                                            </span>

                                            <div />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {entries.length > 8 && !showAll && (
                            <button
                                onClick={() => setShowAll(true)}
                                className="self-center text-sm font-bold text-[#f27f0d] hover:underline cursor-pointer flex items-center gap-1"
                            >
                                View More Rankings
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
