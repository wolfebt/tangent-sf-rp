// ═══════════════════════════════════════════════════════════
// ARCHITECTURE MATRIX CONSTANTS (99 - ARCHITECTURAL MATRIX)
// ═══════════════════════════════════════════════════════════

export const ARCHITECTURE_FOOTPRINTS = {
  Miniscule: { id: 'Miniscule', name: 'Miniscule', dimensions: '< 0.5 x 0.5 ft', sqFt: 0.25, baseModules: 0.001, baseSP: 1, baseDC: 2, scaleMod: 0.01, baseCost: 15, example: 'Micro-Sensor' },
  Fine: { id: 'Fine', name: 'Fine', dimensions: '0.5 x 0.5 ft', sqFt: 0.25, baseModules: 0.002, baseSP: 2, baseDC: 5, scaleMod: 0.02, baseCost: 40, example: 'Comm-Relay' },
  Diminutive: { id: 'Diminutive', name: 'Diminutive', dimensions: '1 x 1 ft', sqFt: 1, baseModules: 0.005, baseSP: 5, baseDC: 8, scaleMod: 0.05, baseCost: 90, example: 'Light Fixture' },
  Tiny: { id: 'Tiny', name: 'Tiny', dimensions: '2 x 2 ft', sqFt: 4, baseModules: 0.01, baseSP: 10, baseDC: 10, scaleMod: 0.1, baseCost: 160, example: 'Post, Signage' },
  Small: { id: 'Small', name: 'Small', dimensions: '5 x 5 ft', sqFt: 25, baseModules: 0.06, baseSP: 25, baseDC: 12, scaleMod: 0.5, baseCost: 280, example: 'Kiosk, ATM, Turret' },
  Medium: { id: 'Medium', name: 'Medium', dimensions: '10 x 10 ft', sqFt: 100, baseModules: 0.25, baseSP: 50, baseDC: 15, scaleMod: 1.0, baseCost: 640, example: 'Shed, Tiny Home' },
  Large: { id: 'Large', name: 'Large', dimensions: '20 x 20 ft', sqFt: 400, baseModules: 1, baseSP: 100, baseDC: 18, scaleMod: 2.0, baseCost: 1500, example: 'Garage, Cabin' },
  Huge: { id: 'Huge', name: 'Huge', dimensions: '40 x 40 ft', sqFt: 1600, baseModules: 4, baseSP: 250, baseDC: 22, scaleMod: 5.0, baseCost: 4500, example: 'House, Shop, Lab' },
  Gargantuan: { id: 'Gargantuan', name: 'Gargantuan', dimensions: '80 x 80 ft', sqFt: 6400, baseModules: 16, baseSP: 800, baseDC: 28, scaleMod: 10.0, baseCost: 23000, example: 'Mansion, Warehouse' },
  Colossal: { id: 'Colossal', name: 'Colossal', dimensions: '200 x 200 ft', sqFt: 40000, baseModules: 100, baseSP: 2500, baseDC: 35, scaleMod: 20.0, baseCost: 163000, example: 'Factory, City Block' },
  Enormous: { id: 'Enormous', name: 'Enormous', dimensions: '500 x 500 ft', sqFt: 250000, baseModules: 625, baseSP: 10000, baseDC: 45, scaleMod: 40.0, baseCost: 2600000, example: 'Mega-Complex, Starport' },
  Titanic: { id: 'Titanic', name: 'Titanic', dimensions: '2,000 x 2,000 ft', sqFt: 4000000, baseModules: 10000, baseSP: 50000, baseDC: 60, scaleMod: 80.0, baseCost: 167000000, example: 'Arcology Base' },
  SuperGargantuan: { id: 'SuperGargantuan', name: 'Super Gargantuan', dimensions: '1 Mile x 1 Mile', sqFt: 27000000, baseModules: 69000, baseSP: 100000, baseDC: 70, scaleMod: 150.0, baseCost: 2600000000, example: 'Capital Shipyard' },
  MegaColossal: { id: 'MegaColossal', name: 'Mega Colossal', dimensions: 'Miles (Orbital Plate)', sqFt: 100000000, baseModules: 100000, baseSP: 200000, baseDC: 80, scaleMod: 300.0, baseCost: 42000000000, example: 'Orbital Plate / Ring' }
};

export const HEIGHT_CLASSES = {
  Single: { id: 'Single', name: 'Single Story', stories: 1, craftMod: 0, label: 'Single Story (1 Flr)', description: 'Ranch House, Shed, Warehouse' },
  Duplex: { id: 'Duplex', name: 'Duplex (2 Stories)', stories: 2, craftMod: 2, label: 'Duplex (2 Flrs)', description: '2-Story House, Townhouse' },
  MultiStory: { id: 'MultiStory', name: 'Multi-Story (3–5 Stories)', stories: 4, craftMod: 4, label: 'Multi-Story (4 Flrs)', description: 'Apartment Block, Office' },
  MidRise: { id: 'MidRise', name: 'Mid-Rise (6–12 Stories)', stories: 8, craftMod: 8, label: 'Mid-Rise (8 Flrs)', description: 'Corporate HQ, Hotel' },
  HighRise: { id: 'HighRise', name: 'High-Rise (13–40 Stories)', stories: 20, craftMod: 12, label: 'High-Rise (20 Flrs)', description: 'Urban Tower' },
  Skyscraper: { id: 'Skyscraper', name: 'Skyscraper (40+ Stories)', stories: 50, craftMod: 16, label: 'Skyscraper (50 Flrs)', description: 'Mega-Tower, Spire' }
};

export const ARCHITECTURE_FRAME_TYPES = {
  Standard: { id: 'Standard', name: 'Standard Frame', dcMod: 0, spMult: 1.0, moduleMult: 1.0, example: 'Civilian Housing, Shops', description: 'Basic habitation with standard utilities (+0 DC).' },
  Industrial: { id: 'Industrial', name: 'Industrial Frame', dcMod: -2, spMult: 1.0, moduleMult: 1.0, example: 'Factories, Warehouses', description: 'Function over form; boxy, bare concrete/metal (-2 DC).' },
  Elevated: { id: 'Elevated', name: 'Elevated Platform / Stilts', dcMod: 2, spMult: 0.75, moduleMult: 1.25, example: 'Built on Stilts, Offshore Platforms', description: '+25% Modules (expand outward), -25% SP (foundation stress) (+2 DC).' },
  Tower: { id: 'Tower', name: 'Tower / Spire Frame', dcMod: 2, spMult: 1.0, moduleMult: 1.0, example: 'Spires, Skyscrapers', description: 'Verticality focus, wind-shear resistant (+2 DC).' },
  Subterranean: { id: 'Subterranean', name: 'Subterranean Bunker / Vault', dcMod: 5, spMult: 1.15, moduleMult: 0.85, example: 'Bunkers, Vaults, Underground Silos', description: 'Dug into earth/rock. +15% SP, -15% Modules (hard to expand) (+5 DC).' },
  Biomimetic: { id: 'Biomimetic', name: 'Biomimetic / Grown Arcology', dcMod: 5, spMult: 1.0, moduleMult: 1.0, example: 'Grown Arcologies, Living Habitats', description: 'Mimics local flora/geography; highly customized (+5 DC).' },
  Dynamic: { id: 'Dynamic', name: 'Dynamic / Shifting Frame', dcMod: 5, spMult: 1.0, moduleMult: 1.0, example: 'Mekan Geometry, Reconfigurable Halls', description: 'Modularly shifting rooms and hallways (+5 DC).' },
  Palatial: { id: 'Palatial', name: 'Palatial / Fortress Keep', dcMod: 8, spMult: 1.0, moduleMult: 1.0, example: 'Castles, Megacorp Citadels', description: 'Highly versatile, prioritizing defense and extreme luxury (+8 DC).' }
};

export const ARCHITECTURE_MATERIALS = {
  0: { tl: 0, name: 'TL0: Wood, Stone & Hide (Stone Age)', dr: 5, spMult: 0.5, dcMod: -10, passive: 'Degrading: Hardness/DR 5, x0.50 SP Multiplier' },
  1: { tl: 1, name: 'TL1: Brick & Iron-Beam Framing (Metal Age)', dr: 10, spMult: 0.75, dcMod: -5, passive: 'Steam/Coal power: Hardness/DR 10, x0.75 SP Multiplier' },
  2: { tl: 2, name: 'TL2: Steel-Reinforced Concrete & Glass (Data Age)', dr: 15, spMult: 1.0, dcMod: -2, passive: 'Hydrocarbon/fission power: Hardness/DR 15, x1.0 SP Multiplier' },
  3: { tl: 3, name: 'TL3: Plasteel & Duranium (Space Age)', dr: 20, spMult: 2.0, dcMod: 0, passive: 'Modular: Universal ports, fusion power, hermetic seals standard (DR 20, x2.0 SP)' },
  4: { tl: 4, name: 'TL4: Smart-Fabric & Nanocarbon (Stellar Age)', dr: 30, spMult: 3.0, dcMod: 5, passive: 'Self-Repairing: Regens 1 SP/hour, repulsorlift foundations (DR 30, x3.0 SP)' },
  5: { tl: 5, name: 'TL5: Polymatter & Hard-Light (Galactic Age)', dr: 50, spMult: 5.0, dcMod: 10, passive: 'Morphic / Weightless: Instant reconfiguration, dimensional compression (DR 50+, x5.0 SP)' }
};

export const ENVIRONMENTAL_MODIFIERS = {
  Standard: { id: 'Standard', name: 'Standard Terrestrial (1.0G)', dcMod: 0, costMult: 1.0, description: 'Standard atmospheric pressure and gravity' },
  LowGravity: { id: 'LowGravity', name: 'Low Gravity (<0.8G)', dcMod: -2, costMult: 1.0, description: 'Taller and lighter. -2 DC to Design, Verticality Craft Modifiers halved' },
  HighGravity: { id: 'HighGravity', name: 'High Gravity (>1.5G)', dcMod: 5, costMult: 1.0, description: 'Reinforced foundation required. +5 DC to Design/Build, Verticality Craft Modifiers doubled' },
  VacuumToxic: { id: 'VacuumToxic', name: 'Vacuum / Toxic / Corrosive', dcMod: 0, costMult: 1.2, description: 'Requires Life Support Module. +20% Cost for hermetic sealing (Standard and free at TL3+)' },
  AquaticPressure: { id: 'AquaticPressure', name: 'Liquid / Aquatic (Pressure Hull)', dcMod: 5, costMult: 1.5, description: 'Requires Pressure Hull reinforcement (+5 DC, +50% Total Cost)' }
};

export const MECHA_GARAGING_RULES = {
  Medium: { size: 'Medium', scale: 'x1 Scale (<8ft)', modulesPerUnit: 0.025, unitsPerModule: 40, description: 'Requires ~0.025 Modules (40 units fit in 1 Module)' },
  Large: { size: 'Large', scale: 'x2 Scale (<16ft)', modulesPerUnit: 0.50, unitsPerModule: 2, description: 'Requires 0.50 Modules (2 units fit in 1 Module)' },
  Huge: { size: 'Huge', scale: 'x5 Scale (<32ft)', modulesPerUnit: 5.0, unitsPerModule: 0.2, description: 'Requires 5 Full Modules (Hangar Bay) per unit' },
  Gargantuan: { size: 'Gargantuan', scale: 'x10 Scale (<64ft)', modulesPerUnit: 10.0, unitsPerModule: 0.1, description: 'Requires 10 Full Modules (Heavy Bay) per unit' },
  Colossal: { size: 'Colossal', scale: 'x20 Scale (<128ft)', modulesPerUnit: 20.0, unitsPerModule: 0.05, description: 'Requires 20 Full Modules (Launch Gantry) per unit' }
};

// 9.1 Hardpoints: Armor Plating & Shields (Uses MOUNTS)
export const ARCHITECTURE_HARDPOINTS_ARMOR = [
  // Physical Plating
  { id: 'steel_plate', name: 'Industrial Steel Plate', category: 'Physical Plating', tl: 2, dc: 12, dr: 5, effect: 'DR 5', mountBaseMult: 1, description: '1 x Scale Modifier Mounts per layer' },
  { id: 'ceramic_comp', name: 'Ceramic Composite Plating', category: 'Physical Plating', tl: 3, dc: 18, dr: 10, effect: 'DR 10', mountBaseMult: 2, description: '2 x Scale Modifier Mounts per layer' },
  { id: 'reactive_armor', name: 'Reactive Armor (Explosive)', category: 'Physical Plating', tl: 3, dc: 20, dr: 15, effect: 'DR 15 (Single Use vs Kinetic)', mountBaseMult: 1, description: '1 x Scale Modifier Mounts per layer' },
  { id: 'nanocarbon_weave', name: 'Nanocarbon Weave', category: 'Physical Plating', tl: 4, dc: 25, dr: 15, effect: 'DR 15 (Lightweight)', mountBaseMult: 1, description: '1 x Scale Modifier Mounts per layer' },
  { id: 'adamantine_plate', name: 'Adamantine / Neutronium', category: 'Physical Plating', tl: 5, dc: 35, dr: 30, effect: 'DR 30 (Heavy)', mountBaseMult: 4, description: '4 x Scale Modifier Mounts per layer' },
  // Energy Shields
  { id: 'deflector_screen', name: 'Deflector Screen (Ray Shield)', category: 'Energy Shield', tl: 3, dc: 22, dr: 10, effect: 'DR 10 vs Energy only', mountBaseMult: 2, description: '2 x Scale Modifier Mounts' },
  { id: 'kinetic_barrier', name: 'Kinetic Barrier', category: 'Energy Shield', tl: 4, dc: 25, dr: 10, effect: 'DR 10 vs Physical only', mountBaseMult: 2, description: '2 x Scale Modifier Mounts' },
  { id: 'omnishield', name: 'Omnishield Generator', category: 'Energy Shield', tl: 4, dc: 30, dr: 15, effect: 'DR 15 vs All', mountBaseMult: 3, description: '3 x Scale Modifier Mounts' },
  { id: 'hardlight_hex', name: 'Hard-Light Hex Shield', category: 'Energy Shield', tl: 5, dc: 35, dr: 20, effect: 'DR 20 + Regenerates', mountBaseMult: 3, description: '3 x Scale Modifier Mounts' },
  // Specialty Coatings
  { id: 'stealth_coating', name: 'Stealth Coating (Radar Absorbent)', category: 'Specialty Coating', tl: 3, dc: 20, dr: 0, effect: '+4 Stealth vs Sensors', mountBaseMult: 0, mountsFlat: 0, description: '0 Mounts consumed' },
  { id: 'thermal_dispersion', name: 'Thermal Dispersion Coating', category: 'Specialty Coating', tl: 3, dc: 18, dr: 0, effect: '+4 Stealth vs Thermal', mountBaseMult: 0, mountsFlat: 0, description: '0 Mounts consumed' },
  { id: 'psionic_ward', name: 'Psionic Ward Lattice', category: 'Specialty Coating', tl: 4, ml: 3, dc: 28, dr: 10, effect: 'DR 10 vs Psionic/Magic', mountBaseMult: 1, description: '1 x Scale Modifier Mounts' }
];

// 9.2 Hardpoints: Structural Weaponry & Defenses (Uses MOUNTS)
export const ARCHITECTURE_HARDPOINTS_WEAPONS = [
  // Ballistic (Kinetic)
  { id: 'vulcan_minigun', name: 'Vulcan Minigun (Light)', category: 'Ballistic', tl: 3, dc: 15, mounts: 1, baseDamage: '2d10', damageType: 'Ballistic', baseRange: '2,000 ft', notes: 'Auto-Fire, Anti-Infantry' },
  { id: 'light_autocannon', name: 'Light Autocannon (Light)', category: 'Ballistic', tl: 3, dc: 18, mounts: 2, baseDamage: '3d10', damageType: 'Ballistic', baseRange: '3,000 ft', notes: 'Burst Fire' },
  { id: 'atgm_pod', name: 'ATGM Pod (Light)', category: 'Ballistic', tl: 3, dc: 18, mounts: 2, baseDamage: '4d8', damageType: 'Explosive', baseRange: '1 Mile', notes: 'Homing, Ammo: 4' },
  { id: 'heavy_railgun', name: 'Heavy Railgun (Heavy)', category: 'Ballistic', tl: 3, dc: 25, mounts: 4, baseDamage: '4d10', damageType: 'Kinetic', baseRange: '2 Miles', notes: 'Penetration (Ignores 10 DR)' },
  { id: 'siege_howitzer', name: 'Siege Howitzer (Heavy)', category: 'Ballistic', tl: 2, dc: 20, mounts: 5, baseDamage: '5d10', damageType: 'Explosive', baseRange: '5 Miles', notes: 'Arcing Fire (Indirect)' },
  { id: 'mac_cannon', name: 'MAC Cannon (Heavy)', category: 'Ballistic', tl: 4, dc: 30, mounts: 6, baseDamage: '6d10', damageType: 'Kinetic', baseRange: 'Line of Sight', notes: '"Structure Killer"' },
  { id: 'mass_driver', name: 'Mass Driver (Titan)', category: 'Ballistic', tl: 4, dc: 40, mounts: 10, baseDamage: '10d10', damageType: 'Kinetic', baseRange: 'Orbital', notes: 'Planetary Defense' },
  // Energy Weaponry
  { id: 'pulse_laser', name: 'Pulse Laser Battery (Light)', category: 'Energy', tl: 3, dc: 18, mounts: 1, baseDamage: '2d8', damageType: 'Energy', baseRange: '3,000 ft', notes: 'Accurate (+1 to Hit)' },
  { id: 'plasma_flamer', name: 'Plasma Flamer (Light)', category: 'Energy', tl: 3, dc: 20, mounts: 2, baseDamage: '3d6', damageType: 'Thermal', baseRange: 'Cone (100 ft)', notes: 'Ignores DR, Overheat risk' },
  { id: 'ion_blaster', name: 'Ion Blaster (Light)', category: 'Energy', tl: 3, dc: 18, mounts: 1, baseDamage: '1d10', damageType: 'Ion', baseRange: '1,500 ft', notes: 'Dmg x2 vs Shields/Synthetics' },
  { id: 'heavy_particle_beam', name: 'Heavy Particle Beam (Heavy)', category: 'Energy', tl: 4, dc: 28, mounts: 4, baseDamage: '5d8', damageType: 'Energy', baseRange: 'Line (2,000 ft)', notes: 'Melts Armor (-2 DR to target)' },
  { id: 'ppc_projector', name: 'PPC Projector (Heavy)', category: 'Energy', tl: 4, dc: 30, mounts: 5, baseDamage: '4d10', damageType: 'Lightning', baseRange: '4,000 ft', notes: 'EMP Effect (Stuns Systems)' },
  { id: 'tachyon_lance', name: 'Tachyon Lance (Heavy)', category: 'Energy', tl: 5, dc: 35, mounts: 4, baseDamage: '4d12', damageType: 'Exotic', baseRange: 'Line of Sight', notes: 'Ignores Shields' },
  { id: 'nova_cannon', name: 'Nova Cannon (Titan)', category: 'Energy', tl: 5, dc: 45, mounts: 12, baseDamage: '12d10', damageType: 'Thermal', baseRange: '10 Miles', notes: 'Orbital Defense (WMD)' },
  // Industrial & Close-Proximity Defenses
  { id: 'hydraulic_ram', name: 'Hydraulic Siege Ram', category: 'Close-Proximity', tl: 2, dc: 12, mounts: 1, baseDamage: '2d8', damageType: 'Bludgeon', baseRange: 'Touch', notes: 'Knockback. x2 dmg to structures.' },
  { id: 'harvester_saw', name: 'Industrial Harvester Saw', category: 'Close-Proximity', tl: 2, dc: 15, mounts: 2, baseDamage: '3d10', damageType: 'Slashing', baseRange: 'Touch', notes: 'Sundering (Destroys Armor)' },
  { id: 'vibro_cleaver', name: 'Vibro-Cleaver (Defense Arm)', category: 'Close-Proximity', tl: 3, dc: 20, mounts: 2, baseDamage: '4d8', damageType: 'Slashing', baseRange: 'Reach', notes: 'High Crit Range (19-20)' },
  { id: 'thermal_lance', name: 'Thermal Lance (Pile Bunker)', category: 'Close-Proximity', tl: 3, dc: 22, mounts: 2, baseDamage: '5d10', damageType: 'Piercing', baseRange: 'Touch', notes: 'Single Shot spike, penetration' },
  { id: 'arc_whip', name: 'Arc-Whip (Perimeter)', category: 'Close-Proximity', tl: 4, dc: 25, mounts: 1, baseDamage: '3d8', damageType: 'Slashing', baseRange: '30 ft', notes: 'Entangle / Trip intruding vehicles' },
  { id: 'plasma_emitter', name: 'Plasma Beam Emitter', category: 'Close-Proximity', tl: 4, dc: 28, mounts: 2, baseDamage: '5d8', damageType: 'Energy', baseRange: 'Reach', notes: 'Penetrating - Ignores 10 DR' },
  { id: 'grav_hammer_array', name: 'Grav-Hammer Array', category: 'Close-Proximity', tl: 5, dc: 35, mounts: 3, baseDamage: '6d10', damageType: 'Force', baseRange: 'Reach', notes: 'Knockback and AoE Shockwave' }
];

// 9.3 Hardpoints: Sensors & Aux Systems (Uses MOUNTS)
export const ARCHITECTURE_HARDPOINTS_SENSORS = [
  { id: 'passive_sensor', name: 'Passive Sensor Array', category: 'Sensors', tl: 2, dc: 5, mounts: 5, function: 'Rangefinders and external Cameras.' },
  { id: 'sensor_suite_radar', name: 'Sensor Suite (Radar/Lidar)', category: 'Sensors', tl: 3, dc: 15, mounts: 10, function: 'Range 5 miles. Detects movement.' },
  { id: 'sensor_suite_omni', name: 'Sensor Suite (Omni-Scan)', category: 'Sensors', tl: 4, dc: 25, mounts: 20, function: 'Range Orbit. Detects Life/Energy/Structure.' },
  { id: 'comm_array_av', name: 'Comm Array (A/V Radio)', category: 'Comms', tl: 2, dc: 5, mounts: 5, function: 'Standard audio/visual planetary comms.' },
  { id: 'scrambler_unit', name: 'Scrambler Unit', category: 'Comms', tl: 2, dc: 10, mounts: 5, function: 'Protects local comms from basic slicing.' },
  { id: 'ecm_encryption', name: 'ECM / Advanced Encryption', category: 'EW/Comms', tl: 4, dc: 20, mounts: 20, function: 'Scrambles comms/missiles (DC 15+ check to slice).' },
  { id: 'auto_targeting_base', name: 'Automated Targeting Base', category: 'Tactical', tl: 3, dc: 15, mounts: 10, function: '+1 to base Automated Defense attacks.' },
  { id: 'smoke_chaff', name: 'Smoke/Chaff Launcher', category: 'Tactical', tl: 2, dc: 12, mounts: 1, function: 'Obscures Vision (Reaction Action to incoming fire).' },
  { id: 'tractor_beam', name: 'Tractor Beam', category: 'Utility', tl: 4, dc: 25, mounts: 2, function: 'Immobilize Target (Str vs Str check to hold vessels).' },
  { id: 'drone_hive', name: 'Drone Hive (Swarm Bay)', category: 'Tactical', tl: 4, dc: 30, mounts: 4, function: 'Deploys 1d4 Automated point-defense drones.' }
];

// 9.4 - 9.6 Architectural Facilities Catalog (Uses MODULES)
export const ARCHITECTURE_FACILITIES = [
  // 9.4 Living & Social
  { id: 'capsule_coffin', name: 'Capsule / Coffin Block', category: 'Living & Social', tl: 3, dc: 22, modules: 1, function: 'Ultra-high density (20 pods). Morale: Poor.' },
  { id: 'barracks', name: 'Barracks', category: 'Living & Social', tl: 1, dc: 12, modules: 2, function: 'High-density bunks (12 troops).' },
  { id: 'hab_unit', name: 'Standard Hab-Unit', category: 'Living & Social', tl: 2, dc: 16, modules: 1, function: 'Studio apartment (1-2 people).' },
  { id: 'luxury_suite', name: 'Luxury Suite', category: 'Living & Social', tl: 3, dc: 25, modules: 4, function: 'High-status (2,000 sq ft). +1 Morale.' },
  { id: 'mess_hall', name: 'Mess Hall', category: 'Living & Social', tl: 1, dc: 12, modules: 2, function: 'Kitchen/Seating for 40.' },
  { id: 'lounge_bar', name: 'Lounge / Bar', category: 'Living & Social', tl: 1, dc: 12, modules: 2, function: 'Social hub. +2 Diplomacy/Gather Info.' },
  { id: 'holodeck', name: 'Holodeck', category: 'Living & Social', tl: 4, dc: 35, modules: 2, function: 'Hard-light sim room. Training AP bonus.' },
  { id: 'sanctuary_shrine', name: 'Sanctuary / Shrine', category: 'Living & Social', tl: 1, dc: 10, modules: 1, function: 'Meditation space. +1 Willpower after rest.' },

  // 9.5 Vocation, Core & Logistics
  { id: 'command_center', name: 'Command Center / Bridge', category: 'Vocation & Logistics', tl: 2, dc: 10, modules: 2, function: 'Basic manual controls and tactical oversight.' },
  { id: 'neural_ops', name: 'Neural-Link Ops Center', category: 'Vocation & Logistics', tl: 4, dc: 25, modules: 2, function: '+2 Initiative/Tactics. Direct brain interface.' },
  { id: 'dedicated_shop_lab', name: 'Dedicated Shop / Lab', category: 'Vocation & Logistics', tl: 3, dc: 20, modules: 1, function: '+4 Equipment Bonus to relevant checks (5 users).' },
  { id: 'full_facility_campus', name: 'Full Facility Campus', category: 'Vocation & Logistics', tl: 3, dc: 30, modules: 4, function: '+6 Equipment Bonus to relevant checks (10+ users).' },
  { id: 'diagnostic_mainframe', name: 'Diagnostic Mainframe', category: 'Vocation & Logistics', tl: 3, dc: 15, modules: 1, function: 'Scaling bonuses (+2 at TL3, +4 at TL4, +6 at TL5) to Repair.' },
  { id: 'database_archives', name: 'Database Archives', category: 'Vocation & Logistics', tl: 3, dc: 15, modules: 1, function: 'Scaling bonuses (+2 at TL3, +4 at TL4) to Knowledge.' },
  { id: 'fabricator_workshop', name: 'Fabricator Workshop', category: 'Vocation & Logistics', tl: 3, dc: 25, modules: 2, function: '50% reduced Crafting time for personal items.' },
  { id: 'fabricator_nanoforge', name: 'Fabricator (Nano-Forge)', category: 'Vocation & Logistics', tl: 5, dc: 40, modules: 4, function: 'Creates complex ammo/items automatically in the field.' },
  { id: 'server_farm', name: 'Server Farm', category: 'Vocation & Logistics', tl: 3, dc: 24, modules: 2, function: 'AI hosting. +2 Computing defense.' },
  { id: 'secure_vault', name: 'Secure Vault', category: 'Vocation & Logistics', tl: 3, dc: 30, modules: 1, function: 'Reinforced (DR 30 walls). DC 30 Break/Hack to enter.' },
  { id: 'brig_detention', name: 'Brig / Detention Center', category: 'Vocation & Logistics', tl: 3, dc: 24, modules: 4, function: '10 Cells with force fields.' },
  { id: 'cargo_bay', name: 'Cargo Bay (Expandable)', category: 'Vocation & Logistics', tl: 2, dc: 10, modules: 2, function: 'Converts Modules to bulk Tonnage (1,000 tons).' },
  { id: 'garage_bay', name: 'Garage Bay', category: 'Vocation & Logistics', tl: 2, dc: 14, modules: 1, function: 'Stores 2 Large Ground Vehicles safely.' },
  { id: 'hangar_small', name: 'Hangar Bay (Small)', category: 'Vocation & Logistics', tl: 3, dc: 24, modules: 4, function: 'Stores 1 Huge Aircraft/Starfighter.' },
  { id: 'hangar_large', name: 'Hangar Bay (Large)', category: 'Vocation & Logistics', tl: 3, dc: 28, modules: 10, function: 'Stores 1 Gargantuan Shuttle or dropship.' },

  // 9.6 Medical & Hazard Mitigation
  { id: 'life_support', name: 'Life Support (Environmental)', category: 'Medical & Hazard', tl: 3, dc: 15, modules: 1, function: 'Sealed vs Vacuum/Poison. 24hr emergency air.' },
  { id: 'purification_plant', name: 'Base Purification Plant', category: 'Medical & Hazard', tl: 3, dc: 20, modules: 2, function: 'Advanced recyclers. Actively restores degraded Supply Dice.' },
  { id: 'enviro_dome', name: 'Enviro-Dome Generator', category: 'Medical & Hazard', tl: 3, dc: 15, modules: 1, function: '20ft radius of Environmental Protection Rating (EPR) 1.' },
  { id: 'evac_bunker', name: 'Emergency Evacuation Bunker', category: 'Medical & Hazard', tl: 3, dc: 15, modules: 1, function: 'Saves key personnel on structural destruction.' },
  { id: 'autodoc_station', name: 'Autodoc Station', category: 'Medical & Hazard', tl: 4, dc: 20, modules: 1, function: 'Autonomous robotic surgeon (runs Operation Software).' },
  { id: 'operating_theater', name: 'Operating Theater', category: 'Medical & Hazard', tl: 3, dc: 20, modules: 1, function: '+4 Equipment Bonus to Medicine checks.' },
  { id: 'medical_campus', name: 'Medical Lab (Facility)', category: 'Medical & Hazard', tl: 3, dc: 30, modules: 4, function: '+6 Equipment Bonus. Supports multiple trauma patients.' },
  { id: 'repair_drones_facility', name: 'Repair Drones (Auto-Doc)', category: 'Medical & Hazard', tl: 4, dc: 28, modules: 2, function: 'Restores 1d10 Structure Points/minute to the building.' },
  { id: 'vertical_rails', name: 'Vertical Traversal Rails', category: 'Medical & Hazard', tl: 4, dc: 15, modules: 0.5, function: 'Advanced elevator shafts (Take 10 on climb).' },
  { id: 'grav_attenuators', name: 'Grav-Attenuator Shafts', category: 'Medical & Hazard', tl: 5, dc: 25, modules: 1, function: 'Dampens gravity. Advantage on traversal/rapid movement.' }
];

// 9.7 Core Internals (Generators & Infrastructure)
export const ARCHITECTURE_CORE_INTERNALS = [
  { id: 'combustion_gen', name: 'Internal Combustion Generator', tl: 2, dc: 12, notes: 'Requires liquid fuel. Loud, creates heavy exhaust.' },
  { id: 'battery_bank', name: 'High-Capacity Battery Bank', tl: 3, dc: 15, notes: 'Silent. Limited operational duration if cut off.' },
  { id: 'micro_fusion', name: 'Micro-Fusion Reactor', tl: 3, dc: 22, notes: 'Infinite duration (years). Volatile breach risk.' },
  { id: 'antimatter_core', name: 'Antimatter Core', tl: 4, dc: 30, notes: 'Massive energy output. Catastrophic breach if destroyed.' },
  { id: 'zpe_node', name: 'Zero-Point Energy Node', tl: 5, dc: 35, notes: 'Infinite power. No heat signature.' },
  { id: 'hydraulic_servos', name: 'Hydraulic Servos', tl: 2, dc: 10, notes: 'Infrastructure for heavy moving parts (blast doors/elevators).' },
  { id: 'myomer_musculature', name: 'Myomer Musculature', tl: 3, dc: 18, notes: 'Infrastructure for mobile structures. Silent operation.' },
  { id: 'gyro_stabilizers', name: 'Gyroscopic Stabilizers', tl: 3, dc: 15, notes: 'Advantage on structural stability checks (earthquakes/impacts).' }
];

// Section X: Mobile Propulsion Systems (20% Chassis Tax on Module Capacity)
export const ARCHITECTURE_PROPULSION = [
  { id: 'ground_crawler', name: 'Ground Crawler (Treads)', tl: 2, dc: 20, baseSpeed: 20, handling: 'Glacial Handling', notes: 'Requires massive gearing/suspension.' },
  { id: 'independent_suspension', name: 'Independent Suspension', tl: 2, dc: 25, baseSpeed: 40, handling: 'Standard Handling', notes: 'Ignores light terrain penalties. (For smaller mobile bases).' },
  { id: 'aquatic_flotilla', name: 'Aquatic Flotilla (Ballast)', tl: 2, dc: 15, baseSpeed: 30, handling: 'Poor Handling', notes: 'Standard sub-surface/surface movement.' },
  { id: 'supercavitation', name: 'Supercavitation (Hydro-Jet)', tl: 3, dc: 20, baseSpeed: 60, handling: 'Good Handling', notes: 'High speed underwater city/base.' },
  { id: 'heavy_hover', name: 'Heavy Hover (Skimmer)', tl: 3, dc: 25, baseSpeed: 60, handling: 'Poor Handling', notes: 'Requires immense power distribution.' },
  { id: 'orbital_keeping', name: 'Orbital Station-Keeping', tl: 3, dc: 20, baseSpeed: 10, handling: 'Thruster Handling', notes: 'Thrusters for orbit maintenance. Includes vacuum seals.' },
  { id: 'heavy_vtol', name: 'Heavy VTOL System (Jets)', tl: 4, dc: 30, baseSpeed: 50, handling: 'Glacial Handling', notes: 'Massive thrust stress on the structural frame.' },
  { id: 'arcane_levitation', name: 'Arcane Levitation (Tower)', tl: 4, ml: 3, dc: 25, baseSpeed: 30, handling: 'Silent Handling', notes: 'Requires Pilot with Telepathy or Meta-Craft skill.' },
  { id: 'aerial_grav_spire', name: 'Aerial Grav-Spire (Anti-Grav)', tl: 4, dc: 40, baseSpeed: 80, handling: 'Average Handling', notes: 'The pinnacle of structural engineering.' }
];

// Section XIV: Cultural Skin / Faction Architectural Paradigms
export const FACTION_ARCHITECTURAL_PARADIGMS = {
  Syndicate: {
    id: 'Syndicate',
    name: 'The Syndicate (Corporate Utopia / High-Tech Sanctum)',
    aesthetic: '"The Apple Store Cathedral." Matte white composites, brushed aluminum, holographic interfaces.',
    philosophy: 'Technical Facilitation & Mesh integration. Subscription-based habits ("Penance Mode" on lapse).',
    signature: 'Hexagonal tiling, cyan data-streams, anti-gravity elevators, hyper-modular construction.',
    bonusTrait: 'Mesh Grid Integration: All internal communication/computing checks gain +2 bonus.'
  },
  Impyrium: {
    id: 'Impyrium',
    name: 'The Impyrium (Stagnant Grandeur / Heirloom Industrial)',
    aesthetic: '"Celestial Neo-Sumerian." Massive brutalist marble structures clad in gold filigree and statuary.',
    philosophy: 'Enduring Dominance. Infrastructure maintained by sacred ritual; Relic Sockets reject foreign tech.',
    signature: 'Solar 8-pointed star motifs, heavy physical armor plating, load-bearing statuary.',
    bonusTrait: 'Fortress Integrity: Structural shell gains +5 DR against ballistic and kinetic impacts.'
  },
  Dracon: {
    id: 'Dracon',
    name: 'The Dracon Dynasty (Feudal Protection / Warmth)',
    aesthetic: '"High-Fantasy Industrial." Castle silhouettes, warm gold lighting, great halls, heraldic crests.',
    philosophy: 'Noblesse Oblige. Prioritizes structural integrity and extreme durability over speed/efficiency.',
    signature: 'Dragon scale motifs, heavy kinetic/thermal hardpoints, "Void Castle" bulkheads.',
    bonusTrait: 'Void Castle Bastion: Foundation gains Advantage on all integrity & siege collapse checks.'
  },
  Ascendancy: {
    id: 'Ascendancy',
    name: 'The Ascendancy (Enlightened Innovation / Solar Renaissance)',
    aesthetic: '"Smart City Solarpunk." Clean curves, glass canopies, white facades with blue energy accents.',
    philosophy: 'Adaptive Progress. User-friendly, heavily shielded, designed for modular agility.',
    signature: 'Variable-geometry spires, high-efficiency ion power grids, non-lethal defense arrays.',
    bonusTrait: 'Harmonic Power: Core generators produce 25% surplus energy for emergency shielding.'
  },
  Coalition: {
    id: 'Coalition',
    name: 'The Coalition & Outworlds (Used Future / Scrappy Industrial)',
    aesthetic: '"Space Western Noir." Scavenged parts, exposed wiring, welded patch-jobs, hazard stripes.',
    philosophy: 'Survival Pragmatism. If it works, live in it; built for easy field patching.',
    signature: 'Asymmetrical layouts, cheap ballistic turrets, oversized bolt-on generators, Franken-habs.',
    bonusTrait: 'Field Patchable: Emergency repairs cost 50% less materials and take half the time.'
  },
  Alterian: {
    id: 'Alterian',
    name: 'The Alterian Enclave (Magi-Tech Refinement / Crystal Spires)',
    aesthetic: '"Interstellar Art Nouveau." Solar sails, white ceramic fused with living wood, crystal matrices.',
    philosophy: 'The Long View. Structures are timeless works of art integrating science and sorcery.',
    signature: 'Silent environmental systems, Sun-Lance energy weapons, open atrium force fields.',
    bonusTrait: 'Sunglass Canopies: Crystalline roofs act as solar capacitors, auto-recharging energy grids.'
  },
  Auluran: {
    id: 'Auluran',
    name: 'The Auluran (Symbiotic Growth / Bioluminescent Jungle)',
    aesthetic: '"Living Tech." Grown arcologies, chitinous walls, vascular corridors, bioluminescent moss.',
    philosophy: 'Biological Imperative. Living organism bonded to inhabitants; heals damage naturally.',
    signature: 'No hard angles, organic shapes, acid/spore defense weapons, bonded neural-grafts.',
    bonusTrait: 'Symbiotic Regeneration: Structure regenerates 1 SP per hour when bonded Overseer is present.'
  },
  Mekan: {
    id: 'Mekan',
    name: 'The Mekan (Geometric Logic / Pure Code)',
    aesthetic: '"Fractal Perfection." Floating geometric shapes, magnetism pylons, shifting polymatter surfaces.',
    philosophy: 'The Code. Form follows function instantaneously; reconfigures floorplans mid-siege.',
    signature: 'Liquid metal facades, hard-light structural projections, Swarm modularity.',
    bonusTrait: 'Dynamic Reconfiguration: Hallways and cover can be reshaped as a Move Action.'
  },
  Entari: {
    id: 'Entari',
    name: 'The Entari Combine (Cosmopolitan Trade / Eco-Luxury)',
    aesthetic: '"Galactic Senate." Smooth luxury finishes, high-end materials, non-threatening silhouettes.',
    philosophy: 'Ethical Efficiency. Infrastructure for mass trade, diplomacy, and elite comfort.',
    signature: 'Universal transit rings, integrated translation suites, concealed structural weaponry.',
    bonusTrait: 'Concealed Emplacements: All weapon emplacements are hidden until activated in combat.'
  }
};

// Backwards compatibility alias
export const SPECIALIZED_MODULE_CATALOG = ARCHITECTURE_FACILITIES;
