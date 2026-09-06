/**
 * @file tacticalVitalsAndDice.test.mjs
 * @description Unit Test Suite for Tactical Vitals, Canonical Secondary Checks,
 * Dice Rolling Pipeline, and Property Catalog Encumbrance Integration.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSubAttrScore, calculateSubAttrBase } from '../../src/utils/attributeUtils.js';
import { rollDice, parseDiceExpression } from '../../src/services/diceService.js';
import { scaleCarryingCapacity } from '../../src/engines/tangentScalingEngine.js';
import { characterSchema } from '../../src/components/Folio/schema.js';

test('Tactical Vitals: Canonical Primary and Secondary Check Pairs Resolution', () => {
  const operative = {
    'char-name': 'Test operative',
    'attr-strength': 1,    // Might base = 4
    'attr-agility': 3,     // Reflex base = 8
    'attr-stamina': 2,     // Fortitude base = 6
    'attr-intellect': 0,   // Reason base = 2
    'attr-wisdom': -1,    // Willpower base = 0
    'attr-charisma': 4,    // Etiquette base = 10
    // Purchased bonuses
    'attr-might': 5,       // 4 base + 1 bonus = 5
    'attr-fortitude': 8    // 6 base + 2 bonus = 8
    // Reflex, Reason, Willpower, Etiquette not explicitly set (should resolve to base)
  };

  // 1. STR -> Might
  assert.equal(resolveSubAttrScore('attr-might', operative), 5, 'Might resolves base 4 + bonus 1 = 5');

  // 2. AGI -> Reflex
  assert.equal(resolveSubAttrScore('attr-reflex', operative), 8, 'Reflex resolves canonical base 2 + (3*2) = 8');

  // 3. STA -> Fortitude
  assert.equal(resolveSubAttrScore('attr-fortitude', operative), 8, 'Fortitude resolves base 6 + bonus 2 = 8');

  // 4. INT -> Reason/Logic
  assert.equal(resolveSubAttrScore('attr-logic', operative), 2, 'Reason/Logic resolves canonical base 2 + (0*2) = 2');
  assert.equal(resolveSubAttrScore('attr-reason', operative), 2, 'Reason alias resolves canonical base 2');

  // 5. WIS -> Willpower
  assert.equal(resolveSubAttrScore('attr-will', operative), 0, 'Willpower resolves canonical base 2 + (-1*2) = 0');
  assert.equal(resolveSubAttrScore('attr-willpower', operative), 0, 'Willpower alias resolves canonical base 0');

  // 6. CHA -> Etiquette
  assert.equal(resolveSubAttrScore('attr-etiquette', operative), 10, 'Etiquette resolves canonical base 2 + (4*2) = 10');

  // CRITICAL REGRESSION TEST: Initialized character with default 2s in sub-attributes
  // Even if characterData has default 'attr-might': 2, when Strength is 3, Might MUST resolve to 8, NOT 2!
  const defaultInitializedHero = {
    'char-name': 'Warrior with Default Sub-Attributes',
    'attr-strength': 3,
    'attr-might': 2, // stale default from DEFAULT_CHARACTER
    'attr-agility': 2,
    'attr-reflex': 2, // stale default
    'attr-stamina': 4,
    'attr-fortitude': 2, // stale default
    'attr-intellect': 1,
    'attr-logic': 2, // stale default
    'attr-wisdom': 2,
    'attr-will': 2, // stale default
    'attr-charisma': 3,
    'attr-etiquette': 2 // stale default
  };

  assert.equal(resolveSubAttrScore('attr-might', defaultInitializedHero), 8, 'Strength 3 resolves to Might 8, never stale 2');
  assert.equal(resolveSubAttrScore('attr-reflex', defaultInitializedHero), 6, 'Agility 2 resolves to Reflex 6, never stale 2');
  assert.equal(resolveSubAttrScore('attr-fortitude', defaultInitializedHero), 10, 'Stamina 4 resolves to Fortitude 10, never stale 2');
  assert.equal(resolveSubAttrScore('attr-logic', defaultInitializedHero), 4, 'Intellect 1 resolves to Reason 4, never stale 2');
  assert.equal(resolveSubAttrScore('attr-will', defaultInitializedHero), 6, 'Wisdom 2 resolves to Willpower 6, never stale 2');
  assert.equal(resolveSubAttrScore('attr-etiquette', defaultInitializedHero), 8, 'Charisma 3 resolves to Etiquette 8, never stale 2');

  // Test primaryScoreOverride support (e.g. effective total with species/trait modifiers)
  assert.equal(resolveSubAttrScore('attr-might', defaultInitializedHero, 4), 10, 'Strength total 4 override resolves Might to 10');
});

test('Tactical Vitals: Mutual Exclusivity (Synthetic vs Biological)', () => {
  const syntheticOperative = {
    'char-name': 'Unit-77',
    'char-species': 'Mekan Synthetic',
    structure: 80,
    current_structure: 65,
    health: 30,
    vitality: 30
  };

  const speciesStr = String(syntheticOperative['char-species']).toLowerCase();
  const isSynthetic = Boolean(
    syntheticOperative.isSynthetic ?? (
      speciesStr.includes('synthetic') || speciesStr.includes('mekan') || 
      speciesStr.includes('construct') || speciesStr.includes('mecha')
    )
  );

  assert.equal(isSynthetic, true, 'Mekan operative correctly identified as synthetic');

  const curHealth = isSynthetic ? null : syntheticOperative.current_health;
  const curVitality = isSynthetic ? null : syntheticOperative.current_vitality;
  const curStructure = isSynthetic ? syntheticOperative.current_structure : null;

  assert.equal(curHealth, null, 'Synthetic has no Health score');
  assert.equal(curVitality, null, 'Synthetic has no Vitality score');
  assert.equal(curStructure, 65, 'Synthetic has Structure score');

  // Biological Operative
  const biologicalOperative = {
    'char-name': 'Captain Sarah',
    'char-species': 'Human',
    structure: 80,
    health: 35,
    current_health: 35,
    vitality: 40,
    current_vitality: 28
  };

  const bioSpeciesStr = String(biologicalOperative['char-species']).toLowerCase();
  const bioIsSynthetic = Boolean(bioSpeciesStr.includes('synthetic') || bioSpeciesStr.includes('mekan'));
  assert.equal(bioIsSynthetic, false, 'Human correctly identified as biological');

  const bioHealth = bioIsSynthetic ? null : biologicalOperative.current_health;
  const bioVitality = bioIsSynthetic ? null : biologicalOperative.current_vitality;
  const bioStructure = bioIsSynthetic ? biologicalOperative.current_structure : null;

  assert.equal(bioHealth, 35, 'Biological has Health score');
  assert.equal(bioVitality, 28, 'Biological has Vitality score');
  assert.equal(bioStructure, null, 'Biological has no Structure score');
});

test('Tactical Dice Rolling: Interactive 2d10 & Modifier Formula Pipeline', () => {
  // Test expression parsing
  const parsed1 = parseDiceExpression('2d10+4');
  assert.equal(parsed1.count, 2);
  assert.equal(parsed1.sides, 10);
  assert.equal(parsed1.modifier, 4);

  const parsed2 = parseDiceExpression('2d10-2');
  assert.equal(parsed2.count, 2);
  assert.equal(parsed2.sides, 10);
  assert.equal(parsed2.modifier, -2);

  const parsed3 = parseDiceExpression('1d10');
  assert.equal(parsed3.count, 1);
  assert.equal(parsed3.sides, 10);
  assert.equal(parsed3.modifier, 0);

  // Test executing rolls
  const rollRes = rollDice('2d10+3', { characterName: 'Operative', label: 'Reflex Save' });
  assert.ok(typeof rollRes.total === 'number');
  assert.equal(rollRes.rolls.length, 2);
  assert.ok(rollRes.rolls[0].value >= 1 && rollRes.rolls[0].value <= 10);
  assert.ok(rollRes.rolls[1].value >= 1 && rollRes.rolls[1].value <= 10);
  assert.equal(rollRes.modifier, 3);
  assert.ok(typeof rollRes.isCritSuccess === 'boolean');
  assert.ok(typeof rollRes.isCritFail === 'boolean');
});

test('Tactical Property Catalog: Aggregation, Carried Weight & Encumbrance Scaling', () => {
  const characterData = {
    'char-size': 'Medium',
    'attr-strength': 1,
    'property-weaponry': [
      { id: 'w1', name: 'Plasma Carbine', qty: 1, weight: 8, damage: '2d10+2', attackMod: 2, range: 'Medium' },
      { id: 'w2', name: 'Combat Vibroblade', qty: 2, weight: 2.5, damage: '1d10+3', attackMod: 1, range: 'Close' }
    ],
    'property-armoring': [
      { id: 'a1', name: 'Ballistic Mesh Weave', qty: 1, weight: 12, armor: 4, tl: 4 }
    ],
    'property-gear': [
      { id: 'g1', name: 'Field Medkit', qty: 1, weight: 4 },
      { id: 'g2', name: 'Rations (5-day pack)', qty: 3, weight: 2 }
    ],
    'property-mech': [
      { id: 'm1', name: 'Titan Mech Chassis', qty: 1, weight: 12000 } // Static / Non-portable
    ],
    'property-architecture': [
      { id: 'arc1', name: 'Orbital Penthouse', qty: 1, weight: 0 } // Real estate
    ],
    'property-other': [
      { id: 'o1', name: 'Ancient Artifact Gem', qty: 1, weight: 1 }
    ]
  };

  // Carried Weight calculation across portable categories
  const portableItems = [
    ...characterData['property-weaponry'],
    ...characterData['property-armoring'],
    ...characterData['property-gear'],
    ...characterData['property-other']
  ];

  const totalCarriedWeight = portableItems.reduce((sum, item) => sum + (item.weight * (item.qty || 1)), 0);
  // w1: 8 + w2: 5 + a1: 12 + g1: 4 + g2: 6 + o1: 1 = 36 lbs
  assert.equal(totalCarriedWeight, 36, 'Portable carried weight correctly calculates to 36 lbs');

  // Carrying capacity scaling: Base = (max(0, STR) + 2) * 50
  // STR = 1 -> (1 + 2) * 50 = 150 lbs
  const baseCapacity = (Math.max(0, characterData['attr-strength']) + 2) * 50;
  assert.equal(baseCapacity, 150, 'STR 1 base capacity is 150 lbs');

  // Medium scale multiplier is 1
  const maxCapacityMedium = scaleCarryingCapacity(baseCapacity, 'Medium');
  assert.equal(maxCapacityMedium, 150, 'Medium scale capacity is 150 lbs');

  // Large scale multiplier is 2
  const maxCapacityLarge = scaleCarryingCapacity(baseCapacity, 'Large');
  assert.equal(maxCapacityLarge, 300, 'Large scale capacity is 300 lbs');

  // Encumbrance checks
  const lightCapacity = maxCapacityMedium * 0.5; // 75 lbs
  const isOverburdened = totalCarriedWeight > maxCapacityMedium;
  const isEncumbered = totalCarriedWeight > lightCapacity && !isOverburdened;

  assert.equal(isOverburdened, false, '36 lbs <= 150 lbs -> not overburdened');
  assert.equal(isEncumbered, false, '36 lbs <= 75 lbs -> unencumbered');

  // Test heavy load
  const heavyWeight = 90;
  assert.equal(heavyWeight > lightCapacity && heavyWeight <= maxCapacityMedium, true, '90 lbs is Encumbered (between 75 and 150 lbs)');

  // Test overburdened
  const overburdenedWeight = 160;
  assert.equal(overburdenedWeight > maxCapacityMedium, true, '160 lbs is Overburdened (> 150 lbs)');
});

test('Folio Schema: Weapon and Item Tech Level (TL) accepts both numeric and string values without ZodError', () => {
  const personaWithNumericTL = {
    'char-name': 'Operative with Numeric TL & Profile',
    'char-age': 32,
    'char-height': 180,
    'char-weight': 85,
    weapons: [
      { id: 'w1', name: 'Heavy Plasma Rifle', tl: 4, weight: 10, cost: 500, qty: 1 },
      { id: 'w2', name: 'Monoblade', tl: '3', weight: 2, cost: 150, qty: 1 }
    ],
    armor: [
      { id: 'a1', name: 'Nanoweave Vest', tl: 3, weight: 8, cost: 350, qty: 1 }
    ],
    gear: [
      { id: 'g1', name: 'Medkit', tl: 2, weight: 3, cost: 100, qty: 2 }
    ]
  };

  const parsed = characterSchema.parse(personaWithNumericTL);
  assert.equal(parsed.weapons[0].tl, 4);
  assert.equal(parsed.weapons[1].tl, '3');
  assert.equal(parsed.armor[0].tl, 3);
  assert.equal(parsed.gear[0].tl, 2);
  assert.equal(parsed['char-age'], '32');
  assert.equal(parsed['char-height'], '180');
  assert.equal(parsed['char-weight'], '85');
});

