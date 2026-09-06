/**
 * @file augmentationStage.test.mjs
 * @description Unit tests for Augmentation Stage Determination, BP credit calculations,
 * and Body Chart anatomical capacity limits.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { AUGMENTATION_STAGES, ANATOMICAL_BODY_SLOTS } from '../../src/engines/tangentConstants.js';
import {
  determineAugmentationStage,
  calculateAugmentationStageBP,
  calculateBodyCapacityBreakdown,
  getAugmentationNodes,
  getAugmentationBP,
  getAugmentationLocation,
  getAugmentationStage,
  checkAugmentationStageCompatibility,
  AUGMENTATION_STAGE_LABELS
} from '../../src/engines/tangentComplexEngines.js';

test('Augmentation Stage: Default stage is Negligible with 0 BP credit', () => {
  const char = {
    features: [],
    augmentations: []
  };

  const stageInfo = determineAugmentationStage(char);
  assert.equal(stageInfo.stageId, 'negligible');
  assert.equal(stageInfo.stage.bpCredit, 0);
  assert.equal(stageInfo.hasAugmentedFeature, false);

  const bpStats = calculateAugmentationStageBP(char, stageInfo);
  assert.equal(bpStats.bpCredit, 0);
  assert.equal(bpStats.totalBPSpent, 0);
  assert.equal(bpStats.overflowBP, 0);
});

test('Augmentation Stage: Augmented feature grants 6 BP credit', () => {
  const char = {
    features: [{ name: 'Augmented', id: 'special-augmented' }],
    augmentations: [
      { name: 'Ocular HUD', location: 'Head', costs: { bp: 2, nodes: 2 } },
      { name: 'Subdermal Plating', location: 'Torso', costs: { bp: 3, nodes: 5 } }
    ]
  };

  const stageInfo = determineAugmentationStage(char);
  assert.equal(stageInfo.stageId, 'augmented');
  assert.equal(stageInfo.stage.bpCredit, 6);
  assert.equal(stageInfo.hasAugmentedFeature, true);

  const bpStats = calculateAugmentationStageBP(char, stageInfo);
  assert.equal(bpStats.bpCredit, 6);
  assert.equal(bpStats.totalBPSpent, 5);
  assert.equal(bpStats.remainingCredit, 1);
  assert.equal(bpStats.overflowBP, 0);
  assert.equal(bpStats.isOverCredit, false);
});

test('Augmentation Stage: Heavy Augmentations grants 12 BP credit and checks Stamina 2 prereq', () => {
  const charWithoutPrereq = {
    'attr-stamina': 1,
    features: [
      { name: 'Augmented', id: 'special-augmented' },
      { name: 'Heavy Augmentations', id: 'special-heavy-augmentations' }
    ],
    augmentations: []
  };

  const stageInfoFailed = determineAugmentationStage(charWithoutPrereq);
  assert.equal(stageInfoFailed.stageId, 'heavy');
  assert.equal(stageInfoFailed.meetsHeavyPrereq, false);
  assert.ok(stageInfoFailed.prerequisiteWarnings.length > 0);

  const charWithPrereq = {
    'attr-stamina': 3,
    features: [
      { name: 'Heavy Augmentations', id: 'special-heavy-augmentations' }
    ],
    augmentations: [
      { name: 'Hydraulic Cyberarm', location: 'Left Arm', costs: { bp: 8, nodes: 15 } }
    ]
  };

  const stageInfoPass = determineAugmentationStage(charWithPrereq);
  assert.equal(stageInfoPass.stageId, 'heavy');
  assert.equal(stageInfoPass.meetsHeavyPrereq, true);
  assert.equal(stageInfoPass.stage.bpCredit, 12);

  const bpStats = calculateAugmentationStageBP(charWithPrereq, stageInfoPass);
  assert.equal(bpStats.bpCredit, 12);
  assert.equal(bpStats.totalBPSpent, 8);
  assert.equal(bpStats.remainingCredit, 4);
});

test('Augmentation Stage: Extreme Augmentations grants 18 BP credit and calculates overflow BP', () => {
  const char = {
    'attr-stamina': 4,
    features: [
      { name: 'Extreme Augmentations', id: 'special-extreme-augmentations' }
    ],
    augmentations: [
      { name: 'Full Body Conversion Frame', location: 'Torso', costs: { bp: 14, nodes: 50 } },
      { name: 'Heavy Weapon Mount', location: 'Right Arm', costs: { bp: 6, nodes: 10 } }
    ]
  };

  const stageInfo = determineAugmentationStage(char);
  assert.equal(stageInfo.stageId, 'extreme');
  assert.equal(stageInfo.meetsExtremePrereq, true);
  assert.equal(stageInfo.stage.bpCredit, 18);

  const bpStats = calculateAugmentationStageBP(char, stageInfo);
  assert.equal(bpStats.bpCredit, 18);
  assert.equal(bpStats.totalBPSpent, 20); // 14 + 6 = 20
  assert.equal(bpStats.remainingCredit, 0);
  assert.equal(bpStats.overflowBP, 2); // 20 - 18 = 2 BP over credit
  assert.equal(bpStats.isOverCredit, true);
  assert.equal(bpStats.overflowCreditsEquivalent, 5000); // 2 * 2500 Cr
});

test('Body Chart Capacity: Canonical slot limits (Head: 10, Torso: 50, Arms: 30, Legs: 40)', () => {
  const char = {
    augmentations: [
      { name: 'Neural Chip', location: 'Head', costs: { nodes: 4 } },
      { name: 'Cybernetic Heart', location: 'Torso', costs: { nodes: 20 } },
      { name: 'Bionic Left Arm', location: 'LeftArm', costs: { nodes: 15 } },
      { name: 'Blade Mount Right Hand', location: 'Right Arm', costs: { nodes: 10 } },
      { name: 'Hydraulic Left Leg', location: 'Left Leg', costs: { nodes: 25 } },
      { name: 'Spring Dampers Right Leg', location: 'RightLeg', costs: { nodes: 20 } }
    ]
  };

  const breakdown = calculateBodyCapacityBreakdown(char);

  assert.equal(breakdown.slots.Head.maxNodes, 10);
  assert.equal(breakdown.slots.Head.usedNodes, 4);
  assert.equal(breakdown.slots.Head.remainingNodes, 6);
  assert.equal(breakdown.slots.Head.isOverCapacity, false);

  assert.equal(breakdown.slots.Torso.maxNodes, 50);
  assert.equal(breakdown.slots.Torso.usedNodes, 20);

  assert.equal(breakdown.slots.LeftArm.maxNodes, 30);
  assert.equal(breakdown.slots.LeftArm.usedNodes, 15);

  assert.equal(breakdown.slots.RightArm.maxNodes, 30);
  assert.equal(breakdown.slots.RightArm.usedNodes, 10);

  assert.equal(breakdown.slots.LeftLeg.maxNodes, 40);
  assert.equal(breakdown.slots.LeftLeg.usedNodes, 25);

  assert.equal(breakdown.slots.RightLeg.maxNodes, 40);
  assert.equal(breakdown.slots.RightLeg.usedNodes, 20);

  assert.equal(breakdown.totalMaxCapacity, 200);
  assert.equal(breakdown.totalUsedNodes, 94); // 4 + 20 + 15 + 10 + 25 + 20 = 94
  assert.equal(breakdown.hasAnyOverCapacity, false);
});

test('Body Chart Capacity: Detects when a body slot is over capacity', () => {
  const char = {
    augmentations: [
      { name: 'Excessive Cranial Array', location: 'Head', costs: { nodes: 14 } }
    ]
  };

  const breakdown = calculateBodyCapacityBreakdown(char);
  assert.equal(breakdown.slots.Head.usedNodes, 14);
  assert.equal(breakdown.slots.Head.maxNodes, 10);
  assert.equal(breakdown.slots.Head.isOverCapacity, true);
  assert.equal(breakdown.slots.Head.overflowNodes, 4);
  assert.equal(breakdown.hasAnyOverCapacity, true);
});

test('Augmentation Stage Extraction: getAugmentationStage normalizes and resolves stages', () => {
  // Explicit stage field
  assert.equal(getAugmentationStage({ stage: 'Negligible' }), 'Negligible');
  assert.equal(getAugmentationStage({ stage: 'standard' }), 'Standard');
  assert.equal(getAugmentationStage({ stage: 'Heavy' }), 'Heavy');
  assert.equal(getAugmentationStage({ stage: 'extreme' }), 'Extreme');

  // Alternative keys (augmentation_stage, stage_level)
  assert.equal(getAugmentationStage({ augmentation_stage: 'Heavy' }), 'Heavy');
  assert.equal(getAugmentationStage({ stage_level: 'Extreme' }), 'Extreme');

  // Category fallbacks
  assert.equal(getAugmentationStage({ category: 'fashionware', name: 'Light Tattoo' }), 'Negligible');
  assert.equal(getAugmentationStage({ category: 'pseudo', name: 'Exo-Harness' }), 'Negligible');
  assert.equal(getAugmentationStage({ isPseudo: true, name: 'Smart Goggles' }), 'Negligible');
  assert.equal(getAugmentationStage({ category: 'fbc', name: 'Civilian Shell' }), 'Heavy');

  // Canonical name fallbacks
  assert.equal(getAugmentationStage({ name: 'Prosthetic Skull' }), 'Heavy');
  assert.equal(getAugmentationStage({ name: 'Prosthetic Torso' }), 'Heavy');
  assert.equal(getAugmentationStage({ name: 'Tool Hand' }), 'Heavy');
  assert.equal(getAugmentationStage({ name: 'Weapon Hand' }), 'Heavy');
  assert.equal(getAugmentationStage({ name: 'Grappler Hand' }), 'Heavy');
  assert.equal(getAugmentationStage({ name: 'Matter Recon Forge' }), 'Extreme');
  assert.equal(getAugmentationStage({ name: 'Phase Shift Generator' }), 'Extreme');

  // Default
  assert.equal(getAugmentationStage({ name: 'Ocular HUD' }), 'Standard');
});

test('Augmentation Stage Compatibility: Baseline/Negligible Operative (No Stage Features)', () => {
  const char = { features: [] };

  // Negligible is compatible without features
  const resNegligible = checkAugmentationStageCompatibility(char, { stage: 'Negligible' });
  assert.equal(resNegligible.isCompatible, true);
  assert.equal(resNegligible.warning, null);

  // Standard requires 'Augmented'
  const resStandard = checkAugmentationStageCompatibility(char, { stage: 'Standard' });
  assert.equal(resStandard.isCompatible, false);
  assert.equal(resStandard.requiredFeatureName, 'Augmented');
  assert.equal(resStandard.requiredFeatureId, 'special-augmented');
  assert.ok(resStandard.warning.includes('Augmented'));

  // Heavy requires 'Heavy Augmentations'
  const resHeavy = checkAugmentationStageCompatibility(char, { stage: 'Heavy' });
  assert.equal(resHeavy.isCompatible, false);
  assert.equal(resHeavy.requiredFeatureName, 'Heavy Augmentations');

  // Extreme requires 'Extreme Augmentations'
  const resExtreme = checkAugmentationStageCompatibility(char, { stage: 'Extreme' });
  assert.equal(resExtreme.isCompatible, false);
  assert.equal(resExtreme.requiredFeatureName, 'Extreme Augmentations');
});

test('Augmentation Stage Compatibility: Operative with Augmented feature', () => {
  const char = {
    features: [{ name: 'Augmented', id: 'special-augmented' }]
  };

  // Negligible and Standard are compatible
  assert.equal(checkAugmentationStageCompatibility(char, { stage: 'Negligible' }).isCompatible, true);
  assert.equal(checkAugmentationStageCompatibility(char, { stage: 'Standard' }).isCompatible, true);

  // Heavy and Extreme are not compatible
  const resHeavy = checkAugmentationStageCompatibility(char, { stage: 'Heavy' });
  assert.equal(resHeavy.isCompatible, false);
  assert.equal(resHeavy.requiredFeatureName, 'Heavy Augmentations');

  const resExtreme = checkAugmentationStageCompatibility(char, { stage: 'Extreme' });
  assert.equal(resExtreme.isCompatible, false);
});

test('Augmentation Stage Compatibility: Operative with Heavy Augmentations feature', () => {
  const char = {
    features: [
      { name: 'Augmented', id: 'special-augmented' },
      { name: 'Heavy Augmentations', id: 'special-heavy-augmentations' }
    ]
  };

  // Negligible, Standard, and Heavy are compatible
  assert.equal(checkAugmentationStageCompatibility(char, { stage: 'Negligible' }).isCompatible, true);
  assert.equal(checkAugmentationStageCompatibility(char, { stage: 'Standard' }).isCompatible, true);
  assert.equal(checkAugmentationStageCompatibility(char, { stage: 'Heavy' }).isCompatible, true);

  // Extreme is not compatible
  const resExtreme = checkAugmentationStageCompatibility(char, { stage: 'Extreme' });
  assert.equal(resExtreme.isCompatible, false);
  assert.equal(resExtreme.requiredFeatureName, 'Extreme Augmentations');
});

test('Augmentation Stage Compatibility: Operative with Extreme Augmentations feature', () => {
  const char = {
    features: [
      { name: 'Extreme Augmentations', id: 'special-extreme-augmentations' }
    ]
  };

  // All 4 stages are compatible
  assert.equal(checkAugmentationStageCompatibility(char, { stage: 'Negligible' }).isCompatible, true);
  assert.equal(checkAugmentationStageCompatibility(char, { stage: 'Standard' }).isCompatible, true);
  assert.equal(checkAugmentationStageCompatibility(char, { stage: 'Heavy' }).isCompatible, true);
  assert.equal(checkAugmentationStageCompatibility(char, { stage: 'Extreme' }).isCompatible, true);
});

