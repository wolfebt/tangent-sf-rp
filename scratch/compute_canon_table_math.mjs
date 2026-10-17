import fs from 'fs';

Promise.all([
  import('../src/data/speciesData.js'),
  import('../src/data/speciesTraitsData.js'),
  import('../src/engines/tangentEntityEngines.js')
]).then(([sMod, tMod, eMod]) => {
  const speciesList = sMod.DEFAULT_SPECIES;
  const content = fs.readFileSync('docs/game rules/operator/1.03 SPECIES (work).md', 'utf8');

  const lines = content.split('\n');
  const results = [];

  for (let i = 18; i < 111; i++) {
    const line = lines[i]?.trim();
    if (!line || !line.startsWith('|') || line.includes('SPECIES / SUBSPECIES') || line.includes('---')) continue;

    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 2) continue;

    const rawName = cols[0];
    const cleanName = rawName.replace(/\*\*/g, '').replace(/^[-—\s]+/, '').trim();
    
    // Skip lineage header rows
    if (['AELD', 'ASI', 'AULURANS', 'KITIN', 'PROGENITORS', 'SYNTHETICS', 'HUMANS', 'ENGINEERED HUMANS'].includes(cleanName.toUpperCase())) {
      continue;
    }

    const typeCol = cols[1] || '';
    const attrCol = cols[2] || '';
    const skillCol = cols[3] || '';
    const traitsCol = cols[4] || '';
    const stigmaCol = cols[5] || '';
    const totalCol = cols[6] || '';

    // Extract numbers in [X] or (-X)
    const extractCost = (str) => {
      let sum = 0;
      // match \[X\] or [X]
      const bracketMatches = str.match(/\\?\[(-?\d+)\\?\]/g) || [];
      bracketMatches.forEach(m => {
        const numMatch = m.match(/-?\d+/);
        if (numMatch) sum += parseInt(numMatch[0], 10);
      });
      // also check for (-X) if no brackets (e.g. in stigma)
      const parenMatches = str.match(/\((-?\d+)\)/g) || [];
      parenMatches.forEach(m => {
        const numMatch = m.match(/-?\d+/);
        if (numMatch) sum += parseInt(numMatch[0], 10);
      });
      return sum;
    };

    // Extract chassis cost e.g. Humanoid (0), Beast (1), Fey (3), etc.
    let typeCost = 0;
    const typeMatch = typeCol.match(/\((-?\d+)\)/);
    if (typeMatch) {
      typeCost = parseInt(typeMatch[1], 10);
    }

    const attrCost = extractCost(attrCol);
    const skillCost = extractCost(skillCol);
    const traitCost = extractCost(traitsCol);
    const stigmaCost = extractCost(stigmaCol);

    const calculatedCanonTotal = typeCost + attrCost + skillCost + traitCost + stigmaCost;

    // Find in speciesList
    const matched = speciesList.find(s => {
      const sName = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return sName === cName || sName.startsWith(cName) || cName.startsWith(sName);
    });

    results.push({
      cleanName,
      typeCost,
      attrCost,
      skillCost,
      traitCost,
      stigmaCost,
      calculatedCanonTotal,
      declaredCanonTotal: totalCol ? parseInt(totalCol, 10) : null,
      matched: matched ? {
        id: matched.id,
        name: matched.name,
        systemBP: matched.costs?.bp ?? matched.cp_cost
      } : null
    });
  }

  console.log(`Audited ${results.length} canonical species rows:\n`);
  
  let mismatches = 0;
  results.forEach(r => {
    if (r.matched) {
      const canonSum = r.calculatedCanonTotal;
      const sysBP = r.matched.systemBP;
      const declared = r.declaredCanonTotal;
      
      const targetCanon = declared !== null ? declared : canonSum;
      const isMismatch = sysBP !== targetCanon;
      
      if (isMismatch) {
        mismatches++;
        console.log(`[DISCREPANCY] Canon: "${r.cleanName}" vs System: "${r.matched.name}"`);
        console.log(`   Canon Sum: Type(${r.typeCost}) + Attr(${r.attrCost}) + Skills(${r.skillCost}) + Traits(${r.traitCost}) + Stigma(${r.stigmaCost}) = ${canonSum} BP`);
        if (declared !== null) console.log(`   Canon Stated Column Total: ${declared} BP`);
        console.log(`   System Current BP: ${sysBP} BP (Difference: ${sysBP - targetCanon} BP)\n`);
      } else {
        console.log(`[MATCH] ${r.cleanName} -> System: ${sysBP} BP == Canon: ${targetCanon} BP`);
      }
    } else {
      console.log(`[UNMATCHED IN SYSTEM] Canon: "${r.cleanName}"`);
    }
  });

  console.log(`\n========================================`);
  console.log(`Total Discrepancies vs Canon: ${mismatches}`);
  console.log(`========================================`);
});
