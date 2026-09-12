/**
 * @file companionModularMatrix.js
 * @description Canonical Tangent Modular Companion Matrix
 * Strictly grounded in: docs/game rules/architect/99. MODULAR COMPANION MATRIX.md
 * Formula: Form Package (15 CP) + Function Package (25 CP) = 40 CP Companion
 * Ranked Feature: Rank 1 = 40 CP, Rank 2+ = +10 CP per rank (or 2nd 40 CP unit)
 */

export const CHASSIS_TYPES = {
  biological: {
    id: 'biological',
    label: 'Biological (Beast / Xeno / Plant / Ooze)',
    icon: '🐾',
    integrityType: 'Vitality + Health',
    recovery: 'Natural Healing (Long Rest) or Medicine Skill',
    immunities: 'None (unless specified by Form)',
    fuel: 'Food / Water / Sunlight'
  },
  synthetic: {
    id: 'synthetic',
    label: 'Synthetic (Drone / Bot / Replicant)',
    icon: '🤖',
    integrityType: 'Structure Points (Vitality + Health combined). No Vitality (immune to non-lethal damage)',
    recovery: 'Requires Repair (Engineering Skill) or Replacement Parts (1 hr per 10 SP)',
    immunities: 'Mental, Poison, Disease, Fatigue, Pain, Non-Lethal Damage',
    fuel: 'Energy Cells / Power Core'
  },
  metaphysical: {
    id: 'metaphysical',
    label: 'Metaphysical (Spirit / Elemental / Construct)',
    icon: '✨',
    integrityType: 'Essence (Functions as Health)',
    recovery: 'Requires Attune check or Essence donation from master',
    immunities: 'Physical Grappling (if Incorporeal), Poison, Disease',
    fuel: "Master's Essence or Ambient Magic"
  }
};

export const COMPANION_SUB_FEATURES = [
  {
    id: 'familiar',
    name: 'Familiar',
    prereq: 'Companion Feature',
    cost: 3,
    benefit: 'Empathic Link. You know the companion direction, distance, and general emotional state/status at all times (Planetary Range).'
  },
  {
    id: 'mind_link',
    name: 'Mind Link',
    prereq: 'Companion Feature',
    cost: 3,
    benefit: 'Telepathic Link. You can communicate silently with the companion. You may share Knowledge skills (using the better rank of the two).'
  },
  {
    id: 'shared_senses',
    name: 'Shared Senses',
    prereq: 'Companion Feature',
    cost: 3,
    benefit: 'Sensory Share. You can see/hear through the companion senses as a Standard Action (concentration). While doing so, your own body is Blind/Deaf.'
  },
  {
    id: 'loyal_protector',
    name: 'Loyal Protector',
    prereq: 'Companion Feature',
    cost: 3,
    benefit: 'Interception. If the companion is adjacent to you, it can take a hit meant for you (Reaction).'
  }
];

export const FORM_PACKAGES = [
  {
    id: 'predator',
    name: 'The Predator (Beast)',
    category: 'biological',
    archetypeDesc: 'Wolf, Great Cat, Ground Raptor',
    bpCost: 15,
    size: 'Medium',
    speed: 14,
    armorDr: 1,
    baseHealth: 25,
    baseVitality: 25,
    baseStructure: 0,
    attributes: { strength: 0, agility: 1, stamina: 0, intellect: -1, wisdom: 0, charisma: -1 },
    features: [
      { name: 'Natural Weapons (Bite/Claw 1d6)', bp: 2 },
      { name: 'Scent', bp: 2 },
      { name: 'Speed (Runner +4m)', bp: 2 },
      { name: 'Low-Light Vision', bp: 2 },
      { name: 'Trip / Pounce (Tactical Advantage)', bp: 2 }
    ],
    skills: [
      { name: 'Survival (Instinct)', rank: 1, bp: 1 }
    ],
    attacks: [
      { name: 'Vicious Bite / Claw', damage: '2d10+2', range: 'Melee', notes: 'Trip / Pounce on Advantage' }
    ],
    protocols: ['Scent Tracking', 'Perimeter Overwatch', 'Flank & Pounce']
  },
  {
    id: 'heavy_beast',
    name: 'The Heavy Beast (Beast)',
    category: 'biological',
    archetypeDesc: 'Bear, Boar, Alien Herd Beast',
    bpCost: 15,
    size: 'Large',
    speed: 10,
    armorDr: 2,
    baseHealth: 35,
    baseVitality: 30,
    baseStructure: 0,
    attributes: { strength: 1, agility: 0, stamina: 1, intellect: -2, wisdom: 0, charisma: -1 },
    features: [
      { name: 'Natural Weapons (Gore/Slam 1d8)', bp: 2 },
      { name: 'Tough Hide (Natural Armor 2 DR)', bp: 2 },
      { name: 'Endurance (Fatigue Advantage)', bp: 2 },
      { name: 'Scent', bp: 2 },
      { name: 'Stability (Resist Trip/Bull Rush)', bp: 2 }
    ],
    skills: [
      { name: 'Intimidate (Instinct)', rank: 1, bp: 1 }
    ],
    attacks: [
      { name: 'Heavy Gore / Crushing Slam', damage: '2d10+4', range: 'Melee', notes: 'Resist Trip / Bull Rush' }
    ],
    protocols: ['Bulwark Defense', 'Charge Interception', 'Scent Sweep']
  },
  {
    id: 'avian',
    name: 'The Avian (Beast / Xeno)',
    category: 'biological',
    archetypeDesc: 'Hawk, Pterosaur, Bat-Creature',
    bpCost: 15,
    size: 'Small',
    speed: 16,
    armorDr: 0,
    baseHealth: 15,
    baseVitality: 20,
    baseStructure: 0,
    attributes: { strength: -1, agility: 1, stamina: 0, intellect: -1, wisdom: 1, charisma: -1 },
    features: [
      { name: 'Flight (Winged Aerial Maneuver)', bp: 4 },
      { name: 'Acute Sense (Eagle Vision)', bp: 2 },
      { name: 'Natural Weapons (Talons 1d6)', bp: 2 },
      { name: 'Small Size (+AC / Stealth)', bp: 2 }
    ],
    skills: [
      { name: 'Acrobatics (Flight)', rank: 1, bp: 1 }
    ],
    attacks: [
      { name: 'High-Dive Talons', damage: '2d10+1', range: 'Melee', notes: 'Small Size (+AC)' }
    ],
    protocols: ['Aerial Spotting', 'Harass From Above', 'LoS Reconnaissance']
  },
  {
    id: 'swarm',
    name: 'The Swarm (Vermin / Nanite Cloud)',
    category: 'biological',
    archetypeDesc: 'Rat Swarm, Nano-Cloud, Insect Colony',
    bpCost: 15,
    size: 'Tiny (Swarm)',
    speed: 8,
    armorDr: 0,
    baseHealth: 20,
    baseVitality: 20,
    baseStructure: 30,
    attributes: { strength: -2, agility: 0, stamina: 1, intellect: -2, wisdom: 0, charisma: -2 },
    features: [
      { name: 'Amorphous (Squeeze any gap)', bp: 2 },
      { name: 'Swarm Traits (1/2 Damage Slashing/Piercing)', bp: 4 },
      { name: 'Distraction (Enemies in square Disadvantage)', bp: 2 },
      { name: 'Wall-Crawler', bp: 2 },
      { name: 'All-Around Vision', bp: 2 }
    ],
    disadvantages: [
      { name: 'Vulnerable to Area of Effect (Blast) damage', bp: -1 }
    ],
    skills: [],
    attacks: [
      { name: 'Swarm Engulfment', damage: '2d10 (Continuous)', range: 'In-Square', notes: 'Distraction (Disadvantage to foe)' }
    ],
    protocols: ['Area Infiltration', 'Ablative Swarm Screen', 'Vermin Infiltration']
  },
  {
    id: 'crawler',
    name: 'The Crawler (Insectoid / Arachnid)',
    category: 'biological',
    archetypeDesc: 'Giant Spider, Scorpion, Bio-Beetle',
    bpCost: 15,
    size: 'Medium',
    speed: 10,
    armorDr: 2,
    baseHealth: 25,
    baseVitality: 25,
    baseStructure: 0,
    attributes: { strength: 0, agility: 1, stamina: 0, intellect: -2, wisdom: 0, charisma: -2 },
    features: [
      { name: 'Wall-Crawler (Full Climb Speed)', bp: 2 },
      { name: 'Natural Armor (Chitin DR 2)', bp: 2 },
      { name: 'Tremorsense (15m)', bp: 2 },
      { name: 'Extra Limbs (Grapple & Stability Bonus)', bp: 2 },
      { name: 'Webbing / Neuro-Poison Sting', bp: 2 }
    ],
    skills: [
      { name: 'Stealth (Ambush)', rank: 1, bp: 1 }
    ],
    attacks: [
      { name: 'Mandible Strike / Neuro-Sting', damage: '2d10+2', range: 'Melee', notes: 'Restrain / Poison on Tie or Hit' }
    ],
    protocols: ['Wall Ambush', 'Web Snare', 'Tremor Surveillance']
  },
  {
    id: 'aquatic',
    name: 'The Aquatic (Beast / Xeno)',
    category: 'biological',
    archetypeDesc: 'Bio-Shark, Cyber-Dolphin, Giant Squid',
    bpCost: 15,
    size: 'Medium',
    speed: 14,
    armorDr: 1,
    baseHealth: 30,
    baseVitality: 25,
    baseStructure: 0,
    attributes: { strength: 1, agility: 0, stamina: 0, intellect: -1, wisdom: 0, charisma: -1 },
    features: [
      { name: 'Aquatic (Swim Speed / Water Breathing)', bp: 2 },
      { name: 'Blindsense (Active Sonar)', bp: 2 },
      { name: 'Natural Weapons (Jaws / Tentacles)', bp: 2 },
      { name: 'Fast Swimmer (+4m in water)', bp: 2 },
      { name: 'Grappler (Tentacle Latch On)', bp: 2 }
    ],
    skills: [
      { name: 'Athletics (Swim)', rank: 1, bp: 1 }
    ],
    attacks: [
      { name: 'Apex Aquatic Jaws / Tentacles', damage: '2d10+3', range: 'Melee (Aquatic)', notes: 'Sonar Blindsense' }
    ],
    protocols: ['Submerged Escort', 'Sonar Sonification', 'Aquatic Grapple']
  },
  {
    id: 'ooze',
    name: 'The Ooze (Aberration / Bio-Experiment)',
    category: 'biological',
    archetypeDesc: 'Living Slime, Gelatinous Biopolymer, Shifter',
    bpCost: 15,
    size: 'Medium',
    speed: 6,
    armorDr: 0,
    baseHealth: 35,
    baseVitality: 25,
    baseStructure: 0,
    attributes: { strength: 0, agility: -1, stamina: 1, intellect: -3, wisdom: 0, charisma: -3 },
    features: [
      { name: 'Amorphous (Immune to Crits, Squeeze Micro-Gaps)', bp: 4 },
      { name: 'Acid Touch (Natural Weapon + 1d4 Acid Damage)', bp: 4 },
      { name: 'Adhesive (Wall-Climb / Unbreakable Grapple)', bp: 2 },
      { name: 'Blind (Immune to Gaze & Flash Attacks)', bp: 2 }
    ],
    disadvantages: [
      { name: 'Slow Movement (-10ft speed)', bp: -1 }
    ],
    skills: [],
    attacks: [
      { name: 'Acidic Pseudopod Pseudopod', damage: '2d10 + 1d4 Acid', range: 'Melee', notes: 'Continuous Acid Dissolution' }
    ],
    protocols: ['Vent Creep', 'Armor Dissolution', 'Bio-Barrier Shielding']
  },
  {
    id: 'plant',
    name: 'The Plant (Flora / Fungi)',
    category: 'biological',
    archetypeDesc: 'Walking Thorn-Vine, Spore Mound, Treant Sapling',
    bpCost: 15,
    size: 'Medium',
    speed: 8,
    armorDr: 2,
    baseHealth: 35,
    baseVitality: 25,
    baseStructure: 0,
    attributes: { strength: 0, agility: -1, stamina: 1, intellect: -3, wisdom: 0, charisma: -2 },
    features: [
      { name: 'Plant Traits (Immune: Mind / Paralysis / Poison)', bp: 4 },
      { name: 'Camouflage (Vegetation / Static Cover)', bp: 2 },
      { name: 'Natural Armor (Hardwood Bark DR 2)', bp: 2 },
      { name: 'Reach (Extendable Constricting Vines)', bp: 2 }
    ],
    skills: [
      { name: 'Stealth (Stationary Flora)', rank: 1, bp: 1 }
    ],
    attacks: [
      { name: 'Thorned Vine Whip', damage: '2d10+2', range: '3m (Reach)', notes: 'Mind & Paralysis Immune' }
    ],
    protocols: ['Spore Haze', 'Root Anchor', 'Camouflaged Ambush']
  },
  {
    id: 'elemental',
    name: 'The Elemental (Construct / Meta)',
    category: 'metaphysical',
    archetypeDesc: 'Rock Golem, Magma Hound, Resonant Crystal Shard',
    bpCost: 15,
    size: 'Medium',
    speed: 8,
    armorDr: 4,
    baseHealth: 30,
    baseVitality: 0,
    baseStructure: 45,
    attributes: { strength: 1, agility: -1, stamina: 1, intellect: -2, wisdom: 0, charisma: -2 },
    features: [
      { name: 'Elemental Traits (No Crits, Bleed, Disease)', bp: 4 },
      { name: 'Natural Armor (Solid Granite / Crystal DR 2)', bp: 2 },
      { name: 'Energy Strike (Fire / Cold / Plasma on hit)', bp: 2 },
      { name: 'Hardness (DR 2/- all damage)', bp: 4 }
    ],
    disadvantages: [
      { name: 'Heavy & Loud (Disadvantage on Stealth checks)', bp: -1 }
    ],
    skills: [],
    attacks: [
      { name: 'Resonant Elemental Strike', damage: '2d10+3 (Elemental)', range: 'Melee', notes: 'DR 4 Combined Hardness' }
    ],
    protocols: ['Elemental Bulwark', 'Kinetic Hardening', 'Heat / Shock Aura']
  },
  {
    id: 'rotor_drone',
    name: 'The Rotor-Drone (Synthetic)',
    category: 'synthetic',
    archetypeDesc: 'Tactical Quad-Copter, Anti-Grav Micro-Sphere',
    bpCost: 15,
    size: 'Tiny',
    speed: 18,
    armorDr: 1,
    baseHealth: 0,
    baseVitality: 0,
    baseStructure: 25,
    attributes: { strength: -2, agility: 1, stamina: 0, intellect: 0, wisdom: 0, charisma: -3 },
    features: [
      { name: 'Flight (Mag-Lev Hover Thrusters)', bp: 2 },
      { name: 'Synthetic Traits (Immune: Poison, Pain, Fatigue, Mind)', bp: 6 },
      { name: 'Tiny Size (+Stealth & High Defense)', bp: 2 },
      { name: 'Tactical Recorder & Telemetry Stream', bp: 2 }
    ],
    disadvantages: [
      { name: 'Fragile (-20% Structure Pool)', bp: -1 }
    ],
    skills: [],
    attacks: [
      { name: 'Micro Pulse Dart / Laser', damage: '2d10+1', range: '25m', notes: 'Mag-Lev Hover (Tiny Frame)' }
    ],
    protocols: ['Telemetry Relay', 'Aerial Overwatch', 'Target Painting']
  },
  {
    id: 'servo_walker',
    name: 'The Servo-Walker (Synthetic)',
    category: 'synthetic',
    archetypeDesc: 'Boston Dynamics Quadruped, Tactical Spider-Bot',
    bpCost: 15,
    size: 'Small',
    speed: 12,
    armorDr: 3,
    baseHealth: 0,
    baseVitality: 0,
    baseStructure: 35,
    attributes: { strength: 0, agility: 0, stamina: 1, intellect: 0, wisdom: 0, charisma: -3 },
    features: [
      { name: 'All-Terrain (Magnetic Climber & Rough Ground Walker)', bp: 2 },
      { name: 'Synthetic Traits (Immune: Poison, Pain, Fatigue, Mind)', bp: 6 },
      { name: 'Small Size (+Stealth / AC)', bp: 2 },
      { name: 'Secure Cargo / Tool Storage Compartment (10kg)', bp: 1 }
    ],
    skills: [],
    attacks: [
      { name: 'Pneumatic Ram / Stun Prong', damage: '2d10+2', range: 'Melee', notes: 'All-Terrain Magnetic Walker' }
    ],
    protocols: ['Field Supply Carrier', 'Perimeter Scan', 'Hostile Pin-Down']
  },
  {
    id: 'wisp',
    name: 'The Wisp (Metaphysical / Spirit)',
    category: 'metaphysical',
    archetypeDesc: 'Ghostly Familiar, Void Wisp, Spirit Guide',
    bpCost: 15,
    size: 'Tiny',
    speed: 15,
    armorDr: 0,
    baseHealth: 20,
    baseVitality: 0,
    baseStructure: 0,
    attributes: { strength: -3, agility: 0, stamina: 0, intellect: 0, wisdom: 1, charisma: 0 },
    features: [
      { name: 'Flight (Ethereal Hover)', bp: 2 },
      { name: 'Incorporeal (Phasing: 50% DR vs non-magical weapons)', bp: 6 },
      { name: 'Glow / Spectral Illumination (10m radius)', bp: 1 },
      { name: 'Telepathy (Bonded Master Voice)', bp: 2 },
      { name: 'Invisibility (At Will)', bp: 2 }
    ],
    disadvantages: [
      { name: 'Cannot manipulate physical objects', bp: -2 }
    ],
    skills: [],
    attacks: [
      { name: 'Spectral Chill / Mind Touch', damage: '2d10 (Energy)', range: '10m', notes: 'Ignores physical armor DR' }
    ],
    protocols: ['Ethereal Scouting', 'Invisible Guiding', 'Spectral Distraction']
  }
];

export const FUNCTION_PACKAGES = [
  {
    id: 'striker',
    name: 'The Striker (Combat Focus)',
    desc: 'Designed to hunt, aggressively engage, and inflict maximum damage.',
    bpCost: 25,
    attributesBonus: { strength: 2, agility: 0, stamina: 1, intellect: 0, wisdom: 0, charisma: 0 },
    attributeBp: 12,
    skills: [
      { name: 'Combat (Unarmed / Natural Weapons)', rank: 5, bp: 4 },
      { name: 'Athletics (Chase / Climb)', rank: 5, bp: 4 },
      { name: 'Intimidate', rank: 5, bp: 4 },
      { name: 'Survival', rank: 1, bp: 1 }
    ],
    features: [],
    primaryDirective: 'Engage priority hostiles on sight; lock down evasion vectors.'
  },
  {
    id: 'guardian',
    name: 'The Guardian (Defense Focus)',
    desc: 'Engineered to interpose, absorb impacts, and protect the operative at all costs.',
    bpCost: 25,
    attributesBonus: { strength: 1, agility: 0, stamina: 2, intellect: 0, wisdom: 0, charisma: 0 },
    attributeBp: 12,
    skills: [
      { name: 'Combat (Grapple / Restrain)', rank: 5, bp: 4 },
      { name: 'Alertness (Spot Danger)', rank: 5, bp: 4 },
      { name: 'Intimidate', rank: 1, bp: 1 }
    ],
    features: [
      { name: 'Loyal Protector (Take hit for adjacent master as Reaction)', bp: 2 },
      { name: 'Armor Proficiency (Can equip tactical barding / armor plates)', bp: 2 }
    ],
    primaryDirective: 'Shield operator from direct ballistic and melee strikes; body-block foes.'
  },
  {
    id: 'scout',
    name: 'The Scout (Recon Focus)',
    desc: 'Engineered for stealth, acute sensory telemetry, and unseen forward scouting.',
    bpCost: 25,
    attributesBonus: { strength: 0, agility: 2, stamina: 0, intellect: 0, wisdom: 1, charisma: 0 },
    attributeBp: 12,
    skills: [
      { name: 'Stealth', rank: 5, bp: 4 },
      { name: 'Alertness', rank: 5, bp: 4 },
      { name: 'Survival (Tracking)', rank: 5, bp: 4 },
      { name: 'Search', rank: 1, bp: 1 }
    ],
    features: [],
    primaryDirective: 'Maintain forward reconnaissance; report enemy movement via telepathic / data tether.'
  },
  {
    id: 'interface',
    name: 'The Interface (Tech / Utility Focus)',
    desc: 'Equipped with electronic datalinks, automated slicer code, and tool armatures.',
    bpCost: 25,
    attributesBonus: { strength: 0, agility: 1, stamina: 0, intellect: 2, wisdom: 0, charisma: 0 },
    attributeBp: 12,
    skills: [
      { name: 'Technology (Computers / Security Slicing)', rank: 5, bp: 4 },
      { name: 'Mechanics (Field Repair & Rigging)', rank: 5, bp: 4 },
      { name: 'Search', rank: 5, bp: 4 },
      { name: 'Pilot', rank: 1, bp: 1 }
    ],
    features: [],
    primaryDirective: 'Hack terminals, breach automated blast doors, and maintain field repairs.'
  },
  {
    id: 'mount',
    name: 'The Mount (Transport Focus)',
    desc: 'Bred or fabricated to carry the operative swiftly across all terrain types.',
    bpCost: 25,
    attributesBonus: { strength: 2, agility: 0, stamina: 1, intellect: 0, wisdom: 0, charisma: 0 },
    attributeBp: 12,
    skills: [
      { name: 'Athletics (Sprint & Leap)', rank: 5, bp: 4 },
      { name: 'Acrobatics (Balance & Stability)', rank: 5, bp: 4 },
      { name: 'Survival', rank: 1, bp: 1 }
    ],
    features: [
      { name: 'Sure-Footed (Ignore difficult terrain penalties)', bp: 2 },
      { name: 'Endurance (Advantage on forced march and fatigue saves)', bp: 2 }
    ],
    primaryDirective: 'Transport operator across hazards; maintain rapid ingress and egress vectors.'
  }
];

export const COMMAND_ECONOMY_MODES = [
  {
    id: 'direct',
    label: 'Direct Command',
    actionCost: 'Move Action',
    desc: 'Operator issues verbal/gestural orders ("Attack", "Guard", "Fetch"). Unit acts immediately.'
  },
  {
    id: 'linked',
    label: 'Linked Command (Data-Tether / Mind Link)',
    actionCost: 'Free Action',
    desc: 'Commands are transmitted instantaneously via telepathic bond or neural data-tether.'
  },
  {
    id: 'autonomous',
    label: 'Autonomous Protocol',
    actionCost: 'No Action',
    desc: 'Unit executes default instinct/protocol (Defend Master, Overwatch, Return to Base).'
  }
];
