"use client";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#f5f3ef] flex flex-col items-center justify-center px-6">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
                <div className="w-9 h-9 rounded-lg bg-[#f27f0d] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                </div>
                <span className="text-2xl font-black text-[#f27f0d]">GoQuiz</span>
            </div>

            <h1 className="text-3xl font-black text-[#0f172a] mb-2 text-center">Who are you?</h1>
            <p className="text-sm font-medium text-[#64748b] mb-10 text-center">Choose your role to continue.</p>

            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
                {/* Student */}
                <button
                    onClick={() => router.push("/login")}
                    className="flex-1 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-[#f27f0d] p-8 flex flex-col items-center gap-4 transition-all cursor-pointer group"
                >
                    <div className="w-16 h-16 rounded-2xl bg-[#fff4e8] flex items-center justify-center group-hover:bg-[#f27f0d] transition-colors">
                        <span className="material-symbols-outlined text-[#f27f0d] group-hover:text-white transition-colors" style={{ fontSize: 32 }}>school</span>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-black text-[#0f172a]">Student</p>
                        <p className="text-xs font-medium text-[#94a3b8] mt-1">Take quizzes &amp; track your progress</p>
                    </div>
                </button>

                {/* Educator */}
                <button
                    onClick={() => router.push("/educater/login")}
                    className="flex-1 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-[#f27f0d] p-8 flex flex-col items-center gap-4 transition-all cursor-pointer group"
                >
                    <div className="w-16 h-16 rounded-2xl bg-[#fff4e8] flex items-center justify-center group-hover:bg-[#f27f0d] transition-colors">
                        <span className="material-symbols-outlined text-[#f27f0d] group-hover:text-white transition-colors" style={{ fontSize: 32 }}>cast_for_education</span>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-black text-[#0f172a]">Educator</p>
                        <p className="text-xs font-medium text-[#94a3b8] mt-1">Create classes, quizzes &amp; manage results</p>
                    </div>
                </button>
            </div>

            <button
                onClick={() => router.push("/")}
                className="mt-8 text-sm font-semibold text-[#94a3b8] hover:text-[#64748b] transition cursor-pointer"
            >
                ← Back to Home
            </button>
        </div>
    );
}
