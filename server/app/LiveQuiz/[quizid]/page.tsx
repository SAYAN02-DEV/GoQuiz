"use client";
import { useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";


const QUESTIONS = [
  {
    category: "Atmospheric Science",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    text: "Which of these atmospheric phenomena is primarily responsible for the vibrant red and orange colors observed during a sunset?",
    hint: "Select the most scientifically accurate explanation from the options below.",
    options: [
      { id: "A", text: "Rayleigh scattering of shorter wavelengths" },
      { id: "B", text: "Mie scattering by aerosols and dust particles" },
      { id: "C", text: "Total internal reflection within water droplets" },
      { id: "D", text: "The Greenhouse Effect trapping solar radiation" },
    ],
  },
  {
    category: "Biology",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
    text: "Which organelle is primarily responsible for ATP production through cellular respiration?",
    hint: "Think about where most of the cell's energy is generated.",
    options: [
      { id: "A", text: "Nucleus" },
      { id: "B", text: "Ribosome" },
      { id: "C", text: "Mitochondria" },
      { id: "D", text: "Golgi apparatus" },
    ],
  },
  {
    category: "Physics",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
    text: "What is the escape velocity from the surface of Earth approximately equal to?",
    hint: "This is the minimum speed needed to break free from Earth's gravitational pull.",
    options: [
      { id: "A", text: "7.9 km/s" },
      { id: "B", text: "11.2 km/s" },
      { id: "C", text: "17.5 km/s" },
      { id: "D", text: "29.8 km/s" },
    ],
  },
  {
    category: "Chemistry",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
    text: "Which element has the highest electronegativity on the Pauling scale?",
    hint: "It is a halogen in period 2 of the periodic table.",
    options: [
      { id: "A", text: "Oxygen" },
      { id: "B", text: "Chlorine" },
      { id: "C", text: "Nitrogen" },
      { id: "D", text: "Fluorine" },
    ],
  },
  {
    category: "World History",
    image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&q=80",
    text: "The Treaty of Westphalia (1648) is considered a foundational moment in the development of which concept?",
    hint: "It established principles still underlying modern international relations.",
    options: [
      { id: "A", text: "Democracy" },
      { id: "B", text: "Nation-state sovereignty" },
      { id: "C", text: "Free trade" },
      { id: "D", text: "Human rights law" },
    ],
  },
  {
    category: "Mathematics",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    text: "What is the sum of interior angles of a convex polygon with 10 sides (decagon)?",
    hint: "Use the formula (n − 2) × 180°.",
    options: [
      { id: "A", text: "1260°" },
      { id: "B", text: "1440°" },
      { id: "C", text: "1620°" },
      { id: "D", text: "1800°" },
    ],
  },
  {
    category: "Computer Science",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    text: "What is the time complexity of binary search on a sorted array of n elements?",
    hint: "The search space halves with each comparison.",
    options: [
      { id: "A", text: "O(n)" },
      { id: "B", text: "O(n²)" },
      { id: "C", text: "O(log n)" },
      { id: "D", text: "O(n log n)" },
    ],
  },
  {
    category: "Geography",
    image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&q=80",
    text: "Which river carries the largest volume of freshwater discharge into the ocean?",
    hint: "It flows through the world's largest tropical rainforest.",
    options: [
      { id: "A", text: "Nile" },
      { id: "B", text: "Yangtze" },
      { id: "C", text: "Amazon" },
      { id: "D", text: "Mississippi" },
    ],
  },
  {
    category: "Astronomy",
    image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80",
    text: "What type of celestial object is Sagittarius A*, located at the centre of the Milky Way?",
    hint: "It has a mass approximately 4 million times that of the Sun.",
    options: [
      { id: "A", text: "Neutron star" },
      { id: "B", text: "Supermassive black hole" },
      { id: "C", text: "Quasar" },
      { id: "D", text: "White dwarf" },
    ],
  },
  {
    category: "Economics",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    text: "The concept of 'invisible hand' in free-market economics was introduced by which economist?",
    hint: "He wrote 'The Wealth of Nations' in 1776.",
    options: [
      { id: "A", text: "John Maynard Keynes" },
      { id: "B", text: "Milton Friedman" },
      { id: "C", text: "Adam Smith" },
      { id: "D", text: "David Ricardo" },
    ],
  },
];

export default function LiveQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const total = QUESTIONS.length;
  const question = QUESTIONS[currentIndex];
  const selected = answers[currentIndex] ?? null;
  const progress = ((currentIndex + 1) / total) * 100;
  const remaining = total - (currentIndex + 1);

  const select = (id: string) => setAnswers((a) => ({ ...a, [currentIndex]: id }));
  const goNext = () => { if (currentIndex < total - 1) setCurrentIndex((i) => i + 1); };
  const goPrev = () => { if (currentIndex > 0) setCurrentIndex((i) => i - 1); };

  return (
    <div>
        <Header/>
    <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm overflow-hidden">

        {/* ── Top bar: progress + timer ── */}
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

          {/* Timer */}
          <div className="flex items-center gap-1 shrink-0 border border-[#f1ede8] rounded-2xl px-4 py-2">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-[#f27f0d]">12</span>
              <span className="text-[9px] font-bold text-[#94a3b8] tracking-widest uppercase">Mins</span>
            </div>
            <span className="text-xl font-black text-[#f27f0d] mb-3">:</span>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-[#f27f0d]">45</span>
              <span className="text-[9px] font-bold text-[#94a3b8] tracking-widest uppercase">Secs</span>
            </div>
          </div>
        </div>

        {/* ── Question image ── */}
        <div className="relative mx-4">
          <img src={question.image} alt="Question visual" className="w-full h-52 object-cover rounded-2xl" />
          <div className="absolute bottom-4 left-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#f27f0d] text-white text-xs font-bold mb-2">
              {question.category}
            </span>
            <h2 className="text-white text-2xl font-black drop-shadow-lg">Question {currentIndex + 1}</h2>
          </div>
        </div>

        {/* ── Question text ── */}
        <div className="px-6 pt-5 pb-3">
          <p className="text-[#0f172a] text-base font-bold leading-snug">{question.text}</p>
          <p className="mt-1.5 text-xs font-medium text-[#94a3b8] italic">{question.hint}</p>
        </div>

        {/* ── Options ── */}
        <div className="px-6 flex flex-col gap-2.5 pb-4">
          {question.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => select(opt.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#f27f0d] bg-[#fff4e8] text-[#0f172a]"
                    : "border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#f27f0d]/40"
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  isSelected ? "bg-[#f27f0d] text-white" : "bg-[#f1ede8] text-[#64748b]"
                }`}>
                  {opt.id}
                </span>
                {opt.text}
              </button>
            );
          })}
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-[#f1ede8]">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 text-sm font-bold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === total - 1}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentIndex === total - 1 ? "Submit Quiz" : "Next Question →"}
          </button>
        </div>

      </div>
    </div>
    <Footer/>
    </div>
  );
}
