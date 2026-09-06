/**
 * @file attributeUtils.js
 * @description Canonical Tangent SF RP Attribute & Sub-Attribute Calculations and Sanitizers
 * 
 * In Tangent SF RP:
 * BaseAttributeScore = 0 (Standard Human)
 * SubAttribute_Base = 2 + (PrimaryAttributeScore * 2)
 * Primary Attributes: Strength, Agility, Stamina, Intellect, Wisdom, Charisma
 * Sub-Attributes (Attribute Checks): Might, Reflex, Fortitude, Reason/Logic, Willpower, Etiquette
 */

export const PRIMARY_TO_SUB_ATTR = {
  'attr-strength': 'attr-might',
  'attr-agility': 'attr-reflex',
  'attr-stamina': 'attr-fortitude',
  'attr-intellect': 'attr-logic',
  'attr-wisdom': 'attr-will',
  'attr-charisma': 'attr-etiquette'
};

export const SUB_TO_PRIMARY_ATTR = {
  'attr-might': 'attr-strength',
  'attr-reflex': 'attr-agility',
  'attr-fortitude': 'attr-stamina',
  'attr-logic': 'attr-intellect',
  'attr-reason': 'attr-intellect',
  'attr-will': 'attr-wisdom',
  'attr-willpower': 'attr-wisdom',
  'attr-etiquette': 'attr-charisma'
};

export const SUB_ATTRIBUTE_PAIRS = [
  { sub: 'attr-might', prim: 'attr-strength', name: 'Might', code: 'MGT' },
  { sub: 'attr-reflex', prim: 'attr-agility', name: 'Reflex', code: 'REF' },
  { sub: 'attr-fortitude', prim: 'attr-stamina', name: 'Fortitude', code: 'FOR' },
  { sub: 'attr-logic', alias: 'attr-reason', prim: 'attr-intellect', name: 'Reason', code: 'LOG' },
  { sub: 'attr-will', alias: 'attr-willpower', prim: 'attr-wisdom', name: 'Willpower', code: 'WIL' },
  { sub: 'attr-etiquette', prim: 'attr-charisma', name: 'Etiquette', code: 'ETI' }
];

/**
 * Calculates canonical sub-attribute base score: 2 + (primaryScore * 2)
 * @param {number|string} primaryVal 
 * @returns {number}
 */
export const calculateSubAttrBase = (primaryVal = 0) => {
  const p = parseInt(primaryVal || 0, 10);
  return (isNaN(p) ? 0 : p) * 2 + 2;
};

/**
 * Resolves the explicit or base score of a sub-attribute check from character data.
 * @param {string} subKey - e.g. 'attr-might', 'attr-reflex', etc.
 * @param {object} charData - Persona sheet object
 * @returns {number}
 */
export const resolveSubAttrScore = (subKey, charData = {}, primaryScoreOverride = null) => {
  if (!subKey || !charData) return 2;
  const primaryKey = SUB_TO_PRIMARY_ATTR[subKey];

  let primaryVal = 0;
  if (primaryScoreOverride !== null && primaryScoreOverride !== undefined && !isNaN(parseInt(primaryScoreOverride, 10))) {
    primaryVal = parseInt(primaryScoreOverride, 10);
  } else if (primaryKey && charData[primaryKey] !== undefined) {
    primaryVal = parseInt(charData[primaryKey] || 0, 10);
  }

  const calculatedBase = calculateSubAttrBase(primaryVal);

  const pairConfig = SUB_ATTRIBUTE_PAIRS.find(p => p.sub === subKey || p.alias === subKey);
  const aliasKey = pairConfig ? (pairConfig.sub === subKey ? pairConfig.alias : pairConfig.sub) : null;

  const rawVal = charData[subKey];
  const aliasVal = aliasKey ? charData[aliasKey] : undefined;

  const numVal = parseInt(rawVal, 10);
  const numAlias = parseInt(aliasVal, 10);

  const explicitVal = (!isNaN(numVal) && numVal > 0)
    ? numVal
    : ((!isNaN(numAlias) && numAlias > 0) ? numAlias : null);

  // If explicit score exceeds the canonical base, it represents purchased bonus points above base
  if (explicitVal !== null && explicitVal > calculatedBase) {
    return explicitVal;
  }

  // Canonical base score: 2 + (Primary * 2) is always the guaranteed minimum
  return calculatedBase;
};

/**
 * Sanitizes character attributes so that all 6 primary attributes and 6 sub-attributes
 * are initialized and healed to their proper canonical base values if missing, 0, or null.
 * Also keeps alias keys (attr-logic <-> attr-reason, attr-will <-> attr-willpower) in sync.
 * @param {object} charData 
 * @returns {object}
 */
export const sanitizeSubAttributes = (charData) => {
  if (!charData || typeof charData !== 'object') return charData;
  const result = { ...charData };

  SUB_ATTRIBUTE_PAIRS.forEach(({ sub, alias, prim }) => {
    const pVal = parseInt(result[prim] || 0, 10);
    const calculatedBase = calculateSubAttrBase(pVal);
    const currentSubVal = parseInt(result[sub], 10);
    const currentAliasVal = alias ? parseInt(result[alias], 10) : NaN;

    let resolvedSubVal;
    if (!isNaN(currentSubVal) && currentSubVal > calculatedBase) {
      resolvedSubVal = currentSubVal;
    } else if (!isNaN(currentAliasVal) && currentAliasVal > calculatedBase) {
      resolvedSubVal = currentAliasVal;
    } else {
      resolvedSubVal = calculatedBase;
    }

    result[sub] = resolvedSubVal;
    if (alias) {
      result[alias] = resolvedSubVal;
    }
  });

  return result;
};
