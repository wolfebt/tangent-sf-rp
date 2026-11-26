/**
 * @file cortexCollectionMaps.js
 * @description Canonical OmniCortex <-> ADE collection mappings and shared field helpers.
 */

import {
  PROPERTY_SUBCATEGORIES,
  METAPHYSICS_SUBCATEGORIES
} from '../../pages/Foundry/ElementForge/elementSchemas.js';

export const CORTEX_PROPERTY_COLLECTIONS = PROPERTY_SUBCATEGORIES.map(s => s.dbmCollection);
export const CORTEX_METAPHYSICS_COLLECTIONS = METAPHYSICS_SUBCATEGORIES.map(s => s.dbmCollection);

export const COLLECTION_TO_ADE_TYPE = {
  species: 'Species',
  factions: 'Faction',
  weaponry: 'Property',
  armoring: 'Property',
  augmentations: 'Property',
  gear: 'Property',
  mecha: 'Property',
  architecture: 'Property',
  technology: 'Property',
  other: 'Property',
  modular_characters: 'Persona',
  planetary_design: 'World',
  world: 'World',
  universe: 'Universe',
  setting: 'Setting',
  scene: 'Scene',
  philosophy: 'Philosophy',
  invocations: 'Metaphysics',
  disciplines: 'Metaphysics',
  special_abilities: 'Metaphysics'
};

export const ADE_TYPE_TO_CORTEX_COLLECTIONS = {
  Persona: ['modular_characters'],
  Species: ['species'],
  Faction: ['factions'],
  Property: CORTEX_PROPERTY_COLLECTIONS,
  Metaphysics: CORTEX_METAPHYSICS_COLLECTIONS,
  World: ['planetary_design', 'world'],
  Universe: ['universe'],
  Setting: ['setting'],
  Scene: ['scene'],
  Philosophy: ['philosophy']
};

export const COLLECTION_TO_CODEX_MATRIX = {
  species: 'species',
  factions: 'factions',
  weaponry: 'weaponry',
  armoring: 'armor',
  augmentations: 'augmentations',
  gear: 'equipment',
  mecha: 'mecha',
  architecture: 'architecture',
  technology: 'technology',
  other: 'other',
  modular_characters: 'modular-characters',
  planetary_design: 'planetary-design',
  invocations: 'invocation'
};

export const CORTEX_BACKED_ADE_TYPES = new Set(Object.keys(ADE_TYPE_TO_CORTEX_COLLECTIONS));

export const toText = (val) => {
  if (val === undefined || val === null) return '';
  if (Array.isArray(val)) {
    return val
      .map(item => (typeof item === 'object' && item !== null ? (item.name || item.label || item.id || '') : String(item)))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch (_) {
      return '';
    }
  }
  return String(val);
};

export const pickLorebookFieldsFromRecord = (record = {}) => {
  const result = {
    oneLinePitch: record.oneLinePitch || '',
    primaryTriggers: toText(record.primaryTriggers),
    secondaryTriggers: toText(record.secondaryTriggers),
    triggerRegex: record.triggerRegex || '',
    loreSnippet: record.loreSnippet || '',
    loreScanPriority: record.loreScanPriority !== undefined ? String(record.loreScanPriority) : (record.injectionPriority !== undefined ? String(record.injectionPriority) : ''),
    loreBudgetTokens: record.loreBudgetTokens !== undefined ? String(record.loreBudgetTokens) : '',
    loreSuppressCondition: record.loreSuppressCondition || '',
    loreRequireCondition: record.loreRequireCondition || record.conditionExpression || '',
    keywords: toText(record.keywords),
    negative_keywords: toText(record.negative_keywords)
  };
  if (record.triggerLogic !== undefined) result.triggerLogic = record.triggerLogic;
  if (record.speakerFilter !== undefined) result.speakerFilter = record.speakerFilter;
  if (record.loreAutoInject !== undefined) result.loreAutoInject = Boolean(record.loreAutoInject);
  if (record.loreAlwaysActive !== undefined) result.loreAlwaysActive = Boolean(record.loreAlwaysActive);
  if (record.loreCaseSensitive !== undefined) result.loreCaseSensitive = Boolean(record.loreCaseSensitive);
  for (const key of [
    'pairedMapId',
    'weatherPreset',
    'hazardCr',
    'clockGoal',
    'disposition',
    'factionStanding',
    'sensoryTag',
    'threatLevel',
    'costCr',
    'creditValue'
  ]) {
    if (record[key] !== undefined && record[key] !== null) {
      result[key] = typeof record[key] === 'number' ? String(record[key]) : record[key];
    }
  }
  return result;
};

export function buildPlainTextPreview(rawContent = '') {
  if (!rawContent) return '';
  const slice = String(rawContent).slice(0, 260);
  return slice
    .replace(/<[^>]*>/g, ' ')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

export function escapeHtml(str = '') {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildSearchHaystack(el) {
  return [
    el.title,
    el.name,
    el.dbmCategory,
    el.propertySubcategory,
    el.metaphysicsSubcategory,
    el.fields?.oneLinePitch,
    el.fields?.summary,
    el.fields?.archetype,
    el.fields?.discipline,
    el.fields?.faction_type
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function preferField(primaryVal, fallbackVal, emptyDefault = undefined) {
  if (primaryVal !== undefined && primaryVal !== null) {
    if (String(primaryVal).trim() !== '') return primaryVal;
    return emptyDefault !== undefined ? emptyDefault : primaryVal;
  }
  return fallbackVal !== undefined && fallbackVal !== null
    ? fallbackVal
    : (emptyDefault !== undefined ? emptyDefault : '');
}

export function mergePreferNonEmptyFields(projectedFields = {}, pinnedFields = {}) {
  const merged = { ...(projectedFields || {}) };
  for (const [k, v] of Object.entries(pinnedFields || {})) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '' && merged[k] !== undefined && String(merged[k]).trim() !== '') {
      continue;
    }
    if (Array.isArray(v) && v.length === 0 && Array.isArray(merged[k]) && merged[k].length > 0) {
      continue;
    }
    merged[k] = v;
  }
  return merged;
}

export function parseNumericLevel(val, fallback) {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return Number.isFinite(val) ? val : fallback;
  const cleaned = String(val).replace(/^(?:TL|ML|DC|CR|Tier|DR|AP)[\s:-]*/i, '').trim();
  if (!cleaned) return fallback;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}

export function parseOptionalFiniteNumber(val) {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'number') return Number.isFinite(val) ? val : undefined;
  const match = String(val).match(/-?\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : undefined;
}
