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
    map_origin: { x: 1, y: 2 },
    map_size: { x: 20, y: 15 },
    pixels_per_grid: 70
  },
  line_of_sight: [
    [
      { x: 1, y: 2 },
      { x: 11, y: 2 },
      { x: 11, y: 12 }
    ]
  ],
  objects_line_of_sight: [
    [
      { x: 3, y: 4 },
      { x: 5, y: 4 }
    ]
  ],
  portals: [
    {
      position: { x: 6, y: 2 },
      bounds: [
        { x: 5.5, y: 2 },
        { x: 6.5, y: 2 }
      ],
      closed: true,
      freemove: false
    }
  ],
  lights: [
    {
      position: { x: 4, y: 5 },
      range: 4,
      intensity: 0.9,
      color: 'ff38bdf8',
      shadows: true
    }
  ],
  environment: {
    ambient_light: '#1e293b'
  },
  image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
};

const map = parseUniversalVtt(mockUvtt, 'Test Station 01');

assert(map.title === 'Test Station 01', `Expected title 'Test Station 01', got '${map.title}'`);
assert(map.type === 'Interior', `Expected canonical MAP_TYPES type 'Interior', got '${map.type}'`);
assert(map.gridSize === 70, `Expected gridSize 70, got ${map.gridSize}`);
assert(map.width === 20 * 70, `Expected width 1400, got ${map.width}`);
assert(map.height === 15 * 70, `Expected height 1050, got ${map.height}`);

// Should generate 2 walls from line_of_sight + 1 from objects_line_of_sight + 1 door from portal
assert(map.walls.length === 4, `Expected 4 walls (including objects_line_of_sight + portal), got ${map.walls.length}`);
assert(map.walls[0].type === WALL_TYPES.SOLID, 'Expected solid wall type for index 0');
assert(map.walls[0].p1.x === 0 && map.walls[0].p1.y === 0, `Expected map_origin subtracted from wall p1, got (${map.walls[0].p1.x}, ${map.walls[0].p1.y})`);
assert(map.walls[3].type === WALL_TYPES.DOOR, 'Expected door type for portal');
assert(map.walls[3].isOpen === false, 'Expected door to be closed');

// Dynamic lights + ambient light
assert(Array.isArray(map.lights) && map.lights.length === 1, `Expected 1 light, got ${map.lights?.length}`);
assert(map.lights[0].x === 3 * 70 && map.lights[0].y === 3 * 70, `Expected origin-adjusted light position (210, 210), got (${map.lights[0].x}, ${map.lights[0].y})`);
assert(map.lights[0].color === '#38bdf8', `Expected ARGB ff38bdf8 stripped to #38bdf8, got ${map.lights[0].color}`);
assert(map.ambientLight === '#1e293b', `Expected ambientLight #1e293b, got ${map.ambientLight}`);

// Terrain background image
assert(map.terrains.length === 1, `Expected 1 terrain, got ${map.terrains.length}`);
assert(map.terrains[0].renderType === 'canvasImage', 'Expected canvasImage renderType');
assert(map.terrains[0].imageUrl.includes('data:image/png;base64,'), 'Expected base64 data url');

console.log('✅ All Universal VTT importer tests passed!');
