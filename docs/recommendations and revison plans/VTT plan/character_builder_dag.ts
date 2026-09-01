/**
 * @file CharacterBuilder.ts
 * @description Stage 5.3: 150 BP Economy and bounded accuracy enforcement.
 * A reactive Directed Acyclic Graph (DAG) that validates character creation,
 * enforcing attribute parity caps, hindrance arbitrage, and cyclic dependency checks.
 */

export interface AttributeStats {
  str: number; dex: number; con: number;
  int: number; wis: number; cha: number;
}

export interface CharacterDraft {
  name: string;
  speciesId: string;
  attributes: AttributeStats;
  hindrances: string[]; // IDs of negative traits yielding BP
  features: string[];   // IDs of positive traits costing BP
}

// Mock Database of BP costs
const MECHANICS_DB = {
  species: {
    'human': { bp_cost: 0, parity_cap: { str: 4, dex: 4, con: 4, int: 4, wis: 4, cha: 4 } },
    'krogan_analog': { bp_cost: 10, parity_cap: { str: 5, dex: 3, con: 5, int: 3, wis: 3, cha: 2 } }
  },
  hindrances: {
    'blind': { bp_yield: +15 },
    'debt': { bp_yield: +5 }
  },
  features: {
    'flight': { bp_cost: 20 },
    'darkvision': { bp_cost: 5 }
  }
};

export class CharacterBuilder {
  private readonly MAX_BP = 150;
  private readonly HINDRANCE_ARBITRAGE_CAP = 152; // Hard cap on max total BP allowed via flaws

  /**
   * Validates the entire character draft against the Tangent Standard Curve.
   * Throws detailed errors if any rules are violated.
   */
  public validate(draft: CharacterDraft): { isValid: boolean; totalBPCost: number; errors: string[] } {
    const errors: string[] = [];
    let spentBP = 0;
    let earnedBP = 0;

    const species = MECHANICS_DB.species[draft.speciesId as keyof typeof MECHANICS_DB.species];
    if (!species) {
      return { isValid: false, totalBPCost: 0, errors: ['Invalid Species Selection.'] };
    }

    // 1. Calculate Species Cost
    spentBP += species.bp_cost;

    // 2. Validate Attribute Parity (+4/+5 Caps)
    for (const [attr, value] of Object.entries(draft.attributes)) {
      const cap = (species.parity_cap as any)[attr];
      if (value > cap) {
        errors.push(`Attribute Parity Violation: ${attr.toUpperCase()} exceeds species cap of +${cap}.`);
      }
      // Attributes typically cost 5 BP per rank above 0 (simplified math here)
      if (value > 0) spentBP += (value * 5); 
    }

    // 3. Calculate Hindrance Arbitrage
    for (const hindId of draft.hindrances) {
      const hindrance = MECHANICS_DB.hindrances[hindId as keyof typeof MECHANICS_DB.hindrances];
      if (hindrance) earnedBP += hindrance.bp_yield;
    }

    // 4. Calculate Features
    for (const featId of draft.features) {
      const feature = MECHANICS_DB.features[featId as keyof typeof MECHANICS_DB.features];
      if (feature) spentBP += feature.bp_cost;
    }

    // 5. Enforce Economy Boundaries
    const totalMaxBP = Math.min(this.MAX_BP + earnedBP, this.HINDRANCE_ARBITRAGE_CAP);
    
    if (spentBP > totalMaxBP) {
      errors.push(`Economy Violation: Spent ${spentBP} BP, but limit is ${totalMaxBP} BP (including ${earnedBP} BP from Hindrances).`);
    }

    return {
      isValid: errors.length === 0,
      totalBPCost: spentBP,
      errors
    };
  }

  /**
   * Dependency Cycle check (e.g., Feature A requires B, B requires A).
   * Executes a topological sort to detect cyclic graphs before allowing save.
   */
  public validateDependencies(features: string[], requirementsMap: Record<string, string[]>): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const isCyclic = (node: string): boolean => {
      if (!visited.has(node)) {
        visited.add(node);
        recursionStack.add(node);

        const neighbors = requirementsMap[node] || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && isCyclic(neighbor)) {
            return true;
          } else if (recursionStack.has(neighbor)) {
            return true;
          }
        }
      }
      recursionStack.delete(node);
      return false;
    };

    for (const feature of features) {
      if (isCyclic(feature)) return false; // Cycle detected
    }

    return true;
  }
}