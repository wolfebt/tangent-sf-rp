import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_WHISPER_CARDS,
  analyzeCombatPacing
} from '../../services/bastionWhisperService.js';

test('Tangent SFF RP — Proactive Pacing & Tactical Whisper AI Service', async (t) => {
  await t.test('Canonical whisper cards registry integrity', () => {
    assert.ok(CANONICAL_WHISPER_CARDS.length >= 6);
    const dropPod = CANONICAL_WHISPER_CARDS.find(c => c.id === 'reinforcement_incursion');
    assert.ok(dropPod);
    assert.equal(dropPod.pacingTrigger, 'blowout');

    const stallCard = CANONICAL_WHISPER_CARDS.find(c => c.id === 'environmental_surge');
    assert.ok(stallCard);
    assert.equal(stallCard.pacingTrigger, 'stall');
  });

  await t.test('analyzeCombatPacing detects crisis / near TPK state', () => {
    const tokens = [
      { id: 'h1', linkedHeroId: 'hero1', health: { current: 0, max: 30 }, conditions: ["Death's Door"] },
      { id: 'h2', linkedHeroId: 'hero2', health: { current: 0, max: 30 }, conditions: ["Death's Door"] },
      { id: 'e1', isEnemy: true, health: { current: 30, max: 30 } }
    ];

    const result = analyzeCombatPacing(tokens, 3);
    assert.equal(result.pacingState, 'crisis');
    assert.ok(result.tensionScore >= 70);
    assert.equal(result.heroesAtDeathsDoor, 2);
  });

  await t.test('analyzeCombatPacing detects party blowout / steamroll state', () => {
    const tokens = [
      { id: 'h1', linkedHeroId: 'hero1', health: { current: 30, max: 30 } },
      { id: 'h2', linkedHeroId: 'hero2', health: { current: 28, max: 30 } },
      { id: 'e1', isEnemy: true, health: { current: 5, max: 30 } }
    ];

    const result = analyzeCombatPacing(tokens, 2);
    assert.equal(result.pacingState, 'blowout');
    assert.ok(result.heroHealthRatio >= 85);
  });

  await t.test('analyzeCombatPacing detects defensive stalemate / combat drag', () => {
    const tokens = [
      { id: 'h1', linkedHeroId: 'hero1', health: { current: 20, max: 30 } },
      { id: 'h2', linkedHeroId: 'hero2', health: { current: 20, max: 30 } },
      { id: 'e1', isEnemy: true, health: { current: 25, max: 30 } },
      { id: 'e2', isEnemy: true, health: { current: 25, max: 30 } },
      { id: 'e3', isEnemy: true, health: { current: 25, max: 30 } }
    ];

    const result = analyzeCombatPacing(tokens, 5);
    assert.equal(result.pacingState, 'stall');
  });
});
