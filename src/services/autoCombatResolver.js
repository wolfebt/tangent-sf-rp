/**
 * TANGENT SFF RP: Automated Combat Turn & Action Resolver
 * Executes autonomous combat turns deterministically end-to-end,
 * calculating 2d10 attack rolls, hit locations, DR soak, and damage routing.
 */

import { AudioService } from './audioService';

export function resolveAutonomousAttack(attackerToken, targetToken, actionPlan = {}) {
  // 1. Roll 2d10
  const d1 = Math.floor(Math.random() * 10) + 1;
  const d2 = Math.floor(Math.random() * 10) + 1;
  const isTriumph = d1 === 10 && d2 === 10;
  const isFumble = d1 === 1 && d2 === 1;

  let baseRoll = d1 + d2;
  if (isTriumph) baseRoll += 10; // Critical Triumph bonus
  if (isFumble) baseRoll = Math.max(2, baseRoll - 8);

  const attackBonus = parseInt(attackerToken.attackBonus || attackerToken.atkBonus || 4, 10);
  const aimBonus = actionPlan.aimBonus || 0;
  const burstBonus = actionPlan.isBurst ? 1 : 0;
  const totalAttack = baseRoll + attackBonus + aimBonus + burstBonus;

  // 2. Compute Defense DC
  const targetBaseDef = parseInt(targetToken.defenseDc || targetToken.defense || 12, 10);
  const coverBonus = targetToken.inCover ? (targetToken.coverType === 'full' ? 4 : 2) : 0;
  const totalDefenseDc = targetBaseDef + coverBonus;

  const isHit = totalAttack >= totalDefenseDc && !isFumble;
  const margin = totalAttack - totalDefenseDc;

  // 3. Damage Calculation
  let rawDamage = 0;
  let effectiveDamage = 0;
  let location = actionPlan.hitLocation || 'torso';
  let locationMultiplier = location === 'head' ? 1.5 : (location === 'arm' || location === 'leg' ? 0.8 : 1.0);

  if (isHit) {
    const baseWpnDmg = parseInt(attackerToken.weaponDamage || 10, 10);
    const variableDmg = Math.floor(Math.random() * 6) + 1;
    const burstDmg = actionPlan.isBurst ? 3 : 0;
    const critDmg = isTriumph ? 6 : 0;

    rawDamage = Math.round((baseWpnDmg + variableDmg + burstDmg + critDmg) * locationMultiplier);

    const targetDr = parseInt(targetToken.armorDr || targetToken.dr || 2, 10);
    const targetToughness = parseInt(targetToken.toughness || targetToken.staMod || 1, 10);
    effectiveDamage = Math.max(1, rawDamage - targetDr - targetToughness);
  }

  // 4. Update Target Vitals
  const targetHp = parseInt(targetToken.health?.current ?? targetToken.hp?.current ?? 20, 10);
  const targetMaxHp = parseInt(targetToken.health?.max ?? targetToken.hp?.max ?? 20, 10);
  const newHp = Math.max(0, targetHp - effectiveDamage);

  // Play audio cues
  if (isHit) {
    AudioService.playTerminalBeep(isTriumph ? 1350 : 880, 0.05);
  } else {
    AudioService.playTerminalBeep(450, 0.03);
  }

  const resultSummary = isHit
    ? `🎯 HIT! (${totalAttack} vs DC ${totalDefenseDc}) on ${location.toUpperCase()} for ${effectiveDamage} DMG [${targetHp} → ${newHp} HP]`
    : `💨 MISS! (${totalAttack} vs DC ${totalDefenseDc})`;

  return {
    attackerId: attackerToken.id || attackerToken.tokenId,
    attackerName: attackerToken.label || attackerToken.name || 'Adversary',
    targetId: targetToken.id || targetToken.tokenId,
    targetName: targetToken.label || targetToken.name || 'Operative',
    d1,
    d2,
    baseRoll,
    totalAttack,
    defenseDc: totalDefenseDc,
    isHit,
    isTriumph,
    isFumble,
    margin,
    location,
    rawDamage,
    effectiveDamage,
    targetPreviousHp: targetHp,
    targetNewHp: newHp,
    targetMaxHp,
    isTargetDowned: newHp <= 0,
    resultSummary,
    timestamp: new Date().toISOString()
  };
}

export default {
  resolveAutonomousAttack
};
