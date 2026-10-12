/**
 * @file CharacterBuilder.ts
 * @description Stage 5.3: 150 BP Economy and bounded accuracy enforcement for Personas.
 * A reactive Directed Acyclic Graph (DAG) that validates operative character creation,
 * enforcing attribute parity caps, hindrance arbitrage, and cyclic dependency checks.
 */

export interface AttributeStats {
  str: number; 
  agi: number; // Agility
  sta: number; // Stamina
  int: number; 
  wis: number; 
  cha: number;
  dex?: number; // Legacy alias for agi
  con?: number; // Legacy alias for sta
}

export interface CharacterDraft {
  name: string;
  speciesId: string;
  attributes: AttributeStats;
  hindrances: string[]; // IDs of negative traits yielding BP
  features: string[];   // IDs of positive traits costing BP
}

import { DEFAULT_SPECIES } from '../../data/speciesData.js';

export interface SpeciesRule {
  bp_cost: number;
  parity_cap: Record<string, number>;
}

function buildSpeciesCatalog(): Record<string, SpeciesRule> {
  const db: Record<string, SpeciesRule> = {};

  if (Array.isArray(DEFAULT_SPECIES)) {
    DEFAULT_SPECIES.forEach((s: any) => {
      const bpCost = s.costs?.bp ?? s.bp ?? s.cp_cost ?? 0;
      const parityCap: Record<string, number> = { str: 4, agi: 4, sta: 4, int: 4, wis: 4, cha: 4, dex: 4, con: 4 };

      (s.inherent_attribute_modifiers || []).forEach((m: any) => {
        const attr = (m.attribute || '').toLowerCase();
        const b = m.bonus || 0;
        if (attr.startsWith('str')) { parityCap.str += b; }
        if (attr.startsWith('agi')) { parityCap.agi += b; parityCap.dex += b; }
        if (attr.startsWith('sta')) { parityCap.sta += b; parityCap.con += b; }
        if (attr.startsWith('int')) { parityCap.int += b; }
        if (attr.startsWith('wis')) { parityCap.wis += b; }
        if (attr.startsWith('cha')) { parityCap.cha += b; }
      });

      const rule: SpeciesRule = { bp_cost: bpCost, parity_cap: parityCap };
      if (s.id) db[s.id] = rule;
      const nameKey = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (nameKey) db[nameKey] = rule;
      if (s.name) db[s.name.toLowerCase()] = rule;
    });
  }

  // Ensure canonical shorthand and backward-compatible aliases
  if (db['species-human-base']) db['human'] = db['species-human-base'];
  if (db['species-aeld-alterian']) {
    db['alterian'] = db['species-aeld-alterian'];
    db['celestine'] = db['species-aeld-alterian'];
  }
  if (db['species-aeld-kovian']) {
    db['kovian'] = db['species-aeld-kovian'];
    db['nocturne'] = db['species-aeld-kovian'];
  }
  if (db['species-synthetic-android']) {
    db['synth_android'] = db['species-synthetic-android'];
    db['android'] = db['species-synthetic-android'];
  }
  if (db['species-gene-digon']) {
    db['digon'] = db['species-gene-digon'];
    db['krogan_analog'] = db['species-gene-digon'];
  }

  return db;
}

export const MECHANICS_DB = {
  species: buildSpeciesCatalog(),
  hindrances: {
    'blind': { bp_yield: 15 },
    'debt': { bp_yield: 5 },
    'cyber_rejection_prone': { bp_yield: 10 },
    'wanted_criminal': { bp_yield: 10 }
  } as Record<string, { bp_yield: number }>,
  features: {
    'flight': { bp_cost: 20 },
    'darkvision': { bp_cost: 5 },
    'tactical_reflexes': { bp_cost: 10 },
    'neural_jack': { bp_cost: 15 }
  } as Record<string, { bp_cost: number }>
};

export class CharacterBuilder {
  public readonly MAX_BP = 150;
  public readonly HINDRANCE_ARBITRAGE_CAP = 152; // Hard cap on max total BP allowed via flaws

  /**
   * Validates the entire persona draft against the Tangent Standard Curve.
   */
  public validate(draft: CharacterDraft): { isValid: boolean; totalBPCost: number; errors: string[] } {
    const errors: string[] = [];
    let spentBP = 0;
    let earnedBP = 0;

    const species = MECHANICS_DB.species[draft.speciesId];
    if (!species) {
      return { isValid: false, totalBPCost: 0, errors: [`Invalid Species Selection: '${draft.speciesId}'.`] };
    }

    // 1. Calculate Species Cost
    spentBP += species.bp_cost;

    // 2. Validate Attribute Parity (+4/+5 Caps)
    for (const [attr, value] of Object.entries(draft.attributes)) {
      if (attr === 'dex' && draft.attributes.agi !== undefined) continue;
      if (attr === 'con' && draft.attributes.sta !== undefined) continue;
      const cap = species.parity_cap[attr] ?? 4;
      if (value !== undefined && value > cap) {
        errors.push(`Attribute Parity Violation: ${attr.toUpperCase()} (${value}) exceeds species cap of +${cap}.`);
      }
      if (value !== undefined && value > 0) spentBP += (value * 5); 
    }

    // 3. Calculate Hindrance Arbitrage
    for (const hindId of draft.hindrances) {
      const hindrance = MECHANICS_DB.hindrances[hindId];
      if (hindrance) earnedBP += hindrance.bp_yield;
    }

    // 4. Calculate Features
    for (const featId of draft.features) {
      const feature = MECHANICS_DB.features[featId];
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
   * Dependency Cycle check using topological graph recursion.
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
