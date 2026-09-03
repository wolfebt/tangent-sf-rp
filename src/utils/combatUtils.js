/**
 * Combat Utilities for Tangent SF RP
 * Provides conversion, normalization, and smart attack check calculations between
 * inventory items (weapons/armoring) and combat representations (attacks/armor).
 */

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

  // Retrieve attribute modifier or total
  let attrBonus = 0;
  if (typeof getAttrTotal === 'function') {
    const primaryAttr = governingAttr === 'attr-reflex' ? 'attr-agility' : 'attr-strength';
    const subVal = getAttrTotal(governingAttr) || 0;
    const primVal = getAttrTotal(primaryAttr) || 0;
    attrBonus = Math.floor((subVal || primVal || 0) / 2);
  } else {
    const rawVal = parseInt(characterData[governingAttr] || characterData['attr-agility'] || characterData['attr-strength'] || 0, 10);
    attrBonus = Math.floor(rawVal / 2);
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
