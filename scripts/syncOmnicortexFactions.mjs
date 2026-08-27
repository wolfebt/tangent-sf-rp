import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const factionsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'factions');
const targetFile = path.join(projectRoot, 'src', 'data', 'factionsData.js');

function syncFactions() {
  if (!fs.existsSync(factionsDir)) {
    console.error(`Factions directory not found at: ${factionsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(factionsDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} faction markdown files in ${factionsDir}`);

  const factionsList = [];

  for (const file of files) {
    const fullPath = path.join(factionsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || file.replace(/\.md$/, '');
    const name = data.name || data.title || id;

    const factionObj = {
      id,
      name,
      category: 'factions',
      faction_type: data.faction_type || 'Major Polity',
      archetype: data.archetype || '',
      driving_mandate: data.driving_mandate || '',
      symbol_sigil: data.symbol_sigil || '',
      capital_world: data.capital_world || '',
      tech_level: data.tech_level ? String(data.tech_level) : '3',
      meta_level: data.meta_level ? String(data.meta_level) : '0',
      skill_package: Array.isArray(data.skill_package) ? data.skill_package : (data.skill_package ? [data.skill_package] : []),
      description: data.description || '',
      costs: data.costs || { bp: 0, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      modifications: Array.isArray(data.modifications) ? data.modifications : [],
      critical_details: data.critical_details || { score: '', effect: [], success_effect: [], failure_effect: [] },
      sockets: data.sockets || { max: 0, used: 0, tier: 'Socket', allocated: [] },
      faction_classification: data.faction_classification || 'Faction Template',
      body
    };

    factionsList.push(factionObj);
  }

  factionsList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Factions Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/factions/
 * Total Factions: ${factionsList.length}
 */

export const DEFAULT_FACTIONS = ${JSON.stringify(factionsList, null, 2)};

export const getFactionById = (id) => DEFAULT_FACTIONS.find(f => f.id === id);
`;

  fs.writeFileSync(targetFile, outputCode, 'utf8');
  console.log(`Successfully synced ${factionsList.length} canonical factions to: ${targetFile}`);
}

syncFactions();
