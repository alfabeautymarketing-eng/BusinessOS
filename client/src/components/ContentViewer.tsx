'use client';

import type { Tab } from '../hooks/useTabs';

interface ContentViewerProps {
  tab: Tab | null;
}

export default function ContentViewer({ tab }: ContentViewerProps) {
  if (!tab) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center space-y-6 card-glass p-12 max-w-md animate-fade-in">
          <div className="text-7xl mb-4">📋</div>
          <div className="space-y-3">
            <p className="text-sm tracking-[0.15em] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
              Нет активных вкладок
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Откройте проект из меню выше
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="badge" style={{ background: 'var(--info)' }}>
              <span>📊</span>
              <span style={{ color: 'var(--text-primary)' }}>Google Таблицы</span>
            </div>
            <div className="badge" style={{ background: 'var(--secondary)' }}>
              <span>🤖</span>
              <span style={{ color: 'var(--text-primary)' }}>Чат-боты</span>
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
