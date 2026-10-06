/**
 * TANGENT SFF RP: Scenario Objectives, Wave Incursions & Automated Progression Engine
 * Tracks mission objectives, automates dynamic reinforcement drops, and calculates
 * victory evaluations and party AP / Karma disbursements.
 */

import { AudioService } from './audioService.js';

export const OBJECTIVE_TEMPLATES = [
  {
    id: 'extraction',
    title: 'Extraction & Tactical Evac',
    icon: '🚁',
    type: 'extraction',
    description: 'Move all surviving operatives to the designated extraction landing zone (LZ).',
    rewardAP: 2,
    rewardKarma: 1
  },
  {
    id: 'commander_assassination',
    title: 'Neutralize Sector Commander',
    icon: '🎯',
    type: 'assassination',
    description: 'Eliminate or incapacitate the hostile sector commander token.',
    rewardAP: 3,
    rewardKarma: 2
  },
  {
    id: 'terminal_data_heist',
    title: 'Infiltrate & Download Black-Box Data',
    icon: '💾',
    type: 'data_slice',
    description: 'Successfully slice the facility security terminal and extract with the encrypted drive.',
    rewardAP: 2,
    rewardKarma: 1
  },
  {
    id: 'holdout_defense',
    title: 'Defend Reactor Core for 5 Rounds',
    icon: '🛡️',
    type: 'holdout',
    roundsRequired: 5,
    description: 'Prevent the central reactor core from taking lethal structural breach damage over 5 rounds.',
    rewardAP: 3,
    rewardKarma: 2
  },
  {
    id: 'zone_control',
    title: 'Secure & Hold Command Hub',
    icon: '📡',
    type: 'zone_control',
    roundsRequired: 3,
    description: 'Maintain exclusive operative presence inside the target perimeter for 3 rounds.',
    rewardAP: 3,
    rewardKarma: 2
  },
  {
    id: 'countdown_timer',
    title: 'Emergency Life-Support Clock',
    icon: '⏱️',
    type: 'countdown_timer',
    maxRounds: 6,
    description: 'Fulfill primary escape criteria before atmospheric life support fully depletes.',
    rewardAP: 2,
    rewardKarma: 2
  },
  {
    id: 'item_delivery',
    title: 'Singularity Core Transport',
    icon: '📦',
    type: 'item_delivery',
    description: 'Safely transport the volatile power container to the auxiliary stabilization chamber.',
    rewardAP: 3,
    rewardKarma: 1
  }
];

/**
 * Evaluates current scenario progress against all active objectives.
 */
export function evaluateScenarioProgress(activeObjectives = [], currentTokens = [], currentRound = 1, mapContext = {}) {
  const evaluations = activeObjectives.map(obj => {
    let isComplete = false;
    let isFailed = false;
    let progressText = 'In progress';

    if (obj.type === 'assassination') {
      const targetToken = currentTokens.find(t => t.id === obj.targetTokenId || t.role === 'boss');
      const isDead = !targetToken || targetToken.isDead || (targetToken.health?.current ?? targetToken.hp?.current ?? targetToken.current_hp ?? 0) <= 0;
      isComplete = isDead;
      progressText = isDead ? 'Target Neutralized' : `Target Active (${targetToken?.health?.current ?? targetToken?.current_hp ?? 20} HP)`;
    } else if (obj.type === 'holdout') {
      isComplete = currentRound >= (obj.roundsRequired || 5);
      progressText = isComplete ? 'Holdout Completed' : `Round ${currentRound}/${obj.roundsRequired || 5}`;
    } else if (obj.type === 'extraction') {
      const heroes = currentTokens.filter(t => Boolean(t.linkedHeroId || t.is_persona) && !t.isDead && (t.health?.current ?? t.current_hp ?? 1) > 0);
      const inZone = heroes.filter(h => {
        const dist = Math.hypot((h.x || 0) - (mapContext.lzX || 500), (h.y || 0) - (mapContext.lzY || 500));
        return dist <= (mapContext.lzRadius || 140);
      });
      isComplete = heroes.length > 0 && inZone.length === heroes.length;
      progressText = `${inZone.length}/${heroes.length} Operatives at LZ`;
    } else if (obj.type === 'zone_control') {
      const targetZoneX = obj.zoneX || mapContext.zoneX || 600;
      const targetZoneY = obj.zoneY || mapContext.zoneY || 600;
      const targetRadius = obj.zoneRadius || mapContext.zoneRadius || 150;
      const reqRounds = obj.roundsRequired || 3;

      const operativesInZone = currentTokens.filter(t => 
        Boolean(t.linkedHeroId || t.is_persona) && 
        !t.isDead && 
        Math.hypot((t.x || 0) - targetZoneX, (t.y || 0) - targetZoneY) <= targetRadius
      );
      const roundsSecured = obj.currentRoundsSecured ?? (operativesInZone.length > 0 ? Math.min(currentRound, reqRounds) : 0);
      isComplete = roundsSecured >= reqRounds;
      progressText = isComplete ? 'Zone Fortified' : `Zone Held (${roundsSecured}/${reqRounds} Rounds)`;
    } else if (obj.type === 'countdown_timer') {
      const maxRounds = obj.maxRounds || 6;
      if (currentRound > maxRounds) {
        isFailed = true;
        progressText = `Timer Expired (Round ${currentRound}/${maxRounds})`;
      } else {
        isComplete = Boolean(obj.prerequisitesMet);
        progressText = isComplete ? 'Evacuated in Time' : `Rounds Remaining: ${Math.max(0, maxRounds - currentRound + 1)}`;
      }
    } else if (obj.type === 'item_delivery') {
      const dropX = obj.dropX || mapContext.dropX || 800;
      const dropY = obj.dropY || mapContext.dropY || 600;
      const dropRadius = obj.dropRadius || 120;
      const payloadToken = currentTokens.find(t => t.id === obj.payloadTokenId || t.type === 'item_carrier' || t.name?.includes('Core') || t.name?.includes('Transport'));

      if (payloadToken) {
        const dist = Math.hypot((payloadToken.x || 0) - dropX, (payloadToken.y || 0) - dropY);
        isComplete = dist <= dropRadius;
        progressText = isComplete ? 'Payload Delivered' : `In Transit (${Math.round(dist)}px from Drop)`;
      } else {
        isComplete = Boolean(obj.isDelivered);
        progressText = isComplete ? 'Payload Delivered' : 'Item in Carrier Transit';
      }
    } else if (obj.type === 'data_slice') {
      isComplete = Boolean(obj.isSliced || mapContext.isDataExtracted || mapContext.alarmRaised);
      progressText = isComplete ? 'Data Decrypted & Extracted' : 'Mainframe Terminal Unbreached';
    }

    return {
      ...obj,
      isComplete,
      isFailed,
      progressText
    };
  });

  const allPrimaryComplete = evaluations.length > 0 && evaluations.every(e => e.isComplete);
  const anyFailed = evaluations.some(e => e.isFailed);
  const totalApReward = evaluations.filter(e => e.isComplete).reduce((acc, e) => acc + (e.rewardAP || 1), 0);
  const totalKarmaReward = evaluations.filter(e => e.isComplete).reduce((acc, e) => acc + (e.rewardKarma || 1), 0);

  if (allPrimaryComplete) {
    try {
      AudioService.playTerminalBeep(1350, 0.25);
    } catch {
      // Audio fallback in non-browser envs
    }
  }

  return {
    evaluations,
    allPrimaryComplete,
    anyFailed,
    totalApReward,
    totalKarmaReward,
    summaryText: anyFailed
      ? `❌ MISSION COMPROMISED: Critical countdown or objective failed.`
      : allPrimaryComplete 
      ? `🏆 MISSION SUCCESS! All objectives accomplished. Awards: +${totalApReward} AP, +${totalKarmaReward} Karma.`
      : `📋 Mission in progress (${evaluations.filter(e => e.isComplete).length}/${evaluations.length} complete).`
  };
}

/**
 * Generates reinforcement wave tokens for automated dropship incursions.
 */
export function spawnReinforcementWave(waveIndex = 1, spawnOrigin = { x: 100, y: 100 }, count = 3) {
  const units = [];
  const roles = ['aggressive', 'tactical', 'bruiser', 'skirmisher'];

  for (let i = 0; i < count; i++) {
    const role = roles[i % roles.length];
    const offsetAngle = (i * (Math.PI * 2)) / count;
    const spawnX = Math.round((spawnOrigin.x || 100) + Math.cos(offsetAngle) * 45);
    const spawnY = Math.round((spawnOrigin.y || 100) + Math.sin(offsetAngle) * 45);

    units.push({
      id: `reinforcement_w${waveIndex}_${i + 1}_${Date.now()}`,
      label: `Shock Incursor #${i + 1} (W${waveIndex})`,
      behaviorProfile: role,
      role,
      x: spawnX,
      y: spawnY,
      hp: { current: 18, max: 18 },
      health: { current: 18, max: 18 },
      current_hp: 18,
      max_hp: 18,
      defense: 12,
      armorDr: 2,
      toughness: 1,
      attackBonus: 4,
      weaponDamage: 12,
      weapon: 'Plasma Carbine',
      color: '#ef4444'
    });
  }

  try {
    AudioService.playTerminalBeep(920, 0.15);
  } catch {
    // headless test fallback
  }

  return units;
}

export function triggerWaveIncursion(waveTier = 'skirmish', options = {}) {
  const count = waveTier === 'heavy' ? 3 : 2;
  const origin = { x: options.spawnX || 300, y: options.spawnY || 300 };
  return spawnReinforcementWave(1, origin, count);
}

export default {
  OBJECTIVE_TEMPLATES,
  evaluateScenarioProgress,
  spawnReinforcementWave,
  triggerWaveIncursion
};
