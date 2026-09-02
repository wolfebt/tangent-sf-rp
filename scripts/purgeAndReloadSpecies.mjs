import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const rulesDocPath = path.join(projectRoot, 'docs', 'game rules', 'operator', '1.03 SPECIES (work).md');
const matrixDocPath = path.join(projectRoot, 'docs', 'game rules', 'architect', '99. SPECIES MATRIX.md');

const omniSpeciesDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species');
const omniTypesDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_type');
const omniSizesDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_size');
const omniMovementsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_movement');
const omniTraitsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'traits');

const speciesDataJsPath = path.join(projectRoot, 'src', 'data', 'speciesData.js');
const typesDataJsPath = path.join(projectRoot, 'src', 'data', 'speciesTypesData.js');
const sizeDataJsPath = path.join(projectRoot, 'src', 'data', 'speciesSizeData.js');
const movementDataJsPath = path.join(projectRoot, 'src', 'data', 'speciesMovementData.js');
const traitsDataJsPath = path.join(projectRoot, 'src', 'data', 'speciesTraitsData.js');

const jsonCollectionDir = path.join(projectRoot, 'docs', 'recommendations and revison plans', 'omnicortex json', 'current collection');

console.log('================================================================');
console.log('STARTING MASTER PURGE, INHERITANCE, AND SPECIES RELOAD PIPELINE');
console.log('================================================================');

// Ensure directories
[omniSpeciesDir, omniTypesDir, omniSizesDir, omniMovementsDir, omniTraitsDir, jsonCollectionDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ============================================================================
// 1. DEDUPLICATE AND REBUILD TRAITS DATASET
// ============================================================================
console.log('\n--- 1. Deduplicating Traits Dataset ---');

const existingTraitFiles = fs.readdirSync(omniTraitsDir).filter(f => f.endsWith('.md'));
const traitsMap = new Map();
const filesToDelete = new Set();

const duplicateNameMap = {
  'trait-agent-adaptability.md': 'trait-adaptability.md',
  'trait-builder-adaptability.md': 'trait-adaptability.md',
  'trait-citizen-adaptability.md': 'trait-adaptability.md',
  'trait-drifter-adaptability.md': 'trait-adaptability.md',
  'trait-merchant-adaptability.md': 'trait-adaptability.md',
  'trait-scholar-adaptability.md': 'trait-adaptability.md',
  'trait-scout-adaptability.md': 'trait-adaptability.md',
  'trait-specialist-adaptability.md': 'trait-adaptability.md',
  'trait-adept-resourcefulness.md': 'trait-resourcefulness.md',
  'trait-criminal-resourcefulness.md': 'trait-resourcefulness.md',
  'trait-drifter-resourcefulness.md': 'trait-resourcefulness.md',
  'trait-merchant-resourcefulness.md': 'trait-resourcefulness.md',
  'trait-scout-resourcefulness.md': 'trait-resourcefulness.md',
  'trait-specialist-resourcefulness.md': 'trait-resourcefulness.md',
  'trait-adept-versatility.md': 'trait-versatility.md',
  'trait-specialist-versatility.md': 'trait-versatility.md',
  'trait-drifter-adventurous-spirit.md': 'trait-adventurous-spirit.md',
  'trait-agent-combat-skills.md': 'trait-combat-skills.md',
  'trait-criminal-deception.md': 'trait-agent-deception.md',
  'trait-representative-languages.md': 'trait-agent-languages.md',
  'trait-agent-networking.md': 'trait-networking.md',
  'trait-citizen-networking.md': 'trait-networking.md',
  'trait-criminal-networking.md': 'trait-networking.md',
  'trait-merchant-networking.md': 'trait-networking.md',
  'trait-representative-networking.md': 'trait-networking.md',
  'trait-scout-physical-fitness.md': 'trait-physical-fitness.md',
  'trait-agent-physical-fitness.md': 'trait-physical-fitness.md',
  'trait-agent-survival-skills.md': 'trait-survival-skills.md',
  'trait-scout-survival-skills.md': 'trait-survival-skills.md',
  'trait-builder-attention-to-detail.md': 'trait-attention-to-detail.md',
  'trait-scholar-attention-to-detail.md': 'trait-attention-to-detail.md',
  'trait-soldier-attention-to-detail.md': 'trait-attention-to-detail.md',
  'trait-builder-business-acumen.md': 'trait-business-acumen.md',
  'trait-merchant-business-acumen.md': 'trait-business-acumen.md',
  'trait-builder-creativity.md': 'trait-creativity.md',
  'trait-representative-creativity.md': 'trait-creativity.md',
  'trait-builder-environmental-awareness.md': 'trait-environmental-awareness.md',
  'trait-builder-patience.md': 'trait-patience.md',
  'trait-scholar-patience.md': 'trait-patience.md',
  'trait-builder-persistence.md': 'trait-persistence.md',
  'trait-builder-teamwork.md': 'trait-teamwork.md',
  'trait-builder-time-management.md': 'trait-time-management.md',
  'trait-representative-time-management.md': 'trait-time-management.md',
  'trait-citizen-management.md': 'trait-management.md',
  'trait-citizen-negotiation.md': 'trait-negotiation.md',
  'trait-merchant-negotiation.md': 'trait-negotiation.md',
  'trait-representative-negotiation.md': 'trait-negotiation.md',
  'trait-citizen-problem-solving.md': 'trait-problem-solving.md',
  'trait-scholar-problem-solving.md': 'trait-problem-solving.md',
  'trait-specialist-problem-solving.md': 'trait-problem-solving.md',
  'trait-scholar-collaboration.md': 'trait-collaboration.md',
  'trait-criminal-aggressiveness.md': 'trait-aggressiveness.md',
  'trait-drifter-aggressiveness.md': 'trait-aggressiveness.md',
  'trait-criminal-combat-training.md': 'trait-combat-training.md',
  'trait-drifter-combat-training.md': 'trait-combat-training.md',
  'trait-scout-combat-training.md': 'trait-combat-training.md',
  'trait-soldier-combat-training.md': 'trait-combat-training.md',
  'trait-criminal-risk-taking.md': 'trait-risk-taking.md',
  'trait-criminal-stalker.md': 'trait-stalker-occupation.md',
  'trait-drifter-stalker.md': 'trait-stalker-occupation.md',
  'trait-scout-stalker.md': 'trait-stalker-occupation.md',
  'trait-soldier-stalker.md': 'trait-stalker-occupation.md',
  'trait-criminal-street-smarts.md': 'trait-street-smarts.md',
  'trait-drifter-street-smarts.md': 'trait-street-smarts.md',
  'trait-scout-curiosity.md': 'trait-curiosity-occupation.md',
  'trait-entertainer-adaptable.md': 'trait-adaptable.md',
  'trait-soldier-adaptable.md': 'trait-adaptable.md',
  'trait-entertainer-charismatic.md': 'trait-charismatic.md',
  'trait-merchant-charismatic.md': 'trait-charismatic.md',
  'trait-scout-independence.md': 'trait-independence.md',
  'trait-specialist-leadership.md': 'trait-leadership.md',
  'trait-soldier-loyal.md': 'trait-loyal.md',
  'trait-scout-camouflage.md': 'trait-camouflage-occupation.md',
  'trait-soldier-strategic.md': 'trait-strategic.md'
};

for (const file of existingTraitFiles) {
  const fullPath = path.join(omniTraitsDir, file);
  if (duplicateNameMap[file]) {
    filesToDelete.add(fullPath);
    continue;
  }
  const raw = fs.readFileSync(fullPath, 'utf8');
  const parsed = matter(raw);
  const data = parsed.data || {};
  const id = data.id || file.replace(/\.md$/, '');
  const name = data.name || data.title || id;

  traitsMap.set(id, {
    id,
    name,
    category: 'traits',
    trait_type: data.trait_type || (id.startsWith('trait-species-') ? 'Species Trait' : 'Occupational Trait'),
    trait_tier: data.trait_tier || 'Basic',
    classification: data.classification || data.type || 'Physical',
    type: data.type || data.classification || 'Physical',
    bp: typeof data.costs?.bp === 'number' ? data.costs.bp : (typeof data.bp === 'number' ? data.bp : 1),
    costs: data.costs || { bp: data.bp || 1, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
    is_ranked: Boolean(data.is_ranked),
    description: data.description || (parsed.content || '').trim().slice(0, 300),
    body: (parsed.content || '').trim()
  });
}

for (const filePath of filesToDelete) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
console.log(`Deduplicated traits. Removed ${filesToDelete.size} duplicate files. Unique traits count: ${traitsMap.size}`);

const allTraitsArray = Array.from(traitsMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
fs.writeFileSync(traitsDataJsPath, `/**
 * Canonical Traits Database for Tangent SF RP (Deduplicated)
 * Auto-generated by scripts/purgeAndReloadSpecies.mjs
 * Total Traits: ${allTraitsArray.length}
 */

export const ALL_CANONICAL_TRAITS = ${JSON.stringify(allTraitsArray, null, 2)};

export const SPECIES_TRAITS_BASIC = ALL_CANONICAL_TRAITS.filter(t => (t.costs?.bp === 1 || t.bp === 1 || t.trait_tier === 'Basic'));
export const SPECIES_TRAITS_ADVANCED = ALL_CANONICAL_TRAITS.filter(t => (t.costs?.bp === 2 || t.bp === 2 || t.trait_tier === 'Advanced'));
export const SPECIES_TRAITS_ELITE = ALL_CANONICAL_TRAITS.filter(t => (t.costs?.bp === 4 || t.bp === 4 || t.trait_tier === 'Elite'));
`, 'utf8');

// ============================================================================
// 2. SPECIES TYPES, SIZES, AND MOVEMENTS
// ============================================================================
console.log('\n--- 2. Updating Types, Sizes, and Movements Datasets ---');

const speciesTypes = [
  { id: 'species_type-humanoid', name: 'Humanoid', bp: 0, senses: 'Standard visual and auditory range.', immunities: 'None', physiology: 'Humanoids breathe, eat, and sleep.', traits: [] },
  { id: 'species_type-aberration', name: 'Aberration', bp: 1, senses: 'Darkvision out to 60 feet. [1]', immunities: 'None', physiology: 'Aberrations eat, sleep, and breathe.', traits: ['Darkvision 60ft', 'Alien Mind'] },
  { id: 'species_type-beast', name: 'Beast', bp: 1, senses: 'Low-light vision. [1]', immunities: 'None', physiology: 'Beasts eat, sleep, and breathe.', traits: ['Low-Light Vision', 'Beastkin Affinity'] },
  { id: 'species_type-fey', name: 'Fey', bp: 3, senses: 'Low-light vision. [1]', immunities: 'None', physiology: 'Fey breathe and eat, immune to sleep.', traits: ['Low-Light Vision', 'Sleepless'] },
  { id: 'species_type-planar', name: 'Planar', bp: 4, senses: 'Darkvision 60 feet. [1]', immunities: 'Material plane specific effects [3]', physiology: 'Planars breathe, eat, and sleep.', traits: ['Darkvision 60ft', 'Planar Origin'] },
  { id: 'species_type-dragon', name: 'Dragon', bp: 5, senses: 'Darkvision 60 feet [1], Low-light vision [1].', immunities: 'Magical sleep and paralysis [3]', physiology: 'Dragons breathe, eat, and sleep.', traits: ['Darkvision 60ft', 'Low-Light Vision', 'Dragonkin Traits'] },
  { id: 'species_type-mythical', name: 'Mythical', bp: 5, senses: 'Darkvision 60 feet and Low-light vision. [1+1]', immunities: 'Environmental extremes', physiology: 'Mythicals do not eat, sleep, or breathe.', traits: ['Darkvision 60ft', 'Low-Light Vision', 'Mythical Essence'] },
  { id: 'species_type-ooze', name: 'Ooze', bp: 6, senses: 'Blindsight 30ft', immunities: 'Physical conditions and critical hits [3]', physiology: 'Semi-solid amorphous form.', traits: ['Blindsight 30ft', 'Amorphous'] },
  { id: 'species_type-verdant', name: 'Verdant', bp: 9, senses: 'Low-light vision. [1]', immunities: 'Mind-affecting effects, poison, sleep, paralysis [6]', physiology: 'Photosynthetic / mineral nutrition, no sleep.', traits: ['Low-Light Vision', 'Verdant Biology', 'Immune to Sleep'] },
  { id: 'species_type-elemental', name: 'Elemental', bp: 13, senses: 'Darkvision out to 60 feet. [1]', immunities: 'Poison, sleep, paralysis, stunning, flanking [6]', physiology: 'Pure energy/matter matrix.', traits: ['Darkvision 60ft', 'Elemental Form'] },
  { id: 'species_type-synthetic', name: 'Synthetic', bp: 15, senses: 'Low-light vision [1] and Darkvision 60 feet [1].', immunities: 'Asphyxiation, bleeding, critical hits, poison, biological disease, starvation, sleep [9]', physiology: 'Requires repair, structure points, digitized mind.', traits: ['Low-Light Vision', 'Darkvision 60ft', 'Immune to Biology', 'DR 5/-', 'Digitized Mind', 'Robotic Strength'] },
  { id: 'species_type-spectral', name: 'Spectral', bp: 18, senses: 'Darkvision 60 feet, Ether Sight 60 feet.', immunities: 'Non-magical physical weapons, disease, poison.', physiology: 'Incorporeal phase entity.', traits: ['Darkvision 60ft', 'Ether Sight', 'Incorporeal', 'Phasing'] },
  { id: 'species_type-entity', name: 'Entity', bp: 24, senses: 'Darkvision and Ether Sight out to 60 feet. [1+2]', immunities: 'Reality distortion, biological needs, mortal aging.', physiology: 'Transcendent precursor construct.', traits: ['Darkvision 60ft', 'Ether Sight', 'Cosmic Attunement', 'Immortal', 'Ageless'] }
];

speciesTypes.forEach(t => {
  const filePath = path.join(omniTypesDir, `${t.id}.md`);
  const body = `# ${t.name}\n\n**Category**: Species Types (The Chassis)  \n**Build Point Cost**: ${t.bp} BP  \n\n## Description\n${t.name} chassis with innate biological and metaphysical adaptations.\n\n## Senses\n* ${t.senses}\n\n## Immunities & Defenses\n* ${t.immunities}\n\n## Physiology\n* ${t.physiology}`;
  fs.writeFileSync(filePath, matter.stringify(body, {
    id: t.id,
    name: t.name,
    category: 'species_type',
    bp: t.bp,
    cp: t.bp,
    costs: { bp: t.bp, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
    senses: t.senses,
    immunities: t.immunities,
    physiology: t.physiology,
    description: `${t.name} chassis.`
  }), 'utf8');
});

fs.writeFileSync(typesDataJsPath, `/**
 * Canonical Species Types Catalog for Tangent Science Fantasy Roleplay
 * Total Species Types: ${speciesTypes.length}
 */

export const DEFAULT_SPECIES_TYPES = ${JSON.stringify(speciesTypes.map(t => ({
  id: t.id,
  name: t.name,
  category: 'species_type',
  bp: t.bp,
  cp: t.bp,
  costs: { bp: t.bp, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
  senses: t.senses,
  immunities: t.immunities,
  physiology: t.physiology,
  description: `${t.name} chassis with innate biological and metaphysical adaptations.`
})), null, 2)};
`, 'utf8');

// Species Sizes (14 sizes, exact single choice)
const speciesSizes = [
  { id: 'species_size-miniscule', name: 'Miniscule', bp: 8, strength_mod: -32, combat_mod: 32, stealth_mod: 20, reach: '1 in', height_length_range: '< 1 in', weight_range: '< 1 oz', description: 'Microscopic or insect-sized entity.' },
  { id: 'species_size-fine', name: 'Fine', bp: 6, strength_mod: -16, combat_mod: 16, stealth_mod: 16, reach: '6 in', height_length_range: '< 6 in', weight_range: '< 1/8 lb', description: 'Small rodent or tiny drone.' },
  { id: 'species_size-diminutive', name: 'Diminutive', bp: 6, strength_mod: -8, combat_mod: 8, stealth_mod: 12, reach: '1 ft', height_length_range: '< 1 ft', weight_range: '< 1 lb', description: 'Small avian or domestic animal.' },
  { id: 'species_size-tiny', name: 'Tiny', bp: 4, strength_mod: -4, combat_mod: 4, stealth_mod: 8, reach: '2 ft', height_length_range: '< 2 ft', weight_range: '< 8 lbs', description: 'Lap animal or small drone.' },
  { id: 'species_size-small', name: 'Small', bp: 2, strength_mod: -2, combat_mod: 2, stealth_mod: 4, reach: '3 ft', height_length_range: '< 4 ft', weight_range: '< 60 lbs', description: 'Diminutive humanoid or juvenile form.' },
  { id: 'species_size-medium', name: 'Medium', bp: 0, strength_mod: 0, combat_mod: 0, stealth_mod: 0, reach: '5 ft', height_length_range: '4-8 ft', weight_range: '60-500 lbs', description: 'Standard humanoid baseline.' },
  { id: 'species_size-large', name: 'Large', bp: 2, strength_mod: 2, combat_mod: -2, stealth_mod: -4, reach: '10 ft', height_length_range: '8-16 ft', weight_range: '500-4,000 lbs', description: 'Large predator or heavy chassis.' },
  { id: 'species_size-huge', name: 'Huge', bp: 4, strength_mod: 4, combat_mod: -4, stealth_mod: -8, reach: '15 ft', height_length_range: '16-32 ft', weight_range: '4,000-32,000 lbs', description: 'Massive colossus form.' },
  { id: 'species_size-gargantuan', name: 'Gargantuan', bp: 6, strength_mod: 8, combat_mod: -8, stealth_mod: -16, reach: '20 ft', height_length_range: '32-64 ft', weight_range: '32k-250k lbs', description: 'Kaiju or titan scale entity.' },
  { id: 'species_size-colossal', name: 'Colossal', bp: 8, strength_mod: 16, combat_mod: -16, stealth_mod: -32, reach: '25 ft', height_length_range: '64-128 ft', weight_range: '250k-2M lbs', description: 'Monolithic leviathan scale.' },
  { id: 'species_size-titanic', name: 'Titanic', bp: 12, strength_mod: 64, combat_mod: -64, stealth_mod: -40, reach: '100 ft', height_length_range: '128-250 ft', weight_range: '2M-10M lbs', description: 'Planetary fortress size.' },
  { id: 'species_size-super-gargantuan', name: 'Super Gargantuan', bp: 16, strength_mod: 128, combat_mod: -128, stealth_mod: -50, reach: '200 ft', height_length_range: '250-500 ft', weight_range: '10M-50M lbs', description: 'Continental entity scale.' },
  { id: 'species_size-enormous', name: 'Enormous', bp: 20, strength_mod: 32, combat_mod: -32, stealth_mod: -35, reach: '50 ft', height_length_range: '50-100 ft', weight_range: '500k-5M lbs', description: 'Super-heavy construct scale.' },
  { id: 'species_size-mega-colossal', name: 'Mega Colossal', bp: 24, strength_mod: 256, combat_mod: -256, stealth_mod: -60, reach: '500 ft', height_length_range: '500+ ft', weight_range: '50M+ lbs', description: 'Orbital scale entity.' }
];

speciesSizes.forEach(s => {
  const filePath = path.join(omniSizesDir, `${s.id}.md`);
  const body = `# ${s.name}\n\n**Category**: Species Sizes & Scaling  \n**Build Point Cost**: ${s.bp} BP  \n\n## Description\n${s.description}\n\n## Modifiers\n* Strength Modifier: ${s.strength_mod >= 0 ? '+' : ''}${s.strength_mod}\n* Combat / Defense Modifier: ${s.combat_mod >= 0 ? '+' : ''}${s.combat_mod}\n* Stealth Modifier: ${s.stealth_mod >= 0 ? '+' : ''}${s.stealth_mod}\n* Reach: ${s.reach}`;
  fs.writeFileSync(filePath, matter.stringify(body, {
    id: s.id,
    name: s.name,
    category: 'species_size',
    bp: s.bp,
    cp: s.bp,
    costs: { bp: s.bp, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
    strength_mod: s.strength_mod,
    combat_mod: s.combat_mod,
    stealth_mod: s.stealth_mod,
    reach: s.reach,
    height_length_range: s.height_length_range,
    weight_range: s.weight_range,
    description: s.description
  }), 'utf8');
});

fs.writeFileSync(sizeDataJsPath, `/**
 * Canonical Species Sizes & Scaling Multipliers Database
 * Total Sizes: ${speciesSizes.length}
 */

export const DEFAULT_SPECIES_SIZES = ${JSON.stringify(speciesSizes.map(s => ({
  id: s.id,
  name: s.name,
  category: 'species_size',
  bp: s.bp,
  cp: s.bp,
  costs: { bp: s.bp, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
  strength_mod: s.strength_mod,
  combat_mod: s.combat_mod,
  stealth_mod: s.stealth_mod,
  reach: s.reach,
  height_length_range: s.height_length_range,
  weight_range: s.weight_range,
  description: s.description
})), null, 2)};
`, 'utf8');

// Load Species Movements from omnicortex/species_movement
const existingMoveFiles = fs.readdirSync(omniMovementsDir).filter(f => f.endsWith('.md'));
const movementList = [];
for (const file of existingMoveFiles) {
  const raw = fs.readFileSync(path.join(omniMovementsDir, file), 'utf8');
  const parsed = matter(raw);
  const data = parsed.data || {};
  movementList.push({
    id: data.id || file.replace(/\.md$/, ''),
    name: data.name || data.title || file.replace(/\.md$/, ''),
    category: 'species_movement',
    type: data.type || 'Ground',
    speed: typeof data.speed === 'number' ? data.speed : 30,
    bp: typeof data.costs?.bp === 'number' ? data.costs.bp : (typeof data.bp === 'number' ? data.bp : 0),
    costs: data.costs || { bp: data.bp || 0, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
    description: data.description || (parsed.content || '').trim().slice(0, 300),
    body: (parsed.content || '').trim()
  });
}
movementList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

fs.writeFileSync(movementDataJsPath, `/**
 * Canonical Movement Types, Modes, Paces, and Rules for Tangent SF RP
 * Total Movements: ${movementList.length}
 */

export const DEFAULT_SPECIES_MOVEMENT = ${JSON.stringify(movementList, null, 2)};
`, 'utf8');

// ============================================================================
// 3. LOAD COMPLETE CANONICAL 81 SPECIES SPECS
// ============================================================================
console.log('\n--- 3. Ingesting and Building 81 Canonical Species ---');

const buildSpeciesScriptPath = path.join(projectRoot, 'scripts', 'buildSpecies.mjs');
const buildSpeciesContent = fs.readFileSync(buildSpeciesScriptPath, 'utf8');

const rulesContent = fs.readFileSync(rulesDocPath, 'utf8');
const h1Regex = /^# \*\*([^*]+)\*\*/gm;
const sectionMatches = [];
let match;
while ((match = h1Regex.exec(rulesContent)) !== null) {
  sectionMatches.push({
    title: match[1].trim().replace(/\\/g, ''),
    startIndex: match.index,
    length: match[0].length
  });
}

const detailedSections = new Map();
for (let i = 0; i < sectionMatches.length; i++) {
  const current = sectionMatches[i];
  const next = sectionMatches[i + 1];
  const body = rulesContent.substring(
    current.startIndex + current.length,
    next ? next.startIndex : rulesContent.length
  ).trim();
  const cleanTitle = current.title.replace(/\s*\*\s*/g, '').trim();
  const key = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!detailedSections.has(key) || body.length > (detailedSections.get(key)?.body?.length || 0)) {
    detailedSections.set(key, { rawTitle: current.title, cleanTitle, body });
  }
}

// Extract specs block using regex from buildSpecies.mjs
const specsMatch = buildSpeciesContent.match(/const CANONICAL_SPECIES_SPECS = \[([\s\S]*?)\];\s*\/\/\s*==+/);
if (!specsMatch) {
  console.error('Could not extract CANONICAL_SPECIES_SPECS from buildSpecies.mjs');
  process.exit(1);
}

const rawSpecsArray = eval('[' + specsMatch[1] + ']');
console.log(`Extracted ${rawSpecsArray.length} raw species specifications.`);

// Function to calculate final species data with multi-type trait combining and duplicate trait refund
function calculateFinalSpeciesData(spec) {
  let grossTypeBP = 0;
  let duplicateTraitRefundBP = 0;
  const inheritedSenses = [];
  const inheritedDefenses = [];
  const combinedTraits = new Set();
  const inheritedModifiers = [...(spec.inherent_attribute_modifiers || []).map(a => ({ target: a.attribute, value: a.bonus, type: 'attribute', mode: 'inherent' }))];

  // 1. Process Types (Multi-Type Support)
  let rawTypeIds = Array.isArray(spec.type) ? spec.type : (spec.type ? [spec.type] : ['species_type-humanoid']);
  // Clean up any non-canonical types (e.g. species_type-reptile -> species_type-beast)
  const typeIds = rawTypeIds.map(tId => tId === 'species_type-reptile' ? 'species_type-beast' : tId);
  const seenTraitsInTypes = new Set();

  typeIds.forEach(typeId => {
    const typeDef = speciesTypes.find(t => t.id === typeId) || speciesTypes[0];
    grossTypeBP += Number(typeDef.bp || 0);

    if (typeDef.senses && !inheritedSenses.includes(typeDef.senses)) inheritedSenses.push(typeDef.senses);
    if (typeDef.immunities && typeDef.immunities !== 'None' && !inheritedDefenses.includes(typeDef.immunities)) inheritedDefenses.push(typeDef.immunities);

    (typeDef.traits || []).forEach(tr => {
      const trKey = tr.toLowerCase().trim();
      if (seenTraitsInTypes.has(trKey)) {
        duplicateTraitRefundBP += 1; // Refund duplicate trait cost
      } else {
        seenTraitsInTypes.add(trKey);
        combinedTraits.add(tr);
      }
    });
  });

  const netTypeBP = Math.max(0, grossTypeBP - duplicateTraitRefundBP);

  // 2. Process Size (Exactly 1 Size Selection)
  const sizeId = Array.isArray(spec.size) ? spec.size[0] : (spec.size || 'species_size-medium');
  const sizeDef = speciesSizes.find(s => s.id === sizeId) || speciesSizes.find(s => s.id === 'species_size-medium');
  const sizeBP = Number(sizeDef.bp || 0);

  if (sizeDef.strength_mod !== 0) {
    inheritedModifiers.push({ target: 'Strength', value: sizeDef.strength_mod, type: 'attribute', mode: 'size_modifier' });
  }
  if (sizeDef.combat_mod !== 0) {
    inheritedModifiers.push({ target: 'Combat / Defense', value: sizeDef.combat_mod, type: 'combat', mode: 'size_modifier' });
  }
  if (sizeDef.stealth_mod !== 0) {
    inheritedModifiers.push({ target: 'Stealth', value: sizeDef.stealth_mod, type: 'skill', mode: 'size_modifier' });
  }

  // 3. Process Movement (Multi-Movement Selection)
  const movementIds = Array.isArray(spec.movement) ? spec.movement : (spec.movement ? [spec.movement] : ['species_movement-bipedal']);
  let movementBP = 0;
  const speedsList = [];

  movementIds.forEach(mId => {
    if (mId === 'species_movement-bipedal') speedsList.push('Ground 30 ft');
    else if (mId === 'species_movement-quadruped') speedsList.push('Ground 40 ft');
    else if (mId === 'species_movement-flight') { speedsList.push('Flight 60 ft'); movementBP += 4; }
    else if (mId === 'species_movement-swimming') { speedsList.push('Swim 30 ft'); movementBP += 2; }
    else if (mId === 'species_movement-climbing') { speedsList.push('Climb 30 ft'); movementBP += 2; }
    else if (mId === 'species_movement-slithering') speedsList.push('Slither 25 ft');
    else if (mId === 'species_movement-glide') { speedsList.push('Glide 30 ft'); movementBP += 1; }
    else speedsList.push('30 ft');
  });

  // 4. Attributes & Skills BP
  let attrBP = 0;
  (spec.inherent_attribute_modifiers || []).forEach(a => {
    attrBP += (a.bonus || 0) * (a.bonus > 0 ? 4 : -5);
  });
  if (spec.bonus_attribute_points) attrBP += spec.bonus_attribute_points * 4;

  const skillBP = (spec.bonus_skills || 0) * (16 / 20); // 4 BP per 5 ranks

  // 5. Inherent Features & Traits BP
  let traitsBP = 0;
  (spec.inherent_features || []).forEach(featName => {
    const featKey = String(featName).toLowerCase().trim();
    if (!combinedTraits.has(featKey)) {
      combinedTraits.add(featName);
      traitsBP += 1; // Base basic feature cost
    }
  });

  // 6. Stigma Discounts
  let stigmaDiscount = 0;
  if (spec.stigma && spec.stigma.includes('-1')) stigmaDiscount = 1;
  else if (spec.stigma && spec.stigma.includes('-2')) stigmaDiscount = 2;
  else if (spec.stigma && spec.stigma.includes('-4')) stigmaDiscount = 4;
  else if (spec.stigma && spec.stigma.includes('-6')) stigmaDiscount = 6;

  const calculatedTotalBP = Math.max(10, netTypeBP + sizeBP + movementBP + attrBP + skillBP + traitsBP - stigmaDiscount);

  // Lineage standardizer
  let lineageClean = spec.lineage || 'Independent Xenotypes';
  if (lineageClean === 'Humans') lineageClean = 'Humans (Core & Variants)';
  if (lineageClean === 'Asi') lineageClean = 'Asi (Fey Lineages)';
  if (lineageClean === 'Engineered Humans') lineageClean = 'Engineered Humans (Gen-E)';
  if (lineageClean === "Sha'nor") lineageClean = "Sha'nor & Void Lineages";
  if (lineageClean === 'Independent') lineageClean = 'Independent Xenotypes';

  return {
    ...spec,
    lineage: lineageClean,
    parent_species: lineageClean,
    type: typeIds,
    size: [sizeDef.id],
    movement: movementIds,
    speeds: speedsList.join(', '),
    reach: sizeDef.reach || '5 ft',
    senses: inheritedSenses.join(', ') || 'Standard',
    immunities: inheritedDefenses.join(', ') || 'None',
    modifiers: inheritedModifiers,
    costs: { bp: calculatedTotalBP, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
    cp_cost: calculatedTotalBP,
    cp: calculatedTotalBP,
    bp: calculatedTotalBP
  };
}

// Purge old species markdown files
const oldFiles = fs.readdirSync(omniSpeciesDir);
for (const f of oldFiles) {
  fs.unlinkSync(path.join(omniSpeciesDir, f));
}
console.log(`Purged ${oldFiles.length} legacy species markdown files.`);

// Write each clean species file
const compiledSpeciesList = [];

for (const rawSpec of rawSpecsArray) {
  const fullSpec = calculateFinalSpeciesData(rawSpec);
  const section = detailedSections.get(fullSpec.sectionKey || fullSpec.name.toLowerCase().replace(/[^a-z0-9]/g, ''));

  let markdownBody = '';
  if (section && section.body && section.body.length > 200) {
    markdownBody = `# ${fullSpec.title}\n\n${section.body}`;
  } else {
    markdownBody = `# ${fullSpec.title}\n\n## Description\n${fullSpec.defaultDesc}\n\n## Core Identity\n- **Lineage**: ${fullSpec.lineage}\n- **Type**: ${fullSpec.type.join(', ')}\n- **Size**: ${fullSpec.size.join(', ')}\n- **Movement**: ${fullSpec.speeds}\n- **Homeworld**: ${fullSpec.homeworld}\n- **Tech Level**: ${fullSpec.tech_level}\n- **Meta Level**: ${fullSpec.meta_level}\n- **Stigma**: ${fullSpec.stigma}\n\n## Mechanics & Statblock\n- **BP Cost**: ${fullSpec.cp_cost} BP\n- **Inherent Modifiers**: ${fullSpec.inherent_attribute_modifiers.map(a => `${a.bonus > 0 ? '+' : ''}${a.bonus} ${a.attribute}`).join(', ') || 'None'}\n- **Bonus Skills**: +${fullSpec.bonus_skills} Skill Points\n- **Inherent Features**: ${fullSpec.inherent_features.join(', ')}\n- **Recommended Features**: ${fullSpec.recommended_features.join(', ')}\n\n## Roleplay & Society\n${fullSpec.defaultDesc}\n`;
  }

  const frontmatter = {
    id: fullSpec.id,
    name: fullSpec.name,
    title: fullSpec.title,
    category: 'species',
    parent_species: fullSpec.lineage,
    type: fullSpec.type,
    size: fullSpec.size,
    movement: fullSpec.movement,
    speeds: fullSpec.speeds,
    reach: fullSpec.reach,
    senses: fullSpec.senses,
    immunities: fullSpec.immunities,
    inherent_attribute_modifiers: fullSpec.inherent_attribute_modifiers,
    bonus_attribute_points: fullSpec.bonus_attribute_points,
    specific_skill_bonuses: fullSpec.specific_skill_bonuses,
    bonus_skills: fullSpec.bonus_skills,
    bonus_skill_choices: fullSpec.bonus_skill_choices,
    inherent_features: fullSpec.inherent_features,
    bonus_features: fullSpec.bonus_features,
    bonus_feature_choices: fullSpec.bonus_feature_choices,
    recommended_features: fullSpec.recommended_features,
    stigma: fullSpec.stigma,
    tech_level: fullSpec.tech_level,
    meta_level: fullSpec.meta_level,
    homeworld: fullSpec.homeworld,
    costs: fullSpec.costs,
    modifiers: fullSpec.modifiers,
    cp_cost: fullSpec.cp_cost,
    cp: fullSpec.cp,
    bp: fullSpec.bp,
    description: fullSpec.defaultDesc
  };

  const fileContent = matter.stringify(markdownBody, frontmatter);
  fs.writeFileSync(path.join(omniSpeciesDir, `${fullSpec.id}.md`), fileContent, 'utf8');

  compiledSpeciesList.push({
    ...frontmatter,
    body: markdownBody
  });
}

console.log(`Successfully written ${compiledSpeciesList.length} canonical species markdown files.`);

// Write speciesData.js
const speciesDataJsContent = `/**
 * Canonical Species Catalog for Tangent Science Fantasy Roleplaying Game (SFF RPG)
 * Auto-generated by scripts/purgeAndReloadSpecies.mjs
 * Total Species Count: ${compiledSpeciesList.length}
 */

export const SPECIES_LINEAGES = [
  { id: 'aeld', name: 'Aeld', description: 'Long-lived, graceful beings possessing innate arcane affinity, high technology, and specialized sub-species adaptations.' },
  { id: 'asi', name: 'Asi (Fey Lineages)', description: 'Ageless fey entities connected to the primal forces of nature, illusion, and multidimensional realms.' },
  { id: 'aulurans', name: 'Aulurans', description: 'Biotechnological feline predators organized into distinct physical castes (Dar, Koda, Graa, Prokos).' },
  { id: 'humans', name: 'Humans (Core & Variants)', description: 'The versatile, ubiquitous baseline of the galaxy along with regional environmental adaptations.' },
  { id: 'gene', name: 'Engineered Humans (Gen-E)', description: 'Laboratory-optimized transhumans, psionic lines, and specialized military combat castes.' },
  { id: 'kitin', name: 'Kitin', description: 'Chitinous insectoid beings connected via hive psionics, ranging from diplomatic humanoids to colossus swarm forms.' },
  { id: 'synthetics', name: 'Synthetics', description: 'Mechanical, silicon, and digitized entities, from androids and scraps to pure intellect cores and crystalline eidolons.' },
  { id: 'shanor', name: "Sha'nor & Void Lineages", description: "Semi-corporeal beings born of deep void rifts, wielding reality-warping and spectral powers." },
  { id: 'progenitors', name: 'Progenitors', description: 'Ancient deific precursors of immense intellect, matter manipulation, and dimensional mastery.' },
  { id: 'independent', name: 'Independent Xenotypes', description: 'Diverse sentient alien species native to unique planetary biomes across the Reach.' }
];

export const DEFAULT_SPECIES = ${JSON.stringify(compiledSpeciesList, null, 2)};

export const getSpeciesById = (id) => DEFAULT_SPECIES.find(s => s.id === id);

export const getSpeciesByLineage = (lineageName) => 
  DEFAULT_SPECIES.filter(s => (s.parent_species || '').toLowerCase() === (lineageName || '').toLowerCase());

export const getSpeciesBpCost = (speciesObj) => {
  if (!speciesObj) return 0;
  return parseInt(speciesObj.cp_cost || speciesObj.cp || speciesObj.bp || 0, 10);
};
`;

fs.writeFileSync(speciesDataJsPath, speciesDataJsContent, 'utf8');
console.log(`Updated: ${speciesDataJsPath}`);

// Update JSON Backups
fs.writeFileSync(path.join(jsonCollectionDir, 'species_database.json'), JSON.stringify(compiledSpeciesList, null, 2), 'utf8');
fs.writeFileSync(path.join(jsonCollectionDir, 'species_type_database.json'), JSON.stringify(speciesTypes, null, 2), 'utf8');
fs.writeFileSync(path.join(jsonCollectionDir, 'species_size_database.json'), JSON.stringify(speciesSizes, null, 2), 'utf8');
fs.writeFileSync(path.join(jsonCollectionDir, 'species_movement_database.json'), JSON.stringify(movementList, null, 2), 'utf8');
fs.writeFileSync(path.join(jsonCollectionDir, 'trait_database.json'), JSON.stringify(allTraitsArray, null, 2), 'utf8');
console.log('Updated all JSON backup files in current collection.');

console.log('\n================================================================');
console.log('MASTER PURGE, INHERITANCE AND SPECIES RELOAD COMPLETE!');
console.log('================================================================');
