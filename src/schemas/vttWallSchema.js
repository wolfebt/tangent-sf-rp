/**
 * vttWallSchema.js
 * Comprehensive schema and helper functions for Tangent SF RP Wall & Barrier Geometry.
 */

export const WALL_TYPES = {
  SOLID: 'solid',         // Blocks movement, line-of-sight, and light
  DOOR: 'door',           // Toggleable portal (open/closed/locked) with breach HP & cyber hack DC
  WINDOW: 'window',       // Blocks movement; allows sight and light
  ETHEREAL: 'ethereal',   // Blocks physical movement; allows meta-attunement sight
  ONE_WAY: 'one_way'      // Blocks sight from p1->p2, allows from p2->p1
};

export const DOOR_STATES = {
  CLOSED: 'closed',
  OPEN: 'open',
  LOCKED: 'locked',
  BREACHED: 'breached'
};

/**
 * Creates a new standardized wall segment
 */
export const createWallSegment = (p1, p2, type = WALL_TYPES.SOLID, options = {}) => {
  const isDoor = type === WALL_TYPES.DOOR;
  return {
    id: options.id || `wall_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    p1: { x: Math.round(p1.x), y: Math.round(p1.y) },
    p2: { x: Math.round(p2.x), y: Math.round(p2.y) },
    type,
    doorState: isDoor ? (options.doorState || DOOR_STATES.CLOSED) : null,
    isOpen: isDoor ? options.doorState === DOOR_STATES.OPEN : false,
    isLocked: isDoor ? options.doorState === DOOR_STATES.LOCKED : false,
    label: options.label || (isDoor ? 'Bulkhead Door' : 'Reinforced Wall'),
    breachHp: options.breachHp !== undefined ? options.breachHp : (isDoor ? 40 : 120),
    maxBreachHp: options.maxBreachHp !== undefined ? options.maxBreachHp : (isDoor ? 40 : 120),
    hackDc: isDoor ? (options.hackDc || 14) : null,
    athleticsDc: isDoor ? (options.athleticsDc || 16) : 24,
    color: options.color || (isDoor ? '#f59e0b' : (type === WALL_TYPES.WINDOW ? '#38bdf8' : '#e2e8f0')),
    isSecret: options.isSecret || false
  };
};

/**
 * Toggles a door segment state (Closed -> Open -> Closed)
 */
export const toggleDoorState = (wall) => {
  if (wall.type !== WALL_TYPES.DOOR || wall.doorState === DOOR_STATES.BREACHED) {
    return wall;
  }
  if (wall.doorState === DOOR_STATES.LOCKED) {
    return wall; // Must unlock before toggling
  }
  const nextState = wall.doorState === DOOR_STATES.OPEN ? DOOR_STATES.CLOSED : DOOR_STATES.OPEN;
  return {
    ...wall,
    doorState: nextState,
    isOpen: nextState === DOOR_STATES.OPEN
  };
};

/**
 * Applies damage to a wall or door segment and triggers breach if HP reaches 0
 */
export const damageWallSegment = (wall, damageAmount) => {
  const nextHp = Math.max(0, (wall.breachHp || 0) - damageAmount);
  const isBreached = nextHp === 0;
  return {
    ...wall,
    breachHp: nextHp,
    doorState: isBreached ? DOOR_STATES.BREACHED : wall.doorState,
    isOpen: isBreached ? true : wall.isOpen
  };
};

/**
 * Determines if a wall currently blocks line-of-sight based on type and door state
 */
export const doesWallBlockVision = (wall, sensorMode = 'standard_optical') => {
  if (wall.type === WALL_TYPES.DOOR) {
    return wall.doorState !== DOOR_STATES.OPEN && wall.doorState !== DOOR_STATES.BREACHED;
  }
  if (wall.type === WALL_TYPES.WINDOW) {
    return false; // Windows allow optical sight
  }
  if (wall.type === WALL_TYPES.ETHEREAL) {
    return sensorMode !== 'meta_attunement'; // Ethereal blocks optical, transparent to Meta
  }
  if (sensorMode === 'cyber_radar') {
    // Cyber radar can penetrate low-HP drywall/bulkheads
    return (wall.breachHp || 0) > 80;
  }
  return true;
};
