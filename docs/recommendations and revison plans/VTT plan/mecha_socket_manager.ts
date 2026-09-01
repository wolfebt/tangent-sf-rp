/**
 * @file MechaSocketManager.ts
 * @description Stage 5.6: Chassis logistics and hardware rejection.
 * Enforces the physical geometry of Tangent vehicle/mecha mounting and handles 
 * the biological node limits (Cellular Rejection) for cybernetic augmentations.
 */

export enum TechLevel {
  TL0_Primitive = 0,
  TL1_Industrial = 1,
  TL2_Information = 2,
  TL3_Cybernetic = 3, // Vulnerable to EMP
  TL4_Bioware = 4,    // Immune to EMP, Fast Healing
  TL5_Singularity = 5
}

export interface Augmentation {
  id: string;
  name: string;
  techLevel: TechLevel;
  nodeCost: number;
}

export interface MechaChassis {
  id: string;
  maxNodes: number;
  baseVitality: number;
  installedAugments: Augmentation[];
}

export class MechaSocketManager {

  /**
   * Calculates the Cellular Rejection penalty.
   * In Tangent, if a biological entity installs more cybernetics (Nodes) than their 
   * Constitution allows, their maximum hit points (Vitality) are permanently suppressed.
   */
  public evaluateCellularRejection(chassis: MechaChassis): { 
    isOverloaded: boolean; 
    vitalityPenalty: number;
    usedNodes: number;
  } {
    let usedNodes = 0;
    chassis.installedAugments.forEach(aug => usedNodes += aug.nodeCost);

    const overloadAmount = Math.max(0, usedNodes - chassis.maxNodes);
    
    // Each node over the limit reduces max Vitality by 10%
    // A player can theoretically push to 90% suppression before death.
    const penaltyPercent = Math.min(0.9, overloadAmount * 0.10);
    const vitalityPenalty = Math.floor(chassis.baseVitality * penaltyPercent);

    return {
      isOverloaded: overloadAmount > 0,
      vitalityPenalty,
      usedNodes
    };
  }

  /**
   * Resolves an incoming EMP effect against the installed hardware.
   * Differentiates between bulky TL3 Cybernetics (short circuit) and 
   * organic TL4 Bioware (immune).
   */
  public applyEMP(chassis: MechaChassis, empStrengthDC: number): string[] {
    const disabledHardwareIds: string[] = [];

    chassis.installedAugments.forEach(aug => {
      // TL4 Bioware and above are completely immune to standard electromagnetic pulses
      if (aug.techLevel >= TechLevel.TL4_Bioware) {
        return; 
      }

      // TL3 and below roll against the EMP DC. 
      // (Mocked roll here for engine demonstration, normally passed to DiceASTParser)
      const savingThrow = Math.floor(Math.random() * 20) + 1; 
      
      if (savingThrow < empStrengthDC) {
        disabledHardwareIds.push(aug.id);
      }
    });

    return disabledHardwareIds;
  }
}