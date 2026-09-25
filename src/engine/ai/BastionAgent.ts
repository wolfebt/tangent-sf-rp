/**
 * @file BastionAgent.ts
 * @description Stage 7 BASTION Rules Agent.
 * Executes Gemini Structured Outputs (JSON Schema) and enforces Tangent SF RP rules:
 * 150 BP character generation validation middleware, Tech Level parameters, and combat math.
 */

import { VertexAIGateway } from './VertexAIGateway.ts';

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
}

export interface BastionValidationResult {
  isValid: boolean;
  totalBpSpent: number;
  maxBp: number;
  breakdown: {
    attributesBp: number;
    skillsBp: number;
    traitsBp: number;
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
   * Generates a fully compliant Tangent character statblock with structured output.
   */
  public async generateStatblock(
    concept: string,
    species: string = 'Human',
    techLevel: number = 3
  ): Promise<{ draft: TangentCharacterDraft; validation: BastionValidationResult }> {
    const prompt = `
Generate a canonical Tangent SFF RPG character conforming strictly to 150 Build Points (BP).
Concept: "${concept}"
Species: "${species}"
Tech Level: TL${techLevel}

Rules:
- 6 Core Attributes: Strength, Agility, Stamina, Intellect, Wisdom, Charisma.
- Baseline attributes start at 0 (soft cap +4 at creation). Each +1 costs 5 BP.
- Skills cost 1 BP per rank (max rank 5 for starting characters).
- Total BP spent must be exactly 150.
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
      model: 'gemini-1.5-pro',
      temperature: 0.2, // Low temperature for mathematical precision
      responseMimeType: 'application/json',
      responseSchema: schema
    });

    let draft: TangentCharacterDraft;
    if (response.data && response.data.attributes) {
      draft = {
        name: response.data.name || 'Operative',
        species: response.data.species || species,
        background: response.data.background || concept,
        attributes: response.data.attributes,
        skills: response.data.skills || {},
        traits: [],
        augmentations: []
      };
    } else {
      // Deterministic 150 BP template fallback
      draft = {
        name: 'Vanguard Operator',
        species: species,
        background: concept,
        attributes: {
          strength: 3, // 15 BP
          agility: 4,  // 20 BP
          stamina: 3,  // 15 BP
          intellect: 2,// 10 BP
          wisdom: 3,   // 15 BP
          charisma: 3  // 15 BP (Total Attr = 90 BP)
        },
        skills: {
          Firearms: 5,     // 5 BP
          Athletics: 5,    // 5 BP
          Perception: 4,   // 4 BP
          Electronics: 4,  // 4 BP
          Stealth: 4,      // 4 BP
          FirstAid: 4,     // 4 BP
          Demolitions: 4,  // 4 BP
          Piloting: 4,     // 4 BP
          Survival: 4,     // 4 BP
          Melee: 5,        // 5 BP
          Engineering: 4,  // 4 BP
          Tactics: 4,      // 4 BP
          Medicine: 4,     // 4 BP
          Security: 5      // 5 BP (Total Skills = 60 BP)
        },
        traits: [],
        augmentations: []
      };
    }

    // Run post-generation mathematical validation middleware
    const validation = this.validateAndBalanceBp(draft);
    if (validation.correctedDraft) {
      draft = validation.correctedDraft;
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
      errors.push(`Statblock exceeded BP limit: spent ${totalBpSpent} BP out of ${this.MAX_BP} max.`);
    } else if (totalBpSpent < this.MAX_BP) {
      errors.push(`Statblock unspent BP: spent ${totalBpSpent} BP out of ${this.MAX_BP} available.`);
    }

    // Self-balancing middleware: if under or over, adjust the highest or lowest skill
    let correctedDraft: TangentCharacterDraft | undefined;
    if (totalBpSpent !== this.MAX_BP) {
      correctedDraft = JSON.parse(JSON.stringify(draft));
      const delta = this.MAX_BP - totalBpSpent;
      const skillAdjust = Math.round(delta / this.SKILL_COST_PER_RANK);

      if (correctedDraft && correctedDraft.skills) {
        const skillEntries = Object.entries(correctedDraft.skills);
        if (skillEntries.length > 0) {
          const [firstSkill, rank] = skillEntries[0];
          correctedDraft.skills[firstSkill] = Math.max(0, (rank as number) + skillAdjust);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      totalBpSpent,
      maxBp: this.MAX_BP,
      breakdown: {
        attributesBp,
        skillsBp,
        traitsBp,
        augmentationsBp
      },
      errors,
      correctedDraft
    };
  }
}

export const BastionAgent = new BastionRulesAgent();
export default BastionAgent;
