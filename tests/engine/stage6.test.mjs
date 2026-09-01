/**
 * @file stage6.test.mjs
 * @description Stage 6 Automated Verification Suite
 * Verifies DiceASTParser, QuickJSSandbox, and EssenceTracker.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DiceASTParser } from '../../src/engine/math/DiceASTParser.ts';
import { QuickJSSandbox } from '../../src/engine/scripting/QuickJSSandbox.ts';
import { EssenceTracker } from '../../src/engine/rules/EssenceTracker.ts';
import { useEngineStore } from '../../src/engine/state/VolatileSharder.ts';

test('Stage 6.2: DiceASTParser Arithmetic, Dice RNG, and @Variables', () => {
  const parser = new DiceASTParser();

  // 1. Pure Arithmetic
  const res1 = parser.evaluateExpression('(2 * 5) + 4');
  assert.equal(res1.total, 14);

  // 2. Dice Range Check
  for (let i = 0; i < 20; i++) {
    const resDice = parser.evaluateExpression('1d6 + 5');
    assert.ok(resDice.total >= 6 && resDice.total <= 11, `Result ${resDice.total} out of bounds for 1d6+5`);
  }

  // 3. Keep Highest Check
  for (let i = 0; i < 20; i++) {
    const resKH = parser.evaluateExpression('2d20kh1');
    assert.ok(resKH.total >= 1 && resKH.total <= 20);
  }

  // 4. Token Variable Resolution
  useEngineStore.getState().loadStaticEntity({
    id: 'op-dice-tester',
    name: 'Dice Tester',
    base_hp: 50,
    tech_level: 3,
    armor_dr: 12,
    size_modifier: 2
  });

  const resVar = parser.evaluateExpression('10 + @armor_dr', 'op-dice-tester');
  assert.equal(resVar.total, 22);
});

test('Stage 6.3: QuickJSSandbox Secure Execution and Isolation', async () => {
  const sandbox = new QuickJSSandbox();

  // 1. Math Macro Execution
  const res = await sandbox.execute('x * y + 5', { x: 7, y: 3 });
  assert.equal(res, 26);

  // 2. Variable Scope Isolation
  const arrayRes = await sandbox.execute('items.map(i => i.cost).reduce((a, b) => a + b, 0)', {
    items: [{ cost: 10 }, { cost: 25 }, { cost: 15 }]
  });
  assert.equal(arrayRes, 50);

  // 3. Error Handling on Malformed Code
  await assert.rejects(async () => {
    await sandbox.execute('nonExistentFunction()');
  });
});

test('Stage 6.4: EssenceTracker Cantrip Thresholds and Entropy Degradation', () => {
  const tracker = new EssenceTracker();

  // 1. Cantrip (DC <= 14) -> 0 Essence
  assert.equal(tracker.calculateCastCost(10), 0);
  assert.equal(tracker.calculateCastCost(14), 0);

  // 2. High DC Spell Costs
  assert.equal(tracker.calculateCastCost(15), 1);
  assert.equal(tracker.calculateCastCost(20), 2);
  assert.equal(tracker.calculateCastCost(25), 3);

  // 3. Start of Turn Sustained Tax
  const activeSpells = [
    { id: 's1', casterId: 'caster-1', currentDC: 14, isSustained: true },  // 0
    { id: 's2', casterId: 'caster-1', currentDC: 20, isSustained: true },  // 2
    { id: 's3', casterId: 'caster-1', currentDC: 25, isSustained: false }, // Not sustained -> 0
    { id: 's4', casterId: 'caster-2', currentDC: 20, isSustained: true }   // Other caster -> 0
  ];

  const tax = tracker.processStartOfTurnTax('caster-1', activeSpells);
  assert.equal(tax, 2);

  // 4. Round Degradation Protocol (all spells lose 1d10 DC; culled if DC <= 0)
  const weakSpell = [{ id: 'weak', casterId: 'caster-1', currentDC: 1, isSustained: false }];
  const degraded = tracker.processRoundDegradation(weakSpell);
  // DC 1 minus 1-10 will always be <= 0, so it must be culled
  assert.equal(degraded.length, 0, 'Collapsed spell must be culled');
});
