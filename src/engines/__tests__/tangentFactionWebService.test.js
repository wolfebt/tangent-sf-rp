import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_FACTIONS,
  CANONICAL_RELATIONSHIPS,
  HEAT_LEVELS,
  getHeatDefinition,
  adjustPartyReputation
} from '../../services/factionWebService.js';

test('Tangent SFF RP — Faction Relational Web & Party Heat Service', async (t) => {
  await t.test('Canonical factions and bilateral relationships integrity', () => {
    assert.equal(CANONICAL_FACTIONS.length, 5);
    assert.ok(CANONICAL_RELATIONSHIPS.length >= 4);
    assert.equal(HEAT_LEVELS.length, 6);

    const tsc = CANONICAL_FACTIONS.find(f => f.id === 'tsc_directorate');
    assert.ok(tsc);
    assert.equal(tsc.lawLevel, 8);
  });

  await t.test('getHeatDefinition clamps between 0 and 5 stars', () => {
    const zero = getHeatDefinition(0);
    assert.equal(zero.level, 0);
    assert.equal(zero.stars, '☆☆☆☆☆');

    const five = getHeatDefinition(5);
    assert.equal(five.level, 5);
    assert.equal(five.stars, '★★★★★');

    const overflow = getHeatDefinition(99);
    assert.equal(overflow.level, 5);
  });

  await t.test('adjustPartyReputation clamps between -3 and +3 and computes tier labels', () => {
    const initial = adjustPartyReputation(0, 1);
    assert.equal(initial.reputation, 1);
    assert.equal(initial.isAllied, false);

    const maxAllied = adjustPartyReputation(2, 2);
    assert.equal(maxAllied.reputation, 3);
    assert.equal(maxAllied.isAllied, true);

    const minHostile = adjustPartyReputation(-2, -5);
    assert.equal(minHostile.reputation, -3);
    assert.equal(minHostile.isHostile, true);
  });
});
