import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function ProfilePage() {
  const courses = [
    { icon: "code", color: "bg-blue-100 text-blue-600",   name: "Advanced Data Structures",    code: "CS-401", progress: 85,  done: false },
    { icon: "psychology", color: "bg-purple-100 text-purple-600", name: "Artificial Intelligence Basics", code: "CS-320", progress: 42,  done: false },
    { icon: "terminal", color: "bg-green-100 text-green-600",  name: "Shell Scripting Essentials",    code: "CS-230", progress: 100, done: true },
  ];

  return (
    <div>
        <Header/>
    <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-8">
      <div className="flex gap-6 w-full max-w-5xl">

        {/* ── Sidebar ── */}
        <div className="w-72 shrink-0 bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="relative">
              <img
                src="https://i.pravatar.cc/96?img=47"
                alt="Alex Rivers"
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#f27f0d] flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>check</span>
              </span>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-[#0f172a]">Alex Rivers</p>
              <p className="text-sm font-semibold text-[#f27f0d]">Computer Science Senior</p>
              <p className="text-xs font-medium text-[#94a3b8] mt-0.5">San Francisco, CA</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-around border border-[#f1ede8] rounded-xl py-3">
            {[{ value: "3.8", label: "GPA" }, { value: "12", label: "COURSES" }, { value: "4", label: "BADGES" }].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-black text-[#0f172a]">{s.value}</span>
                <span className="text-[10px] font-bold text-[#94a3b8] tracking-wide">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Edit button */}
          <button className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#f27f0d] text-white text-sm font-bold cursor-pointer hover:bg-[#e0720a] transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
            Edit Profile
          </button>

          {/* Nav */}
          <nav className="flex flex-col gap-1">
            {[
              { icon: "dashboard",     label: "Overview",      active: true  },
              { icon: "school",        label: "My Learning",   active: false },
              { icon: "emoji_events",  label: "Achievements",  active: false },
              { icon: "chat",          label: "Messages",      active: false },
              { icon: "help",          label: "Support",       active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer w-full ${
                  item.active
                    ? "bg-[#fff4e8] text-[#f27f0d]"
                    : "text-[#64748b] hover:bg-[#f8f7f5]"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-8">

          {/* Tabs */}
          <div className="flex gap-6 border-b border-[#f1ede8]">
            {["Insights", "Activity", "Settings"].map((tab) => (
              <button
                key={tab}
                className={`pb-3 text-sm font-bold cursor-pointer transition-colors ${
                  tab === "Insights"
                    ? "border-b-2 border-[#f27f0d] text-[#f27f0d]"
                    : "text-[#94a3b8] hover:text-[#64748b]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Academic Progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-[#0f172a]">Academic Progress</h2>
              <span className="text-xs font-semibold text-[#94a3b8]">Spring Semester 2024</span>
            </div>
            <div className="grid grid-cols-2 gap-4">

              {/* Learning Hours */}
              <div className="rounded-xl border border-[#f1ede8] p-4">
                <p className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase mb-3">Learning Hours</p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-2xl font-black text-[#0f172a]">124.5</span>
                  <span className="text-xs font-semibold text-green-500 mb-1">↑ 12%</span>
                </div>
                <div className="flex items-end gap-1 h-10">
                  {[40, 55, 45, 65, 50, 70, 90].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${i === 6 ? "bg-[#f27f0d]" : "bg-[#fde8cc]"}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Completion Rate */}
              <div className="rounded-xl border border-[#f1ede8] p-4">
                <p className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase mb-3">Completion Rate</p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-2xl font-black text-[#0f172a]">92%</span>
                  <span className="text-xs font-semibold text-green-500 mb-1">On Track</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f1ede8]">
                  <div className="h-2 rounded-full bg-[#f27f0d]" style={{ width: "92%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Courses */}
          <div>
            <h2 className="text-base font-black text-[#0f172a] mb-4">Recent Courses</h2>
            <div className="flex flex-col divide-y divide-[#f8f7f5]">
              {courses.map((c) => (
                <div key={c.code} className="flex items-center gap-4 py-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{c.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0f172a] truncate">{c.name}</p>
                    <p className="text-xs text-[#94a3b8]">{c.code} · Progress: {c.progress}%</p>
                  </div>
                  {c.done ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                      Completed
                    </span>
                  ) : (
                    <button className="text-xs font-bold text-[#f27f0d] hover:underline cursor-pointer">Continue</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div>
            <h2 className="text-base font-black text-[#0f172a] mb-4">Upcoming Milestones</h2>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center w-10 shrink-0">
                <span className="text-[10px] font-bold text-[#f27f0d] tracking-widest uppercase">MAY</span>
                <span className="text-2xl font-black text-[#f27f0d] leading-none">12</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0f172a]">UI/UX Design Workshop</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">Interactive session with industry mentors</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <Footer/>
    </div>
  );
}
