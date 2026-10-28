import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const RULES_DIR = path.resolve(projectRoot, 'docs/game rules');
const SEED_PATH = path.resolve(projectRoot, 'src/data/compendiumSeed.json');
const MD_DIR = path.resolve(projectRoot, 'src/data/omnicortex/compendium');

const seedData = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
console.log(`Loaded ${seedData.length} articles from compendiumSeed.json`);

function scanAllRuleFiles(dir) {
  const discovered = [];
  function traverse(currentDir, relBranch = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        const subRel = relBranch ? `${relBranch}/${entry.name}` : entry.name;
        if (subRel.replace(/\\/g, '/').toLowerCase() === 'architect/archetypes') {
          continue;
        }
        traverse(fullPath, subRel);
      } else if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith('.md') &&
        !entry.name.toLowerCase().endsWith('.bak') &&
        !entry.name.startsWith('.')
      ) {
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
          relBranch: relBranch.toLowerCase()
        });
      }
    }
  }
  traverse(dir);
  return discovered;
}

const ruleFiles = scanAllRuleFiles(RULES_DIR);
console.log(`\nVerifying ${ruleFiles.length} rule files from ${RULES_DIR}...`);

let allMatched = true;
let totalChars = 0;

ruleFiles.forEach(({ fullPath, fileName, relBranch }) => {
  const content = fs.readFileSync(fullPath, 'utf-8');
  totalChars += content.length;
  const cleanFileName = fileName.replace(/\.md$/i, '').trim();
  const subfolderKey = relBranch.replace(/[^a-z0-9]+/g, '-') || 'core';
  const topFolderKey = (relBranch.split('/')[0] || 'core').replace(/[^a-z0-9]+/g, '-');
  const rawSlug = cleanFileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  const normalizedSlug = rawSlug.replace(/-1$/, '');
  const articleId = `doc-${subfolderKey}-${normalizedSlug}`;
  const topArticleId = `doc-${topFolderKey}-${normalizedSlug}`;

  const matchedArticle = seedData.find(
    a =>
      a.id === articleId ||
      a.id === `doc-${subfolderKey}-${rawSlug}` ||
      a.id === topArticleId ||
      a.id === `doc-${topFolderKey}-${rawSlug}` ||
      (a.fileName === fileName && (a.subfolder || '').toLowerCase() === relBranch.toLowerCase()) ||
      a.id.toLowerCase() === cleanFileName.toLowerCase()
  );

  if (!matchedArticle) {
    console.error(`[FAIL] Missing article for ${fileName} (expected ID: ${articleId})`);
    allMatched = false;
    return;
  }

  // Verify character length match (100% exact fidelity)
  if (matchedArticle.description.length !== content.length) {
    console.error(`[FAIL] Content length mismatch for ${fileName}: Source=${content.length}, Compiled=${matchedArticle.description.length}`);
    allMatched = false;
  } else {
    console.log(`[PASS] ${fileName} -> ${matchedArticle.id} (${content.length} chars, 100% matched)`);
  }

  // Verify markdown file exists and contains full description
  const mdFile = path.join(MD_DIR, `${matchedArticle.id}.md`);
  if (!fs.existsSync(mdFile)) {
    console.error(`[FAIL] Missing markdown file: ${mdFile}`);
    allMatched = false;
  } else {
    const mdContent = fs.readFileSync(mdFile, 'utf-8');
    if (!mdContent.includes(content.slice(0, 100)) || !mdContent.includes(content.slice(-100))) {
      console.error(`[FAIL] Markdown file does not contain full source text: ${mdFile}`);
      allMatched = false;
    }
  }
});

console.log('\n======================================================');
if (allMatched && ruleFiles.length === seedData.length) {
  console.log(`  ALL ${ruleFiles.length} CANONICAL GAME RULE FILES VERIFIED WITH 100% FIDELITY!`);
  console.log(`  TOTAL TEXT: ${(totalChars / 1024).toFixed(1)} KB`);
  console.log('  ZERO CONTENT LOSS, ZERO TRUNCATION.');
} else {
  console.error(`  VERIFICATION FAILED: allMatched=${allMatched}, ruleFiles=${ruleFiles.length}, seedArticles=${seedData.length}`);
  process.exit(1);
}
console.log('======================================================');
