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
    const refundVal = Math.abs(typeof data.refundCP === 'number' ? data.refundCP : (typeof data.refundBP === 'number' ? data.refundBP : (typeof data.costs?.cp === 'number' ? data.costs.cp : (typeof data.costs?.bp === 'number' ? data.costs.bp : (typeof data.costBP === 'number' ? data.costBP : 2)))));
    const refundCP = refundVal;
    const refundBP = refundVal;

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
      rules = `Hindrance: Grants ${refundCP} CP refund upon selection.`;
    }

    const rawDisObj = {
      id,
      code: id.replace('disadvantage-', '').replace('species-', ''),
      name,
      category: 'disadvantages',
      disadvantage_type: disType,
      classification,
      type: classification,
      refundCP,
      refundBP,
      cp: -refundCP,
      bp: -refundBP,
      costs: { cp: -refundCP, bp: -refundBP },
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

/**
 * Normalizes and enriches a hindrance or disadvantage record with canonical fallback defaults
 * @param {Object|string} item - Hindrance object or name string
 * @returns {Object} Enriched hindrance dataset object
 */
export const getEnrichedHindranceData = (item) => {
  if (!item) return null;
  const rawObj = typeof item === 'object' && item !== null ? item : { name: String(item) };
  const rawName = rawObj.name || rawObj.title || 'Hindrance';
  const cleanId = rawObj.id || \`disadvantage-\${rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}\`;

  const canonical = DEFAULT_SPECIES_DISADVANTAGES.find(d => 
    (d.id && (d.id.toLowerCase() === cleanId.toLowerCase() || d.id.toLowerCase().replace(/^disadvantage-/, '') === cleanId.toLowerCase().replace(/^disadvantage-/, ''))) ||
    (d.name && d.name.toLowerCase() === rawName.toLowerCase()) ||
    (d.code && d.code.toLowerCase() === rawName.toLowerCase())
  );

  const name = canonical?.name || rawName;
  const id = rawObj.id || canonical?.id || cleanId;
  const category = 'disadvantages';
  const disadvantage_type = rawObj.disadvantage_type || canonical?.disadvantage_type || rawObj.type || canonical?.type || 'Disadvantage';
  const classification = rawObj.classification || canonical?.classification || 'General';
  const refundCP = Number(rawObj.refundCP ?? canonical?.refundCP ?? rawObj.refund_cp ?? (rawObj.cp !== undefined ? Math.abs(Number(rawObj.cp)) : (canonical?.cp !== undefined ? Math.abs(Number(canonical.cp)) : 3))) || 0;
  const cp = rawObj.cp !== undefined ? Number(rawObj.cp) : (canonical?.cp !== undefined ? Number(canonical.cp) : -refundCP);
  const bp = rawObj.bp !== undefined ? Number(rawObj.bp) : (canonical?.bp !== undefined ? Number(canonical.bp) : cp);
  const desc = rawObj.description || rawObj.desc || canonical?.description || canonical?.desc || '';
  const mechanic = rawObj.mechanic || rawObj.mechanics || canonical?.mechanic || canonical?.mechanics || '';
  const prerequisite = rawObj.prerequisite || canonical?.prerequisite || 'None';
  const rules = rawObj.rules || rawObj.special_rules || canonical?.rules || canonical?.special_rules || \`Hindrance: Grants \${refundCP} CP refund upon selection.\`;
  const body = rawObj.body || canonical?.body || '';
  const modifiers = Array.isArray(rawObj.modifiers) && rawObj.modifiers.length > 0 ? rawObj.modifiers : (canonical?.modifiers || []);
  const notes = rawObj.notes || canonical?.notes || '';
  const notesList = Array.isArray(rawObj.notesList) ? rawObj.notesList : (canonical?.notesList || (notes ? [notes] : []));

  return {
    ...(canonical || {}),
    ...rawObj,
    id,
    name,
    title: name,
    category,
    disadvantage_type,
    classification,
    type: classification,
    refundCP,
    refund_cp: refundCP,
    refundBP: Number(rawObj.refundBP ?? canonical?.refundBP ?? refundCP),
    cp,
    bp,
    costs: {
      cp,
      bp,
      ...(canonical?.costs || {}),
      ...(rawObj.costs || {})
    },
    prerequisite,
    desc,
    description: desc,
    mechanic,
    mechanics: mechanic,
    rules,
    special_rules: rules,
    body,
    modifiers,
    notes,
    notesList
  };
};

export const getEnrichedDisadvantageData = getEnrichedHindranceData;
`;

  fs.writeFileSync(targetFile, outputCode, 'utf8');
  console.log(`Successfully synced ${disadvantagesList.length} canonical disadvantages to: ${targetFile}`);
}

syncDisadvantages();
