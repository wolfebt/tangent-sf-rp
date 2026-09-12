import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

console.log(`Total compendium articles: ${articles.length}`);

// Let's inspect every article that is not directDoc (startsWith('doc-'))
const customArticles = articles.filter(a => !a.id.startsWith('doc-'));
console.log(`Custom/synthesized articles: ${customArticles.length}`);

customArticles.forEach(a => {
  const flags = [];
  const text = (a.name || '') + ' ' + (a.description || '') + ' ' + (a.mechanic || '');
  if (text.match(/\bd20\b/i)) flags.push('has_d20');
  if (text.match(/Tier 0 to Tier 5/i)) flags.push('tier0_to_5_scaling');
  if (text.match(/Armor Hardness Multiplier/i)) flags.push('synthetic_armor_hardness');
  if (text.match(/Super-Dreadnought/i)) flags.push('synthetic_scale_tier');
  if (flags.length > 0) {
    console.log(`[FLAG] ${a.id} (${a.name}): ${flags.join(', ')}`);
  }
});
