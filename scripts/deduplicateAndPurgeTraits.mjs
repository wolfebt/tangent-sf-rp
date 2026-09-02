import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { ALL_CANONICAL_TRAITS } from '../src/data/speciesTraitsData.js';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const omnicortexRoot = path.join(projectRoot, 'src', 'data', 'omnicortex');
const traitsDir = path.join(omnicortexRoot, 'traits');
const jsonBackupDir = path.join(projectRoot, 'docs', 'recommendations and revison plans', 'omnicortex json', 'current collection');

console.log('================================================================');
console.log('STARTING TRAIT DEDUPLICATION, STANDARDIZATION & PURGE');
console.log('================================================================');

// 1. Missing Occupation Traits
const MISSING_OCCUPATION_TRAITS = [
  { name: 'Versatility', desc: 'Adaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.', bp: 2, tier: 'Basic', type: 'General' },
  { name: 'Networking', desc: 'A wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.', bp: 2, tier: 'Basic', type: 'Social' },
  { name: 'Physical Fitness', desc: 'Superior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.', bp: 1, tier: 'Basic', type: 'Physical' },
  { name: 'Business Acumen', desc: 'Keen understanding of market dynamics, trade valuation, credit arbitration, and contract law.', bp: 1, tier: 'Basic', type: 'Mental' },
  { name: 'Creativity', desc: 'Ingenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.', bp: 1, tier: 'Basic', type: 'Mental' },
  { name: 'Patience', desc: 'Methodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.', bp: 1, tier: 'Basic', type: 'Mental' },
  { name: 'Time Management', desc: 'Mastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.', bp: 1, tier: 'Basic', type: 'Mental' },
  { name: 'Negotiation', desc: 'Adept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.', bp: 1, tier: 'Basic', type: 'Social' },
  { name: 'Aggressiveness', desc: 'Decisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.', bp: 1, tier: 'Basic', type: 'Combat' },
  { name: 'Combat Training', desc: 'Extensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.', bp: 2, tier: 'Basic', type: 'Combat' },
  { name: 'Street Smarts', desc: 'Familiarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.', bp: 1, tier: 'Basic', type: 'Social' },
  { name: 'Charismatic', desc: 'Natural charm and magnetism that puts strangers at ease and bolsters leadership checks.', bp: 1, tier: 'Basic', type: 'Social' }
];

// Combine all raw traits
const rawPool = [...ALL_CANONICAL_TRAITS];
MISSING_OCCUPATION_TRAITS.forEach(m => {
  rawPool.push({
    id: 'trait-' + m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: m.name,
    trait_tier: m.tier,
    trait_type: m.type,
    category: 'traits',
    costs: { bp: m.bp, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
    description: m.desc
  });
});

// Helper to create canonical slug ID
function getCanonicalTraitId(name) {
  const clean = name.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `trait-${clean}`;
}

// 2. Build Canonical Map and Alias Map
const canonicalMap = new Map();
const aliasMap = new Map(); // oldId/rawQuery -> new canonicalId

rawPool.forEach(t => {
  const normName = t.name.trim();
  const canonicalId = getCanonicalTraitId(normName);
  const costBP = t.costs?.bp ?? t.bp ?? (t.trait_tier === 'Elite' ? 4 : (t.trait_tier === 'Advanced' ? 2 : 1));

  if (!canonicalMap.has(canonicalId)) {
    canonicalMap.set(canonicalId, {
      id: canonicalId,
      name: normName,
      trait_tier: t.trait_tier || (costBP === 4 ? 'Elite' : (costBP === 2 ? 'Advanced' : 'Basic')),
      trait_type: t.trait_type || t.type || 'General',
      category: 'traits',
      costs: { bp: costBP, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
      description: t.description || t.name,
      modifiers: t.modifiers || [],
      modifications: t.modifications || [],
      critical_details: t.critical_details || { score: '', effect: [], success_effect: [], failure_effect: [] },
      sockets: t.sockets || { max: 0, used: 0, tier: 'Socket', allocated: [] }
    });
  } else {
    // Merge richer description
    const existing = canonicalMap.get(canonicalId);
    if ((t.description || '').length > (existing.description || '').length) {
      existing.description = t.description;
    }
  }

  // Register aliases
  if (t.id) aliasMap.set(t.id, canonicalId);
  aliasMap.set(normName.toLowerCase(), canonicalId);
  aliasMap.set(normName.toLowerCase().replace(/[^a-z0-9]/g, ''), canonicalId);
});

// Also register all known legacy prefixes into aliasMap
const legacyOccupations = ['agent', 'builder', 'citizen', 'criminal', 'drifter', 'entertainer', 'merchant', 'representative', 'scholar', 'scout', 'soldier', 'specialist', 'adept'];
legacyOccupations.forEach(occ => {
  canonicalMap.forEach((trait, canId) => {
    const slug = canId.replace(/^trait-/, '');
    aliasMap.set(`trait-${occ}-${slug}`, canId);
    aliasMap.set(`trait-${occ}-${slug.replace(/-/g, '_')}`, canId);
    aliasMap.set(`trait-species-${slug}`, canId);
    aliasMap.set(`trait-species-${slug.replace(/-/g, '_')}`, canId);
  });
});
aliasMap.set('trait-entertainer-adaptable', 'trait-adaptability');
aliasMap.set('trait-soldier-adaptable', 'trait-adaptability');

const FINAL_CANONICAL_TRAITS = Array.from(canonicalMap.values()).sort((a, b) => a.name.localeCompare(b.name));
console.log(`Deduplicated canonical traits count: ${FINAL_CANONICAL_TRAITS.length}`);

// Helper to remap any trait list/string
function remapTraits(traitsList) {
  if (!traitsList) return [];
  const list = Array.isArray(traitsList) ? traitsList : (typeof traitsList === 'string' ? traitsList.split(',').map(s => s.trim()).filter(Boolean) : []);
  const seen = new Set();
  const remapped = [];

  list.forEach(item => {
    const raw = typeof item === 'object' ? (item.id || item.name) : String(item);
    const cleanRaw = raw.trim();
    const cleanNorm = cleanRaw.toLowerCase().replace(/[^a-z0-9]/g, '');

    let resolvedId = aliasMap.get(cleanRaw) || aliasMap.get(cleanNorm) || aliasMap.get(getCanonicalTraitId(cleanRaw));
    if (!resolvedId) {
      // Fuzzy search canonical map
      const found = FINAL_CANONICAL_TRAITS.find(t => t.name.toLowerCase() === cleanRaw.toLowerCase() || t.id === cleanRaw);
      if (found) resolvedId = found.id;
    }

    const finalId = resolvedId || getCanonicalTraitId(cleanRaw);
    if (!seen.has(finalId)) {
      seen.add(finalId);
      remapped.push(finalId);
    }
  });

  return remapped;
}

// ============================================================================
// 3. REWRITE omnicortex/traits MARKDOWN FILES
// ============================================================================
if (fs.existsSync(traitsDir)) {
  const existingFiles = fs.readdirSync(traitsDir);
  existingFiles.forEach(f => fs.unlinkSync(path.join(traitsDir, f)));
} else {
  fs.mkdirSync(traitsDir, { recursive: true });
}

FINAL_CANONICAL_TRAITS.forEach(trait => {
  const filePath = path.join(traitsDir, `${trait.id}.md`);
  const frontmatter = { ...trait };
  const markdownBody = `# ${trait.name}\n\n**Category**: TRAITS\n**Tier**: ${trait.trait_tier}\n**Type**: ${trait.trait_type}\n**BP Cost**: ${trait.costs.bp}\n\n## Description\n${trait.description}\n`;
  const fullContent = matter.stringify(markdownBody, frontmatter);
  fs.writeFileSync(filePath, fullContent, 'utf8');
});
console.log(`Wrote ${FINAL_CANONICAL_TRAITS.length} clean Markdown files in omnicortex/traits`);

// ============================================================================
// 4. REWRITE src/data/speciesTraitsData.js
// ============================================================================
const basicTraits = FINAL_CANONICAL_TRAITS.filter(t => t.trait_tier === 'Basic');
const advancedTraits = FINAL_CANONICAL_TRAITS.filter(t => t.trait_tier === 'Advanced');
const eliteTraits = FINAL_CANONICAL_TRAITS.filter(t => t.trait_tier === 'Elite');

const jsContent = `/**
 * Canonical Tangent SF RP Deduplicated Trait Database
 * Auto-generated by scripts/deduplicateAndPurgeTraits.mjs
 */

export const SPECIES_TRAITS_BASIC = ${JSON.stringify(basicTraits, null, 2)};
export const SPECIES_TRAITS_ADVANCED = ${JSON.stringify(advancedTraits, null, 2)};
export const SPECIES_TRAITS_ELITE = ${JSON.stringify(eliteTraits, null, 2)};
export const ALL_CANONICAL_TRAITS = ${JSON.stringify(FINAL_CANONICAL_TRAITS, null, 2)};
`;

fs.writeFileSync(path.join(projectRoot, 'src', 'data', 'speciesTraitsData.js'), jsContent, 'utf8');
console.log('Updated src/data/speciesTraitsData.js');

// ============================================================================
// 5. REMAP & REWRITE OCCUPATIONS
// ============================================================================
const occDir = path.join(omnicortexRoot, 'occupations');
const occDataPath = path.join(projectRoot, 'src', 'data', 'occupationsData.js');

if (fs.existsSync(occDir)) {
  const occFiles = fs.readdirSync(occDir).filter(f => f.endsWith('.md'));
  occFiles.forEach(f => {
    const fullPath = path.join(occDir, f);
    const parsed = matter(fs.readFileSync(fullPath, 'utf8'));
    const data = parsed.data || {};
    if (data.traits) {
      data.traits = remapTraits(data.traits);
    }
    fs.writeFileSync(fullPath, matter.stringify(parsed.content, data), 'utf8');
  });
}

// Update occupationsData.js
import { DEFAULT_OCCUPATIONS } from '../src/data/occupationsData.js';
const updatedOccupations = DEFAULT_OCCUPATIONS.map(occ => ({
  ...occ,
  traits: remapTraits(occ.traits)
}));
fs.writeFileSync(occDataPath, `export const DEFAULT_OCCUPATIONS = ${JSON.stringify(updatedOccupations, null, 2)};\n`, 'utf8');
console.log('Remapped traits across all Occupations');

// ============================================================================
// 6. REMAP & REWRITE SPECIES
// ============================================================================
const speciesDir = path.join(omnicortexRoot, 'species');
const speciesDataPath = path.join(projectRoot, 'src', 'data', 'speciesData.js');

if (fs.existsSync(speciesDir)) {
  const spFiles = fs.readdirSync(speciesDir).filter(f => f.endsWith('.md'));
  spFiles.forEach(f => {
    const fullPath = path.join(speciesDir, f);
    const parsed = matter(fs.readFileSync(fullPath, 'utf8'));
    const data = parsed.data || {};
    if (data.traits) data.traits = remapTraits(data.traits);
    if (data.inherent_features) data.inherent_features = remapTraits(data.inherent_features);
    if (data.bonus_features) data.bonus_features = remapTraits(data.bonus_features);
    fs.writeFileSync(fullPath, matter.stringify(parsed.content, data), 'utf8');
  });
}

// Update speciesData.js
import { DEFAULT_SPECIES, SPECIES_LINEAGES } from '../src/data/speciesData.js';
const updatedSpecies = DEFAULT_SPECIES.map(sp => ({
  ...sp,
  traits: remapTraits(sp.traits),
  inherent_features: remapTraits(sp.inherent_features),
  bonus_features: remapTraits(sp.bonus_features)
}));
fs.writeFileSync(speciesDataPath, `export const SPECIES_LINEAGES = ${JSON.stringify(SPECIES_LINEAGES, null, 2)};\n\nexport const DEFAULT_SPECIES = ${JSON.stringify(updatedSpecies, null, 2)};\n`, 'utf8');
console.log('Remapped traits across all Species');

// ============================================================================
// 7. REMAP & REWRITE SPECIES TYPES
// ============================================================================
const speciesTypeDir = path.join(omnicortexRoot, 'species_type');
const speciesTypesDataPath = path.join(projectRoot, 'src', 'data', 'speciesTypesData.js');

if (fs.existsSync(speciesTypeDir)) {
  const stFiles = fs.readdirSync(speciesTypeDir).filter(f => f.endsWith('.md'));
  stFiles.forEach(f => {
    const fullPath = path.join(speciesTypeDir, f);
    const parsed = matter(fs.readFileSync(fullPath, 'utf8'));
    const data = parsed.data || {};
    if (data.traits) data.traits = remapTraits(data.traits);
    fs.writeFileSync(fullPath, matter.stringify(parsed.content, data), 'utf8');
  });
}

// Update speciesTypesData.js
import { DEFAULT_SPECIES_TYPES } from '../src/data/speciesTypesData.js';
const updatedSpeciesTypes = DEFAULT_SPECIES_TYPES.map(st => ({
  ...st,
  traits: remapTraits(st.traits)
}));
fs.writeFileSync(speciesTypesDataPath, `export const DEFAULT_SPECIES_TYPES = ${JSON.stringify(updatedSpeciesTypes, null, 2)};\n`, 'utf8');
console.log('Remapped traits across all Species Types');

// ============================================================================
// 8. UPDATE JSON BACKUPS
// ============================================================================
fs.writeFileSync(path.join(jsonBackupDir, 'trait_database.json'), JSON.stringify(FINAL_CANONICAL_TRAITS, null, 2), 'utf8');
fs.writeFileSync(path.join(jsonBackupDir, 'traits_database.json'), JSON.stringify(FINAL_CANONICAL_TRAITS, null, 2), 'utf8');
fs.writeFileSync(path.join(jsonBackupDir, 'occupations_database.json'), JSON.stringify(updatedOccupations, null, 2), 'utf8');
fs.writeFileSync(path.join(jsonBackupDir, 'species_database.json'), JSON.stringify(updatedSpecies, null, 2), 'utf8');
console.log('Updated JSON backups.');

// ============================================================================
// 9. PURGE & SYNC FIRESTORE CLOUD COLLECTIONS
// ============================================================================
if (getApps().length === 0) initializeApp({ projectId: 'tangent-rpg-dbm' });
const db = getFirestore();

async function purgeAndSyncCloudTraits() {
  console.log('\n--- COMMENCING FIRESTORE TRAIT PURGE & SYNC ---');
  const validIds = new Set(FINAL_CANONICAL_TRAITS.map(t => t.id));

  for (const colName of ['trait', 'traits']) {
    const snap = await db.collection(colName).get();
    console.log(`Collection [${colName}] currently has ${snap.size} documents in cloud.`);

    let deleteBatch = db.batch();
    let deleteOps = 0;
    let deletedCount = 0;

    for (const doc of snap.docs) {
      if (!validIds.has(doc.id)) {
        deleteBatch.delete(doc.ref);
        deleteOps++;
        deletedCount++;
        if (deleteOps >= 400) {
          await deleteBatch.commit();
          deleteBatch = db.batch();
          deleteOps = 0;
        }
      }
    }
    if (deleteOps > 0) {
      await deleteBatch.commit();
    }
    console.log(`Purged ${deletedCount} orphan documents from [${colName}].`);

    // Now write all canonical traits
    let writeBatch = db.batch();
    let writeOps = 0;

    for (const trait of FINAL_CANONICAL_TRAITS) {
      const docRef = db.collection(colName).doc(trait.id);
      writeBatch.set(docRef, {
        ...trait,
        category: 'traits',
        body: trait.description,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      writeOps++;

      if (writeOps >= 400) {
        await writeBatch.commit();
        writeBatch = db.batch();
        writeOps = 0;
      }
    }
    if (writeOps > 0) {
      await writeBatch.commit();
    }
    console.log(`Committed ${FINAL_CANONICAL_TRAITS.length} canonical traits to [${colName}].`);
  }

  // Also sync updated occupations and species to cloud
  for (const occ of updatedOccupations) {
    await db.collection('occupations').doc(occ.id).set(occ, { merge: true });
  }
  console.log('Synced updated occupations to Firestore.');

  for (const sp of updatedSpecies) {
    await db.collection('species').doc(sp.id).set(sp, { merge: true });
  }
  console.log('Synced updated species to Firestore.');

  console.log('\n================================================================');
  console.log('TRAIT DEDUPLICATION & PURGE COMPLETE!');
  console.log('================================================================');
}

purgeAndSyncCloudTraits().catch(err => {
  console.error('Error during Firestore purge & sync:', err);
  process.exit(1);
});