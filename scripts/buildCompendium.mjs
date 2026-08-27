import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { rolesArticles } from './data_roles.mjs';
import { creationArticles } from './data_creation.mjs';
import { resolutionArticles } from './data_resolution.mjs';
import { combatArticles } from './data_combat.mjs';
import { metaphysicsArticles } from './data_metaphysics.mjs';
import { technologyArticles } from './data_technology.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const compendiumDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');
const seedJsonPath = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');

if (!fs.existsSync(compendiumDir)) {
  fs.mkdirSync(compendiumDir, { recursive: true });
}

// Clean old files in compendiumDir
const oldFiles = fs.readdirSync(compendiumDir);
for (const f of oldFiles) {
  if (f.endsWith('.md')) {
    fs.unlinkSync(path.join(compendiumDir, f));
  }
}

const allArticles = [
  ...rolesArticles,
  ...creationArticles,
  ...resolutionArticles,
  ...combatArticles,
  ...metaphysicsArticles,
  ...technologyArticles
];

console.log('\n======================================================');
console.log('  COMPILING OMNICORTEX CANONICAL COMPENDIUM (50+ ENTRIES)');
console.log('======================================================\n');

const volumeCounts = {};

for (const article of allArticles) {
  const frontmatter = [
    '---',
    `id: "${article.id}"`,
    `name: "${article.name.replace(/"/g, '\\"')}"`,
    `category: "compendium"`,
    `entry_type: "${article.entry_type || 'Core Rule'}"`,
    `parent: "${(article.parent || '').replace(/"/g, '\\"')}"`,
    `order: ${article.order || 0}`,
    `costs:`,
    `  bp: 0`,
    `  credits: 0`,
    `  nodes: 0`,
    `  sockets: 0`,
    `  strain: 0`,
    `  focus: 0`,
    `  ap: 0`,
    `modifiers: []`,
    `modifications: []`,
    `critical_details:`,
    `  score: ''`,
    `  effect: []`,
    `  success_effect: []`,
    `  failure_effect: []`,
    `sockets:`,
    `  max: 0`,
    `  used: 0`,
    `  tier: Socket`,
    `  allocated: []`,
    '---',
    ''
  ].join('\n');

  let body = article.description ? article.description.trim() : '';
  if (article.mechanic && !body.includes('## Game Mechanics Rules')) {
    body += `\n\n## Game Mechanics Rules\n\`\`\`\n${article.mechanic.trim()}\n\`\`\``;
  }
  if (article.guide && !body.includes('## Gameplay Instructions')) {
    body += `\n\n## Gameplay Instructions\n${article.guide.trim()}`;
  }
  if (article.note && !body.includes('## Designer Notes')) {
    body += `\n\n## Designer Notes\n${article.note.trim()}`;
  }

  const fileContent = frontmatter + body + '\n';
  const filePath = path.join(compendiumDir, `${article.id}.md`);
  fs.writeFileSync(filePath, fileContent, 'utf8');

  const vol = article.parent || 'Standalone';
  volumeCounts[vol] = (volumeCounts[vol] || 0) + 1;
}

// Save complete seed JSON
fs.writeFileSync(seedJsonPath, JSON.stringify(allArticles, null, 2), 'utf8');

console.log('Successfully generated articles by volume:');
for (const [vol, count] of Object.entries(volumeCounts)) {
  console.log(`  - [${vol}]: ${count} full articles`);
}

console.log(`\nTotal Compendium Articles: ${allArticles.length}`);
console.log(`Generated JSON Seed: ${seedJsonPath}`);
console.log(`Generated Markdown Files in: ${compendiumDir}\n`);
