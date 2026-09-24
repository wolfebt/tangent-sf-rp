/**
 * @file useMapIngestion.ts
 * @description Hook managing synchronization of the active Campaign Map into engine components:
 * - BVH spatial acceleration tree for walls and dynamic bulkheads
 * - InteractiveObjectManager for terminals, loot caches, and consoles
 * - VolatileSharder / engineStore for operative and NPC static entities
 * - LightSourceManager for dynamic illumination
 * - Blueprint underlays and atmospheric weather states
 */

import { useEffect } from 'react';
import { 
  useEngineStore, 
  type StaticEntity, 
  GridType, 
  BVHBuilder, 
  type WallSegment,
  InteractiveObjectManager,
  type SceneInteractiveObject
} from '../../../engine/index';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { 
  LightSourceManager, 
  type SceneLightSource, 
  type AtmosphericWeatherType 
} from '../../../engine/vision/LightSourceManager';

export interface UseMapIngestionOptions {
  currentMap: any;
  bvhBuilderRef: React.MutableRefObject<BVHBuilder>;
  interactiveObjMgrRef: React.MutableRefObject<InteractiveObjectManager>;
  lightSourceMgrRef: React.MutableRefObject<LightSourceManager>;
  setCombatLog: React.Dispatch<React.SetStateAction<string[]>>;
  setLocalWalls: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  setLocalObjects: React.Dispatch<React.SetStateAction<SceneInteractiveObject[]>>;
  setLocalLights: React.Dispatch<React.SetStateAction<SceneLightSource[]>>;
  setSelectedTokenId: (id: string | null) => void;
  setTargetTokenId: (id: string | null) => void;
  setUnderlayConfig: React.Dispatch<React.SetStateAction<{
    url: string;
    opacity: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    visible: boolean;
  } | null>>;
  setAtmosphericWeather: React.Dispatch<React.SetStateAction<AtmosphericWeatherType>>;
}

export function useMapIngestion({
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
  setAtmosphericWeather,
}: UseMapIngestionOptions): void {
  useEffect(() => {
    const store = useEngineStore.getState();

    if (currentMap) {
      setCombatLog(prev => [
        `[MAP SYNC] Synchronized with Campaign Map: "${currentMap.title || currentMap.name || 'Tactical Sector'}" [${currentMap.type || 'Sector'}].`,
        ...prev.slice(0, 8)
      ]);

      // Sync Grid Type from Map (defaulting to hex if undefined or 'hex')
      const targetGridType = (currentMap.gridType === 'square' || currentMap.gridMode === 'square')
        ? GridType.Square
        : GridType.HexFlatTop;
      useUILayoutStore.getState().setGridType(targetGridType);

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
        bvhBuilderRef.current.build([]);
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
        interactiveObjMgrRef.current.loadObjects([]);
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
      } else {
        store.clearAllEntities();
        setSelectedTokenId(null);
        setTargetTokenId(null);
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
      } else {
        setUnderlayConfig(null);
      }

      // 6. Ingest Global Atmospheric Weather
      if (currentMap.atmosphericWeather) {
        setAtmosphericWeather(currentMap.atmosphericWeather);
      } else {
        setAtmosphericWeather('clear');
      }
    } else {
      // Blank canvas state when no map is loaded
      bvhBuilderRef.current.build([]);
      setLocalWalls([]);
      interactiveObjMgrRef.current.loadObjects([]);
      setLocalObjects([]);
      store.clearAllEntities();
      setSelectedTokenId(null);
      setTargetTokenId(null);
      setLocalLights([]);
      setUnderlayConfig(null);
      setAtmosphericWeather('clear');
      useUILayoutStore.getState().setGridType(GridType.HexFlatTop);
    }
  }, [
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
  ]);
}
