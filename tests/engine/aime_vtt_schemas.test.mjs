/**
 * @file aime_vtt_schemas.test.mjs
 * @description Unit verification for AIME Narrative Agent VTT Schema Generation.
 * Validates RAG-augmented generation of canonical .persona and .scene schemas,
 * schema validation, and conversion to ready-to-deploy Stage tokens and maps.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateAimePersonaSchema,
  generateAimeSceneSchema,
  convertPersonaToVttToken,
  convertSceneToVttMap
} from '../../src/services/aimeVttSchemaService.ts';
import { useEngineStore, selectFusedToken } from '../../src/engine/state/VolatileSharder.ts';

test('AIME Narrative Agent: generateAimePersonaSchema conforms to canonical rules', async () => {
  const persona = await generateAimePersonaSchema({
    prompt: 'Alterian Void Marine with kinetic carbine and heavy ceramic plating',
    archetype: 'Commando',
    species: 'Alterian',
    techLevel: 3,
    mcmRole: 'Commando',
    mcmDesignation: 'Adversary'
  });

  assert.ok(persona, 'Persona should be generated');
  assert.equal(persona.type, 'Persona');
  assert.ok(persona.name.length > 0, 'Persona should have a valid name');
  assert.equal(persona.techLevel, 3);
  assert.ok(persona.health >= 30, 'Health should follow base 30 formula');
  assert.ok(persona.vitality >= 30, 'Vitality should follow base 30 formula');
  assert.ok(persona.armorDr >= 4, 'TL3 armor DR should be >= 4');
  assert.ok(Array.isArray(persona.attacks) && persona.attacks.length > 0, 'Must have at least one attack');
  assert.ok(persona.attacks[0].damageFormula.includes('d10'), 'Attack damage must follow 2d10 mechanics');
  assert.ok(persona.oneLinePitch.length > 10, 'Must have a descriptive one-line pitch');
});

test('AIME Narrative Agent: convertPersonaToVttToken deploys directly into useEngineStore', () => {
  const mockPersona = {
    id: 'persona-marine-01',
    type: 'Persona',
    name: 'Sergeant Vane',
    archetype: 'Commando',
    oneLinePitch: 'A battle-hardened void marine enforcer.',
    physicalDescription: 'Heavy composite plate, cyber-ocular targeting suite.',
    personalityMannerisms: 'Curt, analytical.',
    backgroundHistory: 'Veteran of the Outer Rim skirmishes.',
    goalsMotivations: 'Defend sector perimeter.',
    strengthsFlaws: 'Steely resolve, vulnerable to ion damage.',
    roleInStory: 'Squad Commander',
    relationships: 'Commanding Officer',
    mcmTier: 3,
    mcmDesignation: 'Adversary',
    mcmChassis: 'Combatant',
    mcmRole: 'Commando',
    health: 45,
    vitality: 40,
    karma: 3,
    techLevel: 3,
    magicLevel: 0,
    armorDr: 8,
    speedFt: 30,
    attacks: [
      { name: 'Kinetic Rifle', damageFormula: '2d10 + 6 Kinetic', rangeFt: 60, type: 'Ranged' }
    ],
    gear: ['Combat Harness', 'Stun Grenade'],
    features: ['Evasive Stance']
  };

  const token = convertPersonaToVttToken(mockPersona, { x: 450, y: 350, designation: 'Adversary' });

  assert.equal(token.id, 'persona-marine-01');
  assert.equal(token.name, 'Sergeant Vane');
  assert.equal(token.base_health, 45);
  assert.equal(token.base_vitality, 40);
  assert.equal(token.armor_dr, 8);
  assert.equal(token.is_persona, false);

  // Deploy to engine store
  const store = useEngineStore.getState();
  store.loadStaticEntitiesBatch([token]);
  store.updatePosition(token.id, 450, 350);

  const fused = selectFusedToken(useEngineStore.getState(), 'persona-marine-01');
  assert.ok(fused !== null, 'Fused token should exist in engine store');
  assert.equal(fused.x, 450);
  assert.equal(fused.y, 350);
  assert.equal(fused.current_health, 45);
  assert.equal(fused.armor_dr, 8);
});

test('AIME Narrative Agent: generateAimeSceneSchema & convertSceneToVttMap creates playable Stage map', async () => {
  const scene = await generateAimeSceneSchema({
    prompt: 'Depressurized Precursor Research Vault with automated laser defenses',
    location: 'Deep Orbital Vault 09',
    techLevel: 4,
    threatTier: 3
  });

  assert.ok(scene, 'Scene should be generated');
  assert.equal(scene.type, 'Scene');
  assert.ok(scene.sceneName.includes('VAULT') || scene.sceneName.includes('INT.'), 'Slugline should reflect location');
  assert.ok(scene.sceneBeats.length >= 3, 'Scene should have sequential beats');
  assert.ok(scene.readAloud.length > 20, 'Should include GM read-aloud narration');
  assert.ok(scene.suggestedLighting.lights.length >= 1, 'Should include dynamic lights');

  // Convert to VTT playable map
  const vttMap = convertSceneToVttMap(scene);
  assert.ok(vttMap.id.length > 0);
  assert.equal(vttMap.title, scene.sceneName);
  assert.equal(vttMap.grid_size, 50);
  assert.ok(vttMap.tokens.length >= 1, 'Should contain pre-placed adversary or sentry tokens');
  assert.ok(vttMap.objects.length >= 1, 'Should contain interactive objects (bulkheads, terminals, or crates)');
  assert.ok(vttMap.lights.length >= 1, 'Should contain lighting sources');
});
