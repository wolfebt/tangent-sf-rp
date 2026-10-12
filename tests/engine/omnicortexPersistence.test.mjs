/**
 * @file omnicortexPersistence.test.mjs
 * @description Automated Unit Test Suite for Omnicortex Local Persistence & Seed-Merging Resilience.
 * 
 * Verifies:
 * 1. Custom modified entries are saved locally via saveOmnicortexCustomEntry.
 * 2. getOmnicortexCustomEntries retrieves saved custom entries reliably.
 * 3. mergeSeedsWithDocs overlays custom species modifications over DEFAULT_SPECIES.
 * 4. mergeSeedsWithDocs preserves custom edits even when Firestore snapshot returns empty or outdated docs.
 * 5. Brand new custom entries (not in default seeds) are preserved in merged results.
 * 6. removeOmnicortexCustomEntry removes entries cleanly.
 * 7. Tombstones prevent deleted entries from resurrecting, while custom entries remain intact.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Setup Mock LocalStorage for Node.js test environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) ?? null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

import {
  saveOmnicortexCustomEntry,
  getOmnicortexCustomEntries,
  removeOmnicortexCustomEntry,
  getOmnicortexTombstones,
  addOmnicortexTombstone,
  removeOmnicortexTombstones,
  clearOmnicortexTombstones,
  mergeSeedsWithDocs,
  getFallbackSeedForCategory,
  CUSTOM_ENTRIES_KEY,
  TOMBSTONES_KEY
} from '../../src/utils/omnicortexPersistence.js';

test('Omnicortex Persistence: Custom Species modification is saved and retrieved locally', () => {
  mockStorage.clear();

  const customAlterian = {
    id: 'species-aeld-alterian',
    name: 'Alterian (Customized Variant)',
    title: 'Alterian (Aeld Conclave — Sovereign)',
    category: 'species',
    parent_species: 'Aeld',
    species_type: 'Humanoid',
    size: 'Medium',
    description: 'Updated cybernetic-arcane sub-species with augmented neural relays.',
    traits: [
      'trait-awakened-arcane',
      'trait-long-lived-600-years',
      'trait-custom-cybernetic-weave'
    ],
    modifiers: [
      { target: 'Agility', value: 2, type: 'attribute', mode: 'inherent' },
      { target: 'Intellect', value: 2, type: 'attribute', mode: 'inherent' }
    ],
    costs: { bp: 35 },
    updatedAt: new Date().toISOString()
  };

  saveOmnicortexCustomEntry('species', customAlterian);

  const entries = getOmnicortexCustomEntries();
  assert.ok(entries.species, 'Expected species category in custom entries');
  const retrieved = entries.species['species-aeld-alterian'];
  assert.ok(retrieved, 'Expected custom Alterian to be retrieved');
  assert.equal(retrieved.name, 'Alterian (Customized Variant)');
  assert.equal(retrieved.description, 'Updated cybernetic-arcane sub-species with augmented neural relays.');
  assert.equal(retrieved.costs.bp, 35);
});

test('Omnicortex Persistence: mergeSeedsWithDocs overlays custom entry over static DEFAULT_SPECIES', () => {
  mockStorage.clear();

  const customAlterian = {
    id: 'species-aeld-alterian',
    name: 'Alterian (Customized Variant)',
    title: 'Alterian (Custom)',
    category: 'species',
    description: 'User committed description that must not revert.',
    costs: { bp: 42 },
    updatedAt: new Date().toISOString()
  };

  saveOmnicortexCustomEntry('species', customAlterian);

  // Simulate onSnapshot or initial boot returning empty docs list from Firestore (e.g. offline or non-admin)
  const merged = mergeSeedsWithDocs([], 'species');
  assert.ok(merged.length > 0, 'Expected non-empty merged species list');

  const alterian = merged.find(s => s.id === 'species-aeld-alterian');
  assert.ok(alterian, 'Expected Alterian to be present in merged list');
  assert.equal(alterian.name, 'Alterian (Customized Variant)', 'Expected customized name, not default seed');
  assert.equal(alterian.description, 'User committed description that must not revert.');
  assert.equal(alterian.costs.bp, 42);
});

test('Omnicortex Persistence: mergeSeedsWithDocs prefers latest custom entry over outdated Firestore snapshot', () => {
  mockStorage.clear();

  const olderDocFromFirestore = {
    id: 'species-aeld-alterian',
    name: 'Alterian (Old Cloud Version)',
    description: 'Old Cloud Description',
    updatedAt: '2026-01-01T00:00:00.000Z'
  };

  const newerLocalCustomEntry = {
    id: 'species-aeld-alterian',
    name: 'Alterian (Newest Local Edit)',
    description: 'Newest Local Description',
    updatedAt: '2026-10-12T12:00:00.000Z'
  };

  saveOmnicortexCustomEntry('species', newerLocalCustomEntry);

  const merged = mergeSeedsWithDocs([olderDocFromFirestore], 'species');
  const alterian = merged.find(s => s.id === 'species-aeld-alterian');

  assert.ok(alterian);
  assert.equal(alterian.name, 'Alterian (Newest Local Edit)', 'Local newer edit must take priority over stale cloud doc');
  assert.equal(alterian.description, 'Newest Local Description');
});

test('Omnicortex Persistence: Newly created species not in DEFAULT_SPECIES are preserved', () => {
  mockStorage.clear();

  const brandNewSpecies = {
    id: 'species-custom-chronomancer',
    name: 'Chronomancer Xenotype',
    title: 'Temporal Voidborn',
    category: 'species',
    description: 'Entities that exist across overlapping temporal phases.',
    costs: { bp: 50 },
    updatedAt: new Date().toISOString()
  };

  saveOmnicortexCustomEntry('species', brandNewSpecies);

  const merged = mergeSeedsWithDocs([], 'species');
  const found = merged.find(s => s.id === 'species-custom-chronomancer');

  assert.ok(found, 'Brand new custom species must appear in merged catalog');
  assert.equal(found.name, 'Chronomancer Xenotype');
  assert.equal(found.costs.bp, 50);
});

test('Omnicortex Persistence: removeOmnicortexCustomEntry cleans up local custom entries', () => {
  mockStorage.clear();

  const customAlterian = {
    id: 'species-aeld-alterian',
    name: 'Alterian (Temporary Edit)',
    category: 'species'
  };

  saveOmnicortexCustomEntry('species', customAlterian);
  assert.ok(getOmnicortexCustomEntries().species['species-aeld-alterian']);

  removeOmnicortexCustomEntry('species', 'species-aeld-alterian');
  assert.equal(getOmnicortexCustomEntries().species['species-aeld-alterian'], undefined);

  // Once removed, mergeSeedsWithDocs returns the original canonical seed
  const merged = mergeSeedsWithDocs([], 'species');
  const alterian = merged.find(s => s.id === 'species-aeld-alterian');
  assert.ok(alterian);
  assert.equal(alterian.name, 'Alterian', 'Should revert to canonical seed name when custom entry is deleted');
});

test('Omnicortex Persistence: Tombstones prevent deleted seeds from resurrecting', () => {
  mockStorage.clear();

  addOmnicortexTombstone('species-aeld-alterian');
  const tombstones = getOmnicortexTombstones();
  assert.ok(tombstones.includes('species-aeld-alterian'));

  const merged = mergeSeedsWithDocs([], 'species');
  const alterian = merged.find(s => s.id === 'species-aeld-alterian');
  assert.equal(alterian, undefined, 'Tombstoned seed must not appear in merged list');

  // Clearing tombstone restores it
  clearOmnicortexTombstones('species');
  const restored = mergeSeedsWithDocs([], 'species');
  const restoredAlterian = restored.find(s => s.id === 'species-aeld-alterian');
  assert.ok(restoredAlterian, 'Cleared tombstone allows canonical seed to reappear');
});
