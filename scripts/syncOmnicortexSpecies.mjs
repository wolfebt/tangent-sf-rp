import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { DEFAULT_FEATURES } from '../src/data/featuresData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const speciesDir = path.join(rootDir, 'src', 'data', 'omnicortex', 'species');
const targetFile = path.join(rootDir, 'src', 'data', 'speciesData.js');

const validFeatureIds = new Set(DEFAULT_FEATURES.map(f => f.id.toLowerCase()));
const validFeatureNames = new Set(DEFAULT_FEATURES.map(f => f.name.toLowerCase()));

const isValidFeature = (f) => {
  if (!f) return false;
  const s = (typeof f === 'object' ? (f.id || f.name || '') : String(f)).trim().toLowerCase();
  return validFeatureIds.has(s) || 
         validFeatureNames.has(s) || 
         validFeatureIds.has(s.replace(/^feature-/, '')) || 
         validFeatureIds.has('ability-' + s.replace(/^feature-/, ''));
};

export const SPECIES_LINEAGES = [
  {
    id: 'aeld',
    name: 'Aeld (Elven Bloodlines)',
    aliases: ['Aeld', 'Aeld (Elven Bloodlines)', 'Aeld (Elven)', 'Elven Bloodlines'],
    description: 'Long-lived, graceful beings possessing innate arcane affinity, high technology, and specialized sub-species adaptations.'
  },
  {
    id: 'asi',
    name: 'Asi (Fey Lineages)',
    aliases: ['Asi', 'Asi (Fey Lineages)', 'Fey Lineages'],
    description: 'Ageless fey entities connected to the primal forces of nature, illusion, and multidimensional realms.'
  },
  {
    id: 'aulurans',
    name: 'Aulurans (Cat Folk)',
    aliases: ['Aulurans', 'Aulurans (Cat Folk)', 'Auluran', 'Cat Folk'],
    description: 'Biotechnological feline predators organized into distinct physical castes (Dar, Koda, Graa, Prokos).'
  },
  {
    id: 'humans',
    name: 'Humans (Variants)',
    aliases: ['Humans', 'Humans (Variants)', 'Humans (Core & Variants)', 'Human'],
    description: 'The versatile, ubiquitous baseline of the galaxy along with regional environmental adaptations.'
  },
  {
    id: 'gene',
    name: 'Humans (Gen-E)',
    aliases: ['Humans (Gen-E)', 'Engineered Humans (Gen-E)', 'Engineered Humans', 'Gen-E', 'gene'],
    description: 'Laboratory-optimized transhumans, psionic lines, and specialized military combat castes.'
  },
  {
    id: 'kitin',
    name: 'Kitin (Genomatrix Collective)',
    aliases: ['Kitin', 'Kitin (Genomatrix Collective)', 'Genomatrix Collective'],
    description: 'Chitinous insectoid beings connected via hive psionics, ranging from diplomatic humanoids to colossus swarm forms.'
  },
  {
    id: 'synthetics',
    name: 'Synthetics (Artificial Lifeforms)',
    aliases: ['Synthetics', 'Synthetics (Artificial Lifeforms)', 'Synthetic', 'Artificial Lifeforms'],
    description: 'Mechanical, silicon, and digitized entities, from androids and scraps to pure intellect cores and crystalline eidolons.'
  },
  {
    id: 'shanor',
    name: "Sha'Nor (Void Lineages)",
    aliases: ["Sha'Nor (Void Lineages)", "Sha'Nor & Void Lineages", "Sha'nor & Void Lineages", "Sha'Nor", "Sha'nor", "Void Lineages"],
    description: "Semi-corporeal beings born of deep void rifts, wielding reality-warping and spectral powers."
  },
  {
    id: 'progenitors',
    name: 'Progenitors (Ancients)',
    aliases: ['Progenitors', 'Progenitors (Ancients)', 'Progenitor', 'Ancients'],
    description: 'Ancient deific precursors of immense intellect, matter manipulation, and dimensional mastery.'
  },
  {
    id: 'independent',
    name: 'Independent Xenotypes',
    aliases: ['Independent Xenotypes', 'Independent', 'Xenotypes'],
    description: 'Diverse sentient alien species native to unique planetary biomes across the Reach.'
  }
];

export const resolveSpeciesLineage = (rawInput, lineagesList = SPECIES_LINEAGES) => {
  const activeList = Array.isArray(lineagesList) && lineagesList.length > 0 ? lineagesList : SPECIES_LINEAGES;
  const rawStr = typeof rawInput === 'object' && rawInput !== null
    ? String(rawInput.parent_species || rawInput.lineage || rawInput.name || '')
    : String(rawInput || '');
  const itemId = typeof rawInput === 'object' && rawInput !== null
    ? String(rawInput.id || '').toLowerCase().trim()
    : '';
  const lower = rawStr.toLowerCase().trim().replace(/^species_lineage-/, '');

  const findByIdInActive = (targetId) =>
    activeList.find(l => String(l?.id || '').toLowerCase().trim() === targetId) ||
    SPECIES_LINEAGES.find(l => l.id === targetId) ||
    null;

  if (lower) {
    const directMatch = activeList.find(l => {
      const lId = String(l?.id || '').toLowerCase().trim();
      const lName = String(l?.name || '').toLowerCase().trim();
      const lAliases = Array.isArray(l?.aliases) ? l.aliases.map(a => String(a).toLowerCase().trim()) : [];
      return lId === lower || lName === lower || lAliases.includes(lower);
    });
    if (directMatch) return directMatch;

    const canonicalMatch = SPECIES_LINEAGES.find(l => {
      const lId = l.id.toLowerCase();
      const lName = l.name.toLowerCase();
      const lAliases = (l.aliases || []).map(a => a.toLowerCase());
      return lId === lower || lName === lower || lAliases.includes(lower);
    });
    if (canonicalMatch) return findByIdInActive(canonicalMatch.id);
  }

  if (lower.includes('gen-e') || lower.includes('engineered') || lower === 'gene' || itemId.startsWith('species-gene-')) {
    return findByIdInActive('gene');
  }
  if (lower.includes('human') || itemId.startsWith('species-human-')) {
    return findByIdInActive('humans');
  }
  if (lower.includes('aeld') || lower.includes('elven') || itemId.startsWith('species-aeld-')) {
    return findByIdInActive('aeld');
  }
  if (lower.includes('asi') || lower.includes('fey') || itemId.startsWith('species-asi-')) {
    return findByIdInActive('asi');
  }
  if (lower.includes('auluran') || lower.includes('cat folk') || itemId.startsWith('species-auluran-')) {
    return findByIdInActive('aulurans');
  }
  if (lower.includes('kitin') || lower.includes('genomatrix') || itemId.startsWith('species-kitin-')) {
    return findByIdInActive('kitin');
  }
  if (lower.includes('synthetic') || lower.includes('artificial lifeform') || itemId.startsWith('species-synthetic-')) {
    return findByIdInActive('synthetics');
  }
  if (lower.includes("sha'nor") || lower.includes('shanor') || lower.includes('void lineage') || itemId.startsWith('species-shanor-')) {
    return findByIdInActive('shanor');
  }
  if (lower.includes('progenitor') || lower.includes('ancient') || itemId.startsWith('species-progenitor-')) {
    return findByIdInActive('progenitors');
  }
  if (lower.includes('independent') || lower.includes('xenotype') || itemId.startsWith('species-independent-')) {
    return findByIdInActive('independent');
  }

  return null;
};

export const resolveSpeciesLineageName = (rawInput, lineagesList = SPECIES_LINEAGES) => {
  const matched = resolveSpeciesLineage(rawInput, lineagesList);
  if (matched?.name) return matched.name;
  if (typeof rawInput === 'object' && rawInput !== null) {
    return String(rawInput.parent_species || rawInput.lineage || '');
  }
  return String(rawInput || '');
};

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
    let content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || file.replace(/\.md$/, '');
    const name = data.name || id;
    const title = data.title || name;
    const category = data.category || 'species';
    const parentSpecies = resolveSpeciesLineageName({ id, parent_species: data.parent_species }) || data.parent_species || 'Independent Xenotypes';

    if (data.parent_species && data.parent_species !== parentSpecies) {
      const updatedContent = content.replace(
        /^parent_species:\s*.*$/m,
        `parent_species: "${parentSpecies}"`
      );
      if (updatedContent !== content) {
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        content = updatedContent;
      }
    }

    const modifiers = Array.isArray(data.modifiers) ? data.modifiers : [];
    const cpVal = Number(data.costs?.cp ?? data.costs?.bp ?? data.cp ?? data.cp_cost ?? 10);
    const costs = { cp: cpVal, bp: cpVal };

    // Backward-compatibility derivation from modern modifiers:
    const inherent_attribute_modifiers = Array.isArray(data.inherent_attribute_modifiers) ? [...data.inherent_attribute_modifiers] : [];
    const specific_skill_bonuses = Array.isArray(data.specific_skill_bonuses) ? [...data.specific_skill_bonuses] : [];
    const inherent_features = Array.isArray(data.inherent_features) ? [...data.inherent_features] : [];
    const recommended_features = Array.isArray(data.recommended_features) ? [...data.recommended_features] : [];
    const recommended_traits = Array.isArray(data.recommended_traits) ? [...data.recommended_traits] : [];

    modifiers.forEach(m => {
      if (!m || typeof m !== 'object') return;
      if (m.type === 'attribute' && m.mode === 'inherent') {
        if (!inherent_attribute_modifiers.some(x => (typeof x === 'object' ? x.attribute : String(x)).toLowerCase().includes(m.target.toLowerCase()))) {
          inherent_attribute_modifiers.push({ attribute: m.target, bonus: m.value });
        }
      } else if (m.type === 'skill' && m.mode === 'inherent') {
        if (!specific_skill_bonuses.some(x => (typeof x === 'object' ? x.skill : String(x)).toLowerCase().includes(m.target.toLowerCase()))) {
          specific_skill_bonuses.push({ skill: m.target, bonus: m.value });
        }
      } else if (m.type === 'feature') {
        if (m.mode === 'inherent') {
          if (!inherent_features.includes(m.target)) inherent_features.push(m.target);
        } else if (m.mode === 'recommended') {
          if (!recommended_features.includes(m.target)) recommended_features.push(m.target);
        }
      } else if (m.type === 'trait' && m.mode === 'recommended') {
        if (!recommended_traits.includes(m.target)) recommended_traits.push(m.target);
      }
    });

    // Extract traits
    const rawTraits = Array.isArray(data.traits) ? [...data.traits] : (Array.isArray(data.species_traits) ? [...data.species_traits] : []);
    const isTrait = (item) => {
      if (!item) return false;
      const str = typeof item === 'object' ? (item.id || item.name || '') : String(item);
      const clean = str.toLowerCase().trim();
      return clean.startsWith('trait-') || clean.includes('traits-') || clean.startsWith('trait_') || clean.includes('trait');
    };

    const traits = [...rawTraits];
    const cleaned_inherent_features = [];
    inherent_features.forEach(f => {
      if (isTrait(f)) {
        const fId = typeof f === 'object' ? (f.id || f.name) : f;
        if (!traits.some(t => (typeof t === 'object' ? (t.id || t.name) : t) === fId)) {
          traits.push(f);
        }
      } else if (isValidFeature(f)) {
        cleaned_inherent_features.push(f);
      }
    });
    const cleaned_recommended_features = [];
    const cleaned_recommended_traits = [...recommended_traits];
    recommended_features.forEach(f => {
      if (isTrait(f)) {
        if (!cleaned_recommended_traits.includes(f)) cleaned_recommended_traits.push(f);
      } else if (!cleaned_recommended_features.includes(f)) {
        cleaned_recommended_features.push(f);
      }
    });

    const speciesObj = {
      id,
      name,
      title,
      category,
      parent_species: parentSpecies,
      type: Array.isArray(data.type) ? data.type : (data.type ? [data.type] : ['species_type-humanoid']),
      size: Array.isArray(data.size) ? data.size : (data.size ? [data.size] : ['species_size-medium']),
      movement: Array.isArray(data.movement) ? data.movement : (data.movement ? [data.movement] : ['species_movement-bipedal']),
      traits: traits,
      species_traits: traits,
      recommended_traits: cleaned_recommended_traits,
      disadvantages: Array.isArray(data.disadvantages) ? data.disadvantages : [],
      modifiers: modifiers,
      costs: costs,
      cp: cpVal,
      bp: cpVal,
      cp_cost: cpVal,
      inherent_attribute_modifiers: inherent_attribute_modifiers,
      bonus_attribute_points: typeof data.bonus_attribute_points === 'number' ? data.bonus_attribute_points : 0,
      specific_skill_bonuses: specific_skill_bonuses,
      bonus_skills: typeof data.bonus_skills === 'number' ? data.bonus_skills : 0,
      bonus_skill_choices: Array.isArray(data.bonus_skill_choices) ? data.bonus_skill_choices : [],
      inherent_features: cleaned_inherent_features,
      bonus_features: typeof data.bonus_features === 'number' ? data.bonus_features : 0,
      bonus_feature_choices: Array.isArray(data.bonus_feature_choices) ? data.bonus_feature_choices : [],
      recommended_features: cleaned_recommended_features,
      stigma: data.stigma || 'None',
      tech_level: data.tech_level ? String(data.tech_level) : '3',
      meta_level: data.meta_level ? String(data.meta_level) : '1',
      homeworld: data.homeworld || 'Unknown',
      cp_cost: typeof costs.bp === 'number' ? costs.bp : (typeof data.cp_cost === 'number' ? data.cp_cost : (typeof data.cp === 'number' ? data.cp : 10)),
      cp: typeof costs.bp === 'number' ? costs.bp : (typeof data.cp === 'number' ? data.cp : 10),
      recommended_factions: Array.isArray(data.recommended_factions) ? data.recommended_factions : [],
      recommended_origins: Array.isArray(data.recommended_origins) ? data.recommended_origins : [],
      recommended_occupations: Array.isArray(data.recommended_occupations) ? data.recommended_occupations : [],
      keywords: typeof data.keywords === 'string' ? data.keywords.trim() : (Array.isArray(data.keywords) ? data.keywords.join(', ') : ''),
      negative_keywords: typeof data.negative_keywords === 'string' ? data.negative_keywords.trim() : (Array.isArray(data.negative_keywords) ? data.negative_keywords.join(', ') : ''),
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

export const resolveSpeciesLineage = (rawInput, lineagesList = SPECIES_LINEAGES) => {
  const activeList = Array.isArray(lineagesList) && lineagesList.length > 0 ? lineagesList : SPECIES_LINEAGES;
  const rawStr = typeof rawInput === 'object' && rawInput !== null
    ? String(rawInput.parent_species || rawInput.lineage || rawInput.name || '')
    : String(rawInput || '');
  const itemId = typeof rawInput === 'object' && rawInput !== null
    ? String(rawInput.id || '').toLowerCase().trim()
    : '';
  const lower = rawStr.toLowerCase().trim().replace(/^species_lineage-/, '');

  const findByIdInActive = (targetId) =>
    activeList.find(l => String(l?.id || '').toLowerCase().trim() === targetId) ||
    SPECIES_LINEAGES.find(l => l.id === targetId) ||
    null;

  if (lower) {
    const directMatch = activeList.find(l => {
      const lId = String(l?.id || '').toLowerCase().trim();
      const lName = String(l?.name || '').toLowerCase().trim();
      const lAliases = Array.isArray(l?.aliases) ? l.aliases.map(a => String(a).toLowerCase().trim()) : [];
      return lId === lower || lName === lower || lAliases.includes(lower);
    });
    if (directMatch) return directMatch;

    const canonicalMatch = SPECIES_LINEAGES.find(l => {
      const lId = l.id.toLowerCase();
      const lName = l.name.toLowerCase();
      const lAliases = (l.aliases || []).map(a => a.toLowerCase());
      return lId === lower || lName === lower || lAliases.includes(lower);
    });
    if (canonicalMatch) return findByIdInActive(canonicalMatch.id);
  }

  if (lower.includes('gen-e') || lower.includes('engineered') || lower === 'gene' || itemId.startsWith('species-gene-')) {
    return findByIdInActive('gene');
  }
  if (lower.includes('human') || itemId.startsWith('species-human-')) {
    return findByIdInActive('humans');
  }
  if (lower.includes('aeld') || lower.includes('elven') || itemId.startsWith('species-aeld-')) {
    return findByIdInActive('aeld');
  }
  if (lower.includes('asi') || lower.includes('fey') || itemId.startsWith('species-asi-')) {
    return findByIdInActive('asi');
  }
  if (lower.includes('auluran') || lower.includes('cat folk') || itemId.startsWith('species-auluran-')) {
    return findByIdInActive('aulurans');
  }
  if (lower.includes('kitin') || lower.includes('genomatrix') || itemId.startsWith('species-kitin-')) {
    return findByIdInActive('kitin');
  }
  if (lower.includes('synthetic') || lower.includes('artificial lifeform') || itemId.startsWith('species-synthetic-')) {
    return findByIdInActive('synthetics');
  }
  if (lower.includes("sha'nor") || lower.includes('shanor') || lower.includes('void lineage') || itemId.startsWith('species-shanor-')) {
    return findByIdInActive('shanor');
  }
  if (lower.includes('progenitor') || lower.includes('ancient') || itemId.startsWith('species-progenitor-')) {
    return findByIdInActive('progenitors');
  }
  if (lower.includes('independent') || lower.includes('xenotype') || itemId.startsWith('species-independent-')) {
    return findByIdInActive('independent');
  }

  return null;
};

export const resolveSpeciesLineageName = (rawInput, lineagesList = SPECIES_LINEAGES) => {
  const matched = resolveSpeciesLineage(rawInput, lineagesList);
  if (matched?.name) return matched.name;
  if (typeof rawInput === 'object' && rawInput !== null) {
    return String(rawInput.parent_species || rawInput.lineage || '');
  }
  return String(rawInput || '');
};

export const doesSpeciesMatchLineage = (speciesOrParent, targetLineageOrName, lineagesList = SPECIES_LINEAGES) => {
  const linA = resolveSpeciesLineage(speciesOrParent, lineagesList);
  const linB = resolveSpeciesLineage(targetLineageOrName, lineagesList);
  if (linA && linB) {
    return String(linA.id || linA.name).toLowerCase() === String(linB.id || linB.name).toLowerCase();
  }
  const strA = typeof speciesOrParent === 'object' && speciesOrParent !== null
    ? String(speciesOrParent.parent_species || speciesOrParent.lineage || '').toLowerCase().trim()
    : String(speciesOrParent || '').toLowerCase().trim();
  const strB = typeof targetLineageOrName === 'object' && targetLineageOrName !== null
    ? String(targetLineageOrName.name || targetLineageOrName.id || '').toLowerCase().trim()
    : String(targetLineageOrName || '').toLowerCase().trim();
  return Boolean(strA && strB && strA === strB);
};

export const getSpeciesById = (id) => DEFAULT_SPECIES.find(s => s.id === id);

export const getSpeciesByLineage = (lineageName, lineagesList = SPECIES_LINEAGES) => 
  DEFAULT_SPECIES.filter(s => doesSpeciesMatchLineage(s, lineageName, lineagesList));

export const getSpeciesBpCost = (speciesObj) => {
  if (!speciesObj) return 0;
  return parseInt(speciesObj.cp_cost || speciesObj.cp || 0, 10);
};
`;

  fs.writeFileSync(targetFile, outputCode, 'utf8');
  console.log(`Successfully synced ${speciesList.length} canonical species to: ${targetFile}`);
}

syncSpecies();
