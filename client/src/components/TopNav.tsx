'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Layout, LayoutPanelLeft, Square, ChevronDown } from 'lucide-react';
import projectsConfig from '@/config/projects.json';

interface TopNavProps {
  onOpenTab: (tab: any) => void;
  layoutMode: 'all' | 'center' | 'left' | 'right';
  onLayoutChange: (mode: 'all' | 'center' | 'left' | 'right') => void;
  activeWorkspace: string;
  onWorkspaceChange: (workspaceId: string) => void;
}

type ProjectLink = {
  id: string;
  name: string;
  type: string;
  url: string;
  sheetId?: string;
  folderId?: string;
  icon: string;
};

type Project = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  type?: 'internal-app';
  url?: string;
  links?: ProjectLink[];
};

const PROJECTS = projectsConfig.projects as Project[];

export default function TopNav({
  onOpenTab,
  layoutMode,
  onLayoutChange,
  activeWorkspace,
  onWorkspaceChange
}: TopNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWorkspaceClick = (project: Project) => {
    if (project.type === 'internal-app' && project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
      return;
    }

    onWorkspaceChange(project.id);
    setOpenDropdown(openDropdown === project.id ? null : project.id);
  };

  const handleLinkClick = (project: any, link: any) => {
    onOpenTab({
      id: link.id,
      title: link.name,
      type: link.type,
      url: link.url,
      projectId: project.id,
      icon: link.icon
    });
    setOpenDropdown(null);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--border)] shrink-0 z-50 relative overflow-visible"
      style={{ backdropFilter: 'blur(20px)' }}>
      {/* Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <img
          src="/logo-agent.png"
          alt="CareAgent"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full shadow-sm object-cover border bg-white overflow-hidden flex-shrink-0"
          style={{ objectPosition: 'center', borderColor: 'var(--border)' }}
        />
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>CareAgent</span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>Workspace</span>
        </div>
      </div>

      {/* Workspace Selectors */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {PROJECTS.map((project) => {
          const isActive = activeWorkspace === project.id;
          const isOpen = openDropdown === project.id;

          return (
            <div key={project.id} className="relative">
              <button
                onClick={() => handleWorkspaceClick(project)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 border shadow-sm
                  ${isActive
                    ? 'text-white shadow-md transform -translate-y-[1px]'
                    : 'bg-white text-[var(--text-primary)] border-[var(--border)] hover:shadow-md'}
                `}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${project.color} 0%, ${project.color}cc 60%, ${project.color} 100%)`
                    : undefined,
                  borderColor: isActive ? project.color : undefined,
                }}
              >
                <span className="emoji-gap items-center">
                  <span className="text-lg">{project.icon}</span>
                  <span className="font-semibold text-sm">{project.name}</span>
                </span>
                {project.type !== 'internal-app' && project.links && project.links.length > 0 && (
                  <ChevronDown
                    size={14}
                    className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    color={isActive ? 'white' : 'currentColor'}
                  />
                )}
              </button>

              {/* Dropdown */}
              {project.type !== 'internal-app' && openDropdown === project.id && project.links && project.links.length > 0 && (
                <div
                  className="absolute top-full left-0 mt-3 w-64 rounded-2xl z-[999] overflow-hidden animate-fade-in origin-top-left border p-2"
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#dfe1e5',
                    boxShadow: '0 18px 50px rgba(17, 24, 39, 0.14)'
                  }}
                  role="menu"
                >
                  <div className="flex flex-col gap-2">
                    {project.links.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => handleLinkClick(project, link)}
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left group rounded-xl bg-white border border-transparent shadow-sm hover:shadow-md hover:bg-gray-50 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        role="menuitem"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform drop-shadow-sm">{link.icon}</span>
                        <div className="flex flex-col leading-tight">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">{link.name}</div>
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                            {link.type}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Layout Controls */}
      <div className="flex items-center gap-1 p-1 rounded-lg border"
        style={{
          backgroundColor: 'var(--surface-glass)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(10px)'
        }}>
        <button
          onClick={() => onLayoutChange('all')}
          className={`p-1.5 rounded-md transition-all duration-200 ${
            layoutMode === 'all'
              ? 'shadow-sm scale-105'
              : 'hover:scale-105'
          }`}
          style={{
            backgroundColor: layoutMode === 'all' ? 'var(--surface)' : 'transparent',
            color: layoutMode === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
            boxShadow: layoutMode === 'all' ? 'var(--shadow-sm)' : 'none'
          }}
          title="Full View"
        >
          <Layout size={14} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => onLayoutChange('left')}
          className={`p-1.5 rounded-md transition-all duration-200 ${
            layoutMode === 'left'
              ? 'shadow-sm scale-105'
              : 'hover:scale-105'
          }`}
          style={{
            backgroundColor: layoutMode === 'left' ? 'var(--surface)' : 'transparent',
            color: layoutMode === 'left' ? 'var(--primary)' : 'var(--text-secondary)',
            boxShadow: layoutMode === 'left' ? 'var(--shadow-sm)' : 'none'
          }}
          title="Hide Left"
        >
          <LayoutPanelLeft size={14} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => onLayoutChange('right')}
          className={`p-1.5 rounded-md transition-all duration-200 ${
            layoutMode === 'right'
              ? 'shadow-sm scale-105'
              : 'hover:scale-105'
          }`}
          style={{
            backgroundColor: layoutMode === 'right' ? 'var(--surface)' : 'transparent',
            color: layoutMode === 'right' ? 'var(--primary)' : 'var(--text-secondary)',
            boxShadow: layoutMode === 'right' ? 'var(--shadow-sm)' : 'none'
          }}
          title="Hide Right"
        >
          <Square size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
