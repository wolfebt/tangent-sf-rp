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
import { ZLayer, type LayerCompositor, type WallSegment, type FusedToken, useEngineStore } from '../../../engine/index';
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
  onUpdateMap,
  onSwitchMap
}: UseStageFogAndRegionsOptions) {
  const fogManagerRef = useRef<FogOfWarManager>(new FogOfWarManager());
  const fogGraphicsRef = useRef<Graphics | null>(null);
  const prevPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isArchitectFogPreview, setIsArchitectFogPreview] = useState<boolean>(true);
  const [fogRevision, setFogRevision] = useState<number>(0);

  const mapId = String(currentMap?.id || '');
  const mapWidth = Number(currentMap?.width || 2800);
  const mapHeight = Number(currentMap?.height || 2100);

  // 1. Hydrate FogOfWarManager when map changes
  useEffect(() => {
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
        const snapshot: ExploredFogSnapshot = {
          mapId: payload.mapId,
          exploredPolygons: payload.exploredAreas,
          hiddenPolygons: [],
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
        getVttMultiplayerSync().broadcastFogExplored(targetMapId, snap.exploredPolygons, isFogEnabled);
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
      isArchitectFogPreview
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
    isArchitectFogPreview,
    fogRevision,
    layerCompositorRef,
    schedulePersistFog
  ]);

  // 4. Evaluate Scene Regions on Token Movement + Roof Hole Cutouts
  useEffect(() => {
    const regions: SceneRegion[] = Array.isArray(currentMap?.regions) ? currentMap.regions : [];
    const compositor = layerCompositorRef.current;
    let roofHolePunched = false;

    for (const tok of tokens) {
      const prev = prevPositionsRef.current.get(tok.id);
      const curr = { x: tok.x, y: tok.y };

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
              useEngineStore.getState().updatePosition(
                tok.id,
                Number(evt.region.payload.targetX),
                Number(evt.region.payload.targetY ?? curr.y),
                Number(evt.region.payload.targetElevationFt ?? tok.z ?? 0)
              );
            } else if (evt.region.triggerType === 'switch_map' && evt.region.payload?.targetMapId) {
              onSwitchMap?.(String(evt.region.payload.targetMapId));
            }
          } else if (evt.event === 'exit' && evt.region.triggerType === 'roof_zone') {
            compositor?.resetRoofMask();
          }
        }
      } else if (tok.id === selectedToken?.id && !roofHolePunched) {
        const insideRoof = regions.find(
          (r) => r.triggerType === 'roof_zone' &&
            curr.x >= r.bounds.x &&
            curr.x <= r.bounds.x + r.bounds.width &&
            curr.y >= r.bounds.y &&
            curr.y <= r.bounds.y + r.bounds.height
        );
        if (insideRoof) {
          compositor?.punchRoofHole(curr.x, curr.y, Number(insideRoof.payload?.radiusPx || 110));
          roofHolePunched = true;
        }
      }

      prevPositionsRef.current.set(tok.id, curr);
    }
  }, [tokens, currentMap?.regions, selectedToken?.id, layerCompositorRef, onSwitchMap]);

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
    isArchitectFogPreview,
    setIsArchitectFogPreview,
    revealAllFog,
    resetFog
  };
}
