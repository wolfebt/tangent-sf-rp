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
  const propertyMatrices = ['weaponry', 'armor', 'equipment', 'mecha', 'architecture', 'augmentations', 'meta-tech'];
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
  assert.strictEqual(hasDamageOrEffect('factions'), false, 'Factions must not have critical details');
  assert.strictEqual(hasDamageOrEffect('species'), false, 'Species must not have critical details');

  assert.strictEqual(categoryConfig.augmentations?.fields?.critical_details, undefined, 'augmentations must not have critical_details');
  assert.strictEqual(categoryConfig.armoring?.fields?.critical_details, undefined, 'armoring must not have critical_details');
});