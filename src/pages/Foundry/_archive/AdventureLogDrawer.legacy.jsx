import React, { useState, useEffect, useRef } from 'react';
import {
  Scroll,
  X,
  Copy,
  Check,
  Download,
  Trash2,
  Search,
  Filter,
  Send,
  Sparkles,
  Swords,
  Zap,
  Flame,
  Shield,
  Clock,
  ChevronDown,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { AdventureLogService, LOG_CATEGORIES, ACTOR_TYPES } from '../../../../services/adventureLogService';
import { AudioService } from '../../../../services/audioService';

export default function AdventureLogDrawer({
  isOpen,
  onClose,
  activeMapId = null,
  currentRound = 1
}) {
  const [logs, setLogs] = useState([]);
  const [activeCategory, setActiveCategory] = useState(LOG_CATEGORIES.COMBAT);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const logEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync active map ID with log service
  useEffect(() => {
    if (activeMapId) {
      AdventureLogService.setMapId(activeMapId);
    }
  }, [activeMapId]);

  // Real-time subscription to log entries
  useEffect(() => {
    const unsubscribe = AdventureLogService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive if enabled
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  // Filter logs by category and search query
  const filteredLogs = logs.filter((log) => {
    // 1. Category check
    if (activeCategory !== LOG_CATEGORIES.ALL) {
      if (activeCategory === LOG_CATEGORIES.VITALS) {
        if (log.category !== LOG_CATEGORIES.VITALS && log.category !== LOG_CATEGORIES.CONDITION) return false;
      } else if (log.category !== activeCategory) {
        return false;
      }
    }

    // 2. Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = (log.actor || '').toLowerCase().includes(q);
      const matchTarget = (log.target || '').toLowerCase().includes(q);
      const matchSummary = (log.summary || '').toLowerCase().includes(q);
      const matchDetails = (log.details || '').toLowerCase().includes(q);
      const matchRound = `round ${log.round || 1}`.includes(q);
      if (!matchActor && !matchTarget && !matchSummary && !matchDetails && !matchRound) {
        return false;
      }
    }

    return true;
  });

  const handleCopyLogs = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    const md = AdventureLogService.exportAsMarkdown('Tactical Adventure Log');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    AudioService.playTerminalBeep(1100, 0.05);
    const md = AdventureLogService.exportAsMarkdown('Tactical Adventure Log');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adventure-log-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    AudioService.playCombatHit(true);
    AdventureLogService.clearLogs();
    setShowClearConfirm(false);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!customNote.trim()) return;

    AudioService.playTerminalBeep(1000, 0.03);
    AdventureLogService.addNarrativeNote(customNote.trim(), 'Architect');
    setCustomNote('');
  };

  const getActorBadgeStyle = (actorType) => {
    switch (actorType) {
      case ACTOR_TYPES.PC:
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
      case ACTOR_TYPES.NPC:
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50';
      case ACTOR_TYPES.ENVIRONMENT:
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      case ACTOR_TYPES.GM:
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex justify-end font-sans">
      {/* Drawer Overlay Panel */}
      <div className="pointer-events-auto w-full max-w-xl bg-[#0b1019]/98 border-l border-cyan-500/40 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        
        {/* ── HEADER ── */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Scroll size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm tracking-wider uppercase text-cyan-200">
                  Adventure Log
                </h2>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50">
                  RND #{currentRound}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {logs.length} telemetry milestones captured
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLogs}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer border border-slate-800"
              title="Copy formatted Markdown log to clipboard"
            >
              {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer border border-slate-800"
              title="Download Adventure Log as .md"
            >
              <Download size={15} />
            </button>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer border border-slate-800"
              title="Clear all log entries"
            >
              <Trash2 size={15} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-1 text-base leading-none font-bold"
              title="Close Adventure Log"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── SEARCH & CATEGORY BAR ── */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-col gap-2 shrink-0">
          {/* Search box */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions, characters, dice rolls, or hazards..."
              className="w-full bg-[#0d1117] border border-slate-800 focus:border-cyan-500/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none placeholder:text-slate-600 font-mono transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5">
            {[
              { id: LOG_CATEGORIES.COMBAT, label: 'Combat', icon: '⚔️' },
              { id: LOG_CATEGORIES.INITIATIVE, label: 'Initiative', icon: '⚡' },
              { id: LOG_CATEGORIES.ENVIRONMENT, label: 'Environment', icon: '🌋' },
              { id: LOG_CATEGORIES.NARRATIVE, label: 'Story', icon: '📝' },
              { id: LOG_CATEGORIES.VITALS, label: 'Vitals', icon: '🩸' },
              { id: LOG_CATEGORIES.ALL, label: 'All', icon: null }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.02);
                  setActiveCategory(cat.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0 border ${
                  activeCategory === cat.id
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.label}</span>
              </button>
            ))}

            {/* Auto-Scroll Toggle */}
            <button
              type="button"
              onClick={() => setAutoScroll(prev => !prev)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors flex items-center gap-1 cursor-pointer border ${
                autoScroll
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title="Lock / Unlock Auto-Scroll"
            >
              <span>{autoScroll ? '🔒 Auto' : '🔓 Free'}</span>
            </button>
          </div>
        </div>

        {/* ── LOG ENTRIES FEED ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 select-text font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-600 text-center gap-2">
              <Scroll size={32} className="opacity-30" />
              <p className="text-xs">No adventure log entries match this filter.</p>
              <p className="text-[10px] text-slate-500">Initiative rolls, attacks, hazards, and GM notes will stream here.</p>
            </div>
          ) : (
            filteredLogs.map((entry) => {
              const isCrit = entry.isCrit;
              const isCritFail = entry.isCritFail;
              const isRoundStart = entry.type === 'round_start';
              const isTurnStart = entry.type === 'turn_start';
              const isEnv = entry.actorType === ACTOR_TYPES.ENVIRONMENT || entry.category === LOG_CATEGORIES.ENVIRONMENT;

              if (isRoundStart) {
                return (
                  <div key={entry.id} className="py-2 flex items-center gap-3 my-2">
                    <div className="h-px bg-amber-500/40 flex-1" />
                    <span className="text-[10px] font-bold font-mono tracking-widest text-amber-300 px-3 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)] uppercase">
                      {entry.summary}
                    </span>
                    <div className="h-px bg-amber-500/40 flex-1" />
                  </div>
                );
              }

              return (
                <div
                  key={entry.id}
                  className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isCrit
                      ? 'bg-amber-950/30 border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : isCritFail
                      ? 'bg-rose-950/40 border-rose-600/70 shadow-[0_0_12px_rgba(225,29,72,0.25)]'
                      : isTurnStart
                      ? 'bg-cyan-950/20 border-cyan-500/40'
                      : isEnv
                      ? 'bg-amber-950/20 border-amber-700/50'
                      : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  {/* Top line: Timestamp, Category, Actor Type Badge, Round */}
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-500">{entry.timestamp}</span>
                      <span className="text-slate-600">·</span>
                      <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold uppercase ${getActorBadgeStyle(entry.actorType)}`}>
                        {entry.actorType || 'System'}
                      </span>
                      <span className="font-bold text-slate-200 truncate">
                        {entry.actor}
                      </span>
                      {entry.target && (
                        <span className="text-slate-400 truncate flex items-center gap-0.5">
                          <span className="text-cyan-400">➔</span> {entry.target}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] px-1 bg-slate-950 text-slate-500 rounded border border-slate-800 font-mono">
                        R{entry.round || 1}
                      </span>
                      <span className="text-sm">{entry.badge || '🔹'}</span>
                    </div>
                  </div>

                  {/* Summary Text */}
                  <div className="text-xs text-slate-100 font-sans font-medium flex items-center justify-between gap-2">
                    <span>{entry.summary}</span>
                    {isCrit && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded uppercase shrink-0">
                        🌟 CRITICAL!
                      </span>
                    )}
                    {isCritFail && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded uppercase shrink-0">
                        💀 FUMBLE!
                      </span>
                    )}
                  </div>

                  {/* Technical / Mechanical Roll Details */}
                  {entry.details && entry.details !== entry.summary && (
                    <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80 break-words">
                      {entry.details}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>

        {/* ── QUICK GM NARRATIVE NOTE ENTRY ── */}
        <form onSubmit={handleAddNote} className="p-3 bg-slate-950/95 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Log GM narrative note, room description, or story beat (Enter)..."
                className="w-full bg-[#0d1117] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={!customNote.trim()}
              className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
              title="Add narrative note to adventure log"
            >
              <Send size={13} />
              <span>Log</span>
            </button>
          </div>
        </form>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-[#121824] border border-rose-500/50 rounded-2xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-3 text-slate-200">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>Clear Entire Adventure Log?</span>
              </div>
              <p className="text-xs text-slate-400">
                This will purge all {logs.length} logged tactical milestones, initiative rolls, and strikes for this sector map. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-md"
                >
                  Confirm Purge
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
