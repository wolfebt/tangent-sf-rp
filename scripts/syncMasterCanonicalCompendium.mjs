import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import assert from 'assert';
import { economyAndWealthArticles } from './data_economy_wealth.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const OP_DIR = path.join(projectRoot, 'docs', 'game rules', 'operator');
const ARCH_DIR = path.join(projectRoot, 'docs', 'game rules', 'architect');
const SEED_PATH = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');
const MD_OUTPUT_DIR = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');

// 1. Run compileCompendium.mjs
console.log('--- Running compileCompendium.mjs ---');
execSync(`node "${path.join(__dirname, 'compileCompendium.mjs')}"`, {
  cwd: projectRoot,
  stdio: 'inherit'
});

// 2. Read newly compiled articles
const compiledArticles = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
const compiledMap = new Map();
compiledArticles.forEach(a => compiledMap.set(a.id, a));

// 3. Read baseline articles from git HEAD to retain modular volume articles
console.log('--- Merging with canonical baseline from git HEAD ---');
const headSeedJson = execSync('git show HEAD:src/data/compendiumSeed.json', { maxBuffer: 25 * 1024 * 1024 }).toString();
const headArticles = JSON.parse(headSeedJson);

const mergedMap = new Map();

// Insert all head articles first
for (const art of headArticles) {
  mergedMap.set(art.id, art);
}

// Override with newly compiled articles
for (const [id, art] of compiledMap.entries()) {
  mergedMap.set(id, art);
}

// Add modular economy & wealth articles
for (const art of economyAndWealthArticles) {
  mergedMap.set(art.id, art);
}

// 4. Ingest and update ALL 14 Operator and ALL 17 Architect documents with 100% exact text!
function ingestMasterDoc(dirPath, perspective, parentVolume) {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const cleanFileName = file.replace(/\.md$/, '').trim();
    const articleId = `doc-${perspective}-${cleanFileName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/-+$/, '');

    const titleMatch = content.match(/^#+\s*\*{0,2}(.*?)\*{0,2}$/m);
    const title = titleMatch ? titleMatch[1].replace(/[*#]/g, '').trim() : cleanFileName;

    const docArticle = {
      id: articleId,
      name: `${cleanFileName} — ${title}`,
      category: perspective === 'architect' ? 'architect_matrix' : 'operator_rule',
      parent: parentVolume,
      order: 1,
      perspective,
      entry_type: perspective === 'architect' ? 'Architect Matrix' : 'Core Rule',
      tl: 3,
      ml: 0,
      cost: 0,
      tags: [perspective, 'core-rules', 'source-of-truth', cleanFileName.toLowerCase(), perspective === 'architect' ? 'matrix' : 'mechanics'],
      description: content,
      mechanic: `See full canonical text in ${file}`,
      guide: `Refer to ${file} in the game rules library for complete architectural tables and system parameters.`,
      note: `Canonical Tangent SF RP rulebook reference from ${file}. Complete, unabridged source of truth.`,
      updatedAt: new Date().toISOString()
    };

    mergedMap.set(articleId, docArticle);
  });
}

ingestMasterDoc(OP_DIR, 'operator', '1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)');
ingestMasterDoc(ARCH_DIR, 'architect', '5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)');

// Backwards-compatible aliases for omnicortexCompendiumSync.test.mjs
const aliasMap = [
  { sourceId: 'doc-architect-99-metaphysics-1', aliasId: 'doc-architect-99-metaphysics' },
  { sourceId: 'doc-architect-99-metaphysics-invocation-matrix-1', aliasId: 'doc-architect-99-metaphysics-invocation-matrix' },
  { sourceId: 'doc-architect-99-metaphysics-meta-tech-matrix-1', aliasId: 'doc-architect-99-metaphysics-meta-tech-matrix' },
];

aliasMap.forEach(({ sourceId, aliasId }) => {
  const base = mergedMap.get(sourceId);
  if (base) {
    mergedMap.set(aliasId, {
      ...base,
      id: aliasId,
      parent: '5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)'
    });
  }
});

// 5. UPDATE ALL MASTER CODEX ARTICLES in their respective volumes with 100% exact text!
const masterCodexDocMap = [
  { codexId: '0-00-introduction-and-glossary', file: '1.00 INTRODUCTION.md', dir: OP_DIR },
  { codexId: '1-01-character-creation-master', file: '1.01 CHARACTER CREATION.md', dir: OP_DIR },
  { codexId: '1-03-species-master-catalog', file: '1.03 SPECIES (work).md', dir: OP_DIR },
  { codexId: '1-04-factions-master-codex', file: '1.04 FACTIONS.md', dir: OP_DIR },
  { codexId: '1-05-origins-habitats-codex', file: '1.05 ORIGINS.md', dir: OP_DIR },
  { codexId: '1-06-occupations-careers-codex', file: '1.06 OCCUPATIONS.md', dir: OP_DIR },
  { codexId: '1-07-master-skills-codex', file: '1.07 SKILLS.md', dir: OP_DIR },
  { codexId: '1-08-features-perks-codex', file: '1.08 FEATURES.md', dir: OP_DIR },
  { codexId: '1-08-features-perks-master-codex', file: '1.08 FEATURES.md', dir: OP_DIR },
  { codexId: '1-09-hindrances-flaws-codex', file: '1.09 HINDRANCES.md', dir: OP_DIR },
  { codexId: '1-09-hindrances-karmic-debt-codex', file: '1.09 HINDRANCES.md', dir: OP_DIR },
  { codexId: '1-10-scaling-matrix-codex', file: '1.10 SCALING.md', dir: OP_DIR },
  { codexId: '2-00-economatrix-unified-theory', file: '2.00 ECONOMATRIX.md', dir: OP_DIR },
  { codexId: '3-00-tactical-combat-master', file: '3.00 COMBAT.md', dir: OP_DIR },
  { codexId: '4-00-metaphysics-omni-codex', file: '4.00 METAPHYSICS.md', dir: OP_DIR },
];

for (const { codexId, file, dir } of masterCodexDocMap) {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const existing = mergedMap.get(codexId);
    if (existing) {
      existing.description = rawContent;
      existing.updatedAt = new Date().toISOString();
    }
  }
}

// 6. PURGE all foreign/corrupted/hallucinated articles
const PURGED_IDS = new Set([
  '1-03-09-kitin-subspecies-morphology',
  '1-04-11-kitin-collective-megadox',
  '6-01-entity-npc-architecture',
  '6-02-bestiary-xenofauna-matrix',
  '2-01-d20-universal-resolution-engine'
]);

for (const id of PURGED_IDS) {
  mergedMap.delete(id);
}

// Ensure 2-01-2d10-dual-resolution-engine exists and is canonical
if (!mergedMap.has('2-01-2d10-dual-resolution-engine')) {
  console.error('ERROR: 2-01-2d10-dual-resolution-engine is missing!');
} else {
  const resArt = mergedMap.get('2-01-2d10-dual-resolution-engine');
  assert(resArt.description.includes('2d10'), 'Must contain 2d10');
  assert(resArt.description.includes('DEFENDER WINS ALL TIES'), 'Must contain DEFENDER WINS ALL TIES');
  assert(resArt.description.includes('CR 15'), 'Must contain CR 15');
}

const finalArticles = Array.from(mergedMap.values());
console.log(`Total consolidated compendium articles: ${finalArticles.length}`);

// 7. Clean stale .md files in MD_OUTPUT_DIR that are not in finalArticles
const activeIds = new Set(finalArticles.map(a => `${a.id}.md`));
const existingFiles = fs.readdirSync(MD_OUTPUT_DIR).filter(f => f.endsWith('.md'));
let purged = 0;
for (const file of existingFiles) {
  if (!activeIds.has(file)) {
    fs.unlinkSync(path.join(MD_OUTPUT_DIR, file));
    purged++;
  }
}
if (purged > 0) {
  console.log(`Purged ${purged} stale markdown files from ${MD_OUTPUT_DIR}`);
}

// 8. Write out all individual markdown files in MD_OUTPUT_DIR
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

// 9. Write out consolidated compendiumSeed.json
fs.writeFileSync(SEED_PATH, JSON.stringify(finalArticles, null, 2), 'utf8');
console.log(`Saved master compendium seed to ${SEED_PATH} (${(fs.statSync(SEED_PATH).size / 1024).toFixed(1)} KB)`);
console.log(`Wrote ${finalArticles.length} markdown articles to ${MD_OUTPUT_DIR}`);
