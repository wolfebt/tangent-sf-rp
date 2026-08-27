import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const speciesDir = path.join(rootDir, 'src', 'data', 'omnicortex', 'species');
const targetFile = path.join(rootDir, 'src', 'data', 'speciesData.js');

export const SPECIES_LINEAGES = [
  {
    id: 'aeld',
    name: 'Aeld',
    description: 'Long-lived, graceful beings possessing innate arcane affinity, high technology, and specialized sub-species adaptations.'
  },
  {
    id: 'asi',
    name: 'Asi (Fey Lineages)',
    description: 'Ageless fey entities connected to the primal forces of nature, illusion, and multidimensional realms.'
  },
  {
    id: 'aulurans',
    name: 'Aulurans',
    description: 'Biotechnological feline predators organized into distinct physical castes (Dar, Koda, Graa, Prokos).'
  },
  {
    id: 'humans',
    name: 'Humans (Core & Variants)',
    description: 'The versatile, ubiquitous baseline of the galaxy along with regional environmental adaptations.'
  },
  {
    id: 'gene',
    name: 'Engineered Humans (Gen-E)',
    description: 'Laboratory-optimized transhumans, psionic lines, and specialized military combat castes.'
  },
  {
    id: 'kitin',
    name: 'Kitin',
    description: 'Chitinous insectoid beings connected via hive psionics, ranging from diplomatic humanoids to colossus swarm forms.'
  },
  {
    id: 'synthetics',
    name: 'Synthetics',
    description: 'Mechanical, silicon, and digitized entities, from androids and scraps to pure intellect cores and crystalline eidolons.'
  },
  {
    id: 'shanor',
    name: "Sha'Nor & Void Lineages",
    description: "Semi-corporeal beings born of deep void rifts, wielding reality-warping and spectral powers."
  },
  {
    id: 'progenitors',
    name: 'Progenitors',
    description: 'Ancient deific precursors of immense intellect, matter manipulation, and dimensional mastery.'
  },
  {
    id: 'independent',
    name: 'Independent Xenotypes',
    description: 'Diverse sentient alien species native to unique planetary biomes across the Reach.'
  }
];

function syncSpecies() {
  if (!fs.existsSync(speciesDir)) {
    console.error(`Species directory not found at: ${speciesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} species markdown files in ${speciesDir}`);

  const speciesList = [];

  for (const file of files) {
    const fullPath = path.join(speciesDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || file.replace(/\.md$/, '');
    const name = data.name || id;
    const title = data.title || name;
    const category = data.category || 'species';
    const parentSpecies = data.parent_species || 'Independent Xenotypes';

    const speciesObj = {
      id,
      name,
      title,
      category,
      parent_species: parentSpecies,
      type: Array.isArray(data.type) ? data.type : (data.type ? [data.type] : ['species_type-humanoid']),
      size: Array.isArray(data.size) ? data.size : (data.size ? [data.size] : ['species_size-medium']),
      movement: Array.isArray(data.movement) ? data.movement : (data.movement ? [data.movement] : ['species_movement-bipedal']),
      inherent_attribute_modifiers: Array.isArray(data.inherent_attribute_modifiers) ? data.inherent_attribute_modifiers : [],
      bonus_attribute_points: typeof data.bonus_attribute_points === 'number' ? data.bonus_attribute_points : 0,
      specific_skill_bonuses: Array.isArray(data.specific_skill_bonuses) ? data.specific_skill_bonuses : [],
      bonus_skills: typeof data.bonus_skills === 'number' ? data.bonus_skills : 0,
      bonus_skill_choices: Array.isArray(data.bonus_skill_choices) ? data.bonus_skill_choices : [],
      inherent_features: Array.isArray(data.inherent_features) ? data.inherent_features : [],
      bonus_features: typeof data.bonus_features === 'number' ? data.bonus_features : 0,
      bonus_feature_choices: Array.isArray(data.bonus_feature_choices) ? data.bonus_feature_choices : [],
      recommended_features: Array.isArray(data.recommended_features) ? data.recommended_features : [],
      stigma: data.stigma || 'None',
      tech_level: data.tech_level ? String(data.tech_level) : '3',
      meta_level: data.meta_level ? String(data.meta_level) : '1',
      homeworld: data.homeworld || 'Unknown',
      cp_cost: typeof data.cp_cost === 'number' ? data.cp_cost : (typeof data.cp === 'number' ? data.cp : 10),
      cp: typeof data.cp === 'number' ? data.cp : (typeof data.cp_cost === 'number' ? data.cp_cost : 10),
      description: data.description || '',
      body: body
    };

    speciesList.push(speciesObj);
  }

  // Sort by parent_species then name
  speciesList.sort((a, b) => {
    const parentComp = (a.parent_species || '').localeCompare(b.parent_species || '');
    if (parentComp !== 0) return parentComp;
    return (a.name || '').localeCompare(b.name || '');
  });

  const outputCode = `/**
 * Canonical Species Catalog for Tangent Science Fantasy Roleplaying Game (SFF RPG)
 * Auto-generated by scripts/syncOmnicortexSpecies.mjs from src/data/omnicortex/species/
 * Total Species Count: ${speciesList.length}
 */

export const SPECIES_LINEAGES = ${JSON.stringify(SPECIES_LINEAGES, null, 2)};

export const DEFAULT_SPECIES = ${JSON.stringify(speciesList, null, 2)};

export const getSpeciesById = (id) => DEFAULT_SPECIES.find(s => s.id === id);

export const getSpeciesByLineage = (lineageName) => 
  DEFAULT_SPECIES.filter(s => (s.parent_species || '').toLowerCase() === (lineageName || '').toLowerCase());

export const getSpeciesBpCost = (speciesObj) => {
  if (!speciesObj) return 0;
  return parseInt(speciesObj.cp_cost || speciesObj.cp || 0, 10);
};
`;

  fs.writeFileSync(targetFile, outputCode, 'utf8');
  console.log(`Successfully synced ${speciesList.length} canonical species to: ${targetFile}`);
}

syncSpecies();
