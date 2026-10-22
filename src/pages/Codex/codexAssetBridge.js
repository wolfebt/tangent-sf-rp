/**
 * ═══════════════════════════════════════════════════════════════════
 * TANGENT SF RP — CODEX ASSET BRIDGE
 * Bidirectional mapping, schema adaptation, and dataset resolution
 * connecting Folio, Omnicortex DBM, and the Codex Suite.
 * ═══════════════════════════════════════════════════════════════════
 */

import { getMatrixById } from './codexConfig.js';
import { normalizeOmnicortexItem, exportOmnicortexItem } from '../../utils/tangentSchemaAdapters.js';
import { calculateSpeciesBP } from '../../engines/tangentEntityEngines.js';
import { DEFAULT_SPECIES } from '../../data/speciesData.js';
import { DEFAULT_FACTIONS } from '../../data/factionsData.js';
import { DEFAULT_ORIGINS } from '../../data/originsData.js';
import { DEFAULT_OCCUPATIONS } from '../../data/occupationsData.js';
import { DEFAULT_INVOCATIONS } from '../../data/invocationsData.js';

const normalizeSpeciesMatchName = (val) =>
  String(val || '')
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\s+human$/i, '')
    .trim();

const findCanonicalSeed = (item, dataset) => {
  if (!item || !Array.isArray(dataset)) return null;
  const matchId = (item.id || '').toString().toLowerCase().trim();
  const matchName = (item.name || '').toString().toLowerCase().trim();
  const matchTitle = (item.title || '').toString().toLowerCase().trim();
  const normMatchName = normalizeSpeciesMatchName(matchName || matchTitle);
  const slugSuffix = normMatchName ? `-${normMatchName.replace(/[^a-z0-9]+/g, '-')}` : '';

  return dataset.find(d => {
    const sId = (d.id || '').toString().toLowerCase().trim();
    const sName = (d.name || '').toString().toLowerCase().trim();
    const sTitle = (d.title || '').toString().toLowerCase().trim();
    const normSeedName = normalizeSpeciesMatchName(sName || sTitle);
    return (sId && sId === matchId) ||
           (sName && (sName === matchName || sName === matchTitle)) ||
           (sTitle && (sTitle === matchName || sTitle === matchTitle)) ||
           (normMatchName && normSeedName && normSeedName === normMatchName) ||
           (slugSuffix && sId.endsWith(slugSuffix));
  }) || null;
};

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
  hindrance: 'disadvantages',

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
  const resolvedTl = item.tech_level !== undefined 
    ? item.tech_level 
    : (item.tl !== undefined 
      ? item.tl 
      : (item.techLevel !== undefined 
        ? item.techLevel 
        : (base.tech_level !== undefined ? base.tech_level : (base.tl !== undefined ? base.tl : 3))));
  base.tech_level = resolvedTl;
  base.tl = resolvedTl;

  // Harmonize Meta Level
  const resolvedMl = item.meta_level !== undefined 
    ? item.meta_level 
    : (item.ml !== undefined 
      ? item.ml 
      : (item.metaLevel !== undefined 
        ? item.metaLevel 
        : (base.meta_level !== undefined ? base.meta_level : (base.ml !== undefined ? base.ml : 0))));
  base.meta_level = resolvedMl;
  base.ml = resolvedMl;

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

  // Harmonize Species Chassis Type, Size, Traits, Pools, Features, Disadvantages & Stigma
  if (resolvedMatrix.id === 'species') {
    const seed = findCanonicalSeed(item, DEFAULT_SPECIES);
    const modsArray = Array.isArray(item.modifiers) ? item.modifiers : [];

    const rawChassis = item.species_type || (Array.isArray(item.type) ? item.type[0] : item.type) || seed?.species_type || seed?.type || base.species_type || 'Humanoid';
    const cleanChassis = typeof rawChassis === 'string' && rawChassis.startsWith('species_type-')
      ? rawChassis.replace('species_type-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : (Array.isArray(rawChassis) ? rawChassis[0] : rawChassis);
    base.species_type = cleanChassis || 'Humanoid';
    base.type = cleanChassis || 'Humanoid';

    const rawSize = item.size || item.species_size || seed?.size || seed?.species_size || base.size || 'Medium';
    const firstSize = Array.isArray(rawSize) ? rawSize[0] : (typeof rawSize === 'object' && rawSize !== null ? (rawSize.name || rawSize.value || rawSize.id) : rawSize);
    const cleanSize = typeof firstSize === 'string' && firstSize.startsWith('species_size-')
      ? firstSize.replace('species_size-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : firstSize;
    base.size = cleanSize || 'Medium';
    base.species_size = cleanSize || 'Medium';

    // Harmonize Movement Modes (ensure blank species start with [])
    const rawModes = Array.isArray(item.movement_modes) && item.movement_modes.length > 0
      ? item.movement_modes
      : Array.isArray(item.movement) && item.movement.length > 0
      ? item.movement
      : (typeof item.movement === 'string' && item.movement.trim() && item.movement !== 'normal'
        ? [item.movement.trim()]
        : (Array.isArray(seed?.movement_modes) && seed.movement_modes.length > 0
          ? seed.movement_modes
          : (Array.isArray(seed?.movement) ? seed.movement : [])));
    base.movement_modes = rawModes.filter(Boolean);
    base.movement = base.movement_modes;

    // Harmonize Traits across traits / trait / species_traits
    const rawTraits = Array.isArray(item.traits) && item.traits.length > 0
      ? item.traits
      : Array.isArray(item.trait) && item.trait.length > 0
      ? item.trait
      : Array.isArray(item.species_traits) && item.species_traits.length > 0
      ? item.species_traits
      : (Array.isArray(seed?.traits) && seed.traits.length > 0 ? seed.traits : []);
    base.traits = rawTraits;
    base.trait = rawTraits;
    base.species_traits = rawTraits;

    // Harmonize Disadvantages / Hindrances & Social Stigma
    const modDisadvantages = modsArray.filter(m => m && m.type === 'disadvantage').map(m => m.target || m.name || m.id).filter(Boolean);
    const rawDisadvantages = (Array.isArray(item.disadvantages) && item.disadvantages.length > 0)
      ? item.disadvantages
      : (Array.isArray(item.hindrances) && item.hindrances.length > 0)
      ? item.hindrances
      : (modDisadvantages.length > 0
        ? modDisadvantages
        : (Array.isArray(seed?.disadvantages) ? seed.disadvantages : []));
    base.disadvantages = rawDisadvantages;
    base.hindrances = rawDisadvantages;

    const resolvedStigma = item.social_stigma || item.stigma || seed?.social_stigma || seed?.stigma || base.social_stigma || base.stigma || 'None';
    base.social_stigma = resolvedStigma;
    base.stigma = resolvedStigma;

    // Harmonize Inherent Attribute Modifiers & Attribute Pools from item, modifiers array, or canonical seed
    const modInherentAttrs = modsArray
      .filter(m => m && m.type === 'attribute' && m.mode === 'inherent')
      .map(m => ({ attribute: m.target || m.attribute, bonus: Number(m.value ?? m.bonus ?? 0) }));
    const rawAttrMods = (Array.isArray(item.attribute_modifiers) && item.attribute_modifiers.length > 0)
      ? item.attribute_modifiers
      : (Array.isArray(item.inherent_attribute_modifiers) && item.inherent_attribute_modifiers.length > 0)
      ? item.inherent_attribute_modifiers
      : (modInherentAttrs.length > 0)
      ? modInherentAttrs
      : (Array.isArray(seed?.inherent_attribute_modifiers) && seed.inherent_attribute_modifiers.length > 0)
      ? seed.inherent_attribute_modifiers
      : [];
    if (rawAttrMods.length > 0) {
      base.attribute_modifiers = rawAttrMods;
      base.inherent_attribute_modifiers = rawAttrMods;
      const attrObj = { ...(base.attributes || {}) };
      rawAttrMods.forEach(mod => {
        const attr = String(mod.attribute || mod.target || '').toLowerCase();
        const bonus = Number(mod.bonus ?? mod.value ?? 0);
        if (attr.startsWith('str') && !base.bonus_str) { base.bonus_str = bonus; attrObj.str = bonus; }
        else if ((attr.startsWith('agi') || attr.startsWith('dex')) && !base.bonus_agi) { base.bonus_agi = bonus; attrObj.agi = bonus; }
        else if ((attr.startsWith('sta') || attr.startsWith('con')) && !base.bonus_sta) { base.bonus_sta = bonus; attrObj.sta = bonus; }
        else if (attr.startsWith('int') && !base.bonus_int) { base.bonus_int = bonus; attrObj.int = bonus; }
        else if (attr.startsWith('wis') && !base.bonus_wis) { base.bonus_wis = bonus; attrObj.wis = bonus; }
        else if (attr.startsWith('cha') && !base.bonus_cha) { base.bonus_cha = bonus; attrObj.cha = bonus; }
      });
      base.attributes = attrObj;
    }

    const modAttrPool = modsArray
      .filter(m => m && m.type === 'attribute' && m.mode === 'bonus_pool')
      .reduce((sum, m) => sum + Number(m.value ?? m.bonus ?? 0), 0);
    const resolvedAttrPool = (Number(item.bonus_attribute_points) > 0 ? Number(item.bonus_attribute_points) : undefined)
      ?? (modAttrPool > 0 ? modAttrPool : undefined)
      ?? seed?.bonus_attribute_points
      ?? 0;
    base.bonus_attribute_points = Number(resolvedAttrPool) || 0;

    // Harmonize Skill Pools & Specific Skill Bonuses
    const modSkillPool = modsArray
      .filter(m => m && m.type === 'skill' && m.mode === 'bonus_pool')
      .reduce((sum, m) => sum + Number(m.value ?? m.bonus ?? 0), 0);
    const rawBonusSkills = (Number(item.bonus_skills) > 0 ? Number(item.bonus_skills) : undefined)
      ?? (Number(item.bonus_skill_points) > 0 ? Number(item.bonus_skill_points) : undefined)
      ?? (modSkillPool > 0 ? modSkillPool : undefined)
      ?? seed?.bonus_skills
      ?? 0;
    if (!base.skill_bundles && Number(rawBonusSkills) > 0) {
      base.skill_bundles = Math.floor(Number(rawBonusSkills) / 5);
      base.bonus_skills = Number(rawBonusSkills);
    } else if (base.skill_bundles > 0 && !base.bonus_skills) {
      base.bonus_skills = Number(base.skill_bundles) * 5;
    }

    const modSpecificSkills = modsArray
      .filter(m => m && m.type === 'skill' && m.mode === 'inherent')
      .map(m => ({ skill_id: m.target || m.skill_id, bonus: Number(m.value ?? m.bonus ?? 0) }));
    base.specific_skill_bonuses = (Array.isArray(item.specific_skill_bonuses) && item.specific_skill_bonuses.length > 0)
      ? item.specific_skill_bonuses
      : (modSpecificSkills.length > 0
        ? modSpecificSkills
        : (Array.isArray(seed?.specific_skill_bonuses) ? seed.specific_skill_bonuses : []));

    // Harmonize Granted Features (inherent_features) & Feature Pools (bonus_features)
    const modInherentFeatures = modsArray
      .filter(m => m && m.type === 'feature' && m.mode === 'inherent')
      .map(m => m.target || m.name || m.id)
      .filter(Boolean);
    base.inherent_features = (Array.isArray(item.inherent_features) && item.inherent_features.length > 0)
      ? item.inherent_features
      : (modInherentFeatures.length > 0
        ? modInherentFeatures
        : (Array.isArray(seed?.inherent_features) ? seed.inherent_features : []));

    const modFeaturePool = modsArray
      .filter(m => m && m.type === 'feature' && m.mode === 'bonus_pool')
      .reduce((sum, m) => sum + Number(m.value ?? m.bonus ?? 0), 0);
    const resolvedBonusFeatures = (Number(item.bonus_features) > 0 ? Number(item.bonus_features) : undefined)
      ?? (modFeaturePool > 0 ? modFeaturePool : undefined)
      ?? seed?.bonus_features
      ?? 0;
    base.bonus_features = Number(resolvedBonusFeatures) || 0;

    const itemRecFactions = parseListField(item.recommended_factions);
    base.recommended_factions = itemRecFactions.length > 0 ? itemRecFactions : parseListField(seed?.recommended_factions || base.recommended_factions);

    const itemRecOrigins = parseListField(item.recommended_origins);
    base.recommended_origins = itemRecOrigins.length > 0 ? itemRecOrigins : parseListField(seed?.recommended_origins || base.recommended_origins);

    const itemRecOccus = parseListField(item.recommended_occupations);
    base.recommended_occupations = itemRecOccus.length > 0 ? itemRecOccus : parseListField(seed?.recommended_occupations || base.recommended_occupations);

    const itemRecSkills = parseListField(item.recommended_skills);
    base.recommended_skills = itemRecSkills.length > 0 ? itemRecSkills : parseListField(seed?.recommended_skills || base.recommended_skills);

    const modRecFeatures = modsArray
      .filter(m => m && m.type === 'feature' && m.mode === 'recommended')
      .map(m => m.target || m.name || m.id)
      .filter(Boolean);
    const itemRecFeatures = parseListField(item.recommended_features);
    base.recommended_features = itemRecFeatures.length > 0
      ? itemRecFeatures
      : (modRecFeatures.length > 0 ? modRecFeatures : parseListField(seed?.recommended_features || base.recommended_features));

    base.keywords = (typeof item.keywords === 'string' && item.keywords.trim())
      ? item.keywords
      : (seed?.keywords || base.keywords || '');
    base.negative_keywords = (typeof item.negative_keywords === 'string' && item.negative_keywords.trim())
      ? item.negative_keywords
      : (seed?.negative_keywords || base.negative_keywords || '');

    // Dynamically compute and synchronize the authoritative species package CP/BP cost
    const speciesBp = calculateSpeciesBP(base);
    base.cp = speciesBp.totalCPUsed;
    base.bp = speciesBp.totalBPUsed;
    base.cp_cost = speciesBp.totalCPUsed;
    base.costs = {
      ...(base.costs || {}),
      cp: speciesBp.totalCPUsed,
      bp: speciesBp.totalBPUsed
    };
  }

  // Harmonize Factions Fields
  if (resolvedMatrix.id === 'factions') {
    const seed = findCanonicalSeed(item, DEFAULT_FACTIONS);
    const itemRecSpecies = parseListField(item.recommended_species);
    base.recommended_species = itemRecSpecies.length > 0 ? itemRecSpecies : parseListField(seed?.recommended_species || base.recommended_species);

    const itemRecOrigins = parseListField(item.recommended_origins);
    base.recommended_origins = itemRecOrigins.length > 0 ? itemRecOrigins : parseListField(seed?.recommended_origins || base.recommended_origins);

    const itemRecOccus = parseListField(item.recommended_occupations);
    base.recommended_occupations = itemRecOccus.length > 0 ? itemRecOccus : parseListField(seed?.recommended_occupations || base.recommended_occupations);

    const itemRecSkills = parseListField(item.recommended_skills);
    base.recommended_skills = itemRecSkills.length > 0 ? itemRecSkills : parseListField(seed?.recommended_skills || base.recommended_skills);

    const itemRecFeatures = parseListField(item.recommended_features);
    base.recommended_features = itemRecFeatures.length > 0 ? itemRecFeatures : parseListField(seed?.recommended_features || base.recommended_features);

    base.keywords = (typeof item.keywords === 'string' && item.keywords.trim())
      ? item.keywords
      : (seed?.keywords || base.keywords || '');
    base.negative_keywords = (typeof item.negative_keywords === 'string' && item.negative_keywords.trim())
      ? item.negative_keywords
      : (seed?.negative_keywords || base.negative_keywords || '');
  }

  // Harmonize Origins Fields
  if (resolvedMatrix.id === 'origins') {
    const seed = findCanonicalSeed(item, DEFAULT_ORIGINS);
    const itemRecSpecies = parseListField(item.recommended_species);
    base.recommended_species = itemRecSpecies.length > 0 ? itemRecSpecies : parseListField(seed?.recommended_species || base.recommended_species);

    const itemRecFactions = parseListField(item.recommended_factions);
    base.recommended_factions = itemRecFactions.length > 0 ? itemRecFactions : parseListField(seed?.recommended_factions || base.recommended_factions);

    const itemRecOccus = parseListField(item.recommended_occupations);
    base.recommended_occupations = itemRecOccus.length > 0 ? itemRecOccus : parseListField(seed?.recommended_occupations || base.recommended_occupations);

    const itemRecSkills = parseListField(item.recommended_skills);
    base.recommended_skills = itemRecSkills.length > 0 ? itemRecSkills : parseListField(seed?.recommended_skills || base.recommended_skills);

    const itemRecFeatures = parseListField(item.recommended_features);
    base.recommended_features = itemRecFeatures.length > 0 ? itemRecFeatures : parseListField(seed?.recommended_features || base.recommended_features);

    base.keywords = (typeof item.keywords === 'string' && item.keywords.trim())
      ? item.keywords
      : (seed?.keywords || base.keywords || '');
    base.negative_keywords = (typeof item.negative_keywords === 'string' && item.negative_keywords.trim())
      ? item.negative_keywords
      : (seed?.negative_keywords || base.negative_keywords || '');
  }

  // Harmonize Occupations Fields
  if (resolvedMatrix.id === 'occupations') {
    const seed = findCanonicalSeed(item, DEFAULT_OCCUPATIONS);
    const itemRecSpecies = parseListField(item.recommended_species);
    base.recommended_species = itemRecSpecies.length > 0 ? itemRecSpecies : parseListField(seed?.recommended_species || base.recommended_species);

    const itemRecFactions = parseListField(item.recommended_factions);
    base.recommended_factions = itemRecFactions.length > 0 ? itemRecFactions : parseListField(seed?.recommended_factions || base.recommended_factions);

    const itemRecOrigins = parseListField(item.recommended_origins);
    base.recommended_origins = itemRecOrigins.length > 0 ? itemRecOrigins : parseListField(seed?.recommended_origins || base.recommended_origins);

    const itemRecSkills = parseListField(item.recommended_skills);
    base.recommended_skills = itemRecSkills.length > 0 ? itemRecSkills : parseListField(seed?.recommended_skills || base.recommended_skills);

    const itemRecFeatures = parseListField(item.recommended_features || item.features);
    base.recommended_features = itemRecFeatures.length > 0 ? itemRecFeatures : parseListField(seed?.recommended_features || base.recommended_features);
    base.features = base.recommended_features;

    base.keywords = (typeof item.keywords === 'string' && item.keywords.trim())
      ? item.keywords
      : (seed?.keywords || base.keywords || '');
    base.negative_keywords = (typeof item.negative_keywords === 'string' && item.negative_keywords.trim())
      ? item.negative_keywords
      : (seed?.negative_keywords || base.negative_keywords || '');

    base.professional_skills = item.professional_skills || seed?.professional_skills || base.professional_skills || [];
    base.traits = item.traits || seed?.traits || base.traits || [];
    base.archetypes = item.archetypes || seed?.archetypes || base.archetypes || [];
    base.field = item.field || seed?.field || base.field || 'General / Other';
    base.skill_points = Number(item.skill_points || seed?.skill_points || base.skill_points || 20);
  }

  // Harmonize Invocations / Magic Fields
  if (resolvedMatrix.id === 'invocation' || resolvedMatrix.id === 'invocations') {
    const seed = findCanonicalSeed(item, DEFAULT_INVOCATIONS);
    const itemRecSpecies = parseListField(item.recommended_species);
    base.recommended_species = itemRecSpecies.length > 0 ? itemRecSpecies : parseListField(seed?.recommended_species || base.recommended_species);

    const itemRecFactions = parseListField(item.recommended_factions);
    base.recommended_factions = itemRecFactions.length > 0 ? itemRecFactions : parseListField(seed?.recommended_factions || base.recommended_factions);

    const itemRecOrigins = parseListField(item.recommended_origins);
    base.recommended_origins = itemRecOrigins.length > 0 ? itemRecOrigins : parseListField(seed?.recommended_origins || base.recommended_origins);

    const itemRecOccus = parseListField(item.recommended_occupations);
    base.recommended_occupations = itemRecOccus.length > 0 ? itemRecOccus : parseListField(seed?.recommended_occupations || base.recommended_occupations);

    const itemRecSkills = parseListField(item.recommended_skills);
    base.recommended_skills = itemRecSkills.length > 0 ? itemRecSkills : parseListField(seed?.recommended_skills || base.recommended_skills);

    const itemRecFeatures = parseListField(item.recommended_features);
    base.recommended_features = itemRecFeatures.length > 0 ? itemRecFeatures : parseListField(seed?.recommended_features || base.recommended_features);

    base.keywords = (typeof item.keywords === 'string' && item.keywords.trim())
      ? item.keywords
      : (seed?.keywords || base.keywords || '');
    base.negative_keywords = (typeof item.negative_keywords === 'string' && item.negative_keywords.trim())
      ? item.negative_keywords
      : (seed?.negative_keywords || base.negative_keywords || '');

    base.discipline = item.discipline || seed?.discipline || base.discipline || 'Universal';
    base.sphere = item.sphere || seed?.sphere || base.sphere || 'General';
    base.subdiscipline = item.subdiscipline || seed?.subdiscipline || base.subdiscipline || '';
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

  // Harmonize Traits Fields
  if (resolvedMatrix.id === 'traits') {
    base.trait_type = item.trait_type || item.type || base.trait_type || 'Species Trait';
    base.trait_tier = item.trait_tier || base.trait_tier || 'Basic';
    base.classification = item.classification || item.type || base.classification || 'Physical';
    base.cp = Number(item.cp !== undefined ? item.cp : (base.cp !== undefined ? base.cp : 1));
    base.bp = Number(item.bp !== undefined ? item.bp : base.cp);
    base.description = item.description || item.desc || base.description || '';
    base.mechanic = item.mechanic || item.mechanics || base.mechanic || '';
    base.note = item.note || item.notes || base.note || '';
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
    base.recommended_species = item.recommended_species || base.recommended_species || [];
    base.bp_chassis = Number(item.bp_chassis || base.bp_chassis || 80);
    base.quote = item.quote || base.quote || '';
    base.core_concept = item.core_concept || base.core_concept || '';
    base.tactical_role = item.tactical_role || base.tactical_role || '';
  }

  // Harmonize Features Fields
  if (resolvedMatrix.id === 'features') {
    const rawAcq = item.acquisition_type || item.acquisitionType;
    const isMulti = item.multi !== undefined ? Boolean(item.multi) : (item.is_multiple !== undefined ? Boolean(item.is_multiple) : false);
    const isStaged = item.staged !== undefined ? Boolean(item.staged) : (item.is_ranked !== undefined ? Boolean(item.is_ranked) : false);
    base.acquisition_type = rawAcq || (isMulti && isStaged ? 'Multi/Staged' : isStaged ? 'Staged' : isMulti ? 'Multiple' : 'Basic');
    base.multi = base.acquisition_type === 'Multiple' || base.acquisition_type === 'Multi/Staged';
    base.staged = base.acquisition_type === 'Staged' || base.acquisition_type === 'Multi/Staged';
    base.is_multiple = base.multi;
    base.is_ranked = base.staged;

    const rawModOptions = item.modifier_options || item.modifierOptions;
    base.modifier_options = rawModOptions && typeof rawModOptions === 'object' ? {
      enabled: Boolean(rawModOptions.enabled),
      mode: rawModOptions.mode === 'pair' ? 'pair' : 'single',
      value: Number(rawModOptions.value !== undefined ? rawModOptions.value : 2),
      options: Array.isArray(rawModOptions.options) ? rawModOptions.options : []
    } : (base.modifier_options || {
      enabled: false,
      mode: 'single',
      value: 2,
      options: []
    });
    base.selected_option_id = item.selected_option_id || item.selectedOptionId || '';
  }

  // Universal fallback harmonization of keywords & negative railguards
  if (base.keywords === undefined || base.keywords === '') {
    base.keywords = typeof item.keywords === 'string' ? item.keywords : (Array.isArray(item.keywords) ? item.keywords.join(', ') : '');
  }
  if (base.negative_keywords === undefined || base.negative_keywords === '') {
    base.negative_keywords = typeof item.negative_keywords === 'string' ? item.negative_keywords : (Array.isArray(item.negative_keywords) ? item.negative_keywords.join(', ') : '');
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
    keywords: typeof formData.keywords === 'string' ? formData.keywords.trim() : (Array.isArray(formData.keywords) ? formData.keywords.join(', ') : ''),
    negative_keywords: typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (Array.isArray(formData.negative_keywords) ? formData.negative_keywords.join(', ') : ''),
    _computed: resolvedMatrix.isProperty ? {
      ...(actualComputed || {}),
      ...(formData._computed || {}),
      computed_at: new Date().toISOString()
    } : { computed_at: new Date().toISOString() },
    updatedAt: new Date().toISOString()
  };

  // Ensure archetypes relational recommendations and allocations are synchronized
  if (resolvedMatrix.id === 'archetypes') {
    payload.recommended_species = Array.isArray(formData.recommended_species) ? formData.recommended_species : [];
    payload.recommended_factions = Array.isArray(formData.recommended_factions) ? formData.recommended_factions : [];
    payload.recommended_origins = Array.isArray(formData.recommended_origins) ? formData.recommended_origins : [];
    payload.recommended_occupations = Array.isArray(formData.recommended_occupations) ? formData.recommended_occupations : [];
    payload.essential_skills = Array.isArray(formData.essential_skills) ? formData.essential_skills : [];
    payload.signature_features = Array.isArray(formData.signature_features) ? formData.signature_features : [];
  }

  // Ensure species chassis type and size are synchronized
  if (resolvedMatrix.id === 'species') {
    const chassis = formData.species_type || formData.type || 'Humanoid';
    payload.species_type = chassis;
    payload.type = chassis;

    const sizeVal = formData.size || formData.species_size || 'Medium';
    payload.size = sizeVal;
    payload.species_size = sizeVal;

    const syncedModes = Array.isArray(formData.movement_modes)
      ? formData.movement_modes.filter(Boolean)
      : Array.isArray(formData.movement)
      ? formData.movement.filter(Boolean)
      : (typeof formData.movement === 'string' && formData.movement.trim() && formData.movement !== 'normal' ? [formData.movement.trim()] : []);
    payload.movement_modes = syncedModes;
    payload.movement = syncedModes;

    const syncedTraits = Array.isArray(formData.traits)
      ? formData.traits
      : Array.isArray(formData.trait)
      ? formData.trait
      : [];
    payload.traits = syncedTraits;
    payload.trait = syncedTraits;
    payload.species_traits = syncedTraits;

    // Synchronize species attribute modifiers, pools, features, disadvantages, stigma, and skill bundles
    if (Array.isArray(formData.attribute_modifiers)) {
      payload.attribute_modifiers = formData.attribute_modifiers;
      payload.inherent_attribute_modifiers = formData.attribute_modifiers;
    } else if (Array.isArray(formData.inherent_attribute_modifiers)) {
      payload.inherent_attribute_modifiers = formData.inherent_attribute_modifiers;
      payload.attribute_modifiers = formData.inherent_attribute_modifiers;
    }
    if (formData.bonus_attribute_points !== undefined) {
      payload.bonus_attribute_points = Number(formData.bonus_attribute_points) || 0;
    }
    if (formData.skill_bundles !== undefined) {
      payload.skill_bundles = Number(formData.skill_bundles) || 0;
      payload.bonus_skills = formData.bonus_skills !== undefined
        ? Number(formData.bonus_skills)
        : (Number(formData.skill_bundles) || 0) * 5;
    } else if (formData.bonus_skills !== undefined) {
      payload.bonus_skills = Number(formData.bonus_skills) || 0;
      payload.skill_bundles = Math.floor(payload.bonus_skills / 5);
    }
    if (Array.isArray(formData.specific_skill_bonuses)) {
      payload.specific_skill_bonuses = formData.specific_skill_bonuses;
    }
    if (Array.isArray(formData.inherent_features)) {
      payload.inherent_features = formData.inherent_features;
    }
    if (formData.bonus_features !== undefined) {
      payload.bonus_features = Number(formData.bonus_features) || 0;
    }
    const syncedDisadvantages = Array.isArray(formData.disadvantages)
      ? formData.disadvantages
      : (Array.isArray(formData.hindrances) ? formData.hindrances : []);
    payload.disadvantages = syncedDisadvantages;
    payload.hindrances = syncedDisadvantages;
    if (formData.social_stigma !== undefined || formData.stigma !== undefined) {
      payload.social_stigma = formData.social_stigma || formData.stigma || 'None';
      payload.stigma = payload.social_stigma;
    }

    payload.recommended_factions = Array.isArray(formData.recommended_factions) ? formData.recommended_factions : [];
    payload.recommended_origins = Array.isArray(formData.recommended_origins) ? formData.recommended_origins : [];
    payload.recommended_occupations = Array.isArray(formData.recommended_occupations) ? formData.recommended_occupations : [];
    payload.recommended_skills = Array.isArray(formData.recommended_skills) ? formData.recommended_skills : [];
    payload.recommended_features = Array.isArray(formData.recommended_features) ? formData.recommended_features : [];
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');

    // Dynamically compute and persist package CP/BP cost from all components
    const bpData = calculateSpeciesBP({ ...formData, ...payload });
    payload.cp = bpData.totalCPUsed;
    payload.bp = bpData.totalBPUsed;
    payload.cp_cost = bpData.totalCPUsed;
    payload.costs = {
      ...(payload.costs || {}),
      cp: bpData.totalCPUsed,
      bp: bpData.totalBPUsed
    };
  }

  // Ensure faction recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'factions') {
    payload.tech_level = Number(formData.tech_level !== undefined ? formData.tech_level : (formData.tl !== undefined ? formData.tl : 3));
    payload.tl = payload.tech_level;
    payload.meta_level = Number(formData.meta_level !== undefined ? formData.meta_level : (formData.ml !== undefined ? formData.ml : 0));
    payload.ml = payload.meta_level;
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

  // Ensure invocation recommendations, directives, and railguards are synchronized
  if (resolvedMatrix.id === 'invocation' || resolvedMatrix.id === 'invocations') {
    payload.recommended_species = Array.isArray(formData.recommended_species) ? formData.recommended_species : [];
    payload.recommended_factions = Array.isArray(formData.recommended_factions) ? formData.recommended_factions : [];
    payload.recommended_origins = Array.isArray(formData.recommended_origins) ? formData.recommended_origins : [];
    payload.recommended_occupations = Array.isArray(formData.recommended_occupations) ? formData.recommended_occupations : [];
    payload.recommended_skills = Array.isArray(formData.recommended_skills) ? formData.recommended_skills : [];
    payload.recommended_features = Array.isArray(formData.recommended_features) ? formData.recommended_features : [];
    payload.keywords = typeof formData.keywords === 'string' ? formData.keywords.trim() : (formData.keywords || '');
    payload.negative_keywords = typeof formData.negative_keywords === 'string' ? formData.negative_keywords.trim() : (formData.negative_keywords || '');
    payload.discipline = formData.discipline || 'Universal';
    payload.sphere = formData.sphere || 'General';
    payload.subdiscipline = formData.subdiscipline || '';
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

    const acq = formData.acquisition_type || (
      formData.multi && formData.staged ? 'Multi/Staged' :
      formData.staged ? 'Staged' :
      formData.multi ? 'Multiple' : 'Basic'
    );
    const isMulti = acq === 'Multiple' || acq === 'Multi/Staged';
    const isStaged = acq === 'Staged' || acq === 'Multi/Staged';
    payload.acquisition_type = acq;
    payload.multi = isMulti;
    payload.staged = isStaged;
    payload.is_multiple = isMulti;
    payload.is_ranked = isStaged;

    const rawModOptions = formData.modifier_options;
    payload.modifier_options = rawModOptions && typeof rawModOptions === 'object' ? {
      enabled: Boolean(rawModOptions.enabled),
      mode: rawModOptions.mode === 'pair' ? 'pair' : 'single',
      value: Number(rawModOptions.value !== undefined ? rawModOptions.value : 2),
      options: Array.isArray(rawModOptions.options) ? rawModOptions.options : []
    } : {
      enabled: false,
      mode: 'single',
      value: 2,
      options: []
    };
    payload.selected_option_id = formData.selected_option_id || '';
  }

  // Ensure traits directives and values are synchronized
  if (resolvedMatrix.id === 'traits') {
    payload.trait_type = formData.trait_type || 'Species Trait';
    payload.trait_tier = formData.trait_tier || 'Basic';
    payload.classification = formData.classification || 'Physical';
    payload.cp = Number(formData.cp !== undefined ? formData.cp : 1);
    payload.bp = Number(formData.bp !== undefined ? formData.bp : payload.cp);
    payload.description = formData.description || '';
    payload.mechanic = formData.mechanic || '';
    payload.note = formData.note || '';
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
