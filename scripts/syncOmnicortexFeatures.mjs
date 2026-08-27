import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const featuresDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'features');
const targetFile = path.join(projectRoot, 'src', 'data', 'featuresData.js');

export const FEATURE_CATEGORIES = [
  'Ability',
  'Combat',
  'Discipline',
  'Meta',
  'General',
  'Skill',
  'Karma',
  'Special',
  'Physical',
  'Social',
  'Augmentation',
  'Hindrance'
];

function syncFeatures() {
  if (!fs.existsSync(featuresDir)) {
    console.error(`Features directory not found at: ${featuresDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(featuresDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} feature markdown files in ${featuresDir}`);

  const featuresList = [];

  for (const file of files) {
    const fullPath = path.join(featuresDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || file.replace(/\.md$/, '');
    const name = data.name || data.title || id;
    const category = data.feature_category || data.category || 'General';
    const type = (data.feature_category || data.type || category).toLowerCase();
    const cp = typeof data.costs?.bp === 'number' ? data.costs.bp : (typeof data.cost_bp === 'number' ? data.cost_bp : (typeof data.cp === 'number' ? data.cp : 3));

    // Extract mechanic snippet from markdown body if not in frontmatter
    let mechanic = data.mechanic || '';
    if (!mechanic && body) {
      const mechMatch = body.match(/## Mechanics & Benefit[s]?\s*([\s\S]*?)(?=##|$)/i);
      if (mechMatch) {
        mechanic = mechMatch[1].trim();
      }
    }

    const featureObj = {
      id,
      name,
      category,
      type,
      cp,
      costs: data.costs || { bp: cp, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
      is_ranked: Boolean(data.is_ranked),
      is_multiple: Boolean(data.is_multiple),
      prerequisites: data.prerequisites || data.prerequisite || 'None',
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      description: data.description || '',
      mechanic: mechanic,
      body: body
    };

    featuresList.push(featureObj);
  }

  // Sort by category then name
  featuresList.sort((a, b) => {
    const catComp = (a.category || '').localeCompare(b.category || '');
    if (catComp !== 0) return catComp;
    return (a.name || '').localeCompare(b.name || '');
  });

  const outputCode = `/**
 * Canonical Features & Traits Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/features/
 * Total Features: ${featuresList.length}
 */

export const FEATURE_CATEGORIES = ${JSON.stringify(FEATURE_CATEGORIES, null, 2)};

export const DEFAULT_FEATURES = ${JSON.stringify(featuresList, null, 2)};

export const getFeatureById = (id) => DEFAULT_FEATURES.find(f => f.id === id);

export const getFeaturesByCategory = (category) => 
  DEFAULT_FEATURES.filter(f => (f.category || '').toLowerCase() === (category || '').toLowerCase());
`;

  fs.writeFileSync(targetFile, outputCode, 'utf8');
  console.log(`Successfully synced ${featuresList.length} canonical features to: ${targetFile}`);
}

syncFeatures();
