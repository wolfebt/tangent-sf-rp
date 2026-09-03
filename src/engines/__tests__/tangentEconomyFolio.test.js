import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  formatGrantedCost,
  calculateFullSpeciesCost,
  calculateSpeciesBP,
  computeEconomyBreakdown
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

  describe('Identity Selection Pools & Supplemental Packages (0 CP Exemptions)', () => {
    it('does not charge CP for Occupation, Origin, or Faction identity packages', () => {
      const char = {
        'starting-cp': 150,
        'char-occu': 'Bounty Hunter',
        'char-origin': 'Frontier World',
        'char-faction': 'Syndicate Compact'
      };

      const breakdown = computeEconomyBreakdown(char);
      // Occupation, Origin, Faction are supplemental (0 CP each)
      assert.strictEqual(breakdown.spentCP, 0);
      assert.strictEqual(breakdown.remainingCP, 150);

      const occuItem = breakdown.itemizedList.find(i => i.category === 'Occupation');
      assert.ok(occuItem);
      assert.strictEqual(occuItem.costVal, 0);
      assert.strictEqual(occuItem.cost, '0 CP');

      const originItem = breakdown.itemizedList.find(i => i.category === 'Origin');
      assert.ok(originItem);
      assert.strictEqual(originItem.costVal, 0);
      assert.strictEqual(originItem.cost, '0 CP');

      const factionItem = breakdown.itemizedList.find(i => i.category === 'Faction');
      assert.ok(factionItem);
      assert.strictEqual(factionItem.costVal, 0);
      assert.strictEqual(factionItem.cost, '0 CP');
    });

    it('does not charge CP for attribute modifiers allocated from identity selection pools', () => {
      const char = {
        'starting-cp': 150,
        // Character has 1 point in Strength and 1 in Agility
        'attr-strength': 1,
        'attr-agility': 1,
        // Both points came from selection pools (Species and Occupation)
        'speciesAllocations': {
          attributes: {
            'attr-strength': 1
          }
        },
        'occuAllocations': {
          attributes: {
            'attr-agility': 1
          }
        }
      };

      const breakdown = computeEconomyBreakdown(char);
      // Both points are granted by pools, so primaryAttrCost must be 0!
      assert.strictEqual(breakdown.primaryAttrCost, 0);
      assert.strictEqual(breakdown.spentCP, 0);
      assert.strictEqual(breakdown.remainingCP, 150);

      // Verify itemized list has granted attribute modifiers with 0 CP cost
      const strGranted = breakdown.itemizedList.find(i => i.category === 'Granted Attr Mod' && i.item.includes('Strength'));
      assert.ok(strGranted);
      assert.strictEqual(strGranted.costVal, 0);
      assert.strictEqual(strGranted.cost, '0 [5] CP');

      const agiGranted = breakdown.itemizedList.find(i => i.category === 'Granted Attr Mod' && i.item.includes('Agility'));
      assert.ok(agiGranted);
      assert.strictEqual(agiGranted.costVal, 0);
      assert.strictEqual(agiGranted.cost, '0 [5] CP');
    });

    it('only charges CP for attribute points purchased BEYOND pool allocations', () => {
      const char = {
        'starting-cp': 150,
        // Total 3 Strength (1 from pool + 2 purchased via Point Buy)
        'attr-strength': 3,
        'speciesAllocations': {
          attributes: {
            'attr-strength': 1
          }
        }
      };

      const breakdown = computeEconomyBreakdown(char);
      // 1 granted = 0 CP; 2 purchased = 2 * 5 = 10 CP
      assert.strictEqual(breakdown.primaryAttrCost, 10);
      assert.strictEqual(breakdown.spentCP, 10);
      assert.strictEqual(breakdown.remainingCP, 140);

      const strPurchased = breakdown.itemizedList.find(i => i.category === 'Primary Attr' && i.item.includes('Strength'));
      assert.ok(strPurchased);
      assert.strictEqual(strPurchased.costVal, 10);
      assert.strictEqual(strPurchased.cost, '10 CP');
      assert.strictEqual(strPurchased.val, '2 Purchased Points');
    });

    it('does not charge CP for skill ranks allocated from identity pools (up to 60 ranks total across packages)', () => {
      const char = {
        'starting-cp': 150,
        // 5 ranks in Athletics, 5 in Stealth, 5 in Persuasion, 5 in Navigation
        'skill-athletics-rank': 5,
        'skill-stealth-rank': 5,
        'skill-persuasion-rank': 5,
        'skill-navigation-rank': 5,
        'occuAllocations': {
          skills: {
            athletics: 5
          }
        },
        'originAllocations': {
          skills: {
            stealth: 5
          }
        },
        'factionAllocations': {
          skills: {
            persuasion: 5
          }
        },
        'speciesAllocations': {
          skills: {
            navigation: 5
          }
        }
      };

      const breakdown = computeEconomyBreakdown(char);
      // All 20 ranks across the 4 skills were granted from selection pools: 0 CP charged
      assert.strictEqual(breakdown.skillRanksCost, 0);
      assert.strictEqual(breakdown.spentCP, 0);
      assert.strictEqual(breakdown.remainingCP, 150);

      // Verify itemized entries
      const athGranted = breakdown.itemizedList.find(i => i.category === 'Occupation Granted Skill' && i.item.includes('athletics'));
      assert.ok(athGranted);
      assert.strictEqual(athGranted.costVal, 0);
      assert.strictEqual(athGranted.cost, '0 [5] CP');
    });

    it('charges only for skill ranks purchased beyond pool granted ranks', () => {
      const char = {
        'starting-cp': 150,
        // Firearms: 7 ranks total (5 granted by occupation, 2 purchased by point buy)
        'skill-firearms-rank': 7,
        'skill-firearms-name': 'Firearms',
        'occuAllocations': {
          skills: {
            firearms: 5
          }
        }
      };

      const breakdown = computeEconomyBreakdown(char);
      // 5 ranks granted = 0 CP; 2 purchased = 2 CP
      assert.strictEqual(breakdown.skillRanksCost, 2);
      assert.strictEqual(breakdown.spentCP, 2);
      assert.strictEqual(breakdown.remainingCP, 148);

      const purchasedFirearms = breakdown.itemizedList.find(i => i.category === 'Skill Rank' && i.item === 'Firearms');
      assert.ok(purchasedFirearms);
      assert.strictEqual(purchasedFirearms.costVal, 2);
      assert.strictEqual(purchasedFirearms.cost, '2 CP');
      assert.strictEqual(purchasedFirearms.val, '2 Purchased Ranks');
    });

    it('does not charge CP for traits and features selected from identity pools', () => {
      const char = {
        'starting-cp': 150,
        'traits': [
          { name: 'Cold Blooded', category: 'Occupation Trait', source: 'occupation', bp: 0, standaloneBp: 1 },
          { name: 'Nomadic Heritage', category: 'Origin Trait', source: 'origin', bp: 0, standaloneBp: 1 },
          { name: 'Syndicate Loyalty', category: 'Faction Trait', source: 'faction', bp: 0, standaloneBp: 1 }
        ],
        'features': [
          { name: 'Underworld Contact', category: 'Occupation Feature', source: 'occupation', cp: 0, standaloneCp: 3 },
          { name: 'Faction Privilege', category: 'Faction Feature', source: 'faction', cp: 0, standaloneCp: 3 }
        ],
        'occuAllocations': {
          traits: ['Cold Blooded'],
          features: ['Underworld Contact']
        },
        'originAllocations': {
          traits: ['Nomadic Heritage']
        },
        'factionAllocations': {
          traits: ['Syndicate Loyalty'],
          features: ['Faction Privilege']
        }
      };

      const breakdown = computeEconomyBreakdown(char);
      assert.strictEqual(breakdown.traitsCost, 0);
      assert.strictEqual(breakdown.featuresCost, 0);
      assert.strictEqual(breakdown.spentCP, 0);
      assert.strictEqual(breakdown.remainingCP, 150);

      // Verify itemized accounting
      const coldBlooded = breakdown.itemizedList.find(i => i.item === 'Cold Blooded');
      assert.ok(coldBlooded);
      assert.strictEqual(coldBlooded.costVal, 0);
      assert.strictEqual(coldBlooded.cost, '0 [1] CP');

      const contact = breakdown.itemizedList.find(i => i.item === 'Underworld Contact');
      assert.ok(contact);
      assert.strictEqual(contact.costVal, 0);
      assert.strictEqual(contact.cost, '0 [3] CP');
    });

    it('allows Faction hindrances to effect the character primary CP pool with a refund to balance additional purchases', () => {
      // Scenario A: Unspent refund inherits into primary pool (150 + 3 = 153 CP available)
      const charWithHindrance = {
        'starting-cp': 150,
        'char-faction': 'Syndicate Compact',
        'disadvantages': [
          {
            name: 'Blood Debt',
            category: 'Faction Hindrance',
            source: 'faction',
            bp: 3,
            cp: 3,
            refundBP: 3
          }
        ]
      };

      const breakdownA = computeEconomyBreakdown(charWithHindrance);
      assert.strictEqual(breakdownA.disadvantageRefund, 3);
      assert.strictEqual(breakdownA.spentCP, -3);
      assert.strictEqual(breakdownA.remainingCP, 153);

      const itemA = breakdownA.itemizedList.find(i => i.item === 'Blood Debt');
      assert.ok(itemA);
      assert.strictEqual(itemA.category, 'Faction Hindrance');
      assert.strictEqual(itemA.costVal, -3);
      assert.strictEqual(itemA.cost, '-3 CP');

      // Scenario B: Balances out with an additional purchased feature (3 CP feature - 3 CP hindrance = 0 net spent CP)
      const charBalanced = {
        ...charWithHindrance,
        'features': [
          {
            name: 'Heavy Weapons Training',
            category: 'General Feature',
            source: 'general',
            cp: 3
          }
        ]
      };

      const breakdownB = computeEconomyBreakdown(charBalanced);
      assert.strictEqual(breakdownB.featuresCost, 3);
      assert.strictEqual(breakdownB.disadvantageRefund, 3);
      assert.strictEqual(breakdownB.spentCP, 0);
      assert.strictEqual(breakdownB.remainingCP, 150);
    });
  });

  describe('Technology Level (TL) Economy Accounting', () => {
    it('treats TL3 as baseline with 0 CP cost', () => {
      const char = { 'starting-cp': 150, 'tech-level': 3 };
      const breakdown = computeEconomyBreakdown(char);
      assert.strictEqual(breakdown.techLevelCost, 0);
      assert.strictEqual(breakdown.spentCP, 0);
      assert.strictEqual(breakdown.remainingCP, 150);

      const item = breakdown.itemizedList.find(i => i.category === 'Technology Level');
      assert.ok(item);
      assert.strictEqual(item.costVal, 0);
      assert.strictEqual(item.cost, '0 CP');
    });

    it('charges +10 CP for TL4 (Advanced)', () => {
      const char = { 'starting-cp': 150, 'tech-level': 4 };
      const breakdown = computeEconomyBreakdown(char);
      assert.strictEqual(breakdown.techLevelCost, 10);
      assert.strictEqual(breakdown.spentCP, 10);
      assert.strictEqual(breakdown.remainingCP, 140);

      const item = breakdown.itemizedList.find(i => i.category === 'Technology Level');
      assert.ok(item);
      assert.strictEqual(item.costVal, 10);
      assert.strictEqual(item.cost, '10 CP');
    });

    it('charges +20 CP for TL5 (Theoretical)', () => {
      const char = { 'starting-cp': 150, 'tech-level': 5 };
      const breakdown = computeEconomyBreakdown(char);
      assert.strictEqual(breakdown.techLevelCost, 20);
      assert.strictEqual(breakdown.spentCP, 20);
      assert.strictEqual(breakdown.remainingCP, 130);

      const item = breakdown.itemizedList.find(i => i.category === 'Technology Level');
      assert.ok(item);
      assert.strictEqual(item.costVal, 20);
      assert.strictEqual(item.cost, '20 CP');
    });

    it('refunds -10 CP for TL2 (Industrial)', () => {
      const char = { 'starting-cp': 150, 'tech-level': 2 };
      const breakdown = computeEconomyBreakdown(char);
      assert.strictEqual(breakdown.techLevelCost, -10);
      assert.strictEqual(breakdown.spentCP, -10);
      assert.strictEqual(breakdown.remainingCP, 160);

      const item = breakdown.itemizedList.find(i => i.category === 'Technology Level');
      assert.ok(item);
      assert.strictEqual(item.costVal, -10);
      assert.strictEqual(item.cost, '-10 CP');
    });

    it('refunds -20 CP for TL1 (Primitive)', () => {
      const char = { 'starting-cp': 150, 'tech-level': 1 };
      const breakdown = computeEconomyBreakdown(char);
      assert.strictEqual(breakdown.techLevelCost, -20);
      assert.strictEqual(breakdown.spentCP, -20);
      assert.strictEqual(breakdown.remainingCP, 170);

      const item = breakdown.itemizedList.find(i => i.category === 'Technology Level');
      assert.ok(item);
      assert.strictEqual(item.costVal, -20);
      assert.strictEqual(item.cost, '-20 CP');
    });
  });

  describe('Augmentation Base Cost Accounting', () => {
    it('charges 1 CP per augmentation by default per rulebook', () => {
      const char = {
        'starting-cp': 150,
        'augmentations': [
          { name: 'Subdermal Plating' },
          { name: 'Ocular HUD' }
        ]
      };
      const breakdown = computeEconomyBreakdown(char);
      assert.strictEqual(breakdown.augmentationsCost, 2);
      assert.strictEqual(breakdown.spentCP, 2);
      assert.strictEqual(breakdown.remainingCP, 148);

      const item1 = breakdown.itemizedList.find(i => i.item === 'Subdermal Plating');
      assert.ok(item1);
      assert.strictEqual(item1.costVal, 1);
      assert.strictEqual(item1.cost, '1 CP');
    });

    it('respects explicit cp cost or granted flag on augmentations', () => {
      const char = {
        'starting-cp': 150,
        'augmentations': [
          { name: 'Heavy Cybernetic Arm', cp: 3 },
          { name: 'Inherent Neural Bus', isGranted: true }
        ]
      };
      const breakdown = computeEconomyBreakdown(char);
      assert.strictEqual(breakdown.augmentationsCost, 3);
      assert.strictEqual(breakdown.spentCP, 3);

      const granted = breakdown.itemizedList.find(i => i.item === 'Inherent Neural Bus');
      assert.ok(granted);
      assert.strictEqual(granted.costVal, 0);
      assert.strictEqual(granted.cost, '0 CP');
    });
  });

});

