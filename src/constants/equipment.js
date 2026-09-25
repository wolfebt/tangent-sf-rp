// ═══════════════════════════════════════════════════════════
// TECH LEVELS (TL 0 - 5)
// ═══════════════════════════════════════════════════════════

export const TECH_LEVELS = {
  0: {
    id: 0,
    name: 'TL 0',
    era: 'Stone Age',
    subtitle: 'Primitive / Pre-Industrial',
    wealthMod: -4,
    powerSources: ['Muscle', 'Fire', 'Wind', 'Water'],
    species: ['Fae', 'Koban', 'Thorns'],
    educationBonus: { type: 'skills', value: '+2 Alertness, +2 Survival, 1 Skill +2' },
    restrictedSkills: ['Piloting', 'Engineering', 'Computer']
  },
  1: {
    id: 1,
    name: 'TL 1',
    era: 'Metal Age',
    subtitle: 'Industrial / Mechanical',
    wealthMod: -2,
    powerSources: ['Coal', 'Steam', 'Early Fossil Fuel'],
    species: ['Caprians', 'Orlls', 'Truldan', 'Vassoth', 'Weti'],
    educationBonus: { type: 'skills', value: '2 Vocation Skills +2, 4 Skills +2' },
    restrictedSkills: ['Piloting', 'Computer']
  },
  2: {
    id: 2,
    name: 'TL 2',
    era: 'Data Age',
    subtitle: 'Digital / Information',
    wealthMod: 0,
    powerSources: ['Hydrocarbons', 'Fission', 'Renewables'],
    species: ['Brei', 'Dwergs', 'Prokoss', 'Qerics', 'Terran Humans'],
    educationBonus: { type: 'skillPoints', value: 20 }
  },
  3: {
    id: 3,
    name: 'TL 3',
    era: 'Space Age',
    subtitle: 'Stellar / The Gate Era',
    wealthMod: 2,
    powerSources: ['Thorium', 'Hydrogen Fuel Cells', 'Ionic', 'Fusion'],
    species: ['Alterians', 'Dynasty', 'Outworlds', 'Independent Factions'],
    educationBonus: { type: 'skillPoints', value: 30 }
  },
  4: {
    id: 4,
    name: 'TL 4',
    era: 'Stellar Age',
    subtitle: 'Galactic / The Warp Era',
    wealthMod: 4,
    powerSources: ['Antimatter', 'Cold Fusion', 'Aetherium', 'Kinetic Reactors'],
    species: ['Impyrium', 'Aulurans', 'Manelli', 'Davae', 'Sefalin', 'Syndicate'],
    educationBonus: { type: 'skillPoints', value: 40 }
  },
  5: {
    id: 5,
    name: 'TL 5',
    era: 'Galactic Age',
    subtitle: 'Cosmic / The Singularity',
    wealthMod: 8,
    powerSources: ['Dimensional Siphons', 'Matter-Energy Conversion', 'ZPE', 'Dark Energy'],
    species: ['Mekan', 'Mondi', "Sha'Nor"],
    educationBonus: { type: 'skillPoints', value: 50 }
  }
};

export const SUB_STRATA = ['Nascent', 'Standard', 'Advanced']; // TL-, TL, TL+

// ═══════════════════════════════════════════════════════════
// UDU HIERARCHY (Universal Displacement Unit)
// ═══════════════════════════════════════════════════════════

export const UDU_TIERS = {
  Node: {
    id: 0,
    name: 'Node',
    label: 'Tier 0',
    maxWeight: '10g',
    ratio: 10,
    description: 'Micro-unit, cybernetics, component options'
  },
  Socket: {
    id: 1,
    name: 'Socket',
    label: 'Tier 1',
    maxWeight: '1kg',
    ratio: 10,
    description: 'Personal item, gun, computer, cyberware implant'
  },
  Mount: {
    id: 2,
    name: 'Mount',
    label: 'Tier 2',
    maxWeight: '100kg',
    ratio: 10,
    description: 'Mecha/Vehicle scale component or heavy weapon'
  },
  Module: {
    id: 3,
    name: 'Module',
    label: 'Tier 3',
    maxWeight: '10t',
    ratio: null,
    description: 'Architecture/Starship facility scale'
  }
};

// ═══════════════════════════════════════════════════════════
// TOOL / PRODUCTION TIER MULTIPLIERS
// ═══════════════════════════════════════════════════════════

export const TOOL_TIERS = [
  { id: 'improvised', name: 'TL 0 — Improvised', multiplier: 1, description: 'Bare hands, stone tools' },
  { id: 'basic', name: 'TL 1 — Basic', multiplier: 10, description: 'Handheld tools, garage kit' },
  { id: 'advanced', name: 'TL 2 — Advanced', multiplier: 50, description: 'Professional shop, alchemist lab' },
  { id: 'industrial', name: 'TL 3 — Industrial', multiplier: 200, description: 'Automated factory, magical circle' },
  { id: 'nanoforge', name: 'TL 4 — Nanoforge', multiplier: 1000, description: 'Molecular assemblers, swarm fab' },
  { id: 'bioCultivation', name: 'Bio — Cultivation', multiplier: 1000, description: 'Hyper-growth vats (Medicine + Eng)' },
  { id: 'genesis', name: 'TL 5 — Genesis', multiplier: 5000, description: 'Polymatter loom, holophotonics' }
];

// ═══════════════════════════════════════════════════════════
// FINANCIAL STATUS HIERARCHY
// ═══════════════════════════════════════════════════════════

export const FINANCIAL_STATUS_TABLE = [
  { name: 'Indebted', wsMin: 0, wsMax: 0, bpCost: -5, autoBuyCr: 0, netWorth: 'Negative', lifestyle: 'Debt slavery / prison' },
  { name: 'Impoverished', wsMin: 1, wsMax: 4, bpCost: 0, autoBuyCr: 30, netWorth: '<500 Cr', lifestyle: 'Homeless / squatter' },
  { name: 'Struggling', wsMin: 5, wsMax: 9, bpCost: 2, autoBuyCr: 150, netWorth: '~2k Cr', lifestyle: 'Shared slum room' },
  { name: 'Middle Class', wsMin: 10, wsMax: 14, bpCost: 5, autoBuyCr: 600, netWorth: '~25k Cr', lifestyle: 'Private apartment' },
  { name: 'Affluent', wsMin: 15, wsMax: 19, bpCost: 10, autoBuyCr: 2500, netWorth: '~200k Cr', lifestyle: 'High-end condo' },
  { name: 'Wealthy', wsMin: 20, wsMax: 29, bpCost: 20, autoBuyCr: 40000, netWorth: '~5M Cr', lifestyle: 'Large estate, servants' },
  { name: 'Hegemon', wsMin: 30, wsMax: 39, bpCost: 35, autoBuyCr: 650000, netWorth: '~100M Cr', lifestyle: 'Penthouse, small corp' },
  { name: 'Industrialist', wsMin: 40, wsMax: 49, bpCost: 50, autoBuyCr: 10000000, netWorth: '~2B Cr', lifestyle: 'Megacorp exec' },
  { name: 'Dynastic', wsMin: 50, wsMax: 59, bpCost: 70, autoBuyCr: 167000000, netWorth: '~50B Cr', lifestyle: 'CEO / Nobility' },
  { name: 'System Lord', wsMin: 60, wsMax: 69, bpCost: 95, autoBuyCr: 2600000000, netWorth: '~500B Cr', lifestyle: 'Rules solar system' },
  { name: 'Sector Ruler', wsMin: 70, wsMax: 79, bpCost: 125, autoBuyCr: 42000000000, netWorth: '~10T Cr', lifestyle: 'Rules star cluster' },
  { name: 'Faction Ruler', wsMin: 80, wsMax: 999, bpCost: 160, autoBuyCr: 600000000000, netWorth: '~1 Quad Cr', lifestyle: 'Emperor / god-king' }
];

// ═══════════════════════════════════════════════════════════
// WORLD TRADE CODES
// ═══════════════════════════════════════════════════════════

export const WORLD_TRADE_CODES = {
  Ag: { name: 'Agricultural', modifiers: { Foodstuffs: -30, Textiles: -20, Biologics: -20, Water: -10 } },
  As: { name: 'Asteroid', modifiers: { 'Metals-Common': -30, 'Metals-Rare': -20, Chemicals: -10, Polymers: 20 } },
  Ba: { name: 'Barren', modifiers: { Foodstuffs: 30, Water: 40, Textiles: 20 } },
  De: { name: 'Desert', modifiers: { Water: 50, Foodstuffs: 20, Biologics: 30 } },
  Fl: { name: 'Fluid Oceans', modifiers: { Chemicals: -30, Biologics: -20, Water: -40 } },
  Ga: { name: 'Garden', modifiers: { Foodstuffs: -20, Biologics: -30, Water: -20, Luxuries: -10 } },
  Hi: { name: 'High Population', modifiers: { Foodstuffs: 20, Electronics: -10, 'High Tech': -10 } },
  Ht: { name: 'High Tech', modifiers: { Electronics: -30, 'High Tech': -40, Machinery: -20 } },
  Ic: { name: 'Ice-Capped', modifiers: { Water: -30, Chemicals: -10, Foodstuffs: 30 } },
  In: { name: 'Industrial', modifiers: { Machinery: -30, Polymers: -20, 'Metals-Common': -10, Chemicals: -10 } },
  Lo: { name: 'Low Population', modifiers: { Luxuries: 30, 'High Tech': 20, Electronics: 20 } },
  Lt: { name: 'Low Tech', modifiers: { 'High Tech': 40, Electronics: 30, Machinery: 20, Weaponry: 20 } },
  Na: { name: 'Non-Agricultural', modifiers: { Foodstuffs: 30, Textiles: 20, Biologics: 20 } },
  Ni: { name: 'Non-Industrial', modifiers: { Machinery: 20, Polymers: 20, Electronics: 10 } },
  Po: { name: 'Poor', modifiers: { Luxuries: 30, 'High Tech': 30, Electronics: 20 } },
  Ri: { name: 'Rich/Mining', modifiers: { 'Metals-Common': -20, 'Metals-Rare': -30, Luxuries: -20 } },
  Va: { name: 'Vacuum', modifiers: { Foodstuffs: 30, Water: 40, Biologics: 30 } },
  Wa: { name: 'Water World', modifiers: { Water: -40, Biologics: -20, Foodstuffs: -10 } }
};

// ═══════════════════════════════════════════════════════════
// TRADE COMMODITIES
// ═══════════════════════════════════════════════════════════

export const COMMODITIES = [
  { id: 'foodstuffs', name: 'Foodstuffs', category: 'Essential', baseCostPerTon: 500 },
  { id: 'water', name: 'Water/Ice', category: 'Essential', baseCostPerTon: 250 },
  { id: 'textiles', name: 'Textiles', category: 'Essential', baseCostPerTon: 1000 },
  { id: 'polymers', name: 'Polymers', category: 'Industrial', baseCostPerTon: 4000 },
  { id: 'chemicals', name: 'Chemicals', category: 'Industrial', baseCostPerTon: 5000 },
  { id: 'metals_common', name: 'Metals-Common', category: 'Industrial', baseCostPerTon: 7000 },
  { id: 'metals_rare', name: 'Metals-Rare', category: 'Industrial', baseCostPerTon: 25000 },
  { id: 'machinery', name: 'Machinery', category: 'Tech', baseCostPerTon: 15000 },
  { id: 'electronics', name: 'Electronics', category: 'Tech', baseCostPerTon: 30000 },
  { id: 'high_tech', name: 'High Tech', category: 'Tech', baseCostPerTon: 50000 },
  { id: 'luxuries', name: 'Luxuries', category: 'Luxury', baseCostPerTon: 100000 },
  { id: 'biologics', name: 'Biologics', category: 'Luxury', baseCostPerTon: 75000 },
  { id: 'weaponry_cargo', name: 'Weaponry', category: 'Restricted', baseCostPerTon: 40000 },
  { id: 'armor_cargo', name: 'Armor', category: 'Restricted', baseCostPerTon: 35000 }
];

// ═══════════════════════════════════════════════════════════
// FACTION WEALTH MODIFIERS
// ═══════════════════════════════════════════════════════════

export const FACTION_WEALTH_MODS = {
  'Alterian Enclave': 3,
  'Auluran / Kitin': 2,
  'Ascendancy': 4,
  'Coalition': 0,
  'Dynasty': 2,
  'Entari': 3,
  'Impyrium': 3,
  'Mekan': 6,
  'Syndicate': 4,
  'Outworlds': 0
};

// ═══════════════════════════════════════════════════════════
// BODY SLOT NODE CAPACITIES (Augmentations)
// ═══════════════════════════════════════════════════════════

export const BODY_SLOT_NODES = {
  Head: 10,
  Torso: 50,
  LeftArm: 30,
  RightArm: 30,
  LeftLeg: 40,
  RightLeg: 40
};
export const TOTAL_BODY_NODES = 200;

// ═══════════════════════════════════════════════════════════
// STIGMA THRESHOLDS
// ═══════════════════════════════════════════════════════════

export const STIGMA_THRESHOLDS = [
  { name: 'None', minMods: 0, maxMods: 0, socialPenalty: 0, description: 'No visible modification' },
  { name: 'Minor', minMods: 1, maxMods: 3, socialPenalty: -2, description: 'Noticeable but tolerated' },
  { name: 'Moderate', minMods: 4, maxMods: 6, socialPenalty: -4, description: 'Clearly augmented' },
  { name: 'Severe', minMods: 7, maxMods: 999, socialPenalty: -8, description: 'Treated as xeno/object' }
];

// ═══════════════════════════════════════════════════════════
// FENCE / RESALE RATES
// ═══════════════════════════════════════════════════════════

export const FENCE_RATES = {
  legal: 0.50,
  blackMarket: 0.225, // average of 20-25%
  scrap: 0.10
};

// ═══════════════════════════════════════════════════════════
// CIVILIZATION DOMAINS (16)
// ═══════════════════════════════════════════════════════════

export const CIVILIZATION_DOMAINS = [
  'Agriculture', 'Architecture', 'Biotechnology', 'Commerce', 'Communication',
  'Devices', 'Energy', 'Manufacturing', 'Materials', 'Medicine',
  'Meta Sciences', 'Science', 'Society', 'Synthetic Intelligence', 'Transportation', 'Weaponry'
];

// ═══════════════════════════════════════════════════════════
// TECHNOLOGIST FIELDS OF STUDY (17)
// ═══════════════════════════════════════════════════════════

export const TECHNOLOGIST_FIELDS = [
  ...CIVILIZATION_DOMAINS, 'Education'
];

// ═══════════════════════════════════════════════════════════
// ADAPTIVE TECHNOLOGY TYPES
// ═══════════════════════════════════════════════════════════

export const ADAPTIVE_TECH_TYPES = [
  { id: 'nanotech', name: 'Nanotechnology', tl: 3, reconfigTime: 'Minutes (10 Rounds)', trigger: 'Move Action' },
  { id: 'biotech', name: 'Biotechnology', tl: 3, reconfigTime: 'Minutes (10 Rounds)', trigger: 'Move Action' },
  { id: 'picotech', name: 'Programmable Matter (Picotech)', tl: 4, reconfigTime: '1 Full Round', trigger: 'Move Action' },
  { id: 'polymatter', name: 'Polymatter (Femtotech)', tl: 5, reconfigTime: '1 Round', trigger: 'Move Action' },
  { id: 'holophotonic', name: 'Holophotonics (Solid Energy)', tl: 5, reconfigTime: 'Instant (same round)', trigger: 'Move Action' }
];

// ═══════════════════════════════════════════════════════════
// SCHEMATIC RARITY COST MULTIPLIERS
// ═══════════════════════════════════════════════════════════

export const SCHEMATIC_RARITY = {
  Common: { multiplier: 5, integrationDC: 20 },
  Uncommon: { multiplier: 10, integrationDC: 20 },
  'Rare/Restricted': { multiplier: 20, integrationDC: 20 }
};

// ═══════════════════════════════════════════════════════════
// COMPLEXITY TIER LABELS
// ═══════════════════════════════════════════════════════════

export const COMPLEXITY_TIERS = [
  { dc: 0, label: 'Scrap' },
  { dc: 5, label: 'Simple' },
  { dc: 10, label: 'Standard' },
  { dc: 15, label: 'Expert' },
  { dc: 20, label: 'Advanced' },
  { dc: 25, label: 'Master' },
  { dc: 30, label: 'Grandmaster' },
  { dc: 35, label: 'Heroic' },
  { dc: 40, label: 'Legendary' },
  { dc: 45, label: 'Mythic' },
  { dc: 50, label: 'Transcendent' },
  { dc: 60, label: 'Precursor Artifact' },
  { dc: 80, label: 'Faction / Megastructure' }
];

// ═══════════════════════════════════════════════════════════
// EQUIPMENT MATRIX CONSTANTS (PLAN 17)
// ═══════════════════════════════════════════════════════════

export const EQUIPMENT_SIZES = {
  Fine: { id: 'Fine', name: 'Fine', mass: '<0.1 kg', capacityDisplay: '2 Nodes', sockets: 0, nodes: 2, sp: 2, defaultDC: 5, maxDex: 6 },
  Diminutive: { id: 'Diminutive', name: 'Diminutive', mass: '<1 kg', capacityDisplay: '1 Socket', sockets: 1, nodes: 10, sp: 5, defaultDC: 5, maxDex: 6 },
  Tiny: { id: 'Tiny', name: 'Tiny', mass: '<5 kg', capacityDisplay: '2 Sockets', sockets: 2, nodes: 20, sp: 10, defaultDC: 10, maxDex: 5 },
  Small: { id: 'Small', name: 'Small', mass: '<10 kg', capacityDisplay: '4 Sockets', sockets: 4, nodes: 40, sp: 20, defaultDC: 15, maxDex: 4 },
  Medium: { id: 'Medium', name: 'Medium', mass: '<25 kg', capacityDisplay: '8 Sockets', sockets: 8, nodes: 80, sp: 40, defaultDC: 20, maxDex: 2 },
  Mecha: { id: 'Mecha', name: 'Mecha', mass: '<100 kg', capacityDisplay: '1 Mount', sockets: 10, mounts: 1, sp: 100, defaultDC: 30, maxDex: 0 },
  Structure: { id: 'Structure', name: 'Structure', mass: '>10 Tons', capacityDisplay: '1 Module', sockets: 100, modules: 1, sp: 500, defaultDC: 40, maxDex: 0 }
};

export const WORKSPACE_SCALES = {
  Belt: { id: 'Belt', name: 'Belt Pouch / Holster', dcMod: 0, skillBonus: 0, sockets: 1, description: 'Personal pouch or holster toolkit (+0 Check)' },
  Pack: { id: 'Pack', name: 'Backpack Field Kit', dcMod: 2, skillBonus: 2, sockets: 4, description: 'Backpack field kit (+2 Check)' },
  Case: { id: 'Case', name: 'Hard-Case Lab Kit', dcMod: 4, skillBonus: 4, sockets: 8, description: 'Heavy hard-case professional workshop (+4 Check)' },
  Room: { id: 'Room', name: 'Dedicated Facility Room', dcMod: 6, skillBonus: 6, sockets: 40, description: 'Dedicated workshop/laboratory room (+6 Check)' },
  Campus: { id: 'Campus', name: 'Industrial Campus', dcMod: 8, skillBonus: 8, sockets: 200, description: 'Full research campus or industrial facility (+8 Check)' }
};

export const COMPUTER_PR_RATINGS = {
  0: { pr: 0, name: 'Basic Terminal', tl: 2, dcMod: 0, maxSoftware: 1, description: 'Simple calculation and static data storage' },
  1: { pr: 1, name: 'Personal Deck', tl: 3, dcMod: 5, maxSoftware: 2, description: 'Standard consumer and operative processing' },
  2: { pr: 2, name: 'Cyber-Rig', tl: 3, dcMod: 10, maxSoftware: 4, description: 'Professional cyberware and hacking processor' },
  3: { pr: 3, name: 'Quantum Core', tl: 4, dcMod: 15, maxSoftware: 6, description: 'Tactical AI sub-mind and predictive suite' },
  4: { pr: 4, name: 'Singularity Deck', tl: 5, dcMod: 25, maxSoftware: 10, description: 'Autonomous sentient cognition node' }
};

export const EPR_RATINGS = {
  0: { rating: 0, name: 'None (Standard)', dcMod: 0, description: 'Standard terrestrial atmosphere' },
  1: { rating: 1, name: 'EPR 1 (Filter Mask)', dcMod: 2, description: 'Filter mask: Dust, mild smoke, non-lethal airborne contaminants' },
  2: { rating: 2, name: 'EPR 2 (Hazmat)', dcMod: 5, description: 'Hazmat: Corrosive atmospheres, biological toxins, radiation shielding' },
  3: { rating: 3, name: 'EPR 3 (Sealed Vacuum)', dcMod: 10, description: 'Sealed vacuum: Space-ready hermetic seals with 8-hour oxygen' },
  4: { rating: 4, name: 'EPR 4 (Coronal / Extreme)', dcMod: 15, description: 'Extreme hostile: Stellar coronal mass, deep planetary pressure, void warp' }
};

// ═══════════════════════════════════════════════════════════
// WEAPONRY MATRIX CONSTANTS (PLAN 18)
// ═══════════════════════════════════════════════════════════

export const WEAPON_SIZES = {
  Tiny: { id: 'Tiny', name: 'Tiny (Pistol / Dagger)', sockets: 1, sp: 10, defaultDC: 10, handedness: '1H' },
  Small: { id: 'Small', name: 'Small (SMG / Short Sword)', sockets: 2, sp: 20, defaultDC: 15, handedness: '1H' },
  Medium: { id: 'Medium', name: 'Medium (Rifle / Long Sword)', sockets: 4, sp: 40, defaultDC: 20, handedness: '2H' },
  Large: { id: 'Large', name: 'Large (Heavy Weapon / Polearm)', sockets: 6, sp: 80, defaultDC: 25, handedness: '2H' },
  Mecha: { id: 'Mecha', name: 'Mecha / Vehicle Hardpoint', sockets: 10, sp: 100, defaultDC: 30, handedness: 'Mounted' }
};

export const WEAPON_MODIFICATIONS = [
  // Optics & Targeting
  { id: 'reflex_sight', name: 'Reflex Sight', category: 'Optics', sockets: 1, tl: 1, dcMod: 10, effect: '+1 to Strike at Short Range' },
  { id: 'smart_link', name: 'Smart-Link HUD', category: 'Optics', sockets: 0, tl: 3, dcMod: 20, effect: 'Wireless HUD link. +2 to Strike. Enables blind-fire' },
  { id: 'thermal_scope', name: 'Thermal Scope', category: 'Optics', sockets: 1, tl: 2, dcMod: 15, effect: 'Negates darkness and visual-obscurement penalties' },
  { id: 'sniper_scope', name: 'Sniper Scope', category: 'Optics', sockets: 1, tl: 1, dcMod: 15, effect: '+50% Range, penalty to hit at Short Range' },
  { id: 'threat_analyzer', name: 'Threat Analyzer', category: 'Optics', sockets: 1, tl: 3, dcMod: 20, effect: '+1 Penetration (AP) on Aimed shots' },
  { id: 'precog_sights', name: 'Pre-Cog Sights', category: 'Optics', sockets: 2, tl: 5, dcMod: 30, effect: "Negates target's Evasive defense bonuses" },
  { id: 'radar_targeting', name: 'Radar Targeting', category: 'Optics', sockets: 1, tl: 3, dcMod: 20, effect: '+2 Attack vs moving targets' },
  { id: 'sound_targeting', name: 'Sound Targeting', category: 'Optics', sockets: 1, tl: 3, dcMod: 20, effect: '+2 Attack vs targets making noise' },
  { id: 'thermal_targeting', name: 'Thermal Targeting', category: 'Optics', sockets: 1, tl: 3, dcMod: 20, effect: '+2 Attack vs targets with heat signatures' },

  // Barrel & Muzzle
  { id: 'silencer', name: 'Silencer / Suppressor', category: 'Muzzle', sockets: 1, tl: 1, dcMod: 15, effect: '+10 Stealth DC to detect shot' },
  { id: 'recoil_compensator', name: 'Recoil Compensator', category: 'Muzzle', sockets: 1, tl: 2, dcMod: 15, effect: 'Reduces Auto-Fire penalty by 2' },
  { id: 'extended_barrel', name: 'Extended Barrel', category: 'Muzzle', sockets: 1, tl: 1, dcMod: 15, effect: '+20% Range, -1 to Concealment' },
  { id: 'beam_focuser', name: 'Beam Focuser', category: 'Muzzle', sockets: 1, tl: 3, dcMod: 15, effect: '(Energy Only) +1 Penetration, -10% Range' },
  { id: 'underbarrel_launcher', name: 'Under-Barrel Grenade Launcher', category: 'Muzzle', sockets: 2, tl: 2, dcMod: 20, effect: 'Adds secondary Grenade/Micro-Missile fire' },
  { id: 'magnetic_accel', name: 'Magnetic Accelerator Rails', category: 'Muzzle', sockets: 2, tl: 3, dcMod: 25, effect: '+1 Damage per die, +20% Range' },
  { id: 'choke_adjuster', name: 'Choke Adjuster', category: 'Muzzle', sockets: 1, tl: 2, dcMod: 10, effect: '(Scatter Only) Toggle Area vs focused damage' },
  { id: 'thermal_vent', name: 'Thermal Vent', category: 'Muzzle', sockets: 1, tl: 4, dcMod: 20, effect: 'Deals 1d4 Pyro in 5ft aura when firing' },

  // Frame & Chassis
  { id: 'collapsible', name: 'Collapsible Frame', category: 'Frame', sockets: 1, tl: 1, dcMod: 15, effect: 'Reduces size category for concealment when stowed' },
  { id: 'concealed', name: 'Concealed Disguise', category: 'Frame', sockets: 1, tl: 1, dcMod: 10, effect: 'Disguised as clothing or harmless item' },
  { id: 'biometric_lock', name: 'Biometric Lock', category: 'Frame', sockets: 0, tl: 3, dcMod: 25, effect: 'Weapon only fires for registered authorized user' },
  { id: 'extended_mag', name: 'Extended Magazine', category: 'Frame', sockets: 1, tl: 2, dcMod: 15, effect: '+50% Ammunition Capacity' },
  { id: 'melee_attachment', name: 'Bayonet / Melee Attachment', category: 'Frame', sockets: 1, tl: 1, dcMod: 10, effect: 'Adds 1d6 Melee attack' },
  { id: 'energy_sheath', name: 'Energy Sheath', category: 'Frame', sockets: 1, tl: 3, dcMod: 20, effect: 'Adds elemental damage aura to blade/projectile' },
  { id: 'gyro_stabilizer', name: 'Gyro Stabilizer', category: 'Frame', sockets: 2, tl: 3, dcMod: 20, effect: 'Negates movement penalties for Heavy weapons' },
  { id: 'bio_grip', name: 'Bio-Grip', category: 'Frame', sockets: 1, tl: 4, dcMod: 25, effect: 'Bonds to user. +4 vs Disarm, repairs 1 SP/hour' },
  { id: 'self_destruct', name: 'Self-Destruct Module', category: 'Frame', sockets: 1, tl: 3, dcMod: 25, effect: 'Detonates for 3d6 if unauthorized use attempted' },
  { id: 'hidden_pocket', name: 'Hidden Compartment', category: 'Frame', sockets: 1, tl: 1, dcMod: 10, effect: 'Store a Tiny item or data-drive discreetly' },
  { id: 'reduced_weight', name: 'Ultralight Composite Frame', category: 'Frame', sockets: 0, tl: 2, dcMod: 10, effect: '-50% Weight' },
  { id: 'stick_pad', name: 'Magnetic Stick Pad', category: 'Frame', sockets: 1, tl: 3, dcMod: 15, effect: 'Sticks to target, wall, or vehicle hull' },
  { id: 'voice_activated', name: 'Voice Activated', category: 'Frame', sockets: 0, tl: 3, dcMod: 25, effect: 'Triggered or unlocked by voice command' },

  // Payload & Energy
  { id: 'high_output_emitter', name: 'High-Output Emitter', category: 'Payload', sockets: 2, tl: 3, dcMod: 25, effect: '(Energy) +1 Damage Die, 2x ammo consumption' },
  { id: 'explosive_rounds', name: 'Explosive Rounds Chamber', category: 'Payload', sockets: 1, tl: 1, dcMod: 20, effect: 'Changes damage to Explosive (5ft Blast)' },
  { id: 'stun_module', name: 'Stun / Non-Lethal Module', category: 'Payload', sockets: 1, tl: 3, dcMod: 20, effect: 'Secondary Non-Lethal fire. Fort DC = 10 + 1/2 Dmg' },
  { id: 'vibro_generator', name: 'Vibro-Generator', category: 'Payload', sockets: 1, tl: 3, dcMod: 20, effect: '(Melee) +1d6 Damage and +2 Penetration (AP)' },
  { id: 'monofilament_edge', name: 'Mono-Filament Edge', category: 'Payload', sockets: 2, tl: 4, dcMod: 25, effect: '(Melee) Critical threat range increases by 1 (e.g. 19-20)' },
  { id: 'caustic_reservoir', name: 'Caustic Acid Reservoir', category: 'Payload', sockets: 1, tl: 3, dcMod: 20, effect: 'Deals 1d4 Corrosive damage on hit' },
  { id: 'null_field_payload', name: 'Null-Field Disruption', category: 'Payload', sockets: 2, tl: 5, dcMod: 30, effect: 'Target must save Fortitude or lose Metafocus 1 round' },
  { id: 'ammo_fabricator', name: 'Micro-Ammo Fabricator', category: 'Payload', sockets: 2, tl: 4, dcMod: 30, effect: 'Synthesizes 1 shot/hour from ambient environment' },
  { id: 'accurate_1', name: 'Accurate (+1)', category: 'Payload', sockets: 1, tl: 1, dcMod: 10, effect: '+1 Bonus to Attack' },
  { id: 'accurate_2', name: 'Accurate (+2)', category: 'Payload', sockets: 1, tl: 2, dcMod: 20, effect: '+2 Bonus to Attack' },
  { id: 'accurate_3', name: 'Accurate (+3)', category: 'Payload', sockets: 1, tl: 3, dcMod: 30, effect: '+3 Bonus to Attack' },
  { id: 'automated', name: 'Automated Fire Mode', category: 'Payload', sockets: 1, tl: 3, dcMod: 20, effect: 'Grants Full-Auto capability' },
  { id: 'electrified', name: 'Electrified Arc', category: 'Payload', sockets: 1, tl: 2, dcMod: 15, effect: '(Melee) +1d6+1 Voltic damage' },
  { id: 'improved_damage', name: 'Improved Damage Tuning', category: 'Payload', sockets: 1, tl: 2, dcMod: 20, effect: '+2 Flat Bonus to Damage' },
  { id: 'improved_range', name: 'Improved Range Tuning', category: 'Payload', sockets: 1, tl: 2, dcMod: 15, effect: 'x2 Range Increment' },
  { id: 'motion_sensitive', name: 'Motion Sensitive Trigger', category: 'Payload', sockets: 1, tl: 3, dcMod: 20, effect: 'Automatically fires at moving targets in cone' },
  { id: 'nondetection', name: 'Scanner Nondetection', category: 'Payload', sockets: 1, tl: 4, dcMod: 30, effect: 'Undetectable by standard scanner tech' },
  { id: 'reconfigurable', name: 'Multi-Form Reconfigurable', category: 'Payload', sockets: 2, tl: 4, dcMod: 30, effect: 'Shifts weapon type / form factor' },
  { id: 'subdual_mode', name: 'Subdual Safety Mode', category: 'Payload', sockets: 1, tl: 3, dcMod: 25, effect: 'Toggle Lethal to Non-Lethal damage at will' }
];

export const WEAPON_CAPACITY_UPGRADES = [
  { id: 'typical', name: 'Standard Capacity', multiplier: 1, dcMod: 0 },
  { id: 'double', name: 'Double Capacity (x2)', multiplier: 2, dcMod: 10 },
  { id: 'triple', name: 'Triple Capacity (x3)', multiplier: 3, dcMod: 15 },
  { id: 'pack', name: 'Power Pack / Drum (x5)', multiplier: 5, dcMod: 20 },
  { id: 'canister', name: 'Heavy Canister (x10)', multiplier: 10, dcMod: 25 },
  { id: 'hopper', name: 'High-Volume Hopper (x20)', multiplier: 20, dcMod: 30 }
];

export const WEAPON_DOWNGRADES = [
  { id: 'inaccurate', name: 'Inaccurate (-1 Attack)', dcMod: -2, effect: '-1 penalty to Strike' },
  { id: 'unreliable', name: 'Unreliable (Jams on 1-2)', dcMod: -5, effect: 'Jams or misfires on natural 1 or 2' },
  { id: 'bulky', name: 'Bulky / Heavy', dcMod: -2, effect: 'Counts as one size category larger for weight and concealment' },
  { id: 'decreased_range', name: 'Decreased Range (-50%)', dcMod: -5, effect: '-50% effective range' },
  { id: 'disposable', name: 'Disposable / Single-Load', dcMod: -5, effect: 'Cannot reload, degrades completely once emptied' }
];

// ═══════════════════════════════════════════════════════════
// ARMOR MATRIX CONSTANTS (PLAN 19)
// ═══════════════════════════════════════════════════════════

export const ARMOR_COVERAGE = {
  Partial: { id: 'Partial', name: 'Partial Coverage', description: 'Vest / Greaves only (Vital organs)', socketMult: 0.5, spMult: 0.5, dcMod: -2, mobilityPenalty: 0, movePenalty: 0 },
  Standard: { id: 'Standard', name: 'Standard Coverage', description: 'Full suit (Complete limb/torso)', socketMult: 1.0, spMult: 1.0, dcMod: 0, mobilityPenalty: 0, movePenalty: 0 },
  Sealed: { id: 'Sealed', name: 'Sealed Suit', description: 'Hermetic seal (Helmet / gaskets)', socketMult: 1.0, spMult: 1.0, dcMod: 4, mobilityPenalty: 0, movePenalty: 0 },
  Reinforced: { id: 'Reinforced', name: 'Reinforced Plates', description: 'Up-armored plates (Ablative layers)', socketMult: 1.0, spMult: 1.5, dcMod: 6, mobilityPenalty: -1, movePenalty: -5 },
  Bulwark: { id: 'Bulwark', name: 'Bulwark Heavy Layering', description: 'Excessive layering (Maximum protection)', socketMult: 0.8, spMult: 2.0, dcMod: 10, mobilityPenalty: -2, movePenalty: -10 }
};

export const ARMOR_MATERIALS = {
  0: { tl: 0, name: 'Hide & Bone', era: 'Stone Age', drPercent: 25, spMult: 0.25, passive: 'Degrading: Breaks easily under sustained stress' },
  1: { tl: 1, name: 'Iron & Steel Plate', era: 'Metal Age', drPercent: 50, spMult: 0.5, passive: 'Heavy: Imposes -1 check penalty' },
  2: { tl: 2, name: 'Kevlar & Ceramic Alloy', era: 'Data Age', drPercent: 75, spMult: 1.0, passive: 'Ballistic Weave: Resists piercing kinetic trauma' },
  3: { tl: 3, name: 'Plasteel & Impact Gel', era: 'Space Age', drPercent: 100, spMult: 1.5, passive: 'Modular: Universal ports; vacuum-ready hermetic seals' },
  4: { tl: 4, name: 'Nanocarbon & Phase-Shift', era: 'Stellar Age', drPercent: 125, spMult: 2.0, passive: 'Self-Repairing: Regenerates 1 SP/hour' },
  5: { tl: 5, name: 'Polymatter & Hard-Light', era: 'Galactic Age', drPercent: 150, spMult: 2.5, passive: 'Morphic / Weightless: Instant reconfiguration, 0 bulk' }
};

export const ARMOR_MODULES = [
  { id: 'ablative_foam', name: 'Ablative Foam', sockets: 1, tl: 3, dcMod: 5, effect: 'Emergency deployment: Restores 10 SP or seals breach (single use)' },
  { id: 'auto_injector', name: 'Auto-Injector', sockets: 1, tl: 3, dcMod: 5, effect: 'Stabilizes wearer if Health < 0. Holds 2 doses' },
  { id: 'biometric_lock', name: 'Biometric Lock', sockets: 0, tl: 4, dcMod: 5, effect: 'Armor locks rigid if worn by unauthorized user (DC 25 Hack)' },
  { id: 'cloaking', name: 'Cloaking Camouflage', sockets: 2, tl: 4, dcMod: 10, effect: 'Visual Invisibility: +10 Stealth (Move) / +20 (Still)' },
  { id: 'comm_suite', name: 'Comm Suite / Tactical HUD', sockets: 0, tl: 3, dcMod: 5, effect: 'Integrated audio/visual radios and tactical HUD link' },
  { id: 'enviro_field', name: 'Enviro-Field Emitter', sockets: 2, tl: 3, dcMod: 10, effect: 'Projects 20ft radius environmental weather shielding' },
  { id: 'enviro_seal', name: 'Enviro-Seal Gaskets', sockets: 2, tl: 3, dcMod: 5, effect: 'Hermetic seal: Immunity to toxic gas and vacuum' },
  { id: 'exo_servos_1', name: 'Exo-Servos (+2 STR)', sockets: 1, tl: 3, dcMod: 5, effect: '+2 Strength while powered' },
  { id: 'exo_servos_2', name: 'Exo-Servos (+4 STR)', sockets: 2, tl: 3, dcMod: 10, effect: '+4 Strength while powered' },
  { id: 'exo_servos_3', name: 'Exo-Servos (+6 STR)', sockets: 3, tl: 4, dcMod: 15, effect: '+6 Strength while powered' },
  { id: 'expert_software', name: 'Expert Combat Software', sockets: 1, tl: 3, dcMod: 10, effect: '+2 Bonus to tactical skill checks' },
  { id: 'flight_pack', name: 'Flight Thruster Pack', sockets: 2, tl: 3, dcMod: 10, effect: 'True Flight: Speed = Base Speed x2' },
  { id: 'grav_attenuator', name: 'Grav-Attenuator', sockets: 1, tl: 5, dcMod: 10, effect: 'Advantage on climbing/traversal by dampening local gravity' },
  { id: 'grav_chute', name: 'Grav-Chute', sockets: 1, tl: 4, dcMod: 5, effect: 'Inertial dampener: Negates all falling damage' },
  { id: 'hardened_circuits', name: 'Hardened Circuits', sockets: 1, tl: 3, dcMod: 5, effect: 'Immune to EMP, Ion disruption, and scanner pinging' },
  { id: 'holo_distortion', name: 'Holo-Distortion Blur', sockets: 1, tl: 4, dcMod: 10, effect: 'Ranged attacks against wearer suffer 20% miss chance' },
  { id: 'picotech_canister', name: 'Picotech Canister', sockets: 1, tl: 4, dcMod: 15, effect: 'Programmable Matter reshapes into any simple tool (DC 25)' },
  { id: 'portable_nurse', name: 'Portable Nurse Unit', sockets: 1, tl: 3, dcMod: 5, effect: '+2 Medicine check bonus and auto-stabilization' },
  { id: 'shield_generator', name: 'Personal Shield Generator', sockets: 2, tl: 4, dcMod: 10, effect: 'Projects 20 Ablative Points (AP) buffer (Recharges 5 AP/rnd)' }
];

export const CARRIED_SHIELDS = {
  Buckler: { id: 'Buckler', name: 'Buckler', blockBonus: 1, weight: 2, dcMod: 6, sockets: 1, note: 'Leaves hand partially free' },
  Small: { id: 'Small', name: 'Small Shield', blockBonus: 1, weight: 3, dcMod: 5, sockets: 1, note: 'Light melee defense' },
  Large: { id: 'Large', name: 'Large Shield', blockBonus: 2, weight: 6, dcMod: 7, sockets: 3, note: 'Standard heavy infantry' },
  Riot: { id: 'Riot', name: 'Riot Shield', blockBonus: 3, weight: 5, dcMod: 10, sockets: 4, note: 'Provides Full Cover when set' },
  Projected: { id: 'Projected', name: 'Projected Energy Shield', blockBonus: 2, weight: 1, dcMod: 16, sockets: 1, note: 'Bracer holds socket; hard light barrier' }
};

// ═══════════════════════════════════════════════════════════
// MANUFACTURER CULTURAL SKINS (CROSS-MATRIX)
// ═══════════════════════════════════════════════════════════

export const MANUFACTURER_SKINS = {
  Syndicate: { id: 'Syndicate', name: 'The Syndicate', title: 'Corporate Futurism', aesthetic: 'Matte white composites, brushed aluminum, cyan holographics', trait: 'Integrated System (+2 Knowledge: Computers/Tech/Language)', dcMod: 0 },
  Impyrium: { id: 'Impyrium', name: 'The Impyrium', title: 'Heirloom Industrial', aesthetic: 'Celestial Neo-Sumerian brutalism, gold filigree, polished marble', trait: 'Archeotech (+2 DR, +2 Hardness, Relic Sockets only)', dcMod: 0 },
  Dracon: { id: 'Dracon', name: 'The Dracon Dynasty', title: 'Feudal Protection', aesthetic: 'High-Fantasy Industrial, dragon scale motifs, castle silhouettes', trait: 'Bulwark (+20% SP, +1 inherent DR, favors kinetic/thermal)', dcMod: 0 },
  Ascendancy: { id: 'Ascendancy', name: 'The Ascendancy', title: 'Enlightened Innovation', aesthetic: 'Smart City Solarpunk, clean curves, glass canopies, white hulls', trait: 'Adaptive Progress (Precision, agility, native non-lethal modes)', dcMod: 0 },
  Coalition: { id: 'Coalition', name: 'The Coalition & Outworlds', title: 'Scrappy Industrial', aesthetic: 'Space Western Noir, scavenged parts, exposed wiring, hazard stripes', trait: 'Jury-Rigged (-5 DC discount; breaks or deals 1d4 fire on natural 1)', dcMod: -5 },
  Alterian: { id: 'Alterian', name: 'The Alterian Enclave', title: 'Botanical Engineering', aesthetic: 'Interstellar Art Nouveau, white ceramic fused with living wood', trait: 'Photosynthesis (Recharges in sunlight) & Naturalist (+2 Nature/Survival)', dcMod: 0 },
  Auluran: { id: 'Auluran', name: 'The Auluran', title: 'Symbiotic Growth', aesthetic: 'Bioluminescent Jungle, chitinous hulls, vascular corridors', trait: 'Regeneration (Heals 2 SP/round) & Symbiosis (1 Karma adapt hazard)', dcMod: 0 },
  Mekan: { id: 'Mekan', name: 'The Mekan', title: 'Mechanical Perfection', aesthetic: 'Fractal Perfection, geometric liquid metal, magnetic suspension', trait: 'Integrated Tools (TL5 Polymatter free-action morph; +2 Vocation)', dcMod: 0 },
  Entari: { id: 'Entari', name: 'The Entari Combine', title: 'Cosmopolitan Trade', aesthetic: 'Galactic Senate luxury eco-finish, nanoweave, silent operation', trait: 'Ethical Efficiency (Concealed weaponry until drawn; 1-hr socket swaps)', dcMod: 0 },
  Thorn: { id: 'Thorn', name: 'The Thorn', title: 'Primal Growth', aesthetic: 'Bark-plate, vine-wrapped tech, glowing chlorophyll veins', trait: 'Rooted (+2 vs Trip/Bull Rush) & Camouflage (+2 Wilderness Stealth)', dcMod: 0 },
  Kitin: { id: 'Kitin', name: 'The Kitin', title: 'Hive-Resin', aesthetic: 'Hive-resin composites, organic structures, green vein-piping', trait: 'Hive-Link (Telepathic integration) & Lightweight (-1 armor weight category)', dcMod: 0 }
};

// ═══════════════════════════════════════════════════════════
// AUGMENTATIONS MATRIX CONSTANTS (PLAN 20)
// ═══════════════════════════════════════════════════════════

export const AUGMENTATION_STAGES = {
  negligible: {
    id: 'negligible',
    tier: 0,
    name: 'Negligible',
    badge: 'Baseline / Low-Invasive',
    color: 'slate',
    bpCredit: 0,
    prerequisites: 'None',
    staminaRequired: 0,
    tlRequired: 0,
    description: 'None, very minor options, prosthetics with no enhancements and certain other low-invasive modifications or options.',
    benefit: 'Compatible with baseline, cosmetic, and unenhanced prosthetics without invasive surgical penalties.',
    special: 'No BP credit. Non-invasive baseline options only.',
    featureName: null,
    featureId: null
  },
  augmented: {
    id: 'augmented',
    tier: 1,
    name: 'Augmented',
    badge: 'Standard Augmentations',
    color: 'cyan',
    bpCredit: 6,
    prerequisites: 'Available Technology Level (TL 3+)',
    staminaRequired: 0,
    tlRequired: 3,
    description: 'The character has undergone invasive surgery to replace or enhance biological systems with cybernetics, biotechnology, or magical prosthetics.',
    benefit: 'You are compatible with Standard Augmentations.',
    special: 'Upon taking this feature, you gain a "credit" of 6 Build Points (BP) worth of Augmentations effectively for free (representing the initial suite of upgrades). Any cost beyond this must be paid with BP or Credits.',
    featureName: 'Augmented',
    featureId: 'special-augmented'
  },
  heavy: {
    id: 'heavy',
    tier: 2,
    name: 'Heavy Augmentations',
    badge: 'Heavy / Industrial Grade',
    color: 'amber',
    bpCredit: 12,
    additionalBpCredit: 6,
    prerequisites: 'Augmented, Stamina 2',
    staminaRequired: 2,
    tlRequired: 3,
    description: 'The character has replaced significant portions of their body with industrial or military-grade hardware. These modifications are often bulky, obvious, and not designed for social integration.',
    benefit: 'You may install Heavy class Augmentations (which often have higher DR or Strength bonuses but may impose social penalties). You gain an additional 6 BP worth of Augmentations.',
    special: 'Gain an additional 6 BP worth of Augmentations (12 BP total credit). Compatible with Heavy class hardware.',
    featureName: 'Heavy Augmentations',
    featureId: 'special-heavy-augmentations'
  },
  extreme: {
    id: 'extreme',
    tier: 3,
    name: 'Extreme Augmentations',
    badge: 'Full Body Conversion',
    color: 'rose',
    bpCredit: 18,
    additionalBpCredit: 6,
    prerequisites: 'Heavy Augmentations, Stamina 4',
    staminaRequired: 4,
    tlRequired: 3,
    description: 'The character is more machine (or bio-construct) than original being. They have replaced the majority of biological functions.',
    benefit: 'You may undergo Full Body Conversion. You may install systems that alter your Size category or basic physiology (e.g., tank treads instead of legs). You gain an additional 6 BP worth of Augmentations.',
    special: 'Gain an additional 6 BP worth of Augmentations (18 BP total credit). Full Body Conversion (FBC) and structural physiology changes permitted.',
    featureName: 'Extreme Augmentations',
    featureId: 'special-extreme-augmentations'
  }
};

export const ANATOMICAL_BODY_SLOTS = {
  Head: { id: 'Head', name: 'Head / Cranium', maxNodes: 10, maxSockets: 1, baseSP: 20, isHardened: true, description: 'Neural systems, sensory implants, cranium plating' },
  Torso: { id: 'Torso', name: 'Torso / Core', maxNodes: 50, maxSockets: 5, baseSP: 100, isHardened: true, description: 'Cardiopulmonary, organs, dermal armor, core chassis' },
  LeftArm: { id: 'LeftArm', name: 'Left Arm', maxNodes: 30, maxSockets: 3, baseSP: 30, isHardened: false, description: 'Hand, forearm, shoulder servos, weapon mounts' },
  RightArm: { id: 'RightArm', name: 'Right Arm', maxNodes: 30, maxSockets: 3, baseSP: 30, isHardened: false, description: 'Hand, forearm, shoulder servos, weapon mounts' },
  LeftLeg: { id: 'LeftLeg', name: 'Left Leg', maxNodes: 40, maxSockets: 4, baseSP: 40, isHardened: false, description: 'Foot, thigh, hydraulic jump boosters, speed servomotors' },
  RightLeg: { id: 'RightLeg', name: 'Right Leg', maxNodes: 40, maxSockets: 4, baseSP: 40, isHardened: false, description: 'Foot, thigh, hydraulic jump boosters, speed servomotors' },
  Systemic: { id: 'Systemic', name: 'Full Body / Systemic', maxNodes: 200, maxSockets: 20, baseSP: 260, isHardened: false, description: 'Full body conversion, vascular/dermal nano-colonies' }
};

export const AUGMENTATION_CATEGORIES = {
  fashionware: { id: 'fashionware', name: 'Fashionware & Utilities', defaultBP: 0, defaultNodes: 0, tl: 3, description: 'Civilian baseline mods (Skinwatch, ID chip, Holo-Tattoos)' },
  synth_limb: { id: 'synth_limb', name: 'Prosthetic & Synth Limbs', defaultBP: 0, defaultNodes: 15, tl: 3, description: 'Full or sectional limb replacements' },
  hand_foot: { id: 'hand_foot', name: 'Hand & Foot Options', defaultBP: 1, defaultNodes: 2, tl: 3, description: 'Blade fists, shock knuckles, prehensile feet, grapplers' },
  limb_upgrade: { id: 'limb_upgrade', name: 'Limb Upgrades', defaultBP: 1, defaultNodes: 3, tl: 3, description: 'Armor plating, hydraulic rams, jump boosters, micro-missiles' },
  exotic_limb: { id: 'exotic_limb', name: 'Exotic Limbs (TL4)', defaultBP: 2, defaultNodes: 15, tl: 4, description: 'Synth tentacles, digitigrade legs, insectoid limbs, wings' },
  body_mod: { id: 'body_mod', name: 'Body Modifications', defaultBP: 2, defaultNodes: 5, tl: 3, description: 'Dermal armor, redundant organs, gills, muscle weave' },
  sensory: { id: 'sensory', name: 'Sensory Modifications', defaultBP: 2, defaultNodes: 2, tl: 3, description: 'Nightvision, radar/sonar, teleoptics, bug detectors' },
  brain: { id: 'brain', name: 'Brain & Neural Mods', defaultBP: 2, defaultNodes: 2, tl: 3, description: 'Neural processors, ghost jacks, skill circuitry, reflex co-processors' },
  tl4_bioware: { id: 'tl4_bioware', name: 'TL4 Enhanced (Bioware)', defaultBP: 2, defaultNodes: 5, tl: 4, description: 'Immune to Massive Damage disablement; regenerates 1 SP/hour' },
  tl5_nanotech: { id: 'tl5_nanotech', name: 'TL5 Advanced (Nanotech)', defaultBP: 1, defaultNodes: 3, tl: 5, description: 'Half BP cost (min 1); Morphic/Weightless reality-warping augs' },
  fbc: { id: 'fbc', name: 'Full Body Conversion (FBC)', defaultBP: 10, defaultNodes: 200, tl: 3, description: 'Total synthetic chassis conversion (200 Nodes, 260 SP)' },
  pseudo: { id: 'pseudo', name: 'Pseudo-Cybernetics (Wearable)', defaultBP: 0, defaultNodes: 10, tl: 3, description: 'External harnesses/gauntlets hosting internal node mods' },
  meta_aug: { id: 'meta_aug', name: 'Metaphysical Augmentation', defaultBP: 2, defaultNodes: 10, tl: 4, description: 'Imbued tattoos, psi-crystals, cyber-occult neural sockets' }
};

export const FBC_PACKAGES = {
  Civilian: { id: 'Civilian', name: 'Civilian Shell (Light)', bpCost: 10, credits: 100000, totalSP: 260, dr: 10, nodes: 200, sockets: 20, baseDC: 40, description: 'Standard humanoid aesthetic, basic daily utility and light protection' },
  IndustrialCombat: { id: 'IndustrialCombat', name: 'Industrial / Combat (Heavy)', bpCost: 10, credits: 250000, totalSP: 260, dr: 40, nodes: 200, sockets: 20, baseDC: 45, description: 'Reinforced ballistic chassis, shock plating, industrial myomer muscles' },
  MekanApex: { id: 'MekanApex', name: 'Mekan Apex (Powered TL5)', bpCost: 5, credits: 1000000, totalSP: 260, dr: 120, nodes: 200, sockets: 20, baseDC: 60, description: 'Polymatter liquid metal frame, hard-light projection, ultimate defense' }
};

export const STIGMA_LEVELS_DETAILED = {
  None: { level: 'None', minMods: 0, maxMods: 0, penalty: 0, label: 'Unmodified / Baseline', description: 'No noticeable technological or biological modification' },
  Minor: { level: 'Minor', minMods: 1, maxMods: 3, penalty: -2, label: 'Minor Stigma (-2 Social)', description: 'Visible chrome or minor biological alterations noticeable on inspection' },
  Moderate: { level: 'Moderate', minMods: 4, maxMods: 6, penalty: -4, label: 'Moderate Stigma (-4 Social)', description: 'Extensively augmented; restricted from Naturalist zones and bio-sanctuaries' },
  Severe: { level: 'Severe', minMods: 7, maxMods: Infinity, penalty: -8, label: 'Severe Stigma (-8 Social / FBC)', description: 'Treated as an inorganic object, military hardware, or severe xenoform' }
};
