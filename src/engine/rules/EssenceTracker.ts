/**
 * @file EssenceTracker.ts
 * @description Stage 5.7 / 6.4: Canonical 4.00 METAPHYSICS.md Essence & Overchannel Tracking.
 * - Max Essence = (STR + AGI + STA + INT + WIS + CHA) + Attune Rank + Sum of All Metafocus Discipline Ranks
 * - Effects with CR <= 14 cost 0 Essence (Cantrips); Free-Casting adds +50% Essence surcharge
 * - Overchanneling ("The Burn"): Casting below 0 Essence deals 2 Direct Health Damage per point overchanneled
 *   (bypassing Armor DR and Stamina Toughness) + Fortitude Save vs CR (10 + Points Overchanneled).
 */

export interface EssenceAttributeSet {
  str?: number;
  agi?: number;
  dex?: number;
  sta?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
}

export interface OngoingSpellEffect {
  id: string;
  casterId: string;
  currentDC: number;
  currentCR?: number;
  isSustained: boolean;
}

export interface OverchannelResult {
  isOverchanneling: boolean;
  pointsOverchanneled: number;
  healthDamage: number;             // 2 Direct Health Damage per point overchanneled ("The Burn")
  vitalityDamage: number;           // 0 — Overchannel Burn bypasses Vitality directly to Health
  bypassesArmorAndToughness: boolean;
  fortitudeSaveCR: number;          // CR 10 + Points Overchanneled
  fortitudeSaveDC: number;          // Backward-compatible alias for fortitudeSaveCR
  newEssence: number;
}

export class EssenceTracker {
  // Canonical 4.00 METAPHYSICS.md: Effects with CR <= 14 cost 0 Essence (Cantrips)
  private readonly CANTRIP_THRESHOLD = 14;

  /**
   * Calculates maximum Essence pool per 4.00 METAPHYSICS.md:
   * Max Essence = (Sum of All 6 Primary Attributes) + Attune Skill Rank + (Sum of All Metafocus Discipline Ranks)
   *
   * @param attributesOrSum - Either an object of primary attributes { str, agi, sta, int, wis, cha } or their pre-summed total
   * @param attuneRank - Rank in the Attune skill
   * @param totalDisciplineRanks - Sum of all Metafocus Discipline skill ranks
   */
  public calculateMaxEssence(
    attributesOrSum: number | EssenceAttributeSet,
    attuneRank: number = 0,
    totalDisciplineRanks: number = 0
  ): number {
    let sixAttrSum = 0;
    if (typeof attributesOrSum === 'object' && attributesOrSum !== null) {
      const str = Number(attributesOrSum.str ?? 0) || 0;
      const agi = Number(attributesOrSum.agi ?? attributesOrSum.dex ?? 0) || 0;
      const sta = Number(attributesOrSum.sta ?? attributesOrSum.con ?? 0) || 0;
      const int = Number(attributesOrSum.int ?? 0) || 0;
      const wis = Number(attributesOrSum.wis ?? 0) || 0;
      const cha = Number(attributesOrSum.cha ?? 0) || 0;
      sixAttrSum = str + agi + sta + int + wis + cha;
    } else {
      sixAttrSum = Number(attributesOrSum) || 0;
    }
    return Math.max(0, sixAttrSum + (Number(attuneRank) || 0) + (Number(totalDisciplineRanks) || 0));
  }

  /**
   * Calculates Essence cost based on base CR (or legacy DC), with optional free-cast surcharge (+50%).
   * - If costOrCR <= 14: Treated as a cantrip (0 Essence).
   * - If costOrCR > 14: Scaled per 5 CR increments.
   */
  public calculateCastCost(costOrCR: number, isFreeCast: boolean = false): number {
    let cost = 0;
    if (costOrCR <= this.CANTRIP_THRESHOLD) {
      cost = 0;
    } else {
      cost = Math.floor((costOrCR - this.CANTRIP_THRESHOLD + 4) / 5);
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
        const cr = effect.currentCR ?? effect.currentDC;
        totalTax += this.calculateCastCost(cr);
      }
    });

    return totalTax;
  }

  /**
   * DEGRADATION PROTOCOL
   * Called at the end of the global Combat Round.
   * Every active invocation loses 1d10 of structural integrity (CR). When CR <= 0, it collapses.
   */
  public processRoundDegradation(activeEffects: OngoingSpellEffect[]): OngoingSpellEffect[] {
    const updatedEffects: OngoingSpellEffect[] = [];

    activeEffects.forEach(effect => {
      const entropy = Math.floor(Math.random() * 10) + 1;
      const baseCR = effect.currentCR ?? effect.currentDC;
      const newCR = baseCR - entropy;

      if (newCR > 0) {
        updatedEffects.push({
          ...effect,
          currentCR: newCR,
          currentDC: newCR
        });
      }
    });

    return updatedEffects;
  }

  /**
   * Deducts Essence and returns an OverchannelResult detailing Direct Health Burn and Fortitude Save CR if dropped below 0.
   */
  public processEssenceExpenditure(currentEssence: number, cost: number): OverchannelResult {
    const newEssence = currentEssence - cost;

    if (newEssence < 0) {
      const pointsOverchanneled = Math.abs(newEssence);
      const saveCR = 10 + pointsOverchanneled;
      return {
        isOverchanneling: true,
        pointsOverchanneled,
        healthDamage: pointsOverchanneled * 2, // 2 Direct Health Damage per point overchanneled ("The Burn")
        vitalityDamage: 0,
        bypassesArmorAndToughness: true,
        fortitudeSaveCR: saveCR,
        fortitudeSaveDC: saveCR,
        newEssence
      };
    }

    return {
      isOverchanneling: false,
      pointsOverchanneled: 0,
      healthDamage: 0,
      vitalityDamage: 0,
      bypassesArmorAndToughness: false,
      fortitudeSaveCR: 0,
      fortitudeSaveDC: 0,
      newEssence
    };
  }
}

