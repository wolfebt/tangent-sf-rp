// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — TECHNOLOGY CALCULATION ENGINE
// Pure functions for Tech Levels, Sub-Strata, Domains & Schematics
// ═══════════════════════════════════════════════════════════

import {
  TECH_LEVELS,
  SUB_STRATA,
  CIVILIZATION_DOMAINS,
  ADAPTIVE_TECH_TYPES,
  SCHEMATIC_RARITY
} from './tangentConstants.js';

/**
 * Get full definition metadata for a given Tech Level (0-5).
 * @param {number} tl - Tech Level index (0-5)
 * @returns {typeof TECH_LEVELS[0]} Tech level descriptor
 */
export function getTechLevelDef(tl) {
  const level = Math.max(0, Math.min(5, Number(tl) || 0));
  return TECH_LEVELS[level] || TECH_LEVELS[2];
}

/**
 * Get sub-strata details (Nascent TL-, Standard TL, Advanced TL+).
 * @param {number} tl - Base Tech Level (0-5)
 * @param {'Nascent'|'Standard'|'Advanced'} [stratum='Standard'] - Sub-stratum modifier
 * @returns {object} Detailed sub-strata descriptor
 */
export function getSubStrataDetails(tl, stratum = 'Standard') {
  const baseTL = getTechLevelDef(tl);
  const selectedStratum = SUB_STRATA.includes(stratum) ? stratum : 'Standard';
  
  const modifierMap = {
    Nascent: { label: 'Nascent (TL-)', penaltyMod: -1, reliabilityMod: -2, desc: 'Experimental, early prototype iteration' },
    Standard: { label: 'Standard (TL)', penaltyMod: 0, reliabilityMod: 0, desc: 'Mature, standardized production model' },
    Advanced: { label: 'Advanced (TL+)', penaltyMod: 1, reliabilityMod: 2, desc: 'Pinnacle engineering, late-era refinement' }
  };

  return {
    baseTL: baseTL.id,
    stratum: selectedStratum,
    ...modifierMap[selectedStratum]
  };
}

/**
 * Calculate operation penalty when a character uses a device beyond their native Tech Level.
 * Rule: -5 per TL gap for general/technical devices, -1 per TL gap for weapons/simple tools.
 * @param {number} deviceTL - Device Tech Level
 * @param {number} charTL - Character/Native Tech Level
 * @param {boolean} [isWeapon=false] - Whether the item is a weapon or simple interface
 * @returns {number} Penalty (negative number or 0)
 */
export function calculateTechPenalty(deviceTL, charTL, isWeapon = false) {
  const dTL = Math.max(0, Number(deviceTL) || 0);
  const cTL = Math.max(0, Number(charTL) || 0);
  const gap = dTL - cTL;

  if (gap <= 0) return 0;
  const multiplier = isWeapon ? 1 : 5;
  return -(gap * multiplier);
}

/**
 * Calculate starting education / skill point bonuses from origin Tech Level.
 * @param {number} tl - Origin Tech Level (0-5)
 * @returns {object} Education bonus definition
 */
export function calculateEducationBonus(tl) {
  const def = getTechLevelDef(tl);
  return {
    tl: def.id,
    era: def.era,
    educationBonus: def.educationBonus,
    restrictedSkills: def.restrictedSkills
  };
}

/**
 * Calculate schematic acquisition cost and reverse-engineering DC.
 * @param {number} baseItemCreditValue - Base item credit value
 * @param {'Common'|'Uncommon'|'Rare/Restricted'} [rarity='Common'] - Blueprint rarity tier
 * @returns {{ schematicCost: number, integrationDC: number, rarity: string }}
 */
export function getSchematicCost(baseItemCreditValue, rarity = 'Common') {
  const val = Math.max(0, Number(baseItemCreditValue) || 0);
  const rConfig = SCHEMATIC_RARITY[rarity] || 
    (rarity === 'Rare' ? SCHEMATIC_RARITY['Rare/Restricted'] : null) || 
    SCHEMATIC_RARITY.Common;
  const schematicCost = val * rConfig.multiplier;

  return {
    schematicCost,
    integrationDC: rConfig.integrationDC,
    rarity
  };
}

/**
 * Get reconfiguration action economy for adaptive technology types (nanotech, picotech, polymatter, holophotonics).
 * @param {string} techType - ID or name of the adaptive tech type
 * @returns {typeof ADAPTIVE_TECH_TYPES[0]} Adaptive tech descriptor
 */
export function getReconfigTime(techType) {
  const key = (techType || '').toLowerCase();
  const found = ADAPTIVE_TECH_TYPES.find(t => t.id === key || t.name.toLowerCase().includes(key));
  return found || ADAPTIVE_TECH_TYPES[0];
}

/**
 * Get domain description at a given Tech Level.
 * @param {string} domain - Domain name from CIVILIZATION_DOMAINS
 * @param {number} tl - Tech Level (0-5)
 * @returns {string} Capability description
 */
export function getDomainCapability(domain, tl) {
  const validTL = Math.max(0, Math.min(5, Number(tl) || 0));
  const validDomain = CIVILIZATION_DOMAINS.includes(domain) ? domain : 'Manufacturing';

  const capabilities = {
    Manufacturing: [
      'Handcrafting, stone knapping, forging primitive ores',
      'Casting, assembly lines, steam-driven mechanization',
      'CNC machining, automated factory robotics, surface mount electronics',
      'Additive 3D/metal printing, modular robotic fabs, orbital fabrication',
      'Molecular nano-assemblers, programmable matter lattices',
      'Matter-energy replication, genesis synthesis looms'
    ],
    Energy: [
      'Wood, biomass, geothermal hot springs',
      'Coal, early petroleum combustion, steam boilers',
      'Hydrocarbons, fission reactors, solar/wind arrays',
      'Compact fusion cores, thorium fuel cells, ion drives',
      'Antimatter containment, cold fusion, zero-point taps',
      'Dimensional siphons, dark energy generators, vacuum field taps'
    ]
  };

  const domainList = capabilities[validDomain] || capabilities.Manufacturing;
  return domainList[validTL] || `TL${validTL} standard capability for ${validDomain}`;
}

/**
 * List which major technologies exist or become unlocked at a given Tech Level.
 * @param {number} tl - Tech Level (0-5)
 * @returns {string[]} Unlocked technology tags
 */
export function getAvailableTechAtTL(tl) {
  const level = Math.max(0, Math.min(5, Number(tl) || 0));
  const techMap = {
    0: ['Flint Tools', 'Fire Hardening', 'Muscle Craft', 'Primitive Bows'],
    1: ['Black Powder', 'Steam Engines', 'Iron/Steel Smelting', 'Telegraph', 'Mechanical Chronometers'],
    2: ['Silicon Microchips', 'Nuclear Fission', 'Global Telecommunications', 'Internal Combustion', 'Lasers (Primitive)'],
    3: ['Magnetic Railguns', 'Fusion Reactors', 'Plasma Torches', 'Neural Cyberware (Basic)', 'Nanotech (Nascent)'],
    4: ['Particle Beams', 'Antimatter Cores', 'Picotech Matter', 'Warp Gates', 'Gravity Dampeners'],
    5: ['Femtotech Polymatter', 'Holophotonic Solid Energy', 'Dimensional Phase Siphons', 'Zero-Point Energy', 'Sentient Singularity AI']
  };

  return techMap[level] || techMap[2];
}
