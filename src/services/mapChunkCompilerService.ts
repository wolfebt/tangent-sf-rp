/**
 * @file mapChunkCompilerService.ts
 * @description Compiler, Dihedral (D4) Transformation Engine, Magnetic Socket Snapper,
 * Wall/Door Welder, and In-Situ Region Extractor for the Hybrid Chunk / Tile System.
 */

import {
  type MapChunkBlueprint,
  type ChunkTileCell,
  type ChunkWallSegment,
  type ChunkPlacedAsset,
  type ChunkLightEmitter,
  type ChunkConstructionPoint,
  type ChunkAdjustableSettings,
  type ChunkSlotOverride,
  type PlacedChunkInstance,
  type CardinalEdge,
  type NorthFacingDirection,
  createDefaultMapChunk
} from '../schemas/mapChunkSchema';
import { createWallSegment, WALL_TYPES, DOOR_STATES } from '../schemas/vttWallSchema';

export interface CompileChunkOptions {
  instanceId?: string;
  targetCol: number;
  targetRow: number;
  gridSize: number;
  rotationDeg?: 0 | 90 | 180 | 270;
  flipX?: boolean;
  flipY?: boolean;
  settings?: Partial<ChunkAdjustableSettings>;
  slotOverrides?: Record<string, ChunkSlotOverride>;
  elementCustomizations?: Record<string, Record<string, any>>;
}

export interface CompiledChunkResult {
  instanceRecord: PlacedChunkInstance;
  transformedBlueprint: MapChunkBlueprint;
  terrains: any[];
  walls: any[];
  objects: any[];
  lights: any[];
  worldSockets: WorldPerimeterSocket[];
}

export interface WorldPerimeterSocket {
  socketId: string;
  chunkId: string;
  instanceId: string;
  label: string;
  edge: CardinalEdge;
  socketType: string;
  cellOffset: number;
  spanCells: number;
  worldP1: { x: number; y: number };
  worldP2: { x: number; y: number };
  worldMid: { x: number; y: number };
  autoSpawnDoor: boolean;
  defaultDoorType: 'bulkhead' | 'airlock' | 'none';
  doorLockDc: number;
  breachHp: number;
}

export interface SocketSnapCandidate {
  snappedCol: number;
  snappedRow: number;
  snappedX: number;
  snappedY: number;
  distancePx: number;
  incomingSocket: WorldPerimeterSocket;
  targetSocket: WorldPerimeterSocket;
}

const BIOME_PALETTES: Record<string, { floorColor: string; strokeColor: string; wallColor: string; material: string }> = {
  metal_deck: { floorColor: '#334155', strokeColor: '#475569', wallColor: '#94a3b8', material: 'metal_deck' },
  ceramic_tile: { floorColor: '#e2e8f0', strokeColor: '#cbd5e1', wallColor: '#64748b', material: 'ceramic_tile' },
  acoustic_stealth: { floorColor: '#1e1b4b', strokeColor: '#312e81', wallColor: '#4f46e5', material: 'acoustic_stealth' },
  raw_cavern: { floorColor: '#44403c', strokeColor: '#57534e', wallColor: '#78716c', material: 'raw_cavern' },
  chitin_hive: { floorColor: '#365314', strokeColor: '#4d7c0f', wallColor: '#84cc16', material: 'chitin_hive' },
  volcanic_basalt: { floorColor: '#450a0a', strokeColor: '#7f1d1d', wallColor: '#ef4444', material: 'volcanic_basalt' },
  arctic_ice: { floorColor: '#083344', strokeColor: '#0e7490', wallColor: '#22d3ee', material: 'arctic_ice' },
  desert_sand: { floorColor: '#78350f', strokeColor: '#b45309', wallColor: '#f59e0b', material: 'desert_sand' },
  corporate_atrium: { floorColor: '#1e293b', strokeColor: '#38bdf8', wallColor: '#7dd3fc', material: 'corporate_atrium' }
};

/**
 * Helper to transform a 4-bit cardinal bitmask (N=1, W=2, E=4, S=8)
 */
function transformBitmask4Bit(
  mask: number | undefined,
  mode: 'flipX' | 'flipY' | 'rot90CW'
): number | undefined {
  if (mask === undefined) return undefined;
  const n = (mask & 1) !== 0;
  const w = (mask & 2) !== 0;
  const e = (mask & 4) !== 0;
  const s = (mask & 8) !== 0;

  if (mode === 'flipX') {
    return (n ? 1 : 0) | (e ? 2 : 0) | (w ? 4 : 0) | (s ? 8 : 0);
  }
  if (mode === 'flipY') {
    return (s ? 1 : 0) | (w ? 2 : 0) | (e ? 4 : 0) | (n ? 8 : 0);
  }
  // rot90CW: N->E, E->S, S->W, W->N
  return (w ? 1 : 0) | (s ? 2 : 0) | (n ? 4 : 0) | (e ? 8 : 0);
}

/**
 * Helper to compute anchor (col, row) for a perimeter socket on a WxH chunk
 */
function getSocketGridAnchor(
  edge: CardinalEdge,
  cellOffset: number,
  widthCells: number,
  heightCells: number
): { col: number; row: number } {
  switch (edge) {
    case 'north':
      return { col: Math.min(widthCells - 1, Math.max(0, cellOffset)), row: 0 };
    case 'south':
      return { col: Math.min(widthCells - 1, Math.max(0, cellOffset)), row: Math.max(0, heightCells - 1) };
    case 'east':
      return { col: Math.max(0, widthCells - 1), row: Math.min(heightCells - 1, Math.max(0, cellOffset)) };
    case 'west':
      return { col: 0, row: Math.min(heightCells - 1, Math.max(0, cellOffset)) };
  }
}

/**
 * Applies a Horizontal Flip across width W to a MapChunkBlueprint
 */
function applyHorizontalFlip(bp: MapChunkBlueprint): MapChunkBlueprint {
  const W = bp.widthCells;
  const H = bp.heightCells;

  const nextNorth: NorthFacingDirection =
    bp.northSide === 'E' ? 'W' : bp.northSide === 'W' ? 'E' : bp.northSide;

  const tiles: ChunkTileCell[] = bp.tiles.map((t) => ({
    ...t,
    col: W - 1 - t.col,
    bitmask4Bit: transformBitmask4Bit(t.bitmask4Bit, 'flipX')
  }));

  const walls: ChunkWallSegment[] = bp.walls.map((w) => {
    const p1 = { x: W - w.p1.x, y: w.p1.y };
    const p2 = { x: W - w.p2.x, y: w.p2.y };
    const nextEdge: CardinalEdge | undefined =
      w.cardinalEdge === 'east'
        ? 'west'
        : w.cardinalEdge === 'west'
        ? 'east'
        : w.cardinalEdge;
    // Invert p1/p2 on one_way walls when mirroring so normal direction stays consistent
    if (w.type === 'one_way') {
      return { ...w, p1: p2, p2: p1, cardinalEdge: nextEdge };
    }
    return { ...w, p1, p2, cardinalEdge: nextEdge };
  });

  const assets: ChunkPlacedAsset[] = bp.assets.map((a) => {
    const wCells = a.widthCells || 1;
    const nextCol = W - (a.col + wCells);
    const nextRot = a.keepUpright ? a.rotationDeg : (360 - (a.rotationDeg || 0)) % 360;
    const nextArc =
      a.arcFacingDeg !== undefined ? (360 - a.arcFacingDeg + 360) % 360 : undefined;
    const nextWaypoints = a.patrolWaypoints?.map((wp) => ({
      col: W - 1 - wp.col,
      row: wp.row
    }));
    return {
      ...a,
      col: nextCol,
      offsetX: -(a.offsetX || 0),
      flipX: !a.flipX,
      rotationDeg: nextRot,
      arcFacingDeg: nextArc,
      patrolWaypoints: nextWaypoints
    };
  });

  const lights: ChunkLightEmitter[] = bp.lights.map((l) => ({
    ...l,
    col: W - 1 - l.col,
    offsetX: 1 - (l.offsetX ?? 0.5)
  }));

  const constructionPoints: ChunkConstructionPoint[] = bp.constructionPoints.map((cp) => {
    if (cp.kind === 'perimeter_socket' && cp.edge) {
      const span = cp.spanCells || 1;
      const offset = cp.cellOffset || 0;
      let nextEdge: CardinalEdge = cp.edge;
      let nextOffset = offset;
      if (cp.edge === 'east') {
        nextEdge = 'west';
      } else if (cp.edge === 'west') {
        nextEdge = 'east';
      } else {
        // north or south
        nextOffset = Math.max(0, W - (offset + span));
      }
      const anchor = getSocketGridAnchor(nextEdge, nextOffset, W, H);
      return {
        ...cp,
        edge: nextEdge,
        cellOffset: nextOffset,
        col: anchor.col,
        row: anchor.row
      };
    }

    // Internal slot
    const [fw] = cp.footprintCells || [1, 1];
    const nextCol = W - ((cp.col || 0) + fw);
    const nextRot = (360 - (cp.rotationDeg || 0)) % 360;
    const nextArc =
      cp.arcFacingDeg !== undefined ? (360 - cp.arcFacingDeg + 360) % 360 : undefined;
    return {
      ...cp,
      col: nextCol,
      rotationDeg: nextRot,
      arcFacingDeg: nextArc
    };
  });

  return {
    ...bp,
    northSide: nextNorth,
    tiles,
    walls,
    assets,
    lights,
    constructionPoints
  };
}

/**
 * Applies a Vertical Flip across height H to a MapChunkBlueprint
 */
function applyVerticalFlip(bp: MapChunkBlueprint): MapChunkBlueprint {
  const W = bp.widthCells;
  const H = bp.heightCells;

  const nextNorth: NorthFacingDirection =
    bp.northSide === 'N' ? 'S' : bp.northSide === 'S' ? 'N' : bp.northSide;

  const tiles: ChunkTileCell[] = bp.tiles.map((t) => ({
    ...t,
    row: H - 1 - t.row,
    bitmask4Bit: transformBitmask4Bit(t.bitmask4Bit, 'flipY')
  }));

  const walls: ChunkWallSegment[] = bp.walls.map((w) => {
    const p1 = { x: w.p1.x, y: H - w.p1.y };
    const p2 = { x: w.p2.x, y: H - w.p2.y };
    const nextEdge: CardinalEdge | undefined =
      w.cardinalEdge === 'north'
        ? 'south'
        : w.cardinalEdge === 'south'
        ? 'north'
        : w.cardinalEdge;
    if (w.type === 'one_way') {
      return { ...w, p1: p2, p2: p1, cardinalEdge: nextEdge };
    }
    return { ...w, p1, p2, cardinalEdge: nextEdge };
  });

  const assets: ChunkPlacedAsset[] = bp.assets.map((a) => {
    const hCells = a.heightCells || 1;
    const nextRow = H - (a.row + hCells);
    const nextRot = a.keepUpright ? a.rotationDeg : (180 - (a.rotationDeg || 0) + 360) % 360;
    const nextArc =
      a.arcFacingDeg !== undefined ? (180 - a.arcFacingDeg + 360) % 360 : undefined;
    const nextWaypoints = a.patrolWaypoints?.map((wp) => ({
      col: wp.col,
      row: H - 1 - wp.row
    }));
    return {
      ...a,
      row: nextRow,
      offsetY: -(a.offsetY || 0),
      flipY: !a.flipY,
      rotationDeg: nextRot,
      arcFacingDeg: nextArc,
      patrolWaypoints: nextWaypoints
    };
  });

  const lights: ChunkLightEmitter[] = bp.lights.map((l) => ({
    ...l,
    row: H - 1 - l.row,
    offsetY: 1 - (l.offsetY ?? 0.5)
  }));

  const constructionPoints: ChunkConstructionPoint[] = bp.constructionPoints.map((cp) => {
    if (cp.kind === 'perimeter_socket' && cp.edge) {
      const span = cp.spanCells || 1;
      const offset = cp.cellOffset || 0;
      let nextEdge: CardinalEdge = cp.edge;
      let nextOffset = offset;
      if (cp.edge === 'north') {
        nextEdge = 'south';
      } else if (cp.edge === 'south') {
        nextEdge = 'north';
      } else {
        // east or west
        nextOffset = Math.max(0, H - (offset + span));
      }
      const anchor = getSocketGridAnchor(nextEdge, nextOffset, W, H);
      return {
        ...cp,
        edge: nextEdge,
        cellOffset: nextOffset,
        col: anchor.col,
        row: anchor.row
      };
    }

    const [, fh] = cp.footprintCells || [1, 1];
    const nextRow = H - ((cp.row || 0) + fh);
    const nextRot = (180 - (cp.rotationDeg || 0) + 360) % 360;
    const nextArc =
      cp.arcFacingDeg !== undefined ? (180 - cp.arcFacingDeg + 360) % 360 : undefined;
    return {
      ...cp,
      row: nextRow,
      rotationDeg: nextRot,
      arcFacingDeg: nextArc
    };
  });

  return {
    ...bp,
    northSide: nextNorth,
    tiles,
    walls,
    assets,
    lights,
    constructionPoints
  };
}

/**
 * Applies a single 90-degree Clockwise rotation step (North -> East -> South -> West)
 * Swaps widthCells and heightCells: (W', H') = (H, W)
 */
function applyRotate90CW(bp: MapChunkBlueprint): MapChunkBlueprint {
  const W = bp.widthCells;
  const H = bp.heightCells;
  const nextW = H;
  const nextH = W;

  const northCycle: Record<NorthFacingDirection, NorthFacingDirection> = {
    N: 'E',
    E: 'S',
    S: 'W',
    W: 'N'
  };
  const edgeCycle: Record<CardinalEdge, CardinalEdge> = {
    north: 'east',
    east: 'south',
    south: 'west',
    west: 'north'
  };

  const nextNorth = northCycle[bp.northSide || 'N'] || 'E';

  const tiles: ChunkTileCell[] = bp.tiles.map((t) => ({
    ...t,
    col: H - 1 - t.row,
    row: t.col,
    bitmask4Bit: transformBitmask4Bit(t.bitmask4Bit, 'rot90CW')
  }));

  const walls: ChunkWallSegment[] = bp.walls.map((w) => ({
    ...w,
    p1: { x: H - w.p1.y, y: w.p1.x },
    p2: { x: H - w.p2.y, y: w.p2.x },
    cardinalEdge: w.cardinalEdge ? edgeCycle[w.cardinalEdge] : undefined
  }));

  const assets: ChunkPlacedAsset[] = bp.assets.map((a) => {
    const wCells = a.widthCells || 1;
    const hCells = a.heightCells || 1;
    const nextCol = H - (a.row + hCells);
    const nextRow = a.col;
    const nextRot = a.keepUpright ? a.rotationDeg : ((a.rotationDeg || 0) + 90) % 360;
    const nextArc = a.arcFacingDeg !== undefined ? (a.arcFacingDeg + 90) % 360 : undefined;
    const nextWaypoints = a.patrolWaypoints?.map((wp) => ({
      col: H - 1 - wp.row,
      row: wp.col
    }));
    return {
      ...a,
      col: nextCol,
      row: nextRow,
      widthCells: hCells,
      heightCells: wCells,
      offsetX: -(a.offsetY || 0),
      offsetY: a.offsetX || 0,
      rotationDeg: nextRot,
      arcFacingDeg: nextArc,
      patrolWaypoints: nextWaypoints
    };
  });

  const lights: ChunkLightEmitter[] = bp.lights.map((l) => ({
    ...l,
    col: H - 1 - l.row,
    row: l.col,
    offsetX: 1 - (l.offsetY ?? 0.5),
    offsetY: l.offsetX ?? 0.5
  }));

  const constructionPoints: ChunkConstructionPoint[] = bp.constructionPoints.map((cp) => {
    if (cp.kind === 'perimeter_socket' && cp.edge) {
      const span = cp.spanCells || 1;
      const offset = cp.cellOffset || 0;
      const nextEdge = edgeCycle[cp.edge];
      let nextOffset = offset;
      if (cp.edge === 'east' || cp.edge === 'west') {
        nextOffset = Math.max(0, H - (offset + span));
      }
      const anchor = getSocketGridAnchor(nextEdge, nextOffset, nextW, nextH);
      return {
        ...cp,
        edge: nextEdge,
        cellOffset: nextOffset,
        col: anchor.col,
        row: anchor.row
      };
    }

    const [fw, fh] = cp.footprintCells || [1, 1];
    const nextCol = H - ((cp.row || 0) + fh);
    const nextRow = cp.col || 0;
    const nextRot = ((cp.rotationDeg || 0) + 90) % 360;
    const nextArc = cp.arcFacingDeg !== undefined ? (cp.arcFacingDeg + 90) % 360 : undefined;
    return {
      ...cp,
      col: nextCol,
      row: nextRow,
      footprintCells: [fh, fw],
      rotationDeg: nextRot,
      arcFacingDeg: nextArc
    };
  });

  return {
    ...bp,
    widthCells: nextW,
    heightCells: nextH,
    northSide: nextNorth,
    tiles,
    walls,
    assets,
    lights,
    constructionPoints
  };
}

/**
 * Pure Dihedral Group (D4) Transformation of a MapChunkBlueprint.
 * Canonical order:
 * 1. Horizontal Flip (flipX)
 * 2. Vertical Flip (flipY)
 * 3. 90-degree Clockwise Rotation steps (0, 90, 180, 270)
 */
export function transformChunkBlueprint(
  blueprint: MapChunkBlueprint,
  rotationDeg: 0 | 90 | 180 | 270 = 0,
  flipX = false,
  flipY = false
): MapChunkBlueprint {
  let result: MapChunkBlueprint = structuredClone
    ? structuredClone(blueprint)
    : JSON.parse(JSON.stringify(blueprint));

  if (flipX) {
    result = applyHorizontalFlip(result);
  }
  if (flipY) {
    result = applyVerticalFlip(result);
  }

  const normalizedRot = (((rotationDeg % 360) + 360) % 360) as 0 | 90 | 180 | 270;
  const steps = Math.round(normalizedRot / 90) % 4;
  for (let i = 0; i < steps; i++) {
    result = applyRotate90CW(result);
  }

  return result;
}

/**
 * Computes world-space perimeter sockets for a transformed chunk at (originX, originY)
 */
export function computeWorldPerimeterSockets(
  transformedBlueprint: MapChunkBlueprint,
  originX: number,
  originY: number,
  gridSize: number,
  instanceId = 'preview'
): WorldPerimeterSocket[] {
  const W = transformedBlueprint.widthCells;
  const H = transformedBlueprint.heightCells;
  const sockets: WorldPerimeterSocket[] = [];

  for (const cp of transformedBlueprint.constructionPoints) {
    if (cp.kind !== 'perimeter_socket' || !cp.edge) continue;
    const offset = cp.cellOffset || 0;
    const span = cp.spanCells || 1;
    let p1 = { x: originX, y: originY };
    let p2 = { x: originX, y: originY };

    if (cp.edge === 'north') {
      p1 = { x: originX + offset * gridSize, y: originY };
      p2 = { x: originX + (offset + span) * gridSize, y: originY };
    } else if (cp.edge === 'south') {
      p1 = { x: originX + offset * gridSize, y: originY + H * gridSize };
      p2 = { x: originX + (offset + span) * gridSize, y: originY + H * gridSize };
    } else if (cp.edge === 'east') {
      p1 = { x: originX + W * gridSize, y: originY + offset * gridSize };
      p2 = { x: originX + W * gridSize, y: originY + (offset + span) * gridSize };
    } else if (cp.edge === 'west') {
      p1 = { x: originX, y: originY + offset * gridSize };
      p2 = { x: originX, y: originY + (offset + span) * gridSize };
    }

    sockets.push({
      socketId: cp.id,
      chunkId: transformedBlueprint.chunkId,
      instanceId,
      label: cp.label,
      edge: cp.edge,
      socketType: cp.socketType || 'bulkhead_door',
      cellOffset: offset,
      spanCells: span,
      worldP1: p1,
      worldP2: p2,
      worldMid: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
      autoSpawnDoor: cp.autoSpawnDoor ?? true,
      defaultDoorType: cp.defaultDoorType || 'bulkhead',
      doorLockDc: cp.doorLockDc ?? 14,
      breachHp: cp.breachHp ?? 60
    });
  }

  return sockets;
}

/**
 * Compiles a MapChunkBlueprint (with D4 transforms, adjustable settings, and slot overrides)
 * into native MapMaker canvas elements (terrains, walls, objects, lights) and a PlacedChunkInstance record.
 */
export function compileChunkToMapElements(
  blueprint: MapChunkBlueprint,
  options: CompileChunkOptions
): CompiledChunkResult {
  const rotationDeg = options.rotationDeg || 0;
  const flipX = Boolean(options.flipX);
  const flipY = Boolean(options.flipY);
  const gridSize = options.gridSize || 50;
  const instanceId =
    options.instanceId ||
    `chunk_inst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const mergedSettings: ChunkAdjustableSettings = {
    powerState: options.settings?.powerState || blueprint.defaultSettings?.powerState || 'nominal',
    securityTier:
      options.settings?.securityTier ?? blueprint.defaultSettings?.securityTier ?? 2,
    conditionState:
      options.settings?.conditionState || blueprint.defaultSettings?.conditionState || 'pristine',
    biomeThemeOverride:
      options.settings?.biomeThemeOverride ||
      blueprint.defaultSettings?.biomeThemeOverride ||
      'chunk_default',
    customParameters: {
      ...(blueprint.defaultSettings?.customParameters || {}),
      ...(options.settings?.customParameters || {})
    }
  };

  const slotOverrides = options.slotOverrides || {};
  const elementCustomizations = options.elementCustomizations || {};

  // 1. Transform blueprint via Dihedral D4 group
  const transformed = transformChunkBlueprint(blueprint, rotationDeg, flipX, flipY);
  const originX = options.targetCol * gridSize;
  const originY = options.targetRow * gridSize;

  const biomePalette =
    mergedSettings.biomeThemeOverride !== 'chunk_default'
      ? BIOME_PALETTES[mergedSettings.biomeThemeOverride]
      : undefined;

  // Security tier scaling delta (+2 DC per tier above 1, +25% HP per tier above 1)
  const tierDelta = Math.max(0, mergedSettings.securityTier - 1);
  const dcBonus = tierDelta * 2;
  const hpMultiplier = 1 + tierDelta * 0.25;

  // Condition state multipliers
  const conditionHpMultiplier =
    mergedSettings.conditionState === 'battle_damaged'
      ? 0.65
      : mergedSettings.conditionState === 'breached'
      ? 0.35
      : 1;

  // 2. Compile Floor Tile Cells -> TexturedTerrainNode 'rect' elements
  const terrains = transformed.tiles.map((tile) => {
    const subKey = `tile_${tile.col}_${tile.row}`;
    const custom = elementCustomizations[subKey] || {};
    const x = originX + tile.col * gridSize;
    const y = originY + tile.row * gridSize;

    let tileColor = biomePalette && !tile.isLiquid ? biomePalette.floorColor : tile.color;
    let strokeColor = biomePalette ? biomePalette.strokeColor : '#475569';

    if (mergedSettings.conditionState === 'weathered') {
      strokeColor = '#78716c';
    } else if (mergedSettings.conditionState === 'xenomorph_hive' && !tile.isLiquid) {
      tileColor = '#365314';
      strokeColor = '#65a30d';
    }

    return {
      id: `${instanceId}__${subKey}`,
      chunkSubKey: subKey,
      chunkInstanceId: instanceId,
      chunkId: blueprint.chunkId,
      chunkNorthSide: transformed.northSide,
      renderType: 'rect',
      type: tile.terrainTypeId || 'steelGrating',
      label: tile.label || `${blueprint.name} Floor`,
      material: biomePalette ? biomePalette.material : tile.material,
      x,
      y,
      width: gridSize,
      height: gridSize,
      color: tileColor,
      strokeColor,
      strokeWidth: 1,
      textureUrl: tile.textureUrl,
      isLiquid: tile.isLiquid,
      liquidType: tile.liquidType,
      hazardType: tile.hazardType,
      movementCost: tile.movementCost,
      elevationOffsetFt: tile.elevationOffsetFt,
      layerId: 'terrain',
      ...custom
    };
  });

  // 3. Compile Wall & Portal Segments -> vttWallSchema segments
  const walls = transformed.walls.map((w) => {
    const subKey = `wall_${w.id}`;
    const custom = elementCustomizations[subKey] || {};
    const worldP1 = {
      x: Math.round(originX + w.p1.x * gridSize),
      y: Math.round(originY + w.p1.y * gridSize)
    };
    const worldP2 = {
      x: Math.round(originX + w.p2.x * gridSize),
      y: Math.round(originY + w.p2.y * gridSize)
    };

    const isDoor = w.type === 'door';
    let doorState = w.doorState || (isDoor ? DOOR_STATES.CLOSED : null);

    if (isDoor) {
      if (mergedSettings.powerState === 'unpowered' && doorState === DOOR_STATES.LOCKED) {
        doorState = DOOR_STATES.CLOSED;
      } else if (mergedSettings.conditionState === 'breached') {
        doorState = DOOR_STATES.BREACHED;
      } else if (mergedSettings.securityTier >= 4 && doorState === DOOR_STATES.CLOSED) {
        doorState = DOOR_STATES.LOCKED;
      }
    }

    const scaledMaxHp = Math.round((w.maxBreachHp || (isDoor ? 60 : 120)) * hpMultiplier);
    const scaledHp =
      doorState === DOOR_STATES.BREACHED
        ? 0
        : Math.round((w.breachHp || scaledMaxHp) * hpMultiplier * conditionHpMultiplier);

    const wallSeg = createWallSegment(worldP1, worldP2, w.type || WALL_TYPES.SOLID, {
      id: `${instanceId}__${subKey}`,
      doorState,
      label: w.label || (isDoor ? 'Bulkhead Door' : 'Bulkhead Wall'),
      breachHp: scaledHp,
      maxBreachHp: scaledMaxHp,
      hackDc: isDoor ? (w.hackDc || 12) + dcBonus : null,
      athleticsDc: (w.athleticsDc || 16) + dcBonus,
      color:
        w.color ||
        (isDoor
          ? '#f59e0b'
          : w.type === 'window'
          ? '#38bdf8'
          : biomePalette?.wallColor || '#e2e8f0'),
      isSecret: w.isSecret || false
    });

    return {
      ...wallSeg,
      chunkSubKey: subKey,
      chunkInstanceId: instanceId,
      chunkId: blueprint.chunkId,
      cardinalEdge: w.cardinalEdge,
      layerId: 'walls',
      ...custom
    };
  });

  // 4. Compile Fixed Placed Assets -> MapObjectNode elements
  const objects: any[] = transformed.assets.map((asset) => {
    const subKey = `asset_${asset.id}`;
    const custom = elementCustomizations[subKey] || {};
    const wPx = (asset.widthCells || 1) * gridSize;
    const hPx = (asset.heightCells || 1) * gridSize;
    const centerX =
      originX + (asset.col + (asset.widthCells || 1) / 2 + (asset.offsetX || 0)) * gridSize;
    const centerY =
      originY + (asset.row + (asset.heightCells || 1) / 2 + (asset.offsetY || 0)) * gridSize;

    const haloColor =
      mergedSettings.powerState === 'emergency'
        ? '#ef4444'
        : mergedSettings.powerState === 'overloaded'
        ? '#f59e0b'
        : mergedSettings.powerState === 'unpowered'
        ? undefined
        : asset.isInteractive
        ? '#38bdf8'
        : undefined;

    return {
      id: `${instanceId}__${subKey}`,
      chunkSubKey: subKey,
      chunkInstanceId: instanceId,
      chunkId: blueprint.chunkId,
      type: asset.type || 'doodad',
      label: asset.label,
      category: asset.category || 'Objects',
      shape: asset.shape || 'rect',
      x: Math.round(centerX),
      y: Math.round(centerY),
      width: Math.round(wPx * 0.85),
      height: Math.round(hPx * 0.85),
      radius: asset.radiusCells
        ? Math.round(asset.radiusCells * gridSize)
        : Math.round((Math.min(wPx, hPx) / 2) * 0.85),
      color: asset.color || '#38bdf8',
      haloColor,
      imageUrl: asset.imageUrl,
      rotation: asset.rotationDeg || 0,
      flipX: asset.flipX || false,
      flipY: asset.flipY || false,
      keepUpright: asset.keepUpright || false,
      arcFacingDeg: asset.arcFacingDeg,
      scaleTarget: asset.scaleTarget || null,
      hazard: asset.hazard || null,
      resource: asset.resource || null,
      isInteractive: asset.isInteractive || false,
      isTrap: asset.isTrap || false,
      trapType: asset.trapType,
      saveDc: asset.saveDc ? asset.saveDc + dcBonus : undefined,
      damageFormula: asset.damageFormula,
      coverRating: asset.coverRating || 'none',
      storyElementId: asset.storyElementId,
      omnicortexId: asset.omnicortexId,
      layerId: 'objects',
      ...custom
    };
  });

  // 5. Compile Internal Construction Point Slots -> MapObjectNode elements
  for (const cp of transformed.constructionPoints) {
    if (cp.kind !== 'internal_slot') continue;
    const override = slotOverrides[cp.id] || {};
    if (override.disabled) continue;

    const effectiveAssetId =
      override.assetId !== undefined ? override.assetId : cp.defaultAssetId;
    if (effectiveAssetId === null && !override.assetLabel && !cp.defaultAssetLabel) {
      continue;
    }

    const subKey = `slot_${cp.id}`;
    const custom = elementCustomizations[subKey] || {};
    const [fw, fh] = cp.footprintCells || [1, 1];
    const wPx = fw * gridSize;
    const hPx = fh * gridSize;
    const centerX = originX + ((cp.col || 0) + fw / 2) * gridSize;
    const centerY = originY + ((cp.row || 0) + fh / 2) * gridSize;

    const mergedProps = {
      ...(cp.assignedProperties || {}),
      ...(override.assignedProperties || {})
    };

    const isArmed =
      mergedSettings.powerState === 'unpowered'
        ? false
        : mergedProps.isArmed ?? (cp.slotCategory === 'turret_hardpoint' || cp.slotCategory === 'hazard_emitter');

    const slotLabel =
      override.assetLabel || cp.defaultAssetLabel || cp.label || 'Constructed Hardpoint';
    const slotShape = override.shape || cp.defaultShape || 'hexagon';
    const slotColor =
      override.color ||
      (mergedSettings.powerState === 'emergency'
        ? '#f87171'
        : mergedSettings.powerState === 'unpowered'
        ? '#64748b'
        : cp.defaultColor || '#22d3ee');

    const effectiveRot =
      override.rotationDeg !== undefined ? override.rotationDeg : cp.rotationDeg || 0;
    const effectiveArc =
      override.arcFacingDeg !== undefined ? override.arcFacingDeg : cp.arcFacingDeg;

    objects.push({
      id: `${instanceId}__${subKey}`,
      chunkSubKey: subKey,
      chunkInstanceId: instanceId,
      chunkId: blueprint.chunkId,
      constructionPointId: cp.id,
      slotCategory: cp.slotCategory,
      type: effectiveAssetId || cp.slotCategory || 'hardpoint',
      label: slotLabel,
      category: 'Construction Slot',
      shape: slotShape,
      x: Math.round(centerX),
      y: Math.round(centerY),
      width: Math.round(wPx * 0.82),
      height: Math.round(hPx * 0.82),
      radius: Math.round((Math.min(wPx, hPx) / 2) * 0.82),
      color: slotColor,
      haloColor: isArmed ? '#f43f5e' : '#22d3ee',
      rotation: effectiveRot,
      arcFacingDeg: effectiveArc,
      isInteractive: true,
      isTrap: cp.slotCategory === 'hazard_emitter',
      isLocked: mergedProps.isLocked ?? mergedSettings.securityTier >= 3,
      hackDc: (mergedProps.hackDc || 13) + dcBonus,
      athleticsDc: (mergedProps.athleticsDc || 15) + dcBonus,
      disarmDc: (mergedProps.disarmDc || 14) + dcBonus,
      detectionDc: (mergedProps.detectionDc || 14) + dcBonus,
      coverRating: mergedProps.coverRating || 'half_cover',
      breachHp: Math.round((mergedProps.breachHp || 50) * hpMultiplier),
      armorDr: (mergedProps.armorDr || 4) + tierDelta * 2,
      factionDesignation: mergedProps.factionDesignation || 'Neutral',
      isArmed,
      triggerType: mergedProps.triggerType,
      damageFormula: mergedProps.damageFormula,
      saveDc: mergedProps.saveDc ? mergedProps.saveDc + dcBonus : undefined,
      storyElementId: mergedProps.storyElementId,
      omnicortexId: mergedProps.omnicortexId,
      lootTableId: mergedProps.lootTableId,
      quickJsMacro: mergedProps.quickJsMacro,
      layerId: 'objects',
      ...custom
    });
  }

  // 6. Compile Dynamic Light Emitters -> MapMaker light nodes
  const lights: any[] = [];
  if (mergedSettings.powerState !== 'unpowered') {
    for (const l of transformed.lights) {
      const subKey = `light_${l.id}`;
      const custom = elementCustomizations[subKey] || {};
      const lx = originX + (l.col + (l.offsetX ?? 0.5)) * gridSize;
      const ly = originY + (l.row + (l.offsetY ?? 0.5)) * gridSize;

      let lightColor = l.color || '#38bdf8';
      let lightAnimation = l.animation || 'steady';
      let lightIntensity = l.intensity ?? 0.85;
      let radiusPx = (l.radiusCells || 3.5) * gridSize;

      if (mergedSettings.powerState === 'emergency') {
        lightColor = '#ef4444';
        lightAnimation = 'pulse';
        lightIntensity = Math.min(1, lightIntensity * 0.75);
        radiusPx *= 0.85;
      } else if (mergedSettings.powerState === 'overloaded') {
        lightColor = '#f59e0b';
        lightAnimation = 'strobe';
        lightIntensity = Math.min(1.5, lightIntensity * 1.25);
        radiusPx *= 1.15;
      }

      lights.push({
        id: `${instanceId}__${subKey}`,
        chunkSubKey: subKey,
        chunkInstanceId: instanceId,
        chunkId: blueprint.chunkId,
        label: l.label || `${blueprint.name} Luminaire`,
        x: Math.round(lx),
        y: Math.round(ly),
        radius: Math.round(radiusPx),
        color: lightColor,
        intensity: lightIntensity,
        animation: lightAnimation,
        layerId: 'lights',
        ...custom
      });
    }
  }

  // 7. Compute World-Space Perimeter Sockets
  const worldSockets = computeWorldPerimeterSockets(
    transformed,
    originX,
    originY,
    gridSize,
    instanceId
  );

  // 8. Build PlacedChunkInstance metadata record
  const instanceRecord: PlacedChunkInstance = {
    instanceId,
    chunkId: blueprint.chunkId,
    name: blueprint.name,
    col: options.targetCol,
    row: options.targetRow,
    x: originX,
    y: originY,
    gridSize,
    rotationDeg,
    flipX,
    flipY,
    northSide: transformed.northSide,
    effectiveWidthCells: transformed.widthCells,
    effectiveHeightCells: transformed.heightCells,
    settings: mergedSettings,
    slotOverrides,
    elementCustomizations,
    blueprintSnapshot: blueprint
  };

  return {
    instanceRecord,
    transformedBlueprint: transformed,
    terrains,
    walls,
    objects,
    lights,
    worldSockets
  };
}

const OPPOSITE_EDGE: Record<CardinalEdge, CardinalEdge> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east'
};

/**
 * Checks whether an incoming chunk at (candidateCol, candidateRow) has a perimeter socket
 * within snapThresholdPx of any existing placed chunk socket on an opposite edge.
 */
export function findBestSocketSnap(
  blueprint: MapChunkBlueprint,
  candidateCol: number,
  candidateRow: number,
  gridSize: number,
  rotationDeg: 0 | 90 | 180 | 270,
  flipX: boolean,
  flipY: boolean,
  existingInstances: PlacedChunkInstance[] = [],
  blueprintCatalog: MapChunkBlueprint[] = [],
  snapThresholdPx = gridSize * 1.5
): SocketSnapCandidate | null {
  if (!existingInstances || existingInstances.length === 0) return null;

  const transformedIncoming = transformChunkBlueprint(blueprint, rotationDeg, flipX, flipY);
  const candidateX = candidateCol * gridSize;
  const candidateY = candidateRow * gridSize;
  const incomingSockets = computeWorldPerimeterSockets(
    transformedIncoming,
    candidateX,
    candidateY,
    gridSize,
    'candidate'
  );
  if (incomingSockets.length === 0) return null;

  // Gather all existing world sockets
  const existingSockets: WorldPerimeterSocket[] = [];
  for (const inst of existingInstances) {
    const bp =
      inst.blueprintSnapshot ||
      blueprintCatalog.find((b) => b.chunkId === inst.chunkId);
    if (!bp) continue;
    const transExisting = transformChunkBlueprint(
      bp,
      inst.rotationDeg,
      inst.flipX,
      inst.flipY
    );
    const instSockets = computeWorldPerimeterSockets(
      transExisting,
      inst.col * gridSize,
      inst.row * gridSize,
      gridSize,
      inst.instanceId
    );
    existingSockets.push(...instSockets);
  }

  let bestSnap: SocketSnapCandidate | null = null;
  let minDistance = snapThresholdPx;

  for (const inc of incomingSockets) {
    const desiredTargetEdge = OPPOSITE_EDGE[inc.edge];
    for (const target of existingSockets) {
      if (target.edge !== desiredTargetEdge) continue;
      if (target.spanCells !== inc.spanCells) continue;

      const dist = Math.hypot(
        inc.worldMid.x - target.worldMid.x,
        inc.worldMid.y - target.worldMid.y
      );
      if (dist <= minDistance) {
        minDistance = dist;
        const deltaX = target.worldMid.x - inc.worldMid.x;
        const deltaY = target.worldMid.y - inc.worldMid.y;
        const snappedX = Math.round(candidateX + deltaX);
        const snappedY = Math.round(candidateY + deltaY);
        const snappedCol = Math.round(snappedX / gridSize);
        const snappedRow = Math.round(snappedY / gridSize);

        bestSnap = {
          snappedCol,
          snappedRow,
          snappedX: snappedCol * gridSize,
          snappedY: snappedRow * gridSize,
          distancePx: dist,
          incomingSocket: {
            ...inc,
            worldP1: { x: inc.worldP1.x + deltaX, y: inc.worldP1.y + deltaY },
            worldP2: { x: inc.worldP2.x + deltaX, y: inc.worldP2.y + deltaY },
            worldMid: { x: target.worldMid.x, y: target.worldMid.y }
          },
          targetSocket: target
        };
      }
    }
  }

  return bestSnap;
}

/**
 * Checks if two line segments (A1-A2 and B1-B2) are collinear and strictly overlapping
 * with the exact same endpoints (within tolerancePx).
 */
function areSegmentsCoincident(
  a1: { x: number; y: number },
  a2: { x: number; y: number },
  b1: { x: number; y: number },
  b2: { x: number; y: number },
  tol = 4
): boolean {
  const directMatch =
    Math.hypot(a1.x - b1.x, a1.y - b1.y) <= tol &&
    Math.hypot(a2.x - b2.x, a2.y - b2.y) <= tol;
  const reverseMatch =
    Math.hypot(a1.x - b2.x, a1.y - b2.y) <= tol &&
    Math.hypot(a2.x - b1.x, a2.y - b1.y) <= tol;
  return directMatch || reverseMatch;
}

/**
 * Deduplicates overlapping wall segments and automatically welds/spawns doors when
 * two perimeter sockets meet at the same boundary segment.
 */
export function weldChunkWallsAndDoors(
  existingWalls: any[],
  incomingWalls: any[],
  incomingSockets: WorldPerimeterSocket[] = [],
  existingSockets: WorldPerimeterSocket[] = []
): any[] {
  const resultWalls = [...existingWalls];

  // Find socket pairs that are aligned at the boundary
  const weldedSocketMidpoints: {
    p1: { x: number; y: number };
    p2: { x: number; y: number };
    socket: WorldPerimeterSocket;
  }[] = [];

  for (const inc of incomingSockets) {
    const oppEdge = OPPOSITE_EDGE[inc.edge];
    for (const ext of existingSockets) {
      if (ext.edge !== oppEdge) continue;
      if (
        Math.hypot(inc.worldMid.x - ext.worldMid.x, inc.worldMid.y - ext.worldMid.y) <= 6
      ) {
        weldedSocketMidpoints.push({
          p1: inc.worldP1,
          p2: inc.worldP2,
          socket: inc
        });
      }
    }
  }

  for (const incWall of incomingWalls) {
    const duplicateIdx = resultWalls.findIndex((extWall) =>
      areSegmentsCoincident(extWall.p1, extWall.p2, incWall.p1, incWall.p2)
    );

    // Check if this wall lies on a welded socket aperture
    const matchingWeld = weldedSocketMidpoints.find((ws) =>
      areSegmentsCoincident(ws.p1, ws.p2, incWall.p1, incWall.p2)
    );

    if (duplicateIdx >= 0) {
      const existingWall = resultWalls[duplicateIdx];
      if (matchingWeld && matchingWeld.socket.autoSpawnDoor) {
        if (matchingWeld.socket.defaultDoorType === 'none') {
          // Open archway: remove both solid walls so passage is clear
          resultWalls.splice(duplicateIdx, 1);
          continue;
        }
        // Upgrade the boundary into a single shared Door portal
        resultWalls[duplicateIdx] = {
          ...existingWall,
          type: WALL_TYPES.DOOR,
          doorState: DOOR_STATES.CLOSED,
          isOpen: false,
          isLocked: false,
          label:
            matchingWeld.socket.defaultDoorType === 'airlock'
              ? 'Airlock Seal'
              : 'Welded Bulkhead Door',
          hackDc: matchingWeld.socket.doorLockDc || 14,
          breachHp: matchingWeld.socket.breachHp || 60,
          maxBreachHp: matchingWeld.socket.breachHp || 60,
          color: '#f59e0b'
        };
      } else if (incWall.type === WALL_TYPES.DOOR && existingWall.type !== WALL_TYPES.DOOR) {
        // Prefer Door over Solid wall when deduplicating
        resultWalls[duplicateIdx] = incWall;
      }
      // Skip pushing duplicate wall
      continue;
    }

    resultWalls.push(incWall);
  }

  return resultWalls;
}

/**
 * Re-transforms and re-compiles an already-placed chunk instance in-place on a map,
 * preserving manual per-element tweaks via elementCustomizations.
 */
export function retransformPlacedChunkInstance(
  mapData: any,
  instanceId: string,
  updates: {
    rotationDeg?: 0 | 90 | 180 | 270;
    flipX?: boolean;
    flipY?: boolean;
    col?: number;
    row?: number;
    settings?: Partial<ChunkAdjustableSettings>;
    slotOverrides?: Record<string, ChunkSlotOverride>;
  },
  blueprintCatalog: MapChunkBlueprint[] = []
): any {
  const instances: PlacedChunkInstance[] = mapData.chunkInstances || [];
  const targetInst = instances.find((inst) => inst.instanceId === instanceId);
  if (!targetInst) return mapData;

  const blueprint =
    targetInst.blueprintSnapshot ||
    blueprintCatalog.find((b) => b.chunkId === targetInst.chunkId);
  if (!blueprint) return mapData;

  const nextRotation =
    updates.rotationDeg !== undefined ? updates.rotationDeg : targetInst.rotationDeg;
  const nextFlipX = updates.flipX !== undefined ? updates.flipX : targetInst.flipX;
  const nextFlipY = updates.flipY !== undefined ? updates.flipY : targetInst.flipY;
  const nextCol = updates.col !== undefined ? updates.col : targetInst.col;
  const nextRow = updates.row !== undefined ? updates.row : targetInst.row;
  const nextSettings: ChunkAdjustableSettings = {
    ...targetInst.settings,
    ...(updates.settings || {}),
    customParameters: {
      ...(targetInst.settings?.customParameters || {}),
      ...(updates.settings?.customParameters || {})
    }
  };
  const nextSlotOverrides: Record<string, ChunkSlotOverride> = {
    ...(targetInst.slotOverrides || {}),
    ...(updates.slotOverrides || {})
  };

  const compiled = compileChunkToMapElements(blueprint, {
    instanceId: targetInst.instanceId,
    targetCol: nextCol,
    targetRow: nextRow,
    gridSize: targetInst.gridSize || 50,
    rotationDeg: nextRotation,
    flipX: nextFlipX,
    flipY: nextFlipY,
    settings: nextSettings,
    slotOverrides: nextSlotOverrides,
    elementCustomizations: targetInst.elementCustomizations || {}
  });

  // Replace elements belonging to this chunk instance
  const nextTerrains = [
    ...(mapData.terrains || []).filter((t: any) => t.chunkInstanceId !== instanceId),
    ...compiled.terrains
  ];
  const nextWalls = [
    ...(mapData.walls || []).filter((w: any) => w.chunkInstanceId !== instanceId),
    ...compiled.walls
  ];
  const nextObjects = [
    ...(mapData.objects || []).filter((o: any) => o.chunkInstanceId !== instanceId),
    ...compiled.objects
  ];
  const nextLights = [
    ...(mapData.lights || []).filter((l: any) => l.chunkInstanceId !== instanceId),
    ...compiled.lights
  ];
  const nextInstances = instances.map((inst) =>
    inst.instanceId === instanceId ? compiled.instanceRecord : inst
  );

  return {
    ...mapData,
    terrains: nextTerrains,
    walls: nextWalls,
    objects: nextObjects,
    lights: nextLights,
    chunkInstances: nextInstances
  };
}

/**
 * Unpacks ("explodes") a PlacedChunkInstance into standalone map tiles, walls, objects, and lights
 * by stripping chunkInstanceId bindings and removing the instance record.
 */
export function explodeChunkInstance(mapData: any, instanceId: string): any {
  const stripTag = (el: any) => {
    if (el.chunkInstanceId !== instanceId) return el;
    const copy = { ...el };
    delete copy.chunkInstanceId;
    delete copy.chunkSubKey;
    return copy;
  };

  return {
    ...mapData,
    terrains: (mapData.terrains || []).map(stripTag),
    walls: (mapData.walls || []).map(stripTag),
    objects: (mapData.objects || []).map(stripTag),
    lights: (mapData.lights || []).map(stripTag),
    chunkInstances: (mapData.chunkInstances || []).filter(
      (inst: PlacedChunkInstance) => inst.instanceId !== instanceId
    )
  };
}

/**
 * Deletes an entire placed chunk instance and all its child elements from a map.
 */
export function deletePlacedChunkInstance(mapData: any, instanceId: string): any {
  return {
    ...mapData,
    terrains: (mapData.terrains || []).filter((t: any) => t.chunkInstanceId !== instanceId),
    walls: (mapData.walls || []).filter((w: any) => w.chunkInstanceId !== instanceId),
    objects: (mapData.objects || []).filter((o: any) => o.chunkInstanceId !== instanceId),
    lights: (mapData.lights || []).filter((l: any) => l.chunkInstanceId !== instanceId),
    chunkInstances: (mapData.chunkInstances || []).filter(
      (inst: PlacedChunkInstance) => inst.instanceId !== instanceId
    )
  };
}

/**
 * Extracts a rectangular region of an existing map into a reusable MapChunkBlueprint.
 */
export function extractChunkFromMapSelection(
  mapData: any,
  selectionBoundsPx: { x: number; y: number; width: number; height: number },
  gridSize = 50,
  metadata: {
    name: string;
    category?: any;
    description?: string;
    scale?: string;
  }
): MapChunkBlueprint {
  const minCol = Math.floor(selectionBoundsPx.x / gridSize);
  const minRow = Math.floor(selectionBoundsPx.y / gridSize);
  const maxCol = Math.max(
    minCol + 1,
    Math.ceil((selectionBoundsPx.x + selectionBoundsPx.width) / gridSize)
  );
  const maxRow = Math.max(
    minRow + 1,
    Math.ceil((selectionBoundsPx.y + selectionBoundsPx.height) / gridSize)
  );

  const widthCells = Math.min(64, Math.max(1, maxCol - minCol));
  const heightCells = Math.min(64, Math.max(1, maxRow - minRow));
  const originX = minCol * gridSize;
  const originY = minRow * gridSize;
  const maxPxX = originX + widthCells * gridSize;
  const maxPxY = originY + heightCells * gridSize;

  // 1. Extract tiles
  const tiles: ChunkTileCell[] = [];
  const coveredCells = new Set<string>();

  for (const t of mapData.terrains || []) {
    if (t.renderType === 'rect' || (t.x !== undefined && t.y !== undefined)) {
      const tw = t.width || gridSize;
      const th = t.height || gridSize;
      const startCol = Math.floor((t.x - originX) / gridSize);
      const startRow = Math.floor((t.y - originY) / gridSize);
      const endCol = Math.ceil((t.x + tw - originX) / gridSize);
      const endRow = Math.ceil((t.y + th - originY) / gridSize);

      for (let c = Math.max(0, startCol); c < Math.min(widthCells, endCol); c++) {
        for (let r = Math.max(0, startRow); r < Math.min(heightCells, endRow); r++) {
          const key = `${c},${r}`;
          if (coveredCells.has(key)) continue;
          coveredCells.add(key);
          tiles.push({
            col: c,
            row: r,
            terrainTypeId: t.type || 'steelGrating',
            label: t.label || 'Floor Tile',
            material: t.material || 'metal_deck',
            color: t.color || '#334155',
            textureUrl: t.textureUrl,
            isLiquid: Boolean(t.isLiquid),
            liquidType: t.liquidType,
            hazardType: t.hazardType,
            movementCost: t.movementCost ?? 1,
            elevationOffsetFt: t.elevationOffsetFt ?? 0
          });
        }
      }
    }
  }

  // 2. Extract walls inside bounds
  const walls: ChunkWallSegment[] = [];
  const constructionPoints: ChunkConstructionPoint[] = [];

  for (const w of mapData.walls || []) {
    if (!w.p1 || !w.p2) continue;
    const inBounds1 =
      w.p1.x >= originX - 4 &&
      w.p1.x <= maxPxX + 4 &&
      w.p1.y >= originY - 4 &&
      w.p1.y <= maxPxY + 4;
    const inBounds2 =
      w.p2.x >= originX - 4 &&
      w.p2.x <= maxPxX + 4 &&
      w.p2.y >= originY - 4 &&
      w.p2.y <= maxPxY + 4;
    if (!inBounds1 || !inBounds2) continue;

    const lx1 = Number(((w.p1.x - originX) / gridSize).toFixed(2));
    const ly1 = Number(((w.p1.y - originY) / gridSize).toFixed(2));
    const lx2 = Number(((w.p2.x - originX) / gridSize).toFixed(2));
    const ly2 = Number(((w.p2.y - originY) / gridSize).toFixed(2));

    let cardinalEdge: CardinalEdge | undefined;
    if (Math.abs(ly1) < 0.05 && Math.abs(ly2) < 0.05) cardinalEdge = 'north';
    else if (Math.abs(ly1 - heightCells) < 0.05 && Math.abs(ly2 - heightCells) < 0.05)
      cardinalEdge = 'south';
    else if (Math.abs(lx1 - widthCells) < 0.05 && Math.abs(lx2 - widthCells) < 0.05)
      cardinalEdge = 'east';
    else if (Math.abs(lx1) < 0.05 && Math.abs(lx2) < 0.05) cardinalEdge = 'west';

    walls.push({
      id: `w_${walls.length + 1}`,
      p1: { x: lx1, y: ly1 },
      p2: { x: lx2, y: ly2 },
      type: w.type || 'solid',
      label: w.label || 'Bulkhead Wall',
      doorState: w.doorState || null,
      breachHp: w.breachHp ?? 120,
      maxBreachHp: w.maxBreachHp ?? 120,
      hackDc: w.hackDc ?? null,
      athleticsDc: w.athleticsDc ?? 20,
      color: w.color,
      isSecret: Boolean(w.isSecret),
      cardinalEdge
    });

    // Automatically create a Perimeter Snap Socket if a door lies on the outer boundary
    if (w.type === 'door' && cardinalEdge) {
      const cellOffset =
        cardinalEdge === 'north' || cardinalEdge === 'south'
          ? Math.round(Math.min(lx1, lx2))
          : Math.round(Math.min(ly1, ly2));
      const spanCells = Math.max(
        1,
        Math.round(Math.hypot(lx2 - lx1, ly2 - ly1))
      );
      const anchor = getSocketGridAnchor(
        cardinalEdge,
        cellOffset,
        widthCells,
        heightCells
      );
      constructionPoints.push({
        id: `sock_${constructionPoints.length + 1}`,
        label: `${cardinalEdge.toUpperCase()} Door Socket`,
        kind: 'perimeter_socket',
        col: anchor.col,
        row: anchor.row,
        edge: cardinalEdge,
        cellOffset,
        spanCells,
        socketType: 'bulkhead_door',
        autoSpawnDoor: true,
        defaultDoorType: 'bulkhead',
        doorLockDc: w.hackDc || 14,
        breachHp: w.breachHp || 60,
        footprintCells: [1, 1],
        defaultAssetId: null,
        defaultShape: 'rect',
        defaultColor: '#f59e0b',
        rotationDeg: 0,
        allowOverride: true,
        assignedProperties: {}
      });
    }
  }

  // 3. Extract objects/assets inside bounds
  const assets: ChunkPlacedAsset[] = [];
  for (const o of mapData.objects || []) {
    if (o.x < originX || o.x > maxPxX || o.y < originY || o.y > maxPxY) continue;
    const wCells = Math.max(1, Math.round((o.width || gridSize) / gridSize));
    const hCells = Math.max(1, Math.round((o.height || gridSize) / gridSize));
    const col = Math.max(
      0,
      Math.min(widthCells - wCells, Math.floor((o.x - originX) / gridSize))
    );
    const row = Math.max(
      0,
      Math.min(heightCells - hCells, Math.floor((o.y - originY) / gridSize))
    );

    assets.push({
      id: `asset_${assets.length + 1}`,
      col,
      row,
      widthCells: wCells,
      heightCells: hCells,
      offsetX: 0,
      offsetY: 0,
      rotationDeg: o.rotation || 0,
      flipX: Boolean(o.flipX),
      flipY: Boolean(o.flipY),
      keepUpright: Boolean(o.keepUpright),
      type: o.type || 'doodad',
      label: o.label || 'Tactical Prop',
      category: o.category || 'Objects',
      shape: o.shape || 'rect',
      color: o.color || '#38bdf8',
      imageUrl: o.imageUrl,
      scaleTarget: o.scaleTarget || null,
      hazard: o.hazard || null,
      resource: o.resource || null,
      isInteractive: Boolean(o.isInteractive),
      isTrap: Boolean(o.isTrap),
      coverRating: o.coverRating || 'none',
      arcFacingDeg: o.arcFacingDeg
    });
  }

  // 4. Extract lights inside bounds
  const lights: ChunkLightEmitter[] = [];
  for (const l of mapData.lights || []) {
    if (l.x < originX || l.x > maxPxX || l.y < originY || l.y > maxPxY) continue;
    const col = Math.max(0, Math.min(widthCells - 1, Math.floor((l.x - originX) / gridSize)));
    const row = Math.max(0, Math.min(heightCells - 1, Math.floor((l.y - originY) / gridSize)));
    lights.push({
      id: `light_${lights.length + 1}`,
      col,
      row,
      offsetX: 0.5,
      offsetY: 0.5,
      radiusCells: Number(((l.radius || gridSize * 3) / gridSize).toFixed(1)),
      color: l.color || '#38bdf8',
      intensity: l.intensity ?? 0.85,
      animation: l.animation || 'steady',
      label: l.label
    });
  }

  return createDefaultMapChunk({
    chunkId: `chunk_custom_${Date.now()}`,
    name: metadata.name || 'Captured Map Chunk',
    description:
      metadata.description || `Captured ${widthCells}x${heightCells} prefab from map canvas.`,
    category: metadata.category || 'custom',
    scale: metadata.scale || mapData.type || 'Interior',
    widthCells,
    heightCells,
    baseCellSizePx: gridSize,
    northSide: 'N',
    tiles,
    walls,
    assets,
    lights,
    constructionPoints,
    isCustom: true,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Generates an inline SVG data URL thumbnail for a MapChunkBlueprint
 */
export function renderChunkThumbnailDataUrl(blueprint: MapChunkBlueprint): string {
  const W = Math.max(1, blueprint.widthCells || 6);
  const H = Math.max(1, blueprint.heightCells || 6);
  const cellPx = 24;
  const pad = 12;
  const svgW = W * cellPx + pad * 2;
  const svgH = H * cellPx + pad * 2;

  const tileRects = (blueprint.tiles || [])
    .map(
      (t) =>
        `<rect x="${pad + t.col * cellPx}" y="${pad + t.row * cellPx}" width="${cellPx}" height="${cellPx}" fill="${
          t.color || '#334155'
        }" stroke="#1e293b" stroke-width="1" />`
    )
    .join('');

  const wallLines = (blueprint.walls || [])
    .map((w) => {
      const x1 = pad + w.p1.x * cellPx;
      const y1 = pad + w.p1.y * cellPx;
      const x2 = pad + w.p2.x * cellPx;
      const y2 = pad + w.p2.y * cellPx;
      const stroke =
        w.type === 'door' ? '#f59e0b' : w.type === 'window' ? '#38bdf8' : '#e2e8f0';
      const dash = w.type === 'door' ? 'stroke-dasharray="4,2"' : '';
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="3" stroke-linecap="round" ${dash} />`;
    })
    .join('');

  const assetShapes = (blueprint.assets || [])
    .map((a) => {
      const cx = pad + (a.col + (a.widthCells || 1) / 2) * cellPx;
      const cy = pad + (a.row + (a.heightCells || 1) / 2) * cellPx;
      const r = Math.max(4, (Math.min(a.widthCells || 1, a.heightCells || 1) * cellPx) / 3);
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${a.color || '#38bdf8'}" stroke="#0f172a" stroke-width="1.5" />`;
    })
    .join('');

  const cpMarkers = (blueprint.constructionPoints || [])
    .map((cp) => {
      if (cp.kind === 'perimeter_socket') {
        const cx = pad + ((cp.col || 0) + 0.5) * cellPx;
        const cy = pad + ((cp.row || 0) + 0.5) * cellPx;
        return `<rect x="${cx - 4}" y="${cy - 4}" width="8" height="8" fill="#10b981" stroke="#052e16" stroke-width="1" />`;
      }
      const cx = pad + ((cp.col || 0) + 0.5) * cellPx;
      const cy = pad + ((cp.row || 0) + 0.5) * cellPx;
      return `<polygon points="${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}" fill="#22d3ee" stroke="#083344" stroke-width="1" />`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">
    <rect width="100%" height="100%" fill="#0f172a" rx="6" />
    ${tileRects}
    ${assetShapes}
    ${wallLines}
    ${cpMarkers}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
