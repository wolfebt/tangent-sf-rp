import { OMNICORTEX_DATASETS, getDatasetByKey, validateDatasetPayload } from '../src/pages/Codex/codexPromptRegistry.js';
import { adaptSparkItemToFirestore } from '../src/utils/codexIngestionAdapters.js';
import { normalizeOmnicortexItem } from '../src/utils/tangentSchemaAdapters.js';

console.log('===============================================================');
console.log('  RUNNING COMPREHENSIVE OMNICORTEX PIPELINE TEST SUITE');
console.log('===============================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log('  [PASS]: ' + message);
  } else {
    failedTests++;
    console.error('  [FAIL]: ' + message);
  }
}

// 1. Test all 14 datasets against their canonical sampleItems
console.log('--- TEST GROUP 1: Canonical Sample Items & Adapters ---');
OMNICORTEX_DATASETS.forEach((dataset) => {
  const { key, label, sampleItem } = dataset;
  console.log('\nTesting Dataset [' + dataset.code + '] ' + label + ' (' + key + '):');

  // Validation
  const valReport = validateDatasetPayload(key, [sampleItem]);
  assert(valReport.isValid, '[' + key + '] validateDatasetPayload passed with 0 errors');
  assert(valReport.validCount === 1, '[' + key + '] validCount is 1');

  // Adaptation
  const adapted = adaptSparkItemToFirestore(key, sampleItem);
  assert(adapted !== null && typeof adapted === 'object', '[' + key + '] adaptSparkItemToFirestore returned object');
  assert(adapted.name === sampleItem.name, '[' + key + '] name correctly preserved ("' + adapted.name + '")');
  assert(typeof adapted.costs === 'object', '[' + key + '] costs map exists');
  assert(typeof adapted.costs.bp === 'number', '[' + key + '] costs.bp is a number (' + adapted.costs.bp + ')');
  assert(typeof adapted.costs.credits === 'number', '[' + key + '] costs.credits is a number (' + adapted.costs.credits + ')');
  assert(Array.isArray(adapted.modifiers), '[' + key + '] modifiers is an array (length: ' + adapted.modifiers.length + ')');
  if (adapted.tech_level !== null && adapted.tech_level !== undefined) {
    assert(typeof adapted.tech_level === 'number', '[' + key + '] tech_level is a number (' + adapted.tech_level + ')');
  }
});

// 2. Test Legacy Flat-String Fallback Tolerance
console.log('\n--- TEST GROUP 2: Legacy Flat String Fallback Tolerance ---');

const legacySpecies = {
  name: "Legacy Vulpin",
  formalTitle: "Vulpin Scout",
  parentLineage: "Aulurans",
  summary: "Vulpine scout with keen senses.",
  socialStigma: "Xeno (-1)",
  homeworld: "Sylvan Prime",
  techLevel: "3",
  metaLevel: "1+",
  prerequisites: "20 BP",
  type: "Humanoid (Canine/Vulpine)",
  size: "Medium (5ft)",
  movement: "35ft Groundspeed",
  traits: "Low Light Vision, Scent",
  attributeModifiers: "+1 Agi, +1 Wis",
  skillModifiers: "+5 Stealth, +5 Survival",
  bonusFeatures: "Sharp Senses",
  recommendedFeatures: "Night Hunter",
  disciplinesAndSpecialAbilities: "Telepathy 1",
  fullLore: "A proud race of forest scouts.",
  profileAndVisualSemiotics: "Earthy tones, leaf motifs."
};

const adaptedLegacySpecies = adaptSparkItemToFirestore('species', legacySpecies);
assert(adaptedLegacySpecies.name === "Legacy Vulpin", "Legacy species name preserved");
assert(adaptedLegacySpecies.costs.bp === 20, "Legacy BP parsed as numeric costs.bp (20)");
assert(adaptedLegacySpecies.parent_species === "Aulurans", "Legacy parentLineage mapped to parent_species");
assert(adaptedLegacySpecies.modifiers.length >= 4, "Legacy modifier strings parsed into modifier objects");
assert(adaptedLegacySpecies.modifiers.some(m => m.target.toLowerCase().includes('agi')), "Agility modifier extracted");

const legacyWeapon = {
  name: "Old Chem-Laser",
  description: "Archaic chemical laser rifle.",
  techLevel: "3",
  metaLevel: "0",
  cost: "600 Credits",
  classification: "Ranged (Energy)",
  damage: "2d10",
  damageType: "Thermal",
  penetration: "4",
  componentSlots: "3",
  gameMechanics: "Fires burst pulses."
};

const adaptedLegacyWeapon = adaptSparkItemToFirestore('weaponry', legacyWeapon);
assert(adaptedLegacyWeapon.costs.credits === 600, "Legacy cost '600 Credits' parsed into costs.credits");
assert(adaptedLegacyWeapon.damage === "2d10", "Legacy damage preserved");
assert(adaptedLegacyWeapon.ap === 4, "Legacy penetration parsed into numeric ap (4)");
assert(adaptedLegacyWeapon.sockets.max === 3, "Legacy componentSlots parsed into sockets.max (3)");

// 3. Test Persona Folio Asset Compatibility
console.log('\n--- TEST GROUP 3: Persona Folio Asset Compatibility ---');
const testArmor = OMNICORTEX_DATASETS.find(d => d.key === 'armoring').sampleItem;
const adaptedArmor = adaptSparkItemToFirestore('armoring', testArmor);
assert(typeof adaptedArmor.dr === 'number' || adaptedArmor.modifiers.some(m => m.target.includes('Resist')), "Armor provides measurable DR or resistance");
assert(typeof adaptedArmor.max_dex === 'number', "Armor specifies numeric max_dex");

console.log('\n===============================================================');
console.log('TEST RESULTS: ' + passedTests + ' Passed, ' + failedTests + ' Failed');
console.log('===============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
