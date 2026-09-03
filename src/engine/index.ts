/**
 * @file index.ts
 * @description Tangent Next-Gen VTT Engine Exports
 */

// Stage 1: Core State, Relational OPFS & Network Sync
export { useEngineStore, selectFusedToken, selectAllFusedTokens } from './state/VolatileSharder.ts';
export type { StaticEntity, EphemeralState, FusedToken, EngineState } from './state/VolatileSharder.ts';
export { DBMBridge } from './state/DBMBridge.ts';
export type { OPFSWorkerAPI } from './state/DBMBridge.ts';

export type { DbRequest, DbResponse } from './database/OPFSDatabaseWorker.ts';

export { TelemetryClient, TELEMETRY_PAYLOAD_TYPES } from './network/LiveKitClient.ts';
export type { RemoteCursorState, RemoteDragGhostState, TelemetryPayloadType } from './network/LiveKitClient.ts';
export { YjsProviderBridge } from './network/YjsProviderBridge.ts';
export { FirestoreDebouncer } from './network/FirestoreDebouncer.ts';

// Stage 2: WebGPU Stage & Infinite Viewport Renderer
export { RendererContext } from './canvas/RendererContext.ts';
export { LayerCompositor, ZLayer } from './canvas/LayerCompositor.ts';
export { FrustumChunkManager, CHUNK_SIZE } from './canvas/FrustumChunkManager.ts';
export { 
  CoordinateEngine, 
  GridType, 
  GridScaleTier, 
  GRID_SCALE_CONFIGS, 
  TANGENT_BASE_CELL_FT, 
  TANGENT_BASE_MOVEMENT_FT 
} from './math/CoordinateEngine.ts';
export type { CubeCoord, PixelCoord, GridScaleConfig } from './math/CoordinateEngine.ts';
export { GCMonitor } from './memory/GCMonitor.ts';

// Stage 3: Vision, BVH & WGSL Compute Kernels
export { WGSLComputeContext } from './vision/WGSLComputeContext.ts';
export { BVHBuilder, BVHNode } from './vision/BVHBuilder.ts';
export type { WallSegment, Point2D, AABB } from './vision/BVHBuilder.ts';
export { FUSED_VISION_WGSL } from './vision/shaders/fused_vision.wgsl.ts';
export { SDF_CSG_CORE_WGSL } from './vision/shaders/sdf_csg_core.wgsl.ts';
export { ELEMENTAL_FLUID_WGSL } from './physics/shaders/elemental_fluid.wgsl.ts';
export { BOIDS_SWARM_WGSL } from './physics/shaders/boids_swarm.wgsl.ts';

// Stage 4: Story Foundry Ingestion, Interactive Objects & Cartography
export { FoundryIngestion } from './assets/FoundryIngestion.ts';
export type { SceneManifest, SceneInteractiveObject } from './assets/FoundryIngestion.ts';
export { InteractiveObjectManager } from './assets/InteractiveObjectManager.ts';
export type { InteractiveObjectState } from './assets/InteractiveObjectManager.ts';
export { cacheAssetInOPFS, getAssetFromOPFS, getMimeType } from './assets/OPFSCacheWorker.ts';
export { SpatialAudioGraph } from './audio/SpatialAudioGraph.ts';
export { NVectorCalculator, DEFAULT_PLANETARY_RADIUS_KM } from './cartography/NVectorCalculator.ts';
export type { LatLon, NVector } from './cartography/NVectorCalculator.ts';
export { AstrogationGenerator } from './cartography/AstrogationGenerator.ts';
export type { StarSystem, Hyperlane } from './cartography/AstrogationGenerator.ts';
export { BSPDeckplanGenerator, BSPNode } from './cartography/BSPDeckplanGenerator.ts';
export type { Rect } from './cartography/BSPDeckplanGenerator.ts';

// Stage 5: Tangent SF RP Rules Execution & Damage Pipelines
export { CharacterBuilder, MECHANICS_DB } from './rules/CharacterBuilder.ts';
export type { CharacterDraft, AttributeStats, SpeciesRule } from './rules/CharacterBuilder.ts';
export { CombatArbitrator, SkillRank, SizeCategory, RangeCategory } from './rules/CombatArbitrator.ts';
export type { ActionEconomyTier, RangeConfig } from './rules/CombatArbitrator.ts';
export { DamagePipeline } from './rules/DamagePipeline.ts';
export type { DamagePayload, DamageResult } from './rules/DamagePipeline.ts';
export { MechaSocketManager, TechLevel } from './rules/MechaSocketManager.ts';
export type { MechaChassis, Augmentation } from './rules/MechaSocketManager.ts';

// Stage 6: UI Glass-Cockpit HUD, Dice AST & Scripting
export type { DashboardOverlayProps } from './ui/DashboardOverlay.tsx';
export { DiceASTParser } from './math/DiceASTParser.ts';
export type { ASTNode } from './math/DiceASTParser.ts';
export { QuickJSSandbox } from './scripting/QuickJSSandbox.ts';
export type { SandboxRequest, SandboxResponse } from './scripting/QuickJSSandbox.ts';
export { EssenceTracker } from './rules/EssenceTracker.ts';
export type { OngoingSpellEffect } from './rules/EssenceTracker.ts';
