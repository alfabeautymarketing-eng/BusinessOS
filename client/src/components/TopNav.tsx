'use client';

import React, { useState, useRef, useEffect } from 'react';
import projectsConfig from '../config/projects.json';
import type { Tab } from '../hooks/useTabs';

interface TopNavProps {
  onOpenTab: (tab: Tab) => void;
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

export default function TopNav({ onOpenTab }: TopNavProps) {
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

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left: Logo & Projects */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow duration-300">
            B
          </div>
          <span className="font-bold tracking-wide text-base bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">BUSINESS OS</span>
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
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-gradient-to-b hover:from-white/10 hover:to-white/5 transition-all duration-300 flex items-center gap-2 border border-transparent hover:border-white/10 hover:shadow-lg"
                style={{
                  color: openDropdown === project.id ? project.color : undefined,
                  borderColor: openDropdown === project.id ? `${project.color}40` : undefined,
                  backgroundColor: openDropdown === project.id ? `${project.color}15` : undefined,
                }}
              >
                <span className="text-base">{project.icon}</span>
                <span>{project.shortName}</span>
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
                  className="absolute top-full left-0 mt-2 w-64 bg-gradient-to-b from-[#252525] to-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{
                    borderTopWidth: '2px',
                    borderTopColor: project.color,
                    boxShadow: `0 10px 40px -10px ${project.color}40`
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
          {specialProjects.length > 0 && <div className="w-px h-4 bg-gray-700 mx-2"></div>}

          {/* Special Projects (Internal Apps) */}
          {specialProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-pink-400 hover:text-pink-300 hover:bg-gradient-to-r hover:from-pink-900/30 hover:to-pink-800/20 transition-all duration-300 border border-pink-500/30 hover:border-pink-500/50 flex items-center gap-2 hover:shadow-lg hover:shadow-pink-500/20"
            >
              <span className="text-base">{project.icon}</span>
              <span>{project.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right: Status & User */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 px-4 py-2 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-full border border-green-500/30 backdrop-blur-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          </span>
          <span className="text-xs text-green-400 font-semibold">Система в сети</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/40 flex items-center justify-center text-sm font-bold text-purple-300 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer">
          A
        </div>
      </div>
    </div>
  );
}
