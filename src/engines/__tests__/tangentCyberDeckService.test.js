import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CYBER_TARGET_NODES,
  CANONICAL_DECK_PROGRAMS,
  CANONICAL_DATA_SLATES,
  createHackingSession,
  executeDeckProgram
} from '../../services/cyberDeckService.js';

test('Tangent SFF RP — Cyber-Deck Hacking & Encrypted Data-Slate Engine', async (t) => {
  await t.test('Canonical cyber nodes, deck programs, and data-slates integrity', () => {
    assert.equal(CYBER_TARGET_NODES.length, 4);
    assert.equal(CANONICAL_DECK_PROGRAMS.length, 5);
    assert.ok(CANONICAL_DATA_SLATES.length >= 3);

    const perimeter = CYBER_TARGET_NODES.find(n => n.tier === 'tier1');
    assert.ok(perimeter);
    assert.equal(perimeter.baseDc, 11);
    assert.equal(perimeter.iceMaxHp, 15);
  });

  await t.test('createHackingSession initializes clean intrusion session', () => {
    const session = createHackingSession('tier2');
    assert.equal(session.currentIceHp, 25);
    assert.equal(session.maxIceHp, 25);
    assert.equal(session.traceLevel, 0);
    assert.equal(session.isBreached, false);
    assert.equal(session.isTraced, false);
  });

  await t.test('executeDeckProgram deals ICE damage on successful roll and accumulates trace', () => {
    let session = createHackingSession('tier1'); // 15 HP, DC 11

    // Execute BruteForce with roll 16 (Success)
    session = executeDeckProgram(session, 'bruteforce_exe', 3, 16);

    assert.ok(session.currentIceHp < 15, `Expected ICE HP < 15, got ${session.currentIceHp}`);
    assert.ok(session.traceLevel > 0, `Expected trace > 0, got ${session.traceLevel}`);
    assert.ok(session.logStream.length > 2);
  });

  await t.test('executeDeckProgram marks isBreached true when ICE HP hits 0', () => {
    let session = createHackingSession('tier1');

    // Simulate 35 ICE damage (Overkill) with custom high roll
    session = executeDeckProgram(session, 'bruteforce_exe', 10, 20); // Crit double 10s -> 28+ damage

    assert.equal(session.currentIceHp, 0);
    assert.equal(session.isBreached, true);
  });
});
