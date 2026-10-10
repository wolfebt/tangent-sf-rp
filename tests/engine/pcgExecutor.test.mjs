import test from 'node:test';
import assert from 'node:assert/strict';
import { SemanticZoneMask, SemanticFlag } from '../../src/engine/executor/SemanticZoneMask.ts';
import { CollisionClearanceTester } from '../../src/engine/executor/CollisionClearanceTester.ts';
import { MapContextAggregator } from '../../src/engine/ai/MapContextAggregator.ts';
import { PCGExecutor } from '../../src/engine/executor/PCGExecutor.ts';
import { PCGPromptAnalyzer } from '../../src/engine/executor/PCGPromptAnalyzer.ts';
const mockCatalog = [
  {
    unit_id: 'prop_holo_table_01',
    name: 'Tactical Holo-Table',
    category: 'doodad',
    tree_path: ['Props', 'Electronics', 'Terminals'],
    tags: ['electronics', 'cover_half', 'terminal', 'tactical'],
    dimensions: [2, 2],
    provenance: { source: 'preset', dateAdded: '2026-10-07' },
    visuals: { thumbnail: 'holo.webp', baseTexture: 'holo.webp', variants: [] },
    vtt_properties: {
      blocks_movement: true,
      blocks_vision: false,
      z_index_layer: 'interactive_objects'
    },
    scatter_rules: {
      allow_rotation: false,
      scale_variance: [1.0, 1.0],
      avoid_center: false,
      cluster_affinity: false,
      clearance_radius_cells: 1
    }
  },
  {
    unit_id: 'prop_cargo_crate_01',
    name: 'Reinforced Cargo Crate',
    category: 'doodad',
    tree_path: ['Props', 'Storage', 'Crates'],
    tags: ['cargo', 'cover_half', 'crate', 'industrial'],
    dimensions: [1, 1],
    provenance: { source: 'preset', dateAdded: '2026-10-07' },
    visuals: { thumbnail: 'crate.webp', baseTexture: 'crate.webp', variants: [] },
    vtt_properties: {
      blocks_movement: true,
      blocks_vision: true,
      z_index_layer: 'interactive_objects'
    },
    scatter_rules: {
      allow_rotation: true,
      scale_variance: [0.9, 1.1],
      avoid_center: true,
      cluster_affinity: true,
      clearance_radius_cells: 1
    }
  },
  {
    unit_id: 'haz_plasma_breach_01',
    name: 'Plasma Breach Anomaly',
    category: 'hazard',
    tree_path: ['Hazards', 'Plasma'],
    tags: ['plasma', 'hazard', 'energy', 'damage'],
    dimensions: [1, 1],
    provenance: { source: 'preset', dateAdded: '2026-10-07' },
    visuals: { thumbnail: 'plasma.webp', baseTexture: 'plasma.webp', variants: [] },
    vtt_properties: {
      blocks_movement: false,
      blocks_vision: false,
      z_index_layer: 'dynamic_fx',
      hazard: {
        hazardType: 'plasma_leak',
        damageFormula: '3d8 plasma',
        triggerTiming: 'on_enter'
      }
    }
  },
  {
    unit_id: 'wall_titanium_bulkhead',
    name: 'Titanium Blast Bulkhead',
    category: 'wall_portal',
    tree_path: ['Walls', 'Industrial'],
    tags: ['wall', 'bulkhead', 'solid', 'titanium'],
    dimensions: [1, 1],
    provenance: { source: 'preset', dateAdded: '2026-10-07' },
    visuals: { thumbnail: 'bulkhead.webp', baseTexture: 'bulkhead.webp', variants: [] },
    vtt_properties: {
      blocks_movement: true,
      blocks_vision: true,
      z_index_layer: 'interactive_objects'
    }
  }
];

test('MapContextAggregator - Aggregates rooms, zones, and doors into spatial prompt', () => {
  const mask = new SemanticZoneMask(20, 20);
  mask.fillRect(2, 2, 10, 10, SemanticFlag.FLOOR);
  mask.setFlag(6, 2, SemanticFlag.DOORWAY);
  mask.setFlag(4, 4, SemanticFlag.HAZARD);

  const context = MapContextAggregator.aggregate({
    width: 20,
    height: 20,
    theme: 'Cyber-Research Facility',
    rooms: [
      { id: 'room_med_lab', minCol: 2, minRow: 2, maxCol: 10, maxRow: 10, roomType: 'med_lab' }
    ],
    doors: [{ col: 6, row: 2, status: 'closed' }],
    mask
  });

  assert.equal(context.map_dimensions[0], 20);
  assert.equal(context.map_dimensions[1], 20);
  assert.equal(context.totalRooms, 1);
  assert.equal(context.rooms[0].id, 'room_med_lab');
  assert.equal(context.rooms[0].connectedDoors.length, 1);
  assert.equal(context.rooms[0].zoneSummary.hazardCells, 1);

  const prompt = MapContextAggregator.buildSpatialPrompt(context, 'Add medical gear and consoles.');
  assert.ok(prompt.includes('Cyber-Research Facility'));
  assert.ok(prompt.includes('room_med_lab'));

  const schema = MapContextAggregator.getStructuredResponseSchema();
  assert.ok(schema.properties.execute_scripts);
});

test('CollisionClearanceTester - Detects boundary, wall, doorway, and frozen conflicts', () => {
  const mask = new SemanticZoneMask(15, 15);
  mask.fillRect(0, 0, 14, 14, SemanticFlag.FLOOR);

  // Set wall at (5, 5)
  mask.setFlag(5, 5, SemanticFlag.WALL);
  // Set doorway at (8, 8)
  mask.setFlag(8, 8, SemanticFlag.DOORWAY);
  // Set frozen zone at (12, 12)
  mask.setFlag(12, 12, SemanticFlag.FROZEN);

  // Test out-of-bounds
  const oobTest = CollisionClearanceTester.testPlacement(mask, 14, 14, 2, 2);
  assert.equal(oobTest.allowed, false);
  assert.equal(oobTest.reason, 'Out of bounds');

  // Test wall collision
  const wallTest = CollisionClearanceTester.testPlacement(mask, 5, 5, 1, 1);
  assert.equal(wallTest.allowed, false);
  assert.ok(wallTest.reason?.includes('wall'));

  // Test frozen collision
  const frozenTest = CollisionClearanceTester.testPlacement(mask, 12, 12, 1, 1);
  assert.equal(frozenTest.allowed, false);
  assert.ok(frozenTest.reason?.includes('Frozen'));

  // Test doorway clearance radius buffer
  const nearDoorTest = CollisionClearanceTester.testPlacement(mask, 8, 7, 1, 1, {
    clearanceRadiusCells: 1
  });
  assert.equal(nearDoorTest.allowed, false, 'Should reject placement adjacent to doorway');
  assert.ok(nearDoorTest.reason?.includes('clearance radius'));

  // Test valid clear cell
  const validTest = CollisionClearanceTester.testPlacement(mask, 2, 2, 2, 2, {
    clearanceRadiusCells: 1
  });
  assert.equal(validTest.allowed, true);
});

test('CollisionClearanceTester - findValidPlacementCells finds available coordinates', () => {
  const mask = new SemanticZoneMask(10, 10);
  mask.fillRect(0, 0, 9, 9, SemanticFlag.FLOOR);
  mask.fillRect(0, 0, 4, 9, SemanticFlag.WALL); // Left half blocked

  const valid = CollisionClearanceTester.findValidPlacementCells(mask, [0, 0, 9, 9], 1, 1, {
    clearanceRadiusCells: 0
  });

  // Only right half [5..9] x [0..9] should be valid (5 * 10 = 50)
  assert.equal(valid.length, 50);
  assert.ok(valid.every(([c]) => c >= 5));
});

test('PCGExecutor - Executes place_central, scatter, place_hazard, and wall_perimeter', () => {
  const mask = new SemanticZoneMask(20, 20);
  mask.fillRect(1, 1, 18, 18, SemanticFlag.FLOOR);
  // Doorway at (10, 1)
  mask.setFlag(10, 1, SemanticFlag.DOORWAY);

  const executor = new PCGExecutor(1337);

  const report = executor.execute({
    scriptPayload: {
      atmosphere_lighting: {
        ambient_color: '#0a192f',
        weather: 'sparks'
      },
      execute_scripts: [
        {
          action: 'place_central',
          query_tags: ['terminal', 'tactical'],
          zone: [4, 4, 16, 16],
          clearance: 1
        },
        {
          action: 'scatter',
          query_tags: ['crate', 'cargo'],
          zone: [2, 2, 17, 17],
          density: 0.05,
          limit: 4,
          clearance: 1
        },
        {
          action: 'place_hazard',
          query_tags: ['plasma'],
          zone: [5, 5, 15, 15],
          limit: 2
        },
        {
          action: 'wall_perimeter',
          query_tags: ['bulkhead'],
          zone: [1, 1, 18, 18]
        }
      ]
    },
    catalog: mockCatalog,
    mask
  });

  assert.equal(report.success, true);
  assert.ok(report.totalPlaced >= 5, `Expected multiple entities placed, got ${report.totalPlaced}`);

  // Holo-table placed centrally
  const holo = report.placedEntities.find(e => e.unit_id === 'prop_holo_table_01');
  assert.ok(holo, 'Central holo table should be placed');
  assert.equal(holo.width, 2);
  assert.equal(holo.height, 2);

  // Crates placed
  const crates = report.placedEntities.filter(e => e.unit_id === 'prop_cargo_crate_01');
  assert.ok(crates.length >= 1, 'At least one crate should be placed');

  // Hazard placed
  const hazards = report.placedEntities.filter(e => e.isHazard);
  assert.ok(hazards.length >= 1, 'At least one hazard anomaly placed');

  // Walls placed along perimeter, but doorway at (10, 1) must remain open
  const wallAtDoor = report.placedEntities.find(e => e.col === 10 && e.row === 1 && e.category === 'wall_portal');
  assert.equal(wallAtDoor, undefined, 'Doorway threshold must not have a wall placed over it');

  assert.equal(report.atmosphere?.weather, 'sparks');
});

test('PCGPromptAnalyzer - Parses fine-grained prompt directives (amber lights, barricaded blast doors, carbon scoring)', () => {
  const prompt = 'barricaded blast doors, flickering amber warning lights, carbon scoring on bulkheads';
  const analysis = PCGPromptAnalyzer.analyze(prompt, [0, 0, 30, 20]);

  // Verify lights analysis
  assert.equal(analysis.detectedFeatures.lights.detected, true);
  assert.equal(analysis.detectedFeatures.lights.color, '#f59e0b');
  assert.equal(analysis.detectedFeatures.lights.colorName, 'amber warning');
  assert.equal(analysis.detectedFeatures.lights.animation, 'flicker');

  // Verify doors analysis
  assert.equal(analysis.detectedFeatures.doors.detected, true);
  assert.equal(analysis.detectedFeatures.doors.doorType, 'blast_door');
  assert.equal(analysis.detectedFeatures.doors.isBarricaded, true);
  assert.equal(analysis.detectedFeatures.doors.isLocked, true);

  // Verify carbon scoring analysis
  assert.equal(analysis.detectedFeatures.carbonScoring.detected, true);
  assert.equal(analysis.detectedFeatures.carbonScoring.decalType, 'carbon_scoring');

  // Verify compiled script actions
  const actions = analysis.payload.execute_scripts.map(s => s.action);
  assert.ok(actions.includes('inject_lights'), 'Should compile inject_lights action');
  assert.ok(actions.includes('barricade_doors'), 'Should compile barricade_doors action');
  assert.ok(actions.includes('scorch_bulkheads'), 'Should compile scorch_bulkheads action');
});

test('PCGExecutor.compileAndExecute - Injects contextual clutter, cover, barricaded doors, lights and bulkhead scorches', () => {
  const mask = new SemanticZoneMask(20, 20);
  // Fill room interior with walkable floor
  mask.fillRect(1, 1, 18, 18, SemanticFlag.FLOOR);
  // Set up perimeter walls
  for (let c = 0; c <= 19; c++) {
    mask.setFlag(c, 0, SemanticFlag.WALL);
    mask.setFlag(c, 19, SemanticFlag.WALL);
  }
  for (let r = 1; r < 19; r++) {
    mask.setFlag(0, r, SemanticFlag.WALL);
    mask.setFlag(19, r, SemanticFlag.WALL);
  }
  // Create an explicit doorway chokepoint at (10, 1)
  mask.setFlag(10, 1, SemanticFlag.DOORWAY);

  const executor = new PCGExecutor(42);
  const prompt = 'barricaded blast doors, flickering amber warning lights, carbon scoring on bulkheads';

  const report = executor.compileAndExecute({
    prompt,
    catalog: mockCatalog,
    mask,
    zone: [0, 0, 19, 19]
  });

  assert.equal(report.success, true);

  // 1. Verify lights injection
  assert.ok(report.lights.length > 0, 'Should have injected luminaries');
  assert.equal(report.lights[0].color, '#f59e0b');
  assert.equal(report.lights[0].animation, 'flicker');

  // 2. Verify barricaded blast doors
  assert.ok(report.doors.length > 0, 'Should have placed doors');
  const door = report.doors[0];
  assert.equal(door.doorType, 'blast_door');
  assert.equal(door.isBarricaded, true);
  assert.equal(door.isLocked, true);

  // 3. Verify bulkhead scorch marks
  assert.ok(report.bulkheadScorches.length > 0, 'Should have placed bulkhead scorch marks');
  assert.equal(report.bulkheadScorches[0].decalType, 'carbon_scoring');

  // 4. Verify placedEntities contains doors, lights, scorch decals, and tactical cover
  const placedDoors = report.placedEntities.filter(e => e.isDoor);
  assert.ok(placedDoors.length > 0, 'placedEntities should include doors');
  const placedLights = report.placedEntities.filter(e => e.isLight);
  assert.ok(placedLights.length > 0, 'placedEntities should include lights');
  const placedScorches = report.placedEntities.filter(e => e.isDecal);
  assert.ok(placedScorches.length > 0, 'placedEntities should include decal scorches');
  const placedCover = report.placedEntities.filter(e => e.isCover);
  assert.ok(placedCover.length > 0, 'placedEntities should include adjacent barricade cover');
});

test('PCGExecutor.applyToTacticalGrid - Mutates in-memory tactical grid matrix with doors, lights, and scorches', () => {
  // Create initial 10x10 empty tactical grid
  const initialGrid = Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => ({ isFloor: false }))
  );
  // Carve a 6x6 room in the middle
  for (let r = 2; r <= 7; r++) {
    for (let c = 2; c <= 7; c++) {
      initialGrid[r][c].isFloor = true;
    }
  }

  const mockReport = {
    success: true,
    totalPlaced: 3,
    placedEntities: [
      {
        id: 'prop_cover_1',
        unit_id: 'prop_cargo_crate_01',
        unit_name: 'Reinforced Cargo Crate',
        category: 'doodad',
        col: 4,
        row: 4,
        width: 1,
        height: 1,
        rotationDegrees: 0,
        scale: 1,
        zIndexLayer: 'interactive_objects',
        isCover: true
      }
    ],
    lights: [
      {
        col: 5,
        row: 5,
        color: '#f59e0b',
        animation: 'flicker',
        radius: 3.5,
        intensity: 0.85
      }
    ],
    doors: [
      {
        col: 2,
        row: 4,
        doorType: 'blast_door',
        isBarricaded: true,
        isLocked: true
      }
    ],
    bulkheadScorches: [
      {
        col: 1,
        row: 4,
        decalType: 'carbon_scoring'
      }
    ],
    logs: []
  };

  const nextGrid = PCGExecutor.applyToTacticalGrid(initialGrid, mockReport);

  // Door assertion
  assert.equal(nextGrid[4][2].isDoor, true);
  assert.equal(nextGrid[4][2].isBarricaded, true);
  assert.equal(nextGrid[4][2].doorType, 'bulkhead');

  // Light assertion
  assert.equal(nextGrid[5][5].isLight, true);
  assert.equal(nextGrid[5][5].lightColor, '#f59e0b');
  assert.equal(nextGrid[5][5].lightAnimation, 'flicker');

  // Scorch mark assertion
  assert.equal(nextGrid[4][1].isCarbonScoring, true);
  assert.equal(nextGrid[4][1].isBreach, true);

  // Tactical cover prop assertion
  assert.equal(nextGrid[4][4].isProp, true);
  assert.equal(nextGrid[4][4].propName, 'Reinforced Cargo Crate');
  assert.equal(nextGrid[4][4].propCategory, 'cover');
});
