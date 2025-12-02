'use client';

import React from 'react';
import type { Tab } from '../hooks/useTabs';

interface ContentViewerProps {
  tab: Tab | null;
}

const SAMPLE_COLUMNS = [
  { letter: 'A', title: 'Артикул' },
  { letter: 'B', title: 'Объем' },
  { letter: 'C', title: 'Дата' },
];

const SAMPLE_ROWS = [
  { article: 'Артикул 1', volume: '300', date: '03.06.2022' },
  { article: 'Артикул 2', volume: '400', date: '03.06.2022' },
  { article: 'Артикул 3', volume: '400', date: '03.06.2022' },
  { article: 'Артикул 4', volume: '500', date: '' },
  { article: 'Артикул 5', volume: '300', date: '' },
  { article: 'Артикул 6', volume: '400', date: '' },
  { article: 'Артикул 7', volume: '300', date: '' },
  { article: 'Артикул 8', volume: '400', date: '' },
];

function GlowBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-20 -top-24 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />
      <div className="absolute bottom-6 left-1/4 h-64 w-96 rounded-full bg-cyan-500/12 blur-3xl" />
    </div>
  );
}

function ShowcaseSheet() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0a0f1c] via-[#070c16] to-[#060a12]">
      <GlowBackground />
      <div className="relative h-full w-full flex items-center justify-center p-8">
        <div className="relative w-full max-w-6xl h-full min-h-[520px] rounded-[26px] border border-cyan-500/25 bg-[#0b101d]/85 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="absolute inset-0 rounded-[26px] border border-white/10 pointer-events-none" />

          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center text-lg font-semibold shadow-[0_0_20px_rgba(34,211,238,0.35)]">
                📊
              </div>
              <div className="leading-tight">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Google Sheet</p>
                <p className="text-sm text-gray-100">Каталог поставщика</p>
              </div>
            </div>
            <button className="px-4 py-2 text-xs font-semibold text-emerald-200 border border-emerald-400/30 bg-emerald-500/10 rounded-lg shadow-[0_8px_30px_rgba(52,211,153,0.2)] hover:border-emerald-300/60 transition-colors">
              Smart Border
            </button>
          </div>

          <div className="p-5 space-y-4 h-[calc(100%-96px)] overflow-hidden">
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_COLUMNS.map((col) => (
                <div
                  key={col.letter}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-purple-700/60 to-purple-500/50 text-white text-sm font-semibold shadow-[0_12px_35px_rgba(168,85,247,0.3)] border border-purple-400/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-white/70">{col.letter}:</span>
                    {col.title}
                  </span>
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" />
                  </svg>
                </div>
              ))}
            </div>

            <div className="relative rounded-2xl border border-white/5 bg-[#080d17]/70 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-purple-700/60 to-purple-500/50 text-left text-xs uppercase tracking-[0.18em] text-white/90">
                  <tr>
                    <th className="px-5 py-3">Артикул</th>
                    <th className="px-5 py-3">Объем</th>
                    <th className="px-5 py-3">Дата</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-200">
                  {SAMPLE_ROWS.map((row, idx) => (
                    <tr
                      key={row.article}
                      className={`${idx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.01]'} hover:bg-white/10 transition-colors`}
                    >
                      <td className="px-5 py-3 border-b border-white/5">{row.article}</td>
                      <td className="px-5 py-3 border-b border-white/5 text-center text-white">{row.volume}</td>
                      <td className="px-5 py-3 border-b border-white/5 text-right text-gray-300">{row.date || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl px-4 py-2 text-xs text-gray-200 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
                Linked Scripts: 3 active
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span>Last Git Commit: 2 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveFrame({ tab }: { tab: Tab }) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#090f1a] via-[#070c16] to-[#060a12]">
      <GlowBackground />
      <div className="relative h-full w-full p-6">
        <div className="relative flex h-full flex-col rounded-[26px] border border-cyan-500/20 bg-[#0b101d]/80 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="absolute inset-0 rounded-[26px] border border-white/10 pointer-events-none" />

          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center text-lg font-semibold shadow-[0_0_20px_rgba(34,211,238,0.35)]">
                {tab.icon}
              </div>
              <div className="leading-tight">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Активный документ</p>
                <p className="text-sm text-gray-100 font-semibold">{tab.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-semibold text-emerald-200 shadow-[0_10px_30px_rgba(52,211,153,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                Live
              </div>
              <button className="px-4 py-2 text-xs font-semibold text-emerald-200 border border-emerald-400/30 bg-emerald-500/10 rounded-lg shadow-[0_8px_30px_rgba(52,211,153,0.2)] hover:border-emerald-300/60 transition-colors">
                Smart Border
              </button>
            </div>
          </div>

          <div className="flex-1 relative px-4 pb-12 pt-4">
            <iframe
              key={tab.id}
              src={tab.url}
              className="w-full h-full border border-white/5 rounded-2xl bg-[#060a12]"
              allow="clipboard-read; clipboard-write; camera; microphone"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              title={tab.title}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                </div>
                <span className="text-xs text-white font-medium">{tab.icon} {tab.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentViewer({ tab }: ContentViewerProps) {
  if (!tab) {
    return <ShowcaseSheet />;
  }

  return <ActiveFrame tab={tab} />;
}
