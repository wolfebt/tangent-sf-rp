import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { enrichItemWithModifiers } from '../src/engines/tangentModifierEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const disadvDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'disadvantages');
const targetFile = path.join(projectRoot, 'src', 'data', 'speciesDisadvantagesData.js');

function syncDisadvantages() {
  if (!fs.existsSync(disadvDir)) {
    console.error(`Disadvantages directory not found at: ${disadvDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(disadvDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} disadvantage markdown files in ${disadvDir}`);

  const disadvantagesList = [];

  for (const file of files) {
    const fullPath = path.join(disadvDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || file.replace(/\.md$/, '');
    const name = data.name || data.title || id;
    const disType = data.disadvantage_type || data.type || 'Disadvantage';
    const classification = data.classification || (disType.includes('Species') ? 'Physical' : 'General');
    const refundBP = Math.abs(typeof data.refundBP === 'number' ? data.refundBP : (typeof data.costs?.bp === 'number' ? data.costs.bp : (typeof data.costBP === 'number' ? data.costBP : 2)));

    let mechanics = data.mechanic || data.mechanics || '';
    if (!mechanics && body) {
      const mechMatch = body.match(/(?:^|\n)## Mechanics[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|$)/i);
      if (mechMatch) mechanics = mechMatch[1].trim();
    }
    if (!mechanics) {
      mechanics = data.description || '';
    }

    let rules = data.rules || data.special_rules || '';
    if (!rules && body) {
      const ruleMatch = body.match(/(?:^|\n)## Special Rules[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|$)/i);
      if (ruleMatch) rules = ruleMatch[1].trim();
    }
    if (!rules) {
      rules = `Hindrance: Grants ${refundBP} CP refund upon selection.`;
    }

    const rawDisObj = {
      id,
      code: id.replace('disadvantage-', '').replace('species-', ''),
      name,
      category: 'disadvantages',
      disadvantage_type: disType,
      classification,
      type: classification,
      refundBP,
      costs: { bp: -refundBP },
      prerequisite: data.prerequisite || data.prerequisites || 'None',
      desc: data.description || '',
      description: data.description || '',
      mechanics,
      mechanic: mechanics,
      rules,
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      body
    };

    const disObj = enrichItemWithModifiers(rawDisObj);
    disadvantagesList.push(disObj);
  }

  disadvantagesList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Disadvantages Database for Tangent SF RP (Species & General Disadvantages)
 * Auto-generated from src/data/omnicortex/disadvantages/
 * Total Disadvantages: ${disadvantagesList.length}
 */

export const DEFAULT_SPECIES_DISADVANTAGES = ${JSON.stringify(disadvantagesList, null, 2)};

// Backward-compatibility alias
export const SPECIES_DISADVANTAGES = DEFAULT_SPECIES_DISADVANTAGES;

export const getDisadvantageById = (id) => DEFAULT_SPECIES_DISADVANTAGES.find(d => d.id === id);
`;

  fs.writeFileSync(targetFile, outputCode, 'utf8');
  console.log(`Successfully synced ${disadvantagesList.length} canonical disadvantages to: ${targetFile}`);
}

syncDisadvantages();
