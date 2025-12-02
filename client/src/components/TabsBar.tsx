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
  const orderedTabs = activeTabId
    ? (() => {
      const active = tabs.find((t) => t.id === activeTabId);
      const rest = tabs.filter((t) => t.id !== activeTabId);
      return active ? [active, ...rest] : tabs;
    })()
    : tabs;

  return (
    <div className="flex items-center h-12 px-0 overflow-x-auto backdrop-blur-xl w-full">
      {orderedTabs.map((tab, index) => {
        const isActive = activeTabId === tab.id;
        const scaleClass = isActive ? 'scale-[1.55]' : 'scale-100';
        const paddingClass = isActive ? 'px-7 py-3' : 'px-4 py-2';
        const fontClass = isActive ? 'text-[13px]' : 'text-[12px]';
        return (
        <div
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          className={`
            relative flex items-center gap-2.5 ${paddingClass} cursor-pointer shrink-0
            transition-all duration-300 ease-out group rounded-xl border ${fontClass} ${scaleClass}
            ${isActive
            ? 'text-white border-cyan-400/60 bg-white/5 shadow-[0_12px_35px_rgba(34,211,238,0.2)]'
            : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5 hover:border-white/10'}
          `}
        >
          {/* Active Tab Glow Effect */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-purple-500/12 to-cyan-500/15 rounded-xl blur-[1px]"></div>
          )}

          <span className="text-base relative z-10">{tab.icon}</span>
          <span className="text-sm whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis font-medium relative z-10">
            {tab.title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500/30 rounded-md p-1 relative z-10 hover:scale-110"
            aria-label="Close tab"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>
      );
      })}

      {orderedTabs.length === 0 && (
        <div className="px-6 py-3 text-sm text-gray-500 font-medium">
          ✨ Выберите проект из меню выше
        </div>
      )}

      {onNewTab && orderedTabs.length > 0 && orderedTabs.length < 10 && (
        <button
          onClick={onNewTab}
          className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gradient-to-b hover:from-white/10 hover:to-white/5 transition-all duration-300 shrink-0 ml-1 rounded-lg group"
          aria-label="New tab"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="group-hover:rotate-90 transition-transform duration-300"
          >
            <path d="M8 3V13M3 8H13" />
          </svg>
        </button>
      )}
    </div>
  );
}
