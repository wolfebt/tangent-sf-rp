import test from 'node:test';
import assert from 'node:assert/strict';
import { SpriteSheetSlicer } from '../../src/engine/assets/SpriteSheetSlicer.ts';
import { AssetIngestionPipeline } from '../../src/engine/assets/AssetIngestionPipeline.ts';
import { TangentPackager } from '../../src/engine/assets/TangentPackager.ts';

test('SpriteSheetSlicer - Computes uniform grid frames correctly', () => {
  const frames = SpriteSheetSlicer.computeGridFrames(256, 128, {
    cellWidth: 64,
    cellHeight: 64,
    margin: 0,
    padding: 0
  });

  assert.equal(frames.length, 8, 'Expected 4 cols * 2 rows = 8 frames');
  assert.equal(frames[0].x, 0);
  assert.equal(frames[0].y, 0);
  assert.equal(frames[1].x, 64);
  assert.equal(frames[1].y, 0);
  assert.equal(frames[4].x, 0);
  assert.equal(frames[4].y, 64);
});

test('AssetIngestionPipeline - Ingests single raw asset into valid AssetUnit', () => {
  const result = AssetIngestionPipeline.ingestSingleAsset({
    name: 'Toxic Sludge Spill',
    category: 'hazard',
    treePath: ['Hazards', 'Chemical', 'Toxic'],
    tags: ['acid', 'toxic', 'liquid'],
    dimensions: [2, 2],
    vttProperties: {
      hazard: {
        hazardType: 'acid_corrosive',
        damageFormula: '2d10 acid',
        triggerTiming: 'on_enter'
      }
    }
  });

  assert.equal(result.success, true);
  assert.ok(result.asset);
  assert.equal(result.asset.name, 'Toxic Sludge Spill');
  assert.equal(result.asset.category, 'hazard');
  assert.ok(result.asset.unit_id.startsWith('hazard_toxic_sludge_spill_'));
  assert.equal(result.asset.dimensions[0], 2);
  assert.equal(result.asset.vtt_properties.hazard.hazardType, 'acid_corrosive');
});

test('TangentPackager - Packages and unpackages assets round-trip', () => {
  const asset1 = AssetIngestionPipeline.ingestSingleAsset({
    name: 'Nanotech Conduit',
    category: 'doodad',
    tags: ['scifi', 'conduit']
  }).asset;

  const asset2 = AssetIngestionPipeline.ingestSingleAsset({
    name: 'Security Shield Gate',
    category: 'wall_portal',
    tags: ['shield', 'door']
  }).asset;

  assert.ok(asset1 && asset2);

  const packJson = TangentPackager.createPack(
    'pack_cyber_security_01',
    'Cyber Security Asset Pack',
    'Tangent Architect',
    'High-tech bulkheads and power conduits',
    [asset1, asset2]
  );

  const unpacked = TangentPackager.unpackPack(packJson);
  assert.equal(unpacked.success, true);
  assert.equal(unpacked.validAssets.length, 2);
  assert.equal(unpacked.manifest.title, 'Cyber Security Asset Pack');
  assert.equal(unpacked.manifest.packId, 'pack_cyber_security_01');
});
