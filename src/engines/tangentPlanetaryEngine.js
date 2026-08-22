// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — PLANETARY DESIGN ENGINE (PLAN 28)
// Pure calculation engine for planetary profiles, UWP synthesis,
// Trade Code derivation, commodity economics, and hazard rules.
// ═══════════════════════════════════════════════════════════

import {
  STELLAR_CLASSES,
  ORBITAL_ZONES,
  PLANETARY_SIZE_CLASSES,
  ATMOSPHERE_TYPES_DETAILED,
  GOVERNMENT_TYPES_DETAILED,
  LAW_LEVELS_DETAILED,
  STARPORT_TYPES,
  TRADE_CODE_DEFINITIONS,
  COMMODITIES_CATALOG,
  CIVILIZATION_DOMAINS_DETAILED,
  CIVILIZATION_ARCHETYPES,
  CULTURAL_QUIRKS
} from './tangentConstants.js';
import { calculateCreditValue } from './tangentEconEngine.js';

/**
 * Clamp a number between min and max.
 */
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * Roll standard dice (e.g. 2d6).
 */
export const rollDice = (count = 2, sides = 6) => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

/**
 * Parses a Universal World Profile / Tangent World Profile (UWP/TWP) string.
 * Format: Starport:Size:Atmosphere:Hydrography:Population:Government:Law:TL:ML
 * Example: 'A:8:6:7:10:4:5:4:3'
 */
export const parseUWP = (uwpString) => {
  if (!uwpString || typeof uwpString !== 'string') {
    return {
      starport: 'C',
      size: 6,
      atmosphere: 4,
      hydrography: 6,
      population: 7,
      government: 4,
      lawLevel: 4,
      techLevel: 3,
      metaLevel: 1
    };
  }

  const parts = uwpString.trim().split(':');
  if (parts.length < 7) {
    return {
      starport: 'C',
      size: 6,
      atmosphere: 4,
      hydrography: 6,
      population: 7,
      government: 4,
      lawLevel: 4,
      techLevel: 3,
      metaLevel: 1
    };
  }

  return {
    starport: (parts[0] || 'C').toUpperCase(),
    size: Number(parts[1]) || 0,
    atmosphere: Number(parts[2]) || 0,
    hydrography: Number(parts[3]) || 0,
    population: Number(parts[4]) || 0,
    government: Number(parts[5]) || 0,
    lawLevel: Number(parts[6]) || 0,
    techLevel: parts[7] !== undefined ? Number(parts[7]) : 3,
    metaLevel: parts[8] !== undefined ? Number(parts[8]) : 0
  };
};

/**
 * Formats structured planetary parameters into canonical UWP/TWP string.
 */
export const formatUWP = (data) => {
  const sp = data.starport || 'C';
  const s = clamp(Number(data.size ?? 6), 0, 15);
  const a = clamp(Number(data.atmosphere ?? 4), 0, 15);
  const h = clamp(Number(data.hydrography ?? 6), 0, 15);
  const p = clamp(Number(data.population ?? 7), 0, 15);
  const g = clamp(Number(data.government ?? 4), 0, 15);
  const l = clamp(Number(data.lawLevel ?? data.law_level ?? 4), 0, 15);
  const tl = clamp(Number(data.techLevel ?? data.tl ?? data.tech_level ?? 3), 0, 5);
  const ml = clamp(Number(data.metaLevel ?? data.ml ?? data.meta_level ?? 0), 0, 6);

  return `${sp}:${s}:${a}:${h}:${p}:${g}:${l}:${tl}:${ml}`;
};

/**
 * Returns physical gravity details and mechanics from Size class.
 */
export const getGravityDetails = (size = 6) => {
  const sizeNum = clamp(Math.floor(Number(size) || 0), 0, 10);
  return PLANETARY_SIZE_CLASSES[sizeNum] || PLANETARY_SIZE_CLASSES[6];
};

/**
 * Returns atmospheric composition, pressure, survival gear, and hazards.
 */
export const getAtmosphereDetails = (atmosCode = 4) => {
  const codeNum = clamp(Math.floor(Number(atmosCode) || 0), 0, 12);
  return ATMOSPHERE_TYPES_DETAILED[codeNum] || ATMOSPHERE_TYPES_DETAILED[4];
};

/**
 * Automatic derivation of all 18 canonical Trade Codes based on UWP data.
 * Rules correspond directly to Section 10.3 of the Planetary Design Matrix.
 */
export const deriveTradeCodes = (data) => {
  const s = Number(data.size ?? 6);
  const a = Number(data.atmosphere ?? 4);
  const h = Number(data.hydrography ?? 6);
  const p = Number(data.population ?? 7);
  const g = Number(data.government ?? 4);
  const l = Number(data.lawLevel ?? data.law_level ?? 4);
  const tl = Number(data.techLevel ?? data.tl ?? data.tech_level ?? 3);

  const codes = [];

  // Ag (Agricultural): Atmos 4-9, Hydro 4-8, Pop 5-7
  if (a >= 4 && a <= 9 && h >= 4 && h <= 8 && p >= 5 && p <= 7) {
    codes.push('Ag');
  }

  // As (Asteroid): Size 0, Atmos 0, Hydro 0
  if (s === 0 && a === 0 && h === 0) {
    codes.push('As');
  }

  // Ba (Barren): Pop 0, Gov 0, Law 0
  if (p === 0 && g === 0 && l === 0) {
    codes.push('Ba');
  }

  // De (Desert): Hydro 0
  if (h === 0 && (s > 0 || a > 0)) {
    codes.push('De');
  }

  // Fl (Fluid Oceans): Atmos 10+, Hydro 1+
  if (a >= 10 && h >= 1) {
    codes.push('Fl');
  }

  // Ga (Garden): Size 5+, Atmos 4-9, Hydro 4-8
  if (s >= 5 && a >= 4 && a <= 9 && h >= 4 && h <= 8) {
    codes.push('Ga');
  }

  // Hi (High Pop): Pop 9+
  if (p >= 9) {
    codes.push('Hi');
  }

  // Ht (High Tech): TL 4+
  if (tl >= 4) {
    codes.push('Ht');
  }

  // Ic (Ice-Capped): Atmos 0-1, Hydro 1+
  if (a <= 1 && h >= 1) {
    codes.push('Ic');
  }

  // In (Industrial): Atmos (0-2 or 4 or 7 or 9), Pop 9+
  if ([0, 1, 2, 4, 7, 9].includes(a) && p >= 9) {
    codes.push('In');
  }

  // Lo (Low Pop): Pop 1-3
  if (p >= 1 && p <= 3) {
    codes.push('Lo');
  }

  // Na (Non-Ag): Atmos 0-3, Hydro 0-3, Pop 6+
  if (a <= 3 && h <= 3 && p >= 6) {
    codes.push('Na');
  }

  // Ni (Non-Ind): Pop 4-6
  if (p >= 4 && p <= 6) {
    codes.push('Ni');
  }

  // Po (Poor): Atmos 2-5, Hydro 0-3
  if (a >= 2 && a <= 5 && h <= 3) {
    codes.push('Po');
  }

  // Ri (Rich / Mining): Atmos (6 or 8), Pop 6-8
  if ((a === 6 || a === 8) && p >= 6 && p <= 8) {
    codes.push('Ri');
  }

  // Va (Vacuum): Atmos 0
  if (a === 0) {
    codes.push('Va');
  }

  // Wa (Water World): Hydro 10+
  if (h >= 10) {
    codes.push('Wa');
  }

  return codes;
};

/**
 * Calculates local commodity prices and market supply/demand based on Trade Codes.
 */
export const calculateCommodityModifiers = (tradeCodes = []) => {
  const codeSet = new Set(tradeCodes);

  return COMMODITIES_CATALOG.map(item => {
    const isSource = item.sources.some(code => codeSet.has(code));
    const isDemand = item.demands.some(code => codeSet.has(code));

    let priceMultiplier = 1.0;
    let marketStatus = 'Standard Market';

    if (isSource && !isDemand) {
      priceMultiplier = 0.75; // 25% surplus export discount
      marketStatus = 'Major Export (Surplus)';
    } else if (isDemand && !isSource) {
      priceMultiplier = 1.35; // 35% import demand premium
      marketStatus = 'High Demand (Import)';
    } else if (isSource && isDemand) {
      priceMultiplier = 1.05;
      marketStatus = 'Active Hub Trading';
    }

    const localCostPerTon = Math.round(item.baseCostPerTon * priceMultiplier);

    return {
      id: item.id,
      name: item.name,
      baseCost: item.baseCostPerTon,
      localCost: localCostPerTon,
      priceMultiplier,
      marketStatus,
      isSource,
      isDemand,
      notes: item.notes
    };
  });
};

/**
 * Market Availability Cap: (TL * 5) + 10.
 * Maximum Crafting DC natively available on-world without black market doubling.
 */
export const getMarketAvailabilityCap = (tl = 3) => {
  const tlNum = clamp(Number(tl) || 0, 0, 5);
  return (tlNum * 5) + 10;
};

/**
 * Hazard DC calculation.
 */
export const calculateHazardDC = (degree = 'Moderate', atmosCode = 4, size = 6) => {
  const baseDCs = { Mild: 12, Low: 15, Moderate: 18, High: 22, Severe: 30 };
  let dc = baseDCs[degree] || 18;

  if (atmosCode === 0 || atmosCode === 7 || atmosCode === 12) {
    dc += 4;
  }
  if (size >= 8 || size === 0) {
    dc += 2;
  }
  return dc;
};

/**
 * Procedural World Generation Loop (Steps 1–6 from CODEX 99. Planetary Design Matrix).
 * Includes Faction Hard Overrides.
 */
export const generateProceduralPlanet = (options = {}) => {
  const faction = options.faction || 'Independent';

  // Step 1: Stellar Context & Orbit
  const starKeys = Object.keys(STELLAR_CLASSES);
  const starKey = options.starClass || starKeys[Math.floor(Math.random() * starKeys.length)];
  const orbitalZone = options.orbitalZone || (Math.random() < 0.7 ? 'BioZone' : (Math.random() < 0.5 ? 'Inner' : 'Outer'));

  let envPenalty = 0;
  if (starKey === 'M' || orbitalZone !== 'BioZone') {
    envPenalty = 2;
  }

  // Step 2: Physical Chassis (Size, Atmos, Hydro)
  let size = options.size !== undefined ? Number(options.size) : clamp(rollDice(2, 6) - 2, 0, 10);
  
  let atmos = 0;
  if (size > 0) {
    atmos = options.atmosphere !== undefined ? Number(options.atmosphere) : clamp(rollDice(2, 6) - 7 + size - envPenalty, 0, 12);
  }

  let hydro = 0;
  if (size >= 2) {
    hydro = options.hydrography !== undefined ? Number(options.hydrography) : rollDice(2, 6) - 7 + atmos - envPenalty;
    if (atmos <= 1) hydro -= 4;
    hydro = clamp(hydro, 0, 10);
  }

  // Step 3: Sociological Skin (Pop, Starport, Gov, Law)
  let isCapital = options.isCapital || faction === 'The Syndicate' || faction === 'Dracon Dynasty';
  let pop = options.population !== undefined 
    ? Number(options.population) 
    : clamp(isCapital ? rollDice(3, 6) - 2 : rollDice(2, 6) - 2, 0, 12);

  let starport = 'C';
  let gov = 4;
  let law = 4;

  if (pop === 0) {
    starport = 'X';
    gov = 0;
    law = 0;
  } else {
    const spRoll = rollDice(2, 6) - 7 + pop;
    if (spRoll <= 0) starport = 'X';
    else if (spRoll <= 2) starport = 'E';
    else if (spRoll <= 4) starport = 'D';
    else if (spRoll <= 6) starport = 'C';
    else if (spRoll <= 8) starport = 'B';
    else starport = 'A';

    gov = clamp(rollDice(2, 6) - 7 + pop, 0, 15);
    law = clamp(rollDice(2, 6) - 7 + gov, 0, 15);
  }

  // Step 4: Faction Hard Overrides
  if (faction === 'The Syndicate') {
    pop = Math.max(8, pop);
    law = Math.max(5, law);
    starport = 'A';
  } else if (faction === 'Dracon Dynasty') {
    gov = 5;
    starport = starport === 'X' ? 'C' : starport;
  } else if (faction === 'The Coalition') {
    gov = Math.random() < 0.5 ? 4 : 7;
    if (law > 6) law = clamp(rollDice(2, 6) - 5, 1, 6);
  } else if (faction === 'The Outworlds') {
    law = Math.min(3, law);
  }

  // Step 5: Tech Level Assessment
  let baseTL = 3;
  const tlDie = rollDice(1, 6);
  if (tlDie === 1) baseTL = 2;
  if (tlDie === 6) baseTL = 4;

  let tlMod = 0;
  if (starport === 'A') tlMod += 1;
  if (starport === 'X' || starport === 'E') tlMod -= 1;
  if (size <= 1) tlMod += 1;
  if (atmos <= 3 || atmos >= 10) tlMod += 1;
  if (pop >= 10) tlMod += 1;
  if (gov === 0 || gov === 13) tlMod -= 1;

  let tl = clamp(baseTL + tlMod, 0, 5);

  if (faction === 'The Syndicate') tl = 4;
  if (faction === 'The Outworlds') tl = Math.min(2, tl);
  if (faction === 'Ascendancy' || faction === 'Mekan') tl = Math.max(4, tl);

  // Step 6: Meta Level Assessment
  let ml = clamp(rollDice(1, 6) - 1, 0, 6);
  if (faction === 'Alterian Enclave' || faction === 'Ascendancy') ml = clamp(ml + 2, 2, 6);
  if (faction === 'Mekan') ml = clamp(ml + 1, 1, 5);
  if (faction === 'The Syndicate' || faction === 'Impyrium') ml = clamp(ml - 1, 0, 4);
  if (tl === 0) ml = clamp(ml + 1, 1, 5);

  // Generate 16 Domain Ratings centered on base TL
  const domains = {};
  Object.keys(CIVILIZATION_DOMAINS_DETAILED).forEach(dKey => {
    const variance = (rollDice(1, 3) - 2); // -1, 0, +1
    domains[dKey] = clamp(tl + variance, 0, 5);
  });

  const uwpObject = {
    starport,
    size,
    atmosphere: atmos,
    hydrography: hydro,
    population: pop,
    government: gov,
    lawLevel: law,
    techLevel: tl,
    metaLevel: ml
  };

  const tradeCodes = deriveTradeCodes(uwpObject);

  return {
    starClass: starKey,
    orbitalZone,
    uwp: formatUWP(uwpObject),
    uwpData: uwpObject,
    tradeCodes,
    domainRatings: domains,
    dominantFaction: faction,
    gravity: getGravityDetails(size),
    atmosphereDetails: getAtmosphereDetails(atmos),
    marketCap: getMarketAvailabilityCap(tl),
    culturalQuirk: CULTURAL_QUIRKS[Math.floor(Math.random() * CULTURAL_QUIRKS.length)]
  };
};

/**
 * Evaluates civilization domain scores to identify best matching archetype.
 */
export const evaluateCivilizationArchetype = (domains = {}) => {
  for (const arch of CIVILIZATION_ARCHETYPES) {
    const keys = Object.keys(arch.threshold);
    if (keys.length === 0) continue;
    const matches = keys.every(k => (domains[k] || 0) >= arch.threshold[k]);
    if (matches) return arch;
  }
  return CIVILIZATION_ARCHETYPES[CIVILIZATION_ARCHETYPES.length - 1]; // Frontier default
};

/**
 * Master Compute-On-Save handler for Planetary Design Forge (`planetary-design`).
 * Generates complete computed metadata.
 */
export const computePlanetaryStats = (formData = {}) => {
  const uwpData = {
    starport: formData.starport || 'C',
    size: Number(formData.size ?? formData.size_class ?? 6),
    atmosphere: Number(formData.atmosphere ?? formData.atmos_code ?? 4),
    hydrography: Number(formData.hydrography ?? formData.hydro_code ?? 6),
    population: Number(formData.population ?? formData.pop_code ?? 7),
    government: Number(formData.government ?? formData.gov_code ?? 4),
    lawLevel: Number(formData.lawLevel ?? formData.law_level ?? 4),
    techLevel: Number(formData.techLevel ?? formData.tl ?? formData.tech_level ?? 3),
    metaLevel: Number(formData.metaLevel ?? formData.ml ?? formData.meta_level ?? 0)
  };

  const uwpString = formatUWP(uwpData);
  const tradeCodes = deriveTradeCodes(uwpData);
  const commodityModifiers = calculateCommodityModifiers(tradeCodes);
  const gravityDetails = getGravityDetails(uwpData.size);
  const atmosphereDetails = getAtmosphereDetails(uwpData.atmosphere);
  const marketCap = getMarketAvailabilityCap(uwpData.techLevel);
  const hazardDC = calculateHazardDC('Moderate', uwpData.atmosphere, uwpData.size);
  
  const domains = formData.domainRatings || formData.domains || {};
  const archetype = evaluateCivilizationArchetype(domains);

  const craftDC = Number(formData.craft_dc ?? 20);
  const surveyCreditValue = calculateCreditValue(craftDC);

  return {
    uwp: uwpString,
    uwp_breakdown: uwpData,
    trade_codes: tradeCodes,
    trade_code_count: tradeCodes.length,
    commodity_exchange: commodityModifiers,
    gravity_profile: {
      tier: gravityDetails.gravityTier,
      g_value: gravityDetails.gVal,
      movement_modifier: gravityDetails.moveMod,
      carry_multiplier: gravityDetails.carryMult,
      combat_modifier: gravityDetails.combatMod,
      fall_damage: gravityDetails.fallDmg
    },
    atmosphere_profile: {
      type: atmosphereDetails.name,
      pressure: atmosphereDetails.pressure,
      gear_required: atmosphereDetails.gear,
      hazard_profile: atmosphereDetails.hazard
    },
    market_availability_cap: marketCap,
    hazard_dc: hazardDC,
    civilization_archetype: archetype.name,
    civilization_archetype_desc: archetype.description,
    survey_credit_value: surveyCreditValue,
    computed_at: new Date().toISOString()
  };
};
