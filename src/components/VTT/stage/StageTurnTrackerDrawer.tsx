/**
 * @file StageTurnTrackerDrawer.tsx
 * @description Live Turn Order & Initiative Tracker drawer for Tripartite Stage VTT.
 * Uses persistent uiLayoutStore state and syncs turn progression + DoT effect ticks
 * across Architect and Operative sessions via VttMultiplayerSyncService.
 */

import React, { useMemo } from 'react';
import { Dices, SkipForward, RotateCcw, Clock, EyeOff, X, Bot } from 'lucide-react';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { useEngineStore } from '../../../engine/state/VolatileSharder';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { VttEventBus } from '../../../utils/vttEventBus';
import { AudioService } from '../../../services/audioService';
import { decideAutonomousAction } from '../../../services/unitBehaviorService';
import { useCampaign } from '../../../context/CampaignContext';
import { ModifierService } from '../../../services/modifierService';

export interface StageTurnTrackerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: any[];
  selectedTokenId: string | null;
  onSelectToken: (id: string) => void;
  isArchitectRole: boolean;
}

export const StageTurnTrackerDrawer: React.FC<StageTurnTrackerDrawerProps> = ({
  isOpen,
  onClose,
  tokens,
  selectedTokenId,
  onSelectToken,
  isArchitectRole
}) => {
  const roundNumber = useUILayoutStore((s) => s.roundNumber);
  const currentTurnIndex = useUILayoutStore((s) => s.currentTurnIndex);
  const initiativeScores = useUILayoutStore((s) => s.initiativeScores);
  const setTurnState = useUILayoutStore((s) => s.setTurnState);
  const resetTurnState = useUILayoutStore((s) => s.resetTurnState);
  const { universeState, setGalleryModifiers } = (useCampaign() as any) || {};

  const orderedAll = useMemo(() => {
    return [...(tokens || [])].sort((a, b) => {
      const sa = initiativeScores[a.id];
      const sb = initiativeScores[b.id];
      if (sa === undefined && sb === undefined) return 0;
      if (sa === undefined) return 1;
      if (sb === undefined) return -1;
      return sb - sa;
    });
  }, [tokens, initiativeScores]);

  const visibleTokens = useMemo(
    () => (isArchitectRole ? orderedAll : orderedAll.filter((t) => !t.is_hidden)),
    [orderedAll, isArchitectRole]
  );

  if (!isOpen) return null;

  const activeCombatant = orderedAll[currentTurnIndex] || null;
  const activeCombatantId = activeCombatant?.id || null;
  const canRunAiTurn = Boolean(
    isArchitectRole &&
      activeCombatant &&
      (activeCombatant.script ||
        activeCombatant.behaviorProfile ||
        activeCombatant.type === 'enemy' ||
        activeCombatant.designation === 'Adversary')
  );

  const handleRunAiTurn = () => {
    if (!canRunAiTurn || !activeCombatant) return;
    AudioService.playTerminalBeep(1320, 0.04);
    const heroTargets = orderedAll.filter(
      (t) =>
        t.id !== activeCombatant.id &&
        (t.type === 'hero' || t.designation === 'Ally' || (!t.script && t.type !== 'enemy' && t.designation !== 'Adversary'))
    );
    const decision = decideAutonomousAction(activeCombatant, heroTargets, { allies: orderedAll });
    const unitName = activeCombatant.name || activeCombatant.label || 'Autonomous Unit';
    const card = {
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      sender: unitName,
      visibility: 'public' as const,
      kind: 'system' as const,
      title: `AI Turn: ${unitName}`,
      body: decision.flavorText || `Executed ${decision.actionType || 'tactical action'}.`
    };
    VttEventBus.emit('stage-chat-card', card);
    VttEventBus.emit('stage-ai-decision', { tokenId: activeCombatant.id, decision });
    getVttMultiplayerSync().broadcastChatCard(card);
  };

  const handleRollAllInitiative = () => {
    if (!isArchitectRole || orderedAll.length === 0) return;
    AudioService.playTerminalBeep(1200, 0.04);
    const scores: Record<string, number> = {};
    orderedAll.forEach((t) => {
      const initMod = Number(t.initiative_mod ?? t.attributes?.agi ?? t.attributes?.agility ?? 0);
      scores[t.id] = (Math.floor(Math.random() * 10) + 1) + (Math.floor(Math.random() * 10) + 1) + initMod;
    });
    const sorted = [...orderedAll].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
    setTurnState({
      roundNumber,
      currentTurnIndex: 0,
      initiativeScores: scores
    });
    if (sorted[0]) {
      onSelectToken(sorted[0].id);
    }
    getVttMultiplayerSync().broadcastTurnState({
      roundNumber,
      currentTurnIndex: 0,
      initiativeScores: scores
    });
    const card = {
      id: `init_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      sender: 'Architect',
      visibility: 'public' as const,
      kind: 'system' as const,
      title: 'Initiative Rolled',
      body: `Rolled 2d10 initiative for ${orderedAll.length} combatant(s). Top actor: ${sorted[0]?.name || 'Unknown'} (${scores[sorted[0]?.id] ?? 0}).`
    };
    getVttMultiplayerSync().broadcastChatCard(card);
    VttEventBus.emit('stage-chat-card', card);
  };

  const handleNextTurn = () => {
    if (!isArchitectRole || orderedAll.length === 0) return;
    AudioService.playTerminalBeep(1050, 0.03);

    const nextIndex = (currentTurnIndex + 1) % orderedAll.length;
    const nextToken = orderedAll[nextIndex];
    const nextRound = nextIndex === 0 ? roundNumber + 1 : roundNumber;

    setTurnState({
      roundNumber: nextRound,
      currentTurnIndex: nextIndex
    });

    if (nextRound > roundNumber) {
      VttEventBus.emit('stage-round-advanced', { roundNumber: nextRound });
      const activeGalleryMods = Array.isArray(universeState?.galleryModifiers)
        ? universeState.galleryModifiers
        : [];
      if (activeGalleryMods.length > 0 && typeof setGalleryModifiers === 'function') {
        const { updatedModifiers, expiredModifiers } = ModifierService.tickModifiers(activeGalleryMods);
        setGalleryModifiers(updatedModifiers);
        if (expiredModifiers.length > 0) {
          VttEventBus.emit('stage-chat-card', {
            id: `mod_exp_${Date.now()}`,
            timestamp: new Date().toISOString(),
            sender: 'Round Clock',
            visibility: 'public',
            kind: 'effect',
            title: `Round ${nextRound}: Modifiers Expired`,
            body: `Expired: ${expiredModifiers.map((m: any) => m.name || m.id).join(', ')}`
          });
        }
      }
    }

    if (nextToken) {
      onSelectToken(nextToken.id);
      const eng = useEngineStore.getState();
      const tickRes = eng.tickActiveEffectsForToken(nextToken.id);
      if (tickRes.ticked.length > 0 || tickRes.expired.length > 0) {
        const msgParts: string[] = [];
        if (tickRes.totalDamage > 0) {
          msgParts.push(`${tickRes.totalDamage} DoT damage applied`);
        }
        if (tickRes.expired.length > 0) {
          msgParts.push(`Expired: ${tickRes.expired.map((e) => e.name).join(', ')}`);
        }
        const effectCard = {
          id: `eff_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          sender: nextToken.name || 'Combatant',
          visibility: 'public' as const,
          kind: 'effect' as const,
          title: `Turn Effects: ${nextToken.name || 'Combatant'}`,
          body: msgParts.join(' • ') || `${tickRes.ticked.length} active effect(s) ticked`
        };
        VttEventBus.emit('stage-chat-card', effectCard);
        getVttMultiplayerSync().broadcastChatCard(effectCard);
      }

      const nextEph = useEngineStore.getState().ephemeralData[nextToken.id];
      if (nextEph) {
        getVttMultiplayerSync().broadcastTokenVitals(nextToken.id, nextEph);
      }
    }

    getVttMultiplayerSync().broadcastTurnState({
      roundNumber: nextRound,
      currentTurnIndex: nextIndex,
      initiativeScores
    });
  };

  const handleResetTurns = () => {
    if (!isArchitectRole) return;
    AudioService.playTerminalBeep(780, 0.03);
    resetTurnState();
    getVttMultiplayerSync().broadcastTurnState({
      roundNumber: 1,
      currentTurnIndex: 0,
      initiativeScores: {}
    });
  };

  return (
    <div
      role="dialog"
      aria-label="Stage Turn Tracker"
      className="fixed top-14 left-4 z-[176] w-80 max-w-[92vw] bg-[#0a0f1d]/95 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl font-mono text-xs"
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] uppercase">
          <Clock size={12} className="text-cyan-400" />
          <span>Turn Order</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-200">
            Round {roundNumber}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
          aria-label="Close Turn Tracker"
        >
          <X size={13} />
        </button>
      </div>

      {/* Architect Controls */}
      {isArchitectRole && (
        <div className="p-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRollAllInitiative}
            disabled={orderedAll.length === 0}
            className="flex-1 px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
          >
            <Dices size={11} />
            <span>Roll Init</span>
          </button>
          <button
            type="button"
            onClick={handleNextTurn}
            disabled={orderedAll.length === 0}
            className="flex-1 px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
          >
            <SkipForward size={11} />
            <span>Next Turn</span>
          </button>
          {canRunAiTurn && (
            <button
              type="button"
              onClick={handleRunAiTurn}
              className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              title="Execute autonomous FSM decision for active NPC unit"
            >
              <Bot size={11} />
              <span>Run AI Turn</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleResetTurns}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
            title="Reset Round & Initiative"
            aria-label="Reset Turn Order"
          >
            <RotateCcw size={11} />
          </button>
        </div>
      )}

      {/* Combatant Queue */}
      <div className="max-h-64 overflow-y-auto p-2 space-y-1">
        {visibleTokens.length === 0 ? (
          <div className="text-[10.5px] text-slate-500 italic py-4 text-center">
            No combatants deployed on Stage.
          </div>
        ) : (
          visibleTokens.map((tok, idx) => {
            const isActiveTurn = tok.id === activeCombatantId;
            const isSelected = tok.id === selectedTokenId;
            const score = initiativeScores[tok.id];
            const isSynth = Boolean(tok.is_synthetic);
            const vitalsStr = isSynth
              ? `${tok.current_structure ?? tok.base_structure ?? 60} SP`
              : `${tok.current_vitality ?? tok.base_vitality ?? 30} VP | ${tok.current_health ?? tok.current_hp ?? tok.base_hp ?? 30} HP`;

            return (
              <button
                key={tok.id || idx}
                type="button"
                onClick={() => onSelectToken(tok.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  isActiveTurn
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : isSelected
                      ? 'bg-slate-900 border-amber-500/50 text-slate-100'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                      isActiveTurn
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {score !== undefined ? score : '—'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 truncate font-bold text-[11px]">
                      <span className="truncate">{tok.name || 'Unit'}</span>
                      {tok.is_hidden && isArchitectRole && (
                        <EyeOff size={10} className="text-rose-400 shrink-0" aria-label="Hidden Token" />
                      )}
                    </div>
                    <div className="text-[9.5px] text-slate-400">{vitalsStr}</div>
                  </div>
                </div>
                {isActiveTurn && (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/50 text-[9px] font-bold text-cyan-300 shrink-0 uppercase">
                    Active
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StageTurnTrackerDrawer;
