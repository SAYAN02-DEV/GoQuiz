"use client";
import { useState } from "react";

const RESULTS = [
  {
    correct: true,
    category: "Cognitive Load",
    question: "What is the main goal of Hick's Law in UI design?",
    userAnswer: "Reducing the number of choices to decrease decision time.",
    correctAnswer: null,
    explanation: "Hick's Law predicts that the time and effort it takes to make a decision increases with the number and complexity of choices. Minimizing options helps users focus and act faster.",
  },
  {
    correct: false,
    category: "Gestalt Principles",
    question: "Which Gestalt principle explains why elements close to each other are perceived as a group?",
    userAnswer: "Similarity",
    correctAnswer: "Proximity",
    explanation: "The Law of Proximity states that objects that are near, or proximate to each other, tend to be grouped together. While 'Similarity' deals with visual characteristics, 'Proximity' is specifically about spatial placement.",
  },
  {
    correct: true,
    category: "Visual Design",
    question: "In color theory, what are 'Analogous' colours?",
    userAnswer: "Colors that sit next to each other on the color wheel.",
    correctAnswer: null,
    explanation: "Analogous color schemes use colors that are next to each other on the color wheel. They usually match well and create serene and comfortable designs.",
  },
  {
    correct: true,
    category: "Typography",
    question: "What is the recommended minimum line-height for body text to ensure readability?",
    userAnswer: "1.5",
    correctAnswer: null,
    explanation: "A line-height of 1.5 (or 150% of the font size) is widely recommended by accessibility guidelines including WCAG 2.1 for comfortable reading.",
  },
  {
    correct: false,
    category: "Usability",
    question: "Which usability principle states that users should always know where they are in a system?",
    userAnswer: "User Control",
    correctAnswer: "Visibility of System Status",
    explanation: "Nielsen's first heuristic, 'Visibility of System Status', states the system should always keep users informed about what is going on through appropriate feedback.",
  },
];

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

export default function QuizResultPage() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({0: true, 1: true, 2: true});
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? RESULTS : RESULTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f5f3ef] p-6 md:p-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a]">Congratulations, Alex!</h1>
            <p className="text-sm font-medium text-[#64748b] mt-1">
              You've completed the{" "}
              <span className="text-[#f27f0d] font-bold">Advanced UI/UX Principles</span> quiz.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[#e2e8f0] bg-white text-sm font-bold text-[#0f172a] hover:shadow-sm transition cursor-pointer">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>share</span>
              Share Results
            </button>
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition cursor-pointer">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
              Retake Quiz
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Score card ── */}
          <div className="w-full lg:w-64 shrink-0 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-5">
            <CircleProgress percent={85} />

            <div className="flex justify-around w-full border-t border-[#f1ede8] pt-4">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-black text-[#22c55e]">17/20</span>
                <span className="text-xs font-semibold text-[#94a3b8]">Correct</span>
              </div>
              <div className="w-px bg-[#f1ede8]" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-black text-[#ef4444]">3/20</span>
                <span className="text-xs font-semibold text-[#94a3b8]">Missed</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3 border-t border-[#f1ede8] pt-4">
              {[
                { icon: "timer", label: "Total Time",   value: "12m 40s" },
                { icon: "bolt",  label: "Avg. Speed",   value: "38s / q" },
                { icon: "public", label: "Global Rank", value: "#142"    },
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
              <p className="text-xs font-medium text-[#94a3b8] mt-0.5">Go through your responses and see expert explanations.</p>
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

                  {/* Explanation toggle */}
                  <button
                    className="mt-3 ml-7 text-[10px] font-bold tracking-widest uppercase text-[#f27f0d] cursor-pointer"
                    onClick={() => setExpanded((e) => ({ ...e, [i]: !e[i] }))}
                  >
                    Explanation {expanded[i] ? "▲" : "▼"}
                  </button>

                  {expanded[i] && (
                    <div className={`mt-2 ml-7 rounded-lg p-3 text-xs text-[#64748b] leading-relaxed ${r.correct ? "bg-[#f8f7f5]" : "bg-[#fff8f1]"} border-l-2 ${r.correct ? "border-[#f27f0d]" : "border-[#ef4444]"}`}>
                      {r.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!showAll && RESULTS.length > 3 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-sm font-bold text-[#f27f0d] hover:underline cursor-pointer self-center"
              >
                Load {RESULTS.length - 3} more responses
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
