/**
 * Adversary Tactical Behavioral AI Service for Tangent SFF RP
 * Evaluates map topology, party vitals, and adversary competency roles to synthesize intelligent GM tactics.
 */

export const ADVERSARY_ROLES = {
  minion: {
    label: 'Minion (Swarm)',
    doctrine: 'Overwhelm through numerical superiority and flanking vectors.',
    generateTactic: (adversary, heroTokens, mapContext) => {
      const target = findNearestOrWeakest(adversary, heroTokens);
      return {
        action: 'Swarm & Flank',
        targetName: target?.label || 'Closest Operative',
        description: `Move adjacent to ${target?.label || 'nearest hero'} to establish a flanking angle (+2 Attack bonus). If leader takes critical damage, make DC 12 Morale check.`,
        suggestedActionType: 'standard_strike'
      };
    }
  },
  skirmisher: {
    label: 'Skirmisher (Hit-and-Run)',
    doctrine: 'Mobile ranged harassment utilizing cover and tactical withdrawal.',
    generateTactic: (adversary, heroTokens, mapContext) => {
      const target = findNearestOrWeakest(adversary, heroTokens);
      return {
        action: 'Fire & Fade',
        targetName: target?.label || 'Target Operative',
        description: `Fire a 3-round burst at ${target?.label || 'operative'}, then expend Move Action to retreat behind Half Cover (+2 Defense DC).`,
        suggestedActionType: 'burst_fire'
      };
    }
  },
  bruiser: {
    label: 'Bruiser (Vanguard Tank)',
    doctrine: 'Absorb incoming fire, close into melee, and pin high-damage threats.',
    generateTactic: (adversary, heroTokens, mapContext) => {
      const highDamageHero = findStrongestHero(heroTokens) || heroTokens[0];
      return {
        action: 'Close & Pin',
        targetName: highDamageHero?.label || 'High Threat Hero',
        description: `Charge directly toward ${highDamageHero?.label || 'operative'} to lock them in melee engagement, forcing disadvantage on their ranged weaponry.`,
        suggestedActionType: 'melee_engage'
      };
    }
  },
  sniper: {
    label: 'Sniper (Long-Range Precision)',
    doctrine: 'High ground elevation, aiming bonuses, and targeting low-DR targets.',
    generateTactic: (adversary, heroTokens, mapContext) => {
      const lowDrHero = findLowestDrHero(heroTokens) || heroTokens[0];
      return {
        action: 'Aimed Headshot',
        targetName: lowDrHero?.label || 'Exposed Operative',
        description: `Take Aim Action (+2 Attack), then target ${lowDrHero?.label || 'operative'} on the Head location (1.5x Damage Multiplier).`,
        suggestedActionType: 'aimed_shot'
      };
    }
  },
  boss: {
    label: 'Boss / Elite Commander',
    doctrine: 'Multi-phase tactical command, shield overcharges, and legendary reactions.',
    generateTactic: (adversary, heroTokens, mapContext) => {
      const curHp = adversary.health?.current ?? (adversary.hp?.current ?? 100);
      const maxHp = adversary.health?.max || 100;
      const hpRatio = curHp / maxHp;

      if (hpRatio <= 0.35) {
        return {
          phase: 'Phase 3: Enraged Desperation',
          action: 'Overcharge Meltdown Salvo',
          targetName: 'Entire Party (AoE)',
          description: `Health critical (<35%)! Boss enters Phase 3: Unleashes full-auto spinal barrage (AoE 10m burst, DC 16 Reflex save or take 3d10+6 damage).`,
          suggestedActionType: 'aoe_barrage'
        };
      } else if (hpRatio <= 0.65) {
        return {
          phase: 'Phase 2: Reinforcement & Barrier',
          action: 'Deploy Kinetic Wards & Summon Minions',
          targetName: 'Defensive Perimeter',
          description: `Health under 65%! Boss triggers Phase 2: Restores +20 Shield SP and summons a drop-pod of 2 Skirmisher escorts.`,
          suggestedActionType: 'shield_recharge'
        };
      } else {
        return {
          phase: 'Phase 1: Tactical Command',
          action: 'Coordinated Squad Focus Fire',
          targetName: 'Vanguard Operative',
          description: `Boss designates priority target: All allied minions gain +2 Attack when attacking the marked hero this round.`,
          suggestedActionType: 'command_mark'
        };
      }
    }
  }
};

// Helper Heuristics
function findNearestOrWeakest(adversary, heroTokens) {
  if (!heroTokens || heroTokens.length === 0) return null;
  // Sort by lowest health first
  const sorted = [...heroTokens].sort((a, b) => {
    const aHp = a.health?.current ?? (a.hp?.current ?? 30);
    const bHp = b.health?.current ?? (b.hp?.current ?? 30);
    return aHp - bHp;
  });
  return sorted[0];
}

function findStrongestHero(heroTokens) {
  if (!heroTokens || heroTokens.length === 0) return null;
  return heroTokens[0];
}

function findLowestDrHero(heroTokens) {
  if (!heroTokens || heroTokens.length === 0) return null;
  const sorted = [...heroTokens].sort((a, b) => (a.dr || a.armor || 0) - (b.dr || b.armor || 0));
  return sorted[0];
}

export function synthesizeAdversaryTactic(adversaryToken, heroTokens = [], mapContext = {}) {
  if (!adversaryToken) return null;

  // Infer competency role from label / stats
  const label = (adversaryToken.label || '').toLowerCase();
  let roleKey = 'skirmisher';

  if (label.includes('boss') || label.includes('commander') || label.includes('captain') || (adversaryToken.health?.max || 30) >= 80) {
    roleKey = 'boss';
  } else if (label.includes('sniper') || label.includes('marksman') || label.includes('scout')) {
    roleKey = 'sniper';
  } else if (label.includes('bruiser') || label.includes('brute') || label.includes('tank') || label.includes('heavy')) {
    roleKey = 'bruiser';
  } else if (label.includes('minion') || label.includes('drone') || label.includes('grunt') || label.includes('swarmer')) {
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
