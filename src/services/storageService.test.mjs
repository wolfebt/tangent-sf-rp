import { StorageService } from './storageService.js';
import assert from 'node:assert';

console.log('Testing StorageService...');

// Test 1: Verify StorageService interface
assert.strictEqual(typeof StorageService.getItem, 'function', 'getItem should be a function');
assert.strictEqual(typeof StorageService.setItem, 'function', 'setItem should be a function');
assert.strictEqual(typeof StorageService.removeItem, 'function', 'removeItem should be a function');
assert.strictEqual(typeof StorageService.clear, 'function', 'clear should be a function');
assert.strictEqual(typeof StorageService.getStorageEstimate, 'function', 'getStorageEstimate should be a function');
console.log('✔ Test 1 passed: Interface contract confirmed');

// Test 2: Fallback in Node environment (no window.indexedDB)
// Simulating localStorage fallback
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) ?? null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

async function runStorageTests() {
  // Test 2a: Write and Read an object
  const testPayload = {
    id: 'universe_123',
    projectName: 'Sector 7 Operations',
    scenarios: [{ id: 's1', title: 'Arrival' }],
    maps: [{ id: 'm1', name: 'Tactical Outpost', layers: [1, 2, 3] }]
  };

  const setRes = await StorageService.setItem('test_universe', testPayload);
  assert.strictEqual(setRes, true, 'setItem should return true');

  const retrieved = await StorageService.getItem('test_universe');
  assert.deepStrictEqual(retrieved, testPayload, 'Retrieved payload should match original');
  console.log('✔ Test 2a passed: Fallback setItem and getItem work properly');

  // Test 2b: Default value when key not found
  const fallbackVal = await StorageService.getItem('non_existent_key', { fallback: true });
  assert.deepStrictEqual(fallbackVal, { fallback: true }, 'Should return defaultValue for missing key');
  console.log('✔ Test 2b passed: Default value returned when missing');

  // Test 2c: removeItem
  await StorageService.removeItem('test_universe');
  const afterRemove = await StorageService.getItem('test_universe');
  assert.strictEqual(afterRemove, null, 'Key should be deleted');
  console.log('✔ Test 2c passed: removeItem works properly');

  // Test 2d: Storage estimate fallback
  const estimate = await StorageService.getStorageEstimate();
  assert.strictEqual(typeof estimate.quotaMB, 'number');
  assert.strictEqual(typeof estimate.usageMB, 'number');
  assert.strictEqual(typeof estimate.percentUsed, 'number');
  console.log('✔ Test 2d passed: getStorageEstimate returns structured object', estimate);

  console.log('\nAll StorageService unit tests PASSED successfully!');
}

runStorageTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
