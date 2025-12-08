'use client';

import React, { useState } from 'react';

// Types for the menu structure
interface MenuItem {
    id?: string;
    label?: string;
    fn?: string;
    separator?: boolean;
    submenu?: string;
    items?: MenuItem[];
    icon?: string;
}

interface MenuSection {
    id: string;
    title: string;
    icon?: string;
    items: MenuItem[];
    special?: boolean;
    action?: () => void;
}

interface ScriptRunnerMenuProps {
    projectId?: string;
}

// Menu Data Configuration (Mirrors 01Config.js)
const MENU_DATA: MenuSection[] = [
    {
        id: 'ORDER',
        title: 'Заказ',
        icon: '📦',
        items: [
            { id: 'MAIN', label: 'Обработка Б/З поставщик', fn: 'processSsPriceSheet', icon: '📝' },
            { id: 'STOCKS', label: 'Загрузить остатки', fn: 'loadSsStockData', icon: '📥' },
            { id: 'NEW_PRICE_YEAR', label: 'New год для динамика', fn: 'addNewYearColumnsToPriceDynamics', icon: '📅' },
        ]
    },
    {
        id: 'ORDER_STAGES',
        title: 'Стадии по заказ',
        icon: '📊',
        items: [
            { id: 'SORT_MANUFACTURER', label: 'Сортировать по производителю', fn: 'sortSsOrderByManufacturer', icon: '🏭' },
            { id: 'SORT_PRICE', label: 'Сортировать по прайсу', fn: 'sortSsOrderByPrice', icon: '💰' },
            { separator: true },
            { id: 'STAGE_ALL', label: '1. Все данные', fn: 'showAllOrderData', icon: '1️⃣' },
            { id: 'STAGE_ORDER', label: '2. Заказ', fn: 'showOrderStage', icon: '2️⃣' },
            { id: 'STAGE_PROMOTIONS', label: '3. Акции', fn: 'showPromotionsStage', icon: '3️⃣' },
            { id: 'STAGE_SET', label: '4. Набор', fn: 'showSetStage', icon: '4️⃣' },
            { id: 'STAGE_PRICE', label: '5. Прайс', fn: 'showPriceStage', icon: '5️⃣' },
        ]
    },
    {
        id: 'EXPORT',
        title: 'Выгрузка',
        icon: '📤',
        items: [
            { label: 'Выгрузить Акции', fn: 'exportPromotions', icon: '📤' },
            { label: 'Выгрузить Наборы', fn: 'exportSets', icon: '📦' },
        ]
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
        ]
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
        ]
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
                ]
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
                ]
            },
        ]
    },
    {
        id: 'COSMETIC_ANALYSIS',
        title: 'Анализ косметики',
        icon: '💄',
        special: true,
        items: []
    }
];

export default function ScriptRunnerMenu({ projectId = 'default' }: ScriptRunnerMenuProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ORDER', 'ORDER_STAGES']));
    const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set());

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

        return (
            <button
                key={`item-${index}`}
                className={`
                    w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-medium rounded-lg
                    transition-all duration-200 border border-transparent
                    text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                    hover:bg-white/50 hover:scale-105 hover:shadow-sm hover:border-white/40
                `}
                style={{ marginLeft: `${depth * 8}px` }}
                onClick={() => console.log(`Running: ${item.fn}`)}
            >
                <span className="text-sm">{item.icon}</span>
                <span className="truncate">{item.label}</span>
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full w-full select-none">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-white/30 backdrop-blur-md sticky top-0 z-10">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)] animate-pulse" />
                <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--text-primary)]">
                    Функции <span className="text-[var(--primary)] opacity-80">({projectId === 'default' ? 'SK' : projectId.toUpperCase()})</span>
                </h2>
            </div>

            {/* Script Tree */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2">
                {MENU_DATA.map((section) => {
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
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
                    <span className="text-[10px] font-medium text-[var(--text-secondary)]">Система готова</span>
                </div>
            </div>
        </div>
    );
}
