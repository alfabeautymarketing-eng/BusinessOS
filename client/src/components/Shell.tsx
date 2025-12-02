import React, { ReactNode } from 'react';

interface ShellProps {
    children: ReactNode;
    sidebar: ReactNode;
    topNav: ReactNode;
}

export default function Shell({ children, sidebar, topNav, rightSidebar }: ShellProps & { rightSidebar?: ReactNode }) {
    return (
        <div className="flex h-screen w-screen flex-col bg-[#0a0a0a] text-white overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Top Navigation Bar */}
            <header className="h-14 border-b border-white/5 bg-[#121212]/80 backdrop-blur-xl flex items-center px-6 z-50">
                {topNav}
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar (The "Brain") */}
                <aside className="w-[380px] border-r border-white/5 bg-[#121212]/50 backdrop-blur-xl flex flex-col z-40">
                    {sidebar}
                </aside>

                {/* Main Content Area (The "Stage") */}
                <main className="flex-1 relative flex flex-col bg-[#0a0a0a]">
                    {children}
                </main>

                {/* Right Sidebar (Scripts) */}
                {rightSidebar && (
                    <aside className="w-[300px] border-l border-white/5 bg-[#121212]/50 backdrop-blur-xl flex flex-col z-40">
                        {rightSidebar}
                    </aside>
                )}
            </div>
        </div>
    );
}
