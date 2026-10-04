/**
 * @file AtmosphericsWorkbench.jsx
 * @description Pillar 3: Atmospheric & Weather Profiles Studio.
 * Applies dynamic environmental lighting tints, fog density, audio loops, and hazard rules
 * directly to the module's tactical maps with real-time VTT synchronization.
 */

import React, { useState } from 'react';
import { 
  CloudRain, 
  Volume2, 
  VolumeX, 
  SunMedium, 
  Wind, 
  Sparkles, 
  Check, 
  Layers,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { ATMOSPHERIC_PRESETS } from '../PresetsAndScriptsDashboard';
import { AudioService } from '../../../../services/audioService';
import { VttEventBus } from '../../../../utils/vttEventBus';

export const AtmosphericsWorkbench = ({
  allMaps = [],
  selectedMapId = null,
  onSelectMapId,
  onApplyAtmosphereToMap
}) => {
  const [activePreset, setActivePreset] = useState(ATMOSPHERIC_PRESETS[0]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [customTint, setCustomTint] = useState(ATMOSPHERIC_PRESETS[0].tint);
  const [customFog, setCustomFog] = useState(ATMOSPHERIC_PRESETS[0].fogDensity);
  const [appliedMapSuccess, setAppliedMapSuccess] = useState(false);

  const targetMap = allMaps.find(m => m.id === selectedMapId) || allMaps[0] || null;

  const handleSelectPreset = (preset) => {
    AudioService.playTerminalBeep(1200, 0.03);
    setActivePreset(preset);
    setCustomTint(preset.tint);
    setCustomFog(preset.fogDensity);
  };

  const handleToggleAudio = () => {
    AudioService.playTerminalBeep(isAudioPlaying ? 500 : 1100, 0.05);
    setIsAudioPlaying(!isAudioPlaying);
  };

  const handleApplyToMap = () => {
    if (!targetMap || !onApplyAtmosphereToMap) return;
    AudioService.playTerminalBeep(1400, 0.08);

    const atmosphereConfig = {
      presetId: activePreset.id,
      name: activePreset.name,
      tint: customTint,
      fogDensity: customFog,
      audioProfile: activePreset.audioProfile,
      modifiers: activePreset.modifiers,
      rule: activePreset.rule
    };

    onApplyAtmosphereToMap(targetMap.id, atmosphereConfig);

    // Emit live VTT signal for active stage canvas
    VttEventBus.emit('apply-atmospheric-preset', { presetKey: activePreset.id });

    setAppliedMapSuccess(true);
    setTimeout(() => setAppliedMapSuccess(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans select-none text-slate-100 overflow-y-auto pr-1">
      {/* ── TOP ACTION BAR ── */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <CloudRain size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Atmospheric & Weather Studio
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                WebGPU Shader Profiles
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bind lighting tints, volumetric fog, ambient audio drones, and environmental hazards to maps.
            </p>
          </div>
        </div>

        {/* Map Sector Target & Apply Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {allMaps.length > 0 && (
            <select
              value={targetMap?.id || ''}
              onChange={(e) => onSelectMapId?.(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              {allMaps.map(m => (
                <option key={m.id} value={m.id}>Sector: {m.title || m.name || 'Map'}</option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleToggleAudio}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAudioPlaying 
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {isAudioPlaying ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>{isAudioPlaying ? 'Mute Preview' : 'Preview Audio'}</span>
          </button>

          <button
            type="button"
            disabled={!targetMap}
            onClick={handleApplyToMap}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-black uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Check size={13} />
            <span>{appliedMapSuccess ? 'Applied to Sector!' : 'Apply to Sector'}</span>
          </button>
        </div>
      </div>

      {/* ── PRESETS TILES GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ATMOSPHERIC_PRESETS.map(preset => {
          const isSelected = activePreset.id === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#131b2c] border-cyan-500/70 shadow-[0_0_20px_rgba(34,211,238,0.2)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{preset.icon}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {preset.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white mb-1">{preset.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{preset.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 font-mono">
                <div className="text-[11px] text-cyan-300 flex items-center justify-between">
                  <span>Fog: {Math.round(preset.fogDensity * 100)}%</span>
                  <span>Audio: {preset.audioProfile}</span>
                </div>
                <div className="text-[10px] text-amber-300 italic bg-amber-950/20 p-1.5 rounded border border-amber-500/20">
                  {preset.rule}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ACTIVE PRESET FINE-TUNING PANEL ── */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          <SunMedium size={14} />
          <span>Active Atmosphere Fine-Tuning: {activePreset.name}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* Lighting Tint Color Picker */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-between">
              <span>Lighting Tint (HEX)</span>
              <span className="text-cyan-300">{customTint}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customTint}
                onChange={(e) => setCustomTint(e.target.value)}
                className="w-10 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={customTint}
                onChange={(e) => setCustomTint(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white px-2 py-1 rounded outline-none"
              />
            </div>
          </div>

          {/* Fog Density Slider */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>Volumetric Fog Density</span>
              <span className="text-cyan-300">{Math.round(customFog * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={customFog}
              onChange={(e) => setCustomFog(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer mt-2"
            />
          </div>

          {/* Environmental Hazard Rule */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <label className="text-[10px] font-bold uppercase text-amber-400">
              Environmental Hazard Rule
            </label>
            <p className="text-[11px] text-slate-300 leading-snug">
              {activePreset.rule}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtmosphericsWorkbench;
