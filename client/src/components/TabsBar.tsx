'use client';

import React from 'react';
import type { Tab } from '../hooks/useTabs';
import { X } from 'lucide-react';
import projectsConfig from '../config/projects.json';

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
  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-1 mb-2 overflow-x-auto no-scrollbar py-1">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`
              group flex items-center gap-2 px-4 py-2 cursor-pointer
              rounded-full transition-all duration-300 font-medium text-sm
              ${isActive
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-lg scale-105'
                : 'bg-white/40 hover:bg-white/60 text-[var(--text-secondary)] border border-transparent hover:border-white/40 hover:shadow-sm'}
            `}
          >
            <span className="text-base opacity-90">{tab.icon || '📄'}</span>
            <span className="whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">
              {tab.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className={`
                p-0.5 rounded-full ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200
                ${isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-black/5 text-gray-500'}
              `}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
