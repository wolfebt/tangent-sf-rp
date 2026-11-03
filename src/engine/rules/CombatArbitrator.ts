/**
 * @file CombatArbitrator.ts
 * @description Canonical Tangent SF RP Combat Engine Arbitrator.
 * Strictly adheres to docs/game_rules/operator/3.00 COMBAT.md:
 * - 2d10 core dice resolution
 * - Skill Rank action unlocking & focus bonuses (Rank 0 Full Round, Rank 1-5 1 action, Rank 6-10 2 actions, etc.)
 * - Subsequent action penalties (-5, -10, -15, -20, -25)
 * - Canonical Size Scale (-32 Miniscule to +256 MegaColossal) with relative tier scaling
 * - Opposed roll resolution with DEFENDER WINS ALL TIES
 * - Unopposed roll resolution with CR 15 baseline
 * - Range categories with Point Blank (+5 Strike & Damage Advantage) and doubled automatic-fire range penalties
 * - Precision Strike Feature Chain (feature-gated single-strike consolidation: 2x/3x/4x Base Weapon Dice; zero AP mode, zero Grazing Protocol)
 * - Granular Anatomical Called Shot penalties (-1 Torso to -5 Eye/Digit)
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

export type SkillActionTier = ActionEconomyTier;

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
  Colossal: 16,
  SuperGargantuan: 128,
  MegaColossal: 256
} as const;

export type SizeCategory = typeof SizeCategory[keyof typeof SizeCategory];

const CANONICAL_SIZE_STEP_LADDER: number[] = [-32, -16, -8, -4, -2, 0, 2, 4, 8, 16, 32, 64, 128, 256];

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
  baseCR: number;
  advantageOnDamage: boolean;
  desc: string;
}

export const RANGE_CONFIGS: Record<RangeCategory, RangeConfig> = {
  [RangeCategory.Melee]: { modifier: 0, baseDC: 15, baseCR: 15, advantageOnDamage: false, desc: 'Within Reach (Tiny 2ft, Med 5ft, Large 10ft)' },
  [RangeCategory.PointBlank]: { modifier: 5, baseDC: 10, baseCR: 10, advantageOnDamage: true, desc: 'Within Reach (+5 Strike, Ballistic/Energy Damage rolled with Advantage)' },
  [RangeCategory.Short]: { modifier: 0, baseDC: 15, baseCR: 15, advantageOnDamage: false, desc: 'Base Listed Range' },
  [RangeCategory.Medium]: { modifier: -5, baseDC: 20, baseCR: 20, advantageOnDamage: false, desc: 'Up to 2x Base Range' },
  [RangeCategory.Long]: { modifier: -10, baseDC: 25, baseCR: 25, advantageOnDamage: false, desc: 'Up to 5x Base Range' },
  [RangeCategory.Extreme]: { modifier: -15, baseDC: 30, baseCR: 30, advantageOnDamage: false, desc: 'Up to 10x Base Range' }
};

export const ANATOMICAL_CALLED_SHOT_PENALTIES: Record<string, number> = {
  torso: -1,
  chest: -2,
  abdomen: -2,
  vitals: -2,
  head: -2,
  arm: -2,
  arm_left: -2,
  arm_right: -2,
  leg: -2,
  leg_left: -2,
  leg_right: -2,
  wing: -2,
  tentacle: -2,
  fin: -2,
  upper_arm: -3,
  forearm: -3,
  thigh: -3,
  shin: -3,
  joint: -3,
  sub_limb: -3,
  neck: -4,
  throat: -4,
  groin: -4,
  pelvis: -4,
  hand: -4,
  foot: -4,
  eye: -5,
  eyes: -5,
  ear: -5,
  nose: -5,
  digit: -5,
  digits: -5,
  fingers: -5,
  toes: -5,
  micro: -5
};

export interface PrecisionStrikeResult {
  canConsolidate: boolean;
  isConsolidated: boolean;
  featureUsed: 'Precision Strike' | 'Improved Precision Strike' | 'Greater Precision Strike' | null;
  baseDiceMultiplier: 1 | 2 | 3 | 4;
}

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
   * Calculates penalty for consecutive Active Defenses (Dodge/Parry/Block) in the same combat round.
   * Per 3.00 COMBAT.md: Active defenses can be performed up to Defense Skill Rank actions per round.
   */
  public calculateDefensePenalty(reactionIndex: number): number {
    if (reactionIndex <= 0) return 0;
    return -5 * reactionIndex;
  }

  /**
   * Resolves an Opposed Combat Roll.
   * CRITICAL CANONICAL RULE: "DEFENDER WINS ALL TIES".
   */
  public resolveOpposedRoll(
    attackerTotal: number,
    defenderTotal: number,
    options: { isTargetDefenseless?: boolean } = {}
  ): {
    isHit: boolean;
    margin: number;
    winner: 'attacker' | 'defender';
    defenselessBonusDamage: number;
  } {
    const margin = attackerTotal - defenderTotal;
    const isHit = margin > 0;
    const defenselessBonusDamage = (options.isTargetDefenseless && isHit) ? Math.floor(margin / 2) : 0;
    return {
      isHit,
      margin,
      winner: isHit ? 'attacker' : 'defender',
      defenselessBonusDamage
    };
  }

  /**
   * Resolves an Unopposed Combat Roll (target surprised, still, or not defending).
   * Base CR is 15 (Average for typical Medium target at Short range).
   */
  public resolveUnopposedRoll(
    attackerTotal: number,
    cr: number,
    options: { isTargetDefenseless?: boolean } = {}
  ): {
    isHit: boolean;
    margin: number;
    winner: 'attacker' | 'target';
    defenselessBonusDamage: number;
  } {
    const margin = attackerTotal - cr;
    const isHit = margin > 0;
    const defenselessBonusDamage = (options.isTargetDefenseless && isHit) ? Math.floor(margin / 2) : 0;
    return {
      isHit,
      margin,
      winner: isHit ? 'attacker' : 'target',
      defenselessBonusDamage
    };
  }

  /**
   * Evaluates extra damage for defenseless targets (ambush, immobile, coup de grace, etc).
   * Canonical rule: Target with no defense suffers additional damage equal to half the amount of what the attack succeeded by.
   */
  public calculateDefenselessBonusDamage(attackMargin: number, isTargetDefenseless: boolean = false): number {
    if (!isTargetDefenseless || attackMargin <= 0) return 0;
    return Math.floor(attackMargin / 2);
  }

  /**
   * Calculates Unopposed CR/DC for a target.
   * Base CR is 15 (Average for typical Medium target at Short range).
   */
  public calculateUnopposedDC(
    targetSize: number = SizeCategory.Medium,
    range: RangeCategory = RangeCategory.Short,
    targetMovementFt: number = 0,
    isTargetRunning: boolean = false,
    isTargetTotalDefense: boolean = false
  ): number {
    const rangeConfig = RANGE_CONFIGS[range] || RANGE_CONFIGS[RangeCategory.Short];
    let cr = rangeConfig.baseCR;

    // Size modifier: larger targets reduce Defense CR; smaller targets increase Defense CR
    cr -= targetSize;

    // Target Movement modifiers
    if (isTargetRunning) cr += 2;
    if (targetMovementFt >= 40) {
      cr += 4;
    } else if (targetMovementFt >= 20) {
      cr += 2;
    }
    if (isTargetTotalDefense) cr += 4;

    return Math.max(5, cr);
  }

  public calculateUnopposedCR(
    targetSize: number = SizeCategory.Medium,
    range: RangeCategory = RangeCategory.Short,
    targetMovementFt: number = 0,
    isTargetRunning: boolean = false,
    isTargetTotalDefense: boolean = false
  ): number {
    return this.calculateUnopposedDC(targetSize, range, targetMovementFt, isTargetRunning, isTargetTotalDefense);
  }

  /**
   * Calculates Relative Size Modifier between Attacker and Target per 1.10 SCALING.md & 3.00 COMBAT.md.
   * Steps along the exponential size ladder so two combatants of equal scale get 0,
   * one size step apart gets +/-2, two steps +/-4, three steps +/-8, four steps +/-16, etc.
   */
  public calculateSizeModifier(attackerSize: number, targetSize: number): number {
    if (attackerSize === targetSize) return 0;
    const atkIdx = CANONICAL_SIZE_STEP_LADDER.indexOf(attackerSize);
    const tgtIdx = CANONICAL_SIZE_STEP_LADDER.indexOf(targetSize);
    if (atkIdx !== -1 && tgtIdx !== -1) {
      const stepDiff = tgtIdx - atkIdx;
      if (stepDiff === 0) return 0;
      const magnitude = Math.pow(2, Math.abs(stepDiff));
      return stepDiff > 0 ? magnitude : -magnitude;
    }
    return targetSize - attackerSize;
  }

  /**
   * Resolves granular anatomical Called Shot strike penalty per 3.00 COMBAT.md Section 6.C.
   */
  public getCalledShotPenalty(location?: string): number {
    if (!location) return -5;
    const normalized = String(location).trim().toLowerCase().replace(/[\s-]+/g, '_');
    return ANATOMICAL_CALLED_SHOT_PENALTIES[normalized] ?? -5;
  }

  /**
   * Resolves Feature-Gated Strike Consolidation per 1.08.CombatFeatures.D_W.md & 00.02 BASTION CORE FORMULAS:
   * Strike consolidation is NOT a baseline combat option open to all combatants, and Tangent does not use AP or Grazing Protocol.
   * Multiplying base weapon damage dice on a single Standard Action strike requires possessing:
   * - Precision Strike (Combat Skill 6+): 2x Base Weapon Damage Dice
   * - Improved Precision Strike (Precision Strike, Combat Skill 11+): 3x Base Weapon Damage Dice
   * - Greater Precision Strike (Improved Precision Strike, Combat Skill 16+): 4x Base Weapon Damage Dice
   */
  public resolvePrecisionStrike(
    combatSkillRank: number,
    features: Array<string | { id?: string; name?: string; title?: string }> = []
  ): PrecisionStrikeResult {
    const normalized = new Set<string>();
    for (const raw of features || []) {
      const idOrName = typeof raw === 'string'
        ? raw
        : String(raw?.id || raw?.name || raw?.title || '');
      const clean = idOrName
        .trim()
        .toLowerCase()
        .replace(/^(?:feature|combat)[-_]/, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
      if (clean) normalized.add(clean);
      if (typeof raw === 'object' && raw !== null && raw.name) {
        const cleanName = String(raw.name)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ' ')
          .trim();
        if (cleanName) normalized.add(cleanName);
      }
    }

    const hasBase = normalized.has('precision strike') || normalized.has('vital strike');
    const hasImproved = normalized.has('improved precision strike') || normalized.has('improved vital strike');
    const hasGreater = normalized.has('greater precision strike') || normalized.has('greater vital strike');

    if (hasGreater && hasImproved && hasBase && combatSkillRank >= 16) {
      return {
        canConsolidate: true,
        isConsolidated: true,
        featureUsed: 'Greater Precision Strike',
        baseDiceMultiplier: 4
      };
    }

    if (hasImproved && hasBase && combatSkillRank >= 11) {
      return {
        canConsolidate: true,
        isConsolidated: true,
        featureUsed: 'Improved Precision Strike',
        baseDiceMultiplier: 3
      };
    }

    if (hasBase && combatSkillRank >= 6) {
      return {
        canConsolidate: true,
        isConsolidated: true,
        featureUsed: 'Precision Strike',
        baseDiceMultiplier: 2
      };
    }

    return {
      canConsolidate: false,
      isConsolidated: false,
      featureUsed: null,
      baseDiceMultiplier: 1
    };
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
      isCalledShot?: boolean;
      calledShotLocation?: string;
      fireMode?: 'single' | 'burst' | 'full_auto';
      specializationBonus?: number;
      invocationBonus?: number;
      isTargetDefenseless?: boolean;
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
    calledShotPenalty: number;
    advantageOnDamage: boolean;
    isTargetDefenseless: boolean;
    maxAimBonus: number;
  } {
    const tier = this.getActionTier(skillRank);
    const mapPenalty = this.calculateMAP(skillRank, attackIndex);
    const focusBonus = tier.focusBonus;
    const sizeMod = this.calculateSizeModifier(attackerSize, targetSize);
    const coverMod = this.calculateCoverModifier(visibilityRatio);
    const rangeConfig = RANGE_CONFIGS[range] || RANGE_CONFIGS[RangeCategory.Short];
    let rangeMod = rangeConfig.modifier;
    if ((options.fireMode === 'burst' || options.fireMode === 'full_auto') && rangeMod < 0) {
      // Per 3.00 COMBAT.md Section 5: All Range Penalties beyond Short Range are DOUBLED during automatic fire
      rangeMod *= 2;
    }

    // Aiming bonus: up to half the effective attack skill (including specialization & invocation)
    const effectiveAttackSkill = baseSkill + (options.specializationBonus || 0) + (options.invocationBonus || 0);
    const maxAimBonus = Math.max(2, Math.floor(effectiveAttackSkill / 2));
    const aimBonus = options.isAiming ? Math.min(maxAimBonus, (options.aimRounds || 1) * 2) : 0;

    const chargeMod = options.isCharging ? -2 : 0;
    const highGroundBonus = options.hasHighGround ? 2 : 0;
    const flankingBonus = options.isFlanking ? 2 : 0;
    const sneakAttackPenalty = options.isSneakAttack ? -5 : 0;
    const calledShotPenalty = options.isCalledShot
      ? (options.calledShotLocation ? this.getCalledShotPenalty(options.calledShotLocation) : -5)
      : 0;

    const finalTarget = effectiveAttackSkill + mapPenalty + focusBonus + sizeMod + coverMod + rangeMod + aimBonus + chargeMod + highGroundBonus + flankingBonus + sneakAttackPenalty + calledShotPenalty;

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
      calledShotPenalty,
      advantageOnDamage: rangeConfig.advantageOnDamage || Boolean(options.isSneakAttack),
      isTargetDefenseless: Boolean(options.isTargetDefenseless),
      maxAimBonus
    };
  }
}
