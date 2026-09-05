/**
 * @file stage10_3d.test.mjs
 * @description Stage 10 Automated Verification Suite: 3D Tactical Engine & Spatial Tabletop
 * Verifies WallExtruder3D geometry, WaypointRuler3D Euclidean metrics,
 * MultiDeckManager slicing, and LoSRaycast3D cover arbitration.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { WallExtruder3D } from '../../src/engine/3d/geometry/WallExtruder3D.ts';
import { WaypointRuler3D } from '../../src/engine/3d/volumetrics/WaypointRuler3D.ts';
import { MultiDeckManager } from '../../src/engine/3d/cartography/MultiDeckManager.ts';
import { LoSRaycast3D } from '../../src/engine/3d/vision/LoSRaycast3D.ts';
import { WALL_TYPES, DOOR_STATES } from '../../src/schemas/vttWallSchema.js';

test('Stage 10.1: WallExtruder3D wall & door geometry generation', () => {
  const extruder = new WallExtruder3D({ defaultHeight: 70, defaultThickness: 8 });

  // 1. Solid Wall Extrusion
  const solidWall = {
    id: 'wall_test_1',
    p1: { x: 0, y: 0 },
    p2: { x: 140, y: 0 },
    type: WALL_TYPES.SOLID,
    height: 70
  };

  const solidGroup = extruder.createWallMesh(solidWall);
  assert.ok(solidGroup, 'Solid wall group must be generated');
  assert.equal(solidGroup.children.length, 2, 'Must contain main wall mesh and top cap trim');
  assert.equal(solidGroup.userData.wallId, 'wall_test_1');
  assert.equal(solidGroup.position.x, 70, 'Center X must be midpoint (70)');
  assert.equal(solidGroup.position.z, 0, 'Center Z must be midpoint (0)');

  // 2. Bulkhead Door Extrusion (Closed State)
  const closedDoor = {
    id: 'door_test_1',
    p1: { x: 0, y: 0 },
    p2: { x: 70, y: 0 },
    type: WALL_TYPES.DOOR,
    doorState: DOOR_STATES.CLOSED,
    isOpen: false
  };

  const closedGroup = extruder.createWallMesh(closedDoor);
  assert.ok(closedGroup, 'Door group must be generated');
  assert.equal(closedGroup.children.length, 4, 'Door must contain Left Post, Right Post, Lintel, and Door Leaf');
  const closedLeaf = closedGroup.children.find(c => c.name === 'DoorLeaf');
  assert.ok(closedLeaf, 'Door leaf must exist');
  assert.equal(closedLeaf.position.y, 30, 'Closed door leaf rests at ground/frame height');

  // 3. Bulkhead Door Extrusion (Open State)
  const openDoor = {
    id: 'door_test_2',
    p1: { x: 0, y: 0 },
    p2: { x: 70, y: 0 },
    type: WALL_TYPES.DOOR,
    doorState: DOOR_STATES.OPEN,
    isOpen: true
  };

  const openGroup = extruder.createWallMesh(openDoor);
  const openLeaf = openGroup.children.find(c => c.name === 'DoorLeaf');
  assert.ok(openLeaf, 'Open door leaf must exist');
  assert.ok(openLeaf.position.y > 50, 'Open door leaf must slide up into bulkhead recess');
});

test('Stage 10.2: WaypointRuler3D Euclidean metrics & AP cost calculation', () => {
  const ruler = new WaypointRuler3D();

  // Test 1: Flat horizontal measurement (0 to 420 world units along X = 30ft)
  // At 70 units per 5ft cell: 420 units = 6 cells = 30 ft
  ruler.start(0, 0, 0);
  const metricsFlat = ruler.updateEnd(420, 0, 0);
  assert.ok(metricsFlat, 'Metrics must calculate');
  assert.equal(metricsFlat.distanceFt, 30);
  assert.equal(metricsFlat.horizontalFt, 30);
  assert.equal(metricsFlat.verticalFt, 0);
  assert.equal(metricsFlat.cells, 6);
  assert.equal(metricsFlat.apCost, 1, '30ft movement must cost 1 AP');

  // Test 2: 3D Diagonal Measurement with Vertical Climb
  // (0, 0, 0) to (420, 560, 0) -> horizontal = 30ft, vertical = 40ft (560 units * 5/70 = 40ft)
  // 3D Euclidean distance = sqrt(30^2 + 40^2) = 50 ft!
  ruler.start(0, 0, 0);
  const metrics3D = ruler.updateEnd(420, 560, 0);
  assert.ok(metrics3D);
  assert.equal(metrics3D.horizontalFt, 30);
  assert.equal(metrics3D.verticalFt, 40);
  assert.equal(metrics3D.distanceFt, 50, '3D distance must be exactly 50 ft (3-4-5 triangle)');
  assert.equal(metrics3D.cells, 10, '50ft / 5ft = 10 cells');
  assert.equal(metrics3D.apCost, 2, '50ft movement requires 2 AP (30ft/AP)');

  ruler.clear();
});

test('Stage 10.3: MultiDeckManager vertical deck resolution & slicing', () => {
  const deckMgr = new MultiDeckManager([
    { id: 'sublevel', name: 'Sub-Level 1', elevationFt: -15, ceilingHeightFt: 12 },
    { id: 'main', name: 'Main Deck', elevationFt: 0, ceilingHeightFt: 12 },
    { id: 'bridge', name: 'Upper Bridge', elevationFt: 15, ceilingHeightFt: 14 },
    { id: 'roof', name: 'Roof Canopy', elevationFt: 30, ceilingHeightFt: 10, isRoof: true }
  ]);

  assert.equal(deckMgr.getDecks().length, 4);
  assert.equal(deckMgr.getActiveDeck().id, 'sublevel');

  // Deck elevation matching
  assert.equal(deckMgr.getDeckForElevation(-10).id, 'sublevel');
  assert.equal(deckMgr.getDeckForElevation(0).id, 'main');
  assert.equal(deckMgr.getDeckForElevation(20).id, 'bridge');
  assert.equal(deckMgr.getDeckForElevation(35).id, 'roof');

  deckMgr.setActiveDeck('main');
  assert.equal(deckMgr.getActiveDeck().id, 'main');
});

test('Stage 10.4: LoSRaycast3D line of sight & cover arbitration', () => {
  const los = new LoSRaycast3D();

  // Test 1: Clear line of sight on same plane
  const attacker = { id: 'att_1', x: 0, y: 0, elevation_ft: 0 };
  const target = { id: 'tar_1', x: 280, y: 0, elevation_ft: 0 }; // 20ft away

  const resClear = los.evaluateLoS(attacker, target, []);
  assert.equal(resClear.hasLoS, true);
  assert.equal(resClear.coverTier, 'NONE');
  assert.equal(resClear.coverBonusToTarget, 0);
  assert.equal(resClear.distanceFt, 20.2);

  // Test 2: High Ground Vantage (+2 Attack modifier)
  const attackerHigh = { id: 'att_2', x: 0, y: 0, elevation_ft: 20 }; // 20ft high ground sniper
  const targetLow = { id: 'tar_2', x: 280, y: 0, elevation_ft: 0 };

  const resHighGround = los.evaluateLoS(attackerHigh, targetLow, []);
  assert.equal(resHighGround.hasLoS, true);
  assert.equal(resHighGround.coverTier, 'NONE');
  assert.equal(resHighGround.attackModifier, 2, 'High ground provides +2 attack modifier');
  assert.ok(resHighGround.reason.includes('High-Ground Vantage'));
});
