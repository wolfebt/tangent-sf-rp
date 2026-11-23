/**
 * @file phase5VttMapMakerAndSync.test.mjs
 * @description Phase 5 regression suite covering Stage VTT, MapMaker, PCG, Exporters, and Sync fixes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as Y from 'yjs';
import { RoomEvent, DataPacket_Kind } from 'livekit-client';

import {
  LightSourceManager,
  normalizeAtmosphericPresetKey,
  resolveAtmosphericPreset,
  get3DAtmosphereLighting
} from '../../src/engine/vision/LightSourceManager.ts';
import { useEngineStore } from '../../src/engine/state/VolatileSharder.ts';
import { toggleDoorState } from '../../src/schemas/vttWallSchema.js';
import {
  evaluateTrapTriggers,
  evaluateSentryVision
} from '../../src/services/reactiveVttService.js';
import { calculateAttributeCheckBase } from '../../src/constants/attributes.js';
import { UniversalVttPackager } from '../../src/engine/compilers/UniversalVttPackager.ts';
import { FoundryVttJsonExporterService } from '../../src/engine/compilers/FoundryVttJsonExporter.ts';
import { MapGraphicsCompiler } from '../../src/engine/compilers/MapGraphicsCompiler.ts';
import {
  getBiomeTextureUrl,
  generateLandmassGrid,
  convertGridToKonvaElements
} from '../../src/pages/Foundry/MapMaker/map/landmassGenerator.js';
import { YjsProviderBridge } from '../../src/engine/network/YjsProviderBridge.ts';
import { VttMultiplayerSyncService } from '../../src/services/vttMultiplayerSyncService.ts';

test('Phase 5.1 LightSourceManager: clearLights/setLights and canonical + aliased atmospheric presets', () => {
  const mgr = new LightSourceManager([
    { id: 'l1', x: 10, y: 20, radius: 120, color: '#fff', intensity: 1, falloff: 'smooth', animation: 'none', animationSpeed: 1, castShadows: false }
  ]);
  assert.equal(mgr.getAllLights().length, 1);

  mgr.clearLights();
  assert.equal(mgr.getAllLights().length, 0);

  mgr.setLights([
    { id: 'l2', x: 40, y: 50, radius: 180, color: '#38bdf8', intensity: 0.9, falloff: 'smooth', animation: 'pulse', animationSpeed: 1, castShadows: true }
  ]);
  assert.equal(mgr.getAllLights().length, 1);
  assert.equal(mgr.getLight('l2')?.x, 40);

  // Direct presets + aliases
  assert.equal(normalizeAtmosphericPresetKey('dim'), 'dim');
  assert.equal(normalizeAtmosphericPresetKey('night_vision'), 'night_vision');
  assert.equal(normalizeAtmosphericPresetKey('infra_red'), 'infra_red');
  assert.equal(normalizeAtmosphericPresetKey('normal'), 'clear');
  assert.equal(normalizeAtmosphericPresetKey('pitch_black'), 'deep_void');
  assert.equal(normalizeAtmosphericPresetKey('zero_g'), 'deep_void');
  assert.equal(normalizeAtmosphericPresetKey('vacuum_decomp'), 'deep_void');
  assert.equal(normalizeAtmosphericPresetKey('neon'), 'cyber_matrix');
  assert.equal(normalizeAtmosphericPresetKey('smoke_fog'), 'sandstorm');
  assert.equal(normalizeAtmosphericPresetKey('plasma_surge'), 'geothermal_inferno');

  const nvgPreset = resolveAtmosphericPreset('night_vision');
  assert.equal(nvgPreset.id, 'night_vision');

  const lighting3d = get3DAtmosphereLighting('pitch_black');
  assert.equal(typeof lighting3d.ambientColor, 'number');
  assert.equal(typeof lighting3d.ambientIntensity, 'number');
  assert.equal(typeof lighting3d.dirIntensity, 'number');
});

test('Phase 5.2 VolatileSharder: stabilizeEntity restores 1 HP/Structure and clears dying conditions; clearAllEntities wipes stores', () => {
  const store = useEngineStore.getState();
  store.clearAllEntities();

  store.loadStaticEntity({
    id: 'op-stab-1',
    name: 'Organic Down',
    base_health: 24,
    base_vitality: 20,
    is_synthetic: false
  });
  store.setHealth('op-stab-1', 0);

  let eph = useEngineStore.getState().ephemeralData['op-stab-1'];
  assert.equal(eph.current_health, 0);
  assert.ok(eph.active_conditions.includes('status_incapacitated'));
  assert.ok(eph.active_conditions.includes('status_bleeding_out'));

  store.stabilizeEntity('op-stab-1');
  eph = useEngineStore.getState().ephemeralData['op-stab-1'];
  assert.equal(eph.current_health, 1);
  assert.equal(eph.current_hp, 1);
  assert.ok(!eph.active_conditions.includes('status_bleeding_out'));
  assert.ok(!eph.active_conditions.includes('status_incapacitated'));
  assert.ok(eph.active_conditions.includes('status_stabilized'));

  // Synthetic entity stabilization
  store.loadStaticEntity({
    id: 'syn-stab-1',
    name: 'Frame Unit',
    base_structure: 30,
    base_hp: 30,
    is_synthetic: true
  });
  store.setStructure('syn-stab-1', 0);
  store.stabilizeEntity('syn-stab-1');
  const synEph = useEngineStore.getState().ephemeralData['syn-stab-1'];
  assert.equal(synEph.current_structure, 1);
  assert.ok(synEph.active_conditions.includes('status_stabilized'));

  store.clearAllEntities();
  assert.deepEqual(useEngineStore.getState().staticData, {});
  assert.deepEqual(useEngineStore.getState().ephemeralData, {});
});

test('Phase 5.3 vttWallSchema: toggleDoorState handles isDoor/isDynamic/wallType starter doors without doorState or type=door', () => {
  const legacyDynamicDoor = { id: 'd1', isDynamic: true, isOpen: false };
  const toggled1 = toggleDoorState(legacyDynamicDoor);
  assert.equal(toggled1.isOpen, true);
  assert.equal(toggled1.doorState, 'open');
  const toggledBack = toggleDoorState(toggled1);
  assert.equal(toggledBack.isOpen, false);
  assert.equal(toggledBack.doorState, 'closed');

  const schemaDoorFlag = toggleDoorState({ id: 'd2', isDoor: true, isOpen: true });
  assert.equal(schemaDoorFlag.isOpen, false);
  assert.equal(schemaDoorFlag.doorState, 'closed');

  const altFieldDoor = toggleDoorState({ id: 'd3', wallType: 'door' });
  assert.equal(altFieldDoor.isOpen, true);
  assert.equal(altFieldDoor.doorState, 'open');

  // Solid wall remains untouched
  const solid = { id: 'w1', type: 'solid', isOpen: false };
  assert.equal(toggleDoorState(solid), solid);
});

test('Phase 5.4 reactiveVttService: evaluateTrapTriggers uses Tangent canonical attributes and evaluateSentryVision handles +-180 wrap & zero distance', () => {
  const origRandom = Math.random;
  Math.random = () => 0.45; // 2d10 => (5 + 5) = 10 deterministic
  try {
    const heroToken = {
      id: 'hero-1',
      label: 'Kaelen',
      x: 100,
      y: 100,
      agility: 4, // calculateAttributeCheckBase(4) === 2 + 8 === 10
      stamina: 2  // calculateAttributeCheckBase(2) === 2 + 4 === 6
    };
    const trapReflex = {
      id: 'trap-r',
      isTrap: true,
      trapType: 'proximity_plasma_mine',
      saveType: 'Reflex',
      saveCr: 15,
      baseDamage: 12,
      triggerRadius: 80,
      x: 100,
      y: 100
    };
    const trapFort = {
      id: 'trap-f',
      isTrap: true,
      trapType: 'toxic_spore_vent',
      saveType: 'Fortitude',
      saveCr: 15,
      baseDamage: 10,
      triggerRadius: 80,
      x: 100,
      y: 100
    };

    const hits = evaluateTrapTriggers(heroToken, [trapReflex, trapFort]);
    assert.equal(hits.length, 2);
    assert.equal(hits[0].saveRoll, 10 + calculateAttributeCheckBase(4));
    assert.equal(hits[0].isSaveSuccess, true);
    assert.equal(hits[1].saveRoll, 10 + calculateAttributeCheckBase(2));
    assert.equal(hits[1].isSaveSuccess, true);
  } finally {
    Math.random = origRandom;
  }

  // Zero-distance overlap still triggers detection
  const sentryZero = {
    id: 'sen-1',
    x: 200,
    y: 200,
    script: { type: 'sentry', facingAngleDeg: 0, visionFovDeg: 90, visionRangePx: 250 }
  };
  const zeroHit = evaluateSentryVision(sentryZero, [{ id: 'h-zero', x: 200, y: 200 }]);
  assert.ok(zeroHit);
  assert.equal(zeroHit.distance, 0);

  // Facing +175 deg, target at -175 deg (~10 deg across the +-180 seam, well within 90 deg FOV)
  const sentryWrap = {
    id: 'sen-2',
    x: 0,
    y: 0,
    script: { type: 'sentry', facingAngleDeg: 175, visionFovDeg: 90, visionRangePx: 300 }
  };
  const angleRad = (-175 * Math.PI) / 180;
  const wrapHero = {
    id: 'h-wrap',
    x: Math.cos(angleRad) * 100,
    y: Math.sin(angleRad) * 100
  };
  const wrapHit = evaluateSentryVision(sentryWrap, [wrapHero]);
  assert.ok(wrapHit);
  assert.equal(wrapHit.detectedHero.id, 'h-wrap');
});

test('Phase 5.5 UniversalVttPackager: merges overlapping collinear segments and honors RawPortalInput.bounds', () => {
  const merged = UniversalVttPackager.reduceCollinearSegments([
    { p1: [0, 2], p2: [5, 2], blocksLight: true },
    { p1: [3, 2], p2: [9, 2], blocksLight: true }, // overlaps [3..5]
    { p1: [9, 2], p2: [12, 2], blocksLight: false } // different blocksLight must NOT merge
  ]);
  assert.equal(merged.length, 2);
  assert.deepEqual(merged[0].p1, [0, 2]);
  assert.deepEqual(merged[0].p2, [9, 2]);
  assert.equal(merged[1].blocksLight, false);

  const pkg = UniversalVttPackager.package({
    widthCells: 10,
    heightCells: 10,
    pixelsPerGrid: 100,
    portals: [
      { col: 2, row: 3, bounds: [[1, 3], [3, 3]], closed: true },
      { col: 5, row: 6, horizontal: false, closed: false }
    ]
  });
  assert.equal(pkg.data.portals.length, 2);
  assert.deepEqual(pkg.data.portals[0].position, { x: 2, y: 3 });
  assert.deepEqual(pkg.data.portals[0].bounds, [{ x: 1, y: 3 }, { x: 3, y: 3 }]);
  assert.deepEqual(pkg.data.portals[1].bounds, [{ x: 5, y: 5.5 }, { x: 5, y: 6.5 }]);
});

test('Phase 5.6 FoundryVttJsonExporter: open doors ignore stale block flags; handles ethereal & hex grid metadata', () => {
  const exporter = new FoundryVttJsonExporterService();
  const { pack } = exporter.exportToFoundryJson({
    scenarios: [],
    elements: [],
    maps: [
      {
        title: 'Hex Dock',
        gridWidth: 20,
        gridHeight: 15,
        gridSize: 60,
        gridMode: 'hex',
        walls: [
          { type: 'door', p1: { x: 0, y: 0 }, p2: { x: 60, y: 0 }, isOpen: true, blocksMovement: true, blocksVision: true },
          { wallType: 'door', isDoor: true, doorState: 'locked', p1: { x: 60, y: 0 }, p2: { x: 120, y: 0 } },
          { type: 'ethereal', p1: { x: 120, y: 0 }, p2: { x: 180, y: 0 } }
        ]
      }
    ]
  });

  const scene = pack.scenes[0];
  assert.equal(scene.width, 1200);
  assert.equal(scene.height, 900);
  assert.equal(scene.grid.type, 2);
  assert.equal(scene.walls[0].move, 0);
  assert.equal(scene.walls[0].sense, 0);
  assert.equal(scene.walls[0].door, 1);
  assert.equal(scene.walls[0].ds, 1);
  assert.equal(scene.walls[1].ds, 2);
  assert.equal(scene.walls[1].move, 20);
  assert.equal(scene.walls[2].move, 0);
  assert.equal(scene.walls[2].sense, 20);
});

test('Phase 5.7 MapGraphicsCompiler: compileToDataUrlAsync and compileForUniversalVttAsync resolve cleanly headless', async () => {
  const dataUrl = await MapGraphicsCompiler.compileToDataUrlAsync({
    widthCells: 10,
    heightCells: 8,
    pixelsPerGrid: 100,
    sourceGridSize: 50,
    terrains: [
      { id: 'org', renderType: 'canvasImage', imageUrl: 'data:image/png;base64,iVBORw0KGgo=', x: 0, y: 0, width: 500, height: 400 }
    ],
    lines: [{ points: [0, 0, 100, 100], stroke: '#22d3ee' }],
    walls: [{ p1: { x: 0, y: 0 }, p2: { x: 100, y: 0 }, type: 'solid' }],
    lights: [{ x: 50, y: 50, radius: 150 }],
    tokens: [{ id: 't1', x: 50, y: 50, type: 'hero' }],
    texts: [{ x: 10, y: 20, text: 'Bridge' }]
  });
  assert.ok(dataUrl.startsWith('data:image/'));

  const b64 = await MapGraphicsCompiler.compileForUniversalVttAsync({
    widthCells: 8,
    heightCells: 6,
    pixelsPerGrid: 50,
    terrains: [{ renderType: 'rect', x: 0, y: 0, width: 50, height: 50, color: '#0f172a' }]
  });
  assert.ok(typeof b64 === 'string' && b64.length > 0 && !b64.startsWith('data:'));
});

test('Phase 5.8 landmassGenerator: biome texture aliases and bounded hex output without textureUrl bloat', () => {
  assert.ok(getBiomeTextureUrl('metalDecking'));
  assert.equal(getBiomeTextureUrl('metal_deck'), getBiomeTextureUrl('metalDecking'));
  assert.ok(getBiomeTextureUrl('rock_cavern'));
  assert.ok(getBiomeTextureUrl('dirt_subterranean'));
  assert.ok(getBiomeTextureUrl('toxicSludge'));
  assert.ok(getBiomeTextureUrl('volcanicLava'));

  const gridResult = generateLandmassGrid({ width: 120, height: 90, seed: 'phase5-hex', scatterDensity: 80 });
  const { terrains, objects } = convertGridToKonvaElements(gridResult, {
    stageWidth: 4000,
    stageHeight: 3000,
    scatterDensity: 90,
    seed: 'phase5-hex',
    renderMode: 'hex'
  });
  assert.ok(terrains.length > 0 && terrains.length <= 2500);
  assert.ok(objects.length <= 400);
  assert.equal('textureUrl' in terrains[0], false);
  // Coordinate rounding to 1 decimal place
  assert.equal(Math.round(terrains[0].x * 10) / 10, terrains[0].x);
});

test('Phase 5.9 YjsProviderBridge & VttMultiplayerSyncService: clean disconnect/destroy listener cleanup and optional persistence', () => {
  const listeners = new Map();
  const mockRoom = {
    state: 'connected',
    localParticipant: { publishData: () => {} },
    on(evt, fn) {
      if (!listeners.has(evt)) listeners.set(evt, new Set());
      listeners.get(evt).add(fn);
    },
    off(evt, fn) {
      listeners.get(evt)?.delete(fn);
    }
  };

  const doc = new Y.Doc();
  const bridge = new YjsProviderBridge(mockRoom, doc);
  assert.equal(listeners.get(RoomEvent.DataReceived)?.size, 1);
  assert.equal(listeners.get(RoomEvent.Connected)?.size, 1);
  assert.equal(listeners.get(RoomEvent.Disconnected)?.size, 1);

  bridge.disconnect();
  assert.equal(listeners.get(RoomEvent.DataReceived)?.size, 0);
  assert.equal(listeners.get(RoomEvent.Connected)?.size, 0);
  assert.equal(listeners.get(RoomEvent.Disconnected)?.size, 0);

  // VttMultiplayerSyncService.init() without persistence config must NOT spin up FirestoreDebouncer
  const sync = new VttMultiplayerSyncService();
  sync.init({ role: 'architect', channelName: `phase5-sync-${Date.now()}` });
  assert.equal(sync.persistenceDebouncer, null);

  const postedMessages = [];
  const origPost = sync.broadcastChannel?.postMessage?.bind(sync.broadcastChannel);
  if (sync.broadcastChannel) {
    sync.broadcastChannel.postMessage = (msg) => {
      postedMessages.push(msg);
      if (origPost) origPost(msg);
    };
  }

  let docOffCalls = 0;
  const origDocOff = sync.doc.off.bind(sync.doc);
  sync.doc.off = (eventName, fn) => {
    if (eventName === 'update') docOffCalls += 1;
    return origDocOff(eventName, fn);
  };

  sync.broadcastFogUpdate('map-1', true, [{ id: 'f1' }]);
  if (sync.broadcastChannel) {
    const fogMsg = postedMessages.find((m) => m?.type === 'fog_update');
    assert.ok(fogMsg);
    assert.equal(fogMsg.mapId, 'map-1');
    assert.equal(fogMsg.fogEnabled, true);
  }

  sync.getTacticalTokensMap().set('tok-sync-1', { x: 10, y: 20 });
  const msgCountBeforeDestroy = postedMessages.length;
  assert.ok(msgCountBeforeDestroy >= 1);

  sync.destroy();
  assert.equal(docOffCalls, 1);
  assert.equal(sync.docUpdateHandler, null);
  assert.equal(sync.broadcastChannel, null);

  // Subsequent local Y.Doc mutation must NOT broadcast or leak after destroy()
  sync.getTacticalTokensMap().set('tok-sync-2', { x: 30, y: 40 });
  assert.equal(postedMessages.length, msgCountBeforeDestroy);

  // Confirm DataPacket_Kind import check used by mock
  assert.ok(DataPacket_Kind.RELIABLE !== undefined);
});
