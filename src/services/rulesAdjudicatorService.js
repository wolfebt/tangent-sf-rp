/**
 * TANGENT SFF RP: Tactical Trait & Modifiers Adjudicator Service
 * Computes canonical tactical modifiers including range brackets, cover, elevation, flanking, and lighting obscurement.
 */

export const RANGE_BRACKETS = [
  { id: 'point_blank', label: 'Point-Blank (0–2m)', icon: '🎯', attackMod: 2, rangedLongPenalty: -2, description: '+2 for Melee/Pistols; -2 for Heavy Rifles/Snipers.' },
  { id: 'short', label: 'Short Range (3–15m)', icon: '📏', attackMod: 0, description: 'Standard effective range for all small arms.' },
  { id: 'medium', label: 'Medium Range (16–40m)', icon: '📐', attackMod: 0, description: 'Standard engagement range for rifles and carbines.' },
  { id: 'long', label: 'Long Range (41–80m)', icon: '🔭', attackMod: -2, description: '-2 attack penalty due to atmospheric drift and ballistic drop.' },
  { id: 'extreme', label: 'Extreme Range (81–200m)', icon: '🌌', attackMod: -4, description: '-4 attack penalty unless aiming with Sniper Optic.' }
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
  customMod = 0
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

  return {
    netAttackMod,
    netDefenseMod,
    breakdown,
    summary: breakdown.length > 0 ? breakdown.join(' | ') : 'Standard clean engagement (0 net modifiers).'
  };
};
