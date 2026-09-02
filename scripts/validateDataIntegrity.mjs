import { DEFAULT_SPECIES } from '../src/data/speciesData.js';
import { DEFAULT_ARCHETYPES } from '../src/data/archetypesData.js';
import { DEFAULT_FEATURES } from '../src/data/featuresData.js';
import { DEFAULT_SPECIES_TRAITS } from '../src/data/speciesTraitsData.js';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../src/data/speciesDisadvantagesData.js';
import { DEFAULT_FACTIONS } from '../src/data/factionsData.js';
import { DEFAULT_SPECIES_SIZES } from '../src/data/speciesSizeData.js';
import { DEFAULT_SPECIES_MOVEMENT } from '../src/data/speciesMovementData.js';
import { DEFAULT_WEAPONRY } from '../src/data/weaponryData.js';
import { DEFAULT_ARMORING } from '../src/data/armoringData.js';
import { DEFAULT_AUGMENTATIONS } from '../src/data/augmentationsData.js';
import { DEFAULT_INVOCATIONS } from '../src/data/invocationsData.js';
import { ALL_CANONICAL_SKILLS } from '../src/data/skillsData.js';
import { DEFAULT_SPECIES_TYPES } from '../src/data/speciesTypesData.js';
import compendiumSeedData from '../src/data/compendiumSeed.json' with { type: 'json' };

console.log('================================================================');
console.log('  TANGENT SF RP — DATA INTEGRITY & INTERCONNECTIVITY TEST SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error(`         -> ${details}`);
  }
}

// 1. Bundle Counts Verification
console.log('[1/4] Checking Runtime Data Bundle Counts...');
assert(DEFAULT_SPECIES.length === 81, 'Species count parity', `Expected 81, got ${DEFAULT_SPECIES.length}`);
assert(DEFAULT_ARCHETYPES.length >= 48, 'Archetypes count parity', `Expected >= 48, got ${DEFAULT_ARCHETYPES.length}`);
assert(DEFAULT_FEATURES.length === 218, 'Features count parity', `Expected 218, got ${DEFAULT_FEATURES.length}`);
assert(DEFAULT_SPECIES_TRAITS.length === 286, 'Traits count parity', `Expected 286, got ${DEFAULT_SPECIES_TRAITS.length}`);
assert(DEFAULT_SPECIES_DISADVANTAGES.length >= 32, 'Disadvantages count parity', `Expected >= 32, got ${DEFAULT_SPECIES_DISADVANTAGES.length}`);
assert(DEFAULT_FACTIONS.length === 40, 'Factions count parity', `Expected 40, got ${DEFAULT_FACTIONS.length}`);
assert(DEFAULT_SPECIES_SIZES.length === 14, 'Species Sizes count parity', `Expected 14, got ${DEFAULT_SPECIES_SIZES.length}`);
assert(DEFAULT_SPECIES_MOVEMENT.length >= 50, 'Species Movement modes count', `Expected >= 50, got ${DEFAULT_SPECIES_MOVEMENT.length}`);
assert(DEFAULT_WEAPONRY.length === 75, 'Weaponry count parity', `Expected 75, got ${DEFAULT_WEAPONRY.length}`);
assert(DEFAULT_ARMORING.length === 37, 'Armoring count parity', `Expected 37, got ${DEFAULT_ARMORING.length}`);
assert(DEFAULT_AUGMENTATIONS.length === 172, 'Augmentations count parity', `Expected 172, got ${DEFAULT_AUGMENTATIONS.length}`);
assert(DEFAULT_INVOCATIONS.length === 137, 'Invocations count parity', `Expected 137, got ${DEFAULT_INVOCATIONS.length}`);
assert(compendiumSeedData.length >= 94, 'Compendium articles count', `Expected >= 94, got ${compendiumSeedData.length}`);

// 2. Relational Cross-Reference Resolution
console.log('\n[2/4] Testing Relational Cross-Reference Resolution Rates...');

const knownSizes = new Set(DEFAULT_SPECIES_SIZES.map(s => s.id));
let sizeTotal = 0, sizeMatched = 0;
DEFAULT_SPECIES.forEach(s => {
  (s.size || []).forEach(sz => {
    sizeTotal++;
    if (knownSizes.has(sz)) sizeMatched++;
  });
});
const sizeRate = sizeTotal > 0 ? (sizeMatched / sizeTotal) * 100 : 0;
assert(sizeRate === 100, `Species -> Size resolution: ${sizeMatched}/${sizeTotal} (${sizeRate.toFixed(1)}%)`);

const knownTypes = new Set(DEFAULT_SPECIES_TYPES.map(t => t.id));
let typeTotal = 0, typeMatched = 0;
DEFAULT_SPECIES.forEach(s => {
  (s.type || []).forEach(tp => {
    typeTotal++;
    if (knownTypes.has(tp)) typeMatched++;
  });
});
const typeRate = typeTotal > 0 ? (typeMatched / typeTotal) * 100 : 0;
assert(typeRate === 100, `Species -> Type resolution: ${typeMatched}/${typeTotal} (${typeRate.toFixed(1)}%)`);

const knownMovements = new Set(DEFAULT_SPECIES_MOVEMENT.map(m => m.id));
let movTotal = 0, movMatched = 0;
DEFAULT_SPECIES.forEach(s => {
  (s.movement || []).forEach(mv => {
    movTotal++;
    if (knownMovements.has(mv)) movMatched++;
  });
});
const movRate = movTotal > 0 ? (movMatched / movTotal) * 100 : 0;
assert(movRate === 100, `Species -> Movement resolution: ${movMatched}/${movTotal} (${movRate.toFixed(1)}%)`);

// Archetype essential skills
const SKILL_ALIASES = {
  'intimidation': 'Intimidate', 'pilot': 'Piloting', 'linguistics': 'Language', 'languages': 'Language',
  'animal handling': 'Handler', 'creature handling': 'Handler', 'combat': 'Melee', 'combat (any)': 'Ranged',
  'combat (melee)': 'Melee', 'combat (ranged)': 'Ranged', 'combat (pistol)': 'Ranged', 'combat (pistols)': 'Ranged',
  'combat (rifle)': 'Ranged', 'combat (rifle/pistol)': 'Ranged', 'combat (melee/pistol)': 'Melee',
  'combat (melee/ranged)': 'Melee', 'combat (melee/heavy)': 'Heavy Weapons', 'combat (heavy)': 'Heavy Weapons',
  'combat (gunnery)': 'Heavy Weapons', 'combat (sniper or blades)': 'Ranged', 'administration': 'Administrator',
  'vocation (administration)': 'Administrator', 'vocation (management)': 'Administrator',
  'vocation (farming/laborer)': 'Farmer', 'vocation (farming)': 'Farmer', 'vocation (laborer)': 'Laborer',
  'vocation (general)': 'Laborer', 'law': 'Academics', 'knowledge (law)': 'Academics',
  'knowledge (law/streetwise)': 'Streetwise', 'knowledge (geography)': 'Navigation',
  'knowledge (architecture)': 'Architect', 'knowledge (astrophysics)': 'Science', 'knowledge (biology)': 'Science',
  'knowledge (geology)': 'Science', 'knowledge (physics)': 'Physics', 'knowledge (xenology)': 'Science',
  'knowledge (languages)': 'Language', 'social': 'Diplomacy', 'etiquette': 'Diplomacy',
  'expression (any)': 'Acting', 'nature/life': 'Nature', 'nature': 'Nature', 'chaos': 'Chaos',
  'divination': 'Metaphysics'
};

const knownSkills = new Set(ALL_CANONICAL_SKILLS.map(sk => (sk.name || '').toLowerCase()));
let skTotal = 0, skMatched = 0;
DEFAULT_ARCHETYPES.forEach(a => {
  (a.essential_skills || []).forEach(skRaw => {
    skTotal++;
    const raw = String(skRaw).trim().toLowerCase();
    const innerMatch = raw.match(/\((.*?)\)/);
    const candidateInner = innerMatch ? innerMatch[1].trim() : null;
    const candidatePrefix = raw.replace(/\s*\(.*\)/, '').trim();
    const alias = SKILL_ALIASES[raw] || (candidateInner ? SKILL_ALIASES[candidateInner.toLowerCase()] : null) || SKILL_ALIASES[candidatePrefix.toLowerCase()];

    if (
      (alias && knownSkills.has(alias.toLowerCase())) ||
      (candidateInner && knownSkills.has(candidateInner.toLowerCase())) ||
      knownSkills.has(raw) ||
      knownSkills.has(candidatePrefix.toLowerCase()) ||
      raw.includes('science') ||
      raw.includes('discipline')
    ) {
      skMatched++;
    }
  });
});
const skRate = skTotal > 0 ? (skMatched / skTotal) * 100 : 0;
assert(skRate >= 95, `Archetype -> Essential Skills resolution: ${skMatched}/${skTotal} (${skRate.toFixed(1)}%)`);

// 3. Modifier Engine & Cost Verification
console.log('\n[3/4] Testing Modifier & Cost Integrity...');
const celestine = DEFAULT_SPECIES.find(s => s.id === 'species-aeld-celestine');
assert(celestine !== undefined, 'Celestine species exists');
assert(celestine?.modifiers?.length > 0, 'Celestine has populated modifiers array', `Got ${celestine?.modifiers?.length}`);
assert(celestine?.inherent_attribute_modifiers?.some(a => a.attribute === 'Agility' && a.bonus === 1), 'Celestine Agility +1 modifier present');
assert(celestine?.inherent_attribute_modifiers?.some(a => a.attribute === 'Intellect' && a.bonus === 1), 'Celestine Intellect +1 modifier present');
assert(celestine?.costs?.bp === 26, 'Celestine BP cost correctly resolved to 26', `Got ${celestine?.costs?.bp}`);

let populatedSpeciesMods = 0;
DEFAULT_SPECIES.forEach(s => {
  if (Array.isArray(s.modifiers) && s.modifiers.length > 0) populatedSpeciesMods++;
});
const modRate = (populatedSpeciesMods / DEFAULT_SPECIES.length) * 100;
assert(modRate >= 75, `Species Modifier Population Rate: ${populatedSpeciesMods}/${DEFAULT_SPECIES.length} (${modRate.toFixed(1)}%)`);

// 4. Equipment Baseline Costs Verification
console.log('\n[4/4] Testing Equipment & Invocation Cost Integrity...');
const weaponsWithCost = DEFAULT_WEAPONRY.filter(w => (w.costs?.credits || 0) > 0);
assert(weaponsWithCost.length === DEFAULT_WEAPONRY.length, `Weaponry cost coverage: ${weaponsWithCost.length}/${DEFAULT_WEAPONRY.length} items`);

const invocationsWithStrain = DEFAULT_INVOCATIONS.filter(i => (i.costs?.strain || 0) > 0);
assert(invocationsWithStrain.length === DEFAULT_INVOCATIONS.length, `Invocations strain cost coverage: ${invocationsWithStrain.length}/${DEFAULT_INVOCATIONS.length} items`);

console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} tests passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('================================================================\n');

if (passedTests < totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
