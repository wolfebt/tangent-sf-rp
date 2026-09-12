/**
 * @file folioIntegrityFix.test.mjs
 * @description Automated Unit Test Suite verifying Folio fixes:
 * 1. Skill Deduplication in computeEconomyBreakdown (prevents double-billing CP for prefixed and clean keys).
 * 2. Attribute Extraction in extractHeroStats (prevents falsy 0 attribute coercion to 10).
 * 3. Vitals Key Harmonization in sharedSchemas.js (bidirectional preservation of current_health/vitality/structure).
 * 4. Persona Lifecycle Locking Contract (verifies locked phase, is_locked, is_ready_for_vtt).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { computeEconomyBreakdown } from '../../src/engines/tangentEntityEngines.js';
import { 
  folioCharacterToFoundryPersona, 
  foundryPersonaToFolioCharacter, 
  tokenToFolioCharacter,
  extractHeroStats
} from '../../src/schemas/sharedSchemas.js';
import { characterSchema } from '../../src/components/Folio/schema.js';

test('Economy Engine: Skill CP double-billing deduplication', () => {
  // Case 1: Both prefixed (canonical) and clean (legacy) keys exist with identical rank 3
  const characterWithDuplicates = {
    'starting-cp': 150,
    'skill-physical-acrobatics-rank': 3,
    'skill-acrobatics-rank': 3,
    'skill-combat-marksmanship-rank': 2,
    'skill-marksmanship-rank': 2
  };

  const breakdown = computeEconomyBreakdown(characterWithDuplicates);

  // In Tangent SFF RP, skills cost 1 CP per rank.
  // Acrobatics rank 3 = 3 CP, Marksmanship rank 2 = 2 CP.
  // Total skills CP should be 5 CP, NOT 10 CP.
  assert.equal(breakdown.skillsCP, 5, `Expected 5 CP for deduplicated skills, but received ${breakdown.skillsCP} CP`);
  assert.equal(breakdown.spentCP, 5, `Total spent CP should reflect deduplicated skills total`);
});

test('Economy Engine: Skill CP handles clean keys only and canonical keys only correctly', () => {
  const charCanonicalOnly = {
    'starting-cp': 150,
    'skill-physical-athletics-rank': 4
  };
  const breakdownCanonical = computeEconomyBreakdown(charCanonicalOnly);
  assert.equal(breakdownCanonical.skillsCP, 4);

  const charCleanOnly = {
    'starting-cp': 150,
    'skill-athletics-rank': 4
  };
  const breakdownClean = computeEconomyBreakdown(charCleanOnly);
  assert.equal(breakdownClean.skillsCP, 4);
});

test('Economy Engine: Feature CP discounts recommended features by 1 CP (min 1 CP)', () => {
  const charWithFeatures = {
    'starting-cp': 150,
    'char-species': 'Celestine', // bonus features include "Acute Senses", "Agile Maneuvers", "Combat Expertise"
    'char-occu': 'Adept',        // occupation recommendations include combat/ability
    features: [
      { name: 'Acute Senses', category: 'General' }, // recommended by species (individual & category) & occupation -> stacked down to 1 CP
      { name: 'Combat Reflexes', category: 'Combat' }, // category recommended by species -> 2 CP
      { name: 'Unrelated Feat', category: 'Social' }  // standard -> 3 CP
    ]
  };

  const breakdown = computeEconomyBreakdown(charWithFeatures);
  // Acute Senses: 1 CP (multi-source stacking discount down to 1 CP floor)
  // Combat Reflexes: 2 CP (category recommendation discount)
  // Unrelated Feat: 3 CP (standard feature)
  // Total features CP: 6 CP (instead of 3 * 3 = 9 CP)
  assert.equal(breakdown.featuresCost, 6, `Expected 6 CP for features with multi-source recommendations, got ${breakdown.featuresCost}`);
});


test('Hero Token Drawer: Attribute extraction does NOT coerce 0 to 10', () => {
  // Tangent SFF RP human attributes baseline at 0 (range -2 to +4)
  const standardHumanOperative = {
    'character-doc-id': 'hero-001',
    'char-name': 'Agent Jax',
    'attr-agility': 0,
    'attr-stamina': 0,
    'attr-charisma': 0,
    'attr-strength': 2,
    'attr-intellect': -1,
    health: 30,
    vitality: 30
  };

  const extracted = extractHeroStats(standardHumanOperative);

  // Agility 0 must be 0, NOT 10
  assert.equal(extracted.agility, 0, `Agility score of 0 must not be coerced to 10`);
  // Stamina 0 must be 0
  assert.equal(extracted.stamina, 0, `Stamina score of 0 must not be coerced to 10`);
  assert.equal(extracted.toughness, 0);
  assert.equal(extracted.name, 'Agent Jax');
  assert.equal(extracted.maxHealth, 30);
  assert.equal(extracted.maxVitality, 30);
});

test('Shared Schemas: Vitals harmonization respects biological vs synthetic mutual exclusivity', () => {
  // 1. Biological Operative (health & vitality only, NO structure)
  const biologicalFolio = {
    id: 'char-operative-007',
    'char-name': 'Vesper Lyra',
    'char-species': 'Human',
    health: 35,
    vitality: 40,
    current_health: 28,
    current_vitality: 32
  };

  const bioPersona = folioCharacterToFoundryPersona(biologicalFolio);
  assert.equal(bioPersona.stats.health, 35);
  assert.equal(bioPersona.stats.vitality, 40);
  assert.equal(bioPersona.stats.current_health, 28);
  assert.equal(bioPersona.stats.current_vitality, 32);
  assert.equal(bioPersona.stats.structure, null, 'Biological operative must have null structure');
  assert.equal(bioPersona.stats.current_structure, null, 'Biological operative must have null current_structure');

  const convertedBio = foundryPersonaToFolioCharacter(bioPersona);
  assert.equal(convertedBio.current_health, 28);
  assert.equal(convertedBio.current_vitality, 32);
  assert.equal(convertedBio.health, 35);
  assert.equal(convertedBio.vitality, 40);
  assert.equal(convertedBio.structure, null);
  assert.equal(convertedBio.current_structure, null);

  // 2. Synthetic Operative (structure only, NO health or vitality)
  const syntheticFolio = {
    id: 'char-mecha-001',
    'char-name': 'Unit Aegis-9',
    'char-species': 'Synthetic Mecha',
    isSynthetic: true,
    structure: 75,
    current_structure: 60
  };

  const synthPersona = folioCharacterToFoundryPersona(syntheticFolio);
  assert.equal(synthPersona.stats.structure, 75);
  assert.equal(synthPersona.stats.current_structure, 60);
  assert.equal(synthPersona.stats.health, null, 'Synthetic operative must have null health');
  assert.equal(synthPersona.stats.vitality, null, 'Synthetic operative must have null vitality');
  assert.equal(synthPersona.stats.current_health, null);
  assert.equal(synthPersona.stats.current_vitality, null);

  const convertedSynth = foundryPersonaToFolioCharacter(synthPersona);
  assert.equal(convertedSynth.current_structure, 60);
  assert.equal(convertedSynth.structure, 75);
  assert.equal(convertedSynth.current_health, null);
  assert.equal(convertedSynth.current_vitality, null);
  assert.equal(convertedSynth.health, null);
  assert.equal(convertedSynth.vitality, null);

  // 3. Tokens to Folio Character
  const bioToken = {
    id: 'tok-bio',
    name: 'Operative Bio',
    stats: {
      health: 30,
      vitality: 25,
      current_hp: 19,
      current_vitality: 15
    }
  };
  const tokenBioChar = tokenToFolioCharacter(bioToken);
  assert.equal(tokenBioChar.current_health, 19);
  assert.equal(tokenBioChar.current_vitality, 15);
  assert.equal(tokenBioChar.structure, null);
  assert.equal(tokenBioChar.current_structure, null);

  const synthToken = {
    id: 'tok-synth',
    name: 'Mecha Drone',
    isSynthetic: true,
    stats: {
      structure: 60,
      current_structure: 45
    }
  };
  const tokenSynthChar = tokenToFolioCharacter(synthToken);
  assert.equal(tokenSynthChar.current_structure, 45);
  assert.equal(tokenSynthChar.structure, 60);
  assert.equal(tokenSynthChar.current_health, null);
  assert.equal(tokenSynthChar.current_vitality, null);
});

test('Shared Schemas: extractHeroStats strictly enforces synthetic structure vs biological health/vitality', () => {
  const bioHero = {
    id: 'hero-bio',
    'char-name': 'Dr. Aris',
    'char-species': 'Cyborg / Enhanced Human', // not pure synthetic
    health: 32,
    vitality: 28,
    current_health: 30,
    current_vitality: 20
  };
  const bioStats = extractHeroStats(bioHero);
  assert.equal(bioStats.isSynthetic, false);
  assert.equal(bioStats.maxHealth, 32);
  assert.equal(bioStats.currentHealth, 30);
  assert.equal(bioStats.maxVitality, 28);
  assert.equal(bioStats.currentVitality, 20);
  assert.equal(bioStats.maxStructure, null);
  assert.equal(bioStats.currentStructure, null);
  assert.equal(bioStats.structure, null);

  const synthHero = {
    id: 'hero-synth',
    'char-name': 'Apex Construct',
    'char-species': 'Mekan',
    structure: 80,
    current_structure: 65
  };
  const synthStats = extractHeroStats(synthHero);
  assert.equal(synthStats.isSynthetic, true);
  assert.equal(synthStats.maxStructure, 80);
  assert.equal(synthStats.currentStructure, 65);
  assert.equal(synthStats.maxHealth, null);
  assert.equal(synthStats.currentHealth, null);
  assert.equal(synthStats.maxVitality, null);
  assert.equal(synthStats.currentVitality, null);
  assert.equal(synthStats.health, null);
  assert.equal(synthStats.vitality, null);
});

test('Persona Lifecycle: Setting / Locking for VTT sets tactical play flags', () => {
  const initial = characterSchema.parse({
    'char-name': 'Spectre One',
    folio_phase: 'development',
    is_locked: false,
    is_ready_for_vtt: false
  });

  assert.equal(initial.folio_phase, 'development');
  assert.equal(initial.is_locked, false);
  assert.equal(initial.is_ready_for_vtt, false);

  // Lock Persona into Tactical Play mode
  const locked = characterSchema.parse({
    ...initial,
    folio_phase: 'locked',
    is_locked: true,
    is_ready_for_vtt: true,
    locked_at: new Date().toISOString()
  });

  assert.equal(locked.folio_phase, 'locked');
  assert.equal(locked.is_locked, true);
  assert.equal(locked.is_ready_for_vtt, true);
  assert.ok(locked.locked_at !== null);

  // Unlock back to Builder Mode
  const unlocked = characterSchema.parse({
    ...locked,
    folio_phase: 'development',
    is_locked: false,
    is_ready_for_vtt: false,
    locked_at: null
  });

  assert.equal(unlocked.folio_phase, 'development');
  assert.equal(unlocked.is_locked, false);
  assert.equal(unlocked.is_ready_for_vtt, false);
});
