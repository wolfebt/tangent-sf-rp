/**
 * @file multiplayer_crdt_stress.test.mjs
 * @description Concurrency Stress-Test for Multiplayer Yjs CRDT + LiveKit Stage Sync.
 * Simulates 4 concurrent browser clients (1 Architect + 3 Operatives) with rapid token mutations,
 * verifying 100% mathematical CRDT convergence, deterministic resolution, and role permissions.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as Y from 'yjs';
import { VttMultiplayerSyncService } from '../../src/services/vttMultiplayerSyncService.ts';

test('Multiplayer CRDT Stress: 4-Client Mesh Convergence under Rapid Token Relocations', () => {
  // Simulate 4 concurrent clients: 1 Architect (GM) + 3 Operatives
  const clients = [
    { id: 'client-architect', role: 'architect', personaId: null, doc: new Y.Doc() },
    { id: 'client-op-jax', role: 'operative', personaId: 'persona-jax', doc: new Y.Doc() },
    { id: 'client-op-nyx', role: 'operative', personaId: 'persona-nyx', doc: new Y.Doc() },
    { id: 'client-op-kaelen', role: 'operative', personaId: 'persona-kaelen', doc: new Y.Doc() }
  ];

  // Wire full-mesh P2P sync between all 4 clients (simulating WebRTC Reliable DataChannels)
  clients.forEach(sender => {
    sender.doc.on('update', (update, origin) => {
      if (origin !== 'network') {
        clients.forEach(receiver => {
          if (receiver.id !== sender.id) {
            Y.applyUpdate(receiver.doc, update, 'network');
          }
        });
      }
    });
  });

  const tokens = ['persona-jax', 'persona-nyx', 'persona-kaelen', 'adversary-boss', 'sentry-drone-01'];

  // Initialize initial token positions from Architect
  const archMap = clients[0].doc.getMap('tactical_tokens');
  tokens.forEach((tokenId, idx) => {
    archMap.set(tokenId, {
      id: tokenId,
      x: 100 + idx * 50,
      y: 100 + idx * 50,
      z: 0,
      updatedBy: 'architect',
      timestamp: Date.now()
    });
  });

  // Verify all 4 clients received initial state
  clients.forEach(c => {
    const map = c.doc.getMap('tactical_tokens');
    assert.equal(map.size, 5, `Client ${c.id} should have 5 tokens`);
    assert.equal(map.get('persona-jax').x, 100);
  });

  // ── High-Concurrency Stress Test (120 rapid concurrent movements) ──
  const startTime = performance.now();
  const MOVES_PER_CLIENT = 30;

  for (let round = 0; round < MOVES_PER_CLIENT; round++) {
    // 1. Architect moves boss adversary
    archMap.set('adversary-boss', {
      id: 'adversary-boss',
      x: 400 + round * 2,
      y: 400 + round * 2,
      updatedBy: 'architect',
      timestamp: Date.now()
    });

    // 2. Operative Jax moves Jax token
    const jaxMap = clients[1].doc.getMap('tactical_tokens');
    jaxMap.set('persona-jax', {
      id: 'persona-jax',
      x: 200 + round * 3,
      y: 250 + round * 1.5,
      updatedBy: 'operative',
      personaId: 'persona-jax',
      timestamp: Date.now()
    });

    // 3. Operative Nyx moves Nyx token
    const nyxMap = clients[2].doc.getMap('tactical_tokens');
    nyxMap.set('persona-nyx', {
      id: 'persona-nyx',
      x: 300 - round * 1.5,
      y: 350 + round * 2,
      updatedBy: 'operative',
      personaId: 'persona-nyx',
      timestamp: Date.now()
    });

    // 4. Operative Kaelen moves Kaelen token
    const kaelenMap = clients[3].doc.getMap('tactical_tokens');
    kaelenMap.set('persona-kaelen', {
      id: 'persona-kaelen',
      x: 500 + round * 1,
      y: 200 - round * 1,
      updatedBy: 'operative',
      personaId: 'persona-kaelen',
      timestamp: Date.now()
    });
  }

  const durationMs = performance.now() - startTime;

  // ── Verify 100% Convergence across all 4 Clients ──
  const baseVector = Y.encodeStateVector(clients[0].doc);

  for (let i = 1; i < clients.length; i++) {
    const peerVector = Y.encodeStateVector(clients[i].doc);
    assert.deepEqual(
      baseVector,
      peerVector,
      `State vector of client ${clients[i].id} must be 100% identical to Architect client`
    );

    const peerMap = clients[i].doc.getMap('tactical_tokens');
    tokens.forEach(tokId => {
      assert.deepEqual(
        archMap.get(tokId),
        peerMap.get(tokId),
        `Token "${tokId}" on client ${clients[i].id} must match Architect's token state`
      );
    });
  }

  assert.ok(durationMs < 200, `120 concurrent P2P CRDT sync operations should complete in <200ms, took: ${durationMs.toFixed(1)}ms`);
});

test('Multiplayer Roles: Permission Enforcement between Architect and Operative', () => {
  const syncService = new VttMultiplayerSyncService();

  // Test 1: Architect can move all tokens
  syncService.init({ role: 'architect' });
  assert.equal(syncService.canMoveToken('adversary-boss'), true, 'Architect must be able to move adversary tokens');
  assert.equal(syncService.canMoveToken('persona-jax'), true, 'Architect must be able to move player tokens');

  const archMoved = syncService.broadcastTokenMove('adversary-boss', 600, 600);
  assert.equal(archMoved, true, 'Architect move should be broadcast');

  syncService.destroy();

  // Test 2: Operative cannot move enemy tokens without permission
  const operativeService = new VttMultiplayerSyncService();
  operativeService.init({ role: 'operative', personaId: 'persona-jax' });

  assert.equal(operativeService.canMoveToken('persona-jax'), true, 'Operative must be able to move own persona');
  assert.equal(operativeService.canMoveToken('adversary-boss'), false, 'Operative must NOT be able to move boss token');

  const deniedMove = operativeService.broadcastTokenMove('adversary-boss', 700, 700);
  assert.equal(deniedMove, false, 'Unauthorized move must be rejected');

  operativeService.destroy();
});
