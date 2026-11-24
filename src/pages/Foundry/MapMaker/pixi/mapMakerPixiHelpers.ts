/**
 * @file mapMakerPixiHelpers.ts
 * @description Shared color, geometry, PixiJS v8 vector/grid drawing, texture caching,
 * wall styling, and waypoint locomotion math helpers for MapMaker PixiJS v8 rendering
 * and Canvas2D headless fallback.
 */

import { Graphics, Texture, type Rectangle } from 'pixi.js';
import { getLoadedImage } from '../map/MapTextures.js';
import { computeVisibleGridBounds } from '../map/gridGeometry.js';
import { WALL_TYPES, DOOR_STATES, tessellateBezierWall } from '../../../../schemas/vttWallSchema.js';

export const CONDITION_COLORS: Record<string, string> = {
  Stunned: '#ef4444',
  Shielded: '#3b82f6',
  Cover: '#10b981',
  Invisible: '#a855f7',
  Poisoned: '#84cc16'
};

export interface Point2D {
  x: number;
  y: number;
}

export interface ViewportState {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface WallStyleInfo {
  strokeColor: string;
  strokeHex: number;
  strokeWidth: number;
  dash: number[] | undefined;
  isDoor: boolean;
  isWindow: boolean;
  isEthereal: boolean;
  isOpen: boolean;
  isLocked: boolean;
}

/**
 * Parses a CSS hex (#rrggbb or #rgb) or numeric color into a 24-bit Pixi integer color.
 */
export function parseHexColor(color: unknown, fallback = 0x3b82f6): number {
  if (typeof color === 'number' && Number.isFinite(color)) return color & 0xffffff;
  if (typeof color === 'string') {
    const clean = color.trim().replace(/^#/, '');
    if (clean.length === 3) {
      const r = clean.charAt(0);
      const g = clean.charAt(1);
      const b = clean.charAt(2);
      const parsedShort = parseInt(`${r}${r}${g}${g}${b}${b}`, 16);
      if (Number.isFinite(parsedShort)) return parsedShort & 0xffffff;
    }
    if (clean.length >= 6) {
      const parsed = parseInt(clean.slice(0, 6), 16);
      if (Number.isFinite(parsed)) return parsed & 0xffffff;
    }
  }
  return fallback;
}

/**
 * Converts a hex color string/number into an rgba() CSS string for Canvas2D fallback.
 */
export function hexToRgbaString(color: unknown, alpha = 1, fallback = '#3b82f6'): string {
  const num = parseHexColor(color, parseHexColor(fallback, 0x3b82f6));
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/**
 * Computes canonical wall stroke color, width, dash, and state flags uniformly.
 */
export function computeWallStrokeStyle(wall: any, isSelected = false): WallStyleInfo {
  const type = wall?.type;
  const doorState = wall?.doorState;
  const isOpen = Boolean(wall?.isOpen || doorState === DOOR_STATES.OPEN || doorState === DOOR_STATES.BREACHED);
  const isDoor = type === WALL_TYPES.DOOR;
  const isWindow = type === WALL_TYPES.WINDOW;
  const isEthereal = type === WALL_TYPES.ETHEREAL;
  const isLocked = Boolean(wall?.isLocked);

  let strokeColor = '#94a3b8';
  let strokeWidth = 5;

  if (isDoor) {
    if (doorState === DOOR_STATES.BREACHED) strokeColor = '#ef4444';
    else if (isOpen) strokeColor = '#22c55e';
    else if (isLocked) strokeColor = '#f59e0b';
    else strokeColor = '#3b82f6';
    strokeWidth = 6;
  } else if (isWindow) {
    strokeColor = '#38bdf8';
    strokeWidth = 3;
  } else if (isEthereal) {
    strokeColor = '#c084fc';
    strokeWidth = 4;
  }

  const resolvedColor = isSelected ? '#22d3ee' : strokeColor;
  const resolvedWidth = isSelected ? strokeWidth + 2 : strokeWidth;
  const dash = isDoor && isOpen ? [6, 6] : isEthereal ? [8, 4] : undefined;

  return {
    strokeColor: resolvedColor,
    strokeHex: parseHexColor(resolvedColor, 0x94a3b8),
    strokeWidth: resolvedWidth,
    dash,
    isDoor,
    isWindow,
    isEthereal,
    isOpen,
    isLocked
  };
}

/**
 * Tessellates a wall (straight or quadratic Bezier) into a flat polyline [x0, y0, x1, y1, ...].
 */
export function tessellateWallLinePoints(wall: any): number[] {
  const p1 = wall?.p1;
  const p2 = wall?.p2;
  if (!p1 || !p2) return [];
  if (wall.bezierControl && typeof wall.bezierControl.x === 'number' && typeof wall.bezierControl.y === 'number') {
    const segs = tessellateBezierWall(p1, wall.bezierControl, p2, 12);
    if (Array.isArray(segs) && segs.length > 0 && segs[0]?.p1) {
      return [segs[0].p1.x, segs[0].p1.y, ...segs.flatMap((s: any) => [s.p2.x, s.p2.y])];
    }
  }
  return [p1.x, p1.y, p2.x, p2.y];
}

/**
 * Draws a polyline (solid or dashed) onto a PixiJS v8 Graphics instance.
 */
export function drawStyledPolyline(
  g: Graphics,
  flatPoints: number[],
  strokeWidth: number,
  color: number,
  alpha = 1,
  dash?: number[]
): void {
  if (flatPoints.length < 4) return;
  if (!dash || dash.length < 2) {
    const x0 = flatPoints[0] ?? 0;
    const y0 = flatPoints[1] ?? 0;
    g.moveTo(x0, y0);
    for (let i = 2; i < flatPoints.length; i += 2) {
      g.lineTo(flatPoints[i] ?? x0, flatPoints[i + 1] ?? y0);
    }
    g.stroke({ width: strokeWidth, color, alpha, cap: 'round', join: 'round' });
    return;
  }

  const dashLen = Math.max(2, dash[0] ?? 8);
  const gapLen = Math.max(2, dash[1] ?? 4);
  const cycle = dashLen + gapLen;

  for (let i = 0; i + 3 < flatPoints.length; i += 2) {
    const ax = flatPoints[i] ?? 0;
    const ay = flatPoints[i + 1] ?? 0;
    const bx = flatPoints[i + 2] ?? ax;
    const by = flatPoints[i + 3] ?? ay;
    const segLen = Math.hypot(bx - ax, by - ay);
    if (segLen < 0.001) continue;
    const ux = (bx - ax) / segLen;
    const uy = (by - ay) / segLen;
    let dist = 0;
    while (dist < segLen) {
      const end = Math.min(segLen, dist + dashLen);
      g.moveTo(ax + ux * dist, ay + uy * dist);
      g.lineTo(ax + ux * end, ay + uy * end);
      dist += cycle;
    }
  }
  g.stroke({ width: strokeWidth, color, alpha, cap: 'round', join: 'round' });
}

export function drawDashedRect(
  g: Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number,
  color: number,
  alpha = 1,
  dash: number[] = [8, 4]
): void {
  drawStyledPolyline(
    g,
    [x, y, x + width, y, x + width, y + height, x, y + height, x, y],
    strokeWidth,
    color,
    alpha,
    dash
  );
}

export function drawDashedCircle(
  g: Graphics,
  cx: number,
  cy: number,
  radius: number,
  strokeWidth: number,
  color: number,
  alpha = 1,
  dash: number[] = [6, 4]
): void {
  const steps = Math.max(18, Math.round((2 * Math.PI * radius) / 10));
  const pts: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    pts.push(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
  }
  drawStyledPolyline(g, pts, strokeWidth, color, alpha, dash);
}

export function buildRegularPolygonPoints(cx: number, cy: number, radius: number, sides: number, rotationRad = -Math.PI / 2): number[] {
  const pts: number[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotationRad + (Math.PI * 2 * i) / sides;
    pts.push(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  }
  return pts;
}

export function buildStarPolygonPoints(cx: number, cy: number, outerR: number, innerR: number, numPoints = 5): number[] {
  const pts: number[] = [];
  const total = numPoints * 2;
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + (Math.PI * i) / numPoints;
    pts.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  return pts;
}

/**
 * Draws a viewport-culled square grid onto PixiJS v8 Graphics (minor + major 5-cell accent).
 */
export function drawPixiSquareGrid(
  g: Graphics,
  viewport: ViewportState,
  gridSize: number
): void {
  const safeScale = Math.max(0.05, Number(viewport.scale) || 1);
  const bounds = computeVisibleGridBounds(viewport, gridSize, 2, 300);
  const { gSize, minCol, maxCol, minRow, maxRow, minX, maxX, minY, maxY } = bounds;

  for (let c = minCol; c <= maxCol; c++) {
    if (Math.abs(c) % 5 === 0) continue;
    const x = c * gSize;
    g.moveTo(x, minY);
    g.lineTo(x, maxY);
  }
  for (let r = minRow; r <= maxRow; r++) {
    if (Math.abs(r) % 5 === 0) continue;
    const y = r * gSize;
    g.moveTo(minX, y);
    g.lineTo(maxX, y);
  }
  g.stroke({ width: 1 / safeScale, color: 0xffffff, alpha: 0.18 });

  for (let c = minCol; c <= maxCol; c++) {
    if (Math.abs(c) % 5 !== 0) continue;
    const x = c * gSize;
    g.moveTo(x, minY);
    g.lineTo(x, maxY);
  }
  for (let r = minRow; r <= maxRow; r++) {
    if (Math.abs(r) % 5 !== 0) continue;
    const y = r * gSize;
    g.moveTo(minX, y);
    g.lineTo(maxX, y);
  }
  g.stroke({ width: 1.5 / safeScale, color: 0x22d3ee, alpha: 0.35 });
}

/**
 * Draws a viewport-culled pointy-top hex grid onto PixiJS v8 Graphics.
 */
export function drawPixiHexGrid(
  g: Graphics,
  viewport: ViewportState,
  gridSize: number
): void {
  const safeScale = Math.max(0.05, Number(viewport.scale) || 1);
  const hexRadius = Math.max(15, Number(gridSize) || 50);
  const hexWidth = Math.sqrt(3) * hexRadius;
  const rowHeight = hexRadius * 1.5;

  const vpX = Number(viewport.x) || 0;
  const vpY = Number(viewport.y) || 0;
  const vpW = Math.max(100, Number(viewport.width) || 1200);
  const vpH = Math.max(100, Number(viewport.height) || 800);
  const marginX = hexWidth * 2;
  const marginY = hexRadius * 3;

  const startX = (-vpX - marginX) / safeScale;
  const endX = (vpW - vpX + marginX) / safeScale;
  const startY = (-vpY - marginY) / safeScale;
  const endY = (vpH - vpY + marginY) / safeScale;

  const minCol = Math.max(-200, Math.floor(startX / hexWidth) - 1);
  const maxCol = Math.min(200, Math.ceil(endX / hexWidth) + 1);
  const minRow = Math.max(-200, Math.floor(startY / rowHeight) - 1);
  const maxRow = Math.min(200, Math.ceil(endY / rowHeight) + 1);

  const offsets: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    offsets.push([hexRadius * Math.cos(angle), hexRadius * Math.sin(angle)]);
  }

  for (let r = minRow; r <= maxRow; r++) {
    const isOddRow = (((r % 2) + 2) % 2) === 1;
    const rowOffsetX = isOddRow ? hexWidth / 2 : 0;
    const cy = r * rowHeight;
    for (let c = minCol; c <= maxCol; c++) {
      const cx = c * hexWidth + rowOffsetX;
      const first = offsets[0]!;
      g.moveTo(cx + first[0], cy + first[1]);
      for (let i = 1; i < 6; i++) {
        const pt = offsets[i]!;
        g.lineTo(cx + pt[0], cy + pt[1]);
      }
      g.closePath();
    }
  }
  g.stroke({ width: 1 / safeScale, color: 0x22d3ee, alpha: 0.25 });
}

export interface RulerPaceStats {
  points: Point2D[];
  flatPoints: number[];
  totalDistanceMeters: number;
  formattedDistance: string;
  paceTier: string;
  pathColor: string;
  pathHex: number;
}

/**
 * Single-source-of-truth distance and locomotion pace calculation for the Waypoint Ruler.
 */
export function computeRulerPaceStats(
  waypoints: Point2D[],
  currentPointer: Point2D | null,
  gridSize: number,
  measurementUnit = 'meters'
): RulerPaceStats | null {
  if (!waypoints || waypoints.length === 0) return null;
  const points = currentPointer ? [...waypoints, currentPointer] : [...waypoints];
  if (points.length < 2) return null;

  const flatPoints: number[] = [];
  let totalDistanceMeters = 0;
  const safeGrid = Math.max(15, gridSize || 40);

  for (let i = 0; i < points.length; i++) {
    const pt = points[i]!;
    flatPoints.push(pt.x, pt.y);
    if (i > 0) {
      const prev = points[i - 1]!;
      const distPx = Math.hypot(pt.x - prev.x, pt.y - prev.y);
      totalDistanceMeters += Math.round((distPx / safeGrid) * 2 * 10) / 10;
    }
  }

  let paceTier = 'WALK (30ft)';
  let pathColor = '#22c55e';
  if (totalDistanceMeters <= 10) {
    paceTier = 'WALK (30ft)';
    pathColor = '#22c55e';
  } else if (totalDistanceMeters <= 20) {
    paceTier = 'JOG (60ft)';
    pathColor = '#06b6d4';
  } else if (totalDistanceMeters <= 30) {
    paceTier = 'RUN (90ft)';
    pathColor = '#f59e0b';
  } else if (totalDistanceMeters <= 40) {
    paceTier = 'SPRINT (120ft)';
    pathColor = '#f43f5e';
  } else {
    paceTier = 'EXCEEDS SPRINT';
    pathColor = '#ef4444';
  }

  const metersRounded = Math.round(totalDistanceMeters * 10) / 10;
  const feetRounded = Math.round(totalDistanceMeters * 3.28);
  const squaresRounded = Math.round((totalDistanceMeters / 2) * 10) / 10;
  const formattedDistance =
    measurementUnit === 'feet'
      ? `${feetRounded} ft (${metersRounded}m)`
      : measurementUnit === 'squares'
      ? `${squaresRounded} sq (${metersRounded}m)`
      : `${metersRounded}m (${feetRounded} ft)`;

  return {
    points,
    flatPoints,
    totalDistanceMeters,
    formattedDistance,
    paceTier,
    pathColor,
    pathHex: parseHexColor(pathColor, 0x22c55e)
  };
}

const pixiTextureCache = new Map<string, Texture>();

/**
 * Resolves a cached Pixi Texture from an image URL using MapTextures' bounded LRU loader.
 * Triggers `onLoaded` asynchronously if the image is still decoding.
 */
export function requestPixiTexture(
  src: string | undefined | null,
  onLoaded?: () => void
): Texture | null {
  if (!src || typeof window === 'undefined') return null;

  const existing = pixiTextureCache.get(src);
  if (existing && !existing.destroyed) {
    return existing;
  }

  const img = getLoadedImage(src, (loadedImg: HTMLImageElement) => {
    try {
      const tex = Texture.from(loadedImg);
      if (tex && !tex.destroyed) {
        pixiTextureCache.set(src, tex);
      }
      onLoaded?.();
    } catch {
      // Ignore texture creation failures on invalid/unmounted contexts
    }
  });

  if (img && img.complete && (img.naturalWidth > 0 || img.width > 0)) {
    try {
      const tex = Texture.from(img);
      if (tex && !tex.destroyed) {
        pixiTextureCache.set(src, tex);
        return tex;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Checks whether a screen-space box intersects a bounding rectangle (helper for culling if needed).
 */
export function isRectVisible(rect: Rectangle, viewport: ViewportState): boolean {
  const s = Math.max(0.05, viewport.scale);
  const left = -viewport.x / s;
  const top = -viewport.y / s;
  const right = left + viewport.width / s;
  const bottom = top + viewport.height / s;
  return rect.x + rect.width >= left && rect.x <= right && rect.y + rect.height >= top && rect.y <= bottom;
}
