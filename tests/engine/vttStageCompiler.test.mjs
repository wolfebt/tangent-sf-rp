/**
 * @file vttStageCompiler.test.mjs
 * @description Unit tests for STAGE compiler service and manifest-only architecture.
 * Verifies:
 * 1. Validation of StageManifest (missing assets, orphan triggers)
 * 2. Compilation of pristine maps with synthesized anchor tokens and trigger zones
 * 3. Non-mutation: underlying source map asset remains pristine
 * 4. Multi-stage reuse: multiple stages binding the same map asset
 * 5. Environmental and variables ledger compilation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  validateStageManifest, 
  compileStage 
} from '../../src/pages/Foundry/Stage/vttModuleCompilerService.js';

test('Stage Compiler: validateStageManifest identifies missing map or story', () => {
  const emptyManifest = {
    id: 'stage-1',
    title: 'Empty Stage',
    mapId: '',
    scenarioIds: [],
    anchors: [],
    triggers: []
  };

  const validation = validateStageManifest(emptyManifest, null, null);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some(e => e.includes('missing a bound Map Asset')));
  assert.ok(validation.warnings.some(w => w.includes('no bound Story scenario')));
});

test('Stage Compiler: validateStageManifest flags orphan triggers', () => {
  const manifest = {
    id: 'stage-1',
    title: 'Orphan Trigger Stage',
    mapId: 'map-101',
    scenarioIds: ['sc-1'],
    anchors: [{ id: 'anchor-A', kind: 'waypoint', pos: { x: 100, y: 100 } }],
    triggers: [{ id: 'trig-1', anchorId: 'anchor-MISSING', on: 'enter', actions: [] }]
  };

  const validation = validateStageManifest(manifest, { id: 'map-101' }, { id: 'sc-1' });
  assert.equal(validation.valid, true); // Still valid with warning
  assert.ok(validation.warnings.some(w => w.includes('missing anchor "anchor-MISSING"')));
});

test('Stage Compiler: compileStage produces runtime bundle without mutating source map', () => {
  const pristineMap = {
    id: 'pristine-map-1',
    title: 'Pristine Sector',
    gridType: 'hex',
    lines: [],
    tokens: [{ id: 'token-orig', label: 'Existing Token', x: 50, y: 50 }],
    objects: []
  };

  // Deep clone to check immutability
  const originalSnapshot = JSON.stringify(pristineMap);

  const manifest = {
    id: 'stage-compiled-1',
    title: 'Infiltration Protocol',
    mapId: 'pristine-map-1',
    storyId: 'scenario-alpha',
    scenarioIds: ['scenario-alpha'],
    anchors: [
      {
        id: 'anchor-terminal',
        name: 'Command Console',
        kind: 'object',
        pos: { x: 420, y: 310, w: 60, h: 60 },
        elementIds: ['elem-operative-1'],
        note: 'Requires decryption keycard'
      },
      {
        id: 'anchor-airlock',
        name: 'Airlock Alpha',
        kind: 'region',
        pos: { x: 200, y: 150, w: 100, h: 80 },
        elementIds: []
      }
    ],
    triggers: [
      {
        id: 'trig-airlock-breach',
        name: 'Airlock Sensory Burst',
        anchorId: 'anchor-airlock',
        on: 'enter',
        when: 'ALARM_ACTIVE == true',
        actions: [{ type: 'TRIGGER_AIME', readAloudText: 'The airlocks shudder as emergency vents hiss.' }]
      }
    ],
    environment: {
      lighting: { mode: 'dim', ambientIntensity: 0.4 },
      weather: 'electrical_storm',
      modifierIds: ['mod-emp-hazard'],
      ambientAudio: 'cyber_drone'
    },
    encounters: [],
    variables: {
      ALARM_ACTIVE: false,
      SECURITY_TIER: 2
    },
    macros: []
  };

  const elementsCatalog = [
    {
      id: 'elem-operative-1',
      title: 'Operative Jax',
      type: 'Persona',
      fields: {
        hp: 24,
        maxHp: 24,
        role: 'Tactical Operative'
      }
    }
  ];

  const storyAsset = {
    id: 'scenario-alpha',
    title: 'Sector Breach Alpha',
    content: '<p>Operatives drop from the ceiling duct into the cold titanium hall.</p>',
    fields: {
      sceneBeats: '1. Infiltrate hall\n2. Bypass terminal\n3. Evacuate'
    }
  };

  const compiled = compileStage({
    manifest,
    mapAsset: pristineMap,
    storyAsset,
    elementsCatalog
  });

  // Verify source map was NOT mutated
  assert.equal(JSON.stringify(pristineMap), originalSnapshot, 'Source map asset must remain pristine');

  // Verify compiled tokens include synthesized anchor token
  assert.equal(compiled.map.tokens.length, 2);
  const synthesizedToken = compiled.map.tokens.find(t => t.anchorId === 'anchor-terminal');
  assert.ok(synthesizedToken, 'Anchor-linked element must be synthesized as token');
  assert.equal(synthesizedToken.x, 420);
  assert.equal(synthesizedToken.y, 310);
  assert.equal(synthesizedToken.stageManaged, true);

  // Verify synthesized trigger objects
  assert.equal(compiled.map.objects.length, 1); // anchor-airlock is region
  const regionObj = compiled.map.objects[0];
  assert.equal(regionObj.anchorId, 'anchor-airlock');
  assert.equal(regionObj.isTriggerZone, true);
  assert.equal(regionObj.triggerCount, 1);

  // Verify environmentals and variables
  assert.equal(compiled.environment.lighting.mode, 'dim');
  assert.equal(compiled.environment.weather, 'electrical_storm');
  assert.equal(compiled.variables.SECURITY_TIER, 2);

  // Verify scenario bindings
  assert.ok(compiled.scenario.readAloud.includes('Operatives drop'));
  assert.ok(compiled.scenario.beats.includes('1. Infiltrate hall'));
});

test('Stage Compiler: multi-stage map reuse preserves independent manifests', () => {
  const sharedMap = {
    id: 'shared-orbital-station',
    title: 'Orbital Station Hub',
    gridType: 'hex',
    tokens: [],
    objects: []
  };

  const stageDay = {
    id: 'stage-day-patrol',
    title: 'Day Patrol',
    mapId: 'shared-orbital-station',
    anchors: [{ id: 'anc-1', kind: 'waypoint', pos: { x: 100, y: 100 }, elementIds: [] }],
    triggers: [],
    environment: { lighting: { mode: 'normal' } }
  };

  const stageNight = {
    id: 'stage-night-raid',
    title: 'Night Raid Infiltration',
    mapId: 'shared-orbital-station',
    anchors: [{ id: 'anc-2', kind: 'waypoint', pos: { x: 800, y: 600 }, elementIds: [] }],
    triggers: [],
    environment: { lighting: { mode: 'pitch_black' } }
  };

  const compiledDay = compileStage({ manifest: stageDay, mapAsset: sharedMap });
  const compiledNight = compileStage({ manifest: stageNight, mapAsset: sharedMap });

  assert.equal(compiledDay.environment.lighting.mode, 'normal');
  assert.equal(compiledNight.environment.lighting.mode, 'pitch_black');
  assert.notEqual(compiledDay.stageId, compiledNight.stageId);
});
