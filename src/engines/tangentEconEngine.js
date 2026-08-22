// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — ECONOMIC CALCULATION ENGINE
// Pure mathematical functions implementing ECONOMATRIX formulas
// ═══════════════════════════════════════════════════════════

import {
  FINANCIAL_STATUS_TABLE,
  TOOL_TIERS,
  FENCE_RATES,
  COMPLEXITY_TIERS,
  FACTION_WEALTH_MODS,
  TECH_LEVELS,
  WORLD_TRADE_CODES,
  COMMODITIES
} from './tangentConstants.js';

/**
 * Tangent Standard Curve (TSC): Calculate credit value from Crafting/Item DC.
 * Formula: Value (V) = 10 * 4^(DC / 5)
 * @param {number} dc - Crafting or item complexity DC (0-80)
 * @returns {number} Market value in credits (rounded to nearest integer)
 */
export function calculateCreditValue(dc) {
  const numDc = Number(dc) || 0;
  if (numDc < 0) return 10;
  return Math.round(10 * Math.pow(4, numDc / 5));
}

/**
 * Alias for calculateCreditValue for consistency with TSC terminology
 */
export const calculateTSCValue = calculateCreditValue;

/**
 * Calculate raw material cost required to fabricate an item (50% of market value).
 * @param {number} creditValue - Total market credit value
 * @returns {number} Material cost in credits
 */
export function calculateMaterialCost(creditValue) {
  const val = Number(creditValue) || 0;
  return Math.round(val * 0.5);
}

/**
 * Calculate crafting duration in days given an item's credit value, crafter's skill check, and tool tier.
 * Daily Production Points (PP) = max(1, (Skill Check - 10) * Tier Multiplier)
 * Crafting Days = Credit Value / Daily PP
 * @param {number} creditValue - Total market credit value (= Target PP)
 * @param {number} [skillCheck=20] - Skill check total (defaults to 20)
 * @param {number} [tierMultiplier=10] - Tool tier multiplier (default 10 for Basic)
 * @returns {number} Crafting duration in days (floating point)
 */
export function calculateCraftingDays(creditValue, skillCheck = 20, tierMultiplier = 10) {
  const val = Math.max(0, Number(creditValue) || 0);
  const check = Number(skillCheck) || 20;
  const mult = Math.max(1, Number(tierMultiplier) || 1);

  const effectiveBonus = Math.max(1, (check - 10) * mult);
  const days = val / effectiveBonus;
  return Math.round(days * 100) / 100;
}

/**
 * Humanize days into a clean readable string (e.g., "3.2 hours", "4.5 days", "3.1 weeks", "2.4 years").
 * Assumes standard 8-hour crafting workday.
 * @param {number} days - Duration in days
 * @returns {string} Humanized duration
 */
export function formatCraftingDuration(days) {
  if (days <= 0) return 'Instant (<1 hour)';
  if (days < 1) {
    const hours = Math.max(0.1, Math.round(days * 8 * 10) / 10);
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  if (days < 7) {
    return `${Math.round(days * 10) / 10} days`;
  }
  if (days < 30) {
    const weeks = Math.round((days / 7) * 10) / 10;
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  if (days < 365) {
    const months = Math.round((days / 30) * 10) / 10;
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  const years = Math.round((days / 365) * 100) / 100;
  return `${years} year${years === 1 ? '' : 's'}`;
}

/**
 * Calculate crafting days across all 7 tool tiers for a given credit value and skill check.
 * @param {number} creditValue - Total market credit value
 * @param {number} [skillCheck=20] - Skill check total
 * @returns {Array<{ id: string, name: string, multiplier: number, dailyPP: number, days: number, formatted: string }>}
 */
export function calculateAllCraftingTiers(creditValue, skillCheck = 20) {
  const val = Math.max(0, Number(creditValue) || 0);
  const check = Number(skillCheck) || 20;

  return TOOL_TIERS.map(tier => {
    const dailyPP = Math.max(1, (check - 10) * tier.multiplier);
    const days = val > 0 ? Math.round((val / dailyPP) * 100) / 100 : 0;
    return {
      id: tier.id,
      name: tier.name,
      multiplier: tier.multiplier,
      dailyPP,
      days,
      formatted: formatCraftingDuration(days)
    };
  });
}

/**
 * Calculate the liquidity gap between an item's DC and a character's Wealth Score.
 * @param {number} itemDC - Item complexity DC
 * @param {number} playerWS - Player character's Wealth Score
 * @returns {number} Credit gap required to finance the purchase
 */
export function calculateLiquidityGap(itemDC, playerWS) {
  const itemVal = calculateCreditValue(itemDC);
  const wsStatus = getFinancialStatus(playerWS);
  const autoBuyLimit = wsStatus && wsStatus.autoBuyCr !== undefined ? wsStatus.autoBuyCr : calculateCreditValue(playerWS);
  const gap = Math.max(0, itemVal - autoBuyLimit);
  return {
    itemDC,
    playerWS,
    itemValue: itemVal,
    playerWSValue: autoBuyLimit,
    liquidGapCost: gap
  };
}

/**
 * Calculate sell price for gear or salvaged assets based on fence/resale channel.
 * @param {number} creditValue - Total market credit value
 * @param {'legal'|'blackMarket'|'scrap'} [fenceType='legal'] - Fence channel
 * @returns {number} Resale credit value
 */
export function calculateSellPrice(creditValue, fenceType = 'legal') {
  const val = Number(creditValue) || 0;
  const rate = FENCE_RATES[fenceType] !== undefined ? FENCE_RATES[fenceType] : FENCE_RATES.legal;
  return Math.round(val * rate);
}

/**
 * Look up a character or institution's financial status tier based on Wealth Score (WS).
 * @param {number} ws - Wealth Score (0-999)
 * @returns {typeof FINANCIAL_STATUS_TABLE[0]} Financial status record
 */
export function getFinancialStatus(ws) {
  const score = Math.max(0, Number(ws) || 0);
  const tier = FINANCIAL_STATUS_TABLE.find(t => score >= t.wsMin && score <= t.wsMax);
  return tier || FINANCIAL_STATUS_TABLE[FINANCIAL_STATUS_TABLE.length - 1];
}

/**
 * Reverse lookup: Find the minimum Wealth Score required to Auto-Buy an item of a given Crafting DC.
 * @param {number} dc - Item Crafting DC
 * @returns {number} Recommended minimum Wealth Score
 */
export function getWSFromDC(dc) {
  const itemVal = calculateCreditValue(dc);
  const tier = FINANCIAL_STATUS_TABLE.find(t => t.autoBuyCr >= itemVal);
  if (tier) return tier.wsMin;
  // If beyond standard table, approximate from TSC
  return Math.ceil(Number(dc) || 0);
}

/**
 * Look up the complexity tier label for a given Crafting DC.
 * @param {number} dc - Crafting DC
 * @returns {string} Complexity tier label (e.g. "Standard", "Advanced", "Legendary")
 */
export function getComplexityTier(dc) {
  const numDc = Number(dc) || 0;
  let matchingTier = COMPLEXITY_TIERS[0].label;
  for (const tier of COMPLEXITY_TIERS) {
    if (numDc >= tier.dc) {
      matchingTier = tier.label;
    } else {
      break;
    }
  }
  return matchingTier;
}

/**
 * Calculate starting Wealth Score from character creation parameters.
 * @param {object} params
 * @param {number} [params.occupationBase=10] - Base WS from starting occupation/career
 * @param {number} [params.occupationWS] - Override base WS
 * @param {number} [params.originMod=0] - Origin background modifier
 * @param {string} [params.faction='Coalition'] - Character faction name
 * @param {number} [params.factionMod] - Override faction modifier
 * @param {number} [params.tl=2] - Origin Tech Level (0-5)
 * @param {number} [params.tlMod] - Override TL modifier
 * @param {number} [params.skillRanks=0] - Commerce/Finance skill bonus
 * @returns {{ computedWS: number, status: typeof FINANCIAL_STATUS_TABLE[0], breakdown: object }}
 */
export function calculateStartingWealth({
  occupationBase = 10,
  occupationWS,
  originMod = 0,
  faction = 'Coalition',
  factionMod,
  tl = 2,
  tlMod,
  skillRanks = 0
} = {}) {
  const baseWS = occupationWS !== undefined ? Number(occupationWS) : Number(occupationBase);
  const fMod = factionMod !== undefined ? Number(factionMod) : (FACTION_WEALTH_MODS[faction] ?? 0);
  const tMod = tlMod !== undefined ? Number(tlMod) : (TECH_LEVELS[tl]?.wealthMod ?? 0);

  const totalWS = Math.max(0, baseWS + Number(originMod) + fMod + tMod + Number(skillRanks));
  const status = getFinancialStatus(totalWS);

  return {
    computedWS: totalWS,
    status,
    breakdown: {
      occupationBase: baseWS,
      originMod,
      factionMod: fMod,
      tlMod: tMod,
      skillRanks
    }
  };
}

/**
 * Calculate speculative trade cargo profit pipeline between world trade codes.
 * @param {object} params
 * @param {string} params.commodityId - Commodity ID from COMMODITIES
 * @param {string} params.sourceTradeCode - Source world trade code key (e.g., 'Ag', 'In')
 * @param {string} params.destTradeCode - Destination world trade code key (e.g., 'Hi', 'Na')
 * @param {number} [params.tonnage=10] - Cargo tonnage
 * @param {number} [params.tons=10] - Alias for tonnage
 * @param {number} [params.marketRoll=0] - Market volatility roll modifier (-15 to +15%)
 * @returns {object} Trade profit calculation breakdown
 */
export function calculateTradeProfit({
  commodityId,
  sourceTradeCode,
  destTradeCode,
  tonnage,
  tons = 10,
  marketRoll = 0
} = {}) {
  const tonsCount = tonnage !== undefined ? Number(tonnage) : Number(tons);
  const commodity = COMMODITIES.find(c => c.id === commodityId) || COMMODITIES[0];
  const sourceWorld = WORLD_TRADE_CODES[sourceTradeCode] || { modifiers: {} };
  const destWorld = WORLD_TRADE_CODES[destTradeCode] || { modifiers: {} };

  const sourceMod = (sourceWorld.modifiers[commodity.name] || 0) / 100;
  const destMod = (destWorld.modifiers[commodity.name] || 0) / 100;
  const volatilityMod = (Number(marketRoll) || 0) / 100;

  const buyPricePerTon = Math.max(10, Math.round(commodity.baseCostPerTon * (1 + sourceMod)));
  const sellPricePerTon = Math.max(10, Math.round(commodity.baseCostPerTon * (1 + destMod + volatilityMod)));

  const totalBuyCost = buyPricePerTon * tonsCount;
  const totalSellRevenue = sellPricePerTon * tonsCount;
  const netProfit = totalSellRevenue - totalBuyCost;
  const profitMarginPercent = totalBuyCost > 0 ? Math.round((netProfit / totalBuyCost) * 1000) / 10 : 0;

  return {
    commodityName: commodity.name,
    tonnage: tonsCount,
    buyPricePerTon,
    sellPricePerTon,
    totalBuyCost,
    totalSellRevenue,
    netProfit,
    profitMargin: `${profitMarginPercent}%`,
    profitMarginPercent
  };
}

/**
 * Calculate cooperative/industrial fabrication calendar.
 * @param {number} workers - Number of concurrent workers
 * @param {number} avgCheck - Average crafting skill check
 * @param {number} tierMultiplier - Tool tier multiplier
 * @param {number} creditValue - Total project credit value
 * @returns {{ combinedDailyPP: number, totalDailyPP: number, perWorkerDailyPP: number, totalDays: number, daysRequired: number, formatted: string, humanized: string }}
 */
export function calculateCooperativeCrafting(workers = 1, avgCheck = 20, tierMultiplier = 10, creditValue = 2560) {
  const teamSize = Math.max(1, Number(workers) || 1);
  const singleDailyPP = Math.max(1, (avgCheck - 10) * tierMultiplier);
  const combinedDailyPP = teamSize * singleDailyPP;

  const val = Math.max(0, Number(creditValue) || 0);
  const totalDays = val > 0 ? Math.round((val / combinedDailyPP) * 100) / 100 : 0;

  return {
    combinedDailyPP,
    totalDailyPP: combinedDailyPP,
    perWorkerDailyPP: singleDailyPP,
    daysRequired: totalDays,
    totalDays,
    formatted: formatCraftingDuration(totalDays),
    humanized: formatCraftingDuration(totalDays)
  };
}

/**
 * Calculate wealth score growth investment cost (gold-sink formula).
 * Cost to raise WS by 1 = Credit Value of Auto-Buy threshold of target WS.
 * @param {number} currentWS - Starting Wealth Score
 * @param {number} targetWS - Desired Wealth Score
 * @returns {number} Total credits required for economic advancement
 */
export function calculateWealthGrowthCost(currentWS, targetWS) {
  const start = Math.max(0, Number(currentWS) || 0);
  const end = Math.max(start, Number(targetWS) || 0);
  let totalCost = 0;

  for (let ws = start + 1; ws <= end; ws++) {
    const status = getFinancialStatus(ws);
    totalCost += status.autoBuyCr > 0 ? status.autoBuyCr : calculateCreditValue(ws);
  }

  return totalCost;
}
