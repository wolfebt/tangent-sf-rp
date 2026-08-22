import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCreditValue,
  calculateMaterialCost,
  calculateCraftingDays,
  calculateAllCraftingTiers,
  calculateLiquidityGap,
  calculateSellPrice,
  getFinancialStatus,
  calculateStartingWealth,
  calculateTradeProfit,
  calculateCooperativeCrafting,
  calculateWealthGrowthCost
} from '../tangentEconEngine.js';
import {
  calculateTechPenalty,
  calculateEducationBonus,
  getSchematicCost,
  getReconfigTime,
  getAvailableTechAtTL
} from '../tangentTechEngine.js';
import {
  TECH_LEVELS,
  FINANCIAL_STATUS_TABLE,
  TOOL_TIERS,
  COMMODITIES_CATALOG
} from '../tangentConstants.js';

describe('Tangent SF RP — Phase 5 Economatrix & Technology Dashboards Engine (Plans 29 & 30)', () => {
  describe('Economatrix Suite Algorithms (Plan 29)', () => {
    it('calculates Tangent Standard Curve (TSC) benchmarks accurately', () => {
      assert.equal(calculateCreditValue(0), 10);
      assert.equal(calculateCreditValue(5), 40);
      assert.equal(calculateCreditValue(10), 160);
      assert.equal(calculateCreditValue(15), 640);
      assert.equal(calculateCreditValue(20), 2560);
      assert.equal(calculateCreditValue(25), 10240);
      assert.equal(calculateCreditValue(30), 40960);
      assert.equal(calculateCreditValue(50), 10485760); // 10.48M Cr Dreadnought
    });

    it('enforces 50% material fabrication cost', () => {
      assert.equal(calculateMaterialCost(2560), 1280);
      assert.equal(calculateMaterialCost(40960), 20480);
    });

    it('derives Starting Wealth Score (WS) across multi-variable backgrounds', () => {
      const charA = calculateStartingWealth({
        occupationWS: 10,
        originMod: 2,
        factionMod: 2,
        tlMod: 2,
        skillRanks: 2
      });

      assert.equal(charA.computedWS, 18);
      assert.equal(charA.status.name, 'Affluent');
      assert.equal(charA.status.autoBuyCr, 2500);
    });

    it('computes Liquidity Gap and Auto-Buy eligibility', () => {
      // If Item DC <= WS -> gap is 0 Cr
      const autoBuy = calculateLiquidityGap(15, 20);
      assert.equal(autoBuy.liquidGapCost, 0);

      // If Item DC > WS -> gap is ItemValue - WSValue
      // DC 20 (2560 Cr) vs WS 10 (Middle Class autoBuy 600 Cr) -> gap = 1960 Cr
      const gap = calculateLiquidityGap(20, 10);
      assert.equal(gap.liquidGapCost, 1960);
    });

    it('applies liquidity drag fence rates for legal, black market, and scrap', () => {
      const itemVal = 10000;
      assert.equal(calculateSellPrice(itemVal, 'legal'), 5000);
      assert.equal(calculateSellPrice(itemVal, 'blackMarket'), 2250);
      assert.equal(calculateSellPrice(itemVal, 'scrap'), 1000);
    });

    it('calculates cooperative shipyard crafting timelines', () => {
      // 1,000 workers, skill check 15, Industrial tools (200x)
      // Daily PP per worker: (15 - 10) * 200 = 1,000 PP/day
      // Total shipyard output: 1,000,000 PP/day
      // Target: Dreadnought DC 50 (10,485,760 PP)
      const dreadnoughtPlan = calculateCooperativeCrafting(1000, 15, 200, 10485760);
      assert.equal(dreadnoughtPlan.totalDailyPP, 1000000);
      assert.ok(dreadnoughtPlan.daysRequired > 10 && dreadnoughtPlan.daysRequired < 11);
    });

    it('simulates speculative interstellar trade profits', () => {
      // Export Foodstuffs from Ag world to In world
      const trade = calculateTradeProfit({
        commodityId: 'foodstuffs',
        sourceTradeCode: 'Ag',
        destTradeCode: 'In',
        tons: 100,
        marketRoll: 4
      });

      assert.ok(trade.totalBuyCost < trade.totalSellRevenue);
      assert.ok(trade.netProfit > 0);
    });

    it('calculates wealth progression growth cost', () => {
      // Upgrading from WS 15 to WS 20 (4x 2500 + 1x 40000 = 50,000 Cr)
      const cost = calculateWealthGrowthCost(15, 20);
      assert.equal(cost, 50000);
    });
  });

  describe('Technology Codex Algorithms (Plan 30)', () => {
    it('calculates Tech Level Gap penalties correctly', () => {
      // General Device gap 2: 2 * -5 = -10
      assert.equal(calculateTechPenalty(4, 2, false), -10);

      // Weapon Device gap 2: 2 * -1 = -2
      assert.equal(calculateTechPenalty(4, 2, true), -2);

      // No gap or device below char TL: 0
      assert.equal(calculateTechPenalty(2, 4, false), 0);
    });

    it('calculates schematic market costs by rarity', () => {
      const baseCost = 1000;
      assert.equal(getSchematicCost(baseCost, 'Common').schematicCost, 5000);
      assert.equal(getSchematicCost(baseCost, 'Uncommon').schematicCost, 10000);
      assert.equal(getSchematicCost(baseCost, 'Rare').schematicCost, 20000);
    });

    it('returns canonical adaptive reconfiguration times', () => {
      assert.ok(getReconfigTime('nanotech').reconfigTime.includes('Minute'));
      assert.ok(getReconfigTime('picotech').reconfigTime.includes('Round'));
      assert.ok(getReconfigTime('polymatter').reconfigTime.includes('Round'));
      assert.ok(getReconfigTime('holophotonic').reconfigTime.includes('Instant'));
    });
  });
});
