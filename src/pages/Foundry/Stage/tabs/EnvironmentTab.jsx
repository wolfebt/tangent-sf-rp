/**
 * @file EnvironmentTab.jsx
 * @description Story Environmentals & Variables Tab for the STAGE compiler.
 * Allows adjusting lighting, weather, ambient soundscape, situational modifiers, and story variables.
 */

import React, { useState } from 'react';
import { 
  Sun, 
  CloudRain, 
  Volume2, 
  Sliders, 
  Plus, 
  Trash2, 
  Radio, 
  Sparkles, 
  Check, 
  AlertTriangle,
  Moon,
  Zap,
  Shield
} from 'lucide-react';
import { useStageStore } from '../stageStore';
import { useStory } from '../../../../context/CampaignContext';
import { AudioService } from '../../../../services/audioService';

export default function EnvironmentTab() {
  const { stageManifest, updateEnvironment, setStageVariable, removeStageVariable } = useStageStore();
  const { universeState, setUniverseState } = useStory();

  const [varKey, setVarKey] = useState('');
  const [varValue, setVarValue] = useState('');

  const env = stageManifest.environment || {};
  const currentLighting = env.lighting?.mode || 'normal';
  const currentWeather = env.weather || 'clear';
  const currentAudio = env.ambientAudio || 'none';
  const variables = stageManifest.variables || {};

  const lightingPresets = [
    { id: 'normal', label: 'Tactical Standard', icon: Sun, color: 'text-amber-300' },
    { id: 'dim', label: 'Dim / Twilight', icon: Moon, color: 'text-blue-300' },
    { id: 'pitch_black', label: 'Pitch Black (LoS Restrict)', icon: Moon, color: 'text-purple-400' },
    { id: 'night_vision', label: 'Night Vision NVG', icon: Zap, color: 'text-emerald-400' },
    { id: 'infra_red', label: 'Thermal Infrared', icon: Radio, color: 'text-red-400' },
    { id: 'neon', label: 'Cyberpunk Neon', icon: Sparkles, color: 'text-pink-400' }
  ];

  const weatherPresets = [
    { id: 'clear', label: 'Atmosphere Clear', icon: '☀️' },
    { id: 'acid_rain', label: 'Acid Rain Corrosive', icon: '🌧️' },
    { id: 'electrical_storm', label: 'EMP / Ion Storm', icon: '⚡' },
    { id: 'toxic_haze', label: 'Toxic Chem-Smog', icon: '☣️' },
    { id: 'radiation_leak', label: 'Radiation Flare', icon: '☢️' },
    { id: 'vacuum_breach', label: 'Zero-G Vacuum Breach', icon: '🌌' }
  ];

  const audioPresets = [
    { id: 'none', label: 'Silence' },
    { id: 'cyber_drone', label: 'Cyber Ambient Drone' },
    { id: 'rain_industrial', label: 'Heavy Acid Rain' },
    { id: 'combat_pulse', label: 'Tactical Combat Pulse' },
    { id: 'alarm_klaxon', label: 'Red Alert Klaxon' }
  ];

  const handleSetLighting = (mode) => {
    updateEnvironment({ lighting: { mode, ambientIntensity: mode === 'dim' ? 0.4 : mode === 'pitch_black' ? 0.05 : 1.0 } });
    AudioService.playTerminalBeep(950, 0.02);
  };

  const handleSetWeather = (weather) => {
    updateEnvironment({ weather });
    AudioService.playTerminalBeep(950, 0.02);
  };

  const handleSetAudio = (ambientAudio) => {
    updateEnvironment({ ambientAudio });
    AudioService.playTerminalBeep(950, 0.02);
  };

  const handleAddVariable = (e) => {
    e.preventDefault();
    const cleanKey = varKey.trim().toUpperCase().replace(/\s+/g, '_');
    if (!cleanKey) return;

    let parsedVal = varValue.trim();
    if (parsedVal.toLowerCase() === 'true') parsedVal = true;
    else if (parsedVal.toLowerCase() === 'false') parsedVal = false;
    else if (!isNaN(Number(parsedVal)) && parsedVal !== '') parsedVal = Number(parsedVal);

    setStageVariable(cleanKey, parsedVal);
    setVarKey('');
    setVarValue('');
    AudioService.playCriticalChime(true);
  };

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] overflow-y-auto p-4 md:p-6 space-y-6 font-mono text-slate-100">
      {/* Header */}
      <div className="p-3 px-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <Sliders size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Story Environmentals & Variables Ledger
            </h2>
            <p className="text-[10px] text-slate-400">
              Live lighting conditions, atmospheric hazards, audio soundscapes, and state flags
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── CARD 1: LIGHTING ENGINE ── */}
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-lg">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Sun size={14} />
            <span>1. Stage Lighting Engine</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {lightingPresets.map((lp) => {
              const Icon = lp.icon;
              const isSelected = currentLighting === lp.id;
              return (
                <button
                  key={lp.id}
                  type="button"
                  onClick={() => handleSetLighting(lp.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} className={isSelected ? lp.color : 'text-slate-500'} />
                  <span className="text-xs font-bold truncate">{lp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CARD 2: ATMOSPHERIC WEATHER & HAZARDS ── */}
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-lg">
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <CloudRain size={14} />
            <span>2. Atmospheric Weather & Hazards</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {weatherPresets.map((wp) => {
              const isSelected = currentWeather === wp.id;
              return (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => handleSetWeather(wp.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{wp.icon}</span>
                  <span className="text-xs font-bold truncate">{wp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CARD 3: AMBIENT SOUNDSCAPE ── */}
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-lg">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Volume2 size={14} />
            <span>3. Audio Ambience & Soundscape</span>
          </span>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Active Ambience Track</label>
            <select
              value={currentAudio}
              onChange={(e) => handleSetAudio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-purple-500 outline-none"
            >
              {audioPresets.map(ap => (
                <option key={ap.id} value={ap.id}>{ap.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── CARD 4: STAGE VARIABLES / STATE LEDGER ── */}
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={14} />
              <span>4. Stage Variables Ledger</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {Object.keys(variables).length} Flags
            </span>
          </div>

          {/* Form to add variable */}
          <form onSubmit={handleAddVariable} className="flex items-center gap-2">
            <input
              type="text"
              value={varKey}
              onChange={(e) => setVarKey(e.target.value)}
              placeholder="VARIABLE_KEY"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 uppercase font-mono"
            />
            <input
              type="text"
              value={varValue}
              onChange={(e) => setVarValue(e.target.value)}
              placeholder="Value"
              className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase cursor-pointer transition-colors shadow-xs"
            >
              <Plus size={13} />
            </button>
          </form>

          {/* Variables List */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
            {Object.keys(variables).length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No variables set. Add a variable above to track state.</p>
            ) : (
              Object.entries(variables).map(([k, v]) => (
                <div key={k} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-cyan-400 font-bold">{k}:</span>
                    <span className="text-white">{String(v)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStageVariable(k)}
                    className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
