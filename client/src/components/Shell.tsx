import React, { ReactNode } from 'react';

interface ShellProps {
    children: ReactNode;
    sidebar: ReactNode;
    topNav: ReactNode;
}

export default function Shell({ children, sidebar, topNav, rightSidebar }: ShellProps & { rightSidebar?: ReactNode }) {
    const railButtons = [
        { icon: '✂️', label: 'Копировать' },
        { icon: '👁️', label: 'Просмотр' },
        { icon: '📑', label: 'Режим' },
    ];

    return (
        <div className="relative min-h-screen w-screen overflow-hidden bg-[#060910] text-white font-sans selection:bg-purple-500/40">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-40 w-[80%] bg-gradient-to-r from-cyan-500/10 via-purple-500/8 to-cyan-500/10 blur-3xl" />
            </div>

            <div className="relative flex h-screen flex-col gap-4 px-6 pt-5 pb-6">
                {/* Top Navigation Bar */}
                <header className="rounded-2xl border border-white/5 bg-gradient-to-r from-[#0f1523]/90 via-[#0d1220]/85 to-[#0b0f1b]/90 shadow-[0_10px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl px-5 h-16 flex items-center">
                    {topNav}
                </header>

                <div className="flex flex-1 gap-4 overflow-hidden">
                    {/* Icon Rail */}
                    <div className="w-16 shrink-0 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0c1424]/90 via-[#0a111d]/90 to-[#0a0d16]/90 shadow-[0_15px_50px_rgba(34,211,238,0.12)] backdrop-blur-xl flex flex-col justify-between p-3">
                        <div className="flex flex-col gap-3">
                            {railButtons.map((btn) => (
                                <button
                                    key={btn.label}
                                    className="group flex flex-col items-center justify-center gap-1 rounded-xl border border-cyan-500/20 bg-white/5 px-1.5 py-2 text-xs text-cyan-100/80 shadow-[0_6px_30px_rgba(34,211,238,0.1)] hover:border-cyan-400/50 hover:text-white hover:shadow-[0_10px_40px_rgba(34,211,238,0.2)] transition-all duration-300"
                                    title={btn.label}
                                >
                                    <span className="text-base">{btn.icon}</span>
                                    <span className="text-[10px] uppercase tracking-wide">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-2 text-[11px] font-semibold text-emerald-200 flex items-center gap-2 shadow-[0_10px_30px_rgba(52,211,153,0.15)]">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                                </span>
                                Idle
                            </div>
                            <button className="rounded-xl border border-purple-500/40 bg-purple-500/15 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-500/25 transition-colors duration-200 shadow-[0_8px_30px_rgba(168,85,247,0.25)]">
                                ★
                            </button>
                        </div>
                    </div>

                    {/* Left Sidebar (The "Brain") */}
                    <aside className="w-[340px] rounded-2xl border border-cyan-500/15 bg-gradient-to-b from-[#0f1524]/85 via-[#0c1220]/85 to-[#0a101b]/90 backdrop-blur-2xl flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-hidden">
                        {sidebar}
                    </aside>

                    {/* Main Content Area (The "Stage") */}
                    <main className="flex-1 relative flex flex-col rounded-3xl bg-[#05070e]/60 border border-white/5 shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-hidden backdrop-blur-xl">
                        {children}
                    </main>

                    {/* Right Sidebar (Scripts) */}
                    {rightSidebar && (
                        <aside className="w-[340px] rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0f1324]/85 via-[#0d1020]/85 to-[#0b0d18]/90 backdrop-blur-2xl flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-hidden">
                            {rightSidebar}
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}
