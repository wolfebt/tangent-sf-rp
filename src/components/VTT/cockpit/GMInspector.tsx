/**
 * @file GMInspector.tsx
 * @description GM Dynamic Inspector Panel.
 * Handles granular single-entity inspection and manipulation,
 * as well as multi-entity batch controls via MultiSelectCard.
 */

import React from 'react';
import { 
  Heart, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Activity, 
  Users
} from 'lucide-react';
import { useEngineStore, selectAllFusedTokens } from '../../../engine/index';
import { MultiSelectCard } from './MultiSelectCard';
import { AudioService } from '../../../services/audioService';

const AVAILABLE_CONDITIONS = [
  'Cover',
  'Aiming',
  'Stunned',
  'Blinded',
  'Burning',
  'Suppressed',
  'Overwatch',
  'Prone',
  'Bleeding'
];

export const GMInspector: React.FC = () => {
  const tokens = useEngineStore(selectAllFusedTokens);
  const selectedTokens = tokens.filter(t => t.is_selected);

  // Single selected token
  const currentToken = selectedTokens.length === 1 ? selectedTokens[0] : null;

  // Single Token Actions
  const handleApplyDamage = (amount: number) => {
    if (!currentToken) return;
    useEngineStore.getState().applyDamage(currentToken.id, amount);
    AudioService.playCriticalChime(true);
  };

  const handleApplyHeal = (amount: number) => {
    if (!currentToken) return;
    useEngineStore.getState().healHP(currentToken.id, amount);
    AudioService.playTerminalBeep();
  };

  const handleAdjustElevation = (delta: number) => {
    if (!currentToken) return;
    const next = Math.max(0, (currentToken.elevation_ft || 0) + delta);
    useEngineStore.getState().setElevation(currentToken.id, next);
  };

  const handleToggleCondition = (cond: string) => {
    if (!currentToken) return;
    useEngineStore.getState().toggleCondition(currentToken.id, cond);
    AudioService.playTerminalBeep();
  };

  const handleToggleHidden = () => {
    if (!currentToken) return;
    useEngineStore.getState().toggleHidden(currentToken.id);
    AudioService.playTerminalBeep();
  };

  const handleRemoveToken = () => {
    if (!currentToken) return;
    useEngineStore.getState().removeEntity(currentToken.id);
    AudioService.playTerminalBeep();
  };

  const handleDeselectAll = () => {
    useEngineStore.getState().clearSelection();
  };

  // Case 1: Multiple Tokens Selected -> MultiSelectCard
  if (selectedTokens.length > 1) {
    return (
      <MultiSelectCard 
        tokens={selectedTokens} 
        onDeselectAll={handleDeselectAll} 
      />
    );
  }

  // Case 2: Single Token Selected -> Detailed Inspection Card
  if (currentToken) {
    const isHidden = !!currentToken.is_hidden;
    const hpRatio = Math.max(0, Math.min(1, currentToken.current_hp / (currentToken.base_hp || 1)));

    return (
      <div className="space-y-2.5 font-mono text-xs select-none">
        {/* Token Header Card */}
        <div className="p-2.5 rounded-lg bg-[#0d121c] border border-cyan-500/50 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${currentToken.is_persona ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="font-bold text-slate-100 text-sm truncate">
                {currentToken.name || currentToken.id}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToggleHidden}
                className={`p-1 rounded border transition-colors cursor-pointer ${
                  isHidden
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isHidden ? 'Hidden from Players (Click to reveal)' : 'Visible to Players (Click to hide)'}
              >
                {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>

              <button
                type="button"
                onClick={handleRemoveToken}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-red-400 hover:text-red-300 hover:border-red-500/40 transition-colors cursor-pointer"
                title="Remove entity from stage"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{currentToken.species || 'Humanoid'} &bull; {currentToken.archetype || 'Actor'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-cyan-300">
              {currentToken.is_persona ? 'HERO PERSONA' : 'TACTICAL ADVERSARY'}
            </span>
          </div>

          {/* Vitality & HP Bar */}
          <div>
            <div className="flex justify-between text-[10.5px] mb-0.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Heart size={11} className="text-red-400" /> HP:
              </span>
              <span className="font-bold text-slate-200">
                {currentToken.current_hp} / {currentToken.base_hp}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 ${
                  hpRatio > 0.5 ? 'bg-gradient-to-r from-emerald-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-red-600'
                }`}
                style={{ width: `${hpRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Damage & Heal Quick Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleApplyDamage(5)}
              className="flex-1 py-1 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 font-bold transition-all text-center cursor-pointer"
            >
              -5 HP
            </button>
            <button
              type="button"
              onClick={() => handleApplyDamage(1)}
              className="px-2.5 py-1 rounded bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-400 font-bold transition-all text-center cursor-pointer"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => handleApplyHeal(1)}
              className="px-2.5 py-1 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 font-bold transition-all text-center cursor-pointer"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => handleApplyHeal(5)}
              className="flex-1 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 font-bold transition-all text-center cursor-pointer"
            >
              +5 HP
            </button>
          </div>
        </div>

        {/* Tactical Parameters Matrix */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">ARMOR DR</div>
            <div className="text-xs font-bold text-cyan-300">{currentToken.armor_dr || 0}</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">SPEED</div>
            <div className="text-xs font-bold text-slate-200">{currentToken.speed_ft || 30} ft</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="text-[10px] text-slate-500">ELEVATION</div>
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustElevation(-5)}
                className="text-slate-500 hover:text-slate-300"
              >
                <ChevronDown size={12} />
              </button>
              <span className="text-xs font-bold text-amber-300">{currentToken.elevation_ft || 0} ft</span>
              <button
                type="button"
                onClick={() => handleAdjustElevation(5)}
                className="text-slate-500 hover:text-slate-300"
              >
                <ChevronUp size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Conditions Matrix */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>ACTIVE CONDITIONS ({currentToken.active_conditions?.length || 0})</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {AVAILABLE_CONDITIONS.map(cond => {
              const isActive = (currentToken.active_conditions || []).includes(cond);
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => handleToggleCondition(cond)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {isActive ? `✓ ${cond}` : `+ ${cond}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Zero Tokens Selected -> General GM Stage Telemetry & Threat Overview
  const personaCount = tokens.filter(t => t.is_persona).length;
  const adversaryCount = tokens.filter(t => !t.is_persona).length;

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {/* Empty State Banner */}
      <div className="p-4 text-center rounded-lg bg-slate-950/40 border border-slate-850 space-y-1.5">
        <Users size={24} className="mx-auto text-cyan-400/60" />
        <div className="text-slate-300 font-bold">No Token Currently Selected</div>
        <p className="text-[10.5px] text-slate-500">
          Click on any token or actor on The Stage to inspect stats, apply direct damage, or modify conditions.
        </p>
      </div>

      {/* Stage Live Telemetry */}
      <div className="p-2.5 rounded-lg bg-[#0d121c] border border-slate-800 space-y-2">
        <div className="text-cyan-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
          <Activity size={13} />
          STAGE COMBAT TELEMETRY
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">HEROES & ALLIES</span>
            <span className="text-emerald-400 font-bold text-sm">{personaCount} Active</span>
          </div>

          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">ADVERSARIES</span>
            <span className="text-red-400 font-bold text-sm">{adversaryCount} Hostile</span>
          </div>
        </div>

        <div className="text-[10.5px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
          <span>Encounter Threat Status:</span>
          <span className={`font-bold ${adversaryCount > personaCount ? 'text-red-400' : 'text-emerald-400'}`}>
            {adversaryCount > personaCount ? 'HAZARDOUS' : 'MODERATE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GMInspector;
