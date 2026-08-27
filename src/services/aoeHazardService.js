/**
 * TANGENT SFF RP: Multi-Target AoE & Environmental Hazard Engine
 * Computes geometric blast templates (Circle, Cone, Line), distance falloff, Reflex saves, and hazard field ticks.
 */

export const CANONICAL_AOE_PRESETS = [
  {
    id: 'frag_grenade',
    label: 'Mk-IV Fragmentation Grenade',
    icon: '💣',
    shape: 'circle',
    radiusPx: 75, // ~3m
    baseDamage: 14,
    damageType: 'lethal',
    saveType: 'Reflex',
    saveDc: 14,
    falloff: true,
    appliedCondition: 'Prone',
    description: 'High-explosive shrapnel burst. Core zone takes 14 lethal damage; outer perimeter takes 7 damage. Reflex DC 14 for half.'
  },
  {
    id: 'plasma_grenade',
    label: 'Plasma Incendiary Charge',
    icon: '🔥',
    shape: 'circle',
    radiusPx: 90, // ~4m
    baseDamage: 18,
    damageType: 'lethal',
    saveType: 'Reflex',
    saveDc: 15,
    falloff: false,
    appliedCondition: 'Burning',
    description: 'Superheated thermal plasma blast. Inflicts 18 lethal damage and inflicts Burning condition. Reflex DC 15 for half.'
  },
  {
    id: 'flamethrower_sweep',
    label: 'Pyro-Conduit Flamethrower',
    icon: '🔥',
    shape: 'cone',
    rangePx: 120, // ~6m
    coneAngleDeg: 60,
    baseDamage: 12,
    damageType: 'lethal',
    saveType: 'Reflex',
    saveDc: 13,
    falloff: false,
    appliedCondition: 'Burning',
    description: '60° sweeping jet of liquid promethium. Inflicts 12 lethal damage and sets targets Burning. Reflex DC 13 for half.'
  },
  {
    id: 'particle_lance',
    label: 'Particle Lance Penetrator',
    icon: '⚡',
    shape: 'line',
    lengthPx: 200, // ~10m
    widthPx: 30,
    baseDamage: 22,
    damageType: 'lethal',
    saveType: 'Reflex',
    saveDc: 16,
    falloff: false,
    appliedCondition: null,
    description: 'Coherent particle beam penetrating all targets in a linear vector for 22 lethal AP 6 damage.'
  },
  {
    id: 'concussion_charge',
    label: 'Stun / Concussion Canister',
    icon: '💫',
    shape: 'circle',
    radiusPx: 80,
    baseDamage: 16,
    damageType: 'concussive',
    saveType: 'Fortitude',
    saveDc: 14,
    falloff: true,
    appliedCondition: 'Stunned',
    description: 'Acoustic shockwave splitting 50/50 between Vitality and Health, knocking targets Prone and Stunned on failed Fort DC 14.'
  },
  {
    id: 'hazard_plasma_leak',
    label: 'Hazard: Superheated Plasma Vent',
    icon: '⚠️',
    shape: 'circle',
    radiusPx: 60,
    baseDamage: 6,
    damageType: 'lethal',
    saveType: 'Reflex',
    saveDc: 12,
    falloff: false,
    appliedCondition: 'Burning',
    description: 'Environmental hazard tile. Inflicts 6 thermal lethal damage and Burning to any token entering or ending turn inside.'
  },
  {
    id: 'hazard_radiation',
    label: 'Hazard: Radiation Hotspot',
    icon: '☢️',
    shape: 'circle',
    radiusPx: 70,
    baseDamage: 4,
    damageType: 'lethal',
    saveType: 'Fortitude',
    saveDc: 15,
    falloff: false,
    appliedCondition: 'RadioactiveSickness',
    description: 'Environmental radiation leak. Inflicts 4 direct unsoakable lethal trauma and Radioactive Sickness.'
  }
];

export const getAoEPreset = (id) => {
  if (!id) return CANONICAL_AOE_PRESETS[0];
  return CANONICAL_AOE_PRESETS.find(p => p.id === id) || CANONICAL_AOE_PRESETS[0];
};

/**
 * Finds all tokens within a circular blast radius.
 */
export const getTokensInCircle = (centerPoint, radiusPx, tokens = []) => {
  if (!centerPoint || !Array.isArray(tokens)) return [];
  const cx = centerPoint.x || 0;
  const cy = centerPoint.y || 0;

  return tokens
    .filter(t => !t.isDead && !(t.conditions || []).includes('Dead'))
    .map(t => {
      const tx = t.x || 0;
      const ty = t.y || 0;
      const dist = Math.hypot(tx - cx, ty - cy);
      const isInside = dist <= radiusPx;
      const isCore = dist <= radiusPx * 0.5;

      return {
        token: t,
        distancePx: Math.round(dist),
        isInside,
        zone: isCore ? 'core' : 'outer'
      };
    })
    .filter(res => res.isInside);
};

/**
 * Finds all tokens within a 60° cone template.
 */
export const getTokensInCone = (originPoint, directionAngleDeg, coneAngleDeg = 60, rangePx = 120, tokens = []) => {
  if (!originPoint || !Array.isArray(tokens)) return [];
  const ox = originPoint.x || 0;
  const oy = originPoint.y || 0;
  const halfAngle = coneAngleDeg / 2;

  // Normalize direction angle to [0, 360)
  const normDir = (directionAngleDeg % 360 + 360) % 360;

  return tokens
    .filter(t => !t.isDead && !(t.conditions || []).includes('Dead'))
    .map(t => {
      const tx = t.x || 0;
      const ty = t.y || 0;
      const dx = tx - ox;
      const dy = ty - oy;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        return { token: t, distancePx: 0, isInside: true, zone: 'core' };
      }

      if (dist > rangePx) {
        return { token: t, distancePx: Math.round(dist), isInside: false };
      }

      // Calculate angle from origin to token in degrees [0, 360)
      let angleToToken = Math.atan2(dy, dx) * (180 / Math.PI);
      angleToToken = (angleToToken % 360 + 360) % 360;

      // Angular difference
      let diff = Math.abs(angleToToken - normDir);
      if (diff > 180) diff = 360 - diff;

      const isInside = diff <= halfAngle;
      const isCore = dist <= rangePx * 0.5;

      return {
        token: t,
        distancePx: Math.round(dist),
        angleDiff: Math.round(diff),
        isInside,
        zone: isCore ? 'core' : 'outer'
      };
    })
    .filter(res => res.isInside);
};

/**
 * Finds all tokens within a linear beam template.
 */
export const getTokensInLine = (startPoint, endPoint, widthPx = 30, tokens = []) => {
  if (!startPoint || !endPoint || !Array.isArray(tokens)) return [];
  const x1 = startPoint.x || 0;
  const y1 = startPoint.y || 0;
  const x2 = endPoint.x || 0;
  const y2 = endPoint.y || 0;

  const lineLen = Math.hypot(x2 - x1, y2 - y1);
  if (lineLen === 0) return [];

  const halfWidth = widthPx / 2;

  return tokens
    .filter(t => !t.isDead && !(t.conditions || []).includes('Dead'))
    .map(t => {
      const px = t.x || 0;
      const py = t.y || 0;

      // Project point onto line segment
      const u = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLen * lineLen)));
      const projX = x1 + u * (x2 - x1);
      const projY = y1 + u * (y2 - y1);
      const distToLine = Math.hypot(px - projX, py - projY);

      const isInside = distToLine <= halfWidth;

      return {
        token: t,
        distancePx: Math.round(distToLine),
        isInside,
        zone: 'core'
      };
    })
    .filter(res => res.isInside);
};

/**
 * Resolves AoE blast damage and save results for all affected tokens.
 */
export const resolveAoEImpact = (preset, affectedResults = [], options = {}) => {
  const customSaveRolls = options.saveRolls || {}; // { [tokenId]: rollTotal }

  return affectedResults.map(({ token, distancePx, zone }) => {
    const rawDamage = preset.falloff && zone === 'outer' ? Math.ceil(preset.baseDamage / 2) : preset.baseDamage;
    const sta = Math.max(0, parseInt(token.stamina || token.toughness || 0, 10));
    const armorDr = Math.max(0, parseInt(token.armorDr || token.dr || 0, 10));

    // Save calculation (Reflex or Fortitude)
    const saveBonus = Math.max(0, parseInt(token.reflex || token.saves?.reflex || token.agilityMod || 2, 10));
    const rollTotal = customSaveRolls[token.id] !== undefined
      ? customSaveRolls[token.id]
      : (Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1 + saveBonus);

    const saved = rollTotal >= preset.saveDc;
    const saveModifier = saved ? 0.5 : 1.0;

    const damageAfterSave = Math.ceil(rawDamage * saveModifier);

    // Soak: Armor DR + Toughness (STA)
    const totalSoak = (preset.damageType === 'concussive' ? Math.floor(armorDr / 2) : armorDr) + sta;
    const finalDamage = Math.max(1, damageAfterSave - totalSoak);

    // Split damage according to damage type
    let vitalityDamage = 0;
    let healthDamage = 0;
    let structureDamage = 0;

    if (token.isSynthetic || token.structure) {
      structureDamage = finalDamage;
    } else if (preset.damageType === 'concussive') {
      vitalityDamage = Math.ceil(finalDamage / 2);
      healthDamage = Math.floor(finalDamage / 2);
    } else if (preset.damageType === 'vitality') {
      vitalityDamage = finalDamage;
    } else {
      healthDamage = finalDamage;
    }

    return {
      tokenId: token.id,
      tokenLabel: token.label || 'Combatant',
      distancePx,
      zone,
      rawDamage,
      saveRoll: rollTotal,
      saveDc: preset.saveDc,
      saved,
      saveModifier,
      totalSoak,
      finalDamage,
      vitalityDamage,
      healthDamage,
      structureDamage,
      appliedCondition: !saved && preset.appliedCondition ? preset.appliedCondition : null
    };
  });
};
