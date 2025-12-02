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
    <div className="flex items-center h-12 px-0 overflow-x-auto w-full no-scrollbar">
      {orderedTabs.map((tab, index) => {
        const isActive = activeTabId === tab.id;
        const scaleClass = isActive ? 'scale-105' : 'scale-100';
        const paddingClass = isActive ? 'px-6 py-2.5' : 'px-4 py-2';
        const fontClass = isActive ? 'text-sm' : 'text-[13px]';
        return (
        <div
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          className={`
            relative flex items-center gap-2.5 ${paddingClass} cursor-pointer shrink-0
            transition-all duration-300 ease-out group rounded-xl border-2 ${fontClass} ${scaleClass} mr-2
            ${isActive ? 'card-glass' : ''}
          `}
          style={{
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderColor: isActive ? 'var(--primary)' : 'transparent',
            backgroundColor: isActive ? 'var(--surface-glass)' : 'transparent',
            boxShadow: isActive ? 'var(--shadow-md)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'var(--surface-glass)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }
          }}
        >
          <span className="text-base relative z-10">{tab.icon}</span>
          <span className="whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis font-medium relative z-10">
            {tab.title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-md p-1 relative z-10 hover:scale-110"
            style={{
              color: 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
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
        <div className="px-6 py-3 text-sm font-medium card-glass inline-flex items-center gap-2">
          <span className="text-base">✨</span>
          <span style={{ color: 'var(--text-secondary)' }}>Выберите проект из меню выше</span>
        </div>
      )}

      {onNewTab && orderedTabs.length > 0 && orderedTabs.length < 10 && (
        <button
          onClick={onNewTab}
          className="px-4 py-2 transition-all duration-300 shrink-0 ml-1 rounded-lg group card-glass border-2"
          style={{
            color: 'var(--text-secondary)',
            borderColor: 'var(--border)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary)';
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-glass)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
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
