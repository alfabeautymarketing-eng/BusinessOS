// ===== CONTEXT MANAGER - ЛОГИКА ОПРЕДЕЛЕНИЯ КОНТЕКСТНОГО МЕНЮ =====

import contextMenusConfig from '../config/contextMenus.json';
import type {
  AppContextState,
  ContextRule,
  MenuSection,
  ContentType,
} from '../types/context';

/**
 * ContextManager - управляет определением контекстного меню
 */
export class ContextManager {
  /**
   * Получить контекстное меню на основе текущего состояния
   */
  static getContextualMenu(context: AppContextState): MenuSection[] {
    const rules = contextMenusConfig.contextRules as ContextRule[];

    // Сортируем правила по приоритету (больше = выше приоритет)
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    // Ищем первое подходящее правило
    for (const rule of sortedRules) {
      if (this.matchesRule(rule.match, context)) {
        return rule.menu.sections;
      }
    }

    // Fallback: пустое меню
    return [];
  }

  /**
   * Проверяет, соответствует ли контекст правилу
   */
  private static matchesRule(
    match: ContextRule['match'],
    context: AppContextState
  ): boolean {
    // Проверка workspace
    if (match.workspace && match.workspace !== context.workspace.id) {
      return false;
    }

    // Если нет активной вкладки, можем проверить только workspace
    if (!context.activeTab) {
      return !!match.workspace; // Подходит если есть только workspace match
    }

    // Проверка типа контента
    if (
      match.contentType &&
      match.contentType !== context.activeTab.documentContext?.contentType
    ) {
      return false;
    }

    // Проверка имени листа
    if (
      match.sheetName &&
      match.sheetName !== context.activeTab.documentContext?.sheetName
    ) {
      return false;
    }

    // Проверка типа документа
    if (match.type && match.type !== context.activeTab.type) {
      return false;
    }

    return true;
  }

  /**
   * Определяет тип контента по имени листа
   */
  static detectContentType(sheetName: string): ContentType {
    if (!sheetName) return 'unknown';

    const patterns: Record<string, RegExp> = {
      'tester-sheet': /тестер/i,
      'order-sheet': /ордер|заказ/i,
      'sync-log': /журнал.*синхро/i,
      'database-sheet': /база|главная/i,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(sheetName)) {
        return type as ContentType;
      }
    }

    return 'unknown';
  }

  /**
   * Парсит URL Google Sheets для извлечения spreadsheetId и sheetId
   */
  static parseGoogleSheetsUrl(url: string): {
    spreadsheetId: string;
    sheetId: number;
  } | null {
    try {
      // URL формат: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid={SHEET_ID}
      const spreadsheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      const sheetMatch = url.match(/#gid=(\d+)/);

      if (spreadsheetMatch) {
        return {
          spreadsheetId: spreadsheetMatch[1],
          sheetId: sheetMatch ? parseInt(sheetMatch[1]) : 0, // 0 = первый лист
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing Google Sheets URL:', error);
      return null;
    }
  }

  /**
   * Парсит URL Google Drive для извлечения folderId
   */
  static parseGoogleDriveUrl(url: string): { folderId: string } | null {
    try {
      // URL формат: https://drive.google.com/drive/folders/{FOLDER_ID}
      const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);

      if (match) {
        return {
          folderId: match[1],
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing Google Drive URL:', error);
      return null;
    }
  }
}

/**
 * Утилита для получения имени листа через API
 * При ошибке возвращает null и приложение продолжает работать
 */
export async function fetchSheetName(
  spreadsheetId: string,
  sheetId: number
): Promise<string | null> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(
      `${API_BASE_URL}/api/scripts/sheets/${spreadsheetId}/sheet-name?sheet_id=${sheetId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Таймаут 5 секунд
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      // Graceful fallback - логируем но не бросаем ошибку
      console.warn(`[ContextManager] Sheet name API returned ${response.status}, using fallback`);
      return null;
    }

    const data = await response.json();
    return data.sheet_name || null;
  } catch (error) {
    // Graceful fallback - приложение продолжает работать
    console.warn('[ContextManager] Could not fetch sheet name, using fallback:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}
