import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { enrichItemWithModifiers } from '../src/engines/tangentModifierEngine.js';

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
    const cp = typeof data.costs?.cp === 'number' ? data.costs.cp : (typeof data.costs?.bp === 'number' ? data.costs.bp : (typeof data.cost_cp === 'number' ? data.cost_cp : (typeof data.cost_bp === 'number' ? data.cost_bp : (typeof data.cp === 'number' ? data.cp : 3))));

    // Extract mechanic snippet from markdown body if not in frontmatter
    let mechanic = data.mechanic || '';
    if (!mechanic && body) {
      const mechMatch = body.match(/(?:^|\n)## Mechanics[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|$)/i);
      if (mechMatch) {
        mechanic = mechMatch[1].trim();
      }
    }
    if (!mechanic) {
      mechanic = data.description || '';
    }

    // Extract special rules from markdown body if not in frontmatter
    let rules = data.rules || data.special_rules || '';
    if (!rules && body) {
      const ruleMatch = body.match(/(?:^|\n)## Special Rules[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|$)/i);
      if (ruleMatch) {
        rules = ruleMatch[1].trim();
      }
    }

    const rawFeatureObj = {
      id,
      name,
      category,
      type,
      cp,
      bp: cp,
      costs: { cp, bp: cp, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...(data.costs || {}) },
      is_ranked: Boolean(data.is_ranked),
      max_rank: data.max_rank || (data.is_ranked ? 4 : undefined),
      is_multiple: Boolean(data.is_multiple),
      prerequisites: data.prerequisites || data.prerequisite || 'None',
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
      description: data.description || '',
      mechanic: mechanic,
      rules: rules,
      special_rules: rules,
      body: body
    };

    const featureObj = enrichItemWithModifiers(rawFeatureObj, {});
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

/**
 * Enriches a feature object with all canonical metadata (category, type, CP,
 * description, mechanic, rules, prerequisites, modifiers, keywords, TL, ML)
 * for Codex Matrix editing, Folio sheet rendering, or Omnicortex DBM inspection.
 */
export const getEnrichedFeatureData = (feature) => {
  if (!feature) return null;
  const rawId = (feature.id || '').toString().trim();
  const cleanId = rawId.replace(/^(feature|trait)-/i, '').toLowerCase();
  const rawName = (feature.name || feature.title || '').toString().trim().toLowerCase();

  const canonical = DEFAULT_FEATURES.find(f => {
    const fId = (f.id || '').toString().trim().toLowerCase();
    const fCleanId = fId.replace(/^(feature|trait)-/i, '');
    const fName = (f.name || f.title || '').toString().trim().toLowerCase();
    return (rawId && fId === rawId.toLowerCase()) ||
           (cleanId && fCleanId === cleanId) ||
           (rawName && fName === rawName);
  });

  const name = feature.name || feature.title || canonical?.name || canonical?.title || 'Feature';
  const category = feature.category || canonical?.category || 'General';
  const type = feature.type || canonical?.type || category.toLowerCase();
  const id = feature.id || canonical?.id || \`feature-\${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}\`;

  const cp = feature.cp !== undefined ? Number(feature.cp) : (canonical?.cp !== undefined ? Number(canonical.cp) : 3);
  const bp = feature.bp !== undefined ? Number(feature.bp) : (canonical?.bp !== undefined ? Number(canonical.bp) : cp);

  const description = feature.description || canonical?.description || '';
  const mechanic = feature.mechanic || feature.mechanics || canonical?.mechanic || canonical?.mechanics || '';
  const rules = feature.rules || feature.special_rules || canonical?.rules || canonical?.special_rules || '';
  const prerequisites = feature.prerequisites || feature.prerequisite || canonical?.prerequisites || canonical?.prerequisite || 'None';
  const modifiers = Array.isArray(feature.modifiers) && feature.modifiers.length > 0 
    ? feature.modifiers 
    : (Array.isArray(canonical?.modifiers) ? canonical.modifiers : []);

  const keywords = feature.keywords || canonical?.keywords || \`\${name.toLowerCase()}, \${category.toLowerCase()}\`;
  const negative_keywords = feature.negative_keywords || canonical?.negative_keywords || '';
  const tech_level = feature.tech_level !== undefined ? feature.tech_level : (canonical?.tech_level ?? 0);
  const meta_level = feature.meta_level !== undefined ? feature.meta_level : (canonical?.meta_level ?? 0);

  return {
    ...(canonical || {}),
    ...feature,
    id,
    name,
    category,
    type,
    cp,
    bp,
    costs: {
      cp,
      bp,
      credits: 0,
      nodes: 0,
      sockets: 0,
      strain: 0,
      focus: 0,
      ap: 0,
      ...(canonical?.costs || {}),
      ...(feature.costs || {})
    },
    acquisition_type: feature.acquisition_type || canonical?.acquisition_type || (
      ((feature.multi ?? canonical?.multi) || (feature.is_multiple ?? canonical?.is_multiple)) && 
      ((feature.staged ?? canonical?.staged) || (feature.is_ranked ?? canonical?.is_ranked))
        ? 'Multi/Staged'
        : ((feature.staged ?? canonical?.staged) || (feature.is_ranked ?? canonical?.is_ranked))
        ? 'Staged'
        : ((feature.multi ?? canonical?.multi) || (feature.is_multiple ?? canonical?.is_multiple))
        ? 'Multiple'
        : 'Basic'
    ),
    feature_mode: feature.feature_mode || canonical?.feature_mode || feature.acquisition_type || canonical?.acquisition_type || (
      ((feature.multi ?? canonical?.multi) || (feature.is_multiple ?? canonical?.is_multiple)) && 
      ((feature.staged ?? canonical?.staged) || (feature.is_ranked ?? canonical?.is_ranked))
        ? 'Multi/Staged'
        : ((feature.staged ?? canonical?.staged) || (feature.is_ranked ?? canonical?.is_ranked))
        ? 'Staged'
        : ((feature.multi ?? canonical?.multi) || (feature.is_multiple ?? canonical?.is_multiple))
        ? 'Multiple'
        : 'Basic'
    ),
    is_ranked: feature.is_ranked !== undefined ? Boolean(feature.is_ranked) : (feature.staged !== undefined ? Boolean(feature.staged) : Boolean(canonical?.is_ranked || canonical?.staged)),
    max_rank: feature.max_rank || canonical?.max_rank || ((feature.is_ranked || feature.staged || canonical?.is_ranked || canonical?.staged) ? 5 : undefined),
    is_multiple: feature.is_multiple !== undefined ? Boolean(feature.is_multiple) : (feature.multi !== undefined ? Boolean(feature.multi) : Boolean(canonical?.is_multiple || canonical?.multi)),
    multi: feature.multi !== undefined ? Boolean(feature.multi) : (feature.is_multiple !== undefined ? Boolean(feature.is_multiple) : Boolean(canonical?.multi || canonical?.is_multiple)),
    staged: feature.staged !== undefined ? Boolean(feature.staged) : (feature.is_ranked !== undefined ? Boolean(feature.is_ranked) : Boolean(canonical?.staged || canonical?.is_ranked)),
    prerequisites,
    modifiers,
    modifier_options: feature.modifier_options || canonical?.modifier_options || {
      enabled: false,
      mode: 'single',
      value: 2,
      options: []
    },
    selected_option_id: feature.selected_option_id || canonical?.selected_option_id || '',
    selected_skills: Array.isArray(feature.selected_skills) ? feature.selected_skills : (Array.isArray(canonical?.selected_skills) ? canonical.selected_skills : []),
    description,
    mechanic,
    rules,
    special_rules: rules,
    keywords,
    negative_keywords,
    tech_level,
    meta_level,
    tl: tech_level,
    ml: meta_level,
    notes: feature.notes || canonical?.notes || '',
    notesList: Array.isArray(feature.notesList) ? feature.notesList : (Array.isArray(canonical?.notesList) ? canonical.notesList : [])
  };
};
`;

  fs.writeFileSync(targetFile, outputCode, 'utf8');
  console.log(`Successfully synced ${featuresList.length} canonical features to: ${targetFile}`);
}

syncFeatures();
