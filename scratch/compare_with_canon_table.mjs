import fs from 'fs';
import path from 'path';

Promise.all([
  import('../src/data/speciesData.js'),
  import('../src/data/speciesTraitsData.js')
]).then(([sMod, tMod]) => {
  const speciesList = sMod.DEFAULT_SPECIES;
  const content = fs.readFileSync('docs/game rules/operator/1.03 SPECIES (work).md', 'utf8');

  // Extract table rows between line 19 and line 111
  const lines = content.split('\n');
  const tableRows = [];
  for (let i = 18; i < 111; i++) {
    const line = lines[i]?.trim();
    if (line && line.startsWith('|') && !line.includes('SPECIES / SUBSPECIES') && !line.includes('---')) {
      tableRows.push(line);
    }
  }

  console.log(`Found ${tableRows.length} canonical table rows.`);

  const parsedCanon = [];
  for (const row of tableRows) {
    const cols = row.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length >= 2) {
      const nameCol = cols[0];
      const typeCol = cols[1] || '';
      const attrCol = cols[2] || '';
      const skillCol = cols[3] || '';
      const traitsCol = cols[4] || '';
      const stigmaCol = cols[5] || '';
      const totalCol = cols[6] || '';

      parsedCanon.push({
        rawName: nameCol,
        cleanName: nameCol.replace(/\*\*/g, '').replace(/^-/, '').trim(),
        typeCol,
        attrCol,
        skillCol,
        traitsCol,
        stigmaCol,
        totalCol: totalCol ? parseInt(totalCol, 10) : null
      });
    }
  }

  // Compare with speciesList
  console.log(`Comparing ${parsedCanon.length} canon entries against ${speciesList.length} system species:\n`);

  parsedCanon.forEach(canon => {
    // Find matching species
    const matched = speciesList.find(s => {
      const sName = s.name.toLowerCase();
      const cName = canon.cleanName.toLowerCase();
      return sName === cName || sName.includes(cName) || cName.includes(sName);
    });

    if (matched) {
      const sysBP = matched.costs?.bp ?? matched.cp_cost;
      console.log(`[MATCH] Canon: "${canon.cleanName}" | System: "${matched.name}" [${sysBP} BP]`);
      console.log(`        Type: ${canon.typeCol} | Attr: ${canon.attrCol} | Skills: ${canon.skillCol} | Traits: ${canon.traitsCol} | Stigma: ${canon.stigmaCol}`);
      if (canon.totalCol !== null) {
        console.log(`        Canon Total: ${canon.totalCol} BP vs System: ${sysBP} BP`);
      }
    } else {
      console.log(`[UNMATCHED CANON] "${canon.cleanName}"`);
    }
  });
});
