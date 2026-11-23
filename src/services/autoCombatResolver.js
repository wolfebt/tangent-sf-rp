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
import {
  resolveTangent2d10Check,
  calculateDamageMitigation,
  routePoolDamage
} from '../engine/rules/CanonicalCombatMath.ts';

export function resolveAutonomousAttack(attackerToken, targetToken, actionPlan = {}) {
  const numOr = (val, fallback) => {
    const parsed = parseInt(val, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const attackBonus = numOr(attackerToken.attackBonus ?? attackerToken.atkBonus ?? attackerToken.skillRank, 4);
  const attributeMod = numOr(attackerToken.attributeMod ?? attackerToken.abilityMod, 2);
  const aimBonus = actionPlan.isAiming ? Math.min(6, (actionPlan.aimRounds ?? 1) * 2) : 0;
  const burstBonus = actionPlan.isBurst ? 1 : 0;
  const pointBlankBonus = actionPlan.isPointBlank ? 5 : 0;

  // Called Shot penalty per 3.00 COMBAT.md: Torso -1, Head -2, Arm -2, Leg -2
  const location = actionPlan.hitLocation || actionPlan.targetLocation || 'torso';
  let calledShotPenalty = 0;
  if (actionPlan.isCalledShot) {
    if (location === 'torso') calledShotPenalty = -1;
    else if (location === 'head' || location === 'arm' || location === 'leg') calledShotPenalty = -2;
  }

  // 2. Compute Target Defense CR (CR 15 baseline for Medium at Short range)
  const targetBaseDef = numOr(targetToken.defenseDc ?? targetToken.defense, 15);
  const targetSize = numOr(targetToken.sizeModifier, 0);
  const coverBonus = targetToken.inCover ? (targetToken.coverType === 'full' ? 5 : 2) : 0;
  const evasionBonus = targetToken.isEvasive ? 2 : 0;
  const totalDefenseCr = Math.max(5, targetBaseDef - targetSize + coverBonus + evasionBonus);

  // 1. Canonical 2d10 Attack Roll (Defender Wins All Ties)
  const attackModifier = attackBonus + attributeMod + aimBonus + burstBonus + pointBlankBonus + calledShotPenalty;
  const check = resolveTangent2d10Check({
    diceOverride: actionPlan.diceOverride,
    modifier: attackModifier,
    targetCR: totalDefenseCr,
    isOpposed: true
  });

  const d1 = check.d1;
  const d2 = check.d2;
  const baseRoll = check.effectiveDiceSum;
  const isTriumph = check.isCrit;
  const isFumble = check.isFumble;
  const totalAttack = check.total;
  const isHit = check.isSuccess;
  const margin = check.margin;

  // 3. Damage Calculation
  let rawDamage = 0;
  let effectiveDamage = 0;
  let statusInflicted = null;
  let entersMortalityState = false;
  let isTargetDead = false;

  if (isHit) {
    let baseWpnDmg = numOr(attackerToken.weaponDamage, 8);
    const die1 = Math.floor(Math.random() * 8) + 1;
    const die2 = Math.floor(Math.random() * 8) + 1;
    let variableDmg = actionPlan.isPointBlank ? Math.max(die1, die2) : die1;

    // Natural 20 doubles weapon damage dice
    if (isTriumph) {
      baseWpnDmg *= 2;
      variableDmg *= 2;
    }

    const burstDmg = actionPlan.isBurst ? 3 : 0;
    const attackerAbilityDmg = numOr(attackerToken.strMod ?? attackerToken.agiMod, 2);
    rawDamage = baseWpnDmg + variableDmg + burstDmg + attackerAbilityDmg;

    const armorLayers = Array.isArray(targetToken.armorLayers) && targetToken.armorLayers.length > 0
      ? targetToken.armorLayers
      : [numOr(targetToken.armorDr ?? targetToken.dr, 2)];
    const penetration = numOr(actionPlan.penetration ?? attackerToken.penetration ?? actionPlan.armorPenetration, 0);
    const targetStaDR = numOr(targetToken.stamina ?? targetToken.toughness ?? targetToken.staMod ?? targetToken.conMod, 1);

    const mitigation = calculateDamageMitigation({
      rawDamage,
      armorLayers,
      penetration,
      damageType: actionPlan.damageType || 'kinetic',
      isOverchannelBurn: Boolean(actionPlan.isOverchannelBurn),
      staminaToughness: targetStaDR
    });
    effectiveDamage = mitigation.netDamage;

    // Called Shot / Critical Trauma Status (do not inflict on standard uncalled hits)
    if (effectiveDamage > 0 && (actionPlan.isCalledShot || isTriumph || Boolean(actionPlan.hitLocation || actionPlan.targetLocation))) {
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

  // 4. Update Target Vitals & Mortality State (Synthetic or Vitality-First Routing unless Crit / Bleed)
  const isSynthetic = Boolean(targetToken.isSynthetic || targetToken.is_synthetic || targetToken.structure !== undefined);
  const hasVitalityPool = targetToken.vitality !== undefined && targetToken.vitality !== null;
  const targetVit = hasVitalityPool
    ? numOr(targetToken.vitality?.current ?? targetToken.vitality, 0)
    : 0;
  const targetHp = numOr(targetToken.health?.current ?? targetToken.hp?.current ?? targetToken.health ?? targetToken.hp, 20);
  const targetMaxHp = numOr(targetToken.health?.max ?? targetToken.hp?.max ?? targetToken.maxHp, 20);
  const targetStruct = numOr(targetToken.structure?.current ?? targetToken.structure, targetHp);
  const targetStaScore = numOr(
    targetToken.staminaScore ?? targetToken.stamina ?? targetToken.constitution ?? targetToken.conScore,
    0
  );

  const routing = routePoolDamage({
    netDamage: effectiveDamage,
    isSynthetic,
    isLethal: actionPlan.isLethal !== false,
    isCritical: isTriumph,
    damageType: actionPlan.damageType || 'kinetic',
    isOverchannelBurn: Boolean(actionPlan.isOverchannelBurn),
    attemptedReduction: actionPlan.attemptedReduction !== false,
    hasVitalityPool,
    currentVitality: targetVit,
    currentHealth: targetHp,
    currentStructure: targetStruct,
    staminaScore: targetStaScore,
    currentStabilityPoints: targetToken.stabilityPoints
  });

  const newVit = routing.remainingVitality;
  const newHp = routing.remainingHealth;
  const remainingStability = routing.stabilityPointsRemaining;
  const maxStabilityPoints = routing.maxStabilityPoints;
  entersMortalityState = routing.entersMortalityState;
  isTargetDead = routing.isDead;

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

