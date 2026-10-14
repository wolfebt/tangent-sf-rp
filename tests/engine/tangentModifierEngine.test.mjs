/**
 * @file tangentModifierEngine.test.mjs
 * @description Comprehensive unit test suite for src/engines/tangentModifierEngine.js.
 * Validates natural-language modifier parsing, note formatting, canonical catalog resolution,
 * skill target alias/group matching, equipment skill modifier extraction, and full skill check
 * breakdown (typed bonus non-stacking vs inherent stacking, advantage/disadvantage roll expressions).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseModifiersFromText,
  formatModifierNotes,
  resolveCanonicalCatalogItem,
  enrichItemWithModifiers,
  isSkillTargetMatch,
  extractEquipmentSkillModifiers,
  getSkillCheckBreakdown
} from '../../src/engines/tangentModifierEngine.js';

test('Modifier Engine [parseModifiersFromText]: Extracts saves, advantages, skills, karma, TL, wealth, combat stats, and conditions', () => {
  const text = [
    'Grants +2 bonus on all Fortitude Checks and -1 penalty to Will saves.',
    'Gain Advantage on all Reflex checks.',
    '+3 bonus to Stealth and Intimidation checks.',
    '-2 to Karma Pool. +1 Tech Level. -4 to Wealth Score.',
    '+2 to Initiative and +3 DR. Target becomes Sickened and Fatigued.'
  ].join(' ');

  const mods = parseModifiersFromText('Cyber-Adrenal Surge', text, '');

  // Saves
  assert.ok(mods.some(m => m.type === 'save' && m.target === 'Fortitude' && m.value === 2));
  assert.ok(mods.some(m => m.type === 'save' && m.target === 'Will' && m.value === -1));

  // Save Advantage
  assert.ok(mods.some(m => m.type === 'save_advantage' && m.target === 'Reflex' && m.value === 1));

  // Compound Skills ("Stealth and Intimidation")
  assert.ok(mods.some(m => m.type === 'skill' && m.target === 'Stealth' && m.value === 3));
  assert.ok(mods.some(m => m.type === 'skill' && m.target === 'Intimidation' && m.value === 3));

  // Economy & Meta Stats
  assert.ok(mods.some(m => m.type === 'karma' && m.value === -2));
  assert.ok(mods.some(m => m.type === 'tech_level' && m.value === 1));
  assert.ok(mods.some(m => m.type === 'wealth' && m.value === -4));

  // Combat & Conditions
  assert.ok(mods.some(m => m.type === 'combat' && m.target === 'initiative-mod' && m.value === 2));
  assert.ok(mods.some(m => m.type === 'combat' && m.target === 'armor-dr' && m.value === 3));
  assert.ok(mods.some(m => m.type === 'condition' && m.target === 'Condition: Sickened' && m.value === -2));
  assert.ok(mods.some(m => m.type === 'condition' && m.target === 'Condition: Fatigued' && m.value === -2));
});

test('Modifier Engine [formatModifierNotes & enrichItemWithModifiers]: Synthesizes structured rule and prerequisite tags', () => {
  const rawTrait = {
    name: 'Tactical Savant',
    mechanic: '+2 bonus to Tactics checks.',
    is_ranked: true,
    is_multiple: true,
    prerequisites: 'Intellect 2+',
    modifier_options: {
      mode: 'group_pool',
      max_skills: 2,
      value: 2
    },
    selected_skills: ['Tactics', 'Leadership']
  };

  const enriched = enrichItemWithModifiers(rawTrait);
  assert.ok(enriched);
  assert.ok(enriched.modifiers.some(m => m.target === 'Tactics' && m.value === 2));
  assert.ok(enriched.notesList.some(n => n.includes('[Rule] Ranked')));
  assert.ok(enriched.notesList.some(n => n.includes('[Rule] Multiple')));
  assert.ok(enriched.notesList.some(n => n.includes('[Skill Group Choice] Active: Tactics, Leadership (+2)')));
  assert.ok(enriched.notesList.some(n => n.includes('[Prerequisite] Intellect 2+')));
});

test('Modifier Engine [isSkillTargetMatch & resolveCanonicalCatalogItem]: Matches aliases, parentheticals, and wildcards', () => {
  const computersSkill = { id: 'skill-computers', name: 'Computers', group: 'technical', subcategory: 'vocations' };
  const alertnessSkill = { id: 'skill-alertness', name: 'Alertness', group: 'sensory', subcategory: 'general' };
  const arcaneSkill = { id: 'skill-arcane', name: 'Knowledge (Arcane)', group: 'mental', subcategory: 'knowledges' };

  assert.equal(isSkillTargetMatch(computersSkill, 'Computers'), true);
  assert.equal(isSkillTargetMatch(computersSkill, 'Hacking'), true, 'Alias "Hacking" must map to Computers');
  assert.equal(isSkillTargetMatch(computersSkill, 'all vocations'), true, 'Subcategory wildcard must match');
  assert.equal(isSkillTargetMatch(alertnessSkill, 'Perception'), true, 'Alias "Perception" must map to Alertness');
  assert.equal(isSkillTargetMatch(arcaneSkill, 'Arcane'), true, 'Parenthetical inner target must match');
  assert.equal(isSkillTargetMatch(arcaneSkill, 'all knowledges'), true);
  assert.equal(isSkillTargetMatch(computersSkill, 'Melee'), false);

  // Verify catalog lookup resolves canonical features/traits
  const resolved = resolveCanonicalCatalogItem('Augmented');
  assert.ok(resolved, 'Should resolve canonical "Augmented" feature from DEFAULT_FEATURES');
});

test('Modifier Engine [extractEquipmentSkillModifiers & getSkillCheckBreakdown]: Enforces typed bonus non-stacking and advantage expressions', () => {
  const characterData = {
    'attr-intellect': 3,
    'attr-intellect-mod': 1, // attrTotal = 4
    'skill-computers-rank': 5,
    'skill-computers-base': 'attr-intellect',
    'skill-computers-mod': 1, // manual adjustment (+1, stacks)
    features: [
      {
        name: 'Cyber-Slicer Focus',
        modifiers: [
          { type: 'skill', target: 'Computers', value: 2, mode: 'inherent' },
          { type: 'check_advantage', target: 'Computers', value: 1, description: 'Advantage on Computers checks' }
        ]
      }
    ],
    traits: [
      {
        name: 'Deck Compatibility I',
        modifiers: [{ type: 'skill', target: 'Computers', value: 2, mode: 'competence' }]
      },
      {
        name: 'Deck Compatibility II',
        modifiers: [{ type: 'skill', target: 'Computers', value: 4, mode: 'competence' }] // Same typed bonus 'competence': should take max(2, 4) = 4, NOT 6!
      }
    ],
    hindrances: [
      {
        name: 'Neural Glitch',
        modifiers: [{ type: 'skill', target: 'Computers', value: -1, mode: 'penalty' }] // Penalties always stack
      }
    ],
    gear: [
      {
        id: 'gear-deck-mk4',
        name: 'Slicer Deck Mk IV',
        skill_modifiers: { Computers: 2 },
        modifications: [
          { name: 'Co-Processor', skill_modifiers: { Hacking: 1 } }
        ]
      }
    ]
  };

  const breakdown = getSkillCheckBreakdown(
    { id: 'skill-computers', name: 'Computers', baseAttr: 'attr-intellect' },
    characterData
  );

  assert.ok(breakdown);
  assert.equal(breakdown.rank, 5);
  assert.equal(breakdown.attrTotal, 4);

  // Inherent/Manual/Penalty stack:
  // +1 (manual) + 2 (inherent feature) - 1 (penalty) + 2 (gear inherent) + 1 (gear mod inherent) = +5
  // Typed 'competence' bucket: max(2, 4) = +4
  // Total Modifier = 5 + 4 = +9
  assert.equal(breakdown.typedBonusBuckets.competence, 4, 'Typed competence bonuses must take highest (4), not sum (6)');
  assert.equal(breakdown.totalModifier, 9);
  assert.equal(breakdown.score, 5 + 4 + 9); // 18
  assert.equal(breakdown.hasAdvantage, true);
  assert.equal(breakdown.rollExpression, '3d10k2+18');
  assert.equal(breakdown.equipment.length, 2, 'Should list both base Slicer Deck and its Co-Processor mod');
});
