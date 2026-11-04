import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import {
  ARCHETYPE_SPHERES,
  ARCHETYPE_SCALING_RULES,
  DEFAULT_ARCHETYPES,
  CANONICAL_SPHERES
} from '../src/data/archetypesData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const archetypesDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'archetypes');
const targetFile = path.join(projectRoot, 'src', 'data', 'archetypesData.js');

function extractFlavorAndQuoteFromBody(body) {
  let flavor = '';
  let quote = '';
  const lines = String(body || '').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const quoteMatch = line.match(/^>?\s*[_*]"(.+)"[_*]\s*$/) || line.match(/^>\s*"(.+)"\s*$/);
    if (quoteMatch && !quote) {
      quote = `"${quoteMatch[1]}"`;
      continue;
    }
    const italicBlockMatch = line.match(/^>\s*\*(.+)\*\s*$/);
    if (italicBlockMatch && !flavor && !italicBlockMatch[1].startsWith('"')) {
      flavor = italicBlockMatch[1].trim();
    }
  }
  return { flavor, quote };
}

function syncArchetypes() {
  if (!fs.existsSync(archetypesDir)) {
    console.error(`Archetypes directory not found at: ${archetypesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(archetypesDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} archetype markdown files in ${archetypesDir}`);

  const existingOrder = new Map();
  const existingMap = new Map();
  (DEFAULT_ARCHETYPES || []).forEach((arch, idx) => {
    if (arch && arch.id) {
      existingMap.set(arch.id, arch);
      existingOrder.set(arch.id, idx);
    }
  });

  const updatedArchetypes = [];

  for (const file of files) {
    const fullPath = path.join(archetypesDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = (parsed.content || '').trim();

    const id = data.id || file.replace(/\.md$/, '');
    const existing = existingMap.get(id) || {};
    const extracted = extractFlavorAndQuoteFromBody(body);

    const primaryAttr = data.primary_attribute || existing.primary_attribute || 'Strength';
    const secondaryAttr = data.secondary_attribute || existing.secondary_attribute || 'Agility';
    const summary = data.summary || data.description || existing.summary || '';
    const flavor = data.flavor || extracted.flavor || existing.flavor || '';
    const quote = data.quote || extracted.quote || existing.quote || '';
    const sigFeatures = Array.isArray(data.signature_features)
      ? data.signature_features
      : (Array.isArray(data.signature_traits) ? data.signature_traits : (existing.signature_features || []));
    const sigTraits = Array.isArray(data.signature_traits) ? data.signature_traits : sigFeatures;
    const traits = Array.isArray(data.traits) ? data.traits : sigTraits;

    const keywords = typeof data.keywords === 'string'
      ? data.keywords.trim()
      : (Array.isArray(data.keywords) ? data.keywords.join(', ') : (existing.keywords || ''));
    const negativeKeywords = typeof data.negative_keywords === 'string'
      ? data.negative_keywords.trim()
      : (Array.isArray(data.negative_keywords) ? data.negative_keywords.join(', ') : (existing.negative_keywords || ''));

    // Build rich description while preserving existing composite summary/flavor/quote convention
    let resolvedDesc = existing.description || data.description || summary;
    if (data.description && flavor && !data.description.includes(flavor)) {
      const parts = [data.description];
      if (flavor) parts.push(`*${flavor}*`);
      if (quote) parts.push(`_${quote}_`);
      resolvedDesc = parts.join('\n\n');
    }

    const archObj = {
      ...existing,
      ...data,
      id,
      name: data.name || existing.name || id,
      sphere: data.sphere || existing.sphere || 'Sentinels (The Stabilizers)',
      summary,
      flavor,
      quote,
      core_concept: data.core_concept || existing.core_concept || '',
      recommended_occupations: Array.isArray(data.recommended_occupations) ? data.recommended_occupations : (existing.recommended_occupations || []),
      recommended_origins: Array.isArray(data.recommended_origins) ? data.recommended_origins : (existing.recommended_origins || []),
      recommended_factions: Array.isArray(data.recommended_factions) ? data.recommended_factions : (existing.recommended_factions || []),
      primary_attribute: primaryAttr,
      secondary_attribute: secondaryAttr,
      key_attributes: data.key_attributes || existing.key_attributes || `${primaryAttr} (Primary), ${secondaryAttr} (Secondary).`,
      essential_skills: Array.isArray(data.essential_skills) ? data.essential_skills : (existing.essential_skills || []),
      signature_features: sigFeatures,
      signature_traits: sigTraits,
      traits,
      tactical_role: data.tactical_role || existing.tactical_role || '',
      category: 'archetypes',
      bp_chassis: data.bp_chassis ?? data.cp_chassis ?? existing.bp_chassis ?? 80,
      cp_chassis: data.cp_chassis ?? data.bp_chassis ?? existing.cp_chassis ?? 80,
      description: resolvedDesc,
      body,
      full_text: data.full_text || body || existing.full_text || '',
      keywords,
      negative_keywords: negativeKeywords,
      costs: data.costs || existing.costs || { cp: 80, bp: 80 },
      modifiers: Array.isArray(data.modifiers) && data.modifiers.length > 0 ? data.modifiers : (existing.modifiers || [])
    };

    updatedArchetypes.push(archObj);
  }

  // Preserve canonical sphere ordering from existing DEFAULT_ARCHETYPES when available
  updatedArchetypes.sort((a, b) => {
    const idxA = existingOrder.has(a.id) ? existingOrder.get(a.id) : 9999;
    const idxB = existingOrder.has(b.id) ? existingOrder.get(b.id) : 9999;
    if (idxA !== idxB) return idxA - idxB;
    return (a.name || '').localeCompare(b.name || '');
  });

  const jsContent = `/**
 * Canonical ${updatedArchetypes.length} Archetypes for Tangent Science Fantasy Roleplaying Game (SFF RPG)
 * Auto-generated from src/data/omnicortex/archetypes/ (1.02 ARCHETYPES.md)
 * Chassis Allocation Formula: 80 CP (+3 Primary, +2 Secondary, 4 Trained + 6 Novice skills, Signature Traits @ 1 CP)
 */

export const ARCHETYPE_SPHERES = ${JSON.stringify(ARCHETYPE_SPHERES, null, 2)};

export const ARCHETYPE_SCALING_RULES = ${JSON.stringify(ARCHETYPE_SCALING_RULES, null, 2)};

export const DEFAULT_ARCHETYPES = ${JSON.stringify(updatedArchetypes, null, 2)};

export const CANONICAL_SPHERES = ${JSON.stringify(CANONICAL_SPHERES, null, 2)};

export const getGroupedArchetypes = (archetypesList = DEFAULT_ARCHETYPES) => {
  const list = (Array.isArray(archetypesList) && archetypesList.length > 0) ? archetypesList : DEFAULT_ARCHETYPES;
  const groups = {
    'Sentinels (The Stabilizers)': [],
    'Operatives (The Artisans)': [],
    'Visionaries (The Idealists)': [],
    'Savants (The Rationals)': []
  };
  const otherGroup = [];

  list.forEach(arch => {
    const rawSphere = (arch.sphere || arch.category || '').toLowerCase();
    const matched = CANONICAL_SPHERES.find(s => s.keywords.some(k => rawSphere.includes(k)));
    if (matched) {
      groups[matched.name].push(arch);
    } else {
      otherGroup.push(arch);
    }
  });

  Object.keys(groups).forEach(sphereName => {
    groups[sphereName].sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
  });
  otherGroup.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));

  const result = Object.entries(groups).filter(([_, items]) => items.length > 0);
  if (otherGroup.length > 0) {
    result.push(['Other Archetypes', otherGroup]);
  }
  return result;
};
`;

  fs.writeFileSync(targetFile, jsContent, 'utf8');
  console.log(`Successfully synchronized ${updatedArchetypes.length} archetypes (with full Markdown body) to ${targetFile}!`);
}

syncArchetypes();
