/**
 * @file tangentUDUEngine.test.mjs
 * @description Comprehensive unit test suite for Universal Displacement Unit (UDU) Calculation Engine
 * (src/engines/tangentUDUEngine.js): Node capacities, 50% external Socket rule, logarithmic 10x tier scaling,
 * node/socket/mount/module budget validators, and cybernetic social stigma thresholds.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNodeCapacity,
  getTotalBodyNodes,
  getExternalSocketMax,
  convertUDUScale,
  validateNodeAllocation,
  calculateSocketBudget,
  calculateMountBudget,
  calculateModuleBudget,
  getStigmaLevel
} from '../../src/engines/tangentUDUEngine.js';

test('UDU Engine: Anatomical Body Slot Node Capacities & Total Humanoid Frame (200 Nodes)', () => {
  assert.equal(getTotalBodyNodes(), 200, 'Standard humanoid frame must total 200 Nodes');

  const slots = ['Head', 'Torso', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg'];
  const sum = slots.reduce((acc, slot) => acc + getNodeCapacity(slot), 0);
  assert.equal(sum, 200, 'Sum of individual anatomical slots must equal 200 Nodes');
  assert.equal(getNodeCapacity('Head'), 10);
  assert.equal(getNodeCapacity('Torso'), 50);
  assert.equal(getNodeCapacity('LeftArm'), 30);
  assert.equal(getNodeCapacity('RightArm'), 30);
  assert.equal(getNodeCapacity('LeftLeg'), 40);
  assert.equal(getNodeCapacity('RightLeg'), 40);
  assert.equal(getNodeCapacity('UnknownSlot'), 0, 'Invalid body slot should safely return 0');
});

test('UDU Engine: External Socket Mount Rule (<= 50% of Base Node Capacity / 10)', () => {
  // Torso: 50 nodes -> 5 base sockets -> 50% = 2.5 -> floor = 2 external sockets
  assert.equal(getExternalSocketMax('Torso'), 2);
  // Legs: 40 nodes -> 4 base sockets -> 50% = 2 external sockets
  assert.equal(getExternalSocketMax('LeftLeg'), 2);
  // Arms: 30 nodes -> 3 base sockets -> 50% = 1.5 -> floor = 1 external socket
  assert.equal(getExternalSocketMax('LeftArm'), 1);
  // Head: 10 nodes -> 1 base socket -> 50% = 0.5 -> floor = 0 external sockets
  assert.equal(getExternalSocketMax('Head'), 0);
});

test('UDU Engine: Logarithmic Scale Hierarchy Conversion (10 Nodes = 1 Socket = 0.1 Mount = 0.01 Module)', () => {
  assert.equal(convertUDUScale('Node', 'Socket', 100), 10);
  assert.equal(convertUDUScale('Node', 'Mount', 100), 1);
  assert.equal(convertUDUScale('Node', 'Module', 1000), 1);
  assert.equal(convertUDUScale('Module', 'Node', 2), 2000);
  assert.equal(convertUDUScale('Mount', 'Socket', 3), 30);
  assert.equal(convertUDUScale('Socket', 'Socket', 7), 7);
  assert.equal(convertUDUScale('InvalidTier', 'Socket', 15), 15, 'Invalid tier should return raw numeric amount');
});

test('UDU Engine: validateNodeAllocation enforces anatomical slot node budgets', () => {
  const headValid = validateNodeAllocation('Head', [
    { name: 'Neural Processor', nodes: 4 },
    { name: 'Optical HUD', nodeCost: 5 }
  ]);
  assert.equal(headValid.valid, true);
  assert.equal(headValid.used, 9);
  assert.equal(headValid.max, 10);
  assert.equal(headValid.remaining, 1);
  assert.equal(headValid.percentUsed, 90);

  const headOver = validateNodeAllocation('Head', [
    { name: 'Deep Cortex Array', nodes: 8 },
    { name: 'Subdermal Sonar', cost_nodes: 5 }
  ]);
  assert.equal(headOver.valid, false);
  assert.equal(headOver.used, 13);
  assert.equal(headOver.remaining, -3);
  assert.equal(headOver.percentUsed, 100);
});

test('UDU Engine: Socket, Mount, and Module budget calculators handle numeric counts and item arrays', () => {
  // Tier 1: Sockets
  const socketRes = calculateSocketBudget(4, [{ sockets: 2 }, { socketCost: 1 }]);
  assert.equal(socketRes.max, 4);
  assert.equal(socketRes.used, 3);
  assert.equal(socketRes.remaining, 1);
  assert.equal(socketRes.isOverBudget, false);

  const socketOver = calculateSocketBudget(2, 3);
  assert.equal(socketOver.isOverBudget, true);
  assert.equal(socketOver.remaining, -1);

  // Tier 2: Mounts (Mecha/Vehicles)
  const mountRes = calculateMountBudget(6, [{ mounts: 3 }, { mountCost: 2 }]);
  assert.equal(mountRes.used, 5);
  assert.equal(mountRes.remaining, 1);
  assert.equal(mountRes.isOverBudget, false);

  // Tier 3: Modules (Starships/Architecture)
  const modRes = calculateModuleBudget(10, [{ modules: 6 }, { moduleCost: 5 }]);
  assert.equal(modRes.used, 11);
  assert.equal(modRes.remaining, -1);
  assert.equal(modRes.isOverBudget, true);
});

test('UDU Engine: getStigmaLevel resolves social cybernetic stigma thresholds accurately', () => {
  const zeroMods = getStigmaLevel(0);
  assert.ok(zeroMods, 'Should return baseline stigma entry for 0 visible mods');
  assert.equal(zeroMods.minMods, 0);

  const moderateMods = getStigmaLevel(3);
  assert.ok(moderateMods);
  assert.ok(3 >= moderateMods.minMods && 3 <= moderateMods.maxMods);

  const extremeMods = getStigmaLevel(99);
  assert.ok(extremeMods, 'Should clamp to highest stigma threshold for extreme mod counts');
});
