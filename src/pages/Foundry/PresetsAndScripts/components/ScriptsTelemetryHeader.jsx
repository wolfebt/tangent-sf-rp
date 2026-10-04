/**
 * @file ScriptsTelemetryHeader.jsx
 * @description Pillar 3: Presets & Scripts Telemetry Header & Tab Navigation.
 * Displays overall module automation coverage stats, in-situ simulation step controls,
 * and high-contrast glass-cockpit tab switches.
 */

import React from 'react';
import { 
  Cpu, 
  Bot, 
  ShieldAlert, 
  Code, 
  CloudRain, 
  Sliders, 
  FastForward, 
  Activity,
  Sparkles
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export const ScriptsTelemetryHeader = ({
  activeTab = 'routines',
  onSelectTab,
  totalAssetsCount = 0,
  scriptedCount = 0,
  modifiersCount = 0,
  macrosCount = 0,
  onStepSimulationTurn
}) => {
  const coveragePercent = totalAssetsCount > 0 
    ? Math.round((scriptedCount / totalAssetsCount) * 100) 
    : 0;

  const handleTabClick = (tabId) => {
    AudioService.playTerminalBeep(1000, 0.02);
    onSelectTab(tabId);
  };

  const handleStepClick = () => {
    AudioService.playTerminalBeep(980, 0.08);
    onStepSimulationTurn?.();
  };

  return (
    <header className="px-5 py-3 border-b border-slate-800 bg-[#0c121e] flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-md select-none font-sans">
      {/* Left Title & Telemetry Metrics */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0">
          <Cpu size={19} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-wider uppercase font-mono text-purple-300">
              Presets & Scripts Studio
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-900 border border-slate-700 text-slate-400">
              Pillar 3 · ⌘3
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
            <span>Coverage: <strong className="text-emerald-400">{coveragePercent}%</strong> ({scriptedCount}/{totalAssetsCount})</span>
            <span>·</span>
            <span>Macros: <strong className="text-fuchsia-400">{macrosCount}</strong></span>
            <span>·</span>
            <span>Modifiers: <strong className="text-amber-400">{modifiersCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Right Controls: In-situ Simulation Step & Sub-Tabs */}
      <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
        {/* In-Situ Simulation Step Control */}
        <button
          type="button"
          onClick={handleStepClick}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Advances all active NPC patrols on the VTT Stage by 1 step in-situ"
        >
          <FastForward size={13} className="text-purple-400" />
          <span>Step Simulation Turn</span>
        </button>

        {/* Pillar Sub-Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => handleTabClick('routines')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'routines'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot size={13} />
            <span>Unit Routines</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('traps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'traps'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert size={13} />
            <span>Smart Props & Traps</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('macros')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'macros'
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code size={13} />
            <span>QuickJS Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('atmospherics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'atmospherics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain size={13} />
            <span>Atmospherics</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('modifiers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'modifiers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={13} />
            <span>Modifiers ({modifiersCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ScriptsTelemetryHeader;
