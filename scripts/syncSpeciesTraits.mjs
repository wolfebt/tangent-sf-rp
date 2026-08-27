import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const traitsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'traits');
const targetFile = path.join(projectRoot, 'src', 'data', 'speciesTraitsData.js');

function syncTraits() {
  if (!fs.existsSync(traitsDir)) {
    console.error(`Traits directory not found at: ${traitsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(traitsDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} trait markdown files in ${traitsDir}`);

  const allTraits = [];
  const speciesTraitsBasic = [];
  const speciesTraitsAdvanced = [];
  const speciesTraitsElite = [];
  const occupationalTraits = [];
  const originTraits = [];

  for (const file of files) {
    const fullPath = path.join(traitsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || file.replace(/\.md$/, '');
    const name = data.name || data.title || id;
    const traitType = data.trait_type || 'Species Trait';
    const traitTier = data.trait_tier || 'Basic';
    const classification = data.classification || data.type || 'Physical';
    const bp = typeof data.costs?.bp === 'number' ? data.costs.bp : (typeof data.bp === 'number' ? data.bp : 1);

    let mechanics = data.mechanic || '';
    if (!mechanics && body) {
      const mechMatch = body.match(/## Mechanics & Benefit[s]?\s*([\s\S]*?)(?=##|$)/i);
      if (mechMatch) mechanics = mechMatch[1].trim();
    }

    const traitObj = {
      id,
      name,
      category: 'traits',
      trait_type: traitType,
      trait_tier: traitTier,
      classification,
      type: classification,
      bp,
      costs: data.costs || { bp, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
      is_ranked: Boolean(data.is_ranked),
      desc: data.description || '',
      description: data.description || '',
      mechanics,
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      body
    };

    allTraits.push(traitObj);

    if (traitType === 'Occupational Trait' || traitType === 'Common Occupational Trait') {
      occupationalTraits.push(traitObj);
    } else if (traitType === 'Origin Trait') {
      originTraits.push(traitObj);
    } else {
      if (traitTier === 'Advanced') speciesTraitsAdvanced.push(traitObj);
      else if (traitTier === 'Elite') speciesTraitsElite.push(traitObj);
      else speciesTraitsBasic.push(traitObj);
    }
  }

  // Sort alphabetically
  allTraits.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const outputCode = `/**
 * Canonical Traits Database for Tangent SF RP (Species, Occupational, and Origin Traits)
 * Auto-generated from src/data/omnicortex/traits/
 * Total Traits: ${allTraits.length}
 *  - Species Basic: ${speciesTraitsBasic.length}
 *  - Species Advanced: ${speciesTraitsAdvanced.length}
 *  - Species Elite: ${speciesTraitsElite.length}
 *  - Occupational Traits: ${occupationalTraits.length}
 *  - Origin Traits: ${originTraits.length}
 */

export const SPECIES_TRAITS_BASIC = ${JSON.stringify(speciesTraitsBasic, null, 2)};
export const SPECIES_TRAITS_ADVANCED = ${JSON.stringify(speciesTraitsAdvanced, null, 2)};
export const SPECIES_TRAITS_ELITE = ${JSON.stringify(speciesTraitsElite, null, 2)};
export const OCCUPATIONAL_TRAITS = ${JSON.stringify(occupationalTraits, null, 2)};
export const ORIGIN_TRAITS = ${JSON.stringify(originTraits, null, 2)};

export const ALL_CANONICAL_TRAITS = ${JSON.stringify(allTraits, null, 2)};

// DEFAULT_SPECIES_TRAITS contains all traits to ensure 100% resolution across species, origins, and occupations
export const DEFAULT_SPECIES_TRAITS = ALL_CANONICAL_TRAITS;

export const getTraitById = (id) => ALL_CANONICAL_TRAITS.find(t => t.id === id);
`;

  fs.writeFileSync(targetFile, outputCode, 'utf8');
  console.log(`Successfully synced ${allTraits.length} canonical traits to: ${targetFile}`);
}

syncTraits();
