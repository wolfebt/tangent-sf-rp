/**
 * @file ContextActionBar.tsx
 * @description Glass Cockpit Tactical Context Action Bar.
 * Dynamically binds the active operative/token's weapon profiles, cybernetics,
 * and Essence disciplines into Tangent's Skill Rank action capacity with MAP scaling.
 */

import React, { useState } from 'react';
import { 
  Crosshair, 
  Flame, 
  Zap, 
  Sparkles, 
  Target,
  ShieldAlert
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { CombatArbitrator } from '../../rules/CombatArbitrator';

const arbitrator = new CombatArbitrator();

export interface WeaponProfile {
  id: string;
  name: string;
  type: 'kinetic' | 'energy' | 'melee' | 'heavy';
  damageFormula: string;
  rangeFt: number;
  critThreshold: number;
  description?: string;
  apCost?: number; // Kept for backward compatibility
}

export interface ContextActionBarProps {
  skillRank?: number;
  currentAp?: number; // Retained for compatibility
  maxAp?: number;     // Retained for compatibility
  onConsumeAp?: (cost: number) => void;
  onExecuteRollMacro?: (macro: string, actionName: string) => void;
  equippedWeapons?: WeaponProfile[];
  activeTokenName?: string;
  className?: string;
}

const DEFAULT_WEAPONS: WeaponProfile[] = [
  {
    id: 'wpn-1',
    name: 'Mag-Carbine TL3',
    type: 'kinetic',
    damageFormula: '2d10+4',
    rangeFt: 90,
    critThreshold: 18,
    description: 'High-velocity rail cartridge. Penetrates kinetic DR.'
  },
  {
    id: 'wpn-2',
    name: 'Phase Laser Pistol TL4',
    type: 'energy',
    damageFormula: '2d10+2',
    rangeFt: 60,
    critThreshold: 19,
    description: 'Coherent plasma beam. Disintegrates reactive plating.'
  },
  {
    id: 'wpn-3',
    name: 'Vibro-Blade TL3',
    type: 'melee',
    damageFormula: '2d10+6',
    rangeFt: 5,
    critThreshold: 17,
    description: 'Ultrasonic edge causing severe trauma hemorrhaging.'
  }
];

export const ContextActionBar: React.FC<ContextActionBarProps> = ({
  skillRank = 6,
  onExecuteRollMacro,
  equippedWeapons = DEFAULT_WEAPONS,
  activeTokenName = 'Operative',
  className = ''
}) => {
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(equippedWeapons[0]?.id || 'wpn-1');
  const [calledShotTarget, setCalledShotTarget] = useState<'none' | 'head' | 'limbs' | 'sensors'>('none');
  const [isOvercharged, setIsOvercharged] = useState<boolean>(false);
  const [currentAttackIndex, setCurrentAttackIndex] = useState<number>(0);
  const [defenseReactionIndex, setDefenseReactionIndex] = useState<number>(0);

  const actionTier = arbitrator.getActionTier(skillRank);
  const maxAttacks = actionTier.actionsCount;
  const currentMAP = arbitrator.calculateMAP(skillRank, currentAttackIndex);
  const activeWeapon = equippedWeapons.find(w => w.id === selectedWeaponId) || equippedWeapons[0];

  const handleFireWeapon = () => {
    if (!activeWeapon) return;

    AudioService.playTerminalBeep(1200, 0.05);

    const bonus = isOvercharged ? '+1d6[OVERCHARGE]' : '';
    // Per Tangent 3.00 COMBAT.md: Called shots impose a -5 Strike penalty to-hit, never an AP cost.
    const calledPenalty = calledShotTarget !== 'none' ? -5 : 0;
    const totalAttackMod = actionTier.focusBonus + currentMAP + calledPenalty;
    const sign = totalAttackMod >= 0 ? `+${totalAttackMod}` : `${totalAttackMod}`;

    const targetDesc = calledShotTarget !== 'none' ? ` at [${calledShotTarget.toUpperCase()}] (-5 Strike)` : '';
    const attackMacro = `/roll 2d10${sign} # Attack ${currentAttackIndex + 1}/${maxAttacks} with ${activeWeapon.name}${targetDesc}`;
    const damageMacro = `/roll ${activeWeapon.damageFormula}${bonus} # Damage (${activeWeapon.type.toUpperCase()})`;

    if (onExecuteRollMacro) {
      onExecuteRollMacro(`${attackMacro} | ${damageMacro}`, activeWeapon.name);
    }

    // Advance attack counter for MAP tracking
    setCurrentAttackIndex(prev => (prev + 1) % maxAttacks);
  };

  const handleActiveDefense = (type: 'Dodge' | 'Parry' | 'Block') => {
    const penalty = arbitrator.calculateDefensePenalty(defenseReactionIndex);
    const modStr = penalty !== 0 ? `${penalty}` : '+0';
    AudioService.playTerminalBeep(1000, 0.06);

    if (onExecuteRollMacro) {
      onExecuteRollMacro(`/roll 2d10${modStr} # Active Defense: ${type} (Reaction #${defenseReactionIndex + 1})`, type);
    }

    setDefenseReactionIndex(prev => prev + 1);
  };

  const handleTriggerEssence = (name: string, epCost: number, formula: string) => {
    AudioService.playTerminalBeep(1600, 0.08);
    if (onExecuteRollMacro) {
      onExecuteRollMacro(`/roll ${formula} # Essence Discipline: ${name} (${epCost} EP)`, name);
    }
  };

  return (
    <div className={`p-3 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-2xl font-mono text-xs text-slate-200 space-y-3 ${className}`}>
      {/* Header: Skill Rank Action Capacity Status */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Crosshair size={15} className="text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-cyan-300 text-[11px]">
            TACTICAL ACTION BAR &bull; {activeTokenName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-slate-400">ACTION TIER:</span>
          <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
            {actionTier.title} ({maxAttacks} {maxAttacks === 1 ? 'Attack' : 'Attacks'}/rnd)
          </span>
        </div>
      </div>

      {/* Attack Capacity Pips & Multi-Attack Penalty Indicator */}
      <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">ATTACK PROGRESSION:</span>
          <div className="flex gap-1">
            {Array.from({ length: maxAttacks }).map((_, idx) => {
              const penalty = idx === 0 ? 0 : -5 * idx;
              const isCurrent = idx === currentAttackIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentAttackIndex(idx)}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  #{idx + 1} ({penalty === 0 ? '0' : `${penalty}`})
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setCurrentAttackIndex(0);
            setDefenseReactionIndex(0);
          }}
          className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          title="Reset round action progression"
        >
          Reset Round
        </button>
      </div>

      {/* Weapon Selector Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {equippedWeapons.map((wpn) => {
          const isSelected = wpn.id === selectedWeaponId;
          return (
            <button
              key={wpn.id}
              type="button"
              onClick={() => setSelectedWeaponId(wpn.id)}
              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{wpn.name}</span>
              <span className="text-[9px] text-slate-500 font-normal">({wpn.damageFormula})</span>
            </button>
          );
        })}
      </div>

      {/* Targeting Matrix & Fire Macro Execution */}
      {activeWeapon && (
        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">CALLED SHOT (-5 STRIKE):</span>
            <div className="flex gap-1">
              {(['none', 'head', 'limbs', 'sensors'] as const).map((tgt) => (
                <button
                  key={tgt}
                  type="button"
                  onClick={() => setCalledShotTarget(tgt)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                    calledShotTarget === tgt
                      ? 'bg-red-950 text-red-300 border border-red-500/50'
                      : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tgt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              type="button"
              onClick={() => setIsOvercharged(prev => !prev)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
                isOvercharged
                  ? 'bg-amber-950 text-amber-300 border-amber-500'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title="Overcharge weapon capacitor (+1d6 damage, 1 EP)"
            >
              <Flame size={11} className={isOvercharged ? 'text-amber-400' : 'text-slate-500'} />
              <span>Overcharge (+1d6)</span>
            </button>

            <button
              type="button"
              onClick={handleFireWeapon}
              className="flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <Target size={13} />
              <span>
                Strike #{currentAttackIndex + 1} ({currentMAP === 0 ? '0 MAP' : `${currentMAP} MAP`})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Active Defenses & Quick Essence Invocations */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {/* Active Defense Reactions */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleActiveDefense('Dodge')}
            className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 border border-emerald-500/40 rounded-xl text-[10px] text-emerald-300 font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
            title="Dodge reaction (-5 penalty for consecutive reactions)"
          >
            <ShieldAlert size={11} className="text-emerald-400" />
            <span>Dodge ({arbitrator.calculateDefensePenalty(defenseReactionIndex)})</span>
          </button>
          <button
            type="button"
            onClick={() => handleActiveDefense('Parry')}
            className="px-2 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-300 font-bold uppercase transition-all cursor-pointer"
            title="Parry reaction"
          >
            Parry
          </button>
        </div>

        {/* Essence Disciplines */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleTriggerEssence('Aegis Barrier', 2, '2d10+Essence[WARD]')}
            className="flex-1 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-purple-500/40 rounded-xl text-[10px] text-purple-300 font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
            title="Aegis Barrier: Costs 2 Essence Points (EP)"
          >
            <Sparkles size={11} className="text-purple-400" />
            <span>Aegis (2 EP)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerEssence('Kinetic Surge', 1, '2d10+4[FORCE]')}
            className="flex-1 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 rounded-xl text-[10px] text-cyan-300 font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
            title="Kinetic Surge: Costs 1 Essence Point (EP)"
          >
            <Zap size={11} className="text-cyan-400" />
            <span>Surge (1 EP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextActionBar;
