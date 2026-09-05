/**
 * @file LoSRaycast3D.ts
 * @description Stage 3D: Volumetric 3D Line of Sight and Cover Arbitrator.
 * Shoots rays in 3D Euclidean space between combatant eye heights and target bounding volumes,
 * evaluating cover categories (None, Half, Three-Quarters, Full) and high-ground vantage advantage.
 */

import * as THREE from 'three';

export interface Combatant3DData {
  id: string;
  x: number;
  y: number; // 2D y -> 3D Z
  elevation_ft?: number;
  size_modifier?: number;
  is_mecha?: boolean;
}

export type CoverTier = 'NONE' | 'HALF_COVER' | 'THREE_QUARTERS' | 'FULL_OBSCURATION';

export interface LoSResult3D {
  hasLoS: boolean;
  coverTier: CoverTier;
  coverBonusToTarget: number; // AC / Defense bonus (+0, +2, +5)
  attackModifier: number;     // +2 for High Ground Advantage, etc.
  distanceFt: number;
  unobstructedRayRatio: number;
  reason: string;
}

export class LoSRaycast3D {
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  /**
   * Evaluates 3D Line-of-Sight and Cover between an attacker and target.
   * @param attacker Attacker combatant data
   * @param target Target combatant data
   * @param occluderObjects Three.js meshes/groups that block line-of-sight (walls, doors, terrain)
   */
  public evaluateLoS(
    attacker: Combatant3DData,
    target: Combatant3DData,
    occluderObjects: THREE.Object3D[]
  ): LoSResult3D {
    // 1 cell = 70 world units = 5 ft -> scale factor: 70 / 5 = 14 units per ft
    const unitsPerFt = 14;

    // Attacker eye height (Medium human ~5.5ft, Mecha ~18ft)
    const attackerEyeFt = attacker.is_mecha ? 18 : 5.5;
    const targetEyeFt = target.is_mecha ? 18 : 5.5;

    const attackerElevFt = attacker.elevation_ft || 0;
    const targetElevFt = target.elevation_ft || 0;

    const startX = attacker.x;
    const startY = (attackerElevFt + attackerEyeFt) * unitsPerFt;
    const startZ = attacker.y; // 2D Y is 3D Z

    const targetX = target.x;
    const targetBaseY = targetElevFt * unitsPerFt;
    const targetZ = target.y;

    const startPos = new THREE.Vector3(startX, startY, startZ);

    // Target sample test points: Head, Center Mass, and Lower Torso/Base
    const targetPoints = [
      new THREE.Vector3(targetX, targetBaseY + (targetEyeFt * unitsPerFt), targetZ), // Head
      new THREE.Vector3(targetX, targetBaseY + (targetEyeFt * 0.5 * unitsPerFt), targetZ), // Center Mass
      new THREE.Vector3(targetX, targetBaseY + (targetEyeFt * 0.15 * unitsPerFt), targetZ) // Lower/Legs
    ];

    // Calculate 3D distance
    const distFt = Math.round(
      (startPos.distanceTo(targetPoints[1]) / unitsPerFt) * 10
    ) / 10;

    let clearRays = 0;

    for (const testPt of targetPoints) {
      const dir = new THREE.Vector3().subVectors(testPt, startPos);
      const totalDist = dir.length();
      if (totalDist < 0.001) {
        clearRays++;
        continue;
      }
      dir.normalize();

      this.raycaster.set(startPos, dir);
      this.raycaster.near = 1;
      this.raycaster.far = totalDist - 1; // Don't self-intersect target

      const intersects = this.raycaster.intersectObjects(occluderObjects, true);
      
      // Filter out open doors and window materials if weapon is optical
      const solidBlocks = intersects.filter(hit => {
        const userData = (hit.object as any).userData || (hit.object.parent as any)?.userData;
        if (userData?.isWall && userData?.isOpen) return false;
        return true;
      });

      if (solidBlocks.length === 0) {
        clearRays++;
      }
    }

    const ratio = clearRays / targetPoints.length;

    // Check for high-ground tactical advantage (elevation differential > 10ft)
    const elevationDiff = (attackerElevFt + attackerEyeFt) - (targetElevFt + targetEyeFt);
    const hasHighGround = elevationDiff >= 10;

    if (clearRays === 0) {
      return {
        hasLoS: false,
        coverTier: 'FULL_OBSCURATION',
        coverBonusToTarget: 99,
        attackModifier: 0,
        distanceFt: distFt,
        unobstructedRayRatio: 0,
        reason: 'Target is completely occluded behind solid structures.'
      };
    }

    if (clearRays === targetPoints.length) {
      return {
        hasLoS: true,
        coverTier: 'NONE',
        coverBonusToTarget: 0,
        attackModifier: hasHighGround ? 2 : 0,
        distanceFt: distFt,
        unobstructedRayRatio: ratio,
        reason: hasHighGround 
          ? 'Clear line of sight with High-Ground Vantage (+2 Attack).'
          : 'Clear line of sight. No cover.'
      };
    }

    if (clearRays === 2) {
      // Lower body obscured, head/center visible -> Half Cover
      return {
        hasLoS: true,
        coverTier: 'HALF_COVER',
        coverBonusToTarget: hasHighGround ? 0 : 2, // High ground negates low half-cover!
        attackModifier: hasHighGround ? 2 : 0,
        distanceFt: distFt,
        unobstructedRayRatio: ratio,
        reason: hasHighGround
          ? 'High Ground nullifies low barrier half-cover (+2 Attack).'
          : 'Target has Half-Cover behind low barrier (+2 Defense).'
      };
    }

    // Only 1 ray clear (e.g. only head exposed around a bunker slit) -> Three-Quarters Cover
    return {
      hasLoS: true,
      coverTier: 'THREE_QUARTERS',
      coverBonusToTarget: 5,
      attackModifier: hasHighGround ? 1 : 0,
      distanceFt: distFt,
      unobstructedRayRatio: ratio,
      reason: 'Target has Three-Quarters Cover (+5 Defense).'
    };
  }
}
