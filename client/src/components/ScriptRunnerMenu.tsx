'use client';

import React, { useMemo, useState } from 'react';
import projectsConfig from '../config/projects.json';
import { useAppContext } from '../hooks/useAppContext';
import { ContextManager } from '../lib/contextManager';
import type { MenuSection } from '../types/context';

type ProjectConfig = { id: string; name: string };
type ProjectId = 'sk' | 'mt' | 'ss' | 'cosmetic' | string;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PROJECT_NAME_MAP = Object.fromEntries(
    (projectsConfig.projects as ProjectConfig[]).map((project) => [project.id, project.name])
) as Record<string, string>;

const getProjectName = (projectId: string) => PROJECT_NAME_MAP[projectId] || projectId.toUpperCase();

interface ScriptRunnerMenuProps {
    projectId?: string; // Kept for backward compatibility but will use context instead
}

type StatusState = { type: 'idle' | 'running' | 'success' | 'error'; message: string };

const ORDER_FUNCTIONS = {
    MAIN: { sk: 'processSkPriceSheet', ss: 'processSsPriceSheet', mt: 'processMtMainPrice' },
    STOCKS: { sk: 'loadSkStockData', ss: 'loadSsStockData', mt: 'loadMtStockData' },
    NEW_PRICE_YEAR: 'addNewYearColumnsToPriceDynamics',
};

const ORDER_STAGE_FUNCTIONS = {
    SORT_MANUFACTURER: { sk: 'sortSkOrderByManufacturer', ss: 'sortSsOrderByManufacturer', mt: 'sortMtOrderByManufacturer' },
    SORT_PRICE: { sk: 'sortSkOrderByPrice', ss: 'sortSsOrderByPrice', mt: 'sortMtOrderByPrice' },
    STAGE_ALL: 'showAllOrderData',
    STAGE_ORDER: 'showOrderStage',
    STAGE_PROMOTIONS: 'showPromotionsStage',
    STAGE_SET: 'showSetStage',
    STAGE_PRICE: 'showPriceStage',
};

const COMMON_SECTIONS: MenuSection[] = [
    {
        id: 'EXPORT',
        title: 'Выгрузка',
        icon: '📤',
        items: [
            { label: 'Выгрузить Акции', fn: 'exportPromotions', icon: '📤' },
            { label: 'Выгрузить Наборы', fn: 'exportSets', icon: '📦' },
        ],
    },
    {
        id: 'SUPPLY',
        title: 'Поставка',
        icon: '🚚',
        items: [
            { label: "Форматировать лист 'Ордер'", fn: 'formatOrderSheet', icon: '📋' },
            { separator: true },
            { label: "1. Создать лист 'Для инвойса'", fn: 'createFullInvoice', icon: '1️⃣' },
            { label: "2. Собрать документы", fn: 'collectAndCopyDocuments', icon: '2️⃣' },
        ],
    },
    {
        id: 'CERTIFICATION',
        title: 'Сертификация',
        icon: '✅',
        items: [
            { label: 'Лист новинки', fn: 'createNewsSheetFromCertification', icon: '🆕' },
            { separator: true },
            { label: 'Создать заявку протоколы (353пп)', fn: 'generateProtocols_353pp', icon: '📄' },
            { label: 'Создать заявку ДС (353пп)', fn: 'generateDsLayouts_353pp', icon: '📑' },
            { label: 'Собрать документы для заявки (353пп)', fn: 'structureDocuments_353pp', icon: '🗂️' },
            { separator: true },
            { label: 'Посчитать спирты', fn: 'calculateAndAssignSpiritNumbers', icon: '🧪' },
            { label: 'Создать Макеты спирты', fn: 'generateSpiritProtocols', icon: '🖼️' },
            { separator: true },
            { label: 'Пересчитать каскады (Сертификация)', fn: 'runManualCascadeOnCertification', icon: '🔄' },
        ],
    },
    {
        id: 'SYNC',
        title: 'Синхронизация',
        icon: '🔄',
        items: [
            { label: 'Настроить правила', fn: 'showSyncConfigDialog', icon: '🔧' },
            { label: 'Управление внешними документами', fn: 'showExternalDocManagerDialog', icon: '📂' },
            { separator: true },
            {
                submenu: 'Операции с артикулами',
                icon: '🧾',
                items: [
                    { label: 'Добавить артикул', fn: 'addArticleManually', icon: '➕' },
                    { label: 'Удалить выбранные строки', fn: 'deleteSelectedRowsWithSync', icon: '🗑️' },
                    { separator: true },
                    { label: 'Синхронизировать строку', fn: 'syncSelectedRow', icon: '🔄' },
                    { label: 'Синхронизировать ВСЁ', fn: 'runFullSync', icon: '🔁' },
                ],
            },
            { separator: true },
            { label: 'Установить триггеры', fn: 'setupTriggers', icon: '⏰' },
            { separator: true },
            {
                submenu: 'Журнал',
                icon: '📓',
                items: [
                    { label: 'Очистить (оставить 100)', fn: 'quickCleanLogSheet', icon: '🧹' },
                    { label: 'Пересоздать журнал', fn: 'recreateLogSheet', icon: '♻️' },
                ],
            },
        ],
    },
];

const COSMETIC_SECTION: MenuSection = {
    id: 'COSMETIC_ANALYSIS',
    title: 'Анализ косметики',
    icon: '💄',
    special: true,
    items: [],
};

const compactItems = (items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];

    items.forEach((item) => {
        if (item.separator) {
            if (result.length === 0 || result[result.length - 1].separator) return;
            result.push(item);
            return;
        }

        if (item.submenu && item.items) {
            const nested = compactItems(item.items);
            if (nested.length === 0) return;
            result.push({ ...item, items: nested });
            return;
        }

        if (!item.fn) return;
        result.push(item);
    });

    if (result[result.length - 1]?.separator) {
        result.pop();
    }

    return result;
};

const buildMenuForProject = (projectId: ProjectId): MenuSection[] => {
    const key = projectId.toLowerCase();

    const sections: MenuSection[] = [
        {
            id: 'ORDER',
            title: 'Заказ',
            icon: '📦',
            items: compactItems([
                { id: 'MAIN', label: 'Обработка Б/З поставщик', fn: ORDER_FUNCTIONS.MAIN[key] },
                { id: 'STOCKS', label: 'Загрузить остатки', fn: ORDER_FUNCTIONS.STOCKS[key] },
                { id: 'NEW_PRICE_YEAR', label: 'New год для динамика', fn: ORDER_FUNCTIONS.NEW_PRICE_YEAR },
            ]),
        },
        {
            id: 'ORDER_STAGES',
            title: 'Стадии по заказ',
            icon: '📊',
            items: compactItems([
                { id: 'SORT_MANUFACTURER', label: 'Сортировать по производителю', fn: ORDER_STAGE_FUNCTIONS.SORT_MANUFACTURER[key] },
                { id: 'SORT_PRICE', label: 'Сортировать по прайсу', fn: ORDER_STAGE_FUNCTIONS.SORT_PRICE[key] },
                { separator: true },
                { id: 'STAGE_ALL', label: '1. Все данные', fn: ORDER_STAGE_FUNCTIONS.STAGE_ALL },
                { id: 'STAGE_ORDER', label: '2. Заказ', fn: ORDER_STAGE_FUNCTIONS.STAGE_ORDER },
                { id: 'STAGE_PROMOTIONS', label: '3. Акции', fn: ORDER_STAGE_FUNCTIONS.STAGE_PROMOTIONS },
                { id: 'STAGE_SET', label: '4. Набор', fn: ORDER_STAGE_FUNCTIONS.STAGE_SET },
                { id: 'STAGE_PRICE', label: '5. Прайс', fn: ORDER_STAGE_FUNCTIONS.STAGE_PRICE },
            ]),
        },
        ...COMMON_SECTIONS.map((section) => ({ ...section, items: compactItems(section.items) })),
    ];

    if (key === 'cosmetic') {
        sections.push(COSMETIC_SECTION);
    }

    return sections.filter((section) => section.items.length > 0);
};

export default function ScriptRunnerMenu({ projectId = 'default' }: ScriptRunnerMenuProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ORDER', 'ORDER_STAGES']));
    const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set());
    const [runningFn, setRunningFn] = useState<string | null>(null);
    const [status, setStatus] = useState<StatusState>({ type: 'idle', message: 'Система готова' });

    // Get global context
    const { state } = useAppContext();

    // Determine active project (prioritize context over prop)
    const activeProjectId = (state.workspace?.id || projectId === 'default' ? 'sk' : projectId) as ProjectId;
    const normalizedProjectId = activeProjectId.toLowerCase();
    const projectName = state.workspace?.name || getProjectName(activeProjectId);

    // Get contextual menu from ContextManager
    const menuSections = useMemo(() => {
        // Use ContextManager to get dynamic menu based on full context
        const contextualMenu = ContextManager.getContextualMenu(state);

        // Fallback to static menu if no contextual menu found
        if (contextualMenu.length === 0) {
            return buildMenuForProject(normalizedProjectId);
        }

        return contextualMenu;
    }, [state.workspace?.id, state.activeTab?.id, state.activeTab?.documentContext, normalizedProjectId]);

    const toggleSection = (id: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedSections(newExpanded);
    };

    const toggleSubmenu = (id: string) => {
        const newExpanded = new Set(expandedSubmenus);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedSubmenus(newExpanded);
    };

    const handleRunFunction = async (fn?: string) => {
        if (!fn) return;
        setRunningFn(fn);
        setStatus({ type: 'running', message: `Запуск ${fn}...` });

        try {
            const response = await fetch(`${API_BASE_URL}/api/scripts/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: normalizedProjectId,
                    function_name: fn,
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                const errorMessage = data.detail || data.message || 'Ошибка выполнения';
                throw new Error(errorMessage);
            }

            setStatus({ type: 'success', message: data.message || 'Готово' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
            setStatus({ type: 'error', message });
        } finally {
            setRunningFn(null);
        }
    };

    const renderMenuItem = (item: MenuItem, index: number, depth: number = 0) => {
        if (item.separator) {
            return <div key={`sep-${index}`} className="h-px my-1 mx-2 bg-[var(--border)] opacity-40" />;
        }

        if (item.submenu && item.items) {
            const isExpanded = expandedSubmenus.has(item.submenu);
            return (
                <div key={`sub-${index}`} className="mb-0.5">
                    <button
                        onClick={() => toggleSubmenu(item.submenu!)}
                        className={`
                            w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg
                            transition-all duration-200 border border-transparent
                            ${isExpanded
                                ? 'bg-white/40 text-[var(--text-primary)] shadow-sm'
                                : 'text-[var(--text-secondary)] hover:bg-white/30 hover:scale-[1.02]'}
                        `}
                        style={{ marginLeft: `${depth * 8}px` }}
                    >
                        <span className={`text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                        <span>{item.icon}</span>
                        <span className="truncate flex-1 text-left">{item.submenu}</span>
                    </button>
                    {isExpanded && (
                        <div className="mt-0.5 space-y-0.5 border-l border-[var(--border)] ml-3 pl-1">
                            {item.items.map((subItem, subIndex) => renderMenuItem(subItem, subIndex, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        const isRunning = runningFn === item.fn;
        const isDisabled = !item.fn || (!!runningFn && !isRunning);

        return (
            <button
                key={item.id || `item-${index}`}
                className={`
                    w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-medium rounded-lg
                    transition-all duration-200 border border-transparent
                    text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                    hover:bg-white/50 hover:scale-105 hover:shadow-sm hover:border-white/40
                    ${isDisabled ? 'opacity-60 cursor-not-allowed hover:scale-100 hover:bg-white/40' : ''}
                `}
                style={{ marginLeft: `${depth * 8}px` }}
                onClick={() => !isDisabled && handleRunFunction(item.fn)}
                disabled={isDisabled}
            >
                <span className="text-sm">{isRunning ? '⏳' : item.icon}</span>
                <span className="truncate">{item.label}</span>
            </button>
        );
    };

    const statusDot = {
        idle: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]',
        running: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]',
        success: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]',
        error: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]',
    }[status.type];

    return (
        <div className="flex flex-col h-full w-full select-none">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] bg-white/30 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)] animate-pulse" />
                    <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--text-primary)]">
                        Функции <span className="text-[var(--primary)] opacity-80">{projectName}</span>
                    </h2>
                </div>

                {/* Breadcrumb - Context Path */}
                {state.activeTab && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] px-2">
                        <span className="font-medium">{state.workspace?.shortName || state.workspace?.name}</span>
                        <span className="opacity-40">→</span>
                        <span className="truncate max-w-[120px]" title={state.activeTab.title}>
                            {state.activeTab.icon} {state.activeTab.title}
                        </span>
                        {state.activeTab.documentContext?.sheetName && (
                            <>
                                <span className="opacity-40">→</span>
                                <span className="font-medium text-[var(--primary)]" title={state.activeTab.documentContext.sheetName}>
                                    {state.activeTab.documentContext.sheetName}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Script Tree */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2">
                {menuSections.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    const isSpecial = section.special;

                    return (
                        <div key={section.id} className="mb-2">
                            <button
                                onClick={() => isSpecial ? window.open('http://localhost:3001', '_blank') : toggleSection(section.id)}
                                className={`
                                    w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl
                                    transition-all duration-200 border
                                    ${isSpecial
                                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md hover:brightness-105'
                                        : isExpanded
                                            ? 'bg-white/60 text-[var(--text-primary)] border-[var(--border)] shadow-sm'
                                            : 'bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-white/30'}
                                `}
                            >
                                {!isSpecial && (
                                    <span className={`text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                )}
                                <span className="text-sm">{section.icon}</span>
                                <span className="truncate flex-1 text-left uppercase tracking-wide">{section.title}</span>
                                {isSpecial && (
                                    <svg className="w-3 h-3 ml-auto opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                )}
                            </button>

                            {isExpanded && !isSpecial && (
                                <div className="mt-1 space-y-0.5 pl-1">
                                    {section.items.map((item, index) => renderMenuItem(item, index))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status Footer */}
            <div className="px-4 py-3 border-t border-[var(--border)] bg-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/20 shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                    <span className="text-[10px] font-medium text-[var(--text-secondary)]">{status.message}</span>
                </div>
            </div>
        </div>
    );
}
