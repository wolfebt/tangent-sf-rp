/**
 * @file MechaSocketManager.ts
 * @description Stage 5.6: Chassis logistics and hardware rejection for Omnicortex Mecha/Gear.
 * Enforces the physical geometry of Tangent vehicle/mecha hardpoint mounting and handles 
 * the biological node limits (Cellular Rejection) for cybernetic augmentations.
 */

export const TechLevel = {
  TL0_Primitive: 0,
  TL1_Industrial: 1,
  TL2_Information: 2,
  TL3_Cybernetic: 3, // Vulnerable to EMP
  TL4_Bioware: 4,    // Immune to EMP, Fast Healing
  TL5_Singularity: 5
} as const;

export type TechLevel = typeof TechLevel[keyof typeof TechLevel];

export interface Augmentation {
  id: string;
  name: string;
  techLevel: TechLevel;
  nodeCost: number;
}

export interface MechaChassis {
  id: string;
  name: string;
  maxNodes: number;
  baseVitality: number;
  installedAugments: Augmentation[];
  hardpointSlots?: {
    slotId: string;
    slotType: 'light' | 'medium' | 'heavy' | 'spinal';
    installedGearId?: string;
  }[];
}

export class MechaSocketManager {
  /**
   * Calculates Cellular Rejection penalty.
   * If an entity installs more cybernetics than Constitution allows,
   * max Vitality is permanently suppressed.
   */
  public evaluateCellularRejection(chassis: MechaChassis): { 
    isOverloaded: boolean; 
    vitalityPenalty: number;
    usedNodes: number;
  } {
    let usedNodes = 0;
    chassis.installedAugments.forEach(aug => usedNodes += aug.nodeCost);

    const overloadAmount = Math.max(0, usedNodes - chassis.maxNodes);
    
    // Each node over the limit reduces max Vitality by 10% (up to 90% max suppression)
    const penaltyPercent = Math.min(0.9, overloadAmount * 0.10);
    const vitalityPenalty = Math.floor(chassis.baseVitality * penaltyPercent);

    return {
      isOverloaded: overloadAmount > 0,
      vitalityPenalty,
      usedNodes
    };
  }

  /**
   * Resolves incoming EMP effect against installed hardware.
   * TL4 Bioware and above are immune.
   */
  public applyEMP(chassis: MechaChassis, empStrengthDC: number): string[] {
    const disabledHardwareIds: string[] = [];

    chassis.installedAugments.forEach(aug => {
      if (aug.techLevel >= TechLevel.TL4_Bioware) {
        return; // Bioware is immune
      }

      // Roll against EMP DC
      const savingThrow = Math.floor(Math.random() * 20) + 1; 
      if (savingThrow < empStrengthDC) {
        disabledHardwareIds.push(aug.id);
      }
    });

    return disabledHardwareIds;
  }
}
