import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

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
      const mechMatch = body.match(/## Mechanics & Effect[s]?\s*([\s\S]*?)(?=##|$)/i);
      if (mechMatch) mechanics = mechMatch[1].trim();
    }

    const disObj = {
      id,
      code: id.replace('disadvantage-', '').replace('species-', ''),
      name,
      category: 'disadvantages',
      disadvantage_type: disType,
      classification,
      type: classification,
      refundBP,
      costBP: -refundBP,
      costs: data.costs || { bp: -refundBP, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
      prerequisite: data.prerequisite || data.prerequisites || 'None',
      desc: data.description || '',
      description: data.description || '',
      mechanics,
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      body
    };

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
