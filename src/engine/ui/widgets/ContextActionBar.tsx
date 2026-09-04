/**
 * @file ContextActionBar.tsx
 * @description Glass Cockpit Tactical Context Action Bar.
 * Dynamically binds the active operative/token's weapon profiles, cybernetics,
 * and Essence disciplines into 4-AP action economy macros executing via DiceASTParser.
 */

import React, { useState } from 'react';
import { 
  Crosshair, 
  Flame, 
  Zap, 
  Sparkles, 
  Target
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export interface WeaponProfile {
  id: string;
  name: string;
  type: 'kinetic' | 'energy' | 'melee' | 'heavy';
  damageFormula: string;
  apCost: number;
  rangeFt: number;
  critThreshold: number;
  description?: string;
}

export interface ContextActionBarProps {
  currentAp?: number;
  maxAp?: number;
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
    apCost: 1,
    rangeFt: 90,
    critThreshold: 18,
    description: 'High-velocity rail cartridge. Penetrates kinetic DR.'
  },
  {
    id: 'wpn-2',
    name: 'Phase Laser Pistol TL4',
    type: 'energy',
    damageFormula: '1d12+6',
    apCost: 1,
    rangeFt: 60,
    critThreshold: 19,
    description: 'Coherent plasma beam. Disintegrates reactive plating.'
  },
  {
    id: 'wpn-3',
    name: 'Vibro-Blade TL3',
    type: 'melee',
    damageFormula: '1d10+8',
    apCost: 1,
    rangeFt: 5,
    critThreshold: 17,
    description: 'Ultrasonic edge causing severe trauma hemorrhaging.'
  }
];

export const ContextActionBar: React.FC<ContextActionBarProps> = ({
  currentAp = 4,
  maxAp = 4,
  onConsumeAp,
  onExecuteRollMacro,
  equippedWeapons = DEFAULT_WEAPONS,
  activeTokenName = 'Operative',
  className = ''
}) => {
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(equippedWeapons[0]?.id || 'wpn-1');
  const [calledShotTarget, setCalledShotTarget] = useState<'torso' | 'head' | 'limbs' | 'sensors'>('torso');
  const [isOvercharged, setIsOvercharged] = useState<boolean>(false);

  const activeWeapon = equippedWeapons.find(w => w.id === selectedWeaponId) || equippedWeapons[0];

  const handleFireWeapon = () => {
    if (!activeWeapon) return;
    const baseCost = activeWeapon.apCost;
    const calledShotAdditionalCost = calledShotTarget !== 'torso' ? 1 : 0;
    const totalCost = baseCost + calledShotAdditionalCost + (isOvercharged ? 1 : 0);

    if (currentAp < totalCost) {
      AudioService.playTerminalBeep(400, 0.1);
      return;
    }

    AudioService.playTerminalBeep(1200, 0.05);
    if (onConsumeAp) onConsumeAp(totalCost);

    const bonus = isOvercharged ? '+1d6[OVERCHARGE]' : '';
    const calledPenalty = calledShotTarget === 'head' ? '-4' : calledShotTarget === 'sensors' ? '-3' : '';
    const attackMacro = `/roll 2d10+4${calledPenalty} # Attack with ${activeWeapon.name} at [${calledShotTarget.toUpperCase()}]`;
    const damageMacro = `/roll ${activeWeapon.damageFormula}${bonus} # Damage (${activeWeapon.type.toUpperCase()})`;

    if (onExecuteRollMacro) {
      onExecuteRollMacro(`${attackMacro} | ${damageMacro}`, activeWeapon.name);
    }
  };

  const handleTriggerEssence = (name: string, apCost: number, formula: string) => {
    if (currentAp < apCost) {
      AudioService.playTerminalBeep(400, 0.1);
      return;
    }
    AudioService.playTerminalBeep(1600, 0.08);
    if (onConsumeAp) onConsumeAp(apCost);
    if (onExecuteRollMacro) {
      onExecuteRollMacro(`/roll ${formula} # Essence Discipline: ${name}`, name);
    }
  };

  return (
    <div className={`p-3 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-2xl font-mono text-xs text-slate-200 space-y-3 ${className}`}>
      {/* Header: AP Economy Status */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Crosshair size={15} className="text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-cyan-300 text-[11px]">
            TACTICAL ACTION BAR &bull; {activeTokenName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px]">AP ECONOMY:</span>
          <div className="flex gap-1">
            {Array.from({ length: maxAp }).map((_, idx) => (
              <span
                key={idx}
                className={`w-3 h-3 rounded-full border transition-all ${
                  idx < currentAp
                    ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    : 'bg-slate-950 border-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
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
            <span className="text-slate-400">CALLED SHOT TARGET:</span>
            <div className="flex gap-1">
              {(['torso', 'head', 'limbs', 'sensors'] as const).map((tgt) => (
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
              title="Overcharge weapon capacitor (+1d6 damage, +1 AP cost)"
            >
              <Flame size={11} className={isOvercharged ? 'text-amber-400' : 'text-slate-500'} />
              <span>Overcharge (+1 AP)</span>
            </button>

            <button
              type="button"
              onClick={handleFireWeapon}
              disabled={currentAp < activeWeapon.apCost}
              className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                currentAp >= activeWeapon.apCost
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Target size={13} />
              <span>Engage Attack ({activeWeapon.apCost + (calledShotTarget !== 'torso' ? 1 : 0) + (isOvercharged ? 1 : 0)} AP)</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Essence Invocations */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => handleTriggerEssence('Aegis Barrier', 2, '2d8+Essence[WARD]')}
          className="p-1.5 bg-slate-950/80 hover:bg-slate-900 border border-purple-500/40 rounded-xl text-[10px] text-purple-300 font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <Sparkles size={11} className="text-purple-400" />
          <span>Aegis Barrier (2 AP)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTriggerEssence('Kinetic Surge', 1, '1d10+4[FORCE]')}
          className="p-1.5 bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 rounded-xl text-[10px] text-cyan-300 font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <Zap size={11} className="text-cyan-400" />
          <span>Kinetic Surge (1 AP)</span>
        </button>
      </div>
    </div>
  );
};

export default ContextActionBar;
