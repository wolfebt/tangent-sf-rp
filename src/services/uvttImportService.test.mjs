import { parseUniversalVtt } from './uvttImportService.js';
import { WALL_TYPES } from '../schemas/vttWallSchema.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Testing Universal VTT (.dd2vtt) Importer Engine...');

const mockUvtt = {
  format: 0.2,
  resolution: {
    map_origin: { x: 0, y: 0 },
    map_size: { x: 20, y: 15 },
    pixels_per_grid: 70
  },
  line_of_sight: [
    [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 }
    ]
  ],
  portals: [
    {
      position: { x: 5, y: 0 },
      bounds: [
        { x: 4.5, y: 0 },
        { x: 5.5, y: 0 }
      ],
      closed: true,
      freemove: false
    }
  ],
  image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
};

const map = parseUniversalVtt(mockUvtt, 'Test Station 01');

assert(map.title === 'Test Station 01', `Expected title 'Test Station 01', got '${map.title}'`);
assert(map.gridSize === 70, `Expected gridSize 70, got ${map.gridSize}`);
assert(map.width === 20 * 70, `Expected width 1400, got ${map.width}`);
assert(map.height === 15 * 70, `Expected height 1050, got ${map.height}`);

// Should generate 2 solid wall segments from chain of 3 points + 1 door from portal
assert(map.walls.length === 3, `Expected 3 walls, got ${map.walls.length}`);
assert(map.walls[0].type === WALL_TYPES.SOLID, 'Expected solid wall type for index 0');
assert(map.walls[2].type === WALL_TYPES.DOOR, 'Expected door type for index 2');
assert(map.walls[2].isOpen === false, 'Expected door to be closed');

// Terrain background image
assert(map.terrains.length === 1, `Expected 1 terrain, got ${map.terrains.length}`);
assert(map.terrains[0].renderType === 'canvasImage', 'Expected canvasImage renderType');
assert(map.terrains[0].imageUrl.includes('data:image/png;base64,'), 'Expected base64 data url');

console.log('✅ All Universal VTT importer tests passed!');
