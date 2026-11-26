/**
 * @file index.ts
 * @description Tangent Next-Gen VTT Engine Exports
 */

// Stage 1: Core State, Relational OPFS & Network Sync
export { useEngineStore, selectFusedToken, selectAllFusedTokens, selectVehicle, selectAllVehicles } from './state/VolatileSharder.ts';
export type { StaticEntity, EphemeralState, ActiveEffectRecord, FusedToken, EngineState } from './state/VolatileSharder.ts';

export type { DbRequest, DbResponse } from './database/OPFSDatabaseWorker.ts';

export { TelemetryClient, TELEMETRY_PAYLOAD_TYPES } from './network/LiveKitClient.ts';
export type { RemoteCursorState, RemoteDragGhostState, TelemetryPayloadType } from './network/LiveKitClient.ts';
export { YjsProviderBridge } from './network/YjsProviderBridge.ts';
export { FirestoreDebouncer } from './network/FirestoreDebouncer.ts';

// Stage 2: WebGPU Stage & Infinite Viewport Renderer
export { RendererContext } from './canvas/RendererContext.ts';
export { LayerCompositor, ZLayer } from './canvas/LayerCompositor.ts';
export { FrustumChunkManager, CHUNK_SIZE } from './canvas/FrustumChunkManager.ts';
export { MarchingSquaresAutoTiler } from './canvas/MarchingSquaresAutoTiler.ts';
export type { GridCell, NeighborPredicate, CardinalNeighbors } from './canvas/MarchingSquaresAutoTiler.ts';
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
export { FogOfWarManager, fogOfWarManager } from './vision/FogOfWarManager.ts';
export type { FogPoint, FogPolygon, ExploredFogSnapshot } from './vision/FogOfWarManager.ts';
export { SceneRegionManager } from './cartography/SceneRegionManager.ts';
export type { SceneRegionTriggerType, SceneRegionBounds, SceneRegion, RegionTriggerEvent } from './cartography/SceneRegionManager.ts';
export { FUSED_VISION_WGSL } from './vision/shaders/fused_vision.wgsl.ts';
export { SDF_CSG_CORE_WGSL } from './vision/shaders/sdf_csg_core.wgsl.ts';
export { ELEMENTAL_FLUID_WGSL } from './physics/shaders/elemental_fluid.wgsl.ts';
export { BOIDS_SWARM_WGSL } from './physics/shaders/boids_swarm.wgsl.ts';

// Stage 4: Story Foundry Ingestion, Interactive Objects & Cartography
export { FoundryIngestion } from './assets/FoundryIngestion.ts';
export type { SceneManifest, SceneInteractiveObject } from './assets/FoundryIngestion.ts';
export { InteractiveObjectManager } from './assets/InteractiveObjectManager.ts';
export type { InteractiveObjectState } from './assets/InteractiveObjectManager.ts';
export { AssetIngestionPipeline } from './assets/AssetIngestionPipeline.ts';
export { SpriteSheetSlicer } from './assets/SpriteSheetSlicer.ts';
export { TangentPackager } from './assets/TangentPackager.ts';
export { OPFSCache, putAssetBinary, getAssetBinary, deleteAssetBinary, listAssetBinaryKeys, isOpfsHandle } from './assets/OPFSCacheWorker.ts';
export { useAssetUnitStore, mergeAssetCatalog, serializePersistedUnits, convertLegacyCustomAssetToUnit } from './assets/assetUnitStore.ts';
export { compileAssetUnitStamp } from './assets/assetStampCompiler.ts';
export type { StampPlacementOptions, CompiledAssetStamp } from './assets/assetStampCompiler.ts';
export { hasActiveCustomization, buildCssFilterFromCustomization, parseTintHexToNumber, resolveAssetStateTexture, applyAssetCustomizationToPixiSprite } from './canvas/AssetCustomizerShader.ts';
export { NVectorCalculator, DEFAULT_PLANETARY_RADIUS_KM } from './cartography/NVectorCalculator.ts';
export type { LatLon, NVector } from './cartography/NVectorCalculator.ts';
export { AstrogationGenerator } from './cartography/AstrogationGenerator.ts';
export type { StarSystem, Hyperlane } from './cartography/AstrogationGenerator.ts';
export { BSPDeckplanGenerator, BSPNode } from './cartography/BSPDeckplanGenerator.ts';
export type { Rect } from './cartography/BSPDeckplanGenerator.ts';
export { CellularAutomataCaverns } from './pcg/CellularAutomataCaverns.ts';
export { DrunkardsWalkTunnel } from './pcg/DrunkardsWalkTunnel.ts';
export { WaveFunctionCollapse } from './pcg/WaveFunctionCollapse.ts';
export { NodeGraphLayoutSolver } from './pcg/NodeGraphLayoutSolver.ts';
export { SemanticZoneMask, SemanticFlag } from './executor/SemanticZoneMask.ts';
export { CollisionClearanceTester } from './executor/CollisionClearanceTester.ts';
export { PCGExecutor } from './executor/PCGExecutor.ts';
export { PCGPromptAnalyzer } from './executor/PCGPromptAnalyzer.ts';
export { MapContextAggregator } from './ai/MapContextAggregator.ts';

// Stage 5: Tangent SF RP Rules Execution & Damage Pipelines
export { CharacterBuilder, MECHANICS_DB } from './rules/CharacterBuilder.ts';
export type { CharacterDraft, AttributeStats, SpeciesRule } from './rules/CharacterBuilder.ts';
export { CombatArbitrator, SkillRank, SizeCategory, RangeCategory } from './rules/CombatArbitrator.ts';
export type { ActionEconomyTier, RangeConfig } from './rules/CombatArbitrator.ts';
export { DamagePipeline, calculateCrossDomainArmorDR } from './rules/DamagePipeline.ts';
export type { DamagePayload, DamageResult } from './rules/DamagePipeline.ts';
export {
  CANONICAL_DEFAULT_DEFENSE_CR,
  CANONICAL_CRIT_ROLL_BONUS,
  CANONICAL_FUMBLE_FLAT_ROLL,
  CANONICAL_CRIT_DAMAGE_MULTIPLIER,
  CANONICAL_SIZE_TABLE,
  CANONICAL_SKILL_ALIASES,
  resolveSkillRank,
  resolveTangent2d10Check,
  compute2d10HitOdds,
  calculateDamageMitigation,
  routePoolDamage
} from './rules/CanonicalCombatMath.ts';
export type {
  CanonicalSizeEntry,
  DiceRollInput,
  Tangent2d10Result,
  HitOddsResult,
  DamageMitigationInput,
  DamageMitigationResult,
  PoolRoutingInput,
  PoolRoutingResult
} from './rules/CanonicalCombatMath.ts';
export { MechaSocketManager, TechLevel, UDUTier } from './rules/MechaSocketManager.ts';
export type { MechaChassis, Augmentation, HardpointSlot, VehicleEntity, PassengerNode, ChildedPassengerPosition } from './rules/MechaSocketManager.ts';

// Stage 6: UI Glass-Cockpit HUD, Dice AST & Scripting
export { DashboardOverlay } from './ui/DashboardOverlay.tsx';
export type { DashboardOverlayProps } from './ui/DashboardOverlay.tsx';
export { WidgetErrorBoundary } from './ui/WidgetErrorBoundary.tsx';
export { ContextActionBar } from './ui/widgets/ContextActionBar.tsx';
export { DiceASTParser } from './math/DiceASTParser.ts';
export type { ASTNode } from './math/DiceASTParser.ts';
export { QuickJSSandbox } from './scripting/QuickJSSandbox.ts';
export type { SandboxRequest, SandboxResponse, SandboxStandardContext, StageMacroAction } from './scripting/QuickJSSandbox.ts';
export { EssenceTracker } from './rules/EssenceTracker.ts';
export type { OngoingSpellEffect, OverchannelResult } from './rules/EssenceTracker.ts';

// Stage 7: Dual-Agent AI Ecosystem & Vision Auto-Walling
export { VertexAIGateway } from './ai/VertexAIGateway.ts';
export type { AIRequestOptions, AIGatewayResponse } from './ai/VertexAIGateway.ts';
export { BastionAgent, BastionRulesAgent } from './ai/BastionAgent.ts';
export type { BastionValidationResult } from './ai/BastionAgent.ts';
export { AimeAgent, AimeNarrativeAgent } from './ai/AimeAgent.ts';
export type { GroundingContext, ChatMessage } from './ai/AimeAgent.ts';
export { DBMFunctionRegistry } from './ai/DBMFunctionRegistry.ts';
export type { FunctionCallDefinition, ToolCallInvocation } from './ai/DBMFunctionRegistry.ts';
export { MapWallingProcessor } from './ai/MapWallingProcessor.ts';
export type { AutoWallRequest, DetectedWall, AutoWallResponse } from './ai/MapWallingProcessor.ts';

// Stage 9: Publishing Compilers, VTT Packagers & Exporters
export { PagedPdfCompiler } from './compilers/PagedPdfCompiler.ts';
export type { ScenarioExportNode, CompileOptions } from './compilers/PagedPdfCompiler.ts';
export {
  crc32,
  buildZipBytes,
  compileToEpubBytes,
  compileToEpubBlob,
  compileToWordHtmlString,
  compileToWordHtmlBlob,
  compileToRtfString
} from './compilers/DocumentExporters.ts';
export { FoundryVttJsonExporter } from './compilers/FoundryVttJsonExporter.ts';
export type { FoundryExportPayload, FoundryCompendiumPack } from './compilers/FoundryVttJsonExporter.ts';
export { UniversalVttPackager } from './compilers/UniversalVttPackager.ts';
export type { UniversalVttFile, UvttPackageRequest, RawWallSegment, RawPortalInput, RawLightInput } from './compilers/UniversalVttPackager.ts';
export { MapGraphicsCompiler } from './compilers/MapGraphicsCompiler.ts';
export type { FlattenOptions, TerrainTile, UnderlayDecal } from './compilers/MapGraphicsCompiler.ts';

// Stage 10: 3D Holographic Tactical Stage & Spatial Tabletop
export * from './3d/index.ts';
