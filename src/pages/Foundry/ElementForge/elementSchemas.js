/**
 * @file elementSchemas.js
 * @description Element Input Schemas & Field Definitions for Story Foundry & AIME Creative Suite.
 * Grounded in "The Art of AI Crafting" Layer 2 (Traits - The Objective Reality).
 * Defines the 7 Core Element Modules and supports legacy RPG extensions.
 */

export const AIME_CORE_MODULES = [
  {
    type: 'World Anvil',
    canonicalType: 'World',
    ext: '.world',
    icon: '🌍',
    pillStyle: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    description: 'Establishes foundational world, factions, history timeline, and unique physics.'
  },
  {
    type: 'Persona Maker',
    canonicalType: 'Persona',
    ext: '.persona',
    icon: '👤',
    pillStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Creates detailed characters, archetypes, motivations, flaws, and relationships.'
  },
  {
    type: 'Setting Architect',
    canonicalType: 'Setting',
    ext: '.setting',
    icon: '🏛️',
    pillStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Designs specific geographic, architectural, and demographic locations.'
  },
  {
    type: 'Species Creator',
    canonicalType: 'Species',
    ext: '.species',
    icon: '🧬',
    pillStyle: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    description: 'Fleshes out sentient species, xenobiology, powers, behavior, and habitats.'
  },
  {
    type: 'Technology Forge',
    canonicalType: 'Property',
    ext: '.tech',
    icon: '⚙️',
    pillStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Defines property, technologies, weaponry, armoring, augmentations, gear, mecha, and architecture.'
  },
  {
    type: 'Philosophy Scribe',
    canonicalType: 'Philosophy',
    ext: '.philosophy',
    icon: '📜',
    pillStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Codifies religions, belief systems, rituals, iconography, and social influence.'
  },
  {
    type: 'Scene Builder',
    canonicalType: 'Scene',
    ext: '.scene',
    icon: '🎬',
    pillStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Constructs narrative scenes, sluglines, sensory details, and key interactivity.'
  }
];

export const AIME_CORE_ELEMENT_TYPES = AIME_CORE_MODULES.map(m => m.type);

export const PROPERTY_SUBCATEGORIES = [
  { id: 'weaponry', label: 'Weaponry', shortLabel: 'WEAPONRY', dbmCollection: 'weaponry', codexMatrixId: 'weaponry', icon: '⚔️' },
  { id: 'armoring', label: 'Armoring', shortLabel: 'ARMORING', dbmCollection: 'armoring', codexMatrixId: 'armor', icon: '🛡️' },
  { id: 'augmentations', label: 'Augmentations', shortLabel: 'AUGMENTS', dbmCollection: 'augmentations', codexMatrixId: 'augmentations', icon: '🦾' },
  { id: 'gear', label: 'Gear & Equipment', shortLabel: 'GEAR', dbmCollection: 'gear', codexMatrixId: 'equipment', icon: '🎒' },
  { id: 'mecha', label: 'Mecha & Vehicles', shortLabel: 'MECHA', dbmCollection: 'mecha', codexMatrixId: 'mecha', icon: '🤖' },
  { id: 'architecture', label: 'Architecture', shortLabel: 'ARCHITECT', dbmCollection: 'architecture', codexMatrixId: 'architecture', icon: '🏛️' },
  { id: 'technology', label: 'Technology & Schematics', shortLabel: 'TECH', dbmCollection: 'technology', codexMatrixId: 'technology', icon: '⚙️' },
  { id: 'other', label: 'Other Property', shortLabel: 'OTHER', dbmCollection: 'other', codexMatrixId: 'other', icon: '📦' }
];

export const PERSONA_SUBCATEGORIES = [
  { id: 'folio', label: 'Persona Folio', shortLabel: 'FOLIO', source: 'folio', icon: '📜' },
  { id: 'mcm', label: 'Modular Matrix (MCM)', shortLabel: 'MCM', dbmCollection: 'modular_characters', codexMatrixId: 'modular-characters', icon: '🎯' },
  { id: 'story', label: 'Story Personas', shortLabel: 'STORY', source: 'story', icon: '👤' }
];

export const METAPHYSICS_SUBCATEGORIES = [
  { id: 'invocations', label: 'Invocations', shortLabel: 'INVOCATIONS', dbmCollection: 'invocations', codexMatrixId: 'invocation', icon: '🔥' },
  { id: 'disciplines', label: 'Disciplines & Spheres', shortLabel: 'DISCIPLINES', dbmCollection: 'disciplines', codexMatrixId: null, icon: '🔮' },
  { id: 'special_abilities', label: 'Special Abilities', shortLabel: 'ABILITIES', dbmCollection: 'special_abilities', codexMatrixId: null, icon: '⚡' }
];

export const ELEMENT_TYPES = [
  'Persona',
  'Species',
  'Faction',
  'Property',
  'Metaphysics',
  'Scene',
  'Setting',
  'World',
  'Philosophy',
  'Story Arc',
  'Adventure',
  'Encounter',
  'Clue',
  'Handout',
  'Map',
  'Custom',
  'Universe'
];

export const ELEMENT_TYPE_ALIASES = {
  'World Anvil': 'World',
  'Planetary Design': 'World',
  'Persona Maker': 'Persona',
  'Modular Character': 'Persona',
  'Modular Characters': 'Persona',
  'Character': 'Persona',
  'NPC': 'Persona',
  'Setting Architect': 'Setting',
  'Location': 'Setting',
  'Species Creator': 'Species',
  'Technology Forge': 'Property',
  'Technology': 'Property',
  'Item': 'Property',
  'Items': 'Property',
  'Personal Property': 'Property',
  'Weaponry': 'Property',
  'Weapon': 'Property',
  'Weapons': 'Property',
  'Armoring': 'Property',
  'Armor': 'Property',
  'Augmentations': 'Property',
  'Augmentation': 'Property',
  'Cyberware': 'Property',
  'Cybernetics': 'Property',
  'Implant': 'Property',
  'Gear': 'Property',
  'Equipment': 'Property',
  'Artifact': 'Property',
  'Relic': 'Property',
  'Mecha': 'Property',
  'Vehicle': 'Property',
  'Vehicles': 'Property',
  'Architecture': 'Property',
  'Other Property': 'Property',
  'Philosophy Scribe': 'Philosophy',
  'Invocation': 'Metaphysics',
  'Invocations': 'Metaphysics',
  'Discipline': 'Metaphysics',
  'Disciplines': 'Metaphysics',
  'Special Ability': 'Metaphysics',
  'Special Abilities': 'Metaphysics',
  'Psionics': 'Metaphysics',
  'Scene Builder': 'Scene',
  'Custom Codex': 'Custom',
  'Custom Element': 'Custom'
};

/**
 * Normalizes legacy or AIME module element type names into their canonical single-word type.
 */
export const normalizeElementType = (type = '') => {
  if (!type) return 'Custom';
  const trimmed = String(type).trim();
  if (ELEMENT_TYPE_ALIASES[trimmed]) return ELEMENT_TYPE_ALIASES[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [alias, canonical] of Object.entries(ELEMENT_TYPE_ALIASES)) {
    if (alias.toLowerCase() === lower) return canonical;
  }
  const matched = ELEMENT_TYPES.find(t => t.toLowerCase() === lower);
  return matched || trimmed;
};

/**
 * Infers the canonical Property subcategory ('weaponry' | 'armoring' | 'augmentations' | 'gear' | 'mecha' | 'architecture' | 'technology' | 'other')
 * from an ADE element, legacy Item/Technology record, or OmniCortex document.
 */
export const inferPropertySubcategory = (record = {}) => {
  if (!record || typeof record !== 'object') return 'gear';
  const fields = record.fields || {};
  const validIds = new Set(PROPERTY_SUBCATEGORIES.map(s => s.id));

  const explicit = String(
    record.propertySubcategory ||
    fields.propertySubcategory ||
    record.subcategoryId ||
    ''
  ).trim().toLowerCase();
  if (validIds.has(explicit)) return explicit;

  const rawHint = String(
    record.dbmCategory ||
    fields.dbmCategory ||
    fields.itemCategory ||
    record.originalType ||
    record.type ||
    record.category ||
    fields.category ||
    ''
  ).trim().toLowerCase();

  if (rawHint === 'weaponry' || rawHint === 'weapons' || rawHint === 'weapon' || rawHint.includes('weapon')) return 'weaponry';
  if (rawHint === 'armoring' || rawHint === 'armor' || rawHint.includes('armor')) return 'armoring';
  if (rawHint === 'augmentations' || rawHint === 'augmentation' || rawHint.includes('cyber') || rawHint.includes('augment') || rawHint.includes('bioware')) return 'augmentations';
  if (rawHint === 'mecha' || rawHint.includes('mecha') || rawHint.includes('vehicle') || rawHint.includes('starship')) return 'mecha';
  if (rawHint === 'architecture' || rawHint.includes('architect') || rawHint.includes('facility') || rawHint.includes('bunker')) return 'architecture';
  if (rawHint === 'technology' || rawHint === 'technology forge' || rawHint === 'tech' || rawHint === 'synthesis' || rawHint === 'meta-tech') return 'technology';
  if (rawHint === 'other' || rawHint === 'other_property' || rawHint === 'other property' || rawHint.includes('commodit') || rawHint.includes('consumable')) return 'other';
  if (rawHint === 'gear' || rawHint === 'equipment') return 'gear';

  // Heuristic field inspection for untagged records
  if (record.damage || fields.damage || record.wielding || fields.wielding) return 'weaponry';
  if (record.coverage || fields.coverage || record.body_locations || fields.body_locations) return 'armoring';
  if (record.nodes_consumed !== undefined || fields.nodes_consumed !== undefined || record.nodes !== undefined) return 'augmentations';
  if (record.footprint || fields.footprint || record.stories || fields.stories) return 'architecture';
  if (record.vft_mode || fields.vft_mode || (record.frame && record.propulsion)) return 'mecha';
  if (fields.technologyName || fields.socialEconomicImpact || fields.mechanismPowerSource) return 'technology';

  // Fallback title/name keyword inference for untagged legacy items
  const titleHint = String(record.title || record.name || fields.title || fields.name || '').toLowerCase();
  if (/\b(mecha|walker|starship|corvette|frigate|shuttle|rover|skimmer)\b/.test(titleHint)) return 'mecha';
  if (/\b(bunker|citadel|outpost|fortress|habitat|arcology|facility)\b/.test(titleHint)) return 'architecture';
  if (/\b(cyberware|implant|prosthetic|neural|bioware|graft)\b/.test(titleHint)) return 'augmentations';
  if (/\b(armor|armour|plates|carapace|vest|exosuit)\b/.test(titleHint)) return 'armoring';
  if (/\b(rifle|pistol|carbine|cannon|blade|sword|lance|railgun|shotgun)\b/.test(titleHint)) return 'weaponry';

  return 'gear';
};

/**
 * Infers the canonical Metaphysics subcategory ('invocations' | 'disciplines' | 'special_abilities')
 * from an ADE element or OmniCortex document.
 */
export const inferMetaphysicsSubcategory = (record = {}) => {
  if (!record || typeof record !== 'object') return 'invocations';
  const fields = record.fields || {};
  const validIds = new Set(METAPHYSICS_SUBCATEGORIES.map(s => s.id));

  const explicit = String(
    record.metaphysicsSubcategory ||
    fields.metaphysicsSubcategory ||
    record.subcategoryId ||
    ''
  ).trim().toLowerCase();
  if (validIds.has(explicit)) return explicit;

  const rawHint = String(
    record.dbmCategory ||
    fields.dbmCategory ||
    record.originalType ||
    record.type ||
    record.category ||
    fields.category ||
    ''
  ).trim().toLowerCase();

  if (rawHint === 'invocations' || rawHint === 'invocation') return 'invocations';
  if (rawHint === 'disciplines' || rawHint === 'discipline') return 'disciplines';
  if (rawHint === 'special_abilities' || rawHint === 'special ability' || rawHint === 'special abilities' || rawHint.includes('ability')) return 'special_abilities';

  if (record.discipline_skills || fields.discipline_skills) return 'disciplines';

  return 'invocations';
};

/**
 * Returns canonical file extension for an element type.
 */
export const getElementFileExtension = (type = '', subcategory = '') => {
  const norm = (type || '').toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  if (norm.includes('persona')) return '.persona';
  if (norm.includes('world') || norm.includes('anvil')) return '.world';
  if (norm.includes('setting') || norm.includes('architect')) return '.setting';
  if (norm.includes('species') || norm.includes('creator')) return '.species';
  if (norm.includes('tech') || norm.includes('forge') || sub === 'technology') return '.tech';
  if (norm === 'item') return '.item';
  if (norm.includes('property')) return '.property';
  if (norm.includes('metaphysics') || norm.includes('invocation')) return '.metaphysics';
  if (norm.includes('philosophy') || norm.includes('scribe')) return '.philosophy';
  if (norm.includes('scene') || norm.includes('builder')) return '.scene';
  if (norm.includes('faction')) return '.faction';
  if (norm.includes('universe')) return '.universe';
  if (norm.includes('map')) return '.map';
  if (norm.includes('custom') || norm.includes('codex')) return '.custom';
  return '.element';
};

export const getTypePillStyle = (type) => {
  if (type === 'Property') {
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  }
  const mod = AIME_CORE_MODULES.find(m => m.type === type || m.canonicalType === type);
  if (mod) return mod.pillStyle;

  switch (type) {
    case 'Custom':
    case 'Custom Element':
    case 'Custom Codex':
      return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    case 'Story Arc':
    case 'Adventure':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'Persona':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    case 'Scene':
    case 'Setting':
    case 'Encounter':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    case 'Faction':
    case 'Philosophy':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    case 'Metaphysics':
      return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
    case 'Property':
    case 'Item':
    case 'Clue':
    case 'Handout':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'Map':
    case 'World':
    case 'Universe':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    case 'Species':
    case 'Technology':
      return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40';
    default:
      return 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  }
};

// ── DYNAMIC LOREBOOK & TRIGGER SCHEMA FIELDS ──
export const LOREBOOK_TRIGGER_SCHEMA_FIELDS = [
  { tab: 'Lorebook & Triggers', key: 'primaryTriggers', label: 'Primary Trigger Keys', type: 'text', placeholder: 'Comma-separated trigger words (e.g. Aethelgard, Citadel, Spire)...' },
  { tab: 'Lorebook & Triggers', key: 'triggerRegex', label: 'Trigger Regex Pattern', type: 'text', placeholder: 'Regex pattern with character codes (e.g. /\\b(AET-[0-9]{2,4}|aethelgard)\\b/i)...' },
  { tab: 'Lorebook & Triggers', key: 'secondaryTriggers', label: 'Secondary Associative Triggers', type: 'text', placeholder: 'Associative words detected in recursive passes (e.g. security gate, ion grid)...' },
  { tab: 'Lorebook & Triggers', key: 'loreScanPriority', label: 'Lore Injection Priority (1-100)', type: 'text', placeholder: '50' },
  { tab: 'Lorebook & Triggers', key: 'loreBudgetTokens', label: 'Max Element Token Budget', type: 'text', placeholder: '250' },
  { tab: 'Lorebook & Triggers', key: 'loreSuppressCondition', label: 'Story Flag Suppression (e.g. alarm_triggered == true)', type: 'text', placeholder: 'alarm_triggered == true' },
  { tab: 'Lorebook & Triggers', key: 'loreRequireCondition', label: 'Story Flag Requirement (e.g. reputation >= 10)', type: 'text', placeholder: 'infiltrated_citadel == true' }
];

// ── GUIDANCE & DIRECTIVES SCHEMA FIELDS ──
export const GUIDANCE_DIRECTIVE_SCHEMA_FIELDS = [
  { tab: 'Guidance & Directives', key: 'keywords', label: 'Guidance Keywords & Positive Directives', type: 'text', placeholder: 'Comma-separated positive tags (e.g. desert, stealth, high-tech, kinetic)...' },
  { tab: 'Guidance & Directives', key: 'negative_keywords', label: 'Negative Keywords & Railguards', type: 'text', placeholder: 'Comma-separated exclusion tags (e.g. magic, aquatic, peaceful, low-tech)...' }
];

// ── 7 CORE AIME ELEMENT SCHEMAS ──

const WORLD_ANVIL_SCHEMA = [
  // Canonical AIME Core Traits
  { tab: 'Core Traits', key: 'worldName', aliasKeys: ['title', 'highConcept', 'name'], label: 'World Name', type: 'text', placeholder: 'The foundational identifier for your universe or planet...' },
  { tab: 'Core Traits', key: 'corePremise', aliasKeys: ['highConcept', 'premise', 'concept'], label: 'Core Premise / High Concept', type: 'textarea', placeholder: 'One-sentence summary that encapsulates the central idea or hook...' },
  { tab: 'Core Traits', key: 'majorFactions', aliasKeys: ['factions', 'species'], label: 'Major Factions & Powers', type: 'textarea', placeholder: 'Significant organized groups (guilds, kingdoms, megacorps, syndicates) that shape the world...' },
  { tab: 'Core Traits', key: 'historyTimeline', aliasKeys: ['history', 'cataclysms'], label: 'History & Lore Timeline', type: 'textarea', placeholder: 'Chronological sequence of significant events and cataclysms that shaped the world...' },
  { tab: 'Core Traits', key: 'cosmologyPhysics', aliasKeys: ['laws', 'cosmology', 'magic'], label: 'Cosmology & Unique Physics', type: 'textarea', placeholder: 'Fundamental rules of your world, including magic/psionics systems and laws of nature...' },
  // Extended Lore & Geography
  { tab: 'Geography & Astronomy', key: 'starSystem', label: 'Star System & Planetary Bodies', type: 'textarea', placeholder: 'Star system, celestial bodies, orbital coordinates...' },
  { tab: 'Geography & Astronomy', key: 'continents', label: 'Continents, Oceans & Climate', type: 'textarea', placeholder: 'Physical geography, major regions, biomes...' },
  { tab: 'Culture & Themes', key: 'themes', label: 'Themes & Aesthetic Inspirations', type: 'textarea', placeholder: 'Central philosophical themes, motifs, visual styles...' },
  ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
  ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
];

const PERSONA_MAKER_SCHEMA = [
  // Canonical AIME Core Traits
  { tab: 'Core Traits', key: 'name', aliasKeys: ['char-name', 'fullName', 'title'], label: 'Name', type: 'text', placeholder: 'Character full name / operational callsign...' },
  { tab: 'Core Traits', key: 'archetype', aliasKeys: ['char-concept', 'characterArchetype'], label: 'Archetype', type: 'text', placeholder: 'Narrative role (e.g. "The Disillusioned Veteran", "The Rebel", "The Mentor")...' },
  { tab: 'Core Traits', key: 'oneLinePitch', aliasKeys: ['summary', 'pitch'], label: 'One-Line Pitch', type: 'text', placeholder: 'A single, compelling sentence capturing the character\'s essence...' },
  { tab: 'Core Traits', key: 'physicalDescription', aliasKeys: ['appearance', 'char-style'], label: 'Physical Description', type: 'textarea', placeholder: 'Details on appearance, cybernetics, clothing, posture, distinguishing marks...' },
  { tab: 'Core Traits', key: 'personalityMannerisms', aliasKeys: ['mannerisms', 'personalityType'], label: 'Personality & Mannerisms', type: 'textarea', placeholder: 'Their inner world, values, demeanor, speech cadence, and unique habits...' },
  { tab: 'Core Traits', key: 'backgroundHistory', aliasKeys: ['backstory', 'definingTrauma'], label: 'Background & History', type: 'textarea', placeholder: 'Significant life events and defining trauma that shaped them...' },
  { tab: 'Core Traits', key: 'goalsMotivations', aliasKeys: ['char-motive', 'goals', 'primaryConflict'], label: 'Goals & Motivations', type: 'textarea', placeholder: 'Internal desires (Need) vs external objectives (Want)...' },
  { tab: 'Core Traits', key: 'strengthsFlaws', aliasKeys: ['positiveTraits', 'negativeTraits'], label: 'Strengths & Flaws', type: 'textarea', placeholder: 'Virtues, talents, psychological vulnerabilities, and moral failings...' },
  { tab: 'Core Traits', key: 'roleInStory', aliasKeys: ['role'], label: 'Role in Story', type: 'text', placeholder: 'Protagonist, Quest Giver, Antagonist, Fixer, Tethered Ally...' },
  { tab: 'Core Traits', key: 'relationships', aliasKeys: ['keyRelationships', 'relationships'], label: 'Relationships', type: 'textarea', placeholder: 'Web of connections with allies, rivals, family, and factions...' },

  // Tangent RPG System Extensions (Preserved)
  { tab: 'Modular Assembly (MCM)', key: 'mcmTier', label: 'Threat Tier (0-20)', type: 'text', placeholder: '1' },
  { tab: 'Modular Assembly (MCM)', key: 'mcmDesignation', label: 'Designation', type: 'text', placeholder: 'Adversary / Ally / Companion / Neutral' },
  { tab: 'Modular Assembly (MCM)', key: 'mcmChassis', label: 'Chassis Array', type: 'text', placeholder: 'Combatant / Specialist / Socialite / Balanced' },
  { tab: 'Modular Assembly (MCM)', key: 'mcmRole', label: 'Tactical Role', type: 'text', placeholder: 'Bruiser, Commando, Sniper, Guardian, Slicer, Medic, Boss' },
  { tab: 'Relations & Scripting', key: 'keyRelationships', label: 'Key Relationships & Dynamics', type: 'textarea', placeholder: 'Allies, rivals, patrons, and bonds...' },
  { tab: 'Relations & Scripting', key: 'relationsStance', label: 'Default Stance', type: 'text', placeholder: 'Hostile / Suspicious / Neutral / Friendly / Guarding' },
  { tab: 'Relations & Scripting', key: 'vipTarget', label: 'Protected VIP / Ally (Element ID or Name)', type: 'text', placeholder: 'ID or Name of unit to tether/guard...' },
  { tab: 'Relations & Scripting', key: 'rivalTarget', label: 'Marked Rival / Priority Target', type: 'text', placeholder: 'ID or Name of rival or hostile faction...' },
  { tab: 'Relations & Scripting', key: 'vttScript', label: 'Autonomous VTT Script (JSON)', type: 'textarea', placeholder: 'VTT routine payload...' },
  { tab: 'Mechanics: Vitals', key: 'starting-cp', label: 'Starting CP', type: 'text', placeholder: '150' },
  { tab: 'Mechanics: Vitals', key: 'tech-level', label: 'Tech Level', type: 'text', placeholder: '3' },
  { tab: 'Mechanics: Vitals', key: 'magic-level', label: 'Magic Level', type: 'text', placeholder: '1' },
  { tab: 'Mechanics: Vitals', key: 'health', label: 'Health (Physical)', type: 'text', placeholder: '30' },
  { tab: 'Mechanics: Vitals', key: 'vitality', label: 'Vitality (Mental)', type: 'text', placeholder: '30' },
  { tab: 'Mechanics: Vitals', key: 'karma', label: 'Karma', type: 'text', placeholder: '3' },
  { tab: 'Mechanics: Vitals', key: 'plot-points', label: 'Plot Points', type: 'text', placeholder: '0' },
  { tab: 'Mechanics: JSON', key: 'features', label: 'Features (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  { tab: 'Mechanics: JSON', key: 'disadvantages', label: 'Disadvantages (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  { tab: 'Mechanics: JSON', key: 'augmentations', label: 'Augmentations (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  { tab: 'Mechanics: JSON', key: 'awakened', label: 'Awakened (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  { tab: 'Mechanics: JSON', key: 'invocations', label: 'Invocations (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  { tab: 'Mechanics: JSON', key: 'special_abilities', label: 'Special Abilities (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  { tab: 'Mechanics: JSON', key: 'attacks', label: 'Attacks (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  { tab: 'Mechanics: JSON', key: 'armor', label: 'Armor (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  { tab: 'Mechanics: JSON', key: 'gear', label: 'Gear (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  { tab: 'Mechanics: JSON', key: 'weapons', label: 'Weapons (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
  ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
  ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
];

const SETTING_ARCHITECT_SCHEMA = [
  // Canonical AIME Core Traits
  { tab: 'Core Traits', key: 'settingName', aliasKeys: ['title', 'name'], label: 'Setting Name', type: 'text', placeholder: 'Specific identifier for the location (e.g. "Aethelgard", "Neon Sector 4")...' },
  { tab: 'Core Traits', key: 'parentWorld', aliasKeys: ['world', 'system'], label: 'Parent World', type: 'text', placeholder: 'The larger world, system, or planet this setting exists within...' },
  { tab: 'Core Traits', key: 'geographyArchitecture', aliasKeys: ['terrain', 'architecture', 'scale'], label: 'Geography & Architecture', type: 'textarea', placeholder: 'Natural landscape, climate, structure styles, spatial layout...' },
  { tab: 'Core Traits', key: 'populationDemographics', aliasKeys: ['demographics', 'inhabitants'], label: 'Population & Demographics', type: 'textarea', placeholder: 'Number of inhabitants, dominant species, cultural groups, social strata...' },
  { tab: 'Core Traits', key: 'functionPurpose', aliasKeys: ['coreConcept', 'primaryConflict'], label: 'Function & Purpose', type: 'textarea', placeholder: 'Primary role (e.g. "Capital City", "Trading Hub", "Precursor Research Vault")...' },
  // Extended Environment & Atmosphere
  { tab: 'Atmosphere & Hazards', key: 'climateWeather', aliasKeys: ['climate', 'weather'], label: 'Climate & Weather Patterns', type: 'textarea', placeholder: 'Atmospheric pressure, radiation, seasonal storms...' },
  { tab: 'Atmosphere & Hazards', key: 'sensoryDetails', aliasKeys: ['soundsSmells', 'dominantSights'], label: 'Sensory Acoustics & Smells', type: 'textarea', placeholder: 'Industrial hum, ozone odor, void echoes...' },
  { tab: 'Atmosphere & Hazards', key: 'landmarksSecrets', aliasKeys: ['majorLandmarks', 'hiddenLocations'], label: 'Landmarks & Hidden Locations', type: 'textarea', placeholder: 'Key points of interest, smuggler caches, safehouses...' },
  ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
  ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
];

const SPECIES_CREATOR_SCHEMA = [
  // Canonical AIME + OmniCortex Consolidated Species Traits
  { tab: 'Core Traits', key: 'speciesName', aliasKeys: ['name', 'title'], label: 'Species Name', type: 'text', placeholder: 'Formal or common name of the species...' },
  { tab: 'Core Traits', key: 'parent_species', aliasKeys: ['lineage'], label: 'Lineage / Parent Species', type: 'text', placeholder: 'e.g. Humans (Core & Variants), Aeld, Aulurans, Kitin, Synthetics...' },
  { tab: 'Core Traits', key: 'classification', aliasKeys: ['speciesType', 'type', 'archetype'], label: 'Chassis Classification', type: 'text', placeholder: 'Biological or synthetic category (e.g. Humanoid, Synthetic, Beast, Aberration)...' },
  { tab: 'Core Traits', key: 'size', label: 'Size Category', type: 'text', placeholder: 'Medium, Large, Small, Huge...' },
  { tab: 'Core Traits', key: 'oneLinePitch', aliasKeys: ['summary', 'stigma'], label: 'One-Line Pitch / Stigma', type: 'text', placeholder: 'Compelling hook or galactic reputation...' },
  { tab: 'Core Traits', key: 'physicalDescription', aliasKeys: ['description', 'physiologyBiology', 'appearance', 'features'], label: 'Physiology & Physical Description', type: 'textarea', placeholder: 'Appearance, anatomy, sensory organs, size scale, life cycle...' },
  { tab: 'Core Traits', key: 'abilitiesPowers', aliasKeys: ['mechanic', 'powers', 'abilities', 'traits'], label: 'Inherent Traits, Abilities & Mechanics', type: 'textarea', placeholder: 'Special physiological traits, unique skills, natural armor, psionics...' },
  { tab: 'Core Traits', key: 'behaviorDiet', aliasKeys: ['cultureSociety', 'dietaryLifecycle', 'diet', 'temperament'], label: 'Culture, Psychology & Diet', type: 'textarea', placeholder: 'Social structure, temperament, dietary requirements, cultural instincts...' },
  { tab: 'Core Traits', key: 'habitatOrigin', aliasKeys: ['homeworld', 'origin'], label: 'Homeworld & Habitat Origin', type: 'textarea', placeholder: 'Native planetary environment and evolutionary history...' },
  { tab: 'Core Traits', key: 'roleInWorld', aliasKeys: ['roleInSetting', 'role', 'societalImpact'], label: 'Role in Galactic Setting', type: 'textarea', placeholder: 'Ecological impact, geopolitical niche, or societal role...' },
  // Cortex Mechanical Metadata
  { tab: 'Cortex Mechanics', key: 'cp', label: 'Character Points (CP)', type: 'text', placeholder: '0' },
  { tab: 'Cortex Mechanics', key: 'tech_level', label: 'Baseline Tech Level (TL 0-5)', type: 'text', placeholder: '3' },
  { tab: 'Cortex Mechanics', key: 'meta_level', label: 'Baseline Meta Level (ML 0-5)', type: 'text', placeholder: '0' },
  { tab: 'Cortex Mechanics', key: 'movement', label: 'Locomotion Modes', type: 'text', placeholder: 'Ground 30ft, Flight, Zero-G...' },
  // Extended Cloud DBM Links
  { tab: 'Cloud DBM Links', key: 'dbmSpeciesRef', label: 'Species Record (Cloud DB)', type: 'relational', dbSource: 'species', placeholder: 'Link Cloud DBM Species...' },
  { tab: 'Cloud DBM Links', key: 'speciesTypeRef', label: 'Species Type (Cloud DB)', type: 'relational', dbSource: 'species_type', placeholder: 'Select Species Type...' },
  ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
  ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
];

export const PROPERTY_SCHEMA = [
  // Canonical Consolidated Property Traits (Weaponry, Armoring, Augmentations, Gear, Mecha, Architecture, Technology, Other)
  { tab: 'Core Traits', key: 'name', aliasKeys: ['technologyName', 'itemName', 'title'], label: 'Property / Asset Designation', type: 'text', placeholder: 'Clear model, relic, weapon, suit, implant, vehicle, or schematic name...' },
  {
    tab: 'Core Traits',
    key: 'propertySubcategory',
    aliasKeys: ['itemCategory', 'dbmCategory'],
    label: 'Property Subcategory',
    type: 'select',
    options: ['weaponry', 'armoring', 'augmentations', 'gear', 'mecha', 'architecture', 'technology', 'other'],
    placeholder: 'weaponry / armoring / augmentations / gear / mecha / architecture / technology / other'
  },
  { tab: 'Core Traits', key: 'oneLinePitch', aliasKeys: ['summary', 'pitch'], label: 'One-Line Pitch', type: 'text', placeholder: 'Single-sentence operational and narrative hook...' },
  { tab: 'Core Traits', key: 'techLevel', aliasKeys: ['tech_level', 'tl', 'level'], label: 'Tech Level (TL 0-5)', type: 'text', placeholder: '3' },
  { tab: 'Core Traits', key: 'metaLevel', aliasKeys: ['meta_level', 'ml'], label: 'Meta Level (ML 0-5)', type: 'text', placeholder: '0' },
  { tab: 'Core Traits', key: 'rarity', aliasKeys: ['availability', 'quality'], label: 'Availability / Rarity', type: 'text', placeholder: 'Common, Uncommon, Rare, Restricted / Military, Prototype...' },
  { tab: 'Core Traits', key: 'functionPurpose', aliasKeys: ['description', 'properties', 'primary_purpose'], label: 'Overview, Function & Capabilities', type: 'textarea', placeholder: 'What this property/technology does, how operators use it, and its physical profile...' },
  { tab: 'Core Traits', key: 'aestheticForm', aliasKeys: ['faction_skin', 'style'], label: 'Manufacturer, Aesthetic & Form', type: 'textarea', placeholder: 'Cultural skin, chassis materials, silhouette, and sensory signature...' },

  // OmniCortex & Codex Mechanical Specs
  { tab: 'Cortex Specs', key: 'craft_dc', aliasKeys: ['design_dc', 'base_dc'], label: 'Crafting / Valuation DC (0-80)', type: 'text', placeholder: '20' },
  { tab: 'Cortex Specs', key: 'cost', label: 'Credit Value (Cr)', type: 'text', placeholder: '2560' },
  { tab: 'Cortex Specs', key: 'weight', label: 'Weight (kg)', type: 'text', placeholder: '2.5' },
  { tab: 'Cortex Specs', key: 'mechanic', label: 'Rules, Combat Stats & Active Mechanics', type: 'textarea', placeholder: 'Damage dice, armor DR, node displacement, socket bonuses, or system mechanics...' },
  { tab: 'Cortex Specs', key: 'damage', label: 'Weapon Damage (Weaponry)', type: 'text', placeholder: '2d8 Kinetic / 3d6 Plasma...' },
  { tab: 'Cortex Specs', key: 'range', label: 'Effective Range (Weaponry)', type: 'text', placeholder: 'Medium (30m / 100m)...' },
  { tab: 'Cortex Specs', key: 'ap', label: 'Armor Piercing (AP)', type: 'text', placeholder: '2' },
  { tab: 'Cortex Specs', key: 'dr', aliasKeys: ['dr_rating'], label: 'Damage Resistance (DR)', type: 'text', placeholder: '10' },
  { tab: 'Cortex Specs', key: 'sp', aliasKeys: ['durability'], label: 'Structure Points / Durability (SP)', type: 'text', placeholder: '20' },
  { tab: 'Cortex Specs', key: 'nodes_consumed', aliasKeys: ['nodes'], label: 'UDU Node Displacement (Augmentations)', type: 'text', placeholder: '10' },
  { tab: 'Cortex Specs', key: 'location', aliasKeys: ['coverage', 'footprint', 'frame'], label: 'Slot / Coverage / Frame / Footprint', type: 'text', placeholder: 'Torso / Sealed / Walker / Gargantuan...' },

  // Engineering, Lore & VTT Stage Interactivity
  { tab: 'Engineering & VTT', key: 'mechanismPowerSource', aliasKeys: ['power_source', 'propulsion'], label: 'Mechanism, Power Source & Propulsion', type: 'textarea', placeholder: 'Micro-fusion cell, zero-point tap, neural link, grav-repulsor...' },
  { tab: 'Engineering & VTT', key: 'socialEconomicImpact', aliasKeys: ['societalImpact', 'impact'], label: 'Social, Economic & Strategic Impact', type: 'textarea', placeholder: 'How this asset or technology impacts warfare, trade, or society...' },
  { tab: 'Engineering & VTT', key: 'weaknesses', aliasKeys: ['limitationsCosts'], label: 'Drawbacks, Strain & Vulnerabilities', type: 'textarea', placeholder: 'Overheating risks, EMP vulnerability, bio-strain, maintenance cost...' },
  { tab: 'Engineering & VTT', key: 'originContext', aliasKeys: ['originHistory'], label: 'Creator, Provenance & History', type: 'textarea', placeholder: 'Foundry, corporation, or precursor civilization that forged it...' },
  { tab: 'Engineering & VTT', key: 'interactiveType', label: 'VTT Stage Object Type', type: 'text', placeholder: 'none / loot_chest / terminal / door / hazard / shrine / vehicle' },
  { tab: 'Engineering & VTT', key: 'vttInteractionDC', label: 'VTT Lock / Hack / Disarm DC', type: 'text', placeholder: '15' },
  { tab: 'Engineering & VTT', key: 'lootTable', label: 'Contained Loot / Data Payload', type: 'textarea', placeholder: 'Credits, schematics, encrypted logs...' },
  ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
  ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
];

const TECHNOLOGY_FORGE_SCHEMA = PROPERTY_SCHEMA;

const METAPHYSICS_SCHEMA = [
  // Core Traits
  { tab: 'Core Traits', key: 'name', aliasKeys: ['title', 'invocationName'], label: 'Invocation / Discipline / Power Name', type: 'text', placeholder: 'Gravity Singularity, Telekinesis, Astral Severance...' },
  { tab: 'Core Traits', key: 'metaphysicsSubcategory', label: 'Metaphysics Subcategory', type: 'text', placeholder: 'invocations / disciplines / special_abilities' },
  { tab: 'Core Traits', key: 'discipline', label: 'Metaphysical Discipline / Sphere', type: 'text', placeholder: 'Elemental, Dimensional, Psionic, Entropic, Biometabolic...' },
  { tab: 'Core Traits', key: 'oneLinePitch', aliasKeys: ['summary', 'concept'], label: 'One-Line Pitch / Core Effect', type: 'textarea', placeholder: 'Concise overview of how this invocation, discipline, or metaphysical ability alters reality...' },
  { tab: 'Core Traits', key: 'description', label: 'Detailed Metaphysical Overview', type: 'textarea', placeholder: 'Phenomenology, channeler requirements, and in-universe behavior...' },

  // OmniCortex & Codex Invocation / Ability Parameters
  { tab: 'Invocation & Rules', key: 'meta_skill', label: 'Governing Meta Skill', type: 'text', placeholder: 'Meta-Elemental, Meta-Psionics, Meta-Dimensional...' },
  { tab: 'Invocation & Rules', key: 'meta_level', aliasKeys: ['metaLevel', 'ml'], label: 'Meta Level (ML 0–5)', type: 'text', placeholder: '3' },
  { tab: 'Invocation & Rules', key: 'design_dc', aliasKeys: ['craft_dc', 'dc'], label: 'Design / Invocation DC', type: 'text', placeholder: '18' },
  { tab: 'Invocation & Rules', key: 'cast_time', label: 'Cast Time / Action Cost', type: 'text', placeholder: '2 AP / Reaction / 1 Minute Ritual...' },
  { tab: 'Invocation & Rules', key: 'duration', label: 'Duration', type: 'text', placeholder: 'Instantaneous / Concentration (1 min) / Scene...' },
  { tab: 'Invocation & Rules', key: 'range', label: 'Effective Range', type: 'text', placeholder: 'Touch / Short (15m) / Medium (45m) / Line of Sight...' },
  { tab: 'Invocation & Rules', key: 'area', label: 'Area Pattern', type: 'text', placeholder: 'Single Target / 6m Sphere / 10m Cone / 20m Line...' },
  { tab: 'Invocation & Rules', key: 'target', label: 'Target Specification', type: 'text', placeholder: 'Self / One Creature / All Entities in Zone...' },
  { tab: 'Invocation & Rules', key: 'effect', label: 'Effect Type / Damage Profile', type: 'text', placeholder: 'Force Damage, Telepathic Link, Gravity Control, Ward...' },
  { tab: 'Invocation & Rules', key: 'mechanic', label: 'Canonical Rules & Resolution Mechanics', type: 'textarea', placeholder: '2d10 check resolution, saving throws, scaling degrees of success, and modifiers...' },

  // Resonance, Strain & Manifestation
  { tab: 'Manifestation & Strain', key: 'strainBacklash', label: 'Resource Cost, Strain & Overchanneling Backlash', type: 'textarea', placeholder: 'Focus/Strain expenditure, AP cost, and consequences of critical failure or overchanneling...' },
  { tab: 'Manifestation & Strain', key: 'manifestationSensory', aliasKeys: ['crisp_prompt'], label: 'Sensory Signature & Visual Keyframe', type: 'textarea', placeholder: 'Cherenkov halo, ozone crackle, harmonic hum, or visual synthesis prompt...' },
  { tab: 'Manifestation & Strain', key: 'originLore', label: 'Metaphysical Origin & Practitioners', type: 'textarea', placeholder: 'Traditions, species, or awakened orders known to wield this phenomenon...' },
  ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
  ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
];

const PHILOSOPHY_SCRIBE_SCHEMA = [
  // Canonical AIME Core Traits
  { tab: 'Core Traits', key: 'philosophyName', aliasKeys: ['name', 'title', 'category'], label: 'Belief System / Philosophy Name', type: 'text', placeholder: 'Official or common name of the religion or belief system...' },
  { tab: 'Core Traits', key: 'coreTenets', aliasKeys: ['tenet', 'tenets', 'beliefs'], label: 'Core Tenets & Beliefs', type: 'textarea', placeholder: 'Foundational principles, doctrines, worldview, and ontological truth...' },
  { tab: 'Core Traits', key: 'ritualsPractices', aliasKeys: ['rituals', 'practices'], label: 'Rituals & Practices', type: 'textarea', placeholder: 'Ceremonies, daily traditions, regular sacraments, and taboos...' },
  { tab: 'Core Traits', key: 'symbolsIconography', aliasKeys: ['symbols', 'iconography'], label: 'Symbols & Iconography', type: 'textarea', placeholder: 'Key emblems, sacred colors, holy objects, and visual motifs...' },
  { tab: 'Core Traits', key: 'influenceSociety', aliasKeys: ['society', 'influence'], label: 'Influence & Role in Society', type: 'textarea', placeholder: 'Impact on culture, laws, social hierarchy, and politics...' },
  // Extended Ethics & Metaphysics
  { tab: 'Ethics & Cosmogony', key: 'ethics', label: 'Moral Compass & Virtues/Vices', type: 'textarea', placeholder: 'Virtues rewarded, sins condemned, handling of outsiders...' },
  { tab: 'Ethics & Cosmogony', key: 'cosmology', label: 'Deity, Origin & Afterlife', type: 'textarea', placeholder: 'Divine entities, cosmic creation, fate of the soul...' },
  ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
  ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
];

const SCENE_BUILDER_SCHEMA = [
  // Canonical AIME Core Traits
  { tab: 'Core Traits', key: 'sceneName', aliasKeys: ['slugline', 'title', 'sceneTitle'], label: 'Scene Name / Slugline', type: 'text', placeholder: 'Formal slugline (e.g. "INT. COFFEE SHOP - DAY", "EXT. DOCKING BAY 9 - NIGHT")...' },
  { tab: 'Core Traits', key: 'location', aliasKeys: ['locationType', 'setting'], label: 'Location Description', type: 'text', placeholder: 'Precise description of where the scene unfolds...' },
  { tab: 'Core Traits', key: 'sensoryDetails', aliasKeys: ['soundsSmells', 'atmosphere'], label: 'Sensory Details', type: 'textarea', placeholder: 'Sights, sounds, smells, temperature, lighting, and tactile details to bring it to life...' },
  { tab: 'Core Traits', key: 'moodAtmosphere', aliasKeys: ['atmosphere', 'mood'], label: 'Mood & Atmosphere', type: 'textarea', placeholder: 'Overall emotional, dramatic, and psychological tension level...' },
  { tab: 'Core Traits', key: 'keyObjects', aliasKeys: ['keySights', 'props'], label: 'Key Objects & Interactivity', type: 'textarea', placeholder: 'Important props, terminals, clues, or elements characters can interact with...' },
  // Extended Tactical & Beats
  { tab: 'Tactical & Beats', key: 'sceneBeats', label: 'Tactical Scene Beats', type: 'textarea', placeholder: 'Sequential beats: 1. Infiltration, 2. Confrontation, 3. Climax, 4. Extraction...' },
  { tab: 'Tactical & Beats', key: 'readAloud', label: 'Architect Read-Aloud Narration', type: 'textarea', placeholder: 'Sensory immersion text to read aloud to operators...' },
  ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
  ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
];

export const CUSTOM_ELEMENT_SCHEMA = [
  // Canonical User-Defined Traits
  { tab: 'Core Traits', key: 'name', aliasKeys: ['title', 'customTitle'], label: 'Element Name / Title', type: 'text', placeholder: 'Custom element or lorebook identifier...' },
  { tab: 'Core Traits', key: 'category', aliasKeys: ['domain', 'typeTag', 'classification'], label: 'Category / Domain', type: 'text', placeholder: 'e.g. Lorebook Dossier, Secret Intel, Historical Log, Custom Mechanics...' },
  { tab: 'Core Traits', key: 'oneLinePitch', aliasKeys: ['summary', 'brief', 'concept'], label: 'One-Line Pitch / Summary', type: 'text', placeholder: 'One sentence overview capturing this element\'s essence...' },
  { tab: 'Core Traits', key: 'description', aliasKeys: ['content', 'details', 'body'], label: 'Detailed Information & Lore', type: 'textarea', placeholder: 'Full user-defined text, specifications, background, or narrative notes...' },
  { tab: 'Core Traits', key: 'tags', aliasKeys: ['classification', 'keywords'], label: 'Keywords & Classification Tags', type: 'text', placeholder: 'Comma-separated tags (e.g. classified, sector-4, precursor, secret)...' },

  // User-Defined Custom Metadata & Mechanics
  { tab: 'User Data & Mechanics', key: 'customDataType', label: 'Data Type / Format', type: 'text', placeholder: 'Note / Rule / Lore / Mechanic / Handout / System' },
  { tab: 'User Data & Mechanics', key: 'sourceOrAuthor', label: 'Source / Author / In-Universe Origin', type: 'text', placeholder: 'e.g. Intercepted Comms, Dr. Vane\'s Journal, Architect Docket' },
  { tab: 'User Data & Mechanics', key: 'customProperties', label: 'Custom Properties / Key-Values (JSON)', type: 'textarea', placeholder: '{"customStat": 42, "clearance": "Top Secret"}' },
  { tab: 'User Data & Mechanics', key: 'gmNotes', label: 'Architect Confidential Notes', type: 'textarea', placeholder: 'Private Architect-only notes hidden from operators...' },

  // Dynamic Lorebook & Trigger Scanning
  ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
  ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
];

export const ELEMENT_SCHEMAS = {
  // Core AIME Modules (Mapped to both Title and Single-word alias)
  'World Anvil': WORLD_ANVIL_SCHEMA,
  'World': WORLD_ANVIL_SCHEMA,

  'Persona Maker': PERSONA_MAKER_SCHEMA,
  'Persona': PERSONA_MAKER_SCHEMA,

  'Setting Architect': SETTING_ARCHITECT_SCHEMA,
  'Setting': SETTING_ARCHITECT_SCHEMA,

  'Species Creator': SPECIES_CREATOR_SCHEMA,
  'Species': SPECIES_CREATOR_SCHEMA,

  'Property': PROPERTY_SCHEMA,
  'Technology Forge': PROPERTY_SCHEMA,
  'Technology': PROPERTY_SCHEMA,

  'Philosophy Scribe': PHILOSOPHY_SCRIBE_SCHEMA,
  'Philosophy': PHILOSOPHY_SCRIBE_SCHEMA,

  'Metaphysics': METAPHYSICS_SCHEMA,
  'Invocation': METAPHYSICS_SCHEMA,
  'Invocations': METAPHYSICS_SCHEMA,

  'Scene Builder': SCENE_BUILDER_SCHEMA,
  'Scene': SCENE_BUILDER_SCHEMA,

  // User-Defined Custom Element & Lorebook Codex
  'Custom Codex': CUSTOM_ELEMENT_SCHEMA,
  'Custom': CUSTOM_ELEMENT_SCHEMA,
  'Custom Element': CUSTOM_ELEMENT_SCHEMA,
  'Story Arc': [
    { tab: 'Overview', key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Brief overview of the arc...' },
    { tab: 'Overview', key: 'goal', label: 'Goal', type: 'text', placeholder: 'Ultimate objective of this story arc...' },
    { tab: 'Overview', key: 'antagonist', label: 'Key Antagonist', type: 'text', placeholder: 'Main opposing force or entity...' },
    { tab: 'Overview', key: 'linkedFaction', label: 'Linked Faction (Cloud DB)', type: 'relational', dbSource: 'factions', placeholder: 'Select Cloud DBM Faction...' },
    { tab: 'Overview', key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'How the arc concludes...' },
    { tab: 'Overview', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Classification tags (e.g. Cyberpunk, Sector-7, Psi)...' }
  ],
  'Adventure': [
    { tab: 'Overview', key: 'hook', label: 'Hook', type: 'textarea', placeholder: 'How players are drawn into the adventure...' },
    { tab: 'Overview', key: 'goal', label: 'Goal', type: 'text', placeholder: 'Primary objective...' },
    { tab: 'Overview', key: 'stakes', label: 'Stakes', type: 'textarea', placeholder: 'Consequences of failure...' },
    { tab: 'Overview', key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'How the adventure might end...' },
    { tab: 'Overview', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Gameplay tags (e.g. Investigation, Combat, Heist)...' }
  ],
  'Faction': [
    { tab: 'Core Traits', key: 'name', aliasKeys: ['title'], label: 'Faction Name', type: 'text', placeholder: 'Coalition of Independent Worlds, Radiant Impyrium...' },
    { tab: 'Core Traits', key: 'faction_type', aliasKeys: ['classification'], label: 'Faction Classification', type: 'text', placeholder: 'Major Galactic Power, Corporate Syndicate, Sovereign Clan...' },
    { tab: 'Core Traits', key: 'archetype', label: 'Sociological Archetype', type: 'text', placeholder: 'Frontier Industrialists, High-Tech Cyberocracy, Feudal Technocracy...' },
    { tab: 'Core Traits', key: 'oneLinePitch', aliasKeys: ['driving_mandate', 'coreIdentity'], label: 'Core Identity & Driving Mandate', type: 'textarea', placeholder: 'Primary mission, ethos, and galactic posture...' },
    { tab: 'Core Traits', key: 'motto', aliasKeys: ['symbol_sigil'], label: 'Official Motto & Heraldry', type: 'text', placeholder: 'Motto and sigil...' },
    { tab: 'Core Traits', key: 'description', label: 'Detailed Faction Overview', type: 'textarea', placeholder: 'Historical origin, culture, and societal footprint...' },
    { tab: 'Ideology & Governance', key: 'ideology', aliasKeys: ['core_beliefs'], label: 'Core Beliefs & Ideology', type: 'textarea', placeholder: 'Core beliefs and code of operation...' },
    { tab: 'Ideology & Governance', key: 'goals', aliasKeys: ['publicAgenda', 'hiddenAgenda'], label: 'Public vs Hidden Agenda', type: 'textarea', placeholder: 'What the faction wants to achieve openly and covertly...' },
    { tab: 'Ideology & Governance', key: 'government', aliasKeys: ['government_type', 'leadership'], label: 'Government & Leadership', type: 'textarea', placeholder: 'Administrative model, rulers, and succession...' },
    { tab: 'Ideology & Governance', key: 'alliesEnemies', aliasKeys: ['relationship_to_others', 'outsider_view'], label: 'Diplomatic Posture, Allies & Rivals', type: 'textarea', placeholder: 'Foreign relations and friction points...' },
    { tab: 'Assets & Resources', key: 'territory', aliasKeys: ['capital_world', 'territoriesAssets'], label: 'Capital World & Territory', type: 'textarea', placeholder: 'Home system, controlled sectors, and strongholds...' },
    { tab: 'Assets & Resources', key: 'resources', aliasKeys: ['primary_exports', 'economic_model'], label: 'Economic Power & Strategic Exports', type: 'textarea', placeholder: 'Assets, exports, wealth modifier, industry...' },
    { tab: 'Assets & Resources', key: 'military_doctrine', aliasKeys: ['key_units', 'naval_assets'], label: 'Military Doctrine, Units & Fleet', type: 'textarea', placeholder: 'Signature formations, void fleet, and combat doctrine...' },
    { tab: 'Assets & Resources', key: 'architecture', label: 'Architectural Synthesis & Motifs', type: 'textarea', placeholder: 'Architectural keyframes, structural materials, and habitat design language...' },
    { tab: 'Assets & Resources', key: 'gear_aesthetic', aliasKeys: ['design_language'], label: 'Attire, Uniforms & Gear Aesthetic Synthesis', type: 'textarea', placeholder: 'Formal attire, combat livery, color palette, and visual synthesis descriptors...' },
    { tab: 'Cortex Mechanics', key: 'tech_level', label: 'Tech Level (TL 0-5)', type: 'text', placeholder: '3' },
    { tab: 'Cortex Mechanics', key: 'meta_level', label: 'Meta Level (ML 0-5)', type: 'text', placeholder: '1' },
    { tab: 'Cortex Mechanics', key: 'prominent_species', label: 'Prominent Species', type: 'text', placeholder: 'Humans, Draconic Descendants, Synthetics...' },
    { tab: 'Cortex Mechanics', key: 'mechanic', label: 'Faction Perks & Reputation Mechanics', type: 'textarea', placeholder: 'Skill packages, faction traits, and mechanical bonuses...' },
    { tab: 'Overview', key: 'dbmFactionRef', label: 'Faction Record (Cloud DB)', type: 'relational', dbSource: 'factions', placeholder: 'Link Cloud DBM Faction...' },
    ...LOREBOOK_TRIGGER_SCHEMA_FIELDS,
    ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
  ],
  'Encounter': [
    { tab: 'Overview', key: 'encounterType', label: 'Type', type: 'text', placeholder: 'Kind of encounter (e.g. Combat, Social, Puzzle, Chase)...' },
    { tab: 'Overview', key: 'setup', label: 'Setup', type: 'textarea', placeholder: 'How the encounter begins...' },
    { tab: 'Overview', key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'Possible outcomes and rewards...' },
    { tab: 'Mechanics', key: 'mechanic', label: 'Mechanics', type: 'textarea', placeholder: 'Special rules, timers, or hazards...' },
    ...LOREBOOK_TRIGGER_SCHEMA_FIELDS
  ],
  'Item': PROPERTY_SCHEMA,
  'Clue': [
    { tab: 'Overview', key: 'information', label: 'Information Revealed', type: 'textarea', placeholder: 'What this clue reveals...' },
    { tab: 'Overview', key: 'locationFound', label: 'Location Found', type: 'text', placeholder: 'Where or how it is discovered...' },
    { tab: 'Overview', key: 'conclusion', label: 'Operator Conclusion', type: 'textarea', placeholder: 'What operators should realize...' }
  ],
  'Map': [
    { tab: 'Overview', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Map tags (e.g. Grid-Square, Sector-A)...' }
  ],
  'Handout': [
    { tab: 'Overview', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Handout tags (e.g. Document, Cipher, Letter)...' }
  ],
  'Universe': [
    { tab: 'Core Concept & Metaphysics', key: 'designation', label: 'Universe Designation & Pitch', type: 'textarea', placeholder: 'Designation...' },
    { tab: 'Core Concept & Metaphysics', key: 'ontological', label: 'Ontological Premise & The Source', type: 'textarea', placeholder: 'Premise...' },
    { tab: 'Universal Laws & Structure', key: 'lawsPhysics', label: 'Laws of Physics & Metaphysics', type: 'textarea', placeholder: 'Laws...' },
    ...GUIDANCE_DIRECTIVE_SCHEMA_FIELDS
  ]
};

export const SCENARIO_GUIDE_MODULES = [
  {
    id: 'sg_encounter',
    name: 'Combat & Trap Encounter',
    category: 'Tactical',
    elementType: 'Scene',
    icon: '⚔️',
    promptTemplate: 'Design a tactical Combat & Trap Encounter titled "{title}". Include terrain features, cover, environmental hazards, enemy statblocks, tactics, and AP/CP rewards.'
  },
  {
    id: 'sg_npc',
    name: 'NPC Profile',
    category: 'Entities',
    elementType: 'Persona',
    icon: '👤',
    promptTemplate: 'Generate a detailed NPC Profile for "{title}". Include species, faction allegiance, appearance, cybernetics/psionics, motivations, dialogue hooks, and combat stats.'
  },
  {
    id: 'sg_location',
    name: 'Dungeon & Location',
    category: 'World',
    elementType: 'Scene',
    icon: '🏛️',
    promptTemplate: 'Craft a detailed Location & Dungeon Spec for "{title}". Include sensory descriptions, room-by-room breakdown, security systems, loot containers, and atmospheric read-aloud text.'
  },
  {
    id: 'sg_item',
    name: 'Property, Gear & Relic Spec',
    category: 'Property',
    elementType: 'Property',
    icon: '💎',
    promptTemplate: 'Generate a Property / Tech / Armament specification for "{title}". Include subcategory (weaponry, armoring, augmentations, gear, mecha, architecture, or technology), lore origin, Tech Level, mechanical stat bonuses, active abilities, and Crafting DC / Credit valuation.'
  },
  {
    id: 'sg_clue',
    name: 'Mystery & Clue',
    category: 'Investigation',
    elementType: 'Clue',
    icon: '🔍',
    promptTemplate: 'Design an investigative Mystery Clue for "{title}". Include physical appearance, analysis DC checks (Perception/Tech), linked secrets, and deduction leads.'
  },
  {
    id: 'sg_storyarc',
    name: 'Campaign Story Arc',
    category: 'Narrative',
    elementType: 'Story Arc',
    icon: '🌌',
    promptTemplate: 'Outline a major Campaign Story Arc titled "{title}". Include overarching antagonist faction, rising stakes, 3 pivotal milestones, and universe consequences.'
  },
  {
    id: 'sg_handout',
    name: 'Operator Handout',
    category: 'Props',
    elementType: 'Handout',
    icon: '📄',
    promptTemplate: 'Write an in-universe Operator Handout document for "{title}". Format as an encrypted transmission log, corporate memorandum, or intercepted comm-link transcript.'
  },
  {
    id: 'sg_faction',
    name: 'Faction & Group Matrix',
    category: 'Entities',
    elementType: 'Faction',
    icon: '🛡️',
    promptTemplate: 'Generate a Faction Profile for "{title}". Include hierarchy, military assets, tech level, psionic capabilities, rivalries, and Architect plot hooks.'
  },
  {
    id: 'sg_mapspec',
    name: 'Tactical Map Spec',
    category: 'Tactical',
    elementType: 'Map',
    icon: '🗺️',
    promptTemplate: 'Generate a Tactical Map Layout Specification for "{title}". Include grid dimensions, terrain biomes, elevation levels, cover positions, and dynamic lighting zones.'
  },
  {
    id: 'sg_custom',
    name: 'Custom Lore & Codex Entry',
    category: 'Lorebook',
    elementType: 'Custom',
    icon: '📑',
    promptTemplate: 'Generate a detailed Custom Lorebook / Codex Entry for "{title}". Include in-universe background, classification, key facts, sensory aesthetics, and story hooks.'
  }
];
