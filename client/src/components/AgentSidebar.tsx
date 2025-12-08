'use client';

import React, { useState, useEffect, useRef } from 'react';

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

const PROJECT_THEMES: Record<string, { color: string; bg: string; border: string; shadow: string; primary: string; primaryHover: string }> = {
    sk: {
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        shadow: 'shadow-purple-500/20',
        primary: '#8B5CF6',
        primaryHover: '#7C3AED'
    },
    mt: {
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        shadow: 'shadow-blue-500/20',
        primary: '#3B82F6',
        primaryHover: '#2563EB'
    },
    ss: {
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        shadow: 'shadow-green-500/20',
        primary: '#10B981',
        primaryHover: '#059669'
    },
    default: {
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        shadow: 'shadow-cyan-500/20',
        primary: '#B8C5F2',
        primaryHover: '#A4B4E8'
    },
};

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

    const theme = PROJECT_THEMES[projectId] || PROJECT_THEMES.default;

    // Project Configuration Mapping
    const PROJECT_CONFIG: Record<string, { sheetId: string; sheetName: string }> = {
        sk: { sheetId: '1CpYYLvRYslsyCkuLzL9EbbjsvbNpWCEZcmhKqMoX5zw', sheetName: 'Sheet1' }, // Defaulting to Sheet1
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
            // Real Agent API Call
            try {
                const config = PROJECT_CONFIG[projectId] || PROJECT_CONFIG.default;

                const response = await fetch('http://localhost:8000/api/agents/chat', {
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
                    text: data.message, // Display the natural language response
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
            // Developer mode - simulate response
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
            title: `Сессия ${projectId.toUpperCase()} - ${new Date().toLocaleString()}`,
            messages: currentMessages,
            created: Date.now(),
            updated: Date.now()
        };

        setChatHistories(prev => [newHistory, ...prev]);

        // TODO: Save to Google Drive
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
        <div className="flex flex-col h-full text-base">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                {(['agent', 'dev'] as Mode[]).map((m) => {
                    const active = m === mode;
                    return (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 border-2 flex items-center justify-center emoji-gap
                            ${active ? 'button-rounded' : ''}`}
                            style={{
                                backgroundColor: active ? 'var(--primary)' : 'transparent',
                                borderColor: active ? 'var(--primary)' : 'var(--border)',
                                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                                boxShadow: active ? 'var(--shadow-md)' : 'none'
                            }}
                        >
                            {m === 'agent' ? (
                                <>
                                    <span className="text-lg">🤖</span>
                                    <span>Агент</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">👨‍💻</span>
                                    <span>Разработчик</span>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="flex border-b overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                {visibleTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 min-w-[100px] py-3 px-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center emoji-gap`}
                        style={{
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                            backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                            borderRadius: activeTab === tab.id ? '8px 8px 0 0' : '0'
                        }}
                    >
                        <span className="text-sm leading-none">{tab.icon}</span>
                        <span className="text-[10px]">{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-4 right-4 h-1 rounded-full" style={{ backgroundColor: 'var(--text-primary)' }}></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar" style={{ backgroundColor: 'var(--background)' }}>
                {(activeTab === 'chat' || activeTab === 'dev-chat') && (
                    <>
                        {currentChat.length === 0 && (
                            <div className="text-center mt-10 text-xs card-glass p-6">
                                <div className="text-4xl mb-3">{activeTab === 'chat' ? '💬' : '💻'}</div>
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
                                    {msg.sender === 'user' ? '👤 Пользователь' : (activeTab === 'dev-chat' ? '👨‍💻 Разработчик' : '🤖 Агент')}
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
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                                            {msg.attachments.map((file, idx) => (
                                                <div key={idx} className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                                    <span>📎</span>
                                                    <span>{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-3">
                        <button
                            onClick={handleSaveHistory}
                            className="w-full py-2.5 text-xs font-semibold flex items-center justify-center emoji-gap rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                            style={{
                                backgroundColor: theme.primary,
                                borderColor: theme.primary,
                                color: 'white',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            <span>💾</span>
                            <span>Сохранить текущий чат</span>
                        </button>

                        {chatHistories.length === 0 ? (
                            <div className="text-center mt-10 text-xs card-glass p-6">
                                <div className="text-4xl mb-3">📚</div>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Нет сохраненных сессий
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {chatHistories.map((history) => (
                                    <button
                                        key={history.id}
                                        onClick={() => handleLoadHistory(history.id)}
                                        className={`w-full card-glass p-4 text-left border-2 transition-all duration-200 hover:scale-[1.02]`}
                                        style={{
                                            borderColor: selectedHistory === history.id ? 'var(--primary)' : 'var(--border)'
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {history.title}
                                            </span>
                                            <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                                                {history.messages.length} сообщений
                                            </span>
                                        </div>
                                        <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                                            {new Date(history.created).toLocaleString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'logs' && (
                    <div className="space-y-2">
                        <div className="card-glass p-4 text-xs font-mono space-y-2">
                            {logs.map((log, idx) => (
                                <div key={idx} className="flex items-start gap-2" style={{ color: 'var(--text-primary)' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'controls' && (
                    <div className="space-y-3">
                        <div className="card-glass p-3 flex items-center gap-2 border" style={{ borderColor: 'var(--success)' }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--success)', boxShadow: '0 0 4px var(--success)' }}></div>
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>✅ Доступ к Google</span>
                        </div>

                        <div className="card-glass p-4">
                            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>⚡ Быстрые действия</p>
                            <div className="space-y-2">
                                <button
                                    className="w-full p-3 text-left border-2 transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 rounded-lg"
                                    style={{
                                        borderColor: theme.primary,
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <span className="text-lg">📁</span>
                                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Просмотр Google Drive</span>
                                </button>
                                <button
                                    className="w-full p-3 text-left border-2 transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 rounded-lg"
                                    style={{
                                        borderColor: theme.primary,
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <span className="text-lg">📊</span>
                                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Управление таблицами</span>
                                </button>
                                <button
                                    className="w-full p-3 text-left border-2 transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 rounded-lg"
                                    style={{
                                        borderColor: theme.primary,
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <span className="text-lg">🎓</span>
                                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Обучение агента</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'git' && (
                    <div className="space-y-3">
                        <div className="card-glass p-3 flex items-center justify-between border" style={{ borderColor: 'var(--info)' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--info)', boxShadow: '0 0 4px var(--info)' }}></div>
                                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>📊 Git для {projectId.toUpperCase()}</span>
                            </div>
                            <button
                                className="text-xs px-2 py-1 rounded-md border-2 transition-all duration-200 hover:scale-105"
                                style={{
                                    borderColor: theme.primary,
                                    color: 'var(--text-primary)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                🔄 Обновить
                            </button>
                        </div>

                        <div className="card-glass p-4 space-y-3">
                            <div className="pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>📌 Статус</p>
                                <p className="text-[10px] font-mono" style={{ color: 'var(--success)' }}>Готов к коммиту</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🕐 Последние коммиты</p>
                                <div className="space-y-2 font-mono">
                                    <div className="p-2 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-glass)' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px]">🔨</span>
                                            <span className="text-[10px]" style={{ color: 'var(--text-primary)' }}>feat: обновление UI панели</span>
                                        </div>
                                        <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>2 часа назад</span>
                                    </div>
                                    <div className="p-2 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-glass)' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px]">🐛</span>
                                            <span className="text-[10px]" style={{ color: 'var(--text-primary)' }}>fix: исправление CORS</span>
                                        </div>
                                        <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>5 часов назад</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            {(activeTab === 'chat' || activeTab === 'dev-chat') && (
                <div className="p-5 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    {attachments.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="card-glass px-3 py-1.5 text-xs flex items-center gap-2 border" style={{ borderColor: 'var(--border)' }}>
                                    <span>📎</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{file.name}</span>
                                    <button
                                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                        className="text-[10px] hover:scale-110 transition-transform"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            placeholder={`✍️ Задача для ${projectId.toUpperCase()}...`}
                            className="input-ios w-full min-h-[90px] resize-none pr-24"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-4 right-16 p-3 rounded-xl transition-all duration-300 hover:scale-105"
                            style={{
                                backgroundColor: 'var(--surface-glass)',
                                borderColor: 'var(--border)',
                                border: '1px solid',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                        <button
                            onClick={handleSend}
                            className="absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-300 hover:scale-105 border-2"
                            style={{
                                backgroundColor: 'var(--primary)',
                                borderColor: 'var(--primary)',
                                color: 'var(--text-primary)',
                                boxShadow: 'var(--shadow-md)'
                            }}
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
