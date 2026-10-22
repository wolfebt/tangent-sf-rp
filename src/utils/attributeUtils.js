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

import { DEFAULT_ARCHETYPES } from '../data/archetypesData.js';
import { DEFAULT_SPECIES } from '../data/speciesData.js';

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

const mapNameToPrimaryAttrKey = (name) => {
  if (!name) return null;
  const lower = String(name).toLowerCase().trim();
  if (lower.startsWith('attr-')) return lower;
  if (lower.includes('strength') || lower.includes('might')) return 'attr-strength';
  if (lower.includes('agility') || lower.includes('reflex')) return 'attr-agility';
  if (lower.includes('stamina') || lower.includes('constitution') || lower.includes('fortitude')) return 'attr-stamina';
  if (lower.includes('intellect') || lower.includes('logic') || lower.includes('reason')) return 'attr-intellect';
  if (lower.includes('wisdom') || lower.includes('will')) return 'attr-wisdom';
  if (lower.includes('charisma') || lower.includes('etiquette')) return 'attr-charisma';
  return null;
};

/**
 * Sanitizes character attributes so that all 6 primary attributes and 6 sub-attributes
 * are initialized and healed to their proper canonical base values if missing, 0, or null.
 * Also heals legacy baked species inherent modifiers and residual archetype attributes.
 * Also keeps alias keys (attr-logic <-> attr-reason, attr-will <-> attr-willpower) in sync.
 * @param {object} charData 
 * @returns {object}
 */
export const sanitizeSubAttributes = (charData) => {
  if (!charData || typeof charData !== 'object') return charData;
  const result = { ...charData };
  let changed = false;

  // Heal legacy baked species inherent modifiers and residual archetype attributes
  const archName = String(result['char-archetype'] || '').trim();
  if (archName && !result._attrHealedV3) {
    const archLower = archName.toLowerCase();
    const archObj = DEFAULT_ARCHETYPES.find(a =>
      (a.name || '').toLowerCase() === archLower ||
      (a.id || '').toLowerCase() === archLower
    );
    const spName = String(result['char-species'] || '').trim();
    const spLower = spName.toLowerCase();
    const spObj = spName
      ? DEFAULT_SPECIES.find(s =>
          (s.name || '').toLowerCase() === spLower ||
          (s.title || '').toLowerCase() === spLower ||
          (s.id || '').toLowerCase() === spLower
        )
      : null;

    if (archObj) {
      const primKey = mapNameToPrimaryAttrKey(archObj.primary_attribute);
      const secKey = mapNameToPrimaryAttrKey(archObj.secondary_attribute);
      if (primKey && secKey) {
        const spMods = {};
        if (spObj && Array.isArray(spObj.inherent_attribute_modifiers)) {
          spObj.inherent_attribute_modifiers.forEach(m => {
            const aName = typeof m === 'object' ? (m.attribute || m.name) : String(m);
            const bonus = typeof m === 'object' ? (m.bonus ?? m.value ?? 1) : 1;
            const k = mapNameToPrimaryAttrKey(aName);
            if (k) spMods[k] = (spMods[k] || 0) + bonus;
          });
        }

        const getPoolPts = (attrKey) => (
          (parseInt(result.speciesAllocations?.attributes?.[attrKey] || 0, 10) || 0) +
          (parseInt(result.occuAllocations?.attributes?.[attrKey] || 0, 10) || 0) +
          (parseInt(result.originAllocations?.attributes?.[attrKey] || 0, 10) || 0) +
          (parseInt(result.factionAllocations?.attributes?.[attrKey] || 0, 10) || 0)
        );

        const getExpectedBase = (attrKey) => (
          getPoolPts(attrKey) +
          (attrKey === primKey ? 3 : 0) +
          (attrKey === secKey ? 2 : 0)
        );

        const curPrim = parseInt(result[primKey] || 0, 10) || 0;
        const curSec = parseInt(result[secKey] || 0, 10) || 0;
        const hasSpMods = Object.values(spMods).some(v => v !== 0);
        const hasBakedSpeciesMods = hasSpMods &&
          curPrim === getExpectedBase(primKey) + (spMods[primKey] || 0) &&
          curSec === getExpectedBase(secKey) + (spMods[secKey] || 0) &&
          ((spMods[primKey] || 0) !== 0 || (spMods[secKey] || 0) !== 0 ||
            SUB_ATTRIBUTE_PAIRS.some(({ prim }) => (spMods[prim] || 0) > 0 && (parseInt(result[prim] || 0, 10) || 0) >= getExpectedBase(prim) + spMods[prim]));

        const hasEmptyArchAlloc = !result.archetypeAllocations?.attributes ||
          Object.keys(result.archetypeAllocations.attributes).length === 0;
        const hasResidualOtherArch = hasEmptyArchAlloc &&
          curPrim === getExpectedBase(primKey) &&
          curSec === getExpectedBase(secKey) &&
          SUB_ATTRIBUTE_PAIRS.some(({ prim }) => prim !== primKey && prim !== secKey && (parseInt(result[prim] || 0, 10) || 0) >= 2 + getPoolPts(prim));

        if (hasBakedSpeciesMods || hasResidualOtherArch) {
          SUB_ATTRIBUTE_PAIRS.forEach(({ sub, alias, prim }) => {
            const oldPVal = parseInt(result[prim] || 0, 10) || 0;
            const oldSubBase = calculateSubAttrBase(oldPVal);
            const curSubVal = parseInt(result[sub], 10);
            const purchasedSubDelta = (!isNaN(curSubVal) && curSubVal > oldSubBase) ? (curSubVal - oldSubBase) : 0;

            const newPVal = getExpectedBase(prim);
            const newSubVal = calculateSubAttrBase(newPVal) + purchasedSubDelta;

            result[prim] = newPVal;
            result[sub] = newSubVal;
            if (alias) {
              result[alias] = newSubVal;
            }
          });
          result.archetypeAllocations = {
            skills: {},
            features: [],
            ...(result.archetypeAllocations || {}),
            attributes: { [primKey]: 3, [secKey]: 2 }
          };
          result._attrHealedV3 = true;
          result._needsCloudHealSave = true;
          changed = true;
        }
      }
    }
  }

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

    if (result[sub] !== resolvedSubVal) {
      result[sub] = resolvedSubVal;
      changed = true;
    }
    if (alias && result[alias] !== resolvedSubVal) {
      result[alias] = resolvedSubVal;
      changed = true;
    }
  });

  return changed ? result : charData;
};
