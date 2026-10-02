/**
 * @file adeEngineBridge.test.mjs
 * @description Unit tests for ADE Engine Bridge (Rules, Monte Carlo Sim, CRONICLE Recap, and Objectives).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  validateUniverseRules, 
  simulateScenarioEncounter, 
  synthesizeRecapFromCronicle, 
  evaluateObjectivesForScenario 
} from '../../src/services/ade/adeEngineBridge.ts';

test('adeEngineBridge: validateUniverseRules returns canonical telemetry', () => {
  const emptyUniverse = { scenarios: [], maps: [] };
  const resEmpty = validateUniverseRules(emptyUniverse, []);
  assert.ok(resEmpty.score < 100, 'Empty universe should have reduced health score');
  assert.ok(resEmpty.issues.length > 0, 'Empty universe should flag issues');

  const healthyUniverse = {
    scenarios: [
      { id: 'sc-1', title: 'The Breach', content: 'Detailed narrative description of the orbital breach zone.' }
    ],
    maps: [{ id: 'map-1', title: 'Orbital Hangar' }]
  };
  const healthyElements = [
    { id: 'elem-1', title: 'Commander Vex', type: 'Persona' },
    { id: 'elem-2', title: 'Ambush at Hangar', type: 'Encounter', fields: { threatMatrix: 'standard' } }
  ];
  const resHealthy = validateUniverseRules(healthyUniverse, healthyElements);
  assert.equal(resHealthy.score, 100);
  assert.equal(resHealthy.issues.length, 0);
});

test('adeEngineBridge: simulateScenarioEncounter performs Monte Carlo forecasting', () => {
  const scenarioNode = {
    title: 'Hangar Skirmish',
    fields: {
      adversaries: [
        { id: 'adv-1', label: 'Security Sentry', hp: 15, defense: 10, tier: 1 }
      ]
    }
  };

  const sim = simulateScenarioEncounter(scenarioNode);
  assert.equal(typeof sim.winRate, 'number');
  assert.ok(sim.winRate >= 0 && sim.winRate <= 100);
  assert.equal(typeof sim.avgRounds, 'number');
  assert.ok(sim.avgRounds >= 1);
  assert.ok(['Trivial', 'Standard', 'Challenging', 'Deadly'].includes(sim.threatTier));
});

test('adeEngineBridge: synthesizeRecapFromCronicle formats Markdown summary', () => {
  const cronicleHistory = [
    { author: 'Architect', target: 'Security Hub', action: 'state_override', explanation: 'Security terminal sliced.' },
    { author: 'Operative', target: 'Airlock 3', action: 'checkpoint', explanation: 'Airlock breached.' }
  ];

  const recapMd = synthesizeRecapFromCronicle(cronicleHistory, 'Operation Blackout');
  assert.ok(recapMd.includes('Mission Debrief & Episodic Recap: Operation Blackout'));
  assert.ok(recapMd.includes('Security terminal sliced.'));
});

test('adeEngineBridge: evaluateObjectivesForScenario assesses mission states', () => {
  const objectives = [
    { id: 'obj-1', title: 'Eliminate Commander', type: 'assassination', targetTokenId: 'boss-1' }
  ];
  const tokens = [
    { id: 'boss-1', label: 'Commander', isDead: true, hp: { current: 0 } }
  ];

  const results = evaluateObjectivesForScenario(objectives, tokens, 1);
  assert.equal(results.evaluations.length, 1);
  assert.equal(results.evaluations[0].isComplete, true);
  assert.equal(results.allPrimaryComplete, true);
});
