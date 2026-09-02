import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { DEFAULT_OCCUPATIONS } from '../src/data/occupationsData.js';
import { ALL_CANONICAL_TRAITS } from '../src/data/speciesTraitsData.js';

const canonicalMap = new Map();
ALL_CANONICAL_TRAITS.forEach(t => {
  canonicalMap.set(t.id, t);
  const clean = t.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  canonicalMap.set(clean, t);
});

const dangling = new Set();
DEFAULT_OCCUPATIONS.forEach(occ => {
  (occ.traits || []).forEach(t => {
    const tid = typeof t === 'string' ? t : t.id;
    if (!canonicalMap.has(tid)) dangling.add(tid);
  });
});

console.log(`=== DANGLING OCCUPATION TRAITS (${dangling.size} entries) ===`);
let matchedCount = 0;
let unmatchedCount = 0;

Array.from(dangling).sort().forEach(tid => {
  const stripped = tid.replace(/^trait-[a-z]+-/, '').replace(/[^a-z0-9]/g, '');
  const match = canonicalMap.get(stripped);
  if (match) {
    matchedCount++;
    console.log(`[MATCH] ${tid} -> ${match.id} ("${match.name}")`);
  } else {
    unmatchedCount++;
    console.log(`[NO MATCH] ${tid} -> stripped "${stripped}"`);
  }
});

console.log(`\nMatched: ${matchedCount} / ${dangling.size}`);
console.log(`Unmatched: ${unmatchedCount} / ${dangling.size}`);