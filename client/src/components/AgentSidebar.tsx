'use client';

import React, { useState } from 'react';

type Tab = 'chat' | 'logs' | 'git';

export default function AgentSidebar() {
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [input, setInput] = useState('');

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[#1a1a1a] to-[#141414] text-gray-300 text-sm">
            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-gradient-to-r from-[#1c1c1c] to-[#181818]">
                {['chat', 'logs', 'git'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as Tab)}
                        className={`relative flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300
              ${activeTab === tab
                                ? 'text-purple-400 bg-gradient-to-b from-purple-500/15 to-purple-500/5'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
            `}
                    >
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                        )}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {activeTab === 'chat' && (
                    <>
                        {/* Example Messages */}
                        <div className="flex flex-col space-y-1.5 animate-in slide-in-from-right duration-300">
                            <span className="text-xs text-gray-500 ml-auto font-semibold">User</span>
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl rounded-tr-md self-end max-w-[90%] border border-gray-700/50 shadow-lg">
                                <p className="text-gray-200">Если <span className="text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded-md font-semibold">#Column:Date</span> пустая, ставь сегодняшнюю.</p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-1.5 animate-in slide-in-from-left duration-300">
                            <span className="text-xs text-purple-400 font-semibold">Agent</span>
                            <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 p-4 rounded-2xl rounded-tl-md self-start max-w-[90%] border border-purple-500/30 shadow-lg shadow-purple-500/10">
                                <p className="mb-3 text-gray-200">Готово. Скрипт <code className="text-purple-300 font-mono text-sm">autoDate.gs</code> задеплоен. Триггер <code className="text-blue-300 font-mono text-sm">onEdit</code> установлен.</p>
                                {/* Code Snippet Card */}
                                <div className="bg-[#0d0d0d] p-3 rounded-lg border border-purple-500/20 text-xs font-mono text-gray-400 shadow-inner">
                                    <div className="flex justify-between items-center mb-2 border-b border-purple-500/20 pb-2">
                                        <span className="text-purple-300 font-semibold">autoDate.gs</span>
                                        <span className="flex items-center gap-1.5 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            Active
                                        </span>
                                    </div>
                                    <pre className="overflow-x-auto text-gray-300">
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
            <div className="p-5 border-t border-white/5 bg-gradient-to-b from-[#1a1a1a] to-[#151515]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Опишите задачу для агента..."
                        className="w-full bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-purple-500/20 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 min-h-[90px] resize-none text-gray-200 placeholder-gray-500 shadow-inner transition-all duration-300"
                    />
                    <button className="absolute bottom-4 right-4 p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="mt-3 flex space-x-2 overflow-x-auto pb-1">
                    {/* Quick Actions / Context Chips */}
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider py-1 font-semibold">Контекст:</span>
                    <button className="px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:from-gray-700 hover:to-gray-800 border border-gray-700/50 hover:border-gray-600 transition-all duration-200">Selection</button>
                    <button className="px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:from-gray-700 hover:to-gray-800 border border-gray-700/50 hover:border-gray-600 transition-all duration-200">Active Sheet</button>
                </div>
            </div>
        </div>
    );
}
