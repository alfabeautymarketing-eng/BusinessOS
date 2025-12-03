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

const PROJECT_THEMES: Record<string, { color: string; border: string; shadow: string; iconColor: string }> = {
    sk: { color: 'text-purple-200', border: 'border-purple-500/50', shadow: 'shadow-purple-500/20', iconColor: 'bg-purple-400' },
    mt: { color: 'text-blue-200', border: 'border-blue-500/50', shadow: 'shadow-blue-500/20', iconColor: 'bg-blue-400' },
    ss: { color: 'text-green-200', border: 'border-green-500/50', shadow: 'shadow-green-500/20', iconColor: 'bg-green-400' },
    default: { color: 'text-cyan-200', border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/20', iconColor: 'bg-cyan-400' },
};


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
    console.log('🎨 ScriptRunnerMenu v6.0 - ВСЕ СЕКЦИИ С ФОНОМ И БОЛЬШИЕ ОТСТУПЫ');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ORDER', 'ORDER_STAGES']));
    const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set());

    const theme = PROJECT_THEMES[projectId] || PROJECT_THEMES.default;

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
            return <div key={`sep-${index}`} className="h-px my-1 mx-2" style={{ background: 'var(--border)', opacity: 0.3 }} />;
        }

        if (item.submenu && item.items) {
            const isExpanded = expandedSubmenus.has(item.submenu);
            return (
                <div key={`sub-${index}`} className="mb-0.5">
                    <button
                        onClick={() => toggleSubmenu(item.submenu!)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium
                                   transition-all duration-200 rounded-md border"
                        style={{
                            marginLeft: `${depth * 8 + 4}px`,
                            color: isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                            backgroundColor: isExpanded ? 'var(--surface-glass)' : 'transparent',
                            borderColor: isExpanded ? 'var(--border)' : 'transparent',
                            boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none',
                            backdropFilter: isExpanded ? 'blur(10px)' : 'none'
                        }}
                    >
                        <span className="text-[8px] transition-transform duration-200 flex-shrink-0" style={{
                            display: 'inline-block',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            marginRight: '2px'
                        }}>▶</span>
                        <span className="text-xs" style={{ minWidth: '14px', textAlign: 'center' }}>{item.icon}</span>
                        <span className="truncate flex-1 text-left text-[10px] font-semibold">{item.submenu}</span>
                    </button>
                    {isExpanded && (
                        <div className="mt-0.5 space-y-0.5">
                            {item.items.map((subItem, subIndex) => renderMenuItem(subItem, subIndex, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <button
                key={`item-${index}`}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[11px] font-medium
                          transition-all duration-150 rounded-md border"
                style={{
                    marginLeft: `${depth * 8 + 4}px`,
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                    borderColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-glass)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.backdropFilter = 'blur(10px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backdropFilter = 'none';
                }}
                onClick={() => console.log(`Running: ${item.fn}`)}
            >
                <span className="text-xs" style={{ minWidth: '14px', textAlign: 'center' }}>{item.icon}</span>
                <span className="truncate text-[11px] font-medium">{item.label}</span>
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full w-full select-none text-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
                    <span className="text-base">⚡</span>
                    <h2 className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--text-primary)' }}>
                        Функции <span style={{ color: 'var(--primary)' }}>({projectId === 'default' ? 'SK' : projectId.toUpperCase()})</span>
                    </h2>
                </div>
            </div>

            {/* Script Tree */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-1.5" style={{ backgroundColor: 'var(--background)' }}>
                {MENU_DATA.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    const isSpecial = section.special;

                    return (
                        <div key={section.id} className="mb-2 mx-2">
                            <button
                                onClick={() => isSpecial ? window.open('http://localhost:3001', '_blank') : toggleSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold
                                           transition-all duration-200 rounded-xl border-2`}
                                style={{
                                    color: isSpecial ? 'var(--text-primary)' : isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    backgroundColor: isSpecial ? 'var(--accent)' : isExpanded ? 'var(--surface-glass)' : 'var(--surface-glass)',
                                    borderColor: isSpecial ? 'var(--accent)' : isExpanded ? 'var(--primary)' : 'var(--border)',
                                    boxShadow: isExpanded || isSpecial ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                    backdropFilter: 'blur(20px)'
                                }}
                            >
                                {!isSpecial && (
                                    <span className="text-[10px] transition-transform duration-200 flex-shrink-0" style={{
                                        display: 'inline-block',
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                        marginRight: '2px'
                                    }}>▶</span>
                                )}
                                <span className="text-sm" style={{ minWidth: '16px', textAlign: 'center' }}>{section.icon}</span>
                                <span className="truncate text-xs font-semibold">{section.title}</span>
                                {isSpecial && (
                                    <svg className="w-2.5 h-2.5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                )}
                            </button>

                            {isExpanded && !isSpecial && (
                                <div className="mt-0.5 space-y-0.5">
                                    {section.items.map((item, index) => renderMenuItem(item, index))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status / Footer */}
            <div className="px-3 py-2.5 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--surface-glass)' }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--success)', boxShadow: '0 0 6px var(--success)' }}></div>
                    <span className="text-xs">✅</span>
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Система готова</span>
                </div>
            </div>
        </div >
    );
}
