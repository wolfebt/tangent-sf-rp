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
  COMMODITIES,
  OCCUPATION_WEALTH_BASE,
  ORIGIN_WEALTH_MODS,
  SKILL_STAGE_WEALTH_BONUS,
  QUALIFYING_WEALTH_SKILLS,
  WEALTH_TRAIT_FEATURE_MODS
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
 * Calculate Crafting / Purchase DC from Credit Value via the Tangent Standard Curve (TSC) inverse formula.
 * The Golden Rule of Tangent Wealth: Crafting DC = Purchase DC = Cost DC.
 * Formula: DC = round(2.5 * log2(max(10, credits) / 10))
 * @param {number} credits - Market credit value
 * @returns {number} Crafting / Purchase DC (integer >= 0)
 */
export function calculateDCFromCredits(credits) {
  const numCr = Math.max(10, Number(credits) || 0);
  return Math.max(0, Math.round(2.5 * Math.log2(numCr / 10)));
}

export const calculateItemDC = calculateDCFromCredits;
export const calculatePurchaseDC = calculateDCFromCredits;
export const calculateCraftingDC = calculateDCFromCredits;

/**
 * Resolves the operational/complexity Cost DC (Crafting DC / Purchase DC) for any catalog or inventory item.
 * Follows the Golden Rule of Tangent Wealth: Purchase DC = Crafting DC = Cost DC.
 * @param {object} item - Item object
 * @returns {number} Crafting / Purchase DC
 */
export function resolveItemCostDC(item) {
  if (!item || typeof item !== 'object') return 10;
  if (item.craft_dc !== undefined && item.craft_dc !== null && item.craft_dc !== '') {
    return Math.max(0, parseInt(item.craft_dc, 10) || 0);
  }
  if (item.design_dc !== undefined && item.design_dc !== null && item.design_dc !== '') {
    return Math.max(0, parseInt(item.design_dc, 10) || 0);
  }
  if (item.base_dc !== undefined && item.base_dc !== null && item.base_dc !== '') {
    return Math.max(0, parseInt(item.base_dc, 10) || 0);
  }
  if (item.purchase_dc !== undefined && item.purchase_dc !== null && item.purchase_dc !== '') {
    return Math.max(0, parseInt(item.purchase_dc, 10) || 0);
  }
  if (item.craftDc !== undefined && item.craftDc !== null && item.craftDc !== '') {
    return Math.max(0, parseInt(item.craftDc, 10) || 0);
  }
  if (item.cost_dc !== undefined && item.cost_dc !== null && item.cost_dc !== '') {
    return Math.max(0, parseInt(item.cost_dc, 10) || 0);
  }
  if (item.dc !== undefined && item.dc !== null && item.dc !== '') {
    return Math.max(0, parseInt(item.dc, 10) || 0);
  }
  const crCandidates = [
    item.costs?.credits,
    item.creditCost,
    item.credit_cost,
    item.credits,
    item.credit_value,
    item.cost,
    item.price
  ];
  const validCr = crCandidates.find(c => c !== undefined && c !== null && c !== '' && Number(c) > 0);
  if (validCr !== undefined) {
    return calculateDCFromCredits(validCr);
  }
  if (item.tech_level !== undefined && item.tech_level !== null && Number(item.tech_level) > 0) {
    return Math.max(5, Number(item.tech_level) * 5);
  }
  return 10; // Default baseline DC 10 (160 Cr) for standard equipment
}


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
 * Follows the canonical EUFT Gap Rule:
 * - Auto-Buy when Item DC <= Player WS (Gap = 0 Cr).
 * - Otherwise, Liquid Cost = Value(Item DC) - Value(Character WS).
 * @param {number} itemDC - Item complexity DC
 * @param {number} playerWS - Player character's Wealth Score
 * @returns {{ itemDC: number, playerWS: number, itemValue: number, playerWSValue: number, tierAutoBuyLimit: number, liquidGapCost: number, liquidCost: number, autoBuy: boolean, isAutoBuy: boolean }}
 */
export function calculateLiquidityGap(itemDC, playerWS) {
  const dc = Number(itemDC) || 0;
  const ws = Number(playerWS) || 0;
  const itemVal = calculateCreditValue(dc);
  const wsStatus = getFinancialStatus(ws);
  const exactWSValue = ws > 0 ? calculateCreditValue(ws) : 0;
  const tierAutoBuyLimit = wsStatus && wsStatus.autoBuyCr !== undefined ? wsStatus.autoBuyCr : exactWSValue;
  const isAutoBuy = dc <= ws;
  const gap = isAutoBuy ? 0 : Math.max(0, itemVal - exactWSValue);
  const surplus = isAutoBuy ? Math.max(0, exactWSValue - itemVal) : 0;
  return {
    itemDC: dc,
    playerWS: ws,
    itemValue: itemVal,
    playerWSValue: exactWSValue,
    tierAutoBuyLimit,
    liquidGapCost: gap,
    liquidCost: gap,
    autoBuy: isAutoBuy,
    isAutoBuy,
    canAfford: isAutoBuy,
    marginCredits: surplus,
    shortfallCredits: gap
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

  const creditValue = calculateCreditValue(totalWS);

  return {
    computedWS: totalWS,
    wealthScore: totalWS,
    status,
    financialStatus: status,
    statusName: status?.name || 'Middle Class',
    autoBuyCr: status?.autoBuyCr ?? creditValue,
    creditValue,
    startingCredits: creditValue,
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
 * Calculate full character Wealth Score (WS), Financial Status ranking, and Credit Auto-Buy Limit
 * from live character data (identity fields, origin, faction, tech level, skills, and manual adjustments).
 * @param {object} characterData - Folio character data object
 * @returns {{
 *   computedWS: number,
 *   wealthScore: number,
 *   status: typeof FINANCIAL_STATUS_TABLE[0],
 *   statusName: string,
 *   autoBuyCr: number,
 *   creditValue: number,
 *   breakdown: {
 *     occupation: string,
 *     occupationBase: number,
 *     origin: string,
 *     originMod: number,
 *     faction: string,
 *     factionMod: number,
 *     techLevel: number,
 *     tlMod: number,
 *     qualifyingSkill: string|null,
 *     highestSkillRank: number,
 *     skillStage: string,
 *     skillBonus: number,
 *     customMod: number
 *   }
 * }}
 */
export function calculateCharacterWealth(characterData = {}) {
  // Extract liquid credits, trade goods & debits totals
  const rawCredits = characterData['credits'] ?? characterData['wealth-credits'] ?? 0;
  const liquidCredits = Math.max(0, parseInt(rawCredits, 10) || 0);

  let tradeGoods = [];
  const rawGoods = characterData['trade-goods'] ?? characterData['wealth-trade-goods'];
  if (Array.isArray(rawGoods)) {
    tradeGoods = rawGoods;
  } else if (typeof rawGoods === 'string' && rawGoods.trim()) {
    try {
      const parsed = JSON.parse(rawGoods);
      if (Array.isArray(parsed)) tradeGoods = parsed;
    } catch {}
  }
  const totalTradeGoodsCr = tradeGoods.reduce((sum, item) => sum + (Number(item?.creditValue) || 0), 0);
  const totalLiquidCr = liquidCredits + totalTradeGoodsCr;

  let debits = [];
  const rawDebits = characterData['debits'] ?? characterData['wealth-debits'];
  if (Array.isArray(rawDebits)) {
    debits = rawDebits;
  } else if (typeof rawDebits === 'string' && rawDebits.trim()) {
    try {
      const parsed = JSON.parse(rawDebits);
      if (Array.isArray(parsed)) debits = parsed;
    } catch {}
  }
  const totalDebtCr = debits.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const netLiquidPosition = totalLiquidCr - totalDebtCr;

  // If character has an explicit manual override score defined
  const explicitWS = characterData['wealth-score-override'] ?? characterData.wealthScoreOverride;
  if (explicitWS !== undefined && explicitWS !== null && explicitWS !== '') {
    const forcedWS = Math.max(0, parseInt(explicitWS, 10) || 0);
    const forcedStatus = getFinancialStatus(forcedWS);
    return {
      computedWS: forcedWS,
      wealthScore: forcedWS,
      status: forcedStatus,
      statusName: forcedStatus?.name || 'Middle Class',
      autoBuyCr: forcedStatus?.autoBuyCr ?? calculateCreditValue(forcedWS),
      creditValue: calculateCreditValue(forcedWS),
      liquidCredits,
      tradeGoods,
      totalTradeGoodsCr,
      totalLiquidCr,
      debits,
      totalDebtCr,
      netLiquidPosition,
      breakdown: {
        occupation: 'Custom Override',
        occupationBase: forcedWS,
        origin: 'N/A',
        originMod: 0,
        faction: 'N/A',
        factionMod: 0,
        techLevel: 3,
        tlMod: 0,
        qualifyingSkill: null,
        highestSkillRank: 0,
        skillStage: 'None',
        skillBonus: 0,
        customMod: 0
      }
    };
  }

  // 1. Occupation Base WS (WS 1 - 6)
  const occuRaw = characterData['char-occu'] || characterData.occupation || '';
  let occuBase = 2; // Default baseline (Citizen)
  let occuName = 'Citizen';
  
  if (occuRaw) {
    const rawClean = String(occuRaw).trim().toLowerCase();
    for (const [key, val] of Object.entries(OCCUPATION_WEALTH_BASE)) {
      if (rawClean.includes(key.toLowerCase()) || key.toLowerCase().includes(rawClean)) {
        occuBase = val;
        occuName = key;
        break;
      }
    }
  }

  // 2. Origin Wealth Modifier (+0 to +3)
  const originRaw = characterData['char-origin'] || characterData.origin || '';
  let originMod = 0;
  let originName = 'Standard';
  if (originRaw) {
    const rawClean = String(originRaw).trim().toLowerCase();
    for (const [key, val] of Object.entries(ORIGIN_WEALTH_MODS)) {
      if (rawClean.includes(key.toLowerCase()) || key.toLowerCase().includes(rawClean)) {
        originMod = val;
        originName = key;
        break;
      }
    }
  }

  // 3. Faction Wealth Modifier (+0 to +6)
  const factionRaw = characterData['char-faction'] || characterData.faction || '';
  let factionMod = 0;
  let factionName = 'Coalition';
  if (factionRaw) {
    const rawClean = String(factionRaw).trim().toLowerCase();
    for (const [key, val] of Object.entries(FACTION_WEALTH_MODS)) {
      if (rawClean.includes(key.toLowerCase()) || key.toLowerCase().includes(rawClean)) {
        factionMod = val;
        factionName = key;
        break;
      }
    }
  }

  // 4. Tech Level Modifier (-4 to +8)
  const tlRaw = characterData['tech-level'] ?? characterData.techLevel ?? 3;
  const tl = Math.max(0, Math.min(5, parseInt(tlRaw, 10) || 0));
  const tlMod = TECH_LEVELS[tl]?.wealthMod ?? 0;

  // 5. Vocation / Commercial Skill Bonus (Highest qualifying skill rank stage + secondary Rank 6+ trade skills)
  let maxQualifyingRank = 0;
  let qualifyingSkillName = null;
  const qualifyingSkillMap = new Map();

  // Scan skill fields in characterData (e.g. skill-vocation-rank, skill-trade-rank, etc.)
  for (const [key, val] of Object.entries(characterData)) {
    if (key.startsWith('skill-') && key.endsWith('-rank')) {
      const rank = parseInt(val, 10) || 0;
      if (rank > 0) {
        const cleanKey = key.replace(/^skill-/, '').replace(/-rank$/, '').toLowerCase();
        const matches = QUALIFYING_WEALTH_SKILLS.some(qs => cleanKey.includes(qs));
        if (matches) {
          const displayName = cleanKey.replace(/[-_]/g, ' ');
          const prevRank = qualifyingSkillMap.get(displayName) || 0;
          if (rank > prevRank) qualifyingSkillMap.set(displayName, rank);
          if (rank > maxQualifyingRank) {
            maxQualifyingRank = rank;
            qualifyingSkillName = displayName;
          }
        }
      }
    }
  }

  // Also scan array of skills if present (e.g. characterData.skills)
  if (Array.isArray(characterData.skills)) {
    characterData.skills.forEach(s => {
      const rank = parseInt(s?.rank || s?.value || 0, 10);
      const name = String(s?.name || s?.id || '').toLowerCase();
      if (rank > 0 && QUALIFYING_WEALTH_SKILLS.some(qs => name.includes(qs))) {
        const displayName = s?.name || name;
        const normKey = displayName.toLowerCase().replace(/[-_]/g, ' ');
        const prevRank = qualifyingSkillMap.get(normKey) || 0;
        if (rank > prevRank) qualifyingSkillMap.set(normKey, rank);
        if (rank > maxQualifyingRank) {
          maxQualifyingRank = rank;
          qualifyingSkillName = displayName;
        }
      }
    });
  }

  // Check explicit skillRanks or skillBonus override if provided
  if (characterData.skillRanks && Number(characterData.skillRanks) > maxQualifyingRank) {
    maxQualifyingRank = Number(characterData.skillRanks);
  }

  // Map highest qualifying skill rank to Rank Stage Wealth Bonus (+1 to +5)
  let primarySkillBonus = 0;
  let skillStageName = 'None';
  for (const stage of SKILL_STAGE_WEALTH_BONUS) {
    if (maxQualifyingRank >= stage.minRank) {
      primarySkillBonus = stage.bonus;
      skillStageName = stage.stage;
    }
  }

  // Secondary Trade Skill Bonus: +1 WS per additional qualifying skill at Rank 6+, capped by primary skill stage bonus
  let additionalRank6Count = 0;
  let primaryCounted = false;
  for (const [, r] of qualifyingSkillMap.entries()) {
    if (!primaryCounted && r === maxQualifyingRank) {
      primaryCounted = true;
      continue;
    }
    if (r >= 6) {
      additionalRank6Count += 1;
    }
  }
  const secondarySkillBonus = Math.min(primarySkillBonus, additionalRank6Count);
  const skillBonus = primarySkillBonus + secondarySkillBonus;

  // 6. Traits, Features & Hindrances Wealth Modifiers (e.g. High Pay +2, Benefit (Wealth) +3/rank, Benefit (Status) +2/rank, Debt -2)
  let traitFeatureMod = 0;
  const traitFeatureSources = [];
  const seenTraitFeatureKeys = new Set();

  const parsePoolList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return raw.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const allPossessedEntries = [
    ...parsePoolList(characterData.features),
    ...parsePoolList(characterData.traits),
    ...parsePoolList(characterData.hindrances),
    ...parsePoolList(characterData.disadvantages),
    ...parsePoolList(characterData['pool-faction-features']),
    ...parsePoolList(characterData['pool-occu-traits']),
    ...parsePoolList(characterData['pool-origin-traits']),
    ...parsePoolList(characterData['pool-species-traits'])
  ];

  for (const entry of allPossessedEntries) {
    if (!entry) continue;
    const isObj = typeof entry === 'object';
    const rawId = isObj ? String(entry.id || '').trim().toLowerCase() : '';
    const rawName = isObj ? String(entry.name || entry.title || entry.id || '').trim() : String(entry).trim();
    const normName = rawName.toLowerCase();
    const dedupKey = rawId || normName;
    if (!dedupKey || seenTraitFeatureKeys.has(dedupKey)) continue;
    seenTraitFeatureKeys.add(dedupKey);

    const ranks = isObj ? Math.max(1, parseInt(entry.rank ?? entry.ranks ?? entry.level ?? 1, 10) || 1) : 1;
    let entryMod = 0;

    if (isObj && Array.isArray(entry.modifiers) && entry.modifiers.length > 0) {
      for (const m of entry.modifiers) {
        if (!m) continue;
        const mType = String(m.type || '').toLowerCase();
        const mTarget = String(m.target || '').toLowerCase();
        if (mType === 'wealth' || mTarget === 'wealth' || mTarget === 'wealth score') {
          entryMod += (Number(m.value) || 0) * ranks;
        }
      }
    }

    if (entryMod === 0) {
      const lookupVal = WEALTH_TRAIT_FEATURE_MODS[rawId] ?? WEALTH_TRAIT_FEATURE_MODS[normName];
      if (lookupVal !== undefined) {
        entryMod = lookupVal * ranks;
      }
    }

    if (entryMod !== 0) {
      traitFeatureMod += entryMod;
      traitFeatureSources.push({ name: rawName, mod: entryMod, ranks });
    }
  }

  // Delinquent Cycle Debt Repercussion: If a debt remains unpaid after a wealth cycle rollover,
  // it imposes a -2 WS penalty (equivalent to the Debt Hindrance) until settled.
  const hasDelinquentDebt = debits.some(
    d => d && (Number(d.amount) || 0) > 0 && (d.status === 'delinquent' || (Number(d.missedCycles) || 0) > 0)
  );
  if (hasDelinquentDebt && !seenTraitFeatureKeys.has('debt') && !seenTraitFeatureKeys.has('hindrance-debt')) {
    traitFeatureMod -= 2;
    traitFeatureSources.push({ name: 'Delinquent Cycle Debt (Unpaid Rollover)', mod: -2, ranks: 1 });
  }

  // 7. Custom / Manual Wealth Modifier
  const customMod = parseInt(
    characterData['wealth-score-mod'] ?? characterData['wealth-mod'] ?? characterData.wealthMod ?? 0,
    10
  ) || 0;

  // Total Wealth Score
  const totalWS = Math.max(0, occuBase + originMod + factionMod + tlMod + skillBonus + traitFeatureMod + customMod);
  const status = getFinancialStatus(totalWS);
  const autoBuyCr = status?.autoBuyCr ?? calculateCreditValue(totalWS);
  const exactAutoBuyCr = totalWS > 0 ? calculateCreditValue(totalWS) : 0;
  const creditValue = exactAutoBuyCr;

  return {
    computedWS: totalWS,
    wealthScore: totalWS,
    status,
    statusName: status?.name || 'Middle Class',
    autoBuyCr,
    exactAutoBuyCr,
    creditValue,
    liquidCredits,
    tradeGoods,
    totalTradeGoodsCr,
    totalLiquidCr,
    debits,
    totalDebtCr,
    netLiquidPosition,
    breakdown: {
      occupation: occuName,
      occupationBase: occuBase,
      origin: originName,
      originMod,
      faction: factionName,
      factionMod,
      techLevel: tl,
      tlMod,
      qualifyingSkill: qualifyingSkillName,
      highestSkillRank: maxQualifyingRank,
      skillStage: skillStageName,
      primarySkillBonus,
      secondarySkillBonus,
      skillBonus,
      traitFeatureMod,
      traitFeatureSources,
      customMod
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

/**
 * Resolve a character's Wealth Cycle Rollover against outstanding Credit Debts.
 * When a character's wealth rolls over on their pay schedule / monthly cycle:
 * - 'full': Settles the targeted debt (or all debts) in full.
 * - 'rollover' / 'partial': Applies the character's cycle WS purchasing power (Value(WS)) or a custom payment
 *   toward outstanding debt(s), paying off what it covers and leaving any remaining balance for the next cycle.
 * - 'unpaid' / 'issue': Debt is not paid due to an issue or player choice; debt remains on the ledger,
 *   increments missedCycles, marks status as 'delinquent', and triggers repercussions (-2 WS penalty & creditor escalation).
 *
 * @param {Array<object>} debits - Current array of debit entries
 * @param {number} playerWS - Character's current Wealth Score
 * @param {object} [options] - Rollover options
 * @param {'full'|'rollover'|'partial'|'unpaid'|'issue'} [options.mode='rollover'] - Settlement mode
 * @param {number|null} [options.customPayment=null] - Explicit credit amount to apply in 'partial'/'rollover' mode
 * @param {string|number|null} [options.targetDebtId=null] - Optional specific debt ID or index to settle
 * @param {number} [options.lateFeeRate=0] - Optional fractional late fee on unpaid delinquent debt (e.g. 0.1 for 10%)
 * @returns {{
 *   updatedDebits: Array<object>,
 *   totalPaidCr: number,
 *   remainingDebtCr: number,
 *   paidOffCount: number,
 *   delinquentCount: number,
 *   hasRepercussions: boolean,
 *   wsPenalty: number,
 *   cycleCapacityCr: number
 * }}
 */
export function resolveWealthCycleRollover(debits = [], playerWS = 10, options = {}) {
  const {
    mode = 'rollover',
    customPayment = null,
    targetDebtId = null,
    lateFeeRate = 0
  } = options;

  const list = Array.isArray(debits) ? debits.map(d => ({ ...d })) : [];
  const ws = Math.max(0, Number(playerWS) || 0);
  const cycleCapacityCr = ws > 0 ? calculateCreditValue(ws) : 0;

  let budget = customPayment !== null && customPayment !== undefined
    ? Math.max(0, Number(customPayment) || 0)
    : cycleCapacityCr;

  let totalPaidCr = 0;
  let paidOffCount = 0;
  const updatedDebits = [];

  list.forEach((debt, idx) => {
    const currentAmt = Math.max(0, Number(debt?.amount) || 0);
    if (currentAmt <= 0) return;

    const isTargeted = targetDebtId === null || targetDebtId === undefined || debt.id === targetDebtId || idx === targetDebtId;
    if (!isTargeted) {
      updatedDebits.push(debt);
      return;
    }

    if (mode === 'full') {
      totalPaidCr += currentAmt;
      paidOffCount += 1;
      return; // Debt fully paid off and removed
    }

    if (mode === 'unpaid' || mode === 'issue') {
      const missed = (Number(debt.missedCycles) || 0) + 1;
      const fee = lateFeeRate > 0 ? Math.round(currentAmt * lateFeeRate) : 0;
      const newAmt = currentAmt + fee;
      const baseNotes = String(debt.notes || '').replace(/\s*\[Delinquent:.*?\]$/i, '').trim();
      updatedDebits.push({
        ...debt,
        amount: newAmt,
        status: 'delinquent',
        missedCycles: missed,
        notes: `${baseNotes ? `${baseNotes} ` : ''}[Delinquent: ${missed} missed ${missed === 1 ? 'cycle' : 'cycles'} — -2 WS Repercussion]`
      });
      return;
    }

    // Default: 'rollover' / 'partial'
    if (budget >= currentAmt) {
      budget -= currentAmt;
      totalPaidCr += currentAmt;
      paidOffCount += 1;
      return; // Fully covered by cycle rollover
    } else if (budget > 0) {
      const remaining = currentAmt - budget;
      totalPaidCr += budget;
      budget = 0;
      updatedDebits.push({
        ...debt,
        amount: remaining,
        status: debt.status === 'delinquent' ? 'active' : (debt.status || 'active'),
        notes: debt.notes
          ? `${String(debt.notes).replace(/\s*\(Partial rollover paid.*?\)$/i, '')} (Partial rollover paid; ${remaining.toLocaleString()} Cr remaining)`
          : `Partial cycle rollover paid; ${remaining.toLocaleString()} Cr remaining for next cycle`
      });
    } else {
      updatedDebits.push(debt);
    }
  });

  const remainingDebtCr = updatedDebits.reduce((sum, d) => sum + (Number(d?.amount) || 0), 0);
  const delinquentCount = updatedDebits.filter(
    d => d.status === 'delinquent' || (Number(d.missedCycles) || 0) > 0
  ).length;

  return {
    updatedDebits,
    totalPaidCr,
    remainingDebtCr,
    paidOffCount,
    delinquentCount,
    hasRepercussions: delinquentCount > 0,
    wsPenalty: delinquentCount > 0 ? -2 : 0,
    cycleCapacityCr
  };
}
