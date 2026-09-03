import React, { useState, useEffect, useMemo } from 'react';
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
  Dices,
  Layers,
  Flame,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
  X,
  Target,
  Send,
  Cpu,
  ShieldAlert,
  BatteryCharging
} from 'lucide-react';
import { rollDice } from '../../../../services/diceService';
import { AudioService } from '../../../../services/audioService';
import { SessionJournal } from '../../../../services/sessionRecapService';

/**
 * Standard Tangent Hit Locations with canonical d100 range and damage multipliers
 */
export const HIT_LOCATIONS = [
  { id: 'head', label: 'Head', range: [1, 10], multiplier: 1.0, penalty: -2, savingThrow: 'Reason or KO/Stunned (fail by 10+ Unconscious)', desc: 'Cranium & Sensory (-2 Called Shot)' },
  { id: 'left_arm', label: 'Left Arm', range: [11, 20], multiplier: 1.0, penalty: -2, savingThrow: 'Reflex or Disarmed (fail by 10+ Crippled)', desc: 'Secondary weapon / shield mount (-2 Called Shot)' },
  { id: 'right_arm', label: 'Right Arm', range: [21, 30], multiplier: 1.0, penalty: -2, savingThrow: 'Reflex or Disarmed (fail by 10+ Crippled)', desc: 'Primary weapon arm (-2 Called Shot)' },
  { id: 'torso', label: 'Torso', range: [31, 70], multiplier: 1.0, penalty: -1, savingThrow: 'Fortitude or Winded -2 actions (fail by 10+ Incapacitated)', desc: 'Center of mass (-1 Called Shot)' },
  { id: 'left_leg', label: 'Left Leg', range: [71, 85], multiplier: 1.0, penalty: -2, savingThrow: 'Might or Hobbled 1/2 speed (fail by 10+ Crippled)', desc: 'Locomotion / stance anchor (-2 Called Shot)' },
  { id: 'right_leg', label: 'Right Leg', range: [86, 100], multiplier: 1.0, penalty: -2, savingThrow: 'Might or Hobbled 1/2 speed (fail by 10+ Crippled)', desc: 'Locomotion / stance anchor (-2 Called Shot)' }
];

export const WEAPON_PRESETS = [
  { id: 'slug_pistol', name: 'Heavy Slug Pistol', type: 'ranged', damageClass: 'lethal', skill: 'Marksmanship', dice: '2d6+2', ap: 0, range: '20m', desc: 'Kinetic penetrating ballistic trauma (Lethal Health / Structure)' },
  { id: 'plasma_rifle', name: 'Plasma Carbine', type: 'ranged', damageClass: 'lethal', skill: 'Marksmanship', dice: '2d8+4', ap: 2, range: '50m', desc: 'Superheated thermal burns (Lethal Health / Structure)' },
  { id: 'vibro_blade', name: 'Mono-Molecular Vibroblade', type: 'melee', damageClass: 'lethal', skill: 'Weaponry', dice: '1d10+3', ap: 3, range: 'Melee', desc: 'High-frequency flesh cuts & armor slicing (Lethal Health / Structure)' },
  { id: 'heavy_railgun', name: 'Mag-Rail Cannon', type: 'heavy', damageClass: 'lethal', skill: 'Heavy Weapons', dice: '3d10+6', ap: 5, range: '120m', desc: 'Hyper-velocity solid sabot trauma (Lethal Health / Structure)' },
  { id: 'stun_baton', name: 'Shock / Stun Baton', type: 'melee', damageClass: 'non_lethal', skill: 'Weaponry', dice: '1d8+2', ap: 0, range: 'Melee', desc: 'Neural shock & subdual fatigue (Non-Lethal Vitality; Synthetics Immune)' },
  { id: 'unarmed_subdual', name: 'Unarmed Brawling Strike', type: 'melee', damageClass: 'non_lethal', skill: 'Unarmed Combat', dice: '1d6+2', ap: 0, range: 'Melee', desc: 'Subdual bruising & fatigue (Non-Lethal Vitality; Synthetics Immune)' },
  { id: 'psionic_blast', name: 'Void / Kinetic Invocation', type: 'psi', damageClass: 'lethal', skill: 'Dimension / Attune', dice: '2d10+4', ap: 4, range: '30m', desc: 'Direct cellular & structural rupture (Lethal Health / Structure)' }
];

export default function CombatResolutionModal({
  isOpen,
  onClose,
  tokens = [],
  activeTokenId = null,
  personaRoster = [],
  characterData = null,
  onApplyDamage,
  onUpdateToken,
  onTriggerFloatingText,
  onBroadcastResult,
  scale = 1,
  position = { x: 0, y: 0 }
}) {
  if (!isOpen) return null;

  // 1. Attacker & Defender State
  const [attackerId, setAttackerId] = useState(activeTokenId || (tokens[0]?.id ?? ''));
  const [targetId, setTargetId] = useState(
    tokens.find(t => t.id !== (activeTokenId || tokens[0]?.id))?.id || (tokens[1]?.id ?? '')
  );

  // 2. Weapon & Attack Config
  const [selectedPresetId, setSelectedPresetId] = useState(WEAPON_PRESETS[0].id);
  const [customWeaponName, setCustomWeaponName] = useState(WEAPON_PRESETS[0].name);
  const [damageClass, setDamageClass] = useState(WEAPON_PRESETS[0].damageClass); // 'lethal' | 'non_lethal'
  const [attackDiceExpression, setAttackDiceExpression] = useState(WEAPON_PRESETS[0].dice);
  const [attackSkillMod, setAttackSkillMod] = useState(3);
  const [attackAttributeMod, setAttackAttributeMod] = useState(2);
  const [situationalMod, setSituationalMod] = useState(0); // Cover / Range / Stance
  const [advantageMode, setAdvantageMode] = useState('normal'); // 'normal' | 'advantage' | 'disadvantage'
  const [isAiming, setIsAiming] = useState(false); // +2 Aim bonus
  const [isPointBlank, setIsPointBlank] = useState(false); // +2 Point-blank bonus

  // 3. Defense & Target Modifiers
  const [targetCover, setTargetCover] = useState(0); // 0 = None, 2 = Half, 4 = Full
  const [targetStance, setTargetStance] = useState(0); // 0 = Normal, 2 = Evading, -2 = Prone (melee)

  // 4. Hit Location & Penetration
  const [locationMode, setLocationMode] = useState('random'); // 'random' | 'targeted'
  const [selectedLocationId, setSelectedLocationId] = useState('torso');
  const [armorPiercing, setArmorPiercing] = useState(WEAPON_PRESETS[0].ap || 0);

  // 5. Resolution Roll Results
  const [attackRollResult, setAttackRollResult] = useState(null);
  const [locationRollResult, setLocationRollResult] = useState(null);
  const [damageRollResult, setDamageRollResult] = useState(null);
  const [computedOutcome, setComputedOutcome] = useState(null);
  const [hasResolved, setHasResolved] = useState(false);

  // Find actual token objects
  const attackerToken = useMemo(() => tokens.find(t => t.id === attackerId), [tokens, attackerId]);
  const targetToken = useMemo(() => tokens.find(t => t.id === targetId), [tokens, targetId]);

  // Derive linked hero if available
  const attackerHero = useMemo(() => {
    if (!attackerToken?.linkedHeroId) return null;
    return (personaRoster || []).find(c => (c['character-doc-id'] || c.id) === attackerToken.linkedHeroId) ||
           ((characterData?.['character-doc-id'] || characterData?.id) === attackerToken.linkedHeroId ? characterData : null);
  }, [attackerToken, personaRoster, characterData]);

  const targetHero = useMemo(() => {
    if (!targetToken?.linkedHeroId) return null;
    return (personaRoster || []).find(c => (c['character-doc-id'] || c.id) === targetToken.linkedHeroId) ||
           ((characterData?.['character-doc-id'] || characterData?.id) === targetToken.linkedHeroId ? characterData : null);
  }, [targetToken, personaRoster, characterData]);

  const isTargetSynthetic = Boolean(targetToken?.isSynthetic || targetToken?.structure || targetHero?.isSynthetic || targetHero?.structure);

  // Synchronize target token stats (Toughness, Defense DC, DR)
  const targetToughness = targetToken?.stamina || targetToken?.toughness || targetHero?.stats?.sta || 2;
  const targetBaseDefDC = targetToken?.defenseDc || targetHero?.vitals?.defense || 15; // Canonical CR 15 average baseline
  const effectiveDefenseDC = Math.max(5, targetBaseDefDC + targetCover + targetStance);

  // Sync weapon preset selection
  const handleSelectPreset = (presetId) => {
    const preset = WEAPON_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setCustomWeaponName(preset.name);
    setDamageClass(preset.damageClass || 'lethal');
    setAttackDiceExpression(preset.dice);
    setArmorPiercing(preset.ap);
  };

  // Roll and Execute Combat Resolution
  const handleExecuteResolution = () => {
    AudioService.playDiceRollSound();

    // 1. Attack Roll on 2d10 (Point Blank grants +5 Strike per 3.00 COMBAT.md)
    const totalAttackMod = attackSkillMod + attackAttributeMod + situationalMod + (isAiming ? 2 : 0) + (isPointBlank ? 5 : 0) + (locationMode === 'targeted' ? (HIT_LOCATIONS.find(l => l.id === selectedLocationId)?.penalty || 0) : 0);
    const attackRoll = rollDice(`2d10+${totalAttackMod}`, {
      advantage: advantageMode === 'advantage',
      disadvantage: advantageMode === 'disadvantage',
      targetNumber: effectiveDefenseDC
    });

    // 2. Hit Location Determination
    let finalLocation;
    let locRollNum = Math.floor(Math.random() * 100) + 1;
    if (locationMode === 'targeted') {
      finalLocation = HIT_LOCATIONS.find(l => l.id === selectedLocationId) || HIT_LOCATIONS[3];
    } else {
      finalLocation = HIT_LOCATIONS.find(l => locRollNum >= l.range[0] && locRollNum <= l.range[1]) || HIT_LOCATIONS[3];
    }

    // 3. Margin of Success (MoS) & Hit Evaluation (Defender wins all ties per 3.00 COMBAT.md)
    const margin = attackRoll.total - effectiveDefenseDC;
    const isDoubleTens = attackRoll.isCritSuccess;
    const isDoubleOnes = attackRoll.isCritFail;
    const isCritHit = isDoubleTens || margin >= 10;
    const isHit = !isDoubleOnes && margin > 0; // Defender wins all ties!

    // 4. Damage Roll & Armor Penetration
    let rawDamage = 0;
    let dmgRollObj = null;
    let netDamage = 0;
    let soakedByArmor = 0;
    let soakedByToughness = 0;
    let vitalityDamage = 0;
    let healthDamage = 0;
    let structureDamage = 0;
    let isSyntheticImmune = false;
    let triggersMassiveDamage = false;
    let triggersDeathClock = false;

    if (isHit) {
      // Point Blank rolls damage with Advantage for ballistic & energy weapons per 3.00 COMBAT.md
      dmgRollObj = rollDice(attackDiceExpression, { advantage: isPointBlank });
      const critMultiplier = isDoubleTens ? 2.0 : 1.0; // Natural 20 doubles weapon damage dice
      rawDamage = Math.max(1, Math.round(dmgRollObj.total * critMultiplier * finalLocation.multiplier));

      // Calculate Target Armor DR at this location
      const baseLocationDR = targetToken?.dr || targetHero?.armorDR?.[finalLocation.id] || targetHero?.armorDR?.torso || 2;
      const effectiveDR = Math.max(0, baseLocationDR - armorPiercing);
      soakedByArmor = Math.min(rawDamage, effectiveDR);

      // Remaining damage after armor
      const damageAfterArmor = Math.max(0, rawDamage - soakedByArmor);
      soakedByToughness = Math.min(damageAfterArmor, targetToughness);
      netDamage = Math.max(0, damageAfterArmor - soakedByToughness);

      // Canonical Damage Routing Rules:
      // - LETHAL DAMAGE: Cuts, burns, high trauma -> Damages HEALTH directly (or STRUCTURE for Synthetics)
      // - NON-LETHAL DAMAGE: Environmental stress, fatigue, subdual -> Damages VITALITY directly.
      // - SYNTHETICS: Complete immunity to non-lethal damage!
      // - VITALITY SPILLOVER: If Non-Lethal damage exceeds remaining Vitality, excess spills into Health (incapacitation).
      const currentVitality = targetToken?.vitality?.current !== undefined ? targetToken.vitality.current : 30;
      const currentHealth = targetToken?.health?.current !== undefined ? targetToken.health.current : (targetToken?.hp?.current ?? 30);
      const currentStructure = targetToken?.structure?.current !== undefined ? targetToken.structure.current : 60;

      if (isTargetSynthetic) {
        if (damageClass === 'non_lethal') {
          // Synthetic immunity to non-lethal fatigue & stress!
          isSyntheticImmune = true;
          structureDamage = 0;
        } else {
          // Lethal damage damages Structure directly
          structureDamage = netDamage;
        }
      } else {
        // Organic / Standard Operative
        if (damageClass === 'lethal') {
          // Lethal damage (cuts, burns, gunshots) damages HEALTH directly!
          healthDamage = netDamage;
          vitalityDamage = 0;
        } else {
          // Non-Lethal damage (fatigue, subdual, stress) damages VITALITY directly!
          if (netDamage <= currentVitality) {
            vitalityDamage = netDamage;
            healthDamage = 0;
          } else {
            // Non-lethal exhaustion spillover into Health
            vitalityDamage = currentVitality;
            healthDamage = netDamage - currentVitality;
          }
        }
      }

      // Check Massive Damage Rule: Single hit of lethal damage to Health >= Stamina
      if (healthDamage >= targetToughness && healthDamage > 0) {
        triggersMassiveDamage = true;
      }

      // Check Death Clock Trigger: Health reduced to 0 or below from lethal damage
      if ((currentHealth - healthDamage) <= 0 && healthDamage > 0) {
        triggersDeathClock = true;
      }
    }

    setAttackRollResult(attackRoll);
    setLocationRollResult({ roll: locRollNum, location: finalLocation });
    setDamageRollResult(dmgRollObj);
    setComputedOutcome({
      isHit,
      isCritHit,
      isDoubleTens,
      isDoubleOnes,
      margin,
      effectiveDefenseDC,
      finalLocation,
      damageClass,
      rawDamage,
      soakedByArmor,
      soakedByToughness,
      netDamage,
      vitalityDamage,
      healthDamage,
      structureDamage,
      isSyntheticImmune,
      triggersMassiveDamage,
      triggersDeathClock
    });
    setHasResolved(true);

    // Play tactile sound cue
    if (isDoubleTens || isCritHit) {
      AudioService.playCriticalChime(true);
    } else if (isDoubleOnes) {
      AudioService.playCriticalChime(false);
    } else if (isHit) {
      AudioService.playCombatHit(healthDamage > 0 || structureDamage > 0);
    } else {
      AudioService.playTerminalBeep(350, 0.08); // Miss sound
    }
  };

  // Commit results directly to the battlemap canvas and character sheets
  const handleApplyToCanvas = () => {
    if (!computedOutcome || !targetToken) return;

    const {
      isHit,
      finalLocation,
      damageClass,
      netDamage,
      vitalityDamage,
      healthDamage,
      structureDamage,
      isSyntheticImmune,
      triggersMassiveDamage,
      triggersDeathClock,
      isCritHit
    } = computedOutcome;

    if (!isHit) {
      if (onTriggerFloatingText) {
        const screenX = (targetToken.x || 0) * scale + position.x;
        const screenY = (targetToken.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `🛡️ DEFLECTED / MISS (DC ${effectiveDefenseDC})`, 'miss');
      }
      onClose();
      return;
    }

    if (isSyntheticImmune) {
      if (onTriggerFloatingText) {
        const screenX = (targetToken.x || 0) * scale + position.x;
        const screenY = (targetToken.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `🤖 SYNTHETIC IMMUNE (NON-LETHAL)`, 'miss');
      }
      onClose();
      return;
    }

    // Apply Health & Vitality deductions
    if (structureDamage > 0 && onApplyDamage) {
      onApplyDamage(targetToken.id, { structureDamage, location: finalLocation.label });
    } else if (onApplyDamage) {
      onApplyDamage(targetToken.id, {
        vitalityDamage,
        healthDamage,
        damageClass,
        location: finalLocation.label,
        triggersMassiveDamage,
        triggersDeathClock
      });
    }

    // Trigger on-screen floating battle text
    if (onTriggerFloatingText) {
      const screenX = (targetToken.x || 0) * scale + position.x;
      const screenY = (targetToken.y || 0) * scale + position.y;
      const tag = isCritHit ? '💥 CRIT HIT' : '🎯 HIT';
      const detail = structureDamage > 0
        ? `-${structureDamage} SP [${finalLocation.label}]`
        : damageClass === 'lethal'
        ? `-${healthDamage} LETHAL HP [${finalLocation.label}]`
        : healthDamage > 0
        ? `-${vitalityDamage} VIT, -${healthDamage} HP [${finalLocation.label}]`
        : `-${vitalityDamage} NON-LETHAL VIT [${finalLocation.label}]`;

      onTriggerFloatingText(screenX, screenY, `${tag}: ${detail}`, damageClass === 'lethal' ? 'damage' : 'vitality_damage');
    }

    // Deduct 1 ammo round and mark Standard Action spent on attacker if present
    if (attackerToken && onUpdateToken) {
      const curActions = attackerToken.actions || { standard: true, move: true, reaction: true };
      const nextActions = { ...curActions, standard: false };
      const curAmmo = attackerToken.ammo || { current: 12, max: 12, magazines: 3 };
      const nextAmmo = { ...curAmmo, current: Math.max(0, curAmmo.current - 1) };
      onUpdateToken(attackerToken.id, { actions: nextActions, ammo: nextAmmo });
    }

    // Log event in SessionJournal for automated session debrief recap
    SessionJournal.logEvent({
      type: isCritHit ? 'crit' : 'strike',
      actor: attackerToken?.label || 'Attacker',
      target: targetToken?.label || 'Target',
      details: `Struck ${finalLocation.label} for ${netDamage} Net Damage (${damageClass === 'lethal' ? 'Lethal Trauma' : 'Non-Lethal Fatigue'})`,
      isCrit: isCritHit
    });

    // Optional Broadcast to CommLink Chat
    if (onBroadcastResult) {
      const typeLabel = damageClass === 'lethal' ? 'Lethal Trauma (Health/Structure)' : 'Non-Lethal Fatigue (Vitality)';
      const summaryText = `⚔️ **[COMBAT ADJUDICATION]** ${attackerToken?.label || 'Attacker'} struck ${targetToken?.label || 'Target'} on the **${finalLocation.label}** with ${typeLabel} (${computedOutcome.rawDamage} Raw Dmg - ${computedOutcome.soakedByArmor} DR - ${computedOutcome.soakedByToughness} Soak = **${netDamage} Net Dmg** applied).`;
      onBroadcastResult(summaryText);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] bg-[#0f141c] border-2 border-amber-500/80 rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.35)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-b border-amber-500/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase text-amber-300 flex items-center gap-2">
                Combat Strike &amp; Tactical Resolution Pipeline
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v2.6 CANONICAL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Lethal Health Trauma (Cuts/Burns) vs. Non-Lethal Vitality Stress (Fatigue) · Synthetic Structure Integrity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            title="Close Combat Resolver"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Left Column (5 Cols): Combatants & Weapon Setup */}
          <div className="md:col-span-5 flex flex-col gap-4">
            
            {/* Attacker & Target Selectors */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Swords className="w-4 h-4" /> 1. Combatant Assignment
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Attacker */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Attacking Unit</label>
                  <select
                    value={attackerId}
                    onChange={(e) => setAttackerId(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-200 focus:border-cyan-400 outline-none font-medium"
                  >
                    {tokens.map(t => (
                      <option key={t.id} value={t.id}>{t.label || 'Unit'} {t.initiative ? `(#${t.initiative})` : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Target */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Defender</label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-rose-200 focus:border-rose-400 outline-none font-medium"
                  >
                    {tokens.map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === attackerId}>
                        {t.label || 'Unit'} {t.initiative ? `(#${t.initiative})` : ''} {t.isSynthetic ? '(Synthetic)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Status Preview with Synthetic Detection */}
              {targetToken && (
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col gap-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold">Def DC: {effectiveDefenseDC}</span>
                    <span className="text-amber-400">STA Soak: {targetToughness}</span>
                    {isTargetSynthetic ? (
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> SYNTHETIC
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-bold">
                        ORGANIC
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    {isTargetSynthetic ? (
                      <span className="text-amber-300 font-bold">Structure: {targetToken?.structure?.current ?? 60}/{targetToken?.structure?.max ?? 60} SP</span>
                    ) : (
                      <>
                        <span className="text-cyan-300" title="Non-Lethal Stress & Fatigue Capacity">
                          🔵 Vitality (Non-Lethal): {targetToken?.vitality?.current ?? 30}
                        </span>
                        <span className="text-emerald-300" title="Lethal Cuts, Burns, Trauma Capacity">
                          🔴 Health (Lethal): {targetToken?.health?.current ?? (targetToken?.hp?.current ?? 30)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Weapon & Modifiers Configuration */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> 2. Weaponry &amp; Damage Classification
              </span>

              {/* Damage Classification Switch */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400">Damage Classification</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDamageClass('lethal')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      damageClass === 'lethal'
                        ? 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>🔴 LETHAL (Health/SP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDamageClass('non_lethal')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      damageClass === 'non_lethal'
                        ? 'bg-cyan-950/90 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>🔵 NON-LETHAL (Vitality)</span>
                  </button>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">
                  {damageClass === 'lethal'
                    ? '• Lethal cuts, burns & gunshots deplete Health directly (or Structure for Synthetics).'
                    : '• Non-Lethal fatigue, subdual & stress deplete Vitality. Synthetics are IMMUNE.'}
                </span>
              </div>

              {/* Weapon Presets */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Preset Armaments</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {WEAPON_PRESETS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`px-2 py-1.5 rounded text-left text-[11px] transition-all border cursor-pointer flex flex-col ${
                        selectedPresetId === p.id
                          ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold truncate">{p.name}</span>
                      <span className="text-[9px] font-mono text-slate-400">{p.dice} · AP {p.ap} · {p.damageClass === 'lethal' ? '🔴 Lethal' : '🔵 Non-Lethal'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Damage & AP Expression */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Damage Formula</label>
                  <input
                    type="text"
                    value={attackDiceExpression}
                    onChange={(e) => setAttackDiceExpression(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-300 focus:border-amber-400 outline-none"
                    placeholder="e.g. 2d8+4"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Armor Pierce (AP)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={armorPiercing}
                    onChange={(e) => setArmorPiercing(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              {/* Attack Skill & Attribute Modifiers */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Skill Rank Mod</label>
                  <input
                    type="number"
                    value={attackSkillMod}
                    onChange={(e) => setAttackSkillMod(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Attribute Mod</label>
                  <input
                    type="number"
                    value={attackAttributeMod}
                    onChange={(e) => setAttackAttributeMod(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  />
                </div>
              </div>

              {/* Karma & Tactical Toggles */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAdvantageMode(prev => prev === 'advantage' ? 'normal' : 'advantage')}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    advantageMode === 'advantage'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🎲 Advantage ("I Got This")
                </button>
                <button
                  type="button"
                  onClick={() => setAdvantageMode(prev => prev === 'disadvantage' ? 'normal' : 'disadvantage')}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    advantageMode === 'disadvantage'
                      ? 'bg-rose-950 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🎲 Disadvantage
                </button>
                <button
                  type="button"
                  onClick={() => setIsAiming(prev => !prev)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    isAiming ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🎯 Aim Action (+2)
                </button>
                <button
                  type="button"
                  onClick={() => setIsPointBlank(prev => !prev)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    isPointBlank ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  💥 Point Blank (+2)
                </button>
              </div>
            </div>

            {/* Target Cover & Stance */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" /> Target Cover &amp; Stance
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Cover Modifier</label>
                  <select
                    value={targetCover}
                    onChange={(e) => setTargetCover(parseInt(e.target.value, 10))}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    <option value={0}>None (+0 DC)</option>
                    <option value={2}>Half Cover (+2 DC)</option>
                    <option value={4}>Full Cover (+4 DC)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Evasive Stance</label>
                  <select
                    value={targetStance}
                    onChange={(e) => setTargetStance(parseInt(e.target.value, 10))}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    <option value={0}>Standard (+0 DC)</option>
                    <option value={2}>Active Evasion (+2 DC)</option>
                    <option value={-2}>Prone / Surprised (-2 DC)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (7 Cols): Hit Location, Resolution & Math Breakdown */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* Hit Location Selector */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> 3. Hit Location &amp; Armor Coverage
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLocationMode('random')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                      locationMode === 'random'
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Random d100
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('targeted')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                      locationMode === 'targeted'
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Targeted Shot
                  </button>
                </div>
              </div>

              {locationMode === 'targeted' ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {HIT_LOCATIONS.map(loc => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setSelectedLocationId(loc.id)}
                      className={`p-2 rounded text-left text-[11px] border transition-all cursor-pointer flex flex-col ${
                        selectedLocationId === loc.id
                          ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span>{loc.label}</span>
                        <span className="text-[9px] font-mono text-rose-400">{loc.penalty !== 0 ? `${loc.penalty}` : '+0'}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">{loc.desc}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Random Location: Determined via d100 roll upon strike</span>
                  <span className="text-cyan-400">Head (10%), Torso (40%), Limbs (50%)</span>
                </div>
              )}
            </div>

            {/* Main Action: Execute Resolution Button */}
            <button
              type="button"
              onClick={handleExecuteResolution}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Dices className="w-5 h-5" /> Execute Attack &amp; Adjudicate Strike (2d10 vs DC {effectiveDefenseDC})
            </button>

            {/* Resolution Results Panel */}
            {hasResolved && computedOutcome && (
              <div className="p-4 rounded-xl bg-slate-950 border-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Result Title & Verdict */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    {computedOutcome.isHit ? (
                      computedOutcome.isCritHit ? (
                        <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs uppercase flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" /> CRITICAL TRIUMPH (MoS +{computedOutcome.margin})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs uppercase flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOLID STRIKE (MoS +{computedOutcome.margin})
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black text-xs uppercase flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-400" /> MISSED / DEFLECTED ({attackRollResult.total} vs DC {effectiveDefenseDC})
                      </span>
                    )}

                    {computedOutcome.isDoubleTens && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold border border-amber-500/50">
                        NATURAL 10-10 (+30)
                      </span>
                    )}
                    {computedOutcome.isDoubleOnes && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 font-bold border border-rose-500/50">
                        FUMBLE 1-1 (-10)
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                    <span>Location: <strong className="text-indigo-300 uppercase">{computedOutcome.finalLocation.label}</strong></span>
                    <span className="text-slate-600">|</span>
                    <span className={computedOutcome.damageClass === 'lethal' ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'}>
                      {computedOutcome.damageClass === 'lethal' ? '🔴 Lethal' : '🔵 Non-Lethal'}
                    </span>
                  </div>
                </div>

                {/* Dice Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">2d10 Attack Roll</span>
                    <span className="text-amber-300 font-bold text-sm">
                      {attackRollResult.rolls.map(r => `[${r.value}]`).join(' ')} + {attackRollResult.modifier} = {attackRollResult.total}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Target Defense DC</span>
                    <span className="text-cyan-300 font-bold text-sm">DC {effectiveDefenseDC}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Raw Weapon Dmg</span>
                    <span className="text-rose-300 font-bold text-sm">{computedOutcome.rawDamage} Dmg</span>
                  </div>
                </div>

                {/* Synthetic Immunity Banner */}
                {computedOutcome.isSyntheticImmune && (
                  <div className="p-3 rounded-lg bg-amber-950/80 border border-amber-500 text-amber-200 text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>🤖 SYNTHETIC IMMUNITY: Target chassis has no biological nervous system. Non-lethal fatigue &amp; stress damage has ZERO effect!</span>
                  </div>
                )}

                {/* Damage Pipeline Ledger */}
                {computedOutcome.isHit && !computedOutcome.isSyntheticImmune && (
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-2 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Raw Damage Applied:</span>
                      <strong className="text-rose-400">{computedOutcome.rawDamage}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>- Location Armor DR Soak:</span>
                      <span className="text-amber-400">-{computedOutcome.soakedByArmor} DR</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>- Base Toughness (STA) Soak:</span>
                      <span className="text-amber-400">-{computedOutcome.soakedByToughness} STA</span>
                    </div>
                    <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center font-bold text-sm">
                      <span className="text-slate-200">Net Applied Damage:</span>
                      <span className="text-emerald-400 text-base">{computedOutcome.netDamage} Damage</span>
                    </div>

                    {/* Pool Deductions */}
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-sans">
                      {isTargetSynthetic ? (
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-300">Structure Integrity: <strong>-{computedOutcome.structureDamage} SP</strong></span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-cyan-300">Vitality (Non-Lethal): <strong>-{computedOutcome.vitalityDamage}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-rose-300">Health (Lethal Cuts/Burns): <strong>-{computedOutcome.healthDamage}</strong></span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Threshold Alerts */}
                {computedOutcome.triggersMassiveDamage && (
                  <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>⚠️ MASSIVE DAMAGE TRIGGERED: Direct lethal Health damage $\ge$ STA. Target must pass DC 15 Fortitude Save or die instantly!</span>
                  </div>
                )}
                {computedOutcome.triggersDeathClock && (
                  <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-500 text-amber-200 text-xs font-bold flex items-center gap-2">
                    <Skull className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>💀 ENTERED DEATH'S DOOR: Health reduced to 0 by lethal damage. Unconscious, prone, and initiates {targetToughness}-round Death Clock!</span>
                  </div>
                )}

                {/* Commit Button */}
                <button
                  type="button"
                  onClick={handleApplyToCanvas}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Apply Changes to Target &amp; Battlemap Canvas
                </button>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
