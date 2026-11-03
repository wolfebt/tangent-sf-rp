/**
 * Advanced Clamped Dice Engine and Target DC Resolver for Tangent SF RP.
 * Strictly enforces mechanical limits:
 * - Advantage / Disadvantage dice pools capped at +/- 5 extra dice.
 * - Flat modifiers capped at +/- 20.
 * - Critical / Fumble threat expansions capped at 1 to 5 range size.
 * - Full state separation of advantageDice from flatModifier.
 */

/**
 * Generates a random integer on a standard 10-sided die [1, 10].
 * @returns {number} Integer between 1 and 10.
 */
export function rollD10() {
  return Math.floor(Math.random() * 10) + 1;
}

/**
 * Standard Target Challenge Ratings (CRs) for Tangent SF RP.
 * Exported as both targetCRs and targetDCs for full backward compatibility.
 */
export const targetCRs = {
  simple: 0,
  routine: 5,
  challenging: 10,
  hard: 15,
  severe: 20,
  heroic: 25,
  epic: 30,
  miraculous: 35
};

export const targetDCs = targetCRs;

/**
 * Resolves net Advantage / Disadvantage dice pool shift with 1-for-1 opposing stack cancellation.
 * @param {Object} [options={}]
 * @returns {number} Net extra d10s (-5 to +5; positive = keep highest 2, negative = keep lowest 2).
 */
export function resolveNetAdvantageDice(options = {}) {
  if (options.advantageStacks !== undefined || options.disadvantageStacks !== undefined) {
    const advStacks = Math.max(0, Number(options.advantageStacks) || 0);
    const disStacks = Math.max(0, Number(options.disadvantageStacks) || 0);
    return Math.max(-5, Math.min(5, advStacks - disStacks));
  }
  if (options.advantageDice !== undefined) {
    return Math.max(-5, Math.min(5, Number(options.advantageDice) || 0));
  }
  const hasAdv = Boolean(options.advantage || options.isAdvantage || options.rollMode === 'advantage');
  const hasDis = Boolean(options.disadvantage || options.isDisadvantage || options.rollMode === 'disadvantage');
  if (hasAdv && hasDis) return 0; // Opposing stacks cancel 1-for-1
  if (hasAdv) return 1;
  if (hasDis) return -1;
  return 0;
}

/**
 * Executes a core Tangent 2d10 check with strict boundary clamping.
 *
 * @param {number} [advantageDice=0] - Extra dice pool expansion (-5 to +5).
 *                                     Positive = Advantage (keep 2 highest).
 *                                     Negative = Disadvantage (keep 2 lowest).
 * @param {number} [flatModifier=0] - Flat modifier applied to the kept sum (-20 to +70).
 * @param {number} [critRangeSize=1] - Critical threat range size (1 to 5: 1=20, 5=16-20).
 * @param {number} [fumbleRangeSize=1] - Fumble threat range size (1 to 5: 1=2, 5=2-6).
 * @param {boolean} [expandedThreat=true] - When true, a Critical adds +10 in addition to the rolled dice value
 *                                          (e.g. 20 -> 30, 19 -> 29, 18 -> 28) and any Fumble replaces the
 *                                          rolled dice value with a flat -10 (subtracting 10 from base score).
 * @returns {Object} Full clamped roll result containing dicePool, keptDice, totals, thresholds, and flags.
 */
export function executeTangentRoll(
  advantageDice = 0,    // Accepts -5 to +5
  flatModifier = 0,     // Accepts -20 to +70 (Base score 0 to 50 + Ad-Hoc -20 to +20)
  critRangeSize = 1,    // Accepts 1 to 5 (e.g., 1 = 20, 5 = 16-20)
  fumbleRangeSize = 1,  // Accepts 1 to 5 (e.g., 1 = 2, 5 = 2-6)
  expandedThreat = true // Default true: Crit = rolled + 10, Fumble = flat -10
) {
  // Clamp inputs to strictly enforce engine limits
  const clampedAdvantage = Math.max(-5, Math.min(5, Number(advantageDice) || 0));
  const clampedModifier = Math.max(-20, Math.min(70, Number(flatModifier) || 0));
  const clampedCritSize = Math.max(1, Math.min(5, Number(critRangeSize) || 1));
  const clampedFumbleSize = Math.max(1, Math.min(5, Number(fumbleRangeSize) || 1));
  const isExpanded = expandedThreat !== undefined ? Boolean(expandedThreat) : true;

  const dicePoolSize = 2 + Math.abs(clampedAdvantage);
  let rolls = [];

  for (let i = 0; i < dicePoolSize; i++) {
    rolls.push(rollD10());
  }

  // Sort rolls descending for Advantage (positive), ascending for Disadvantage (negative)
  if (clampedAdvantage >= 0) {
    rolls.sort(function(a, b){return b - a;});
  } else {
    rolls.sort(function(a, b){return a - b;});
  }

  let keptDice = [rolls[0], rolls[1]];
  let rawNaturalTotal = keptDice[0] + keptDice[1];

  // Calculate dynamic thresholds based on the 1 to 5 range size
  const critThreshold = 21 - clampedCritSize; 
  const fumbleThreshold = 1 + clampedFumbleSize;

  let isCrit = rawNaturalTotal >= critThreshold;
  let isFumble = !isCrit && rawNaturalTotal <= fumbleThreshold;

  // Canonical 3.00 COMBAT.md / 00.02 Rule 4:
  // - Critical: adds +10 in addition to the rolled dice value (e.g., 20 -> 30, 19 -> 29, 18 -> 28)
  // - Fumble: replaces the rolled dice value with a flat -10 (whether rolled on 2, 3, 4..., subtracting 10 from base score)
  let naturalTotal = rawNaturalTotal;
  if (isExpanded) {
    if (isCrit) {
      naturalTotal = rawNaturalTotal + 10;
    } else if (isFumble) {
      naturalTotal = -10;
    }
  }

  let finalTotal = naturalTotal + clampedModifier;

  return {
    dicePool: rolls,
    keptDice: keptDice,
    rawNaturalTotal: rawNaturalTotal,
    naturalTotal: naturalTotal,
    finalTotal: finalTotal,
    isCrit: isCrit,
    isFumble: isFumble,
    expandedThreat: isExpanded,
    appliedModifier: clampedModifier,
    critThreshold: critThreshold,
    fumbleThreshold: fumbleThreshold,
    advantageDice: clampedAdvantage,
    critRangeSize: clampedCritSize,
    fumbleRangeSize: clampedFumbleSize
  };
}

/**
 * Resolves a roll result against a target Challenge Rating (CR).
 * Criticals and fumbles supersede standard +/- 10 margin.
 *
 * @param {Object} rollResult - Result from executeTangentRoll.
 * @param {number|string} targetCR - Numeric CR or key in targetCRs ('challenging', etc.).
 * @returns {Object} Adjudication containing outcome, margin, finalTotal, targetCR, and targetDC.
 */
export function resolveCheck(rollResult, targetCR) {
  let crNumber = 0;
  if (typeof targetCR === 'string' && targetCRs[targetCR.toLowerCase()] !== undefined) {
    crNumber = targetCRs[targetCR.toLowerCase()];
  } else if (targetCR !== undefined && targetCR !== null && !isNaN(Number(targetCR))) {
    crNumber = Number(targetCR);
  }

  let degreeOfSuccess = rollResult.finalTotal - crNumber;
  let outcome = "Failure";

  // Criticals and fumbles supersede standard +/- 10 margin
  if (rollResult.isCrit) {
    outcome = "Critical Success";
  } else if (rollResult.isFumble) {
    outcome = "Critical Failure";
  } else if (degreeOfSuccess >= 10) {
    outcome = "Overwhelming Success"; 
  } else if (degreeOfSuccess <= -10) {
    outcome = "Catastrophic Failure"; 
  } else if (degreeOfSuccess >= 0) {
    outcome = "Success";
  }

  return {
    outcome: outcome,
    margin: degreeOfSuccess,
    finalTotal: rollResult.finalTotal,
    targetCR: crNumber,
    targetDC: crNumber
  };
}

/**
 * Parses generic dice expressions like "2d10+4", "d20", "3d10!", "4d6k3-2".
 */
export function parseDiceExpression(expression = '2d10') {
  const clean = String(expression).replace(/\s+/g, '').toLowerCase();
  const regex = /^(\d+)?d(\d+)(!)?(?:k(\d+))?([+-]\d+)?$/i;
  const match = clean.match(regex);

  if (!match) {
    return { count: 2, sides: 10, exploding: false, keep: null, modifier: 0 };
  }

  const count = parseInt(match[1] || '1', 10);
  const sides = parseInt(match[2], 10);
  const exploding = Boolean(match[3]);
  const keep = match[4] ? parseInt(match[4], 10) : null;
  const modifier = parseInt(match[5] || '0', 10);

  return { count: Math.min(count, 50), sides, exploding, keep, modifier };
}

// In-memory memoization cache for calculated dice distributions
const distributionCache = new Map();

/**
 * Computes exact Probability Mass Function (PMF) for rolling N dice of S sides,
 * keeping K highest (or K lowest if advantageDice < 0).
 *
 * @param {number} [count=2] - Base dice count (e.g. 2 for 2d10)
 * @param {number} [sides=10] - Number of sides per die (e.g. 10 for d10)
 * @param {number|null} [keep=null] - How many dice to keep (default: count === 1 ? 1 : count)
 * @param {number} [advantageDice=0] - Positive for advantage, negative for disadvantage
 * @returns {Record<number, number>} Map of naturalTotal -> exact probability [0, 1]
 */
export function getDiceDistribution(count = 2, sides = 10, keep = null, advantageDice = 0) {
  const baseCount = Math.max(1, Math.min(30, Number(count) || 2));
  const numSides = Math.max(2, Math.min(100, Number(sides) || 10));
  const clampedAdv = Math.max(-10, Math.min(10, Number(advantageDice) || 0));
  const isDis = clampedAdv < 0;
  const extra = Math.abs(clampedAdv);
  const N = baseCount + extra;
  const K = baseCount === 1 ? 1 : (keep ? Math.min(keep, baseCount) : baseCount);

  const cacheKey = `${baseCount}_${numSides}_${K}_${clampedAdv}`;
  if (distributionCache.has(cacheKey)) {
    return distributionCache.get(cacheKey);
  }

  // Fast path for single die keeping 1 (K = 1, e.g. 1d20, 1d10)
  if (K === 1) {
    const pmf = {};
    const totalOutcomes = Math.pow(numSides, N);
    for (let face = 1; face <= numSides; face++) {
      let ways;
      if (clampedAdv >= 0) {
        // Keeping 1 highest of N dice: P(max = face) = (face^N - (face - 1)^N) / numSides^N
        ways = Math.pow(face, N) - Math.pow(face - 1, N);
      } else {
        // Keeping 1 lowest of N dice: P(min = face) = ((numSides - face + 1)^N - (numSides - face)^N) / numSides^N
        ways = Math.pow(numSides - face + 1, N) - Math.pow(numSides - face, N);
      }
      pmf[face] = ways / totalOutcomes;
    }
    distributionCache.set(cacheKey, pmf);
    return pmf;
  }

  // Dynamic Programming for keeping K highest of N dice of numSides faces
  // Symmetrical: keeping K lowest is symmetric to keeping K highest, where finalSum = K * (numSides + 1) - highestSum
  const maxSum = K * numSides;
  const strideSum = 1;
  const strideKept = maxSum + 1;
  const strideUsed = (K + 1) * strideKept;
  
  let currentDP = new Float64Array((N + 1) * (K + 1) * (maxSum + 1));
  currentDP[0] = 1; // 0 dice used, 0 kept, sum 0 = 1 way

  // Binomial coefficients C(n, k)
  const C = Array.from({ length: N + 1 }, (_, n) => 
    Array.from({ length: n + 1 }, (_, k) => {
      if (k === 0 || k === n) return 1;
      let res = 1;
      for (let i = 1; i <= k; i++) res = (res * (n - i + 1)) / i;
      return res;
    })
  );

  // Transition from face numSides down to 1
  for (let face = numSides; face >= 1; face--) {
    const nextDP = new Float64Array((N + 1) * (K + 1) * (maxSum + 1));
    for (let u = 0; u <= N; u++) {
      for (let k = 0; k <= K; k++) {
        for (let s = 0; s <= maxSum; s++) {
          const ways = currentDP[u * strideUsed + k * strideKept + s];
          if (ways === 0) continue;

          const maxRollsThisFace = N - u;
          for (let m = 0; m <= maxRollsThisFace; m++) {
            const addedKept = Math.min(m, K - k);
            const addedSum = addedKept * face;
            const newU = u + m;
            const newK = k + addedKept;
            const newS = s + addedSum;
            nextDP[newU * strideUsed + newK * strideKept + newS] += ways * C[N - u][m];
          }
        }
      }
    }
    currentDP = nextDP;
  }

  const totalOutcomes = Math.pow(numSides, N);
  const pmf = {};
  for (let s = K * 1; s <= maxSum; s++) {
    const ways = currentDP[N * strideUsed + K * strideKept + s];
    if (ways > 0) {
      const finalSum = isDis ? (K * (numSides + 1) - s) : s;
      pmf[finalSum] = (pmf[finalSum] || 0) + (ways / totalOutcomes);
    }
  }

  distributionCache.set(cacheKey, pmf);
  return pmf;
}

/**
 * Formats a probability value [0, 1] into a clean human-readable percentage string.
 *
 * @param {number|null|undefined} val - Probability between 0 and 1.
 * @returns {string|null} Formatted string like "78.4%" or "<0.1%" or null if val is null.
 */
export function formatProbability(val) {
  if (val === null || val === undefined || isNaN(val)) return null;
  const pct = val * 100;
  if (pct > 0 && pct < 0.05) return '<0.1%';
  if (pct > 99.95 && pct < 100) return '>99.9%';
  return `${pct.toFixed(1)}%`;
}

/**
 * Calculates the exact odds of success, critical, and fumble for any roll configuration.
 * Fully accounts for:
 * - Die type and number (2d10 default, polyhedral presets, or custom count/sides/keep)
 * - Advantage / Disadvantage dice (e.g. roll 2+adv d10, take 2 highest or lowest)
 * - Critical threat range modifiers (1 to 5 range size or custom threshold)
 * - Fumble threat range modifiers (1 to 5 range size or custom threshold)
 * - Total flat modifiers (base + ad-hoc or parsed modifier)
 * - Set Target DC (Difficulty Class: named preset or custom numeric value)
 *
 * @param {string} [expression='2d10'] - Dice expression (e.g. '2d10', '1d20', '3d6', '2d10+4').
 * @param {Object} [options={}] - Configuration parameters.
 * @param {number} [options.advantageDice] - Advantage (+1 to +5) or Disadvantage (-1 to -5) dice.
 * @param {number} [options.flatModifier] - Total flat modifier.
 * @param {number} [options.baseModifier] - Base modifier (used if flatModifier not specified).
 * @param {number} [options.adHocModifier] - Ad-hoc modifier (used if flatModifier not specified).
 * @param {number} [options.modifier] - Legacy modifier alias.
 * @param {number} [options.critRangeSize=1] - Critical range size (1 to 5: 1=20, 5=16-20 on 2d10).
 * @param {number} [options.fumbleRangeSize=1] - Fumble range size (1 to 5: 1=2, 5=2-6 on 2d10).
 * @param {number} [options.critThreshold] - Explicit override for critical threshold.
 * @param {number} [options.fumbleThreshold] - Explicit override for fumble threshold.
 * @param {number|string} [options.targetDC] - Target Difficulty Class (e.g. 15, 'challenging').
 * @param {number|string} [options.targetNumber] - Target number alias.
 * @param {number} [options.count] - Optional explicit die count override.
 * @param {number} [options.sides] - Optional explicit die sides override.
 * @param {number} [options.keep] - Optional explicit keep count override.
 * @returns {Object} Comprehensive odds calculation with chances, formatted rates, and thresholds.
 */
export function calculateRollOdds(expression = '2d10', options = {}) {
  const cleanExpr = String(expression || '2d10').trim();
  const parsed = parseDiceExpression(cleanExpr);

  // Resolve die count and sides
  const baseCount = options.count !== undefined ? Number(options.count) || 1 : Math.max(1, parsed.count || 2);
  const sides = options.sides !== undefined ? Number(options.sides) || 10 : Math.max(2, parsed.sides || 10);
  const keep = options.keep !== undefined ? options.keep : parsed.keep;
  const keepCount = baseCount === 1 ? 1 : (keep ? Math.min(keep, baseCount) : baseCount);

  // Resolve advantage dice (supports 1-for-1 opposing stack cancellation)
  let advDice = 0;
  if (options.advantageStacks !== undefined || options.disadvantageStacks !== undefined) {
    advDice = (Math.max(0, Number(options.advantageStacks) || 0)) - (Math.max(0, Number(options.disadvantageStacks) || 0));
  } else if (options.advantageDice !== undefined) {
    advDice = Number(options.advantageDice) || 0;
  } else {
    advDice = resolveNetAdvantageDice(options);
  }
  const clampedAdv = Math.max(-10, Math.min(10, advDice));

  // Resolve flat modifier
  let flatMod = 0;
  if (options.flatModifier !== undefined && options.flatModifier !== 0) {
    flatMod = Number(options.flatModifier) || 0;
  } else if (options.baseModifier !== undefined || options.adHocModifier !== undefined) {
    const bMod = Number(options.baseModifier) || 0;
    const aMod = Number(options.adHocModifier) || 0;
    flatMod = bMod + aMod;
  } else if (options.modifier !== undefined && options.modifier !== 0) {
    flatMod = Number(options.modifier) || 0;
  } else {
    flatMod = parsed.modifier || 0;
  }

  // Resolve threat range sizes and thresholds
  const critSize = Math.max(1, Math.min(5, Number(options.critRangeSize) || 1));
  const fumbleSize = Math.max(1, Math.min(5, Number(options.fumbleRangeSize) || 1));
  const isExpanded = options.expandedThreat !== undefined ? Boolean(options.expandedThreat) : true;

  const maxNatural = keepCount * sides;
  const minNatural = keepCount * 1;

  let critThreshold;
  if (options.critThreshold !== undefined && options.critThreshold !== null) {
    critThreshold = Number(options.critThreshold);
  } else {
    critThreshold = Math.max(minNatural + 1, maxNatural - critSize + 1);
  }

  let fumbleThreshold;
  if (options.fumbleThreshold !== undefined && options.fumbleThreshold !== null) {
    fumbleThreshold = Number(options.fumbleThreshold);
  } else {
    fumbleThreshold = Math.min(critThreshold - 1, minNatural + fumbleSize - 1);
  }

  // Resolve target CR (backward-compatible with targetDC / targetNumber)
  let resolvedDC = null;
  const rawDC = options.targetCR !== undefined && options.targetCR !== null && options.targetCR !== ''
    ? options.targetCR
    : (options.targetDC !== undefined && options.targetDC !== null && options.targetDC !== ''
      ? options.targetDC
      : (options.targetNumber !== undefined && options.targetNumber !== null && options.targetNumber !== '' ? options.targetNumber : null));

  if (rawDC !== null && rawDC !== '') {
    if (typeof rawDC === 'string' && targetCRs[rawDC.toLowerCase()] !== undefined) {
      resolvedDC = targetCRs[rawDC.toLowerCase()];
    } else if (!isNaN(Number(rawDC))) {
      resolvedDC = Number(rawDC);
    }
  }

  // Compute exact distribution
  const distribution = getDiceDistribution(baseCount, sides, keepCount, clampedAdv);

  let critChance = 0;
  let fumbleChance = 0;
  let successChance = resolvedDC !== null ? 0 : null;
  let failureChance = resolvedDC !== null ? 0 : null;
  let overwhelmingChance = resolvedDC !== null ? 0 : null;
  let catastrophicChance = resolvedDC !== null ? 0 : null;

  for (const [naturalSumStr, prob] of Object.entries(distribution)) {
    const rawNaturalTotal = Number(naturalSumStr);
    const isCrit = rawNaturalTotal >= critThreshold;
    const isFumble = !isCrit && rawNaturalTotal <= fumbleThreshold;

    if (isCrit) {
      critChance += prob;
    }
    if (isFumble) {
      fumbleChance += prob;
    }

    if (resolvedDC !== null) {
      const effectiveNatural = isExpanded
        ? (isCrit ? rawNaturalTotal + 10 : isFumble ? -10 : rawNaturalTotal)
        : rawNaturalTotal;
      const finalTotal = effectiveNatural + flatMod;
      const margin = finalTotal - resolvedDC;

      if (isCrit) {
        // Critical Success supersedes CR check
        successChance += prob;
      } else if (isFumble) {
        // Critical Failure supersedes CR check
        failureChance += prob;
      } else if (margin >= 10) {
        successChance += prob;
        overwhelmingChance += prob;
      } else if (margin <= -10) {
        failureChance += prob;
        catastrophicChance += prob;
      } else if (margin >= 0) {
        successChance += prob;
      } else {
        failureChance += prob;
      }
    }
  }

  return {
    expression: cleanExpr,
    count: baseCount,
    sides,
    keepCount,
    advantageDice: clampedAdv,
    flatModifier: flatMod,
    appliedModifier: flatMod,
    critRangeSize: critSize,
    fumbleRangeSize: fumbleSize,
    expandedThreat: isExpanded,
    critThreshold,
    fumbleThreshold,
    targetCR: resolvedDC,
    targetDC: resolvedDC,
    hasCR: resolvedDC !== null,
    hasDC: resolvedDC !== null,
    // Exact probabilities [0.0 - 1.0]
    successChance,
    critChance,
    fumbleChance,
    failureChance,
    overwhelmingChance,
    catastrophicChance,
    // Formatted percentage strings
    successRate: formatProbability(successChance),
    critRate: formatProbability(critChance),
    fumbleRate: formatProbability(fumbleChance),
    failureRate: formatProbability(failureChance),
    overwhelmingRate: formatProbability(overwhelmingChance),
    catastrophicRate: formatProbability(catastrophicChance),
    distribution
  };
}

/**
 * Unified rolling entry point supporting both the canonical clamped Tangent 2d10 engine
 * and legacy / custom arbitrary polyhedral expressions (e.g. 4d6k3, 3d8).
 */
export function rollDice(expression = '2d10', options = {}) {
  const cleanExpr = String(expression).trim();
  const is2d10 = cleanExpr.toLowerCase().startsWith('2d10') || (!cleanExpr.includes('d') && cleanExpr !== '');
  const expandedThreat = options.expandedThreat !== undefined ? Boolean(options.expandedThreat) : true;

  // 1. Core Tangent 2d10 Check with strict clamping
  if (is2d10) {
    const parsed = parseDiceExpression(expression);
    
    // Resolve advantage dice (-5 to +5, with 1-for-1 opposing stack cancellation)
    const advDice = resolveNetAdvantageDice(options);

    // Resolve flat modifier (-20 to +70)
    let flatMod = 0;
    if (options.flatModifier !== undefined) {
      flatMod = Number(options.flatModifier) || 0;
    } else if (options.baseModifier !== undefined || options.adHocModifier !== undefined) {
      const bMod = Math.max(0, Math.min(50, Number(options.baseModifier) || 0));
      const aMod = Math.max(-20, Math.min(20, Number(options.adHocModifier) || 0));
      flatMod = bMod + aMod;
    } else if (options.modifier !== undefined) {
      flatMod = Number(options.modifier) || 0;
    } else {
      flatMod = parsed.modifier || 0;
    }

    const critSize = options.critRangeSize !== undefined ? Number(options.critRangeSize) : 1;
    const fumbleSize = options.fumbleRangeSize !== undefined ? Number(options.fumbleRangeSize) : 1;

    const tangentResult = executeTangentRoll(advDice, flatMod, critSize, fumbleSize, expandedThreat);

    // Target CR / DC resolution
    const dcInput = options.targetCR !== undefined ? options.targetCR : (options.targetDC !== undefined ? options.targetDC : options.targetNumber);
    let checkResolution = null;
    if (dcInput !== undefined && dcInput !== null && dcInput !== '') {
      checkResolution = resolveCheck(tangentResult, dcInput);
    }

    const keptSet = new Set(tangentResult.keptDice);
    let keptCount = 0;
    const rollsArray = tangentResult.dicePool.map(val => {
      // Mark exactly the kept dice count
      const isKept = keptSet.has(val) && keptCount < 2;
      if (isKept) keptCount++;
      return { value: val, kept: isKept };
    });

    return {
      id: `roll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      expression: (cleanExpr === '2d10' && tangentResult.appliedModifier !== 0)
        ? `2d10${tangentResult.appliedModifier > 0 ? '+' : ''}${tangentResult.appliedModifier}`
        : (cleanExpr || '2d10'),
      count: 2,
      sides: 10,
      dicePool: tangentResult.dicePool,
      keptDice: tangentResult.keptDice,
      rawNaturalTotal: tangentResult.rawNaturalTotal,
      naturalTotal: tangentResult.naturalTotal,
      finalTotal: tangentResult.finalTotal,
      total: tangentResult.finalTotal,
      rawSubtotal: tangentResult.naturalTotal,
      subtotal: tangentResult.naturalTotal,
      rolls: rollsArray,
      isCrit: tangentResult.isCrit,
      isFumble: tangentResult.isFumble,
      isCritSuccess: tangentResult.isCrit,
      isCritFail: tangentResult.isFumble,
      expandedThreat: tangentResult.expandedThreat,
      appliedModifier: tangentResult.appliedModifier,
      modifier: tangentResult.appliedModifier,
      critThreshold: tangentResult.critThreshold,
      fumbleThreshold: tangentResult.fumbleThreshold,
      critRangeSize: tangentResult.critRangeSize,
      fumbleRangeSize: tangentResult.fumbleRangeSize,
      advantageDice: tangentResult.advantageDice,
      isAdvantage: tangentResult.advantageDice > 0,
      isDisadvantage: tangentResult.advantageDice < 0,
      targetNumber: checkResolution ? checkResolution.targetCR : null,
      targetCR: checkResolution ? checkResolution.targetCR : null,
      targetDC: checkResolution ? checkResolution.targetDC : null,
      margin: checkResolution ? checkResolution.margin : null,
      isSuccess: checkResolution ? (checkResolution.outcome === 'Critical Success' || checkResolution.outcome === 'Overwhelming Success' || checkResolution.outcome === 'Success') : null,
      outcome: checkResolution ? checkResolution.outcome : null,
      characterName: options.characterName || 'Operator',
      label: options.label || 'Action Check',
      timestamp: new Date().toISOString(),
      odds: calculateRollOdds(cleanExpr, {
        advantageDice: tangentResult.advantageDice,
        flatModifier: tangentResult.appliedModifier,
        critRangeSize: tangentResult.critRangeSize,
        fumbleRangeSize: tangentResult.fumbleRangeSize,
        expandedThreat: tangentResult.expandedThreat,
        targetCR: checkResolution ? checkResolution.targetCR : dcInput
      })
    };
  }

  // 2. Generic Polyhedral & Custom Rolls Engine
  // Fully integrates dice pool modifiers (advantage/disadvantage), flat modifiers,
  // threat ranges (crit & fumble), and target CR/DC resolution.
  const parsed = parseDiceExpression(expression);

  // Resolve advantage dice (-5 to +5, with 1-for-1 opposing stack cancellation)
  const clampedAdv = resolveNetAdvantageDice(options);

  // Resolve flat modifier (-50 to +70)
  let flatMod = 0;
  if (options.flatModifier !== undefined && options.flatModifier !== 0) {
    flatMod = Number(options.flatModifier) || 0;
  } else if (options.baseModifier !== undefined || options.adHocModifier !== undefined) {
    const bMod = Math.max(0, Math.min(50, Number(options.baseModifier) || 0));
    const aMod = Math.max(-20, Math.min(20, Number(options.adHocModifier) || 0));
    flatMod = bMod + aMod;
  } else if (options.modifier !== undefined && options.modifier !== 0) {
    flatMod = Number(options.modifier) || 0;
  } else {
    flatMod = parsed.modifier || 0;
  }
  const clampedModifier = Math.max(-50, Math.min(70, flatMod));

  // Resolve threat range sizes (1 to 5)
  const critSize = Math.max(1, Math.min(5, Number(options.critRangeSize) || 1));
  const fumbleSize = Math.max(1, Math.min(5, Number(options.fumbleRangeSize) || 1));

  // Target CR / DC
  const dcInput = options.targetCR !== undefined && options.targetCR !== '' && options.targetCR !== null
    ? options.targetCR
    : (options.targetDC !== undefined && options.targetDC !== '' && options.targetDC !== null
      ? options.targetDC
      : (options.targetNumber !== undefined && options.targetNumber !== '' && options.targetNumber !== null ? options.targetNumber : null));

  const baseCount = Math.max(1, parsed.count || 1);
  const sides = Math.max(2, parsed.sides || 6);

  const keepCount = baseCount === 1 ? 1 : (parsed.keep ? Math.min(parsed.keep, baseCount) : baseCount);
  const extraDice = Math.abs(clampedAdv);
  const totalPoolSize = baseCount + extraDice;

  const rawRolls = [];
  const rawValues = [];

  for (let i = 0; i < totalPoolSize; i++) {
    let r = Math.floor(Math.random() * sides) + 1;
    let rollObj = { value: r, exploded: false, explodeValue: 0 };

    if (parsed.exploding && r === sides) {
      rollObj.exploded = true;
      const extra = Math.floor(Math.random() * sides) + 1;
      rollObj.explodeValue = extra;
      r += extra;
    }

    rawRolls.push(rollObj);
    rawValues.push(r);
  }

  const sortedIndices = rawValues.map((val, idx) => ({ val, idx }));
  if (clampedAdv > 0) {
    sortedIndices.sort((a, b) => b.val - a.val);
  } else if (clampedAdv < 0) {
    sortedIndices.sort((a, b) => a.val - b.val);
  } else if (parsed.keep) {
    sortedIndices.sort((a, b) => b.val - a.val);
  }

  const keptIndices = new Set(sortedIndices.slice(0, keepCount).map(item => item.idx));
  const keptDice = rawValues.filter((_, idx) => keptIndices.has(idx));
  const rawNaturalTotal = keptDice.reduce((sum, v) => sum + v, 0);

  const maxNatural = keepCount * sides;
  const minNatural = keepCount * 1;
  const critThreshold = Math.max(minNatural + 1, maxNatural - critSize + 1);
  const fumbleThreshold = Math.min(critThreshold - 1, minNatural + fumbleSize - 1);

  const isCrit = rawNaturalTotal >= critThreshold;
  const isFumble = !isCrit && rawNaturalTotal <= fumbleThreshold;

  // Apply canonical Threat adjustments when enabled:
  // - Critical Success adds +10 in addition to the rolled dice value (20 -> 30, 19 -> 29, etc.)
  // - Fumble replaces the rolled dice value with a flat -10 (subtracting 10 from base score)
  let naturalTotal = rawNaturalTotal;
  if (expandedThreat) {
    if (isCrit) {
      naturalTotal = rawNaturalTotal + 10;
    } else if (isFumble) {
      naturalTotal = -10;
    }
  }

  const finalTotal = naturalTotal + clampedModifier;

  // Target CR resolution with critical/fumble superseding
  let checkResolution = null;
  if (dcInput !== null) {
    checkResolution = resolveCheck({
      finalTotal,
      isCrit,
      isFumble
    }, dcInput);
  }

  // Rolls array with kept flag for UI rendering
  const rollsArray = rawValues.map((val, idx) => ({
    value: val,
    kept: keptIndices.has(idx),
    exploded: rawRolls[idx]?.exploded || false
  }));

  // Clean expression display
  let returnExpr = cleanExpr;
  if (!cleanExpr.includes('+') && !cleanExpr.includes('-') && clampedModifier !== 0) {
    returnExpr = `${cleanExpr}${clampedModifier > 0 ? '+' : ''}${clampedModifier}`;
  }

  return {
    id: `roll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    expression: returnExpr,
    count: baseCount,
    sides: sides,
    rolls: rollsArray,
    dicePool: rawValues,
    keptDice: keptDice,
    rawNaturalTotal: rawNaturalTotal,
    naturalTotal: naturalTotal,
    finalTotal: finalTotal,
    total: finalTotal,
    rawSubtotal: naturalTotal,
    subtotal: naturalTotal,
    modifier: clampedModifier,
    appliedModifier: clampedModifier,
    isCrit: isCrit,
    isFumble: isFumble,
    isCritSuccess: isCrit,
    isCritFail: isFumble,
    expandedThreat: expandedThreat,
    critThreshold: critThreshold,
    fumbleThreshold: fumbleThreshold,
    critRangeSize: critSize,
    fumbleRangeSize: fumbleSize,
    advantageDice: clampedAdv,
    isAdvantage: clampedAdv > 0,
    isDisadvantage: clampedAdv < 0,
    targetNumber: checkResolution ? checkResolution.targetCR : (dcInput !== null ? Number(dcInput) || null : null),
    targetCR: checkResolution ? checkResolution.targetCR : (dcInput !== null ? Number(dcInput) || null : null),
    targetDC: checkResolution ? checkResolution.targetDC : (dcInput !== null ? Number(dcInput) || null : null),
    margin: checkResolution ? checkResolution.margin : null,
    isSuccess: checkResolution 
      ? (checkResolution.outcome === 'Critical Success' || checkResolution.outcome === 'Overwhelming Success' || checkResolution.outcome === 'Success')
      : (isCrit ? true : isFumble ? false : null),
    outcome: checkResolution ? checkResolution.outcome : (isCrit ? 'Critical Success' : isFumble ? 'Critical Failure' : null),
    characterName: options.characterName || 'Operator',
    label: options.label || (baseCount === 1 ? `d${sides} Check` : `${baseCount}d${sides} Check`),
    timestamp: new Date().toISOString(),
    odds: calculateRollOdds(cleanExpr, {
      count: baseCount,
      sides: sides,
      keep: parsed.keep,
      advantageDice: clampedAdv,
      flatModifier: clampedModifier,
      critRangeSize: critSize,
      fumbleRangeSize: fumbleSize,
      expandedThreat: expandedThreat,
      targetCR: checkResolution ? checkResolution.targetCR : dcInput
    })
  };
}

export default {
  rollD10,
  targetCRs,
  targetDCs,
  resolveNetAdvantageDice,
  executeTangentRoll,
  resolveCheck,
  parseDiceExpression,
  rollDice,
  getDiceDistribution,
  formatProbability,
  calculateRollOdds
};
