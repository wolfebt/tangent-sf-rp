import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CODEX_MATRICES,
  getMatrixById,
  isPropertyMatrix,
  hasSocketsAndUDU,
  hasDamageOrEffect,
  hasModifications
} from '../../src/pages/Codex/codexConfig.js';
import { categoryConfig } from '../../src/components/DBM/categoryConfig.js';
import {
  adaptItemToCodexFormData,
  adaptCodexToOmnicortexItem
} from '../../src/pages/Codex/codexAssetBridge.js';

test('Codex Mechanics Integrity: Factions Dataset Requirements', () => {
  const factionMatrix = getMatrixById('factions');
  assert.ok(factionMatrix, 'Factions matrix must exist');
  assert.strictEqual(factionMatrix.isProperty, false, 'Factions must not be a property matrix');
  assert.strictEqual(factionMatrix.hasSocketsAndUDU, false, 'Factions must not have sockets or UDU');
  assert.strictEqual(factionMatrix.hasModifications, false, 'Factions must not have weapon upgrades or modifications');
  assert.strictEqual(factionMatrix.hasDamageOrEffect, false, 'Factions must not have damage or critical details');

  assert.strictEqual(isPropertyMatrix('factions'), false);
  assert.strictEqual(hasSocketsAndUDU('factions'), false);
  assert.strictEqual(hasModifications('factions'), false);
  assert.strictEqual(hasDamageOrEffect('factions'), false);

  const fieldNames = factionMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('skill_package'), 'Factions must include skill_package');
  assert.ok(fieldNames.includes('recommended_features'), 'Factions must include recommended_features');
  assert.ok(fieldNames.includes('bonus_features'), 'Factions must include bonus_features');
  assert.ok(fieldNames.includes('typical_archetypes'), 'Factions must include typical_archetypes');
  assert.ok(fieldNames.includes('military_doctrine'), 'Factions must include military_doctrine');
  assert.ok(fieldNames.includes('key_units'), 'Factions must include key_units');
  assert.ok(fieldNames.includes('naval_assets'), 'Factions must include naval_assets');
  assert.ok(fieldNames.includes('economic_model'), 'Factions must include economic_model');
  assert.ok(fieldNames.includes('primary_exports'), 'Factions must include primary_exports');
  assert.ok(fieldNames.includes('wealth_modifier'), 'Factions must include wealth_modifier');

  const factionCat = categoryConfig.factions;
  assert.ok(factionCat, 'factions must exist in categoryConfig');
  const catFieldKeys = Object.keys(factionCat.fields || {});
  assert.ok(!catFieldKeys.includes('sockets'), 'factions in categoryConfig must not have sockets');
  assert.ok(!catFieldKeys.includes('critical_details'), 'factions in categoryConfig must not have critical_details');
  assert.ok(!catFieldKeys.includes('modifications'), 'factions in categoryConfig must not have modifications');
});

test('Codex Mechanics Integrity: Invocations & Special Abilities Dataset Requirements', () => {
  const invocationMatrix = getMatrixById('invocation');
  assert.ok(invocationMatrix, 'Invocation matrix must exist');
  assert.strictEqual(invocationMatrix.isProperty, false, 'Invocations must not be a property matrix');
  assert.strictEqual(invocationMatrix.hasSocketsAndUDU, false, 'Invocations must not have sockets or UDU');
  assert.strictEqual(invocationMatrix.hasModifications, false, 'Invocations must not have weapon upgrades');
  assert.strictEqual(invocationMatrix.hasDamageOrEffect, true, 'Invocations must have damage/effect critical details');

  assert.strictEqual(hasSocketsAndUDU('invocation'), false);
  assert.strictEqual(hasDamageOrEffect('invocation'), true);
  assert.strictEqual(hasModifications('invocation'), false);

  assert.strictEqual(categoryConfig.invocations?.fields?.sockets, undefined, 'invocations must not have sockets');
  assert.strictEqual(categoryConfig.special_abilities?.fields?.sockets, undefined, 'special_abilities must not have sockets');
});

test('Codex Mechanics Integrity: Property Types & Sockets/UDU Allocation Exclusivity', () => {
  const propertyMatrices = ['weaponry', 'armor', 'equipment', 'mecha', 'architecture', 'augmentations', 'meta-tech', 'other'];
  for (const mId of propertyMatrices) {
    const matrix = getMatrixById(mId);
    assert.ok(matrix, 'Matrix ' + mId + ' must exist');
    assert.strictEqual(matrix.isProperty, true, mId + ' must be marked isProperty');
    assert.strictEqual(matrix.hasSocketsAndUDU, true, mId + ' must have sockets and UDU');
    assert.strictEqual(matrix.hasModifications, true, mId + ' must have modifications');
  }

  const nonPropertyMatrices = ['factions', 'species', 'modular-characters', 'features', 'planetary-design', 'invocation'];
  for (const mId of nonPropertyMatrices) {
    assert.strictEqual(hasSocketsAndUDU(mId), false, mId + ' must not have sockets and UDU');
  }
});

test('Codex Mechanics Integrity: Critical Details Exclusivity (Damage/Effect Only)', () => {
  assert.strictEqual(hasDamageOrEffect('weaponry'), true, 'Weaponry must have critical details');
  assert.strictEqual(hasDamageOrEffect('invocation'), true, 'Invocations must have critical/surge details');

  assert.strictEqual(hasDamageOrEffect('armor'), false, 'Armor must not have critical details');
  assert.strictEqual(hasDamageOrEffect('augmentations'), false, 'Augmentations must not have critical details');
  assert.strictEqual(hasDamageOrEffect('equipment'), false, 'Equipment must not have critical details');
  assert.strictEqual(hasDamageOrEffect('mecha'), false, 'Mecha must not have critical details');
  assert.strictEqual(hasDamageOrEffect('architecture'), false, 'Architecture must not have critical details');
  assert.strictEqual(hasDamageOrEffect('other'), false, 'Other property must not have critical details');
  assert.strictEqual(hasDamageOrEffect('factions'), false, 'Factions must not have critical details');
  assert.strictEqual(hasDamageOrEffect('species'), false, 'Species must not have critical details');

  assert.strictEqual(categoryConfig.augmentations?.fields?.critical_details, undefined, 'augmentations must not have critical_details');
  assert.strictEqual(categoryConfig.armoring?.fields?.critical_details, undefined, 'armoring must not have critical_details');
});

test('Codex Mechanics Integrity: Species Architect Guidance & AI Reference Directives', () => {
  const speciesMatrix = getMatrixById('species');
  assert.ok(speciesMatrix, 'Species matrix must exist');

  const fieldNames = speciesMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_factions'), 'Species must include recommended_factions field');
  assert.ok(fieldNames.includes('recommended_origins'), 'Species must include recommended_origins field');
  assert.ok(fieldNames.includes('recommended_occupations'), 'Species must include recommended_occupations field');
  assert.ok(fieldNames.includes('recommended_skills'), 'Species must include recommended_skills field');
  assert.ok(fieldNames.includes('recommended_features'), 'Species must include recommended_features field');
  assert.ok(fieldNames.includes('keywords'), 'Species must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Species must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(speciesMatrix.defaultValues.recommended_factions, []);
  assert.deepStrictEqual(speciesMatrix.defaultValues.recommended_origins, []);
  assert.deepStrictEqual(speciesMatrix.defaultValues.recommended_occupations, []);
  assert.deepStrictEqual(speciesMatrix.defaultValues.recommended_skills, []);
  assert.deepStrictEqual(speciesMatrix.defaultValues.recommended_features, []);
  assert.strictEqual(speciesMatrix.defaultValues.keywords, '');
  assert.strictEqual(speciesMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const speciesCat = categoryConfig.species;
  assert.ok(speciesCat, 'species must exist in categoryConfig');
  assert.ok(speciesCat.fields?.recommended_factions, 'categoryConfig.species must have recommended_factions');
  assert.ok(speciesCat.fields?.recommended_origins, 'categoryConfig.species must have recommended_origins');
  assert.ok(speciesCat.fields?.recommended_occupations, 'categoryConfig.species must have recommended_occupations');
  assert.ok(speciesCat.fields?.recommended_skills, 'categoryConfig.species must have recommended_skills');
  assert.ok(speciesCat.fields?.recommended_features, 'categoryConfig.species must have recommended_features');
  assert.strictEqual(speciesCat.fields?.recommended_skills?.source, 'skills');
  assert.strictEqual(speciesCat.fields?.recommended_features?.source, 'features');
  assert.ok(speciesCat.fields?.keywords, 'categoryConfig.species must have keywords');
  assert.ok(speciesCat.fields?.negative_keywords, 'categoryConfig.species must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge
  const rawItem = {
    id: 'species-test',
    name: 'Test Xenotype',
    recommended_factions: ['Free Trade Consortium', 'Auluran Pride Fleet'],
    recommended_origins: ['Deep Rim Outpost'],
    recommended_occupations: ['Pathfinder'],
    recommended_skills: ['Acrobatics', 'Stealth', 'Survival'],
    recommended_features: ['Night Sight', 'Fleet of Foot'],
    keywords: 'stealth, arboreal, scout',
    negative_keywords: 'heavy armor, aquatic, brute force'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'species');
  assert.deepStrictEqual(adaptedFormData.recommended_factions, ['Free Trade Consortium', 'Auluran Pride Fleet']);
  assert.deepStrictEqual(adaptedFormData.recommended_origins, ['Deep Rim Outpost']);
  assert.deepStrictEqual(adaptedFormData.recommended_occupations, ['Pathfinder']);
  assert.deepStrictEqual(adaptedFormData.recommended_skills, ['Acrobatics', 'Stealth', 'Survival']);
  assert.deepStrictEqual(adaptedFormData.recommended_features, ['Night Sight', 'Fleet of Foot']);
  assert.strictEqual(adaptedFormData.keywords, 'stealth, arboreal, scout');
  assert.strictEqual(adaptedFormData.negative_keywords, 'heavy armor, aquatic, brute force');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'species');
  assert.deepStrictEqual(exportedItem.recommended_factions, ['Free Trade Consortium', 'Auluran Pride Fleet']);
  assert.deepStrictEqual(exportedItem.recommended_origins, ['Deep Rim Outpost']);
  assert.deepStrictEqual(exportedItem.recommended_occupations, ['Pathfinder']);
  assert.deepStrictEqual(exportedItem.recommended_skills, ['Acrobatics', 'Stealth', 'Survival']);
  assert.deepStrictEqual(exportedItem.recommended_features, ['Night Sight', 'Fleet of Foot']);
  assert.strictEqual(exportedItem.keywords, 'stealth, arboreal, scout');
  assert.strictEqual(exportedItem.negative_keywords, 'heavy armor, aquatic, brute force');
});

test('Codex Mechanics Integrity: Factions Architect Guidance & AI Reference Directives', () => {
  const factionMatrix = getMatrixById('factions');
  assert.ok(factionMatrix, 'Factions matrix must exist');

  const fieldNames = factionMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_species'), 'Factions must include recommended_species field');
  assert.ok(fieldNames.includes('recommended_origins'), 'Factions must include recommended_origins field');
  assert.ok(fieldNames.includes('recommended_occupations'), 'Factions must include recommended_occupations field');
  assert.ok(fieldNames.includes('recommended_skills'), 'Factions must include recommended_skills field');
  assert.ok(fieldNames.includes('recommended_features'), 'Factions must include recommended_features field');
  assert.ok(fieldNames.includes('keywords'), 'Factions must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Factions must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(factionMatrix.defaultValues.recommended_species, []);
  assert.deepStrictEqual(factionMatrix.defaultValues.recommended_origins, []);
  assert.deepStrictEqual(factionMatrix.defaultValues.recommended_occupations, []);
  assert.deepStrictEqual(factionMatrix.defaultValues.recommended_skills, []);
  assert.deepStrictEqual(factionMatrix.defaultValues.recommended_features, []);
  assert.strictEqual(factionMatrix.defaultValues.keywords, '');
  assert.strictEqual(factionMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const factionCat = categoryConfig.factions;
  assert.ok(factionCat, 'factions must exist in categoryConfig');
  assert.ok(factionCat.fields?.recommended_species, 'categoryConfig.factions must have recommended_species');
  assert.strictEqual(factionCat.fields?.recommended_species?.source, 'species');
  assert.ok(factionCat.fields?.recommended_origins, 'categoryConfig.factions must have recommended_origins');
  assert.strictEqual(factionCat.fields?.recommended_origins?.source, 'origins');
  assert.ok(factionCat.fields?.recommended_occupations, 'categoryConfig.factions must have recommended_occupations');
  assert.strictEqual(factionCat.fields?.recommended_occupations?.source, 'occupations');
  assert.ok(factionCat.fields?.recommended_skills, 'categoryConfig.factions must have recommended_skills');
  assert.strictEqual(factionCat.fields?.recommended_skills?.source, 'skills');
  assert.ok(factionCat.fields?.recommended_features, 'categoryConfig.factions must have recommended_features');
  assert.strictEqual(factionCat.fields?.recommended_features?.source, 'features');
  assert.ok(factionCat.fields?.keywords, 'categoryConfig.factions must have keywords');
  assert.ok(factionCat.fields?.negative_keywords, 'categoryConfig.factions must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'faction-test',
    name: 'Vanguard Directorate',
    recommended_species: ['Human (Standard)', 'Cyborg Synthetics'],
    recommended_origins: ['Metropolitan Hive', 'Orbital Citadel'],
    recommended_occupations: ['Shock Trooper', 'Enforcer'],
    recommended_skills: ['Gunnery', 'Tactics', 'Intimidation'],
    recommended_features: ['Discipline', 'Heavy Armor Proficiency'],
    keywords: 'militaristic, disciplined, authoritative',
    negative_keywords: 'anarchy, pacifism, piracy'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'factions');
  assert.deepStrictEqual(adaptedFormData.recommended_species, ['Human (Standard)', 'Cyborg Synthetics']);
  assert.deepStrictEqual(adaptedFormData.recommended_origins, ['Metropolitan Hive', 'Orbital Citadel']);
  assert.deepStrictEqual(adaptedFormData.recommended_occupations, ['Shock Trooper', 'Enforcer']);
  assert.deepStrictEqual(adaptedFormData.recommended_skills, ['Gunnery', 'Tactics', 'Intimidation']);
  assert.deepStrictEqual(adaptedFormData.recommended_features, ['Discipline', 'Heavy Armor Proficiency']);
  assert.strictEqual(adaptedFormData.keywords, 'militaristic, disciplined, authoritative');
  assert.strictEqual(adaptedFormData.negative_keywords, 'anarchy, pacifism, piracy');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'factions');
  assert.deepStrictEqual(exportedItem.recommended_species, ['Human (Standard)', 'Cyborg Synthetics']);
  assert.deepStrictEqual(exportedItem.recommended_origins, ['Metropolitan Hive', 'Orbital Citadel']);
  assert.deepStrictEqual(exportedItem.recommended_occupations, ['Shock Trooper', 'Enforcer']);
  assert.deepStrictEqual(exportedItem.recommended_skills, ['Gunnery', 'Tactics', 'Intimidation']);
  assert.deepStrictEqual(exportedItem.recommended_features, ['Discipline', 'Heavy Armor Proficiency']);
  assert.strictEqual(exportedItem.keywords, 'militaristic, disciplined, authoritative');
  assert.strictEqual(exportedItem.negative_keywords, 'anarchy, pacifism, piracy');

  // Verify backwards compatibility with comma-separated string for recommended_features
  const legacyItem = {
    id: 'faction-legacy',
    name: 'Legacy Fleet',
    recommended_features: 'Discipline, Natural Weapons'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'factions');
  assert.deepStrictEqual(adaptedLegacy.recommended_features, ['Discipline', 'Natural Weapons']);
});

test('Codex Mechanics Integrity: Origins Architect Guidance & AI Reference Directives', () => {
  const originMatrix = getMatrixById('origins');
  assert.ok(originMatrix, 'Origins matrix must exist');

  const fieldNames = originMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_species'), 'Origins must include recommended_species field');
  assert.ok(fieldNames.includes('recommended_factions'), 'Origins must include recommended_factions field');
  assert.ok(fieldNames.includes('recommended_occupations'), 'Origins must include recommended_occupations field');
  assert.ok(fieldNames.includes('recommended_skills'), 'Origins must include recommended_skills field');
  assert.ok(fieldNames.includes('recommended_features'), 'Origins must include recommended_features field');
  assert.ok(fieldNames.includes('keywords'), 'Origins must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Origins must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(originMatrix.defaultValues.recommended_species, []);
  assert.deepStrictEqual(originMatrix.defaultValues.recommended_factions, []);
  assert.deepStrictEqual(originMatrix.defaultValues.recommended_occupations, []);
  assert.deepStrictEqual(originMatrix.defaultValues.recommended_skills, []);
  assert.deepStrictEqual(originMatrix.defaultValues.recommended_features, []);
  assert.strictEqual(originMatrix.defaultValues.keywords, '');
  assert.strictEqual(originMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const originCat = categoryConfig.origins;
  assert.ok(originCat, 'origins must exist in categoryConfig');
  assert.ok(originCat.fields?.recommended_species, 'categoryConfig.origins must have recommended_species');
  assert.strictEqual(originCat.fields?.recommended_species?.source, 'species');
  assert.ok(originCat.fields?.recommended_factions, 'categoryConfig.origins must have recommended_factions');
  assert.strictEqual(originCat.fields?.recommended_factions?.source, 'factions');
  assert.ok(originCat.fields?.recommended_occupations, 'categoryConfig.origins must have recommended_occupations');
  assert.strictEqual(originCat.fields?.recommended_occupations?.source, 'occupations');
  assert.ok(originCat.fields?.recommended_skills, 'categoryConfig.origins must have recommended_skills');
  assert.strictEqual(originCat.fields?.recommended_skills?.source, 'skills');
  assert.ok(originCat.fields?.recommended_features, 'categoryConfig.origins must have recommended_features');
  assert.strictEqual(originCat.fields?.recommended_features?.source, 'features');
  assert.ok(originCat.fields?.keywords, 'categoryConfig.origins must have keywords');
  assert.ok(originCat.fields?.negative_keywords, 'categoryConfig.origins must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'origin-test',
    name: 'Subterranean Mining Hive',
    habitat: 'Planetary Biome',
    recommended_species: ['Gorgon', 'Human (Base)'],
    recommended_factions: ['Mining Guild', 'Free Trade Consortium'],
    recommended_occupations: ['Miner', 'Heavy Engineer'],
    recommended_skills: ['Athletics', 'Alertness'],
    recommended_features: ['Tremorsense', 'Cave Born'],
    keywords: 'subterranean, mining, dark, enclosed',
    negative_keywords: 'aquatic, aerial, zero-g'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'origins');
  assert.deepStrictEqual(adaptedFormData.recommended_species, ['Gorgon', 'Human (Base)']);
  assert.deepStrictEqual(adaptedFormData.recommended_factions, ['Mining Guild', 'Free Trade Consortium']);
  assert.deepStrictEqual(adaptedFormData.recommended_occupations, ['Miner', 'Heavy Engineer']);
  assert.deepStrictEqual(adaptedFormData.recommended_skills, ['Athletics', 'Alertness']);
  assert.deepStrictEqual(adaptedFormData.recommended_features, ['Tremorsense', 'Cave Born']);
  assert.strictEqual(adaptedFormData.keywords, 'subterranean, mining, dark, enclosed');
  assert.strictEqual(adaptedFormData.negative_keywords, 'aquatic, aerial, zero-g');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'origins');
  assert.deepStrictEqual(exportedItem.recommended_species, ['Gorgon', 'Human (Base)']);
  assert.deepStrictEqual(exportedItem.recommended_factions, ['Mining Guild', 'Free Trade Consortium']);
  assert.deepStrictEqual(exportedItem.recommended_occupations, ['Miner', 'Heavy Engineer']);
  assert.deepStrictEqual(exportedItem.recommended_skills, ['Athletics', 'Alertness']);
  assert.deepStrictEqual(exportedItem.recommended_features, ['Tremorsense', 'Cave Born']);
  assert.strictEqual(exportedItem.keywords, 'subterranean, mining, dark, enclosed');
  assert.strictEqual(exportedItem.negative_keywords, 'aquatic, aerial, zero-g');

  // Verify backwards compatibility with comma-separated string for recommended_features
  const legacyItem = {
    id: 'origin-legacy',
    name: 'Legacy Habitat',
    recommended_features: 'Cave Born, Cold Tolerance'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'origins');
  assert.deepStrictEqual(adaptedLegacy.recommended_features, ['Cave Born', 'Cold Tolerance']);
});

test('Codex Mechanics Integrity: Occupations Architect Guidance & AI Reference Directives', () => {
  const occuMatrix = getMatrixById('occupations');
  assert.ok(occuMatrix, 'Occupations matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = occuMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_species'), 'Occupations must include recommended_species field');
  assert.ok(fieldNames.includes('recommended_factions'), 'Occupations must include recommended_factions field');
  assert.ok(fieldNames.includes('recommended_origins'), 'Occupations must include recommended_origins field');
  assert.ok(fieldNames.includes('recommended_skills'), 'Occupations must include recommended_skills field');
  assert.ok(fieldNames.includes('recommended_features'), 'Occupations must include recommended_features field');
  assert.ok(fieldNames.includes('keywords'), 'Occupations must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Occupations must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(occuMatrix.defaultValues.recommended_species, []);
  assert.deepStrictEqual(occuMatrix.defaultValues.recommended_factions, []);
  assert.deepStrictEqual(occuMatrix.defaultValues.recommended_origins, []);
  assert.deepStrictEqual(occuMatrix.defaultValues.recommended_skills, []);
  assert.deepStrictEqual(occuMatrix.defaultValues.recommended_features, []);
  assert.strictEqual(occuMatrix.defaultValues.keywords, '');
  assert.strictEqual(occuMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const occuCat = categoryConfig.occupations;
  assert.ok(occuCat, 'occupations must exist in categoryConfig');
  assert.ok(occuCat.fields?.recommended_species, 'categoryConfig.occupations must have recommended_species');
  assert.strictEqual(occuCat.fields?.recommended_species?.source, 'species');
  assert.ok(occuCat.fields?.recommended_factions, 'categoryConfig.occupations must have recommended_factions');
  assert.strictEqual(occuCat.fields?.recommended_factions?.source, 'factions');
  assert.ok(occuCat.fields?.recommended_origins, 'categoryConfig.occupations must have recommended_origins');
  assert.strictEqual(occuCat.fields?.recommended_origins?.source, 'origins');
  assert.ok(occuCat.fields?.recommended_skills, 'categoryConfig.occupations must have recommended_skills');
  assert.strictEqual(occuCat.fields?.recommended_skills?.source, 'skills');
  assert.ok(occuCat.fields?.recommended_features, 'categoryConfig.occupations must have recommended_features');
  assert.strictEqual(occuCat.fields?.recommended_features?.source, 'features');
  assert.ok(occuCat.fields?.keywords, 'categoryConfig.occupations must have keywords');
  assert.ok(occuCat.fields?.negative_keywords, 'categoryConfig.occupations must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'occupation-test',
    name: 'Covert Infiltrator',
    field: 'Underworld & Covert',
    recommended_species: ['Dar', 'Human (Base)'],
    recommended_factions: ['Shadow Syndicate', 'Free Trade Consortium'],
    recommended_origins: ['Deep Void & Station', 'Sprawl & Arcology'],
    recommended_skills: ['Stealth', 'Security'],
    recommended_features: ['Ghost Step', 'Backstab'],
    keywords: 'covert, tactical, cybernetic, infiltration',
    negative_keywords: 'brute force, heavy armor, primitive'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'occupations');
  assert.deepStrictEqual(adaptedFormData.recommended_species, ['Dar', 'Human (Base)']);
  assert.deepStrictEqual(adaptedFormData.recommended_factions, ['Shadow Syndicate', 'Free Trade Consortium']);
  assert.deepStrictEqual(adaptedFormData.recommended_origins, ['Deep Void & Station', 'Sprawl & Arcology']);
  assert.deepStrictEqual(adaptedFormData.recommended_skills, ['Stealth', 'Security']);
  assert.deepStrictEqual(adaptedFormData.recommended_features, ['Ghost Step', 'Backstab']);
  assert.strictEqual(adaptedFormData.keywords, 'covert, tactical, cybernetic, infiltration');
  assert.strictEqual(adaptedFormData.negative_keywords, 'brute force, heavy armor, primitive');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'occupations');
  assert.deepStrictEqual(exportedItem.recommended_species, ['Dar', 'Human (Base)']);
  assert.deepStrictEqual(exportedItem.recommended_factions, ['Shadow Syndicate', 'Free Trade Consortium']);
  assert.deepStrictEqual(exportedItem.recommended_origins, ['Deep Void & Station', 'Sprawl & Arcology']);
  assert.deepStrictEqual(exportedItem.recommended_skills, ['Stealth', 'Security']);
  assert.deepStrictEqual(exportedItem.recommended_features, ['Ghost Step', 'Backstab']);
  assert.strictEqual(exportedItem.keywords, 'covert, tactical, cybernetic, infiltration');
  assert.strictEqual(exportedItem.negative_keywords, 'brute force, heavy armor, primitive');

  // Verify backwards compatibility with comma-separated string for recommended_features
  const legacyItem = {
    id: 'occupation-legacy',
    name: 'Legacy Career',
    recommended_features: 'Quick Draw, Eagle Eye'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'occupations');
  assert.deepStrictEqual(adaptedLegacy.recommended_features, ['Quick Draw', 'Eagle Eye']);
});

test('Codex Mechanics Integrity: Skills Architect Guidance & AI Reference Directives', () => {
  const skillMatrix = getMatrixById('skills');
  assert.ok(skillMatrix, 'Skills matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = skillMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_tl'), 'Skills must include recommended_tl field');
  assert.ok(fieldNames.includes('recommended_ml'), 'Skills must include recommended_ml field');
  assert.ok(fieldNames.includes('keywords'), 'Skills must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Skills must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(skillMatrix.defaultValues.recommended_tl, []);
  assert.deepStrictEqual(skillMatrix.defaultValues.recommended_ml, []);
  assert.strictEqual(skillMatrix.defaultValues.keywords, '');
  assert.strictEqual(skillMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const skillCat = categoryConfig.skills;
  assert.ok(skillCat, 'skills must exist in categoryConfig');
  assert.ok(skillCat.fields?.recommended_tl, 'categoryConfig.skills must have recommended_tl');
  assert.strictEqual(skillCat.fields?.recommended_tl?.source, 'technology');
  assert.ok(skillCat.fields?.recommended_ml, 'categoryConfig.skills must have recommended_ml');
  assert.strictEqual(skillCat.fields?.recommended_ml?.source, 'meta_level');
  assert.ok(skillCat.fields?.keywords, 'categoryConfig.skills must have keywords');
  assert.ok(skillCat.fields?.negative_keywords, 'categoryConfig.skills must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'skill-astrogation',
    name: 'Astrogation',
    category: 'Technical',
    baseAttr: 'attr-intellect',
    recommended_tl: ['TL 3', 'TL 4', 'TL 5'],
    recommended_ml: ['ML 0', 'ML 1'],
    keywords: 'interstellar, hyperspace, navigation, coordinates',
    negative_keywords: 'melee, primitive, spiritual'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'skills');
  assert.deepStrictEqual(adaptedFormData.recommended_tl, ['TL 3', 'TL 4', 'TL 5']);
  assert.deepStrictEqual(adaptedFormData.recommended_ml, ['ML 0', 'ML 1']);
  assert.strictEqual(adaptedFormData.keywords, 'interstellar, hyperspace, navigation, coordinates');
  assert.strictEqual(adaptedFormData.negative_keywords, 'melee, primitive, spiritual');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'skills');
  assert.deepStrictEqual(exportedItem.recommended_tl, ['TL 3', 'TL 4', 'TL 5']);
  assert.deepStrictEqual(exportedItem.recommended_ml, ['ML 0', 'ML 1']);
  assert.strictEqual(exportedItem.keywords, 'interstellar, hyperspace, navigation, coordinates');
  assert.strictEqual(exportedItem.negative_keywords, 'melee, primitive, spiritual');

  // Verify backwards compatibility with comma-separated strings
  const legacyItem = {
    id: 'skill-legacy',
    name: 'Legacy Navigation',
    recommended_tl: 'TL 2, TL 3',
    recommended_ml: 'ML 0, ML 1'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'skills');
  assert.deepStrictEqual(adaptedLegacy.recommended_tl, ['TL 2', 'TL 3']);
  assert.deepStrictEqual(adaptedLegacy.recommended_ml, ['ML 0', 'ML 1']);
});

test('Codex Mechanics Integrity: Features Architect Guidance & AI Reference Directives', () => {
  const featureMatrix = getMatrixById('features');
  assert.ok(featureMatrix, 'Features matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = featureMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_tl'), 'Features must include recommended_tl field');
  assert.ok(fieldNames.includes('recommended_ml'), 'Features must include recommended_ml field');
  assert.ok(fieldNames.includes('keywords'), 'Features must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Features must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(featureMatrix.defaultValues.recommended_tl, []);
  assert.deepStrictEqual(featureMatrix.defaultValues.recommended_ml, []);
  assert.strictEqual(featureMatrix.defaultValues.keywords, '');
  assert.strictEqual(featureMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const featureCat = categoryConfig.features;
  assert.ok(featureCat, 'features must exist in categoryConfig');
  assert.ok(featureCat.fields?.recommended_tl, 'categoryConfig.features must have recommended_tl');
  assert.strictEqual(featureCat.fields?.recommended_tl?.source, 'technology');
  assert.ok(featureCat.fields?.recommended_ml, 'categoryConfig.features must have recommended_ml');
  assert.strictEqual(featureCat.fields?.recommended_ml?.source, 'meta_level');
  assert.ok(featureCat.fields?.keywords, 'categoryConfig.features must have keywords');
  assert.ok(featureCat.fields?.negative_keywords, 'categoryConfig.features must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'feature-neural-reflex',
    name: 'Neural Reflex Overdrive',
    type: 'combat',
    cp: 3,
    recommended_tl: ['TL 3', 'TL 4'],
    recommended_ml: ['ML 0', 'ML 1'],
    keywords: 'reflex, neural, cybernetic, combat, initiative',
    negative_keywords: 'primitive, magic, spiritual'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'features');
  assert.deepStrictEqual(adaptedFormData.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(adaptedFormData.recommended_ml, ['ML 0', 'ML 1']);
  assert.strictEqual(adaptedFormData.keywords, 'reflex, neural, cybernetic, combat, initiative');
  assert.strictEqual(adaptedFormData.negative_keywords, 'primitive, magic, spiritual');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'features');
  assert.deepStrictEqual(exportedItem.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(exportedItem.recommended_ml, ['ML 0', 'ML 1']);
  assert.strictEqual(exportedItem.keywords, 'reflex, neural, cybernetic, combat, initiative');
  assert.strictEqual(exportedItem.negative_keywords, 'primitive, magic, spiritual');

  // Verify backwards compatibility with comma-separated strings
  const legacyItem = {
    id: 'feature-legacy',
    name: 'Legacy Reflexes',
    recommended_tl: 'TL 2, TL 3',
    recommended_ml: 'ML 0, ML 1'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'features');
  assert.deepStrictEqual(adaptedLegacy.recommended_tl, ['TL 2', 'TL 3']);
  assert.deepStrictEqual(adaptedLegacy.recommended_ml, ['ML 0', 'ML 1']);
});

test('Codex Mechanics Integrity: Equipment / Gear Architect Guidance & AI Reference Directives', () => {
  const equipmentMatrix = getMatrixById('equipment');
  assert.ok(equipmentMatrix, 'Equipment matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = equipmentMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_tl'), 'Equipment must include recommended_tl field');
  assert.ok(fieldNames.includes('recommended_ml'), 'Equipment must include recommended_ml field');
  assert.ok(fieldNames.includes('keywords'), 'Equipment must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Equipment must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(equipmentMatrix.defaultValues.recommended_tl, []);
  assert.deepStrictEqual(equipmentMatrix.defaultValues.recommended_ml, []);
  assert.strictEqual(equipmentMatrix.defaultValues.keywords, '');
  assert.strictEqual(equipmentMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const gearCat = categoryConfig.gear;
  assert.ok(gearCat, 'gear must exist in categoryConfig');
  assert.ok(gearCat.fields?.recommended_tl, 'categoryConfig.gear must have recommended_tl');
  assert.strictEqual(gearCat.fields?.recommended_tl?.source, 'technology');
  assert.ok(gearCat.fields?.recommended_ml, 'categoryConfig.gear must have recommended_ml');
  assert.strictEqual(gearCat.fields?.recommended_ml?.source, 'meta_level');
  assert.ok(gearCat.fields?.keywords, 'categoryConfig.gear must have keywords');
  assert.ok(gearCat.fields?.negative_keywords, 'categoryConfig.gear must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'gear-multispectral-scanner',
    name: 'Multispectral Scanner Mk IV',
    category: 'Surveillance',
    tech_level: 3,
    meta_level: 0,
    recommended_tl: ['TL 2', 'TL 3', 'TL 4'],
    recommended_ml: ['ML 0'],
    keywords: 'recon, scanner, thermal, biosignature',
    negative_keywords: 'primitive, heavy armor, magical focus'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'equipment');
  assert.deepStrictEqual(adaptedFormData.recommended_tl, ['TL 2', 'TL 3', 'TL 4']);
  assert.deepStrictEqual(adaptedFormData.recommended_ml, ['ML 0']);
  assert.strictEqual(adaptedFormData.keywords, 'recon, scanner, thermal, biosignature');
  assert.strictEqual(adaptedFormData.negative_keywords, 'primitive, heavy armor, magical focus');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'equipment');
  assert.deepStrictEqual(exportedItem.recommended_tl, ['TL 2', 'TL 3', 'TL 4']);
  assert.deepStrictEqual(exportedItem.recommended_ml, ['ML 0']);
  assert.strictEqual(exportedItem.keywords, 'recon, scanner, thermal, biosignature');
  assert.strictEqual(exportedItem.negative_keywords, 'primitive, heavy armor, magical focus');

  // Verify backwards compatibility with comma-separated strings
  const legacyItem = {
    id: 'gear-legacy',
    name: 'Legacy Field Kit',
    recommended_tl: 'TL 1, TL 2, TL 3',
    recommended_ml: 'ML 0'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'equipment');
  assert.deepStrictEqual(adaptedLegacy.recommended_tl, ['TL 1', 'TL 2', 'TL 3']);
  assert.deepStrictEqual(adaptedLegacy.recommended_ml, ['ML 0']);
});

test('Codex Mechanics Integrity: Weaponry Architect Guidance & AI Reference Directives', () => {
  const weaponMatrix = getMatrixById('weaponry');
  assert.ok(weaponMatrix, 'Weaponry matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = weaponMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_tl'), 'Weaponry must include recommended_tl field');
  assert.ok(fieldNames.includes('recommended_ml'), 'Weaponry must include recommended_ml field');
  assert.ok(fieldNames.includes('keywords'), 'Weaponry must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Weaponry must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(weaponMatrix.defaultValues.recommended_tl, []);
  assert.deepStrictEqual(weaponMatrix.defaultValues.recommended_ml, []);
  assert.strictEqual(weaponMatrix.defaultValues.keywords, '');
  assert.strictEqual(weaponMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const weaponCat = categoryConfig.weaponry;
  assert.ok(weaponCat, 'weaponry must exist in categoryConfig');
  assert.ok(weaponCat.fields?.recommended_tl, 'categoryConfig.weaponry must have recommended_tl');
  assert.strictEqual(weaponCat.fields?.recommended_tl?.source, 'technology');
  assert.ok(weaponCat.fields?.recommended_ml, 'categoryConfig.weaponry must have recommended_ml');
  assert.strictEqual(weaponCat.fields?.recommended_ml?.source, 'meta_level');
  assert.ok(weaponCat.fields?.keywords, 'categoryConfig.weaponry must have keywords');
  assert.ok(weaponCat.fields?.negative_keywords, 'categoryConfig.weaponry must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'wpn-plasma-carbine',
    name: 'Apex-7 Plasma Carbine',
    classification: 'Ranged (Energy)',
    tech_level: 3,
    meta_level: 0,
    recommended_tl: ['TL 2', 'TL 3', 'TL 4'],
    recommended_ml: ['ML 0'],
    keywords: 'energy, plasma, carbine, rapid fire, thermal burn',
    negative_keywords: 'pacifist, non-lethal, primitive, acoustic'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'weaponry');
  assert.deepStrictEqual(adaptedFormData.recommended_tl, ['TL 2', 'TL 3', 'TL 4']);
  assert.deepStrictEqual(adaptedFormData.recommended_ml, ['ML 0']);
  assert.strictEqual(adaptedFormData.keywords, 'energy, plasma, carbine, rapid fire, thermal burn');
  assert.strictEqual(adaptedFormData.negative_keywords, 'pacifist, non-lethal, primitive, acoustic');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'weaponry');
  assert.deepStrictEqual(exportedItem.recommended_tl, ['TL 2', 'TL 3', 'TL 4']);
  assert.deepStrictEqual(exportedItem.recommended_ml, ['ML 0']);
  assert.strictEqual(exportedItem.keywords, 'energy, plasma, carbine, rapid fire, thermal burn');
  assert.strictEqual(exportedItem.negative_keywords, 'pacifist, non-lethal, primitive, acoustic');

  // Verify backwards compatibility with comma-separated strings
  const legacyItem = {
    id: 'weapon-legacy',
    name: 'Legacy Rail Pistol',
    recommended_tl: 'TL 2, TL 3',
    recommended_ml: 'ML 0, ML 1'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'weaponry');
  assert.deepStrictEqual(adaptedLegacy.recommended_tl, ['TL 2', 'TL 3']);
  assert.deepStrictEqual(adaptedLegacy.recommended_ml, ['ML 0', 'ML 1']);
});

test('Codex Mechanics Integrity: Armoring Architect Guidance & AI Reference Directives', () => {
  const armorMatrix = getMatrixById('armor');
  assert.ok(armorMatrix, 'Armor matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = armorMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_tl'), 'Armor must include recommended_tl field');
  assert.ok(fieldNames.includes('recommended_ml'), 'Armor must include recommended_ml field');
  assert.ok(fieldNames.includes('keywords'), 'Armor must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Armor must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(armorMatrix.defaultValues.recommended_tl, []);
  assert.deepStrictEqual(armorMatrix.defaultValues.recommended_ml, []);
  assert.strictEqual(armorMatrix.defaultValues.keywords, '');
  assert.strictEqual(armorMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const armorCat = categoryConfig.armoring;
  assert.ok(armorCat, 'armoring must exist in categoryConfig');
  assert.ok(armorCat.fields?.recommended_tl, 'categoryConfig.armoring must have recommended_tl');
  assert.strictEqual(armorCat.fields?.recommended_tl?.source, 'technology');
  assert.ok(armorCat.fields?.recommended_ml, 'categoryConfig.armoring must have recommended_ml');
  assert.strictEqual(armorCat.fields?.recommended_ml?.source, 'meta_level');
  assert.ok(armorCat.fields?.keywords, 'categoryConfig.armoring must have keywords');
  assert.ok(armorCat.fields?.negative_keywords, 'categoryConfig.armoring must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'armor-aegis-tactical-rig',
    name: 'Aegis Mk VII Tactical Plate',
    category: 'armoring',
    tech_level: 4,
    meta_level: 0,
    dr: 18,
    durability: '45',
    recommended_tl: ['TL 3', 'TL 4'],
    recommended_ml: ['ML 0', 'ML 1'],
    keywords: 'heavy plate, ablative, kinetic dispersion, powered harness',
    negative_keywords: 'lightweight, stealth infiltration, primitive'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'armor');
  assert.deepStrictEqual(adaptedFormData.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(adaptedFormData.recommended_ml, ['ML 0', 'ML 1']);
  assert.strictEqual(adaptedFormData.keywords, 'heavy plate, ablative, kinetic dispersion, powered harness');
  assert.strictEqual(adaptedFormData.negative_keywords, 'lightweight, stealth infiltration, primitive');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'armor');
  assert.deepStrictEqual(exportedItem.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(exportedItem.recommended_ml, ['ML 0', 'ML 1']);
  assert.strictEqual(exportedItem.keywords, 'heavy plate, ablative, kinetic dispersion, powered harness');
  assert.strictEqual(exportedItem.negative_keywords, 'lightweight, stealth infiltration, primitive');

  // Also verify using targetCollection 'armoring'
  const adaptedByCollection = adaptItemToCodexFormData(rawItem, 'armoring');
  assert.deepStrictEqual(adaptedByCollection.recommended_tl, ['TL 3', 'TL 4']);
  assert.strictEqual(adaptedByCollection.keywords, 'heavy plate, ablative, kinetic dispersion, powered harness');

  // Verify backwards compatibility with comma-separated strings
  const legacyItem = {
    id: 'armor-legacy',
    name: 'Legacy Weave Vest',
    recommended_tl: 'TL 2, TL 3',
    recommended_ml: 'ML 0'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'armor');
  assert.deepStrictEqual(adaptedLegacy.recommended_tl, ['TL 2', 'TL 3']);
  assert.deepStrictEqual(adaptedLegacy.recommended_ml, ['ML 0']);
});

test('Codex Mechanics Integrity: Augmentations Architect Guidance & AI Reference Directives', () => {
  const augMatrix = getMatrixById('augmentations');
  assert.ok(augMatrix, 'Augmentations matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = augMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_tl'), 'Augmentations must include recommended_tl field');
  assert.ok(fieldNames.includes('recommended_ml'), 'Augmentations must include recommended_ml field');
  assert.ok(fieldNames.includes('keywords'), 'Augmentations must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Augmentations must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(augMatrix.defaultValues.recommended_tl, []);
  assert.deepStrictEqual(augMatrix.defaultValues.recommended_ml, []);
  assert.strictEqual(augMatrix.defaultValues.keywords, '');
  assert.strictEqual(augMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const augCat = categoryConfig.augmentations;
  assert.ok(augCat, 'augmentations must exist in categoryConfig');
  assert.ok(augCat.fields?.recommended_tl, 'categoryConfig.augmentations must have recommended_tl');
  assert.strictEqual(augCat.fields?.recommended_tl?.source, 'technology');
  assert.ok(augCat.fields?.recommended_ml, 'categoryConfig.augmentations must have recommended_ml');
  assert.strictEqual(augCat.fields?.recommended_ml?.source, 'meta_level');
  assert.ok(augCat.fields?.keywords, 'categoryConfig.augmentations must have keywords');
  assert.ok(augCat.fields?.negative_keywords, 'categoryConfig.augmentations must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'aug-synaptic-accelerator',
    name: 'Apex-9 Synaptic Accelerator',
    category: 'brain',
    tech_level: 4,
    meta_level: 0,
    recommended_tl: ['TL 4', 'TL 5'],
    recommended_ml: ['ML 0', 'ML 1'],
    keywords: 'neural coprocessor, reflex, initiative, overclock, cybernetic',
    negative_keywords: 'biological purist, primitive, low tech, unaugmented'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'augmentations');
  assert.deepStrictEqual(adaptedFormData.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(adaptedFormData.recommended_ml, ['ML 0', 'ML 1']);
  assert.strictEqual(adaptedFormData.keywords, 'neural coprocessor, reflex, initiative, overclock, cybernetic');
  assert.strictEqual(adaptedFormData.negative_keywords, 'biological purist, primitive, low tech, unaugmented');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'augmentations');
  assert.deepStrictEqual(exportedItem.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(exportedItem.recommended_ml, ['ML 0', 'ML 1']);
  assert.strictEqual(exportedItem.keywords, 'neural coprocessor, reflex, initiative, overclock, cybernetic');
  assert.strictEqual(exportedItem.negative_keywords, 'biological purist, primitive, low tech, unaugmented');

  // Verify backwards compatibility with comma-separated strings
  const legacyItem = {
    id: 'aug-legacy',
    name: 'Legacy Adrenal Booster',
    recommended_tl: 'TL 3, TL 4',
    recommended_ml: 'ML 0'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'augmentations');
  assert.deepStrictEqual(adaptedLegacy.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(adaptedLegacy.recommended_ml, ['ML 0']);
});

test('Codex Mechanics Integrity: Mecha Architect Guidance & AI Reference Directives', () => {
  const mechaMatrix = getMatrixById('mecha');
  assert.ok(mechaMatrix, 'Mecha matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = mechaMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_tl'), 'Mecha must include recommended_tl field');
  assert.ok(fieldNames.includes('recommended_ml'), 'Mecha must include recommended_ml field');
  assert.ok(fieldNames.includes('keywords'), 'Mecha must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Mecha must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(mechaMatrix.defaultValues.recommended_tl, []);
  assert.deepStrictEqual(mechaMatrix.defaultValues.recommended_ml, []);
  assert.strictEqual(mechaMatrix.defaultValues.keywords, '');
  assert.strictEqual(mechaMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const mechaCat = categoryConfig.mecha;
  assert.ok(mechaCat, 'mecha must exist in categoryConfig');
  assert.ok(mechaCat.fields?.recommended_tl, 'categoryConfig.mecha must have recommended_tl');
  assert.strictEqual(mechaCat.fields?.recommended_tl?.source, 'technology');
  assert.ok(mechaCat.fields?.recommended_ml, 'categoryConfig.mecha must have recommended_ml');
  assert.strictEqual(mechaCat.fields?.recommended_ml?.source, 'meta_level');
  assert.ok(mechaCat.fields?.keywords, 'categoryConfig.mecha must have keywords');
  assert.ok(mechaCat.fields?.negative_keywords, 'categoryConfig.mecha must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'mecha-centurion',
    name: 'Centurion Mk-IV Assault Frame',
    size: 'Large',
    frame: 'Humanoid',
    tech_level: 3,
    meta_level: 0,
    recommended_tl: ['TL 3', 'TL 4'],
    recommended_ml: ['ML 0'],
    keywords: 'heavy walker, frontline armor, bipedal, siege, jump jets',
    negative_keywords: 'stealth, civilian, aquatic, ultra-light recon'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'mecha');
  assert.deepStrictEqual(adaptedFormData.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(adaptedFormData.recommended_ml, ['ML 0']);
  assert.strictEqual(adaptedFormData.keywords, 'heavy walker, frontline armor, bipedal, siege, jump jets');
  assert.strictEqual(adaptedFormData.negative_keywords, 'stealth, civilian, aquatic, ultra-light recon');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'mecha');
  assert.deepStrictEqual(exportedItem.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(exportedItem.recommended_ml, ['ML 0']);
  assert.strictEqual(exportedItem.keywords, 'heavy walker, frontline armor, bipedal, siege, jump jets');
  assert.strictEqual(exportedItem.negative_keywords, 'stealth, civilian, aquatic, ultra-light recon');

  // Verify vehicles matrix alias
  const adaptedVeh = adaptItemToCodexFormData(rawItem, 'vehicles');
  assert.deepStrictEqual(adaptedVeh.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(adaptedVeh.recommended_ml, ['ML 0']);

  // Verify backwards compatibility with comma-separated strings
  const legacyItem = {
    id: 'mecha-legacy',
    name: 'Legacy Titan Frame',
    recommended_tl: 'TL 3, TL 4',
    recommended_ml: 'ML 0'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'mecha');
  assert.deepStrictEqual(adaptedLegacy.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(adaptedLegacy.recommended_ml, ['ML 0']);
});

test('Codex Mechanics Integrity: Architecture Architect Guidance & AI Reference Directives', () => {
  const archMatrix = getMatrixById('architecture');
  assert.ok(archMatrix, 'Architecture matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = archMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_tl'), 'Architecture must include recommended_tl field');
  assert.ok(fieldNames.includes('recommended_ml'), 'Architecture must include recommended_ml field');
  assert.ok(fieldNames.includes('keywords'), 'Architecture must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Architecture must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(archMatrix.defaultValues.recommended_tl, []);
  assert.deepStrictEqual(archMatrix.defaultValues.recommended_ml, []);
  assert.strictEqual(archMatrix.defaultValues.keywords, '');
  assert.strictEqual(archMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const archCat = categoryConfig.architecture;
  assert.ok(archCat, 'architecture must exist in categoryConfig');
  assert.ok(archCat.fields?.recommended_tl, 'categoryConfig.architecture must have recommended_tl');
  assert.strictEqual(archCat.fields?.recommended_tl?.source, 'technology');
  assert.ok(archCat.fields?.recommended_ml, 'categoryConfig.architecture must have recommended_ml');
  assert.strictEqual(archCat.fields?.recommended_ml?.source, 'meta_level');
  assert.ok(archCat.fields?.keywords, 'categoryConfig.architecture must have keywords');
  assert.ok(archCat.fields?.negative_keywords, 'categoryConfig.architecture must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'arch-aegis-spire',
    name: 'Aegis Spire Orbital Station',
    style: 'Modular High-Tech',
    footprint: 'Colossal',
    height_class: 'Skyscraper',
    stories: 120,
    tech_level: 4,
    meta_level: 0,
    recommended_tl: ['TL 4', 'TL 5'],
    recommended_ml: ['ML 0'],
    keywords: 'orbital station, defense citadel, trade nexus, sealed habitat, vacuum',
    negative_keywords: 'fragile, makeshift, portable, personal mobility, open-air'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'architecture');
  assert.deepStrictEqual(adaptedFormData.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(adaptedFormData.recommended_ml, ['ML 0']);
  assert.strictEqual(adaptedFormData.keywords, 'orbital station, defense citadel, trade nexus, sealed habitat, vacuum');
  assert.strictEqual(adaptedFormData.negative_keywords, 'fragile, makeshift, portable, personal mobility, open-air');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'architecture');
  assert.deepStrictEqual(exportedItem.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(exportedItem.recommended_ml, ['ML 0']);
  assert.strictEqual(exportedItem.keywords, 'orbital station, defense citadel, trade nexus, sealed habitat, vacuum');
  assert.strictEqual(exportedItem.negative_keywords, 'fragile, makeshift, portable, personal mobility, open-air');

  // Verify facilities / stations aliases
  const adaptedFacility = adaptItemToCodexFormData(rawItem, 'facilities');
  assert.deepStrictEqual(adaptedFacility.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(adaptedFacility.recommended_ml, ['ML 0']);

  // Verify backwards compatibility with comma-separated strings
  const legacyItem = {
    id: 'arch-legacy',
    name: 'Legacy Outpost',
    recommended_tl: 'TL 3, TL 4',
    recommended_ml: 'ML 0'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'architecture');
  assert.deepStrictEqual(adaptedLegacy.recommended_tl, ['TL 3', 'TL 4']);
  assert.deepStrictEqual(adaptedLegacy.recommended_ml, ['ML 0']);
});

test('Codex Mechanics Integrity: Other Property Architect Guidance & AI Reference Directives', () => {
  const otherMatrix = getMatrixById('other');
  assert.ok(otherMatrix, 'Other matrix must exist');

  // Verify fields in codexConfig
  const fieldNames = otherMatrix.fields.map(f => f.name);
  assert.ok(fieldNames.includes('recommended_tl'), 'Other Property must include recommended_tl field');
  assert.ok(fieldNames.includes('recommended_ml'), 'Other Property must include recommended_ml field');
  assert.ok(fieldNames.includes('keywords'), 'Other Property must include keywords field');
  assert.ok(fieldNames.includes('negative_keywords'), 'Other Property must include negative_keywords field');

  // Verify defaultValues in codexConfig
  assert.deepStrictEqual(otherMatrix.defaultValues.recommended_tl, []);
  assert.deepStrictEqual(otherMatrix.defaultValues.recommended_ml, []);
  assert.strictEqual(otherMatrix.defaultValues.keywords, '');
  assert.strictEqual(otherMatrix.defaultValues.negative_keywords, '');

  // Verify categoryConfig
  const otherCat = categoryConfig.other;
  assert.ok(otherCat, 'other must exist in categoryConfig');
  assert.ok(otherCat.fields?.recommended_tl, 'categoryConfig.other must have recommended_tl');
  assert.strictEqual(otherCat.fields?.recommended_tl?.source, 'technology');
  assert.ok(otherCat.fields?.recommended_ml, 'categoryConfig.other must have recommended_ml');
  assert.strictEqual(otherCat.fields?.recommended_ml?.source, 'meta_level');
  assert.ok(otherCat.fields?.keywords, 'categoryConfig.other must have keywords');
  assert.ok(otherCat.fields?.negative_keywords, 'categoryConfig.other must have negative_keywords');

  // Verify adaptation round-trip via codexAssetBridge (array input)
  const rawItem = {
    id: 'other-canister',
    name: 'Emergency Atmospheric Scrubbing Canister',
    category: 'Consumables',
    weight: 0.8,
    tech_level: 2,
    meta_level: 0,
    recommended_tl: ['TL 2', 'TL 3'],
    recommended_ml: ['ML 0'],
    keywords: 'life support, atmospheric, emergency, consumable, canister',
    negative_keywords: 'permanent installation, heavy armor, weaponized'
  };

  const adaptedFormData = adaptItemToCodexFormData(rawItem, 'other');
  assert.deepStrictEqual(adaptedFormData.recommended_tl, ['TL 2', 'TL 3']);
  assert.deepStrictEqual(adaptedFormData.recommended_ml, ['ML 0']);
  assert.strictEqual(adaptedFormData.keywords, 'life support, atmospheric, emergency, consumable, canister');
  assert.strictEqual(adaptedFormData.negative_keywords, 'permanent installation, heavy armor, weaponized');

  const exportedItem = adaptCodexToOmnicortexItem(adaptedFormData, 'other');
  assert.deepStrictEqual(exportedItem.recommended_tl, ['TL 2', 'TL 3']);
  assert.deepStrictEqual(exportedItem.recommended_ml, ['ML 0']);
  assert.strictEqual(exportedItem.keywords, 'life support, atmospheric, emergency, consumable, canister');
  assert.strictEqual(exportedItem.negative_keywords, 'permanent installation, heavy armor, weaponized');

  // Verify other_property and commodities aliases
  const adaptedCommodity = adaptItemToCodexFormData(rawItem, 'commodities');
  assert.deepStrictEqual(adaptedCommodity.recommended_tl, ['TL 2', 'TL 3']);
  assert.deepStrictEqual(adaptedCommodity.recommended_ml, ['ML 0']);

  // Verify backwards compatibility with comma-separated strings
  const legacyItem = {
    id: 'other-legacy',
    name: 'Legacy Rations',
    recommended_tl: 'TL 1, TL 2',
    recommended_ml: 'ML 0'
  };
  const adaptedLegacy = adaptItemToCodexFormData(legacyItem, 'other');
  assert.deepStrictEqual(adaptedLegacy.recommended_tl, ['TL 1', 'TL 2']);
  assert.deepStrictEqual(adaptedLegacy.recommended_ml, ['ML 0']);
});