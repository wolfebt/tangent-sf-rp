import { DEFAULT_SPECIES_TYPES } from '../data/speciesTypesData.js';
import { DEFAULT_SPECIES_SIZES } from '../data/speciesSizeData.js';
import { BASIC_MOVEMENT_MODES } from '../data/speciesMovementData.js';
import { ALL_CANONICAL_TRAITS } from '../data/speciesTraitsData.js';

/**
 * Curated knowledge base for known species inherent traits across the Tangent Omnicortex,
 * mapping canonical IDs and patterns to simple, clear names, categories, and explanatory tooltips.
 */
export const KNOWN_SPECIES_TRAIT_DESCRIPTIONS = {
  // Aeld
  'trait-aeld-lineage-traits': {
    name: 'Aeld Lineage',
    category: 'Trait',
    description: 'Inherent ancestral adaptations of the Aeld: Awakened (Arcane) [2], Lifespan 600+ [1], and Immune to Sleep [2].',
    rules: 'Awakened (Arcane), Extended Lifespan 600+, Sleep Immunity.'
  },
  'trait-alter-form-humanoid-special-ability': {
    name: 'Alter Form',
    category: 'Humanoid Special Ability',
    description: 'Mutable cellular matrix allowing the entity to alter its physical form, voice, and appearance to mimic other humanoid species (+5 to Disguise checks).',
    rules: 'Active shapechanging into humanoid forms; grants +5 bonus to Disguise and infiltration rolls.'
  },
  'trait-sense-alignment-intent': {
    name: 'Sense Alignment / Intent',
    category: 'Trait',
    description: 'Innate 60 ft radius detection of alignment, intent, or supernatural malice. Intrusively alerts senses when near extreme morality or vile planning.',
    rules: 'Uncontrolled sensory detection within 60 ft radius; senses targets with Extreme Morality or hostile intent.'
  },
  'trait-awakened-arcane': {
    name: 'Awakened (Arcane)',
    category: 'Trait',
    description: 'Innate biological attunement to mystical and arcane frequencies, allowing direct manipulation of meta-phenomena.',
    rules: 'Grants innate Metaphysics casting capability for Arcane disciplines.'
  },
  'trait-long-lived-600-years': {
    name: 'Extended Lifespan (600+ Years)',
    category: 'Trait',
    description: 'Cellular degradation is dramatically arrested, allowing a lifespan exceeding six centuries without frailty.',
    rules: 'Immune to natural age-related physical infirmity.'
  },
  'trait-sleepless-immune-to-sleep-effects': {
    name: 'Sleepless (Sleep Immunity)',
    category: 'Trait',
    description: 'The entity’s neurology does not require sleep and is biologically impervious to sleep spells, sedatives, and trance toxins.',
    rules: 'Immune to magical and biological sleep effects.'
  },

  // Asi
  'trait-asi-base-traits-ageless-obfuscate-sleepless': {
    name: 'Asi Base',
    category: 'Trait',
    description: 'Innate ancestral fey traits of the Asi lineages: Ageless [2], Obfuscate [2], and Sleepless [2].',
    rules: 'Ageless biological matrix, innate Obfuscate illusion aura, and sleep immunity.'
  },

  // Auluran
  'trait-auluran-traits-biotechnology-low-light-prehensile-scent': {
    name: 'Auluran Base',
    category: 'Trait',
    description: 'Biotechnological feline predator traits: Biotechnology [2], Low-Light Vision [1], Prehensile Feet/Tail [3], Scent [1], Natural Weapons [2].',
    rules: 'Enhanced sensory perception, natural claws, prehensile limbs, and innate biotechnology synergy.'
  },

  // Kitin
  'trait-kitin-base-traits-awakened-psychic-biotech-hive-connection-sleepless': {
    name: 'Kitin Base',
    category: 'Trait',
    description: 'Chitinous insectoid collective traits: Awakened (Psychic), Biotechnology, Hive Connection mesh, Sleepless.',
    rules: 'Sub-dermal chitin, shared hive telepathy mesh, and sleepless vigilance.'
  },

  // Synthetic
  'trait-synthetic-base-traits': {
    name: 'Synthetic Chassis',
    category: 'Trait',
    description: 'Inorganic chassis properties: Digitized Mind, Robotic Strength, Resilient Design, Immune to biological poison and disease.',
    rules: 'Immune to biological toxins, disease, and asphyxiation; vulnerable to electromagnetic damage.'
  },

  // Draconian & Dragonkin
  'trait-dragonkin-traits-partial-scales-dr-1-heat-resistance': {
    name: 'Dragonkin',
    category: 'Trait',
    description: 'Partial scales providing Damage Reduction (DR 1) and natural thermal heat resistance.',
    rules: 'Grants natural +1 DR against physical attacks and thermal damage resistance.'
  },
  'trait-dragonkin-heritage-scales-dr-2': {
    name: 'Dragonkin Heritage (Scales DR 2)',
    category: 'Trait',
    description: 'Hardened draconic scales providing Damage Reduction (DR 2) and environmental resilience.',
    rules: 'Grants +2 DR natural armor.'
  },

  // Progenitor & Void
  'trait-matter-reshaping-special-ability': {
    name: 'Matter Reshaping',
    category: 'Special Ability',
    description: 'Precursor molecular manipulation ability allowing the alteration, synthesis, and reshaping of non-living matter.',
    rules: 'Active molecular control action to reshape inorganic materials.'
  },
  'trait-teleportal-special-ability-short-jump': {
    name: 'Teleportal (Short Jump)',
    category: 'Special Ability',
    description: 'Dimensional psionic ability allowing short instantaneous tactical teleportation across space.',
    rules: 'Instantaneous short-range tactical teleport as a move action.'
  },
  'trait-technokinesis-special-ability': {
    name: 'Technokinesis',
    category: 'Special Ability',
    description: 'Direct neural and electromagnetic command over computational arrays, hardware, and robotic constructs.',
    rules: 'Remotely interface with and influence electronic systems without physical data links.'
  },
  'trait-homing-special-ability-spatial-recall': {
    name: 'Homing (Spatial Recall)',
    category: 'Special Ability',
    description: 'Dimensional sanctuary lock providing instantaneous spatial awareness and return calibration to attuned points.',
    rules: 'Spatial memory recall and sanctuary coordinate attunement.'
  },
  'trait-alter-form-void-wisp-shadow-special-ability': {
    name: 'Alter Form (Void Wisp Shadow)',
    category: 'Special Ability',
    description: 'Dissolves physical form into a semi-corporeal shadowy void wisp, traversing barriers and avoiding detection.',
    rules: 'Phase into void wisp state; bypass non-airtight physical barriers.'
  }
};

/**
 * Format Species Type (The Chassis)
 * Output label format: "[Name] - Species Type"
 */
export const formatSpeciesType = (rawType) => {
  if (Array.isArray(rawType)) rawType = rawType[0];
  if (typeof rawType === 'object' && rawType !== null) rawType = rawType.name || rawType.id || '';
  const str = String(rawType || 'Humanoid').trim();
  const cleanId = str.toLowerCase().replace(/^species_type-/, '').replace(/[-_]/g, ' ');

  const match = DEFAULT_SPECIES_TYPES.find(t =>
    t.id.toLowerCase() === str.toLowerCase() ||
    t.name.toLowerCase() === cleanId.toLowerCase() ||
    t.id.toLowerCase().includes(cleanId.toLowerCase())
  );

  const name = match ? match.name : (cleanId.charAt(0).toUpperCase() + cleanId.slice(1));
  const label = `${name} - Species Type`;

  return {
    id: match ? match.id : str,
    name,
    category: 'Species Type',
    label,
    tooltip: {
      title: `${name} (Species Type)`,
      badge: 'Species Type',
      description: match?.description || 'Species chassis defining physical constitution, baseline senses, and biological classification.',
      rules: match ? `Senses: ${match.senses || 'Standard'} | Physiology: ${match.physiology || 'Standard'} | Immunities: ${match.immunities || 'None'}` : '',
      cost: match ? `${match.cp ?? match.bp ?? 0} CP` : undefined
    }
  };
};

/**
 * Format Species Size
 * Output label format: "[Name] - Species Size"
 */
export const formatSpeciesSize = (rawSize) => {
  if (Array.isArray(rawSize)) rawSize = rawSize[0];
  if (typeof rawSize === 'object' && rawSize !== null) rawSize = rawSize.name || rawSize.id || '';
  const str = String(rawSize || 'Medium').trim();
  const cleanId = str.toLowerCase().replace(/^species_size-/, '').replace(/[-_]/g, ' ');

  const match = DEFAULT_SPECIES_SIZES.find(s =>
    s.id.toLowerCase() === str.toLowerCase() ||
    s.name.toLowerCase() === cleanId.toLowerCase() ||
    s.id.toLowerCase().includes(cleanId.toLowerCase())
  );

  const name = match ? match.name : (cleanId.charAt(0).toUpperCase() + cleanId.slice(1));
  const label = `${name} - Species Size`;

  return {
    id: match ? match.id : str,
    name,
    category: 'Species Size',
    label,
    tooltip: {
      title: `${name} (Species Size)`,
      badge: 'Species Size',
      description: match?.description || 'Species physical volume, height, weight scale, and size modifiers.',
      rules: match ? `Height: ${match.height_length_range || '—'} | Weight: ${match.weight_range || '—'} | Reach: ${match.reach || '5 ft'} | Scaling: ${match.scaling_display || '1.0'}` : ''
    }
  };
};

/**
 * Format Species Movement
 * Output label format: "[Name] - Species Movement"
 */
export const formatSpeciesMovement = (rawMovement) => {
  if (Array.isArray(rawMovement)) rawMovement = rawMovement[0];
  if (typeof rawMovement === 'object' && rawMovement !== null) rawMovement = rawMovement.name || rawMovement.id || '';
  const str = String(rawMovement || 'species_movement-bipedal').trim();
  const cleanId = str.toLowerCase().replace(/^species_movement-/, '').replace(/[-_]/g, ' ');

  const match = BASIC_MOVEMENT_MODES.find(m =>
    m.id.toLowerCase() === str.toLowerCase() ||
    m.name.toLowerCase().includes(cleanId) ||
    cleanId.includes(m.target_mode?.toLowerCase() || '') ||
    cleanId.includes(m.type?.toLowerCase() || '')
  );

  let shortName = match ? match.name.replace(/ Locomotion$/i, '') : (cleanId.charAt(0).toUpperCase() + cleanId.slice(1));
  if (shortName.toLowerCase() === 'bipedal') shortName = 'Bipedal';
  const label = `${shortName} - Species Movement`;

  return {
    id: match ? match.id : str,
    name: match?.name || shortName,
    shortName,
    category: 'Species Movement',
    label,
    tooltip: {
      title: `${match?.name || shortName} (Species Movement)`,
      badge: 'Species Movement',
      description: match?.description?.split('\n\n### Tactical')[0] || match?.description || 'Species locomotion mode and baseline tactical travel speeds.',
      rules: match ? `Base Speed: ${match.base_speed || match.speed || 30} ft/round (${match.type || 'Ground'})` : ''
    }
  };
};

/**
 * Clean and format trait names from slugs or raw strings.
 */
const cleanTraitName = (rawStr) => {
  let s = String(rawStr || '').trim();
  // Strip category prefixes
  s = s.replace(/^(trait|feature)[-_]/i, '');
  // Strip trailing trait/traits
  s = s.replace(/[-_]traits?$/i, '');
  // Format specific known patterns
  s = s.replace(/[-_]ft/gi, ' ft');
  s = s.replace(/dr[-_](\d+)/gi, 'DR $1');
  s = s.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  return s.replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Format Species Trait (including Humanoid Special Ability, Special Ability, or Trait)
 * Output label format: "[Name] - [Category]"
 * where Category is "Humanoid Special Ability", "Special Ability", or "Trait"
 */
export const formatSpeciesTrait = (rawTrait, speciesContext = null) => {
  if (!rawTrait) return { name: '', category: 'Trait', label: '', tooltip: {} };

  const rawId = typeof rawTrait === 'object' ? (rawTrait.id || rawTrait.name || '') : String(rawTrait);
  const cleanId = rawId.toLowerCase().trim();

  // 1. Check known curated trait descriptions
  if (KNOWN_SPECIES_TRAIT_DESCRIPTIONS[cleanId]) {
    const k = KNOWN_SPECIES_TRAIT_DESCRIPTIONS[cleanId];
    return {
      id: rawId,
      name: k.name,
      category: k.category,
      label: `${k.name} - ${k.category}`,
      tooltip: {
        title: `${k.name} (${k.category})`,
        badge: k.category,
        description: k.description,
        rules: k.rules
      }
    };
  }

  // 2. Check canonical database
  const canonical = ALL_CANONICAL_TRAITS.find(t =>
    t.id?.toLowerCase() === cleanId ||
    t.name?.toLowerCase() === cleanId ||
    t.id?.toLowerCase() === `trait-${cleanId}`
  );

  if (canonical) {
    let cat = 'Trait';
    if (canonical.category === 'special_ability' || canonical.trait_type?.toLowerCase().includes('special ability')) {
      cat = cleanId.includes('humanoid') ? 'Humanoid Special Ability' : 'Special Ability';
    }
    const name = canonical.name;
    const label = `${name} - ${cat}`;
    return {
      id: canonical.id || rawId,
      name,
      category: cat,
      label,
      tooltip: {
        title: `${name} (${cat})`,
        badge: cat,
        description: canonical.description || canonical.body?.split('\n\n## Description\n')?.[1]?.split('\n\n')[0] || `${name} species trait.`,
        rules: canonical.special_rules || canonical.rules || canonical.notes || '',
        cost: canonical.bp ? `${canonical.bp} BP` : undefined
      }
    };
  }

  // 3. Fallback smart parsing for ad-hoc trait identifiers
  let category = 'Trait';
  let innerStr = cleanId.replace(/^(trait|feature)[-_]/i, '');

  if (innerStr.includes('humanoid-special-ability') || innerStr.includes('humanoid_special_ability')) {
    category = 'Humanoid Special Ability';
    innerStr = innerStr.replace(/[-_]?humanoid[-_]special[-_]ability/i, '');
  } else if (innerStr.includes('special-ability') || innerStr.includes('special_ability')) {
    category = 'Special Ability';
    innerStr = innerStr.replace(/[-_]?special[-_]ability/i, '');
  }

  let name = cleanTraitName(innerStr);
  if (!name) name = 'Species Adaptation';

  // Quality of life improvements for common species trait labels
  if (name.toLowerCase() === 'aeld' || name.toLowerCase() === 'aeld lineage') {
    name = 'Aeld Lineage';
  } else if (name.toLowerCase().includes('sense alignment') || name.toLowerCase().includes('sense evil')) {
    name = 'Sense Alignment / Intent';
  } else if (name.toLowerCase() === 'alter form') {
    name = 'Alter Form';
  }

  const label = `${name} - ${category}`;

  return {
    id: rawId,
    name,
    category,
    label,
    tooltip: {
      title: `${name} (${category})`,
      badge: category,
      description: `${name} is an innate ${category.toLowerCase()} granted by this species lineage.`,
      rules: ''
    }
  };
};

/**
 * Retrieve the clean, deduplicated array of all inherent guaranteed traits
 * from a selectedSpecies object across traits, species_traits, inherent_traits, and inherent_features.
 */
export const getInherentSpeciesTraits = (selectedSpecies) => {
  if (!selectedSpecies) return [];

  const rawPool = [
    ...(Array.isArray(selectedSpecies.inherent_traits) ? selectedSpecies.inherent_traits : []),
    ...(Array.isArray(selectedSpecies.traits) ? selectedSpecies.traits : []),
    ...(Array.isArray(selectedSpecies.species_traits) ? selectedSpecies.species_traits : []),
    ...(Array.isArray(selectedSpecies.inherent_features) ? selectedSpecies.inherent_features : [])
  ];

  const seen = new Set();
  const result = [];

  rawPool.forEach(item => {
    const key = typeof item === 'object' ? (item.id || item.name || '') : String(item);
    const cleanKey = key.toLowerCase().trim();
    if (cleanKey && !seen.has(cleanKey)) {
      seen.add(cleanKey);
      result.push(item);
    }
  });

  return result;
};
