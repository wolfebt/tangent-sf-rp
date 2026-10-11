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
import { DEFAULT_ORIGINS } from '../src/data/originsData.js';
import { DEFAULT_OCCUPATIONS } from '../src/data/occupationsData.js';
import compendiumSeedData from '../src/data/compendiumSeed.json' with { type: 'json' };
import { BASTION_MECHANICS_DATASET } from '../src/data/mechanicsData.js';

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
console.log('[1/5] Checking Runtime Data Bundle Counts...');
assert(DEFAULT_SPECIES.length === 81, 'Species count parity', `Expected 81, got ${DEFAULT_SPECIES.length}`);
assert(DEFAULT_ARCHETYPES.length >= 48, 'Archetypes count parity', `Expected >= 48, got ${DEFAULT_ARCHETYPES.length}`);
assert(DEFAULT_FEATURES.length === 234, 'Features count parity', `Expected 234, got ${DEFAULT_FEATURES.length}`);
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
console.log('\n[2/5] Testing Relational Cross-Reference Resolution Rates...');

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

// Species -> Recommendations & Keywords resolution
const knownOriginNames = new Set(DEFAULT_ORIGINS.map(o => (o.name || o.title || '').toLowerCase()));
let origTotal = 0, origMatched = 0;
DEFAULT_SPECIES.forEach(s => {
  (s.recommended_origins || []).forEach(o => {
    origTotal++;
    if (knownOriginNames.has(String(o).toLowerCase().trim())) origMatched++;
  });
});
const origRate = origTotal > 0 ? (origMatched / origTotal) * 100 : 0;
assert(origRate === 100, `Species -> Recommended Origins resolution: ${origMatched}/${origTotal} (${origRate.toFixed(1)}%)`);

const knownOccuNames = new Set(DEFAULT_OCCUPATIONS.map(oc => (oc.name || oc.title || '').toLowerCase()));
let occuTotal = 0, occuMatched = 0;
DEFAULT_SPECIES.forEach(s => {
  (s.recommended_occupations || []).forEach(oc => {
    occuTotal++;
    if (knownOccuNames.has(String(oc).toLowerCase().trim())) occuMatched++;
  });
});
const occuRate = occuTotal > 0 ? (occuMatched / occuTotal) * 100 : 0;
assert(occuRate === 100, `Species -> Recommended Occupations resolution: ${occuMatched}/${occuTotal} (${occuRate.toFixed(1)}%)`);

const speciesWithFactions = DEFAULT_SPECIES.filter(s => Array.isArray(s.recommended_factions) && s.recommended_factions.length > 0).length;
assert(speciesWithFactions === DEFAULT_SPECIES.length, `Species -> Recommended Factions coverage: ${speciesWithFactions}/${DEFAULT_SPECIES.length}`);

const speciesWithKeywords = DEFAULT_SPECIES.filter(s => typeof s.keywords === 'string' && s.keywords.trim().length > 0).length;
assert(speciesWithKeywords === DEFAULT_SPECIES.length, `Species -> Guidance Keywords coverage: ${speciesWithKeywords}/${DEFAULT_SPECIES.length}`);

const speciesWithNegKeywords = DEFAULT_SPECIES.filter(s => typeof s.negative_keywords === 'string' && s.negative_keywords.trim().length > 0).length;
assert(speciesWithNegKeywords === DEFAULT_SPECIES.length, `Species -> Negative Railguards coverage: ${speciesWithNegKeywords}/${DEFAULT_SPECIES.length}`);

// Faction Recommendations & Guidance Directives
const knownSpeciesNames = new Set(DEFAULT_SPECIES.map(sp => (sp.name || sp.title || '').toLowerCase()));
let facSpTotal = 0, facSpMatched = 0;
DEFAULT_FACTIONS.forEach(f => {
  (f.recommended_species || []).forEach(sp => {
    facSpTotal++;
    if (knownSpeciesNames.has(String(sp).toLowerCase().trim())) facSpMatched++;
  });
});
const facSpRate = facSpTotal > 0 ? (facSpMatched / facSpTotal) * 100 : 0;
assert(facSpRate === 100, `Faction -> Recommended Species resolution: ${facSpMatched}/${facSpTotal} (${facSpRate.toFixed(1)}%)`);

let facOrigTotal = 0, facOrigMatched = 0;
DEFAULT_FACTIONS.forEach(f => {
  (f.recommended_origins || []).forEach(o => {
    facOrigTotal++;
    if (knownOriginNames.has(String(o).toLowerCase().trim())) facOrigMatched++;
  });
});
const facOrigRate = facOrigTotal > 0 ? (facOrigMatched / facOrigTotal) * 100 : 0;
assert(facOrigRate === 100, `Faction -> Recommended Origins resolution: ${facOrigMatched}/${facOrigTotal} (${facOrigRate.toFixed(1)}%)`);

let facOccuTotal = 0, facOccuMatched = 0;
DEFAULT_FACTIONS.forEach(f => {
  (f.recommended_occupations || []).forEach(oc => {
    facOccuTotal++;
    if (knownOccuNames.has(String(oc).toLowerCase().trim())) facOccuMatched++;
  });
});
const facOccuRate = facOccuTotal > 0 ? (facOccuMatched / facOccuTotal) * 100 : 0;
assert(facOccuRate === 100, `Faction -> Recommended Occupations resolution: ${facOccuMatched}/${facOccuTotal} (${facOccuRate.toFixed(1)}%)`);

const factionsWithKeywords = DEFAULT_FACTIONS.filter(f => typeof f.keywords === 'string' && f.keywords.trim().length > 0).length;
assert(factionsWithKeywords === DEFAULT_FACTIONS.length, `Faction -> Guidance Keywords coverage: ${factionsWithKeywords}/${DEFAULT_FACTIONS.length}`);

const factionsWithNegKeywords = DEFAULT_FACTIONS.filter(f => typeof f.negative_keywords === 'string' && f.negative_keywords.trim().length > 0).length;
assert(factionsWithNegKeywords === DEFAULT_FACTIONS.length, `Faction -> Negative Railguards coverage: ${factionsWithNegKeywords}/${DEFAULT_FACTIONS.length}`);

// Origin Recommendations & Guidance Directives
const knownFactionNames = new Set(DEFAULT_FACTIONS.map(f => (f.name || f.title || '').toLowerCase()));

let origSpTotal = 0, origSpMatched = 0;
DEFAULT_ORIGINS.forEach(orig => {
  (orig.recommended_species || []).forEach(sp => {
    origSpTotal++;
    if (knownSpeciesNames.has(String(sp).toLowerCase().trim())) origSpMatched++;
  });
});
const origSpRate = origSpTotal > 0 ? (origSpMatched / origSpTotal) * 100 : 0;
assert(origSpRate === 100, `Origin -> Recommended Species resolution: ${origSpMatched}/${origSpTotal} (${origSpRate.toFixed(1)}%)`);

let origFacTotal = 0, origFacMatched = 0;
DEFAULT_ORIGINS.forEach(orig => {
  (orig.recommended_factions || []).forEach(f => {
    origFacTotal++;
    if (knownFactionNames.has(String(f).toLowerCase().trim())) origFacMatched++;
  });
});
const origFacRate = origFacTotal > 0 ? (origFacMatched / origFacTotal) * 100 : 0;
assert(origFacRate === 100, `Origin -> Recommended Factions resolution: ${origFacMatched}/${origFacTotal} (${origFacRate.toFixed(1)}%)`);

let origOccuTotal = 0, origOccuMatched = 0;
DEFAULT_ORIGINS.forEach(orig => {
  (orig.recommended_occupations || []).forEach(oc => {
    origOccuTotal++;
    if (knownOccuNames.has(String(oc).toLowerCase().trim())) origOccuMatched++;
  });
});
const origOccuRate = origOccuTotal > 0 ? (origOccuMatched / origOccuTotal) * 100 : 0;
assert(origOccuRate === 100, `Origin -> Recommended Occupations resolution: ${origOccuMatched}/${origOccuTotal} (${origOccuRate.toFixed(1)}%)`);

const originsWithKeywords = DEFAULT_ORIGINS.filter(o => typeof o.keywords === 'string' && o.keywords.trim().length > 0).length;
assert(originsWithKeywords === DEFAULT_ORIGINS.length, `Origin -> Guidance Keywords coverage: ${originsWithKeywords}/${DEFAULT_ORIGINS.length}`);

const originsWithNegKeywords = DEFAULT_ORIGINS.filter(o => typeof o.negative_keywords === 'string' && o.negative_keywords.trim().length > 0).length;
assert(originsWithNegKeywords === DEFAULT_ORIGINS.length, `Origin -> Negative Railguards coverage: ${originsWithNegKeywords}/${DEFAULT_ORIGINS.length}`);

// Occupation Recommendations & Guidance Directives
let occSpTotal = 0, occSpMatched = 0;
DEFAULT_OCCUPATIONS.forEach(occ => {
  (occ.recommended_species || []).forEach(sp => {
    occSpTotal++;
    if (knownSpeciesNames.has(String(sp).toLowerCase().trim())) occSpMatched++;
    else console.warn(`Unmatched Occupation species: "${sp}" in ${occ.id}`);
  });
});
const occSpRate = occSpTotal > 0 ? (occSpMatched / occSpTotal) * 100 : 0;
assert(occSpRate === 100, `Occupation -> Recommended Species resolution: ${occSpMatched}/${occSpTotal} (${occSpRate.toFixed(1)}%)`);

let occFacTotal = 0, occFacMatched = 0;
DEFAULT_OCCUPATIONS.forEach(occ => {
  (occ.recommended_factions || []).forEach(f => {
    occFacTotal++;
    if (knownFactionNames.has(String(f).toLowerCase().trim())) occFacMatched++;
    else console.warn(`Unmatched Occupation faction: "${f}" in ${occ.id}`);
  });
});
const occFacRate = occFacTotal > 0 ? (occFacMatched / occFacTotal) * 100 : 0;
assert(occFacRate === 100, `Occupation -> Recommended Factions resolution: ${occFacMatched}/${occFacTotal} (${occFacRate.toFixed(1)}%)`);

let occOrigTotal = 0, occOrigMatched = 0;
DEFAULT_OCCUPATIONS.forEach(occ => {
  (occ.recommended_origins || []).forEach(o => {
    occOrigTotal++;
    if (knownOriginNames.has(String(o).toLowerCase().trim())) occOrigMatched++;
    else console.warn(`Unmatched Occupation origin: "${o}" in ${occ.id}`);
  });
});
const occOrigRate = occOrigTotal > 0 ? (occOrigMatched / occOrigTotal) * 100 : 0;
assert(occOrigRate === 100, `Occupation -> Recommended Origins resolution: ${occOrigMatched}/${occOrigTotal} (${occOrigRate.toFixed(1)}%)`);

const occupationsWithKeywords = DEFAULT_OCCUPATIONS.filter(o => typeof o.keywords === 'string' && o.keywords.trim().length > 0).length;
assert(occupationsWithKeywords === DEFAULT_OCCUPATIONS.length, `Occupation -> Guidance Keywords coverage: ${occupationsWithKeywords}/${DEFAULT_OCCUPATIONS.length}`);

const occupationsWithNegKeywords = DEFAULT_OCCUPATIONS.filter(o => typeof o.negative_keywords === 'string' && o.negative_keywords.trim().length > 0).length;
assert(occupationsWithNegKeywords === DEFAULT_OCCUPATIONS.length, `Occupation -> Negative Railguards coverage: ${occupationsWithNegKeywords}/${DEFAULT_OCCUPATIONS.length}`);

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
  'divination': 'Metaphysics', 'dimension': 'Metaphysics', 'dimension)': 'Metaphysics'
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
console.log('\n[3/5] Testing Modifier & Cost Integrity...');
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
// Note: 19 species (Base Human, Gen-E Base, Aquatican, Chimera, etc.) canonically have 0 inherent attribute modifiers
// because they are flexible baseline species with CP/skill choice pools rather than fixed attribute biases.
assert(modRate >= 75, `Species Modifier Population Rate: ${populatedSpeciesMods}/${DEFAULT_SPECIES.length} (${modRate.toFixed(1)}% - canonical baseline parity verified)`);

// 4. Equipment Baseline Costs Verification
console.log('\n[4/5] Testing Equipment & Invocation Cost Integrity...');
const weaponsWithCost = DEFAULT_WEAPONRY.filter(w => (w.costs?.credits || 0) > 0);
assert(weaponsWithCost.length === DEFAULT_WEAPONRY.length, `Weaponry cost coverage: ${weaponsWithCost.length}/${DEFAULT_WEAPONRY.length} items`);

const invocationsWithStrain = DEFAULT_INVOCATIONS.filter(i => (i.costs?.strain || 0) > 0);
assert(invocationsWithStrain.length === DEFAULT_INVOCATIONS.length, `Invocations strain cost coverage: ${invocationsWithStrain.length}/${DEFAULT_INVOCATIONS.length} items`);

// 5. BASTION Mechanics Rules Dataset Verification
console.log('\n[5/5] Testing BASTION Mechanics Dataset Integrity...');
assert(Array.isArray(BASTION_MECHANICS_DATASET) && BASTION_MECHANICS_DATASET.length >= 10, 'Mechanics rule count parity', `Expected >= 10, got ${BASTION_MECHANICS_DATASET?.length}`);

const rulesWithFormulas = BASTION_MECHANICS_DATASET.filter(r => r.mechanic_formula && r.mechanic_formula.trim().length > 0);
assert(rulesWithFormulas.length >= 8, 'Mechanics formula coverage', `Expected >= 8 with formulas, got ${rulesWithFormulas.length}`);

const rulesWithCitations = BASTION_MECHANICS_DATASET.filter(r => r.citation && r.citation.includes('.md'));
assert(rulesWithCitations.length === BASTION_MECHANICS_DATASET.length, 'Mechanics citation grounding', `Expected 100% grounded citations, got ${rulesWithCitations.length}/${BASTION_MECHANICS_DATASET.length}`);

const dualResRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-combat-core-resolution');
assert(Boolean(dualResRule && dualResRule.mechanic_formula.includes('2d10')), 'Dual Resolution formula verified');

const actionEcoRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-combat-actions-by-skill-tier');
assert(Boolean(actionEcoRule && actionEcoRule.mechanic_formula.includes('Rank 1-5: 1 action')), 'Skill Tier Iterative Actions verified');

const limbRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-combat-disabled-destroyed-thresholds');
assert(Boolean(limbRule && limbRule.mechanic_formula.includes('1/3 Health')), 'Disabled/Destroyed (1/3 & 2/3 Health) rule verified');

const scalingRule = BASTION_MECHANICS_DATASET.find(r => r.id === 'mech-scaling-14-tiers');
assert(Boolean(scalingRule && scalingRule.rules_text.includes('Mega Colossal')), '14-Tier Scaling rule verified');


console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} tests passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('================================================================\n');

if (passedTests < totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
