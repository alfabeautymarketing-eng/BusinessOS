'use client';

import React, { useState } from 'react';

type Tab = 'chat' | 'logs' | 'git';

export default function AgentSidebar() {
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [input, setInput] = useState('');

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] text-gray-300 font-mono text-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
                {['chat', 'logs', 'git'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as Tab)}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors
              ${activeTab === tab
                                ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}
            `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {activeTab === 'chat' && (
                    <>
                        {/* Example Messages */}
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-500 ml-auto">User</span>
                            <div className="bg-gray-800 p-3 rounded-lg rounded-tr-none self-end max-w-[90%] border border-gray-700">
                                <p>Если <span className="text-purple-400 bg-purple-900/30 px-1 rounded">#Column:Date</span> пустая, ставь сегодняшнюю.</p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-500">Agent</span>
                            <div className="bg-purple-900/20 p-3 rounded-lg rounded-tl-none self-start max-w-[90%] border border-purple-500/30">
                                <p className="mb-2">Готово. Скрипт `autoDate.gs` задеплоен. Триггер `onEdit` установлен.</p>
                                {/* Code Snippet Card */}
                                <div className="bg-[#121212] p-2 rounded border border-gray-800 text-xs font-mono text-gray-400">
                                    <div className="flex justify-between items-center mb-1 border-b border-gray-800 pb-1">
                                        <span>autoDate.gs</span>
                                        <span className="text-[10px] text-green-500">Active</span>
                                    </div>
                                    <pre className="overflow-x-auto">
                                        <code>function onEdit(e) {'{'}...{'}'}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {activeTab === 'logs' && (
                    <div className="text-xs text-gray-500 font-mono">
                        <div className="mb-1"><span className="text-green-500">[14:05:22]</span> Sync started...</div>
                        <div className="mb-1"><span className="text-blue-500">[14:05:23]</span> Fetching headers...</div>
                        <div className="mb-1"><span className="text-yellow-500">[14:05:25]</span> Warning: Cell A5 is empty</div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800 bg-[#1a1a1a]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe a task for the agent..."
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 min-h-[80px] resize-none text-gray-200 placeholder-gray-600"
                    />
                    <button className="absolute bottom-3 right-3 p-1.5 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="mt-2 flex space-x-2 overflow-x-auto pb-1">
                    {/* Quick Actions / Context Chips */}
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider py-1">Context:</span>
                    <button className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400 hover:bg-gray-700 border border-gray-700">Selection</button>
                    <button className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400 hover:bg-gray-700 border border-gray-700">Active Sheet</button>
                </div>
            </div>
        </div>
    );
}
