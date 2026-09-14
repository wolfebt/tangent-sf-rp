/**
 * @file prerequisiteEvaluator.test.mjs
 * @description Unit tests for checkPrerequisite covering Augmentation Stage Matrix,
 * Features, Invocations, Special Abilities, and Specializations.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPrerequisite } from '../../src/utils/prerequisiteEvaluator.js';
import { getAugmentationStage } from '../../src/engines/tangentComplexEngines.js';

test('Prerequisite Evaluator: Augmentations Negligible stage has no feature requirement', () => {
  const baselineChar = {
    features: [],
    augmentations: []
  };

  const negligibleAug = {
    name: 'Basic Prosthetic Hand',
    category: 'augmentations',
    stage: 'Negligible'
  };

  const res = checkPrerequisite(negligibleAug, baselineChar, 'augmentations');
  assert.equal(res.hasPrerequisite, false);
  assert.equal(res.isPossessed, true);
  assert.equal(res.unmetReasons.length, 0);
  assert.equal(res.stage, 'Negligible');
});

test('Prerequisite Evaluator: Augmentations Standard stage requires Augmented feature', () => {
  const baselineChar = {
    features: [],
    augmentations: []
  };

  const standardAug = {
    name: 'Accelerator',
    category: 'augmentations',
    stage: 'Standard'
  };

  // 1. Baseline character fails
  const resFail = checkPrerequisite(standardAug, baselineChar, 'augmentations');
  assert.equal(resFail.hasPrerequisite, true);
  assert.equal(resFail.isPossessed, false);
  assert.ok(resFail.unmetReasons.some(r => r.includes('Augmented')));

  // 2. Character with 'Augmented' feature succeeds
  const augmentedChar = {
    features: [{ name: 'Augmented', id: 'special-augmented' }]
  };
  const resPass = checkPrerequisite(standardAug, augmentedChar, 'augmentations');
  assert.equal(resPass.hasPrerequisite, true);
  assert.equal(resPass.isPossessed, true);
  assert.equal(resPass.unmetReasons.length, 0);
  assert.equal(resPass.stage, 'Standard');
});

test('Prerequisite Evaluator: Augmentations Heavy stage requires Heavy Augmentations feature and Stamina 2+', () => {
  const heavyAug = {
    name: 'Reinforced Chassis',
    category: 'augmentations',
    stage: 'Heavy'
  };

  // 1. Character with only Augmented fails
  const augmentedOnly = {
    features: [{ name: 'Augmented', id: 'special-augmented' }],
    'attr-stamina': 3
  };
  const resAugOnly = checkPrerequisite(heavyAug, augmentedOnly, 'augmentations');
  assert.equal(resAugOnly.isPossessed, false);
  assert.ok(resAugOnly.unmetReasons.some(r => r.includes('Heavy Augmentations')));

  // 2. Character with Heavy Augmentations but Stamina < 2 fails
  const lowStamina = {
    features: [{ name: 'Heavy Augmentations', id: 'special-heavy-augmentations' }],
    'attr-stamina': 1
  };
  const resLowSta = checkPrerequisite(heavyAug, lowStamina, 'augmentations');
  assert.equal(resLowSta.isPossessed, false);
  assert.ok(resLowSta.unmetReasons.some(r => r.includes('Stamina 2+')));

  // 3. Character with Heavy Augmentations and Stamina 2+ succeeds
  const qualifiedChar = {
    features: [{ name: 'Heavy Augmentations', id: 'special-heavy-augmentations' }],
    'attr-stamina': 2
  };
  const resPass = checkPrerequisite(heavyAug, qualifiedChar, 'augmentations');
  assert.equal(resPass.isPossessed, true);
  assert.equal(resPass.unmetReasons.length, 0);
  assert.equal(resPass.stage, 'Heavy');
});

test('Prerequisite Evaluator: Augmentations Extreme stage requires Extreme Augmentations and Stamina 4+', () => {
  const extremeAug = {
    name: 'Matter Reconstruction Engine',
    category: 'augmentations',
    stage: 'Extreme'
  };

  // 1. Character with Heavy Augmentations fails
  const heavyChar = {
    features: [{ name: 'Heavy Augmentations', id: 'special-heavy-augmentations' }],
    'attr-stamina': 4
  };
  const resHeavy = checkPrerequisite(extremeAug, heavyChar, 'augmentations');
  assert.equal(resHeavy.isPossessed, false);
  assert.ok(resHeavy.unmetReasons.some(r => r.includes('Extreme Augmentations')));

  // 2. Character with Extreme Augmentations but Stamina 3 fails
  const lowStaExtreme = {
    features: [{ name: 'Extreme Augmentations', id: 'special-extreme-augmentations' }],
    'attr-stamina': 3
  };
  const resLowSta = checkPrerequisite(extremeAug, lowStaExtreme, 'augmentations');
  assert.equal(resLowSta.isPossessed, false);
  assert.ok(resLowSta.unmetReasons.some(r => r.includes('Stamina 4+')));

  // 3. Character with Extreme Augmentations and Stamina 4+ succeeds
  const qualifiedExtreme = {
    features: [{ name: 'Extreme Augmentations', id: 'special-extreme-augmentations' }],
    'attr-stamina': 4
  };
  const resPass = checkPrerequisite(extremeAug, qualifiedExtreme, 'augmentations');
  assert.equal(resPass.isPossessed, true);
  assert.equal(resPass.unmetReasons.length, 0);
  assert.equal(resPass.stage, 'Extreme');
});

test('Prerequisite Evaluator: Higher augmentation stages satisfy lower requirements', () => {
  const standardAug = { name: 'Reflex Booster', stage: 'Standard' };
  const heavyAug = { name: 'Reinforced Plating', stage: 'Heavy' };

  // Character with Extreme Augmentations satisfies both Standard and Heavy
  const extremeChar = {
    features: [{ name: 'Extreme Augmentations', id: 'special-extreme-augmentations' }],
    'attr-stamina': 4
  };

  const resStandard = checkPrerequisite(standardAug, extremeChar, 'augmentations');
  assert.equal(resStandard.isPossessed, true);

  const resHeavy = checkPrerequisite(heavyAug, extremeChar, 'augmentations');
  assert.equal(resHeavy.isPossessed, true);
});

test('Prerequisite Evaluator: Anonymous browsing outside character context assumes met but reports stage', () => {
  const standardAug = { name: 'Accelerator', stage: 'Standard' };
  const resStandard = checkPrerequisite(standardAug, null, 'augmentations');
  assert.equal(resStandard.hasPrerequisite, true);
  assert.equal(resStandard.isPossessed, true);
  assert.ok(resStandard.prerequisiteText.includes('Augmented'));
  assert.equal(resStandard.stage, 'Standard');

  const negligibleAug = { name: 'Basic Prosthetic', stage: 'Negligible' };
  const resNegligible = checkPrerequisite(negligibleAug, null, 'augmentations');
  assert.equal(resNegligible.hasPrerequisite, false);
  assert.equal(resNegligible.isPossessed, true);
  assert.equal(resNegligible.stage, 'Negligible');
});

test('Augmentation Stage: getAugmentationStage returns canonical stage', () => {
  assert.equal(getAugmentationStage({ name: 'Prosthetic Hand', stage: 'Negligible' }), 'Negligible');
  assert.equal(getAugmentationStage({ name: 'Subdermal Plating', stage: 'Standard' }), 'Standard');
  assert.equal(getAugmentationStage({ name: 'Reinforced Chassis', stage: 'Heavy' }), 'Heavy');
  assert.equal(getAugmentationStage({ name: 'Matter Reconstruction', stage: 'Extreme' }), 'Extreme');
});

test('Prerequisite Evaluator: Species never have prerequisites in any way', () => {
  const blankCharacter = {
    features: [],
    skills: {},
    'skill-athletics-rank': 0
  };

  const sampleSpecies = {
    id: 'species-aeld-celestine',
    name: 'Celestine (Alterian)',
    category: 'species',
    parent_species: 'Aeld'
  };

  // Check with canonical collection key 'species'
  const resCol = checkPrerequisite(sampleSpecies, blankCharacter, 'species');
  assert.equal(resCol.hasPrerequisite, false);
  assert.equal(resCol.isPossessed, true);
  assert.equal(resCol.unmetReasons.length, 0);
  assert.equal(resCol.prerequisiteText, '');

  // Check without explicit itemType (falling back to category: 'species')
  const resCategory = checkPrerequisite(sampleSpecies, blankCharacter);
  assert.equal(resCategory.hasPrerequisite, false);
  assert.equal(resCategory.isPossessed, true);
  assert.equal(resCategory.unmetReasons.length, 0);

  // Check that species name does NOT trigger specialization base skill prerequisite
  assert.ok(!resCol.unmetReasons.some(r => r.includes('base skill')));
  assert.ok(!resCategory.unmetReasons.some(r => r.includes('base skill')));
});

test('Prerequisite Evaluator: Skill Specializations correctly require trained base skill without affecting species', () => {
  const untrainedChar = {
    'skill-firearms-rank': 0
  };
  const trainedChar = {
    'skill-firearms-rank': 2
  };

  const specItem = {
    name: 'Sniper Rifles',
    category: 'specializations',
    baseSkillName: 'Firearms',
    baseSkillId: 'firearms'
  };

  const resFail = checkPrerequisite(specItem, untrainedChar, 'specializations');
  assert.equal(resFail.hasPrerequisite, true);
  assert.equal(resFail.isPossessed, false);
  assert.ok(resFail.unmetReasons.some(r => r.includes('Firearms Rank 1+')));

  const resPass = checkPrerequisite(specItem, trainedChar, 'specializations');
  assert.equal(resPass.hasPrerequisite, true);
  assert.equal(resPass.isPossessed, true);
  assert.equal(resPass.unmetReasons.length, 0);
});


