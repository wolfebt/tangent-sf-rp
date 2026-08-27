/**
 * TANGENT SFF RP: Interactive Map Objects & Destructibles Service
 * Manages tactical environmental interactive nodes (Explosive Canisters, Blast Doors,
 * Security Slicing Terminals, Power Generators) and resolves interactions and damage triggers.
 */

import { AudioService } from './audioService';

export const OBJECT_TYPES = {
  explosive_canister: {
    id: 'explosive_canister',
    name: 'Volatile Plasma Canister',
    icon: '🛢️',
    category: 'hazard',
    maxStructure: 15,
    explosionRadiusPx: 120, // ~4m
    explosionDamage: 18,
    damageType: 'lethal',
    appliedCondition: 'Burning',
    description: 'Pressurized plasma canister. Explodes upon reaching 0 Structure, inflicting 18 lethal damage in 4m AoE.'
  },
  cryo_barrel: {
    id: 'cryo_barrel',
    name: 'Cryo-Coolant Drum',
    icon: '❄️',
    category: 'hazard',
    maxStructure: 12,
    explosionRadiusPx: 100,
    explosionDamage: 10,
    damageType: 'non_lethal',
    appliedCondition: 'Slowed',
    description: 'Sub-zero liquid cryo drum. Explodes on rupture, creating freezing mist that inflicts Slowed condition.'
  },
  blast_door: {
    id: 'blast_door',
    name: 'Reinforced Bulkhead Door',
    icon: '🚪',
    category: 'barrier',
    maxStructure: 60,
    armorDr: 8,
    states: ['open', 'closed', 'locked', 'sealed', 'breached'],
    hackDc: 14,
    strengthDc: 18,
    description: 'Heavy durasteel security bulkhead. Can be sliced (Tech DC 14), forced (STR DC 18), or breached with explosives.'
  },
  security_terminal: {
    id: 'security_terminal',
    name: 'Security Slicing Terminal',
    icon: '💻',
    category: 'utility',
    maxStructure: 20,
    hackDc: 13,
    capabilities: ['disable_turrets', 'vent_halon_gas', 'unlock_all_doors', 'download_intel'],
    description: 'Facility mainframe relay. Slicing grants control over local automated defenses and reveals sector maps.'
  },
  power_conduit: {
    id: 'power_conduit',
    name: 'High-Voltage Power Conduit',
    icon: '⚡',
    category: 'hazard',
    maxStructure: 25,
    empRadiusPx: 140,
    description: 'Overloading releases an electromagnetic pulse (EMP) that disables synthetic shields and stuns tech units.'
  }
};

/**
 * Applies damage to an interactive map object and evaluates destruction/explosive triggers.
 */
export function applyDamageToObject(objectNode, damageAmount, allTokensOnMap = []) {
  const objType = OBJECT_TYPES[objectNode.type] || OBJECT_TYPES.explosive_canister;
  const currentStructure = objectNode.structure !== undefined ? objectNode.structure : (objType.maxStructure || 20);
  const dr = objType.armorDr || 0;
  const effectiveDamage = Math.max(1, damageAmount - dr);
  const newStructure = Math.max(0, currentStructure - effectiveDamage);
  const isDestroyed = newStructure === 0;

  const affectedTokens = [];

  // If explosive object is destroyed, calculate blast impacts on nearby tokens
  if (isDestroyed && (objType.explosionRadiusPx || objType.empRadiusPx)) {
    const radius = objType.explosionRadiusPx || objType.empRadiusPx || 100;
    const ox = objectNode.x || 0;
    const oy = objectNode.y || 0;

    AudioService.playTerminalBeep(350, 0.2);

    allTokensOnMap.forEach(token => {
      const dist = Math.hypot((token.x || 0) - ox, (token.y || 0) - oy);
      if (dist <= radius) {
        const falloffFactor = 1 - (dist / radius) * 0.4;
        const blastDamage = Math.round((objType.explosionDamage || 12) * falloffFactor);

        affectedTokens.push({
          token,
          distancePx: Math.round(dist),
          damage: blastDamage,
          condition: objType.appliedCondition || null
        });
      }
    });
  }

  return {
    objectId: objectNode.id,
    objectName: objectNode.label || objType.name,
    icon: objType.icon,
    previousStructure: currentStructure,
    newStructure,
    isDestroyed,
    affectedTokens,
    logSummary: isDestroyed 
      ? `💥 ${objType.icon} ${objectNode.label || objType.name} DETONATED! (${affectedTokens.length} units caught in blast radius)`
      : `🛡️ ${objType.icon} ${objectNode.label || objType.name} took ${effectiveDamage} damage (${newStructure}/${objType.maxStructure} Structure)`
  };
}

/**
 * Attempts to hack, unlock, or activate a security terminal / blast door.
 */
export function interactWithObject(objectNode, operativeToken, actionType = 'hack', rollOverride = null) {
  const objType = OBJECT_TYPES[objectNode.type] || OBJECT_TYPES.security_terminal;
  const techSkill = operativeToken?.techSkill || operativeToken?.intMod || 3;
  const roll = rollOverride !== null ? rollOverride : (Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1 + techSkill);
  const dc = objType.hackDc || 14;
  const isSuccess = roll >= dc;

  AudioService.playTerminalBeep(isSuccess ? 1100 : 450, 0.08);

  return {
    objectId: objectNode.id,
    objectName: objectNode.label || objType.name,
    actionType,
    operativeName: operativeToken?.label || 'Operative',
    roll,
    dc,
    isSuccess,
    resultText: isSuccess
      ? `🔓 ${operativeToken?.label || 'Operative'} successfully sliced ${objType.name}! (Roll: ${roll} vs DC ${dc})`
      : `🚫 Slicing failed on ${objType.name}! Security lockdown engaged (Roll: ${roll} vs DC ${dc}).`
  };
}

export default {
  OBJECT_TYPES,
  applyDamageToObject,
  interactWithObject
};
