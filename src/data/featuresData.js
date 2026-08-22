/**
 * Canonical Tangent SF RP Features & Traits Database
 * Comprehensive definitions of features across General, Combat, Meta/Awakened,
 * Skill, Physical, Social, Karma, and Augmentation categories.
 */

export const DEFAULT_FEATURES = [
  // --- META & AWAKENED ---
  {
    id: 'feat-awakened-mental',
    name: 'Awakened: Mental Discipline',
    category: 'Meta',
    type: 'meta',
    cp: 3,
    description: 'Unlocks psionic potential in the Mental Discipline, allowing development of telepathy, clairvoyance, and psychic projection skills.',
    mechanic: 'Prerequisite for Mental Discipline skills and psychic invocations.'
  },
  {
    id: 'feat-awakened-entropy',
    name: 'Awakened: Entropy Discipline',
    category: 'Meta',
    type: 'meta',
    cp: 3,
    description: 'Unlocks metaphysical mastery over decay, chaos, probability distortion, and chronological entropy.',
    mechanic: 'Prerequisite for Entropy Discipline skills and invocations.'
  },
  {
    id: 'feat-awakened-dimension',
    name: 'Awakened: Dimensional Discipline',
    category: 'Meta',
    type: 'meta',
    cp: 3,
    description: 'Unlocks mastery over spatial folds, teleportation, pocket dimensions, and subspace traversal.',
    mechanic: 'Prerequisite for Dimension Discipline skills and portal invocations.'
  },
  {
    id: 'feat-awakened-energy',
    name: 'Awakened: Energy Discipline',
    category: 'Meta',
    type: 'meta',
    cp: 3,
    description: 'Unlocks command over thermal, electrical, radiation, and kinetic energy manipulation.',
    mechanic: 'Prerequisite for Energy Discipline skills and energy discharge invocations.'
  },
  {
    id: 'feat-awakened-illusion',
    name: 'Awakened: Illusion Discipline',
    category: 'Meta',
    type: 'meta',
    cp: 3,
    description: 'Unlocks sensory manipulation, holographic phantasms, cloaking fields, and psychic misdirection.',
    mechanic: 'Prerequisite for Illusion Discipline skills and sensory distortion invocations.'
  },
  {
    id: 'feat-awakened-matter',
    name: 'Awakened: Matter Discipline',
    category: 'Meta',
    type: 'meta',
    cp: 3,
    description: 'Unlocks transmutation, density control, molecular restructuring, and elemental alchemy.',
    mechanic: 'Prerequisite for Matter Discipline skills and material shaping invocations.'
  },
  {
    id: 'feat-augmented',
    name: 'Augmented',
    category: 'Augmentation',
    type: 'ability',
    cp: 3,
    description: 'Specially conditioned or surgically prepared physiology capable of accepting cybernetic, biomechanical, or genetic augmentations without rejection.',
    mechanic: 'Enables installation and activation of advanced cyberware and bio-mods.'
  },

  // --- COMBAT FEATURES ---
  {
    id: 'feat-combat-reflexes',
    name: 'Combat Reflexes',
    category: 'Combat',
    type: 'combat',
    cp: 3,
    description: 'Lightning-fast situational awareness in life-or-death engagements. Never caught off-guard.',
    mechanic: '+2 bonus to Initiative and immune to initial surprise round penalties.'
  },
  {
    id: 'feat-ambidexterity',
    name: 'Ambidexterity',
    category: 'Combat',
    type: 'combat',
    cp: 3,
    description: 'Equal proficiency wielding weapons or operating tools with either hand.',
    mechanic: 'Eliminates off-hand attack and multi-action penalties for dual wielding.'
  },
  {
    id: 'feat-quick-draw',
    name: 'Quick Draw',
    category: 'Combat',
    type: 'combat',
    cp: 3,
    description: 'Instinctively drawing, holstering, or swapping weapons in a fraction of a second.',
    mechanic: 'Drawing or stowing a sidearm/melee weapon is a free action instead of a standard action.'
  },
  {
    id: 'feat-iron-will',
    name: 'Iron Will',
    category: 'Combat',
    type: 'ability',
    cp: 3,
    description: 'Indomitable mental fortitude that repels psychic intrusion, fear, coercion, and panic.',
    mechanic: '+3 bonus on all mental resistance and composure checks against intimidation or psionics.'
  },
  {
    id: 'feat-high-pain-threshold',
    name: 'High Pain Threshold',
    category: 'Combat',
    type: 'combat',
    cp: 3,
    description: 'Extraordinary tolerance to physical injury, shock, nerve damage, and trauma.',
    mechanic: 'Ignore wound penalties until Health drops below 25% of maximum.'
  },
  {
    id: 'feat-toughness',
    name: 'Toughness',
    category: 'Combat',
    type: 'combat',
    cp: 3,
    description: 'Dense muscle fiber and resilient tissue capable of soaking heavy trauma.',
    mechanic: 'Increases base Health pool by +5 points.'
  },
  {
    id: 'feat-hard-to-kill',
    name: 'Hard to Kill',
    category: 'Combat',
    type: 'combat',
    cp: 3,
    description: 'Uncanny stubbornness at death\'s door, stabilizing under fatal trauma.',
    mechanic: '+4 bonus on Stamina survival checks when incapacitated or in critical condition.'
  },
  {
    id: 'feat-signature-weapon',
    name: 'Signature Weapon',
    category: 'Combat',
    type: 'combat',
    cp: 3,
    description: 'Custom-tuned, intimately familiar firearm or blade optimized for your exact grip and cadence.',
    mechanic: '+1 Strike and +1 Critical Threat when attacking with the designated signature weapon.'
  },

  // --- GENERAL & TALENT FEATURES ---
  {
    id: 'feat-educated',
    name: 'Educated',
    category: 'General',
    type: 'general',
    cp: 3,
    description: 'Rigorous formal academic training across sciences, history, literature, and technology.',
    mechanic: '+2 bonus on Academics, Research, and all Mental Knowledge skill checks.'
  },
  {
    id: 'feat-technologist',
    name: 'Technologist',
    category: 'General',
    type: 'general',
    cp: 3,
    description: 'Intuitive grasp of advanced hardware, high-tech systems, and experimental technology ahead of your era.',
    mechanic: 'Reduces or eliminates out-of-epoch Tech Level penalties when using or repairing higher TL devices.'
  },
  {
    id: 'feat-photographic-memory',
    name: 'Photographic Memory',
    category: 'General',
    type: 'general',
    cp: 3,
    description: 'Perfect recall of visual blueprints, text, cipher codes, maps, faces, and spoken dialogues.',
    mechanic: 'Automatic recall of intricate data, schematics, or conversations previously observed.'
  },
  {
    id: 'feat-jack-of-all-trades',
    name: 'Jack of All Trades',
    category: 'Skill',
    type: 'skill',
    cp: 3,
    description: 'Broad worldly experience allowing competent attempts at unfamiliar skills without formal training.',
    mechanic: 'Eliminates the untrained penalty for all standard physical, mental, and social skill checks.'
  },
  {
    id: 'feat-master-craftsman',
    name: 'Master Craftsman',
    category: 'Skill',
    type: 'skill',
    cp: 3,
    description: 'Exceptional artisan and fabrication capability with custom weapons, armor, or machinery.',
    mechanic: 'Reduces crafting time by 25% and grants +2 on Artificer, Armorer, or Weaponsmith checks.'
  },
  {
    id: 'feat-danger-sense',
    name: 'Danger Sense',
    category: 'General',
    type: 'ability',
    cp: 3,
    description: 'An instinctual sixth sense tingling seconds before imminent danger, ambushes, or traps trigger.',
    mechanic: 'GM provides preemptive warning check before hazards or traps detonate.'
  },
  {
    id: 'feat-keen-senses',
    name: 'Keen Senses',
    category: 'General',
    type: 'ability',
    cp: 3,
    description: 'Razor-sharp visual, auditory, and olfactory perception.',
    mechanic: '+2 bonus on Alertness and Investigation perception checks.'
  },

  // --- PHYSICAL & MOVEMENT FEATURES ---
  {
    id: 'feat-running',
    name: 'Running',
    category: 'Physical',
    type: 'ability',
    cp: 3,
    description: 'Trained gait and sprinting efficiency allowing burst acceleration and prolonged jogging.',
    mechanic: 'Increases Running pace to 5x and Sprinting to 7x Base Speed without penalty.'
  },
  {
    id: 'feat-fleet-footed',
    name: 'Fleet Footed',
    category: 'Physical',
    type: 'ability',
    cp: 3,
    description: 'Naturally swift ground movement with high stride velocity.',
    mechanic: '+20% increase to base terrestrial movement speed.'
  },
  {
    id: 'feat-climbing',
    name: 'Climbing',
    category: 'Physical',
    type: 'ability',
    cp: 3,
    description: 'Effortless scaling of sheer cliffs, urban facades, elevator shafts, and ship hulls.',
    mechanic: 'Climbing at full Base Speed, Scaling at 2x, Fast Ascent at 3x, and Fast Descent at 6x.'
  },
  {
    id: 'feat-swimming',
    name: 'Swimming',
    category: 'Physical',
    type: 'ability',
    cp: 3,
    description: 'Aquatic prowess, efficient breathing control, and streamlined stroke in rough seas.',
    mechanic: 'Swim at full Base Speed, Glide at 2x, and Stroke at 3x without penalty.'
  },
  {
    id: 'feat-soar',
    name: 'Soar',
    category: 'Physical',
    type: 'ability',
    cp: 3,
    description: 'Avian or glidewing mastery utilizing thermals and aerodynamic maneuvers.',
    mechanic: 'Increases flight multiples to Soar 5x and Diving 9x Base Speed with High Ground advantage.'
  },
  {
    id: 'feat-night-vision',
    name: 'Night Vision',
    category: 'Physical',
    type: 'ability',
    cp: 3,
    description: 'Enhanced low-light or infrared tapetum lucidum eyesight.',
    mechanic: 'See clearly in dim lighting and total darkness up to 60 meters without illumination gear.'
  },
  {
    id: 'feat-environmental-adaptation',
    name: 'Environmental Adaptation',
    category: 'Physical',
    type: 'ability',
    cp: 3,
    description: 'Physiological tolerance to extreme atmospheric pressure, radiation, zero-G, or toxic biospheres.',
    mechanic: '+3 bonus on Stamina checks against environmental hazards, vacuum exposure, or toxins.'
  },
  {
    id: 'feat-natural-armor',
    name: 'Natural Armor',
    category: 'Physical',
    type: 'ability',
    cp: 3,
    description: 'Subdermal chitin, dense scales, hardened carapace, or thick hide.',
    mechanic: 'Provides permanent innate +2 Physical Damage Absorption that stacks with worn armor.'
  },

  // --- SOCIAL & ASSET FEATURES ---
  {
    id: 'feat-attractive',
    name: 'Attractive',
    category: 'Social',
    type: 'general',
    cp: 3,
    description: 'Striking physical charisma, magnetic presence, and disarming charm.',
    mechanic: '+2 bonus on Bluff, Diplomacy, Oratory, and Style checks when positive impression applies.'
  },
  {
    id: 'feat-benefit-equipment',
    name: 'Benefit: Starship / Heavy Asset',
    category: 'Social',
    type: 'general',
    cp: 3,
    description: 'Command or personal ownership of a scout vessel, customized vehicle, or sponsored asset.',
    mechanic: 'Grants access to a reliable, maintainable scout starship or high-grade operational transport.'
  },
  {
    id: 'feat-wealth',
    name: 'Wealthy Patronage',
    category: 'Social',
    type: 'general',
    cp: 3,
    description: 'Substantial lines of credit, corporate trust funds, or ancestral treasury reserves.',
    mechanic: 'Multiplies starting liquid credits and credit rating for purchasing high-tier equipment.'
  },
  {
    id: 'feat-contacts',
    name: 'Network of Contacts',
    category: 'Social',
    type: 'general',
    cp: 3,
    description: 'Reliable informants, corporate liaisons, fixers, and black-market brokers across the sector.',
    mechanic: 'Allows obtaining illicit goods, security passes, or classified intelligence during downtime.'
  },
  {
    id: 'feat-diplomatic-immunity',
    name: 'Diplomatic Immunity',
    category: 'Social',
    type: 'general',
    cp: 3,
    description: 'Official recognized envoy status exempting you from local civil arrest and border tariffs.',
    mechanic: 'Legal protection against local jurisdiction prosecution except for extreme acts of war.'
  },
  {
    id: 'feat-renowned',
    name: 'Renowned Reputation',
    category: 'Social',
    type: 'general',
    cp: 3,
    description: 'Widespread celebrity, heroic stature, or feared notoriety throughout the star systems.',
    mechanic: '+2 on Leadership and Intimidate checks against targets familiar with your legend.'
  },
  {
    id: 'feat-linguist',
    name: 'Polyglot Linguist',
    category: 'Social',
    type: 'general',
    cp: 3,
    description: 'Natural gift for quickly parsing alien dialects, syntax, and ancient galactic scripts.',
    mechanic: 'Fluency in 4 additional planetary languages and +3 on Language deciphering checks.'
  },

  // --- KARMA & FATE FEATURES ---
  {
    id: 'feat-second-wind',
    name: 'Second Wind',
    category: 'Karma',
    type: 'karma',
    cp: 3,
    description: 'Inner reserve of determination allowing quick recovery without taking a prolonged rest.',
    mechanic: 'Spend 1 full minute focusing to refresh once-per-rest abilities without a full camp.'
  },
  {
    id: 'feat-karma-reservoir',
    name: 'Karma Reservoir',
    category: 'Karma',
    type: 'karma',
    cp: 3,
    description: 'Deepened cosmic resonance and metaphysical luck.',
    mechanic: 'Permanently increases maximum Karma Point pool by +1 point.'
  }
];

export const FEATURE_CATEGORIES = [
  'Meta',
  'Combat',
  'General',
  'Physical',
  'Social',
  'Karma',
  'Skill',
  'Augmentation'
];
