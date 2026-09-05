/**
 * @file TokenContextualPill.tsx
 * @description Floating On-Canvas Contextual Action Pill for Selected Tokens.
 * Implements Fitts's Law optimization: provides immediate adjustments for dual Vitality & Health,
 * synthetic Structure Points (SP), Conditions, Elevation, and Player Visibility directly on the stage.
 */

import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Flame, 
  ShieldAlert, 
  Target, 
  Zap,
  Activity,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { useEngineStore, selectAllFusedTokens } from '../../../engine/index';
import type { FusedToken } from '../../../engine/index';

const QUICK_CONDITIONS = [
  { id: 'cover', label: 'Cover', icon: <ShieldAlert size={10} />, color: 'border-cyan-500/60 text-cyan-300' },
  { id: 'aim', label: 'Aiming', icon: <Target size={10} />, color: 'border-amber-500/60 text-amber-300' },
  { id: 'burning', label: 'Burn', icon: <Flame size={10} />, color: 'border-red-500/60 text-red-300' },
  { id: 'stunned', label: 'Stun', icon: <Zap size={10} />, color: 'border-purple-500/60 text-purple-300' }
];

export const TokenContextualPill: React.FC = () => {
  const fusedTokens = useEngineStore(selectAllFusedTokens);
  const selectedToken: FusedToken | undefined = fusedTokens.find((t: FusedToken) => t.is_selected);
  const [showConditionsDropdown, setShowConditionsDropdown] = useState(false);

  if (!selectedToken) return null;

  const { id, name, elevation_ft = 0, active_conditions = [], is_hidden } = selectedToken;

  const isSynthetic = !!selectedToken.is_synthetic || (selectedToken.species?.toLowerCase().includes('synthetic') ?? false);
  const vitCurrent = selectedToken.current_vitality ?? selectedToken.base_vitality ?? 30;
  const vitMax = selectedToken.base_vitality ?? 30;
  const hpCurrent = selectedToken.current_health ?? selectedToken.current_hp ?? selectedToken.base_hp ?? 30;
  const hpMax = selectedToken.base_health ?? selectedToken.base_hp ?? 30;
  const structCurrent = selectedToken.current_structure ?? selectedToken.base_structure ?? 60;
  const structMax = selectedToken.base_structure ?? 60;
  const stabilityPoints = selectedToken.stability_points ?? 10;

  const handleDamage = (amount: number, isLethal: boolean = true) => {
    useEngineStore.getState().applyDamage(id, amount, isLethal);
  };

  const handleHealVitality = (amount: number) => {
    useEngineStore.getState().healVitality(id, amount);
  };

  const handleHealHealth = (amount: number) => {
    useEngineStore.getState().healHealth(id, amount);
  };

  const handleHealStructure = (amount: number) => {
    useEngineStore.getState().healStructure(id, amount);
  };

  const handleToggleCondition = (condition: string) => {
    useEngineStore.getState().toggleCondition(id, condition);
  };

  const handleToggleHidden = () => {
    useEngineStore.getState().toggleHidden(id);
  };

  const handleElevationChange = (delta: number) => {
    const current = elevation_ft || 0;
    useEngineStore.getState().setElevation(id, Math.max(0, current + delta));
  };

  const handleDeselect = () => {
    useEngineStore.getState().clearSelection();
  };

  const vitPercent = Math.min(100, Math.max(0, (vitCurrent / vitMax) * 100));
  const hpPercent = Math.min(100, Math.max(0, (hpCurrent / hpMax) * 100));
  const structPercent = Math.min(100, Math.max(0, (structCurrent / structMax) * 100));

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-[#0b1017]/95 border border-cyan-500/50 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.8),0_0_12px_rgba(34,211,238,0.25)] backdrop-blur-md text-xs font-mono select-none pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
      {/* Token Name & Identity Chip */}
      <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-200">
        <Activity size={12} className="text-cyan-400 shrink-0" />
        <span className="font-bold truncate max-w-[110px]">{name}</span>
      </div>

      {/* Dynamic Survival Bars & Quick Adjustments */}
      {isSynthetic ? (
        <div className="flex items-center bg-slate-950/80 rounded-xl border border-slate-800 p-0.5">
          <button
            type="button"
            onClick={() => handleDamage(5, true)}
            className="px-1.5 py-0.5 rounded-lg hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors font-bold text-[10.5px]"
            title="Apply -5 Structural Damage"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => handleDamage(1, true)}
            className="px-1.5 py-0.5 rounded-lg hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors font-bold text-[10.5px]"
            title="Apply -1 Structural Damage"
          >
            -1
          </button>

          {/* SP Bar & Number */}
          <div className="px-2 flex flex-col items-center justify-center min-w-[80px]">
            <div className="flex items-center gap-1 text-[10px]">
              <Cpu size={10} className="text-amber-400" />
              <span className="font-bold text-amber-300">
                {structCurrent}/{structMax} SP
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-200"
                style={{ width: `${structPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleHealStructure(1)}
            className="px-1.5 py-0.5 rounded-lg hover:bg-amber-950/60 text-amber-400 hover:text-amber-300 transition-colors font-bold text-[10.5px]"
            title="Repair +1 SP"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => handleHealStructure(5)}
            className="px-1.5 py-0.5 rounded-lg hover:bg-amber-950/60 text-amber-400 hover:text-amber-300 transition-colors font-bold text-[10.5px]"
            title="Repair +5 SP"
          >
            +5
          </button>
        </div>
      ) : (
        <div className="flex items-center bg-slate-950/80 rounded-xl border border-slate-800 p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => handleDamage(5, true)}
            className="px-1.5 py-0.5 rounded-lg hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors font-bold text-[10px]"
            title="Apply -5 Lethal Damage"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => handleDamage(1, true)}
            className="px-1.5 py-0.5 rounded-lg hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors font-bold text-[10px]"
            title="Apply -1 Lethal Damage"
          >
            -1
          </button>

          {/* Dual Vitality & Health Bars */}
          <div className="px-2 flex flex-col items-center justify-center min-w-[90px] gap-0.5">
            {/* Vitality Bar */}
            <div className="w-full flex items-center justify-between text-[9px] text-cyan-300 font-bold">
              <span>VP</span>
              <span>{vitCurrent}/{vitMax}</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${vitPercent}%` }}
              />
            </div>

            {/* Health Bar */}
            <div className="w-full flex items-center justify-between text-[9px] text-rose-300 font-bold mt-0.5">
              <span>HP</span>
              <span>{hpCurrent}/{hpMax}</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-200 ${
                  hpCurrent <= 0 ? 'bg-rose-900 animate-pulse' : 'bg-rose-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {hpCurrent <= 0 && (
              <div className="text-[8.5px] text-red-400 font-bold flex items-center gap-0.5 animate-pulse">
                <AlertTriangle size={8} /> Bleedout ({stabilityPoints} stab)
              </div>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => handleHealVitality(5)}
              className="px-1 py-0.2 rounded hover:bg-cyan-950/60 text-cyan-400 hover:text-cyan-300 font-bold text-[9px]"
              title="Restore +5 Vitality (VP)"
            >
              +5 VP
            </button>
            <button
              type="button"
              onClick={() => handleHealHealth(5)}
              className="px-1 py-0.2 rounded hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 font-bold text-[9px]"
              title="Restore +5 Health (HP)"
            >
              +5 HP
            </button>
          </div>
        </div>
      )}

      {/* Elevation Controls */}
      <div className="flex items-center bg-slate-950/80 rounded-xl border border-slate-800 px-1 py-0.5 gap-0.5">
        <button
          type="button"
          onClick={() => handleElevationChange(5)}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-cyan-300 transition-colors"
          title="Raise Elevation (+5 ft)"
        >
          <ArrowUp size={11} />
        </button>
        <span className="text-[10px] text-slate-300 min-w-[32px] text-center font-bold">
          {elevation_ft}ft
        </span>
        <button
          type="button"
          onClick={() => handleElevationChange(-5)}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-cyan-300 transition-colors"
          title="Lower Elevation (-5 ft)"
        >
          <ArrowDown size={11} />
        </button>
      </div>

      {/* Quick Condition Toggles */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowConditionsDropdown(prev => !prev)}
          className={`px-2 py-1 rounded-xl border text-[10.5px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
            active_conditions.length > 0
              ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Tactical Status Conditions"
        >
          <span>COND</span>
          {active_conditions.length > 0 && (
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-black text-[8.5px] font-bold flex items-center justify-center">
              {active_conditions.length}
            </span>
          )}
        </button>

        {showConditionsDropdown && (
          <div className="absolute bottom-full mb-2 left-0 w-36 bg-[#0c1219] border border-slate-800 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 z-40">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 px-1 font-bold">
              Conditions
            </div>
            {QUICK_CONDITIONS.map((cond) => {
              const hasCondition = active_conditions.includes(cond.id);
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => handleToggleCondition(cond.id)}
                  className={`w-full px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center justify-between transition-all ${
                    hasCondition
                      ? `bg-slate-900 ${cond.color}`
                      : 'border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {cond.icon}
                    <span>{cond.label}</span>
                  </div>
                  {hasCondition && <span className="text-cyan-400 text-xs">&bull;</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Player Visibility Toggle (Eye) */}
      <button
        type="button"
        onClick={handleToggleHidden}
        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
          is_hidden
            ? 'bg-red-950/60 border-red-500/60 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
        }`}
        title={is_hidden ? "Entity Hidden from Players (Click to Reveal)" : "Entity Visible to Players (Click to Hide)"}
      >
        {is_hidden ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>

      {/* Deselect / Close Button */}
      <button
        type="button"
        onClick={handleDeselect}
        className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
        title="Deselect Token (Esc)"
      >
        <X size={13} />
      </button>
    </div>
  );
};

export default TokenContextualPill;
