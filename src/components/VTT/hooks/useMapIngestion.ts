/**
 * @file useMapIngestion.ts
 * @description Hook managing synchronization of the active Campaign Map into engine components:
 * - BVH spatial acceleration tree for walls and dynamic bulkheads
 * - InteractiveObjectManager for terminals, loot caches, and consoles
 * - VolatileSharder / engineStore for operative and NPC static entities
 * - LightSourceManager for dynamic illumination
 * - Blueprint underlays and atmospheric weather states
 */

import { useEffect, useRef } from 'react';
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
  setAtmosphericWeather: _setAtmosphericWeather,
}: UseMapIngestionOptions): void {
  const lastMapIdRef = useRef<string | null>(null);
  const lastMapTokenCoordsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const store = useEngineStore.getState();

    if (currentMap) {
      const isMapSwitch = currentMap.id !== lastMapIdRef.current;

      if (isMapSwitch) {
        setCombatLog(prev => [
          `[MAP SYNC] Synchronized with Campaign Map: "${currentMap.title || currentMap.name || 'Tactical Sector'}" [${currentMap.type || 'Sector'}].`,
          ...prev.slice(0, 8)
        ]);
      }

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
          isDynamic: Boolean(
            w.isDynamic ||
            w.isDoor ||
            w.type === 'door' ||
            w.wallType?.includes('door') ||
            w.wallType?.includes('bulkhead')
          ),
          isOpen: Boolean(
            w.isOpen ||
            w.doorState === 'open' ||
            w.doorState === 'breached' ||
            (w.breachHp !== undefined && Number(w.breachHp) <= 0)
          ),
          isTransparent: Boolean(w.isTransparent || w.type === 'window' || w.wallType?.includes('window') || w.wallType?.includes('glass'))
        }));
        bvhBuilderRef.current.build(bvhWalls);
        setLocalWalls(bvhWalls);
      } else {
        bvhBuilderRef.current.build([]);
        setLocalWalls([]);
      }

      // 2. Ingest Interactive Map Objects preserving full trap/lock/mechanical metadata
      if (Array.isArray(currentMap.objects) && currentMap.objects.length > 0) {
        const sceneObjects: SceneInteractiveObject[] = currentMap.objects.map((obj: any) => ({
          ...obj,
          id: obj.id,
          name: obj.name || obj.label || obj.type || 'Object',
          type: (obj.type || 'terminal') as any,
          x: obj.x ?? 100,
          y: obj.y ?? 100,
          storyElementId: obj.storyElementId || obj.id
        }));
        interactiveObjMgrRef.current.loadObjects(sceneObjects);
        setLocalObjects(sceneObjects);
      } else {
        interactiveObjMgrRef.current.loadObjects([]);
        setLocalObjects([]);
      }

      // 3. Ingest Map Tokens (purge stale tokens on map switch; preserve live ephemeral vitals on same-map edits)
      const mapTokens = Array.isArray(currentMap.tokens) ? currentMap.tokens : [];
      if (isMapSwitch) {
        store.clearAllEntities();
        lastMapTokenCoordsRef.current.clear();
        lastMapIdRef.current = currentMap.id;
      }

      if (mapTokens.length > 0) {
        const staticBatch: StaticEntity[] = mapTokens.map((t: any) => ({
          ...t,
          id: t.id,
          unit_id: t.unit_id || t.id,
          source_persona_id: t.source_persona_id || t.character_doc_id || t.id,
          character_doc_id: t.character_doc_id || t.source_persona_id || t.id,
          name: t.name || t.label || 'Operator',
          base_hp: t.base_hp || t.hp_max || t.hp?.max || 30,
          base_health: t.base_health || t.hp_max || t.base_hp || 30,
          base_vitality: t.base_vitality || t.vit_max || 30,
          base_structure: t.base_structure || t.struct_max || 60,
          tech_level: t.tech_level || 3,
          armor_dr: t.armor_dr ?? t.dr ?? 0,
          stamina_dr: t.stamina_dr ?? t.toughness ?? 0,
          defense_dc: t.defense_dc ?? t.defense ?? 15,
          attack_bonus: t.attack_bonus ?? 3,
          actions_per_round: t.actions_per_round ?? t.actionPoints ?? 1,
          size_modifier: t.size_modifier || 0,
          speed_ft: t.speed_ft || 30,
          species: t.species || 'Human',
          archetype: t.archetype || 'Operator',
          is_persona: t.is_persona !== false
        }));

        if (!isMapSwitch) {
          const mapTokenIds = new Set(mapTokens.map((t: any) => t.id));
          Object.keys(store.staticData).forEach((existingId) => {
            if (!mapTokenIds.has(existingId) && !existingId.startsWith('comp_tok_')) {
              store.removeEntity(existingId);
              lastMapTokenCoordsRef.current.delete(existingId);
            }
          });
        }

        store.loadStaticEntitiesBatch(staticBatch);

        const nextCoordMap = new Map<string, { x: number; y: number }>();
        mapTokens.forEach((t: any) => {
          const tx = t.x ?? 140;
          const ty = t.y ?? 140;
          nextCoordMap.set(t.id, { x: tx, y: ty });
          const prevCoords = lastMapTokenCoordsRef.current.get(t.id);
          const hasEphemeral = Boolean(useEngineStore.getState().ephemeralData[t.id]);
          if (isMapSwitch || !hasEphemeral || !prevCoords || prevCoords.x !== tx || prevCoords.y !== ty) {
            store.updatePosition(t.id, tx, ty);
          }
        });
        lastMapTokenCoordsRef.current = nextCoordMap;

        if (isMapSwitch) {
          if (mapTokens[0]?.id) {
            setSelectedTokenId(mapTokens[0].id);
            const postStore = useEngineStore.getState();
            postStore.clearSelection();
            postStore.setSelection(mapTokens[0].id, true);
          }
          if (mapTokens[1]?.id) {
            setTargetTokenId(mapTokens[1].id);
          } else {
            setTargetTokenId(null);
          }
        }
      } else {
        if (!isMapSwitch) {
          store.clearAllEntities();
        }
        lastMapTokenCoordsRef.current.clear();
        setSelectedTokenId(null);
        setTargetTokenId(null);
      }

      // 4. Ingest Dynamic Lights into LightSourceManager & local state (always purge prior map lights)
      lightSourceMgrRef.current.clearLights();
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
    } else {
      // Blank canvas state when no map is loaded
      lastMapIdRef.current = null;
      lastMapTokenCoordsRef.current.clear();
      bvhBuilderRef.current.build([]);
      setLocalWalls([]);
      interactiveObjMgrRef.current.loadObjects([]);
      setLocalObjects([]);
      store.clearAllEntities();
      lightSourceMgrRef.current.clearLights();
      setSelectedTokenId(null);
      setTargetTokenId(null);
      setLocalLights([]);
      setUnderlayConfig(null);
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
    _setAtmosphericWeather
  ]);
}
