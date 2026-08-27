// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — CANONICAL SCALING CALCULATION ENGINE
// Implements universal 14-tier scaling mechanics, die stepping,
// fluid combat modifiers, starship proximity damage, and asset checks.
// ═══════════════════════════════════════════════════════════

import {
  SIZE_CATEGORIES,
  DIE_STEP_LADDER
} from './tangentConstants.js';
import { calculateCreditValue, getComplexityTier, getFinancialStatus } from './tangentEconEngine.js';

/**
 * Safe lookup for any size category by ID, name, or alias.
 * @param {string} sizeIdOrName - Size identifier or display name
 * @returns {typeof SIZE_CATEGORIES.Medium} Size category configuration
 */
export function getScalingCategory(sizeIdOrName) {
  if (!sizeIdOrName || typeof sizeIdOrName !== 'string') {
    return SIZE_CATEGORIES.Medium;
  }

  const clean = sizeIdOrName.trim().replace(/[\s\-_]+/g, '').toLowerCase();

  for (const [key, val] of Object.entries(SIZE_CATEGORIES)) {
    const keyClean = key.toLowerCase();
    const nameClean = (val.name || '').replace(/[\s\-_]+/g, '').toLowerCase();
    if (keyClean === clean || nameClean === clean) {
      return val;
    }
  }

  // Alias lookups
  if (clean === 'supergargantuan' || clean === 'supergarg' || clean === 'super') return SIZE_CATEGORIES.SuperGargantuan;
  if (clean === 'megacolossal' || clean === 'megacol' || clean === 'mega') return SIZE_CATEGORIES.MegaColossal;
  if (clean === 'base' || clean === 'human' || clean === 'humanoid') return SIZE_CATEGORIES.Medium;

  return SIZE_CATEGORIES.Medium;
}

/**
 * Step down a die side value along the canonical degradation ladder:
 * d10 -> d8 -> d6 -> d4 -> d3 -> d2 -> 1 point minimum.
 * 
 * @param {string|number} dieStr - Die notation (e.g. "d10", "d6", "2d8", 6)
 * @param {number} steps - Number of degradation steps (positive integer)
 * @returns {string} Degraded die or minimum point notation
 */
export function stepDieSide(dieStr, steps = 0) {
  const numSteps = Math.max(0, Math.round(Number(steps) || 0));
  if (numSteps === 0) return String(dieStr);

  const str = String(dieStr).trim();
  const match = str.match(/^(\d*)d(\d+)$/i);

  if (match) {
    const count = match[1] ? parseInt(match[1], 10) : 1;
    const sides = `d${match[2]}`;
    const ladder = DIE_STEP_LADDER; // ['d10', 'd8', 'd6', 'd4', 'd3', 'd2', '1']
    
    let currentIndex = ladder.indexOf(sides);
    if (currentIndex === -1) {
      // Find nearest or fallback
      const sideNum = parseInt(match[2], 10);
      if (sideNum >= 12) currentIndex = 0; // Starts at d10
      else if (sideNum >= 8) currentIndex = 1;
      else if (sideNum >= 6) currentIndex = 2;
      else if (sideNum >= 4) currentIndex = 3;
      else if (sideNum >= 3) currentIndex = 4;
      else if (sideNum >= 2) currentIndex = 5;
      else currentIndex = 6;
    }

    const newIndex = Math.min(ladder.length - 1, currentIndex + numSteps);
    const targetDie = ladder[newIndex];

    if (targetDie === '1') {
      return count > 1 ? `${count} (1 pt min)` : '1 pt min';
    }
    return match[1] ? `${match[1]}${targetDie}` : (count > 1 ? `${count}${targetDie}` : targetDie);
  }

  // If plain number or custom format
  const numVal = parseInt(str, 10);
  if (!isNaN(numVal) && numVal > 0) {
    return `${Math.max(1, Math.round(numVal / (numSteps + 1)))} pt min`;
  }

  return str;
}

/**
 * Scales damage dice by size category.
 * - Positive scales (> x1): Multiplies dice quantity by scaling multiplier.
 * - Sub-medium scales (-1ds to -5ds): Steps down the die side value.
 * 
 * @param {string} baseDice - Base damage notation (e.g. "1d6", "5d6", "2d10", "1d8+2")
 * @param {string} sizeCategory - Size category ID or name
 * @returns {string} Scaled damage notation
 */
export function scaleDamageDice(baseDice, sizeCategory = 'Medium') {
  if (!baseDice || typeof baseDice !== 'string') return baseDice || '1d6';
  const size = getScalingCategory(sizeCategory);

  // 1. If Medium baseline
  if (size.scaleMultiplier === 1.0 && size.dieStep === 0) {
    return baseDice;
  }

  // 2. If Positive scale (> x1)
  if (size.scaleMultiplier > 1.0) {
    const mult = size.scaleMultiplier;
    // Match e.g. "5d6", "1d10+4", "3d8"
    const diceMatch = baseDice.match(/^(\d+)\s*d\s*(\d+)(.*)$/i);
    if (diceMatch) {
      const count = parseInt(diceMatch[1], 10);
      const dieSides = diceMatch[2];
      const suffix = diceMatch[3] ? diceMatch[3].trim() : '';
      const scaledCount = Math.round(count * mult);
      
      // If there's a flat modifier e.g. "+4", multiply flat mod as well if applicable
      let scaledSuffix = suffix;
      if (suffix) {
        const flatModMatch = suffix.match(/^([+-])\s*(\d+)$/);
        if (flatModMatch) {
          const sign = flatModMatch[1];
          const flatVal = parseInt(flatModMatch[2], 10);
          scaledSuffix = ` ${sign} ${flatVal * mult}`;
        }
      }
      return `${scaledCount}d${dieSides}${scaledSuffix}`;
    }

    // Flat damage notation (e.g. "10")
    const flatNum = parseFloat(baseDice);
    if (!isNaN(flatNum)) {
      return `${Math.round(flatNum * mult)}`;
    }

    return `${baseDice} (x${mult})`;
  }

  // 3. If Sub-Medium negative step scale (-1ds to -5ds)
  if (size.dieStep < 0) {
    const steps = Math.abs(size.dieStep);
    const diceMatch = baseDice.match(/^(\d+)\s*d\s*(\d+)(.*)$/i);
    if (diceMatch) {
      const count = diceMatch[1];
      const sides = `d${diceMatch[2]}`;
      const suffix = diceMatch[3] ? diceMatch[3].trim() : '';
      const stepped = stepDieSide(`${count}${sides}`, steps);
      return suffix ? `${stepped} ${suffix}` : stepped;
    }
    return stepDieSide(baseDice, steps);
  }

  return baseDice;
}

/**
 * Calculates the fluid relative Combat Modifier between an Attacker and Defender.
 * 
 * Rules:
 * - Attacker Larger than Medium:
 *   * Defender Smaller than Medium: actual = Attacker Combat Mod - Defender Combat Mod.
 *   * Defender Larger than Medium (but smaller than attacker): actual = Attacker Combat Mod / Defender Combat Mod.
 *   * Defender Equal Size: actual = 0.
 * - Attacker Smaller than Medium:
 *   * Defender Larger than Medium: actual = Attacker Combat Mod - Defender Combat Mod.
 *   * Defender Smaller than Medium (but larger than attacker): actual = Attacker Combat Mod / Defender Combat Mod.
 *   * Defender Equal Size: actual = 0.
 * - Attacker is Medium:
 *   * actual = Attacker Combat Mod (0) - Defender Combat Mod.
 * 
 * @param {string} attackerSize - Size of attacking entity
 * @param {string} defenderSize - Size of defending entity
 * @returns {object} { modifier: number, explanation: string }
 */
export function calculateFluidCombatModifier(attackerSize = 'Medium', defenderSize = 'Medium') {
  const atk = getScalingCategory(attackerSize);
  const def = getScalingCategory(defenderSize);

  const atkMod = atk.combatMod; // e.g. Large = -2, Small = +2
  const defMod = def.combatMod; // e.g. Small = +2, Large = -2

  // Equal size
  if (atk.id === def.id) {
    return {
      modifier: 0,
      attackerSize: atk.name,
      defenderSize: def.name,
      explanation: `Equal size (${atk.name} vs ${def.name}): Modifier is 0.`
    };
  }

  // Attacker is Medium
  if (atk.scaleMultiplier === 1.0) {
    const mod = -defMod;
    return {
      modifier: mod,
      attackerSize: atk.name,
      defenderSize: def.name,
      explanation: `Medium attacker vs ${def.name}: Standard base modifier (${mod >= 0 ? '+' : ''}${mod}).`
    };
  }

  // Attacker is Larger than Medium (combatMod < 0)
  if (atk.scaleMultiplier > 1.0) {
    // 1. Target is Smaller than Medium (def.scaleMultiplier < 1.0, defMod > 0)
    if (def.scaleMultiplier < 1.0) {
      const actual = atkMod - defMod;
      return {
        modifier: actual,
        attackerSize: atk.name,
        defenderSize: def.name,
        explanation: `Larger attacker vs Smaller target (${atk.name} [${atkMod}] vs ${def.name} [${defMod}]): ${atkMod} - ${defMod} = ${actual}.`
      };
    }

    // 2. Target is Larger than Medium (def.scaleMultiplier > 1.0)
    if (def.scaleMultiplier > 1.0) {
      if (def.scaleMultiplier < atk.scaleMultiplier) {
        // Defender is smaller than attacker (e.g. Huge [-4] vs Large [-2] => -2)
        const magnitude = Math.round(Math.abs(atkMod) / Math.abs(defMod));
        const actual = -magnitude;
        return {
          modifier: actual,
          attackerSize: atk.name,
          defenderSize: def.name,
          explanation: `Larger attacker vs Intermediate large target (${atk.name} [${atkMod}] vs ${def.name} [${defMod}]): ${atkMod} / ${defMod} = ${actual} (granting ${def.name} moderate advantage).`
        };
      } else {
        // Defender is LARGER than attacker (e.g. Large [-2] vs Huge [-4] => -2 - (-4) = +2)
        const actual = atkMod - defMod;
        return {
          modifier: actual,
          attackerSize: atk.name,
          defenderSize: def.name,
          explanation: `Attacking larger target (${atk.name} [${atkMod}] vs ${def.name} [${defMod}]): ${atkMod} - (${defMod}) = ${actual >= 0 ? '+' : ''}${actual}.`
        };
      }
    }

    // Target is Medium
    return {
      modifier: atkMod,
      attackerSize: atk.name,
      defenderSize: def.name,
      explanation: `${atk.name} attacking Medium: ${atkMod}.`
    };
  }

  // Attacker is Smaller than Medium (combatMod > 0)
  if (atk.scaleMultiplier < 1.0) {
    // 1. Target is Larger than Medium (def.scaleMultiplier > 1.0, defMod < 0)
    if (def.scaleMultiplier > 1.0) {
      const actual = atkMod - defMod; // e.g. +2 - (-2) = +4
      return {
        modifier: actual,
        attackerSize: atk.name,
        defenderSize: def.name,
        explanation: `Smaller attacker vs Larger target (${atk.name} [${atkMod}] vs ${def.name} [${defMod}]): ${atkMod} - (${defMod}) = +${actual}.`
      };
    }

    // 2. Target is Smaller than Medium (def.scaleMultiplier < 1.0)
    if (def.scaleMultiplier < 1.0) {
      if (def.scaleMultiplier > atk.scaleMultiplier) {
        // Defender is larger than attacker (e.g. Tiny atk [+4] vs Small def [+2])
        const actual = Math.round(atkMod / defMod); // 4 / 2 = +2
        return {
          modifier: actual,
          attackerSize: atk.name,
          defenderSize: def.name,
          explanation: `Smaller attacker vs Intermediate small target (${atk.name} [${atkMod}] vs ${def.name} [${defMod}]): ${atkMod} / ${defMod} = +${actual}.`
        };
      } else {
        // Defender is even smaller than attacker (e.g. Small atk [+2] vs Tiny def [+4])
        const actual = atkMod - defMod;
        return {
          modifier: actual,
          attackerSize: atk.name,
          defenderSize: def.name,
          explanation: `Attacking smaller target (${atk.name} [${atkMod}] vs ${def.name} [${defMod}]): ${atkMod} - ${defMod} = ${actual}.`
        };
      }
    }

    // Target is Medium
    return {
      modifier: atkMod,
      attackerSize: atk.name,
      defenderSize: def.name,
      explanation: `${atk.name} attacking Medium: +${atkMod}.`
    };
  }

  return {
    modifier: 0,
    attackerSize: atk.name,
    defenderSize: def.name,
    explanation: 'Standard baseline combat interaction.'
  };
}

/**
 * Calculates Starship Scale Proximity Damage & Overblast.
 * Applicable to Enormous+ scale entities firing on smaller targets.
 * 
 * @param {string} sizeCategory - Size category of attacking ship/asset
 * @param {string|number} directDamage - Full direct damage notation or average
 * @param {number} [strMod] - Strength modifier of the firing chassis
 * @returns {object} Proximity damage analysis
 */
export function calculateProximityDamage(sizeCategory = 'Enormous', directDamage = '40d10', strMod = null) {
  const size = getScalingCategory(sizeCategory);
  const effectiveStrMod = strMod !== null && strMod !== undefined ? Number(strMod) : size.strMod;

  if (!size.isStarship) {
    return {
      isStarshipScale: false,
      proximityActive: false,
      splashRadiusFt: 0,
      indirectDamageRatio: 0,
      description: 'Tactical scale asset: Standard direct combat rules apply.'
    };
  }

  // Splash radius is half of Strength Modifier in feet
  const splashRadius = Math.max(5, Math.round(Math.abs(effectiveStrMod) / 2));

  return {
    isStarshipScale: true,
    proximityActive: true,
    scaleMultiplier: size.scaleMultiplier,
    directDamage,
    indirectDamageRatio: 0.1, // 1/10th Indirect Damage
    splashRadiusFt: splashRadius,
    overblastDescription: `Starship Scale (${size.name}): Direct blast vaporizes small targets. Deals 1/10th Indirect Damage (splash/debris) within a ${splashRadius} ft radius (STR Mod ${effectiveStrMod} / 2).`
  };
}

/**
 * Scales an Invocation or Meta-Tech device when installed into a host vehicle/chassis.
 * Applies the Scaling Multiplier of the Host Chassis to ALL numerical parameters
 * (Damage Dice, Range, Area), while preserving Save DCs and non-scaling effect constants.
 * 
 * @param {object} invocationParams - Base Invocation parameters
 * @param {string} [invocationParams.name] - Invocation name
 * @param {string} [invocationParams.baseDamage] - Base damage dice (e.g. "5d6")
 * @param {number} [invocationParams.baseRange] - Base range in feet (e.g. 100)
 * @param {number} [invocationParams.baseArea] - Base AoE radius in feet (e.g. 20)
 * @param {number} [invocationParams.saveDC] - Base Save DC (e.g. 15)
 * @param {string} hostChassisSize - Size of host chassis (e.g. "Huge", "Large")
 * @returns {object} Scaled invocation parameters
 */
export function scaleMetaTechInvocation({
  name = 'Invocation',
  baseDamage = '5d6',
  baseRange = 100,
  baseArea = 20,
  saveDC = 15
} = {}, hostChassisSize = 'Huge') {
  const size = getScalingCategory(hostChassisSize);
  const mult = size.scaleMultiplier;

  const scaledDamage = scaleDamageDice(baseDamage, hostChassisSize);
  const scaledRange = baseRange ? Math.round(Number(baseRange) * mult) : null;
  const scaledArea = baseArea ? Math.round(Number(baseArea) * mult) : null;

  return {
    name,
    hostChassisSize: size.name,
    scaleMultiplier: mult,
    baseDamage,
    scaledDamage,
    baseRange: baseRange ? `${baseRange} ft` : 'N/A',
    scaledRange: scaledRange ? `${scaledRange} ft` : 'N/A',
    baseArea: baseArea ? `${baseArea} ft radius` : 'N/A',
    scaledArea: scaledArea ? `${scaledArea} ft radius` : 'N/A',
    saveDC: Number(saveDC) || 15,
    saveDCRule: 'Preserved: Save DCs remain unchanged by chassis scale',
    summary: `${name} hosted on ${size.name} chassis (x${mult} Scale): Damage amplified to ${scaledDamage}, Range ${scaledRange ? `${scaledRange} ft` : 'N/A'}, Area ${scaledArea ? `${scaledArea} ft radius` : 'N/A'}. Save DC ${saveDC} is unaffected.`
  };
}

/**
 * Scale movement speed based on size category.
 * @param {number} baseSpeed - Base tactical speed (default 30 ft/rnd)
 * @param {string} sizeCategory - Size category ID or name
 * @returns {number} Scaled movement speed in ft/rnd
 */
export function scaleMovementSpeed(baseSpeed = 30, sizeCategory = 'Medium') {
  const size = getScalingCategory(sizeCategory);
  const speed = Number(baseSpeed) || 30;

  if (size.scaleMultiplier >= 1.0) {
    return Math.round(speed * size.scaleMultiplier);
  }

  // Fractional step
  return Math.max(5, Math.round(speed * size.scaleMultiplier));
}

/**
 * Scale range increments based on size category.
 * @param {number} baseRangeFt - Base range in feet
 * @param {string} sizeCategory - Size category ID or name
 * @returns {number} Scaled range in feet
 */
export function scaleRange(baseRangeFt, sizeCategory = 'Medium') {
  if (!baseRangeFt) return 0;
  const size = getScalingCategory(sizeCategory);
  return Math.round(Number(baseRangeFt) * size.scaleMultiplier);
}

/**
 * Scale Structure Points (SP) based on size category.
 * @param {number} baseSP - Base SP for medium chassis
 * @param {string} sizeCategory - Size category ID or name
 * @returns {number} Scaled Structure Points
 */
export function scaleStructurePoints(baseSP = 50, sizeCategory = 'Medium') {
  const size = getScalingCategory(sizeCategory);
  const sp = Number(baseSP) || 50;
  return Math.max(1, Math.round(sp * size.scaleMultiplier));
}

/**
 * Scale carrying capacity in lbs based on size category.
 * Baseline human Medium = STR * 50 lbs max load.
 * @param {number} baseCapacityLbs - Base carrying capacity
 * @param {string} sizeCategory - Size category ID or name
 * @returns {number} Scaled carrying capacity in lbs
 */
export function scaleCarryingCapacity(baseCapacityLbs = 500, sizeCategory = 'Medium') {
  const size = getScalingCategory(sizeCategory);
  const cap = Number(baseCapacityLbs) || 500;
  return Math.round(cap * size.scaleMultiplier);
}

/**
 * Cross-validates an asset's entered metrics against its size category and rules.
 * 
 * @param {object} asset - Asset data object
 * @returns {object} Validation result { isValid, warnings, recommendations, scaleDetails }
 */
export function validateAssetScaling(asset = {}) {
  const sizeKey = asset.size || asset.sizeCategory || asset.footprint || 'Medium';
  const size = getScalingCategory(sizeKey);
  const warnings = [];
  const recommendations = [];

  // 1. Stealth check for starship scale
  if (size.isStarship) {
    if (asset.stealth && asset.stealth !== 'NO' && Number(asset.stealth) > 0) {
      warnings.push(`Starship Scale entities (${size.name}) cannot have positive baseline stealth modifiers (Standard is NO / none).`);
      recommendations.push('Remove or disable baseline personal stealth bonus.');
    }
  }

  // 2. Structure Points check
  if (asset.durability || asset.sp) {
    const enteredSP = Number(asset.durability || asset.sp);
    const expectedBaseSP = size.scaleMultiplier >= 1 ? 50 * size.scaleMultiplier : Math.round(50 * size.scaleMultiplier);
    if (enteredSP < expectedBaseSP * 0.25) {
      warnings.push(`Entered SP (${enteredSP}) is significantly lower than typical ${size.name} baseline (~${expectedBaseSP} SP).`);
    }
  }

  // 3. Proximity damage check
  const proximity = calculateProximityDamage(size.id, asset.damage || '4d10', asset.strMod || size.strMod);

  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations,
    scaleCategory: size.name,
    scaleMultiplier: size.scaleMultiplier,
    scaleDisplay: size.scaleDisplay,
    strMod: size.strMod,
    combatMod: size.combatMod,
    stealthMod: size.stealthMod,
    reach: size.reach,
    height: size.height,
    weight: size.weight,
    proximity
  };
}

/**
 * Real-time validation of entered credit cost vs. calculated TSC value from DC.
 * 
 * @param {number} enteredDC - Crafting or complexity DC
 * @param {number} enteredCost - Entered or overridden credit cost
 * @returns {object} Valuation analysis
 */
export function validateAssetValuation(enteredDC, enteredCost) {
  const dc = Number(enteredDC) || 0;
  const tscValue = calculateCreditValue(dc);
  const cost = enteredCost !== undefined && enteredCost !== null && !isNaN(enteredCost) ? Number(enteredCost) : tscValue;

  const ratio = tscValue > 0 ? cost / tscValue : 1.0;
  const isMatch = Math.abs(ratio - 1.0) < 0.05; // within 5%

  let status = 'Accurate Standard Curve';
  let color = '#10b981'; // Green

  if (ratio > 1.5) {
    status = 'Premium Overcharge (>150% TSC Value)';
    color = '#f59e0b'; // Amber
  } else if (ratio < 0.5 && cost > 0) {
    status = 'Subsidized / Black Market Salvage (<50% TSC Value)';
    color = '#38bdf8'; // Blue
  } else if (cost === 0 && dc > 5) {
    status = 'Unpriced / Zero Cost Flag';
    color = '#ef4444'; // Red
  }

  const complexity = getComplexityTier(dc);
  const wsStatus = getFinancialStatus(dc);

  return {
    dc,
    tscValue,
    enteredCost: cost,
    ratio: Math.round(ratio * 100) / 100,
    isMatch,
    status,
    color,
    complexityTier: complexity,
    wealthScoreRequired: dc,
    financialStatusTier: wsStatus?.name || 'Standard'
  };
}
