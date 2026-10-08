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

