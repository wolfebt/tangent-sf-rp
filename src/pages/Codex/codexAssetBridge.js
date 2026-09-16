/**
 * ═══════════════════════════════════════════════════════════════════
 * TANGENT SF RP — CODEX ASSET BRIDGE
 * Bidirectional mapping, schema adaptation, and dataset resolution
 * connecting Folio, Omnicortex DBM, and the Codex Suite.
 * ═══════════════════════════════════════════════════════════════════
 */

import { getMatrixById } from './codexConfig';
import { normalizeOmnicortexItem, exportOmnicortexItem } from '../../utils/tangentSchemaAdapters';

/**
 * Authoritative mapping from Folio tab keys and Omnicortex collections to Codex Matrix IDs.
 */
export const ASSET_COLLECTION_TO_MATRIX_MAP = {
  // Combat & Armaments
  weaponry: 'weaponry',
  weapons: 'weaponry',
  attacks: 'weaponry',
  weapon: 'weaponry',

  // Defensive Systems
  armoring: 'armor',
  armor: 'armor',
  shields: 'armor',

  // Cybernetics & Biotechnology
  augmentations: 'augmentations',
  augmentation: 'augmentations',
  cybernetics: 'augmentations',
  bioware: 'augmentations',

  // Hardware & Gear
  gear: 'equipment',
  equipment: 'equipment',
  items: 'equipment',
  personal_property: 'equipment',

  // Vehicular & Heavy Frames
  mecha: 'mecha',
  vehicles: 'mecha',
  starships: 'mecha',

  // Real Property & Structural Infrastructure
  architecture: 'architecture',
  facilities: 'architecture',
  property: 'architecture',
  stations: 'architecture',

  // Biological & Synthetic Lineages
  species: 'species',
  'char-species': 'species',
  lineages: 'species',

  // Character Traits & Talents
  features: 'features',
  feature: 'features',
  traits: 'features',
  disadvantages: 'features',
  disadvantage: 'features',

  // Meta-Abilities & Psionics
  invocations: 'invocation',
  invocation: 'invocation',
  disciplines: 'invocation',
  awakened: 'invocation',
  special_abilities: 'invocation',
  'meta-tech': 'meta-tech',

  // Worldbuilding & Sociology
  factions: 'factions',
  faction: 'factions',
  'char-faction': 'factions',
  societies: 'factions',
  'planetary-design': 'planetary-design',
  planets: 'planetary-design',
  worlds: 'planetary-design',

  // Characters & NPCs
  modular_characters: 'modular-characters',
  'modular-characters': 'modular-characters',
  archetypes: 'modular-characters',
  'char-archetype': 'modular-characters',
  occupations: 'modular-characters',
  'char-occu': 'modular-characters',
  origins: 'modular-characters',
  'char-origin': 'modular-characters',

  // System Engines
  economatrix: 'economatrix',
  technology: 'technology',
  scaling: 'scaling'
};

/**
 * Resolves the matching Codex Matrix ID for any asset key.
 */
export const getMatrixIdForAssetKey = (key) => {
  if (!key) return null;
  const clean = String(key).toLowerCase().trim();
  return ASSET_COLLECTION_TO_MATRIX_MAP[clean] || null;
};

/**
 * Adapts an incoming item from Folio or Omnicortex DBM into the form state expected by the Codex Matrix.
 */
export const adaptItemToCodexFormData = (item, matrix) => {
  if (!item || typeof item !== 'object') {
    return { ...(matrix.defaultValues || {}), id: `codex_${matrix.id}_${Date.now()}` };
  }

  const base = { ...(matrix.defaultValues || {}), ...item };

  // Harmonize Tech Level
  if (item.tech_level !== undefined && base.tl === undefined) {
    base.tl = item.tech_level;
  }
  if (item.tl !== undefined && base.tech_level === undefined) {
    base.tech_level = item.tl;
  }

  // Harmonize Meta Level
  if (item.meta_level !== undefined && base.ml === undefined) {
    base.ml = item.meta_level;
  }
  if (item.ml !== undefined && base.meta_level === undefined) {
    base.meta_level = item.ml;
  }

  // Harmonize Craft / Build DC for Property matrices
  if (matrix.isProperty || ['architecture', 'weaponry', 'armor', 'equipment', 'mecha', 'augmentations', 'meta-tech'].includes(matrix.id)) {
    const resolvedDc = item.craft_dc ?? item.design_dc ?? item.dc ?? base.craft_dc ?? 15;
    base.craft_dc = Number(resolvedDc) || 15;
  }

  // Harmonize Cost
  if (item.costs && item.costs.credits !== undefined) {
    base.cost = item.costs.credits;
  } else if (item.credits !== undefined) {
    base.cost = item.credits;
  } else if (item.cost_credits !== undefined) {
    base.cost = item.cost_credits;
  }

  // Harmonize Modifications array
  if (Array.isArray(item.modifications)) {
    base.modifications = item.modifications.map(m => typeof m === 'object' ? (m.id || m.name) : m);
  }

  return base;
};

/**
 * Adapts a completed Codex Matrix output into a canonical Omnicortex normalized document.
 */
export const adaptCodexToOmnicortexItem = (formData, computedValues, matrix) => {
  const normalized = normalizeOmnicortexItem(formData);

  const payload = {
    ...exportOmnicortexItem(formData),
    ...normalized,
    name: (formData.name || formData.title || 'Untitled Blueprint').trim(),
    matrix_id: matrix.id,
    matrix_type: matrix.id,
    category: matrix.name,
    _computed: {
      ...(computedValues || {}),
      ...(formData._computed || {}),
      computed_at: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  };

  // Ensure credit cost sync for property matrices
  if (computedValues?.credit_value && !payload.costs.credits) {
    payload.costs.credits = Number(computedValues.credit_value);
    payload.cost = Number(computedValues.credit_value);
  }

  return payload;
};
