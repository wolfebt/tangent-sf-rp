import test from 'node:test';
import assert from 'node:assert/strict';
import { runMonteCarloEncounterSim } from '../../services/encounterSimService.js';

test('Tangent SFF RP — Predictive Monte Carlo Encounter Balancer Service', async (t) => {
  await t.test('runMonteCarloEncounterSim handles empty party or enemies cleanly', () => {
    const emptyResult = runMonteCarloEncounterSim([], []);
    assert.equal(emptyResult.winRate, 100);
    assert.equal(emptyResult.iterations, 0);
  });

  await t.test('runMonteCarloEncounterSim correctly forecasts high win rate for overpowering party', () => {
    const strongParty = [
      { id: 'h1', label: 'Veteran Sentinel', health: { current: 50, max: 50 }, defense: 15, attackMod: 8, avgDamage: 18, armorDr: 5, toughness: 4 },
      { id: 'h2', label: 'Master Gunner', health: { current: 40, max: 40 }, defense: 14, attackMod: 9, avgDamage: 20, armorDr: 4, toughness: 3 }
    ];

    const weakMinion = [
      { id: 'e1', label: 'Scavenger Minion', health: { current: 15, max: 15 }, defense: 10, attackMod: 2, avgDamage: 5, armorDr: 0, toughness: 0 }
    ];

    const sim = runMonteCarloEncounterSim(strongParty, weakMinion, 100);

    assert.equal(sim.iterations, 100);
    assert.ok(sim.winRate >= 95, `Expected >= 95% win rate, got ${sim.winRate}%`);
    assert.equal(sim.threatTier, 'Trivial');
    assert.ok(sim.avgRounds <= 2.5);
  });

  await t.test('runMonteCarloEncounterSim correctly forecasts challenging / deadly threat for overwhelming boss', () => {
    const noviceParty = [
      { id: 'h1', label: 'Novice Jax', health: { current: 25, max: 25 }, defense: 11, attackMod: 3, avgDamage: 7, armorDr: 1, toughness: 1 }
    ];

    const dreadnoughtBoss = [
      { id: 'boss', label: 'Tier 4 Apex Boss', health: { current: 120, max: 120 }, defense: 18, attackMod: 12, avgDamage: 25, armorDr: 8, toughness: 6 },
      { id: 'escort', label: 'Bruiser Escort', health: { current: 50, max: 50 }, defense: 14, attackMod: 6, avgDamage: 12, armorDr: 4, toughness: 3 }
    ];

    const sim = runMonteCarloEncounterSim(noviceParty, dreadnoughtBoss, 100);

    assert.equal(sim.iterations, 100);
    assert.ok(sim.winRate <= 25, `Expected <= 25% win rate against apex boss, got ${sim.winRate}%`);
    assert.equal(sim.threatTier, 'Deadly');
  });
});
