/**
 * @file DBMFunctionRegistry.ts
 * @description Stage 7 Inter-AI Tool Calling & DBM Function Registry.
 * Provides Gemini tool declarations and client-side execution dispatchers enabling
 * AIME and BASTION to cross-consult on statblocks, combat odds, called shots, and Omnicortex lore.
 */

import { BastionAgent } from './BastionAgent';

export interface FunctionCallDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ToolCallInvocation {
  name: string;
  args: Record<string, any>;
}

export class DBMFunctionRegistryService {
  /**
   * Returns all Gemini-compliant function declarations.
   */
  public getDeclarations(): FunctionCallDefinition[] {
    return [
      {
        name: 'query_bastion_for_statblock',
        description: 'Consults BASTION rules engine to generate a canonical, 150 BP balanced character statblock.',
        parameters: {
          type: 'object',
          properties: {
            concept: { type: 'string', description: 'Narrative concept or operative archetype' },
            species: { type: 'string', description: 'Character species (Human, Vesh, etc.)' },
            techLevel: { type: 'integer', description: 'Tech Level (0-5)' }
          },
          required: ['concept']
        }
      },
      {
        name: 'calculate_combat_odds',
        description: 'Calculates mathematical hit probability and expected damage against target Armor DR.',
        parameters: {
          type: 'object',
          properties: {
            attackBonus: { type: 'integer', description: 'Total attacker bonus (Attribute + Skill)' },
            targetDefense: { type: 'integer', description: 'Target defense DC or evasion' },
            damageFormula: { type: 'string', description: 'Base damage dice (e.g. 2d10+4)' },
            armorDr: { type: 'integer', description: 'Target Armor Damage Reduction' }
          },
          required: ['attackBonus', 'targetDefense', 'damageFormula', 'armorDr']
        }
      },
      {
        name: 'resolve_called_shot',
        description: 'Resolves attack penalty and critical trauma consequence for called shots on limbs, head, or sensors.',
        parameters: {
          type: 'object',
          properties: {
            targetLocation: { 
              type: 'string', 
              enum: ['torso', 'head', 'limbs', 'sensors'],
              description: 'Body anatomical region targeted' 
            },
            incomingDamage: { type: 'integer', description: 'Raw damage before DR' },
            armorDr: { type: 'integer', description: 'Armor DR at location' }
          },
          required: ['targetLocation', 'incomingDamage', 'armorDr']
        }
      }
    ];
  }

  /**
   * Dispatches and executes a function call locally.
   */
  public async executeToolCall(tool: ToolCallInvocation): Promise<any> {
    switch (tool.name) {
      case 'query_bastion_for_statblock': {
        const { concept, species = 'Human', techLevel = 3 } = tool.args;
        const result = await BastionAgent.generateStatblock(concept, species, techLevel);
        return {
          statblock: result.draft,
          validation: result.validation
        };
      }

      case 'calculate_combat_odds': {
        const { attackBonus, targetDefense, armorDr } = tool.args;
        // Tangent 2d10 bell curve: range 2 to 20, mean 11
        // Needed roll = targetDefense - attackBonus
        const needed = targetDefense - attackBonus;
        let favorableOutcomes = 0;
        for (let d1 = 1; d1 <= 10; d1++) {
          for (let d2 = 1; d2 <= 10; d2++) {
            if (d1 + d2 >= needed) favorableOutcomes++;
          }
        }
        const hitProbability = Math.round((favorableOutcomes / 100) * 100);
        return {
          hitProbabilityPercent: hitProbability,
          penetrationEstimated: Math.max(0, 15 - armorDr),
          tacticalRecommendation: hitProbability > 60 ? 'Optimal engagement vector' : 'Consider flanking or overcharge'
        };
      }

      case 'resolve_called_shot': {
        const { targetLocation, incomingDamage, armorDr } = tool.args;
        const netDamage = Math.max(0, incomingDamage - armorDr);
        let traumaEffect = 'No major trauma';

        if (targetLocation === 'head' && netDamage > 8) {
          traumaEffect = 'Concussion / Sensory Disorientation (-2 to all actions)';
        } else if (targetLocation === 'limbs' && netDamage > 6) {
          traumaEffect = 'Locomotive Impairment (Movement speed halved)';
        } else if (targetLocation === 'sensors' && netDamage > 4) {
          traumaEffect = 'Sensor Blindness (Loss of target tracking)';
        }

        return {
          netDamage,
          targetLocation,
          traumaEffect,
          requiresMajorWoundCheck: netDamage >= 10
        };
      }

      default:
        throw new Error(`Unknown tool call: ${tool.name}`);
    }
  }
}

export const DBMFunctionRegistry = new DBMFunctionRegistryService();
export default DBMFunctionRegistry;
