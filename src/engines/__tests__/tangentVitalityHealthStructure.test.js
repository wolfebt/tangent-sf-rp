import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  calculateBaseToughness,
  calculateVitalityHealthPools,
  calculateConcussiveDamageSplit,
  applyDamageToEntity,
  calculateCompanionStats
} from '../tangentEntityEngines.js';

import {
  VITALITY_HEALTH_STRUCTURE_RULES
} from '../tangentConstants.js';

describe('Tangent SF RP — Canonical Vitality, Health, Structure & Toughness Rules', () => {

  describe('Starting Values, Maximums & BP Progression', () => {
    it('initializes characters with base 30 Vitality and 30 Health', () => {
      const pools = calculateVitalityHealthPools();
      assert.strictEqual(pools.vitality, 30);
      assert.strictEqual(pools.health, 30);
      assert.strictEqual(pools.structure, 0);
      assert.strictEqual(pools.isSynthetic, false);
      assert.strictEqual(pools.suggestedMax, 60);
    });

    it('increases Vitality and Health at a rate of 5 points per 1 BP', () => {
      const pools = calculateVitalityHealthPools({
        vitalityBP: 2, // +10 Vitality
        healthBP: 3    // +15 Health
      });
      assert.strictEqual(pools.vitality, 40);
      assert.strictEqual(pools.health, 45);
      assert.strictEqual(pools.purchasedVitality, 10);
      assert.strictEqual(pools.purchasedHealth, 15);
      assert.strictEqual(pools.vitalityBPCost, 2);
      assert.strictEqual(pools.healthBPCost, 3);
    });

    it('caps purchased Vitality and Health at a maximum increase of 5 x Stamina score', () => {
      const pools = calculateVitalityHealthPools({
        vitalityBP: 5, // +25 requested
        healthBP: 6,   // +30 requested
        staminaScore: 3 // max increase = 15 each
      });
      assert.strictEqual(pools.vitality, 45); // 30 + 15
      assert.strictEqual(pools.health, 45);   // 30 + 15
      assert.strictEqual(pools.purchasedVitality, 15);
      assert.strictEqual(pools.purchasedHealth, 15);
      assert.strictEqual(pools.maxVitalityIncrease, 15);
      assert.strictEqual(pools.maxHealthIncrease, 15);
    });

    it('calculates Structure by combining Vitality and Health for Synthetics and non-standard anatomy', () => {
      const bioPools = calculateVitalityHealthPools({
        vitalityBP: 2,
        healthBP: 2,
        isSynthetic: false
      });
      assert.strictEqual(bioPools.vitality, 40);
      assert.strictEqual(bioPools.health, 40);
      assert.strictEqual(bioPools.structure, 0);

      const synthPools = calculateVitalityHealthPools({
        vitalityBP: 2,
        healthBP: 2,
        isSynthetic: true
      });
      // 40 + 40 = 80 Structure Points
      assert.strictEqual(synthPools.structure, 80);
      assert.strictEqual(synthPools.vitality, 0);
      assert.strictEqual(synthPools.health, 0);
      assert.strictEqual(synthPools.isSynthetic, true);
    });
  });

  describe('Stamina Ability Score & Base Toughness', () => {
    it('determines base Toughness directly from Stamina score to reduce wound damage point-for-point', () => {
      assert.strictEqual(calculateBaseToughness(0), 0);
      assert.strictEqual(calculateBaseToughness(3), 3);
      assert.strictEqual(calculateBaseToughness(6), 6);
      assert.strictEqual(calculateBaseToughness(null), 0);
    });

    it('includes Toughness in calculateVitalityHealthPools calculation', () => {
      const pools = calculateVitalityHealthPools({ staminaScore: 4 });
      assert.strictEqual(pools.toughness, 4);
    });
  });

  describe('Concussive Damage Split (Falls, Explosions, Crashes)', () => {
    it('divides traumatic concussive damage equally (50/50) between Vitality and Health on attempted reduction', () => {
      const splitEven = calculateConcussiveDamageSplit(10, true);
      assert.strictEqual(splitEven.vitalityDamage, 5);
      assert.strictEqual(splitEven.healthDamage, 5);
      assert.strictEqual(splitEven.wasSplit, true);

      // Odd damage divides with ceiling to Vitality buffer
      const splitOdd = calculateConcussiveDamageSplit(7, true);
      assert.strictEqual(splitOdd.vitalityDamage, 4);
      assert.strictEqual(splitOdd.healthDamage, 3);
      assert.strictEqual(splitOdd.wasSplit, true);
    });

    it('does not split concussive damage if no reduction was attempted', () => {
      const noReduction = calculateConcussiveDamageSplit(10, false);
      assert.strictEqual(noReduction.vitalityDamage, 10);
      assert.strictEqual(noReduction.healthDamage, 0);
      assert.strictEqual(noReduction.wasSplit, false);
    });
  });

  describe('Damage Resolution Engine (Lethal, Non-Lethal & Spillover)', () => {
    it('reduces incoming damage point-for-point using Armor DR and Toughness', () => {
      const result = applyDamageToEntity({
        currentVitality: 30,
        currentHealth: 30,
        incomingDamage: 12,
        armorDR: 3,
        toughness: 4 // total soak = 7
      });
      // 12 - 7 = 5 net damage to Health (lethal)
      assert.strictEqual(result.damageSoaked, 7);
      assert.strictEqual(result.netDamage, 5);
      assert.strictEqual(result.newHealth, 25);
      assert.strictEqual(result.newVitality, 30);
    });

    it('automatically reduces penetrating damage with Stamina natural DR to a minimum of 1 point', () => {
      const result = applyDamageToEntity({
        currentVitality: 30,
        currentHealth: 30,
        incomingDamage: 6,
        armorDR: 4,     // 6 - 4 = 2 penetrating damage
        toughness: 5    // Stamina natural DR = 5 > 2
      });
      // Penetrating damage cannot be reduced below 1
      assert.strictEqual(result.netDamage, 1);
      assert.strictEqual(result.damageSoaked, 5);
      assert.strictEqual(result.newHealth, 29);
    });

    it('inflicts 0 damage when defenses completely deflect incoming damage', () => {
      const result = applyDamageToEntity({
        currentVitality: 30,
        currentHealth: 30,
        incomingDamage: 4,
        armorDR: 5,     // 4 <= 5 (does not penetrate)
        toughness: 3
      });
      assert.strictEqual(result.netDamage, 0);
      assert.strictEqual(result.damageSoaked, 4);
      assert.strictEqual(result.newHealth, 30);
    });

    it('preserves non-lethal damage routing to Vitality even on a critical hit', () => {
      const result = applyDamageToEntity({
        currentVitality: 30,
        currentHealth: 30,
        incomingDamage: 18,
        isNonLethal: true,
        isCritical: true // Critical hit modifies damage but does not force lethal
      });
      assert.strictEqual(result.newVitality, 12);
      assert.strictEqual(result.newHealth, 30);
      assert.strictEqual(result.spillover, 0);
    });

    it('depletes Vitality first for non-lethal damage', () => {
      const result = applyDamageToEntity({
        currentVitality: 30,
        currentHealth: 30,
        incomingDamage: 10,
        isNonLethal: true
      });
      assert.strictEqual(result.newVitality, 20);
      assert.strictEqual(result.newHealth, 30);
      assert.strictEqual(result.spillover, 0);
      assert.strictEqual(result.incapacitated, false);
    });

    it('spills excess non-lethal damage into Health only when Vitality is completely depleted', () => {
      const result = applyDamageToEntity({
        currentVitality: 8,
        currentHealth: 30,
        incomingDamage: 15,
        isNonLethal: true
      });
      // 8 Vitality absorbed, 7 spills into Health
      assert.strictEqual(result.newVitality, 0);
      assert.strictEqual(result.spillover, 7);
      assert.strictEqual(result.newHealth, 23);
      assert.strictEqual(result.incapacitated, false);
    });

    it('incapacitates a character when Health reaches zero', () => {
      const result = applyDamageToEntity({
        currentVitality: 0,
        currentHealth: 10,
        incomingDamage: 12,
        isNonLethal: false // lethal attack
      });
      assert.strictEqual(result.newHealth, 0);
      assert.strictEqual(result.incapacitated, true);
    });

    it('resolves concussive damage with 50/50 split and handles Vitality overflow to Health', () => {
      const result = applyDamageToEntity({
        currentVitality: 5,
        currentHealth: 30,
        incomingDamage: 20,
        isConcussive: true,
        attemptedReduction: true
      });
      // 20 damage: 10 to Vitality, 10 to Health
      // Current Vitality is 5 -> 5 absorbed, 5 overflows to Health
      // Total to Health = 10 + 5 = 15
      assert.strictEqual(result.newVitality, 0);
      assert.strictEqual(result.newHealth, 15);
      assert.strictEqual(result.concussiveSplit.wasSplit, true);
    });
  });

  describe('Synthetic Structure Points Resolution', () => {
    it('applies damage directly to Structure without a Vitality buffer', () => {
      const result = applyDamageToEntity({
        currentStructure: 60,
        isSynthetic: true,
        incomingDamage: 18,
        toughness: 3,
        armorDR: 5
      });
      // Soak = 8, net = 10
      assert.strictEqual(result.damageSoaked, 8);
      assert.strictEqual(result.netDamage, 10);
      assert.strictEqual(result.newStructure, 50);
      assert.strictEqual(result.newVitality, 0);
      assert.strictEqual(result.newHealth, 0);
      assert.strictEqual(result.incapacitated, false);
    });

    it('synthetics are immune to non-lethal damage', () => {
      const result = applyDamageToEntity({
        currentStructure: 60,
        isSynthetic: true,
        incomingDamage: 25,
        isNonLethal: true
      });
      assert.strictEqual(result.newStructure, 60);
      assert.strictEqual(result.netDamage, 0);
      assert.strictEqual(result.isNonLethalImmune, true);
    });

    it('destroys a synthetic when Structure reaches zero', () => {
      const result = applyDamageToEntity({
        currentStructure: 15,
        isSynthetic: true,
        incomingDamage: 20
      });
      assert.strictEqual(result.newStructure, 0);
      assert.strictEqual(result.incapacitated, true);
      assert.strictEqual(result.dead, true);
    });

    it('calculates companion synthetic structure as Vitality + Health combined (2x base pool)', () => {
      const synthCompanion = calculateCompanionStats({
        type: 'Synthetic',
        companionRank: 1,
        ownerTier: 1
      });
      // Base pool for Tier 1 companion is 25 (20 + 5).
      // Synthetic combines Vitality + Health -> 25 + 25 = 50 Structure Points
      assert.strictEqual(synthCompanion.structurePoints, 50);
      assert.strictEqual(synthCompanion.vitality, 0);
      assert.strictEqual(synthCompanion.health, 0);
    });
  });

  describe('Canon Constant Verification', () => {
    it('exports official VITALITY_HEALTH_STRUCTURE_RULES with all descriptions', () => {
      assert.strictEqual(VITALITY_HEALTH_STRUCTURE_RULES.startingBaseVitality, 30);
      assert.strictEqual(VITALITY_HEALTH_STRUCTURE_RULES.startingBaseHealth, 30);
      assert.strictEqual(VITALITY_HEALTH_STRUCTURE_RULES.bpCostPer5Points, 1);
      assert.strictEqual(VITALITY_HEALTH_STRUCTURE_RULES.suggestedStartingMax, 60);
      assert.ok(VITALITY_HEALTH_STRUCTURE_RULES.descriptions.systemRule.includes('Tangent does NOT use HP'));
      assert.ok(VITALITY_HEALTH_STRUCTURE_RULES.descriptions.staminaScore.includes('natural damage reduction'));
      assert.ok(VITALITY_HEALTH_STRUCTURE_RULES.descriptions.staminaScore.includes('minimum of 1 point'));
      assert.strictEqual(VITALITY_HEALTH_STRUCTURE_RULES.maxSkillRank, 20);
      assert.strictEqual(VITALITY_HEALTH_STRUCTURE_RULES.maxSpecializationRank, 10);
      assert.strictEqual(VITALITY_HEALTH_STRUCTURE_RULES.maxInvocationRank, 10);
      assert.ok(VITALITY_HEALTH_STRUCTURE_RULES.descriptions.concussiveDamage.includes('divided equally'));
      assert.ok(VITALITY_HEALTH_STRUCTURE_RULES.descriptions.structure.includes('total of both Health and Vitality scores'));
      assert.ok(VITALITY_HEALTH_STRUCTURE_RULES.descriptions.structure.includes('immune to non-lethal damage'));
    });
  });
});
