/**
 * @file MapMakerPixiCanvas.tsx
 * @description PixiJS v8 Interactive MapMaker Cartography Canvas.
 * Replaces legacy Konva <Stage>/<Layer> rendering with GPU-accelerated WebGPU/WebGL PixiJS v8
 * scene graph + LayerCompositor, with automatic Canvas2D fallback in headless/jsdom tests.
 */

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Container } from 'pixi.js';
import { RendererContext } from '../../../../engine/canvas/RendererContext.ts';
import { LayerCompositor, ZLayer } from '../../../../engine/canvas/LayerCompositor.ts';
import {
  renderBackgroundAndGridLayer,
  renderTerrainAndLinesLayer,
  renderObjectsLayer,
  renderWallsLayer,
  renderLightsLayer,
  renderEntitiesLayer,
  renderRoofLayer,
  renderFogLayer,
  renderForegroundOverlayLayer,
  type ActiveDragPayload,
  type LayerRenderCallbacks,
  type LiveDragPreview
} from './mapMakerLayerRenderers.ts';
import { renderMapMakerFallback2D, hitTestMapMakerFallback } from './mapMakerCanvas2DFallback.ts';
import type { Point2D } from './mapMakerPixiHelpers.ts';

export interface MapMakerStageHandle {
  toDataURL: (options?: { pixelRatio?: number }) => string;
  getRelativePointerPosition: (clientX: number, clientY: number) => Point2D;
}

export interface MapMakerPointerPayload {
  clientX: number;
  clientY: number;
  button: number;
  buttons: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  deltaY?: number;
  pointerPos: Point2D;
  worldPos: Point2D;
  clickedOnEmpty?: boolean;
  preventDefault: () => void;
}

export interface MapMakerPixiCanvasProps {
  width: number;
  height: number;
  scale: number;
  position: Point2D;
  currentMap: any;
  gridMode: string;
  gridSize: number;
  terrains: any[];
  lines: any[];
  objects: any[];
  walls: any[];
  lights: any[];
  texts: any[];
  tokens: any[];
  regions: any[];
  fog: any[];
  fogEnabled: boolean;
  visibilityPolygon: number[] | null;
  activePings: any[];
  rulerWaypoints: Point2D[];
  rulerPointer: Point2D | null;
  chunkGhostPreviewData: any;
  chunkCaptureMarquee: any;
  activeTool: string;
  selectedId: string | null;
  wallStartPoint: Point2D | null;
  wallPreviewEnd: Point2D | null;
  computeWallPreviewPoints: (s: Point2D, e: Point2D, isCurved: boolean) => number[];
  selectedWallType: string;
  paintRoofLayer: boolean;
  measurementUnit?: string;
  rulerSelectedPace?: string;
  isStoryReadOnly?: boolean;
  isLayerVisible: (layerId: string) => boolean;
  isLayerLocked: (layerId: string) => boolean;
  onWheel: (payload: MapMakerPointerPayload) => void;
  onPointerDownEmptyOrTool: (payload: MapMakerPointerPayload) => void;
  onPointerMove: (payload: MapMakerPointerPayload) => void;
  onPointerUp: () => void;
  onStagePan: (nextPos: Point2D) => void;
  onSelect: (id: string | null) => void;
  onSelectToken: (id: string) => void;
  onErase: (id: string) => void;
  onToggleDoor: (wallId: string) => void;
  onUpdateWall: (wallId: string, patch: any) => void;
  onUpdateObject: (obj: any) => void;
  onUpdateToken: (token: any) => void;
  onUpdateLight: (lightId: string, x: number, y: number) => void;
  onUpdateText: (txt: any) => void;
  onUpdateRegion: (regionId: string, bounds: any) => void;
  onObjectDoubleClick: (obj: any) => void;
  onTokenDoubleClick: (token: any) => void;
  onTokenDragMove?: (worldPos: Point2D, token: any, nativeEvt: PointerEvent) => void;
  onTokenDragEnd?: () => void;
}

export const MapMakerPixiCanvas = React.forwardRef<MapMakerStageHandle, MapMakerPixiCanvasProps>((props, ref) => {
  const {
    width,
    height,
    scale,
    position,
    currentMap,
    gridMode,
    gridSize,
    terrains,
    lines,
    objects,
    walls,
    lights,
    texts,
    tokens,
    regions,
    fog,
    fogEnabled,
    visibilityPolygon,
    activePings,
    rulerWaypoints,
    rulerPointer,
    chunkGhostPreviewData,
    chunkCaptureMarquee,
    activeTool,
    selectedId,
    wallStartPoint,
    wallPreviewEnd,
    computeWallPreviewPoints,
    selectedWallType,
    paintRoofLayer,
    measurementUnit = 'meters',
    rulerSelectedPace,
    isStoryReadOnly = false,
    isLayerVisible,
    isLayerLocked,
    onWheel,
    onPointerDownEmptyOrTool,
    onPointerMove,
    onPointerUp,
    onSelect,
    onSelectToken,
    onErase,
    onToggleDoor
  } = props;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pixiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<RendererContext | null>(null);
  const compositorRef = useRef<LayerCompositor | null>(null);
  const subContainersRef = useRef<{
    objects: Container;
    walls: Container;
    lights: Container;
    entities: Container;
  } | null>(null);

  const [isPixiReady, setIsPixiReady] = useState(false);
  const [useCanvas2DFallback, setUseCanvas2DFallback] = useState(false);
  const [textureRevision, setTextureRevision] = useState(0);
  const [liveDragPreview, setLiveDragPreview] = useState<LiveDragPreview | null>(null);

  const claimedPointerRef = useRef(false);
  const lastClickRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });
  const activeItemDragRef = useRef<ActiveDragPayload | null>(null);
  const activePanDragRef = useRef<{ startClientX: number; startClientY: number; origX: number; origY: number } | null>(null);

  const latestCameraRef = useRef({ scale, position });
  latestCameraRef.current = { scale, position };

  const latestCallbacksRef = useRef(props);
  latestCallbacksRef.current = props;

  const computeRelativePositions = (clientX: number, clientY: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const cam = latestCameraRef.current;
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const safeScale = Math.max(0.05, cam.scale || 1);
    return {
      pointerPos: { x: px, y: py },
      worldPos: {
        x: (px - cam.position.x) / safeScale,
        y: (py - cam.position.y) / safeScale
      }
    };
  };

  useImperativeHandle(ref, () => ({
    toDataURL: () => {
      try {
        if (!useCanvas2DFallback && isPixiReady && rendererRef.current?.getIsInitialized()) {
          const app = rendererRef.current.getApp();
          if (app?.renderer?.extract?.canvas) {
            const extracted = app.renderer.extract.canvas(app.stage);
            if (extracted && typeof extracted.toDataURL === 'function') {
              return extracted.toDataURL('image/png') || '';
            }
          }
          if (pixiCanvasRef.current && typeof pixiCanvasRef.current.toDataURL === 'function') {
            return pixiCanvasRef.current.toDataURL('image/png') || '';
          }
        }
        if (fallbackCanvasRef.current && typeof fallbackCanvasRef.current.toDataURL === 'function') {
          return fallbackCanvasRef.current.toDataURL('image/png') || '';
        }
      } catch {
        // Fallback triggers MapGraphicsCompiler.compileToDataUrl in useMapBezierAndExport
      }
      return '';
    },
    getRelativePointerPosition: (clientX: number, clientY: number) => {
      return computeRelativePositions(clientX, clientY).worldPos;
    }
  }), [isPixiReady, useCanvas2DFallback]);

  // 1. Mount PixiJS v8 RendererContext + LayerCompositor (with automatic Canvas2D fallback)
  useEffect(() => {
    const canvas = pixiCanvasRef.current;
    if (!canvas || useCanvas2DFallback) return;

    let cancelled = false;
    const renderer = new RendererContext();
    rendererRef.current = renderer;

    (async () => {
      await renderer.initialize(canvas);
      if (cancelled) {
        await renderer.destroy();
        return;
      }

      if (!renderer.getIsInitialized()) {
        setUseCanvas2DFallback(true);
        return;
      }

      const app = renderer.getApp();
      if (!app || !app.stage) {
        setUseCanvas2DFallback(true);
        return;
      }

      const compositor = new LayerCompositor(app);
      compositorRef.current = compositor;

      const objLayer = compositor.getLayer(ZLayer.InteractiveObjects);
      const tokenLayer = compositor.getLayer(ZLayer.Tokens);
      const objectsSub = new Container();
      const wallsSub = new Container();
      const lightsSub = new Container();
      const entitiesSub = new Container();
      objLayer?.addChild(objectsSub, wallsSub);
      tokenLayer?.addChild(lightsSub, entitiesSub);
      subContainersRef.current = {
        objects: objectsSub,
        walls: wallsSub,
        lights: lightsSub,
        entities: entitiesSub
      };

      app.stage.scale.set(latestCameraRef.current.scale);
      app.stage.position.set(latestCameraRef.current.position.x, latestCameraRef.current.position.y);
      setIsPixiReady(true);
    })();

    return () => {
      cancelled = true;
      setIsPixiReady(false);
      subContainersRef.current = null;
      compositorRef.current?.destroy?.();
      compositorRef.current = null;
      rendererRef.current?.destroy?.();
      rendererRef.current = null;
    };
  }, [useCanvas2DFallback]);

  // 2. Sync PixiJS camera transform & viewport resize
  useEffect(() => {
    if (!isPixiReady || useCanvas2DFallback || !rendererRef.current?.getIsInitialized()) return;
    const app = rendererRef.current.getApp();
    if (!app?.stage) return;
    app.stage.scale.set(scale);
    app.stage.position.set(position.x, position.y);
    if (width > 0 && height > 0 && app.renderer?.resize) {
      try {
        app.renderer.resize(width, height);
      } catch {
        // ResizeObserver on RendererContext already syncs if resize is mid-frame
      }
    }
  }, [isPixiReady, useCanvas2DFallback, scale, position.x, position.y, width, height]);

  // 3. Global window drag tracker for smooth 60fps item & stage dragging
  useEffect(() => {
    const handleWindowMove = (evt: PointerEvent) => {
      const panDrag = activePanDragRef.current;
      if (panDrag) {
        latestCallbacksRef.current.onStagePan({
          x: panDrag.origX + (evt.clientX - panDrag.startClientX),
          y: panDrag.origY + (evt.clientY - panDrag.startClientY)
        });
        return;
      }

      const drag = activeItemDragRef.current;
      if (!drag) return;

      const cam = latestCameraRef.current;
      const safeScale = Math.max(0.05, cam.scale || 1);
      const dxWorld = (evt.clientX - drag.startClientX) / safeScale;
      const dyWorld = (evt.clientY - drag.startClientY) / safeScale;

      if (Math.hypot(dxWorld, dyWorld) > 1.5) {
        drag.hasMoved = true;
      }

      const nextX = drag.startX + dxWorld;
      const nextY = drag.startY + dyWorld;
      drag.lastWorldX = nextX;
      drag.lastWorldY = nextY;

      if (!useCanvas2DFallback && drag.target && !drag.target.destroyed) {
        drag.target.x = nextX;
        drag.target.y = nextY;
      }

      if (drag.kind === 'wall-p1' && drag.item?.p2) {
        setLiveDragPreview({
          kind: 'wall-edit',
          wallId: drag.id,
          p1: { x: Math.round(nextX), y: Math.round(nextY) },
          p2: drag.item.p2,
          bezierControl: drag.item.bezierControl || null
        });
      } else if (drag.kind === 'wall-p2' && drag.item?.p1) {
        setLiveDragPreview({
          kind: 'wall-edit',
          wallId: drag.id,
          p1: drag.item.p1,
          p2: { x: Math.round(nextX), y: Math.round(nextY) },
          bezierControl: drag.item.bezierControl || null
        });
      } else if (drag.kind === 'wall-bezier' && drag.item?.p1 && drag.item?.p2) {
        setLiveDragPreview({
          kind: 'wall-edit',
          wallId: drag.id,
          p1: drag.item.p1,
          p2: drag.item.p2,
          bezierControl: { x: Math.round(nextX), y: Math.round(nextY) }
        });
      } else if (drag.kind === 'object-resize') {
        const halfW = Math.max(10, Math.abs(Math.round(nextX)));
        const halfH = Math.max(10, Math.abs(Math.round(nextY)));
        setLiveDragPreview({
          kind: 'object-resize',
          id: drag.id,
          x: drag.item?.x || 0,
          y: drag.item?.y || 0,
          width: halfW * 2,
          height: halfH * 2
        });
      }

      if (drag.kind === 'token') {
        latestCallbacksRef.current.onTokenDragMove?.({ x: Math.round(nextX), y: Math.round(nextY) }, drag.item, evt);
      }
    };

    const handleWindowUp = () => {
      if (activePanDragRef.current) {
        activePanDragRef.current = null;
      }

      setLiveDragPreview(null);
      const drag = activeItemDragRef.current;
      if (!drag) return;
      activeItemDragRef.current = null;

      if (drag.kind === 'token') {
        latestCallbacksRef.current.onTokenDragEnd?.();
      }

      if (!drag.hasMoved) return;
      const cbs = latestCallbacksRef.current;
      const rx = Math.round(drag.lastWorldX);
      const ry = Math.round(drag.lastWorldY);

      if (drag.kind === 'object') {
        cbs.onUpdateObject({ ...drag.item, x: rx, y: ry });
      } else if (drag.kind === 'object-resize') {
        const halfW = Math.max(10, Math.abs(rx));
        const halfH = Math.max(10, Math.abs(ry));
        cbs.onUpdateObject({
          ...drag.item,
          width: halfW * 2,
          height: halfH * 2,
          radius: Math.max(halfW, halfH)
        });
      } else if (drag.kind === 'token') {
        cbs.onUpdateToken({ ...drag.item, x: rx, y: ry });
      } else if (drag.kind === 'light') {
        cbs.onUpdateLight(drag.id, rx, ry);
      } else if (drag.kind === 'text') {
        cbs.onUpdateText({ ...drag.item, x: rx, y: ry });
      } else if (drag.kind === 'region') {
        const b = drag.item.bounds || { width: 150, height: 150 };
        cbs.onUpdateRegion(drag.id, { ...b, x: rx, y: ry });
      } else if (drag.kind === 'wall-p1') {
        cbs.onUpdateWall(drag.id, { p1: { x: rx, y: ry } });
      } else if (drag.kind === 'wall-p2') {
        cbs.onUpdateWall(drag.id, { p2: { x: rx, y: ry } });
      } else if (drag.kind === 'wall-bezier') {
        cbs.onUpdateWall(drag.id, { bezierControl: { x: rx, y: ry } });
      }
    };

    window.addEventListener('pointermove', handleWindowMove);
    window.addEventListener('pointerup', handleWindowUp);
    window.addEventListener('blur', handleWindowUp);
    return () => {
      window.removeEventListener('pointermove', handleWindowMove);
      window.removeEventListener('pointerup', handleWindowUp);
      window.removeEventListener('blur', handleWindowUp);
    };
  }, [useCanvas2DFallback]);

  const layerCallbacks = useMemo<LayerRenderCallbacks>(() => ({
    claimPointer: () => {
      claimedPointerRef.current = true;
    },
    startItemDrag: (payload) => {
      if (latestCallbacksRef.current.isStoryReadOnly) return;
      activeItemDragRef.current = {
        ...payload,
        lastWorldX: payload.startX,
        lastWorldY: payload.startY,
        hasMoved: false
      };
    },
    onSelect: (id) => latestCallbacksRef.current.onSelect(id),
    onSelectToken: (id) => latestCallbacksRef.current.onSelectToken(id),
    onErase: (id) => {
      if (latestCallbacksRef.current.isStoryReadOnly) return;
      latestCallbacksRef.current.onErase(id);
    },
    onToggleDoor: (wallId) => {
      if (latestCallbacksRef.current.isStoryReadOnly) return;
      latestCallbacksRef.current.onToggleDoor(wallId);
    },
    onObjectDoubleClick: (obj) => latestCallbacksRef.current.onObjectDoubleClick(obj),
    onTokenDoubleClick: (token) => latestCallbacksRef.current.onTokenDoubleClick(token),
    checkDoubleClick: (key: string) => {
      const now = Date.now();
      if (lastClickRef.current.id === key && now - lastClickRef.current.time < 320) {
        lastClickRef.current = { id: '', time: 0 };
        return true;
      }
      lastClickRef.current = { id: key, time: now };
      return false;
    },
    onTextureReady: () => setTextureRevision((r) => r + 1)
  }), []);

  const effectiveIsLayerLocked = React.useCallback(
    (layerId: string) => Boolean(isStoryReadOnly) || isLayerLocked(layerId),
    [isStoryReadOnly, isLayerLocked]
  );

  const isLodOut = scale < 0.65;
  const handleScaleBucket = selectedId ? Math.round(Math.max(0.25, Math.min(4, scale)) * 4) / 4 : 1;

  const buildSceneData = (viewportScale: number, viewportX: number, viewportY: number) => ({
    viewport: { x: viewportX, y: viewportY, width, height, scale: viewportScale },
    currentMap,
    gridMode,
    gridSize,
    terrains,
    lines,
    objects,
    walls,
    lights,
    texts,
    tokens,
    regions,
    fog,
    fogEnabled,
    visibilityPolygon,
    activePings,
    rulerWaypoints,
    rulerPointer,
    rulerSelectedPace,
    liveDragPreview,
    chunkGhostPreviewData,
    chunkCaptureMarquee,
    activeTool,
    selectedId,
    wallStartPoint,
    wallPreviewEnd,
    computeWallPreviewPoints,
    selectedWallType,
    paintRoofLayer,
    measurementUnit,
    isLayerVisible,
    isLayerLocked: effectiveIsLayerLocked
  });

  // 4a. Headless/Canvas2D fallback render loop (only when WebGL/WebGPU is unavailable)
  useEffect(() => {
    if (!useCanvas2DFallback) return;
    const cvs = fallbackCanvasRef.current;
    if (!cvs) return;
    renderMapMakerFallback2D(cvs, {
      ...buildSceneData(scale, position.x, position.y),
      width,
      height,
      scale,
      position,
      onImageLoaded: () => setTextureRevision((r) => r + 1)
    });
  }, [
    useCanvas2DFallback,
    textureRevision,
    width,
    height,
    scale,
    position.x,
    position.y,
    currentMap,
    gridMode,
    gridSize,
    terrains,
    lines,
    objects,
    walls,
    lights,
    texts,
    tokens,
    regions,
    fog,
    fogEnabled,
    visibilityPolygon,
    activePings,
    rulerWaypoints,
    rulerPointer,
    chunkGhostPreviewData,
    chunkCaptureMarquee,
    activeTool,
    selectedId,
    wallStartPoint,
    wallPreviewEnd,
    computeWallPreviewPoints,
    selectedWallType,
    paintRoofLayer,
    measurementUnit,
    rulerSelectedPace,
    liveDragPreview,
    isLayerVisible,
    effectiveIsLayerLocked
  ]);

  // 4b. PixiJS Background & Grid Layer (camera-culled without rebuilding world assets)
  useEffect(() => {
    if (useCanvas2DFallback || !isPixiReady) return;
    const compositor = compositorRef.current;
    if (!compositor) return;
    const bgLayer = compositor.getLayer(ZLayer.BackgroundMap);
    if (!bgLayer) return;
    renderBackgroundAndGridLayer(bgLayer, buildSceneData(scale, position.x, position.y), layerCallbacks);
  }, [
    isPixiReady,
    useCanvas2DFallback,
    textureRevision,
    width,
    height,
    scale,
    position.x,
    position.y,
    currentMap,
    gridMode,
    gridSize,
    isLayerVisible,
    layerCallbacks
  ]);

  // 4c. PixiJS World Scene Layers (isolated from pan/zoom & cursor overlay ticks)
  useEffect(() => {
    if (useCanvas2DFallback || !isPixiReady) return;
    const compositor = compositorRef.current;
    const subs = subContainersRef.current;
    if (!compositor || !subs) return;

    const cam = latestCameraRef.current;
    const sceneData = buildSceneData(cam.scale, cam.position.x, cam.position.y);
    const debrisLayer = compositor.getLayer(ZLayer.UnderlayDebris);
    const roofLayer = compositor.getLayer(ZLayer.RoofCanopy);
    const fogLayer = compositor.getLayer(ZLayer.FogOfWar);

    if (debrisLayer) renderTerrainAndLinesLayer(debrisLayer, sceneData, layerCallbacks);
    renderObjectsLayer(subs.objects, sceneData, layerCallbacks);
    renderWallsLayer(subs.walls, sceneData, layerCallbacks);
    renderLightsLayer(subs.lights, sceneData, layerCallbacks);
    renderEntitiesLayer(subs.entities, sceneData, layerCallbacks);
    if (roofLayer) renderRoofLayer(roofLayer, sceneData, layerCallbacks);
    if (fogLayer) renderFogLayer(fogLayer, sceneData, layerCallbacks);
  }, [
    isPixiReady,
    useCanvas2DFallback,
    textureRevision,
    currentMap,
    terrains,
    lines,
    objects,
    walls,
    lights,
    texts,
    tokens,
    regions,
    fog,
    fogEnabled,
    visibilityPolygon,
    activeTool,
    selectedId,
    selectedWallType,
    paintRoofLayer,
    isLodOut,
    handleScaleBucket,
    isLayerVisible,
    effectiveIsLayerLocked,
    layerCallbacks
  ]);

  // 4d. PixiJS Foreground UI Overlay (cursor previews: ruler, pings, chunk ghost, live wall)
  useEffect(() => {
    if (useCanvas2DFallback || !isPixiReady) return;
    const compositor = compositorRef.current;
    if (!compositor) return;
    const fgLayer = compositor.getLayer(ZLayer.ForegroundUI);
    if (!fgLayer) return;
    renderForegroundOverlayLayer(fgLayer, buildSceneData(scale, position.x, position.y));
  }, [
    isPixiReady,
    useCanvas2DFallback,
    textureRevision,
    width,
    height,
    scale,
    position.x,
    position.y,
    gridSize,
    activeTool,
    wallStartPoint,
    wallPreviewEnd,
    computeWallPreviewPoints,
    selectedWallType,
    rulerWaypoints,
    rulerPointer,
    rulerSelectedPace,
    liveDragPreview,
    measurementUnit,
    activePings,
    chunkGhostPreviewData,
    chunkCaptureMarquee
  ]);

  const buildPointerPayload = (
    clientX: number,
    clientY: number,
    button: number,
    buttons: number,
    shiftKey: boolean,
    ctrlKey: boolean,
    preventDefaultFn: () => void,
    deltaY?: number,
    clickedOnEmpty = true
  ): MapMakerPointerPayload => {
    const { pointerPos, worldPos } = computeRelativePositions(clientX, clientY);
    return {
      clientX,
      clientY,
      button,
      buttons,
      shiftKey,
      ctrlKey,
      ...(deltaY !== undefined ? { deltaY } : {}),
      pointerPos,
      worldPos,
      clickedOnEmpty,
      preventDefault: preventDefaultFn
    };
  };

  const handleFallbackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!useCanvas2DFallback) return false;
    if (e.button !== 0 || (activeTool !== 'select' && activeTool !== 'eraser')) return false;
    const { worldPos } = computeRelativePositions(e.clientX, e.clientY);
    const hit = hitTestMapMakerFallback(worldPos, {
      walls,
      tokens,
      objects,
      lights,
      texts,
      regions,
      selectedId,
      isLayerLocked: effectiveIsLayerLocked,
      isLayerVisible
    });
    if (!hit) return false;

    if (activeTool === 'eraser') {
      if (isStoryReadOnly) return true;
      onErase(hit.id);
      return true;
    }

    if (hit.kind === 'door') {
      if (isStoryReadOnly) return true;
      onToggleDoor(hit.id);
      return true;
    }
    if (hit.kind === 'wall') {
      onSelect(hit.id);
      return true;
    }
    if (hit.kind === 'token') onSelectToken(hit.id);
    else onSelect(hit.id);

    if (isStoryReadOnly) return true;

    const dummyTarget = { x: worldPos.x, y: worldPos.y, destroyed: true } as unknown as Container;
    const startX =
      hit.kind === 'wall-p1'
        ? hit.item.p1.x
        : hit.kind === 'wall-p2'
        ? hit.item.p2.x
        : hit.kind === 'wall-bezier'
        ? hit.item.bezierControl?.x ?? (hit.item.p1.x + hit.item.p2.x) / 2
        : hit.kind === 'region'
        ? hit.item.bounds?.x ?? 0
        : hit.item.x ?? 0;
    const startY =
      hit.kind === 'wall-p1'
        ? hit.item.p1.y
        : hit.kind === 'wall-p2'
        ? hit.item.p2.y
        : hit.kind === 'wall-bezier'
        ? hit.item.bezierControl?.y ?? (hit.item.p1.y + hit.item.p2.y) / 2
        : hit.kind === 'region'
        ? hit.item.bounds?.y ?? 0
        : hit.item.y ?? 0;

    activeItemDragRef.current = {
      kind: hit.kind as ActiveDragPayload['kind'],
      id: hit.id,
      item: hit.item,
      target: dummyTarget,
      startX,
      startY,
      startClientX: e.clientX,
      startClientY: e.clientY,
      lastWorldX: startX,
      lastWorldY: startY,
      hasMoved: false
    };
    return true;
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full select-none"
      onWheel={(e) => {
        onWheel(
          buildPointerPayload(
            e.clientX,
            e.clientY,
            e.button,
            e.buttons,
            e.shiftKey,
            e.ctrlKey,
            () => e.preventDefault(),
            e.deltaY
          )
        );
      }}
      onPointerDown={(e) => {
        if (claimedPointerRef.current) {
          claimedPointerRef.current = false;
          return;
        }
        if (handleFallbackPointerDown(e)) return;

        if (e.button === 0 && activeTool === 'select' && selectedId === null && !e.shiftKey) {
          activePanDragRef.current = {
            startClientX: e.clientX,
            startClientY: e.clientY,
            origX: position.x,
            origY: position.y
          };
          return;
        }

        if (e.button === 0 && activeTool === 'select') {
          onSelect(null);
        }

        onPointerDownEmptyOrTool(
          buildPointerPayload(
            e.clientX,
            e.clientY,
            e.button,
            e.buttons,
            e.shiftKey,
            e.ctrlKey,
            () => e.preventDefault(),
            undefined,
            true
          )
        );
      }}
      onPointerMove={(e) => {
        if (activePanDragRef.current || activeItemDragRef.current) return;
        onPointerMove(
          buildPointerPayload(
            e.clientX,
            e.clientY,
            e.button,
            e.buttons,
            e.shiftKey,
            e.ctrlKey,
            () => e.preventDefault()
          )
        );
      }}
      onPointerUp={() => {
        onPointerUp();
      }}
    >
      {useCanvas2DFallback ? (
        <canvas
          ref={fallbackCanvasRef}
          width={Math.max(1, width)}
          height={Math.max(1, height)}
          aria-label="MapMaker Tactical Cartography Canvas"
          data-renderer="canvas2d-fallback"
          className="block w-full h-full"
        />
      ) : (
        <canvas
          ref={pixiCanvasRef}
          width={Math.max(1, width)}
          height={Math.max(1, height)}
          aria-label="MapMaker Tactical Cartography Canvas"
          data-renderer="pixijs-v8"
          className="block w-full h-full"
        />
      )}
    </div>
  );
});

MapMakerPixiCanvas.displayName = 'MapMakerPixiCanvas';

export default MapMakerPixiCanvas;
