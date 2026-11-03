import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  DIE_STEP_LADDER,
  MECHA_SIZES,
  VITALITY_HEALTH_STRUCTURE_RULES,
  DEATH_AND_DYING_RULES,
  REST_SYSTEM_RULES
} from '../../src/constants/combat.js';
import { SPECIES_COMPONENT_RULES } from '../../src/constants/species.js';
import { MECHA_GARAGING_RULES } from '../../src/constants/vehicles.js';
import { FACTION_WEALTH_MODS, FENCE_RATES } from '../../src/constants/equipment.js';
import { SKILL_STAGES } from '../../src/constants/worldbuilding.js';
import {
  ALL_CANONICAL_SKILLS,
  resolveCanonicalSkillAlias
} from '../../src/data/skillsData.js';
import {
  executeTangentRoll,
  resolveNetAdvantageDice
} from '../../src/services/diceService.js';
import { DiceASTParser } from '../../src/engine/math/DiceASTParser.ts';
import { CharacterBuilder } from '../../src/engine/rules/CharacterBuilder.ts';
import { EssenceTracker } from '../../src/engine/rules/EssenceTracker.ts';
import { DamagePipeline } from '../../src/engine/rules/DamagePipeline.ts';
import { CombatArbitrator, SizeCategory, RangeCategory } from '../../src/engine/rules/CombatArbitrator.ts';
import { MechaSocketManager } from '../../src/engine/rules/MechaSocketManager.ts';
import {
  calculateCreditValue,
  calculateCRFromCredits,
  calculateMaterialCost,
  calculateScrapMassRequired,
  calculateCraftingDays
} from '../../src/engines/tangentEconEngine.js';
import {
  calculateVitalityHealthPools,
  calculateSpeciesBP,
  computeEconomyBreakdown,
  getSkillStageFromRank,
  applyDamageToEntity,
  calculateStabilityPoints,
  revivifyEntity
} from '../../src/engines/tangentEntityEngines.js';
import { executeRestCycle } from '../../src/engines/tangentRestEngine.js';
import { scaleStructurePoints, stepDownDamageDie } from '../../src/engines/tangentScalingEngine.js';
import {
  calculateMechaGaragingUDU,
  validateMetaTechSocketInvocationCapacity
} from '../../src/engines/tangentUDUEngine.js';
import { calculateAutomataStatsFromPR } from '../../src/engines/tangentComplexEngines.js';
import { parseUWP, computePlanetaryStats } from '../../src/engines/tangentPlanetaryEngine.js';
import { DEFAULT_FEATURES, getEnrichedFeatureData } from '../../src/data/featuresData.js';

describe('Phase 2 Canonical Axioms & 99.Schema.BastionLinterAndValidator Regression Vectors', () => {
  it('1. 2d10 Dual Resolution, Crit (+10 to Roll: 20->30, 19->29), Fumble (Flat -10 Roll), & 1-for-1 Adv/Disadv Cancellation', () => {
    const netAdv = resolveNetAdvantageDice({ advantageStacks: 2, disadvantageStacks: 1 });
    assert.equal(netAdv, 1);

    const netCancel = resolveNetAdvantageDice({ advantageStacks: 2, disadvantageStacks: 2 });
    assert.equal(netCancel, 0);

    const rollCheck = executeTangentRoll(1, 4, 1, 1, true);
    assert.equal(rollCheck.dicePool.length, 3);
    assert.equal(rollCheck.keptDice.length, 2);

    const astParser = new DiceASTParser();
    const astCrit = astParser.evaluateTangentCheck({ modifier: 3, targetCR: 20, _testRolls: [10, 10] });
    assert.equal(astCrit.isCrit, true);
    assert.equal(astCrit.naturalTotal, 30); // 20 + 10 = 30
    assert.equal(astCrit.finalTotal, 33);   // 30 + 3 = 33

    const astCritExpanded = astParser.evaluateTangentCheck({ modifier: 3, critRangeSize: 3, targetCR: 20, _testRolls: [10, 8] });
    assert.equal(astCritExpanded.isCrit, true);
    assert.equal(astCritExpanded.naturalTotal, 28); // 18 + 10 = 28
    assert.equal(astCritExpanded.finalTotal, 31);   // 28 + 3 = 31

    const astFumble = astParser.evaluateTangentCheck({ modifier: 3, targetCR: 15, _testRolls: [1, 1] });
    assert.equal(astFumble.isFumble, true);
    assert.equal(astFumble.naturalTotal, -10); // Rolled value becomes flat -10
    assert.equal(astFumble.finalTotal, -7);    // -10 + 3 = -7

    const astFumbleExpanded = astParser.evaluateTangentCheck({ modifier: 3, fumbleRangeSize: 3, targetCR: 15, _testRolls: [2, 2] });
    assert.equal(astFumbleExpanded.isFumble, true);
    assert.equal(astFumbleExpanded.naturalTotal, -10); // Rolled 4 in fumble range becomes flat -10
    assert.equal(astFumbleExpanded.finalTotal, -7);    // -10 + 3 = -7
  });

  it('2. 150 CP Character Builder, +10 CP Personal Hindrance Cap (Stigmas Exempt), & Creation Skill Rank Cap 11 / Max 30', () => {
    const builder = new CharacterBuilder();
    assert.equal(builder.MAX_CP, 150);
    assert.equal(builder.PERSONAL_HINDRANCE_CAP, 10);
    assert.equal(builder.CREATION_SKILL_RANK_CAP, 11);
    assert.equal(builder.MAX_SKILL_RANK, 30);

    // Personal Hindrances (blind 5 + debt 3 + wanted_criminal 3 = 11) cap at +10 CP, while Social Stigmas (+2 CP) are exempt -> 162 max CP
    const validDraft = builder.validate({
      name: 'Canonical Operative',
      speciesId: 'human', // 13 CP species package
      attributes: { str: 4, agi: 4, sta: 4, int: 4, wis: 4, cha: 4 }, // 24 * 5 = 120 CP
      hindrances: ['blind', 'debt', 'wanted_criminal'], // 11 raw -> capped at +10 CP
      stigmas: ['stigma_xeno'],                         // +2 CP exempt
      features: [],
      backgroundSkills: { Athletics: 6, Stealth: 6, Firearms: 6 }, // 18 free SP <= 60
      skills: { Athletics: 11, Stealth: 11, Firearms: 11 },        // 15 purchased SP (all <= 11 cap)
      purchasedVitality: 35, // 7 CP (+35 pts at 1 CP = +5)
      purchasedHealth: 35    // 7 CP (+35 pts at 1 CP = +5) -> total 13 + 120 + 15 + 7 + 7 = 162 CP
    });
    assert.equal(validDraft.isValid, true, validDraft.errors.join('; '));
    assert.equal(validDraft.personalHindranceRefund, 10);
    assert.equal(validDraft.exemptStigmaRefund, 2);
    assert.equal(validDraft.totalCPCost, 162);

    // Creation Skill Rank 12 must fail at creation, but pass post-creation up to 30
    const overRankCreation = builder.validate({
      name: 'Over-Ranked Creation',
      speciesId: 'human',
      attributes: { str: 0, agi: 0, sta: 0, int: 0, wis: 0, cha: 0 },
      hindrances: [],
      features: [],
      skills: { Firearms: 12 }
    });
    assert.equal(overRankCreation.isValid, false);

    const postCreationMaster = builder.validate({
      name: 'Pinnacle Veteran',
      speciesId: 'human',
      attributes: { str: 0, agi: 0, sta: 0, int: 0, wis: 0, cha: 0 },
      hindrances: [],
      features: [],
      skills: { Firearms: 30 },
      isPostCreation: true
    });
    assert.equal(postCreationMaster.isValid, true);
  });

  it('3. 6-Stage Skill Hierarchy & Retired Skill Alias Resolution (93 Canonical Skills)', () => {
    assert.equal(SKILL_STAGES.length, 6);
    assert.ok(getSkillStageFromRank(5).name.includes('Novice'));
    assert.ok(getSkillStageFromRank(10).name.includes('Trained'));
    assert.ok(getSkillStageFromRank(15).name.includes('Expert'));
    assert.ok(getSkillStageFromRank(20).name.includes('Master'));
    assert.ok(getSkillStageFromRank(25).name.includes('Grand Master'));
    assert.ok(getSkillStageFromRank(30).name.includes('Pinnacle'));

    assert.equal(ALL_CANONICAL_SKILLS.length, 93);
    assert.equal(ALL_CANONICAL_SKILLS.some(s => s.id === 'physical-endurance'), false);
    assert.equal(ALL_CANONICAL_SKILLS.some(s => s.id === 'mental-arcane'), false);
    assert.equal(resolveCanonicalSkillAlias('Endurance')?.name, 'Athletics');
    assert.equal(resolveCanonicalSkillAlias('Arcane')?.name, 'Metaphysics');
    assert.equal(resolveCanonicalSkillAlias('Perception')?.name, 'Alertness');
  });

  it('4. 1 CP = +5 Vitality/Health/SP & Zero Stamina Pool Scaling (Saved Persona Preservation)', () => {
    assert.equal(VITALITY_HEALTH_STRUCTURE_RULES.pointsPerCp, 5);
    assert.equal(VITALITY_HEALTH_STRUCTURE_RULES.zeroStaminaScaling, true);
    assert.equal(VITALITY_HEALTH_STRUCTURE_RULES.toughnessFloor, 0);

    const pools = calculateVitalityHealthPools({ vitalityCP: 4, healthCP: 6, staminaScore: 1 });
    assert.equal(pools.vitality, 50); // 30 + 20 (uncapped by STA 1)
    assert.equal(pools.health, 60);   // 30 + 30
    assert.equal(pools.toughness, 1);

    const breakdown = computeEconomyBreakdown({
      'starting-cp': 150,
      vitality: 45, // +15 above 30 -> 3 CP
      health: 40    // +10 above 30 -> 2 CP
    });
    assert.equal(breakdown.purchasedStatsCost, 5);
  });

  it('5. Canonical Essence Formula & Overchannel Burn (2 Direct Health Damage / Point)', () => {
    const tracker = new EssenceTracker();
    const maxEssence = tracker.calculateMaxEssence(
      { str: 1, agi: 2, sta: 2, int: 4, wis: 3, cha: 1 }, // sum = 13
      5, // Attune Rank
      12 // Sum of Discipline Ranks
    );
    assert.equal(maxEssence, 30);

    const burn = tracker.processEssenceExpenditure(3, 7); // 4 points overchanneled
    assert.equal(burn.isOverchanneling, true);
    assert.equal(burn.pointsOverchanneled, 4);
    assert.equal(burn.healthDamage, 8);
    assert.equal(burn.vitalityDamage, 0);
    assert.equal(burn.bypassesArmorAndToughness, true);
    assert.equal(burn.fortitudeSaveCR, 14);
  });

  it('6. Armor Layering Cap, Sneak Attack DR Gate, 0 Minimum Toughness Floor & Vitality-First Routing', () => {
    const pipeline = new DamagePipeline();
    const targetToken = {
      id: 'op-1',
      name: 'Operator',
      current_hp: 30,
      base_hp: 30,
      current_vitality: 30,
      base_vitality: 30,
      armor_dr: 2
    };

    // Armor Layering Cap: [4 bio, 8 cyber, 6 wearable] -> highest single DR = 8 (NEVER 18)
    // Sneak Attack DR Gate: baseWeaponRawDamage (7) <= effectiveDR (8) -> sneakAttackBonusDamage (12) = 0 applied!
    // 0 Minimum Toughness Floor: 7 - 8 - 3 STA = 0 net damage!
    const blockedSneak = pipeline.resolveStrike(
      {
        rawDamage: 19,
        baseWeaponRawDamage: 7,
        sneakAttackBonusDamage: 12,
        armorPenetration: 0,
        damageType: 'kinetic',
        isCalledShot: false
      },
      targetToken,
      [4, 8, 6],
      3,
      3
    );
    assert.equal(blockedSneak.effectiveDR, 8);
    assert.equal(blockedSneak.sneakAttackBonusApplied, 0);
    assert.equal(blockedSneak.netDamage, 0);

    // Penetrating Sneak Attack: baseWeaponRawDamage (10) > effectiveDR (8) -> +12 precision applies -> 22 - 8 - 3 = 11 to Vitality first!
    const penetratingSneak = pipeline.resolveStrike(
      {
        rawDamage: 22,
        baseWeaponRawDamage: 10,
        sneakAttackBonusDamage: 12,
        armorPenetration: 0,
        damageType: 'kinetic',
        isCalledShot: false
      },
      targetToken,
      [4, 8, 6],
      3,
      3
    );
    assert.equal(penetratingSneak.sneakAttackBonusApplied, 12);
    assert.equal(penetratingSneak.netDamage, 11);
    assert.equal(penetratingSneak.vitalityDamage, 11);
    assert.equal(penetratingSneak.healthDamage, 0);

    // Bleed bypasses Armor DR, Stamina Toughness, AND Vitality directly to Health
    const bleedStrike = pipeline.resolveStrike(
      {
        rawDamage: 6,
        armorPenetration: 0,
        damageType: 'bleed',
        isCalledShot: false
      },
      targetToken,
      [10],
      4,
      4
    );
    assert.equal(bleedStrike.netDamage, 6);
    assert.equal(bleedStrike.vitalityDamage, 0);
    assert.equal(bleedStrike.healthDamage, 6);
  });

  it('7. Feature-Gated Precision Strike Chain (2x/3x/4x Base Weapon Dice; No Universal Consolidation, No AP, No Grazing)', () => {
    const arb = new CombatArbitrator();

    // Baseline combatant WITHOUT Precision Strike cannot consolidate strikes (even at Rank 28 Pinnacle)
    assert.equal(typeof arb.resolveConsolidationProtocol, 'undefined');
    assert.equal(typeof arb.resolveGrazingProtocol, 'undefined');
    const unfeated = arb.resolvePrecisionStrike(28, []);
    assert.equal(unfeated.canConsolidate, false);
    assert.equal(unfeated.baseDiceMultiplier, 1);
    assert.equal(unfeated.featureUsed, null);

    // Below Skill 6 prerequisite -> cannot activate Precision Strike
    const lowSkill = arb.resolvePrecisionStrike(5, ['Precision Strike']);
    assert.equal(lowSkill.canConsolidate, false);
    assert.equal(lowSkill.baseDiceMultiplier, 1);

    // Precision Strike (Combat Skill 6+) -> 2x Base Weapon Dice
    const ps1 = arb.resolvePrecisionStrike(6, ['combat-precision-strike']);
    assert.equal(ps1.canConsolidate, true);
    assert.equal(ps1.featureUsed, 'Precision Strike');
    assert.equal(ps1.baseDiceMultiplier, 2);

    // Improved Precision Strike (Precision Strike + Combat Skill 11+) -> 3x Base Weapon Dice
    const ps2 = arb.resolvePrecisionStrike(11, ['Precision Strike', 'Improved Precision Strike']);
    assert.equal(ps2.canConsolidate, true);
    assert.equal(ps2.featureUsed, 'Improved Precision Strike');
    assert.equal(ps2.baseDiceMultiplier, 3);

    // Greater Precision Strike (Precision Strike + Improved + Combat Skill 16+) -> 4x Base Weapon Dice
    const ps3 = arb.resolvePrecisionStrike(16, [
      { id: 'combat-precision-strike' },
      { id: 'combat-improved-precision-strike' },
      { id: 'combat-greater-precision-strike' }
    ]);
    assert.equal(ps3.canConsolidate, true);
    assert.equal(ps3.featureUsed, 'Greater Precision Strike');
    assert.equal(ps3.baseDiceMultiplier, 4);

    // Verify canonical featuresData catalog & legacy Vital Strike -> Precision Strike alias
    assert.ok(DEFAULT_FEATURES.some(f => f.id === 'combat-precision-strike' && f.name === 'Precision Strike'));
    assert.ok(DEFAULT_FEATURES.some(f => f.id === 'combat-improved-precision-strike' && f.name === 'Improved Precision Strike'));
    assert.ok(DEFAULT_FEATURES.some(f => f.id === 'combat-greater-precision-strike' && f.name === 'Greater Precision Strike'));
    assert.ok(!DEFAULT_FEATURES.some(f => f.id === 'combat-vital-strike'));
    const legacyResolved = getEnrichedFeatureData({ id: 'combat-vital-strike' });
    assert.equal(legacyResolved.name, 'Precision Strike');

    // Automatic fire doubles range penalties beyond Short Range (-5 Medium -> -10)
    const autoMedium = arb.buildToHitPackage(8, 10, 0, SizeCategory.Medium, SizeCategory.Medium, 1.0, RangeCategory.Medium, {
      fireMode: 'full_auto'
    });
    assert.equal(autoMedium.rangeMod, -10);
  });

  it('8. Unified Mortality (Stability = STA + 5, CR 15 Medicine, Revivification) & Rest Recovery', () => {
    assert.equal(calculateStabilityPoints(3), 8);
    assert.equal(DEATH_AND_DYING_RULES.THRESHOLD_OF_DEATH.deathsDoor.stabilization.medicineCR, 15);
    assert.equal(REST_SYSTEM_RULES.LIGHT_REST.baseVitalityRecovery, 10);
    assert.equal(REST_SYSTEM_RULES.FULL_REST.healthRestorationBase, 5);

    const downRes = applyDamageToEntity({
      currentVitality: 0,
      currentHealth: 10,
      staminaScore: 3,
      incomingDamage: 13 // 13 - 3 Stamina Base Toughness = 10 -> 0 Health -> Mortality State
    });
    assert.equal(downRes.inMortalityState, true);
    assert.equal(downRes.stabilityMax, 8);

    const revRes = revivifyEntity({
      characterData: { health: 0, vitality: 0, karma: 3, is_dead: true, experience_debt: 0 },
      revivedHealth: 1
    });
    assert.equal(revRes.updatedData.karma, 0);
    assert.equal(revRes.updatedData.experience_debt, 5);
    assert.ok(revRes.updatedData.conditions.includes('Exhausted'));

    const fullRest = executeRestCycle({
      character: {
        'char-species': 'Terran Human',
        'attr-stamina': 3,
        vitality: 40,
        current_vitality: 5,
        health: 30,
        current_health: 10,
        essence: 20,
        current_essence: 2
      },
      restType: 'full',
      hasMedicalCare: true // Doubles Health recovery: (5 + 3) * 2 = 16 -> 26 HP
    });
    assert.equal(fullRest.newVitality, 40);
    assert.equal(fullRest.healthRestored, 16);
    assert.equal(fullRest.newHealth, 26);
    assert.equal(fullRest.newEssence, 20);
  });

  it('9. EUFT Economatrix Linear Micro-Modifiers (CR 18 = 1,472 Cr, CR 32 = 71,680 Cr), Scrap Mass (5x) & Crew Crafting', () => {
    // Regression vectors from 99.Schema.BastionLinterAndValidator.md
    assert.equal(calculateCreditValue(15), 640);
    assert.equal(calculateCreditValue(18), 1472);  // 640 * 2.30 = 1472
    assert.equal(calculateCreditValue(32), 71680); // 40960 * 1.75 = 71680
    assert.equal(calculateCreditValue(15, { hasFlaw: true }), 480); // 640 * 0.75 = 480
    assert.equal(calculateCRFromCredits(1472), 18);
    assert.equal(calculateCRFromCredits(71680), 32);

    assert.equal(calculateMaterialCost(2000), 1000); // 50% Pristine Material
    assert.equal(FENCE_RATES.unrefinedScrapMassMultiplier, 5);
    assert.equal(calculateScrapMassRequired(1000), 5000); // 5x Scrap Mass

    assert.equal(FACTION_WEALTH_MODS['Radiant Impyrium'], 5);
    assert.equal(FACTION_WEALTH_MODS['Kovian Tribunal'], 3);

    const soloDays = calculateCraftingDays(1000, 15, 1, 1);
    const crewDays = calculateCraftingDays(1000, 15, 1, 4);
    assert.equal(soloDays, 200);
    assert.equal(crewDays, 50);
  });

  it('10. 14-Size Scaling, 8-Step d12 Ladder, UDU 10:1 Garaging & Meta-Tech Socket Caps, Automata PR, & Planetary ML 0-5 Clamp', () => {
    assert.deepEqual(DIE_STEP_LADDER, ['d12', 'd10', 'd8', 'd6', 'd4', 'd3', 'd2', '1']);
    assert.equal(stepDownDamageDie('2d12', 1), '2d10');
    assert.equal(MECHA_SIZES.SuperGargantuan.strCbtMod, 128);
    assert.equal(MECHA_SIZES.MegaColossal.strCbtMod, 256);

    // Pre-calculated Mecha SP guard (never double-multiplies Colossal 3200 SP by x20!)
    assert.equal(scaleStructurePoints(3200, 'Colossal', { isPreCalculatedVehicleSP: true }), 3200);
    assert.equal(scaleStructurePoints(60, 'Large'), 120);

    // Mecha Garaging UDU (0.1, 0.2, 0.5, 1.0, 2.0 Modules)
    assert.equal(MECHA_GARAGING_RULES.Medium.modulesPerUnit, 0.1);
    assert.equal(MECHA_GARAGING_RULES.Colossal.modulesPerUnit, 2.0);
    const garaging = calculateMechaGaragingUDU('Huge', 2);
    assert.equal(garaging.modulesRequired, 1.0);

    const socketMgr = new MechaSocketManager();
    assert.equal(socketMgr.validateMetaTechSocketRank(1, 10).isValid, true);
    assert.equal(socketMgr.validateMetaTechSocketRank(1, 11).isValid, false);
    assert.equal(validateMetaTechSocketInvocationCapacity({ socketsAllocated: 2, invocationRank: 20 }).valid, true);
    assert.equal(validateMetaTechSocketInvocationCapacity({ socketsAllocated: 3, invocationRank: 30 }).valid, true);

    // Automata PR 1-5: Skill Ranks = (PR + 1) * 5, Max Skill Cap = max(5, PR * 3)
    const pr1 = calculateAutomataStatsFromPR(1);
    assert.equal(pr1.skillRanks, 10);
    assert.equal(pr1.maxSkillCap, 5);
    const pr4 = calculateAutomataStatsFromPR(4);
    assert.equal(pr4.skillRanks, 25);
    assert.equal(pr4.maxSkillCap, 12);

    // Planetary ML strictly clamped to 0..5 (never ML 6)
    const uwp = parseUWP('A:8:6:7:9:7:4:5:6');
    assert.equal(uwp.metaLevel, 5);
    const planetStats = computePlanetaryStats({ meta_level: 9, dominant_faction: 'Radiant Impyrium' });
    assert.equal(planetStats.uwp_breakdown.metaLevel, 5);
  });

  it('11. Universal Straight Build Costs: +1 Attribute = 5 CP (-1 = -5 CP) & 5 Skill Ranks = 5 CP (1 CP/Rank, Zero Package Discount)', () => {
    assert.equal(SPECIES_COMPONENT_RULES.attributeCostPerPoint, 5);
    assert.equal(SPECIES_COMPONENT_RULES.attributeRefundPerPenalty, 5);
    assert.equal(SPECIES_COMPONENT_RULES.skillCostPerPoint, 1);
    assert.equal(SPECIES_COMPONENT_RULES.skillBundleSize, 5);
    assert.equal(SPECIES_COMPONENT_RULES.skillBundleCost, 5);

    const specEval = calculateSpeciesBP({
      type: ['species_type-humanoid'],
      size: ['species_size-medium'],
      inherent_attribute_modifiers: [
        { attribute: 'Intellect', bonus: 2 },
        { attribute: 'Charisma', bonus: -1 }
      ],
      bonus_skills: 15
    });
    assert.equal(specEval.breakdown.attributeBP, 5); // +2 (10 CP) - 1 (-5 CP) = +5 CP
    assert.equal(specEval.breakdown.skillsBP, 15);   // 15 Skill Ranks = 15 CP (no 20% package discount)
    assert.equal(specEval.totalCPUsed, 20);

    const errataDoc = fs.readFileSync(
      path.resolve(process.cwd(), 'docs/game_rules/00.02 BASTION CORE FORMULAS & ERRATA ENGINE.md'),
      'utf8'
    );
    assert.ok(errataDoc.includes('Universal Attribute & Skill Pricing'));
    assert.ok(errataDoc.includes('`+1 Attribute = 5 CP`'));
    assert.ok(errataDoc.includes('`5 Skill Ranks = 5 CP`'));
  });
});
