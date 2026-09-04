/**
 * @file DamagePipeline.ts
 * @description Canonical Tangent SF RP Damage & Trauma Pipeline.
 * Strictly adheres to docs/game rules/operator/3.00 COMBAT.md:
 * - Total Damage = (Raw Damage) - (Target Armor DR + Target CON Mod)
 * - Specialized damage types: Force (ignores 1/2 Armor DR), Spectral/Mental (ignores physical DR), Concussive (ignores 1/2 DR, splits between Vitality and Health)
 * - Limb damage thresholds: 1/3rd Health = Disabled (Stamina Save DC 10 + damage), 2/3rds = Destroyed
 * - Synthetic limbs: 50% more damage capacity before Disabled/Destroyed (no Stamina check)
 * - 0 Health: The Mortality State (Unconscious, Incapacitated, Bleeding Out 1 Stability Dmg/round)
 * - Stability Points = Constitution Score + 5 (Dead ONLY when Stability Points <= 0)
 */

import type { FusedToken } from '../state/VolatileSharder.ts';

export interface DamagePayload {
  rawDamage: number;
  armorPenetration: number;
  damageType: string; // 'kinetic' | 'force' | 'energy' | 'concussive' | 'corrosive' | 'spectral' | 'mental' | etc.
  isCalledShot: boolean;
  targetLocation?: 'head' | 'torso' | 'arm_left' | 'arm_right' | 'leg_left' | 'leg_right' | 'tentacle' | 'wing';
  isSyntheticLimb?: boolean;
  isTargetDefenseless?: boolean;
  attackMargin?: number;
  defenselessBonusDamage?: number;
}

export interface DamageResult {
  rawDamage: number;
  defenselessBonusDamage: number;
  effectiveDR: number;
  conModSoak: number;
  netDamage: number;
  vitalityDamage: number;
  healthDamage: number;
  appliedStatuses: string[];
  requiresStaminaCheck: boolean;
  staminaCheckDC: number;
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
    targetConMod: number = 0,
    targetConScore: number = 10,
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

    const totalRawDamage = payload.rawDamage + defenselessBonus;

    // 1. Calculate highest active Armor layer
    let highestDR = activeArmorLayers.length > 0 ? Math.max(...activeArmorLayers) : (target.armor_dr || 0);

    // 2. Special damage type interactions with Armor DR
    if (dmgType === 'spectral' || dmgType === 'phase' || dmgType === 'mental' || dmgType === 'psyche') {
      // Bypasses physical Armor DR entirely
      highestDR = 0;
    } else if (dmgType === 'force') {
      // Force damage ignores 1/2 of Target's Armor DR
      highestDR = Math.floor(highestDR / 2);
    } else if (dmgType === 'concussive' || dmgType === 'impact') {
      // Concussive damage typically ignores half or more of target DR
      highestDR = Math.floor(highestDR / 2);
    }

    // 3. Apply Armor Penetration (AP cannot reduce DR below 0)
    const effectiveDR = Math.max(0, highestDR - (payload.armorPenetration || 0));

    // 4. Calculate Net Damage after Armor DR AND target Constitution modifier
    // Formula: (Damage) - (Target Armor DR + Target CON Mod) = Total Damage
    const conModSoak = Math.max(0, targetConMod);
    const totalMitigation = effectiveDR + conModSoak;
    const netDamage = Math.max(0, totalRawDamage - totalMitigation);

    // 5. Vitality vs Health Damage Routing
    let vitalityDamage = 0;
    let healthDamage = netDamage;

    if (dmgType === 'concussive' || dmgType === 'impact') {
      // Concussive damage is divided equally between Vitality and Health if target attempts to reduce damage
      vitalityDamage = Math.floor(netDamage / 2);
      healthDamage = netDamage - vitalityDamage;
    }

    // 6. Limb Damage & Trauma Threshold Evaluation
    let requiresStaminaCheck = false;
    let staminaCheckDC = 0;
    let limbStatus: 'normal' | 'disabled' | 'destroyed' = 'normal';

    const maxHp = target.base_hp || 30;
    if (payload.isCalledShot && payload.targetLocation && maxHp > 0) {
      // Synthetic limbs take 50% more damage before being Disabled or Destroyed
      const synthMultiplier = payload.isSyntheticLimb ? 1.5 : 1.0;
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
        
        // Biological limbs get a Stamina check (DC = 10 + damage taken) to keep using it
        if (!payload.isSyntheticLimb) {
          requiresStaminaCheck = true;
          staminaCheckDC = 10 + netDamage;
        }
      }
    } else if (netDamage >= (maxHp * this.DISABLED_LIMB_THRESHOLD)) {
      // Massive internal trauma
      statuses.push('status_trauma_internal');
    }

    // 7. Mortality State (0 Hit Points) Evaluation
    // Per 3.00 COMBAT.md: Reaching 0 HP does NOT mean instant death!
    // Target falls Prone, is Incapacitated & enters Bleeding Out (1 Stability Damage/turn).
    // Stability Points = Constitution Score + 5.
    // Death occurs ONLY when Stability Points reach 0!
    const remainingHp = (target.current_hp || maxHp) - healthDamage;
    let entersMortalityState = false;
    let isDead = false;
    const maxStability = Math.max(5, targetConScore + 5);
    let stabilityPointsRemaining = currentStabilityPoints !== undefined ? currentStabilityPoints : maxStability;

    if (remainingHp <= 0) {
      entersMortalityState = true;
      statuses.push('status_unconscious', 'status_incapacitated', 'status_prone', 'status_bleeding_out');

      // If damage spills beyond 0 HP into negative, excess reduces stability points
      const excessDamage = Math.abs(remainingHp);
      stabilityPointsRemaining = Math.max(0, stabilityPointsRemaining - excessDamage);

      if (stabilityPointsRemaining <= 0) {
        isDead = true;
        statuses.push('status_dead');
      }
    }

    return {
      rawDamage: payload.rawDamage,
      defenselessBonusDamage: defenselessBonus,
      effectiveDR,
      conModSoak,
      netDamage,
      vitalityDamage,
      healthDamage,
      appliedStatuses: Array.from(new Set(statuses)),
      requiresStaminaCheck,
      staminaCheckDC,
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
