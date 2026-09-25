// ═══════════════════════════════════════════════════════════
// MECHA & VEHICLES MATRIX CONSTANTS (PLAN 21)
// ═══════════════════════════════════════════════════════════

export const MECHA_OPERATIONAL_DOMAINS = [
  'Personal Mobility',
  'Civilian',
  'Utility & Industrial',
  'Military Ground',
  'Aircraft & Atmospheric',
  'Spacecraft & Interstellar',
  'Watercraft & Submersible',
  'Power Armor & Walkers'
];

// ═══════════════════════════════════════════════════════════
// UNIVERSAL CANONICAL SCALING SYSTEM (01.01.09 & 99. SCALING)
// ═══════════════════════════════════════════════════════════

export const DIE_STEP_LADDER = ['d10', 'd8', 'd6', 'd4', 'd3', 'd2', '1'];

export const SIZE_CATEGORIES = {
  Miniscule: {
    id: 'Miniscule',
    name: 'Miniscule',
    scaleDisplay: '-5ds (1/12)',
    scaleMultiplier: 1 / 12,
    dieStep: -5,
    strMod: -32,
    combatMod: 32,
    defMod: 32,
    stealthMod: 20,
    height: '< 1in',
    weight: '< 1 oz',
    reach: '1in',
    isStarship: false,
    example: 'Micro-Drone, Insectoid Larva'
  },
  Fine: {
    id: 'Fine',
    name: 'Fine',
    scaleDisplay: '-4ds (1/6)',
    scaleMultiplier: 1 / 6,
    dieStep: -4,
    strMod: -16,
    combatMod: 16,
    defMod: 16,
    stealthMod: 16,
    height: '< 6in',
    weight: '< 1/8 lb',
    reach: '6in',
    isStarship: false,
    example: 'Spy Bot, Sparrow, Tiny Rodent'
  },
  Diminutive: {
    id: 'Diminutive',
    name: 'Diminutive',
    scaleDisplay: '-3ds (1/3)',
    scaleMultiplier: 1 / 3,
    dieStep: -3,
    strMod: -8,
    combatMod: 8,
    defMod: 8,
    stealthMod: 12,
    height: '< 1ft',
    weight: '< 1 lb',
    reach: '1ft',
    isStarship: false,
    example: 'Hoverboard, Rat, Hawk'
  },
  Tiny: {
    id: 'Tiny',
    name: 'Tiny',
    scaleDisplay: '-2ds (1/2)',
    scaleMultiplier: 0.5,
    dieStep: -2,
    strMod: -4,
    combatMod: 4,
    defMod: 4,
    stealthMod: 8,
    height: '< 2ft',
    weight: '< 8 lbs',
    reach: '2ft',
    isStarship: false,
    example: 'House Cat, Drone, Courier Bot'
  },
  Small: {
    id: 'Small',
    name: 'Small',
    scaleDisplay: '-1ds (2/3)',
    scaleMultiplier: 2 / 3,
    dieStep: -1,
    strMod: -2,
    combatMod: 2,
    defMod: 2,
    stealthMod: 4,
    height: '< 4ft',
    weight: '< 60 lbs',
    reach: '3ft',
    isStarship: false,
    example: 'Chimpanzee, Lynx, ATV, Quad'
  },
  Medium: {
    id: 'Medium',
    name: 'Medium',
    scaleDisplay: 'Base (x1)',
    scaleMultiplier: 1.0,
    dieStep: 0,
    strMod: 0,
    combatMod: 0,
    defMod: 0,
    stealthMod: 0,
    height: '< 8ft',
    weight: '< 500 lbs',
    reach: '5ft',
    isStarship: false,
    example: 'Humanoid, Cycle, Power Armor'
  },
  Large: {
    id: 'Large',
    name: 'Large',
    scaleDisplay: 'x2',
    scaleMultiplier: 2.0,
    dieStep: 0,
    strMod: 2,
    combatMod: -2,
    defMod: -2,
    stealthMod: -4,
    height: '< 16ft',
    weight: '< 2 tons',
    reach: '10ft',
    isStarship: false,
    example: 'Horse, Automobile, Light Walker'
  },
  Huge: {
    id: 'Huge',
    name: 'Huge',
    scaleDisplay: 'x5',
    scaleMultiplier: 5.0,
    dieStep: 0,
    strMod: 4,
    combatMod: -4,
    defMod: -4,
    stealthMod: -8,
    height: '< 32ft',
    weight: '< 16 tons',
    reach: '15ft',
    isStarship: false,
    example: 'Elephant, Main Battle Tank, Dropship'
  },
  Gargantuan: {
    id: 'Gargantuan',
    name: 'Gargantuan',
    scaleDisplay: 'x10',
    scaleMultiplier: 10.0,
    dieStep: 0,
    strMod: 8,
    combatMod: -8,
    defMod: -8,
    stealthMod: -16,
    height: '< 64ft',
    weight: '< 125 tons',
    reach: '20ft',
    isStarship: false,
    example: 'Corvette, Assault Gunboat, Titan Walker'
  },
  Colossal: {
    id: 'Colossal',
    name: 'Colossal',
    scaleDisplay: 'x20',
    scaleMultiplier: 20.0,
    dieStep: 0,
    strMod: 16,
    combatMod: -16,
    defMod: -16,
    stealthMod: -32,
    height: '< 128ft',
    weight: '< 1K tons',
    reach: '25ft',
    isStarship: false,
    example: 'Frigate, Heavy Destroyer, Mega-Carrier'
  },
  Enormous: {
    id: 'Enormous',
    name: 'Enormous',
    scaleDisplay: 'x40',
    scaleMultiplier: 40.0,
    dieStep: 0,
    strMod: 32,
    combatMod: -32,
    defMod: -32,
    stealthMod: 'NO',
    height: '< 512ft',
    weight: '< 16K tons',
    reach: '-',
    isStarship: true,
    example: 'Capital Battlecruiser'
  },
  Titanic: {
    id: 'Titanic',
    name: 'Titanic',
    scaleDisplay: 'x80',
    scaleMultiplier: 80.0,
    dieStep: 0,
    strMod: 64,
    combatMod: -64,
    defMod: -64,
    stealthMod: 'NO',
    height: '< 1,024ft',
    weight: '< 144K tons',
    reach: '-',
    isStarship: true,
    example: 'Colony Ship, Planetary Dreadnought'
  },
  SuperGargantuan: {
    id: 'SuperGargantuan',
    name: 'Super Gargantuan',
    scaleDisplay: 'x160',
    scaleMultiplier: 160.0,
    dieStep: 0,
    strMod: 128,
    combatMod: -128,
    defMod: -128,
    stealthMod: 'NO',
    height: '< 5,280ft',
    weight: '< 50M ton',
    reach: '-',
    isStarship: true,
    example: 'System Dreadnought, Star Fort'
  },
  MegaColossal: {
    id: 'MegaColossal',
    name: 'Mega Colossal',
    scaleDisplay: 'x320',
    scaleMultiplier: 320.0,
    dieStep: 0,
    strMod: 256,
    combatMod: -256,
    defMod: -256,
    stealthMod: 'NO',
    height: '1 Mile',
    weight: '50M ton+',
    reach: '-',
    isStarship: true,
    example: 'Dyson Swarm Node, Megastructure Ship'
  }
};

export const SIZE_CATEGORIES_LIST = Object.values(SIZE_CATEGORIES);

export const MECHA_SIZES = {
  Miniscule: { id: 'Miniscule', name: 'Miniscule', scale: '-5ds (1/12)', scaleMult: 0.083, strCbtMod: -32, defMod: 32, stealth: 20, structure: 5, mounts: 0.5, baseDC: 10, example: 'Micro-Drone' },
  Fine: { id: 'Fine', name: 'Fine', scale: '-4ds (1/6)', scaleMult: 0.167, strCbtMod: -16, defMod: 16, stealth: 16, structure: 10, mounts: 1, baseDC: 12, example: 'Spy Bot' },
  Diminutive: { id: 'Diminutive', name: 'Diminutive', scale: '-3ds (1/3)', scaleMult: 0.333, strCbtMod: -8, defMod: 8, stealth: 12, structure: 20, mounts: 2, baseDC: 15, example: 'Hoverboard, Commuter Board' },
  Tiny: { id: 'Tiny', name: 'Tiny', scale: '-2ds (1/2)', scaleMult: 0.5, strCbtMod: -4, defMod: 4, stealth: 8, structure: 30, mounts: 3, baseDC: 18, example: 'Moto-Drone, Heavy Courier Bot' },
  Small: { id: 'Small', name: 'Small', scale: '-1ds (2/3)', scaleMult: 0.667, strCbtMod: -2, defMod: 2, stealth: 4, structure: 40, mounts: 4, baseDC: 20, example: 'ATV, Escape Pod, Quad' },
  Medium: { id: 'Medium', name: 'Medium', scale: 'Base (x1)', scaleMult: 1.0, strCbtMod: 0, defMod: 0, stealth: 0, structure: 50, mounts: 5, baseDC: 22, example: 'Cycle, Power Armor Suit' },
  Large: { id: 'Large', name: 'Large', scale: 'x2', scaleMult: 2.0, strCbtMod: 2, defMod: -2, stealth: -4, structure: 100, mounts: 10, baseDC: 25, example: 'Automobile, Light Walker, Speedboat' },
  Huge: { id: 'Huge', name: 'Huge', scale: 'x5', scaleMult: 5.0, strCbtMod: 4, defMod: -4, stealth: -8, structure: 250, mounts: 25, baseDC: 30, example: 'Main Battle Tank, Dropship, Heavy Walker' },
  Gargantuan: { id: 'Gargantuan', name: 'Gargantuan', scale: 'x10', scaleMult: 10.0, strCbtMod: 8, defMod: -8, stealth: -16, structure: 500, mounts: 50, baseDC: 35, example: 'Corvette, Assault Gunboat, Titan Walker' },
  Colossal: { id: 'Colossal', name: 'Colossal', scale: 'x20', scaleMult: 20.0, strCbtMod: 16, defMod: -16, stealth: -32, structure: 1000, mounts: 100, baseDC: 40, example: 'Frigate, Heavy Destroyer, Mega-Carrier' },
  Enormous: { id: 'Enormous', name: 'Enormous', scale: 'x40', scaleMult: 40.0, strCbtMod: 32, defMod: -32, stealth: 0, structure: 2500, mounts: 200, baseDC: 45, example: 'Capital Battlecruiser' },
  Titanic: { id: 'Titanic', name: 'Titanic', scale: 'x80', scaleMult: 80.0, strCbtMod: 64, defMod: -64, stealth: 0, structure: 5000, mounts: 400, baseDC: 50, example: 'Colony Ship, Planetary Dreadnought' },
  SuperGargantuan: { id: 'SuperGargantuan', name: 'Super Gargantuan', scale: 'x160', scaleMult: 160.0, strCbtMod: 0, defMod: 0, stealth: 0, structure: 10000, mounts: 800, baseDC: 60, example: 'System Dreadnought, Star Fort' },
  MegaColossal: { id: 'MegaColossal', name: 'Mega Colossal', scale: 'x320', scaleMult: 320.0, strCbtMod: 0, defMod: 0, stealth: 0, structure: 20000, mounts: 1600, baseDC: 80, example: 'Dyson Swarm Node, Megastructure Ship' }
};

export const MECHA_FRAMES = {
  Creature: { id: 'Creature', name: 'Creature / Biomimetic', handlingMod: 2, complexityDC: 5, description: 'Minibots, drones, robotic beasts, predatory biomimetics (+2 Handling, +5 DC)' },
  Humanoid: { id: 'Humanoid', name: 'Humanoid Bipedal', handlingMod: 0, complexityDC: 8, description: 'Remote bodies, power armors, bipedal combat mechas (+0 Handling, +8 DC)' },
  Industrial: { id: 'Industrial', name: 'Industrial / Utility', handlingMod: -2, complexityDC: -2, description: 'Construction bots, cargo haulers, mining chassis (-2 Handling, -2 DC discount)' },
  Personal: { id: 'Personal', name: 'Personal Transport', handlingMod: 0, complexityDC: 0, description: 'Hoverboards, motorcycles, commuter cars (+0 Handling, +0 DC)' },
  Platform: { id: 'Platform', name: 'Heavy Platform / Hull', handlingMod: -4, complexityDC: 2, description: 'Tanks, buses, heavy barges, space stations (-4 Handling, +2 DC)' },
  Racing: { id: 'Racing', name: 'Racing / Interceptor', handlingMod: 4, complexityDC: 5, description: 'High-speed interceptors, racers, agile scout crafts (+4 Handling, +5 DC)' },
  Walker: { id: 'Walker', name: 'Heavy Walker / Spider', handlingMod: -2, complexityDC: 5, description: 'Heavy quadruped/hexapod walkers, spider tanks (-2 Handling, +5 DC)' },
  Winged: { id: 'Winged', name: 'Winged Aerodyne', handlingMod: 2, complexityDC: 2, description: 'Fighters, atmospheric shuttles, ornithopters (+2 Handling, +2 DC)' }
};

export const MECHA_PROPULSION = [
  { id: 'wheels', name: 'Standard Wheels / Treads', category: 'Ground', tl: 2, dcMod: 0, mounts: 0, speed: '40 ft/rnd', notes: 'Reliable, cheap; -2 to Agility checks' },
  { id: 'suspension', name: 'Independent Suspension', category: 'Ground', tl: 2, dcMod: 5, mounts: 1, speed: '40 ft/rnd', notes: 'Ignores light terrain penalties' },
  { id: 'omni_wheels', name: 'Omni-Wheels / Spheres', category: 'Ground', tl: 4, dcMod: 10, mounts: 1, speed: '40 ft/rnd', notes: 'Allows lateral strafing movement' },
  { id: 'biped_hydro', name: 'Bipedal Hydraulics', category: 'Walker', tl: 2, dcMod: 5, mounts: 1, speed: '20 ft/rnd', notes: 'Slow, stable industrial walker' },
  { id: 'biped_myomer', name: 'Bipedal Myomer Musculature', category: 'Walker', tl: 3, dcMod: 10, mounts: 1, speed: '30 ft/rnd', notes: 'Human-like movement, agile combat baseline' },
  { id: 'quad_walker', name: 'Quadruped / Hexapedal', category: 'Walker', tl: 3, dcMod: 12, mounts: 2, speed: '40 ft/rnd', notes: '+4 Stability, increased cargo load' },
  { id: 'reverse_joint', name: 'Reverse-Joint High Agility', category: 'Walker', tl: 4, dcMod: 15, mounts: 2, speed: '40 ft/rnd', notes: '+10ft Speed, +2 Jump checks' },
  { id: 'rotor_lift', name: 'Rotor / Propeller Lift', category: 'Flight', tl: 2, dcMod: 5, mounts: 1, speed: '60 ft/rnd', notes: 'Atmospheric rotor flight' },
  { id: 'vectored_thrust', name: 'Vectored Jet Thruster', category: 'Flight', tl: 3, dcMod: 10, mounts: 2, speed: '90 ft/rnd', notes: 'High speed atmospheric jet' },
  { id: 'repulsorlift', name: 'Anti-Gravity / Repulsorlift', category: 'Flight', tl: 4, dcMod: 20, mounts: 2, speed: '80 ft/rnd', notes: 'Silent hover, ignores all terrain' },
  { id: 'gravitonic', name: 'Gravitonic Orbital Flight', category: 'Flight', tl: 5, dcMod: 30, mounts: 3, speed: '200+ ft/rnd', notes: 'Space-capable, inertial dampening' },
  { id: 'aquatic_prop', name: 'Ballast & Marine Propeller', category: 'Aquatic', tl: 2, dcMod: 5, mounts: 1, speed: '30 ft/rnd', notes: 'Standard sub-surface movement' },
  { id: 'hydro_jet', name: 'Hydro-Jet Supercavitation', category: 'Aquatic', tl: 3, dcMod: 10, mounts: 2, speed: '60 ft/rnd', notes: 'High speed underwater propulsion' }
];

export const MECHA_ARMOR_TYPES = [
  { id: 'steel_plate', name: 'Industrial Steel Plate', category: 'Physical', tl: 2, dcMod: 2, baseMountMult: 1, dr: 5, effect: 'DR 5' },
  { id: 'ceramic_comp', name: 'Ceramic Composite Plating', category: 'Physical', tl: 3, dcMod: 8, baseMountMult: 2, dr: 10, effect: 'DR 10' },
  { id: 'reactive_armor', name: 'Reactive Explosive Armor', category: 'Physical', tl: 3, dcMod: 10, baseMountMult: 1, dr: 15, effect: 'DR 15 (Ablative vs Kinetic)' },
  { id: 'nanocarbon_weave', name: 'Nanocarbon Weave Armor', category: 'Physical', tl: 4, dcMod: 15, baseMountMult: 1, dr: 15, effect: 'DR 15 (Lightweight)' },
  { id: 'adamantine_plate', name: 'Adamantine / Neutronium Plate', category: 'Physical', tl: 5, dcMod: 25, baseMountMult: 4, dr: 30, effect: 'DR 30 (Superheavy)' },
  { id: 'deflector_screen', name: 'Deflector Screen (Ray Shield)', category: 'Shield', tl: 3, dcMod: 12, baseMountMult: 2, dr: 10, effect: 'DR 10 vs Energy only' },
  { id: 'kinetic_barrier', name: 'Kinetic Barrier Shield', category: 'Shield', tl: 4, dcMod: 15, baseMountMult: 2, dr: 10, effect: 'DR 10 vs Physical only' },
  { id: 'omnishield', name: 'Omnishield Generator', category: 'Shield', tl: 4, dcMod: 20, baseMountMult: 3, dr: 15, effect: 'DR 15 vs All damage types' },
  { id: 'hardlight_hex', name: 'Hard-Light Hex Shield', category: 'Shield', tl: 5, dcMod: 25, baseMountMult: 3, dr: 20, effect: 'DR 20 + Regenerates each turn' },
  { id: 'stealth_coat', name: 'Radar-Absorbent Stealth Coating', category: 'Specialty', tl: 3, dcMod: 10, baseMountMult: 0, dr: 0, effect: '+4 Stealth vs radar/sensors' },
  { id: 'thermal_dispersion', name: 'Thermal Dispersion Coating', category: 'Specialty', tl: 3, dcMod: 8, baseMountMult: 0, dr: 0, effect: '+4 Stealth vs IR/thermal scans' },
  { id: 'psionic_ward', name: 'Psionic Ward Lattice', category: 'Specialty', tl: 4, dcMod: 18, baseMountMult: 1, dr: 10, effect: 'DR 10 vs Psionic and Magic attacks' }
];

export const MECHA_MODULES = [
  { id: 'cockpit_std', name: 'Cockpit (Standard Manual)', category: 'Tactical', tl: 2, dcMod: 0, mounts: 2, function: 'Standard manual cockpit controls' },
  { id: 'cockpit_neural', name: 'Cockpit (Neural Link)', category: 'Tactical', tl: 4, dcMod: 15, mounts: 2, function: '+2 Initiative/Reflex direct mind link' },
  { id: 'life_support', name: 'Life Support (Hermetic)', category: 'Tactical', tl: 3, dcMod: 5, mounts: 1, function: 'Sealed vs vacuum and toxic atmospheres' },
  { id: 'ejection_system', name: 'Emergency Ejection Pod', category: 'Tactical', tl: 3, dcMod: 5, mounts: 1, function: 'Ejects pilot safely upon chassis destruction' },
  { id: 'targeting_basic', name: 'Targeting Computer (Basic)', category: 'Tactical', tl: 3, dcMod: 5, mounts: 1, function: '+1 to all Ranged Attack rolls' },
  { id: 'targeting_ai', name: 'Targeting Computer (AI Auto)', category: 'Tactical', tl: 4, dcMod: 15, mounts: 1, function: '+2 Attack, auto-tracking; reduces crew needs' },
  { id: 'sensor_radar', name: 'Sensor Suite (Radar/Lidar)', category: 'Tactical', tl: 3, dcMod: 5, mounts: 1, function: '5-mile scanning range, detects motion/metal' },
  { id: 'sensor_omni', name: 'Sensor Suite (Omni-Scan)', category: 'Tactical', tl: 4, dcMod: 15, mounts: 2, function: 'Orbital range: Life, Energy, Structural scans' },
  { id: 'ecm_jammer', name: 'ECM Jammer & Countermeasures', category: 'Tactical', tl: 3, dcMod: 8, mounts: 2, function: 'Scrambles enemy comms and missile locks' },
  { id: 'cargo_bay', name: 'Expandable Cargo Bay', category: 'Utility', tl: 2, dcMod: 0, mounts: 2, function: 'Converts Mounts to 200kg heavy cargo capacity' },
  { id: 'repair_drones', name: 'Auto-Repair Drones', category: 'Utility', tl: 4, dcMod: 18, mounts: 2, function: 'Restores 1d10 Structure Points per minute' },
  { id: 'nanoforge', name: 'Field Nano-Forge Fabricator', category: 'Utility', tl: 5, dcMod: 30, mounts: 4, function: 'Synthesizes ammunition and replacement parts' }
];

export const MECHA_COMPONENTS = [
  { id: 'combustion', name: 'Internal Combustion Engine', tl: 2, dcMod: 2, notes: 'Requires hydrocarbon fuel, loud signature' },
  { id: 'batteries', name: 'High-Capacity Solid-State Batteries', tl: 3, dcMod: 5, notes: 'Silent operation, rechargeable grid power' },
  { id: 'micro_fusion', name: 'Micro-Fusion Reactor Core', tl: 3, dcMod: 12, notes: 'Years of continuous output, volatile upon breach' },
  { id: 'antimatter_core', name: 'Antimatter Containment Core', tl: 4, dcMod: 20, notes: 'Immense power density, catastrophic breach risk' },
  { id: 'zpe_node', name: 'Zero-Point Energy (ZPE) Tap', tl: 5, dcMod: 25, notes: 'Infinite power, zero heat or acoustic signature' },
  { id: 'hydraulic_servos', name: 'Heavy Hydraulic Servos', tl: 2, dcMod: 0, notes: '+2 Strength checks for lifting/pushing' },
  { id: 'myomer_musculature', name: 'Synthetic Myomer Musculature', tl: 3, dcMod: 8, notes: '+4 Strength checks, silent fluid motion' },
  { id: 'gyro_stabilizers', name: 'Gyroscopic Active Stabilizers', tl: 3, dcMod: 5, notes: 'Advantage on stability and recoil control' }
];

export const VFT_MODES = {
  None: { id: 'None', name: 'Fixed Chassis', actionCost: 'N/A', dcMod: 0 },
  TL3_HardShift: { id: 'TL3_HardShift', name: 'TL3 Mechanical Articulation (Hard Shift)', actionCost: 'Full Round Action', dcMod: 10, notes: 'Mechanical rails and hydraulic locks; vulnerable during transition' },
  TL4_FluidShift: { id: 'TL4_FluidShift', name: 'TL4 Programmable Matter (Fluid Shift)', actionCost: 'Movement Action', dcMod: 20, notes: 'Smart-matter restructuring mid-maneuver' },
  TL5_StateShift: { id: 'TL5_StateShift', name: 'TL5 Polymatter & Hard-Light (State Shift)', actionCost: 'Swift Action', dcMod: 30, notes: 'Sub-atomic instant reconfiguration or hard-light projection' }
};


// ═══════════════════════════════════════════════════════════
// MOVEMENT MODES, PACES & FATIGUE SYSTEM
// ═══════════════════════════════════════════════════════════

export const MOVEMENT_MODES_AND_PACES = {
  ground: {
    id: 'ground',
    name: 'Ground Movement',
    mediumBaseSpeed: 30, // ft per 6s round (3.72 mph / 6 kph)
    description: 'Terrestrial walking and running pace baseline.',
    paces: {
      walk: { id: 'walk', name: 'Walk', multiplier: 1.0, speedFt: 30, actionPenalty: 0, checkDC: null, checkSkill: null, stealthBonus: 0, description: 'Default baseline pace' },
      jog: { id: 'jog', name: 'Jog', multiplier: 2.0, speedFt: 60, actionPenalty: -2, checkDC: null, checkSkill: null, stealthBonus: 0, description: 'Hurried pace with subtlety penalty' },
      running: { id: 'running', name: 'Running', multiplier: 4.0, featureMultiplier: 5.0, speedFt: 120, actionPenalty: -4, checkDC: 10, checkSkill: 'Athletics', stealthBonus: 0, description: 'Fast pace requiring Athletics checks' },
      sprinting: { id: 'sprinting', name: 'Sprinting', multiplier: 6.0, featureMultiplier: 7.0, speedFt: 180, actionPenalty: -8, checkDC: 15, checkSkill: 'Athletics', stealthBonus: 0, description: 'Maximum sprint speed requiring Athletics DC 15+' },
      crawl: { id: 'crawl', name: 'Crawl', multiplier: 0.5, speedFt: 15, actionPenalty: 0, checkDC: null, checkSkill: null, stealthBonus: 2, condition: 'Prone', description: 'Low profile crawling with +2 stealth' },
      slow_crawl: { id: 'slow_crawl', name: 'Slow Crawl', multiplier: 0.25, speedFt: 7.5, actionPenalty: 0, checkDC: null, checkSkill: null, stealthBonus: 4, condition: 'Prone', description: 'Very slow crawl with +4 stealth' }
    }
  },
  flying: {
    id: 'flying',
    name: 'Flying Movement',
    mediumBaseSpeed: 60, // 2x walking speed
    description: '3D aerial locomotion with flight maneuvers.',
    paces: {
      flight: { id: 'flight', name: 'Flight', multiplier: 1.0, speedFt: 60, actionPenalty: 0, checkDC: null, checkSkill: null, description: 'Standard flying speed (double walking speed)' },
      sail: { id: 'sail', name: 'Sail', multiplier: 2.0, speedFt: 120, actionPenalty: -2, checkDC: null, checkSkill: null, description: 'Hurried cruising speed' },
      surge: { id: 'surge', name: 'Surge / Soar', multiplier: 4.0, featureMultiplier: 5.0, speedFt: 240, actionPenalty: -4, checkDC: 10, checkSkill: 'Acrobatics', description: 'Rapid chase speed requiring Acrobatics DC 10+' },
      diving: { id: 'diving', name: 'Diving', multiplier: 2.0, featureMultiplier: 9.0, speedFt: 480, actionPenalty: -4, checkDC: 15, checkSkill: 'Acrobatics', description: 'High-speed descent maneuver' },
      gliding: { id: 'gliding', name: 'Gliding', multiplier: 1.0, speedFt: 60, actionPenalty: 2, checkDC: 10, checkSkill: 'Acrobatics', dropRate: '1ft fall per 5ft horiz', description: 'Controlled descent (+2 to actions)' },
      hover: { id: 'hover', name: 'Hover / Controlled Descent', multiplier: 0.5, speedFt: 30, actionPenalty: 0, checkDC: 15, checkSkill: 'Acrobatics', description: 'Slow or stationary flight for observation' }
    }
  },
  swimming: {
    id: 'swimming',
    name: 'Swimming Movement',
    mediumBaseSpeed: 15, // 1/2 walking speed (1.83 mph / 3 kph)
    description: 'Aquatic propulsion through liquid.',
    paces: {
      swimming: { id: 'swimming', name: 'Swimming', multiplier: 1.0, featureMultiplier: 2.0, speedFt: 15, actionPenalty: 0, checkDC: null, checkSkill: null, description: 'Standard swim speed' },
      glide: { id: 'glide', name: 'Glide', multiplier: 2.0, featureMultiplier: 4.0, speedFt: 30, actionPenalty: -2, checkDC: 10, checkSkill: 'Athletics (Swimming)', description: 'Hurried swim pace' },
      stroke: { id: 'stroke', name: 'Stroke', multiplier: 4.0, featureMultiplier: 6.0, speedFt: 60, actionPenalty: -4, checkDC: 15, checkSkill: 'Athletics (Swimming)', description: 'Fast power stroke swim pace' },
      treading: { id: 'treading', name: 'Treading', multiplier: 0.5, speedFt: 7.5, actionPenalty: 2, checkDC: 5, checkSkill: 'Athletics (Swimming)', description: 'Surface treading (+2 bonus to actions)' }
    }
  },
  climbing: {
    id: 'climbing',
    name: 'Climbing Movement',
    mediumBaseSpeed: 15,
    description: 'Vertical scaling across terrain.',
    paces: {
      easy: { id: 'easy', name: 'Easy Climb (DC 10+)', multiplier: 0.5, speedFt: 15, checkDC: 10, checkSkill: 'Athletics (Climbing)', description: 'Half walking speed' },
      moderate: { id: 'moderate', name: 'Moderate Climb (DC 15+)', multiplier: 0.25, speedFt: 7.5, checkDC: 15, checkSkill: 'Athletics (Climbing)', description: 'Quarter walking speed' },
      difficult: { id: 'difficult', name: 'Difficult Climb (DC 20+)', multiplier: 0.1, speedFt: 3, checkDC: 20, checkSkill: 'Athletics (Climbing)', description: 'Tenth walking speed' },
      scaling: { id: 'scaling', name: 'Scaling', multiplier: 1.0, featureMultiplier: 2.0, speedFt: 30, actionPenalty: -2, checkDC: null, checkSkill: 'Athletics (Climbing)', checkPenalty: -5, description: 'Ascending at full base speed (-5 check penalty)' },
      fast_ascent: { id: 'fast_ascent', name: 'Fast Ascent', multiplier: 2.0, featureMultiplier: 3.0, speedFt: 60, actionPenalty: -4, checkDC: null, checkSkill: 'Athletics (Climbing)', checkPenalty: -10, description: 'Ascending at double speed (-10 check penalty)' },
      fast_descent: { id: 'fast_descent', name: 'Fast Descent', multiplier: 4.0, featureMultiplier: 6.0, speedFt: 120, actionPenalty: -4, checkDC: 20, checkSkill: 'Athletics (Climbing)', checkPenalty: -10, description: 'Descending at quadruple speed without injury' }
    }
  },
  burrowing: {
    id: 'burrowing',
    name: 'Burrowing Movement',
    mediumBaseSpeed: 7.5, // 1/4 walking speed
    description: 'Subterranean displacement through earth, sand, and rock.',
    paces: {
      burrowing: { id: 'burrowing', name: 'Burrowing', multiplier: 1.0, speedFt: 7.5, actionPenalty: 0, description: 'Standard burrowing pace' },
      tunneling: { id: 'tunneling', name: 'Tunneling', multiplier: 2.0, speedFt: 15, actionPenalty: -2, description: 'Rapid tunnel excavation' },
      excavation: { id: 'excavation', name: 'Excavation', multiplier: 0.5, speedFt: 3.75, actionPenalty: 0, description: 'Creating chambers and reinforced subterranean spaces' }
    }
  }
};

export const MOVEMENT_FATIGUE_SYSTEM = {
  combatSprintRounds: 5,
  hurriedTravelMinutes: 10,
  fortitudeCheckDC: 15,
  vitalityDamageFail: 5,
  vitalityDamagePerMissOf5: 1,
  exhaustionHealthDamage: 2,
  exhaustionDebuff: {
    checkPenalty: -2,
    speedMultiplier: 0.5,
    recoveryCondition: 'Light Rest (Nap)'
  }
};

export const FLYING_COMBAT_RULES = {
  highGroundStrikeBonus: 2,
  highGroundCritBonus: 2,
  flightStages: ['Flight', 'Sail', 'Surge', 'Dive'],
  ramDicePerStage: 1,
  ramImpactDamagePer10Ft: 1
};

// ═══════════════════════════════════════════════════════════
// VITALITY, HEALTH & STRUCTURE (CANONICAL DAMAGE & RESILIENCE RULES)
// ═══════════════════════════════════════════════════════════

export const VITALITY_HEALTH_STRUCTURE_RULES = {
  startingBaseVitality: 30,
  startingBaseHealth: 30,
  startingBaseStructure: 60,
  cpCostPer2Points: 1, // 1 CP = +2 points in Vitality, Health, or Structure
  bpCostPer2Points: 1, // backward compatibility alias
  cpCostPer5Points: 1, // legacy alias
  bpCostPer5Points: 1, // legacy alias
  maxCpIncreaseMultiplier: 5, // Maximum increase is 5 x Stamina score for each pool
  suggestedStartingMax: 60,
  toughnessSource: 'Stamina Ability Score', // Point-for-point natural damage reduction (DR)
  naturalDRRule: 'All character Stamina is a natural damage reduction (DR) and automatically reduces all incoming damage which penetrates the characters defenses, minimum of 1 point.',
  nonStandardPhysiologies: ['Synthetic', 'Mecha', 'Construct', 'Elemental', 'Golem', 'Ooze', 'Undead'],
  maxSkillRank: 20,
  maxSpecializationRank: 10,
  maxInvocationRank: 10,
  descriptions: {
    systemRule: "In Tangent, a character's ability to endure and recover from damage is represented by Vitality and Health (or Structure for Synthetics and others with non-typical physiology). Tangent does NOT use HP.",
    staminaScore: "All character Stamina is a natural damage reduction (DR) and automatically reduces all incoming damage which penetrates the character's defenses, minimum of 1 point.",
    startingValuesAndMax: "Characters begin with a base of 30 points in both Vitality and Health (or 60 Structure for Synthetics). Base Vitality is not modified by Willpower, and base Health is not modified by Fortitude. Pools may be increased by spending Character Points (CP) at a rate of 2 points per 1 CP (1 CP = +2 points), with a maximum increase of 5 × Stamina score. Structure has a starting pool of 60 to start, also charging 1 CP per 2 pt increase.",
    concussiveDamage: "Concussive Damage is unique in that it is Heavily Traumatic but dispersed over the entire body. This damage can be divided equally between Vitality and Health if the character attempts to reduce the damage, regardless of whether the attempt is successful. This reflects the potential for both non-lethal and lethal injuries from falls, explosions, crashes, etc. This does not include any additional damage taken for what they may fall into such as spikes, debris, lava, etc.",
    vitality: "Vitality represents stamina, luck, and non-lethal damage capacity. It acts as a buffer, absorbing damage from sources like pummeling, subdual strikes, and physical/mental fatigue. The starting base is 30 (not modified by Willpower), increased by 2 points per 1 CP up to a maximum increase of 5 × Stamina score. There is separate damage tracking for lethal (Health) and non-lethal damage (Vitality); once non-lethal damage exceeds the Vitality score, it is considered lethal and affects Health.",
    health: "Health represents physical trauma, bodily tissue, and structural life force. It is lost directly from lethal attacks or when non-lethal damage overflows depleted Vitality. The starting base is 30 (not modified by Fortitude), increased by 2 points per 1 CP up to a maximum increase of 5 × Stamina score. When a character's Health reaches zero, they are Incapacitated (falling Unconscious immediately, dropping anything held, and falling Prone). If Health is 0 and Vitality is depleted (0), the character enters the Death's Door state.",
    structure: "Synthetics and constructs of most types use Structure, with a starting pool of 60 SP (or the total of both Health and Vitality scores). Structure increases at 1 CP per 2 pt increase. Synthetics are completely immune to non-lethal damage as well as other biological immunities (poisons, diseases, suffocation, mental stress).",
    criticalHits: "Critical hits affect damage (increasing damage dealt via damage multipliers or additional dice), but do not necessarily make an attack lethal if the attack was non-lethal.",
    skillCaps: "Most skills have a maximum rank of 20. Specializations and invocations max at rank 10."
  }
};

// ═══════════════════════════════════════════════════════════
// DEATH & DYING SYSTEM (CANONICAL RULES)
// ═══════════════════════════════════════════════════════════

export const DEATH_AND_DYING_RULES = {
  HEALTH_VS_VITALITY: {
    vitality: "Vitality represents stamina, poise, and non-lethal damage capacity.",
    health: "Health represents physical trauma, organ integrity, and lethal damage capacity.",
    damageRouting: {
      nonlethal: "Non-lethal damage damages Vitality directly. Once non-lethal damage exceeds the Vitality score, it is considered lethal and affects Health.",
      lethal: "Lethal damage damages Health directly. Any excess damage beyond 0 Health is applied to Vitality (if any remains).",
      criticalHits: "Critical hits affect the damage dealt (doubling dice or multiplying damage), but do not necessarily make an attack lethal if non-lethal. Non-lethal attacks remain non-lethal, absorbing through Vitality first and only affecting Health if non-lethal damage exceeds Vitality."
    }
  },
  THRESHOLD_OF_DEATH: {
    zeroHealth: {
      name: "0 Health (Incapacitated)",
      conditions: ['Incapacitated', 'Unconscious', 'Prone'],
      dropItems: true,
      description: "When a character takes damage that reduces them to 0 Health, they fall unconscious immediately, drop anything they are holding, and fall Prone. Any excess damage is applied to Vitality (if any remains)."
    },
    deathsDoor: {
      name: "Death's Door",
      condition: "Comatose",
      statusGem: "Death's Door",
      trigger: "Health is 0 AND Vitality is depleted (0)",
      clockFormula: "Number of rounds equal to Stamina Score (Minimum 1 round)",
      minRounds: 1,
      stabilization: {
        medicineDC: 15,
        healingMagicOrTech: true,
        description: "A successful Medicine (DC 15) check or the application of healing magic/tech stops the clock. The character remains unconscious but is no longer dying."
      },
      death: "If the clock runs out, the character dies permanently.",
      massiveDamage: {
        threshold: "Damage equal to or greater than STA score in a single hit while at Death's Door",
        effect: "Instant permanent death."
      }
    }
  },
  REVIVIFICATION: {
    name: "Revivification",
    subtitle: "The High Cost of Dying",
    requirements: "High-level Metaphysics or Tech (TL5)",
    penalties: {
      karmaLoss: "A revived character loses ALL remaining Karma Points (resets to 0).",
      experienceDebt: 5,
      debtDescription: "They suffer a -5 Experience Debt due to the trauma. This is taken as a reduction in a trait (or Traits) or as a reduction in accumulated/future experience until the debt is paid."
    }
  }
};

// ═══════════════════════════════════════════════════════════
// REST & RECOVERY SYSTEM (CANONICAL RULES)
// ═══════════════════════════════════════════════════════════

export const REST_SYSTEM_RULES = {
  FULL_REST: {
    name: 'Full Rest',
    standardHoursMin: 6,
    standardHoursMax: 8,
    description: "The typical sleep cycle for most sentient species ranges from 6 to 8 hours. This allows their bodies and minds to rest and recharge, preparing them for the following day's activities. However, there are exceptions to this general rule.",
    vitalityRestorationPercent: 100, // Restores 100% of maximum Vitality
    removesExhaustion: true,
    resetsDailyTraits: true,
    resetsDailyLightRests: true,
    speciesExceptions: {
      minimalRest: {
        types: ['Synthetic', 'Fae', 'Insect'],
        keywords: ['synthetic', 'fae', 'fey', 'asi', 'insect', 'insectoid', 'kitin', 'mekan', 'android', 'golem', 'construct'],
        summary: 'Minimal Rest (Light Rest counts as Full Rest)',
        description: 'Synthetics, Fae, and Insect species possess unique physiological attributes that enable them to function without traditional sleep. These species have evolved to require minimal rest, and a brief period of Light Rest is sufficient for them to fully refresh and maintain their energy levels.'
      },
      meditative: {
        types: ['Alterian', 'Mondi'],
        keywords: ['alterian', 'mondi', 'celestine'],
        summary: 'Deep Contemplative Meditation',
        description: 'In contrast, Alterians and Mondi, while technically not sleeping, engage in meditations throughout the day. This is considered Light Rest, where they enter a state of deep contemplation and reflection. During this relaxing state, their minds and bodies find solace, allowing them to recharge and maintain their mental and physical well-being.'
      }
    }
  },
  LIGHT_REST: {
    name: 'Light Rest',
    maxPerDay: 4,
    description: 'A nap or rest period is a short period of little or no activity that can effectively reset traits or features. It can be performed up to four times a day.',
    removesExhaustion: true,
    resetsShortRestTraits: true,
    vitalityRestorationFraction: 0.5, // Restores 50% of missing Vitality (or 100% for minimal rest species)
    tiers: {
      nap: {
        id: 'nap',
        name: 'Nap or Meditation',
        durationHours: 1,
        quality: 'Most restful',
        allowedActivities: 'Do nothing else but rest and relax.',
        description: "This is the most restful period and is ideal for resetting traits or features. During this time, it's important to do nothing else but rest and relax."
      },
      lounging: {
        id: 'lounging',
        name: 'Lounging',
        durationHours: 2,
        quality: 'Less restful',
        allowedActivities: 'Casual observation, light recreation, and non-laborious activities.',
        description: 'This type of rest period is less restful than a nap or meditation but still beneficial. Casual observation, light recreation, and non-laborious activities are allowed during this time.'
      },
      light_duty: {
        id: 'light_duty',
        name: 'Light Duty',
        durationHours: 3,
        quality: 'Least restful',
        allowedActivities: 'Light recreation, casual work, and minimal labor activities.',
        description: 'This type of rest period is the least restful but still counts as a rest period. Light recreation, casual work, and minimal labor activities are allowed during this time.'
      }
    },
    degradationSequence: ['nap', 'lounging', 'light_duty', 'not_rested'],
    strenuousActivities: {
      types: ['physical labor', 'intense exercise', 'mentally demanding tasks'],
      rule: 'Any activities more strenuous than those listed will count against rest. Each time a strenuous activity is performed, it will worsen the rest category (e.g., Nap to Lounging to Light Duty to Not Rested).'
    },
    karmaSecondWind: {
      cost: '1 Karma Point + 1 Minute of Focus',
      rule: 'Second Wind replaces Light Rest without downtime to instantly refresh abilities.'
    }
  },
  ROLEPLAY_AND_STRATEGY: {
    strategicImpact: 'In-game features or abilities that require rest add a layer of strategy and resource management to gameplay. Players must balance using these abilities with resting to ensure they are available when needed, avoiding overusing abilities without considering the consequences.',
    roleplayValue: 'Rest mechanics encourage roleplaying opportunities. Players find safe places to rest, such as inns or campsites, talk to NPCs, learn new information, or take a break from the action to create an immersive and believable world.'
  }
};
