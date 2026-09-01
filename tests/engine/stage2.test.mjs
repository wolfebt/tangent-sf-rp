/**
 * @file stage2.test.mjs
 * @description Stage 2 Automated Verification Suite
 * Verifies Multi-Tier CoordinateEngine, FrustumChunkManager culling, and Stage memory metrics.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  CoordinateEngine, 
  GridType, 
  GridScaleTier,
  TANGENT_BASE_CELL_FT,
  TANGENT_BASE_MOVEMENT_FT
} from '../../src/engine/math/CoordinateEngine.ts';
import { FrustumChunkManager } from '../../src/engine/canvas/FrustumChunkManager.ts';
import { GCMonitor } from '../../src/engine/memory/GCMonitor.ts';

test('Stage 2.4: CoordinateEngine 5ft Encounter Scale & 30ft Movement', () => {
  const engine = new CoordinateEngine(GridType.Square, 70, GridScaleTier.Encounter);

  assert.equal(TANGENT_BASE_CELL_FT, 5, 'Encounter base cell must be exactly 5 ft');
  assert.equal(TANGENT_BASE_MOVEMENT_FT, 30, 'Encounter base movement must be 30 ft');

  // 1. Pixel to Square Grid Conversion
  const pixel = { x: 140, y: 210 }; // (2 cells, 3 cells) at 70px/cell
  const cube = engine.pixelToCube(pixel);
  assert.equal(cube.q, 2);
  assert.equal(cube.r, 3);

  // 2. Square Grid to Pixel Conversion
  const convertedPixel = engine.cubeToPixel(cube);
  assert.equal(convertedPixel.x, 140);
  assert.equal(convertedPixel.y, 210);

  // 3. Distance Calculation
  const start = { q: 0, r: 0, s: 0 };
  const target = { q: 6, r: 0, s: -6 }; // 6 cells away = 30 ft (Standard base movement)
  const cellDist = engine.calculateCellDistance(start, target);
  assert.equal(cellDist, 6);

  const worldDistFt = engine.calculateWorldDistanceFt(start, target);
  assert.equal(worldDistFt, 30);
  assert.equal(engine.formatDistance(cellDist), '30 ft');
});

test('Stage 2.4: CoordinateEngine Hex Cube Coordinates & Fractional Rounding', () => {
  const hexEngine = new CoordinateEngine(GridType.HexFlatTop, 70, GridScaleTier.Encounter);

  const origin = { q: 0, r: 0, s: 0 };
  const hexPixel = hexEngine.cubeToPixel(origin);
  assert.equal(hexPixel.x, 0);
  assert.equal(hexPixel.y, 0);

  const coord1 = { q: 2, r: -1, s: -1 };
  const coord2 = { q: -1, r: 2, s: -1 };
  const hexDist = hexEngine.calculateCellDistance(coord1, coord2);
  assert.equal(hexDist, 3);
});

test('Stage 2.4: Multi-Tier Nested Hierarchical Scales', () => {
  const planetaryEngine = new CoordinateEngine(GridType.Square, 70, GridScaleTier.Planetary);
  assert.equal(planetaryEngine.getScaleConfig().unitName, 'km');

  const starSystemEngine = new CoordinateEngine(GridType.Square, 70, GridScaleTier.StarSystem);
  assert.equal(starSystemEngine.getScaleConfig().unitName, 'AU');

  const sectorEngine = new CoordinateEngine(GridType.Square, 70, GridScaleTier.Sector);
  assert.equal(sectorEngine.getScaleConfig().unitName, 'LY');
});

test('Stage 2.3: FrustumChunkManager Spatial Hashing & Hysteresis Culling', () => {
  const culler = new FrustumChunkManager();

  // Mock sprite
  const spriteA = { x: 100, y: 100, renderable: true };
  const spriteB = { x: 10000, y: 10000, renderable: true };

  culler.registerSprite(spriteA);
  culler.registerSprite(spriteB);

  // Viewport at (0, 0, 1920, 1080)
  const viewport = { left: 0, right: 1920, top: 0, bottom: 1080 };
  culler.updateCulling(viewport);

  // Sprite A is in chunk 0,0 (visible)
  assert.equal(spriteA.renderable, true);

  // Sprite B is in chunk 4,4 (outside view + 1 padding, so hidden)
  assert.equal(spriteB.renderable, false);

  // Move Sprite B into visible chunk
  spriteB.x = 500;
  spriteB.y = 500;
  culler.updateSpritePosition(spriteB);
  culler.updateCulling(viewport);

  assert.equal(spriteB.renderable, true);
});

test('Stage 2.5: GCMonitor Memory Pressure Heuristic', () => {
  const gc = new GCMonitor();
  gc.trackAssetLoad('map-mega-floorplan.webp', 120);
  assert.equal(gc.getEstimatedVramUsageMB(), 120);
});
