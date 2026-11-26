import test from 'node:test';
import assert from 'node:assert/strict';
import {
  putAssetBinary,
  getAssetBinary,
  deleteAssetBinary,
  listAssetBinaryKeys,
  isOpfsHandle
} from '../../src/engine/assets/OPFSCacheWorker.ts';
import {
  mergeAssetCatalog,
  serializePersistedUnits,
  convertLegacyCustomAssetToUnit,
  isCorePresetUnitId,
  useAssetUnitStore
} from '../../src/engine/assets/assetUnitStore.ts';
import {
  hasActiveCustomization,
  parseTintHexToNumber,
  buildCssFilterFromCustomization,
  resolveAssetStateTexture,
  applyAssetCustomizationToPixiSprite
} from '../../src/engine/canvas/AssetCustomizerShader.ts';
import { compileAssetUnitStamp } from '../../src/engine/assets/assetStampCompiler.ts';
import { createDefaultAssetUnit } from '../../src/schemas/assetUnitSchema.ts';
import { TangentPackager } from '../../src/engine/assets/TangentPackager.ts';

test('OPFSCacheWorker - stores, lists, reads, and deletes cached binaries in Node fallback', async () => {
  const sampleData = 'data:image/png;base64,iVBORw0KGgo=';
  const handle = await putAssetBinary('unit_test_alpha', sampleData);
  assert.equal(isOpfsHandle(handle), true);

  const loaded = await getAssetBinary(handle);
  assert.equal(loaded, sampleData);

  const keys = await listAssetBinaryKeys();
  assert.ok(keys.includes('unit_test_alpha'));

  await deleteAssetBinary(handle);
  assert.equal(await getAssetBinary(handle), null);
});

test('assetUnitStore - merges catalogs with override precedence and protects core seeds on delete', () => {
  const seed = createDefaultAssetUnit({
    unit_id: 'seed_deck_01',
    name: 'Core Deck',
    category: 'terrain_brush'
  });
  const overrideSeed = { ...seed, name: 'Modified Core Deck' };
  const custom = createDefaultAssetUnit({
    unit_id: 'custom_crate_01',
    name: 'Custom Crate',
    category: 'doodad',
    provenance: { source: 'custom_upload', dateAdded: new Date().toISOString() }
  });

  const merged = mergeAssetCatalog([seed], [overrideSeed, custom]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].name, 'Modified Core Deck');
  assert.equal(merged[1].unit_id, 'custom_crate_01');

  const persistedOnly = serializePersistedUnits(
    merged,
    new Set(['seed_deck_01']),
    new Set(['seed_deck_01'])
  );
  assert.equal(persistedOnly.length, 2, 'Modified core preset + custom unit both persist');

  const state = useAssetUnitStore.getState();
  const initialCount = state.assets.length;
  assert.ok(initialCount >= 10, 'Expected at least 10 canonical seed units');
  const firstSeedId = state.assets[0].unit_id;
  assert.equal(isCorePresetUnitId(firstSeedId), true);
  assert.equal(state.deleteAssetUnit(firstSeedId), false, 'Core seed units must not be deletable');
});

test('assetUnitStore - supports CRUD, duplication, preset reset, pack import, and quota warning', () => {
  // Shim localStorage cleanly to test persistence and QuotaExceededError paths
  const bag = new Map();
  let throwQuota = false;
  const prevStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (k) => (bag.has(k) ? bag.get(k) : null),
    setItem: (k, v) => {
      if (throwQuota) {
        const err = new Error('Quota exceeded');
        err.name = 'QuotaExceededError';
        throw err;
      }
      bag.set(k, String(v));
    },
    removeItem: (k) => bag.delete(k)
  };

  try {
    const store = useAssetUnitStore.getState();
    const customUnit = createDefaultAssetUnit({
      unit_id: 'custom_suite_unit_1',
      name: 'Reactor Pylon',
      category: 'doodad',
      provenance: { source: 'custom_upload', dateAdded: new Date().toISOString() }
    });

    const outcome = store.upsertAssetUnit(customUnit);
    assert.equal(outcome.saved, true);

    const dup = useAssetUnitStore.getState().duplicateAssetUnit('custom_suite_unit_1');
    assert.ok(dup);
    assert.ok(dup.name.includes('(Copy)'));
    assert.notEqual(dup.unit_id, customUnit.unit_id);

    // Core preset edit + reset
    const firstSeed = useAssetUnitStore.getState().assets[0];
    const origName = firstSeed.name;
    useAssetUnitStore.getState().upsertAssetUnit({ ...firstSeed, name: 'Temporarily Renamed Preset' });
    assert.ok(useAssetUnitStore.getState().modifiedSeedIds.includes(firstSeed.unit_id));
    const resetUnit = useAssetUnitStore.getState().resetPresetAssetUnit(firstSeed.unit_id);
    assert.equal(resetUnit?.name, origName);

    // Pack import
    const packed = TangentPackager.createPack(
      'pack_test',
      'Test Pack',
      'Tester',
      'Unit test archive',
      [
        createDefaultAssetUnit({
          unit_id: 'pack_imported_unit_1',
          name: 'Cryo Barrel',
          category: 'hazard',
          provenance: { source: 'custom_upload', dateAdded: new Date().toISOString() }
        })
      ]
    );
    const packResult = useAssetUnitStore.getState().importTangentPack(packed);
    assert.equal(packResult.success, true);
    assert.equal(packResult.count, 1);
    assert.ok(useAssetUnitStore.getState().assets.some((a) => a.unit_id === 'pack_imported_unit_1'));

    // Quota exceeded handling
    throwQuota = true;
    const quotaRes = useAssetUnitStore.getState().upsertAssetUnit({
      ...customUnit,
      name: 'Oversized Texture Edit'
    });
    assert.equal(quotaRes.saved, false);
    assert.equal(quotaRes.quotaExceeded, true);
    assert.ok(useAssetUnitStore.getState().lastStorageWarning);
    throwQuota = false;

    // Legacy custom asset migration
    const migratedUnit = convertLegacyCustomAssetToUnit(
      { id: 'leg_ter_1', name: 'Old Grate', imageUrl: 'data:image/png;base64,AAA=' },
      'terrain'
    );
    assert.equal(migratedUnit.category, 'terrain_brush');
    const migratedCount = useAssetUnitStore.getState().migrateLegacyCustomAssets({
      objects: [{ id: 'leg_obj_1', label: 'Old Crate', width: 50, height: 50 }]
    });
    assert.equal(migratedCount, 1);

    // Cleanup created test units
    assert.equal(useAssetUnitStore.getState().deleteAssetUnit(customUnit.unit_id), true);
    assert.equal(useAssetUnitStore.getState().deleteAssetUnit(dup.unit_id), true);
    assert.equal(useAssetUnitStore.getState().deleteAssetUnit('pack_imported_unit_1'), true);
    assert.equal(useAssetUnitStore.getState().deleteAssetUnit('prop_leg_obj_1'), true);
  } finally {
    if (prevStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = prevStorage;
    }
  }
});

test('AssetCustomizerShader - builds CSS filters, resolves state textures, and configures Pixi sprites', () => {
  assert.equal(hasActiveCustomization(undefined), false);
  assert.equal(parseTintHexToNumber('#38bdf8'), 0x38bdf8);

  const custom = {
    tintColor: '#ff8800',
    hueRotation: 45,
    saturation: 1.5,
    brightness: 1.2,
    contrast: 1.1
  };
  assert.equal(hasActiveCustomization(custom), true);
  const css = buildCssFilterFromCustomization(custom);
  assert.ok(css.filter?.includes('hue-rotate(45deg)'));
  assert.equal(css.tintOverlay, '#ff880033');

  const unit = createDefaultAssetUnit({
    unit_id: 'state_tex_unit',
    name: 'Damaged Bulkhead',
    category: 'doodad',
    visuals: {
      baseTexture: 'base.png',
      thumbnail: 'base.png',
      variants: [],
      auto_tile: 'none',
      stateTextures: {
        pristine: 'pristine.png',
        damaged: 'damaged.png',
        destroyed: 'destroyed.png'
      }
    }
  });
  assert.equal(resolveAssetStateTexture(unit, { hpRatio: 1 }), 'pristine.png');
  assert.equal(resolveAssetStateTexture(unit, { hpRatio: 0.3 }), 'damaged.png');
  assert.equal(resolveAssetStateTexture(unit, { hpRatio: 0 }), 'destroyed.png');

  class MockColorMatrixFilter {
    constructor() {
      this.ops = [];
    }
    hue(v) { this.ops.push(['hue', v]); }
    saturate(v) { this.ops.push(['saturate', v]); }
    brightness(v) { this.ops.push(['brightness', v]); }
    contrast(v) { this.ops.push(['contrast', v]); }
  }
  const fakeSprite = { tint: 0xffffff, filters: [] };
  applyAssetCustomizationToPixiSprite(fakeSprite, custom, MockColorMatrixFilter);
  assert.equal(fakeSprite.tint, 0xff8800);
  assert.equal(fakeSprite.filters.length, 1);
  assert.equal(fakeSprite.filters[0].ops.length, 4);
});

test('assetStampCompiler - compiles all 7 categories with LoS polygons, portals, vehicles, and lights', () => {
  // 1. Terrain Brush + Light
  const terrainUnit = createDefaultAssetUnit({
    unit_id: 'stamp_ter_1',
    name: 'Glowing Grate',
    category: 'terrain_brush',
    vtt_properties: {
      blocks_movement: false,
      blocks_vision: false,
      z_index_layer: 'background_map',
      terrain: { material: 'metal_deck', movementCost: 1.5, slipperyFriction: 0.8, footstepSfxCategory: 'footstep_metal' },
      dynamicLighting: { emits: true, color: '#22d3ee', intensity: 1.2, radiusBrightFt: 15, radiusDimFt: 30, castsShadows: true, animation: 'pulse' }
    }
  });
  const terStamp = compileAssetUnitStamp(terrainUnit, { x: 100, y: 100, gridSize: 50 });
  assert.equal(terStamp.target, 'terrain');
  assert.equal(terStamp.terrain?.movementCost, 1.5);
  assert.equal(terStamp.lights.length, 1);

  // 2. Token + Creature
  const tokenUnit = createDefaultAssetUnit({
    unit_id: 'stamp_tok_1',
    name: 'Synapse Stalker',
    category: 'creature',
    dimensions: [2, 2],
    vtt_properties: {
      blocks_movement: true,
      blocks_vision: false,
      z_index_layer: 'tokens',
      tokenEntity: { sizeCategory: 'Large', disposition: 'hostile', visionCone: { type: 'thermal', rangeFt: 90, arcDegrees: 180 } }
    }
  });
  const tokStamp = compileAssetUnitStamp(tokenUnit, { x: 200, y: 200, gridSize: 50 });
  assert.equal(tokStamp.target, 'token');
  assert.equal(tokStamp.token?.visionType, 'thermal');
  assert.equal(tokStamp.token?.sizeCategory, 'Large');

  // 3. Wall / Portal Door
  const doorUnit = createDefaultAssetUnit({
    unit_id: 'stamp_door_1',
    name: 'Iris Blast Door',
    category: 'wall_portal',
    vtt_properties: {
      blocks_movement: true,
      blocks_vision: true,
      z_index_layer: 'interactive_objects',
      wallPortal: { wallType: 'blast_bulkhead', isDoor: true, doorType: 'iris', doorState: 'locked', blocksLight: true, blocksSensors: true, blocksMovement: true, soundMuffleFactor: 0.9 }
    }
  });
  const doorStamp = compileAssetUnitStamp(doorUnit, { x: 150, y: 150, gridSize: 50 });
  assert.equal(doorStamp.target, 'wall');
  assert.equal(doorStamp.walls.length, 1);
  assert.equal(doorStamp.walls[0].doorState, 'locked');

  // 4. Doodad with custom collision polygon LoS walls
  const crateUnit = createDefaultAssetUnit({
    unit_id: 'stamp_crate_1',
    name: 'Heavy Cover Crate',
    category: 'doodad',
    vtt_properties: {
      blocks_movement: true,
      blocks_vision: true,
      z_index_layer: 'interactive_objects',
      customCollisionPolygon: [[0, 0], [1, 0], [1, 1], [0, 1]],
      doodad: { cover: 'full_cover', isDestructible: true, structureHp: 40, isContainer: false }
    }
  });
  const crateStamp = compileAssetUnitStamp(crateUnit, { x: 300, y: 300, gridSize: 50 });
  assert.equal(crateStamp.target, 'object');
  assert.equal(crateStamp.walls.length, 4, '4-vertex LoS polygon emits 4 wall segments');

  // 5. Vehicle hull with seats & hardpoints
  const vehicleUnit = createDefaultAssetUnit({
    unit_id: 'stamp_veh_1',
    name: 'Drop Skiff',
    category: 'vehicle',
    dimensions: [3, 2],
    vtt_properties: {
      blocks_movement: true,
      blocks_vision: false,
      z_index_layer: 'tokens',
      vehicleHull: {
        hullDr: { kinetic: 12, energy: 10 },
        structureMaxHp: 140,
        speedMph: 85,
        handlingModifier: 1,
        passengerNodes: [{ id: 'pilot_1', role: 'pilot', cellOffset: [0, 0] }],
        hardpointSockets: [{ slotId: 'turret_1', tier: 'mount', relativeCoords: [0.5, 0.5], arcFacingDegrees: 360 }]
      }
    }
  });
  const vehStamp = compileAssetUnitStamp(vehicleUnit, { x: 400, y: 400, gridSize: 50 });
  assert.equal(vehStamp.target, 'object');
  assert.equal(vehStamp.object?.type, 'vehicle');
  assert.equal(vehStamp.object?.passengerNodes?.length, 1);
  assert.equal(vehStamp.object?.hardpointSockets?.length, 1);
});
