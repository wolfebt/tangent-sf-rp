import { DEFAULT_SPECIES_MOVEMENT } from '../src/data/speciesMovementData.js';

console.log('=== TOTAL MOVEMENT ENTRIES:', DEFAULT_SPECIES_MOVEMENT.length, '===\n');

DEFAULT_SPECIES_MOVEMENT.forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.id}] "${m.name}" | Type: ${m.type} | Speed: ${m.speed} | BP: ${m.bp} | Desc: ${(m.description || '').slice(0, 80)}`);
});