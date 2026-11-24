/**
 * @file StageView.tsx
 * @description Next-Gen Tangent VTT Stage Viewport with Integrated 2D Map Maker & Cartography Studio.
 * Renders the WebGPU canvas ('The Stage'), orchestrates 8-layer compositor,
 * multi-tier grid coordinate engine (dynamic movement speed & ruler),
 * live Persona Folio & Bestiary spawner, Called Shot trauma pipeline,
 * turn tracker, and floats the Glass-Cockpit HUD overlay with full tactical tools.
 * Seamlessly integrates procedural landmass generation, UVTT file import,
 * interactive point-to-point wall drawing, organic/hex terrain painting,
 * tactical sketch annotations, asset catalog manager, and undo/redo history.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RendererContext } from '../../engine/canvas/RendererContext.ts';
import { LayerCompositor } from '../../engine/canvas/LayerCompositor.ts';
import { FrustumChunkManager } from '../../engine/canvas/FrustumChunkManager.ts';
import {
  CoordinateEngine,
  GridType,
  GridScaleTier,
  GRID_SCALE_CONFIGS
} from '../../engine/math/CoordinateEngine.ts';
import {
  useEngineStore,
  selectAllFusedTokens,
  type FusedToken,
  type StaticEntity
} from '../../engine/state/VolatileSharder.ts';
import { InteractiveObjectManager } from '../../engine/assets/InteractiveObjectManager.ts';
import type { SceneInteractiveObject } from '../../engine/assets/FoundryIngestion.ts';
import { BVHBuilder, type WallSegment } from '../../engine/vision/BVHBuilder.ts';
import { DashboardOverlay } from '../../engine/ui/DashboardOverlay.tsx';
import { useCampaign } from '../../context/CampaignContext';
import { 
  ArchitectDesignPalette
} from './ArchitectDesignPalette';
import { useUILayoutStore } from './store/uiLayoutStore';
import { deployCompiledPackage } from '../../utils/deployVttPackage';
import { VttEventBus } from '../../utils/vttEventBus';
import { useMapIngestion } from './hooks/useMapIngestion';
import { useCanvasEventListeners } from './hooks/useCanvasEventListeners';
import { useDesignModeController } from './hooks/useDesignModeController';
import { useCombatController } from './hooks/useCombatController';
import { useStageRenderers } from './hooks/useStageRenderers';
import { useStageGestures } from './hooks/useStageGestures';
import { useStageHotkeys } from './hooks/useStageHotkeys';
import { HazardParticleSimulator } from '../../engine/physics/HazardParticleSimulator.ts';
import { Container } from 'pixi.js';
import { 
  LightSourceManager
} from '../../engine/vision/LightSourceManager';
import { 
  X
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import SpatialAudio from '../../services/spatialAudioService';
import { SENSOR_MODES } from '../../services/sensorVisionService.js';
import { filterExpiredPings } from '../../services/mapPingService';
import { DEFAULT_LAYERS } from '../../pages/Foundry/MapMaker/map/MapConstants';
import { createDefaultAssetUnit } from '../../schemas/assetUnitSchema';
import { useMapHistory } from '../../pages/Foundry/MapMaker/hooks/useMapHistory';

// Map Maker Modals & Drawers
import { StageModalsContainer } from './stage/StageModalsContainer';
import { useStageLighting } from './stage/useStageLighting';
import { useStageRaycast } from './stage/useStageRaycast';
import { useStageTools } from './stage/useStageTools';
import { useStageMultiplayerBridge } from './stage/useStageMultiplayerBridge';
import { useStageAoEController } from './stage/useStageAoEController';
import { useStageFogAndRegions } from './stage/useStageFogAndRegions';
import { useStageUnderlayAndGrid } from './stage/useStageUnderlayAndGrid';
import { useStageActionsAndSummons } from './stage/useStageActionsAndSummons';
import { useStageTokensRenderer } from './stage/useStageTokensRenderer';
import { useStagePointerTools } from './stage/useStagePointerTools';
import { StageAudioMixerDrawer } from './stage/StageAudioMixerDrawer';
import { HandoutBroadcastOverlay } from './stage/HandoutBroadcastOverlay';
import { StageTopHudBar } from './stage/StageTopHudBar';
import { StageTokenLayer } from './stage/StageTokenLayer';
import { StageTacticalConsole } from './cockpit/StageTacticalConsole';
import { useMultiplayerCursors } from './hooks/useMultiplayerCursors';

export interface StageViewProps {
  campaignId?: string;
  sceneId?: string;
  isEmbeddedInTripartite?: boolean;
  compiledStage?: any;
  userRole?: 'architect' | 'operative' | 'gm' | 'player' | 'spectator';
  isArchitectRole?: boolean;
}

export const StageView: React.FC<StageViewProps> = ({
  campaignId = 'campaign_alpha',
  sceneId,
  isEmbeddedInTripartite = false,
  compiledStage,
  userRole: userRoleProp,
  isArchitectRole: isArchitectRoleProp
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererContextRef = useRef<RendererContext | null>(null);
  const layerCompositorRef = useRef<LayerCompositor | null>(null);
  const chunkManagerRef = useRef<FrustumChunkManager | null>(null);
  const coordEngineRef = useRef<CoordinateEngine>(new CoordinateEngine(GridType.HexFlatTop, 50, GridScaleTier.Encounter));
  const interactiveObjMgrRef = useRef<InteractiveObjectManager>(new InteractiveObjectManager());
  const bvhBuilderRef = useRef<BVHBuilder>(new BVHBuilder());
  const hazardSimulatorRef = useRef<HazardParticleSimulator | null>(null);
  const remoteCursorsContainerRef = useRef<Container | null>(null);

  // Dedicated Stage Graphics Containers for Map Maker Design Layers
  const terrainsContainerRef = useRef<Container | null>(null);
  const linesContainerRef = useRef<Container | null>(null);
  const textsContainerRef = useRef<Container | null>(null);
  const wallPreviewContainerRef = useRef<Container | null>(null);
  const pingsContainerRef = useRef<Container | null>(null);
  const transformGizmoContainerRef = useRef<Container | null>(null);
  const lightsContainerRef = useRef<Container | null>(null);
  const atmosphereOverlayRef = useRef<Container | null>(null);
  const sensorOverlayRef = useRef<Container | null>(null);
  const aoeContainerRef = useRef<Container | null>(null);
  const underlayContainerRef = useRef<Container | null>(null);
  const waypointsContainerRef = useRef<Container | null>(null);
  const lightSourceMgrRef = useRef<LightSourceManager>(new LightSourceManager());

  // Campaign Context and Search Params Integration
  const [searchParams, setSearchParams] = useSearchParams();
  const mapIdParam = searchParams.get('mapId');
  const { 
    universeState, 
    activeMapId, 
    setActiveMapId, 
    mapsCatalog,
    addMap, 
    updateMap, 
    addCustomTerrain,
    updateCustomTerrain,
    deleteCustomTerrain,
    addCustomObject,
    updateCustomObject,
    deleteCustomObject
  } = useCampaign();
  const [currentMapId, setCurrentMapId] = useState<string>(sceneId || mapIdParam || activeMapId || '');
  const [canvasGeneration, setCanvasGeneration] = useState<number>(0);
  const isCanvasReady = canvasGeneration > 0;

  useEffect(() => {
    if (sceneId && sceneId !== currentMapId) {
      setCurrentMapId(sceneId);
      if (setActiveMapId && activeMapId !== sceneId) {
        setActiveMapId(sceneId);
      }
    } else if (activeMapId && activeMapId !== currentMapId) {
      setCurrentMapId(activeMapId);
    }
  }, [sceneId, activeMapId, currentMapId, setActiveMapId]);

  const availableMaps = useMemo(() => {
    const catalog = (mapsCatalog || []) as any[];
    const projectMaps = ((universeState?.maps || []) as any[]).filter(m => !catalog.some(cm => cm.id === m.id));
    return [...catalog, ...projectMaps];
  }, [mapsCatalog, universeState?.maps]);

  const effectiveMapId = sceneId || activeMapId || mapIdParam || currentMapId;
  const baseMap = availableMaps.find((m: any) => m.id === effectiveMapId) || availableMaps[0] || null;
  const currentMap = useMemo(() => {
    if (compiledStage?.map && (!baseMap || compiledStage.map.id === baseMap.id)) {
      const envAtmo =
        compiledStage.environment?.weather ||
        compiledStage.environment?.lighting?.mode;
      return {
        ...baseMap,
        ...compiledStage.map,
        ...(envAtmo && !compiledStage.map.atmosphericWeather ? { atmosphericWeather: envAtmo } : {}),
        tokens: compiledStage.map.tokens || baseMap?.tokens || [],
        objects: compiledStage.map.objects || baseMap?.objects || [],
        waypoints: compiledStage.map.waypoints || baseMap?.waypoints || []
      };
    }
    return baseMap;
  }, [baseMap, compiledStage]);

  // Sourced from Unified Layout & Stage Viewport Store
  const {
    isGridVisible,
    gridSnap,
    toggleGridSnap,
    gridType,
    scaleTier,
    isDynamicLightingEnabled,
    toggleDynamicLighting,
    isMultiplayerSimActive,
    toggleMultiplayerSim,
    isZenMode,
    rulerSelectedPace: storeRulerPace,
    setRulerSelectedPace: setStoreRulerPace,
    selectedTokenId: storeSelectedTokenId,
    setSelectedTokenId: setStoreSelectedTokenId,
    targetTokenId: storeTargetTokenId,
    setTargetTokenId: setStoreTargetTokenId,
    selectedObjectType: storeObjectType,
    setSelectedObjectType: setStoreObjectType,
    lastCompiledPackage: storeLastCompiledPackage,
    setLastCompiledPackage: setStoreLastCompiledPackage,
    selectedAoEPresetId,
    setSelectedAoEPresetId,
    activeSensorMode,
    setActiveSensorMode,
    userRole: storeUserRole
  } = useUILayoutStore();

  const queryRole = searchParams.get('role')?.toLowerCase();
  const isLockedQueryOperative = queryRole === 'operative' || queryRole === 'player' || queryRole === 'spectator';
  const effectiveRole = isLockedQueryOperative ? 'operative' : (userRoleProp || storeUserRole || 'architect');
  const effectiveIsArchitectRole =
    isLockedQueryOperative
      ? false
      : typeof isArchitectRoleProp === 'boolean'
        ? isArchitectRoleProp
        : (effectiveRole === 'architect' || effectiveRole === 'gm');

  // In-Situ Architect Design Mode & Simulation Control Hook
  const {
    isDesignModeActive,
    setIsDesignModeActive,
    activeDesignTool,
    setActiveDesignTool,
    selectedStamp,
    setSelectedStamp,
    selectedAssetIds,
    setSelectedAssetIds,
    isMarqueeActive,
    setIsMarqueeActive,
    marqueeStart,
    setMarqueeStart,
    marqueeCurrent,
    setMarqueeCurrent,
    wallConstructionMode,
    setWallConstructionMode,
    wallChainPoints,
    setWallChainPoints,
    selectedWallType,
    setSelectedWallType,
    doorLockDc,
    setDoorLockDc,
    selectedTerrainId,
    setSelectedTerrainId,
    terrainBrushWidth,
    setTerrainBrushWidth,
    terrainRenderMode,
    setTerrainRenderMode,
    pencilColor,
    setPencilColor,
    pencilWidth,
    setPencilWidth,
    textLabelInput,
    setTextLabelInput,
    textColor,
    setTextColor,
    textSize,
    setTextSize,
    rulerAvailableAp,
    setRulerAvailableAp,
    selectedLightColor,
    setSelectedLightColor,
    selectedLightRadius,
    setSelectedLightRadius,
    selectedLightAnimation,
    setSelectedLightAnimation,
    randomizeRotation,
    setRandomizeRotation,
    randomizeScale,
    setRandomizeScale,
    isDrawingToolActive,
    setIsDrawingToolActive,
    wallDrawStart,
    setWallDrawStart,
    wallDrawCurrent,
    setWallDrawCurrent,
    currentStrokePoints,
    setCurrentStrokePoints
  } = useDesignModeController();

  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);
  const [isTacticalConsoleCollapsed, setIsTacticalConsoleCollapsed] = useState<boolean>(false);
  const [localWalls, setLocalWalls] = useState<WallSegment[]>([]);
  const [localObjects, setLocalObjects] = useState<SceneInteractiveObject[]>([]);
  const [isAoEMode, setIsAoEMode] = useState<boolean>(false);
  const [isFogEnabled, setIsFogEnabled] = useState<boolean>(false);
  const [fogBrushMode, setFogBrushMode] = useState<'none' | 'reveal' | 'hide'>('none');
  const [fogBoxStart, setFogBoxStart] = useState<{ x: number; y: number } | null>(null);
  const [isAudioMixerOpen, setIsAudioMixerOpen] = useState<boolean>(false);
  const [isHandoutPushOpen, setIsHandoutPushOpen] = useState<boolean>(false);
  const armedChunkRef = useRef<any>(null);

  useEffect(() => {
    return VttEventBus.on('arm-stage-chunk', (cfg) => {
      armedChunkRef.current = cfg;
    });
  }, []);
  const tokens = useEngineStore(selectAllFusedTokens);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(storeSelectedTokenId || null);
  const [targetTokenId, setTargetTokenId] = useState<string | null>(storeTargetTokenId || null);
  const selectedToken = tokens.find(t => t.id === selectedTokenId) || null;
  const targetToken = tokens.find(t => t.id === targetTokenId) || null;

  const {
    atmosphericWeather,
    setAtmosphericWeather,
    localLights,
    setLocalLights,
    hazardCount,
    setHazardCount,
    handleToggleDynamicLighting
  } = useStageLighting({
    currentMap,
    isCanvasReady,
    canvasGeneration,
    atmosphereOverlayRef,
    lightingContainerRef: lightsContainerRef,
    sensorOverlayRef,
    hazardSimulatorRef,
    isDynamicLightingEnabled,
    toggleDynamicLighting,
    updateMap,
    activeSensorMode,
    tokens,
    selectedToken
  });

  const isDynamicLightingRef = useRef<boolean>(isDynamicLightingEnabled);
  isDynamicLightingRef.current = isDynamicLightingEnabled;
  const atmosphericWeatherRef = useRef(atmosphericWeather);
  atmosphericWeatherRef.current = atmosphericWeather;
  const currentMapRef = useRef<any>(currentMap);
  currentMapRef.current = currentMap;

  // Spatial Audio Listener & Map Sound Emitter Synchronization
  useEffect(() => {
    if (selectedToken) {
      SpatialAudio.setListenerPosition(selectedToken.x, selectedToken.y, currentMap?.gridSize || 50);
    }
  }, [selectedToken?.x, selectedToken?.y, currentMap?.gridSize]);

  useEffect(() => {
    const emitters = Array.isArray(currentMap?.soundEmitters) ? currentMap.soundEmitters : [];
    const gridScale = currentMap?.gridSize || 50;
    if (emitters.length > 0 && !AudioService.muted) {
      emitters.forEach((em: any, idx: number) => {
        SpatialAudio.createProceduralEmitter(em.id || `emitter-${idx}`, {
          x: em.x ?? 0,
          y: em.y ?? 0,
          type: em.type || 'reactor_hum',
          maxDistance: em.maxDistance || 25,
          gridScale
        });
      });
    }
    return () => {
      SpatialAudio.clearAllEmitters();
    };
  }, [currentMap?.id, currentMap?.soundEmitters, currentMap?.gridSize]);

  // Map Maker Modal Launcher States
  const [isLandmassModalOpen, setIsLandmassModalOpen] = useState<boolean>(false);
  const [isUvttModalOpen, setIsUvttModalOpen] = useState<boolean>(false);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState<boolean>(false);
  const [isUnderlayModalOpen, setIsUnderlayModalOpen] = useState<boolean>(false);
  const [underlayConfig, setUnderlayConfig] = useState<{
    url: string;
    opacity: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    visible: boolean;
  } | null>(null);
  const [isHeroDrawerOpen, setIsHeroDrawerOpen] = useState<boolean>(false);
  const [isOmnicortexDrawerOpen, setIsOmnicortexDrawerOpen] = useState<boolean>(false);
  const [isHazmatModalOpen, setIsHazmatModalOpen] = useState<boolean>(false);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState<boolean>(false);
  const [inspectingInteractiveObj, setInspectingInteractiveObj] = useState<any | null>(null);

  // Asset Studio & Ingestion Suite Modal States
  const [isAssetStudioOpen, setIsAssetStudioOpen] = useState<boolean>(false);
  const [isAssetIngestionOpen, setIsAssetIngestionOpen] = useState<boolean>(false);
  const [isSpriteSheetCutterOpen, setIsSpriteSheetCutterOpen] = useState<boolean>(false);
  const [selectedStudioAsset, setSelectedStudioAsset] = useState<any | null>(null);

  const handleOpenAssetStudio = () => {
    if (!selectedStudioAsset) {
      setSelectedStudioAsset(
        createDefaultAssetUnit({
          unit_id: `unit-${Date.now()}`,
          name: 'Custom Tactical Unit',
          category: 'doodad',
          tree_path: ['Custom', 'Studio'],
          tags: ['custom', 'tactical'],
          dimensions: [1, 1],
          vtt_properties: {
            blocks_movement: true,
            blocks_vision: false,
            z_index_layer: 'interactive_objects'
          }
        })
      );
    }
    setIsAssetStudioOpen(true);
  };

  const handleAssetIngested = (asset: any) => {
    setCombatLog(prev => [
      `[ASSET FORGE] Ingested "${asset.name}" (${asset.category}) to ${asset.tree_path}.`,
      ...prev.slice(0, 8)
    ]);
    AudioService.playTerminalBeep(1400, 0.04);
  };

  // Tactical Radar Pings
  const [activePings, setActivePings] = useState<any[]>([]);

  // Undo / Redo History Integration
  const { recordHistory } = useMapHistory({
    currentMap,
    lines: currentMap?.lines || [],
    tokens: currentMap?.tokens || [],
    terrains: currentMap?.terrains || [],
    objects: currentMap?.objects || localObjects,
    texts: currentMap?.texts || [],
    walls: currentMap?.walls || localWalls,
    lights: currentMap?.lights || localLights,
    fog: currentMap?.fog || [],
    mapLayers: currentMap?.layers || DEFAULT_LAYERS,
    updateMap,
    activeMapId: currentMap?.id || '',
    enabled: effectiveIsArchitectRole
  });

  // Viewport & Coordinate States (selectedTokenId / targetTokenId initialized above)

  // Synchronize selection state with uiLayoutStore
  useEffect(() => {
    if (storeSelectedTokenId !== undefined && storeSelectedTokenId !== selectedTokenId) {
      setSelectedTokenId(storeSelectedTokenId);
    }
  }, [storeSelectedTokenId]);

  useEffect(() => {
    if (storeTargetTokenId !== undefined && storeTargetTokenId !== targetTokenId) {
      setTargetTokenId(storeTargetTokenId);
    }
  }, [storeTargetTokenId]);

  // Auto-deploy compiled VTT package arriving from ADE compiler
  useEffect(() => {
    const targetMapId = activeMapId || currentMapId || currentMap?.id;
    if (!storeLastCompiledPackage || !targetMapId || !updateMap) return;
    deployCompiledPackage(storeLastCompiledPackage, updateMap, targetMapId);
    setStoreLastCompiledPackage(null);
  }, [storeLastCompiledPackage, activeMapId, currentMapId, currentMap?.id, updateMap, setStoreLastCompiledPackage]);

  // ── NPC Simulation Tick (Patrol Steps & Sentry Vision Scanning via useStageRaycast) ──
  useStageRaycast({
    isMultiplayerSimActive,
    isSimulationPaused,
    currentMapTokens: currentMap?.tokens || [],
    engineStore: useEngineStore.getState(),
    bvhBuilderRef
  });

  const isVisionEnabled = true;
  const torchRadiusFt = 30;
  const [gridOverlayContainer, setGridOverlayContainer] = useState<Container | null>(null);
  const [moveRulerContainer, setMoveRulerContainer] = useState<Container | null>(null);

  // Contextual Token Radial Menu State
  const [radialMenuState, setRadialMenuState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    token: any;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    token: null
  });

  // Pan & Zoom Navigation States via useStageTools
  const {
    zoom,
    setZoom,
    pan,
    setPan,
    isDraggingPan,
    setIsDraggingPan,
    dragStartPos,
    setDragStartPos,
    activeTab,
    setActiveTab
  } = useStageTools({
    setActiveDesignTool: (t) => setActiveDesignTool(t),
    setIsDesignModeActive: (fn) => setIsDesignModeActive(fn),
    rendererContextRef
  });

  // Keep viewport transform in a ref before initRenderer so device-loss recovery can restore pan/zoom
  const viewportTransformRef = useRef({ zoom, pan });
  viewportTransformRef.current = { zoom, pan };

  // Tactical Movement & Action States
  const [isMoveModeActive, setIsMoveModeActive] = useState(false);
  const mouseWorldPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Combat Resolution, Damage Pipeline & Turn Tracker Hook
  const {
    combatLog,
    setCombatLog,
    targetedLimb,
    setTargetedLimb,
    attackWeapon,
    setAttackWeapon,
    attackMapStep,
    setAttackMapStep,
    activeStance,
    setActiveStance,
    customDiceExpr,
    setCustomDiceExpr,
    roundNumber,
    setRoundNumber,
    currentTurnIndex,
    setCurrentTurnIndex,
    initiativeScores,
    setInitiativeScores,
    combatArbRef,
    handleExecuteCombatStrike,
    handleRollCustomDice,
    handleNextTurn,
    handleRollAllInitiative
  } = useCombatController({
    selectedToken,
    targetToken,
    tokens,
    bvhBuilderRef,
    isSimulationPaused,
    selectedTokenId,
    setSelectedTokenId
  });

  // Measured AoE Template Controller
  const {
    aoePresets,
    activePreset: activeAoEPreset,
    aoeOrigin,
    isAimingAoE,
    hasCommittedTemplate,
    affectedResults: aoeAffectedResults,
    startAoETemplate,
    updateAoETarget,
    commitAoETemplate,
    clearAoETemplate,
    resolveActiveAoE
  } = useStageAoEController({
    aoeContainerRef,
    isCanvasReady,
    canvasGeneration,
    tokens,
    selectedAoEPresetId,
    isAoEToolActive: isAoEMode || activeDesignTool === 'aoe',
    setCombatLog
  });

  // Live Multiplayer Bridge (VoiceChat LiveKit Room + Yjs CRDT + Firestore Persistence)
  const { syncStatus } = useStageMultiplayerBridge({
    campaignId: universeState?.id || campaignId,
    currentMap,
    userRole: effectiveRole,
    collectionRoot: universeState?.id ? 'user_stories' : 'Campaigns',
    skipSessionInit: isEmbeddedInTripartite,
    bvhBuilderRef,
    interactiveObjMgrRef,
    setLocalWalls,
    setLocalObjects,
    setActivePings,
    onRemoteTurnUpdate: (turnState) => {
      if (typeof turnState.roundNumber === 'number') setRoundNumber(turnState.roundNumber);
      if (typeof turnState.currentTurnIndex === 'number') setCurrentTurnIndex(turnState.currentTurnIndex);
      if (turnState.initiativeScores) setInitiativeScores(turnState.initiativeScores);
    }
  });

  // Persistent 3-Tier Explored Fog-of-War & Multi-Deck / Story Scene Regions
  const { revealAllFog, resetFog, revealFogRect, hideFogRect } = useStageFogAndRegions({
    layerCompositorRef,
    isCanvasReady,
    canvasGeneration,
    currentMap,
    localWalls,
    tokens,
    selectedToken,
    activeSensorMode,
    isFogEnabled,
    userRole: effectiveRole,
    isArchitect: effectiveIsArchitectRole,
    onUpdateMap: updateMap,
    onSwitchMap: (nextMapId) => {
      setCurrentMapId(nextMapId);
      setActiveMapId?.(nextMapId);
    }
  });

  // Calculate dynamic effective speed taking into account trauma/conditions
  const getEffectiveSpeed = useCallback((token: FusedToken | StaticEntity | null): number => {
    if (!token) return 30;
    const base = token.speed_ft ?? 30;
    const hasSlowCondition = (token as any).active_conditions?.some((c: string) => 
      c.toLowerCase().includes('slow') || c.toLowerCase().includes('cripple') || c.toLowerCase().includes('leg') || c.toLowerCase().includes('disabled')
    );
    return hasSlowCondition ? Math.max(5, Math.floor(base / 2)) : base;
  }, []);

  const effectiveSpeedFt = getEffectiveSpeed(selectedToken);

  // Ping Auto-Decay Timer
  useEffect(() => {
    if (activePings.length === 0) return;
    const interval = setInterval(() => {
      setActivePings(prev => filterExpiredPings(prev));
    }, 800);
    return () => clearInterval(interval);
  }, [activePings.length]);

  // Handle map selection
  const handleSelectMap = (mapId: string) => {
    setCurrentMapId(mapId);
    if (setActiveMapId) setActiveMapId(mapId);
    setSearchParams({ mapId });
    AudioService.playTerminalBeep(1200, 0.03);
  };



  // Ingest Campaign Map (Walls into BVH, Objects into InteractiveObjMgr, Tokens into VolatileSharder)
  useMapIngestion({
    currentMap,
    bvhBuilderRef,
    interactiveObjMgrRef,
    lightSourceMgrRef,
    setCombatLog,
    setLocalWalls,
    setLocalObjects,
    setLocalLights,
    setSelectedTokenId,
    setTargetTokenId,
    setUnderlayConfig,
    setAtmosphericWeather
  });

  // ── Global Canvas Event Listeners (Sentry, Companions, Studio Modals) ──
  useCanvasEventListeners({
    setIsLandmassModalOpen,
    setIsUvttModalOpen,
    setIsAssetManagerOpen,
    setIsHeroDrawerOpen,
    setIsOmnicortexDrawerOpen,
    setIsLayersPanelOpen,
    setIsUnderlayModalOpen,
    setIsAssetStudioOpen: () => handleOpenAssetStudio(),
    setIsAssetIngestionOpen,
    setIsSpriteSheetCutterOpen,
    selectedTokenId,
    setSelectedTokenId,
    setCombatLog
  });

  // ── Render Stage Layers (Walls, Terrains, Lines, Texts, Previews, Radar Pings) ──
  useStageRenderers({
    layerCompositorRef,
    terrainsContainerRef,
    linesContainerRef,
    textsContainerRef,
    wallPreviewContainerRef,
    pingsContainerRef,
    isCanvasReady,
    canvasGeneration,
    localWalls,
    currentMap,
    isDrawingToolActive,
    isDesignModeActive,
    activeDesignTool,
    wallDrawStart,
    wallDrawCurrent,
    selectedWallType,
    wallConstructionMode,
    wallChainPoints,
    currentStrokePoints,
    pencilColor,
    pencilWidth,
    terrainBrushWidth,
    activePings
  });

  // ── Extracted PixiJS Underlay, Transform Gizmo, Pan/Zoom Sync, Grid & Ruler Hook ──
  const { redrawMoveRuler } = useStageUnderlayAndGrid({
    canvasRef,
    rendererContextRef,
    layerCompositorRef,
    chunkManagerRef,
    coordEngineRef,
    hazardSimulatorRef,
    lightSourceMgrRef,
    remoteCursorsContainerRef,
    terrainsContainerRef,
    linesContainerRef,
    textsContainerRef,
    wallPreviewContainerRef,
    pingsContainerRef,
    transformGizmoContainerRef,
    lightsContainerRef,
    atmosphereOverlayRef,
    sensorOverlayRef,
    aoeContainerRef,
    underlayContainerRef,
    waypointsContainerRef,
    isDynamicLightingRef,
    atmosphericWeatherRef,
    currentMapRef,
    viewportTransformRef,
    mouseWorldPosRef,
    isCanvasReady,
    canvasGeneration,
    setCanvasGeneration,
    gridOverlayContainer,
    setGridOverlayContainer,
    moveRulerContainer,
    setMoveRulerContainer,
    currentMap,
    underlayConfig,
    isGridVisible,
    gridType,
    scaleTier,
    zoom,
    pan,
    selectedAssetIds,
    isMarqueeActive,
    marqueeStart,
    marqueeCurrent,
    localObjects,
    tokens,
    localWalls,
    selectedToken,
    isMoveModeActive,
    effectiveSpeedFt,
    activeDesignTool,
    storeRulerPace,
    setCombatLog
  });

  // ── Extracted Batch Operations, Landmass/UVTT Commits, Summons & Radial Actions Hook ──
  const {
    handleBatchDelete,
    handleBatchDuplicate,
    handleBatchNudge,
    handleDeselectAll,
    deployArchitectItem,
    handleToggleDesignMode,
    handleObjectClick,
    handleSpawnHazard,
    handleClearHazards,
    handleToggleMultiplayerSim,
    handleDropTacticalPing,
    handleCommitLandmass,
    handleImportCompleteUvtt,
    handleSummonHeroToken,
    handleSummonOmnicortexAsset,
    toggleLayerVisibility,
    toggleLayerLock,
    downedAllyNearby,
    nearbyInteractiveObj,
    nearbyVehicle,
    isPointBlankTarget,
    handleRadialSelectAction
  } = useStageActionsAndSummons({
    bvhBuilderRef,
    interactiveObjMgrRef,
    hazardSimulatorRef,
    lightSourceMgrRef,
    mouseWorldPosRef,
    selectedAssetIds,
    setSelectedAssetIds,
    localObjects,
    setLocalObjects,
    localWalls,
    setLocalWalls,
    localLights,
    setLocalLights,
    currentMap,
    addMap,
    updateMap,
    handleSelectMap,
    recordHistory,
    gridSnap,
    randomizeRotation,
    randomizeScale,
    selectedLightRadius,
    selectedLightColor,
    selectedLightAnimation,
    setHazardCount,
    setCombatLog,
    setIsDesignModeActive,
    setIsSimulationPaused,
    setInspectingInteractiveObj,
    selectedToken,
    targetToken,
    selectedTokenId,
    tokens,
    isMultiplayerSimActive,
    toggleMultiplayerSim,
    setActivePings,
    activeStance,
    setActiveStance,
    setIsMoveModeActive,
    setActiveTab,
    handleExecuteCombatStrike
  });

  // ── Extracted Interactive Objects, Spatial Waypoints & Token Layer Renderer Hook ──
  useStageTokensRenderer({
    isCanvasReady,
    canvasGeneration,
    layerCompositorRef,
    interactiveObjMgrRef,
    waypointsContainerRef,
    combatArbRef,
    canvasRef,
    viewportTransformRef,
    tokens,
    localObjects,
    currentMap,
    updateMap,
    selectedTokenId,
    setSelectedTokenId,
    setStoreSelectedTokenId,
    targetTokenId,
    setTargetTokenId,
    setStoreTargetTokenId,
    setRadialMenuState,
    isVisionEnabled,
    torchRadiusFt,
    handleObjectClick
  });

  // ── Extracted Pointer, Drawing, AoE, Fog Brush, Movement & Drag/Drop Tools Hook ──
  const {
    handleCanvasMouseMove,
    handleCanvasMouseDown,
    handleCanvasMouseUp,
    handleCanvasClick,
    handleCanvasDragOver,
    handleCanvasDrop
  } = useStagePointerTools({
    canvasRef,
    coordEngineRef,
    mouseWorldPosRef,
    interactiveObjMgrRef,
    bvhBuilderRef,
    lightSourceMgrRef,
    armedChunkRef,
    pan,
    setPan,
    zoom,
    dragStartPos,
    setDragStartPos,
    isDraggingPan,
    setIsDraggingPan,
    isDesignModeActive,
    activeDesignTool,
    effectiveIsArchitectRole,
    fogBrushMode,
    fogBoxStart,
    setFogBoxStart,
    revealFogRect,
    hideFogRect,
    isAoEMode,
    isAimingAoE,
    hasCommittedTemplate,
    startAoETemplate,
    updateAoETarget,
    commitAoETemplate,
    isMoveModeActive,
    setIsMoveModeActive,
    moveRulerContainer,
    redrawMoveRuler,
    selectedToken,
    selectedTokenId,
    tokens,
    localObjects,
    setLocalObjects,
    localWalls,
    setLocalWalls,
    localLights,
    setLocalLights,
    currentMap,
    updateMap,
    gridSnap,
    isMarqueeActive,
    setIsMarqueeActive,
    marqueeStart,
    setMarqueeStart,
    marqueeCurrent,
    setMarqueeCurrent,
    setSelectedAssetIds,
    isDrawingToolActive,
    setIsDrawingToolActive,
    wallDrawStart,
    setWallDrawStart,
    wallDrawCurrent,
    setWallDrawCurrent,
    wallConstructionMode,
    setWallChainPoints,
    selectedWallType,
    doorLockDc,
    currentStrokePoints,
    setCurrentStrokePoints,
    selectedTerrainId,
    terrainBrushWidth,
    terrainRenderMode,
    pencilColor,
    pencilWidth,
    textLabelInput,
    textColor,
    textSize,
    selectedLightRadius,
    selectedLightColor,
    selectedLightAnimation,
    selectedStamp,
    storeObjectType,
    recordHistory,
    setCombatLog,
    deployArchitectItem
  });









  // Smooth Zoom with Mouse Wheel & Global Drag Safety
  useStageGestures({
    canvasRef,
    setZoom,
    setIsDraggingPan,
    setIsMarqueeActive,
    setIsDrawingToolActive
  });



  // Multiplayer Remote Cursors Simulation & Render on Stage
  useMultiplayerCursors({
    containerRef: remoteCursorsContainerRef,
    isMultiplayerSimActive,
    isSimulationPaused,
    canvasGeneration
  });



  // Global Keyboard Shortcuts for Architect & Tactical Stage
  useStageHotkeys({
    selectedAssetIds,
    gridSnap,
    isDesignModeActive,
    wallConstructionMode,
    wallChainPoints,
    setWallChainPoints,
    setWallDrawStart,
    setWallDrawCurrent,
    setIsDrawingToolActive,
    setCombatLog,
    handleBatchDelete,
    handleBatchDuplicate,
    handleBatchNudge,
    handleDeselectAll,
    handleToggleDesignMode,
    toggleGridSnap,
    setActiveDesignTool
  });

  const currentScaleConfig = GRID_SCALE_CONFIGS[scaleTier];

  return (
    <div 
      className="relative w-full h-full bg-[#050811] overflow-hidden select-none flex flex-col touch-manipulation"
      onContextMenu={(e) => e.preventDefault()}
    >

      {/* ── MAIN VIEWPORT AREA ── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Optional Animated Looped Video Battlemap Underlay (.webm / .mp4) */}
        {currentMap?.videoBackgroundUrl && (
          <video
            src={currentMap.videoBackgroundUrl}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
          />
        )}

        {/* WebGPU / WebGL Stage Canvas */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onDoubleClick={() => handleDropTacticalPing('target')}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-full h-full block ${
            isDesignModeActive 
              ? (activeDesignTool === 'eraser' ? 'cursor-not-allowed' : 'cursor-crosshair') 
              : isMoveModeActive 
                ? 'cursor-crosshair' 
                : isDraggingPan 
                  ? 'cursor-grabbing' 
                  : 'cursor-default'
          }`}
        />

        {/* Empty Sector Mat Ready Hint Badge (Hidden when embedded in Tripartite Stage) */}
        {!isEmbeddedInTripartite && tokens.length === 0 && localWalls.length === 0 && !currentMap?.background_url && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none bg-slate-950/85 border border-cyan-500/40 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 backdrop-blur-md flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{(currentMap?.title || currentMap?.name || 'Tactical Sector').toUpperCase()} // CANVAS READY • Select props, walls, or tokens to deploy</span>
          </div>
        )}


        {/* ── Pro Stage Tactical Toolbar & Resolve AoE Chip ── */}
        <StageTopHudBar
          isZenMode={isZenMode}
          syncStatus={syncStatus}
          activeSensorMode={activeSensorMode}
          sensorModes={SENSOR_MODES as any}
          onChangeSensorMode={(mode) => {
            setActiveSensorMode(mode as any);
            if (selectedTokenId) {
              useEngineStore.getState().setSensorMode(selectedTokenId, mode as any);
            }
            VttEventBus.emit('stage-sensor-mode-changed', { mode: mode as any, tokenId: selectedTokenId });
            AudioService.playTerminalBeep(1180, 0.03);
          }}
          isAoEMode={isAoEMode}
          onToggleAoEMode={() => {
            const next = !isAoEMode;
            setIsAoEMode(next);
            if (!next) clearAoETemplate();
            AudioService.playTerminalBeep(next ? 1300 : 900, 0.03);
          }}
          selectedAoEPresetId={selectedAoEPresetId}
          onSelectAoEPresetId={setSelectedAoEPresetId}
          aoePresets={aoePresets as any}
          isFogEnabled={isFogEnabled}
          onToggleFog={() => {
            if (!effectiveIsArchitectRole) return;
            const next = !isFogEnabled;
            setIsFogEnabled(next);
            if (!next) setFogBrushMode('none');
            if (currentMap && updateMap) {
              updateMap(currentMap.id, { fogEnabled: next });
            }
            AudioService.playTerminalBeep(next ? 1150 : 750, 0.03);
          }}
          fogBrushMode={fogBrushMode}
          onSetFogBrushMode={setFogBrushMode}
          isArchitectRole={effectiveIsArchitectRole}
          onRevealAllFog={revealAllFog}
          onResetFog={resetFog}
          onOpenAudioMixer={() => setIsAudioMixerOpen(true)}
          onOpenHandoutPush={() => setIsHandoutPushOpen(true)}
          aoeOrigin={aoeOrigin}
          hasCommittedTemplate={hasCommittedTemplate}
          activeAoEPreset={activeAoEPreset as any}
          aoeAffectedCount={aoeAffectedResults.length}
          onResolveAoE={() => resolveActiveAoE()}
          onClearAoE={() => clearAoETemplate()}
        />

        {/* ── Tripartite Armed Placement Floating HUD Pill ── */}
        {isEmbeddedInTripartite && isDesignModeActive && activeDesignTool !== 'select' && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[115] bg-slate-950/90 border border-cyan-500/60 rounded-full px-4 py-1.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md flex items-center gap-3 pointer-events-auto">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-cyan-200">
              ARMED: <strong className="text-white uppercase">{selectedStamp?.label || (storeObjectType as any)?.label || activeDesignTool}</strong>
            </span>
            <span className="text-[10px] font-mono text-slate-400 border-l border-slate-700 pl-2.5">
              Click canvas to deploy {gridSnap ? '(Grid Snap ON)' : '(Free Placement)'}
            </span>
            <button
              onClick={() => {
                setIsDesignModeActive(false);
                setActiveDesignTool('select');
                setSelectedStamp(null);
                setStoreObjectType('' as any);
              }}
              className="text-slate-400 hover:text-rose-400 transition-colors ml-1 p-0.5 rounded cursor-pointer"
              title="Cancel Placement"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* ── Glass-Cockpit HUD React Overlay ── */}
        <DashboardOverlay
          campaignName={`THE STAGE | ${campaignId.toUpperCase()} | ${currentScaleConfig.displayLabel}`}
          selectedTokenId={selectedTokenId}
          onSelectTokenId={(id: string) => {
            setSelectedTokenId(id);
            setStoreSelectedTokenId(id);
            const eng = useEngineStore.getState();
            eng.clearSelection();
            eng.setSelection(id, true);
          }}
          isMoveModeActive={isMoveModeActive}
          onInitiateMove={() => {
            setIsMoveModeActive(prev => !prev);
            AudioService.playTerminalBeep(1100, 0.03);
          }}
          onInitiateAttack={() => {
            setActiveTab('combat');
            AudioService.playTerminalBeep(1300, 0.03);
          }}
          onInitiateScan={() => {
            AudioService.playTerminalBeep(1250, 0.04);
            setCombatLog(prev => [
              `[SENSOR SCAN] Sensor cone detected ${tokens.length} active signatures within ${torchRadiusFt}ft LoS.`,
              ...prev.slice(0, 8)
            ]);
          }}
          onToggleGuard={() => {
            setActiveStance(prev => prev === 'guard' ? 'normal' : 'guard');
            AudioService.playTerminalBeep(900, 0.03);
          }}
          activeStance={activeStance}
          effectiveSpeedFt={effectiveSpeedFt}
          isDynamicLightingEnabled={isDynamicLightingEnabled}
          onToggleDynamicLighting={handleToggleDynamicLighting}
          onSpawnHazard={handleSpawnHazard}
          onClearHazards={handleClearHazards}
          hazardCount={hazardCount}
          isMultiplayerSimActive={isMultiplayerSimActive}
          onToggleMultiplayerSim={handleToggleMultiplayerSim}
          isDesignModeActive={isDesignModeActive}
          isZenMode={isZenMode}
          isEmbeddedInTripartite={isEmbeddedInTripartite}
        />

        {/* ── RIGHT DOCKABLE TACTICAL COMMAND CONSOLE (Play Mode Only - Standalone Only) ── */}
        <StageTacticalConsole
          isEmbeddedInTripartite={isEmbeddedInTripartite}
          isDesignModeActive={isDesignModeActive}
          isZenMode={isZenMode}
          isTacticalConsoleCollapsed={isTacticalConsoleCollapsed}
          setIsTacticalConsoleCollapsed={setIsTacticalConsoleCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedToken={selectedToken}
          targetToken={targetToken}
          attackWeapon={attackWeapon}
          setAttackWeapon={setAttackWeapon}
          attackMapStep={attackMapStep}
          setAttackMapStep={setAttackMapStep}
          targetedLimb={targetedLimb}
          setTargetedLimb={setTargetedLimb}
          handleExecuteCombatStrike={handleExecuteCombatStrike}
          setIsHeroDrawerOpen={setIsHeroDrawerOpen}
          setIsOmnicortexDrawerOpen={setIsOmnicortexDrawerOpen}
          roundNumber={roundNumber}
          handleRollAllInitiative={handleRollAllInitiative}
          tokens={tokens}
          setSelectedTokenId={setSelectedTokenId}
          currentTurnIndex={currentTurnIndex}
          initiativeScores={initiativeScores}
          handleNextTurn={handleNextTurn}
          localObjects={localObjects}
          handleObjectClick={handleObjectClick}
          customDiceExpr={customDiceExpr}
          setCustomDiceExpr={setCustomDiceExpr}
          handleRollCustomDice={handleRollCustomDice}
          combatLog={combatLog}
          onOpenHandoutPush={() => setIsHandoutPushOpen(true)}
          userRole={effectiveRole}
        />

        {/* ── Contextual Token Radial Action Wheel ── */}
        <StageTokenLayer
          radialMenuState={radialMenuState}
          onCloseRadialMenu={() => setRadialMenuState(prev => ({ ...prev, isOpen: false }))}
          targetToken={targetToken}
          downedAllyNearby={downedAllyNearby}
          nearbyInteractiveObj={nearbyInteractiveObj}
          nearbyVehicle={nearbyVehicle}
          isPointBlankTarget={isPointBlankTarget}
          onSelectAction={handleRadialSelectAction}
        />

        {/* ── IN-SITU ARCHITECT DESIGN STUDIO & ASSET PALETTE ── */}
        <ArchitectDesignPalette
            isOpen={!isEmbeddedInTripartite && isDesignModeActive && !isZenMode}
            onClose={() => handleToggleDesignMode()}
            activeTool={activeDesignTool}
            setActiveTool={setActiveDesignTool}
            selectedStamp={selectedStamp}
            onSelectStamp={setSelectedStamp}
            gridSnap={gridSnap}
            onToggleGridSnap={() => toggleGridSnap()}
            activeMapTitle={currentMap?.title || currentMap?.name || 'Tactical Sector'}
            wallsCount={localWalls.length}
            objectsCount={localObjects.length}
            hazardsCount={hazardCount}
            terrainsCount={(currentMap?.terrains || []).length}
            linesCount={(currentMap?.lines || []).length}
            textsCount={(currentMap?.texts || []).length}
            lightsCount={localLights.length}
            selectedWallType={selectedWallType}
            setSelectedWallType={setSelectedWallType}
            doorLockDc={doorLockDc}
            setDoorLockDc={setDoorLockDc}
            wallConstructionMode={wallConstructionMode}
            setWallConstructionMode={setWallConstructionMode}
            selectedAssetIds={selectedAssetIds}
            onBatchDelete={handleBatchDelete}
            onBatchDuplicate={handleBatchDuplicate}
            onBatchNudge={handleBatchNudge}
            onDeselectAll={handleDeselectAll}
            randomizeRotation={randomizeRotation}
            setRandomizeRotation={setRandomizeRotation}
            randomizeScale={randomizeScale}
            setRandomizeScale={setRandomizeScale}
            atmosphericWeather={atmosphericWeather}
            setAtmosphericWeather={(w) => {
              setAtmosphericWeather(w);
              if (currentMap && updateMap) {
                updateMap(currentMap.id, { atmosphericWeather: w });
              }
            }}
            selectedLightColor={selectedLightColor}
            setSelectedLightColor={setSelectedLightColor}
            selectedLightRadius={selectedLightRadius}
            setSelectedLightRadius={setSelectedLightRadius}
            selectedLightAnimation={selectedLightAnimation}
            setSelectedLightAnimation={setSelectedLightAnimation}
            selectedTerrainId={selectedTerrainId}
            setSelectedTerrainId={setSelectedTerrainId}
            terrainBrushWidth={terrainBrushWidth}
            setTerrainBrushWidth={setTerrainBrushWidth}
            terrainRenderMode={terrainRenderMode}
            setTerrainRenderMode={setTerrainRenderMode}
            pencilColor={pencilColor}
            setPencilColor={setPencilColor}
            pencilWidth={pencilWidth}
            setPencilWidth={setPencilWidth}
            textLabelInput={textLabelInput}
            setTextLabelInput={setTextLabelInput}
            textColor={textColor}
            setTextColor={setTextColor}
            textSize={textSize}
            setTextSize={setTextSize}
            rulerAvailableAp={rulerAvailableAp}
            setRulerAvailableAp={setRulerAvailableAp}
            rulerSelectedPace={storeRulerPace}
            setRulerSelectedPace={setStoreRulerPace}
            onOpenLandmassModal={() => setIsLandmassModalOpen(true)}
            onOpenUvttModal={() => setIsUvttModalOpen(true)}
            onOpenAssetManager={() => setIsAssetManagerOpen(true)}
            onOpenHeroDrawer={() => setIsHeroDrawerOpen(true)}
            onOpenOmnicortexDrawer={() => setIsOmnicortexDrawerOpen(true)}
            onOpenHazmatModal={() => setIsHazmatModalOpen(true)}
            onOpenLayersPanel={() => setIsLayersPanelOpen(true)}
            onOpenUnderlayModal={() => setIsUnderlayModalOpen(true)}
            onOpenAssetStudio={handleOpenAssetStudio}
            onOpenAssetIngestion={() => setIsAssetIngestionOpen(true)}
            onOpenSpriteSheetCutter={() => setIsSpriteSheetCutterOpen(true)}
          />
      </div>

      {/* ── MODALS & DRAWERS INTEGRATION ── */}
      <StageModalsContainer
        isLandmassModalOpen={isLandmassModalOpen}
        setIsLandmassModalOpen={setIsLandmassModalOpen}
        handleCommitLandmass={handleCommitLandmass}
        terrainRenderMode={terrainRenderMode}

        isUvttModalOpen={isUvttModalOpen}
        setIsUvttModalOpen={setIsUvttModalOpen}
        handleImportCompleteUvtt={handleImportCompleteUvtt}

        isAssetManagerOpen={isAssetManagerOpen}
        setIsAssetManagerOpen={setIsAssetManagerOpen}
        universeState={universeState}
        addCustomTerrain={addCustomTerrain}
        updateCustomTerrain={updateCustomTerrain}
        deleteCustomTerrain={deleteCustomTerrain}
        addCustomObject={addCustomObject}
        updateCustomObject={updateCustomObject}
        deleteCustomObject={deleteCustomObject}
        currentMap={currentMap}

        isHeroDrawerOpen={isHeroDrawerOpen}
        setIsHeroDrawerOpen={setIsHeroDrawerOpen}
        handleSummonHeroToken={handleSummonHeroToken}

        isOmnicortexDrawerOpen={isOmnicortexDrawerOpen}
        setIsOmnicortexDrawerOpen={setIsOmnicortexDrawerOpen}
        handleSummonOmnicortexAsset={handleSummonOmnicortexAsset}

        inspectingInteractiveObj={inspectingInteractiveObj}
        setInspectingInteractiveObj={setInspectingInteractiveObj}
        recordHistory={recordHistory}
        localObjects={localObjects}
        setLocalObjects={setLocalObjects}
        interactiveObjMgrRef={interactiveObjMgrRef}
        updateMap={updateMap}

        isHazmatModalOpen={isHazmatModalOpen}
        setIsHazmatModalOpen={setIsHazmatModalOpen}
        hazardSimulatorRef={hazardSimulatorRef}
        setHazardCount={setHazardCount}

        isLayersPanelOpen={isLayersPanelOpen}
        setIsLayersPanelOpen={setIsLayersPanelOpen}
        toggleLayerVisibility={toggleLayerVisibility}
        toggleLayerLock={toggleLayerLock}

        isUnderlayModalOpen={isUnderlayModalOpen}
        setIsUnderlayModalOpen={setIsUnderlayModalOpen}
        underlayConfig={underlayConfig}
        setUnderlayConfig={setUnderlayConfig}

        isAssetStudioOpen={isAssetStudioOpen}
        setIsAssetStudioOpen={setIsAssetStudioOpen}
        selectedStudioAsset={selectedStudioAsset}
        onSaveStudioAsset={(updated) => {
          setSelectedStudioAsset(updated);
          if (!updated) return;
          const persistedUnit = {
            ...updated,
            provenance: {
              ...(updated.provenance || {}),
              source: 'custom_upload',
              updatedAt: new Date().toISOString()
            }
          };
          const texUrl = persistedUnit.visuals?.baseTexture || persistedUnit.visuals?.thumbnail || '';
          const mapScale = currentMap?.scale || currentMap?.type || 'Encounter';
          const gSize = currentMap?.gridSize || 50;

          if (persistedUnit.category === 'terrain_brush') {
            const existing = (universeState?.customAssets?.terrains || []).some((t: any) => t.id === persistedUnit.unit_id);
            const terrainAsset = {
              id: persistedUnit.unit_id,
              label: persistedUnit.name,
              name: persistedUnit.name,
              scale: mapScale,
              textureUrl: texUrl,
              color: '#06b6d4',
              assetUnit: persistedUnit
            };
            if (existing) updateCustomTerrain?.(persistedUnit.unit_id, terrainAsset);
            else addCustomTerrain?.(terrainAsset);
          } else {
            const existing = (universeState?.customAssets?.objects || []).some((o: any) => o.id === persistedUnit.unit_id);
            const objAsset = {
              id: persistedUnit.unit_id,
              label: persistedUnit.name,
              name: persistedUnit.name,
              scale: mapScale,
              category: persistedUnit.category || 'Custom',
              imageUrl: texUrl,
              width: (persistedUnit.dimensions?.[0] || 1) * gSize,
              height: (persistedUnit.dimensions?.[1] || 1) * gSize,
              assetUnit: persistedUnit
            };
            if (existing) updateCustomObject?.(persistedUnit.unit_id, objAsset);
            else addCustomObject?.(objAsset);
          }

          try {
            const raw = localStorage.getItem('tangent_custom_asset_units');
            const parsed = raw ? JSON.parse(raw) : [];
            const list = Array.isArray(parsed) ? parsed : [];
            const idx = list.findIndex((u: any) => u.unit_id === persistedUnit.unit_id);
            const nextList = idx >= 0
              ? list.map((u: any, i: number) => (i === idx ? persistedUnit : u))
              : [...list, persistedUnit];
            localStorage.setItem('tangent_custom_asset_units', JSON.stringify(nextList));
          } catch {
            // Ignore storage quota errors
          }

          setCombatLog(prev => [
            `[ASSET FORGE] Saved & persisted "${updated.name}" to campaign asset library.`,
            ...prev.slice(0, 8)
          ]);
        }}
        isAssetIngestionOpen={isAssetIngestionOpen}
        setIsAssetIngestionOpen={setIsAssetIngestionOpen}
        onAssetIngested={handleAssetIngested}
        isSpriteSheetCutterOpen={isSpriteSheetCutterOpen}
        setIsSpriteSheetCutterOpen={setIsSpriteSheetCutterOpen}
      />

      {!isEmbeddedInTripartite && (
        <>
          <StageAudioMixerDrawer
            isOpen={isAudioMixerOpen}
            onClose={() => setIsAudioMixerOpen(false)}
            isArchitect={effectiveIsArchitectRole}
          />
          <HandoutBroadcastOverlay
            isPushModalOpen={isHandoutPushOpen}
            onClosePushModal={() => setIsHandoutPushOpen(false)}
            isArchitect={effectiveIsArchitectRole}
          />
        </>
      )}
    </div>
  );
};

export default StageView;
