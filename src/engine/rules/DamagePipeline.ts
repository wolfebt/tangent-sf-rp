/**
 * @file DamagePipeline.ts
 * @description Canonical Tangent SF RP Damage & Trauma Pipeline.
 * Strictly adheres to docs/game_rules/operator/3.00 COMBAT.md:
 * - Total Damage = max(0, Raw Damage - Effective Armor DR - Target STA Mod)
 * - Cross-Domain Armor Stacking (Diminishing Returns): Highest layer DR + ceil(other layer DR / 5) per additional cross-domain layer (+1 DR per stage of 5 DR); same-domain wearables use highest single item
 * - Stamina Base Toughness reduces penetrating damage point-for-point down to a minimum of 0
 * - Sneak Attack DR Gate: Precision/Sneak bonus dice apply ONLY if base weapon damage deals >= 1 pt past Armor DR
 * - Specialized damage types:
 *   - Force / Concussive: ignores 1/2 Armor DR (Concussive splits 50/50 between Vitality and Health)
 *   - Spectral / Phase / Mental / Psyche / Psionic / Sonic: ignores physical Armor DR
 *   - Bleed / Overchannel Burn: bypasses Armor DR, Stamina Base Toughness, AND Vitality directly to Health
 * - Vitality-First Routing: Standard attacks deplete Vitality first and spill excess into Health; Critical Hits bypass Vitality directly to Health
 * - Limb damage thresholds: 1/3rd Health = Disabled (Fortitude Save CR 10 + damage), 2/3rds = Destroyed
 * - Synthetic limbs: 50% more damage capacity before Disabled/Destroyed (no Stamina check)
 * - 0 Health: The Mortality State (Unconscious, Incapacitated, Prone, Bleeding Out 1 Stability Dmg/round)
 * - Stability Points = Stamina Score + 5 (Dead ONLY when Stability Points <= 0 or Massive Damage >= STA + 5)
 */

import type { FusedToken } from '../state/VolatileSharder.ts';
import {
  calculateCrossDomainArmorDR,
  calculateDamageMitigation,
  routePoolDamage
} from './CanonicalCombatMath.ts';

export { calculateCrossDomainArmorDR };

export interface DamagePayload {
  rawDamage: number;
  armorPenetration?: number;
  penetration?: number;
  damageType: string; // 'kinetic' | 'force' | 'energy' | 'concussive' | 'corrosive' | 'spectral' | 'dimensional' | 'mental' | 'sonic' | 'bleed' | etc.
  isCalledShot: boolean;
  targetLocation?: 'head' | 'torso' | 'arm_left' | 'arm_right' | 'leg_left' | 'leg_right' | 'tentacle' | 'wing' | string;
  isSyntheticLimb?: boolean;
  isTargetDefenseless?: boolean;
  attackMargin?: number;
  defenselessBonusDamage?: number;
  isLethal?: boolean; // false for non-lethal attacks (e.g. subdual, stun, pummeling)
  isCritical?: boolean; // Critical hits bypass Vitality and apply directly to Health
  isOverchannelBurn?: boolean; // Overchannel Burn bypasses Armor DR, Stamina Toughness, and Vitality directly to Health
  directToHealth?: boolean; // Explicit direct-to-Health flag
  baseWeaponRawDamage?: number; // Base weapon damage before Sneak Attack precision dice (for Sneak Attack DR gate)
  sneakAttackBonusDamage?: number; // Sneak Attack bonus damage (only applies if baseWeaponRawDamage penetrates >= 1 pt past Armor DR)
  attemptedReduction?: boolean; // Whether defender attempted mitigation against Concussive damage
}

export interface DamageResult {
  rawDamage: number;
  defenselessBonusDamage: number;
  sneakAttackBonusApplied?: number;
  effectiveDR: number;
  conModSoak: number; // Retained for compatibility (Stamina Natural DR soak)
  staminaDRSoak?: number;
  netDamage: number;
  vitalityDamage: number;
  healthDamage: number;
  structureDamage?: number;
  appliedStatuses: string[];
  requiresStaminaCheck: boolean;
  staminaCheckDC: number;
  staminaCheckCR?: number;
  entersMortalityState: boolean;
  isDead: boolean;
  stabilityPointsRemaining?: number;
  limbStatus?: 'normal' | 'disabled' | 'destroyed';
}

export class DamagePipeline {
  private readonly DISABLED_LIMB_THRESHOLD = 1 / 3; // 33.3% of Max Health
  private readonly DESTROYED_LIMB_THRESHOLD = 2 / 3; // 66.7% of Max Health

  /**
   * Resolves an incoming attack payload against a target token per 3.00 COMBAT.md.
   */
  public resolveStrike(
    payload: DamagePayload,
    target: FusedToken,
    activeArmorLayers: number[] = [],
    targetStaminaMod: number = 0,
    targetStaminaScore: number = 0,
    currentStabilityPoints?: number
  ): DamageResult {
    const statuses: string[] = [];

    // 0. Calculate defenseless target extra damage (half of success margin per rules)
    const defenselessBonus = payload.defenselessBonusDamage !== undefined
      ? payload.defenselessBonusDamage
      : ((payload.isTargetDefenseless && payload.attackMargin && payload.attackMargin > 0)
        ? Math.floor(payload.attackMargin / 2)
        : 0);

    // 1-4. Delegate stacking, type bypass/halving (incl. dimensional), Penetration, Sneak Gate & Stamina Toughness
    const resolvedLayers = activeArmorLayers.length > 0
      ? activeArmorLayers
      : ((target.armor_dr || 0) > 0 ? [target.armor_dr] : []);
    const mitigation = calculateDamageMitigation({
      rawDamage: payload.rawDamage,
      baseWeaponRaw: payload.baseWeaponRawDamage,
      sneakAttackBonusRaw: payload.sneakAttackBonusDamage,
      armorLayers: resolvedLayers,
      penetration: payload.penetration ?? payload.armorPenetration ?? 0,
      damageType: payload.damageType,
      isOverchannelBurn: payload.isOverchannelBurn,
      staminaToughness: target.stamina_dr ?? targetStaminaMod,
      defenselessBonusDamage: defenselessBonus
    });

    const effectiveDR = mitigation.effectiveArmorDr;
    const staminaNaturalSoak = mitigation.staminaSoak;
    const conModSoak = staminaNaturalSoak;
    const sneakAttackBonusApplied = mitigation.sneakAttackBonusApplied;

    // 5. Vitality vs Health vs Structure Damage Routing & Mortality Evaluation
    const isSynthetic = Boolean(
      target.is_synthetic ||
      target.species?.toLowerCase().includes('synthetic') ||
      target.species?.toLowerCase().includes('automaton') ||
      target.species?.toLowerCase().includes('mecha') ||
      target.species?.toLowerCase().includes('construct')
    );

    const isLethal = payload.isLethal !== false;
    const hasVitalityPool = target.current_vitality !== undefined || target.base_vitality !== undefined || !isLethal;
    const maxHp = target.base_health || target.base_hp || 30;
    const currentHealth = isSynthetic
      ? (target.current_structure ?? target.current_hp ?? 60)
      : (target.current_health ?? target.current_hp ?? maxHp);

    const routing = routePoolDamage({
      netDamage: mitigation.netDamage,
      isSynthetic,
      isLethal,
      isCritical: payload.isCritical,
      damageType: payload.damageType,
      isOverchannelBurn: payload.isOverchannelBurn,
      directToHealth: payload.directToHealth,
      attemptedReduction: payload.attemptedReduction,
      hasVitalityPool,
      currentVitality: target.current_vitality ?? target.base_vitality ?? 30,
      currentHealth,
      currentStructure: target.current_structure ?? target.current_hp ?? 60,
      staminaScore: targetStaminaScore,
      currentStabilityPoints
    });

    const netDamage = routing.netDamage;
    const vitalityDamage = routing.vitalityDamage;
    const healthDamage = routing.healthDamage;
    const structureDamage = routing.structureDamage;
    if (routing.syntheticNonLethalImmune) {
      statuses.push('status_synthetic_nonlethal_immune');
    }

    // 6. Limb Damage & Trauma Threshold Evaluation
    let requiresStaminaCheck = false;
    let staminaCheckDC = 0;
    let limbStatus: 'normal' | 'disabled' | 'destroyed' = 'normal';

    if (payload.isCalledShot && payload.targetLocation && maxHp > 0) {
      const synthMultiplier = payload.isSyntheticLimb || isSynthetic ? 1.5 : 1.0;
      const disabledThreshold = maxHp * this.DISABLED_LIMB_THRESHOLD * synthMultiplier;
      const destroyedThreshold = maxHp * this.DESTROYED_LIMB_THRESHOLD * synthMultiplier;

      if (netDamage >= destroyedThreshold) {
        limbStatus = 'destroyed';
        statuses.push(`status_destroyed_${payload.targetLocation}`);
        if (payload.targetLocation === 'head') {
          statuses.push('status_brain_death_risk');
        }
      } else if (netDamage >= disabledThreshold) {
        limbStatus = 'disabled';
        statuses.push(`status_disabled_${payload.targetLocation}`);

        if (!payload.isSyntheticLimb && !isSynthetic) {
          requiresStaminaCheck = true;
          staminaCheckDC = 10 + netDamage;
        }
      }
    } else {
      const traumaBase = isSynthetic ? (target.base_structure || target.base_hp || 60) * 1.5 : maxHp;
      if (netDamage >= (traumaBase * this.DISABLED_LIMB_THRESHOLD)) {
        statuses.push('status_trauma_internal');
      }
    }

    // 7. Mortality statuses
    if (routing.entersMortalityState) {
      statuses.push('status_unconscious', 'status_incapacitated', 'status_prone', 'status_bleeding_out');
      if (routing.isDead) {
        statuses.push('status_dead');
      }
    }

    return {
      rawDamage: payload.rawDamage,
      defenselessBonusDamage: defenselessBonus,
      sneakAttackBonusApplied,
      effectiveDR,
      conModSoak,
      staminaDRSoak: staminaNaturalSoak,
      netDamage,
      vitalityDamage,
      healthDamage,
      structureDamage,
      appliedStatuses: Array.from(new Set(statuses)),
      requiresStaminaCheck,
      staminaCheckDC,
      staminaCheckCR: staminaCheckDC,
      entersMortalityState: routing.entersMortalityState,
      isDead: routing.isDead,
      stabilityPointsRemaining: routing.stabilityPointsRemaining,
      limbStatus
    };
  }

  /**
   * Translates the mathematical result into actionable CRDT updates for the network.
   */
  public generateStatePatch(targetId: string, result: DamageResult): Record<string, any> {
    return {
      id: targetId,
      hp_delta: -result.healthDamage,
      vitality_delta: -result.vitalityDamage,
      enters_mortality: result.entersMortalityState,
      stability_points: result.stabilityPointsRemaining,
      is_dead: result.isDead,
      new_conditions: result.appliedStatuses
    };
  }
}
