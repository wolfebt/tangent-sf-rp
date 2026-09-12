import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const doc110 = articles.find(a => a.id === 'doc-operator-1-10-scaling');
if (doc110) {
  console.log("Found doc-operator-1-10-scaling!");
  console.log("Name:", doc110.name);
  console.log("Parent:", doc110.parent);
  console.log("Length:", doc110.description?.length);
  console.log("First 300 chars:\n", doc110.description?.slice(0, 300));
} else {
  console.log("doc-operator-1-10-scaling NOT FOUND!");
}
