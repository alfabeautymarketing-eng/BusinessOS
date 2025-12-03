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
    <div className="flex items-center h-10 px-3 w-full border-b gap-1.5"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
        backdropFilter: 'blur(10px)'
      }}>
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        const palette = pastelForProject(tab.projectId);
        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`
              relative flex items-center gap-2 px-3 py-1.5 min-w-[140px] max-w-[220px] cursor-pointer
              rounded-lg transition-all duration-200 border group
              ${isActive
                ? 'shadow-sm z-10'
                : 'hover:bg-white/50 hover:shadow-sm'}
            `}
            style={{
              height: '32px',
              background: isActive ? palette.bg : 'transparent',
              borderColor: isActive ? palette.border : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <span className="flex items-center justify-center text-sm flex-shrink-0">{tab.icon || '📄'}</span>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis font-semibold text-xs leading-tight flex-1">
              {tab.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-black/10"
            >
              <X size={10} strokeWidth={2.5} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        );
      })}

      {tabs.length === 0 && (
        <div className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
          Нет открытых вкладок
        </div>
      )}
    </div>
  );
}
