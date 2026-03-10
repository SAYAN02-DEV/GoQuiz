import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f3ef] flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-[#f1ede8] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f27f0d] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
          </div>
          <span className="text-xl font-black text-[#f27f0d]">GoQuiz</span>
        </div>
        <Link
          href="/select-role"
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#f27f0d] text-white text-sm font-bold hover:bg-[#e0720a] transition"
        >
          Login
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff4e8] text-[#f27f0d] text-xs font-bold mb-6">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bolt</span>
          Fast · Fun · Effective
        </div>
        <h1 className="text-5xl font-black text-[#0f172a] leading-tight max-w-2xl">
          Quiz smarter,<br />
          <span className="text-[#f27f0d]">learn faster.</span>
        </h1>
        <p className="mt-6 text-lg text-[#64748b] font-medium max-w-xl">
          GoQuiz lets educators create powerful quizzes and students compete live or on their own schedule.
        </p>
        <div className="mt-10 flex gap-4 flex-wrap justify-center">
          <Link
            href="/select-role"
            className="h-12 px-8 rounded-xl bg-[#f27f0d] text-white font-bold text-base hover:bg-[#e0720a] transition"
          >
            Get Started
          </Link>
          <a
            href="#features"
            className="h-12 px-8 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] font-bold text-base hover:shadow-sm transition"
          >
            Learn More
          </a>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto w-full px-6 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: "live_tv",    title: "Live Quizzes",      desc: "Real-time competitive quizzes with a live leaderboard." },
          { icon: "quiz",       title: "Past Quizzes",      desc: "Students attempt quizzes at their own pace anytime." },
          { icon: "leaderboard",title: "Leaderboards",      desc: "Track scores and rankings after every quiz." },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff4e8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#f27f0d]" style={{ fontSize: 22 }}>{f.icon}</span>
            </div>
            <h3 className="font-black text-[#0f172a]">{f.title}</h3>
            <p className="text-sm text-[#64748b] font-medium">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
