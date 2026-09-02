import React, { useState } from 'react';
import { CANONICAL_REACTIONS, getReactionDefinition, canTokenReact, spendTokenReaction } from '../../../../services/reactionService';
import AudioService from '../../../../services/audioService';

const ReactionPromptModal = ({
  isOpen,
  onClose,
  reactorToken,
  targetToken = null,
  initialReactionId = 'opportunity_strike',
  eventDescription = '',
  onUpdateToken,
  onTriggerFloatingText,
  onInitiateCombatStrike,
  onBroadcastMessage
}) => {
  const [selectedReactionId, setSelectedReactionId] = useState(initialReactionId || 'opportunity_strike');
  const [isExecuting, setIsExecuting] = useState(false);
  const [resolutionLog, setResolutionLog] = useState(null);

  if (!isOpen || !reactorToken) return null;

  const hasReactionAvailable = canTokenReact(reactorToken);
  const selectedDef = getReactionDefinition(selectedReactionId) || CANONICAL_REACTIONS[0];

  const handleExecuteReaction = () => {
    if (!hasReactionAvailable) {
      alert(`${reactorToken.label || 'Unit'} has already spent their reaction for this round.`);
      return;
    }

    setIsExecuting(true);
    AudioService.playTerminalBeep(980, 0.15);

    // 1. Spend the reaction from action budget
    const updatedReactor = spendTokenReaction(reactorToken);
    onUpdateToken?.(reactorToken.id, updatedReactor);

    let logMsg = '';

    // 2. Process specific reaction effects
    if (selectedDef.id === 'opportunity_strike') {
      AudioService.playCombatHit(false);
      logMsg = `⚔️ ${reactorToken.label} executed Opportunity Strike vs ${targetToken?.label || 'Target'}!`;
      if (onTriggerFloatingText) {
        onTriggerFloatingText(reactorToken.x, reactorToken.y, `⚔️ OPPORTUNITY STRIKE!`, 'damage');
      }
      if (onInitiateCombatStrike && targetToken) {
        onInitiateCombatStrike(reactorToken.id, targetToken.id);
      }
    } else if (selectedDef.id === 'kinetic_shield_overcharge') {
      AudioService.playTerminalBeep(1200, 0.2);
      logMsg = `🛡️ ${reactorToken.label} flared Kinetic Shield Overcharge (+4 DR Soak)!`;
      if (onTriggerFloatingText) {
        onTriggerFloatingText(reactorToken.x, reactorToken.y, `🛡️ SHIELD OVERCHARGE (+4 DR)`, 'heal');
      }
    } else if (selectedDef.id === 'defensive_parry') {
      AudioService.playCombatHit(false);
      logMsg = `🤺 ${reactorToken.label} took Defensive Parry (+3 Defense DC)!`;
      if (onTriggerFloatingText) {
        onTriggerFloatingText(reactorToken.x, reactorToken.y, `🤺 PARRY (+3 DEFENSE)`, 'heal');
      }
    } else if (selectedDef.id === 'dive_for_cover') {
      AudioService.playTerminalBeep(600, 0.15);
      logMsg = `🏃‍♂️ ${reactorToken.label} dived for cover (Advantage on Reflex, -50% AoE Dmg)!`;
      if (onTriggerFloatingText) {
        onTriggerFloatingText(reactorToken.x, reactorToken.y, `🏃‍♂️ DIVE FOR COVER!`, 'heal');
      }
    } else if (selectedDef.id === 'overwatch_snapshot') {
      AudioService.playCombatHit(true);
      logMsg = `🎯 ${reactorToken.label} fired Overwatch Intercept Snapshot!`;
      if (onTriggerFloatingText) {
        onTriggerFloatingText(reactorToken.x, reactorToken.y, `🎯 OVERWATCH SNAPSHOT (-2)`, 'damage');
      }
      if (onInitiateCombatStrike && targetToken) {
        onInitiateCombatStrike(reactorToken.id, targetToken.id);
      }
    } else if (selectedDef.id === 'cyber_counter_hack') {
      AudioService.playTerminalBeep(1400, 0.25);
      logMsg = `💻 ${reactorToken.label} engaged Cyber-ICE Counter-Hack!`;
      if (onTriggerFloatingText) {
        onTriggerFloatingText(reactorToken.x, reactorToken.y, `💻 COUNTER-HACK ENGAGED`, 'karma');
      }
    }

    setResolutionLog(logMsg);

    if (onBroadcastMessage) {
      onBroadcastMessage(`[COMBAT REACTION INTERRUPT]: ${logMsg}`);
    }

    setTimeout(() => {
      setIsExecuting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-fadeIn">
      <div className="bg-[#141824] border border-amber-500/70 rounded-xl p-5 w-full max-w-xl shadow-[0_0_50px_rgba(245,158,11,0.3)] text-white flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-amber-300">
                  Combat Reaction &amp; Interrupt
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  hasReactionAvailable 
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' 
                    : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                }`}>
                  {hasReactionAvailable ? '🟢 Reaction Ready' : '🔴 Reaction Spent'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reactor: <span className="text-cyan-300 font-bold">{reactorToken.label || 'Combatant'}</span>
                {targetToken && (
                  <> vs Target: <span className="text-rose-400 font-bold">{targetToken.label || 'Target'}</span></>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-2xl font-bold leading-none px-2 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Trigger Event Banner */}
        {eventDescription && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-600/50 text-xs text-amber-200 flex items-start gap-2 leading-relaxed">
            <span className="text-base shrink-0">⚠️</span>
            <div>
              <span className="font-bold uppercase tracking-wide text-amber-400 block mb-0.5">Trigger Condition:</span>
              {eventDescription}
            </div>
          </div>
        )}

        {/* Reaction Selector List */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Choose Reaction Action:
          </label>

          <div className="grid grid-cols-1 gap-2">
            {CANONICAL_REACTIONS.map(reaction => {
              const isSelected = selectedReactionId === reaction.id;

              return (
                <button
                  key={reaction.id}
                  type="button"
                  onClick={() => {
                    setSelectedReactionId(reaction.id);
                    AudioService.playTerminalBeep(650, 0.05);
                  }}
                  className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{reaction.icon}</span>
                      <span className="text-xs font-bold text-amber-300">{reaction.label}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                        {reaction.category}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                      {reaction.actionCost}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {reaction.effect}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-500">
                    <span>Trigger: {reaction.trigger}</span>
                    <span className="font-mono text-[9px] text-slate-400">{reaction.rulebook}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Execution Log */}
        {resolutionLog && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-xs font-bold text-emerald-300 text-center animate-fadeIn">
            {resolutionLog}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Pass / Dismiss (No Reaction)
          </button>

          <button
            type="button"
            onClick={handleExecuteReaction}
            disabled={!hasReactionAvailable || isExecuting}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span> Execute Reaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactionPromptModal;
