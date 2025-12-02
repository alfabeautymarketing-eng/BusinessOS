'use client';

import React, { useState } from 'react';

type Tab = 'chat' | 'logs' | 'git';

export default function AgentSidebar() {
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [input, setInput] = useState('');
    const tabs: { id: Tab; label: string }[] = [
        { id: 'chat', label: 'чат' },
        { id: 'logs', label: 'логи' },
        { id: 'git', label: 'git' },
    ];

    return (
        <div className="flex flex-col h-full text-gray-200 text-sm">
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-white/5 backdrop-blur-xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300
              ${activeTab === tab.id
                                ? 'text-cyan-200 bg-cyan-500/10 shadow-[0_10px_30px_rgba(34,211,238,0.16)]'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
            `}
                    >
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 rounded-full"></div>
                        )}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {activeTab === 'chat' && (
                    <>
                        {/* Example Messages */}
                        <div className="flex flex-col space-y-1.5 animate-in slide-in-from-right duration-300">
                            <span className="text-xs text-gray-500 ml-auto font-semibold">Пользователь</span>
                            <div className="bg-gradient-to-br from-[#111827] to-[#0b1220] p-4 rounded-2xl rounded-tr-md self-end max-w-[90%] border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                                <p className="text-gray-200">Если <span className="text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded-md font-semibold">#Column:Date</span> пустая, ставь сегодняшнюю.</p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-1.5 animate-in slide-in-from-left duration-300">
                            <span className="text-xs text-purple-300 font-semibold">Агент</span>
                            <div className="bg-gradient-to-br from-purple-900/25 via-blue-900/15 to-purple-900/20 p-4 rounded-2xl rounded-tl-md self-start max-w-[90%] border border-purple-500/30 shadow-[0_15px_45px_rgba(168,85,247,0.18)]">
                                <p className="mb-3 text-gray-200">Готово. Скрипт <code className="text-purple-200 font-mono text-sm">autoDate.gs</code> задеплоен. Триггер <code className="text-blue-200 font-mono text-sm">onEdit</code> установлен.</p>
                                {/* Code Snippet Card */}
                                <div className="bg-[#0a0f1c] p-3 rounded-lg border border-purple-500/30 text-xs font-mono text-gray-300 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                                    <div className="flex justify-between items-center mb-2 border-b border-purple-500/20 pb-2">
                                        <span className="text-purple-200 font-semibold">autoDate.gs</span>
                                        <span className="flex items-center gap-1.5 text-[10px] text-green-300 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/30">
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
                        <div className="mb-1"><span className="text-green-500">[14:05:22]</span> Синхронизация начата...</div>
                        <div className="mb-1"><span className="text-blue-500">[14:05:23]</span> Получение заголовков...</div>
                        <div className="mb-1"><span className="text-yellow-500">[14:05:25]</span> Внимание: Ячейка A5 пуста</div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Опишите задачу для агента..."
                        className="w-full bg-[#0c1322] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-500/30 min-h-[90px] resize-none text-gray-200 placeholder-gray-600 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all duration-300"
                    />
                    <button className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 text-white shadow-[0_15px_35px_rgba(34,211,238,0.25)] hover:scale-105">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="mt-3 flex space-x-2 overflow-x-auto pb-1 items-center text-[11px]">
                    {/* Quick Actions / Context Chips */}
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider py-1 font-semibold">Контекст:</span>
                    <button className="px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 transition-all duration-200">Выделение</button>
                    <button className="px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 transition-all duration-200">Активный лист</button>
                </div>
            </div>
        </div>
    );
}
