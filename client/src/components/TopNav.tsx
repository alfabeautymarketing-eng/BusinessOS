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
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-md flex items-center justify-center font-bold text-xs">
            B
          </div>
          <span className="font-bold tracking-wider text-sm text-gray-200">BUSINESS OS</span>
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
                className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                style={{
                  color: openDropdown === project.id ? project.color : undefined,
                }}
              >
                <span>{project.icon}</span>
                <span>{project.shortName}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${
                    openDropdown === project.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {openDropdown === project.id && project.links && (
                <div
                  className="absolute top-full left-0 mt-1 w-56 bg-[#1e1e1e] border border-gray-700 rounded-md shadow-xl z-50"
                  style={{ borderTopColor: project.color }}
                >
                  <div className="py-1">
                    {project.links.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => handleLinkClick(project, link)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <span>{link.icon}</span>
                        <span>{link.name}</span>
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
              className="px-3 py-1.5 rounded-md text-xs font-medium text-pink-400 hover:text-pink-300 hover:bg-pink-900/20 transition-colors border border-pink-500/20 flex items-center gap-1.5"
            >
              <span>{project.icon}</span>
              <span>{project.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right: Status & User */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
          <span className="text-xs text-gray-400 font-mono">System: Online</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-300">
          A
        </div>
      </div>
    </div>
  );
}
