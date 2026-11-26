/**
 * @file ChromaKeyTool.tsx
 * @description Interactive background chroma-keyer and edge defringer for stripping
 * solid backgrounds (green screen, magenta, black, white) from external sprite assets.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Pipette, RotateCcw, Check, X } from 'lucide-react';

export interface ChromaKeyToolProps {
  imageUrl: string;
  onApply: (cleanedDataUrl: string) => void;
  onCancel?: () => void;
}

export function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = String(hex || '#00ff00').replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return [r, g, b];
}

export function rgbTupleToHex([r, g, b]: [number, number, number]): string {
  return (
    '#' +
    [r, g, b]
      .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Pure pixel-buffer chroma-key and soft-feather defringer.
 * Mutates and returns `data` for zero-copy canvas efficiency.
 */
export function applyChromaKeyToImageData(
  data: Uint8ClampedArray,
  targetRgb: [number, number, number],
  tolerance: number,
  feather: number = 0
): Uint8ClampedArray {
  const [tr, tg, tb] = targetRgb;
  const tol = Math.max(0, tolerance);
  const fth = Math.max(0, feather);
  const outer = tol + fth;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;

    const dr = data[i] - tr;
    const dg = data[i + 1] - tg;
    const db = data[i + 2] - tb;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= tol) {
      data[i + 3] = 0;
    } else if (fth > 0 && dist < outer) {
      const ratio = (dist - tol) / fth;
      data[i + 3] = Math.round(a * ratio);
    }
  }
  return data;
}

const KEY_SWATCHES: Array<{ label: string; rgb: [number, number, number]; hex: string }> = [
  { label: 'Green', rgb: [0, 255, 0], hex: '#00ff00' },
  { label: 'Magenta', rgb: [255, 0, 255], hex: '#ff00ff' },
  { label: 'Black', rgb: [0, 0, 0], hex: '#000000' },
  { label: 'White', rgb: [255, 255, 255], hex: '#ffffff' }
];

export const ChromaKeyTool: React.FC<ChromaKeyToolProps> = ({
  imageUrl,
  onApply,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const [targetRgb, setTargetRgb] = useState<[number, number, number]>([0, 255, 0]);
  const [tolerance, setTolerance] = useState<number>(48);
  const [feather, setFeather] = useState<number>(18);
  const [loadError, setLoadError] = useState<string | null>(null);

  const renderPreview = (
    img: HTMLImageElement,
    rgb: [number, number, number],
    tol: number,
    fth: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = img.naturalWidth || 256;
    const h = img.naturalHeight || 256;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      applyChromaKeyToImageData(imgData.data, rgb, tol, fth);
      ctx.putImageData(imgData, 0, 0);
      setLoadError(null);
    } catch {
      setLoadError('Cross-origin image buffer is tainted; use a local file or same-origin texture.');
    }
  };

  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    const img = new Image();
    if (!imageUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (cancelled) return;
      sourceImageRef.current = img;
      renderPreview(img, targetRgb, tolerance, feather);
    };
    img.onerror = () => {
      if (!cancelled) setLoadError('Unable to decode image for chroma-key processing.');
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  useEffect(() => {
    if (sourceImageRef.current) {
      renderPreview(sourceImageRef.current, targetRgb, tolerance, feather);
    }
  }, [targetRgb, tolerance, feather]);

  const handleSampleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const img = sourceImageRef.current;
    if (!canvas || !img) return;
    const rect = canvas.getBoundingClientRect();
    const px = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const py = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    // Sample from untouched source image so already-keyed pixels can still be re-sampled
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tCtx = tmp.getContext('2d');
    if (!tCtx) return;
    tCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    try {
      const pixel = tCtx.getImageData(
        Math.max(0, Math.min(canvas.width - 1, px)),
        Math.max(0, Math.min(canvas.height - 1, py)),
        1,
        1
      ).data;
      setTargetRgb([pixel[0], pixel[1], pixel[2]]);
    } catch {
      // Ignore tainted canvas
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const out = canvas.toDataURL('image/png');
      onApply(out);
    } catch {
      setLoadError('Unable to export chroma-keyed PNG.');
    }
  };

  return (
    <div className="bg-slate-950 border border-cyan-800/70 rounded-lg p-3 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 text-cyan-300 font-semibold">
          <Pipette className="w-3.5 h-3.5" />
          <span>Chroma Key &amp; Alpha Defringer</span>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 p-0.5"
            aria-label="Close Chroma Key Tool"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loadError && (
        <div className="p-2 bg-rose-950/60 border border-rose-700/60 rounded text-rose-300 text-[11px]">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 flex flex-col items-center space-y-1.5">
          <div className="w-full max-w-[200px] aspect-square rounded border border-slate-700 bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0] bg-slate-900 flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              onClick={handleSampleCanvasClick}
              className="max-w-full max-h-full object-contain cursor-crosshair"
              title="Click any pixel to sample background color"
            />
          </div>
          <span className="text-[10px] text-slate-400">Click image to sample background color</span>
        </div>

        <div className="md:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Key Color</span>
            <div className="flex items-center space-x-1.5">
              {KEY_SWATCHES.map((sw) => (
                <button
                  key={sw.label}
                  type="button"
                  onClick={() => setTargetRgb(sw.rgb)}
                  title={sw.label}
                  style={{ backgroundColor: sw.hex }}
                  className="w-5 h-5 rounded border border-slate-600 hover:scale-110 transition-transform"
                />
              ))}
              <input
                type="color"
                value={rgbTupleToHex(targetRgb)}
                onChange={(e) => setTargetRgb(hexToRgbTuple(e.target.value))}
                className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                aria-label="Custom Key Color"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Color Tolerance</span>
              <span className="text-cyan-300">{tolerance}</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              value={tolerance}
              onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Edge Feather / Defringe</span>
              <span className="text-cyan-300">{feather}</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={feather}
              onChange={(e) => setFeather(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                setTargetRgb([0, 255, 0]);
                setTolerance(48);
                setFeather(18);
              }}
              className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              disabled={Boolean(loadError)}
              onClick={handleConfirm}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Clean Alpha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChromaKeyTool;
