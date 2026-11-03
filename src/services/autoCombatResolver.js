/**
 * TANGENT SFF RP: Automated Combat Turn & Action Resolver
 * Canonical implementation strictly conforming to docs/game_rules/operator/3.00 COMBAT.md:
 * - 2d10 Attack Roll vs Target Defense (Opposed or Unopposed CR 15 base)
 * - Defender wins all ties!
 * - Critical Triumph (Double 10s): +10 added to rolled dice value (20 -> 30) & Doubles weapon damage dice
 * - Fumble (Double 1s): Rolled dice value becomes flat -10 (Base Score - 10)
 * - Damage = (Weapon Dice + Ability + Bonuses) - (Armor DR + Target STA Mod)
 * - Called Shot location saving throws (Head KO, Torso Winded, Arm Disarmed, Leg Hobbled)
 * - The Mortality State at 0 HP (Unconscious, Incapacitated, Bleeding Out, Stability = STA + 5)
 */

import { AudioService } from './audioService.js';

export function resolveAutonomousAttack(attackerToken, targetToken, actionPlan = {}) {
  // 1. Roll 2d10
  const d1 = Math.floor(Math.random() * 10) + 1;
  const d2 = Math.floor(Math.random() * 10) + 1;
  const isTriumph = d1 === 10 && d2 === 10;
  const isFumble = d1 === 1 && d2 === 1;

  const rawRoll = d1 + d2;
  // Per 3.00 COMBAT.md: Critical adds +10 to rolled dice value (20 -> 30). Fumble replaces rolled dice value with flat -10.
  let baseRoll = isTriumph ? (rawRoll + 10) : isFumble ? -10 : rawRoll;

  const attackBonus = parseInt(attackerToken.attackBonus || attackerToken.atkBonus || attackerToken.skillRank || 4, 10);
  const attributeMod = parseInt(attackerToken.attributeMod || attackerToken.abilityMod || 2, 10);
  const aimBonus = actionPlan.isAiming ? Math.min(6, (actionPlan.aimRounds || 1) * 2) : 0;
  const burstBonus = actionPlan.isBurst ? 1 : 0;
  const pointBlankBonus = actionPlan.isPointBlank ? 5 : 0;

  // Called Shot penalty per 3.00 COMBAT.md: Torso -1, Head -2, Arm -2, Leg -2
  let location = actionPlan.hitLocation || 'torso';
  let calledShotPenalty = 0;
  if (actionPlan.isCalledShot) {
    if (location === 'torso') calledShotPenalty = -1;
    else if (location === 'head' || location === 'arm' || location === 'leg') calledShotPenalty = -2;
  }

  const totalAttack = baseRoll + attackBonus + attributeMod + aimBonus + burstBonus + pointBlankBonus + calledShotPenalty;

  // 2. Compute Target Defense DC (CR 15 baseline for Medium at Short range)
  const targetBaseDef = parseInt(targetToken.defenseDc || targetToken.defense || 15, 10);
  const targetSize = parseInt(targetToken.sizeModifier || 0, 10); // Target size reduces DC if large, increases if small
  const coverBonus = targetToken.inCover ? (targetToken.coverType === 'full' ? 5 : 2) : 0;
  const evasionBonus = targetToken.isEvasive ? 2 : 0;
  const totalDefenseCr = Math.max(5, targetBaseDef - targetSize + coverBonus + evasionBonus);

  // CRITICAL CANONICAL RULE: "DEFENDER WINS ALL TIES"
  const isHit = totalAttack > totalDefenseCr && !isFumble;
  const margin = totalAttack - totalDefenseCr;

  // 3. Damage Calculation
  // Formula: (Weapon Dice + Ability Mod + Precision) - (Target Armor DR + Target STA Mod)
  let rawDamage = 0;
  let effectiveDamage = 0;
  let statusInflicted = null;
  let entersMortalityState = false;
  let isTargetDead = false;

  if (isHit) {
    let baseWpnDmg = parseInt(attackerToken.weaponDamage || 8, 10);
    // Point Blank advantage or standard roll
    let die1 = Math.floor(Math.random() * 8) + 1;
    let die2 = Math.floor(Math.random() * 8) + 1;
    let variableDmg = actionPlan.isPointBlank ? Math.max(die1, die2) : die1;

    // Natural 20 doubles weapon damage dice
    if (isTriumph) {
      baseWpnDmg *= 2;
      variableDmg *= 2;
    }

    const burstDmg = actionPlan.isBurst ? 3 : 0;
    const attackerAbilityDmg = parseInt(attackerToken.strMod || attackerToken.agiMod || 2, 10);
    rawDamage = baseWpnDmg + variableDmg + burstDmg + attackerAbilityDmg;

    // Armor DR & Target Stamina Natural DR Soak
    let targetDr = Array.isArray(targetToken.armorLayers) && targetToken.armorLayers.length > 0
      ? Math.max(0, ...targetToken.armorLayers)
      : parseInt(targetToken.armorDr || targetToken.dr || 2, 10);
    const dmgType = String(actionPlan.damageType || 'kinetic').toLowerCase();
    const bypassesAll = dmgType === 'bleed' || Boolean(actionPlan.isOverchannelBurn);
    if (bypassesAll || dmgType === 'sonic' || dmgType === 'spectral' || dmgType === 'phase' || dmgType === 'mental' || dmgType === 'psyche') {
      targetDr = 0;
    } else if (dmgType === 'force') {
      targetDr = Math.floor(targetDr / 2); // Force damage ignores 1/2 of Armor DR
    }
    const damageAfterDefenses = Math.max(0, rawDamage - targetDr);
    const targetStaDR = bypassesAll
      ? 0
      : parseInt(targetToken.stamina ?? targetToken.toughness ?? targetToken.staMod ?? targetToken.conMod ?? 1, 10);
    if (damageAfterDefenses > 0) {
      effectiveDamage = Math.max(0, damageAfterDefenses - Math.max(0, targetStaDR));
    } else {
      effectiveDamage = 0;
    }

    // Hit Location Saving Throw & Status Effect Evaluation
    if (effectiveDamage > 0) {
      if (location === 'head') {
        statusInflicted = 'KO (Reason Save or Stunned, fail by 10+ Unconscious)';
      } else if (location === 'torso') {
        statusInflicted = 'Winded (Fort Save or -2 actions for 1+ rounds)';
      } else if (location === 'arm') {
        statusInflicted = 'Disarmed (Ref Save or drop held item)';
      } else if (location === 'leg') {
        statusInflicted = 'Hobbled (Might Save or 1/2 speed for 1+ rounds)';
      }
    }
  }

  // 4. Update Target Vitals & Mortality State (Vitality-First Routing unless Critical Hit / Bleed)
  const hasVitalityPool = targetToken.vitality !== undefined && targetToken.vitality !== null;
  const targetVit = hasVitalityPool
    ? parseInt(targetToken.vitality?.current ?? targetToken.vitality ?? 0, 10)
    : 0;
  const targetHp = parseInt(targetToken.health?.current ?? targetToken.hp?.current ?? 20, 10);
  const targetMaxHp = parseInt(targetToken.health?.max ?? targetToken.hp?.max ?? 20, 10);
  const targetStaScore = parseInt(
    targetToken.staminaScore ?? targetToken.stamina ?? targetToken.constitution ?? targetToken.conScore ?? 0,
    10
  );
  const maxStabilityPoints = Math.max(1, targetStaScore + 5);

  let newVit = targetVit;
  let healthDamage = effectiveDamage;
  const bypassesVit = Boolean(isTriumph || String(actionPlan.damageType || '').toLowerCase() === 'bleed' || actionPlan.isOverchannelBurn);
  if (hasVitalityPool && !bypassesVit && effectiveDamage > 0) {
    if (effectiveDamage <= targetVit) {
      newVit = targetVit - effectiveDamage;
      healthDamage = 0;
    } else {
      newVit = 0;
      healthDamage = effectiveDamage - targetVit;
    }
  }

  let newHp = targetHp - healthDamage;
  let remainingStability = targetToken.stabilityPoints !== undefined ? targetToken.stabilityPoints : maxStabilityPoints;

  if (newHp <= 0) {
    entersMortalityState = true;
    const excessDmg = Math.abs(newHp);
    remainingStability = Math.max(0, remainingStability - excessDmg);
    if (remainingStability <= 0) {
      isTargetDead = true;
    }
    newHp = 0;
  }

  // Play audio cues
  if (isHit) {
    AudioService.playTerminalBeep(isTriumph ? 1350 : 880, 0.05);
  } else {
    AudioService.playTerminalBeep(450, 0.03);
  }

  let resultSummary = '';
  if (isHit) {
    resultSummary = `🎯 HIT! (${totalAttack} vs CR ${totalDefenseCr}) on ${location.toUpperCase()} for ${effectiveDamage} DMG [${targetHp} → ${newHp} HP]`;
    if (entersMortalityState) {
      resultSummary += isTargetDead ? ' 💀 TARGET KILLED!' : ` ⚠️ MORTALITY STATE! Bleeding Out [${remainingStability}/${maxStabilityPoints} Stability]`;
    } else if (statusInflicted) {
      resultSummary += ` • ${statusInflicted}`;
    }
  } else {
    resultSummary = `💨 MISS! (${totalAttack} vs CR ${totalDefenseCr} - Defender Wins)`;
  }

  return {
    attackerId: attackerToken.id || attackerToken.tokenId,
    attackerName: attackerToken.label || attackerToken.name || 'Adversary',
    targetId: targetToken.id || targetToken.tokenId,
    targetName: targetToken.label || targetToken.name || 'Operator',
    d1,
    d2,
    baseRoll,
    totalAttack,
    defenseDc: totalDefenseCr,
    isHit,
    isTriumph,
    isFumble,
    margin,
    location,
    rawDamage,
    effectiveDamage,
    statusInflicted,
    targetPreviousVitality: targetVit,
    targetNewVitality: newVit,
    targetPreviousHp: targetHp,
    targetNewHp: newHp,
    targetMaxHp,
    entersMortalityState,
    remainingStability,
    maxStabilityPoints,
    isTargetDowned: newHp <= 0,
    isTargetDead,
    resultSummary,
    timestamp: new Date().toISOString()
  };
}

export default {
  resolveAutonomousAttack
};

