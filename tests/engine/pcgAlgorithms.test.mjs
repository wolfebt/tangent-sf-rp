import test from 'node:test';
import assert from 'node:assert/strict';
import { CellularAutomataCaverns } from '../../src/engine/pcg/CellularAutomataCaverns.ts';
import { DrunkardsWalkTunnel } from '../../src/engine/pcg/DrunkardsWalkTunnel.ts';
import { WaveFunctionCollapse } from '../../src/engine/pcg/WaveFunctionCollapse.ts';
import { NodeGraphLayoutSolver } from '../../src/engine/pcg/NodeGraphLayoutSolver.ts';
import { MarchingSquaresAutoTiler } from '../../src/engine/canvas/MarchingSquaresAutoTiler.ts';
import { SemanticZoneMask, SemanticFlag } from '../../src/engine/executor/SemanticZoneMask.ts';

test('CellularAutomataCaverns - Generates bounded cavern with perimeter walls', () => {
  const cavern = CellularAutomataCaverns.generateCavern({
    width: 20,
    height: 20,
    fillProbability: 0.45,
    smoothIterations: 3
  });

  assert.equal(cavern.length, 20);
  assert.equal(cavern[0].length, 20);

  // Borders must be solid walls (false)
  for (let c = 0; c < 20; c++) {
    assert.equal(cavern[0][c], false, 'Top border must be wall');
    assert.equal(cavern[19][c], false, 'Bottom border must be wall');
  }
  for (let r = 0; r < 20; r++) {
    assert.equal(cavern[r][0], false, 'Left border must be wall');
    assert.equal(cavern[r][19], false, 'Right border must be wall');
  }

  // Interior should contain some floor tiles
  const floorCount = cavern.flat().filter(Boolean).length;
  assert.ok(floorCount > 10, 'Expected cavern to contain carved floor tiles');
});

test('DrunkardsWalkTunnel - Carves connected path without leaving boundary', () => {
  const tunnel = DrunkardsWalkTunnel.generateTunnel({
    width: 25,
    height: 25,
    targetFloorRatio: 0.25,
    startCol: 12,
    startRow: 12
  });

  assert.equal(tunnel[12][12], true, 'Start coordinate must be floor');

  // Check outer borders remain intact
  for (let i = 0; i < 25; i++) {
    assert.equal(tunnel[0][i], false);
    assert.equal(tunnel[24][i], false);
    assert.equal(tunnel[i][0], false);
    assert.equal(tunnel[i][24], false);
  }

  const floorCount = tunnel.flat().filter(Boolean).length;
  assert.ok(floorCount >= 20, 'Expected sufficient floor cells carved');
});

test('WaveFunctionCollapse - Resolves tile sockets according to adjacency rules', () => {
  const prototypes = [
    {
      id: 'corridor_horizontal',
      name: 'Horizontal Hall',
      sockets: { top: 'wall', right: 'floor', bottom: 'wall', left: 'floor' }
    },
    {
      id: 'corridor_vertical',
      name: 'Vertical Hall',
      sockets: { top: 'floor', right: 'wall', bottom: 'floor', left: 'wall' }
    },
    {
      id: 'crossroad',
      name: '4-Way Intersection',
      sockets: { top: 'floor', right: 'floor', bottom: 'floor', left: 'floor' }
    }
  ];

  const solved = WaveFunctionCollapse.solve(4, 4, prototypes);
  assert.equal(solved.length, 4);
  assert.equal(solved[0].length, 4);

  // Ensure every cell received a valid prototype
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      assert.ok(solved[r][c], `Cell (${c}, ${r}) should be collapsed`);
    }
  }
});

test('NodeGraphLayoutSolver - Connects functional rooms with hallways', () => {
  const nodes = [
    { id: 'airlock', name: 'Airlock', widthCells: 4, heightCells: 4 },
    { id: 'lab', name: 'Science Lab', widthCells: 5, heightCells: 5 }
  ];

  const edges = [
    { fromNodeId: 'airlock', toNodeId: 'lab' }
  ];

  const solution = NodeGraphLayoutSolver.solveLayout(30, 20, nodes, edges);
  assert.equal(solution.rooms.length, 2);
  assert.equal(solution.hallways.length, 1);
  assert.ok(solution.hallways[0].cells.length > 0, 'Hallway should carve cells');

  // Verify room tiles are marked as floor in grid
  const airlock = solution.rooms[0];
  assert.equal(solution.grid[airlock.bounds.row][airlock.bounds.col], true);
});

test('MarchingSquaresAutoTiler - Calculates 4-bit bitmasks correctly', () => {
  // Grid with a center tile surrounded by North and East neighbors
  const mockGrid = {
    '10,9': true,  // North
    '11,10': true, // East
    '9,10': false, // West
    '10,11': false // South
  };

  const getCell = (c, r) => ({ col: c, row: r, materialId: 'acid' });
  const isMatch = (cell) => Boolean(mockGrid[`${cell?.col},${cell?.row}`]);

  const mask = MarchingSquaresAutoTiler.calculateBitmask4Bit(10, 10, getCell, isMatch);
  // North (1) + East (2) = 3
  assert.equal(mask, 3);
});

test('SemanticZoneMask - Sets flags, checks clearance and computes summaries', () => {
  const mask = new SemanticZoneMask(20, 20);

  mask.fillRect(2, 2, 8, 8, SemanticFlag.FLOOR);
  mask.fillRect(4, 4, 6, 6, SemanticFlag.HAZARD);
  mask.setFlag(2, 5, SemanticFlag.DOORWAY);

  assert.equal(mask.hasFlag(3, 3, SemanticFlag.FLOOR), true);
  assert.equal(mask.hasFlag(5, 5, SemanticFlag.HAZARD), true);
  assert.equal(mask.hasFlag(2, 5, SemanticFlag.DOORWAY), true);

  // Clearance check: footprint overlapping doorway should not be clear
  assert.equal(mask.isFootprintClear(2, 5, 2, 2), false);

  // Clearance check: empty region should be clear
  assert.equal(mask.isFootprintClear(10, 10, 2, 2), true);

  const summary = mask.getZoneSummary(0, 0, 19, 19);
  assert.ok(summary.floorCells > 0);
  assert.ok(summary.hazardCells > 0);
  assert.equal(summary.doorCells, 1);
});
