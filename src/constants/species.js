// ═══════════════════════════════════════════════════════════
// SPECIES MATRIX CONSTANTS (PLAN 23)
// ═══════════════════════════════════════════════════════════

export const SPECIES_BUDGET_LEVELS = {
  Standard: { id: 'Standard', name: 'Standard Species (10–20 BP)', minBP: 10, maxBP: 20, description: 'Humans, Elves, and baseline sentient races' },
  Advanced: { id: 'Advanced', name: 'Advanced Species (25–40 BP)', minBP: 25, maxBP: 40, description: 'Dragonkin, High-Tier Synthetics, and genetically engineered species' },
  Monster: { id: 'Monster', name: 'Monster / NPC Species (40+ BP)', minBP: 40, maxBP: 100, description: 'Dragons, Incorporeal Entities, and Progenitor beings' }
};

export const SPECIES_TYPES = {
  Humanoid: {
    id: 'Humanoid',
    name: 'Humanoid',
    bp: 0,
    description: 'Humanoid species have no special or supernatural abilities, but most can speak and have well-developed societies. Humanoids are usually Medium but Small and Large sized varieties are known.',
    senses: 'Standard',
    traits: 'None',
    immunities: '',
    fortification: '',
    physiology: 'Humanoids breathe, eat, and sleep.'
  },
  Aberration: {
    id: 'Aberration',
    name: 'Aberration',
    bp: 1,
    description: 'Aberrations have a bizarre anatomy, strange abilities, an alien mindset, or any combination of the three.',
    senses: 'Darkvision out to 60 feet. [1]',
    traits: 'Alien mindset',
    immunities: '',
    fortification: '',
    physiology: 'Aberrations eat, sleep, and breathe.'
  },
  Beast: {
    id: 'Beast',
    name: 'Beast',
    bp: 1,
    description: 'A living, nonhuman creature, usually perceived as an animal and/or non-intelligent. Beastkin are hybrids of the Beast type and have similar traits and are added to another corporeal type.',
    senses: 'Low-light vision. [1]',
    traits: 'Beastkin hybrid potential',
    immunities: '',
    fortification: '',
    physiology: 'Beasts eat, sleep, and breathe.'
  },
  Fey: {
    id: 'Fey',
    name: 'Fey',
    bp: 3,
    description: 'A fey is a creature with supernatural abilities and connections to nature or to some other force or place. Feykin are hybrids of the Fey type and have similar traits and are added to another corporeal type.',
    senses: 'Low-light vision. [1]',
    traits: 'Sleepless [2]',
    immunities: '',
    fortification: '',
    physiology: 'Fey breathe and eat.'
  },
  Planar: {
    id: 'Planar',
    name: 'Planar',
    bp: 4,
    description: 'A Planar is at least partially composed of the essence (but not necessarily the matter) of some plane other than the Material Plane. Planar creatures may have familiar forms of other types but may or may not have abilities to match.',
    senses: 'Darkvision 60 feet. [1]',
    traits: 'Planar Origin: Not a creature of the material plane and immune to effects which would pertain to similar creatures. [3]',
    immunities: 'Immune to material plane specific effects [3]',
    fortification: '',
    physiology: 'Planars breathe, eat, and sleep.'
  },
  Dragon: {
    id: 'Dragon',
    name: 'Dragon',
    bp: 5,
    description: 'Dragons are intelligent reptilian creatures with metaphysical abilities. Dragonkin are hybrids of the dragon type and have similar traits and are added to another corporeal type.',
    senses: 'Darkvision 60 feet [1], Low-light vision [1].',
    traits: 'Dragonkin hybrid potential',
    immunities: 'Magical sleep effects and paralysis effects. [3]',
    fortification: '',
    physiology: 'Dragons breathe, eat, and sleep.'
  },
  Mythical: {
    id: 'Mythical',
    name: 'Mythical',
    bp: 5,
    description: 'Beings that usually resemble beasts (or possibly other creature types), typically more intelligent and have special abilities or supernatural powers.',
    senses: 'Darkvision out to 60 feet and low-light vision. [1+1]',
    traits: 'Non-breathing / supernatural physiology [3]',
    immunities: '',
    fortification: '',
    physiology: 'Mythicals do not eat, sleep, or breathe. [3]'
  },
  Ooze: {
    id: 'Ooze',
    name: 'Ooze',
    bp: 6,
    description: 'Oozes are gelatinous / semi-solid amorphous creatures also used to describe swarms of small creatures. Many oozes use blindsight or other non-visual senses to navigate.',
    senses: 'Blindsight 30ft',
    traits: 'Amorphous: Immune to all physical conditional effects due to the nature of their slippery form or base components. [3]',
    immunities: 'Physical conditions [3]',
    fortification: 'Not subject to critical hits or flanking. [3]',
    physiology: 'Semi-solid amorphous form'
  },
  Verdant: {
    id: 'Verdant',
    name: 'Verdant (Plant)',
    bp: 9,
    description: 'This type encompasses vegetable creatures. Note that regular plants lack Wisdom and Charisma scores and are not creatures, but considered living objects. Verdant may be applied to another corporeal type for plant based creatures.',
    senses: 'Low-light vision. [1]',
    traits: 'Plant morphology',
    immunities: 'Mental Immunity (Immune to all mind-affecting effects) [3], Physical Immunity (Immune to paralysis, poison, polymorph, sleep effects, and stunning) [3]',
    fortification: '',
    physiology: 'Verdants breathe and eat, but do not sleep (unless for beneficial effects/spell regain). [2]'
  },
  Elemental: {
    id: 'Elemental',
    name: 'Elemental',
    bp: 13,
    description: 'Elementalkin are hybrids of the Elemental type and have similar traits and are added to another corporeal type.',
    senses: 'Darkvision out to 60 feet. [1]',
    traits: 'Non-living [3]',
    immunities: 'Poison, sleep effects, paralysis, and stunning. [3+3]',
    fortification: 'Not subject to critical hits or flanking. [3]',
    physiology: 'Elementals do not eat, sleep, or breathe. [3]'
  },
  Synthetic: {
    id: 'Synthetic',
    name: 'Synthetic / Construct',
    bp: 15,
    description: 'Animated objects or artificially created creatures. Synthetics designed to emulate another type may have its form but may or may not have abilities to match.',
    senses: 'Low-light vision [1] and Darkvision 60 feet [1].',
    traits: 'Hardened Frame: Bonus HP based on size (Tiny: —, Small: +10, Medium: +20, Large: +40, Huge: +80) [2], Synthetic Strength: Lift/Carry/Grapple as 1 size larger [2], Repair Required: Cannot heal damage on own [-3]',
    immunities: 'Mental Immunity (Mind-affecting effects) [3], Metabolic Immunity (Ability damage/drain, fatigue, exhaustion, energy drain, nonlethal) [3], Fortitude Immunity (Effects requiring Fortitude save) [3]',
    fortification: '',
    physiology: 'Synthetics do not breathe, eat, or sleep, unless they want to gain some beneficial effect from one of these activities. [3]'
  },
  Undead: {
    id: 'Undead',
    name: 'Undead',
    bp: 20,
    description: 'Undead species are once-living creatures animated by spiritual or supernatural forces. Undead are based on another corporeal creature type and may or may not retain its previous traits.',
    senses: 'Darkvision 60 feet. [1]',
    traits: 'Negative Energy Affinity: Harmed by positive / healed by negative energy [2], Resurrection Limits: Immune to raise dead/reincarnate [2]',
    immunities: 'Mental Immunity [3], Physical Immunity (Bleed, death, disease, paralysis, poison, sleep, stun) [3], Metabolic Immunity (Nonlethal, ability/energy drain, physical ability damage, exhaustion/fatigue) [3], Fortitude Immunity [3]',
    fortification: '',
    physiology: 'Undead do not breathe, eat, or sleep, unless they want to gain some beneficial effect from one of these activities. [3]'
  },
  Entity: {
    id: 'Entity',
    name: 'Incorporeal Entity',
    bp: 24,
    description: 'A non-corporeal being which may have never been alive - such as embodiments, essence, avatars and others.',
    senses: 'Darkvision and Ether Sight out to 60 feet. [1+2]',
    traits: 'Incorporeal: Immune to all physical conditional effects due to their incorporeal form [3], Planar: Not a creature of the material plane and immune to effects which would pertain to similar creatures [3]',
    immunities: 'All mind-affecting effects [3]; bleed damage, death effects, disease, paralysis, poison, sleep effects, and stunning [3]; nonlethal damage, ability drain, or energy drain; damage to physical ability scores (Con, Dex, Str); exhaustion and fatigue effects [3]',
    fortification: 'Not subject to critical hits or flanking. [3]',
    physiology: 'Entities do not eat, sleep, or breathe. [3]'
  }
};

export const SIZE_TIER_ORDER = [
  'Miniscule',
  'Fine',
  'Diminutive',
  'Tiny',
  'Small',
  'Medium',
  'Large',
  'Huge',
  'Gargantuan',
  'Colossal',
  'Enormous',
  'Titanic',
  'Super Gargantuan',
  'Mega Colossal'
];

export const getSizeTierIndex = (itemOrName) => {
  if (!itemOrName) return 999;
  const raw = typeof itemOrName === 'string'
    ? itemOrName
    : (itemOrName.name || itemOrName.id || '');
  const clean = raw.replace(/^species_size-/, '').replace(/-/g, ' ').toLowerCase().trim();
  const idx = SIZE_TIER_ORDER.findIndex(tier => tier.toLowerCase() === clean);
  return idx !== -1 ? idx : 999;
};

export const SPECIES_SIZES = {
  Miniscule: { id: 'Miniscule', name: 'Miniscule', bp: 10, strMod: -32, agiMod: 16, combatMod: 32, defMod: 16, stealthMod: 20, stabilityMod: -32, dmgDieStep: -5, speedMod: -20, dimensions: '<1 in / <1 oz (Micro-Organism, Insect, Micro-Drone)' },
  Fine: { id: 'Fine', name: 'Fine', bp: 8, strMod: -16, agiMod: 12, combatMod: 16, defMod: 12, stealthMod: 16, stabilityMod: -24, dmgDieStep: -4, speedMod: -15, dimensions: '<6 in / <1/8 lb (Small Rodent, Micro-Scout)' },
  Diminutive: { id: 'Diminutive', name: 'Diminutive', bp: 6, strMod: -8, agiMod: 8, combatMod: 8, defMod: 8, stealthMod: 12, stabilityMod: -16, dmgDieStep: -3, speedMod: -10, dimensions: '<1 ft / <1 lb (Rat, Sparrow, Mini-Drone)' },
  Tiny: { id: 'Tiny', name: 'Tiny', bp: 4, strMod: -4, agiMod: 4, combatMod: 4, defMod: 4, stealthMod: 8, stabilityMod: -8, dmgDieStep: -2, speedMod: -10, dimensions: '<2 ft / <8 lbs (House Cat, Hawk, Skateboard)' },
  Small: { id: 'Small', name: 'Small', bp: 2, strMod: -2, agiMod: 2, combatMod: 2, defMod: 2, stealthMod: 4, stabilityMod: -4, dmgDieStep: -1, speedMod: -5, dimensions: '<4 ft / <60 lbs (Chimpanzee, Lynx, Scooter)' },
  Medium: { id: 'Medium', name: 'Medium', bp: 0, strMod: 0, agiMod: 0, combatMod: 0, defMod: 0, stealthMod: 0, stabilityMod: 0, dmgDieStep: 0, speedMod: 0, dimensions: '4-8 ft / 60-500 lbs (Human, Rottweiler, Motorcycle)' },
  Large: { id: 'Large', name: 'Large', bp: 2, strMod: 2, agiMod: -2, combatMod: -2, defMod: -2, stealthMod: -4, stabilityMod: 4, dmgDiceMult: 2, speedMult: 2, dimensions: '>8 ft / >500 lbs (Horse, Lion, Small Car)' },
  Huge: { id: 'Huge', name: 'Huge', bp: 4, strMod: 4, agiMod: -4, combatMod: -4, defMod: -4, stealthMod: -8, stabilityMod: 8, dmgDiceMult: 5, speedMult: 5, dimensions: '>16 ft / >4,000 lbs (Elephant, Rhinoceros, Delivery Truck)' },
  Gargantuan: { id: 'Gargantuan', name: 'Gargantuan', bp: 8, strMod: 8, agiMod: -8, combatMod: -8, defMod: -8, stealthMod: -16, stabilityMod: 16, dmgDiceMult: 10, speedMult: 10, dimensions: '<64 ft / <125 tons (Siege Walker, Landing Craft, Apex Behemoth)' },
  Colossal: { id: 'Colossal', name: 'Colossal', bp: 16, strMod: 16, agiMod: -16, combatMod: -16, defMod: -16, stealthMod: -32, stabilityMod: 32, dmgDiceMult: 20, speedMult: 20, dimensions: '<128 ft / <1,000 tons (Titan Mech, Corvette Starship, World-Burrower)' },
  Enormous: { id: 'Enormous', name: 'Enormous', bp: 32, strMod: 32, agiMod: -32, combatMod: -32, defMod: -32, stealthMod: 0, stabilityMod: 64, dmgDiceMult: 40, speedMult: 40, dimensions: '<512 ft / <16,000 tons (Frigate Vessel, Fortress Complex)' },
  Titanic: { id: 'Titanic', name: 'Titanic', bp: 64, strMod: 64, agiMod: -64, combatMod: -64, defMod: -64, stealthMod: 0, stabilityMod: 128, dmgDiceMult: 80, speedMult: 80, dimensions: '<1,024 ft / <144,000 tons (Battleship, Defense Station)' },
  'Super Gargantuan': { id: 'Super Gargantuan', name: 'Super Gargantuan', bp: 128, strMod: 128, agiMod: -128, combatMod: -128, defMod: -128, stealthMod: 0, stabilityMod: 256, dmgDiceMult: 160, speedMult: 160, dimensions: '<5,280 ft / <50M tons (Dreadnought, Colony Spire)' },
  'Mega Colossal': { id: 'Mega Colossal', name: 'Mega Colossal', bp: 256, strMod: 256, agiMod: -256, combatMod: -256, defMod: -256, stealthMod: 0, stabilityMod: 512, dmgDiceMult: 320, speedMult: 320, dimensions: '1 Mile+ / 50M+ tons (Super-Dreadnought, Megastructure Arcology)' }
};


import { 
  DEFAULT_SPECIES_MOVEMENT, 
  SPECIES_MOVEMENT_BASE_MODES, 
  SPECIES_MOVEMENT_ADJUSTERS,
  SPECIES_MOVEMENT_GROUPS,
  SPECIES_MOVEMENT_MODES,
  SPECIES_MOVEMENT_PACES
} from '../data/speciesMovementData.js';

export { 
  DEFAULT_SPECIES_MOVEMENT, 
  SPECIES_MOVEMENT_BASE_MODES, 
  SPECIES_MOVEMENT_ADJUSTERS,
  SPECIES_MOVEMENT_GROUPS,
  SPECIES_MOVEMENT_MODES,
  SPECIES_MOVEMENT_PACES
};

export const SPECIES_MOVEMENT_MODIFICATIONS = SPECIES_MOVEMENT_ADJUSTERS;

/**
 * Universal Aliases mapping legacy and alternate IDs to canonical movement IDs.
 * Ensures 100% backward compatibility with existing species records, saves, and test suites.
 */
export const MOVEMENT_ID_ALIASES = {
  // Ground Base Modes
  normal: 'species_movement-bipedal',
  'normal speed': 'species_movement-bipedal',
  'normal speed (baseline 30 ft)': 'species_movement-bipedal',
  bipedal: 'species_movement-bipedal',
  'bipedal locomotion': 'species_movement-bipedal',
  'movement-normal-speed': 'species_movement-bipedal',
  quadruped: 'species_movement-quadruped',
  quadrupedal: 'species_movement-quadruped',
  'quadrupedal locomotion': 'species_movement-quadruped',
  slithering: 'species_movement-slithering',
  'serpentine slithering': 'species_movement-slithering',
  treads: 'species_movement-treads',
  'treads & tracks': 'species_movement-treads',

  // Flying Base Modes
  gliding: 'species_movement-gliding',
  'gliding wings': 'species_movement-gliding',
  'movement-gliding-wings': 'species_movement-gliding',
  'species_movement-glide': 'species_movement-gliding',
  flight_basic: 'species_movement-flight-basic',
  'basic flight': 'species_movement-flight-basic',
  'movement-flight-basic': 'species_movement-flight-basic',
  flight: 'species_movement-flight',
  'true flight': 'species_movement-flight',
  'species_movement-flight': 'species_movement-flight',

  // Swimming Base Modes
  swim: 'species_movement-swimming',
  swimming: 'species_movement-swimming',
  'basic swimming': 'species_movement-swimming',
  'aquatic swimming': 'species_movement-swimming',
  'movement-swim-trait': 'species_movement-swimming',
  'movement-swimming': 'species_movement-swimming',
  'swim (innate)': 'species_movement-swimming',

  // Climbing Base Modes
  climber: 'species_movement-climbing',
  climbing: 'species_movement-climbing',
  'basic climbing': 'species_movement-climbing',
  'innate climbing': 'species_movement-climbing',
  'movement-climber': 'species_movement-climbing',
  'movement-climbing': 'species_movement-climbing',

  // Burrowing Base Modes
  burrow: 'species_movement-burrowing',
  burrowing: 'species_movement-burrowing',
  'innate burrowing': 'species_movement-burrowing',
  'burrowing movement': 'species_movement-burrowing',
  'movement-burrow-trait': 'species_movement-burrowing',
  'movement-burrowing': 'species_movement-burrowing',
  'movement-burrow': 'species_movement-burrowing',

  // Flicker Base Modes
  flicker: 'species_movement-flicker',
  'flicker movement': 'species_movement-flicker',
  'flicker phase displacement': 'species_movement-flicker',
  'flicker (innate phase step)': 'species_movement-flicker',
  'movement-flicker': 'species_movement-flicker',

  // Speed Adjusters (Modifiers)
  fast: 'movement-fast',
  'fast (+10 ft ground)': 'movement-fast',
  very_fast: 'movement-very-fast',
  'very fast': 'movement-very-fast',
  'very fast (+20 ft ground)': 'movement-very-fast',
  slow: 'movement-slow',
  'slow (-10 ft ground)': 'movement-slow',
  ponderous: 'movement-ponderous',
  'ponderous (-20 ft ground)': 'movement-ponderous',
  sprinter: 'movement-sprinter',
  'sprinter (+10 ft run speed)': 'movement-sprinter',
  hauler: 'movement-hauler',
  'hauler (heavy load mobility)': 'movement-hauler',
  'hauler (heavy load)': 'movement-hauler',
  marcher: 'movement-marcher',
  'marcher (long-distance efficiency)': 'movement-marcher',
  'marcher (endurance travel)': 'movement-marcher',
  leaper: 'movement-leaper',
  'leaper (jump mastery)': 'movement-leaper',
  terrain_movement: 'movement-terrain-movement',
  'terrain movement': 'movement-terrain-movement',
  'terrain movement (difficult terrain)': 'movement-terrain-movement',
  flight_improved: 'movement-flight-improved',
  'improved flight speed': 'movement-flight-improved',
  'improved flight speed (+10 ft flight)': 'movement-flight-improved',
  flight_maneuver: 'movement-flight-maneuver',
  'improved maneuverability': 'movement-flight-maneuver',
  strong_flyer: 'movement-strong-flyer',
  'strong flyer': 'movement-strong-flyer',
  swim_improved: 'movement-swim-improved',
  'enhanced swim speed': 'movement-swim-improved',
  'enhanced swim speed (+10 ft swim)': 'movement-swim-improved',
  climb_improved: 'movement-climb-improved',
  'enhanced climb speed': 'movement-climb-improved',
  'enhanced climb speed (+10 ft climb)': 'movement-climb-improved',
  mountaineer: 'movement-mountaineer',
  'mountaineer (slope stability)': 'movement-mountaineer',
  burrow_improved: 'movement-burrow-improved',
  'enhanced burrow speed': 'movement-burrow-improved',
  'enhanced burrow speed (+10 ft burrow)': 'movement-burrow-improved'
};

export const resolveMovementId = (idOrName) => {
  if (!idOrName) return 'species_movement-bipedal';
  const raw = String(idOrName).trim();
  if (MOVEMENT_ID_ALIASES[raw]) return MOVEMENT_ID_ALIASES[raw];
  const lower = raw.toLowerCase();
  if (MOVEMENT_ID_ALIASES[lower]) return MOVEMENT_ID_ALIASES[lower];
  const baseLower = lower.replace(/\s*\(.*\)/, '').trim();
  if (MOVEMENT_ID_ALIASES[baseLower]) return MOVEMENT_ID_ALIASES[baseLower];
  const clean = lower.replace(/^species_movement-/, '').replace(/^movement-/, '').replace(/-/g, '_');
  if (MOVEMENT_ID_ALIASES[clean]) return MOVEMENT_ID_ALIASES[clean];
  return raw;
};

export const SPECIES_TRAITS_BASIC = [
  { id: 'adapted', name: 'Adapted', bp: 1, type: 'Physical', description: 'No penalties or Damage from one set environment type. Multiple.' },
  { id: 'alter_form_basic', name: 'Alter Form (Basic)', bp: 1, type: 'Physical', description: 'Base Category, Change Appearance only (+5 to Disguise).' },
  { id: 'amphibious', name: 'Amphibious', bp: 1, type: 'Physical', description: 'Breathe Air and Water equally well, +10 to Swim Speed.' },
  { id: 'bonded_terrain', name: 'Bonded Terrain', bp: 1, type: 'Defensive', description: '+2 dodge bonus to AC when in a specific terrain type.' },
  { id: 'bonus_feature', name: 'Bonus Feature', bp: 1, type: 'Trained', description: 'Members of this race select one extra feature of their choice.' },
  { id: 'camouflage', name: 'Camouflage', bp: 1, type: 'Physical', description: 'Choose a favored terrain type. +4 bonus on Stealth checks within that terrain.' },
  { id: 'cats_luck', name: "Cat's Luck", bp: 1, type: 'Defensive', description: 'Once per Long Rest make a Reflex Check at Advantage.' },
  { id: 'cave_dweller', name: 'Cave Dweller', bp: 1, type: 'Trained', description: '+4 bonus on Survival checks made underground.' },
  { id: 'craftsman', name: 'Craftsman', bp: 1, type: 'Trained', description: '+2 to Specific Vocation.' },
  { id: 'digitigrade', name: 'Digitigrade / Ungulated', bp: 1, type: 'Movement', description: '+10 Movement Speed and +4 Stability, Special pants and Boots needed.' },
  { id: 'draconic', name: 'Draconic', bp: 1, type: 'Physical', description: 'Access to purchase various Dragon Traits' },
  { id: 'emissary', name: 'Emissary', bp: 1, type: 'Social', description: 'Once per day make a check at advantage for Bluff or Diplomacy.' },
  { id: 'exoskeleton_partial', name: 'Exoskeleton (Partial)', bp: 1, type: 'Physical', description: 'DR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.' },
  { id: 'focused_study', name: 'Focused Study', bp: 1, type: 'Trained', description: 'Gain Skill Focus in a skill of their choice.' },
  { id: 'frenzy', name: 'Frenzy', bp: 1, type: 'Physical', description: '1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).' },
  { id: 'greedy_eye', name: 'Greedy Eye', bp: 1, type: 'Trained', description: '+4 bonus on all Appraise checks.' },
  { id: 'hardy', name: 'Hardy', bp: 1, type: 'Defensive', description: '+2 racial bonus on saving throws against poison, spells, and spell-like abilities.' },
  { id: 'healthy', name: 'Healthy', bp: 1, type: 'Defensive', description: '+4 bonus on Fortitude saves against disease and poison' },
  { id: 'integrated', name: 'Integrated', bp: 1, type: 'Social', description: '+1 bonus on Bluff, Disguise, and Knowledge (local) checks.' },
  { id: 'low_light_vision', name: 'Low Light Vision', bp: 1, type: 'Sensory', description: 'See twice as well in low light, Improved Spectrum Vision (lower IR and UV).' },
  { id: 'lucky_lesser', name: 'Lucky, Lesser', bp: 1, type: 'Defensive', description: '+1 racial bonus on all saving throws.' },
  { id: 'natural_armor', name: 'Natural Armor', bp: 1, type: 'Defensive', description: '+2 natural armor bonus.' },
  { id: 'patagia', name: 'Patagia', bp: 1, type: 'Physical', description: 'Gliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.' },
  { id: 'reach', name: 'Reach', bp: 1, type: 'Physical', description: 'Reach of 10 feet.' },
  { id: 'reduced_sustenance', name: 'Reduced Sustenance', bp: 1, type: 'Physical', description: 'Eat and drink half typical.' },
  { id: 'relentless', name: 'Relentless', bp: 1, type: 'Physical', description: '+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.' },
  { id: 'runner', name: 'Runner', bp: 1, type: 'Movement', description: '+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running' },
  { id: 'scent', name: 'Scent', bp: 1, type: 'Physical', description: 'Identify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).' },
  { id: 'shadow_affinity', name: 'Shadow Affinity', bp: 1, type: 'Meta', description: 'Gain +5 to Stealth when in Shadowy or Dim area.' },
  { id: 'shadow_blending', name: 'Shadow Blending', bp: 1, type: 'Meta', description: 'Attacks made against members in dim light have 30% miss chance.' },
  { id: 'shards_of_the_past', name: 'Shards of the Past', bp: 1, type: 'Meta', description: 'Pick two skills. Gain +2 racial bonus on both. Represents past lives.' },
  { id: 'silent_hunter', name: 'Silent Hunter', bp: 1, type: 'Movement', description: 'Reduce Stealth penalty for moving by 5 / Stealth checks while running at –20' },
  { id: 'silver_tongued', name: 'Silver Tongued', bp: 1, type: 'Social', description: '+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.' },
  { id: 'skill_bonus', name: 'Skill Bonus', bp: 1, type: 'Trained', description: 'Gain +2 racial bonus to divide amongst noted skills.' },
  { id: 'sneaky', name: 'Sneaky', bp: 1, type: 'Trained', description: '+2 racial bonus on Stealth checks.' },
  { id: 'sociable', name: 'Sociable', bp: 1, type: 'Social', description: 'Diplomacy check to change attitude fails by 5 or more, try again within 24 hours.' },
  { id: 'stable_footed', name: 'Stable Footed', bp: 1, type: 'Defensive', description: '+4 racial Stability bonus while standing on the ground.' },
  { id: 'stalker', name: 'Stalker', bp: 1, type: 'Trained', description: 'Gain +2 bonus to Perception and Stealth checks versus one target.' },
  { id: 'static_bonus_feat', name: 'Static Bonus Feat', bp: 1, type: 'Trained', description: 'Choose one feat with no prerequisites. All members gain this feat as a bonus feat.' },
  { id: 'tail', name: 'Tail', bp: 1, type: 'Physical', description: '+2 to Trip and Balance Checks and usable as a Club.' },
  { id: 'urbanite', name: 'Urbanite', bp: 1, type: 'Social', description: '+2 racial bonus on Diplomacy and Sense Motive checks.' },
  { id: 'water_sense', name: 'Water-Sense', bp: 1, type: 'Sensory', description: 'Blindsense 30 feet against creatures touching the same body of water.' },
  { id: 'synthetic_base_traits', name: 'Synthetic Base Traits', bp: 1, type: 'Physical', description: 'Immune to biological needs, poison, disease, asphyxiation, starvation, and sleep. Uses Structure Points instead of Vitality/Health; must be repaired.' },
  { id: 'sub_routine_matrix', name: 'Sub-Routine Matrix', bp: 1, type: 'Mental', description: 'Dedicated parallel sub-routine co-processors allow concurrent execution of system analyses and technical directives.' },
  { id: 'logic_engine', name: 'Logic Engine', bp: 1, type: 'Mental', description: 'High-speed algorithmic evaluation engine granting +2 bonus on Computation, Logic, and Tactical Evaluation checks.' }
];

export const SPECIES_TRAITS_ADVANCED = [
  { id: 'adaptive_features', name: 'Adaptive Features', bp: 2, is_ranked: true, type: 'Physical', description: 'May change between specific features during a Light Rest. Ranked.' },
  { id: 'adaptive_skill_set', name: 'Adaptive Skill Set', bp: 2, is_ranked: true, type: 'Trained', description: '4 point bonus allotted in a pool. Ranked.' },
  { id: 'additional_limbs', name: 'Additional Limbs', bp: 2, type: 'Physical', description: 'Another pair of prehensile limbs; Arms, Tentacles or other.' },
  { id: 'ageless', name: 'Ageless', bp: 2, type: 'Physical', description: 'Does not suffer penalties nor show any signs of aging.' },
  { id: 'all_around_vision', name: 'All-Around Vision', bp: 2, type: 'Sensory', description: '+4 racial bonus on Perception checks and immune to flanking.' },
  { id: 'alter_form_adv', name: 'Alter Form (Adv)', bp: 2, type: 'Physical', description: 'Base Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.' },
  { id: 'alternate_form', name: 'Alternate Form', bp: 2, type: 'Physical', description: 'An additional ‘Natural’ Form.' },
  { id: 'aquatic', name: 'Aquatic', bp: 2, type: 'Movement', description: '+4 racial bonus on Swim checks and may take 10 on swimming checks.' },
  { id: 'aquatic_strength', name: 'Aquatic Strength', bp: 2, type: 'Physical', description: '+1 size category for Combat, Strength or other checks while in water.' },
  { id: 'autotroph', name: 'Autotroph', bp: 2, type: 'Physical', description: 'Does not require food/drink, may eat/digest elixirs for effects.' },
  { id: 'blind_sense', name: 'Blind Sense', bp: 2, type: 'Sensory', description: 'Sense unseen objects in a 30 ft Radius or Cone of 60 ft.' },
  { id: 'bodyform_appendages', name: 'Bodyform Appendages', bp: 2, type: 'Physical', description: 'Shapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).' },
  { id: 'bodyform_armor', name: 'Bodyform Armor', bp: 2, type: 'Physical', description: 'Shapechange to gain a protective layer.' },
  { id: 'bodyform_armor_options', name: 'Bodyform Armor Options', bp: 2, is_ranked: true, type: 'Physical', description: 'Upgraded Bodyform Armor, +1 option slot. Ranked.' },
  { id: 'bodyform_adaptation', name: 'Bodyform Adaptation', bp: 2, type: 'Physical', description: 'Physiology shifts to be compatible with the new environment.' },
  { id: 'bodyform_mutation', name: 'Bodyform Mutation', bp: 2, is_ranked: true, type: 'Physical', description: 'Adjust to a Racial Trait of which prerequisites are possessed. Ranked.' },
  { id: 'bodyform_sizing', name: 'Bodyform Sizing', bp: 2, type: 'Physical', description: 'Shapechange to alter size category 1 step up or down.' },
  { id: 'bodyform_structure', name: 'Bodyform Structure', bp: 2, is_ranked: true, type: 'Physical', description: 'Adjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.' },
  { id: 'bodyform_weapons', name: 'Bodyform Weapons', bp: 2, type: 'Physical', description: 'Shapechange to gain ‘Natural Weaponry’ based on Size' },
  { id: 'bodyform_weapon_options', name: 'Bodyform Weapon Options', bp: 2, is_ranked: true, type: 'Physical', description: 'Upgraded Bodyform Weapons, +1 option slot. Ranked.' },
  { id: 'brutal', name: 'Brutal', bp: 2, type: 'Physical', description: 'Growths/Spurs doubling Str damage bonus to natural damage (Lethal).' },
  { id: 'chameleon', name: 'Chameleon', bp: 2, type: 'Physical', description: 'Changes color, +5 Stealth or may take 10 on Stealth checks.' },
  { id: 'chloroplast', name: 'Chloroplast', bp: 2, type: 'Physical', description: 'Gain sustenance from and Double Healing rate while in daylight equivalent light.' },
  { id: 'constriction', name: 'Constriction', bp: 2, type: 'Physical', description: 'Grants Improved and Greater Grapple, Crushing damage is 2x Unarmed.' },
  { id: 'curiosity', name: 'Curiosity', bp: 2, type: 'Trained', description: '+4 bonus on Diplomacy checks to gather information, and Knowledge checks.' },
  { id: 'dark_sight', name: 'Dark Sight', bp: 2, type: 'Sensory', description: 'Clear vision in all levels of Light or Darkness (UV, seeing luminescence).' },
  { id: 'defensive_training', name: 'Defensive Training', bp: 2, type: 'Defensive', description: '+2 dodge bonus to Defense.' },
  { id: 'dragon_eyes', name: 'Dragon Eyes', bp: 2, type: 'Sensory', description: 'Choose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.' },
  { id: 'dragon_form', name: 'Dragon Form', bp: 2, type: 'Meta', description: 'Alternate Form of a Large size Dragon' },
  { id: 'dragon_might', name: 'Dragon Might', bp: 2, type: 'Physical', description: 'Lift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.' },
  { id: 'dragon_mind', name: 'Dragon Mind', bp: 2, type: 'Physical', description: 'Make any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.' },
  { id: 'dragon_senses', name: 'Dragon Senses', bp: 2, type: 'Sensory', description: 'Make Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.' },
  { id: 'energy_resist', name: 'Energy Resist', bp: 2, is_ranked: true, type: 'Physical', description: 'DR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.' },
  { id: 'exoskeleton_light', name: 'Exoskeleton (Light)', bp: 2, type: 'Physical', description: 'DR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.' },
  { id: 'fast_heal', name: 'Fast Heal', bp: 2, type: 'Physical', description: 'Daily Recovery of Health and Vitality during a Light Rest (repeatable).' },
  { id: 'fey_affinity', name: 'Fey Affinity', bp: 2, type: 'Meta', description: 'Animals treat character as Trusting & Neutral, Friendly.' },
  { id: 'fiend_affinity', name: 'Fiend Affinity', bp: 2, type: 'Meta', description: 'Animals treat character as a Predator & Dangerous, Wary.' },
  { id: 'gifted_linguist', name: 'Gifted Linguist', bp: 2, type: 'Trained', description: '+4 racial bonus on Linguistics checks.' },
  { id: 'hive_connection', name: 'Hive Connection', bp: 2, type: 'Meta', description: 'Allows members to mentally share information on different levels (Special).' },
  { id: 'longevity', name: 'Longevity', bp: 2, type: 'Physical', description: 'Effectively doubles age categories.' },
  { id: 'lucky_greater', name: 'Lucky, Greater', bp: 2, type: 'Meta', description: '+2 racial bonus on all saving throws.' },
  { id: 'master_tinker', name: 'Master Tinker', bp: 2, type: 'Trained', description: '+2 bonus on Disable Device and Engineering.' },
  { id: 'mind_speech', name: 'Mind Speech', bp: 2, is_ranked: true, type: 'Meta', description: 'Telepathic Communication to one subject within 500 ft. Ranked.' },
  { id: 'natural_weapons', name: 'Natural Weapons', bp: 2, type: 'Combat', description: 'A Claw, Fang, Horn or other attack form.' },
  { id: 'powerful_charge', name: 'Powerful Charge', bp: 2, type: 'Combat', description: 'Charge deals twice the number of damage dice plus 1-1/2 times Str bonus.' },
  { id: 'prehensile_tail', name: 'Prehensile Tail', bp: 2, type: 'Physical', description: '+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.' },
  { id: 'prehensile_limbs', name: 'Prehensile Limbs', bp: 2, type: 'Physical', description: 'Fully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.' },
  { id: 'quadruped', name: 'Quadruped', bp: 2, type: 'Movement', description: 'Four legged, +4 Stability, +10 movement speed. Special Accommodations.' },
  { id: 'quick_reactions', name: 'Quick Reactions', bp: 2, type: 'Physical', description: 'Use double Agility score to calculate base Initiative. Req: Racial Agility +1.' },
  { id: 'resistant', name: 'Resistant', bp: 2, type: 'Defensive', description: '+2 racial bonus on saving throws against mind-affecting effects and poison.' },
  { id: 'rock_throwing', name: 'Rock Throwing', bp: 2, type: 'Combat', description: 'Range increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.' },
  { id: 'sleepless', name: 'Sleepless', bp: 2, type: 'Physical', description: 'Does not require sleep, may rest to regain metaphysical energy.' },
  { id: 'swarming', name: 'Swarming', bp: 2, type: 'Combat', description: 'Two members can share same square. If attacking same foe, considered flanking.' },
  { id: 'synthetic_armor_options', name: 'Synthetic Armor Options', bp: 2, type: 'Physical', description: 'Armor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.' },
  { id: 'synthetic_weapon_options', name: 'Synthetic Weapon Options', bp: 2, type: 'Physical', description: 'Weapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.' },
  { id: 'thermal_sight', name: 'Thermal Sight', bp: 2, type: 'Sensory', description: 'See Infra-Red/heat patterns, track passage of a warm target without light.' },
  { id: 'treespeech', name: 'Treespeech', bp: 2, type: 'Meta', description: 'Ability to converse with plants.' },
  { id: 'venom', name: 'Venom', bp: 2, type: 'Physical', description: 'Hemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)' },
  { id: 'digitized_mind', name: 'Digitized Mind', bp: 2, type: 'Defensive', description: 'Optronic cognitive shielding grants Advantage on all resistance rolls and checks against mental, psionic, and mind-affecting effects.' },
  { id: 'robotic_strength', name: 'Robotic Strength', bp: 2, type: 'Physical', description: 'Reinforced high-torque servo actuators consider the synthetic one category larger for lifting, grappling, and carrying capacity.' },
  { id: 'resilient_design', name: 'Resilient Design', bp: 2, type: 'Defensive', description: 'Dense shock-absorptive synthetic armature provides DR 5/- natural damage reduction.' }
];

export const SPECIES_TRAITS_ELITE = [
  { id: 'alter_form_elite', name: 'Alter Form (Elite)', bp: 4, type: 'Physical', description: 'Base Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.' },
  { id: 'blind_sight', name: 'Blind Sight', bp: 4, type: 'Sensory', description: 'Accurately target unseen objects in a 30 ft Radius or 60 ft Cone.' },
  { id: 'bodyform_heavy_armor', name: 'Bodyform Heavy Armor', bp: 4, type: 'Physical', description: 'Shapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).' },
  { id: 'dragon_apotheosis', name: 'Dragon Apotheosis', bp: 4, type: 'Meta', description: 'Gain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.' },
  { id: 'dragon_breath', name: 'Dragon Breath', bp: 4, type: 'Meta', description: 'Breath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].' },
  { id: 'dragon_wings', name: 'Dragon Wings', bp: 4, type: 'Movement', description: 'Grow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.' },
  { id: 'energized_breath', name: 'Energized Breath', bp: 4, type: 'Meta', description: 'Focus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.' },
  { id: 'energy_absorption', name: 'Energy Absorption', bp: 4, is_ranked: true, type: 'Meta', description: 'Heals 20% of damage ignored. Ranked. Req: Energy Immunity.' },
  { id: 'energy_immunity', name: 'Energy Immunity', bp: 4, type: 'Physical', description: 'Completely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.' },
  { id: 'ether_sight', name: 'Ether Sight', bp: 4, type: 'Meta', description: 'See the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.' },
  { id: 'exoskeleton_heavy', name: 'Exoskeleton (Heavy)', bp: 4, type: 'Physical', description: 'DR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.' },
  { id: 'flight', name: 'Flight', bp: 4, type: 'Movement', description: 'Flight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.' },
  { id: 'hexapedal', name: 'Hexapedal', bp: 4, type: 'Movement', description: 'Six legged, +8 Stability, +20 movement speed. Special Accommodations.' },
  { id: 'immortal', name: 'Immortal', bp: 4, type: 'Meta', description: 'Cannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.' },
  { id: 'nimble_appendages', name: 'Nimble Appendages', bp: 4, type: 'Physical', description: 'Usable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.' },
  { id: 'non_living', name: 'Non-Living', bp: 4, type: 'Meta', description: 'Undead, Elementals and others not classified as Living by normal standards.' },
  { id: 'regeneration', name: 'Regeneration', bp: 4, type: 'Physical', description: 'Will regrow lost Limbs and Organs with recovery of Health.' },
  { id: 'self_revivifying', name: 'Self Revivifying', bp: 4, type: 'Meta', description: '1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.' },
  { id: 'semi_corporeal', name: 'Semi-Corporeal', bp: 4, type: 'Meta', description: 'DR30 vs physical, able to Phase through solid matter, Solidify at will.' },
  { id: 'synthetic_aux_core', name: 'Synthetic Aux Core', bp: 4, type: 'Physical', description: 'Revivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.' },
  { id: 'synthetic_exotic_opt', name: 'Synthetic Exotic Opt', bp: 4, type: 'Physical', description: 'Synthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.' },
  { id: 'synthetic_tech_assim', name: 'Synthetic Tech Assim', bp: 4, type: 'Physical', description: 'Able to absorb, power and use technological devices. Req: Synthetic, TL5.' },
  { id: 'vampiric_power', name: 'Vampiric Power', bp: 4, type: 'Meta', description: 'Gain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).' },
  { id: 'wyrm_senses', name: 'Wyrm Senses', bp: 4, type: 'Sensory', description: 'Take Features from any Acute Sense Line. Req: Dragon Apotheosis.' }
];

export const SPECIES_DISADVANTAGES = [
  { id: 'armless', name: 'Armless', refundBP: 4, costBP: -4, type: 'Physical', description: 'Without Arms.' },
  { id: 'elemental_vulnerability', name: 'Elemental Vulnerability', refundBP: 4, costBP: -4, type: 'Physical', description: 'Vulnerability (+2 dmg per die) to Acid, Cold, Electricity, or Fire.' },
  { id: 'light_blindness', name: 'Light Blindness', refundBP: 4, costBP: -4, type: 'Sensory', description: 'Abrupt exposure to bright light blinds for 1 round; then dazzled. Req: Darkvision.' },
  { id: 'light_sensitivity', name: 'Light Sensitivity', refundBP: 2, costBP: -2, type: 'Sensory', description: 'Dazzled in bright sunlight. Req: Darkvision.' },
  { id: 'negative_energy_affinity', name: 'Negative Energy Affinity', refundBP: 4, costBP: -4, type: 'Meta', description: 'Alive, but harmed by positive/healed by negative energy (like undead).' },
  { id: 'slow', name: 'Slow (Disadvantage)', refundBP: 2, costBP: -2, type: 'Movement', description: 'Base Speed -10 feet (+2 CP Gain) *' },
  { id: 'ponderous', name: 'Ponderous (Disadvantage)', refundBP: 4, costBP: -4, type: 'Movement', description: 'Base Speed -20 feet (+4 CP Gain) *' },
  { id: 'sunlight_powerlessness', name: 'Sunlight Powerlessness', refundBP: 6, costBP: -6, type: 'Meta', description: 'Staggered/Helpless in direct sunlight. Req: Undead/Half-Undead.' },
  { id: 'vulnerable_to_sunlight', name: 'Vulnerable to Sunlight', refundBP: 4, costBP: -4, type: 'Meta', description: 'Take 1 Con damage per hour in sunlight. Req: Native to Darklands/Shadow.' }
];

export const SPECIES_ATTRIBUTE_MODIFIERS = [
  { id: 'improved_strength', name: 'Improved Strength', bp: 5, attribute: 'Strength', code: 'STR', value: 1, type: 'Attribute', effect: '+1 racial bonus to Strength.' },
  { id: 'improved_agility', name: 'Improved Agility', bp: 5, attribute: 'Agility', code: 'AGI', value: 1, type: 'Attribute', effect: '+1 racial bonus to Agility.' },
  { id: 'improved_constitution', name: 'Improved Constitution', alias: 'Improved Stamina', bp: 5, attribute: 'Stamina', code: 'STA', value: 1, type: 'Attribute', effect: '+1 racial bonus to Constitution (Stamina).' },
  { id: 'improved_intellect', name: 'Improved Intellect', bp: 5, attribute: 'Intellect', code: 'INT', value: 1, type: 'Attribute', effect: '+1 racial bonus to Intellect.' },
  { id: 'improved_wisdom', name: 'Improved Wisdom', bp: 5, attribute: 'Wisdom', code: 'WIS', value: 1, type: 'Attribute', effect: '+1 racial bonus to Wisdom.' },
  { id: 'improved_charisma', name: 'Improved Charisma', bp: 5, attribute: 'Charisma', code: 'CHA', value: 1, type: 'Attribute', effect: '+1 racial bonus to Charisma.' },
  { id: 'reduced_ability', name: 'Reduced Ability', bp: -5, refundBP: 5, value: -1, type: 'Attribute', effect: 'Penalties to Ability Scores (+5 CP refund per -1 to Ability Scores).' }
];

export const SPECIES_SKILL_MODIFIERS = [
  { id: 'species_skill_bundle', name: 'Skill Points (+5)', bp: 5, value: 5, costPerPoint: 1, type: 'Skills', effect: '+5 Species Skill Points (Specific Skill Set or a Listed Group).' },
  { id: 'species_skill_point', name: 'Skill Point (+1)', bp: 1, value: 1, costPerPoint: 1, type: 'Skills', effect: '+1 Species Skill Point.' }
];

export const SPECIES_COMPONENT_RULES = {
  types: SPECIES_TYPES,
  sizes: SPECIES_SIZES,
  baseMovement: SPECIES_MOVEMENT_BASE_MODES,
  movementModifications: SPECIES_MOVEMENT_MODIFICATIONS,
  movementModes: SPECIES_MOVEMENT_MODES,
  attributeModifiers: SPECIES_ATTRIBUTE_MODIFIERS,
  skillModifiers: SPECIES_SKILL_MODIFIERS,
  basicTraits: SPECIES_TRAITS_BASIC,
  advancedTraits: SPECIES_TRAITS_ADVANCED,
  eliteTraits: SPECIES_TRAITS_ELITE,
  disadvantages: SPECIES_DISADVANTAGES,
  budgetLevels: SPECIES_BUDGET_LEVELS,
  attributeCostPerPoint: 5,
  attributeRefundPerPenalty: 5,
  skillCostPerPoint: 1,
  skillBundleSize: 5,
  skillBundleCost: 5
};
