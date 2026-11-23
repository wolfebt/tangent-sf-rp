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
  backgroundColor?: string;
  enableWallShadows?: boolean;
  terrains?: Array<Record<string, any>>;
  walls?: Array<Record<string, any>>;
  lights?: Array<Record<string, any>>;
  format?: 'image/png' | 'image/webp';
  quality?: number;
}

export interface MapExportWorkerResponse {
  id: string;
  ok: boolean;
  blob?: Blob;
  error?: string;
}

function renderMapSnapshotToOffscreenCanvas(payload: MapExportWorkerRequest): Promise<Blob> {
  if (typeof OffscreenCanvas === 'undefined') {
    return Promise.reject(new Error('OffscreenCanvas is not available in this worker context.'));
  }

  const width = Math.max(64, Math.min(8192, Math.round(payload.width || 1024)));
  const height = Math.max(64, Math.min(8192, Math.round(payload.height || 1024)));
  const gridSize = Math.max(10, Math.round(payload.gridSize || 50));

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

  // 3. Terrains (with soft-edge support)
  for (const t of payload.terrains || []) {
    const color = typeof t.color === 'string' ? t.color : '#1e293b';
    const alpha = typeof t.opacity === 'number' ? t.opacity : 0.85;
    ctx.save();
    if (t.renderType === 'rect' || (typeof t.width === 'number' && typeof t.height === 'number')) {
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
