'use client';

import React, { useState, useRef, useEffect } from 'react';
import projectsConfig from '../config/projects.json';
import type { Tab } from '../hooks/useTabs';

interface TopNavProps {
  onOpenTab: (tab: Tab) => void;
  layoutMode: 'all' | 'center' | 'left' | 'right';
  onLayoutChange: (mode: 'all' | 'center' | 'left' | 'right') => void;
  activeWorkspace: string;
  onWorkspaceChange: (workspace: string) => void;
}

interface ProjectLink {
  id: string;
  name: string;
  type: string;
  url: string;
  sheetId?: string;
  folderId?: string;
  icon: string;
}

interface Project {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  type?: string;
  url?: string;
  links?: ProjectLink[];
}

export default function TopNav({ onOpenTab, layoutMode, onLayoutChange, activeWorkspace, onWorkspaceChange }: TopNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const dropdownElement = dropdownRefs.current.get(openDropdown);
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleWorkspaceClick = (workspaceId: string) => {
    onWorkspaceChange(workspaceId);
    setOpenDropdown(openDropdown === workspaceId ? null : workspaceId);
  };

  const handleLinkClick = (project: Project, link: ProjectLink) => {
    onOpenTab({
      id: `${project.id}-${link.id}`,
      title: `${link.name}`,
      icon: link.icon,
      type: link.type as Tab['type'],
      url: link.url,
      projectId: project.id,
      linkId: link.id,
    });
    setOpenDropdown(null);
  };

  const handleSpecialProjectClick = (project: Project) => {
    onOpenTab({
      id: project.id,
      title: project.name,
      icon: project.icon,
      type: 'cosmetic-dashboard',
      url: project.url!,
    });
  };

  const projects = projectsConfig.projects as Project[];
  const workspaceProjects = projects.filter((p) => p.type !== 'internal-app');

  return (
    <div className="flex items-center justify-between w-full h-full">
      {/* Left: Logo & Workspace Switcher */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-3 card-glass px-4 py-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
               style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)' }}>
            💼
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--text-secondary)' }}>Business</div>
            <div className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>OS</div>
          </div>
        </div>

        <div className="flex items-center space-x-2" />
      </div>

      {/* Right: Layout Controls & Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center card-glass px-2 py-1.5">
          {[
            {
              id: 'all' as const,
              label: 'Панели слева и справа',
              icon: (
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="2" y="3" width="3" height="10" rx="0.8" />
                  <rect x="6.5" y="3" width="7" height="10" rx="0.8" />
                  <rect x="14.5" y="3" width="3" height="10" rx="0.8" />
                </svg>
              ),
            },
            {
              id: 'center' as const,
              label: 'Только центральное окно',
              icon: (
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="4" y="3" width="12" height="10" rx="1.2" />
                </svg>
              ),
            },
            {
              id: 'left' as const,
              label: 'Только левая панель',
              icon: (
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="2" y="3" width="8" height="10" rx="1" />
                  <rect x="11" y="5.5" width="7" height="5" rx="0.8" />
                </svg>
              ),
            },
            {
              id: 'right' as const,
              label: 'Только правая панель',
              icon: (
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="10" y="3" width="8" height="10" rx="1" />
                  <rect x="2" y="5.5" width="7" height="5" rx="0.8" />
                </svg>
              ),
            },
          ].map((option) => {
            const active = layoutMode === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onLayoutChange(option.id)}
                className={`tooltip group relative flex items-center justify-center w-9 h-8 rounded-lg mx-0.5 transition-all duration-200 border-2
                  ${active ? '' : ''}`}
                data-tooltip={option.label}
                style={{
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  borderColor: active ? 'var(--primary)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {option.icon}
              </button>
            );
          })}
        </div>
        <div className="badge" style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--success)' }}></span>
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--success)' }}></span>
          </span>
          <span style={{ color: 'var(--text-primary)' }}>Health: Idle</span>
        </div>
        <div className="badge" style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--success)' }}></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'var(--success)' }}></span>
          </span>
          <span style={{ color: 'var(--text-primary)' }}>🌐 Система в сети</span>
        </div>
        <div className="w-10 h-10 rounded-2xl card-glass flex items-center justify-center text-lg font-bold cursor-pointer hover:scale-105 transition-all duration-300"
             style={{
               background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
               color: 'var(--text-primary)'
             }}>
          👤
        </div>
      </div>
    </div>
  );
}
