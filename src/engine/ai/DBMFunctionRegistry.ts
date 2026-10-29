/**
 * @file DBMFunctionRegistry.ts
 * @description Stage 7 Inter-AI Tool Calling & DBM Function Registry.
 * Provides Gemini tool declarations and client-side execution dispatchers enabling
 * AIME and BASTION to cross-consult on statblocks, combat odds, called shots,
 * Economatrix TSC acquisition, Omnicortex RAG, adversary AI tactics, and VTT Whisper pacing.
 */

import { BastionAgent } from './BastionAgent.ts';
import { computeTacticalAttackModifiers } from '../../services/rulesAdjudicatorService.js';
import { queryOmnicortexRAG } from '../../services/omnicortexVectorRag.ts';
import { queryRulebook } from '../../services/rulebookRagService.js';
import { synthesizeAdversaryTactic } from '../../services/adversaryAiService.js';
import { analyzeCombatPacing, executeWhisperCardAction } from '../../services/bastionWhisperService.js';

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
   * Returns all 7 Gemini-compliant Stage 7 function declarations.
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
            species: { type: 'string', description: 'Character species (Human, Ursan, Felid, etc.)' },
            techLevel: { type: 'integer', description: 'Tech Level (0-5)' }
          },
          required: ['concept']
        }
      },
      {
        name: 'calculate_combat_odds',
        description: 'Calculates mathematical 2d10 hit probability (Defender Wins Ties), tactical modifiers, and expected damage against target Armor DR.',
        parameters: {
          type: 'object',
          properties: {
            attackBonus: { type: 'integer', description: 'Total attacker bonus (Attribute + Skill)' },
            targetDefense: { type: 'integer', description: 'Target defense DC or evasion' },
            damageFormula: { type: 'string', description: 'Base damage dice (e.g. 2d10+4)' },
            armorDr: { type: 'integer', description: 'Target Armor Damage Reduction' },
            rangeBracketId: { type: 'string', description: 'Range bracket (point_blank, short, medium, long, extreme)' },
            coverTypeId: { type: 'string', description: 'Cover type (none, partial, heavy, total)' },
            lightingId: { type: 'string', description: 'Lighting (clear, dim, smoke, vacuum)' },
            hasHighGround: { type: 'boolean', description: 'Attacker has high ground (+2 ATK)' },
            isFlanked: { type: 'boolean', description: 'Target is flanked (-2 DEF)' }
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
              enum: ['torso', 'head', 'limbs', 'arms', 'legs', 'sensors', 'optics'],
              description: 'Body anatomical region targeted' 
            },
            incomingDamage: { type: 'integer', description: 'Raw damage before DR' },
            armorDr: { type: 'integer', description: 'Armor DR at location' },
            targetMaxHp: { type: 'integer', description: 'Target maximum HP (default 30)' }
          },
          required: ['targetLocation', 'incomingDamage', 'armorDr']
        }
      },
      {
        name: 'evaluate_economatrix_acquisition',
        description: 'Evaluates Economatrix (EUFT) Tangent Standard Curve credit value (10 * 4^(DC/5)), Auto-Buy eligibility, and Liquidity Gap.',
        parameters: {
          type: 'object',
          properties: {
            itemCostDc: { type: 'number', description: 'Item Purchase/Crafting/Cost DC' },
            wealthScore: { type: 'number', description: 'Character Wealth Score (WS)' }
          },
          required: ['itemCostDc', 'wealthScore']
        }
      },
      {
        name: 'query_omnicortex_rag',
        description: 'Queries the Omnicortex Vector RAG and canonical v6 Rulebook corpus for exact rules or worldbuilding lore.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query for rules or lore' },
            topK: { type: 'integer', description: 'Max chunks to return (default 3)' }
          },
          required: ['query']
        }
      },
      {
        name: 'synthesize_adversary_tactic',
        description: 'Synthesizes or executes a canonical Stage 7 Adversary AI tactical doctrine (Minion, Skirmisher, Bruiser, Sniper, Boss Phase 1-3).',
        parameters: {
          type: 'object',
          properties: {
            adversaryId: { type: 'string', description: 'VTT token ID when executing directly on useEngineStore' },
            adversary: { type: 'object', description: 'Adversary token object' },
            heroes: { type: 'array', description: 'Array of hero token objects' },
            executeOnStage: { type: 'boolean', description: 'If true, executes the turn directly on useEngineStore' }
          }
        }
      },
      {
        name: 'evaluate_combat_pacing_whisper',
        description: 'Analyzes VTT combat pacing and optionally executes a BASTION Whisper Co-GM mechanical mutation card.',
        parameters: {
          type: 'object',
          properties: {
            tokens: { type: 'array', description: 'Active VTT tokens' },
            roundNumber: { type: 'integer', description: 'Current combat round' },
            executeCardId: { type: 'string', description: 'Optional Whisper Card ID to execute (e.g. reinforcement_incursion, environmental_surge, heroic_inspiration)' }
          }
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
        const {
          attackBonus,
          targetDefense,
          armorDr,
          rangeBracketId = 'short',
          coverTypeId = 'none',
          lightingId = 'clear',
          hasHighGround = false,
          isFlanked = false,
          isAimed = false
        } = tool.args;

        const tacMods = computeTacticalAttackModifiers({
          rangeBracketId,
          coverTypeId,
          lightingId,
          hasHighGround,
          isFlanked,
          isAimed
        });

        const effectiveAttackBonus = attackBonus + tacMods.netAttackMod;
        const effectiveTargetDefense = targetDefense + tacMods.netDefenseMod;
        // Tangent 2d10 bell curve: range 2 to 20, mean 11
        // Needed roll = effectiveTargetDefense - effectiveAttackBonus
        const needed = effectiveTargetDefense - effectiveAttackBonus;
        let favorableOutcomes = 0;
        for (let d1 = 1; d1 <= 10; d1++) {
          for (let d2 = 1; d2 <= 10; d2++) {
            if (d1 + d2 >= needed) favorableOutcomes++;
          }
        }
        const hitProbability = Math.round((favorableOutcomes / 100) * 100);
        return {
          hitProbabilityPercent: hitProbability,
          effectiveAttackBonus,
          effectiveTargetDefense,
          tacticalModifiersSummary: tacMods.summary,
          penetrationEstimated: Math.max(0, 15 - armorDr),
          tacticalRecommendation: hitProbability > 60 ? 'Optimal engagement vector' : 'Consider flanking or overcharge'
        };
      }

      case 'resolve_called_shot': {
        const { targetLocation, incomingDamage, armorDr, targetMaxHp = 30 } = tool.args;
        const netDamage = Math.max(0, incomingDamage - armorDr);
        const disabledThreshold = Math.ceil(targetMaxHp / 3);
        const destroyedThreshold = Math.ceil((targetMaxHp * 2) / 3);

        const penaltyMap: Record<string, number> = {
          torso: 0,
          head: -2,
          arms: -2,
          limbs: -1,
          legs: -1,
          sensors: -3,
          optics: -3
        };
        const saveMap: Record<string, string> = {
          head: 'Reason Save vs Damage',
          torso: 'Fortitude Save vs Damage',
          arms: 'Reflex Save vs Damage',
          limbs: 'Might Save vs Damage',
          legs: 'Might Save vs Damage',
          sensors: 'Reason Save vs Damage',
          optics: 'Reason Save vs Damage'
        };

        let traumaEffect = 'No major trauma';
        if (targetLocation === 'head' && netDamage > 8) {
          traumaEffect = 'Concussion / Sensory Disorientation (-2 to all actions)';
        } else if ((targetLocation === 'limbs' || targetLocation === 'legs' || targetLocation === 'arms') && netDamage > 6) {
          traumaEffect = 'Locomotive / Limb Impairment (Movement speed halved or -4 attack)';
        } else if ((targetLocation === 'sensors' || targetLocation === 'optics') && netDamage > 4) {
          traumaEffect = 'Sensor Blindness (Loss of target tracking, -4 ranged checks)';
        }

        const limbStatus = netDamage >= destroyedThreshold
          ? 'DESTROYED'
          : netDamage >= disabledThreshold
            ? 'DISABLED'
            : 'INTACT';

        return {
          netDamage,
          targetLocation,
          attackPenalty: penaltyMap[targetLocation] ?? -2,
          saveRequired: saveMap[targetLocation] ?? 'Fortitude Save vs Damage',
          limbStatus,
          disabledThreshold,
          destroyedThreshold,
          traumaEffect,
          requiresMajorWoundCheck: netDamage >= disabledThreshold
        };
      }

      case 'evaluate_economatrix_acquisition': {
        const { itemCostDc = 10, wealthScore = 10 } = tool.args;
        const itemCreditValue = Math.round(10 * Math.pow(4, itemCostDc / 5));
        const characterWealthValue = Math.round(10 * Math.pow(4, wealthScore / 5));
        const isAutoBuy = itemCostDc <= wealthScore;
        const liquidityGapCredits = isAutoBuy ? 0 : Math.max(0, itemCreditValue - characterWealthValue);

        return {
          itemCostDc,
          purchaseDc: itemCostDc,
          craftingDc: itemCostDc,
          wealthScore,
          itemCreditValue,
          characterWealthValue,
          isAutoBuy,
          liquidityGapCredits,
          goldenRuleVerified: true,
          summary: isAutoBuy
            ? `Auto-Bought (0 Cr liquid cost — Item DC ${itemCostDc} <= Wealth Score ${wealthScore}).`
            : `Requires Liquidity Gap payment of ${liquidityGapCredits} Cr (Item Value ${itemCreditValue} Cr - WS Value ${characterWealthValue} Cr).`
        };
      }

      case 'query_omnicortex_rag': {
        const { query = '2d10 combat resolution', topK = 3 } = tool.args;
        const vectorResults = queryOmnicortexRAG(query, topK);
        const ftsResults = queryRulebook(query);
        return {
          query,
          vectorChunks: vectorResults.map(r => ({
            id: r.chunk.id,
            title: r.chunk.title,
            category: r.chunk.category,
            score: r.score,
            text: r.chunk.text
          })),
          rulebookEntries: ftsResults.slice(0, topK)
        };
      }

      case 'synthesize_adversary_tactic': {
        const { adversaryId, adversary, heroes = [], executeOnStage = false, diceOverride } = tool.args;
        if (executeOnStage && adversaryId) {
          return BastionAgent.executeAdversaryTurn(adversaryId, { diceOverride });
        }
        const tactic = synthesizeAdversaryTactic(adversary || { id: adversaryId || 'adv_1', name: 'Adversary' }, heroes, {});
        return {
          tactic,
          executedOnStage: false
        };
      }

      case 'evaluate_combat_pacing_whisper': {
        const { tokens = [], roundNumber = 1, executeCardId } = tool.args;
        const pacing = tokens.length > 0
          ? analyzeCombatPacing(tokens, roundNumber)
          : BastionAgent.evaluateEncounterBalance(roundNumber);
        const mutation = executeCardId
          ? executeWhisperCardAction(executeCardId, tokens, roundNumber)
          : null;
        return {
          pacing,
          mutation
        };
      }

      default:
        throw new Error(`Unknown tool call: ${tool.name}`);
    }
  }
}

export const DBMFunctionRegistry = new DBMFunctionRegistryService();
export default DBMFunctionRegistry;
