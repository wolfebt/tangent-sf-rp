/**
 * Adversary Tactical Behavioral AI Service for Tangent SFF RP
 * Evaluates map topology, party vitals, and adversary competency roles to synthesize intelligent GM tactics.
 */

export const ADVERSARY_ROLES = {
  minion: {
    label: 'Minion (Swarm)',
    doctrine: 'Overwhelm through numerical superiority and flanking vectors.',
    generateTactic: (adversary, heroTokens, _mapContext) => {
      const target = findNearestOrWeakest(adversary, heroTokens);
      const tName = target?.label || target?.name || 'Closest Operative';
      return {
        action: 'Swarm & Flank',
        targetId: target?.id || null,
        targetName: tName,
        description: `Move adjacent to ${tName} to establish a flanking angle (+2 Attack bonus). If leader takes critical damage, make CR 12 Morale check.`,
        suggestedActionType: 'standard_strike',
        moveMode: 'advance_melee',
        appliedCondition: null,
        attackBonusDelta: 2
      };
    }
  },
  skirmisher: {
    label: 'Skirmisher (Hit-and-Run)',
    doctrine: 'Mobile ranged harassment utilizing cover and tactical withdrawal.',
    generateTactic: (adversary, heroTokens, _mapContext) => {
      const target = findNearestOrWeakest(adversary, heroTokens);
      const tName = target?.label || target?.name || 'Target Operative';
      return {
        action: 'Fire & Fade',
        targetId: target?.id || null,
        targetName: tName,
        description: `Fire a 3-round burst at ${tName}, then expend Move Action to retreat behind Half Cover (+2 Defense DC).`,
        suggestedActionType: 'burst_fire',
        moveMode: 'kite_range',
        appliedCondition: 'Cover',
        attackBonusDelta: 0
      };
    }
  },
  bruiser: {
    label: 'Bruiser (Vanguard Tank)',
    doctrine: 'Absorb incoming fire, close into melee, and pin high-damage threats.',
    generateTactic: (adversary, heroTokens, _mapContext) => {
      const highDamageHero = findStrongestHero(heroTokens) || heroTokens[0];
      const tName = highDamageHero?.label || highDamageHero?.name || 'High Threat Hero';
      return {
        action: 'Close & Pin',
        targetId: highDamageHero?.id || null,
        targetName: tName,
        description: `Charge directly toward ${tName} to lock them in melee engagement, forcing disadvantage on their ranged weaponry.`,
        suggestedActionType: 'melee_engage',
        moveMode: 'advance_melee',
        appliedCondition: null,
        attackBonusDelta: 2
      };
    }
  },
  sniper: {
    label: 'Sniper (Long-Range Precision)',
    doctrine: 'High ground elevation, aiming bonuses, and targeting low-DR targets.',
    generateTactic: (adversary, heroTokens, _mapContext) => {
      const lowDrHero = findLowestDrHero(heroTokens) || heroTokens[0];
      const tName = lowDrHero?.label || lowDrHero?.name || 'Exposed Operative';
      return {
        action: 'Aimed Headshot',
        targetId: lowDrHero?.id || null,
        targetName: tName,
        description: `Take Aim Action (+2 Attack), then target ${tName} on the Head location (1.5x Damage Multiplier).`,
        suggestedActionType: 'aimed_shot',
        moveMode: 'hold_position',
        appliedCondition: 'Aiming',
        calledShotLocation: 'head',
        attackBonusDelta: 2
      };
    }
  },
  boss: {
    label: 'Boss / Elite Commander',
    doctrine: 'Multi-phase tactical command, shield overcharges, and legendary reactions.',
    generateTactic: (adversary, heroTokens, _mapContext) => {
      const curHp = adversary.current_hp ?? adversary.current_health ?? adversary.health?.current ?? (adversary.hp?.current ?? 100);
      const maxHp = adversary.base_hp ?? adversary.base_health ?? adversary.health?.max ?? 100;
      const hpRatio = maxHp > 0 ? curHp / maxHp : 1;
      const primaryTarget = findStrongestHero(heroTokens) || heroTokens[0];
      const tName = primaryTarget?.label || primaryTarget?.name || 'Vanguard Operative';

      if (hpRatio <= 0.35) {
        return {
          phase: 'Phase 3: Enraged Desperation',
          action: 'Overcharge Meltdown Salvo',
          targetId: primaryTarget?.id || null,
          targetName: 'Entire Party (AoE)',
          description: `Health critical (<35%)! Boss enters Phase 3: Unleashes full-auto spinal barrage (AoE 10m burst, CR 16 Reflex save or take 3d10+6 damage).`,
          suggestedActionType: 'aoe_barrage',
          moveMode: 'hold_position',
          appliedCondition: 'Overwatch',
          attackBonusDelta: 4
        };
      } else if (hpRatio <= 0.65) {
        return {
          phase: 'Phase 2: Reinforcement & Barrier',
          action: 'Deploy Kinetic Wards & Summon Minions',
          targetId: primaryTarget?.id || null,
          targetName: 'Defensive Perimeter',
          description: `Health under 65%! Boss triggers Phase 2: Restores +20 Shield SP and summons a drop-pod of 2 Skirmisher escorts.`,
          suggestedActionType: 'shield_recharge',
          moveMode: 'kite_range',
          appliedCondition: 'Cover',
          healAmount: 10,
          attackBonusDelta: 2
        };
      } else {
        return {
          phase: 'Phase 1: Tactical Command',
          action: 'Coordinated Squad Focus Fire',
          targetId: primaryTarget?.id || null,
          targetName: tName,
          description: `Boss designates priority target: All allied minions gain +2 Attack when attacking the marked hero this round.`,
          suggestedActionType: 'command_mark',
          moveMode: 'advance_melee',
          appliedCondition: 'Aiming',
          attackBonusDelta: 2
        };
      }
    }
  }
};

// Helper Heuristics
function getTokenHp(t) {
  return t?.current_hp ?? t?.current_health ?? t?.health?.current ?? t?.hp?.current ?? t?.base_hp ?? 30;
}

function getTokenDr(t) {
  return t?.armor_dr ?? t?.dr ?? t?.armor ?? 0;
}

function findNearestOrWeakest(adversary, heroTokens) {
  if (!heroTokens || heroTokens.length === 0) return null;
  // Sort by lowest health first, breaking ties by Euclidean proximity
  const advX = adversary?.x ?? 0;
  const advY = adversary?.y ?? 0;
  const sorted = [...heroTokens].sort((a, b) => {
    const hpDiff = getTokenHp(a) - getTokenHp(b);
    if (hpDiff !== 0) return hpDiff;
    const distA = Math.hypot((a.x ?? 0) - advX, (a.y ?? 0) - advY);
    const distB = Math.hypot((b.x ?? 0) - advX, (b.y ?? 0) - advY);
    return distA - distB;
  });
  return sorted[0];
}

function findStrongestHero(heroTokens) {
  if (!heroTokens || heroTokens.length === 0) return null;
  const sorted = [...heroTokens].sort((a, b) => getTokenHp(b) - getTokenHp(a));
  return sorted[0];
}

function findLowestDrHero(heroTokens) {
  if (!heroTokens || heroTokens.length === 0) return null;
  const sorted = [...heroTokens].sort((a, b) => getTokenDr(a) - getTokenDr(b));
  return sorted[0];
}

export function synthesizeAdversaryTactic(adversaryToken, heroTokens = [], mapContext = {}) {
  if (!adversaryToken) return null;

  // Infer competency role from label / name / archetype / stats
  const label = `${adversaryToken.label || ''} ${adversaryToken.name || ''} ${adversaryToken.archetype || ''}`.toLowerCase();
  const maxHp = adversaryToken.base_hp ?? adversaryToken.base_health ?? adversaryToken.health?.max ?? 30;
  let roleKey = 'skirmisher';

  if (label.includes('boss') || label.includes('commander') || label.includes('captain') || maxHp >= 80) {
    roleKey = 'boss';
  } else if (label.includes('sniper') || label.includes('marksman') || label.includes('scout')) {
    roleKey = 'sniper';
  } else if (label.includes('bruiser') || label.includes('brute') || label.includes('tank') || label.includes('heavy') || label.includes('goliath') || label.includes('strider')) {
    roleKey = 'bruiser';
  } else if (label.includes('minion') || label.includes('drone') || label.includes('grunt') || label.includes('swarmer') || label.includes('sentry')) {
    roleKey = 'minion';
  }

  const roleEngine = ADVERSARY_ROLES[roleKey] || ADVERSARY_ROLES.skirmisher;
  const tactic = roleEngine.generateTactic(adversaryToken, heroTokens, mapContext);

  return {
    roleKey,
    roleLabel: roleEngine.label,
    doctrine: roleEngine.doctrine,
    ...tactic
  };
}
