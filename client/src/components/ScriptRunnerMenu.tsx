'use client';

import React from 'react';

// Mock data for scripts - in a real app this would come from an API or config
const SCRIPTS = [
    { id: 'deploy-render', label: 'Deploy to Render', icon: '🚀', description: 'Trigger deployment to Render.com' },
    { id: 'git-push', label: 'Git Push', icon: '🐙', description: 'Push changes to GitHub' },
    { id: 'sync-sheets', label: 'Sync Google Sheets', icon: '📊', description: 'Pull latest data from Sheets' },
    { id: 'build-client', label: 'Build Client', icon: '⚡', description: 'Run next build' },
    { id: 'lint', label: 'Lint Code', icon: '🧹', description: 'Check code style and formatting' },
];

export default function ScriptRunnerMenu() {
    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[#1a1a1a] to-[#141414] text-gray-300 border-l border-white/5 w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-[#1c1c1c] to-[#181818]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Scripts</h2>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {SCRIPTS.length} Available
                </span>
            </div>

            {/* Script List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {SCRIPTS.map((script) => (
                    <button
                        key={script.id}
                        className="group w-full flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-[#222] to-[#1a1a1a] border border-white/5 hover:border-purple-500/30 hover:from-[#2a2a2a] hover:to-[#202020] transition-all duration-300 text-left shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5"
                        onClick={() => console.log(`Running script: ${script.id}`)}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#151515] border border-white/5 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-colors duration-300 text-lg">
                            {script.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm font-medium text-gray-200 group-hover:text-purple-300 transition-colors">
                                    {script.label}
                                </span>
                                <svg
                                    className="w-3 h-3 text-gray-600 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <p className="text-[11px] text-gray-500 group-hover:text-gray-400 truncate transition-colors">
                                {script.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Status / Footer */}
            <div className="p-4 border-t border-white/5 bg-[#151515]">
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span>System Ready</span>
                </div>
            </div>
        </div>
    );
}
