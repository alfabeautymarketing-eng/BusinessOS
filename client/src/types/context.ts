// ===== ТИПЫ ДЛЯ СИСТЕМЫ КОНТЕКСТА =====

/**
 * ID рабочих столов (workspaces)
 */
export type WorkspaceId = 'sk' | 'mt' | 'ss' | 'cosmetic';

/**
 * Типы контента для определения контекстного меню
 */
export type ContentType =
  | 'tester-sheet'        // Лист "Тестер"
  | 'order-sheet'         // Лист "Ордер"
  | 'sync-log'            // Лист "Журнал синхро"
  | 'database-sheet'      // Лист "База" / "Главная"
  | 'drive-folder'        // Папка Drive
  | 'doc-folder'          // Папка с документами
  | 'sheets'              // Общий тип для Google Sheets (fallback)
  | 'unknown';            // Неизвестный тип

/**
 * Типы вкладок
 */
export type TabType = 'sheets' | 'drive-folder' | 'doc' | 'external-app';

/**
 * Контекст документа (определяется динамически)
 */
export interface DocumentContext {
  // Google Sheets
  spreadsheetId?: string;
  sheetName?: string;
  sheetId?: number;

  // Google Drive
  folderId?: string;
  fileId?: string;

  // Определенный тип контента
  contentType: ContentType;
}

/**
 * Вкладка (открытый документ)
 */
export interface Tab {
  id: string;
  title: string;
  icon: string;
  type: TabType;
  url: string;
  projectId: WorkspaceId;
  linkId?: string;

  // Контекст документа (заполняется динамически)
  documentContext?: DocumentContext;

  // Дополнительные данные
  spreadsheetId?: string;
  folderId?: string;
  defaultSheet?: string;
  pinned?: boolean;
}

/**
 * Workspace (рабочий стол)
 */
export interface Workspace {
  id: WorkspaceId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  theme: {
    h: number;
    s: string;
    l: string;
  };
}

/**
 * Запись в истории навигации
 */
export interface TabHistoryEntry {
  tab: Tab;
  timestamp: number;
}

/**
 * Глобальное состояние приложения
 */
export interface AppContextState {
  // Текущий активный workspace
  workspace: Workspace;

  // Активная вкладка
  activeTab: Tab | null;

  // Все открытые вкладки
  tabs: Tab[];

  // История навигации
  navigationHistory: TabHistoryEntry[];
  currentHistoryIndex: number;
}

/**
 * Действия (actions) для reducer
 */
export type AppContextAction =
  | { type: 'SET_WORKSPACE'; payload: { workspaceId: WorkspaceId } }
  | { type: 'OPEN_TAB'; payload: { tab: Tab } }
  | { type: 'CLOSE_TAB'; payload: { tabId: string } }
  | { type: 'SET_ACTIVE_TAB'; payload: { tabId: string } }
  | { type: 'UPDATE_DOCUMENT_CONTEXT'; payload: { tabId: string; context: DocumentContext } }
  | { type: 'UPDATE_TAB'; payload: { tabId: string; updates: Partial<Tab> } };

// ===== ТИПЫ ДЛЯ КОНТЕКСТНЫХ МЕНЮ =====

/**
 * Элемент меню
 */
export interface MenuItem {
  id?: string;
  label?: string;
  fn?: string;
  icon?: string;
  emoji_stage?: string;
  separator?: boolean;
  submenu?: string;
  items?: MenuItem[];
}

/**
 * Секция меню
 */
export interface MenuSection {
  id: string;
  title: string;
  icon: string;
  expanded?: boolean;
  special?: boolean;
  action?: 'open_external';
  url?: string;
  items: MenuItem[];
}

/**
 * Правило для определения контекстного меню
 */
export interface ContextRule {
  id: string;
  priority: number;
  match: {
    workspace?: WorkspaceId;
    contentType?: ContentType;
    sheetName?: string;
    type?: TabType;
    spreadsheetId?: string;  // ID документа Google Sheets
  };
  menu: {
    sections: MenuSection[];
  };
}

/**
 * Конфигурация контекстных меню
 */
export interface ContextMenusConfig {
  contextRules: ContextRule[];
}
