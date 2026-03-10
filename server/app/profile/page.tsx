"use client";
import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type Student = { student_id: number; name: string; email: string; phone: string };
type Class   = { class_id: number; name: string };

const COURSE_STYLES = [
    { icon: "code",      color: "bg-blue-100 text-blue-600"   },
    { icon: "psychology",color: "bg-purple-100 text-purple-600"},
    { icon: "terminal",  color: "bg-green-100 text-green-600" },
    { icon: "school",    color: "bg-yellow-100 text-yellow-600"},
    { icon: "science",   color: "bg-pink-100 text-pink-600"   },
];

export default function ProfilePage() {
    const [student, setStudent] = useState<Student | null>(null);
    const [classes, setClasses]   = useState<Class[]>([]);
    const [loading, setLoading]  = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/v1/me").then(r => r.json()),
            fetch("/api/v1/myclasses").then(r => r.json()),
        ]).then(([me, cls]) => {
            if (!me.error) setStudent(me);
            if (!cls.error) setClasses(cls.classes ?? []);
        }).finally(() => setLoading(false));
    }, []);

    const displayName = student?.name ?? "Student";
    const avatarSeed  = student ? (student.student_id % 70) + 1 : 47;

    return (
        <div>
            <Header />
            <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-8">
                <div className="flex gap-6 w-full max-w-5xl">

                    {/* ── Sidebar ── */}
                    <div className="w-72 shrink-0 bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">

                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-2 pt-2">
                            <div className="relative">
                                <img
                                    src={`https://i.pravatar.cc/96?img=${avatarSeed}`}
                                    alt={displayName}
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#f27f0d] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>check</span>
                                </span>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black text-[#0f172a]">{displayName}</p>
                                <p className="text-sm font-semibold text-[#f27f0d]">Student</p>
                                {student && <p className="text-xs font-medium text-[#94a3b8] mt-0.5">{student.email}</p>}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-around border border-[#f1ede8] rounded-xl py-3">
                            {[
                                { value: loading ? "…" : String(classes.length), label: "CLASSES" },
                                { value: "—", label: "BADGES" },
                                { value: "—", label: "RANK"  },
                            ].map((s) => (
                                <div key={s.label} className="flex flex-col items-center gap-0.5">
                                    <span className="text-lg font-black text-[#0f172a]">{s.value}</span>
                                    <span className="text-[10px] font-bold text-[#94a3b8] tracking-wide">{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Nav */}
                        <nav className="flex flex-col gap-1">
                            {[
                                { icon: "dashboard",    label: "Overview",     active: true  },
                                { icon: "school",       label: "My Classes",   active: false },
                                { icon: "emoji_events", label: "Achievements", active: false },
                                { icon: "help",         label: "Support",      active: false },
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
                                <span className="text-xs font-semibold text-[#94a3b8]">This Semester</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">

                                {/* Learning Hours */}
                                <div className="rounded-xl border border-[#f1ede8] p-4">
                                    <p className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase mb-3">Classes Enrolled</p>
                                    <div className="flex items-end gap-2 mb-3">
                                        <span className="text-2xl font-black text-[#0f172a]">{loading ? "…" : classes.length}</span>
                                        <span className="text-xs font-semibold text-green-500 mb-1">Active</span>
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
                                    <p className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase mb-3">Profile</p>
                                    <div className="flex items-end gap-2 mb-3">
                                        <span className="text-2xl font-black text-[#0f172a]">100%</span>
                                        <span className="text-xs font-semibold text-green-500 mb-1">Complete</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-[#f1ede8]">
                                        <div className="h-2 rounded-full bg-[#f27f0d]" style={{ width: "100%" }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enrolled Classes */}
                        <div>
                            <h2 className="text-base font-black text-[#0f172a] mb-4">Enrolled Classes</h2>
                            {loading ? (
                                <p className="text-sm text-[#94a3b8]">Loading…</p>
                            ) : classes.length === 0 ? (
                                <p className="text-sm text-[#94a3b8]">Not enrolled in any class yet.</p>
                            ) : (
                                <div className="flex flex-col divide-y divide-[#f8f7f5]">
                                    {classes.map((c, i) => {
                                        const style = COURSE_STYLES[i % COURSE_STYLES.length];
                                        return (
                                            <div key={c.class_id} className="flex items-center gap-4 py-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.color}`}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{style.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#0f172a] truncate">{c.name}</p>
                                                    <p className="text-xs text-[#94a3b8]">Class ID: {c.class_id}</p>
                                                </div>
                                                <span className="flex items-center gap-1 text-xs font-semibold text-[#f27f0d]">
                                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                                                    Enrolled
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Account Info */}
                        <div>
                            <h2 className="text-base font-black text-[#0f172a] mb-4">Account Info</h2>
                            <div className="flex flex-col gap-3">
                                {[
                                    { icon: "person",     label: "Name",  value: displayName             },
                                    { icon: "email",      label: "Email", value: student?.email ?? "—"   },
                                    { icon: "phone",      label: "Phone", value: student?.phone ?? "—"   },
                                ].map((row) => (
                                    <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8f7f5]">
                                        <span className="material-symbols-outlined text-[#f27f0d]" style={{ fontSize: 18 }}>{row.icon}</span>
                                        <span className="text-xs font-bold text-[#94a3b8] w-12">{row.label}</span>
                                        <span className="text-sm font-semibold text-[#0f172a]">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
