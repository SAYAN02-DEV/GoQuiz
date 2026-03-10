"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (cfg: object) => void;
                    renderButton: (el: HTMLElement, cfg: object) => void;
                };
            };
        };
    }
}

export default function LoginPage() {
    const router = useRouter();
    const googleBtnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scriptId = "google-gsi";
        if (!document.getElementById(scriptId)) {
            const s = document.createElement("script");
            s.id = scriptId;
            s.src = "https://accounts.google.com/gsi/client";
            s.async = true;
            s.defer = true;
            s.onload = initGoogle;
            document.body.appendChild(s);
        } else {
            initGoogle();
        }

        function initGoogle() {
            if (!window.google || !googleBtnRef.current) return;
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                callback: async ({ credential }: { credential: string }) => {
                    const res = await fetch("/api/v1/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_token: credential }),
                    });
                    if (res.ok) {
                        router.push("/dashboard");
                    } else {
                        const err = await res.json();
                        alert(err.error ?? "Login failed");
                    }
                },
            });
            window.google.accounts.id.renderButton(googleBtnRef.current!, {
                theme: "outline",
                size: "large",
                width: googleBtnRef.current!.offsetWidth || 340,
            });
        }
    }, [router]);

  return (
    <div className="flex w-full min-h-screen">

      {/* ── Left: Login Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-12 py-16 bg-[#f8f7f5]">
        <div className="w-full max-w-sm flex flex-col gap-8">

          {/* Logo */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#f27f0d] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
              </div>
              <span className="text-2xl font-black text-[#f27f0d]">GoQuiz</span>
            </div>
            <h1 className="text-3xl font-black text-[#0f172a] mt-2">Welcome back</h1>
            <p className="text-sm font-medium text-[#64748b]">Sign in to continue your learning journey.</p>
          </div>

          {/* Google Sign-In */}
          <div className="flex flex-col gap-3">
            <div ref={googleBtnRef} className="w-full" />
          </div>

          <p className="text-xs text-center text-[#94a3b8]">
            By continuing, you agree to our{" "}
            <a href="#" className="text-[#f27f0d] font-semibold hover:underline">Terms</a>{" "}
            and{" "}
            <a href="#" className="text-[#f27f0d] font-semibold hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* ── Right: Image Panel ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#221910]">
        <Image
          src="/loginimage.png"
          alt="Learning illustration"
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f27f0d]/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="text-3xl font-black leading-tight">Master any subject with AI-powered quizzes.</p>
          <p className="mt-3 text-sm font-medium text-white/70">Join 10,000+ learners already on QuizAI.</p>
        </div>
      </div>

    </div>
  );
}
