/**
 * @file vttAndStageStores.test.mjs
 * @description Unit test suite for centralized Zustand state stores:
 * - useStageStore (src/pages/Foundry/Stage/stageStore.ts)
 * - useUILayoutStore (src/components/VTT/store/uiLayoutStore.ts)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { useStageStore, createDefaultManifest } from '../../src/pages/Foundry/Stage/stageStore.ts';
import { useUILayoutStore } from '../../src/components/VTT/store/uiLayoutStore.ts';
import { GridType, GridScaleTier } from '../../src/engine/math/CoordinateEngine.ts';

test('useStageStore: Manifest lifecycle, anchor CRUD, and cascading trigger deletion', () => {
  const store = useStageStore.getState();
  store.resetStageManifest('map-orbital-7', 'story-exodus');

  let state = useStageStore.getState();
  assert.equal(state.activeStageTab, 'setup');
  assert.equal(state.isDirty, false);
  assert.equal(state.stageManifest.mapId, 'map-orbital-7');
  assert.equal(state.stageManifest.storyId, 'story-exodus');
  assert.deepEqual(state.stageManifest.scenarioIds, ['story-exodus']);

  // Tab navigation
  state.setActiveStageTab('anchors');
  assert.equal(useStageStore.getState().activeStageTab, 'anchors');

  // Anchor addition & update
  state.addAnchor({
    id: 'anchor-airlock-1',
    name: 'Airlock Alpha',
    kind: 'waypoint',
    pos: { x: 140, y: 210 },
    elementIds: ['elem-door-1']
  });
  state = useStageStore.getState();
  assert.equal(state.isDirty, true);
  assert.equal(state.stageManifest.anchors.length, 1);

  state.updateAnchor('anchor-airlock-1', { name: 'Airlock Alpha (Breached)' });
  assert.equal(useStageStore.getState().stageManifest.anchors[0].name, 'Airlock Alpha (Breached)');

  // Trigger linked to anchor-airlock-1 and another anchor
  state.addTrigger({
    id: 'trig-1',
    name: 'Decompression Trap',
    anchorId: 'anchor-airlock-1',
    on: 'enter',
    actions: [{ type: 'SET_FLAG', key: 'airlock_breached', value: true }]
  });
  state.addTrigger({
    id: 'trig-2',
    name: 'Bridge Alarm',
    anchorId: 'anchor-bridge-2',
    on: 'interact',
    actions: [{ type: 'TRIGGER_AIME', prompt: 'Sirens wail across the bridge.' }]
  });
  assert.equal(useStageStore.getState().stageManifest.triggers.length, 2);

  // Removing anchor-airlock-1 must cascade-delete trig-1 while preserving trig-2
  state.removeAnchor('anchor-airlock-1');
  state = useStageStore.getState();
  assert.equal(state.stageManifest.anchors.length, 0);
  assert.equal(state.stageManifest.triggers.length, 1, 'Orphaned trigger tied to deleted anchor must be pruned');
  assert.equal(state.stageManifest.triggers[0].id, 'trig-2');
});

test('useStageStore: Environment, Stage Variables, Encounters, and Macro Bindings', () => {
  const store = useStageStore.getState();
  store.resetStageManifest();

  // Environment partial update
  store.updateEnvironment({ weather: 'acid_rain', ambientAudio: 'station_hum.ogg' });
  let state = useStageStore.getState();
  assert.equal(state.stageManifest.environment.weather, 'acid_rain');
  assert.equal(state.stageManifest.environment.ambientAudio, 'station_hum.ogg');
  assert.deepEqual(state.stageManifest.environment.lighting, { mode: 'normal', ambientIntensity: 1.0 });

  // Stage variables
  store.setStageVariable('reactor_temp', 4200);
  store.setStageVariable('red_alert', true);
  assert.equal(useStageStore.getState().stageManifest.variables.reactor_temp, 4200);
  assert.equal(useStageStore.getState().stageManifest.variables.red_alert, true);

  store.removeStageVariable('reactor_temp');
  assert.equal(useStageStore.getState().stageManifest.variables.reactor_temp, undefined);
  assert.equal(useStageStore.getState().stageManifest.variables.red_alert, true);

  // Encounters CRUD
  store.addEncounter({
    id: 'enc-kitin-ambush',
    label: 'Kitin Stalker Ambush',
    tokenElementIds: ['tok-rakne-1', 'tok-rakne-2'],
    active: false
  });
  store.updateEncounter('enc-kitin-ambush', { active: true });
  assert.equal(useStageStore.getState().stageManifest.encounters[0].active, true);
  store.removeEncounter('enc-kitin-ambush');
  assert.equal(useStageStore.getState().stageManifest.encounters.length, 0);

  // Macros CRUD
  store.addMacro({ id: 'mac-1', scriptId: 'patrol_loop', on: 'round_start' });
  assert.equal(useStageStore.getState().stageManifest.macros.length, 1);
  store.removeMacro('mac-1');
  assert.equal(useStageStore.getState().stageManifest.macros.length, 0);

  // Explicit manifest replacement clears isDirty
  const freshManifest = createDefaultManifest('map-2', 'story-2');
  store.setStageManifest(freshManifest);
  assert.equal(useStageStore.getState().isDirty, false);
  assert.equal(useStageStore.getState().activeStageId, freshManifest.id);
});

test('useUILayoutStore: Tripartite panel widths, Zen mode collapsing, 2D/3D viewport, and cartography tools', () => {
  const layout = useUILayoutStore.getState();
  layout.resetLayout();

  let state = useUILayoutStore.getState();
  assert.equal(state.isLeftCollapsed, false);
  assert.equal(state.isRightCollapsed, false);
  assert.equal(state.isZenMode, false);

  // Width clamping: left [240, 1100], right [280, 560]
  state.setLeftWidth(100);
  assert.equal(useUILayoutStore.getState().leftWidth, 240, 'Left width must clamp to minimum 240px');
  state.setLeftWidth(2000);
  assert.equal(useUILayoutStore.getState().leftWidth, 1100, 'Left width must clamp to maximum 1100px');

  state.setRightWidth(120);
  assert.equal(useUILayoutStore.getState().rightWidth, 280, 'Right width must clamp to minimum 280px');
  state.setRightWidth(900);
  assert.equal(useUILayoutStore.getState().rightWidth, 560, 'Right width must clamp to maximum 560px');

  // Zen mode collapses both rails and restores them when exited
  state.toggleZenMode();
  state = useUILayoutStore.getState();
  assert.equal(state.isZenMode, true);
  assert.equal(state.isLeftCollapsed, true);
  assert.equal(state.isRightCollapsed, true);

  state.toggleZenMode();
  state = useUILayoutStore.getState();
  assert.equal(state.isZenMode, false);
  assert.equal(state.isLeftCollapsed, false);
  assert.equal(state.isRightCollapsed, false);

  // Grid, 3D, and Architect Cartography tool mutations
  state.setGridType(GridType.Square);
  state.setScaleTier(GridScaleTier.Sector);
  state.set3DActive(true);
  state.setActiveArchitectTool('wall');
  state.setSelectedWallType('door');
  state.setDoorLockDc(18);
  state.setSelectedTokenId('tok-hero-1');
  state.setTargetTokenId('tok-boss-1');

  state = useUILayoutStore.getState();
  assert.equal(state.gridType, GridType.Square);
  assert.equal(state.scaleTier, GridScaleTier.Sector);
  assert.equal(state.is3DActive, true);
  assert.equal(state.activeArchitectTool, 'wall');
  assert.equal(state.selectedWallType, 'door');
  assert.equal(state.doorLockDc, 18);
  assert.equal(state.selectedTokenId, 'tok-hero-1');
  assert.equal(state.targetTokenId, 'tok-boss-1');
});
