/**
 * ════════════════════════════════════════════════════════════════════════════════
 * OMNICORTEX & RULES CODEX — DECLARATIVE GUIDED STUDIO PLAYBOOK REGISTRY
 * Maps all 84 Omnicortex categoryConfig schemas and 36 Rules Codex matrices into
 * modular, step-by-step guided creation playbooks across 8 canonical domain families.
 * ════════════════════════════════════════════════════════════════════════════════
 */

export const SOCIETY_SPHERE_KEYS = new Set([
  'society_agriculture',
  'society_architecture',
  'society_biotechnology',
  'society_commerce',
  'society_communication',
  'society_computation',
  'society_devices',
  'society_education',
  'society_energy',
  'society_manufacturing',
  'society_materials',
  'society_medicine',
  'society_science',
  'society_society',
  'society_synthetic_intelligence',
  'society_synthetics',
  'society_transportation',
  'society_weaponry'
]);

export const DEV_PARAMETER_KEYS = new Set([
  'attributes',
  'augmentation_type',
  'body_location',
  'prerequisite',
  'modifier',
  'area',
  'effect',
  'range',
  'target',
  'critical_effect',
  'critical_effects',
  'critical_success',
  'critical_success_effect',
  'critical_failure',
  'critical_failure_effect',
  'creator',
  'design',
  'component',
  'classification',
  'gear_category',
  'availability',
  'special',
  'mode',
  'material',
  'resistance'
]);

export const SPECIES_SUBSCHEMA_KEYS = new Set([
  'trait',
  'species_lineage',
  'species_type',
  'species_size',
  'species_movement'
]);

export const WORLD_ELEMENT_KEYS = new Set([
  'universe',
  'setting',
  'philosophy',
  'scene',
  'world_design'
]);

export const RULES_DOCUMENT_KEYS = new Set([
  'compendium',
  'user_guide',
  'rules',
  'conditions',
  'damage_types',
  'maneuvers',
  'synthesis'
]);

/**
 * Normalizes any Omnicortex collection key or Codex matrix ID into a canonical lookup key.
 */
export function normalizeStudioDomainKey(rawKey, matrix = null) {
  const k = String(rawKey || matrix?.targetCollection || matrix?.id || 'equipment')
    .trim()
    .toLowerCase();

  const ALIAS_MAP = {
    weapons: 'weaponry',
    weapon: 'weaponry',
    attacks: 'weaponry',
    armor: 'armoring',
    shields: 'armoring',
    equipment: 'gear',
    personal_property: 'gear',
    items: 'gear',
    augmentation: 'augmentations',
    cybernetics: 'augmentations',
    bioware: 'augmentations',
    vehicles: 'mecha',
    starships: 'mecha',
    facilities: 'architecture',
    other_property: 'other',
    commodities: 'other',
    trade_goods: 'other',
    'char-species': 'species',
    lineages: 'species',
    species_traits: 'trait',
    species_disadvantages: 'disadvantages',
    hindrances: 'disadvantages',
    disadvantage: 'disadvantages',
    feature: 'features',
    skill: 'skills',
    archetype: 'archetypes',
    'char-archetype': 'archetypes',
    occupation: 'occupations',
    'char-occu': 'occupations',
    career: 'occupations',
    origin: 'origins',
    faction: 'factions',
    'char-faction': 'factions',
    invocation: 'invocations',
    awakened: 'invocations',
    metaphysics: 'invocations',
    special_ability: 'special_abilities',
    'modular-characters': 'modular_characters',
    threats: 'modular_characters',
    bestiary: 'modular_characters',
    companion: 'companions',
    'planetary-design': 'planetary_design',
    planets: 'planetary_design',
    worlds: 'world',
    condition: 'conditions',
    'ingestion-engine': 'compendium'
  };

  return ALIAS_MAP[k] || k;
}

const hasText = (v) => typeof v === 'string' && v.trim().length > 0;
const hasListOrText = (v) => (Array.isArray(v) ? v.length > 0 : hasText(v));
const hasNumberOrText = (v) => (typeof v === 'number' && !Number.isNaN(v)) || hasText(v);

/**
 * Evaluates readiness status ('empty' | 'partial' | 'valid' | 'warning') for a given step.
 */
export function evaluateStepReadiness(step, formData = {}, liveBuildCheck = null) {
  if (!step) return { status: 'empty', summary: 'Pending', score: 0 };

  if (typeof step.evaluate === 'function') {
    return step.evaluate(formData, liveBuildCheck);
  }

  const requiredFields = Array.isArray(step.requiredFields) ? step.requiredFields : [];
  const recommendedFields = Array.isArray(step.recommendedFields) ? step.recommendedFields : [];

  if (requiredFields.length === 0 && recommendedFields.length === 0) {
    return { status: 'valid', summary: 'Ready', score: 100 };
  }

  const reqFilled = requiredFields.filter((f) => hasListOrText(formData[f]) || typeof formData[f] === 'number').length;
  const recFilled = recommendedFields.filter((f) => hasListOrText(formData[f]) || typeof formData[f] === 'number').length;

  if (reqFilled === 0 && recFilled === 0) {
    return { status: 'empty', summary: 'Not started', score: 0 };
  }

  if (requiredFields.length > 0 && reqFilled < requiredFields.length) {
    return {
      status: 'partial',
      summary: `${reqFilled}/${requiredFields.length} required`,
      score: Math.round((reqFilled / requiredFields.length) * 60)
    };
  }

  const total = requiredFields.length + recommendedFields.length;
  const filled = reqFilled + recFilled;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 100;

  return {
    status: pct >= 70 ? 'valid' : 'partial',
    summary: pct >= 70 ? 'Configured' : `${filled}/${total} fields`,
    score: pct
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 1. BIOLOGICAL & XENOTYPE LINEAGES PLAYBOOKS
 * ───────────────────────────────────────────────────────────────────────────── */

function buildSpeciesPlaybook() {
  return {
    id: 'species',
    family: 'biological',
    title: 'Species & Xenotype Guided Studio',
    subtitle: 'Operator Guide 1.03 • Dynamic Species CP Package & Genetics Architecture',
    accentColor: '#38bdf8',
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Taxon, Lineage & Seed',
        shortLabel: '1. TAXON',
        sublabel: 'Lineage, Homeworld & Exemplar',
        iconName: 'Dna',
        color: '#38bdf8',
        viewType: 'blueprint_specs',
        description: 'Establish the canonical parent lineage, sub-species designation, homeworld origin, and baseline Tech/Meta sophistication, or fork from an existing Cortex species.',
        ragQuery: 'Species creation parent lineage sub-species homeworld tech level meta level',
        ragTags: ['species', 'character_creation'],
        requiredFields: ['name', 'parent_species'],
        recommendedFields: ['homeworld', 'description']
      },
      {
        id: 'morphology',
        stepNumber: 2,
        label: 'Chassis, Size & Locomotion',
        shortLabel: '2. CHASSIS',
        sublabel: 'Bio vs Synthetic, Size & Pace',
        iconName: 'Layers',
        color: '#0ea5e9',
        viewType: 'configurator',
        configuratorSection: 'chassis',
        geneticsTab: 'chassis',
        description: 'Configure biological vs. synthetic chassis (30 VP / 30 HP vs. unified 60 SP Structure), volumetric size tier, and native movement modes.',
        ragQuery: 'Damage pools 30 Vitality 30 Health 60 Structure synthetic size movement speed',
        ragTags: ['species', 'vitals_integrity', 'udu'],
        subSteps: [
          { id: 'chassis', label: 'Biological / Synthetic Chassis & Size', shortLabel: 'Chassis & Size', geneticsTab: 'chassis', iconName: 'Shield' },
          { id: 'movement', label: 'Locomotion & Movement Paces', shortLabel: 'Locomotion', geneticsTab: 'movement', iconName: 'Activity' }
        ],
        evaluate: (fd) => {
          const hasType = hasListOrText(fd.type || fd.species_type);
          const hasSize = hasListOrText(fd.size);
          return hasType && hasSize
            ? { status: 'valid', summary: 'Chassis set', score: 100 }
            : { status: 'partial', summary: 'Select type & size', score: 50 };
        }
      },
      {
        id: 'traits',
        stepNumber: 3,
        label: 'Innate Genetics & Traits',
        shortLabel: '3. TRAITS',
        sublabel: '1 / 2 / 4 CP Physiological Traits',
        iconName: 'Sparkles',
        color: '#a855f7',
        viewType: 'configurator',
        configuratorSection: 'traits',
        geneticsTab: 'traits',
        description: 'Select innate physiological, sensory, or synthetic traits (1, 2, or 4 CP) from the Omnicortex Trait Registry and parameterize selectable trait choices.',
        ragQuery: 'Species physiological traits CP cost biological synthetic innate abilities',
        ragTags: ['species', 'character_creation'],
        evaluate: (fd) => {
          const count = Array.isArray(fd.traits || fd.trait) ? (fd.traits || fd.trait).length : 0;
          return count > 0
            ? { status: 'valid', summary: `${count} trait${count === 1 ? '' : 's'}`, score: 100 }
            : { status: 'empty', summary: '0 traits', score: 0 };
        }
      },
      {
        id: 'aptitudes',
        stepNumber: 4,
        label: 'Attributes, Skills & Talents',
        shortLabel: '4. APTITUDES',
        sublabel: 'Modifiers, Pools & Features',
        iconName: 'Award',
        color: '#10b981',
        viewType: 'configurator',
        configuratorSection: 'attributes',
        geneticsTab: 'attributes',
        description: 'Assign inherent attribute adjustments (5 CP per +1), cultural skill bundles, innate features (3 CP), and structured universal modifiers.',
        ragQuery: '150 CP attributes 5 CP skill bundles features modifiers species',
        ragTags: ['character_creation', 'species'],
        subSteps: [
          { id: 'attributes', label: 'Attribute & Skill Modifiers', shortLabel: 'Attributes & Skills', geneticsTab: 'attributes', iconName: 'Sliders' },
          { id: 'features', label: 'Inherent & Recommended Features', shortLabel: 'Features', geneticsTab: 'features', iconName: 'Award' },
          { id: 'modifiers', label: 'Structured Modifier Matrix', shortLabel: 'Modifiers', geneticsTab: 'modifiers', iconName: 'Calculator' }
        ],
        evaluate: (fd) => {
          const modCount = (Array.isArray(fd.modifiers) ? fd.modifiers.length : 0) +
            (Array.isArray(fd.attribute_modifiers) ? fd.attribute_modifiers.length : 0) +
            (Array.isArray(fd.inherent_features) ? fd.inherent_features.length : 0);
          return modCount > 0
            ? { status: 'valid', summary: `${modCount} active`, score: 100 }
            : { status: 'partial', summary: 'Baseline (0 mods)', score: 65 };
        }
      },
      {
        id: 'hindrances',
        stepNumber: 5,
        label: 'Disadvantages & Social Stigma',
        shortLabel: '5. FLAWS',
        sublabel: 'Innate Drawbacks & Reaction Mod',
        iconName: 'ShieldAlert',
        color: '#f43f5e',
        viewType: 'configurator',
        configuratorSection: 'disadvantages',
        geneticsTab: 'disadvantages',
        description: 'Balance the species CP package with biological/synthetic disadvantages and galactic social stigma tiers (exempt from the +10 CP personal hindrance cap).',
        ragQuery: 'Species disadvantages social stigma CP rebate hindrance cap',
        ragTags: ['character_creation', 'species'],
        subSteps: [
          { id: 'disadvantages', label: 'Species Disadvantages & Rebates', shortLabel: 'Disadvantages', geneticsTab: 'disadvantages', iconName: 'ShieldAlert' },
          { id: 'stigma', label: 'Galactic Social Stigma', shortLabel: 'Social Stigma', geneticsTab: 'stigma', iconName: 'Users' }
        ],
        evaluate: (fd) => {
          const disCount = Array.isArray(fd.disadvantages) ? fd.disadvantages.length : 0;
          const hasStigma = hasText(fd.stigma || fd.social_stigma) && (fd.stigma || fd.social_stigma) !== 'None';
          return (disCount > 0 || hasStigma)
            ? { status: 'valid', summary: `${disCount} flaw${disCount === 1 ? '' : 's'}${hasStigma ? ' + Stigma' : ''}`, score: 100 }
            : { status: 'valid', summary: 'Optional (None)', score: 85 };
        }
      },
      {
        id: 'lore_audit',
        stepNumber: 6,
        label: 'Lore, 5-Pillar Synergies & Audit',
        shortLabel: '6. LORE & AUDIT',
        sublabel: 'Dossier, Synergies & CP Check',
        iconName: 'BookOpen',
        color: '#c084fc',
        viewType: 'final_review',
        description: 'Author self-contained biology/cultural lore, link recommended Factions, Origins, Occupations & Archetypes using Cortex synergy scoring, and verify the Species CP ledger.',
        ragQuery: 'Species lore culture 5-pillar synergies build cost validation',
        ragTags: ['species', 'factions', 'character_creation'],
        subSteps: [
          { id: 'narrative', label: 'Biology, Culture & Markdown Lore', shortLabel: 'Lore Dossier', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: '5-Pillar Cortex Synergies', shortLabel: '5-Pillar Links', viewSlice: 'relational', iconName: 'Compass' },
          { id: 'audit', label: 'Species CP Ledger & Schema Audit', shortLabel: 'CP Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        evaluate: (fd, buildCheck) => {
          if (buildCheck?.status === 'error' || buildCheck?.hasUnaccountedItems) {
            return { status: 'warning', summary: 'Review CP check', score: 60 };
          }
          const hasLore = hasText(fd.body || fd.lore || fd.description);
          return hasLore
            ? { status: 'valid', summary: 'Ready to commit', score: 100 }
            : { status: 'partial', summary: 'Add lore dossier', score: 55 };
        }
      }
    ]
  };
}

function buildSpeciesSubschemaPlaybook(domainKey) {
  const META = {
    trait: {
      title: 'Species Trait Guided Studio',
      subtitle: 'Genetics Sub-Schema • 1 / 2 / 4 CP Physiological & Synthetic Traits',
      color: '#a855f7'
    },
    species_lineage: {
      title: 'Parent Species Lineage Studio',
      subtitle: 'Taxonomy Sub-Schema • 10 Canonical Macro-Lineages & Ancestral Lore',
      color: '#10b981'
    },
    species_type: {
      title: 'Biological / Synthetic Chassis Type Studio',
      subtitle: 'Physiology Sub-Schema • Vitality/Health vs. Structure Immunities',
      color: '#38bdf8'
    },
    species_size: {
      title: 'Volumetric Size Tier Studio',
      subtitle: 'Scaling Sub-Schema • Fine to Colossal Hit Pools, Reach & Defense',
      color: '#f59e0b'
    },
    species_movement: {
      title: 'Locomotion & Movement Mode Studio',
      subtitle: 'Kinematics Sub-Schema • Bipedal, Flight, Aquatic, Hover & Burrow Paces',
      color: '#06b6d4'
    }
  }[domainKey] || {
    title: 'Genetics Sub-Component Studio',
    subtitle: 'Omnicortex Biological Sub-Schema',
    color: '#38bdf8'
  };

  return {
    id: domainKey,
    family: 'biological',
    title: META.title,
    subtitle: META.subtitle,
    accentColor: META.color,
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Taxonomy & Tier Identity',
        shortLabel: '1. IDENTITY',
        sublabel: 'Designation, Tier & Chassis Scope',
        iconName: 'Dna',
        color: META.color,
        viewType: 'blueprint_specs',
        configuratorSection: 'identity',
        description: 'Define the canonical identifier, tier/CP cost, and biological/synthetic compatibility rules.',
        ragQuery: `${domainKey} species genetics CP cost chassis compatibility`,
        ragTags: ['species', 'character_creation'],
        requiredFields: ['name'],
        recommendedFields: ['description']
      },
      {
        id: 'mechanics',
        stepNumber: 2,
        label: 'Mechanical Rules & Choice Schema',
        shortLabel: '2. MECHANICS',
        sublabel: 'Bonuses, Choices & Modifiers',
        iconName: 'Sliders',
        color: '#f59e0b',
        viewType: 'configurator',
        configuratorSection: 'mechanics',
        widgets: ['modifiers'],
        description: 'Configure mechanical effects, selectable choice parameters, hit-pool/pace adjustments, and universal modifiers.',
        ragQuery: `${domainKey} modifiers skill bonus defense vitality structure`,
        ragTags: ['species', 'combat', 'vitals_integrity'],
        recommendedFields: ['mechanic']
      },
      {
        id: 'lore_audit',
        stepNumber: 3,
        label: 'Lore & Linked Species Impact',
        shortLabel: '3. IMPACT & LORE',
        sublabel: 'Dossier & Cortex Reverse-Lookup',
        iconName: 'BookOpen',
        color: '#c084fc',
        viewType: 'final_review',
        description: 'Document anatomical/evolutionary lore and inspect every canonical Omnicortex species currently referencing this component.',
        ragQuery: `${domainKey} species lore taxonomy`,
        ragTags: ['species', 'lore'],
        subSteps: [
          { id: 'narrative', label: 'Compendium Lore & Notes', shortLabel: 'Lore', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: 'Linked Species & Dependencies', shortLabel: 'Cortex Impact', viewSlice: 'relational', iconName: 'Users' },
          { id: 'audit', label: 'Schema Readiness Check', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 2. 5-PILLAR CHARACTER IDENTITY PLAYBOOKS
 * ───────────────────────────────────────────────────────────────────────────── */

function buildFactionPlaybook() {
  return {
    id: 'factions',
    family: 'identity_pillar',
    title: 'Faction & Interstellar Polity Studio',
    subtitle: 'Operator Guide 1.04 • 20-SP Faction Pool, WS Standing & 5-Axis Ideology',
    accentColor: '#10b981',
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Polity Identity & Territory',
        shortLabel: '1. POLITY',
        sublabel: 'Government, Capital & TL/ML',
        iconName: 'Flag',
        color: '#10b981',
        viewType: 'blueprint_specs',
        description: 'Define the faction classification, leadership structure, capital world, Tech/Meta baseline, and high-concept identity.',
        ragQuery: 'Faction creation polity government tech level meta level character background',
        ragTags: ['factions', 'character_creation', 'economatrix'],
        requiredFields: ['name'],
        recommendedFields: ['faction_type', 'capital_world', 'description']
      },
      {
        id: 'operator_package',
        stepNumber: 2,
        label: 'Operator Package (20 SP & Perks)',
        shortLabel: '2. 20-SP PACKAGE',
        sublabel: 'Skills, Features & Archetypes',
        iconName: 'Award',
        color: '#34d399',
        viewType: 'configurator',
        configuratorSection: 'operator_package',
        widgets: ['modifiers'],
        description: 'Curate the 20-Point Faction Skill Package, discounted Recommended Features, Bonus Origin Traits, and signature operator archetypes from the Cortex.',
        ragQuery: '150 CP three 20-point background skill pools faction skills features',
        ragTags: ['character_creation', 'factions'],
        recommendedFields: ['skill_package', 'recommended_features', 'mechanic']
      },
      {
        id: 'military_economy',
        stepNumber: 3,
        label: 'Military, Trade, WS & Law',
        shortLabel: '3. POWER & TRADE',
        sublabel: 'Doctrine, Fleet, WS Mod & Law',
        iconName: 'Shield',
        color: '#f59e0b',
        viewType: 'configurator',
        configuratorSection: 'military_economy',
        description: 'Specify military combat doctrine, elite formations, void fleet hulls, Wealth Score modifier (-4 to +8 WS), Law Level (0–15), and strategic exports.',
        ragQuery: 'Economatrix wealth score faction standing trade codes law level',
        ragTags: ['economatrix', 'factions'],
        recommendedFields: ['military_doctrine', 'wealth_modifier', 'economic_model']
      },
      {
        id: 'ideology_civilization',
        stepNumber: 4,
        label: '5-Axis Ideology & Civilization',
        shortLabel: '4. IDEOLOGY',
        sublabel: '5 Sociological Axes & 16 Domains',
        iconName: 'Compass',
        color: '#a855f7',
        viewType: 'configurator',
        configuratorSection: 'ideology',
        includeSuiteTab: 'technology',
        description: 'Align the polity across the 5 Canonical Ideological Axes (Economic, Authority, Technocratic, Metaphysical, Diplomatic) and optional 16-Domain Civilization Radar.',
        ragQuery: 'Planetary UWP 16-domain civilization radar faction ideology',
        ragTags: ['factions', 'planetary'],
        recommendedFields: ['ideology_economic', 'ideology_authority']
      },
      {
        id: 'lore_audit',
        stepNumber: 5,
        label: 'Chronicle, Diplomacy & Audit',
        shortLabel: '5. CHRONICLE',
        sublabel: 'Beliefs, Rivals & Pillar Links',
        iconName: 'BookOpen',
        color: '#38bdf8',
        viewType: 'final_review',
        description: 'Record core beliefs, social hierarchy, foreign diplomacy, motto/slang, and cross-pillar Cortex synergies.',
        ragQuery: 'Faction lore diplomacy cross-pillar species origins occupations',
        ragTags: ['factions', 'lore'],
        subSteps: [
          { id: 'narrative', label: 'Sociological Lore, Beliefs & Motto', shortLabel: 'Chronicle', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: 'Allies, Rivals & 5-Pillar Synergies', shortLabel: 'Diplomacy & Links', viewSlice: 'relational', iconName: 'Globe' },
          { id: 'audit', label: 'Faction Readiness Audit', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

function buildOriginPlaybook() {
  return {
    id: 'origins',
    family: 'identity_pillar',
    title: 'Origin & Homeworld Environment Studio',
    subtitle: 'Operator Guide 1.05 • 20-SP Society Skill Pool & Homeworld Traits',
    accentColor: '#10b981',
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Habitat & Environment',
        shortLabel: '1. HABITAT',
        sublabel: 'Environment Class & Overview',
        iconName: 'Globe',
        color: '#10b981',
        viewType: 'blueprint_specs',
        configuratorSection: 'habitat',
        description: 'Classify the upbringing environment (Spacer, Aquatic, Industrial, Hostile, Urban, etc.) and core cultural atmosphere.',
        ragQuery: 'Origin creation 1.05 homeworld habitat environment 20 society skill points',
        ragTags: ['character_creation', 'planetary'],
        requiredFields: ['name'],
        recommendedFields: ['habitat', 'description']
      },
      {
        id: 'society_skills',
        stepNumber: 2,
        label: '20-SP Society Skills & Recommended Features',
        shortLabel: '2. 20-SP & FEATURES',
        sublabel: 'Fixed 20-SP Pool & -1 CP Features',
        iconName: 'BookOpen',
        color: '#38bdf8',
        viewType: 'configurator',
        configuratorSection: 'skills',
        description: 'Select canonical Cortex skills for the fixed 20-Point Society Skill Pool and curate Recommended Features (-1 CP discount).',
        ragQuery: 'Three 20-point background skill pools origin society skills recommended features',
        ragTags: ['character_creation'],
        evaluate: (fd) => {
          const list = fd.society_skills || fd.recommended_skills;
          const count = Array.isArray(list) ? list.length : (hasText(list) ? list.split(',').filter(Boolean).length : 0);
          return count >= 4
            ? { status: 'valid', summary: `${count} skills`, score: 100 }
            : count > 0
              ? { status: 'partial', summary: `${count}/4+ skills`, score: 50 }
              : { status: 'empty', summary: '0 skills', score: 0 };
        }
      },
      {
        id: 'traits_vocations',
        stepNumber: 3,
        label: 'Homeworld Traits & Vocations',
        shortLabel: '3. TRAITS & WS',
        sublabel: '2 Free Traits, WS Mod & Archetypes',
        iconName: 'Sparkles',
        color: '#a855f7',
        viewType: 'configurator',
        configuratorSection: 'traits',
        widgets: ['modifiers'],
        description: 'Link selectable Origin Traits (2 free at creation, +1 CP additional), Wealth Score modifier, and typical native Archetypes.',
        ragQuery: 'Origin traits character creation wealth score modifier archetypes',
        ragTags: ['character_creation', 'economatrix'],
        recommendedFields: ['traits', 'archetypes']
      },
      {
        id: 'lore_audit',
        stepNumber: 4,
        label: '1.05 Rules Text, Synergies & Audit',
        shortLabel: '4. LORE & AUDIT',
        sublabel: 'Full Rules Text & Cortex Links',
        iconName: 'CheckCircle',
        color: '#f59e0b',
        viewType: 'final_review',
        description: 'Compose canonical 1.05 Origins full-text lore, CRISP visual tokens, and cross-pillar recommendations.',
        ragQuery: 'Origins lore cultural upbringing synergies',
        ragTags: ['character_creation', 'lore'],
        subSteps: [
          { id: 'narrative', label: 'Canonical 1.05 Lore & Full Text', shortLabel: 'Lore & Rules', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: 'Native Species, Factions & Careers', shortLabel: 'Synergies', viewSlice: 'relational', iconName: 'Compass' },
          { id: 'audit', label: 'Origin Readiness Check', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

function buildOccupationPlaybook() {
  return {
    id: 'occupations',
    family: 'identity_pillar',
    title: 'Occupation & Career Vocation Studio',
    subtitle: 'Operator Guide 1.06 • 20-SP Professional Pool & Base Wealth Score',
    accentColor: '#f59e0b',
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Career Sector & Mandate',
        shortLabel: '1. CAREER',
        sublabel: 'Field, Duty & Tech Floor',
        iconName: 'Briefcase',
        color: '#f59e0b',
        viewType: 'blueprint_specs',
        configuratorSection: 'overview',
        description: 'Define the professional sector, operational duty, licensure/legality profile, and Tech/Meta requirements.',
        ragQuery: 'Occupation 1.06 career professional skills base wealth score',
        ragTags: ['character_creation', 'economatrix'],
        requiredFields: ['name'],
        recommendedFields: ['field', 'description']
      },
      {
        id: 'professional_skills',
        stepNumber: 2,
        label: '20-SP Professional Skills & Talents',
        shortLabel: '2. 20-SP SKILLS',
        sublabel: 'Trade Skills, Traits & Features',
        iconName: 'Award',
        color: '#38bdf8',
        viewType: 'configurator',
        configuratorSection: 'skills',
        widgets: ['modifiers'],
        description: 'Curate the 20-Point Professional Skill Pool, occupational Traits, and recommended Career Features from the Cortex.',
        ragQuery: 'Occupation 20 skill points professional skills traits features',
        ragTags: ['character_creation'],
        evaluate: (fd) => {
          const list = fd.professional_skills || fd.recommended_skills || fd.skills;
          const count = Array.isArray(list) ? list.length : (hasText(list) ? list.split(',').filter(Boolean).length : 0);
          return count >= 4
            ? { status: 'valid', summary: `${count} skills`, score: 100 }
            : count > 0
              ? { status: 'partial', summary: `${count}/4+ skills`, score: 50 }
              : { status: 'empty', summary: '0 skills', score: 0 };
        }
      },
      {
        id: 'wealth_kit',
        stepNumber: 3,
        label: 'Base Wealth Score & Issue Kit',
        shortLabel: '3. WEALTH & KIT',
        sublabel: 'Base WS, Auto-Buy & Gear',
        iconName: 'Coins',
        color: '#10b981',
        viewType: 'configurator',
        configuratorSection: 'wealth',
        description: 'Calibrate Base Wealth Score (WS), preview Economatrix Auto-Buy Threshold (Cost CR <= WS), and link standard-issue Cortex gear.',
        ragQuery: 'Golden Rule of Wealth Purchase CR Auto-Buy Threshold Wealth Score',
        ragTags: ['economatrix', 'character_creation'],
        recommendedFields: ['base_ws']
      },
      {
        id: 'lore_audit',
        stepNumber: 4,
        label: '1.06 Guild Lore, Employers & Audit',
        shortLabel: '4. LORE & AUDIT',
        sublabel: 'Full Rules Text & Faction Links',
        iconName: 'BookOpen',
        color: '#c084fc',
        viewType: 'final_review',
        description: 'Author canonical 1.06 Occupation lore, typical Faction employers, and verify career balance.',
        ragQuery: 'Occupation guild lore employers synergies',
        ragTags: ['character_creation', 'factions'],
        subSteps: [
          { id: 'narrative', label: 'Canonical 1.06 Lore & Duties', shortLabel: 'Lore & Rules', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: 'Employers, Origins & Archetypes', shortLabel: 'Synergies', viewSlice: 'relational', iconName: 'Compass' },
          { id: 'audit', label: 'Career Readiness Check', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

function buildArchetypePlaybook() {
  return {
    id: 'archetypes',
    family: 'identity_pillar',
    title: 'Operator Archetype Chassis Studio',
    subtitle: 'Operator Guide 1.02 • Strict 80 CP Chassis (25 Attr + 42 Skills + 13 Talents)',
    accentColor: '#8b5cf6',
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Role Concept & Tactical Doctrine',
        shortLabel: '1. DOCTRINE',
        sublabel: 'Combat Role, Sphere & Blueprint',
        iconName: 'Compass',
        color: '#8b5cf6',
        viewType: 'blueprint_specs',
        configuratorSection: 'concept',
        description: 'Define the operator archetype’s tactical sphere, battlefield/narrative role, and iconic silhouette.',
        ragQuery: '150 CP operator creation 80 CP archetype package 70 CP customization',
        ragTags: ['character_creation', 'combat'],
        requiredFields: ['name'],
        recommendedFields: ['sphere', 'core_concept', 'description']
      },
      {
        id: 'attributes',
        stepNumber: 2,
        label: '25-CP Attribute Foundation',
        shortLabel: '2. ATTRIBUTES',
        sublabel: '+3 Primary (15) & +2 Secondary (10)',
        iconName: 'Sliders',
        color: '#38bdf8',
        viewType: 'configurator',
        configuratorSection: 'attributes',
        description: 'Allocate the canonical +3 Primary Attribute (15 CP) and +2 Secondary Attribute (10 CP) foundation.',
        ragQuery: 'Attributes 5 CP per +1 attribute rank primary secondary archetype',
        ragTags: ['character_creation'],
        requiredFields: ['primary_attribute', 'secondary_attribute']
      },
      {
        id: 'skills',
        stepNumber: 3,
        label: '42-CP Core Skill Matrix',
        shortLabel: '3. SKILLS (42 CP)',
        sublabel: '4 Trained @ 6 (24) + 6 Support @ 3 (18)',
        iconName: 'BookOpen',
        color: '#10b981',
        viewType: 'configurator',
        configuratorSection: 'skills',
        description: 'Select 4 Essential Skills at Rank 6 (Professional Stage, unlocking 2nd action at -5) and 6 Supporting Skills at Rank 3 from the Cortex.',
        ragQuery: 'Skill tier action economy Rank 6 2nd action -5 archetype skills',
        ragTags: ['character_creation', 'combat'],
        recommendedFields: ['essential_skills', 'supporting_skills']
      },
      {
        id: 'talents',
        stepNumber: 4,
        label: '13-CP Signature Features & Traits',
        shortLabel: '4. TALENTS (13 CP)',
        sublabel: 'Signature Features, Traits & Mods',
        iconName: 'Sparkles',
        color: '#f59e0b',
        viewType: 'configurator',
        configuratorSection: 'talents',
        widgets: ['modifiers'],
        description: 'Complete the 80 CP chassis with 13 CP of Signature Features (3 CP each) and Pillar Traits (1–4 CP).',
        ragQuery: 'Features 3 CP traits 80 CP archetype package customization',
        ragTags: ['character_creation'],
        recommendedFields: ['signature_features', 'signature_traits']
      },
      {
        id: 'lore_audit',
        stepNumber: 5,
        label: '1.02 Persona Lore, Synergies & 80-CP Audit',
        shortLabel: '5. 80-CP AUDIT',
        sublabel: 'Full Text, 5-Pillar Fit & Balance',
        iconName: 'CheckCircle',
        color: '#c084fc',
        viewType: 'final_review',
        description: 'Write the 1.02 Archetype dossier, link synergistic Species/Origins/Occupations/Factions, and verify exact 80 CP budget parity.',
        ragQuery: 'Archetype 80 CP balance synergies persona folio',
        ragTags: ['character_creation', 'lore'],
        subSteps: [
          { id: 'narrative', label: 'Canonical 1.02 Lore & Playstyle', shortLabel: 'Lore & Rules', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: '5-Pillar Cortex Synergies', shortLabel: 'Synergies', viewSlice: 'relational', iconName: 'Compass' },
          { id: 'audit', label: '80-CP Chassis Balance Certificate', shortLabel: '80-CP Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 3. CHARACTER CAPABILITIES & HINDRANCES PLAYBOOKS
 * ───────────────────────────────────────────────────────────────────────────── */

function buildCapabilityPlaybook(domainKey) {
  const META = {
    skills: {
      title: 'Canonical Skill & Action Studio',
      subtitle: 'Operator Guide 1.07 • 2d10 Dual Resolution, Base Ranks 0–20 & +1–10 Sub-Skill Specializations',
      color: '#3b82f6',
      step2Label: 'Action Economy, CRs & Opposed Rules',
      step2Short: '2. CR & ACTIONS'
    },
    features: {
      title: 'Operator Feature & Talent Studio',
      subtitle: 'Operator Guide 1.08 • 3 CP Canonical Feats, Prerequisites & Tactical Triggers',
      color: '#a855f7',
      step2Label: 'Prerequisites, Action Trigger & Modifiers',
      step2Short: '2. PREREQS & MODS'
    },
    traits: {
      title: 'Pillar & Background Trait Studio',
      subtitle: 'Operator Guide 1.04–1.06 • 1 / 2 / 4 CP Origin, Career & Faction Traits',
      color: '#10b981',
      step2Label: 'Situational Bonus, Choices & Modifiers',
      step2Short: '2. BONUS & MODS'
    },
    disadvantages: {
      title: 'Hindrance & Disadvantage Studio',
      subtitle: 'Operator Guide 1.09 • CP Rebates (+10 CP Personal Cap), Save CRs & Counterplay',
      color: '#f43f5e',
      step2Label: 'Trigger Stimulus, Save CR & Penalties',
      step2Short: '2. TRIGGER & SAVE'
    }
  }[domainKey];

  return {
    id: domainKey,
    family: 'capability',
    title: META.title,
    subtitle: META.subtitle,
    accentColor: META.color,
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Domain Classification & Cost',
        shortLabel: '1. CLASSIFICATION',
        sublabel: 'Category, CP Tier & Era Gate',
        iconName: domainKey === 'disadvantages' ? 'ShieldAlert' : domainKey === 'skills' ? 'BookOpen' : 'Sparkles',
        color: META.color,
        viewType: 'blueprint_specs',
        configuratorSection: 'classification',
        description: 'Set the canonical designation, capability category, CP cost/rebate tier, and Tech/Meta prerequisites.',
        ragQuery: `${domainKey} character creation CP cost governing attribute skill tier`,
        ragTags: ['character_creation', 'combat'],
        requiredFields: ['name'],
        recommendedFields: ['category', 'description']
      },
      {
        id: 'mechanics',
        stepNumber: 2,
        label: META.step2Label,
        shortLabel: META.step2Short,
        sublabel: 'Resolution Math & Structured Rules',
        iconName: 'Zap',
        color: '#f59e0b',
        viewType: 'configurator',
        configuratorSection: 'mechanics',
        widgets: ['modifiers'],
        description: 'Define structured prerequisites, 2d10 check/save CR benchmarks, action economy triggers, and machine-readable modifiers.',
        ragQuery: `${domainKey} 2d10 dual resolution CR 15 prerequisites modifiers`,
        ragTags: ['combat', 'character_creation'],
        recommendedFields: ['mechanic']
      },
      {
        id: 'lore_audit',
        stepNumber: 3,
        label: 'Compendium Rules, Cortex Links & Audit',
        shortLabel: '3. RULES & LINKS',
        sublabel: 'Markdown Procedure & Synergies',
        iconName: 'CheckCircle',
        color: '#38bdf8',
        viewType: 'final_review',
        description: 'Finalize Compendium Markdown text, Critical Triumph/Fumble notes, and inspect reverse Cortex references across Archetypes, Species, and Origins.',
        ragQuery: `${domainKey} critical triumph fumble synergies`,
        ragTags: ['combat', 'character_creation'],
        subSteps: [
          { id: 'narrative', label: 'Compendium Rules Text & Notes', shortLabel: 'Rules Text', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: 'Pillar & Prerequisite Links', shortLabel: 'Cortex Links', viewSlice: 'relational', iconName: 'Compass' },
          { id: 'audit', label: 'Balance & Schema Audit', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 4. METAPHYSICS, PSIONICS & META-TECH PLAYBOOKS
 * ───────────────────────────────────────────────────────────────────────────── */

function buildMetaphysicsPlaybook(domainKey) {
  if (domainKey === 'disciplines') {
    return {
      id: 'disciplines',
      family: 'metaphysics',
      title: 'Metaphysical Discipline Studio',
      subtitle: 'Operator Guide 4.00 • The 6 Canonical Domains & ML 1–5 Progression',
      accentColor: '#a855f7',
      steps: [
        {
          id: 'blueprint',
          stepNumber: 1,
          label: 'Cosmic Domain & Triad Role',
          shortLabel: '1. DOMAIN',
          sublabel: 'Discipline Identity & Governing Skill',
          iconName: 'Sparkles',
          color: '#a855f7',
          viewType: 'blueprint_specs',
          configuratorSection: 'domain',
          description: 'Define the metaphysical domain (Dimension, Energy, Entropy, Illusion, Matter, Mental), Triad channeling role, and resonant frequency.',
          ragQuery: 'Metaphysics Triad Attune Discipline Invocation 6 disciplines',
          ragTags: ['metaphysics'],
          requiredFields: ['name'],
          recommendedFields: ['description']
        },
        {
          id: 'progression',
          stepNumber: 2,
          label: 'ML 1–5 Progression & Damage Vectors',
          shortLabel: '2. ML 1–5 LADDER',
          sublabel: 'Potency Tiers, Essence & Modifiers',
          iconName: 'Flame',
          color: '#f59e0b',
          viewType: 'configurator',
          configuratorSection: 'progression',
          widgets: ['modifiers'],
          description: 'Specify capability unlocks from ML 1 (Latent) to ML 5 (Cosmic), associated damage/effect vectors, and strain rules.',
          ragQuery: 'Meta Level ML 0-5 latent adept master high sorcery cosmic essence strain',
          ragTags: ['metaphysics'],
          recommendedFields: ['mechanic']
        },
        {
          id: 'lore_audit',
          stepNumber: 3,
          label: 'Traditions, Canonical Invocations & Audit',
          shortLabel: '3. LORE & LINKS',
          sublabel: 'Linked Invocations & Philosophies',
          iconName: 'BookOpen',
          color: '#38bdf8',
          viewType: 'final_review',
          description: 'Document arcane/psionic traditions and inspect all canonical Invocations and Philosophies bound to this Discipline.',
          ragQuery: 'Metaphysics philosophy invocations resonance',
          ragTags: ['metaphysics', 'lore'],
          subSteps: [
            { id: 'narrative', label: 'Cosmological Lore & Practices', shortLabel: 'Lore', viewSlice: 'narrative', iconName: 'BookOpen' },
            { id: 'relational', label: 'Bound Invocations & Philosophies', shortLabel: 'Bound Powers', viewSlice: 'relational', iconName: 'Wand2' },
            { id: 'audit', label: 'Discipline Audit', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
          ],
          requiredFields: ['name']
        }
      ]
    };
  }

  if (domainKey === 'meta-tech') {
    return {
      id: 'meta-tech',
      family: 'metaphysics',
      title: 'Meta-Tech Imbuement & Resonance Studio',
      subtitle: 'Codex 4.04 & 5.00 • UDU Socket Invocation Capacity & HybridTSC Valuation',
      accentColor: '#c084fc',
      steps: [
        {
          id: 'blueprint',
          stepNumber: 1,
          label: 'Hybrid Chassis & Era Gate',
          shortLabel: '1. HOST CHASSIS',
          sublabel: 'TL/ML Gate & Host Frame',
          iconName: 'Cpu',
          color: '#c084fc',
          viewType: 'blueprint_specs',
          description: 'Select or define the physical host item, Tech/Meta hybrid sophistication, and manufacturer/artificer provenance.',
          ragQuery: 'Meta-tech invocation capacity sockets TL ML hybrid hardware',
          ragTags: ['udu', 'metaphysics', 'economatrix'],
          requiredFields: ['name'],
          recommendedFields: ['tech_level', 'meta_level', 'description']
        },
        {
          id: 'imbuement',
          stepNumber: 2,
          label: 'UDU Socket Gate & Bound Invocation',
          shortLabel: '2. IMBUEMENT',
          sublabel: '1/2/3+ Socket Cap & Power Link',
          iconName: 'Wand2',
          color: '#a855f7',
          viewType: 'configurator',
          configuratorSection: 'imbuement',
          widgets: ['sockets'],
          includeSuiteTab: 'scaling',
          description: 'Bind an Invocation within UDU capacity limits (1 Socket = max Rank 10, 2 Sockets = max Rank 20, 3+ Sockets/Mount/Module = max Rank 30).',
          ragQuery: 'UDU Meta-Tech Invocation Capacity 1 Socket Rank 10 2 Sockets Rank 20',
          ragTags: ['udu', 'metaphysics']
        },
        {
          id: 'capacitor_economy',
          stepNumber: 3,
          label: 'Essence Capacitor & TSC Valuation',
          shortLabel: '3. CAPACITOR & CR',
          sublabel: 'Charges, Criticals & Market Value',
          iconName: 'Coins',
          color: '#f59e0b',
          viewType: 'configurator',
          configuratorSection: 'economy',
          widgets: ['critical_details', 'modifiers', 'costs'],
          includeSuiteTab: 'economatrix',
          description: 'Calibrate Focus/Essence battery charges, overload criticals, and Economatrix TSC pricing.',
          ragQuery: 'Economatrix pricing Purchase CR Crafting CR Essence cost',
          ragTags: ['economatrix', 'metaphysics']
        },
        {
          id: 'lore_audit',
          stepNumber: 4,
          label: 'Aesthetics, Relics & Codex Audit',
          shortLabel: '4. LORE & AUDIT',
          sublabel: 'Runic/Photonic Lore & Balance',
          iconName: 'CheckCircle',
          color: '#10b981',
          viewType: 'final_review',
          description: 'Describe harmonic crystal/photonic aesthetics, link Faction artificers, and verify hybrid build cost.',
          ragQuery: 'Meta-tech lore hard-light spellweaves',
          ragTags: ['metaphysics', 'economatrix'],
          subSteps: [
            { id: 'narrative', label: 'Artificer Lore & Operation', shortLabel: 'Lore', viewSlice: 'narrative', iconName: 'BookOpen' },
            { id: 'relational', label: 'Linked Invocations & Creators', shortLabel: 'Relations', viewSlice: 'relational', iconName: 'Compass' },
            { id: 'audit', label: 'Meta-Tech Readiness Audit', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
          ],
          requiredFields: ['name']
        }
      ]
    };
  }

  const isSpecial = domainKey === 'special_abilities';
  return {
    id: domainKey,
    family: 'metaphysics',
    title: isSpecial ? 'Special Ability Matrix Studio' : 'Invocation & Psionics Matrix Studio',
    subtitle: isSpecial
      ? 'Codex 4.02 • 5 CP Standalone Abilities via 5-Step Matrix & Essence = ceil(CR / 5)'
      : 'Operator Guide 4.00 • 5-Step Manifestation Matrix, Essence = ceil(CR / 5) & Overchannel',
    accentColor: isSpecial ? '#facc15' : '#a855f7',
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: isSpecial ? 'Foundation Attribute & Concept' : 'Triad Discipline & Concept',
        shortLabel: '1. FOUNDATION',
        sublabel: isSpecial ? 'Attribute, 5 CP Base & ML' : 'Discipline, Meta-Skill & ML',
        iconName: isSpecial ? 'Zap' : 'Sparkles',
        color: isSpecial ? '#facc15' : '#a855f7',
        viewType: 'blueprint_specs',
        configuratorSection: 'foundation',
        description: isSpecial
          ? 'Establish the Special Ability designation, Foundational Attribute, Meta Level, and 5 CP baseline.'
          : 'Select the canonical Metaphysical Discipline, governing Triad skill, Meta Level floor, and high concept.',
        ragQuery: 'Metaphysics Triad Discipline Meta Level ML 1-5 Special Ability foundation',
        ragTags: ['metaphysics'],
        requiredFields: ['name'],
        recommendedFields: ['discipline', 'description']
      },
      {
        id: 'parameters',
        stepNumber: 2,
        label: '5-Step Parameter Matrix (Cast CR)',
        shortLabel: '2. 5-STEP MATRIX',
        sublabel: 'Base + Time + Range + Area + Duration',
        iconName: 'Sliders',
        color: '#38bdf8',
        viewType: 'configurator',
        configuratorSection: 'parameters',
        description: 'Dial in Base Difficulty, Casting Time, Range, Area of Effect, Duration, and Meta-Modifiers to compute live Manifestation CR and Skill Stage.',
        ragQuery: 'Invocation CR Base Difficulty Time Range Area Duration Skill Stage',
        ragTags: ['metaphysics', 'combat']
      },
      {
        id: 'essence_scaling',
        stepNumber: 3,
        label: 'Essence Cost, Scaling & Strain',
        shortLabel: '3. ESSENCE & SCALE',
        sublabel: 'ceil(CR / 5), Potency & Overchannel',
        iconName: 'Flame',
        color: '#f59e0b',
        viewType: 'configurator',
        configuratorSection: 'scaling',
        widgets: ['modifiers'],
        includeSuiteTab: !isSpecial ? 'scaling' : null,
        description: 'Verify Essence = ceil(CR / 5) Focus cost, select damage/effect scaling formulas, and configure Overchannel Burn / Chassis Amplification.',
        ragQuery: 'Essence Pool Surge Strain Overchannel Burn ceil(CR / 5) scaling',
        ragTags: ['metaphysics', 'vitals_integrity']
      },
      {
        id: 'criticals_backlash',
        stepNumber: 4,
        label: 'Critical Surge & Psychic Backlash',
        shortLabel: '4. SURGE & CRIT',
        sublabel: 'Double 10s Surge & Double 1s Fumble',
        iconName: 'ShieldAlert',
        color: '#f43f5e',
        viewType: 'configurator',
        configuratorSection: 'criticals',
        widgets: ['critical_details'],
        description: 'Define Critical Triumph (Double 10s +10 surge) amplification, Critical Fumble (Double 1s -10 backlash), and target Defense/Save resistance.',
        ragQuery: '2d10 Dual Resolution Critical Triumph Double 10s Critical Fumble backlash',
        ragTags: ['combat', 'metaphysics']
      },
      {
        id: 'lore_audit',
        stepNumber: 5,
        label: 'Sensory Manifestation, Links & Audit',
        shortLabel: '5. LORE & AUDIT',
        sublabel: 'Visual Weave, Synergies & CR Check',
        iconName: 'BookOpen',
        color: '#10b981',
        viewType: 'final_review',
        description: 'Author somatic/visual manifestation lore, link practitioner Archetypes/Factions, and audit final CR & Essence math.',
        ragQuery: 'Invocation manifestation lore practitioner synergies',
        ragTags: ['metaphysics', 'lore'],
        subSteps: [
          { id: 'narrative', label: 'Manifestation Lore & Mechanics Text', shortLabel: 'Lore & Rules', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: 'Practitioners, Disciplines & Synergies', shortLabel: 'Cortex Links', viewSlice: 'relational', iconName: 'Wand2' },
          { id: 'audit', label: 'Manifestation CR & Essence Audit', shortLabel: 'CR Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 5. PERSONAL PROPERTY, ARMORY, CYBERNETICS, MECHA & ARCHITECTURE PLAYBOOKS
 * ───────────────────────────────────────────────────────────────────────────── */

function buildHardwarePlaybook(domainKey) {
  const META = {
    weaponry: {
      title: 'Weaponry & Munitions Engineering Studio',
      subtitle: 'Codex 5.01 & 2.00 • Ballistic/Energy/Melee, Penetration, Sockets & Economatrix TSC',
      color: '#ef4444',
      icon: 'Crosshair',
      step2Label: 'Frame, Range & Volumetric UDU',
      step3Label: 'Damage, Penetration, Sockets & Mods'
    },
    armoring: {
      title: 'Armoring, Shields & Protective Weave Studio',
      subtitle: 'Codex 5.02 & 3.00 • Anatomical Coverage, Single-Highest DR Cap & Environmental Seals',
      color: '#3b82f6',
      icon: 'Shield',
      step2Label: 'Anatomical Coverage & Layering Domain',
      step3Label: 'Armor DR, Encumbrance, Sockets & Mods'
    },
    augmentations: {
      title: 'Cybernetics, Bioware & 200-Node Graft Studio',
      subtitle: 'Codex 5.03 • 200 Anatomical Body Nodes, 3 Augmentation Tiers & Neural Strain',
      color: '#ec4899',
      icon: 'Cpu',
      step2Label: 'Anatomical Node Map & Augmentation Tier',
      step3Label: 'Implant Modifiers, Strain & Upgrades'
    },
    gear: {
      title: 'Tactical Equipment & Tooling Studio',
      subtitle: 'Codex 5.00 & 2.00 • Utility Gear, 7-Tier Crafting Tools (x1–x5,000) & UDU Load',
      color: '#06b6d4',
      icon: 'Package',
      step2Label: 'Equipment Category, UDU & Power',
      step3Label: 'Operational Bonuses, Charges & Mods'
    },
    mecha: {
      title: 'Mecha, Vehicles & Heavy Frames Studio',
      subtitle: 'Codex 5.04 • Unified Structure Pool (SP), Hangar Modules & Hardpoint Mounts',
      color: '#f59e0b',
      icon: 'Bot',
      step2Label: 'Frame Scale, Structure (SP) & Garaging',
      step3Label: 'Reactor, Hardpoint Mounts & Systems'
    },
    architecture: {
      title: 'Architecture, Installations & Outposts Studio',
      subtitle: 'Codex 5.05 • Facility Footprint, Power Grid, Security & Modular UDU Bays',
      color: '#eab308',
      icon: 'Building2',
      step2Label: 'Site Footprint, Structure & Power Grid',
      step3Label: 'Modular Bays, Defenses & Upkeep'
    },
    other: {
      title: 'Commodities, Materials & Miscellaneous Property Studio',
      subtitle: 'Codex 2.00 • Trade Goods, Pristine Materials (50%), Scrap (5x Mass) & Deeds',
      color: '#94a3b8',
      icon: 'Package',
      step2Label: 'Commodity Class, Lot Mass & Legality',
      step3Label: 'Trade Modifiers, Synthesis Use & Properties'
    }
  }[domainKey] || {
    title: 'Hardware & Property Studio',
    subtitle: 'Codex 5.00 • UDU & Economatrix Engineering',
    color: '#f59e0b',
    icon: 'Package',
    step2Label: 'Chassis & Volumetric Scale',
    step3Label: 'Operational Parameters & Modifications'
  };

  return {
    id: domainKey,
    family: 'hardware',
    title: META.title,
    subtitle: META.subtitle,
    accentColor: META.color,
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Blueprint, Era (TL/ML) & Maker',
        shortLabel: '1. BLUEPRINT',
        sublabel: 'TL/ML, Creator & Cortex Exemplar',
        iconName: META.icon,
        color: META.color,
        viewType: 'blueprint_specs',
        description: 'Set item designation, Tech Level (TL 0–5), Meta Level (ML 0–5), manufacturer/creator skin, rarity, or seed from a canonical Cortex exemplar.',
        ragQuery: `${domainKey} Tech Level TL 0-5 Meta Level manufacturer classification`,
        ragTags: ['economatrix', 'technology', 'udu'],
        requiredFields: ['name'],
        recommendedFields: ['tech_level', 'description']
      },
      {
        id: 'chassis_scale',
        stepNumber: 2,
        label: META.step2Label,
        shortLabel: '2. CHASSIS & UDU',
        sublabel: 'Scale, Nodes/Coverage & Tech Specs',
        iconName: 'Maximize2',
        color: '#38bdf8',
        viewType: 'configurator',
        configuratorSection: 'chassis',
        includeSuiteTab: 'scaling',
        description: 'Configure physical frame geometry, Universal Displacement Units (10 Nodes = 1 Socket = 0.1 Mount), anatomical coverage/nodes, and volumetric scaling.',
        ragQuery: `${domainKey} Universal Displacement Units UDU 10:1 Socket Hierarchy 200 Body Nodes`,
        ragTags: ['udu', 'scaling', 'combat']
      },
      {
        id: 'performance_mods',
        stepNumber: 3,
        label: META.step3Label,
        shortLabel: '3. MECHANICS & MODS',
        sublabel: 'Stats, Sockets, Upgrades & Crits',
        iconName: 'Wrench',
        color: '#f59e0b',
        viewType: 'configurator',
        configuratorSection: 'mechanics',
        widgets: ['sockets', 'modifications', 'critical_details', 'modifiers'],
        description: 'Engineer core combat/utility performance, allocate UDU Sockets, stack canonical Upgrades & Flaws (-1 CR x0.75), and bind Critical Triumph/Fumble effects.',
        ragQuery: `${domainKey} combat damage penetration armor DR sockets modifications critical effects`,
        ragTags: ['combat', 'udu', 'vitals_integrity'],
        subSteps: [
          { id: 'core_stats', label: 'Core Combat & Utility Parameters', shortLabel: 'Core Parameters', widgetSlice: 'core', iconName: 'Zap' },
          { id: 'sockets_mods', label: 'UDU Sockets & Modification Stack', shortLabel: 'Sockets & Mods', widgetSlice: 'sockets_mods', iconName: 'Cpu' },
          { id: 'crits_modifiers', label: 'Critical Effects & Stat Modifiers', shortLabel: 'Crits & Modifiers', widgetSlice: 'crits_modifiers', iconName: 'Sparkles' }
        ]
      },
      {
        id: 'economatrix',
        stepNumber: 4,
        label: 'Economatrix TSC & Fabrication',
        shortLabel: '4. ECONOMATRIX',
        sublabel: 'Purchase CR = Craft CR, Credits & WS',
        iconName: 'Coins',
        color: '#10b981',
        viewType: 'suite_workflow',
        suiteType: 'economatrix',
        widgets: ['costs'],
        description: 'Calibrate Cost/Craft CR on the Tangent Standard Curve (10 * 4^floor(CR/5) * Micro-Mod), verify Character WS Auto-Buy threshold, and compute 7-Tier Crafting time.',
        ragQuery: 'Economatrix Tangent Standard Curve TSC Golden Rule Purchase CR Crafting CR Liquidity Gap',
        ragTags: ['economatrix']
      },
      {
        id: 'lore_audit',
        stepNumber: 5,
        label: 'Provenance, VTT Hooks & Audit',
        shortLabel: '5. LORE & AUDIT',
        sublabel: 'Dossier, Faction Users & Build Check',
        iconName: 'CheckCircle',
        color: '#c084fc',
        viewType: 'final_review',
        description: 'Write corporate/field lore, configure VTT interactive hooks & Cortex user relations, and pass the BASTION Build Cost Validator.',
        ragQuery: `${domainKey} provenance lore faction operators build cost`,
        ragTags: ['economatrix', 'lore'],
        subSteps: [
          { id: 'narrative', label: 'Provenance, Operations & Lore', shortLabel: 'Lore Dossier', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: 'Cortex Factions, Creators & Prerequisites', shortLabel: 'Cortex Links', viewSlice: 'relational', iconName: 'Compass' },
          { id: 'audit', label: 'TSC Valuation & Build Audit', shortLabel: 'Build Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 6. MODULAR CHARACTERS (MCM THREATS) & COMPANIONS PLAYBOOKS
 * ───────────────────────────────────────────────────────────────────────────── */

function buildThreatOrCompanionPlaybook(domainKey) {
  if (domainKey === 'companions') {
    return {
      id: 'companions',
      family: 'threat_companion',
      title: 'Companion, Drone & Familiar Studio',
      subtitle: 'Operator Guide 1.10 • 40-CP Companion Chassis (15 CP Form + 25 CP Function)',
      accentColor: '#14b8a6',
      steps: [
        {
          id: 'blueprint',
          stepNumber: 1,
          label: 'Companion Nature & Owner Tier',
          shortLabel: '1. NATURE',
          sublabel: 'Drone, Bio-Beast or Familiar',
          iconName: 'Bot',
          color: '#14b8a6',
          viewType: 'blueprint_specs',
          configuratorSection: 'nature',
          description: 'Select companion origin (Synthetic Drone, Bio-Engineered Beast, Metaphysical Familiar, Retainer) and synchronize Owner Tier scaling.',
          ragQuery: 'Companion creation drone familiar bio-beast form function CP',
          ragTags: ['companions', 'character_creation'],
          requiredFields: ['name'],
          recommendedFields: ['companion_type', 'description']
        },
        {
          id: 'form_package',
          stepNumber: 2,
          label: '15-CP Form & Chassis Vitals',
          shortLabel: '2. FORM (15 CP)',
          sublabel: 'Morphology, Size & VP/HP vs SP',
          iconName: 'Shield',
          color: '#38bdf8',
          viewType: 'configurator',
          configuratorSection: 'form',
          description: 'Choose the 15-CP Form Package determining locomotion, size category, and biological Vitality/Health vs. synthetic Structure Pool.',
          ragQuery: 'Damage pools Vitality Health Synthetic Structure 60 SP companion form',
          ragTags: ['companions', 'vitals_integrity']
        },
        {
          id: 'function_packages',
          stepNumber: 3,
          label: '25-CP Function Modules & Talents',
          shortLabel: '3. FUNCTION (25 CP)',
          sublabel: 'Tactical Packages & Extra Features',
          iconName: 'Sparkles',
          color: '#f59e0b',
          viewType: 'configurator',
          configuratorSection: 'function',
          widgets: ['modifiers'],
          description: 'Assign Function Packages (Recon, Guardian, Mount, Arcane Conduit, Medic, Slicer) and Cortex Extra Features.',
          ragQuery: 'Companion function packages features action economy',
          ragTags: ['companions', 'combat']
        },
        {
          id: 'lore_audit',
          stepNumber: 4,
          label: 'Bond Lore, Command Rules & Audit',
          shortLabel: '4. BOND & AUDIT',
          sublabel: 'Telemetry/Bond Lore & 40-CP Check',
          iconName: 'CheckCircle',
          color: '#c084fc',
          viewType: 'final_review',
          description: 'Detail neural/harmonic bond lore, command action rules, and verify the 40-CP companion package.',
          ragQuery: 'Companion bond command actions folio',
          ragTags: ['companions', 'lore'],
          subSteps: [
            { id: 'narrative', label: 'Bond Lore & Tactical Behavior', shortLabel: 'Lore', viewSlice: 'narrative', iconName: 'BookOpen' },
            { id: 'relational', label: 'Linked Archetypes & Gear', shortLabel: 'Cortex Links', viewSlice: 'relational', iconName: 'Compass' },
            { id: 'audit', label: 'Companion Package Audit', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
          ],
          requiredFields: ['name']
        }
      ]
    };
  }

  return {
    id: 'modular_characters',
    family: 'threat_companion',
    title: 'Modular Character Matrix (MCM Threat) Studio',
    subtitle: 'Architect Guide 6.00 • Threat Tier 1–10, Competency Role, Vitals & Cortex Loadout',
    accentColor: '#ef4444',
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Threat Tier, Role & Chassis',
        shortLabel: '1. THREAT ROLE',
        sublabel: 'Tier 1–10, Boss Scale & Bio/Synth',
        iconName: 'Users',
        color: '#ef4444',
        viewType: 'blueprint_specs',
        configuratorSection: 'classification',
        description: 'Configure Threat Tier (1–10), Competency Role (Tank, Striker, Skirmisher, Controller, Artillery, Support), Boss Multiplier, and Biological vs. Synthetic chassis.',
        ragQuery: 'Modular character threat tier competency role biological synthetic 60 SP boss',
        ragTags: ['bestiary', 'combat', 'vitals_integrity'],
        requiredFields: ['name'],
        recommendedFields: ['competencyRole', 'bossType', 'description']
      },
      {
        id: 'vitals_arrays',
        stepNumber: 2,
        label: 'Combat Arrays, Defense & Vitals',
        shortLabel: '2. VITALS & STATS',
        sublabel: 'VP/HP or SP, Armor DR & Checks',
        iconName: 'Activity',
        color: '#f59e0b',
        viewType: 'configurator',
        configuratorSection: 'vitals',
        widgets: ['modifiers'],
        description: 'Auto-calibrate Attribute modifiers, Strike/Defense bonuses, Armor DR, and Vitality/Health or Synthetic Structure pools.',
        ragQuery: '2d10 Dual Resolution Opposed Defense Armor DR Vitality Health Structure',
        ragTags: ['combat', 'vitals_integrity']
      },
      {
        id: 'loadout',
        stepNumber: 3,
        label: 'Cortex Arsenal & Abilities Loadout',
        shortLabel: '3. LOADOUT',
        sublabel: 'Weapons, Armor, Invocations & Feats',
        iconName: 'Crosshair',
        color: '#38bdf8',
        viewType: 'configurator',
        configuratorSection: 'loadout',
        description: 'Equip canonical Omnicortex Weapons, Armor, Augmentations, Invocations, and Special Abilities directly onto the statblock.',
        ragQuery: 'Combat action economy stances weapon damage invocations',
        ragTags: ['combat', 'metaphysics']
      },
      {
        id: 'ai_loot',
        stepNumber: 4,
        label: 'AIME Combat Doctrine, AI & Salvage',
        shortLabel: '4. COMBAT AI',
        sublabel: 'Stances, Morale, Faction & Bounty',
        iconName: 'Bot',
        color: '#c084fc',
        viewType: 'final_review',
        description: 'Define AIME tactical combat behavior (preferred stances, target priority, morale), link Species & Faction allegiance, and audit encounter threat.',
        ragQuery: 'Tactical combat stances Guard Aim Overcharge salvage loot',
        ragTags: ['combat', 'bestiary', 'economatrix'],
        subSteps: [
          { id: 'relational', label: 'Combat AI Directives, Species & Faction', shortLabel: 'Combat AI & Links', viewSlice: 'relational', iconName: 'Bot' },
          { id: 'narrative', label: 'Dossier, Tactics & Salvage Notes', shortLabel: 'Lore & Salvage', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'audit', label: 'MCM Statblock & Encounter Audit', shortLabel: 'Threat Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 7. WORLD DESIGN, COSMOLOGY & SOCIETAL SPHERES PLAYBOOKS
 * ───────────────────────────────────────────────────────────────────────────── */

function buildWorldOrSocietyPlaybook(domainKey) {
  if (domainKey === 'planetary_design' || domainKey === 'world') {
    return {
      id: domainKey,
      family: 'world_society',
      title: 'Planetary UWP & Civilization Studio',
      subtitle: 'Architect Guide 99 • Universal World Profile (UWP), Biosphere & 16-Domain Radar',
      accentColor: '#14b8a6',
      steps: [
        {
          id: 'blueprint',
          stepNumber: 1,
          label: 'Parent Cosmos & Stellar Primary',
          shortLabel: '1. ASTROGRAPHY',
          sublabel: 'Universe, Star Class & BioZone',
          iconName: 'Globe',
          color: '#14b8a6',
          viewType: 'blueprint_specs',
          configuratorSection: 'astrography',
          description: 'Anchor the world within a parent Cortex Universe, select Stellar Primary classification, orbital zone, and high concept.',
          ragQuery: 'Planetary UWP star class orbital zone astrogation world design',
          ragTags: ['planetary'],
          requiredFields: ['name'],
          recommendedFields: ['starClass', 'orbitalZone', 'description']
        },
        {
          id: 'geophysics',
          stepNumber: 2,
          label: 'Geophysical UWP & Biosphere',
          shortLabel: '2. GEOPHYSICS',
          sublabel: 'Size, Atmosphere, Hydro & Hazards',
          iconName: 'Layers',
          color: '#38bdf8',
          viewType: 'configurator',
          configuratorSection: 'geophysics',
          description: 'Synthesize physical UWP digits: Planetary Size/Gravity, Atmosphere composition, Hydrographic percentage, and Biosphere evolution.',
          ragQuery: 'Universal World Profile UWP gravity atmosphere hydrography biosphere hazards',
          ragTags: ['planetary']
        },
        {
          id: 'demographics',
          stepNumber: 3,
          label: 'Starport, Governance, Law & TL/ML',
          shortLabel: '3. POLITY & UWP',
          sublabel: 'Population, Starport A–X & TL/ML',
          iconName: 'Building2',
          color: '#f59e0b',
          viewType: 'configurator',
          configuratorSection: 'demographics',
          description: 'Configure Population exponent, Starport class (A–X), Government code, Law Level, and local Tech/Meta sophistication.',
          ragQuery: 'UWP starport population government law level tech level meta level',
          ragTags: ['planetary', 'economatrix']
        },
        {
          id: 'civilization_radar',
          stepNumber: 4,
          label: '16-Domain Civilization Radar & Trade',
          shortLabel: '4. 16 DOMAINS',
          sublabel: 'Societal Spheres & Trade Codes',
          iconName: 'Cpu',
          color: '#a855f7',
          viewType: 'suite_workflow',
          suiteType: 'technology',
          description: 'Profile the planet across the 16 Civilization Domains and generate Economatrix planetary trade classifications.',
          ragQuery: '16-Domain Radar civilization spheres planetary trade codes',
          ragTags: ['planetary', 'economatrix']
        },
        {
          id: 'lore_audit',
          stepNumber: 5,
          label: 'Gazetteer, Inhabitants & Audit',
          shortLabel: '5. GAZETTEER',
          sublabel: 'Species, Factions, Settings & Hooks',
          iconName: 'BookOpen',
          color: '#10b981',
          viewType: 'final_review',
          description: 'Write planetary geography/culture lore, link resident Species, Factions & child Settings, and verify UWP integrity.',
          ragQuery: 'Planetary gazetteer adventure hooks factions species',
          ragTags: ['planetary', 'lore'],
          subSteps: [
            { id: 'narrative', label: 'Geography, Culture & Adventure Hooks', shortLabel: 'Gazetteer', viewSlice: 'narrative', iconName: 'BookOpen' },
            { id: 'relational', label: 'Inhabitant Species, Factions & Settings', shortLabel: 'Inhabitants', viewSlice: 'relational', iconName: 'Users' },
            { id: 'audit', label: 'UWP & World Readiness Audit', shortLabel: 'UWP Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
          ],
          requiredFields: ['name']
        }
      ]
    };
  }

  if (domainKey === 'societies' || SOCIETY_SPHERE_KEYS.has(domainKey)) {
    const isMaster = domainKey === 'societies';
    const sphereLabel = isMaster
      ? 'Master Civilization Matrix'
      : domainKey.replace(/^society_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return {
      id: domainKey,
      family: 'world_society',
      title: isMaster ? 'Master Civilization Template Studio' : `Society Sphere Studio: ${sphereLabel}`,
      subtitle: isMaster
        ? 'Omnicortex Sociology • Aggregate 18-Sphere Civilization Blueprint'
        : `Societal Progression • Stage 0–5 ${sphereLabel} Benchmarks & Modifiers`,
      accentColor: '#38bdf8',
      steps: [
        {
          id: 'blueprint',
          stepNumber: 1,
          label: isMaster ? 'Civilization Archetype & Era' : 'Sphere Stage (0–5) & Identity',
          shortLabel: '1. STAGE & ERA',
          sublabel: 'Progression Tier & Summary',
          iconName: 'Globe',
          color: '#38bdf8',
          viewType: 'blueprint_specs',
          configuratorSection: 'stage',
          description: isMaster
            ? 'Define the civilization template name, aggregate Tech/Meta era, and sociological archetype.'
            : `Set the ${sphereLabel} development stage (0 Primitive to 5 Post-Scarcity/Progenitor) and hallmark capabilities.`,
          ragQuery: `Tech Level TL 0-5 civilization ${sphereLabel} stage`,
          ragTags: ['planetary', 'technology'],
          requiredFields: ['name'],
          recommendedFields: ['description']
        },
        {
          id: 'mechanics',
          stepNumber: 2,
          label: 'Infrastructure & Operational Modifiers',
          shortLabel: '2. INFRASTRUCTURE',
          sublabel: 'Market, Law & Availability Effects',
          iconName: 'Sliders',
          color: '#f59e0b',
          viewType: 'configurator',
          configuratorSection: 'mechanics',
          widgets: ['modifiers'],
          description: 'Define concrete effects on equipment availability, Economatrix trade modifiers, crafting tool tiers, and operator checks.',
          ragQuery: 'Economatrix availability crafting tool tier law level trade',
          ragTags: ['economatrix', 'planetary']
        },
        {
          id: 'lore_audit',
          stepNumber: 3,
          label: 'Sociological Dossier & Exemplar Worlds',
          shortLabel: '3. LORE & WORLDS',
          sublabel: 'Daily Life & Cortex Faction/World Links',
          iconName: 'BookOpen',
          color: '#10b981',
          viewType: 'final_review',
          description: 'Document institutional structures and link canonical Worlds and Factions exemplifying this societal stage.',
          ragQuery: 'Civilization culture factions worlds',
          ragTags: ['planetary', 'factions', 'lore'],
          subSteps: [
            { id: 'narrative', label: 'Sociological Dossier', shortLabel: 'Dossier', viewSlice: 'narrative', iconName: 'BookOpen' },
            { id: 'relational', label: 'Exemplar Factions & Worlds', shortLabel: 'Exemplars', viewSlice: 'relational', iconName: 'Compass' },
            { id: 'audit', label: 'Readiness Audit', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
          ],
          requiredFields: ['name']
        }
      ]
    };
  }

  // World Elements: universe | setting | philosophy | scene | world_design
  const ELEMENT_META = {
    universe: {
      title: 'Cosmology & Universe Continuum Studio',
      subtitle: 'World Design • Relativistic/Tangent Laws, Active Disciplines & Macro-Eras',
      color: '#8b5cf6',
      step2Label: 'Cosmic Laws, Physics & Metaphysics'
    },
    setting: {
      title: 'Setting, Highport & District Studio',
      subtitle: 'World Design • Parent World Anchor, Points of Interest, Law & Local Hazards',
      color: '#06b6d4',
      step2Label: 'POIs, Security, Architecture & Hazards'
    },
    philosophy: {
      title: 'Philosophy, Creed & Mystic Order Studio',
      subtitle: 'World Design • Core Dogma, Tenets, Ritual Practices & Favored Disciplines',
      color: '#eab308',
      step2Label: 'Dogma, Practices & Favored Capabilities'
    },
    scene: {
      title: 'Dramatic Scene & Encounter Beat Studio',
      subtitle: 'AIME Story Engine • Dramatic Hook, CR Skill Challenges & MCM Threat Roster',
      color: '#f43f5e',
      step2Label: 'Cortex Encounter Roster & CR Skill Checks'
    }
  }[domainKey] || {
    title: 'World Design Element Studio',
    subtitle: 'Omnicortex Worldbuilding Architecture',
    color: '#a855f7',
    step2Label: 'Structural Parameters & World Rules'
  };

  return {
    id: domainKey,
    family: 'world_society',
    title: ELEMENT_META.title,
    subtitle: ELEMENT_META.subtitle,
    accentColor: ELEMENT_META.color,
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Anchor, Scale & High Concept',
        shortLabel: '1. ANCHOR',
        sublabel: 'Parent World/Cosmos & Concept',
        iconName: 'Sparkles',
        color: ELEMENT_META.color,
        viewType: 'blueprint_specs',
        configuratorSection: 'anchor',
        description: 'Define the element’s designation, parent Universe/World/Setting anchor, thematic tone, and elevator pitch.',
        ragQuery: `${domainKey} worldbuilding tangent space setting scene`,
        ragTags: ['planetary', 'lore'],
        requiredFields: ['name'],
        recommendedFields: ['description']
      },
      {
        id: 'mechanics',
        stepNumber: 2,
        label: ELEMENT_META.step2Label,
        shortLabel: '2. STRUCTURE',
        sublabel: 'Interactive Rules, Checks & Entities',
        iconName: 'Compass',
        color: '#f59e0b',
        viewType: 'configurator',
        configuratorSection: 'mechanics',
        widgets: ['modifiers'],
        description: 'Configure domain-specific mechanics: physical/arcane laws, POIs & security rules, creed tenets, or AIME encounter threats & 2d10 CR checks.',
        ragQuery: `${domainKey} 2d10 CR 15 hazards encounter factions disciplines`,
        ragTags: ['combat', 'planetary', 'metaphysics']
      },
      {
        id: 'lore_audit',
        stepNumber: 3,
        label: 'Narrative Dossier, Cortex Graph & Audit',
        shortLabel: '3. LORE & GRAPH',
        sublabel: 'Read-Aloud, Secrets & Links',
        iconName: 'BookOpen',
        color: '#10b981',
        viewType: 'final_review',
        description: 'Compose rich sensory Markdown prose, Architect secrets, and connect related Omnicortex entities.',
        ragQuery: `${domainKey} lore adventure hooks`,
        ragTags: ['lore'],
        subSteps: [
          { id: 'narrative', label: 'Narrative Prose & Architect Secrets', shortLabel: 'Lore & Secrets', viewSlice: 'narrative', iconName: 'BookOpen' },
          { id: 'relational', label: 'Cosmology & Entity Connections', shortLabel: 'Cortex Graph', viewSlice: 'relational', iconName: 'Globe' },
          { id: 'audit', label: 'Readiness Check', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 8. RULES CODEX, SYSTEM SUITES & DEV REFERENCE SCHEMAS PLAYBOOKS
 * ───────────────────────────────────────────────────────────────────────────── */

function buildRulesOrDevSchemaPlaybook(domainKey) {
  if (['economatrix', 'technology', 'scaling'].includes(domainKey)) {
    const SUITE_META = {
      economatrix: {
        title: 'Economatrix Benchmark & Rule Studio',
        subtitle: 'Codex 2.00 • Tangent Standard Curve (TSC), Wealth Score & 7-Tier Crafting',
        color: '#f59e0b',
        suiteType: 'economatrix'
      },
      technology: {
        title: 'Technology Spectrum (TL 0–5) Studio',
        subtitle: 'Codex 2.01 • Era Benchmarks, Cross-TL Penalties & Power Schematics',
        color: '#38bdf8',
        suiteType: 'technology'
      },
      scaling: {
        title: 'Volumetric Scaling & UDU Tier Studio',
        subtitle: 'Codex 5.00 • 14 Volumetric Tiers, 10:1 UDU Hierarchy & Scale Matchups',
        color: '#10b981',
        suiteType: 'scaling'
      }
    }[domainKey];

    return {
      id: domainKey,
      family: 'rules_reference',
      title: SUITE_META.title,
      subtitle: SUITE_META.subtitle,
      accentColor: SUITE_META.color,
      steps: [
        {
          id: 'blueprint',
          stepNumber: 1,
          label: 'Benchmark Identity & Tier',
          shortLabel: '1. BENCHMARK',
          sublabel: 'Designation, Tier & Summary',
          iconName: 'Calculator',
          color: SUITE_META.color,
          viewType: 'blueprint_specs',
          description: 'Define the system benchmark entry, tier index, and summary specification.',
          ragQuery: `${domainKey} canonical formula benchmark`,
          ragTags: [domainKey, 'udu', 'economatrix'],
          requiredFields: ['name'],
          recommendedFields: ['description']
        },
        {
          id: 'interactive_suite',
          stepNumber: 2,
          label: 'Interactive Suite Simulator & Calibration',
          shortLabel: '2. SIMULATOR',
          sublabel: 'Live Formula & Curve Calibration',
          iconName: 'Sliders',
          color: '#a855f7',
          viewType: 'suite_workflow',
          suiteType: SUITE_META.suiteType,
          widgets: ['modifiers'],
          description: 'Run interactive mathematical simulations and calibrate parameters directly against the canonical engine.',
          ragQuery: `${domainKey} formula calculation`,
          ragTags: [domainKey]
        },
        {
          id: 'lore_audit',
          stepNumber: 3,
          label: 'Codex Documentation & Audit',
          shortLabel: '3. DOCS & AUDIT',
          sublabel: 'Markdown Reference & Schema Check',
          iconName: 'BookOpen',
          color: '#10b981',
          viewType: 'final_review',
          description: 'Author reference documentation and verify schema integrity.',
          ragQuery: `${domainKey} codex documentation`,
          ragTags: [domainKey],
          subSteps: [
            { id: 'narrative', label: 'Reference Markdown & Examples', shortLabel: 'Reference Docs', viewSlice: 'narrative', iconName: 'BookOpen' },
            { id: 'audit', label: 'Schema Audit', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
          ],
          requiredFields: ['name']
        }
      ]
    };
  }

  if (DEV_PARAMETER_KEYS.has(domainKey)) {
    const cleanLabel = domainKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
      id: domainKey,
      family: 'rules_reference',
      title: `System Parameter Studio: ${cleanLabel}`,
      subtitle: `Omnicortex Reference Schema (${domainKey}) • Mechanical Token & Dependency Graph`,
      accentColor: '#06b6d4',
      steps: [
        {
          id: 'blueprint',
          stepNumber: 1,
          label: 'Parameter Token & Domain Scope',
          shortLabel: '1. TOKEN',
          sublabel: 'Canonical Name, Code & Category',
          iconName: 'Code',
          color: '#06b6d4',
          viewType: 'blueprint_specs',
          configuratorSection: 'token',
          description: `Define the canonical ${cleanLabel} token name, classification, and eligible parent asset collections.`,
          ragQuery: `${cleanLabel} ${domainKey} parameter mechanics`,
          ragTags: ['combat', 'udu', 'economatrix'],
          requiredFields: ['name'],
          recommendedFields: ['description']
        },
        {
          id: 'mechanics',
          stepNumber: 2,
          label: 'CR / Cost / Socket Delta & Modifiers',
          shortLabel: '2. DELTAS & MODS',
          sublabel: 'Formula Offsets & Universal Modifiers',
          iconName: 'Calculator',
          color: '#f59e0b',
          viewType: 'configurator',
          configuratorSection: 'deltas',
          widgets: ['modifiers'],
          description: 'Specify exact CR/DC offsets, UDU socket/node costs, damage/DR multipliers, and structured modifiers.',
          ragQuery: `${cleanLabel} CR modifier socket cost`,
          ragTags: ['combat', 'economatrix', 'udu'],
          recommendedFields: ['mechanic']
        },
        {
          id: 'lore_audit',
          stepNumber: 3,
          label: 'Rules Note & Reverse Cortex Impact',
          shortLabel: '3. IMPACT CHECK',
          sublabel: 'Entities Referencing This Token',
          iconName: 'CheckCircle',
          color: '#10b981',
          viewType: 'final_review',
          description: 'Review every Weapon, Armor, Species, Invocation, or Feature in Omnicortex that references this parameter before committing.',
          ragQuery: `${cleanLabel} rules reference`,
          ragTags: ['combat'],
          subSteps: [
            { id: 'narrative', label: 'Rules Definition & Examples', shortLabel: 'Definition', viewSlice: 'narrative', iconName: 'BookOpen' },
            { id: 'relational', label: 'Reverse Cortex Dependency Graph', shortLabel: 'Used By (Impact)', viewSlice: 'relational', iconName: 'Layers' },
            { id: 'audit', label: 'Parameter Schema Audit', shortLabel: 'Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
          ],
          requiredFields: ['name']
        }
      ]
    };
  }

  // Rules, Compendium, Conditions, Damage Types, Maneuvers, Synthesis, User Guide
  const RULE_META = {
    conditions: {
      title: 'Status Condition & Trauma Studio',
      subtitle: 'Codex 3.03 • Severity Stacking, Save CRs & Roll/Defense Penalties',
      color: '#f43f5e'
    },
    damage_types: {
      title: 'Damage Vector & Trauma Type Studio',
      subtitle: 'Codex 3.02 • Kinetic/Energy/Radiation/Mental DR Interactions & Criticals',
      color: '#ef4444'
    },
    maneuvers: {
      title: 'Tactical Combat Maneuver Studio',
      subtitle: 'Codex 3.05 • Action Cost, Skill Tier Unlock & Opposed 2d10 Resolution',
      color: '#f59e0b'
    },
    synthesis: {
      title: 'Fabrication & Synthesis Blueprint Studio',
      subtitle: 'Codex 2.02 • Purchase CR = Craft CR, 50% Materials, 5x Scrap & Daily PP',
      color: '#10b981'
    },
    rules: {
      title: 'Core System Rule & Procedure Studio',
      subtitle: 'Omnicortex Rules Registry • Citation Code, Formula & RAG Indexing',
      color: '#38bdf8'
    },
    compendium: {
      title: 'Compendium Article & Rulebook Studio',
      subtitle: 'Omnicortex Compendium • Chapter Taxonomy, Split Markdown & BASTION RAG',
      color: '#8b5cf6'
    },
    user_guide: {
      title: 'Platform & Operator Guide Studio',
      subtitle: 'Documentation Registry • Guided Walkthroughs & Reference Articles',
      color: '#06b6d4'
    }
  }[domainKey] || {
    title: 'Omnicortex Rules & Reference Studio',
    subtitle: 'Canonical System Documentation & Mechanics',
    color: '#38bdf8'
  };

  return {
    id: domainKey,
    family: 'rules_reference',
    title: RULE_META.title,
    subtitle: RULE_META.subtitle,
    accentColor: RULE_META.color,
    steps: [
      {
        id: 'blueprint',
        stepNumber: 1,
        label: 'Taxonomy, Citation & RAG Tags',
        shortLabel: '1. CITATION',
        sublabel: 'Chapter Code, Category & Keywords',
        iconName: 'BookOpen',
        color: RULE_META.color,
        viewType: 'blueprint_specs',
        configuratorSection: 'citation',
        description: 'Assign rulebook citation code, taxonomy category, and BASTION RAG retrieval tags.',
        ragQuery: `${domainKey} rules citation dual resolution`,
        ragTags: ['combat', 'economatrix', 'metaphysics'],
        requiredFields: ['name'],
        recommendedFields: ['category', 'description']
      },
      {
        id: 'mechanics',
        stepNumber: 2,
        label: 'Structured Mechanics, Formulas & Modifiers',
        shortLabel: '2. MECHANICS',
        sublabel: 'Resolution Formula & Active Modifiers',
        iconName: 'Zap',
        color: '#f59e0b',
        viewType: 'configurator',
        configuratorSection: 'mechanics',
        widgets: ['modifiers'],
        description: 'Encode machine-readable formulas, action/save CRs, DR interactions, synthesis PP requirements, and active modifiers.',
        ragQuery: `${domainKey} 2d10 CR 15 armor DR crafting PP`,
        ragTags: ['combat', 'vitals_integrity', 'economatrix'],
        recommendedFields: ['mechanic']
      },
      {
        id: 'lore_audit',
        stepNumber: 3,
        label: 'Split-Pane Markdown & Cortex Impact',
        shortLabel: '3. MARKDOWN & AUDIT',
        sublabel: 'Live Compendium Preview & References',
        iconName: 'CheckCircle',
        color: '#10b981',
        viewType: 'final_review',
        description: 'Author formatted Compendium Markdown with live side-by-side preview and inspect cross-references across Omnicortex.',
        ragQuery: `${domainKey} compendium examples`,
        ragTags: ['combat'],
        subSteps: [
          { id: 'narrative', label: 'Split-Pane Markdown & Examples', shortLabel: 'Markdown Editor', viewSlice: 'narrative', iconName: 'FileText' },
          { id: 'relational', label: 'Referenced Cortex Entities', shortLabel: 'Cortex Links', viewSlice: 'relational', iconName: 'Compass' },
          { id: 'audit', label: 'RAG & Schema Readiness Audit', shortLabel: 'RAG Audit', viewSlice: 'audit', iconName: 'CheckCircle' }
        ],
        requiredFields: ['name']
      }
    ]
  };
}

/**
 * Primary resolver returning the complete Guided Studio Playbook for any Omnicortex key or Codex Matrix.
 */
export function resolveStudioPlaybook(rawKey, matrix = null) {
  const key = normalizeStudioDomainKey(rawKey, matrix);

  if (key === 'species') return buildSpeciesPlaybook();
  if (SPECIES_SUBSCHEMA_KEYS.has(key)) return buildSpeciesSubschemaPlaybook(key);

  if (key === 'factions') return buildFactionPlaybook();
  if (key === 'origins') return buildOriginPlaybook();
  if (key === 'occupations') return buildOccupationPlaybook();
  if (key === 'archetypes') return buildArchetypePlaybook();

  if (['skills', 'features', 'traits', 'disadvantages'].includes(key)) {
    return buildCapabilityPlaybook(key);
  }

  if (['invocations', 'special_abilities', 'meta-tech', 'disciplines'].includes(key)) {
    return buildMetaphysicsPlaybook(key);
  }

  if (['weaponry', 'armoring', 'augmentations', 'gear', 'mecha', 'architecture', 'other'].includes(key)) {
    return buildHardwarePlaybook(key);
  }

  if (['modular_characters', 'companions'].includes(key)) {
    return buildThreatOrCompanionPlaybook(key);
  }

  if (
    key === 'planetary_design' ||
    key === 'world' ||
    key === 'societies' ||
    SOCIETY_SPHERE_KEYS.has(key) ||
    WORLD_ELEMENT_KEYS.has(key)
  ) {
    return buildWorldOrSocietyPlaybook(key);
  }

  return buildRulesOrDevSchemaPlaybook(key);
}
