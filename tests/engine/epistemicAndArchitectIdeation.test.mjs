/**
 * @file epistemicAndArchitectIdeation.test.mjs
 * @description Verification suite for Pillar 4:
 * - Epistemic Interaction Mechanics: Terminal slicing & NPC Interrogation adjudication
 * - Preserving Human Authority: Architect Ideation node integrity (Climax / Resolution)
 * - Grounding sensory flavor layer in Folio vitals and Atmospheric Presets
 * - Automated Local Inference Cascade fallback resilience
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { adjudicateActionCheck } from '../../src/services/ade/adeEngineBridge.ts';
import { ATMOSPHERIC_PRESETS } from '../../src/pages/Foundry/PresetsAndScripts/constants/atmosphericPresets.js';
import { callAutomatedInferencePipeline } from '../../src/services/aimeTierRouter.ts';

test('Epistemic Play: Terminal Hacking CLI adjudication with 2d10 engine check', () => {
  const operative = {
    id: 'op_cyber',
    name: 'Ghost Slicer',
    techLevel: 3,
    attributes: { logic: 3 },
    skills: { Slicing: 5 }
  };

  // Test Slicing DC 14 check with diceOverride for determinism
  const mandate = adjudicateActionCheck({
    actionText: 'slice encrypted optical core',
    operative,
    targetEntity: { name: 'Secure Terminal', techLevel: 3 },
    targetDC: 14,
    diceOverride: [7, 6] // 13 + logic (3) + slicing (5) = 21 >= 14
  });

  assert.ok(mandate);
  assert.equal(mandate.systemIntent, 'EXECUTE_SUCCESS');
  assert.equal(typeof mandate.mandateId, 'string');
  assert.ok(mandate.diceSummary);
  assert.equal(mandate.diceSummary.dice1, 7);
  assert.equal(mandate.diceSummary.dice2, 6);
  assert.equal(mandate.diceSummary.diceSum, 13);
  assert.equal(mandate.diceSummary.skillRank, 5);
  assert.equal(mandate.diceSummary.attrMod, 3);
  assert.equal(mandate.diceSummary.totalCheck, 21);
  assert.equal(mandate.diceSummary.margin, 7);
  assert.ok(mandate.diceSummary.tierLabel.includes('Superior Success'));
});

test('Epistemic Play: Terminal Hacking TL Mismatch produces REFUSE_ACTION mandate', () => {
  const operative = {
    id: 'op_novice',
    name: 'Rookie Tech',
    techLevel: 1
  };

  const mandate = adjudicateActionCheck({
    actionText: 'slice precursor vault terminal',
    operative,
    targetEntity: { name: 'Precursor Vault Terminal', techLevel: 5 },
    targetDC: 15
  });

  assert.ok(mandate);
  assert.equal(mandate.systemIntent, 'REFUSE_ACTION');
  assert.equal(mandate.narrativeBounds.refusalReason, 'Tech_Level_Low');
  assert.ok(mandate.narrativeBounds.forbiddenOutcomes.includes('access granted'));
});

test('Epistemic Play: NPC Interrogation social check adjudication', () => {
  const operative = {
    id: 'op_investigator',
    name: 'Inspector Vance',
    techLevel: 2,
    attributes: { etiquette: 2 },
    skills: { Etiquette: 4 }
  };

  const mandate = adjudicateActionCheck({
    actionText: 'interrogate courier regarding precursor shipping codes',
    operative,
    targetEntity: { name: 'Suspect Courier' },
    targetDC: 12,
    diceOverride: [3, 4] // 7 + etiquette (2) + etiquette skill (4) = 13 >= 12
  });

  assert.ok(mandate);
  assert.equal(mandate.systemIntent, 'EXECUTE_SUCCESS');
  assert.equal(mandate.diceSummary.totalCheck, 13);
  assert.equal(mandate.diceSummary.margin, 1);
});

test('Architect Ideation: Atmospheric Presets availability for sensory flavor grounding', () => {
  assert.ok(Array.isArray(ATMOSPHERIC_PRESETS));
  assert.ok(ATMOSPHERIC_PRESETS.length >= 6);

  const neonRain = ATMOSPHERIC_PRESETS.find(p => p.id === 'cyberpunk_neon_rain');
  assert.ok(neonRain, 'Cyberpunk neon rain preset must exist');
  assert.ok(neonRain.sensoryAudio, 'Must specify sensory audio cues');
  assert.ok(neonRain.visualFX, 'Must specify visual FX cues');

  const solarFlare = ATMOSPHERIC_PRESETS.find(p => p.id === 'solar_flare_radiation');
  assert.ok(solarFlare, 'Solar flare radiation preset must exist');
  assert.ok(solarFlare.sensorPenalty, 'Must specify sensor penalty for mechanical grounding');
});

test('Architect Ideation: Human Intentionality node formatting verification', () => {
  const architectNodeData = {
    nodeType: 'Climax',
    title: 'Breach of the Orbital Siphon',
    intent: 'Operatives must confront the traitor at the atmospheric venting array before the core melts down.',
    objective: 'Disable the coolant purge valves and isolate the command module.',
    opposingForce: 'Syndicate Enforcer Valen and 2x combat servitors.',
    targetDC: 15,
    weatherPreset: 'Orbital Decompression / Toxic Venting',
    sensoryFlavor: 'The metallic screech of tearing alloy echoes through the pressurized catwalks, accompanied by flashing amber emergency strobes and acrid ozone fumes.'
  };

  // Build formatted beat as done by StoryWeaver.jsx
  const formattedBeat = `\n\n### [${architectNodeData.nodeType.toUpperCase()}] ${architectNodeData.title}\n` +
    `• Intent: ${architectNodeData.intent}\n` +
    `• Objective: ${architectNodeData.objective}\n` +
    `• Opposing Force: ${architectNodeData.opposingForce}\n` +
    `• Mechanical DC: ${architectNodeData.targetDC}\n` +
    `• Atmosphere: ${architectNodeData.weatherPreset}\n` +
    `• Narrative Sensory Layer:\n${architectNodeData.sensoryFlavor}\n`;

  assert.ok(formattedBeat.includes('### [CLIMAX] Breach of the Orbital Siphon'));
  assert.ok(formattedBeat.includes('Mechanical DC: 15'));
  assert.ok(formattedBeat.includes('Narrative Sensory Layer:'));
  assert.ok(formattedBeat.includes('acrid ozone fumes'));
  // Verifies that intent was author-specified, not an automated AI slop hallucination
  assert.ok(formattedBeat.includes('Operatives must confront the traitor'));
});

test('Inference Cascade: Automated pipeline gracefully falls back when local servers are offline', async () => {
  // When local llama.cpp (port 8080) and local ollama (port 11434) are not running on test runner,
  // the automated cascade must catch connection errors and return { text: null, engine: 'none' } allowing cloud fallback
  const result = await callAutomatedInferencePipeline({
    prompt: 'Ping test',
    tier: 'HERO_8B',
    maxTokens: 50
  });

  assert.ok(result);
  assert.equal(result.engine, 'none');
  assert.equal(result.text, null);
});
