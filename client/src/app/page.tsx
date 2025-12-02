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

export default function Home() {
  const { tabs, activeTab, activeTabId, openTab, closeTab, switchTab } = useTabs();
  const [layoutMode, setLayoutMode] = React.useState<'all' | 'center' | 'left' | 'right'>('all');
  const [activeWorkspace, setActiveWorkspace] = React.useState<string>('sk');

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
