/**
 * @file TangentActionDeck.tsx
 * @description Tangent SF RP Tactical Action Deck.
 * Features 4 AP base economy visualizer (individual interactive pips),
 * Called Shots trauma targeting matrix, weapon attack deck with damage pipeline,
 * tactical combat maneuvers, and Essence invocations.
 */

import React, { useState, useMemo } from 'react';
import { 
  Crosshair, 
  Zap, 
  Shield, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Target,
  Swords,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useEngineStore, selectAllFusedTokens } from '../../../engine/index';
import { AudioService } from '../../../services/audioService';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';

export type CalledShotLocation = 'head' | 'torso' | 'limbs' | 'chassis';

interface WeaponAction {
  id: string;
  name: string;
  apCost: number;
  damageDice: string; // e.g. "2d10+4"
  damageType: 'kinetic' | 'energy' | 'thermal' | 'disruption';
  range: string;
  special?: string;
  baseModifier: number;
}

const DEFAULT_WEAPONS: WeaponAction[] = [
  {
    id: 'wpn-plasma-carbine',
    name: 'Heavy Plasma Carbine',
    apCost: 2,
    damageDice: '2d10+6',
    damageType: 'thermal',
    range: '40 / 120 ft',
    special: 'Melts Armor DR',
    baseModifier: 3
  },
  {
    id: 'wpn-mag-rifle',
    name: 'Gauss Rail Rifle',
    apCost: 2,
    damageDice: '2d12+8',
    damageType: 'kinetic',
    range: '80 / 300 ft',
    special: 'Piercing IV',
    baseModifier: 4
  },
  {
    id: 'wpn-monoblade',
    name: 'Monofilament Vibro-Blade',
    apCost: 1,
    damageDice: '1d12+5',
    damageType: 'kinetic',
    range: 'Melee (5 ft)',
    special: 'Rend / Bleed',
    baseModifier: 5
  },
  {
    id: 'wpn-emp-grenade',
    name: 'Disruption EMP Grenade',
    apCost: 2,
    damageDice: '3d8',
    damageType: 'disruption',
    range: '30 ft (AoE 15ft)',
    special: 'Stuns Cyberware',
    baseModifier: 2
  }
];

const TACTICAL_MANEUVERS = [
  {
    id: 'man-cover',
    name: 'Take Cover / Evasive Roll',
    apCost: 1,
    icon: <Shield size={13} />,
    description: '+2 Defense & grants Cover condition against ranged attacks',
    condition: 'Cover'
  },
  {
    id: 'man-aim',
    name: 'Calibrate Aim & Focus',
    apCost: 1,
    icon: <Target size={13} />,
    description: '+3 to next attack roll, cancels target evasion',
    condition: 'Aiming'
  },
  {
    id: 'man-overwatch',
    name: 'Set Overwatch Sector',
    apCost: 2,
    icon: <Eye size={13} />,
    description: 'Prepares reactive strike if an enemy enters designated cone',
    condition: 'Overwatch'
  },
  {
    id: 'man-suppress',
    name: 'Suppressive Burst',
    apCost: 2,
    icon: <Swords size={13} />,
    description: 'Pin target behind cover; causes Disadvantaged return fire',
    condition: 'Suppressed'
  }
];

const ESSENCE_INVOCATIONS = [
  {
    id: 'ess-lash',
    name: 'Psionic Mind Lash',
    apCost: 2,
    essenceCost: 3,
    effect: '2d8 Direct Neural Damage (ignores kinetic DR) + Stun check',
    tag: 'Offensive'
  },
  {
    id: 'ess-ward',
    name: 'Kinetic Quantum Ward',
    apCost: 1,
    essenceCost: 2,
    effect: 'Absorbs up to 15 kinetic damage for 1 round',
    tag: 'Defensive'
  },
  {
    id: 'ess-blink',
    name: 'Quantum Phase Blink',
    apCost: 2,
    essenceCost: 4,
    effect: 'Instantly teleport up to 30 ft through solid barriers',
    tag: 'Utility'
  }
];

export interface TangentActionDeckProps {
  currentAp: number;
  maxAp: number;
  onConsumeAp: (amount: number) => void;
  onResetAp: () => void;
  calledShotTarget: CalledShotLocation;
  onSetCalledShotTarget: (target: CalledShotLocation) => void;
}

export const TangentActionDeck: React.FC<TangentActionDeckProps> = ({
  currentAp,
  maxAp,
  onConsumeAp,
  onResetAp,
  calledShotTarget,
  onSetCalledShotTarget
}) => {
  const fusedTokens = useEngineStore(selectAllFusedTokens);
  const selectedToken = fusedTokens.find(t => t.is_selected) || null;
  const folio = (useFolio() || {}) as any;
  const { characterData } = folio;
  const { openDiceRoller } = useDice();

  const [activeDeckTab, setActiveDeckTab] = useState<'weapons' | 'tactics' | 'essence'>('weapons');
  const [currentEssence, setCurrentEssence] = useState<number>(10);
  const maxEssence = 10;
  const [lastCombatResult, setLastCombatResult] = useState<{
    text: string;
    damage: number;
    targetName: string;
  } | null>(null);

  // Derive active weapons from folio characterData.attacks if present, otherwise fallback to DEFAULT_WEAPONS
  const folioAttacks = useMemo<WeaponAction[]>(() => {
    let rawAttacks = characterData?.attacks;
    if (typeof rawAttacks === 'string') {
      try { rawAttacks = JSON.parse(rawAttacks); } catch { rawAttacks = []; }
    }
    if (Array.isArray(rawAttacks) && rawAttacks.length > 0) {
      return rawAttacks.map((a: any, idx: number) => ({
        id: a.id || `folio-atk-${idx}`,
        name: a.name || `Weapon #${idx + 1}`,
        apCost: parseInt(a.apCost || a.ap || 2, 10) || 2,
        damageDice: a.damage || '2d10',
        damageType: (a.type || 'kinetic').toLowerCase() as any,
        range: a.range || 'Standard',
        special: a.notes || undefined,
        baseModifier: parseInt(a.score || 0, 10) || 0
      }));
    }
    return DEFAULT_WEAPONS;
  }, [characterData?.attacks]);

  // Called Shot Modifiers based on Tangent SF RP Rules
  const CALLED_SHOT_CONFIGS: Record<CalledShotLocation, { label: string; hitMod: string; effect: string; color: string }> = {
    head: { 
      label: 'Head / Optics', 
      hitMod: '-4 to Hit', 
      effect: '+100% Crit Dmg, Blind/Stun check',
      color: 'text-red-400 border-red-500/60 bg-red-950/30'
    },
    torso: { 
      label: 'Torso / Center Mass', 
      hitMod: '+0 Normal', 
      effect: 'Standard damage vs full Armor DR',
      color: 'text-amber-300 border-amber-500/60 bg-amber-950/30'
    },
    limbs: { 
      label: 'Limbs / Actuators', 
      hitMod: '-2 to Hit', 
      effect: 'Cripples movement (-15ft) & disarm check',
      color: 'text-sky-300 border-sky-500/60 bg-sky-950/30'
    },
    chassis: { 
      label: 'Reactor / Sockets', 
      hitMod: '-3 to Hit', 
      effect: 'Penetrates 50% Armor DR, Overheat risk',
      color: 'text-purple-300 border-purple-500/60 bg-purple-950/30'
    }
  };

  // Execute Weapon Strike
  const handleFireWeapon = (wpn: WeaponAction) => {
    if (currentAp < wpn.apCost) {
      AudioService.playCriticalChime(false);
      return;
    }

    onConsumeAp(wpn.apCost);

    // Roll interactive dice check in DiceRollerDock with autoRoll
    const attackScore = wpn.baseModifier;
    const calledShotPenalty = calledShotTarget === 'head' ? -4 : calledShotTarget === 'limbs' ? -2 : calledShotTarget === 'chassis' ? -3 : 0;
    const effectiveToHitMod = attackScore + calledShotPenalty;

    openDiceRoller({
      label: `${wpn.name} Strike [${calledShotTarget.toUpperCase()}]`,
      baseModifier: effectiveToHitMod,
      expression: `2d10${effectiveToHitMod !== 0 ? (effectiveToHitMod > 0 ? `+${effectiveToHitMod}` : `${effectiveToHitMod}`) : ''}`,
      rollMode: 'normal',
      characterName: characterData?.['char-name'] || characterData?.name || 'Operative',
      autoRoll: true
    });

    // Calculate damage preview
    const roll1 = Math.floor(Math.random() * 10) + 1;
    const roll2 = Math.floor(Math.random() * 10) + 1;
    let rawDamage = roll1 + roll2 + wpn.baseModifier;

    // Apply Called Shot Bonus/Penalty
    if (calledShotTarget === 'head') {
      rawDamage = Math.round(rawDamage * 1.5);
    }

    // Apply against target if selected
    if (selectedToken) {
      let targetDr = selectedToken.armor_dr || 0;
      if (calledShotTarget === 'chassis') {
        targetDr = Math.floor(targetDr * 0.5);
      }
      const netDamage = Math.max(1, rawDamage - targetDr);
      useEngineStore.getState().applyDamage(selectedToken.id, netDamage);

      setLastCombatResult({
        text: `${wpn.name} [${calledShotTarget.toUpperCase()}]: Fired ${wpn.damageDice} vs DR ${targetDr} -> ${netDamage} Net Dmg!`,
        damage: netDamage,
        targetName: selectedToken.name || selectedToken.id
      });
      AudioService.playCriticalChime(true);
    } else {
      setLastCombatResult({
        text: `${wpn.name} [${calledShotTarget.toUpperCase()}]: Fired for ${rawDamage} potential ${wpn.damageType} damage! (No target selected)`,
        damage: rawDamage,
        targetName: 'Open Air'
      });
      AudioService.playTerminalBeep();
    }
  };

  // Execute Tactical Maneuver
  const handlePerformManeuver = (man: typeof TACTICAL_MANEUVERS[0]) => {
    if (currentAp < man.apCost) {
      AudioService.playCriticalChime(false);
      return;
    }
    onConsumeAp(man.apCost);

    if (selectedToken && man.condition) {
      useEngineStore.getState().toggleCondition(selectedToken.id, man.condition);
    }

    setLastCombatResult({
      text: `Tactical Maneuver: ${man.name} activated (-${man.apCost} AP)`,
      damage: 0,
      targetName: selectedToken ? selectedToken.name : 'Self'
    });
    AudioService.playTerminalBeep();
  };

  // Execute Essence Invocation
  const handleInvokeEssence = (ess: typeof ESSENCE_INVOCATIONS[0]) => {
    if (currentAp < ess.apCost || currentEssence < ess.essenceCost) {
      AudioService.playCriticalChime(false);
      return;
    }
    onConsumeAp(ess.apCost);
    setCurrentEssence(prev => Math.max(0, prev - ess.essenceCost));

    if (selectedToken && ess.id === 'ess-lash') {
      useEngineStore.getState().applyDamage(selectedToken.id, 12);
    }

    setLastCombatResult({
      text: `Essence: ${ess.name} triggered (-${ess.essenceCost} Essence, -${ess.apCost} AP)`,
      damage: ess.id === 'ess-lash' ? 12 : 0,
      targetName: selectedToken ? selectedToken.name : 'Self'
    });
    AudioService.playCriticalChime(true);
  };

  return (
    <div className="space-y-2.5 font-mono select-none">
      {/* ===================================================================== */}
      {/* 4 AP BASE ECONOMY VISUALIZER (Interactive AP Pips)                    */}
      {/* ===================================================================== */}
      <div className="p-2.5 rounded-lg bg-[#0d121c] border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap size={13} className="text-amber-400 fill-amber-400" />
            ACTION ECONOMY (AP)
          </span>
          <button
            type="button"
            onClick={onResetAp}
            className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to 4 AP for new round"
          >
            <RotateCcw size={11} />
            <span>Turn Reset</span>
          </button>
        </div>

        {/* Individual AP Pips */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {Array.from({ length: maxAp }).map((_, idx) => {
            const isFilled = idx < currentAp;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isFilled) onConsumeAp(1);
                  else onConsumeAp(-(1));
                }}
                className={`h-7 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer ${
                  isFilled
                    ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-600 hover:border-slate-700'
                }`}
                title={`AP Pip ${idx + 1} of ${maxAp}`}
              >
                AP {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CALLED SHOTS TRAUMA TARGET MATRIX                                     */}
      {/* ===================================================================== */}
      <div className="p-2.5 rounded-lg bg-[#0a0e16] border border-slate-800/90 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <Crosshair size={13} className="text-amber-400" />
            CALLED SHOT MATRIX
          </span>
          <span className="text-[10px] text-amber-400/90 font-bold">
            {CALLED_SHOT_CONFIGS[calledShotTarget].hitMod}
          </span>
        </div>

        {/* 4-Way Location Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {(Object.keys(CALLED_SHOT_CONFIGS) as CalledShotLocation[]).map((loc) => {
            const cfg = CALLED_SHOT_CONFIGS[loc];
            const isSelected = calledShotTarget === loc;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => onSetCalledShotTarget(loc)}
                className={`p-2 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? cfg.color + ' shadow-[0_0_10px_rgba(245,158,11,0.2)] font-bold'
                    : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="capitalize">{cfg.label}</span>
                  {isSelected && <span className="text-[10px] font-mono">&bull; ACTIVE</span>}
                </div>
                <div className="text-[9.5px] text-slate-500 truncate">{cfg.effect}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ACTION CATEGORY SUB-TABS (Weapons, Tactics, Essence)                  */}
      {/* ===================================================================== */}
      <div className="flex items-center border-b border-slate-800 bg-[#090d13] p-1 rounded-t-lg gap-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveDeckTab('weapons')}
          className={`flex-1 py-1 rounded text-center font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 ${
            activeDeckTab === 'weapons'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame size={12} />
          <span>Weapons</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeckTab('tactics')}
          className={`flex-1 py-1 rounded text-center font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 ${
            activeDeckTab === 'tactics'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield size={12} />
          <span>Tactics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeckTab('essence')}
          className={`flex-1 py-1 rounded text-center font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 ${
            activeDeckTab === 'essence'
              ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={12} />
          <span>Essence</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB CONTENT: WEAPON ATTACK DECK                                       */}
      {/* ===================================================================== */}
      {activeDeckTab === 'weapons' && (
        <div className="space-y-1.5">
          {folioAttacks.map((wpn: WeaponAction) => {
            const canAfford = currentAp >= wpn.apCost;
            return (
              <div
                key={wpn.id}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                    <span>{wpn.name}</span>
                    <span className="text-[9.5px] px-1 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                      {wpn.damageType}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-amber-400 font-bold">{wpn.damageDice}</span>
                    <span>&bull;</span>
                    <span>{wpn.range}</span>
                    {wpn.special && (
                      <>
                        <span>&bull;</span>
                        <span className="text-slate-500">{wpn.special}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => handleFireWeapon(wpn)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    canAfford
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span>Strike</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950/80 border border-amber-500/30">
                    {wpn.apCost} AP
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB CONTENT: TACTICAL MANEUVERS                                       */}
      {/* ===================================================================== */}
      {activeDeckTab === 'tactics' && (
        <div className="space-y-1.5">
          {TACTICAL_MANEUVERS.map((man) => {
            const canAfford = currentAp >= man.apCost;
            return (
              <div
                key={man.id}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="text-cyan-400">{man.icon}</span>
                    <span>{man.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{man.description}</div>
                </div>

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => handlePerformManeuver(man)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    canAfford
                      ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/60'
                      : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span>Use</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30">
                    {man.apCost} AP
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB CONTENT: ESSENCE INVOCATIONS                                      */}
      {/* ===================================================================== */}
      {activeDeckTab === 'essence' && (
        <div className="space-y-2">
          {/* Essence Meter */}
          <div className="p-2 rounded-lg bg-purple-950/20 border border-purple-500/40">
            <div className="flex justify-between text-[10.5px] mb-1">
              <span className="text-purple-300 font-bold flex items-center gap-1">
                <Sparkles size={11} /> QUANTUM ESSENCE
              </span>
              <span className="text-purple-200 font-bold">{currentEssence} / {maxEssence}</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-purple-900/60">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 transition-all duration-300"
                style={{ width: `${(currentEssence / maxEssence) * 100}%` }}
              />
            </div>
          </div>

          {/* Invocation List */}
          <div className="space-y-1.5">
            {ESSENCE_INVOCATIONS.map((ess) => {
              const canAfford = currentAp >= ess.apCost && currentEssence >= ess.essenceCost;
              return (
                <div
                  key={ess.id}
                  className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span>{ess.name}</span>
                      <span className="text-[9.5px] px-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        {ess.tag}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{ess.effect}</div>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleInvokeEssence(ess)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      canAfford
                        ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/60'
                        : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span>Cast</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-purple-950/80 border border-purple-500/30">
                      {ess.essenceCost} Ess
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* COMBAT PIPELINE TELEMETRY BANNER                                      */}
      {/* ===================================================================== */}
      {lastCombatResult && (
        <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/40 text-[10.5px] text-amber-200 flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <ChevronRight size={12} className="text-amber-400 shrink-0" />
            <span className="truncate">{lastCombatResult.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastCombatResult(null)}
            className="text-slate-500 hover:text-slate-300 shrink-0 text-xs px-1"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default TangentActionDeck;
