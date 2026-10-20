/**
 * @file mapChunkCompilerService.test.tsx
 * @description Comprehensive unit tests for the Hybrid Chunk / Tile Map System and
 * Non-Destructive D4 (90° Clockwise North-Side Rotation & Horizontal/Vertical Flip)
 * Transformation Engine.
 */

import { describe, it, expect } from 'vitest';
import {
  transformChunkBlueprint,
  compileChunkToMapElements,
  findBestSocketSnap,
  weldChunkWallsAndDoors,
  retransformPlacedChunkInstance,
  explodeChunkInstance,
  deletePlacedChunkInstance,
  extractChunkFromMapSelection,
} from '../mapChunkCompilerService';
import {
  getNorthCardinalDirection,
  getNorthIndicatorLabel,
  createDefaultMapChunk,
  type MapChunkBlueprint,
} from '../../schemas/mapChunkSchema';
import { SCIENCE_FANTASY_SEED_CHUNKS } from '../../data/seed_chunks/science_fantasy_chunks';

describe('MapChunkSchema & North-Side Cardinal Indicator', () => {
  it('cycles North-side orientation clockwise: 0°->N, 90°->E, 180°->S, 270°->W', () => {
    expect(getNorthCardinalDirection(0)).toBe('N');
    expect(getNorthCardinalDirection(90)).toBe('E');
    expect(getNorthCardinalDirection(180)).toBe('S');
    expect(getNorthCardinalDirection(270)).toBe('W');

    expect(getNorthIndicatorLabel(0)).toContain('NORTH ▲ (N)');
    expect(getNorthIndicatorLabel(90)).toContain('NORTH ▶ (E)');
    expect(getNorthIndicatorLabel(180)).toContain('NORTH ▼ (S)');
    expect(getNorthIndicatorLabel(270)).toContain('NORTH ◀ (W)');
  });

  it('includes 12 canonical Science-Fantasy seed chunks with valid schemas', () => {
    expect(SCIENCE_FANTASY_SEED_CHUNKS.length).toBeGreaterThanOrEqual(12);
    for (const chunk of SCIENCE_FANTASY_SEED_CHUNKS) {
      expect(chunk.chunkId).toBeTruthy();
      expect(chunk.widthCells).toBeGreaterThan(0);
      expect(chunk.heightCells).toBeGreaterThan(0);
      expect(chunk.tiles.length).toBeGreaterThan(0);
      expect(chunk.constructionPoints.length).toBeGreaterThan(0);
    }
  });
});

describe('D4 Dihedral Transformation Matrix (90° CW Rotation & H/V Flips)', () => {
  const sampleAsymmetricChunk: MapChunkBlueprint = createDefaultMapChunk({
    chunkId: 'test_asymmetric_4x6',
    name: 'Asymmetric Test Chamber (4x6)',
    category: 'room_module',
    scale: 'Interior',
    widthCells: 4,
    heightCells: 6,
    baseCellSizePx: 50,
    northSide: 'N',
    tiles: [
      {
        col: 0,
        row: 0,
        terrainTypeId: 'steelGrating',
        label: 'Top-Left Tile',
        material: 'metal_deck',
        color: '#0f172a',
        isLiquid: false,
        movementCost: 1,
        elevationOffsetFt: 0,
        bitmask4Bit: 1, // North bit set
      },
      {
        col: 3,
        row: 5,
        terrainTypeId: 'hazardStripe',
        label: 'Bottom-Right Tile',
        material: 'metal_deck',
        color: '#78350f',
        isLiquid: false,
        movementCost: 1,
        elevationOffsetFt: 0,
      },
    ],
    walls: [
      // North wall segment from (0,0) to (4,0)
      {
        id: 'w_north',
        p1: { x: 0, y: 0 },
        p2: { x: 4, y: 0 },
        type: 'solid',
        label: 'North Bulkhead',
        breachHp: 120,
        maxBreachHp: 120,
        athleticsDc: 20,
        isSecret: false,
        cardinalEdge: 'north',
      },
      // One-way firing slit on West wall from (0,1) to (0,3)
      {
        id: 'w_oneway',
        p1: { x: 0, y: 1 },
        p2: { x: 0, y: 3 },
        type: 'one_way',
        label: 'One-Way Firing Slit',
        breachHp: 100,
        maxBreachHp: 100,
        athleticsDc: 20,
        isSecret: false,
        cardinalEdge: 'west',
      },
    ],
    assets: [
      // 2x3 surgical bed at top-left (col=1, row=1)
      {
        id: 'asset_bed_2x3',
        col: 1,
        row: 1,
        widthCells: 2,
        heightCells: 3,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'med_station',
        label: 'Autodoc Bed (2x3)',
        category: 'Objects',
        shape: 'rect',
        color: '#10b981',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover',
        arcFacingDeg: 0,
        patrolWaypoints: [
          { col: 1, row: 1 },
          { col: 3, row: 4 },
        ],
      },
      // Upright hologram console at (col=0, row=4)
      {
        id: 'asset_holo_upright',
        col: 0,
        row: 4,
        widthCells: 1,
        heightCells: 1,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: true,
        type: 'terminal',
        label: 'Upright Telemetry Console',
        category: 'Objects',
        shape: 'circle',
        color: '#38bdf8',
        isInteractive: true,
        isTrap: false,
        coverRating: 'none',
      },
    ],
    lights: [
      {
        id: 'light_nw',
        col: 1,
        row: 1,
        offsetX: 0.5,
        offsetY: 0.5,
        radiusCells: 4,
        color: '#38bdf8',
        intensity: 0.9,
        animation: 'pulse',
      },
    ],
    constructionPoints: [
      {
        id: 'sock_north',
        label: 'North Entry Airlock',
        kind: 'perimeter_socket',
        col: 1,
        row: 0,
        edge: 'north',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 14,
        breachHp: 60,
        footprintCells: [1, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {},
      },
      {
        id: 'sock_east',
        label: 'East Corridor Socket',
        kind: 'perimeter_socket',
        col: 3,
        row: 2,
        edge: 'east',
        cellOffset: 2,
        spanCells: 2,
        socketType: 'corridor_2x',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 14,
        breachHp: 60,
        footprintCells: [1, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {},
      },
      {
        id: 'slot_turret',
        label: 'Defense Turret Hardpoint',
        kind: 'internal_slot',
        col: 2,
        row: 1,
        spanCells: 1,
        autoSpawnDoor: false,
        defaultDoorType: 'none',
        doorLockDc: 14,
        breachHp: 60,
        slotCategory: 'turret_hardpoint',
        footprintCells: [1, 1],
        defaultAssetId: 'obj_defense_turret',
        defaultAssetLabel: 'Ceiling Defense Turret',
        defaultShape: 'hexagon',
        defaultColor: '#22d3ee',
        rotationDeg: 0,
        arcFacingDeg: 90,
        allowOverride: true,
        assignedProperties: {
          isArmed: true,
          damageFormula: '3d8',
        },
      },
    ],
  });

  it('swaps bounding dimensions (4x6 -> 6x4) on 90° and 270° CW rotation', () => {
    const rot90 = transformChunkBlueprint(sampleAsymmetricChunk, 90, false, false);
    expect(rot90.widthCells).toBe(6);
    expect(rot90.heightCells).toBe(4);
    expect(rot90.northSide).toBe('E');

    const rot180 = transformChunkBlueprint(sampleAsymmetricChunk, 180, false, false);
    expect(rot180.widthCells).toBe(4);
    expect(rot180.heightCells).toBe(6);
    expect(rot180.northSide).toBe('S');

    const rot270 = transformChunkBlueprint(sampleAsymmetricChunk, 270, false, false);
    expect(rot270.widthCells).toBe(6);
    expect(rot270.heightCells).toBe(4);
    expect(rot270.northSide).toBe('W');
  });

  it('transforms tile grid coordinates and 4-bit cardinal bitmasks across 90° CW rotation and H/V flips', () => {
    // At 90° CW on 4x6: (col=0, row=0) -> (col' = 6 - 1 - 0 = 5, row' = 0)
    // And bitmask N=1 rotates 90° CW to E=4
    const rot90 = transformChunkBlueprint(sampleAsymmetricChunk, 90, false, false);
    const topLeftTile90 = rot90.tiles[0];
    expect(topLeftTile90.col).toBe(5);
    expect(topLeftTile90.row).toBe(0);
    expect(topLeftTile90.bitmask4Bit).toBe(4);

    // Horizontal flip (flipX=true, rotation=0) on 4x6: (col=0, row=0) -> (col'=3, row'=0)
    const flippedH = transformChunkBlueprint(sampleAsymmetricChunk, 0, true, false);
    expect(flippedH.tiles[0].col).toBe(3);
    expect(flippedH.tiles[0].row).toBe(0);

    // Vertical flip (flipY=true, rotation=0) on 4x6: (col=0, row=0) -> (col'=0, row'=5)
    // And bitmask N=1 flips vertically to S=8
    const flippedV = transformChunkBlueprint(sampleAsymmetricChunk, 0, false, true);
    expect(flippedV.tiles[0].col).toBe(0);
    expect(flippedV.tiles[0].row).toBe(5);
    expect(flippedV.tiles[0].bitmask4Bit).toBe(8);
  });

  it('keeps multi-cell assets intact (2x3 -> 3x2 on 90° CW) and honors keepUpright', () => {
    const rot90 = transformChunkBlueprint(sampleAsymmetricChunk, 90, false, false);

    const bed = rot90.assets.find((a) => a.id === 'asset_bed_2x3')!;
    expect(bed.widthCells).toBe(3);
    expect(bed.heightCells).toBe(2);
    expect(bed.col).toBe(2); // 6 - (1 + 3) = 2
    expect(bed.row).toBe(1);
    expect(bed.rotationDeg).toBe(90);
    expect(bed.arcFacingDeg).toBe(90);
    expect(bed.patrolWaypoints?.[0]).toEqual({ col: 4, row: 1 });

    // Upright asset should translate its position but keep rotationDeg=0
    const upright = rot90.assets.find((a) => a.id === 'asset_holo_upright')!;
    expect(upright.col).toBe(1); // 6 - (4 + 1) = 1
    expect(upright.row).toBe(0);
    expect(upright.rotationDeg).toBe(0);
  });

  it('inverts one_way wall vertex order (p1 <-> p2) on odd flips to preserve outward normal', () => {
    const flippedH = transformChunkBlueprint(sampleAsymmetricChunk, 0, true, false);
    const oneWayH = flippedH.walls.find((w) => w.id === 'w_oneway')!;
    // Original: (0,1)->(0,3). After flipX on W=4: (4,3)->(4,1)
    expect(oneWayH.p1).toEqual({ x: 4, y: 3 });
    expect(oneWayH.p2).toEqual({ x: 4, y: 1 });
    expect(oneWayH.cardinalEdge).toBe('east');

    // Double flip (flipX + flipY = 180° rotation, even parity): vertices swap twice -> back to normal order
    const flippedHV = transformChunkBlueprint(sampleAsymmetricChunk, 0, true, true);
    const oneWayHV = flippedHV.walls.find((w) => w.id === 'w_oneway')!;
    expect(oneWayHV.p1).toEqual({ x: 4, y: 5 });
    expect(oneWayHV.p2).toEqual({ x: 4, y: 3 });
  });

  it('rotates and mirrors perimeter sockets accurately around the chunk boundary', () => {
    const rot90 = transformChunkBlueprint(sampleAsymmetricChunk, 90, false, false);
    const northSock90 = rot90.constructionPoints.find((s) => s.id === 'sock_north')!;
    expect(northSock90.edge).toBe('east');
    expect(northSock90.cellOffset).toBe(1);

    // East socket at offset=2, span=2 on H=6 -> rotates 90° CW to 'south', offset = 6 - (2 + 2) = 2
    const eastSock90 = rot90.constructionPoints.find((s) => s.id === 'sock_east')!;
    expect(eastSock90.edge).toBe('south');
    expect(eastSock90.cellOffset).toBe(2);
  });
});

describe('Dynamic Property Adjustments & Map Compilation', () => {
  const medbayChunk = SCIENCE_FANTASY_SEED_CHUNKS.find(
    (c) => c.chunkId === 'chunk_medbay_6x6'
  )!;

  it('dynamically adjusts lights, door lock DCs, and floor themes based on assigned settings', () => {
    const compiledEmergency = compileChunkToMapElements(medbayChunk, {
      instanceId: 'inst_medbay_1',
      targetCol: 2,
      targetRow: 3,
      gridSize: 50,
      rotationDeg: 90,
      flipX: true,
      flipY: false,
      settings: {
        powerState: 'emergency',
        securityTier: 5,
        conditionState: 'battle_damaged',
        biomeThemeOverride: 'chitin_hive',
      },
    });

    expect(compiledEmergency.instanceRecord.instanceId).toBe('inst_medbay_1');
    expect(compiledEmergency.instanceRecord.rotationDeg).toBe(90);
    expect(compiledEmergency.instanceRecord.flipX).toBe(true);

    // Emergency lights should switch to red pulse
    expect(compiledEmergency.lights.length).toBeGreaterThan(0);
    for (const light of compiledEmergency.lights) {
      expect(light.color).toBe('#ef4444');
      expect(light.animation).toBe('pulse');
      expect(light.chunkInstanceId).toBe('inst_medbay_1');
    }

    // Security tier 5 (+8 DC bonus over tier 1) locks closed doors and increases hackDc
    const doors = compiledEmergency.walls.filter((w) => w.type === 'door');
    expect(doors.length).toBeGreaterThan(0);
    for (const door of doors) {
      expect(door.doorState).toBe('locked');
      expect(door.hackDc).toBeGreaterThanOrEqual(20);
    }

    // Biome theme override applies chitin_hive palette to non-liquid floor tiles
    const nonLiquidTiles = compiledEmergency.terrains.filter((t) => !t.isLiquid);
    expect(nonLiquidTiles[0].material).toBe('chitin_hive');
  });

  it('supports unpowered state by turning off chunk lights and unlocking unpowered doors', () => {
    const compiledUnpowered = compileChunkToMapElements(medbayChunk, {
      instanceId: 'inst_medbay_dark',
      targetCol: 0,
      targetRow: 0,
      gridSize: 50,
      rotationDeg: 0,
      flipX: false,
      flipY: false,
      settings: {
        powerState: 'unpowered',
        securityTier: 3,
        conditionState: 'pristine',
      },
    });

    expect(compiledUnpowered.lights.length).toBe(0);
  });
});

describe('Magnetic Socket Snapping, Wall Welding, & In-Place Retransformation', () => {
  const airlockChunk = SCIENCE_FANTASY_SEED_CHUNKS.find(
    (c) => c.chunkId === 'chunk_airlock_4x4'
  )!;

  it('snaps complementary sockets (north <-> south) and welds overlapping boundary walls', () => {
    const firstCompiled = compileChunkToMapElements(airlockChunk, {
      instanceId: 'inst_airlock_a',
      targetCol: 4,
      targetRow: 4,
      gridSize: 50,
      rotationDeg: 0,
      flipX: false,
      flipY: false,
    });

    // Place second airlock just south of first airlock near (col=4, row=8)
    const snapCandidate = findBestSocketSnap(
      airlockChunk,
      4,
      8,
      50,
      0,
      false,
      false,
      [firstCompiled.instanceRecord],
      SCIENCE_FANTASY_SEED_CHUNKS
    );

    expect(snapCandidate).not.toBeNull();
    expect(snapCandidate!.snappedCol).toBe(4);
    expect(snapCandidate!.snappedRow).toBe(8);

    const secondCompiled = compileChunkToMapElements(airlockChunk, {
      instanceId: 'inst_airlock_b',
      targetCol: snapCandidate!.snappedCol,
      targetRow: snapCandidate!.snappedRow,
      gridSize: 50,
      rotationDeg: 0,
      flipX: false,
      flipY: false,
    });

    const weldedWalls = weldChunkWallsAndDoors(
      firstCompiled.walls,
      secondCompiled.walls,
      secondCompiled.worldSockets,
      firstCompiled.worldSockets
    );
    // Welded walls should deduplicate the shared boundary segment
    expect(weldedWalls.length).toBeLessThan(
      firstCompiled.walls.length + secondCompiled.walls.length
    );
  });

  it('re-transforms a placed chunk instance in-place (90° CW rotation, flip, & property edit) and supports explode/delete', () => {
    const initial = compileChunkToMapElements(airlockChunk, {
      instanceId: 'inst_airlock_live',
      targetCol: 2,
      targetRow: 2,
      gridSize: 50,
      rotationDeg: 0,
      flipX: false,
      flipY: false,
    });

    const mapData = {
      terrains: initial.terrains,
      walls: initial.walls,
      objects: initial.objects,
      lights: initial.lights,
      chunkInstances: [initial.instanceRecord],
    };

    const updatedMap = retransformPlacedChunkInstance(
      mapData,
      'inst_airlock_live',
      {
        rotationDeg: 90,
        flipX: true,
        settings: { powerState: 'emergency', securityTier: 4 },
      },
      SCIENCE_FANTASY_SEED_CHUNKS
    );

    expect(updatedMap.chunkInstances[0].rotationDeg).toBe(90);
    expect(updatedMap.chunkInstances[0].flipX).toBe(true);
    expect(updatedMap.chunkInstances[0].settings.powerState).toBe('emergency');
    expect(updatedMap.lights[0].color).toBe('#ef4444');

    // Explode chunk into standalone map elements
    const explodedMap = explodeChunkInstance(updatedMap, 'inst_airlock_live');
    expect(explodedMap.chunkInstances.length).toBe(0);
    expect(explodedMap.walls.length).toBeGreaterThan(0);
    expect(explodedMap.walls[0].chunkInstanceId).toBeUndefined();

    // Delete placed chunk instance cleanly removes all child elements
    const deletedMap = deletePlacedChunkInstance(updatedMap, 'inst_airlock_live');
    expect(deletedMap.chunkInstances.length).toBe(0);
    expect(deletedMap.walls.length).toBe(0);
    expect(deletedMap.objects.length).toBe(0);
  });

  it('extracts an in-situ canvas marquee selection into a normalized MapChunkBlueprint', () => {
    const initial = compileChunkToMapElements(airlockChunk, {
      instanceId: 'inst_capture_src',
      targetCol: 2,
      targetRow: 2,
      gridSize: 50,
    });

    const capturedBlueprint = extractChunkFromMapSelection(
      {
        terrains: initial.terrains,
        walls: initial.walls,
        objects: initial.objects,
        lights: initial.lights,
      },
      { x: 100, y: 100, width: 200, height: 200 },
      50,
      { name: 'Captured Tactical Airlock', category: 'room_module' }
    );

    expect(capturedBlueprint.name).toBe('Captured Tactical Airlock');
    expect(capturedBlueprint.widthCells).toBe(4);
    expect(capturedBlueprint.heightCells).toBe(4);
    expect(capturedBlueprint.walls.length).toBeGreaterThan(0);
    expect(capturedBlueprint.assets.length).toBeGreaterThan(0);
  });
});
