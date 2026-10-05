import test from 'node:test';
import assert from 'node:assert/strict';

import {
  adjudicateActionCheck,
  createStructuralMandate,
  formatMandateForPrompt
} from '../../src/services/ade/adeEngineBridge.ts';

import {
  generateContent,
  streamContent,
  resolveIntelligenceTier,
  calculateVramTelemetry,
  LOD_TIERS
} from '../../src/services/aimeService.js';

test('Neuro-Symbolic Engine: Canonical 2d10 Check Adjudication', () => {
  const operative = {
    id: 'op_valen',
    name: 'Valen Cross',
    skills: { Kinetics: 3, Ballistics: 2 },
    subAttributes: { 'attr-might': 2, 'attr-reflex': 1 },
    vitals: { shields: 10, maxShields: 10, health: 12, maxHealth: 12 }
  };

  // 1. Predetermined Success Check (Dice: [6, 4] -> sum 10 + Kinetics 3 + Might 2 = 15 vs DC 12 -> Margin +3)
  const successMandate = adjudicateActionCheck({
    actionText: 'Kinetics strike the blast door lock mechanism',
    operative,
    targetDC: 12,
    skillName: 'Kinetics',
    subAttrKey: 'attr-might',
    diceOverride: [6, 4]
  });

  assert.equal(successMandate.systemIntent, 'EXECUTE_SUCCESS');
  assert.equal(successMandate.diceSummary.totalCheck, 15);
  assert.equal(successMandate.diceSummary.margin, 3);
  assert.ok(successMandate.mechanicalOutcomes.damageDealt > 0);
  assert.ok(successMandate.narrativeBounds.requiredSensoryCues.length > 0);
  assert.ok(successMandate.narrativeBounds.forbiddenOutcomes.includes('operative failure'));

  // 2. Predetermined Failure Check (Dice: [2, 1] -> sum 3 + Kinetics 3 + Might 2 = 8 vs DC 14 -> Margin -6)
  const failureMandate = adjudicateActionCheck({
    actionText: 'Kinetics strike with off-hand recoil',
    operative,
    targetDC: 14,
    skillName: 'Kinetics',
    subAttrKey: 'attr-might',
    diceOverride: [2, 1]
  });

  assert.equal(failureMandate.systemIntent, 'EXECUTE_FAILURE');
  assert.equal(failureMandate.diceSummary.totalCheck, 8);
  assert.equal(failureMandate.diceSummary.margin, -6);
  assert.ok(failureMandate.mechanicalOutcomes.conditionsApplied?.includes('Off-Balance'));

  // 3. Critical Triumph on Double 10s ([10, 10])
  const triumphMandate = adjudicateActionCheck({
    actionText: 'Strike target with precision kinetic discharge',
    operative,
    targetDC: 15,
    diceOverride: [10, 10]
  });

  assert.equal(triumphMandate.systemIntent, 'CRITICAL_TRIUMPH');
  assert.equal(triumphMandate.diceSummary.isDouble, true);
  assert.equal(triumphMandate.mechanicalOutcomes.damageDealt, 24);

  // 4. Critical Fumble on Double 1s ([1, 1])
  const fumbleMandate = adjudicateActionCheck({
    actionText: 'Strike target in desperate rush',
    operative,
    targetDC: 10,
    diceOverride: [1, 1]
  });

  assert.equal(fumbleMandate.systemIntent, 'CRITICAL_FUMBLE');
  assert.equal(fumbleMandate.diceSummary.isDouble, true);
  assert.equal(fumbleMandate.mechanicalOutcomes.shieldsDelta, -6);
  assert.equal(fumbleMandate.mechanicalOutcomes.alarmRaised, true);
});

test('Neuro-Symbolic Engine: Pre-emptive Tech Level Refusal Mandate', () => {
  const operativeWithTL2 = {
    id: 'op_hacker',
    name: 'Echo-7',
    techLevel: 2,
    skills: { Slicing: 5 },
    subAttributes: { 'attr-logic': 3 }
  };

  const precursorTerminal = {
    id: 'node_precursor_core',
    title: 'Precursor Dimensional Conduit',
    techLevel: 5
  };

  // Attempt to slice TL-5 system with TL-2 gear
  const refusalMandate = adjudicateActionCheck({
    actionText: 'Slice into precursor hard-light mainframe',
    operative: operativeWithTL2,
    targetEntity: precursorTerminal
  });

  // Must issue immediate REFUSE_ACTION before dice rolls
  assert.equal(refusalMandate.systemIntent, 'REFUSE_ACTION');
  assert.equal(refusalMandate.narrativeBounds.refusalReason, 'Tech_Level_Low');
  assert.ok(refusalMandate.mechanicalOutcomes.shieldsDelta < 0);
  assert.ok(refusalMandate.mechanicalOutcomes.conditionsApplied?.includes('Cyberdeck Overheated'));
  assert.ok(refusalMandate.narrativeBounds.forbiddenOutcomes.includes('access granted'));
  assert.ok(refusalMandate.narrativeBounds.requiredSensoryCues.includes('biometric cipher mismatch'));
});

test('Neuro-Symbolic Engine: Structural Mandate Prompt Formatting', () => {
  const mandate = createStructuralMandate({
    systemIntent: 'REFUSE_ACTION',
    actionName: 'Hack Quantum Firewall',
    initiatorName: 'Echo-7',
    targetEntity: 'Aegis Core',
    mechanicalOutcomes: {
      shieldsDelta: -2,
      conditionsApplied: ['Cyberdeck Overheated']
    },
    narrativeBounds: {
      refusalReason: 'Tech_Level_Low',
      requiredSensoryCues: ['incompatible photonic waveband'],
      forbiddenOutcomes: ['access granted'],
      prescribedOutcome: 'The deck capacitor discharges feedback.'
    }
  });

  const promptText = formatMandateForPrompt(mandate);
  assert.ok(promptText.includes('SYSTEM STRUCTURAL MANDATE'));
  assert.ok(promptText.includes('System Intent: REFUSE_ACTION'));
  assert.ok(promptText.includes('Mechanical Refusal Reason: Tech_Level_Low'));
  assert.ok(promptText.includes('STRICTLY FORBIDDEN NARRATIVE EVENTS: access granted'));
  assert.ok(promptText.includes('Mandatory Sensory Cues to Depict: incompatible photonic waveband'));
});

test('Neuro-Symbolic Engine: Deterministic Constrained JSON Output', async () => {
  const mandate = createStructuralMandate({
    systemIntent: 'EXECUTE_SUCCESS',
    actionName: 'Override Security Bulkhead',
    initiatorName: 'Valen Cross',
    mechanicalOutcomes: {
      bulkheadToggled: { id: 'bulkhead_sec_4', state: 'unlocked' }
    },
    narrativeBounds: {
      requiredSensoryCues: ['pneumatic hiss'],
      forbiddenOutcomes: ['operative failure'],
      prescribedOutcome: 'The lock unlocks smoothly.'
    }
  });

  // Call offline deterministic generation with enforceJson: true
  const rawOutput = await generateContent({
    prompt: 'Depict the bulkhead breach.',
    mandate,
    enforceJson: true
  });

  const parsed = JSON.parse(rawOutput);
  assert.ok(parsed.narrative, 'Must contain narrative text');
  assert.ok(parsed.gate, 'Must contain Decision Gate');
  assert.equal(parsed.gate.options.length, 3, 'Must have 3 tactical options');
  assert.ok(parsed.stageDeltas, 'Must contain stage deltas');
  assert.equal(parsed.stageDeltas[0].property, 'state');
  assert.equal(parsed.stageDeltas[0].newValue, 'unlocked');
});

test('Hardware Mitigation & LOD Tiering: Resolution and VRAM Telemetry', () => {
  // 1. Primary Operative / Complex Action -> Tier 1 Hero (8B)
  const heroTier = resolveIntelligenceTier({
    entityType: 'operative',
    actionText: 'Interrogate captive syndicate officer'
  });
  assert.equal(heroTier.key, 'tier1_hero');
  assert.equal(heroTier.parameterSize, '7B-8B');

  // 2. Automated Terminal / Sensor -> Tier 3 Ambient (1B)
  const ambientTier = resolveIntelligenceTier({
    isTerminal: true,
    actionText: 'Terminal readout diagnostic scan'
  });
  assert.equal(ambientTier.key, 'tier3_ambient');
  assert.equal(ambientTier.parameterSize, '1B');

  // 3. Tactical Skirmish -> Tier 2 Tactical (3B)
  const tacticalTier = resolveIntelligenceTier({
    actionText: 'Advance in formation and fire suppression bursts'
  });
  assert.equal(tacticalTier.key, 'tier2_tactical');
  assert.equal(tacticalTier.parameterSize, '3B');

  // 4. VRAM Telemetry Calculation & GQA Savings
  const telemetry8B = calculateVramTelemetry('tier1_hero', 4096);
  assert.ok(telemetry8B.fits8GbVram, '8B Q4_K_M with GQA must safely fit within 8GB VRAM');
  assert.ok(telemetry8B.gqaSavingsMb > 1000, 'GQA must provide >1GB VRAM savings on 8B model');
  assert.ok(telemetry8B.recommendedGqaFlags.includes('--cache-type-k q8_0'));

  const telemetry1B = calculateVramTelemetry('tier3_ambient', 1024);
  assert.ok(telemetry1B.totalEstimatedVramMb < 2000, '1B ambient tier must consume <2GB total VRAM');
});
