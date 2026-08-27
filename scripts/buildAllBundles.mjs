import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const scriptsDir = path.join(projectRoot, 'scripts');

const buildSteps = [
  { name: 'Species', script: 'syncOmnicortexSpecies.mjs' },
  { name: 'Features', script: 'syncOmnicortexFeatures.mjs' },
  { name: 'Traits', script: 'syncSpeciesTraits.mjs' },
  { name: 'Disadvantages', script: 'syncSpeciesDisadvantages.mjs' },
  { name: 'Factions', script: 'syncOmnicortexFactions.mjs' },
  { name: 'Sizes', script: 'buildSpeciesSize.mjs' },
  { name: 'Movement', script: 'bridgeSpeciesMovement.mjs' },
  { name: 'Equipment & Invocations', script: 'syncOmnicortexEquipment.mjs' },
  { name: 'Compendium Seed', script: 'compileCompendium.mjs' }
];

console.log('================================================================');
console.log('  TANGENT SF RP — MASTER DATA BUNDLE COMPILATION PIPELINE');
console.log('================================================================\n');

const startTime = Date.now();
let successCount = 0;

for (const step of buildSteps) {
  const scriptPath = path.join(scriptsDir, step.script);
  if (!fs.existsSync(scriptPath)) {
    console.warn(`[SKIP] Script not found: ${step.script}`);
    continue;
  }

  process.stdout.write(`Compiling ${step.name.padEnd(26)}... `);
  try {
    execSync(`node "${scriptPath}"`, {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    console.log('[OK]');
    successCount++;
  } catch (err) {
    console.log('[FAILED]');
    console.error(err.stderr ? err.stderr.toString() : err.message);
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
console.log('\n----------------------------------------------------------------');
console.log(`Compilation Finished in ${elapsed}s: ${successCount}/${buildSteps.length} modules successfully built.`);
console.log('----------------------------------------------------------------\n');
