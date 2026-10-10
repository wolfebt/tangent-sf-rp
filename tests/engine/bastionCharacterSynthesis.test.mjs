/**
 * @file bastionCharacterSynthesis.test.mjs
 * @description Unit tests for BASTION Character Creation grounded in the 5 Canonical Database Pillars:
 * Archetype -> Species -> Faction -> Origin -> Occupation -> Skills, Features & Property.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findClosestArchetype,
  getArchetypeRecommendations,
  selectPillarSpecies,
  getSpeciesRecommendations,
  selectPillarFaction,
  getFactionRecommendations,
  selectPillarOrigin,
  getOriginRecommendations,
  selectPillarOccupation,
  getOccupationRecommendations,
  calculateRulesLedger,
  derivePillarAttributes,
  derivePillarSkills,
  derivePillarTraitsAndFeatures,
  derivePillarProperty,
  derivePillarNarrative,
  synthesizeCharacterWithBastion
} from '../../src/services/bastionCharacterEngine.js';
import { DEFAULT_ARCHETYPES } from '../../src/data/archetypesData.js';
import { DEFAULT_SPECIES } from '../../src/data/speciesData.js';
import { DEFAULT_FACTIONS } from '../../src/data/factionsData.js';
import { DEFAULT_ORIGINS } from '../../src/data/originsData.js';
import { DEFAULT_OCCUPATIONS } from '../../src/data/occupationsData.js';
import { ALL_CANONICAL_SKILLS } from '../../src/data/skillsData.js';
import { DEFAULT_FEATURES } from '../../src/data/featuresData.js';
import { ALL_CANONICAL_TRAITS } from '../../src/data/speciesTraitsData.js';
import { DEFAULT_WEAPONRY } from '../../src/data/weaponryData.js';
import { DEFAULT_ARMORING } from '../../src/data/armoringData.js';
import { characterSchema } from '../../src/components/Folio/schema.js';

test('BASTION Character Synthesis: Closest Archetype Matching', () => {
  // Test 1: Concept matches to canonical 100 Archetypes
  const sniper = findClosestArchetype('covert stealth sniper with long rifle');
  assert.equal(sniper.name, 'The Ghost', 'Expected stealth sniper concept to match The Ghost');

  const armorer = findClosestArchetype('master blacksmith crafting high-tech armor');
  assert.equal(armorer.name, 'The Armorer', 'Expected armorer concept to match The Armorer');

  const medic = findClosestArchetype('trauma surgeon field medic');
  assert.equal(medic.name, 'The Field Medic', 'Expected medic concept to match The Field Medic');

  const operative = findClosestArchetype('Syndicate covert operative agent');
  assert.equal(operative.name, 'The Operative', 'Expected covert operative to match The Operative');

  // Verify chosen archetype is from database
  assert(DEFAULT_ARCHETYPES.some(a => a.name === sniper.name));
  assert(DEFAULT_ARCHETYPES.some(a => a.name === armorer.name));
});

test('BASTION Character Synthesis: Pillar Sequence (Archetype -> Species -> Faction -> Origin -> Occupation)', () => {
  const prompt = 'Syndicate covert operative agent';
  const archetype = findClosestArchetype(prompt);
  assert.equal(archetype.name, 'The Operative');

  const species = selectPillarSpecies(archetype, prompt);
  assert(DEFAULT_SPECIES.some(s => s.name === species.name), 'Species must be from canonical database');

  const faction = selectPillarFaction(archetype, prompt);
  assert(DEFAULT_FACTIONS.some(f => f.name === faction.name), 'Faction must be from canonical database');
  assert(faction.name.toLowerCase().includes('syndicat'), 'Expected syndicate faction match');

  const origin = selectPillarOrigin(archetype, prompt);
  assert(DEFAULT_ORIGINS.some(o => o.name === origin.name), 'Origin must be from canonical database');

  const occupation = selectPillarOccupation(archetype, prompt);
  assert(DEFAULT_OCCUPATIONS.some(oc => oc.name === occupation.name), 'Occupation must be from canonical database');
});

test('BASTION Character Synthesis: Zero Fabricated Content in All 5 Pillars', () => {
  const result = synthesizeCharacterWithBastion({
    prompt: 'Elven diplomat representing the Combine negotiating planetary peace'
  });

  assert.equal(result.success, true);
  const { pillars } = result;

  // Pillar 1: Archetype exists in database
  assert(DEFAULT_ARCHETYPES.some(a => a.name === pillars.archetype.name), 'Archetype must exist in DEFAULT_ARCHETYPES');
  // Pillar 2: Species exists in database
  assert(DEFAULT_SPECIES.some(s => s.name === pillars.species.name), 'Species must exist in DEFAULT_SPECIES');
  // Pillar 3: Faction exists in database
  assert(DEFAULT_FACTIONS.some(f => f.name === pillars.faction.name), 'Faction must exist in DEFAULT_FACTIONS');
  // Pillar 4: Origin exists in database
  assert(DEFAULT_ORIGINS.some(o => o.name === pillars.origin.name), 'Origin must exist in DEFAULT_ORIGINS');
  // Pillar 5: Occupation exists in database
  assert(DEFAULT_OCCUPATIONS.some(oc => oc.name === pillars.occupation.name), 'Occupation must exist in DEFAULT_OCCUPATIONS');
});

test('BASTION Character Synthesis: Skills Grounded in 3 Background Pools & Canonical List', () => {
  const result = synthesizeCharacterWithBastion({
    prompt: 'heavy assault shock trooper veteran'
  });

  const char = result.character;
  assert(Array.isArray(char.skills), 'Character skills must be an array');
  assert(char.skills.length >= 6, 'Should have multiple skills allocated');

  // Verify all skills exist in canonical skills list
  const canonSkillNames = new Set(ALL_CANONICAL_SKILLS.map(s => s.name.toLowerCase()));
  for (const sk of char.skills) {
    assert(
      canonSkillNames.has(sk.name.toLowerCase()) || ALL_CANONICAL_SKILLS.some(c => c.name.toLowerCase().includes(sk.name.toLowerCase())),
      `Skill "${sk.name}" must exist in canonical skills database`
    );
    assert(sk.rank >= 1 && sk.rank <= 11, `Skill ${sk.name} rank ${sk.rank} must respect creation ceiling <= 11`);
  }

  // Verify 3 background pools are recorded
  assert(char.factionAllocations && typeof char.factionAllocations.skills === 'object');
  assert(char.originAllocations && typeof char.originAllocations.skills === 'object');
  assert(char.occuAllocations && typeof char.occuAllocations.skills === 'object');
});

test('BASTION Character Synthesis: Traits & Features Grounded in Database', () => {
  const result = synthesizeCharacterWithBastion({
    prompt: 'Alterian arcane researcher and scholar'
  });

  const char = result.character;
  assert(Array.isArray(char.traits) && char.traits.length > 0, 'Should have canonical traits');
  assert(Array.isArray(char.features) && char.features.length > 0, 'Should have canonical features');

  // Verify traits have required schema fields and sources
  for (const trait of char.traits) {
    assert(trait.name && trait.name.trim().length > 0);
    assert(['species', 'origin', 'occupation', 'general'].includes(trait.source));
  }

  // Verify features have required schema fields and sources
  for (const feat of char.features) {
    assert(feat.name && feat.name.trim().length > 0);
    assert(['archetype', 'faction', 'occupation', 'general'].includes(feat.source));
  }
});

test('BASTION Character Synthesis: Property (Weapons, Armor, Gear) Grounded in Armory Datasets', () => {
  const result = synthesizeCharacterWithBastion({
    prompt: 'frontline tank soldier with heavy plate and shotgun'
  });

  const char = result.character;
  assert(Array.isArray(char.weapons) && char.weapons.length > 0, 'Should have starting weapons');
  assert(Array.isArray(char.armor) && char.armor.length > 0, 'Should have starting armor');
  assert(Array.isArray(char.gear) && char.gear.length > 0, 'Should have tactical gear');

  // Verify weapons match DEFAULT_WEAPONRY
  for (const wpn of char.weapons) {
    assert(
      DEFAULT_WEAPONRY.some(w => w.name.toLowerCase() === wpn.name.toLowerCase() || w.id === wpn.id),
      `Weapon "${wpn.name}" must exist in DEFAULT_WEAPONRY`
    );
  }

  // Verify armor matches DEFAULT_ARMORING
  for (const arm of char.armor) {
    assert(
      DEFAULT_ARMORING.some(a => a.name.toLowerCase() === arm.name.toLowerCase() || a.id === arm.id),
      `Armor "${arm.name}" must exist in DEFAULT_ARMORING`
    );
  }
});

test('BASTION Character Synthesis: Folio Schema Compliance & Attribute Math', () => {
  const result = synthesizeCharacterWithBastion({
    prompt: 'Agile cyber-infiltrator netrunner'
  });

  const char = result.character;

  // Verify primary to sub-attribute derivation: Base = 2 + (Primary * 2)
  const mightExpected = (char['attr-strength'] * 2) + 2;
  assert.equal(char['attr-might'], mightExpected, 'Might must equal 2 + (STR * 2)');

  const reflexExpected = (char['attr-agility'] * 2) + 2;
  assert.equal(char['attr-reflex'], reflexExpected, 'Reflex must equal 2 + (AGI * 2)');

  // Verify complete character passes characterSchema validation
  assert.doesNotThrow(() => {
    characterSchema.parse(char);
  }, 'Synthesized character payload must strictly validate against characterSchema');
});

test('BASTION Character Synthesis: Guided Creator Modal Compatibility', () => {
  const result = synthesizeCharacterWithBastion({
    prompt: 'covert stealth sniper with rail rifle',
    preferredArchetype: 'The Ghost'
  });

  assert.equal(result.success, true);
  assert(result.rawAttributes, 'Must return rawAttributes for Guided Creator attributes step');
  assert(typeof result.rawAttributes['attr-strength'] === 'number');
  assert(typeof result.rawAttributes['attr-agility'] === 'number');

  // Verify enriched pool allocations have traits and features arrays
  const char = result.character;
  assert(Array.isArray(char.originAllocations.traits), 'originAllocations must have traits array');
  assert(Array.isArray(char.factionAllocations.features), 'factionAllocations must have features array');
  assert(Array.isArray(char.occuAllocations.traits), 'occuAllocations must have traits array');
  assert(Array.isArray(char.generalAllocations.features), 'generalAllocations must have features array');

  // Verify pillar objects for Guided Creator selection
  assert.equal(result.pillars.archetype.name, 'The Ghost');
  assert(result.pillars.species && result.pillars.species.name);
  assert(result.pillars.faction && result.pillars.faction.name);
  assert(result.pillars.origin && result.pillars.origin.name);
  assert(result.pillars.occupation && result.pillars.occupation.name);
});

test('BASTION Staged Workflow: Multi-Candidate Archetype Recommendations with Rationale', () => {
  const prompt = 'stealth sniper operative';
  const recs = getArchetypeRecommendations(prompt, DEFAULT_ARCHETYPES, 4);

  assert.equal(recs.length, 4, 'Should return 4 top archetype recommendations');
  assert(recs[0].isTopPick, 'First recommendation should be top pick');
  assert(recs[0].score >= recs[1].score, 'Recommendations must be sorted descending by score');
  assert(recs[0].archetype && recs[0].archetype.name, 'Recommendation must include canonical archetype');
  assert(typeof recs[0].rationale === 'string' && recs[0].rationale.length > 0, 'Must provide user rationale');

  // Verify all candidates are distinct and canonical
  const seen = new Set();
  recs.forEach(r => {
    assert(!seen.has(r.archetype.name), 'Archetypes should be unique');
    seen.add(r.archetype.name);
    assert(DEFAULT_ARCHETYPES.some(a => a.name === r.archetype.name), 'Must be canonical');
  });
});

test('BASTION Staged Workflow: Species Recommendations Synergized with Archetype', () => {
  const sniper = findClosestArchetype('stealth sniper');
  const speciesRecs = getSpeciesRecommendations(sniper, 'feline sniper', DEFAULT_SPECIES, 3);

  assert.equal(speciesRecs.length, 3);
  assert(speciesRecs[0].isTopPick);
  assert(speciesRecs[0].species.name.toLowerCase().includes('auluran') || speciesRecs[0].species.name.includes('Human'));
  assert(typeof speciesRecs[0].rationale === 'string');
  assert(typeof speciesRecs[0].attributeModifiersSummary === 'string');
});

test('BASTION Staged Workflow: Faction, Origin & Occupation Staged Candidates', () => {
  const operativeArch = findClosestArchetype('Syndicate corporate infiltrator');

  const facRecs = getFactionRecommendations(operativeArch, 'Syndicate corporate infiltrator', DEFAULT_FACTIONS, 3);
  assert.equal(facRecs.length, 3);
  assert(facRecs[0].faction.name.toLowerCase().includes('syndicat'));
  assert(Array.isArray(facRecs[0].skillPackage));

  const origRecs = getOriginRecommendations(operativeArch, 'high-tech city', DEFAULT_ORIGINS, 3);
  assert.equal(origRecs.length, 3);
  assert(origRecs[0].origin && origRecs[0].origin.name);

  const occuRecs = getOccupationRecommendations(operativeArch, 'covert agent', DEFAULT_OCCUPATIONS, 3);
  assert.equal(occuRecs.length, 3);
  assert(occuRecs[0].occupation && occuRecs[0].occupation.name);
});

test('BASTION Rules Ledger: 150 BP Economy, Raw Ceiling (Max +4), and Foundation Skill Packages', () => {
  const arch = DEFAULT_ARCHETYPES.find(a => a.name === 'The Vanguard') || DEFAULT_ARCHETYPES[0];
  const sp = DEFAULT_SPECIES.find(s => s.name === 'Human (Base)') || DEFAULT_SPECIES[0];
  const fac = DEFAULT_FACTIONS[0];
  const orig = DEFAULT_ORIGINS[0];
  const occu = DEFAULT_OCCUPATIONS[0];

  const ledger = calculateRulesLedger({
    archetype: arch,
    species: sp,
    faction: fac,
    origin: orig,
    occupation: occu,
    techLevel: 3
  });

  assert.equal(ledger.startingBP, 150);
  assert(ledger.bpSpent > 0, 'Should track spent BP');
  assert(ledger.bpRemaining >= 0, 'Remaining BP must be non-negative for standard allocation');
  assert.equal(ledger.isRulesCompliant, true, 'Default synthesis must be rules compliant');

  // Verify raw attributes do not exceed 4
  for (const [attrKey, val] of Object.entries(ledger.rawAttributes)) {
    assert(val <= 4, `${attrKey} must not exceed 4 at creation`);
  }

  // Verify foundation skill pools (20 + 20 + 20 = 60 free ranks)
  assert.equal(ledger.foundationPackages.totalSkillRanks, 60);
  assert.equal(ledger.foundationPackages.factionPool.allocatedPoints, 20);
  assert.equal(ledger.foundationPackages.originPool.allocatedPoints, 20);
  assert.equal(ledger.foundationPackages.occupationPool.allocatedPoints, 20);

  // Test budget violation detection
  const overspentLedger = calculateRulesLedger({
    archetype: arch,
    species: sp,
    faction: fac,
    origin: orig,
    occupation: occu,
    techLevel: 3,
    rawAttributes: {
      'attr-strength': 4,
      'attr-agility': 4,
      'attr-stamina': 4,
      'attr-intellect': 4,
      'attr-wisdom': 4,
      'attr-charisma': 4 // 24 points * 5 = 120 BP + ...
    }
  });
  // If raw attribute exceeds +4, must report violation
  const illegalAttrLedger = calculateRulesLedger({
    archetype: arch,
    species: sp,
    faction: fac,
    origin: orig,
    occupation: occu,
    techLevel: 3,
    rawAttributes: {
      'attr-strength': 5 // Exceeds creation ceiling of 4
    }
  });
  assert.equal(illegalAttrLedger.isRulesCompliant, false);
  assert(illegalAttrLedger.validationErrors.some(e => e.includes('exceeds creation ceiling of +4')));
});

test('BASTION Staged Workflow: User-in-the-loop Customized Assembly Passes Schema', () => {
  // Simulating user picking specific canonical choices at each stage
  const userArch = DEFAULT_ARCHETYPES.find(a => a.name === 'The Ghost') || DEFAULT_ARCHETYPES[0];
  const userSpecies = DEFAULT_SPECIES.find(s => s.name?.includes('Spacer')) || DEFAULT_SPECIES[0];
  const userFaction = DEFAULT_FACTIONS.find(f => f.name?.includes('Syndicat')) || DEFAULT_FACTIONS[0];
  const userOrigin = DEFAULT_ORIGINS.find(o => o.name === 'Spacer') || DEFAULT_ORIGINS[0];
  const userOccupation = DEFAULT_OCCUPATIONS.find(oc => oc.name === 'Agent') || DEFAULT_OCCUPATIONS[0];

  const stagedResult = synthesizeCharacterWithBastion({
    prompt: 'covert void assassin',
    preferredArchetype: userArch.name,
    preferredSpecies: userSpecies.name,
    preferredFaction: userFaction.name,
    preferredOrigin: userOrigin.name,
    preferredOccupation: userOccupation.name,
    techLevel: 4,
    rawAttributes: {
      'attr-strength': 0,
      'attr-agility': 3,
      'attr-stamina': 1,
      'attr-intellect': 2,
      'attr-wisdom': 1,
      'attr-charisma': 0
    }
  });

  assert.equal(stagedResult.success, true);
  assert.equal(stagedResult.pillars.archetype.name, userArch.name);
  assert.equal(stagedResult.pillars.species.name, userSpecies.name);
  assert.equal(stagedResult.pillars.faction.name, userFaction.name);
  assert.equal(stagedResult.pillars.origin.name, userOrigin.name);
  assert.equal(stagedResult.pillars.occupation.name, userOccupation.name);
  assert(stagedResult.rulesLedger && stagedResult.rulesLedger.isRulesCompliant);

  // Folio schema validation
  assert.doesNotThrow(() => {
    characterSchema.parse(stagedResult.character);
  });
});

test('BASTION Character Synthesis: Species Guidance Directives (Factions, Origins, Occupations, Skills, Features, Keywords)', () => {
  const targetFaction = DEFAULT_FACTIONS[0]?.name || 'Faction';
  const targetOrigin = DEFAULT_ORIGINS[0]?.name || 'Origin';
  const targetOccupation = DEFAULT_OCCUPATIONS[0]?.name || 'Occupation';

  const mockSpecies = {
    id: 'species-guidance-test',
    name: 'Sylvathi Pathfinder',
    recommended_factions: [targetFaction],
    recommended_origins: [targetOrigin],
    recommended_occupations: [targetOccupation],
    recommended_skills: ['Survival', 'Acrobatics'],
    recommended_features: ['Night Sight'],
    keywords: 'scout, stealth'
  };

  const facRecs = getFactionRecommendations(null, '', DEFAULT_FACTIONS, 5, mockSpecies);
  assert.ok(facRecs.length > 0);
  const matchedFaction = facRecs.find(r => r.name === targetFaction);
  assert.ok(matchedFaction, 'Target faction should be present');
  assert.ok(matchedFaction.rationale.includes('Sylvathi Pathfinder'), 'Rationale should mention species');

  const origRecs = getOriginRecommendations(null, '', DEFAULT_ORIGINS, 5, mockSpecies);
  assert.ok(origRecs.length > 0);
  const matchedOrigin = origRecs.find(r => r.name === targetOrigin);
  assert.ok(matchedOrigin, 'Target origin should be present');
  assert.ok(matchedOrigin.rationale.includes('Sylvathi Pathfinder'), 'Rationale should mention species');

  const occuRecs = getOccupationRecommendations(null, '', DEFAULT_OCCUPATIONS, 5, mockSpecies);
  assert.ok(occuRecs.length > 0);
  const matchedOccupation = occuRecs.find(r => r.name === targetOccupation);
  assert.ok(matchedOccupation, 'Target occupation should be present');
  assert.ok(matchedOccupation.rationale.includes('Sylvathi Pathfinder'), 'Rationale should mention species');

  // Verify skills derivation incorporates species recommended_skills
  const skillsResult = derivePillarSkills({ species: mockSpecies });
  assert.ok(skillsResult.speciesAllocations.skills['Survival'] >= 2, 'Survival should be allocated from recommended_skills');
  assert.ok(skillsResult.speciesAllocations.skills['Acrobatics'] >= 2, 'Acrobatics should be allocated from recommended_skills');

  // Verify traits/features derivation incorporates species recommended_features
  const traitsResult = derivePillarTraitsAndFeatures({ species: mockSpecies });
  const matchedFeature = traitsResult.features.find(f => f.name.toLowerCase() === 'night sight');
  assert.ok(matchedFeature, 'Night Sight should be granted from recommended_features');
  assert.strictEqual(matchedFeature.source, 'species');
});

test('BASTION Character Synthesis: Species Railguard Negative Keywords Penalization', () => {
  const targetFaction = DEFAULT_FACTIONS[0]?.name || 'Faction';
  const targetOrigin = DEFAULT_ORIGINS[0]?.name || 'Origin';
  const targetOccupation = DEFAULT_OCCUPATIONS[0]?.name || 'Occupation';

  const mockSpeciesWithRailguards = {
    id: 'species-railguard-test',
    name: 'Glacial Specter',
    negative_keywords: `${targetFaction}, ${targetOrigin}, ${targetOccupation}`
  };

  const facRecs = getFactionRecommendations(null, '', DEFAULT_FACTIONS, DEFAULT_FACTIONS.length, mockSpeciesWithRailguards);
  const matchedFaction = facRecs.find(r => r.name === targetFaction);
  assert.ok(matchedFaction, 'Target faction should be in recommendations list');
  assert.ok(matchedFaction.rationale.includes('Railguard penalty'), 'Faction rationale should reflect railguard penalty');
  assert.ok(matchedFaction.score < 0, 'Faction score should be penalized below 0');

  const origRecs = getOriginRecommendations(null, '', DEFAULT_ORIGINS, DEFAULT_ORIGINS.length, mockSpeciesWithRailguards);
  const matchedOrigin = origRecs.find(r => r.name === targetOrigin);
  assert.ok(matchedOrigin, 'Target origin should be in recommendations list');
  assert.ok(matchedOrigin.rationale.includes('Railguard penalty'), 'Origin rationale should reflect railguard penalty');
  assert.ok(matchedOrigin.score < 0, 'Origin score should be penalized below 0');

  const occuRecs = getOccupationRecommendations(null, '', DEFAULT_OCCUPATIONS, DEFAULT_OCCUPATIONS.length, mockSpeciesWithRailguards);
  const matchedOccupation = occuRecs.find(r => r.name === targetOccupation);
  assert.ok(matchedOccupation, 'Target occupation should be in recommendations list');
  assert.ok(matchedOccupation.rationale.includes('Railguard penalty'), 'Occupation rationale should reflect railguard penalty');
  assert.ok(matchedOccupation.score < 0, 'Occupation score should be penalized below 0');
});

test('BASTION Character Synthesis: AI Reference Keywords Add Weight and Negatives Reduce Weight', () => {
  // 1. Test species selection weight adjustments
  const positiveSpecies = {
    id: 'spec-pos',
    name: 'Aeromancer Sylph',
    keywords: 'aerial, glider, tempest'
  };
  const negativeSpecies = {
    id: 'spec-neg',
    name: 'Subterranean Mole',
    negative_keywords: 'aerial, glider, sky'
  };
  const neutralSpecies = {
    id: 'spec-neu',
    name: 'Standard Human'
  };

  const speciesList = [neutralSpecies, positiveSpecies, negativeSpecies];
  const recs = getSpeciesRecommendations(null, 'aerial glider scout', speciesList, 3);
  
  const posRec = recs.find(r => r.name === 'Aeromancer Sylph');
  const negRec = recs.find(r => r.name === 'Subterranean Mole');
  const neuRec = recs.find(r => r.name === 'Standard Human');

  assert.ok(posRec.score > neuRec.score, 'Positive keywords must add weight to score');
  assert.ok(negRec.score < neuRec.score, 'Negative keywords must reduce weight from score');
  assert.ok(posRec.rationale.includes('+weight'), 'Positive keyword match should indicate weight addition in rationale');
  assert.ok(negRec.rationale.includes('-weight'), 'Negative keyword match should indicate weight reduction in rationale');

  // 2. Test narrative export structured aiDirectives
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Ace' },
    species: {
      name: 'Aeromancer Sylph',
      keywords: 'aerial, glider, tempest',
      negative_keywords: 'heavy armor, aquatic'
    },
    faction: { name: 'Free Trade' },
    origin: { name: 'High Orbit' },
    occupation: { name: 'Pilot' }
  });

  assert.ok(narrative.aiDirectives, 'Narrative payload must contain structured aiDirectives');
  assert.deepStrictEqual(narrative.aiDirectives.thematicWeights, ['aerial', 'glider', 'tempest']);
  assert.deepStrictEqual(narrative.aiDirectives.negativeRailguards, ['heavy armor', 'aquatic']);
});

test('BASTION Character Synthesis: Faction Architect Guidance (Species, Origins, Occupations, Skills, Features)', () => {
  const mockFaction = {
    id: 'fac-guidance-test',
    name: 'Aetheric Union',
    recommended_species: ['Sylvathi', 'Auluran'],
    recommended_origins: ['Deep Rim Outpost'],
    recommended_occupations: ['Pathfinder'],
    recommended_skills: ['Acrobatics', 'Survival'],
    recommended_features: ['Fleet of Foot']
  };

  // 1. Verify species recommendations elevated by faction's recommended_species
  const testSpeciesList = [
    { id: 'sp-1', name: 'Sylvathi' },
    { id: 'sp-2', name: 'Human' }
  ];
  const spRecs = getSpeciesRecommendations(null, '', testSpeciesList, 2, mockFaction);
  const matchedSpecies = spRecs.find(r => r.name === 'Sylvathi');
  assert.ok(matchedSpecies, 'Sylvathi should be recommended');
  assert.ok(matchedSpecies.score > 0, 'Score should be elevated');
  assert.ok(matchedSpecies.rationale.includes('Aetheric Union'), 'Rationale should mention faction');

  // 2. Verify origin recommendations elevated by faction's recommended_origins
  const testOriginsList = [
    { id: 'or-1', name: 'Deep Rim Outpost' },
    { id: 'or-2', name: 'Metropolitan Core' }
  ];
  const origRecs = getOriginRecommendations(null, '', testOriginsList, 2, null, mockFaction);
  const matchedOrigin = origRecs.find(r => r.name === 'Deep Rim Outpost');
  assert.ok(matchedOrigin, 'Deep Rim Outpost should be recommended');
  assert.ok(matchedOrigin.score > 0, 'Score should be elevated');
  assert.ok(matchedOrigin.rationale.includes('Aetheric Union'), 'Rationale should mention faction');

  // 3. Verify occupation recommendations elevated by faction's recommended_occupations
  const testOccuList = [
    { id: 'oc-1', name: 'Pathfinder' },
    { id: 'oc-2', name: 'Administrator' }
  ];
  const occuRecs = getOccupationRecommendations(null, '', testOccuList, 2, null, mockFaction);
  const matchedOccu = occuRecs.find(r => r.name === 'Pathfinder');
  assert.ok(matchedOccu, 'Pathfinder should be recommended');
  assert.ok(matchedOccu.score > 0, 'Score should be elevated');
  assert.ok(matchedOccu.rationale.includes('Aetheric Union'), 'Rationale should mention faction');

  // 4. Verify skills derivation incorporates faction recommended_skills
  const skillsResult = derivePillarSkills({ faction: mockFaction });
  assert.ok(skillsResult.factionAllocations.skills['Acrobatics'] >= 2, 'Acrobatics should be allocated from faction recommended_skills');
  assert.ok(skillsResult.factionAllocations.skills['Survival'] >= 2, 'Survival should be allocated from faction recommended_skills');

  // 5. Verify traits/features derivation incorporates faction recommended_features
  const traitsResult = derivePillarTraitsAndFeatures({ faction: mockFaction });
  const matchedFeature = traitsResult.features.find(f => f.name.toLowerCase() === 'fleet of foot');
  assert.ok(matchedFeature, 'Fleet of Foot should be granted from faction recommended_features');
  assert.strictEqual(matchedFeature.source, 'faction');
});

test('BASTION Character Synthesis: Faction Railguard Negative Keywords & Directives Weight', () => {
  // 1. Faction selection weight adjustments based on keywords and railguards
  const positiveFaction = {
    id: 'fac-pos',
    name: 'Cyber Vanguard',
    keywords: 'cybernetic, enhanced, augmented'
  };
  const negativeFaction = {
    id: 'fac-neg',
    name: 'Pureblood Traditionalists',
    negative_keywords: 'cybernetic, augmented'
  };
  const neutralFaction = {
    id: 'fac-neu',
    name: 'Neutral Trade League'
  };

  const factionList = [neutralFaction, positiveFaction, negativeFaction];
  const recs = getFactionRecommendations(null, 'cybernetic augmented operative', factionList, 3);

  const posRec = recs.find(r => r.name === 'Cyber Vanguard');
  const negRec = recs.find(r => r.name === 'Pureblood Traditionalists');
  const neuRec = recs.find(r => r.name === 'Neutral Trade League');

  assert.ok(posRec.score > neuRec.score, 'Positive faction keywords must add weight to score');
  assert.ok(negRec.score < neuRec.score, 'Negative faction railguard keywords must reduce score');
  assert.ok(posRec.rationale.includes('+weight'), 'Positive keyword match should indicate weight addition in rationale');
  assert.ok(negRec.rationale.includes('-weight'), 'Negative keyword match should indicate weight reduction in rationale');

  // 2. Test combined narrative export structured aiDirectives containing both species and faction directives
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Ace' },
    species: {
      name: 'Aeromancer Sylph',
      keywords: 'aerial, glider',
      negative_keywords: 'heavy armor'
    },
    faction: {
      name: 'Cyber Vanguard',
      keywords: 'cybernetic, enhanced',
      negative_keywords: 'primitive'
    },
    origin: { name: 'High Orbit' },
    occupation: { name: 'Pilot' }
  });

  assert.ok(narrative.aiDirectives, 'Narrative payload must contain structured aiDirectives');
  assert.deepStrictEqual(narrative.aiDirectives.thematicWeights, ['aerial', 'glider', 'cybernetic', 'enhanced']);
  assert.deepStrictEqual(narrative.aiDirectives.negativeRailguards, ['heavy armor', 'primitive']);
});

test('BASTION Character Synthesis: Origin Architect Guidance (Species, Factions, Occupations, Skills, Features)', () => {
  const mockOrigin = {
    id: 'orig-guidance-test',
    name: 'Subterranean Hive',
    recommended_species: ['Gorgon', 'Human (Base)'],
    recommended_factions: ['Mining Guild'],
    recommended_occupations: ['Miner', 'Heavy Engineer'],
    recommended_skills: ['Athletics', 'Alertness'],
    recommended_features: ['Tremorsense']
  };

  // 1. Verify species recommendations elevated by origin's recommended_species
  const testSpeciesList = [
    { id: 'sp-1', name: 'Gorgon' },
    { id: 'sp-2', name: 'Sylvathi' }
  ];
  const spRecs = getSpeciesRecommendations(null, '', testSpeciesList, 2, null, mockOrigin);
  const matchedSpecies = spRecs.find(r => r.name === 'Gorgon');
  assert.ok(matchedSpecies, 'Gorgon should be recommended');
  assert.ok(matchedSpecies.score > 0, 'Score should be elevated');
  assert.ok(matchedSpecies.rationale.includes('Subterranean Hive'), 'Rationale should mention origin');

  // 2. Verify faction recommendations elevated by origin's recommended_factions
  const testFactionsList = [
    { id: 'fac-1', name: 'Mining Guild' },
    { id: 'fac-2', name: 'High Arcane Order' }
  ];
  const facRecs = getFactionRecommendations(null, '', testFactionsList, 2, null, mockOrigin);
  const matchedFaction = facRecs.find(r => r.name === 'Mining Guild');
  assert.ok(matchedFaction, 'Mining Guild should be recommended');
  assert.ok(matchedFaction.score > 0, 'Score should be elevated');
  assert.ok(matchedFaction.rationale.includes('Subterranean Hive'), 'Rationale should mention origin');

  // 3. Verify occupation recommendations elevated by origin's recommended_occupations
  const testOccuList = [
    { id: 'oc-1', name: 'Miner' },
    { id: 'oc-2', name: 'Academic' }
  ];
  const occuRecs = getOccupationRecommendations(null, '', testOccuList, 2, null, null, mockOrigin);
  const matchedOccu = occuRecs.find(r => r.name === 'Miner');
  assert.ok(matchedOccu, 'Miner should be recommended');
  assert.ok(matchedOccu.score > 0, 'Score should be elevated');
  assert.ok(matchedOccu.rationale.includes('Subterranean Hive'), 'Rationale should mention origin');

  // 4. Verify skills derivation incorporates origin recommended_skills
  const skillsResult = derivePillarSkills({ origin: mockOrigin });
  assert.ok(skillsResult.originAllocations.skills['Athletics'] >= 2, 'Athletics should be allocated from origin recommended_skills');
  assert.ok(skillsResult.originAllocations.skills['Alertness'] >= 2, 'Alertness should be allocated from origin recommended_skills');

  // 5. Verify traits/features derivation incorporates origin recommended_features
  const traitsResult = derivePillarTraitsAndFeatures({ origin: mockOrigin });
  const matchedFeature = traitsResult.features.find(f => f.name.toLowerCase() === 'tremorsense');
  assert.ok(matchedFeature, 'Tremorsense should be granted from origin recommended_features');
  assert.strictEqual(matchedFeature.source, 'origin');
});

test('BASTION Character Synthesis: Origin Railguard Negative Keywords & Directives Weight', () => {
  // 1. Origin selection weight adjustments based on keywords and railguards
  const positiveOrigin = {
    id: 'orig-pos',
    name: 'Glacial Permafrost',
    keywords: 'cryo, glacial, tundra'
  };
  const negativeOrigin = {
    id: 'orig-neg',
    name: 'Volcanic Caldera',
    negative_keywords: 'cryo, glacial, tundra'
  };
  const neutralOrigin = {
    id: 'orig-neu',
    name: 'Temperate Plains'
  };

  const originList = [neutralOrigin, positiveOrigin, negativeOrigin];
  const recs = getOriginRecommendations(null, 'cryo tundra specialist', originList, 3);

  const posRec = recs.find(r => r.name === 'Glacial Permafrost');
  const negRec = recs.find(r => r.name === 'Volcanic Caldera');
  const neuRec = recs.find(r => r.name === 'Temperate Plains');

  assert.ok(posRec.score > neuRec.score, 'Positive origin keywords must add weight to score');
  assert.ok(negRec.score < neuRec.score, 'Negative origin railguard keywords must reduce score');
  assert.ok(posRec.rationale.includes('+weight'), 'Positive keyword match should indicate weight addition in rationale');
  assert.ok(negRec.rationale.includes('-weight'), 'Negative keyword match should indicate weight reduction in rationale');

  // 2. Test combined narrative export structured aiDirectives containing species, faction, and origin directives
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Ace' },
    species: {
      name: 'Aeromancer Sylph',
      keywords: 'aerial, glider',
      negative_keywords: 'heavy armor'
    },
    faction: {
      name: 'Cyber Vanguard',
      keywords: 'cybernetic, enhanced',
      negative_keywords: 'primitive'
    },
    origin: {
      name: 'Glacial Permafrost',
      keywords: 'cryo, arctic',
      negative_keywords: 'aquatic'
    },
    occupation: { name: 'Pilot' }
  });

  assert.ok(narrative.aiDirectives, 'Narrative payload must contain structured aiDirectives');
  assert.deepStrictEqual(narrative.aiDirectives.thematicWeights, ['aerial', 'glider', 'cybernetic', 'enhanced', 'cryo', 'arctic']);
  assert.deepStrictEqual(narrative.aiDirectives.negativeRailguards, ['heavy armor', 'primitive', 'aquatic']);
});

test('BASTION Character Synthesis: Occupation Architect Guidance (Species, Factions, Origins, Skills, Features)', () => {
  const mockOccupation = {
    id: 'occu-guidance-test',
    name: 'Covert Infiltrator',
    recommended_species: ['Dar', 'Human (Base)'],
    recommended_factions: ['Shadow Syndicate'],
    recommended_origins: ['Deep Void & Station'],
    recommended_skills: ['Stealth', 'Computers'],
    recommended_features: ['Ghost Step']
  };

  // 1. Verify species recommendations elevated by occupation's recommended_species
  const testSpeciesList = [
    { id: 'sp-1', name: 'Dar' },
    { id: 'sp-2', name: 'Sylvathi' }
  ];
  const spRecs = getSpeciesRecommendations(null, '', testSpeciesList, 2, null, null, mockOccupation);
  const matchedSpecies = spRecs.find(r => r.name === 'Dar');
  assert.ok(matchedSpecies, 'Dar should be recommended');
  assert.ok(matchedSpecies.score > 0, 'Score should be elevated');
  assert.ok(matchedSpecies.rationale.includes('Covert Infiltrator'), 'Rationale should mention occupation');

  // 2. Verify faction recommendations elevated by occupation's recommended_factions
  const testFactionsList = [
    { id: 'fac-1', name: 'Shadow Syndicate' },
    { id: 'fac-2', name: 'Solar Coalition' }
  ];
  const facRecs = getFactionRecommendations(null, '', testFactionsList, 2, null, null, mockOccupation);
  const matchedFaction = facRecs.find(r => r.name === 'Shadow Syndicate');
  assert.ok(matchedFaction, 'Shadow Syndicate should be recommended');
  assert.ok(matchedFaction.score > 0, 'Score should be elevated');
  assert.ok(matchedFaction.rationale.includes('Covert Infiltrator'), 'Rationale should mention occupation');

  // 3. Verify origin recommendations elevated by occupation's recommended_origins
  const testOriginsList = [
    { id: 'orig-1', name: 'Deep Void & Station' },
    { id: 'orig-2', name: 'Agricultural Agri-World' }
  ];
  const origRecs = getOriginRecommendations(null, '', testOriginsList, 2, null, null, mockOccupation);
  const matchedOrigin = origRecs.find(r => r.name === 'Deep Void & Station');
  assert.ok(matchedOrigin, 'Deep Void & Station should be recommended');
  assert.ok(matchedOrigin.score > 0, 'Score should be elevated');
  assert.ok(matchedOrigin.rationale.includes('Covert Infiltrator'), 'Rationale should mention occupation');

  // 4. Verify skills derivation incorporates occupation recommended_skills
  const skillsResult = derivePillarSkills({ occupation: mockOccupation });
  assert.ok(skillsResult.occuAllocations.skills['Stealth'] >= 2, 'Stealth should be allocated from occupation recommended_skills');
  assert.ok(skillsResult.occuAllocations.skills['Computers'] >= 2, 'Computers should be allocated from occupation recommended_skills');

  // 5. Verify traits/features derivation incorporates occupation recommended_features
  const traitsResult = derivePillarTraitsAndFeatures({ occupation: mockOccupation });
  const matchedFeature = traitsResult.features.find(f => f.name.toLowerCase() === 'ghost step');
  assert.ok(matchedFeature, 'Ghost Step should be granted from occupation recommended_features');
  assert.strictEqual(matchedFeature.source, 'occupation');
});

test('BASTION Character Synthesis: Occupation Railguard Negative Keywords & Directives Weight', () => {
  // 1. Occupation selection weight adjustments based on keywords and railguards
  const positiveOccupation = {
    id: 'oc-pos',
    name: 'Cyber Infiltrator',
    keywords: 'cyber, covert, hacker'
  };
  const negativeOccupation = {
    id: 'oc-neg',
    name: 'Brute Gladiator',
    negative_keywords: 'cyber, covert, hacker'
  };
  const neutralOccupation = {
    id: 'oc-neu',
    name: 'General Laborer'
  };

  const occuList = [neutralOccupation, positiveOccupation, negativeOccupation];
  const recs = getOccupationRecommendations(null, 'cyber covert hacker operative', occuList, 3);

  const posRec = recs.find(r => r.name === 'Cyber Infiltrator');
  const negRec = recs.find(r => r.name === 'Brute Gladiator');
  const neuRec = recs.find(r => r.name === 'General Laborer');

  assert.ok(posRec.score > neuRec.score, 'Positive occupation keywords must add weight to score');
  assert.ok(negRec.score < neuRec.score, 'Negative occupation railguard keywords must reduce score');
  assert.ok(posRec.rationale.includes('+weight'), 'Positive keyword match should indicate weight addition in rationale');
  assert.ok(negRec.rationale.includes('-weight'), 'Negative keyword match should indicate weight reduction in rationale');

  // 2. Test 4-pillar combined narrative export structured aiDirectives
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Ace' },
    species: {
      name: 'Aeromancer Sylph',
      keywords: 'aerial, glider',
      negative_keywords: 'heavy armor'
    },
    faction: {
      name: 'Cyber Vanguard',
      keywords: 'cybernetic, enhanced',
      negative_keywords: 'primitive'
    },
    origin: {
      name: 'Glacial Permafrost',
      keywords: 'cryo, arctic',
      negative_keywords: 'aquatic'
    },
    occupation: {
      name: 'Cyber Infiltrator',
      keywords: 'stealth, infiltration',
      negative_keywords: 'loud, clumsy'
    }
  });

  assert.ok(narrative.aiDirectives, 'Narrative payload must contain structured aiDirectives');
  assert.deepStrictEqual(narrative.aiDirectives.thematicWeights, ['aerial', 'glider', 'cybernetic', 'enhanced', 'cryo', 'arctic', 'stealth', 'infiltration']);
  assert.deepStrictEqual(narrative.aiDirectives.negativeRailguards, ['heavy armor', 'primitive', 'aquatic', 'loud', 'clumsy']);
});

test('BASTION Character Synthesis: Skill TL/ML Resonance & AI Guidance Keywords/Railguards', () => {
  // 1. Verify skill pool point scoring prioritizes skills matching TL & ML resonance and positive directives
  const highTechNavSkill = {
    id: 'skill-astrogation',
    name: 'Astrogation',
    category: 'Technical',
    baseAttr: 'attr-intellect',
    recommended_tl: ['TL 4', 'TL 5'],
    recommended_ml: ['ML 1'],
    keywords: 'interstellar, hyperspace, void',
    negative_keywords: 'primitive'
  };

  const primitiveSkill = {
    id: 'skill-primitive-tracking',
    name: 'Primitive Tracking',
    category: 'Wilderness',
    baseAttr: 'attr-wit',
    recommended_tl: ['TL 0', 'TL 1'],
    recommended_ml: ['ML 0'],
    keywords: 'foraging, stone-age',
    negative_keywords: 'interstellar'
  };

  const customSkillsList = [highTechNavSkill, primitiveSkill, ...ALL_CANONICAL_SKILLS];

  const factionWithBoth = {
    name: 'Void Syndicate',
    tech_level: 4,
    meta_level: 1,
    keywords: 'interstellar, void, advanced',
    skills: ['Astrogation', 'Primitive Tracking']
  };

  const skillsResult = derivePillarSkills({
    faction: factionWithBoth,
    skillsList: customSkillsList,
    techLevel: 4,
    metaLevel: 1
  });

  // Astrogation should receive priority allocation over Primitive Tracking
  const astroRank = skillsResult.factionAllocations.skills['Astrogation'] || 0;
  const primRank = skillsResult.factionAllocations.skills['Primitive Tracking'] || 0;
  assert.ok(astroRank > primRank, `Astrogation (${astroRank}) should score higher than Primitive Tracking (${primRank}) due to TL4/ML1 resonance & keywords`);

  // Verify finalSkillsList contains the metadata fields
  const astroFinal = skillsResult.finalSkillsList.find(s => s.name === 'Astrogation');
  assert.ok(astroFinal, 'Astrogation must be in finalSkillsList');
  assert.deepStrictEqual(astroFinal.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(astroFinal.recommended_ml, ['ML 1']);
  assert.strictEqual(astroFinal.keywords, 'interstellar, hyperspace, void');
  assert.strictEqual(astroFinal.negative_keywords, 'primitive');

  // 2. Verify narrative aiDirectives incorporates skill keywords and railguards
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Navigator' },
    species: { name: 'Voidborn', keywords: 'zero-g', negative_keywords: 'heavy gravity' },
    faction: { name: 'Void Syndicate', keywords: 'trade', negative_keywords: 'piracy' },
    origin: { name: 'Orbital Spire', keywords: 'vacuum', negative_keywords: 'subterranean' },
    occupation: { name: 'Helm Officer', keywords: 'pilot', negative_keywords: 'ground combat' },
    skills: [astroFinal]
  });

  assert.ok(narrative.aiDirectives.thematicWeights.includes('interstellar'), 'Thematic weights should include skill keyword interstellar');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('hyperspace'), 'Thematic weights should include skill keyword hyperspace');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('void'), 'Thematic weights should include skill keyword void');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('primitive'), 'Negative railguards should include skill negative_keyword primitive');

  // 3. Verify synthesizeCharacterWithBastion includes skill directives
  const fullChar = synthesizeCharacterWithBastion({
    prompt: 'deep space void navigator and pilot'
  });
  assert.ok(fullChar.success, 'Character synthesis must succeed');
  assert.ok(fullChar.character.aiDirectives, 'Character must include aiDirectives');
  assert.ok(Array.isArray(fullChar.character.skills), 'Character must have skills array');
  // Check that skills have guidance properties
  fullChar.character.skills.forEach(s => {
    assert.ok('recommended_tl' in s, `Skill ${s.name} should have recommended_tl property`);
    assert.ok('recommended_ml' in s, `Skill ${s.name} should have recommended_ml property`);
    assert.ok('keywords' in s, `Skill ${s.name} should have keywords property`);
    assert.ok('negative_keywords' in s, `Skill ${s.name} should have negative_keywords property`);
  });
});

test('BASTION Character Synthesis: Feature TL/ML Resonance & AI Guidance Keywords/Railguards', () => {
  // 1. Verify feature candidate selection prioritizes features matching TL & ML resonance and positive directives
  const highTechFeature = {
    id: 'feat-neural-overdrive',
    name: 'Neural Reflex Overdrive',
    category: 'Combat',
    recommended_tl: ['TL 4', 'TL 5'],
    recommended_ml: ['ML 1'],
    keywords: 'cybernetic, neural, overdrive',
    negative_keywords: 'primitive'
  };

  const primitiveFeature = {
    id: 'feat-primitive-grit',
    name: 'Primitive Grit',
    category: 'General',
    recommended_tl: ['TL 0', 'TL 1'],
    recommended_ml: ['ML 0'],
    keywords: 'foraging, survival',
    negative_keywords: 'cybernetic'
  };

  const customFeaturesList = [highTechFeature, primitiveFeature, ...DEFAULT_FEATURES];

  const factionWithBoth = {
    name: 'Cybernetic Concordat',
    tech_level: 4,
    meta_level: 1,
    keywords: 'cybernetic, neural, advanced',
    recommended_features: ['Primitive Grit', 'Neural Reflex Overdrive']
  };

  const featResult = derivePillarTraitsAndFeatures({
    faction: factionWithBoth,
    featuresList: customFeaturesList,
    techLevel: 4,
    metaLevel: 1
  });

  // Neural Reflex Overdrive should be selected over Primitive Grit due to TL4/ML1 resonance & keywords
  const matchedFeat = featResult.features.find(f => f.name === 'Neural Reflex Overdrive');
  assert.ok(matchedFeat, 'Neural Reflex Overdrive should be selected from faction recommended_features');
  assert.strictEqual(matchedFeat.source, 'faction');
  assert.deepStrictEqual(matchedFeat.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(matchedFeat.recommended_ml, ['ML 1']);
  assert.strictEqual(matchedFeat.keywords, 'cybernetic, neural, overdrive');
  assert.strictEqual(matchedFeat.negative_keywords, 'primitive');

  // 2. Verify narrative aiDirectives incorporates feature keywords and railguards
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Cyber-Warrior' },
    species: { name: 'Synthetic', keywords: 'chassis', negative_keywords: 'organic' },
    faction: { name: 'Cybernetic Concordat', keywords: 'cyber', negative_keywords: 'primitive' },
    origin: { name: 'Arcology', keywords: 'urban', negative_keywords: 'wilderness' },
    occupation: { name: 'Infiltrator', keywords: 'stealth', negative_keywords: 'loud' },
    features: [matchedFeat]
  });

  assert.ok(narrative.aiDirectives.thematicWeights.includes('cybernetic'), 'Thematic weights should include feature keyword cybernetic');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('neural'), 'Thematic weights should include feature keyword neural');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('overdrive'), 'Thematic weights should include feature keyword overdrive');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('primitive'), 'Negative railguards should include feature negative_keyword primitive');

  // 3. Verify synthesizeCharacterWithBastion includes feature directives and guidance fields
  const fullChar = synthesizeCharacterWithBastion({
    prompt: 'cybernetic neural operative'
  });
  assert.ok(fullChar.success, 'Character synthesis must succeed');
  assert.ok(fullChar.character.aiDirectives, 'Character must include aiDirectives');
  assert.ok(Array.isArray(fullChar.character.features), 'Character must have features array');
  fullChar.character.features.forEach(f => {
    assert.ok('recommended_tl' in f, `Feature ${f.name} should have recommended_tl property`);
    assert.ok('recommended_ml' in f, `Feature ${f.name} should have recommended_ml property`);
    assert.ok('keywords' in f, `Feature ${f.name} should have keywords property`);
    assert.ok('negative_keywords' in f, `Feature ${f.name} should have negative_keywords property`);
  });
});

test('BASTION Character Synthesis: Gear Architect Guidance & Thematic Resonance', () => {
  // 1. Verify derivePillarProperty selects gear matching TL, ML, and keywords
  const mockGearDb = [
    {
      id: 'gear-cyberdeck-advanced',
      name: 'Neural Interface Cyberdeck',
      tech_level: 4,
      meta_level: 0,
      recommended_tl: ['TL 4', 'TL 5'],
      recommended_ml: ['ML 0'],
      keywords: 'cyberdeck, intrusion, hacking, terminal',
      negative_keywords: 'primitive, heavy armor',
      weight: 1
    },
    {
      id: 'gear-flint-kit',
      name: 'Primitive Flint & Tinder',
      tech_level: 0,
      meta_level: 0,
      recommended_tl: ['TL 0', 'TL 1'],
      recommended_ml: ['ML 0'],
      keywords: 'primitive, survival, fire',
      negative_keywords: 'cyberdeck, advanced',
      weight: 0.5
    }
  ];

  const propResult = derivePillarProperty({
    archetype: { name: 'The Decker', core_concept: 'cyberdeck hacker', tactical_role: 'intrusion' },
    occupation: { name: 'Agent', keywords: 'cyberdeck, covert' },
    faction: { name: 'Syndicate', tech_level: 4, keywords: 'cybernetics, hacking' },
    species: { name: 'Human' },
    techLevel: 4,
    metaLevel: 0,
    gearList: mockGearDb
  });

  // Verify Neural Interface Cyberdeck is selected over Primitive Flint
  const matchedGear = propResult.gear.find(g => g.name === 'Neural Interface Cyberdeck');
  assert.ok(matchedGear, 'Neural Interface Cyberdeck should be selected based on TL4 resonance and keywords');
  assert.deepStrictEqual(matchedGear.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(matchedGear.recommended_ml, ['ML 0']);
  assert.strictEqual(matchedGear.keywords, 'cyberdeck, intrusion, hacking, terminal');
  assert.strictEqual(matchedGear.negative_keywords, 'primitive, heavy armor');

  // Verify baseline gear also carries guidance properties
  propResult.gear.forEach(g => {
    assert.ok('recommended_tl' in g, `Gear ${g.name} should have recommended_tl`);
    assert.ok('recommended_ml' in g, `Gear ${g.name} should have recommended_ml`);
    assert.ok('keywords' in g, `Gear ${g.name} should have keywords`);
    assert.ok('negative_keywords' in g, `Gear ${g.name} should have negative_keywords`);
  });

  // 2. Verify narrative aiDirectives incorporates gear keywords and railguards
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Decker' },
    species: { name: 'Human', keywords: 'adaptable' },
    faction: { name: 'Syndicate', keywords: 'cyber' },
    origin: { name: 'Arcology', keywords: 'urban' },
    occupation: { name: 'Agent', keywords: 'stealth' },
    gear: propResult.gear
  });

  assert.ok(narrative.aiDirectives.thematicWeights.includes('cyberdeck'), 'Thematic weights should include gear keyword cyberdeck');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('intrusion'), 'Thematic weights should include gear keyword intrusion');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('primitive'), 'Negative railguards should include gear negative_keyword primitive');

  // 3. Verify synthesizeCharacterWithBastion includes gear directives and guidance fields
  const fullChar = synthesizeCharacterWithBastion({
    prompt: 'covert cyberdeck infiltrator'
  });
  assert.ok(fullChar.success, 'Character synthesis must succeed');
  assert.ok(Array.isArray(fullChar.character.gear), 'Character must include gear array');
  fullChar.character.gear.forEach(g => {
    assert.ok('recommended_tl' in g, `Gear ${g.name} in synthesized character should have recommended_tl`);
    assert.ok('recommended_ml' in g, `Gear ${g.name} in synthesized character should have recommended_ml`);
    assert.ok('keywords' in g, `Gear ${g.name} in synthesized character should have keywords`);
    assert.ok('negative_keywords' in g, `Gear ${g.name} in synthesized character should have negative_keywords`);
  });
});

test('BASTION Synthesis: Weapon Resonance, TL/ML Calibrations, and AI Directives / Railguards', () => {
  const mockWeaponDb = [
    {
      id: 'wpn-apex9-carbine',
      name: 'Apex-9 Particle Carbine',
      classification: 'Ranged (Energy)',
      damage: '3d8',
      damage_type: 'Energy',
      range: '40/80/200',
      tech_level: 4,
      meta_level: 0,
      recommended_tl: ['TL 4', 'TL 5'],
      recommended_ml: ['ML 0'],
      keywords: 'carbine, energy, particle, burst, assault, tactical',
      negative_keywords: 'primitive, pacifist, archaic'
    },
    {
      id: 'wpn-primitive-musket',
      name: 'Flintlock Arquebus',
      classification: 'Ranged (Ballistic)',
      damage: '1d10',
      damage_type: 'Kinetic',
      range: '10/30/60',
      tech_level: 1,
      meta_level: 0,
      recommended_tl: ['TL 0', 'TL 1'],
      recommended_ml: ['ML 0'],
      keywords: 'primitive, black powder, archaic',
      negative_keywords: 'high-tech, energy, advanced, cyber'
    },
    {
      id: 'wpn-sidearm-blaster',
      name: 'Model 3 Ion Pistol',
      classification: 'Ranged (Energy)',
      damage: '1d8',
      damage_type: 'Energy',
      range: '10/25/50',
      tech_level: 4,
      meta_level: 0,
      recommended_tl: ['TL 3', 'TL 4'],
      recommended_ml: ['ML 0'],
      keywords: 'pistol, sidearm, energy, backup',
      negative_keywords: 'heavy artillery, primitive'
    }
  ];

  // 1. Verify weapon selection resonance in derivePillarProperty
  const propResult = derivePillarProperty({
    archetype: { tactical_role: 'Ranged Assault', core_concept: 'Shock trooper rifleman' },
    occupation: { name: 'Soldier', keywords: 'assault, rifle, tactical' },
    faction: { name: 'Syndicate', tech_level: 4 },
    species: { name: 'Human' },
    techLevel: 4,
    metaLevel: 0,
    weaponryList: mockWeaponDb
  });

  // Verify Apex-9 Particle Carbine is selected over Flintlock Arquebus
  const matchedWeapon = propResult.weapons.find(w => w.name === 'Apex-9 Particle Carbine');
  assert.ok(matchedWeapon, 'Apex-9 Particle Carbine should be selected based on TL4 resonance and keywords');
  assert.deepStrictEqual(matchedWeapon.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(matchedWeapon.recommended_ml, ['ML 0']);
  assert.strictEqual(matchedWeapon.keywords, 'carbine, energy, particle, burst, assault, tactical');
  assert.strictEqual(matchedWeapon.negative_keywords, 'primitive, pacifist, archaic');

  // Verify weapons carry guidance properties
  propResult.weapons.forEach(w => {
    assert.ok('recommended_tl' in w, `Weapon ${w.name} should have recommended_tl`);
    assert.ok('recommended_ml' in w, `Weapon ${w.name} should have recommended_ml`);
    assert.ok('keywords' in w, `Weapon ${w.name} should have keywords`);
    assert.ok('negative_keywords' in w, `Weapon ${w.name} should have negative_keywords`);
  });

  // 2. Verify narrative aiDirectives incorporates weapon keywords and railguards
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Vanguard' },
    species: { name: 'Human', keywords: 'adaptable' },
    faction: { name: 'Syndicate', keywords: 'cyber' },
    origin: { name: 'Arcology', keywords: 'urban' },
    occupation: { name: 'Soldier', keywords: 'assault' },
    weapons: propResult.weapons
  });

  assert.ok(narrative.aiDirectives.thematicWeights.includes('particle'), 'Thematic weights should include weapon keyword particle');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('carbine'), 'Thematic weights should include weapon keyword carbine');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('primitive'), 'Negative railguards should include weapon negative_keyword primitive');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('pacifist'), 'Negative railguards should include weapon negative_keyword pacifist');

  // 3. Verify synthesizeCharacterWithBastion includes weapon directives and guidance fields
  const fullChar = synthesizeCharacterWithBastion({
    prompt: 'heavy assault energy rifleman'
  });
  assert.ok(fullChar.success, 'Character synthesis must succeed');
  assert.ok(Array.isArray(fullChar.character.weapons), 'Character must include weapons array');
  fullChar.character.weapons.forEach(w => {
    assert.ok('recommended_tl' in w, `Weapon ${w.name} in synthesized character should have recommended_tl`);
    assert.ok('recommended_ml' in w, `Weapon ${w.name} in synthesized character should have recommended_ml`);
    assert.ok('keywords' in w, `Weapon ${w.name} in synthesized character should have keywords`);
    assert.ok('negative_keywords' in w, `Weapon ${w.name} in synthesized character should have negative_keywords`);
  });
});

test('BASTION Synthesis: Armor Resonance, TL/ML Calibrations, and AI Directives / Railguards', () => {
  const mockArmorDb = [
    {
      id: 'armor-dreadnought-plate',
      name: 'Dreadnought Powered Plate',
      category: 'armoring',
      dr: 20,
      durability: '60',
      tech_level: 4,
      meta_level: 0,
      recommended_tl: ['TL 4', 'TL 5'],
      recommended_ml: ['ML 0'],
      keywords: 'heavy, powered plate, tank, frontline, defense, ablative',
      negative_keywords: 'lightweight, stealth, covert'
    },
    {
      id: 'armor-primitive-hide',
      name: 'Beast Hide Jerkin',
      category: 'armoring',
      dr: 4,
      durability: '10',
      tech_level: 1,
      meta_level: 0,
      recommended_tl: ['TL 0', 'TL 1'],
      recommended_ml: ['ML 0'],
      keywords: 'primitive, leather, archaic',
      negative_keywords: 'high-tech, powered, tactical'
    },
    {
      id: 'armor-stealth-weave',
      name: 'Shadow Weave Bodysuit',
      category: 'armoring',
      dr: 8,
      durability: '20',
      tech_level: 4,
      meta_level: 0,
      recommended_tl: ['TL 3', 'TL 4'],
      recommended_ml: ['ML 0'],
      keywords: 'light, stealth, infiltration, weave, covert',
      negative_keywords: 'heavy plate, noisy, tank'
    }
  ];

  // 1. Verify armor selection resonance in derivePillarProperty
  const propResult = derivePillarProperty({
    archetype: { tactical_role: 'Tank / Frontline', core_concept: 'Heavy armor defensive bulwark' },
    occupation: { name: 'Soldier', keywords: 'defense, heavy, frontline' },
    faction: { name: 'Syndicate', tech_level: 4 },
    species: { name: 'Human' },
    techLevel: 4,
    metaLevel: 0,
    armoringList: mockArmorDb
  });

  // Verify Dreadnought Powered Plate is selected over Beast Hide Jerkin
  const matchedArmor = propResult.armor.find(a => a.name === 'Dreadnought Powered Plate');
  assert.ok(matchedArmor, 'Dreadnought Powered Plate should be selected based on TL4 resonance and keywords');
  assert.deepStrictEqual(matchedArmor.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(matchedArmor.recommended_ml, ['ML 0']);
  assert.strictEqual(matchedArmor.keywords, 'heavy, powered plate, tank, frontline, defense, ablative');
  assert.strictEqual(matchedArmor.negative_keywords, 'lightweight, stealth, covert');

  // Verify armor carries guidance properties
  propResult.armor.forEach(a => {
    assert.ok('recommended_tl' in a, `Armor ${a.name} should have recommended_tl`);
    assert.ok('recommended_ml' in a, `Armor ${a.name} should have recommended_ml`);
    assert.ok('keywords' in a, `Armor ${a.name} should have keywords`);
    assert.ok('negative_keywords' in a, `Armor ${a.name} should have negative_keywords`);
  });

  // 2. Verify narrative aiDirectives incorporates armor keywords and railguards
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Bulwark' },
    species: { name: 'Human', keywords: 'adaptable' },
    faction: { name: 'Syndicate', keywords: 'cyber' },
    origin: { name: 'Arcology', keywords: 'urban' },
    occupation: { name: 'Soldier', keywords: 'frontline' },
    armor: propResult.armor
  });

  assert.ok(narrative.aiDirectives.thematicWeights.includes('ablative'), 'Thematic weights should include armor keyword ablative');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('powered plate'), 'Thematic weights should include armor keyword powered plate');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('lightweight'), 'Negative railguards should include armor negative_keyword lightweight');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('covert'), 'Negative railguards should include armor negative_keyword covert');

  // 3. Verify synthesizeCharacterWithBastion includes armor directives and guidance fields
  const fullChar = synthesizeCharacterWithBastion({
    prompt: 'heavy defense armored soldier'
  });
  assert.ok(fullChar.success, 'Character synthesis must succeed');
  assert.ok(Array.isArray(fullChar.character.armor), 'Character must include armor array');
  fullChar.character.armor.forEach(a => {
    assert.ok('recommended_tl' in a, `Armor ${a.name} in synthesized character should have recommended_tl`);
    assert.ok('recommended_ml' in a, `Armor ${a.name} in synthesized character should have recommended_ml`);
    assert.ok('keywords' in a, `Armor ${a.name} in synthesized character should have keywords`);
    assert.ok('negative_keywords' in a, `Armor ${a.name} in synthesized character should have negative_keywords`);
  });
});

test('BASTION Synthesis: Augmentations Resonance, TL/ML Calibrations, and AI Directives / Railguards', () => {
  const mockAugDb = [
    {
      id: 'aug-hyper-reflexes',
      name: 'Hyper-Synaptic Neural Mesh',
      category: 'brain',
      tech_level: 4,
      meta_level: 0,
      recommended_tl: ['TL 4', 'TL 5'],
      recommended_ml: ['ML 0'],
      keywords: 'neural, reflex, overclock, initiative, speed, cybernetic',
      negative_keywords: 'biological purist, primitive, low tech'
    },
    {
      id: 'aug-primitive-hook',
      name: 'Iron Hook Hand',
      category: 'hand_foot',
      tech_level: 1,
      meta_level: 0,
      recommended_tl: ['TL 0', 'TL 1'],
      recommended_ml: ['ML 0'],
      keywords: 'primitive, hook, archaic',
      negative_keywords: 'high-tech, neural, advanced'
    },
    {
      id: 'aug-subdermal-carapace',
      name: 'Subdermal Plasteel Carapace',
      category: 'body_mod',
      tech_level: 3,
      meta_level: 0,
      recommended_tl: ['TL 3', 'TL 4'],
      recommended_ml: ['ML 0'],
      keywords: 'subdermal, armor, kinetic, dermal weave',
      negative_keywords: 'unarmored, lightweight'
    }
  ];

  // 1. Verify augmentation selection resonance in derivePillarProperty
  const propResult = derivePillarProperty({
    archetype: { tactical_role: 'Infiltrator / Speed', core_concept: 'Cybernetically augmented fast striker' },
    occupation: { name: 'Infiltrator', keywords: 'reflex, neural, overclock' },
    faction: { name: 'Syndicate', tech_level: 4 },
    species: { name: 'Human' },
    techLevel: 4,
    metaLevel: 0,
    augmentationsList: mockAugDb
  });

  // Verify Hyper-Synaptic Neural Mesh is selected over Iron Hook Hand
  assert.ok(Array.isArray(propResult.augmentations), 'propResult must include augmentations array');
  const matchedAug = propResult.augmentations.find(a => a.name === 'Hyper-Synaptic Neural Mesh');
  assert.ok(matchedAug, 'Hyper-Synaptic Neural Mesh should be selected based on TL4 resonance and keywords');
  assert.deepStrictEqual(matchedAug.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(matchedAug.recommended_ml, ['ML 0']);
  assert.strictEqual(matchedAug.keywords, 'neural, reflex, overclock, initiative, speed, cybernetic');
  assert.strictEqual(matchedAug.negative_keywords, 'biological purist, primitive, low tech');

  // Verify augmentations carry guidance properties
  propResult.augmentations.forEach(a => {
    assert.ok('recommended_tl' in a, `Augmentation ${a.name} should have recommended_tl`);
    assert.ok('recommended_ml' in a, `Augmentation ${a.name} should have recommended_ml`);
    assert.ok('keywords' in a, `Augmentation ${a.name} should have keywords`);
    assert.ok('negative_keywords' in a, `Augmentation ${a.name} should have negative_keywords`);
  });

  // 2. Verify narrative aiDirectives incorporates augmentation keywords and railguards
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Phantom' },
    species: { name: 'Human', keywords: 'adaptable' },
    faction: { name: 'Syndicate', keywords: 'cyber' },
    origin: { name: 'Arcology', keywords: 'urban' },
    occupation: { name: 'Infiltrator', keywords: 'covert' },
    augmentations: propResult.augmentations
  });

  assert.ok(narrative.aiDirectives.thematicWeights.includes('overclock'), 'Thematic weights should include augmentation keyword overclock');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('neural'), 'Thematic weights should include augmentation keyword neural');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('biological purist'), 'Negative railguards should include augmentation negative_keyword biological purist');

  // 3. Verify synthesizeCharacterWithBastion includes augmentations array and report
  const fullChar = synthesizeCharacterWithBastion({
    prompt: 'cybernetically augmented neural infiltrator'
  });
  assert.ok(fullChar.success, 'Character synthesis must succeed');
  assert.ok(Array.isArray(fullChar.character.augmentations), 'Character must include augmentations array');
  if (fullChar.character.augmentations.length > 0) {
    fullChar.character.augmentations.forEach(a => {
      assert.ok('recommended_tl' in a, `Augmentation ${a.name} in synthesized character should have recommended_tl`);
      assert.ok('recommended_ml' in a, `Augmentation ${a.name} in synthesized character should have recommended_ml`);
      assert.ok('keywords' in a, `Augmentation ${a.name} in synthesized character should have keywords`);
      assert.ok('negative_keywords' in a, `Augmentation ${a.name} in synthesized character should have negative_keywords`);
    });
  }
  assert.ok('augmentationsCount' in fullChar.allocationsReport, 'allocationsReport must include augmentationsCount');
});

test('BASTION Character Synthesis: Mecha Architect Guidance, Resonance Scoring & Narrative Directives', () => {
  // 1. Verify derivePillarProperty selects resonant mecha based on TL, ML, and keywords
  const mockMechaDb = [
    {
      id: 'mech-heavy-siege',
      name: 'Goliath Siege Titan',
      size: 'Huge',
      frame: 'Humanoid',
      tech_level: 4,
      meta_level: 0,
      recommended_tl: ['TL 4', 'TL 5'],
      recommended_ml: ['ML 0'],
      keywords: 'heavy walker, siege, frontline armor, bipedal, cannon, pilot',
      negative_keywords: 'stealth, civilian, aquatic, ultra-light recon'
    },
    {
      id: 'mech-rust-walker',
      name: 'Scrap Walker Mk-I',
      size: 'Medium',
      frame: 'Walker',
      tech_level: 1,
      meta_level: 0,
      recommended_tl: ['TL 1'],
      recommended_ml: ['ML 0'],
      keywords: 'primitive, junkyard, civilian',
      negative_keywords: 'advanced, frontline armor'
    }
  ];

  const propResult = derivePillarProperty({
    archetype: { tactical_role: 'Heavy Armored Pilot', core_concept: 'Siege walker pilot and armored vehicle operator' },
    occupation: { name: 'Pilot', keywords: 'heavy walker, siege, pilot' },
    faction: { name: 'Titan Foundry', tech_level: 4 },
    species: { name: 'Human' },
    techLevel: 4,
    metaLevel: 0,
    mechaList: mockMechaDb
  });

  // Verify Goliath Siege Titan is selected over Scrap Walker
  assert.ok(Array.isArray(propResult.mecha), 'propResult must include mecha array');
  const matchedMech = propResult.mecha.find(m => m.name === 'Goliath Siege Titan');
  assert.ok(matchedMech, 'Goliath Siege Titan should be selected based on TL4 resonance and keywords');
  assert.deepStrictEqual(matchedMech.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(matchedMech.recommended_ml, ['ML 0']);
  assert.strictEqual(matchedMech.keywords, 'heavy walker, siege, frontline armor, bipedal, cannon, pilot');
  assert.strictEqual(matchedMech.negative_keywords, 'stealth, civilian, aquatic, ultra-light recon');

  // Verify mecha carries guidance properties
  propResult.mecha.forEach(m => {
    assert.ok('recommended_tl' in m, `Mecha ${m.name} should have recommended_tl`);
    assert.ok('recommended_ml' in m, `Mecha ${m.name} should have recommended_ml`);
    assert.ok('keywords' in m, `Mecha ${m.name} should have keywords`);
    assert.ok('negative_keywords' in m, `Mecha ${m.name} should have negative_keywords`);
  });

  // 2. Verify narrative aiDirectives incorporates mecha keywords and railguards
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Ace' },
    species: { name: 'Human', keywords: 'adaptable' },
    faction: { name: 'Titan Foundry', keywords: 'industrial' },
    origin: { name: 'Arcology', keywords: 'urban' },
    occupation: { name: 'Pilot', keywords: 'flight' },
    mecha: propResult.mecha
  });

  assert.ok(narrative.aiDirectives.thematicWeights.includes('siege'), 'Thematic weights should include mecha keyword siege');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('frontline armor'), 'Thematic weights should include mecha keyword frontline armor');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('stealth'), 'Negative railguards should include mecha negative_keyword stealth');

  // 3. Verify synthesizeCharacterWithBastion includes mecha array and report
  const fullChar = synthesizeCharacterWithBastion({
    prompt: 'heavy armored mecha walker pilot'
  });
  assert.ok(fullChar.success, 'Character synthesis must succeed');
  assert.ok(Array.isArray(fullChar.character.mecha), 'Character must include mecha array');
  if (fullChar.character.mecha.length > 0) {
    fullChar.character.mecha.forEach(m => {
      assert.ok('recommended_tl' in m, `Mecha ${m.name} in synthesized character should have recommended_tl`);
      assert.ok('recommended_ml' in m, `Mecha ${m.name} in synthesized character should have recommended_ml`);
      assert.ok('keywords' in m, `Mecha ${m.name} in synthesized character should have keywords`);
      assert.ok('negative_keywords' in m, `Mecha ${m.name} in synthesized character should have negative_keywords`);
    });
  }
  assert.ok('mechaCount' in fullChar.allocationsReport, 'allocationsReport must include mechaCount');
});

test('BASTION Character Synthesis: Architecture Architect Guidance, Resonance Scoring & Narrative Directives', () => {
  // 1. Verify derivePillarProperty selects resonant architecture based on TL, ML, and keywords
  const mockArchDb = [
    {
      id: 'arch-citadel-prime',
      name: 'Titanium Defense Citadel',
      category: 'architecture',
      style: 'Industrial High-Tech',
      sp: 5000,
      dr: 30,
      tech_level: 4,
      meta_level: 0,
      recommended_tl: ['TL 4', 'TL 5'],
      recommended_ml: ['ML 0'],
      keywords: 'stronghold, fortress, defense citadel, bunker, heavy armor, builder',
      negative_keywords: 'fragile, makeshift, portable, open-air'
    },
    {
      id: 'arch-mud-hut',
      name: 'Makeshift Shelter',
      category: 'architecture',
      style: 'Primitive',
      sp: 50,
      dr: 2,
      tech_level: 0,
      meta_level: 0,
      recommended_tl: ['TL 0'],
      recommended_ml: ['ML 0'],
      keywords: 'primitive, makeshift, nomadic',
      negative_keywords: 'advanced, fortress, defense citadel'
    }
  ];

  const propResult = derivePillarProperty({
    archetype: { tactical_role: 'Stronghold Builder & Combat Engineer', core_concept: 'Military fortress architect and defense citadel engineer' },
    occupation: { name: 'Engineer', keywords: 'stronghold, defense citadel, builder' },
    faction: { name: 'Titan Foundry', tech_level: 4 },
    species: { name: 'Human' },
    techLevel: 4,
    metaLevel: 0,
    architectureList: mockArchDb
  });

  // Verify Titanium Defense Citadel is selected over Makeshift Shelter
  assert.ok(Array.isArray(propResult.architecture), 'propResult must include architecture array');
  const matchedArch = propResult.architecture.find(a => a.name === 'Titanium Defense Citadel');
  assert.ok(matchedArch, 'Titanium Defense Citadel should be selected based on TL4 resonance and keywords');
  assert.deepStrictEqual(matchedArch.recommended_tl, ['TL 4', 'TL 5']);
  assert.deepStrictEqual(matchedArch.recommended_ml, ['ML 0']);
  assert.strictEqual(matchedArch.keywords, 'stronghold, fortress, defense citadel, bunker, heavy armor, builder');
  assert.strictEqual(matchedArch.negative_keywords, 'fragile, makeshift, portable, open-air');

  // Verify architecture carries guidance properties
  propResult.architecture.forEach(a => {
    assert.ok('recommended_tl' in a, `Architecture ${a.name} should have recommended_tl`);
    assert.ok('recommended_ml' in a, `Architecture ${a.name} should have recommended_ml`);
    assert.ok('keywords' in a, `Architecture ${a.name} should have keywords`);
    assert.ok('negative_keywords' in a, `Architecture ${a.name} should have negative_keywords`);
  });

  // 2. Verify narrative aiDirectives incorporates architecture keywords and railguards
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Architect' },
    species: { name: 'Human', keywords: 'organized' },
    faction: { name: 'Titan Foundry', keywords: 'industrial' },
    origin: { name: 'Arcology', keywords: 'urban' },
    occupation: { name: 'Engineer', keywords: 'construction' },
    architecture: propResult.architecture
  });

  assert.ok(narrative.aiDirectives.thematicWeights.includes('defense citadel'), 'Thematic weights should include architecture keyword defense citadel');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('fortress'), 'Thematic weights should include architecture keyword fortress');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('makeshift'), 'Negative railguards should include architecture negative_keyword makeshift');

  // 3. Verify synthesizeCharacterWithBastion includes architecture array and report
  const fullChar = synthesizeCharacterWithBastion({
    prompt: 'military fortress architect and stronghold defense engineer'
  });
  assert.ok(fullChar.success, 'Character synthesis must succeed');
  assert.ok(Array.isArray(fullChar.character.architecture), 'Character must include architecture array');
  if (fullChar.character.architecture.length > 0) {
    fullChar.character.architecture.forEach(a => {
      assert.ok('recommended_tl' in a, `Architecture ${a.name} in synthesized character should have recommended_tl`);
      assert.ok('recommended_ml' in a, `Architecture ${a.name} in synthesized character should have recommended_ml`);
      assert.ok('keywords' in a, `Architecture ${a.name} in synthesized character should have keywords`);
      assert.ok('negative_keywords' in a, `Architecture ${a.name} in synthesized character should have negative_keywords`);
    });
  }
  assert.ok('architectureCount' in fullChar.allocationsReport, 'allocationsReport must include architectureCount');
});

test('BASTION Character Synthesis: Other Property Architect Guidance & AI Reference Directives', () => {
  // 1. Verify derivePillarProperty selects and scores other property items based on TL, ML, and keywords
  const mockOtherList = [
    {
      id: 'other-scrubber',
      name: 'Emergency Atmospheric Scrubbing Canister',
      category: 'Consumables',
      weight: 0.8,
      tech_level: 2,
      meta_level: 0,
      recommended_tl: ['TL 2', 'TL 3'],
      recommended_ml: ['ML 0'],
      keywords: 'life support, atmospheric, emergency, consumable, survivor, canister',
      negative_keywords: 'permanent installation, heavy armor, weaponized'
    },
    {
      id: 'other-luxury',
      name: 'High-Society Vintage Spirits Flask',
      category: 'Valuables & Relics',
      weight: 0.5,
      tech_level: 3,
      meta_level: 0,
      recommended_tl: ['TL 3', 'TL 4'],
      recommended_ml: ['ML 0'],
      keywords: 'luxury, socialite, trade, vintage, wealth',
      negative_keywords: 'combat, survivalist, hazmat'
    },
    {
      id: 'other-incompatible',
      name: 'Primitive Stone Grinding Mortar',
      category: 'Tools',
      weight: 5.0,
      tech_level: 0,
      meta_level: 0,
      recommended_tl: ['TL 0'],
      recommended_ml: ['ML 0'],
      keywords: 'stone age, primitive',
      negative_keywords: 'high tech, emergency, survival'
    }
  ];

  const propResult = derivePillarProperty({
    archetype: { name: 'The Survivor', core_concept: 'emergency survival operative', tactical_role: 'survivor' },
    occupation: { name: 'Medic', keywords: 'life support, emergency' },
    faction: { name: 'Frontier Aid', keywords: 'survival' },
    species: { name: 'Human' },
    techLevel: 2,
    metaLevel: 0,
    otherList: mockOtherList
  });

  assert.ok(Array.isArray(propResult.other), 'derivePillarProperty must return other property array');
  assert.ok(propResult.other.length > 0, 'Should select at least one other property item');

  const matchedOther = propResult.other.find(o => o.name === 'Emergency Atmospheric Scrubbing Canister');
  assert.ok(matchedOther, 'Emergency Atmospheric Scrubbing Canister should be selected based on TL2 resonance and keywords');
  assert.deepStrictEqual(matchedOther.recommended_tl, ['TL 2', 'TL 3']);
  assert.deepStrictEqual(matchedOther.recommended_ml, ['ML 0']);
  assert.strictEqual(matchedOther.keywords, 'life support, atmospheric, emergency, consumable, survivor, canister');
  assert.strictEqual(matchedOther.negative_keywords, 'permanent installation, heavy armor, weaponized');

  // Verify other property carries guidance properties
  propResult.other.forEach(o => {
    assert.ok('recommended_tl' in o, `Other property ${o.name} should have recommended_tl`);
    assert.ok('recommended_ml' in o, `Other property ${o.name} should have recommended_ml`);
    assert.ok('keywords' in o, `Other property ${o.name} should have keywords`);
    assert.ok('negative_keywords' in o, `Other property ${o.name} should have negative_keywords`);
  });

  // 2. Verify narrative aiDirectives incorporates other property keywords and railguards
  const narrative = derivePillarNarrative({
    archetype: { name: 'The Survivor' },
    species: { name: 'Human', keywords: 'tenacious' },
    faction: { name: 'Frontier Aid', keywords: 'aid' },
    origin: { name: 'Outpost', keywords: 'isolated' },
    occupation: { name: 'Medic', keywords: 'medical' },
    other: propResult.other
  });

  assert.ok(narrative.aiDirectives.thematicWeights.includes('life support'), 'Thematic weights should include other property keyword life support');
  assert.ok(narrative.aiDirectives.thematicWeights.includes('canister'), 'Thematic weights should include other property keyword canister');
  assert.ok(narrative.aiDirectives.negativeRailguards.includes('permanent installation'), 'Negative railguards should include other property negative_keyword permanent installation');
});





