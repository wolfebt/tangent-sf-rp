import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const PREFERRED_ARCH_ORDER = [
  '02 ECONOMY AND WEALTH.md',
  '99. .ARCHETYPES.md',
  '99. MODULAR CHARACTER MATRIX.md',
  '99. MODULAR SPECIES MATRIX.md',
  '99. MODULAR FACTION MATRIX.md',
  '99. MODULAR COMPANION MATRIX.md',
  '99. MODULAR PLANETARY MATRIX.md',
  '99. TECHNOLOGY.md',
  '99. TECHNOLOGY, WEAPONRY MATRIX.md',
  '99. TECHNOLOGY, ARMOR MATRIX.md',
  '99. TECHNOLOGY, EQUIPMENT MATRIX.md',
  '99. TECHNOLOGY, AUGMENTATIONS MATRIX.md',
  '99. TECHNOLOGY, MECHA MATRIX.md',
  '99. TECHNOLOGY, ARCHITECTURAL MATRIX.md',
  '99. METAPHYSICS (1).md',
  '99. METAPHYSICS, INVOCATION MATRIX (1).md',
  '99. METAPHYSICS, META-TECH MATRIX (1).md'
];

/**
 * Recursively scans directory and all subdirectories for markdown (.md) rule files.
 */
function scanRuleFiles(rulesDir) {
  const discovered = [];

  function traverse(currentDir, relBranch = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        const subRel = relBranch ? `${relBranch}/${entry.name}` : entry.name;
        traverse(fullPath, subRel);
      } else if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith('.md') &&
        !entry.name.toLowerCase().endsWith('.bak') &&
        !entry.name.startsWith('.')
      ) {
        discovered.push({
          fullPath,
          fileName: entry.name,
          relBranch: relBranch.toLowerCase()
        });
      }
    }
  }

  traverse(rulesDir);
  return discovered;
}

/**
 * Determines parent section, category, perspective, and entry_type based on subfolder.
 */
function getSectionMetadata(relBranch, fileName) {
  const branchNormalized = (relBranch || '').toLowerCase();

  if (branchNormalized === 'operator' || branchNormalized.startsWith('operator/')) {
    return {
      parent: '1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)',
      category: 'operator_rule',
      perspective: 'operator',
      entry_type: 'Core Rule',
      subfolderKey: 'operator'
    };
  }

  if (branchNormalized === 'architect' || branchNormalized.startsWith('architect/')) {
    return {
      parent: '5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)',
      category: 'architect_matrix',
      perspective: 'architect',
      entry_type: 'Architect Matrix',
      subfolderKey: 'architect'
    };
  }

  // Fallback for custom or newly added subfolders/rules
  const cleanBranch = branchNormalized.replace(/[^a-z0-9]+/g, ' ').trim();
  const titleBranch = cleanBranch ? cleanBranch.toUpperCase() : 'CORE';
  return {
    parent: `${titleBranch} RULES (SOURCE OF TRUTH)`,
    category: `${(cleanBranch || 'core').replace(/\s+/g, '_')}_rule`,
    perspective: 'both',
    entry_type: 'Game Rule',
    subfolderKey: cleanBranch.replace(/\s+/g, '-') || 'core'
  };
}

/**
 * Sorts discovered files within a branch naturally or according to canonical preferences.
 */
function sortBranchFiles(branchKey, files) {
  if (branchKey === 'architect') {
    return [...files].sort((a, b) => {
      const idxA = PREFERRED_ARCH_ORDER.indexOf(a.fileName);
      const idxB = PREFERRED_ARCH_ORDER.indexOf(b.fileName);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  // Default natural collation sort (e.g. 1.00, 1.01 ... 1.10, 2.00, etc.)
  return [...files].sort((a, b) =>
    a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' })
  );
}

/**
 * Synchronizes all markdown files from `docs/game rules` and all subfolders into
 * `src/data/compendiumSeed.json` and `src/data/omnicortex/compendium/*.md`.
 */
export function syncCanonicalCompendium({ silent = false } = {}) {
  let rulesDir = path.join(projectRoot, 'docs', 'game rules');
  if (!fs.existsSync(rulesDir)) {
    rulesDir = path.join(projectRoot, '..', 'docs', 'game rules');
  }

  if (!fs.existsSync(rulesDir)) {
    throw new Error(`Rules directory not found: ${rulesDir}`);
  }

  const SEED_PATH = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');
  const MD_OUTPUT_DIR = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');

  if (!fs.existsSync(MD_OUTPUT_DIR)) {
    fs.mkdirSync(MD_OUTPUT_DIR, { recursive: true });
  }

  if (!silent) {
    console.log(`=== SYNCING CANONICAL COMPENDIUM FROM RULES DIRECTORY ===`);
    console.log(`Source: ${rulesDir}`);
  }

  const rawFiles = scanRuleFiles(rulesDir);
  if (!silent) {
    console.log(`Discovered ${rawFiles.length} markdown rule file(s) across all subfolders.`);
  }

  // Group by branch for accurate ordering
  const branchMap = new Map();
  for (const f of rawFiles) {
    const meta = getSectionMetadata(f.relBranch, f.fileName);
    const branchKey = meta.subfolderKey;
    if (!branchMap.has(branchKey)) {
      branchMap.set(branchKey, { meta, files: [] });
    }
    branchMap.get(branchKey).files.push(f);
  }

  // Order branches: operator first, then architect, then any others
  const orderedBranchKeys = Array.from(branchMap.keys()).sort((a, b) => {
    if (a === 'operator') return -1;
    if (b === 'operator') return 1;
    if (a === 'architect') return -1;
    if (b === 'architect') return 1;
    return a.localeCompare(b);
  });

  const finalArticles = [];

  for (const branchKey of orderedBranchKeys) {
    const { meta, files } = branchMap.get(branchKey);
    const sortedFiles = sortBranchFiles(branchKey, files);

    sortedFiles.forEach((fileObj, idx) => {
      const content = fs.readFileSync(fileObj.fullPath, 'utf8');
      const stats = fs.statSync(fileObj.fullPath);
      const cleanFileName = fileObj.fileName.replace(/\.md$/i, '').trim();

      // Normalize article ID: strip non-alphanumerics, strip trailing -1 duplicate artifact
      const rawSlug = cleanFileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      const normalizedSlug = rawSlug.replace(/-1$/, '');
      const articleId = `doc-${meta.subfolderKey}-${normalizedSlug}`;

      // Format clean, single canonical article name without doubling
      const docName = cleanFileName
        .replace(/\s*\(\d+\)$/, '') // removes trailing copy index like (1)
        .replace(/\s*\(work\)/i, '') // cleans work tag
        .replace(/\.\s*\.+/, '. ') // fixes '99. .ARCHETYPES' -> '99. ARCHETYPES'
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const docArticle = {
        id: articleId,
        name: docName,
        category: meta.category,
        parent: meta.parent,
        order: idx + 1,
        perspective: meta.perspective,
        entry_type: meta.entry_type,
        tl: 3,
        ml: 0,
        cost: 0,
        tags: [
          meta.subfolderKey,
          'core-rules',
          'source-of-truth',
          cleanFileName.toLowerCase(),
          meta.subfolderKey === 'architect' ? 'matrix' : 'mechanics'
        ],
        description: content,
        mechanic: `See full canonical text in ${fileObj.fileName}`,
        guide: `Refer to ${fileObj.fileName} in the game rules library for complete architectural tables and system parameters.`,
        note: `Canonical Tangent SF RP rulebook reference from ${fileObj.fileName}. Complete, unabridged source of truth.`,
        updatedAt: stats.mtime.toISOString()
      };

      finalArticles.push(docArticle);
    });
  }

  // Validation checks on core combat source of truth
  const combatArt = finalArticles.find(a => a.id === 'doc-operator-3-00-combat');
  if (combatArt) {
    assert(combatArt.description.includes('2d10'), 'Combat doc must state 2d10 resolution');
    assert(combatArt.description.includes('DEFENDER WINS ALL TIES'), 'Combat doc must state DEFENDER WINS ALL TIES');
  }

  // Clean stale/orphaned .md files in MD_OUTPUT_DIR that are no longer in finalArticles
  const activeFileNames = new Set(finalArticles.map(a => `${a.id}.md`));
  const existingFiles = fs.readdirSync(MD_OUTPUT_DIR).filter(f => f.endsWith('.md'));
  let purgedCount = 0;
  for (const file of existingFiles) {
    if (!activeFileNames.has(file)) {
      fs.unlinkSync(path.join(MD_OUTPUT_DIR, file));
      purgedCount++;
    }
  }

  // Write out all individual markdown files in MD_OUTPUT_DIR
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

  // Write out consolidated compendiumSeed.json
  fs.writeFileSync(SEED_PATH, JSON.stringify(finalArticles, null, 2), 'utf8');

  if (!silent) {
    if (purgedCount > 0) {
      console.log(`Purged ${purgedCount} stale markdown files from ${MD_OUTPUT_DIR}`);
    }
    console.log(`Saved master compendium seed to ${SEED_PATH} (${(fs.statSync(SEED_PATH).size / 1024).toFixed(1)} KB)`);
    console.log(`Wrote ${finalArticles.length} canonical markdown articles to ${MD_OUTPUT_DIR}`);
    console.log('=== SYNC COMPLETE ===\n');
  }

  return {
    totalArticles: finalArticles.length,
    purgedCount,
    articles: finalArticles
  };
}

// Direct CLI invocation
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  syncCanonicalCompendium();
}
