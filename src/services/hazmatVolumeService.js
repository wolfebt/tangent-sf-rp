/**
 * TANGENT SFF RP: Dynamic Hazmat & Environmental Volume Service
 * Manages spatial hazard volumes (Radiation, Vacuum, Zero-G, Fire, Toxic Gas, Acid)
 * and resolves turn-start & movement ticks against operative saving throws.
 */

import { AudioService } from './audioService';

export const HAZMAT_TYPES = {
  radiation_leak: {
    id: 'radiation_leak',
    name: 'High Radiation Leak',
    icon: '☢️',
    saveType: 'Fortitude (STA)',
    saveDc: 14,
    tickDamage: 6,
    condition: 'Irradiated',
    description: 'Harmful ionizing radiation. DC 14 Fortitude save or take 6 lethal damage and gain Irradiated condition.'
  },
  toxic_gas: {
    id: 'toxic_gas',
    name: 'Corrosive / Neuro-Toxic Gas',
    icon: '🧪',
    saveType: 'Fortitude (STA)',
    saveDc: 13,
    tickDamage: 7,
    condition: 'Poisoned',
    description: 'Airborne chemical agents. DC 13 Fortitude save or suffer 7 lethal damage and Poisoned condition.'
  },
  vacuum_breach: {
    id: 'vacuum_breach',
    name: 'Hard Vacuum Decompression',
    icon: '🕳️',
    saveType: 'Fortitude (STA)',
    saveDc: 16,
    tickDamage: 12,
    condition: 'Asphyxiating',
    description: 'Decompressed atmosphere. Requires sealed EVA suit or DC 16 Fortitude save vs 12 lethal damage.'
  },
  plasma_fire: {
    id: 'plasma_fire',
    name: 'Superheated Plasma Fire',
    icon: '🔥',
    saveType: 'Reflex (AGI)',
    saveDc: 15,
    tickDamage: 10,
    condition: 'Burning',
    description: 'Direct thermal exposure. DC 15 Reflex save or take 10 lethal damage and catch Burning.'
  },
  zero_g: {
    id: 'zero_g',
    name: 'Zero-G Inertia Zone',
    icon: '🌌',
    saveType: 'Acrobatics (AGI)',
    saveDc: 12,
    tickDamage: 0,
    condition: 'Drifting',
    description: 'Loss of gravitational anchor. DC 12 Acrobatics check to stabilize; otherwise -2 Disadvantage to attack.'
  },
  electric_surge: {
    id: 'electric_surge',
    name: 'High-Voltage Conduit Arcing',
    icon: '⚡',
    saveType: 'Reflex (AGI)',
    saveDc: 14,
    tickDamage: 8,
    condition: 'Stunned',
    description: 'Exposed electrical conduit. DC 14 Reflex save or suffer 8 energy damage and become Stunned.'
  }
};

/**
 * Checks if a token position is inside a circular or rectangular hazard zone.
 */
export function isInsideHazardZone(tokenPos, zone) {
  if (!tokenPos || !zone) return false;
  const tx = tokenPos.x || 0;
  const ty = tokenPos.y || 0;

  if (zone.shape === 'circle' || zone.radius) {
    const zx = zone.x || 0;
    const zy = zone.y || 0;
    const radius = zone.radius || zone.radiusPx || 100;
    return Math.hypot(tx - zx, ty - zy) <= radius;
  }

  if (zone.x !== undefined && zone.y !== undefined && zone.width && zone.height) {
    return tx >= zone.x && tx <= (zone.x + zone.width) && ty >= zone.y && ty <= (zone.y + zone.height);
  }

  return false;
}

/**
 * Evaluates hazmat tick for a token against all active hazard zones on the map.
 */
export function evaluateHazmatTick(token, hazardZones = []) {
  if (!token || !hazardZones || hazardZones.length === 0) return [];

  const results = [];

  hazardZones.forEach(zone => {
    if (!isInsideHazardZone(token, zone)) return;

    const hazardType = HAZMAT_TYPES[zone.type || zone.id] || HAZMAT_TYPES.radiation_leak;
    
    // Simulate save roll: 1d10 + STA/AGI mod (~3)
    const roll = Math.floor(Math.random() * 10) + 1 + (token.staMod || token.agiMod || 3);
    const savePassed = roll >= hazardType.saveDc;
    const damage = savePassed ? Math.floor(hazardType.tickDamage / 2) : hazardType.tickDamage;

    AudioService.playTerminalBeep(savePassed ? 800 : 400, 0.04);

    results.push({
      hazardId: hazardType.id,
      hazardName: hazardType.name,
      icon: hazardType.icon,
      saveType: hazardType.saveType,
      saveDc: hazardType.saveDc,
      roll,
      savePassed,
      damage,
      condition: !savePassed ? hazardType.condition : null,
      message: `${hazardType.icon} ${token.label || 'Operative'} in ${hazardType.name}: ${savePassed ? 'PASSED save' : 'FAILED save'} (Roll: ${roll} vs DC ${hazardType.saveDc}) → ${damage} DMG${!savePassed && hazardType.condition ? ` + [${hazardType.condition}]` : ''}`
    });
  });

  return results;
}

export default {
  HAZMAT_TYPES,
  isInsideHazardZone,
  evaluateHazmatTick
};
