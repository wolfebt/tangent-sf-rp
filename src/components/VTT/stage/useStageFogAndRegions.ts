/**
 * @file useStageFogAndRegions.ts
 * @description React hook integrating FogOfWarManager (3-tier persistent shroud + Vision raycasting)
 *   and SceneRegionManager (deck teleports, map transitions, story flags, audio cues, roof cutouts)
 *   with StageView Pixi layers and multiplayer CRDT synchronization.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Graphics, Container } from 'pixi.js';
import {
  FogOfWarManager,
  type ExploredFogSnapshot,
  type FogPolygon
} from '../../../engine/vision/FogOfWarManager';
import {
  evaluateTokenRegions,
  type SceneRegion
} from '../../../engine/cartography/SceneRegionManager';
import { ZLayer, type LayerCompositor } from '../../../engine/canvas/LayerCompositor';
import type { WallSegment } from '../../../engine/vision/BVHBuilder';
import { useEngineStore, type FusedToken } from '../../../engine/state/VolatileSharder';
import { computeVisibilityPolygon } from '../../../services/raycastVisionService.js';
import { expandWallsForGeometry } from '../../../schemas/vttWallSchema.js';
import { VttEventBus } from '../../../utils/vttEventBus';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { useAdeStore } from '../../../pages/Foundry/store/adeStore';
import { proAudioMixerService } from '../../../services/proAudioMixerService';

export interface UseStageFogAndRegionsOptions {
  layerCompositorRef: React.MutableRefObject<LayerCompositor | null>;
  isCanvasReady: boolean;
  canvasGeneration: number;
  currentMap: any;
  localWalls: WallSegment[];
  tokens: FusedToken[];
  selectedToken: FusedToken | null;
  activeSensorMode: string;
  isFogEnabled?: boolean;
  userRole?: string;
  isArchitect?: boolean;
  onUpdateMap?: (mapId: string, updates: any) => void;
  onSwitchMap?: (mapId: string) => void;
}

export function useStageFogAndRegions({
  layerCompositorRef,
  isCanvasReady,
  canvasGeneration,
  currentMap,
  localWalls,
  tokens,
  selectedToken,
  activeSensorMode,
  isFogEnabled = false,
  userRole,
  isArchitect,
  onUpdateMap,
  onSwitchMap
}: UseStageFogAndRegionsOptions) {
  const effectiveIsArchitect =
    typeof isArchitect === 'boolean'
      ? isArchitect
      : (userRole ? !['operative', 'player', 'spectator'].includes(userRole.toLowerCase()) : true);

  const fogManagerRef = useRef<FogOfWarManager>(new FogOfWarManager());
  const fogGraphicsRef = useRef<Graphics | null>(null);
  const prevPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isArchitectFogPreview, setIsArchitectFogPreviewState] = useState<boolean>(effectiveIsArchitect);
  const [fogRevision, setFogRevision] = useState<number>(0);

  useEffect(() => {
    if (!effectiveIsArchitect) {
      setIsArchitectFogPreviewState(false);
    }
  }, [effectiveIsArchitect]);

  const setIsArchitectFogPreview = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (!effectiveIsArchitect) {
        setIsArchitectFogPreviewState(false);
        return;
      }
      setIsArchitectFogPreviewState(value);
    },
    [effectiveIsArchitect]
  );

  const mapId = String(currentMap?.id || '');
  const gridSize = Number(currentMap?.gridSize || 50);
  const rawWidth = Number(currentMap?.width || 2800);
  const rawHeight = Number(currentMap?.height || 2100);
  const mapWidth = rawWidth <= 300 ? rawWidth * gridSize : rawWidth;
  const mapHeight = rawHeight <= 300 ? rawHeight * gridSize : rawHeight;

  // 1. Hydrate FogOfWarManager & clear stale token tracking when map changes
  useEffect(() => {
    prevPositionsRef.current.clear();
    if (!mapId) return;
    if (currentMap?.exploredFog && typeof currentMap.exploredFog === 'object') {
      fogManagerRef.current.hydrate({
        mapId,
        exploredPolygons: currentMap.exploredFog.exploredPolygons || [],
        hiddenPolygons: currentMap.exploredFog.hiddenPolygons || [],
        updatedAt: currentMap.exploredFog.updatedAt || Date.now()
      });
      setFogRevision((r) => r + 1);
    }
  }, [mapId]);

  // 2. Listen to remote multiplayer fog updates
  useEffect(() => {
    const unsub = VttEventBus.on('stage-remote-fog-explored', (payload) => {
      if (!payload?.mapId || payload.mapId !== mapId) return;
      if (Array.isArray(payload.exploredAreas)) {
        const currentHidden = fogManagerRef.current.getState(payload.mapId).hiddenPolygons;
        const snapshot: ExploredFogSnapshot = {
          mapId: payload.mapId,
          exploredPolygons: payload.exploredAreas,
          hiddenPolygons: Array.isArray(payload.hiddenAreas) ? payload.hiddenAreas : currentHidden,
          updatedAt: payload.timestamp || Date.now()
        };
        fogManagerRef.current.hydrate(snapshot);
        setFogRevision((r) => r + 1);
      }
    });
    return unsub;
  }, [mapId]);

  const schedulePersistFog = useCallback(
    (targetMapId: string) => {
      if (!targetMapId) return;
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      persistTimerRef.current = setTimeout(() => {
        const snap = fogManagerRef.current.serialize(targetMapId);
        onUpdateMap?.(targetMapId, { exploredFog: snap });
        getVttMultiplayerSync().broadcastFogExplored(
          targetMapId,
          snap.exploredPolygons,
          isFogEnabled,
          snap.hiddenPolygons
        );
      }, 600);
    },
    [onUpdateMap, isFogEnabled]
  );

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, []);

  // 3. Recompute active raycast visibility polygons & render 3-tier Fog onto ZLayer.FogOfWar
  useEffect(() => {
    const compositor = layerCompositorRef.current;
    if (!isCanvasReady || !compositor || !mapId) return;

    const fogLayer = compositor.getLayer(ZLayer.FogOfWar);
    if (!fogLayer) return;

    let fogContainer = fogLayer.children.find((c: any) => c.label === 'PersistentFogLayer') as Container | undefined;
    if (!fogContainer) {
      fogContainer = new Container();
      fogContainer.label = 'PersistentFogLayer';
      fogLayer.addChild(fogContainer);
    }

    if (!fogGraphicsRef.current || fogGraphicsRef.current.destroyed) {
      fogGraphicsRef.current = new Graphics();
      fogContainer.addChild(fogGraphicsRef.current);
    } else if (!fogContainer.children.includes(fogGraphicsRef.current)) {
      fogContainer.addChild(fogGraphicsRef.current);
    }

    if (!isFogEnabled && !currentMap?.fogEnabled) {
      fogGraphicsRef.current.clear();
      return;
    }

    const observers = tokens.filter((t) => t.is_persona || t.id === selectedToken?.id);
    const expandedWalls = expandWallsForGeometry(localWalls || []);
    const activePolys: FogPolygon[] = [];
    let exploredChanged = false;

    for (const obs of observers) {
      const flatPoly = computeVisibilityPolygon(
        { x: obs.x, y: obs.y },
        expandedWalls,
        {
          maxRadius: Number((obs as any).vision_radius_px || 450),
          bounds: { width: mapWidth, height: mapHeight },
          sensorMode: activeSensorMode || 'standard_optical'
        }
      );
      if (Array.isArray(flatPoly) && flatPoly.length >= 6) {
        const pts: FogPolygon = [];
        for (let i = 0; i + 1 < flatPoly.length; i += 2) {
          pts.push({ x: flatPoly[i], y: flatPoly[i + 1] });
        }
        activePolys.push(pts);
        if (fogManagerRef.current.recordVisionPolygon(mapId, pts)) {
          exploredChanged = true;
        }
      }
    }

    if (exploredChanged) {
      schedulePersistFog(mapId);
    }

    fogManagerRef.current.renderToPixiLayer(
      fogGraphicsRef.current,
      mapWidth,
      mapHeight,
      mapId,
      activePolys,
      effectiveIsArchitect && isArchitectFogPreview
    );
  }, [
    isCanvasReady,
    canvasGeneration,
    mapId,
    mapWidth,
    mapHeight,
    localWalls,
    tokens,
    selectedToken?.id,
    activeSensorMode,
    isFogEnabled,
    currentMap?.fogEnabled,
    effectiveIsArchitect,
    isArchitectFogPreview,
    fogRevision,
    layerCompositorRef,
    schedulePersistFog
  ]);

  // 4. Evaluate Scene Regions on Token Movement + Roof Hole Cutouts
  useEffect(() => {
    const explicitRegions: SceneRegion[] = Array.isArray(currentMap?.regions) ? currentMap.regions : [];
    const hasExplicitRoof = explicitRegions.some((r) => r.triggerType === 'roof_zone');
    const derivedRoofRegions: SceneRegion[] = hasExplicitRoof
      ? []
      : (Array.isArray(currentMap?.terrains) ? currentMap.terrains : [])
          .filter((t: any) => t?.isRoofLayer && Array.isArray(t?.points) && t.points.length >= 2)
          .map((t: any, idx: number) => {
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;
            for (let i = 0; i + 1 < t.points.length; i += 2) {
              const px = Number(t.points[i]);
              const py = Number(t.points[i + 1]);
              if (px < minX) minX = px;
              if (px > maxX) maxX = px;
              if (py < minY) minY = py;
              if (py > maxY) maxY = py;
            }
            return {
              id: `auto_roof_${t.id || idx}`,
              name: t.label || 'Roof Canopy',
              bounds: {
                x: minX,
                y: minY,
                width: Math.max(10, maxX - minX),
                height: Math.max(10, maxY - minY)
              },
              triggerType: 'roof_zone' as const,
              payload: { radiusPx: 110 },
              autoTrigger: true,
              enabled: true
            };
          });
    const regions: SceneRegion[] = [...explicitRegions, ...derivedRoofRegions];
    const compositor = layerCompositorRef.current;
    let roofHolePunched = false;
    let anyTokenInsideRoof = false;

    const isInsideBounds = (pt: { x: number; y: number }, r: SceneRegion) =>
      pt.x >= r.bounds.x &&
      pt.x <= r.bounds.x + r.bounds.width &&
      pt.y >= r.bounds.y &&
      pt.y <= r.bounds.y + r.bounds.height;

    for (const tok of tokens) {
      const prev = prevPositionsRef.current.get(tok.id);
      const curr = { x: tok.x, y: tok.y };

      const insideRoof = regions.find((r) => r.enabled !== false && r.triggerType === 'roof_zone' && isInsideBounds(curr, r));
      if (insideRoof) {
        anyTokenInsideRoof = true;
      }

      if (prev && (prev.x !== curr.x || prev.y !== curr.y) && regions.length > 0) {
        const triggered = evaluateTokenRegions(tok.id, prev, curr, regions);
        for (const evt of triggered) {
          if (evt.event === 'enter') {
            VttEventBus.emit('stage-region-triggered', {
              regionId: evt.region.id,
              regionName: evt.region.name,
              triggerType: evt.region.triggerType,
              tokenId: tok.id,
              payload: evt.region.payload
            });

            if (evt.region.triggerType === 'roof_zone') {
              compositor?.punchRoofHole(curr.x, curr.y, Number(evt.region.payload?.radiusPx || 110));
              roofHolePunched = true;
              anyTokenInsideRoof = true;
            } else if (evt.region.triggerType === 'hazard') {
              const store = useEngineStore.getState();
              const dmg = Number(evt.region.payload?.damage || 0);
              if (dmg > 0) {
                store.applyDamage(tok.id, dmg, Boolean(evt.region.payload?.isLethal));
              }
              if (evt.region.payload?.condition) {
                store.addCondition(tok.id, String(evt.region.payload.condition));
              }
              VttEventBus.emit('stage-hazard-toggled', {
                hazardId: evt.region.id,
                isActive: true,
                hazardType: String(evt.region.payload?.hazardType || evt.region.name || 'hazard')
              });
            } else if (evt.region.triggerType === 'story_flag' && evt.region.payload?.flagKey) {
              useAdeStore
                .getState()
                .setStoryFlag(String(evt.region.payload.flagKey), evt.region.payload.flagValue ?? true);
            } else if (evt.region.triggerType === 'audio_cue' && evt.region.payload?.trackId) {
              void proAudioMixerService.playCue(
                evt.region.payload.bus || 'ambient',
                String(evt.region.payload.trackId),
                true
              );
            } else if (evt.region.triggerType === 'teleport_deck' && evt.region.payload?.targetX !== undefined) {
              const targetX = Number(evt.region.payload.targetX);
              const targetY = Number(evt.region.payload.targetY ?? curr.y);
              const targetElev = Number(evt.region.payload.targetElevationFt ?? tok.z ?? 0);
              useEngineStore.getState().updatePosition(tok.id, targetX, targetY, targetElev);
              getVttMultiplayerSync().broadcastTokenMove(tok.id, targetX, targetY, targetElev);
            } else if (evt.region.triggerType === 'switch_map' && evt.region.payload?.targetMapId) {
              onSwitchMap?.(String(evt.region.payload.targetMapId));
            }
          }
        }
      }

      if (insideRoof && (tok.id === selectedToken?.id || !roofHolePunched)) {
        compositor?.punchRoofHole(curr.x, curr.y, Number(insideRoof.payload?.radiusPx || 110));
        roofHolePunched = true;
      }

      prevPositionsRef.current.set(tok.id, curr);
    }

    if (!anyTokenInsideRoof && regions.some((r) => r.triggerType === 'roof_zone')) {
      compositor?.resetRoofMask();
    }
  }, [tokens, currentMap?.regions, currentMap?.terrains, selectedToken?.id, layerCompositorRef, onSwitchMap]);

  const revealFogRect = useCallback(
    (x: number, y: number, width: number, height: number) => {
      if (!mapId) return;
      const x0 = Math.min(x, x + width);
      const y0 = Math.min(y, y + height);
      const w = Math.max(10, Math.abs(width));
      const h = Math.max(10, Math.abs(height));
      fogManagerRef.current.revealArea(mapId, [
        { x: x0, y: y0 },
        { x: x0 + w, y: y0 },
        { x: x0 + w, y: y0 + h },
        { x: x0, y: y0 + h }
      ]);
      setFogRevision((r) => r + 1);
      schedulePersistFog(mapId);
    },
    [mapId, schedulePersistFog]
  );

  const hideFogRect = useCallback(
    (x: number, y: number, width: number, height: number) => {
      if (!mapId) return;
      const x0 = Math.min(x, x + width);
      const y0 = Math.min(y, y + height);
      const w = Math.max(10, Math.abs(width));
      const h = Math.max(10, Math.abs(height));
      fogManagerRef.current.hideArea(mapId, [
        { x: x0, y: y0 },
        { x: x0 + w, y: y0 },
        { x: x0 + w, y: y0 + h },
        { x: x0, y: y0 + h }
      ]);
      setFogRevision((r) => r + 1);
      schedulePersistFog(mapId);
    },
    [mapId, schedulePersistFog]
  );

  const revealAllFog = useCallback(() => {
    if (!mapId) return;
    fogManagerRef.current.revealArea(mapId, [
      { x: 0, y: 0 },
      { x: mapWidth, y: 0 },
      { x: mapWidth, y: mapHeight },
      { x: 0, y: mapHeight }
    ]);
    setFogRevision((r) => r + 1);
    schedulePersistFog(mapId);
  }, [mapId, mapWidth, mapHeight, schedulePersistFog]);

  const resetFog = useCallback(() => {
    if (!mapId) return;
    fogManagerRef.current.resetExplored(mapId);
    setFogRevision((r) => r + 1);
    schedulePersistFog(mapId);
  }, [mapId, schedulePersistFog]);

  return {
    fogManager: fogManagerRef.current,
    isArchitectFogPreview: effectiveIsArchitect && isArchitectFogPreview,
    setIsArchitectFogPreview,
    revealFogRect,
    hideFogRect,
    revealAllFog,
    resetFog
  };
}
