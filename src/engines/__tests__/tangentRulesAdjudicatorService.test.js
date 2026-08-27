import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RANGE_BRACKETS,
  COVER_TYPES,
  LIGHTING_OBSCUREMENT,
  computeTacticalAttackModifiers
} from '../../services/rulesAdjudicatorService.js';

test('Tangent SFF RP — Tactical Trait & Modifiers Adjudicator Engine', async (t) => {
  await t.test('Canonical range brackets, cover, and obscurement integrity', () => {
    assert.equal(RANGE_BRACKETS.length, 5);
    assert.equal(COVER_TYPES.length, 4);
    assert.equal(LIGHTING_OBSCUREMENT.length, 4);

    const pointBlank = RANGE_BRACKETS.find(r => r.id === 'point_blank');
    assert.equal(pointBlank.attackMod, 2);

    const heavyCover = COVER_TYPES.find(c => c.id === 'heavy');
    assert.equal(heavyCover.defenseMod, 4);
  });

  await t.test('computeTacticalAttackModifiers computes clean standard engagement', () => {
    const adj = computeTacticalAttackModifiers({
      rangeBracketId: 'short',
      coverTypeId: 'none',
      lightingId: 'clear'
    });

    assert.equal(adj.netAttackMod, 0);
    assert.equal(adj.netDefenseMod, 0);
    assert.equal(adj.breakdown.length, 0);
  });

  await t.test('computeTacticalAttackModifiers applies high ground and heavy cover correctly', () => {
    const adj = computeTacticalAttackModifiers({
      rangeBracketId: 'medium',
      coverTypeId: 'heavy', // +4 DEF
      hasHighGround: true, // +2 ATK
      isAimed: true // +2 ATK
    });

    assert.equal(adj.netAttackMod, 4); // High ground (+2) + Aim (+2)
    assert.equal(adj.netDefenseMod, 4); // Heavy cover (+4)
    assert.ok(adj.breakdown.length >= 3);
  });

  await t.test('computeTacticalAttackModifiers applies prone modifiers based on range vs melee', () => {
    // 1. Prone in melee / point-blank -> -4 DEF (Advantage to attacker)
    const meleeAdj = computeTacticalAttackModifiers({
      rangeBracketId: 'point_blank',
      isTargetProne: true
    });
    assert.equal(meleeAdj.netAttackMod, 2); // Point blank +2
    assert.equal(meleeAdj.netDefenseMod, -4); // Prone in melee -4 DEF

    // 2. Prone at range -> +2 DEF (Harder to hit)
    const rangedAdj = computeTacticalAttackModifiers({
      rangeBracketId: 'medium',
      isTargetProne: true
    });
    assert.equal(rangedAdj.netDefenseMod, 2);
  });

  await t.test('computeTacticalAttackModifiers applies environmental smoke obscurement and flanking', () => {
    const adj = computeTacticalAttackModifiers({
      lightingId: 'smoke', // -3 ATK
      isFlanked: true // -2 DEF
    });

    assert.equal(adj.netAttackMod, -3);
    assert.equal(adj.netDefenseMod, -2);
  });
});
