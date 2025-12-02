'use client';

import React, { useState, useEffect } from 'react';

type Tab = 'chat' | 'logs' | 'git';

interface Message {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    code?: string;
    timestamp: number;
}

interface AgentSidebarProps {
    projectId?: string;
}

const PROJECT_THEMES: Record<string, { color: string; bg: string; border: string; shadow: string }> = {
    sk: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', shadow: 'shadow-purple-500/20' },
    mt: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', shadow: 'shadow-blue-500/20' },
    ss: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', shadow: 'shadow-green-500/20' },
    default: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/20' },
};

export default function AgentSidebar({ projectId = 'default' }: AgentSidebarProps) {
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [input, setInput] = useState('');

    // Chat history per project
    const [chats, setChats] = useState<Record<string, Message[]>>({
        sk: [],
        mt: [],
        ss: [],
        default: []
    });

    const theme = PROJECT_THEMES[projectId] || PROJECT_THEMES.default;

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
            timestamp: Date.now()
        };

        setChats(prev => ({
            ...prev,
            [projectId]: [...(prev[projectId] || []), newMessage]
        }));

        setInput('');

        // Mock Agent Response
        setTimeout(() => {
            const response: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                text: `[${projectId.toUpperCase()}] Принято. Анализирую запрос...`,
                timestamp: Date.now()
            };
            setChats(prev => ({
                ...prev,
                [projectId]: [...(prev[projectId] || []), response]
            }));
        }, 1000);
    };

    const currentChat = chats[projectId] || [];

    return (
        <div className="flex flex-col h-full text-gray-200 text-sm">
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-white/5 backdrop-blur-xl">
                {['chat', 'logs', 'git'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as Tab)}
                        className={`relative flex-1 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300
              ${activeTab === tab
                                ? `${theme.color} ${theme.bg} shadow-[0_10px_30px_rgba(0,0,0,0.1)]`
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
            `}
                    >
                        {activeTab === tab && (
                            <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-current opacity-50`}></div>
                        )}
                        {tab === 'chat' ? 'чат' : tab === 'logs' ? 'логи' : 'git'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {activeTab === 'chat' && (
                    <>
                        {currentChat.length === 0 && (
                            <div className="text-center text-gray-500 mt-10 text-xs">
                                Нет сообщений для проекта {projectId.toUpperCase()}
                            </div>
                        )}

                        {currentChat.map((msg) => (
                            <div key={msg.id} className={`flex flex-col space-y-1.5 animate-in slide-in-from-${msg.sender === 'user' ? 'right' : 'left'} duration-300`}>
                                <span className={`text-xs ${msg.sender === 'user' ? 'text-gray-500 ml-auto' : theme.color} font-semibold`}>
                                    {msg.sender === 'user' ? 'Пользователь' : 'Агент'}
                                </span>
                                <div className={`
                                    p-4 rounded-2xl max-w-[90%] border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.4)]
                                    ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-[#111827] to-[#0b1220] rounded-tr-md self-end'
                                        : `bg-gradient-to-br from-[#1a1a1a] to-[#101010] rounded-tl-md self-start ${theme.border}`}
                                `}>
                                    <p className="text-gray-200">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
                {activeTab === 'logs' && (
                    <div className="text-xs text-gray-500 font-mono">
                        <div className="mb-1"><span className="text-green-500">[14:05:22]</span> {projectId.toUpperCase()}: Синхронизация начата...</div>
                        <div className="mb-1"><span className="text-blue-500">[14:05:23]</span> {projectId.toUpperCase()}: Получение заголовков...</div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder={`Задача для ${projectId.toUpperCase()}...`}
                        className={`w-full bg-[#0c1322] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-opacity-50 focus:ring-1 focus:ring-opacity-30 min-h-[90px] resize-none text-gray-200 placeholder-gray-600 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all duration-300 ${theme.border}`}
                    />
                    <button
                        onClick={handleSend}
                        className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-300 text-white shadow-lg hover:scale-105 ${theme.bg} ${theme.color} border ${theme.border}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
