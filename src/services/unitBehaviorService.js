/**
 * TANGENT SFF RP: Autonomous Unit Behavioral State Engine (FSM)
 * Evaluates tactical positions, threat priorities, squad roles, and morale thresholds
 * to execute autonomous adversary decisions during live VTT combat encounters.
 */

export const BEHAVIOR_PROFILES = {
  aggressive: {
    id: 'aggressive',
    name: 'Aggressive / Swarm',
    icon: '⚡',
    description: 'Relentlessly pushes into effective range, prioritizes weakest or isolated targets, and ignores light cover.',
    moraleThreshold: 0.15, // Retreats only under 15% HP
    evaluateTarget: (adversary, heroes) => {
      return heroes.slice().sort((a, b) => {
        const hpPctA = (a.health?.current ?? a.hp?.current ?? 20) / (a.health?.max ?? a.hp?.max ?? 20);
        const hpPctB = (b.health?.current ?? b.hp?.current ?? 20) / (b.health?.max ?? b.hp?.max ?? 20);
        const distA = Math.hypot((a.x || 0) - (adversary.x || 0), (a.y || 0) - (adversary.y || 0));
        const distB = Math.hypot((b.x || 0) - (adversary.x || 0), (b.y || 0) - (adversary.y || 0));
        return (hpPctA * 100 + distA * 0.1) - (hpPctB * 100 + distB * 0.1);
      })[0] || null;
    }
  },
  tactical: {
    id: 'tactical',
    name: 'Tactical / Commando',
    icon: '🎯',
    description: 'Utilizes cover (+2/+4 DC), suppresses high-damage heroes, and coordinates focus-fire with squad allies.',
    moraleThreshold: 0.30,
    evaluateTarget: (adversary, heroes) => {
      return heroes.slice().sort((a, b) => {
        const coverA = a.inCover ? 2 : 0;
        const coverB = b.inCover ? 2 : 0;
        const distA = Math.hypot((a.x || 0) - (adversary.x || 0), (a.y || 0) - (adversary.y || 0));
        const distB = Math.hypot((b.x || 0) - (adversary.x || 0), (b.y || 0) - (adversary.y || 0));
        return (coverA + distA * 0.05) - (coverB + distB * 0.05);
      })[0] || null;
    }
  },
  guardian: {
    id: 'guardian',
    name: 'Guardian / Protector',
    icon: '🛡️',
    description: 'Stays tethered to a VIP or squad commander, intercepts incoming chargers, and deploys shields/buffs.',
    moraleThreshold: 0.20,
    evaluateTarget: (adversary, heroes, allies) => {
      const vip = allies?.find(a => a.isVip || a.role === 'boss') || adversary;
      return heroes.slice().sort((a, b) => {
        const distA = Math.hypot((a.x || 0) - (vip.x || 0), (a.y || 0) - (vip.y || 0));
        const distB = Math.hypot((b.x || 0) - (vip.x || 0), (b.y || 0) - (vip.y || 0));
        return distA - distB;
      })[0] || null;
    }
  },
  survivalist: {
    id: 'survivalist',
    name: 'Survivalist / Skirmisher',
    icon: '🏃',
    description: 'Maintains maximum weapon range, attacks with fire-and-fade, and flees or surrenders if outmatched.',
    moraleThreshold: 0.40,
    evaluateTarget: (adversary, heroes) => {
      return heroes.slice().sort((a, b) => {
        const distA = Math.hypot((a.x || 0) - (adversary.x || 0), (a.y || 0) - (adversary.y || 0));
        const distB = Math.hypot((b.x || 0) - (adversary.x || 0), (b.y || 0) - (adversary.y || 0));
        return distA - distB;
      })[0] || null;
    }
  },
  sniper: {
    id: 'sniper',
    name: 'Sniper / Precision',
    icon: '🔭',
    description: 'Takes high vantage point, takes Aim actions (+2), and targets unarmored head/vital hit locations.',
    moraleThreshold: 0.25,
    evaluateTarget: (adversary, heroes) => {
      return heroes.slice().sort((a, b) => {
        const drA = a.armorDr || 0;
        const drB = b.armorDr || 0;
        return drA - drB;
      })[0] || null;
    }
  },
  bruiser: {
    id: 'bruiser',
    name: 'Bruiser / Heavy Vanguard',
    icon: '🔨',
    description: 'Charges front-line heroes to tie them in melee and forces disadvantage on ranged weaponry.',
    moraleThreshold: 0.10,
    evaluateTarget: (adversary, heroes) => {
      return heroes.slice().sort((a, b) => {
        const distA = Math.hypot((a.x || 0) - (adversary.x || 0), (a.y || 0) - (adversary.y || 0));
        const distB = Math.hypot((b.x || 0) - (adversary.x || 0), (b.y || 0) - (adversary.y || 0));
        return distA - distB;
      })[0] || null;
    }
  },
  boss: {
    id: 'boss',
    name: 'Boss / Sector Commander',
    icon: '👑',
    description: 'Command aura, multi-phase mechanics, periodic AoE barrages, and emergency shield pulses.',
    moraleThreshold: 0.0,
    evaluateTarget: (adversary, heroes) => {
      return heroes.slice().sort((a, b) => {
        const hpA = a.health?.current ?? a.hp?.current ?? 20;
        const hpB = b.health?.current ?? b.hp?.current ?? 20;
        return hpA - hpB;
      })[0] || null;
    }
  }
};

/**
 * Evaluates and plans an autonomous turn for an adversary unit.
 */
export function decideAutonomousAction(adversaryToken, heroTokens = [], mapContext = {}) {
  if (!adversaryToken || !heroTokens || heroTokens.length === 0) {
    return {
      status: 'idle',
      actionType: 'wait',
      flavorText: 'No target operatives identified in tactical sector.'
    };
  }

  const roleKey = adversaryToken.behaviorProfile || adversaryToken.role || 'tactical';
  const profile = BEHAVIOR_PROFILES[roleKey] || BEHAVIOR_PROFILES.tactical;

  const currentHp = adversaryToken.health?.current ?? adversaryToken.hp?.current ?? 20;
  const maxHp = adversaryToken.health?.max ?? adversaryToken.hp?.max ?? 20;
  const hpRatio = maxHp > 0 ? (currentHp / maxHp) : 1;

  // Morale Check (Retreat / Surrender)
  if (hpRatio <= profile.moraleThreshold && profile.id !== 'boss') {
    return {
      status: 'morale_broken',
      actionType: 'retreat_or_surrender',
      isRetreating: true,
      flavorText: `${adversaryToken.label || 'Adversary'} morale broken (HP: ${currentHp}/${maxHp})! Disengaging or yielding!`,
      tacticalMove: {
        type: 'retreat',
        direction: 'away_from_party'
      }
    };
  }

  // Select target based on profile
  const target = profile.evaluateTarget(adversaryToken, heroTokens, mapContext.allies || []);
  if (!target) {
    return {
      status: 'no_target',
      actionType: 'patrol',
      flavorText: `${adversaryToken.label || 'Unit'} patrolling defensive sector.`
    };
  }

  const distPx = Math.hypot((target.x || 0) - (adversaryToken.x || 0), (target.y || 0) - (adversaryToken.y || 0));
  const isMeleeRange = distPx <= 65;

  let actionType = 'standard_attack';
  let weaponName = adversaryToken.weapon || 'Plasma Carbine';
  let isBurst = false;
  let aimBonus = 0;
  let hitLocation = 'torso';
  let isAoE = false;
  let aoePresetId = null;

  if (profile.id === 'sniper') {
    aimBonus = 2;
    hitLocation = 'head';
    weaponName = adversaryToken.weapon || 'Precision Needle Rifle';
    actionType = 'aimed_sniper_shot';
  } else if (profile.id === 'aggressive' || profile.id === 'bruiser') {
    if (isMeleeRange) {
      actionType = 'melee_strike';
      weaponName = adversaryToken.meleeWeapon || 'Vibro-Blade';
    } else {
      actionType = 'rush_and_fire';
      isBurst = true;
    }
  } else if (profile.id === 'boss') {
    if (hpRatio <= 0.35) {
      actionType = 'aoe_meltdown';
      isAoE = true;
      aoePresetId = 'plasma_grenade';
    } else {
      actionType = 'command_burst';
      isBurst = true;
    }
  } else if (profile.id === 'tactical') {
    if (distPx > 150) {
      isBurst = true;
      actionType = 'suppressive_burst';
    } else {
      actionType = 'standard_fire';
    }
  }

  return {
    status: 'action_ready',
    profileId: profile.id,
    profileName: profile.name,
    targetId: target.id || target.tokenId,
    targetName: target.label || target.name || 'Operative',
    targetDistancePx: Math.round(distPx),
    actionType,
    weaponName,
    aimBonus,
    isBurst,
    isAoE,
    aoePresetId,
    hitLocation,
    flavorText: `[${profile.name}] ${adversaryToken.label || 'Unit'} executes ${actionType.replace(/_/g, ' ').toUpperCase()} targeting ${target.label || 'Operative'}.`
  };
}

export default {
  BEHAVIOR_PROFILES,
  decideAutonomousAction
};
