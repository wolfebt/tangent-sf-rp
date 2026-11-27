/**
 * @file RevisionHistoryDrawer.jsx
 * @description Non-destructive Manuscript Revision Snapshots & Line Diff Drawer for StoryWeaver.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { History, RotateCcw, Plus, X, GitCompare } from 'lucide-react';
import {
  computeLineDiff,
  stripHtmlForDiff
} from '../../../../../services/revisionSnapshotService';

export default function RevisionHistoryDrawer({
  isOpen,
  onClose,
  revisions = [],
  currentContent = '',
  isStoryReadOnly = false,
  onCreateSnapshot,
  onRestoreSnapshot
}) {
  const [labelInput, setLabelInput] = useState('');
  const [selectedRevId, setSelectedRevId] = useState(revisions[0]?.id || null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (revisions.length > 0 && !revisions.some((r) => r.id === selectedRevId)) {
      setSelectedRevId(revisions[0].id);
    }
  }, [revisions, selectedRevId]);

  const activeRevision = useMemo(
    () => revisions.find((r) => r.id === selectedRevId) || revisions[0] || null,
    [revisions, selectedRevId]
  );

  const diffLines = useMemo(() => {
    if (!activeRevision) return [];
    const oldPlain = stripHtmlForDiff(activeRevision.content);
    const currPlain = stripHtmlForDiff(currentContent);
    return computeLineDiff(oldPlain, currPlain);
  }, [activeRevision, currentContent]);

  const diffStats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const line of diffLines) {
      if (line.type === 'add') added++;
      else if (line.type === 'remove') removed++;
    }
    return { added, removed };
  }, [diffLines]);

  if (!isOpen) return null;

  const handleSaveCheckpoint = (e) => {
    e.preventDefault();
    if (isStoryReadOnly) return;
    onCreateSnapshot?.(labelInput.trim() || undefined);
    setLabelInput('');
  };

  return (
    <div
      role="dialog"
      aria-label="Manuscript Revision History"
      className="fixed inset-y-0 right-0 z-[225] w-full max-w-lg bg-[#0a0f1d]/98 border-l border-cyan-500/40 shadow-2xl flex flex-col font-mono text-slate-200 backdrop-blur-xl"
    >
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={15} className="text-cyan-400" />
          <div>
            <h3 className="text-xs font-bold uppercase text-cyan-200">
              Revision Snapshots & Diff
            </h3>
            <p className="text-[10px] text-slate-400">
              Up to 30 non-destructive checkpoints stored on this Scenario
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 cursor-pointer"
          aria-label="Close Revision History"
        >
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleSaveCheckpoint} className="p-3 border-b border-slate-800 flex gap-2 bg-slate-900/60">
        <input
          type="text"
          disabled={isStoryReadOnly}
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          placeholder={isStoryReadOnly ? 'Read-only story' : 'Checkpoint label (e.g. Pre-Climax Rewrite)'}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStoryReadOnly}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus size={12} /> Snapshot
        </button>
      </form>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {revisions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No revision snapshots yet. Create a named checkpoint above before major edits.
          </div>
        ) : (
          <>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {revisions.map((rev) => {
                const isSelected = activeRevision?.id === rev.id;
                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedRevId(rev.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-white'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{rev.label}</div>
                      <div className="text-[10px] text-slate-400">
                        {rev.wordCount} words &bull; {new Date(rev.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isStoryReadOnly}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isStoryReadOnly) return;
                        onRestoreSnapshot?.(rev);
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-500/40 text-amber-200 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <RotateCcw size={10} /> Restore
                    </button>
                  </div>
                );
              })}
            </div>

            {activeRevision && (
              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                <div className="text-[10px] uppercase font-bold text-cyan-300 flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <GitCompare size={12} /> Diff vs Current Manuscript
                  </span>
                  <span className="text-[10px] font-mono">
                    <span className="text-emerald-300">+{diffStats.added}</span>{' / '}
                    <span className="text-rose-300">-{diffStats.removed}</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1 max-h-64 overflow-y-auto">
                  {diffLines.map((line, i) => (
                    <div
                      key={i}
                      className={`px-1.5 py-0.5 rounded font-mono whitespace-pre-wrap ${
                        line.type === 'add'
                          ? 'bg-emerald-950/70 text-emerald-300'
                          : line.type === 'remove'
                            ? 'bg-rose-950/70 text-rose-300 line-through'
                            : 'text-slate-400'
                      }`}
                    >
                      {line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  '}
                      {line.text || ' '}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
