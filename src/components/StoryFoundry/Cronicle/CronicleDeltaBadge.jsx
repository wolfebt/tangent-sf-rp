import React, { useState } from 'react';
import { Sparkles, Check, X, CheckCheck, ChevronUp, ChevronDown, ArrowRight, BookOpen } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

/**
 * CronicleDeltaBadge: Floating "Human-as-Sculptor" Delta Inspector Badge
 * Alerts the author when AIME has deduced state transitions from recent prose,
 * allowing granular Accept, Modify, or Dismiss operations.
 */
export default function CronicleDeltaBadge({
  pendingDeltas = [],
  onAcceptDelta,
  onAcceptAll,
  onRejectDelta,
  onClearAll,
  onOpenCronicleModal
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!pendingDeltas || pendingDeltas.length === 0) return null;

  const count = pendingDeltas.length;

  const handleAccept = (deltaId) => {
    AudioService.playTerminalBeep(1200, 0.04);
    if (onAcceptDelta) onAcceptDelta(deltaId);
  };

  const handleReject = (deltaId) => {
    AudioService.playCombatHit(false);
    if (onRejectDelta) onRejectDelta(deltaId);
  };

  const handleAcceptAll = () => {
    AudioService.playTerminalBeep(1400, 0.08);
    if (onAcceptAll) onAcceptAll();
    setIsExpanded(false);
  };

  const handleDismissAll = () => {
    AudioService.playCombatHit(false);
    if (onClearAll) onClearAll();
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans select-none max-w-md w-full animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Expanded Review Drawer */}
      {isExpanded && (
        <div className="bg-[#0f172a]/95 backdrop-blur-md border border-amber-500/50 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.25)] p-4 w-full flex flex-col gap-3 max-h-96 overflow-hidden text-slate-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  AI State Transitions ({count})
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  Human Sculptor Review: Approve or dismiss deductions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-[10px] font-bold uppercase rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title="Approve all state transitions"
              >
                <CheckCheck size={11} />
                <span>Accept All</span>
              </button>
              <button
                type="button"
                onClick={handleDismissAll}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase rounded-md transition-colors cursor-pointer"
                title="Dismiss all pending transitions"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Deltas Feed */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {pendingDeltas.map((delta) => (
              <div
                key={delta.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-2.5 flex flex-col gap-1.5 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold text-[9px] uppercase rounded">
                      {delta.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-100 truncate max-w-[160px]" title={delta.entityId}>
                      {delta.entityId}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAccept(delta.id)}
                      className="p-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-400 hover:text-emerald-300 rounded transition-colors cursor-pointer"
                      title="Accept state transition"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(delta.id)}
                      className="p-1 bg-slate-800 hover:bg-red-950/60 hover:border-red-500/40 text-slate-400 hover:text-red-300 rounded transition-colors cursor-pointer"
                      title="Dismiss transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
                  {delta.target && <span className="text-slate-400">[{delta.target}]</span>}
                  {delta.value && <span className="text-cyan-300 font-bold">➔ {String(delta.value)}</span>}
                </div>

                {delta.explanation && (
                  <p className="text-[10px] text-slate-400 italic line-clamp-2">
                    "{delta.explanation}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Footer Action to open full Cronicle */}
          {onOpenCronicleModal && (
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                onOpenCronicleModal();
              }}
              className="w-full text-center py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 rounded-lg text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={12} />
              <span>Open Master Cronicle Deck</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className={`px-3.5 py-2 rounded-2xl border shadow-xl flex items-center gap-2.5 transition-all cursor-pointer ${
          isExpanded
            ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] font-bold'
            : 'bg-[#0f172a]/95 text-amber-300 border-amber-500/60 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
        }`}
        title="Review AI-extracted state transitions"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
        <span className="text-xs font-mono font-bold tracking-wider uppercase">
          ⚡ {count} State Delta{count > 1 ? 's' : ''}
        </span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );
}
