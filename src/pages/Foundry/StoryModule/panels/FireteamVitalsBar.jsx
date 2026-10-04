/**
 * @file FireteamVitalsBar.jsx
 * @description Dynamic Vitals & Fireteam HUD for ADE Interactive Play.
 * Supports Solo Operative mode (default) and multi-character Fireteam Squad mode.
 * Real-time tracking of Health, Kinetic Shields, Mental Strain, Plot Points, and Karma.
 */

import React from 'react';
import { 
  Heart, 
  Shield, 
  Zap, 
  Sparkles, 
  User, 
  Users, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export const FireteamVitalsBar = ({
  partyMode = 'solo', // 'solo' | 'group'
  operatives = [],
  activeOperativeId = null,
  onSelectActiveOperative,
  onUpdateOperativeVitals,
  isFolioLinked = false
}) => {
  const activeOperative = operatives.find(o => o.id === activeOperativeId) || operatives[0] || null;

  const handleAdjustStat = (opId, stat, delta) => {
    AudioService.playTerminalBeep(delta > 0 ? 1100 : 750, 0.02);
    if (!onUpdateOperativeVitals) return;

    const op = operatives.find(o => o.id === opId);
    if (!op || !op.vitals) return;

    const currentVal = op.vitals[stat] ?? 0;
    const maxKey = stat === 'health' ? 'maxHealth' : stat === 'shields' ? 'maxShields' : 'maxStrain';
    const maxVal = op.vitals[maxKey] ?? 100;
    const nextVal = Math.max(0, Math.min(maxVal, currentVal + delta));

    onUpdateOperativeVitals(opId, {
      ...op.vitals,
      [stat]: nextVal
    });
  };

  if (!activeOperative) return null;

  return (
    <div className="bg-[#0b101c] border-b border-slate-800 p-2 md:px-4 text-xs font-mono shrink-0 select-none">
      {/* ── SOLO OPERATIVE VIEW (DEFAULT) ── */}
      {partyMode === 'solo' ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Identity & Concept */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-sm shrink-0 shadow-sm">
              {activeOperative.name ? activeOperative.name.slice(0, 2).toUpperCase() : 'OP'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-100 text-xs truncate">{activeOperative.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                  {activeOperative.species} {activeOperative.archetype}
                </span>
                {isFolioLinked && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-bold" title="Connected to Folio Character Sheet">
                    FOLIO SYNC
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-sm">
                {activeOperative.focus || activeOperative.concept || 'Frontline Operative'}
              </p>
            </div>
          </div>

          {/* Vitals Gauges */}
          <div className="flex items-center gap-3 md:gap-5 flex-wrap w-full sm:w-auto justify-end">
            {/* Kinetic Shields */}
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-cyan-400 shrink-0" />
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-cyan-400 font-bold">SHIELDS</span>
                  <span className="text-slate-300 font-bold">
                    {activeOperative.vitals.shields} / {activeOperative.vitals.maxShields}
                  </span>
                </div>
                <div className="w-20 md:w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-900/60 mt-0.5">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, (activeOperative.vitals.shields / (activeOperative.vitals.maxShields || 1)) * 100))}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-0.5 ml-1">
                <button
                  type="button"
                  onClick={() => handleAdjustStat(activeOperative.id, 'shields', 5)}
                  className="px-1 text-[8px] bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-700 cursor-pointer"
                  title="Recharge +5 Shields"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustStat(activeOperative.id, 'shields', -5)}
                  className="px-1 text-[8px] bg-slate-900 hover:bg-slate-800 text-rose-300 rounded border border-slate-700 cursor-pointer"
                  title="Absorb -5 Shield Damage"
                >
                  -5
                </button>
              </div>
            </div>

            {/* Health & Trauma */}
            <div className="flex items-center gap-1.5">
              <Heart size={13} className="text-rose-400 shrink-0" />
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-rose-400 font-bold">HEALTH</span>
                  <span className="text-slate-300 font-bold">
                    {activeOperative.vitals.health} / {activeOperative.vitals.maxHealth}
                  </span>
                </div>
                <div className="w-20 md:w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-rose-900/60 mt-0.5 relative">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      (activeOperative.vitals.health / (activeOperative.vitals.maxHealth || 1)) <= 0.333
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, (activeOperative.vitals.health / (activeOperative.vitals.maxHealth || 1)) * 100))}%` }}
                  />
                  {/* 33.3% Trauma Threshold Indicator */}
                  <div className="absolute top-0 bottom-0 left-[33.3%] w-0.5 bg-yellow-400/80 z-10" title="33.3% Trauma Threshold" />
                </div>
              </div>
              <div className="flex flex-col gap-0.5 ml-1">
                <button
                  type="button"
                  onClick={() => handleAdjustStat(activeOperative.id, 'health', 5)}
                  className="px-1 text-[8px] bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded border border-slate-700 cursor-pointer"
                  title="Heal +5 Health"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustStat(activeOperative.id, 'health', -5)}
                  className="px-1 text-[8px] bg-slate-900 hover:bg-slate-800 text-rose-300 rounded border border-slate-700 cursor-pointer"
                  title="Take -5 Damage"
                >
                  -5
                </button>
              </div>
            </div>

            {/* Plot Points & Karma */}
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <div className="flex flex-col items-center" title="Plot Points: Spend to reroll or inject narrative advantage">
                <span className="text-[9px] text-amber-400 font-bold uppercase">PLOTS</span>
                <span className="font-extrabold text-amber-300 text-xs">
                  ⚡ {activeOperative.vitals.plotPoints ?? 2}
                </span>
              </div>
              <div className="flex flex-col items-center" title="Karma: Metaphysical favor and critical twist fuel">
                <span className="text-[9px] text-purple-400 font-bold uppercase">KARMA</span>
                <span className="font-extrabold text-purple-300 text-xs">
                  ✨ {activeOperative.vitals.karma ?? 3}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── SQUAD FIRETEAM VIEW (GROUP MODE) ── */
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Users size={12} className="text-cyan-400" />
            <span>Squad ({operatives.length}):</span>
          </span>

          {operatives.map((op) => {
            const isSelected = op.id === activeOperativeId;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1150, 0.02);
                  if (onSelectActiveOperative) onSelectActiveOperative(op.id);
                }}
                className={`p-1.5 px-2.5 rounded-xl border text-left transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs truncate max-w-[110px]">{op.name}</span>
                    {isSelected && <Check size={11} className="text-cyan-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-mono mt-0.5">
                    <span className="text-cyan-300">SHD {op.vitals.shields}</span>
                    <span className="text-rose-300">HP {op.vitals.health}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FireteamVitalsBar;
