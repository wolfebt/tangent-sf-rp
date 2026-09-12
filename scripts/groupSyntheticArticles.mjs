import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const synthetic = articles.filter(a => !a.id.startsWith('doc-'));
console.log(`Total non-doc articles: ${synthetic.length}`);

const byParent = {};
synthetic.forEach(a => {
  const p = a.parent || 'No Parent';
  if (!byParent[p]) byParent[p] = [];
  byParent[p].push({ id: a.id, name: a.name });
});

for (const [p, list] of Object.entries(byParent)) {
  console.log(`\n=== Parent: ${p} (${list.length} articles) ===`);
  list.forEach(item => console.log(`  - ${item.id}: ${item.name}`));
}
