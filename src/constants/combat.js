// ═══════════════════════════════════════════════════════════
// MECHA & VEHICLES MATRIX CONSTANTS (PLAN 21)
// ═══════════════════════════════════════════════════════════

export { WEAPON_DOWNGRADES } from './equipment.js';

export const ARMOR_DOWNGRADES = [
  { id: 'exposed_vitals', name: 'Exposed Vitals', dcMod: -2, effect: 'Critical hit threat range against wearer increases by 1', valueOf() { return -2; } },
  { id: 'clumsy', name: 'Clumsy / Unbalanced', dcMod: -2, effect: 'Increases Armor Mobility Penalty by an additional -1', valueOf() { return -2; } },
  { id: 'fragile_seals', name: 'Fragile Seals', dcMod: -2, effect: 'Environmental seals breach on any Critical Hit', valueOf() { return -2; } },
  { id: 'obvious', name: 'Obvious / Unconcealable', dcMod: -1, effect: 'Cannot be concealed beneath clothing; -4 Disguise', valueOf() { return -1; } }
];
ARMOR_DOWNGRADES.forEach(d => {
  ARMOR_DOWNGRADES[d.id] = d;
});

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

export const DIE_STEP_LADDER = ['d12', 'd10', 'd8', 'd6', 'd4', 'd3', 'd2', '1'];

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
  Enormous: { id: 'Enormous', name: 'Enormous', scale: 'x40', scaleMult: 40.0, strCbtMod: 32, defMod: -32, stealth: 'NO', structure: 2500, mounts: 200, baseDC: 45, example: 'Capital Battlecruiser' },
  Titanic: { id: 'Titanic', name: 'Titanic', scale: 'x80', scaleMult: 80.0, strCbtMod: 64, defMod: -64, stealth: 'NO', structure: 5000, mounts: 400, baseDC: 50, example: 'Colony Ship, Planetary Dreadnought' },
  SuperGargantuan: { id: 'SuperGargantuan', name: 'Super Gargantuan', scale: 'x160', scaleMult: 160.0, strCbtMod: 128, defMod: -128, stealth: 'NO', structure: 10000, mounts: 800, baseCR: 60, baseDC: 60, example: 'System Dreadnought, Star Fort' },
  MegaColossal: { id: 'MegaColossal', name: 'Mega Colossal', scale: 'x320', scaleMult: 320.0, strCbtMod: 256, defMod: -256, stealth: 'NO', structure: 20000, mounts: 1600, baseCR: 80, baseDC: 80, example: 'Dyson Swarm Node, Megastructure Ship' }
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
  { id: 'hydro_jet', name: 'Hydro-Jet Supercavitation', category: 'Aquatic', tl: 3, dcMod: 10, mounts: 2, speed: '60 ft/rnd', notes: 'High speed underwater propulsion' },
  { id: 'hyperdrive', name: 'Hyperdrive (Gate /Beacon Transit)', category: 'FTL', tl: 3, dcMod: 15, mounts: 4, speed: 'FTL (1 ly/day)', notes: 'Requires Jump Gate or Nav-Beacon network' },
  { id: 'subspace_warp', name: 'Subspace Warp Drive', category: 'FTL', tl: 4, dcMod: 25, mounts: 6, speed: 'FTL (5 ly/day)', notes: 'Independent interstellar subspace bubble propulsion' },
  { id: 'jump_fold', name: 'Dimensional Jump / Fold Drive', category: 'FTL', tl: 5, dcMod: 35, mounts: 8, speed: 'Instant Jump (Sector)', notes: 'Instantaneous point-to-point spatial folding' },
  { id: 'astral_sail', name: 'Astral / Aether Sail', category: 'FTL', tl: 4, ml: 3, dcMod: 20, mounts: 3, speed: 'FTL (Leyline)', notes: 'Rides stellar solar winds and metaphysical leylines' }
];

export const MECHA_WEAPONS = [
  // Kinetic (Ballistic / Missile)
  { id: 'vulcan_minigun', name: 'Vulcan Minigun', category: 'Kinetic', tl: 3, dc: 15, dcMod: 15, mounts: 1, baseDamage: '2d10', damageType: 'Ballistic', baseRange: '2,000 ft', notes: 'Auto-Fire, Anti-Infantry' },
  { id: 'light_autocannon', name: 'Light Autocannon', category: 'Kinetic', tl: 3, dc: 18, dcMod: 18, mounts: 2, baseDamage: '3d10', damageType: 'Ballistic', baseRange: '3,000 ft', notes: 'Burst Fire' },
  { id: 'atgm_pod', name: 'ATGM Missile Pod', category: 'Kinetic', tl: 3, dc: 18, dcMod: 18, mounts: 2, baseDamage: '4d8', damageType: 'Explosive', baseRange: '1 Mile', notes: 'Homing, Ammo: 4' },
  { id: 'heavy_railgun', name: 'Heavy Railgun', category: 'Kinetic', tl: 3, dc: 25, dcMod: 25, mounts: 4, baseDamage: '4d10', damageType: 'Kinetic', baseRange: '2 Miles', notes: 'Penetration (Ignores 10 DR)' },
  { id: 'siege_howitzer', name: 'Siege Howitzer', category: 'Kinetic', tl: 2, dc: 20, dcMod: 20, mounts: 5, baseDamage: '5d10', damageType: 'Explosive', baseRange: '5 Miles', notes: 'Arcing Fire (Indirect)' },
  { id: 'mac_cannon', name: 'MAC Cannon', category: 'Kinetic', tl: 4, dc: 30, dcMod: 30, mounts: 6, baseDamage: '6d10', damageType: 'Kinetic', baseRange: 'Line of Sight', notes: 'Structure Killer' },
  { id: 'mass_driver', name: 'Mass Driver (Titan)', category: 'Kinetic', tl: 4, dc: 40, dcMod: 40, mounts: 10, baseDamage: '10d10', damageType: 'Kinetic', baseRange: 'Orbital', notes: 'Capital / Orbital Siege' },
  // Energy Weaponry
  { id: 'pulse_laser', name: 'Pulse Laser', category: 'Energy', tl: 3, dc: 18, dcMod: 18, mounts: 1, baseDamage: '2d8', damageType: 'Energy', baseRange: '3,000 ft', notes: 'Accurate (+1 to Hit)' },
  { id: 'plasma_flamer', name: 'Plasma Flamer', category: 'Energy', tl: 3, dc: 20, dcMod: 20, mounts: 2, baseDamage: '3d6', damageType: 'Thermal', baseRange: 'Cone (100 ft)', notes: 'Ignores DR, Overheat risk' },
  { id: 'ion_blaster', name: 'Ion Blaster', category: 'Energy', tl: 3, dc: 18, dcMod: 18, mounts: 1, baseDamage: '1d10', damageType: 'Ion', baseRange: '1,500 ft', notes: 'Dmg x2 vs Shields/Synthetics' },
  { id: 'heavy_particle_beam', name: 'Heavy Particle Beam', category: 'Energy', tl: 4, dc: 28, dcMod: 28, mounts: 4, baseDamage: '5d8', damageType: 'Energy', baseRange: 'Line (2,000 ft)', notes: 'Melts Armor (-2 DR to target)' },
  { id: 'ppc_projector', name: 'PPC Projector', category: 'Energy', tl: 4, dc: 30, dcMod: 30, mounts: 5, baseDamage: '4d10', damageType: 'Lightning', baseRange: '4,000 ft', notes: 'EMP Effect (Stuns Systems)' },
  { id: 'tachyon_lance', name: 'Tachyon Lance', category: 'Energy', tl: 5, dc: 35, dcMod: 35, mounts: 4, baseDamage: '4d12', damageType: 'Exotic', baseRange: 'Line of Sight', notes: 'Ignores Shields' },
  { id: 'nova_cannon', name: 'Nova Cannon (Titan)', category: 'Energy', tl: 5, dc: 45, dcMod: 45, mounts: 12, baseDamage: '12d10', damageType: 'Thermal', baseRange: '10 Miles', notes: 'Capital WMD' },
  // Melee & Close-Proximity
  { id: 'hydraulic_ram', name: 'Hydraulic Siege Ram', category: 'Melee', tl: 2, dc: 12, dcMod: 12, mounts: 1, baseDamage: '2d8', damageType: 'Bludgeon', baseRange: 'Touch', notes: 'Knockback, x2 dmg to structures' },
  { id: 'harvester_saw', name: 'Industrial Harvester Saw', category: 'Melee', tl: 2, dc: 15, dcMod: 15, mounts: 2, baseDamage: '3d10', damageType: 'Slashing', baseRange: 'Touch', notes: 'Sundering (Destroys Armor)' },
  { id: 'vibro_cleaver', name: 'Vibro-Cleaver', category: 'Melee', tl: 3, dc: 20, dcMod: 20, mounts: 2, baseDamage: '4d8', damageType: 'Slashing', baseRange: 'Reach', notes: 'High Crit Range (19-20)' },
  { id: 'thermal_lance', name: 'Thermal Lance (Pile Bunker)', category: 'Melee', tl: 3, dc: 22, dcMod: 22, mounts: 2, baseDamage: '5d10', damageType: 'Piercing', baseRange: 'Touch', notes: 'Single Shot spike, penetration' },
  { id: 'arc_whip', name: 'Arc-Whip', category: 'Melee', tl: 4, dc: 25, dcMod: 25, mounts: 1, baseDamage: '3d8', damageType: 'Slashing', baseRange: '30 ft', notes: 'Entangle / Trip vehicles' },
  { id: 'plasma_saber', name: 'Plasma Beam Saber', category: 'Melee', tl: 4, dc: 28, dcMod: 28, mounts: 2, baseDamage: '5d8', damageType: 'Energy', baseRange: 'Reach', notes: 'Penetrating (Ignores 10 DR)' },
  { id: 'grav_hammer', name: 'Grav-Hammer', category: 'Melee', tl: 5, dc: 35, dcMod: 35, mounts: 3, baseDamage: '6d10', damageType: 'Force', baseRange: 'Reach', notes: 'Knockback and AoE Shockwave' }
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
  pointsPerCp: 5, // Canonical: 1 CP = +5 points in Vitality, Health, or Structure
  cpCostPer5Points: 1, // 1 CP = +5 points in Vitality, Health, or Structure
  bpCostPer5Points: 1, // backward compatibility alias
  cpCostPer2Points: 0.4, // deprecated shim (5 pts per 1 CP)
  bpCostPer2Points: 0.4, // deprecated shim
  zeroStaminaScaling: true, // Stamina NEVER increases Vitality or Health pools
  maxCpIncreaseMultiplier: null, // Zero Stamina Pool Scaling (no 5 x Stamina cap)
  suggestedStartingMax: 60,
  suggestedStartingStructureMax: 120,
  toughnessFloor: 0,
  toughnessSource: 'Stamina Ability Score', // Point-for-point Base Toughness DR after single highest Armor DR
  naturalDRRule: 'All character Stamina acts as Base Toughness (natural DR) and subtracts point-for-point from incoming damage after the single highest Armor DR domain is applied (minimum 0 damage). Stamina NEVER increases Vitality or Health pools.',
  nonStandardPhysiologies: ['Synthetic', 'Mecha', 'Construct', 'Elemental', 'Golem', 'Ooze', 'Undead'],
  startingSkillRankCap: 11,
  maxSkillRank: 30,
  maxSpecializationRank: 10,
  maxInvocationRank: 30,
  descriptions: {
    systemRule: "In Tangent, a character's ability to endure and recover from damage is represented by Vitality and Health (or Structure for Synthetics and others with non-typical physiology). Tangent does NOT use HP.",
    staminaScore: "All character Stamina acts as Base Toughness (natural damage reduction) and automatically reduces incoming damage after the single highest Armor DR domain is applied, to a minimum of 0 damage. Stamina never scales Vitality or Health pool maximums.",
    startingValuesAndMax: "Characters begin with a base of 30 points in both Vitality and Health (or 60 Structure for Synthetics). Base Vitality and Health are never modified by Stamina, Willpower, or Fortitude. Pools may be increased by spending Character Points (CP) at a rate of 5 points per 1 CP (1 CP = +5 points), with a suggested starting maximum of 60 each (or 120 Structure Points for Synthetics).",
    concussiveDamage: "Concussive Damage is unique in that it is Heavily Traumatic but dispersed over the entire body. This damage can be divided equally between Vitality and Health if the character attempts to reduce the damage, regardless of whether the attempt is successful. This reflects the potential for both non-lethal and lethal injuries from falls, explosions, crashes, etc. This does not include any additional damage taken for what they may fall into such as spikes, debris, lava, etc.",
    vitality: "Vitality represents stamina, luck, tactical poise, and non-lethal buffer capacity. Standard combat attacks deplete Vitality first; once Vitality reaches 0, overflow damage strikes Health. The starting base is 30, increased by 5 points per 1 CP (suggested starting max 60).",
    health: "Health represents physical trauma, bodily tissue, and structural life force. Standard attacks strike Health only after Vitality reaches 0, while Critical Hits, Bleed, and Overchanneling Burn bypass Vitality to strike Health directly. Starting base is 30 (+5 points per 1 CP, suggested starting max 60). At 0 Health, the character enters the Unified Mortality State with Stability Points equal to Stamina Score + 5.",
    structure: "Synthetics and constructs use Structure Points (SP), equal to the total of both Health and Vitality scores, starting at 60 SP and scaling by +5 SP per 1 CP (suggested starting max 120 SP). Synthetics are immune to non-lethal damage, poisons, diseases, suffocation, and biological fatigue.",
    criticalHits: "Critical hits (Natural 20 on 2d10, or expanded threat range 19, 18...) add +10 in addition to the rolled dice value (e.g., 20 -> 30, 19 -> 29), roll 2x Base Weapon Damage Dice, apply Weapon/Elemental Critical Effects, and bypass Vitality to strike Health directly (unless explicitly non-lethal).",
    skillCaps: "Skills scale up to Rank 30 (Stage 6 Pinnacle), with a starting character creation cap of Rank 11. Specializations max at Rank 10."
  }
};

// ═══════════════════════════════════════════════════════════
// DEATH & DYING SYSTEM (UNIFIED MORTALITY STATE)
// ═══════════════════════════════════════════════════════════

const MORTALITY_STATE_CONFIG = {
  name: "Mortality State",
  legacyName: "Death's Door",
  condition: "Mortality State",
  legacyCondition: "Comatose",
  statusGem: "Mortality State",
  trigger: "Health reaches 0",
  stabilityFormula: "Stamina Score + 5",
  clockFormula: "Stability Points equal to Stamina Score + 5 (Minimum 1)",
  baseStabilityOffset: 5,
  minStability: 1,
  minRounds: 1,
  stabilityLossPerTurn: 1,
  fortitudeSaveBaseCR: 10,
  fortitudeSaveEscalationPerRound: 1,
  selfStabilizeMargin: 5,
  stabilization: {
    medicineCR: 15,
    medicineDC: 15, // backward compatibility alias
    healingMagicOrTech: true,
    description: "A successful Knowledge (Medicine) CR 15 check, healing Metaphysics/Tech, or beating a Fortitude Stabilization Save by +5 or more stabilizes the character at 0 Health (Unconscious, no longer losing Stability)."
  },
  death: "If Stability Points reach 0, the character dies clinically.",
  massiveDamage: {
    threshold: "Damage equal to or greater than Max Stability (STA + 5) in a single hit while in Mortality State",
    effect: "Instant clinical death."
  }
};

export const DEATH_AND_DYING_RULES = {
  HEALTH_VS_VITALITY: {
    vitality: "Vitality represents tactical poise, luck, and kinetic buffer capacity.",
    health: "Health represents physical trauma, organ integrity, and lethal life force.",
    damageRouting: {
      nonlethal: "Non-lethal damage depletes Vitality first. Once non-lethal damage exceeds Vitality, excess overflows into Health.",
      lethal: "Standard combat damage depletes Vitality first. Once Vitality reaches 0, overflow damage strikes Health. Critical Hits, Bleed, and Overchanneling Burn bypass Vitality and strike Health directly.",
      criticalHits: "Critical hits bypass Vitality and apply damage directly to Health unless the attack is explicitly non-lethal."
    }
  },
  THRESHOLD_OF_DEATH: {
    zeroHealth: {
      name: "0 Health (Mortality State)",
      conditions: ['Mortality State', 'Incapacitated', 'Unconscious', 'Prone'],
      dropItems: true,
      description: "When a character is reduced to 0 Health, they immediately fall Unconscious and Prone, drop held items, and enter the Unified Mortality State with Stability Points equal to Stamina Score + 5."
    },
    mortalityState: MORTALITY_STATE_CONFIG,
    deathsDoor: MORTALITY_STATE_CONFIG
  },
  REVIVIFICATION: {
    name: "Revivification",
    subtitle: "The High Cost of Dying",
    requirements: "High-level Metaphysics or Tech (TL5)",
    penalties: {
      restoredHealth: 1,
      condition: "Exhausted",
      appliesExhausted: true,
      karmaLoss: "A revived character loses ALL remaining Karma Points (resets to 0).",
      experienceDebt: 5,
      debtDescription: "Returns at 1 Health with the Exhausted condition, 0 Karma, and a +5 Experience Debt until paid off."
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
    description: "The typical sleep cycle for most sentient species ranges from 6 to 8 hours, restoring 100% Vitality, 5 + Stamina Health (min 1; doubled with Fast Heal or Medicine care), and 100% Essence.",
    vitalityRestorationPercent: 100,
    healthRestorationBase: 5,
    healthRestorationMin: 1,
    medicalOrFastHealMultiplier: 2,
    essenceRestorationPercent: 100,
    removesExhaustion: true,
    resetsDailyTraits: true,
    resetsDailyLightRests: true,
    speciesExceptions: {
      minimalRest: {
        types: ['Synthetic', 'Fae', 'Insect'],
        keywords: ['synthetic', 'fae', 'fey', 'asi', 'insect', 'insectoid', 'kitin', 'mekan', 'android', 'golem', 'construct'],
        summary: 'Minimal Rest (Light Rest counts as Full Rest)',
        description: 'Synthetics, Fae, and Insect species possess unique physiological attributes that enable them to function without traditional sleep. A brief period of Light Rest is sufficient for them to achieve Full Rest recovery.'
      },
      meditative: {
        types: ['Alterian', 'Mondi'],
        keywords: ['alterian', 'mondi', 'celestine'],
        summary: 'Deep Contemplative Meditation',
        description: 'Alterians and Mondi engage in deep contemplative meditations rather than biological sleep to achieve Full or Light Rest recovery.'
      }
    }
  },
  LIGHT_REST: {
    name: 'Light Rest',
    maxPerDay: 4,
    description: 'A short rest period (up to 4/day) restoring 10 + Stamina Vitality (minimum 5) and Key Attribute Modifier Essence (minimum 1).',
    removesExhaustion: true,
    resetsShortRestTraits: true,
    baseVitalityRecovery: 10,
    minVitalityRecovery: 5,
    minEssenceRecovery: 1,
    vitalityRestorationFormula: '10 + Stamina (min 5)',
    essenceRestorationFormula: 'Key Attribute Modifier (min 1)',
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
      rule: 'Second Wind spends 1 Karma Point and 1 Minute of Focus to immediately gain Light Rest benefits (10 + Stamina Vitality, min 5; Key Attribute Modifier Essence, min 1; resets short-rest traits).'
    }
  },
  ROLEPLAY_AND_STRATEGY: {
    strategicImpact: 'In-game features or abilities that require rest add a layer of strategy and resource management to gameplay. Players must balance using these abilities with resting to ensure they are available when needed, avoiding overusing abilities without considering the consequences.',
    roleplayValue: 'Rest mechanics encourage roleplaying opportunities. Players find safe places to rest, such as inns or campsites, talk to NPCs, learn new information, or take a break from the action to create an immersive and believable world.'
  }
};
