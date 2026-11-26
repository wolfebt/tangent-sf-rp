/**
 * @file CollisionHullEditor.tsx
 * @description Interactive visual editor for defining custom collision and line-of-sight polygon boundaries.
 * Supports click-to-append vertices, pointer-drag repositioning, grid snapping, and shape presets.
 */

import React, { useState, useRef } from 'react';
import { Trash2, RotateCcw, Shield } from 'lucide-react';

export interface CollisionHullEditorProps {
  imageUrl: string;
  points: Array<[number, number]>; // Normalized coordinates (0.0 to 1.0)
  onChange: (points: Array<[number, number]>) => void;
  width?: number;
  height?: number;
}

const HULL_PRESETS: Record<string, Array<[number, number]>> = {
  Box: [
    [0.05, 0.05],
    [0.95, 0.05],
    [0.95, 0.95],
    [0.05, 0.95]
  ],
  Inset: [
    [0.15, 0.15],
    [0.85, 0.15],
    [0.85, 0.85],
    [0.15, 0.85]
  ],
  Octagon: [
    [0.3, 0.05],
    [0.7, 0.05],
    [0.95, 0.3],
    [0.95, 0.7],
    [0.7, 0.95],
    [0.3, 0.95],
    [0.05, 0.7],
    [0.05, 0.3]
  ],
  Diamond: [
    [0.5, 0.05],
    [0.95, 0.5],
    [0.5, 0.95],
    [0.05, 0.5]
  ]
};

export const CollisionHullEditor: React.FC<CollisionHullEditorProps> = ({
  imageUrl,
  points,
  onChange,
  width = 300,
  height = 300
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const draggedMovedRef = useRef<boolean>(false);

  const normalizePoint = (clientX: number, clientY: number): [number, number] | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    let x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    let y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    if (snapToGrid) {
      x = Math.round(x * 20) / 20;
      y = Math.round(y * 20) / 20;
    } else {
      x = Math.round(x * 100) / 100;
      y = Math.round(y * 100) / 100;
    }
    return [x, y];
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedMovedRef.current) {
      draggedMovedRef.current = false;
      return;
    }
    const pt = normalizePoint(e.clientX, e.clientY);
    if (!pt) return;
    const newPoints = [...points, pt];
    onChange(newPoints);
    setSelectedIndex(newPoints.length - 1);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIndex === null) return;
    const pt = normalizePoint(e.clientX, e.clientY);
    if (!pt) return;
    draggedMovedRef.current = true;
    const next = points.map((existing, idx) => (idx === draggingIndex ? pt : existing));
    onChange(next);
  };

  const handlePointerUp = () => {
    if (draggingIndex !== null) {
      setDraggingIndex(null);
    }
  };

  const handleReset = () => {
    onChange(HULL_PRESETS.Box);
    setSelectedIndex(null);
  };

  const handleRemovePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    onChange(newPoints);
    setSelectedIndex(null);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
        <span className="flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Collision &amp; LoS Polygon ({points.length} vertices)</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center space-x-1 text-[10px] text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              className="accent-cyan-500"
            />
            <span>Snap 5%</span>
          </label>
          {Object.entries(HULL_PRESETS).map(([presetName, presetPts]) => (
            <button
              key={presetName}
              type="button"
              onClick={() => {
                onChange(presetPts);
                setSelectedIndex(null);
              }}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 border border-slate-700"
            >
              {presetName}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          {selectedIndex !== null && (
            <button
              type="button"
              onClick={() => handleRemovePoint(selectedIndex)}
              className="flex items-center space-x-1 text-[10px] text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete Vertex</span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="relative bg-slate-950 border border-slate-700 rounded overflow-hidden cursor-crosshair select-none flex items-center justify-center touch-none"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Asset Hull"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2"
          />
        ) : (
          <span className="text-slate-600 font-mono text-xs pointer-events-none">No Texture Loaded</span>
        )}

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {points.length > 1 && (
            <polygon
              points={points.map(([px, py]) => `${px * width},${py * height}`).join(' ')}
              fill="rgba(6, 182, 212, 0.2)"
              stroke="#06b6d4"
              strokeWidth="2"
            />
          )}
        </svg>

        {points.map(([px, py], idx) => (
          <div
            key={idx}
            onPointerDown={(e) => {
              e.stopPropagation();
              draggedMovedRef.current = false;
              setSelectedIndex(idx);
              setDraggingIndex(idx);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(idx);
            }}
            style={{
              left: `${px * width}px`,
              top: `${py * height}px`
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 cursor-grab active:cursor-grabbing transition-transform ${
              selectedIndex === idx
                ? 'bg-amber-400 border-white scale-125 z-10'
                : 'bg-cyan-500 border-slate-900 hover:scale-110'
            }`}
            title={`Vertex ${idx + 1}: (${px}, ${py})`}
          />
        ))}
      </div>
      <p className="text-[10px] font-mono text-slate-500">
        Click to append vertices, drag handles to reshape, or pick a hull preset above.
      </p>
    </div>
  );
};

export default CollisionHullEditor;
