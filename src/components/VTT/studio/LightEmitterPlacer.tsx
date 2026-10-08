/**
 * @file LightEmitterPlacer.tsx
 * @description Interactive visual editor for placing dynamic light source pins on assets.
 */

import React, { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import type { DynamicLightProperties } from '../../../schemas/assetUnitSchema';

export interface LightEmitterPlacerProps {
  imageUrl: string;
  lightingProps: DynamicLightProperties;
  onChange: (props: DynamicLightProperties) => void;
  width?: number;
  height?: number;
}

export const LightEmitterPlacer: React.FC<LightEmitterPlacerProps> = ({
  imageUrl,
  lightingProps,
  onChange,
  width = 280,
  height = 280
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    onChange({
      ...lightingProps,
      emits: true,
      offsetCoords: [Math.round(x * 100) / 100, Math.round(y * 100) / 100]
    });
  };

  const pinCoords = lightingProps.offsetCoords || [0.5, 0.5];

  return (
    <div className="flex flex-col space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between text-slate-300">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lightingProps.emits}
            onChange={(e) => onChange({ ...lightingProps, emits: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
          />
          <span className="font-semibold text-slate-200">Emits Dynamic Light</span>
        </label>
        {lightingProps.emits && (
          <span className="text-[10px] text-amber-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Active Pin</span>
          </span>
        )}
      </div>

      {lightingProps.emits && (
        <>
          {/* Interactive Light Pin Canvas */}
          <div
            ref={containerRef}
            onClick={handleCanvasClick}
            style={{ width: `${width}px`, height: `${height}px` }}
            className="relative bg-slate-950 border border-slate-700 rounded overflow-hidden cursor-pointer select-none mx-auto"
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Light Preview"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2"
              />
            )}

            {/* Simulated Glow Aura */}
            <div
              style={{
                left: `${pinCoords[0] * width}px`,
                top: `${pinCoords[1] * height}px`,
                backgroundColor: lightingProps.color,
                boxShadow: `0 0 30px 10px ${lightingProps.color}66`
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none transition-all duration-300"
            />
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            Click on the sprite above to relocate the dynamic light emission origin.
          </p>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Emission Color</label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="color"
                  value={lightingProps.color}
                  onChange={(e) => onChange({ ...lightingProps, color: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={lightingProps.color}
                  onChange={(e) => onChange({ ...lightingProps, color: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Animation</label>
              <select
                value={lightingProps.animation}
                onChange={(e) => onChange({ ...lightingProps, animation: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
              >
                <option value="solid">Solid (Steady)</option>
                <option value="torch_flicker">Torch Flicker</option>
                <option value="pulse">Rhythmic Pulse</option>
                <option value="emergency_strobe">Emergency Strobe</option>
                <option value="fluorescent_flicker">Fluorescent Hum</option>
                <option value="plasma_churn">Plasma Churn</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Bright Radius (ft)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={lightingProps.radiusBrightFt}
                onChange={(e) => onChange({ ...lightingProps, radiusBrightFt: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Dim Radius (ft)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={lightingProps.radiusDimFt}
                onChange={(e) => onChange({ ...lightingProps, radiusDimFt: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LightEmitterPlacer;
