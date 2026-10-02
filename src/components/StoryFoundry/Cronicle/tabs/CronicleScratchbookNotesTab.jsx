import React from 'react';
import { Edit3, Check, Save } from 'lucide-react';

export default function CronicleScratchbookNotesTab({
  scratchNotes,
  setScratchNotes,
  isNotesSaved,
  handleSaveScratchNotes,
  handleInsertSnippet
}) {
  return (
    <div className="flex-1 flex flex-col space-y-3 min-h-[500px]">
      {/* Top Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl shrink-0">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 font-mono">
            <Edit3 size={14} /> GM Campaign Scratchpad &amp; Directives
          </h3>
          <p className="text-[11px] text-slate-400 font-sans">
            Author running campaign directives, unresolved plot hooks, and rules reminders. These notes are automatically compiled into the Scratchbook and injected into AIME living memory prompts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveScratchNotes}
            className={`px-4 py-1.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
              isNotesSaved
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isNotesSaved ? <Check size={14} /> : <Save size={14} />}
            <span>{isNotesSaved ? 'Saved to Story!' : 'Save Notes'}</span>
          </button>
        </div>
      </div>

      {/* Quick Snippet Insertions */}
      <div className="flex items-center gap-1.5 flex-wrap p-2 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs font-mono">
        <span className="text-slate-500 font-bold text-[10px] uppercase">Quick Snippets:</span>
        <button
          type="button"
          onClick={() => handleInsertSnippet('### 🎯 Open Plot Hook:\n- Premise:\n- Stakes:\n- Target NPC / Location:\n')}
          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-amber-300 hover:text-white cursor-pointer transition-colors"
        >
          + Plot Hook
        </button>
        <button
          type="button"
          onClick={() => handleInsertSnippet('> ❓ **Open Mystery / Question**: ')}
          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-purple-300 hover:text-white cursor-pointer transition-colors"
        >
          + Open Question
        </button>
        <button
          type="button"
          onClick={() => handleInsertSnippet('> ⚖️ **Tactical Rule / Modifier**: ')}
          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-cyan-300 hover:text-white cursor-pointer transition-colors"
        >
          + Rules Reminder
        </button>
        <button
          type="button"
          onClick={() => handleInsertSnippet('### 📅 Session Recap:\n- Key Milestones Achieved:\n- Casualties / Status Shifts:\n- Unresolved Thread:\n')}
          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-emerald-300 hover:text-white cursor-pointer transition-colors"
        >
          + Session Recap
        </button>
      </div>

      {/* Editable Scratchpad Textarea */}
      <textarea
        value={scratchNotes}
        onChange={(e) => setScratchNotes(e.target.value)}
        placeholder="Author ongoing GM campaign notes, session recaps, unresolved mystery threads, and tactical rules reminders here..."
        className="flex-1 w-full p-4 bg-slate-950/90 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed select-text shadow-inner"
      />

      {/* Footer Telemetry */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
        <span>
          Words: <strong className="text-slate-300">{scratchNotes.split(/\s+/).filter(Boolean).length}</strong> • Characters: <strong className="text-slate-300">{scratchNotes.length}</strong>
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400/90">
          <Check size={11} /> Auto-synced with compiled Scratchbook &amp; AI co-pilot prompts
        </span>
      </div>
    </div>
  );
}
