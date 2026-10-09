/**
 * Prerequisite Evaluator for Tangent SF RP Folio
 * Evaluates whether a character possesses the required attributes, skills,
 * features, or awakened disciplines for any feature, invocation, special ability,
 * or skill specialization.
 */

import {
  getAugmentationStage,
  checkAugmentationStageCompatibility
} from '../engines/tangentComplexEngines.js';
import {
  calculateCreditValue,
  calculateLiquidityGap,
  calculateCharacterWealth,
  getFinancialStatus
} from '../engines/tangentEconEngine.js';

export const PROPERTY_COLLECTIONS = new Set([
  'weaponry',
  'weapons',
  'armoring',
  'armor',
  'gear',
  'equipment',
  'items',
  'mecha',
  'mech',
  'architecture',
  'structures',
  'other',
  'misc',
  'property'
]);

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
 * Resolves the operational/complexity Cost DC (Crafting DC / Purchase DC) for an item.
 * Follows the Golden Rule of Tangent Wealth: Purchase DC = Crafting DC = Cost DC.
 * Uses explicit DC fields, or calculates from credit cost via TSC inverse formula:
 * DC = round(2.5 * log2(max(10, Credits) / 10))
 * @param {object} item - Catalog or inventory item
 * @returns {number} Cost DC (integer >= 0)
 */
export function resolveItemCostDC(item) {
  if (!item || typeof item !== 'object') return 10;
  if (item.craft_dc !== undefined && item.craft_dc !== null && item.craft_dc !== '') {
    return Math.max(0, parseInt(item.craft_dc, 10) || 0);
  }
  if (item.craftDc !== undefined && item.craftDc !== null && item.craftDc !== '') {
    return Math.max(0, parseInt(item.craftDc, 10) || 0);
  }
  if (item.cost_dc !== undefined && item.cost_dc !== null && item.cost_dc !== '') {
    return Math.max(0, parseInt(item.cost_dc, 10) || 0);
  }
  if (item.purchase_dc !== undefined && item.purchase_dc !== null && item.purchase_dc !== '') {
    return Math.max(0, parseInt(item.purchase_dc, 10) || 0);
  }
  if (item.dc !== undefined && item.dc !== null && item.dc !== '') {
    return Math.max(0, parseInt(item.dc, 10) || 0);
  }
  const cr = item.costs?.credits ?? item.creditCost ?? item.credit_cost ?? item.credits ?? item.cost ?? item.price;
  if (cr !== undefined && cr !== null && cr !== '') {
    const numCr = Math.max(0, Number(cr) || 0);
    return Math.max(0, Math.round(2.5 * Math.log2(Math.max(10, numCr) / 10)));
  }
  if (item.cp !== undefined && item.cp !== null && item.cp !== '') {
    return Math.max(0, Math.round((Number(item.cp) || 0) * 2));
  }
  return 10; // Default baseline DC 10 (160 Cr) for standard equipment
}

/**
 * Resolves a character's Wealth Score (WS) from live Folio character data or derived stats.
 * Falls back to calculateCharacterWealth(characterData).computedWS.
 * @param {object} characterData - Folio character data
 * @returns {number} Wealth Score
 */
export function getCharacterWealthScore(characterData) {
  if (!characterData) return 10;
  if (characterData['wealth-score-override'] !== undefined && characterData['wealth-score-override'] !== null && characterData['wealth-score-override'] !== '') {
    return Math.max(0, parseInt(characterData['wealth-score-override'], 10) || 0);
  }
  if (characterData.wealthScoreOverride !== undefined && characterData.wealthScoreOverride !== null && characterData.wealthScoreOverride !== '') {
    return Math.max(0, parseInt(characterData.wealthScoreOverride, 10) || 0);
  }
  if (characterData.wealthScore !== undefined && characterData.wealthScore !== null && characterData.wealthScore !== '') {
    return Math.max(0, parseInt(characterData.wealthScore, 10) || 0);
  }
  if (characterData['wealth-score'] !== undefined && characterData['wealth-score'] !== null && characterData['wealth-score'] !== '') {
    return Math.max(0, parseInt(characterData['wealth-score'], 10) || 0);
  }
  const calc = calculateCharacterWealth(characterData);
  return calc.computedWS ?? 10;
}

/**
 * Evaluates the Wealth Score prerequisite for property assets (weaponry, armoring, gear, mecha, architecture, other).
 * Adheres to The Golden Rule of Tangent Wealth:
 * - If Item Cost DC <= Wealth Score: Prerequisite is MET (Auto-Buy).
 * - If Item Cost DC > Wealth Score: Prerequisite is UNMET (Liquidity Gap).
 * Returns full gap analytics and flags canOverrideWithDebt: true for credit debt financing override.
 * @param {object} item - Catalog or inventory item
 * @param {object} characterData - Folio character data
 * @returns {{
 *   hasPrerequisite: boolean,
 *   isPossessed: boolean,
 *   isAutoBuy: boolean,
 *   itemDC: number,
 *   playerWS: number,
 *   gapCost: number,
 *   itemCreditValue: number,
 *   autoBuyLimit: number,
 *   prerequisiteText: string,
 *   unmetReasons: string[],
 *   canOverrideWithDebt: boolean
 * }}
 */
export function checkPropertyWealthPrerequisite(item, characterData) {
  const itemDC = resolveItemCostDC(item);
  const playerWS = getCharacterWealthScore(characterData);
  const gapInfo = calculateLiquidityGap(itemDC, playerWS);
  const isAutoBuy = itemDC <= playerWS;
  const unmetReasons = [];

  if (!isAutoBuy) {
    unmetReasons.push(
      `Item Cost DC ${itemDC} exceeds Wealth Score ${playerWS} (Liquidity Gap: ${gapInfo.liquidGapCost.toLocaleString()} Cr; Auto-Buy Limit: ${gapInfo.playerWSValue.toLocaleString()} Cr)`
    );
  }

  // Also evaluate any explicit textual prerequisites specified by the item (e.g. "Proficiency", "Stamina 2", etc.)
  const rawPrereq = typeof item === 'object' ? (item.prerequisites || item.prereq || '') : '';
  if (rawPrereq && rawPrereq !== 'None' && rawPrereq !== '-' && rawPrereq !== '—') {
    const explicitEval = evaluatePrerequisiteString(rawPrereq, characterData);
    if (!explicitEval.isPossessed) {
      unmetReasons.push(...explicitEval.unmetReasons);
    }
  }

  const prereqText = isAutoBuy
    ? `Cost DC ${itemDC} ≤ WS ${playerWS} (Auto-Buy)`
    : `Cost DC ${itemDC} > WS ${playerWS} (Liquidity Gap: ${gapInfo.liquidGapCost.toLocaleString()} Cr)`;

  return {
    hasPrerequisite: true,
    isPossessed: isAutoBuy && unmetReasons.length === 0,
    isAutoBuy,
    itemDC,
    playerWS,
    gapCost: gapInfo.liquidGapCost,
    itemCreditValue: gapInfo.itemValue,
    autoBuyLimit: gapInfo.playerWSValue,
    prerequisiteText: rawPrereq ? `${prereqText}, ${rawPrereq}` : prereqText,
    unmetReasons,
    canOverrideWithDebt: true
  };
}

/**
 * Main Prerequisite Checker
 * 
 * @param {Object|string} item - The feature, invocation, special ability, or specialization
 * @param {Object} characterData - The active persona character data
 * @param {string} itemType - 'features' | 'invocations' | 'special_abilities' | 'specializations' | 'skills' | property collections
 * @param {Object} [options] - Additional context (e.g. baseSkillId for specializations)
 * @returns {Object} { hasPrerequisite, isPossessed, prerequisiteText, unmetReasons }
 */
export const checkPrerequisite = (item, characterData, itemType = 'features', options = {}) => {
  // If no item provided, return default met
  if (!item) {
    return { hasPrerequisite: false, isPossessed: true, prerequisiteText: '', unmetReasons: [] };
  }

  const rawItem = typeof item === 'object' ? item : { name: String(item) };
  const typeKey = (itemType || rawItem.category || rawItem.type || 'features').toLowerCase();

  // ══════════════════════════════════════════════════════════════════════════
  // SPECIES: Species NEVER have prerequisites under any circumstances
  // ══════════════════════════════════════════════════════════════════════════
  if (
    typeKey === 'species' ||
    typeKey.startsWith('species') ||
    rawItem.category === 'species' ||
    rawItem.type === 'species' ||
    rawItem.parent_species !== undefined ||
    (typeof rawItem.id === 'string' && rawItem.id.startsWith('species-'))
  ) {
    return {
      hasPrerequisite: false,
      isPossessed: true,
      prerequisiteText: '',
      unmetReasons: []
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PROPERTY ASSETS: WEAPONRY, ARMORING, GEAR, MECHA, ARCHITECTURE, OTHER
  // ══════════════════════════════════════════════════════════════════════════
  const isProperty = PROPERTY_COLLECTIONS.has(typeKey) ||
    Boolean(rawItem.isProperty || rawItem.isWeapon || rawItem.isArmor ||
      PROPERTY_COLLECTIONS.has(String(rawItem.category || '').toLowerCase()));

  if (isProperty) {
    if (!characterData) {
      const itemDC = resolveItemCostDC(rawItem);
      return {
        hasPrerequisite: true,
        isPossessed: true,
        isAutoBuy: true,
        itemDC,
        playerWS: 10,
        gapCost: 0,
        itemCreditValue: calculateCreditValue(itemDC),
        autoBuyLimit: calculateCreditValue(10),
        prerequisiteText: `Cost DC ${itemDC} (Auto-Buy Baseline)`,
        unmetReasons: [],
        canOverrideWithDebt: true
      };
    }
    return checkPropertyWealthPrerequisite(rawItem, characterData);
  }

  const isAugmentation = typeKey.includes('aug') || rawItem.category === 'augmentations' || rawItem.isAugmentation;

  // If no characterData provided (e.g. anonymous browsing outside folio), assume met to avoid breaking UI
  if (!characterData) {
    if (isAugmentation) {
      const stage = getAugmentationStage(rawItem);
      const isNegligible = stage === 'Negligible';
      let reqFeature = 'Augmented';
      if (stage === 'Heavy') reqFeature = 'Heavy Augmentations';
      if (stage === 'Extreme') reqFeature = 'Extreme Augmentations';
      return {
        hasPrerequisite: !isNegligible,
        isPossessed: true,
        prerequisiteText: isNegligible ? 'None (Negligible Stage)' : `${reqFeature} (Stage: ${stage})`,
        unmetReasons: [],
        stage
      };
    }
    const rawPrereq = typeof item === 'object' ? (item.prerequisites || item.prereq || '') : '';
    const hasP = Boolean(rawPrereq && rawPrereq !== 'None' && rawPrereq !== '-' && rawPrereq !== '—');
    return { hasPrerequisite: hasP, isPossessed: true, prerequisiteText: rawPrereq || '', unmetReasons: [] };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 0. AUGMENTATIONS PREREQUISITE EVALUATION (Stage Matrix & Feature Prereqs)
  // ══════════════════════════════════════════════════════════════════════════
  if (isAugmentation) {
    const stage = getAugmentationStage(rawItem);
    const rawPrereq = rawItem.prerequisites || rawItem.prereq;
    const unmetReasons = [];

    if (stage === 'Negligible') {
      if (rawPrereq && rawPrereq !== 'None' && rawPrereq !== '-' && rawPrereq !== '—') {
        const explicitEval = evaluatePrerequisiteString(rawPrereq, characterData);
        return {
          hasPrerequisite: true,
          isPossessed: explicitEval.isPossessed,
          prerequisiteText: rawPrereq,
          unmetReasons: explicitEval.unmetReasons,
          stage
        };
      }
      return {
        hasPrerequisite: false,
        isPossessed: true,
        prerequisiteText: 'None (Negligible Stage)',
        unmetReasons: [],
        stage
      };
    }

    // Standard, Heavy, Extreme stages require the corresponding feature
    const compatibility = checkAugmentationStageCompatibility(characterData, rawItem);
    if (!compatibility.isCompatible) {
      unmetReasons.push(
        compatibility.warning ||
        `Requires "${compatibility.requiredFeatureName}" feature (Stage: ${stage})`
      );
    }

    // Also check if character has the feature but violates base stat prereq (e.g. Stamina 2+ for Heavy, 4+ for Extreme)
    if (compatibility.stageInfo?.prerequisiteWarnings?.length > 0 && compatibility.isCompatible) {
      unmetReasons.push(...compatibility.stageInfo.prerequisiteWarnings);
    }

    // Explicit prerequisite evaluation if item specifies extra conditions
    if (rawPrereq && rawPrereq !== 'None' && rawPrereq !== '-' && rawPrereq !== '—') {
      const explicitEval = evaluatePrerequisiteString(rawPrereq, characterData);
      if (!explicitEval.isPossessed) {
        unmetReasons.push(...explicitEval.unmetReasons);
      }
    }

    const prereqText = compatibility.requiredFeatureName
      ? `${compatibility.requiredFeatureName} (Stage: ${stage})`
      : `Stage: ${stage}`;

    return {
      hasPrerequisite: true,
      isPossessed: unmetReasons.length === 0,
      prerequisiteText: rawPrereq ? `${prereqText}, ${rawPrereq}` : prereqText,
      unmetReasons,
      stage,
      compatibility
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. INVOCATIONS & SPECIAL ABILITIES PREREQUISITE EVALUATION
  // ══════════════════════════════════════════════════════════════════════════
  const isItemSpecialAbility = Boolean(
    rawItem.isSpecialAbility ||
    rawItem.is_special_ability ||
    rawItem.powerType === 'special_ability' ||
    rawItem.category === 'Special Ability' ||
    rawItem.type === 'Special Ability' ||
    rawItem.traitType === 'special_ability' ||
    typeKey.includes('special_abil')
  );

  if (isItemSpecialAbility) {
    const rawPrereq = rawItem.prerequisites || rawItem.prereq;
    if (!rawPrereq || rawPrereq === 'None' || rawPrereq === '-' || rawPrereq === '—') {
      return {
        hasPrerequisite: false,
        isPossessed: true,
        prerequisiteText: 'None (Stand-Alone Special Ability)',
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
  if ((typeKey.includes('specializ') || typeKey === 'specialization' || typeKey === 'specializations') || rawItem.isSpecialization || options.isSpecialization) {
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
  isDisciplineAwakened,
  resolveItemCostDC,
  getCharacterWealthScore,
  checkPropertyWealthPrerequisite,
  PROPERTY_COLLECTIONS
};
