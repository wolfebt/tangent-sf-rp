/**
 * @file MapGraphicsCompiler.ts
 * @description Stage 7.1: Offscreen Layer Flattener for VTT & Universal VTT (.dd2vtt).
 * Flattens Z-Layers 0 (Terrain, Base Tiles, Biomes) and 10 (Underlay, Decals, Splatter)
 * into a single high-efficiency WebP/PNG image payload.
 * Keeps props, tokens, doors, and dynamic lights discrete and interactive.
 */

import { MarchingSquaresAutoTiler } from '../canvas/MarchingSquaresAutoTiler.ts';

export interface TerrainTile {
  id?: string;
  renderType?: 'rect' | 'hexTile' | 'polygon' | 'circle' | 'image';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[]; // [x1, y1, x2, y2, ...]
  color?: string;
  opacity?: number;
  biomeType?: string;
  terrainTypeId?: string;
  bitmask4Bit?: number;
  edgeLines?: Array<[number, number, number, number]>;
  isLiquid?: boolean;
}

export interface UnderlayDecal {
  id?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  color?: string;
  opacity?: number;
  category?: 'scorch' | 'blood' | 'debris' | 'grate' | 'wire' | 'stain';
}

export interface FlattenOptions {
  widthCells: number;
  heightCells: number;
  pixelsPerGrid?: number;
  backgroundColor?: string;
  showGridLines?: boolean;
  gridLineColor?: string;
  terrains?: TerrainTile[];
  underlays?: UnderlayDecal[];
}

export class MapGraphicsCompiler {
  /**
   * Flattens terrain (Z0) and underlays/decals (Z10) onto an HTML5 Canvas.
   * Works in both browser environments and headless/mock environments.
   */
  public static flattenToCanvas(options: FlattenOptions): HTMLCanvasElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const {
      widthCells,
      heightCells,
      pixelsPerGrid = 100,
      backgroundColor = '#090d16',
      showGridLines = false,
      gridLineColor = 'rgba(6, 182, 212, 0.15)',
      terrains = [],
      underlays = []
    } = options;

    const canvasWidth = Math.max(1, widthCells * pixelsPerGrid);
    const canvasHeight = Math.max(1, heightCells * pixelsPerGrid);

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // 1. Fill base void / starfield background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Render Z-Layer 0: Terrain & Biome Cells
    for (const t of terrains) {
      ctx.save();
      ctx.globalAlpha = t.opacity ?? 1.0;
      ctx.fillStyle = t.color || '#1e293b';

      if (t.renderType === 'hexTile' && t.radius) {
        this.drawRegularPolygon(ctx, t.x || 0, t.y || 0, 6, t.radius);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (t.renderType === 'circle' && t.radius) {
        ctx.beginPath();
        ctx.arc(t.x || 0, t.y || 0, t.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (t.renderType === 'polygon' && t.points && t.points.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(t.points[0], t.points[1]);
        for (let i = 2; i < t.points.length; i += 2) {
          ctx.lineTo(t.points[i], t.points[i + 1]);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Default: Rectangular tile
        const x = t.x ?? 0;
        const y = t.y ?? 0;
        const w = t.width ?? pixelsPerGrid;
        const h = t.height ?? pixelsPerGrid;
        ctx.fillRect(x, y, w, h);

        const edges = t.edgeLines || (t.bitmask4Bit !== undefined ? MarchingSquaresAutoTiler.getEdgeLines(x, y, w, h, t.bitmask4Bit) : null);
        if (edges && edges.length > 0) {
          ctx.strokeStyle = t.isLiquid ? 'rgba(56, 189, 248, 0.8)' : 'rgba(14, 165, 233, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (const edge of edges) {
            ctx.moveTo(edge[0], edge[1]);
            ctx.lineTo(edge[2], edge[3]);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 3. Render Z-Layer 10: Underlay, Decals, Spent Brass, Scorch & Blood
    for (const d of underlays) {
      ctx.save();
      ctx.translate(d.x, d.y);
      if (d.rotation) {
        ctx.rotate((d.rotation * Math.PI) / 180);
      }
      ctx.globalAlpha = d.opacity ?? 0.85;

      const dw = d.width ?? pixelsPerGrid * 0.8;
      const dh = d.height ?? pixelsPerGrid * 0.8;

      if (d.category === 'scorch') {
        ctx.fillStyle = d.color || '#0f172a';
        ctx.beginPath();
        ctx.ellipse(0, 0, dw / 2, dh / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.category === 'blood') {
        ctx.fillStyle = d.color || '#881337';
        ctx.beginPath();
        ctx.arc(0, 0, (d.radius ?? dw / 2), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = d.color || '#334155';
        ctx.fillRect(-dw / 2, -dh / 2, dw, dh);
      }
      ctx.restore();
    }

    // 4. Optional Grid Lines Overlay
    if (showGridLines) {
      ctx.save();
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvasWidth; x += pixelsPerGrid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y += pixelsPerGrid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    return canvas;
  }

  /**
   * Helper to draw regular N-sided polygon on Canvas 2D context.
   */
  private static drawRegularPolygon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    sides: number,
    radius: number
  ): void {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  /**
   * Compiles layers into a Data URL (WebP or PNG fallback).
   */
  public static compileToDataUrl(
    options: FlattenOptions,
    mimeType: 'image/webp' | 'image/png' = 'image/webp',
    quality = 0.85
  ): string {
    const canvas = this.flattenToCanvas(options);
    if (!canvas) {
      // In headless / non-browser environments, return mock 1x1 WebP base64 data URI
      return 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2wAA';
    }

    try {
      return canvas.toDataURL(mimeType, quality);
    } catch {
      return canvas.toDataURL('image/png');
    }
  }

  /**
   * Compiles layers into raw base64 string formatted for Universal VTT (.dd2vtt) files.
   */
  public static compileForUniversalVtt(options: FlattenOptions, quality = 0.85): string {
    const dataUrl = this.compileToDataUrl(options, 'image/webp', quality);
    const prefix = 'base64,';
    const idx = dataUrl.indexOf(prefix);
    if (idx !== -1) {
      return dataUrl.substring(idx + prefix.length);
    }
    return dataUrl;
  }

  /**
   * Compiles layers to Blob for direct file download.
   */
  public static async compileToBlob(
    options: FlattenOptions,
    mimeType: 'image/webp' | 'image/png' = 'image/webp',
    quality = 0.85
  ): Promise<Blob> {
    const canvas = this.flattenToCanvas(options);
    if (!canvas) {
      return new Blob([], { type: mimeType });
    }

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(new Blob([], { type: mimeType }));
        },
        mimeType,
        quality
      );
    });
  }
}
