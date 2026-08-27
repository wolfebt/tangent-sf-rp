import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getScalingCategory,
  stepDieSide,
  scaleDamageDice,
  calculateFluidCombatModifier,
  calculateProximityDamage,
  scaleMetaTechInvocation,
  scaleMovementSpeed,
  scaleRange,
  scaleStructurePoints,
  scaleCarryingCapacity,
  validateAssetScaling,
  validateAssetValuation
} from '../tangentScalingEngine.js';
import { SIZE_CATEGORIES, DIE_STEP_LADDER } from '../tangentConstants.js';

test('1. Canonical 14-Tier Size Categories - Integrity & Attribute Checks', () => {
  const sizes = Object.values(SIZE_CATEGORIES);
  assert.equal(sizes.length, 14, 'Must have exactly 14 canonical size categories');

  // Verify key tiers
  const miniscule = getScalingCategory('Miniscule');
  assert.equal(miniscule.dieStep, -5);
  assert.equal(miniscule.strMod, -32);
  assert.equal(miniscule.combatMod, 32);
  assert.equal(miniscule.stealthMod, 20);

  const medium = getScalingCategory('Medium');
  assert.equal(medium.scaleMultiplier, 1.0);
  assert.equal(medium.strMod, 0);
  assert.equal(medium.combatMod, 0);
  assert.equal(medium.stealthMod, 0);

  const huge = getScalingCategory('Huge');
  assert.equal(huge.scaleMultiplier, 5.0);
  assert.equal(huge.strMod, 4);
  assert.equal(huge.combatMod, -4);
  assert.equal(huge.stealthMod, -8);

  const colossal = getScalingCategory('Colossal');
  assert.equal(colossal.scaleMultiplier, 20.0);
  assert.equal(colossal.strMod, 16);
  assert.equal(colossal.combatMod, -16);
  assert.equal(colossal.stealthMod, -32);

  const titanic = getScalingCategory('Titanic');
  assert.equal(titanic.scaleMultiplier, 80.0);
  assert.equal(titanic.strMod, 64);
  assert.equal(titanic.combatMod, -64);
  assert.equal(titanic.stealthMod, 'NO');
  assert.equal(titanic.isStarship, true);

  const megaColossal = getScalingCategory('MegaColossal');
  assert.equal(megaColossal.scaleMultiplier, 320.0);
  assert.equal(megaColossal.strMod, 256);
  assert.equal(megaColossal.combatMod, -256);
  assert.equal(megaColossal.isStarship, true);
});

test('2. Die-Stepping Degradation Ladder (-1ds to -5ds)', () => {
  // Ladder: d10 -> d8 -> d6 -> d4 -> d3 -> d2 -> 1
  assert.equal(stepDieSide('d10', 1), 'd8');
  assert.equal(stepDieSide('d10', 2), 'd6');
  assert.equal(stepDieSide('d10', 3), 'd4');
  assert.equal(stepDieSide('d10', 4), 'd3');
  assert.equal(stepDieSide('d10', 5), 'd2');
  assert.equal(stepDieSide('d10', 6), '1 pt min');

  assert.equal(stepDieSide('d6', 1), 'd4');
  assert.equal(stepDieSide('d6', 2), 'd3');
  assert.equal(stepDieSide('d6', 3), 'd2');
  assert.equal(stepDieSide('d6', 4), '1 pt min');

  assert.equal(stepDieSide('2d8', 1), '2d6');
  assert.equal(stepDieSide('2d8', 2), '2d4');
  assert.equal(stepDieSide('2d8', 5), '2 (1 pt min)');
});

test('3. Weapon Damage Dice Scaling', () => {
  // Positive scaling (multipliers)
  assert.equal(scaleDamageDice('1d6', 'Medium'), '1d6');
  assert.equal(scaleDamageDice('5d6', 'Huge'), '25d6'); // 5d6 * 5 = 25d6
  assert.equal(scaleDamageDice('2d10', 'Large'), '4d10'); // 2d10 * 2 = 4d10
  assert.equal(scaleDamageDice('4d10', 'Gargantuan'), '40d10'); // 4d10 * 10 = 40d10

  // Sub-medium die stepping
  assert.equal(scaleDamageDice('1d10', 'Small'), '1d8'); // -1ds
  assert.equal(scaleDamageDice('1d10', 'Tiny'), '1d6'); // -2ds
  assert.equal(scaleDamageDice('1d10', 'Diminutive'), '1d4'); // -3ds
  assert.equal(scaleDamageDice('1d10', 'Fine'), '1d3'); // -4ds
  assert.equal(scaleDamageDice('1d10', 'Miniscule'), '1d2'); // -5ds
});

test('4. Fluid Combat Modifier Rules & Matchups', () => {
  // Canonical Example 1: Large (-2) attacks Small (+2) -> -2 - 2 = -4
  const res1 = calculateFluidCombatModifier('Large', 'Small');
  assert.equal(res1.modifier, -4, 'Large vs Small should be -4');

  // Canonical Example 2: Huge (-4) attacks Large (-2) -> -4 / -2 = -2
  const res2 = calculateFluidCombatModifier('Huge', 'Large');
  assert.equal(res2.modifier, -2, 'Huge vs Large should be -2');

  // Canonical Example 3: Small (+2) attacks Large (-2) -> 2 - (-2) = +4
  const res3 = calculateFluidCombatModifier('Small', 'Large');
  assert.equal(res3.modifier, 4, 'Small vs Large should be +4');

  // Canonical Example 4: Tiny (+4) attacks Small (+2) -> 4 / 2 = +2
  const res4 = calculateFluidCombatModifier('Tiny', 'Small');
  assert.equal(res4.modifier, 2, 'Tiny vs Small should be +2');

  // Equal size
  const resSame = calculateFluidCombatModifier('Large', 'Large');
  assert.equal(resSame.modifier, 0, 'Same size should be 0');

  // Medium Attacker
  const resMedVsSmall = calculateFluidCombatModifier('Medium', 'Small');
  assert.equal(resMedVsSmall.modifier, -2, 'Medium vs Small should be -2');
  const resMedVsLarge = calculateFluidCombatModifier('Medium', 'Large');
  assert.equal(resMedVsLarge.modifier, 2, 'Medium vs Large should be +2');
});

test('5. Starship Proximity Damage & Overblast', () => {
  // Titanic Starship (STR Mod = 64)
  const titanicProximity = calculateProximityDamage('Titanic', '80d10');
  assert.equal(titanicProximity.isStarshipScale, true);
  assert.equal(titanicProximity.proximityActive, true);
  assert.equal(titanicProximity.indirectDamageRatio, 0.1);
  assert.equal(titanicProximity.splashRadiusFt, 32); // 64 / 2 = 32 ft radius

  // Tactical Scale (Huge Mech)
  const tacticalProximity = calculateProximityDamage('Huge', '5d10');
  assert.equal(tacticalProximity.isStarshipScale, false);
  assert.equal(tacticalProximity.proximityActive, false);
});

test('6. Meta-Tech & Invocation Host Chassis Scaling', () => {
  // Fireball from Huge Mech: Base 5d6, 100ft range, 20ft area, DC 15
  const scaledFireball = scaleMetaTechInvocation({
    name: 'Fireball',
    baseDamage: '5d6',
    baseRange: 100,
    baseArea: 20,
    saveDC: 15
  }, 'Huge');

  assert.equal(scaledFireball.scaleMultiplier, 5);
  assert.equal(scaledFireball.scaledDamage, '25d6');
  assert.equal(scaledFireball.scaledRange, '500 ft');
  assert.equal(scaledFireball.scaledArea, '100 ft radius');
  assert.equal(scaledFireball.saveDC, 15, 'Save DC must remain unchanged by chassis scale');
});

test('7. Speed, Range, SP & Carrying Capacity Scaling', () => {
  // Base Speed 30
  assert.equal(scaleMovementSpeed(30, 'Huge'), 150); // 30 * 5 = 150 ft/rnd
  assert.equal(scaleMovementSpeed(30, 'Large'), 60); // 30 * 2 = 60 ft/rnd

  // Base Range 100 ft
  assert.equal(scaleRange(100, 'Gargantuan'), 1000); // 100 * 10 = 1000 ft

  // Base SP 50
  assert.equal(scaleStructurePoints(50, 'Huge'), 250); // 50 * 5 = 250 SP
  assert.equal(scaleStructurePoints(50, 'Colossal'), 1000); // 50 * 20 = 1000 SP

  // Carrying Capacity 500 lbs
  assert.equal(scaleCarryingCapacity(500, 'Large'), 1000); // 500 * 2 = 1000 lbs
  assert.equal(scaleCarryingCapacity(500, 'Huge'), 2500); // 500 * 5 = 2500 lbs
});

test('8. Asset Cross-Validation & Consistency Checks', () => {
  // Valid Medium Asset
  const validAsset = validateAssetScaling({
    name: 'Standard Mech',
    size: 'Medium',
    durability: 50,
    stealth: 0
  });
  assert.equal(validAsset.isValid, true);

  // Invalid Starship with positive stealth
  const invalidStarship = validateAssetScaling({
    name: 'Invalid Dreadnought',
    size: 'Titanic',
    stealth: 10
  });
  assert.equal(invalidStarship.isValid, false);
  assert.ok(invalidStarship.warnings.some(w => w.includes('cannot have positive baseline stealth')));
});

test('9. Valuation & DC Integrity Checker (Tangent Standard Curve)', () => {
  // DC 20 standard value = 2,560 Cr
  const standardValuation = validateAssetValuation(20, 2560);
  assert.equal(standardValuation.tscValue, 2560);
  assert.equal(standardValuation.isMatch, true);
  assert.equal(standardValuation.status, 'Accurate Standard Curve');

  // Overpriced
  const overpriced = validateAssetValuation(20, 6000);
  assert.equal(overpriced.status, 'Premium Overcharge (>150% TSC Value)');

  // Underpriced / Black Market
  const blackMarket = validateAssetValuation(20, 500);
  assert.equal(blackMarket.status, 'Subsidized / Black Market Salvage (<50% TSC Value)');

  // Unpriced / Zero Cost Flag
  const zeroCost = validateAssetValuation(20, 0);
  assert.equal(zeroCost.status, 'Unpriced / Zero Cost Flag');
});
