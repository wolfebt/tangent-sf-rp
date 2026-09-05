/**
 * Prerequisite Evaluator for Tangent SF RP Folio
 * Evaluates whether a character possesses the required attributes, skills,
 * features, or awakened disciplines for any feature, invocation, special ability,
 * or skill specialization.
 */

// Helper to normalize strings for comparison
const normalize = (str) => {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Attribute aliases and primary/sub-attribute mappings
const ATTR_MAP = {
  strength: 'attr-strength',
  str: 'attr-strength',
  might: 'attr-might',
  agility: 'attr-agility',
  agi: 'attr-agility',
  dex: 'attr-agility',
  dexterity: 'attr-agility',
  reflex: 'attr-reflex',
  ref: 'attr-reflex',
  stamina: 'attr-stamina',
  sta: 'attr-stamina',
  con: 'attr-stamina',
  constitution: 'attr-stamina',
  fortitude: 'attr-fortitude',
  fort: 'attr-fortitude',
  intellect: 'attr-intellect',
  int: 'attr-intellect',
  reason: 'attr-logic',
  logic: 'attr-logic',
  wisdom: 'attr-wisdom',
  wis: 'attr-wisdom',
  will: 'attr-will',
  willpower: 'attr-will',
  charisma: 'attr-charisma',
  cha: 'attr-charisma',
  presence: 'attr-etiquette',
  etiquette: 'attr-etiquette'
};

const SUB_TO_PRIMARY = {
  'attr-might': 'attr-strength',
  'attr-reflex': 'attr-agility',
  'attr-fortitude': 'attr-stamina',
  'attr-logic': 'attr-intellect',
  'attr-will': 'attr-wisdom',
  'attr-etiquette': 'attr-charisma'
};

/**
 * Resolves an attribute score for the character, taking into account
 * primary attributes, sub-attributes (base = primary * 2 + 2), and mods.
 */
export const getCharacterAttrScore = (characterData, attrKey) => {
  if (!characterData) return 0;
  const canonicalKey = ATTR_MAP[attrKey.toLowerCase()] || attrKey;
  
  if (SUB_TO_PRIMARY[canonicalKey]) {
    const primaryKey = SUB_TO_PRIMARY[canonicalKey];
    const pVal = parseInt(characterData[primaryKey] || 0, 10);
    const base = (pVal * 2) + 2;
    const hasExplicit = characterData[canonicalKey] !== undefined && characterData[canonicalKey] !== null && characterData[canonicalKey] !== '';
    const val = hasExplicit ? (parseInt(characterData[canonicalKey], 10) || 0) : base;
    const mod = parseInt(characterData[`${canonicalKey}-mod`] || 0, 10) || 0;
    return val + mod;
  }

  const base = parseInt(characterData[canonicalKey] || 0, 10) || 0;
  const mod = parseInt(characterData[`${canonicalKey}-mod`] || 0, 10) || 0;
  return base + mod;
};

/**
 * Resolves a character's skill rank by skill name or ID.
 */
export const getCharacterSkillRank = (characterData, skillNameOrId) => {
  if (!characterData || !skillNameOrId) return 0;
  const targetNorm = normalize(skillNameOrId);

  // 1. Direct key lookups
  if (characterData[`skill-${skillNameOrId}-rank`] !== undefined) {
    return parseInt(characterData[`skill-${skillNameOrId}-rank`], 10) || 0;
  }
  const cleanId = String(skillNameOrId).replace(/^[a-z]+-/, '');
  if (characterData[`skill-${cleanId}-rank`] !== undefined) {
    return parseInt(characterData[`skill-${cleanId}-rank`], 10) || 0;
  }

  // 2. Scan characterData keys matching pattern `skill-*-rank`
  let maxFound = 0;
  Object.keys(characterData).forEach((key) => {
    if (key.startsWith('skill-') && key.endsWith('-rank')) {
      const corePart = key.replace(/^skill-/, '').replace(/-rank$/, '');
      const coreNorm = normalize(corePart);
      const nameKey = key.replace(/-rank$/, '-name');
      const skillName = characterData[nameKey] ? normalize(characterData[nameKey]) : '';
      
      if (coreNorm === targetNorm || skillName === targetNorm || coreNorm.includes(targetNorm) || targetNorm.includes(coreNorm)) {
        const r = parseInt(characterData[key], 10) || 0;
        if (r > maxFound) maxFound = r;
      }
    }
  });

  return maxFound;
};

/**
 * Returns the maximum rank across all skills of a given category or all skills.
 */
export const getMaxSkillRank = (characterData, category = null) => {
  if (!characterData) return 0;
  let maxRank = 0;
  Object.keys(characterData).forEach((key) => {
    if (key.startsWith('skill-') && key.endsWith('-rank')) {
      const r = parseInt(characterData[key], 10) || 0;
      if (r > 0) {
        if (!category) {
          if (r > maxRank) maxRank = r;
        } else {
          const grpKey = key.replace(/-rank$/, '-group');
          const grp = characterData[grpKey] ? characterData[grpKey].toLowerCase() : '';
          const catNorm = category.toLowerCase();
          if (grp.includes(catNorm) || key.includes(catNorm)) {
            if (r > maxRank) maxRank = r;
          }
        }
      }
    }
  });
  return maxRank;
};

/**
 * Checks if the character possesses a specific feature by name.
 */
export const characterHasFeature = (characterData, featureName) => {
  if (!characterData || !featureName) return false;
  const targetNorm = normalize(featureName);
  const rawFeatures = characterData.features;
  const featList = Array.isArray(rawFeatures) 
    ? rawFeatures 
    : (typeof rawFeatures === 'string' && rawFeatures.trim() ? [rawFeatures] : []);

  return featList.some((item) => {
    const name = typeof item === 'object' ? (item.name || item.title || item.id || '') : String(item);
    const nNorm = normalize(name);
    return nNorm === targetNorm || nNorm.includes(targetNorm) || targetNorm.includes(nNorm);
  });
};

/**
 * Checks if a metaphysical discipline is Awakened on the character.
 */
export const isDisciplineAwakened = (characterData, disciplineName) => {
  if (!characterData || !disciplineName) return false;
  const targetNorm = normalize(disciplineName);

  // Check characterData.awakened array
  const rawAwakened = characterData.awakened;
  const awakenedList = Array.isArray(rawAwakened) 
    ? rawAwakened 
    : (typeof rawAwakened === 'string' && rawAwakened.trim() ? [rawAwakened] : []);

  const inAwakened = awakenedList.some((item) => {
    const name = typeof item === 'object' ? (item.name || item.title || item.discipline || '') : String(item);
    const nNorm = normalize(name);
    return nNorm === targetNorm || nNorm.includes(targetNorm) || nNorm.includes('all');
  });
  if (inAwakened) return true;

  // Check characterData.features for "Awakened: [Discipline]"
  return characterHasFeature(characterData, `Awakened: ${disciplineName}`) || 
         characterHasFeature(characterData, `Awakened ${disciplineName}`);
};

/**
 * Main Prerequisite Checker
 * 
 * @param {Object|string} item - The feature, invocation, special ability, or specialization
 * @param {Object} characterData - The active persona character data
 * @param {string} itemType - 'features' | 'invocations' | 'special_abilities' | 'specializations' | 'skills'
 * @param {Object} [options] - Additional context (e.g. baseSkillId for specializations)
 * @returns {Object} { hasPrerequisite, isPossessed, prerequisiteText, unmetReasons }
 */
export const checkPrerequisite = (item, characterData, itemType = 'features', options = {}) => {
  // If no item provided, return default met
  if (!item) {
    return { hasPrerequisite: false, isPossessed: true, prerequisiteText: '', unmetReasons: [] };
  }

  // If no characterData provided (e.g. anonymous browsing outside folio), assume met to avoid breaking UI
  if (!characterData) {
    const rawPrereq = typeof item === 'object' ? (item.prerequisites || item.prereq || '') : '';
    const hasP = Boolean(rawPrereq && rawPrereq !== 'None' && rawPrereq !== '-' && rawPrereq !== '—');
    return { hasPrerequisite: hasP, isPossessed: true, prerequisiteText: rawPrereq || '', unmetReasons: [] };
  }

  const rawItem = typeof item === 'object' ? item : { name: String(item) };
  const typeKey = (itemType || rawItem.category || rawItem.type || 'features').toLowerCase();

  // ══════════════════════════════════════════════════════════════════════════
  // 1. INVOCATIONS PREREQUISITE EVALUATION
  // ══════════════════════════════════════════════════════════════════════════
  if (typeKey.includes('invoc') || rawItem.powerType === 'invocation' || rawItem.isInvocation) {
    const rawPrereq = rawItem.prerequisites || rawItem.prereq;
    const discStr = rawItem.discipline || rawItem.school || '';
    
    // Parse requisite disciplines (e.g. "Entropy + Dimension" or "Energy")
    const requiredDisciplines = discStr
      ? discStr.split(/[+,/]/).map(d => d.trim()).filter(Boolean)
      : [];

    const unmetReasons = [];
    let hasPrereq = false;
    let prereqText = '';

    if (requiredDisciplines.length > 0) {
      hasPrereq = true;
      prereqText = `Awakened (${requiredDisciplines.join(' + ')})`;

      requiredDisciplines.forEach((disc) => {
        if (!isDisciplineAwakened(characterData, disc)) {
          unmetReasons.push(`Requires Awakened Discipline: ${disc}`);
        }
      });
    }

    // Additional explicit prerequisites if provided
    if (rawPrereq && rawPrereq !== 'None' && rawPrereq !== '-' && rawPrereq !== '—') {
      hasPrereq = true;
      prereqText = prereqText ? `${prereqText}, ${rawPrereq}` : rawPrereq;
      const explicitEval = evaluatePrerequisiteString(rawPrereq, characterData);
      if (!explicitEval.isPossessed) {
        unmetReasons.push(...explicitEval.unmetReasons);
      }
    }

    return {
      hasPrerequisite: hasPrereq,
      isPossessed: unmetReasons.length === 0,
      prerequisiteText: prereqText || (hasPrereq ? 'Awakened Discipline' : 'None'),
      unmetReasons
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. SKILL SPECIALIZATIONS PREREQUISITE EVALUATION
  // ══════════════════════════════════════════════════════════════════════════
  if (typeKey.includes('spec') || rawItem.isSpecialization || options.isSpecialization) {
    const baseSkillId = rawItem.baseSkillId || options.baseSkillId || options.skillId;
    const baseSkillName = rawItem.baseSkillName || options.baseSkillName || rawItem.skill || 'Base Skill';
    const rawPrereq = rawItem.prerequisites || rawItem.prereq;
    const unmetReasons = [];

    // Rule: Base skill must be trained (rank >= 1)
    let baseRank = 0;
    if (baseSkillId) {
      baseRank = getCharacterSkillRank(characterData, baseSkillId);
    } else if (baseSkillName) {
      baseRank = getCharacterSkillRank(characterData, baseSkillName);
    }

    if (baseRank < 1) {
      unmetReasons.push(`Requires trained base skill (${baseSkillName || 'Skill'} Rank 1+)`);
    }

    let prereqText = `Trained in ${baseSkillName || 'Base Skill'} (Rank 1+)`;

    // If specialization itself has advanced prerequisites (e.g. Weapon Focus, Rank 6, etc.)
    if (rawPrereq && rawPrereq !== 'None' && rawPrereq !== '-' && rawPrereq !== '—') {
      prereqText = `${prereqText}, ${rawPrereq}`;
      const explicitEval = evaluatePrerequisiteString(rawPrereq, characterData, { baseRank });
      if (!explicitEval.isPossessed) {
        unmetReasons.push(...explicitEval.unmetReasons);
      }
    }

    return {
      hasPrerequisite: true,
      isPossessed: unmetReasons.length === 0,
      prerequisiteText: prereqText,
      unmetReasons
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SPECIAL ABILITIES PREREQUISITE EVALUATION
  // ══════════════════════════════════════════════════════════════════════════
  if (typeKey.includes('special_abil') || rawItem.powerType === 'special_ability') {
    const rawPrereq = rawItem.prerequisites || rawItem.prereq;
    if (!rawPrereq || rawPrereq === 'None' || rawPrereq === '-' || rawPrereq === '—') {
      return {
        hasPrerequisite: false,
        isPossessed: true,
        prerequisiteText: 'None (Inherent Special Ability)',
        unmetReasons: []
      };
    }

    const evalResult = evaluatePrerequisiteString(rawPrereq, characterData);
    return {
      hasPrerequisite: true,
      isPossessed: evalResult.isPossessed,
      prerequisiteText: rawPrereq,
      unmetReasons: evalResult.unmetReasons
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. FEATURES PREREQUISITE EVALUATION (Standard Features Catalog & Traits)
  // ══════════════════════════════════════════════════════════════════════════
  const rawPrereq = rawItem.prerequisites || rawItem.prereq;
  if (!rawPrereq || rawPrereq === 'None' || rawPrereq === 'None.' || rawPrereq === '-' || rawPrereq === '—') {
    return {
      hasPrerequisite: false,
      isPossessed: true,
      prerequisiteText: '',
      unmetReasons: []
    };
  }

  const evalResult = evaluatePrerequisiteString(rawPrereq, characterData);
  return {
    hasPrerequisite: true,
    isPossessed: evalResult.isPossessed,
    prerequisiteText: rawPrereq,
    unmetReasons: evalResult.unmetReasons
  };
};

/**
 * Internal parsing engine for prerequisite strings.
 * Evaluates comma-separated or logical prerequisite clauses.
 */
function evaluatePrerequisiteString(prereqStr, characterData, context = {}) {
  const unmetReasons = [];
  if (!prereqStr || !characterData) {
    return { isPossessed: true, unmetReasons };
  }

  // Clean and split on common delimiters (commas or semicolons)
  const clauses = prereqStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);

  for (const rawClause of clauses) {
    const clause = rawClause.trim();
    if (!clause || clause.toLowerCase() === 'none' || clause === '-') continue;

    // 1. "Must possess base Feature for chosen Save (Lightning Reflexes, Great Fortitude, or Iron Will)"
    if (clause.toLowerCase().includes('lightning reflexes') && clause.toLowerCase().includes('iron will')) {
      const hasAnySave = characterHasFeature(characterData, 'Lightning Reflexes') ||
                         characterHasFeature(characterData, 'Great Fortitude') ||
                         characterHasFeature(characterData, 'Iron Will');
      if (!hasAnySave) {
        unmetReasons.push('Requires Lightning Reflexes, Great Fortitude, or Iron Will');
      }
      continue;
    }

    // 2. "Key Ability Score (Intellect, Wisdom, or Charisma) 1+" or "Key Ability 2"
    if (clause.toLowerCase().includes('key ability')) {
      const numMatch = clause.match(/([0-9]+)/);
      const reqVal = numMatch ? parseInt(numMatch[1], 10) : 1;
      const intScore = getCharacterAttrScore(characterData, 'intellect');
      const wisScore = getCharacterAttrScore(characterData, 'wisdom');
      const chaScore = getCharacterAttrScore(characterData, 'charisma');
      const maxKey = Math.max(intScore, wisScore, chaScore);
      if (maxKey < reqVal) {
        unmetReasons.push(`Key Ability Score (INT, WIS, or CHA) must be ${reqVal}+ (Current: ${maxKey})`);
      }
      continue;
    }

    // 3. Attribute requirement (e.g. "Stamina 1", "Agility 2", "Agi 4", "Might 2", "Charisma 3")
    const attrRegex = /\b(strength|str|might|agility|agi|dex|reflex|stamina|sta|con|fortitude|fort|intellect|int|reason|logic|wisdom|wis|willpower|will|charisma|cha|presence|etiquette)\s*[:=]?\s*([0-9]+)\b/i;
    const attrMatch = clause.match(attrRegex);
    if (attrMatch) {
      const attrName = attrMatch[1];
      const reqVal = parseInt(attrMatch[2], 10);
      const currentVal = getCharacterAttrScore(characterData, attrName);
      if (currentVal < reqVal) {
        unmetReasons.push(`${attrName.toUpperCase()} must be ${reqVal}+ (Current: ${currentVal})`);
      }
      continue;
    }

    // 4. "Attune 1", "Attune 6", "Attune 11", "Attune 16"
    const attuneMatch = clause.match(/\battune\s*([0-9]+)\b/i);
    if (attuneMatch) {
      const reqRank = parseInt(attuneMatch[1], 10);
      const curRank = getCharacterSkillRank(characterData, 'skill-meta-attune') || 
                      getCharacterSkillRank(characterData, 'attune');
      if (curRank < reqRank) {
        unmetReasons.push(`Attune Skill Rank must be ${reqRank}+ (Current: ${curRank})`);
      }
      continue;
    }

    // 5. "Combat Skill 6", "Combat Skill 1", "Combat Rank 4"
    const combatSkillMatch = clause.match(/\bcombat\s*(?:skill|rank)?\s*([0-9]+)\b/i);
    if (combatSkillMatch) {
      const reqRank = parseInt(combatSkillMatch[1], 10);
      const maxCombat = getMaxSkillRank(characterData, 'combat');
      if (maxCombat < reqRank) {
        unmetReasons.push(`Combat Skill must be Rank ${reqRank}+ (Highest: ${maxCombat})`);
      }
      continue;
    }

    // 6. "Skill 6", "Skill 11", "Skill 16", "Chosen Skill 1", "Chosen Skill Rank 6"
    const genericSkillMatch = clause.match(/\b(?:chosen\s*)?skill\s*(?:rank\s*)?([0-9]+)\b/i);
    if (genericSkillMatch) {
      const reqRank = parseInt(genericSkillMatch[1], 10);
      const maxAny = context.baseRank !== undefined ? context.baseRank : getMaxSkillRank(characterData);
      if (maxAny < reqRank) {
        unmetReasons.push(`Requires Skill Rank ${reqRank}+ (Current highest: ${maxAny})`);
      }
      continue;
    }

    // 7. Specific named skill check (e.g. "Pilot 6", "Diplomacy 6", "Academics 5", "Knowledge 5", "Crafting 6")
    const namedSkillMatch = clause.match(/\b(pilot|diplomacy|academics|knowledge|medicine|survival|crafting|stealth|investigation|computers|language|tactics|technology|trade|athletics|acrobatics|unarmed combat|firearms)\s*([0-9]+)\b/i);
    if (namedSkillMatch) {
      const sName = namedSkillMatch[1];
      const reqRank = parseInt(namedSkillMatch[2], 10);
      const curRank = getCharacterSkillRank(characterData, sName);
      if (curRank < reqRank) {
        unmetReasons.push(`${sName} Rank must be ${reqRank}+ (Current: ${curRank})`);
      }
      continue;
    }

    // 8. Awakened requirement (e.g. "Awakened (Energy)", "Awakened")
    if (clause.toLowerCase().includes('awakened')) {
      const discMatch = clause.match(/awakened\s*\(([^)]+)\)/i);
      const disc = discMatch ? discMatch[1].trim() : null;
      if (disc) {
        if (!isDisciplineAwakened(characterData, disc)) {
          unmetReasons.push(`Requires Awakened Discipline: ${disc}`);
        }
      } else {
        const rawAwakened = characterData.awakened;
        const hasAnyAwakened = (Array.isArray(rawAwakened) && rawAwakened.length > 0) ||
                               characterHasFeature(characterData, 'Awakened');
        if (!hasAnyAwakened) {
          unmetReasons.push('Requires at least one Awakened Discipline');
        }
      }
      continue;
    }

    // 9. Feature requirement fallback: Check if the character possesses this named feature
    // Clean string from notes like "(Trained)", "(or Agi 4)", etc.
    const cleanFeatureName = clause.replace(/\([^)]*\)/g, '').trim();
    if (cleanFeatureName && cleanFeatureName.length > 2) {
      // Handle "X or Y" (e.g. "Ambidextrous or Agi 4")
      if (cleanFeatureName.toLowerCase().includes(' or ')) {
        const orParts = cleanFeatureName.split(/\sor\s/i).map(p => p.trim());
        const anyMet = orParts.some(part => {
          const subEval = evaluatePrerequisiteString(part, characterData);
          return subEval.isPossessed;
        });
        if (!anyMet) {
          unmetReasons.push(`Requires: ${clause}`);
        }
        continue;
      }

      // Feature match lookup
      const hasFeat = characterHasFeature(characterData, cleanFeatureName);
      if (!hasFeat) {
        unmetReasons.push(`Missing Feature: ${cleanFeatureName}`);
      }
    }
  }

  return {
    isPossessed: unmetReasons.length === 0,
    unmetReasons
  };
}

export default {
  checkPrerequisite,
  getCharacterAttrScore,
  getCharacterSkillRank,
  characterHasFeature,
  isDisciplineAwakened
};
