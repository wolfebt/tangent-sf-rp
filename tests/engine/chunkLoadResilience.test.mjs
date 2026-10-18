/**
 * @file chunkLoadResilience.test.mjs
 * @description Verifies stale deployment chunk recovery, lazy retry resilience, and addFolioTombstone integrity.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { lazyWithRetry } from '../../src/utils/lazyWithRetry.js';
import { 
  addFolioTombstone, 
  getFolioTombstones, 
  isFolioPersonaDeleted,
  FOLIO_TOMBSTONES_KEY 
} from '../../src/utils/personaValidationUtils.js';

test('addFolioTombstone: handles multiple formats cleanly without throwing', () => {
  // Mock localStorage in Node
  const storage = {};
  global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = v; },
    removeItem: (k) => { delete storage[k]; }
  };

  // Safe against null/undefined
  assert.doesNotThrow(() => addFolioTombstone(null));
  assert.doesNotThrow(() => addFolioTombstone(undefined));

  // Single string doc id
  addFolioTombstone('char_test_123');
  let tombstones = getFolioTombstones();
  assert.ok(tombstones.includes('char_test_123'));
  assert.equal(isFolioPersonaDeleted('char_test_123', tombstones), true);

  // Array of doc ids (e.g. from uData.deletedPersonaIds)
  addFolioTombstone(['char_test_456', 'char_test_789']);
  tombstones = getFolioTombstones();
  assert.ok(tombstones.includes('char_test_456'));
  assert.ok(tombstones.includes('char_test_789'));

  // Object with character-doc-id
  addFolioTombstone({ 'character-doc-id': 'char_test_obj_1' });
  tombstones = getFolioTombstones();
  assert.ok(tombstones.includes('char_test_obj_1'));
});

test('lazyWithRetry: resolves components normally on success', async () => {
  const MockComponent = () => 'MockComponent';
  const lazyComp = lazyWithRetry(async () => ({ default: MockComponent }));
  assert.ok(lazyComp, 'lazyWithRetry returns a React lazy component');
});

test('lazyWithRetry: detects stale deployment chunk error and triggers reload once', async () => {
  let reloaded = false;
  const session = {};

  global.window = {
    location: {
      reload: () => { reloaded = true; }
    }
  };
  global.sessionStorage = {
    getItem: (k) => session[k] || null,
    setItem: (k, v) => { session[k] = v; },
    removeItem: (k) => { delete session[k]; }
  };

  const failingFactory = async () => {
    const err = new TypeError('Failed to fetch dynamically imported module: https://tangent-rpg-dbm.web.app/assets/Folio-DOXVO9eh.js');
    throw err;
  };

  const lazyComp = lazyWithRetry(failingFactory);

  // Invoke the factory internal loader and race with small timeout (since retry returns a pending promise for Suspense)
  try {
    const fn = lazyComp._payload?._result || lazyComp._init;
    if (typeof fn === 'function') {
      await Promise.race([
        fn(lazyComp._payload),
        new Promise((resolve) => setTimeout(resolve, 25))
      ]);
    }
  } catch (e) {
    // May throw or pending
  }
  await new Promise(resolve => setTimeout(resolve, 15));

  // Verify reload was invoked
  assert.equal(reloaded, true, 'Should trigger window.location.reload() on stale chunk error');
  assert.ok(session['tangent_chunk_retry_timestamp'], 'Should store reload timestamp in sessionStorage');

  // Verify non-chunk errors are NOT reloaded
  reloaded = false;
  const nonChunkFactory = async () => {
    throw new Error('Normal business logic error');
  };
  const lazyComp2 = lazyWithRetry(nonChunkFactory);
  try {
    const fn2 = lazyComp2._payload?._result || lazyComp2._init;
    if (typeof fn2 === 'function') {
      await fn2(lazyComp2._payload);
    }
  } catch (e) {
    // Expected to throw
  }
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(reloaded, false, 'Should not reload on non-chunk errors');
});
