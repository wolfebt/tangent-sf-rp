/**
 * @file useStageRenderers.ts
 * @description Hook managing Pixi graphics rendering for:
 * - Walls & Bulkheads
 * - Terrain (Hex tile and organic polygons)
 * - Tactical freehand pencil lines
 * - Text annotations
 * - Live drawing/wall preview
 * - Tactical radar pings
 */

import { useEffect } from 'react';
import { Graphics, Container, Text as PixiText, TextStyle, Assets, Sprite, ColorMatrixFilter } from 'pixi.js';
import { clearPixiContainer } from '../utils/pixiCleanup';
import { type LayerCompositor, ZLayer } from '../../../engine/canvas/LayerCompositor.ts';
import type { WallSegment } from '../../../engine/vision/BVHBuilder.ts';
import { MarchingSquaresAutoTiler } from '../../../engine/canvas/MarchingSquaresAutoTiler.ts';
import { applyAssetCustomizationToPixiSprite } from '../../../engine/canvas/AssetCustomizerShader.ts';
import { getMapLayerState } from '../../../utils/mapSchemaAdapter';

export interface UseStageRenderersOptions {
  layerCompositorRef: React.MutableRefObject<LayerCompositor | null>;
  terrainsContainerRef: React.MutableRefObject<Container | null>;
  linesContainerRef: React.MutableRefObject<Container | null>;
  textsContainerRef: React.MutableRefObject<Container | null>;
  wallPreviewContainerRef: React.MutableRefObject<Container | null>;
  pingsContainerRef: React.MutableRefObject<Container | null>;
  isCanvasReady: boolean;
  canvasGeneration?: number;
  localWalls: WallSegment[];
  currentMap: any;
  isDrawingToolActive: boolean;
  isDesignModeActive: boolean;
  activeDesignTool: string;
  wallDrawStart: { x: number; y: number } | null;
  wallDrawCurrent: { x: number; y: number } | null;
  selectedWallType: string;
  wallConstructionMode: 'single' | 'chain' | 'room';
  wallChainPoints: { x: number; y: number }[];
  currentStrokePoints: number[];
  pencilColor: string;
  pencilWidth: number;
  terrainBrushWidth: number;
  activePings: any[];
  isArchitectRole?: boolean;
}

export function useStageRenderers({
  layerCompositorRef,
  terrainsContainerRef,
  linesContainerRef,
  textsContainerRef,
  wallPreviewContainerRef,
  pingsContainerRef,
  isCanvasReady,
  canvasGeneration = isCanvasReady ? 1 : 0,
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
  activePings,
  isArchitectRole = true
}: UseStageRenderersOptions): void {
  // ── Render Walls & Bulkheads onto the Stage ──
  useEffect(() => {
    const compositor = layerCompositorRef.current;
    if (!compositor) return;

    const wallLayer = compositor.getLayer(ZLayer.UnderlayDebris);
    if (!wallLayer) return;

    let wallsContainer = wallLayer.children.find((c: any) => c.label === 'WallsLayer') as Container | undefined;
    if (!wallsContainer) {
      wallsContainer = new Container();
      wallsContainer.label = 'WallsLayer';
      wallLayer.addChild(wallsContainer);
    }

    clearPixiContainer(wallsContainer);

    const wallLayerState = getMapLayerState(currentMap, 'walls');
    if (!wallLayerState.visible) return;
    wallsContainer.alpha = wallLayerState.opacity ?? 1;

    const g = new Graphics();
    const enableWallShadows = currentMap?.enableWallShadows !== false;

    const traceWallPath = (wall: any, offsetX = 0, offsetY = 0) => {
      g.moveTo(wall.p1.x + offsetX, wall.p1.y + offsetY);
      if (wall.bezierControl && typeof wall.bezierControl.x === 'number' && typeof wall.bezierControl.y === 'number') {
        g.quadraticCurveTo(
          wall.bezierControl.x + offsetX,
          wall.bezierControl.y + offsetY,
          wall.p2.x + offsetX,
          wall.p2.y + offsetY
        );
      } else {
        g.lineTo(wall.p2.x + offsetX, wall.p2.y + offsetY);
      }
    };

    if (enableWallShadows) {
      localWalls.forEach(wall => {
        const isDoor = wall.isDynamic;
        const isWindow = (wall as any).isTransparent;
        if (wall.isOpen) return;
        const baseWidth = isDoor ? 5 : isWindow ? 3 : 4;
        traceWallPath(wall, 5, 6);
        g.stroke({
          width: baseWidth + 5,
          color: 0x000000,
          alpha: 0.34,
          cap: 'round'
        });
      });
    }

    localWalls.forEach(wall => {
      const isDoor = wall.isDynamic;
      const isOpen = wall.isOpen;
      const isWindow = (wall as any).isTransparent;

      const strokeColor = isDoor 
        ? (isOpen ? 0x10b981 : 0xf59e0b) 
        : isWindow 
          ? 0x38bdf8 
          : 0x06b6d4;

      traceWallPath(wall);
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

    wallsContainer.addChild(g);
  }, [layerCompositorRef, isCanvasReady, canvasGeneration, localWalls, currentMap?.enableWallShadows, currentMap?.layers]);

  // ── Render Scene Regions & Spatial Trigger Zones onto UnderlayDebris ──
  useEffect(() => {
    const compositor = layerCompositorRef.current;
    if (!compositor) return;
    const underlayLayer = compositor.getLayer(ZLayer.UnderlayDebris);
    if (!underlayLayer) return;

    let regionsContainer = underlayLayer.children.find((c: any) => c.label === 'RegionsLayer') as Container | undefined;
    if (!regionsContainer) {
      regionsContainer = new Container();
      regionsContainer.label = 'RegionsLayer';
      underlayLayer.addChild(regionsContainer);
    }

    clearPixiContainer(regionsContainer);
    const regionsLayerState = getMapLayerState(currentMap, 'regions');
    if (!regionsLayerState.visible) return;

    const regions = Array.isArray(currentMap?.regions) ? currentMap.regions : [];
    if (regions.length === 0) return;

    const regionColorMap: Record<string, number> = {
      roof_zone: 0x6366f1,
      roof: 0x6366f1,
      hazard: 0xef4444,
      teleport_deck: 0x06b6d4,
      teleport: 0x06b6d4,
      switch_map: 0x3b82f6,
      story_flag: 0xa855f7,
      audio_cue: 0xec4899,
      audio_zone: 0xec4899
    };

    regions.forEach((region: any) => {
      if (!region || region.enabled === false) return;
      if (!isArchitectRole && !region.isPlayerVisible) return;
      const b = region.bounds || {};
      const rx = Number(b.x ?? region.x ?? 0);
      const ry = Number(b.y ?? region.y ?? 0);
      const rw = Number(b.width ?? region.width ?? 150);
      const rh = Number(b.height ?? region.height ?? 150);
      const col = regionColorMap[region.triggerType] ?? 0xa855f7;

      const node = new Container();
      node.x = rx;
      node.y = ry;

      const rg = new Graphics();
      rg.rect(0, 0, rw, rh);
      rg.fill({ color: col, alpha: 0.16 * (regionsLayerState.opacity ?? 1) });
      rg.stroke({ width: 2, color: col, alpha: 0.78 });
      node.addChild(rg);

      const labelText = new PixiText({
        text: `${region.name || 'Region'} [${region.triggerType || 'zone'}]`,
        style: new TextStyle({
          fontFamily: 'monospace',
          fontSize: 10,
          fill: col,
          fontWeight: 'bold'
        })
      });
      labelText.x = 6;
      labelText.y = 4;
      node.addChild(labelText);

      regionsContainer!.addChild(node);
    });
  }, [layerCompositorRef, isCanvasReady, canvasGeneration, currentMap?.regions, currentMap?.layers, isArchitectRole]);

  // ── Render Terrains (Hex Tiles & Organic Polygons) onto BackgroundMap Layer ──
  useEffect(() => {
    const container = terrainsContainerRef.current;
    if (!container) return;
    let isCancelled = false;
    clearPixiContainer(container);

    const compositor = layerCompositorRef.current;
    const roofLayer = compositor?.getLayer(ZLayer.RoofCanopy);
    let roofTerrainContainer: Container | undefined;
    if (roofLayer) {
      roofTerrainContainer = roofLayer.children.find((c: any) => c.label === 'RoofTerrainLayer') as Container | undefined;
      if (!roofTerrainContainer) {
        roofTerrainContainer = new Container();
        roofTerrainContainer.label = 'RoofTerrainLayer';
        roofLayer.addChild(roofTerrainContainer);
      }
      clearPixiContainer(roofTerrainContainer);
    }

    const terrains = currentMap?.terrains || [];
    const terrainLayerState = getMapLayerState(currentMap, 'terrain');
    const roofLayerState = getMapLayerState(currentMap, 'roof');
    if (terrains.length === 0 || (!terrainLayerState.visible && !roofLayerState.visible)) return;

    const g = new Graphics();
    const gRoof = new Graphics();
    let hasRoofItems = false;

    terrains.forEach((t: any) => {
      if (t.isRoofLayer && !roofLayerState.visible) return;
      if (!t.isRoofLayer && !terrainLayerState.visible) return;
      const targetGraphics = t.isRoofLayer && roofTerrainContainer ? gRoof : g;
      const targetSpriteContainer = t.isRoofLayer && roofTerrainContainer ? roofTerrainContainer : container;
      if (t.isRoofLayer && roofTerrainContainer) {
        hasRoofItems = true;
      }

      let colorHex = 0x14532d;
      if (t.color) {
        if (typeof t.color === 'string') {
          colorHex = parseInt(t.color.replace('#', '0x'), 16) || 0x14532d;
        } else if (typeof t.color === 'number') {
          colorHex = t.color;
        }
      }

      const isImageTerrain =
        t.renderType === 'canvasImage' ||
        t.renderType === 'image' ||
        (!t.points && Boolean(t.imageUrl));
      if (isImageTerrain && t.imageUrl) {
        Assets.load(t.imageUrl)
          .then((tex) => {
            if (isCancelled || container.destroyed || !tex) return;
            const sp = new Sprite(tex);
            sp.x = t.x || 0;
            sp.y = t.y || 0;
            if (t.width) sp.width = t.width;
            if (t.height) sp.height = t.height;
            if (t.opacity !== undefined) sp.alpha = Number(t.opacity);
            applyAssetCustomizationToPixiSprite(
              sp,
              t.customization || t.visuals?.customization || t.assetUnit?.visuals?.customization,
              ColorMatrixFilter
            );
            targetSpriteContainer.addChild(sp);
          })
          .catch(() => {});
        return;
      }

      if (t.renderType === 'hexTile' && t.x !== undefined && t.y !== undefined) {
        const radius = t.radius || 40;
        const sides = 6;
        const pts: number[] = [];
        for (let i = 0; i < sides; i++) {
          const angle = (i * Math.PI) / 3;
          pts.push(t.x + radius * Math.cos(angle), t.y + radius * Math.sin(angle));
        }
        targetGraphics.poly(pts);
        targetGraphics.fill({ color: colorHex, alpha: 0.85 });
        targetGraphics.stroke({ width: 1, color: 0x000000, alpha: 0.3 });
      } else if (t.points && t.points.length >= 4) {
        if (t.closed || t.renderType === 'polygon') {
          if (t.softEdge) {
            targetGraphics.poly(t.points);
            targetGraphics.stroke({ width: (t.strokeWidth || 2) + 16, color: colorHex, alpha: 0.22 });
          }
          targetGraphics.poly(t.points);
          targetGraphics.fill({ color: colorHex, alpha: 0.85 });
          targetGraphics.stroke({ width: t.strokeWidth || 2, color: colorHex, alpha: 0.95 });

          if (t.edgeLines && t.edgeLines.length > 0) {
            t.edgeLines.forEach((edge: [number, number, number, number]) => {
              targetGraphics.moveTo(edge[0], edge[1]);
              targetGraphics.lineTo(edge[2], edge[3]);
            });
            targetGraphics.stroke({ width: 2, color: t.isLiquid ? 0x38bdf8 : 0x0ea5e9, alpha: 0.8 });
          }
        } else {
          if (t.softEdge) {
            targetGraphics.moveTo(t.points[0], t.points[1]);
            for (let i = 2; i < t.points.length; i += 2) {
              targetGraphics.lineTo(t.points[i], t.points[i + 1]);
            }
            targetGraphics.stroke({ width: (t.strokeWidth || 30) + 18, color: colorHex, cap: 'round', join: 'round', alpha: 0.22 });
          }
          targetGraphics.moveTo(t.points[0], t.points[1]);
          for (let i = 2; i < t.points.length; i += 2) {
            targetGraphics.lineTo(t.points[i], t.points[i+1]);
          }
          targetGraphics.stroke({ width: t.strokeWidth || 30, color: colorHex, cap: 'round', join: 'round', alpha: 0.85 });
        }
      } else if (t.renderType === 'rect' || (t.width !== undefined && t.height !== undefined && t.x !== undefined && t.y !== undefined)) {
        const x = t.x ?? 0;
        const y = t.y ?? 0;
        const w = t.width ?? 50;
        const h = t.height ?? 50;
        targetGraphics.rect(x, y, w, h);
        targetGraphics.fill({ color: colorHex, alpha: t.opacity ?? 0.88 });
        if (t.softEdge) {
          targetGraphics.rect(x - 6, y - 6, w + 12, h + 12);
          targetGraphics.stroke({ width: 12, color: colorHex, alpha: 0.22 });
        }

        // Auto-tile edge lines from Marching Squares bitmasks
        const edges = t.edgeLines || (t.bitmask4Bit !== undefined ? MarchingSquaresAutoTiler.getEdgeLines(x, y, w, h, t.bitmask4Bit) : null);
        if (edges && edges.length > 0) {
          edges.forEach((edge: [number, number, number, number]) => {
            targetGraphics.moveTo(edge[0], edge[1]);
            targetGraphics.lineTo(edge[2], edge[3]);
          });
          targetGraphics.stroke({ width: 2, color: t.isLiquid ? 0x38bdf8 : 0x0ea5e9, alpha: 0.8 });
        }

        // Render MicroTile / Chunk Studio custom textureUrl if present
        if (t.textureUrl) {
          Assets.load(t.textureUrl).then((tex) => {
            if (!isCancelled && !targetSpriteContainer.destroyed && tex) {
              const sprite = new Sprite(tex);
              sprite.x = x;
              sprite.y = y;
              sprite.width = w;
              sprite.height = h;
              sprite.alpha = t.opacity ?? 0.92;
              applyAssetCustomizationToPixiSprite(
                sprite,
                t.customization || t.visuals?.customization || t.assetUnit?.visuals?.customization,
                ColorMatrixFilter
              );
              targetSpriteContainer.addChild(sprite);
            }
          }).catch(() => {});
        }
      }
    });

    container.addChild(g);
    if (hasRoofItems && roofTerrainContainer) {
      roofTerrainContainer.addChild(gRoof);
    } else {
      gRoof.destroy();
    }
    return () => {
      isCancelled = true;
    };
  }, [terrainsContainerRef, layerCompositorRef, isCanvasReady, canvasGeneration, currentMap?.terrains, currentMap?.layers]);

  // ── Render Freehand Tactical Pencil Lines onto UnderlayDebris Layer ──
  useEffect(() => {
    const container = linesContainerRef.current;
    if (!container) return;
    clearPixiContainer(container);

    if (!getMapLayerState(currentMap, 'annotations').visible) return;
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
  }, [linesContainerRef, isCanvasReady, canvasGeneration, currentMap?.lines, currentMap?.layers]);

  // ── Render Text Labels onto ForegroundUI Layer ──
  useEffect(() => {
    const container = textsContainerRef.current;
    if (!container) return;
    clearPixiContainer(container);

    if (!getMapLayerState(currentMap, 'annotations').visible) return;
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

      const pixiText = new PixiText({ text: t.text || 'Label', style });
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
  }, [textsContainerRef, isCanvasReady, canvasGeneration, currentMap?.texts, currentMap?.layers]);

  // ── Render Dynamic Drawing Preview (Live Wall Drag Line or Live Brush Stroke) ──
  useEffect(() => {
    const container = wallPreviewContainerRef.current;
    if (!container) return;
    clearPixiContainer(container);

    if (!isDrawingToolActive || !isDesignModeActive) return;

    const g = new Graphics();
    if ((activeDesignTool === 'wall' || activeDesignTool === 'curved_wall') && wallDrawStart && wallDrawCurrent) {
      const isDoor = selectedWallType === 'door';
      const isWindow = selectedWallType === 'window';
      const color = isDoor ? 0xf59e0b : isWindow ? 0x38bdf8 : 0x06b6d4;

      if (activeDesignTool === 'curved_wall') {
        const dx = wallDrawCurrent.x - wallDrawStart.x;
        const dy = wallDrawCurrent.y - wallDrawStart.y;
        const cpX = (wallDrawStart.x + wallDrawCurrent.x) / 2 - dy * 0.28;
        const cpY = (wallDrawStart.y + wallDrawCurrent.y) / 2 + dx * 0.28;

        g.moveTo(wallDrawStart.x, wallDrawStart.y);
        g.quadraticCurveTo(cpX, cpY, wallDrawCurrent.x, wallDrawCurrent.y);
        g.stroke({ width: 4, color, alpha: 0.9 });

        g.circle(wallDrawStart.x, wallDrawStart.y, 5);
        g.fill({ color: 0xffffff });
        g.circle(wallDrawCurrent.x, wallDrawCurrent.y, 5);
        g.fill({ color });
        g.circle(cpX, cpY, 4);
        g.fill({ color: 0xf59e0b });
      } else if (wallConstructionMode === 'room') {
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
  }, [
    wallPreviewContainerRef,
    isCanvasReady,
    canvasGeneration,
    isDrawingToolActive,
    isDesignModeActive,
    activeDesignTool,
    wallDrawStart,
    wallDrawCurrent,
    currentStrokePoints,
    selectedWallType,
    wallConstructionMode,
    wallChainPoints,
    pencilColor,
    pencilWidth,
    terrainBrushWidth
  ]);

  // ── Render Animated Tactical Radar Pings ──
  useEffect(() => {
    const container = pingsContainerRef.current;
    if (!container) return;
    clearPixiContainer(container);

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
  }, [pingsContainerRef, isCanvasReady, canvasGeneration, activePings]);
}
