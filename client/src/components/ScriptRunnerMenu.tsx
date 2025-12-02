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

const renderIcon = (glyph?: string) => (
    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-200">
        {glyph || '•'}
    </span>
);

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
            return <div key={`sep-${index}`} className="h-px bg-white/5 my-1 mx-4" />;
        }

        if (item.submenu && item.items) {
            const isExpanded = expandedSubmenus.has(item.submenu);
            return (
                <div key={`sub-${index}`}>
                    <button
                        onClick={() => toggleSubmenu(item.submenu!)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-150 rounded-r-2xl mr-2 border-l-2 border-transparent ${isExpanded ? `${theme.border} bg-white/[0.04] ${theme.shadow}` : ''}`}
                        style={{ paddingLeft: `${(depth + 1) * 12 + 12}px` }}
                    >
                        <svg
                            className={`w-3 h-3 flex-shrink-0 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            style={{ width: '12px', height: '12px' }}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        {renderIcon(item.icon)}
                        <span className="truncate flex-1 text-left">{item.submenu}</span>
                    </button>
                    {isExpanded && (
                        <div className="mt-0.5">
                            {item.items.map((subItem, subIndex) => renderMenuItem(subItem, subIndex, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <button
                key={`item-${index}`}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[13px] text-gray-200 hover:bg-white/5 hover:text-white transition-colors duration-150 rounded-r-2xl mr-2 border-l-2 border-transparent hover:${theme.border} hover:${theme.shadow}`}
                style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }}
                onClick={() => console.log(`Running: ${item.fn}`)}
            >
                {renderIcon(item.icon)}
                <span className="truncate">{item.label}</span>
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full text-gray-200 w-full select-none">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${theme.iconColor} shadow-[0_0_15px_rgba(255,255,255,0.4)]`} />
                    <h2 className="text-[13px] font-semibold tracking-[0.18em] text-gray-100 uppercase">
                        Функции <span className={theme.color}>({projectId === 'default' ? 'Общие' : projectId.toUpperCase()})</span>
                    </h2>
                </div>
            </div>

            {/* Script Tree */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                {MENU_DATA.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    const isSpecial = section.special;

                    return (
                        <div key={section.id} className="mb-0.5">
                            <button
                                onClick={() => isSpecial ? window.open('http://localhost:3001', '_blank') : toggleSection(section.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] font-semibold transition-colors duration-150 rounded-r-2xl mr-2 border-l-2 border-transparent
                                ${isSpecial
                                        ? 'text-pink-200 bg-pink-500/10 border-l-pink-500/50 hover:bg-pink-500/20 hover:text-pink-100 shadow-[0_8px_25px_rgba(236,72,153,0.15)]'
                                        : isExpanded
                                            ? `${theme.border} bg-white/[0.04] text-gray-100 ${theme.shadow} text-gray-300 hover:bg-white/5 hover:text-white`
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {!isSpecial && (
                                    <svg
                                        className={`w-3 h-3 flex-shrink-0 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                        style={{ width: '12px', height: '12px' }}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <span className="text-base">{section.icon}</span>
                                <span className="truncate">{section.title}</span>
                                {isSpecial && (
                                    <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                )}
                            </button>

                            {isExpanded && !isSpecial && (
                                <div className="mt-0.5">
                                    {section.items.map((item, index) => renderMenuItem(item, index))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status / Footer */}
            <div className="px-4 py-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-[11px] text-emerald-200 font-semibold">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse"></div>
                    <span>Система готова</span>
                </div>
            </div>
        </div >
    );
}
