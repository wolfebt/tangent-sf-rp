/**
 * @file science_fantasy_chunks.ts
 * @description Built-in Science-Fantasy Map Chunk Blueprints for Tangent SF RP.
 * Includes 12 modular prefabs with pre-grouped tiles, walls, doors, dynamic lights,
 * Perimeter Snap Sockets, Internal Construction Points (Hardpoints/Slots), and
 * Adjustable Assigned Properties.
 */

import {
  type MapChunkBlueprint,
  type ChunkTileCell,
  type ChunkWallSegment,
  createDefaultMapChunk
} from '../../schemas/mapChunkSchema';
import { renderChunkThumbnailDataUrl } from '../../services/mapChunkCompilerService';

/**
 * Helper to generate a filled WxH grid of floor tiles
 */
function makeRectTiles(
  widthCells: number,
  heightCells: number,
  terrainTypeId = 'steelGrating',
  label = 'Steel Grating',
  material = 'metal_deck',
  color = '#334155',
  overrideFn?: (col: number, row: number) => Partial<ChunkTileCell>
): ChunkTileCell[] {
  const tiles: ChunkTileCell[] = [];
  for (let r = 0; r < heightCells; r++) {
    for (let c = 0; c < widthCells; c++) {
      const overrides = overrideFn ? overrideFn(c, r) : {};
      tiles.push({
        col: c,
        row: r,
        terrainTypeId,
        label,
        material,
        color,
        isLiquid: false,
        movementCost: 1,
        elevationOffsetFt: 0,
        ...overrides
      });
    }
  }
  return tiles;
}

/**
 * Helper to generate perimeter walls around a WxH chunk with optional socket openings
 */
function makePerimeterWalls(
  W: number,
  H: number,
  openings: {
    edge: 'north' | 'east' | 'south' | 'west';
    offset: number;
    span: number;
    type?: 'door' | 'window' | 'open';
    label?: string;
    hackDc?: number;
  }[] = []
): ChunkWallSegment[] {
  const walls: ChunkWallSegment[] = [];
  let idx = 1;

  const buildEdge = (
    edge: 'north' | 'east' | 'south' | 'west',
    totalLen: number,
    coordFn: (pos: number) => { x: number; y: number }
  ) => {
    const edgeOpenings = openings
      .filter((o) => o.edge === edge)
      .sort((a, b) => a.offset - b.offset);

    let cursor = 0;
    for (const op of edgeOpenings) {
      if (op.offset > cursor) {
        walls.push({
          id: `w_${edge}_${idx++}`,
          p1: coordFn(cursor),
          p2: coordFn(op.offset),
          type: 'solid',
          label: 'Bulkhead Wall',
          breachHp: 120,
          maxBreachHp: 120,
          athleticsDc: 22,
          isSecret: false,
          cardinalEdge: edge
        });
      }
      if (op.type && op.type !== 'open') {
        walls.push({
          id: `w_${edge}_portal_${idx++}`,
          p1: coordFn(op.offset),
          p2: coordFn(op.offset + op.span),
          type: op.type,
          doorState: op.type === 'door' ? 'closed' : null,
          label: op.label || (op.type === 'door' ? 'Bulkhead Door' : 'Armored Viewport'),
          breachHp: 60,
          maxBreachHp: 60,
          hackDc: op.hackDc || 14,
          athleticsDc: 18,
          isSecret: false,
          cardinalEdge: edge
        });
      }
      cursor = op.offset + op.span;
    }
    if (cursor < totalLen) {
      walls.push({
        id: `w_${edge}_${idx++}`,
        p1: coordFn(cursor),
        p2: coordFn(totalLen),
        type: 'solid',
        label: 'Bulkhead Wall',
        breachHp: 120,
        maxBreachHp: 120,
        athleticsDc: 22,
        isSecret: false,
        cardinalEdge: edge
      });
    }
  };

  buildEdge('north', W, (pos) => ({ x: pos, y: 0 }));
  buildEdge('east', H, (pos) => ({ x: W, y: pos }));
  buildEdge('south', W, (pos) => ({ x: pos, y: H }));
  buildEdge('west', H, (pos) => ({ x: 0, y: pos }));

  return walls;
}

const RAW_SEED_CHUNKS: MapChunkBlueprint[] = [
  // 1. Airlock Decontamination Chamber (4x4)
  createDefaultMapChunk({
    chunkId: 'chunk_airlock_4x4',
    name: 'Airlock Decontamination Chamber',
    description:
      'Pressurized 4x4 airlock module with dual North/South docking seals, suit lockers, and an override terminal slot.',
    category: 'starship_compartment',
    scale: 'Interior',
    widthCells: 4,
    heightCells: 4,
    northSide: 'N',
    tiles: makeRectTiles(4, 4, 'airlockFloor', 'Airlock Grating', 'metal_deck', '#1e293b', (c, r) =>
      (c === 1 || c === 2) && (r === 1 || r === 2)
        ? { color: '#0f172a', label: 'Decon Drain Grate' }
        : {}
    ),
    walls: makePerimeterWalls(4, 4, [
      { edge: 'north', offset: 1, span: 2, type: 'door', label: 'Outer Airlock Seal', hackDc: 16 },
      { edge: 'south', offset: 1, span: 2, type: 'door', label: 'Inner Bulkhead Seal', hackDc: 14 }
    ]),
    assets: [
      {
        id: 'eva_locker_west',
        col: 0,
        row: 1,
        widthCells: 1,
        heightCells: 2,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 90,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'crate',
        label: 'EVA Suit Rack',
        category: 'Objects',
        shape: 'rect',
        color: '#38bdf8',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      }
    ],
    lights: [
      {
        id: 'airlock_beacon',
        col: 1,
        row: 1,
        offsetX: 1.0,
        offsetY: 1.0,
        radiusCells: 3.5,
        color: '#38bdf8',
        intensity: 0.9,
        animation: 'pulse',
        label: 'Cycle Status Beacon'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_north_airlock',
        label: 'North Docking Seal',
        kind: 'perimeter_socket',
        col: 1,
        row: 0,
        edge: 'north',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'airlock',
        autoSpawnDoor: true,
        defaultDoorType: 'airlock',
        doorLockDc: 16,
        breachHp: 80,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { isLocked: true, hackDc: 16, breachHp: 80 }
      },
      {
        id: 'sock_south_airlock',
        label: 'South Inner Seal',
        kind: 'perimeter_socket',
        col: 1,
        row: 3,
        edge: 'south',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'airlock',
        autoSpawnDoor: true,
        defaultDoorType: 'airlock',
        doorLockDc: 14,
        breachHp: 80,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: { isLocked: false, hackDc: 14, breachHp: 80 }
      },
      {
        id: 'slot_decon_terminal',
        label: 'Purge Control Terminal',
        kind: 'internal_slot',
        col: 3,
        row: 1,
        slotCategory: 'terminal_node',
        footprintCells: [1, 1],
        defaultAssetId: 'terminal',
        defaultAssetLabel: 'Decon Control Console',
        defaultShape: 'rect',
        defaultColor: '#22d3ee',
        rotationDeg: 270,
        allowOverride: true,
        assignedProperties: {
          isLocked: true,
          hackDc: 15,
          coverRating: 'quarter_cover'
        }
      },
      {
        id: 'slot_decon_nozzle',
        label: 'Bio-Cleanse Emitter',
        kind: 'internal_slot',
        col: 3,
        row: 2,
        slotCategory: 'hazard_emitter',
        footprintCells: [1, 1],
        defaultAssetId: 'vent',
        defaultAssetLabel: 'Plasma Purge Nozzle',
        defaultShape: 'circle',
        defaultColor: '#f43f5e',
        rotationDeg: 270,
        allowOverride: true,
        assignedProperties: {
          isArmed: true,
          disarmDc: 15,
          damageFormula: '2d6 fire',
          saveDc: 14
        }
      }
    ],
    tags: ['airlock', 'starship', 'entry', 'decon']
  }),

  // 2. Modular Corridor Straight (2x4)
  createDefaultMapChunk({
    chunkId: 'chunk_corridor_straight_2x4',
    name: 'Modular Corridor Straight (2x4)',
    description:
      'Standard 2-cell wide, 4-cell long armored ship/station corridor with North and South 2-cell snap sockets.',
    category: 'corridor_junction',
    scale: 'Interior',
    widthCells: 2,
    heightCells: 4,
    northSide: 'N',
    tiles: makeRectTiles(2, 4, 'steelGrating', 'Corridor Decking', 'metal_deck', '#334155'),
    walls: makePerimeterWalls(2, 4, [
      { edge: 'north', offset: 0, span: 2, type: 'open' },
      { edge: 'south', offset: 0, span: 2, type: 'open' }
    ]),
    assets: [],
    lights: [
      {
        id: 'corridor_strip_light',
        col: 0,
        row: 1,
        offsetX: 1.0,
        offsetY: 1.0,
        radiusCells: 3.0,
        color: '#38bdf8',
        intensity: 0.75,
        animation: 'steady',
        label: 'Overhead Luminaire'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_north_corr',
        label: 'North Corridor Aperture',
        kind: 'perimeter_socket',
        col: 0,
        row: 0,
        edge: 'north',
        cellOffset: 0,
        spanCells: 2,
        socketType: 'corridor_2x',
        autoSpawnDoor: true,
        defaultDoorType: 'none',
        doorLockDc: 12,
        breachHp: 50,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#10b981',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'sock_south_corr',
        label: 'South Corridor Aperture',
        kind: 'perimeter_socket',
        col: 0,
        row: 3,
        edge: 'south',
        cellOffset: 0,
        spanCells: 2,
        socketType: 'corridor_2x',
        autoSpawnDoor: true,
        defaultDoorType: 'none',
        doorLockDc: 12,
        breachHp: 50,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#10b981',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: {}
      }
    ],
    tags: ['corridor', 'hallway', 'modular']
  }),

  // 3. Modular Corridor T-Junction (4x4)
  createDefaultMapChunk({
    chunkId: 'chunk_corridor_tjunc_4x4',
    name: 'Modular Corridor T-Junction (4x4)',
    description:
      'Three-way corridor junction (North, East, South sockets) with a ceiling defense turret hardpoint.',
    category: 'corridor_junction',
    scale: 'Interior',
    widthCells: 4,
    heightCells: 4,
    northSide: 'N',
    tiles: makeRectTiles(4, 4, 'steelGrating', 'Junction Decking', 'metal_deck', '#334155'),
    walls: makePerimeterWalls(4, 4, [
      { edge: 'north', offset: 1, span: 2, type: 'open' },
      { edge: 'east', offset: 1, span: 2, type: 'open' },
      { edge: 'south', offset: 1, span: 2, type: 'open' }
    ]),
    assets: [],
    lights: [
      {
        id: 'tjunc_light',
        col: 1,
        row: 1,
        offsetX: 1.0,
        offsetY: 1.0,
        radiusCells: 4.0,
        color: '#38bdf8',
        intensity: 0.85,
        animation: 'steady',
        label: 'Junction Hub Light'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_n',
        label: 'North Branch Socket',
        kind: 'perimeter_socket',
        col: 1,
        row: 0,
        edge: 'north',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'corridor_2x',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 13,
        breachHp: 60,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#10b981',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'sock_e',
        label: 'East Branch Socket',
        kind: 'perimeter_socket',
        col: 3,
        row: 1,
        edge: 'east',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'corridor_2x',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 13,
        breachHp: 60,
        footprintCells: [1, 2],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#10b981',
        rotationDeg: 90,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'sock_s',
        label: 'South Branch Socket',
        kind: 'perimeter_socket',
        col: 1,
        row: 3,
        edge: 'south',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'corridor_2x',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 13,
        breachHp: 60,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#10b981',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'slot_ceiling_turret',
        label: 'Ceiling Defense Mount',
        kind: 'internal_slot',
        col: 1,
        row: 1,
        slotCategory: 'turret_hardpoint',
        footprintCells: [1, 1],
        defaultAssetId: 'turret',
        defaultAssetLabel: 'Automated Point-Defense Turret',
        defaultShape: 'hexagon',
        defaultColor: '#f43f5e',
        rotationDeg: 90,
        arcFacingDeg: 90,
        allowOverride: true,
        assignedProperties: {
          isArmed: true,
          hackDc: 15,
          breachHp: 45,
          factionDesignation: 'Adversary'
        }
      }
    ],
    tags: ['corridor', 'junction', 'turret']
  }),

  // 4. Modular Corridor 4-Way Crossroads (4x4)
  createDefaultMapChunk({
    chunkId: 'chunk_corridor_cross_4x4',
    name: 'Modular Corridor 4-Way Crossroads (4x4)',
    description:
      'Four-way security hub with N/E/S/W bulkhead sockets and a central security holoprojector slot.',
    category: 'corridor_junction',
    scale: 'Interior',
    widthCells: 4,
    heightCells: 4,
    northSide: 'N',
    tiles: makeRectTiles(4, 4, 'steelGrating', 'Crossroads Decking', 'metal_deck', '#334155', (c, r) =>
      (c === 1 || c === 2) && (r === 1 || r === 2) ? { color: '#1e293b' } : {}
    ),
    walls: makePerimeterWalls(4, 4, [
      { edge: 'north', offset: 1, span: 2, type: 'door', label: 'North Sector Gate' },
      { edge: 'east', offset: 1, span: 2, type: 'door', label: 'East Sector Gate' },
      { edge: 'south', offset: 1, span: 2, type: 'door', label: 'South Sector Gate' },
      { edge: 'west', offset: 1, span: 2, type: 'door', label: 'West Sector Gate' }
    ]),
    assets: [],
    lights: [
      {
        id: 'cross_hub_light',
        col: 1,
        row: 1,
        offsetX: 1.0,
        offsetY: 1.0,
        radiusCells: 4.5,
        color: '#22d3ee',
        intensity: 0.95,
        animation: 'steady',
        label: 'Central Hub Hololight'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_n',
        label: 'North Gate Socket',
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
        breachHp: 65,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'sock_e',
        label: 'East Gate Socket',
        kind: 'perimeter_socket',
        col: 3,
        row: 1,
        edge: 'east',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 14,
        breachHp: 65,
        footprintCells: [1, 2],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 90,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'sock_s',
        label: 'South Gate Socket',
        kind: 'perimeter_socket',
        col: 1,
        row: 3,
        edge: 'south',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 14,
        breachHp: 65,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'sock_w',
        label: 'West Gate Socket',
        kind: 'perimeter_socket',
        col: 0,
        row: 1,
        edge: 'west',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 14,
        breachHp: 65,
        footprintCells: [1, 2],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 270,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'slot_hub_pylon',
        label: 'Central Security Pylon',
        kind: 'internal_slot',
        col: 1,
        row: 1,
        slotCategory: 'terminal_node',
        footprintCells: [2, 2],
        defaultAssetId: 'holotable',
        defaultAssetLabel: 'Sector Waypoint Holotable',
        defaultShape: 'circle',
        defaultColor: '#38bdf8',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {
          coverRating: 'half_cover',
          hackDc: 14
        }
      }
    ],
    tags: ['corridor', 'crossroads', 'hub']
  }),

  // 5. Medbay & Auto-Doc Suite (6x6)
  createDefaultMapChunk({
    chunkId: 'chunk_medbay_6x6',
    name: 'Medbay & Auto-Doc Suite (6x6)',
    description:
      'Sterile 6x6 medical bay with surgical auto-doc pods, quarantine observation glass, and medical supply cache slots.',
    category: 'room_module',
    scale: 'Interior',
    widthCells: 6,
    heightCells: 6,
    northSide: 'N',
    tiles: makeRectTiles(6, 6, 'ceramicTile', 'Sterile Med-Tile', 'ceramic_tile', '#0f172a', (c, r) =>
      c >= 1 && c <= 4 && r >= 1 && r <= 4
        ? { color: '#164e63', label: 'Surgical Bio-Clean Floor' }
        : {}
    ),
    walls: makePerimeterWalls(6, 6, [
      { edge: 'north', offset: 2, span: 2, type: 'door', label: 'Medbay Quarantine Door', hackDc: 15 },
      { edge: 'west', offset: 2, span: 2, type: 'window', label: 'Observation Glass' }
    ]),
    assets: [
      {
        id: 'autodoc_pod_1',
        col: 1,
        row: 1,
        widthCells: 1,
        heightCells: 2,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'stasisPod',
        label: 'Surgical Auto-Doc Alpha',
        category: 'Objects',
        shape: 'rect',
        color: '#22d3ee',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      },
      {
        id: 'autodoc_pod_2',
        col: 4,
        row: 1,
        widthCells: 1,
        heightCells: 2,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'stasisPod',
        label: 'Surgical Auto-Doc Beta',
        category: 'Objects',
        shape: 'rect',
        color: '#22d3ee',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      }
    ],
    lights: [
      {
        id: 'surgical_lamp',
        col: 2,
        row: 2,
        offsetX: 1.0,
        offsetY: 1.0,
        radiusCells: 4.5,
        color: '#ecfeff',
        intensity: 1.0,
        animation: 'steady',
        label: 'Surgical Floodlight'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_medbay_north',
        label: 'North Quarantine Entry',
        kind: 'perimeter_socket',
        col: 2,
        row: 0,
        edge: 'north',
        cellOffset: 2,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 15,
        breachHp: 60,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#38bdf8',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { isLocked: false, hackDc: 15 }
      },
      {
        id: 'slot_med_terminal',
        label: 'Chief Medical Officer Console',
        kind: 'internal_slot',
        col: 2,
        row: 4,
        slotCategory: 'terminal_node',
        footprintCells: [2, 1],
        defaultAssetId: 'terminal',
        defaultAssetLabel: 'Bio-Diagnostics Mainframe',
        defaultShape: 'rect',
        defaultColor: '#38bdf8',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { hackDc: 14, coverRating: 'half_cover' }
      },
      {
        id: 'slot_med_cache',
        label: 'Narcotics & Stim Vault',
        kind: 'internal_slot',
        col: 4,
        row: 4,
        slotCategory: 'loot_cache',
        footprintCells: [1, 1],
        defaultAssetId: 'crate',
        defaultAssetLabel: 'Locked Med-Supply Locker',
        defaultShape: 'rect',
        defaultColor: '#10b981',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { isLocked: true, hackDc: 16, lootTableId: 'medbay_tier2' }
      }
    ],
    tags: ['medbay', 'medical', 'room', 'hospital']
  }),

  // 6. Plasma Reactor Core Chamber (8x8)
  createDefaultMapChunk({
    chunkId: 'chunk_reactor_core_8x8',
    name: 'Plasma Reactor Core Chamber (8x8)',
    description:
      'High-energy 8x8 engineering chamber featuring a central 2x2 fusion core, coolant trenches, catwalks, and overload vents.',
    category: 'hazard_setpiece',
    scale: 'Interior',
    widthCells: 8,
    heightCells: 8,
    northSide: 'N',
    tiles: makeRectTiles(8, 8, 'steelGrating', 'Catwalk Grating', 'metal_deck', '#334155', (c, r) => {
      if ((c === 1 || c === 6) && r >= 1 && r <= 6) {
        return {
          terrainTypeId: 'acidPool',
          label: 'Plasma Coolant Trench',
          color: '#0284c7',
          isLiquid: true,
          liquidType: 'water',
          hazardType: 'radiation_coolant',
          movementCost: 2
        };
      }
      if (c >= 3 && c <= 4 && r >= 3 && r <= 4) {
        return {
          color: '#0f172a',
          label: 'Core Containment Plinth'
        };
      }
      return {};
    }),
    walls: makePerimeterWalls(8, 8, [
      { edge: 'north', offset: 3, span: 2, type: 'door', label: 'North Engineering Blast Door', hackDc: 16 },
      { edge: 'south', offset: 3, span: 2, type: 'door', label: 'South Engineering Blast Door', hackDc: 16 }
    ]),
    assets: [
      {
        id: 'fusion_core_torus',
        col: 3,
        row: 3,
        widthCells: 2,
        heightCells: 2,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: true,
        type: 'generator',
        label: 'Tokamak Fusion Reactor Core',
        category: 'Objects',
        shape: 'circle',
        color: '#38bdf8',
        hazard: 'Extreme Radiation / Overload Risk',
        isInteractive: true,
        isTrap: false,
        coverRating: 'full_cover'
      }
    ],
    lights: [
      {
        id: 'reactor_core_glow',
        col: 3,
        row: 3,
        offsetX: 1.0,
        offsetY: 1.0,
        radiusCells: 6.5,
        color: '#38bdf8',
        intensity: 1.3,
        animation: 'pulse',
        label: 'Cherenkov Core Radiation'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_reactor_n',
        label: 'North Blast Door Socket',
        kind: 'perimeter_socket',
        col: 3,
        row: 0,
        edge: 'north',
        cellOffset: 3,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 16,
        breachHp: 100,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { breachHp: 100, hackDc: 16 }
      },
      {
        id: 'sock_reactor_s',
        label: 'South Blast Door Socket',
        kind: 'perimeter_socket',
        col: 3,
        row: 7,
        edge: 'south',
        cellOffset: 3,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 16,
        breachHp: 100,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: { breachHp: 100, hackDc: 16 }
      },
      {
        id: 'slot_scram_console',
        label: 'SCRAM Control Station',
        kind: 'internal_slot',
        col: 3,
        row: 1,
        slotCategory: 'terminal_node',
        footprintCells: [2, 1],
        defaultAssetId: 'terminal',
        defaultAssetLabel: 'Reactor SCRAM Console',
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: { hackDc: 17, coverRating: 'half_cover' }
      },
      {
        id: 'slot_plasma_vent_nw',
        label: 'NW Thermal Exhaust Vent',
        kind: 'internal_slot',
        col: 2,
        row: 2,
        slotCategory: 'hazard_emitter',
        footprintCells: [1, 1],
        defaultAssetId: 'vent',
        defaultAssetLabel: 'Superheated Plasma Vent',
        defaultShape: 'hexagon',
        defaultColor: '#ef4444',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {
          isArmed: true,
          damageFormula: '3d6 fire',
          saveDc: 15
        }
      },
      {
        id: 'slot_plasma_vent_se',
        label: 'SE Thermal Exhaust Vent',
        kind: 'internal_slot',
        col: 5,
        row: 5,
        slotCategory: 'hazard_emitter',
        footprintCells: [1, 1],
        defaultAssetId: 'vent',
        defaultAssetLabel: 'Superheated Plasma Vent',
        defaultShape: 'hexagon',
        defaultColor: '#ef4444',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: {
          isArmed: true,
          damageFormula: '3d6 fire',
          saveDc: 15
        }
      }
    ],
    tags: ['reactor', 'engineering', 'hazard', 'power']
  }),

  // 7. Security Checkpoint & Armory (6x4)
  createDefaultMapChunk({
    chunkId: 'chunk_security_armory_6x4',
    name: 'Security Checkpoint & Armory (6x4)',
    description:
      'Fortified 6x4 security station with one-way firing glass, weapon racks, and automated turret hardpoints.',
    category: 'room_module',
    scale: 'Interior',
    widthCells: 6,
    heightCells: 4,
    northSide: 'N',
    tiles: makeRectTiles(6, 4, 'steelGrating', 'Armory Deck', 'metal_deck', '#1e293b'),
    walls: [
      ...makePerimeterWalls(6, 4, [
        { edge: 'north', offset: 2, span: 2, type: 'window', label: 'Ballistic Firing Glass' },
        { edge: 'east', offset: 1, span: 2, type: 'door', label: 'Armory Vault Door', hackDc: 18 }
      ]),
      {
        id: 'w_internal_oneway',
        p1: { x: 0, y: 1 },
        p2: { x: 4, y: 1 },
        type: 'one_way',
        label: 'One-Way Smart Mirror Partition',
        breachHp: 90,
        maxBreachHp: 90,
        athleticsDc: 20,
        isSecret: false
      }
    ],
    assets: [
      {
        id: 'weapon_rack_1',
        col: 0,
        row: 2,
        widthCells: 1,
        heightCells: 2,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 90,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'crate',
        label: 'Heavy Carbine Rack',
        category: 'Objects',
        shape: 'rect',
        color: '#f59e0b',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      }
    ],
    lights: [
      {
        id: 'armory_light',
        col: 2,
        row: 2,
        offsetX: 0.5,
        offsetY: 0.5,
        radiusCells: 4.0,
        color: '#f59e0b',
        intensity: 0.85,
        animation: 'steady',
        label: 'Armory Tactical Cage Light'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_armory_east',
        label: 'East Vault Door Socket',
        kind: 'perimeter_socket',
        col: 5,
        row: 1,
        edge: 'east',
        cellOffset: 1,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 18,
        breachHp: 90,
        footprintCells: [1, 2],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 90,
        allowOverride: true,
        assignedProperties: { isLocked: true, hackDc: 18 }
      },
      {
        id: 'slot_armory_turret',
        label: 'Checkpoint Sentry Mount',
        kind: 'internal_slot',
        col: 4,
        row: 1,
        slotCategory: 'turret_hardpoint',
        footprintCells: [1, 1],
        defaultAssetId: 'turret',
        defaultAssetLabel: 'Security Overwatch Turret',
        defaultShape: 'hexagon',
        defaultColor: '#ef4444',
        rotationDeg: 0,
        arcFacingDeg: 0,
        allowOverride: true,
        assignedProperties: { isArmed: true, hackDc: 16, factionDesignation: 'Adversary' }
      },
      {
        id: 'slot_ordnance_locker',
        label: 'Restricted Ordnance Locker',
        kind: 'internal_slot',
        col: 2,
        row: 3,
        slotCategory: 'loot_cache',
        footprintCells: [2, 1],
        defaultAssetId: 'crate',
        defaultAssetLabel: 'Mil-Spec Ordnance Chest',
        defaultShape: 'rect',
        defaultColor: '#10b981',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { isLocked: true, hackDc: 18, lootTableId: 'armory_heavy' }
      }
    ],
    tags: ['security', 'armory', 'weapons', 'checkpoint']
  }),

  // 8. Starship Bridge Command Deck (8x6)
  createDefaultMapChunk({
    chunkId: 'chunk_bridge_command_8x6',
    name: 'Starship Bridge Command Deck (8x6)',
    description:
      'Forward starship command bridge with armored forward viewports, 2x2 tactical holotable, helm consoles, and rear bulkhead socket.',
    category: 'starship_compartment',
    scale: 'Interior',
    widthCells: 8,
    heightCells: 6,
    northSide: 'N',
    tiles: makeRectTiles(8, 6, 'steelGrating', 'Command Decking', 'acoustic_stealth', '#1e1b4b', (c, r) =>
      c >= 2 && c <= 5 && r >= 2 && r <= 4 ? { color: '#312e81', label: 'Command Pit Dais' } : {}
    ),
    walls: makePerimeterWalls(8, 6, [
      { edge: 'north', offset: 1, span: 6, type: 'window', label: 'Forward Armored Glasteel Viewport' },
      { edge: 'south', offset: 3, span: 2, type: 'door', label: 'Bridge Blast Door', hackDc: 18 }
    ]),
    assets: [
      {
        id: 'bridge_holotable',
        col: 3,
        row: 2,
        widthCells: 2,
        heightCells: 2,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: true,
        type: 'holotable',
        label: 'Astrogation & Tactical Holotable',
        category: 'Objects',
        shape: 'circle',
        color: '#38bdf8',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      },
      {
        id: 'helm_station',
        col: 2,
        row: 1,
        widthCells: 2,
        heightCells: 1,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'terminal',
        label: 'Primary Helm & Thruster Console',
        category: 'Objects',
        shape: 'rect',
        color: '#22d3ee',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      },
      {
        id: 'gunnery_station',
        col: 4,
        row: 1,
        widthCells: 2,
        heightCells: 1,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'terminal',
        label: 'Fire Control & Sensor Console',
        category: 'Objects',
        shape: 'rect',
        color: '#f43f5e',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      }
    ],
    lights: [
      {
        id: 'bridge_holo_glow',
        col: 3,
        row: 2,
        offsetX: 1.0,
        offsetY: 1.0,
        radiusCells: 5.5,
        color: '#38bdf8',
        intensity: 1.0,
        animation: 'steady',
        label: 'Holotable Projection Glow'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_bridge_aft',
        label: 'Aft Bridge Bulkhead Socket',
        kind: 'perimeter_socket',
        col: 3,
        row: 5,
        edge: 'south',
        cellOffset: 3,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 18,
        breachHp: 110,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: { isLocked: true, hackDc: 18 }
      },
      {
        id: 'slot_captain_throne',
        label: 'Command Chair Mount',
        kind: 'internal_slot',
        col: 3,
        row: 4,
        slotCategory: 'terminal_node',
        footprintCells: [2, 1],
        defaultAssetId: 'terminal',
        defaultAssetLabel: 'Captain Command Chair & Uplinks',
        defaultShape: 'hexagon',
        defaultColor: '#a855f7',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { hackDc: 18, coverRating: 'half_cover' }
      }
    ],
    tags: ['bridge', 'starship', 'command', 'cockpit']
  }),

  // 9. Cargo Hold & Hangar Bay (8x10)
  createDefaultMapChunk({
    chunkId: 'chunk_cargo_hold_8x10',
    name: 'Cargo Hold & Hangar Bay (8x10)',
    description:
      'Spacious 8x10 hangar bay with exterior magnetic bay doors on the North side, ISO shipping containers, and loader crane hardpoints.',
    category: 'starship_compartment',
    scale: 'Interior',
    widthCells: 8,
    heightCells: 10,
    northSide: 'N',
    tiles: makeRectTiles(8, 10, 'steelGrating', 'Hangar Deck Plate', 'metal_deck', '#334155', (c, r) =>
      c >= 2 && c <= 5 && r >= 2 && r <= 7
        ? { color: '#ca8a04', label: 'Hazard Landing Pad Markings' }
        : {}
    ),
    walls: makePerimeterWalls(8, 10, [
      { edge: 'north', offset: 1, span: 6, type: 'door', label: 'Magnetic Hangar Bay Shield', hackDc: 18 },
      { edge: 'south', offset: 3, span: 2, type: 'door', label: 'Cargo Access Bulkhead', hackDc: 14 },
      { edge: 'east', offset: 4, span: 2, type: 'door', label: 'East Freight Lock', hackDc: 14 }
    ]),
    assets: [
      {
        id: 'iso_container_1',
        col: 1,
        row: 6,
        widthCells: 2,
        heightCells: 3,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'crate',
        label: 'Armored ISO Cargo Container',
        category: 'Objects',
        shape: 'rect',
        color: '#0284c7',
        isInteractive: true,
        isTrap: false,
        coverRating: 'full_cover'
      },
      {
        id: 'iso_container_2',
        col: 5,
        row: 6,
        widthCells: 2,
        heightCells: 3,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 0,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'crate',
        label: 'Hazmat Shipping Container',
        category: 'Objects',
        shape: 'rect',
        color: '#ea580c',
        isInteractive: true,
        isTrap: false,
        coverRating: 'full_cover'
      }
    ],
    lights: [
      {
        id: 'hangar_beacon_n',
        col: 3,
        row: 2,
        offsetX: 1.0,
        offsetY: 0.5,
        radiusCells: 5.5,
        color: '#f59e0b',
        intensity: 0.9,
        animation: 'steady',
        label: 'Landing Guide Floodlight'
      },
      {
        id: 'hangar_beacon_s',
        col: 3,
        row: 7,
        offsetX: 1.0,
        offsetY: 0.5,
        radiusCells: 5.5,
        color: '#38bdf8',
        intensity: 0.9,
        animation: 'steady',
        label: 'Aft Cargo Floodlight'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_hangar_south',
        label: 'South Cargo Bulkhead Socket',
        kind: 'perimeter_socket',
        col: 3,
        row: 9,
        edge: 'south',
        cellOffset: 3,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 14,
        breachHp: 80,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'sock_hangar_east',
        label: 'East Freight Socket',
        kind: 'perimeter_socket',
        col: 7,
        row: 4,
        edge: 'east',
        cellOffset: 4,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 14,
        breachHp: 80,
        footprintCells: [1, 2],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 90,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'slot_smuggler_cache',
        label: 'Deckplate Smuggler Cache',
        kind: 'internal_slot',
        col: 3,
        row: 4,
        slotCategory: 'loot_cache',
        footprintCells: [2, 2],
        defaultAssetId: 'crate',
        defaultAssetLabel: 'Palletized Contraband Crate',
        defaultShape: 'rect',
        defaultColor: '#10b981',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { isLocked: true, hackDc: 15, coverRating: 'three_quarters' }
      }
    ],
    tags: ['cargo', 'hangar', 'starship', 'containers']
  }),

  // 10. Cryo-Stasis Vault (6x5)
  createDefaultMapChunk({
    chunkId: 'chunk_cryo_stasis_6x5',
    name: 'Cryo-Stasis Vault (6x5)',
    description:
      'Sub-zero hypersleep chamber containing 6 cryo-pods, frost vents, and a master awakening terminal.',
    category: 'room_module',
    scale: 'Interior',
    widthCells: 6,
    heightCells: 5,
    northSide: 'N',
    tiles: makeRectTiles(6, 5, 'iceSheet', 'Cryo-Frost Decking', 'arctic_ice', '#083344'),
    walls: makePerimeterWalls(6, 5, [
      { edge: 'south', offset: 2, span: 2, type: 'door', label: 'Thermal Cryo-Vault Door', hackDc: 15 }
    ]),
    assets: [
      {
        id: 'cryo_pod_w1',
        col: 1,
        row: 1,
        widthCells: 1,
        heightCells: 1,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 90,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'stasisPod',
        label: 'Cryo-Pod 01',
        category: 'Objects',
        shape: 'rect',
        color: '#22d3ee',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      },
      {
        id: 'cryo_pod_w2',
        col: 1,
        row: 3,
        widthCells: 1,
        heightCells: 1,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 90,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'stasisPod',
        label: 'Cryo-Pod 02',
        category: 'Objects',
        shape: 'rect',
        color: '#22d3ee',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      },
      {
        id: 'cryo_pod_e1',
        col: 4,
        row: 1,
        widthCells: 1,
        heightCells: 1,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 270,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'stasisPod',
        label: 'Cryo-Pod 03',
        category: 'Objects',
        shape: 'rect',
        color: '#22d3ee',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      },
      {
        id: 'cryo_pod_e2',
        col: 4,
        row: 3,
        widthCells: 1,
        heightCells: 1,
        offsetX: 0,
        offsetY: 0,
        rotationDeg: 270,
        flipX: false,
        flipY: false,
        keepUpright: false,
        type: 'stasisPod',
        label: 'Cryo-Pod 04',
        category: 'Objects',
        shape: 'rect',
        color: '#22d3ee',
        isInteractive: true,
        isTrap: false,
        coverRating: 'half_cover'
      }
    ],
    lights: [
      {
        id: 'cryo_cold_light',
        col: 2,
        row: 2,
        offsetX: 1.0,
        offsetY: 0.5,
        radiusCells: 4.0,
        color: '#22d3ee',
        intensity: 0.8,
        animation: 'pulse',
        label: 'Cryogenic Status Luminaire'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_cryo_south',
        label: 'South Cryo Entry Socket',
        kind: 'perimeter_socket',
        col: 2,
        row: 4,
        edge: 'south',
        cellOffset: 2,
        spanCells: 2,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 15,
        breachHp: 75,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#22d3ee',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'slot_cryo_master',
        label: 'Master Revival Mainframe',
        kind: 'internal_slot',
        col: 2,
        row: 1,
        slotCategory: 'terminal_node',
        footprintCells: [2, 1],
        defaultAssetId: 'terminal',
        defaultAssetLabel: 'Hypersleep Revival Console',
        defaultShape: 'rect',
        defaultColor: '#38bdf8',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: { hackDc: 15, coverRating: 'half_cover' }
      }
    ],
    tags: ['cryo', 'stasis', 'pods', 'vault']
  }),

  // 11. Perimeter Defense Bunker Pillbox (5x5)
  createDefaultMapChunk({
    chunkId: 'chunk_bunker_pillbox_5x5',
    name: 'Perimeter Defense Bunker Pillbox (5x5)',
    description:
      'Fortified 5x5 ferrocrete pillbox with North/East/West firing embrasures, a heavy autocannon turret slot, and South blast door.',
    category: 'perimeter_defense',
    scale: 'Tactical',
    widthCells: 5,
    heightCells: 5,
    northSide: 'N',
    tiles: makeRectTiles(5, 5, 'concretePad', 'Ferrocrete Bunker Floor', 'metal_deck', '#3f3f46'),
    walls: makePerimeterWalls(5, 5, [
      { edge: 'north', offset: 1, span: 3, type: 'window', label: 'North Firing Embrasure' },
      { edge: 'east', offset: 1, span: 3, type: 'window', label: 'East Firing Embrasure' },
      { edge: 'west', offset: 1, span: 3, type: 'window', label: 'West Firing Embrasure' },
      { edge: 'south', offset: 2, span: 1, type: 'door', label: 'Rear Bunker Hatch', hackDc: 16 }
    ]),
    assets: [],
    lights: [
      {
        id: 'bunker_red_lamp',
        col: 2,
        row: 2,
        offsetX: 0.5,
        offsetY: 0.5,
        radiusCells: 3.5,
        color: '#ef4444',
        intensity: 0.75,
        animation: 'steady',
        label: 'Tactical Night-Vision Lamp'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_bunker_rear',
        label: 'South Trench Hatch Socket',
        kind: 'perimeter_socket',
        col: 2,
        row: 4,
        edge: 'south',
        cellOffset: 2,
        spanCells: 1,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: 16,
        breachHp: 110,
        footprintCells: [1, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: { breachHp: 110 }
      },
      {
        id: 'slot_heavy_turret',
        label: 'Central Heavy Emplacement',
        kind: 'internal_slot',
        col: 2,
        row: 2,
        slotCategory: 'turret_hardpoint',
        footprintCells: [1, 1],
        defaultAssetId: 'turret',
        defaultAssetLabel: 'Twin-Linked Rotary Autocannon',
        defaultShape: 'hexagon',
        defaultColor: '#ef4444',
        rotationDeg: 0,
        arcFacingDeg: 0,
        allowOverride: true,
        assignedProperties: {
          isArmed: true,
          breachHp: 85,
          armorDr: 8,
          coverRating: 'three_quarters',
          factionDesignation: 'Adversary'
        }
      },
      {
        id: 'slot_ammo_hopper',
        label: 'Ammunition Feed Crate',
        kind: 'internal_slot',
        col: 1,
        row: 3,
        slotCategory: 'loot_cache',
        footprintCells: [1, 1],
        defaultAssetId: 'crate',
        defaultAssetLabel: '20mm Caseless Ammo Hopper',
        defaultShape: 'rect',
        defaultColor: '#eab308',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: { coverRating: 'half_cover' }
      }
    ],
    tags: ['bunker', 'pillbox', 'defense', 'turret']
  }),

  // 12. Xenomorph Bio-Resin Nest Pocket (6x6)
  createDefaultMapChunk({
    chunkId: 'chunk_xeno_nest_6x6',
    name: 'Xenomorph Bio-Resin Nest Pocket (6x6)',
    description:
      'Organic 6x6 hive chamber coated in secreted bio-resin, acid pools, spore sacs, and an egg clutch spawn hardpoint.',
    category: 'hazard_setpiece',
    scale: 'Interior',
    widthCells: 6,
    heightCells: 6,
    northSide: 'N',
    tiles: makeRectTiles(6, 6, 'alienBiomass', 'Secreted Bio-Resin', 'chitin_hive', '#365314', (c, r) =>
      (c === 1 && r === 1) || (c === 4 && r === 4)
        ? {
            terrainTypeId: 'acidPool',
            label: 'Corrosive Bile Pool',
            color: '#84cc16',
            isLiquid: true,
            liquidType: 'acid',
            hazardType: 'acid_burn',
            movementCost: 2
          }
        : {}
    ),
    walls: makePerimeterWalls(6, 6, [
      { edge: 'north', offset: 2, span: 2, type: 'open' },
      { edge: 'south', offset: 2, span: 2, type: 'open' }
    ]),
    assets: [],
    lights: [
      {
        id: 'biolume_spore_glow',
        col: 2,
        row: 2,
        offsetX: 1.0,
        offsetY: 1.0,
        radiusCells: 4.0,
        color: '#84cc16',
        intensity: 0.7,
        animation: 'pulse',
        label: 'Bioluminescent Hive Spores'
      }
    ],
    constructionPoints: [
      {
        id: 'sock_hive_north',
        label: 'North Resin Tunnel',
        kind: 'perimeter_socket',
        col: 2,
        row: 0,
        edge: 'north',
        cellOffset: 2,
        spanCells: 2,
        socketType: 'open_arch',
        autoSpawnDoor: false,
        defaultDoorType: 'none',
        doorLockDc: 10,
        breachHp: 40,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#84cc16',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'sock_hive_south',
        label: 'South Resin Tunnel',
        kind: 'perimeter_socket',
        col: 2,
        row: 5,
        edge: 'south',
        cellOffset: 2,
        spanCells: 2,
        socketType: 'open_arch',
        autoSpawnDoor: false,
        defaultDoorType: 'none',
        doorLockDc: 10,
        breachHp: 40,
        footprintCells: [2, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#84cc16',
        rotationDeg: 180,
        allowOverride: true,
        assignedProperties: {}
      },
      {
        id: 'slot_egg_clutch',
        label: 'Brood Ovomorph Clutch',
        kind: 'internal_slot',
        col: 2,
        row: 2,
        slotCategory: 'hazard_emitter',
        footprintCells: [2, 2],
        defaultAssetId: 'bioNode',
        defaultAssetLabel: 'Dormant Ovomorph Egg Clutch',
        defaultShape: 'circle',
        defaultColor: '#84cc16',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {
          isArmed: true,
          detectionDc: 15,
          disarmDc: 16,
          triggerType: 'proximity',
          damageFormula: '2d8 acid',
          saveDc: 15
        }
      }
    ],
    defaultSettings: {
      powerState: 'emergency',
      securityTier: 3,
      conditionState: 'xenomorph_hive',
      biomeThemeOverride: 'chitin_hive',
      customParameters: {}
    },
    tags: ['xenomorph', 'hive', 'alien', 'hazard', 'cavern']
  })
];

export const SCIENCE_FANTASY_SEED_CHUNKS: MapChunkBlueprint[] = RAW_SEED_CHUNKS.map((chunk) => ({
  ...chunk,
  thumbnailUrl: renderChunkThumbnailDataUrl(chunk)
}));

export function getSeedChunkById(chunkId: string): MapChunkBlueprint | undefined {
  return SCIENCE_FANTASY_SEED_CHUNKS.find((c) => c.chunkId === chunkId);
}
