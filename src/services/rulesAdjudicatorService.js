/**
 * TANGENT SFF RP: Tactical Trait & Modifiers Adjudicator Service
 * Computes canonical tactical modifiers including range brackets, cover, elevation, flanking, and lighting obscurement.
 */

export const RANGE_BRACKETS = [
  { id: 'point_blank', label: 'Point Blank (Within Reach)', icon: '🎯', attackMod: 5, unopposedDC: 10, description: '+5 Strike bonus, damage dice rolled with Advantage (Ballistic/Energy), CR 10 unopposed.' },
  { id: 'short', label: 'Short Range (Base Range)', icon: '📏', attackMod: 0, unopposedDC: 15, description: 'Standard effective range for the weapon. CR 15 unopposed.' },
  { id: 'medium', label: 'Medium Range (Up to 2x Base)', icon: '📐', attackMod: -5, unopposedDC: 20, description: '-5 Attack penalty. CR 20 unopposed.' },
  { id: 'long', label: 'Long Range (Up to 5x Base)', icon: '🔭', attackMod: -10, unopposedDC: 25, description: '-10 Attack penalty. CR 25 unopposed.' },
  { id: 'extreme', label: 'Extreme Range (Up to 10x Base)', icon: '🌌', attackMod: -15, unopposedDC: 30, description: '-15 Attack penalty. CR 30 unopposed.' }
];

export const SIZE_MODIFIERS = [
  { id: 'miniscule', label: 'Miniscule (< 1in)', modifier: -32 },
  { id: 'fine', label: 'Fine (< 6in)', modifier: -16 },
  { id: 'diminutive', label: 'Diminutive (< 1ft)', modifier: -8 },
  { id: 'tiny', label: 'Tiny (< 2ft)', modifier: -4 },
  { id: 'small', label: 'Small (< 4ft)', modifier: -2 },
  { id: 'medium', label: 'Medium (Base < 8ft)', modifier: 0 },
  { id: 'large', label: 'Large (< 16ft)', modifier: 2 },
  { id: 'huge', label: 'Huge (< 32ft)', modifier: 4 },
  { id: 'gargantuan', label: 'Gargantuan (< 64ft)', modifier: 8 },
  { id: 'colossal', label: 'Colossal (< 128ft)', modifier: 16 }
];

export const COVER_TYPES = [
  { id: 'none', label: 'No Cover / Open Ground', icon: '⚪', defenseMod: 0, description: 'Target is in the open with no ballistic obstruction.' },
  { id: 'partial', label: 'Partial Cover (Waist-High)', icon: '🛡️', defenseMod: 2, description: '+2 Defense DC against incoming ranged fire.' },
  { id: 'heavy', label: 'Heavy Cover (Bulkhead/Pillar)', icon: '🏰', defenseMod: 4, description: '+4 Defense DC against incoming ranged fire.' },
  { id: 'total', label: 'Total Cover (Sealed Door)', icon: '🚫', defenseMod: 99, description: 'Target cannot be directly targeted by linear projectiles.' }
];

export const LIGHTING_OBSCUREMENT = [
  { id: 'clear', label: 'Clear Lighting / Standard', icon: '☀️', attackMod: 0, description: 'Full visibility, no visual penalties.' },
  { id: 'dim', label: 'Dim Light / Deep Shadows', icon: '🌑', attackMod: -1, description: '-1 attack penalty (negated by Low-Light optics).' },
  { id: 'smoke', label: 'Dense Smoke / Total Dark', icon: '💨', attackMod: -3, description: '-3 attack penalty (negated by Thermal/IR optics).' },
  { id: 'vacuum', label: 'Zero-G / Vacuum Recoil', icon: '🚀', attackMod: -2, description: '-2 attack penalty unless mag-boot anchored.' }
];

export const computeTacticalAttackModifiers = ({
  rangeBracketId = 'short',
  coverTypeId = 'none',
  lightingId = 'clear',
  hasHighGround = false,
  isFlanked = false,
  isTargetProne = false,
  isTargetStunned = false,
  isAimed = false,
  customMod = 0,
  activeModifiers = []
} = {}) => {
  let netAttackMod = customMod;
  let netDefenseMod = 0;
  const breakdown = [];

  // 1. Range Bracket
  const range = RANGE_BRACKETS.find(r => r.id === rangeBracketId) || RANGE_BRACKETS[1];
  if (range.attackMod !== 0) {
    netAttackMod += range.attackMod;
    breakdown.push(`Range [${range.label}]: ${range.attackMod > 0 ? `+${range.attackMod}` : range.attackMod} ATK`);
  }

  // Aim bonus
  if (isAimed) {
    netAttackMod += 2;
    breakdown.push('Aim Action / Optic Lock: +2 ATK');
  }

  // 2. Cover
  const cover = COVER_TYPES.find(c => c.id === coverTypeId) || COVER_TYPES[0];
  if (cover.defenseMod > 0) {
    netDefenseMod += cover.defenseMod;
    breakdown.push(`Cover [${cover.label}]: +${cover.defenseMod} DEF`);
  }

  // 3. High Ground
  if (hasHighGround) {
    netAttackMod += 2;
    breakdown.push('High Ground Elevation: +2 ATK');
  }

  // 4. Flanking
  if (isFlanked) {
    netDefenseMod -= 2;
    breakdown.push('Flanked / Crossfire: -2 DEF');
  }

  // 5. Target Prone
  if (isTargetProne) {
    if (rangeBracketId === 'point_blank') {
      netDefenseMod -= 4;
      breakdown.push('Target Prone in Melee: -4 DEF (Advantage)');
    } else {
      netDefenseMod += 2;
      breakdown.push('Target Prone at Range: +2 DEF (Smaller Profile)');
    }
  }

  // 6. Target Stunned / Incapacitated
  if (isTargetStunned) {
    netDefenseMod -= 4;
    breakdown.push('Target Stunned: -4 DEF (Vulnerable)');
  }

  // 7. Lighting / Obscurement
  const light = LIGHTING_OBSCUREMENT.find(l => l.id === lightingId) || LIGHTING_OBSCUREMENT[0];
  if (light.attackMod !== 0) {
    netAttackMod += light.attackMod;
    breakdown.push(`Environment [${light.label}]: ${light.attackMod} ATK`);
  }

  // 8. Story Gallery Situational & Temporary Modifiers
  if (Array.isArray(activeModifiers) && activeModifiers.length > 0) {
    activeModifiers.forEach((mod) => {
      if (!mod || mod.isActive === false) return;
      const eff = mod.effects || {};
      if (eff.attackMod) {
        netAttackMod += eff.attackMod;
        breakdown.push(`Gallery [${mod.name}]: ${eff.attackMod > 0 ? `+${eff.attackMod}` : eff.attackMod} ATK`);
      }
      if (eff.defenseMod) {
        netDefenseMod += eff.defenseMod;
        breakdown.push(`Gallery [${mod.name}]: ${eff.defenseMod > 0 ? `+${eff.defenseMod}` : eff.defenseMod} DEF`);
      }
    });
  }

  return {
    netAttackMod,
    netDefenseMod,
    breakdown,
    summary: breakdown.length > 0 ? breakdown.join(' | ') : 'Standard clean engagement (0 net modifiers).'
  };
};

/**
 * Computes net situational modifiers for non-combat checks (Metaphysics, Tech, Skills).
 */
export const computeNetSituationalModifiers = ({
  actionType = 'general', // 'metaphysic' | 'tech' | 'combat' | 'general'
  skillName = null,
  activeModifiers = []
} = {}) => {
  let netMod = 0;
  const breakdown = [];

  if (Array.isArray(activeModifiers)) {
    activeModifiers.forEach((mod) => {
      if (!mod || mod.isActive === false) return;
      const eff = mod.effects || {};

      if (actionType === 'metaphysic' && eff.metaphysicMod) {
        netMod += eff.metaphysicMod;
        breakdown.push(`${mod.name} (${eff.metaphysicMod > 0 ? `+${eff.metaphysicMod}` : eff.metaphysicMod} Metaphysic)`);
      }
      if (actionType === 'tech' && eff.techMod) {
        netMod += eff.techMod;
        breakdown.push(`${mod.name} (${eff.techMod > 0 ? `+${eff.techMod}` : eff.techMod} Tech)`);
      }
      if (skillName && eff.skillMods && eff.skillMods[skillName]) {
        const val = eff.skillMods[skillName];
        netMod += val;
        breakdown.push(`${mod.name} (${val > 0 ? `+${val}` : val} ${skillName})`);
      }
    });
  }

  return {
    netMod,
    breakdown,
    summary: breakdown.length > 0 ? breakdown.join(' | ') : 'No situational modifiers active.'
  };
};

