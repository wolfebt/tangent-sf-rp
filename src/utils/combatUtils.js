/**
 * Combat Utilities for Tangent SF RP
 * Provides conversion, normalization, and smart attack check calculations between
 * inventory items (weapons/armoring) and combat representations (attacks/armor).
 */
import { resolveMetaSkillForInvocation } from './metaphysicsUtils';


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
 * Calculates a sensible default attack check bonus based on character combat skills and attributes.
 * @param {object} weapon
 * @param {object} characterData
 * @param {function} [getAttrTotal]
 * @returns {string}
 */
export const calculateDefaultAttackScore = (weapon, characterData = {}, getAttrTotal = null) => {
  if (!weapon) return '+0';
  if (weapon.score !== undefined && weapon.score !== null && weapon.score !== '') {
    const s = String(weapon.score).trim();
    return s.startsWith('+') || s.startsWith('-') ? s : `+${s}`;
  }

  const name = (weapon.name || weapon.title || '').toLowerCase();
  const body = (weapon.body || '').toLowerCase();
  const cat = (weapon.category || weapon.weapon_type || '').toLowerCase();
  const dmgType = (weapon.damage_type || weapon.type || '').toLowerCase();

  let governingSkill = 'combat-ballistic';
  let governingAttr = 'attr-reflex';

  // Melee classification
  if (
    body.includes('melee') ||
    cat.includes('melee') ||
    weapon.range === '-' ||
    /\b(sword|blade|knife|axe|dagger|club|mace|hammer|staff|polearm|gauntlet|fist|unarmed|claws|spear|whip|katana|saber|machete)\b/i.test(name)
  ) {
    if (/\b(unarmed|fist|brawl|martial arts)\b/i.test(name)) {
      governingSkill = 'combat-unarmed';
    } else {
      governingSkill = 'combat-melee';
    }
    governingAttr = 'attr-might';
  } else if (
    // Energy classification
    dmgType.includes('energy') ||
    dmgType.includes('plasma') ||
    dmgType.includes('laser') ||
    dmgType.includes('ion') ||
    /\b(blaster|laser|plasma|ion|phaser|disruptor|beam|fusion)\b/i.test(name)
  ) {
    if (/\b(heavy|cannon|bombard|turret)\b/i.test(name)) {
      governingSkill = 'combat-heavy-energy';
      governingAttr = 'attr-might';
    } else {
      governingSkill = 'combat-energy';
      governingAttr = 'attr-reflex';
    }
  } else if (/\b(heavy|machine gun|rocket|missile|mortar|cannon|grenade launcher)\b/i.test(name)) {
    governingSkill = 'combat-heavy-weapons';
    governingAttr = 'attr-might';
  } else if (/\b(bow|crossbow|sling|blowpipe|boomerang)\b/i.test(name)) {
    governingSkill = 'combat-ranged';
    governingAttr = 'attr-reflex';
  } else {
    // Default modern ballistic firearm
    governingSkill = 'combat-ballistic';
    governingAttr = 'attr-reflex';
  }

  // Retrieve skill rank
  let skillRank = 0;
  if (characterData[`skill-${governingSkill}-rank`] !== undefined) {
    skillRank = parseInt(characterData[`skill-${governingSkill}-rank`], 10) || 0;
  } else if (Array.isArray(characterData.skills)) {
    const foundSkill = characterData.skills.find(s => {
      if (typeof s === 'object' && s !== null) {
        return s.id === governingSkill || s.id === governingSkill.replace('combat-', '');
      }
      return false;
    });
    if (foundSkill) {
      skillRank = parseInt(foundSkill.rank ?? foundSkill.value ?? 0, 10) || 0;
    }
  }

  // Retrieve attribute modifier or total (Attribute score is NEVER halved: Skill + Attribute)
  let attrBonus = 0;
  if (typeof getAttrTotal === 'function') {
    const primaryAttr = governingAttr === 'attr-reflex' ? 'attr-agility' : 'attr-strength';
    const subVal = getAttrTotal(governingAttr) || 0;
    const primVal = getAttrTotal(primaryAttr) || 0;
    attrBonus = subVal || primVal || 0;
  } else {
    const rawVal = parseInt(characterData[governingAttr] || characterData['attr-agility'] || characterData['attr-strength'] || 0, 10);
    attrBonus = rawVal;
  }

  const total = skillRank + attrBonus;
  return total >= 0 ? `+${total}` : `${total}`;
};

/**
 * Creates a complete attack object for Active Offensive Capabilities from a weapon item.
 * @param {object} weapon
 * @param {object} [characterData]
 * @param {function} [getAttrTotal]
 * @returns {object}
 */
export const createAttackFromWeapon = (weapon, characterData = {}, getAttrTotal = null) => {
  if (!weapon) {
    return { name: '', score: '+0', damage: '', type: '', notes: '' };
  }
  const name = typeof weapon === 'object' ? (weapon.name || weapon.title || 'Weapon') : String(weapon);
  const id = typeof weapon === 'object' && weapon.id 
    ? `atk_${weapon.id}` 
    : `atk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const damage = typeof weapon === 'object' ? (weapon.damage || '1d10') : '1d10';
  const type = typeof weapon === 'object' ? (weapon.damage_type || weapon.type || 'Kinetic') : 'Kinetic';
  const notes = typeof weapon === 'object' ? buildWeaponNotes(weapon) : '';
  const score = typeof weapon === 'object' && weapon.score !== undefined && weapon.score !== ''
    ? String(weapon.score)
    : calculateDefaultAttackScore(weapon, characterData, getAttrTotal);

  return {
    id,
    weaponId: typeof weapon === 'object' ? (weapon.id || null) : null,
    name,
    score,
    damage,
    type,
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
 * @returns {object}
 */
export const createAttackFromNaturalTrait = (trait, characterData = {}, getAttrTotal = null) => {
  const tObj = typeof trait === 'object' ? trait : { name: String(trait) };
  const name = tObj.name || tObj.title || 'Natural Weapon';
  const id = tObj.id ? `nat_${tObj.id}` : `nat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Attack modifier: Unarmed combat skill + Might/Strength (or Reflex/Agility if finesse)
  const unarmedSkillRank = parseInt(
    characterData['skill-combat-unarmed-rank'] || characterData['skill-unarmed-rank'] || 0,
    10
  );
  let strBonus = 0;
  if (typeof getAttrTotal === 'function') {
    strBonus = getAttrTotal('attr-might') || getAttrTotal('attr-strength') || 0;
  } else {
    strBonus = parseInt(characterData['attr-might'] || characterData['attr-strength'] || 0, 10);
  }
  const attackMod = unarmedSkillRank + strBonus;

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
 * @param {object|string} item
 * @returns {boolean}
 */
export const isOffensiveMetaphysics = (item) => {
  if (!item) return false;
  const obj = typeof item === 'object' ? item : { name: String(item) };
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
 * @returns {object}
 */
export const createAttackFromInvocation = (invocation, characterData = {}, getAttrTotal = null) => {
  const inv = typeof invocation === 'object' ? invocation : { name: String(invocation) };
  const name = inv.name || inv.title || 'Offensive Invocation';
  const id = inv.id ? `meta_${inv.id}` : `meta_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Resolve governing meta skill & discipline
  const metaInfo = resolveMetaSkillForInvocation(inv);
  const baseSkillId = metaInfo?.baseSkillId || 'meta-elemental';
  const skillRank = parseInt(characterData[`skill-${baseSkillId}-rank`] || 0, 10);

  // Governing attribute: Intellect/Logic or Wisdom/Will depending on discipline
  let attrBonus = 0;
  const isMentalOrIllusion = ['Mental', 'Illusion', 'Dimension'].includes(metaInfo?.discipline);
  const attrKey = isMentalOrIllusion ? 'attr-logic' : 'attr-will';
  const primKey = isMentalOrIllusion ? 'attr-intellect' : 'attr-wisdom';

  if (typeof getAttrTotal === 'function') {
    attrBonus = getAttrTotal(attrKey) || getAttrTotal(primKey) || 0;
  } else {
    attrBonus = parseInt(characterData[attrKey] || characterData[primKey] || 0, 10);
  }

  const attackMod = skillRank + attrBonus;
  const baseDC = parseInt(inv.baseDC || 14, 10);
  const damage = inv.damage || '2d8 Energy';
  const range = inv.range || '60 ft';
  const disc = inv.discipline || metaInfo?.discipline || 'Energy';
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
    baseDC,
    damage,
    type: damageType,
    range,
    discipline: disc,
    subSkill: inv.subSkill || metaInfo?.subSkill || '',
    category: 'metaphysics',
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
 * @returns {Array}
 */
export const resolveAllTacticalAttacks = (characterData = {}, getAttrTotal = null, isSynthetic = false) => {
  const list = [];

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
      const rawMod = atk.attackMod !== undefined && atk.attackMod !== null && atk.attackMod !== ''
        ? atk.attackMod
        : atk.score;
      const parsedMod = parseInt(rawMod, 10);

      let cat = atk.category || 'weapon';
      if (isNaturalAttackTrait(atk)) cat = 'natural';
      if (isOffensiveMetaphysics(atk) || atk.discipline) cat = 'metaphysics';

      list.push({
        uid: atk.id || `atk_${idx}`,
        id: atk.id,
        weaponId: atk.weaponId || null,
        name: atkName,
        damage: atk.damage || atk.damageExpr || '1d10',
        attackMod: isNaN(parsedMod) ? 0 : parsedMod,
        range: (atk.range && atk.range !== '-') ? atk.range : (cat === 'natural' ? 'Melee' : 'Close'),
        type: atk.damage_type || atk.type || (cat === 'natural' ? 'Kinetic / Natural' : 'Kinetic'),
        category: cat,
        baseDC: atk.baseDC || null,
        discipline: atk.discipline || null,
        notes: atk.notes || ''
      });
    });
  }

  // 2. Secondary: Conventional Weapons from Inventory/Property
  const invWeapons = [
    ...(Array.isArray(characterData.weapons) ? characterData.weapons : []),
    ...(Array.isArray(characterData.weaponry) ? characterData.weaponry : []),
    ...(Array.isArray(characterData['property-weaponry']) ? characterData['property-weaponry'] : [])
  ];

  invWeapons.forEach((w, idx) => {
    if (!w || isAlreadyPresent(w)) return;
    const wName = typeof w === 'object' ? (w.name || w.title || 'Weapon') : String(w);
    const derivedAtk = typeof w === 'object' ? createAttackFromWeapon(w, characterData, getAttrTotal) : null;
    const derivedMod = derivedAtk ? (parseInt(derivedAtk.score, 10) || 0) : 0;
    const explicitMod = typeof w === 'object' && (w.attackMod !== undefined || w.mod !== undefined)
      ? parseInt(w.attackMod ?? w.mod, 10)
      : null;

    list.push({
      uid: (typeof w === 'object' && w.id) ? `w_${w.id}` : `w_inv_${idx}`,
      id: typeof w === 'object' ? w.id : undefined,
      weaponId: typeof w === 'object' ? w.id : undefined,
      name: wName,
      damage: (typeof w === 'object' && (w.damage || w.damageExpr)) || derivedAtk?.damage || '1d10',
      attackMod: explicitMod !== null && !isNaN(explicitMod) ? explicitMod : derivedMod,
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
    const natAtk = createAttackFromNaturalTrait(trait, characterData, getAttrTotal);
    list.push({
      ...natAtk,
      uid: natAtk.id
    });
  });

  // 4. Offensive Metaphysics from Invocations, Awakened & Special Abilities
  const metaSources = [
    ...(Array.isArray(characterData.invocations) ? characterData.invocations : []),
    ...(Array.isArray(characterData.awakened) ? characterData.awakened : []),
    ...(Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [])
  ];

  metaSources.forEach((inv) => {
    if (!inv || !isOffensiveMetaphysics(inv) || isAlreadyPresent(inv)) return;
    const metaAtk = createAttackFromInvocation(inv, characterData, getAttrTotal);
    list.push({
      ...metaAtk,
      uid: metaAtk.id
    });
  });

  // 5. Fallback: Unarmed Strike if no weapons, natural attacks or offensive metaphysics exist
  if (list.length === 0) {
    let strVal = 0;
    if (typeof getAttrTotal === 'function') {
      strVal = getAttrTotal('attr-might') || getAttrTotal('attr-strength') || 0;
    } else {
      strVal = parseInt(characterData['attr-might'] || characterData['attr-strength'] || 0, 10);
    }
    let agiVal = 0;
    if (typeof getAttrTotal === 'function') {
      agiVal = getAttrTotal('attr-reflex') || getAttrTotal('attr-agility') || 0;
    } else {
      agiVal = parseInt(characterData['attr-reflex'] || characterData['attr-agility'] || 0, 10);
    }

    list.push({
      uid: 'unarmed_default',
      name: isSynthetic ? 'Pneumatic Actuator Strike' : 'Unarmed Strike / Brawl',
      damage: isSynthetic ? `1d8+${strVal}` : `1d4+${strVal}`,
      attackMod: agiVal,
      range: 'Melee',
      type: 'Kinetic / Natural',
      category: 'natural',
      notes: isSynthetic ? 'Chassis melee strike' : 'Standard unarmed combat'
    });
  }

  return list;
};
