import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const typesDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_type');
const targetFile = path.join(projectRoot, 'src', 'data', 'speciesTypesData.js');

if (!fs.existsSync(typesDir)) {
  console.error('Types directory not found:', typesDir);
  process.exit(1);
}

const mdFiles = fs.readdirSync(typesDir).filter(f => f.endsWith('.md'));
const compiledTypes = [];

for (const file of mdFiles) {
  const filePath = path.join(typesDir, file);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  const cleanId = data.id || file.replace(/\.md$/, '');
  const name = data.name || cleanId.replace(/^species_type-/, '').replace(/^./, c => c.toUpperCase());
  const bp = Number(data.bp || data.costs?.bp || 0);

  compiledTypes.push({
    id: cleanId,
    name,
    category: 'species_type',
    bp,
    cp: bp,
    costs: {
      bp,
      credits: 0,
      nodes: 0,
      sockets: 0,
      strain: 0,
      focus: 0,
      ap: 0,
      ...(data.costs || {})
    },
    description: data.description || '',
    senses: data.senses || '',
    immunities: data.immunities || '',
    fortification: data.fortification || '',
    incorporeal: data.incorporeal || '',
    traits: data.traits || '',
    planar: data.planar || '',
    physiology: data.physiology || '',
    modifiers: data.modifiers || [],
    modifications: data.modifications || [],
    critical_details: data.critical_details || { score: '', effect: [], success_effect: [], failure_effect: [] },
    sockets: data.sockets || { max: 0, used: 0, tier: 'Socket', allocated: [] },
    mechanic: data.mechanic || '',
    note: data.note || '',
    body: content.trim()
  });
}

// Sort alphabetically by name
compiledTypes.sort((a, b) => a.name.localeCompare(b.name));

const fileHeader = `/**
 * Canonical Species Types Catalog for Tangent Science Fantasy Roleplaying Game (SFF RPG)
 * Auto-generated from src/data/omnicortex/species_type/
 * Total Species Types: ${compiledTypes.length}
 */

export const DEFAULT_SPECIES_TYPES = ${JSON.stringify(compiledTypes, null, 2)};

export const SPECIES_TYPES = DEFAULT_SPECIES_TYPES;

export const getSpeciesTypeById = (id) => DEFAULT_SPECIES_TYPES.find(t => t.id === id || t.name.toLowerCase() === String(id).toLowerCase());
`;

fs.writeFileSync(targetFile, fileHeader, 'utf8');
console.log(`[OK] Successfully compiled ${compiledTypes.length} Species Types into ${targetFile}`);
