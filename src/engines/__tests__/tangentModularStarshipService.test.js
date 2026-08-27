import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_CHASSIS,
  CANONICAL_HARDPOINTS,
  CANONICAL_SUBSYSTEMS,
  computeVesselStats
} from '../../services/modularStarshipService.js';

test('Tangent SFF RP — Modular Starship & Mecha Hardpoint Forge Service', async (t) => {
  await t.test('Canonical chassis, hardpoints, and subsystems integrity', () => {
    assert.equal(CANONICAL_CHASSIS.length, 4);
    assert.equal(CANONICAL_HARDPOINTS.length, 5);
    assert.equal(CANONICAL_SUBSYSTEMS.length, 5);

    const corvette = CANONICAL_CHASSIS.find(c => c.id === 'strike_corvette_200');
    assert.ok(corvette);
    assert.equal(corvette.baseHullSp, 80);
    assert.equal(corvette.maxHardpoints, 4);
    assert.equal(corvette.reactorOutputMw, 110);
  });

  await t.test('computeVesselStats computes correct energy, defense, and shield capacity', () => {
    // Install Twin Turbo-Laser (20 MW) + Deflector Shields (25 MW, +30 SP) on Corvette (110 MW base)
    const stats = computeVesselStats(
      'strike_corvette_200',
      ['twin_turbo_laser'],
      ['deflector_shields', 'reinforced_armor_plating']
    );

    assert.equal(stats.totalEnergyUsedMw, 45); // 20 + 25
    assert.equal(stats.maxReactorOutputMw, 110);
    assert.equal(stats.powerMarginMw, 65); // 110 - 45
    assert.equal(stats.isPowerDeficit, false);
    assert.equal(stats.totalShieldSp, 30);
    assert.equal(stats.totalArmorDr, 6); // 4 base + 2 composite
    assert.equal(stats.totalHullSp, 100); // 80 base + 20 composite
    assert.equal(stats.hardpointSlotsUsed, 1);
  });

  await t.test('computeVesselStats flags isPowerDeficit when energy exceeds reactor output', () => {
    // Scout Sloop has 60 MW. Install 2x Particle Lance (35 MW each = 70 MW)
    const stats = computeVesselStats(
      'scout_sloop_100',
      ['spinal_particle_lance', 'spinal_particle_lance'],
      ['deflector_shields'] // +25 MW -> Total = 95 MW
    );

    assert.equal(stats.totalEnergyUsedMw, 95);
    assert.equal(stats.isPowerDeficit, true);
    assert.ok(stats.powerMarginMw < 0);
  });
});
