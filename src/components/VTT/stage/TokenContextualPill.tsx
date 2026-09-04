/**
 * @file TokenContextualPill.tsx
 * @description Floating On-Canvas Contextual Action Pill for Selected Tokens.
 * Implements Fitts's Law optimization: provides immediate adjustments for Hit Points,
 * Action Points, Conditions, Elevation, and Player Visibility directly on the stage.
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Flame, 
  ShieldAlert, 
  Target, 
  Zap,
  Activity
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

  const { id, name, current_hp, base_hp, elevation_ft = 0, active_conditions = [], is_hidden } = selectedToken;

  const handleDamage = (amount: number) => {
    useEngineStore.getState().applyDamage(id, amount);
  };

  const handleHeal = (amount: number) => {
    useEngineStore.getState().healHP(id, amount);
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

  const hpPercent = Math.min(100, Math.max(0, (current_hp / base_hp) * 100));

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-[#0b1017]/95 border border-cyan-500/50 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.8),0_0_12px_rgba(34,211,238,0.25)] backdrop-blur-md text-xs font-mono select-none pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
      {/* Token Name & Identity Chip */}
      <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-200">
        <Activity size={12} className="text-cyan-400 shrink-0" />
        <span className="font-bold truncate max-w-[110px]">{name}</span>
      </div>

      {/* HP Quick Adjustment Group */}
      <div className="flex items-center bg-slate-950/80 rounded-xl border border-slate-800 p-0.5">
        <button
          type="button"
          onClick={() => handleDamage(5)}
          className="px-1.5 py-0.5 rounded-lg hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors font-bold text-[10.5px]"
          title="Apply -5 Damage"
        >
          -5
        </button>
        <button
          type="button"
          onClick={() => handleDamage(1)}
          className="px-1.5 py-0.5 rounded-lg hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors font-bold text-[10.5px]"
          title="Apply -1 Damage"
        >
          -1
        </button>

        {/* HP Bar & Number */}
        <div className="px-2 flex flex-col items-center justify-center min-w-[72px]">
          <div className="flex items-center gap-1 text-[10.5px]">
            <Heart size={9} className="text-red-400 fill-red-400" />
            <span className={`font-bold ${current_hp <= base_hp * 0.3 ? 'text-red-400' : 'text-slate-100'}`}>
              {current_hp}/{base_hp}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
            <div 
              className={`h-full transition-all duration-200 ${
                hpPercent > 50 ? 'bg-cyan-400' : hpPercent > 25 ? 'bg-amber-400' : 'bg-red-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleHeal(1)}
          className="px-1.5 py-0.5 rounded-lg hover:bg-emerald-950/60 text-emerald-400 hover:text-emerald-300 transition-colors font-bold text-[10.5px]"
          title="Heal +1 HP"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => handleHeal(5)}
          className="px-1.5 py-0.5 rounded-lg hover:bg-emerald-950/60 text-emerald-400 hover:text-emerald-300 transition-colors font-bold text-[10.5px]"
          title="Heal +5 HP"
        >
          +5
        </button>
      </div>

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
