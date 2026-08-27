import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISPOSITION_TIERS,
  SOCIAL_ACTION_TYPES,
  getDispositionDefinition,
  generateNpcSocialProfile,
  evaluateDispositionShift
} from '../../services/socialMatrixService.js';

test('Tangent SFF RP — Dynamic Scene Director & Social Disposition Service', async (t) => {
  await t.test('5-Tier disposition scale and canonical action types integrity', () => {
    assert.equal(DISPOSITION_TIERS.length, 5);
    assert.equal(SOCIAL_ACTION_TYPES.length, 5);

    const hostile = getDispositionDefinition(-2);
    assert.equal(hostile.id, 'hostile');
    assert.equal(hostile.baseDc, 18);
    assert.equal(hostile.tradeModifier, 1.5);

    const allied = getDispositionDefinition(2);
    assert.equal(allied.id, 'allied');
    assert.equal(allied.baseDc, 6);
    assert.equal(allied.tradeModifier, 0.75);
  });

  await t.test('generateNpcSocialProfile generates consistent profile based on seed', () => {
    const npc = { id: 'npc-corpo-1', label: 'Executive Thorne' };
    const profile = generateNpcSocialProfile(npc);

    assert.ok(profile);
    assert.ok(typeof profile.dispositionTier === 'number');
    assert.ok(profile.motivation);
    assert.ok(profile.fear);
    assert.ok(profile.leverage);
    assert.equal(profile.leverageRevealed, false);
  });

  await t.test('evaluateDispositionShift: Major success (MoS >= 5) advances tier by +1', () => {
    // Current tier 0 (Neutral). Target DC 12. Roll 18 (MoS = +6).
    const shift = evaluateDispositionShift(0, 'persuasion', 18, 12, false, false);
    assert.equal(shift.newTier, 1);
    assert.equal(shift.tierChanged, true);
    assert.equal(shift.marginOfSuccess, 6);
  });

  await t.test('evaluateDispositionShift: Critical Triumph advances tier by +2', () => {
    // Current tier -1 (Suspicious). Target DC 15.
    const shift = evaluateDispositionShift(-1, 'persuasion', 34, 15, true, false);
    assert.equal(shift.newTier, 1); // -1 + 2 = 1 (Cooperative)
    assert.equal(shift.tierChanged, true);
  });

  await t.test('evaluateDispositionShift: Failed Intimidation degrades tier by -1', () => {
    // Current tier 0 (Neutral). Target DC 12. Roll 9 (MoS = -3).
    const shift = evaluateDispositionShift(0, 'intimidation', 9, 12, false, false);
    assert.equal(shift.newTier, -1); // Neutral -> Suspicious
    assert.equal(shift.tierChanged, true);
  });

  await t.test('evaluateDispositionShift: Critical Fumble degrades tier by -2', () => {
    // Current tier 1 (Cooperative). Target DC 9.
    const shift = evaluateDispositionShift(1, 'deception', -5, 9, false, true);
    assert.equal(shift.newTier, -1); // 1 - 2 = -1 (Suspicious)
    assert.equal(shift.tierChanged, true);
  });
});
