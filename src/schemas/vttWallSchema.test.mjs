import {
  WALL_TYPES,
  DOOR_STATES,
  createWallSegment,
  toggleDoorState,
  damageWallSegment,
  doesWallBlockVision
} from './vttWallSchema.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Testing VTT Wall & Door Schema...');

// Test 1: createWallSegment
const wall = createWallSegment({ x: 0, y: 0 }, { x: 100, y: 0 }, WALL_TYPES.SOLID);
assert(wall.id, 'Expected wall.id to exist');
assert(wall.type === WALL_TYPES.SOLID, `Expected solid wall, got ${wall.type}`);
assert(wall.p1.x === 0 && wall.p1.y === 0, 'Expected p1 to be (0,0)');
assert(wall.p2.x === 100 && wall.p2.y === 0, 'Expected p2 to be (100,0)');
assert(wall.breachHp === 120, `Expected breachHp 120, got ${wall.breachHp}`);
assert(wall.isOpen === false, 'Expected isOpen false');
assert(doesWallBlockVision(wall) === true, 'Expected wall to block vision');

// Test 2: toggleDoorState
const door = createWallSegment({ x: 50, y: 0 }, { x: 80, y: 0 }, WALL_TYPES.DOOR);
assert(door.type === WALL_TYPES.DOOR, 'Expected door type');
assert(door.doorState === DOOR_STATES.CLOSED, 'Expected closed door');
assert(doesWallBlockVision(door) === true, 'Expected closed door to block vision');

const openedDoor = toggleDoorState(door);
assert(openedDoor.doorState === DOOR_STATES.OPEN, 'Expected open door');
assert(openedDoor.isOpen === true, 'Expected isOpen true');
assert(doesWallBlockVision(openedDoor) === false, 'Expected open door not to block vision');

const closedDoor = toggleDoorState(openedDoor);
assert(closedDoor.doorState === DOOR_STATES.CLOSED, 'Expected closed door after 2nd toggle');
assert(closedDoor.isOpen === false, 'Expected isOpen false');
assert(doesWallBlockVision(closedDoor) === true, 'Expected closed door to block vision');

// Test 3: locked door
const lockedDoor = createWallSegment({ x: 0, y: 0 }, { x: 50, y: 0 }, WALL_TYPES.DOOR, {
  doorState: DOOR_STATES.LOCKED
});
const lockedResult = toggleDoorState(lockedDoor);
assert(lockedResult.doorState === DOOR_STATES.LOCKED, 'Locked door should remain locked on toggle');

// Test 4: damage and breach
const targetDoor = createWallSegment({ x: 0, y: 0 }, { x: 50, y: 0 }, WALL_TYPES.DOOR, { breachHp: 40 });
const damaged = damageWallSegment(targetDoor, 20);
assert(damaged.breachHp === 20, `Expected breachHp 20, got ${damaged.breachHp}`);
assert(damaged.doorState === DOOR_STATES.CLOSED, 'Door should still be closed');

const breached = damageWallSegment(damaged, 25);
assert(breached.breachHp === 0, `Expected breachHp 0, got ${breached.breachHp}`);
assert(breached.doorState === DOOR_STATES.BREACHED, 'Door should be breached');
assert(breached.isOpen === true, 'Breached door should be open');
assert(doesWallBlockVision(breached) === false, 'Breached door should not block vision');

// Test 5: sensor mode exceptions
const windowWall = createWallSegment({ x: 0, y: 0 }, { x: 50, y: 0 }, WALL_TYPES.WINDOW);
assert(doesWallBlockVision(windowWall, 'standard_optical') === false, 'Window should allow optical sight');

const etherealWall = createWallSegment({ x: 0, y: 0 }, { x: 50, y: 0 }, WALL_TYPES.ETHEREAL);
assert(doesWallBlockVision(etherealWall, 'standard_optical') === true, 'Ethereal should block optical sight');
assert(doesWallBlockVision(etherealWall, 'meta_attunement') === false, 'Ethereal should be transparent to Meta Attunement');

console.log('✅ All VTT wall schema tests passed!');
