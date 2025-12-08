'use client';

import React, { useState, useEffect, useRef } from 'react';
import projectsConfig from '../config/projects.json';

type ProjectConfig = { id: string; name: string };
const PROJECT_NAME_MAP = Object.fromEntries(
    (projectsConfig.projects as ProjectConfig[]).map((project) => [project.id, project.name])
) as Record<string, string>;

const getProjectName = (projectId: string) => PROJECT_NAME_MAP[projectId] || projectId.toUpperCase();

type Tab = 'chat' | 'history' | 'controls' | 'dev-chat' | 'logs' | 'git';
type Mode = 'agent' | 'dev';

interface Message {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    code?: string;
    timestamp: number;
    attachments?: File[];
}

interface ChatHistory {
    id: string;
    title: string;
    messages: Message[];
    created: number;
    updated: number;
}

interface AgentSidebarProps {
    projectId?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AgentSidebar({ projectId = 'default' }: AgentSidebarProps) {
    const [mode, setMode] = useState<Mode>('agent');
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Chat states
    const [chats, setChats] = useState<Record<string, Message[]>>({
        sk: [],
        mt: [],
        ss: [],
        default: []
    });

    // History states
    const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
    const [selectedHistory, setSelectedHistory] = useState<string | null>(null);

    // Dev logs state
    const [logs, setLogs] = useState<string[]>([
        '[14:05:22] ✅ Система запущена',
        '[14:05:23] ℹ️ Подключение к Google Drive...',
        '[14:05:24] ✅ Подключение установлено'
    ]);
    const projectName = getProjectName(projectId);

    const PROJECT_CONFIG: Record<string, { sheetId: string; sheetName: string }> = {
        sk: { sheetId: '1CpYYLvRYslsyCkuLzL9EbbjsvbNpWCEZcmhKqMoX5zw', sheetName: 'Sheet1' },
        mt: { sheetId: '1fMOjUE7oZV96fCY5j5rPxnhWGJkDqg-GfwPZ8jUVgPw', sheetName: 'Sheet1' },
        ss: { sheetId: 'placeholder_ss_id', sheetName: 'Sheet1' },
        default: { sheetId: 'placeholder_default_id', sheetName: 'Sheet1' }
    };

    const handleSend = async () => {
        if (!input.trim() && attachments.length === 0) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
            timestamp: Date.now(),
            attachments: attachments.length > 0 ? attachments : undefined
        };

        setChats(prev => ({
            ...prev,
            [projectId]: [...(prev[projectId] || []), userMessage]
        }));

        setInput('');
        setAttachments([]);

        if (mode === 'agent') {
            try {
                const config = PROJECT_CONFIG[projectId] || PROJECT_CONFIG.default;

                const response = await fetch(`${API_BASE_URL}/api/agents/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: userMessage.text,
                        spreadsheet_id: config.sheetId,
                        sheet_name: config.sheetName,
                        context: {}
                    })
                });

                const data = await response.json();

                if (data.status === 'success') {
                    const agentMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        sender: 'agent',
                        text: data.message,
                        timestamp: Date.now()
                    };
                    setChats(prev => ({
                        ...prev,
                        [projectId]: [...(prev[projectId] || []), agentMessage]
                    }));
                } else {
                    const errorMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        sender: 'agent',
                        text: `❌ Ошибка: ${data.message}`,
                        timestamp: Date.now()
                    };
                    setChats(prev => ({
                        ...prev,
                        [projectId]: [...(prev[projectId] || []), errorMessage]
                    }));
                }

            } catch (error) {
                console.error('Agent API Error:', error);
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: 'agent',
                    text: '❌ Ошибка соединения с сервером.',
                    timestamp: Date.now()
                };
                setChats(prev => ({
                    ...prev,
                    [projectId]: [...(prev[projectId] || []), errorMessage]
                }));
            }
        } else {
            setTimeout(() => {
                const devMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: 'agent',
                    text: '🛠️ Понял задачу. Создаю новую функцию...',
                    timestamp: Date.now()
                };
                setChats(prev => ({
                    ...prev,
                    [projectId]: [...(prev[projectId] || []), devMessage]
                }));
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔨 Начата разработка новой функции`]);
            }, 500);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };

    const handleSaveHistory = () => {
        const currentMessages = chats[projectId] || [];
        if (currentMessages.length === 0) return;

        const newHistory: ChatHistory = {
            id: Date.now().toString(),
            title: `Сессия ${projectName} - ${new Date().toLocaleString()}`,
            messages: currentMessages,
            created: Date.now(),
            updated: Date.now()
        };

        setChatHistories(prev => [newHistory, ...prev]);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 💾 История сохранена на Google Drive`]);
    };

    const handleLoadHistory = (historyId: string) => {
        const history = chatHistories.find(h => h.id === historyId);
        if (history) {
            setChats(prev => ({
                ...prev,
                [projectId]: history.messages
            }));
            setSelectedHistory(historyId);
            setActiveTab('chat');
        }
    };

    const visibleTabs: { id: Tab; label: string; icon: string }[] = mode === 'agent'
        ? [
            { id: 'chat', label: 'Чат', icon: '💬' },
            { id: 'history', label: 'История', icon: '📚' },
            { id: 'controls', label: 'Управление', icon: '⚙️' },
        ]
        : [
            { id: 'dev-chat', label: 'Чат', icon: '💻' },
            { id: 'logs', label: 'Логи', icon: '📋' },
            { id: 'git', label: 'Git', icon: '📊' },
        ];

    const currentChat = chats[projectId] || [];

    useEffect(() => {
        if (!visibleTabs.find(t => t.id === activeTab)) {
            setActiveTab(visibleTabs[0].id);
        }
    }, [mode, projectId]);

    return (
        <div className="flex flex-col h-full text-base font-sans select-none">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/40 sticky top-0 z-10 backdrop-blur-md">
                {(['agent', 'dev'] as Mode[]).map((m) => {
                    const active = m === mode;
                    return (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`
                                flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
                                flex items-center justify-center gap-2 border shadow-sm
                                ${active
                                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-md transform scale-[1.02]'
                                    : 'bg-white/60 border-transparent text-[var(--text-secondary)] hover:bg-white'}
                            `}
                        >
                            <span className="text-base">{m === 'agent' ? '🤖' : '👨‍💻'}</span>
                            <span>{m === 'agent' ? 'Агент' : 'Dev'}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="px-4 pb-2 bg-white/40 backdrop-blur-md">
                <div className="flex bg-gray-100/50 p-1 rounded-xl">
                    {visibleTabs.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200
                                    flex items-center justify-center gap-2
                                    ${active
                                        ? 'bg-white text-[var(--text-primary)] shadow-sm'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                                `}
                            >
                                <span className="text-xs">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {(activeTab === 'chat' || activeTab === 'dev-chat') && (
                    <>
                        {currentChat.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[var(--text-secondary)]">
                                <div className="text-5xl mb-4 opacity-50">{activeTab === 'chat' ? '💬' : '💻'}</div>
                                <p className="text-sm font-medium">
                                    Нет сообщений для проекта {projectName}
                                </p>
                            </div>
                        )}

                        {currentChat.map((msg) => {
                            const isUser = msg.sender === 'user';
                            const isError = msg.text.startsWith('❌');

                            return (
                                <div key={msg.id} className={`flex flex-col space-y-1 animate-fade-in ${isUser ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                        max-w-[90%] p-4 text-sm leading-relaxed shadow-sm backdrop-blur-sm
                                        ${isUser
                                            ? 'bg-white rounded-2xl rounded-tr-sm text-[var(--text-primary)] border border-white/60'
                                            : isError
                                                ? 'bg-red-50/90 border border-red-200 text-red-700 rounded-2xl rounded-tl-sm shadow-red-100'
                                                : 'bg-blue-50/60 border border-blue-100 text-[var(--text-primary)] rounded-2xl rounded-tl-sm'}
                                    `}>
                                        <p>{msg.text}</p>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-black/5 flex flex-wrap gap-2">
                                                {msg.attachments.map((file, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 text-xs bg-black/5 px-2 py-1 rounded-md">
                                                        📎 {file.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-[var(--text-muted)] font-medium px-1">
                                        {isUser ? 'Вы' : (activeTab === 'dev-chat' ? 'Dev' : 'Agent')} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })}
                    </>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-3">
                        <button
                            onClick={handleSaveHistory}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>💾</span>
                            <span>Сохранить текущий чат</span>
                        </button>

                        {chatHistories.length === 0 ? (
                            <div className="text-center py-10 text-[var(--text-secondary)] italic text-sm">
                                Нет сохраненных сессий
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {chatHistories.map((history) => (
                                    <button
                                        key={history.id}
                                        onClick={() => handleLoadHistory(history.id)}
                                        className="w-full glass-panel p-4 rounded-xl text-left hover:bg-white/80 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-[var(--text-primary)]">{history.title}</span>
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{history.messages.length}</span>
                                        </div>
                                        <span className="text-[10px] text-[var(--text-secondary)]">
                                            {new Date(history.created).toLocaleString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'logs' && (
                    <div className="glass-panel p-4 rounded-xl font-mono text-[10px] space-y-1.5 bg-gray-900/5 border-gray-200">
                        {logs.map((log, idx) => (
                            <div key={idx} className="flex gap-2 text-[var(--text-secondary)] border-b border-dashed border-gray-200/50 pb-1 last:border-0">
                                {log}
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'controls' && (
                    <div className="space-y-4">
                        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 bg-emerald-50/50 border-emerald-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                            <span className="text-sm font-semibold text-emerald-800">Система активна</span>
                        </div>

                        <div className="space-y-2">
                            {['Просмотр Google Drive', 'Управление таблицами', 'Обучение агента'].map((action, i) => (
                                <button key={i} className="w-full glass-panel p-3 rounded-xl flex items-center gap-3 hover:bg-white/80 transition-all text-sm font-medium text-[var(--text-primary)]">
                                    <span className="text-lg">{['📁', '📊', '🎓'][i]}</span>
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'git' && (
                    <div className="space-y-4">
                        <div className="glass-panel p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Status</span>
                                <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Clean</span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-xs font-mono text-[var(--text-primary)] bg-white/50 p-2 rounded-lg border border-white/50">
                                    feat: UI updates
                                </div>
                                <div className="text-xs font-mono text-[var(--text-primary)] bg-white/50 p-2 rounded-lg border border-white/50">
                                    fix: layout responsiveness
                                </div>
                            </div>
                            <button className="w-full py-2 bg-[var(--text-primary)] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                                Sync Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            {(activeTab === 'chat' || activeTab === 'dev-chat') && (
                <div className="p-4 bg-white/40 backdrop-blur-md border-t border-[var(--border)]">
                    {attachments.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-1">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-xs shadow-sm border border-gray-100">
                                    <span>📎 {file.name}</span>
                                    <button onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="hover:text-red-500">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            placeholder={`✍️ Сообщение для ${projectName}...`}
                            className="input-ios w-full min-h-[50px] max-h-[150px] resize-none pr-24 py-3 shadow-inner bg-white/50 focus:bg-white transition-colors"
                            rows={1}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-indigo-50 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() && attachments.length === 0}
                                className="p-2 rounded-lg bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
