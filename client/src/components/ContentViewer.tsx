'use client';

import React from 'react';
import type { Tab } from '../hooks/useTabs';

interface ContentViewerProps {
  tab: Tab | null;
}

export default function ContentViewer({ tab }: ContentViewerProps) {
  if (!tab) {
    return (
      <div className="flex items-center justify-center h-full bg-[#121212] text-gray-400">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 w-16 h-16 opacity-30"
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
          <p className="text-lg">Нет открытых вкладок</p>
          <p className="text-sm mt-2 opacity-60">
            Выберите проект из меню выше
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#121212]">
      <iframe
        key={tab.id}
        src={tab.url}
        className="w-full h-full border-0"
        allow="clipboard-read; clipboard-write; camera; microphone"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        title={tab.title}
      />

      {/* Loading indicator */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-white">{tab.icon} {tab.title}</span>
        </div>
      </div>
    </div>
  );
}
