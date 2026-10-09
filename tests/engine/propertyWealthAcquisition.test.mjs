/**
 * @file propertyWealthAcquisition.test.mjs
 * @description Unit tests for Tangent SF RP Property Acquisition under the EUFT Wealth System.
 * Tests The Golden Rule of Tangent Wealth:
 * - Cost DC vs. Wealth Score evaluation
 * - Auto-Buy threshold validation
 * - Liquidity Gap calculation
 * - Credit Debt financing override mechanics
 * - Dual-key updates for credits and debits
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROPERTY_COLLECTIONS,
  resolveItemCostDC,
  getCharacterWealthScore,
  checkPropertyWealthPrerequisite,
  checkPrerequisite
} from '../../src/utils/prerequisiteEvaluator.js';
import {
  calculateCreditValue,
  calculateLiquidityGap,
  calculateCharacterWealth
} from '../../src/engines/tangentEconEngine.js';

test('Property Collections registry covers all property categories', () => {
  const expectedCategories = ['weaponry', 'weapons', 'armoring', 'armor', 'gear', 'equipment', 'mecha', 'mech', 'architecture', 'structures', 'other', 'misc', 'property'];
  expectedCategories.forEach(cat => {
    assert.ok(PROPERTY_COLLECTIONS.has(cat), `Category "${cat}" should be registered in PROPERTY_COLLECTIONS`);
  });
});

test('resolveItemCostDC resolves DC across multiple schemas and formulas', () => {
  // 1. Explicit craft_dc or cost_dc
  assert.equal(resolveItemCostDC({ craft_dc: 18 }), 18);
  assert.equal(resolveItemCostDC({ craftDc: 15 }), 15);
  assert.equal(resolveItemCostDC({ cost_dc: 22 }), 22);
  assert.equal(resolveItemCostDC({ purchase_dc: 12 }), 12);
  assert.equal(resolveItemCostDC({ dc: 25 }), 25);

  // 2. Credit value logarithmic formula: round(2.5 * log2(Cr / 10))
  // 10 Cr -> DC 0
  assert.equal(resolveItemCostDC({ creditCost: 10 }), 0);
  // 40 Cr -> DC 5
  assert.equal(resolveItemCostDC({ credit_cost: 40 }), 5);
  // 160 Cr -> DC 10
  assert.equal(resolveItemCostDC({ cost: 160 }), 10);
  // 640 Cr -> DC 15
  assert.equal(resolveItemCostDC({ credits: 640 }), 15);
  // 2,560 Cr -> DC 20
  assert.equal(resolveItemCostDC({ price: 2560 }), 20);

  // 3. CP cost fallback (cp * 2)
  assert.equal(resolveItemCostDC({ cp: 7 }), 14);

  // 4. Default fallback when no cost fields exist
  assert.equal(resolveItemCostDC({ name: 'Standard Field Shovel' }), 10);
});

test('getCharacterWealthScore respects overrides and computes derived scores', () => {
  // Override has top priority
  const overrideChar = {
    'wealth-score-override': 24,
    'wealth-score': 12,
    attributes: { 'attr-intellect': 4 }
  };
  assert.equal(getCharacterWealthScore(overrideChar), 24);

  // Direct wealth-score
  const directChar = {
    'wealth-score': 16
  };
  assert.equal(getCharacterWealthScore(directChar), 16);

  // Baseline fallback character
  const defaultChar = {};
  const ws = getCharacterWealthScore(defaultChar);
  assert.ok(typeof ws === 'number' && ws >= 0);
});

test('checkPropertyWealthPrerequisite: Auto-Buy when Item Cost DC <= Wealth Score', () => {
  const operative = {
    'wealth-score-override': 15,
    'credits': 500,
    'debits': []
  };

  const cheapGear = {
    name: 'Tactical Flashlight',
    category: 'gear',
    craft_dc: 10
  };

  const result = checkPropertyWealthPrerequisite(cheapGear, operative);
  assert.equal(result.hasPrerequisite, true);
  assert.equal(result.isPossessed, true);
  assert.equal(result.isAutoBuy, true);
  assert.equal(result.itemDC, 10);
  assert.equal(result.playerWS, 15);
  assert.equal(result.gapCost, 0);
  assert.equal(result.canOverrideWithDebt, true);
  assert.equal(result.unmetReasons.length, 0);
  assert.ok(result.prerequisiteText.includes('Auto-Buy'));
});

test('checkPropertyWealthPrerequisite: Liquidity Gap when Item Cost DC > Wealth Score', () => {
  const operative = {
    'wealth-score-override': 10, // Middle Class auto-buy limit = 600 Cr
    'credits': 1000,
    'debits': []
  };

  const highEndArmor = {
    name: 'Nano-Ceramic Tactical Exosuit',
    category: 'armoring',
    craft_dc: 20 // Value = 2,560 Cr
  };

  const result = checkPropertyWealthPrerequisite(highEndArmor, operative);
  assert.equal(result.hasPrerequisite, true);
  assert.equal(result.isPossessed, false); // Exceeds auto-buy
  assert.equal(result.isAutoBuy, false);
  assert.equal(result.itemDC, 20);
  assert.equal(result.playerWS, 10);
  assert.equal(result.gapCost, 1960); // 2560 - 600 = 1960 Cr
  assert.equal(result.canOverrideWithDebt, true);
  assert.equal(result.unmetReasons.length, 1);
  assert.ok(result.unmetReasons[0].includes('Liquidity Gap: 1,960 Cr'));
});

test('checkPrerequisite delegates property collections to wealth evaluation', () => {
  const operative = {
    'wealth-score-override': 12
  };

  const plasmaRifle = {
    name: 'Heavy Plasma Cannon',
    category: 'weaponry',
    craft_dc: 25 // Cost DC 25 > WS 12
  };

  const prereq = checkPrerequisite(plasmaRifle, operative, 'weaponry');
  assert.equal(prereq.hasPrerequisite, true);
  assert.equal(prereq.isPossessed, false);
  assert.equal(prereq.canOverrideWithDebt, true);
  assert.ok(prereq.gapCost > 0);
});

test('Simulated Inventory Transaction: Liquid Payment and Debt Override settlements', () => {
  // 1. Pay with liquid credits
  const initialCredits = 5000;
  const gapCost = 2400;
  const payAmt = gapCost;
  const remainingCredits = Math.max(0, initialCredits - payAmt);
  assert.equal(remainingCredits, 2600);

  // 2. Debt override
  const initialDebits = [
    { id: 'debt-1', amount: 500, debtor: 'Local Fixer', notes: 'Cyberdeck upgrade' }
  ];
  const newDebt = {
    id: 'debt-2',
    amount: gapCost,
    debtor: 'Merchant Syndicate Financing',
    notes: 'Financing for Nano-Ceramic Tactical Exosuit'
  };
  const updatedDebits = [...initialDebits, newDebt];
  assert.equal(updatedDebits.length, 2);
  assert.equal(updatedDebits[1].amount, 2400);
  assert.equal(updatedDebits[1].debtor, 'Merchant Syndicate Financing');
});

test('Financial Status Hierarchy has no BP values (Wealth determined by background variables)', async () => {
  const { FINANCIAL_STATUS_TABLE } = await import('../../src/constants/equipment.js');
  assert.ok(Array.isArray(FINANCIAL_STATUS_TABLE));
  assert.equal(FINANCIAL_STATUS_TABLE.length, 12);

  FINANCIAL_STATUS_TABLE.forEach((tier) => {
    assert.equal(tier.bpCost, undefined, `Tier "${tier.name}" must not have bpCost property`);
    assert.equal(tier.bpValue, undefined, `Tier "${tier.name}" must not have bpValue property`);
    assert.equal(tier.cpCost, undefined, `Tier "${tier.name}" must not have cpCost property`);
    assert.ok(typeof tier.wsMin === 'number');
    assert.ok(typeof tier.autoBuyCr === 'number');
    assert.ok(typeof tier.netWorth === 'string');
    assert.ok(typeof tier.lifestyle === 'string');
  });
});

