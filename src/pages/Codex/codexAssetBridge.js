/**
 * ═══════════════════════════════════════════════════════════════════
 * TANGENT SF RP — CODEX ASSET BRIDGE
 * Bidirectional mapping, schema adaptation, and dataset resolution
 * connecting Folio, Omnicortex DBM, and the Codex Suite.
 * ═══════════════════════════════════════════════════════════════════
 */

import { getMatrixById } from './codexConfig.js';
import { normalizeOmnicortexItem, exportOmnicortexItem } from '../../utils/tangentSchemaAdapters.js';

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

  // Personal Property & Miscellaneous
  other: 'other',
  other_property: 'other',
  commodities: 'other',
  trade_goods: 'other',

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
  skills: 'skills',
  skill: 'skills',

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

const parseListField = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  return [];
};

/**
 * Adapts an incoming item from Folio or Omnicortex DBM into the form state expected by the Codex Matrix.
 */
export const adaptItemToCodexFormData = (item, matrix) => {
  const resolvedMatrix = typeof matrix === 'string' ? getMatrixById(matrix) : (matrix || {});
  if (!item || typeof item !== 'object') {
    return { ...(resolvedMatrix.defaultValues || {}), id: `codex_${resolvedMatrix.id || 'item'}_${Date.now()}` };
  }

  const base = { ...(resolvedMatrix.defaultValues || {}), ...item };

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
  if (resolvedMatrix.isProperty || ['architecture', 'weaponry', 'armor', 'equipment', 'mecha', 'augmentations', 'meta-tech', 'other'].includes(resolvedMatrix.id)) {
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

  // Harmonize Species Chassis Type & Size
  if (resolvedMatrix.id === 'species') {
    const rawChassis = item.species_type || (Array.isArray(item.type) ? item.type[0] : item.type) || base.species_type || 'Humanoid';
    const cleanChassis = typeof rawChassis === 'string' && rawChassis.startsWith('species_type-')
      ? rawChassis.replace('species_type-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : (Array.isArray(rawChassis) ? rawChassis[0] : rawChassis);
    base.species_type = cleanChassis || 'Humanoid';
    base.type = cleanChassis || 'Humanoid';

    const rawSize = item.size || item.species_size || base.size || 'Medium';
    const firstSize = Array.isArray(rawSize) ? rawSize[0] : (typeof rawSize === 'object' && rawSize !== null ? (rawSize.name || rawSize.value || rawSize.id) : rawSize);
    const cleanSize = typeof firstSize === 'string' && firstSize.startsWith('species_size-')
      ? firstSize.replace('species_size-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : firstSize;
    base.size = cleanSize || 'Medium';
    base.species_size = cleanSize || 'Medium';

    // Recommendations & AI Guidance Keywords
    base.recommended_factions = parseListField(item.recommended_factions || base.recommended_factions);
    base.recommended_origins = parseListField(item.recommended_origins || base.recommended_origins);
    base.recommended_occupations = parseListField(item.recommended_occupations || base.recommended_occupations);
    base.recommended_skills = parseListField(item.recommended_skills || base.recommended_skills);
    base.recommended_features = parseListField(item.recommended_features || base.recommended_features);
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Factions Fields
  if (resolvedMatrix.id === 'factions') {
    base.recommended_species = parseListField(item.recommended_species || base.recommended_species);
    base.recommended_origins = parseListField(item.recommended_origins || base.recommended_origins);
    base.recommended_occupations = parseListField(item.recommended_occupations || base.recommended_occupations);
    base.recommended_skills = parseListField(item.recommended_skills || base.recommended_skills);
    base.recommended_features = parseListField(item.recommended_features || base.recommended_features);
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Origins Fields
  if (resolvedMatrix.id === 'origins') {
    base.recommended_species = parseListField(item.recommended_species || base.recommended_species);
    base.recommended_factions = parseListField(item.recommended_factions || base.recommended_factions);
    base.recommended_occupations = parseListField(item.recommended_occupations || base.recommended_occupations);
    base.recommended_skills = parseListField(item.recommended_skills || base.recommended_skills);
    base.recommended_features = parseListField(item.recommended_features || base.recommended_features);
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Occupations Fields
  if (resolvedMatrix.id === 'occupations') {
    base.recommended_species = parseListField(item.recommended_species || base.recommended_species);
    base.recommended_factions = parseListField(item.recommended_factions || base.recommended_factions);
    base.recommended_origins = parseListField(item.recommended_origins || base.recommended_origins);
    base.recommended_skills = parseListField(item.recommended_skills || base.recommended_skills);
    base.recommended_features = parseListField(item.recommended_features || item.features || base.recommended_features);
    base.features = base.recommended_features;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
    base.professional_skills = item.professional_skills || base.professional_skills || [];
    base.traits = item.traits || base.traits || [];
    base.archetypes = item.archetypes || base.archetypes || [];
    base.field = item.field || base.field || 'General / Other';
    base.skill_points = Number(item.skill_points || base.skill_points || 20);
  }

  // Harmonize Skills Fields
  if (resolvedMatrix.id === 'skills') {
    base.type = item.type || base.type || 'mental';
    base.subtype = item.subtype || base.subtype || 'knowledge';
    base.is_specialization = Boolean(item.is_specialization);
    base.base_skill = item.base_skill || base.base_skill || '';
    base.recommended_tl = parseListField(item.recommended_tl || item.recommended_tech_level || (item.tech_level !== undefined ? [`TL ${item.tech_level}`] : base.recommended_tl));
    base.recommended_ml = parseListField(item.recommended_ml || item.recommended_meta_level || (item.meta_level !== undefined ? [`ML ${item.meta_level}`] : base.recommended_ml));
    base.tech_level = Number(item.tech_level ?? item.tl ?? base.tech_level ?? 0) || 0;
    base.tl = base.tech_level;
    base.meta_level = Number(item.meta_level ?? item.ml ?? base.meta_level ?? 0) || 0;
    base.ml = base.meta_level;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Features Fields
  if (resolvedMatrix.id === 'features') {
    base.type = item.type || base.type || 'ability';
    base.cp = Number(item.cp ?? base.cp ?? 2);
    base.recommended_tl = parseListField(item.recommended_tl || item.recommended_tech_level || (item.tech_level !== undefined ? [`TL ${item.tech_level}`] : base.recommended_tl));
    base.recommended_ml = parseListField(item.recommended_ml || item.recommended_meta_level || (item.meta_level !== undefined ? [`ML ${item.meta_level}`] : base.recommended_ml));
    base.tech_level = Number(item.tech_level ?? item.tl ?? base.tech_level ?? 0) || 0;
    base.tl = base.tech_level;
    base.meta_level = Number(item.meta_level ?? item.ml ?? base.meta_level ?? 0) || 0;
    base.ml = base.meta_level;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
    base.multi = Boolean(item.multi ?? base.multi);
    base.staged = Boolean(item.staged ?? base.staged);
  }

  // Harmonize Equipment / Gear Fields
  if (resolvedMatrix.id === 'equipment' || resolvedMatrix.id === 'gear') {
    base.recommended_tl = parseListField(item.recommended_tl || item.recommended_tech_level || (item.tech_level !== undefined ? [`TL ${item.tech_level}`] : (item.tl !== undefined ? [`TL ${item.tl}`] : base.recommended_tl)));
    base.recommended_ml = parseListField(item.recommended_ml || item.recommended_meta_level || (item.meta_level !== undefined ? [`ML ${item.meta_level}`] : (item.ml !== undefined ? [`ML ${item.ml}`] : base.recommended_ml)));
    base.tech_level = Number(item.tech_level ?? item.tl ?? base.tech_level ?? 3) || 3;
    base.tl = base.tech_level;
    base.meta_level = Number(item.meta_level ?? item.ml ?? base.meta_level ?? 0) || 0;
    base.ml = base.meta_level;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Weaponry Fields
  if (resolvedMatrix.id === 'weaponry') {
    base.recommended_tl = parseListField(item.recommended_tl || item.recommended_tech_level || (item.tech_level !== undefined ? [`TL ${item.tech_level}`] : (item.tl !== undefined ? [`TL ${item.tl}`] : base.recommended_tl)));
    base.recommended_ml = parseListField(item.recommended_ml || item.recommended_meta_level || (item.meta_level !== undefined ? [`ML ${item.meta_level}`] : (item.ml !== undefined ? [`ML ${item.ml}`] : base.recommended_ml)));
    base.tech_level = Number(item.tech_level ?? item.tl ?? base.tech_level ?? 3) || 3;
    base.tl = base.tech_level;
    base.meta_level = Number(item.meta_level ?? item.ml ?? base.meta_level ?? 0) || 0;
    base.ml = base.meta_level;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Armor / Armoring Fields
  if (resolvedMatrix.id === 'armor' || resolvedMatrix.id === 'armoring') {
    base.recommended_tl = parseListField(item.recommended_tl || item.recommended_tech_level || (item.tech_level !== undefined ? [`TL ${item.tech_level}`] : (item.tl !== undefined ? [`TL ${item.tl}`] : base.recommended_tl)));
    base.recommended_ml = parseListField(item.recommended_ml || item.recommended_meta_level || (item.meta_level !== undefined ? [`ML ${item.meta_level}`] : (item.ml !== undefined ? [`ML ${item.ml}`] : base.recommended_ml)));
    base.tech_level = Number(item.tech_level ?? item.tl ?? base.tech_level ?? 3) || 3;
    base.tl = base.tech_level;
    base.meta_level = Number(item.meta_level ?? item.ml ?? base.meta_level ?? 0) || 0;
    base.ml = base.meta_level;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Augmentations Fields
  if (resolvedMatrix.id === 'augmentations') {
    base.recommended_tl = parseListField(item.recommended_tl || item.recommended_tech_level || (item.tech_level !== undefined ? [`TL ${item.tech_level}`] : (item.tl !== undefined ? [`TL ${item.tl}`] : base.recommended_tl)));
    base.recommended_ml = parseListField(item.recommended_ml || item.recommended_meta_level || (item.meta_level !== undefined ? [`ML ${item.meta_level}`] : (item.ml !== undefined ? [`ML ${item.ml}`] : base.recommended_ml)));
    base.tech_level = Number(item.tech_level ?? item.tl ?? base.tech_level ?? 3) || 3;
    base.tl = base.tech_level;
    base.meta_level = Number(item.meta_level ?? item.ml ?? base.meta_level ?? 0) || 0;
    base.ml = base.meta_level;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Mecha / Vehicle Fields
  if (resolvedMatrix.id === 'mecha' || resolvedMatrix.id === 'vehicles') {
    base.recommended_tl = parseListField(item.recommended_tl || item.recommended_tech_level || (item.tech_level !== undefined ? [`TL ${item.tech_level}`] : (item.tl !== undefined ? [`TL ${item.tl}`] : base.recommended_tl)));
    base.recommended_ml = parseListField(item.recommended_ml || item.recommended_meta_level || (item.meta_level !== undefined ? [`ML ${item.meta_level}`] : (item.ml !== undefined ? [`ML ${item.ml}`] : base.recommended_ml)));
    base.tech_level = Number(item.tech_level ?? item.tl ?? base.tech_level ?? 3) || 3;
    base.tl = base.tech_level;
    base.meta_level = Number(item.meta_level ?? item.ml ?? base.meta_level ?? 0) || 0;
    base.ml = base.meta_level;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Architecture / Facility Fields
  if (resolvedMatrix.id === 'architecture' || resolvedMatrix.id === 'facilities' || resolvedMatrix.id === 'stations') {
    base.recommended_tl = parseListField(item.recommended_tl || item.recommended_tech_level || (item.tech_level !== undefined ? [`TL ${item.tech_level}`] : (item.tl !== undefined ? [`TL ${item.tl}`] : base.recommended_tl)));
    base.recommended_ml = parseListField(item.recommended_ml || item.recommended_meta_level || (item.meta_level !== undefined ? [`ML ${item.meta_level}`] : (item.ml !== undefined ? [`ML ${item.ml}`] : base.recommended_ml)));
    base.tech_level = Number(item.tech_level ?? item.tl ?? base.tech_level ?? 3) || 3;
    base.tl = base.tech_level;
    base.meta_level = Number(item.meta_level ?? item.ml ?? base.meta_level ?? 0) || 0;
    base.ml = base.meta_level;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Other Property / Miscellaneous Fields
  if (resolvedMatrix.id === 'other' || resolvedMatrix.id === 'other_property') {
    base.recommended_tl = parseListField(item.recommended_tl || item.recommended_tech_level || (item.tech_level !== undefined ? [`TL ${item.tech_level}`] : (item.tl !== undefined ? [`TL ${item.tl}`] : base.recommended_tl)));
    base.recommended_ml = parseListField(item.recommended_ml || item.recommended_meta_level || (item.meta_level !== undefined ? [`ML ${item.meta_level}`] : (item.ml !== undefined ? [`ML ${item.ml}`] : base.recommended_ml)));
    base.tech_level = Number(item.tech_level ?? item.tl ?? base.tech_level ?? 2) || 2;
    base.tl = base.tech_level;
    base.meta_level = Number(item.meta_level ?? item.ml ?? base.meta_level ?? 0) || 0;
    base.ml = base.meta_level;
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (base.keywords || '');
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (base.negative_keywords || '');
  }

  // Harmonize Archetypes Fields
  if (resolvedMatrix.id === 'archetypes') {
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
  let resolvedMatrix = null;
  let actualComputed = {};

  if (matrix) {
    resolvedMatrix = typeof matrix === 'string' ? (getMatrixById(matrix) || { id: matrix, name: matrix }) : matrix;
    actualComputed = computedValues || {};
  } else if (computedValues) {
    if (typeof computedValues === 'string') {
      resolvedMatrix = getMatrixById(computedValues) || { id: computedValues, name: computedValues };
    } else if (computedValues.id) {
      resolvedMatrix = computedValues;
    } else {
      actualComputed = computedValues;
    }
  }

  if (!resolvedMatrix) {
    resolvedMatrix = { id: 'generic', name: 'Generic' };
  }

  const normalized = normalizeOmnicortexItem(formData);

  const payload = {
    ...exportOmnicortexItem(formData),
    ...normalized,
    name: (formData.name || formData.title || 'Untitled Blueprint').trim(),
    matrix_id: resolvedMatrix.id,
    matrix_type: resolvedMatrix.id,
    category: resolvedMatrix.name || resolvedMatrix.id,
    _computed: resolvedMatrix.isProperty ? {
      ...(actualComputed || {}),
      ...(formData._computed || {}),
      computed_at: new Date().toISOString()
    } : { computed_at: new Date().toISOString() },
    updatedAt: new Date().toISOString()
  };

  // Ensure species chassis type and size are synchronized
  if (resolvedMatrix.id === 'species') {
    const chassis = formData.species_type || formData.type || 'Humanoid';
    payload.species_type = chassis;
    payload.type = chassis;

    const sizeVal = formData.size || formData.species_size || 'Medium';
    payload.size = sizeVal;
    payload.species_size = sizeVal;

    payload.recommended_factions = Array.isArray(formData.recommended_factions) ? formData.recommended_factions : [];
    payload.recommended_origins = Array.isArray(formData.recommended_origins) ? formData.recommended_origins : [];
    payload.recommended_occupations = Array.isArray(formData.recommended_occupations) ? formData.recommended_occupations : [];
    payload.recommended_skills = Array.isArray(formData.recommended_skills) ? formData.recommended_skills : [];
    payload.recommended_features = Array.isArray(formData.recommended_features) ? formData.recommended_features : [];
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure faction recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'factions') {
    payload.recommended_species = Array.isArray(formData.recommended_species) ? formData.recommended_species : [];
    payload.recommended_origins = Array.isArray(formData.recommended_origins) ? formData.recommended_origins : [];
    payload.recommended_occupations = Array.isArray(formData.recommended_occupations) ? formData.recommended_occupations : [];
    payload.recommended_skills = Array.isArray(formData.recommended_skills) ? formData.recommended_skills : [];
    payload.recommended_features = Array.isArray(formData.recommended_features) ? formData.recommended_features : [];
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure origin recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'origins') {
    payload.recommended_species = Array.isArray(formData.recommended_species) ? formData.recommended_species : [];
    payload.recommended_factions = Array.isArray(formData.recommended_factions) ? formData.recommended_factions : [];
    payload.recommended_occupations = Array.isArray(formData.recommended_occupations) ? formData.recommended_occupations : [];
    payload.recommended_skills = Array.isArray(formData.recommended_skills) ? formData.recommended_skills : [];
    payload.recommended_features = Array.isArray(formData.recommended_features) ? formData.recommended_features : [];
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure occupation recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'occupations') {
    payload.recommended_species = Array.isArray(formData.recommended_species) ? formData.recommended_species : [];
    payload.recommended_factions = Array.isArray(formData.recommended_factions) ? formData.recommended_factions : [];
    payload.recommended_origins = Array.isArray(formData.recommended_origins) ? formData.recommended_origins : [];
    payload.recommended_skills = Array.isArray(formData.recommended_skills) ? formData.recommended_skills : [];
    payload.recommended_features = Array.isArray(formData.recommended_features) ? formData.recommended_features : [];
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure skill recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'skills') {
    payload.recommended_tl = Array.isArray(formData.recommended_tl) ? formData.recommended_tl : [];
    payload.recommended_ml = Array.isArray(formData.recommended_ml) ? formData.recommended_ml : [];
    payload.tech_level = Number(formData.tech_level ?? formData.tl ?? 0) || 0;
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level ?? formData.ml ?? 0) || 0;
    payload.ml = payload.meta_level;
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure feature recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'features') {
    payload.recommended_tl = Array.isArray(formData.recommended_tl) ? formData.recommended_tl : [];
    payload.recommended_ml = Array.isArray(formData.recommended_ml) ? formData.recommended_ml : [];
    payload.tech_level = Number(formData.tech_level ?? formData.tl ?? 0) || 0;
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level ?? formData.ml ?? 0) || 0;
    payload.ml = payload.meta_level;
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure equipment / gear recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'equipment' || resolvedMatrix.id === 'gear') {
    payload.recommended_tl = Array.isArray(formData.recommended_tl) ? formData.recommended_tl : [];
    payload.recommended_ml = Array.isArray(formData.recommended_ml) ? formData.recommended_ml : [];
    payload.tech_level = Number(formData.tech_level ?? formData.tl ?? 3) || 3;
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level ?? formData.ml ?? 0) || 0;
    payload.ml = payload.meta_level;
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure weaponry recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'weaponry') {
    payload.recommended_tl = Array.isArray(formData.recommended_tl) ? formData.recommended_tl : [];
    payload.recommended_ml = Array.isArray(formData.recommended_ml) ? formData.recommended_ml : [];
    payload.tech_level = Number(formData.tech_level ?? formData.tl ?? 3) || 3;
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level ?? formData.ml ?? 0) || 0;
    payload.ml = payload.meta_level;
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure armor recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'armor' || resolvedMatrix.id === 'armoring') {
    payload.recommended_tl = Array.isArray(formData.recommended_tl) ? formData.recommended_tl : [];
    payload.recommended_ml = Array.isArray(formData.recommended_ml) ? formData.recommended_ml : [];
    payload.tech_level = Number(formData.tech_level ?? formData.tl ?? 3) || 3;
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level ?? formData.ml ?? 0) || 0;
    payload.ml = payload.meta_level;
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure augmentations recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'augmentations') {
    payload.recommended_tl = Array.isArray(formData.recommended_tl) ? formData.recommended_tl : [];
    payload.recommended_ml = Array.isArray(formData.recommended_ml) ? formData.recommended_ml : [];
    payload.tech_level = Number(formData.tech_level ?? formData.tl ?? 3) || 3;
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level ?? formData.ml ?? 0) || 0;
    payload.ml = payload.meta_level;
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure mecha recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'mecha' || resolvedMatrix.id === 'vehicles') {
    payload.recommended_tl = Array.isArray(formData.recommended_tl) ? formData.recommended_tl : [];
    payload.recommended_ml = Array.isArray(formData.recommended_ml) ? formData.recommended_ml : [];
    payload.tech_level = Number(formData.tech_level ?? formData.tl ?? 3) || 3;
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level ?? formData.ml ?? 0) || 0;
    payload.ml = payload.meta_level;
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure architecture recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'architecture' || resolvedMatrix.id === 'facilities' || resolvedMatrix.id === 'stations') {
    payload.recommended_tl = Array.isArray(formData.recommended_tl) ? formData.recommended_tl : [];
    payload.recommended_ml = Array.isArray(formData.recommended_ml) ? formData.recommended_ml : [];
    payload.tech_level = Number(formData.tech_level ?? formData.tl ?? 3) || 3;
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level ?? formData.ml ?? 0) || 0;
    payload.ml = payload.meta_level;
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure other property recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'other' || resolvedMatrix.id === 'other_property') {
    payload.recommended_tl = Array.isArray(formData.recommended_tl) ? formData.recommended_tl : [];
    payload.recommended_ml = Array.isArray(formData.recommended_ml) ? formData.recommended_ml : [];
    payload.tech_level = Number(formData.tech_level ?? formData.tl ?? 2) || 2;
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level ?? formData.ml ?? 0) || 0;
    payload.ml = payload.meta_level;
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
  }

  // Ensure credit cost sync strictly for property matrices
  if (resolvedMatrix.isProperty && actualComputed?.credit_value && payload.costs && !payload.costs.credits) {
    payload.costs.credits = Number(actualComputed.credit_value);
    payload.cost = Number(actualComputed.credit_value);
  }

  return payload;
};
