import { 
  rollD10, 
  executeTangentRoll, 
  targetDCs, 
  resolveCheck, 
  parseDiceExpression, 
  rollDice 
} from './diceService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Testing Clamped Tangent Dice Engine...');

// Test 1: rollD10 produces valid numbers [1, 10]
for (let i = 0; i < 50; i++) {
  const d = rollD10();
  assert(Number.isInteger(d) && d >= 1 && d <= 10, `rollD10 out of bounds: ${d}`);
}

// Test 2: Input boundary clamping on executeTangentRoll
const clampedOver = executeTangentRoll(12, 50, 99, 99);
assert(clampedOver.advantageDice === 5, `Expected advantageDice clamped to 5, got ${clampedOver.advantageDice}`);
assert(clampedOver.appliedModifier === 20, `Expected modifier clamped to 20, got ${clampedOver.appliedModifier}`);
assert(clampedOver.critThreshold === 16, `Expected critThreshold for range size 5 to be 16, got ${clampedOver.critThreshold}`);
assert(clampedOver.fumbleThreshold === 6, `Expected fumbleThreshold for range size 5 to be 6, got ${clampedOver.fumbleThreshold}`);
assert(clampedOver.dicePool.length === 7, `Expected pool size 2 + 5 = 7, got ${clampedOver.dicePool.length}`);

const clampedUnder = executeTangentRoll(-15, -45, -5, -10);
assert(clampedUnder.advantageDice === -5, `Expected advantageDice clamped to -5, got ${clampedUnder.advantageDice}`);
assert(clampedUnder.appliedModifier === -20, `Expected modifier clamped to -20, got ${clampedUnder.appliedModifier}`);
assert(clampedUnder.critThreshold === 20, `Expected critThreshold for range size 1 to be 20, got ${clampedUnder.critThreshold}`);
assert(clampedUnder.fumbleThreshold === 2, `Expected fumbleThreshold for range size 1 to be 2, got ${clampedUnder.fumbleThreshold}`);
assert(clampedUnder.dicePool.length === 7, `Expected pool size 2 + 5 = 7, got ${clampedUnder.dicePool.length}`);

// Test 3: Advantage (keep 2 highest) vs Disadvantage (keep 2 lowest)
const advRoll = executeTangentRoll(3, 0, 1, 1);
assert(advRoll.dicePool.length === 5, `Expected advantage 3 pool size to be 5, got ${advRoll.dicePool.length}`);
assert(advRoll.keptDice[0] >= advRoll.keptDice[1], 'Advantage kept dice must be sorted descending');
// Verify keptDice are the highest 2 in the pool
const sortedDesc = [...advRoll.dicePool].sort((a, b) => b - a);
assert(advRoll.keptDice[0] === sortedDesc[0] && advRoll.keptDice[1] === sortedDesc[1], 'Advantage must keep 2 highest');

const disRoll = executeTangentRoll(-3, 0, 1, 1);
assert(disRoll.dicePool.length === 5, `Expected disadvantage 3 pool size to be 5, got ${disRoll.dicePool.length}`);
assert(disRoll.keptDice[0] <= disRoll.keptDice[1], 'Disadvantage kept dice must be sorted ascending');
const sortedAsc = [...disRoll.dicePool].sort((a, b) => a - b);
assert(disRoll.keptDice[0] === sortedAsc[0] && disRoll.keptDice[1] === sortedAsc[1], 'Disadvantage must keep 2 lowest');

// Test 4: Dynamic Threat Ranges mapping
// critRangeSize: 1 -> 20, 2 -> 19-20, 3 -> 18-20, 4 -> 17-20, 5 -> 16-20
assert(executeTangentRoll(0, 0, 1, 1).critThreshold === 20, 'critSize 1 threshold must be 20');
assert(executeTangentRoll(0, 0, 2, 1).critThreshold === 19, 'critSize 2 threshold must be 19');
assert(executeTangentRoll(0, 0, 3, 1).critThreshold === 18, 'critSize 3 threshold must be 18');
assert(executeTangentRoll(0, 0, 4, 1).critThreshold === 17, 'critSize 4 threshold must be 17');
assert(executeTangentRoll(0, 0, 5, 1).critThreshold === 16, 'critSize 5 threshold must be 16');

// fumbleRangeSize: 1 -> 2, 2 -> 2-3, 3 -> 2-4, 4 -> 2-5, 5 -> 2-6
assert(executeTangentRoll(0, 0, 1, 1).fumbleThreshold === 2, 'fumbleSize 1 threshold must be 2');
assert(executeTangentRoll(0, 0, 2, 2).fumbleThreshold === 3, 'fumbleSize 2 threshold must be 3');
assert(executeTangentRoll(0, 0, 3, 3).fumbleThreshold === 4, 'fumbleSize 3 threshold must be 4');
assert(executeTangentRoll(0, 0, 4, 4).fumbleThreshold === 5, 'fumbleSize 4 threshold must be 5');
assert(executeTangentRoll(0, 0, 5, 5).fumbleThreshold === 6, 'fumbleSize 5 threshold must be 6');

// Test 5: Target DCs table
assert(targetDCs.simple === 0, 'DC simple must be 0');
assert(targetDCs.routine === 5, 'DC routine must be 5');
assert(targetDCs.challenging === 10, 'DC challenging must be 10');
assert(targetDCs.hard === 15, 'DC hard must be 15');
assert(targetDCs.severe === 20, 'DC severe must be 20');
assert(targetDCs.heroic === 25, 'DC heroic must be 25');
assert(targetDCs.epic === 30, 'DC epic must be 30');
assert(targetDCs.miraculous === 35, 'DC miraculous must be 35');

// Test 6: resolveCheck degrees of success
// Critical Success supersedes
const critMock = { finalTotal: 20, isCrit: true, isFumble: false };
assert(resolveCheck(critMock, 35).outcome === 'Critical Success', 'Crit must supersede high DC failure');

// Critical Failure supersedes
const fumbleMock = { finalTotal: 22, isCrit: false, isFumble: true };
assert(resolveCheck(fumbleMock, 5).outcome === 'Critical Failure', 'Fumble must supersede low DC success');

// Overwhelming Success (margin >= 10)
const overwhelmMock = { finalTotal: 25, isCrit: false, isFumble: false };
const resOverwhelm = resolveCheck(overwhelmMock, 'hard'); // DC 15, margin = +10
assert(resOverwhelm.outcome === 'Overwhelming Success', 'Margin >= 10 must yield Overwhelming Success');
assert(resOverwhelm.margin === 10, 'Margin must be 10');

// Catastrophic Failure (margin <= -10)
const catMock = { finalTotal: 8, isCrit: false, isFumble: false };
const resCat = resolveCheck(catMock, 'severe'); // DC 20, margin = -12
assert(resCat.outcome === 'Catastrophic Failure', 'Margin <= -10 must yield Catastrophic Failure');
assert(resCat.margin === -12, 'Margin must be -12');

// Standard Success (margin >= 0 and < 10)
const succMock = { finalTotal: 17, isCrit: false, isFumble: false };
const resSucc = resolveCheck(succMock, 15);
assert(resSucc.outcome === 'Success', 'Margin 2 must yield Success');
assert(resSucc.margin === 2, 'Margin must be 2');

// Standard Failure (margin < 0 and > -10)
const failMock = { finalTotal: 13, isCrit: false, isFumble: false };
const resFail = resolveCheck(failMock, 15);
assert(resFail.outcome === 'Failure', 'Margin -2 must yield Failure');
assert(resFail.margin === -2, 'Margin must be -2');

// Test 7: Unified rollDice parsing & execution on 2d10
const rollRes = rollDice('2d10+4', { 
  advantageDice: 2, 
  critRangeSize: 3, 
  targetDC: 'challenging' 
});
assert(rollRes.count === 2, 'Count must be 2');
assert(rollRes.dicePool.length === 4, 'Pool size with +2 advantage must be 4');
assert(rollRes.keptDice.length === 2, 'Kept dice must be 2');
assert(rollRes.appliedModifier === 4, 'Applied modifier must be 4');
assert(rollRes.critThreshold === 18, 'Crit threshold for size 3 must be 18');
assert(rollRes.targetDC === 10, 'Target DC challenging must be 10');
assert(typeof rollRes.outcome === 'string', 'Outcome must be present');
assert(typeof rollRes.isSuccess === 'boolean', 'isSuccess must be boolean');

// Test 8: Single Die at Advantage (best single rolled is used)
for (let i = 0; i < 20; i++) {
  const d20Adv = rollDice('1d20', {
    advantageDice: 2,
    flatModifier: 5,
    critRangeSize: 2,
    fumbleRangeSize: 2,
    targetDC: 15
  });
  assert(d20Adv.count === 1, 'Single die count must be 1');
  assert(d20Adv.dicePool.length === 3, 'Pool size for 1d20 with +2 adv must be 1 + 2 = 3');
  assert(d20Adv.keptDice.length === 1, 'Kept dice for single die must be exactly 1');
  const maxInPool = Math.max(...d20Adv.dicePool);
  assert(d20Adv.keptDice[0] === maxInPool, `Advantage on single die must use best single rolled (${maxInPool}), got ${d20Adv.keptDice[0]}`);
  assert(d20Adv.appliedModifier === 5, 'Flat modifier must be 5');
  assert(d20Adv.finalTotal === d20Adv.naturalTotal + 5, 'Final total must be natural + 5');
  assert(d20Adv.critThreshold === 19, 'Crit threshold for size 2 on d20 must be 19 (19-20)');
  assert(d20Adv.fumbleThreshold === 2, 'Fumble threshold for size 2 on d20 must be 2 (1-2)');
  assert(d20Adv.targetDC === 15, 'Target DC must be 15');
  assert(d20Adv.margin === d20Adv.finalTotal - 15, 'Margin must be finalTotal - 15');
}

// Test 9: Single Die at Disadvantage (worse single rolled is used)
for (let i = 0; i < 20; i++) {
  const d20Dis = rollDice('1d20', {
    advantageDice: -2,
    flatModifier: -3,
    critRangeSize: 1,
    fumbleRangeSize: 1,
    targetDC: 10
  });
  assert(d20Dis.count === 1, 'Single die count must be 1');
  assert(d20Dis.dicePool.length === 3, 'Pool size for 1d20 with -2 disadv must be 1 + 2 = 3');
  assert(d20Dis.keptDice.length === 1, 'Kept dice for single die must be exactly 1');
  const minInPool = Math.min(...d20Dis.dicePool);
  assert(d20Dis.keptDice[0] === minInPool, `Disadvantage on single die must use worse single rolled (${minInPool}), got ${d20Dis.keptDice[0]}`);
  assert(d20Dis.appliedModifier === -3, 'Flat modifier must be -3');
  assert(d20Dis.finalTotal === d20Dis.naturalTotal - 3, 'Final total must be natural - 3');
  assert(d20Dis.critThreshold === 20, 'Crit threshold for size 1 on d20 must be 20');
  assert(d20Dis.fumbleThreshold === 1, 'Fumble threshold for size 1 on d20 must be 1');
}

// Test 10: Quick polyhedral presets (d6, d8, d12) with modifiers & threat ranges
const d6Roll = rollDice('1d6', {
  advantageDice: 1,
  flatModifier: 2,
  critRangeSize: 1,
  fumbleRangeSize: 1,
  targetDC: 5
});
assert(d6Roll.dicePool.length === 2, '1d6 with +1 adv must roll 2 dice');
assert(d6Roll.keptDice.length === 1, '1d6 with +1 adv must keep 1 die');
assert(d6Roll.keptDice[0] === Math.max(...d6Roll.dicePool), '1d6 with +1 adv must keep highest die');
assert(d6Roll.appliedModifier === 2, 'Applied modifier must be 2');

// Test 11: Saved formula presets with all adjustments noted
const presetSnapshot = {
  id: 'test-preset-1',
  expr: '2d10+4',
  label: 'Tactical Recon Check',
  advantageDice: 2,
  baseModifier: 4,
  adHocModifier: -1,
  critRangeSize: 3,
  fumbleRangeSize: 2,
  targetDC: '15'
};

const rolledFromPreset = rollDice(presetSnapshot.expr, {
  advantageDice: presetSnapshot.advantageDice,
  flatModifier: presetSnapshot.baseModifier + presetSnapshot.adHocModifier,
  critRangeSize: presetSnapshot.critRangeSize,
  fumbleRangeSize: presetSnapshot.fumbleRangeSize,
  targetDC: presetSnapshot.targetDC
});

assert(rolledFromPreset.dicePool.length === 4, 'Pool size with advantageDice 2 must be 2 + 2 = 4');
assert(rolledFromPreset.appliedModifier === 3, 'Applied modifier must be 4 - 1 = 3');
assert(rolledFromPreset.critThreshold === 18, 'Crit threshold for size 3 must be 18');
assert(rolledFromPreset.fumbleThreshold === 3, 'Fumble threshold for size 2 must be 3');
assert(rolledFromPreset.targetDC === 15, 'Target DC must be 15');

// Test legacy preset without explicit adjustment fields
const legacyPreset = {
  id: 'legacy-1',
  expr: '1d20+2',
  label: 'Old Saved Roll'
};
const legacyAdv = legacyPreset.advantageDice ?? 0;
const legacyBase = legacyPreset.baseModifier ?? 0;
const legacyAdHoc = legacyPreset.adHocModifier ?? 0;
const legacyCritSize = legacyPreset.critRangeSize ?? 1;
const legacyFumbleSize = legacyPreset.fumbleRangeSize ?? 1;
const legacyDC = legacyPreset.targetDC ?? '';

assert(legacyAdv === 0, 'Legacy advantage must default to 0');
assert(legacyBase === 0, 'Legacy baseModifier must default to 0');
assert(legacyAdHoc === 0, 'Legacy adHocModifier must default to 0');
assert(legacyCritSize === 1, 'Legacy critRangeSize must default to 1');
assert(legacyFumbleSize === 1, 'Legacy fumbleRangeSize must default to 1');
assert(legacyDC === '', 'Legacy targetDC must default to empty string');

console.log('✅ All clamped dice engine and target DC tests passed!');
