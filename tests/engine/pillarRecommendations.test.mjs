/**
 * @file pillarRecommendations.test.mjs
 * @description Unit tests for 5 Identity Pillars recommendations for features and feature groups.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractPillarFeatureSets,
  checkItemMatchesPillar,
  getPillarFeatureRecommendations,
  PILLAR_THEMES
} from '../../src/utils/pillarRecommendations.js';

test('Pillar Themes: All 5 Identity Pillars defined with correct canonical colors', () => {
  assert.equal(PILLAR_THEMES.archetype.colorHex, '#f59e0b'); // Amber
  assert.equal(PILLAR_THEMES.species.colorHex, '#22d3ee');   // Cyan
  assert.equal(PILLAR_THEMES.occupation.colorHex, '#38bdf8'); // Sky
  assert.equal(PILLAR_THEMES.origin.colorHex, '#34d399');     // Emerald
  assert.equal(PILLAR_THEMES.faction.colorHex, '#c084fc');    // Purple
});

test('Pillar Recommendations: Feature extraction across 5 pillars for a sample character', () => {
  const sampleChar = {
    'char-archetype': 'The Armorer', // signature: "Crafters Insight", "Master Vocation skillsman"
    'char-species': 'Celestine',     // inherent: "trait-awakened-arcane", "trait-long-lived-600-years", bonus: ["Acute Senses", "Agile Maneuvers", "Combat Expertise"]
    'char-occu': 'Adept',            // traits: ["trait-enhanced-abilities", "trait-heightened-senses", "trait-martial-arts-mastery"]
    'char-origin': 'Agri-World',     // traits: ["trait-animal-husbandry", "trait-botanical-knowledge"]
    'char-faction': 'Impyrium',
    speciesAllocations: {
      features: ['Darksight']
    },
    originAllocations: {
      features: ['Green Thumb']
    }
  };

  const sets = extractPillarFeatureSets(sampleChar);
  assert.ok(sets.archetype.features.size > 0, 'Archetype features should be populated');
  assert.ok(sets.species.features.size > 0, 'Species features should be populated');
  assert.ok(sets.occupation.features.size > 0, 'Occupation features should be populated');
  assert.ok(sets.origin.features.size > 0, 'Origin features should be populated');

  // Direct feature match: Archetype
  const craftersInsightRecs = getPillarFeatureRecommendations(
    { name: 'Crafters Insight', category: 'General' },
    sets,
    sampleChar
  );
  assert.ok(craftersInsightRecs.some(r => r.id === 'archetype'), 'Crafters Insight should be recommended by Archetype');

  // Direct feature match: Species bonus choice
  const darksightRecs = getPillarFeatureRecommendations(
    { name: 'Darksight', category: 'General' },
    sets,
    sampleChar
  );
  assert.ok(darksightRecs.some(r => r.id === 'species'), 'Darksight should be recommended by Species');

  // Direct feature match: Origin allocated feature
  const greenThumbRecs = getPillarFeatureRecommendations(
    { name: 'Green Thumb', category: 'General' },
    sets,
    sampleChar
  );
  assert.ok(greenThumbRecs.some(r => r.id === 'origin'), 'Green Thumb should be recommended by Origin');
});

test('Pillar Recommendations: Feature group and category matching', () => {
  const mockSets = {
    archetype: {
      features: new Set(['combat reflexes']),
      categories: new Set(['combat']),
      source: 'The Vanguard'
    },
    species: {
      features: new Set(['acute vision']),
      categories: new Set(['acute senses']),
      source: 'Felis'
    },
    occupation: {
      features: new Set(['silver tongue']),
      categories: new Set(['social']),
      source: 'Diplomat'
    },
    origin: {
      features: new Set(['tough hide']),
      categories: new Set(['ability']),
      source: 'High-G World'
    },
    faction: {
      features: new Set(['covert network']),
      categories: new Set(['general']),
      source: 'Shadow Syndicate'
    }
  };

  const mockChar = {
    'char-archetype': 'The Vanguard',
    'char-species': 'Felis',
    'char-occu': 'Diplomat',
    'char-origin': 'High-G World',
    'char-faction': 'Shadow Syndicate'
  };

  // 1. Group header string check (e.g. "Combat Features" or "Combat")
  const combatGroupRecs = getPillarFeatureRecommendations('Combat Features', mockSets, mockChar);
  assert.ok(combatGroupRecs.some(r => r.id === 'archetype'), 'Combat Features group should be recommended by Archetype');

  // 2. Category Group object (e.g. from FEATURE_CATEGORY_ITEMS)
  const catGroupObj = { id: 'cat_combat_features', name: 'Combat Features', type: 'Category Group' };
  const catObjRecs = getPillarFeatureRecommendations(catGroupObj, mockSets, mockChar);
  assert.ok(catObjRecs.some(r => r.id === 'archetype'), 'Category Group object should match Archetype');

  // 3. Feature belonging to recommended category
  const genericCombatFeat = { name: 'Heavy Strike', category: 'Combat' };
  const featRecs = getPillarFeatureRecommendations(genericCombatFeat, mockSets, mockChar);
  assert.ok(featRecs.some(r => r.id === 'archetype'), 'Combat feature should match Archetype category recommendation');

  // 4. Acute Senses group
  const acuteFeat = { name: 'Acute Hearing', category: 'General' };
  const acuteRecs = getPillarFeatureRecommendations(acuteFeat, mockSets, mockChar);
  assert.ok(acuteRecs.some(r => r.id === 'species'), 'Acute Hearing should match Species acute senses line');
});
