import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const synthetic = articles.filter(a => !a.id.startsWith('doc-'));
console.log(`Total modular/synthetic articles: ${synthetic.length}`);

// Group by source module if possible, or print IDs
synthetic.forEach((a, i) => {
  console.log(`[${i}] ${a.id} | ${a.name} | parent: ${a.parent}`);
});
