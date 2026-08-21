/**
 * Advanced Dice Parser and Random Number Generator for Tangent SFF RP.
 */

/**
 * Parses dice expressions like "2d10+4", "d20", "3d10!", "4d6k3-2"
 */
export function parseDiceExpression(expression = '2d10') {
  const clean = String(expression).replace(/\s+/g, '').toLowerCase();
  const regex = /^(\d+)?d(\d+)(!)?(?:k(\d+))?([+-]\d+)?$/i;
  const match = clean.match(regex);

  if (!match) {
    // Fallback: try parsing as flat number or standard 2d10
    return { count: 2, sides: 10, exploding: false, keep: null, modifier: 0 };
  }

  const count = parseInt(match[1] || '1', 10);
  const sides = parseInt(match[2], 10);
  const exploding = Boolean(match[3]);
  const keep = match[4] ? parseInt(match[4], 10) : null;
  const modifier = match[5] ? parseInt(match[5], 10) : 0;

  return { count: Math.min(count, 50), sides, exploding, keep, modifier };
}

export function rollDice(expression = '2d10', options = {}) {
  const parsed = parseDiceExpression(expression);
  const rolls = [];
  let rawValues = [];

  for (let i = 0; i < parsed.count; i++) {
    let r = Math.floor(Math.random() * parsed.sides) + 1;
    let rollObj = { value: r, exploded: false, explodeValue: 0 };

    // Exploding dice logic
    if (parsed.exploding && r === parsed.sides) {
      rollObj.exploded = true;
      const extra = Math.floor(Math.random() * parsed.sides) + 1;
      rollObj.explodeValue = extra;
      r += extra;
    }

    rolls.push(rollObj);
    rawValues.push(r);
  }

  // Handle keep highest (e.g. 4d6k3)
  if (parsed.keep && parsed.keep < rawValues.length) {
    rawValues.sort((a, b) => b - a);
    rawValues = rawValues.slice(0, parsed.keep);
  }

  const subtotal = rawValues.reduce((sum, v) => sum + v, 0);
  const total = subtotal + parsed.modifier;

  // Tangent SFF RP Critical Evaluation (Natural dual 10s or dual 1s on 2d10)
  const is2d10 = parsed.count === 2 && parsed.sides === 10;
  const isCritSuccess = is2d10 && rolls[0]?.value === 10 && rolls[1]?.value === 10;
  const isCritFail = is2d10 && rolls[0]?.value === 1 && rolls[1]?.value === 1;

  // Target Number (TN) evaluation
  let margin = null;
  let isSuccess = null;
  if (options.targetNumber !== undefined && options.targetNumber !== null && options.targetNumber > 0) {
    margin = total - options.targetNumber;
    isSuccess = margin >= 0;
  }

  return {
    id: `roll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    expression,
    count: parsed.count,
    sides: parsed.sides,
    rolls,
    modifier: parsed.modifier,
    subtotal,
    total,
    isCritSuccess,
    isCritFail,
    targetNumber: options.targetNumber || null,
    margin,
    isSuccess,
    characterName: options.characterName || 'Hero',
    label: options.label || 'Action Check',
    timestamp: new Date().toISOString()
  };
}
