import { computeVisibilityPolygon, isPointVisible } from './raycastVisionService.js';
import { createWallSegment, WALL_TYPES, DOOR_STATES } from '../schemas/vttWallSchema.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Testing 2D Raycast Vision Engine...');

// Test 1: computeVisibilityPolygon in open area
const origin = { x: 500, y: 500 };
const walls = [];
const polygon = computeVisibilityPolygon(origin, walls, {
  maxRadius: 200,
  bounds: { width: 1000, height: 1000 }
});

assert(Array.isArray(polygon), 'Visibility polygon should be an array');
assert(polygon.length >= 8, `Expected at least 8 polygon coordinates, got ${polygon.length}`);
assert(typeof polygon[0] === 'number', 'Polygon coordinate should be number');
assert(typeof polygon[1] === 'number', 'Polygon coordinate should be number');

// Test 2: Occlusion by solid wall
const testOrigin = { x: 100, y: 100 };
const solidWall = createWallSegment({ x: 200, y: 0 }, { x: 200, y: 200 }, WALL_TYPES.SOLID);
const targetBehind = { x: 300, y: 100 };
const targetInFront = { x: 150, y: 100 };

assert(isPointVisible(testOrigin, targetBehind, [solidWall]) === false, 'Target behind wall should be occluded');
assert(isPointVisible(testOrigin, targetInFront, [solidWall]) === true, 'Target in front of wall should be visible');

// Test 3: Open door and window pass-through
const openDoor = createWallSegment({ x: 200, y: 0 }, { x: 200, y: 200 }, WALL_TYPES.DOOR, {
  doorState: DOOR_STATES.OPEN
});
assert(isPointVisible(testOrigin, targetBehind, [openDoor]) === true, 'Target through open door should be visible');

const closedDoor = createWallSegment({ x: 200, y: 0 }, { x: 200, y: 200 }, WALL_TYPES.DOOR, {
  doorState: DOOR_STATES.CLOSED
});
assert(isPointVisible(testOrigin, targetBehind, [closedDoor]) === false, 'Target through closed door should be occluded');

const windowWall = createWallSegment({ x: 200, y: 0 }, { x: 200, y: 200 }, WALL_TYPES.WINDOW);
assert(isPointVisible(testOrigin, targetBehind, [windowWall]) === true, 'Target through window should be visible');

console.log('✅ All 2D raycast vision tests passed!');
