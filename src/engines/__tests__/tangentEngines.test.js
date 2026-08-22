import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TECH_LEVELS,
  UDU_TIERS,
  TOOL_TIERS,
  FINANCIAL_STATUS_TABLE,
  COMPLEXITY_TIERS
} from '../tangentConstants.js';

import {
  calculateCreditValue,
  calculateMaterialCost,
  calculateCraftingDays,
  calculateAllCraftingTiers,
  calculateLiquidityGap,
  calculateSellPrice,
  getFinancialStatus,
  getWSFromDC,
  getComplexityTier,
  calculateStartingWealth,
  calculateTradeProfit,
  formatCraftingDuration
} from '../tangentEconEngine.js';

import {
  getTechLevelDef,
  getSubStrataDetails,
  calculateTechPenalty,
  calculateEducationBonus,
  getSchematicCost,
  getReconfigTime,
  getDomainCapability,
  getAvailableTechAtTL
} from '../tangentTechEngine.js';

import {
  getNodeCapacity,
  getTotalBodyNodes,
  getExternalSocketMax,
  convertUDUScale,
  validateNodeAllocation,
  calculateSocketBudget,
  calculateMountBudget,
  calculateModuleBudget,
  getStigmaLevel
} from '../tangentUDUEngine.js';

// ═══════════════════════════════════════════════════════════
// 1. ECONOMIC ENGINE TESTS
// ═══════════════════════════════════════════════════════════

test('Tangent Standard Curve (TSC) - Known Table 6.1 DC benchmarks', () => {
  assert.equal(calculateCreditValue(0), 10, 'DC 0 must equal 10 Cr (Scrap)');
  assert.equal(calculateCreditValue(5), 40, 'DC 5 must equal 40 Cr (Simple)');
  assert.equal(calculateCreditValue(10), 160, 'DC 10 must equal 160 Cr (Standard)');
  assert.equal(calculateCreditValue(15), 640, 'DC 15 must equal 640 Cr (Expert)');
  assert.equal(calculateCreditValue(20), 2560, 'DC 20 must equal 2,560 Cr (Advanced)');
  assert.equal(calculateCreditValue(25), 10240, 'DC 25 must equal 10,240 Cr (Master)');
  assert.equal(calculateCreditValue(30), 40960, 'DC 30 must equal 40,960 Cr (Grandmaster)');
  assert.equal(calculateCreditValue(50), 10485760, 'DC 50 must equal 10,485,760 Cr (Transcendent)');

  // DC 18 interpolation
  const dc18 = calculateCreditValue(18);
  assert.ok(Math.abs(dc18 - 1470) <= 20, `DC 18 should be ~1470 Cr, got ${dc18}`);
});

test('Material Cost - 50% of Credit Value', () => {
  assert.equal(calculateMaterialCost(2560), 1280);
  assert.equal(calculateMaterialCost(10), 5);
  assert.equal(calculateMaterialCost(0), 0);
});

test('Crafting Days calculations', () => {
  // Titan Mech (DC 40 = 655,360 Cr) with skill check 30 at Nanoforge (x1000)
  // Daily PP = (30 - 10) * 1000 = 20,000 PP/day
  // Days = 655,360 / 20,000 = 32.768 days
  const dc40Val = calculateCreditValue(40); // 655360
  const days = calculateCraftingDays(dc40Val, 30, 1000);
  assert.ok(Math.abs(days - 32.77) < 0.1, `Expected ~32.77 days, got ${days}`);

  // Guard against low skill check (check <= 10)
  const lowCheckDays = calculateCraftingDays(100, 5, 10);
  assert.ok(lowCheckDays > 0, 'Crafting days with low check should not divide by zero or be negative');
});

test('calculateAllCraftingTiers returns all 7 tool tiers', () => {
  const tiers = calculateAllCraftingTiers(2560, 20);
  assert.equal(tiers.length, 7, 'Should return 7 tool tiers');
  assert.equal(tiers[0].id, 'improvised');
  assert.equal(tiers[4].id, 'nanoforge');
});

test('formatCraftingDuration gives humanized labels', () => {
  assert.equal(formatCraftingDuration(0), 'Instant (<1 hour)');
  assert.ok(formatCraftingDuration(0.5).includes('hrs'));
  assert.ok(formatCraftingDuration(5).includes('days'));
  assert.ok(formatCraftingDuration(14).includes('weeks'));
  assert.ok(formatCraftingDuration(60).includes('months'));
  assert.ok(formatCraftingDuration(400).includes('years'));
});

test('Financial Status & WS Lookup', () => {
  assert.equal(getFinancialStatus(0).name, 'Indebted');
  assert.equal(getFinancialStatus(3).name, 'Impoverished');
  assert.equal(getFinancialStatus(7).name, 'Struggling');
  assert.equal(getFinancialStatus(12).name, 'Middle Class');
  assert.equal(getFinancialStatus(18).name, 'Affluent');
  assert.equal(getFinancialStatus(25).name, 'Wealthy');
  assert.equal(getFinancialStatus(35).name, 'Hegemon');

  // getWSFromDC for DC 20 (2,560 Cr) -> Auto-Buy at Affluent is 2,500, Wealthy is 40,000
  const wsForDC20 = getWSFromDC(20);
  assert.ok(wsForDC20 >= 15, `WS for DC 20 should be >= 15 (got ${wsForDC20})`);
});

test('Complexity Tiers', () => {
  assert.equal(getComplexityTier(0), 'Scrap');
  assert.equal(getComplexityTier(5), 'Simple');
  assert.equal(getComplexityTier(20), 'Advanced');
  assert.equal(getComplexityTier(30), 'Grandmaster');
  assert.equal(getComplexityTier(45), 'Mythic');
});

test('calculateStartingWealth returns computed WS and breakdown', () => {
  const result = calculateStartingWealth({
    occupationBase: 10,
    originMod: 2,
    faction: 'Mekan', // +6
    tl: 3, // +2
    skillRanks: 2
  });
  // 10 + 2 + 6 + 2 + 2 = 22 -> Wealthy
  assert.equal(result.computedWS, 22);
  assert.equal(result.status.name, 'Wealthy');
});

test('calculateTradeProfit correctly calculates cargo trade pipeline', () => {
  const result = calculateTradeProfit({
    commodityId: 'foodstuffs', // Base 500
    sourceTradeCode: 'Ag',    // Foodstuffs -30% -> 350
    destTradeCode: 'Ba',      // Foodstuffs +30% -> 650
    tonnage: 10,
    marketRoll: 0
  });
  assert.equal(result.buyPricePerTon, 350);
  assert.equal(result.sellPricePerTon, 650);
  assert.equal(result.totalBuyCost, 3500);
  assert.equal(result.totalSellRevenue, 6500);
  assert.equal(result.netProfit, 3000);
});

// ═══════════════════════════════════════════════════════════
// 2. TECH ENGINE TESTS
// ═══════════════════════════════════════════════════════════

test('Tech Level Definitions & Education Bonuses', () => {
  const tl3 = getTechLevelDef(3);
  assert.equal(tl3.name, 'TL 3');
  assert.equal(tl3.era, 'Space Age');

  const edu3 = calculateEducationBonus(3);
  assert.equal(edu3.educationBonus.value, 30);
});

test('Tech Penalty calculations', () => {
  // Device TL 4, Character TL 2 -> gap = 2
  // General device: -5 per gap -> -10
  assert.equal(calculateTechPenalty(4, 2, false), -10);
  // Weapon: -1 per gap -> -2
  assert.equal(calculateTechPenalty(4, 2, true), -2);
  // Device TL <= Character TL -> 0 penalty
  assert.equal(calculateTechPenalty(2, 4, false), 0);
});

test('Schematic Rarity & Adaptive Tech Reconfig', () => {
  const cost = getSchematicCost(2560, 'Common');
  assert.equal(cost.schematicCost, 2560 * 5);
  assert.equal(cost.integrationDC, 20);

  const picotech = getReconfigTime('picotech');
  assert.equal(picotech.tl, 4);
});

// ═══════════════════════════════════════════════════════════
// 3. UDU ENGINE TESTS
// ═══════════════════════════════════════════════════════════

test('UDU Node Capacities and Hierarchy Scale', () => {
  assert.equal(getNodeCapacity('Head'), 10);
  assert.equal(getNodeCapacity('Torso'), 50);
  assert.equal(getNodeCapacity('LeftArm'), 30);
  assert.equal(getTotalBodyNodes(), 200);

  // 10 Nodes = 1 Socket
  assert.equal(convertUDUScale('Node', 'Socket', 10), 1);
  // 100 Nodes = 1 Mount
  assert.equal(convertUDUScale('Node', 'Mount', 100), 1);
  // 1000 Nodes = 1 Module
  assert.equal(convertUDUScale('Node', 'Module', 1000), 1);
});

test('UDU Budget Validations', () => {
  // Socket budget
  const sBudget = calculateSocketBudget(3, 2);
  assert.equal(sBudget.used, 2);
  assert.equal(sBudget.remaining, 1);
  assert.equal(sBudget.isOverBudget, false);

  const sOver = calculateSocketBudget(3, 4);
  assert.equal(sOver.isOverBudget, true);

  // Node allocation validation
  const headAlloc = validateNodeAllocation('Head', [
    { name: 'Cybernetic Eye', nodes: 3 },
    { name: 'Neural Jack', nodes: 2 }
  ]);
  assert.equal(headAlloc.valid, true);
  assert.equal(headAlloc.used, 5);
  assert.equal(headAlloc.remaining, 5);

  const headOver = validateNodeAllocation('Head', [
    { name: 'Subdermal Plating', nodes: 15 }
  ]);
  assert.equal(headOver.valid, false);
});

test('Stigma Thresholds', () => {
  assert.equal(getStigmaLevel(0).name, 'None');
  assert.equal(getStigmaLevel(2).name, 'Minor');
  assert.equal(getStigmaLevel(5).name, 'Moderate');
  assert.equal(getStigmaLevel(8).name, 'Severe');
});
