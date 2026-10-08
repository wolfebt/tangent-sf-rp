/**
 * @file opfs_compendium_indexing.test.mjs
 * @description Unit verification for Background OPFS Indexing & Web Worker Offloading.
 * Validates that loadCompendiumSeedDataset() parses 700+ articles and offloads
 * bulk insertion & FTS5 indexing to the OPFSDatabaseWorker without blocking the main thread.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCompendiumSeedDataset, CANONICAL_RULES_COMPENDIUM } from '../../src/services/omnicortexVectorRag.ts';
import { getOpfsWorkerManager } from '../../src/services/opfsWorkerManager.ts';
import { searchRulesFtsAsync } from '../../src/services/rulebookRagService.js';

test('OPFS Worker Manager: Lifecycle and Mock Worker Binding', async () => {
  const manager = getOpfsWorkerManager();
  assert.ok(manager, 'OpfsWorkerManager singleton should exist');

  const dispatchedEvents = [];
  const mockWorker = {
    postMessage: (msg) => {
      dispatchedEvents.push(msg);
      // Simulate asynchronous worker response
      setTimeout(() => {
        if (msg.type === 'INDEX_COMPENDIUM' || msg.type === 'FTS_INDEX_RULES') {
          if (typeof mockWorker.onmessage === 'function') {
            mockWorker.onmessage({
              data: {
                type: 'RESULT',
                queryId: msg.queryId,
                rows: [{ count: (msg.chunks || msg.rules || []).length, status: 'indexed' }]
              }
            });
          }
        } else if (msg.type === 'FTS_SEARCH') {
          if (typeof mockWorker.onmessage === 'function') {
            mockWorker.onmessage({
              data: {
                type: 'RESULT',
                queryId: msg.queryId,
                rows: [
                  { id: 'comp-1', title: 'Tactical Cover Rules', category: 'combat', excerpt: 'Half cover grants +2 DC' }
                ]
              }
            });
          }
        }
      }, 5);
    },
    addEventListener: (type, handler) => {},
    removeEventListener: (type, handler) => {},
    terminate: () => {}
  };

  manager.setMockWorker(mockWorker);
  assert.equal(manager.isReady(), true, 'Manager should be ready with mock worker');

  // Test direct batch indexing dispatch
  const testChunks = [
    { id: 'test-1', title: 'Armor Piercing Rounds', category: 'combat', content: 'Reduces Kinetic DR by 4' },
    { id: 'test-2', title: 'Alterian Telepathy', category: 'metaphysics', content: 'Mind-link up to 50ft' }
  ];

  const indexResult = await manager.indexCompendiumChunks(testChunks);
  assert.equal(indexResult.count, 2);
  assert.equal(dispatchedEvents.length, 1);
  assert.equal(dispatchedEvents[0].type, 'INDEX_COMPENDIUM');
  assert.equal(dispatchedEvents[0].chunks.length, 2);

  // Test FTS search query dispatch
  const searchResults = await manager.searchFts('cover');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].title, 'Tactical Cover Rules');
});

test('Background OPFS Indexing: loadCompendiumSeedDataset() Offloads 700+ Chunks to Worker', async () => {
  const manager = getOpfsWorkerManager();
  let receivedBatchCount = 0;
  let receivedQueryType = null;

  const mockWorker = {
    postMessage: (msg) => {
      if (msg.type === 'INDEX_COMPENDIUM') {
        receivedQueryType = msg.type;
        receivedBatchCount = (msg.chunks || []).length;
        setTimeout(() => {
          if (typeof mockWorker.onmessage === 'function') {
            mockWorker.onmessage({
              data: {
                type: 'RESULT',
                queryId: msg.queryId,
                rows: [{ count: receivedBatchCount, status: 'indexed' }]
              }
            });
          }
        }, 10);
      }
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    terminate: () => {}
  };

  manager.setMockWorker(mockWorker);

  const initialCount = CANONICAL_RULES_COMPENDIUM.length;
  const startTime = performance.now();

  // Trigger dynamic compendium seed loading
  await loadCompendiumSeedDataset();

  const durationMs = performance.now() - startTime;

  assert.ok(CANONICAL_RULES_COMPENDIUM.length > initialCount, 'CANONICAL_RULES_COMPENDIUM should be expanded with seed data');
  assert.equal(receivedQueryType, 'INDEX_COMPENDIUM', 'Should have dispatched INDEX_COMPENDIUM to the worker');
  assert.ok(receivedBatchCount >= 700, `Worker should receive 700+ chunks, received: ${receivedBatchCount}`);
  assert.ok(durationMs < 2000, `Seed load and worker dispatch should finish quickly (<2000ms), took: ${durationMs.toFixed(1)}ms`);
});

test('searchRulesFtsAsync: Integrates seamlessly with active worker manager', async () => {
  const manager = getOpfsWorkerManager();
  const mockWorker = {
    postMessage: (msg) => {
      setTimeout(() => {
        if (typeof mockWorker.onmessage === 'function') {
          mockWorker.onmessage({
            data: {
              type: 'RESULT',
              queryId: msg.queryId,
              rows: [{ id: 'worker-result-1', title: 'Plasma Emitter TL4', category: 'technology', excerpt: 'Thermal damage' }]
            }
          });
        }
      }, 5);
    },
    addEventListener: (type, handler) => {
      mockWorker._handler = handler;
    },
    removeEventListener: () => {
      mockWorker._handler = null;
    }
  };

  // Mock message event dispatch via addEventListener
  const origPost = mockWorker.postMessage;
  mockWorker.postMessage = (msg) => {
    origPost(msg);
    setTimeout(() => {
      if (mockWorker._handler) {
        mockWorker._handler({
          data: {
            type: 'RESULT',
            queryId: msg.queryId,
            rows: [{ id: 'worker-result-1', title: 'Plasma Emitter TL4', category: 'technology', excerpt: 'Thermal damage' }]
          }
        });
      }
    }, 5);
  };

  manager.setMockWorker(mockWorker);

  const results = await searchRulesFtsAsync('plasma emitter', null, 5);
  assert.ok(results.length > 0);
  assert.equal(results[0].id, 'worker-result-1');
});
