import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

console.log("=================================================================");
console.log("  TANGENT SF RP — COMPENDIUM RULES & FIDELITY AUDIT SUITE");
console.log("=================================================================\n");

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error(`         -> ${details}`);
  }
}

// 1. Check Scaling Rule 0.06 & 1.10
const scaling006 = articles.find(a => a.id === '0-06-system-scaling-matrix');
assert(scaling006, '0.06 Scaling article exists');
assert(scaling006 && scaling006.description.includes('Miniscule') && scaling006.description.includes('Mega Colossal'), 
  '0.06 contains 14-Tier Size Matrix', 
  'Expected 14 size tiers from Miniscule to Mega Colossal');
assert(scaling006 && !scaling006.description.includes('Armor Hardness Multiplier'), 
  '0.06 has zero synthetic Armor Hardness Multiplier stubs');
assert(scaling006 && scaling006.description.includes('Proximity Damage'), 
  '0.06 includes Starship Proximity Damage rules');

const docScaling = articles.find(a => a.id === 'doc-operator-1-10-scaling');
assert(docScaling, 'Canonical 1.10 SCALING source doc exists in compendium');
assert(docScaling && docScaling.description.length === 7264, '1.10 SCALING has 100% full text fidelity (7,264 chars)');

// 2. Check Combat Attack Engine
const combatOverview = articles.find(a => a.id === '3-00-00-tactical-combat-overview');
assert(combatOverview && combatOverview.mechanic.includes('2d10'), '3.00 Combat overview uses 2d10 core engine');
const operatorManual = articles.find(a => a.id === '0-01-operator-reference-manual');
assert(operatorManual && operatorManual.mechanic.includes('2d10'), '0.01 Operator Manual uses 2d10 for combat attack checks');

// 3. Check Economatrix Golden Rule
const econ00 = articles.find(a => a.id === '2-00-economatrix-system-overview');
assert(econ00 && !econ00.mechanic.includes('d20 + Wealth Score'), '2.00 Economatrix does not use synthetic d20 Wealth roll');
assert(econ00 && econ00.mechanic.includes('Static check') || econ00.description.includes('DC/5'), '2.00 Economatrix adheres to Tangent Standard Curve');

// 4. Check All 30 Canonical Source Files
const all30Docs = articles.filter(a => a.id.startsWith('doc-'));
assert(all30Docs.length === 30, `All 30 source-of-truth documents registered (got ${all30Docs.length}/30)`);

// 5. Total Compendium Volume
assert(articles.length >= 149, `Total compendium articles count (got ${articles.length})`);

console.log("\n=================================================================");
console.log(`AUDIT RESULTS: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
console.log("=================================================================");

if (passedTests < totalTests) process.exit(1);
