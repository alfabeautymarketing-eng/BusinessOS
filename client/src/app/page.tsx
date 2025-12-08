'use client'; // Force rebuild 1

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
  theme?: {
    h: number;
    s: string;
    l: string;
  };
};

export default function Home() {
  const { tabs, activeTab, activeTabId, openTab, closeTab, switchTab } = useTabs();
  const [layoutMode, setLayoutMode] = React.useState<'all' | 'center' | 'left' | 'right'>('all');
  const [activeWorkspace, setActiveWorkspace] = React.useState<string>('sk');
  const workspaceProjects = (projectsConfig.projects as WorkspaceProject[]).filter((p) => p.type !== 'internal-app');
  const workspaceSlots: (WorkspaceProject | null)[] = workspaceProjects.flatMap((p, idx) =>
    idx === workspaceProjects.length - 1 ? [p] : [p, null]
  );

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

  // Get active project to determine theme colors
  const activeProject = (projectsConfig.projects as WorkspaceProject[]).find(p => p.id === activeWorkspace);

  // Calculate dynamic theme styles
  const themeStyles = React.useMemo(() => {
    if (activeProject && activeProject.theme) {
      const { h, s, l } = activeProject.theme;
      return {
        '--primary': `hsl(${h}, ${s}, ${l})`,
        '--primary-hover': `hsl(${h}, ${s}, calc(${parseInt(l.toString())} - 10%))`,
        '--secondary': `hsl(${h}, ${s}, 96%)`, // Light background tint
      } as React.CSSProperties;
    } else if (activeProject && activeProject.color) {
      return {
        '--primary': activeProject.color,
        '--primary-hover': activeProject.color, // Fallback
      } as React.CSSProperties;
    }
    return {};
  }, [activeProject]);

  return (
    <div style={themeStyles} className="contents">
      <Shell
        topNav={<TopNav
          onOpenTab={handleOpenTab}
          layoutMode={layoutMode}
          onLayoutChange={setLayoutMode}
          activeWorkspace={activeWorkspace}
          onWorkspaceChange={setActiveWorkspace}
        />}
        sidebar={<ScriptRunnerMenu key={activeWorkspace} projectId={activeWorkspace} />}
        rightSidebar={<AgentSidebar key={activeWorkspace} projectId={activeWorkspace} />}
        showSidebar={showSidebar}
        showRightSidebar={showRightSidebar}
      >
        <div className="flex flex-col w-full h-full">
          <TabsBar
            tabs={workspaceTabs}
            activeTabId={workspaceActiveTabId}
            onTabClick={switchTab}
            onTabClose={closeTab}
          />

          <div className="flex-1 glass-card-strong rounded-[32px] animate-fade-in overflow-hidden relative border border-white/50 shadow-2xl backdrop-blur-xl">
            <ContentViewer tab={workspaceActiveTab} />
          </div>
        </div>
      </Shell>
    </div>
  );
}
