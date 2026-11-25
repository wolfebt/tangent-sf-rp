/**
 * @file waveCP2Depth.test.mjs
 * @description Wave C (P2) Planned Depth & Runtime AI Regression Suite:
 *   1. ELEMENT_SCHEMAS exposes full ELEMENTS.md fields + Stage 4 tactical keys across compressed types
 *   2. decideAutonomousAction FSM evaluates morale break, rival targeting, sniper aimed shot, boss AoE, and patrol
 *   3. normalizeElementType normalizes brainstorm/ingestion type labels cleanly
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { ELEMENT_SCHEMAS, normalizeElementType } from '../../src/pages/Foundry/ElementForge/elementSchemas.js';
import { decideAutonomousAction } from '../../src/services/unitBehaviorService.js';

const getKeys = (type) => new Set((ELEMENT_SCHEMAS[type] || []).map((f) => f.key));

test('1. ELEMENT_SCHEMAS exposes expanded ELEMENTS.md fields & Stage 4 tactical keys', () => {
  const universeKeys = getKeys('Universe');
  for (const k of ['designation', 'ontological', 'lawsPhysics', 'natureMagic', 'cosmological', 'creation', 'entities', 'interplanar', 'centralQuestion', 'primaryTriggers']) {
    assert.ok(universeKeys.has(k), `Universe missing key: ${k}`);
  }

  const handoutKeys = getKeys('Handout');
  for (const k of ['handoutType', 'sourceOrigin', 'inUniverseText', 'analysisSkill', 'analysisCr', 'highDegreeBonus', 'gmNotes', 'primaryTriggers']) {
    assert.ok(handoutKeys.has(k), `Handout missing key: ${k}`);
  }

  const mapKeys = getKeys('Map');
  for (const k of ['dimensions', 'gridScale', 'terrainBiomes', 'lightingConditions', 'pairedMapId', 'weatherPreset', 'hazardCr', 'gmNotes']) {
    assert.ok(mapKeys.has(k), `Map missing key: ${k}`);
  }

  const clueKeys = getKeys('Clue');
  for (const k of ['information', 'analysisSkill', 'analysisCr', 'highDegreeBonus', 'gmNotes']) {
    assert.ok(clueKeys.has(k), `Clue missing key: ${k}`);
  }

  for (const arcType of ['Story Arc', 'Adventure', 'Encounter']) {
    const kSet = getKeys(arcType);
    for (const k of ['storyFlagKey', 'clockGoal', 'hazardCr', 'gmNotes']) {
      assert.ok(kSet.has(k), `${arcType} missing Stage 4 key: ${k}`);
    }
  }

  const philoKeys = getKeys('Philosophy');
  for (const k of ['coreQuestion', 'freeWill', 'truthEpistemology', 'ritualsPractices', 'symbolsIconography', 'influenceSociety']) {
    assert.ok(philoKeys.has(k), `Philosophy missing key: ${k}`);
  }

  for (const locType of ['World', 'Setting', 'Scene']) {
    const kSet = getKeys(locType);
    for (const k of ['pairedMapId', 'weatherPreset', 'hazardCr']) {
      assert.ok(kSet.has(k), `${locType} missing Stage 4 location key: ${k}`);
    }
  }

  for (const entType of ['Faction', 'Species']) {
    const kSet = getKeys(entType);
    assert.ok(kSet.has('disposition'), `${entType} missing disposition`);
    assert.ok(kSet.has('gmNotes'), `${entType} missing gmNotes`);
  }
});

test('2. decideAutonomousAction FSM plans sniper, morale break, boss AoE, rival targeting, and patrol', () => {
  const sniperRes = decideAutonomousAction(
    { id: 'u_sniper', label: 'Ghost Marksman', behaviorProfile: 'sniper', x: 100, y: 100, health: { current: 20, max: 20 } },
    [
      { id: 'h1', label: 'Tank', armorDr: 12, x: 200, y: 100 },
      { id: 'h2', label: 'Slicer', armorDr: 2, x: 300, y: 100 }
    ]
  );
  assert.equal(sniperRes.status, 'action_ready');
  assert.equal(sniperRes.targetId, 'h2');
  assert.equal(sniperRes.actionType, 'aimed_sniper_shot');
  assert.equal(sniperRes.hitLocation, 'head');

  const brokenRes = decideAutonomousAction(
    { id: 'u_skirm', label: 'Raider', behaviorProfile: 'survivalist', health: { current: 4, max: 20 } },
    [{ id: 'h1', label: 'Op', x: 50, y: 50 }]
  );
  assert.equal(brokenRes.status, 'morale_broken');
  assert.equal(brokenRes.isRetreating, true);

  const bossRes = decideAutonomousAction(
    { id: 'u_boss', label: 'Core Warden', behaviorProfile: 'boss', health: { current: 20, max: 100 } },
    [{ id: 'h1', label: 'Op', health: { current: 10 }, x: 120, y: 120 }]
  );
  assert.equal(bossRes.actionType, 'aoe_meltdown');
  assert.equal(bossRes.isAoE, true);

  const patrolRes = decideAutonomousAction({ id: 'u_idle', label: 'Sentry' }, []);
  assert.equal(patrolRes.status, 'idle');
  assert.equal(patrolRes.actionType, 'wait');
});

test('3. normalizeElementType maps canonical and legacy labels cleanly', () => {
  assert.equal(normalizeElementType('Technology'), 'Property');
  assert.equal(normalizeElementType('Invocation'), 'Metaphysics');
  assert.equal(normalizeElementType('Persona Maker'), 'Persona');
  assert.equal(normalizeElementType('World Anvil'), 'World');
});
