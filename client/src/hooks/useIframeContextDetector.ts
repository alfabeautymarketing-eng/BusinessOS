'use client';

// ===== USE IFRAME CONTEXT DETECTOR - ОПРЕДЕЛЕНИЕ КОНТЕКСТА IFRAME =====

import { useEffect, RefObject } from 'react';
import { ContextManager, fetchSheetName } from '../lib/contextManager';
import type { DocumentContext, Tab } from '../types/context';

/**
 * Hook для отслеживания и определения контекста внутри iframe
 *
 * Проблема: CORS не позволяет читать URL iframe напрямую
 * Решение: Парсим URL при создании вкладки, затем запрашиваем имя листа через API
 *
 * @param tab - Вкладка для отслеживания
 * @param onContextChange - Callback при изменении контекста
 */
export function useIframeContextDetector(
  tab: Tab | null,
  onContextChange: (tabId: string, context: DocumentContext) => void
) {
  useEffect(() => {
    if (!tab) return;

    // Определяем контекст на основе типа вкладки
    const detectContext = async () => {
      if (tab.type === 'sheets') {
        // Google Sheets - парсим URL и получаем имя листа
        await detectSheetContext(tab, onContextChange);
      } else if (tab.type === 'drive-folder') {
        // Google Drive папка
        detectDriveFolderContext(tab, onContextChange);
      } else {
        // Для других типов контекст не определяется
        onContextChange(tab.id, {
          contentType: 'unknown',
        });
      }
    };

    detectContext();
  }, [tab?.id, tab?.url]);
}

/**
 * Определяет контекст для Google Sheets
 */
async function detectSheetContext(
  tab: Tab,
  onContextChange: (tabId: string, context: DocumentContext) => void
) {
  try {
    // Парсим URL
    const parsed = ContextManager.parseGoogleSheetsUrl(tab.url);

    if (!parsed) {
      console.warn('[ContextDetector] Could not parse Google Sheets URL:', tab.url);
      onContextChange(tab.id, { contentType: 'unknown' });
      return;
    }

    // Пытаемся получить имя листа через API
    const sheetName = await fetchSheetName(parsed.spreadsheetId, parsed.sheetId);

    if (!sheetName) {
      // FALLBACK: Используем имя вкладки для определения contentType
      console.warn('[ContextDetector] API unavailable, using tab title as fallback');
      const fallbackContentType = ContextManager.detectContentType(tab.title || '');

      onContextChange(tab.id, {
        spreadsheetId: parsed.spreadsheetId,
        sheetId: parsed.sheetId,
        sheetName: tab.title || undefined, // Используем название вкладки как fallback
        contentType: fallbackContentType !== 'unknown' ? fallbackContentType : 'sheets',
      });
      return;
    }

    // Определяем тип контента по имени листа
    const contentType = ContextManager.detectContentType(sheetName);

    // Отправляем контекст
    onContextChange(tab.id, {
      spreadsheetId: parsed.spreadsheetId,
      sheetId: parsed.sheetId,
      sheetName,
      contentType,
    });
  } catch (error) {
    console.error('[ContextDetector] Error detecting sheet context:', error);
    // FALLBACK: Даже при ошибке пытаемся дать базовый контекст
    const parsed = ContextManager.parseGoogleSheetsUrl(tab.url);
    onContextChange(tab.id, {
      spreadsheetId: parsed?.spreadsheetId,
      contentType: 'sheets'
    });
  }
}

/**
 * Определяет контекст для Google Drive папки
 */
function detectDriveFolderContext(
  tab: Tab,
  onContextChange: (tabId: string, context: DocumentContext) => void
) {
  try {
    // Парсим URL
    const parsed = ContextManager.parseGoogleDriveUrl(tab.url);

    if (!parsed) {
      console.warn('Could not parse Google Drive URL:', tab.url);
      onContextChange(tab.id, { contentType: 'unknown' });
      return;
    }

    // Отправляем контекст
    onContextChange(tab.id, {
      folderId: parsed.folderId,
      contentType: 'drive-folder',
    });
  } catch (error) {
    console.error('Error detecting drive folder context:', error);
    onContextChange(tab.id, { contentType: 'unknown' });
  }
}

/**
 * Альтернативный hook для отслеживания изменений URL в iframe через postMessage
 *
 * ПРИМЕЧАНИЕ: Требует инжекта скрипта в Google Sheets, что может быть невозможно
 * из-за CSP (Content Security Policy)
 */
export function useIframePostMessageDetector(
  iframeRef: RefObject<HTMLIFrameElement>,
  onContextChange: (context: DocumentContext) => void
) {
  useEffect(() => {
    // Слушаем postMessage от iframe
    const handleMessage = (event: MessageEvent) => {
      // Валидация origin
      if (!event.origin.includes('docs.google.com')) {
        return;
      }

      // Проверяем формат сообщения
      const data = event.data;
      if (data && data.type === 'SHEET_CONTEXT') {
        onContextChange({
          spreadsheetId: data.spreadsheetId,
          sheetName: data.sheetName,
          sheetId: data.sheetId,
          contentType: ContextManager.detectContentType(data.sheetName),
        });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [iframeRef, onContextChange]);
}
