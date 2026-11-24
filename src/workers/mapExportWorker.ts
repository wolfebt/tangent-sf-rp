/**
 * @file mapExportWorker.ts
 * @description OffscreenCanvas Web Worker for non-blocking 4K PNG/WebP map snapshot encoding.
 * Draws background grid, terrains (including soft edges), walls/doors (linear & Bezier),
 * and dynamic ambient light halos off the main React/UI thread.
 */

export interface MapExportWorkerRequest {
  id: string;
  width: number;
  height: number;
  gridSize: number;
  sourceGridSize?: number;
  backgroundColor?: string;
  enableWallShadows?: boolean;
  terrains?: Array<Record<string, any>>;
  underlays?: Array<Record<string, any>>;
  objects?: Array<Record<string, any>>;
  tokens?: Array<Record<string, any>>;
  texts?: Array<Record<string, any>>;
  walls?: Array<Record<string, any>>;
  lights?: Array<Record<string, any>>;
  format?: 'image/png' | 'image/webp';
  quality?: number;
}

async function preloadWorkerBitmaps(urls: string[]): Promise<Map<string, ImageBitmap>> {
  const map = new Map<string, ImageBitmap>();
  if (typeof fetch !== 'function' || typeof createImageBitmap !== 'function' || urls.length === 0) {
    return map;
  }
  const unique = Array.from(new Set(urls.filter((u) => typeof u === 'string' && u.length > 0)));
  await Promise.all(
    unique.map(async (url) => {
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) return;
        const blob = await res.blob();
        const bmp = await createImageBitmap(blob);
        map.set(url, bmp);
      } catch {
        // Ignore CORS/network failures inside worker and use vector fallback
      }
    })
  );
  return map;
}

export interface MapExportWorkerResponse {
  id: string;
  ok: boolean;
  blob?: Blob;
  error?: string;
}

async function renderMapSnapshotToOffscreenCanvas(payload: MapExportWorkerRequest): Promise<Blob> {
  if (typeof OffscreenCanvas === 'undefined') {
    return Promise.reject(new Error('OffscreenCanvas is not available in this worker context.'));
  }

  const width = Math.max(64, Math.min(8192, Math.round(payload.width || 1024)));
  const height = Math.max(64, Math.min(8192, Math.round(payload.height || 1024)));
  const gridSize = Math.max(10, Math.round(payload.gridSize || 50));
  const sourceGridSize = Math.max(10, Number(payload.sourceGridSize || gridSize));
  const coordScale = gridSize / sourceGridSize;

  const imageUrls: string[] = [];
  for (const u of payload.underlays || []) {
    if (!u || u.visible === false || u.mediaType === 'video') continue;
    const uSrc = u.url || u.imageUrl || u.dataUrl;
    if (uSrc) imageUrls.push(uSrc);
  }
  for (const t of payload.terrains || []) {
    if (t?.imageUrl) imageUrls.push(t.imageUrl);
  }
  for (const o of payload.objects || []) {
    if (o?.imageUrl) imageUrls.push(o.imageUrl);
  }
  for (const tk of payload.tokens || []) {
    if (tk?.imageUrl || tk?.avatarUrl) imageUrls.push(tk.imageUrl || tk.avatarUrl);
  }
  const bitmaps = await preloadWorkerBitmaps(imageUrls);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Promise.reject(new Error('2D context could not be acquired on OffscreenCanvas.'));
  }

  // 1. Background
  ctx.fillStyle = payload.backgroundColor || '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Apply uniform coordinate scaling so 4K upscaled exports preserve full map alignment
  ctx.save();
  if (coordScale !== 1) {
    ctx.scale(coordScale, coordScale);
  }

  // 2.5 Underlays
  for (const u of payload.underlays || []) {
    if (!u || u.visible === false || u.mediaType === 'video') continue;
    const src = u.url || u.imageUrl || u.dataUrl;
    const bmp = src ? bitmaps.get(src) : undefined;
    const ux = Number(u.offsetX ?? u.x ?? 0);
    const uy = Number(u.offsetY ?? u.y ?? 0);
    const uScale = Number(u.scale || 1);
    const bmpW = bmp && 'width' in bmp && bmp.width ? bmp.width : width / coordScale;
    const bmpH = bmp && 'height' in bmp && bmp.height ? bmp.height : height / coordScale;
    const uw = Number(u.width || bmpW) * uScale;
    const uh = Number(u.height || bmpH) * uScale;
    ctx.save();
    ctx.globalAlpha = Number(u.opacity ?? 0.55);
    if (bmp) {
      ctx.drawImage(bmp, ux, uy, uw, uh);
    } else if (u.color) {
      ctx.fillStyle = u.color;
      ctx.fillRect(ux, uy, uw, uh);
    }
    ctx.restore();
  }

  // 3. Terrains (ground first, roof canopy terrains rendered above tokens/walls)
  const renderTerrainList = (list: Array<Record<string, any>>) => {
  for (const t of list) {
    const color = typeof t.color === 'string' ? t.color : '#1e293b';
    const alpha = typeof t.opacity === 'number' ? t.opacity : 0.85;
    ctx.save();
    const imgSrc = t.imageUrl ? bitmaps.get(t.imageUrl) : undefined;
    if ((t.renderType === 'canvasImage' || t.renderType === 'image') && imgSrc) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(imgSrc, Number(t.x || 0), Number(t.y || 0), Number(t.width || width / coordScale), Number(t.height || height / coordScale));
    } else if (t.renderType === 'rect' || (typeof t.width === 'number' && typeof t.height === 'number')) {
      const x = Number(t.x || 0);
      const y = Number(t.y || 0);
      const w = Number(t.width || 50);
      const h = Number(t.height || 50);
      if (t.softEdge) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.22;
        ctx.lineWidth = 12;
        ctx.strokeRect(x - 6, y - 6, w + 12, h + 12);
      }
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, w, h);
    } else if (Array.isArray(t.points) && t.points.length >= 4) {
      const tracePts = () => {
        ctx.beginPath();
        ctx.moveTo(Number(t.points[0] || 0), Number(t.points[1] || 0));
        for (let i = 2; i < t.points.length; i += 2) {
          ctx.lineTo(Number(t.points[i] || 0), Number(t.points[i + 1] || 0));
        }
        if (t.closed || t.renderType === 'polygon') {
          ctx.closePath();
        }
      };
      if (t.softEdge) {
        tracePts();
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Number(t.strokeWidth || 30) + 18;
        ctx.globalAlpha = 0.22;
        ctx.stroke();
      }
      tracePts();
      if (t.closed || t.renderType === 'polygon') {
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      } else {
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Number(t.strokeWidth || 30);
        ctx.globalAlpha = alpha;
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  };

  const allTerrains = payload.terrains || [];
  renderTerrainList(allTerrains.filter((t) => !t?.isRoofLayer));

  // 3.5 Objects / Props
  for (const obj of payload.objects || []) {
    if (!obj || obj.isHidden || obj.isGmOnly) continue;
    const ox = Number(obj.x || 0);
    const oy = Number(obj.y || 0);
    const ow = Number(obj.width || (obj.radius ? obj.radius * 2 : 40));
    const oh = Number(obj.height || (obj.radius ? obj.radius * 2 : 40));
    const objImg = obj.imageUrl ? bitmaps.get(obj.imageUrl) : undefined;
    ctx.save();
    if (objImg) {
      ctx.drawImage(objImg, ox - ow / 2, oy - oh / 2, ow, oh);
    } else {
      ctx.fillStyle = obj.color || '#38bdf8';
      ctx.fillRect(ox - ow / 2, oy - oh / 2, ow, oh);
    }
    ctx.restore();
  }

  // 4. Walls & Bulkheads (Linear + Quadratic Bezier)
  const drawWallSegments = (shadowPass: boolean) => {
    for (const w of payload.walls || []) {
      const p1 = w.p1 || { x: Number(w.x1 || 0), y: Number(w.y1 || 0) };
      const p2 = w.p2 || { x: Number(w.x2 || 0), y: Number(w.y2 || 0) };
      const isDoor = Boolean(w.isDynamic || w.type === 'door');
      const isOpen = Boolean(w.isOpen || w.doorState === 'open' || w.doorState === 'breached');
      if (shadowPass && isOpen) continue;

      ctx.save();
      ctx.beginPath();
      const ox = shadowPass ? 5 : 0;
      const oy = shadowPass ? 6 : 0;
      ctx.moveTo(p1.x + ox, p1.y + oy);
      if (w.bezierControl && typeof w.bezierControl.x === 'number' && typeof w.bezierControl.y === 'number') {
        ctx.quadraticCurveTo(w.bezierControl.x + ox, w.bezierControl.y + oy, p2.x + ox, p2.y + oy);
      } else {
        ctx.lineTo(p2.x + ox, p2.y + oy);
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (shadowPass) {
        ctx.strokeStyle = '#020617';
        ctx.globalAlpha = 0.36;
        ctx.lineWidth = (isDoor ? 6 : 5) + 5;
      } else {
        ctx.strokeStyle = isDoor ? (isOpen ? '#22c55e' : '#f59e0b') : '#22d3ee';
        ctx.globalAlpha = isOpen ? 0.45 : 0.95;
        ctx.lineWidth = isDoor ? 6 : 5;
      }
      ctx.stroke();
      ctx.restore();
    }
  };

  if (payload.enableWallShadows !== false) {
    drawWallSegments(true);
  }
  drawWallSegments(false);

  // 5. Dynamic Lights (Ambient Glow Halos)
  for (const light of payload.lights || []) {
    const lx = Number(light.x || 0);
    const ly = Number(light.y || 0);
    const radius = Math.max(20, Number(light.radius || 180));
    const color = typeof light.color === 'string' ? light.color : '#f59e0b';
    const grad = ctx.createRadialGradient(lx, ly, 4, lx, ly, radius);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(lx, ly, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4.5 Tokens, Texts & Roof Canopy Layer
  for (const tk of payload.tokens || []) {
    if (!tk || tk.isHidden || tk.hidden || tk.isGmOnly) continue;
    const tx = Number(tk.x || 0);
    const ty = Number(tk.y || 0);
    const tr = Number(tk.radius || 22);
    const tkImg = (tk.imageUrl || tk.avatarUrl) ? bitmaps.get(tk.imageUrl || tk.avatarUrl) : undefined;
    ctx.save();
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.clip();
    if (tkImg) {
      ctx.drawImage(tkImg, tx - tr, ty - tr, tr * 2, tr * 2);
    } else {
      ctx.fillStyle = tk.fill || tk.color || (tk.type === 'hero' ? '#22d3ee' : '#ef4444');
      ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (const txt of payload.texts || []) {
    if (!txt?.text) continue;
    ctx.save();
    ctx.fillStyle = txt.fill || txt.color || '#f8fafc';
    ctx.font = `bold ${Number(txt.fontSize || 16)}px sans-serif`;
    ctx.fillText(String(txt.text), Number(txt.x || 0), Number(txt.y || 0));
    ctx.restore();
  }

  renderTerrainList(allTerrains.filter((t) => Boolean(t?.isRoofLayer)));

  ctx.restore();

  bitmaps.forEach((bmp) => {
    try { bmp.close?.(); } catch {}
  });

  return canvas.convertToBlob({
    type: payload.format || 'image/png',
    quality: payload.quality ?? 0.92
  });
}

if (typeof self !== 'undefined' && typeof (self as any).addEventListener === 'function') {
  self.addEventListener('message', async (event: MessageEvent<MapExportWorkerRequest>) => {
    const data = event.data;
    if (!data || !data.id) return;
    try {
      const blob = await renderMapSnapshotToOffscreenCanvas(data);
      const response: MapExportWorkerResponse = { id: data.id, ok: true, blob };
      (self as any).postMessage(response);
    } catch (err: any) {
      const response: MapExportWorkerResponse = {
        id: data.id,
        ok: false,
        error: err?.message || 'OffscreenCanvas export worker failed'
      };
      (self as any).postMessage(response);
    }
  });
}
