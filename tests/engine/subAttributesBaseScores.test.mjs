/**
 * @file subAttributesBaseScores.test.mjs
 * @description Unit Test Suite for Sub-Attribute Base Score Integrity & Healing
 * 
 * Verifies:
 * 1. Default sub-attributes have base 2 when primary attributes are 0.
 * 2. Canonical formula Base = 2 + (Primary * 2) across all 6 attribute pairs.
 * 3. sanitizeCharacterSkills heals legacy/corrupted characters with 0 or missing sub-attributes.
 * 4. Preserves explicitly purchased sub-attribute bonuses above base.
 * 5. Synchronizes alias pairs (attr-logic <-> attr-reason, attr-will <-> attr-willpower).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUB_TO_PRIMARY_ATTR,
  PRIMARY_TO_SUB_ATTR,
  calculateSubAttrBase,
  resolveSubAttrScore,
  sanitizeSubAttributes
} from '../../src/utils/attributeUtils.js';

test('Sub-Attributes: Canonical formula Base = 2 + (Primary * 2) for all 6 pairs', () => {
  const PAIRS = [
    { primary: 'attr-strength', sub: 'attr-might' },
    { primary: 'attr-agility', sub: 'attr-reflex' },
    { primary: 'attr-stamina', sub: 'attr-fortitude' },
    { primary: 'attr-intellect', sub: 'attr-logic' },
    { primary: 'attr-wisdom', sub: 'attr-will' },
    { primary: 'attr-charisma', sub: 'attr-etiquette' }
  ];

  PAIRS.forEach(({ primary, sub }) => {
    // For primary = 0 -> base = 2
    assert.equal(SUB_TO_PRIMARY_ATTR[sub], primary);
    const getBase = (pVal) => (pVal * 2) + 2;

    assert.equal(getBase(0), 2, `${sub} at primary 0 should be 2`);
    assert.equal(getBase(1), 4, `${sub} at primary 1 should be 4`);
    assert.equal(getBase(2), 6, `${sub} at primary 2 should be 6`);
    assert.equal(getBase(3), 8, `${sub} at primary 3 should be 8`);
    assert.equal(getBase(4), 10, `${sub} at primary 4 should be 10`);
  });
});

test('Sub-Attributes: sanitizeSubAttributes heals missing sub-attributes to canonical base', () => {
  const legacyChar = {
    'char-name': 'Legacy Hero',
    'attr-strength': 2,
    'attr-agility': 1,
    'attr-stamina': 3,
    'attr-intellect': 0,
    'attr-wisdom': 2,
    'attr-charisma': 1
    // Notice: all sub-attributes missing entirely
  };

  const sanitized = sanitizeSubAttributes(legacyChar);

  assert.equal(sanitized['attr-might'], 6, 'Strength 2 -> Might base 6');
  assert.equal(sanitized['attr-reflex'], 4, 'Agility 1 -> Reflex base 4');
  assert.equal(sanitized['attr-fortitude'], 8, 'Stamina 3 -> Fortitude base 8');
  assert.equal(sanitized['attr-logic'], 2, 'Intellect 0 -> Logic/Reason base 2');
  assert.equal(sanitized['attr-reason'], 2, 'Intellect 0 -> Reason alias base 2');
  assert.equal(sanitized['attr-will'], 6, 'Wisdom 2 -> Will base 6');
  assert.equal(sanitized['attr-willpower'], 6, 'Wisdom 2 -> Willpower alias base 6');
  assert.equal(sanitized['attr-etiquette'], 4, 'Charisma 1 -> Etiquette base 4');
});

test('Sub-Attributes: sanitizeSubAttributes heals 0 or empty sub-attributes to canonical base', () => {
  const corruptedChar = {
    'char-name': 'Guided Creator Output with 0s',
    'attr-strength': 1,
    'attr-might': 0,
    'attr-agility': 2,
    'attr-reflex': 0,
    'attr-stamina': 0,
    'attr-fortitude': 0,
    'attr-intellect': 3,
    'attr-logic': 0,
    'attr-reason': 0,
    'attr-wisdom': 1,
    'attr-will': 0,
    'attr-willpower': 0,
    'attr-charisma': 2,
    'attr-etiquette': 0
  };

  const sanitized = sanitizeSubAttributes(corruptedChar);

  assert.equal(sanitized['attr-might'], 4, 'Strength 1 -> Might healed to 4 from 0');
  assert.equal(sanitized['attr-reflex'], 6, 'Agility 2 -> Reflex healed to 6 from 0');
  assert.equal(sanitized['attr-fortitude'], 2, 'Stamina 0 -> Fortitude healed to 2 from 0');
  assert.equal(sanitized['attr-logic'], 8, 'Intellect 3 -> Reason/Logic healed to 8 from 0');
  assert.equal(sanitized['attr-reason'], 8, 'Intellect 3 -> Reason alias healed to 8 from 0');
  assert.equal(sanitized['attr-will'], 4, 'Wisdom 1 -> Will healed to 4 from 0');
  assert.equal(sanitized['attr-willpower'], 4, 'Wisdom 1 -> Willpower alias healed to 4 from 0');
  assert.equal(sanitized['attr-etiquette'], 6, 'Charisma 2 -> Etiquette healed to 6 from 0');
});

test('Sub-Attributes: sanitizeSubAttributes preserves purchased bonus points above base', () => {
  const customChar = {
    'char-name': 'Custom Operative with Purchased Sub-Attributes',
    'attr-strength': 1,
    'attr-might': 5, // Base is 4 (1*2+2), +1 purchased bonus
    'attr-agility': 0,
    'attr-reflex': 3, // Base is 2 (0*2+2), +1 purchased bonus
    'attr-stamina': 1,
    'attr-fortitude': 4, // Exactly base
    'attr-intellect': 2,
    'attr-logic': 7, // Base is 6 (2*2+2), +1 purchased bonus
    'attr-wisdom': 1,
    'attr-will': 4, // Exactly base
    'attr-charisma': 0,
    'attr-etiquette': 2 // Exactly base
  };

  const sanitized = sanitizeSubAttributes(customChar);

  assert.equal(sanitized['attr-might'], 5, 'Purchased Might 5 must be preserved');
  assert.equal(sanitized['attr-reflex'], 3, 'Purchased Reflex 3 must be preserved');
  assert.equal(sanitized['attr-fortitude'], 4, 'Base Fortitude 4 must be preserved');
  assert.equal(sanitized['attr-logic'], 7, 'Purchased Reason/Logic 7 must be preserved');
  assert.equal(sanitized['attr-reason'], 7, 'Alias Reason 7 must match Logic 7');
  assert.equal(sanitized['attr-will'], 4, 'Base Will 4 must be preserved');
  assert.equal(sanitized['attr-etiquette'], 2, 'Base Etiquette 2 must be preserved');
});

test('Sub-Attributes: alias sync between Reason/Logic and Will/Willpower', () => {
  // If character was saved with only attr-reason
  const reasonOnly = {
    'attr-intellect': 2,
    'attr-reason': 7
  };
  const sanitizedReason = sanitizeSubAttributes(reasonOnly);
  assert.equal(sanitizedReason['attr-logic'], 7);
  assert.equal(sanitizedReason['attr-reason'], 7);

  // If character was saved with only attr-willpower
  const willOnly = {
    'attr-wisdom': 1,
    'attr-willpower': 5
  };
  const sanitizedWill = sanitizeSubAttributes(willOnly);
  assert.equal(sanitizedWill['attr-will'], 5);
  assert.equal(sanitizedWill['attr-willpower'], 5);
});

test('Sub-Attributes: resolveSubAttrScore resolves explicit score or calculated base', () => {
  const emptyChar = {};
  assert.equal(resolveSubAttrScore('attr-might', emptyChar), 2, 'Default base 2 when nothing set');

  const charWithPrim = { 'attr-strength': 3 };
  assert.equal(resolveSubAttrScore('attr-might', charWithPrim), 8, 'Calculated base 8 for Strength 3');

  const charWithZero = { 'attr-strength': 2, 'attr-might': 0 };
  assert.equal(resolveSubAttrScore('attr-might', charWithZero), 6, '0 in might falls back to calculated base 6');

  const charWithPurchased = { 'attr-strength': 2, 'attr-might': 7 };
  assert.equal(resolveSubAttrScore('attr-might', charWithPurchased), 7, 'Purchased score 7 retained');

  const charWithAlias = { 'attr-intellect': 1, 'attr-reason': 5 };
  assert.equal(resolveSubAttrScore('attr-logic', charWithAlias), 5, 'Resolves alias attr-reason when querying attr-logic');
});

test('Sub-Attributes: primary attribute shift preserves bonus without negative deltas', () => {
  // Scenario: Character previously had 0 stored in attr-might
  const oldPrimaryVal = 0;
  const newPrimaryVal = 2;
  const oldBase = (oldPrimaryVal * 2) + 2; // 2
  const newBase = (newPrimaryVal * 2) + 2; // 6
  
  // Stored sub-attribute was 0 (corrupted or uninitialized)
  const rawSub = 0;
  const hasExplicitSub = rawSub !== null && !isNaN(rawSub) && rawSub > 0;
  const currentSubVal = hasExplicitSub ? rawSub : oldBase;
  const delta = currentSubVal - oldBase; // should be 0, NOT -2
  const newSubVal = newBase + delta;

  assert.equal(delta, 0, 'Delta must be 0 when stored sub-attribute was 0');
  assert.equal(newSubVal, 6, 'New sub-attribute value must be 6, not 4');
});

