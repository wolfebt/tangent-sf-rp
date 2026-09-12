import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

articles.forEach((a, idx) => {
  const isDirectDoc = a.id.startsWith('doc-');
  console.log(`[${idx}] ${a.id} | ${a.name} | parent: ${a.parent} | directDoc: ${isDirectDoc} | len: ${a.description?.length}`);
});
