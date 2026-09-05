/**
 * @file TangentActionDeck.tsx
 * @description Canonical Tangent SF RP Tactical Action Deck.
 * Strictly adheres to docs/game rules/operator/3.00 COMBAT.md:
 * - Skill-Rank-driven attack economy (Rank 0 Full Round, Rank 1-5: 1 action, Rank 6-10: 2 actions, etc.)
 * - Multiple Attack Penalty (MAP) progression (Action 1: 0, Action 2: -5, Action 3: -10, etc.)
 * - Active Defenses (Dodge, Parry, Block) with -5 cumulative consecutive reaction penalty
 * - Called Shots with canonical -5 Strike penalty (NOT an AP cost!)
 * - 2d10 dice resolution and canonical weapon damage formulas
 * - Tactical Maneuvers and Quantum Essence Invocations
 */

import React, { useState, useMemo } from 'react';
import { 
  Crosshair, 
  Shield, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Target,
  Swords,
  ChevronRight,
  Eye,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { useEngineStore, selectAllFusedTokens } from '../../../engine/index';
import { AudioService } from '../../../services/audioService';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { CombatArbitrator } from '../../../engine/rules/CombatArbitrator';

export type CalledShotLocation = 'head' | 'torso' | 'limbs' | 'chassis';

interface WeaponAction {
  id: string;
  name: string;
  skillName: string;
  skillRank: number;
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
    skillName: 'Energy Weapons',
    skillRank: 7, // Trained -> 2 attacks
    damageDice: '2d10+6',
    damageType: 'thermal',
    range: '40 / 120 ft',
    special: 'Melts Armor DR',
    baseModifier: 3
  },
  {
    id: 'wpn-mag-rifle',
    name: 'Gauss Rail Rifle',
    skillName: 'Firearms',
    skillRank: 8, // Trained -> 2 attacks
    damageDice: '2d10+8',
    damageType: 'kinetic',
    range: '80 / 300 ft',
    special: 'Piercing IV (AP 4)',
    baseModifier: 4
  },
  {
    id: 'wpn-monoblade',
    name: 'Monofilament Vibro-Blade',
    skillName: 'Melee',
    skillRank: 6, // Trained -> 2 attacks
    damageDice: '2d10+5',
    damageType: 'kinetic',
    range: 'Melee (5 ft)',
    special: 'Rend / Bleed',
    baseModifier: 5
  },
  {
    id: 'wpn-emp-grenade',
    name: 'Disruption EMP Grenade',
    skillName: 'Heavy Weapons',
    skillRank: 4, // Novice -> 1 attack
    damageDice: '2d10+2',
    damageType: 'disruption',
    range: '30 ft (AoE 15ft)',
    special: 'Stuns Cyberware (EMP DC 15)',
    baseModifier: 2
  }
];

const TACTICAL_MANEUVERS = [
  {
    id: 'man-cover',
    name: 'Take Cover',
    icon: <Shield size={13} />,
    description: '+2 Defense & grants Cover condition against ranged attacks',
    condition: 'Cover'
  },
  {
    id: 'man-aim',
    name: 'Calibrate Aim & Focus',
    icon: <Target size={13} />,
    description: '+2 to next strike (up to half effective combat skill)',
    condition: 'Aiming'
  },
  {
    id: 'man-total-defense',
    name: 'Total Defense',
    icon: <ShieldAlert size={13} />,
    description: '+4 DC to all incoming attacks until start of next turn',
    condition: 'Total Defense'
  },
  {
    id: 'man-overwatch',
    name: 'Set Overwatch Sector',
    icon: <Eye size={13} />,
    description: 'Prepares reactive strike if an enemy enters designated cone',
    condition: 'Overwatch'
  },
  {
    id: 'man-suppress',
    name: 'Suppressive Burst',
    icon: <Swords size={13} />,
    description: 'Pin target behind cover; causes Disadvantaged return fire',
    condition: 'Suppressed'
  }
];

const ESSENCE_INVOCATIONS = [
  {
    id: 'ess-lash',
    name: 'Psionic Mind Lash',
    essenceCost: 3,
    effect: '2d10 Direct Neural Damage (ignores kinetic DR) + Stun check',
    tag: 'Offensive'
  },
  {
    id: 'ess-ward',
    name: 'Kinetic Quantum Ward',
    essenceCost: 2,
    effect: 'Absorbs up to 15 kinetic damage for 1 round',
    tag: 'Defensive'
  },
  {
    id: 'ess-blink',
    name: 'Quantum Phase Blink',
    essenceCost: 4,
    effect: 'Instantly teleport up to 30 ft through solid barriers',
    tag: 'Utility'
  }
];

export interface TangentActionDeckProps {
  calledShotTarget: CalledShotLocation;
  onSetCalledShotTarget: (target: CalledShotLocation) => void;
  // Optional legacy props for backwards compatibility
  currentAp?: number;
  maxAp?: number;
  onConsumeAp?: (amount: number) => void;
  onResetAp?: () => void;
}

const combatArbitrator = new CombatArbitrator();

export const TangentActionDeck: React.FC<TangentActionDeckProps> = ({
  calledShotTarget,
  onSetCalledShotTarget,
  onResetAp
}) => {
  const fusedTokens = useEngineStore(selectAllFusedTokens);
  const selectedToken = fusedTokens.find(t => t.is_selected) || null;
  const folio = (useFolio() || {}) as any;
  const { characterData } = folio;
  const { openDiceRoller } = useDice();

  const [activeDeckTab, setActiveDeckTab] = useState<'weapons' | 'defense' | 'tactics' | 'essence'>('weapons');
  const [currentEssence, setCurrentEssence] = useState<number>(10);
  const maxEssence = 10;
  
  // Canonical combat turn state: attacks and defenses used this round
  const [attacksUsedThisRound, setAttacksUsedThisRound] = useState<number>(0);
  const [defensesUsedThisRound, setDefensesUsedThisRound] = useState<number>(0);

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
      return rawAttacks.map((a: any, idx: number) => {
        const skillName = a.skill || a.skillName || 'Combat';
        const rank = parseInt(a.rank || a.skillRank || 6, 10) || 6;
        return {
          id: a.id || `folio-atk-${idx}`,
          name: a.name || `Weapon #${idx + 1}`,
          skillName,
          skillRank: rank,
          damageDice: a.damage || '2d10',
          damageType: (a.type || 'kinetic').toLowerCase() as any,
          range: a.range || 'Standard',
          special: a.notes || undefined,
          baseModifier: parseInt(a.score || a.modifier || 0, 10) || 0
        };
      });
    }
    return DEFAULT_WEAPONS;
  }, [characterData?.attacks]);

  // Primary active weapon (first weapon by default)
  const activeWeapon = folioAttacks[0] || DEFAULT_WEAPONS[0];
  const activeSkillTier = combatArbitrator.getActionTier(activeWeapon.skillRank);
  const maxAttacks = activeSkillTier.actionsCount;

  // Called Shot Modifiers based on 3.00 COMBAT.md:
  // "Called shots impose a -5 Strike penalty to hit."
  const CALLED_SHOT_CONFIGS: Record<CalledShotLocation, { label: string; hitPenalty: number; effect: string; color: string }> = {
    head: { 
      label: 'Head / Optics', 
      hitPenalty: -5, 
      effect: '+100% Crit Dmg, Blind/Brain Death check',
      color: 'text-red-400 border-red-500/60 bg-red-950/30'
    },
    torso: { 
      label: 'Torso / Center Mass', 
      hitPenalty: 0, 
      effect: 'Standard damage vs full Armor DR',
      color: 'text-amber-300 border-amber-500/60 bg-amber-950/30'
    },
    limbs: { 
      label: 'Limbs / Actuators', 
      hitPenalty: -5, 
      effect: 'Cripples movement (-15ft) & disarm / limb disabled check',
      color: 'text-sky-300 border-sky-500/60 bg-sky-950/30'
    },
    chassis: { 
      label: 'Reactor / Chassis', 
      hitPenalty: -5, 
      effect: 'Penetrates 50% Armor DR, System Overload DC',
      color: 'text-purple-300 border-purple-500/60 bg-purple-950/30'
    }
  };

  // Turn / Round Reset
  const handleTurnReset = () => {
    setAttacksUsedThisRound(0);
    setDefensesUsedThisRound(0);
    if (onResetAp) onResetAp();
    AudioService.playTerminalBeep(800, 0.08);
  };

  // Execute Weapon Strike
  const handleFireWeapon = (wpn: WeaponAction, forcedAttackIndex?: number) => {
    const attackIndex = forcedAttackIndex !== undefined ? forcedAttackIndex : attacksUsedThisRound;
    const tier = combatArbitrator.getActionTier(wpn.skillRank);

    if (attackIndex >= tier.actionsCount) {
      AudioService.playCriticalChime(false);
      return;
    }

    const mapPenalty = combatArbitrator.calculateMAP(wpn.skillRank, attackIndex);
    const focusBonus = tier.focusBonus;
    const calledShotCfg = CALLED_SHOT_CONFIGS[calledShotTarget];
    const calledShotPenalty = calledShotCfg.hitPenalty;

    const effectiveModifier = wpn.baseModifier + mapPenalty + focusBonus + calledShotPenalty;

    // Roll interactive 2d10 dice check in DiceRollerDock
    openDiceRoller({
      label: `${wpn.name} [Action #${attackIndex + 1}] -> ${calledShotTarget.toUpperCase()}`,
      baseModifier: effectiveModifier,
      expression: `2d10${effectiveModifier !== 0 ? (effectiveModifier > 0 ? `+${effectiveModifier}` : `${effectiveModifier}`) : ''}`,
      rollMode: 'normal',
      characterName: characterData?.['char-name'] || characterData?.name || 'Operative',
      autoRoll: true
    });

    // Increment attacks used
    setAttacksUsedThisRound(prev => Math.min(tier.actionsCount, Math.max(prev + 1, attackIndex + 1)));

    // Damage simulation / execution
    const roll1 = Math.floor(Math.random() * 10) + 1;
    const roll2 = Math.floor(Math.random() * 10) + 1;
    let rawDamage = roll1 + roll2 + wpn.baseModifier;

    if (calledShotTarget === 'head') {
      rawDamage = Math.round(rawDamage * 1.5);
    }

    if (selectedToken) {
      let targetDr = selectedToken.armor_dr || 0;
      if (calledShotTarget === 'chassis') {
        targetDr = Math.floor(targetDr * 0.5);
      }
      const netDamage = Math.max(1, rawDamage - targetDr);
      useEngineStore.getState().applyDamage(selectedToken.id, netDamage);

      setLastCombatResult({
        text: `${wpn.name} (Atk #${attackIndex + 1}): Fired ${wpn.damageDice} vs DR ${targetDr} -> ${netDamage} Net Dmg to ${selectedToken.name || selectedToken.id}!`,
        damage: netDamage,
        targetName: selectedToken.name || selectedToken.id
      });
      AudioService.playCriticalChime(true);
    } else {
      setLastCombatResult({
        text: `${wpn.name} (Atk #${attackIndex + 1}): 2d10=${roll1 + roll2} + Mod ${wpn.baseModifier} = ${rawDamage} ${wpn.damageType} damage (No target selected).`,
        damage: rawDamage,
        targetName: 'Open Air'
      });
      AudioService.playTerminalBeep();
    }
  };

  // Execute Active Defense (Dodge / Parry / Block)
  const handleActiveDefense = (type: 'dodge' | 'parry' | 'block') => {
    const defensePenalty = combatArbitrator.calculateDefensePenalty(defensesUsedThisRound);
    const agilityScore = characterData?.attributes?.agi ?? characterData?.attributes?.dex ?? 0;
    const defenseSkillRank = characterData?.skills?.['skill-defense']?.rank ?? 5;
    const effectiveDefenseMod = agilityScore + defenseSkillRank + defensePenalty;

    openDiceRoller({
      label: `Active Defense [${type.toUpperCase()} #${defensesUsedThisRound + 1}] (Penalty: ${defensePenalty})`,
      baseModifier: effectiveDefenseMod,
      expression: `2d10${effectiveDefenseMod !== 0 ? (effectiveDefenseMod > 0 ? `+${effectiveDefenseMod}` : `${effectiveDefenseMod}`) : ''}`,
      rollMode: 'normal',
      characterName: characterData?.['char-name'] || characterData?.name || 'Operative',
      autoRoll: true
    });

    setDefensesUsedThisRound(prev => prev + 1);

    setLastCombatResult({
      text: `Active Defense (${type.toUpperCase()} #${defensesUsedThisRound + 1}) rolled with ${defensePenalty} consecutive penalty.`,
      damage: 0,
      targetName: 'Self'
    });
    AudioService.playTerminalBeep(1100, 0.06);
  };

  // Execute Tactical Maneuver
  const handlePerformManeuver = (man: typeof TACTICAL_MANEUVERS[0]) => {
    if (selectedToken && man.condition) {
      useEngineStore.getState().toggleCondition(selectedToken.id, man.condition);
    }

    setLastCombatResult({
      text: `Tactical Maneuver: ${man.name} activated. Condition "${man.condition}" applied.`,
      damage: 0,
      targetName: selectedToken ? selectedToken.name : 'Self'
    });
    AudioService.playTerminalBeep();
  };

  // Execute Essence Invocation
  const handleInvokeEssence = (ess: typeof ESSENCE_INVOCATIONS[0]) => {
    if (currentEssence < ess.essenceCost) {
      AudioService.playCriticalChime(false);
      return;
    }
    setCurrentEssence(prev => Math.max(0, prev - ess.essenceCost));

    if (selectedToken && ess.id === 'ess-lash') {
      useEngineStore.getState().applyDamage(selectedToken.id, 12);
    }

    setLastCombatResult({
      text: `Essence: ${ess.name} invoked (-${ess.essenceCost} Essence).`,
      damage: ess.id === 'ess-lash' ? 12 : 0,
      targetName: selectedToken ? selectedToken.name : 'Self'
    });
    AudioService.playCriticalChime(true);
  };

  return (
    <div className="space-y-2.5 font-mono select-none">
      {/* ===================================================================== */}
      {/* CANONICAL SKILL-RANK ACTION TRACKER                                   */}
      {/* ===================================================================== */}
      <div className="p-2.5 rounded-lg bg-[#0d121c] border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-slate-300 font-bold uppercase tracking-wider">
              SKILL ACTIONS ({activeSkillTier.title})
            </span>
          </div>
          <button
            type="button"
            onClick={handleTurnReset}
            className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
            title="Reset round attacks & defenses"
          >
            <RotateCcw size={10} />
            <span>Round Reset</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-between">
          <span>Attacks Unlocked: <strong className="text-amber-300">{maxAttacks}</strong> (Rank {activeWeapon.skillRank})</span>
          <span>Focus Bonus: <strong className="text-emerald-400">+{activeSkillTier.focusBonus}</strong></span>
        </div>

        {/* Dynamic Skill Action Slot Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {Array.from({ length: maxAttacks }).map((_, idx) => {
            const isUsed = idx < attacksUsedThisRound;
            const penalty = combatArbitrator.calculateMAP(activeWeapon.skillRank, idx);
            const penaltyText = penalty === 0 ? 'Base' : `${penalty}`;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleFireWeapon(activeWeapon, idx)}
                className={`h-8 rounded-lg border flex flex-col items-center justify-center font-bold text-[10px] transition-all cursor-pointer ${
                  isUsed
                    ? 'bg-slate-950/80 border-slate-800 text-slate-500 opacity-60'
                    : 'bg-amber-500/15 border-amber-500/70 text-amber-300 hover:bg-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                }`}
                title={`Execute Attack #${idx + 1} with ${penaltyText} MAP`}
              >
                <span>Atk #{idx + 1}</span>
                <span className="text-[8.5px] font-normal text-slate-400">{penaltyText} MAP</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CALLED SHOTS TRAUMA TARGET MATRIX (-5 STRIKE PENALTY)                 */}
      {/* ===================================================================== */}
      <div className="p-2.5 rounded-lg bg-[#0a0e16] border border-slate-800/90 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <Crosshair size={13} className="text-amber-400" />
            CALLED SHOT MATRIX
          </span>
          <span className="text-[10px] text-amber-400/90 font-bold">
            {CALLED_SHOT_CONFIGS[calledShotTarget].hitPenalty === 0 ? 'Normal (+0)' : '-5 Strike Penalty'}
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
      {/* ACTION CATEGORY SUB-TABS (Weapons, Defense, Tactics, Essence)         */}
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
          onClick={() => setActiveDeckTab('defense')}
          className={`flex-1 py-1 rounded text-center font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 ${
            activeDeckTab === 'defense'
              ? 'bg-sky-950 text-sky-300 border border-sky-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert size={12} />
          <span>Defenses</span>
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
            const tier = combatArbitrator.getActionTier(wpn.skillRank);
            const canStrike = attacksUsedThisRound < tier.actionsCount;
            const nextMap = combatArbitrator.calculateMAP(wpn.skillRank, attacksUsedThisRound);
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
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {wpn.skillName} (Rank {wpn.skillRank}) &bull; {tier.actionsCount} Atks Max
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canStrike}
                  onClick={() => handleFireWeapon(wpn)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    canStrike
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span>Strike</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950/80 border border-amber-500/30 font-mono">
                    {nextMap === 0 ? '0 MAP' : `${nextMap}`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB CONTENT: ACTIVE DEFENSES (Dodge, Parry, Block)                    */}
      {/* ===================================================================== */}
      {activeDeckTab === 'defense' && (
        <div className="space-y-2">
          <div className="p-2 rounded-lg bg-sky-950/20 border border-sky-500/40 text-[10px] text-sky-300">
            Consecutive Active Defenses suffer a cumulative <strong>-5 penalty</strong> per reaction in the same round.
            <div className="mt-1 text-slate-400">Defenses used this round: <strong className="text-sky-200">{defensesUsedThisRound}</strong> (Next penalty: <strong className="text-amber-300">{combatArbitrator.calculateDefensePenalty(defensesUsedThisRound)}</strong>)</div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleActiveDefense('dodge')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/60 text-slate-200 hover:text-sky-300 text-center transition-all cursor-pointer"
            >
              <div className="text-xs font-bold">Dodge</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Agi + Defense</div>
            </button>

            <button
              type="button"
              onClick={() => handleActiveDefense('parry')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/60 text-slate-200 hover:text-sky-300 text-center transition-all cursor-pointer"
            >
              <div className="text-xs font-bold">Parry</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Melee + Defense</div>
            </button>

            <button
              type="button"
              onClick={() => handleActiveDefense('block')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/60 text-slate-200 hover:text-sky-300 text-center transition-all cursor-pointer"
            >
              <div className="text-xs font-bold">Block</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Shield DR Soak</div>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB CONTENT: TACTICAL MANEUVERS                                       */}
      {/* ===================================================================== */}
      {activeDeckTab === 'tactics' && (
        <div className="space-y-1.5">
          {TACTICAL_MANEUVERS.map((man) => (
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
                onClick={() => handlePerformManeuver(man)}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/60"
              >
                <span>Activate</span>
              </button>
            </div>
          ))}
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
              const canAfford = currentEssence >= ess.essenceCost;
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
                    <span className="text-[10px] px-1 py-0.2 rounded bg-purple-950/80 border border-purple-500/30 font-mono">
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
