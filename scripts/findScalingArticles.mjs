import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

console.log("=== COMPENDIUM ARTICLES WITH 'SCALE' OR 'SCALING' ===");
articles.forEach(a => {
  if (a.name.toLowerCase().includes('scale') || a.id.toLowerCase().includes('scale')) {
    console.log(`ID: ${a.id} | Name: ${a.name} | Parent: ${a.parent}`);
  }
});
