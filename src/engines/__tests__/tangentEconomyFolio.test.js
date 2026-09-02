import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  formatGrantedCost,
  calculateFullSpeciesCost,
  calculateSpeciesBP
} from '../tangentEntityEngines.js';
import { applySpeciesTransition } from '../tangentIdentityEngine.js';
import { DEFAULT_SPECIES } from '../../data/speciesData.js';

describe('Tangent SF RP — Folio CP Economy & Species Package Asset Accounting', () => {

  describe('formatGrantedCost Utility', () => {
    it('formats package-granted assets as "0 [X] CP" by default when used cost is 0', () => {
      assert.strictEqual(formatGrantedCost(0, 3), '0 [3] CP');
      assert.strictEqual(formatGrantedCost(0, 5, 'CP'), '0 [5] CP');
      assert.strictEqual(formatGrantedCost(0, 1, 'CP'), '0 [1] CP');
      assert.strictEqual(formatGrantedCost(0, 4, 'CP'), '0 [4] CP');
      assert.strictEqual(formatGrantedCost(0, 5, 'BP'), '0 [5] BP');
    });

    it('formats package-granted disadvantages as "0 [-X] CP"', () => {
      assert.strictEqual(formatGrantedCost(0, -3), '0 [-3] CP');
      assert.strictEqual(formatGrantedCost(0, -3, 'CP'), '0 [-3] CP');
      assert.strictEqual(formatGrantedCost(0, -2, 'BP'), '0 [-2] BP');
    });

    it('formats standard non-package assets with their exact values', () => {
      assert.strictEqual(formatGrantedCost(5, 5), '5 CP');
      assert.strictEqual(formatGrantedCost(5, 5, 'CP'), '5 CP');
      assert.strictEqual(formatGrantedCost(0, 0), '0 CP');
      assert.strictEqual(formatGrantedCost(0, 0, 'CP'), '0 CP');
      assert.strictEqual(formatGrantedCost(0, 0, 'BP'), '0 BP');
      assert.strictEqual(formatGrantedCost(-3, 3, 'CP'), '-3 CP');
    });

    it('handles empty unit string gracefully', () => {
      assert.strictEqual(formatGrantedCost(0, 3, ''), '0 [3]');
      assert.strictEqual(formatGrantedCost(5, 5, ''), '5');
      assert.strictEqual(formatGrantedCost(0, 0, ''), '0');
    });
  });

  describe('Species Package Inclusivity & Economy Accounting', () => {
    it('resolves Celestine (Alterian) 26 CP species package with itemized components', () => {
      const celestine = calculateFullSpeciesCost('Celestine (Alterian)');
      assert.strictEqual(celestine.totalCost, 26);
      assert.ok(celestine.itemizedList.length > 0);

      // Inherent attributes
      assert.ok(celestine.itemized.attributes.some(a => a.attr === 'AGI' && a.value === 1));
      assert.ok(celestine.itemized.attributes.some(a => a.attr === 'INT' && a.value === 1));

      // Traits / Inherent features
      assert.ok(celestine.itemized.traits.length > 0);
    });

    it('attaches standaloneCp to inherent features during species transition with cp: 0', () => {
      const initialChar = {
        'char-species': 'Human (Base)',
        features: [],
        traits: [],
        disadvantages: []
      };

      const updatedChar = applySpeciesTransition(initialChar, 'Celestine (Alterian)');
      assert.strictEqual(updatedChar['char-species'], 'Celestine (Alterian)');
      
      // Inherent features must have cp === 0 and a valid standaloneCp > 0
      const inherentFeats = updatedChar.features.filter(f => f.source === 'species' || f.category === 'Species Inherent');
      assert.ok(inherentFeats.length > 0);
      inherentFeats.forEach(feat => {
        assert.strictEqual(feat.cp, 0, `Feature ${feat.name} must have cp = 0`);
        assert.ok(feat.standaloneCp > 0, `Feature ${feat.name} must have standaloneCp > 0`);
      });
    });

    it('verifies 0 CP tracking and no double-charging in an economy calculation simulation', () => {
      const char = {
        'starting-cp': 150,
        'char-species': 'Celestine (Alterian)',
        'char-archetype': 'Agent',
        'char-occu': 'Bounty Hunter',
        'char-origin': 'Frontier Colony',
        'char-faction': 'Independent',
        'attr-strength': 1, // 5 CP
        'attr-agility': 2,   // 10 CP (plus species inherent +1)
        'attr-stamina': 0,   // 0 CP
        'attr-intellect': 1, // 5 CP (plus species inherent +1)
        'attr-wisdom': 0,    // 0 CP
        'attr-charisma': 0,  // 0 CP
        'move-walk': 30,     // 0 CP
        'features': [
          { name: 'Awakened Arcane', source: 'species', category: 'Species Inherent', cp: 0, standaloneCp: 3 },
          { name: 'Long Lived', source: 'species', category: 'Species Inherent', cp: 0, standaloneCp: 1 },
          { name: 'Combat Reflexes', cp: 3 } // Character purchased
        ],
        'traits': [
          { name: 'Night Vision', source: 'species', category: 'Species Inherent', cp: 0, bp: 1, standaloneCp: 1 }
        ],
        'hindrances': [
          { name: 'Impulsive', cp: 3 } // Character chosen refund
        ],
        'skill-firearms-rank': 3, // 3 CP
        'gear': [
          { name: 'Standard Communicator', cp: 0 } // 0 CP gear
        ]
      };

      // Calculate Economy simulation
      const spCost = calculateFullSpeciesCost(char['char-species']);
      const speciesPackageCost = spCost.totalCost; // 26 CP
      const primaryAttrCost = (1 + 2 + 0 + 1 + 0 + 0) * 5; // 20 CP
      const purchasedFeaturesCost = 3; // Combat Reflexes
      const purchasedTraitsCost = 0;
      const skillCost = 3; // Firearms rank 3
      const hindranceRefund = 3; // Impulsive

      const expectedSpent = speciesPackageCost + primaryAttrCost + purchasedFeaturesCost + purchasedTraitsCost + skillCost - hindranceRefund;
      // 26 + 20 + 3 + 0 + 3 - 3 = 49 CP

      assert.strictEqual(expectedSpent, 49);

      // Verify that all species assets are recorded with costVal === 0 and "0 [X]" cost
      const speciesFeat = char.features[0];
      assert.strictEqual(speciesFeat.cp, 0);
      assert.strictEqual(formatGrantedCost(0, speciesFeat.standaloneCp, 'CP'), '0 [3] CP');

      const speciesTrait = char.traits[0];
      assert.strictEqual(speciesTrait.cp, 0);
      assert.strictEqual(formatGrantedCost(0, speciesTrait.bp, 'CP'), '0 [1] CP');

      // Verify 0 CP gear is tracked
      const gear = char.gear[0];
      assert.strictEqual(gear.cp, 0);
      assert.strictEqual(formatGrantedCost(0, 0, 'CP'), '0 CP');
    });
  });

});
