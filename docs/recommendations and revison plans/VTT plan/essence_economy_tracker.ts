/**
 * @file EssenceEconomyTracker.ts
 * @description Stage 5.7: Magic taxation and physics entropy.
 * Enforces the Tangent magic systems: 0-cost cantrips vs exhausting high-DC spells, 
 * Sustained chronometer taxes, and the automated Degradation Protocol (entropy).
 */

export interface OngoingSpellEffect {
  id: string;
  casterId: string;
  currentDC: number;
  isSustained: boolean; // Does it drain essence every turn?
}

export class EssenceEconomyTracker {
  // Tangent standard: Effects with a DC of 14 or less cost 0 Essence (Cantrips).
  // DC 15 and above start costing physical exhaustion.
  private readonly CANTRIP_THRESHOLD = 14;

  /**
   * Calculates the immediate Essence cost to cast or attune a supernatural effect.
   */
  public calculateCastCost(baseDC: number): number {
    if (baseDC <= this.CANTRIP_THRESHOLD) {
      return 0;
    }
    
    // Example scaling: 1 Essence for DC 15-19, 2 for DC 20-24, etc.
    return Math.floor((baseDC - this.CANTRIP_THRESHOLD + 4) / 5);
  }

  /**
   * Called by the CombatTrackerWidget every time a character's turn begins.
   * Automatically deducts the Sustained Tax for keeping portals/shields open.
   */
  public processStartOfTurnTax(casterId: string, activeEffects: OngoingSpellEffect[]): number {
    let totalTax = 0;
    
    activeEffects.forEach(effect => {
      if (effect.casterId === casterId && effect.isSustained) {
        // Sustaining a spell costs its standard cast cost every single turn
        totalTax += this.calculateCastCost(effect.currentDC);
      }
    });

    return totalTax;
  }

  /**
   * DEGRADATION PROTOCOL
   * Called at the end of the global Combat Round.
   * Tangent physics aggressively reject supernatural alterations. At the end of every round,
   * every active spell loses 1d10 of structural integrity (DC). When DC hits 0, it shatters.
   */
  public processRoundDegradation(activeEffects: OngoingSpellEffect[]): OngoingSpellEffect[] {
    const updatedEffects: OngoingSpellEffect[] = [];

    activeEffects.forEach(effect => {
      // The universe fights back: Roll 1d10 entropy
      const entropy = Math.floor(Math.random() * 10) + 1;
      
      const newDC = effect.currentDC - entropy;

      if (newDC > 0) {
        updatedEffects.push({
          ...effect,
          currentDC: newDC
        });
      }
      // If newDC <= 0, the spell is naturally culled from the array (it collapses)
    });

    return updatedEffects;
  }
}