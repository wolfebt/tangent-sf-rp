import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  Shield,
  Zap,
  Swords,
  Activity,
  Skull,
  Heart,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Dices,
  Flame,
  RefreshCw,
  CheckCircle2,
  Target,
  Cpu,
  ShieldAlert,
  BatteryCharging,
  Pin,
  PinOff,
  Eye,
  Users,
  Footprints,
  FastForward,
  ShieldCheck,
  Compass
} from 'lucide-react';
import AudioService from '../../../../services/audioService';
import { rollDice } from '../../../../services/diceService';
import { CANONICAL_PING_TYPES } from '../../../../services/mapPingService';
import { DEFAULT_WEAPONRY } from '../../../../data/weaponryData';
import { HIT_LOCATIONS } from './CombatResolutionModal';

/**
 * Multi-Attack Penalty (MAP) Ladder according to RULE-SKL-01:
 * 1st Attack: +0 (Base Score)
 * 2nd Attack: -5 Strike
 * 3rd Attack: -10 Strike
 * 4th Attack: -15 Strike
 * 5th Attack: -20 Strike
 */
const MAP_LADDER = [
  { step: 1, penalty: 0, label: '1st Strike (+0)' },
  { step: 2, penalty: -5, label: '2nd Strike (-5)' },
  { step: 3, penalty: -10, label: '3rd Strike (-10)' },
  { step: 4, penalty: -15, label: '4th Strike (-15)' },
  { step: 5, penalty: -20, label: '5th Strike (-20)' }
];

const DEFAULT_TACTICAL_WEAPONS = [
  {
    id: 'wpn_pulse_rifle',
    name: 'Pulse Rifle',
    damage: '2d8+3',
    damageType: 'kinetic',
    range: '80 ft',
    ap: 2,
    mod: 3,
    notes: 'Burst fire • Rapid cycle'
  },
  {
    id: 'wpn_laser_blaster',
    name: 'Laser Blaster',
    damage: '2d10+4',
    damageType: 'energy',
    range: '120 ft',
    ap: 4,
    mod: 3,
    notes: 'Coherent thermal beam'
  },
  {
    id: 'wpn_monoblade',
    name: 'Monomolecular Blade',
    damage: '2d6+4',
    damageType: 'kinetic',
    range: 'Melee (5 ft)',
    ap: 6,
    mod: 4,
    notes: 'Armor piercing edge • Fast parry'
  },
  {
    id: 'wpn_plasma_pistol',
    name: 'Plasma Pistol',
    damage: '2d10+2',
    damageType: 'plasma',
    range: '40 ft',
    ap: 5,
    mod: 2,
    notes: 'Superheated bolt • Force splash'
  }
];

export const OperativeCockpitRail = ({
  tokens = [],
  activeTokenId,
  onSelectActiveToken,
  vttRole = 'operative',
  isPinned = false,
  onTogglePin,
  isCollapsed = false,
  onToggleCollapse,
  targetToken = null,
  onSelectTargetToken,
  onTriggerAttack,
  onDropPing,
  onTriggerFloatingText,
  onBroadcastMessage,
  activeSensorMode = 'standard_optical',
  onChangeSensorMode,
  onUpdateTokenHealth,
  onUpdateTokenVitality,
  onUpdateTokenStructure
}) => {
  // Action Points budget state
  const [apBudget, setApBudget] = useState({ standard: 1, move: 1, reaction: 1 });
  
  // Tactical Movement Stance
  const [movementStance, setMovementStance] = useState('pace'); // 'pace' | 'sprint' | 'guard' | 'evasive'
  
  // Combat State
  const [selectedWeaponId, setSelectedWeaponId] = useState('wpn_pulse_rifle');
  const [activeMapStep, setActiveMapStep] = useState(1); // 1 to 5
  const [selectedCalledShotId, setSelectedCalledShotId] = useState('center_mass');
  const [edgeAiming, setEdgeAiming] = useState(false);
  const [edgeFlanking, setEdgeFlanking] = useState(false);
  const [edgeHighGround, setEdgeHighGround] = useState(false);
  const [hasAdvantage, setHasAdvantage] = useState(false);
  const [hasDisadvantage, setHasDisadvantage] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('combat'); // 'profile' | 'movement' | 'combat' | 'abilities'
  const [lastRollResult, setLastRollResult] = useState(null);

  // Active Token Resolution
  const activeToken = useMemo(() => {
    return tokens.find(t => t.id === activeTokenId) || tokens[0] || {
      id: 'mock_op',
      label: 'Operative Lead',
      name: 'Operative Lead',
      type: 'operative',
      health: { current: 30, max: 30 },
      vitality: { current: 25, max: 25 },
      structure: { current: 50, max: 50 },
      sp: 12,
      maxSp: 12,
      armorDr: 4,
      staminaDr: 2,
      defense: 12,
      speed: 6,
      conditions: []
    };
  }, [tokens, activeTokenId]);

  // Is unit synthetic or vehicle?
  const isSynthetic = activeToken.isSynthetic || activeToken.type === 'synthetic' || activeToken.type === 'vehicle';

  // Current Vitals
  const curHealth = activeToken.health?.current ?? activeToken.hp ?? 30;
  const maxHealth = activeToken.health?.max ?? activeToken.maxHp ?? 30;
  const curVitality = activeToken.vitality?.current ?? 25;
  const maxVitality = activeToken.vitality?.max ?? 25;
  const curStructure = activeToken.structure?.current ?? 50;
  const maxStructure = activeToken.structure?.max ?? 50;
  const curShield = activeToken.sp ?? activeToken.shield?.current ?? 10;
  const maxShield = activeToken.maxSp ?? activeToken.shield?.max ?? 10;
  const armorDr = activeToken.armorDr ?? activeToken.toughness ?? 4;
  const staminaDr = activeToken.staminaDr ?? 2;
  const conditions = activeToken.conditions || [];
  const stability = activeToken.stability ?? 5; // Bleedout Stability Pool (RULE-CMB-06)

  // Weapons list
  const availableWeapons = useMemo(() => {
    if (activeToken.attacks && activeToken.attacks.length > 0) {
      return activeToken.attacks.map((att, idx) => ({
        id: att.id || `att_${idx}`,
        name: att.name || 'Weapon',
        damage: att.damage || att.damageDice || '2d8+2',
        damageType: att.damageType || 'kinetic',
        range: att.range || '50 ft',
        ap: att.ap || 0,
        mod: parseInt(att.score || att.mod || 3, 10) || 3,
        notes: att.notes || att.special || ''
      }));
    }
    return DEFAULT_TACTICAL_WEAPONS;
  }, [activeToken.attacks]);

  const activeWeapon = availableWeapons.find(w => w.id === selectedWeaponId) || availableWeapons[0];

  // Enemy / Target Token Resolution
  const resolvedTargetToken = useMemo(() => {
    if (targetToken) return targetToken;
    return tokens.find(t => t.id !== activeToken.id && (t.type === 'hostile' || t.type === 'adversary' || t.type === 'npc'));
  }, [tokens, targetToken, activeToken.id]);

  // Called Shot lookup
  const activeCalledShot = useMemo(() => {
    if (selectedCalledShotId === 'center_mass') {
      return { id: 'center_mass', label: 'Center Mass', penalty: -1, saveType: 'Fortitude', effect: 'Winded (-2 Actions)' };
    }
    const loc = HIT_LOCATIONS.find(h => h.id === selectedCalledShotId);
    if (loc) {
      return {
        id: loc.id,
        label: loc.label,
        penalty: loc.penalty,
        saveType: loc.saveType,
        effect: loc.traumaEffect
      };
    }
    return { id: 'torso', label: 'Torso', penalty: -2, saveType: 'Fortitude', effect: 'Winded' };
  }, [selectedCalledShotId]);

  // AP handlers
  const handleSpendAp = (type) => {
    if (apBudget[type] <= 0) return;
    AudioService.playTerminalBeep(980, 0.05);
    setApBudget(prev => ({ ...prev, [type]: prev[type] - 1 }));
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 120, `-1 AP (${type.toUpperCase()})`, 'karma');
    }
  };

  const handleRefreshAp = () => {
    AudioService.playTerminalBeep(1200, 0.1);
    setApBudget({ standard: 1, move: 1, reaction: 1 });
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 120, `+3 AP REFRESHED`, 'heal');
    }
  };

  // Stance Handler
  const handleSetStance = (stance) => {
    setMovementStance(stance);
    AudioService.playTerminalBeep(1050, 0.06);
    let label = 'PACE (Standard)';
    if (stance === 'sprint') label = 'SPRINT (+10 ft / -2 Def)';
    if (stance === 'guard') label = 'GUARD STANCE (+2 Active Def)';
    if (stance === 'evasive') label = 'EVASIVE (+Def vs Ranged)';
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 140, `STANCE: ${label}`, 'karma');
    }
    if (onBroadcastMessage) {
      onBroadcastMessage(`[TACTICAL STANCE]: ${activeToken.label || 'Operative'} engaged ${label}`);
    }
  };

  // Consumables / Abilities
  const handleUseConsumable = (item, healAmount = 15) => {
    AudioService.playTerminalBeep(1100, 0.1);
    if (isSynthetic) {
      if (onUpdateTokenStructure) onUpdateTokenStructure(activeToken.id, Math.min(maxStructure, curStructure + healAmount), false, healAmount);
    } else {
      if (onUpdateTokenHealth) onUpdateTokenHealth(activeToken.id, Math.min(maxHealth, curHealth + healAmount), false, healAmount);
    }
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 140, `USED: ${item} (+${healAmount})`, 'heal');
    }
    if (onBroadcastMessage) {
      onBroadcastMessage(`[OPERATIVE TACTICAL]: ${activeToken.label || 'Operative'} deployed ${item}`);
    }
  };

  // BASTION Strike Arbitration Execution
  const handleExecuteBastionAttack = () => {
    // 1. Calculate Multi-Attack Penalty (MAP)
    const mapObj = MAP_LADDER.find(m => m.step === activeMapStep) || MAP_LADDER[0];
    const mapPenalty = mapObj.penalty;

    // 2. Called Shot Penalty
    const calledPenalty = activeCalledShot.penalty;

    // 3. Edge Modifiers
    let edgeMod = 0;
    if (edgeAiming) edgeMod += 2;
    if (edgeFlanking) edgeMod += 2;
    if (edgeHighGround) edgeMod += 2;

    const baseMod = activeWeapon.mod || 3;
    const totalStrikeMod = baseMod + mapPenalty + calledPenalty + edgeMod;

    // 4. Roll 2d10 using canonical BASTION dice engine
    const rollExpr = hasAdvantage ? '2d10kh1' : hasDisadvantage ? '2d10kl1' : '2d10';
    const diceResult = rollDice(rollExpr);
    const d10Sum = diceResult.rolls.reduce((a, b) => a + b, 0);
    const isCritSuccess = diceResult.rolls[0] === 10 && diceResult.rolls[1] === 10;
    const isCritFumble = diceResult.rolls[0] === 1 && diceResult.rolls[1] === 1;

    let finalStrikeScore = d10Sum + totalStrikeMod;
    if (isCritSuccess) finalStrikeScore += 30; // RULE-RES-03
    if (isCritFumble) finalStrikeScore -= 10;

    // 5. Defender Target
    const targetDefense = resolvedTargetToken ? (resolvedTargetToken.defense || 12) : 15;
    // BASTION RULE-RES-01: Opposed roll, Attacker strictly exceeds Defender to hit. DEFENDER WINS TIES!
    const isHit = isCritSuccess || (!isCritFumble && finalStrikeScore > targetDefense);

    // 6. Damage Calculation (RULE-CMB-03)
    let netDamage = 0;
    let targetShieldDmg = 0;
    let targetHpDmg = 0;

    if (isHit) {
      const dmgDiceExpr = isCritSuccess ? `${activeWeapon.damage}*2` : activeWeapon.damage;
      const dmgRoll = rollDice(dmgDiceExpr);
      const rawDmg = Math.max(1, dmgRoll.total);
      
      const targetArmorDr = resolvedTargetToken?.armorDr ?? resolvedTargetToken?.toughness ?? 3;
      const effectiveDr = Math.max(0, targetArmorDr - (activeWeapon.ap || 0));
      netDamage = Math.max(1, rawDmg - effectiveDr);

      // Distribute to Target Shields first
      const targetCurShield = resolvedTargetToken?.sp ?? resolvedTargetToken?.shield?.current ?? 0;
      if (targetCurShield > 0) {
        targetShieldDmg = Math.min(targetCurShield, netDamage);
        targetHpDmg = netDamage - targetShieldDmg;
      } else {
        targetHpDmg = netDamage;
      }
    }

    const resultSummary = {
      timestamp: Date.now(),
      weapon: activeWeapon.name,
      targetName: resolvedTargetToken?.label || resolvedTargetToken?.name || 'Target',
      d10Sum,
      rolls: diceResult.rolls,
      totalStrikeMod,
      finalStrikeScore,
      targetDefense,
      isHit,
      isCritSuccess,
      isCritFumble,
      netDamage,
      targetShieldDmg,
      targetHpDmg,
      calledShot: activeCalledShot.label,
      mapStep: mapObj.step
    };

    setLastRollResult(resultSummary);

    // Audio & Visual feedback
    if (isCritSuccess) {
      AudioService.playCriticalRoll();
    } else if (isHit) {
      AudioService.playCombatHit(netDamage >= 12);
    } else {
      AudioService.playTerminalBeep(350, 0.15);
    }

    // Trigger Floating Text
    if (onTriggerFloatingText) {
      const resultText = isCritSuccess
        ? `CRITICAL STRIKE! ${finalStrikeScore} vs DEF ${targetDefense} (DMG: ${netDamage})`
        : isHit
        ? `HIT! ${finalStrikeScore} vs DEF ${targetDefense} (-${netDamage} HP)`
        : `MISS! ${finalStrikeScore} vs DEF ${targetDefense}`;
      onTriggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2 - 80,
        resultText,
        isCritSuccess ? 'crit_success' : isHit ? 'damage' : 'crit_fail'
      );
    }

    // Broadcast to Adventure Log
    if (onBroadcastMessage) {
      const logMsg = `[BASTION ARBITRATION]: ${activeToken.label} struck ${resultSummary.targetName} with ${activeWeapon.name} [Location: ${activeCalledShot.label}, MAP: ${mapObj.label}]. Roll: 2d10(${diceResult.rolls.join('+')})${totalStrikeMod >= 0 ? '+' : ''}${totalStrikeMod} = ${finalStrikeScore} vs DEF ${targetDefense}. Result: ${isHit ? `HIT (-${netDamage} Net Damage)` : 'DEFENDER REPELS'}`;
      onBroadcastMessage(logMsg);
    }

    // Trigger external attack callback if target exists
    if (onTriggerAttack && resolvedTargetToken) {
      onTriggerAttack(activeToken.id, resolvedTargetToken.id, netDamage);
    }
  };

  return (
    <aside
      className="h-full shrink-0 flex z-30 select-none font-sans"
      aria-label="Operative Cockpit Tactical Rail"
    >
      {/* 48px Vertical Icon Strip */}
      <nav
        className="w-12 shrink-0 h-full border-r border-cyan-950/80 bg-[#090d13] flex flex-col items-center py-2.5 gap-2 z-20 shadow-[2px_0_15px_rgba(0,0,0,0.5)]"
        aria-label="Operative Rail Nav"
      >
        {/* Unit Status Icon */}
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) onToggleCollapse?.();
            setActiveAccordion('profile');
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
            activeAccordion === 'profile' && !isCollapsed
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
          }`}
          title="Unit Profile & Vitals"
        >
          <Activity size={18} />
          {curHealth <= maxHealth * 0.3 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        {/* Combat Action Deck */}
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) onToggleCollapse?.();
            setActiveAccordion('combat');
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
            activeAccordion === 'combat' && !isCollapsed
              ? 'bg-amber-950 text-amber-300 border border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
          }`}
          title="BASTION Combat Engine"
        >
          <Swords size={18} />
        </button>

        {/* Action & Movement Stance */}
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) onToggleCollapse?.();
            setActiveAccordion('movement');
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
            activeAccordion === 'movement' && !isCollapsed
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
          }`}
          title="AP Economy & Locomotion"
        >
          <Footprints size={18} />
        </button>

        {/* Abilities & Invocations */}
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) onToggleCollapse?.();
            setActiveAccordion('abilities');
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
            activeAccordion === 'abilities' && !isCollapsed
              ? 'bg-purple-950 text-purple-300 border border-purple-500/70 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
          }`}
          title="Quick Abilities & Consumables"
        >
          <Zap size={18} />
        </button>

        <div className="w-6 h-px bg-slate-800 my-1" />

        {/* Tactical Radar Pings */}
        <div className="flex flex-col items-center gap-1.5 flex-1 overflow-y-auto scrollbar-none w-full px-1">
          {CANONICAL_PING_TYPES.map(p => (
            <button
              key={p.type}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(p.soundFreq, 0.08);
                if (onDropPing) onDropPing(p.type);
              }}
              className="w-8 h-8 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-xs flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              title={`Broadcast ${p.label} Ping`}
            >
              <span>{p.icon}</span>
            </button>
          ))}
        </div>

        {/* Pin / Expand Toggle */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onTogglePin}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isPinned
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)] font-bold'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title={isPinned ? 'Unpin Left Rail' : 'Pin Left Rail Open (Dual-Wielding)'}
          >
            {isPinned ? <Pin size={15} /> : <PinOff size={15} />}
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Operative Cockpit' : 'Collapse Operative Cockpit'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </nav>

      {/* Expanded Operative Cockpit Drawer */}
      <div
        className={`h-full border-r border-slate-800/90 bg-[#0a0e14]/95 backdrop-blur-md transition-all duration-200 flex flex-col overflow-hidden shadow-2xl ${
          isCollapsed ? 'w-0 border-r-0' : 'w-72 sm:w-80'
        }`}
      >
        {/* Drawer Header: Active Entity Identification & Switcher */}
        <div className="h-12 px-3 border-b border-cyan-950/80 bg-[#080c12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{activeToken.type === 'vehicle' ? '🚀' : activeToken.type === 'companion' ? '🤖' : '🧙‍♂️'}</span>
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-xs font-bold text-cyan-300 truncate">
                {activeToken.label || activeToken.name || 'Operative'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                {isSynthetic ? 'Synthetic Chassis' : 'Biological Asset'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                isPinned ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={isPinned ? 'Unpin' : 'Pin Open'}
            >
              {isPinned ? <Pin size={13} /> : <PinOff size={13} />}
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Collapse"
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        </div>

        {/* Multi-Unit Switcher Pills */}
        {tokens.length > 1 && (
          <div className="px-3 py-1.5 bg-[#06090e] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[9px] uppercase font-bold text-slate-500 shrink-0">Units:</span>
            {tokens.map(tok => (
              <button
                key={tok.id}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(850, 0.04);
                  if (onSelectActiveToken) onSelectActiveToken(tok.id);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  activeToken.id === tok.id
                    ? 'bg-cyan-600 text-black shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tok.label || tok.name || 'Unit'}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-3 text-slate-200 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-cyan-950">
          {/* Vitals Overview Card */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-950 flex flex-col gap-2">
            {/* Health / Structure Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <Heart size={11} className="text-emerald-400" />
                  <span>{isSynthetic ? 'Structure:' : 'Health (HP):'}</span>
                </span>
                <span className="text-slate-300 font-bold">
                  {isSynthetic ? `${curStructure}/${maxStructure}` : `${curHealth}/${maxHealth}`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${isSynthetic ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{
                    width: `${Math.max(0, Math.min(100, (isSynthetic ? curStructure / maxStructure : curHealth / maxHealth) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Shield Points (SP) Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-cyan-400 font-bold uppercase flex items-center gap-1">
                  <Shield size={11} className="text-cyan-400" />
                  <span>Shields (SP):</span>
                </span>
                <span className="text-slate-300 font-bold">{curShield}/{maxShield}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  style={{ width: `${Math.max(0, Math.min(100, (curShield / Math.max(1, maxShield)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Armor DR, Stamina DR, and Bleedout Stability */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-800/80">
              <div className="p-1 rounded bg-slate-900/90 border border-slate-800 flex flex-col items-center">
                <span className="text-slate-400 text-[8px] uppercase">Armor DR</span>
                <span className="font-bold text-amber-300">{armorDr}</span>
              </div>
              <div className="p-1 rounded bg-slate-900/90 border border-slate-800 flex flex-col items-center">
                <span className="text-slate-400 text-[8px] uppercase">Stamina DR</span>
                <span className="font-bold text-purple-300">{staminaDr}</span>
              </div>
              <div className="p-1 rounded bg-slate-900/90 border border-slate-800 flex flex-col items-center">
                <span className="text-slate-400 text-[8px] uppercase">Stability</span>
                <span className={`font-bold ${curHealth <= 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {stability}
                </span>
              </div>
            </div>

            {/* Conditions / Status Gems */}
            {conditions.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/80">
                {conditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800 text-[9px] text-red-300 font-mono font-bold flex items-center gap-1"
                  >
                    <span>⚠️</span>
                    <span>{cond}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Economy (AP) & Movement Cluster */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                <Activity size={12} />
                <span>Action Economy (AP):</span>
              </span>
              <button
                type="button"
                onClick={handleRefreshAp}
                className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/50"
              >
                <RefreshCw size={9} />
                <span>Refresh</span>
              </button>
            </div>

            {/* AP Spend Buttons */}
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => handleSpendAp('standard')}
                className={`py-1 rounded font-bold transition-all cursor-pointer flex flex-col items-center ${
                  apBudget.standard > 0
                    ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-600 line-through'
                }`}
                title="Spend Standard Action"
              >
                <span>STANDARD</span>
                <span className="text-[8px] opacity-75">{apBudget.standard > 0 ? '1 Avail' : 'Spent'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSpendAp('move')}
                className={`py-1 rounded font-bold transition-all cursor-pointer flex flex-col items-center ${
                  apBudget.move > 0
                    ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-600 line-through'
                }`}
                title="Spend Move Action"
              >
                <span>MOVE</span>
                <span className="text-[8px] opacity-75">{apBudget.move > 0 ? '1 Avail' : 'Spent'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSpendAp('reaction')}
                className={`py-1 rounded font-bold transition-all cursor-pointer flex flex-col items-center ${
                  apBudget.reaction > 0
                    ? 'bg-purple-500/20 border border-purple-500/60 text-purple-300 hover:bg-purple-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-600 line-through'
                }`}
                title="Spend Reaction Slot"
              >
                <span>REACTION</span>
                <span className="text-[8px] opacity-75">{apBudget.reaction > 0 ? '1 Avail' : 'Spent'}</span>
              </button>
            </div>

            {/* Tactical Stance Selector */}
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/80">
              <span className="text-[9px] uppercase font-bold text-slate-400">Locomotion Stance:</span>
              <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                <button
                  type="button"
                  onClick={() => handleSetStance('pace')}
                  className={`py-1 px-1.5 rounded border font-bold text-left transition-all cursor-pointer ${
                    movementStance === 'pace'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🚶 Pace (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStance('sprint')}
                  className={`py-1 px-1.5 rounded border font-bold text-left transition-all cursor-pointer ${
                    movementStance === 'sprint'
                      ? 'bg-amber-950 border-amber-500 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Sprint (+10ft)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStance('guard')}
                  className={`py-1 px-1.5 rounded border font-bold text-left transition-all cursor-pointer ${
                    movementStance === 'guard'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ Guard (+2 Def)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStance('evasive')}
                  className={`py-1 px-1.5 rounded border font-bold text-left transition-all cursor-pointer ${
                    movementStance === 'evasive'
                      ? 'bg-purple-950 border-purple-500 text-purple-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🌀 Evasive Move
                </button>
              </div>
            </div>

            {/* Sensor / Vision Mode Selector */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <Eye size={11} />
                <span>Sensor LoS:</span>
              </span>
              <select
                value={activeSensorMode}
                onChange={(e) => onChangeSensorMode?.(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-cyan-300 outline-none font-mono"
              >
                <option value="standard_optical">Optical / Visible</option>
                <option value="thermal_ir">Thermal IR</option>
                <option value="cyber_radar">Cyber Radar</option>
                <option value="meta_attunement">Meta Influx</option>
              </select>
            </div>
          </div>

          {/* BASTION Combat Engine Section */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-950/70 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                <Swords size={12} />
                <span>BASTION Combat Engine</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                2d10 ARBITRATION
              </span>
            </div>

            {/* Weapon Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Equipped Weapon:</label>
              <select
                value={selectedWeaponId}
                onChange={(e) => setSelectedWeaponId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-amber-300 font-bold outline-none"
              >
                {availableWeapons.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.damage}) — Rng: {w.range}
                  </option>
                ))}
              </select>
            </div>

            {/* Multi-Attack Penalty (MAP) Ladder */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                <span>Multi-Attack Ladder (RULE-SKL-01):</span>
                <span className="text-amber-400 font-mono">
                  {MAP_LADDER.find(m => m.step === activeMapStep)?.label}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 font-mono text-[9px]">
                {MAP_LADDER.map(map => (
                  <button
                    key={map.step}
                    type="button"
                    onClick={() => setActiveMapStep(map.step)}
                    className={`py-1 rounded font-bold transition-all cursor-pointer text-center ${
                      activeMapStep === map.step
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    #{map.step} ({map.penalty})
                  </button>
                ))}
              </div>
            </div>

            {/* Called Shot Matrix */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                <span>Called Shot Matrix (RULE-CMB-04):</span>
                <span className="text-purple-300 font-mono">{activeCalledShot.label} ({activeCalledShot.penalty})</span>
              </div>
              <select
                value={selectedCalledShotId}
                onChange={(e) => setSelectedCalledShotId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-purple-300 outline-none font-mono"
              >
                <option value="center_mass">Torso: Center Mass (-1 Strike) • Fortitude vs Winded</option>
                <option value="head">Head / Sensory (-4 Strike) • Reason vs Stunned/KO</option>
                <option value="right_arm">Right Arm (-4 Strike) • Reflex vs Disarm</option>
                <option value="left_arm">Left Arm (-4 Strike) • Reflex vs Disarm</option>
                <option value="right_leg">Right Leg (-2 Strike) • Might vs Hobbled</option>
                <option value="left_leg">Left Leg (-2 Strike) • Might vs Hobbled</option>
              </select>
              <span className="text-[9px] text-slate-500 italic truncate">
                Save Target: {activeCalledShot.effect}
              </span>
            </div>

            {/* Tactical Edge Modifiers */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80 text-[10px]">
              <button
                type="button"
                onClick={() => setEdgeAiming(!edgeAiming)}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  edgeAiming
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Aim (+2)
              </button>
              <button
                type="button"
                onClick={() => setEdgeFlanking(!edgeFlanking)}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  edgeFlanking
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Flank (+2)
              </button>
              <button
                type="button"
                onClick={() => setEdgeHighGround(!edgeHighGround)}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  edgeHighGround
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                High Ground (+2)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasAdvantage(!hasAdvantage);
                  if (!hasAdvantage) setHasDisadvantage(false);
                }}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  hasAdvantage
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                ADV (2d10kh1)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasDisadvantage(!hasDisadvantage);
                  if (!hasDisadvantage) setHasAdvantage(false);
                }}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  hasDisadvantage
                    ? 'bg-red-950 border-red-500 text-red-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                DIS (2d10kl1)
              </button>
            </div>

            {/* Target Information */}
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <Target size={11} className="text-red-400" />
                <span>Target:</span>
              </span>
              <span className="font-mono font-bold text-red-300 truncate max-w-[150px]">
                {resolvedTargetToken?.label || resolvedTargetToken?.name || 'No Target Selected'}
                {resolvedTargetToken && ` (DEF ${resolvedTargetToken.defense || 12})`}
              </span>
            </div>

            {/* BASTION Attack Trigger Button */}
            <button
              type="button"
              onClick={handleExecuteBastionAttack}
              className="py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95 cursor-pointer mt-1"
            >
              <Dices size={15} />
              <span>Roll BASTION Strike (2d10)</span>
            </button>

            {/* Last Roll Outcome Card */}
            {lastRollResult && (
              <div className={`p-2 rounded-lg border text-[10px] font-mono mt-1 ${
                lastRollResult.isHit
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                  : 'bg-red-950/80 border-red-800 text-red-200'
              }`}>
                <div className="flex justify-between items-center font-bold">
                  <span>{lastRollResult.isCritSuccess ? '🌟 CRITICAL HIT!' : lastRollResult.isHit ? '🎯 STRIKE HIT' : '❌ STRIKE MISSED'}</span>
                  <span>{lastRollResult.finalStrikeScore} vs DEF {lastRollResult.targetDefense}</span>
                </div>
                <div className="text-[9px] opacity-80 mt-0.5">
                  Rolls: [{lastRollResult.rolls.join(', ')}] {lastRollResult.totalStrikeMod >= 0 ? '+' : ''}{lastRollResult.totalStrikeMod} Mod • Net DMG: {lastRollResult.netDamage}
                </div>
              </div>
            )}
          </div>

          {/* Quick Consumables & Abilities */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1">
              <Zap size={12} />
              <span>Quick Consumables & Stims</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => handleUseConsumable('Med-Stim Alpha', 15)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-emerald-900/60 text-emerald-300 font-bold text-left cursor-pointer transition-all"
              >
                💉 Med-Stim (+15)
              </button>
              <button
                type="button"
                onClick={() => handleUseConsumable('Shield Recharger', 10)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-900/60 text-cyan-300 font-bold text-left cursor-pointer transition-all"
              >
                ⚡ Shield Cell (+10)
              </button>
              <button
                type="button"
                onClick={() => handleUseConsumable('Nanite Patch', 25)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-amber-900/60 text-amber-300 font-bold text-left cursor-pointer transition-all"
              >
                🧬 Nanite Patch (+25)
              </button>
              <button
                type="button"
                onClick={() => handleUseConsumable('Overclock Injector', 5)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-purple-900/60 text-purple-300 font-bold text-left cursor-pointer transition-all"
              >
                🔋 Overclock (+1 AP)
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OperativeCockpitRail;
