'use client';

import React from 'react';
import type { Tab } from '../hooks/useTabs';
import { X } from 'lucide-react';

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
    <div className="flex items-end h-10 px-4 w-full border-b border-[var(--border)] gap-1 bg-[var(--background)]">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 min-w-[160px] max-w-[240px] cursor-pointer
              rounded-t-xl transition-all duration-200 border-t border-x group
              ${isActive
                ? 'bg-white border-[var(--border)] shadow-sm z-10'
                : 'bg-gray-50 border-transparent hover:bg-gray-100 text-[var(--text-secondary)]'}
            `}
            style={{
              marginBottom: '-1px', // Merge with bottom border
              borderBottom: isActive ? '1px solid white' : '1px solid var(--border)',
              height: '100%'
            }}
          >
            <span className="text-base">{tab.icon || '📄'}</span>
            <span className={`whitespace-nowrap overflow-hidden text-ellipsis font-medium text-xs flex-1 ${isActive ? 'text-[var(--text-primary)]' : ''}`}>
              {tab.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className={`
                p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all
                ${isActive ? 'hover:bg-gray-100' : 'hover:bg-gray-200'}
              `}
            >
              <X size={12} className="text-gray-500" />
            </button>
          </div>
        );
      })}

      {tabs.length === 0 && (
        <div className="text-xs text-gray-400 px-2 pb-2 italic">
          Нет открытых вкладок
        </div>
      )}
    </div>
  );
}
