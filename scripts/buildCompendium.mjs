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

// Clean old files
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

console.log(\n======================================================);
console.log(  COMPILING OMNICORTEX CANONICAL COMPENDIUM (50+ ENTRIES));
console.log(======================================================\n);

const volumeCounts = {};

for (const article of allArticles) {
  const frontmatter = [
    '---',
    id: "",
    
ame: "",
    category: "compendium",
    entry_type: "",
    parent: "",
    order: ,
    '---',
    ''
  ].join('\n');

  const fileContent = frontmatter + article.description.trim() + '\n';
  const filePath = path.join(compendiumDir, ${article.id}.md);
  fs.writeFileSync(filePath, fileContent, 'utf8');

  const vol = article.parent || 'Standalone';
  volumeCounts[vol] = (volumeCounts[vol] || 0) + 1;
}

// Save complete seed JSON
fs.writeFileSync(seedJsonPath, JSON.stringify(allArticles, null, 2), 'utf8');

console.log('Successfully generated articles by volume:');
for (const [vol, count] of Object.entries(volumeCounts)) {
  console.log(  - []:  full articles);
}

console.log(\nTotal Compendium Articles: );
console.log(Generated JSON Seed: );
console.log(Generated Markdown Files in: \n);
