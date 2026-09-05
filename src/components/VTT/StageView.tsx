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
import { 
  RendererContext, 
  LayerCompositor, 
  ZLayer, 
  FrustumChunkManager, 
  CoordinateEngine, 
  GridType, 
  GridScaleTier, 
  GRID_SCALE_CONFIGS,
  useEngineStore,
  selectAllFusedTokens,
  InteractiveObjectManager,
  type SceneInteractiveObject,
  type FusedToken,
  type StaticEntity,
  CombatArbitrator,
  SkillRank,
  SizeCategory,
  RangeCategory,
  DamagePipeline,
  DiceASTParser,
  EssenceTracker,
  BVHBuilder,
  type WallSegment,
  DashboardOverlay
} from '../../engine/index.ts';
import { useCampaign, formatExportFilename } from '../../context/CampaignContext';
import { TokenRadialMenu } from './TokenRadialMenu';
import { 
  ArchitectDesignPalette, 
  type PaletteItem, 
  type ArchitectDesignTool,
  BIOME_OPTIONS 
} from './ArchitectDesignPalette';
import { StageTopToolbar } from './StageTopToolbar';
import { HazardParticleSimulator, type HazardType, type HazardField } from '../../engine/physics/HazardParticleSimulator.ts';
import { Graphics, Container, Text, TextStyle, Sprite } from 'pixi.js';
import { 
  LightSourceManager, 
  type SceneLightSource, 
  type AtmosphericWeatherType, 
  ATMOSPHERIC_PRESETS,
  type LightAnimationType 
} from '../../engine/vision/LightSourceManager';
import { 
  Crosshair, 
  Dices, 
  Users, 
  Box, 
  Clock, 
  Bot,
  Minus,
  ChevronLeft
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { createTacticalPing, filterExpiredPings } from '../../services/mapPingService';
import { DEFAULT_LAYERS } from '../../pages/Foundry/MapMaker/map/MapConstants';
import { useMapHistory } from '../../pages/Foundry/MapMaker/hooks/useMapHistory';

// Map Maker Modals & Drawers
import LandmassGeneratorModal from '../../pages/Foundry/MapMaker/map/LandmassGeneratorModal.jsx';
import { UvttImportModal } from '../../pages/Foundry/MapMaker/map/UvttImportModal.jsx';
import MapAssetManagerModal from '../../pages/Foundry/MapMaker/map/MapAssetManagerModal.jsx';
import MapUnderlayCalibrationModal from '../../pages/Foundry/MapMaker/map/MapUnderlayCalibrationModal.jsx';
import { FolioHeroTokenDrawer } from '../../pages/Foundry/MapMaker/map/FolioHeroTokenDrawer.jsx';
import { OmnicortexAssetDrawer } from '../../pages/Foundry/MapMaker/map/OmnicortexAssetDrawer.jsx';
import InteractiveObjectModal from '../../pages/Foundry/MapMaker/map/InteractiveObjectModal.jsx';
import HazmatVolumeManagerModal from '../../pages/Foundry/MapMaker/map/HazmatVolumeManagerModal.jsx';
import MapLayersPanel from '../../pages/Foundry/MapMaker/map/MapLayersPanel.jsx';
import { createRoomWalls, snapPointToAngle, findNearestWallVertex } from '../../schemas/vttWallSchema.js';
import { v4 as uuidv4 } from 'uuid';

export interface StageViewProps {
  campaignId?: string;
  sceneId?: string;
}

export const StageView: React.FC<StageViewProps> = ({
  campaignId = 'campaign_alpha'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererContextRef = useRef<RendererContext | null>(null);
  const layerCompositorRef = useRef<LayerCompositor | null>(null);
  const chunkManagerRef = useRef<FrustumChunkManager | null>(null);
  const coordEngineRef = useRef<CoordinateEngine>(new CoordinateEngine(GridType.Square, 70, GridScaleTier.Encounter));
  const interactiveObjMgrRef = useRef<InteractiveObjectManager>(new InteractiveObjectManager());
  const bvhBuilderRef = useRef<BVHBuilder>(new BVHBuilder());
  const combatArbRef = useRef<CombatArbitrator>(new CombatArbitrator());
  const damagePipeRef = useRef<DamagePipeline>(new DamagePipeline());
  const diceParserRef = useRef<DiceASTParser>(new DiceASTParser());
  const essenceTrackerRef = useRef<EssenceTracker>(new EssenceTracker());
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
  const underlayContainerRef = useRef<Container | null>(null);
  const lightSourceMgrRef = useRef<LightSourceManager>(new LightSourceManager());

  // Campaign Context and Search Params Integration
  const [searchParams, setSearchParams] = useSearchParams();
  const mapIdParam = searchParams.get('mapId');
  const { 
    universeState, 
    activeMapId, 
    setActiveMapId, 
    addMap, 
    updateMap, 
    deleteMap,
    addCustomTerrain,
    updateCustomTerrain,
    deleteCustomTerrain,
    addCustomObject,
    updateCustomObject,
    deleteCustomObject
  } = useCampaign();
  const [currentMapId, setCurrentMapId] = useState<string>(mapIdParam || activeMapId || '');

  const availableMaps = universeState?.maps || [];
  const currentMap = availableMaps.find((m: any) => m.id === currentMapId) || availableMaps[0] || null;

  // In-Situ Architect Design Mode & Simulation Control States
  const [isDesignModeActive, setIsDesignModeActive] = useState<boolean>(false);
  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);
  const [isTacticalConsoleCollapsed, setIsTacticalConsoleCollapsed] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [activeDesignTool, setActiveDesignTool] = useState<ArchitectDesignTool>('select');
  const [selectedStamp, setSelectedStamp] = useState<PaletteItem | null>(null);
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [localWalls, setLocalWalls] = useState<WallSegment[]>([]);
  const [localObjects, setLocalObjects] = useState<SceneInteractiveObject[]>([]);
  const [localLights, setLocalLights] = useState<SceneLightSource[]>([]);

  // Multi-Asset Selection & Transform Gizmo States
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isMarqueeActive, setIsMarqueeActive] = useState<boolean>(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number } | null>(null);

  // Geometric Wall Construction Modes ('single' | 'chain' | 'room')
  const [wallConstructionMode, setWallConstructionMode] = useState<'single' | 'chain' | 'room'>('single');
  const [wallChainPoints, setWallChainPoints] = useState<{ x: number; y: number }[]>([]);

  // Design Tool Sub-options
  const [selectedWallType, setSelectedWallType] = useState<string>('solid');
  const [doorLockDc, setDoorLockDc] = useState<number>(14);
  const [selectedTerrainId, setSelectedTerrainId] = useState<string>('grassland');
  const [terrainBrushWidth, setTerrainBrushWidth] = useState<number>(30);
  const [terrainRenderMode, setTerrainRenderMode] = useState<'organic' | 'hex'>('organic');
  const [pencilColor, setPencilColor] = useState<string>('#22d3ee');
  const [pencilWidth, setPencilWidth] = useState<number>(4);
  const [textLabelInput, setTextLabelInput] = useState<string>('Sector Alpha');
  const [textColor, setTextColor] = useState<string>('#22d3ee');
  const [textSize, setTextSize] = useState<number>(20);
  const [rulerAvailableAp, setRulerAvailableAp] = useState<number>(4);

  // Lighting & Atmospheric States
  const [selectedLightColor, setSelectedLightColor] = useState<string>('#f59e0b');
  const [selectedLightRadius, setSelectedLightRadius] = useState<number>(180);
  const [selectedLightAnimation, setSelectedLightAnimation] = useState<LightAnimationType>('flicker');
  const [atmosphericWeather, setAtmosphericWeather] = useState<AtmosphericWeatherType>('clear');

  // Randomization Jitter States
  const [randomizeRotation, setRandomizeRotation] = useState<boolean>(false);
  const [randomizeScale, setRandomizeScale] = useState<boolean>(false);

  // Interactive Canvas Drawing States
  const [isDrawingToolActive, setIsDrawingToolActive] = useState<boolean>(false);
  const [wallDrawStart, setWallDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [wallDrawCurrent, setWallDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<number[]>([]);

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

  // Tactical Radar Pings
  const [activePings, setActivePings] = useState<any[]>([]);

  // Undo / Redo History Integration
  const { undoStack, redoStack, recordHistory, handleUndo, handleRedo, lastActionDescription } = useMapHistory({
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
    activeMapId: currentMap?.id || ''
  });

  // Viewport & Coordinate States
  const [scaleTier, setScaleTier] = useState<GridScaleTier>(GridScaleTier.Encounter);
  const [gridType, setGridType] = useState<GridType>(GridType.Square);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>('op-jax');
  const [targetTokenId, setTargetTokenId] = useState<string | null>('mech-vanguard');
  const [isGridVisible, setIsGridVisible] = useState(true);
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

  // Environmental FX & Dynamic Lighting States
  const [isDynamicLightingEnabled, setIsDynamicLightingEnabled] = useState<boolean>(true);
  const [hazardCount, setHazardCount] = useState<number>(0);
  const [isMultiplayerSimActive, setIsMultiplayerSimActive] = useState<boolean>(false);

  // Pan & Zoom Navigation States
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tactical Movement & Action States
  const [isMoveModeActive, setIsMoveModeActive] = useState(false);
  const [mouseWorldPos, setMouseWorldPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeStance, setActiveStance] = useState<'normal' | 'guard' | 'overcharge' | 'aim'>('normal');

  // Active Tool Panel Tab & Combat States
  const [activeTab, setActiveTab] = useState<'combat' | 'spawner' | 'turns' | 'objects' | 'dice'>('combat');
  const [targetedLimb, setTargetedLimb] = useState<'torso' | 'head' | 'arms' | 'legs' | 'optics'>('torso');
  const [combatLog, setCombatLog] = useState<string[]>([
    '[SYSTEM] Stage WebGPU Engine initialized at 5ft Encounter scale.',
    '[SYSTEM] Operatives and Mecha units synchronized with Folio & Omnicortex.'
  ]);
  const [attackWeapon, setAttackWeapon] = useState<'kinetic' | 'plasma' | 'laser' | 'emp'>('plasma');
  const [attackMapStep, setAttackMapStep] = useState<number>(0);
  const [customDiceExpr, setCustomDiceExpr] = useState<string>('2d10 + @armor_dr');

  // Turn Tracker States
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [initiativeScores, setInitiativeScores] = useState<Record<string, number>>({});

  const tokens = useEngineStore(selectAllFusedTokens);
  const selectedToken = tokens.find(t => t.id === selectedTokenId) || null;
  const targetToken = tokens.find(t => t.id === targetTokenId) || null;

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

  // Handle new map creation
  const handleAddNewMap = (title: string, mapType: string) => {
    const newId = uuidv4();
    const newMap = {
      id: newId,
      title: title || 'New Sector Map',
      name: title || 'New Sector Map',
      type: mapType || 'Tactical',
      gridMode: gridType === GridType.Square ? 'square' : 'hex',
      lines: [],
      tokens: [],
      terrains: [],
      objects: [],
      texts: [],
      walls: [],
      fog: [],
      layers: DEFAULT_LAYERS
    };
    if (addMap) addMap(newMap);
    handleSelectMap(newId);
    AudioService.playCriticalChime(true);
    setCombatLog(prev => [
      `[MAP] Created and loaded new sector: "${newMap.title}" [${newMap.type}].`,
      ...prev.slice(0, 8)
    ]);
  };

  // Handle map deletion
  const handleDeleteCurrentMap = () => {
    if (!currentMap) return;
    const targetTitle = currentMap.title || currentMap.name || 'Untitled Map';
    if (window.confirm(`Are you sure you want to delete tactical sector map "${targetTitle}"?`)) {
      if (deleteMap) deleteMap(currentMap.id);
      const nextMap = availableMaps.find((m: any) => m.id !== currentMap.id);
      if (nextMap) {
        handleSelectMap(nextMap.id);
      }
      AudioService.playTerminalBeep(800, 0.05);
    }
  };

  // Ingest Campaign Map (Walls into BVH, Objects into InteractiveObjMgr, Tokens into VolatileSharder)
  useEffect(() => {
    const store = useEngineStore.getState();

    if (currentMap) {
      setCombatLog(prev => [
        `[MAP SYNC] Synchronized with Campaign Map: "${currentMap.title || currentMap.name || 'Tactical Sector'}" [${currentMap.type || 'Sector'}].`,
        ...prev.slice(0, 8)
      ]);

      // 1. Ingest Walls & Bulkheads into BVH spatial tree & local state
      if (Array.isArray(currentMap.walls) && currentMap.walls.length > 0) {
        const bvhWalls: WallSegment[] = currentMap.walls.map((w: any) => ({
          id: w.id || `wall-${Math.random()}`,
          p1: w.p1 || { x: w.x1 || 0, y: w.y1 || 0 },
          p2: w.p2 || { x: w.x2 || 100, y: w.y2 || 100 },
          isDynamic: Boolean(w.isDoor || w.wallType?.includes('door') || w.wallType?.includes('bulkhead')),
          isOpen: w.doorState === 'open',
          isTransparent: Boolean(w.isTransparent || w.wallType?.includes('window') || w.wallType?.includes('glass'))
        }));
        bvhBuilderRef.current.build(bvhWalls);
        setLocalWalls(bvhWalls);
      } else {
        setLocalWalls([]);
      }

      // 2. Ingest Interactive Map Objects into local state
      if (Array.isArray(currentMap.objects) && currentMap.objects.length > 0) {
        const sceneObjects: SceneInteractiveObject[] = currentMap.objects.map((obj: any) => ({
          id: obj.id,
          name: obj.name || obj.label || obj.type || 'Object',
          type: (obj.type || 'terminal') as any,
          x: obj.x || 100,
          y: obj.y || 100,
          storyElementId: obj.storyElementId || obj.id
        }));
        interactiveObjMgrRef.current.loadObjects(sceneObjects);
        setLocalObjects(sceneObjects);
      } else {
        setLocalObjects([]);
      }

      // 3. Ingest Map Tokens
      if (Array.isArray(currentMap.tokens) && currentMap.tokens.length > 0) {
        const staticBatch: StaticEntity[] = currentMap.tokens.map((t: any) => ({
          id: t.id,
          name: t.name || t.label || 'Operative',
          base_hp: t.base_hp || t.hp?.max || 35,
          tech_level: t.tech_level || 3,
          armor_dr: t.armor_dr || t.dr || 10,
          size_modifier: t.size_modifier || 0,
          speed_ft: t.speed_ft || 30,
          species: t.species || 'Human',
          archetype: t.archetype || 'Operative',
          is_persona: t.is_persona !== false
        }));
        store.loadStaticEntitiesBatch(staticBatch);
        currentMap.tokens.forEach((t: any) => {
          store.updatePosition(t.id, t.x || 140, t.y || 140);
        });

        if (currentMap.tokens[0]?.id) {
          setSelectedTokenId(currentMap.tokens[0].id);
        }
        if (currentMap.tokens[1]?.id) {
          setTargetTokenId(currentMap.tokens[1].id);
        }
      }

      // 4. Ingest Dynamic Lights into LightSourceManager & local state
      if (Array.isArray(currentMap.lights) && currentMap.lights.length > 0) {
        currentMap.lights.forEach((l: any) => lightSourceMgrRef.current.addLight(l));
        setLocalLights(currentMap.lights);
      } else {
        setLocalLights([]);
      }

      // 5. Ingest Blueprint Underlay Configuration
      if (currentMap.underlay) {
        setUnderlayConfig(currentMap.underlay);
      }

      // 6. Ingest Global Atmospheric Weather
      if (currentMap.atmosphericWeather) {
        setAtmosphericWeather(currentMap.atmosphericWeather);
      }
    }
  }, [currentMap]);

  // ── Render Walls & Bulkheads onto the Stage ──
  useEffect(() => {
    const compositor = layerCompositorRef.current;
    if (!compositor) return;

    const wallLayer = compositor.getLayer(ZLayer.UnderlayDebris);
    if (!wallLayer) return;

    wallLayer.removeChildren();

    const g = new Graphics();
    localWalls.forEach(wall => {
      const isDoor = wall.isDynamic;
      const isOpen = wall.isOpen;
      const isWindow = (wall as any).isTransparent;

      const strokeColor = isDoor 
        ? (isOpen ? 0x10b981 : 0xf59e0b) 
        : isWindow 
          ? 0x38bdf8 
          : 0x06b6d4;

      g.moveTo(wall.p1.x, wall.p1.y);
      g.lineTo(wall.p2.x, wall.p2.y);
      g.stroke({ 
        width: isDoor ? 5 : isWindow ? 3 : 4, 
        color: strokeColor, 
        alpha: isOpen ? 0.4 : 0.95 
      });

      // End caps
      g.circle(wall.p1.x, wall.p1.y, 3.5);
      g.fill({ color: strokeColor });
      g.circle(wall.p2.x, wall.p2.y, 3.5);
      g.fill({ color: strokeColor });
    });

    wallLayer.addChild(g);
  }, [localWalls]);

  // ── Render Terrains (Hex Tiles & Organic Polygons) onto BackgroundMap Layer ──
  useEffect(() => {
    const container = terrainsContainerRef.current;
    if (!container) return;
    container.removeChildren();

    const terrains = currentMap?.terrains || [];
    if (terrains.length === 0) return;

    const g = new Graphics();
    terrains.forEach((t: any) => {
      let colorHex = 0x14532d;
      if (t.color) {
        if (typeof t.color === 'string') {
          colorHex = parseInt(t.color.replace('#', '0x'), 16) || 0x14532d;
        } else if (typeof t.color === 'number') {
          colorHex = t.color;
        }
      }

      if (t.renderType === 'hexTile' && t.x !== undefined && t.y !== undefined) {
        const radius = t.radius || 40;
        const sides = 6;
        const pts: number[] = [];
        for (let i = 0; i < sides; i++) {
          const angle = (i * Math.PI) / 3;
          pts.push(t.x + radius * Math.cos(angle), t.y + radius * Math.sin(angle));
        }
        g.poly(pts);
        g.fill({ color: colorHex, alpha: 0.85 });
        g.stroke({ width: 1, color: 0x000000, alpha: 0.3 });
      } else if (t.points && t.points.length >= 4) {
        if (t.closed || t.renderType === 'polygon') {
          g.poly(t.points);
          g.fill({ color: colorHex, alpha: 0.85 });
          g.stroke({ width: t.strokeWidth || 2, color: colorHex, alpha: 0.95 });
        } else {
          g.moveTo(t.points[0], t.points[1]);
          for (let i = 2; i < t.points.length; i += 2) {
            g.lineTo(t.points[i], t.points[i+1]);
          }
          g.stroke({ width: t.strokeWidth || 30, color: colorHex, cap: 'round', join: 'round', alpha: 0.85 });
        }
      }
    });

    container.addChild(g);
  }, [currentMap?.terrains]);

  // ── Render Freehand Tactical Pencil Lines onto UnderlayDebris Layer ──
  useEffect(() => {
    const container = linesContainerRef.current;
    if (!container) return;
    container.removeChildren();

    const lines = currentMap?.lines || [];
    if (lines.length === 0) return;

    const g = new Graphics();
    lines.forEach((l: any) => {
      if (l.points && l.points.length >= 4) {
        const colorHex = l.color 
          ? (typeof l.color === 'string' ? parseInt(l.color.replace('#', '0x'), 16) || 0x22d3ee : l.color)
          : 0x22d3ee;
        g.moveTo(l.points[0], l.points[1]);
        for (let i = 2; i < l.points.length; i += 2) {
          g.lineTo(l.points[i], l.points[i+1]);
        }
        g.stroke({ width: l.strokeWidth || 4, color: colorHex, cap: 'round', join: 'round', alpha: 0.9 });
      }
    });

    container.addChild(g);
  }, [currentMap?.lines]);

  // ── Render Text Labels onto ForegroundUI Layer ──
  useEffect(() => {
    const container = textsContainerRef.current;
    if (!container) return;
    container.removeChildren();

    const texts = currentMap?.texts || [];
    if (texts.length === 0) return;

    texts.forEach((t: any) => {
      const textNode = new Container();
      textNode.x = t.x || 100;
      textNode.y = t.y || 100;

      const style = new TextStyle({
        fontFamily: 'monospace',
        fontSize: t.fontSize || 16,
        fill: t.fill || '#22d3ee',
        fontWeight: 'bold'
      });

      const pixiText = new Text({ text: t.text || 'Label', style });
      pixiText.anchor.set(0.5, 0.5);

      const bg = new Graphics();
      const padX = 8;
      const padY = 4;
      const w = pixiText.width + padX * 2;
      const h = pixiText.height + padY * 2;
      bg.roundRect(-w / 2, -h / 2, w, h, 6);
      bg.fill({ color: 0x050811, alpha: 0.75 });
      bg.stroke({ width: 1, color: 0x06b6d4, alpha: 0.5 });

      textNode.addChild(bg);
      textNode.addChild(pixiText);
      container.addChild(textNode);
    });
  }, [currentMap?.texts]);

  // ── Render Dynamic Drawing Preview (Live Wall Drag Line or Live Brush Stroke) ──
  useEffect(() => {
    const container = wallPreviewContainerRef.current;
    if (!container) return;
    container.removeChildren();

    if (!isDrawingToolActive || !isDesignModeActive) return;

    const g = new Graphics();
    if (activeDesignTool === 'wall' && wallDrawStart && wallDrawCurrent) {
      const isDoor = selectedWallType === 'door';
      const isWindow = selectedWallType === 'window';
      const color = isDoor ? 0xf59e0b : isWindow ? 0x38bdf8 : 0x06b6d4;

      if (wallConstructionMode === 'room') {
        const minX = Math.min(wallDrawStart.x, wallDrawCurrent.x);
        const maxX = Math.max(wallDrawStart.x, wallDrawCurrent.x);
        const minY = Math.min(wallDrawStart.y, wallDrawCurrent.y);
        const maxY = Math.max(wallDrawStart.y, wallDrawCurrent.y);
        const w = maxX - minX;
        const h = maxY - minY;

        g.rect(minX, minY, w, h);
        g.fill({ color, alpha: 0.08 });
        g.stroke({ width: 3.5, color, alpha: 0.95 });

        // Draw 4 corner points
        [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]].forEach(([cx, cy]) => {
          g.circle(cx, cy, 4.5);
          g.fill({ color: 0xffffff });
          g.stroke({ width: 1.5, color });
        });
      } else {
        // Single or Chain wall segment
        g.moveTo(wallDrawStart.x, wallDrawStart.y);
        g.lineTo(wallDrawCurrent.x, wallDrawCurrent.y);
        g.stroke({ width: 4, color, alpha: 0.9 });

        g.circle(wallDrawStart.x, wallDrawStart.y, 5);
        g.fill({ color: 0xffffff });
        g.circle(wallDrawCurrent.x, wallDrawCurrent.y, 5);
        g.fill({ color });

        // Draw previously chained vertices
        if (wallChainPoints.length > 1) {
          g.moveTo(wallChainPoints[0].x, wallChainPoints[0].y);
          for (let i = 1; i < wallChainPoints.length; i++) {
            g.lineTo(wallChainPoints[i].x, wallChainPoints[i].y);
          }
          g.stroke({ width: 3.5, color, alpha: 0.6 });
        }
      }
    } else if ((activeDesignTool === 'terrain' || activeDesignTool === 'pencil') && currentStrokePoints.length >= 4) {
      const color = activeDesignTool === 'pencil' 
        ? (typeof pencilColor === 'string' ? parseInt(pencilColor.replace('#', '0x'), 16) || 0x22d3ee : pencilColor)
        : 0x10b981;
      const strokeW = activeDesignTool === 'pencil' ? pencilWidth : terrainBrushWidth;

      g.moveTo(currentStrokePoints[0], currentStrokePoints[1]);
      for (let i = 2; i < currentStrokePoints.length; i += 2) {
        g.lineTo(currentStrokePoints[i], currentStrokePoints[i+1]);
      }
      g.stroke({ width: strokeW, color, cap: 'round', join: 'round', alpha: 0.8 });
    }

    container.addChild(g);
  }, [isDrawingToolActive, isDesignModeActive, activeDesignTool, wallDrawStart, wallDrawCurrent, currentStrokePoints, selectedWallType, pencilColor, pencilWidth, terrainBrushWidth]);

  // ── Render Animated Tactical Radar Pings ──
  useEffect(() => {
    const container = pingsContainerRef.current;
    if (!container) return;
    container.removeChildren();

    if (activePings.length === 0) return;

    const g = new Graphics();
    const now = Date.now();
    activePings.forEach((p: any) => {
      const elapsed = (now - p.timestamp) / 1000;
      if (elapsed < 4.0) {
        const progress = elapsed / 4.0;
        const radius = 15 + progress * 80;
        const alpha = (1 - progress) * 0.9;
        const color = p.color 
          ? (typeof p.color === 'string' ? parseInt(p.color.replace('#', '0x'), 16) || 0x06b6d4 : p.color)
          : 0x06b6d4;

        g.circle(p.x, p.y, radius);
        g.stroke({ width: 2, color, alpha });

        g.circle(p.x, p.y, 5);
        g.fill({ color, alpha });
      }
    });

    container.addChild(g);
  }, [activePings]);

  // ── Render Transform Gizmo & Marquee Selection on ForegroundUI ──
  useEffect(() => {
    const container = transformGizmoContainerRef.current;
    if (!container) return;
    container.removeChildren();

    const g = new Graphics();

    // 1. Draw Marquee Selection Box
    if (isMarqueeActive && marqueeStart && marqueeCurrent) {
      const minX = Math.min(marqueeStart.x, marqueeCurrent.x);
      const maxX = Math.max(marqueeStart.x, marqueeCurrent.x);
      const minY = Math.min(marqueeStart.y, marqueeCurrent.y);
      const maxY = Math.max(marqueeStart.y, marqueeCurrent.y);
      const w = maxX - minX;
      const h = maxY - minY;

      g.rect(minX, minY, w, h);
      g.fill({ color: 0x06b6d4, alpha: 0.12 });
      g.stroke({ width: 1.5, color: 0x22d3ee, alpha: 0.95 });
    }

    // 2. Draw Bounding Box & Transform Gizmo on Selected Assets
    if (selectedAssetIds.length > 0) {
      // Find all selected items (objects, tokens, walls)
      const selectedObjs = localObjects.filter(o => selectedAssetIds.includes(o.id));
      const selectedToks = tokens.filter(t => selectedAssetIds.includes(t.id));
      const selectedW = localWalls.filter(w => selectedAssetIds.includes(w.id));

      const points: { x: number; y: number }[] = [];
      selectedObjs.forEach(o => {
        points.push({ x: o.x - 20, y: o.y - 20 }, { x: o.x + 20, y: o.y + 20 });
      });
      selectedToks.forEach(t => {
        const rad = 25;
        points.push({ x: t.x - rad, y: t.y - rad }, { x: t.x + rad, y: t.y + rad });
      });
      selectedW.forEach(w => {
        points.push(w.p1, w.p2);
      });

      if (points.length > 0) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        points.forEach(p => {
          minX = Math.min(minX, p.x);
          maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y);
          maxY = Math.max(maxY, p.y);
        });

        // Add 8px margin
        minX -= 8;
        minY -= 8;
        maxX += 8;
        maxY += 8;
        const boxW = maxX - minX;
        const boxH = maxY - minY;

        // Bounding Rectangle
        g.rect(minX, minY, boxW, boxH);
        g.stroke({ width: 1.5, color: 0x38bdf8, alpha: 0.9 });

        // 8 Scale Handles
        const handles = [
          [minX, minY], [minX + boxW / 2, minY], [maxX, minY],
          [maxX, minY + boxH / 2],
          [maxX, maxY], [minX + boxW / 2, maxY], [minX, maxY],
          [minX, minY + boxH / 2]
        ];
        handles.forEach(([hx, hy]) => {
          g.rect(hx - 3.5, hy - 3.5, 7, 7);
          g.fill({ color: 0xffffff });
          g.stroke({ width: 1.5, color: 0x0284c7 });
        });

        // Rotation Stem Anchor
        const stemX = minX + boxW / 2;
        const stemY = minY - 24;
        g.moveTo(minX + boxW / 2, minY);
        g.lineTo(stemX, stemY);
        g.stroke({ width: 1.5, color: 0x38bdf8, alpha: 0.8 });

        g.circle(stemX, stemY, 5);
        g.fill({ color: 0x38bdf8 });
        g.stroke({ width: 1.5, color: 0xffffff });

        // Asset Count Badge
        if (selectedAssetIds.length > 1) {
          const badgeStyle = new TextStyle({
            fontFamily: 'monospace',
            fontSize: 10,
            fill: 0x38bdf8,
            fontWeight: 'bold'
          });
          const badgeText = new Text({
            text: `${selectedAssetIds.length} ASSETS SELECTED`,
            style: badgeStyle
          });
          badgeText.x = minX;
          badgeText.y = minY - 16;
          container.addChild(badgeText);
        }
      }
    }

    container.addChild(g);
  }, [selectedAssetIds, isMarqueeActive, marqueeStart, marqueeCurrent, localObjects, tokens, localWalls]);

  // ── Render Dynamic Light Sources on the Stage ──
  useEffect(() => {
    const container = lightsContainerRef.current;
    if (!container) return;
    container.removeChildren();

    if (localLights.length === 0) return;

    localLights.forEach(light => {
      const lightNode = new Container();
      lightNode.x = light.x;
      lightNode.y = light.y;

      const colorHex = typeof light.color === 'string' 
        ? parseInt(light.color.replace('#', '0x'), 16) || 0xf59e0b 
        : light.color;

      const g = new Graphics();
      // Outer subtle falloff halo
      g.circle(0, 0, light.radius);
      g.fill({ color: colorHex, alpha: 0.12 });
      g.stroke({ width: 1, color: colorHex, alpha: 0.25 });

      // Mid intensity circle
      g.circle(0, 0, light.radius * 0.5);
      g.fill({ color: colorHex, alpha: 0.2 });

      // Central core bulb
      g.circle(0, 0, 8);
      g.fill({ color: 0xffffff });
      g.stroke({ width: 2, color: colorHex });

      lightNode.addChild(g);
      container.addChild(lightNode);
    });
  }, [localLights]);

  // ── Render Atmospheric Weather Tint Overlay ──
  useEffect(() => {
    const container = atmosphereOverlayRef.current;
    if (!container) return;
    container.removeChildren();

    const preset = ATMOSPHERIC_PRESETS[atmosphericWeather] || ATMOSPHERIC_PRESETS.clear;
    if (preset.tintAlpha <= 0 && preset.fogDensity <= 0) return;

    const g = new Graphics();
    const width = 3840;
    const height = 2160;
    g.rect(0, 0, width, height);
    g.fill({ color: preset.tintHex, alpha: preset.tintAlpha });

    container.addChild(g);
  }, [atmosphericWeather]);

  // ── Render Background Blueprint Underlay ──
  useEffect(() => {
    const container = underlayContainerRef.current;
    if (!container) return;
    container.removeChildren();

    if (!underlayConfig?.url || !underlayConfig.visible) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = underlayConfig.url;
    img.onload = () => {
      if (!underlayContainerRef.current) return;
      underlayContainerRef.current.removeChildren();

      try {
        const sprite = Sprite.from(img);
        sprite.x = underlayConfig.offsetX || 0;
        sprite.y = underlayConfig.offsetY || 0;
        sprite.scale.set(underlayConfig.scale || 1.0);
        sprite.alpha = underlayConfig.opacity ?? 0.45;
        underlayContainerRef.current.addChild(sprite);
      } catch (err) {
        console.warn('Failed to render underlay sprite:', err);
      }
    };
  }, [underlayConfig]);

  // ── Batch Multi-Asset Selection Actions ──
  const handleBatchDelete = useCallback(() => {
    if (selectedAssetIds.length === 0) return;
    recordHistory(`Delete ${selectedAssetIds.length} Assets`);

    const nextObjects = localObjects.filter(o => !selectedAssetIds.includes(o.id));
    const nextWalls = localWalls.filter(w => !selectedAssetIds.includes(w.id));
    const nextLights = localLights.filter(l => !selectedAssetIds.includes(l.id));
    const nextTexts = (currentMap?.texts || []).filter((t: any) => !selectedAssetIds.includes(t.id));
    const nextLines = (currentMap?.lines || []).filter((l: any) => !selectedAssetIds.includes(l.id));
    const nextTerrains = (currentMap?.terrains || []).filter((t: any) => !selectedAssetIds.includes(t.id));

    setLocalObjects(nextObjects);
    setLocalWalls(nextWalls);
    setLocalLights(nextLights);
    interactiveObjMgrRef.current.loadObjects(nextObjects);
    bvhBuilderRef.current.build(nextWalls);

    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        objects: nextObjects,
        walls: nextWalls,
        lights: nextLights,
        texts: nextTexts,
        lines: nextLines,
        terrains: nextTerrains
      });
    }

    AudioService.playTerminalBeep(700, 0.04);
    setCombatLog(prev => [`[BATCH DELETE] Purged ${selectedAssetIds.length} assets from sector.`, ...prev.slice(0, 8)]);
    setSelectedAssetIds([]);
  }, [selectedAssetIds, localObjects, localWalls, localLights, currentMap, updateMap, recordHistory]);

  const handleBatchDuplicate = useCallback(() => {
    if (selectedAssetIds.length === 0) return;
    recordHistory(`Duplicate ${selectedAssetIds.length} Assets`);

    const offset = gridSnap ? 70 : 25;
    const newSelectedIds: string[] = [];

    // Duplicate Objects
    const clonedObjects: SceneInteractiveObject[] = [];
    localObjects.forEach(o => {
      if (selectedAssetIds.includes(o.id)) {
        const newId = `obj-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        clonedObjects.push({
          ...o,
          id: newId,
          name: `${o.name} (Copy)`,
          x: o.x + offset,
          y: o.y + offset
        });
        newSelectedIds.push(newId);
      }
    });

    // Duplicate Walls
    const clonedWalls: WallSegment[] = [];
    localWalls.forEach(w => {
      if (selectedAssetIds.includes(w.id)) {
        const newId = `wall-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        clonedWalls.push({
          ...w,
          id: newId,
          p1: { x: w.p1.x + offset, y: w.p1.y + offset },
          p2: { x: w.p2.x + offset, y: w.p2.y + offset }
        });
        newSelectedIds.push(newId);
      }
    });

    // Duplicate Lights
    const clonedLights: SceneLightSource[] = [];
    localLights.forEach(l => {
      if (selectedAssetIds.includes(l.id)) {
        const newId = `light-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        clonedLights.push({
          ...l,
          id: newId,
          x: l.x + offset,
          y: l.y + offset
        });
        newSelectedIds.push(newId);
      }
    });

    const nextObjects = [...localObjects, ...clonedObjects];
    const nextWalls = [...localWalls, ...clonedWalls];
    const nextLights = [...localLights, ...clonedLights];

    setLocalObjects(nextObjects);
    setLocalWalls(nextWalls);
    setLocalLights(nextLights);
    interactiveObjMgrRef.current.loadObjects(nextObjects);
    clonedWalls.forEach(w => bvhBuilderRef.current.addWall(w));

    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        objects: nextObjects,
        walls: nextWalls,
        lights: nextLights
      });
    }
    setSelectedAssetIds(newSelectedIds);
    AudioService.playCriticalChime(true);
    setCombatLog(prev => [`[DUPLICATE] Cloned ${newSelectedIds.length} assets with +${offset}px offset.`, ...prev.slice(0, 8)]);
  }, [selectedAssetIds, localObjects, localWalls, localLights, gridSnap, currentMap, updateMap, recordHistory]);

  const handleBatchNudge = useCallback((dx: number, dy: number) => {
    if (selectedAssetIds.length === 0) return;

    const nextObjects = localObjects.map(o => selectedAssetIds.includes(o.id) ? { ...o, x: o.x + dx, y: o.y + dy } : o);
    const nextWalls = localWalls.map(w => selectedAssetIds.includes(w.id) ? {
      ...w,
      p1: { x: w.p1.x + dx, y: w.p1.y + dy },
      p2: { x: w.p2.x + dx, y: w.p2.y + dy }
    } : w);
    const nextLights = localLights.map(l => selectedAssetIds.includes(l.id) ? { ...l, x: l.x + dx, y: l.y + dy } : l);

    setLocalObjects(nextObjects);
    setLocalWalls(nextWalls);
    setLocalLights(nextLights);
    interactiveObjMgrRef.current.loadObjects(nextObjects);
    bvhBuilderRef.current.build(nextWalls);

    if (currentMap && updateMap) {
      updateMap(currentMap.id, { objects: nextObjects, walls: nextWalls, lights: nextLights });
    }
  }, [selectedAssetIds, localObjects, localWalls, localLights, currentMap, updateMap]);

  const handleDeselectAll = useCallback(() => {
    setSelectedAssetIds([]);
    AudioService.playTerminalBeep(900, 0.02);
  }, []);

  // ── Deploy Item from Architect Design Palette onto the Stage ──
  const deployArchitectItem = (item: PaletteItem, targetX: number, targetY: number) => {
    recordHistory(`Deploy ${item.label}`);
    AudioService.playTerminalBeep(1350, 0.03);

    // Calculate natural scatter jitter
    let targetRotation = 0;
    let targetScale = 1.0;
    if (randomizeRotation) {
      targetRotation = Math.round((Math.random() - 0.5) * 30);
    }
    if (randomizeScale) {
      targetScale = Number((0.85 + Math.random() * 0.3).toFixed(2));
    }

    if (item.type === 'wall') {
      const newWallId = `wall-${Date.now()}`;
      const newWall: WallSegment = {
        id: newWallId,
        p1: { x: targetX, y: targetY },
        p2: { x: targetX + (item.defaultProps?.length || 70), y: targetY },
        isDynamic: Boolean(item.defaultProps?.isDynamic),
        isOpen: false,
        isTransparent: Boolean(item.defaultProps?.isTransparent)
      };
      bvhBuilderRef.current.addWall(newWall);
      const updatedWalls = [...localWalls, newWall];
      setLocalWalls(updatedWalls);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { walls: updatedWalls });
      }

      setCombatLog(prev => [
        `[ARCHITECT] Placed ${item.label} at (${targetX}, ${targetY}). BVH tree rebuilt.`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'object') {
      const newObjId = `obj-${Date.now()}`;
      const newObj: SceneInteractiveObject = {
        id: newObjId,
        name: item.defaultProps?.name || item.label,
        type: (item.subType || 'terminal') as any,
        x: targetX,
        y: targetY,
        storyElementId: item.defaultProps?.storyElementId || `story-${Date.now()}`
      };
      (newObj as any).rotation = targetRotation;
      (newObj as any).scale = targetScale;

      interactiveObjMgrRef.current.loadObjects([...interactiveObjMgrRef.current.getAllObjects(), newObj]);
      const updatedObjects = [...localObjects, newObj];
      setLocalObjects(updatedObjects);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { objects: updatedObjects });
      }

      setCombatLog(prev => [
        `[ARCHITECT] Placed interactive object "${newObj.name}" at (${targetX}, ${targetY})${randomizeRotation || randomizeScale ? ` [Rot: ${targetRotation}°, Scale: ${targetScale}x]` : ''}.`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'hazard') {
      if (hazardSimulatorRef.current) {
        const newHazard: HazardField = {
          id: `hazard-${Date.now()}`,
          x: targetX,
          y: targetY,
          radius: item.defaultProps?.radius || 75,
          type: (item.defaultProps?.hazardType || 'plasma_fire') as HazardType,
          intensity: 1.0
        };
        hazardSimulatorRef.current.addHazardField(newHazard);
        setHazardCount(hazardSimulatorRef.current.getActiveHazards().length);
      }
      setCombatLog(prev => [
        `[ARCHITECT] Created ${item.label} zone at (${targetX}, ${targetY}).`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'prop') {
      const newWallId = `cover-${Date.now()}`;
      const newWall: WallSegment = {
        id: newWallId,
        p1: { x: targetX, y: targetY },
        p2: { x: targetX + 50, y: targetY + 20 },
        isDynamic: false,
        isOpen: false
      };
      bvhBuilderRef.current.addWall(newWall);
      const updatedWalls = [...localWalls, newWall];
      setLocalWalls(updatedWalls);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { walls: updatedWalls });
      }

      setCombatLog(prev => [
        `[ARCHITECT] Placed ${item.label} [${item.defaultProps?.coverType || 'Cover'}] at (${targetX}, ${targetY}).`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'token') {
      const newTokId = `tok-${Date.now()}`;
      const newTok: StaticEntity = {
        id: newTokId,
        name: item.label,
        base_hp: item.defaultProps?.base_hp || 35,
        tech_level: item.defaultProps?.tech_level || 3,
        armor_dr: item.defaultProps?.armor_dr || 10,
        size_modifier: item.defaultProps?.size_modifier || 0,
        speed_ft: item.defaultProps?.speed_ft || 30,
        species: item.subType === 'drone' ? 'Automaton' : item.subType === 'mech' ? 'Mecha' : 'Human',
        archetype: item.label,
        is_persona: Boolean(item.defaultProps?.is_persona)
      };
      useEngineStore.getState().loadStaticEntitiesBatch([newTok]);
      useEngineStore.getState().updatePosition(newTokId, targetX, targetY);

      if (currentMap && updateMap) {
        const existingTokens = currentMap.tokens || [];
        updateMap(currentMap.id, {
          tokens: [...existingTokens, { ...newTok, x: targetX, y: targetY }]
        });
      }

      setCombatLog(prev => [
        `[ARCHITECT] Spawned ${item.label} at (${targetX}, ${targetY}).`,
        ...prev.slice(0, 8)
      ]);
    } else if (item.type === 'light') {
      const newLightId = `light-${Date.now()}`;
      const newLight: SceneLightSource = {
        id: newLightId,
        x: targetX,
        y: targetY,
        radius: item.defaultProps?.radius || selectedLightRadius,
        color: item.defaultProps?.color || selectedLightColor,
        intensity: 1.0,
        falloff: 'smooth',
        animation: (item.defaultProps?.animation || selectedLightAnimation) as LightAnimationType,
        castShadows: true,
        label: item.label || 'Light Fixture'
      };
      lightSourceMgrRef.current.addLight(newLight);
      const nextLights = [...localLights, newLight];
      setLocalLights(nextLights);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { lights: nextLights });
      }
      setCombatLog(prev => [
        `[ARCHITECT] Deployed ${newLight.label} at (${targetX}, ${targetY}).`,
        ...prev.slice(0, 8)
      ]);
    }
  };

  const handleToggleDesignMode = () => {
    setIsDesignModeActive(prev => {
      const next = !prev;
      setIsSimulationPaused(next);
      AudioService.playTerminalBeep(next ? 1500 : 900, 0.04);
      setCombatLog(p => [
        next
          ? `[ARCHITECT MODE] In-situ map design mode active. Tactical simulation paused.`
          : `[ARCHITECT MODE] Resumed live tactical simulation. All assets synchronized.`,
        ...p.slice(0, 8)
      ]);
      return next;
    });
  };

  // ── Initialize PixiJS WebGPU Canvas & Compositor ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDestroyed = false;
    const renderer = new RendererContext();
    rendererContextRef.current = renderer;

    const initRenderer = async () => {
      await renderer.initialize(canvas);
      if (isDestroyed) {
        hazardSimulatorRef.current?.destroy();
        renderer.destroy();
        rendererContextRef.current = null;
        return;
      }

      const app = renderer.getApp();
      const compositor = new LayerCompositor(app);
      layerCompositorRef.current = compositor;

      const chunkMgr = new FrustumChunkManager();
      chunkManagerRef.current = chunkMgr;

      // 0. Blueprint Underlay Container (ZLayer.BackgroundMap)
      const underlayContainer = new Container();
      underlayContainer.label = 'UnderlayBlueprint';
      compositor.addToLayer(underlayContainer, ZLayer.BackgroundMap);
      underlayContainerRef.current = underlayContainer;

      // 1. Terrains Container (ZLayer.BackgroundMap)
      const terrainContainer = new Container();
      terrainContainer.label = 'TerrainLayer';
      compositor.addToLayer(terrainContainer, ZLayer.BackgroundMap);
      terrainsContainerRef.current = terrainContainer;

      // 2. Grid Overlay Container (ZLayer.BackgroundMap)
      const gridContainer = new Container();
      gridContainer.label = 'GridOverlay';
      compositor.addToLayer(gridContainer, ZLayer.BackgroundMap);
      setGridOverlayContainer(gridContainer);

      // 3. Pencil Lines Container (ZLayer.UnderlayDebris)
      const linesContainer = new Container();
      linesContainer.label = 'PencilLinesLayer';
      compositor.addToLayer(linesContainer, ZLayer.UnderlayDebris);
      linesContainerRef.current = linesContainer;

      // 4. Movement Ruler Container (ZLayer.DynamicFX)
      const rulerContainer = new Container();
      rulerContainer.label = 'MovementRuler';
      compositor.addToLayer(rulerContainer, ZLayer.DynamicFX);
      setMoveRulerContainer(rulerContainer);

      // 5. Dynamic Drawing & Wall Preview Container (ZLayer.DynamicFX)
      const drawPreviewContainer = new Container();
      drawPreviewContainer.label = 'DynamicDrawPreview';
      compositor.addToLayer(drawPreviewContainer, ZLayer.DynamicFX);
      wallPreviewContainerRef.current = drawPreviewContainer;

      // 6. Tactical Radar Pings Container (ZLayer.DynamicFX)
      const pingsContainer = new Container();
      pingsContainer.label = 'TacticalPings';
      compositor.addToLayer(pingsContainer, ZLayer.DynamicFX);
      pingsContainerRef.current = pingsContainer;

      // 7. Dynamic Lights Container (ZLayer.DynamicFX)
      const lightsContainer = new Container();
      lightsContainer.label = 'DynamicLightsLayer';
      compositor.addToLayer(lightsContainer, ZLayer.DynamicFX);
      lightsContainerRef.current = lightsContainer;

      // 8. Atmospheric Weather Overlay Container (ZLayer.DynamicFX)
      const atmoContainer = new Container();
      atmoContainer.label = 'AtmosphericWeatherOverlay';
      compositor.addToLayer(atmoContainer, ZLayer.DynamicFX);
      atmosphereOverlayRef.current = atmoContainer;

      // 9. Text Labels Container (ZLayer.ForegroundUI)
      const textsContainer = new Container();
      textsContainer.label = 'TextLabelsLayer';
      compositor.addToLayer(textsContainer, ZLayer.ForegroundUI);
      textsContainerRef.current = textsContainer;

      // 10. Transform Gizmo & Marquee Selection Container (ZLayer.ForegroundUI)
      const gizmoContainer = new Container();
      gizmoContainer.label = 'TransformGizmoLayer';
      compositor.addToLayer(gizmoContainer, ZLayer.ForegroundUI);
      transformGizmoContainerRef.current = gizmoContainer;

      // Initialize Hazard Particle Simulator & Dynamic Lighting on Stage
      const fxLayer = compositor.getLayer(ZLayer.DynamicFX);
      const lightLayer = compositor.getLayer(ZLayer.LightingDarkness);
      const foregroundLayer = compositor.getLayer(ZLayer.ForegroundUI);

      if (fxLayer && lightLayer) {
        const hazardSim = new HazardParticleSimulator(fxLayer, lightLayer);
        hazardSim.initializeCompute(renderer.getGPUDevice());
        hazardSimulatorRef.current = hazardSim;
      }

      // Create Remote Cursors Container for LiveKit Telemetry
      if (foregroundLayer) {
        const cursorsContainer = new Container();
        cursorsContainer.label = 'RemoteCursors';
        foregroundLayer.addChild(cursorsContainer);
        remoteCursorsContainerRef.current = cursorsContainer;
      }

      // PixiJS Ticker Animation Loop for Particle Fields & Dynamic Lighting
      app.ticker.add((ticker) => {
        const timeSec = performance.now() / 1000;
        const currentTokens = selectAllFusedTokens(useEngineStore.getState());
        const lightEmitters = currentTokens.map((t: FusedToken) => ({
          x: t.x,
          y: t.y,
          radius: 180,
          color: t.is_persona ? 0x22d3ee : 0xa855f7,
          intensity: 1.0
        }));

        // Include placed point lights
        const sceneLights = lightSourceMgrRef.current.getAllLights();
        sceneLights.forEach(sl => {
          const animIntensity = lightSourceMgrRef.current.getAnimatedIntensity(sl, timeSec);
          const colorHex = typeof sl.color === 'string' ? parseInt(sl.color.replace('#', '0x'), 16) || 0xf59e0b : sl.color;
          lightEmitters.push({
            x: sl.x,
            y: sl.y,
            radius: sl.radius,
            color: colorHex,
            intensity: animIntensity
          });
        });

        hazardSimulatorRef.current?.update(ticker.deltaTime, lightEmitters);
      });
    };

    initRenderer();

    return () => {
      isDestroyed = true;
      hazardSimulatorRef.current?.destroy();
      renderer.destroy();
      rendererContextRef.current = null;
    };
  }, []);

  // Sync PixiJS Stage Pan & Zoom
  useEffect(() => {
    const renderer = rendererContextRef.current;
    if (!renderer) return;
    const app = renderer.getApp();
    if (!app || !app.stage) return;

    app.stage.scale.set(zoom);
    app.stage.position.set(pan.x, pan.y);
  }, [zoom, pan]);

  // Draw Grid Overlay when Scale Tier / Grid Type / Visibility changes
  const redrawGrid = useCallback(() => {
    if (!gridOverlayContainer || !layerCompositorRef.current) return;

    gridOverlayContainer.removeChildren();
    if (!isGridVisible) return;

    const engine = coordEngineRef.current;
    const cellSize = engine.getCellSizePx();
    const graphics = new Graphics();

    const width = 3840;
    const height = 2160;

    graphics.stroke({ width: 1, color: 0x00ffff, alpha: 0.15 });

    if (gridType === GridType.Square) {
      for (let x = 0; x <= width; x += cellSize) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += cellSize) {
        graphics.moveTo(0, y);
        graphics.lineTo(width, y);
      }
    } else {
      // Hex grid rendering
      const hexRadius = cellSize / 1.5;
      for (let y = 0; y <= height; y += hexRadius * 1.5) {
        const isOdd = Math.floor(y / (hexRadius * 1.5)) % 2 === 1;
        const xOffset = isOdd ? (hexRadius * Math.sqrt(3)) / 2 : 0;
        for (let x = xOffset; x <= width; x += hexRadius * Math.sqrt(3)) {
          const sides = 6;
          const pts: number[] = [];
          for (let i = 0; i < sides; i++) {
            const angle = (i * Math.PI) / 3;
            pts.push(x + hexRadius * Math.cos(angle), y + hexRadius * Math.sin(angle));
          }
          graphics.poly(pts);
        }
      }
    }

    gridOverlayContainer.addChild(graphics);
  }, [gridOverlayContainer, isGridVisible, gridType]);

  useEffect(() => {
    redrawGrid();
  }, [redrawGrid, scaleTier, gridType]);

  // Redraw Movement Distance Range & Waypoint Ruler
  useEffect(() => {
    if (!moveRulerContainer || !selectedToken) return;

    moveRulerContainer.removeChildren();

    const g = new Graphics();
    const cellSizePx = coordEngineRef.current.getCellSizePx();
    const speedRadiusPx = (effectiveSpeedFt / 5) * cellSizePx;
    const sprintRadiusPx = speedRadiusPx * 2;

    // 1. Draw Base Movement Radius (Cyan/Green for 1 Action)
    g.circle(selectedToken.x, selectedToken.y, speedRadiusPx);
    g.stroke({ width: 2, color: 0x10b981, alpha: isMoveModeActive ? 0.75 : 0.35 });
    g.fill({ color: 0x10b981, alpha: isMoveModeActive ? 0.08 : 0.03 });

    // 2. Draw Sprint Radius (Amber/Gold dashed for 2 Actions)
    g.circle(selectedToken.x, selectedToken.y, sprintRadiusPx);
    g.stroke({ width: 1.5, color: 0xf59e0b, alpha: isMoveModeActive ? 0.6 : 0.25 });
    g.fill({ color: 0xf59e0b, alpha: isMoveModeActive ? 0.04 : 0.015 });

    if (isMoveModeActive || activeDesignTool === 'ruler') {
      // 3. Draw Distance Vector to Mouse Cursor
      const dx = mouseWorldPos.x - selectedToken.x;
      const dy = mouseWorldPos.y - selectedToken.y;
      const distPx = Math.sqrt(dx * dx + dy * dy);
      const distFt = Math.round((distPx / cellSizePx) * 5);
      const distCells = Math.round(distPx / cellSizePx);

      const isWalk = distFt <= effectiveSpeedFt;
      const isJog = distFt <= (effectiveSpeedFt * 2);
      const isRun = distFt <= (effectiveSpeedFt * 3);
      const isSprint = distFt <= (effectiveSpeedFt * 4);

      let paceLabel = 'WALK PACE';
      if (!isWalk && isJog) paceLabel = 'JOG PACE';
      else if (!isJog && isRun) paceLabel = 'RUN PACE';
      else if (!isRun && isSprint) paceLabel = 'SPRINT PACE';
      else if (!isSprint) paceLabel = 'EXCEEDS SPRINT PACE';

      const intersectsHazard = (hazardSimulatorRef.current?.getHazardFields?.() || []).some((h: any) => {
        const midX = (selectedToken.x + mouseWorldPos.x) / 2;
        const midY = (selectedToken.y + mouseWorldPos.y) / 2;
        return Math.hypot(h.x - midX, h.y - midY) <= (h.radius || 70);
      });

      const vectorColor = intersectsHazard 
        ? 0xef4444 
        : isWalk 
          ? 0x10b981 
          : isJog 
            ? 0x06b6d4 
            : isSprint 
              ? 0xf59e0b 
              : 0xef4444;

      g.moveTo(selectedToken.x, selectedToken.y);
      g.lineTo(mouseWorldPos.x, mouseWorldPos.y);
      g.stroke({ width: 2.5, color: vectorColor, alpha: 0.9 });

      // Target waypoint marker
      g.circle(mouseWorldPos.x, mouseWorldPos.y, 6);
      g.fill({ color: vectorColor, alpha: 0.9 });
      g.stroke({ width: 2, color: 0xffffff });

      moveRulerContainer.addChild(g);

      // Dynamic Distance & Action Cost Label
      const textStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: 11,
        fill: vectorColor === 0x10b981 ? 0x6ee7b7 : vectorColor === 0x06b6d4 ? 0x67e8f9 : vectorColor === 0xf59e0b ? 0xfcd34d : 0xfca5a5,
        fontWeight: 'bold',
        align: 'center'
      });

      let labelText = `${distFt} FT (${distCells} CELLS) • [${paceLabel}]`;
      if (intersectsHazard) {
        labelText += ' ⚠️ HAZARD!';
      }

      const distLabel = new Text({
        text: labelText,
        style: textStyle
      });
      distLabel.x = (selectedToken.x + mouseWorldPos.x) / 2;
      distLabel.y = (selectedToken.y + mouseWorldPos.y) / 2 - 14;
      distLabel.anchor.set(0.5, 0.5);
      moveRulerContainer.addChild(distLabel);
    } else {
      moveRulerContainer.addChild(g);
    }
  }, [moveRulerContainer, selectedToken, isMoveModeActive, mouseWorldPos, effectiveSpeedFt, activeDesignTool, rulerAvailableAp]);

  // Render Interactive Objects on the Stage
  useEffect(() => {
    const compositor = layerCompositorRef.current;
    if (!compositor) return;

    const objLayer = compositor.getLayer(ZLayer.InteractiveObjects);
    if (!objLayer) return;

    objLayer.removeChildren();

    const objects = interactiveObjMgrRef.current.getAllObjects();
    objects.forEach(obj => {
      const container = new Container();
      container.x = obj.x;
      container.y = obj.y;
      container.eventMode = 'static';
      container.cursor = 'pointer';

      const g = new Graphics();
      if (obj.type === 'bulkhead') {
        const state = interactiveObjMgrRef.current.getObject(obj.id);
        const isOpen = state?.isOpen || false;
        g.rect(-20, -10, 40, 20);
        g.fill({ color: isOpen ? 0x10b981 : 0xef4444, alpha: 0.8 });
        g.stroke({ width: 2, color: 0xffffff });
      } else if (obj.type === 'terminal') {
        g.rect(-15, -15, 30, 30);
        g.fill({ color: 0x3b82f6, alpha: 0.8 });
        g.stroke({ width: 2, color: 0x60a5fa });
      } else {
        g.rect(-12, -12, 24, 24);
        g.fill({ color: 0xf59e0b, alpha: 0.8 });
        g.stroke({ width: 2, color: 0xfbbf24 });
      }

      container.addChild(g);

      container.on('pointerdown', (e) => {
        e.stopPropagation();
        handleObjectClick(obj);
      });

      objLayer.addChild(container);
    });
  }, [tokens, localObjects]);

  // Render Tokens on the Stage with Action Pips & Mortality Indicators
  useEffect(() => {
    const compositor = layerCompositorRef.current;
    if (!compositor) return;

    const tokenLayer = compositor.getLayer(ZLayer.Tokens);
    if (!tokenLayer) return;

    tokenLayer.removeChildren();

    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 10,
      fill: 0xffffff,
      align: 'center'
    });

    tokens.forEach(token => {
      const container = new Container();
      container.x = token.x;
      container.y = token.y;
      container.eventMode = 'static';
      container.cursor = 'pointer';

      const g = new Graphics();
      const isSelected = token.id === selectedTokenId;
      const isTarget = token.id === targetTokenId;
      const isSynthetic = !!token.is_synthetic || (token.species?.toLowerCase().includes('synthetic') ?? false);
      const isDowned = isSynthetic 
        ? (token.current_structure ?? token.base_structure ?? 60) <= 0
        : (token.current_health ?? token.current_hp ?? 30) <= 0;
      const fillColor = isDowned 
        ? 0xef4444 
        : token.is_persona 
          ? 0x06b6d4 
          : 0x8b5cf6;

      const radius = 22 + (token.size_modifier || 0) * 8;

      g.circle(0, 0, radius);
      g.fill({ color: fillColor, alpha: isDowned ? 0.6 : 0.85 });

      if (isSelected) {
        g.stroke({ width: 3.5, color: 0xfacc15 });
      } else if (isTarget) {
        g.stroke({ width: 3.5, color: 0xef4444 });
      } else {
        g.stroke({ width: 1.5, color: 0xffffff });
      }

      // Flashlight indicator
      if (isSelected && isVisionEnabled) {
        const torchPx = (torchRadiusFt / 5) * 70;
        const torchG = new Graphics();
        torchG.circle(0, 0, torchPx);
        torchG.stroke({ width: 1, color: 0xfacc15, alpha: 0.3 });
        torchG.fill({ color: 0xfef08a, alpha: 0.05 });
        container.addChild(torchG);
      }

      container.addChild(g);

      // Render Dual Vitality & Health mini-bars (or Structure for synthetics)
      const barsG = new Graphics();
      const barWidth = Math.max(34, radius * 1.5);
      const barHeight = 2.5;
      const barY = -radius - 7;

      if (isSynthetic) {
        const sCur = token.current_structure ?? token.base_structure ?? 60;
        const sMax = token.base_structure ?? 60;
        const sRatio = Math.max(0, Math.min(1, sCur / sMax));
        barsG.rect(-barWidth / 2, barY, barWidth, barHeight + 1);
        barsG.fill({ color: 0x1e293b, alpha: 0.8 });
        barsG.rect(-barWidth / 2, barY, barWidth * sRatio, barHeight + 1);
        barsG.fill({ color: 0xf59e0b, alpha: 0.95 });
      } else {
        const vCur = token.current_vitality ?? token.base_vitality ?? 30;
        const vMax = token.base_vitality ?? 30;
        const vRatio = Math.max(0, Math.min(1, vCur / vMax));
        const hCur = token.current_health ?? token.current_hp ?? 30;
        const hMax = token.base_health ?? token.base_hp ?? 30;
        const hRatio = Math.max(0, Math.min(1, hCur / hMax));

        // VP Bar (Cyan)
        barsG.rect(-barWidth / 2, barY - 3.5, barWidth, barHeight);
        barsG.fill({ color: 0x1e293b, alpha: 0.8 });
        barsG.rect(-barWidth / 2, barY - 3.5, barWidth * vRatio, barHeight);
        barsG.fill({ color: 0x06b6d4, alpha: 0.95 });

        // HP Bar (Rose)
        barsG.rect(-barWidth / 2, barY, barWidth, barHeight);
        barsG.fill({ color: 0x1e293b, alpha: 0.8 });
        barsG.rect(-barWidth / 2, barY, barWidth * hRatio, barHeight);
        barsG.fill({ color: hCur <= 0 ? 0x991b1b : 0xf43f5e, alpha: 0.95 });
      }
      container.addChild(barsG);

      // Render Action Pips based on Skill Rank
      const skillRank = (token as any).skill_rank ?? 8;
      const actionTier = combatArbRef.current.getActionTier(skillRank);
      const actionCount = actionTier.actionsCount;
      const pipsG = new Graphics();
      const pipsSpacing = 7;
      const startX = -((actionCount - 1) * pipsSpacing) / 2;
      for (let p = 0; p < actionCount; p++) {
        const px = startX + p * pipsSpacing;
        const py = -radius - 14;
        pipsG.poly([px, py - 3, px + 3, py, px, py + 3, px - 3, py]);
        pipsG.fill({ color: 0x06b6d4, alpha: 0.95 });
        pipsG.stroke({ width: 0.8, color: 0xffffff });
      }
      container.addChild(pipsG);

      // Bleeding out state
      if (isDowned) {
        const mortG = new Graphics();
        mortG.circle(0, 0, radius + 4);
        mortG.stroke({ width: 2.5, color: 0xf59e0b, alpha: 0.9 });
        container.addChild(mortG);

        const mortText = new Text({
          text: isSynthetic ? `STRUCTURE COMPROMISED` : `BLEEDING OUT`,
          style: new TextStyle({ fontFamily: 'monospace', fontSize: 8.5, fill: 0xf59e0b, fontWeight: 'bold' })
        });
        mortText.anchor.set(0.5, 2.7);
        container.addChild(mortText);
      }

      // Name & Vitals Label
      const vitHealthText = isSynthetic
        ? `${token.current_structure ?? 60} SP`
        : `${token.current_vitality ?? 30} VP | ${token.current_health ?? token.current_hp ?? 30} HP`;
      const label = new Text({ text: `${token.name} (${vitHealthText})`, style });
      label.anchor.set(0.5, -1.8);
      container.addChild(label);

      // Pointer listeners
      container.on('pointerdown', (e: any) => {
        e.stopPropagation();
        if (e.button === 2 || e.buttons === 2) {
          e.nativeEvent?.preventDefault?.();
          setSelectedTokenId(token.id);
          const canvasBounds = canvasRef.current?.getBoundingClientRect();
          const screenX = canvasBounds ? canvasBounds.left + token.x * zoom + pan.x : token.x;
          const screenY = canvasBounds ? canvasBounds.top + token.y * zoom + pan.y : token.y;
          setRadialMenuState({
            isOpen: true,
            position: { x: screenX, y: screenY },
            token
          });
          AudioService.playTerminalBeep(1350, 0.04);
        } else if (e.shiftKey) {
          setTargetTokenId(token.id);
          AudioService.playTerminalBeep(950, 0.03);
        } else {
          setSelectedTokenId(token.id);
          AudioService.playTerminalBeep(1200, 0.03);
        }
      });

      tokenLayer.addChild(container);
    });
  }, [tokens, selectedTokenId, targetTokenId, isVisionEnabled, torchRadiusFt, zoom, pan]);

  // Convert Screen Mouse Coordinates to World Coordinates
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom
    };
  }, [pan, zoom]);

  // Canvas Mouse Move
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setMouseWorldPos(worldPos);

    if (isDraggingPan) {
      // If mouse buttons are no longer pressed, release pan to avoid sticky cursor
      if (e.buttons === 0) {
        setIsDraggingPan(false);
        return;
      }
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isMarqueeActive && isDesignModeActive) {
      setMarqueeCurrent(worldPos);
      return;
    }

    if (isDrawingToolActive && isDesignModeActive) {
      if (activeDesignTool === 'wall' && wallDrawStart) {
        let snapped = gridSnap ? coordEngineRef.current.snapPixelToGrid(worldPos) : worldPos;
        if (e.shiftKey) {
          snapped = snapPointToAngle(wallDrawStart, snapped, 15);
        }
        setWallDrawCurrent(snapped);
      } else if (activeDesignTool === 'terrain' || activeDesignTool === 'pencil') {
        setCurrentStrokePoints(prev => [...prev, worldPos.x, worldPos.y]);
      }
    }
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 2 && !e.shiftKey)) {
      e.preventDefault();
      setIsDraggingPan(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (e.button === 0) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const engine = coordEngineRef.current;
      let snapped = gridSnap ? engine.snapPixelToGrid(worldPos) : worldPos;

      if (isDesignModeActive) {
        if (activeDesignTool === 'select') {
          // Check if user clicked an interactive object, token, wall, or light
          const hitObj = localObjects.find(o => Math.hypot(o.x - worldPos.x, o.y - worldPos.y) <= 30);
          const hitToken = tokens.find(t => Math.hypot(t.x - worldPos.x, t.y - worldPos.y) <= 30);
          const hitWall = localWalls.find(w => {
            const d1 = Math.hypot(worldPos.x - w.p1.x, worldPos.y - w.p1.y);
            const d2 = Math.hypot(worldPos.x - w.p2.x, worldPos.y - w.p2.y);
            return d1 <= 20 || d2 <= 20;
          });
          const hitLight = localLights.find(l => Math.hypot(l.x - worldPos.x, l.y - worldPos.y) <= 25);

          const hitId = hitObj?.id || hitToken?.id || hitWall?.id || hitLight?.id;

          if (hitId) {
            if (e.shiftKey) {
              setSelectedAssetIds(prev => prev.includes(hitId) ? prev.filter(id => id !== hitId) : [...prev, hitId]);
            } else {
              setSelectedAssetIds([hitId]);
            }
            AudioService.playTerminalBeep(1200, 0.02);
          } else {
            // Clicked on empty ground: start Marquee selection box
            if (!e.shiftKey) {
              setSelectedAssetIds([]);
            }
            setIsMarqueeActive(true);
            setMarqueeStart(worldPos);
            setMarqueeCurrent(worldPos);
          }
          return;
        } else if (activeDesignTool === 'wall') {
          recordHistory('Draw Wall');
          setIsDrawingToolActive(true);

          // Magnetic endpoint snap
          const vertexSnap = findNearestWallVertex(snapped, localWalls, 20);
          const startPt = vertexSnap || snapped;

          setWallDrawStart(startPt);
          setWallDrawCurrent(startPt);
          AudioService.playTerminalBeep(1100, 0.02);
          return;
        } else if (activeDesignTool === 'terrain') {
          recordHistory('Paint Terrain');
          setIsDrawingToolActive(true);
          setCurrentStrokePoints([worldPos.x, worldPos.y]);
          return;
        } else if (activeDesignTool === 'fill') {
          // Room Flooring Fill Bucket
          recordHistory('Fill Room Floor');
          const biome = BIOME_OPTIONS.find(b => b.id === selectedTerrainId);
          // Detect surrounding walls within 400px
          const nearbyWalls = localWalls.filter(w => 
            Math.min(Math.hypot(w.p1.x - snapped.x, w.p1.y - snapped.y), Math.hypot(w.p2.x - snapped.x, w.p2.y - snapped.y)) <= 400
          );

          let minX = snapped.x - 70;
          let maxX = snapped.x + 70;
          let minY = snapped.y - 70;
          let maxY = snapped.y + 70;

          if (nearbyWalls.length >= 4) {
            const xs = nearbyWalls.flatMap(w => [w.p1.x, w.p2.x]);
            const ys = nearbyWalls.flatMap(w => [w.p1.y, w.p2.y]);
            const lefts = xs.filter(x => x <= snapped.x);
            const rights = xs.filter(x => x >= snapped.x);
            const tops = ys.filter(y => y <= snapped.y);
            const bottoms = ys.filter(y => y >= snapped.y);

            if (lefts.length && rights.length && tops.length && bottoms.length) {
              minX = Math.max(...lefts);
              maxX = Math.min(...rights);
              minY = Math.max(...tops);
              maxY = Math.min(...bottoms);
            }
          }

          const fillPoints = [
            minX, minY,
            maxX, minY,
            maxX, maxY,
            minX, maxY
          ];

          const newFloor = {
            id: uuidv4(),
            points: fillPoints,
            color: biome?.color || '#0f172a',
            strokeWidth: 2,
            renderType: 'polygon',
            closed: true,
            biomeType: selectedTerrainId,
            terrainTypeId: selectedTerrainId,
            label: `${biome?.label || 'Chamber'} Floor`
          };

          const updatedTerrains = [...(currentMap?.terrains || []), newFloor];
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { terrains: updatedTerrains });
          }
          AudioService.playCriticalChime(true);
          setCombatLog(prev => [
            `[FLOOR FILL] Generated ${biome?.label || 'Decking'} floor polygon inside chamber (${Math.round(maxX - minX)}x${Math.round(maxY - minY)}px).`,
            ...prev.slice(0, 8)
          ]);
          return;
        } else if (activeDesignTool === 'light') {
          recordHistory('Place Light Source');
          const newLight: SceneLightSource = {
            id: `light-${Date.now()}`,
            x: snapped.x,
            y: snapped.y,
            radius: selectedLightRadius,
            color: selectedLightColor,
            intensity: 1.0,
            falloff: 'smooth',
            animation: selectedLightAnimation,
            castShadows: true,
            label: `Light (${selectedLightAnimation})`
          };
          lightSourceMgrRef.current.addLight(newLight);
          const nextLights = [...localLights, newLight];
          setLocalLights(nextLights);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { lights: nextLights });
          }
          AudioService.playTerminalBeep(1400, 0.04);
          setCombatLog(prev => [
            `[LIGHT SOURCE] Deployed ${selectedLightAnimation} fixture at (${Math.round(snapped.x)}, ${Math.round(snapped.y)}) [Radius: ${selectedLightRadius}px].`,
            ...prev.slice(0, 8)
          ]);
          return;
        } else if (activeDesignTool === 'pencil') {
          recordHistory('Draw Sketch Line');
          setIsDrawingToolActive(true);
          setCurrentStrokePoints([worldPos.x, worldPos.y]);
          return;
        } else if (activeDesignTool === 'text') {
          recordHistory('Place Text Label');
          const newText = {
            id: uuidv4(),
            text: textLabelInput || 'Sector Alpha',
            fill: textColor,
            fontSize: textSize,
            x: snapped.x,
            y: snapped.y
          };
          const updatedTexts = [...(currentMap?.texts || []), newText];
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { texts: updatedTexts });
          }
          AudioService.playTerminalBeep(1250, 0.03);
          setCombatLog(prev => [
            `[TEXT] Placed label "${newText.text}" at (${Math.round(snapped.x)}, ${Math.round(snapped.y)}).`,
            ...prev.slice(0, 8)
          ]);
          return;
        } else if (activeDesignTool === 'eraser') {
          handleEraseAt(worldPos);
          return;
        } else if (activeDesignTool === 'object' || activeDesignTool === 'hazard' || activeDesignTool === 'token') {
          if (selectedStamp) {
            deployArchitectItem(selectedStamp, snapped.x, snapped.y);
            return;
          }
        }
      }
    }
  };

  // Canvas Mouse Up
  const handleCanvasMouseUp = () => {
    if (isDraggingPan) {
      setIsDraggingPan(false);
    }

    if (isMarqueeActive && isDesignModeActive) {
      setIsMarqueeActive(false);
      if (marqueeStart && marqueeCurrent) {
        const minX = Math.min(marqueeStart.x, marqueeCurrent.x);
        const maxX = Math.max(marqueeStart.x, marqueeCurrent.x);
        const minY = Math.min(marqueeStart.y, marqueeCurrent.y);
        const maxY = Math.max(marqueeStart.y, marqueeCurrent.y);

        // Find enclosed objects, tokens, walls, and lights
        const enclosedObjIds = localObjects.filter(o => o.x >= minX && o.x <= maxX && o.y >= minY && o.y <= maxY).map(o => o.id);
        const enclosedTokIds = tokens.filter(t => t.x >= minX && t.x <= maxX && t.y >= minY && t.y <= maxY).map(t => t.id);
        const enclosedWallIds = localWalls.filter(w => 
          (w.p1.x >= minX && w.p1.x <= maxX && w.p1.y >= minY && w.p1.y <= maxY) ||
          (w.p2.x >= minX && w.p2.x <= maxX && w.p2.y >= minY && w.p2.y <= maxY)
        ).map(w => w.id);
        const enclosedLightIds = localLights.filter(l => l.x >= minX && l.x <= maxX && l.y >= minY && l.y <= maxY).map(l => l.id);

        const allEnclosed = Array.from(new Set([...enclosedObjIds, ...enclosedTokIds, ...enclosedWallIds, ...enclosedLightIds]));
        setSelectedAssetIds(allEnclosed);
        if (allEnclosed.length > 0) {
          AudioService.playTerminalBeep(1300, 0.03);
          setCombatLog(prev => [`[SELECTION] Selected ${allEnclosed.length} assets.`, ...prev.slice(0, 8)]);
        }
      }
      setMarqueeStart(null);
      setMarqueeCurrent(null);
      return;
    }

    if (isDrawingToolActive && isDesignModeActive) {
      setIsDrawingToolActive(false);

      if (activeDesignTool === 'wall' && wallDrawStart && wallDrawCurrent) {
        if (wallConstructionMode === 'room') {
          const roomWidth = wallDrawCurrent.x - wallDrawStart.x;
          const roomHeight = wallDrawCurrent.y - wallDrawStart.y;
          if (Math.abs(roomWidth) >= 30 && Math.abs(roomHeight) >= 30) {
            const newRoomWalls = createRoomWalls(
              wallDrawStart.x,
              wallDrawStart.y,
              roomWidth,
              roomHeight,
              selectedWallType,
              { hackDc: doorLockDc, label: 'Chamber' }
            );
            newRoomWalls.forEach((rw: WallSegment) => bvhBuilderRef.current.addWall(rw));
            const updatedWalls = [...localWalls, ...newRoomWalls];
            setLocalWalls(updatedWalls);
            if (currentMap && updateMap) {
              updateMap(currentMap.id, { walls: updatedWalls });
            }
            AudioService.playCriticalChime(true);
            setCombatLog(prev => [
              `[ROOM TOOL] Created 4-wall chamber enclosure (${Math.abs(Math.round(roomWidth))}x${Math.abs(Math.round(roomHeight))}px).`,
              ...prev.slice(0, 8)
            ]);
          }
        } else {
          // Single or Chain segment
          const dist = Math.hypot(wallDrawCurrent.x - wallDrawStart.x, wallDrawCurrent.y - wallDrawStart.y);
          if (dist >= 15) {
            const newWallId = `wall-${Date.now()}`;
            const isDoor = selectedWallType === 'door';
            const isWindow = selectedWallType === 'window';
            const isEthereal = selectedWallType === 'ethereal';
            const newWall: WallSegment = {
              id: newWallId,
              p1: { x: wallDrawStart.x, y: wallDrawStart.y },
              p2: { x: wallDrawCurrent.x, y: wallDrawCurrent.y },
              isDynamic: isDoor,
              isOpen: false,
              isTransparent: isWindow || isEthereal
            };
            (newWall as any).wallType = selectedWallType;
            (newWall as any).lockDc = doorLockDc;

            bvhBuilderRef.current.addWall(newWall);
            const updatedWalls = [...localWalls, newWall];
            setLocalWalls(updatedWalls);
            if (currentMap && updateMap) {
              updateMap(currentMap.id, { walls: updatedWalls });
            }
            AudioService.playTerminalBeep(1350, 0.04);
            setCombatLog(prev => [
              `[WALL DRAW] Created ${selectedWallType.toUpperCase()} segment from (${Math.round(wallDrawStart.x)}, ${Math.round(wallDrawStart.y)}) to (${Math.round(wallDrawCurrent.x)}, ${Math.round(wallDrawCurrent.y)}).`,
              ...prev.slice(0, 8)
            ]);

            if (wallConstructionMode === 'chain') {
              // Keep chain active with previous endpoint as next start point
              setWallChainPoints(prev => [...prev, wallDrawCurrent]);
              setWallDrawStart(wallDrawCurrent);
              setIsDrawingToolActive(true);
              return;
            }
          }
        }
        setWallDrawStart(null);
        setWallDrawCurrent(null);
      } else if (activeDesignTool === 'terrain' && currentStrokePoints.length >= 4) {
        const biome = BIOME_OPTIONS.find(b => b.id === selectedTerrainId);
        const newTerrain = {
          id: uuidv4(),
          points: currentStrokePoints,
          color: biome?.color || '#14532d',
          strokeWidth: terrainBrushWidth,
          renderType: terrainRenderMode === 'hex' ? 'hexTile' : 'polygon',
          closed: terrainRenderMode === 'hex',
          biomeType: selectedTerrainId,
          terrainTypeId: selectedTerrainId,
          label: biome?.label || 'Terrain'
        };
        const updatedTerrains = [...(currentMap?.terrains || []), newTerrain];
        if (currentMap && updateMap) {
          updateMap(currentMap.id, { terrains: updatedTerrains });
        }
        setCurrentStrokePoints([]);
        AudioService.playTerminalBeep(1200, 0.03);
        setCombatLog(prev => [
          `[TERRAIN] Painted ${biome?.label || 'Terrain'} stroke (${currentStrokePoints.length / 2} nodes).`,
          ...prev.slice(0, 8)
        ]);
      } else if (activeDesignTool === 'pencil' && currentStrokePoints.length >= 4) {
        const newLine = {
          id: uuidv4(),
          points: currentStrokePoints,
          color: pencilColor,
          strokeWidth: pencilWidth
        };
        const updatedLines = [...(currentMap?.lines || []), newLine];
        if (currentMap && updateMap) {
          updateMap(currentMap.id, { lines: updatedLines });
        }
        setCurrentStrokePoints([]);
        AudioService.playTerminalBeep(1100, 0.02);
      }
    }
  };

  // Canvas Click (Token Movement & Stamp Placement)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingPan || isDrawingToolActive) return;

    if (isDesignModeActive) {
      if (selectedStamp) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const snapped = gridSnap ? coordEngineRef.current.snapPixelToGrid(worldPos) : worldPos;
        deployArchitectItem(selectedStamp, snapped.x, snapped.y);
        return;
      }
      return;
    }

    if (!selectedTokenId) return;

    const worldPos = screenToWorld(e.clientX, e.clientY);
    const engine = coordEngineRef.current;
    const snapped = engine.snapPixelToGrid(worldPos);

    useEngineStore.getState().updatePosition(selectedTokenId, snapped.x, snapped.y);
    AudioService.playTerminalBeep(1100, 0.02);

    if (isMoveModeActive) {
      setIsMoveModeActive(false);
      setCombatLog(prev => [
        `[MOVE] ${selectedToken?.name || 'Operative'} relocated to coordinates (${snapped.x}, ${snapped.y}).`,
        ...prev.slice(0, 8)
      ]);
    }
  };

  // Tactical Eraser Implementation
  const handleEraseAt = (pos: { x: number; y: number }) => {
    recordHistory();

    // 1. Check interactive objects
    const objHit = localObjects.find(o => Math.hypot(o.x - pos.x, o.y - pos.y) <= 35);
    if (objHit) {
      const updatedObjects = localObjects.filter(o => o.id !== objHit.id);
      setLocalObjects(updatedObjects);
      interactiveObjMgrRef.current.loadObjects(updatedObjects);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { objects: updatedObjects });
      }
      AudioService.playTerminalBeep(850, 0.05);
      setCombatLog(prev => [`[ERASER] Removed object "${objHit.name}"`, ...prev.slice(0, 8)]);
      return;
    }

    // 2. Check walls
    const wallHit = localWalls.find(w => {
      const l2 = Math.hypot(w.p2.x - w.p1.x, w.p2.y - w.p1.y) ** 2;
      if (l2 === 0) return Math.hypot(pos.x - w.p1.x, pos.y - w.p1.y) <= 25;
      let t = ((pos.x - w.p1.x) * (w.p2.x - w.p1.x) + (pos.y - w.p1.y) * (w.p2.y - w.p1.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = w.p1.x + t * (w.p2.x - w.p1.x);
      const projY = w.p1.y + t * (w.p2.y - w.p1.y);
      return Math.hypot(pos.x - projX, pos.y - projY) <= 25;
    });

    if (wallHit) {
      const updatedWalls = localWalls.filter(w => w.id !== wallHit.id);
      setLocalWalls(updatedWalls);
      bvhBuilderRef.current.build(updatedWalls);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { walls: updatedWalls });
      }
      AudioService.playTerminalBeep(850, 0.05);
      setCombatLog(prev => [`[ERASER] Demolished wall segment [${wallHit.id}]`, ...prev.slice(0, 8)]);
      return;
    }

    // 3. Check texts
    const textHit = (currentMap?.texts || []).find((t: any) => Math.hypot(t.x - pos.x, t.y - pos.y) <= 35);
    if (textHit) {
      const updatedTexts = (currentMap?.texts || []).filter((t: any) => t.id !== textHit.id);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { texts: updatedTexts });
      }
      AudioService.playTerminalBeep(850, 0.05);
      setCombatLog(prev => [`[ERASER] Removed text label "${textHit.text}"`, ...prev.slice(0, 8)]);
      return;
    }

    // 4. Check lines
    const lineHit = (currentMap?.lines || []).find((l: any) => {
      if (!l.points) return false;
      for (let i = 0; i < l.points.length; i += 2) {
        if (Math.hypot(l.points[i] - pos.x, l.points[i+1] - pos.y) <= 25) return true;
      }
      return false;
    });
    if (lineHit) {
      const updatedLines = (currentMap?.lines || []).filter((l: any) => l.id !== lineHit.id);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { lines: updatedLines });
      }
      AudioService.playTerminalBeep(850, 0.05);
      setCombatLog(prev => [`[ERASER] Erased sketch line`, ...prev.slice(0, 8)]);
      return;
    }

    // 5. Check terrains
    const terrainHit = (currentMap?.terrains || []).find((t: any) => {
      if (t.x !== undefined && t.y !== undefined && Math.hypot(t.x - pos.x, t.y - pos.y) <= 40) return true;
      if (!t.points) return false;
      for (let i = 0; i < t.points.length; i += 2) {
        if (Math.hypot(t.points[i] - pos.x, t.points[i+1] - pos.y) <= 30) return true;
      }
      return false;
    });
    if (terrainHit) {
      const updatedTerrains = (currentMap?.terrains || []).filter((t: any) => t.id !== terrainHit.id);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { terrains: updatedTerrains });
      }
      AudioService.playTerminalBeep(850, 0.05);
      setCombatLog(prev => [`[ERASER] Erased terrain polygon`, ...prev.slice(0, 8)]);
    }
  };

  // Drag & drop handlers
  const handleCanvasDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDesignModeActive) return;

    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const item: PaletteItem = JSON.parse(rawData);
      const worldPos = screenToWorld(e.clientX, e.clientY);

      const targetX = gridSnap ? Math.round(worldPos.x / 70) * 70 : Math.round(worldPos.x);
      const targetY = gridSnap ? Math.round(worldPos.y / 70) * 70 : Math.round(worldPos.y);

      deployArchitectItem(item, targetX, targetY);
    } catch (err) {
      console.warn('Failed to parse dropped architect item:', err);
    }
  };

  // Smooth Zoom with Mouse Wheel & Global Drag Safety
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Ignore wheel click / middle click or zero/negligible delta to prevent zoom jump on click
      if ((e.buttons & 4) || !e.deltaY || Math.abs(e.deltaY) < 1) return;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(prev => Math.max(0.4, Math.min(2.5, prev * zoomFactor)));
    };

    // Global listener ensures map never sticks to cursor if mouse leaves canvas or context menu closes
    const handleGlobalMouseUp = () => {
      setIsDraggingPan(false);
      setIsMarqueeActive(false);
      setIsDrawingToolActive(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('blur', handleGlobalMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('blur', handleGlobalMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handleObjectClick = (obj: SceneInteractiveObject) => {
    setInspectingInteractiveObj(obj);
    AudioService.playTerminalBeep(1300, 0.04);
  };

  const handleToggleBulkhead = (objId: string) => {
    if (!selectedTokenId) return;
    const res = interactiveObjMgrRef.current.interact(objId, selectedTokenId);
    if (res.success) {
      AudioService.playTerminalBeep(800, 0.06);
      setCombatLog(prev => [
        `[OBJECT] ${selectedToken?.name || 'Operative'} toggled ${objId} => ${res.data.isOpen ? 'OPEN' : 'SEALED'}`,
        ...prev.slice(0, 8)
      ]);
      setInspectingInteractiveObj(null);
    }
  };

  // Environmental Hazard & Lighting Handlers
  const handleToggleDynamicLighting = () => {
    setIsDynamicLightingEnabled(prev => {
      const next = !prev;
      hazardSimulatorRef.current?.setDynamicLighting(next);
      AudioService.playTerminalBeep(next ? 1200 : 800, 0.03);
      return next;
    });
  };

  const handleSpawnHazard = (type: HazardType) => {
    const activeTok = selectedToken || tokens[0];
    const spawnX = (activeTok?.x || 350) + (Math.random() - 0.5) * 140;
    const spawnY = (activeTok?.y || 250) + (Math.random() - 0.5) * 140;

    const newHazard: HazardField = {
      id: `hazard-${Date.now()}`,
      type,
      x: spawnX,
      y: spawnY,
      radius: 70,
      intensity: 1.0
    };

    hazardSimulatorRef.current?.addHazardField(newHazard);
    setHazardCount(prev => prev + 1);
    AudioService.playTerminalBeep(1400, 0.04);
    setCombatLog(prev => [
      `[HAZARD] Environmental ${type.replace('_', ' ').toUpperCase()} particle field deployed at (${Math.round(spawnX)}, ${Math.round(spawnY)}).`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleClearHazards = () => {
    hazardSimulatorRef.current?.clearHazards();
    setHazardCount(0);
    AudioService.playTerminalBeep(900, 0.03);
    setCombatLog(prev => [
      `[HAZARD] All active environmental particle fields purged from The Stage.`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleToggleMultiplayerSim = () => {
    setIsMultiplayerSimActive(prev => {
      const next = !prev;
      AudioService.playTerminalBeep(next ? 1300 : 750, 0.04);
      setCombatLog(p => [
        next ? `[NETWORK] LiveKit WebRTC peer telemetry active. Synchronizing 3 remote operative streams.` : `[NETWORK] Local mode engaged.`,
        ...p.slice(0, 8)
      ]);
      return next;
    });
  };

  // Drop Tactical Radar Ping
  const handleDropTacticalPing = (pingType: string = 'move') => {
    const px = mouseWorldPos.x;
    const py = mouseWorldPos.y;
    const newPing = createTacticalPing(px, py, pingType, null, 'Architect', null);
    setActivePings(prev => [...prev, newPing]);
    AudioService.playTerminalBeep(newPing.soundFreq, 0.1);
  };

  // Save map JSON file
  const handleSaveMapJson = () => {
    if (!currentMap) return;
    const payload = {
      type: 'TangentMap',
      version: '1.0',
      map: {
        ...currentMap,
        walls: localWalls,
        objects: localObjects
      }
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(currentMap.title || currentMap.name || 'map', 'tactical_map', 'json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    AudioService.playCriticalChime(true);
  };

  // Load map JSON file
  const handleLoadMapJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const mapToLoad = data.type === 'TangentMap' && data.map ? data.map : (data.id && (data.title || data.name) ? data : null);
        if (mapToLoad) {
          const mapId = uuidv4();
          const newMap = { ...mapToLoad, id: mapId };
          if (addMap) addMap(newMap);
          handleSelectMap(mapId);
          AudioService.playCriticalChime(true);
        } else {
          alert('Invalid Tangent Map JSON format.');
        }
      } catch (e) {
        console.error(e);
        alert('Failed to parse map file.');
      }
    };
    reader.readAsText(file);
  };

  // Export Viewport Snapshot (PNG)
  const handleExportPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${(currentMap?.title || 'stage_viewport').toLowerCase().replace(/\s+/g, '_')}_snapshot.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    AudioService.playCriticalChime(true);
  };

  // Commit Procedural Landmass
  const handleCommitLandmass = ({ terrains, objects, replaceExisting }: any) => {
    recordHistory();
    const existingTerrains = replaceExisting ? [] : (currentMap?.terrains || []);
    const existingObjects = replaceExisting ? [] : (currentMap?.objects || []);
    const updatedTerrains = [...existingTerrains, ...terrains];
    const updatedObjects = [...existingObjects, ...objects];

    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        terrains: updatedTerrains,
        objects: updatedObjects
      });
    }

    setLocalObjects(updatedObjects.map((obj: any) => ({
      id: obj.id,
      name: obj.name || obj.label || 'Terrain Feature',
      type: (obj.type || 'prop') as any,
      x: obj.x || 100,
      y: obj.y || 100,
      storyElementId: obj.id
    })));

    AudioService.playCriticalChime(true);
    setCombatLog(prev => [
      `[LANDMASS] Generated procedural world (${terrains.length} terrains, ${objects.length} scatters).`,
      ...prev.slice(0, 8)
    ]);
  };

  // Commit UVTT Import
  const handleImportCompleteUvtt = (importedMap: any) => {
    recordHistory();
    if (importedMap) {
      const mapId = uuidv4();
      const formattedMap = {
        ...importedMap,
        id: mapId
      };
      if (addMap) addMap(formattedMap);
      handleSelectMap(mapId);
      AudioService.playCriticalChime(true);
      setCombatLog(prev => [
        `[UVTT IMPORT] Ingested battlemap "${formattedMap.title || 'UVTT Battlemap'}" (${(formattedMap.walls || []).length} walls).`,
        ...prev.slice(0, 8)
      ]);
    }
  };

  // Summon Hero Token from Folio
  const handleSummonHeroToken = (heroPayload: any) => {
    recordHistory();
    const spawnX = Math.round(mouseWorldPos.x || 200);
    const spawnY = Math.round(mouseWorldPos.y || 200);
    const newTokId = heroPayload.heroId || `hero-${Date.now()}`;

    const newTok: StaticEntity = {
      id: newTokId,
      name: heroPayload.name || 'Hero Operative',
      base_hp: heroPayload.maxHealth || 35,
      tech_level: 3,
      armor_dr: heroPayload.toughness || 10,
      size_modifier: 0,
      speed_ft: 35,
      species: 'Human',
      archetype: 'Operative',
      is_persona: true
    };

    useEngineStore.getState().loadStaticEntitiesBatch([newTok]);
    useEngineStore.getState().updatePosition(newTokId, spawnX, spawnY);

    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        tokens: [...(currentMap.tokens || []), { ...newTok, x: spawnX, y: spawnY }]
      });
    }

    AudioService.playCriticalChime(true);
    setCombatLog(prev => [`[FOLIO HERO] Summoned ${newTok.name} at (${spawnX}, ${spawnY}).`, ...prev.slice(0, 8)]);
  };

  // Summon Omnicortex Asset
  const handleSummonOmnicortexAsset = (assetData: any) => {
    recordHistory();
    const spawnX = Math.round(mouseWorldPos.x || 250);
    const spawnY = Math.round(mouseWorldPos.y || 250);

    if (assetData._categoryKey === 'bestiary' || assetData.hp || assetData.dr) {
      const newTokId = `codex-${assetData.id || Date.now()}`;
      const newTok: StaticEntity = {
        id: newTokId,
        name: assetData._resolvedName || assetData.name || 'Codex Unit',
        base_hp: assetData.hp || 30,
        tech_level: assetData.techLevel || 3,
        armor_dr: assetData.dr || 8,
        size_modifier: assetData.sizeModifier || 0,
        speed_ft: assetData.speed || 30,
        species: assetData.species || 'Creature / Adversary',
        archetype: assetData.archetype || 'Adversary',
        is_persona: false
      };
      useEngineStore.getState().loadStaticEntitiesBatch([newTok]);
      useEngineStore.getState().updatePosition(newTokId, spawnX, spawnY);

      if (currentMap && updateMap) {
        updateMap(currentMap.id, {
          tokens: [...(currentMap.tokens || []), { ...newTok, x: spawnX, y: spawnY }]
        });
      }
    } else {
      const newObjId = `item-${assetData.id || Date.now()}`;
      const newObj: SceneInteractiveObject = {
        id: newObjId,
        name: assetData._resolvedName || assetData.name || 'Item Cache',
        type: 'loot_container',
        x: spawnX,
        y: spawnY,
        storyElementId: assetData.id
      };
      const updatedObjects = [...localObjects, newObj];
      setLocalObjects(updatedObjects);
      interactiveObjMgrRef.current.loadObjects(updatedObjects);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { objects: updatedObjects });
      }
    }

    AudioService.playCriticalChime(true);
    setCombatLog(prev => [`[OMNICORTEX] Deployed ${assetData._resolvedName || assetData.name} at (${spawnX}, ${spawnY}).`, ...prev.slice(0, 8)]);
  };

  // Layers panel callbacks
  const toggleLayerVisibility = (layerId: string) => {
    if (!currentMap || !updateMap) return;
    const layers = currentMap.layers || DEFAULT_LAYERS;
    const updated = layers.map((l: any) => l.id === layerId ? { ...l, visible: !l.visible } : l);
    updateMap(currentMap.id, { layers: updated });
  };

  const toggleLayerLock = (layerId: string) => {
    if (!currentMap || !updateMap) return;
    const layers = currentMap.layers || DEFAULT_LAYERS;
    const updated = layers.map((l: any) => l.id === layerId ? { ...l, locked: !l.locked } : l);
    updateMap(currentMap.id, { layers: updated });
  };

  // Multiplayer Remote Cursors Simulation & Render on Stage
  useEffect(() => {
    const container = remoteCursorsContainerRef.current;
    if (!container) return;

    container.removeChildren();
    if (!isMultiplayerSimActive || isSimulationPaused) return;

    const peers = [
      { id: 'peer-vex', name: 'Operative Vex', color: 0x10b981, baseX: 450, baseY: 300 },
      { id: 'peer-null', name: 'Architect Null (GM)', color: 0xf59e0b, baseX: 600, baseY: 220 },
      { id: 'peer-echo', name: 'Spectator Echo', color: 0xec4899, baseX: 300, baseY: 420 }
    ];

    const graphicsList: { g: Graphics; peer: typeof peers[0]; offset: number }[] = [];

    peers.forEach((peer, idx) => {
      const g = new Graphics();
      container.addChild(g);
      graphicsList.push({ g, peer, offset: idx * 2.1 });
    });

    let frame = 0;
    const interval = setInterval(() => {
      frame += 0.05;
      graphicsList.forEach(({ g, peer, offset }) => {
        g.clear();
        const curX = peer.baseX + Math.sin(frame + offset) * 70;
        const curY = peer.baseY + Math.cos(frame * 0.7 + offset) * 45;

        g.poly([curX, curY, curX + 16, curY + 12, curX + 8, curY + 14, curX + 12, curY + 22, curX + 8, curY + 24, curX + 4, curY + 16, curX, curY + 18]);
        g.fill({ color: peer.color, alpha: 0.9 });
        g.stroke({ width: 1.5, color: 0xffffff });

        g.roundRect(curX + 18, curY + 4, peer.name.length * 7 + 10, 16, 4);
        g.fill({ color: 0x0f172a, alpha: 0.85 });
        g.stroke({ width: 1, color: peer.color, alpha: 0.7 });
      });
    }, 1000 / 30);

    return () => {
      clearInterval(interval);
      container.removeChildren();
    };
  }, [isMultiplayerSimActive, isSimulationPaused]);

  // Proximity detection for Contextual Token Radial Menu
  const downedAllyNearby = useMemo(() => {
    if (!selectedToken) return null;
    return tokens.find(t => 
      t.id !== selectedToken.id && 
      t.current_hp <= 0 && 
      Math.hypot(t.x - selectedToken.x, t.y - selectedToken.y) <= 120
    ) || null;
  }, [selectedToken, tokens]);

  const nearbyInteractiveObj = useMemo(() => {
    if (!selectedToken) return null;
    return interactiveObjMgrRef.current.getAllObjects().find(o => 
      Math.hypot(o.x - selectedToken.x, o.y - selectedToken.y) <= 120
    ) || null;
  }, [selectedToken]);

  const isPointBlankTarget = useMemo(() => {
    if (!selectedToken || !targetToken) return false;
    const distPx = Math.hypot(targetToken.x - selectedToken.x, targetToken.y - selectedToken.y);
    return (distPx / 70) * 5 <= 5;
  }, [selectedToken, targetToken]);

  // Handle Action Selected from Token Radial Menu
  const handleRadialSelectAction = (actionId: string) => {
    if (!selectedToken) return;

    if (actionId === 'strike') {
      handleExecuteCombatStrike();
    } else if (actionId === 'move') {
      setIsMoveModeActive(prev => !prev);
    } else if (actionId === 'stance') {
      const stances: Array<'normal' | 'guard' | 'overcharge' | 'aim'> = ['normal', 'guard', 'aim', 'overcharge'];
      const nextIdx = (stances.indexOf(activeStance) + 1) % stances.length;
      setActiveStance(stances[nextIdx]);
      setCombatLog(prev => [
        `[STANCE] ${selectedToken.name} shifted stance to ${stances[nextIdx].toUpperCase()}.`,
        ...prev.slice(0, 8)
      ]);
    } else if (actionId === 'stabilize') {
      if (downedAllyNearby) {
        const d1 = Math.floor(Math.random() * 10) + 1;
        const d2 = Math.floor(Math.random() * 10) + 1;
        const medRoll = d1 + d2 + 4;
        if (medRoll >= 15) {
          useEngineStore.getState().toggleCondition(downedAllyNearby.id, 'status_stabilized');
          useEngineStore.getState().applyDamage(downedAllyNearby.id, -1);
          setCombatLog(prev => [
            `[FIRST AID SUCCESS] ${selectedToken.name} stabilized ${downedAllyNearby.name} (Roll: ${d1}+${d2}+4 = ${medRoll} vs DC 15). Bleeding out halted!`,
            ...prev.slice(0, 8)
          ]);
        } else {
          setCombatLog(prev => [
            `[FIRST AID FAILED] ${selectedToken.name} attempted to stabilize ${downedAllyNearby.name} (Roll: ${medRoll} vs DC 15).`,
            ...prev.slice(0, 8)
          ]);
        }
      }
    } else if (actionId === 'interact') {
      if (nearbyInteractiveObj) {
        handleToggleBulkhead(nearbyInteractiveObj.id);
      }
    } else if (actionId === 'folio') {
      setActiveTab('spawner');
    }
  };

  // Global Keyboard Shortcuts for Architect & Tactical Stage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // 1. Delete Selected Assets (Delete / Backspace)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAssetIds.length > 0) {
        e.preventDefault();
        handleBatchDelete();
        return;
      }

      // 2. Duplicate Selected Assets (Ctrl+D / Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedAssetIds.length > 0) {
        e.preventDefault();
        handleBatchDuplicate();
        return;
      }

      // 3. Arrow Keys Nudge Selected Assets
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedAssetIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? (gridSnap ? 70 : 20) : (gridSnap ? 10 : 2);
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        handleBatchNudge(dx, dy);
        return;
      }

      // 4. Escape to Clear Selection
      if (e.key === 'Escape' && selectedAssetIds.length > 0) {
        e.preventDefault();
        handleDeselectAll();
        return;
      }

      // 5. Finalize Wall Chain (Enter or Escape)
      if ((e.key === 'Enter' || e.key === 'Escape') && wallConstructionMode === 'chain' && wallChainPoints.length > 0) {
        e.preventDefault();
        setWallChainPoints([]);
        setWallDrawStart(null);
        setWallDrawCurrent(null);
        setIsDrawingToolActive(false);
        AudioService.playTerminalBeep(1200, 0.03);
        setCombatLog(prev => [`[WALL CHAIN] Finalized polyline wall chain.`, ...prev.slice(0, 8)]);
        return;
      }

      // 6. Tool Shortcuts (M, G, V, W, T, P, L, F, E)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key.toLowerCase() === 'm') {
          handleToggleDesignMode();
        } else if (e.key.toLowerCase() === 'g') {
          setGridSnap(prev => !prev);
          AudioService.playTerminalBeep(1000, 0.02);
        } else if (isDesignModeActive) {
          if (e.key.toLowerCase() === 'v') setActiveDesignTool('select');
          else if (e.key.toLowerCase() === 'w') setActiveDesignTool('wall');
          else if (e.key.toLowerCase() === 't') setActiveDesignTool('terrain');
          else if (e.key.toLowerCase() === 'f') setActiveDesignTool('fill');
          else if (e.key.toLowerCase() === 'p') setActiveDesignTool('pencil');
          else if (e.key.toLowerCase() === 'l') setActiveDesignTool('light');
          else if (e.key.toLowerCase() === 'e') setActiveDesignTool('eraser');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAssetIds, gridSnap, isDesignModeActive, wallConstructionMode, wallChainPoints, handleBatchDelete, handleBatchDuplicate, handleBatchNudge, handleDeselectAll]);

  // Called Shot Limb Penalties & Trauma Thresholds
  const handleExecuteCombatStrike = () => {
    if (isSimulationPaused) {
      alert('Tactical Simulation is paused while in Architect Design Mode. Click Resume Sim in the banner to continue live combat.');
      return;
    }

    if (!selectedToken || !targetToken) {
      alert('Select an Attacker and a Target on The Stage.');
      return;
    }

    AudioService.playTerminalBeep(1400, 0.05);

    const dx = targetToken.x - selectedToken.x;
    const dy = targetToken.y - selectedToken.y;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const distFt = Math.round((distPx / 70) * 5);
    const isPointBlank = distFt <= 5;
    const rangeCat = isPointBlank 
      ? RangeCategory.PointBlank 
      : distFt <= 30 
        ? RangeCategory.Short 
        : distFt <= 60 
          ? RangeCategory.Medium 
          : RangeCategory.Long;

    const targetRad = 22 + (targetToken.size_modifier || 0) * 8;
    const coverCheck = bvhBuilderRef.current.calculateLineOfSightCover(
      { x: selectedToken.x, y: selectedToken.y },
      { x: targetToken.x, y: targetToken.y },
      targetRad
    );

    if (coverCheck.coverType === 'total') {
      setCombatLog(prev => [
        `[COMBAT BLOCKED] Line of Sight obstructed by ${coverCheck.occludingWalls.length} wall(s)! Attack cannot proceed.`,
        ...prev.slice(0, 8)
      ]);
      AudioService.playTerminalBeep(450, 0.04);
      return;
    }

    const limbMod = targetedLimb === 'head' ? -2 : targetedLimb === 'arms' ? -2 : targetedLimb === 'optics' ? -3 : targetedLimb === 'legs' ? -2 : -1;
    const stanceBonus = activeStance === 'aim' ? 2 : 0;

    const toHit = combatArbRef.current.buildToHitPackage(
      14 + limbMod + stanceBonus,
      SkillRank.Expert,
      attackMapStep,
      SizeCategory.Medium,
      targetToken.size_modifier > 0 ? SizeCategory.Large : SizeCategory.Medium,
      1.0,
      rangeCat,
      { isAiming: activeStance === 'aim', aimRounds: 1 }
    );

    toHit.finalTarget += coverCheck.coverMod;

    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const isDoubleTens = d1 === 10 && d2 === 10;
    const isDoubleOnes = d1 === 1 && d2 === 1;
    const critAttackBonus = isDoubleTens ? 30 : (isDoubleOnes ? -10 : 0);
    const totalAttack = d1 + d2 + toHit.finalTarget + critAttackBonus;

    const targetDefenseDC = combatArbRef.current.calculateUnopposedDC(
      targetToken.size_modifier > 0 ? SizeCategory.Large : SizeCategory.Medium,
      rangeCat
    );

    const isHit = totalAttack > targetDefenseDC && !isDoubleOnes;

    if (!isHit) {
      setCombatLog(prev => [
        `[COMBAT MISS] ${selectedToken.name} targeted ${targetedLimb.toUpperCase()} of ${targetToken.name} with ${attackWeapon.toUpperCase()}. 2d10 Roll: ${d1}+${d2}=${d1+d2} (Total Attack: ${totalAttack} vs DC ${targetDefenseDC} - Defender Wins Ties). [Cover: ${coverCheck.coverType.toUpperCase()}]`,
        ...prev.slice(0, 8)
      ]);
      return;
    }

    let baseDamage = attackWeapon === 'plasma' ? 32 : attackWeapon === 'emp' ? 24 : 18;
    if (isDoubleTens) baseDamage *= 2;

    if (isPointBlank && (attackWeapon === 'kinetic' || attackWeapon === 'plasma' || attackWeapon === 'laser')) {
      const v1 = Math.floor(Math.random() * 8) + 1;
      const v2 = Math.floor(Math.random() * 8) + 1;
      baseDamage += Math.max(v1, v2);
    } else {
      baseDamage += Math.floor(Math.random() * 8) + 1;
    }

    const stanceDmg = activeStance === 'overcharge' ? 6 : 0;
    const ap = attackWeapon === 'plasma' ? 6 : attackWeapon === 'laser' ? 4 : 2;
    const isCalled = targetedLimb !== 'torso';
    const targetLoc = targetedLimb === 'head' ? 'head' : targetedLimb === 'arms' ? 'arm_right' : targetedLimb === 'legs' ? 'leg_right' : 'torso';

    const strikeResult = damagePipeRef.current.resolveStrike(
      {
        rawDamage: baseDamage + stanceDmg,
        armorPenetration: ap,
        damageType: attackWeapon,
        isCalledShot: isCalled,
        targetLocation: targetLoc as any
      },
      targetToken,
      [targetToken.armor_dr || 10],
      (targetToken as any).con_mod || 2,
      (targetToken as any).constitution || 12
    );

    useEngineStore.getState().applyDamage(targetToken.id, strikeResult.healthDamage);

    strikeResult.appliedStatuses.forEach(status => {
      useEngineStore.getState().toggleCondition(targetToken.id, status);
    });

    let logMsg = `[COMBAT HIT] ${selectedToken.name} struck ${targetedLimb.toUpperCase()} of ${targetToken.name} for ${strikeResult.netDamage} NET DMG (${strikeResult.effectiveDR} DR + ${strikeResult.conModSoak} CON Soak) [Cover: ${coverCheck.coverType.toUpperCase()}].`;
    if (strikeResult.entersMortalityState) {
      logMsg += strikeResult.isDead
        ? ` 💀 TARGET EXPIRED!`
        : ` ⚠️ MORTALITY STATE: Bleeding Out (${strikeResult.stabilityPointsRemaining} Stability Points)!`;
    } else if (strikeResult.appliedStatuses.length > 0) {
      logMsg += ` TRAUMA: ${strikeResult.appliedStatuses.join(', ')}`;
    }

    setCombatLog(prev => [
      logMsg,
      ...prev.slice(0, 8)
    ]);
  };

  const handleRollCustomDice = () => {
    try {
      const res = diceParserRef.current.evaluateExpression(customDiceExpr, selectedTokenId || undefined);
      AudioService.playTerminalBeep(1250, 0.04);
      setCombatLog(prev => [
        `[DICE ROLL] ${customDiceExpr} => TOTAL: ${res.total} (${res.breakdown})`,
        ...prev.slice(0, 8)
      ]);
    } catch (err: any) {
      alert(`Dice Syntax Error: ${err.message}`);
    }
  };

  // Turn Progression
  const handleNextTurn = () => {
    if (tokens.length === 0) return;
    AudioService.playTerminalBeep(1050, 0.03);

    const nextIndex = (currentTurnIndex + 1) % tokens.length;
    setCurrentTurnIndex(nextIndex);
    setSelectedTokenId(tokens[nextIndex].id);

    if (nextIndex === 0) {
      const nextRound = roundNumber + 1;
      setRoundNumber(nextRound);
      essenceTrackerRef.current.processRoundDegradation([]);
      const entropyRoll = Math.floor(Math.random() * 10) + 1;
      setCombatLog(prev => [
        `[ROUND ${nextRound}] Initiated. Essence Degradation Protocol rolled -${entropyRoll} DC to active sustained effects.`,
        ...prev.slice(0, 8)
      ]);
    } else {
      setCombatLog(prev => [
        `[TURN] Active combatant is now ${tokens[nextIndex].name}.`,
        ...prev.slice(0, 8)
      ]);
    }
  };

  const handleRollAllInitiative = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    const scores: Record<string, number> = {};
    tokens.forEach(t => {
      scores[t.id] = Math.floor(Math.random() * 20) + 1 + (t.tech_level || 3);
    });
    setInitiativeScores(scores);
    setCurrentTurnIndex(0);
    setCombatLog(prev => [`[INITIATIVE] Roster initiative rolled for ${tokens.length} combatants.`, ...prev.slice(0, 8)]);
  };

  const handleScaleChange = (newTier: GridScaleTier) => {
    setScaleTier(newTier);
    coordEngineRef.current.setScaleTier(newTier);
    redrawGrid();
  };

  const handleGridTypeToggle = (newType: GridType) => {
    setGridType(newType);
    coordEngineRef.current.setGridType(newType);
    redrawGrid();
  };

  const currentScaleConfig = GRID_SCALE_CONFIGS[scaleTier];

  return (
    <div 
      className="relative w-full h-full bg-[#050811] overflow-hidden select-none flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── TOP GLASS-COCKPIT TOOLBAR (Map Switching, JSON Save/Load, Undo/Redo, Mode Switch) ── */}
      <StageTopToolbar
        currentMap={currentMap}
        availableMaps={availableMaps}
        activeMapId={currentMapId}
        onSelectMap={handleSelectMap}
        onAddNewMap={handleAddNewMap}
        onDeleteCurrentMap={handleDeleteCurrentMap}
        isDesignModeActive={isDesignModeActive}
        onToggleDesignMode={handleToggleDesignMode}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        lastActionDescription={lastActionDescription}
        onSaveMapJson={handleSaveMapJson}
        onLoadMapJson={handleLoadMapJson}
        onExportPng={handleExportPng}
        onOpenUvttModal={() => setIsUvttModalOpen(true)}
        onOpenLandmassModal={() => setIsLandmassModalOpen(true)}
        onOpenAssetManager={() => setIsAssetManagerOpen(true)}
        onOpenLayersPanel={() => setIsLayersPanelOpen(true)}
        onOpenUnderlayModal={() => setIsUnderlayModalOpen(true)}
        isGridVisible={isGridVisible}
        onToggleGridVisible={() => setIsGridVisible(prev => !prev)}
        gridSnap={gridSnap}
        onToggleGridSnap={() => setGridSnap(prev => !prev)}
        gridType={gridType}
        onChangeGridType={handleGridTypeToggle}
        scaleTier={scaleTier}
        onChangeScaleTier={handleScaleChange}
        isDynamicLightingEnabled={isDynamicLightingEnabled}
        onToggleDynamicLighting={handleToggleDynamicLighting}
        isMultiplayerSimActive={isMultiplayerSimActive}
        onToggleMultiplayerSim={handleToggleMultiplayerSim}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(prev => !prev)}
      />

      {/* ── MAIN VIEWPORT AREA ── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
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

        {/* ── TOP CENTER: Architect Design Mode Active Banner ── */}
        {isDesignModeActive && !isZenMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[115] bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500 rounded-2xl px-4 py-1.5 shadow-[0_0_30px_rgba(245,158,11,0.5)] backdrop-blur-xl flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <div>
              <span className="font-mono text-xs font-bold text-amber-300 tracking-wider block">
                🛠️ ARCHITECT DESIGN MODE // {activeDesignTool.toUpperCase()} TOOL ARMED
              </span>
              <span className="font-mono text-[9px] text-amber-400/80">
                Draw walls, paint biomes, sketch tactics, place story objects. BVH & Campaign synced.
              </span>
            </div>
            <button
              onClick={handleToggleDesignMode}
              className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <span>⚔️</span>
              <span>RESUME SIM</span>
            </button>
          </div>
        )}

        {/* ── Glass-Cockpit HUD React Overlay ── */}
        <DashboardOverlay
          campaignName={`THE STAGE | ${campaignId.toUpperCase()} | ${currentScaleConfig.displayLabel}`}
          selectedTokenId={selectedTokenId}
          onSelectTokenId={(id: string) => setSelectedTokenId(id)}
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
        />

        {/* ── RIGHT DOCKABLE TACTICAL COMMAND CONSOLE (Play Mode Only) ── */}
        {!isDesignModeActive && !isZenMode && (
          isTacticalConsoleCollapsed ? (
            <button
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setIsTacticalConsoleCollapsed(false);
              }}
              className="absolute top-4 right-4 z-[110] px-3 py-1.5 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-2xl font-mono text-xs text-cyan-300 font-bold flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer select-none animate-in fade-in duration-150"
              title="Expand Tactical Command Console"
            >
              <Crosshair size={13} className="text-amber-400" />
              <span>CONSOLE</span>
              <ChevronLeft size={13} className="text-slate-400" />
            </button>
          ) : (
            <aside 
              className="absolute top-4 right-4 w-88 max-w-[360px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200 z-[110] flex flex-col overflow-hidden animate-in fade-in duration-150"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Tab Headers */}
              <div className="flex items-center border-b border-slate-800 bg-slate-950/70 p-1 text-[10.5px] font-mono font-bold">
                <button
                  onClick={() => setActiveTab('combat')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    activeTab === 'combat' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crosshair size={12} /> COMBAT
                </button>
                <button
                  onClick={() => setActiveTab('spawner')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    activeTab === 'spawner' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users size={12} /> UNITS
                </button>
                <button
                  onClick={() => setActiveTab('turns')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    activeTab === 'turns' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock size={12} /> TURNS
                </button>
                <button
                  onClick={() => setActiveTab('objects')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    activeTab === 'objects' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Box size={12} /> PROPS
                </button>
                <button
                  onClick={() => setActiveTab('dice')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    activeTab === 'dice' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Dices size={12} /> DICE
                </button>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(900, 0.02);
                    setIsTacticalConsoleCollapsed(true);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors ml-0.5 cursor-pointer"
                  title="Minimize Console"
                >
                  <Minus size={13} />
                </button>
              </div>

          {/* Tab Content */}
          <div className="p-3 space-y-3 font-mono text-xs max-h-[380px] overflow-y-auto">
            {/* 1. COMBAT TAB */}
            {activeTab === 'combat' && (
              <div className="space-y-2.5">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>ATTACKER</span>
                    <span className="text-cyan-400 font-bold">{selectedToken?.name || 'NONE'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>TARGET</span>
                    <span className="text-red-400 font-bold">{targetToken?.name || 'NONE'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-1">WEAPON</span>
                    <select
                      value={attackWeapon}
                      onChange={(e) => setAttackWeapon(e.target.value as any)}
                      className="w-full bg-slate-800 text-amber-300 p-1 rounded border border-slate-700"
                    >
                      <option value="kinetic">TL3 Kinetic Rifle</option>
                      <option value="plasma">TL4 Heavy Plasma</option>
                      <option value="laser">TL4 Laser Array</option>
                      <option value="emp">TL3 EMP Shockwave</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-1">MAP LADDER</span>
                    <select
                      value={attackMapStep}
                      onChange={(e) => setAttackMapStep(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-800 text-amber-300 p-1 rounded border border-slate-700"
                    >
                      <option value={0}>1st Attack (+0 MAP)</option>
                      <option value={1}>2nd Attack (-5 MAP)</option>
                      <option value={2}>3rd Attack (-10 MAP)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">CALLED SHOT</span>
                  <div className="grid grid-cols-5 gap-1 text-[9.5px]">
                    {[
                      { id: 'torso', label: 'Torso' },
                      { id: 'head', label: 'Head' },
                      { id: 'arms', label: 'Arms' },
                      { id: 'legs', label: 'Legs' },
                      { id: 'optics', label: 'Optics' }
                    ].map(limb => (
                      <button
                        key={limb.id}
                        onClick={() => setTargetedLimb(limb.id as any)}
                        className={`p-1 rounded border text-center transition-colors cursor-pointer ${
                          targetedLimb === limb.id 
                            ? 'bg-amber-500/25 text-amber-300 border-amber-400 font-bold' 
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {limb.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleExecuteCombatStrike}
                  className="w-full py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Crosshair size={14} /> EXECUTE ATTACK
                </button>
              </div>
            )}

            {/* 2. SPAWNER TAB */}
            {activeTab === 'spawner' && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Quick Spawners:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setIsHeroDrawerOpen(true)}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <div className="text-cyan-400 font-bold text-xs flex items-center gap-1">
                      <Users size={12} /> Folio Heroes
                    </div>
                    <p className="text-[10px] text-slate-400">Roster Operatives</p>
                  </button>
                  <button
                    onClick={() => setIsOmnicortexDrawerOpen(true)}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-purple-500/40 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <div className="text-purple-400 font-bold text-xs flex items-center gap-1">
                      <Bot size={12} /> Bestiary
                    </div>
                    <p className="text-[10px] text-slate-400">Codex Units</p>
                  </button>
                </div>
              </div>
            )}

            {/* 3. TURNS TAB */}
            {activeTab === 'turns' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-400 font-bold">ROUND {roundNumber}</span>
                  <button
                    onClick={handleRollAllInitiative}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded border border-purple-700 text-[10px]"
                  >
                    Roll All
                  </button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {tokens.map((t, idx) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTokenId(t.id)}
                      className={`p-1.5 rounded border flex items-center justify-between text-[11px] cursor-pointer ${
                        idx === currentTurnIndex 
                          ? 'bg-purple-950/80 border-purple-500 text-purple-200' 
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="truncate">{t.name}</span>
                      <span className="font-bold">{initiativeScores[t.id] ?? '-'}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleNextTurn}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  NEXT COMBATANT
                </button>
              </div>
            )}

            {/* 4. OBJECTS TAB */}
            {activeTab === 'objects' && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Interactive Map Objects:</span>
                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  {localObjects.map(obj => (
                    <div
                      key={obj.id}
                      onClick={() => handleObjectClick(obj)}
                      className="p-1.5 bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded-lg flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate text-[11px] text-cyan-300">{obj.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                        {obj.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. DICE TAB */}
            {activeTab === 'dice' && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">AST Dice Evaluator:</span>
                <input
                  type="text"
                  value={customDiceExpr}
                  onChange={(e) => setCustomDiceExpr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-emerald-300"
                />
                <button
                  onClick={handleRollCustomDice}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  ROLL FORMULA
                </button>
              </div>
            )}
          </div>

          {/* Tactical Combat Log */}
          <div className="bg-slate-950/80 p-2 border-t border-slate-800 text-[9.5px] font-mono text-slate-400 space-y-1 max-h-28 overflow-y-auto">
            {combatLog.map((log, i) => (
              <div key={i} className="leading-tight">{log}</div>
            ))}
          </div>
        </aside>
        )
      )}

        {/* ── Contextual Token Radial Action Wheel ── */}
        <TokenRadialMenu
          isOpen={radialMenuState.isOpen}
          onClose={() => setRadialMenuState(prev => ({ ...prev, isOpen: false }))}
          position={radialMenuState.position}
          token={radialMenuState.token}
          targetToken={targetToken}
          isAdjacentToMortalityAlly={Boolean(downedAllyNearby)}
          mortalityAllyName={downedAllyNearby?.name || 'Allied Operative'}
          isAdjacentToInteractiveObj={Boolean(nearbyInteractiveObj)}
          interactiveObjName={nearbyInteractiveObj?.name || 'Bulkhead / Terminal'}
          isPointBlankRange={isPointBlankTarget}
          onSelectAction={handleRadialSelectAction}
        />

        {/* ── IN-SITU ARCHITECT DESIGN STUDIO & ASSET PALETTE ── */}
        <ArchitectDesignPalette
          isOpen={isDesignModeActive && !isZenMode}
          onClose={() => handleToggleDesignMode()}
          activeTool={activeDesignTool}
          setActiveTool={setActiveDesignTool}
          selectedStamp={selectedStamp}
          onSelectStamp={setSelectedStamp}
          gridSnap={gridSnap}
          onToggleGridSnap={() => setGridSnap(prev => !prev)}
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
          onOpenLandmassModal={() => setIsLandmassModalOpen(true)}
          onOpenUvttModal={() => setIsUvttModalOpen(true)}
          onOpenAssetManager={() => setIsAssetManagerOpen(true)}
          onOpenHeroDrawer={() => setIsHeroDrawerOpen(true)}
          onOpenOmnicortexDrawer={() => setIsOmnicortexDrawerOpen(true)}
          onOpenHazmatModal={() => setIsHazmatModalOpen(true)}
          onOpenLayersPanel={() => setIsLayersPanelOpen(true)}
          onOpenUnderlayModal={() => setIsUnderlayModalOpen(true)}
        />
      </div>

      {/* ── MODALS INTEGRATION ── */}

      {/* 1. Procedural Landmass Generator Modal */}
      <LandmassGeneratorModal
        isOpen={isLandmassModalOpen}
        onClose={() => setIsLandmassModalOpen(false)}
        onCommitLandmass={handleCommitLandmass}
        defaultRenderMode={terrainRenderMode}
      />

      {/* 2. Universal VTT (.uvtt) Importer Modal */}
      <UvttImportModal
        isOpen={isUvttModalOpen}
        onClose={() => setIsUvttModalOpen(false)}
        onImportComplete={handleImportCompleteUvtt}
      />

      {/* 3. Map Asset & Texture Manager Modal */}
      <MapAssetManagerModal
        isOpen={isAssetManagerOpen}
        onClose={() => setIsAssetManagerOpen(false)}
        customAssets={universeState?.customAssets || { terrains: [], objects: [] }}
        onAddCustomTerrain={addCustomTerrain}
        onUpdateCustomTerrain={updateCustomTerrain}
        onDeleteCustomTerrain={deleteCustomTerrain}
        onAddCustomObject={addCustomObject}
        onUpdateCustomObject={updateCustomObject}
        onDeleteCustomObject={deleteCustomObject}
        currentScale={currentMap?.type || 'Tactical'}
      />

      {/* 4. Folio Hero Token Drawer */}
      <FolioHeroTokenDrawer
        showDrawer={isHeroDrawerOpen}
        setShowDrawer={setIsHeroDrawerOpen}
        onSummonToken={handleSummonHeroToken}
      />

      {/* 5. Omnicortex Asset Drawer */}
      <OmnicortexAssetDrawer
        showDrawer={isOmnicortexDrawerOpen}
        setShowDrawer={setIsOmnicortexDrawerOpen}
        onSummonAsset={handleSummonOmnicortexAsset}
      />

      {/* 6. Interactive Object Configurator Modal */}
      <InteractiveObjectModal
        objectNode={inspectingInteractiveObj}
        isOpen={Boolean(inspectingInteractiveObj)}
        onClose={() => setInspectingInteractiveObj(null)}
        onUpdateObject={(id: string, updated: any) => {
          recordHistory();
          const updatedObjects = localObjects.map(o => o.id === id ? { ...o, ...updated } : o);
          setLocalObjects(updatedObjects);
          interactiveObjMgrRef.current.loadObjects(updatedObjects);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { objects: updatedObjects });
          }
          setInspectingInteractiveObj(null);
        }}
        onDeleteObject={(id: string) => {
          recordHistory();
          const updatedObjects = localObjects.filter(o => o.id !== id);
          setLocalObjects(updatedObjects);
          interactiveObjMgrRef.current.loadObjects(updatedObjects);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { objects: updatedObjects });
          }
          setInspectingInteractiveObj(null);
        }}
        onUpdateTokenHealth={() => {}}
        onUpdateTokenVitality={() => {}}
        onUpdateTokenStructure={() => {}}
        onTriggerFloatingText={() => {}}
      />

      {/* 7. Hazmat Volume Manager Modal */}
      <HazmatVolumeManagerModal
        isOpen={isHazmatModalOpen}
        onClose={() => setIsHazmatModalOpen(false)}
        hazardZones={(hazardSimulatorRef.current?.getActiveHazards() as any) || []}
        onAddHazardZone={(hz: any) => {
          hazardSimulatorRef.current?.addHazardField(hz);
          setHazardCount(hazardSimulatorRef.current?.getActiveHazards().length || 0);
        }}
        onUpdateHazardZone={() => {}}
        onDeleteHazardZone={() => {}}
        onUpdateTokenHealth={() => {}}
        onUpdateTokenVitality={() => {}}
        onUpdateTokenStructure={() => {}}
        onUpdateTokenConditions={() => {}}
        onTriggerFloatingText={() => {}}
      />

      {/* 8. Map Layers Manager Panel */}
      <MapLayersPanel
        showLayersPanel={isLayersPanelOpen}
        setShowLayersPanel={setIsLayersPanelOpen}
        mapLayers={currentMap?.layers || DEFAULT_LAYERS}
        toggleLayerVisibility={toggleLayerVisibility}
        toggleLayerLock={toggleLayerLock}
        deleteCustomLayer={() => {}}
        newLayerNameInput=""
        setNewLayerNameInput={() => {}}
        addCustomLayer={() => {}}
      />

      {/* 9. Background Blueprint Underlay Calibration Modal */}
      <MapUnderlayCalibrationModal
        isOpen={isUnderlayModalOpen}
        onClose={() => setIsUnderlayModalOpen(false)}
        currentUnderlay={underlayConfig}
        onApplyUnderlay={(cfg: any) => {
          recordHistory('Apply Blueprint Underlay');
          setUnderlayConfig(cfg);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { underlay: cfg });
          }
        }}
        onClearUnderlay={() => {
          recordHistory('Clear Blueprint Underlay');
          setUnderlayConfig(null);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { underlay: null });
          }
        }}
      />
    </div>
  );
};

export default StageView;
