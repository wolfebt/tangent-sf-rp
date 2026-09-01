/**
 * @file DamagePipeline.ts
 * @description Stage 5.5: Armor caps, penetration, and localized trauma.
 * Resolves Tangent's complex damage mathematics: calculates net DR from layered 
 * armor (using the max rule), applies Armor Penetration (AP), and automatically 
 * flags Disabled Limbs if the 33.3% single-strike threshold is breached.
 */

import { FusedToken } from '../state/VolatileSharder';

export interface DamagePayload {
  rawDamage: number;
  armorPenetration: number;
  damageType: string;
  isCalledShot: boolean;
  targetLocation?: 'head' | 'torso' | 'arm_left' | 'arm_right' | 'leg_left' | 'leg_right';
}

export interface DamageResult {
  netDamage: number;
  appliedStatuses: string[];
  isDead: boolean;
}

export class DamagePipeline {
  private readonly MAJOR_WOUND_THRESHOLD = 0.333; // 33.3% of Max HP in a single strike

  /**
   * Resolves an incoming attack payload against a target's stats.
   * Note: In Tangent, if you wear DR 20 armor over DR 15 armor, you do NOT get DR 35. 
   * You get DR 20. The engine enforces this by taking the Math.max() of active layers.
   */
  public resolveStrike(payload: DamagePayload, target: FusedToken, activeArmorLayers: number[]): DamageResult {
    const statuses: string[] = [];
    
    // 1. Calculate highest active Armor layer
    const highestDR = activeArmorLayers.length > 0 ? Math.max(...activeArmorLayers) : target.armor_dr;

    // 2. Apply Armor Penetration (AP cannot reduce DR below 0)
    const effectiveDR = Math.max(0, highestDR - payload.armorPenetration);

    // 3. Calculate Net Damage
    const netDamage = Math.max(0, payload.rawDamage - effectiveDR);

    // 4. Check for Major Wounds / Called Shot thresholds
    if (netDamage > 0) {
      const damageRatio = netDamage / target.base_hp;

      if (damageRatio >= this.MAJOR_WOUND_THRESHOLD) {
        if (payload.isCalledShot && payload.targetLocation) {
          // A called shot that beats the 33% threshold disables the limb
          statuses.push(`status_disabled_${payload.targetLocation}`);
        } else {
          // A standard attack that beats the threshold causes systemic trauma
          statuses.push('status_trauma_internal');
        }
      }
    }

    // 5. Check Lethality
    const isDead = (target.current_hp - netDamage) <= 0;
    if (isDead) {
      statuses.push('status_dead');
    }

    return {
      netDamage,
      appliedStatuses: statuses,
      isDead
    };
  }

  /**
   * Translates the mathematical result into actionable CRDT updates for the network.
   * This would typically be passed to the YjsProviderBridge.
   */
  public generateStatePatch(targetId: string, result: DamageResult): Record<string, any> {
    return {
      id: targetId,
      hp_delta: -result.netDamage,
      new_conditions: result.appliedStatuses
    };
  }
}