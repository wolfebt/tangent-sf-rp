import React, { useState } from 'react';
import { 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle,
  User
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { AudioService } from '../../../services/audioService';

interface GMModificationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetHeroId?: string | null;
}

export const GMModificationReviewModal: React.FC<GMModificationReviewModalProps> = ({
  isOpen,
  onClose,
  targetHeroId
}) => {
  const folio = (useFolio() || {}) as any;
  const { personaRoster, reviewTrackedModification } = folio;

  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [activeAdjustModId, setActiveAdjustModId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Gather pending modifications for targetHero or all heroes
  const heroes = Array.isArray(personaRoster) ? personaRoster : [];
  const relevantHeroes = targetHeroId 
    ? heroes.filter(h => {
        const cId = h['character-doc-id'] || h.id;
        return cId === targetHeroId || (cId && targetHeroId.startsWith(cId + '-'));
      })
    : heroes;

  interface FlattenedMod {
    heroId: string;
    heroName: string;
    mod: any;
  }

  const pendingItems: FlattenedMod[] = [];
  relevantHeroes.forEach(h => {
    const hId = h['character-doc-id'] || h.id || 'hero';
    const hName = h['char-name'] || h.name || 'Hero Operative';
    const mods = Array.isArray(h.tracked_modifications) ? h.tracked_modifications : [];
    mods.forEach((m: any) => {
      if (m.status === 'pending') {
        pendingItems.push({
          heroId: hId,
          heroName: hName,
          mod: m
        });
      }
    });
  });

  const handleAction = (heroId: string, modId: string, action: 'accepted' | 'refused' | 'adjusted') => {
    const feedback = feedbackNotes[modId] || '';
    if (action === 'adjusted' && !feedback.trim()) {
      alert("Please provide suggestions or instructions for the player on how to adjust this modification.");
      return;
    }

    if (reviewTrackedModification) {
      reviewTrackedModification(heroId, modId, action, feedback);
      if (action === 'accepted') {
        AudioService.playCriticalChime(true);
      } else {
        AudioService.playTerminalBeep(900, 0.05);
      }
    }

    // Clear feedback state
    setFeedbackNotes(prev => {
      const next = { ...prev };
      delete next[modId];
      return next;
    });
    setActiveAdjustModId(null);
  };

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return 'None';
    if (typeof val === 'object') {
      if (Array.isArray(val)) return `[${val.length} items]`;
      return JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#0e1420] border border-amber-500/60 rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.25)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#141b2b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-amber-200 uppercase tracking-wider font-mono">
                  GM Review: Player Sheet Modifications
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                  {pendingItems.length} Pending
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Review, accept, refuse, or advise adjustments on active game overrides.
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

        {/* Protection Notice Banner */}
        <div className="px-4 py-2.5 bg-cyan-950/40 border-b border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-200 font-mono">
          <Sparkles size={14} className="text-cyan-400 shrink-0" />
          <span>
            <strong>PLAYER OWNERSHIP GUARANTEE:</strong> You cannot directly edit or delete the player's folio. You can Accept, Refuse, or Reply with suggested adjustments.
          </span>
        </div>

        {/* Pending Items List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 font-mono text-xs">
          {pendingItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
              <Check size={32} className="mx-auto text-emerald-400/70 mb-2" />
              <div className="text-sm font-bold text-slate-300">All Modifications Clear</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-sans">
                There are no pending sheet modifications from players awaiting GM review at this time.
              </p>
            </div>
          ) : (
            pendingItems.map(({ heroId, heroName, mod }) => {
              const feedback = feedbackNotes[mod.id] || '';
              const isAdjustOpen = activeAdjustModId === mod.id;

              return (
                <div 
                  key={mod.id}
                  className="p-3.5 rounded-lg bg-[#121826] border border-slate-700/80 hover:border-amber-500/50 transition-all space-y-2.5 shadow-sm"
                >
                  {/* Hero & Field Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                        <User size={12} className="text-cyan-400" />
                        {heroName}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-cyan-300 font-bold uppercase">
                        {mod.fieldLabel || mod.field}
                      </span>
                    </div>

                    <span className="text-[10.5px] text-slate-500 shrink-0 flex items-center gap-1">
                      <Clock size={11} />
                      {mod.timestamp ? new Date(mod.timestamp).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>

                  {/* Diff representation */}
                  <div className="flex items-center gap-2 text-xs bg-slate-950/80 p-2 rounded border border-slate-850">
                    <span className="text-slate-400 line-through bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {formatValue(mod.oldValue)}
                    </span>
                    <span className="text-cyan-400 font-bold">➔</span>
                    <span className="text-emerald-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {formatValue(mod.newValue)}
                    </span>
                  </div>

                  {/* Player Note */}
                  {mod.playerNote && (
                    <div className="text-[11px] text-slate-300 bg-slate-950/50 p-2 rounded border border-slate-800 flex items-start gap-1.5 font-sans">
                      <MessageSquare size={13} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 uppercase block font-mono text-[10px]">
                          Player Reason:
                        </span>
                        <span>{mod.playerNote}</span>
                      </div>
                    </div>
                  )}

                  {/* Optional Feedback or Adjustment Note Input */}
                  {(isAdjustOpen || feedback.length > 0) && (
                    <div className="space-y-1 pt-1 font-sans">
                      <label className="text-[10px] text-slate-400 uppercase font-mono block">
                        Reply message / suggestions to player:
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Please set rank to 2 or invest in specialization instead..."
                        value={feedback}
                        onChange={(e) => setFeedbackNotes(prev => ({ ...prev, [mod.id]: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded text-xs outline-none focus:border-cyan-400 font-sans"
                        autoFocus={isAdjustOpen}
                      />
                    </div>
                  )}

                  {/* GM Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleAction(heroId, mod.id, 'accepted')}
                      className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 font-bold rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      title="Accept modification into game state"
                    >
                      <Check size={12} /> Accept
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isAdjustOpen) {
                          setActiveAdjustModId(mod.id);
                        } else {
                          handleAction(heroId, mod.id, 'adjusted');
                        }
                      }}
                      className="px-3 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-500/60 text-blue-300 font-bold rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer hover:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                      title="Suggest an adjustment to the player"
                    >
                      <HelpCircle size={12} /> {isAdjustOpen ? 'Send Suggestion' : 'Adjust'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt("Enter refusal reason / explanation for player:", "Disallowed for this encounter");
                        if (reason !== null) {
                          setFeedbackNotes(prev => ({ ...prev, [mod.id]: reason }));
                          handleAction(heroId, mod.id, 'refused');
                        }
                      }}
                      className="px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                      title="Refuse modification"
                    >
                      <X size={12} /> Refuse
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0d121c] border-t border-slate-850 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="text-[11px] text-slate-500">
            Tangent SF RP &bull; Tactical Modification Review Engine
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase rounded text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GMModificationReviewModal;
