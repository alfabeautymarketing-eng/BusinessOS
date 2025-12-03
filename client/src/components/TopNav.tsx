'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Layout, LayoutPanelLeft, Square, ChevronDown } from 'lucide-react';

interface TopNavProps {
  onOpenTab: (tab: any) => void;
  layoutMode: 'all' | 'center' | 'left' | 'right';
  onLayoutChange: (mode: 'all' | 'center' | 'left' | 'right') => void;
  activeWorkspace: string;
  onWorkspaceChange: (workspaceId: string) => void;
}

// Project data structure matching the reference style
const PROJECTS = [
  {
    id: "sk",
    name: "SkinClinic",
    shortName: "SC",
    color: "#8B5CF6",
    icon: "🟣",
    links: [
      { id: "sk-crm", name: "CRM System", url: "https://docs.google.com/spreadsheets/d/1CpYYLvRYslsyCkuLzL9EbbjsvbNpWCEZcmhKqMoX5zw/edit", icon: "📊", type: "sheets" },
      { id: "sk-drive", name: "Drive Folder", url: "https://drive.google.com/drive/u/0/folders/1T4X-i_tOqfO_rG-4Zg_wFk_qD", icon: "bm", type: "drive-folder" }
    ]
  },
  {
    id: "mt",
    name: "Montibello",
    shortName: "MT",
    color: "#3B82F6",
    icon: "🔵",
    links: [
      { id: "mt-orders", name: "Orders Sheet", url: "https://docs.google.com/spreadsheets/d/1fMOjUE7oZV96fCY5j5rPxnhWGJkDqg-GfwPZ8jUVgPw/edit", icon: "📝", type: "sheets" }
    ]
  },
  {
    id: "ss",
    name: "Soskin",
    shortName: "SS",
    color: "#10B981",
    icon: "🟢",
    links: []
  },
  {
    id: "cosmetic",
    name: "Анализ косметики",
    shortName: "CA",
    color: "#EC4899",
    icon: "💄",
    links: [
      { id: "cosmetic-dash", name: "Dashboard", url: "/cosmetic-analysis", icon: "📈", type: "cosmetic-dashboard" }
    ]
  }
];

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

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)] h-16 shrink-0 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-200 text-xl">
          B
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none text-[var(--text-primary)]">Business OS</span>
          <span className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Workspace</span>
        </div>
      </div>

      {/* Workspace Selectors */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {PROJECTS.map((project) => {
          const isActive = activeWorkspace === project.id;

          return (
            <div key={project.id} className="relative">
              <button
                onClick={() => handleWorkspaceClick(project.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 border
                  ${isActive
                    ? 'text-white shadow-md transform -translate-y-[1px]'
                    : 'bg-transparent text-[var(--text-primary)] border-transparent hover:bg-gray-50'}
                `}
                style={{
                  backgroundColor: isActive ? project.color : undefined,
                  borderColor: isActive ? project.color : 'transparent',
                }}
              >
                <span className="emoji-gap items-center">
                  <span className="text-lg">{project.icon}</span>
                  <span className="font-medium text-sm">{project.name}</span>
                </span>
                {project.links && project.links.length > 0 && (
                  <ChevronDown size={14} className={`ml-1 transition-transform ${openDropdown === project.id ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Dropdown */}
              {openDropdown === project.id && project.links && project.links.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-64 card-glass rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in origin-top-left">
                  <div className="py-1">
                    {project.links.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => handleLinkClick(project, link)}
                        className="w-full flex items-center emoji-gap px-4 py-3 hover:bg-white/50 transition-colors text-left group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">{link.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">
                            {link.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">
                            {link.type.replace('-', ' ')}
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
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => onLayoutChange('all')}
          className={`p-1.5 rounded-md transition-all ${layoutMode === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          title="Full View"
        >
          <Layout size={16} />
        </button>
        <button
          onClick={() => onLayoutChange('left')}
          className={`p-1.5 rounded-md transition-all ${layoutMode === 'left' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          title="Hide Left"
        >
          <LayoutPanelLeft size={16} />
        </button>
        <button
          onClick={() => onLayoutChange('right')}
          className={`p-1.5 rounded-md transition-all ${layoutMode === 'right' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          title="Hide Right"
        >
          <Square size={16} />
        </button>
      </div>
    </div>
  );
}
