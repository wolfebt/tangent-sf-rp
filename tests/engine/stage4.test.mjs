/**
 * @file stage4.test.mjs
 * @description Stage 4 Automated Verification Suite
 * Verifies InteractiveObjectManager, N-Vector Geodesy, Astrogation MST, and BSP Deckplan Generator.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { InteractiveObjectManager } from '../../src/engine/assets/InteractiveObjectManager.ts';
import { BVHBuilder } from '../../src/engine/vision/BVHBuilder.ts';
import { NVectorCalculator } from '../../src/engine/cartography/NVectorCalculator.ts';
import { AstrogationGenerator } from '../../src/engine/cartography/AstrogationGenerator.ts';
import { BSPDeckplanGenerator } from '../../src/engine/cartography/BSPDeckplanGenerator.ts';

test('Stage 4.1: InteractiveObjectManager & Story Foundry / Omnicortex Integration', () => {
  const bvh = new BVHBuilder();
  bvh.build([
    { id: 'bulkhead-1', p1: { x: 100, y: 0 }, p2: { x: 100, y: 100 }, isDynamic: true, isOpen: false }
  ]);

  const manager = new InteractiveObjectManager(bvh);

  manager.loadObjects([
    {
      id: 'bulkhead-1',
      name: 'Airlock Security Bulkhead',
      type: 'bulkhead',
      x: 100,
      y: 50,
      storyElementId: 'clue-breached-airlock'
    },
    {
      id: 'terminal-core',
      name: 'Mainframe Datapad',
      type: 'terminal',
      x: 300,
      y: 300,
      storyElementId: 'log-classified-manifest'
    },
    {
      id: 'crate-omega',
      name: 'Omnicortex Weapon Cache',
      type: 'loot_container',
      x: 500,
      y: 500,
      omnicortexGearId: 'plasma-rifle-tl4'
    }
  ]);

  assert.equal(manager.getAllObjects().length, 3);

  // 1. Interact with bulkhead -> toggles state and updates BVH LoS
  const bulkheadRes = manager.interact('bulkhead-1', 'op-jax');
  assert.equal(bulkheadRes.success, true);
  assert.equal(bulkheadRes.eventType, 'BULKHEAD_TOGGLED');
  assert.equal(bulkheadRes.data.isOpen, true);

  // BVH check: wall should now be non-occluding
  const queried = bvh.queryRadius(100, 50, 150);
  assert.equal(queried.length, 0, 'Door should be non-occluding in BVH after interaction');

  // 2. Interact with terminal -> accesses Story Foundry node
  const termRes = manager.interact('terminal-core', 'op-jax');
  assert.equal(termRes.success, true);
  assert.equal(termRes.eventType, 'TERMINAL_ACCESSED');
  assert.equal(termRes.data.storyElementId, 'log-classified-manifest');

  // 3. Loot weapon cache -> dispenses Omnicortex gear
  const lootRes = manager.interact('crate-omega', 'op-jax');
  assert.equal(lootRes.success, true);
  assert.equal(lootRes.eventType, 'LOOT_RETRIEVED');
  assert.equal(lootRes.data.gearId, 'plasma-rifle-tl4');
});

test('Stage 4.4: NVectorCalculator 3D Geodesy & Cross-Track Distance', () => {
  const geo = new NVectorCalculator();

  // Equator point (0, 0)
  const p1 = { latitude: 0, longitude: 0 };
  const nv1 = geo.latLonToNVector(p1);
  assert.ok(Math.abs(nv1.x - 1.0) < 0.001);
  assert.ok(Math.abs(nv1.y) < 0.001);
  assert.ok(Math.abs(nv1.z) < 0.001);

  // North Pole point (90, 0)
  const pNorth = { latitude: 90, longitude: 0 };
  const nvNorth = geo.latLonToNVector(pNorth);
  assert.ok(Math.abs(nvNorth.z - 1.0) < 0.001);

  // Great Circle Distance Equator to Pole: Quarter circumference ~ 10,007 km on Earth (6371km radius)
  const distPole = geo.greatCircleDistance(p1, pNorth, 6371);
  const expectedDist = (Math.PI / 2) * 6371;
  assert.ok(Math.abs(distPole - expectedDist) < 1.0);

  // Cross-track distance from a point lying directly on path should be ~0
  const pathStart = { latitude: 0, longitude: 0 };
  const pathEnd = { latitude: 0, longitude: 90 };
  const pointOnPath = { latitude: 0, longitude: 45 };
  const crossDist = geo.crossTrackDistance(pathStart, pathEnd, pointOnPath, 6371);
  assert.ok(crossDist < 0.01);
});

test('Stage 4.5: AstrogationGenerator Poisson Disk Sampling & Kruskal MST Hyperlanes', () => {
  const astro = new AstrogationGenerator();

  const stars = astro.generateStarField(1000, 1000, 100);
  assert.ok(stars.length >= 5, 'Should generate multiple star systems');

  // Verify no two stars are closer than minRadius (100)
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      assert.ok(dist >= 99.9, `Stars ${i} and ${j} must not violate min distance: ${dist}`);
    }
  }

  // Generate Hyperlanes
  const lanes = astro.generateHyperlanes(stars);
  assert.equal(lanes.length, stars.length - 1, 'Kruskal MST must connect N stars with exactly N-1 hyperlanes');
});

test('Stage 4.6: BSPDeckplanGenerator Space Partitioning & CSG Rect Output', () => {
  const bsp = new BSPDeckplanGenerator();
  const rects = bsp.generate(1000, 1000, 3);
  
  assert.ok(rects.length > 0, 'Must generate CSG walkable room/corridor rectangles');
  for (const r of rects) {
    assert.ok(r.w > 0 && r.h > 0, 'Every rect must have positive width and height');
  }
});
