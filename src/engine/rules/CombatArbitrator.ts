/**
 * @file CombatArbitrator.ts
 * @description Canonical Tangent SF RP Combat Engine Arbitrator.
 * Strictly adheres to docs/game rules/operator/3.00 COMBAT.md:
 * - 2d10 core dice resolution
 * - Skill Rank action unlocking & focus bonuses (Rank 0 Full Round, Rank 1-5 1 action, Rank 6-10 2 actions, etc.)
 * - Subsequent action penalties (-5, -10, -15, -20, -25)
 * - Canonical 10-tier Size Scale (-32 Miniscule to +16 Colossal)
 * - Opposed roll resolution with DEFENDER WINS ALL TIES
 * - Unopposed roll resolution with CR 15 baseline
 * - Range categories with Point Blank (+5 Strike & Damage Advantage)
 * - Automatic fire & suppression mechanics
 */

export const SkillRank = {
  Untrained: 0, // Rank 0 (Full Round Action only)
  Novice: 1,    // Rank 1-5 (1st action at base score, +2 focus)
  Trained: 2,   // Rank 6-10 (2nd action at base -5, +3 focus)
  Adept: 2,     // Alias for Trained
  Expert: 3,    // Rank 11-15 (3rd action at base -10, +4 focus)
  Master: 4,    // Rank 16-20 (4th action at base -15, +5 focus)
  GrandMaster: 5, // Rank 21-25 (5th action at base -20, +6 focus)
  Pinnacle: 6   // Rank 26-30 (6th action at base -25, +7 focus)
} as const;

export type SkillRank = typeof SkillRank[keyof typeof SkillRank];

export interface ActionEconomyTier {
  rankMin: number;
  rankMax: number;
  title: string;
  actionsCount: number;
  isFullRoundOnly: boolean;
  focusBonus: number;
  actionPenalties: number[]; // e.g. [0, -5, -10]
}

export const ACTION_ECONOMY_TIERS: ActionEconomyTier[] = [
  { rankMin: 0, rankMax: 0, title: 'Untrained', actionsCount: 1, isFullRoundOnly: true, focusBonus: 0, actionPenalties: [0] },
  { rankMin: 1, rankMax: 5, title: 'Novice / Studied', actionsCount: 1, isFullRoundOnly: false, focusBonus: 2, actionPenalties: [0] },
  { rankMin: 6, rankMax: 10, title: 'Professional / Trained', actionsCount: 2, isFullRoundOnly: false, focusBonus: 3, actionPenalties: [0, -5] },
  { rankMin: 11, rankMax: 15, title: 'Expert', actionsCount: 3, isFullRoundOnly: false, focusBonus: 4, actionPenalties: [0, -5, -10] },
  { rankMin: 16, rankMax: 20, title: 'Master', actionsCount: 4, isFullRoundOnly: false, focusBonus: 5, actionPenalties: [0, -5, -10, -15] },
  { rankMin: 21, rankMax: 25, title: 'Grand Master', actionsCount: 5, isFullRoundOnly: false, focusBonus: 6, actionPenalties: [0, -5, -10, -15, -20] },
  { rankMin: 26, rankMax: 30, title: 'Pinnacle', actionsCount: 6, isFullRoundOnly: false, focusBonus: 7, actionPenalties: [0, -5, -10, -15, -20, -25] }
];

export const SizeCategory = {
  Miniscule: -32,
  Fine: -16,
  Diminutive: -8,
  Tiny: -4,
  Small: -2,
  Medium: 0,
  Large: 2,
  Huge: 4,
  Gargantuan: 8,
  Colossal: 16
} as const;

export type SizeCategory = typeof SizeCategory[keyof typeof SizeCategory];

export const RangeCategory = {
  Melee: 'melee',
  PointBlank: 'point_blank',
  Short: 'short',
  Medium: 'medium',
  Long: 'long',
  Extreme: 'extreme'
} as const;

export type RangeCategory = typeof RangeCategory[keyof typeof RangeCategory];

export interface RangeConfig {
  modifier: number;
  baseDC: number;
  advantageOnDamage: boolean;
  desc: string;
}

export const RANGE_CONFIGS: Record<RangeCategory, RangeConfig> = {
  [RangeCategory.Melee]: { modifier: 0, baseDC: 15, advantageOnDamage: false, desc: 'Within Reach (Tiny 2ft, Med 5ft, Large 10ft)' },
  [RangeCategory.PointBlank]: { modifier: 5, baseDC: 10, advantageOnDamage: true, desc: 'Within Reach (+5 Strike, Ballistic/Energy Damage rolled with Advantage)' },
  [RangeCategory.Short]: { modifier: 0, baseDC: 15, advantageOnDamage: false, desc: 'Base Listed Range' },
  [RangeCategory.Medium]: { modifier: -5, baseDC: 20, advantageOnDamage: false, desc: 'Up to 2x Base Range' },
  [RangeCategory.Long]: { modifier: -10, baseDC: 25, advantageOnDamage: false, desc: 'Up to 5x Base Range' },
  [RangeCategory.Extreme]: { modifier: -15, baseDC: 30, advantageOnDamage: false, desc: 'Up to 10x Base Range' }
};

export class CombatArbitrator {
  /**
   * Retrieves the canonical action economy tier for a given Skill Rank (0 to 30).
   */
  public getActionTier(skillRank: number): ActionEconomyTier {
    const clamped = Math.max(0, Math.min(30, Math.floor(skillRank)));
    const tier = ACTION_ECONOMY_TIERS.find(t => clamped >= t.rankMin && clamped <= t.rankMax);
    return tier || ACTION_ECONOMY_TIERS[0];
  }

  /**
   * Calculates the Multiple Attack Penalty (subsequent action penalty) for a given attack index.
   * Action 0: 0 penalty
   * Action 1: -5 penalty
   * Action 2: -10 penalty
   * Action 3: -15 penalty
   * Action 4: -20 penalty
   * Action 5: -25 penalty
   */
  public calculateMAP(_rank: number, attackIndex: number): number {
    if (attackIndex <= 0) return 0;
    const penaltySteps = [0, -5, -10, -15, -20, -25];
    return penaltySteps[attackIndex] !== undefined ? penaltySteps[attackIndex] : -25;
  }

  /**
   * Resolves an Opposed Combat Roll.
   * Rule: Attacker ability + combat skill vs Defender agility + defense skill.
   * CRITICAL CANONICAL RULE: "DEFENDER WINS ALL TIES".
   */
  public resolveOpposedRoll(attackerTotal: number, defenderTotal: number): {
    isHit: boolean;
    margin: number;
    winner: 'attacker' | 'defender';
  } {
    const margin = attackerTotal - defenderTotal;
    // Defender wins all ties!
    const isHit = margin > 0;
    return {
      isHit,
      margin,
      winner: isHit ? 'attacker' : 'defender'
    };
  }

  /**
   * Resolves an Unopposed Combat Roll (target surprised, still, or not defending).
   * Base DC is CR 15 (Average for typical Medium target at Short range).
   */
  public calculateUnopposedDC(
    targetSize: number = SizeCategory.Medium,
    range: RangeCategory = RangeCategory.Short,
    targetMovementFt: number = 0,
    isTargetRunning: boolean = false,
    isTargetTotalDefense: boolean = false
  ): number {
    const rangeConfig = RANGE_CONFIGS[range] || RANGE_CONFIGS[RangeCategory.Short];
    let dc = rangeConfig.baseDC;

    // Size modifier: target size adds to DC (larger targets are easier to hit, so size bonus reduces DC; smaller targets increase DC)
    dc -= targetSize;

    // Target Movement modifiers
    if (isTargetRunning) dc += 2;
    if (targetMovementFt >= 40) {
      dc += 4;
    } else if (targetMovementFt >= 20) {
      dc += 2;
    }
    if (isTargetTotalDefense) dc += 4;

    return Math.max(5, dc);
  }

  /**
   * Calculates Target Size Mod vs Attacker Size Mod curve.
   */
  public calculateSizeModifier(attackerSize: number, targetSize: number): number {
    return targetSize - attackerSize;
  }

  /**
   * Calculates Line of Sight Cover modifiers.
   */
  public calculateCoverModifier(visibilityRatio: number): number {
    if (visibilityRatio >= 0.9) return 0;       // No Cover
    if (visibilityRatio >= 0.5) return -2;      // Half Cover
    if (visibilityRatio > 0.0) return -5;       // Three-Quarters Cover
    return -100; // Total Concealment
  }

  /**
   * Evaluates Automatic Fire:
   * - Burst Fire (Short): 3 rounds, +1 Strike.
   * - Full Auto (Long): 10+ rounds, -1 recoil per 10 rounds.
   */
  public resolveAutoFire(
    mode: 'single' | 'burst' | 'full_auto',
    roundsFired: number,
    attackMargin: number,
    initialHitPenetratedDR: boolean
  ): {
    attackBonus: number;
    recoilPenalty: number;
    totalBulletsHit: number;
    extraDamageDiceCount: number;
  } {
    if (mode === 'burst') {
      return {
        attackBonus: 1,
        recoilPenalty: 0,
        totalBulletsHit: attackMargin > 0 ? 1 : 0,
        extraDamageDiceCount: 0
      };
    }

    if (mode === 'full_auto') {
      const recoilPenalty = -Math.floor(roundsFired / 10);
      if (attackMargin <= 0) {
        return { attackBonus: 0, recoilPenalty, totalBulletsHit: 0, extraDamageDiceCount: 0 };
      }
      const totalBulletsHit = Math.min(roundsFired, 1 + attackMargin);
      const extraDamageDiceCount = initialHitPenetratedDR ? Math.max(0, totalBulletsHit - 1) : 0;
      return {
        attackBonus: 0,
        recoilPenalty,
        totalBulletsHit,
        extraDamageDiceCount
      };
    }

    return { attackBonus: 0, recoilPenalty: 0, totalBulletsHit: attackMargin > 0 ? 1 : 0, extraDamageDiceCount: 0 };
  }

  /**
   * Combines all circumstantial modifiers for a final To-Hit delta package.
   */
  public buildToHitPackage(
    baseSkill: number,
    skillRank: number,
    attackIndex: number,
    attackerSize: number,
    targetSize: number,
    visibilityRatio: number,
    range: RangeCategory = RangeCategory.Short,
    options: {
      isAiming?: boolean;
      aimRounds?: number;
      isCharging?: boolean;
      isFlanking?: boolean;
      hasHighGround?: boolean;
      isSneakAttack?: boolean;
    } = {}
  ): {
    finalTarget: number;
    mapPenalty: number;
    focusBonus: number;
    sizeMod: number;
    coverMod: number;
    rangeMod: number;
    aimBonus: number;
    chargeMod: number;
    highGroundBonus: number;
    flankingBonus: number;
    sneakAttackPenalty: number;
    advantageOnDamage: boolean;
  } {
    const tier = this.getActionTier(skillRank);
    const mapPenalty = this.calculateMAP(skillRank, attackIndex);
    const focusBonus = tier.focusBonus;
    const sizeMod = this.calculateSizeModifier(attackerSize, targetSize);
    const coverMod = this.calculateCoverModifier(visibilityRatio);
    const rangeConfig = RANGE_CONFIGS[range] || RANGE_CONFIGS[RangeCategory.Short];
    const rangeMod = rangeConfig.modifier;

    const maxAimBonus = Math.max(2, Math.floor(skillRank / 2));
    const aimBonus = options.isAiming ? Math.min(maxAimBonus, (options.aimRounds || 1) * 2) : 0;

    const chargeMod = options.isCharging ? -2 : 0;
    const highGroundBonus = options.hasHighGround ? 2 : 0;
    const flankingBonus = options.isFlanking ? 2 : 0;
    const sneakAttackPenalty = options.isSneakAttack ? -5 : 0;

    const finalTarget = baseSkill + mapPenalty + focusBonus + sizeMod + coverMod + rangeMod + aimBonus + chargeMod + highGroundBonus + flankingBonus + sneakAttackPenalty;

    return {
      finalTarget,
      mapPenalty,
      focusBonus,
      sizeMod,
      coverMod,
      rangeMod,
      aimBonus,
      chargeMod,
      highGroundBonus,
      flankingBonus,
      sneakAttackPenalty,
      advantageOnDamage: rangeConfig.advantageOnDamage || Boolean(options.isSneakAttack)
    };
  }
}
