import { DEFAULT_SPECIES } from '../src/data/speciesData.js';
import { calculateSpeciesBP, calculateFullSpeciesCost } from '../src/engines/tangentEntityEngines.js';

console.log(`Auditing ${DEFAULT_SPECIES.length} species...`);
const mismatches = [];
let totalAudited = 0;

for (const species of DEFAULT_SPECIES) {
  totalAudited++;
  const fullCost = calculateFullSpeciesCost(species);
  const currentCost = species.costs?.bp ?? species.cp_cost ?? species.cp ?? 10;
  
  if (fullCost.totalCost !== currentCost) {
    mismatches.push({
      id: species.id,
      name: species.name,
      currentCost,
      calculatedCost: fullCost.totalCost,
      breakdown: fullCost.breakdown,
      itemizedSummary: fullCost.summaryParts
    });
  }
}

console.log(`Audited: ${totalAudited} species.`);
console.log(`Mismatches: ${mismatches.length}`);

if (mismatches.length > 0) {
  console.log('\nMismatch details (first 15):');
  console.log(JSON.stringify(mismatches.slice(0, 15), null, 2));
} else {
  console.log('All species costs match calculated component sum 100%!');
}
