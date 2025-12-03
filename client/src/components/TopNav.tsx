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
  const workspaceSlots: (Project | null)[] = workspaceProjects.flatMap((p, idx) =>
    idx === workspaceProjects.length - 1 ? [p] : [p, null]
  );

  const handleWorkspaceClick = (projectId: string) => {
    onWorkspaceChange(projectId);
    setOpenDropdown((prev) => (prev === projectId ? null : projectId));
  };

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
    <div className="relative flex items-center justify-between w-full h-full px-8 border-b border-gray-200/50 shadow-sm backdrop-blur-md bg-white/30 overflow-visible">
      {/* Left: Logo */}
      <div className="flex items-center gap-4 z-10 min-w-[220px]">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
          CA
        </div>
        <div className="text-3xl font-bold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
          CareAlfa
        </div>
      </div>

      {/* Center: Workspace Switcher */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 z-20 overflow-visible">
        {workspaceSlots.map((project, idx) => {
          if (!project) {
            return <div key={`spacer-${idx}`} className="w-60 h-[52px]" aria-hidden="true" />;
          }
          const isActive = project.id === activeWorkspace;
          const isOpen = openDropdown === project.id;

          return (
            <div key={project.id} className="relative" ref={(el) => { if (el) dropdownRefs.current.set(project.id, el); }}>
              <button
                onClick={() => handleWorkspaceClick(project.id)}
                className={`flex items-center w-60 px-4 py-3 rounded-full transition-all duration-300
                  ${isActive ? 'shadow-lg scale-105' : 'hover:bg-gray-100/50 border border-gray-200/30'}`}
                style={{
                  backgroundColor: isActive ? project.color : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-primary)',
                }}
              >
                {/* Content Container with Left Padding (3 spaces approx) */}
                <div className="flex items-center gap-3 pl-4 flex-1">
                  {/* Circle Icon (Visible only when inactive) */}
                  {!isActive && (
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{
                        backgroundColor: project.color,
                        boxShadow: `0 0 8px ${project.color}`
                      }}
                    />
                  )}

                  {/* Icon (Visible only when active) */}
                  {isActive && <span className="text-2xl shrink-0">{project.icon}</span>}

                  <span className={`text-xl truncate ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {project.name}
                  </span>
                </div>

                {/* Dropdown Arrow Trigger */}
                <div
                  className={`p-1 rounded-full transition-colors ${isActive ? 'hover:bg-white/20' : 'hover:bg-gray-200/50'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(isOpen ? null : project.id);
                  }}
                >
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ opacity: isActive ? 0.9 : 0.5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div
                  className="absolute top-full mt-3 w-64 rounded-2xl shadow-xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 p-2"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--surface-glass)',
                    backdropFilter: 'blur(18px)',
                    borderColor: 'var(--border)',
                    boxShadow: 'var(--shadow-xl)'
                  }}
              >
                  {project.links?.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.name}</span>
                    </a>
                  ))}
                  {(!project.links || project.links.length === 0) && (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center italic">
                      Нет ссылок
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {/* Spacer equal to one button between first and second */}
        <div className="w-60 h-[52px]" aria-hidden="true" />
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
