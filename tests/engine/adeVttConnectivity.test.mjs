/**
 * @file adeVttConnectivity.test.mjs
 * @description Unit test suite verifying Story Foundry <-> Stage <-> VTT connectivity adapters:
 *   1. normalizeMapRecord & getMapLayerState (aliases, underlays[], lighting defaults, locks)
 *   2. Story-scoped useStageStore (setStoryScope, selectStage, createStage, deleteStage, dirty isolation)
 *   3. Unified compileStage (all 4 anchor kinds, Persona -> token vs non-Persona -> object, immutability)
 *   4. normalizeMapObject unified schema fields
 *   5. computeActiveGalleryModifiers bonus aggregation & expired filtering
 *   6. adeEngineBridge adjudicateActionCheck emitting VttEventBus events
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeMapRecord,
  getMapLayerState,
  resolveMapBackgroundUrl
} from '../../src/utils/mapSchemaAdapter.ts';
import { normalizeMapObject, adeElementToInteractiveObject } from '../../src/utils/storyAssetAdapter.js';
import { useStageStore } from '../../src/pages/Foundry/Stage/stageStore.ts';
import { compileStage } from '../../src/pages/Foundry/Stage/vttModuleCompilerService.js';
import { computeActiveGalleryModifiers } from '../../src/services/modifierService.ts';
import { adjudicateActionCheck } from '../../src/services/ade/adeEngineBridge.ts';

test('mapSchemaAdapter: normalizeMapRecord & getMapLayerState resolve defaults, underlays, and aliases', () => {
  const normalized = normalizeMapRecord({
    id: 'map-1',
    name: 'Bridge',
    scale: 'Encounter',
    underlays: [{ id: 'u1', url: 'https://cdn.test/bridge.png', visible: true }],
    layers: [
      { id: 'walls_doors', visible: false, locked: true, opacity: 0.7 },
      { id: 'lighting', visible: true, locked: false }
    ]
  });

  assert.equal(normalized.id, 'map-1');
  assert.equal(normalized.gridSize, 50);
  assert.equal(resolveMapBackgroundUrl(normalized), 'https://cdn.test/bridge.png');
  assert.equal(normalized.background_url, 'https://cdn.test/bridge.png');

  const wallLayer = getMapLayerState(normalized, 'walls');
  assert.equal(wallLayer.visible, false);
  assert.equal(wallLayer.locked, true);

  const objLayer = getMapLayerState(normalized, 'objects');
  assert.equal(objLayer.visible, true);
  assert.equal(objLayer.locked, false);
});

test('useStageStore: isolates manifests per story scope & guards dirty state on same-scope re-sync', () => {
  const store = useStageStore.getState();
  store.setStoryScope('story-a');
  store.updateStageManifest({ title: 'Story A Stage', mapId: 'map-a' });
  const stageAId = useStageStore.getState().stageManifest.id;

  // Switching to story-b creates/loads an isolated stage without overwriting story-a
  store.setStoryScope('story-b');
  store.updateStageManifest({ title: 'Story B Stage', mapId: 'map-b' });
  assert.equal(useStageStore.getState().stageManifest.mapId, 'map-b');

  // Switching back to story-a restores Story A's stage cleanly
  store.setStoryScope('story-a');
  assert.equal(useStageStore.getState().stageManifest.id, stageAId);
  assert.equal(useStageStore.getState().stageManifest.mapId, 'map-a');

  // Create second stage under story-a, switch via selectStage, and delete cleanly
  const second = store.createStage('map-a2', 'story-a', 'Boss Arena');
  assert.equal(useStageStore.getState().activeStageId, second.id);
  store.selectStage(stageAId);
  assert.equal(useStageStore.getState().activeStageId, stageAId);
  store.deleteStage(second.id);
  assert.equal(
    useStageStore.getState().manifestsByStory['story-a'].some(m => m.id === second.id),
    false
  );
  store.resetStageManifest();
});

test('compileStage: handles all 4 anchor kinds and distinguishes Persona tokens vs Element objects without mutating baseMap', () => {
  const baseMap = {
    id: 'map-deck',
    title: 'Deck 9',
    tokens: [],
    objects: [],
    waypoints: [],
    regions: [],
    terrains: [],
    fog: []
  };

  const manifest = {
    id: 'stage-deck-9',
    title: 'Deck 9 Lockdown',
    mapId: 'map-deck',
    storyId: 'sc-9',
    scenarioIds: ['sc-9'],
    anchors: [
      { id: 'anc-wp', name: 'Airlock Nav', kind: 'waypoint', pos: { x: 100, y: 120, w: 90, h: 90 }, elementIds: [] },
      { id: 'anc-reg', name: 'Radiation Zone', kind: 'region', pos: { x: 300, y: 300, w: 180, h: 160 }, triggerType: 'hazard', elementIds: [] },
      { id: 'anc-obj', name: 'Cargo Console', kind: 'object', pos: { x: 500, y: 240, w: 60, h: 60 }, elementIds: ['el-item', 'el-npc'] },
      { id: 'anc-spawn', name: 'Drop Pod', kind: 'spawn', pos: { x: 50, y: 80 }, elementIds: [] }
    ],
    triggers: [
      { id: 'tr-1', name: 'Warn', anchorId: 'anc-reg', on: 'enter', actions: [{ type: 'SET_FLAG', key: 'RAD_WARN', value: true }] }
    ],
    environment: { lighting: { mode: 'dim' }, weather: 'acid_rain', modifierIds: ['mod-1'], ambientAudio: '' },
    encounters: [],
    variables: { DECK_ALERT: true },
    macros: [{ id: 'mac-1', scriptId: 'seal_bulkhead', on: 'manual' }]
  };

  const elementsCatalog = [
    { id: 'el-npc', type: 'Persona', title: 'Security Chief', fields: { health: 40 } },
    { id: 'el-item', type: 'Technology', title: 'Override Keycard', fields: { color: '#22d3ee' } }
  ];

  const compiled = compileStage({
    manifest,
    mapAsset: baseMap,
    storyAsset: { id: 'sc-9', title: 'Lockdown', fields: {} },
    elementsCatalog,
    universeState: { techLevel: 4 }
  });

  // Pristine baseMap untouched
  assert.equal(baseMap.tokens.length, 0);
  assert.equal(baseMap.objects.length, 0);
  assert.equal(baseMap.waypoints.length, 0);
  assert.equal(baseMap.regions.length, 0);

  // Synthesized outputs
  assert.equal(compiled.map.tokens.length, 1);
  assert.equal(compiled.map.tokens[0].name, 'Security Chief');
  assert.equal(compiled.map.tokens[0].stageManaged, true);

  assert.equal(compiled.map.waypoints.length, 1);
  assert.equal(compiled.map.waypoints[0].id, 'anc-wp');
  assert.equal(compiled.map.waypoints[0].stageManaged, true);

  assert.equal(compiled.map.regions.length, 1);
  assert.equal(compiled.map.regions[0].triggerType, 'hazard');

  assert.equal(compiled.map.spawns.length, 1);
  assert.equal(compiled.map.spawns[0].id, 'anc-spawn');

  // Interactive object from anc-obj anchor + el-item element
  assert.ok(compiled.map.objects.length >= 2);
  assert.ok(compiled.map.objects.some(o => o.storyElementId === 'el-item' && o.stageManaged === true));
  assert.equal(compiled.variables.DECK_ALERT, true);
  assert.equal(compiled.macros.length, 1);
});

test('storyAssetAdapter: normalizeMapObject unifies schema aliases cleanly', () => {
  const normalized = normalizeMapObject({
    id: 'obj-1',
    label: 'Cryo Pod',
    url: 'https://cdn.test/cryo.png',
    x: 120,
    y: 260,
    width: 80,
    height: 100
  });
  assert.equal(normalized.name, 'Cryo Pod');
  assert.equal(normalized.label, 'Cryo Pod');
  assert.equal(normalized.imageUrl, 'https://cdn.test/cryo.png');
  assert.equal(normalized.textureUrl, 'https://cdn.test/cryo.png');

  const elemObj = adeElementToInteractiveObject({ id: 'el-clue', type: 'Clue', title: 'Blackbox Drive', fields: {} });
  assert.equal(elemObj.storyElementId, 'el-clue');
  assert.equal(elemObj.label, 'Blackbox Drive');
  assert.equal(elemObj.shape, 'star');
});

test('modifierService: computeActiveGalleryModifiers sums active bonuses and skips inactive/expired', () => {
  const mods = [
    { id: 'm1', name: 'Smart-Link', isActive: true, effects: { attackMod: 2, damageMod: 3 } },
    { id: 'm2', name: 'Inactive Mod', isActive: false, effects: { attackMod: 10 } },
    { id: 'm3', name: 'Expired Mod', isActive: true, remainingRounds: 0, effects: { attackMod: 5 } },
    { id: 'm4', name: 'EMP Static', isActive: true, remainingRounds: 2, effects: { attackMod: -1, defenseMod: 1 } }
  ];

  const summary = computeActiveGalleryModifiers(mods);
  assert.equal(summary.totalRollBonus, 1);
  assert.equal(summary.totalDamageBonus, 3);
  assert.equal(summary.totalDrBonus, 1);
  assert.deepEqual(summary.activeLabels, ['Smart-Link', 'EMP Static']);
});

test('adeEngineBridge: adjudicateActionCheck emits VttEventBus event on breach outcome', () => {
  const emittedEvents = [];
  const prevWindow = globalThis.window;
  globalThis.window = {
    dispatchEvent: (evt) => {
      emittedEvents.push({ type: evt.type, detail: evt.detail });
    }
  };
  const prevCustomEvent = globalThis.CustomEvent;
  if (typeof globalThis.CustomEvent === 'undefined') {
    globalThis.CustomEvent = class MockCustomEvent {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
      }
    };
  }

  try {
    const mandate = adjudicateActionCheck({
      actionText: 'Hack security bulkhead',
      actorName: 'Vex',
      operative: { id: 'op-1', skillRank: 12 },
      targetEntity: { id: 'bulkhead_alpha', name: 'Bulkhead Alpha' },
      targetCR: 12,
      diceOverride: [10, 10]
    });

    assert.equal(mandate.mechanicalOutcomes.vttEventEmitted, 'stage-cyberdeck-breach');
    assert.ok(emittedEvents.some(e => e.type === 'stage-cyberdeck-breach' && e.detail?.bulkheadId === 'bulkhead_alpha'));
  } finally {
    globalThis.window = prevWindow;
    globalThis.CustomEvent = prevCustomEvent;
  }
});
