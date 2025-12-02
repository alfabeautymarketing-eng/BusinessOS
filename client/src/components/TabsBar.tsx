'use client';

import React from 'react';
import type { Tab } from '../hooks/useTabs';

interface TabsBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab?: () => void;
}

export default function TabsBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
}: TabsBarProps) {
  return (
    <div className="flex items-center h-10 bg-[#1a1a1a] border-b border-[#2a2a2a] overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 cursor-pointer shrink-0
            border-r border-[#2a2a2a] transition-colors group
            ${
              activeTabId === tab.id
                ? 'bg-[#121212] text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
            }
          `}
        >
          <span className="text-sm">{tab.icon}</span>
          <span className="text-sm whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis">
            {tab.title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 rounded p-0.5"
            aria-label="Close tab"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>
      ))}

      {tabs.length === 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">
          Выберите проект из меню выше
        </div>
      )}

      {onNewTab && tabs.length > 0 && tabs.length < 10 && (
        <button
          onClick={onNewTab}
          className="px-3 py-2 text-gray-400 hover:text-white hover:bg-[#252525] transition-colors shrink-0"
          aria-label="New tab"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M8 3V13M3 8H13" />
          </svg>
        </button>
      )}
    </div>
  );
}
