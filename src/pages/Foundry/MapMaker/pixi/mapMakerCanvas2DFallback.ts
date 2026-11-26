/**
 * @file mapMakerCanvas2DFallback.ts
 * @description Headless / non-WebGL Canvas2D fallback renderer for MapMakerPixiCanvas.
 * Ensures MapMaker renders faithfully in jsdom tests or software-only environments and supports
 * click/hit-testing for walls, doors, objects, tokens, lights, texts, and regions.
 */

import { drawSquareGridOnCanvas, drawHexGridOnCanvas } from '../map/gridGeometry.js';
import { getLoadedImage, getTextureUrlFromColor } from '../map/MapTextures.js';
import { getBiomeTextureUrl } from '../map/landmassGenerator.js';
import {
  CONDITION_COLORS,
  computeWallStrokeStyle,
  tessellateWallLinePoints,
  computeRulerPaceStats,
  buildRegularPolygonPoints,
  hexToRgbaString,
  type Point2D
} from './mapMakerPixiHelpers.js';
import type { LiveDragPreview } from './mapMakerLayerRenderers.ts';

export interface FallbackHitResult {
  kind: 'wall-p1' | 'wall-p2' | 'wall-bezier' | 'door' | 'wall' | 'object' | 'token' | 'light' | 'text' | 'region';
  id: string;
  item: any;
}

function drawCanvas2DPolyline(
  ctx: CanvasRenderingContext2D,
  pts: number[],
  strokeStyle: string,
  lineWidth: number,
  dash?: number[],
  closed = false,
  fillStyle?: string
): void {
  if (!Array.isArray(pts) || pts.length < 4) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0] ?? 0, pts[1] ?? 0);
  for (let i = 2; i < pts.length; i += 2) {
    ctx.lineTo(pts[i] ?? 0, pts[i + 1] ?? 0);
  }
  if (closed) ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (dash && dash.length >= 2) {
    ctx.setLineDash?.(dash);
  }
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

export function renderMapMakerFallback2D(
  canvas: HTMLCanvasElement,
  params: {
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
    liveDragPreview?: LiveDragPreview | null;
    isLayerVisible: (id: string) => boolean;
    onImageLoaded?: () => void;
  }
): void {
  const ctx = canvas.getContext?.('2d');
  if (!ctx) return;

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
    measurementUnit = 'meters',
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
    isLayerVisible,
    onImageLoaded
  } = params;

  const mapWidth = currentMap?.width || 2800;
  const mapHeight = currentMap?.height || 2100;
  const hasVideo = Boolean(currentMap?.videoBackgroundUrl);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (!hasVideo) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.setTransform(scale, 0, 0, scale, position.x, position.y);

  // Underlay image
  if (currentMap?.underlay?.url && currentMap?.underlay?.mediaType !== 'video' && currentMap?.underlay?.visible !== false) {
    const img = getLoadedImage(currentMap.underlay.url, () => onImageLoaded?.());
    if (img && img.complete && img.naturalWidth > 0) {
      const uScale = Number(currentMap.underlay.scale || 1);
      ctx.save();
      ctx.globalAlpha = currentMap.underlay.opacity ?? 0.5;
      ctx.drawImage(
        img,
        Number(currentMap.underlay.offsetX || 0),
        Number(currentMap.underlay.offsetY || 0),
        (img.naturalWidth || mapWidth) * uScale,
        (img.naturalHeight || mapHeight) * uScale
      );
      ctx.restore();
    }
  }

  // Sector Frame
  ctx.save();
  ctx.setLineDash?.([12, 6]);
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
  ctx.lineWidth = 2 / Math.max(0.1, scale);
  ctx.strokeRect(0, 0, mapWidth, mapHeight);
  ctx.restore();

  // Culled Grid
  const viewport = { x: position.x, y: position.y, width, height, scale };
  if (gridMode === 'square') {
    drawSquareGridOnCanvas(ctx, viewport, gridSize, { scale });
  } else if (gridMode === 'hex') {
    drawHexGridOnCanvas(ctx, viewport, gridSize, { scale });
  }

  // Ground Terrains + Lines
  if (isLayerVisible('layer_terrain')) {
    for (const t of terrains.filter((item) => !item?.isRoofLayer)) {
      if (t.renderType === 'canvasImage' && t.imageUrl) {
        const img = getLoadedImage(t.imageUrl, () => onImageLoaded?.());
        if (img && img.complete) {
          ctx.drawImage(img, t.x || 0, t.y || 0, t.width || 100, t.height || 100);
        }
        continue;
      }
      const texUrl = t.textureUrl || getBiomeTextureUrl(t.biomeType || t.terrainTypeId) || getTextureUrlFromColor(t.color || t.terrainTypeId);
      if (texUrl) getLoadedImage(texUrl, () => onImageLoaded?.());
      if (t.renderType === 'hexTile' && t.x !== undefined && t.y !== undefined) {
        const pts = buildRegularPolygonPoints(t.x, t.y, t.radius || gridSize || 50, 6);
        drawCanvas2DPolyline(ctx, pts, 'rgba(0, 0, 0, 0.2)', 1, undefined, true, t.color || '#15803d');
      } else if (t.renderType === 'rect') {
        ctx.fillStyle = t.color || '#15803d';
        ctx.fillRect(t.x || 0, t.y || 0, t.width || 40, t.height || 40);
      } else if (Array.isArray(t.points) && t.points.length >= 4) {
        if (t.softEdge) {
          drawCanvas2DPolyline(ctx, t.points, hexToRgbaString(t.color, 0.22, '#15803d'), (t.strokeWidth || 30) + 18);
        }
        drawCanvas2DPolyline(
          ctx,
          t.points,
          t.color || '#15803d',
          t.strokeWidth || 30,
          undefined,
          Boolean(t.closed || t.renderType === 'polygon'),
          t.closed || t.renderType === 'polygon' ? t.color : undefined
        );
      }
    }

    for (const l of lines) {
      drawCanvas2DPolyline(ctx, l.points || [], l.stroke || l.color || '#ef4444', l.strokeWidth || 5, undefined, Boolean(l.closed));
    }
  }

  // Interactive Objects
  if (isLayerVisible('layer_objects')) {
    for (const obj of objects) {
      const r = obj.radius || 25;
      const w = obj.width || r * 2;
      const h = obj.height || r * 2;
      const ox = obj.x || 0;
      const oy = obj.y || 0;
      const isSel = obj.id === selectedId;
      const objImg = obj.imageUrl ? getLoadedImage(obj.imageUrl, () => onImageLoaded?.()) : null;
      ctx.save();
      if (objImg && objImg.complete && objImg.naturalWidth > 0) {
        ctx.drawImage(objImg, ox - w / 2, oy - h / 2, w, h);
        if (isSel) {
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 3;
          ctx.strokeRect(ox - w / 2, oy - h / 2, w, h);
        }
      } else {
        ctx.fillStyle = obj.color || '#3b82f6';
        ctx.strokeStyle = isSel ? '#ffffff' : '#000000';
        ctx.lineWidth = isSel ? 3 : 2;
        if (obj.shape === 'circle' || obj.shape === 'star' || obj.shape === 'cloud') {
          ctx.beginPath();
          ctx.arc(ox, oy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(ox - w / 2, oy - h / 2, w, h);
          ctx.strokeRect(ox - w / 2, oy - h / 2, w, h);
        }
      }
      ctx.restore();
    }
  }

  // Walls & Doors
  if (isLayerVisible('layer_walls')) {
    const wallShadows = currentMap?.enableWallShadows !== false;
    for (const wall of walls) {
      if (!wall?.p1 || !wall?.p2) continue;
      const isSel = wall.id === selectedId;
      const style = computeWallStrokeStyle(wall, isSel);
      const pts = tessellateWallLinePoints(wall);
      if (wallShadows && !style.isOpen) {
        const shadowPts = pts.map((val, idx) => (idx % 2 === 0 ? val + 4 : val + 5));
        drawCanvas2DPolyline(ctx, shadowPts, 'rgba(2, 6, 23, 0.42)', style.strokeWidth + 4);
      }
      drawCanvas2DPolyline(ctx, pts, style.strokeColor, style.strokeWidth, style.dash);
    }

    if (
      (activeTool === 'wall' || activeTool === 'curved_wall') &&
      wallStartPoint &&
      wallPreviewEnd
    ) {
      const previewPts = computeWallPreviewPoints(wallStartPoint, wallPreviewEnd, activeTool === 'curved_wall');
      const col = selectedWallType === 'door' ? '#f59e0b' : selectedWallType === 'window' ? '#38bdf8' : selectedWallType === 'ethereal' ? '#c084fc' : '#22d3ee';
      drawCanvas2DPolyline(ctx, previewPts, col, 5, [6, 4]);
    }
  }

  // Lights
  if (isLayerVisible('layer_objects')) {
    for (const lt of lights) {
      const r = lt.radius || 180;
      ctx.save();
      ctx.fillStyle = hexToRgbaString(lt.color, lt.id === selectedId ? 0.28 : 0.18, '#f59e0b');
      ctx.beginPath();
      ctx.arc(lt.x || 0, lt.y || 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = lt.color || '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(lt.x || 0, lt.y || 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // Tokens
  if (isLayerVisible('layer_tokens')) {
    for (const tk of tokens) {
      const r = tk.radius || 35;
      const isSel = tk.id === selectedId;
      const tkSrc = tk.avatarUrl || tk.imageUrl;
      const tkImg = tkSrc ? getLoadedImage(tkSrc, () => onImageLoaded?.()) : null;
      ctx.save();
      if (tkImg && tkImg.complete && tkImg.naturalWidth > 0) {
        ctx.beginPath();
        ctx.arc(tk.x || 0, tk.y || 0, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(tkImg, (tk.x || 0) - r, (tk.y || 0) - r, r * 2, r * 2);
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = isSel ? '#ffffff' : '#22d3ee';
        ctx.lineWidth = isSel ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(tk.x || 0, tk.y || 0, r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = tk.fill || (tk.type === 'hero' ? '#0e7490' : '#3b82f6');
        ctx.strokeStyle = isSel ? '#ffffff' : '#22d3ee';
        ctx.lineWidth = isSel ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(tk.x || 0, tk.y || 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      const conds: string[] = Array.isArray(tk.conditions) ? tk.conditions : [];
      conds.forEach((c, idx) => {
        ctx.fillStyle = CONDITION_COLORS[c] || '#ffffff';
        ctx.beginPath();
        ctx.arc((tk.x || 0) - r + idx * 10 + 5, (tk.y || 0) + r + 4, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // Annotations
  if (isLayerVisible('layer_annotations')) {
    for (const txt of texts) {
      ctx.save();
      ctx.fillStyle = txt.fill || '#ffffff';
      ctx.font = `bold ${txt.fontSize || 16}px sans-serif`;
      ctx.fillText(txt.text || 'Label', txt.x || 0, (txt.y || 0) + (txt.fontSize || 16));
      ctx.restore();
    }
  }

  // Regions
  if (isLayerVisible('layer_objects')) {
    for (const rg of regions) {
      const b = rg.bounds || { x: 0, y: 0, width: 150, height: 150 };
      const col = rg.triggerType === 'hazard' ? '#f97316' : rg.triggerType === 'teleport_deck' ? '#22d3ee' : rg.triggerType === 'audio_zone' ? '#10b981' : '#a855f7';
      ctx.save();
      ctx.fillStyle = hexToRgbaString(col, 0.12);
      ctx.strokeStyle = rg.id === selectedId ? '#ffffff' : col;
      ctx.setLineDash?.([8, 4]);
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.strokeRect(b.x, b.y, b.width, b.height);
      ctx.restore();
    }
  }

  // Roof Canopy Layer
  if (isLayerVisible('layer_roof')) {
    ctx.save();
    ctx.globalAlpha = paintRoofLayer ? 0.92 : 0.65;
    for (const rt of terrains.filter((item) => Boolean(item?.isRoofLayer))) {
      drawCanvas2DPolyline(ctx, rt.points || [], rt.color || '#334155', rt.strokeWidth || 30);
    }
    ctx.restore();
  }

  // Fog of War
  if (isLayerVisible('layer_fog')) {
    if (fogEnabled) {
      ctx.save();
      const fw = Math.max(4000, (currentMap?.gridWidth || 40) * (currentMap?.gridSize || gridSize || 50));
      const fh = Math.max(3000, (currentMap?.gridHeight || 30) * (currentMap?.gridSize || gridSize || 50));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, fw, fh);
      if (Array.isArray(visibilityPolygon) && visibilityPolygon.length >= 6) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(visibilityPolygon[0] ?? 0, visibilityPolygon[1] ?? 0);
        for (let i = 2; i < visibilityPolygon.length; i += 2) {
          ctx.lineTo(visibilityPolygon[i] ?? 0, visibilityPolygon[i + 1] ?? 0);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    for (const f of fog) {
      drawCanvas2DPolyline(ctx, f.points || [], '#000000', 50);
    }
  }

  // Live Drag Preview
  if (liveDragPreview?.kind === 'wall-edit') {
    const pts = tessellateWallLinePoints({
      p1: liveDragPreview.p1,
      p2: liveDragPreview.p2,
      ...(liveDragPreview.bezierControl ? { bezierControl: liveDragPreview.bezierControl } : {})
    });
    drawCanvas2DPolyline(ctx, pts, '#22d3ee', 5, [6, 4]);
  } else if (liveDragPreview?.kind === 'object-resize') {
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash?.([6, 4]);
    ctx.strokeRect(
      liveDragPreview.x - liveDragPreview.width / 2,
      liveDragPreview.y - liveDragPreview.height / 2,
      liveDragPreview.width,
      liveDragPreview.height
    );
    ctx.restore();
  }

  // Ruler + Chunk Marquee + Pings
  const rulerStats = computeRulerPaceStats(rulerWaypoints, rulerPointer, gridSize, measurementUnit, rulerSelectedPace);
  if (rulerStats) {
    drawCanvas2DPolyline(ctx, rulerStats.flatPoints, rulerStats.pathColor, 3 / Math.max(0.2, scale), [8, 4]);
  }
  if (chunkCaptureMarquee) {
    const mx = Math.min(chunkCaptureMarquee.startX, chunkCaptureMarquee.endX);
    const my = Math.min(chunkCaptureMarquee.startY, chunkCaptureMarquee.endY);
    const mw = Math.abs(chunkCaptureMarquee.endX - chunkCaptureMarquee.startX);
    const mh = Math.abs(chunkCaptureMarquee.endY - chunkCaptureMarquee.startY);
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.strokeStyle = '#10b981';
    ctx.setLineDash?.([8, 4]);
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeRect(mx, my, mw, mh);
    ctx.restore();
  }
  if (activeTool === 'chunk' && chunkGhostPreviewData?.transformedBlueprint) {
    const { originX, originY, transformedBlueprint, snapCandidate } = chunkGhostPreviewData;
    const gSz = Math.max(15, gridSize || 50);
    ctx.save();
    ctx.strokeStyle = snapCandidate ? '#10b981' : '#38bdf8';
    ctx.setLineDash?.([10, 5]);
    ctx.strokeRect(originX, originY, transformedBlueprint.widthCells * gSz, transformedBlueprint.heightCells * gSz);
    ctx.restore();
  }
  for (const ping of activePings) {
    ctx.save();
    ctx.strokeStyle = ping.color || '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ping.x || 0, ping.y || 0, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Simple hit-test for Canvas2D fallback mode so click-to-select/erase/toggle-door works without WebGL.
 */
export function hitTestMapMakerFallback(
  worldPos: Point2D,
  scene: {
    walls: any[];
    tokens: any[];
    objects: any[];
    lights: any[];
    texts: any[];
    regions: any[];
    selectedId: string | null;
    isLayerLocked: (id: string) => boolean;
    isLayerVisible: (id: string) => boolean;
  }
): FallbackHitResult | null {
  const { walls, tokens, objects, lights, texts, regions, selectedId, isLayerLocked, isLayerVisible } = scene;

  if (isLayerVisible('layer_walls') && !isLayerLocked('layer_walls') && selectedId) {
    const selWall = walls.find((w) => w.id === selectedId);
    if (selWall?.p1 && selWall?.p2) {
      const mx = (selWall.p1.x + selWall.p2.x) / 2;
      const my = (selWall.p1.y + selWall.p2.y) / 2;
      const bx = selWall.bezierControl?.x ?? mx;
      const by = selWall.bezierControl?.y ?? my;
      if (Math.hypot(worldPos.x - selWall.p1.x, worldPos.y - selWall.p1.y) <= 12) return { kind: 'wall-p1', id: selWall.id, item: selWall };
      if (Math.hypot(worldPos.x - selWall.p2.x, worldPos.y - selWall.p2.y) <= 12) return { kind: 'wall-p2', id: selWall.id, item: selWall };
      if (Math.hypot(worldPos.x - bx, worldPos.y - by) <= 12) return { kind: 'wall-bezier', id: selWall.id, item: selWall };
    }
  }

  if (isLayerVisible('layer_tokens')) {
    for (let i = tokens.length - 1; i >= 0; i--) {
      const tk = tokens[i];
      if (!tk) continue;
      if (Math.hypot(worldPos.x - (tk.x || 0), worldPos.y - (tk.y || 0)) <= (tk.radius || 35) + 4) {
        return { kind: 'token', id: tk.id, item: tk };
      }
    }
  }

  if (isLayerVisible('layer_objects')) {
    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      if (!o) continue;
      const hw = (o.width || (o.radius || 25) * 2) / 2;
      const hh = (o.height || (o.radius || 25) * 2) / 2;
      if (Math.abs(worldPos.x - (o.x || 0)) <= hw + 4 && Math.abs(worldPos.y - (o.y || 0)) <= hh + 4) {
        return { kind: 'object', id: o.id, item: o };
      }
    }
  }

  if (isLayerVisible('layer_walls')) {
    for (let i = walls.length - 1; i >= 0; i--) {
      const w = walls[i];
      if (!w?.p1 || !w?.p2) continue;
      const mx = (w.p1.x + w.p2.x) / 2;
      const my = (w.p1.y + w.p2.y) / 2;
      if (w.type === 'door' && Math.hypot(worldPos.x - mx, worldPos.y - my) <= 22) {
        return { kind: 'door', id: w.id, item: w };
      }
      const dx = w.p2.x - w.p1.x;
      const dy = w.p2.y - w.p1.y;
      const lenSq = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((worldPos.x - w.p1.x) * dx + (worldPos.y - w.p1.y) * dy) / lenSq));
      const px = w.p1.x + t * dx;
      const py = w.p1.y + t * dy;
      if (Math.hypot(worldPos.x - px, worldPos.y - py) <= 10) {
        return { kind: 'wall', id: w.id, item: w };
      }
    }
  }

  for (let i = lights.length - 1; i >= 0; i--) {
    const lt = lights[i];
    if (lt && Math.hypot(worldPos.x - (lt.x || 0), worldPos.y - (lt.y || 0)) <= 16) {
      return { kind: 'light', id: lt.id, item: lt };
    }
  }

  if (isLayerVisible('layer_annotations')) {
    for (let i = texts.length - 1; i >= 0; i--) {
      const txt = texts[i];
      if (!txt) continue;
      const fs = txt.fontSize || 16;
      const w = Math.max(60, String(txt.text || 'Label').length * fs * 0.6);
      if (worldPos.x >= (txt.x || 0) - 4 && worldPos.x <= (txt.x || 0) + w && worldPos.y >= (txt.y || 0) - 4 && worldPos.y <= (txt.y || 0) + fs + 8) {
        return { kind: 'text', id: txt.id, item: txt };
      }
    }
  }

  for (let i = regions.length - 1; i >= 0; i--) {
    const rg = regions[i];
    const b = rg?.bounds;
    if (rg && b && worldPos.x >= b.x && worldPos.x <= b.x + b.width && worldPos.y >= b.y && worldPos.y <= b.y + b.height) {
      return { kind: 'region', id: rg.id, item: rg };
    }
  }

  return null;
}
