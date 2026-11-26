import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getHexCellAtPoint,
  snapPointToGrid
} from '../../src/pages/Foundry/MapMaker/map/gridGeometry.js';
import {
  computeRulerPaceStats
} from '../../src/pages/Foundry/MapMaker/pixi/mapMakerPixiHelpers.ts';

test('getHexCellAtPoint resolves row 0 and odd-row offset centers accurately', () => {
  const gSize = 50;
  const hexW = Math.sqrt(3) * gSize;
  const rowH = gSize * 1.5;

  // Row 0, Col 1 -> center at (hexW, 0)
  const cell0 = getHexCellAtPoint({ x: hexW + 3, y: 4 }, gSize);
  assert.equal(cell0.col, 1);
  assert.equal(cell0.row, 0);
  assert.equal(cell0.radius, 50);
  assert.ok(Math.abs(cell0.x - hexW) < 1e-6);
  assert.ok(Math.abs(cell0.y - 0) < 1e-6);

  // Row 1 (odd row), Col 0 -> center shifted +hexW / 2 vertically at rowH
  const cellOdd = getHexCellAtPoint({ x: hexW * 0.5 - 2, y: rowH + 2 }, gSize);
  assert.equal(cellOdd.col, 0);
  assert.equal(cellOdd.row, 1);
  assert.ok(Math.abs(cellOdd.x - hexW * 0.5) < 1e-6);
  assert.ok(Math.abs(cellOdd.y - rowH) < 1e-6);
});

test('snapPointToGrid snaps square, hex, none, and disabled states', () => {
  assert.deepEqual(snapPointToGrid({ x: 118, y: 82 }, 50, 'square', true), { x: 100, y: 100 });
  assert.deepEqual(snapPointToGrid({ x: 118, y: 82 }, 50, 'square', false), { x: 118, y: 82 });
  assert.deepEqual(snapPointToGrid({ x: 118, y: 82 }, 50, 'none', true), { x: 118, y: 82 });

  const gSize = 50;
  const hexW = Math.sqrt(3) * gSize;
  const snappedHex = snapPointToGrid({ x: hexW + 4, y: -3 }, gSize, 'hex', true);
  assert.deepEqual(snappedHex, { x: Math.round(hexW), y: 0 });
});

test('computeRulerPaceStats formats meters, feet, squares, hexes, and selectedPace', () => {
  const waypoints = [{ x: 0, y: 0 }];
  const pointer = { x: 150, y: 0 }; // 3 grid cells of 50px = 6m
  const gSize = 50;

  const meters = computeRulerPaceStats(waypoints, pointer, gSize, 'meters');
  assert.ok(meters);
  assert.equal(meters.formattedDistance, '6m (20 ft)');
  assert.equal(meters.paceTier, 'WALK (30ft)');

  const feet = computeRulerPaceStats(waypoints, pointer, gSize, 'feet');
  assert.equal(feet.formattedDistance, '20 ft (6m)');

  const squares = computeRulerPaceStats(waypoints, pointer, gSize, 'squares');
  assert.equal(squares.formattedDistance, '3 sq (6m)');

  const hexes = computeRulerPaceStats(waypoints, pointer, gSize, 'hexes', 'sprint');
  assert.equal(hexes.formattedDistance, '3 hex (6m)');
  assert.equal(hexes.selectedPace, 'sprint');
});
