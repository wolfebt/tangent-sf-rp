import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const doc110 = articles.find(a => a.id.includes('1-10') || a.id.includes('scaling'));
console.log("Found doc110:", doc110 ? doc110.id : "none");

const matches110 = articles.filter(a => a.id.toLowerCase().includes('1-10') || a.name.toLowerCase().includes('1.10'));
console.log("Matches for 1.10:", matches110.map(m => ({ id: m.id, name: m.name, parent: m.parent })));
