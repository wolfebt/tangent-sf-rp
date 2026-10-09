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

  // 2. Generic Polyhedral Expressions Fallback (e.g. 4d6k3, 3d8 damage rolls)
  const parsed = parseDiceExpression(expression);
  const rolls = [];
  let rawValues = [];

  for (let i = 0; i < parsed.count; i++) {
    let r = Math.floor(Math.random() * parsed.sides) + 1;
    let rollObj = { value: r, exploded: false, explodeValue: 0 };

    if (parsed.exploding && r === parsed.sides) {
      rollObj.exploded = true;
      const extra = Math.floor(Math.random() * parsed.sides) + 1;
      rollObj.explodeValue = extra;
      r += extra;
    }

    rolls.push(rollObj);
    rawValues.push(r);
  }

  if (parsed.keep && parsed.keep < rawValues.length) {
    rawValues.sort((a, b) => b - a);
    rawValues = rawValues.slice(0, parsed.keep);
  }

  const rawSubtotal = rawValues.reduce((sum, v) => sum + v, 0);
  const total = rawSubtotal + parsed.modifier;

  let margin = null;
  let isSuccess = null;
  const tn = options.targetDC !== undefined ? options.targetDC : options.targetNumber;
  if (tn !== undefined && tn !== null && tn !== '') {
    const numDC = Number(tn) || 0;
    margin = total - numDC;
    isSuccess = margin >= 0;
  }

  return {
    id: `roll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    expression,
    count: parsed.count,
    sides: parsed.sides,
    rolls,
    dicePool: rawValues,
    keptDice: rawValues,
    naturalTotal: rawSubtotal,
    finalTotal: total,
    rawSubtotal,
    subtotal: rawSubtotal,
    total,
    modifier: parsed.modifier,
    appliedModifier: parsed.modifier,
    isCrit: false,
    isFumble: false,
    isCritSuccess: false,
    isCritFail: false,
    critThreshold: 20,
    fumbleThreshold: 2,
    advantageDice: 0,
    isAdvantage: false,
    isDisadvantage: false,
    targetNumber: tn ? Number(tn) : null,
    targetDC: tn ? Number(tn) : null,
    margin,
    isSuccess,
    outcome: isSuccess === null ? null : (isSuccess ? 'Success' : 'Failure'),
    characterName: options.characterName || 'Operative',
    label: options.label || 'Damage Check',
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
