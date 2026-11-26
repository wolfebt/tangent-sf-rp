import React, { useCallback } from 'react';
import { Container } from 'pixi.js';
import { Box } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { BVHBuilder, type WallSegment } from '../../../engine/vision/BVHBuilder.ts';
import { CoordinateEngine } from '../../../engine/math/CoordinateEngine.ts';
import { InteractiveObjectManager } from '../../../engine/assets/InteractiveObjectManager.ts';
import type { SceneInteractiveObject } from '../../../engine/assets/FoundryIngestion.ts';
import { selectAllFusedTokens, useEngineStore, type FusedToken } from '../../../engine/state/VolatileSharder.ts';
import {
  LightSourceManager,
  type LightAnimationType,
  type SceneLightSource
} from '../../../engine/vision/LightSourceManager';
import { BIOME_OPTIONS, type PaletteItem } from '../ArchitectDesignPalette';
import { MASTER_TERRAINS } from '../../../pages/Foundry/MapMaker/map/MapConstants.js';
import { createSceneRegion, type SceneRegionTriggerType } from '../../../engine/cartography/SceneRegionManager';
import { AudioService } from '../../../services/audioService';
import { evaluateTrapTriggers } from '../../../services/reactiveVttService';
import {
  compileChunkToMapElements,
  transformChunkBlueprint,
  computeWorldPerimeterSockets,
  findBestSocketSnap,
  weldChunkWallsAndDoors
} from '../../../services/mapChunkCompilerService';
import { SCIENCE_FANTASY_SEED_CHUNKS } from '../../../data/seed_chunks/science_fantasy_chunks';
import { getMapLayerState } from '../../../utils/mapSchemaAdapter';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { createRoomWalls, expandWallsForGeometry, findNearestWallVertex, snapPointToAngle } from '../../../schemas/vttWallSchema.js';
import { VttEventBus } from '../../../utils/vttEventBus';
import { buildVttUnitFromPersona } from '../../../utils/personaBridge';
import { adeElementToInteractiveObject, normalizeMapObject } from '../../../utils/storyAssetAdapter';
import { createBlankCanvas } from './defaultMaps';

export interface UseStagePointerToolsParams {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  coordEngineRef: React.MutableRefObject<CoordinateEngine>;
  mouseWorldPosRef: React.MutableRefObject<{ x: number; y: number }>;
  interactiveObjMgrRef: React.MutableRefObject<InteractiveObjectManager>;
  bvhBuilderRef: React.MutableRefObject<BVHBuilder>;
  lightSourceMgrRef: React.MutableRefObject<LightSourceManager>;
  armedChunkRef: React.MutableRefObject<any>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  zoom: number;
  dragStartPos: { x: number; y: number };
  setDragStartPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isDraggingPan: boolean;
  setIsDraggingPan: React.Dispatch<React.SetStateAction<boolean>>;
  isDesignModeActive: boolean;
  activeDesignTool: string;
  effectiveIsArchitectRole: boolean;
  fogBrushMode: 'none' | 'reveal' | 'hide';
  fogBoxStart: { x: number; y: number } | null;
  setFogBoxStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  revealFogRect: (x: number, y: number, w: number, h: number) => void;
  hideFogRect: (x: number, y: number, w: number, h: number) => void;
  isAoEMode: boolean;
  isAimingAoE: boolean;
  hasCommittedTemplate: boolean;
  startAoETemplate: (pos: { x: number; y: number }) => void;
  updateAoETarget: (pos: { x: number; y: number }) => void;
  commitAoETemplate: (pos: { x: number; y: number }) => void;
  isMoveModeActive: boolean;
  setIsMoveModeActive: React.Dispatch<React.SetStateAction<boolean>>;
  moveRulerContainer: Container | null;
  redrawMoveRuler: () => void;
  selectedToken: FusedToken | null;
  selectedTokenId: string | null;
  tokens: FusedToken[];
  localObjects: SceneInteractiveObject[];
  setLocalObjects: React.Dispatch<React.SetStateAction<SceneInteractiveObject[]>>;
  localWalls: WallSegment[];
  setLocalWalls: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  localLights: SceneLightSource[];
  setLocalLights: React.Dispatch<React.SetStateAction<SceneLightSource[]>>;
  currentMap: any;
  addMap?: any;
  updateMap: any;
  setActiveMapId?: (id: string) => void;
  gridSnap: boolean;
  isMarqueeActive: boolean;
  setIsMarqueeActive: React.Dispatch<React.SetStateAction<boolean>>;
  marqueeStart: { x: number; y: number } | null;
  setMarqueeStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  marqueeCurrent: { x: number; y: number } | null;
  setMarqueeCurrent: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  setSelectedAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  isDrawingToolActive: boolean;
  setIsDrawingToolActive: React.Dispatch<React.SetStateAction<boolean>>;
  wallDrawStart: { x: number; y: number } | null;
  setWallDrawStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  wallDrawCurrent: { x: number; y: number } | null;
  setWallDrawCurrent: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  wallConstructionMode: string;
  setWallChainPoints: React.Dispatch<React.SetStateAction<Array<{ x: number; y: number }>>>;
  selectedWallType: string;
  doorLockDc: number;
  currentStrokePoints: number[];
  setCurrentStrokePoints: React.Dispatch<React.SetStateAction<number[]>>;
  selectedTerrainId: string;
  terrainBrushWidth: number;
  terrainRenderMode: string;
  pencilColor: string;
  pencilWidth: number;
  textLabelInput: string;
  textColor: string;
  textSize: number;
  selectedLightRadius: number;
  selectedLightColor: string;
  selectedLightAnimation: LightAnimationType;
  selectedStamp: PaletteItem | null;
  storeObjectType: any;
  storeTerrain?: any;
  storeTokenLabel?: string;
  selectedRegionType?: string;
  recordHistory: (action?: string) => void;
  setCombatLog: React.Dispatch<React.SetStateAction<string[]>>;
  deployArchitectItem: (item: PaletteItem, targetX: number, targetY: number) => void;
}

const resolveSelectedBiome = (selectedTerrainId: string, storeTerrain?: any) => {
  if (storeTerrain && typeof storeTerrain === 'object' && (storeTerrain.color || storeTerrain.label || storeTerrain.name)) {
    return {
      id: storeTerrain.id || selectedTerrainId || 'terrain',
      label: storeTerrain.label || storeTerrain.name || 'Terrain',
      color: storeTerrain.color || '#14532d'
    };
  }
  const preset = BIOME_OPTIONS.find((b) => b.id === selectedTerrainId);
  if (preset) return preset;
  const masterList = (Object.values(MASTER_TERRAINS || {}) as any[]).flat();
  const masterMatch = masterList.find((t: any) => t && t.id === selectedTerrainId);
  if (masterMatch) {
    return {
      id: masterMatch.id,
      label: masterMatch.label || masterMatch.name || 'Terrain',
      color: masterMatch.color || '#14532d'
    };
  }
  return {
    id: selectedTerrainId || 'terrain',
    label: 'Terrain',
    color: '#14532d'
  };
};

/**
 * Coordinates mouse pointer, pan, marquee selection, freehand/wall drawing, AoE, fog brush, token movement, and drag-and-drop tools on the Stage canvas.
 */
export const useStagePointerTools = ({
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
  storeTerrain,
  storeTokenLabel,
  selectedRegionType,
  recordHistory,
  setCombatLog,
  deployArchitectItem,
  addMap,
  setActiveMapId
}: UseStagePointerToolsParams) => {
  // Convert Screen Mouse Coordinates to World Coordinates
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom
    };
  }, [pan, zoom]);

  // Tactical Eraser Implementation
  const isToolLayerLocked = (layerId: string) => {
    const state = getMapLayerState(currentMap, layerId);
    if (state.locked) {
      AudioService.playTerminalBeep(420, 0.04);
      setCombatLog(prev => [
        `[LAYER LOCKED] Unlock "${layerId}" layer to edit or erase elements.`,
        ...prev.slice(0, 8)
      ]);
      return true;
    }
    return false;
  };

  const handleEraseAt = (pos: { x: number; y: number }) => {
    recordHistory();

    // 1. Check interactive objects
    const objHit = localObjects.find(o => Math.hypot(o.x - pos.x, o.y - pos.y) <= 35);
    if (objHit) {
      if (isToolLayerLocked('objects')) return;
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
      if (isToolLayerLocked('walls')) return;
      const updatedWalls = localWalls.filter(w => w.id !== wallHit.id);
      setLocalWalls(updatedWalls);
      bvhBuilderRef.current.build(expandWallsForGeometry(updatedWalls) as any);
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
      if (isToolLayerLocked('annotations')) return;
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
        if (Math.hypot(l.points[i] - pos.x, l.points[i + 1] - pos.y) <= 25) return true;
      }
      return false;
    });
    if (lineHit) {
      if (isToolLayerLocked('annotations')) return;
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
        if (Math.hypot(t.points[i] - pos.x, t.points[i + 1] - pos.y) <= 30) return true;
      }
      return false;
    });
    if (terrainHit) {
      if (isToolLayerLocked(terrainHit.isRoofLayer ? 'roof' : 'terrain')) return;
      const updatedTerrains = (currentMap?.terrains || []).filter((t: any) => t.id !== terrainHit.id);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { terrains: updatedTerrains });
      }
      AudioService.playTerminalBeep(850, 0.05);
      setCombatLog(prev => [`[ERASER] Erased terrain polygon`, ...prev.slice(0, 8)]);
      return;
    }

    // 6. Check scene regions
    const regionHit = (currentMap?.regions || []).find((r: any) => {
      const b = r?.bounds || {};
      const rx = Number(b.x ?? r?.x ?? 0);
      const ry = Number(b.y ?? r?.y ?? 0);
      const rw = Number(b.width ?? r?.width ?? 150);
      const rh = Number(b.height ?? r?.height ?? 150);
      return pos.x >= rx - 15 && pos.x <= rx + rw + 15 && pos.y >= ry - 15 && pos.y <= ry + rh + 15;
    });
    if (regionHit) {
      if (isToolLayerLocked('regions')) return;
      const updatedRegions = (currentMap?.regions || []).filter((r: any) => r.id !== regionHit.id);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { regions: updatedRegions });
      }
      AudioService.playTerminalBeep(850, 0.05);
      setCombatLog(prev => [`[ERASER] Removed scene region "${regionHit.name || regionHit.id}"`, ...prev.slice(0, 8)]);
    }
  };

  // Canvas Mouse Move
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    mouseWorldPosRef.current = worldPos;
    if (isAimingAoE) {
      updateAoETarget(worldPos);
      return;
    }
    if ((isMoveModeActive || activeDesignTool === 'ruler') && moveRulerContainer && selectedToken) {
      redrawMoveRuler();
    }

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
      if ((activeDesignTool === 'wall' || activeDesignTool === 'curved_wall') && wallDrawStart) {
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
      if (effectiveIsArchitectRole && fogBrushMode !== 'none') {
        setFogBoxStart(worldPos);
        return;
      }
      if (effectiveIsArchitectRole && (isAoEMode || activeDesignTool === 'aoe')) {
        startAoETemplate(worldPos);
        return;
      }
      const engine = coordEngineRef.current;
      const snapped = gridSnap ? engine.snapPixelToGrid(worldPos) : worldPos;

      if (isDesignModeActive && effectiveIsArchitectRole) {
        if (activeDesignTool === 'pan') {
          setIsDraggingPan(true);
          setDragStartPos({ x: e.clientX, y: e.clientY });
          return;
        } else if (activeDesignTool === 'select') {
          // Check if user clicked an interactive object, token, wall, or light
          const hitObj = localObjects.find(o => Math.hypot(o.x - worldPos.x, o.y - worldPos.y) <= 30);
          const hitToken = tokens.find(t => Math.hypot(t.x - worldPos.x, t.y - worldPos.y) <= 30);
          const hitWall = localWalls.find(w => {
            const d1 = Math.hypot(worldPos.x - w.p1.x, worldPos.y - w.p1.y);
            const d2 = Math.hypot(worldPos.x - w.p2.x, worldPos.y - w.p2.y);
            return d1 <= 20 || d2 <= 20;
          });
          const hitLight = localLights.find(l => Math.hypot(l.x - worldPos.x, l.y - worldPos.y) <= 25);
          const hitRegion = (currentMap?.regions || []).find((r: any) => {
            const b = r?.bounds || {};
            const rx = Number(b.x ?? r?.x ?? 0);
            const ry = Number(b.y ?? r?.y ?? 0);
            const rw = Number(b.width ?? r?.width ?? 150);
            const rh = Number(b.height ?? r?.height ?? 150);
            return worldPos.x >= rx && worldPos.x <= rx + rw && worldPos.y >= ry && worldPos.y <= ry + rh;
          });

          const hitId = hitObj?.id || hitToken?.id || hitWall?.id || hitLight?.id || hitRegion?.id;

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
        } else if (activeDesignTool === 'wall' || activeDesignTool === 'curved_wall') {
          if (isToolLayerLocked('walls')) return;
          recordHistory(activeDesignTool === 'curved_wall' ? 'Draw Curved Wall' : 'Draw Wall');
          setIsDrawingToolActive(true);

          // Magnetic endpoint snap
          const vertexSnap = findNearestWallVertex(snapped, localWalls, 20);
          const startPt = vertexSnap || snapped;

          setWallDrawStart(startPt);
          setWallDrawCurrent(startPt);
          AudioService.playTerminalBeep(1100, 0.02);
          return;
        } else if (activeDesignTool === 'terrain') {
          if (isToolLayerLocked('terrain')) return;
          recordHistory('Paint Terrain');
          setIsDrawingToolActive(true);
          setCurrentStrokePoints([worldPos.x, worldPos.y]);
          return;
        } else if (activeDesignTool === 'fill') {
          // Room Flooring Fill Bucket
          recordHistory('Fill Room Floor');
          const biome = resolveSelectedBiome(selectedTerrainId, storeTerrain);
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
          if (isToolLayerLocked('lighting')) return;
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
          if (isToolLayerLocked('annotations')) return;
          recordHistory('Draw Sketch Line');
          setIsDrawingToolActive(true);
          setCurrentStrokePoints([worldPos.x, worldPos.y]);
          return;
        } else if (activeDesignTool === 'text') {
          if (isToolLayerLocked('annotations')) return;
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
        } else if (activeDesignTool === 'waypoint') {
          if (currentMap && updateMap) {
            const existing = currentMap.waypoints || [];
            const newWp = {
              id: `wp_${Date.now()}`,
              name: `Waypoint ${String.fromCharCode(65 + (existing.length % 26))}: Sector Objective`,
              x: Math.round(snapped.x),
              y: Math.round(snapped.y),
              radius: 60,
              type: 'objective',
              linkedBeatIndex: Math.min(existing.length, 10),
              readAloudText: 'The squad enters the designated waypoint perimeter.'
            };
            updateMap(currentMap.id, {
              waypoints: [...existing, newWp]
            });
            AudioService.playTerminalBeep(1350, 0.04);
            setCombatLog(prev => [
              `[WAYPOINT] Objective Marker "${newWp.name}" dropped at (${Math.round(snapped.x)}, ${Math.round(snapped.y)}).`,
              ...prev.slice(0, 8)
            ]);
          }
          return;
        } else if (activeDesignTool === 'region') {
          if (isToolLayerLocked('regions')) return;
          const rawType = String(selectedRegionType || 'roof_zone');
          const normalizedType: SceneRegionTriggerType =
            rawType === 'audio_zone'
              ? 'audio_cue'
              : rawType === 'roof_zone' ||
                  rawType === 'hazard' ||
                  rawType === 'teleport_deck' ||
                  rawType === 'switch_map' ||
                  rawType === 'story_flag' ||
                  rawType === 'audio_cue'
                ? (rawType as SceneRegionTriggerType)
                : 'roof_zone';
          const region = createSceneRegion({
            name: `${normalizedType.replace('_', ' ').toUpperCase()} Zone`,
            triggerType: normalizedType,
            bounds: {
              x: Math.round(snapped.x - 90),
              y: Math.round(snapped.y - 90),
              width: 180,
              height: 180
            },
            payload: {},
            autoTrigger: true
          });
          if (currentMap && updateMap) {
            recordHistory('Place Scene Region');
            updateMap(currentMap.id, {
              regions: [...(currentMap.regions || []), region]
            });
          }
          AudioService.playTerminalBeep(1300, 0.04);
          setCombatLog(prev => [
            `[REGION] Stamped ${region.triggerType.toUpperCase()} trigger volume (180x180) at (${Math.round(snapped.x)}, ${Math.round(snapped.y)}).`,
            ...prev.slice(0, 8)
          ]);
          return;
        } else if (activeDesignTool === 'token') {
          if (isToolLayerLocked('tokens')) return;
          recordHistory('Deploy Token');
          const newTokId = `token-${Date.now()}`;
          const tokenName = storeTokenLabel?.trim() || textLabelInput || 'Tactical Unit';
          const staticToken = {
            id: newTokId,
            name: tokenName,
            base_hp: 30,
            base_vitality: 30,
            base_health: 30,
            tech_level: 3,
            armor_dr: 6,
            stamina_dr: 2,
            speed_ft: 30,
            size_modifier: 0,
            is_persona: false
          };
          useEngineStore.getState().loadStaticEntity(staticToken);
          useEngineStore.getState().updatePosition(newTokId, snapped.x, snapped.y);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, {
              tokens: [...(currentMap.tokens || []), { ...staticToken, x: snapped.x, y: snapped.y }]
            });
          }
          AudioService.playCriticalChime(true);
          setCombatLog(prev => [
            `[TOKEN] Deployed "${tokenName}" at (${Math.round(snapped.x)}, ${Math.round(snapped.y)}).`,
            ...prev.slice(0, 8)
          ]);
          return;
        } else if (activeDesignTool === 'chunk') {
          if (isToolLayerLocked('walls') || isToolLayerLocked('terrain')) return;
          if (armedChunkRef.current?.chunk && currentMap && updateMap) {
            recordHistory('Stamp Prefab Chunk');
            const gSize = Number(currentMap.gridSize || 50);
            let targetCol = Math.round(snapped.x / gSize);
            let targetRow = Math.round(snapped.y / gSize);
            const rotDeg = (armedChunkRef.current.rotationDeg || 0) as 0 | 90 | 180 | 270;
            const flipX = Boolean(armedChunkRef.current.flipX);
            const flipY = Boolean(armedChunkRef.current.flipY);
            const existingInstances = Array.isArray(currentMap.chunkInstances) ? currentMap.chunkInstances : [];
            const allBlueprints = [
              ...(SCIENCE_FANTASY_SEED_CHUNKS || []),
              ...(Array.isArray(armedChunkRef.current.customChunks) ? armedChunkRef.current.customChunks : [])
            ];

            let snapMatch = null;
            if (armedChunkRef.current.magneticSnapEnabled !== false && existingInstances.length > 0) {
              snapMatch = findBestSocketSnap(
                armedChunkRef.current.chunk,
                targetCol,
                targetRow,
                gSize,
                rotDeg,
                flipX,
                flipY,
                existingInstances,
                allBlueprints as any
              );
              if (snapMatch) {
                targetCol = snapMatch.snappedCol;
                targetRow = snapMatch.snappedRow;
              }
            }

            const compiled = compileChunkToMapElements(armedChunkRef.current.chunk, {
              targetCol,
              targetRow,
              gridSize: gSize,
              rotationDeg: rotDeg,
              flipX,
              flipY,
              settings: armedChunkRef.current.settings,
              slotOverrides: armedChunkRef.current.slotOverrides
            });

            const existingSockets: any[] = [];
            for (const inst of existingInstances) {
              const bp = inst.blueprintSnapshot || allBlueprints.find((b: any) => b.chunkId === inst.chunkId);
              if (!bp) continue;
              const transExisting = transformChunkBlueprint(bp as any, inst.rotationDeg, inst.flipX, inst.flipY);
              existingSockets.push(
                ...computeWorldPerimeterSockets(transExisting, inst.col * gSize, inst.row * gSize, gSize, inst.instanceId)
              );
            }
            const weldedWalls = weldChunkWallsAndDoors(
              localWalls,
              compiled.walls || [],
              compiled.worldSockets || [],
              existingSockets
            );

            const nextTerrains = [...(currentMap.terrains || []), ...(compiled.terrains || [])];
            const nextObjects = [...localObjects, ...(compiled.objects || [])];
            const nextLights = [...localLights, ...(compiled.lights || [])];
            setLocalWalls(weldedWalls as any);
            setLocalObjects(nextObjects as any);
            setLocalLights(nextLights as any);
            bvhBuilderRef.current.build(expandWallsForGeometry(weldedWalls) as any);
            interactiveObjMgrRef.current.loadObjects(nextObjects as any);
            updateMap(currentMap.id, {
              terrains: nextTerrains,
              walls: weldedWalls,
              objects: nextObjects,
              lights: nextLights,
              chunkInstances: [...existingInstances, compiled.instanceRecord]
            });
            AudioService.playCriticalChime(true);
            setCombatLog(prev => [
              `[CHUNK] Deployed "${armedChunkRef.current.chunk.name || 'Prefab Chunk'}" onto Stage${snapMatch ? ' (Socket Welded!)' : ''}.`,
              ...prev.slice(0, 8)
            ]);
          }
          return;
        } else if (activeDesignTool === 'object' || activeDesignTool === 'hazard') {
          if (isToolLayerLocked('objects')) return;
          let itemToDeploy = selectedStamp;
          if (!itemToDeploy && storeObjectType) {
            const propObj = (typeof storeObjectType === 'object' ? storeObjectType : {}) as any;
            itemToDeploy = {
              id: propObj.id || `obj-${Date.now()}`,
              category: propObj.category || 'Objects',
              label: propObj.label || propObj.name || 'Prop',
              desc: propObj.desc || 'Tactical Sector Asset',
              type: propObj.category === 'Hazards' ? 'hazard' : 'object',
              subType: propObj.category || 'terminal',
              icon: Box,
              color: propObj.color || '#22d3ee',
              defaultProps: {
                name: propObj.label || propObj.name || 'Prop',
                color: propObj.color,
                radius: propObj.radius,
                width: propObj.width,
                height: propObj.height,
                shape: propObj.shape,
                imageUrl: propObj.imageUrl
              }
            };
          }

          if (itemToDeploy) {
            deployArchitectItem(itemToDeploy, snapped.x, snapped.y);
            return;
          } else {
            const defaultProp: PaletteItem = {
              id: `obj-crate-${Date.now()}`,
              category: 'Objects',
              label: 'Tactical Cargo Crate',
              desc: 'Hardened titanium storage crate.',
              type: 'object',
              subType: 'crate',
              icon: Box,
              color: '#22d3ee',
              defaultProps: { name: 'Cargo Crate' }
            };
            deployArchitectItem(defaultProp, snapped.x, snapped.y);
            return;
          }
        }
      }
    }
  };

  // Canvas Mouse Up
  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingPan) {
      setIsDraggingPan(false);
    }

    if (effectiveIsArchitectRole && fogBrushMode !== 'none' && fogBoxStart) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const w = worldPos.x - fogBoxStart.x;
      const h = worldPos.y - fogBoxStart.y;
      if (fogBrushMode === 'reveal') {
        revealFogRect(fogBoxStart.x, fogBoxStart.y, w, h);
      } else {
        hideFogRect(fogBoxStart.x, fogBoxStart.y, w, h);
      }
      setFogBoxStart(null);
      return;
    }

    if (isAimingAoE) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      commitAoETemplate(worldPos);
      return;
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

      if ((activeDesignTool === 'wall' || activeDesignTool === 'curved_wall') && wallDrawStart && wallDrawCurrent) {
        if (wallConstructionMode === 'room' && activeDesignTool === 'wall') {
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
          // Single, Chain, or Curved Bezier segment
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
            (newWall as any).type = selectedWallType;
            (newWall as any).wallType = selectedWallType;
            (newWall as any).isDoor = isDoor;
            (newWall as any).lockDc = doorLockDc;

            if (activeDesignTool === 'curved_wall') {
              const dx = wallDrawCurrent.x - wallDrawStart.x;
              const dy = wallDrawCurrent.y - wallDrawStart.y;
              (newWall as any).bezierControl = {
                x: Math.round((wallDrawStart.x + wallDrawCurrent.x) / 2 - dy * 0.28),
                y: Math.round((wallDrawStart.y + wallDrawCurrent.y) / 2 + dx * 0.28)
              };
            }

            const updatedWalls = [...localWalls, newWall];
            if (activeDesignTool === 'curved_wall') {
              bvhBuilderRef.current.build(expandWallsForGeometry(updatedWalls) as any);
            } else {
              bvhBuilderRef.current.addWall(newWall);
            }
            setLocalWalls(updatedWalls);
            if (currentMap && updateMap) {
              updateMap(currentMap.id, { walls: updatedWalls });
            }
            AudioService.playTerminalBeep(1350, 0.04);
            setCombatLog(prev => [
              `[${activeDesignTool === 'curved_wall' ? 'CURVED WALL' : 'WALL DRAW'}] Created ${selectedWallType.toUpperCase()} segment from (${Math.round(wallDrawStart.x)}, ${Math.round(wallDrawStart.y)}) to (${Math.round(wallDrawCurrent.x)}, ${Math.round(wallDrawCurrent.y)}).`,
              ...prev.slice(0, 8)
            ]);

            if (wallConstructionMode === 'chain' && activeDesignTool === 'wall') {
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
        const biome = resolveSelectedBiome(selectedTerrainId, storeTerrain);
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
    if (isDraggingPan || isDrawingToolActive || isAoEMode || activeDesignTool === 'aoe' || isAimingAoE || hasCommittedTemplate) return;

    if (isDesignModeActive) {
      // Prevent double-placement since handleCanvasPointerDown already deploys architect items & tokens
      return;
    }

    if (!selectedTokenId) return;

    const sync = getVttMultiplayerSync();
    if (!sync.canMoveToken(selectedTokenId)) {
      AudioService.playTerminalBeep(420, 0.04);
      setCombatLog(prev => [
        `[PERMISSION DENIED] Current role cannot relocate "${selectedToken?.name || selectedTokenId}".`,
        ...prev.slice(0, 8)
      ]);
      return;
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);
    const engine = coordEngineRef.current;
    const snapped = gridSnap
      ? engine.snapPixelToGrid(worldPos)
      : { x: Math.round(worldPos.x), y: Math.round(worldPos.y) };

    const engineStore = useEngineStore.getState();
    const preservedElev = Number(
      selectedToken?.elevation_ft ?? engineStore.ephemeralData[selectedTokenId]?.elevation_ft ?? 0
    ) || 0;
    engineStore.updatePosition(selectedTokenId, snapped.x, snapped.y);
    sync.broadcastTokenMove(selectedTokenId, snapped.x, snapped.y, preservedElev);

    if (currentMap?.id && updateMap && Array.isArray(currentMap.tokens)) {
      const nextTokens = currentMap.tokens.map((t: any) =>
        t.id === selectedTokenId ? { ...t, x: snapped.x, y: snapped.y } : t
      );
      updateMap(currentMap.id, { tokens: nextTokens });
    }
    AudioService.playTerminalBeep(1100, 0.02);

    if (isMoveModeActive) {
      setIsMoveModeActive(false);
      setCombatLog(prev => [
        `[MOVE] ${selectedToken?.name || 'Operator'} relocated to coordinates (${snapped.x}, ${snapped.y}).`,
        ...prev.slice(0, 8)
      ]);
    }

    // ── Evaluate Reactive Trap Triggers on Token Move ──
    const movedToken = {
      ...selectedToken,
      id: selectedTokenId,
      x: snapped.x,
      y: snapped.y
    };
    const objectsOnMap = localObjects.length > 0 ? localObjects : (currentMap?.objects || []);
    const fusedTokens = selectAllFusedTokens(engineStore);
    const trapEvents = evaluateTrapTriggers(movedToken, objectsOnMap, fusedTokens);

    if (trapEvents && trapEvents.length > 0) {
      const triggeredTrapIds = new Set<string>();
      const sync = getVttMultiplayerSync();
      let vitalsChanged = false;

      trapEvents.forEach((evt: any) => {
        setCombatLog(prev => [
          evt.logMessage,
          ...prev.slice(0, 8)
        ]);
        const trapCard = {
          id: `trap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          sender: evt.trapName || 'Tactical Hazard',
          visibility: 'public' as const,
          kind: 'effect' as const,
          title: evt.isSaveSuccess ? `Trap Evaded: ${evt.trapName}` : `Trap Triggered: ${evt.trapName}`,
          body: evt.logMessage
        };
        VttEventBus.emit('stage-chat-card', trapCard);
        sync.broadcastChatCard(trapCard);

        if (evt.damage > 0) {
          engineStore.applyDamage(selectedTokenId, evt.damage, !evt.isSaveSuccess);
          vitalsChanged = true;
        }
        if (evt.condition) {
          engineStore.addCondition(selectedTokenId, String(evt.condition));
          vitalsChanged = true;
        }

        const matchedTrap = objectsOnMap.find((o: any) => o?.id === evt.trapId);
        if (matchedTrap && !matchedTrap.isRepeating && evt.trapId) {
          triggeredTrapIds.add(String(evt.trapId));
        }
      });

      if (vitalsChanged) {
        const updatedTrapEph = useEngineStore.getState().ephemeralData[selectedTokenId];
        if (updatedTrapEph) {
          sync.broadcastTokenVitals(selectedTokenId, updatedTrapEph);
        }
      }

      if (triggeredTrapIds.size > 0) {
        const nextObjects = objectsOnMap.map((o: any) =>
          o?.id && triggeredTrapIds.has(String(o.id))
            ? { ...o, trapState: 'triggered', isTriggered: true }
            : o
        );
        setLocalObjects(nextObjects);
        interactiveObjMgrRef.current.loadObjects(nextObjects);
        if (currentMap?.id && updateMap) {
          updateMap(currentMap.id, { objects: nextObjects });
        }
      }
    }

    // ── Evaluate Objective Waypoint Triggers on Token Move ──
    const waypointsOnMap = currentMap?.waypoints || [];
    waypointsOnMap.forEach((wp: any) => {
      if (wp.isTriggered) return;
      const radius = wp.radius || 60;
      const dist = Math.hypot(snapped.x - wp.x, snapped.y - wp.y);
      if (dist <= radius) {
        VttEventBus.emit('story-waypoint-tripped', {
          waypoint: wp,
          token: movedToken,
          action: wp.triggerAction || 'REVEAL_BEAT',
          targetScenarioId: wp.targetScenarioId,
          beat: wp.readAloudText
        });
        setCombatLog(prev => [
          `[WAYPOINT] ${movedToken.name || 'Operator'} entered perimeter of "${wp.name}".`,
          ...prev.slice(0, 8)
        ]);
      }
    });
  };

  // Drag & drop handlers
  const handleCanvasDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Let OS file drops bubble up to StageViewportWrapper for image map/token ingestion dialog
      return;
    }

    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;

    // Prevent StageViewportWrapper from handling the same JSON drop a second time in screen coordinates
    e.stopPropagation();
    if (!effectiveIsArchitectRole) return;

    try {
      const data: any = JSON.parse(rawData);
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const gSize = currentMap?.gridSize || 70;
      const snapped = gridSnap
        ? (coordEngineRef.current?.snapPixelToGrid?.(worldPos) || {
            x: Math.round(worldPos.x / gSize) * gSize,
            y: Math.round(worldPos.y / gSize) * gSize
          })
        : { x: Math.round(worldPos.x), y: Math.round(worldPos.y) };

      const targetX = snapped.x;
      const targetY = snapped.y;

      // 1. Architect Design Palette Item (requires Design Mode active)
      const isPaletteItem =
        Boolean(data?.defaultProps) &&
        Boolean(data?.type) &&
        Boolean(data?.label) &&
        !data?.element &&
        !data?.rawPersona;

      if (isPaletteItem) {
        if (!isDesignModeActive) return;
        deployArchitectItem(data as PaletteItem, targetX, targetY);
        return;
      }

      // 2. Persona / Hero Token Drop from Folio or ADE Catalog
      const isPersona =
        data.type === 'character' ||
        data.type === 'hero' ||
        data.type === 'folio_hero_token' ||
        Boolean(data.isPersona) ||
        data.elementType === 'Persona' ||
        data.element?.type === 'Persona';

      if (isPersona) {
        const charData = data.rawPersona || data.element || data;
        const vttUnit = (buildVttUnitFromPersona(charData, {
          uniqueInstance: true,
          position: { x: targetX, y: targetY }
        }) || {}) as Record<string, any>;
        const newId = vttUnit.id || `${charData.id || 'token'}-${Date.now()}`;
        const isSyn = Boolean(vttUnit.is_synthetic);
        const staticToken = {
          ...vttUnit,
          id: newId,
          character_doc_id: vttUnit.character_doc_id || charData.id || charData.heroId || charData['character-doc-id'],
          name: charData.name || charData.title || vttUnit.name || 'Operator',
          base_hp: vttUnit.base_hp || charData.health || charData.hp || 30,
          base_vitality: vttUnit.base_vitality || charData.vitality || 30,
          base_health: vttUnit.base_health || charData.health || charData.hp || 30,
          base_structure: vttUnit.base_structure || charData.structure || (isSyn ? 60 : 0),
          is_synthetic: isSyn,
          tech_level: vttUnit.tech_level || 3,
          armor_dr: charData.dr ?? vttUnit.armor_dr ?? 6,
          stamina_dr: charData.stamina_dr ?? vttUnit.stamina_dr ?? 2,
          size_modifier: vttUnit.size_modifier || 0,
          speed_ft: vttUnit.speed_ft || 30,
          species: charData.species || vttUnit.species || 'Human',
          archetype: charData.archetype || vttUnit.archetype || 'Operator',
          is_persona: vttUnit.is_persona
        };

        useEngineStore.getState().loadStaticEntity(staticToken as any);
        useEngineStore.getState().updatePosition(newId, targetX, targetY);
        useEngineStore.getState().clearSelection();
        useEngineStore.getState().setSelection(newId, true);

        if (currentMap && updateMap) {
          updateMap(currentMap.id, {
            tokens: [...(currentMap.tokens || []), { ...staticToken, x: targetX, y: targetY }]
          });
        } else if (addMap) {
          const newMap = createBlankCanvas({ title: 'Tactical Sector' });
          newMap.tokens = [{ ...staticToken, x: targetX, y: targetY }];
          addMap(newMap);
          setActiveMapId?.(newMap.id);
        }
        AudioService.playCriticalChime(true);
        return;
      }

      // 3. Story Element / Interactive Object Drop
      const elem = data.element || data;
      const adaptedObj = normalizeMapObject(
        adeElementToInteractiveObject(elem, { x: targetX, y: targetY }) || {
          id: `obj-${elem.id || Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: 'sensor_beacon',
          name: elem.title || elem.name || 'Interactive Element',
          storyElementId: elem.id,
          storyElementType: elem.type || elem.elementType || 'Custom',
          x: targetX,
          y: targetY,
          isOpen: false,
          omnicortexGearId: elem.fields?.gearId || elem.id,
          readAloudText: elem.content || elem.fields?.summary || ''
        }
      );

      if (currentMap && updateMap) {
        updateMap(currentMap.id, {
          objects: [...(currentMap.objects || []), adaptedObj]
        });
      } else if (addMap) {
        const newMap = createBlankCanvas({ title: 'Tactical Sector' });
        newMap.objects = [adaptedObj];
        addMap(newMap);
        setActiveMapId?.(newMap.id);
      }
      AudioService.playCriticalChime(true);
    } catch (err) {
      console.warn('Failed to parse dropped canvas item:', err);
    }
  };

  return {
    screenToWorld,
    handleCanvasMouseMove,
    handleCanvasMouseDown,
    handleCanvasMouseUp,
    handleCanvasClick,
    handleEraseAt,
    handleCanvasDragOver,
    handleCanvasDrop
  };
};
