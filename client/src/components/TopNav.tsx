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
  const specialProjects = projects.filter((p) => p.type === 'internal-app');

  const layoutOptions: { id: TopNavProps['layoutMode']; label: string; icon: JSX.Element }[] = [
    {
      id: 'all',
      label: 'Панели слева и справа',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="3" height="12" rx="1.2" />
          <rect x="6" y="3" width="6" height="12" rx="1.2" />
          <rect x="13" y="3" width="3" height="12" rx="1.2" />
        </svg>
      ),
    },
    {
      id: 'center',
      label: 'Только центральное окно',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="3" width="10" height="12" rx="1.4" />
        </svg>
      ),
    },
    {
      id: 'left',
      label: 'Только левая панель',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="6" height="12" rx="1.2" />
          <rect x="9" y="6" width="7" height="6" rx="1.1" />
        </svg>
      ),
    },
    {
      id: 'right',
      label: 'Только правая панель',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="10" y="3" width="6" height="12" rx="1.2" />
          <rect x="2" y="6" width="7" height="6" rx="1.1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-between w-full h-full">
      {/* Left: Logo & Workspace Switcher */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-lg shadow-[0_0_25px_rgba(34,211,238,0.55)]">
            B
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-[0.28em] text-gray-400">Business</div>
            <div className="text-sm font-semibold text-white tracking-wide">OS</div>
          </div>
        </div>

        <nav className="flex items-center space-x-1">
          {/* Workspace Switcher Buttons */}
          {workspaceProjects.map((project) => {
            const isActive = activeWorkspace === project.id;
            return (
              <div
                key={project.id}
                ref={(el) => {
                  if (el) dropdownRefs.current.set(project.id, el);
                }}
                className="relative"
              >
                <button
                  onClick={() => handleWorkspaceClick(project.id)}
                  className={`group px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border
                    ${isActive
                      ? `text-white shadow-lg`
                      : 'text-gray-300 border-white/5 bg-white/5 hover:border-opacity-30 hover:text-white hover:bg-white/10'}`}
                  style={{
                    color: isActive ? project.color : undefined,
                    borderColor: isActive ? `${project.color}70` : undefined,
                    backgroundColor: isActive ? `${project.color}15` : undefined,
                    boxShadow: isActive ? `0 10px 35px -10px ${project.color}80` : undefined
                  }}
                >
                  <span className="text-base drop-shadow">{project.icon}</span>
                  <span>{project.name}</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${openDropdown === project.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {openDropdown === project.id && project.links && (
                  <div
                    className="absolute top-full left-0 mt-2 w-64 bg-gradient-to-b from-[#151a26]/95 to-[#0f1420]/95 border border-white/10 rounded-2xl shadow-2xl z-50 backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{
                      borderTopWidth: '2px',
                      borderTopColor: project.color,
                      boxShadow: `0 20px 60px -10px ${project.color}50`
                    }}
                  >
                    <div className="py-2">
                      {project.links.map((link) => (
                        <button
                          key={link.id}
                          onClick={() => handleLinkClick(project, link)}
                          className="w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent hover:text-white flex items-center gap-3.5 transition-all duration-200 group"
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform duration-200">{link.icon}</span>
                          <span className="font-medium">{link.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Separator */}
          {specialProjects.length > 0 && <div className="w-px h-5 bg-white/10 mx-3"></div>}

          {/* Special Projects (Internal Apps) - Added at the end */}
          {specialProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleSpecialProjectClick(project)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-pink-200 hover:text-pink-100 bg-pink-500/10 hover:bg-pink-500/20 transition-all duration-300 border border-pink-500/30 hover:border-pink-500/60 flex items-center gap-2 shadow-[0_10px_40px_rgba(236,72,153,0.2)]"
            >
              <span className="text-base">{project.icon}</span>
              <span>{project.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right: Layout Controls & Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          {layoutOptions.map((option) => {
            const active = layoutMode === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onLayoutChange(option.id)}
                className={`group relative flex items-center justify-center w-9 h-8 rounded-lg mx-0.5 transition-all duration-200
                  ${active ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 shadow-[0_10px_25px_rgba(34,211,238,0.18)]' : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'}
                `}
              >
                {option.icon}
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-9 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-150 border border-white/10">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-[11px] font-semibold text-emerald-200 shadow-[0_10px_30px_rgba(52,211,153,0.18)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          </span>
          Health: Idle
        </div>
        <div className="flex items-center space-x-2.5 px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-full border border-green-500/30 backdrop-blur-sm shadow-[0_10px_30px_rgba(16,185,129,0.15)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          </span>
          <span className="text-xs text-green-200 font-semibold">Система в сети</span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/25 via-blue-500/25 to-cyan-500/25 border border-purple-500/40 flex items-center justify-center text-sm font-bold text-purple-200 hover:border-purple-500/60 hover:shadow-[0_10px_40px_rgba(168,85,247,0.25)] transition-all duration-300 cursor-pointer">
          A
        </div>
      </div>
    </div>
  );
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

export default function TopNav({ onOpenTab, layoutMode, onLayoutChange }: TopNavProps) {
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

  const handleProjectClick = (project: Project) => {
    // If it's an internal app (like Cosmetic Analysis), open directly
    if (project.type === 'internal-app' && project.url) {
      onOpenTab({
        id: project.id,
        title: project.name,
        icon: project.icon,
        type: 'cosmetic-dashboard',
        url: project.url,
      });
      return;
    }

    // Otherwise toggle dropdown
    setOpenDropdown(openDropdown === project.id ? null : project.id);
  };

  const handleLinkClick = (project: Project, link: ProjectLink) => {
    onOpenTab({
      id: `${project.id}-${link.id}`,
      title: `${link.name} ${project.shortName}`,
      icon: link.icon,
      type: link.type as Tab['type'],
      url: link.url,
      projectId: project.id,
      linkId: link.id,
    });
    setOpenDropdown(null);
  };

  const projects = projectsConfig.projects as Project[];
  const regularProjects = projects.filter((p) => p.type !== 'internal-app');
  const specialProjects = projects.filter((p) => p.type === 'internal-app');
  const layoutOptions: { id: TopNavProps['layoutMode']; label: string; icon: JSX.Element }[] = [
    {
      id: 'all',
      label: 'Панели слева и справа',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="3" height="12" rx="1.2" />
          <rect x="6" y="3" width="6" height="12" rx="1.2" />
          <rect x="13" y="3" width="3" height="12" rx="1.2" />
        </svg>
      ),
    },
    {
      id: 'center',
      label: 'Только центральное окно',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="3" width="10" height="12" rx="1.4" />
        </svg>
      ),
    },
    {
      id: 'left',
      label: 'Только левая панель',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="6" height="12" rx="1.2" />
          <rect x="9" y="6" width="7" height="6" rx="1.1" />
        </svg>
      ),
    },
    {
      id: 'right',
      label: 'Только правая панель',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="10" y="3" width="6" height="12" rx="1.2" />
          <rect x="2" y="6" width="7" height="6" rx="1.1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-between w-full h-full">
      {/* Left: Logo & Projects */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-lg shadow-[0_0_25px_rgba(34,211,238,0.55)]">
            B
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-[0.28em] text-gray-400">Business</div>
            <div className="text-sm font-semibold text-white tracking-wide">OS</div>
          </div>
        </div>

        <nav className="flex items-center space-x-1">
          {/* Regular Projects with Dropdowns */}
          {regularProjects.map((project) => (
            <div
              key={project.id}
              ref={(el) => {
                if (el) dropdownRefs.current.set(project.id, el);
              }}
              className="relative"
            >
              <button
                onClick={() => handleProjectClick(project)}
                className={`group px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border
                  ${openDropdown === project.id
                    ? 'text-white border-cyan-400/60 bg-cyan-500/10 shadow-[0_10px_40px_rgba(34,211,238,0.25)]'
                    : 'text-gray-300 border-white/5 bg-white/5 hover:border-cyan-400/30 hover:text-white hover:bg-white/10'}
                `}
                style={{
                  color: openDropdown === project.id ? project.color : undefined,
                  borderColor: openDropdown === project.id ? `${project.color}70` : undefined,
                  boxShadow: openDropdown === project.id ? `0 10px 35px -10px ${project.color}80` : undefined
                }}
              >
                <span className="text-base drop-shadow">{project.icon}</span>
                <span>{project.name}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${openDropdown === project.id ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {openDropdown === project.id && project.links && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-gradient-to-b from-[#151a26]/95 to-[#0f1420]/95 border border-white/10 rounded-2xl shadow-2xl z-50 backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{
                    borderTopWidth: '2px',
                    borderTopColor: project.color,
                    boxShadow: `0 20px 60px -10px ${project.color}50`
                  }}
                >
                  <div className="py-2">
                    {project.links.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => handleLinkClick(project, link)}
                        className="w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent hover:text-white flex items-center gap-3.5 transition-all duration-200 group"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform duration-200">{link.icon}</span>
                        <span className="font-medium">{link.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Separator */}
          {specialProjects.length > 0 && <div className="w-px h-5 bg-white/10 mx-3"></div>}

          {/* Special Projects (Internal Apps) */}
          {specialProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-pink-200 hover:text-pink-100 bg-pink-500/10 hover:bg-pink-500/20 transition-all duration-300 border border-pink-500/30 hover:border-pink-500/60 flex items-center gap-2 shadow-[0_10px_40px_rgba(236,72,153,0.2)]"
            >
              <span className="text-base">{project.icon}</span>
              <span>{project.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right: Layout Controls & Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          {layoutOptions.map((option) => {
            const active = layoutMode === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onLayoutChange(option.id)}
                className={`group relative flex items-center justify-center w-9 h-8 rounded-lg mx-0.5 transition-all duration-200
                  ${active ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 shadow-[0_10px_25px_rgba(34,211,238,0.18)]' : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'}
                `}
              >
                {option.icon}
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-9 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-150 border border-white/10">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-[11px] font-semibold text-emerald-200 shadow-[0_10px_30px_rgba(52,211,153,0.18)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          </span>
          Health: Idle
        </div>
        <div className="flex items-center space-x-2.5 px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-full border border-green-500/30 backdrop-blur-sm shadow-[0_10px_30px_rgba(16,185,129,0.15)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          </span>
          <span className="text-xs text-green-200 font-semibold">Система в сети</span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/25 via-blue-500/25 to-cyan-500/25 border border-purple-500/40 flex items-center justify-center text-sm font-bold text-purple-200 hover:border-purple-500/60 hover:shadow-[0_10px_40px_rgba(168,85,247,0.25)] transition-all duration-300 cursor-pointer">
          A
        </div>
      </div>
    </div>
  );
}
