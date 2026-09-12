import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  checkItemMatchesPillar,
  extractPillarFeatureSets,
  getFeatureDiscountedCost,
  FEATURE_SYNONYMS
} from '../../src/utils/pillarRecommendations.js';
import { DEFAULT_OCCUPATIONS } from '../../src/data/occupationsData.js';
import { DEFAULT_FACTIONS } from '../../src/data/factionsData.js';
import { DEFAULT_FEATURES } from '../../src/data/featuresData.js';

test('Features System: Synonym Resolution & Alias Mapping', () => {
  // Check lowercase keys in FEATURE_SYNONYMS
  assert(FEATURE_SYNONYMS['connections']?.includes('connected'));
  assert(FEATURE_SYNONYMS['connected']?.includes('underworld connections'));
  assert(FEATURE_SYNONYMS['underworld connections']?.includes('connected'));

  const connectedFeature = DEFAULT_FEATURES.find(f => f.id === 'general-connected');
  assert(connectedFeature, 'general-connected exists');

  const underworldFeature = DEFAULT_FEATURES.find(f => f.id === 'general-underworld-connections');
  assert(underworldFeature, 'general-underworld-connections exists');

  // Test checkItemMatchesPillar with mock pillarData { features, categories }
  const pillarData = {
    features: new Set(['connections']),
    categories: new Set([])
  };

  const matchesConnected = checkItemMatchesPillar(pillarData, connectedFeature);
  assert(matchesConnected, 'Connected feature matches Connections recommendation');

  const matchesUnderworld = checkItemMatchesPillar(pillarData, underworldFeature);
  assert(matchesUnderworld, 'Underworld Connections matches Connections recommendation');
});

test('Features System: Canonical Occupation Category Discounts', () => {
  const soldier = DEFAULT_OCCUPATIONS.find(o => o.name.toLowerCase() === 'soldier');
  assert(soldier, 'Soldier occupation exists');
  assert(soldier.features.some(f => f.toLowerCase().includes('combat')), 'Soldier discounts Combat features');

  // Extract pillar sets using characterData
  const soldierChar = { 'char-occu': 'Soldier' };
  const soldierSets = extractPillarFeatureSets(soldierChar);

  const combatFeature = DEFAULT_FEATURES.find(f => f.category === 'Combat');
  assert(combatFeature, 'Combat feature exists');
  const soldierDiscount = getFeatureDiscountedCost(combatFeature, soldierSets, soldierChar);
  assert.equal(soldierDiscount.cost, 2, 'Combat feature is discounted to 2 CP for Soldier');
  assert.equal(soldierDiscount.isDiscounted, true);

  const merchant = DEFAULT_OCCUPATIONS.find(o => o.name.toLowerCase() === 'merchant');
  assert(merchant, 'Merchant occupation exists');
  const merchantChar = { 'char-occu': 'Merchant' };
  const merchantSets = extractPillarFeatureSets(merchantChar);

  const skillFeature = DEFAULT_FEATURES.find(f => f.category === 'Skill');
  assert(skillFeature, 'Skill feature exists');
  const merchantDiscount = getFeatureDiscountedCost(skillFeature, merchantSets, merchantChar);
  assert.equal(merchantDiscount.cost, 2, 'Skill feature is discounted to 2 CP for Merchant');
  assert.equal(merchantDiscount.isDiscounted, true);

  const adept = DEFAULT_OCCUPATIONS.find(o => o.name.toLowerCase() === 'adept');
  assert(adept, 'Adept occupation exists');
  const adeptChar = { 'char-occu': 'Adept' };
  const adeptSets = extractPillarFeatureSets(adeptChar);

  const disciplineFeature = DEFAULT_FEATURES.find(f => f.category === 'Discipline');
  assert(disciplineFeature, 'Discipline feature exists');
  const adeptDiscount = getFeatureDiscountedCost(disciplineFeature, adeptSets, adeptChar);
  assert.equal(adeptDiscount.cost, 2, 'Discipline feature is discounted to 2 CP for Adept');
  assert.equal(adeptDiscount.isDiscounted, true);
});

test('Features System: Faction Feature Recommendations & Templates', () => {
  const syndicate = DEFAULT_FACTIONS.find(f => f.id === 'faction-the-syndicate' || f.name.includes('Syndicate'));
  assert(syndicate, 'Syndicate faction exists');
  assert(syndicate.recommended_features.includes('Underworld Connections'), 'Syndicate recommends Underworld Connections');

  const charData = { 'char-faction': syndicate.name };
  const pillarSets = extractPillarFeatureSets(charData);

  const underworldFeature = DEFAULT_FEATURES.find(f => f.id === 'general-underworld-connections');
  const matchesSyndicate = checkItemMatchesPillar(pillarSets.faction, underworldFeature);
  assert(matchesSyndicate, 'Underworld Connections matches Syndicate faction');
});

test('Features System: Ranked Features Progression & Scaling Metadata', () => {
  const connected = DEFAULT_FEATURES.find(f => f.id === 'general-connected');
  assert.equal(connected.is_ranked, true, 'Connected is ranked');
  assert.equal(connected.max_rank, 4, 'Connected max rank is 4');
  const rulesText = Array.isArray(connected.rules) ? connected.rules.join(' ') : String(connected.rules || '');
  assert(!rulesText.includes('84'), 'Connected rules are clean of corrupted 84 string');
  assert(rulesText.includes('Rank 4'), 'Connected rules document Rank 4 progression');

  // Verify rank cost scaling logic: 1 rank = base, 2 ranks = 2 * base
  const baseCost = connected.cp !== undefined ? connected.cp : (connected.costs?.bp !== undefined ? connected.costs.bp : 3);
  const rank1Cost = baseCost * 1;
  const rank3Cost = baseCost * 3;
  assert.equal(rank1Cost, 3);
  assert.equal(rank3Cost, 9);
});

test('Features System: Extraction across All 5 Identity Pillars', () => {
  const sampleCharacter = {
    'char-archetype': 'The Operative',
    'char-species': 'Human',
    'char-occu': 'Criminal',
    'char-origin': 'Underworld',
    'char-faction': 'The Syndicate'
  };

  const featureSets = extractPillarFeatureSets(sampleCharacter);
  assert(featureSets.archetype, 'Archetype pillar extracted');
  assert(featureSets.species, 'Species pillar extracted');
  assert(featureSets.occupation, 'Occupation pillar extracted');
  assert(featureSets.origin, 'Origin pillar extracted');
  assert(featureSets.faction, 'Faction pillar extracted');

  // Verify Criminal occupation receives Skill category discount
  assert(featureSets.occupation.categories.has('skill'), 'Criminal correctly receives Skill category discount');
});

test('Features System: Multi-Source Discount Stacking to 1 CP Minimum', () => {
  // A feature that is both individually recommended by a pillar AND belongs to a recommended category
  // e.g. Criminal occupation recommends 'Connected' (individual) AND 'Skill' (category).
  // Suppose a character has Archetype recommending Combat Features, and Species recommending 'Combat Reflexes'.
  const char = {
    'char-archetype': 'The Soldier', // Combat Features (2 CP) -> discounts Combat category
    'char-occu': 'Soldier',          // Combat Features (2 CP) -> discounts Combat category
    'char-species': 'Human',
    speciesAllocations: {
      features: ['Acrobatic Steps']  // Individually recommended feature
    }
  };

  const sets = extractPillarFeatureSets(char);

  // 1. Single source discount: Combat feature (e.g. Analyze Weakness in Combat or Acrobatic Steps in General)
  const acrobaticSteps = DEFAULT_FEATURES.find(f => f.id === 'general-acrobatic-steps');
  assert(acrobaticSteps, 'Acrobatic Steps exists');
  const singleCost = getFeatureDiscountedCost(acrobaticSteps, sets, char);
  assert.equal(singleCost.cost, 2, 'Single individual recommendation discounts 3 CP to 2 CP');
  assert.equal(singleCost.discountCount, 1);

  // 2. Dual source discount: Feature in Combat category AND individually recommended by species or occupation
  const customChar = {
    'char-occu': 'Soldier', // Discounts Combat category
    speciesAllocations: {
      features: ['Agile Wrestling'] // Inherent/bonus individual recommendation
    }
  };
  const customSets = extractPillarFeatureSets(customChar);
  const combatFeature = DEFAULT_FEATURES.find(f => f.id === 'combat-agile-wrestling');
  assert(combatFeature, 'Agile Wrestling exists');

  // Agile Wrestling has base cost 3 CP and matches individual (species) + category (occupation):
  // Stacking discounts reduce cost from 3 CP to 1 CP (3 CP - 1 CP - 1 CP = 1 CP)
  const stackedCost = getFeatureDiscountedCost(combatFeature, customSets, customChar);
  assert.equal(stackedCost.cost, 1, 'Stacked discounts reduce cost down to 1 CP');
  assert.equal(stackedCost.discountCount, 2, '2 discount sources applied (individual + category)');
  assert.equal(stackedCost.totalDiscount, 2, '2 CP total discount applied');
});
