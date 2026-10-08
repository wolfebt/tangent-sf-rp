/**
 * @file CollisionHullEditor.tsx
 * @description Interactive visual editor for defining custom collision and line-of-sight polygon boundaries.
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

export const CollisionHullEditor: React.FC<CollisionHullEditorProps> = ({
  imageUrl,
  points,
  onChange,
  width = 300,
  height = 300
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Add new polygon point
    const newPoints = [...points, [Math.round(x * 100) / 100, Math.round(y * 100) / 100] as [number, number]];
    onChange(newPoints);
    setSelectedIndex(newPoints.length - 1);
  };

  const handleReset = () => {
    // Default box footprint
    onChange([
      [0.05, 0.05],
      [0.95, 0.05],
      [0.95, 0.95],
      [0.05, 0.95]
    ]);
    setSelectedIndex(null);
  };

  const handleRemovePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    onChange(newPoints);
    setSelectedIndex(null);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-slate-300">
        <span className="flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Collision & LoS Polygon ({points.length} vertices)</span>
        </span>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Box</span>
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
        style={{ width: `${width}px`, height: `${height}px` }}
        className="relative bg-slate-950 border border-slate-700 rounded overflow-hidden cursor-crosshair select-none flex items-center justify-center"
      >
        {/* Background Texture Preview */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Asset Hull"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2"
          />
        ) : (
          <span className="text-slate-600 font-mono text-xs pointer-events-none">No Texture Loaded</span>
        )}

        {/* SVG Polygon Overlay */}
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

        {/* Clickable Vertices */}
        {points.map(([px, py], idx) => (
          <div
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(idx);
            }}
            style={{
              left: `${px * width}px`,
              top: `${py * height}px`
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-transform ${
              selectedIndex === idx
                ? 'bg-amber-400 border-white scale-125 z-10'
                : 'bg-cyan-500 border-slate-900 hover:scale-110'
            }`}
            title={`Vertex ${idx + 1}: (${px}, ${py})`}
          />
        ))}
      </div>
      <p className="text-[10px] font-mono text-slate-500">
        Click anywhere on the preview to append polygon points. Click a point to select or delete.
      </p>
    </div>
  );
};

export default CollisionHullEditor;
