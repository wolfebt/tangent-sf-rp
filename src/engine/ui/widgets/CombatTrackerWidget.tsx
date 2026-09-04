/**
 * @file CombatTrackerWidget.tsx
 * @description Glass Cockpit Tactical Initiative & Combat Tracker.
 * Manages turn order, 4 AP refresh, round-start Sustained Essence drain,
 * and round-end Degradation Protocol execution (environmental hazard ticks, bleed).
 */

import React, { useState } from 'react';
import { 
  RotateCw, 
  Flame, 
  Sparkles, 
  ChevronRight,
  Activity
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  currentHp: number;
  maxHp: number;
  currentAp: number;
  maxAp: number;
  isNpc: boolean;
  hasSustainedEssence: boolean;
  conditions: string[];
}

export interface CombatTrackerWidgetProps {
  initialCombatants?: Combatant[];
  onRoundAdvance?: (round: number) => void;
  onDegradationTick?: (combatant: Combatant) => void;
  className?: string;
}

const DEFAULT_COMBATANTS: Combatant[] = [
  {
    id: 'c-1',
    name: 'Operative Jax',
    initiative: 18,
    currentHp: 28,
    maxHp: 28,
    currentAp: 4,
    maxAp: 4,
    isNpc: false,
    hasSustainedEssence: true,
    conditions: ['Aegis Barrier']
  },
  {
    id: 'c-2',
    name: 'Scythe Vanguard Elite',
    initiative: 15,
    currentHp: 22,
    maxHp: 22,
    currentAp: 4,
    maxAp: 4,
    isNpc: true,
    hasSustainedEssence: false,
    conditions: ['Overcharged Rails']
  },
  {
    id: 'c-3',
    name: 'Tech-Acolyte Kaelen',
    initiative: 11,
    currentHp: 19,
    maxHp: 19,
    currentAp: 4,
    maxAp: 4,
    isNpc: false,
    hasSustainedEssence: false,
    conditions: []
  }
];

export const CombatTrackerWidget: React.FC<CombatTrackerWidgetProps> = ({
  initialCombatants = DEFAULT_COMBATANTS,
  onRoundAdvance,
  onDegradationTick,
  className = ''
}) => {
  const [combatants, setCombatants] = useState<Combatant[]>(initialCombatants);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [degradationLog, setDegradationLog] = useState<string[]>([]);

  // Advance turn to next combatant
  const handleNextTurn = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    let nextIndex = currentTurnIndex + 1;
    let nextRound = roundNumber;

    if (nextIndex >= combatants.length) {
      nextIndex = 0;
      nextRound += 1;
      setRoundNumber(nextRound);
      if (onRoundAdvance) onRoundAdvance(nextRound);
      executeDegradationProtocol();
    }

    setCurrentTurnIndex(nextIndex);

    // Refresh AP and process Sustained Essence for next active combatant
    setCombatants(prev => prev.map((c, idx) => {
      if (idx === nextIndex) {
        return {
          ...c,
          currentAp: c.maxAp
        };
      }
      return c;
    }));
  };

  // Round-end Degradation Protocol
  const executeDegradationProtocol = () => {
    AudioService.playTerminalBeep(600, 0.1);
    const logEntries: string[] = [];

    setCombatants(prev => prev.map(c => {
      let updatedHp = c.currentHp;
      if (c.conditions.some(cond => cond.toLowerCase().includes('bleed') || cond.toLowerCase().includes('burn'))) {
        updatedHp = Math.max(0, updatedHp - 2);
        logEntries.push(`${c.name} suffered 2 degradation damage.`);
        if (onDegradationTick) onDegradationTick(c);
      }
      return { ...c, currentHp: updatedHp };
    }));

    if (logEntries.length > 0) {
      setDegradationLog(prev => [...logEntries, ...prev.slice(0, 5)]);
    }
  };

  const handleRerollInitiative = () => {
    AudioService.playTerminalBeep(1400, 0.06);
    setCombatants(prev => {
      const rolled = prev.map(c => ({
        ...c,
        initiative: Math.floor(Math.random() * 20) + 1
      }));
      return rolled.sort((a, b) => b.initiative - a.initiative);
    });
    setCurrentTurnIndex(0);
  };

  return (
    <div className={`p-3 bg-slate-900/95 backdrop-blur-md border border-red-500/40 rounded-2xl shadow-2xl font-mono text-xs text-slate-200 flex flex-col gap-2.5 ${className}`}>
      {/* Header: Round & Phase Tracker */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-red-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-red-300 text-[11px]">
            TACTICAL INITIATIVE &bull; ROUND {roundNumber}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRerollInitiative}
            className="p-1 rounded-lg bg-slate-950 border border-slate-800 hover:text-cyan-300 hover:border-slate-700 transition-colors cursor-pointer"
            title="Reroll Initiative"
          >
            <RotateCw size={12} />
          </button>
          <button
            type="button"
            onClick={handleNextTurn}
            className="px-2.5 py-1 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/60 text-red-200 font-bold uppercase transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span>Next Turn</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Combatant Roster */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
        {combatants.map((c, idx) => {
          const isActive = idx === currentTurnIndex;
          return (
            <div
              key={c.id}
              className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                isActive
                  ? 'bg-red-950/60 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-red-500 text-black' : 'bg-slate-900 text-slate-400'
                }`}>
                  {c.initiative}
                </span>
                <div className="truncate">
                  <div className={`font-bold truncate text-[11px] ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {c.name}
                  </div>
                  <div className="text-[9px] text-slate-500 flex items-center gap-1.5">
                    <span className="text-emerald-400">{c.currentHp}/{c.maxHp} HP</span>
                    <span>&bull;</span>
                    <span className="text-amber-400">{c.currentAp}/{c.maxAp} AP</span>
                    {c.hasSustainedEssence && (
                      <span className="text-purple-400 flex items-center gap-0.5">
                        <Sparkles size={8} /> Sustained
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditions / Stance Pill */}
              <div className="flex items-center gap-1 shrink-0">
                {c.conditions.map((cond, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300 uppercase"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Degradation Protocol Status */}
      {degradationLog.length > 0 && (
        <div className="p-2 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
          <div className="text-[9px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Flame size={10} /> Degradation Phase Telemetry
          </div>
          {degradationLog.slice(0, 2).map((log, i) => (
            <div key={i} className="text-[9px] text-slate-400 font-sans">
              &bull; {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CombatTrackerWidget;
