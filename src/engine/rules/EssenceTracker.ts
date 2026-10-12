/**
 * @file EssenceTracker.ts
 * @description Stage 5.7 / 6.4: Rulebook Compliant Metaphysics Tracking.
 * Enforces fixed costs for codified invocations, +50% for free-casting,
 * and handles Overchanneling (HP damage for casting below 0 Essence).
 */

export interface OngoingSpellEffect {
  id: string;
  casterId: string;
  currentDC: number;
  isSustained: boolean;
}

export interface OverchannelResult {
  isOverchanneling: boolean;
  vitalityDamage: number; // Applied to Vitality first, spills to Health
  fortitudeSaveDC: number;
  newEssence: number;
}

export class EssenceTracker {
  // Tangent standard: Effects with DC <= 14 cost 0 Essence (Cantrips)
  private readonly CANTRIP_THRESHOLD = 14;

  /**
   * Calculates maximum Essence pool based on the vol4 formula.
   */
  public calculateMaxEssence(keyAbilityMod: number, attuneRank: number, totalDisciplineRanks: number): number {
    return (keyAbilityMod * 5) + (attuneRank * 2) + totalDisciplineRanks;
  }

  /**
   * Calculates Essence cost based on base DC or invocation cost, with optional free-cast surcharge (+50%).
   * - If costOrDC <= 14: Treated as a cantrip (0 Essence).
   * - If costOrDC is a standard spell DC (> 14): Scaled per 5 DC increments.
   */
  public calculateCastCost(costOrDC: number, isFreeCast: boolean = false): number {
    let cost = 0;
    if (costOrDC <= this.CANTRIP_THRESHOLD) {
      cost = 0;
    } else {
      cost = Math.floor((costOrDC - this.CANTRIP_THRESHOLD + 4) / 5);
    }

    if (isFreeCast && cost > 0) {
      return Math.ceil(cost * 1.5);
    }
    return cost;
  }

  /**
   * Called by Combat Tracker when a character's turn begins.
   * Deducts Sustained Tax for keeping portals/shields active.
   */
  public processStartOfTurnTax(casterId: string, activeEffects: OngoingSpellEffect[]): number {
    let totalTax = 0;
    
    activeEffects.forEach(effect => {
      if (effect.casterId === casterId && effect.isSustained) {
        totalTax += this.calculateCastCost(effect.currentDC);
      }
    });

    return totalTax;
  }

  /**
   * DEGRADATION PROTOCOL
   * Called at the end of the global Combat Round.
   * Every active spell loses 1d10 of structural integrity (DC). When DC <= 0, it collapses.
   */
  public processRoundDegradation(activeEffects: OngoingSpellEffect[]): OngoingSpellEffect[] {
    const updatedEffects: OngoingSpellEffect[] = [];

    activeEffects.forEach(effect => {
      const entropy = Math.floor(Math.random() * 10) + 1;
      const newDC = effect.currentDC - entropy;

      if (newDC > 0) {
        updatedEffects.push({
          ...effect,
          currentDC: newDC
        });
      }
    });

    return updatedEffects;
  }

  /**
   * Deducts Essence and returns an OverchannelResult detailing HP damage and saves if dropped below 0.
   */
  public processEssenceExpenditure(currentEssence: number, cost: number): OverchannelResult {
    const newEssence = currentEssence - cost;
    
    if (newEssence < 0) {
      const pointsOverchanneled = Math.abs(newEssence);
      return {
        isOverchanneling: true,
        vitalityDamage: pointsOverchanneled * 2, // 2 points of direct Vitality damage per negative point
        fortitudeSaveDC: 10 + pointsOverchanneled, // CR 10 + Points Overchanneled
        newEssence
      };
    }

    return {
      isOverchanneling: false,
      vitalityDamage: 0,
      fortitudeSaveDC: 0,
      newEssence
    };
  }
}

