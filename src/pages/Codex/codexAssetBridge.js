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
  species_type: 'species_type',
  species_types: 'species_type',
  types: 'species_type',
  chassis: 'species_type',
  species_size: 'species_size',
  species_sizes: 'species_size',
  sizes: 'species_size',
  species_movement: 'species_movement',
  species_movements: 'species_movement',
  movements: 'species_movement',
  paces: 'species_movement',

  // Biological Traits & Character Talents
  traits: 'traits',
  trait: 'traits',
  species_traits: 'traits',
  features: 'features',
  feature: 'features',

  // Hindrances & Disadvantages
  disadvantages: 'disadvantages',
  disadvantage: 'disadvantages',
  species_disadvantages: 'disadvantages',
  hindrances: 'disadvantages',

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
  archetypes: 'archetypes',
  archetype: 'archetypes',
  'char-archetype': 'archetypes',
  occupations: 'occupations',
  occupation: 'occupations',
  'char-occu': 'occupations',
  career: 'occupations',
  careers: 'occupations',
  origins: 'origins',
  origin: 'origins',
  'char-origin': 'origins',
  homeworld: 'origins',
  homeworlds: 'origins',

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

  // Harmonize Species Chassis Type
  if (matrix.id === 'species') {
    const rawChassis = item.species_type || (Array.isArray(item.type) ? item.type[0] : item.type) || base.species_type || 'Humanoid';
    const cleanChassis = typeof rawChassis === 'string' && rawChassis.startsWith('species_type-')
      ? rawChassis.replace('species_type-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : rawChassis;
    base.species_type = cleanChassis;
    base.type = cleanChassis;
  }

  // Harmonize Occupations Fields
  if (matrix.id === 'occupations') {
    base.recommended_features = item.recommended_features || item.features || base.recommended_features || [];
    base.features = base.recommended_features;
    base.professional_skills = item.professional_skills || base.professional_skills || [];
    base.traits = item.traits || base.traits || [];
    base.archetypes = item.archetypes || base.archetypes || [];
    base.field = item.field || base.field || 'General / Other';
    base.skill_points = Number(item.skill_points || base.skill_points || 20);
  }

  // Harmonize Archetypes Fields
  if (matrix.id === 'archetypes') {
    base.sphere = item.sphere || base.sphere || 'Sentinels (The Stabilizers)';
    base.primary_attribute = item.primary_attribute || base.primary_attribute || 'Intellect';
    base.secondary_attribute = item.secondary_attribute || base.secondary_attribute || 'Charisma';
    base.essential_skills = item.essential_skills || base.essential_skills || [];
    base.signature_features = item.signature_features || base.signature_features || [];
    base.recommended_occupations = item.recommended_occupations || base.recommended_occupations || [];
    base.recommended_origins = item.recommended_origins || base.recommended_origins || [];
    base.recommended_factions = item.recommended_factions || base.recommended_factions || [];
    base.bp_chassis = Number(item.bp_chassis || base.bp_chassis || 80);
    base.quote = item.quote || base.quote || '';
    base.core_concept = item.core_concept || base.core_concept || '';
    base.tactical_role = item.tactical_role || base.tactical_role || '';
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
    _computed: matrix.isProperty ? {
      ...(computedValues || {}),
      ...(formData._computed || {}),
      computed_at: new Date().toISOString()
    } : { computed_at: new Date().toISOString() },
    updatedAt: new Date().toISOString()
  };

  // Ensure species chassis type is synchronized
  if (matrix.id === 'species') {
    const chassis = formData.species_type || formData.type || 'Humanoid';
    payload.species_type = chassis;
    payload.type = chassis;
  }

  // Ensure credit cost sync strictly for property matrices
  if (matrix.isProperty && computedValues?.credit_value && payload.costs && !payload.costs.credits) {
    payload.costs.credits = Number(computedValues.credit_value);
    payload.cost = Number(computedValues.credit_value);
  }

  return payload;
};
