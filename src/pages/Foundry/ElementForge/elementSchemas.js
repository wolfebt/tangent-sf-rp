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
    canonicalType: 'Technology',
    ext: '.tech',
    icon: '⚙️',
    pillStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Defines technologies, tech levels, power sources, and societal impact.'
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

export const ELEMENT_TYPES = [
  // 7 Core AIME Modules
  'World Anvil', 'Persona Maker', 'Setting Architect', 'Species Creator', 
  'Technology Forge', 'Philosophy Scribe', 'Scene Builder',
  // Canonical Single-Word Aliases & RPG Extensions
  'Persona', 'Scene', 'Setting', 'World', 'Species', 'Technology', 'Philosophy',
  'Story Arc', 'Adventure', 'Faction', 'Encounter', 'Item', 'Clue', 'Handout', 'Custom', 'Universe'
];

/**
 * Returns canonical file extension for an element type.
 */
export const getElementFileExtension = (type = '') => {
  const norm = (type || '').toLowerCase();
  if (norm.includes('persona')) return '.persona';
  if (norm.includes('world') || norm.includes('anvil')) return '.world';
  if (norm.includes('setting') || norm.includes('architect')) return '.setting';
  if (norm.includes('species') || norm.includes('creator')) return '.species';
  if (norm.includes('tech') || norm.includes('forge')) return '.tech';
  if (norm.includes('philosophy') || norm.includes('scribe')) return '.philosophy';
  if (norm.includes('scene') || norm.includes('builder')) return '.scene';
  return '.element';
};

export const getTypePillStyle = (type) => {
  const mod = AIME_CORE_MODULES.find(m => m.type === type || m.canonicalType === type);
  if (mod) return mod.pillStyle;

  switch (type) {
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
  { tab: 'Culture & Themes', key: 'themes', label: 'Themes & Aesthetic Inspirations', type: 'textarea', placeholder: 'Central philosophical themes, motifs, visual styles...' }
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
  { tab: 'Mechanics: JSON', key: 'weapons', label: 'Weapons (JSON)', type: 'textarea', placeholder: 'JSON Array...' }
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
  { tab: 'Atmosphere & Hazards', key: 'landmarksSecrets', aliasKeys: ['majorLandmarks', 'hiddenLocations'], label: 'Landmarks & Hidden Locations', type: 'textarea', placeholder: 'Key points of interest, smuggler caches, safehouses...' }
];

const SPECIES_CREATOR_SCHEMA = [
  // Canonical AIME Core Traits
  { tab: 'Core Traits', key: 'speciesName', aliasKeys: ['name', 'title'], label: 'Species Name', type: 'text', placeholder: 'Formal or common name of the species...' },
  { tab: 'Core Traits', key: 'classification', aliasKeys: ['speciesType', 'archetype'], label: 'Classification', type: 'text', placeholder: 'Biological or synthetic category (e.g. "Sentient Silicate", "Cyber-Augmented Primate")...' },
  { tab: 'Core Traits', key: 'physicalDescription', aliasKeys: ['appearance', 'features', 'composition'], label: 'Physical Description', type: 'textarea', placeholder: 'Appearance, anatomy, sensory organs, size scale, life cycle...' },
  { tab: 'Core Traits', key: 'abilitiesPowers', aliasKeys: ['powers', 'abilities', 'traits'], label: 'Abilities & Powers', type: 'textarea', placeholder: 'Special physiological traits, unique skills, natural armor, psionics...' },
  { tab: 'Core Traits', key: 'behaviorDiet', aliasKeys: ['diet', 'temperament'], label: 'Behavior & Diet', type: 'textarea', placeholder: 'Social structure, temperament, dietary requirements, cultural instincts...' },
  { tab: 'Core Traits', key: 'habitatOrigin', aliasKeys: ['homeworld', 'origin'], label: 'Habitat & Origin', type: 'textarea', placeholder: 'Native planetary environment and evolutionary history...' },
  { tab: 'Core Traits', key: 'roleInWorld', aliasKeys: ['role', 'societalImpact'], label: 'Role in the World', type: 'textarea', placeholder: 'Ecological impact, geopolitical niche, or societal role...' },
  // Extended Cloud DBM Links
  { tab: 'Cloud DBM Links', key: 'dbmSpeciesRef', label: 'Species Record (Cloud DB)', type: 'relational', dbSource: 'species', placeholder: 'Link Cloud DBM Species...' },
  { tab: 'Cloud DBM Links', key: 'speciesTypeRef', label: 'Species Type (Cloud DB)', type: 'relational', dbSource: 'species_type', placeholder: 'Select Species Type...' }
];

const TECHNOLOGY_FORGE_SCHEMA = [
  // Canonical AIME Core Traits
  { tab: 'Core Traits', key: 'technologyName', aliasKeys: ['title', 'name', 'category'], label: 'Technology Name', type: 'text', placeholder: 'Clear designation or model name for the technology...' },
  { tab: 'Core Traits', key: 'techLevel', aliasKeys: ['level', 'tl'], label: 'Tech Level', type: 'text', placeholder: 'Sophistication tier (e.g. "Near-Future", "TL-3 Interstellar", "TL-4 Hard-Light", "Precursor")...' },
  { tab: 'Core Traits', key: 'functionPurpose', aliasKeys: ['function', 'purpose'], label: 'Function & Purpose', type: 'textarea', placeholder: 'What the technology does and the problem it solves...' },
  { tab: 'Core Traits', key: 'mechanismPowerSource', aliasKeys: ['power', 'mechanism'], label: 'Mechanism & Power Source', type: 'textarea', placeholder: 'How it operates and what fuels it (e.g. antimatter, zero-point battery, aether tap)...' },
  { tab: 'Core Traits', key: 'socialEconomicImpact', aliasKeys: ['impact', 'socialImpact'], label: 'Social & Economic Impact', type: 'textarea', placeholder: 'How the technology has altered society, culture, warfare, and the economy...' },
  // Extended Engineering & Lore
  { tab: 'Engineering & Drawbacks', key: 'weaknesses', label: 'Drawbacks & Vulnerabilities', type: 'textarea', placeholder: 'Overheating risks, EMP sensitivity, rare resource requirements...' },
  { tab: 'Engineering & Drawbacks', key: 'originContext', label: 'Inventor & Historical Context', type: 'textarea', placeholder: 'Who created it, when, and under what circumstances...' }
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
  { tab: 'Ethics & Cosmogony', key: 'cosmology', label: 'Deity, Origin & Afterlife', type: 'textarea', placeholder: 'Divine entities, cosmic creation, fate of the soul...' }
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
  { tab: 'Tactical & Beats', key: 'readAloud', label: 'GM Read-Aloud Narration', type: 'textarea', placeholder: 'Sensory immersion text to read aloud to players...' }
];

export const ELEMENT_SCHEMAS = {
  // 7 Core AIME Modules (Mapped to both Title and Single-word alias)
  'World Anvil': WORLD_ANVIL_SCHEMA,
  'World': WORLD_ANVIL_SCHEMA,

  'Persona Maker': PERSONA_MAKER_SCHEMA,
  'Persona': PERSONA_MAKER_SCHEMA,

  'Setting Architect': SETTING_ARCHITECT_SCHEMA,
  'Setting': SETTING_ARCHITECT_SCHEMA,

  'Species Creator': SPECIES_CREATOR_SCHEMA,
  'Species': SPECIES_CREATOR_SCHEMA,

  'Technology Forge': TECHNOLOGY_FORGE_SCHEMA,
  'Technology': TECHNOLOGY_FORGE_SCHEMA,

  'Philosophy Scribe': PHILOSOPHY_SCRIBE_SCHEMA,
  'Philosophy': PHILOSOPHY_SCRIBE_SCHEMA,

  'Scene Builder': SCENE_BUILDER_SCHEMA,
  'Scene': SCENE_BUILDER_SCHEMA,

  // Legacy RPG Types (Preserved for compatibility)
  'Custom': [],
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
    { tab: 'Overview', key: 'dbmFactionRef', label: 'Faction Record (Cloud DB)', type: 'relational', dbSource: 'factions', placeholder: 'Link Cloud DBM Faction...' },
    { tab: 'Overview', key: 'coreIdentity', label: 'Core Identity & Mandate', type: 'textarea', placeholder: 'Identity...' },
    { tab: 'Overview', key: 'motto', label: 'Public Motto / Symbol', type: 'text', placeholder: 'Motto...' },
    { tab: 'Ideology & Governance', key: 'ideology', label: 'Core Ideology', type: 'textarea', placeholder: 'Core beliefs and code of operation...' },
    { tab: 'Ideology & Governance', key: 'goals', label: 'Public vs Hidden Agenda', type: 'textarea', placeholder: 'What the faction wants to achieve...' },
    { tab: 'Ideology & Governance', key: 'government', label: 'Government Type & Leadership', type: 'textarea', placeholder: 'Leadership...' },
    { tab: 'Assets & Resources', key: 'resources', label: 'Economic Power & Industry', type: 'textarea', placeholder: 'Assets, weapons, wealth, contacts...' },
    { tab: 'Assets & Resources', key: 'territory', label: 'Scope of Influence & Territory', type: 'textarea', placeholder: 'Territory...' }
  ],
  'Encounter': [
    { tab: 'Overview', key: 'encounterType', label: 'Type', type: 'text', placeholder: 'Kind of encounter (e.g. Combat, Social, Puzzle, Chase)...' },
    { tab: 'Overview', key: 'setup', label: 'Setup', type: 'textarea', placeholder: 'How the encounter begins...' },
    { tab: 'Overview', key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'Possible outcomes and rewards...' },
    { tab: 'Mechanics', key: 'mechanic', label: 'Mechanics', type: 'textarea', placeholder: 'Special rules, timers, or hazards...' }
  ],
  'Item': [
    { tab: 'Overview', key: 'itemCategory', label: 'Cloud DB Category', type: 'text', placeholder: 'Weaponry / Armoring / Gear / Augmentations...' },
    { tab: 'Overview', key: 'rarity', label: 'Rarity', type: 'text', placeholder: 'Rarity (e.g. Common, Prototype, Artifact)...' },
    { tab: 'Properties', key: 'properties', label: 'Properties', type: 'textarea', placeholder: 'Passive abilities and bonuses...' },
    { tab: 'Mechanics', key: 'mechanic', label: 'Mechanics', type: 'textarea', placeholder: 'Active functioning and usage rules...' }
  ],
  'Clue': [
    { tab: 'Overview', key: 'information', label: 'Information Revealed', type: 'textarea', placeholder: 'What this clue reveals...' },
    { tab: 'Overview', key: 'locationFound', label: 'Location Found', type: 'text', placeholder: 'Where or how it is discovered...' },
    { tab: 'Overview', key: 'conclusion', label: 'Player Conclusion', type: 'textarea', placeholder: 'What players should realize...' }
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
    { tab: 'Universal Laws & Structure', key: 'lawsPhysics', label: 'Laws of Physics & Metaphysics', type: 'textarea', placeholder: 'Laws...' }
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
    name: 'Loot & Relic Spec',
    category: 'Items',
    elementType: 'Item',
    icon: '💎',
    promptTemplate: 'Generate an ancient relic / tech item specification for "{title}". Include lore origin, Tech Level, mechanical stat bonuses, active abilities, and CP cost.'
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
    name: 'Player Handout',
    category: 'Props',
    elementType: 'Handout',
    icon: '📄',
    promptTemplate: 'Write an in-universe Player Handout document for "{title}". Format as an encrypted transmission log, corporate memorandum, or intercepted comm-link transcript.'
  },
  {
    id: 'sg_faction',
    name: 'Faction & Group Matrix',
    category: 'Entities',
    elementType: 'Faction',
    icon: '🛡️',
    promptTemplate: 'Generate a Faction Profile for "{title}". Include hierarchy, military assets, tech level, psionic capabilities, rivalries, and GM plot hooks.'
  },
  {
    id: 'sg_mapspec',
    name: 'Tactical Map Spec',
    category: 'Tactical',
    elementType: 'Map',
    icon: '🗺️',
    promptTemplate: 'Generate a Tactical Map Layout Specification for "{title}". Include grid dimensions, terrain biomes, elevation levels, cover positions, and dynamic lighting zones.'
  }
];
