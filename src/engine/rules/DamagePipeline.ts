/**
 * @file DamagePipeline.ts
 * @description Canonical Tangent SF RP Damage & Trauma Pipeline.
 * Strictly adheres to docs/game_rules/operator/3.00 COMBAT.md:
 * - Total Damage = max(0, Raw Damage - Effective Armor DR - Target STA Mod)
 * - Armor Layering Cap: Highest single domain DR only (biological, cybernetic, wearable never stack)
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

export interface DamagePayload {
  rawDamage: number;
  armorPenetration: number;
  damageType: string; // 'kinetic' | 'force' | 'energy' | 'concussive' | 'corrosive' | 'spectral' | 'mental' | 'sonic' | 'bleed' | etc.
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
    const dmgType = (payload.damageType || 'kinetic').toLowerCase();

    // 0. Calculate defenseless target extra damage (half of success margin per rules)
    const defenselessBonus = payload.defenselessBonusDamage !== undefined
      ? payload.defenselessBonusDamage
      : ((payload.isTargetDefenseless && payload.attackMargin && payload.attackMargin > 0)
        ? Math.floor(payload.attackMargin / 2)
        : 0);

    // 1. Calculate highest active Armor layer (Armor Layering Cap: highest single domain DR only; never summed)
    let highestDR = activeArmorLayers.length > 0 ? Math.max(...activeArmorLayers) : (target.armor_dr || 0);

    // 2. Special damage type interactions with Armor DR
    const bypassesAllMitigation = dmgType === 'bleed' || Boolean(payload.isOverchannelBurn);
    if (
      bypassesAllMitigation ||
      dmgType === 'spectral' ||
      dmgType === 'phase' ||
      dmgType === 'mental' ||
      dmgType === 'psyche' ||
      dmgType === 'psionic' ||
      dmgType === 'sonic'
    ) {
      // Bypasses physical Armor DR entirely
      highestDR = 0;
    } else if (dmgType === 'force' || dmgType === 'force_pulse') {
      // Force damage ignores 1/2 of Target's Armor DR
      highestDR = Math.floor(highestDR / 2);
    } else if (dmgType === 'concussive' || dmgType === 'impact') {
      // Concussive damage ignores half of target DR
      highestDR = Math.floor(highestDR / 2);
    }

    // 3. Apply Armor Penetration (AP cannot reduce DR below 0)
    const effectiveDR = bypassesAllMitigation ? 0 : Math.max(0, highestDR - (payload.armorPenetration || 0));

    // 3b. Sneak Attack DR Gate (3.00 COMBAT.md):
    // Sneak Attack / precision bonus dice apply ONLY if base weapon damage deals >= 1 point past Effective Armor DR.
    let effectiveRawDamage = payload.rawDamage;
    let sneakAttackBonusApplied = 0;
    if (payload.sneakAttackBonusDamage !== undefined && payload.sneakAttackBonusDamage > 0) {
      const baseWeaponRaw = payload.baseWeaponRawDamage !== undefined
        ? payload.baseWeaponRawDamage
        : Math.max(0, payload.rawDamage - payload.sneakAttackBonusDamage);
      if (baseWeaponRaw - effectiveDR >= 1) {
        sneakAttackBonusApplied = payload.sneakAttackBonusDamage;
        effectiveRawDamage = baseWeaponRaw + sneakAttackBonusApplied;
      } else {
        sneakAttackBonusApplied = 0;
        effectiveRawDamage = baseWeaponRaw;
      }
    }

    const totalRawDamage = effectiveRawDamage + defenselessBonus;

    // 4. Canonical Damage Soak per 3.00 COMBAT.md:
    // Total Net Damage = max(0, Raw Damage - Effective Armor DR - Target Stamina Mod)
    // Bleed and Overchannel Burn bypass both Armor DR and Stamina Base Toughness.
    const penetratingArmor = Math.max(0, totalRawDamage - effectiveDR);
    let staminaNaturalSoak = 0;
    let netDamage = 0;

    const naturalDR = bypassesAllMitigation ? 0 : Math.max(0, target.stamina_dr ?? targetStaminaMod);

    if (penetratingArmor > 0) {
      netDamage = Math.max(0, penetratingArmor - naturalDR);
      staminaNaturalSoak = penetratingArmor - netDamage;
    } else {
      netDamage = 0;
      staminaNaturalSoak = 0;
    }

    const conModSoak = staminaNaturalSoak;

    // 5. Vitality vs Health vs Structure Damage Routing
    // Per 3.00 COMBAT.md: Standard damage depletes Vitality first and spills excess into Health.
    // Critical Hits, Bleed, Overchannel Burn, and explicit directToHealth bypass Vitality directly to Health.
    // Minimal VTT FusedTokens without a separate Vitality pool (no current_vitality/base_vitality) route lethal damage to Health directly.
    let vitalityDamage = 0;
    let healthDamage = 0;
    let structureDamage = 0;

    const isSynthetic = Boolean(
      target.is_synthetic ||
      target.species?.toLowerCase().includes('synthetic') ||
      target.species?.toLowerCase().includes('automaton') ||
      target.species?.toLowerCase().includes('mecha') ||
      target.species?.toLowerCase().includes('construct')
    );

    const isLethal = payload.isLethal !== false;
    const bypassesVitality = Boolean(
      payload.isCritical ||
      payload.isOverchannelBurn ||
      payload.directToHealth ||
      dmgType === 'bleed'
    );
    const hasVitalityPool = target.current_vitality !== undefined || target.base_vitality !== undefined || !isLethal;

    if (isSynthetic) {
      // Synthetics only have Structure (Vitality + Health combined); immune to non-lethal damage
      if (isLethal) {
        structureDamage = netDamage;
        healthDamage = netDamage;
      } else {
        // Synthetics do not suffer non-lethal damage
        structureDamage = 0;
        healthDamage = 0;
        netDamage = 0;
        statuses.push('status_synthetic_nonlethal_immune');
      }
    } else if (dmgType === 'concussive' || dmgType === 'impact') {
      if (payload.attemptedReduction === false && hasVitalityPool) {
        const curVit = Math.max(0, target.current_vitality ?? target.base_vitality ?? 30);
        vitalityDamage = Math.min(curVit, netDamage);
        healthDamage = Math.max(0, netDamage - curVit);
      } else {
        // Concussive damage with attempted mitigation is divided equally between Vitality and Health
        const halfVit = Math.floor(netDamage / 2);
        const halfHea = netDamage - halfVit;
        if (hasVitalityPool) {
          const curVit = Math.max(0, target.current_vitality ?? target.base_vitality ?? 30);
          const vitSpill = Math.max(0, halfVit - curVit);
          vitalityDamage = Math.min(curVit, halfVit);
          healthDamage = halfHea + vitSpill;
        } else {
          vitalityDamage = halfVit;
          healthDamage = halfHea;
        }
      }
    } else if (!bypassesVitality && hasVitalityPool) {
      // Canonical Vitality-first routing: deplete Vitality first; excess spills into Health
      const curVit = Math.max(0, target.current_vitality ?? target.base_vitality ?? 30);
      if (netDamage <= curVit) {
        vitalityDamage = netDamage;
        healthDamage = 0;
      } else {
        vitalityDamage = curVit;
        healthDamage = netDamage - curVit;
      }
    } else {
      // Critical Hit, Bleed, Overchannel Burn, directToHealth, or single-pool VTT token
      healthDamage = netDamage;
      vitalityDamage = 0;
    }

    // 6. Limb Damage & Trauma Threshold Evaluation
    let requiresStaminaCheck = false;
    let staminaCheckDC = 0;
    let limbStatus: 'normal' | 'disabled' | 'destroyed' = 'normal';

    const maxHp = target.base_health || target.base_hp || 30;
    if (payload.isCalledShot && payload.targetLocation && maxHp > 0) {
      // Synthetic limbs take 50% more damage before being Disabled or Destroyed
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

        // Biological limbs get a Fortitude/Stamina check (CR = 10 + damage taken) to keep using it
        if (!payload.isSyntheticLimb && !isSynthetic) {
          requiresStaminaCheck = true;
          staminaCheckDC = 10 + netDamage;
        }
      }
    } else if (netDamage >= (maxHp * this.DISABLED_LIMB_THRESHOLD)) {
      // Massive internal trauma
      statuses.push('status_trauma_internal');
    }

    // 7. Mortality State (0 Hit Points / Health) Evaluation
    // Per 3.00 COMBAT.md: Reaching 0 Health does NOT mean instant death!
    // Target falls Prone, is Incapacitated & enters Bleeding Out (1 Stability Damage/turn).
    // Stability Points = Stamina Score + 5.
    // Death occurs when Stability Points reach 0 (or single-hit Massive Damage >= STA + 5 while at 0 Health)!
    const currentHealth = isSynthetic
      ? (target.current_structure ?? target.current_hp ?? 45)
      : (target.current_health ?? target.current_hp ?? maxHp);
    const remainingHp = currentHealth - healthDamage;
    let entersMortalityState = false;
    let isDead = false;
    const maxStability = Math.max(1, targetStaminaScore + 5);
    let stabilityPointsRemaining = currentStabilityPoints !== undefined ? currentStabilityPoints : maxStability;

    if (remainingHp <= 0) {
      entersMortalityState = true;
      statuses.push('status_unconscious', 'status_incapacitated', 'status_prone', 'status_bleeding_out');

      // If damage spills beyond 0 HP into negative, excess reduces stability points
      const excessDamage = Math.abs(remainingHp);
      stabilityPointsRemaining = Math.max(0, stabilityPointsRemaining - excessDamage);

      if (stabilityPointsRemaining <= 0 || (!isSynthetic && currentHealth <= 0 && netDamage >= maxStability)) {
        isDead = true;
        stabilityPointsRemaining = 0;
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
      entersMortalityState,
      isDead,
      stabilityPointsRemaining,
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
