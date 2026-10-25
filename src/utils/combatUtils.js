/**
 * Combat Utilities for Tangent SF RP
 * Provides conversion, normalization, and smart attack check calculations between
 * inventory items (weapons/armoring) and combat representations (attacks/armor).
 */
import { resolveMetaSkillForInvocation, isSpecialAbility, resolvePowerFoundation } from './metaphysicsUtils.js';


/**
 * Builds a formatted tactical note string from a weapon object's properties.
 * @param {object} weapon 
 * @returns {string}
 */
export const buildWeaponNotes = (weapon) => {
  if (!weapon) return '';
  if (weapon.notes && typeof weapon.notes === 'string' && weapon.notes.trim()) {
    return weapon.notes.trim();
  }
  const parts = [];
  if (weapon.range && weapon.range !== '-' && weapon.range !== 'Self') {
    parts.push(`Rng: ${weapon.range}`);
  }
  if (weapon.rate_of_fire && weapon.rate_of_fire !== 'Single') {
    parts.push(`RoF: ${weapon.rate_of_fire}`);
  }
  if (weapon.ammo_capacity && weapon.ammo_capacity !== '-') {
    parts.push(`Ammo: ${weapon.ammo_capacity}`);
  }
  if (weapon.description && typeof weapon.description === 'string' && weapon.description.trim()) {
    const cleanDesc = weapon.description
      .replace(/^\*\*Special:\*\*\s*/i, '')
      .replace(/\r?\n/g, ' ')
      .trim();
    if (cleanDesc && cleanDesc !== weapon.name) {
      parts.push(cleanDesc);
    }
  } else if (weapon.body && typeof weapon.body === 'string' && weapon.body.trim()) {
    const cleanBody = weapon.body
      .replace(/Category:\s*[^;\n]+/i, '')
      .replace(/^\*\*Special:\*\*\s*/i, '')
      .replace(/\r?\n/g, ' ')
      .trim();
    if (cleanBody && cleanBody.length < 80) {
      parts.push(cleanBody);
    }
  }
  return parts.join(' • ');
};

/**
 * Helper to resolve total effective skill bonus (rank + manual mod + computed modifiers + pillar fallback)
 * for a canonical skill ID (e.g., 'combat-energy', 'combat-ballistic', 'meta-elemental').
 * @param {string} skillId
 * @param {object} characterData
 * @param {object|null} computedModifiers
 * @returns {number}
 */
export const getEffectiveSkillBonus = (skillId, characterData = {}, computedModifiers = null) => {
  if (!skillId || !characterData) return 0;
  const shortId = skillId.replace(/^(combat|physical|mental|social|meta)-/, '');

  let skillRank = 0;
  if (characterData[`skill-${skillId}-rank`] !== undefined) {
    skillRank = parseInt(characterData[`skill-${skillId}-rank`], 10) || 0;
  } else if (characterData[`skill-${shortId}-rank`] !== undefined) {
    skillRank = parseInt(characterData[`skill-${shortId}-rank`], 10) || 0;
  } else {
    // Fallback to pillar skill allocations if not yet synced to skill-*-rank
    const pillarKeys = ['speciesAllocations', 'occuAllocations', 'originAllocations', 'factionAllocations'];
    for (const pk of pillarKeys) {
      const allocSkills = characterData[pk]?.skills;
      if (allocSkills && typeof allocSkills === 'object') {
        const allocRank = parseInt(allocSkills[skillId] ?? allocSkills[shortId] ?? 0, 10) || 0;
        if (allocRank > 0) {
          skillRank += allocRank;
        }
      }
    }
    if (skillRank === 0 && Array.isArray(characterData.skills)) {
      const foundSkill = characterData.skills.find(s => {
        if (typeof s === 'object' && s !== null) {
          const sId = String(s.id || s.name || '').toLowerCase().replace(/\s+/g, '-');
          return sId === skillId || sId === shortId;
        }
        return false;
      });
      if (foundSkill) {
        skillRank = parseInt(foundSkill.rank ?? foundSkill.value ?? 0, 10) || 0;
      }
    }
  }

  const manualMod = (parseInt(characterData[`skill-${skillId}-mod`] ?? 0, 10) || 0) +
    (shortId !== skillId ? (parseInt(characterData[`skill-${shortId}-mod`] ?? 0, 10) || 0) : 0);

  let computedSkillMod = 0;
  if (computedModifiers?.skillMods) {
    computedSkillMod += (computedModifiers.skillMods[shortId] || 0);
    if (shortId !== skillId) {
      computedSkillMod += (computedModifiers.skillMods[skillId] || 0);
    }
  }

  return skillRank + manualMod + computedSkillMod;
};

/**
 * Determines whether an object represents a conventional physical/energy weapon rather than a metaphysical invocation.
 * @param {object|string} item
 * @returns {boolean}
 */
export const isConventionalWeaponItem = (item) => {
  if (!item) return false;
  const obj = typeof item === 'object' ? item : { name: String(item) };
  if (obj.discipline || obj.powerType === 'invocation' || obj.powerType === 'special_ability' || obj.isSpecialAbility) {
    return false;
  }
  const cat = String(obj.category || obj.weapon_type || obj.subcategory || '').toLowerCase();
  if (cat === 'weapon' || cat === 'weapons' || cat === 'weaponry' || cat.includes('firearm') || cat.includes('ballistic') || cat.includes('melee') || cat.includes('archaic') || cat.includes('heavy weapon')) {
    return true;
  }
  if (obj.weaponId || obj.ammo_capacity !== undefined || obj.rate_of_fire !== undefined || obj.recoil !== undefined || obj.conceal !== undefined || obj.Conceal !== undefined) {
    return true;
  }
  const name = String(obj.name || obj.title || '').toLowerCase();
  if (/\b(pistol|rifle|carbine|shotgun|revolver|smg|submachine|needler|flechette|railgun|gauss|blaster|phaser|disruptor|stunner|maser|autocannon|minigun|gatling|flamethrower|launcher|grenade|mortar|sword|blade|dagger|knife|axe|mace|club|hammer|staff|polearm|spear|whip|katana|saber|machete|rapier|baton|bow|crossbow|sling|knuckle|gauntlet)\b/i.test(name)) {
    return true;
  }
  return false;
};

/**
 * Resolves the canonical combat skill ID and Primary Attribute ID for a weapon.
 * Uses canonical Primary Attributes ('attr-agility' or 'attr-strength'), NEVER Sub-Attributes ('attr-reflex' / 'attr-might').
 * @param {object} weapon
 * @param {object} [characterData]
 * @returns {{ governingSkill: string, governingAttr: string }}
 */
export const resolveWeaponCombatSkillAndAttr = (weapon, characterData = {}) => {
  if (!weapon || typeof weapon !== 'object') {
    return { governingSkill: 'combat-ballistic', governingAttr: 'attr-agility' };
  }

  const name = (weapon.name || weapon.title || '').toLowerCase();
  const body = (weapon.body || weapon.description || weapon.notes || '').toLowerCase();
  const cat = (weapon.category || weapon.weapon_type || weapon.subcategory || '').toLowerCase();
  const dmgType = (weapon.damage_type || weapon.type || weapon.damage || '').toLowerCase();

  let governingSkill = 'combat-ballistic';
  let governingAttr = 'attr-agility';

  // Explicit governing skill override if present on weapon
  if (weapon.governingSkill || weapon.governing_skill) {
    const rawSkill = String(weapon.governingSkill || weapon.governing_skill).toLowerCase().trim();
    governingSkill = rawSkill.startsWith('combat-') ? rawSkill : `combat-${rawSkill}`;
    governingAttr = (governingSkill === 'combat-melee' || governingSkill === 'combat-unarmed')
      ? 'attr-strength'
      : 'attr-agility';
  } else if (
    // Melee & Unarmed classification
    body.includes('category: melee') ||
    cat.includes('melee') ||
    cat.includes('unarmed') ||
    weapon.range === '-' ||
    weapon.range === 'Melee' ||
    weapon.range === 'Touch' ||
    (/\b(sword|blade|knife|axe|dagger|club|mace|hammer|staff|polearm|gauntlet|fist|unarmed|claws|spear|whip|katana|saber|machete|rapier|baton|pike|halberd|flail|cestus|knuckle)\b/i.test(name) &&
      !/\b(pistol|rifle|carbine|cannon|launcher|gun|bow)\b/i.test(name))
  ) {
    if (/\b(unarmed|fist|brawl|martial arts|gauntlet|cestus|knuckle)\b/i.test(name) || cat.includes('unarmed')) {
      governingSkill = 'combat-unarmed';
    } else {
      governingSkill = 'combat-melee';
    }
    governingAttr = 'attr-strength';
  } else if (
    // Energy & Heavy Energy weapons (e.g., Laser Pistol, Plasma Rifle, Plasma Cannon)
    cat.includes('energy') ||
    dmgType.includes('energy') ||
    dmgType.includes('plasma') ||
    dmgType.includes('laser') ||
    dmgType.includes('ion') ||
    dmgType.includes('photon') ||
    dmgType.includes('radiation') ||
    /\b(blaster|laser|plasma|ion|phaser|disruptor|beam|fusion|photon|maser|pulse|arc|stun pistol|stun rifle)\b/i.test(name)
  ) {
    if (/\b(heavy|cannon|bombard|turret|artillery|lance)\b/i.test(name) || cat.includes('heavy')) {
      governingSkill = 'combat-heavy-energy';
    } else {
      governingSkill = 'combat-energy';
    }
    governingAttr = 'attr-agility';
  } else if (
    // Heavy Ballistic / Ordnance Weapons
    cat.includes('heavy') ||
    /\b(heavy|machine gun|autocannon|minigun|gatling|rocket|missile|mortar|cannon|grenade launcher|flamethrower|railgun)\b/i.test(name)
  ) {
    governingSkill = 'combat-heavy-weapons';
    governingAttr = 'attr-agility';
  } else if (
    // Archaic / Thrown Ranged Weapons
    cat.includes('archaic') ||
    (cat.includes('ranged') && !cat.includes('ballistic') && !cat.includes('firearm')) ||
    /\b(bow|crossbow|sling|blowpipe|blowgun|boomerang|javelin|throwing|shuriken|dart|bola|net)\b/i.test(name)
  ) {
    governingSkill = 'combat-ranged';
    governingAttr = 'attr-agility';
  } else {
    // Default modern ballistic firearm (pistol, rifle, carbine, shotgun, smg, etc.)
    governingSkill = 'combat-ballistic';
    governingAttr = 'attr-agility';
  }

  // Respect user-configured governing attribute on the skill if explicitly set on the sheet
  const customSkillAtt = String(characterData?.[`skill-${governingSkill}-att`] || '').toLowerCase().trim();
  if (customSkillAtt === 'str' || customSkillAtt === 'strength' || customSkillAtt === 'attr-strength') {
    governingAttr = 'attr-strength';
  } else if (customSkillAtt === 'agi' || customSkillAtt === 'agility' || customSkillAtt === 'attr-agility') {
    governingAttr = 'attr-agility';
  }

  return { governingSkill, governingAttr };
};

/**
 * Calculates a sensible default attack check bonus based on character combat skills, primary attributes, and modifiers.
 * @param {object} weapon
 * @param {object} characterData
 * @param {function} [getAttrTotal]
 * @param {object} [computedModifiers]
 * @returns {string}
 */
export const calculateDefaultAttackScore = (weapon, characterData = {}, getAttrTotal = null, computedModifiers = null) => {
  if (!weapon) return '+0';
  if (weapon.isManualScore && weapon.score !== undefined && weapon.score !== null && weapon.score !== '') {
    const s = String(weapon.score).trim();
    return s.startsWith('+') || s.startsWith('-') ? s : `+${s}`;
  }

  const { governingSkill, governingAttr } = resolveWeaponCombatSkillAndAttr(weapon, characterData);

  // Retrieve full skill bonus (rank + manual skill mod + computed skillMods from features/traits/gear)
  const skillBonus = getEffectiveSkillBonus(governingSkill, characterData, computedModifiers);

  // Retrieve Primary Attribute total (NEVER use Sub-Attributes like Reflex/Might, which have base 2 + 2*Primary!)
  let attrBonus = 0;
  if (typeof getAttrTotal === 'function') {
    attrBonus = Number(getAttrTotal(governingAttr)) || 0;
  } else {
    attrBonus = (parseInt(characterData[governingAttr] ?? 0, 10) || 0) +
      (parseInt(characterData[`${governingAttr}-mod`] ?? 0, 10) || 0) +
      (computedModifiers?.attrMods?.[governingAttr] || 0);
  }

  // Global attack modifiers from features/traits/augmentations + manual sheet attack-mod
  const globalAttackMod = (computedModifiers?.combatMods?.['attack-mod'] || 0) +
    (parseInt(characterData['attack-mod'] ?? 0, 10) || 0);

  // Weapon-specific accuracy bonus (only explicit accuracy properties, never CP cost or damage dice)
  const weaponAccuracyMod = parseInt(weapon.attack_mod ?? weapon.hitBonus ?? weapon.attackBonus ?? 0, 10) || 0;

  const total = skillBonus + attrBonus + globalAttackMod + weaponAccuracyMod;
  return total >= 0 ? `+${total}` : `${total}`;
};

/**
 * Creates a complete attack object for Active Offensive Capabilities from a weapon item.
 * @param {object} weapon
 * @param {object} [characterData]
 * @param {function} [getAttrTotal]
 * @param {object} [computedModifiers]
 * @returns {object}
 */
export const createAttackFromWeapon = (weapon, characterData = {}, getAttrTotal = null, computedModifiers = null) => {
  if (!weapon) {
    return { name: '', score: '+0', damage: '', type: '', notes: '', category: 'weapon' };
  }
  const name = typeof weapon === 'object' ? (weapon.name || weapon.title || 'Weapon') : String(weapon);
  const id = typeof weapon === 'object' && weapon.id 
    ? `atk_${weapon.id}` 
    : `atk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const damage = typeof weapon === 'object' ? (weapon.damage || '1d10') : '1d10';
  const type = typeof weapon === 'object' ? (weapon.damage_type || weapon.type || 'Kinetic') : 'Kinetic';
  const notes = typeof weapon === 'object' ? buildWeaponNotes(weapon) : '';
  const { governingSkill, governingAttr } = typeof weapon === 'object'
    ? resolveWeaponCombatSkillAndAttr(weapon, characterData)
    : { governingSkill: 'combat-ballistic', governingAttr: 'attr-agility' };
  const score = typeof weapon === 'object' && weapon.isManualScore && weapon.score !== undefined && weapon.score !== ''
    ? String(weapon.score)
    : calculateDefaultAttackScore(weapon, characterData, getAttrTotal, computedModifiers);

  return {
    id,
    weaponId: typeof weapon === 'object' ? (weapon.id || null) : null,
    category: 'weapon',
    governingSkill,
    governingAttr,
    name,
    score,
    damage,
    type,
    range: typeof weapon === 'object' && weapon.range ? weapon.range : undefined,
    notes
  };
};

/**
 * Creates a complete armor defense entry for Active Defensive Capabilities from an armor item.
 * @param {object} armorItem
 * @returns {object}
 */
export const createArmorFromItem = (armorItem) => {
  if (!armorItem) {
    return { name: '', resistance: '0', type: '', notes: '' };
  }
  const name = typeof armorItem === 'object' ? (armorItem.name || armorItem.title || 'Armor') : String(armorItem);
  const id = typeof armorItem === 'object' && armorItem.id 
    ? `armor_${armorItem.id}` 
    : `armor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const resistance = typeof armorItem === 'object' 
    ? String(armorItem.dr ?? armorItem.armor ?? armorItem.resistance ?? '0') 
    : '0';
  const type = typeof armorItem === 'object' 
    ? (armorItem.armor_type || armorItem.category || armorItem.type || 'Standard') 
    : 'Standard';
  
  let notes = '';
  if (typeof armorItem === 'object') {
    if (armorItem.notes) {
      notes = armorItem.notes;
    } else if (armorItem.description) {
      notes = armorItem.description.replace(/\r?\n/g, ' • ').trim();
    } else if (armorItem.body) {
      notes = armorItem.body.replace(/Category:\s*[^;\n]+/i, '').replace(/\r?\n/g, ' • ').trim();
    }
  }

  return {
    id,
    armorId: typeof armorItem === 'object' ? (armorItem.id || null) : null,
    name,
    resistance,
    type,
    notes
  };
};

/**
 * Extracts a clean, standard dice formula from complex string entries (e.g. "4d6 Plasma", "2d8+3 Fire")
 * @param {string} expr
 * @returns {string}
 */
export const sanitizeDiceExpression = (expr = '1d10') => {
  if (!expr) return '1d10';
  const match = String(expr).match(/\d+d\d+(?:\s*[+-]\s*\d+)?/i);
  return match ? match[0].replace(/\s+/g, '') : '1d10';
};

/**
 * Determines whether a trait, feature, or ability represents a Natural Attack.
 * @param {object|string} trait
 * @returns {boolean}
 */
export const isNaturalAttackTrait = (trait) => {
  if (!trait) return false;
  const tObj = typeof trait === 'object' ? trait : { name: String(trait) };
  const id = (tObj.id || '').toLowerCase();
  const name = (tObj.name || tObj.title || '').toLowerCase();
  const desc = (tObj.description || tObj.desc || tObj.body || '').toLowerCase();

  if (id === 'trait-natural-weapons' || id === 'trait-bodyform-weapons') return true;
  if (/\b(natural weapons|natural weaponry|claws|talons|fangs|bite|horns|gore|tail strike|tail slap|tail stinger|venomous bite|acid spit|spurs|spines|mandibles)\b/i.test(name)) {
    return true;
  }
  if (tObj.attackType === 'natural' || tObj.type === 'Natural' || tObj.type === 'natural') return true;
  if (desc.includes('natural weapon') || desc.includes('a claw, fang, horn or other attack form')) return true;
  return false;
};

/**
 * Creates a standardized attack object from a natural attack trait.
 * @param {object|string} trait
 * @param {object} characterData
 * @param {function} [getAttrTotal]
 * @param {object} [computedModifiers]
 * @returns {object}
 */
export const createAttackFromNaturalTrait = (trait, characterData = {}, getAttrTotal = null, computedModifiers = null) => {
  const tObj = typeof trait === 'object' ? trait : { name: String(trait) };
  const name = tObj.name || tObj.title || 'Natural Weapon';
  const id = tObj.id ? `nat_${tObj.id}` : `nat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Attack modifier: Unarmed combat skill + Primary Strength (never Sub-Attribute Might) + global attack-mod
  const unarmedSkillBonus = getEffectiveSkillBonus('combat-unarmed', characterData, computedModifiers);
  let strBonus = 0;
  if (typeof getAttrTotal === 'function') {
    strBonus = Number(getAttrTotal('attr-strength')) || 0;
  } else {
    strBonus = (parseInt(characterData['attr-strength'] ?? 0, 10) || 0) +
      (parseInt(characterData['attr-strength-mod'] ?? 0, 10) || 0) +
      (computedModifiers?.attrMods?.['attr-strength'] || 0);
  }
  const globalAttackMod = (computedModifiers?.combatMods?.['attack-mod'] || 0) +
    (parseInt(characterData['attack-mod'] ?? 0, 10) || 0);
  const attackMod = unarmedSkillBonus + strBonus + globalAttackMod;

  // Determine damage: check for explicit damage in object or description
  let damage = tObj.damage;
  if (!damage) {
    const descText = `${tObj.description || ''} ${tObj.desc || ''} ${tObj.body || ''}`;
    const dmgMatch = descText.match(/\b(\d+d\d+(?:\s*[+-]\s*\d+)?)\b/i);
    if (dmgMatch) {
      damage = dmgMatch[1];
    } else {
      damage = strBonus > 0 ? `1d6+${strBonus}` : '1d6';
    }
  }

  const damageType = tObj.damage_type || tObj.type || 'Kinetic / Natural';
  const notes = tObj.description || tObj.desc || 'Natural biological or chassis weapon';

  return {
    id,
    sourceId: tObj.id || null,
    name,
    score: attackMod >= 0 ? `+${attackMod}` : `${attackMod}`,
    attackMod,
    damage,
    type: damageType,
    range: tObj.range || 'Melee',
    category: 'natural',
    notes
  };
};

/**
 * Determines whether an invocation, awakened power, or ability is an Offensive Metaphysics attack.
 * Never returns true for conventional weapons or natural attacks.
 * @param {object|string} item
 * @returns {boolean}
 */
export const isOffensiveMetaphysics = (item) => {
  if (!item) return false;
  const obj = typeof item === 'object' ? item : { name: String(item) };
  if (isConventionalWeaponItem(obj) || isNaturalAttackTrait(obj)) {
    return false;
  }

  const dmg = (obj.damage || '').toLowerCase();
  const desc = (obj.description || obj.desc || obj.body || '').toLowerCase();
  const tag = (obj.tag || obj.classification || obj.category || '').toLowerCase();
  const name = (obj.name || obj.title || '').toLowerCase();

  if (tag.includes('offensive') || tag.includes('attack')) return true;

  // Check if damage expression contains dice
  if (/\d+d\d+/i.test(dmg)) return true;

  // Check for offensive keywords in damage or description
  if (/\b(plasma|electrical|necrotic|psionic|fire|acid|concussive|shadow damage|disintegrate|wound|piercing damage|slashing damage|blunt damage)\b/i.test(dmg)) {
    return true;
  }
  if (/\b(blast|bolt|discharge|projectile|beam|strike|lance|combustion|detonation)\b/i.test(name)) {
    return true;
  }
  if (obj.resistance && (obj.resistance.includes('Reflex') || obj.resistance.includes('Fortitude') || obj.resistance.includes('Half'))) {
    if (/\d+d\d+/i.test(desc)) return true;
  }
  return false;
};

/**
 * Creates a standardized attack object from an offensive invocation or metaphysics power.
 * @param {object|string} invocation
 * @param {object} characterData
 * @param {function} [getAttrTotal]
 * @param {object} [computedModifiers]
 * @returns {object}
 */
export const createAttackFromInvocation = (invocation, characterData = {}, getAttrTotal = null, computedModifiers = null) => {
  const inv = typeof invocation === 'object' ? invocation : { name: String(invocation) };
  const name = inv.name || inv.title || 'Offensive Invocation';
  const id = inv.id ? `meta_${inv.id}` : `meta_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const isSpecial = isSpecialAbility(inv);
  let attackMod = 0;
  let disc = inv.discipline || 'Energy';
  let subSkillName = inv.subSkill || '';
  let metaInfo = null;

  if (isSpecial) {
    // Special Ability: stand-alone trait with Attribute foundation + Special Ability ranks
    const foundation = resolvePowerFoundation(inv, characterData, getAttrTotal, computedModifiers);
    attackMod = foundation.totalScore;
    disc = inv.discipline || 'Inherent';
    subSkillName = `Stand-Alone (${foundation.attributeName})`;
  } else {
    // Standard Invocation: specialization to Awakened Discipline & Meta Focus Skill
    metaInfo = resolveMetaSkillForInvocation(inv);
    const baseSkillId = inv.baseSkillId || metaInfo?.baseSkillId || 'meta-elemental';
    const skillBonus = getEffectiveSkillBonus(baseSkillId, characterData, computedModifiers);
    const invRank = Math.min(10, Math.max(0, parseInt(inv.rank ?? inv.level ?? 0, 10) || 0));
    const invMod = parseInt(inv.mod ?? inv.attack_mod ?? 0, 10) || 0;

    // Governing Primary Attribute: Intellect or Wisdom depending on discipline or sheet configuration (never Sub-Attributes Logic/Will!)
    let attrBonus = 0;
    const isMentalOrIllusion = ['Mental', 'Illusion', 'Dimension'].includes(metaInfo?.discipline);
    const primKey = isMentalOrIllusion ? 'attr-intellect' : 'attr-wisdom';

    if (typeof getAttrTotal === 'function') {
      attrBonus = Number(getAttrTotal(primKey)) || 0;
    } else {
      attrBonus = (parseInt(characterData[primKey] ?? 0, 10) || 0) +
        (parseInt(characterData[`${primKey}-mod`] ?? 0, 10) || 0) +
        (computedModifiers?.attrMods?.[primKey] || 0);
    }

    attackMod = skillBonus + attrBonus + invRank + invMod;
    disc = inv.discipline || metaInfo?.discipline || 'Energy';
    subSkillName = inv.subSkill || metaInfo?.subSkill || '';
  }

  const baseDC = parseInt(inv.baseDC || 14, 10);
  const damage = inv.damage || '2d8 Energy';
  const range = inv.range || '60 ft';
  const damageType = inv.damage_type || (damage.includes(' ') ? damage.split(' ').slice(1).join(' ') : disc) || disc;

  const notesParts = [];
  if (inv.resistance) notesParts.push(`Save: ${inv.resistance}`);
  if (inv.area) notesParts.push(`Area: ${inv.area}`);
  if (inv.time) notesParts.push(`Time: ${inv.time}`);
  if (inv.description) {
    const cleanDesc = inv.description.replace(/\r?\n/g, ' ').trim();
    if (cleanDesc && cleanDesc !== name) notesParts.push(cleanDesc.slice(0, 90));
  }

  return {
    id,
    sourceId: inv.id || null,
    name,
    score: attackMod >= 0 ? `+${attackMod}` : `${attackMod}`,
    attackMod,
    mod: attackMod,
    baseDC,
    damage,
    type: damageType,
    range,
    discipline: disc,
    subSkill: subSkillName || metaInfo?.subSkill || '',
    category: isSpecial ? 'special_ability' : 'metaphysics',
    powerType: isSpecial ? 'special_ability' : 'invocation',
    notes: notesParts.join(' • ')
  };
};

/**
 * Universal tactical attack resolver that aggregates and deduplicates:
 * 1. Active Attacks (`characterData.attacks`)
 * 2. Equipped & Inventory Weapons (`weapons`, `weaponry`, `property-weaponry`)
 * 3. Natural Attacks (`features`, `special_abilities`, species traits)
 * 4. Offensive Metaphysics (`invocations`, `awakened`, `special_abilities`)
 * 5. Fallback Unarmed Strike (if empty)
 *
 * @param {object} characterData
 * @param {function} [getAttrTotal]
 * @param {boolean} [isSynthetic]
 * @param {object} [computedModifiers]
 * @returns {Array}
 */
export const resolveAllTacticalAttacks = (characterData = {}, getAttrTotal = null, isSynthetic = false, computedModifiers = null) => {
  const list = [];

  const invWeapons = [
    ...(Array.isArray(characterData.weapons) ? characterData.weapons : []),
    ...(Array.isArray(characterData.weaponry) ? characterData.weaponry : []),
    ...(Array.isArray(characterData['property-weaponry']) ? characterData['property-weaponry'] : [])
  ];

  const metaSources = [
    ...(Array.isArray(characterData.invocations) ? characterData.invocations : []),
    ...(Array.isArray(characterData.awakened) ? characterData.awakened : []),
    ...(Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [])
  ];

  const findMatchingInventoryWeapon = (atk) => {
    if (!atk) return null;
    const atkName = String(atk.name || atk.title || '').trim().toLowerCase();
    const atkWId = atk.weaponId || (typeof atk.id === 'string' && atk.id.startsWith('atk_') ? atk.id.slice(4) : null);
    return invWeapons.find(w => {
      if (!w) return false;
      const wId = typeof w === 'object' ? w.id : null;
      const wName = (typeof w === 'object' ? (w.name || w.title) : String(w)).trim().toLowerCase();
      return (atkWId && wId && String(atkWId) === String(wId)) || (atkName && wName === atkName);
    }) || null;
  };

  const findMatchingMetaSource = (atk) => {
    if (!atk) return null;
    const atkName = String(atk.name || atk.title || '').trim().toLowerCase();
    const atkSId = atk.sourceId || (typeof atk.id === 'string' && atk.id.startsWith('meta_') ? atk.id.slice(5) : null);
    return metaSources.find(m => {
      if (!m) return false;
      const mId = typeof m === 'object' ? m.id : null;
      const mName = (typeof m === 'object' ? (m.name || m.title) : String(m)).trim().toLowerCase();
      return (atkSId && mId && String(atkSId) === String(mId)) || (atkName && mName === atkName);
    }) || null;
  };

  const isAlreadyPresent = (candidate) => {
    if (!candidate) return true;
    const cId = typeof candidate === 'object' ? (candidate.id || candidate.weaponId || candidate.sourceId || candidate.uid) : null;
    const cName = (typeof candidate === 'object' ? (candidate.name || candidate.title) : String(candidate || '')).trim().toLowerCase();
    if (!cName) return true;

    return list.some(existing => {
      if (!existing) return false;
      const eId = existing.id || existing.weaponId || existing.sourceId || existing.uid;
      if (cId && eId) {
        if (eId === cId || eId === `atk_${cId}` || `atk_${eId}` === cId || existing.weaponId === cId || existing.sourceId === cId) {
          return true;
        }
      }
      const eName = (existing.name || existing.title || '').trim().toLowerCase();
      return eName === cName;
    });
  };

  // 1. Primary: Active Attacks from sheet
  if (Array.isArray(characterData.attacks)) {
    characterData.attacks.forEach((atk, idx) => {
      if (!atk || isAlreadyPresent(atk)) return;
      const atkName = atk.name || atk.title || 'Attack';
      const matchedWeapon = findMatchingInventoryWeapon(atk);
      const matchedMeta = findMatchingMetaSource(atk);
      const isWeapon = Boolean(matchedWeapon) || isConventionalWeaponItem(atk) || atk.category === 'weapon';

      let cat = atk.category || 'weapon';
      if (isNaturalAttackTrait(atk)) {
        cat = 'natural';
      } else if (!isWeapon && (atk.category === 'metaphysics' || atk.discipline || matchedMeta)) {
        cat = 'metaphysics';
      } else {
        cat = 'weapon';
      }

      // Skip orphaned metaphysics entries if character has no matching invocation/awakened/special_ability and didn't explicitly create a metaphysics attack with a discipline
      if (cat === 'metaphysics' && !matchedMeta && !atk.discipline && metaSources.length === 0) {
        cat = 'weapon';
      }

      let resolvedMod = 0;
      if (cat === 'weapon') {
        if (atk.isManualScore && (atk.attackMod !== undefined || atk.score !== undefined)) {
          const rawMod = atk.attackMod !== undefined && atk.attackMod !== null && atk.attackMod !== '' ? atk.attackMod : atk.score;
          resolvedMod = parseInt(rawMod, 10) || 0;
        } else {
          // Dynamically compute weapon attack bonus using Primary Attributes + Combat Skill + Modifiers
          const sourceWeapon = matchedWeapon && typeof matchedWeapon === 'object'
            ? { ...matchedWeapon, ...atk, isManualScore: false }
            : { ...atk, isManualScore: false };
          const scoreStr = calculateDefaultAttackScore(sourceWeapon, characterData, getAttrTotal, computedModifiers);
          resolvedMod = parseInt(scoreStr, 10) || 0;
        }
      } else if (cat === 'metaphysics' && matchedMeta) {
        const metaAtk = createAttackFromInvocation(matchedMeta, characterData, getAttrTotal, computedModifiers);
        resolvedMod = metaAtk.attackMod;
      } else {
        const rawMod = atk.attackMod !== undefined && atk.attackMod !== null && atk.attackMod !== ''
          ? atk.attackMod
          : atk.score;
        const parsedMod = parseInt(rawMod, 10);
        resolvedMod = isNaN(parsedMod) ? 0 : parsedMod;
      }

      list.push({
        uid: atk.id || `atk_${idx}`,
        id: atk.id,
        weaponId: atk.weaponId || (matchedWeapon && typeof matchedWeapon === 'object' ? matchedWeapon.id : null) || null,
        name: atkName,
        damage: atk.damage || atk.damageExpr || (matchedWeapon && matchedWeapon.damage) || '1d10',
        attackMod: resolvedMod,
        score: resolvedMod >= 0 ? `+${resolvedMod}` : `${resolvedMod}`,
        range: (atk.range && atk.range !== '-') ? atk.range : ((matchedWeapon && matchedWeapon.range && matchedWeapon.range !== '-') ? matchedWeapon.range : (cat === 'natural' ? 'Melee' : 'Close')),
        type: atk.damage_type || atk.type || (matchedWeapon && (matchedWeapon.damage_type || matchedWeapon.type)) || (cat === 'natural' ? 'Kinetic / Natural' : 'Kinetic'),
        category: cat,
        baseDC: atk.baseDC || (matchedMeta && matchedMeta.baseDC) || null,
        discipline: cat === 'metaphysics' ? (atk.discipline || (matchedMeta && matchedMeta.discipline) || null) : null,
        notes: atk.notes || ''
      });
    });
  }

  // 2. Secondary: Conventional Weapons from Inventory/Property
  invWeapons.forEach((w, idx) => {
    if (!w || isAlreadyPresent(w)) return;
    const wName = typeof w === 'object' ? (w.name || w.title || 'Weapon') : String(w);
    const derivedAtk = typeof w === 'object' ? createAttackFromWeapon(w, characterData, getAttrTotal, computedModifiers) : null;
    const derivedMod = derivedAtk ? (parseInt(derivedAtk.score, 10) || 0) : 0;
    const explicitMod = typeof w === 'object' && w.isManualScore && (w.attackMod !== undefined || w.mod !== undefined)
      ? parseInt(w.attackMod ?? w.mod, 10)
      : null;
    const finalMod = explicitMod !== null && !isNaN(explicitMod) ? explicitMod : derivedMod;

    list.push({
      uid: (typeof w === 'object' && w.id) ? `w_${w.id}` : `w_inv_${idx}`,
      id: typeof w === 'object' ? w.id : undefined,
      weaponId: typeof w === 'object' ? w.id : undefined,
      name: wName,
      damage: (typeof w === 'object' && (w.damage || w.damageExpr)) || derivedAtk?.damage || '1d10',
      attackMod: finalMod,
      score: finalMod >= 0 ? `+${finalMod}` : `${finalMod}`,
      range: (typeof w === 'object' && w.range && w.range !== '-') ? w.range : (derivedAtk?.range || 'Close'),
      type: (typeof w === 'object' && (w.damage_type || w.type)) || derivedAtk?.type || 'Kinetic',
      category: 'weapon',
      notes: derivedAtk?.notes || (typeof w === 'object' ? buildWeaponNotes(w) : '')
    });
  });

  // 3. Natural Attacks from Features, Traits & Special Abilities
  const naturalSources = [
    ...(Array.isArray(characterData.features) ? characterData.features : []),
    ...(Array.isArray(characterData.traits) ? characterData.traits : []),
    ...(Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [])
  ];

  naturalSources.forEach((trait) => {
    if (!trait || !isNaturalAttackTrait(trait) || isAlreadyPresent(trait)) return;
    const natAtk = createAttackFromNaturalTrait(trait, characterData, getAttrTotal, computedModifiers);
    list.push({
      ...natAtk,
      uid: natAtk.id
    });
  });

  // 4. Offensive Metaphysics from Invocations, Awakened & Special Abilities
  metaSources.forEach((inv) => {
    if (!inv || !isOffensiveMetaphysics(inv) || isAlreadyPresent(inv)) return;
    const metaAtk = createAttackFromInvocation(inv, characterData, getAttrTotal, computedModifiers);
    list.push({
      ...metaAtk,
      uid: metaAtk.id
    });
  });

  // 5. Fallback: Unarmed Strike if no weapons, natural attacks or offensive metaphysics exist
  if (list.length === 0) {
    let strVal = 0;
    if (typeof getAttrTotal === 'function') {
      strVal = Number(getAttrTotal('attr-strength')) || 0;
    } else {
      strVal = (parseInt(characterData['attr-strength'] ?? 0, 10) || 0) +
        (parseInt(characterData['attr-strength-mod'] ?? 0, 10) || 0) +
        (computedModifiers?.attrMods?.['attr-strength'] || 0);
    }
    const unarmedSkillBonus = getEffectiveSkillBonus('combat-unarmed', characterData, computedModifiers);
    const globalAttackMod = (computedModifiers?.combatMods?.['attack-mod'] || 0) +
      (parseInt(characterData['attack-mod'] ?? 0, 10) || 0);
    const unarmedAtkMod = strVal + unarmedSkillBonus + globalAttackMod;

    list.push({
      uid: 'unarmed_default',
      name: isSynthetic ? 'Pneumatic Actuator Strike' : 'Unarmed Strike / Brawl',
      damage: isSynthetic ? (strVal !== 0 ? `1d8${strVal > 0 ? `+${strVal}` : strVal}` : '1d8') : (strVal !== 0 ? `1d4${strVal > 0 ? `+${strVal}` : strVal}` : '1d4'),
      attackMod: unarmedAtkMod,
      score: unarmedAtkMod >= 0 ? `+${unarmedAtkMod}` : `${unarmedAtkMod}`,
      range: 'Melee',
      type: 'Kinetic / Natural',
      category: 'natural',
      notes: isSynthetic ? 'Chassis melee strike' : 'Standard unarmed combat'
    });
  }

  return list;
};
