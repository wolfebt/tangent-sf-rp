/**
 * @file CombatTrackerWidget.tsx
 * @description Glass Cockpit Tactical Initiative & Combat Tracker.
 * Manages turn order, 2d10 initiative, Skill-Rank action capacity tracking,
 * round-start Sustained Essence drain, and round-end Degradation & Bleedout ticks.
 */

import React, { useState } from 'react';
import { 
  RotateCw, 
  Flame, 
  Sparkles, 
  ChevronRight,
  Activity,
  Users,
  AlertTriangle
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { useEngineStore, selectAllFusedTokens } from '../../index';
import { CombatArbitrator } from '../../rules/CombatArbitrator';

const arbitrator = new CombatArbitrator();

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  currentVitality?: number;
  maxVitality?: number;
  currentHealth?: number;
  maxHealth?: number;
  currentStructure?: number;
  maxStructure?: number;
  isSynthetic?: boolean;
  stabilityPoints?: number;
  skillRank?: number;
  currentHp?: number; // Retained for compatibility
  maxHp?: number;     // Retained for compatibility
  currentAp?: number; // Retained for compatibility
  maxAp?: number;     // Retained for compatibility
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

export const CombatTrackerWidget: React.FC<CombatTrackerWidgetProps> = ({
  initialCombatants = [],
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
  };

  // Round-end Degradation & Bleedout Protocol
  const executeDegradationProtocol = () => {
    AudioService.playTerminalBeep(600, 0.1);
    const logEntries: string[] = [];

    setCombatants(prev => prev.map(c => {
      let updatedVitality = c.currentVitality ?? 30;
      let updatedHealth = c.currentHealth ?? 30;
      let updatedStability = c.stabilityPoints ?? 10;
      let updatedStructure = c.currentStructure ?? 60;

      // Bleed condition / Bleeding out: 1 stability point loss per round
      if (c.conditions.some(cond => cond.toLowerCase().includes('bleed')) || updatedHealth <= 0) {
        if (!c.isSynthetic) {
          updatedStability = Math.max(0, updatedStability - 1);
          logEntries.push(`${c.name} is bleeding out: lost 1 Stability Point (${updatedStability} remaining).`);
        }
      }

      // Environmental hazard (burn/acid/radiation)
      if (c.conditions.some(cond => cond.toLowerCase().includes('burn') || cond.toLowerCase().includes('corrosive'))) {
        if (c.isSynthetic) {
          updatedStructure = Math.max(0, updatedStructure - 2);
          logEntries.push(`${c.name} suffered 2 structural corrosion damage.`);
        } else {
          if (updatedVitality > 0) {
            updatedVitality = Math.max(0, updatedVitality - 2);
          } else {
            updatedHealth = Math.max(0, updatedHealth - 2);
          }
          logEntries.push(`${c.name} suffered 2 hazard degradation damage.`);
        }
      }

      const updated = {
        ...c,
        currentVitality: updatedVitality,
        currentHealth: updatedHealth,
        currentHp: updatedHealth,
        currentStructure: updatedStructure,
        stabilityPoints: updatedStability
      };

      if (onDegradationTick) onDegradationTick(updated);
      return updated;
    }));

    if (logEntries.length > 0) {
      setDegradationLog(prev => [...logEntries, ...prev.slice(0, 5)]);
    }
  };

  const roll2d10 = () => (Math.floor(Math.random() * 10) + 1) + (Math.floor(Math.random() * 10) + 1);

  const handleRerollInitiative = () => {
    AudioService.playTerminalBeep(1400, 0.06);
    setCombatants(prev => {
      const rolled = prev.map(c => ({
        ...c,
        initiative: roll2d10()
      }));
      return rolled.sort((a, b) => b.initiative - a.initiative);
    });
    setCurrentTurnIndex(0);
  };

  // Sync active tokens from VolatileSharder engine state
  const handleSyncMapTokens = () => {
    const fusedTokens = selectAllFusedTokens(useEngineStore.getState());
    if (fusedTokens.length === 0) {
      AudioService.playCriticalChime(false);
      return;
    }

    const syncedCombatants: Combatant[] = fusedTokens.map((t) => {
      const isSyn = !!t.is_synthetic || (t.species?.toLowerCase().includes('synthetic') ?? false);
      const vit = t.current_vitality ?? t.base_vitality ?? 30;
      const hp = t.current_health ?? t.current_hp ?? t.base_hp ?? 30;
      const str = t.current_structure ?? t.base_structure ?? 60;
      const stab = t.stability_points ?? 10;
      const rank = t.skills?.tactics ?? t.skills?.combat ?? 5;

      return {
        id: t.id,
        name: t.name || 'Operative',
        initiative: roll2d10(),
        currentVitality: vit,
        maxVitality: t.base_vitality ?? 30,
        currentHealth: hp,
        maxHealth: t.base_hp ?? 30,
        currentStructure: str,
        maxStructure: t.base_structure ?? 60,
        isSynthetic: isSyn,
        stabilityPoints: stab,
        skillRank: rank,
        currentHp: hp,
        maxHp: t.base_hp ?? 30,
        currentAp: 0,
        maxAp: 0,
        isNpc: !t.is_persona,
        hasSustainedEssence: false,
        conditions: t.active_conditions || []
      };
    });

    syncedCombatants.sort((a, b) => b.initiative - a.initiative);
    setCombatants(syncedCombatants);
    setCurrentTurnIndex(0);
    AudioService.playCriticalChime(true);
  };

  return (
    <div className={`p-3 bg-slate-900/95 backdrop-blur-md border border-red-500/40 rounded-2xl shadow-2xl font-mono text-xs text-slate-200 flex flex-col gap-2.5 ${className}`}>
      {/* Header: Round & Phase Tracker */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-red-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-red-300 text-[11px]">
            TACTICAL INITIATIVE (2d10) &bull; ROUND {roundNumber}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSyncMapTokens}
            className="p-1 rounded-lg bg-slate-950 border border-slate-800 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
            title="Sync All Active Map Tokens from Canvas"
          >
            <Users size={11} />
            <span className="hidden sm:inline">Sync Map</span>
          </button>
          <button
            type="button"
            onClick={handleRerollInitiative}
            className="p-1 rounded-lg bg-slate-950 border border-slate-800 hover:text-cyan-300 hover:border-slate-700 transition-colors cursor-pointer"
            title="Reroll 2d10 Initiative"
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
          const tier = arbitrator.getActionTier(c.skillRank ?? 5);
          const isBleedingOut = !c.isSynthetic && (c.currentHealth ?? 30) <= 0;

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
                  <div className={`font-bold truncate text-[11px] flex items-center gap-1.5 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    <span>{c.name}</span>
                    {isBleedingOut && (
                      <span className="text-[9px] text-red-400 bg-red-950 px-1 py-0.2 rounded border border-red-500/40 flex items-center gap-0.5">
                        <AlertTriangle size={9} /> Bleeding Out ({c.stabilityPoints ?? 0})
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 flex items-center gap-1.5">
                    {c.isSynthetic ? (
                      <span className="text-amber-400 font-bold">{c.currentStructure ?? 60}/{c.maxStructure ?? 60} SP</span>
                    ) : (
                      <>
                        <span className="text-cyan-400">{c.currentVitality ?? 30}/{c.maxVitality ?? 30} VP</span>
                        <span>&bull;</span>
                        <span className="text-rose-400">{c.currentHealth ?? 30}/{c.maxHealth ?? 30} HP</span>
                      </>
                    )}
                    <span>&bull;</span>
                    <span className="text-slate-400">{tier.actionsCount} Atk/rnd</span>
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
