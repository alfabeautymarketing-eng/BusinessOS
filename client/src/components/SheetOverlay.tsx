'use client';

import React, { useState } from 'react';

interface Column {
    id: string;
    name: string;
    letter: string; // A, B, C...
}

interface SheetOverlayProps {
    columns: Column[];
    onColumnClick: (col: Column) => void;
}

export default function SheetOverlay({ columns, onColumnClick }: SheetOverlayProps) {
    const [hoveredCol, setHoveredCol] = useState<string | null>(null);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {/* Top Bar - Column Chips */}
            <div className="absolute top-0 left-0 right-0 h-12 flex items-end px-12 pointer-events-none">
                <div className="flex space-x-2 w-full overflow-x-auto pb-2 pointer-events-auto no-scrollbar">
                    {columns.map((col) => (
                        <button
                            key={col.id}
                            onClick={() => onColumnClick(col)}
                            onMouseEnter={() => setHoveredCol(col.id)}
                            onMouseLeave={() => setHoveredCol(null)}
                            className={`
                px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border
                ${hoveredCol === col.id
                                    ? 'bg-purple-900/80 border-purple-500 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.5)] transform -translate-y-1'
                                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700'}
              `}
                        >
                            <span className="opacity-50 mr-1">{col.letter}:</span>
                            {col.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Column Highlight Effect (Vertical Line) */}
            {hoveredCol && (
                <div className="absolute top-12 bottom-0 w-full pointer-events-none flex px-12">
                    {/* This is a simplified visualizer. In reality, we'd need exact pixel positioning based on column width. 
               For the prototype, we just show a subtle glow effect. */}
                    <div className="absolute inset-0 bg-purple-500/5 pointer-events-none animate-pulse" />
                </div>
            )}

            {/* Bottom Status Bar */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                <div className="bg-gray-900/90 border border-gray-700 rounded-lg px-4 py-2 text-xs text-gray-400 flex items-center space-x-4 shadow-xl backdrop-blur-sm hover:border-purple-500/50 transition-colors cursor-pointer">
                    <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        Linked Scripts: 3 active
                    </span>
                    <span className="w-px h-3 bg-gray-700"></span>
                    <span>Last Git Commit: 2 min ago</span>
                </div>
            </div>
        </div>
    );
}
