/**
 * TANGENT SFF RP: Scenario Objectives, Wave Incursions & Automated Progression Engine
 * Tracks mission objectives, automates dynamic reinforcement drops, and calculates
 * victory evaluations and party AP / Karma disbursements.
 */

import { AudioService } from './audioService';

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
  }
];

/**
 * Evaluates current scenario progress against all active objectives.
 */
export function evaluateScenarioProgress(activeObjectives = [], currentTokens = [], currentRound = 1, mapContext = {}) {
  const evaluations = activeObjectives.map(obj => {
    let isComplete = false;
    let progressText = 'In progress';

    if (obj.type === 'assassination') {
      const targetToken = currentTokens.find(t => t.id === obj.targetTokenId || t.role === 'boss');
      const isDead = !targetToken || targetToken.isDead || (targetToken.health?.current ?? targetToken.hp?.current ?? 0) <= 0;
      isComplete = isDead;
      progressText = isDead ? 'Target Neutralized' : `Target Active (${targetToken?.health?.current ?? 20} HP)`;
    } else if (obj.type === 'holdout') {
      isComplete = currentRound >= (obj.roundsRequired || 5);
      progressText = isComplete ? 'Holdout Completed' : `Round ${currentRound}/${obj.roundsRequired || 5}`;
    } else if (obj.type === 'extraction') {
      const heroes = currentTokens.filter(t => Boolean(t.linkedHeroId) && !t.isDead);
      const inZone = heroes.filter(h => {
        const dist = Math.hypot((h.x || 0) - (mapContext.lzX || 500), (h.y || 0) - (mapContext.lzY || 500));
        return dist <= (mapContext.lzRadius || 120);
      });
      isComplete = heroes.length > 0 && inZone.length === heroes.length;
      progressText = `${inZone.length}/${heroes.length} Operatives at LZ`;
    }

    return {
      ...obj,
      isComplete,
      progressText
    };
  });

  const allPrimaryComplete = evaluations.length > 0 && evaluations.every(e => e.isComplete);
  const totalApReward = evaluations.filter(e => e.isComplete).reduce((acc, e) => acc + (e.rewardAP || 1), 0);
  const totalKarmaReward = evaluations.filter(e => e.isComplete).reduce((acc, e) => acc + (e.rewardKarma || 1), 0);

  if (allPrimaryComplete) {
    AudioService.playTerminalBeep(1350, 0.25);
  }

  return {
    evaluations,
    allPrimaryComplete,
    totalApReward,
    totalKarmaReward,
    summaryText: allPrimaryComplete 
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
      defense: 12,
      armorDr: 2,
      toughness: 1,
      attackBonus: 4,
      weaponDamage: 12,
      weapon: 'Plasma Carbine',
      color: '#ef4444'
    });
  }

  AudioService.playTerminalBeep(920, 0.15);

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
