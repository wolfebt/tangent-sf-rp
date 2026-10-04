/**
 * @file presetsAndScriptsCatalog.test.mjs
 * @description Unit tests for ADE Pillar 3 (Presets & Scripts Studio) Dynamic Asset Aggregator & QuickJS Sandbox.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateModuleAssets, CATALOG_CATEGORIES } from '../../src/pages/Foundry/PresetsAndScripts/utils/assetAggregator.js';
import { QuickJSSandbox } from '../../src/engine/scripting/QuickJSSandbox.ts';
import { MACRO_TEMPLATES } from '../../src/pages/Foundry/PresetsAndScripts/constants/macroTemplates.js';
import { stepNpcPatrols } from '../../src/services/reactiveVttService.js';

test('aggregateModuleAssets: Normalizes across all 6 asset categories', () => {
  const elementsCatalog = [
    {
      id: 'persona-1',
      title: 'Kira Vance',
      type: 'Persona',
      fields: {
        mcmRole: 'Commando',
        mcmTier: '2',
        vttScriptActive: 'true',
        vttScript: JSON.stringify({ type: 'patrol', behaviorProfile: 'tactical', waypoints: [{ x: 100, y: 100 }] })
      }
    },
    {
      id: 'persona-2',
      title: 'Dr. Aris Thorne',
      type: 'Persona',
      fields: {
        mcmRole: 'Scientist',
        vttScriptActive: 'false'
      }
    },
    {
      id: 'item-1',
      title: 'Plasma Disruptor',
      type: 'Item',
      fields: {
        category: 'Weapons',
        techLevel: 4,
        macroScript: 'return { damage: 20 };'
      }
    },
    {
      id: 'hazard-1',
      title: 'Corrosive Acid Pool',
      type: 'Hazard',
      fields: {
        trapType: 'neurotoxin_vent',
        saveCr: 15
      }
    }
  ];

  const mapsCatalog = [
    {
      id: 'map-1',
      title: 'Reactor Core Deck 4',
      gridMode: 'Square',
      width: 40,
      height: 30,
      weather: { name: 'Reactor Amber Alert' },
      objects: [
        {
          id: 'obj-1',
          name: 'Proximity Laser Tripwire',
          isTrap: true,
          trapType: 'laser_tripwire',
          saveCr: 14
        },
        {
          id: 'obj-2',
          name: 'Sub-Deck Bulkhead',
          objectType: 'blast_door',
          doorState: 'closed'
        }
      ]
    }
  ];

  const universeState = {
    scenarios: [
      {
        id: 'scene-1',
        title: 'Infiltration Gate',
        type: 'Scene',
        content: 'Operatives breach airlock.',
        script: { trigger: 'onEnter' },
        children: []
      }
    ],
    scripts: [
      {
        id: 'macro-1',
        name: 'Auto Sentry Scan',
        category: 'Automation',
        code: 'return true;'
      }
    ]
  };

  const assets = aggregateModuleAssets({ elementsCatalog, mapsCatalog, universeState });

  // 1. Verify counts
  assert.ok(assets.length >= 7, 'Aggregates Personas, Items, Hazards, Map Objects, Maps, Scenes, and Macros');

  // 2. Verify Personas
  const p1 = assets.find(a => a.id === 'persona-1');
  assert.ok(p1, 'Finds scripted persona');
  assert.equal(p1.catalogCategory, 'personas');
  assert.equal(p1.isScripted, true, 'Correctly flags scripted persona');
  assert.equal(p1.scriptType, 'patrol');

  const p2 = assets.find(a => a.id === 'persona-2');
  assert.ok(p2, 'Finds unscripted persona');
  assert.equal(p2.isScripted, false, 'Correctly flags unscripted persona');

  // 3. Verify Map Objects / Traps
  const trapObj = assets.find(a => a.rawId === 'obj-1');
  assert.ok(trapObj, 'Extracts trap from map objects');
  assert.equal(trapObj.catalogCategory, 'props_traps');
  assert.equal(trapObj.isScripted, true);
  assert.equal(trapObj.mapId, 'map-1');

  // 4. Verify Maps
  const mapAsset = assets.find(a => a.id === 'map-1');
  assert.ok(mapAsset, 'Extracts map asset');
  assert.equal(mapAsset.catalogCategory, 'maps');
  assert.equal(mapAsset.isScripted, true, 'Map with weather is scripted');

  // 5. Verify Encounters / Scenes
  const sceneAsset = assets.find(a => a.id === 'scene-1');
  assert.ok(sceneAsset, 'Extracts scene asset from scenario tree');
  assert.equal(sceneAsset.catalogCategory, 'encounters');
  assert.equal(sceneAsset.isScripted, true);

  // 6. Verify Items with Macros
  const itemAsset = assets.find(a => a.id === 'item-1');
  assert.ok(itemAsset, 'Extracts item');
  assert.equal(itemAsset.catalogCategory, 'items');
  assert.equal(itemAsset.isScripted, true);

  // 7. Verify Module Macros
  const macroAsset = assets.find(a => a.rawId === 'macro-1');
  assert.ok(macroAsset, 'Extracts module macro');
  assert.equal(macroAsset.catalogCategory, 'macros');
  assert.equal(macroAsset.isScripted, true);
});

test('QuickJSSandbox: Pre-built Macro Templates execute cleanly', async () => {
  const sandbox = new QuickJSSandbox();

  // Test 1: BASTION 2d10 Check
  const bastionTpl = MACRO_TEMPLATES.find(t => t.id === 'bastion_roll');
  assert.ok(bastionTpl, 'Found BASTION template');
  const bastionResult = await sandbox.execute(bastionTpl.code);
  assert.ok(bastionResult.dice.length === 2);
  assert.ok(typeof bastionResult.total === 'number');
  assert.ok(['CRITICAL SUCCESS', 'TACTICAL GLITCH', 'SUCCESS', 'FAILURE'].includes(bastionResult.outcome));

  // Test 2: Hazard Pulse
  const hazardTpl = MACRO_TEMPLATES.find(t => t.id === 'hazard_pulse');
  assert.ok(hazardTpl, 'Found Hazard template');
  const hazardResult = await sandbox.execute(hazardTpl.code);
  assert.ok(hazardResult.hazard === 'Volatile Plasma Mine');
  assert.ok(typeof hazardResult.appliedHealthDamage === 'number');

  // Test 3: Cyber Intrusion
  const cyberTpl = MACRO_TEMPLATES.find(t => t.id === 'cyber_intrusion');
  assert.ok(cyberTpl, 'Found Cyber Intrusion template');
  const cyberResult = await sandbox.execute(cyberTpl.code);
  assert.ok(typeof cyberResult.breached === 'boolean');
});

test('QuickJSSandbox: Watchdog terminates infinite loops within 500ms', async () => {
  const sandbox = new QuickJSSandbox();
  const maliciousCode = 'while(true) {}';

  await assert.rejects(
    async () => {
      await sandbox.execute(maliciousCode);
    },
    /Watchdog Terminated/i,
    'Watchdog timer terminates infinite loop without freezing thread'
  );
});

test('reactiveVttService: stepNpcPatrols advances token waypoints in-situ', () => {
  const tokens = [
    {
      id: 'unit-1',
      name: 'Sentry Drone',
      x: 100,
      y: 100,
      script: {
        type: 'patrol',
        waypoints: [
          { x: 100, y: 100 },
          { x: 200, y: 100 }
        ],
        currentWaypointIndex: 1
      }
    }
  ];

  const updated = stepNpcPatrols(tokens, 25);
  assert.ok(updated.length === 1);
  assert.ok(updated[0].x > 100, 'Token moved along waypoint vector in-situ');
});
