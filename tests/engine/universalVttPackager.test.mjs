import test from 'node:test';
import assert from 'node:assert/strict';
import { UniversalVttPackager } from '../../src/engine/compilers/UniversalVttPackager.ts';

test('UniversalVttPackager - Compiles valid .dd2vtt JSON object and string', () => {
  const result = UniversalVttPackager.package({
    widthCells: 30,
    heightCells: 20,
    pixelsPerGrid: 100,
    base64Image: 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2QAA',
    walls: [
      { p1: [2, 2], p2: [12, 2], blocksLight: true },
      { p1: [12, 2], p2: [12, 10], blocksLight: true }
    ],
    portals: [
      { col: 13, row: 6, horizontal: true, closed: true, freemove: false }
    ],
    lights: [
      { col: 7, row: 6, rangeFt: 20, colorHex: '#00ffcc', intensity: 0.8 }
    ]
  });

  const { data, jsonString, stats } = result;

  assert.equal(data.format, 0.2);
  assert.equal(data.resolution.map_size.x, 30);
  assert.equal(data.resolution.map_size.y, 20);
  assert.equal(data.resolution.pixels_per_grid, 100);

  // Line of sight
  assert.equal(data.line_of_sight.length, 2);
  assert.deepEqual(data.line_of_sight[0], [{ x: 2, y: 2 }, { x: 12, y: 2 }]);

  // Portal
  assert.equal(data.portals.length, 1);
  assert.equal(data.portals[0].position.x, 13);
  assert.equal(data.portals[0].position.y, 6);
  assert.equal(data.portals[0].closed, true);
  assert.deepEqual(data.portals[0].bounds, [{ x: 12.5, y: 6 }, { x: 13.5, y: 6 }]);

  // Light
  assert.equal(data.lights.length, 1);
  assert.equal(data.lights[0].position.x, 7);
  assert.equal(data.lights[0].position.y, 6);
  assert.equal(data.lights[0].range, 4); // 20 ft / 5 ft = 4.0 grid units
  assert.equal(data.lights[0].color, '00ffcc');
  assert.equal(data.lights[0].intensity, 0.8);

  // JSON parsing verification
  const parsed = JSON.parse(jsonString);
  assert.equal(parsed.format, 0.2);
  assert.equal(stats.wallCount, 2);
  assert.equal(stats.portalCount, 1);
  assert.equal(stats.lightCount, 1);
});

test('UniversalVttPackager - Collinear segment reduction merges contiguous walls', () => {
  // 3 contiguous horizontal segments: (0, 5)->(1, 5), (1, 5)->(2, 5), (2, 5)->(3, 5)
  // 2 contiguous vertical segments: (3, 5)->(3, 7), (3, 7)->(3, 10)
  // 1 disconnected segment: (8, 8)->(9, 8)
  const rawWalls = [
    { p1: [0, 5], p2: [1, 5], blocksLight: true },
    { p1: [1, 5], p2: [2, 5], blocksLight: true },
    { p1: [2, 5], p2: [3, 5], blocksLight: true },
    { p1: [3, 5], p2: [3, 7], blocksLight: true },
    { p1: [3, 7], p2: [3, 10], blocksLight: true },
    { p1: [8, 8], p2: [9, 8], blocksLight: true }
  ];

  const reduced = UniversalVttPackager.reduceCollinearSegments(rawWalls);

  // Expected:
  // 1 horizontal merged segment: (0, 5) -> (3, 5)
  // 1 vertical merged segment: (3, 5) -> (3, 10)
  // 1 disconnected horizontal segment: (8, 8) -> (9, 8)
  assert.equal(reduced.length, 3, `Expected 3 merged segments, got ${reduced.length}`);

  const longHoriz = reduced.find(w => w.p1[1] === 5 && w.p2[1] === 5);
  assert.ok(longHoriz);
  assert.equal(longHoriz.p1[0], 0);
  assert.equal(longHoriz.p2[0], 3);

  const longVert = reduced.find(w => w.p1[0] === 3 && w.p2[0] === 3);
  assert.ok(longVert);
  assert.equal(longVert.p1[1], 5);
  assert.equal(longVert.p2[1], 10);
});

test('UniversalVttPackager - Handles vertical portals correctly', () => {
  const result = UniversalVttPackager.package({
    widthCells: 10,
    heightCells: 10,
    portals: [
      { col: 5, row: 5, horizontal: false, closed: false, freemove: true }
    ]
  });

  const portal = result.data.portals[0];
  assert.equal(portal.freemove, true);
  assert.equal(portal.closed, false);
  assert.deepEqual(portal.bounds, [{ x: 5, y: 4.5 }, { x: 5, y: 5.5 }]);
});
