/**
 * @file ShaderTintCustomizer.tsx
 * @description Real-time visual shader customizer for recoloring, tinting, and styling map tiles.
 */

import React from 'react';
import { Palette, RefreshCw } from 'lucide-react';
import type { VisualVariants } from '../../../schemas/assetUnitSchema';

export interface ShaderTintCustomizerProps {
  imageUrl: string;
  customization?: VisualVariants['customization'];
  onChange: (customization: NonNullable<VisualVariants['customization']>) => void;
  width?: number;
  height?: number;
}

const PRESET_TINTS = [
  { label: 'Original', tint: '#ffffff', hue: 0, sat: 1.0, bri: 1.0, con: 1.0 },
  { label: 'Rust Oxide', tint: '#c2410c', hue: 20, sat: 1.4, bri: 0.9, con: 1.2 },
  { label: 'Toxic Acid', tint: '#16a34a', hue: 100, sat: 1.6, bri: 1.1, con: 1.1 },
  { label: 'Cyber Neon', tint: '#06b6d4', hue: 180, sat: 1.8, bri: 1.2, con: 1.3 },
  { label: 'Abyssal Void', tint: '#581c87', hue: 270, sat: 1.5, bri: 0.8, con: 1.4 },
  { label: 'Scorched Ash', tint: '#3f3f46', hue: 0, sat: 0.1, bri: 0.7, con: 1.5 }
];

export const ShaderTintCustomizer: React.FC<ShaderTintCustomizerProps> = ({
  imageUrl,
  customization,
  onChange,
  width = 240,
  height = 240
}) => {
  const current = {
    tintColor: customization?.tintColor || '#ffffff',
    hueRotation: customization?.hueRotation ?? 0,
    saturation: customization?.saturation ?? 1.0,
    brightness: customization?.brightness ?? 1.0,
    contrast: customization?.contrast ?? 1.0
  };

  const applyPreset = (preset: typeof PRESET_TINTS[0]) => {
    onChange({
      tintColor: preset.tint,
      hueRotation: preset.hue,
      saturation: preset.sat,
      brightness: preset.bri,
      contrast: preset.con
    });
  };

  const filterStyle = `
    hue-rotate(${current.hueRotation}deg)
    saturate(${current.saturation})
    brightness(${current.brightness})
    contrast(${current.contrast})
  `;

  return (
    <div className="flex flex-col space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between text-slate-300">
        <span className="flex items-center space-x-1 font-semibold">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dynamic Shader & Tint Customizer</span>
        </span>
        <button
          type="button"
          onClick={() => applyPreset(PRESET_TINTS[0])}
          className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-slate-200"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Preset Swatches */}
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
        {PRESET_TINTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700 hover:border-cyan-500 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Live Preview Viewport */}
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className="relative bg-slate-950 border border-slate-700 rounded overflow-hidden flex items-center justify-center mx-auto"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Shader Preview"
            style={{
              filter: filterStyle,
              backgroundColor: current.tintColor !== '#ffffff' ? `${current.tintColor}33` : undefined
            }}
            className="w-full h-full object-contain p-2 transition-all duration-150"
          />
        ) : (
          <span className="text-slate-600">No Image</span>
        )}
      </div>

      {/* Sliders */}
      <div className="space-y-2 pt-1">
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Hue Rotation</span>
            <span>{current.hueRotation}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={current.hueRotation}
            onChange={(e) => onChange({ ...current, hueRotation: parseInt(e.target.value, 10) })}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Saturation</span>
            <span>{Math.round(current.saturation * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.05"
            value={current.saturation}
            onChange={(e) => onChange({ ...current, saturation: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Brightness</span>
            <span>{Math.round(current.brightness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2"
            step="0.05"
            value={current.brightness}
            onChange={(e) => onChange({ ...current, brightness: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Contrast</span>
            <span>{Math.round(current.contrast * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={current.contrast}
            onChange={(e) => onChange({ ...current, contrast: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default ShaderTintCustomizer;
