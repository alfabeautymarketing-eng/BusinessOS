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
      sidebar={<ScriptRunnerMenu projectId={activeTab?.projectId} />}
      rightSidebar={<AgentSidebar projectId={activeTab?.projectId} />}
    >
      <div className="flex flex-col w-full h-full gap-4 p-4">
        <div className="rounded-2xl border border-cyan-500/15 bg-gradient-to-r from-[#0c111d]/80 via-[#0a0f1a]/80 to-[#0c101c]/80 backdrop-blur-xl shadow-[0_10px_60px_rgba(0,255,255,0.08)] overflow-hidden">
          <TabsBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={switchTab}
            onTabClose={closeTab}
          />
        </div>

        <div className="flex-1 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#0c101d] via-[#0b0f19] to-[#0a0d16] shadow-[0_10px_80px_rgba(88,28,135,0.15)] overflow-hidden">
          <ContentViewer tab={activeTab} />
        </div>
      </div>
    </Shell>
  );
}
