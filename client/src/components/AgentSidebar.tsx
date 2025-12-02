'use client';

import React, { useState, useEffect } from 'react';

type Tab = 'chat' | 'logs' | 'git' | 'controls';
type Mode = 'agent' | 'dev';

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
    const [mode, setMode] = useState<Mode>('agent');
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

    const visibleTabs: { id: Tab; label: string }[] = mode === 'agent'
        ? [
            { id: 'chat', label: 'чат' },
            { id: 'controls', label: 'управление' },
        ]
        : [
            { id: 'logs', label: 'логи' },
            { id: 'git', label: 'git' },
        ];

    const currentChat = chats[projectId] || [];

    useEffect(() => {
        if (!visibleTabs.find(t => t.id === activeTab)) {
            setActiveTab(visibleTabs[0].id);
        }
    }, [mode, projectId]);

    return (
        <div className="flex flex-col h-full text-sm">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                {(['agent', 'dev'] as Mode[]).map((m) => {
                    const active = m === mode;
                    return (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 border-2
                            ${active ? 'button-rounded' : ''}`}
                            style={{
                                backgroundColor: active ? 'var(--primary)' : 'transparent',
                                borderColor: active ? 'var(--primary)' : 'var(--border)',
                                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                                boxShadow: active ? 'var(--shadow-md)' : 'none'
                            }}
                        >
                            {m === 'agent' ? '🤖 Агент' : '👨‍💻 Разработчик'}
                        </button>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                {visibleTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300`}
                        style={{
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                            backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent'
                        }}
                    >
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-4 right-4 h-1 rounded-full opacity-80" style={{ backgroundColor: 'var(--text-primary)' }}></div>
                        )}
                        {tab.id === 'chat' && '💬 '}
                        {tab.id === 'logs' && '📋 '}
                        {tab.id === 'git' && '📊 '}
                        {tab.id === 'controls' && '⚙️ '}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar" style={{ backgroundColor: 'var(--background)' }}>
                {activeTab === 'chat' && (
                    <>
                        {currentChat.length === 0 && (
                            <div className="text-center mt-10 text-xs card-glass p-6">
                                <div className="text-4xl mb-3">💬</div>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Нет сообщений для проекта {projectId.toUpperCase()}
                                </p>
                            </div>
                        )}

                        {currentChat.map((msg) => (
                            <div key={msg.id} className={`flex flex-col space-y-1.5 animate-fade-in`}>
                                <span className="text-xs font-semibold" style={{
                                    color: 'var(--text-secondary)',
                                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                                }}>
                                    {msg.sender === 'user' ? '👤 Пользователь' : '🤖 Агент'}
                                </span>
                                <div className={`
                                    card-glass p-4 max-w-[90%] border-2
                                    ${msg.sender === 'user'
                                        ? 'rounded-tr-md self-end'
                                        : 'rounded-tl-md self-start'}
                                `}
                                style={{
                                    borderColor: msg.sender === 'user' ? 'var(--secondary)' : 'var(--primary)'
                                }}>
                                    <p style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
                {activeTab === 'logs' && (
                    <div className="text-xs font-mono card-glass p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <span style={{ color: 'var(--success)' }}>✅ [14:05:22]</span>
                            <span style={{ color: 'var(--text-primary)' }}>{projectId.toUpperCase()}: Синхронизация начата...</span>
                        </div>
                        <div className="mb-2 flex items-center gap-2">
                            <span style={{ color: 'var(--info)' }}>ℹ️ [14:05:23]</span>
                            <span style={{ color: 'var(--text-primary)' }}>{projectId.toUpperCase()}: Получение заголовков...</span>
                        </div>
                    </div>
                )}
                {activeTab === 'controls' && (
                    <div className="space-y-3 text-sm">
                        <div className="badge" style={{ background: 'var(--success)' }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }}></span>
                            <span style={{ color: 'var(--text-primary)' }}>Доступ к Google</span>
                        </div>
                        <div className="card-glass p-4">
                            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>⚡ Быстрые действия:</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><span>📁</span><span style={{ color: 'var(--text-primary)' }}>Подключить Google Drive</span></li>
                                <li className="flex items-center gap-2"><span>📊</span><span style={{ color: 'var(--text-primary)' }}>Управление таблицами</span></li>
                                <li className="flex items-center gap-2"><span>🎓</span><span style={{ color: 'var(--text-primary)' }}>Обучение агенту</span></li>
                            </ul>
                        </div>
                    </div>
                )}
                {activeTab === 'git' && (
                    <div className="text-xs space-y-3 font-mono">
                        <div className="badge" style={{ background: 'var(--info)' }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--info)' }}></span>
                            <span style={{ color: 'var(--text-primary)' }}>История Git для {projectId.toUpperCase()}</span>
                        </div>
                        <div className="card-glass p-4">
                            <p style={{ color: 'var(--text-primary)' }}>📌 git status — готов к коммиту</p>
                            <p style={{ color: 'var(--text-secondary)' }}>Последний коммит: обновление UI</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            {activeTab === 'chat' && (
                <div className="p-5 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            placeholder={`✍️ Задача для ${projectId.toUpperCase()}...`}
                            className="input-ios w-full min-h-[90px] resize-none pr-16"
                        />
                        <button
                            onClick={handleSend}
                            className="absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-300 hover:scale-105 button-rounded btn-primary"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
