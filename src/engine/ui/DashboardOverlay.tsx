/**
 * @file DashboardOverlay.tsx
 * @description Stage 6.1: Glass-Cockpit HUD overlay and React Portal.
 * Uses pointer-events: none on the root viewport container to allow panning/zooming
 * and interaction with the underlying WebGPU Stage canvas, while restoring
 * pointer-events: auto on interactive dockable widgets, vitals, and action bars.
 */

import React from 'react';
import { useEngineStore, selectAllFusedTokens } from '../state/VolatileSharder.ts';
import { Shield, Crosshair, Footprints, Radio, Activity, Heart, Flame, Sun, Users, Wind } from 'lucide-react';

export interface DashboardOverlayProps {
  campaignName?: string;
  selectedTokenId?: string | null;
  onSelectTokenId?: (id: string) => void;
  onInitiateAttack?: () => void;
  onInitiateMove?: () => void;
  onInitiateScan?: () => void;
  onToggleGuard?: () => void;
  isMoveModeActive?: boolean;
  activeStance?: 'normal' | 'guard' | 'overcharge' | 'aim';
  effectiveSpeedFt?: number;
  isDynamicLightingEnabled?: boolean;
  onToggleDynamicLighting?: () => void;
  onSpawnHazard?: (type: 'plasma_fire' | 'corrosive_gas' | 'void_mist' | 'smoke') => void;
  onClearHazards?: () => void;
  hazardCount?: number;
  isMultiplayerSimActive?: boolean;
  onToggleMultiplayerSim?: () => void;
  onOpenOmnicortex?: () => void;
  onOpenFolio?: () => void;
  onOpenStoryFoundry?: () => void;
  onToggleTacticalGrid?: () => void;
  onPingStage?: (x: number, y: number) => void;
}

export const DashboardOverlay: React.FC<DashboardOverlayProps> = ({
  campaignName = 'TANGENT SECTOR COMMAND',
  selectedTokenId,
  onSelectTokenId,
  onInitiateAttack,
  onInitiateMove,
  onInitiateScan,
  onToggleGuard,
  isMoveModeActive = false,
  activeStance = 'normal',
  effectiveSpeedFt = 30,
  isDynamicLightingEnabled = true,
  onToggleDynamicLighting,
  onSpawnHazard,
  onClearHazards,
  hazardCount = 0,
  isMultiplayerSimActive = false,
  onToggleMultiplayerSim
}) => {
  const tokens = useEngineStore(selectAllFusedTokens);
  const activeToken = tokens.find(t => t.id === selectedTokenId) || tokens[0] || null;

  const handleTokenSelect = (id: string) => {
    if (onSelectTokenId) {
      onSelectTokenId(id);
    }
  };

  const hasSlowCondition = activeToken?.active_conditions?.some(c => 
    c.toLowerCase().includes('slow') || c.toLowerCase().includes('cripple') || c.toLowerCase().includes('leg') || c.toLowerCase().includes('disabled')
  );

  const displaySpeedFt = effectiveSpeedFt || activeToken?.speed_ft || 30;
  const displaySpeedCells = Math.floor(displaySpeedFt / 5);

  return (
    <div 
      className="absolute inset-0 w-full h-full z-[100] overflow-hidden select-none pointer-events-none"
    >
      {/* ── Top Left Heading Block (Under Main Title Bar) ── */}
      <div 
        className="absolute top-4 left-4 inline-flex items-center gap-2.5 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-2xl pointer-events-auto"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
        <div className="flex items-center gap-2 font-mono">
          <span className="text-cyan-400 text-xs sm:text-sm tracking-wider font-bold">
            {campaignName}
          </span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">| THE STAGE HUD</span>
        </div>
      </div>

      {/* ── Operative Vitals Cockpit Panel (Left - Positioned under heading block) ── */}
      {activeToken && (
        <aside 
          className="absolute top-16 left-4 w-76 p-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl shadow-2xl text-slate-200 pointer-events-auto transition-all"
        >
          {/* Header & Token Selector */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-cyan-300 font-mono truncate">{activeToken.name}</h3>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-[9px] font-mono text-cyan-400 font-bold">
                  TL{activeToken.tech_level || 3}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                {activeToken.species || 'Alterian'} • {activeToken.archetype || 'Infiltrator'}
              </p>
            </div>
            <select
              value={activeToken.id}
              onChange={(e) => handleTokenSelect(e.target.value)}
              className="text-xs font-mono px-2 py-1 rounded-lg bg-slate-950 text-cyan-400 border border-cyan-800/60 focus:outline-none cursor-pointer shrink-0"
              title="Select Active Token"
            >
              {tokens.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Vitals Progress Bar */}
          <div className="space-y-2.5 font-mono text-xs">
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Heart size={11} className="text-emerald-400" /> VITALITY / HP
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">{activeToken.current_hp} / {activeToken.base_hp}</span>
                  <div className="flex gap-1 ml-1">
                    <button
                      onClick={() => useEngineStore.getState().healHP(activeToken.id, 5)}
                      className="px-1 py-0.2 text-[9px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded border border-emerald-800 cursor-pointer"
                      title="Quick Heal +5 HP"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => useEngineStore.getState().applyDamage(activeToken.id, 5)}
                      className="px-1 py-0.2 text-[9px] bg-red-950 hover:bg-red-900 text-red-300 rounded border border-red-800 cursor-pointer"
                      title="Quick Damage -5 HP"
                    >
                      -5
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    (activeToken.current_hp / activeToken.base_hp) <= 0.25 
                      ? 'bg-red-500 animate-pulse' 
                      : (activeToken.current_hp / activeToken.base_hp) <= 0.5 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, (activeToken.current_hp / activeToken.base_hp) * 100))}%` }}
                />
              </div>
            </div>

            {/* Tactical Stats Grid (Armor DR, Size Mod, Dynamic Speed) */}
            <div className="grid grid-cols-3 gap-1.5 text-[10.5px]">
              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80 text-center">
                <span className="text-[9px] text-slate-400 block">ARMOR DR</span>
                <span className="text-amber-400 font-bold">{activeToken.armor_dr}</span>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80 text-center">
                <span className="text-[9px] text-slate-400 block">SIZE MOD</span>
                <span className="text-purple-400 font-bold">
                  {activeToken.size_modifier >= 0 ? `+${activeToken.size_modifier}` : activeToken.size_modifier}
                </span>
              </div>
              <div className={`p-1.5 rounded-lg border text-center ${
                hasSlowCondition 
                  ? 'bg-red-950/50 border-red-800/80' 
                  : 'bg-slate-950/70 border-slate-800/80'
              }`}>
                <span className="text-[9px] text-slate-400 block">SPEED</span>
                <span className={`font-bold ${hasSlowCondition ? 'text-red-400' : 'text-cyan-400'}`}>
                  {displaySpeedFt}ft
                </span>
              </div>
            </div>

            {/* Active Conditions */}
            {activeToken.active_conditions && activeToken.active_conditions.length > 0 && (
              <div className="pt-1.5 border-t border-slate-800">
                <span className="text-[9.5px] text-slate-400 block mb-1 flex items-center gap-1">
                  <Activity size={10} className="text-amber-400" /> ACTIVE CONDITIONS
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeToken.active_conditions.map(cond => (
                    <span 
                      key={cond} 
                      onClick={() => useEngineStore.getState().toggleCondition(activeToken.id, cond)}
                      className="px-1.5 py-0.5 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-700/60 rounded text-[9.5px] font-mono cursor-pointer flex items-center gap-1 group transition-colors"
                      title="Click to remove condition"
                    >
                      <span>{cond}</span>
                      <span className="text-[8px] text-red-400 group-hover:text-white">✕</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ── Floating Tactical Action Bar (Bottom Center) ── */}
      <footer 
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2.5 p-2.5 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(34,211,238,0.2)] pointer-events-auto"
      >
        {/* 1. Attack / Strike Button */}
        <button 
          onClick={onInitiateAttack}
          className="px-3.5 py-2 text-xs font-mono font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 border border-red-400/50 rounded-xl transition-all shadow-lg shadow-red-950/50 flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Open Combat Strike Panel"
        >
          <Crosshair size={14} />
          <span>ATTACK / STRIKE</span>
        </button>

        {/* 2. Dynamic Movement Button */}
        <button 
          onClick={onInitiateMove}
          className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border ${
            isMoveModeActive 
              ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse' 
              : 'bg-cyan-950/70 hover:bg-cyan-900 text-cyan-200 border-cyan-500/40'
          }`}
          title="Toggle Waypoint & Movement Distance Ruler"
        >
          <Footprints size={14} />
          <span>MOVE ({displaySpeedFt} FT / {displaySpeedCells} CELLS)</span>
        </button>

        {/* 3. Tactical Scan / LoS */}
        <button 
          onClick={onInitiateScan}
          className="px-3.5 py-2 text-xs font-mono font-bold text-amber-200 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Perform Tactical Sensor Scan"
        >
          <Radio size={14} />
          <span>SCAN / LOOS</span>
        </button>

        {/* 4. Guard / Stance Toggle */}
        <button 
          onClick={onToggleGuard}
          className={`px-3 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border ${
            activeStance === 'guard'
              ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Toggle Full Defense (+2 Armor DR)"
        >
          <Shield size={14} />
          <span>{activeStance === 'guard' ? 'GUARD ACTIVE (+2 DR)' : 'GUARD'}</span>
        </button>

        <div className="h-6 w-px bg-slate-700 mx-0.5" />

        {/* 5. Dynamic Lighting & FX Controls */}
        <button
          onClick={onToggleDynamicLighting}
          className={`p-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
            isDynamicLightingEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title="Toggle Dynamic Radial Lighting & Ambient Darkness"
        >
          <Sun size={14} />
          <span className="hidden xl:inline">{isDynamicLightingEnabled ? 'LIGHTS ON' : 'LIGHTS OFF'}</span>
        </button>

        {/* 6. Hazard Spawner */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSpawnHazard && onSpawnHazard('plasma_fire')}
            className="p-2 bg-orange-950/60 hover:bg-orange-900/80 text-orange-300 border border-orange-600/50 rounded-xl text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
            title="Spawn Plasma Fire Hazard Particle Field"
          >
            <Flame size={14} />
            <span className="hidden xl:inline">+Plasma</span>
          </button>
          <button
            onClick={() => onSpawnHazard && onSpawnHazard('smoke')}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-xl text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
            title="Spawn Smoke Occlusion Particle Field"
          >
            <Wind size={14} />
            <span className="hidden xl:inline">+Smoke</span>
          </button>
          {hazardCount > 0 && onClearHazards && (
            <button
              onClick={onClearHazards}
              className="px-2 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700/50 rounded-xl text-[10px] font-mono cursor-pointer"
              title="Clear all active hazard fields"
            >
              Clear ({hazardCount})
            </button>
          )}
        </div>

        <div className="h-6 w-px bg-slate-700 mx-0.5" />

        {/* 7. Multiplayer Presence / Simulation Indicator */}
        <button
          onClick={onToggleMultiplayerSim}
          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            isMultiplayerSimActive
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
          }`}
          title="Toggle Simulated Teammate Live Cursor Telemetry"
        >
          <Users size={13} className={isMultiplayerSimActive ? 'text-emerald-400' : 'text-slate-500'} />
          <span>{isMultiplayerSimActive ? 'LIVE PEERS (3)' : 'LOCAL MODE'}</span>
        </button>
      </footer>
    </div>
  );
};
