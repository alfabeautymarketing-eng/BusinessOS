import React, { ReactNode } from 'react';

interface ShellProps {
  children: ReactNode;
  sidebar: ReactNode;
  topNav: ReactNode;
}

export default function Shell({ children, sidebar, topNav }: ShellProps) {
  return (
    <div className="flex h-screen w-screen flex-col bg-[#121212] text-white overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="h-12 border-b border-gray-800 bg-[#1a1a1a] flex items-center px-4 z-50">
        {topNav}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area (The "Stage") */}
        <main className="flex-1 relative flex flex-col">
          {children}
        </main>

        {/* Right Sidebar (The "Brain") */}
        <aside className="w-[400px] border-l border-gray-800 bg-[#1a1a1a] flex flex-col z-40">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
