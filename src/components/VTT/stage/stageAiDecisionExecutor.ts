/**
 * @file stageAiDecisionExecutor.ts
 * @description Executes autonomous NPC AI turn decisions (movement, retreat, 2d10 combat strikes,
 *   map persistence, and multiplayer broadcasts) emitted via 'stage-ai-decision'.
 */

import {
  selectAllFusedTokens,
  useEngineStore,
  type FusedToken
} from '../../../engine/state/VolatileSharder.ts';
import type { VttEventMap } from '../../../utils/vttEventBus';

export interface StageAiDecisionContext {
  tokenId: string;
  decision: Record<string, any>;
  tokens: FusedToken[];
  currentMap: any;
  engineStore: ReturnType<typeof useEngineStore.getState>;
  updateMap?: (mapId: string, updates: Record<string, any>) => void;
  broadcastTokenMove: (tokenId: string, x: number, y: number, elevationFt?: number) => void;
  broadcastTokenVitals: (tokenId: string, vitals: any) => void;
  broadcastChatCard: (card: VttEventMap['stage-chat-card']) => void;
  emitChatCard: (card: VttEventMap['stage-chat-card']) => void;
  setCombatLog: React.Dispatch<React.SetStateAction<string[]>>;
  isArchitectRole?: boolean;
  rng?: () => number;
}

export interface StageAiExecutionResult {
  executed: boolean;
  reason?: string;
  actionType?: string;
  movedTo?: { x: number; y: number };
  targetId?: string;
  isHit?: boolean;
  netDamage?: number;
  effectiveTotal?: number;
  defenseDc?: number;
}

function persistTokenPositionOnMap(
  currentMap: any,
  updateMap: StageAiDecisionContext['updateMap'],
  tokenId: string,
  nextX: number,
  nextY: number
) {
  if (!currentMap?.id || typeof updateMap !== 'function' || !Array.isArray(currentMap.tokens)) {
    return;
  }
  const updatedTokens = currentMap.tokens.map((t: any) =>
    t?.id === tokenId ? { ...t, x: nextX, y: nextY } : t
  );
  updateMap(currentMap.id, { tokens: updatedTokens });
}

/**
 * Executes an autonomous unit AI decision on The Stage VTT canvas and combat engine.
 */
export function executeStageAiDecision({
  tokenId,
  decision,
  tokens,
  currentMap,
  engineStore,
  updateMap,
  broadcastTokenMove,
  broadcastTokenVitals,
  broadcastChatCard,
  emitChatCard,
  setCombatLog,
  isArchitectRole = true,
  rng = Math.random
}: StageAiDecisionContext): StageAiExecutionResult {
  if (!isArchitectRole || !tokenId || !decision) {
    return { executed: false, reason: 'unauthorized_or_invalid' };
  }

  const fusedTokens = tokens.length > 0 ? tokens : selectAllFusedTokens(engineStore);
  const actor = fusedTokens.find((t) => t.id === tokenId);
  if (!actor) {
    return { executed: false, reason: 'actor_not_found' };
  }

  const actorName = actor.name || (actor as any).label || 'Autonomous Unit';
  const actorX = Number(actor.x ?? 0);
  const actorY = Number(actor.y ?? 0);

  // Case 1: Morale Broken -> Retreat away from nearest opposing unit
  if (decision.status === 'morale_broken' || decision.actionType === 'retreat_or_surrender') {
    const opponents = fusedTokens.filter(
      (t) =>
        t.id !== actor.id &&
        (t.is_persona || (t as any).type === 'hero' || (t as any).designation === 'Ally')
    );

    let awayDx = -1;
    let awayDy = 0;
    if (opponents.length > 0) {
      let nearest = opponents[0]!;
      let minD = Math.hypot((nearest.x ?? 0) - actorX, (nearest.y ?? 0) - actorY);
      for (const opp of opponents.slice(1)) {
        const d = Math.hypot((opp.x ?? 0) - actorX, (opp.y ?? 0) - actorY);
        if (d < minD) {
          minD = d;
          nearest = opp;
        }
      }
      const dx = actorX - Number(nearest.x ?? 0);
      const dy = actorY - Number(nearest.y ?? 0);
      const len = Math.hypot(dx, dy);
      if (len > 0.001) {
        awayDx = dx / len;
        awayDy = dy / len;
      }
    }

    const retreatStepPx = 140;
    const nextX = Math.max(0, Math.round(actorX + awayDx * retreatStepPx));
    const nextY = Math.max(0, Math.round(actorY + awayDy * retreatStepPx));

    engineStore.updatePosition(tokenId, nextX, nextY);
    persistTokenPositionOnMap(currentMap, updateMap, tokenId, nextX, nextY);
    broadcastTokenMove(tokenId, nextX, nextY, actor.elevation_ft ?? 0);

    const card: VttEventMap['stage-chat-card'] = {
      id: `ai_retreat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      sender: actorName,
      visibility: 'public',
      kind: 'system',
      title: `AI Retreat: ${actorName}`,
      body: `${actorName} disengaged toward (${nextX}, ${nextY}).`
    };
    emitChatCard(card);
    broadcastChatCard(card);
    setCombatLog((prev) => [
      `[AI RETREAT] ${actorName} withdrew to (${nextX}, ${nextY}).`,
      ...prev.slice(0, 8)
    ]);

    return {
      executed: true,
      actionType: String(decision.actionType || 'retreat_or_surrender'),
      movedTo: { x: nextX, y: nextY }
    };
  }

  // Case 2: Combat Action Ready (optional Rush/Melee advance + canonical 2d10 strike)
  if (decision.status === 'action_ready' && decision.targetId) {
    const target = fusedTokens.find((t) => t.id === decision.targetId);
    if (!target) {
      return { executed: false, reason: 'target_not_found' };
    }

    const targetX = Number(target.x ?? 0);
    const targetY = Number(target.y ?? 0);
    const distPx = Math.hypot(targetX - actorX, targetY - actorY);
    let finalActorX = actorX;
    let finalActorY = actorY;
    let movedTo: { x: number; y: number } | undefined;

    if (
      (decision.actionType === 'rush_and_fire' || decision.actionType === 'melee_strike') &&
      distPx > 65
    ) {
      const speedPx = Math.max(70, Math.round(((actor.speed_ft || 30) / 5) * 35));
      const stepPx = Math.min(Math.max(0, distPx - 55), speedPx);
      if (stepPx > 0 && distPx > 0.001) {
        finalActorX = Math.max(0, Math.round(actorX + ((targetX - actorX) / distPx) * stepPx));
        finalActorY = Math.max(0, Math.round(actorY + ((targetY - actorY) / distPx) * stepPx));
        engineStore.updatePosition(tokenId, finalActorX, finalActorY);
        persistTokenPositionOnMap(currentMap, updateMap, tokenId, finalActorX, finalActorY);
        broadcastTokenMove(tokenId, finalActorX, finalActorY, actor.elevation_ft ?? 0);
        movedTo = { x: finalActorX, y: finalActorY };
      }
    }

    const d1 = Math.floor(rng() * 10) + 1;
    const d2 = Math.floor(rng() * 10) + 1;
    const natural = d1 + d2;
    const isCrit = natural === 20;
    const isFumble = natural === 2;
    const attackMod =
      Number((actor as any).attack_bonus ?? (actor as any).attackBonus ?? 4) +
      Number(decision.aimBonus ?? 0) +
      (decision.isBurst ? 2 : 0);
    const effectiveTotal = natural + attackMod + (isCrit ? 10 : isFumble ? -10 : 0);
    const defenseDc = Number((target as any).defense_dc ?? (target as any).defense ?? 15);
    // Tangent v6 canonical opposed roll rule: Defender Wins Ties
    const isHit = effectiveTotal > defenseDc;

    let netDamage = 0;
    const targetName = target.name || (target as any).label || 'Operator';
    const weaponName = String(decision.weaponName || 'Weapon Strike');

    if (isHit) {
      const rawDamage =
        (Number((actor as any).damage_base ?? 8) || 8) +
        (decision.isBurst ? 3 : 0) +
        (isCrit ? 6 : 0);
      const armorDr = Number((target as any).armor_dr ?? (target as any).armorDr ?? 0);
      netDamage = Math.max(1, rawDamage - armorDr);
      engineStore.applyDamage(target.id, netDamage, true);
      const updatedEph = useEngineStore.getState().ephemeralData[target.id];
      if (updatedEph) {
        broadcastTokenVitals(target.id, updatedEph);
      }
    }

    const card: VttEventMap['stage-chat-card'] = {
      id: `ai_atk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      sender: actorName,
      visibility: 'public',
      kind: 'attack',
      title: `${actorName} ➜ ${targetName} (${weaponName})`,
      body: isHit
        ? `HIT! Rolled ${effectiveTotal} vs Defense ${defenseDc}. Dealt ${netDamage} damage.`
        : `MISSED! Rolled ${effectiveTotal} vs Defense ${defenseDc}.`,
      diceBreakdown: {
        d1,
        d2,
        modifier: attackMod,
        total: effectiveTotal,
        dcOrCr: defenseDc,
        outcome: isHit ? 'HIT' : 'MISS',
        crit: isCrit,
        fumble: isFumble
      },
      ...(isHit
        ? {
            damagePayload: {
              targetTokenId: target.id,
              targetLabel: targetName,
              rawDamage: netDamage,
              netDamage,
              damageType: 'kinetic',
              isLethal: true,
              damageApplied: true
            }
          }
        : {})
    };
    emitChatCard(card);
    broadcastChatCard(card);
    setCombatLog((prev) => [
      `[AI ACTION] ${actorName} (${weaponName}) vs ${targetName}: ${effectiveTotal} vs DC ${defenseDc} -> ${
        isHit ? `HIT (${netDamage} DMG)` : 'MISS'
      }.`,
      ...prev.slice(0, 8)
    ]);

    return {
      executed: true,
      actionType: String(decision.actionType || 'standard_attack'),
      ...(movedTo ? { movedTo } : {}),
      targetId: target.id,
      isHit,
      netDamage,
      effectiveTotal,
      defenseDc
    };
  }

  return {
    executed: false,
    reason: 'no_canvas_action_required',
    actionType: String(decision.actionType || 'wait')
  };
}
