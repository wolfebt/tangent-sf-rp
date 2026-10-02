import React from 'react';
import { FileText, Copy, Check, Download, Edit3 } from 'lucide-react';

export default function CronicleScratchbookDocTab({
  compiledScratchbookMarkdown,
  displayedMarkdown,
  elementsCount,
  scenariosCount,
  copiedDoc,
  handleCopyScratchbookMarkdown,
  handleDownloadScratchbook,
  onNavigateToNotes
}) {
  const wordCount = compiledScratchbookMarkdown.split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col space-y-3 min-h-[500px]">
      {/* Document Telemetry & Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <FileText size={14} /> Full Scratchbook MD
          </span>
          <span className="text-slate-400">
            Words: <strong className="text-white">{wordCount}</strong>
          </span>
          <span className="text-slate-400">
            Elements: <strong className="text-purple-300">{elementsCount}</strong>
          </span>
          <span className="text-slate-400">
            Scenarios: <strong className="text-cyan-300">{scenariosCount}</strong>
          </span>
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
              title="Jump to edit GM directives & notes"
            >
              <Edit3 size={12} />
              <span>Edit GM Notes</span>
            </button>
          )}
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-text scrollbar-thin shadow-inner">
        {displayedMarkdown}
      </div>
    </div>
  );
}
