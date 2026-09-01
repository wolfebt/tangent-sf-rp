/**
 * @file stage5.test.mjs
 * @description Stage 5 Automated Verification Suite
 * Verifies 150 BP Persona DAG, Combat Arbitrator MAP/Size curves, Damage Pipeline DR/Wounds, and Mecha Sockets.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CharacterBuilder } from '../../src/engine/rules/CharacterBuilder.ts';
import { CombatArbitrator, SkillRank, SizeCategory } from '../../src/engine/rules/CombatArbitrator.ts';
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

test('Stage 5.4: CombatArbitrator Multiple Attack Penalties (MAP) & Size Modifiers', () => {
  const arb = new CombatArbitrator();

  // Untrained: 0, -10, -20
  assert.equal(arb.calculateMAP(SkillRank.Untrained, 0), 0);
  assert.equal(arb.calculateMAP(SkillRank.Untrained, 1), -10);
  assert.equal(arb.calculateMAP(SkillRank.Untrained, 2), -20);

  // Pinnacle: 0, -2, -4
  assert.equal(arb.calculateMAP(SkillRank.Pinnacle, 1), -2);
  assert.equal(arb.calculateMAP(SkillRank.Pinnacle, 2), -4);

  // Size Modifiers: Attacker Medium (0) vs MegaColossal (16) -> +16 bonus
  assert.equal(arb.calculateSizeModifier(SizeCategory.Medium, SizeCategory.MegaColossal), 16);

  // Size Modifiers: Attacker Colossal (8) vs Medium (0) -> -8 penalty
  assert.equal(arb.calculateSizeModifier(SizeCategory.Colossal, SizeCategory.Medium), -8);

  // To-Hit Package
  const pkg = arb.buildToHitPackage(15, SkillRank.Expert, 1, SizeCategory.Medium, SizeCategory.Large, 0.7);
  // Base 15 + MAP (-3) + Size (+1) + Half Cover (-2) = 11
  assert.equal(pkg.finalTarget, 11);
});

test('Stage 5.5: DamagePipeline Armor DR Max Rule, AP, and Major Wound Thresholds', () => {
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

  // 1. Layered Armor: [20, 15] -> effective highest is 20
  // Attack rawDamage 35, AP 5 -> effective DR 15 -> Net Damage = 20
  const strike1 = pipeline.resolveStrike({
    rawDamage: 35,
    armorPenetration: 5,
    damageType: 'kinetic',
    isCalledShot: false
  }, mockTarget, [20, 15]);

  assert.equal(strike1.effectiveDR, 15);
  assert.equal(strike1.netDamage, 20);
  // Net damage 20 >= 33.3% of 30 (10) -> causes internal trauma
  assert.ok(strike1.appliedStatuses.includes('status_trauma_internal'));

  // 2. Called Shot to Left Arm over 33% threshold
  const strikeCalled = pipeline.resolveStrike({
    rawDamage: 25,
    armorPenetration: 0,
    damageType: 'plasma',
    isCalledShot: true,
    targetLocation: 'arm_left'
  }, mockTarget, [10]);

  // Net 15 >= 10 -> disables left arm
  assert.ok(strikeCalled.appliedStatuses.includes('status_disabled_arm_left'));

  // 3. Lethal Strike
  const strikeLethal = pipeline.resolveStrike({
    rawDamage: 100,
    armorPenetration: 50,
    damageType: 'heavy_particle',
    isCalledShot: false
  }, mockTarget, [10]);

  assert.equal(strikeLethal.isDead, true);
  assert.ok(strikeLethal.appliedStatuses.includes('status_dead'));
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
