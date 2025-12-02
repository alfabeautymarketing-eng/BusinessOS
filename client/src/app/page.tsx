'use client';

import React from 'react';
import Shell from '@/components/Shell';
import TopNav from '@/components/TopNav';
import AgentSidebar from '@/components/AgentSidebar';
import TabsBar from '@/components/TabsBar';
import ContentViewer from '@/components/ContentViewer';
import ScriptRunnerMenu from '@/components/ScriptRunnerMenu';
import { useTabs } from '@/hooks/useTabs';

export default function Home() {
  const { tabs, activeTab, activeTabId, openTab, closeTab, switchTab } = useTabs();

  return (
    <Shell
      topNav={<TopNav onOpenTab={openTab} />}
      sidebar={<AgentSidebar />}
      rightSidebar={<ScriptRunnerMenu />}
    >
      <div className="flex flex-col w-full h-full bg-[#121212]">
        {/* Tabs Bar */}
        <TabsBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={switchTab}
          onTabClose={closeTab}
        />

        {/* Content Area */}
        <div className="flex-1 w-full h-full overflow-hidden">
          <ContentViewer tab={activeTab} />
        </div>
      </div>
    </Shell>
  );
}
