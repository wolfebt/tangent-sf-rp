/**
 * @file mapMakerLayerRenderers.ts
 * @description Modular PixiJS v8 scene builders for all MapMaker layers
 * (Background & Grid, Terrain & Lines, Interactive Objects, Walls & Bezier Handles,
 * Dynamic Lights, Tokens/Texts/Regions/ChunkGhost/Ruler/Pings, Roof Canopy, and Fog of War).
 */

import { Container, Graphics, Sprite, Text as PixiText, TextStyle } from 'pixi.js';
import { clearPixiContainer } from '../../../../components/VTT/utils/pixiCleanup.ts';
import { AudioService } from '../../../../services/audioService';
import { WALL_TYPES, DOOR_STATES } from '../../../../schemas/vttWallSchema.js';
import { getBiomeTextureUrl } from '../map/landmassGenerator.js';
import { getTextureUrlFromColor } from '../map/MapTextures.js';
import {
  CONDITION_COLORS,
  parseHexColor,
  computeWallStrokeStyle,
  tessellateWallLinePoints,
  drawStyledPolyline,
  drawDashedRect,
  drawDashedCircle,
  buildRegularPolygonPoints,
  buildStarPolygonPoints,
  drawPixiSquareGrid,
  drawPixiHexGrid,
  computeRulerPaceStats,
  requestPixiTexture,
  type Point2D,
  type ViewportState
} from './mapMakerPixiHelpers.ts';

export interface ActiveDragPayload {
  kind:
    | 'object'
    | 'object-resize'
    | 'token'
    | 'light'
    | 'text'
    | 'region'
    | 'wall-p1'
    | 'wall-p2'
    | 'wall-bezier';
  id: string;
  item: any;
  target: Container;
  startX: number;
  startY: number;
  startClientX: number;
  startClientY: number;
  lastWorldX: number;
  lastWorldY: number;
  hasMoved: boolean;
}

export interface LayerRenderCallbacks {
  claimPointer: () => void;
  startItemDrag: (payload: Omit<ActiveDragPayload, 'lastWorldX' | 'lastWorldY' | 'hasMoved'>, clientX: number, clientY: number) => void;
  onSelect: (id: string) => void;
  onSelectToken: (id: string) => void;
  onErase: (id: string) => void;
  onToggleDoor: (wallId: string) => void;
  onObjectDoubleClick: (obj: any) => void;
  onTokenDoubleClick: (token: any) => void;
  checkDoubleClick: (id: string) => boolean;
  onTextureReady: () => void;
}

export interface MapMakerSceneData {
  viewport: ViewportState;
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
  isLayerVisible: (layerId: string) => boolean;
  isLayerLocked: (layerId: string) => boolean;
}

function getClientCoords(evt: any): { clientX: number; clientY: number } {
  const nativeEvt = evt?.nativeEvent || evt?.originalEvent || evt;
  return {
    clientX: Number(nativeEvt?.clientX ?? evt?.global?.x ?? 0),
    clientY: Number(nativeEvt?.clientY ?? evt?.global?.y ?? 0)
  };
}

function makeTextNode(
  text: string,
  fontSize: number,
  color: string,
  opts: { bold?: boolean; fontFamily?: string; align?: 'left' | 'center' | 'right'; wordWrapWidth?: number } = {}
): PixiText {
  const style = new TextStyle({
    fontSize: Math.max(6, fontSize),
    fontWeight: opts.bold ? 'bold' : 'normal',
    fontFamily: opts.fontFamily || 'sans-serif',
    fill: color,
    align: opts.align || 'left',
    ...(opts.wordWrapWidth ? { wordWrap: true, wordWrapWidth: opts.wordWrapWidth } : {})
  });
  return new PixiText({ text, style });
}

export function renderBackgroundAndGridLayer(
  container: Container,
  scene: MapMakerSceneData,
  cb: LayerRenderCallbacks
): void {
  clearPixiContainer(container);
  const { currentMap, viewport, gridMode, gridSize } = scene;
  const mapWidth = currentMap?.width || 2800;
  const mapHeight = currentMap?.height || 2100;
  const hasVideo = Boolean(currentMap?.videoBackgroundUrl);

  const bg = new Graphics();
  if (!hasVideo) {
    bg.rect(-100000, -100000, 200000, 200000);
    bg.fill({ color: 0x111827 });
  }
  container.addChild(bg);

  const underlay = currentMap?.underlay;
  if (underlay?.url && underlay?.mediaType !== 'video' && underlay?.visible !== false) {
    const tex = requestPixiTexture(underlay.url, cb.onTextureReady);
    if (tex) {
      const sprite = new Sprite(tex);
      const uScale = Number(underlay.scale || 1);
      const naturalW = tex.width || mapWidth;
      const naturalH = tex.height || mapHeight;
      sprite.x = Number(underlay.offsetX || 0);
      sprite.y = Number(underlay.offsetY || 0);
      sprite.width = naturalW * uScale;
      sprite.height = naturalH * uScale;
      sprite.alpha = underlay.opacity ?? 0.5;
      sprite.eventMode = 'none';
      container.addChild(sprite);
    }
  }

  const borderGfx = new Graphics();
  drawDashedRect(borderGfx, 0, 0, mapWidth, mapHeight, 2, 0x22d3ee, 0.45, [12, 6]);
  container.addChild(borderGfx);

  if (gridMode === 'square' || gridMode === 'hex') {
    const gridGfx = new Graphics();
    if (gridMode === 'square') {
      drawPixiSquareGrid(gridGfx, viewport, gridSize);
    } else {
      drawPixiHexGrid(gridGfx, viewport, gridSize);
    }
    container.addChild(gridGfx);
  }
}

function renderTerrainListIntoContainer(
  container: Container,
  terrains: any[],
  isEraser: boolean,
  isLocked: boolean,
  cb: LayerRenderCallbacks
): void {
  for (const t of terrains) {
    if (!t) continue;

    if (t.renderType === 'canvasImage' && t.imageUrl) {
      const tex = requestPixiTexture(t.imageUrl, cb.onTextureReady);
      if (tex) {
        const sp = new Sprite(tex);
        sp.x = t.x || 0;
        sp.y = t.y || 0;
        if (t.width) sp.width = t.width;
        if (t.height) sp.height = t.height;
        if (isEraser && !isLocked) {
          sp.eventMode = 'static';
          sp.cursor = 'pointer';
          sp.on('pointerdown', (e) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            cb.claimPointer();
            cb.onErase(t.id);
          });
        }
        container.addChild(sp);
      }
      continue;
    }

    // Warm texture URL in cache if available
    const texUrl = t.textureUrl || getBiomeTextureUrl(t.biomeType || t.terrainTypeId) || getTextureUrlFromColor(t.color || t.terrainTypeId);
    const patternTex = texUrl ? requestPixiTexture(texUrl, cb.onTextureReady) : null;
    const fillHex = parseHexColor(t.color, 0x15803d);

    const g = new Graphics();
    const alpha = t.isRoofLayer ? 0.92 : (t.opacity ?? 0.9);

    if (t.renderType === 'hexTile' && t.x !== undefined && t.y !== undefined) {
      const pts = buildRegularPolygonPoints(t.x, t.y, t.radius || 40, 6);
      g.poly(pts);
      if (patternTex) {
        g.fill({ color: fillHex, texture: patternTex, alpha });
      } else {
        g.fill({ color: fillHex, alpha });
      }
      g.stroke({ width: 1, color: 0x000000, alpha: 0.18 });
    } else if (t.renderType === 'rect') {
      g.rect(t.x || 0, t.y || 0, t.width || 40, t.height || 40);
      if (patternTex) {
        g.fill({ color: fillHex, texture: patternTex, alpha });
      } else {
        g.fill({ color: fillHex, alpha });
      }
      g.stroke({ width: t.strokeWidth || 1, color: parseHexColor(t.strokeColor || t.color, fillHex), alpha: 0.9 });
    } else if (Array.isArray(t.points) && t.points.length >= 4) {
      if (t.closed || t.renderType === 'polygon') {
        g.poly(t.points);
        if (patternTex) {
          g.fill({ color: fillHex, texture: patternTex, alpha });
        } else {
          g.fill({ color: fillHex, alpha });
        }
        g.stroke({
          width: t.strokeWidth || 1.5,
          color: parseHexColor(t.strokeColor || t.color, fillHex),
          cap: 'round',
          join: 'round'
        });
      } else {
        if (t.softEdge) {
          drawStyledPolyline(g, t.points, (t.strokeWidth || 30) + 18, fillHex, 0.22);
        }
        drawStyledPolyline(g, t.points, t.strokeWidth || 30, fillHex, alpha);
      }
    } else {
      continue;
    }

    if (isEraser && !isLocked && t.id) {
      g.eventMode = 'static';
      g.cursor = 'pointer';
      g.on('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cb.claimPointer();
        cb.onErase(t.id);
      });
    }

    container.addChild(g);
  }
}

export function renderTerrainAndLinesLayer(
  container: Container,
  scene: MapMakerSceneData,
  cb: LayerRenderCallbacks
): void {
  clearPixiContainer(container);
  if (!scene.isLayerVisible('layer_terrain')) return;

  const isLocked = scene.isLayerLocked('layer_terrain');
  const isEraser = scene.activeTool === 'eraser';

  renderTerrainListIntoContainer(
    container,
    scene.terrains.filter((t) => !t?.isRoofLayer),
    isEraser,
    isLocked,
    cb
  );

  for (const l of scene.lines) {
    if (!Array.isArray(l?.points) || l.points.length < 4) continue;
    const g = new Graphics();
    const strokeHex = parseHexColor(l.stroke || l.color, 0xef4444);
    if (l.closed) {
      g.poly(l.points);
      g.stroke({ width: l.strokeWidth || 5, color: strokeHex, cap: 'round', join: 'round' });
    } else {
      drawStyledPolyline(g, l.points, l.strokeWidth || 5, strokeHex, 1);
    }

    if (isEraser && !isLocked && l.id) {
      g.eventMode = 'static';
      g.cursor = 'pointer';
      g.on('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cb.claimPointer();
        cb.onErase(l.id);
      });
    }
    container.addChild(g);
  }
}

export function renderObjectsLayer(
  container: Container,
  scene: MapMakerSceneData,
  cb: LayerRenderCallbacks
): void {
  clearPixiContainer(container);
  if (!scene.isLayerVisible('layer_objects')) return;

  const isLocked = scene.isLayerLocked('layer_objects');
  const isEraser = scene.activeTool === 'eraser';
  const isSelect = scene.activeTool === 'select';
  const zoomScale = scene.viewport.scale;
  const isLODOut = zoomScale < 0.65;

  for (const obj of scene.objects) {
    if (!obj) continue;
    const isSelected = obj.id === scene.selectedId;
    const radius = obj.radius || 25;
    const width = obj.width || radius * 2;
    const height = obj.height || radius * 2;
    const fillHex = parseHexColor(obj.color, 0x3b82f6);
    const hasScaleTarget = Boolean(obj.scaleTarget);
    const hasHazard = Boolean(obj.hazard);
    const hasResource = Boolean(obj.resource);

    const group = new Container();
    group.x = obj.x || 0;
    group.y = obj.y || 0;

    if (obj.haloColor) {
      const haloG = new Graphics();
      haloG.circle(0, 0, radius + 8);
      haloG.stroke({ width: 4, color: parseHexColor(obj.haloColor, 0x22d3ee), alpha: 0.85 });
      group.addChild(haloG);
    }

    const bodyG = new Graphics();
    const imgTex = obj.imageUrl ? requestPixiTexture(obj.imageUrl, cb.onTextureReady) : null;

    if (isLODOut) {
      bodyG.circle(0, 0, Math.max(16, radius));
      bodyG.fill({ color: fillHex });
      bodyG.stroke({
        width: isSelected ? 3 : 2,
        color: isSelected ? 0xffffff : hasScaleTarget ? 0xf59e0b : 0x000000
      });
      group.addChild(bodyG);
    } else if (imgTex) {
      const sp = new Sprite(imgTex);
      sp.anchor.set(0.5);
      sp.width = width;
      sp.height = height;
      group.addChild(sp);
      if (isSelected) {
        bodyG.rect(-width / 2, -height / 2, width, height);
        bodyG.stroke({ width: 3, color: 0x22d3ee });
        group.addChild(bodyG);
      }
    } else {
      switch (obj.shape) {
        case 'star': {
          if (hasHazard) drawDashedCircle(bodyG, 0, 0, radius + 8, 2, 0xef4444, 1, [4, 4]);
          bodyG.poly(buildStarPolygonPoints(0, 0, radius, radius * 0.5, 5));
          bodyG.fill({ color: fillHex });
          bodyG.stroke({ width: 2, color: isSelected ? 0xffffff : 0x000000 });
          break;
        }
        case 'hexagon': {
          if (hasScaleTarget) {
            drawStyledPolyline(bodyG, [...buildRegularPolygonPoints(0, 0, radius + 6, 6), ...buildRegularPolygonPoints(0, 0, radius + 6, 6).slice(0, 2)], 2, 0xf59e0b, 1, [6, 4]);
          }
          bodyG.poly(buildRegularPolygonPoints(0, 0, radius, 6));
          bodyG.fill({ color: fillHex });
          bodyG.stroke({ width: 2, color: isSelected ? 0xffffff : 0x000000 });
          break;
        }
        case 'triangle': {
          bodyG.poly(buildRegularPolygonPoints(0, 0, radius, 3));
          bodyG.fill({ color: fillHex });
          bodyG.stroke({ width: 2, color: isSelected ? 0xffffff : 0x000000 });
          break;
        }
        case 'cloud': {
          bodyG.circle(-radius * 0.4, 0, radius * 0.6).fill({ color: fillHex, alpha: 0.8 });
          bodyG.circle(radius * 0.4, 0, radius * 0.6).fill({ color: fillHex, alpha: 0.8 });
          bodyG.circle(0, -radius * 0.3, radius * 0.75).fill({ color: fillHex, alpha: 0.9 });
          bodyG.circle(0, 0, radius).stroke({ width: 2, color: isSelected ? 0xffffff : 0x000000 });
          break;
        }
        case 'line': {
          drawStyledPolyline(bodyG, [-width / 2, 0, width / 2, 0], height || 12, fillHex, 1);
          break;
        }
        case 'circle': {
          bodyG.circle(0, 0, radius);
          bodyG.fill({ color: fillHex });
          bodyG.stroke({ width: isSelected ? 3 : 2, color: isSelected ? 0xffffff : 0x000000 });
          break;
        }
        case 'rect':
        default: {
          if (hasScaleTarget) {
            drawDashedRect(bodyG, -width / 2 - 4, -height / 2 - 4, width + 8, height + 8, 2, 0xf59e0b, 1, [6, 4]);
          }
          bodyG.roundRect(-width / 2, -height / 2, width, height, 2);
          bodyG.fill({ color: fillHex });
          bodyG.stroke({ width: isSelected ? 2.5 : 2, color: isSelected ? 0xffffff : 0x000000 });
          break;
        }
      }
      group.addChild(bodyG);
    }

    if (!isLODOut && hasScaleTarget) {
      const badge = new Graphics();
      badge.roundRect(-45, -radius - 16, 90, 14, 3).fill({ color: 0x0f172a, alpha: 0.9 }).stroke({ width: 1, color: 0xf59e0b });
      group.addChild(badge);
      const txt = makeTextNode(`Portal: ${obj.scaleTarget}`, 8, '#fcd34d', { bold: true, align: 'center', wordWrapWidth: 88 });
      txt.anchor.set(0.5, 0);
      txt.x = 0;
      txt.y = -radius - 14;
      group.addChild(txt);
    }

    if (!isLODOut && (hasHazard || hasResource)) {
      const badge = new Graphics();
      badge
        .roundRect(-40, radius + 4, 80, 12, 3)
        .fill({ color: hasHazard ? 0x991b1b : 0x065f46, alpha: 0.9 })
        .stroke({ width: 1, color: hasHazard ? 0xef4444 : 0x10b981 });
      group.addChild(badge);
      const txt = makeTextNode(
        hasHazard ? (obj.trapState ? `⚠️ ${String(obj.trapState).toUpperCase()}` : '⚠️ Hazard') : '💎 Resource',
        8,
        '#ffffff',
        { bold: true, align: 'center', wordWrapWidth: 78 }
      );
      txt.anchor.set(0.5, 0);
      txt.x = 0;
      txt.y = radius + 5;
      group.addChild(txt);
    }

    if (!isLODOut && (obj.isStoryElement || obj.storyElementType)) {
      const badge = new Graphics();
      badge.roundRect(-45, radius + 4, 90, 14, 3).fill({ color: 0x083344, alpha: 0.95 }).stroke({ width: 1, color: 0x06b6d4 });
      group.addChild(badge);
      const txt = makeTextNode(`📖 ${obj.storyElementType || 'ADE Element'}`, 8, '#67e8f9', { bold: true, align: 'center', wordWrapWidth: 88 });
      txt.anchor.set(0.5, 0);
      txt.x = 0;
      txt.y = radius + 6;
      group.addChild(txt);
    }

    if (!obj.hideLabel && (isSelected || (obj.label !== 'Dense Foliage' && obj.label !== 'Mountain Ridge')) && obj.label) {
      const label = makeTextNode(String(obj.label), 11, '#ffffff', { bold: true, align: 'center', wordWrapWidth: 120 });
      label.anchor.set(0.5, 0);
      label.x = 0;
      label.y = radius + (hasHazard || hasResource || obj.isStoryElement ? 20 : hasScaleTarget ? 8 : 12);
      group.addChild(label);
    }

    // Interactive select / erase / drag / double-click
    if (!isLocked && (isSelect || isEraser)) {
      group.eventMode = 'static';
      group.cursor = isEraser ? 'pointer' : 'grab';
      group.on('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cb.claimPointer();
        if (isEraser) {
          cb.onErase(obj.id);
          return;
        }
        if (cb.checkDoubleClick(`obj:${obj.id}`)) {
          cb.onObjectDoubleClick(obj);
          return;
        }
        cb.onSelect(obj.id);
        const { clientX, clientY } = getClientCoords(e);
        cb.startItemDrag(
          {
            kind: 'object',
            id: obj.id,
            item: obj,
            target: group,
            startX: group.x,
            startY: group.y,
            startClientX: clientX,
            startClientY: clientY
          },
          clientX,
          clientY
        );
      });
    }

    // Selection Transform Resize Handle
    if (isSelected && !isEraser && !isLocked && isSelect) {
      const selFrame = new Graphics();
      drawDashedRect(selFrame, -width / 2 - 4, -height / 2 - 4, width + 8, height + 8, 1.5, 0x22d3ee, 0.85, [4, 4]);
      group.addChild(selFrame);

      const handleSize = Math.max(8, 10 / Math.max(0.5, zoomScale));
      const resizeHandle = new Graphics();
      resizeHandle.rect(-handleSize / 2, -handleSize / 2, handleSize, handleSize);
      resizeHandle.fill({ color: 0x22d3ee });
      resizeHandle.stroke({ width: 1.5, color: 0x020617 });
      resizeHandle.x = width / 2 + 4;
      resizeHandle.y = height / 2 + 4;
      resizeHandle.eventMode = 'static';
      resizeHandle.cursor = 'nwse-resize';
      resizeHandle.on('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cb.claimPointer();
        const { clientX, clientY } = getClientCoords(e);
        cb.startItemDrag(
          {
            kind: 'object-resize',
            id: obj.id,
            item: obj,
            target: resizeHandle,
            startX: resizeHandle.x,
            startY: resizeHandle.y,
            startClientX: clientX,
            startClientY: clientY
          },
          clientX,
          clientY
        );
      });
      group.addChild(resizeHandle);
    }

    container.addChild(group);
  }
}

export function renderWallsLayer(
  container: Container,
  scene: MapMakerSceneData,
  cb: LayerRenderCallbacks
): void {
  clearPixiContainer(container);
  if (!scene.isLayerVisible('layer_walls')) return;

  const isLocked = scene.isLayerLocked('layer_walls');
  const isEraser = scene.activeTool === 'eraser';
  const isSelect = scene.activeTool === 'select';
  const zoomScale = scene.viewport.scale;
  const enableWallShadows = scene.currentMap?.enableWallShadows !== false;

  for (const wall of scene.walls) {
    if (!wall?.p1 || !wall?.p2) continue;
    const { p1, p2 } = wall;
    const isSelected = wall.id === scene.selectedId;
    const style = computeWallStrokeStyle(wall, isSelected);
    const linePoints = tessellateWallLinePoints(wall);
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    const group = new Container();

    // Wall drop shadow pass
    if (enableWallShadows && !style.isOpen) {
      const shadowG = new Graphics();
      const shadowPts = linePoints.map((v, i) => (i % 2 === 0 ? v + 4 : v + 5));
      drawStyledPolyline(shadowG, shadowPts, style.strokeWidth + 4, 0x020617, 0.42);
      shadowG.eventMode = 'none';
      group.addChild(shadowG);
    }

    // Base wall stroke + generous invisible hit stroke for easy click targeting
    const wallG = new Graphics();
    drawStyledPolyline(wallG, linePoints, style.strokeWidth, style.strokeHex, 1, style.dash);
    if (!isLocked && (isSelect || isEraser)) {
      drawStyledPolyline(wallG, linePoints, Math.max(16, style.strokeWidth + 10), style.strokeHex, 0.001);
      wallG.eventMode = 'static';
      wallG.cursor = 'pointer';
      wallG.on('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cb.claimPointer();
        if (isEraser) cb.onErase(wall.id);
        else cb.onSelect(wall.id);
      });
    }
    group.addChild(wallG);

    // Selected Bezier cage
    if (isSelected && !isLocked && wall.bezierControl) {
      const cageG = new Graphics();
      drawStyledPolyline(
        cageG,
        [p1.x, p1.y, wall.bezierControl.x, wall.bezierControl.y, p2.x, p2.y],
        1.5 / Math.max(0.4, zoomScale),
        0xf59e0b,
        0.75,
        [4, 4]
      );
      group.addChild(cageG);
    }

    // Endpoint p1 & p2 handles (draggable when selected)
    const addEndpointHandle = (pt: Point2D, kind: 'wall-p1' | 'wall-p2') => {
      const h = new Graphics();
      const r = isSelected ? 7 / Math.max(0.5, zoomScale) : style.strokeWidth / 2 + 1;
      h.circle(0, 0, r);
      h.fill({ color: isSelected ? 0x22d3ee : style.strokeHex });
      if (isSelected) h.stroke({ width: 2, color: 0x020617 });
      h.x = pt.x;
      h.y = pt.y;
      if (isSelected && !isLocked && isSelect) {
        h.eventMode = 'static';
        h.cursor = 'move';
        h.on('pointerdown', (e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          cb.claimPointer();
          const { clientX, clientY } = getClientCoords(e);
          cb.startItemDrag(
            {
              kind,
              id: wall.id,
              item: wall,
              target: h,
              startX: h.x,
              startY: h.y,
              startClientX: clientX,
              startClientY: clientY
            },
            clientX,
            clientY
          );
        });
      }
      group.addChild(h);
    };

    addEndpointHandle(p1, 'wall-p1');
    addEndpointHandle(p2, 'wall-p2');

    // Quadratic Bezier arc control handle when selected
    if (isSelected && !isLocked && isSelect) {
      const ctrl = new Graphics();
      ctrl.circle(0, 0, 7 / Math.max(0.5, zoomScale));
      ctrl.fill({ color: wall.bezierControl ? 0xf59e0b : 0x38bdf8 });
      ctrl.stroke({ width: 2, color: 0x020617 });
      ctrl.x = wall.bezierControl ? wall.bezierControl.x : midX;
      ctrl.y = wall.bezierControl ? wall.bezierControl.y : midY;
      ctrl.eventMode = 'static';
      ctrl.cursor = 'move';
      ctrl.on('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cb.claimPointer();
        const { clientX, clientY } = getClientCoords(e);
        cb.startItemDrag(
          {
            kind: 'wall-bezier',
            id: wall.id,
            item: wall,
            target: ctrl,
            startX: ctrl.x,
            startY: ctrl.y,
            startClientX: clientX,
            startClientY: clientY
          },
          clientX,
          clientY
        );
      });
      group.addChild(ctrl);
    }

    // Interactive Door midpoint badge
    if (style.isDoor) {
      const doorGroup = new Container();
      doorGroup.x = midX;
      doorGroup.y = midY;
      doorGroup.rotation = angleRad;

      const doorBox = new Graphics();
      doorBox.roundRect(-18, -14, 36, 28, 4);
      doorBox.fill({ color: 0x0f172a, alpha: 0.85 });
      doorBox.stroke({ width: 1.5, color: style.strokeHex });
      doorGroup.addChild(doorBox);

      const doorTxt = makeTextNode(
        style.isOpen ? '🔓 OPEN' : style.isLocked ? '🔒 LOCK' : '🚪 DOOR',
        9,
        style.strokeColor,
        { bold: true, align: 'center' }
      );
      doorTxt.anchor.set(0.5, 0.5);
      doorTxt.x = 0;
      doorTxt.y = 0;
      doorGroup.addChild(doorTxt);

      doorGroup.eventMode = 'static';
      doorGroup.cursor = 'pointer';
      doorGroup.on('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cb.claimPointer();
        if (isEraser && !isLocked) {
          cb.onErase(wall.id);
          return;
        }
        if (wall.doorState === DOOR_STATES.BREACHED) {
          AudioService.playCombatHit?.(false);
        } else if (style.isOpen) {
          AudioService.playTerminalBeep?.(520, 0.05);
        } else {
          AudioService.playTerminalBeep?.(880, 0.05);
        }
        cb.onToggleDoor(wall.id);
      });
      group.addChild(doorGroup);
    }

    // Window crossbar
    if (style.isWindow && typeIsWindow(wall.type)) {
      const winG = new Graphics();
      winG.x = midX;
      winG.y = midY;
      winG.rotation = angleRad;
      winG.moveTo(0, -6).lineTo(0, 6).stroke({ width: 2, color: 0x38bdf8 });
      group.addChild(winG);
    }

    container.addChild(group);
  }
}

function typeIsWindow(t: unknown): boolean {
  return t === WALL_TYPES.WINDOW;
}

export function renderLightsLayer(
  container: Container,
  scene: MapMakerSceneData,
  cb: LayerRenderCallbacks
): void {
  clearPixiContainer(container);
  const isLocked = scene.isLayerLocked('layer_objects');
  const isEraser = scene.activeTool === 'eraser';
  const isSelect = scene.activeTool === 'select';

  for (const lt of scene.lights) {
    if (!lt) continue;
    const isSel = lt.id === scene.selectedId;
    const colHex = parseHexColor(lt.color, 0xf59e0b);
    const r = lt.radius || 180;

    const group = new Container();
    group.x = lt.x || 0;
    group.y = lt.y || 0;

    const halo = new Graphics();
    halo.circle(0, 0, r).fill({ color: colHex, alpha: isSel ? 0.28 : 0.18 });
    halo.circle(0, 0, r * 0.45).fill({ color: colHex, alpha: 0.35 });
    halo.eventMode = 'none';
    group.addChild(halo);

    const core = new Graphics();
    core.circle(0, 0, 10).fill({ color: 0xffffff }).stroke({ width: 3, color: colHex });
    if (!isLocked && (isSelect || isEraser)) {
      core.eventMode = 'static';
      core.cursor = isEraser ? 'pointer' : 'grab';
      core.on('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cb.claimPointer();
        if (isEraser) {
          cb.onErase(lt.id);
          return;
        }
        cb.onSelect(lt.id);
        const { clientX, clientY } = getClientCoords(e);
        cb.startItemDrag(
          {
            kind: 'light',
            id: lt.id,
            item: lt,
            target: group,
            startX: group.x,
            startY: group.y,
            startClientX: clientX,
            startClientY: clientY
          },
          clientX,
          clientY
        );
      });
    }
    group.addChild(core);
    container.addChild(group);
  }
}

export function renderEntitiesLayer(
  container: Container,
  scene: MapMakerSceneData,
  cb: LayerRenderCallbacks
): void {
  clearPixiContainer(container);
  const isEraser = scene.activeTool === 'eraser';
  const isSelect = scene.activeTool === 'select';

  // 1. Annotations (Texts)
  if (scene.isLayerVisible('layer_annotations')) {
    const annLocked = scene.isLayerLocked('layer_annotations');
    for (const txt of scene.texts) {
      if (!txt) continue;
      const isSel = txt.id === scene.selectedId;
      const group = new Container();
      group.x = txt.x || 0;
      group.y = txt.y || 0;

      const textNode = makeTextNode(txt.text || 'Label', txt.fontSize || 16, txt.fill || '#ffffff', { bold: false });
      group.addChild(textNode);

      if (isSel) {
        const box = new Graphics();
        box.rect(-3, -3, textNode.width + 6, textNode.height + 6).stroke({ width: 1.5, color: 0x3b82f6 });
        group.addChild(box);
      }

      if (!annLocked && (isSelect || isEraser)) {
        group.eventMode = 'static';
        group.cursor = isEraser ? 'pointer' : 'grab';
        group.on('pointerdown', (e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          cb.claimPointer();
          if (isEraser) {
            cb.onErase(txt.id);
            return;
          }
          cb.onSelect(txt.id);
          const { clientX, clientY } = getClientCoords(e);
          cb.startItemDrag(
            {
              kind: 'text',
              id: txt.id,
              item: txt,
              target: group,
              startX: group.x,
              startY: group.y,
              startClientX: clientX,
              startClientY: clientY
            },
            clientX,
            clientY
          );
        });
      }
      container.addChild(group);
    }
  }

  // 2. Tokens
  if (scene.isLayerVisible('layer_tokens')) {
    const tokensLocked = scene.isLayerLocked('layer_tokens');

    for (const token of scene.tokens) {
      if (!token) continue;
      const isSel = token.id === scene.selectedId;
      const isLink = token.type === 'link';
      const isHero = token.type === 'hero' || Boolean(token.linkedHeroId);
      const radius = token.radius || 35;
      const health = token.health || token.hp || null;
      const vitality = token.vitality || null;
      const initiative = token.initiative !== undefined && token.initiative !== null ? token.initiative : null;
      const defense = token.defense !== undefined && token.defense !== null ? token.defense : null;
      const conditions: string[] = Array.isArray(token.conditions) ? token.conditions : [];

      const group = new Container();
      group.x = token.x || 0;
      group.y = token.y || 0;

      if (token.haloColor) {
        const halo = new Graphics();
        halo.circle(0, 0, radius + 8).stroke({ width: 4, color: parseHexColor(token.haloColor, 0x22d3ee), alpha: 0.85 });
        group.addChild(halo);
      }

      if (isHero) {
        const ring = new Graphics();
        drawDashedCircle(ring, 0, 0, radius + 3, 1.5, 0x22d3ee, 0.75, [4, 4]);
        group.addChild(ring);
      }

      const imgSrc = token.avatarUrl || token.imageUrl;
      const tex = imgSrc ? requestPixiTexture(imgSrc, cb.onTextureReady) : null;
      const borderHex = isSel ? 0xffffff : isLink ? 0xf59e0b : isHero ? 0x22d3ee : 0x000000;
      const borderWidth = isLink || isHero ? 3 : isSel ? 3 : 1;

      if (tex) {
        const sp = new Sprite(tex);
        sp.anchor.set(0.5);
        sp.width = radius * 2;
        sp.height = radius * 2;
        group.addChild(sp);
        const frame = new Graphics();
        frame.rect(-radius, -radius, radius * 2, radius * 2).stroke({ width: borderWidth, color: borderHex });
        group.addChild(frame);
      } else {
        const body = new Graphics();
        body.circle(0, 0, radius);
        body.fill({ color: parseHexColor(token.fill, isHero ? 0x0e7490 : 0x3b82f6) });
        if (borderWidth > 0 && (isSel || isLink || isHero)) {
          body.stroke({ width: borderWidth, color: borderHex });
        }
        group.addChild(body);
        if (isHero) {
          const initial = makeTextNode(token.label ? String(token.label).charAt(0).toUpperCase() : 'H', radius, '#e0f2fe', {
            bold: true,
            align: 'center'
          });
          initial.anchor.set(0.5, 0.5);
          group.addChild(initial);
        }
      }

      // Health & Vitality bars
      const hasHealth = health && health.max > 0;
      const hasVit = vitality && vitality.max > 0;
      const barG = new Graphics();
      if (hasHealth) {
        const ratio = Math.max(0, Math.min(1, health.current / health.max));
        const hCol = ratio <= 0.25 ? 0xef4444 : ratio <= 0.5 ? 0xf59e0b : 0x10b981;
        const barH = hasVit ? 5 : 6;
        const barY = -radius - (hasVit ? 16 : 12);
        barG.roundRect(-radius, barY, radius * 2, barH, 2.5).fill({ color: 0x0f172a, alpha: 0.85 }).stroke({ width: 1, color: 0x334155 });
        if (ratio > 0) barG.roundRect(-radius, barY, radius * 2 * ratio, barH, 2.5).fill({ color: hCol });
      }
      if (hasVit) {
        const vRatio = Math.max(0, Math.min(1, vitality.current / vitality.max));
        const vCol = vRatio <= 0.25 ? 0xa855f7 : 0x22d3ee;
        const barY = -radius - 9;
        barG.roundRect(-radius, barY, radius * 2, 4, 2).fill({ color: 0x0f172a, alpha: 0.85 }).stroke({ width: 1, color: 0x1e293b });
        if (vRatio > 0) barG.roundRect(-radius, barY, radius * 2 * vRatio, 4, 2).fill({ color: vCol });
      }

      if (initiative !== null) {
        barG.circle(radius - 6, -radius + 4, 10).fill({ color: 0x0f172a }).stroke({ width: 1.5, color: 0xf59e0b });
      }
      if (defense !== null) {
        barG.circle(-radius + 6, -radius + 4, 9).fill({ color: 0x0f172a }).stroke({ width: 1.5, color: 0x0ea5e9 });
      }
      conditions.forEach((cond, idx) => {
        barG.circle(-radius + idx * 10 + 5, radius + 4, 4).fill({ color: parseHexColor(CONDITION_COLORS[cond], 0xffffff) }).stroke({ width: 1, color: 0x000000 });
      });
      if (token.script?.type) {
        barG.circle(radius - 6, radius - 6, 9).fill({ color: 0x0f172a }).stroke({ width: 1.5, color: 0x06b6d4 });
      }
      group.addChild(barG);

      if (initiative !== null) {
        const initTxt = makeTextNode(String(initiative), 10, '#fcd34d', { bold: true, align: 'center' });
        initTxt.anchor.set(0.5);
        initTxt.x = radius - 6;
        initTxt.y = -radius + 4;
        group.addChild(initTxt);
      }
      if (defense !== null) {
        const defTxt = makeTextNode(String(defense), 9, '#7dd3fc', { bold: true, align: 'center' });
        defTxt.anchor.set(0.5);
        defTxt.x = -radius + 6;
        defTxt.y = -radius + 4;
        group.addChild(defTxt);
      }
      if (token.script?.type) {
        const glyph = token.script.type === 'patrol' ? '🚶' : token.script.type === 'sentry' ? '👁️' : token.script.type === 'ambush' ? '🥷' : '🤖';
        const scTxt = makeTextNode(glyph, 9, '#ffffff', { align: 'center' });
        scTxt.anchor.set(0.5);
        scTxt.x = radius - 6;
        scTxt.y = radius - 6;
        group.addChild(scTxt);
      }

      if (token.label) {
        const barOffset = hasHealth && hasVit ? 26 : hasHealth || hasVit ? 20 : 14;
        const lbl = makeTextNode(String(token.label), 12, '#ffffff', { bold: true, align: 'center', wordWrapWidth: radius * 2 + 40 });
        lbl.anchor.set(0.5, 0);
        lbl.x = 0;
        lbl.y = radius + barOffset;
        group.addChild(lbl);
      }

      if (!tokensLocked && (isSelect || isEraser)) {
        group.eventMode = 'static';
        group.cursor = isEraser ? 'pointer' : 'grab';
        group.on('pointerdown', (e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          cb.claimPointer();
          if (isEraser) {
            cb.onErase(token.id);
            return;
          }
          if (cb.checkDoubleClick(`tok:${token.id}`)) {
            cb.onTokenDoubleClick(token);
            return;
          }
          cb.onSelectToken(token.id);
          const { clientX, clientY } = getClientCoords(e);
          cb.startItemDrag(
            {
              kind: 'token',
              id: token.id,
              item: token,
              target: group,
              startX: group.x,
              startY: group.y,
              startClientX: clientX,
              startClientY: clientY
            },
            clientX,
            clientY
          );
        });
      }

      container.addChild(group);
    }
  }

  // 3. SceneRegions
  const regLocked = scene.isLayerLocked('layer_objects');
  for (const rg of scene.regions) {
    if (!rg) continue;
    const b = rg.bounds || { x: 0, y: 0, width: 150, height: 150 };
    const colStr =
      rg.triggerType === 'hazard'
        ? '#f97316'
        : rg.triggerType === 'teleport_deck'
        ? '#22d3ee'
        : rg.triggerType === 'audio_zone'
        ? '#10b981'
        : '#a855f7';
    const colHex = parseHexColor(colStr, 0xa855f7);
    const group = new Container();
    group.x = b.x;
    group.y = b.y;

    const rectG = new Graphics();
    rectG.rect(0, 0, b.width, b.height).fill({ color: colHex, alpha: 0.12 });
    drawDashedRect(rectG, 0, 0, b.width, b.height, rg.id === scene.selectedId ? 2.5 : 1.5, rg.id === scene.selectedId ? 0xffffff : colHex, 1, [8, 4]);
    group.addChild(rectG);

    const lbl = makeTextNode(String(rg.name || rg.triggerType || 'Region'), 10, colStr, { bold: true });
    lbl.x = 6;
    lbl.y = 6;
    group.addChild(lbl);

    if (!regLocked && (isSelect || isEraser)) {
      group.eventMode = 'static';
      group.cursor = isEraser ? 'pointer' : 'grab';
      group.on('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cb.claimPointer();
        if (isEraser) {
          cb.onErase(rg.id);
          return;
        }
        cb.onSelect(rg.id);
        const { clientX, clientY } = getClientCoords(e);
        cb.startItemDrag(
          {
            kind: 'region',
            id: rg.id,
            item: rg,
            target: group,
            startX: group.x,
            startY: group.y,
            startClientX: clientX,
            startClientY: clientY
          },
          clientX,
          clientY
        );
      });
    }
    container.addChild(group);
  }
}

export function renderRoofLayer(
  container: Container,
  scene: MapMakerSceneData,
  cb: LayerRenderCallbacks
): void {
  clearPixiContainer(container);
  if (!scene.isLayerVisible('layer_roof')) return;

  container.alpha = scene.paintRoofLayer ? 0.92 : 0.65;
  renderTerrainListIntoContainer(
    container,
    scene.terrains.filter((t) => Boolean(t?.isRoofLayer)),
    scene.activeTool === 'eraser',
    scene.isLayerLocked('layer_roof'),
    cb
  );
}

export function renderFogLayer(
  container: Container,
  scene: MapMakerSceneData,
  cb: LayerRenderCallbacks
): void {
  clearPixiContainer(container);
  if (!scene.isLayerVisible('layer_fog')) return;

  const isLocked = scene.isLayerLocked('layer_fog');
  const isEraser = scene.activeTool === 'eraser';
  const gridSz = scene.currentMap?.gridSize || scene.gridSize || 50;

  if (scene.fogEnabled) {
    const fw = Math.max(4000, (scene.currentMap?.gridWidth || 40) * gridSz);
    const fh = Math.max(3000, (scene.currentMap?.gridHeight || 30) * gridSz);
    const fogG = new Graphics();
    fogG.rect(0, 0, fw, fh);
    fogG.fill({ color: 0x000000, alpha: 0.75 });
    if (Array.isArray(scene.visibilityPolygon) && scene.visibilityPolygon.length >= 6) {
      try {
        fogG.poly(scene.visibilityPolygon);
        fogG.cut();
      } catch {
        // Fallback silently to uncut fog overlay if polygon self-intersects
      }
    }
    fogG.eventMode = 'none';
    container.addChild(fogG);
  }

  for (const f of scene.fog) {
    if (!Array.isArray(f?.points) || f.points.length < 4) continue;
    const g = new Graphics();
    drawStyledPolyline(g, f.points, 50, 0x000000, 1);
    if (isEraser && !isLocked && f.id) {
      g.eventMode = 'static';
      g.cursor = 'pointer';
      g.on('pointerdown', (e) => {
        e.stopPropagation();
        cb.claimPointer();
        cb.onErase(f.id);
      });
    }
    container.addChild(g);
  }
}

export function renderForegroundOverlayLayer(
  container: Container,
  scene: MapMakerSceneData
): void {
  clearPixiContainer(container);
  const zoomScale = Math.max(0.2, scene.viewport.scale);

  // 0. Live drawing preview for straight/curved wall (isolated in fgLayer for zero world-rebuild drag lag)
  if (
    (scene.activeTool === 'wall' || scene.activeTool === 'curved_wall') &&
    scene.wallStartPoint &&
    scene.wallPreviewEnd
  ) {
    const previewPts = scene.computeWallPreviewPoints(
      scene.wallStartPoint,
      scene.wallPreviewEnd,
      scene.activeTool === 'curved_wall'
    );
    const previewHex =
      scene.selectedWallType === 'door'
        ? 0xf59e0b
        : scene.selectedWallType === 'window'
        ? 0x38bdf8
        : scene.selectedWallType === 'ethereal'
        ? 0xc084fc
        : 0x22d3ee;
    const prevG = new Graphics();
    drawStyledPolyline(prevG, previewPts, 5, previewHex, 0.9, [6, 4]);
    container.addChild(prevG);
  }

  // 1. Shift+Drag Chunk Capture Marquee
  if (scene.chunkCaptureMarquee) {
    const mq = scene.chunkCaptureMarquee;
    const x = Math.min(mq.startX, mq.endX);
    const y = Math.min(mq.startY, mq.endY);
    const w = Math.abs(mq.endX - mq.startX);
    const h = Math.abs(mq.endY - mq.startY);
    const g = new Graphics();
    g.rect(x, y, w, h).fill({ color: 0x10b981, alpha: 0.14 });
    drawDashedRect(g, x, y, w, h, 2, 0x10b981, 1, [8, 4]);
    container.addChild(g);

    const txt = makeTextNode('CAPTURE REGION AS MAP CHUNK', 11, '#34d399', { bold: true, fontFamily: 'monospace' });
    txt.x = x + 6;
    txt.y = y - 18;
    container.addChild(txt);
  }

  // 2. Chunk Stamp Ghost Preview & Magnetic Snap Sockets
  if (scene.activeTool === 'chunk' && scene.chunkGhostPreviewData?.transformedBlueprint) {
    const { originX, originY, transformedBlueprint, snapCandidate, worldSockets = [] } = scene.chunkGhostPreviewData;
    const gSize = Math.max(15, scene.gridSize || 50);
    const widthPx = transformedBlueprint.widthCells * gSize;
    const heightPx = transformedBlueprint.heightCells * gSize;
    const northSide = transformedBlueprint.northSide || 'N';
    const cg = new Graphics();

    for (const t of transformedBlueprint.tiles || []) {
      cg.rect(originX + t.col * gSize, originY + t.row * gSize, gSize, gSize)
        .fill({ color: parseHexColor(t.color, 0x334155), alpha: 0.55 })
        .stroke({ width: 1, color: 0x38bdf8, alpha: 0.35 });
    }
    for (const a of transformedBlueprint.assets || []) {
      cg.roundRect(
        originX + a.col * gSize + 4,
        originY + a.row * gSize + 4,
        (a.widthCells || 1) * gSize - 8,
        (a.heightCells || 1) * gSize - 8,
        4
      ).fill({ color: parseHexColor(a.color, 0x38bdf8), alpha: 0.7 });
    }
    for (const cp of (transformedBlueprint.constructionPoints || []).filter((c: any) => c.kind === 'internal_slot')) {
      const [fw = 1, fh = 1] = cp.footprintCells || [1, 1];
      cg.circle(originX + (cp.col + fw / 2) * gSize, originY + (cp.row + fh / 2) * gSize, Math.min(fw, fh) * gSize * 0.28)
        .fill({ color: parseHexColor(cp.defaultColor, 0x22d3ee), alpha: 0.8 })
        .stroke({ width: 1.5, color: 0xffffff });
    }
    for (const w of transformedBlueprint.walls || []) {
      const col = w.type === 'door' ? 0xf59e0b : w.type === 'window' ? 0x38bdf8 : 0xe2e8f0;
      drawStyledPolyline(
        cg,
        [originX + w.p1.x * gSize, originY + w.p1.y * gSize, originX + w.p2.x * gSize, originY + w.p2.y * gSize],
        w.type === 'door' ? 6 : 4,
        col,
        0.85,
        w.type === 'door' ? [8, 4] : undefined
      );
    }

    drawDashedRect(cg, originX, originY, widthPx, heightPx, snapCandidate ? 3 : 2, snapCandidate ? 0x10b981 : 0x38bdf8, 1, [10, 5]);

    for (const sock of worldSockets) {
      const targetMid = snapCandidate?.targetSocket?.worldMid;
      const draggedMid = snapCandidate?.draggedSocket?.worldMid || snapCandidate?.placedSocket?.worldMid;
      const isMatched = Boolean(
        snapCandidate &&
          ((draggedMid && Math.hypot(sock.worldMid.x - draggedMid.x, sock.worldMid.y - draggedMid.y) < 12) ||
            (targetMid && Math.hypot(sock.worldMid.x - targetMid.x, sock.worldMid.y - targetMid.y) < 12))
      );
      if (isMatched) {
        drawDashedCircle(cg, sock.worldMid.x, sock.worldMid.y, 13, 2, 0x10b981, 1, [4, 3]);
      }
      cg.circle(sock.worldMid.x, sock.worldMid.y, isMatched ? 8 : 6)
        .fill({ color: isMatched ? 0x10b981 : 0xf59e0b })
        .stroke({ width: 2, color: isMatched ? 0x052e16 : 0x451a03 });
    }

    if (snapCandidate) {
      const sx = snapCandidate.targetSocket.worldMid.x;
      const sy = snapCandidate.targetSocket.worldMid.y;
      const snapCol = snapCandidate.mismatchWarning ? 0xf59e0b : 0x10b981;
      cg.circle(sx, sy, 16).fill({ color: snapCol, alpha: 0.35 }).stroke({ width: 3, color: snapCol });
    }
    container.addChild(cg);

    if (snapCandidate) {
      const snapText = snapCandidate.mismatchWarning
        ? `⚠ SNAP ${snapCandidate.snapAngleDeg ?? 0}° (${snapCandidate.mismatchWarning})`
        : typeof snapCandidate.distancePx === 'number'
        ? `⚡ SOCKET SNAP ${snapCandidate.snapAngleDeg ?? 0}° (${Math.round(snapCandidate.distancePx)}px)`
        : `⚡ SOCKET SNAP ${snapCandidate.snapAngleDeg ?? 0}° & WELD`;
      const sLbl = makeTextNode(snapText, 11, snapCandidate.mismatchWarning ? '#fbbf24' : '#34d399', { bold: true, fontFamily: 'monospace' });
      sLbl.x = snapCandidate.targetSocket.worldMid.x - 90;
      sLbl.y = snapCandidate.targetSocket.worldMid.y - 30;
      container.addChild(sLbl);
    }

    let northBadgeX = originX + widthPx / 2 - 48;
    let northBadgeY = originY - 22;
    if (northSide === 'S') {
      northBadgeY = originY + heightPx + 6;
    } else if (northSide === 'E') {
      northBadgeX = originX + widthPx + 6;
      northBadgeY = originY + heightPx / 2 - 9;
    } else if (northSide === 'W') {
      northBadgeX = originX - 102;
      northBadgeY = originY + heightPx / 2 - 9;
    }
    const northLabel = northSide === 'N' ? 'NORTH ▲' : northSide === 'E' ? 'NORTH ▶' : northSide === 'S' ? 'NORTH ▼' : 'NORTH ◀';
    const badge = new Graphics();
    badge.roundRect(northBadgeX, northBadgeY, 96, 18, 9).fill({ color: 0xf59e0b }).stroke({ width: 1.5, color: 0x0f172a });
    container.addChild(badge);
    const nTxt = makeTextNode(`${northLabel} (${northSide})`, 10, '#020617', { bold: true, fontFamily: 'monospace', align: 'center' });
    nTxt.anchor.set(0.5, 0.5);
    nTxt.x = northBadgeX + 48;
    nTxt.y = northBadgeY + 9;
    container.addChild(nTxt);
  }

  // 3. Waypoint Locomotion Ruler Overlay
  const stats = computeRulerPaceStats(
    scene.rulerWaypoints,
    scene.rulerPointer,
    scene.gridSize,
    scene.measurementUnit || 'meters'
  );
  if (stats) {
    const rg = new Graphics();
    drawStyledPolyline(rg, stats.flatPoints, 3 / zoomScale, stats.pathHex, 1, [8 / zoomScale, 4 / zoomScale]);
    stats.points.forEach((pt, idx) => {
      const col = idx === 0 ? 0x38bdf8 : idx === stats.points.length - 1 ? stats.pathHex : 0xf8fafc;
      rg.circle(pt.x, pt.y, 6 / zoomScale).fill({ color: col }).stroke({ width: 1.5 / zoomScale, color: 0x0f172a });
    });
    const lastPt = stats.points[stats.points.length - 1]!;
    const bx = lastPt.x + 15 / zoomScale;
    const by = lastPt.y - 25 / zoomScale;
    rg.roundRect(bx, by, 148 / zoomScale, 42 / zoomScale, 6 / zoomScale)
      .fill({ color: 0x0f172a, alpha: 0.92 })
      .stroke({ width: 1.5 / zoomScale, color: stats.pathHex });
    container.addChild(rg);

    const distTxt = makeTextNode(
      `📏 ${stats.formattedDistance}`,
      11 / zoomScale,
      '#f8fafc',
      { bold: true }
    );
    distTxt.x = bx + 6 / zoomScale;
    distTxt.y = by + 6 / zoomScale;
    container.addChild(distTxt);

    const paceTxt = makeTextNode(`🏃 Pace: ${stats.paceTier}`, 10 / zoomScale, stats.pathColor, { bold: true });
    paceTxt.x = bx + 6 / zoomScale;
    paceTxt.y = by + 22 / zoomScale;
    container.addChild(paceTxt);
  }

  // 4. Tactical Radar Pings
  for (const ping of scene.activePings) {
    if (!ping) continue;
    const pCol = parseHexColor(ping.color, 0x06b6d4);
    const pg = new Graphics();
    pg.circle(ping.x, ping.y, 30).stroke({ width: 2, color: pCol, alpha: 0.7 });
    pg.circle(ping.x, ping.y, 14).fill({ color: pCol, alpha: 0.6 });
    container.addChild(pg);
    const pLbl = makeTextNode(`${ping.icon || ''} ${ping.label || ''}`.trim(), 12, '#ffffff', { bold: true, align: 'center', wordWrapWidth: 120 });
    pLbl.anchor.set(0.5, 0);
    pLbl.x = ping.x;
    pLbl.y = ping.y - 28;
    container.addChild(pLbl);
  }
}
