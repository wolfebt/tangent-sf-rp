import React from 'react';
import { Check, X, CheckCheck, Trash2, ShieldAlert, Activity } from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export default function CronicleDeltaReviewTab({
  pendingDeltas = [],
  acceptPendingDelta,
  rejectPendingDelta,
  acceptAllPendingDeltas,
  clearPendingDeltas
}) {
  const count = pendingDeltas.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header Banner */}
      <div className="p-4 bg-amber-950/30 border border-amber-500/50 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-500/60 flex items-center justify-center text-amber-300">
            <Activity size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                Staged State Deltas Review Ledger
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/60 text-amber-300 font-mono">
                {count} Pending
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              Human-as-Sculptor oversight protocol: Inspect and approve state transitions proposed by live Stage combat and AIME.
            </p>
          </div>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                AudioService.playCriticalChime(true);
                acceptAllPendingDeltas?.();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Accept all pending state mutations"
            >
              <CheckCheck size={14} />
              <span>Approve All</span>
            </button>

            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(700, 0.05);
                clearPendingDeltas?.();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-300 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Dismiss all pending deltas"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Deltas Cards Grid */}
      <div className="space-y-2.5">
        {pendingDeltas.map(delta => (
          <div
            key={delta.id}
            className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl flex items-start justify-between gap-4 transition-colors"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/50 uppercase">
                  {delta.action?.replace(/_/g, ' ')}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800 uppercase">
                  Source: {delta.source || 'runtime'}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  Target: {delta.target || delta.entityId || 'Global State'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono ml-auto">
                  {delta.timestamp ? new Date(delta.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {delta.explanation || delta.value || 'Stage combat or narrative mutation.'}
              </p>

              {delta.rawEvent && (
                <div className="text-[10px] font-mono text-slate-500 truncate max-w-xl">
                  Payload: {JSON.stringify(delta.rawEvent)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.04);
                  acceptPendingDelta?.(delta.id);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Approve and commit this delta"
              >
                <Check size={13} />
                <span>Approve</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(700, 0.04);
                  rejectPendingDelta?.(delta.id);
                }}
                className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 transition-colors cursor-pointer"
                title="Dismiss delta"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ))}

        {count === 0 && (
          <div className="p-12 text-center text-slate-500 italic text-xs font-mono bg-slate-950/60 border border-slate-800 rounded-xl">
            No pending state deltas in queue. When units fall in combat, bulkheads breach, or loot drops on The Stage, real-time proposed mutations will stage here for referee verification.
          </div>
        )}
      </div>
    </div>
  );
}
