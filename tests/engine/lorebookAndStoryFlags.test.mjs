/**
 * @file lorebookAndStoryFlags.test.mjs
 * @description Unit tests for Phase 1 Dynamic Lorebook Architecture & Story Flag Ledger.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { useADEStore, evaluateConditionExpression } from '../../src/pages/Foundry/store/adeStore.ts';
import { scanDynamicLorebook, compileTriggerRegex, estimateTokenCount } from '../../src/services/lorebookScanner.ts';

test('StoryFlagLedger: manages global and scenario-scoped story variables', () => {
  const store = useADEStore.getState();

  // Initial state check
  assert.equal(typeof store.storyFlags, 'object');
  assert.equal(store.lorebookConfig.maxTokens, 1200);
  assert.equal(store.lorebookConfig.maxRecursionPasses, 3);

  // Set global flag
  store.setStoryFlag('alarm_triggered', true);
  assert.equal(store.getStoryFlag('alarm_triggered'), true);

  // Set numeric flag and increment
  store.setStoryFlag('reputation_syndicate', 10);
  assert.equal(store.getStoryFlag('reputation_syndicate'), 10);
  store.incrementStoryFlag('reputation_syndicate', 5);
  assert.equal(store.getStoryFlag('reputation_syndicate'), 15);

  // Set scenario-scoped flag
  store.setStoryFlag('docking_bay_breached', true, 'scenario', 'scenario_sector_4');
  assert.equal(store.getStoryFlag('docking_bay_breached'), true);

  // Reset scenario flags
  store.resetScenarioFlags('scenario_sector_4');
  assert.equal(store.getStoryFlag('docking_bay_breached'), undefined);
  // Global flag remains
  assert.equal(store.getStoryFlag('alarm_triggered'), true);

  // Remove flag
  store.removeStoryFlag('alarm_triggered');
  assert.equal(store.getStoryFlag('alarm_triggered'), undefined);
});

test('evaluateConditionExpression: evaluates deterministic logical and comparison expressions', () => {
  const flags = {
    alarm_active: { value: true },
    stealth_mode: { value: false },
    reputation: { value: 15 },
    threat_tier: { value: 'hazardous' },
    security_level: { value: 3 }
  };

  // Direct boolean existence
  assert.equal(evaluateConditionExpression('alarm_active', flags), true);
  assert.equal(evaluateConditionExpression('stealth_mode', flags), false);
  assert.equal(evaluateConditionExpression('non_existent', flags), false);

  // Negation
  assert.equal(evaluateConditionExpression('!alarm_active', flags), false);
  assert.equal(evaluateConditionExpression('!stealth_mode', flags), true);

  // Comparisons
  assert.equal(evaluateConditionExpression('reputation >= 10', flags), true);
  assert.equal(evaluateConditionExpression('reputation > 20', flags), false);
  assert.equal(evaluateConditionExpression('threat_tier == "hazardous"', flags), true);
  assert.equal(evaluateConditionExpression('security_level == 3', flags), true);
  assert.equal(evaluateConditionExpression('security_level != 5', flags), true);

  // Conjunction (&&)
  assert.equal(evaluateConditionExpression('alarm_active && !stealth_mode', flags), true);
  assert.equal(evaluateConditionExpression('alarm_active && reputation > 20', flags), false);

  // Disjunction (||)
  assert.equal(evaluateConditionExpression('reputation > 20 || alarm_active', flags), true);
  assert.equal(evaluateConditionExpression('!alarm_active || stealth_mode', flags), false);
});

test('compileTriggerRegex: compiles character codes and regex expressions safely', () => {
  const rx1 = compileTriggerRegex('/\\b(AET-[0-9]{2,4}|aethelgard)\\b/i');
  assert.ok(rx1 instanceof RegExp);
  assert.ok(rx1.test('Operative entered AET-402 sector'));
  assert.ok(rx1.test('Target heading to Aethelgard'));
  assert.equal(rx1.test('Standard cargo bay'), false);

  const rx2 = compileTriggerRegex('\\bEMP-[A-Z0-9]+\\b');
  assert.ok(rx2.test('Deploy EMP-X1 device'));
  assert.equal(rx2.test('Deploy standard thermal charge'), false);

  // Invalid regex fails gracefully
  const rxInvalid = compileTriggerRegex('[unclosed');
  assert.equal(rxInvalid, null);
});

test('lorebookScanner: executes Pass 1 surface scan and regex matching', () => {
  const catalog = [
    {
      id: 'elem_aethelgard',
      title: 'Aethelgard High Citadel',
      type: 'Setting',
      fields: {
        primaryTriggers: 'citadel, high spire, aethelgard',
        triggerRegex: '/\\b(AET-[0-9]{2,4}|aethelgard)\\b/i',
        loreScanPriority: 80,
        loreBudgetTokens: 150,
        corePremise: 'The central orbital spire governing Sector 4.'
      }
    },
    {
      id: 'elem_drone',
      title: 'Vanguard Security Sentry',
      type: 'Persona',
      fields: {
        primaryTriggers: 'sentry, security drone, patrol',
        loreScanPriority: 60,
        loreBudgetTokens: 100,
        oneLinePitch: 'Automated patrol chassis armed with kinetic repeaters.'
      }
    },
    {
      id: 'elem_unrelated',
      title: 'Hydroponics Bay Delta',
      type: 'Setting',
      fields: {
        primaryTriggers: 'algae, greenhouse, hydroponics',
        loreScanPriority: 40,
        corePremise: 'Peaceful food production vaults.'
      }
    }
  ];

  const result = scanDynamicLorebook({
    input: 'Operative approaching AET-104 near the high spire',
    activeScenario: { title: 'Docking Bay Infiltration' },
    catalog,
    storyFlags: {},
    config: { maxTokens: 1200, maxRecursionPasses: 3 }
  });

  assert.equal(result.injectedEntries.length, 1);
  assert.equal(result.injectedEntries[0].id, 'elem_aethelgard');
  assert.equal(result.injectedEntries[0].passMatched, 1);
  assert.ok(result.tokensUsed > 0);
  assert.ok(result.tokensUsed <= 1200);
  assert.ok(result.formattedPromptContext.includes('Aethelgard High Citadel'));
  assert.equal(result.formattedPromptContext.includes('Hydroponics Bay Delta'), false);
});

test('lorebookScanner: Story Flag Ledger suppresses lore during active state changes', () => {
  const catalog = [
    {
      id: 'elem_peaceful_plaza',
      title: 'Plaza Merchants',
      type: 'Setting',
      fields: {
        primaryTriggers: 'plaza, square, promenade',
        loreSuppressCondition: 'alarm_triggered == true',
        loreScanPriority: 50,
        corePremise: 'Bustling peaceful market square with vendors selling exo-fruits.'
      }
    },
    {
      id: 'elem_lockdown_protocol',
      title: 'Bulkhead Lockdown Grid',
      type: 'Technology',
      fields: {
        primaryTriggers: 'plaza, security, alarm',
        loreRequireCondition: 'alarm_triggered == true',
        loreScanPriority: 90,
        corePremise: 'Emergency titanium gates that seal the plaza under threat.'
      }
    }
  ];

  // Scenario 1: Alarm is NOT triggered
  const resultQuiet = scanDynamicLorebook({
    input: 'Operative looks around the plaza',
    catalog,
    storyFlags: { alarm_triggered: { value: false } }
  });

  assert.equal(resultQuiet.injectedEntries.length, 1);
  assert.equal(resultQuiet.injectedEntries[0].id, 'elem_peaceful_plaza');

  // Scenario 2: Alarm IS triggered (Suppresses peaceful plaza, activates lockdown grid)
  const resultAlarm = scanDynamicLorebook({
    input: 'Operative looks around the plaza as alarms blare',
    catalog,
    storyFlags: { alarm_triggered: { value: true } }
  });

  assert.equal(resultAlarm.injectedEntries.length, 1);
  assert.equal(resultAlarm.injectedEntries[0].id, 'elem_lockdown_protocol');
  assert.equal(resultAlarm.suppressedCount, 1);
});

test('lorebookScanner: executes multi-pass recursive associative scanning (Pass 1 -> Pass 2 -> Pass 3)', () => {
  const catalog = [
    // Matched in Pass 1 via user input "ion rifle"
    {
      id: 'elem_weapon',
      title: 'Prototype Ion Rifle',
      type: 'Technology',
      fields: {
        primaryTriggers: 'ion rifle, particle beam',
        loreScanPriority: 80,
        functionPurpose: 'High-energy disruptor powered by a Precursor Aether Core.'
      }
    },
    // Matched in Pass 2 via "Precursor Aether Core" in elem_weapon's text
    {
      id: 'elem_power_source',
      title: 'Precursor Aether Core',
      type: 'Technology',
      fields: {
        primaryTriggers: 'aether core, precursor power',
        secondaryTriggers: 'Precursor Aether Core, aether tap',
        loreScanPriority: 70,
        functionPurpose: 'Zero-point crystal tapped into the Void Veil.'
      }
    },
    // Matched in Pass 3 via "Void Veil" in elem_power_source's text
    {
      id: 'elem_cosmology',
      title: 'The Void Veil',
      type: 'World',
      fields: {
        primaryTriggers: 'void veil, dimensional rift',
        secondaryTriggers: 'Void Veil, zero-point crystal',
        loreScanPriority: 60,
        corePremise: 'The metaphysical dimension separating physical space from pure essence.'
      }
    },
    // Not triggered
    {
      id: 'elem_unrelated',
      title: 'Mining Barge Alpha',
      type: 'Setting',
      fields: {
        primaryTriggers: 'mining barge, asteroid drill',
        corePremise: 'Industrial vessel.'
      }
    }
  ];

  const result = scanDynamicLorebook({
    input: 'Operative aims the prototype ion rifle at the bulkhead',
    catalog,
    storyFlags: {},
    config: { maxTokens: 1200, maxRecursionPasses: 3, enableRecursiveScanning: true }
  });

  assert.equal(result.passesExecuted, 3);
  assert.equal(result.injectedEntries.length, 3);

  const matchedPasses = result.injectedEntries.map(e => e.passMatched).sort();
  assert.deepEqual(matchedPasses, [1, 2, 3]);

  // Verified associative chain: Weapon (P1) -> Core (P2) -> Veil (P3)
  const ids = result.injectedEntries.map(e => e.id);
  assert.ok(ids.includes('elem_weapon'));
  assert.ok(ids.includes('elem_power_source'));
  assert.ok(ids.includes('elem_cosmology'));
  assert.equal(ids.includes('elem_unrelated'), false);
});

test('lorebookScanner: strictly honors token budget and priority sorting', () => {
  const largeCatalog = Array.from({ length: 20 }, (_, idx) => ({
    id: `elem_dense_${idx}`,
    title: `Lore Record ${idx}`,
    type: 'Setting',
    fields: {
      primaryTriggers: 'dense, sector, tactical',
      loreScanPriority: idx * 5, // 0, 5, 10 ... 95
      loreBudgetTokens: 150,
      corePremise: `A very detailed description of tactical sector ${idx} containing intricate architectural layouts and fortifications `.repeat(4)
    }
  }));

  const maxTokens = 600;
  const result = scanDynamicLorebook({
    input: 'Scanning tactical sector coordinates',
    catalog: largeCatalog,
    storyFlags: {},
    config: { maxTokens, maxRecursionPasses: 1 }
  });

  assert.ok(result.tokensUsed <= maxTokens, `Tokens used ${result.tokensUsed} exceeded budget ${maxTokens}`);
  // Higher priority items should be injected first
  assert.ok(result.injectedEntries[0].priority >= result.injectedEntries[1].priority);
  assert.equal(result.injectedEntries[0].id, 'elem_dense_19'); // Highest priority (95)
});
