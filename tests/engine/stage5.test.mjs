/**
 * @file stage5.test.mjs
 * @description Stage 5 Automated Verification Suite
 * Verifies 150 BP Persona DAG, Combat Arbitrator MAP/Size curves, Damage Pipeline DR/Wounds, and Mecha Sockets.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CharacterBuilder } from '../../src/engine/rules/CharacterBuilder.ts';
import { CombatArbitrator, SkillRank, SizeCategory, RangeCategory } from '../../src/engine/rules/CombatArbitrator.ts';
import { DamagePipeline } from '../../src/engine/rules/DamagePipeline.ts';
import { MechaSocketManager, TechLevel } from '../../src/engine/rules/MechaSocketManager.ts';

test('Stage 5.3: CharacterBuilder 150 BP Persona DAG & Parity Caps', () => {
  const builder = new CharacterBuilder();

  // 1. Valid Character
  const validDraft = {
    name: 'Operative Kaelen',
    speciesId: 'human',
    attributes: { str: 2, dex: 3, con: 2, int: 2, wis: 1, cha: 1 }, // 11 ranks * 5 = 55 BP
    hindrances: ['debt'], // +5 BP
    features: ['darkvision'] // 5 BP
  };

  const validation = builder.validate(validDraft);
  assert.equal(validation.isValid, true);
  assert.ok(validation.totalBPCost <= 150);

  // 2. Parity Cap Violation
  const invalidCapDraft = {
    name: 'Illegal Operative',
    speciesId: 'human', // Human cap is +4
    attributes: { str: 5, dex: 2, con: 2, int: 2, wis: 1, cha: 1 },
    hindrances: [],
    features: []
  };

  const capValidation = builder.validate(invalidCapDraft);
  assert.equal(capValidation.isValid, false);
  assert.ok(capValidation.errors.some(e => e.includes('Attribute Parity Violation')));

  // 3. Cyclic Dependency Check
  const cyclicReqs = {
    'cyber_arm': ['neural_link'],
    'neural_link': ['cyber_arm']
  };
  assert.equal(builder.validateDependencies(['cyber_arm'], cyclicReqs), false, 'Must detect cycle');

  const validReqs = {
    'cyber_arm': ['neural_link'],
    'neural_link': []
  };
  assert.equal(builder.validateDependencies(['cyber_arm'], validReqs), true, 'Valid tree allowed');
});

test('Stage 5.4: CombatArbitrator Canonical 3.00 COMBAT.md Rules (MAP, Actions, Size, Opposed Ties)', () => {
  const arb = new CombatArbitrator();

  // Canonical Action Tiers per 3.00 COMBAT.md:
  // Rank 0: Full Round action only
  const rank0 = arb.getActionTier(0);
  assert.equal(rank0.isFullRoundOnly, true);
  assert.equal(rank0.actionsCount, 1);
  assert.equal(rank0.focusBonus, 0);

  // Rank 3 (Novice): 1 action at base, +2 focus
  const rank3 = arb.getActionTier(3);
  assert.equal(rank3.actionsCount, 1);
  assert.equal(rank3.focusBonus, 2);

  // Rank 8 (Professional/Trained): 2 actions, +3 focus
  const rank8 = arb.getActionTier(8);
  assert.equal(rank8.actionsCount, 2);
  assert.equal(rank8.focusBonus, 3);
  assert.deepEqual(rank8.actionPenalties, [0, -5]);

  // Rank 14 (Expert): 3 actions, +4 focus
  const rank14 = arb.getActionTier(14);
  assert.equal(rank14.actionsCount, 3);
  assert.equal(rank14.focusBonus, 4);
  assert.deepEqual(rank14.actionPenalties, [0, -5, -10]);

  // Rank 28 (Pinnacle): 6 actions, +7 focus
  const rank28 = arb.getActionTier(28);
  assert.equal(rank28.actionsCount, 6);
  assert.equal(rank28.focusBonus, 7);
  assert.deepEqual(rank28.actionPenalties, [0, -5, -10, -15, -20, -25]);

  // Subsequent Action Penalties (calculateMAP):
  // 1st action: 0, 2nd: -5, 3rd: -10, 4th: -15, 5th: -20, 6th: -25
  assert.equal(arb.calculateMAP(0, 0), 0);
  assert.equal(arb.calculateMAP(0, 1), -5);
  assert.equal(arb.calculateMAP(0, 2), -10);
  assert.equal(arb.calculateMAP(0, 3), -15);
  assert.equal(arb.calculateMAP(0, 4), -20);
  assert.equal(arb.calculateMAP(0, 5), -25);

  // Canonical Size Scale:
  // Attacker Medium (0) vs Colossal (+16) -> +16 bonus (easier to hit)
  assert.equal(arb.calculateSizeModifier(SizeCategory.Medium, SizeCategory.Colossal), 16);
  // Attacker Colossal (+16) vs Medium (0) -> -16 penalty
  assert.equal(arb.calculateSizeModifier(SizeCategory.Colossal, SizeCategory.Medium), -16);
  // Diminutive (-8) vs Medium (0) -> -8 penalty to hit Diminutive target
  assert.equal(arb.calculateSizeModifier(SizeCategory.Medium, SizeCategory.Diminutive), -8);

  // Opposed Roll: DEFENDER WINS ALL TIES!
  const tie = arb.resolveOpposedRoll(18, 18);
  assert.equal(tie.isHit, false);
  assert.equal(tie.winner, 'defender');

  const win = arb.resolveOpposedRoll(19, 18);
  assert.equal(win.isHit, true);
  assert.equal(win.winner, 'attacker');

  // Unopposed DC calculation: Base DC 15
  assert.equal(arb.calculateUnopposedDC(SizeCategory.Medium, 'short'), 15);
  assert.equal(arb.calculateUnopposedDC(SizeCategory.Large, 'short'), 13); // Large (+2) makes DC easier (15 - 2 = 13)
  assert.equal(arb.calculateUnopposedDC(SizeCategory.Small, 'short'), 17); // Small (-2) makes DC harder (15 - (-2) = 17)
  assert.equal(arb.calculateUnopposedDC(SizeCategory.Medium, 'medium'), 20); // Medium range DC 20

  // Canonical Aiming Bonus cap: Up to 1/2 effective attack skill (including specialization and invocation)
  // attackScore = 6, spec = 2 -> effective skill = 8. Max aim bonus is floor(8 / 2) = 4.
  const toHitPkg = arb.buildToHitPackage(6, SkillRank.Trained, 0, SizeCategory.Medium, SizeCategory.Medium, 1.0, RangeCategory.Short, { specializationBonus: 2 });
  assert.equal(toHitPkg.maxAimBonus, 4);
});

test('Stage 5.5: DamagePipeline Canonical 3.00 COMBAT.md Rules (CON Soak, Force 1/2 DR, Mortality State, Limbs)', () => {
  const pipeline = new DamagePipeline();

  const mockTarget = {
    id: 'op-target',
    name: 'Target Dummy',
    base_hp: 30,
    current_hp: 30,
    tech_level: 3,
    armor_dr: 10,
    size_modifier: 0,
    x: 0, y: 0, z: 0,
    active_conditions: [],
    is_selected: false
  };

  // 1. Layered Armor [20, 15] -> 20. Raw Damage 35, AP 5 -> effective DR 15.
  // Target CON Mod = 3 -> total mitigation = 15 + 3 = 18. Net Damage = 35 - 18 = 17.
  const strike1 = pipeline.resolveStrike({
    rawDamage: 35,
    armorPenetration: 5,
    damageType: 'kinetic',
    isCalledShot: false
  }, mockTarget, [20, 15], 3); // targetConMod = 3

  assert.equal(strike1.effectiveDR, 15);
  assert.equal(strike1.conModSoak, 3);
  assert.equal(strike1.netDamage, 17);
  // Net damage 17 >= 33.3% of 30 (10) -> causes internal trauma
  assert.ok(strike1.appliedStatuses.includes('status_trauma_internal'));

  // 2. Force Damage: Ignores 1/2 of Armor DR (highest DR 10 -> 5)
  const strikeForce = pipeline.resolveStrike({
    rawDamage: 20,
    armorPenetration: 0,
    damageType: 'force',
    isCalledShot: false
  }, mockTarget, [10], 2);
  assert.equal(strikeForce.effectiveDR, 5); // 10 / 2 = 5
  assert.equal(strikeForce.netDamage, 13); // 20 - (5 + 2) = 13

  // 3. Called Shot to Left Arm over 33.3% threshold (10 DMG on 30 HP)
  const strikeCalled = pipeline.resolveStrike({
    rawDamage: 25,
    armorPenetration: 0,
    damageType: 'plasma',
    isCalledShot: true,
    targetLocation: 'arm_left'
  }, mockTarget, [10], 0);

  // Net 15 >= 10 -> disables left arm, triggers Stamina check
  assert.ok(strikeCalled.appliedStatuses.includes('status_disabled_arm_left'));
  assert.equal(strikeCalled.requiresStaminaCheck, true);
  assert.equal(strikeCalled.staminaCheckDC, 25); // 10 + 15 damage = 25

  // 4. Defenseless target: ambush / immobile / coup de grâce gets floor(margin / 2) bonus raw damage
  const strikeDefenseless = pipeline.resolveStrike({
    rawDamage: 10,
    armorPenetration: 0,
    damageType: 'kinetic',
    isCalledShot: false,
    isTargetDefenseless: true,
    attackMargin: 8 // floor(8 / 2) = +4 bonus damage
  }, mockTarget, [0], 0);

  assert.equal(strikeDefenseless.defenselessBonusDamage, 4);
  assert.equal(strikeDefenseless.netDamage, 14); // 10 + 4 = 14

  // 5. Mortality State: 0 HP does NOT trigger instant death!
  // It triggers Unconscious, Incapacitated, Bleeding Out, with Stability Points = CON Score + 5
  const strikeDown = pipeline.resolveStrike({
    rawDamage: 40,
    armorPenetration: 0,
    damageType: 'kinetic',
    isCalledShot: false
  }, mockTarget, [0], 0, 12); // conScore = 12

  assert.equal(strikeDown.entersMortalityState, true);
  assert.equal(strikeDown.isDead, false); // Still in Mortality State, not dead!
  assert.ok(strikeDown.appliedStatuses.includes('status_unconscious'));
  assert.ok(strikeDown.appliedStatuses.includes('status_bleeding_out'));
  // Stability points max is 12 + 5 = 17. 40 damage on 30 HP leaves -10 excess, reducing stability to 7
  assert.equal(strikeDown.stabilityPointsRemaining, 7);
});

test('Stage 5.6: MechaSocketManager Cellular Rejection & EMP Immunity', () => {
  const socketMgr = new MechaSocketManager();

  const chassis = {
    id: 'chassis-mech-1',
    name: 'Vanguard Walker',
    maxNodes: 4,
    baseVitality: 100,
    installedAugments: [
      { id: 'neural-link', name: 'Neural Link', techLevel: TechLevel.TL3_Cybernetic, nodeCost: 2 },
      { id: 'servo-booster', name: 'Servo Booster', techLevel: TechLevel.TL3_Cybernetic, nodeCost: 2 },
      { id: 'bioware-dermal', name: 'Dermal Weave', techLevel: TechLevel.TL4_Bioware, nodeCost: 2 } // Total 6 nodes (2 over max 4)
    ]
  };

  // Cellular Rejection: 2 nodes over = 20% penalty of 100 = 20 vitality penalty
  const rejection = socketMgr.evaluateCellularRejection(chassis);
  assert.equal(rejection.isOverloaded, true);
  assert.equal(rejection.usedNodes, 6);
  assert.equal(rejection.vitalityPenalty, 20);

  // EMP Effect: DC 100 guarantees all non-immune gear fails
  const empDisabled = socketMgr.applyEMP(chassis, 100);
  // TL3 augmentations should be disabled, TL4 bioware is immune
  assert.ok(empDisabled.includes('neural-link'));
  assert.ok(empDisabled.includes('servo-booster'));
  assert.ok(!empDisabled.includes('bioware-dermal'), 'TL4 Bioware must be immune to EMP');
});
