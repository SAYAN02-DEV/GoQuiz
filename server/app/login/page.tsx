import Image from "next/image";

export default function LoginPage() {
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

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border border-[#e2e8f0] bg-white font-semibold text-sm text-[#0f172a] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border border-[#e2e8f0] bg-white font-semibold text-sm text-[#0f172a] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>

            <button className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border border-[#e2e8f0] bg-white font-semibold text-sm text-[#0f172a] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
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
