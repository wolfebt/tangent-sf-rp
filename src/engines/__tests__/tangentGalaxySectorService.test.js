import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_SECTORS,
  generateSectorStarmap,
  calculateHyperspaceJumpRoute
} from '../../services/galaxySectorService.js';

test('Tangent SFF RP — Interactive Galaxy Sector & Planetary Starmap Service', async (t) => {
  await t.test('Canonical sectors integrity and metadata', () => {
    assert.ok(CANONICAL_SECTORS.length >= 3);
    const core = CANONICAL_SECTORS.find(s => s.id === 'hyperion_core');
    assert.ok(core);
    assert.equal(core.dominantFaction, 'TSC Sovereign Directorate');
  });

  await t.test('generateSectorStarmap generates star systems, UWP codes, and jump lanes', () => {
    const starmap = generateSectorStarmap('hyperion_core', 101);

    assert.ok(starmap.systems.length >= 8);
    assert.ok(starmap.jumpLanes.length > 0);

    const firstSys = starmap.systems[0];
    assert.ok(firstSys.name);
    assert.ok(firstSys.uwp);
    assert.ok(firstSys.starColor);
    assert.ok(firstSys.poi);
    assert.ok(typeof firstSys.techLevel === 'number');
  });

  await t.test('calculateHyperspaceJumpRoute calculates parsec distance, reachability, and fuel', () => {
    const origin = { name: 'Helios Prime', gridX: 1, gridY: 1 };
    const nearby = { name: 'Vanguard Station', gridX: 2, gridY: 2 };
    const distant = { name: 'Onyx Void', gridX: 7, gridY: 7 };

    // 1. Nearby jump (Distance ~1.4 -> 1 Parsec)
    const shortJump = calculateHyperspaceJumpRoute(origin, nearby, 2);
    assert.equal(shortJump.distanceParsecs, 1);
    assert.equal(shortJump.isReachable, true);
    assert.equal(shortJump.fuelTonsRequired, 10);
    assert.equal(shortJump.travelDays, 2);

    // 2. Distant jump (Distance ~8.5 -> 8 Parsecs)
    const longJump = calculateHyperspaceJumpRoute(origin, distant, 2);
    assert.ok(longJump.distanceParsecs >= 8);
    assert.equal(longJump.isReachable, false); // Exceeds Jump-2 drive!
  });
});
