import fs from 'fs';
import path from 'path';

const docsDir = 'docs/game rules';

function replaceInText(text) {
  let updated = text;

  // 1. Phrases
  updated = updated.replace(/Build Points \(BP\)/g, 'Character Points (CP)');
  updated = updated.replace(/Build Point \(BP\)/g, 'Character Point (CP)');
  updated = updated.replace(/Character Points \(BP\)/g, 'Character Points (CP)');
  updated = updated.replace(/Character Point \(BP\)/g, 'Character Point (CP)');
  
  updated = updated.replace(/BUILD POINTS/g, 'CHARACTER POINTS');
  updated = updated.replace(/BUILD POINT/g, 'CHARACTER POINT');
  updated = updated.replace(/Build Points/g, 'Character Points');
  updated = updated.replace(/Build Point/g, 'Character Point');
  updated = updated.replace(/build points/g, 'character points');
  updated = updated.replace(/build point/g, 'character point');

  // 2. Specific headers, markdown bolds, table columns
  updated = updated.replace(/\|(\s*)BP(\s*)\|/g, '|$1CP$2|');
  updated = updated.replace(/\|(\s*)BP&nbsp;(\s*)\|/g, '|$1CP&nbsp;$2|');
  updated = updated.replace(/\*\*BP Cost:\*\*/g, '**CP Cost:**');
  updated = updated.replace(/\*\*BP Cost\*\*/g, '**CP Cost**');
  updated = updated.replace(/\*\*BP:\*\*/g, '**CP:**');
  updated = updated.replace(/\*\*BP\*\*/g, '**CP**');
  updated = updated.replace(/TOTAL BP/g, 'TOTAL CP');
  updated = updated.replace(/Total BP/g, 'Total CP');
  updated = updated.replace(/total BP/g, 'total CP');
  updated = updated.replace(/BP Cost/g, 'CP Cost');
  updated = updated.replace(/BP cost/g, 'CP cost');
  updated = updated.replace(/BP Breakdown/g, 'CP Breakdown');
  updated = updated.replace(/BP breakdown/g, 'CP breakdown');
  updated = updated.replace(/BP Tally/g, 'CP Tally');
  updated = updated.replace(/BP tally/g, 'CP tally');
  updated = updated.replace(/BP Value/g, 'CP Value');
  updated = updated.replace(/BP value/g, 'CP value');
  updated = updated.replace(/BP Pool/g, 'CP Pool');
  updated = updated.replace(/BP pool/g, 'CP pool');
  updated = updated.replace(/BP Budget/g, 'CP Budget');
  updated = updated.replace(/BP budget/g, 'CP budget');

  // 3. Numbers followed by BP or in brackets/parens
  // e.g. 150 BP, 5 BP, -1 BP, [1 BP], (40 BP), < 50 BP, +10 BP
  updated = updated.replace(/\[(-?\d+)\s*BP\]/g, '[$1 CP]');
  updated = updated.replace(/\((-?\d+)\s*BP\)/g, '($1 CP)');
  updated = updated.replace(/([+\-<>~]?\s*\d+)\s*BP\b/g, '$1 CP');

  // 4. Standalone (BP)
  updated = updated.replace(/\(BP\)/g, '(CP)');

  // 5. Any remaining context where BP is an isolated word
  // e.g. "spending BP", "like BP", "their BP", "via BP", "Player BP"
  updated = updated.replace(/\bBP\b/g, 'CP');

  return updated;
}

let modifiedFiles = 0;
let totalReplacements = 0;

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(full);
    } else if (entry.name.endsWith('.md')) {
      const original = fs.readFileSync(full, 'utf8');
      const updated = replaceInText(original);
      if (updated !== original) {
        fs.writeFileSync(full, updated, 'utf8');
        modifiedFiles++;
        console.log(`[UPDATED] ${full}`);
      }
    }
  }
}

console.log('Starting BP -> CP migration in docs/game rules...');
processDir(docsDir);
console.log(`Finished. Updated ${modifiedFiles} files.`);
