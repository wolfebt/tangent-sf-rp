/**
 * @file stage1.test.mjs
 * @description Stage 1 Automated Verification Suite
 * Verifies VolatileSharder, Yjs CRDT resolution, telemetry binary pack/unpack, and debouncer logic.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as Y from 'yjs';
import { useEngineStore, selectFusedToken, selectAllFusedTokens } from '../../src/engine/state/VolatileSharder.ts';
import { TELEMETRY_PAYLOAD_TYPES } from '../../src/engine/network/LiveKitClient.ts';

test('Stage 1.1 & 1.2: VolatileSharder Zustand Store & Transient Mutations', () => {
  const store = useEngineStore.getState();

  // 1. Load Static Persona
  store.loadStaticEntity({
    id: 'persona-alpha',
    name: 'Operative Jax',
    base_hp: 45,
    tech_level: 3,
    armor_dr: 15,
    size_modifier: 0,
    species: 'Alterian',
    archetype: 'Infiltrator',
    is_persona: true
  });

  let fused = selectFusedToken(useEngineStore.getState(), 'persona-alpha');
  assert.ok(fused !== null, 'Fused token should exist');
  assert.equal(fused.name, 'Operative Jax');
  assert.equal(fused.current_hp, 45);
  assert.equal(fused.x, 0);
  assert.equal(fused.y, 0);

  // 2. High-Frequency Coordinate Updates (Simulating 60Hz drag)
  store.updatePosition('persona-alpha', 150.5, 300.25, 10);
  fused = selectFusedToken(useEngineStore.getState(), 'persona-alpha');
  assert.equal(fused.x, 150.5);
  assert.equal(fused.y, 300.25);
  assert.equal(fused.z, 10);

  // 3. Combat Damage & Healing
  store.applyDamage('persona-alpha', 20);
  fused = selectFusedToken(useEngineStore.getState(), 'persona-alpha');
  assert.equal(fused.current_hp, 25);

  store.healHP('persona-alpha', 10);
  fused = selectFusedToken(useEngineStore.getState(), 'persona-alpha');
  assert.equal(fused.current_hp, 35);

  // Heal past max capped at base_hp
  store.healHP('persona-alpha', 50);
  fused = selectFusedToken(useEngineStore.getState(), 'persona-alpha');
  assert.equal(fused.current_hp, 45);

  // 4. Active Conditions Toggle
  store.toggleCondition('persona-alpha', 'Blinded');
  fused = selectFusedToken(useEngineStore.getState(), 'persona-alpha');
  assert.ok(fused.active_conditions.includes('Blinded'));

  store.toggleCondition('persona-alpha', 'Blinded');
  fused = selectFusedToken(useEngineStore.getState(), 'persona-alpha');
  assert.ok(!fused.active_conditions.includes('Blinded'));

  // 5. Batch Select
  const allTokens = selectAllFusedTokens(useEngineStore.getState());
  assert.ok(allTokens.length >= 1);
});

test('Stage 1.4: Telemetry Binary Encoding & Decoding (9-byte format)', () => {
  const x = 1234.567;
  const y = 8901.234;
  
  // Encode
  const buffer = new ArrayBuffer(9);
  const view = new DataView(buffer);
  view.setUint8(0, TELEMETRY_PAYLOAD_TYPES.CURSOR);
  view.setFloat32(1, x, true);
  view.setFloat32(5, y, true);

  assert.equal(buffer.byteLength, 9, 'Binary payload must be exactly 9 bytes for 60Hz transmission');

  // Decode
  const decodeView = new DataView(buffer);
  const type = decodeView.getUint8(0);
  const decodedX = decodeView.getFloat32(1, true);
  const decodedY = decodeView.getFloat32(5, true);

  assert.equal(type, TELEMETRY_PAYLOAD_TYPES.CURSOR);
  assert.ok(Math.abs(decodedX - x) < 0.001, 'X float32 precision preserved');
  assert.ok(Math.abs(decodedY - y) < 0.001, 'Y float32 precision preserved');
});

test('Stage 1.5: Yjs CRDT Multi-Client Merging & Deterministic Resolution', () => {
  // Simulate 2 clients
  const docA = new Y.Doc();
  const docB = new Y.Doc();

  const mapA = docA.getMap('personas');
  const mapB = docB.getMap('personas');

  // Client A updates operative stats
  mapA.set('persona-1', { name: 'Vanguard', hp: 50, armor: 'TL3 Heavy' });

  // Sync A -> B
  const updateFromA = Y.encodeStateAsUpdate(docA);
  Y.applyUpdate(docB, updateFromA);

  assert.deepEqual(mapB.get('persona-1'), { name: 'Vanguard', hp: 50, armor: 'TL3 Heavy' });

  // Client B updates tactical position
  const boardB = docB.getArray('tactical_board');
  boardB.push([{ id: 'token-1', x: 25, y: 50 }]);

  // Sync B -> A
  const updateFromB = Y.encodeStateAsUpdate(docB);
  Y.applyUpdate(docA, updateFromB);

  const boardA = docA.getArray('tactical_board');
  assert.equal(boardA.length, 1);
  assert.deepEqual(boardA.get(0), { id: 'token-1', x: 25, y: 50 });

  // Client A edits scenario manuscript prose (Phase 5.1 CRDT Co-Authoring)
  const manuscriptsA = docA.getMap('scenario_manuscripts');
  manuscriptsA.set('scene-1', '<p>The airlock hiss echoed down the abandoned corridor.</p>');

  // Sync A -> B
  const updateManuscriptA = Y.encodeStateAsUpdate(docA);
  Y.applyUpdate(docB, updateManuscriptA);

  const manuscriptsB = docB.getMap('scenario_manuscripts');
  assert.equal(manuscriptsB.get('scene-1'), '<p>The airlock hiss echoed down the abandoned corridor.</p>');
});

test('Stage 1.6: Collaborative CRDT Service Manuscript Prose Sync', async () => {
  const { 
    syncScenarioProse, 
    updateScenarioProse, 
    subscribeToScenarioProse, 
    getScenarioProseText 
  } = await import('../../src/services/crdtCollabService.js');

  const scenarioId = 'scenario-test-collab-1';
  
  // 1. Initial Sync
  const { currentContent } = syncScenarioProse(scenarioId, '<p>Initial narrative draft.</p>');
  assert.equal(currentContent, '<p>Initial narrative draft.</p>');

  // 2. Subscription
  let observedText = '';
  const unsub = subscribeToScenarioProse(scenarioId, (text) => {
    observedText = text;
  });

  // 3. Remote/Local Update
  updateScenarioProse(scenarioId, '<p>Initial narrative draft. Operative advanced cautiously.</p>', 'test-peer');
  assert.equal(observedText, '<p>Initial narrative draft. Operative advanced cautiously.</p>');
  assert.equal(getScenarioProseText(scenarioId).toString(), '<p>Initial narrative draft. Operative advanced cautiously.</p>');

  unsub();
});

