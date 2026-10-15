/**
 * @file BastionAgent.ts
 * @description Stage 7 BASTION Rules Agent.
 * Executes Gemini Structured Outputs (JSON Schema) and enforces Tangent SF RP rules:
 * 150 BP character generation validation middleware, Tech Level parameters, and combat math.
 */

import { VertexAIGateway } from './VertexAIGateway.ts';
import { synthesizeCharacterWithBastion } from '../../services/bastionCharacterEngine.js';

export interface TangentAttributeStats {
  strength: number;
  agility: number;
  stamina: number;
  intellect: number;
  wisdom: number;
  charisma: number;
}

export interface TangentCharacterDraft {
  name: string;
  species: string;
  background?: string;
  attributes: TangentAttributeStats;
  skills: Record<string, number>;
  traits?: string[];
  augmentations?: string[];
  features?: string[];
  weapons?: string[];
  armor?: string[];
  vitals?: {
    health: number;
    vitality: number;
    structure: number;
  };
  pillars?: {
    archetype: string;
    species: string;
    faction: string;
    origin: string;
    occupation: string;
  };
}

export interface BastionValidationResult {
  isValid: boolean;
  totalCpSpent?: number;
  totalBpSpent: number;
  maxCp?: number;
  maxBp: number;
  breakdown: {
    attributesCp?: number;
    attributesBp: number;
    skillsCp?: number;
    skillsBp: number;
    traitsCp?: number;
    traitsBp: number;
    augmentationsCp?: number;
    augmentationsBp: number;
  };
  errors: string[];
  correctedDraft?: TangentCharacterDraft;
}

export class BastionRulesAgent {
  private readonly MAX_BP = 150;
  private readonly ATTR_BASE = 0;
  private readonly ATTR_COST_PER_POINT = 5;
  private readonly SKILL_COST_PER_RANK = 1;

  /**
   * Generates a fully compliant Tangent character statblock grounded in the 5-Pillar Character Engine
   * with structured output and 150 BP validation middleware.
   */
  public async generateStatblock(
    concept: string,
    species: string = 'Human',
    techLevel: number = 3
  ): Promise<{ draft: TangentCharacterDraft; validation: BastionValidationResult }> {
    // 1. Run deterministic 5-Pillar Character Synthesis Engine as canonical foundation
    const pillarSynth: any = (synthesizeCharacterWithBastion as any)({
      prompt: concept || 'Tactical Operative',
      preferredSpecies: species && species !== 'Human' ? species : undefined,
      techLevel
    });

    const synthChar: any = pillarSynth?.character || {};
    const synthPillars: any = pillarSynth?.pillars;

    const prompt = `
Generate a canonical Tangent SFF RPG character conforming strictly to 150 Character Points (CP).
Concept: "${concept}"
Species: "${synthPillars?.species?.name || species}"
Archetype: "${synthPillars?.archetype?.name || 'The Operative'}"
Faction: "${synthPillars?.faction?.name || 'Independent'}"
Origin: "${synthPillars?.origin?.name || 'Urban'}"
Occupation: "${synthPillars?.occupation?.name || 'Operative'}"
Tech Level: TL${techLevel}

Rules:
- 6 Core Attributes: Strength, Agility, Stamina, Intellect, Wisdom, Charisma.
- Baseline attributes start at 0 (soft cap +4 at creation). Each +1 costs 5 CP.
- Skills cost 1 CP per rank (max rank 5 for starting characters).
- Base Vitals: 30 Vitality, 30 Health (60 Structure for Synthetics/Mecha). Stamina provides Toughness DR, not flat VP/HP.
- Total CP spent must be exactly 150.
`;

    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        species: { type: 'string' },
        background: { type: 'string' },
        attributes: {
          type: 'object',
          properties: {
            strength: { type: 'integer' },
            agility: { type: 'integer' },
            stamina: { type: 'integer' },
            intellect: { type: 'integer' },
            wisdom: { type: 'integer' },
            charisma: { type: 'integer' }
          },
          required: ['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma']
        },
        skills: {
          type: 'object',
          additionalProperties: { type: 'integer' }
        }
      },
      required: ['name', 'species', 'attributes', 'skills']
    };

    const response = await VertexAIGateway.generateContent(prompt, {
      model: 'gemini-2.0-flash',
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: schema
    });

    const canonicalPillarsSummary = synthPillars ? {
      archetype: synthPillars.archetype?.name || 'The Operative',
      species: synthPillars.species?.name || species,
      faction: synthPillars.faction?.name || 'Independent',
      origin: synthPillars.origin?.name || 'Urban',
      occupation: synthPillars.occupation?.name || 'Operative'
    } : undefined;

    // Build skill map from 5-Pillar synthesis
    const pillarSkillsMap: Record<string, number> = {};
    if (Array.isArray(synthChar.skills)) {
      for (const sk of synthChar.skills) {
        if (sk && sk.name && typeof sk.rank === 'number') {
          pillarSkillsMap[sk.name] = sk.rank;
        }
      }
    }

    let draft: TangentCharacterDraft;
    if (response.data && response.data.attributes && !response.isSimulated) {
      draft = {
        name: response.data.name || synthChar['char-name'] || 'Operative',
        species: response.data.species || synthPillars?.species?.name || species,
        background: response.data.background || concept,
        attributes: response.data.attributes,
        skills: Object.keys(response.data.skills || {}).length > 0 ? response.data.skills : pillarSkillsMap,
        traits: [],
        augmentations: [],
        features: Array.isArray(synthChar.features) ? synthChar.features.map((f: any) => f.name || String(f)) : [],
        weapons: Array.isArray(synthChar.weapons) ? synthChar.weapons.map((w: any) => w.name || String(w)) : [],
        armor: Array.isArray(synthChar.armor) ? synthChar.armor.map((a: any) => a.name || String(a)) : [],
        vitals: { health: 30, vitality: 30, structure: 60 },
        pillars: canonicalPillarsSummary
      };
    } else {
      // Deterministic 5-Pillar Character Synthesis fallback
      const rawAttrs = pillarSynth?.rawAttributes || {};
      draft = {
        name: synthChar['char-name'] || 'Vanguard Operator',
        species: synthPillars?.species?.name || species,
        background: concept,
        attributes: {
          strength: Math.max(0, Number(rawAttrs['attr-strength'] ?? 2)),
          agility: Math.max(0, Number(rawAttrs['attr-agility'] ?? 2)),
          stamina: Math.max(0, Number(rawAttrs['attr-stamina'] ?? 2)),
          intellect: Math.max(0, Number(rawAttrs['attr-intellect'] ?? 1)),
          wisdom: Math.max(0, Number(rawAttrs['attr-wisdom'] ?? 1)),
          charisma: Math.max(0, Number(rawAttrs['attr-charisma'] ?? 1))
        },
        skills: Object.keys(pillarSkillsMap).length > 0 ? pillarSkillsMap : {
          Firearms: 5,
          Athletics: 5,
          Perception: 4,
          Electronics: 4,
          Stealth: 4,
          FirstAid: 4,
          Demolitions: 4,
          Piloting: 4,
          Survival: 4,
          Melee: 5,
          Engineering: 4,
          Tactics: 4,
          Medicine: 4,
          Security: 5
        },
        traits: [],
        augmentations: [],
        features: Array.isArray(synthChar.features) ? synthChar.features.map((f: any) => f.name || String(f)) : [],
        weapons: Array.isArray(synthChar.weapons) ? synthChar.weapons.map((w: any) => w.name || String(w)) : [],
        armor: Array.isArray(synthChar.armor) ? synthChar.armor.map((a: any) => a.name || String(a)) : [],
        vitals: {
          health: synthChar.health ?? 30,
          vitality: synthChar.vitality ?? 30,
          structure: synthChar.structure ?? 60
        },
        pillars: canonicalPillarsSummary
      };
    }

    // Run post-generation mathematical validation middleware
    let validation = this.validateAndBalanceBp(draft);
    if (validation.correctedDraft) {
      draft = validation.correctedDraft;
      validation = this.validateAndBalanceBp(draft);
    }

    return { draft, validation };
  }

  /**
   * Validates BP math and balances any deviations to ensure exact 150 BP compliance.
   */
  public validateAndBalanceBp(draft: TangentCharacterDraft): BastionValidationResult {
    let attributesBp = 0;
    const attrs = draft.attributes;
    const keys: Array<keyof TangentAttributeStats> = ['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'];

    for (const key of keys) {
      const val = attrs[key] ?? this.ATTR_BASE;
      if (val > this.ATTR_BASE) {
        attributesBp += (val - this.ATTR_BASE) * this.ATTR_COST_PER_POINT;
      }
    }

    let skillsBp = 0;
    for (const skillName of Object.keys(draft.skills || {})) {
      const rank = draft.skills[skillName] ?? 0;
      skillsBp += rank * this.SKILL_COST_PER_RANK;
    }

    const traitsBp = (draft.traits || []).length * 5; // standard trait cost
    const augmentationsBp = (draft.augmentations || []).length * 10;

    const totalBpSpent = attributesBp + skillsBp + traitsBp + augmentationsBp;
    const errors: string[] = [];

    if (totalBpSpent > this.MAX_BP) {
      errors.push(`Statblock exceeded CP limit: spent ${totalBpSpent} CP out of ${this.MAX_BP} max.`);
    } else if (totalBpSpent < this.MAX_BP) {
      errors.push(`Statblock unspent CP: spent ${totalBpSpent} CP out of ${this.MAX_BP} available.`);
    }

    // Self-balancing middleware: if under or over, adjust skills across the skill map
    let correctedDraft: TangentCharacterDraft | undefined;
    if (totalBpSpent !== this.MAX_BP) {
      correctedDraft = JSON.parse(JSON.stringify(draft));
      let remainingDelta = this.MAX_BP - totalBpSpent;

      if (correctedDraft) {
        if (!correctedDraft.skills || Object.keys(correctedDraft.skills).length === 0) {
          correctedDraft.skills = { Perception: 0 };
        }
        const skillKeys = Object.keys(correctedDraft.skills);
        if (remainingDelta > 0) {
          // Add remaining BP to the first skill (1 BP per skill rank)
          const firstSkill = skillKeys[0];
          correctedDraft.skills[firstSkill] = (correctedDraft.skills[firstSkill] || 0) + Math.round(remainingDelta / this.SKILL_COST_PER_RANK);
        } else if (remainingDelta < 0) {
          // Subtract excess BP across skills until remainingDelta == 0
          for (const sk of skillKeys) {
            if (remainingDelta >= 0) break;
            const currentRank = correctedDraft.skills[sk] || 0;
            const reduction = Math.min(currentRank, Math.abs(Math.round(remainingDelta / this.SKILL_COST_PER_RANK)));
            correctedDraft.skills[sk] = currentRank - reduction;
            remainingDelta += reduction * this.SKILL_COST_PER_RANK;
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      totalCpSpent: totalBpSpent,
      totalBpSpent,
      maxCp: this.MAX_BP,
      maxBp: this.MAX_BP,
      breakdown: {
        attributesCp: attributesBp,
        attributesBp,
        skillsCp: skillsBp,
        skillsBp,
        traitsCp: traitsBp,
        traitsBp,
        augmentationsCp: augmentationsBp,
        augmentationsBp
      },
      errors,
      correctedDraft
    };
  }

  public validateAndBalanceCp(draft: TangentCharacterDraft): BastionValidationResult {
    return this.validateAndBalanceBp(draft);
  }
}

export const BastionAgent = new BastionRulesAgent();
export default BastionAgent;
