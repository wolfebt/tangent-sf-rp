import fs from 'fs';
import path from 'path';

async function updateWorkFile() {
  const sMod = await import('../src/data/speciesData.js');
  const speciesList = sMod.DEFAULT_SPECIES;

  const workPath = 'docs/game rules/operator/1.03 SPECIES (work).md';
  const raw = fs.readFileSync(workPath, 'utf8');
  const lines = raw.split('\n');

  const manualMap = {
    '\\- HUMANS (BASE)': 'species-human-base',
    '\\- VAREN  (Gatekeepers)': 'species-human-varen',
    'MAANTENE (Recon Expression)': 'species-kitin-maantene',
    'MANELLI (Cerebral Expression)': 'species-kitin-manelli',
    'RAKNE (Infiltration Expression)': 'species-kitin-rakne',
    'RIEZEN (Divergent Swarm)': 'species-kitin-riezen',
    'SYNDESS (Pilot Expression)': 'species-kitin-syndess',
    'MUREX (Foundation Expression)': 'species-kitin-murex',
    '\\- EIDOLON  (Aetherion)': 'species-synthetic-eidolon',
    'GEN-E': 'species-gene-base',
    'ORLL': 'species-orll-base',
    '\\- GRA\'OR': 'species-orll-graor',
    'SHA’NOR': 'species-shanor-base',
    '\\- SENTIENT MACHINE': 'species-synthetic-sentient-machine'
  };

  let tableUpdated = 0;

  for (let i = 18; i <= 109; i++) {
    const line = lines[i]?.trim();
    if (!line || !line.startsWith('|') || line.includes('---')) continue;
    const cols = line.split('|').map(c => c.trim());
    // cols[0] is empty before first |, cols[1] is name, cols[2] type, cols[3] attr, cols[4] skills, cols[5] traits, cols[6] stigma, cols[7] total, cols[8] empty
    if (cols.length < 8) continue;

    const rawName = cols[1].replace(/\*\*/g, '').replace(/^[-—\s]+/, '').trim();
    if (['AELD', 'ASI', 'AULURANS', 'KITIN', 'PROGENITORS', 'SYNTHETICS', 'HUMANS', 'ENGINEERED HUMANS'].includes(rawName.toUpperCase())) {
      continue;
    }

    let targetId = manualMap[cols[1].replace(/\*\*/g, '').trim()];
    if (!targetId) {
      const cNorm = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = speciesList.find(s => {
        const sNorm = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const idNorm = s.id.replace(/^species-/, '').replace(/[^a-z0-9]/g, '');
        return sNorm === cNorm || idNorm === cNorm || sNorm.includes(cNorm) || cNorm.includes(sNorm) || idNorm.includes(cNorm);
      });
      if (found) targetId = found.id;
    }

    if (targetId) {
      const speciesObj = speciesList.find(s => s.id === targetId);
      if (speciesObj) {
        const bp = speciesObj.costs?.bp ?? speciesObj.cp_cost;
        const newTotalCol = ` ${bp} BP `;
        
        // Rebuild line: | col1 | col2 | col3 | col4 | col5 | col6 | total |
        cols[7] = `${bp} BP`;
        lines[i] = `| ${cols.slice(1, 8).join(' | ')} |`;
        tableUpdated++;
      }
    }
  }

  console.log(`Updated ${tableUpdated} rows in the Master Table.`);
  fs.writeFileSync(workPath, lines.join('\n'), 'utf8');
}

updateWorkFile();
