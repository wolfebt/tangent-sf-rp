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
  calculateCharacterWealth,
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

    it('derives live Character Wealth Score (WS) and breakdown from character sheet data', () => {
      // Scenario 1: Merchant from Leisure world, Syndicate faction, TL 4, Trade Rank 7
      // Merchant (base 5) + Leisure (+3) + Syndicate (+4) + TL4 (+4) + Trade R7 (Expert +3) = WS 19 (Affluent)
      const heroA = calculateCharacterWealth({
        'char-occu': 'Merchant',
        'char-origin': 'Leisure',
        'char-faction': 'Syndicate',
        'tech-level': 4,
        'skill-mental-trade-rank': 7
      });

      assert.equal(heroA.computedWS, 19);
      assert.equal(heroA.statusName, 'Affluent');
      assert.equal(heroA.autoBuyCr, 2500);
      assert.equal(heroA.breakdown.occupationBase, 5);
      assert.equal(heroA.breakdown.originMod, 3);
      assert.equal(heroA.breakdown.factionMod, 4);
      assert.equal(heroA.breakdown.tlMod, 4);
      assert.equal(heroA.breakdown.skillBonus, 3);
      assert.equal(heroA.breakdown.skillStage, 'Expert');

      // Scenario 2: Baseline Citizen on Colony world, Coalition faction, TL 3, no trade skills
      // Citizen (base 2) + Colony (+0) + Coalition (+0) + TL3 (+2) = WS 4 (Impoverished, 30 Cr auto-buy)
      const heroB = calculateCharacterWealth({
        'char-occu': 'Citizen',
        'char-origin': 'Colony',
        'char-faction': 'Coalition',
        'tech-level': 3
      });

      assert.equal(heroB.computedWS, 4);
      assert.equal(heroB.statusName, 'Impoverished');
      assert.equal(heroB.autoBuyCr, 30);

      // Scenario 3: Mekan Sovereign Representative on Industrial world, TL 5 with Master Vocation
      // Representative (base 6) + Industrial (+2) + Mekan (+6) + TL5 (+8) + Vocation R9 (+4) = WS 26 (Wealthy)
      const heroC = calculateCharacterWealth({
        'char-occu': 'Representative',
        'char-origin': 'Industrial',
        'char-faction': 'Mekan Sovereign Dominion',
        'tech-level': 5,
        'skill-vocation-rank': 9
      });

      assert.equal(heroC.computedWS, 26);
      assert.equal(heroC.statusName, 'Wealthy');
      assert.equal(heroC.autoBuyCr, 40000);
      assert.equal(heroC.breakdown.skillBonus, 4);
      assert.equal(heroC.breakdown.skillStage, 'Master');

      // Scenario 4: Manual explicit override takes absolute precedence
      const heroD = calculateCharacterWealth({
        'char-occu': 'Drifter',
        'tech-level': 0,
        'wealth-score-override': 50
      });

      assert.equal(heroD.computedWS, 50);
      assert.equal(heroD.statusName, 'Dynastic');
      assert.equal(heroD.autoBuyCr, 167000000);

      // Scenario 5: Ascendancy faction character receives +4 wealth modifier
      // Representative (base 6) + Enlightened world (2) + The Ascendancy (4) + TL4 (4) + Trade R2 (+1) = WS 17 (Affluent)
      const heroE = calculateCharacterWealth({
        'char-occu': 'Representative',
        'char-origin': 'Enlightened',
        'char-faction': 'The Ascendancy',
        'tech-level': 4,
        'skill-mental-trade-rank': 2
      });

      assert.equal(heroE.breakdown.factionMod, 4);
      assert.equal(heroE.computedWS, 17);
      assert.equal(heroE.statusName, 'Affluent');
    });

    it('aggregates liquid credits, trade goods, debits, and net liquidity position', () => {
      const hero = calculateCharacterWealth({
        'char-occu': 'Merchant',
        'credits': 12000,
        'trade-goods': [
          { goods: 'material', name: 'Refined Titanium', amount: 5, creditValue: 3000 },
          { goods: 'currency', name: 'Imperial Sovereigns', amount: 10, creditValue: 2000 }
        ],
        'debits': [
          { amount: 4000, debtor: 'Syndicate Banking Combine', notes: 'Loan for cargo ship fuel' }
        ]
      });

      assert.equal(hero.liquidCredits, 12000);
      assert.equal(hero.totalTradeGoodsCr, 5000);
      assert.equal(hero.totalLiquidCr, 17000);
      assert.equal(hero.totalDebtCr, 4000);
      assert.equal(hero.netLiquidPosition, 13000);
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
