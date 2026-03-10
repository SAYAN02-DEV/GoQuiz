"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
    const router = useRouter();
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/v1/me")
            .then(r => r.ok ? r.json() : null)
            .then(d => { setName((d && !d.error) ? d.name : ""); });
    }, []);

    async function handleLogout() {
        await fetch("/api/v1/logout", { method: "POST" });
        router.push("/home");
    }

    const loggedIn = !!name;

    return (
        <header className="bg-white border-b border-[#f1ede8] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/home")}>
                <div className="w-8 h-8 rounded-lg bg-[#f27f0d] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                </div>
                <span className="text-xl font-black text-[#f27f0d]">GoQuiz</span>
            </div>
            <div className="flex items-center gap-4">
                {name === null ? null : loggedIn ? (
                    <>
                        <button
                            onClick={() => router.push("/profile")}
                            className="flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] transition cursor-pointer"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>account_circle</span>
                            {name}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-[#e2e8f0] text-sm font-bold text-[#64748b] hover:bg-[#f8fafc] transition cursor-pointer"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => router.push("/select-role")}
                        className="h-9 px-5 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition cursor-pointer"
                    >
                        Login
                    </button>
                )}
            </div>
        </header>
    );
}
