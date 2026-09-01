/**
 * @file CombatArbitrator.ts
 * @description Stage 5.4: Action scaling and size physics.
 * Automates Tangent mechanics for Multiple Attack Penalties (MAP) 
 * based on Skill Rank and computes volumetric target scaling mathematically.
 */

export const SkillRank = {
  Untrained: 0, // Rank 0-2
  Novice: 1,    // Rank 3-5
  Adept: 2,     // Rank 6-8
  Expert: 3,    // Rank 9-11
  Pinnacle: 4   // Rank 12+
} as const;

export type SkillRank = typeof SkillRank[keyof typeof SkillRank];

export const SizeCategory = {
  Diminutive: -4,
  Tiny: -2,
  Small: -1,
  Medium: 0,
  Large: 1,
  Huge: 2,
  Gargantuan: 4,
  Colossal: 8,
  MegaColossal: 16
} as const;

export type SizeCategory = typeof SizeCategory[keyof typeof SizeCategory];

export class CombatArbitrator {
  /**
   * Calculates the Multiple Attack Penalty (MAP) applied to a dice roll.
   * Tangent rules reduce penalty for subsequent attacks as mastery increases.
   */
  public calculateMAP(rank: SkillRank, attackIndex: number): number {
    if (attackIndex === 0) return 0; // First attack never has MAP

    const mapScaleMatrix: Record<number, number> = {
      [SkillRank.Untrained]: -10,
      [SkillRank.Novice]: -5,
      [SkillRank.Adept]: -4,
      [SkillRank.Expert]: -3,
      [SkillRank.Pinnacle]: -2
    };

    const penaltyPerAttack = mapScaleMatrix[rank] ?? -10;
    return penaltyPerAttack * attackIndex;
  }

  /**
   * Calculates Target Size Mod vs Attacker Size Mod curve.
   */
  public calculateSizeModifier(attackerSize: number, targetSize: number): number {
    return targetSize - attackerSize;
  }

  /**
   * Calculates line of sight cover modifiers based on raycast visibility.
   */
  public calculateCoverModifier(visibilityRatio: number): number {
    if (visibilityRatio >= 0.9) return 0;       // No Cover
    if (visibilityRatio >= 0.5) return -2;      // Half Cover
    if (visibilityRatio > 0.0) return -5;       // Three-Quarters Cover
    return -100; // Total Concealment
  }

  /**
   * Combines all circumstantial modifiers for a final To-Hit delta.
   */
  public buildToHitPackage(
    baseSkill: number, 
    rank: SkillRank, 
    attackIndex: number, 
    attackerSize: number, 
    targetSize: number, 
    visibilityRatio: number
  ): { finalTarget: number, mapPenalty: number, sizeMod: number, coverMod: number } {
    const mapPenalty = this.calculateMAP(rank, attackIndex);
    const sizeMod = this.calculateSizeModifier(attackerSize, targetSize);
    const coverMod = this.calculateCoverModifier(visibilityRatio);

    const finalTarget = baseSkill + mapPenalty + sizeMod + coverMod;

    return {
      finalTarget,
      mapPenalty,
      sizeMod,
      coverMod
    };
  }
}
