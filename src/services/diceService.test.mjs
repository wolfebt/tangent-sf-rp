import { parseDiceExpression, rollDice } from './diceService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Testing Dice Engine...');

// Test 1: parseDiceExpression
const p1 = parseDiceExpression('2d10+4');
assert(p1.count === 2, `Expected count 2, got ${p1.count}`);
assert(p1.sides === 10, `Expected sides 10, got ${p1.sides}`);
assert(p1.modifier === 4, `Expected modifier 4, got ${p1.modifier}`);
assert(p1.exploding === false, 'Expected exploding false');

const p2 = parseDiceExpression('3d10!');
assert(p2.count === 3 && p2.sides === 10 && p2.exploding === true, 'Failed 3d10! parse');

const p3 = parseDiceExpression('4d6k3-2');
assert(p3.count === 4 && p3.sides === 6 && p3.keep === 3 && p3.modifier === -2, 'Failed 4d6k3-2 parse');

// Test 2: rollDice execution
for (let i = 0; i < 100; i++) {
  const res = rollDice('2d10+5', { targetNumber: 15 });
  if (res.isCritSuccess) {
    assert(res.subtotal === 30, `Expected crit success subtotal 30, got ${res.subtotal}`);
    assert(res.total === 35, `Expected crit success total 35, got ${res.total}`);
  } else if (res.isCritFail) {
    assert(res.subtotal === -10, `Expected crit fail subtotal -10, got ${res.subtotal}`);
    assert(res.total === -5, `Expected crit fail total -5, got ${res.total}`);
  } else {
    assert(res.total >= 8 && res.total <= 24, `Roll out of standard bounds: ${res.total}`);
  }
  assert(typeof res.isCritSuccess === 'boolean', 'isCritSuccess should be boolean');
  assert(typeof res.isCritFail === 'boolean', 'isCritFail should be boolean');
  assert(res.margin === res.total - 15, `Margin calculation incorrect: ${res.margin}`);
  assert(res.isSuccess === (res.total >= 15), 'Success evaluation incorrect');
}

console.log('✅ All dice engine tests passed!');
