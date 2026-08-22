// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — SHARED SYSTEM CONSTANTS & LOOKUP TABLES
// Single source of truth for calculations, matrices, and DBM
// ═══════════════════════════════════════════════════════════

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
  { id: 'improvised', name: 'Tier 0 — Improvised', multiplier: 1, description: 'Bare hands, stone tools' },
  { id: 'basic', name: 'Tier 1 — Basic', multiplier: 10, description: 'Handheld tools, garage kit' },
  { id: 'advanced', name: 'Tier 2 — Advanced', multiplier: 50, description: 'Professional shop, alchemist lab' },
  { id: 'industrial', name: 'Tier 3 — Industrial', multiplier: 200, description: 'Automated factory, magical circle' },
  { id: 'nanoforge', name: 'Tier 4 — Nanoforge', multiplier: 1000, description: 'Molecular assemblers, swarm fab' },
  { id: 'bioCultivation', name: 'Bio — Cultivation', multiplier: 1000, description: 'Hyper-growth vats (Medicine + Eng)' },
  { id: 'genesis', name: 'Tier 5 — Genesis', multiplier: 5000, description: 'Polymatter loom, holophotonics' }
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
// ARCHITECTURE MATRIX CONSTANTS (PLAN 22)
// ═══════════════════════════════════════════════════════════

export const ARCHITECTURE_FOOTPRINTS = {
  Miniscule: { id: 'Miniscule', name: 'Miniscule', dimensions: '< 0.5 x 0.5 ft', sqFt: 0.25, baseModules: 0.001, baseSP: 1, baseDC: 2, example: 'Micro-Sensor, Beacon Node' },
  Fine: { id: 'Fine', name: 'Fine', dimensions: '0.5 x 0.5 ft', sqFt: 0.25, baseModules: 0.002, baseSP: 2, baseDC: 5, example: 'Comm-Relay, Security Pylon' },
  Diminutive: { id: 'Diminutive', name: 'Diminutive', dimensions: '1 x 1 ft', sqFt: 1, baseModules: 0.005, baseSP: 5, baseDC: 8, example: 'Light Fixture, Junction Box' },
  Tiny: { id: 'Tiny', name: 'Tiny', dimensions: '2 x 2 ft', sqFt: 4, baseModules: 0.01, baseSP: 10, baseDC: 10, example: 'Terminal Post, Signage Node' },
  Small: { id: 'Small', name: 'Small', dimensions: '5 x 5 ft', sqFt: 25, baseModules: 0.06, baseSP: 25, baseDC: 12, example: 'Kiosk, ATM, Automated Sentry Turret' },
  Medium: { id: 'Medium', name: 'Medium', dimensions: '10 x 10 ft', sqFt: 100, baseModules: 0.25, baseSP: 50, baseDC: 15, example: 'Shed, Guard Booth, Tiny Micro-Hab' },
  Large: { id: 'Large', name: 'Large', dimensions: '20 x 20 ft', sqFt: 400, baseModules: 1, baseSP: 100, baseDC: 18, example: 'Garage, Outpost Hab, Cabin, Workshop' },
  Huge: { id: 'Huge', name: 'Huge', dimensions: '40 x 40 ft', sqFt: 1600, baseModules: 4, baseSP: 250, baseDC: 22, example: 'House, Field Laboratory, Barracks, Depot' },
  Gargantuan: { id: 'Gargantuan', name: 'Gargantuan', dimensions: '80 x 80 ft', sqFt: 6400, baseModules: 16, baseSP: 800, baseDC: 28, example: 'Mansion, Logistics Warehouse, Fortress Keep' },
  Colossal: { id: 'Colossal', name: 'Colossal', dimensions: '200 x 200 ft', sqFt: 40000, baseModules: 100, baseSP: 2500, baseDC: 35, example: 'Factory, City Block, Defense Bastion' },
  Enormous: { id: 'Enormous', name: 'Enormous', dimensions: '500 x 500 ft', sqFt: 250000, baseModules: 625, baseSP: 10000, baseDC: 45, example: 'Mega-Complex, Planetary Starport, Refinery' },
  Titanic: { id: 'Titanic', name: 'Titanic', dimensions: '2,000 x 2,000 ft', sqFt: 4000000, baseModules: 10000, baseSP: 50000, baseDC: 60, example: 'Arcology Base, Sector Hub, Fleet Citadel' },
  SuperGargantuan: { id: 'SuperGargantuan', name: 'Super Gargantuan', dimensions: '1 Mile x 1 Mile', sqFt: 27000000, baseModules: 69000, baseSP: 100000, baseDC: 70, example: 'Capital Orbital Shipyard, Hive City Core' },
  MegaColossal: { id: 'MegaColossal', name: 'Mega Colossal', dimensions: 'Miles (Orbital Plate)', sqFt: 100000000, baseModules: 100000, baseSP: 200000, baseDC: 80, example: 'Orbital Ring Segment, Dyson Plate, Megacity' }
};

export const HEIGHT_CLASSES = {
  Single: { id: 'Single', name: 'Single Story', stories: 1, craftMod: 0, label: 'Single Story (1 Flr)', description: 'Ranch, shed, single floor facility' },
  Duplex: { id: 'Duplex', name: 'Duplex (2 Stories)', stories: 2, craftMod: 2, label: 'Duplex (2 Flrs)', description: '2-story house, townhouse, split-level' },
  MultiStory: { id: 'MultiStory', name: 'Multi-Story (3–5 Stories)', stories: 4, craftMod: 4, label: 'Multi-Story (4 Flrs)', description: 'Apartment block, commercial office building' },
  MidRise: { id: 'MidRise', name: 'Mid-Rise (6–12 Stories)', stories: 8, craftMod: 8, label: 'Mid-Rise (8 Flrs)', description: 'Corporate HQ, luxury hotel, institutional facility' },
  HighRise: { id: 'HighRise', name: 'High-Rise (13–40 Stories)', stories: 20, craftMod: 12, label: 'High-Rise (20 Flrs)', description: 'Urban tower, residential high-rise complex' },
  Skyscraper: { id: 'Skyscraper', name: 'Skyscraper (40+ Stories)', stories: 50, craftMod: 16, label: 'Skyscraper (50 Flrs)', description: 'Mega-tower, hyper-spire, arcology spine' }
};

export const ARCHITECTURE_MATERIALS = {
  0: { tl: 0, name: 'Wood, Stone & Hide', dr: 5, spMult: 0.5, dcMod: -10, passive: 'Degrading: Breaks easily under sustained structural stress' },
  1: { tl: 1, name: 'Brick & Iron-Beam Framing', dr: 10, spMult: 0.75, dcMod: -5, passive: 'Industrial: Heavy masonry and coal/steam power lines' },
  2: { tl: 2, name: 'Steel-Reinforced Concrete & Glass', dr: 15, spMult: 1.0, dcMod: -2, passive: 'Ballistic: Structural rebar and resilient foundation' },
  3: { tl: 3, name: 'Plasteel & Duranium Composite', dr: 20, spMult: 2.0, dcMod: 0, passive: 'Modular: Universal utility conduits, hermetic seals standard' },
  4: { tl: 4, name: 'Nanocarbon & Smart-Fabrics', dr: 30, spMult: 3.0, dcMod: 5, passive: 'Self-Repairing: Structure regenerates 1 SP/hour' },
  5: { tl: 5, name: 'Polymatter & Hard-Light Emitters', dr: 50, spMult: 5.0, dcMod: 10, passive: 'Morphic / Weightless: Instant reconfiguration and dimensional space folding' }
};

export const ENVIRONMENTAL_MODIFIERS = {
  Standard: { id: 'Standard', name: 'Standard Terrestrial (1.0G)', dcMod: 0, costMult: 1.0, description: 'Standard atmospheric pressure and gravity' },
  LowGravity: { id: 'LowGravity', name: 'Low Gravity (<0.8G)', dcMod: -2, costMult: 1.0, description: 'Taller and lighter architecture; verticality DC penalty halved' },
  HighGravity: { id: 'HighGravity', name: 'High Gravity (>1.5G)', dcMod: 5, costMult: 1.0, description: 'Reinforced foundation required; verticality DC penalty doubled' },
  VacuumToxic: { id: 'VacuumToxic', name: 'Vacuum / Corrosive Atmosphere', dcMod: 0, costMult: 1.2, description: 'Requires airlocks and hermetic sealing (+20% cost; free at TL3+)' },
  AquaticPressure: { id: 'AquaticPressure', name: 'Sub-Aquatic Pressure Hull', dcMod: 5, costMult: 1.5, description: 'Heavy deep-sea pressure containment (+5 DC, +50% cost)' }
};

export const SPECIALIZED_MODULE_CATALOG = [
  { id: 'living_quarters', name: 'Standard Living Quarters', category: 'Residential', modules: 1, dc: 15, description: 'Habitation space for 4–8 occupants' },
  { id: 'luxury_suite', name: 'Executive Luxury Suite', category: 'Residential', modules: 2, dc: 20, description: 'High-end quarters with panoramic viewing and private amenities' },
  { id: 'cryo_stasis', name: 'Cryo-Stasis Chamber', category: 'Residential', modules: 2, dc: 25, description: 'Suspended animation berths for 20 crew' },
  { id: 'trade_bazaar', name: 'Commercial Trade Bazaar', category: 'Commercial', modules: 4, dc: 18, description: 'Merchant stalls, exchange terminals, and transaction booths' },
  { id: 'hydroponics', name: 'Hydroponics & Algae Farm', category: 'Commercial', modules: 2, dc: 15, description: 'Sustains food and oxygen for 50 inhabitants' },
  { id: 'entertainment_hub', name: 'Entertainment Holo-Lounge', category: 'Commercial', modules: 4, dc: 22, description: 'SimStim parlor, recreation arena, and social lounge' },
  { id: 'power_fusion', name: 'Heavy Fusion Power Grid', category: 'Industrial', modules: 4, dc: 25, description: 'Megawatt power generator capable of powering district' },
  { id: 'power_antimatter', name: 'Antimatter Reactor Core', category: 'Industrial', modules: 6, dc: 30, description: 'Gigawatt output for planetary shields and heavy industry' },
  { id: 'nanoforge_foundry', name: 'Industrial Nanoforge Foundry', category: 'Industrial', modules: 4, dc: 35, description: 'Automated molecular manufacturing plant' },
  { id: 'refinery_mineral', name: 'Mineral & Isotope Refinery', category: 'Industrial', modules: 8, dc: 22, description: 'Processes raw ore and radioactive isotopes' },
  { id: 'tactical_armory', name: 'Fortified Tactical Armory', category: 'Military', modules: 2, dc: 20, description: 'Secure weapons storage, ammo cache, and loadout benches' },
  { id: 'shield_generator_core', name: 'Structural Shield Generator', category: 'Military', modules: 2, dc: 28, description: 'Projects 100 AP energy barrier over structure' },
  { id: 'turret_battery', name: 'Automated Defense Turret (10 Mounts)', category: 'Military', modules: 1, dc: 25, description: 'External hardpoint cluster with automated fire control' },
  { id: 'security_brig', name: 'Security Matrix & Detention Brig', category: 'Military', modules: 2, dc: 22, description: 'Hardened energy containment cells and guard post' },
  { id: 'command_cic', name: 'Command & Control CIC', category: 'Military', modules: 2, dc: 25, description: 'Tactical holographic battle map and fleet comms array' },
  { id: 'medbay_intensive', name: 'Intensive Trauma Med-Bay', category: 'Scientific', modules: 2, dc: 20, description: 'Surgical theaters, bio-beds, and trauma injectors' },
  { id: 'genetics_lab', name: 'Genetics & Xenobiology Lab', category: 'Scientific', modules: 4, dc: 25, description: 'Gene splicing vats and organic culture incubators' },
  { id: 'quantum_core', name: 'Quantum Mainframe Core', category: 'Scientific', modules: 2, dc: 30, description: 'Supercomputer running planetary mesh and AI sub-minds' },
  { id: 'holodeck_chamber', name: 'Holodeck Tactical Simulator', category: 'Scientific', modules: 2, dc: 35, description: 'Hard-light holographic training and simulation environment' },
  { id: 'hangar_bay', name: 'Vehicle & Mecha Hangar Bay', category: 'Transport', modules: 4, dc: 18, description: 'Maintenance berths for 4 Medium or 2 Large mecha/crafts' },
  { id: 'launch_gantry', name: 'Orbital Launch Gantry', category: 'Transport', modules: 10, dc: 25, description: 'Vertical launch rail and catapult for shuttlecraft' },
  { id: 'docking_ring', name: 'Universal Airlock Docking Ring', category: 'Transport', modules: 2, dc: 15, description: 'Pressurized umbilical for starship docking' },
  { id: 'teleport_chamber', name: 'Quantum Teleportation Chamber', category: 'Meta-Tech', modules: 2, dc: 35, description: 'Spatial displacement pad for instant transit up to 500 miles' }
];

// ═══════════════════════════════════════════════════════════
// SPECIES MATRIX CONSTANTS (PLAN 23)
// ═══════════════════════════════════════════════════════════

export const SPECIES_BUDGET_LEVELS = {
  Standard: { id: 'Standard', name: 'Standard Species (10–20 BP)', minBP: 10, maxBP: 20, description: 'Humans, Elves, and baseline sentient races' },
  Advanced: { id: 'Advanced', name: 'Advanced Species (25–40 BP)', minBP: 25, maxBP: 40, description: 'Dragonkin, High-Tier Synthetics, and genetically engineered species' },
  Monster: { id: 'Monster', name: 'Monster / NPC Species (40+ BP)', minBP: 40, maxBP: 100, description: 'Dragons, Incorporeal Entities, and Progenitor beings' }
};

export const SPECIES_TYPES = {
  Humanoid: { id: 'Humanoid', name: 'Humanoid', bp: 0, senses: 'Standard', traits: 'None', physiology: 'Breathes, eats, and sleeps' },
  Aberration: { id: 'Aberration', name: 'Aberration', bp: 1, senses: 'Darkvision 60ft [1]', traits: 'Alien mindset', physiology: 'Eats, sleeps, and breathes' },
  Beast: { id: 'Beast', name: 'Beast', bp: 1, senses: 'Low-light vision [1]', traits: 'Animal instincts', physiology: 'Eats, sleeps, and breathes' },
  Fey: { id: 'Fey', name: 'Fey', bp: 3, senses: 'Low-light vision [1]', traits: 'Sleepless [2]', physiology: 'Breathes and eats' },
  Planar: { id: 'Planar', name: 'Planar', bp: 4, senses: 'Darkvision 60ft [1]', traits: 'Planar Origin [3]', physiology: 'Breathes, eats, and sleeps' },
  Dragon: { id: 'Dragon', name: 'Dragon', bp: 5, senses: 'Darkvision 60ft [1], Low-light vision [1]', traits: 'Immunity to magical sleep & paralysis [3]', physiology: 'Breathes, eats, and sleeps' },
  Mythical: { id: 'Mythical', name: 'Mythical', bp: 5, senses: 'Darkvision 60ft [1], Low-light vision [1]', traits: 'Non-breathing [3]', physiology: 'Does not eat, sleep, or breathe' },
  Ooze: { id: 'Ooze', name: 'Ooze', bp: 6, senses: 'Blindsight 30ft', traits: 'Amorphous [3], Fortification (Immune to crits/flank) [3]', physiology: 'Semi-solid form' },
  Verdant: { id: 'Verdant', name: 'Verdant (Plant)', bp: 9, senses: 'Low-light vision [1]', traits: 'Mental Immunity [3], Physical Immunity [3], Sleepless [2]', physiology: 'Breathes and eats, does not sleep' },
  Elemental: { id: 'Elemental', name: 'Elemental', bp: 13, senses: 'Darkvision 60ft [1]', traits: 'Immunities (Poison, sleep, stun) [6], Fortification [3], Non-living [3]', physiology: 'Does not eat, sleep, or breathe' },
  Synthetic: { id: 'Synthetic', bp: 15, name: 'Synthetic / Construct', senses: 'Low-light vision [1], Darkvision 60ft [1]', traits: 'Mental Immunity [3], Metabolic Immunity [3], Fortitude Immunity [3], Hardened Frame [2], Synthetic Strength [2], Repair Required [-3]', physiology: 'Does not breathe, eat, or sleep' },
  Undead: { id: 'Undead', bp: 20, name: 'Undead', senses: 'Darkvision 60ft [1]', traits: 'Mental Immunity [3], Physical Immunity [3], Metabolic Immunity [3], Fortitude Immunity [3], Negative Energy Affinity [2], Resurrection Limits [2]', physiology: 'Does not breathe, eat, or sleep' },
  Entity: { id: 'Entity', bp: 24, name: 'Incorporeal Entity', senses: 'Darkvision & Ether Sight 60ft [3]', traits: 'Incorporeal [3], Fortification [3], Mind Immunity [3], Metabolic Immunity [3], Planar [3], Physical Immunity [6]', physiology: 'Does not eat, sleep, or breathe' }
};

export const SPECIES_SIZES = {
  Diminutive: { id: 'Diminutive', name: 'Diminutive', bp: 6, strMod: -8, agiMod: 8, combatMod: 8, defMod: 8, stealthMod: 12, stabilityMod: -16, dmgDieStep: -3, speedMod: -10, dimensions: '<1 ft / <1 lb (Rat, Sparrow, Mini-Drone)' },
  Tiny: { id: 'Tiny', name: 'Tiny', bp: 4, strMod: -4, agiMod: 4, combatMod: 4, defMod: 4, stealthMod: 8, stabilityMod: -8, dmgDieStep: -2, speedMod: -10, dimensions: '<2 ft / <8 lbs (House Cat, Hawk, Skateboard)' },
  Small: { id: 'Small', name: 'Small', bp: 2, strMod: -2, agiMod: 2, combatMod: 2, defMod: 2, stealthMod: 4, stabilityMod: -4, dmgDieStep: -1, speedMod: -5, dimensions: '<4 ft / <60 lbs (Chimpanzee, Lynx, Scooter)' },
  Medium: { id: 'Medium', name: 'Medium', bp: 0, strMod: 0, agiMod: 0, combatMod: 0, defMod: 0, stealthMod: 0, stabilityMod: 0, dmgDieStep: 0, speedMod: 0, dimensions: '4-8 ft / 60-500 lbs (Human, Rottweiler, Motorcycle)' },
  Large: { id: 'Large', name: 'Large', bp: 2, strMod: 2, agiMod: -2, combatMod: -2, defMod: -2, stealthMod: -4, stabilityMod: 4, dmgDiceMult: 2, speedMult: 2, dimensions: '>8 ft / >500 lbs (Horse, Lion, Small Car)' },
  Huge: { id: 'Huge', name: 'Huge', bp: 4, strMod: 4, agiMod: -4, combatMod: -4, defMod: -4, stealthMod: -8, stabilityMod: 8, dmgDiceMult: 5, speedMult: 5, dimensions: '>16 ft / >4,000 lbs (Elephant, Rhinoceros, Delivery Truck)' }
};

export const SPECIES_MOVEMENT_MODES = [
  { id: 'normal', name: 'Normal Ground Speed (30 ft)', bp: 0, speed: 30, description: 'Base speed of 30 feet' },
  { id: 'fast', name: 'Fast (+10 ft)', bp: 2, speed: 40, description: 'Base speed 40 feet (+10 ft)' },
  { id: 'very_fast', name: 'Very Fast (+20 ft)', bp: 4, speed: 50, description: 'Base speed 50 feet (+20 ft)' },
  { id: 'slow', name: 'Slow (-10 ft)', bp: -2, speed: 20, description: 'Base speed 20 feet (Grants +2 BP)' },
  { id: 'ponderous', name: 'Ponderous (-20 ft)', bp: -4, speed: 10, description: 'Base speed 10 feet (Grants +4 BP)' },
  { id: 'climber', name: 'Climber (Climb 30 ft)', bp: 2, speed: 30, description: 'Climb speed 30 ft, +5 racial bonus on climbing' },
  { id: 'gliding', name: 'Gliding Wings', bp: 1, speed: 30, description: '5ft horizontal per 1ft fall, glide speed 30ft/rnd' },
  { id: 'leaper', name: 'Leaper', bp: 1, speed: 0, description: 'Always treated as running start for Jump checks' },
  { id: 'mountaineer', name: 'Mountaineer', bp: 1, speed: 0, description: 'Immune to altitude sickness, no defense loss on narrow surfaces' },
  { id: 'sprinter', name: 'Sprinter', bp: 1, speed: 10, description: '+10 ft bonus speed when running' },
  { id: 'swim', name: 'Swim (Swim 30 ft)', bp: 2, speed: 30, description: 'Swim speed 30 ft, +5 racial bonus on Swim checks' },
  { id: 'terrain_movement', name: 'Terrain Movement', bp: 1, speed: 0, description: 'Ignore naturally difficult terrain of specific type' },
  { id: 'burrow', name: 'Burrow (Burrow 20 ft)', bp: 2, speed: 20, description: 'Base burrow speed 20 ft' },
  { id: 'flight_basic', name: 'Basic Flight (Fly 30 ft)', bp: 2, speed: 30, description: 'Fly speed 30 ft (Poor maneuverability)' },
  { id: 'flight_improved', name: 'Improved Flight Speed (+10 ft)', bp: 1, speed: 10, description: 'Increases fly speed by 10 ft' },
  { id: 'flight_maneuver', name: 'Improved Maneuverability', bp: 1, speed: 0, description: 'Improves fly maneuverability by 1 step' },
  { id: 'strong_flyer', name: 'Strong Flyer', bp: 2, speed: 0, description: 'Increases size multiplier for fly speed' },
  { id: 'hauler', name: 'Hauler', bp: 1, speed: 0, description: 'Not encumbered by carrying heavy load' },
  { id: 'marcher', name: 'Marcher', bp: 1, speed: 0, description: 'Fatigued 1/2 when moving at regular pace' }
];

export const SPECIES_TRAITS_BASIC = [
  { id: 'adapted', name: 'Adapted', bp: 1, type: 'Physical', description: 'No penalties or damage from one set environment type' },
  { id: 'alter_form_basic', name: 'Alter Form (Basic)', bp: 1, type: 'Physical', description: 'Change appearance only (+5 Disguise)' },
  { id: 'amphibious', name: 'Amphibious', bp: 1, type: 'Physical', description: 'Breathe air and water equally well, +10 Swim Speed' },
  { id: 'bonded_terrain', name: 'Bonded Terrain', bp: 1, type: 'Defensive', description: '+2 dodge bonus to AC when in specific terrain type' },
  { id: 'bonus_feature', name: 'Bonus Feature', bp: 1, type: 'Trained', description: 'Select one extra feature of choice' },
  { id: 'camouflage', name: 'Camouflage', bp: 1, type: 'Physical', description: '+4 bonus on Stealth checks in favored terrain' },
  { id: 'cats_luck', name: 'Cat\'s Luck', bp: 1, type: 'Defensive', description: 'Once per Long Rest make Reflex Check at Advantage' },
  { id: 'cave_dweller', name: 'Cave Dweller', bp: 1, type: 'Trained', description: '+4 bonus on Survival checks underground' },
  { id: 'craftsman', name: 'Craftsman', bp: 1, type: 'Trained', description: '+2 to specific Vocation skill' },
  { id: 'digitigrade', name: 'Digitigrade / Ungulated', bp: 1, type: 'Movement', description: '+10 Movement Speed and +4 Stability' },
  { id: 'draconic', name: 'Draconic', bp: 1, type: 'Physical', description: 'Access to purchase various Dragon traits' },
  { id: 'emissary', name: 'Emissary', bp: 1, type: 'Social', description: '1/day check at advantage for Bluff or Diplomacy' },
  { id: 'exoskeleton_partial', name: 'Exoskeleton (Partial)', bp: 1, type: 'Physical', description: 'DR (Str + 2) x2: Str 2, Leathery or Scaled' },
  { id: 'focused_study', name: 'Focused Study', bp: 1, type: 'Trained', description: 'Gain Skill Focus in skill of choice' },
  { id: 'frenzy', name: 'Frenzy', bp: 1, type: 'Physical', description: '1/day on damage fly into frenzy (+2 Con/Str, -2 AC)' },
  { id: 'greedy_eye', name: 'Greedy Eye', bp: 1, type: 'Trained', description: '+4 bonus on all Appraise checks' },
  { id: 'hardy', name: 'Hardy', bp: 1, type: 'Defensive', description: '+2 bonus on saving throws vs poison, spells, psi' },
  { id: 'healthy', name: 'Healthy', bp: 1, type: 'Defensive', description: '+4 bonus on Fortitude saves vs disease and poison' },
  { id: 'integrated', name: 'Integrated', bp: 1, type: 'Social', description: '+1 on Bluff, Disguise, and Knowledge (local)' },
  { id: 'low_light_vision', name: 'Low Light Vision', bp: 1, type: 'Sensory', description: 'See twice as well in low light, spectrum vision' },
  { id: 'lucky_lesser', name: 'Lucky (Lesser)', bp: 1, type: 'Defensive', description: '+1 racial bonus on all saving throws' },
  { id: 'natural_armor', name: 'Natural Armor', bp: 1, type: 'Defensive', description: '+2 natural armor bonus' },
  { id: 'patagia', name: 'Patagia', bp: 1, type: 'Physical', description: 'Gliding speed of 2x Ground speed' },
  { id: 'reach', name: 'Reach', bp: 1, type: 'Physical', description: 'Melee reach of 10 feet' },
  { id: 'reduced_sustenance', name: 'Reduced Sustenance', bp: 1, type: 'Physical', description: 'Eat and drink half typical amount' },
  { id: 'relentless', name: 'Relentless', bp: 1, type: 'Physical', description: '+2 bonus on combat maneuver checks (Bull Rush/Overrun)' },
  { id: 'runner', name: 'Runner', bp: 1, type: 'Movement', description: '+4 bonus on saves vs fatigue/exhaustion from running' },
  { id: 'scent', name: 'Scent', bp: 1, type: 'Physical', description: 'Identify by smell, +4 to Track and Medical Diagnosis' },
  { id: 'shadow_affinity', name: 'Shadow Affinity', bp: 1, type: 'Meta', description: '+5 to Stealth when in shadowy or dim areas' },
  { id: 'shadow_blending', name: 'Shadow Blending', bp: 1, type: 'Meta', description: 'Attacks made against member in dim light have 30% miss chance' },
  { id: 'shards_of_the_past', name: 'Shards of the Past', bp: 1, type: 'Meta', description: 'Pick two skills; gain +2 racial bonus on both' },
  { id: 'silent_hunter', name: 'Silent Hunter', bp: 1, type: 'Movement', description: 'Reduce Stealth penalty for moving by 5' },
  { id: 'silver_tongued', name: 'Silver Tongued', bp: 1, type: 'Social', description: '+2 bonus on Diplomacy and Bluff' },
  { id: 'skill_bonus', name: 'Skill Bonus', bp: 1, type: 'Trained', description: '+2 racial bonus to divide amongst noted skills' },
  { id: 'sneaky', name: 'Sneaky', bp: 1, type: 'Trained', description: '+2 racial bonus on Stealth checks' },
  { id: 'sociable', name: 'Sociable', bp: 1, type: 'Social', description: 'Try failed Diplomacy attitude check again within 24 hrs' },
  { id: 'stable_footed', name: 'Stable Footed', bp: 1, type: 'Defensive', description: '+4 racial Stability bonus on ground' },
  { id: 'stalker', name: 'Stalker', bp: 1, type: 'Trained', description: '+2 bonus to Perception and Stealth vs one target' },
  { id: 'static_bonus_feat', name: 'Static Bonus Feat', bp: 1, type: 'Trained', description: 'Gain one feat with no prerequisites as bonus feat' },
  { id: 'tail', name: 'Tail', bp: 1, type: 'Physical', description: '+2 to Trip and Balance checks, usable as a club' },
  { id: 'urbanite', name: 'Urbanite', bp: 1, type: 'Social', description: '+2 racial bonus on Diplomacy and Sense Motive' },
  { id: 'water_sense', name: 'Water-Sense', bp: 1, type: 'Sensory', description: 'Blindsense 30ft vs creatures touching same water' }
];

export const SPECIES_TRAITS_ADVANCED = [
  { id: 'adaptive_features', name: 'Adaptive Features', bp: 2, type: 'Physical', description: 'Change between specific features during Light Rest' },
  { id: 'adaptive_skill_set', name: 'Adaptive Skill Set', bp: 2, type: 'Trained', description: '4 point bonus allotted in a pool' },
  { id: 'additional_limbs', name: 'Additional Limbs', bp: 2, type: 'Physical', description: 'Another pair of prehensile limbs (Arms/Tentacles)' },
  { id: 'ageless', name: 'Ageless', bp: 2, type: 'Physical', description: 'No penalties or visual signs of aging' },
  { id: 'all_around_vision', name: 'All-Around Vision', bp: 2, type: 'Sensory', description: '+4 on Perception checks, immune to flanking' },
  { id: 'alter_form_adv', name: 'Alter Form (Advanced)', bp: 2, type: 'Physical', description: 'Change appearance (+5 Disguise), gender, minor traits' },
  { id: 'alternate_form', name: 'Alternate Form', bp: 2, type: 'Physical', description: 'An additional natural form' },
  { id: 'aquatic', name: 'Aquatic', bp: 2, type: 'Movement', description: '+4 on Swim checks, may take 10 on swimming' },
  { id: 'aquatic_strength', name: 'Aquatic Strength', bp: 2, type: 'Physical', description: '+1 size category for Combat/Str checks in water' },
  { id: 'autotroph', name: 'Autotroph', bp: 2, type: 'Physical', description: 'Does not require food/drink; photosynthesizes/absorbs energy' },
  { id: 'blind_sense', name: 'Blind Sense', bp: 2, type: 'Sensory', description: 'Sense unseen objects in 30ft radius or 60ft cone' },
  { id: 'bodyform_armor', name: 'Bodyform Armor', bp: 2, type: 'Physical', description: 'Shapechange to gain protective layer (+4 DR)' },
  { id: 'chameleon', name: 'Chameleon', bp: 2, type: 'Physical', description: '+5 Stealth or take 10 on Stealth checks' },
  { id: 'chloroplast', name: 'Chloroplast', bp: 2, type: 'Physical', description: 'Double healing rate while in sunlight' },
  { id: 'constriction', name: 'Constriction', bp: 2, type: 'Physical', description: 'Improved Grapple, crushing damage 2x Unarmed' },
  { id: 'curiosity', name: 'Curiosity', bp: 2, type: 'Trained', description: '+4 on Diplomacy to gather info and Knowledge checks' },
  { id: 'dark_sight', name: 'Dark Sight', bp: 2, type: 'Sensory', description: 'Clear vision in all light/darkness (UV, luminescence)' },
  { id: 'defensive_training', name: 'Defensive Training', bp: 2, type: 'Defensive', description: '+2 dodge bonus to Defense' },
  { id: 'dragon_might', name: 'Dragon Might', bp: 2, type: 'Physical', description: 'Lift and grapple as if 1 size category larger' },
  { id: 'dragon_mind', name: 'Dragon Mind', bp: 2, type: 'Physical', description: 'Mental Resistance checks made with Advantage' },
  { id: 'energy_resist', name: 'Energy Resistance', bp: 2, type: 'Physical', description: 'DR 10 vs chosen energy type (Pyro/Cryo/Sonic/Voltic)' },
  { id: 'exoskeleton_light', name: 'Exoskeleton (Light)', bp: 2, type: 'Physical', description: 'DR (Str + 2) x3: Str 3, Heavy Scales or Plating' },
  { id: 'fast_heal', name: 'Fast Heal', bp: 2, type: 'Physical', description: 'Daily recovery of Health/Vitality during Light Rest' },
  { id: 'fey_affinity', name: 'Fey Affinity', bp: 2, type: 'Meta', description: 'Animals treat character as Trusting & Friendly' },
  { id: 'hive_connection', name: 'Hive Connection', bp: 2, type: 'Meta', description: 'Mentally share information across hive members' },
  { id: 'mind_speech', name: 'Mind Speech (Telepathy)', bp: 2, type: 'Meta', description: 'Telepathic communication to one subject in 500 ft' },
  { id: 'natural_weapons', name: 'Natural Weapons', bp: 2, type: 'Combat', description: 'Claw, Fang, Horn, or Tail attack (1d6 damage)' },
  { id: 'powerful_charge', name: 'Powerful Charge', bp: 2, type: 'Combat', description: 'Charge deals 2x damage dice + 1.5x Str bonus' },
  { id: 'prehensile_tail', name: 'Prehensile Tail', bp: 2, type: 'Physical', description: '+2 Climb/Balance, usable as off-hand' },
  { id: 'quadruped', name: 'Quadruped', bp: 2, type: 'Movement', description: 'Four legged, +4 Stability, +10 movement speed' },
  { id: 'quick_reactions', name: 'Quick Reactions', bp: 2, type: 'Physical', description: 'Use double Agility score for base Initiative' },
  { id: 'resistant', name: 'Resistant', bp: 2, type: 'Defensive', description: '+2 saves vs mind-affecting and poison' },
  { id: 'sleepless', name: 'Sleepless', bp: 2, type: 'Physical', description: 'Does not require sleep; rest regains metaphysical energy' },
  { id: 'thermal_sight', name: 'Thermal Sight', bp: 2, type: 'Sensory', description: 'See IR heat patterns, track warm targets in dark' },
  { id: 'venom', name: 'Venom', bp: 2, type: 'Physical', description: 'Hemotoxic (Str/Sta) or Neurotoxic (Agi/Sensory) toxin' }
];

export const SPECIES_TRAITS_ELITE = [
  { id: 'blind_sight', name: 'Blind Sight', bp: 4, type: 'Sensory', description: 'Accurately target unseen objects in 30ft radius / 60ft cone' },
  { id: 'dragon_breath', name: 'Dragon Breath Weapon', bp: 4, type: 'Meta', description: '30ft cone or 60ft line of energy (Str x d8 damage)' },
  { id: 'dragon_wings', name: 'Dragon Wings', bp: 4, type: 'Movement', description: 'Leathery wings: Fly speed = 3x Ground speed' },
  { id: 'energy_immunity', name: 'Energy Immunity', bp: 4, type: 'Physical', description: 'Completely immune to specific energy damage type' },
  { id: 'ether_sight', name: 'Ether Sight', bp: 4, type: 'Meta', description: 'See invisible, phased, and bioluminescence auras' },
  { id: 'exoskeleton_heavy', name: 'Exoskeleton (Heavy)', bp: 4, type: 'Physical', description: 'DR (Str + 2) x4: Str 4, Heavy Plating or Shell' },
  { id: 'flight_true', name: 'True Flight', bp: 4, type: 'Movement', description: 'Fly speed = 2x Ground speed with Average Maneuverability' },
  { id: 'hexapedal', name: 'Hexapedal', bp: 4, type: 'Movement', description: 'Six legged, +8 Stability, +20 movement speed' },
  { id: 'immortal', name: 'Immortal', bp: 4, type: 'Meta', description: 'Cannot die of natural causes or age, immune to disease/poison' },
  { id: 'regeneration', name: 'Regeneration', bp: 4, type: 'Physical', description: 'Regenerates lost limbs and organs with health recovery' },
  { id: 'semi_corporeal', name: 'Semi-Corporeal', bp: 4, type: 'Meta', description: 'DR 30 vs physical, phase through solid matter at will' },
  { id: 'synthetic_tech_assim', name: 'Synthetic Tech Assimilation', bp: 4, type: 'Physical', description: 'Absorb, power, and use technological devices natively' },
  { id: 'vampiric_power', name: 'Vampiric Power', bp: 4, type: 'Meta', description: 'Gain physical ability point per 2 Sta drained' }
];

export const SPECIES_DISADVANTAGES = [
  { id: 'armless', name: 'Armless', refundBP: 4, description: 'Without arms or primary manipulators (-4 BP)' },
  { id: 'elemental_vulnerability', name: 'Elemental Vulnerability', refundBP: 4, description: '+2 damage per die from Acid, Cold, Electricity, or Fire (-4 BP)' },
  { id: 'light_blindness', name: 'Light Blindness', refundBP: 4, description: 'Abrupt bright light blinds 1 round, then dazzled (-4 BP)' },
  { id: 'light_sensitivity', name: 'Light Sensitivity', refundBP: 2, description: 'Dazzled in bright sunlight (-2 BP)' },
  { id: 'negative_energy_affinity', name: 'Negative Energy Affinity', refundBP: 4, description: 'Alive, but harmed by positive/healed by negative energy (-4 BP)' },
  { id: 'sunlight_powerlessness', name: 'Sunlight Powerlessness', refundBP: 6, description: 'Staggered/Helpless in direct sunlight (-6 BP)' },
  { id: 'vulnerable_to_sunlight', name: 'Vulnerable to Sunlight', refundBP: 4, description: 'Take 1 Con damage per hour in sunlight (-4 BP)' }
];

// ═══════════════════════════════════════════════════════════
// MODULAR CHARACTER MATRIX CONSTANTS (PLAN 24)
// ═══════════════════════════════════════════════════════════

export const THREAT_TIER_CHASSIS = {
  0: { tier: 0, narrativeRank: 'Civilian / Minion', attrBonus: 0, primarySkill: 5, secondarySkill: 3, actions: 1, vitHeaBonus: 0, dr: 0, bp: '< 50 BP' },
  1: { tier: 1, narrativeRank: 'Adept', attrBonus: 0, primarySkill: 6, secondarySkill: 3, actions: 2, vitHeaBonus: 5, dr: 2, bp: '50 BP' },
  2: { tier: 2, narrativeRank: 'Militia', attrBonus: 1, primarySkill: 7, secondarySkill: 4, actions: 2, vitHeaBonus: 10, dr: 5, bp: '75 BP' },
  3: { tier: 3, narrativeRank: 'Trooper', attrBonus: 1, primarySkill: 8, secondarySkill: 4, actions: 2, vitHeaBonus: 15, dr: 8, bp: '100 BP' },
  4: { tier: 4, narrativeRank: 'Standard', attrBonus: 2, primarySkill: 9, secondarySkill: 5, actions: 2, vitHeaBonus: 20, dr: 10, bp: '125 BP' },
  5: { tier: 5, narrativeRank: 'Professional', attrBonus: 2, primarySkill: 10, secondarySkill: 5, actions: 2, vitHeaBonus: 25, dr: 12, bp: '150 BP' },
  6: { tier: 6, narrativeRank: 'Veteran', attrBonus: 3, primarySkill: 11, secondarySkill: 6, actions: 3, vitHeaBonus: 30, dr: 15, bp: '175 BP' },
  7: { tier: 7, narrativeRank: 'Specialist', attrBonus: 3, primarySkill: 12, secondarySkill: 7, actions: 3, vitHeaBonus: 35, dr: 18, bp: '200 BP' },
  8: { tier: 8, narrativeRank: 'Elite', attrBonus: 4, primarySkill: 13, secondarySkill: 8, actions: 3, vitHeaBonus: 40, dr: 20, bp: '225 BP' },
  9: { tier: 9, narrativeRank: 'Operative', attrBonus: 4, primarySkill: 14, secondarySkill: 9, actions: 3, vitHeaBonus: 45, dr: 22, bp: '250 BP' },
  10: { tier: 10, narrativeRank: 'Champion', attrBonus: 5, primarySkill: 16, secondarySkill: 11, actions: 4, vitHeaBonus: 50, dr: 25, bp: '275 BP' },
  11: { tier: 11, narrativeRank: 'Warlord', attrBonus: 5, primarySkill: 17, secondarySkill: 12, actions: 4, vitHeaBonus: 55, dr: 28, bp: '300 BP' },
  12: { tier: 12, narrativeRank: 'Commander', attrBonus: 6, primarySkill: 18, secondarySkill: 13, actions: 4, vitHeaBonus: 60, dr: 30, bp: '325 BP' },
  13: { tier: 13, narrativeRank: 'General', attrBonus: 6, primarySkill: 19, secondarySkill: 14, actions: 4, vitHeaBonus: 65, dr: 32, bp: '350 BP' },
  14: { tier: 14, narrativeRank: 'Paragon', attrBonus: 7, primarySkill: 21, secondarySkill: 16, actions: 5, vitHeaBonus: 70, dr: 35, bp: '375 BP' },
  15: { tier: 15, narrativeRank: 'High Lord', attrBonus: 7, primarySkill: 22, secondarySkill: 17, actions: 5, vitHeaBonus: 75, dr: 38, bp: '400 BP' },
  16: { tier: 16, narrativeRank: 'Heroic', attrBonus: 8, primarySkill: 23, secondarySkill: 18, actions: 5, vitHeaBonus: 80, dr: 40, bp: '425 BP' },
  17: { tier: 17, narrativeRank: 'Legend', attrBonus: 8, primarySkill: 24, secondarySkill: 19, actions: 5, vitHeaBonus: 85, dr: 42, bp: '450 BP' },
  18: { tier: 18, narrativeRank: 'Ascendant', attrBonus: 9, primarySkill: 26, secondarySkill: 21, actions: 6, vitHeaBonus: 90, dr: 45, bp: '475 BP' },
  19: { tier: 19, narrativeRank: 'Demigod', attrBonus: 9, primarySkill: 28, secondarySkill: 23, actions: 6, vitHeaBonus: 95, dr: 48, bp: '500 BP' },
  20: { tier: 20, narrativeRank: 'Cosmic / Mythic', attrBonus: 10, primarySkill: 30, secondarySkill: 26, actions: 6, vitHeaBonus: 100, dr: 50, bp: '525 BP' }
};

export const COMPETENCY_ROLES = {
  Tank: { id: 'Tank', name: 'The Tank (Frontline Vanguard)', group: 'Combat', primaryAttrs: ['Stamina', 'Strength'], keySkills: ['Defense', 'Intimidate', 'Athletics'], feature: 'Guard (Intercept attacks meant for allies)', description: 'Impenetrable vanguard holding vitals and absorbing heavy trauma' },
  Brute: { id: 'Brute', name: 'The Brute (Heavy Assault)', group: 'Combat', primaryAttrs: ['Strength', 'Stamina'], keySkills: ['Melee Combat', 'Athletics'], feature: 'Rage (Take damage to deal +2 damage)', description: 'Raw kinetic force to shatter defensive lines in close quarters' },
  MeleeDPS: { id: 'MeleeDPS', name: 'Melee DPS (Close Striker)', group: 'Combat', primaryAttrs: ['Agility', 'Strength'], keySkills: ['Melee Combat', 'Acrobatics', 'Evasion'], feature: 'Sneak Attack (+1d6 damage on advantage)', description: 'High precision close-quarters executioner weaving through defenses' },
  RangedDPS: { id: 'RangedDPS', name: 'Ranged DPS (Fire Support)', group: 'Combat', primaryAttrs: ['Agility', 'Precision'], keySkills: ['Ranged Combat', 'Alertness'], feature: 'Burst Attack (Reduces auto-fire penalty)', description: 'Sustained suppressive and lethal mid-range fire' },
  Sniper: { id: 'Sniper', name: 'The Sniper (Long-Range Assassin)', group: 'Combat', primaryAttrs: ['Precision', 'Agility'], keySkills: ['Ranged Combat', 'Stealth', 'Alertness'], feature: 'Sniper (Ignore cover penalties)', description: 'Surgical elimination of high-value targets from extreme distance' },
  MobilitySpecialist: { id: 'MobilitySpecialist', name: 'Mobility Specialist (Skirmisher)', group: 'Combat', primaryAttrs: ['Agility', 'Stamina'], keySkills: ['Acrobatics', 'Piloting', 'Athletics'], feature: 'Nimble Moves (Ignore difficult terrain)', description: 'Master of traversal exploiting gaps in enemy formations' },
  Flank: { id: 'Flank', name: 'The Flank (Asymmetric Striker)', group: 'Combat', primaryAttrs: ['Agility', 'Precision'], keySkills: ['Stealth', 'Melee Combat', 'Evasion'], feature: 'Hit & Run (Move without provoking reactions)', description: 'Collapses defensive lines from flank using hit-and-run tactics' },
  CombativeMetaUser: { id: 'CombativeMetaUser', name: 'Combative Meta-User (Reality Warper)', group: 'Metaphysics', primaryAttrs: ['Intellect', 'Wisdom'], keySkills: ['Attune', 'Discipline'], feature: 'Awakened (Access to Invocations)', description: 'Esoteric artillery providing area denial and bypassing physical armor' },
  Buffer: { id: 'Buffer', name: 'The Buffer (Squad Enhancer)', group: 'Support', primaryAttrs: ['Charisma', 'Wisdom'], keySkills: ['Diplomacy', 'Attune'], feature: 'Aura of Command (+1 Hit/Save in 30ft)', description: 'Elevates cohesion and resilience of allies through projected auras' },
  Leader: { id: 'Leader', name: 'The Leader (Tactical Commander)', group: 'Support', primaryAttrs: ['Intellect', 'Charisma'], keySkills: ['Tactics', 'Leadership', 'Insight'], feature: 'Master Plan (Bonus pool via planning)', description: 'Coordinates complex maneuvers to turn chaotic skirmishes into methodical victories' },
  Debuffer: { id: 'Debuffer', name: 'The Debuffer (Saboteur)', group: 'Controller', primaryAttrs: ['Wisdom', 'Intellect'], keySkills: ['Intimidate', 'Discipline'], feature: 'Suppressing Fire / Analyze Weakness', description: 'Systematically neutralizes enemy advantages through status conditions' },
  Technician: { id: 'Technician', name: 'The Technician (Electronic Warfare)', group: 'Controller', primaryAttrs: ['Intellect', 'Agility'], keySkills: ['Computers', 'Engineering', 'Mechanics'], feature: 'Jamming / Hack (Disable tech)', description: 'Controls digital/mechanical battlefield, hacking security and jamming comms' }
};

export const DESIGNATIONS = {
  Adversary: { id: 'Adversary', name: 'Adversary (Enemy)', description: 'Built to actively oppose players using full combat mechanics' },
  Ally: { id: 'Ally', name: 'Ally (Independent)', description: 'Aids players autonomously on own initiative with full tier scaling' },
  Companion: { id: 'Companion', name: 'Companion (Player-Bound)', description: 'Bound directly to player character via 40 BP budget system' },
  Neutral: { id: 'Neutral', name: 'Neutral (Civilian / Bystander)', description: 'Managed via narrative block; full health pool with untrained combat triggers' }
};

export const BOSS_TYPES = {
  Standard: { id: 'Standard', name: 'Standard Unit (1x Health)', multiplier: 1, description: 'Standard health pool, regular action economy' },
  Minion: { id: 'Minion', name: 'Minion (1 HP Rule)', multiplier: 0, isMinion: true, description: '1 HP Rule: Incapacitated if any damage bypasses DR' },
  Boss: { id: 'Boss', name: 'Boss (2x Health + Legendary Resilience)', multiplier: 2, isBoss: true, description: '2x Vitality & Health, Legendary Resilience (1-3 saves/day), Lair Actions' },
  Mastermind: { id: 'Mastermind', name: 'Mastermind (3x Health + Plot Armor)', multiplier: 3, isMastermind: true, description: '3x to 5x Vitality & Health, Plot Armor escape mechanics, macro-scale influence' }
};

export const TACTICAL_BEHAVIORS = [
  'Aggressive Rush',
  'Defensive Anchor',
  'Sniping from Cover',
  'Flank and Encircle',
  'Hit-and-Run Skirmish',
  'Pack Tactics Swarm',
  'Suppressive Fire Laydown',
  'Electronic Jamming & Sabotage',
  'Metaphysical Area Denial',
  'Buff & Command Coordination',
  'Strategic Retreat on 50% HP'
];

// ═══════════════════════════════════════════════════════════
// COMPANION MATRIX CONSTANTS (PLAN 25)
// ═══════════════════════════════════════════════════════════

export const COMPANION_TYPES = {
  Biological: { id: 'Biological', name: 'Biological (Beast / Xeno / Plant)', integrityType: 'Vitality + Health', recovery: 'Natural Healing / Medicine Skill', fuel: 'Food / Water / Sunlight', description: 'Living creature; full Vitality and Health pools' },
  Synthetic: { id: 'Synthetic', name: 'Synthetic (Drone / Automaton / Cyber-Pet)', integrityType: 'Structure Points (SP = Health x 1.5)', recovery: 'Repair / Engineering Skill', fuel: 'Energy Cells / Power Core', description: 'Mechanical unit; no Vitality, immune to poison, disease, fatigue' },
  Metaphysical: { id: 'Metaphysical', name: 'Metaphysical (Spirit / Elemental / Familiar)', integrityType: 'Essence (Health)', recovery: 'Attune check / Master Essence Donation', fuel: 'Master\'s Essence / Ambient Magic', description: 'Ethereal entity; discorporates on 0 Essence, re-summoned with Karma' }
};

export const COMPANION_FORM_PACKAGES = [
  { id: 'canine', name: 'Canine / War Hound', type: 'Biological', size: 'Medium', baseBP: 10, bonusFeatures: ['Natural Weapons (Teeth 1d6)', 'Scent', 'Trip Attack', 'Runner'], stats: { str: 2, agi: 1, sta: 1, int: -1, wis: 1, cha: 0 } },
  { id: 'feline', name: 'Feline / Shadow Stalker', type: 'Biological', size: 'Small', baseBP: 10, bonusFeatures: ['Natural Weapons (Claws 1d4)', 'Low-Light Vision', 'Sneaky (+2 Stealth)', 'Cat\'s Luck'], stats: { str: 0, agi: 3, sta: 0, int: -1, wis: 1, cha: 0 } },
  { id: 'avian', name: 'Avian / Sky Hunter', type: 'Biological', size: 'Tiny', baseBP: 12, bonusFeatures: ['Flight (Fly 40ft)', 'Keen Senses (+2 Alertness)', 'Natural Weapons (Talons 1d4)'], stats: { str: -2, agi: 3, sta: 0, int: -1, wis: 2, cha: 0 } },
  { id: 'reptilian', name: 'Reptilian / Armored Monitor', type: 'Biological', size: 'Medium', baseBP: 10, bonusFeatures: ['Natural Armor (+2 DR)', 'Swim (30ft)', 'Hardy', 'Natural Weapons (Bite 1d6)'], stats: { str: 2, agi: 0, sta: 2, int: -2, wis: 0, cha: 0 } },
  { id: 'insectoid', name: 'Insectoid / Chitin Swarmer', type: 'Biological', size: 'Small', baseBP: 10, bonusFeatures: ['Exoskeleton (+3 DR)', 'Climber (30ft)', 'Darkvision 60ft', 'Venom'], stats: { str: 1, agi: 2, sta: 1, int: -3, wis: 0, cha: 0 } },
  { id: 'recon_drone', name: 'Recon Drone (Quad-Rotor)', type: 'Synthetic', size: 'Tiny', baseBP: 12, bonusFeatures: ['Flight (Hover/Prop 40ft)', 'Thermal Optics', 'Audio/Video Sensor Link', 'Silent Operation'], stats: { str: -3, agi: 3, sta: 0, int: 0, wis: 2, cha: -3 } },
  { id: 'security_bot', name: 'Security Automaton (Biped)', type: 'Synthetic', size: 'Medium', baseBP: 10, bonusFeatures: ['Armor Plating (DR 5)', 'Integrated Stun Taser', 'Hardened Logic', 'Guard Protocol'], stats: { str: 3, agi: 0, sta: 2, int: 0, wis: 0, cha: -2 } },
  { id: 'combat_drone', name: 'Combat Gun-Drone (Hover)', type: 'Synthetic', size: 'Small', baseBP: 12, bonusFeatures: ['Repulsor Hover (30ft)', 'Weapon Hardpoint (1 Socket)', 'Targeting Computer (+1 Atk)', 'Energy Shield (10 AP)'], stats: { str: 0, agi: 2, sta: 1, int: 0, wis: 1, cha: -3 } },
  { id: 'elemental_spirit', name: 'Elemental Wisp / Familiar', type: 'Metaphysical', size: 'Tiny', baseBP: 12, bonusFeatures: ['Incorporeal Movement', 'Energy Bolt (1d6)', 'Darkvision & Ether Sight', 'Empathic Bond'], stats: { str: -4, agi: 2, sta: 0, int: 1, wis: 2, cha: 1 } },
  { id: 'riding_mount', name: 'Heavy Riding Mount', type: 'Biological', size: 'Large', baseBP: 10, bonusFeatures: ['Fast Movement (+10ft)', 'Hauler', 'Powerful Charge', 'Mount Hardpoint (1 Mount)'], stats: { str: 4, agi: 0, sta: 3, int: -2, wis: 0, cha: 0 } }
];

export const COMPANION_FUNCTION_PACKAGES = [
  { id: 'guardian_attack', name: 'Guardian / Attack Focus', bpCost: 8, keySkills: ['Unarmed Combat (5)', 'Intimidate (3)', 'Athletics (4)'], bonusAtk: 2, bonusDR: 2 },
  { id: 'scout_recon', name: 'Scout / Recon Focus', bpCost: 8, keySkills: ['Stealth (5)', 'Alertness (5)', 'Survival (4)'], bonusStealth: 4, bonusAwareness: 3 },
  { id: 'utility_interface', name: 'Utility & Tool Interface', bpCost: 8, keySkills: ['Computers (4)', 'Engineering (4)', 'Search (4)'], bonusTech: 2 },
  { id: 'medical_injector', name: 'Medical & Trauma Support', bpCost: 8, keySkills: ['Medicine (5)', 'First Aid (5)'], bonusMed: 3 },
  { id: 'hacking_warfare', name: 'Hacking & EW Infiltrator', bpCost: 8, keySkills: ['Computers (5)', 'Disable Device (4)'], bonusHack: 3 },
  { id: 'stealth_assassin', name: 'Stealth & Ambush', bpCost: 8, keySkills: ['Stealth (6)', 'Evasion (4)', 'Melee Combat (3)'], bonusAmbush: 3 },
  { id: 'mount_transport', name: 'Mount & Heavy Transport', bpCost: 6, keySkills: ['Athletics (5)', 'Survival (4)'], bonusCapacity: 'Heavy Load' }
];

export const COMPANION_CONTROL_INTERFACES = [
  { id: 'voice_gesture', name: 'Direct Voice / Gestural (Move Action)', range: '50 ft (Voice/Sight)', description: 'Issues physical order using a Move Action' },
  { id: 'mind_link', name: 'Mind Link / Telepathic (Free Action)', range: '1 Mile', description: 'Direct telepathic tether; commands are Free Actions' },
  { id: 'data_tether', name: 'Data-Tether / Cyberdeck (Free Action)', range: '5 Miles / Mesh Grid', description: 'Encrypted tactical Wi-Fi mesh link for drones' },
  { id: 'autonomous', name: 'Autonomous Routine (No Action)', range: 'Unlimited', description: 'Executes standing behavioral algorithms independently' }
];

export const COMPANION_BOND_FEATURES = [
  { id: 'familiar_link', name: 'Familiar (Empathic Link)', bpCost: 2, effect: 'Know companion distance, direction, and emotional status anywhere on planet' },
  { id: 'mind_link', name: 'Mind Link (Telepathic)', bpCost: 3, effect: 'Silent telepathic communication; share highest Knowledge skill rank' },
  { id: 'shared_senses', name: 'Shared Senses', bpCost: 3, effect: 'See and hear through companion senses as standard action' },
  { id: 'loyal_protector', name: 'Loyal Protector (Interception)', bpCost: 3, effect: 'Adjacent companion takes hits meant for master as a reaction' }
];

// ═══════════════════════════════════════════════════════════
// INVOCATION MATRIX CONSTANTS (PLAN 26)
// ═══════════════════════════════════════════════════════════

export const INVOCATION_DISCIPLINES = [
  { id: 'telekinesis', name: 'Telekinesis', parent: 'Force / Kinetic', type: 'Attack / Utility', description: 'Manipulate physical matter, project kinetic blasts, create force shields' },
  { id: 'telepathy', name: 'Telepathy', parent: 'Mental / Consciousness', type: 'Sensory / Control', description: 'Read thoughts, transmit mental speech, mental compulsions, memory alteration' },
  { id: 'clairvoyance', name: 'Clairvoyance / Precognition', parent: 'Mental / Sense', type: 'Sensory', description: 'Remote scrying, danger sense, predictive combat positioning' },
  { id: 'pyrokinesis', name: 'Pyrokinesis', parent: 'Energy / Thermal', type: 'Attack', description: 'Thermal excitation, plasma arcs, superheated fire waves' },
  { id: 'chronos', name: 'Chronos-Distortion', parent: 'Dimension / Temporal', type: 'Utility / Control', description: 'Accelerate self, slow enemies, localized temporal stasis' },
  { id: 'biometabolism', name: 'Biometabolism', parent: 'Matter / Biological', type: 'Defense / Healing', description: 'Accelerated tissue repair, adrenaline surge, toxin purging, shapeshifting' },
  { id: 'void_attunement', name: 'Void-Attunement', parent: 'Entropy / Dark Energy', type: 'Attack / Control', description: 'Gravity wells, phasing incorporeal, matter dissolution, vacuum siphons' },
  { id: 'elemental_cryo', name: 'Cryokinesis', parent: 'Energy / Thermal', type: 'Attack / Control', description: 'Thermal drain, sub-zero flash freezing, ice barrier projection' },
  { id: 'elemental_voltic', name: 'Electrokinesis', parent: 'Energy / Electromagnetic', type: 'Attack', description: 'Lightning bolts, EMP disruption, electronic circuit overriding' },
  { id: 'dimension_space', name: 'Spatial Distortion (Phase/Gate)', parent: 'Dimension / Spatial', type: 'Movement', description: 'Short-range blinking, long-range wormholes, planar phasing' }
];

export const INVOCATION_BASE_DIFFICULTIES = {
  Simple: { id: 'Simple', name: 'Simple (DC 10)', dc: 10, example: 'Minor sensory effect, lighting candle, cleaning' },
  Standard: { id: 'Standard', name: 'Standard (DC 15)', dc: 15, example: 'Tier 1 combat blast, personal defense shield, basic telepathy' },
  Difficult: { id: 'Difficult', name: 'Difficult (DC 20)', dc: 20, example: 'Complex illusion, telekinesis lifting car, teleportation' },
  Extreme: { id: 'Extreme', name: 'Extreme (DC 25+)', dc: 25, example: 'Reality tearing, resurrecting dead, summoning storm' },
  OpposedFort: { id: 'OpposedFort', name: 'Opposed vs Fortitude (DC 15)', dc: 15, isOpposed: true, targetAttr: 'Stamina', example: 'Bodily transformation, necrosis, life drain' },
  OpposedRef: { id: 'OpposedRef', name: 'Opposed vs Reflex (DC 15)', dc: 15, isOpposed: true, targetAttr: 'Agility', example: 'Entanglement, kinetic grasping, gravity pull' },
  OpposedWill: { id: 'OpposedWill', name: 'Opposed vs Will (DC 15)', dc: 15, isOpposed: true, targetAttr: 'Wisdom', example: 'Mind control, telepathic domination, phantasm' }
};

export const CASTING_TIME_MODIFIERS = {
  Reaction: { id: 'Reaction', name: 'Reaction (+10 DC)', dcMod: 10, description: 'Instant defense or trigger on enemy action' },
  FreeAction: { id: 'FreeAction', name: 'Free Action (+5 DC)', dcMod: 5, description: 'Casting woven seamlessly into movement or speech' },
  MoveAction: { id: 'MoveAction', name: 'Move Action (+2 DC)', dcMod: 2, description: 'Fast casting allowing an attack in same turn' },
  StandardAction: { id: 'StandardAction', name: 'Standard Action (+0 DC)', dcMod: 0, description: 'Baseline action for combat invocations' },
  FullRound: { id: 'FullRound', name: 'Full Round Action (-2 DC)', dcMod: -2, description: 'Takes entire turn; no movement permitted' },
  Ritual: { id: 'Ritual', name: 'Ritual Casting (1 Min+) (-5 DC)', dcMod: -5, description: 'Deep meditation ritual; non-combat utility' }
};

export const INVOCATION_RANGE_MODIFIERS = {
  SelfTouch: { id: 'SelfTouch', name: 'Self / Touch (-2 DC)', dcMod: -2, description: 'Direct contact required or internal bodily effect' },
  Close: { id: 'Close', name: 'Close (25 ft + 5ft/2 Ranks) (+0 DC)', dcMod: 0, description: 'Short tactical combat distance' },
  Medium: { id: 'Medium', name: 'Medium (100 ft + 10ft/Rank) (+2 DC)', dcMod: 2, description: 'Standard mid-range engagement distance' },
  Long: { id: 'Long', name: 'Long (400 ft + 40ft/Rank) (+5 DC)', dcMod: 5, description: 'Extreme sniper / battlefield distance' },
  Sight: { id: 'Sight', name: 'Line of Sight (+10 DC)', dcMod: 10, description: 'Anywhere within visual line of sight' },
  Unlimited: { id: 'Unlimited', name: 'Unlimited / Planar (+15 DC)', dcMod: 15, description: 'Anywhere on the same planet or dimensional plane' }
};

export const INVOCATION_AOE_MODIFIERS = {
  SingleTarget: { id: 'SingleTarget', name: 'Single Target (+0 DC)', dcMod: 0, description: 'One individual creature or object' },
  LineRay: { id: 'LineRay', name: 'Line / Ray (5ft wide) (+0 DC)', dcMod: 0, description: 'Narrow beam projection along line of fire' },
  SmallBurst: { id: 'SmallBurst', name: 'Small Burst (10ft Radius) (+2 DC)', dcMod: 2, description: 'Covers a standard room or vehicle' },
  MediumBurst: { id: 'MediumBurst', name: 'Medium Burst (20ft Radius) (+5 DC)', dcMod: 5, description: 'Covers an entire hall or platoon zone' },
  Cone: { id: 'Cone', name: 'Cone (Emanation) (+5 DC)', dcMod: 5, description: 'Spreads outward from caster hands' },
  LargeBurst: { id: 'LargeBurst', name: 'Large Burst (50ft+ Radius) (+10 DC)', dcMod: 10, description: 'Massive battlefield district detonation' },
  Selective: { id: 'Selective', name: 'Selective Shaping (+5 DC)', dcMod: 5, description: 'Excludes allies from area of effect' }
};

export const INVOCATION_DURATION_MODIFIERS = {
  Instant: { id: 'Instant', name: 'Instantaneous (+0 DC)', dcMod: 0, description: 'Occurs and terminates immediately (Kinetic/Thermal blast)' },
  Concentration: { id: 'Concentration', name: 'Concentration (+0 DC)', dcMod: 0, description: 'Persists as long as caster spends Standard Actions' },
  RoundsPerLevel: { id: 'RoundsPerLevel', name: 'Rounds / Level (+2 DC)', dcMod: 2, description: 'Persists without focus for short combat encounter' },
  MinutesPerLevel: { id: 'MinutesPerLevel', name: 'Minutes / Level (+5 DC)', dcMod: 5, description: 'Persists for entire scene or infiltration operation' },
  HoursPerLevel: { id: 'HoursPerLevel', name: 'Hours / Level (+10 DC)', dcMod: 10, description: 'Long-term environmental shift or day-long buff' },
  Permanent: { id: 'Permanent', name: 'Permanent / Until Dispelled (+20 DC)', dcMod: 20, description: 'Enduring metaphysical construct or curse' }
};

export const INVOCATION_OTHER_MODIFIERS = [
  { id: 'subtle', name: 'Subtle / Silent (+5 DC)', dcMod: 5, description: 'Cast without visual or acoustic telltale signature' },
  { id: 'material_comp', name: 'Consumed Material Component (-2 DC)', dcMod: -2, description: 'Requires physical reagent or catalyst' },
  { id: 'backlash', name: 'Dangerous Backlash (-5 DC)', dcMod: -5, description: 'Failure deals direct Health damage to caster' },
  { id: 'tech_focus', name: 'Technological Focus Tool (-2 DC)', dcMod: -2, description: 'Requires specific focus hardware or psi-amp' }
];

export const SKILL_STAGES = [
  { stage: 1, name: 'Stage 1 — Novice', minRank: 1, maxRank: 5, minDC: 10, maxDC: 14, essenceCost: 0, description: 'Base learned stage: 0 Essence cost (ambient resonance)' },
  { stage: 2, name: 'Stage 2 — Trained', minRank: 6, maxRank: 10, minDC: 15, maxDC: 19, essenceCost: 0, description: 'Competent execution; standard scaling baseline' },
  { stage: 3, name: 'Stage 3 — Expert', minRank: 11, maxRank: 15, minDC: 20, maxDC: 24, essenceCost: 0, description: 'Specialized scaling and secondary tactical triggers' },
  { stage: 4, name: 'Stage 4 — Master', minRank: 16, maxRank: 20, minDC: 25, maxDC: 29, essenceCost: 0, description: 'Grand metaphysical effects with expanded radii' },
  { stage: 5, name: 'Stage 5 — Pinnacle', minRank: 21, maxRank: 30, minDC: 30, maxDC: 99, essenceCost: 0, description: 'Reality warping power; cosmic scale manifestation' }
];

export const INVOCATION_SCALING_FORMULAS = {
  energyDamage: { name: 'Energy Damage', base: '1d6', scaling: '+1d6 per Stage', formula: (s) => `${s}d6` },
  forceDamage: { name: 'Force Damage', base: '1d8', scaling: '+1d8 per Stage', formula: (s) => `${s}d8` },
  healing: { name: 'Healing Pool', base: '1d8', scaling: '+1d8 per Stage', formula: (s) => `${s}d8` },
  staticBonus: { name: 'Static Bonus', base: '+1', scaling: '+1 per Stage', formula: (s) => `+${s}` },
  damageReduction: { name: 'Damage Reduction', base: '2 DR', scaling: '+2 DR per Stage', formula: (s) => `${s * 2} DR` },
  multiTarget: { name: 'Target Count', base: '1 Target', scaling: '+1 Target per Stage', formula: (s) => `${s} Targets` },
  areaSize: { name: 'Area Radius', base: '10 ft', scaling: '+5ft or +50% per Stage', formula: (s) => `${5 + s * 5} ft` }
};

// ═══════════════════════════════════════════════════════════
// META-TECH MATRIX CONSTANTS (PLAN 27)
// ═══════════════════════════════════════════════════════════

export const META_TECH_ENHANCEMENT_TYPES = {
  Passive: { id: 'Passive', name: 'Passive Enhancement', description: 'Always-on matter/energy alteration (DC = Base Item DC + Sockets x 5)' },
  Active: { id: 'Active', name: 'Active Imbuement (Device)', description: 'Hard-coded spell in a device (DC = 15 + Invocation Rank + TL Mod)' },
  Consumable: { id: 'Consumable', name: 'Consumable / Grenade', description: 'Single-use charged item (DC = 15 + Invocation Rank - 10 Consumable Discount)' },
  Amplifier: { id: 'Amplifier', name: 'Symbiotic Amplifier', description: 'Lens multiplying caster own invocations by vehicle/structure scale' }
};

export const META_TECH_PASSIVE_CATALOG = [
  { id: 'energy_sheath', name: 'Energy Sheath', discipline: 'Energy (Elemental)', sockets: 1, dcMod: 5, targetType: 'Weapon', effect: 'Deals +1d6 Energy damage (Pyro/Cryo/Voltic)' },
  { id: 'ghost_strike', name: 'Ghost-Strike', discipline: 'Dimension (Phase)', sockets: 1, dcMod: 5, targetType: 'Weapon', effect: 'Ignores physical DR; only blocked by force fields' },
  { id: 'seeking', name: 'Seeking Micro-Correction', discipline: 'Mental (Sense)', sockets: 1, dcMod: 5, targetType: 'Weapon', effect: '+2 Attack roll bonus via micro-telekinetic nudging' },
  { id: 'vampiric', name: 'Vampiric Drain', discipline: 'Entropy (Chaos)', sockets: 1, dcMod: 5, targetType: 'Weapon', effect: 'On Critical Hit, wielder heals HP equal to 1/2 damage' },
  { id: 'soul_bound', name: 'Soul-Bound', discipline: 'Mental (Projection)', sockets: 1, dcMod: 5, targetType: 'Weapon/Armor', effect: 'Only functions for designated user; immune to disarm' },
  { id: 'featherweight', name: 'Featherweight Weave', discipline: 'Dimension (Gravity)', sockets: 1, dcMod: 5, targetType: 'Armor', effect: 'Armor counts as one weight category lighter' },
  { id: 'chameleon_weave', name: 'Chameleon Shadow Weave', discipline: 'Illusion (Shadow)', sockets: 1, dcMod: 5, targetType: 'Armor', effect: '+4 Stealth while moving, +8 when stationary' },
  { id: 'hardened_logic', name: 'Hardened Logic Lattice', discipline: 'Mental (Shield)', sockets: 1, dcMod: 5, targetType: 'Armor/Deck', effect: 'Advantage on saves vs hacking and psionic intrusion' },
  { id: 'auto_mend', name: 'Auto-Mend Matrix', discipline: 'Matter (Repair)', sockets: 1, dcMod: 5, targetType: 'Armor/Item', effect: 'Item regenerates 1d4 Structure Points (SP) per hour' }
];

export const META_TECH_SCALE_AMPLIFICATION = {
  Personal: { id: 'Personal', name: 'Personal Scale (x1)', multiplier: 1, unit: 'Socket', description: 'Standard individual magic and blast radius' },
  Large: { id: 'Large', name: 'Large Scale (x2)', multiplier: 2, unit: 'Socket', description: 'Ogre-sized magic; fireballs hit like light cannons' },
  Huge: { id: 'Huge', name: 'Vehicle Scale (x5)', multiplier: 5, unit: 'Mount', description: 'Tank-sized magic; telepathy reaches horizon' },
  Gargantuan: { id: 'Gargantuan', name: 'Siege Scale (x10)', multiplier: 10, unit: 'Mount', description: 'Siege magic; earthquakes level city blocks' },
  Titanic: { id: 'Titanic', name: 'Strategic / City Scale (x80)', multiplier: 80, unit: 'Module', description: 'Orbital/city magic; planetary weather control' }
};

export const META_TECH_SOCKET_LIMITS = {
  1: { sockets: 1, maxRank: 10, rankTier: 'Trained Effect (Ranks 1–10)' },
  2: { sockets: 2, maxRank: 20, rankTier: 'Master Effect (Ranks 11–20)' },
  3: { sockets: 3, maxRank: 30, rankTier: 'Pinnacle Effect (Ranks 21–30)' }
};

// ═══════════════════════════════════════════════════════════
// PLANETARY DESIGN MATRIX CONSTANTS (PLAN 28)
// ═══════════════════════════════════════════════════════════

export const STELLAR_CLASSES = {
  O: { id: 'O', name: 'Class O (Blue)', mass: '> 16.0 Sol', color: '#60a5fa', description: 'Violent/Young star; intense radiation, protoplanetary debris; mining outposts only' },
  B: { id: 'B', name: 'Class B (Blue-White)', mass: '2.1–16.0 Sol', color: '#93c5fd', description: 'High energy; intense UV radiation requires reflective shell shielding' },
  A: { id: 'A', name: 'Class A (White)', mass: '1.4–2.1 Sol', color: '#e2e8f0', description: 'Bright and harsh; polarized shielding, pre-garden worlds, Dyson swarms' },
  F: { id: 'F', name: 'Class F (Yellow-White)', mass: '1.04–1.4 Sol', color: '#fef08a', description: 'Prime habitation, hotter than Sol; tropical and arid biomes' },
  G: { id: 'G', name: 'Class G (Yellow)', mass: '0.8–1.04 Sol', color: '#facc15', description: 'Sol baseline; optimal for Earth-like garden and agricultural worlds' },
  K: { id: 'K', name: 'Class K (Orange)', mass: '0.45–0.8 Sol', color: '#fb923c', description: 'Long-lived, ancient civilizations, cooler and highly stable climates' },
  M: { id: 'M', name: 'Class M (Red Dwarf)', mass: '0.08–0.45 Sol', color: '#f87171', description: 'Red Dwarf; close orbits, tidal locking, flare hazards, twilight zone cities' },
  D: { id: 'D', name: 'Class D (White Dwarf / Remnant)', mass: 'Variable', color: '#cbd5e1', description: 'Remnant/dead star; ancient ruins, deep mining of exposed planetary cores' }
};

export const ORBITAL_ZONES = {
  Inner: { id: 'Inner', name: 'The Inner Zone (The Furnace)', description: 'Geomorteus / Geoplastic molten worlds, solar collection arrays, heavy shielding required' },
  BioZone: { id: 'BioZone', name: 'The Bio-Zone (Ecosphere)', description: 'Liquid water zone, Garden and Ocean worlds, prime real estate for Agri-worlds and capital hubs' },
  Outer: { id: 'Outer', name: 'The Outer Zone (The Deep / Cold Zone)', description: 'Beyond frost line; Cryo/Ice giants, hydrogen fuel skimming, secret research stations' }
};

export const PLANETARY_SIZE_CLASSES = {
  0: { size: 0, name: 'Class 0 (Asteroid / Void Belt)', km: '< 800 km', gravityTier: 'Zero-G', gVal: '< 0.1G', moveMod: 'Fly (Base)', carryMult: 10, combatMod: '-4 Attack/Skill', fallDmg: 'Muscle Atrophy (1d6 Str/wk)' },
  1: { size: 1, name: 'Class 1 (Tiny / Dwarf Planet)', km: '800–1,600 km', gravityTier: 'Low', gVal: '0.1–0.4G', moveMod: '+5 ft', carryMult: 2, combatMod: '-2 Attack, +2 Dex / -2 Str', fallDmg: '1d4/10ft' },
  2: { size: 2, name: 'Class 2 (Small / Mars-like)', km: '1,600–3,200 km', gravityTier: 'Low', gVal: '0.4–0.7G', moveMod: '+5 ft', carryMult: 2, combatMod: '-2 Attack, +2 Dex / -2 Str', fallDmg: '1d4/10ft' },
  3: { size: 3, name: 'Class 3 (Sub-Standard)', km: '3,200–4,800 km', gravityTier: 'Low', gVal: '0.7–0.8G', moveMod: '+5 ft', carryMult: 2, combatMod: '-2 Attack, +2 Dex / -2 Str', fallDmg: '1d4/10ft' },
  4: { size: 4, name: 'Class 4 (Standard Small)', km: '4,800–6,400 km', gravityTier: 'Standard', gVal: '0.8–0.9G', moveMod: 'Normal', carryMult: 1, combatMod: 'None', fallDmg: '1d6/10ft' },
  5: { size: 5, name: 'Class 5 (Standard Medium)', km: '6,400–8,000 km', gravityTier: 'Standard', gVal: '0.9–1.0G', moveMod: 'Normal', carryMult: 1, combatMod: 'None', fallDmg: '1d6/10ft' },
  6: { size: 6, name: 'Class 6 (Standard Earth-like)', km: '8,000–9,600 km', gravityTier: 'Standard', gVal: '1.0G', moveMod: 'Normal', carryMult: 1, combatMod: 'None', fallDmg: '1d6/10ft' },
  7: { size: 7, name: 'Class 7 (Standard Large)', km: '9,600–11,200 km', gravityTier: 'Standard', gVal: '1.0–1.2G', moveMod: 'Normal', carryMult: 1, combatMod: 'None', fallDmg: '1d6/10ft' },
  8: { size: 8, name: 'Class 8 (Super-Earth)', km: '11,200–12,800 km', gravityTier: 'High', gVal: '1.2–1.6G', moveMod: '-5 ft', carryMult: 0.5, combatMod: '-2 Attack, +2 Str / -2 Dex', fallDmg: '1d8/10ft (Fatigue)' },
  9: { size: 9, name: 'Class 9 (Heavy Super-Earth)', km: '12,800–14,400 km', gravityTier: 'High', gVal: '1.6–2.0G', moveMod: '-5 ft', carryMult: 0.5, combatMod: '-2 Attack, +2 Str / -2 Dex', fallDmg: '1d8/10ft (Fatigue)' },
  10: { size: 10, name: 'Class 10 (Giant / Extreme)', km: '> 14,400 km', gravityTier: 'Extreme', gVal: '> 2.0G', moveMod: 'Half Speed', carryMult: 0.25, combatMod: '-4 to all Physical Checks', fallDmg: 'Crush Dmg 1d6/min' }
};

export const ATMOSPHERE_TYPES_DETAILED = {
  0: { code: 0, name: 'Vacuum', pressure: '0.00 atm', gear: 'Vacc Suit', hazard: 'Suffocation, high radiation, 1d6 decompression dmg/rnd' },
  1: { code: 1, name: 'Trace', pressure: '< 0.1 atm', gear: 'Vacc Suit', hazard: 'CON DC 15 hourly vs fatigue; suffocation over time' },
  2: { code: 2, name: 'Very Thin', pressure: '0.1–0.4 atm', gear: 'Respirator', hazard: 'Fatigue checks in combat; projectile ranges +50%' },
  3: { code: 3, name: 'Thin', pressure: '0.4–0.7 atm', gear: 'Filter Mask', hazard: 'Breathable for natives; altitude sickness (Fatigue DC 15/hr)' },
  4: { code: 4, name: 'Standard', pressure: '0.7–1.5 atm', gear: 'None', hazard: 'Earth-normal standard breathable' },
  5: { code: 5, name: 'Dense', pressure: '1.5–2.5 atm', gear: 'None', hazard: 'High stamina; risk of the bends on rapid ascent; +4 Piloting' },
  6: { code: 6, name: 'Tainted', pressure: 'Varies', gear: 'Filter Mask', hazard: 'Pathogen/Pollutant exposure (Fort Save DC 15)' },
  7: { code: 7, name: 'Corrosive', pressure: 'Varies', gear: 'Hazmat Suit', hazard: '1d6 Acid dmg/round; degrades Armor DR by 1/min unless Sealed' },
  8: { code: 8, name: 'Exotic', pressure: 'Varies', gear: 'Air Supply', hazard: 'Unbreathable gas mixture (Methane/Chlorine); suffocation rules' },
  9: { code: 9, name: 'Dense, Tainted', pressure: 'High', gear: 'Filter Mask', hazard: 'Breathable pressure but contains allergens/pollutants' },
  10: { code: 10, name: 'Extreme Heat (10/A)', pressure: '> 120°F', gear: 'Cool Suit', hazard: '1d4 Heat dmg/10 mins (Fort Save DC 15)' },
  11: { code: 11, name: 'Extreme Cold (11/B)', pressure: '< 0°F', gear: 'Thermal Suit', hazard: '1d6 Cold dmg/10 mins (Fort Save DC 15)' },
  12: { code: 12, name: 'Insidious (12/C)', pressure: 'Varies', gear: 'Sealed Suit', hazard: 'Defeats suit seals over time; extreme corrosive hazard' }
};

export const GOVERNMENT_TYPES_DETAILED = {
  0: { code: 0, name: 'None / Anarchy', description: 'No central authority; rule by clan or gang violence (Outworlds)' },
  1: { code: 1, name: 'Corporate State', description: 'Citizenship is employment; laws are Terms of Service (Syndicate)' },
  2: { code: 2, name: 'Participating Democracy', description: 'Direct democracy; citizens vote directly via global networks' },
  3: { code: 3, name: 'Self-Perpetuating Oligarchy', description: 'Rule by specific class or minority independent of populace' },
  4: { code: 4, name: 'Representative Democracy', description: 'Elected officials create laws; standard for free worlds' },
  5: { code: 5, name: 'Feudal Technocracy', description: 'Nobility defined by tech access and bloodline (Dracon Dynasty)' },
  6: { code: 6, name: 'Captive Government', description: 'Puppet state ruled by external occupying faction' },
  7: { code: 7, name: 'Balkanized', description: 'Fragmented warring states, city-states, or competing arcologies' },
  8: { code: 8, name: 'Civil Service Bureaucracy', description: 'Ruled by government agencies and procedural law; logistics hubs' },
  9: { code: 9, name: 'Impersonal Bureaucracy', description: 'Ruled by detached algorithmic AI constructs; high efficiency, zero empathy' },
  10: { code: 10, name: 'Dictatorship (Charismatic)', description: 'Single populist leader, revolutionary hero, or warlord' },
  11: { code: 11, name: 'Dictatorship (Military)', description: 'Martial law, military rule; citizenship tied to service (Impyrium)' },
  12: { code: 12, name: 'Theocracy / Magocracy', description: 'Ruled by religious order or psychic/magical elite (Alterian)' },
  13: { code: 13, name: 'Hive / Collective', description: 'Communal hive mind; individualism suppressed (Davae / Mekan)' },
  14: { code: 14, name: 'Engineered Harmony', description: 'Algorithmic consensus or mass telepathy (Ascendancy Core)' },
  15: { code: 15, name: 'Progenitor Control', description: 'Absolute cosmic law dictated by ancient machine/god-entity' }
};

export const LAW_LEVELS_DETAILED = {
  0: { level: 0, name: 'No Law / Anarchy', bannedWeapons: 'None', bannedArmor: 'None', description: 'Complete freedom, high personal danger' },
  1: { level: 1, name: 'Minimal Law', bannedWeapons: 'Poison gas, WMDs', bannedArmor: 'Battle Dress', description: 'Frontier colony / mining outpost' },
  2: { level: 2, name: 'Low Law', bannedWeapons: 'Poison gas, WMDs, bio-agents', bannedArmor: 'Tactical Armor', description: 'Loose local enforcement' },
  3: { level: 3, name: 'Light Civil Law', bannedWeapons: 'Heavy Weapons (Machine guns, RPGs)', bannedArmor: 'All Heavy Armor', description: 'Free trade hubs' },
  4: { level: 4, name: 'Moderate Civil Law', bannedWeapons: 'Heavy weapons, military rifles', bannedArmor: 'All Heavy Armor', description: 'Standard residential colonies' },
  5: { level: 5, name: 'Moderate Law', bannedWeapons: 'Concealable Firearms (Pistols)', bannedArmor: 'All Medium & Heavy Armor', description: 'Dracon Dynasty core' },
  6: { level: 6, name: 'High Law', bannedWeapons: 'All Firearms (except stunners/shotguns)', bannedArmor: 'All Armor', description: 'Syndicate arcologies' },
  7: { level: 7, name: 'Strict Control', bannedWeapons: 'All Firearms and long bladed weapons', bannedArmor: 'All Armor', description: 'High security sectors' },
  8: { level: 8, name: 'Total Control', bannedWeapons: 'All Weapons except non-lethal', bannedArmor: 'All Armor', description: 'Syndicate executive hubs' },
  9: { level: 9, name: 'Police State', bannedWeapons: 'All Weapons (Possession is felony)', bannedArmor: 'All Armor, strict biometric IDs', description: 'Impyrium core' },
  10: { level: 10, name: 'Severe Martial Law', bannedWeapons: 'All Weapons, military checkpoints', bannedArmor: 'All Armor, curfew enforced', description: 'Impyrium fortress worlds' },
  11: { level: 11, name: 'Extreme Surveillance', bannedWeapons: 'All Weapons, neural scanning', bannedArmor: 'All Armor, restricted transit', description: 'Military black sites' },
  12: { level: 12, name: 'Totalitarian Control', bannedWeapons: 'Movement heavily restricted', bannedArmor: 'Mandatory neural implants', description: 'Mekan digital collective' },
  13: { level: 13, name: 'Thought-Crime Policing', bannedWeapons: 'Zero agency without authorization', bannedArmor: 'Mandatory surveillance', description: 'Automated labor matrices' },
  14: { level: 14, name: 'Absolute Algorithmic Law', bannedWeapons: 'Zero physical or digital deviance', bannedArmor: 'Integrated systemic state', description: 'Ascendancy harmonic matrix' },
  15: { level: 15, name: 'Absolute Suppression', bannedWeapons: 'Complete lack of personal agency', bannedArmor: 'None required (Total peace)', description: 'Progenitor vault containment' }
};

export const STARPORT_TYPES = {
  A: { code: 'A', name: 'Class A (Excellent)', facilities: 'Full Shipyard, Luxury Highport, Refined Fuel', repair: 'All capital repairs & refits' },
  B: { code: 'B', name: 'Class B (Good)', facilities: 'Good repair yards, tech shops, Refined Fuel', repair: 'Starship fabrication & upgrades' },
  C: { code: 'C', name: 'Class C (Routine)', facilities: 'Routine maintenance, Unrefined Fuel', repair: 'Basic hull & engine repairs' },
  D: { code: 'D', name: 'Class D (Poor)', facilities: 'Rough landing pads, Unrefined Fuel', repair: 'Emergency field repairs only' },
  E: { code: 'E', name: 'Class E (Frontier)', facilities: 'Marked beacon spot only, No Fuel', repair: 'No repair facilities' },
  X: { code: 'X', name: 'Class X (None / Quarantine)', facilities: 'Hazardous / Primitive / No provision', repair: 'Hostile quarantine' }
};

export const TRADE_CODE_DEFINITIONS = {
  Ag: { code: 'Ag', name: 'Agricultural', desc: 'Farming focus, optimal biosphere', exports: 'Foodstuffs, Textiles, Bio-matter, Timber', rule: 'Atmos 4-9, Hydro 4-8, Pop 5-7' },
  As: { code: 'As', name: 'Asteroid', desc: 'Mining colonies or orbital factories', exports: 'Metals, Crystals, Zero-G Tech', rule: 'Size 0, Atmos 0, Hydro 0' },
  Ba: { code: 'Ba', name: 'Barren', desc: 'Uncolonized or dead worlds', exports: 'Salvage, Artifacts', rule: 'Pop 0, Gov 0, Law 0' },
  De: { code: 'De', name: 'Desert', desc: 'Arid, < 10% surface water', exports: 'Silica, Solar Energy, Artifacts, Salt', rule: 'Hydro 0' },
  Fl: { code: 'Fl', name: 'Fluid Oceans', desc: 'Non-water liquid oceans (methane, chemical)', exports: 'Chemical Compounds, Fuel, Polymers', rule: 'Atmos 10+, Hydro 1+' },
  Ga: { code: 'Ga', name: 'Garden', desc: 'Earth-like paradise, optimal biosphere', exports: 'Luxuries, Art, Biologicals', rule: 'Size 5+, Atmos 4-9, Hydro 4-8' },
  Hi: { code: 'Hi', name: 'High Pop', desc: 'Billions in population, urban dense', exports: 'Manufactured Goods, Information', rule: 'Pop 9+' },
  Ht: { code: 'Ht', name: 'High Tech', desc: 'Advanced R&D and stellar industry (TL4+)', exports: 'Computers, Medical, Cybernetics, Ships', rule: 'TL 4+' },
  Ic: { code: 'Ic', name: 'Ice-Capped', desc: 'Frozen surface / cryogenic world', exports: 'Water (Ice), Superconductors, Cryo-Tech', rule: 'Atmos 0-1, Hydro 1+' },
  In: { code: 'In', name: 'Industrial', desc: 'High pop manufacturing center', exports: 'Weapons, Vehicles, Modules, Electronics', rule: 'Atmos (0-2, 4, 7, 9), Pop 9+' },
  Lo: { code: 'Lo', name: 'Low Pop', desc: 'Pioneer population (< 10,000)', exports: 'Raw Materials', rule: 'Pop 1-3' },
  Na: { code: 'Na', name: 'Non-Ag', desc: 'Too dry or barren for farming', exports: 'Textiles (Synthetic), Processed Ore', rule: 'Atmos 0-3, Hydro 0-3, Pop 6+' },
  Ni: { code: 'Ni', name: 'Non-Ind', desc: 'Too low pop for heavy industry', exports: 'Raw Materials', rule: 'Pop 4-6' },
  Po: { code: 'Po', name: 'Poor', desc: 'Lacking viable resources or land', exports: 'Scrap, Labor', rule: 'Atmos 2-5, Hydro 0-3' },
  Ri: { code: 'Ri', name: 'Rich / Mining', desc: 'Economic powerhouse, mineral abundance', exports: 'Luxuries, Advanced Tech, Ores, Crystals', rule: 'Atmos (6 or 8), Pop 6-8' },
  Va: { code: 'Va', name: 'Vacuum', desc: 'No atmosphere', exports: 'Salvage, Zero-G Goods, Ores', rule: 'Atmos 0' },
  Wa: { code: 'Wa', name: 'Water World', desc: '> 90% water surface', exports: 'Seafood, Hydrogen, Algae, Deuterium', rule: 'Hydro 10+' }
};

export const COMMODITIES_CATALOG = [
  { id: 'foodstuffs', name: 'Foodstuffs', sources: ['Ag', 'Ga', 'Wa'], demands: ['In', 'De', 'Ic'], baseCostPerTon: 500, notes: 'Grain, Meat, Spices, Fruit' },
  { id: 'textiles', name: 'Textiles', sources: ['Ag', 'Ni'], demands: ['In', 'Hi'], baseCostPerTon: 1000, notes: 'Cotton, Wool, Polymers, Silk' },
  { id: 'polymers', name: 'Polymers', sources: ['In', 'Fl'], demands: ['Ag', 'Ni'], baseCostPerTon: 4000, notes: 'Plastics, Synthetic Rubber' },
  { id: 'chemicals', name: 'Chemicals', sources: ['In', 'Fl'], demands: ['Ag', 'Ga'], baseCostPerTon: 5000, notes: 'Fertilizers, Acids, Fuel' },
  { id: 'metals', name: 'Metals', sources: ['As', 'Ri'], demands: ['In', 'Ht'], baseCostPerTon: 7000, notes: 'Steel, Copper, Aluminum, Titanium' },
  { id: 'machinery', name: 'Machinery', sources: ['In', 'Hi', 'Ht'], demands: ['Ag', 'Ni'], baseCostPerTon: 15000, notes: 'Tools, Parts, Robots, Vehicles' },
  { id: 'high_tech', name: 'High Tech', sources: ['Ht', 'Ri'], demands: ['Ag', 'Ni', 'Lo'], baseCostPerTon: 50000, notes: 'Computers, Sensors, Grav-Modules' },
  { id: 'luxuries', name: 'Luxuries', sources: ['Ga', 'Ri', 'Wa'], demands: ['Hi', 'Ri'], baseCostPerTon: 100000, notes: 'Art, Gems, Rare Spices, Liquor' },
  { id: 'contraband', name: 'Contraband', sources: ['Ba', 'Lo'], demands: ['Hi', 'In'], baseCostPerTon: 75000, notes: 'Weapons, Combat Drugs, AI Cores (Law 6+)' },
  { id: 'env_aid', name: 'Environmental Aid', sources: ['In', 'Ht'], demands: ['De', 'Ic', 'Va'], baseCostPerTon: 25000, notes: 'Life Support modules, Vacc Suits' }
];

export const CIVILIZATION_DOMAINS_DETAILED = {
  agriculture: { id: 'agriculture', name: 'Agriculture', stages: ['Hunting/Gathering', 'Farming', 'Advanced Farming', 'Terraforming', 'Planetary Engineering', 'Matter Synthesis'] },
  architecture: { id: 'architecture', name: 'Architecture', stages: ['Simple Structures', 'Advanced Masonry', 'Skyscrapers', 'Smart Cities', 'Advanced Space Habitats', 'Megastructures'] },
  biotechnology: { id: 'biotechnology', name: 'Biotechnology', stages: ['Herbalism', 'Pharmacology', 'Early Biotech', 'Genetic Engineering', 'Gene Editing', 'Advanced Nanobio'] },
  commerce: { id: 'commerce', name: 'Commerce', stages: ['Barter Systems', 'Currency Systems', 'Modern Financial', 'Digital Currencies', 'Post-Scarcity/Decentralized', 'Substance Interchange'] },
  communication: { id: 'communication', name: 'Communication', stages: ['Verbal/Pictograms', 'Published Text', 'Digital Networks', 'Holographic & FTL', 'Mnemonic Transceivers', 'Quantum Signaler'] },
  devices: { id: 'devices', name: 'Devices', stages: ['Simple Mechanical', 'Steam & Electric', 'Integrated Circuits', 'Robotics & AI', 'Brain-Computer Interfaces', 'Holophotonics'] },
  education: { id: 'education', name: 'Education', stages: ['Basic Survival', 'Vocational (+10)', 'Modern (+20)', 'Advanced (+30)', 'Highly Advanced (+40)', 'Cutting-Edge (+50)'] },
  energy: { id: 'energy', name: 'Energy', stages: ['Biomass/Wind', 'Fossil Fuels', 'Nuclear & Renewables', 'Fusion Power', 'Antimatter', 'Zero-Point & Dark Energy'] },
  manufacturing: { id: 'manufacturing', name: 'Manufacturing', stages: ['Handmade', 'Crafted Foundries', 'Mass Industrial', 'Nanotechnology', 'Programmable Material', 'Polymatter'] },
  materials: { id: 'materials', name: 'Materials', stages: ['Natural Materials', 'Synthetic Alloys', 'Advanced Composites', 'Metamaterials', 'Nanotech Assemblers', 'Polymatter'] },
  medicine: { id: 'medicine', name: 'Medicine', stages: ['Herbal Remedies', 'Basic Pharmacology', 'Focused Medicine', 'Augmentations & Cloning', 'Clinical Immortality', 'Retro-Genetic Reengineering'] },
  meta_sciences: { id: 'meta_sciences', name: 'Meta Sciences', stages: ['Folklore', 'Early Exploration', 'Systematic Study', 'Meta-Technology', 'Advanced Research', 'Integrated Magi-Tech'] },
  science: { id: 'science', name: 'Science', stages: ['Empirical', 'Systematic', 'Modern Disciplines', 'Advanced Theories', 'Unified Theories', 'Transcendent Theories'] },
  society: { id: 'society', name: 'Society', stages: ['Tribal', 'Early Civilizations', 'Modern Societies', 'Advanced System-Wide', 'Interconnected Galactic', 'Post-Scarcity Utopia'] },
  synthetic_intelligence: { id: 'synthetic_intelligence', name: 'Synthetic Intellect', stages: ['None', 'Reflexive Automation', 'Reactive Devices', 'Self-Aware AI', 'Artificial General Intelligence (AGI)', 'Hyper Intellect (ASI)'] },
  transportation: { id: 'transportation', name: 'Transportation', stages: ['Wagons & Boats', 'Wind & Aircraft', 'Rollers & Chemical Rockets', 'GEV & Reaction FTL', 'Force Wave & Tangent Space', 'Contra-Grav & Spatial Gateways'] },
  weaponry: { id: 'weaponry', name: 'Weaponry', stages: ['Melee & Bows', 'Gunpowder & Cannons', 'Modern Firearms & Missiles', 'Directed Energy & Railguns', 'Nanotech Force Weapons', 'Gravitonic Disintegration'] }
};

export const CIVILIZATION_ARCHETYPES = [
  { id: 'post_scarcity_utopia', name: 'Post-Scarcity Utopia', threshold: { energy: 5, society: 5, manufacturing: 5 }, description: 'Transformed by limitless energy and matter synthesis, focused on self-actualization.' },
  { id: 'militarized_technocracy', name: 'Militarized Technocracy', threshold: { weaponry: 4, transportation: 4, energy: 4 }, description: 'High defense readiness with kinetic force projectors and formidable star fleets.' },
  { id: 'bio_synthesist_collective', name: 'Bio-Synthesist Collective', threshold: { biotechnology: 4, medicine: 4, agriculture: 4 }, description: 'Living chitin cities, viral weapons, and genetic symbiosis.' },
  { id: 'cyber_corporate_grid', name: 'Cyber-Corporate Grid', threshold: { devices: 3, communication: 3, commerce: 3 }, description: 'Neon arcologies governed by automated market terms of service.' },
  { id: 'hyper_intellect_matrix', name: 'Hyper-Intellect Matrix', threshold: { synthetic_intelligence: 4, devices: 4, science: 4 }, description: 'Governed by gestalted superintelligences optimizing all civic operations.' },
  { id: 'arcane_resonant_enclave', name: 'Resonant Meta-Enclave', threshold: { meta_sciences: 3, science: 3 }, description: 'Societal infrastructure fused with psionic crystals and dimensional ether conduits.' },
  { id: 'frontier_salvage_world', name: 'Frontier Industrial Colony', threshold: {}, description: 'Rugged modular construction, industrial foundries, and utilitarian expansion.' }
];

export const ADAPTIVE_TECH_RECONFIG_TIMES = {
  3: { tl: 3, type: 'Nanotech / Biotech', time: '1 Minute (10 Rounds)', trigger: 'Move Action' },
  4: { tl: 4, type: 'Programmable Matter (Picotech)', time: '1 Full Round', trigger: 'Move Action' },
  5: { tl: 5, type: 'Polymatter / Holophotonics', time: '1 Standard Action / Instant', trigger: 'Move Action' }
};

export const SYNTHETIC_INTELLIGENCE_CONTINUUM = [
  { stage: 0, tl: 1, name: 'Mechanical Automation', description: 'Pure mechanical clockwork and cams; no data processing' },
  { stage: 1, tl: 2, name: 'Reactive Devices', description: 'Smart sensors, reflexive scripts; no persistent cognition' },
  { stage: 2, tl: 2.5, name: 'Limited Memory Assistants', description: 'Virtual assistants, contextual pattern recognition' },
  { stage: 3, tl: 3, name: 'Self-Aware Automata (Theory of Mind)', description: 'Emotional comprehension, independent initiative, personality' },
  { stage: 4, tl: 4, name: 'Artificial General Intelligence (AGI)', description: 'Indistinguishable from organic intellect; full domain synthesis' },
  { stage: 5, tl: 5, name: 'Hyper Intellect (ASI)', description: 'Trans-human cosmic intellect; planetary computation cores' }
];

export const CULTURAL_QUIRKS = [
  'Face Concealment: Masks or veils mandatory in public; showing face is severe taboo',
  'Barter Economy: Credits viewed with contempt; transactions done exclusively in goods or favors',
  'Technophilia: Cybernetics displayed as fine jewelry; unaugmented organics pitied',
  'Nocturnal: Society active exclusively during night hours to avoid planetary radiation',
  'Dueling Code: All legal disputes resolved through formalized non-lethal combat',
  'Caste Colors: Garment color strictly dictates administrative and civil caste',
  'Ancestor Worship: All civic decisions made by consulting AI consciousness constructs of elders',
  'Silence Vow: Public speech reserved for aristocracy; commoners communicate via sign language',
  'Xenophobia: Severe societal distrust of un-cataloged alien sophont species',
  'Communal Property: Personal theft is unrecognized; borrowing without notice is standard practice',
  'Ritual Scarification: Marks of status and achievement earned through rigorous trials',
  'The Debt Clock: Public digital displays track each citizen personal net societal favor rating',
  'No Permanent Residence: Population cycles through communal modular habitats on annual schedules',
  'Genetic Purity Testing: Mandatory biometric scans at all transit checkpoints to prevent drift',
  'Weather Rituals: Technological terraforming accompanied by sacred ceremonial observances',
  'Sound Silence: Continuous low-frequency harmonic resonance hum piped into all public plazas'
];




