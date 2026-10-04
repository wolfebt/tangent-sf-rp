/**
 * @file interactivePlayService.test.mjs
 * @description Unit tests for database-driven interactivePlayService (pure DB content, 2d10 evaluation, modifiers calculation).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadDatabasePersonas,
  loadDatabaseModifiers,
  createOperativeFromDatabasePersona,
  calculateActiveModifiersBonus,
  evaluateTangentCheck
} from '../../src/pages/Foundry/StoryModule/interactivePlayService.js';
import { DEFAULT_ARCHETYPES } from '../../src/data/archetypesData.js';
import { DEFAULT_MODIFIERS } from '../../src/data/supportingCatalogsData.js';

test('interactivePlayService: Database Personas Ingestion from Folio and Foundry', () => {
  const mockRoster = [
    {
      'character-doc-id': 'char_valk_1',
      'char-name': 'Valkyrie One',
      'char-archetype': 'Vanguard',
      'char-species': 'Terran',
      'attr-strength': 3,
      'attr-agility': 2,
      'attr-stamina': 3,
      'attr-intellect': 1,
      'attr-wisdom': 1,
      'attr-charisma': 0,
      'health': 35,
      'max-health': 35,
      'current-shields': 20
    }
  ];

  const mockFoundryElements = [
    {
      id: 'elem_persona_dr_koren',
      type: 'Persona',
      title: 'Dr. Koren',
      summary: 'Cyber-archaeologist investigating derelict telemetry',
      fields: {
        'char-name': 'Dr. Theron Koren',
        'char-species': 'Alterian',
        'role': 'Science Lead',
        'attr-intellect': 4,
        'attr-wisdom': 3,
        'health': 25
      }
    }
  ];

  const personas = loadDatabasePersonas({
    roster: mockRoster,
    elementsCatalog: mockFoundryElements,
    dbArchetypes: DEFAULT_ARCHETYPES.slice(0, 3)
  });

  assert.ok(personas.length >= 5, 'Ingests Folio, Foundry, and Omnicortex DB personas');
  
  // 1. Folio Persona check
  const folioOp = personas.find(p => p.id === 'char_valk_1');
  assert.ok(folioOp, 'Folio persona successfully ingested');
  assert.equal(folioOp.sourceType, 'folio');
  assert.equal(folioOp.name, 'Valkyrie One');
  assert.equal(folioOp.subAttributes['attr-might'], 8); // 2 + (3*2) = 8
  assert.equal(folioOp.vitals.health, 35);

  // 2. Foundry Element Persona check
  const foundryOp = personas.find(p => p.id === 'elem_persona_dr_koren');
  assert.ok(foundryOp, 'Foundry Element persona successfully ingested');
  assert.equal(foundryOp.sourceType, 'foundry');
  assert.equal(foundryOp.name, 'Dr. Theron Koren');
  assert.equal(foundryOp.subAttributes['attr-logic'], 10); // 2 + (4*2) = 10

  // 3. Omnicortex Compendium Archetype check
  const compendiumOp = personas.find(p => p.sourceType === 'omnicortex');
  assert.ok(compendiumOp, 'Compendium archetype successfully ingested from DB');
  assert.ok(compendiumOp.name, 'Compendium operative has canonical name');
});

test('interactivePlayService: Database Modifiers Ingestion', () => {
  const dbMods = loadDatabaseModifiers({
    dbModifiers: DEFAULT_MODIFIERS,
    galleryModifiers: [
      {
        id: 'gm_solar_flare',
        name: 'Solar Flare Ionization',
        description: 'Electromagnetic turbulence dampens sensors',
        effects: { techMod: -2 }
      }
    ]
  });

  assert.ok(dbMods.length >= 10, 'Ingests canonical DBM supporting modifiers and gallery modifiers');
  const atkMod = dbMods.find(m => m.name.includes('Attack'));
  assert.ok(atkMod, 'Attack modifier exists from database catalog');
  
  const solarMod = dbMods.find(m => m.name === 'Solar Flare Ionization');
  assert.ok(solarMod, 'Gallery modifier ingested');
  assert.equal(solarMod.value, -2);
  assert.equal(solarMod.target, 'attr-logic');
});

test('interactivePlayService: Active Modifiers Calculation', () => {
  const activeModifiers = [
    { id: '1', name: 'High Ground', target: 'attr-might', value: 1 },
    { id: '2', name: 'Suppressed', target: 'all', value: -2 },
    { id: '3', name: 'Blinded', target: 'attr-reflex', value: -2 }
  ];

  const mightBonus = calculateActiveModifiersBonus(activeModifiers, 'attr-might');
  assert.equal(mightBonus, -1);

  const reflexBonus = calculateActiveModifiersBonus(activeModifiers, 'attr-reflex');
  assert.equal(reflexBonus, -4);
});

test('interactivePlayService: Canonical 2d10 Check Evaluation with Real DB Operative', () => {
  const armorerArch = DEFAULT_ARCHETYPES.find(a => a.id === 'archetype-armorer') || DEFAULT_ARCHETYPES[0];
  const operative = createOperativeFromDatabasePersona(armorerArch, 'omnicortex');

  assert.ok(operative, 'Created operative from database archetype');
  // Armorer primary is Intellect (+3) -> Reason base = 2 + (3*2) = 8
  assert.equal(operative.subAttributes['attr-logic'], 8);

  const result = evaluateTangentCheck({
    operative,
    skillName: 'Engineering',
    subAttrKey: 'attr-logic',
    targetCR: 14,
    activeModifiers: [{ id: 'boost', name: 'Tech Boost', target: 'attr-logic', value: 2 }]
  });

  assert.equal(result.baseScore, 8);
  assert.equal(result.modBonus, 2);
  assert.equal(result.totalMod, 10);
  assert.ok(result.total >= 12 && result.total <= 30);
  assert.ok(['critical_success', 'success', 'cost_success', 'failure', 'critical_fumble'].includes(result.tier));
});
