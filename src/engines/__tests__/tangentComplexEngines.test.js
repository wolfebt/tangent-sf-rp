import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateAugmentationDC,
  calculateAugmentationNodes,
  calculateAugmentationBP,
  calculateAugmentationSP,
  calculateStigmaLevel,
  computeAugmentationStats,
  calculateMechaDefenseDC,
  calculateMechaDC,
  calculateMechaMounts,
  calculateCrewRequired,
  computeMechaStats,
  calculateArchitectureSP,
  calculateArchitectureModules,
  calculateArchitectureDC,
  calculateCooperativeConstructionDays,
  computeArchitectureStats
} from '../tangentComplexEngines.js';

import { calculateCreditValue } from '../tangentEconEngine.js';

// ═══════════════════════════════════════════════════════════
// PLAN 20: AUGMENTATIONS MATRIX TESTS
// ═══════════════════════════════════════════════════════════

test('Plan 20: Augmentations Matrix Engine - DC, Nodes, BP, and SP', () => {
  // Standard Body Mod on Torso (Base 20 DC, 10 Nodes, 2 BP) -> DC 20 (2,560 Credits)
  const bodyModDC = calculateAugmentationDC({ category: 'body_mod', location: 'Torso', baseDC: 20 });
  assert.equal(bodyModDC, 20);
  assert.equal(calculateCreditValue(bodyModDC), 2560);

  // Anatomical Node limits & Hardening
  const torsoNodes = calculateAugmentationNodes({ location: 'Torso', nodeCost: 25 });
  assert.equal(torsoNodes.maxCapacity, 50);
  assert.equal(torsoNodes.nodesConsumed, 25);
  assert.equal(torsoNodes.remainingNodes, 25);
  assert.equal(torsoNodes.isOverBudget, false);
  assert.equal(torsoNodes.isHardened, true);

  // SP calculation (Torso hardened x2: 25 * 2 = 50 SP)
  const torsoSP = calculateAugmentationSP({ location: 'Torso', nodes: 25 });
  assert.equal(torsoSP, 50);

  // Arm nodes (LeftArm max 30 nodes, non-hardened: 15 * 1 = 15 SP)
  const armNodes = calculateAugmentationNodes({ location: 'LeftArm', nodeCost: 15 });
  assert.equal(armNodes.maxCapacity, 30);
  assert.equal(armNodes.isHardened, false);
  const armSP = calculateAugmentationSP({ location: 'LeftArm', nodes: 15 });
  assert.equal(armSP, 15);

  // Overbudget Node check
  const overBudgetNodes = calculateAugmentationNodes({ location: 'Head', nodeCost: 15 });
  assert.equal(overBudgetNodes.maxCapacity, 10);
  assert.equal(overBudgetNodes.isOverBudget, true);
  assert.equal(overBudgetNodes.remainingNodes, -5);

  // BP cost checks
  assert.equal(calculateAugmentationBP({ category: 'fashionware' }), 0);
  assert.equal(calculateAugmentationBP({ category: 'hand_foot' }), 1);
  assert.equal(calculateAugmentationBP({ category: 'body_mod' }), 2);
  assert.equal(calculateAugmentationBP({ category: 'tl5_nanotech' }), 1);
});

test('Plan 20: Augmentations Matrix Engine - Stigma Levels and FBC', () => {
  // Stigma calculation
  assert.equal(calculateStigmaLevel(0).level, 'None');
  assert.equal(calculateStigmaLevel(2).level, 'Minor');
  assert.equal(calculateStigmaLevel(2).penalty, -2);
  assert.equal(calculateStigmaLevel(5).level, 'Moderate');
  assert.equal(calculateStigmaLevel(5).penalty, -4);
  assert.equal(calculateStigmaLevel(8).level, 'Severe');
  assert.equal(calculateStigmaLevel(8).penalty, -8);

  // Full Body Conversion (FBC)
  const fbcCivilian = computeAugmentationStats({
    name: 'Standard Cyber-Shell',
    category: 'fbc',
    is_fbc: true,
    fbc_package: 'Civilian'
  });
  assert.equal(fbcCivilian.credit_value, 100000);
  assert.equal(fbcCivilian.bp_cost, 10);
  assert.equal(fbcCivilian.sp_total, 260);
  assert.equal(fbcCivilian.stigma_level, 'Severe');
  assert.equal(fbcCivilian.node_stats.maxCapacity, 200);

  // Pseudo-cybernetics Wearable (Exo-Gauntlet on Arm: 8 max nodes, 0 BP)
  const pseudoGauntlet = calculateAugmentationNodes({ location: 'LeftArm', isPseudo: true, nodeCost: 6 });
  assert.equal(pseudoGauntlet.maxCapacity, 8);
  assert.equal(pseudoGauntlet.isOverBudget, false);
});

// ═══════════════════════════════════════════════════════════
// PLAN 21: MECHA & VEHICLES MATRIX TESTS
// ═══════════════════════════════════════════════════════════

test('Plan 21: Mecha Matrix Engine - Size Scaling, Frame, and Defense DC', () => {
  // Medium Humanoid (Base 22 DC + 8 Frame = 30 DC, 50 SP, 5 Mounts, 0 Handling)
  const medDC = calculateMechaDC({ size: 'Medium', frame: 'Humanoid' });
  assert.equal(medDC, 30);
  assert.equal(calculateCreditValue(medDC), 40960);

  // Defense DC: Base 10 + Pilot Agility (3) + Medium Size (0) + Racing Frame (+4) = 17
  const defDC = calculateMechaDefenseDC({ pilotAgility: 3, size: 'Medium', frame: 'Racing' });
  assert.equal(defDC, 17);

  // Huge Tank Platform: Base 10 + Pilot Agility (1) + Huge Size (-4) + Platform Frame (-4) = 3
  const tankDefDC = calculateMechaDefenseDC({ pilotAgility: 1, size: 'Huge', frame: 'Platform' });
  assert.equal(tankDefDC, 3);
});

test('Plan 21: Mecha Matrix Engine - Armor Scaling Mounts and MegaCredits', () => {
  // Huge x5 Mecha (Total Mounts = 25, ScaleMult = 5)
  // Ceramic Composite Plating (baseMountMult 2 * scaleMult 5 = 10 mounts)
  // Targeting AI (1 mount) + Cockpit Neural (2 mounts) = 13 Mounts used
  const hugeMounts = calculateMechaMounts({
    size: 'Huge',
    armor: ['ceramic_comp'],
    modules: ['targeting_ai', 'cockpit_neural']
  });
  assert.equal(hugeMounts.totalMounts, 25);
  assert.equal(hugeMounts.usedMounts, 13);
  assert.equal(hugeMounts.remainingMounts, 12);
  assert.equal(hugeMounts.isOverBudget, false);

  // Full compute stats for Colossal Destroyer (Colossal Base 40 + Humanoid 8 + ZPE 25 = 73 DC)
  const starship = computeMechaStats({
    name: 'Hyperion-Class Destroyer',
    size: 'Colossal',
    frame: 'Platform', // +2 DC
    tl: 4,
    propulsion: 'gravitonic', // +30 DC
    armor_plating: ['nanocarbon_weave', 'omnishield'], // +15 + 20 = +35 DC
    installed_modules: ['targeting_ai', 'sensor_omni', 'cargo_bay'], // +15 + 15 + 0 = +30 DC
    pilot_agility: 2
  });

  assert.equal(starship.is_megacredit, true);
  assert.equal(starship.total_sp, 1000);
  assert.equal(starship.defense_dc, 10 + 2 - 16 - 4); // 10 + Agility(2) + Colossal(-16) + Platform(-4) = -8
});

// ═══════════════════════════════════════════════════════════
// PLAN 22: ARCHITECTURE MATRIX TESTS
// ═══════════════════════════════════════════════════════════

test('Plan 22: Architecture Matrix Engine - SP, Modules, and Height Scaling', () => {
  // Large Footprint (Base 100 SP, 1 Module, Base DC 18)
  // Single Story at TL 3 Plasteel (spMult 2.0) -> SP = 100 * 1 * 2.0 = 200 SP
  const largeSP = calculateArchitectureSP({ footprint: 'Large', heightClass: 'Single', tl: 3 });
  assert.equal(largeSP, 200);

  // Gargantuan Footprint (Base 800 SP, 16 Modules, Base DC 28)
  // Skyscraper (50 Stories) at TL 4 Nanocarbon (spMult 3.0) + 1000 Bulwark Bonus -> 800 * 50 * 3.0 + 1000 = 121,000 SP
  const spireSP = calculateArchitectureSP({
    footprint: 'Gargantuan',
    heightClass: 'Skyscraper',
    tl: 4,
    bulwarkBonus: 1000
  });
  assert.equal(spireSP, 121000);

  // Total Modules for Gargantuan Skyscraper (16 * 50 = 800 Modules)
  const spireModules = calculateArchitectureModules({ footprint: 'Gargantuan', heightClass: 'Skyscraper' });
  assert.equal(spireModules, 800);
});

test('Plan 22: Architecture Matrix Engine - Highest Complexity Rule and Cooperative Build', () => {
  // Base Medium Shed (Base DC 15) + Nanoforge Foundry (DC 35) -> Total DC becomes 35 due to Highest Complexity Rule!
  const shedWithNanoforgeDC = calculateArchitectureDC({
    footprint: 'Medium',
    heightClass: 'Single',
    tl: 3,
    specializedModules: ['nanoforge_foundry']
  });
  assert.equal(shedWithNanoforgeDC, 35);
  assert.equal(calculateCreditValue(shedWithNanoforgeDC), 163840);

  // Cooperative Construction Timeline:
  // 50,000 Cr Outpost with 10 workers, Industrial Tier (200x), check 15 -> Daily PP = 10 * (15 - 10) * 200 = 10,000 PP/day
  // Total Days = 50,000 / 10,000 = 5 Days
  const coopTimeline = calculateCooperativeConstructionDays({
    creditValue: 50000,
    workforceWorkers: 10,
    avgSkillCheck: 15,
    toolTier: 'Industrial'
  });
  assert.equal(coopTimeline.totalDays, 5);
  assert.equal(coopTimeline.totalDailyPP, 10000);

  // Compute Full Stats on Complex Outpost
  const outpost = computeArchitectureStats({
    name: 'Aegis Vanguard Outpost',
    footprint: 'Huge', // Base 250 SP, 4 Modules, DC 22
    height_class: 'Duplex', // 2 Stories (+2 DC) -> 24 Base DC
    tl: 3, // Plasteel 2.0x SP, 20 DR, +0 DC
    environment: 'Standard',
    specialized_modules: ['tactical_armory', 'medbay_intensive'], // 2 + 2 = 4 Modules used (at budget), max DC 20 <= 24
    workforce_workers: 20,
    workforce_skill: 15,
    tool_tier: 'Industrial'
  });

  // Base SP 250 * 2 * 2.0 = 1000 SP
  assert.equal(outpost.total_sp, 1000);
  assert.equal(outpost.dr_rating, 20);
  assert.equal(outpost.total_modules, 8); // 4 * 2 stories = 8
  assert.equal(outpost.used_modules, 4);
  assert.equal(outpost.remaining_modules, 4);
  assert.equal(outpost.final_dc, 24);
  assert.equal(outpost.is_module_overbudget, false);
});
