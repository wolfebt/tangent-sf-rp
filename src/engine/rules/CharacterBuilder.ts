/**
 * @file CharacterBuilder.ts
 * @description Stage 5.3: Canonical 150 CP Economy and bounded accuracy enforcement for Personas.
 * A reactive Directed Acyclic Graph (DAG) that validates operative character creation per 1.00 CHARACTER CREATION.md:
 * - 150 CP core pool (80 CP Archetype + 70 CP discretionary) + 60 free Background SP (20 Faction + 20 Origin + 20 Occupation)
 * - Personal Hindrances capped at +10 CP (Species disadvantages & Social Stigmas exempt)
 * - Creation Skill Rank cap 11 (30 absolute Stage 6 Pinnacle)
 * - Vitality/Health/Structure: 1 CP = +5 points with Zero Stamina Scaling
 */

export interface AttributeStats {
  str: number; 
  agi?: number; // Agility
  sta?: number; // Stamina
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
  hindrances: string[]; // IDs of personal negative traits yielding CP (capped at +10 CP)
  features: string[];   // IDs of positive features costing CP
  stigmas?: string[];   // Social Stigmas (exempt from +10 CP personal hindrance cap)
  skills?: Record<string, number>;           // Total skill ranks at creation (cap 11)
  backgroundSkills?: Record<string, number>; // Free Background SP (up to 60 SP: 20 Faction + 20 Origin + 20 Occupation)
  purchasedVitality?: number;  // Bonus Vitality points (1 CP = +5 pts, Zero Stamina Scaling)
  purchasedHealth?: number;    // Bonus Health points (1 CP = +5 pts, Zero Stamina Scaling)
  purchasedStructure?: number; // Bonus Structure points (1 CP = +5 pts, Zero Stamina Scaling)
  isPostCreation?: boolean;
}

import { DEFAULT_SPECIES } from '../../data/speciesData.js';
import { DEFAULT_FEATURES } from '../../data/featuresData.js';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../../data/speciesDisadvantagesData.js';

export interface SpeciesRule {
  cp_cost: number;
  bp_cost: number;
  parity_cap: Record<string, number>;
}

function buildSpeciesCatalog(): Record<string, SpeciesRule> {
  const db: Record<string, SpeciesRule> = {};

  if (Array.isArray(DEFAULT_SPECIES)) {
    DEFAULT_SPECIES.forEach((s: any) => {
      const cpCost = s.costs?.cp ?? s.cp ?? s.cp_cost ?? s.costs?.bp ?? s.bp ?? 0;
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

      const rule: SpeciesRule = { cp_cost: cpCost, bp_cost: cpCost, parity_cap: parityCap };
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

function buildFeaturesCatalog(): Record<string, { cp_cost: number; bp_cost: number }> {
  const map: Record<string, { cp_cost: number; bp_cost: number }> = {
    'flight': { cp_cost: 4, bp_cost: 4 },
    'darkvision': { cp_cost: 3, bp_cost: 3 },
    'tactical_reflexes': { cp_cost: 3, bp_cost: 3 },
    'neural_jack': { cp_cost: 3, bp_cost: 3 }
  };
  if (Array.isArray(DEFAULT_FEATURES)) {
    DEFAULT_FEATURES.forEach((f: any) => {
      const c = Number(f.cp ?? f.bp ?? 3) || 3;
      const entry = { cp_cost: c, bp_cost: c };
      if (f.id) map[String(f.id).toLowerCase()] = entry;
      if (f.name) {
        map[String(f.name).toLowerCase()] = entry;
        map[String(f.name).toLowerCase().replace(/[^a-z0-9]+/g, '_')] = entry;
      }
    });
  }
  return map;
}

function buildHindrancesCatalog(): Record<string, { cp_yield: number; bp_yield: number; isStigma?: boolean }> {
  const map: Record<string, { cp_yield: number; bp_yield: number; isStigma?: boolean }> = {
    'blind': { cp_yield: 5, bp_yield: 5 },
    'debt': { cp_yield: 3, bp_yield: 3 },
    'cyber_rejection_prone': { cp_yield: 3, bp_yield: 3 },
    'wanted_criminal': { cp_yield: 3, bp_yield: 3 },
    'stigma_xeno': { cp_yield: 2, bp_yield: 2, isStigma: true },
    'stigma_pariah': { cp_yield: 4, bp_yield: 4, isStigma: true }
  };
  if (Array.isArray(DEFAULT_SPECIES_DISADVANTAGES)) {
    DEFAULT_SPECIES_DISADVANTAGES.forEach((d: any) => {
      const y = Math.abs(Number(d.refundBP ?? d.cp ?? d.bp ?? 2) || 2);
      const isStigma = String(d.category || d.name || '').toLowerCase().includes('stigma');
      const entry = { cp_yield: y, bp_yield: y, isStigma };
      if (d.id) map[String(d.id).toLowerCase()] = entry;
      if (d.name) {
        map[String(d.name).toLowerCase()] = entry;
        map[String(d.name).toLowerCase().replace(/[^a-z0-9]+/g, '_')] = entry;
      }
    });
  }
  return map;
}

export const MECHANICS_DB = {
  species: buildSpeciesCatalog(),
  hindrances: buildHindrancesCatalog(),
  features: buildFeaturesCatalog()
};

export interface CharacterValidationResult {
  isValid: boolean;
  totalCPCost: number;
  totalBPCost: number;
  personalHindranceRefund: number;
  exemptStigmaRefund: number;
  backgroundSkillPointsUsed: number;
  errors: string[];
}

export class CharacterBuilder {
  public readonly MAX_CP = 150;
  public readonly MAX_BP = 150; // Backward-compatible alias
  public readonly PERSONAL_HINDRANCE_CAP = 10;
  public readonly HINDRANCE_ARBITRAGE_CAP = 160; // 150 CP + 10 CP max personal hindrances (Stigmas & Species flaws exempt)
  public readonly BACKGROUND_SKILL_POOL = 60;    // 20 Faction + 20 Origin + 20 Occupation
  public readonly CREATION_SKILL_RANK_CAP = 11;
  public readonly MAX_SKILL_RANK = 30;

  /**
   * Validates the entire persona draft against the Canonical 1.00 CHARACTER CREATION.md Curve.
   */
  public validate(draft: CharacterDraft): CharacterValidationResult {
    const errors: string[] = [];
    let spentCP = 0;
    let rawPersonalHindranceCP = 0;
    let exemptStigmaCP = 0;

    const species = MECHANICS_DB.species[draft.speciesId] || MECHANICS_DB.species[String(draft.speciesId || '').toLowerCase()];
    if (!species) {
      return {
        isValid: false,
        totalCPCost: 0,
        totalBPCost: 0,
        personalHindranceRefund: 0,
        exemptStigmaRefund: 0,
        backgroundSkillPointsUsed: 0,
        errors: [`Invalid Species Selection: '${draft.speciesId}'.`]
      };
    }

    // 1. Calculate Species Cost
    spentCP += species.cp_cost;

    // 2. Validate Attribute Parity (+4/+5 Caps)
    for (const [attr, value] of Object.entries(draft.attributes || {})) {
      if (attr === 'dex' && draft.attributes.agi !== undefined) continue;
      if (attr === 'con' && draft.attributes.sta !== undefined) continue;
      const cap = species.parity_cap[attr] ?? 4;
      if (value !== undefined && value > cap) {
        errors.push(`Attribute Parity Violation: ${attr.toUpperCase()} (${value}) exceeds species cap of +${cap}.`);
      }
      if (value !== undefined && value > 0) spentCP += (value * 5);
    }

    // 3. Calculate Personal Hindrances (capped at +10 CP) & Exempt Stigmas
    for (const hindId of (draft.hindrances || [])) {
      const key = String(hindId || '').toLowerCase();
      const hindrance = MECHANICS_DB.hindrances[key];
      if (hindrance) {
        if (hindrance.isStigma || key.includes('stigma')) {
          exemptStigmaCP += hindrance.cp_yield;
        } else {
          rawPersonalHindranceCP += hindrance.cp_yield;
        }
      }
    }

    for (const stigmaId of (draft.stigmas || [])) {
      const key = String(stigmaId || '').toLowerCase();
      const stigma = MECHANICS_DB.hindrances[key];
      exemptStigmaCP += stigma ? stigma.cp_yield : 2;
    }

    const cappedPersonalHindranceCP = Math.min(this.PERSONAL_HINDRANCE_CAP, rawPersonalHindranceCP);

    // 4. Calculate Features
    for (const featId of (draft.features || [])) {
      const key = String(featId || '').toLowerCase();
      const feature = MECHANICS_DB.features[key];
      spentCP += feature ? feature.cp_cost : 3;
    }

    // 5. Background Skill Pool (up to 60 free SP) & Skill Rank Caps (11 creation / 30 max)
    let backgroundSkillPointsUsed = 0;
    const bgSkills = draft.backgroundSkills || {};
    for (const [, bgRank] of Object.entries(bgSkills)) {
      const r = Math.max(0, Number(bgRank) || 0);
      backgroundSkillPointsUsed += r;
    }
    if (backgroundSkillPointsUsed > this.BACKGROUND_SKILL_POOL) {
      errors.push(`Background Skill Pool Violation: Used ${backgroundSkillPointsUsed} free SP, exceeding ${this.BACKGROUND_SKILL_POOL} SP limit.`);
    }

    const skillCap = draft.isPostCreation ? this.MAX_SKILL_RANK : this.CREATION_SKILL_RANK_CAP;
    for (const [skillId, totalRank] of Object.entries(draft.skills || {})) {
      const rank = Math.max(0, Number(totalRank) || 0);
      if (rank > skillCap) {
        errors.push(`Skill Rank Cap Violation: ${skillId} (${rank}) exceeds ${draft.isPostCreation ? 'maximum' : 'creation'} cap of Rank ${skillCap}.`);
      }
      const freeFromBg = Math.max(0, Number(bgSkills[skillId]) || 0);
      const purchasedRanks = Math.max(0, rank - freeFromBg);
      spentCP += purchasedRanks; // 1 CP = 1 Skill Point
    }

    // 6. Purchased Vitality / Health / Structure: 1 CP = +5 points (Zero Stamina Scaling)
    const pVit = Math.max(0, Number(draft.purchasedVitality) || 0);
    const pHea = Math.max(0, Number(draft.purchasedHealth) || 0);
    const pStr = Math.max(0, Number(draft.purchasedStructure) || 0);
    if (pVit > 0) spentCP += Math.ceil(pVit / 5);
    if (pHea > 0) spentCP += Math.ceil(pHea / 5);
    if (pStr > 0) spentCP += Math.ceil(pStr / 5);

    // 7. Enforce Economy Boundaries (150 CP + up to 10 CP Personal Hindrances + Exempt Stigmas)
    const totalMaxCP = this.MAX_CP + cappedPersonalHindranceCP + exemptStigmaCP;

    if (spentCP > totalMaxCP) {
      errors.push(`Economy Violation: Spent ${spentCP} CP, but limit is ${totalMaxCP} CP (150 base + ${cappedPersonalHindranceCP} Personal Hindrances + ${exemptStigmaCP} Exempt Stigmas).`);
    }

    return {
      isValid: errors.length === 0,
      totalCPCost: spentCP,
      totalBPCost: spentCP,
      personalHindranceRefund: cappedPersonalHindranceCP,
      exemptStigmaRefund: exemptStigmaCP,
      backgroundSkillPointsUsed,
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
