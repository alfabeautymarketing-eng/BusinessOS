'use client';

import React from 'react';
import Shell from '@/components/Shell';
import TopNav from '@/components/TopNav';
import AgentSidebar from '@/components/AgentSidebar';
import SheetOverlay from '@/components/SheetOverlay';

export default function Home() {
  // Mock Columns for the prototype
  const columns = [
    { id: 'col-a', name: 'Артикул', letter: 'A' },
    { id: 'col-b', name: 'Объем', letter: 'B' },
    { id: 'col-c', name: 'Дата', letter: 'C' },
    { id: 'col-d', name: 'Цена', letter: 'D' },
    { id: 'col-e', name: 'Статус', letter: 'E' },
  ];

  const handleColumnClick = (col: any) => {
    console.log('Column clicked:', col);
    // In a real app, this would inject the column context into the chat
  };

  return (
    <Shell
      topNav={<TopNav />}
      sidebar={<AgentSidebar />}
    >
      <div className="relative w-full h-full bg-gray-900 flex flex-col">
        {/* The Smart Overlay */}
        <SheetOverlay columns={columns} onColumnClick={handleColumnClick} />

        {/* The Google Sheet Iframe (Placeholder) */}
        <div className="flex-1 w-full h-full bg-white relative z-0">
          <iframe
            src="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?gid=0#gid=0" // Example Sheet
            className="w-full h-full border-none"
            title="Google Sheet"
          />
          {/* 
            NOTE: In a real implementation, we can't easily overlay UI *inside* the iframe due to cross-origin policies.
            The Overlay sits *on top* of the iframe. 
            We use pointer-events-none on the overlay container so clicks pass through to the sheet,
            but pointer-events-auto on the specific buttons/borders we want to be interactive.
          */}
        </div>
      </div>
    </Shell>
  );
}
