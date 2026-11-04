import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { DEFAULT_ORIGINS } from '../src/data/originsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const originsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'origins');
const targetFile = path.join(projectRoot, 'src', 'data', 'originsData.js');

function syncOrigins() {
  if (!fs.existsSync(originsDir)) {
    console.error(`Origins directory not found at: ${originsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(originsDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} origin markdown files in ${originsDir}`);

  const existingMap = new Map();
  for (const orig of (DEFAULT_ORIGINS || [])) {
    if (orig && orig.id) {
      existingMap.set(orig.id, orig);
    }
  }

  const updatedOrigins = [];

  for (const file of files) {
    const fullPath = path.join(originsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || file.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};

    const keywords = typeof data.keywords === 'string'
      ? data.keywords.trim()
      : (Array.isArray(data.keywords) ? data.keywords.join(', ') : (existing.keywords || ''));
    const negativeKeywords = typeof data.negative_keywords === 'string'
      ? data.negative_keywords.trim()
      : (Array.isArray(data.negative_keywords) ? data.negative_keywords.join(', ') : (existing.negative_keywords || ''));

    const originObj = {
      ...existing,
      ...data,
      id,
      name: data.name || existing.name || id,
      category: 'origins',
      habitat: data.habitat || existing.habitat || 'Planetary Biome',
      ws_modifier: data.ws_modifier !== undefined ? data.ws_modifier : (existing.ws_modifier ?? 0),
      economic_context: data.economic_context || existing.economic_context || '',
      skill_points: data.skill_points !== undefined ? data.skill_points : (existing.skill_points ?? 20),
      society_skills: Array.isArray(data.society_skills) ? data.society_skills : (existing.society_skills || []),
      archetypes: Array.isArray(data.archetypes) ? data.archetypes : (existing.archetypes || []),
      traits: Array.isArray(data.traits) ? data.traits : (existing.traits || []),
      traits_detail: Array.isArray(data.traits_detail) ? data.traits_detail : (existing.traits_detail || []),
      description: data.description || existing.description || '',
      body,
      full_text: data.full_text || body || existing.full_text || '',
      recommended_species: Array.isArray(data.recommended_species) ? data.recommended_species : (existing.recommended_species || []),
      recommended_factions: Array.isArray(data.recommended_factions) ? data.recommended_factions : (existing.recommended_factions || []),
      recommended_occupations: Array.isArray(data.recommended_occupations) ? data.recommended_occupations : (existing.recommended_occupations || []),
      keywords,
      negative_keywords: negativeKeywords,
      costs: data.costs || existing.costs || { cp: 0, bp: 0 },
      modifiers: Array.isArray(data.modifiers) && data.modifiers.length > 0 ? data.modifiers : (existing.modifiers || [])
    };

    updatedOrigins.push(originObj);
  }

  updatedOrigins.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const jsContent = `/**
 * Canonical Origins Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/origins/
 * Total Origins: ${updatedOrigins.length}
 */

export const DEFAULT_ORIGINS = ${JSON.stringify(updatedOrigins, null, 2)};
`;

  fs.writeFileSync(targetFile, jsContent, 'utf8');
  console.log(`Successfully synchronized ${updatedOrigins.length} origins (with full Markdown body) to ${targetFile}!`);
}

syncOrigins();
