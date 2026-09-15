import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const OP_DIR = path.join(projectRoot, 'docs', 'game rules', 'operator');
const ARCH_DIR = path.join(projectRoot, 'docs', 'game rules', 'architect');
const SEED_PATH = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');
const MD_OUTPUT_DIR = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');

if (!fs.existsSync(MD_OUTPUT_DIR)) {
  fs.mkdirSync(MD_OUTPUT_DIR, { recursive: true });
}

// 1. First run compileCompendium.mjs to generate base compiled articles
console.log('--- Running compileCompendium.mjs ---');
execSync(`node "${path.join(__dirname, 'compileCompendium.mjs')}"`, {
  cwd: projectRoot,
  stdio: 'inherit'
});

// 2. Read newly compiled articles
const compiledArticles = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
const compiledMap = new Map();
compiledArticles.forEach(a => compiledMap.set(a.id, a));

// 3. Read canonical articles from git HEAD to restore any missing canonical volume articles
console.log('--- Merging with canonical baseline from git HEAD ---');
const headSeedJson = execSync('git show HEAD:src/data/compendiumSeed.json', { maxBuffer: 25 * 1024 * 1024 }).toString();
const headArticles = JSON.parse(headSeedJson);

const mergedMap = new Map();

// Insert all head articles first
for (const art of headArticles) {
  mergedMap.set(art.id, art);
}

// Override or add newly compiled articles
for (const [id, art] of compiledMap.entries()) {
  mergedMap.set(id, art);
}

// 4. Update doc-operator-1-04-factions and 1-04-factions-master-codex with full 1.04 FACTIONS.md text
const factionsRaw = fs.readFileSync(path.join(OP_DIR, '1.04 FACTIONS.md'), 'utf8');

const docFactions = mergedMap.get('doc-operator-1-04-factions');
if (docFactions) {
  docFactions.description = factionsRaw;
  docFactions.updatedAt = new Date().toISOString();
}

const masterCodex = mergedMap.get('1-04-factions-master-codex');
if (masterCodex) {
  masterCodex.description = factionsRaw;
  masterCodex.updatedAt = new Date().toISOString();
}

const finalArticles = Array.from(mergedMap.values());
console.log(`Total consolidated compendium articles: ${finalArticles.length}`);

// 5. Clean stale .md files in MD_OUTPUT_DIR that are not in finalArticles
const activeIds = new Set(finalArticles.map(a => a.id));
const existingFiles = fs.readdirSync(MD_OUTPUT_DIR).filter(f => f.endsWith('.md'));
let purged = 0;
for (const file of existingFiles) {
  const id = file.replace(/\.md$/, '');
  if (!activeIds.has(id)) {
    fs.unlinkSync(path.join(MD_OUTPUT_DIR, file));
    purged++;
  }
}
if (purged > 0) {
  console.log(`Purged ${purged} stale markdown files from ${MD_OUTPUT_DIR}`);
}

// 6. Write out all individual markdown files in MD_OUTPUT_DIR
for (const art of finalArticles) {
  const filePath = path.join(MD_OUTPUT_DIR, `${art.id}.md`);
  const content = `---
id: "${art.id}"
name: "${(art.name || '').replace(/"/g, '\\"')}"
category: "${art.category || 'compendium'}"
parent: "${(art.parent || '').replace(/"/g, '\\"')}"
order: ${art.order || 0}
perspective: "${art.perspective || 'both'}"
entry_type: "${art.entry_type || 'Core Rule'}"
tl: ${art.tl ?? 3}
ml: ${art.ml ?? 0}
cost: ${art.cost ?? 0}
tags: ${JSON.stringify(art.tags || ['compendium'])}
updatedAt: "${art.updatedAt || new Date().toISOString()}"
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
modifiers: []
modifications: []
critical_details:
  score: ''
  effect: []
  success_effect: []
  failure_effect: []
sockets:
  max: 0
  used: 0
  tier: Socket
  allocated: []
---

${art.description || ''}

## Game Mechanics Rules
\`\`\`
${art.mechanic || ''}
\`\`\`

## Gameplay Instructions
${art.guide || ''}

## Designer Notes
${art.note || ''}
`;
  fs.writeFileSync(filePath, content, 'utf8');
}

// 7. Write out consolidated compendiumSeed.json
fs.writeFileSync(SEED_PATH, JSON.stringify(finalArticles, null, 2), 'utf8');
console.log(`Saved master compendium seed to ${SEED_PATH} (${(fs.statSync(SEED_PATH).size / 1024).toFixed(1)} KB)`);
console.log(`Wrote ${finalArticles.length} markdown articles to ${MD_OUTPUT_DIR}`);
