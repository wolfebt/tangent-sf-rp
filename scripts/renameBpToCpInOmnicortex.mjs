import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const omniDir = 'src/data/omnicortex';

function replaceInBody(text) {
  let updated = text;

  // Phrases
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

  // Headings & labels
  updated = updated.replace(/\*\*BP Cost:\*\*/g, '**CP Cost:**');
  updated = updated.replace(/\*\*BP Cost\*\*:/g, '**CP Cost**:');
  updated = updated.replace(/\*\*BP Cost\*\*/g, '**CP Cost**');
  updated = updated.replace(/\*\*BP:\*\*/g, '**CP:**');
  updated = updated.replace(/\*\*BP\*\*:/g, '**CP**:');
  updated = updated.replace(/\*\*BP\*\*/g, '**CP**');
  updated = updated.replace(/\*\*BP Granted\*\*:/g, '**CP Granted**:');
  updated = updated.replace(/\*\*BP Granted:\*\*/g, '**CP Granted:**');
  updated = updated.replace(/\*\*BP Credit\*\*:/g, '**CP Credit**:');
  updated = updated.replace(/\*\*BP Credit:\*\*/g, '**CP Credit:**');

  // Tables & totals
  updated = updated.replace(/\|(\s*)BP(\s*)\|/g, '|$1CP$2|');
  updated = updated.replace(/\|(\s*)BP&nbsp;(\s*)\|/g, '|$1CP&nbsp;$2|');
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
  updated = updated.replace(/BP Credit/g, 'CP Credit');
  updated = updated.replace(/BP credit/g, 'CP credit');

  // Discounts
  updated = updated.replace(/1 BP Discount/g, '1 CP Discount');
  updated = updated.replace(/1 BP discount/g, '1 CP discount');
  updated = updated.replace(/-1 BP Discount/g, '-1 CP Discount');
  updated = updated.replace(/-1 BP discount/g, '-1 CP discount');
  updated = updated.replace(/\(-1 BP\)/g, '(-1 CP)');

  // Numeric replacements: [X BP], (X BP), X BP
  updated = updated.replace(/\[(-?\d+)\s*BP\]/g, '[$1 CP]');
  updated = updated.replace(/\((-?\d+)\s*BP\)/g, '($1 CP)');
  updated = updated.replace(/([+\-<>~]?\s*\d+)\s*BP\b/g, '$1 CP');

  // Standalone (BP)
  updated = updated.replace(/\(BP\)/g, '(CP)');

  // Any remaining isolated BP
  updated = updated.replace(/\bBP\b/g, 'CP');

  return updated;
}

let fileCount = 0;
let updatedCount = 0;

function processOmnicortexDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'compendium') {
        // Skip auto-generated compendium directory
        continue;
      }
      processOmnicortexDir(fullPath);
    } else if (entry.name.endsWith('.md')) {
      fileCount++;
      const raw = fs.readFileSync(fullPath, 'utf8');
      const parsed = matter(raw);
      const data = { ...parsed.data };
      let changed = false;

      // Ensure dual cp & bp in data.costs
      if (data.costs && typeof data.costs === 'object') {
        const bp = data.costs.bp;
        const cp = data.costs.cp;
        if (bp !== undefined && cp === undefined) {
          data.costs = { cp: bp, ...data.costs };
          changed = true;
        } else if (cp !== undefined && bp === undefined) {
          data.costs.bp = cp;
          changed = true;
        }
      } else if (data.bp !== undefined || data.cp !== undefined || data.cp_cost !== undefined) {
        const val = Number(data.cp ?? data.cp_cost ?? data.bp ?? 0);
        data.costs = { cp: val, bp: val };
        changed = true;
      }

      // Archetype chassis
      if (data.bp_chassis !== undefined && data.cp_chassis === undefined) {
        data.cp_chassis = data.bp_chassis;
        changed = true;
      }

      // Feature cost
      if (data.cost_bp !== undefined && data.cost_cp === undefined) {
        data.cost_cp = data.cost_bp;
        changed = true;
      }

      // Disadvantage granted
      if (data.bp_granted !== undefined && data.cp_granted === undefined) {
        data.cp_granted = String(data.bp_granted).replace(/\bBP\b/g, 'CP');
        changed = true;
      }

      // Package traits
      if (Array.isArray(data.package_traits)) {
        data.package_traits = data.package_traits.map(t => {
          const c = Number(t.cp ?? t.bp ?? 1);
          if (t.cp !== c || t.bp !== c) changed = true;
          return {
            ...t,
            cp: c,
            bp: c
          };
        });
      }

      // Top-level cp / bp sync for species
      if (data.category === 'species' || fullPath.includes('species\\') || fullPath.includes('species/')) {
        const cpVal = Number(data.costs?.cp ?? data.costs?.bp ?? data.cp ?? data.cp_cost ?? data.bp ?? 10);
        if (data.cp !== cpVal) { data.cp = cpVal; changed = true; }
        if (data.bp !== cpVal) { data.bp = cpVal; changed = true; }
        if (data.cp_cost !== cpVal) { data.cp_cost = cpVal; changed = true; }
      }

      // Body replacements
      const originalContent = parsed.content;
      const updatedContent = replaceInBody(originalContent);
      if (updatedContent !== originalContent) {
        changed = true;
      }

      if (changed) {
        const newFileString = matter.stringify(updatedContent, data);
        fs.writeFileSync(fullPath, newFileString, 'utf8');
        updatedCount++;
      }
    }
  }
}

console.log('Starting BP -> CP migration in src/data/omnicortex...');
processOmnicortexDir(omniDir);
console.log(`Scanned ${fileCount} files. Updated ${updatedCount} files.`);
