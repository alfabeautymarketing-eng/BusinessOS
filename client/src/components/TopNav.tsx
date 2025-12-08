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
      { id: "sk-drive", name: "Drive Folder", url: "https://drive.google.com/drive/u/0/folders/1T4X-i_tOqfO_rG-4Zg_wFk_qD", icon: "📂", type: "drive-folder" }
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
    <div className="relative flex items-center justify-between w-full h-full px-4">
      {/* Brand - Left */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-200 text-xl">
          B
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none text-[var(--text-primary)]">Business OS</span>
          <span className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Workspace</span>
        </div>
      </div>

      {/* Workspace Selectors - Centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-50" ref={dropdownRef}>
        {PROJECTS.map((project) => {
          const isActive = activeWorkspace === project.id;

          return (
            <div key={project.id} className="relative">
              <button
                onClick={() => handleWorkspaceClick(project.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 border-2
                  ${isActive
                    ? 'text-white shadow-lg transform scale-105'
                    : 'bg-white/60 text-[var(--text-primary)] border-gray-200 hover:bg-white hover:shadow-md hover:scale-102'}
                `}
                style={{
                  backgroundColor: isActive ? project.color : undefined,
                  borderColor: isActive ? project.color : undefined,
                }}
              >
                <span className="text-lg">{project.icon}</span>
                <span className="font-semibold text-sm">{project.name}</span>
                {project.links && project.links.length > 0 && (
                  <ChevronDown
                    size={14}
                    className={`ml-0.5 transition-transform duration-200 ${openDropdown === project.id ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {/* Dropdown */}
              {openDropdown === project.id && project.links && project.links.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 card-glass rounded-2xl shadow-2xl z-[100] overflow-hidden animate-fade-in">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-200/50">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Документы</span>
                    </div>
                    {project.links.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => handleLinkClick(project, link)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/70 transition-all text-left group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm">
                          {link.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors">
                            {link.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-medium">
                            {link.type.replace('-', ' ')}
                          </div>
                        </div>
                        <ChevronDown size={14} className="text-gray-400 -rotate-90" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Layout Controls - Right */}
      <div className="flex items-center gap-1 bg-white/60 p-1.5 rounded-xl border border-gray-200 shadow-sm min-w-[200px] justify-end">
        <button
          onClick={() => onLayoutChange('all')}
          className={`p-2 rounded-lg transition-all ${layoutMode === 'all' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          title="Полный вид"
        >
          <Layout size={16} />
        </button>
        <button
          onClick={() => onLayoutChange('left')}
          className={`p-2 rounded-lg transition-all ${layoutMode === 'left' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          title="Скрыть левую панель"
        >
          <LayoutPanelLeft size={16} />
        </button>
        <button
          onClick={() => onLayoutChange('right')}
          className={`p-2 rounded-lg transition-all ${layoutMode === 'right' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          title="Скрыть правую панель"
        >
          <Square size={16} />
        </button>
      </div>
    </div>
  );
}
