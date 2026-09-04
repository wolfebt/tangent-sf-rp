/**
 * @file reactiveVttService.js
 * @description TANGENT SFF RP: Reactive Map Units & Scripted Automation Engine.
 * Manages spatial reactive triggers (pressure plates, proximity mines, laser tripwires, poison vents),
 * automated character saving throws (Reflex / Fortitude / Tech), and scripted NPC routines
 * (waypoint patrols, sentry vision cones, ambush uncloaking, and tactical radio barks).
 */

import { AudioService } from './audioService';

export const TRAP_TYPES = {
  proximity_plasma_mine: {
    id: 'proximity_plasma_mine',
    name: 'Volatile Plasma Proximity Mine',
    icon: '💥',
    category: 'hazard',
    triggerType: 'proximity',
    triggerRadiusPx: 80, // ~2.5m
    saveType: 'Reflex (AGI)',
    saveDc: 14,
    damageDice: '2d10+4',
    baseDamage: 15,
    damageType: 'lethal',
    appliedCondition: 'Burning',
    disarmDc: 13,
    detectionDc: 14,
    description: 'Concealed magnetic mine with proximity sensor. Triggers within 2.5m, detonating for lethal plasma blast and Burning condition.'
  },
  laser_tripwire: {
    id: 'laser_tripwire',
    name: 'High-Energy Laser Tripwire',
    icon: '⚡',
    category: 'barrier',
    triggerType: 'step_on',
    triggerRadiusPx: 45,
    saveType: 'Reflex (AGI)',
    saveDc: 15,
    damageDice: '2d10',
    baseDamage: 12,
    damageType: 'energy',
    appliedCondition: 'Stunned',
    disarmDc: 14,
    detectionDc: 15,
    description: 'Infrared trip-beam across corridor or door threshold. Slices legs on crossing, inflicting electric stun shock.'
  },
  neurotoxin_vent: {
    id: 'neurotoxin_vent',
    name: 'Pressurized Neurotoxin Vent',
    icon: '🧪',
    category: 'hazard',
    triggerType: 'proximity',
    triggerRadiusPx: 100,
    saveType: 'Fortitude (STA)',
    saveDc: 13,
    damageDice: '1d10+6',
    baseDamage: 10,
    damageType: 'chemical',
    appliedCondition: 'Poisoned',
    disarmDc: 12,
    detectionDc: 13,
    description: 'Floor grille release valve. Emits pressurized corrosive nerve gas cloud imposing Poisoned debuff.'
  },
  cryo_stasis_field: {
    id: 'cryo_stasis_field',
    name: 'Cryo-Dampening Pressure Plate',
    icon: '❄️',
    category: 'utility',
    triggerType: 'step_on',
    triggerRadiusPx: 40,
    saveType: 'Reflex (AGI)',
    saveDc: 14,
    damageDice: '1d10+2',
    baseDamage: 8,
    damageType: 'non_lethal',
    appliedCondition: 'Slowed',
    disarmDc: 12,
    detectionDc: 12,
    description: 'Heavy floor pressure plate. Discharges coolant liquid freezing the surrounding sector into sub-zero ice.'
  },
  sentry_alarm_node: {
    id: 'sentry_alarm_node',
    name: 'Automated Klaxon Siren Sensor',
    icon: '🚨',
    category: 'alarm',
    triggerType: 'proximity',
    triggerRadiusPx: 120,
    saveType: 'Tech / Slicing',
    saveDc: 15,
    damageDice: '0',
    baseDamage: 0,
    damageType: 'utility',
    appliedCondition: null,
    disarmDc: 14,
    detectionDc: 13,
    description: 'Acoustic motion detector. Does not inflict damage, but broadcasts high-decibel alarm that alerts all garrison units.'
  }
};

export const NPC_SCRIPT_TYPES = {
  patrol: {
    id: 'patrol',
    name: 'Waypoint Patrol Loop',
    icon: '🚶',
    description: 'Advances sequentially along assigned coordinate waypoints. Loops or reverses upon reaching terminus.'
  },
  sentry: {
    id: 'sentry',
    name: 'Stationary Sentry Cone',
    icon: '👁️',
    description: 'Guards an assigned post facing a direction. Sounds general alarm if a hero breaches vision angle and distance.'
  },
  ambush: {
    id: 'ambush',
    name: 'Stealth Ambush Stalker',
    icon: '🥷',
    description: 'Remains cloaked until an operative comes within 3 meters, then decloaks with surprise attack initiative.'
  },
  dialogue_bark: {
    id: 'dialogue_bark',
    name: 'Interactive Story Speaker',
    icon: '💬',
    description: 'Pops up narrative transmission dialogue and clues when players approach within interaction range.'
  },
  flee_to_safety: {
    id: 'flee_to_safety',
    name: 'Emergency Retreat Runner',
    icon: '🏃',
    description: 'Disengages from combat and sprints towards nearest exit waypoint when HP drops under morale threshold.'
  }
};

/**
 * Calculates Euclidean distance between two 2D points.
 */
export function calculateDistance(p1, p2) {
  const x1 = p1.x ?? 0;
  const y1 = p1.y ?? 0;
  const x2 = p2.x ?? 0;
  const y2 = p2.y ?? 0;
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Checks whether an operative token has triggered any reactive map traps or hazards.
 *
 * @param {Object} movedToken - The token that moved.
 * @param {Array} objectsOnMap - Array of map objects (traps, hazards, nodes).
 * @param {Array} allTokens - All tokens currently on the map.
 * @param {Object} options - Custom evaluation options (gridSize, disableAutoTrigger).
 * @returns {Array} Array of triggered events with resolution data.
 */
export function evaluateTrapTriggers(movedToken, objectsOnMap = [], allTokens = [], options = {}) {
  if (!movedToken || movedToken.type === 'link') return [];

  const results = [];
  const tokenX = movedToken.x || 0;
  const tokenY = movedToken.y || 0;

  // Scan interactive objects marked as traps or reactive hazards
  objectsOnMap.forEach(obj => {
    // Only check armed traps or reactive hazards
    const isTrap = obj.isTrap || obj.type === 'hazard' || obj.category === 'hazard' || !!TRAP_TYPES[obj.trapType || obj.type];
    if (!isTrap) return;

    // Skip disarmed or already triggered one-shot traps
    if (obj.trapState === 'disarmed') return;
    if (obj.trapState === 'triggered' && !obj.isRepeating) return;

    const trapConfig = TRAP_TYPES[obj.trapType || obj.type] || TRAP_TYPES.proximity_plasma_mine;
    const triggerRadius = obj.triggerRadius || trapConfig.triggerRadiusPx || 60;
    const objX = (obj.x || 0) + (obj.width ? obj.width / 2 : 0);
    const objY = (obj.y || 0) + (obj.height ? obj.height / 2 : 0);

    const dist = calculateDistance({ x: tokenX, y: tokenY }, { x: objX, y: objY });

    if (dist <= triggerRadius) {
      // Automatic Reflex / Fortitude saving throw simulation
      const d1 = Math.floor(Math.random() * 10) + 1;
      const d2 = Math.floor(Math.random() * 10) + 1;
      const reflexBonus = movedToken.agility ? Math.floor((movedToken.agility - 10) / 2) : 2;
      const totalSaveRoll = d1 + d2 + reflexBonus;
      const saveDc = obj.saveDc || trapConfig.saveDc || 14;
      const isSaveSuccess = totalSaveRoll >= saveDc;

      // Half damage on successful save
      const rawDamage = obj.baseDamage !== undefined ? obj.baseDamage : trapConfig.baseDamage;
      const appliedDamage = isSaveSuccess ? Math.floor(rawDamage / 2) : rawDamage;
      const conditionToApply = isSaveSuccess ? null : (obj.appliedCondition || trapConfig.appliedCondition);

      // Audio tactical feedback
      if (trapConfig.category === 'alarm') {
        AudioService.playTerminalBeep(1200, 0.4);
      } else {
        AudioService.playCombatHit(appliedDamage >= 12);
      }

      results.push({
        trapId: obj.id,
        trapName: obj.label || trapConfig.name,
        trapType: obj.trapType || trapConfig.id,
        triggerDistance: Math.round(dist),
        saveDc,
        saveRoll: totalSaveRoll,
        isSaveSuccess,
        damage: appliedDamage,
        condition: conditionToApply,
        isAlarm: trapConfig.category === 'alarm',
        soundFx: trapConfig.category === 'alarm' ? 'alarm' : 'explosion',
        logMessage: isSaveSuccess
          ? `⚡ [TRAP EVADED] ${movedToken.label || 'Operative'} triggered ${obj.label || trapConfig.name} but SAVED (Rolled ${totalSaveRoll} vs DC ${saveDc}). Took ${appliedDamage} partial damage.`
          : `💥 [TRAP DETONATED] ${movedToken.label || 'Operative'} triggered ${obj.label || trapConfig.name}! (Failed Save: ${totalSaveRoll} vs DC ${saveDc}). Suffer ${appliedDamage} damage${conditionToApply ? ` and [${conditionToApply}] condition` : ''}!`
      });
    }
  });

  return results;
}

/**
 * Attempts to disarm or slice a reactive trap.
 */
export function disarmTrap(trapObj, operativeBonus = 3) {
  const trapConfig = TRAP_TYPES[trapObj.trapType || trapObj.type] || TRAP_TYPES.proximity_plasma_mine;
  const dc = trapObj.disarmDc || trapConfig.disarmDc || 13;
  const roll = Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1 + operativeBonus;
  const isSuccess = roll >= dc;

  if (isSuccess) {
    AudioService.playTerminalBeep(980, 0.15);
    return {
      success: true,
      roll,
      dc,
      message: `✅ Disarm Success: Rolled ${roll} vs DC ${dc}. Trap safely rendered inert!`
    };
  } else {
    AudioService.playCombatHit(false);
    return {
      success: false,
      roll,
      dc,
      message: `❌ Disarm Failed: Rolled ${roll} vs DC ${dc}. Security failsafe tripped!`
    };
  }
}

/**
 * Steps automated NPC patrol waypoints by one movement tick.
 *
 * @param {Array} tokens - Tokens on map.
 * @param {number} moveStepPx - Movement increment per tick (e.g. 20-30px).
 * @returns {Array} Updated tokens array with newly calculated positions and patrol states.
 */
export function stepNpcPatrols(tokens = [], moveStepPx = 25) {
  return tokens.map(token => {
    // Only process tokens with an assigned patrol script and waypoints
    if (!token.script || token.script.type !== 'patrol' || !Array.isArray(token.script.waypoints) || token.script.waypoints.length === 0) {
      return token;
    }

    const waypoints = token.script.waypoints;
    const curIndex = token.script.currentWaypointIndex || 0;
    const targetWp = waypoints[curIndex] || waypoints[0];

    const curX = token.x || 0;
    const curY = token.y || 0;
    const distToWp = calculateDistance({ x: curX, y: curY }, targetWp);

    // If reached waypoint, advance to next
    if (distToWp <= moveStepPx) {
      const isPingPong = token.script.isPingPong || false;
      const isReversing = token.script.isReversing || false;
      let nextIndex = curIndex + (isReversing ? -1 : 1);
      let nextReversing = isReversing;

      if (nextIndex >= waypoints.length) {
        if (isPingPong) {
          nextIndex = waypoints.length - 2;
          nextReversing = true;
        } else {
          nextIndex = 0; // Loop back to start
        }
      } else if (nextIndex < 0) {
        nextIndex = 1;
        nextReversing = false;
      }

      return {
        ...token,
        x: targetWp.x,
        y: targetWp.y,
        script: {
          ...token.script,
          currentWaypointIndex: Math.max(0, nextIndex),
          isReversing: nextReversing
        }
      };
    }

    // Move smoothly towards current waypoint
    const angle = Math.atan2(targetWp.y - curY, targetWp.x - curX);
    const newX = Math.round(curX + Math.cos(angle) * moveStepPx);
    const newY = Math.round(curY + Math.sin(angle) * moveStepPx);

    return {
      ...token,
      x: newX,
      y: newY
    };
  });
}

/**
 * Evaluates sentry NPC vision cones against hero tokens.
 */
export function evaluateSentryVision(sentryToken, heroTokens = []) {
  if (!sentryToken?.script || sentryToken.script.type !== 'sentry') return null;

  const visionRange = sentryToken.script.visionRangePx || 300;
  const facingAngleDeg = sentryToken.script.facingAngleDeg !== undefined ? sentryToken.script.facingAngleDeg : 0;
  const visionFovDeg = sentryToken.script.visionFovDeg || 90;

  const sx = sentryToken.x || 0;
  const sy = sentryToken.y || 0;

  for (const hero of heroTokens) {
    const hx = hero.x || 0;
    const hy = hero.y || 0;
    const dist = calculateDistance({ x: sx, y: sy }, { x: hx, y: hy });

    if (dist <= visionRange) {
      const angleToHero = Math.atan2(hy - sy, hx - sx) * (180 / Math.PI);
      const diff = Math.abs((facingAngleDeg - angleToHero + 180) % 360 - 180);

      if (diff <= visionFovDeg / 2) {
        return {
          detectedHero: hero,
          distance: Math.round(dist),
          alertBark: sentryToken.script.alertBark || '🚨 Intruder breach in tactical sector! Sound the alarm!',
          facingAngleDeg
        };
      }
    }
  }

  return null;
}

export default {
  TRAP_TYPES,
  NPC_SCRIPT_TYPES,
  calculateDistance,
  evaluateTrapTriggers,
  disarmTrap,
  stepNpcPatrols,
  evaluateSentryVision
};
