import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

console.log(`Total articles in compendiumSeed.json: ${articles.length}\n`);

const summary = articles.map((a, i) => ({
  i,
  id: a.id,
  name: a.name,
  parent: a.parent,
  perspective: a.perspective,
  len: a.description ? a.description.length : 0
}));

console.log(JSON.stringify(summary, null, 2));
