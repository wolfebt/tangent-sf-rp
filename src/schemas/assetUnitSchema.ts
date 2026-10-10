/**
 * @file assetUnitSchema.ts
 * @description Canonical Polymorphic AssetUnit Schema for Tangent SF Cartography.
 * Validates all map assets: terrain brushes, doodads, tokens, creatures,
 * vehicles, hazards, and wall portals with exhaustive VTT metadata.
 */

import { z } from 'zod';

export const ASSET_CATEGORIES = [
  'terrain_brush',
  'doodad',
  'token',
  'creature',
  'vehicle',
  'hazard',
  'wall_portal'
] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];
export const AssetCategorySchema = z.enum(ASSET_CATEGORIES);

export const AUTO_TILE_ALGORITHMS = [
  'none',
  'marching_squares_4bit',
  'marching_squares_8bit',
  'wang_tiles'
] as const;
export type AutoTileAlgorithm = (typeof AUTO_TILE_ALGORITHMS)[number];
export const AutoTileAlgorithmSchema = z.enum(AUTO_TILE_ALGORITHMS);

export const STAGE_Z_LAYERS = [
  'background_map',      // ZLayer 0
  'underlay_debris',     // ZLayer 10
  'interactive_objects', // ZLayer 15
  'tokens',              // ZLayer 20
  'roof_canopy',         // ZLayer 30
  'dynamic_fx',          // ZLayer 40
  'lighting_darkness',   // ZLayer 50
  'fog_of_war',          // ZLayer 60
  'foreground_ui'       // ZLayer 70
] as const;
export type StageZLayerName = (typeof STAGE_Z_LAYERS)[number];
export const StageZLayerNameSchema = z.enum(STAGE_Z_LAYERS);

export const SURFACE_MATERIALS = [
  'metal_deck',
  'stone_masonry',
  'dirt_packed',
  'sand_loose',
  'water_shallow',
  'water_deep',
  'ice_slick',
  'organic_flesh',
  'plasma_fluid',
  'acid_corrosive',
  'glass_translucent'
] as const;
export type SurfaceMaterialType = (typeof SURFACE_MATERIALS)[number];
export const SurfaceMaterialTypeSchema = z.enum(SURFACE_MATERIALS);

export const COVER_RATINGS = [
  'none',
  'quarter_cover',
  'half_cover',
  'three_quarters',
  'full_cover'
] as const;
export type CoverRating = (typeof COVER_RATINGS)[number];
export const CoverRatingSchema = z.enum(COVER_RATINGS);

// Visual Variants & Shader Customization Schema
export const VisualVariantsSchema = z.object({
  thumbnail: z.string().default(''),
  baseTexture: z.string().default(''),
  variants: z.array(z.string()).default([]),
  normalMap: z.string().optional(),
  roughnessMap: z.string().optional(),
  auto_tile: AutoTileAlgorithmSchema.default('none'),
  customization: z.object({
    tintColor: z.string().optional(),
    hueRotation: z.number().min(0).max(360).optional(),
    saturation: z.number().min(0).max(5).optional(),
    brightness: z.number().min(0).max(5).optional(),
    contrast: z.number().min(0).max(5).optional()
  }).optional(),
  stateTextures: z.object({
    pristine: z.string().optional(),
    damaged: z.string().optional(),
    destroyed: z.string().optional(),
    overgrown: z.string().optional(),
    corrupted: z.string().optional()
  }).optional()
});
export type VisualVariants = z.infer<typeof VisualVariantsSchema>;

// Category-Specific Sub-Properties Schemas
export const TerrainPropertiesSchema = z.object({
  material: SurfaceMaterialTypeSchema.default('metal_deck'),
  movementCost: z.number().min(0).default(1),
  slipperyFriction: z.number().min(0).max(2).default(1.0),
  footstepSfxCategory: z.string().default('footstep_metal'),
  elevationOffsetFt: z.number().optional()
});
export type TerrainProperties = z.infer<typeof TerrainPropertiesSchema>;

export const DoodadPropertiesSchema = z.object({
  cover: CoverRatingSchema.default('none'),
  isDestructible: z.boolean().default(false),
  structureHp: z.number().optional(),
  armorDr: z.object({
    kinetic: z.number().default(0),
    energy: z.number().default(0)
  }).optional(),
  breakDc: z.number().optional(),
  isContainer: z.boolean().default(false),
  containerDetails: z.object({
    isLocked: z.boolean().default(false),
    lockType: z.enum(['physical', 'electronic', 'biometric']).optional(),
    hackDc: z.number().optional(),
    lootTableId: z.string().optional()
  }).optional(),
  interactionTrigger: z.object({
    type: z.enum(['trap', 'terminal', 'switch', 'lore_station']),
    dcCheck: z.number().optional(),
    actionEvent: z.string().optional(),
    gmSecretNotes: z.string().optional()
  }).optional()
});
export type DoodadProperties = z.infer<typeof DoodadPropertiesSchema>;

export const WallPortalPropertiesSchema = z.object({
  wallType: z.enum(['solid_titanium', 'blast_bulkhead', 'reinforced_glass', 'energy_shield', 'mesh_grate']).default('solid_titanium'),
  isDoor: z.boolean().default(false),
  doorType: z.enum(['sliding', 'swinging', 'iris', 'portcullis']).optional(),
  doorState: z.enum(['open', 'closed', 'locked', 'jammed']).optional(),
  blocksLight: z.boolean().default(true),
  blocksSensors: z.boolean().default(true),
  blocksMovement: z.boolean().default(true),
  soundMuffleFactor: z.number().min(0).max(1).default(0.8)
});
export type WallPortalProperties = z.infer<typeof WallPortalPropertiesSchema>;

export const DynamicLightPropertiesSchema = z.object({
  emits: z.boolean().default(false),
  color: z.string().default('#ffffff'),
  intensity: z.number().min(0).max(5).default(1.0),
  radiusBrightFt: z.number().min(0).default(10),
  radiusDimFt: z.number().min(0).default(20),
  castsShadows: z.boolean().default(true),
  animation: z.enum(['solid', 'torch_flicker', 'pulse', 'emergency_strobe', 'fluorescent_flicker', 'plasma_churn']).default('solid'),
  offsetCoords: z.tuple([z.number(), z.number()]).optional()
});
export type DynamicLightProperties = z.infer<typeof DynamicLightPropertiesSchema>;

export const HazardPropertiesSchema = z.object({
  hazardType: z.enum(['thermal_fire', 'acid_corrosive', 'plasma_leak', 'radiation_leak', 'biohazard_spore', 'vacuum']).default('plasma_leak'),
  damageFormula: z.string().default('2d10+4 plasma'),
  triggerTiming: z.enum(['on_enter', 'on_turn_start', 'on_turn_end', 'continuous']).default('on_enter'),
  saveDc: z.object({
    attribute: z.string(),
    target: z.number()
  }).optional(),
  particlePreset: z.string().optional()
});
export type HazardProperties = z.infer<typeof HazardPropertiesSchema>;

export const VehicleHullPropertiesSchema = z.object({
  hullDr: z.object({
    kinetic: z.number().default(10),
    energy: z.number().default(8)
  }).default({ kinetic: 10, energy: 8 }),
  structureMaxHp: z.number().default(100),
  speedMph: z.number().default(60),
  handlingModifier: z.number().default(0),
  passengerNodes: z.array(z.object({
    id: z.string(),
    role: z.enum(['pilot', 'copilot', 'gunner', 'passenger', 'cargo']),
    cellOffset: z.tuple([z.number(), z.number()]),
    zOverride: StageZLayerNameSchema.optional()
  })).default([]),
  hardpointSockets: z.array(z.object({
    slotId: z.string(),
    tier: z.enum(['node', 'socket', 'mount', 'module']),
    relativeCoords: z.tuple([z.number(), z.number()]),
    arcFacingDegrees: z.number().default(0)
  })).default([])
});
export type VehicleHullProperties = z.infer<typeof VehicleHullPropertiesSchema>;

export const TokenEntityPropertiesSchema = z.object({
  dbmId: z.string().optional(),
  sizeCategory: z.enum(['Fine', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal']).default('Medium'),
  visionCone: z.object({
    type: z.enum(['standard', 'darkvision', 'thermal', 'omni']).default('standard'),
    rangeFt: z.number().default(60),
    arcDegrees: z.number().default(360)
  }).default({ type: 'standard', rangeFt: 60, arcDegrees: 360 }),
  disposition: z.enum(['friendly', 'neutral', 'hostile', 'secret']).default('neutral'),
  standeeElevationHeight3d: z.number().optional()
});
export type TokenEntityProperties = z.infer<typeof TokenEntityPropertiesSchema>;

export const ScatterRulesSchema = z.object({
  allow_rotation: z.boolean().default(true),
  scale_variance: z.tuple([z.number(), z.number()]).default([0.9, 1.1]),
  avoid_center: z.boolean().default(false),
  cluster_affinity: z.boolean().default(false),
  clearance_radius_cells: z.number().default(0)
});
export type ScatterRules = z.infer<typeof ScatterRulesSchema>;

export const TRIGGER_TYPES = [
  'step_on',
  'proximity',
  'interact',
  'manual',
  'turn_start'
] as const;
export type TriggerType = (typeof TRIGGER_TYPES)[number];
export const TriggerTypeSchema = z.enum(TRIGGER_TYPES);

export const SAVE_TYPES = [
  'Reflex (AGI)',
  'Fortitude (STA)',
  'Tech (INT)',
  'Will (WIL)',
  'none'
] as const;
export type SaveType = (typeof SAVE_TYPES)[number];
export const SaveTypeSchema = z.enum(SAVE_TYPES);

export const TRIGGER_CONDITIONS = [
  'none',
  'Burning',
  'Stunned',
  'Poisoned',
  'Blinded',
  'Prone',
  'Suppressed',
  'Emp'
] as const;
export type TriggerCondition = (typeof TRIGGER_CONDITIONS)[number];
export const TriggerConditionSchema = z.enum(TRIGGER_CONDITIONS);

export const TriggerDefinitionSchema = z.object({
  enabled: z.boolean().default(false),
  triggerType: TriggerTypeSchema.default('step_on'),
  triggerRadiusFt: z.number().min(0).default(5),
  saveType: SaveTypeSchema.default('Reflex (AGI)'),
  saveDc: z.number().default(14),
  damageFormula: z.string().optional(),
  damageType: z.enum(['plasma', 'energy', 'kinetic', 'chemical', 'thermal', 'emp', 'lethal']).default('plasma'),
  appliedCondition: TriggerConditionSchema.default('none'),
  disarmDc: z.number().optional(),
  detectionDc: z.number().optional(),
  sfx: z.string().optional(),
  gmSecretNotes: z.string().optional(),
  oneShot: z.boolean().default(true)
});
export type TriggerDefinition = z.infer<typeof TriggerDefinitionSchema>;

export const SCRIPT_HOOKS = [
  'on_trigger',
  'on_interact',
  'on_turn_start',
  'on_destruct',
  'manual'
] as const;
export type ScriptHook = (typeof SCRIPT_HOOKS)[number];
export const ScriptHookSchema = z.enum(SCRIPT_HOOKS);

export const ScriptDefinitionSchema = z.object({
  enabled: z.boolean().default(false),
  autorun: z.boolean().default(false),
  executionHook: ScriptHookSchema.default('on_interact'),
  sourceCode: z.string().default('// QuickJS Macro Script\n// Available: Dice, MathOps, Trauma, StoryFlags, context\n\nconst roll = Dice.check2d10(2, 14);\nif (roll.success) {\n  StoryFlags.set("power_active", true);\n}\n'),
  timeoutMs: z.number().default(500)
});
export type ScriptDefinition = z.infer<typeof ScriptDefinitionSchema>;

// Full Polymorphic AssetUnit Schema
export const AssetUnitSchema = z.object({
  unit_id: z.string(),
  name: z.string(),
  category: AssetCategorySchema,
  tree_path: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  dimensions: z.tuple([z.number(), z.number()]).default([1, 1]),
  anchorPoint: z.tuple([z.number(), z.number()]).default([0.5, 0.5]),
  
  provenance: z.object({
    source: z.enum(['preset', 'custom_upload', 'dlc_pack', 'omnicortex_dbm']).default('preset'),
    author: z.string().optional(),
    packId: z.string().optional(),
    license: z.string().optional(),
    dateAdded: z.string().default(() => new Date().toISOString())
  }).default({ source: 'preset', dateAdded: new Date().toISOString() }),
  
  visuals: VisualVariantsSchema,
  
  vtt_properties: z.object({
    blocks_movement: z.boolean().default(false),
    blocks_vision: z.boolean().default(false),
    z_index_layer: StageZLayerNameSchema.default('interactive_objects'),
    customCollisionPolygon: z.array(z.tuple([z.number(), z.number()])).optional(),
    terrain: TerrainPropertiesSchema.optional(),
    doodad: DoodadPropertiesSchema.optional(),
    wallPortal: WallPortalPropertiesSchema.optional(),
    dynamicLighting: DynamicLightPropertiesSchema.optional(),
    hazard: HazardPropertiesSchema.optional(),
    vehicleHull: VehicleHullPropertiesSchema.optional(),
    tokenEntity: TokenEntityPropertiesSchema.optional(),
    trigger: TriggerDefinitionSchema.optional(),
    script: ScriptDefinitionSchema.optional()
  }),
  
  scatter_rules: ScatterRulesSchema.optional()
});

export type AssetUnit = z.infer<typeof AssetUnitSchema>;

/**
 * Creates a default, validated AssetUnit with sensible defaults.
 */
export function createDefaultAssetUnit(partial: Partial<AssetUnit> & { unit_id: string; name: string; category: AssetCategory }): AssetUnit {
  const defaultUnit: AssetUnit = {
    unit_id: partial.unit_id,
    name: partial.name,
    category: partial.category,
    tree_path: partial.tree_path || ['Unsorted', partial.category],
    tags: partial.tags || [partial.category],
    dimensions: partial.dimensions || [1, 1],
    anchorPoint: partial.anchorPoint || [0.5, 0.5],
    provenance: {
      source: partial.provenance?.source || 'preset',
      author: partial.provenance?.author || 'Tangent SF',
      packId: partial.provenance?.packId,
      license: partial.provenance?.license || 'CC-BY-4.0',
      dateAdded: partial.provenance?.dateAdded || new Date().toISOString()
    },
    visuals: {
      thumbnail: partial.visuals?.thumbnail || '',
      baseTexture: partial.visuals?.baseTexture || '',
      variants: partial.visuals?.variants || [],
      auto_tile: partial.visuals?.auto_tile || 'none',
      customization: partial.visuals?.customization,
      stateTextures: partial.visuals?.stateTextures
    },
    vtt_properties: {
      blocks_movement: partial.vtt_properties?.blocks_movement ?? false,
      blocks_vision: partial.vtt_properties?.blocks_vision ?? false,
      z_index_layer: partial.vtt_properties?.z_index_layer || (partial.category === 'terrain_brush' ? 'background_map' : 'interactive_objects'),
      customCollisionPolygon: partial.vtt_properties?.customCollisionPolygon,
      terrain: partial.vtt_properties?.terrain,
      doodad: partial.vtt_properties?.doodad,
      wallPortal: partial.vtt_properties?.wallPortal,
      dynamicLighting: partial.vtt_properties?.dynamicLighting,
      hazard: partial.vtt_properties?.hazard,
      vehicleHull: partial.vtt_properties?.vehicleHull,
      tokenEntity: partial.vtt_properties?.tokenEntity,
      trigger: partial.vtt_properties?.trigger,
      script: partial.vtt_properties?.script
    },
    scatter_rules: partial.scatter_rules
  };

  return AssetUnitSchema.parse(defaultUnit);
}

/**
 * Validates a raw object against AssetUnitSchema safely.
 */
export function validateAssetUnit(raw: unknown): { success: boolean; data?: AssetUnit; error?: z.ZodError } {
  const result = AssetUnitSchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
