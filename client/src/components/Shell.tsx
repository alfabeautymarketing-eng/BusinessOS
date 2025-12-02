import React, { ReactNode } from 'react';

interface ShellProps {
  children: ReactNode;
  sidebar: ReactNode;
  topNav: ReactNode;
}

export default function Shell({ children, sidebar, topNav }: ShellProps) {
  return (
    <div className="flex h-screen w-screen flex-col bg-gradient-to-br from-[#0f0f0f] via-[#121212] to-[#0a0a0a] text-white overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-white/5 bg-gradient-to-b from-[#1e1e1e]/80 to-[#1a1a1a]/80 backdrop-blur-xl flex items-center px-6 z-50 shadow-lg">
        {topNav}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area (The "Stage") */}
        <main className="flex-1 relative flex flex-col bg-gradient-to-br from-[#121212] to-[#0d0d0d]">
          {children}
        </main>

        {/* Right Sidebar (The "Brain") */}
        <aside className="w-[420px] border-l border-white/5 bg-gradient-to-b from-[#1a1a1a]/95 to-[#141414]/95 backdrop-blur-xl flex flex-col z-40 shadow-2xl">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
