import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_CONDITIONS,
  getConditionDefinition,
  evaluateTokenConditionsOnTurnStart,
  applyConditionToToken,
  removeConditionFromToken
} from '../../services/conditionService.js';

test('Tangent SFF RP — Condition & Turn-State Machine Engine', async (t) => {
  await t.test('Canonical condition registry integrity', () => {
    assert.ok(CANONICAL_CONDITIONS.length >= 10, 'Expected at least 10 canonical conditions');
    const bleed = getConditionDefinition('Bleeding');
    assert.ok(bleed, 'Bleeding condition should exist');
    assert.equal(bleed.targetPool, 'health');
    assert.equal(bleed.damageType, 'lethal');
    assert.equal(bleed.defaultDamage, 3);

    const burn = getConditionDefinition('Burning');
    assert.ok(burn);
    assert.equal(burn.defaultDamage, 4);

    const stun = getConditionDefinition('Stunned');
    assert.ok(stun);
    assert.equal(stun.actionPenalty?.forfeitStandard, true);
  });

  await t.test('applyConditionToToken & removeConditionFromToken', () => {
    let token = {
      id: 'tok-1',
      label: 'Operative Jax',
      health: { current: 30, max: 30 },
      vitality: { current: 30, max: 30 },
      conditions: []
    };

    token = applyConditionToToken(token, 'Bleeding', 3);
    assert.deepEqual(token.conditions, ['Bleeding']);
    assert.equal(token.conditionDetails['Bleeding'].duration, 3);
    assert.equal(token.conditionDetails['Bleeding'].damage, 3);

    token = removeConditionFromToken(token, 'Bleeding');
    assert.deepEqual(token.conditions, []);
    assert.equal(token.conditionDetails['Bleeding'], undefined);
  });

  await t.test('evaluateTokenConditionsOnTurnStart: Biological lethal and non-lethal ticks', () => {
    let token = {
      id: 'tok-2',
      label: 'Operative Sarah',
      health: { current: 30, max: 30 },
      vitality: { current: 20, max: 30 },
      conditions: ['Bleeding', 'Poisoned'],
      conditionDetails: {
        Bleeding: { duration: 2, damage: 3 },
        Poisoned: { duration: 3, damage: 4 }
      }
    };

    const { updatedToken, triggeredEffects, expiredConditions } = evaluateTokenConditionsOnTurnStart(token);

    // Bleed deals 3 to health: 30 -> 27
    assert.equal(updatedToken.health.current, 27);
    // Poison deals 4 to vitality: 20 -> 16
    assert.equal(updatedToken.vitality.current, 16);

    // Duration decremented: Bleed (2 -> 1), Poison (3 -> 2)
    assert.equal(updatedToken.conditionDetails['Bleeding'].duration, 1);
    assert.equal(updatedToken.conditionDetails['Poisoned'].duration, 2);
    assert.equal(expiredConditions.length, 0);
    assert.equal(triggeredEffects.length, 2);
  });

  await t.test('evaluateTokenConditionsOnTurnStart: Synthetic structure damage and toxin immunity', () => {
    let synthToken = {
      id: 'tok-synth',
      label: 'Android Unit 7',
      isSynthetic: true,
      structure: { current: 50, max: 60 },
      conditions: ['Burning', 'Poisoned'],
      conditionDetails: {
        Burning: { duration: 2, damage: 4 },
        Poisoned: { duration: 2, damage: 3 }
      }
    };

    const { updatedToken, triggeredEffects } = evaluateTokenConditionsOnTurnStart(synthToken);

    // Thermal damage dealt to Structure: 50 - 4 = 46
    assert.equal(updatedToken.structure.current, 46);

    // Poison effect is ignored with 'immune' event
    const immuneEffect = triggeredEffects.find(e => e.type === 'immune');
    assert.ok(immuneEffect, 'Synthetic should have immune effect for poison');
  });

  await t.test('evaluateTokenConditionsOnTurnStart: Condition expiration upon reaching 0 duration', () => {
    let token = {
      id: 'tok-exp',
      label: 'Operative Leon',
      health: { current: 25, max: 30 },
      vitality: { current: 25, max: 30 },
      conditions: ['Bleeding'],
      conditionDetails: {
        Bleeding: { duration: 1, damage: 3 }
      }
    };

    const { updatedToken, expiredConditions } = evaluateTokenConditionsOnTurnStart(token);

    assert.equal(updatedToken.health.current, 22);
    assert.deepEqual(expiredConditions, ['Bleeding']);
    assert.deepEqual(updatedToken.conditions, []);
    assert.equal(updatedToken.conditionDetails['Bleeding'], undefined);
  });
});
