import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_AOE_PRESETS,
  getAoEPreset,
  getTokensInCircle,
  getTokensInCone,
  getTokensInLine,
  resolveAoEImpact
} from '../../services/aoeHazardService.js';

test('Tangent SFF RP — Multi-Target AoE & Hazard Engine', async (t) => {
  await t.test('Canonical AoE presets registry integrity', () => {
    assert.ok(CANONICAL_AOE_PRESETS.length >= 6, 'Expected at least 6 canonical AoE presets');
    const frag = getAoEPreset('frag_grenade');
    assert.ok(frag);
    assert.equal(frag.shape, 'circle');
    assert.equal(frag.baseDamage, 14);
    assert.equal(frag.saveType, 'Reflex');

    const flame = getAoEPreset('flamethrower_sweep');
    assert.ok(flame);
    assert.equal(flame.shape, 'cone');

    const beam = getAoEPreset('particle_lance');
    assert.ok(beam);
    assert.equal(beam.shape, 'line');
  });

  await t.test('getTokensInCircle detects core and outer blast zones', () => {
    const origin = { x: 100, y: 100 };
    const tokens = [
      { id: 't-core', x: 120, y: 100 }, // dist 20 (<= 50 is core for radius 100)
      { id: 't-outer', x: 170, y: 100 }, // dist 70 (<= 100 is outer)
      { id: 't-outside', x: 250, y: 100 } // dist 150 (> 100)
    ];

    const results = getTokensInCircle(origin, 100, tokens);
    assert.equal(results.length, 2);
    assert.equal(results.find(r => r.token.id === 't-core')?.zone, 'core');
    assert.equal(results.find(r => r.token.id === 't-outer')?.zone, 'outer');
  });

  await t.test('getTokensInCone detects targets within 60° arc', () => {
    const origin = { x: 100, y: 100 };
    const tokens = [
      { id: 't-ahead', x: 180, y: 100 }, // 0° ahead (dist 80, inside 120)
      { id: 't-angle', x: 160, y: 130 }, // ~26° angle (inside 30° half-cone)
      { id: 't-behind', x: 50, y: 100 }  // 180° behind (outside)
    ];

    const results = getTokensInCone(origin, 0, 60, 120, tokens);
    assert.equal(results.length, 2);
    assert.ok(results.some(r => r.token.id === 't-ahead'));
    assert.ok(results.some(r => r.token.id === 't-angle'));
    assert.ok(!results.some(r => r.token.id === 't-behind'));
  });

  await t.test('getTokensInLine detects targets along beam vector', () => {
    const start = { x: 100, y: 100 };
    const end = { x: 300, y: 100 }; // Horizontal line of length 200
    const tokens = [
      { id: 't-on-line', x: 200, y: 105 }, // dist 5 to line (inside width 30)
      { id: 't-off-line', x: 200, y: 150 } // dist 50 to line (outside width 30)
    ];

    const results = getTokensInLine(start, end, 30, tokens);
    assert.equal(results.length, 1);
    assert.equal(results[0].token.id, 't-on-line');
  });

  await t.test('resolveAoEImpact handles saves, soak, and conditions', () => {
    const preset = getAoEPreset('frag_grenade'); // 14 base, save DC 14, falloff: true, cond: Prone
    const targetToken = {
      id: 'target-1',
      label: 'Hostile Scout',
      stamina: 2,
      armorDr: 2,
      reflex: 3
    };

    const affected = [
      { token: targetToken, distancePx: 30, zone: 'core' }
    ];

    // Case 1: Failed save (roll 10 < DC 14)
    const failOutcome = resolveAoEImpact(preset, affected, { saveRolls: { 'target-1': 10 } });
    assert.equal(failOutcome[0].saved, false);
    assert.equal(failOutcome[0].rawDamage, 14);
    // Soak: armorDr 2 + sta 2 = 4. Final: 14 - 4 = 10
    assert.equal(failOutcome[0].finalDamage, 10);
    assert.equal(failOutcome[0].appliedCondition, 'Prone');

    // Case 2: Passed save (roll 16 >= DC 14)
    const passOutcome = resolveAoEImpact(preset, affected, { saveRolls: { 'target-1': 16 } });
    assert.equal(passOutcome[0].saved, true);
    // Half damage: ceil(14 * 0.5) = 7. Soak 4. Final: 7 - 4 = 3
    assert.equal(failOutcome[0].rawDamage, 14);
    assert.equal(passOutcome[0].finalDamage, 3);
    assert.equal(passOutcome[0].appliedCondition, null); // Condition negated on save
  });
});
