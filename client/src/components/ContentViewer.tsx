'use client';

import { useCallback } from 'react';
import type { Tab } from '../hooks/useTabs';
import { useAppContext } from '../hooks/useAppContext';
import { useIframeContextDetector } from '../hooks/useIframeContextDetector';
import type { DocumentContext } from '../types/context';

interface ContentViewerProps {
  tab: Tab | null;
}

export default function ContentViewer({ tab }: ContentViewerProps) {
  const { dispatch } = useAppContext();

  // Callback to update document context when iframe changes
  const handleContextChange = useCallback((tabId: string, context: DocumentContext) => {
    dispatch({
      type: 'UPDATE_DOCUMENT_CONTEXT',
      payload: { tabId, context }
    });
  }, [dispatch]);

  // Detect context changes in iframe
  useIframeContextDetector(tab, handleContextChange);
  if (!tab) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center space-y-6 glass-panel p-12 max-w-md animate-fade-in rounded-3xl border border-white/60">
          <div className="text-7xl mb-4 filter drop-shadow-sm">📋</div>
          <div className="space-y-2">
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-[var(--text-secondary)]">
              Нет активных вкладок
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              Выберите проект или инструмент
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 shadow-sm flex items-center gap-2">
              <span>📊</span>
              <span>Google Таблицы</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold border border-pink-100 shadow-sm flex items-center gap-2">
              <span>🤖</span>
              <span>Чат-боты</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ backgroundColor: 'var(--surface)' }}>
      <iframe
        key={tab.id}
        src={tab.url}
        className="w-full h-full border-0"
        allow="clipboard-read; clipboard-write; camera; microphone"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        title={tab.title}
      />
    </div>
  );
}
