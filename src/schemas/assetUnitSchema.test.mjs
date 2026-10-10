import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  AssetUnitSchema, 
  createDefaultAssetUnit, 
  validateAssetUnit,
  ASSET_CATEGORIES,
  STAGE_Z_LAYERS
} from './assetUnitSchema.ts';

test('AssetUnitSchema - Validates default minimal asset unit', () => {
  const minimalUnit = {
    unit_id: 'ter_martian_regolith',
    name: 'Martian Regolith',
    category: 'terrain_brush',
    tree_path: ['Environments', 'Xeno-Biomes', 'Desert', 'Martian Surface'],
    tags: ['desert', 'oxide', 'difficult_terrain'],
    dimensions: [1, 1],
    anchorPoint: [0.5, 0.5],
    provenance: {
      source: 'preset',
      author: 'Tangent SF',
      dateAdded: new Date().toISOString()
    },
    visuals: {
      thumbnail: '/assets/ter_martian_regolith.png',
      baseTexture: '/assets/ter_martian_regolith.webp',
      variants: ['/assets/ter_martian_regolith_b.webp'],
      auto_tile: 'marching_squares_4bit'
    },
    vtt_properties: {
      blocks_movement: false,
      blocks_vision: false,
      z_index_layer: 'background_map',
      terrain: {
        material: 'sand_loose',
        movementCost: 2,
        slipperyFriction: 0.8,
        footstepSfxCategory: 'footstep_sand'
      }
    }
  };

  const parsed = AssetUnitSchema.parse(minimalUnit);
  assert.equal(parsed.unit_id, 'ter_martian_regolith');
  assert.equal(parsed.category, 'terrain_brush');
  assert.equal(parsed.vtt_properties.terrain.material, 'sand_loose');
  assert.equal(parsed.vtt_properties.terrain.movementCost, 2);
});

test('createDefaultAssetUnit - Generates valid AssetUnit with default properties', () => {
  const unit = createDefaultAssetUnit({
    unit_id: 'prop_plasma_vent_01',
    name: 'Plasma Vent Station',
    category: 'hazard',
    vtt_properties: {
      hazard: {
        hazardType: 'plasma_leak',
        damageFormula: '3d10 plasma',
        triggerTiming: 'on_enter'
      }
    }
  });

  assert.equal(unit.unit_id, 'prop_plasma_vent_01');
  assert.equal(unit.category, 'hazard');
  assert.equal(unit.vtt_properties.z_index_layer, 'interactive_objects');
  assert.equal(unit.vtt_properties.hazard.damageFormula, '3d10 plasma');
  assert.deepEqual(unit.dimensions, [1, 1]);
});

test('VehicleHullProperties - Validates multi-tile vehicle with passenger nodes & hardpoints', () => {
  const mechUnit = createDefaultAssetUnit({
    unit_id: 'veh_bipedal_titan_mech',
    name: 'Titan Class Assault Mech',
    category: 'vehicle',
    dimensions: [3, 3],
    vtt_properties: {
      blocks_movement: true,
      blocks_vision: true,
      z_index_layer: 'tokens',
      vehicleHull: {
        hullDr: { kinetic: 25, energy: 20 },
        structureMaxHp: 350,
        speedMph: 45,
        handlingModifier: -2,
        passengerNodes: [
          { id: 'cockpit_pilot', role: 'pilot', cellOffset: [1, 1] },
          { id: 'rear_gunner', role: 'gunner', cellOffset: [1, 2] }
        ],
        hardpointSockets: [
          { slotId: 'hardpoint_right_arm', tier: 'mount', relativeCoords: [2, 0], arcFacingDegrees: 90 },
          { slotId: 'hardpoint_shoulder_pod', tier: 'socket', relativeCoords: [1, 0], arcFacingDegrees: 0 }
        ]
      }
    }
  });

  assert.equal(mechUnit.dimensions[0], 3);
  assert.equal(mechUnit.dimensions[1], 3);
  assert.equal(mechUnit.vtt_properties.vehicleHull.passengerNodes.length, 2);
  assert.equal(mechUnit.vtt_properties.vehicleHull.passengerNodes[0].role, 'pilot');
  assert.equal(mechUnit.vtt_properties.vehicleHull.hardpointSockets.length, 2);
});

test('validateAssetUnit - Rejects invalid category or malformed fields safely', () => {
  const invalidUnit = {
    unit_id: 'test_bad',
    name: 'Broken Item',
    category: 'non_existent_category',
    tree_path: []
  };

  const validation = validateAssetUnit(invalidUnit);
  assert.equal(validation.success, false);
  assert.ok(validation.error);
});

test('Seed Units Catalog - Validates all entries in science_fantasy_core.json', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const filePath = path.resolve('src/data/seed_units/science_fantasy_core.json');
  const content = await fs.readFile(filePath, 'utf-8');
  const items = JSON.parse(content);

  assert.ok(Array.isArray(items), 'Seed units should be an array');
  assert.ok(items.length >= 10, 'Expected at least 10 core seed units');

  for (const item of items) {
    const parsed = AssetUnitSchema.parse(item);
    assert.ok(parsed.unit_id, 'Unit ID must exist');
    assert.ok(parsed.tree_path.length >= 2, 'tree_path must have depth >= 2');
    assert.ok(parsed.visuals.thumbnail, 'thumbnail must exist');
    assert.ok(parsed.vtt_properties.z_index_layer, 'z_index_layer must exist');
  }
});

test('AssetUnitSchema - Validates Triggers and QuickJS Script sections', () => {
  const reactiveUnit = createDefaultAssetUnit({
    unit_id: 'prop_security_terminal_01',
    name: 'Mainframe Access Console',
    category: 'doodad',
    vtt_properties: {
      trigger: {
        enabled: true,
        triggerType: 'interact',
        triggerRadiusFt: 5,
        saveType: 'Tech (INT)',
        saveDc: 15,
        damageFormula: '1d10 emp',
        damageType: 'emp',
        appliedCondition: 'Stunned',
        disarmDc: 14,
        detectionDc: 10,
        gmSecretNotes: 'Console wired with high-voltage capacitor feedback loop.',
        oneShot: false
      },
      script: {
        enabled: true,
        autorun: false,
        executionHook: 'on_interact',
        sourceCode: 'const r = Dice.check2d10(2, 14); return r;',
        timeoutMs: 500
      }
    }
  });

  assert.equal(reactiveUnit.vtt_properties.trigger?.enabled, true);
  assert.equal(reactiveUnit.vtt_properties.trigger?.triggerType, 'interact');
  assert.equal(reactiveUnit.vtt_properties.trigger?.saveType, 'Tech (INT)');
  assert.equal(reactiveUnit.vtt_properties.trigger?.appliedCondition, 'Stunned');
  assert.equal(reactiveUnit.vtt_properties.script?.enabled, true);
  assert.equal(reactiveUnit.vtt_properties.script?.executionHook, 'on_interact');
});

test('AssetIngestionPipeline - Archetypes instantiate with comprehensive properties', async () => {
  const { AssetIngestionPipeline, INGESTION_ARCHETYPES } = await import('../engine/assets/AssetIngestionPipeline.ts');
  
  assert.ok(INGESTION_ARCHETYPES.length >= 5, 'Should have multiple ingestion archetypes');

  const terminalArch = INGESTION_ARCHETYPES.find(a => a.id === 'interactive_terminal');
  assert.ok(terminalArch, 'interactive_terminal archetype must exist');
  assert.equal(terminalArch.vttProperties.trigger?.enabled, true);
  assert.equal(terminalArch.vttProperties.script?.enabled, true);

  const mineArch = INGESTION_ARCHETYPES.find(a => a.id === 'proximity_mine');
  assert.ok(mineArch, 'proximity_mine archetype must exist');
  assert.equal(mineArch.vttProperties.trigger?.triggerType, 'proximity');
  assert.equal(mineArch.vttProperties.trigger?.appliedCondition, 'Burning');

  // Test single ingestion
  const res = AssetIngestionPipeline.ingestSingleAsset({
    name: 'Test Proximity Trap',
    category: mineArch.category,
    tags: mineArch.defaultTags,
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    vttProperties: mineArch.vttProperties
  });

  assert.equal(res.success, true);
  assert.ok(res.asset);
  assert.equal(res.asset?.vtt_properties.trigger?.enabled, true);
  assert.equal(res.asset?.vtt_properties.trigger?.appliedCondition, 'Burning');
  assert.equal(res.asset?.vtt_properties.script?.enabled, true);
});

