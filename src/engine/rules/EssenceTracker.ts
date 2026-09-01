/**
 * @file EssenceTracker.ts
 * @description Stage 5.7 / 6.4: Magic taxation and physics entropy.
 * Enforces Tangent magic systems: 0-cost cantrips vs exhausting high-DC spells, 
 * Sustained chronometer taxes, and the automated Degradation Protocol (entropy).
 */

export interface OngoingSpellEffect {
  id: string;
  casterId: string;
  currentDC: number;
  isSustained: boolean;
}

export class EssenceTracker {
  // Tangent standard: Effects with DC <= 14 cost 0 Essence (Cantrips)
  private readonly CANTRIP_THRESHOLD = 14;

  /**
   * Calculates immediate Essence cost to cast or attune a supernatural effect.
   */
  public calculateCastCost(baseDC: number): number {
    if (baseDC <= this.CANTRIP_THRESHOLD) {
      return 0;
    }
    return Math.floor((baseDC - this.CANTRIP_THRESHOLD + 4) / 5);
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
}
