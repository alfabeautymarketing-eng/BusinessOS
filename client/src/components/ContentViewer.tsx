'use client';

import React from 'react';
import type { Tab } from '../hooks/useTabs';

interface ContentViewerProps {
  tab: Tab | null;
}

export default function ContentViewer({ tab }: ContentViewerProps) {
  if (!tab) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#121212] via-[#0f0f0f] to-[#0d0d0d] text-gray-400">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl"></div>
            <svg
              className="relative mx-auto w-20 h-20 opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-300 mb-2">Нет открытых вкладок</p>
          <p className="text-sm opacity-60">
            ✨ Выберите проект из меню выше
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0f0f0f] to-[#121212]">
      <iframe
        key={tab.id}
        src={tab.url}
        className="w-full h-full border-0 rounded-lg"
        allow="clipboard-read; clipboard-write; camera; microphone"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        title={tab.title}
      />

      {/* Loading indicator */}
      <div className="absolute top-5 right-5 pointer-events-none animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          </div>
          <span className="text-xs text-white font-medium">{tab.icon} {tab.title}</span>
        </div>
      </div>
    </div>
  );
}
