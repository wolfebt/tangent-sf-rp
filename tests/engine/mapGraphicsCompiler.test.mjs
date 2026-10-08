/**
 * @file mapGraphicsCompiler.test.mjs
 * @description Automated Unit Tests for Stage 7.1: MapGraphicsCompiler & Universal VTT Integration.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { MapGraphicsCompiler } from '../../src/engine/compilers/MapGraphicsCompiler.ts';
import { UniversalVttPackager } from '../../src/engine/compilers/UniversalVttPackager.ts';

test('Stage 7.1: MapGraphicsCompiler compiles data URL and Universal VTT base64', async () => {
  const options = {
    widthCells: 10,
    heightCells: 8,
    pixelsPerGrid: 50,
    backgroundColor: '#090d16',
    showGridLines: true,
    terrains: [
      { id: 't-1', renderType: 'rect', x: 0, y: 0, width: 100, height: 100, color: '#1e293b' },
      { id: 't-2', renderType: 'hexTile', x: 150, y: 150, radius: 40, color: '#334155' },
      { id: 't-3', renderType: 'circle', x: 250, y: 250, radius: 25, color: '#047857' },
      { id: 't-4', renderType: 'polygon', points: [300, 300, 350, 320, 330, 380], color: '#7c3aed' }
    ],
    underlays: [
      { id: 'u-1', x: 50, y: 50, category: 'scorch', width: 30, height: 30, color: '#020617' },
      { id: 'u-2', x: 100, y: 100, category: 'blood', radius: 15, color: '#881337' },
      { id: 'u-3', x: 200, y: 200, category: 'debris', width: 20, height: 40, rotation: 45 }
    ]
  };

  // Compile to data URL
  const dataUrl = MapGraphicsCompiler.compileToDataUrl(options, 'image/webp');
  assert.ok(typeof dataUrl === 'string');
  assert.ok(dataUrl.startsWith('data:image/'));

  // Compile for Universal VTT (raw base64 payload)
  const base64 = MapGraphicsCompiler.compileForUniversalVtt(options);
  assert.ok(typeof base64 === 'string');
  assert.ok(!base64.startsWith('data:'));
  assert.ok(base64.length > 0);
});

test('Stage 7.1: MapGraphicsCompiler integrates with UniversalVttPackager', () => {
  const options = {
    widthCells: 12,
    heightCells: 10,
    pixelsPerGrid: 50,
    terrains: [
      { renderType: 'rect', x: 0, y: 0, width: 600, height: 500, color: '#0f172a' }
    ],
    underlays: [
      { x: 100, y: 100, category: 'scorch', width: 50, height: 50 }
    ]
  };

  const base64Image = MapGraphicsCompiler.compileForUniversalVtt(options);

  const uvttResult = UniversalVttPackager.package({
    widthCells: options.widthCells,
    heightCells: options.heightCells,
    pixelsPerGrid: options.pixelsPerGrid,
    base64Image,
    walls: [
      { p1: [1, 1], p2: [5, 1], blocksLight: true },
      { p1: [5, 1], p2: [5, 5], blocksLight: true }
    ],
    portals: [
      { col: 3, row: 1, horizontal: true, closed: true }
    ],
    lights: [
      { col: 3, row: 3, rangeFt: 20, colorHex: '#00ffcc', intensity: 0.9 }
    ]
  });

  assert.equal(uvttResult.data.format, 0.2);
  assert.equal(uvttResult.data.resolution.map_size.x, 12);
  assert.equal(uvttResult.data.resolution.map_size.y, 10);
  assert.equal(uvttResult.data.resolution.pixels_per_grid, 50);
  assert.equal(uvttResult.data.image, base64Image);
  assert.equal(uvttResult.data.portals.length, 1);
  assert.equal(uvttResult.data.lights.length, 1);
  assert.equal(uvttResult.data.lights[0].color, '00ffcc');
  assert.ok(uvttResult.jsonString.length > 50);
});
