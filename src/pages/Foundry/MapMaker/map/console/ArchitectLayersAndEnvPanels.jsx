import React from 'react';
import {
  DEFAULT_LAYERS
} from '../MapConstants';
import { Layers, CloudMoon } from 'lucide-react';

export const ENV_PRESETS = [
  { id: 'zero_g', label: 'Zero-G Drift', icon: '🌌', desc: 'Floating inertia / Acrobatics CR 12' },
  { id: 'smoke_fog', label: 'Dense Smoke', icon: '💨', desc: 'Heavy obscurement / +4 Cover DC' },
  { id: 'radiation_leak', label: 'High Radiation', icon: '☢️', desc: '1d6 Lethal tick per turn' },
  { id: 'vacuum_decomp', label: 'Vacuum Breach', icon: '🕳️', desc: 'Requires sealed EVA suits' },
  { id: 'plasma_surge', label: 'Thermal Plasma', icon: '🔥', desc: '4d10 thermal hazard damage' }
];

export function ArchitectLayersPanel({
  mapLayers = DEFAULT_LAYERS,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onDeleteCustomLayer,
  newLayerNameInput = '',
  setNewLayerNameInput,
  onAddCustomLayer,
  enableWallShadows = true,
  onToggleWallShadows,
  paintRoofLayer = false,
  onTogglePaintRoofLayer
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pb-1 border-b border-[#0D5C63]/50">
        <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider flex items-center gap-1.5">
          <Layers size={13} className="text-[#22d3ee]" />
          <span>Layer Compositor:</span>
        </span>
        <span className="text-[9px] font-mono text-slate-400">{mapLayers.length} Layers</span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-0.5">
        {mapLayers.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center justify-between p-2 rounded bg-[#0d1117]/90 border border-[#0D5C63]/50 text-xs transition-all hover:border-[#22d3ee]/50"
          >
            <div className="flex items-center gap-2 truncate pr-1">
              <button
                type="button"
                onClick={() => onToggleLayerVisibility?.(layer.id)}
                className={`text-sm transition-colors cursor-pointer ${layer.visible ? 'text-[#22d3ee]' : 'text-slate-600'}`}
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
              >
                {layer.visible ? '👁️' : '🙈'}
              </button>
              <button
                type="button"
                onClick={() => onToggleLayerLock?.(layer.id)}
                className={`text-sm transition-colors cursor-pointer ${layer.locked ? 'text-red-400' : 'text-slate-500'}`}
                title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
              >
                {layer.locked ? '🔒' : '🔓'}
              </button>
              <span className={`font-semibold text-xs truncate ${layer.visible ? 'text-white' : 'text-slate-500 line-through'}`}>
                {layer.name}
              </span>
            </div>

            {!DEFAULT_LAYERS.some(dl => dl.id === layer.id) && (
              <button
                type="button"
                onClick={() => onDeleteCustomLayer?.(layer.id)}
                className="text-slate-500 hover:text-red-400 font-bold px-1 cursor-pointer"
                title="Delete Custom Layer"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add New Layer Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAddCustomLayer?.(e);
        }}
        className="flex flex-col gap-1.5 pt-2 border-t border-[#0D5C63]/40 mt-1"
      >
        <label className="text-[10px] text-[#22d3ee] uppercase font-bold tracking-wider">New Layer Name:</label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={newLayerNameInput}
            onChange={e => setNewLayerNameInput?.(e.target.value)}
            placeholder="E.g. Upper Deck"
            className="flex-1 bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-cyan-950 border border-[#22d3ee]/60 hover:bg-cyan-900 text-[#22d3ee] font-bold text-xs rounded uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.3)]"
          >
            + Add
          </button>
        </div>
      </form>

      {(onToggleWallShadows || onTogglePaintRoofLayer) && (
        <div className="pt-2 border-t border-[#0D5C63]/40 flex flex-col gap-1.5 text-[11px]">
          {onToggleWallShadows && (
            <button
              type="button"
              onClick={onToggleWallShadows}
              className={`px-2 py-1 rounded border text-left font-bold cursor-pointer ${
                enableWallShadows ? 'bg-slate-800 border-cyan-500/60 text-cyan-300' : 'bg-[#0d1117] border-slate-700 text-slate-400'
              }`}
            >
              Wall Shadows: {enableWallShadows ? 'ON' : 'OFF'}
            </button>
          )}
          {onTogglePaintRoofLayer && (
            <button
              type="button"
              onClick={onTogglePaintRoofLayer}
              className={`px-2 py-1 rounded border text-left font-bold cursor-pointer ${
                paintRoofLayer ? 'bg-purple-950/70 border-purple-500/60 text-purple-200' : 'bg-[#0d1117] border-slate-700 text-slate-400'
              }`}
            >
              Roof Canopy Paint: {paintRoofLayer ? 'ACTIVE' : 'OFF'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ArchitectEnvironmentPanel({
  onApplyEnv,
  onBatchAction,
  activeSensorMode = 'standard_optical',
  setActiveSensorMode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pb-1 border-b border-purple-900/60">
        <span className="text-[10px] uppercase text-purple-300 font-bold tracking-wider flex items-center gap-1.5">
          <CloudMoon size={13} className="text-purple-400" />
          <span>Environment & Hazards:</span>
        </span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800 font-bold">
          ARCHITECT DECK
        </span>
      </div>

      {/* Tactical Sensor Spectrum Mode */}
      {setActiveSensorMode && (
        <div className="flex flex-col gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-2">
          <label className="text-[9px] uppercase font-bold text-cyan-300 tracking-wider">
            Tactical Sensor Spectrum:
          </label>
          <select
            aria-label="Sensor Spectrum Mode"
            value={activeSensorMode}
            onChange={(e) => setActiveSensorMode(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-cyan-200 text-xs rounded p-1.5 font-mono outline-none focus:border-cyan-400"
          >
            <option value="standard_optical">Standard Optical</option>
            <option value="thermal_ir">Thermal Infrared (IR)</option>
            <option value="cyber_em">Cyber EM / Net-Ping</option>
            <option value="metaphysical_aura">Metaphysical Aura</option>
          </select>
        </div>
      )}

      {/* Environmental Presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] uppercase font-bold text-slate-400">Dynamic Atmospheric Presets:</span>
        <div className="grid grid-cols-1 gap-1.5">
          {ENV_PRESETS.map(env => (
            <button
              key={env.id}
              type="button"
              onClick={() => onApplyEnv?.(env)}
              className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-purple-900/50 text-left flex items-start gap-2 transition-all cursor-pointer group"
            >
              <span className="text-base shrink-0">{env.icon}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300">
                  {env.label}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{env.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Batch Token Director Actions */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
        <span className="text-[9px] uppercase font-bold text-slate-400">Batch Token Directives:</span>
        <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => onBatchAction?.('reveal_all')}
            className="py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-center"
            title="Reveal all hidden tokens to players"
          >
            👁️ Reveal All
          </button>
          <button
            type="button"
            onClick={() => onBatchAction?.('stealth_all')}
            className="py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-center"
            title="Conceal enemy tokens into stealth"
          >
            🕶️ Stealth
          </button>
          <button
            type="button"
            onClick={() => onBatchAction?.('heal_party')}
            className="py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold transition-all cursor-pointer text-center"
            title="Restore party Vitality & Health"
          >
            💖 Rest Party
          </button>
        </div>
      </div>
    </div>
  );
}
