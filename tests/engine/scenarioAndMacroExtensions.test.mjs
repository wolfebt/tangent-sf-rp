import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OBJECTIVE_TEMPLATES,
  evaluateScenarioProgress
} from '../../src/services/scenarioEngineService.js';

import {
  createOrbitalBridgeMap,
  createXenobiologyCavernMap,
  createNeonBlackMarketMap,
  createMagLevDepotMap,
  getStarterMapsCollection
} from '../../src/components/VTT/stage/defaultMaps.ts';

import { QuickJSSandbox } from '../../src/engine/scripting/QuickJSSandbox.ts';
import { MACRO_TEMPLATES } from '../../src/pages/Foundry/PresetsAndScripts/constants/macroTemplates.js';

test('Scenario Engine: Objective Templates and Canonical Evaluators', () => {
  // 1. Verify template registrations
  const templateIds = OBJECTIVE_TEMPLATES.map(t => t.id);
  assert.ok(templateIds.includes('zone_control'), 'Should register zone_control objective');
  assert.ok(templateIds.includes('countdown_timer'), 'Should register countdown_timer objective');
  assert.ok(templateIds.includes('item_delivery'), 'Should register item_delivery objective');
  assert.ok(templateIds.includes('extraction'), 'Should register extraction objective');

  // 2. Test Zone Control Evaluation
  const mockOperative = {
    id: 'op_1',
    name: 'Operative Jax',
    linkedHeroId: 'hero_jax',
    x: 610,
    y: 590,
    isDead: false,
    health: { current: 15 }
  };

  const zoneObjective = {
    id: 'obj_zone',
    title: 'Hold Bridge Nexus',
    type: 'zone_control',
    zoneX: 600,
    zoneY: 600,
    zoneRadius: 150,
    roundsRequired: 3,
    rewardAP: 3,
    rewardKarma: 2
  };

  // Round 1 in zone -> held 1 of 3 rounds
  const zoneRound1 = evaluateScenarioProgress([zoneObjective], [mockOperative], 1);
  assert.equal(zoneRound1.evaluations[0].isComplete, false);
  assert.ok(zoneRound1.evaluations[0].progressText.includes('Zone Held (1/3 Rounds)'));

  // Round 3 in zone -> completed
  const zoneRound3 = evaluateScenarioProgress([zoneObjective], [mockOperative], 3);
  assert.equal(zoneRound3.evaluations[0].isComplete, true);
  assert.equal(zoneRound3.allPrimaryComplete, true);
  assert.equal(zoneRound3.totalApReward, 3);
  assert.equal(zoneRound3.totalKarmaReward, 2);

  // 3. Test Countdown Timer Evaluation
  const timerObjective = {
    id: 'obj_timer',
    title: 'Decompression Clock',
    type: 'countdown_timer',
    maxRounds: 5,
    prerequisitesMet: false,
    rewardAP: 2
  };

  const timerActive = evaluateScenarioProgress([timerObjective], [], 4);
  assert.equal(timerActive.evaluations[0].isComplete, false);
  assert.equal(timerActive.evaluations[0].isFailed, false);
  assert.equal(timerActive.anyFailed, false);

  const timerFailed = evaluateScenarioProgress([timerObjective], [], 6);
  assert.equal(timerFailed.evaluations[0].isFailed, true);
  assert.equal(timerFailed.anyFailed, true);
  assert.ok(timerFailed.summaryText.includes('MISSION COMPROMISED'));

  // 4. Test Item Delivery Evaluation
  const itemObjective = {
    id: 'obj_delivery',
    title: 'Deliver Quantum Battery',
    type: 'item_delivery',
    dropX: 1000,
    dropY: 800,
    dropRadius: 100,
    payloadTokenId: 'token_battery',
    rewardAP: 2,
    rewardKarma: 1
  };

  const tokenFarAway = {
    id: 'token_battery',
    name: 'Quantum Core',
    x: 200,
    y: 200
  };

  const deliveryInProgress = evaluateScenarioProgress([itemObjective], [tokenFarAway], 1);
  assert.equal(deliveryInProgress.evaluations[0].isComplete, false);
  assert.ok(deliveryInProgress.evaluations[0].progressText.includes('In Transit'));

  const tokenAtDrop = {
    id: 'token_battery',
    name: 'Quantum Core',
    x: 1020,
    y: 810
  };

  const deliveryComplete = evaluateScenarioProgress([itemObjective], [tokenAtDrop], 2);
  assert.equal(deliveryComplete.evaluations[0].isComplete, true);
  assert.equal(deliveryComplete.allPrimaryComplete, true);
  assert.equal(deliveryComplete.totalApReward, 2);
});

test('Tactical Battlemaps: 4 New Environments and Starter Collection', () => {
  // 1. Orbital CIC Bridge
  const bridge = createOrbitalBridgeMap();
  assert.equal(bridge.title, 'Orbital Command CIC Bridge');
  assert.equal(bridge.gridType, 'square');
  assert.equal(bridge.gridSize, 70);
  assert.ok(bridge.walls.length >= 6, 'Bridge must have wall segments');
  assert.ok(bridge.lights.length >= 3, 'Bridge must have dynamic lights');
  assert.ok(bridge.objects.length >= 3, 'Bridge must have interactive consoles');
  assert.ok(bridge.tokens.length >= 2, 'Bridge must have starter operative/officer tokens');

  // 2. Xenobiology Caverns
  const cavern = createXenobiologyCavernMap();
  assert.equal(cavern.title, 'Xenobiology Bioluminescent Caverns');
  assert.equal(cavern.gridType, 'hex');
  assert.equal(cavern.gridSize, 70);
  assert.ok(cavern.walls.length >= 6, 'Cavern must have rock wall segments');
  assert.ok(cavern.lights.length >= 2, 'Cavern must have bioluminescent lights');
  assert.ok(cavern.objects.some(o => o.name.includes('Crystal') || o.name.includes('Chrysalis')));
  assert.ok(cavern.tokens.some(t => t.name.includes('Brood') || t.name.includes('Queen')));

  // 3. Neon Black Market
  const blackMarket = createNeonBlackMarketMap();
  assert.equal(blackMarket.title, 'Neon Black Market Alleyway');
  assert.equal(blackMarket.gridType, 'square');
  assert.ok(blackMarket.walls.length >= 4);
  assert.ok(blackMarket.lights.some(l => l.color.includes('ec4899') || l.color.includes('38bdf8')));
  assert.ok(blackMarket.objects.some(o => o.name.includes('ATM') || o.name.includes('Arms')));

  // 4. Mag-Lev Cargo Depot
  const depot = createMagLevDepotMap();
  assert.equal(depot.title, 'Heavy Mag-Lev Cargo Depot');
  assert.equal(depot.gridType, 'square');
  assert.ok(depot.walls.length >= 4);
  assert.ok(depot.lights.some(l => l.color.includes('f59e0b') || l.color.includes('ef4444')));
  assert.ok(depot.objects.some(o => o.name.includes('Mag-Lev') || o.name.includes('Crane')));

  // 5. Starter Collection Coverage
  const starters = getStarterMapsCollection();
  assert.ok(starters.length >= 7, 'Starter collection should contain at least 7 battlemaps');
  const starterTitles = starters.map(m => m.title);
  assert.ok(starterTitles.includes('Orbital Command CIC Bridge'));
  assert.ok(starterTitles.includes('Xenobiology Bioluminescent Caverns'));
  assert.ok(starterTitles.includes('Neon Black Market Alleyway'));
  assert.ok(starterTitles.includes('Heavy Mag-Lev Cargo Depot'));

  // Ensure unique IDs
  const idSet = new Set(starters.map(m => m.id));
  assert.equal(idSet.size, starters.length, 'Every starter map must have a unique ID');
});

test('QuickJS Sandbox: Standard Helper APIs & Execution Security', async () => {
  const sandbox = new QuickJSSandbox();

  // 1. Direct standard library methods
  const std = sandbox.createStandardLibrary({ storyFlags: { alarm_triggered: true } });
  
  // Dice
  const d6 = std.Dice.d(6);
  assert.ok(d6 >= 1 && d6 <= 6);
  const rolls = std.Dice.roll(3, 10);
  assert.equal(rolls.length, 3);
  rolls.forEach(r => assert.ok(r >= 1 && r <= 10));

  const check = std.Dice.check2d10(3, 14);
  assert.equal(check.dice.length, 2);
  assert.equal(check.total, check.roll + 3);
  assert.equal(check.margin, check.total - 14);
  assert.ok(['CRITICAL SUCCESS', 'TACTICAL GLITCH', 'SUCCESS', 'FAILURE'].includes(check.outcome));

  // MathOps
  assert.equal(std.MathOps.clamp(150, 0, 100), 100);
  assert.equal(std.MathOps.clamp(-20, 0, 100), 0);
  assert.equal(std.MathOps.margin(18, 14), 4);
  assert.equal(std.MathOps.roundTo(3.14159, 2), 3.14);

  // Trauma
  const traumaReport = std.Trauma.evaluateCalledShot('head', 20, 2);
  assert.equal(traumaReport.netDamage, 18);
  assert.equal(traumaReport.severity, 'CRITICAL');
  assert.ok(traumaReport.traumaApplied.includes('Concussion'));
  assert.ok(traumaReport.penalty.includes('Blindness'));

  // StoryFlags
  assert.equal(std.StoryFlags.get('alarm_triggered'), true);
  assert.equal(std.StoryFlags.get('unknown_key', 'default_val'), 'default_val');
  std.StoryFlags.set('power_grid_offline', true);
  assert.equal(std.StoryFlags.get('power_grid_offline'), true);
  assert.equal(std.StoryFlags.has('power_grid_offline'), true);

  // 2. In-Sandbox Execution with Injected Helpers
  const macroScript = `
    const check = Dice.check2d10(2, 12);
    const clamped = MathOps.clamp(check.total * 5, 0, 100);
    StoryFlags.set('last_check_total', check.total);
    return {
      checkTotal: check.total,
      clampedScore: clamped,
      flagPersisted: StoryFlags.get('last_check_total')
    };
  `;

  const scriptResult = await sandbox.execute(macroScript);
  assert.ok(scriptResult.checkTotal >= 4);
  assert.equal(scriptResult.flagPersisted, scriptResult.checkTotal);
  assert.ok(scriptResult.clampedScore >= 0 && scriptResult.clampedScore <= 100);

  // 3. Security Isolation Check (window, document, fetch shadowed)
  const securityScript = `
    return {
      windowIsUndefined: typeof window === 'undefined' || window === undefined,
      documentIsUndefined: typeof document === 'undefined' || document === undefined,
      fetchIsUndefined: typeof fetch === 'undefined' || fetch === undefined
    };
  `;
  const secResult = await sandbox.execute(securityScript);
  assert.equal(secResult.windowIsUndefined, true);
  assert.equal(secResult.documentIsUndefined, true);
  assert.equal(secResult.fetchIsUndefined, true);

  // 4. Watchdog Loop Timeout Rejection
  const infiniteLoopScript = `
    let counter = 0;
    while (true) {
      counter++;
    }
  `;
  await assert.rejects(
    async () => {
      await sandbox.execute(infiniteLoopScript);
    },
    (err) => {
      assert.ok(err.message.includes('Watchdog Terminated'));
      return true;
    }
  );
});

test('Macro Templates Catalog: All 12 Canonical Scripts Execute Cleanly', async () => {
  const sandbox = new QuickJSSandbox();

  assert.equal(MACRO_TEMPLATES.length, 12, 'Macro templates catalog should contain exactly 12 templates');

  const expectedIds = [
    'bastion_roll',
    'hazard_pulse',
    'loot_roller',
    'cyber_intrusion',
    'ambush_surprise_check',
    'trauma_blowout_eval',
    'artillery_scatter_matrix',
    'faction_morale_rout',
    'psionic_void_resonance',
    'vacuum_decompression',
    'black_market_haggle',
    'security_turret_ai'
  ];

  for (const templateId of expectedIds) {
    const template = MACRO_TEMPLATES.find(t => t.id === templateId);
    assert.ok(template, `Template ${templateId} must exist in catalog`);
    assert.ok(template.name, `Template ${templateId} must have a name`);
    assert.ok(template.category, `Template ${templateId} must have a category`);
    assert.ok(template.code, `Template ${templateId} must have executable code`);

    // Execute template code inside the sandbox
    try {
      const result = await sandbox.execute(template.code, {
        storyFlags: { syndicate_reputation: 3 }
      });
      assert.ok(result !== undefined, `Macro ${templateId} must return a defined result`);
      assert.equal(typeof result, 'object', `Macro ${templateId} must return an object payload`);
    } catch (err) {
      assert.fail(`Macro ${templateId} failed to execute cleanly in sandbox: ${err.message}`);
    }
  }
});
