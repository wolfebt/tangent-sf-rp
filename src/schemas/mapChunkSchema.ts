/**
 * @file mapChunkSchema.ts
 * @description Canonical Schema & Type Definitions for the Hybrid Chunk / Tile System.
 * Supports reusable multi-tile MapChunkBlueprints, Perimeter Snap Sockets,
 * Internal Construction Points (Hardpoints/Slots), Adjustable Assigned Properties,
 * Dihedral D4 (90° CW North-Side Rotation & Horizontal/Vertical Flip) transformations,
 * and non-destructive PlacedChunkInstances.
 */

import { z } from 'zod';

export const CHUNK_CATEGORIES = [
  'room_module',
  'corridor_junction',
  'starship_compartment',
  'perimeter_defense',
  'hazard_setpiece',
  'urban_block',
  'natural_formation',
  'custom'
] as const;
export type ChunkCategory = (typeof CHUNK_CATEGORIES)[number];
export const ChunkCategorySchema = z.enum(CHUNK_CATEGORIES);

export const CHUNK_CATEGORY_LABELS: Record<ChunkCategory, string> = {
  room_module: 'Room Modules',
  corridor_junction: 'Corridors & Junctions',
  starship_compartment: 'Starship Compartments',
  perimeter_defense: 'Perimeter & Bunkers',
  hazard_setpiece: 'Hazards & Setpieces',
  urban_block: 'Urban & Settlement',
  natural_formation: 'Caverns & Natural',
  custom: 'Custom Blueprints'
};

export const CARDINAL_EDGES = ['north', 'east', 'south', 'west'] as const;
export type CardinalEdge = (typeof CARDINAL_EDGES)[number];
export const CardinalEdgeSchema = z.enum(CARDINAL_EDGES);

export const NORTH_FACING_DIRECTIONS = ['N', 'E', 'S', 'W'] as const;
export type NorthFacingDirection = (typeof NORTH_FACING_DIRECTIONS)[number];
export const NorthFacingDirectionSchema = z.enum(NORTH_FACING_DIRECTIONS);

export type ChunkRotationDeg = 0 | 90 | 180 | 270;

export function getNorthCardinalDirection(rotationDeg: ChunkRotationDeg = 0): NorthFacingDirection {
  const normalized = (((rotationDeg % 360) + 360) % 360) as ChunkRotationDeg;
  if (normalized === 90) return 'E';
  if (normalized === 180) return 'S';
  if (normalized === 270) return 'W';
  return 'N';
}

export function getNorthIndicatorLabel(
  rotationDeg: ChunkRotationDeg = 0,
  flipX = false,
  flipY = false
): string {
  const dir = getNorthCardinalDirection(rotationDeg);
  const arrow = dir === 'N' ? '▲' : dir === 'E' ? '▶' : dir === 'S' ? '▼' : '◀';
  const flipTags = [flipX ? 'FlipH' : '', flipY ? 'FlipV' : ''].filter(Boolean).join('+');
  return `NORTH ${arrow} (${dir})${flipTags ? ` [${flipTags}]` : ''}`;
}

export const SOCKET_TYPES = [
  'corridor_1x',
  'corridor_2x',
  'airlock',
  'bulkhead_door',
  'open_arch',
  'vent_duct',
  'power_conduit',
  'wall_seam'
] as const;
export type SocketType = (typeof SOCKET_TYPES)[number];
export const SocketTypeSchema = z.enum(SOCKET_TYPES);

export const INTERNAL_SLOT_CATEGORIES = [
  'prop_mount',
  'turret_hardpoint',
  'terminal_node',
  'loot_cache',
  'hazard_emitter',
  'unit_spawn'
] as const;
export type InternalSlotCategory = (typeof INTERNAL_SLOT_CATEGORIES)[number];
export const InternalSlotCategorySchema = z.enum(INTERNAL_SLOT_CATEGORIES);

export const CHUNK_POWER_STATES = [
  'nominal',
  'emergency',
  'unpowered',
  'overloaded'
] as const;
export type ChunkPowerState = (typeof CHUNK_POWER_STATES)[number];

export const CHUNK_CONDITION_STATES = [
  'pristine',
  'weathered',
  'battle_damaged',
  'breached',
  'xenomorph_hive'
] as const;
export type ChunkConditionState = (typeof CHUNK_CONDITION_STATES)[number];

export const CHUNK_BIOME_THEMES = [
  'chunk_default',
  'metal_deck',
  'ceramic_tile',
  'acoustic_stealth',
  'raw_cavern',
  'chitin_hive',
  'volcanic_basalt',
  'arctic_ice',
  'desert_sand',
  'corporate_atrium'
] as const;
export type ChunkBiomeTheme = (typeof CHUNK_BIOME_THEMES)[number];

// 1. Tile Cell inside a Chunk (relative 0-indexed col, row)
export const ChunkTileCellSchema = z.object({
  col: z.number().int().min(0),
  row: z.number().int().min(0),
  terrainTypeId: z.string().default('steelGrating'),
  label: z.string().default('Steel Grating'),
  material: z.string().default('metal_deck'),
  color: z.string().default('#334155'),
  textureUrl: z.string().optional(),
  isLiquid: z.boolean().default(false),
  liquidType: z.enum(['magma', 'acid', 'water', 'slime']).optional(),
  hazardType: z.string().optional(),
  movementCost: z.number().min(0).default(1),
  elevationOffsetFt: z.number().default(0),
  bitmask4Bit: z.number().int().min(0).max(15).optional(),
  bitmask8Bit: z.number().int().min(0).max(255).optional()
});
export type ChunkTileCell = z.input<typeof ChunkTileCellSchema>;

// 2. Wall or Portal Segment inside a Chunk (in local cell coordinates [0..W, 0..H])
export const ChunkWallSegmentSchema = z.object({
  id: z.string(),
  p1: z.object({ x: z.number(), y: z.number() }),
  p2: z.object({ x: z.number(), y: z.number() }),
  type: z.enum(['solid', 'door', 'window', 'ethereal', 'one_way']).default('solid'),
  label: z.string().default('Bulkhead Wall'),
  doorState: z.enum(['closed', 'open', 'locked', 'breached']).nullable().optional(),
  breachHp: z.number().default(120),
  maxBreachHp: z.number().default(120),
  hackDc: z.number().nullable().optional(),
  athleticsDc: z.number().default(20),
  color: z.string().optional(),
  isSecret: z.boolean().default(false),
  cardinalEdge: CardinalEdgeSchema.optional()
});
export type ChunkWallSegment = z.input<typeof ChunkWallSegmentSchema>;

// 3. Placed Asset / Object inside a Chunk (supports 1x1 and multi-cell footprints)
export const ChunkPlacedAssetSchema = z.object({
  id: z.string(),
  col: z.number().min(0),
  row: z.number().min(0),
  widthCells: z.number().min(0.25).default(1),
  heightCells: z.number().min(0.25).default(1),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  rotationDeg: z.number().default(0),
  flipX: z.boolean().default(false),
  flipY: z.boolean().default(false),
  keepUpright: z.boolean().default(false),
  type: z.string().default('doodad'),
  label: z.string().default('Tactical Asset'),
  category: z.string().default('Objects'),
  shape: z.enum(['rect', 'circle', 'hexagon', 'triangle', 'star', 'cloud', 'line']).default('rect'),
  color: z.string().default('#38bdf8'),
  radiusCells: z.number().optional(),
  imageUrl: z.string().optional(),
  scaleTarget: z.string().nullable().optional(),
  hazard: z.string().nullable().optional(),
  resource: z.string().nullable().optional(),
  isInteractive: z.boolean().default(false),
  isTrap: z.boolean().default(false),
  trapType: z.string().optional(),
  saveDc: z.number().optional(),
  damageFormula: z.string().optional(),
  coverRating: z.enum(['none', 'quarter_cover', 'half_cover', 'three_quarters', 'full_cover']).default('none'),
  arcFacingDeg: z.number().optional(),
  patrolWaypoints: z.array(z.object({ col: z.number(), row: z.number() })).optional(),
  storyElementId: z.string().optional(),
  omnicortexId: z.string().optional(),
  customProps: z.record(z.string(), z.any()).optional()
});
export type ChunkPlacedAsset = z.input<typeof ChunkPlacedAssetSchema>;

// 4. Dynamic Light Emitter inside a Chunk
export const ChunkLightEmitterSchema = z.object({
  id: z.string(),
  col: z.number().min(0),
  row: z.number().min(0),
  offsetX: z.number().default(0.5),
  offsetY: z.number().default(0.5),
  radiusCells: z.number().min(0.5).default(3.5),
  color: z.string().default('#38bdf8'),
  intensity: z.number().min(0).max(2).default(0.85),
  animation: z.enum(['steady', 'flicker', 'pulse', 'strobe', 'none']).default('steady'),
  label: z.string().optional()
});
export type ChunkLightEmitter = z.input<typeof ChunkLightEmitterSchema>;

// 5. Construction Point Assigned Properties Schema
export const ConstructionPointAssignedPropsSchema = z.object({
  isLocked: z.boolean().optional(),
  hackDc: z.number().optional(),
  athleticsDc: z.number().optional(),
  disarmDc: z.number().optional(),
  detectionDc: z.number().optional(),
  coverRating: z.enum(['none', 'quarter_cover', 'half_cover', 'three_quarters', 'full_cover']).optional(),
  breachHp: z.number().optional(),
  armorDr: z.number().optional(),
  factionDesignation: z.enum(['Player', 'Ally', 'Adversary', 'Neutral']).optional(),
  isArmed: z.boolean().optional(),
  triggerType: z.enum(['step_on', 'proximity', 'interact', 'manual', 'turn_start']).optional(),
  damageFormula: z.string().optional(),
  saveType: z.string().optional(),
  saveDc: z.number().optional(),
  storyElementId: z.string().optional(),
  omnicortexId: z.string().optional(),
  lootTableId: z.string().optional(),
  quickJsMacro: z.string().optional()
});
export type ConstructionPointAssignedProps = z.infer<typeof ConstructionPointAssignedPropsSchema>;

// 6. Construction Point (Perimeter Snap Socket OR Internal Hardpoint/Slot)
export const ChunkConstructionPointSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(['perimeter_socket', 'internal_slot']),

  // Grid coordinates (for internal_slot, or derived anchor for perimeter_socket)
  col: z.number().min(0).default(0),
  row: z.number().min(0).default(0),

  // Perimeter Snap Socket fields
  edge: CardinalEdgeSchema.optional(),
  cellOffset: z.number().min(0).optional(),
  spanCells: z.number().min(1).default(1),
  socketType: SocketTypeSchema.optional(),
  autoSpawnDoor: z.boolean().default(true),
  defaultDoorType: z.enum(['bulkhead', 'airlock', 'none']).default('bulkhead'),
  doorLockDc: z.number().default(14),
  breachHp: z.number().default(60),

  // Internal Construction Slot / Hardpoint fields
  slotCategory: InternalSlotCategorySchema.optional(),
  footprintCells: z.tuple([z.number(), z.number()]).default([1, 1]),
  defaultAssetId: z.string().nullable().default(null),
  defaultAssetLabel: z.string().optional(),
  defaultShape: z.enum(['rect', 'circle', 'hexagon', 'triangle', 'star', 'cloud', 'line']).default('rect'),
  defaultColor: z.string().default('#22d3ee'),
  rotationDeg: z.number().default(0),
  arcFacingDeg: z.number().optional(),
  allowOverride: z.boolean().default(true),
  assignedProperties: ConstructionPointAssignedPropsSchema.default({})
});
export type ChunkConstructionPoint = z.input<typeof ChunkConstructionPointSchema>;

// 7. Adjustable Chunk-Level Settings
export const ChunkAdjustableSettingsSchema = z.object({
  powerState: z.enum(CHUNK_POWER_STATES).default('nominal'),
  securityTier: z.number().int().min(1).max(5).default(2),
  conditionState: z.enum(CHUNK_CONDITION_STATES).default('pristine'),
  biomeThemeOverride: z.string().default('chunk_default'),
  customParameters: z.record(z.string(), z.any()).default({})
});
export type ChunkAdjustableSettings = z.infer<typeof ChunkAdjustableSettingsSchema>;

// 8. Custom Parameter Definition on Blueprint
export const ChunkCustomParameterDefSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['boolean', 'number', 'select', 'color', 'text']).default('boolean'),
  defaultValue: z.any(),
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  description: z.string().optional(),
  targetPointIds: z.array(z.string()).optional()
});
export type ChunkCustomParameterDef = z.infer<typeof ChunkCustomParameterDefSchema>;

// 9. Complete MapChunkBlueprint Schema
export const MapChunkBlueprintSchema = z.object({
  chunkId: z.string(),
  name: z.string(),
  description: z.string().default(''),
  category: ChunkCategorySchema.default('room_module'),
  scale: z.string().default('Interior'),
  gridMode: z.enum(['square', 'hex']).default('square'),
  widthCells: z.number().int().min(1).max(64).default(6),
  heightCells: z.number().int().min(1).max(64).default(6),
  baseCellSizePx: z.number().default(50),
  northSide: NorthFacingDirectionSchema.default('N'),

  tiles: z.array(ChunkTileCellSchema).default([]),
  walls: z.array(ChunkWallSegmentSchema).default([]),
  assets: z.array(ChunkPlacedAssetSchema).default([]),
  lights: z.array(ChunkLightEmitterSchema).default([]),
  constructionPoints: z.array(ChunkConstructionPointSchema).default([]),

  defaultSettings: ChunkAdjustableSettingsSchema.default({
    powerState: 'nominal',
    securityTier: 2,
    conditionState: 'pristine',
    biomeThemeOverride: 'chunk_default',
    customParameters: {}
  }),
  customParameterDefs: z.array(ChunkCustomParameterDefSchema).default([]),

  thumbnailUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isCustom: z.boolean().default(false),
  author: z.string().optional(),
  updatedAt: z.string().optional()
});
export type MapChunkBlueprint = Omit<
  z.infer<typeof MapChunkBlueprintSchema>,
  'tiles' | 'walls' | 'assets' | 'lights' | 'constructionPoints'
> & {
  tiles: ChunkTileCell[];
  walls: ChunkWallSegment[];
  assets: ChunkPlacedAsset[];
  lights: ChunkLightEmitter[];
  constructionPoints: ChunkConstructionPoint[];
};

// 10. Per-Slot Override on a Placed Chunk Instance
export interface ChunkSlotOverride {
  disabled?: boolean;
  assetId?: string | null;
  assetLabel?: string;
  shape?: 'rect' | 'circle' | 'hexagon' | 'triangle' | 'star' | 'cloud' | 'line';
  color?: string;
  rotationDeg?: number;
  arcFacingDeg?: number;
  assignedProperties?: Partial<ConstructionPointAssignedProps>;
}

// 11. Placed Chunk Instance stored on a Map
export interface PlacedChunkInstance {
  instanceId: string;
  chunkId: string;
  name: string;
  col: number;
  row: number;
  x: number;
  y: number;
  gridSize: number;
  rotationDeg: 0 | 90 | 180 | 270;
  flipX: boolean;
  flipY: boolean;
  northSide: NorthFacingDirection;
  effectiveWidthCells: number;
  effectiveHeightCells: number;
  settings: ChunkAdjustableSettings;
  slotOverrides: Record<string, ChunkSlotOverride>;
  elementCustomizations?: Record<string, Record<string, any>>;
  blueprintSnapshot?: MapChunkBlueprint;
}

/**
 * Helper to create a validated MapChunkBlueprint with defaults
 */
export function createDefaultMapChunk(
  partial: Partial<z.input<typeof MapChunkBlueprintSchema>> & { chunkId: string; name: string }
): MapChunkBlueprint {
  return MapChunkBlueprintSchema.parse({
    ...partial,
    chunkId: partial.chunkId,
    name: partial.name,
    category: partial.category || 'room_module',
    scale: partial.scale || 'Interior',
    gridMode: partial.gridMode || 'square',
    widthCells: partial.widthCells || 6,
    heightCells: partial.heightCells || 6,
    baseCellSizePx: partial.baseCellSizePx || 50,
    northSide: partial.northSide || 'N',
    tiles: partial.tiles || [],
    walls: partial.walls || [],
    assets: partial.assets || [],
    lights: partial.lights || [],
    constructionPoints: partial.constructionPoints || [],
    defaultSettings: {
      powerState: partial.defaultSettings?.powerState || 'nominal',
      securityTier: partial.defaultSettings?.securityTier ?? 2,
      conditionState: partial.defaultSettings?.conditionState || 'pristine',
      biomeThemeOverride: partial.defaultSettings?.biomeThemeOverride || 'chunk_default',
      customParameters: partial.defaultSettings?.customParameters || {}
    },
    customParameterDefs: partial.customParameterDefs || [],
    tags: partial.tags || []
  });
}

/**
 * Safe validation helper
 */
export function validateMapChunk(raw: unknown): {
  success: boolean;
  data?: MapChunkBlueprint;
  error?: z.ZodError;
} {
  const res = MapChunkBlueprintSchema.safeParse(raw);
  if (res.success) return { success: true, data: res.data };
  return { success: false, error: res.error };
}
