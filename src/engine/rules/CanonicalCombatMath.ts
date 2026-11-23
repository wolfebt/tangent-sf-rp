/**
 * @file CanonicalCombatMath.ts
 * @description Canonical Tangent SF RP v6 Combat, Dice, Armor Stacking, Mitigation & Size Math.
 * Single source of truth shared across DamagePipeline, DBMFunctionRegistry, BastionAgent,
 * adeEngineBridge, autoCombatResolver, encounterSimService, rulesAdjudicatorService, and useCombatController.
 * Strictly conforms to docs/game_rules/architect/00.02 BASTION CORE FORMULAS & ERRATA ENGINE.md
 * and docs/game_rules/operator/3.00 COMBAT.md.
 */

export const CANONICAL_DEFAULT_DEFENSE_CR = 15;
export const CANONICAL_CRIT_ROLL_BONUS = 10;
export const CANONICAL_FUMBLE_FLAT_ROLL = -10;
export const CANONICAL_CRIT_DAMAGE_MULTIPLIER = 2;

export const DR_BYPASS_DAMAGE_TYPES = new Set<string>([
  'bleed',
  'spectral',
  'phase',
  'sonic',
  'sound',
  'dimensional',
  'mental',
  'psyche',
  'psionic'
]);

export const DR_HALVING_DAMAGE_TYPES = new Set<string>([
  'force',
  'force_pulse',
  'concussive',
  'impact'
]);

export const FULL_MITIGATION_BYPASS_TYPES = new Set<string>([
  'bleed',
  'overchannel_burn'
]);

export interface CanonicalSizeEntry {
  id: string;
  label: string;
  scaleMultiplier: number;
  strikeMod: number;
  modifier: number;
  defenseMod: number;
  baseCR: number;
  rawBaseCR: number;
}

export const CANONICAL_SIZE_TABLE: readonly CanonicalSizeEntry[] = [
  { id: 'miniscule', label: 'Miniscule (< 1in)', scaleMultiplier: 0.03125, strikeMod: -32, modifier: -32, defenseMod: 32, baseCR: 47, rawBaseCR: 47 },
  { id: 'fine', label: 'Fine (< 6in)', scaleMultiplier: 0.0625, strikeMod: -16, modifier: -16, defenseMod: 16, baseCR: 31, rawBaseCR: 31 },
  { id: 'diminutive', label: 'Diminutive (< 1ft)', scaleMultiplier: 0.125, strikeMod: -8, modifier: -8, defenseMod: 8, baseCR: 23, rawBaseCR: 23 },
  { id: 'tiny', label: 'Tiny (< 2ft)', scaleMultiplier: 0.25, strikeMod: -4, modifier: -4, defenseMod: 4, baseCR: 19, rawBaseCR: 19 },
  { id: 'small', label: 'Small (< 4ft)', scaleMultiplier: 0.5, strikeMod: -2, modifier: -2, defenseMod: 2, baseCR: 17, rawBaseCR: 17 },
  { id: 'medium', label: 'Medium (Base < 8ft)', scaleMultiplier: 1, strikeMod: 0, modifier: 0, defenseMod: 0, baseCR: 15, rawBaseCR: 15 },
  { id: 'large', label: 'Large (< 16ft)', scaleMultiplier: 2, strikeMod: 2, modifier: 2, defenseMod: -2, baseCR: 13, rawBaseCR: 13 },
  { id: 'huge', label: 'Huge (< 32ft)', scaleMultiplier: 4, strikeMod: 4, modifier: 4, defenseMod: -4, baseCR: 11, rawBaseCR: 11 },
  { id: 'gargantuan', label: 'Gargantuan (< 64ft)', scaleMultiplier: 8, strikeMod: 8, modifier: 8, defenseMod: -8, baseCR: 7, rawBaseCR: 7 },
  { id: 'colossal', label: 'Colossal (< 128ft)', scaleMultiplier: 16, strikeMod: 16, modifier: 16, defenseMod: -16, baseCR: 5, rawBaseCR: -1 },
  { id: 'enormous', label: 'Enormous (< 256ft)', scaleMultiplier: 40, strikeMod: 32, modifier: 32, defenseMod: -32, baseCR: 5, rawBaseCR: -17 },
  { id: 'titanic', label: 'Titanic (< 512ft)', scaleMultiplier: 80, strikeMod: 64, modifier: 64, defenseMod: -64, baseCR: 5, rawBaseCR: -49 },
  { id: 'super_gargantuan', label: 'SuperGargantuan (Behemoth)', scaleMultiplier: 160, strikeMod: 128, modifier: 128, defenseMod: -128, baseCR: 5, rawBaseCR: -113 },
  { id: 'mega_colossal', label: 'MegaColossal (Titan)', scaleMultiplier: 320, strikeMod: 256, modifier: 256, defenseMod: -256, baseCR: 5, rawBaseCR: -241 }
];

export const CANONICAL_SKILL_ALIASES: Record<string, readonly string[]> = {
  Alertness: ['Alertness', 'Perception', 'Awareness'],
  Computers: ['Computers', 'Slicing', 'Hacking'],
  Ballistic: ['Ballistic', 'Ballistics', 'Firearms', 'Gunner'],
  Melee: ['Melee', 'Kinetics', 'Unarmed'],
  Diplomacy: ['Diplomacy', 'Etiquette', 'Persuasion'],
  Athletics: ['Athletics', 'Endurance', 'Acrobatics'],
  Insight: ['Insight', 'Sense Motive'],
  Metaphysics: ['Metaphysics', 'Arcane', 'Psionics', 'Magic']
};

/**
 * Resolves a skill rank checking the canonical Tangent v6 key first,
 * then backward-compatible legacy keys (e.g. Computers <-> Slicing).
 */
export function resolveSkillRank(
  skillsMap: Record<string, any> | null | undefined,
  canonicalSkill: string
): number | undefined {
  if (!skillsMap || typeof skillsMap !== 'object') return undefined;

  const aliases = CANONICAL_SKILL_ALIASES[canonicalSkill] || [canonicalSkill];
  const reverseGroup = Object.entries(CANONICAL_SKILL_ALIASES).find(([, list]) =>
    list.some((alias) => alias.toLowerCase() === canonicalSkill.toLowerCase())
  );
  const candidates = reverseGroup
    ? Array.from(new Set([canonicalSkill, reverseGroup[0], ...reverseGroup[1]]))
    : Array.from(new Set([canonicalSkill, ...aliases]));

  for (const key of candidates) {
    if (skillsMap[key] !== undefined && skillsMap[key] !== null && skillsMap[key] !== '') {
      const val = Number(skillsMap[key]);
      if (Number.isFinite(val)) return val;
    }
  }

  const lowerCandidates = candidates.map((c) => c.toLowerCase());
  for (const [k, raw] of Object.entries(skillsMap)) {
    if (lowerCandidates.includes(k.toLowerCase()) && raw !== undefined && raw !== null && raw !== '') {
      const val = Number(raw);
      if (Number.isFinite(val)) return val;
    }
  }

  return undefined;
}

export interface DiceRollInput {
  d1?: number | undefined;
  d2?: number | undefined;
  diceOverride?: [number, number] | { d1?: number; d2?: number } | null | undefined;
  modifier?: number | undefined;
  targetCR?: number | undefined;
  isOpposed?: boolean | undefined;
  critRangeSize?: number | undefined;
  fumbleRangeSize?: number | undefined;
}

export interface Tangent2d10Result {
  d1: number;
  d2: number;
  rawDiceSum: number;
  effectiveDiceSum: number;
  modifier: number;
  total: number;
  targetCR: number;
  margin: number;
  isDouble: boolean;
  isCrit: boolean;
  isFumble: boolean;
  isSuccess: boolean;
}

/**
 * Resolves a Tangent SF RP 2d10 check or attack roll.
 * - Critical Triumph (Double 10s by default): +10 added to rolled dice sum (20 -> 30).
 * - Critical Fumble (Double 1s by default): rolled dice replaced with flat -10.
 * - Opposed attacks: Defender Wins All Ties (requires total > targetCR, unless Crit auto-hit / Fumble auto-miss).
 * - Static CR checks: meets or exceeds (total >= targetCR).
 */
export function resolveTangent2d10Check(params: DiceRollInput = {}): Tangent2d10Result {
  let d1 = params.d1;
  let d2 = params.d2;

  if (Array.isArray(params.diceOverride) && params.diceOverride.length >= 2) {
    d1 = params.diceOverride[0];
    d2 = params.diceOverride[1];
  } else if (params.diceOverride && typeof params.diceOverride === 'object' && !Array.isArray(params.diceOverride)) {
    d1 = params.diceOverride.d1 ?? d1;
    d2 = params.diceOverride.d2 ?? d2;
  }

  const rolledD1 = Number.isFinite(Number(d1)) ? Number(d1) : (Math.floor(Math.random() * 10) + 1);
  const rolledD2 = Number.isFinite(Number(d2)) ? Number(d2) : (Math.floor(Math.random() * 10) + 1);

  const rawDiceSum = rolledD1 + rolledD2;
  const isDouble = rolledD1 === rolledD2;
  const critRangeSize = Math.max(1, Math.floor(params.critRangeSize ?? 1));
  const fumbleRangeSize = Math.max(1, Math.floor(params.fumbleRangeSize ?? 1));
  const modifier = Number.isFinite(Number(params.modifier)) ? Number(params.modifier) : 0;
  const targetCR = Number.isFinite(Number(params.targetCR)) ? Number(params.targetCR) : CANONICAL_DEFAULT_DEFENSE_CR;
  const isOpposed = params.isOpposed !== undefined ? Boolean(params.isOpposed) : true;

  const isCrit = rawDiceSum >= (21 - critRangeSize);
  const isFumble = !isCrit && rawDiceSum <= (1 + fumbleRangeSize);

  const effectiveDiceSum = isCrit
    ? rawDiceSum + CANONICAL_CRIT_ROLL_BONUS
    : isFumble
      ? CANONICAL_FUMBLE_FLAT_ROLL
      : rawDiceSum;

  const total = effectiveDiceSum + modifier;
  const margin = total - targetCR;

  const isSuccess = isFumble
    ? false
    : isCrit
      ? true
      : isOpposed
        ? total > targetCR
        : total >= targetCR;

  return {
    d1: rolledD1,
    d2: rolledD2,
    rawDiceSum,
    effectiveDiceSum,
    modifier,
    total,
    targetCR,
    margin,
    isDouble,
    isCrit,
    isFumble,
    isSuccess
  };
}

export interface HitOddsResult {
  hitProbabilityPercent: number;
  strictOpposedWinPercent: number;
  critProbabilityPercent: number;
  fumbleProbabilityPercent: number;
}

/**
 * Exact 100-outcome enumeration over 2d10 using resolveTangent2d10Check.
 */
export function compute2d10HitOdds(
  attackBonus: number,
  targetCR: number,
  options: { isOpposed?: boolean; critRangeSize?: number; fumbleRangeSize?: number } = {}
): HitOddsResult {
  const isOpposed = options.isOpposed !== undefined ? options.isOpposed : true;
  const critRangeSize = options.critRangeSize ?? 1;
  const fumbleRangeSize = options.fumbleRangeSize ?? 1;

  let hits = 0;
  let strictOpposedWins = 0;
  let crits = 0;
  let fumbles = 0;

  for (let d1 = 1; d1 <= 10; d1++) {
    for (let d2 = 1; d2 <= 10; d2++) {
      const check = resolveTangent2d10Check({
        d1,
        d2,
        modifier: attackBonus,
        targetCR,
        isOpposed,
        critRangeSize,
        fumbleRangeSize
      });
      if (check.isSuccess) hits++;
      if (!check.isFumble && (check.isCrit || check.total > targetCR)) strictOpposedWins++;
      if (check.isCrit) crits++;
      if (check.isFumble) fumbles++;
    }
  }

  return {
    hitProbabilityPercent: hits,
    strictOpposedWinPercent: strictOpposedWins,
    critProbabilityPercent: crits,
    fumbleProbabilityPercent: fumbles
  };
}

/**
 * Cross-Domain Armor Stacking (Diminishing Returns):
 * Highest single layer DR + Math.ceil(layerDR / 5) per additional layer.
 */
export function calculateCrossDomainArmorDR(
  layers: readonly number[] = [],
  stackingMode: 'diminishing_returns' | 'single_highest' = 'diminishing_returns'
): number {
  const positiveLayers = (Array.isArray(layers) ? layers : [])
    .map((v) => Math.max(0, Number(v) || 0))
    .filter((v) => v > 0)
    .sort((a, b) => b - a);

  const highest = positiveLayers[0];
  if (highest === undefined) return 0;
  if (stackingMode === 'single_highest') return highest;

  let extra = 0;
  for (let i = 1; i < positiveLayers.length; i++) {
    const val = positiveLayers[i] ?? 0;
    extra += Math.ceil(val / 5);
  }
  return highest + extra;
}

export interface DamageMitigationInput {
  rawDamage: number;
  baseWeaponRaw?: number | undefined;
  sneakAttackBonusRaw?: number | undefined;
  armorLayers?: readonly number[] | undefined;
  penetration?: number | undefined;
  armorPenetration?: number | undefined;
  damageType?: string | undefined;
  isOverchannelBurn?: boolean | undefined;
  staminaToughness?: number | undefined;
  stackingMode?: 'diminishing_returns' | 'single_highest' | undefined;
  defenselessBonusDamage?: number | undefined;
}

export interface DamageMitigationResult {
  rawDamageInput: number;
  effectiveRawDamage: number;
  defenselessBonusDamage: number;
  sneakAttackBonusApplied: number;
  singleHighestDr: number;
  diminishingReturnsDr: number;
  stackedArmorDr: number;
  typeAdjustedDr: number;
  effectiveArmorDr: number;
  staminaSoak: number;
  totalMitigation: number;
  netDamage: number;
  bypassesAllMitigation: boolean;
}

/**
 * Canonical damage mitigation pipeline:
 * 1) Stack armor layers (diminishing returns)
 * 2) Apply damage-type DR bypass (Bleed, Spectral/Phase, Sonic, Dimensional, Mental/Psionic) or halving (Force, Concussive)
 * 3) Subtract clamped Penetration >= 0 (AFTER halving)
 * 4) Gate Sneak Attack bonus on baseWeaponRaw - effectiveArmorDr >= 1
 * 5) Subtract Stamina Base Toughness down to 0 floor (never minimum 1)
 */
export function calculateDamageMitigation(input: DamageMitigationInput): DamageMitigationResult {
  const dmgType = String(input.damageType || 'kinetic').trim().toLowerCase();
  const bypassesAllMitigation =
    FULL_MITIGATION_BYPASS_TYPES.has(dmgType) || Boolean(input.isOverchannelBurn);

  const layers = input.armorLayers || [];
  const singleHighestDr = calculateCrossDomainArmorDR(layers, 'single_highest');
  const diminishingReturnsDr = calculateCrossDomainArmorDR(layers, 'diminishing_returns');
  const stackedArmorDr =
    input.stackingMode === 'single_highest' ? singleHighestDr : diminishingReturnsDr;

  let typeAdjustedDr = stackedArmorDr;
  if (bypassesAllMitigation || DR_BYPASS_DAMAGE_TYPES.has(dmgType)) {
    typeAdjustedDr = 0;
  } else if (DR_HALVING_DAMAGE_TYPES.has(dmgType)) {
    typeAdjustedDr = Math.floor(stackedArmorDr / 2);
  }

  const rawPen = input.penetration ?? input.armorPenetration ?? 0;
  const clampedPen = Math.max(0, Number.isFinite(Number(rawPen)) ? Number(rawPen) : 0);
  const effectiveArmorDr = bypassesAllMitigation ? 0 : Math.max(0, typeAdjustedDr - clampedPen);

  let effectiveRawDamage = Math.max(0, Number(input.rawDamage) || 0);
  let sneakAttackBonusApplied = 0;
  if (input.sneakAttackBonusRaw !== undefined && input.sneakAttackBonusRaw > 0) {
    const sneak = Math.max(0, Number(input.sneakAttackBonusRaw) || 0);
    const baseWeaponRaw =
      input.baseWeaponRaw !== undefined
        ? Math.max(0, Number(input.baseWeaponRaw) || 0)
        : Math.max(0, effectiveRawDamage - sneak);
    if (baseWeaponRaw - effectiveArmorDr >= 1) {
      sneakAttackBonusApplied = sneak;
      effectiveRawDamage = baseWeaponRaw + sneak;
    } else {
      sneakAttackBonusApplied = 0;
      effectiveRawDamage = baseWeaponRaw;
    }
  }

  const defenselessBonus = Math.max(0, Number(input.defenselessBonusDamage) || 0);
  const totalRaw = effectiveRawDamage + defenselessBonus;
  const penetrating = Math.max(0, totalRaw - effectiveArmorDr);
  const toughness = bypassesAllMitigation ? 0 : Math.max(0, Number(input.staminaToughness) || 0);

  let netDamage = 0;
  let staminaSoak = 0;
  if (penetrating > 0) {
    netDamage = Math.max(0, penetrating - toughness);
    staminaSoak = penetrating - netDamage;
  }

  return {
    rawDamageInput: Number(input.rawDamage) || 0,
    effectiveRawDamage,
    defenselessBonusDamage: defenselessBonus,
    sneakAttackBonusApplied,
    singleHighestDr,
    diminishingReturnsDr,
    stackedArmorDr,
    typeAdjustedDr,
    effectiveArmorDr,
    staminaSoak,
    totalMitigation: effectiveArmorDr + staminaSoak,
    netDamage,
    bypassesAllMitigation
  };
}

export interface PoolRoutingInput {
  netDamage: number;
  isSynthetic: boolean;
  isLethal?: boolean | undefined;
  isCritical?: boolean | undefined;
  damageType?: string | undefined;
  isOverchannelBurn?: boolean | undefined;
  directToHealth?: boolean | undefined;
  attemptedReduction?: boolean | undefined;
  hasVitalityPool?: boolean | undefined;
  currentVitality?: number | undefined;
  currentHealth?: number | undefined;
  currentStructure?: number | undefined;
  staminaScore?: number | undefined;
  currentStabilityPoints?: number | undefined;
}

export interface PoolRoutingResult {
  netDamage: number;
  vitalityDamage: number;
  healthDamage: number;
  structureDamage: number;
  remainingVitality: number;
  remainingHealth: number;
  remainingStructure: number;
  entersMortalityState: boolean;
  isDead: boolean;
  stabilityPointsRemaining: number;
  maxStabilityPoints: number;
  syntheticNonLethalImmune: boolean;
}

/**
 * Routes net post-mitigation damage into Synthetic Structure or Organic Vitality -> Health -> Mortality State.
 */
export function routePoolDamage(input: PoolRoutingInput): PoolRoutingResult {
  let netDamage = Math.max(0, Number(input.netDamage) || 0);
  const isSynthetic = Boolean(input.isSynthetic);
  const isLethal = input.isLethal !== false;
  const isCritical = Boolean(input.isCritical);
  const dmgType = String(input.damageType || 'kinetic').trim().toLowerCase();
  const bypassesVitality = Boolean(
    (isCritical && isLethal) ||
      Boolean(input.isOverchannelBurn) ||
      Boolean(input.directToHealth) ||
      dmgType === 'bleed'
  );
  const hasVitalityPool = input.hasVitalityPool !== undefined ? Boolean(input.hasVitalityPool) : true;
  const curVit = Math.max(0, Number(input.currentVitality) || 0);
  const curHp = Math.max(0, Number(input.currentHealth ?? 30) || 0);
  const curStruct = Math.max(0, Number(input.currentStructure ?? 60) || 0);
  const staScore = Number(input.staminaScore) || 0;
  const maxStability = Math.max(1, staScore + 5);

  let vitalityDamage = 0;
  let healthDamage = 0;
  let structureDamage = 0;
  let syntheticNonLethalImmune = false;

  if (isSynthetic) {
    if (isLethal) {
      structureDamage = netDamage;
      healthDamage = netDamage;
    } else {
      netDamage = 0;
      syntheticNonLethalImmune = true;
    }
  } else if (dmgType === 'concussive' || dmgType === 'impact') {
    if (input.attemptedReduction === false && hasVitalityPool) {
      vitalityDamage = Math.min(curVit, netDamage);
      healthDamage = Math.max(0, netDamage - curVit);
    } else {
      const halfVit = Math.floor(netDamage / 2);
      const halfHea = netDamage - halfVit;
      if (hasVitalityPool) {
        const vitSpill = Math.max(0, halfVit - curVit);
        vitalityDamage = Math.min(curVit, halfVit);
        healthDamage = halfHea + vitSpill;
      } else {
        vitalityDamage = halfVit;
        healthDamage = halfHea;
      }
    }
  } else if (!bypassesVitality && hasVitalityPool) {
    if (netDamage <= curVit) {
      vitalityDamage = netDamage;
      healthDamage = 0;
    } else {
      vitalityDamage = curVit;
      healthDamage = netDamage - curVit;
    }
  } else {
    healthDamage = netDamage;
    vitalityDamage = 0;
  }

  const remainingVitality = isSynthetic ? 0 : Math.max(0, curVit - vitalityDamage);
  const remainingStructure = isSynthetic ? Math.max(0, curStruct - structureDamage) : 0;
  const basePoolBefore = isSynthetic ? curStruct : curHp;
  const rawRemainingHp = isSynthetic ? curStruct - structureDamage : curHp - healthDamage;
  const remainingHealth = isSynthetic ? remainingStructure : Math.max(0, rawRemainingHp);

  let entersMortalityState = false;
  let isDead = false;
  let stabilityPointsRemaining =
    input.currentStabilityPoints !== undefined ? Number(input.currentStabilityPoints) : maxStability;

  if (rawRemainingHp <= 0) {
    entersMortalityState = true;
    const excessDamage = Math.abs(rawRemainingHp);
    stabilityPointsRemaining = Math.max(0, stabilityPointsRemaining - excessDamage);
    if (
      stabilityPointsRemaining <= 0 ||
      (!isSynthetic && basePoolBefore <= 0 && netDamage >= maxStability)
    ) {
      isDead = true;
      stabilityPointsRemaining = 0;
    }
  }

  return {
    netDamage,
    vitalityDamage,
    healthDamage,
    structureDamage,
    remainingVitality,
    remainingHealth,
    remainingStructure,
    entersMortalityState,
    isDead,
    stabilityPointsRemaining,
    maxStabilityPoints: maxStability,
    syntheticNonLethalImmune
  };
}
