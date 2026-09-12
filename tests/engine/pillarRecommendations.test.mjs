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
  getFeatureDiscountedCost,
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

test('Pillar Recommendations: Feature cost discount calculation (getFeatureDiscountedCost)', () => {
  const mockSets = {
    archetype: {
      features: new Set(['combat reflexes']),
      categories: new Set(['combat']),
      source: 'The Vanguard'
    },
    species: {
      features: new Set(['darksight']),
      categories: new Set([]),
      source: 'Nocturnal'
    },
    occupation: {
      features: new Set([]),
      categories: new Set(['social']),
      source: 'Envoy'
    },
    origin: {
      features: new Set([]),
      categories: new Set([]),
      source: 'Homeworld'
    },
    faction: {
      features: new Set([]),
      categories: new Set([]),
      source: 'Guild'
    }
  };

  const mockChar = {
    'char-archetype': 'The Vanguard',
    'char-species': 'Nocturnal',
    'char-occu': 'Envoy'
  };

  // 1. Non-recommended feature: standard 3 CP, isDiscounted = false
  const standardFeat = { name: 'Engineering Whiz', category: 'General', cp: 3 };
  const standardCost = getFeatureDiscountedCost(standardFeat, mockSets, mockChar);
  assert.equal(standardCost.cost, 3);
  assert.equal(standardCost.baseCost, 3);
  assert.equal(standardCost.isDiscounted, false);
  assert.equal(standardCost.recommendations.length, 0);

  // 2. Individually recommended feature: 3 CP - 1 CP = 2 CP, isDiscounted = true
  const directFeat = { name: 'Darksight', category: 'Physical', cp: 3 };
  const directCost = getFeatureDiscountedCost(directFeat, mockSets, mockChar);
  assert.equal(directCost.cost, 2);
  assert.equal(directCost.baseCost, 3);
  assert.equal(directCost.isDiscounted, true);
  assert.ok(directCost.recommendations.some(r => r.id === 'species'));

  // 3. Category recommended feature: 'Combat' category matches Archetype -> 2 CP
  const catFeat = { name: 'Power Strike', category: 'Combat' }; // default base 3 CP
  const catCost = getFeatureDiscountedCost(catFeat, mockSets, mockChar);
  assert.equal(catCost.cost, 2);
  assert.equal(catCost.baseCost, 3);
  assert.equal(catCost.isDiscounted, true);
  assert.ok(catCost.recommendations.some(r => r.id === 'archetype'));

  // 4. Category recommended feature: 'Social' category matches Occupation -> 2 CP
  const socialFeat = { name: 'Silver Tongue', category: 'Social' };
  const socialCost = getFeatureDiscountedCost(socialFeat, mockSets, mockChar);
  assert.equal(socialCost.cost, 2);
  assert.equal(socialCost.baseCost, 3);
  assert.equal(socialCost.isDiscounted, true);
  assert.ok(socialCost.recommendations.some(r => r.id === 'occupation'));

  // 5. Minimum 1 CP boundary check: feature with baseCost = 1 CP should not be reduced below 1 CP
  const cheapFeat = { name: 'Combat Reflexes', category: 'Combat', cp: 1 };
  const cheapCost = getFeatureDiscountedCost(cheapFeat, mockSets, mockChar);
  assert.equal(cheapCost.cost, 1);
  assert.equal(cheapCost.baseCost, 1);
  assert.equal(cheapCost.isDiscounted, false); // No discount possible since already at 1 CP minimum

  // 6. Cumulative multi-source discount: Feature recommended by both individual knack AND recommended category
  // e.g. Combat Reflexes (Base 3 CP) recommended individually by Archetype AND in recommended Combat category -> 3 CP - 2 CP = 1 CP
  const stackedFeat = { name: 'Combat Reflexes', category: 'Combat', cp: 3 };
  const stackedCost = getFeatureDiscountedCost(stackedFeat, mockSets, mockChar);
  assert.equal(stackedCost.cost, 1, 'Stacked discounts reduce 3 CP feature to 1 CP');
  assert.equal(stackedCost.baseCost, 3);
  assert.equal(stackedCost.discountCount, 2, 'Two discounts applied (individual + category)');
  assert.equal(stackedCost.isDiscounted, true);

  // 7. Multi-pillar stacking: Recommended by Archetype (Combat) and Occupation (individually or by category)
  const multiPillarSets = {
    ...mockSets,
    species: {
      features: new Set(['power strike']),
      categories: new Set([]),
      source: 'Warrior Species'
    }
  };
  // Power Strike is in Combat (Archetype) AND recommended individually by Species -> 3 CP - 2 CP = 1 CP
  const multiPillarFeat = { name: 'Power Strike', category: 'Combat', cp: 3 };
  const multiPillarCost = getFeatureDiscountedCost(multiPillarFeat, multiPillarSets, mockChar);
  assert.equal(multiPillarCost.cost, 1, 'Multi-pillar discounts stack down to 1 CP');
  assert.equal(multiPillarCost.discountCount, 2);
});

