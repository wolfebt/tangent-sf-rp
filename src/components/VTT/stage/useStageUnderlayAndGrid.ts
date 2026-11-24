import React, { useCallback, useEffect } from 'react';
import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import {
  CoordinateEngine,
  GridScaleTier,
  GridType
} from '../../../engine/math/CoordinateEngine.ts';
import { FrustumChunkManager } from '../../../engine/canvas/FrustumChunkManager.ts';
import { LayerCompositor, ZLayer } from '../../../engine/canvas/LayerCompositor.ts';
import { RendererContext } from '../../../engine/canvas/RendererContext.ts';
import { selectAllFusedTokens, useEngineStore, type FusedToken } from '../../../engine/state/VolatileSharder.ts';
import type { SceneInteractiveObject } from '../../../engine/assets/FoundryIngestion.ts';
import type { WallSegment } from '../../../engine/vision/BVHBuilder.ts';
import { HazardParticleSimulator, type HazardField } from '../../../engine/physics/HazardParticleSimulator.ts';
import { LightSourceManager, resolveAtmosphericPreset } from '../../../engine/vision/LightSourceManager';
import { MapGraphicsCompiler } from '../../../engine/compilers/MapGraphicsCompiler';
import { clearPixiContainer } from '../utils/pixiCleanup';
import { VttEventBus } from '../../../utils/vttEventBus';

export interface UseStageUnderlayAndGridParams {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  rendererContextRef: React.MutableRefObject<RendererContext | null>;
  layerCompositorRef: React.MutableRefObject<LayerCompositor | null>;
  chunkManagerRef: React.MutableRefObject<FrustumChunkManager | null>;
  coordEngineRef: React.MutableRefObject<CoordinateEngine>;
  hazardSimulatorRef: React.MutableRefObject<HazardParticleSimulator | null>;
  lightSourceMgrRef: React.MutableRefObject<LightSourceManager>;
  remoteCursorsContainerRef: React.MutableRefObject<Container | null>;
  terrainsContainerRef: React.MutableRefObject<Container | null>;
  linesContainerRef: React.MutableRefObject<Container | null>;
  textsContainerRef: React.MutableRefObject<Container | null>;
  wallPreviewContainerRef: React.MutableRefObject<Container | null>;
  pingsContainerRef: React.MutableRefObject<Container | null>;
  transformGizmoContainerRef: React.MutableRefObject<Container | null>;
  lightsContainerRef: React.MutableRefObject<Container | null>;
  atmosphereOverlayRef: React.MutableRefObject<Container | null>;
  sensorOverlayRef: React.MutableRefObject<Container | null>;
  aoeContainerRef: React.MutableRefObject<Container | null>;
  underlayContainerRef: React.MutableRefObject<Container | null>;
  waypointsContainerRef: React.MutableRefObject<Container | null>;
  isDynamicLightingRef: React.MutableRefObject<boolean>;
  atmosphericWeatherRef: React.MutableRefObject<any>;
  currentMapRef: React.MutableRefObject<any>;
  viewportTransformRef: React.MutableRefObject<{ zoom: number; pan: { x: number; y: number } }>;
  mouseWorldPosRef: React.MutableRefObject<{ x: number; y: number }>;
  isCanvasReady: boolean;
  canvasGeneration: number;
  setCanvasGeneration: React.Dispatch<React.SetStateAction<number>>;
  gridOverlayContainer: Container | null;
  setGridOverlayContainer: React.Dispatch<React.SetStateAction<Container | null>>;
  moveRulerContainer: Container | null;
  setMoveRulerContainer: React.Dispatch<React.SetStateAction<Container | null>>;
  currentMap: any;
  underlayConfig: {
    url: string;
    opacity: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    visible: boolean;
  } | null;
  isGridVisible: boolean;
  gridType: GridType;
  scaleTier: GridScaleTier;
  zoom: number;
  pan: { x: number; y: number };
  selectedAssetIds: string[];
  isMarqueeActive: boolean;
  marqueeStart: { x: number; y: number } | null;
  marqueeCurrent: { x: number; y: number } | null;
  localObjects: SceneInteractiveObject[];
  tokens: FusedToken[];
  localWalls: WallSegment[];
  selectedToken: FusedToken | null;
  isMoveModeActive: boolean;
  effectiveSpeedFt: number;
  activeDesignTool: string;
  storeRulerPace: any;
  setCombatLog: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * Manages PixiJS WebGPU/WebGL Stage initialization, device-loss recovery, PNG snapshot export,
 * transform gizmo/marquee rendering, background mat & blueprint underlays, pan/zoom sync, grid overlay, and movement ruler.
 */
export const useStageUnderlayAndGrid = ({
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
}: UseStageUnderlayAndGridParams) => {
  // ── Render Transform Gizmo & Marquee Selection on ForegroundUI ──
  useEffect(() => {
    const container = transformGizmoContainerRef.current;
    if (!container) return;
    clearPixiContainer(container);

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

        const handles: Array<[number, number]> = [
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
  }, [isCanvasReady, canvasGeneration, selectedAssetIds, isMarqueeActive, marqueeStart, marqueeCurrent, localObjects, tokens, localWalls]);

  // ── Render Tactical Canvas Mat Plate & Background Blueprint Underlay ──
  useEffect(() => {
    if (!isCanvasReady) return;
    const container = underlayContainerRef.current;
    if (!container) return;
    clearPixiContainer(container);

    const mapWidth = currentMap?.width || 2800;
    const mapHeight = currentMap?.height || 2100;
    const hasVideoBackdrop = Boolean(currentMap?.videoBackgroundUrl || (underlayConfig as any)?.isVideo);

    // 1. Tactical Canvas Mat Plate (transparent center when looping video backdrop plays underneath)
    const matGraphics = new Graphics();
    matGraphics.roundRect(0, 0, mapWidth, mapHeight, 10);
    if (!hasVideoBackdrop) {
      matGraphics.fill({ color: 0x090d16, alpha: 0.98 });
    }
    matGraphics.stroke({ width: 3, color: 0x1e293b, alpha: 0.95 });

    // Inner glowing coordinate perimeter line
    matGraphics.roundRect(4, 4, mapWidth - 8, mapHeight - 8, 8);
    matGraphics.stroke({ width: 1, color: 0x00ffff, alpha: 0.15 });

    // Center Origin Crosshair
    const cx = Math.round(mapWidth / 2);
    const cy = Math.round(mapHeight / 2);
    matGraphics.moveTo(cx - 30, cy);
    matGraphics.lineTo(cx + 30, cy);
    matGraphics.moveTo(cx, cy - 30);
    matGraphics.lineTo(cx, cy + 30);
    matGraphics.stroke({ width: 1.5, color: 0x22d3ee, alpha: 0.3 });
    matGraphics.circle(cx, cy, 20);
    matGraphics.stroke({ width: 1, color: 0x22d3ee, alpha: 0.2 });

    container.addChild(matGraphics);

    // 2. Sector Title Watermark
    try {
      const title = (currentMap?.title || currentMap?.name || 'TACTICAL STAGE SECTOR').toUpperCase();
      const watermark = new Text({
        text: `${title} // ${mapWidth}x${mapHeight}px`,
        style: new TextStyle({
          fontFamily: 'monospace',
          fontSize: 12,
          fill: 0x334155,
          fontWeight: 'bold',
          letterSpacing: 2
        })
      });
      watermark.x = 24;
      watermark.y = 18;
      container.addChild(watermark);
    } catch {
      // Ignored
    }

    // 3. Render Background Image (skip video URLs handled by underlying <video> element)
    const bgUrl = underlayConfig?.url || currentMap?.background_url;
    const isVideoUrl =
      typeof bgUrl === 'string' &&
      (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(bgUrl) || bgUrl.startsWith('data:video/') || bgUrl.includes('/ade/video_maps/'));
    let isCancelled = false;
    if (bgUrl && !isVideoUrl && (underlayConfig?.visible !== false)) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = bgUrl;
      img.onload = () => {
        if (isCancelled || !underlayContainerRef.current) return;
        try {
          const sprite = Sprite.from(img);
          sprite.x = underlayConfig?.offsetX || 0;
          sprite.y = underlayConfig?.offsetY || 0;
          sprite.scale.set(underlayConfig?.scale || 1.0);
          sprite.alpha = underlayConfig?.opacity ?? 0.85;
          underlayContainerRef.current.addChild(sprite);
        } catch (err) {
          console.warn('Failed to render underlay sprite:', err);
        }
      };
    }
    return () => {
      isCancelled = true;
    };
  }, [
    isCanvasReady,
    canvasGeneration,
    currentMap?.id,
    currentMap?.background_url,
    currentMap?.videoBackgroundUrl,
    currentMap?.width,
    currentMap?.height,
    currentMap?.title,
    currentMap?.name,
    underlayConfig
  ]);

  // ── Initialize PixiJS WebGPU Canvas & Compositor ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isCancelled = false;
    let localRenderer: RendererContext | null = null;
    let activeTickerApp: any = null;
    let activeTickerFn: ((ticker: any) => void) | null = null;

    const teardownStageScene = (preserveHazards: boolean): HazardField[] => {
      const savedHazards = preserveHazards && hazardSimulatorRef.current
        ? hazardSimulatorRef.current.getActiveHazards().map(h => ({ ...h }))
        : [];

      if (activeTickerApp?.ticker && activeTickerFn) {
        try {
          activeTickerApp.ticker.remove(activeTickerFn);
        } catch {
          // App or ticker may already be destroyed on device loss
        }
      }
      activeTickerApp = null;
      activeTickerFn = null;

      hazardSimulatorRef.current?.destroy();
      hazardSimulatorRef.current = null;
      layerCompositorRef.current?.destroy?.();
      layerCompositorRef.current = null;

      underlayContainerRef.current = null;
      terrainsContainerRef.current = null;
      linesContainerRef.current = null;
      wallPreviewContainerRef.current = null;
      pingsContainerRef.current = null;
      lightsContainerRef.current = null;
      atmosphereOverlayRef.current = null;
      sensorOverlayRef.current = null;
      aoeContainerRef.current = null;
      textsContainerRef.current = null;
      transformGizmoContainerRef.current = null;
      waypointsContainerRef.current = null;
      remoteCursorsContainerRef.current = null;
      setGridOverlayContainer(null);
      setMoveRulerContainer(null);

      return savedHazards;
    };

    const mountStageScene = (renderer: RendererContext, restoredHazards: HazardField[] = []) => {
      const app = renderer.getApp();
      if (!app || !app.stage) return;

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

      // 8b. Multi-Spectrum Sensor Vision Overlay (ZLayer.DynamicFX)
      const sensorContainer = new Container();
      sensorContainer.label = 'SensorVisionOverlay';
      compositor.addToLayer(sensorContainer, ZLayer.DynamicFX);
      sensorOverlayRef.current = sensorContainer;

      // 8c. Measured AoE Template Overlay (ZLayer.DynamicFX)
      const aoeContainer = new Container();
      aoeContainer.label = 'MeasuredAoEOverlay';
      compositor.addToLayer(aoeContainer, ZLayer.DynamicFX);
      aoeContainerRef.current = aoeContainer;

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

      // 11. Spatial Waypoints & Tactical Route Container (ZLayer.UnderlayDebris)
      const waypointsContainer = new Container();
      waypointsContainer.label = 'WaypointsLayer';
      compositor.addToLayer(waypointsContainer, ZLayer.UnderlayDebris);
      waypointsContainerRef.current = waypointsContainer;

      // Initialize Hazard Particle Simulator & Dynamic Lighting on Stage
      const fxLayer = compositor.getLayer(ZLayer.DynamicFX);
      const lightLayer = compositor.getLayer(ZLayer.LightingDarkness);
      const foregroundLayer = compositor.getLayer(ZLayer.ForegroundUI);

      if (fxLayer && lightLayer) {
        const hazardSim = new HazardParticleSimulator(fxLayer, lightLayer);
        hazardSim.initializeCompute(renderer.getGPUDevice());
        hazardSim.setDynamicLighting(isDynamicLightingRef.current);
        const preset = resolveAtmosphericPreset(atmosphericWeatherRef.current);
        hazardSim.setAmbientDarkness(Math.max(0, Math.min(0.85, 1 - preset.ambientIntensity)));
        restoredHazards.forEach(h => hazardSim.addHazardField(h));
        hazardSimulatorRef.current = hazardSim;
      }

      // Create Remote Cursors Container for LiveKit Telemetry
      if (foregroundLayer) {
        const cursorsContainer = new Container();
        cursorsContainer.label = 'RemoteCursors';
        foregroundLayer.addChild(cursorsContainer);
        remoteCursorsContainerRef.current = cursorsContainer;
      }

      // Restore pan & zoom immediately on the new Stage
      const { zoom: savedZoom, pan: savedPan } = viewportTransformRef.current;
      app.stage.scale.set(savedZoom);
      app.stage.position.set(savedPan.x, savedPan.y);

      // PixiJS Ticker Animation Loop for Particle Fields & Dynamic Lighting
      if (app?.ticker) {
        const tick = (ticker: any) => {
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
        };
        app.ticker.add(tick);
        activeTickerApp = app;
        activeTickerFn = tick;
      }

      setCanvasGeneration(g => g + 1);
    };

    const handleRendererRebuilt = (e: Event) => {
      if (isCancelled || !localRenderer) return;
      const detail = (e as CustomEvent)?.detail;
      if (detail?.rendererContext && detail.rendererContext !== localRenderer) return;
      if (!localRenderer.getIsInitialized()) return;
      const savedHazards = teardownStageScene(true);
      mountStageScene(localRenderer, savedHazards);
      setCombatLog(prev => [
        '[STAGE RECOVERY] Rebuilt WebGPU/WebGL graphics pipeline and restored active Stage layers.',
        ...prev.slice(0, 8)
      ]);
    };

    const handleExportStagePng = async () => {
      const mapSnap = currentMapRef.current;
      const slug = String(mapSnap?.title || mapSnap?.name || 'tactical_stage')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      const filename = `${slug || 'tactical_stage'}.png`;

      let exportedDataUrl = '';
      const activeApp = localRenderer?.getApp();
      if (activeApp?.stage && (activeApp.renderer as any)?.extract?.base64) {
        try {
          exportedDataUrl = await (activeApp.renderer as any).extract.base64(activeApp.stage);
        } catch {
          // Fall back below
        }
      }
      if (!exportedDataUrl && canvasRef.current) {
        try {
          exportedDataUrl = canvasRef.current.toDataURL('image/png');
        } catch {
          // Fall back below
        }
      }
      if (!exportedDataUrl && mapSnap) {
        try {
          exportedDataUrl = await MapGraphicsCompiler.compileToDataUrlAsync({
            widthCells: Math.max(10, Math.round((mapSnap.width || 1500) / (mapSnap.gridSize || 50))),
            heightCells: Math.max(10, Math.round((mapSnap.height || 1000) / (mapSnap.gridSize || 50))),
            pixelsPerGrid: mapSnap.gridSize || 50,
            sourceGridSize: mapSnap.gridSize || 50,
            terrains: mapSnap.terrains || [],
            underlays: mapSnap.underlay ? [mapSnap.underlay] : [],
            lines: mapSnap.lines || [],
            objects: mapSnap.objects || [],
            walls: mapSnap.walls || [],
            lights: mapSnap.lights || [],
            tokens: mapSnap.tokens || [],
            texts: mapSnap.texts || [],
            gridMode: mapSnap.gridMode
          });
        } catch {
          // Ignore failure
        }
      }

      if (exportedDataUrl) {
        const a = document.createElement('a');
        a.href = exportedDataUrl;
        a.download = filename;
        a.click();
        setCombatLog(prev => [
          `[EXPORT] Downloaded Stage snapshot "${filename}".`,
          ...prev.slice(0, 8)
        ]);
      }
    };

    window.addEventListener('stage-renderer-rebuilt', handleRendererRebuilt);
    const offExportStagePng = VttEventBus.on('export-stage-png', handleExportStagePng);

    const initRenderer = async () => {
      // If a previous renderer instance is still active/initializing, await its full teardown first
      if (rendererContextRef.current) {
        try {
          await rendererContextRef.current.destroy();
        } catch {
          // Ignored
        }
        rendererContextRef.current = null;
      }

      if (isCancelled) return;

      const renderer = new RendererContext();
      localRenderer = renderer;
      rendererContextRef.current = renderer;

      await renderer.initialize(canvas);

      if (isCancelled) {
        teardownStageScene(false);
        await renderer.destroy();
        if (rendererContextRef.current === renderer) {
          rendererContextRef.current = null;
        }
        return;
      }

      mountStageScene(renderer, []);
    };

    initRenderer();

    return () => {
      isCancelled = true;
      window.removeEventListener('stage-renderer-rebuilt', handleRendererRebuilt);
      offExportStagePng();
      setCanvasGeneration(0);
      teardownStageScene(false);
      if (localRenderer) {
        localRenderer.destroy().then(() => {
          if (rendererContextRef.current === localRenderer) {
            rendererContextRef.current = null;
          }
        });
      }
    };
  }, []);

  // Sync PixiJS Stage Pan & Zoom
  useEffect(() => {
    if (!isCanvasReady) return;
    const renderer = rendererContextRef.current;
    if (!renderer) return;
    const app = renderer.getApp();
    if (!app || !app.stage) return;

    app.stage.scale.set(zoom);
    app.stage.position.set(pan.x, pan.y);
  }, [isCanvasReady, canvasGeneration, zoom, pan]);

  // Draw Grid Overlay when Scale Tier / Grid Type / Visibility changes
  const redrawGrid = useCallback(() => {
    if (!gridOverlayContainer || !layerCompositorRef.current) return;

    clearPixiContainer(gridOverlayContainer);
    if (!isGridVisible) return;

    const engine = coordEngineRef.current;
    const cellSize = engine.getCellSizePx();
    const graphics = new Graphics();

    const width = currentMap?.width || 2800;
    const height = currentMap?.height || 2100;

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

    graphics.stroke({ width: 1, color: 0x00ffff, alpha: 0.15 });
    gridOverlayContainer.addChild(graphics);
  }, [gridOverlayContainer, isGridVisible, gridType, currentMap?.width, currentMap?.height]);

  useEffect(() => {
    coordEngineRef.current.setScaleTier(scaleTier);
    coordEngineRef.current.setGridType(gridType);
    coordEngineRef.current.setCellSizePx(currentMap?.gridSize || 50);
    if (isCanvasReady) {
      redrawGrid();
    }
  }, [isCanvasReady, canvasGeneration, redrawGrid, scaleTier, gridType, currentMap?.gridSize]);

  // Redraw Movement Distance Range & Waypoint Ruler without triggering React state re-renders per pointer pixel
  const redrawMoveRuler = useCallback(() => {
    if (!moveRulerContainer || !selectedToken) return;

    clearPixiContainer(moveRulerContainer);

    const g = new Graphics();
    const cellSizePx = coordEngineRef.current.getCellSizePx();
    const speedRadiusPx = (effectiveSpeedFt / 5) * cellSizePx;
    const sprintRadiusPx = speedRadiusPx * 2;
    const pointerPos = mouseWorldPosRef.current;

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
      const dx = pointerPos.x - selectedToken.x;
      const dy = pointerPos.y - selectedToken.y;
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
        const midX = (selectedToken.x + pointerPos.x) / 2;
        const midY = (selectedToken.y + pointerPos.y) / 2;
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
      g.lineTo(pointerPos.x, pointerPos.y);
      g.stroke({ width: 2.5, color: vectorColor, alpha: 0.9 });

      // Target waypoint marker
      g.circle(pointerPos.x, pointerPos.y, 6);
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
      distLabel.x = (selectedToken.x + pointerPos.x) / 2;
      distLabel.y = (selectedToken.y + pointerPos.y) / 2 - 14;
      distLabel.anchor.set(0.5, 0.5);
      moveRulerContainer.addChild(distLabel);
    } else {
      moveRulerContainer.addChild(g);
    }
  }, [moveRulerContainer, selectedToken, isMoveModeActive, effectiveSpeedFt, activeDesignTool, storeRulerPace]);

  useEffect(() => {
    redrawMoveRuler();
  }, [redrawMoveRuler]);

  return {
    redrawGrid,
    redrawMoveRuler
  };
};
