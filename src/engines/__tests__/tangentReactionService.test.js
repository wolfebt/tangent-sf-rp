import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_REACTIONS,
  getReactionDefinition,
  canTokenReact,
  spendTokenReaction,
  restoreTokenReaction,
  evaluateOpportunityTriggers
} from '../../services/reactionService.js';

test('Tangent SFF RP — Autonomous Reaction & Interrupt Service', async (t) => {
  await t.test('Canonical reactions registry integrity', () => {
    assert.ok(CANONICAL_REACTIONS.length >= 6, 'Expected at least 6 canonical reactions');
    const opp = getReactionDefinition('opportunity_strike');
    assert.ok(opp, 'opportunity_strike should exist');
    assert.equal(opp.category, 'Offensive');

    const shield = getReactionDefinition('kinetic_shield_overcharge');
    assert.ok(shield);
    assert.equal(shield.category, 'Defensive');

    const parry = getReactionDefinition('defensive_parry');
    assert.ok(parry);

    const dive = getReactionDefinition('dive_for_cover');
    assert.ok(dive);
  });

  await t.test('Reaction budget checks & expenditure', () => {
    let token = {
      id: 'hero-1',
      label: 'Operative Jax',
      actions: { standard: true, move: true, reaction: true, free: true }
    };

    assert.equal(canTokenReact(token), true);

    token = spendTokenReaction(token);
    assert.equal(token.actions.reaction, false);
    assert.equal(canTokenReact(token), false);

    token = restoreTokenReaction(token);
    assert.equal(token.actions.reaction, true);
    assert.equal(canTokenReact(token), true);
  });

  await t.test('canTokenReact denies incapacitated or stunned tokens', () => {
    const deadToken = { id: 'dead-1', isDead: true, conditions: ['Dead'], actions: { reaction: true } };
    assert.equal(canTokenReact(deadToken), false);

    const stunnedToken = { id: 'stun-1', conditions: ['Stunned'], actions: { reaction: true } };
    assert.equal(canTokenReact(stunnedToken), false);
  });

  await t.test('evaluateOpportunityTriggers detects movement leaving melee reach', () => {
    const heroToken = {
      id: 'hero-1',
      label: 'Operative Jax',
      x: 100,
      y: 100,
      isEnemy: false,
      actions: { reaction: true }
    };

    const enemyToken = {
      id: 'enemy-1',
      label: 'Hostile Enforcer',
      x: 120, // 20px away initially (inside 65px melee range)
      y: 100,
      isEnemy: true
    };

    const allTokens = [heroToken, enemyToken];

    // Enemy moves from (120, 100) to (250, 100) - retreats 150px away
    const triggers = evaluateOpportunityTriggers(
      enemyToken,
      { x: 120, y: 100 },
      { x: 250, y: 100 },
      allTokens,
      65
    );

    assert.equal(triggers.length, 1);
    assert.equal(triggers[0].reactorToken.id, 'hero-1');
    assert.equal(triggers[0].targetToken.id, 'enemy-1');
    assert.equal(triggers[0].reactionType, 'opportunity_strike');
  });

  await t.test('evaluateOpportunityTriggers ignores friendly movement or movement within melee range', () => {
    const hero1 = { id: 'h-1', x: 100, y: 100, isEnemy: false, actions: { reaction: true } };
    const hero2 = { id: 'h-2', x: 120, y: 100, isEnemy: false };

    // Friendly hero moves away
    const friendlyTriggers = evaluateOpportunityTriggers(
      hero2,
      { x: 120, y: 100 },
      { x: 300, y: 100 },
      [hero1, hero2],
      65
    );
    assert.equal(friendlyTriggers.length, 0);

    const enemy = { id: 'e-1', x: 120, y: 100, isEnemy: true };
    // Enemy circles around still within melee range (e.g. from (120, 100) to (100, 120) which is 20px away)
    const circleTriggers = evaluateOpportunityTriggers(
      enemy,
      { x: 120, y: 100 },
      { x: 100, y: 120 },
      [hero1, enemy],
      65
    );
    assert.equal(circleTriggers.length, 0);
  });
});
