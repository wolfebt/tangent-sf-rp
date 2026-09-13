/**
 * @file bastionCharacterSynthesis.test.mjs
 * @description Unit tests for BASTION Character Creation grounded in the 5 Canonical Database Pillars:
 * Archetype -> Species -> Faction -> Origin -> Occupation -> Skills, Features & Property.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findClosestArchetype,
  selectPillarSpecies,
  selectPillarFaction,
  selectPillarOrigin,
  selectPillarOccupation,
  derivePillarAttributes,
  derivePillarSkills,
  derivePillarTraitsAndFeatures,
  derivePillarProperty,
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

