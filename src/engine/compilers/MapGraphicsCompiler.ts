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
  renderType?: 'rect' | 'hexTile' | 'polygon' | 'circle' | 'image' | 'canvasImage';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[]; // [x1, y1, x2, y2, ...]
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  closed?: boolean;
  opacity?: number;
  biomeType?: string;
  terrainTypeId?: string;
  imageUrl?: string;
  textureUrl?: string;
  bitmask4Bit?: number;
  edgeLines?: Array<[number, number, number, number]>;
  isLiquid?: boolean;
}

export interface UnderlayDecal {
  id?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  color?: string;
  opacity?: number;
  imageUrl?: string;
  dataUrl?: string;
  category?: 'scorch' | 'blood' | 'debris' | 'grate' | 'wire' | 'stain';
}

export interface FlattenOptions {
  widthCells: number;
  heightCells: number;
  pixelsPerGrid?: number;
  sourceGridSize?: number;
  backgroundColor?: string;
  showGridLines?: boolean;
  gridLineColor?: string;
  gridMode?: string;
  terrains?: TerrainTile[];
  underlays?: UnderlayDecal[];
  lines?: any[];
  objects?: any[];
  walls?: any[];
  lights?: any[];
  tokens?: any[];
  texts?: any[];
}

export class MapGraphicsCompiler {
  private static async preloadImages(urls: string[]): Promise<Map<string, any>> {
    const cache = new Map<string, any>();
    if (typeof Image === 'undefined' || urls.length === 0) {
      return cache;
    }

    const unique = Array.from(new Set(urls.filter((u) => typeof u === 'string' && u.length > 0)));
    await Promise.all(
      unique.map(
        (url) =>
          new Promise<void>((resolve) => {
            let settled = false;
            const finish = () => {
              if (!settled) {
                settled = true;
                resolve();
              }
            };
            const timer = setTimeout(finish, 2500);
            try {
              const img = new Image();
              if (!url.startsWith('data:')) {
                img.crossOrigin = 'anonymous';
              }
              img.onload = () => {
                clearTimeout(timer);
                cache.set(url, img);
                finish();
              };
              img.onerror = () => {
                clearTimeout(timer);
                finish();
              };
              img.src = url;
            } catch {
              clearTimeout(timer);
              finish();
            }
          })
      )
    );

    return cache;
  }

  /**
   * Flattens terrain (Z0), underlays/decals (Z10), and optional vector overlays onto an HTML5 Canvas.
   * Works in both browser environments and headless/mock environments.
   */
  public static flattenToCanvas(options: FlattenOptions): HTMLCanvasElement | null {
    return this.flattenToCanvasWithCache(options, null);
  }

  /**
   * Async version that preloads data-URL/image terrain canvases and sprites before compositing.
   */
  public static async flattenToCanvasAsync(options: FlattenOptions): Promise<HTMLCanvasElement | null> {
    if (typeof document === 'undefined') {
      return null;
    }
    const imageUrls: string[] = [];
    for (const t of options.terrains || []) {
      if (t.imageUrl) imageUrls.push(t.imageUrl);
      if (t.textureUrl) imageUrls.push(t.textureUrl);
    }
    for (const u of options.underlays || []) {
      if (u?.imageUrl) imageUrls.push(u.imageUrl);
      if (u?.dataUrl) imageUrls.push(u.dataUrl);
    }
    for (const o of options.objects || []) {
      if (o?.imageUrl) imageUrls.push(o.imageUrl);
    }
    for (const tk of options.tokens || []) {
      if (tk?.imageUrl || tk?.avatarUrl) imageUrls.push(tk.imageUrl || tk.avatarUrl);
    }
    const imageCache = await this.preloadImages(imageUrls);
    return this.flattenToCanvasWithCache(options, imageCache);
  }

  private static flattenToCanvasWithCache(
    options: FlattenOptions,
    imageCache: Map<string, any> | null
  ): HTMLCanvasElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const {
      widthCells,
      heightCells,
      pixelsPerGrid = 100,
      sourceGridSize,
      backgroundColor = '#090d16',
      showGridLines = false,
      gridLineColor = 'rgba(6, 182, 212, 0.15)',
      terrains = [],
      underlays = [],
      lines = [],
      objects = [],
      walls = [],
      lights = [],
      tokens = [],
      texts = []
    } = options;

    const canvasWidth = Math.max(1, widthCells * pixelsPerGrid);
    const canvasHeight = Math.max(1, heightCells * pixelsPerGrid);
    const coordScale = sourceGridSize && sourceGridSize > 0 ? pixelsPerGrid / sourceGridSize : 1;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // 1. Fill base void / starfield background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    if (coordScale !== 1) {
      ctx.scale(coordScale, coordScale);
    }

    // 2. Render Z-Layer 0: Terrain & Biome Cells
    for (const t of terrains) {
      ctx.save();
      ctx.globalAlpha = t.opacity ?? 1.0;
      ctx.fillStyle = t.color || '#1e293b';

      if ((t.renderType === 'canvasImage' || t.renderType === 'image') && t.imageUrl) {
        const cachedImg = imageCache?.get(t.imageUrl);
        const w = t.width ?? canvasWidth / coordScale;
        const h = t.height ?? canvasHeight / coordScale;
        if (cachedImg) {
          ctx.drawImage(cachedImg, t.x ?? 0, t.y ?? 0, w, h);
        } else {
          ctx.fillRect(t.x ?? 0, t.y ?? 0, w, h);
        }
      } else if (t.renderType === 'hexTile' && t.radius) {
        this.drawRegularPolygon(ctx, t.x || 0, t.y || 0, 6, t.radius);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (t.renderType === 'circle' && t.radius) {
        ctx.beginPath();
        ctx.arc(t.x || 0, t.y || 0, t.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if ((t.renderType === 'polygon' || t.closed) && t.points && t.points.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(t.points[0] ?? 0, t.points[1] ?? 0);
        for (let i = 2; i < t.points.length; i += 2) {
          ctx.lineTo(t.points[i] ?? 0, t.points[i + 1] ?? 0);
        }
        ctx.closePath();
        ctx.fill();

        if (t.edgeLines && t.edgeLines.length > 0) {
          ctx.strokeStyle = t.isLiquid ? 'rgba(56, 189, 248, 0.8)' : 'rgba(14, 165, 233, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (const edge of t.edgeLines) {
            ctx.moveTo(edge[0], edge[1]);
            ctx.lineTo(edge[2], edge[3]);
          }
          ctx.stroke();
        }
      } else if (t.points && t.points.length >= 4) {
        ctx.strokeStyle = t.strokeColor || t.color || '#334155';
        ctx.lineWidth = t.strokeWidth ?? 30;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(t.points[0] ?? 0, t.points[1] ?? 0);
        for (let i = 2; i < t.points.length; i += 2) {
          ctx.lineTo(t.points[i] ?? 0, t.points[i + 1] ?? 0);
        }
        ctx.stroke();
      } else {
        // Default: Rectangular tile
        const x = t.x ?? 0;
        const y = t.y ?? 0;
        const w = t.width ?? pixelsPerGrid / coordScale;
        const h = t.height ?? pixelsPerGrid / coordScale;
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
      if (!d) continue;
      ctx.save();
      const dx = d.x ?? 0;
      const dy = d.y ?? 0;
      ctx.translate(dx, dy);
      if (d.rotation) {
        ctx.rotate((d.rotation * Math.PI) / 180);
      }
      ctx.globalAlpha = d.opacity ?? 0.85;

      const imgSrc = d.imageUrl || d.dataUrl;
      const cachedUnderlay = imgSrc ? imageCache?.get(imgSrc) : null;
      const dw = d.width ?? pixelsPerGrid * 0.8;
      const dh = d.height ?? pixelsPerGrid * 0.8;

      if (cachedUnderlay) {
        ctx.drawImage(cachedUnderlay, d.width ? 0 : -dw / 2, d.height ? 0 : -dh / 2, dw, dh);
      } else if (d.category === 'scorch') {
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

    // 3.5 Optional Stage/Map Overlay Vectors (lines, objects, walls, lights, tokens, texts)
    for (const l of lines) {
      if (!Array.isArray(l?.points) || l.points.length < 4) continue;
      ctx.save();
      ctx.strokeStyle = l.stroke || l.color || '#22d3ee';
      ctx.lineWidth = l.strokeWidth || l.width || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(l.points[0], l.points[1]);
      for (let i = 2; i < l.points.length; i += 2) {
        ctx.lineTo(l.points[i], l.points[i + 1]);
      }
      if (l.closed) ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    for (const obj of objects) {
      if (!obj || obj.isGmOnly || obj.visible === false) continue;
      ctx.save();
      ctx.globalAlpha = obj.opacity ?? 0.9;
      const ox = obj.x ?? 0;
      const oy = obj.y ?? 0;
      const ow = obj.width ?? (obj.radius ? obj.radius * 2 : 30);
      const oh = obj.height ?? (obj.radius ? obj.radius * 2 : 30);
      const cachedObj = obj.imageUrl ? imageCache?.get(obj.imageUrl) : null;
      if (cachedObj) {
        ctx.drawImage(cachedObj, ox - ow / 2, oy - oh / 2, ow, oh);
      } else {
        ctx.fillStyle = obj.color || '#06b6d4';
        ctx.fillRect(ox - ow / 2, oy - oh / 2, ow, oh);
      }
      ctx.restore();
    }

    for (const w of walls) {
      const x1 = w.p1?.x ?? w.x1;
      const y1 = w.p1?.y ?? w.y1;
      const x2 = w.p2?.x ?? w.x2;
      const y2 = w.p2?.y ?? w.y2;
      if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) continue;
      ctx.save();
      const isDoor = w.type === 'door' || w.wallType === 'door' || w.isDoor === true || w.isDynamic === true;
      ctx.strokeStyle = w.color || (isDoor ? '#f59e0b' : '#94a3b8');
      ctx.lineWidth = isDoor ? 5 : 4;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      if (w.bezierControl && typeof w.bezierControl.x === 'number' && typeof w.bezierControl.y === 'number') {
        ctx.quadraticCurveTo(w.bezierControl.x, w.bezierControl.y, x2, y2);
      } else {
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();
      ctx.restore();
    }

    for (const lt of lights) {
      if (lt?.x === undefined || lt?.y === undefined) continue;
      ctx.save();
      const r = lt.radius || 150;
      if (typeof ctx.createRadialGradient === 'function') {
        const grad = ctx.createRadialGradient(lt.x, lt.y, 0, lt.x, lt.y, r);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      }
      ctx.beginPath();
      ctx.arc(lt.x, lt.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const tk of tokens) {
      if (!tk || tk.isHidden || tk.hidden || tk.isGmOnly) continue;
      const tx = tk.x ?? 0;
      const ty = tk.y ?? 0;
      const tr = tk.radius ?? 20;
      ctx.save();
      ctx.fillStyle = tk.color || (tk.type === 'hero' ? '#22d3ee' : '#ef4444');
      ctx.beginPath();
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    for (const txt of texts) {
      if (!txt?.text) continue;
      ctx.save();
      ctx.fillStyle = txt.color || '#f8fafc';
      ctx.font = `bold ${txt.fontSize || 16}px sans-serif`;
      ctx.fillText(txt.text, txt.x ?? 0, txt.y ?? 0);
      ctx.restore();
    }

    ctx.restore();

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
   * Compiles layers asynchronously (with image/data-URL preloading) into a Data URL.
   */
  public static async compileToDataUrlAsync(
    options: FlattenOptions,
    mimeType: 'image/webp' | 'image/png' = 'image/webp',
    quality = 0.85
  ): Promise<string> {
    const canvas = await this.flattenToCanvasAsync(options);
    if (!canvas) {
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
   * Async version of compileForUniversalVtt supporting organic canvasImage layers and sprite underlays.
   */
  public static async compileForUniversalVttAsync(options: FlattenOptions, quality = 0.85): Promise<string> {
    const dataUrl = await this.compileToDataUrlAsync(options, 'image/webp', quality);
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
