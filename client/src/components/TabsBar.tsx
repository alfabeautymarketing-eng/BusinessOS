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

const projectColorMap = Object.fromEntries(
  (projectsConfig.projects || []).map((p: any) => [p.id, p.color])
);

const pastelForProject = (projectId?: string) => {
  const base = projectId ? projectColorMap[projectId] : undefined;
  if (!base) return { bg: 'rgba(255,255,255,0.9)', border: 'var(--border)' };
  return {
    bg: `linear-gradient(135deg, ${base}22 0%, ${base}33 100%)`,
    border: `${base}66`
  }; // light pastel gradient
};

export default function TabsBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
}: TabsBarProps) {
  return (
    <div className="flex items-end h-12 px-4 w-full border-b border-[var(--border)] gap-2 bg-[var(--background)]">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        const palette = pastelForProject(tab.projectId);
        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`
              relative flex items-center gap-3 pl-8 pr-6 py-2.5 min-w-[170px] max-w-[260px] cursor-pointer
              rounded-full transition-all duration-200 border group
              ${isActive
                ? 'shadow-sm z-10 text-[var(--text-primary)]'
                : 'bg-white/70 border-transparent hover:bg-white text-[var(--text-secondary)] shadow-sm'}
            `}
            style={{
              marginBottom: '-1px',
              height: '40px',
              background: isActive ? palette.bg : undefined,
              borderColor: isActive ? palette.border : 'var(--border)'
            }}
          >
            <span className="w-7 h-7 ml-1 flex items-center justify-center text-[15px] translate-y-[1px]">{tab.icon || '📄'}</span>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis font-semibold text-[13px] leading-tight flex-1">
              {tab.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className={`
                w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all border border-gray-200
                ${isActive ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}
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
