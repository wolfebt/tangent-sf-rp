import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const rulesDir = path.join(projectRoot, 'docs', 'game rules');
const seedPath = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');
const compendiumMdDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');

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

// 1. Check Scaling Rule 1.10
const docScaling = articles.find(a => a.id === 'doc-operator-1-10-scaling');
assert(Boolean(docScaling), 'Canonical 1.10 SCALING source doc exists in compendium');
assert(
  Boolean(docScaling && docScaling.description.includes('Miniscule') && docScaling.description.includes('Mega Colossal')),
  '1.10 SCALING contains 14-Tier Size Matrix',
  'Expected 14 size tiers from Miniscule to Mega Colossal'
);
assert(
  Boolean(docScaling && docScaling.description.includes('Proximity Damage')),
  '1.10 SCALING includes Starship Proximity Damage rules'
);

// 2. Check Combat Attack Engine (3.00 COMBAT)
const combatDoc = articles.find(a => a.id === 'doc-operator-3-00-combat');
assert(Boolean(combatDoc && combatDoc.description.includes('2d10')), '3.00 COMBAT uses 2d10 core engine');
assert(Boolean(combatDoc && combatDoc.description.includes('DEFENDER WINS ALL TIES')), '3.00 COMBAT enforces DEFENDER WINS ALL TIES');

// 3. Check Economatrix & EUFT (2.00 ECONOMATRIX & 02 ECONOMY AND WEALTH)
const econDoc = articles.find(a => a.id === 'doc-operator-2-00-economatrix');
const archEconDoc = articles.find(a => a.id === 'doc-architect-02-economy-and-wealth');
assert(Boolean(econDoc && archEconDoc), '2.00 ECONOMATRIX and 02 ECONOMY AND WEALTH exist in compendium');
assert(Boolean(archEconDoc && archEconDoc.description.includes('Tangent Standard Curve')), '02 ECONOMY AND WEALTH adheres to Tangent Standard Curve');

// 4. Check All 265 Canonical Source Files (224 Operator + 41 Architect)
function scanRuleFiles(dir) {
  const discovered = [];
  function traverse(currentDir, relBranch = '') {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        const subRel = relBranch ? `${relBranch}/${entry.name}` : entry.name;
        if (subRel.replace(/\\/g, '/').toLowerCase() === 'architect/archetypes') {
          continue;
        }
        traverse(fullPath, subRel);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md') && !entry.name.startsWith('.')) {
        const normalizedRelBranch = relBranch.replace(/\\/g, '/');
        if (
          normalizedRelBranch.toLowerCase() === 'architect' &&
          entry.name.toLowerCase().includes('archetypes')
        ) {
          continue;
        }
        discovered.push({
          fullPath,
          fileName: entry.name,
          relPath: `${normalizedRelBranch}/${entry.name}`
        });
      }
    }
  }
  traverse(dir);
  return discovered;
}

const diskRuleFiles = scanRuleFiles(rulesDir);
assert(articles.length === diskRuleFiles.length, `1-to-1 file parity between docs/game rules and compendiumSeed.json (${articles.length}/${diskRuleFiles.length})`);

const opArticles = articles.filter(a => a.id.startsWith('doc-operator-'));
const archArticles = articles.filter(a => a.id.startsWith('doc-architect-'));
assert(opArticles.length === 224, `All 224 Operator rulebook & modular articles registered (got ${opArticles.length}/224)`);
assert(archArticles.length === 41, `All 41 Architect matrix & modular articles registered (got ${archArticles.length}/41)`);

// 5. Verify 100% Exact Content Fidelity against docs/game rules/*.md
const byRelPath = new Map(articles.map(a => [a.relPath.toLowerCase(), a]));
let contentMismatches = 0;
for (const rf of diskRuleFiles) {
  const art = byRelPath.get(rf.relPath.toLowerCase());
  if (!art || art.description !== fs.readFileSync(rf.fullPath, 'utf8')) {
    contentMismatches++;
  }
}
assert(contentMismatches === 0, `100% byte-for-byte text fidelity across all ${diskRuleFiles.length} rulebook .md files (mismatches: ${contentMismatches})`);

// 6. Verify OmniCortex Compendium Markdown Directory Parity
const compendiumMdFiles = fs.readdirSync(compendiumMdDir).filter(f => f.endsWith('.md'));
assert(compendiumMdFiles.length === articles.length, `OmniCortex compendium/*.md count matches compendiumSeed.json (${compendiumMdFiles.length}/${articles.length})`);

// 7. Verify Parent-Child Hierarchy & Clean Titles
const validRoots = new Set([
  '1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)',
  '5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)'
]);
const byId = new Map(articles.map(a => [a.id, a]));
const brokenParents = articles.filter(a => !validRoots.has(a.parent) && !byId.has(a.parent));
assert(brokenParents.length === 0, `Zero broken parent links in Compendium hierarchy (broken: ${brokenParents.length})`);

const criminalOcc = articles.find(a => a.id === 'doc-operator-1-06-criminal');
assert(criminalOcc && criminalOcc.name === '1.06 Criminal', `Occupation Criminal title is clean ("${criminalOcc?.name}")`);

const planetaryAstro = articles.find(a => a.id === 'doc-architect-99-planetary-astrophysicsandgeophysics');
assert(planetaryAstro && planetaryAstro.name === 'Planetary: Astrophysics, Geophysics & Biosphere', `Planetary Matrix title is clean ("${planetaryAstro?.name}")`);

console.log("\n=================================================================");
console.log(`AUDIT RESULTS: ${passedTests}/${totalTests} tests passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log("=================================================================");

if (passedTests < totalTests) process.exit(1);
