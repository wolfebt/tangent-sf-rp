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
import { Graphics, Container, Text as PixiText, TextStyle } from 'pixi.js';
import { 
  type LayerCompositor, 
  ZLayer, 
  type WallSegment 
} from '../../../engine/index';

export interface UseStageRenderersOptions {
  layerCompositorRef: React.MutableRefObject<LayerCompositor | null>;
  terrainsContainerRef: React.MutableRefObject<Container | null>;
  linesContainerRef: React.MutableRefObject<Container | null>;
  textsContainerRef: React.MutableRefObject<Container | null>;
  wallPreviewContainerRef: React.MutableRefObject<Container | null>;
  pingsContainerRef: React.MutableRefObject<Container | null>;
  isCanvasReady: boolean;
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
}

export function useStageRenderers({
  layerCompositorRef,
  terrainsContainerRef,
  linesContainerRef,
  textsContainerRef,
  wallPreviewContainerRef,
  pingsContainerRef,
  isCanvasReady,
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
  activePings
}: UseStageRenderersOptions): void {
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
  }, [layerCompositorRef, isCanvasReady, localWalls]);

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
  }, [terrainsContainerRef, isCanvasReady, currentMap?.terrains]);

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
  }, [linesContainerRef, isCanvasReady, currentMap?.lines]);

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
  }, [textsContainerRef, isCanvasReady, currentMap?.texts]);

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
  }, [
    wallPreviewContainerRef,
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
  }, [pingsContainerRef, activePings]);
}
