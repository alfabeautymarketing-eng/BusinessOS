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

interface ProjectTheme {
  h: number;
  s: string;
  l: string;
}

interface Project {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  theme?: ProjectTheme;
  type?: string;
  url?: string;
  links?: ProjectLink[];
}

export default function TopNav({ onOpenTab, layoutMode, onLayoutChange, activeWorkspace, onWorkspaceChange }: TopNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const projects = projectsConfig.projects as Project[];
  const workspaceProjects = projects.filter((p) => p.type !== 'internal-app');
  const activeProject = projects.find(p => p.id === activeWorkspace) || projects[0];

  // Update CSS variables for dynamic theming
  useEffect(() => {
    if (activeProject && activeProject.theme) {
      const root = document.documentElement;
      root.style.setProperty('--primary-h', activeProject.theme.h.toString());
      root.style.setProperty('--primary-s', activeProject.theme.s);
      root.style.setProperty('--primary-l', activeProject.theme.l);
    }
  }, [activeProject]);

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

  return (
    <div className="relative flex items-center justify-between w-full h-full px-8 border-b border-gray-200/50 shadow-sm backdrop-blur-md bg-white/30">
      {/* Left: Logo */}
      <div className="flex items-center gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
            CA
          </div>
          <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            CareAlfa
          </div>
        </div>
      </div>

      {/* Center: Workspace Switcher */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-16 z-0">
        {workspaceProjects.map((project) => {
          const isActive = project.id === activeWorkspace;
          return (
            <button
              key={project.id}
              onClick={() => onWorkspaceChange(project.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300
                ${isActive ? 'shadow-lg scale-110' : 'hover:bg-gray-100/50'}`}
              style={{
                backgroundColor: isActive ? project.color : 'transparent',
                color: isActive ? '#fff' : 'var(--text-primary)',
              }}
            >
              {/* Circle Icon (Visible only when inactive) */}
              {!isActive && (
                <span
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: project.color,
                    boxShadow: `0 0 8px ${project.color}`
                  }}
                />
              )}

              {/* Icon (Visible only when active) */}
              {isActive && <span className="text-2xl">{project.icon}</span>}

              <span className={`text-xl ${isActive ? 'font-bold' : 'font-medium'}`}>
                {project.name}
              </span>

              {/* Dropdown Arrow */}
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ opacity: isActive ? 0.9 : 0.5 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Right: Layout Controls & Status */}
      <div className="flex items-center space-x-8 z-10">
        <div className="flex items-center bg-white/50 p-2 rounded-2xl border border-gray-200/50 backdrop-blur-sm shadow-sm">
          {[
            {
              id: 'all' as const,
              label: 'Панели слева и справа',
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                <svg width="20" height="20" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="3" width="12" height="10" rx="1.2" />
                </svg>
              ),
            },
          ].map((option) => {
            const active = layoutMode === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onLayoutChange(option.id)}
                className={`tooltip flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200
                  ${active ? 'bg-white shadow-md text-primary scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-white/30'}`}
                data-tooltip={option.label}
                style={{
                  color: active ? 'var(--primary)' : undefined
                }}
              >
                {option.icon}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span>Online</span>
        </div>

        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-md flex items-center justify-center text-lg cursor-pointer hover:scale-105 transition-transform">
          👤
        </div>
      </div>
    </div>
  );
}
