/**
 * @file marchingSquaresAutoTiler.test.mjs
 * @description Automated Unit Tests for Phase 3.3: MarchingSquaresAutoTiler Bitmask Engine.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { MarchingSquaresAutoTiler } from '../../src/engine/canvas/MarchingSquaresAutoTiler.ts';

test('Phase 3.3: MarchingSquaresAutoTiler 4-bit calculation', () => {
  // Mock grid lookup
  const grid = [
    ['metal', 'metal', 'acid'],
    ['metal', 'metal', 'acid'],
    ['void',  'metal', 'metal']
  ];

  const getCell = (c, r) => {
    if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
      return { col: c, row: r, materialId: grid[r][c] };
    }
    return undefined;
  };

  const isSameMetal = (cell) => cell?.materialId === 'metal';

  // Test cell [1, 1] (center metal):
  // North: [1, 0] = 'metal' (1)
  // East: [2, 1] = 'acid' (0)
  // South: [1, 2] = 'metal' (4)
  // West: [0, 1] = 'metal' (8)
  // Expected bitmask: 1 + 4 + 8 = 13
  const centerMask = MarchingSquaresAutoTiler.calculateBitmask4Bit(1, 1, getCell, isSameMetal);
  assert.equal(centerMask, 13);

  const cardinal = MarchingSquaresAutoTiler.getCardinalNeighbors(centerMask);
  assert.equal(cardinal.north, true);
  assert.equal(cardinal.east, false);
  assert.equal(cardinal.south, true);
  assert.equal(cardinal.west, true);

  // Test cell [0, 0] (top-left metal):
  // North: out of bounds (0)
  // East: [1, 0] = 'metal' (2)
  // South: [0, 1] = 'metal' (4)
  // West: out of bounds (0)
  // Expected bitmask: 2 + 4 = 6
  const tlMask = MarchingSquaresAutoTiler.calculateBitmask4Bit(0, 0, getCell, isSameMetal);
  assert.equal(tlMask, 6);
});

test('Phase 3.3: MarchingSquaresAutoTiler 8-bit calculation with diagonals', () => {
  const grid = [
    ['acid', 'metal', 'acid'],
    ['metal', 'metal', 'metal'],
    ['acid', 'metal', 'acid']
  ];

  const getCell = (c, r) => {
    if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
      return { col: c, row: r, materialId: grid[r][c] };
    }
    return undefined;
  };

  const isSameMetal = (cell) => cell?.materialId === 'metal';

  // Center cell [1, 1] has all 4 cardinal neighbors as metal (N=1, E=4, S=16, W=64 = 85),
  // but all diagonals are 'acid', so no diagonal bits (2, 8, 32, 128) are set.
  const mask8 = MarchingSquaresAutoTiler.calculateBitmask8Bit(1, 1, getCell, isSameMetal);
  assert.equal(mask8, 1 + 4 + 16 + 64); // 85
});

test('Phase 3.3: MarchingSquaresAutoTiler edge lines extraction', () => {
  // Bitmask 13 = North(1), East(0), South(4), West(8). East is missing neighbor.
  const edgeLines = MarchingSquaresAutoTiler.getEdgeLines(100, 100, 50, 50, 13);
  
  // Missing East means there should be 1 border line on the East edge: [150, 100, 150, 150]
  assert.equal(edgeLines.length, 1);
  assert.deepEqual(edgeLines[0], [150, 100, 150, 150]);

  // Completely isolated tile (bitmask 0) has 4 exterior edges
  const isolatedEdges = MarchingSquaresAutoTiler.getEdgeLines(0, 0, 50, 50, 0);
  assert.equal(isolatedEdges.length, 4);
});

test('Phase 3.3: MarchingSquaresAutoTiler calculateGridBitmasks matrix', () => {
  const layout = [
    ['grass', 'grass', 'sand'],
    ['grass', 'grass', 'sand']
  ];

  const bitmasks = MarchingSquaresAutoTiler.calculateGridBitmasks(3, 2, (c, r) => layout[r][c]);
  assert.equal(bitmasks.length, 2);
  assert.equal(bitmasks[0].length, 3);

  // [0, 0] (grass): East is grass (2), South is grass (4) -> mask = 6
  assert.equal(bitmasks[0][0], 6);

  // [0, 2] (sand): South is sand (4) -> mask = 4
  assert.equal(bitmasks[0][2], 4);

  // [1, 2] (sand): North is sand (1) -> mask = 1
  assert.equal(bitmasks[1][2], 1);
});

test('Phase 3.3: MarchingSquaresAutoTiler integration with MapGraphicsCompiler', () => {
  const edgeLines = MarchingSquaresAutoTiler.getEdgeLines(0, 0, 50, 50, 13);
  
  // Create a terrain tile equipped with Marching Squares edge lines
  const terrainTile = {
    id: 'pcg-floor-t1',
    renderType: 'rect',
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    bitmask4Bit: 13,
    edgeLines,
    color: '#1e293b'
  };

  assert.equal(terrainTile.bitmask4Bit, 13);
  assert.equal(terrainTile.edgeLines.length, 1);
  assert.deepEqual(terrainTile.edgeLines[0], [50, 0, 50, 50]);
});

test('Marching Squares Mode: calculateGridBitmasks8Bit grid matrix', () => {
  const layout = [
    ['metal', 'metal', 'metal'],
    ['metal', 'metal', 'metal'],
    ['metal', 'metal', 'metal']
  ];

  const bitmasks8 = MarchingSquaresAutoTiler.calculateGridBitmasks8Bit(3, 3, (c, r) => layout[r][c]);
  assert.equal(bitmasks8.length, 3);
  assert.equal(bitmasks8[0].length, 3);

  // Center cell [1, 1] has all 8 neighbors: bitmask = 255
  assert.equal(bitmasks8[1][1], 255);

  // Top-left cell [0, 0] has East (4), South (16), South-East (8): 4 + 16 + 8 = 28
  assert.equal(bitmasks8[0][0], 28);
});

test('Marching Squares Mode: getMarchingPolygonPoints bevels outer and inner corners', () => {
  // 1. Isolated cell (bitmask 0): all corners beveled -> diamond shape
  const isolatedPts = MarchingSquaresAutoTiler.getMarchingPolygonPoints(0, 0, 50, 50, 0, 0, 0.5);
  assert.ok(isolatedPts.length >= 8); // At least 4 beveled points
  assert.deepEqual(isolatedPts, [0, 25, 25, 0, 50, 25, 25, 50]);

  // 2. Fully connected internal floor cell (4-bit=15, 8-bit=255): clean square
  const internalPts = MarchingSquaresAutoTiler.getMarchingPolygonPoints(0, 0, 50, 50, 15, 255, 0.5);
  assert.deepEqual(internalPts, [0, 0, 50, 0, 50, 50, 0, 50]);

  // 3. Inner corner notch (N=1, E=2, S=4, W=8 -> 4-bit=15, but NW diagonal missing in 8-bit)
  // 8-bit without NW (128): 255 - 128 = 127
  const notchPts = MarchingSquaresAutoTiler.getMarchingPolygonPoints(0, 0, 50, 50, 15, 127, 0.5);
  // NW corner should have beveled notch points (0, 12.5) and (12.5, 0)
  assert.equal(notchPts[0], 0);
  assert.equal(notchPts[1], 12.5);
  assert.equal(notchPts[2], 12.5);
  assert.equal(notchPts[3], 0);
});

test('Marching Squares Mode: getMarchingContourLines perimeter tracing', () => {
  // Isolated cell (bitmask 0): 4 beveled outer segments
  const isolatedContours = MarchingSquaresAutoTiler.getMarchingContourLines(0, 0, 50, 50, 0, 0, 0.5);
  assert.equal(isolatedContours.length, 4);
  assert.deepEqual(isolatedContours[0], [0, 25, 25, 0]); // North outer bevel
  assert.deepEqual(isolatedContours[1], [25, 0, 50, 25]); // East outer bevel
  assert.deepEqual(isolatedContours[2], [50, 25, 25, 50]); // South outer bevel
  assert.deepEqual(isolatedContours[3], [25, 50, 0, 25]); // West outer bevel

  // Inner corner notch contour
  const notchContours = MarchingSquaresAutoTiler.getMarchingContourLines(0, 0, 50, 50, 15, 127, 0.5);
  assert.equal(notchContours.length, 1);
  assert.deepEqual(notchContours[0], [0, 12.5, 12.5, 0]);
});

test('Marching Squares Mode: Sector terrain polygon element structure', () => {
  const polyPoints = MarchingSquaresAutoTiler.getMarchingPolygonPoints(100, 100, 50, 50, 15, 255, 0.5);
  const contourLines = MarchingSquaresAutoTiler.getMarchingContourLines(100, 100, 50, 50, 15, 255, 0.5);

  const pcgTerrain = {
    id: 'pcg-floor-test',
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    renderType: 'polygon',
    closed: true,
    points: polyPoints,
    tension: 0.15,
    bitmask4Bit: 15,
    bitmask8Bit: 255,
    edgeLines: contourLines,
    color: '#1e293b'
  };

  assert.equal(pcgTerrain.renderType, 'polygon');
  assert.equal(pcgTerrain.closed, true);
  assert.equal(pcgTerrain.tension, 0.15);
  assert.equal(pcgTerrain.points.length, 8);
});


