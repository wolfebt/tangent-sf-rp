import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { DEFAULT_OCCUPATIONS, COMMON_OCCUPATIONAL_TRAITS } from '../src/data/occupationsData.js';
import { OCCUPATION_WEALTH_BASE } from '../src/constants/equipment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const occupationsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'occupations');
const targetFile = path.join(projectRoot, 'src', 'data', 'occupationsData.js');

function syncOccupations() {
  if (!fs.existsSync(occupationsDir)) {
    console.error(`Occupations directory not found at: ${occupationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(occupationsDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} occupation markdown files in ${occupationsDir}`);

  // Preserve enriched properties (such as traits_detail) from existing occupationsData.js
  const existingMap = new Map();
  for (const occ of (DEFAULT_OCCUPATIONS || [])) {
    if (occ && occ.id) {
      existingMap.set(occ.id, occ);
    }
  }

  const updatedOccupations = [];

  for (const file of files) {
    const fullPath = path.join(occupationsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || file.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};

    const recSpecies = Array.isArray(data.recommended_species) ? data.recommended_species : (existing.recommended_species || []);
    const recFactions = Array.isArray(data.recommended_factions) ? data.recommended_factions : (existing.recommended_factions || []);
    const recOrigins = Array.isArray(data.recommended_origins) ? data.recommended_origins : (existing.recommended_origins || []);
    const keywords = typeof data.keywords === 'string'
      ? data.keywords.trim()
      : (Array.isArray(data.keywords) ? data.keywords.join(', ') : (existing.keywords || ''));
    const negativeKeywords = typeof data.negative_keywords === 'string'
      ? data.negative_keywords.trim()
      : (Array.isArray(data.negative_keywords) ? data.negative_keywords.join(', ') : (existing.negative_keywords || ''));

    const resolvedName = data.name || existing.name || id;
    const occObj = {
      ...existing,
      ...data,
      id,
      name: resolvedName,
      category: 'occupations',
      base_ws: data.base_ws !== undefined
        ? data.base_ws
        : (existing.base_ws !== undefined ? existing.base_ws : (OCCUPATION_WEALTH_BASE[resolvedName] || 2)),
      economic_context: data.economic_context || existing.economic_context || '',
      skill_points: data.skill_points !== undefined ? data.skill_points : (existing.skill_points !== undefined ? existing.skill_points : 20),
      professional_skills: Array.isArray(data.professional_skills) ? data.professional_skills : (existing.professional_skills || []),
      archetypes: Array.isArray(data.archetypes) ? data.archetypes : (existing.archetypes || []),
      traits: Array.isArray(data.traits) ? data.traits : (existing.traits || []),
      traits_detail: Array.isArray(data.traits_detail) ? data.traits_detail : (existing.traits_detail || []),
      description: data.description || existing.description || '',
      body,
      full_text: data.full_text || body || existing.full_text || '',
      recommended_features: Array.isArray(data.recommended_features) ? data.recommended_features : (existing.recommended_features || []),
      features: Array.isArray(data.features) ? data.features : (existing.features || existing.recommended_features || []),
      recommended_species: recSpecies,
      recommended_factions: recFactions,
      recommended_origins: recOrigins,
      keywords,
      negative_keywords: negativeKeywords,
      costs: data.costs || existing.costs || {
        cp: 0,
        bp: 0,
        credits: 0,
        nodes: 0,
        sockets: 0,
        strain: 0,
        focus: 0,
        ap: 0
      },
      modifiers: Array.isArray(data.modifiers) && data.modifiers.length > 0 ? data.modifiers : (existing.modifiers || []),
      modifications: Array.isArray(data.modifications) && data.modifications.length > 0 ? data.modifications : (existing.modifications || []),
      critical_details: data.critical_details || existing.critical_details || {
        score: '',
        effect: [],
        success_effect: [],
        failure_effect: []
      },
      sockets: data.sockets || existing.sockets || {
        max: 0,
        used: 0,
        tier: 'Socket',
        allocated: []
      },
      field: data.field || existing.field || ''
    };

    updatedOccupations.push(occObj);
  }

  const jsContent = `export const DEFAULT_OCCUPATIONS = ${JSON.stringify(updatedOccupations, null, 2)};

/**
 * Common Occupational Traits available to all professions in Tangent
 */
export const COMMON_OCCUPATIONAL_TRAITS = ${JSON.stringify(COMMON_OCCUPATIONAL_TRAITS || [], null, 2)};
`;
  fs.writeFileSync(targetFile, jsContent, 'utf8');
  console.log(`\nSuccessfully synchronized ${updatedOccupations.length} occupations (with full Markdown body) to ${targetFile}!`);
}

syncOccupations();
