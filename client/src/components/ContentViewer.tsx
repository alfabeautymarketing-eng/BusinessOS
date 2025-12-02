'use client';

import React from 'react';
import type { Tab } from '../hooks/useTabs';

interface ContentViewerProps {
  tab: Tab | null;
}

export default function ContentViewer({ tab }: ContentViewerProps) {
  if (!tab) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#0a0f1c] via-[#070c16] to-[#060a12] text-gray-300">
        <div className="text-center space-y-2">
          <p className="text-sm tracking-[0.2em] uppercase text-gray-500">Нет активных окон</p>
          <p className="text-lg font-semibold">Откройте вкладку в верхнем меню</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#090f1a] via-[#070c16] to-[#060a12]">
      <iframe
        key={tab.id}
        src={tab.url}
        className="w-full h-full border-0"
        allow="clipboard-read; clipboard-write; camera; microphone"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        title={tab.title}
      />
    </div>
  );
}
