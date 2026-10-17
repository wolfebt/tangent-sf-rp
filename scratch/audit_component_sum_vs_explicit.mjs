import fs from 'fs';

Promise.all([
  import('../src/data/speciesData.js'),
  import('../src/engines/tangentEntityEngines.js')
]).then(([sMod, eMod]) => {
  const speciesList = sMod.DEFAULT_SPECIES;
  console.log(`Checking component sums for all ${speciesList.length} species:\n`);

  let mismatches = 0;
  speciesList.forEach(s => {
    const bpData = eMod.calculateSpeciesBP(s);
    const explicitBP = s.costs?.bp ?? s.cp_cost;
    const computedBP = bpData.totalBPUsed;

    if (computedBP !== explicitBP) {
      mismatches++;
      console.log(`[MISMATCH] ${s.name} (${s.id}):`);
      console.log(`   Declared/Explicit: ${explicitBP} BP`);
      console.log(`   Computed Component Sum: ${computedBP} BP (diff: ${computedBP - explicitBP})`);
      console.log(`   Breakdown: Type(${bpData.breakdown.typeBP}) + Size(${bpData.breakdown.sizeBP}) + Move(${bpData.breakdown.movementBP}) + Attr(${bpData.breakdown.attributeBP}) + Skills(${bpData.breakdown.skillsBP}) + Traits(${bpData.breakdown.traitsBP}) - Disadv(${bpData.breakdown.disadvantagesRefund}) - Stigma(${bpData.breakdown.stigmaRefund}) = ${computedBP} BP\n`);
    }
  });

  console.log(`Total Mismatches between Declared and Computed Component Sum: ${mismatches} / ${speciesList.length}`);
});
