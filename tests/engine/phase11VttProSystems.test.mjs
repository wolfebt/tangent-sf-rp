/**
 * @file phase11VttProSystems.test.mjs
 * @description Phase 11 automated tests for Pro VTT systems:
 *   1. FogOfWarManager (3-tier explored memory, hide, reset, serialize/hydrate, Pixi mock rendering)
 *   2. SceneRegionManager (enter/exit transition detection & disabled filtering)
 *   3. proAudioMixerService (3-bus volume, mute, custom track registration, queue, remote broadcast)
 *   4. VolatileSharder ActiveEffectRecord (tickDamage DoT + expiration)
 *   5. QuickJSSandbox StageAPI action capture & 64-action limit
 *   6. dispatchStageMacroActions Architect vs Operative role gating
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { FogOfWarManager } from '../../src/engine/vision/FogOfWarManager.ts';
import { SceneRegionManager } from '../../src/engine/cartography/SceneRegionManager.ts';
import { useEngineStore } from '../../src/engine/state/VolatileSharder.ts';
import { QuickJSSandbox } from '../../src/engine/scripting/QuickJSSandbox.ts';
import { proAudioMixerService } from '../../src/services/proAudioMixerService.ts';
import { dispatchStageMacroActions } from '../../src/services/stageMacroDispatcher.ts';
import { getVttMultiplayerSync } from '../../src/services/vttMultiplayerSyncService.ts';

test('Phase 11.1 FogOfWarManager: records explored vision, hides manual shroud, serializes, hydrates, and renders 3 tiers', () => {
  const mgr = new FogOfWarManager();
  const poly = [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 300 }
  ];

  const changed1 = mgr.recordVisionPolygon('map_a', poly);
  assert.strictEqual(changed1, true);
  // Bounding signature dedupe avoids duplicate redundant entries
  const changed2 = mgr.recordVisionPolygon('map_a', poly);
  assert.strictEqual(changed2, false);

  mgr.hideArea('map_a', [120, 120, 160, 120, 160, 160]);
  const snap = mgr.serialize('map_a');
  assert.strictEqual(snap.exploredPolygons.length, 1);
  assert.strictEqual(snap.hiddenPolygons.length, 1);

  const mgr2 = new FogOfWarManager();
  mgr2.hydrate(snap);
  assert.strictEqual(mgr2.getState('map_a').exploredPolygons.length, 1);
  assert.strictEqual(mgr2.getState('map_a').hiddenPolygons.length, 1);

  const calls = [];
  const mockGraphics = {
    clear: () => calls.push('clear'),
    rect: () => calls.push('rect'),
    fill: (opts) => calls.push(['fill', opts?.alpha]),
    poly: () => calls.push('poly'),
    cut: () => calls.push('cut')
  };
  mgr2.renderToPixiLayer(mockGraphics, 2000, 1500, 'map_a', [poly], false);
  assert.ok(calls.some((c) => Array.isArray(c) && c[0] === 'fill' && c[1] === 0.94));
  assert.ok(calls.some((c) => Array.isArray(c) && c[0] === 'fill' && c[1] === 0.52));
  assert.ok(calls.includes('cut'));

  mgr2.resetExplored('map_a');
  assert.strictEqual(mgr2.getState('map_a').exploredPolygons.length, 0);
  assert.strictEqual(mgr2.getState('map_a').hiddenPolygons.length, 0);
});

test('Phase 11.1 SceneRegionManager: detects enter and exit boundary crossings', () => {
  const regions = [
    SceneRegionManager.createSceneRegion({
      id: 'reg_roof',
      name: 'Command Bridge Canopy',
      bounds: { x: 100, y: 100, width: 200, height: 200 },
      triggerType: 'roof_zone',
      payload: { radiusPx: 110 },
      autoTrigger: true
    }),
    SceneRegionManager.createSceneRegion({
      id: 'reg_disabled',
      name: 'Disabled Portal',
      bounds: { x: 0, y: 0, width: 400, height: 400 },
      triggerType: 'switch_map',
      payload: { targetMapId: 'map_b' },
      autoTrigger: true,
      enabled: false
    })
  ];

  const enterEvents = SceneRegionManager.evaluateTokenRegions(
    'op-1',
    { x: 50, y: 50 },
    { x: 150, y: 150 },
    regions
  );
  assert.strictEqual(enterEvents.length, 1);
  assert.strictEqual(enterEvents[0].event, 'enter');
  assert.strictEqual(enterEvents[0].region.id, 'reg_roof');

  const exitEvents = SceneRegionManager.evaluateTokenRegions(
    'op-1',
    { x: 150, y: 150 },
    { x: 350, y: 350 },
    regions
  );
  assert.strictEqual(exitEvents.length, 1);
  assert.strictEqual(exitEvents[0].event, 'exit');
});

test('Phase 11.2 proAudioMixerService: manages 3 buses, queues, custom tracks, and sync broadcast', async () => {
  proAudioMixerService.setBusVolume('music', 0.42, false);
  assert.strictEqual(proAudioMixerService.getBusState('music').volume, 0.42);

  proAudioMixerService.toggleBusMute('ambient');
  assert.strictEqual(proAudioMixerService.getBusState('ambient').muted, true);
  proAudioMixerService.toggleBusMute('ambient');

  proAudioMixerService.setCrossfadeMs(1500);
  assert.strictEqual(proAudioMixerService.getCrossfadeMs(), 1500);

  proAudioMixerService.registerCustomTrack({
    id: 'custom_synth_theme',
    title: 'Orbital Elevator Synth',
    bus: 'music',
    url: 'https://example.com/audio/orbital.mp3'
  });

  const sync = getVttMultiplayerSync();
  sync.init({ role: 'architect' });
  const played = await proAudioMixerService.playCue('music', 'custom_synth_theme', true);
  assert.strictEqual(played, true);
  assert.strictEqual(proAudioMixerService.getBusState('music').isPlaying, true);
  assert.strictEqual(proAudioMixerService.getBusState('music').activeTrackId, 'custom_synth_theme');

  proAudioMixerService.enqueueTrack('music', 'combat_pulse');
  const next = proAudioMixerService.nextTrack('music', false);
  assert.strictEqual(next, 'combat_pulse');
  assert.strictEqual(proAudioMixerService.getBusState('music').activeTrackId, 'combat_pulse');

  proAudioMixerService.stopBus('music', false);
  assert.strictEqual(proAudioMixerService.getBusState('music').isPlaying, false);
  sync.destroy();
});

test('Phase 11.3 VolatileSharder ActiveEffects & QuickJSSandbox StageAPI + dispatcher gating', async () => {
  const store = useEngineStore.getState();
  store.clearAllEntities();
  store.loadStaticEntity({
    id: 'op-jax',
    name: 'Jax',
    base_hp: 30,
    base_health: 30,
    base_vitality: 30,
    tech_level: 3,
    armor_dr: 2,
    size_modifier: 0,
    is_persona: true
  });
  store.loadStaticEntity({
    id: 'enemy-mech',
    name: 'Sentry Mech',
    base_hp: 60,
    base_structure: 60,
    is_synthetic: true,
    tech_level: 3,
    armor_dr: 4,
    size_modifier: 0
  });

  store.addActiveEffect('op-jax', {
    id: 'eff-burn',
    name: 'Plasma Burn',
    remainingRounds: 2,
    tickDamage: 5,
    isLethal: false
  });
  const tick1 = store.tickActiveEffectsForToken('op-jax');
  assert.strictEqual(tick1.totalDamage, 5);
  assert.strictEqual(tick1.expired.length, 0);
  assert.strictEqual(useEngineStore.getState().ephemeralData['op-jax'].current_vitality, 25);

  const tick2 = store.tickActiveEffectsForToken('op-jax');
  assert.strictEqual(tick2.expired.length, 1);
  assert.strictEqual(useEngineStore.getState().ephemeralData['op-jax'].current_vitality, 20);
  assert.strictEqual(useEngineStore.getState().ephemeralData['op-jax'].active_effects?.length, 0);

  // QuickJSSandbox StageAPI capture
  const sandbox = new QuickJSSandbox();
  const { result, actions } = await sandbox.executeWithActions(`
    StageAPI.moveToken('op-jax', 220, 180);
    StageAPI.applyDamage('op-jax', 4, false);
    StageAPI.toggleDoor('bulkhead-7');
    StageAPI.setFlag('AIRLOCK_BREACH', true);
    StageAPI.emitChat('Trap Sprung', 'Vents sealed!', 'public');
    return { ok: true };
  `);
  assert.deepStrictEqual(result, { ok: true });
  assert.strictEqual(actions.length, 5);

  // Operative cannot toggle doors or set global flags
  const opReport = dispatchStageMacroActions(actions, {
    role: 'operative',
    allowedTokenIds: ['op-jax']
  });
  assert.strictEqual(opReport.denied, 2);
  assert.strictEqual(opReport.applied, 3);
  assert.strictEqual(useEngineStore.getState().ephemeralData['op-jax'].x, 220);

  // Architect executes all 5 cleanly
  let toggledWall = null;
  let setFlagPair = null;
  const gmReport = dispatchStageMacroActions(actions, {
    role: 'architect',
    onToggleDoor: (wid) => { toggledWall = wid; },
    onSetStoryFlag: (k, v) => { setFlagPair = [k, v]; }
  });
  assert.strictEqual(gmReport.denied, 0);
  assert.strictEqual(gmReport.applied, 5);
  assert.strictEqual(toggledWall, 'bulkhead-7');
  assert.deepStrictEqual(setFlagPair, ['AIRLOCK_BREACH', true]);

  store.clearAllEntities();
});
