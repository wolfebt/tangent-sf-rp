import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { DEFAULT_FEATURES } from '../src/data/featuresData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const speciesDir = path.join(rootDir, 'src', 'data', 'omnicortex', 'species');

const validFeatureIds = new Set(DEFAULT_FEATURES.map(f => f.id.toLowerCase()));
const validFeatureNames = new Set(DEFAULT_FEATURES.map(f => f.name.toLowerCase()));

const isTrait = (item) => {
  if (!item) return false;
  const str = typeof item === 'object' ? (item.id || item.name || '') : String(item);
  const clean = str.toLowerCase().trim();
  return clean.startsWith('trait-') || clean.includes('traits-') || clean.startsWith('trait_') || clean.includes('trait');
};

const isValidFeature = (f) => {
  if (!f) return false;
  const s = (typeof f === 'object' ? (f.id || f.name || '') : String(f)).trim().toLowerCase();
  if (isTrait(f)) return false;
  return validFeatureIds.has(s) || 
         validFeatureNames.has(s) || 
         validFeatureIds.has(s.replace(/^feature-/, '')) || 
         validFeatureIds.has('ability-' + s.replace(/^feature-/, ''));
};

function cleanSpecies() {
  const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Processing ${files.length} species files...`);

  let modifiedCount = 0;
  let traitsExtractedCount = 0;
  let fakeFeaturesRemovedCount = 0;

  for (const file of files) {
    const fullPath = path.join(speciesDir, file);
    const rawContent = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(rawContent);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const rawTraits = Array.isArray(data.traits) ? [...data.traits] : (Array.isArray(data.species_traits) ? [...data.species_traits] : []);
    const inh = Array.isArray(data.inherent_features) ? data.inherent_features : [];
    const rec = Array.isArray(data.recommended_features) ? data.recommended_features : [];

    const traits = [...rawTraits];
    inh.forEach(i => {
      if (isTrait(i)) {
        const id = typeof i === 'object' ? (i.id || i.name) : i;
        if (!traits.includes(id)) {
          traits.push(id);
          traitsExtractedCount++;
        }
      }
    });

    const cleanedInh = inh.filter(isValidFeature);
    const cleanedRec = rec.filter(isValidFeature);

    fakeFeaturesRemovedCount += (inh.length - cleanedInh.length) + (rec.length - cleanedRec.length);

    // Update frontmatter data
    const updatedData = { ...data };
    updatedData.traits = traits;
    delete updatedData.species_traits;
    updatedData.inherent_features = cleanedInh;
    updatedData.recommended_features = cleanedRec;
    updatedData.bonus_features = [];
    updatedData.bonus_feature_choices = [];

    // Serialize YAML
    const yamlStr = yaml.dump(updatedData, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false
    });

    const newContent = `---\n${yamlStr}---\n\n${body}\n`;
    fs.writeFileSync(fullPath, newContent, 'utf8');
    modifiedCount++;
  }

  console.log(`Successfully updated ${modifiedCount} species markdown files.`);
  console.log(`Total traits extracted: ${traitsExtractedCount}`);
  console.log(`Total non-cortex fake features removed: ${fakeFeaturesRemovedCount}`);
}

cleanSpecies();
