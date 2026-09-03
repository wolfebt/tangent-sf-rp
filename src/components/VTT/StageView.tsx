/**
 * @file StageView.tsx
 * @description Next-Gen Tangent VTT Stage Viewport.
 * Renders the WebGPU canvas ('The Stage'), orchestrates 8-layer compositor,
 * multi-tier grid coordinate engine (dynamic movement speed & ruler),
 * live Persona Folio & Bestiary spawner, Called Shot trauma pipeline,
 * turn tracker, and floats the Glass-Cockpit HUD overlay with full tactical tools.
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
  type WallSegment
} from '../../engine/index.ts';
import { DashboardOverlay } from '../../engine/ui/DashboardOverlay.tsx';
import { useFolio } from '../../context/FolioContext';
import { useCampaign } from '../../context/CampaignContext';
import { TokenRadialMenu } from './TokenRadialMenu';
import { ArchitectDesignPalette, type PaletteItem } from './ArchitectDesignPalette';
import { HazardParticleSimulator, type HazardType, type HazardField } from '../../engine/physics/HazardParticleSimulator.ts';
import { Graphics, Container, Text, TextStyle } from 'pixi.js';
import { 
  Crosshair, 
  Eye, 
  EyeOff, 
  Dices, 
  Users, 
  Compass, 
  Terminal, 
  Lock, 
  Unlock, 
  Box, 
  Zap, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Clock, 
  MapPin, 
  Bot,
  Hammer
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

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

  // Campaign Context and Search Params Integration
  const [searchParams, setSearchParams] = useSearchParams();
  const mapIdParam = searchParams.get('mapId');
  const { universeState, activeMapId, updateMap } = useCampaign();
  const [currentMapId, setCurrentMapId] = useState<string>(mapIdParam || activeMapId || '');

  const availableMaps = universeState?.maps || [];
  const currentMap = availableMaps.find((m: any) => m.id === currentMapId) || availableMaps[0] || null;

  // In-Situ Architect Design Mode & Simulation Control States
  const [isDesignModeActive, setIsDesignModeActive] = useState<boolean>(false);
  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);
  const [selectedStamp, setSelectedStamp] = useState<PaletteItem | null>(null);
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [localWalls, setLocalWalls] = useState<WallSegment[]>([]);
  const [localObjects, setLocalObjects] = useState<SceneInteractiveObject[]>([]);

  // Folio Context integration
  const { personaRoster, roster } = useFolio();
  const allFolioOperatives: any[] = (personaRoster as any[]) || (roster as any[]) || [];

  // Viewport & Coordinate States
  const [scaleTier, setScaleTier] = useState<GridScaleTier>(GridScaleTier.Encounter);
  const [gridType, setGridType] = useState<GridType>(GridType.Square);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>('op-jax');
  const [targetTokenId, setTargetTokenId] = useState<string | null>('mech-vanguard');
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [isVisionEnabled, setIsVisionEnabled] = useState(true);
  const [torchRadiusFt, setTorchRadiusFt] = useState(30);
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
  const [selectedObjectModal, setSelectedObjectModal] = useState<SceneInteractiveObject | null>(null);

  // Turn Tracker States
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [initiativeScores, setInitiativeScores] = useState<Record<string, number>>({});
  const [copiedLink, setCopiedLink] = useState(false);

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
    }

    // Fallback: If no tokens loaded, spawn standard tactical baseline squad
    if (Object.keys(store.staticData).length === 0) {
      store.loadStaticEntitiesBatch([
        {
          id: 'op-jax',
          name: 'Operative Jax',
          base_hp: 45,
          tech_level: 3,
          armor_dr: 15,
          size_modifier: 0,
          speed_ft: 40,
          species: 'Alterian',
          archetype: 'Infiltrator',
          is_persona: true
        },
        {
          id: 'op-kaelen',
          name: 'Dr. Kaelen',
          base_hp: 35,
          tech_level: 4,
          armor_dr: 10,
          size_modifier: 0,
          speed_ft: 30,
          species: 'Cyborg Human',
          archetype: 'Cyber-Medic',
          is_persona: true
        },
        {
          id: 'mech-vanguard',
          name: 'Vanguard Assault Mech',
          base_hp: 120,
          tech_level: 4,
          armor_dr: 35,
          size_modifier: 2,
          speed_ft: 25,
          species: 'Mecha / Omnicortex Gear',
          archetype: 'Heavy Combat Chassis',
          is_persona: false
        },
        {
          id: 'drone-scout',
          name: 'Recon Drone',
          base_hp: 20,
          tech_level: 3,
          armor_dr: 5,
          size_modifier: -1,
          speed_ft: 45,
          species: 'Automaton / Drone',
          archetype: 'Tactical Recon',
          is_persona: false
        }
      ]);

      store.updatePosition('op-jax', 140, 140);
      store.updatePosition('op-kaelen', 140, 210);
      store.updatePosition('mech-vanguard', 420, 280);
      store.updatePosition('drone-scout', 490, 140);

      const sampleObjects: SceneInteractiveObject[] = [
        {
          id: 'bulkhead-alpha',
          name: 'Airlock Security Bulkhead',
          type: 'bulkhead',
          x: 280,
          y: 140,
          storyElementId: 'clue-airlock-breach'
        },
        {
          id: 'terminal-nexus',
          name: 'Mainframe Datapad',
          type: 'terminal',
          x: 350,
          y: 210,
          storyElementId: 'log-classified-data'
        },
        {
          id: 'crate-omega',
          name: 'Omnicortex Munitions Crate',
          type: 'loot_container',
          x: 210,
          y: 350,
          storyElementId: 'gear-plasma-grenades'
        }
      ];
      interactiveObjMgrRef.current.loadObjects(sampleObjects);
      setLocalObjects(sampleObjects);

      // Default sample walls for obstacle testing
      const defaultWalls: WallSegment[] = [
        { id: 'sample-bulkhead', p1: { x: 280, y: 70 }, p2: { x: 280, y: 210 }, isDynamic: true, isOpen: false },
        { id: 'sample-cover-crate', p1: { x: 300, y: 300 }, p2: { x: 300, y: 380 }, isDynamic: false }
      ];
      bvhBuilderRef.current.build(defaultWalls);
      setLocalWalls(defaultWalls);
    }
  }, [currentMap]);

  // Render Walls & Bulkheads onto the Stage
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

  // Deploy Item from Architect Design Palette onto the Stage
  const deployArchitectItem = (item: PaletteItem, targetX: number, targetY: number) => {
    AudioService.playTerminalBeep(1350, 0.03);

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
      interactiveObjMgrRef.current.loadObjects([...interactiveObjMgrRef.current.getAllObjects(), newObj]);
      const updatedObjects = [...localObjects, newObj];
      setLocalObjects(updatedObjects);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { objects: updatedObjects });
      }

      setCombatLog(prev => [
        `[ARCHITECT] Placed interactive object "${newObj.name}" at (${targetX}, ${targetY}).`,
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
    }
  };

  const handleToggleDesignMode = () => {
    setIsDesignModeActive(prev => {
      const next = !prev;
      setIsSimulationPaused(next); // Pause simulation during design mode, unpause when exiting
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

  // Initialize PixiJS WebGPU Canvas & Compositor
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

      // Create Grid Overlay Graphics Container
      const gridContainer = new Container();
      gridContainer.label = 'GridOverlay';
      compositor.addToLayer(gridContainer, ZLayer.BackgroundMap);
      setGridOverlayContainer(gridContainer);

      // Create Movement & Waypoint Ruler Graphics Container
      const rulerContainer = new Container();
      rulerContainer.label = 'MovementRuler';
      compositor.addToLayer(rulerContainer, ZLayer.DynamicFX);
      setMoveRulerContainer(rulerContainer);

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
        const currentTokens = selectAllFusedTokens(useEngineStore.getState());
        const lightEmitters = currentTokens.map((t: FusedToken) => ({
          x: t.x,
          y: t.y,
          radius: 180,
          color: t.is_persona ? 0x22d3ee : 0xa855f7,
          intensity: 1.0
        }));
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

    if (isMoveModeActive) {
      // 3. Draw Distance Vector to Mouse Cursor
      const dx = mouseWorldPos.x - selectedToken.x;
      const dy = mouseWorldPos.y - selectedToken.y;
      const distPx = Math.sqrt(dx * dx + dy * dy);
      const distFt = Math.round((distPx / cellSizePx) * 5);
      const distCells = Math.round(distPx / cellSizePx);

      const isWithinBase = distFt <= effectiveSpeedFt;
      const isWithinSprint = distFt <= (effectiveSpeedFt * 2);
      const actionCost = isWithinBase ? 1 : isWithinSprint ? 2 : Math.ceil(distFt / effectiveSpeedFt);

      // Check if path intersects any hazard fields
      const intersectsHazard = (hazardSimulatorRef.current?.getHazardFields?.() || []).some((h: any) => {
        const midX = (selectedToken.x + mouseWorldPos.x) / 2;
        const midY = (selectedToken.y + mouseWorldPos.y) / 2;
        return Math.hypot(h.x - midX, h.y - midY) <= (h.radius || 70);
      });

      const vectorColor = intersectsHazard 
        ? 0xef4444 
        : isWithinBase 
          ? 0x10b981 
          : isWithinSprint 
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
        fill: vectorColor === 0x10b981 ? 0x6ee7b7 : vectorColor === 0xf59e0b ? 0xfcd34d : 0xfca5a5,
        fontWeight: 'bold',
        align: 'center'
      });

      let labelText = `${distFt} FT (${distCells} CELLS) • [${actionCost} ACTION${actionCost > 1 ? 'S' : ''}${isWithinSprint && !isWithinBase ? ' - SPRINT' : ''}]`;
      if (intersectsHazard) {
        labelText += ' ⚠️ HAZARD CROSSING!';
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

  }, [moveRulerContainer, selectedToken, isMoveModeActive, mouseWorldPos, effectiveSpeedFt]);

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
  }, [tokens]);

  // Render Tokens on the Stage with Canonical Action Pips and Mortality Indicators
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
      const isDowned = token.current_hp <= 0;
      const fillColor = isDowned 
        ? 0xef4444 
        : token.is_persona 
          ? 0x06b6d4 
          : 0x8b5cf6; // Cyan for Persona, Purple for Mecha, Red if Downed

      // Volumetric Size radius
      const radius = 22 + (token.size_modifier || 0) * 8;

      g.circle(0, 0, radius);
      g.fill({ color: fillColor, alpha: isDowned ? 0.6 : 0.85 });

      if (isSelected) {
        g.stroke({ width: 3.5, color: 0xfacc15 }); // Gold ring for selected
      } else if (isTarget) {
        g.stroke({ width: 3.5, color: 0xef4444 }); // Red ring for target
      } else {
        g.stroke({ width: 1.5, color: 0xffffff });
      }

      // Flashlight / Vision cone indicator if selected and vision is active
      if (isSelected && isVisionEnabled) {
        const torchPx = (torchRadiusFt / 5) * 70;
        const torchG = new Graphics();
        torchG.circle(0, 0, torchPx);
        torchG.stroke({ width: 1, color: 0xfacc15, alpha: 0.3 });
        torchG.fill({ color: 0xfef08a, alpha: 0.05 });
        container.addChild(torchG);
      }

      container.addChild(g);

      // Render Canonical Action Pips based on Skill Rank (Rank 0=1 full, 1-5=1, 6-10=2, 11-15=3, etc.)
      const skillRank = (token as any).skill_rank ?? 8;
      const actionTier = combatArbRef.current.getActionTier(skillRank);
      const actionCount = actionTier.actionsCount;
      const pipsG = new Graphics();
      const pipsSpacing = 7;
      const startX = -((actionCount - 1) * pipsSpacing) / 2;
      for (let p = 0; p < actionCount; p++) {
        const px = startX + p * pipsSpacing;
        const py = -radius - 12;
        pipsG.poly([px, py - 3, px + 3, py, px, py + 3, px - 3, py]);
        pipsG.fill({ color: 0x06b6d4, alpha: 0.95 });
        pipsG.stroke({ width: 0.8, color: 0xffffff });
      }
      container.addChild(pipsG);

      // If in Mortality State (0 HP), render Bleeding Out Warning
      if (isDowned) {
        const mortG = new Graphics();
        mortG.circle(0, 0, radius + 4);
        mortG.stroke({ width: 2.5, color: 0xf59e0b, alpha: 0.9 });
        container.addChild(mortG);

        const mortText = new Text({
          text: `BLEEDING OUT`,
          style: new TextStyle({ fontFamily: 'monospace', fontSize: 8.5, fill: 0xf59e0b, fontWeight: 'bold' })
        });
        mortText.anchor.set(0.5, 2.7);
        container.addChild(mortText);
      }

      // Name & HP Label
      const label = new Text({ text: `${token.name} (${token.current_hp} HP)`, style });
      label.anchor.set(0.5, -1.8);
      container.addChild(label);

      // Interaction listeners: Left click select, Shift click target, Right click open radial menu
      container.on('pointerdown', (e: any) => {
        e.stopPropagation();
        if (e.button === 2 || e.buttons === 2) {
          // Open Contextual Token Radial Menu!
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

  // Convert Screen Mouse Coordinates to World Coordinates (accounting for Pan & Zoom)
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom
    };
  }, [pan, zoom]);

  // Handle Canvas Pointer Move (Distance Ruler tracking & Middle/Right Drag Pan)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setMouseWorldPos(worldPos);

    if (isDraggingPan) {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Middle-click (1) or Right-click (2) initiates pan drag
    if (e.button === 1 || (e.button === 2 && !e.shiftKey)) {
      e.preventDefault();
      setIsDraggingPan(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingPan(false);
  };

  // Non-passive Wheel listener to allow smooth zoom without page scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(prev => Math.max(0.4, Math.min(2.5, prev * zoomFactor)));
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Drag and drop event handlers for Architect Design Mode
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

  // Handle Stage Canvas Pointer Click (Snap & Move Token or Stamp Asset)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingPan) return;

    // 1. If in Architect Design Mode and a Stamp is armed, place it!
    if (isDesignModeActive && selectedStamp) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const targetX = gridSnap ? Math.round(worldPos.x / 70) * 70 : Math.round(worldPos.x);
      const targetY = gridSnap ? Math.round(worldPos.y / 70) * 70 : Math.round(worldPos.y);
      deployArchitectItem(selectedStamp, targetX, targetY);
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

  const handleObjectClick = (obj: SceneInteractiveObject) => {
    setSelectedObjectModal(obj);
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
      setSelectedObjectModal(null);
    }
  };

  // Environmental Hazard and Dynamic Lighting Handlers
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

        // Draw pointer cursor arrow
        g.poly([curX, curY, curX + 16, curY + 12, curX + 8, curY + 14, curX + 12, curY + 22, curX + 8, curY + 24, curX + 4, curY + 16, curX, curY + 18]);
        g.fill({ color: peer.color, alpha: 0.9 });
        g.stroke({ width: 1.5, color: 0xffffff });

        // Draw Nameplate badge
        g.roundRect(curX + 18, curY + 4, peer.name.length * 7 + 10, 16, 4);
        g.fill({ color: 0x0f172a, alpha: 0.85 });
        g.stroke({ width: 1, color: peer.color, alpha: 0.7 });
      });
    }, 1000 / 30);

    return () => {
      clearInterval(interval);
      container.removeChildren();
    };
  }, [isMultiplayerSimActive]);

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

  // Canonical Called Shot Limb Penalties & Trauma Thresholds per 3.00 COMBAT.md with Automated Raycast Cover
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

    // 1. Distance & Point-Blank Evaluation (70px per 5ft cell)
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

    // 2. Automated Raycast Cover Calculation via BVH Spatial Tree
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

    // 3. Canonical Called Shot penalties per 3.00 COMBAT.md: Torso -1, Head -2, Arms -2, Legs -2, Optics -3
    const limbMod = targetedLimb === 'head' ? -2 : targetedLimb === 'arms' ? -2 : targetedLimb === 'optics' ? -3 : targetedLimb === 'legs' ? -2 : -1;
    const stanceBonus = activeStance === 'aim' ? 2 : 0;

    // 4. Calculate to-hit package with canonical MAP, Volumetric sizing, and Range
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

    // Apply automated cover modifier directly
    toHit.finalTarget += coverCheck.coverMod;

    // 5. Roll 2d10 Attack Dice per canonical 3.00 COMBAT.md
    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const isDoubleTens = d1 === 10 && d2 === 10;
    const isDoubleOnes = d1 === 1 && d2 === 1;
    const critAttackBonus = isDoubleTens ? 30 : (isDoubleOnes ? -10 : 0);
    const totalAttack = d1 + d2 + toHit.finalTarget + critAttackBonus;

    // Unopposed Defense DC (CR 15 average baseline for Medium target at Short range)
    const targetDefenseDC = combatArbRef.current.calculateUnopposedDC(
      targetToken.size_modifier > 0 ? SizeCategory.Large : SizeCategory.Medium,
      rangeCat
    );

    // Canonical Rule: DEFENDER WINS ALL TIES!
    const isHit = totalAttack > targetDefenseDC && !isDoubleOnes;

    if (!isHit) {
      setCombatLog(prev => [
        `[COMBAT MISS] ${selectedToken.name} targeted ${targetedLimb.toUpperCase()} of ${targetToken.name} with ${attackWeapon.toUpperCase()}. 2d10 Roll: ${d1}+${d2}=${d1+d2} (Total Attack: ${totalAttack} vs DC ${targetDefenseDC} - Defender Wins Ties). [Cover: ${coverCheck.coverType.toUpperCase()}]`,
        ...prev.slice(0, 8)
      ]);
      return;
    }

    // 6. Resolve Damage Pipeline (Point Blank rolls ballistic/energy damage with Advantage)
    let baseDamage = attackWeapon === 'plasma' ? 32 : attackWeapon === 'emp' ? 24 : 18;
    if (isDoubleTens) baseDamage *= 2; // Natural 20 doubles weapon damage dice

    // Advantage on damage if Point-Blank: roll two dice and take highest
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

    // Apply Damage to Volatile Store
    useEngineStore.getState().applyDamage(targetToken.id, strikeResult.healthDamage);

    // Apply Trauma Conditions if threshold was breached
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

  // Spawn Custom Entity from Bestiary or Persona Folio
  const handleSpawnEntity = (type: 'persona' | 'mecha' | 'preset', presetData?: Partial<StaticEntity>) => {
    const id = `${type}-${Date.now()}`;
    const name = presetData?.name || (type === 'persona' ? 'Operative Cadet' : 'Siege Walker');
    
    useEngineStore.getState().loadStaticEntity({
      id,
      name,
      base_hp: presetData?.base_hp ?? (type === 'persona' ? 40 : 100),
      tech_level: presetData?.tech_level ?? 3,
      armor_dr: presetData?.armor_dr ?? (type === 'persona' ? 12 : 30),
      size_modifier: presetData?.size_modifier ?? (type === 'persona' ? 0 : 2),
      speed_ft: presetData?.speed_ft ?? (type === 'persona' ? 30 : 25),
      species: presetData?.species ?? (type === 'persona' ? 'Human' : 'Mecha / Omnicortex Gear'),
      archetype: presetData?.archetype ?? (type === 'persona' ? 'Rookie Operative' : 'Assault Chassis'),
      is_persona: type === 'persona'
    });
    
    useEngineStore.getState().updatePosition(id, 280, 280);
    setSelectedTokenId(id);
    AudioService.playTerminalBeep(1100, 0.03);
    setCombatLog(prev => [`[SPAWN] Deployed ${name} to The Stage.`, ...prev.slice(0, 8)]);
  };

  // Deploy real Character from Persona Folio
  const handleDeployFolioCharacter = (char: any) => {
    const docId = char['character-doc-id'] || char.id || `folio-${Date.now()}`;
    const name = char['char-name'] || 'Persona Operative';
    const hp = parseInt(char['char-vitality-max'] || char['vitality'] || 45, 10);
    const dr = parseInt(char['char-armor-dr'] || 12, 10);
    const tl = parseInt(char['tech-level'] || 3, 10);
    const speed = parseInt(char['char-speed'] || 30, 10);
    const species = typeof char['char-species'] === 'object' ? char['char-species']?.name : char['char-species'] || 'Human';
    const occu = typeof char['char-occu'] === 'object' ? char['char-occu']?.name : char['char-occu'] || 'Operative';

    useEngineStore.getState().loadStaticEntity({
      id: docId,
      name,
      base_hp: hp,
      tech_level: tl,
      armor_dr: dr,
      size_modifier: 0,
      speed_ft: speed,
      species,
      archetype: occu,
      is_persona: true
    });

    useEngineStore.getState().updatePosition(docId, 210, 210);
    setSelectedTokenId(docId);
    AudioService.playTerminalBeep(1300, 0.04);
    setCombatLog(prev => [`[FOLIO DEPLOY] Synchronized ${name} (${species} ${occu}) from Persona Folio.`, ...prev.slice(0, 8)]);
  };

  // Advance Initiative Turn & Trigger Essence Sustained Degradation
  const handleNextTurn = () => {
    if (tokens.length === 0) return;
    AudioService.playTerminalBeep(1050, 0.03);

    const nextIndex = (currentTurnIndex + 1) % tokens.length;
    setCurrentTurnIndex(nextIndex);
    setSelectedTokenId(tokens[nextIndex].id);

    if (nextIndex === 0) {
      // New Round Trigger: Run Degradation Entropy Protocol
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

  const handleCopySpectatorLink = () => {
    const url = `${window.location.origin}/spectator/${campaignId || 'tactical-zone'}`;
    AudioService.playTerminalBeep(1200, 0.03);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    } else {
      prompt('Spectator Stream URL:', url);
    }
  };

  const handleScaleChange = (newTier: GridScaleTier) => {
    setScaleTier(newTier);
    coordEngineRef.current.setScaleTier(newTier);
    redrawGrid();
  };

  const handleGridTypeToggle = () => {
    const nextType = gridType === GridType.Square ? GridType.HexFlatTop : GridType.Square;
    setGridType(nextType);
    coordEngineRef.current.setGridType(nextType);
    redrawGrid();
  };

  const currentScaleConfig = GRID_SCALE_CONFIGS[scaleTier];

  return (
    <div className="relative w-full h-full bg-[#050811] overflow-hidden select-none">
      {/* ── WebGPU / WebGL Stage Canvas with Pan & Zoom ── */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop}
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full block ${isDesignModeActive ? 'cursor-crosshair' : isMoveModeActive ? 'cursor-crosshair' : isDraggingPan ? 'cursor-grabbing' : 'cursor-default'}`}
      />

      {/* ── TOP CENTER: Architect Design Mode Active Banner ── */}
      {isDesignModeActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[115] bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500 rounded-2xl px-5 py-2 shadow-[0_0_30px_rgba(245,158,11,0.5)] backdrop-blur-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <div>
            <span className="font-mono text-xs font-bold text-amber-300 tracking-wider block">
              🛠️ ARCHITECT DESIGN MODE // SIMULATION PAUSED
            </span>
            <span className="font-mono text-[9px] text-amber-400/80">
              Drag & drop assets or click-stamp. Changes instantly sync to Campaign Context & BVH.
            </span>
          </div>
          <button
            onClick={handleToggleDesignMode}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-2"
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
        onSelectTokenId={(id) => setSelectedTokenId(id)}
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
      />

      {/* ── TOP RIGHT: Multi-Tier Scale, Zoom & Viewport Bar ── */}
      <div 
        className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl z-[110]"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Toggle In-Situ Architect Design Mode Button */}
        <button
          onClick={handleToggleDesignMode}
          className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
            isDesignModeActive
              ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'bg-slate-800 text-amber-300 hover:bg-slate-750 border-amber-500/50 hover:border-amber-400'
          }`}
          title="Toggle In-Situ Architect Design Mode (Pause Sim, Drag & Drop Map Assets)"
        >
          <Hammer size={12} />
          <span>{isDesignModeActive ? 'DESIGNING' : 'DESIGN MODE'}</span>
        </button>

        {/* Campaign Map Selector */}
        {availableMaps.length > 0 && (
          <div className="flex items-center gap-1 pr-1 border-r border-slate-700/80">
            <span className="text-[10px] font-mono text-cyan-400 font-bold px-1 flex items-center gap-1">
              <MapPin size={12} /> MAP:
            </span>
            <select
              value={currentMapId}
              onChange={(e) => {
                setCurrentMapId(e.target.value);
                setSearchParams({ mapId: e.target.value });
                AudioService.playTerminalBeep(1100, 0.03);
              }}
              className="bg-slate-800 text-cyan-300 font-mono text-xs px-2 py-1 rounded border border-cyan-800/60 focus:outline-none font-bold cursor-pointer max-w-[130px] truncate"
              title="Switch Active Campaign Map"
            >
              {availableMaps.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.title || m.name || 'Untitled Map'}
                </option>
              ))}
            </select>
          </div>
        )}

        <span className="text-[10px] font-mono text-amber-400 font-bold px-1.5 flex items-center gap-1">
          <Compass size={12} /> SCALE:
        </span>
        <select
          value={scaleTier}
          onChange={(e) => handleScaleChange(e.target.value as GridScaleTier)}
          className="bg-slate-800 text-amber-300 font-mono text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
        >
          <option value={GridScaleTier.Encounter}>Encounter (5 ft base)</option>
          <option value={GridScaleTier.Overland}>Overland (50 ft)</option>
          <option value={GridScaleTier.Planetary}>Planetary (10 km)</option>
          <option value={GridScaleTier.Interplanetary}>Interplanetary (10k km)</option>
          <option value={GridScaleTier.StarSystem}>Star System (1 AU)</option>
          <option value={GridScaleTier.Sector}>Sector (1 LY)</option>
        </select>

        <button
          onClick={handleGridTypeToggle}
          className="px-2 py-1 text-xs font-mono font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
          title="Toggle Hex or Square Grid"
        >
          {gridType === GridType.Square ? 'HEX' : 'SQUARE'}
        </button>

        <button
          onClick={() => setIsGridVisible(!isGridVisible)}
          className={`px-2 py-1 text-xs font-mono font-bold rounded border transition-colors cursor-pointer ${
            isGridVisible 
              ? 'bg-amber-950/60 text-amber-300 border-amber-800/60' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Toggle Grid Visibility"
        >
          GRID
        </button>

        <button
          onClick={() => setIsVisionEnabled(!isVisionEnabled)}
          className={`px-2 py-1 text-xs font-mono font-bold rounded border transition-colors flex items-center gap-1 cursor-pointer ${
            isVisionEnabled 
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Toggle Dynamic Vision & Fog"
        >
          {isVisionEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>VISION</span>
        </button>

        {isVisionEnabled && (
          <select
            value={torchRadiusFt}
            onChange={(e) => setTorchRadiusFt(parseInt(e.target.value, 10))}
            className="bg-slate-800 text-yellow-300 font-mono text-xs px-1.5 py-1 rounded border border-slate-700 focus:outline-none cursor-pointer"
            title="Torch & Line-of-Sight Radius"
          >
            <option value={15}>15 ft Torch</option>
            <option value={30}>30 ft Torch</option>
            <option value={60}>60 ft Light</option>
            <option value={120}>120 ft Sensor</option>
          </select>
        )}

        <div className="h-5 w-px bg-slate-700 mx-0.5" />

        {/* Zoom Controls */}
        <button
          onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
          className="p-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.4, prev - 0.15))}
          className="p-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
        <button
          onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
          className="p-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
          title="Reset Camera (100%)"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* ── RIGHT DOCKABLE TACTICAL COMMAND CONSOLE ── */}
      <aside 
        className="absolute top-16 right-4 w-88 max-w-[360px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200 z-[110] flex flex-col overflow-hidden"
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
            <Users size={12} /> SPAWN
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
            <Box size={12} /> OBJECTS
          </button>
          <button
            onClick={() => setActiveTab('dice')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'dice' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices size={12} /> DICE
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3 space-y-3 font-mono text-xs max-h-[380px] overflow-y-auto">
          {/* 1. COMBAT TAB */}
          {activeTab === 'combat' && (
            <div className="space-y-2.5">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>ATTACKER (CLICK)</span>
                  <span className="text-cyan-400 font-bold">{selectedToken?.name || 'NONE'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>TARGET (SHIFT-CLICK)</span>
                  <span className="text-red-400 font-bold">{targetToken?.name || 'NONE'}</span>
                </div>
              </div>

              {/* Weapon & MAP Step */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">WEAPON TYPE</span>
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

              {/* Called Shot Limb Targeting */}
              <div>
                <span className="text-[9px] text-slate-400 block mb-1 flex items-center justify-between">
                  <span>CALLED SHOT (33.3% TRAUMA)</span>
                  <span className="text-[8.5px] text-amber-400">
                    {targetedLimb === 'torso' ? 'Center Mass (Normal)' : `${targetedLimb.toUpperCase()} Target`}
                  </span>
                </span>
                <div className="grid grid-cols-5 gap-1 text-[9.5px]">
                  {[
                    { id: 'torso', label: 'Torso', desc: 'Standard' },
                    { id: 'head', label: 'Head', desc: 'Disorient' },
                    { id: 'arms', label: 'Arms', desc: 'Disarm' },
                    { id: 'legs', label: 'Legs', desc: 'Half Spd' },
                    { id: 'optics', label: 'Optics', desc: 'Blind' }
                  ].map(limb => (
                    <button
                      key={limb.id}
                      onClick={() => setTargetedLimb(limb.id as any)}
                      className={`p-1 rounded border text-center transition-colors cursor-pointer ${
                        targetedLimb === limb.id 
                          ? 'bg-amber-500/25 text-amber-300 border-amber-400 font-bold' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                      title={limb.desc}
                    >
                      {limb.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AIME Tactical AI Co-Pilot Telemetry Card */}
              <div className="bg-slate-950/90 p-2.5 rounded-xl border border-cyan-500/40 space-y-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    <Bot size={13} className="text-cyan-400" /> AIME TACTICAL CO-PILOT
                  </span>
                  <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono border border-cyan-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> LIVE TELEMETRY
                  </span>
                </div>

                {selectedToken && targetToken ? (() => {
                  const dx = targetToken.x - selectedToken.x;
                  const dy = targetToken.y - selectedToken.y;
                  const distFt = Math.round((Math.hypot(dx, dy) / 70) * 5);
                  const isPointBlank = distFt <= 5;
                  const coverCheck = bvhBuilderRef.current.calculateLineOfSightCover(
                    { x: selectedToken.x, y: selectedToken.y },
                    { x: targetToken.x, y: targetToken.y },
                    22 + (targetToken.size_modifier || 0) * 8
                  );

                  return (
                    <div className="space-y-1 text-[9.5px]">
                      <div className="flex justify-between text-slate-300">
                        <span>Range: <strong className="text-amber-300 font-mono">{distFt} FT</strong> ({isPointBlank ? 'POINT-BLANK' : distFt <= 30 ? 'SHORT' : distFt <= 60 ? 'MEDIUM' : 'LONG'})</span>
                        <span className={`font-bold ${coverCheck.coverType === 'none' ? 'text-emerald-400' : coverCheck.coverType === 'half' ? 'text-amber-400' : coverCheck.coverType === 'three_quarters' ? 'text-orange-400' : 'text-red-400'}`}>
                          LoS: {coverCheck.coverType.toUpperCase()} ({coverCheck.coverMod} DC)
                        </span>
                      </div>

                      {isPointBlank && (
                        <div className="p-1 rounded bg-amber-950/70 border border-amber-500/50 text-amber-300 flex items-center gap-1 font-bold">
                          <span>🎯</span> Point-Blank Advantage (+5 Strike, Advantage on Dmg)
                        </div>
                      )}

                      {coverCheck.coverType !== 'none' && coverCheck.coverType !== 'total' && (
                        <div className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1">
                          <span>🛡️</span> Obstacles detected: {coverCheck.coverType === 'half' ? 'Half Cover (+2 Def)' : '3/4 Cover (+5 Def)'}
                        </div>
                      )}

                      {coverCheck.coverType === 'total' && (
                        <div className="p-1 rounded bg-red-950/80 border border-red-500 text-red-300 flex items-center gap-1 font-bold">
                          <span>🚫</span> Line of Sight blocked by physical wall.
                        </div>
                      )}

                      {targetToken.armor_dr >= 15 && (
                        <div className="p-1 rounded bg-purple-950/70 border border-purple-500/50 text-purple-300 flex items-center gap-1">
                          <span>💡</span> High Armor DR ({targetToken.armor_dr}). Recommend Force / EMP shockwave.
                        </div>
                      )}

                      {targetToken.current_hp <= 0 && (
                        <div className="p-1 rounded bg-red-950/80 border border-red-500 text-red-300 flex items-center gap-1 font-bold animate-pulse">
                          <span>⚠️</span> TARGET IN MORTALITY STATE: Bleeding Out!
                        </div>
                      )}

                      {downedAllyNearby && (
                        <div className="p-1 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 flex items-center gap-1 font-bold animate-pulse">
                          <span>🩹</span> Allied {downedAllyNearby.name} adjacent at 0 HP. First Aid available!
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <span className="text-[9.5px] text-slate-500 italic block">Select Attacker and Target to engage AIME tactical telemetry.</span>
                )}
              </div>

              {/* Execute Attack Button */}
              <button
                onClick={handleExecuteCombatStrike}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-black font-bold uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap size={14} />
                <span>RESOLVE STRIKE & WOUNDS</span>
              </button>
            </div>
          )}

          {/* 2. SPAWNER TAB (Persona Folio & Bestiary) */}
          {activeTab === 'spawner' && (
            <div className="space-y-3">
              {/* Persona Folio Live Characters */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold uppercase pb-1 border-b border-slate-800 mb-1.5">
                  <span>Persona Folio Roster</span>
                  <span>{allFolioOperatives.length} Available</span>
                </div>
                {allFolioOperatives.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No saved operatives in Folio roster.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {allFolioOperatives.map((char: any) => {
                      const id = char['character-doc-id'] || char.id;
                      const name = char['char-name'] || 'Operative';
                      const species = typeof char['char-species'] === 'object' ? char['char-species']?.name : char['char-species'] || 'Human';
                      return (
                        <div key={id} className="p-1.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-1.5">
                          <div className="min-w-0">
                            <span className="text-slate-200 text-[10.5px] font-bold block truncate">{name}</span>
                            <span className="text-slate-500 text-[9px]">{species} • {char['tech-level'] || 'TL3'}</span>
                          </div>
                          <button
                            onClick={() => handleDeployFolioCharacter(char)}
                            className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[9.5px] font-bold uppercase shrink-0 cursor-pointer"
                          >
                            Deploy
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bestiary & Tactical Quick Presets */}
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase block pb-1 border-b border-slate-800 mb-1.5">
                  Bestiary & Threat Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
                  <button
                    onClick={() => handleSpawnEntity('persona', { name: 'Alterian Infiltrator', base_hp: 45, armor_dr: 15, speed_ft: 40, tech_level: 3, archetype: 'Infiltrator' })}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300 rounded-lg text-left cursor-pointer"
                  >
                    <span className="font-bold block text-[10px]">Alterian Infiltrator</span>
                    <span className="text-slate-500 text-[8.5px]">40ft • DR15 • TL3</span>
                  </button>
                  <button
                    onClick={() => handleSpawnEntity('persona', { name: 'Cyber-Medic', base_hp: 35, armor_dr: 10, speed_ft: 30, tech_level: 4, archetype: 'Cyber-Medic' })}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300 rounded-lg text-left cursor-pointer"
                  >
                    <span className="font-bold block text-[10px]">Cyber-Medic</span>
                    <span className="text-slate-500 text-[8.5px]">30ft • DR10 • TL4</span>
                  </button>
                  <button
                    onClick={() => handleSpawnEntity('mecha', { name: 'Vanguard Assault Mech', base_hp: 120, armor_dr: 35, speed_ft: 25, size_modifier: 2, tech_level: 4 })}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-300 rounded-lg text-left cursor-pointer"
                  >
                    <span className="font-bold block text-[10px]">Vanguard Mech</span>
                    <span className="text-slate-500 text-[8.5px]">25ft • DR35 • Size +2</span>
                  </button>
                  <button
                    onClick={() => handleSpawnEntity('preset', { name: 'Kitin Drone Swarm', base_hp: 30, armor_dr: 8, speed_ft: 35, tech_level: 2, archetype: 'Alien Swarm' })}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-red-300 rounded-lg text-left cursor-pointer"
                  >
                    <span className="font-bold block text-[10px]">Kitin Swarm</span>
                    <span className="text-slate-500 text-[8.5px]">35ft • DR8 • Swarm</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. TURNS & INITIATIVE TAB */}
          {activeTab === 'turns' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">TACTICAL ROUND</span>
                  <span className="text-sm font-bold text-amber-400">ROUND {roundNumber}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleRollAllInitiative}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Roll Init
                  </button>
                  <button
                    onClick={handleNextTurn}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold uppercase cursor-pointer"
                  >
                    Next Turn ►
                  </button>
                </div>
              </div>

              {/* Initiative Ladder List */}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {tokens.map((tok, idx) => {
                  const isCurrent = idx === currentTurnIndex;
                  return (
                    <div 
                      key={tok.id}
                      onClick={() => {
                        setSelectedTokenId(tok.id);
                        setCurrentTurnIndex(idx);
                      }}
                      className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        isCurrent 
                          ? 'bg-purple-950/70 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isCurrent ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className={`text-xs font-bold block ${isCurrent ? 'text-purple-200' : 'text-slate-300'}`}>
                            {tok.name}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {tok.current_hp}/{tok.base_hp} HP • DR {tok.armor_dr} • {getEffectiveSpeed(tok)}ft
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        {initiativeScores[tok.id] ? `INIT ${initiativeScores[tok.id]}` : `TL${tok.tech_level || 3}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. OBJECTS TAB */}
          {activeTab === 'objects' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 block">STORY FOUNDRY MAP ELEMENTS</span>
              <div className="space-y-1.5">
                {interactiveObjMgrRef.current.getAllObjects().map(obj => {
                  const state = interactiveObjMgrRef.current.getObject(obj.id);
                  return (
                    <div 
                      key={obj.id}
                      onClick={() => handleObjectClick(obj)}
                      className="p-2 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {obj.type === 'bulkhead' ? <Lock size={13} className="text-amber-400" /> : <Terminal size={13} className="text-cyan-400" />}
                        <span className="text-slate-200 text-[11px] font-bold">{obj.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {obj.type === 'bulkhead' ? (state?.isOpen ? 'OPEN' : 'LOCKED') : 'READY'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. DICE TAB */}
          {activeTab === 'dice' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 block">DICE AST & MACRO RUNNER</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customDiceExpr}
                  onChange={(e) => setCustomDiceExpr(e.target.value)}
                  className="flex-1 bg-slate-950 text-emerald-300 px-2 py-1 rounded border border-slate-700 text-xs focus:outline-none"
                  placeholder="e.g. 2d20kh1 + @armor_dr"
                />
                <button
                  onClick={handleRollCustomDice}
                  className="px-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded text-xs cursor-pointer"
                >
                  ROLL
                </button>
              </div>

              {/* Quick dice shortcuts */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {['1d20', '1d100', '1d10!', '2d6+4'].map(dice => (
                  <button
                    key={dice}
                    onClick={() => {
                      setCustomDiceExpr(dice);
                      diceParserRef.current.evaluateExpression(dice);
                    }}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                  >
                    {dice}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Stage Combat & Event Log with Spectator Sharing Link */}
        <div className="border-t border-slate-800 bg-slate-950/90 p-2 space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between pb-1 border-b border-slate-850">
            <span className="text-slate-400 font-bold uppercase text-[9.5px]">Live Telemetry Log</span>
            <div className="flex gap-1">
              <button
                onClick={handleCopySpectatorLink}
                className="px-1.5 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded text-[8.5px] font-bold flex items-center gap-1 cursor-pointer"
                title="Copy Live Spectator Link for Remote Players"
              >
                {copiedLink ? <Check size={10} /> : <Copy size={10} />}
                <span>{copiedLink ? 'COPIED' : 'SPECTATOR'}</span>
              </button>
              <button
                onClick={() => setCombatLog([])}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[8.5px] cursor-pointer"
                title="Clear Event Log"
              >
                CLEAR
              </button>
            </div>
          </div>
          <div className="max-h-[90px] overflow-y-auto space-y-1 text-slate-400 text-[9.5px]">
            {combatLog.map((log, index) => (
              <div key={index} className="leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── INTERACTIVE OBJECT DIALOG MODAL ── */}
      {selectedObjectModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setSelectedObjectModal(null)}
        >
          <div 
            className="bg-slate-900 border-2 border-cyan-500/60 rounded-2xl p-5 max-w-md w-full shadow-2xl text-slate-200 font-mono space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                {selectedObjectModal.type === 'bulkhead' ? <Lock className="text-amber-400" /> : <Terminal className="text-cyan-400" />}
                <h3 className="font-bold text-sm text-cyan-300">{selectedObjectModal.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedObjectModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {selectedObjectModal.type === 'bulkhead' 
                ? 'High-security blast bulkhead. Toggling this will update line-of-sight raycasting and acoustic occlusion on The Stage.' 
                : 'Encrypted mainframe terminal linked to Story Foundry narrative clues.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedObjectModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                DISMISS
              </button>
              {selectedObjectModal.type === 'bulkhead' ? (
                <button
                  onClick={() => handleToggleBulkhead(selectedObjectModal.id)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Unlock size={14} /> TOGGLE BULKHEAD
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCombatLog(prev => [`[TERMINAL] Sliced ${selectedObjectModal.name}: Unlocked clue [${selectedObjectModal.storyElementId}]`, ...prev.slice(0, 8)]);
                    setSelectedObjectModal(null);
                  }}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Terminal size={14} /> SLICE DATAPAD
                </button>
              )}
            </div>
          </div>
        </div>
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

      {/* ── In-Situ Architect Design Drawer & Asset Palette ── */}
      <ArchitectDesignPalette
        isOpen={isDesignModeActive}
        onClose={() => handleToggleDesignMode()}
        selectedStamp={selectedStamp}
        onSelectStamp={setSelectedStamp}
        gridSnap={gridSnap}
        onToggleGridSnap={() => setGridSnap(prev => !prev)}
        activeMapTitle={currentMap?.title || currentMap?.name || 'Tactical Sector'}
        wallsCount={localWalls.length}
        objectsCount={localObjects.length}
        hazardsCount={hazardCount}
      />
    </div>
  );
};

export default StageView;

