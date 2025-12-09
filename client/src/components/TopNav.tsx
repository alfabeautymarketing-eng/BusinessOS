'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Layout, LayoutPanelLeft, Square, ChevronDown } from 'lucide-react';
import projectsConfig from '../config/projects.json';
import tabsConfig from '../config/tabs.config.json';

interface TopNavProps {
  onOpenTab: (tab: any) => void;
  layoutMode: 'all' | 'center' | 'left' | 'right';
  onLayoutChange: (mode: 'all' | 'center' | 'left' | 'right') => void;
  activeWorkspace: string;
  onWorkspaceChange: (workspaceId: string) => void;
}

// Define types for the configuration
type ProjectConfig = typeof projectsConfig.projects[0];
type WorkspaceConfig = typeof tabsConfig.workspaces[0];

export default function TopNav({
  onOpenTab,
  layoutMode,
  onLayoutChange,
  activeWorkspace,
  onWorkspaceChange
}: TopNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build PROJECTS from configuration files
  const PROJECTS = useMemo(() => {
    return projectsConfig.projects.map((project: any) => {
      // Find workspace tabs for this project
      const workspace = tabsConfig.workspaces.find((w: any) => w.id === project.id);

      // Convert tabs to links format
      const links = workspace?.tabs
        ? workspace.tabs
            .filter((tab: any) => tab.pinned !== false) // Only pinned tabs appear in dropdown
            .map((tab: any) => ({
              id: tab.id,
              name: tab.name,
              url: tab.url,
              icon: tab.icon || '📄',
              type: tab.type
            }))
        : [];

      return {
        id: project.id,
        name: project.name,
        shortName: project.shortName,
        color: project.color,
        tailwindTheme: project.tailwindTheme,
        icon: project.icon,
        links
      };
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWorkspaceClick = (projectId: string) => {
    onWorkspaceChange(projectId);
    setOpenDropdown(openDropdown === projectId ? null : projectId);
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

  const getWorkspaceButtonStyles = (project: any, isActive: boolean) => {
    if (!isActive) return 'bg-transparent text-[var(--text-secondary)] hover:bg-white/40 border-transparent';

    // Using inline styles for specific colors to match the exact palette if needed, 
    // or we can map tailwind classes. Given the prompt asks for specific feeling:
    switch (project.id) {
      case 'sk': return 'bg-violet-100 text-violet-700 border-violet-200 shadow-md';
      case 'mt': return 'bg-blue-100 text-blue-700 border-blue-200 shadow-md';
      case 'ss': return 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-md';
      case 'cosmetic': return 'bg-pink-100 text-pink-700 border-pink-200 shadow-md';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="glass-panel rounded-2xl h-16 flex items-center justify-between px-6 shrink-0 relative z-50 border border-transparent">
      {/* Brand */}
      <div className="flex items-center gap-3 w-48">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white flex items-center justify-center">
          <Image src="/logo-agent.png" alt="CareAgent logo" width={44} height={44} className="object-contain p-1.5" priority />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl leading-none tracking-tight text-[var(--text-primary)]">CareAgent</span>
        </div>
      </div>

      {/* Workspace Selectors centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2" ref={dropdownRef}>
        {PROJECTS.map((project) => {
          const isActive = activeWorkspace === project.id;
          const buttonStyle = getWorkspaceButtonStyles(project, isActive);

          return (
            <div key={project.id} className="relative">
              <button
                onClick={() => handleWorkspaceClick(project.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${buttonStyle}`}
              >
                <span className="text-lg filter drop-shadow-sm">{project.icon}</span>
                <span className="font-semibold text-sm">{project.name}</span>
                {project.links && project.links.length > 0 && (
                  <ChevronDown size={14} className={`ml-1 opacity-60 transition-transform duration-300 ${openDropdown === project.id ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Dropdown */}
              {openDropdown === project.id && project.links && project.links.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 glass-card-strong rounded-2xl p-2 z-[100] animate-fade-in origin-top">
                  <div className="px-3 py-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">
                    доступно
                  </div>
                  {project.links.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(project, link)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-all text-left group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {link.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Layout Controls */}
      <div className="flex items-center gap-2 w-48 justify-end">
        <div className="bg-white/40 p-1 rounded-xl border border-white/40 flex items-center gap-1 backdrop-blur-sm">
          <button
            onClick={() => onLayoutChange('all')}
            className={`p-1.5 rounded-lg transition-all ${layoutMode === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600 hover:bg-white/20'}`}
            title="Full View"
          >
            <Layout size={18} />
          </button>
          <button
            onClick={() => onLayoutChange('left')}
            className={`p-1.5 rounded-lg transition-all ${layoutMode === 'left' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600 hover:bg-white/20'}`}
            title="Hide Left"
          >
            <LayoutPanelLeft size={18} />
          </button>
          <button
            onClick={() => onLayoutChange('right')}
            className={`p-1.5 rounded-lg transition-all ${layoutMode === 'right' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600 hover:bg-white/20'}`}
            title="Hide Right"
          >
            <Square size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
