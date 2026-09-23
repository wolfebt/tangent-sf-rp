import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateCreditValue,
  calculateMaterialCost,
  calculateCraftingDays,
  calculateAllCraftingTiers,
  calculateLiquidityGap,
  calculateSellPrice,
  calculateStartingWealth,
  calculateCooperativeCrafting,
  getFinancialStatus,
  getComplexityTier
} from '../../src/engines/tangentEconEngine.js';

import {
  getTechLevelDef,
  getSubStrataDetails,
  calculateTechPenalty,
  getSchematicCost,
  getReconfigTime
} from '../../src/engines/tangentTechEngine.js';

import {
  getScalingCategory,
  stepDieSide,
  scaleDamageDice,
  calculateFluidCombatModifier,
  calculateProximityDamage,
  scaleMetaTechInvocation,
  scaleStructurePoints,
  scaleCarryingCapacity
} from '../../src/engines/tangentScalingEngine.js';

import {
  CIVILIZATION_ARCHETYPES,
  TOOL_TIERS,
  SIZE_CATEGORIES_LIST,
  DIE_STEP_LADDER
} from '../../src/engines/tangentConstants.js';

describe('Asset Studio Codex Integration Tests', () => {

  describe('Economatrix Studio Workflow Mechanics', () => {
    it('calculates TSC Credit Value and 50% Material Cost correctly', () => {
      // DC 15 -> 10 * 4^3 = 640 Cr
      const val15 = calculateCreditValue(15);
      assert.equal(val15, 640);
      assert.equal(calculateMaterialCost(val15), 320);

      // DC 20 -> 10 * 4^4 = 2560 Cr
      const val20 = calculateCreditValue(20);
      assert.equal(val20, 2560);
      assert.equal(calculateMaterialCost(val20), 1280);
    });

    it('calculates Fabrication Days across tool tiers with check margin', () => {
      const creditVal = 640;
      const crafterCheck = 20; // Margin over 10 is 10
      // Basic Tool Tier (mult 10): daily PP = 10 * 10 = 100 PP -> 640 / 100 = 6.4 days
      const daysBasic = calculateCraftingDays(creditVal, crafterCheck, 10);
      assert.equal(daysBasic, 6.4);

      // Advanced Tool Tier (mult 50): daily PP = 10 * 50 = 500 PP -> 640 / 500 = 1.28 days
      const daysAdv = calculateCraftingDays(creditVal, crafterCheck, 50);
      assert.equal(daysAdv, 1.28);

      const allTiers = calculateAllCraftingTiers(creditVal, crafterCheck);
      assert.equal(allTiers.length, 7);
      assert.ok(allTiers[0].days > allTiers[6].days);
    });

    it('calculates Cooperative Industrial Workforce production for capital assets', () => {
      const creditVal = 2560000; // 2.56M Cr Frigate
      const workforce = 100;
      const avgCheck = 15; // margin 5
      const industrialMult = 100; // industrial tooling
      // Daily PP = 100 workers * (5 * 100) = 50,000 PP/day
      const coop = calculateCooperativeCrafting(workforce, avgCheck, industrialMult, creditVal);
      assert.equal(coop.combinedDailyPP, 50000);
      assert.equal(coop.totalDays, 51.2);
    });

    it('evaluates Liquidity Gap and Requisition thresholds', () => {
      const itemDC = 25; // Item worth 10,240 Cr
      const wealthyBuyerWS = 25;
      const modestBuyerWS = 15; // Capital 640 Cr

      const approved = calculateLiquidityGap(itemDC, wealthyBuyerWS);
      assert.equal(approved.isAutoBuy, true);
      assert.equal(approved.liquidCost, 0);

      const deficit = calculateLiquidityGap(itemDC, modestBuyerWS);
      assert.equal(deficit.isAutoBuy, false);
      assert.ok(deficit.liquidCost > 0);
    });

    it('calculates Resale and Salvage Margins', () => {
      const val = 10000;
      assert.equal(calculateSellPrice(val, 'legal'), 5000); // 50%
      assert.equal(calculateSellPrice(val, 'blackMarket'), 2250); // 22.5%
      assert.equal(calculateSellPrice(val, 'scrap'), 1000); // 10%
    });

    it('derives Starting Wealth Score and liquid funds for personas', () => {
      const wealth = calculateStartingWealth({
        occupationWS: 12,
        originMod: 1,
        factionMod: 0,
        tlMod: 2,
        skillRanks: 2
      });
      assert.ok(wealth.computedWS >= 12);
      assert.ok(wealth.status);
    });
  });

  describe('Technology Studio Workflow Mechanics', () => {
    it('retrieves Tech Level descriptors and sub-stratum modifiers', () => {
      const tl3 = getTechLevelDef(3);
      assert.equal(tl3.id, 3);
      assert.equal(tl3.name, 'TL 3');
      assert.equal(tl3.era, 'Space Age');

      const nascent = getSubStrataDetails(3, 'Nascent');
      assert.equal(nascent.penaltyMod, -1);
      assert.equal(nascent.reliabilityMod, -2);

      const advanced = getSubStrataDetails(3, 'Advanced');
      assert.equal(advanced.penaltyMod, 1);
      assert.equal(advanced.reliabilityMod, 2);
    });

    it('calculates operator tech penalties with weapon vs technical distinction', () => {
      // Device TL 4, Operator TL 2 -> 2 TL gap
      // Weapons: -1 per TL gap -> -2
      const weaponPen = calculateTechPenalty(4, 2, true);
      assert.equal(weaponPen, -2);

      // Technical systems: -5 per TL gap -> -10
      const techPen = calculateTechPenalty(4, 2, false);
      assert.equal(techPen, -10);

      // Operator meets or exceeds device TL -> 0 penalty
      assert.equal(calculateTechPenalty(3, 3, false), 0);
      assert.equal(calculateTechPenalty(2, 4, false), 0);
    });

    it('calculates schematic acquisition cost and reverse-engineering DC', () => {
      const itemCost = 5000;
      const common = getSchematicCost(itemCost, 'Common');
      assert.equal(common.schematicCost, 5000 * 5); // 5x
      assert.equal(common.integrationDC, 20);

      const rare = getSchematicCost(itemCost, 'Rare/Restricted');
      assert.equal(rare.schematicCost, 5000 * 20); // 20x
      assert.equal(rare.integrationDC, 20);
    });

    it('determines adaptive matter reconfiguration times', () => {
      const pico = getReconfigTime('Programmable Matter');
      assert.ok(pico);
      assert.ok(pico.reconfigTime);
    });
  });

  describe('Scaling Studio Workflow Mechanics', () => {
    it('resolves all 14 volumetric scale categories properly', () => {
      assert.equal(SIZE_CATEGORIES_LIST.length, 14);

      const med = getScalingCategory('Medium');
      assert.equal(med.scaleMultiplier, 1.0);
      assert.equal(med.dieStep, 0);

      const large = getScalingCategory('Large');
      assert.equal(large.scaleMultiplier, 2.0);

      const huge = getScalingCategory('Huge');
      assert.equal(huge.scaleMultiplier, 5.0);

      const small = getScalingCategory('Small');
      assert.equal(small.dieStep, -1);
    });

    it('steps down sub-medium damage dice along the canonical DIE_STEP_LADDER', () => {
      // 1 step down from d10 is d8
      assert.equal(stepDieSide('d10', 1), 'd8');
      // 2 steps down from d10 is d6
      assert.equal(stepDieSide('d10', 2), 'd6');
      // 3 steps down from d10 is d4
      assert.equal(stepDieSide('d10', 3), 'd4');
      // 6 steps down is 1 pt min
      assert.equal(stepDieSide('d10', 6), '1 pt min');

      // Small size (-1ds): 2d10 -> 2d8
      assert.equal(scaleDamageDice('2d10', 'Small'), '2d8');
      // Tiny size (-2ds): 2d10 -> 2d6
      assert.equal(scaleDamageDice('2d10', 'Tiny'), '2d6');
    });

    it('multiplies positive scale damage dice for large and colossal frames', () => {
      // Large (x2): 2d10 -> 4d10
      assert.equal(scaleDamageDice('2d10', 'Large'), '4d10');
      // Huge (x5): 1d8 -> 5d8
      assert.equal(scaleDamageDice('1d8', 'Huge'), '5d8');
    });

    it('calculates Fluid Combat opposed matchup modifiers correctly', () => {
      // Equal sizes -> 0
      const equalMod = calculateFluidCombatModifier('Medium', 'Medium');
      assert.equal(equalMod.modifier, 0);

      // Large attacker (combatMod -2) vs Small target (combatMod +2): -2 - (+2) = -4
      const largeVsSmall = calculateFluidCombatModifier('Large', 'Small');
      assert.equal(largeVsSmall.modifier, -4);

      // Small attacker (combatMod +2) vs Large target (combatMod -2): +2 - (-2) = +4
      const smallVsLarge = calculateFluidCombatModifier('Small', 'Large');
      assert.equal(smallVsLarge.modifier, 4);
    });

    it('calculates Starship Proximity Overblast and splash radius', () => {
      // Titanic starship scale
      const prox = calculateProximityDamage('Titanic', '80d10', 120);
      assert.equal(prox.isStarshipScale, true);
      assert.equal(prox.proximityActive, true);
      assert.equal(prox.indirectDamageRatio, 0.1);
      assert.equal(prox.splashRadiusFt, 60); // 120 / 2 = 60 ft
    });

    it('amplifies Meta-Tech Invocations across host chassis while preserving Save DC', () => {
      const baseInvoc = {
        name: 'Plasma Arc',
        baseDamage: '5d6',
        baseRange: 100,
        baseArea: 20,
        saveDC: 16
      };
      // Huge chassis (x5 multiplier)
      const scaled = scaleMetaTechInvocation(baseInvoc, 'Huge');
      assert.equal(scaled.scaleMultiplier, 5);
      assert.equal(scaled.scaledDamage, '25d6');
      assert.equal(scaled.scaledRange, '500 ft');
      assert.equal(scaled.scaledArea, '100 ft radius');
      assert.equal(scaled.saveDC, 16); // Preserved
    });

    it('scales Structure Points (SP) and carrying capacity', () => {
      // Base SP 50 on Large chassis (x2) -> 100 SP
      assert.equal(scaleStructurePoints(50, 'Large'), 100);
      // Base SP 50 on Huge chassis (x5) -> 250 SP
      assert.equal(scaleStructurePoints(50, 'Huge'), 250);
      // Base capacity 500 lbs on Large chassis (x2) -> 1000 lbs
      assert.equal(scaleCarryingCapacity(500, 'Large'), 1000);
    });
  });

  describe('Planetary Civilization Archetype Detection', () => {
    it('matches civilization archetypes from domain ratings', () => {
      const postScarcityThreshold = { energy: 5, society: 5, manufacturing: 5 };
      const matched = CIVILIZATION_ARCHETYPES.find(arch => {
        return Object.keys(arch.threshold).every(k => postScarcityThreshold[k] >= arch.threshold[k]);
      });
      assert.ok(matched);
      assert.equal(matched.id, 'post_scarcity_utopia');
    });
  });

});
