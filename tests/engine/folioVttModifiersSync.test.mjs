/**
 * @file folioVttModifiersSync.test.mjs
 * @description Integration and unit tests for ADE Interactive Play Database Modifiers Engine,
 * Folio Persona Synchronization, and VTT Tactical Stage Event Contracts.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOperativeFromDatabasePersona,
  calculateActiveModifiersBonus,
  evaluateTangentCheck,
  loadDatabaseModifiers,
  exportSessionMarkdown
} from '../../src/pages/Foundry/StoryModule/interactivePlayService.js';
import { DEFAULT_MODIFIERS } from '../../src/data/supportingCatalogsData.js';
import { DEFAULT_ARCHETYPES } from '../../src/data/archetypesData.js';

test('Dynamic Modifiers: Database Modifiers Ingestion', () => {
  const dbMods = loadDatabaseModifiers({
    dbModifiers: DEFAULT_MODIFIERS
  });
  assert.ok(dbMods.length >= 10, 'Canonical database modifiers loaded');
  const atk = dbMods.find(m => m.name.includes('Attack'));
  assert.ok(atk, 'Attack modifier present');
  assert.equal(atk.value, 1);
});

test('Dynamic Modifiers: Accumulation and Target Isolation', () => {
  const activeMods = [
    { id: '1', name: 'High Ground', target: 'attr-might', value: 1 },
    { id: '2', name: 'Stim-Boosted', target: 'attr-reflex', value: 2 },
    { id: '3', name: 'Heavy Cover', target: 'attr-fortitude', value: 2 },
    { id: '4', name: 'Concussed', target: 'attr-logic', value: -2 },
    { id: '5', name: 'Suppressed', target: 'all', value: -2 }
  ];

  // Might: +1 (High Ground) - 2 (Suppressed) = -1
  assert.equal(calculateActiveModifiersBonus(activeMods, 'attr-might'), -1);

  // Reflex: +2 (Stim) - 2 (Suppressed) = 0
  assert.equal(calculateActiveModifiersBonus(activeMods, 'attr-reflex'), 0);

  // Fortitude: +2 (Cover) - 2 (Suppressed) = 0
  assert.equal(calculateActiveModifiersBonus(activeMods, 'attr-fortitude'), 0);

  // Logic: -2 (Concussed) - 2 (Suppressed) = -4
  assert.equal(calculateActiveModifiersBonus(activeMods, 'attr-logic'), -4);

  // Willpower: 0 - 2 (Suppressed) = -2
  assert.equal(calculateActiveModifiersBonus(activeMods, 'attr-will'), -2);
});

test('Folio Sync: Operative Health and Shield Vitals Model', () => {
  const customHero = {
    'character-doc-id': 'hero_valkyrie_9',
    'char-name': 'Valkyrie-9',
    'char-archetype': 'Bionic Bruiser',
    'char-species': 'Synthetic',
    'attr-strength': 4,  // Might base = 2 + (4*2) = 10
    'attr-agility': 1,   // Reflex base = 2 + (1*2) = 4
    'attr-stamina': 3,   // Fortitude base = 2 + (3*2) = 8
    'attr-intellect': 1,
    'attr-wisdom': 1,
    'attr-charisma': 0,
    'health': 40,
    'max-health': 40,
    'current-shields': 25,
    'max-shields': 25,
    'current-strain': 2,
    'max-strain': 14,
    'plot-points': 3,
    'karma': 4
  };

  const op = createOperativeFromDatabasePersona(customHero, 'folio');
  assert.equal(op.name, 'Valkyrie-9');
  assert.equal(op.subAttributes['attr-might'], 10);
  assert.equal(op.subAttributes['attr-reflex'], 4);
  assert.equal(op.subAttributes['attr-fortitude'], 8);
  assert.equal(op.vitals.health, 40);
  assert.equal(op.vitals.shields, 25);
  assert.equal(op.vitals.strain, 2);
  assert.equal(op.vitals.plotPoints, 3);
  assert.equal(op.vitals.karma, 4);
});

test('Tactical 2d10 Checks: Margin of Success with Database Archetype', () => {
  const bailiff = DEFAULT_ARCHETYPES.find(a => a.id === 'archetype-bailiff') || DEFAULT_ARCHETYPES[0];
  const op = createOperativeFromDatabasePersona(bailiff, 'omnicortex');
  
  // Baseline check vs CR 14
  const check = evaluateTangentCheck({
    operative: op,
    skillName: 'Law Enforcement',
    subAttrKey: 'attr-might',
    targetCR: 14,
    activeModifiers: []
  });

  assert.ok(check.baseScore > 0);
  assert.equal(check.modBonus, 0);
  assert.ok(check.total >= 8 && check.total <= 30);
});

test('Transcript Export: Markdown Formatting and Database Content Ingestion', () => {
  const bailiff = DEFAULT_ARCHETYPES.find(a => a.id === 'archetype-bailiff') || DEFAULT_ARCHETYPES[0];
  const op = createOperativeFromDatabasePersona(bailiff, 'omnicortex');

  const mockSession = {
    id: 'test_session_db_101',
    activeScenarioTitle: 'Derelict Core Breach',
    partyMode: 'solo',
    mode: 'solo',
    createdAt: new Date().toISOString(),
    operatives: [op],
    activeModifiers: [
      { name: 'Heavy Cover', description: '+2 Fortitude defense', value: 2 }
    ],
    beats: [
      {
        beatIndex: 1,
        protagonistName: op.name,
        timestamp: '10:30 AM',
        text: `${op.name} breaches the security bulkhead and scans the terminal.`,
        gate: {
          chosenOption: 'Advance behind portable kinetic barricade',
          checkResult: `${op.name} [Might]: Rolled 18 vs CR 12 ➔ SUCCESS`
        }
      }
    ]
  };

  const md = exportSessionMarkdown(mockSession);
  assert.ok(md.includes('# Derelict Core Breach — Interactive Play Transcript'));
  assert.ok(md.includes(op.name));
  assert.ok(md.includes('Heavy Cover'));
  assert.ok(md.includes('Beat #1'));
});
