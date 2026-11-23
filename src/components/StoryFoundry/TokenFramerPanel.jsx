import React, { useEffect, useRef, useState } from 'react';
import { Download, Sparkles, Sliders, CircleDot } from 'lucide-react';

export const TOKEN_FRAME_STYLES = [
  { id: 'circular-neon', label: 'Circular Neon', defaultColor: '#22d3ee' },
  { id: 'hex-tactical', label: 'Hex Tactical', defaultColor: '#10b981' },
  { id: 'hud-reticle', label: 'HUD Reticle', defaultColor: '#38bdf8' },
  { id: 'brass-command', label: 'Brass Command', defaultColor: '#f59e0b' }
];

function traceHexagon(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export const TokenFramerPanel = ({
  sourceImageUrl = '',
  tokenLabel = 'Operative Token',
  onExportToken
}) => {
  const canvasRef = useRef(null);
  const [frameStyle, setFrameStyle] = useState('circular-neon');
  const [accentColor, setAccentColor] = useState('#22d3ee');
  const [zoom, setZoom] = useState(1.1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [loadedImage, setLoadedImage] = useState(null);
  const [exportStatus, setExportStatus] = useState('');

  useEffect(() => {
    if (!sourceImageUrl) {
      setLoadedImage(null);
      return;
    }
    if (typeof Image === 'undefined') return;
    let active = true;
    const img = new Image();
    if (!sourceImageUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (active) setLoadedImage(img);
    };
    img.onerror = () => {
      if (active) setLoadedImage(null);
    };
    img.src = sourceImageUrl;
    return () => {
      active = false;
    };
  }, [sourceImageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
    if (!ctx) return;

    const size = 256;
    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = 114;

    ctx.clearRect(0, 0, size, size);

    // Clip region according to token frame style
    ctx.save();
    if (frameStyle === 'hex-tactical') {
      traceHexagon(ctx, cx, cy, outerRadius - 4);
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius - 4, 0, Math.PI * 2);
      ctx.closePath();
    }
    ctx.clip();

    // Backdrop fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    if (loadedImage) {
      const iw = loadedImage.width || 256;
      const ih = loadedImage.height || 256;
      const baseScale = Math.max(size / iw, size / ih);
      const drawW = iw * baseScale * zoom;
      const drawH = ih * baseScale * zoom;
      const dx = cx - drawW / 2 + panX;
      const dy = cy - drawH / 2 + panY;
      ctx.drawImage(loadedImage, dx, dy, drawW, drawH);
    } else {
      // Tactical placeholder crest
      const grad = ctx.createRadialGradient(cx, cy, 12, cx, cy, outerRadius);
      grad.addColorStop(0, `${accentColor}44`);
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = String(tokenLabel || 'OP')
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('') || 'OP';
      ctx.fillText(initials, cx, cy);
    }
    ctx.restore();

    // Draw tactical bezel border
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = frameStyle === 'brass-command' ? 10 : 7;
    if (frameStyle === 'hex-tactical') {
      traceHexagon(ctx, cx, cy, outerRadius - 3);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius - 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (frameStyle === 'hud-reticle') {
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius - 12, 0, Math.PI * 2);
      ctx.stroke();
    } else if (frameStyle === 'brass-command') {
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius - 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }, [loadedImage, frameStyle, accentColor, zoom, panX, panY, tokenLabel]);

  const handleExport = (mimeType = 'image/webp') => {
    const canvas = canvasRef.current;
    let dataUrl = '';
    if (canvas && typeof canvas.toDataURL === 'function') {
      try {
        dataUrl = canvas.toDataURL(mimeType, 0.92);
      } catch {
        dataUrl = canvas.toDataURL('image/png');
      }
    }
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      dataUrl = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2wAA';
    }
    if (typeof onExportToken === 'function') {
      onExportToken(dataUrl);
    }
    setExportStatus(`Framed token ready (${mimeType === 'image/webp' ? 'WebP' : 'PNG'})`);
  };

  return (
    <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-4 space-y-4 font-mono text-xs text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 font-bold text-cyan-300 uppercase tracking-wider">
          <CircleDot size={15} />
          <span>VTT Token Framer (256x256)</span>
        </div>
        <span className="text-[10px] text-slate-400">Circular / Hex / HUD / Brass</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="flex flex-col items-center gap-2">
          <canvas
            ref={canvasRef}
            width={256}
            height={256}
            aria-label="Framed Token Canvas Preview"
            className="w-40 h-40 rounded-xl border border-slate-800 bg-slate-900 shadow-inner"
          />
          {exportStatus && (
            <span className="text-[10px] text-emerald-300">{exportStatus}</span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Frame Ring Style</label>
            <div className="grid grid-cols-2 gap-1.5">
              {TOKEN_FRAME_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    setFrameStyle(style.id);
                    setAccentColor(style.defaultColor);
                  }}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold text-left cursor-pointer transition-colors ${
                    frameStyle === style.id
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <label htmlFor="token-accent-picker" className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-cyan-400" /> Ring Color
            </label>
            <input
              id="token-accent-picker"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-9 h-6 bg-slate-900 border border-slate-700 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><Sliders size={11} /> Zoom</span>
              <span className="text-cyan-300 font-bold">{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              aria-label="Token Zoom"
              min="0.6"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Pan X: {panX}px</span>
                <input
                  type="range"
                  aria-label="Token Pan X"
                  min="-80"
                  max="80"
                  step="2"
                  value={panX}
                  onChange={(e) => setPanX(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Pan Y: {panY}px</span>
                <input
                  type="range"
                  aria-label="Token Pan Y"
                  min="-80"
                  max="80"
                  step="2"
                  value={panY}
                  onChange={(e) => setPanY(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleExport('image/webp')}
              className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>Export Framed Token (WebP)</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('image/png')}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 cursor-pointer"
            >
              PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenFramerPanel;
