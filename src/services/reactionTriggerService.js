/**
 * TANGENT SFF RP: Reactive Overwatch & Movement Intercept Engine
 * Monitors token movement paths, detects overwatch cone breaches,
 * and handles opportunity strike interrupts.
 */

import { AudioService } from './audioService';

/**
 * Checks whether moving a token from (fromX, fromY) to (toX, toY) triggers
 * reactions from any enemy tokens on the map.
 */
export function checkMovementReactions(movingToken, fromPos, toPos, potentialReactors = []) {
  const triggeredReactions = [];

  potentialReactors.forEach(reactor => {
    if (!reactor || reactor.id === movingToken.id || reactor.isDead || reactor.isDowned) return;
    if (reactor.team === movingToken.team) return; // Allies don't trigger reactions

    const reactorX = reactor.x || 0;
    const reactorY = reactor.y || 0;

    // 1. Check Melee Opportunity Strike (leaving adjacent range)
    const distFrom = Math.hypot(fromPos.x - reactorX, fromPos.y - reactorY);
    const distTo = Math.hypot(toPos.x - reactorX, toPos.y - reactorY);
    const wasInMeleeReach = distFrom <= 65; // ~1 hex
    const isExitingMeleeReach = distTo > 65;

    if (wasInMeleeReach && isExitingMeleeReach && (reactor.hasReaction !== false)) {
      triggeredReactions.push({
        id: `opp_strike_${reactor.id}_${Date.now()}`,
        type: 'opportunity_strike',
        reactorToken: reactor,
        intruderToken: movingToken,
        title: '⚔️ Melee Opportunity Strike Triggered!',
        description: `${reactor.label || 'Hostile'} takes an immediate reaction strike as ${movingToken.label || 'Operative'} retreats from engagement.`,
        suggestedDc: 12,
        actionCost: '1 Reaction'
      });
    }

    // 2. Check Overwatch Cones / Snapshot
    if (reactor.isOverwatch && (reactor.hasReaction !== false)) {
      const overwatchRange = reactor.overwatchRangePx || 350;
      const currentDist = Math.hypot(toPos.x - reactorX, toPos.y - reactorY);

      if (currentDist <= overwatchRange) {
        triggeredReactions.push({
          id: `overwatch_${reactor.id}_${Date.now()}`,
          type: 'overwatch_snapshot',
          reactorToken: reactor,
          intruderToken: movingToken,
          title: '🎯 Overwatch Intercept Triggered!',
          description: `${movingToken.label || 'Operative'} crossed the firing arc of ${reactor.label || 'Sentry'}!`,
          suggestedDc: 14,
          actionCost: '1 Reaction + Overwatch Discharge'
        });
      }
    }
  });

  if (triggeredReactions.length > 0) {
    AudioService.playTerminalBeep(1200, 0.08);
  }

  return triggeredReactions;
}

export default {
  checkMovementReactions
};
