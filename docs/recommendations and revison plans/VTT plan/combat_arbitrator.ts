/**
 * @file CombatArbitrator.ts
 * @description Stage 5.4: Action scaling and size physics.
 * Automates the Tangent mechanics for Multiple Attack Penalties (MAP) 
 * based on Skill Rank and computes volumetric target scaling mathematically.
 */

export enum SkillRank {
  Untrained = 0, // Rank 0-2
  Novice = 1,    // Rank 3-5
  Adept = 2,     // Rank 6-8
  Expert = 3,    // Rank 9-11
  Pinnacle = 4   // Rank 12+
}

export enum SizeCategory {
  Diminutive = -4,
  Tiny = -2,
  Small = -1,
  Medium = 0,
  Large = 1,
  Huge = 2,
  Gargantuan = 4,
  Colossal = 8,
  MegaColossal = 16
}

export class CombatArbitrator {

  /**
   * Calculates the Multiple Attack Penalty (MAP) applied to a dice roll.
   * Tangent rules reduce the penalty for subsequent attacks as the user achieves higher Mastery.
   * 
   * @param rank The attacker's proficiency rank with the weapon/skill.
   * @param attackIndex The 0-based index of the attack this turn (0 = first attack, 1 = second, etc.)
   */
  public calculateMAP(rank: SkillRank, attackIndex: number): number {
    if (attackIndex === 0) return 0; // First attack never has MAP

    // Multipliers for subsequent attacks based on rank
    const mapScaleMatrix = {
      [SkillRank.Untrained]: -10, // -10, -20, -30
      [SkillRank.Novice]: -5,     // -5, -10, -15
      [SkillRank.Adept]: -4,      // -4, -8, -12
      [SkillRank.Expert]: -3,     // -3, -6, -9
      [SkillRank.Pinnacle]: -2    // -2, -4, -6
    };

    const penaltyPerAttack = mapScaleMatrix[rank];
    
    // The penalty multiplies by the number of extra attacks taken
    return penaltyPerAttack * attackIndex;
  }

  /**
   * Automates the Target Size Mod vs Attacker Size Mod physics curve.
   * Example: A Colossal (8) turret firing at a Medium (0) infantry is 0 - 8 = -8 penalty to hit.
   * Example: A Medium (0) infantry firing at a MegaColossal (16) titan is 16 - 0 = +16 bonus to hit.
   */
  public calculateSizeModifier(attackerSize: SizeCategory, targetSize: SizeCategory): number {
    return targetSize - attackerSize;
  }

  /**
   * Calculates line of sight cover modifiers based on raycast collision results
   * gathered from the WGSL Compute Vision module (Stage 3).
   * @param visibilityRatio Float between 0.0 (Invisible) and 1.0 (Fully Visible)
   */
  public calculateCoverModifier(visibilityRatio: number): number {
    if (visibilityRatio >= 0.9) return 0;       // No Cover
    if (visibilityRatio >= 0.5) return -2;      // Half Cover
    if (visibilityRatio > 0.0) return -5;       // Three-Quarters Cover
    return -100; // Total Concealment (Requires blind fire/AoE)
  }

  /**
   * Core execution pipeline combining all circumstantial modifiers for a final To-Hit delta.
   */
  public buildToHitPackage(
    baseSkill: number, 
    rank: SkillRank, 
    attackIndex: number, 
    attackerSize: SizeCategory, 
    targetSize: SizeCategory, 
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