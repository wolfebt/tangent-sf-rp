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
 * Standard Target Difficulty Classes (DCs) for Tangent SF RP.
 */
export const targetDCs = {
  simple: 0,
  routine: 5,
  challenging: 10,
  hard: 15,
  severe: 20,
  heroic: 25,
  epic: 30,
  miraculous: 35
};

/**
 * Executes a core Tangent 2d10 check with strict boundary clamping.
 *
 * @param {number} [advantageDice=0] - Extra dice pool expansion (-5 to +5).
 *                                     Positive = Advantage (keep 2 highest).
 *                                     Negative = Disadvantage (keep 2 lowest).
 * @param {number} [flatModifier=0] - Flat modifier applied to the kept sum (-20 to +20).
 * @param {number} [critRangeSize=1] - Critical threat range size (1 to 5: 1=20, 5=16-20).
 * @param {number} [fumbleRangeSize=1] - Fumble threat range size (1 to 5: 1=2, 5=2-6).
 * @returns {Object} Full clamped roll result containing dicePool, keptDice, totals, thresholds, and flags.
 */
export function executeTangentRoll(
  advantageDice = 0,    // Accepts -5 to +5
  flatModifier = 0,     // Accepts -20 to +20
  critRangeSize = 1,    // Accepts 1 to 5 (e.g., 1 = 20, 5 = 16-20)
  fumbleRangeSize = 1   // Accepts 1 to 5 (e.g., 1 = 2, 5 = 2-6)
) {
  // Clamp inputs to strictly enforce engine limits
  const clampedAdvantage = Math.max(-5, Math.min(5, Number(advantageDice) || 0));
  const clampedModifier = Math.max(-20, Math.min(20, Number(flatModifier) || 0));
  const clampedCritSize = Math.max(1, Math.min(5, Number(critRangeSize) || 1));
  const clampedFumbleSize = Math.max(1, Math.min(5, Number(fumbleRangeSize) || 1));

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
  let naturalTotal = keptDice[0] + keptDice[1];
  let finalTotal = naturalTotal + clampedModifier;

  // Calculate dynamic thresholds based on the 1 to 5 range size
  const critThreshold = 21 - clampedCritSize; 
  const fumbleThreshold = 1 + clampedFumbleSize;

  let isCrit = naturalTotal >= critThreshold;
  let isFumble = naturalTotal <= fumbleThreshold;

  return {
    dicePool: rolls,
    keptDice: keptDice,
    naturalTotal: naturalTotal,
    finalTotal: finalTotal,
    isCrit: isCrit,
    isFumble: isFumble,
    appliedModifier: clampedModifier,
    critThreshold: critThreshold,
    fumbleThreshold: fumbleThreshold,
    advantageDice: clampedAdvantage,
    critRangeSize: clampedCritSize,
    fumbleRangeSize: clampedFumbleSize
  };
}

/**
 * Resolves a roll result against a target Difficulty Class (DC).
 * Criticals and fumbles supersede standard +/- 10 margin.
 *
 * @param {Object} rollResult - Result from executeTangentRoll.
 * @param {number|string} targetDC - Numeric DC or key in targetDCs ('challenging', etc.).
 * @returns {Object} Adjudication containing outcome, margin, and finalTotal.
 */
export function resolveCheck(rollResult, targetDC) {
  let dcNumber = 0;
  if (typeof targetDC === 'string' && targetDCs[targetDC.toLowerCase()] !== undefined) {
    dcNumber = targetDCs[targetDC.toLowerCase()];
  } else if (targetDC !== undefined && targetDC !== null && !isNaN(Number(targetDC))) {
    dcNumber = Number(targetDC);
  }

  let degreeOfSuccess = rollResult.finalTotal - dcNumber;
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
    targetDC: dcNumber
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

/**
 * Unified rolling entry point supporting both the canonical clamped Tangent 2d10 engine
 * and legacy / custom arbitrary polyhedral expressions (e.g. 4d6k3, 3d8).
 */
export function rollDice(expression = '2d10', options = {}) {
  const cleanExpr = String(expression).trim();
  const is2d10 = cleanExpr.toLowerCase().startsWith('2d10') || (!cleanExpr.includes('d') && cleanExpr !== '');

  // 1. Core Tangent 2d10 Check with strict clamping
  if (is2d10) {
    const parsed = parseDiceExpression(expression);
    
    // Resolve advantage dice (-5 to +5)
    let advDice = 0;
    if (options.advantageDice !== undefined) {
      advDice = Number(options.advantageDice) || 0;
    } else if (options.advantage || options.isAdvantage) {
      advDice = 1;
    } else if (options.disadvantage || options.isDisadvantage) {
      advDice = -1;
    }

    // Resolve flat modifier (-20 to +20)
    let flatMod = 0;
    if (options.flatModifier !== undefined) {
      flatMod = Number(options.flatModifier) || 0;
    } else if (options.modifier !== undefined) {
      flatMod = Number(options.modifier) || 0;
    } else {
      flatMod = parsed.modifier || 0;
    }

    const critSize = options.critRangeSize !== undefined ? Number(options.critRangeSize) : 1;
    const fumbleSize = options.fumbleRangeSize !== undefined ? Number(options.fumbleRangeSize) : 1;

    const tangentResult = executeTangentRoll(advDice, flatMod, critSize, fumbleSize);

    // Target DC resolution
    const dcInput = options.targetDC !== undefined ? options.targetDC : options.targetNumber;
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
      appliedModifier: tangentResult.appliedModifier,
      modifier: tangentResult.appliedModifier,
      critThreshold: tangentResult.critThreshold,
      fumbleThreshold: tangentResult.fumbleThreshold,
      critRangeSize: tangentResult.critRangeSize,
      fumbleRangeSize: tangentResult.fumbleRangeSize,
      advantageDice: tangentResult.advantageDice,
      isAdvantage: tangentResult.advantageDice > 0,
      isDisadvantage: tangentResult.advantageDice < 0,
      targetNumber: checkResolution ? checkResolution.targetDC : null,
      targetDC: checkResolution ? checkResolution.targetDC : null,
      margin: checkResolution ? checkResolution.margin : null,
      isSuccess: checkResolution ? (checkResolution.outcome === 'Critical Success' || checkResolution.outcome === 'Overwhelming Success' || checkResolution.outcome === 'Success') : null,
      outcome: checkResolution ? checkResolution.outcome : null,
      characterName: options.characterName || 'Operative',
      label: options.label || 'Action Check',
      timestamp: new Date().toISOString()
    };
  }

  // 2. Generic Polyhedral & Custom Rolls Engine
  // Fully integrates dice pool modifiers (advantage/disadvantage), flat modifiers,
  // threat ranges (crit & fumble), and target DC resolution.
  const parsed = parseDiceExpression(expression);

  // Resolve advantage dice (-5 to +5)
  let advDice = 0;
  if (options.advantageDice !== undefined) {
    advDice = Number(options.advantageDice) || 0;
  } else if (options.advantage || options.isAdvantage) {
    advDice = 1;
  } else if (options.disadvantage || options.isDisadvantage) {
    advDice = -1;
  }
  const clampedAdv = Math.max(-5, Math.min(5, advDice));

  // Resolve flat modifier (-50 to +50)
  let flatMod = 0;
  if (options.flatModifier !== undefined && options.flatModifier !== 0) {
    flatMod = Number(options.flatModifier) || 0;
  } else if (options.modifier !== undefined && options.modifier !== 0) {
    flatMod = Number(options.modifier) || 0;
  } else {
    flatMod = parsed.modifier || 0;
  }
  const clampedModifier = Math.max(-50, Math.min(50, flatMod));

  // Resolve threat range sizes (1 to 5)
  const critSize = Math.max(1, Math.min(5, Number(options.critRangeSize) || 1));
  const fumbleSize = Math.max(1, Math.min(5, Number(options.fumbleRangeSize) || 1));

  // Target DC
  const dcInput = options.targetDC !== undefined && options.targetDC !== '' && options.targetDC !== null
    ? options.targetDC
    : (options.targetNumber !== undefined && options.targetNumber !== '' && options.targetNumber !== null ? options.targetNumber : null);

  const baseCount = Math.max(1, parsed.count || 1);
  const sides = Math.max(2, parsed.sides || 6);

  // When rolling a single die (count === 1):
  // At advantage: roll 1 + |advDice| dice, keep 1 highest ("best single rolled is used").
  // At disadvantage: roll 1 + |advDice| dice, keep 1 lowest ("worse single rolled is used").
  // When rolling multi-dice (count > 1):
  // Roll count + |advDice| dice, keep count highest (adv) or count lowest (disadv).
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

  // Determine kept dice according to advantage / disadvantage rules:
  // If advantage (> 0): best dice kept (sorted descending)
  // If disadvantage (< 0): worst dice kept (sorted ascending)
  // If standard (=== 0): keep parsed.keep or all base dice
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
  const naturalTotal = keptDice.reduce((sum, v) => sum + v, 0);
  const finalTotal = naturalTotal + clampedModifier;

  // Calculate dynamic threat ranges:
  // For keepCount dice of `sides` faces:
  // Max possible natural = keepCount * sides
  // Min possible natural = keepCount * 1
  const maxNatural = keepCount * sides;
  const minNatural = keepCount * 1;
  const critThreshold = Math.max(minNatural + 1, maxNatural - critSize + 1);
  const fumbleThreshold = Math.min(critThreshold - 1, minNatural + fumbleSize - 1);

  const isCrit = naturalTotal >= critThreshold;
  const isFumble = naturalTotal <= fumbleThreshold;

  // Target DC resolution with critical/fumble superseding
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
    critThreshold: critThreshold,
    fumbleThreshold: fumbleThreshold,
    critRangeSize: critSize,
    fumbleRangeSize: fumbleSize,
    advantageDice: clampedAdv,
    isAdvantage: clampedAdv > 0,
    isDisadvantage: clampedAdv < 0,
    targetNumber: checkResolution ? checkResolution.targetDC : (dcInput !== null ? Number(dcInput) || null : null),
    targetDC: checkResolution ? checkResolution.targetDC : (dcInput !== null ? Number(dcInput) || null : null),
    margin: checkResolution ? checkResolution.margin : null,
    isSuccess: checkResolution 
      ? (checkResolution.outcome === 'Critical Success' || checkResolution.outcome === 'Overwhelming Success' || checkResolution.outcome === 'Success')
      : (isCrit ? true : isFumble ? false : null),
    outcome: checkResolution ? checkResolution.outcome : (isCrit ? 'Critical Success' : isFumble ? 'Critical Failure' : null),
    characterName: options.characterName || 'Operative',
    label: options.label || (baseCount === 1 ? `d${sides} Check` : `${baseCount}d${sides} Check`),
    timestamp: new Date().toISOString()
  };
}

export default {
  rollD10,
  targetDCs,
  executeTangentRoll,
  resolveCheck,
  parseDiceExpression,
  rollDice
};
