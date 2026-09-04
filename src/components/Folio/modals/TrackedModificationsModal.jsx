import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  RotateCcw, 
  ShieldCheck,
  MessageSquareQuote,
  X
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { AudioService } from '../../../services/audioService';

export const TrackedModificationsModal = ({ isOpen, onClose }) => {
  const { 
    characterData, 
    revertTrackedModification
  } = useFolio();

  if (!isOpen) return null;

  const modifications = Array.isArray(characterData.tracked_modifications) 
    ? characterData.tracked_modifications 
    : [];

  const pendingCount = modifications.filter(m => m.status === 'pending').length;
  const acceptedCount = modifications.filter(m => m.status === 'accepted').length;
  const refusedCount = modifications.filter(m => m.status === 'refused').length;
  const adjustedCount = modifications.filter(m => m.status === 'adjusted').length;

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'None';
    if (typeof val === 'object') {
      if (Array.isArray(val)) return `[${val.length} items]`;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const handleRevert = (modId) => {
    if (window.confirm("Revert this modification back to its original value?")) {
      revertTrackedModification(modId);
      AudioService.playTerminalBeep(1100, 0.05);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#0e1420] border border-cyan-500/60 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.25)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#141b2b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-cyan-200 uppercase tracking-wider">
                  Tracked Modifications &amp; GM Review
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  {modifications.length} Changes
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Operative: <strong className="text-white">{characterData['char-name'] || 'Unnamed Operative'}</strong> &bull; Player Override Audit Log
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Counters Pill Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950 border-b border-slate-850 font-mono text-center text-xs">
          <div className="p-2 rounded bg-[#121927] border border-amber-500/40">
            <span className="text-amber-400 font-bold block text-sm">{pendingCount}</span>
            <span className="text-[10px] text-amber-200/80 uppercase">Pending GM</span>
          </div>
          <div className="p-2 rounded bg-[#121927] border border-emerald-500/40">
            <span className="text-emerald-400 font-bold block text-sm">{acceptedCount}</span>
            <span className="text-[10px] text-emerald-200/80 uppercase">Accepted</span>
          </div>
          <div className="p-2 rounded bg-[#121927] border border-blue-500/40">
            <span className="text-blue-400 font-bold block text-sm">{adjustedCount}</span>
            <span className="text-[10px] text-blue-200/80 uppercase">Adjust Advised</span>
          </div>
          <div className="p-2 rounded bg-[#121927] border border-red-500/40">
            <span className="text-red-400 font-bold block text-sm">{refusedCount}</span>
            <span className="text-[10px] text-red-200/80 uppercase">Refused</span>
          </div>
        </div>

        {/* Body: Modification Entries List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {modifications.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/50 rounded-lg border border-dashed border-slate-800">
              <ShieldCheck size={32} className="mx-auto text-cyan-400/60 mb-2" />
              <div className="text-sm font-bold text-slate-300">No Tracked Modifications</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your character has not logged any active game modifications. While in Player Override, modifications to your sheet will be recorded here for GM review.
              </p>
            </div>
          ) : (
            modifications.map((mod, idx) => {
              const status = mod.status || 'pending';
              const isPending = status === 'pending';
              const isAccepted = status === 'accepted';
              const isRefused = status === 'refused';
              const isAdjusted = status === 'adjusted';

              return (
                <div 
                  key={mod.id || idx}
                  className={`p-3 rounded-lg border transition-all ${
                    isPending 
                      ? 'bg-[#141926] border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                      : isAccepted
                      ? 'bg-[#0f1d19] border-emerald-500/50'
                      : isAdjusted
                      ? 'bg-[#0e1c2b] border-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                      : 'bg-[#1d1216] border-red-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                          {mod.fieldLabel || mod.field}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {mod.timestamp ? new Date(mod.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono mt-1">
                        <span className="text-slate-400 line-through bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {formatValue(mod.oldValue)}
                        </span>
                        <span className="text-cyan-400">➔</span>
                        <span className="text-emerald-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {formatValue(mod.newValue)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500 flex items-center gap-1">
                          <Clock size={11} /> PENDING REVIEW
                        </span>
                      )}
                      {isAccepted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1">
                          <CheckCircle2 size={11} /> ACCEPTED
                        </span>
                      )}
                      {isAdjusted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-500 flex items-center gap-1">
                          <HelpCircle size={11} /> ADJUST ADVISED
                        </span>
                      )}
                      {isRefused && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500 flex items-center gap-1">
                          <XCircle size={11} /> REFUSED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Player Note */}
                  {mod.playerNote && (
                    <div className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800 mb-2 flex items-start gap-1.5">
                      <MessageSquareQuote size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase block">Player Note:</span>
                        <span>{mod.playerNote}</span>
                      </div>
                    </div>
                  )}

                  {/* GM Feedback / Advice */}
                  {mod.gmFeedback && (
                    <div className={`text-xs p-2 rounded border flex items-start gap-1.5 mb-2 ${
                      isAdjusted 
                        ? 'bg-blue-950/80 border-blue-500/60 text-blue-200' 
                        : isRefused
                        ? 'bg-red-950/80 border-red-500/60 text-red-200'
                        : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                    }`}>
                      <MessageSquareQuote size={13} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase block">
                          GM Reply {isAdjusted ? 'Suggestion' : 'Feedback'}:
                        </span>
                        <span>{mod.gmFeedback}</span>
                      </div>
                    </div>
                  )}

                  {/* Action row (Revert if refused or pending) */}
                  {(isRefused || isPending || isAdjusted) && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleRevert(mod.id)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        title="Revert back to original value"
                      >
                        <RotateCcw size={11} /> Revert Change
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-[#0d121c] border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 text-cyan-300/80">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Persona Folio is strictly player property. GM cannot directly edit or delete this sheet.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase rounded text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackedModificationsModal;
