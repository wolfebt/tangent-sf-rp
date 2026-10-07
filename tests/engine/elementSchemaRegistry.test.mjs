/**
 * @file elementSchemaRegistry.test.mjs
 * @description Keeps the Story Foundry element type registry, schema map, and Firestore rules in sync.
 * 1. Every selectable ELEMENT_TYPES entry has an ELEMENT_SCHEMAS definition.
 * 2. Every ELEMENT_SCHEMAS key is either a selectable type or an explicit ELEMENT_SCHEMA_ALIASES entry.
 * 3. Every relational field's dbSource collection is covered by a firestore.rules match block.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  ELEMENT_TYPES,
  ELEMENT_SCHEMAS,
  ELEMENT_SCHEMA_ALIASES
} from '../../src/pages/Foundry/ElementForge/elementSchemas.js';

test('Element Registry: every ELEMENT_TYPES entry has a schema', () => {
  const missing = ELEMENT_TYPES.filter(t => !Array.isArray(ELEMENT_SCHEMAS[t]));
  assert.deepEqual(missing, [], `Types without schemas: ${missing.join(', ')}`);
});

test('Element Registry: every schema key is a selectable type or a registered alias', () => {
  const known = new Set([...ELEMENT_TYPES, ...ELEMENT_SCHEMA_ALIASES]);
  const orphans = Object.keys(ELEMENT_SCHEMAS).filter(k => !known.has(k));
  assert.deepEqual(orphans, [], `Unregistered schema keys: ${orphans.join(', ')}`);
});

test('Element Registry: aliases are not also selectable types', () => {
  const overlap = ELEMENT_SCHEMA_ALIASES.filter(a => ELEMENT_TYPES.includes(a));
  assert.deepEqual(overlap, []);
});

test('Element Registry: relational dbSource collections are covered by firestore.rules', () => {
  const rules = fs.readFileSync(fileURLToPath(new URL('../../firestore.rules', import.meta.url)), 'utf-8');
  const sources = new Set();
  for (const fields of Object.values(ELEMENT_SCHEMAS)) {
    for (const f of fields) {
      if (f.type === 'relational' && f.dbSource) sources.add(f.dbSource);
    }
  }
  assert.ok(sources.size > 0, 'Expected at least one relational field');
  const uncovered = [...sources].filter(s => !new RegExp(`match\\s+/${s}/\\{`).test(rules));
  assert.deepEqual(uncovered, [], `dbSource collections missing a rules block: ${uncovered.join(', ')}`);
});
