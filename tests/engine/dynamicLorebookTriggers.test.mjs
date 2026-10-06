/**
 * @file dynamicLorebookTriggers.test.mjs
 * @description Unit tests for Pillar 1 Dynamic Lorebook upgrades:
 * - Selective boolean logic (AND ANY, AND ALL, NOT ANY, NOT ALL, OR)
 * - Speaker codes (\x01{{user}}:, [User: {{user}}], [NPC: {{char}}])
 * - Constrained recursion (strictly capped at 1 to 3 passes)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  scanDynamicLorebook, 
  compileTriggerRegex, 
  evaluateSelectiveBooleanLogic,
  normalizeTriggers 
} from '../../src/services/lorebookScanner.ts';

test('Dynamic Lorebook: Selective Boolean Logic Evaluation', () => {
  // 1. AND_ANY: requires at least one primary AND at least one secondary
  const andAnyPass = evaluateSelectiveBooleanLogic({
    triggerLogic: 'AND_ANY',
    primaryMatches: ['cyberdeck'],
    secondaryMatches: ['overclock'],
    secondaryTotal: 2
  });
  assert.equal(andAnyPass.isMatch, true);
  assert.ok(andAnyPass.triggerLabel.includes('AND ANY'));

  const andAnyFail = evaluateSelectiveBooleanLogic({
    triggerLogic: 'AND_ANY',
    primaryMatches: ['cyberdeck'],
    secondaryMatches: [],
    secondaryTotal: 2
  });
  assert.equal(andAnyFail.isMatch, false);

  // 2. AND_ALL: requires ALL primary triggers
  const andAllPass = evaluateSelectiveBooleanLogic({
    triggerLogic: 'AND_ALL',
    primaryMatches: ['docking', 'bay', 'airlock'],
    primaryTotal: 3
  });
  assert.equal(andAllPass.isMatch, true);

  const andAllFail = evaluateSelectiveBooleanLogic({
    triggerLogic: 'AND_ALL',
    primaryMatches: ['docking', 'bay'],
    primaryTotal: 3
  });
  assert.equal(andAllFail.isMatch, false);

  // 3. NOT_ANY: primary matches, but NONE of the secondary triggers match
  const notAnyPass = evaluateSelectiveBooleanLogic({
    triggerLogic: 'NOT_ANY',
    primaryMatches: ['syndicate'],
    secondaryMatches: [],
    secondaryTotal: 1
  });
  assert.equal(notAnyPass.isMatch, true);

  const notAnyFail = evaluateSelectiveBooleanLogic({
    triggerLogic: 'NOT_ANY',
    primaryMatches: ['syndicate'],
    secondaryMatches: ['undercover_cop'],
    secondaryTotal: 1
  });
  assert.equal(notAnyFail.isMatch, false);

  // 4. NOT_ALL: primary matches, but NOT ALL secondary triggers are present
  const notAllPass = evaluateSelectiveBooleanLogic({
    triggerLogic: 'NOT_ALL',
    primaryMatches: ['infiltrate'],
    secondaryMatches: ['alarm'],
    secondaryTotal: 2
  });
  assert.equal(notAllPass.isMatch, true);

  const notAllFail = evaluateSelectiveBooleanLogic({
    triggerLogic: 'NOT_ALL',
    primaryMatches: ['infiltrate'],
    secondaryMatches: ['alarm', 'lockdown'],
    secondaryTotal: 2
  });
  assert.equal(notAllFail.isMatch, false);
});

test('Dynamic Lorebook: Speaker Code Regex & Placeholders (ASCII \\x01 and Tagged Formats)', () => {
  const userHandle = 'Valen Cross';
  const targetCharName = 'Broker Nix';

  // 1. ASCII \x01 speaker code: /\x01{{user}}:[^\x01]*?hello/i
  const rxAscii = compileTriggerRegex('/\\x01{{user}}:[^\\x01]*?hello/i', userHandle, targetCharName);
  assert.ok(rxAscii instanceof RegExp);

  // Spoken by user directly to NPC -> Match
  const directSpeech = `\x01${userHandle}: hello there, Nix.\x01`;
  assert.equal(rxAscii.test(directSpeech), true);

  // Merely mentioned in third-person descriptive prose -> No Match!
  const ambientProse = `The rain beat against the window as Valen Cross pondered how to say hello to the syndicate boss.`;
  assert.equal(rxAscii.test(ambientProse), false);

  // Spoken by another NPC, not user -> No Match!
  const npcSpeech = `\x01Sentry Drone: hello unauthorized intruder.\x01`;
  assert.equal(rxAscii.test(npcSpeech), false);

  // 2. Tagged format: /[User: {{user}}][^\n]*?override/i
  const rxTagged = compileTriggerRegex('/\\[User: {{user}}\\][^\\n]*?override/i', userHandle, targetCharName);
  assert.ok(rxTagged instanceof RegExp);
  assert.equal(rxTagged.test(`[User: ${userHandle}] I need an emergency override immediately.`), true);
  assert.equal(rxTagged.test(`[NPC: Sentry] override requested by unknown unit.`), false);
});

test('Dynamic Lorebook: scanDynamicLorebook with selective boolean triggers and recursion cap', () => {
  const catalog = [
    {
      id: 'elem_classified_ai',
      title: 'Classified Sub-Cortex AI',
      type: 'Technology',
      lorebook: {
        primaryTriggers: ['sub-cortex', 'black-site AI'],
        secondaryTriggers: ['terminal', 'decrypted'],
        triggerLogic: 'AND_ANY',
        priority: 90,
        budgetTokens: 150
      },
      fields: {
        oneLinePitch: 'Experimental sentient sub-cortex processor recovered from Black Site Alpha.'
      }
    },
    {
      id: 'elem_black_site_alpha',
      title: 'Black Site Alpha',
      type: 'Setting',
      lorebook: {
        primaryTriggers: ['Black Site Alpha', 'orbital bunker'],
        triggerLogic: 'OR',
        priority: 80,
        budgetTokens: 150
      },
      fields: {
        oneLinePitch: 'Decommissioned black-site installation hidden within an asteroid belt.'
      }
    }
  ];

  // 1. Without secondary trigger 'terminal', elem_classified_ai should NOT inject (AND_ANY)
  const result1 = scanDynamicLorebook({
    input: 'The operative examined the sub-cortex processor resting on the table.',
    catalog,
    config: { maxRecursionPasses: 3 }
  });
  assert.equal(result1.injectedEntries.some(e => e.id === 'elem_classified_ai'), false);

  // 2. With secondary trigger 'terminal', elem_classified_ai matches in Pass 1,
  // and in Pass 2, Black Site Alpha matches associatively from its snippet text!
  const result2 = scanDynamicLorebook({
    input: 'The operative interfaced the sub-cortex into the terminal.',
    catalog,
    config: { maxRecursionPasses: 3 }
  });
  assert.equal(result2.injectedEntries.some(e => e.id === 'elem_classified_ai'), true);
  assert.equal(result2.injectedEntries.some(e => e.id === 'elem_black_site_alpha'), true);
  assert.ok(result2.passesExecuted >= 2);
  assert.ok(result2.passesExecuted <= 3); // Strictly capped
});
