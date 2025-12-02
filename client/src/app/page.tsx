'use client';

import React from 'react';
import Shell from '@/components/Shell';
import TopNav from '@/components/TopNav';
import AgentSidebar from '@/components/AgentSidebar';
import TabsBar from '@/components/TabsBar';
import ContentViewer from '@/components/ContentViewer';
import ScriptRunnerMenu from '@/components/ScriptRunnerMenu';
import { useTabs } from '@/hooks/useTabs';
import type { Tab } from '@/hooks/useTabs';
import projectsConfig from '../config/projects.json';

type WorkspaceProject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type?: string;
};

export default function Home() {
  const { tabs, activeTab, activeTabId, openTab, closeTab, switchTab } = useTabs();
  const [layoutMode, setLayoutMode] = React.useState<'all' | 'center' | 'left' | 'right'>('all');
  const [activeWorkspace, setActiveWorkspace] = React.useState<string>('sk');
  const workspaceProjects = (projectsConfig.projects as WorkspaceProject[]).filter((p) => p.type !== 'internal-app');

  const showSidebar = layoutMode === 'all' || layoutMode === 'left';
  const showRightSidebar = layoutMode === 'all' || layoutMode === 'right';

  // Filter tabs by workspace - only show tabs for the active workspace
  const workspaceTabs = tabs.filter(tab => {
    // Special handling for cosmetic-analysis (no workspace)
    if (tab.type === 'cosmetic-dashboard') return false;
    // Show only tabs belonging to active workspace
    return tab.projectId === activeWorkspace;
  });

  // Find active tab within workspace tabs
  const workspaceActiveTab = workspaceTabs.find(t => t.id === activeTabId) || null;
  const workspaceActiveTabId = workspaceActiveTab?.id || null;

  // When opening a tab, also set the workspace
  const handleOpenTab = (tab: Tab) => {
    if (tab && tab.projectId && tab.projectId !== activeWorkspace) {
      setActiveWorkspace(tab.projectId);
    }
    openTab(tab);
  };

  return (
    <Shell
      topNav={<TopNav
        onOpenTab={handleOpenTab}
        layoutMode={layoutMode}
        onLayoutChange={setLayoutMode}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={setActiveWorkspace}
      />}
      sidebar={<ScriptRunnerMenu projectId={activeWorkspace} />}
      rightSidebar={<AgentSidebar projectId={activeWorkspace} />}
      showSidebar={showSidebar}
      showRightSidebar={showRightSidebar}
    >
      <div className="flex flex-col w-full h-full gap-3 px-0 py-2">
        {/* Заголовок: Рабочие столы */}
        <div className="flex items-center gap-4 px-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗂️</span>
            <h2 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-primary)' }}>
              Рабочие столы
            </h2>
          </div>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, var(--border), transparent)' }} />
        </div>

        {/* Переключатель рабочих столов */}
        <div className="flex items-center gap-2 px-3">
          {workspaceProjects.map((project) => {
            const isActive = project.id === activeWorkspace;
            return (
              <button
                key={project.id}
                onClick={() => setActiveWorkspace(project.id)}
                className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold transition-all duration-200 border-2 ${isActive ? 'button-rounded' : 'rounded-xl'}`}
                style={{
                  borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: isActive ? 'var(--surface-glass)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                  backdropFilter: isActive ? 'blur(20px)' : 'none'
                }}
              >
                <span
                  className="h-3 w-3 rounded-full shadow-sm"
                  style={{
                    background: isActive ? project.color : 'var(--text-muted)',
                    boxShadow: isActive ? `0 0 8px ${project.color}` : 'none'
                  }}
                />
                <span>{project.name}</span>
              </button>
            );
          })}
        </div>

        <TabsBar
          tabs={workspaceTabs}
          activeTabId={workspaceActiveTabId}
          onTabClick={switchTab}
          onTabClose={closeTab}
        />

        <div className="flex-1 card-static animate-fade-in overflow-hidden">
          <ContentViewer tab={workspaceActiveTab} />
        </div>
      </div>
    </Shell>
  );
}
