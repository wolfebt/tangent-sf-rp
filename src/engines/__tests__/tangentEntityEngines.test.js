import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  calculateSpeciesBP,
  calculateFullSpeciesCost,
  getSpeciesComponentDataset,
  validateSpeciesBuild,
  calculateSpeciesCombatModifiers,
  computeSpeciesStats,
  calculateThreatTierStats,
  calculateNPCCombatBlock,
  computeModularCharacterStats,
  calculateCompanionBP,
  calculateCompanionStats,
  computeCompanionStats,
  calculateInvocationDC,
  getSkillStageFromRank,
  getSkillStageFromDC,
  calculateEssenceCost,
  calculateInvocationScaling,
  computeInvocationStats,
  calculateMetaTechDC,
  calculateMetaTechCapacity,
  computeMetaTechStats
} from '../tangentEntityEngines.js';

describe('Tangent SF RP — Phase 4 Entity Calculation Engines', () => {

  // ═══════════════════════════════════════════════════════════
  // 1. SPECIES FORGE ENGINE & BUILD RULES
  // ═══════════════════════════════════════════════════════════
  describe('Species Forge Engine', () => {
    it('calculates standard default humanoid BP cost correctly (0 BP used, 20 max)', () => {
      const result = calculateSpeciesBP();
      assert.strictEqual(result.totalBPUsed, 0);
      assert.strictEqual(result.bpRemaining, 20);
      assert.strictEqual(result.isOverBudget, false);
      assert.strictEqual(result.budgetLevel, 'Standard');
    });

    it('accurately tallies species type, size, attributes, skills, traits, and disadvantages', () => {
      const result = calculateSpeciesBP({
        type: 'Aberration', // +1 BP
        size: 'Large', // +2 BP
        movementModes: ['flight_basic'], // +2 BP
        attributes: { str: 2, agi: 1, sta: 0, int: -1, wis: 0, cha: 0 }, // (+2 + 1 - 1) * 5 = +10 BP
        skillBundles: 1, // +5 BP
        traits: ['adapted', 'camouflage'], // 1 BP + 1 BP = +2 BP
        disadvantages: ['light_sensitivity'], // -2 BP refund
        budgetLevel: 'Advanced' // max 40 BP
      });

      // Total = 1 + 2 + 2 + 10 + 5 + 2 - 2 = 20 BP
      assert.strictEqual(result.totalBPUsed, 20);
      assert.strictEqual(result.bpRemaining, 20);
      assert.strictEqual(result.isOverBudget, false);
      assert.strictEqual(result.breakdown.typeBP, 1);
      assert.strictEqual(result.breakdown.sizeBP, 2);
      assert.strictEqual(result.breakdown.movementBP, 2);
      assert.strictEqual(result.breakdown.attributeBP, 10);
      assert.strictEqual(result.breakdown.skillsBP, 5);
      assert.strictEqual(result.breakdown.traitsBP, 2);
      assert.strictEqual(result.breakdown.disadvantagesRefund, 2);
    });

    it('accurately prices all 42 basic species traits at exactly 1 BP each', () => {
      const basicTraitsList = [
        'Adapted',
        'Alter Form (Basic)',
        'Amphibious',
        'Bonded Terrain',
        'Bonus Feature',
        'Camouflage',
        "Cat's Luck",
        'Cave Dweller',
        'Craftsman',
        'Digitigrade / Ungulated',
        'Draconic',
        'Emissary',
        'Exoskeleton (Partial)',
        'Focused Study',
        'Frenzy',
        'Greedy Eye',
        'Hardy',
        'Healthy',
        'Integrated',
        'Low Light Vision',
        'Lucky, Lesser',
        'Natural Armor',
        'Patagia',
        'Reach',
        'Reduced Sustenance',
        'Relentless',
        'Runner',
        'Scent',
        'Shadow Affinity',
        'Shadow Blending',
        'Shards of the Past',
        'Silent Hunter',
        'Silver Tongued',
        'Skill Bonus',
        'Sneaky',
        'Sociable',
        'Stable Footed',
        'Stalker',
        'Static Bonus Feat',
        'Tail',
        'Urbanite',
        'Water-Sense'
      ];

      assert.strictEqual(basicTraitsList.length, 42);

      basicTraitsList.forEach(traitName => {
        const result = calculateSpeciesBP({
          type: 'Humanoid', // 0 BP
          size: 'Medium', // 0 BP
          traits: [traitName]
        });
        assert.strictEqual(result.totalBPUsed, 1, `Trait "${traitName}" should cost exactly 1 BP`);
        assert.strictEqual(result.breakdown.traitsBP, 1);
      });
    });

    it('accurately prices all 58 advanced species traits at exactly 2 BP each', () => {
      const advancedTraitsList = [
        'Adaptive Features',
        'Adaptive Skill Set',
        'Additional Limbs',
        'Ageless',
        'All-Around Vision',
        'Alter Form (Adv)',
        'Alternate Form',
        'Aquatic',
        'Aquatic Strength',
        'Autotroph',
        'Blind Sense',
        'Bodyform Appendages',
        'Bodyform Armor',
        'Bodyform Armor Opts',
        'Bodyform Adaptation',
        'Bodyform Mutation',
        'Bodyform Sizing',
        'Bodyform Structure',
        'Bodyform Weapons',
        'Bodyform Weapon Opts',
        'Brutal',
        'Chameleon',
        'Chloroplast',
        'Constriction',
        'Curiosity',
        'Dark Sight',
        'Defensive Training',
        'Dragon Eyes',
        'Dragon Form',
        'Dragon Might',
        'Dragon Mind',
        'Dragon Senses',
        'Energy Resist',
        'Exoskeleton (Light)',
        'Fast Heal',
        'Fey Affinity',
        'Fiend Affinity',
        'Gifted Linguist',
        'Hive Connection',
        'Longevity',
        'Lucky, Greater',
        'Master Tinker',
        'Mind Speech',
        'Natural Weapons',
        'Powerful Charge',
        'Prehensile Tail',
        'Prehensile Limbs',
        'Quadruped',
        'Quick Reactions',
        'Resistant',
        'Rock Throwing',
        'Sleepless',
        'Swarming',
        'Synthetic Armor Opts',
        'Synthetic Weapon Opts',
        'Thermal Sight',
        'Treespeech',
        'Venom'
      ];

      assert.strictEqual(advancedTraitsList.length, 58);

      advancedTraitsList.forEach(traitName => {
        const result = calculateSpeciesBP({
          type: 'Humanoid', // 0 BP
          size: 'Medium', // 0 BP
          traits: [traitName]
        });
        assert.strictEqual(result.totalBPUsed, 2, `Advanced Trait "${traitName}" should cost exactly 2 BP`);
        assert.strictEqual(result.breakdown.traitsBP, 2);
        assert.strictEqual(result.itemized.traits[0].tier, 'Advanced');
      });
    });

    it('accurately prices all 24 elite species traits at exactly 4 BP each', () => {
      const eliteTraitsList = [
        'Alter Form (Elite)',
        'Blind Sight',
        'Bodyform Heavy Armor',
        'Dragon Apotheosis',
        'Dragon Breath',
        'Dragon Wings',
        'Energized Breath',
        'Energy Absorption',
        'Energy Immunity',
        'Ether Sight',
        'Exoskeleton (Heavy)',
        'Flight',
        'Hexapedal',
        'Immortal',
        'Nimble Appendages',
        'Non-Living',
        'Regeneration',
        'Self Revivifying',
        'Semi-Corporeal',
        'Synthetic Aux Core',
        'Synthetic Exotic Opt',
        'Synthetic Tech Assim',
        'Vampiric Power',
        'Wyrm Senses'
      ];

      assert.strictEqual(eliteTraitsList.length, 24);

      eliteTraitsList.forEach(traitName => {
        const result = calculateSpeciesBP({
          type: 'Humanoid', // 0 BP
          size: 'Medium', // 0 BP
          traits: [traitName]
        });
        assert.strictEqual(result.totalBPUsed, 4, `Elite Trait "${traitName}" should cost exactly 4 BP`);
        assert.strictEqual(result.breakdown.traitsBP, 4);
        assert.strictEqual(result.itemized.traits[0].tier, 'Elite');
      });
    });

    it('accurately prices all 13 canonical species type chassis', () => {
      const typeExpectedCosts = {
        Humanoid: 0,
        Aberration: 1,
        Beast: 1,
        Fey: 3,
        Planar: 4,
        Dragon: 5,
        Mythical: 5,
        Ooze: 6,
        Verdant: 9,
        Elemental: 13,
        Synthetic: 15,
        Undead: 20,
        Entity: 24
      };

      Object.entries(typeExpectedCosts).forEach(([typeName, expectedBP]) => {
        const result = calculateSpeciesBP({
          type: typeName,
          size: 'Medium',
          traits: []
        });
        assert.strictEqual(result.breakdown.typeBP, expectedBP, `Type "${typeName}" should cost ${expectedBP} BP`);
      });
    });

    it('accurately prices size categories and combat scaling', () => {
      const sizeExpectedCosts = {
        Medium: 0,
        Small: 2,
        Large: 2,
        Tiny: 4,
        Huge: 4,
        Diminutive: 6
      };

      Object.entries(sizeExpectedCosts).forEach(([sizeName, expectedBP]) => {
        const result = calculateSpeciesBP({
          type: 'Humanoid',
          size: sizeName
        });
        assert.strictEqual(result.breakdown.sizeBP, expectedBP, `Size "${sizeName}" should cost ${expectedBP} BP`);
      });
    });

    it('accurately prices all 19 movement modes, speeds, and modifications', () => {
      const movementList = [
        { name: 'Normal Speed', expectedBP: 0 },
        { name: 'Very Fast', expectedBP: 4 },
        { name: 'Fast', expectedBP: 2 },
        { name: 'Slow', expectedBP: -2 },
        { name: 'Ponderous', expectedBP: -4 },
        { name: 'Climber', expectedBP: 2 },
        { name: 'Gliding Wings', expectedBP: 1 },
        { name: 'Leaper', expectedBP: 1 },
        { name: 'Mountaineer', expectedBP: 1 },
        { name: 'Sprinter', expectedBP: 1 },
        { name: 'Swim', expectedBP: 2 },
        { name: 'Terrain Movement', expectedBP: 1 },
        { name: 'Burrow', expectedBP: 2 },
        { name: 'Basic Flight', expectedBP: 2 },
        { name: 'Improved Flight Speed', expectedBP: 1 },
        { name: 'Improved Maneuverability', expectedBP: 1 },
        { name: 'Strong Flyer', expectedBP: 2 },
        { name: 'Hauler', expectedBP: 1 },
        { name: 'Marcher', expectedBP: 1 }
      ];

      assert.strictEqual(movementList.length, 19);

      movementList.forEach(({ name, expectedBP }) => {
        const result = calculateSpeciesBP({
          type: 'Humanoid', // 0 BP
          size: 'Medium', // 0 BP
          movementModes: [name]
        });
        assert.strictEqual(result.breakdown.movementBP, expectedBP, `Movement item "${name}" should cost ${expectedBP} BP`);
      });
    });

    it('accurately prices all species attribute modifiers (+5 BP each, -5 BP penalty) and skill points (5 BP per +5 bundle / 1 BP per point)', () => {
      // Test individual +1 attributes at 5 BP each
      const attributes = [
        { name: 'Strength', input: { str: 1 } },
        { name: 'Agility', input: { agi: 1 } },
        { name: 'Constitution / Stamina', input: { sta: 1 } },
        { name: 'Intellect', input: { int: 1 } },
        { name: 'Wisdom', input: { wis: 1 } },
        { name: 'Charisma', input: { cha: 1 } }
      ];

      attributes.forEach(({ name, input }) => {
        const result = calculateSpeciesBP({
          type: 'Humanoid', // 0 BP
          size: 'Medium', // 0 BP
          attributes: input
        });
        assert.strictEqual(result.totalBPUsed, 5, `Improved ${name} (+1) should cost exactly 5 BP`);
        assert.strictEqual(result.breakdown.attributeBP, 5);
      });

      // Test alias inputs (con, dex)
      const conResult = calculateSpeciesBP({ attributes: { con: 1 } });
      assert.strictEqual(conResult.breakdown.attributeBP, 5);

      const dexResult = calculateSpeciesBP({ attributes: { dex: 1 } });
      assert.strictEqual(dexResult.breakdown.attributeBP, 5);

      // Test Reduced Ability (-1 penalty = -5 BP refund)
      const penaltyResult = calculateSpeciesBP({
        type: 'Humanoid',
        size: 'Medium',
        attributes: { str: 2, int: -1 } // (2 * 5) + (-1 * 5) = 5 BP
      });
      assert.strictEqual(penaltyResult.totalBPUsed, 5);
      assert.strictEqual(penaltyResult.breakdown.attributeBP, 5);

      // Test Skill Points (+5 bundle = 5 BP)
      const skillBundleResult = calculateSpeciesBP({
        skillBundles: 1
      });
      assert.strictEqual(skillBundleResult.totalBPUsed, 5);
      assert.strictEqual(skillBundleResult.breakdown.skillsBP, 5);

      const skillPointsResult = calculateSpeciesBP({
        skill_points: 10
      });
      assert.strictEqual(skillPointsResult.totalBPUsed, 10);
      assert.strictEqual(skillPointsResult.breakdown.skillsBP, 10);
    });

    it('calculates full species cost and breakdown from catalog documents via calculateFullSpeciesCost', () => {
      const celestineCost = calculateFullSpeciesCost('Celestine (Alterian)');
      assert.strictEqual(celestineCost.totalCost, 26);
      assert.ok(celestineCost.itemizedList.length > 0);
      assert.ok(celestineCost.summaryText.length > 0);

      const baseHumanCost = calculateFullSpeciesCost('Human (Base)');
      assert.strictEqual(baseHumanCost.totalCost, 10);

      const defaultHumanoid = calculateFullSpeciesCost({ type: 'Humanoid', size: 'Medium' });
      assert.strictEqual(defaultHumanoid.totalCost, 0);

      const customSpecies = {
        name: 'Zephyr Raptor',
        species_type: 'Beast', // 1 BP
        size: 'Large', // 2 BP
        movement_modes: ['normal', 'flight_basic'], // 0 + 2 = 2 BP
        attributes: { str: 2, agi: 2 }, // (2 + 2) * 5 = 20 BP
        traits: ['Scent', 'Runner'], // 1 + 1 = 2 BP
        disadvantages: ['light_sensitivity'] // -2 BP
      };
      // Total = 1 + 2 + 2 + 20 + 2 - 2 = 25 BP
      const customCost = calculateFullSpeciesCost(customSpecies);
      assert.strictEqual(customCost.totalCost, 25);
      assert.strictEqual(customCost.breakdown.typeBP, 1);
      assert.strictEqual(customCost.breakdown.sizeBP, 2);
      assert.strictEqual(customCost.breakdown.movementBP, 2);
      assert.strictEqual(customCost.breakdown.attributeBP, 20);
      assert.strictEqual(customCost.breakdown.traitsBP, 2);
      assert.strictEqual(customCost.breakdown.disadvantagesRefund, 2);
    });

    it('validates species construction compliance with validateSpeciesBuild', () => {
      const validBuild = validateSpeciesBuild({
        type: 'Humanoid',
        size: 'Medium',
        traits: ['Hardy', 'Healthy'],
        budgetLevel: 'Standard'
      });
      assert.strictEqual(validBuild.isValid, true);
      assert.strictEqual(validBuild.issues.length, 0);

      const overBudgetBuild = validateSpeciesBuild({
        type: 'Entity', // 24 BP
        size: 'Huge', // 4 BP
        attributes: { str: 4, agi: 4 }, // 40 BP
        budgetLevel: 'Standard' // max 20 BP
      });
      assert.strictEqual(overBudgetBuild.isValid, false);
      assert.ok(overBudgetBuild.issues.length > 0);
    });

    it('returns complete component dataset via getSpeciesComponentDataset', () => {
      const dataset = getSpeciesComponentDataset();
      assert.ok(dataset.types);
      assert.ok(dataset.sizes);
      assert.ok(dataset.movementModes);
      assert.strictEqual(dataset.basicTraits.length, 42);
      assert.ok(dataset.advancedTraits.length > 0);
      assert.ok(dataset.eliteTraits.length > 0);
      assert.ok(dataset.disadvantages.length > 0);
      assert.ok(dataset.rules);
    });

    it('flags over-budget species configurations', () => {
      const result = calculateSpeciesBP({
        type: 'Dragon', // +5 BP
        size: 'Huge', // +4 BP
        attributes: { str: 3, agi: 2 }, // (3 + 2) * 5 = +25 BP
        budgetLevel: 'Standard' // max 20 BP
      });
      // Total = 5 + 4 + 25 = 34 BP > 20
      assert.strictEqual(result.totalBPUsed, 34);
      assert.strictEqual(result.isOverBudget, true);
      assert.strictEqual(result.bpRemaining, -14);
    });

    it('resolves size combat, attribute, stealth, stability, damage, and mobility modifiers correctly across all 6 sizes', () => {
      const diminutive = calculateSpeciesCombatModifiers('Diminutive');
      assert.strictEqual(diminutive.strMod, -8);
      assert.strictEqual(diminutive.agiMod, 8);
      assert.strictEqual(diminutive.combatMod, 8);
      assert.strictEqual(diminutive.defMod, 8);
      assert.strictEqual(diminutive.stealthMod, 12);
      assert.strictEqual(diminutive.stabilityMod, -16);
      assert.strictEqual(diminutive.dmgDieStep, -3);
      assert.strictEqual(diminutive.speedMod, -10);

      const tiny = calculateSpeciesCombatModifiers('Tiny');
      assert.strictEqual(tiny.strMod, -4);
      assert.strictEqual(tiny.agiMod, 4);
      assert.strictEqual(tiny.combatMod, 4);
      assert.strictEqual(tiny.defMod, 4);
      assert.strictEqual(tiny.stealthMod, 8);
      assert.strictEqual(tiny.stabilityMod, -8);
      assert.strictEqual(tiny.dmgDieStep, -2);
      assert.strictEqual(tiny.speedMod, -10);

      const small = calculateSpeciesCombatModifiers('Small');
      assert.strictEqual(small.strMod, -2);
      assert.strictEqual(small.agiMod, 2);
      assert.strictEqual(small.combatMod, 2);
      assert.strictEqual(small.defMod, 2);
      assert.strictEqual(small.stealthMod, 4);
      assert.strictEqual(small.stabilityMod, -4);
      assert.strictEqual(small.dmgDieStep, -1);
      assert.strictEqual(small.speedMod, -5);

      const medium = calculateSpeciesCombatModifiers('Medium');
      assert.strictEqual(medium.strMod, 0);
      assert.strictEqual(medium.agiMod, 0);
      assert.strictEqual(medium.combatMod, 0);
      assert.strictEqual(medium.defMod, 0);
      assert.strictEqual(medium.stealthMod, 0);
      assert.strictEqual(medium.stabilityMod, 0);
      assert.strictEqual(medium.dmgDieStep, 0);
      assert.strictEqual(medium.speedMod, 0);

      const large = calculateSpeciesCombatModifiers('Large');
      assert.strictEqual(large.strMod, 2);
      assert.strictEqual(large.agiMod, -2);
      assert.strictEqual(large.combatMod, -2);
      assert.strictEqual(large.defMod, -2);
      assert.strictEqual(large.stealthMod, -4);
      assert.strictEqual(large.stabilityMod, 4);
      assert.strictEqual(large.dmgDiceMult, 2);
      assert.strictEqual(large.speedMult, 2);

      const huge = calculateSpeciesCombatModifiers('Huge');
      assert.strictEqual(huge.strMod, 4);
      assert.strictEqual(huge.agiMod, -4);
      assert.strictEqual(huge.combatMod, -4);
      assert.strictEqual(huge.defMod, -4);
      assert.strictEqual(huge.stealthMod, -8);
      assert.strictEqual(huge.stabilityMod, 8);
      assert.strictEqual(huge.dmgDiceMult, 5);
      assert.strictEqual(huge.speedMult, 5);
    });

    it('generates full persistent metadata in computeSpeciesStats', () => {
      const computed = computeSpeciesStats({
        name: 'Vesperian Stalker',
        species_type: 'Monstrosity',
        size: 'Large',
        traits: ['natural_armor_2'],
        budget_level: 'Advanced'
      });
      assert.ok(computed.total_bp_used > 0);
      assert.ok(computed.genetic_dc >= 10);
      assert.ok(computed.complexity_tier);
      assert.ok(computed.combat_modifiers);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 2. MODULAR CHARACTER GENERATOR ENGINE (PLAN 24)
  // ═══════════════════════════════════════════════════════════
  describe('Modular Character Generator Engine', () => {
    it('calculates threat tier baseline stats correctly across tiers', () => {
      const tier0 = calculateThreatTierStats(0, 'Tank', 'Standard', 'Medium');
      assert.strictEqual(tier0.narrativeRank, 'Civilian / Minion');
      assert.strictEqual(tier0.vitality, 30);
      assert.strictEqual(tier0.health, 30);
      assert.strictEqual(tier0.actionsPerRound, 1);
      assert.strictEqual(tier0.expectedDR, 0);

      const tier5 = calculateThreatTierStats(5, 'Tank', 'Standard', 'Medium');
      assert.strictEqual(tier5.narrativeRank, 'Professional');
      assert.strictEqual(tier5.vitality, 55); // 30 + 25
      assert.strictEqual(tier5.health, 55);
      assert.strictEqual(tier5.expectedDR, 12);
    });

    it('applies boss multiplier and 1-HP minion rules', () => {
      const minion = calculateThreatTierStats(3, 'Brute', 'Minion', 'Medium');
      assert.strictEqual(minion.isMinion, true);
      assert.strictEqual(minion.vitality, 0);
      assert.strictEqual(minion.health, 1); // 1-HP Rule

      const boss = calculateThreatTierStats(3, 'Brute', 'Boss', 'Medium');
      assert.strictEqual(boss.isBoss, true);
      // Tier 3 vit bonus is 15 -> basePool = 45 -> Boss 2x = 90
      assert.strictEqual(boss.vitality, 90);
      assert.strictEqual(boss.health, 90);
    });

    it('converts vitality and health into Structure Points (SP) for synthetics', () => {
      const synth = calculateThreatTierStats(3, 'Tank', 'Standard', 'Medium', true);
      assert.strictEqual(synth.vitality, 0);
      assert.strictEqual(synth.health, 0);
      assert.strictEqual(synth.structurePoints, 90); // 45 vit + 45 health combined
    });

    it('computes complete combat block with attack bonus, defense DC, and saves', () => {
      const block = calculateNPCCombatBlock({
        tier: 5,
        role: 'Tank',
        bossType: 'Standard',
        size: 'Medium',
        designation: 'Adversary'
      });

      assert.strictEqual(block.tier, 5);
      assert.ok(block.defenseDC >= 10);
      assert.ok(block.attackBonus >= 5);
      assert.ok(block.initiative >= 0);
      assert.strictEqual(block.speed, 30);
      assert.strictEqual(block.saves.fortitude, 12); // 10 + 2 attrBonus
    });

    it('generates full persistent metadata in computeModularCharacterStats', () => {
      const computed = computeModularCharacterStats({
        threatTier: 4,
        competencyRole: 'Sniper',
        bossType: 'Boss',
        sizeCategory: 'Medium',
        designation: 'Adversary'
      });
      assert.strictEqual(computed.threat_tier, 4);
      assert.strictEqual(computed.competency_role, 'The Sniper (Long-Range Assassin)');
      assert.ok(computed.encounter_dc > 0);
      assert.ok(computed.complexity_tier);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 3. COMPANION FORGE ENGINE (PLAN 25)
  // ═══════════════════════════════════════════════════════════
  describe('Companion Forge Engine', () => {
    it('calculates 40 BP budget for rank 1 companion packages', () => {
      const bp = calculateCompanionBP({
        form: 'canine', // 10 BP
        functions: ['guardian_attack'], // 8 BP
        companionRank: 1 // max 40 BP
      });

      assert.strictEqual(bp.totalBPUsed, 18);
      assert.strictEqual(bp.bpRemaining, 22);
      assert.strictEqual(bp.maxBudget, 40);
      assert.strictEqual(bp.isOverBudget, false);
    });

    it('expands budget by +10 BP for each additional companion rank', () => {
      const bpRank3 = calculateCompanionBP({
        form: 'combat_gun_drone', // 10 BP
        functions: ['guardian_attack', 'scout_recon'], // 8 + 8 = 16 BP
        companionRank: 3 // 40 + 20 = 60 BP
      });

      assert.strictEqual(bpRank3.totalBPUsed, 26);
      assert.strictEqual(bpRank3.maxBudget, 60);
      assert.strictEqual(bpRank3.bpRemaining, 34);
    });

    it('scales companion stats with owner threat tier', () => {
      const compTier1 = calculateCompanionStats({
        ownerTier: 1,
        type: 'Biological',
        form: 'canine',
        size: 'Medium'
      });
      assert.strictEqual(compTier1.ownerTier, 1);
      assert.strictEqual(compTier1.actionsPerRound, 2);

      const compTier10 = calculateCompanionStats({
        ownerTier: 10,
        type: 'Biological',
        form: 'canine',
        size: 'Medium'
      });
      assert.strictEqual(compTier10.ownerTier, 10);
      assert.strictEqual(compTier10.actionsPerRound, 4);
      assert.ok(compTier10.vitality > compTier1.vitality);
      assert.ok(compTier10.attackBonus > compTier1.attackBonus);
    });

    it('generates full persistent metadata in computeCompanionStats', () => {
      const computed = computeCompanionStats({
        name: 'Ghost-V Recon Drone',
        companion_type: 'Synthetic',
        form_package: 'recon_drone',
        function_packages: ['scout_recon', 'hacking_electronic'],
        owner_tier: 3,
        companion_rank: 1
      });
      assert.strictEqual(computed.owner_tier, 3);
      assert.ok(computed.structure_points > 0);
      assert.ok(computed.craft_dc >= 15);
      assert.ok(computed.complexity_tier);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 4. INVOCATION FORGE ENGINE (PLAN 26)
  // ═══════════════════════════════════════════════════════════
  describe('Invocation Forge Engine', () => {
    it('calculates final cast DC from action time, range, aoe, duration and catalysts', () => {
      const dc = calculateInvocationDC({
        baseDC: 15,
        time: 'StandardAction', // +0
        range: 'Medium', // +2
        aoe: 'MediumBurst', // +5
        duration: 'Instant', // +0
        otherMods: ['subtle'] // +5
      });
      // 15 + 0 + 2 + 5 + 0 + 5 = 27 DC
      assert.strictEqual(dc, 27);
    });

    it('maps DC and rank to appropriate skill stages', () => {
      assert.strictEqual(getSkillStageFromRank(3).stage, 1); // Novice
      assert.strictEqual(getSkillStageFromRank(8).stage, 2); // Trained
      assert.strictEqual(getSkillStageFromRank(14).stage, 3); // Expert
      assert.strictEqual(getSkillStageFromRank(19).stage, 4); // Master
      assert.strictEqual(getSkillStageFromRank(25).stage, 5); // Pinnacle

      assert.strictEqual(getSkillStageFromDC(12).stage, 1);
      assert.strictEqual(getSkillStageFromDC(17).stage, 2);
      assert.strictEqual(getSkillStageFromDC(22).stage, 3);
      assert.strictEqual(getSkillStageFromDC(28).stage, 4);
      assert.strictEqual(getSkillStageFromDC(35).stage, 5);
    });

    it('calculates essence costs when pushing beyond caster stage', () => {
      const baseCost = calculateEssenceCost(2, 2, 1);
      assert.strictEqual(baseCost.totalEssencePerRound, 0);
      assert.strictEqual(baseCost.isPushed, false);

      const pushedCost = calculateEssenceCost(4, 2, 2);
      // Pushed 2 stages (+2) + 1 sustained (+1) = 3 Essence
      assert.strictEqual(pushedCost.pushCostPerRound, 2);
      assert.strictEqual(pushedCost.sustainedCostPerRound, 1);
      assert.strictEqual(pushedCost.totalEssencePerRound, 3);
      assert.strictEqual(pushedCost.isPushed, true);
    });

    it('scales invocation output formulas accurately across stages', () => {
      const dmgStage1 = calculateInvocationScaling('energyDamage', 1);
      assert.strictEqual(dmgStage1.scaledOutput, '1d6');

      const dmgStage3 = calculateInvocationScaling('energyDamage', 3);
      assert.strictEqual(dmgStage3.scaledOutput, '3d6');

      const dmgStage5 = calculateInvocationScaling('energyDamage', 5);
      assert.strictEqual(dmgStage5.scaledOutput, '5d6');
    });

    it('generates full persistent metadata in computeInvocationStats', () => {
      const computed = computeInvocationStats({
        name: 'Quantum Disruption Lance',
        baseDifficulty: 'Standard',
        base_dc: 15,
        time: 'StandardAction',
        range: 'Long', // +5
        area: 'LineRay', // +0
        duration: 'Instant'
      });
      // 15 + 0 + 5 + 0 + 0 = 20 DC
      assert.strictEqual(computed.final_cast_dc, 20);
      assert.strictEqual(computed.skill_stage_num, 3); // Expert
      assert.ok(computed.complexity_tier);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 5. META-TECH FORGE ENGINE (PLAN 27)
  // ═══════════════════════════════════════════════════════════
  describe('Meta-Tech Forge Engine', () => {
    it('calculates synthesis DC for Passive, Consumable, and Active modes', () => {
      // Passive: baseDC 15 + (2 sockets * 5) = 25 DC
      const passiveDC = calculateMetaTechDC({
        enhancementType: 'Passive',
        baseItemDC: 15,
        socketsUsed: 2
      });
      assert.strictEqual(passiveDC, 25);

      // Consumable: 15 + rank 10 - 10 discount = 15 DC
      const consumableDC = calculateMetaTechDC({
        enhancementType: 'Consumable',
        invocationRank: 10
      });
      assert.strictEqual(consumableDC, 15);

      // Active: 15 + rank 10 + (TL 4 - 3)*2 = 27 DC
      const activeDC = calculateMetaTechDC({
        enhancementType: 'Active',
        invocationRank: 10,
        tl: 4
      });
      assert.strictEqual(activeDC, 27);
    });

    it('validates UDU socket capacity constraints', () => {
      // 1 socket supports up to Rank 10
      const capValid = calculateMetaTechCapacity({ socketsUsed: 1, invocationRank: 8 });
      assert.strictEqual(capValid.isOverloaded, false);
      assert.strictEqual(capValid.capacityStatus, 'Valid');

      // 1 socket with Rank 15 is overloaded
      const capOver = calculateMetaTechCapacity({ socketsUsed: 1, invocationRank: 15 });
      assert.strictEqual(capOver.isOverloaded, true);
      assert.strictEqual(capOver.capacityStatus, 'Overloaded');

      // 2 sockets support up to Rank 20
      const cap2 = calculateMetaTechCapacity({ socketsUsed: 2, invocationRank: 18 });
      assert.strictEqual(cap2.isOverloaded, false);

      // Vehicle / Mount supports up to Rank 30
      const mountCap = calculateMetaTechCapacity({ scaleTier: 'Huge', invocationRank: 25 });
      assert.strictEqual(mountCap.isOverloaded, false);
    });

    it('generates complete persistent fabrication metadata in computeMetaTechStats', () => {
      const computed = computeMetaTechStats({
        name: 'Chrono-Harmonic Pulse Rifle',
        enhancement_type: 'Active',
        base_item_dc: 20,
        invocation_rank: 12,
        tech_level: 3,
        sockets_used: 2
      });
      // 15 + 12 = 27 DC
      assert.strictEqual(computed.final_dc, 27);
      assert.ok(computed.credit_value > 0);
      assert.strictEqual(computed.material_cost, Math.round(computed.credit_value * 0.5));
      assert.strictEqual(computed.save_dc, 16); // 10 + 12/2
      assert.strictEqual(computed.capacity_validation.capacityStatus, 'Valid');
    });
  });
});
