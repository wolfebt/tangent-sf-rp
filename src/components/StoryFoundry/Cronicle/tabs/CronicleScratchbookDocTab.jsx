import React from 'react';
import { FileText, Copy, Check, Download, Edit3, Search, X } from 'lucide-react';

export default function CronicleScratchbookDocTab({
  compiledScratchbookMarkdown,
  displayedMarkdown,
  docSearchQuery = '',
  setDocSearchQuery,
  elementsCount,
  scenariosCount,
  copiedDoc,
  handleCopyScratchbookMarkdown,
  handleDownloadScratchbook,
  onNavigateToNotes
}) {
  const safeDisplayed = typeof displayedMarkdown === 'string' && displayedMarkdown.length > 0
    ? displayedMarkdown
    : (() => {
        if (!docSearchQuery.trim()) return compiledScratchbookMarkdown;
        const q = docSearchQuery.trim().toLowerCase();
        const filtered = String(compiledScratchbookMarkdown || '')
          .split('\n')
          .filter((line) => line.trim().startsWith('#') || line.toLowerCase().includes(q));
        return filtered.length > 0
          ? filtered.join('\n')
          : `No Scratchbook entries matching "${docSearchQuery.trim()}".`;
      })();

  return (
    <div className="flex-1 flex flex-col space-y-3 min-h-[500px]">
      {/* Document Telemetry & Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <FileText size={14} /> Compiled Cronicle Dossier (.md)
          </span>
          {typeof setDocSearchQuery === 'function' && (
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                aria-label="Search Scratchbook Dossier"
                placeholder="Filter dossier..."
                className="pl-7 pr-6 py-1 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg text-xs text-slate-100 placeholder-slate-500 outline-none w-44"
              />
              {docSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDocSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Clear dossier filter"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyScratchbookMarkdown}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            {copiedDoc ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copiedDoc ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadScratchbook}
            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={12} />
            <span>Download .md</span>
          </button>

          {onNavigateToNotes && (
            <button
              type="button"
              onClick={onNavigateToNotes}
              className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Jump to edit Architect directives & notes"
            >
              <Edit3 size={12} />
              <span>Edit Architect Directives</span>
            </button>
          )}
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-text scrollbar-thin shadow-inner">
        {safeDisplayed}
      </div>
    </div>
  );
}
