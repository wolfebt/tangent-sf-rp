/**
 * @file stage3.test.mjs
 * @description Stage 3 Automated Verification Suite
 * Verifies BVHBuilder spatial pre-culling, dynamic doors, 16-byte WGSL alignment, and shader strings.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { BVHBuilder } from '../../src/engine/vision/BVHBuilder.ts';
import { WGSLComputeContext } from '../../src/engine/vision/WGSLComputeContext.ts';
import { FUSED_VISION_WGSL } from '../../src/engine/vision/shaders/fused_vision.wgsl.ts';
import { SDF_CSG_CORE_WGSL } from '../../src/engine/vision/shaders/sdf_csg_core.wgsl.ts';
import { ELEMENTAL_FLUID_WGSL } from '../../src/engine/physics/shaders/elemental_fluid.wgsl.ts';
import { BOIDS_SWARM_WGSL } from '../../src/engine/physics/shaders/boids_swarm.wgsl.ts';

test('Stage 3.2: BVHBuilder Spatial Tree Construction & Radius Pre-Culling', () => {
  const bvh = new BVHBuilder();

  // Create 100 mock walls across a 10,000 x 10,000 map
  const walls = [];
  for (let i = 0; i < 100; i++) {
    const x = i * 100;
    const y = i * 100;
    walls.push({
      id: `wall-${i}`,
      p1: { x, y },
      p2: { x: x + 50, y: y + 50 }
    });
  }

  bvh.build(walls);

  // Query a small 200px vision circle at (500, 500)
  const nearbyWalls = bvh.queryRadius(500, 500, 200);
  assert.ok(nearbyWalls.length > 0, 'Should find nearby walls');
  assert.ok(nearbyWalls.length < 20, 'Should prune distant walls (>80% culled)');

  // Test GPU Flattening
  const gpuBuffer = bvh.flattenForGPU(nearbyWalls);
  assert.equal(gpuBuffer.length, nearbyWalls.length * 4, 'Buffer must have 4 floats per wall');
  assert.equal(gpuBuffer.byteLength % 16, 0, 'Buffer byteLength must be a multiple of 16 bytes');
});

test('Stage 3.2: BVHBuilder Dynamic Door & Bulkhead State Toggling', () => {
  const bvh = new BVHBuilder();

  const walls = [
    { id: 'perimeter-wall', p1: { x: 0, y: 0 }, p2: { x: 1000, y: 0 } },
    { id: 'security-bulkhead', p1: { x: 500, y: 0 }, p2: { x: 500, y: 100 }, isDynamic: true, isOpen: false }
  ];

  bvh.build(walls);
  let queried = bvh.queryRadius(500, 50, 200);
  assert.equal(queried.length, 2, 'Closed door is occluding');

  // Open the door (e.g. slicing console)
  bvh.setDoorState('security-bulkhead', true);
  queried = bvh.queryRadius(500, 50, 200);
  assert.equal(queried.length, 1, 'Open door is non-occluding and pruned from ray tree');
  assert.equal(queried[0].id, 'perimeter-wall');
});

test('Stage 3.1: WGSLComputeContext 16-byte Buffer Alignment', () => {
  const compute = new WGSLComputeContext();

  // Test 3 floats (12 bytes) -> should pad to 4 floats (16 bytes)
  const vec3Data = [1.0, 2.0, 3.0];
  const aligned = compute.alignTo16Bytes(vec3Data);
  assert.equal(aligned.length, 4);
  assert.equal(aligned.byteLength, 16);
  assert.equal(aligned[0], 1.0);
  assert.equal(aligned[1], 2.0);
  assert.equal(aligned[2], 3.0);
  assert.equal(aligned[3], 0.0);
});

test('Stage 3.3 - 3.6: WGSL Shader Constants Availability', () => {
  assert.ok(FUSED_VISION_WGSL.includes('@compute'), 'Fused vision shader valid');
  assert.ok(SDF_CSG_CORE_WGSL.includes('sdBox'), 'SDF CSG shader valid');
  assert.ok(ELEMENTAL_FLUID_WGSL.includes('calculate_normal'), 'Elemental fluid shader valid');
  assert.ok(BOIDS_SWARM_WGSL.includes('rule1_scale'), 'Boids swarm shader valid');
});
