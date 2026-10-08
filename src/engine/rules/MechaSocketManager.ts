/**
 * @file MechaSocketManager.ts
 * @description Stage 5.6: Chassis logistics and hardware rejection for Omnicortex Mecha/Gear.
 * Enforces the physical geometry of Tangent vehicle/mecha hardpoint mounting (UDU Hierarchy:
 * Node < Socket < Mount < Module) and handles biological node limits (Cellular Rejection)
 * for cybernetic augmentations using canonical 2d10 roll resolution.
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

/**
 * Tangent UDU (Universal Dimensional Unit) Hierarchy:
 * - Node: < 10g (Micro/Cyberware)
 * - Socket: < 1kg (Small/Gear mods)
 * - Mount: < 100kg (Medium/Vehicle hardpoints) - 1 Mount = 10 Sockets
 * - Module: < 10t (Large/Starship & Facility bays) - 1 Module = 10 Mounts
 */
export const UDUTier = {
  Node: 'node',     // Cyberware / Bioware (<10g)
  Socket: 'socket', // Weapon & Personal Gear Mods (<1kg)
  Mount: 'mount',   // Mecha / Drone / Vehicle Hardpoint (<100kg, 10 Sockets)
  Module: 'module'  // Facility / Vehicle Bay / Room (<10t, 10 Mounts)
} as const;

export type UDUTier = typeof UDUTier[keyof typeof UDUTier];

export interface Augmentation {
  id: string;
  name: string;
  techLevel: TechLevel;
  nodeCost: number;
}

export interface HardpointSlot {
  slotId: string;
  tier: 'socket' | 'mount' | 'module';
  capacityUDU: number; // e.g., 1 Mount = 10 Sockets
  installedGearId?: string;
  installedWeightKg?: number;
}

export interface MechaChassis {
  id: string;
  name: string;
  maxNodes: number;
  baseVitality: number;
  baseStructure?: number;
  installedAugments: Augmentation[];
  hardpointSlots?: HardpointSlot[];
}

export class MechaSocketManager {
  /**
   * Calculates Cellular Rejection penalty.
   * If an entity installs more cybernetics than Constitution / Stamina allows,
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
   * Uses canonical 2d10 dice roll (not d20!).
   * TL4 Bioware and above are immune.
   */
  public applyEMP(chassis: MechaChassis, empStrengthDC: number, rollOverride?: number): string[] {
    const disabledHardwareIds: string[] = [];

    chassis.installedAugments.forEach(aug => {
      if (aug.techLevel >= TechLevel.TL4_Bioware) {
        return; // Bioware is immune
      }

      // Canonical 2d10 roll (2-20)
      const d1 = Math.floor(Math.random() * 10) + 1;
      const d2 = Math.floor(Math.random() * 10) + 1;
      const savingThrow = rollOverride !== undefined ? rollOverride : (d1 + d2);

      if (savingThrow < empStrengthDC) {
        disabledHardwareIds.push(aug.id);
      }
    });

    return disabledHardwareIds;
  }

  /**
   * Validates hardpoint and UDU allocation for a chassis.
   */
  public validateHardpointMounts(slots: HardpointSlot[]): {
    isValid: boolean;
    totalSocketsUsed: number;
    totalCapacitySockets: number;
  } {
    let totalSocketsUsed = 0;
    let totalCapacitySockets = 0;

    for (const slot of slots) {
      const multiplier = slot.tier === 'module' ? 100 : slot.tier === 'mount' ? 10 : 1;
      totalCapacitySockets += slot.capacityUDU * multiplier;
      if (slot.installedGearId) {
        totalSocketsUsed += multiplier;
      }
    }

    return {
      isValid: totalSocketsUsed <= totalCapacitySockets,
      totalSocketsUsed,
      totalCapacitySockets
    };
  }

  /**
   * Mounts a passenger token into a designated vehicle passenger node.
   */
  public mountPassenger(vehicle: VehicleEntity, nodeId: string, tokenId: string): boolean {
    const node = vehicle.passengerNodes.find(n => n.id === nodeId);
    if (!node || node.seatedTokenId) return false;
    node.seatedTokenId = tokenId;
    return true;
  }

  /**
   * Dismounts a passenger token from a vehicle.
   */
  public dismountPassenger(vehicle: VehicleEntity, tokenId: string): boolean {
    const node = vehicle.passengerNodes.find(n => n.seatedTokenId === tokenId);
    if (!node) return false;
    node.seatedTokenId = undefined;
    return true;
  }

  /**
   * Calculates world and cell positions for all mounted passenger tokens childed to a vehicle.
   * Ensures tokens move synchronously whenever the vehicle moves or turns.
   */
  public calculatePassengerPositions(vehicle: VehicleEntity, cellSizePx: number = 50): ChildedPassengerPosition[] {
    const positions: ChildedPassengerPosition[] = [];

    for (const node of vehicle.passengerNodes) {
      if (!node.seatedTokenId) continue;

      const [offCol, offRow] = node.cellOffset;
      const passengerCol = vehicle.col + offCol;
      const passengerRow = vehicle.row + offRow;

      positions.push({
        tokenId: node.seatedTokenId,
        nodeId: node.id,
        role: node.role,
        col: passengerCol,
        row: passengerRow,
        x: passengerCol * cellSizePx + cellSizePx / 2,
        y: passengerRow * cellSizePx + cellSizePx / 2
      });
    }

    return positions;
  }

  /**
   * Translates a vehicle by [deltaCols, deltaRows] and returns updated childed passenger positions.
   */
  public translateVehicle(
    vehicle: VehicleEntity,
    deltaCols: number,
    deltaRows: number,
    cellSizePx: number = 50
  ): ChildedPassengerPosition[] {
    vehicle.col += deltaCols;
    vehicle.row += deltaRows;
    return this.calculatePassengerPositions(vehicle, cellSizePx);
  }
}

export interface PassengerNode {
  id: string;
  role: 'pilot' | 'copilot' | 'gunner' | 'passenger' | 'cargo';
  cellOffset: [number, number]; // [col, row] relative to vehicle top-left
  seatedTokenId?: string;       // ID of childed passenger token
  zOverride?: string;
}

export interface VehicleEntity {
  id: string;
  name: string;
  gridFootprint: [number, number]; // [widthCells, heightCells], e.g. [2, 4]
  col: number;
  row: number;
  facingDegrees: number;
  passengerNodes: PassengerNode[];
}

export interface ChildedPassengerPosition {
  tokenId: string;
  nodeId: string;
  role: string;
  col: number;
  row: number;
  x: number;
  y: number;
}
