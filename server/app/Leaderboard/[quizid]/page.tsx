"use client";
import { useState } from "react";

const TOP3 = [
  {
    rank: 2, name: "Alex Rivera",  pts: 12450, badge: null,
    avatar: "https://i.pravatar.cc/96?img=12",
  },
  {
    rank: 1, name: "Sarah Chen",   pts: 15200, badge: "MASTER",
    avatar: "https://i.pravatar.cc/96?img=47",
  },
  {
    rank: 3, name: "Jordan Smit",  pts: 10890, badge: null,
    avatar: "https://i.pravatar.cc/96?img=33",
  },
];

const ROWS = [
  { rank: 4, name: "Elena Rodriguez", location: "Madrid, ES",      avatar: "https://i.pravatar.cc/40?img=5",  level: "ELITE", score: 9420,  trend: "up"     },
  { rank: 5, name: "Marcus Thorne",   location: "London, UK",      avatar: "https://i.pravatar.cc/40?img=11", level: "ELITE", score: 8150,  trend: "flat"   },
  { rank: 6, name: "You (Sunset App)",location: "San Francisco, US",avatar: "https://i.pravatar.cc/40?img=9",  level: "ELITE", score: 7980,  trend: "up", isYou: true },
  { rank: 7, name: "Chloe Kim",       location: "Seoul, KR",       avatar: "https://i.pravatar.cc/40?img=20", level: "PRO",   score: 7540,  trend: "down"   },
  { rank: 8, name: "David Vance",     location: "Sydney, AU",      avatar: "https://i.pravatar.cc/40?img=15", level: "PRO",   score: 6820,  trend: "flat"   },
];

const TABS = ["All Time", "Monthly", "Weekly"];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up")   return <span className="text-[#22c55e] font-black text-lg">↗</span>;
  if (trend === "down") return <span className="text-[#ef4444] font-black text-lg">↘</span>;
  return <span className="text-[#94a3b8] font-bold text-base">—</span>;
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#f27f0d] text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
      {rank}
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("Monthly");

  return (
    <div className="min-h-screen bg-[#f5f3ef] p-6 md:p-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a]">Global Rankings</h1>
            <p className="text-sm font-medium text-[#94a3b8] mt-1">Celebrating the top performers of the Sunset season</p>
          </div>
          <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-xl p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === t ? "bg-[#f27f0d] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Podium ── */}
        <div className="flex items-end justify-center gap-4">
          {TOP3.map((p) => {
            const isFirst = p.rank === 1;
            return (
              <div
                key={p.rank}
                className={`flex flex-col items-center gap-2 rounded-2xl px-8 py-5 transition-all ${
                  isFirst
                    ? "bg-[#fff4e8] border-2 border-[#f27f0d] scale-105 shadow-lg"
                    : "bg-white border border-[#e2e8f0]"
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  {isFirst && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl">🏆</span>
                  )}
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className={`rounded-full object-cover border-4 ${isFirst ? "w-20 h-20 border-[#f27f0d]" : "w-16 h-16 border-[#e2e8f0]"}`}
                  />
                  <RankBadge rank={p.rank} />
                </div>

                {/* Info */}
                <p className="text-base font-black text-[#0f172a] mt-1">{p.name}</p>
                <p className={`text-sm font-bold ${isFirst ? "text-[#f27f0d]" : "text-[#f27f0d]"}`}>
                  {p.pts.toLocaleString()} pts
                </p>
                {p.badge && (
                  <span className="px-3 py-0.5 rounded-full bg-[#f27f0d] text-white text-[10px] font-black tracking-widest uppercase">
                    ★ {p.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[48px_1fr_120px_100px_60px] gap-4 px-6 py-3 border-b border-[#f1ede8]">
            {["RANK", "ATHLETE", "LEVEL", "SCORE", "TREND"].map((h) => (
              <span key={h} className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase">{h}</span>
            ))}
          </div>

          {ROWS.map((r) => (
            <div
              key={r.rank}
              className={`grid grid-cols-[48px_1fr_120px_100px_60px] gap-4 items-center px-6 py-3.5 border-b border-[#f8f7f5] last:border-0 transition-colors ${
                r.isYou ? "bg-[#fff4e8]" : "hover:bg-[#fafaf9]"
              }`}
            >
              {/* Rank */}
              <span className={`text-sm font-black ${r.isYou ? "text-[#f27f0d]" : "text-[#0f172a]"}`}>{r.rank}</span>

              {/* Athlete */}
              <div className="flex items-center gap-3 min-w-0">
                <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${r.isYou ? "text-[#f27f0d]" : "text-[#0f172a]"}`}>{r.name}</p>
                  <p className="text-[11px] text-[#94a3b8] font-medium truncate">{r.location}</p>
                </div>
              </div>

              {/* Level */}
              {r.isYou ? (
                <span className="justify-self-start px-3 py-0.5 rounded-full bg-[#f27f0d] text-white text-[10px] font-black tracking-widest">
                  {r.level}
                </span>
              ) : (
                <span className="text-sm font-bold text-[#94a3b8]">{r.level}</span>
              )}

              {/* Score */}
              <span className={`text-sm font-black ${r.isYou ? "text-[#f27f0d]" : "text-[#0f172a]"}`}>
                {r.score.toLocaleString()}
              </span>

              {/* Trend */}
              <div><TrendIcon trend={r.trend} /></div>
            </div>
          ))}
        </div>

        {/* ── Load more ── */}
        <button className="self-center text-sm font-bold text-[#f27f0d] hover:underline cursor-pointer flex items-center gap-1">
          View More Rankings
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
        </button>

      </div>
    </div>
  );
}
