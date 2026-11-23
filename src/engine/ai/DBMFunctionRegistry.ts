/**
 * @file DBMFunctionRegistry.ts
 * @description Stage 7 Inter-AI Tool Calling & DBM Function Registry.
 * Provides Gemini tool declarations and client-side execution dispatchers enabling
 * AIME and BASTION to cross-consult on statblocks, combat odds, called shots,
 * armor mitigation, 150-CP operator ledgers, Economatrix TSC acquisition,
 * role-gated Omnicortex RAG, adversary AI tactics, VTT Whisper pacing, and multi-group encounters.
 */

import { BastionAgent } from './BastionAgent.ts';
import { computeTacticalAttackModifiers } from '../../services/rulesAdjudicatorService.js';
import { queryOmnicortexRAG } from '../../services/omnicortexVectorRag.ts';
import { queryRulebook } from '../../services/rulebookRagService.js';
import { synthesizeAdversaryTactic } from '../../services/adversaryAiService.js';
import { analyzeCombatPacing, executeWhisperCardAction } from '../../services/bastionWhisperService.js';
import { calculateCreditValue } from '../../engines/tangentEconEngine.js';
import {
  compute2d10HitOdds,
  calculateDamageMitigation,
  routePoolDamage
} from '../rules/CanonicalCombatMath.ts';

export interface FunctionCallDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  allowedRoles?: Array<'operator' | 'architect'>;
}

export interface ToolCallInvocation {
  name: string;
  args: Record<string, any>;
}

export interface ToolExecutionContext {
  role?: 'operator' | 'architect' | string;
}

const ARCHITECT_ONLY_TOOLS = new Set([
  'synthesize_adversary_tactic',
  'evaluate_combat_pacing_whisper',
  'evaluate_multi_group_encounter',
]);

export class DBMFunctionRegistryService {
  /**
   * Returns Stage 7 Gemini-compliant function declarations, optionally filtered by epistemic role.
   * Strips internal metadata (`allowedRoles`) when serializing for Gemini's `functionDeclarations`.
   */
  public getDeclarations(role?: 'operator' | 'architect' | string): FunctionCallDefinition[] {
    const normalizedRole = role ? String(role).trim().toLowerCase() : undefined;
    const isOperatorOnly =
      normalizedRole === 'operator' ||
      normalizedRole === 'operative' ||
      normalizedRole === 'player';

    const allTools: FunctionCallDefinition[] = [
      {
        name: 'query_bastion_for_statblock',
        allowedRoles: ['operator', 'architect'],
        description:
          'Consults BASTION rules engine to generate a canonical, 150-CP balanced character statblock grounded in the 5-Pillar Character Engine.',
        parameters: {
          type: 'object',
          properties: {
            concept: { type: 'string', description: 'Narrative concept or operator archetype' },
            species: { type: 'string', description: 'Character species (Human, Ursan, Felid, etc.)' },
            techLevel: { type: 'integer', description: 'Tech Level (0-5)' }
          },
          required: ['concept']
        }
      },
      {
        name: 'calculate_combat_odds',
        allowedRoles: ['operator', 'architect'],
        description:
          'Calculates mathematical 2d10 hit probability (Defender Wins Ties), tactical modifiers, and expected damage against target Armor DR.',
        parameters: {
          type: 'object',
          properties: {
            attackBonus: { type: 'integer', description: 'Total attacker bonus (Attribute + Skill)' },
            targetDefense: { type: 'integer', description: 'Target Defense CR or active evasion total' },
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
        allowedRoles: ['operator', 'architect'],
        description:
          'Resolves attack penalty and critical trauma consequence for called shots on limbs, head, or sensors (33.3% Disabled / 66.7% Destroyed thresholds).',
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
        name: 'calculate_armor_mitigation',
        allowedRoles: ['operator', 'architect'],
        description:
          'Computes effective Armor DR using canonical Cross-Domain Diminishing Returns stacking (Highest DR + ceil[Other Cross-Domain Layer DR / 5], or optional single_highest for same-domain comparisons), Stamina Toughness DR (reducing penetrating damage down to 0), Weapon Penetration, and Vitality/Health/Structure pool overflow.',
        parameters: {
          type: 'object',
          properties: {
            incomingDamage: { type: 'integer', description: 'Raw incoming damage rolled' },
            armorLayers: {
              type: 'array',
              items: { type: 'integer' },
              description: 'Array of cross-domain Armor DR values on the hit location (e.g. [8, 5])'
            },
            staminaToughness: { type: 'integer', description: 'Natural Stamina Toughness DR (reduces penetrating damage down to min 0)' },
            penetration: { type: 'integer', description: 'Weapon Penetration value (default 0)' },
            isForceDamage: { type: 'boolean', description: 'Force kinetic damage halves effective Armor DR' },
            isSynthetic: { type: 'boolean', description: 'True for 60 SP Synthetic/Mecha structure chassis' },
            currentVitality: { type: 'integer', description: 'Current Vitality Pool (default 30)' },
            currentHealth: { type: 'integer', description: 'Current Health or Structure Pool (default 30, or 60 for synthetic)' },
            stackingMode: {
              type: 'string',
              enum: ['diminishing_returns', 'single_highest'],
              description: 'Armor layering mode: diminishing_returns (canonical cross-domain default: +1 per 5 DR of other armors) or single_highest (same-domain wearables)'
            }
          },
          required: ['incomingDamage', 'armorLayers']
        }
      },
      {
        name: 'audit_operator_cp_ledger',
        allowedRoles: ['operator', 'architect'],
        description:
          'Deterministically audits a character build against the 150-CP budget (and optional post-creation Award Points / AP), 60 Free Background SP, Base Skill (0-20, Creation Cap 11) + Specialization (1-10) rules, 4 Free Background Traits (2 Origin + 2 Occupation by default; configurable traitPolicy for future Faction trait revisions), and +10 CP Personal Hindrance cap.',
        parameters: {
          type: 'object',
          properties: {
            attributes: {
              type: 'object',
              description: '6 core attribute ranks (strength, agility, stamina, intellect, wisdom, charisma)'
            },
            skills: {
              type: 'object',
              description: 'Map of Base Skill Name -> Rank (0-20)'
            },
            specializations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  parentSkill: { type: 'string' },
                  rank: { type: 'integer' }
                }
              },
              description: 'Optional list of Specializations (Rank 1-10, requires parent Base Skill >= 6)'
            },
            freeBackgroundSpUsed: { type: 'integer', description: 'Free Background SP allocated (max 60: 20 Faction + 20 Origin + 20 Occupation)' },
            recommendedFeatureCount: { type: 'integer', description: 'Count of Recommended Features purchased at 2 CP each (max 4 discounted)' },
            standardFeatureRanks: { type: 'integer', description: 'Total standard Feature ranks at 3 CP each' },
            extraTraitCount: { type: 'integer', description: 'Traits beyond free background traits (1 CP each)' },
            traitPolicy: {
              type: 'string',
              enum: ['origin_2_occupation_2', 'origin_1_faction_1_occupation_2', 'origin_2_occupation_2_faction_1'],
              description: 'Background free trait policy (default origin_2_occupation_2: 2 Origin + 2 Occupation = 4 Free Traits)'
            },
            awardPointsEarned: { type: 'integer', description: 'Post-creation Award Points (AP) earned (1 AP = 1 CP budget expansion)' },
            personalHindranceCp: { type: 'integer', description: 'CP gained from Personal Hindrances (capped at +10 CP)' },
            vitalityUpgradesCp: { type: 'integer', description: 'CP spent on +5 VP/HP/SP upgrades' },
            isCreationStage: { type: 'boolean', description: 'Enforce Creation Cap (Base Skill Rank <= 11, Attributes soft cap +4)' }
          }
        }
      },
      {
        name: 'evaluate_economatrix_acquisition',
        allowedRoles: ['operator', 'architect'],
        description:
          'Evaluates Economatrix (EUFT) Tangent Standard Curve credit value with linear micro-modifiers, Auto-Buy eligibility (CR <= WS), Liquidity Gap, Pristine Material cost (50%), and Scrap value (10%).',
        parameters: {
          type: 'object',
          properties: {
            itemCr: { type: 'number', description: 'Item Purchase/Crafting Challenge Rating (CR)' },
            itemCostDc: { type: 'number', description: 'Legacy alias for itemCr' },
            wealthScore: { type: 'number', description: 'Character Wealth Score (WS)' },
            hasFlaw: { type: 'boolean', description: 'Optional -1 CR flaw discount (0.75x)' }
          },
          required: ['wealthScore']
        }
      },
      {
        name: 'query_omnicortex_rag',
        allowedRoles: ['operator', 'architect'],
        description:
          'Queries the Omnicortex Vector RAG and canonical v6 Rulebook corpus for exact rules or worldbuilding lore (automatically filtered by Operator vs Architect epistemic visibility).',
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
        allowedRoles: ['architect'],
        description:
          '[Architect Only] Synthesizes or executes a canonical Stage 7 Adversary AI tactical doctrine (Minion, Skirmisher, Bruiser, Sniper, Boss Phase 1-3).',
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
        allowedRoles: ['architect'],
        description:
          '[Architect Only] Analyzes VTT combat pacing and optionally executes a BASTION Whisper Co-Architect mechanical mutation card.',
        parameters: {
          type: 'object',
          properties: {
            tokens: { type: 'array', description: 'Active VTT tokens' },
            roundNumber: { type: 'integer', description: 'Current combat round' },
            executeCardId: { type: 'string', description: 'Optional Whisper Card ID to execute (e.g. reinforcement_incursion, environmental_surge, heroic_inspiration)' }
          }
        }
      },
      {
        name: 'evaluate_multi_group_encounter',
        allowedRoles: ['architect'],
        description:
          '[Architect Only] Calculates encounter Challenge Rating (CR) budgets, action-economy parity, and synchronized tension clocks across one or multiple squads/groups in the active campaign.',
        parameters: {
          type: 'object',
          properties: {
            groups: {
              type: 'array',
              description: 'Array of campaign squad summaries ({ name, partySize, averageSkillRank, averageAttrMod, averageHpPct })',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  partySize: { type: 'integer' },
                  averageSkillRank: { type: 'number' },
                  averageAttrMod: { type: 'number' },
                  averageHpPct: { type: 'number' }
                }
              }
            },
            threatTier: {
              type: 'string',
              enum: ['skirmish', 'standard', 'hard', 'boss_climax'],
              description: 'Desired encounter intensity tier'
            }
          }
        }
      }
    ];

    const filtered = isOperatorOnly
      ? allTools.filter((t) => !ARCHITECT_ONLY_TOOLS.has(t.name))
      : allTools;

    return filtered.map(({ name, description, parameters }) => ({
      name,
      description,
      parameters,
    }));
  }

  /**
   * Dispatches and executes a function call locally, enforcing epistemic role-gating.
   */
  public async executeToolCall(
    tool: ToolCallInvocation,
    context: ToolExecutionContext = {}
  ): Promise<any> {
    const normalizedRole = context?.role ? String(context.role).trim().toLowerCase() : undefined;
    const isOperatorOnly =
      normalizedRole === 'operator' ||
      normalizedRole === 'operative' ||
      normalizedRole === 'player';

    if (isOperatorOnly && ARCHITECT_ONLY_TOOLS.has(tool.name)) {
      return {
        blocked: true,
        error: `Tool "${tool.name}" is restricted to Co-Architect sessions and unavailable in Operator mode.`,
      };
    }

    switch (tool.name) {
      case 'query_bastion_for_statblock': {
        const { concept, species = 'Human', techLevel = 3 } = tool.args || {};
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
          damageFormula,
          armorDr,
          rangeBracketId = 'short',
          coverTypeId = 'none',
          lightingId = 'clear',
          hasHighGround = false,
          isFlanked = false,
          isAimed = false
        } = tool.args || {};

        const tacMods = computeTacticalAttackModifiers({
          rangeBracketId,
          coverTypeId,
          lightingId,
          hasHighGround,
          isFlanked,
          isAimed
        });

        const effectiveAttackBonus = Number(attackBonus || 0) + tacMods.netAttackMod;
        const effectiveTargetDefense = Number(targetDefense ?? 15) + tacMods.netDefenseMod;
        // Canonical Tangent 2d10 opposed combat odds: Defender Wins All Ties + Nat 20 (+10) / Nat 2 (-10)
        const odds = compute2d10HitOdds(effectiveAttackBonus, effectiveTargetDefense, { isOpposed: true });
        const hitProbability = odds.hitProbabilityPercent;

        // Parse simple dice/flat formula (e.g. "2d10+4" -> 15, "3d8+6" -> 19.5) for penetration estimate
        let estimatedAvgDamage = 15;
        if (typeof damageFormula === 'number' && Number.isFinite(damageFormula)) {
          estimatedAvgDamage = damageFormula;
        } else if (typeof damageFormula === 'string' && damageFormula.trim()) {
          const diceMatch = damageFormula.trim().match(/^(\d+)\s*d\s*(\d+)\s*([+-]\s*\d+)?$/i);
          if (diceMatch) {
            const count = Number(diceMatch[1]);
            const sides = Number(diceMatch[2]);
            const flat = diceMatch[3] ? Number(diceMatch[3].replace(/\s+/g, '')) : 0;
            estimatedAvgDamage = count * ((sides + 1) / 2) + flat;
          } else if (Number.isFinite(Number(damageFormula))) {
            estimatedAvgDamage = Number(damageFormula);
          }
        }

        return {
          hitProbabilityPercent: hitProbability,
          strictOpposedWinPercent: odds.strictOpposedWinPercent,
          critProbabilityPercent: odds.critProbabilityPercent,
          fumbleProbabilityPercent: odds.fumbleProbabilityPercent,
          effectiveAttackBonus,
          effectiveTargetDefense,
          tacticalModifiersSummary: tacMods.summary,
          penetrationEstimated: Math.max(0, Math.round(estimatedAvgDamage - Number(armorDr || 0))),
          tacticalRecommendation:
            hitProbability > 60
              ? 'High-percentage engagement vector'
              : 'Low-percentage shot — seek Aim (+2), Flanking (+2), or High Ground (+2)'
        };
      }

      case 'resolve_called_shot': {
        const {
          targetLocation,
          incomingDamage,
          armorDr,
          penetration = 0,
          staminaToughness = 0,
          damageType = 'kinetic',
          isSynthetic = false,
          targetMaxHp = isSynthetic ? 60 : 30
        } = tool.args || {};

        const mitigation = calculateDamageMitigation({
          rawDamage: Number(incomingDamage || 0),
          armorLayers: [Number(armorDr || 0)],
          penetration: Number(penetration || 0),
          staminaToughness: Number(staminaToughness || 0),
          damageType
        });
        const netDamage = mitigation.netDamage;
        const maxHpVal = Number(targetMaxHp || (isSynthetic ? 60 : 30));
        const synthMult = isSynthetic ? 1.5 : 1.0;
        const disabledThreshold = Math.ceil((maxHpVal / 3) * synthMult);
        const destroyedThreshold = Math.ceil(((maxHpVal * 2) / 3) * synthMult);
        const saveCR = 10 + netDamage;

        // Canonical 3.00 COMBAT.md called-shot strike penalties (sensors/eyes = -5, torso = -1, limbs = -2)
        const penaltyMap: Record<string, number> = {
          torso: -1,
          head: -2,
          arms: -2,
          limbs: -2,
          legs: -2,
          sensors: -5,
          optics: -5
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
        if (netDamage >= disabledThreshold) {
          if (targetLocation === 'head') {
            traumaEffect = 'Concussion / Sensory Disorientation (-2 to all actions)';
          } else if (targetLocation === 'limbs' || targetLocation === 'legs' || targetLocation === 'arms') {
            traumaEffect = 'Locomotive / Limb Impairment (Movement speed halved or -4 attack)';
          } else if (targetLocation === 'sensors' || targetLocation === 'optics') {
            traumaEffect = 'Sensor Blindness (Loss of target tracking, -4 ranged checks)';
          } else if (targetLocation === 'torso') {
            traumaEffect = 'Winded / Internal Organ Shock (-2 Actions, Fortitude Save vs Incapacitated)';
          }
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
          saveCR,
          limbStatus,
          disabledThreshold,
          destroyedThreshold,
          traumaEffect,
          requiresMajorWoundCheck: netDamage >= disabledThreshold
        };
      }

      case 'calculate_armor_mitigation': {
        const {
          incomingDamage = 0,
          armorLayers = [],
          staminaToughness,
          penetration = 0,
          isForceDamage = false,
          damageType,
          isCritical = false,
          isLethal = true,
          isSynthetic = false,
          currentVitality = 30,
          currentHealth = isSynthetic ? 60 : 30,
          stackingMode = 'diminishing_returns',
        } = tool.args || {};

        const resolvedDmgType = damageType || (isForceDamage ? 'force' : 'kinetic');
        const resolvedToughness = isSynthetic
          ? (staminaToughness !== undefined ? Math.max(0, Number(staminaToughness) || 0) : 0)
          : Math.max(0, Number(staminaToughness ?? 0) || 0);

        const mitigation = calculateDamageMitigation({
          rawDamage: Number(incomingDamage || 0),
          armorLayers: Array.isArray(armorLayers) ? armorLayers : [],
          penetration: Number(penetration || 0),
          damageType: resolvedDmgType,
          staminaToughness: resolvedToughness,
          stackingMode
        });

        const routing = routePoolDamage({
          netDamage: mitigation.netDamage,
          isSynthetic: Boolean(isSynthetic),
          isLethal: isLethal !== false,
          isCritical: Boolean(isCritical),
          damageType: resolvedDmgType,
          hasVitalityPool: !isSynthetic,
          currentVitality: Number(currentVitality),
          currentHealth: Number(currentHealth),
          currentStructure: Number(currentHealth)
        });

        if (isSynthetic) {
          return {
            incomingDamage: Number(incomingDamage || 0),
            stackingMode,
            singleHighestDr: mitigation.singleHighestDr,
            diminishingReturnsDr: mitigation.diminishingReturnsDr,
            effectiveArmorDr: mitigation.effectiveArmorDr,
            naturalToughnessDr: mitigation.staminaSoak > 0 || resolvedToughness > 0 ? resolvedToughness : 0,
            totalMitigation: mitigation.totalMitigation,
            finalDamage: routing.netDamage,
            remainingStructure: routing.remainingStructure,
            enteredMortalityOrDisabled: routing.remainingStructure === 0,
          };
        }

        return {
          incomingDamage: Number(incomingDamage || 0),
          stackingMode,
          singleHighestDr: mitigation.singleHighestDr,
          diminishingReturnsDr: mitigation.diminishingReturnsDr,
          effectiveArmorDr: mitigation.effectiveArmorDr,
          naturalToughnessDr: resolvedToughness,
          totalMitigation: mitigation.totalMitigation,
          finalDamage: routing.netDamage,
          absorbedByVitality: routing.vitalityDamage,
          overflowToHealth: routing.healthDamage,
          remainingVitality: routing.remainingVitality,
          remainingHealth: routing.remainingHealth,
          enteredMortalityState: routing.entersMortalityState,
        };
      }

      case 'audit_operator_cp_ledger': {
        const {
          attributes = {},
          skills = {},
          specializations = [],
          freeBackgroundSpUsed = 60,
          recommendedFeatureCount = 0,
          standardFeatureRanks = 0,
          featuresCp: directFeaturesCp,
          extraTraitCount = 0,
          traitPolicy = 'origin_2_occupation_2',
          awardPointsEarned = 0,
          personalHindranceCp = 0,
          vitalityUpgradesCp = 0,
          isCreationStage = true,
        } = tool.args || {};

        const policyMap: Record<string, { originFree: number; factionFree: number; occupationFree: number; totalFree: number }> = {
          origin_2_occupation_2: { originFree: 2, factionFree: 0, occupationFree: 2, totalFree: 4 },
          origin_1_faction_1_occupation_2: { originFree: 1, factionFree: 1, occupationFree: 2, totalFree: 4 },
          origin_2_occupation_2_faction_1: { originFree: 2, factionFree: 1, occupationFree: 2, totalFree: 5 },
        };
        const resolvedTraitPolicy = policyMap[String(traitPolicy)] || policyMap.origin_2_occupation_2;

        const attrKeys = ['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'];
        let attributesCp = 0;
        const warnings: string[] = [];

        for (const k of attrKeys) {
          const rank = Number(attributes?.[k] ?? 0);
          attributesCp += rank * 5;
          if (isCreationStage && rank > 4) {
            warnings.push(`Attribute "${k}" (${rank}) exceeds standard creation soft cap (+4).`);
          }
        }

        let totalBaseSkillRanks = 0;
        for (const [skName, rawRank] of Object.entries(skills || {})) {
          const rank = Math.max(0, Number(rawRank) || 0);
          totalBaseSkillRanks += rank;
          if (rank > 20) {
            warnings.push(`Base Skill "${skName}" (${rank}) exceeds maximum Base Skill ceiling (Rank 20). Ranks 21-30 require a Specialization (1-10).`);
          } else if (isCreationStage && rank > 11) {
            warnings.push(`Base Skill "${skName}" (${rank}) exceeds character creation cap (Rank 11 / Stage 3 Expert).`);
          }
        }

        let totalSpecRanks = 0;
        if (Array.isArray(specializations)) {
          for (const spec of specializations) {
            if (!spec) continue;
            const sRank = Math.max(0, Number(spec.rank) || 0);
            totalSpecRanks += sRank;
            const parentRank = Number(skills?.[spec.parentSkill] ?? 0);
            if (parentRank < 6) {
              warnings.push(`Specialization "${spec.name}" requires parent Base Skill "${spec.parentSkill}" at Rank 6+ (currently ${parentRank}).`);
            }
            if (sRank > 10) {
              warnings.push(`Specialization "${spec.name}" (${sRank}) exceeds maximum Specialization Rank 10.`);
            }
          }
        }

        const cappedFreeSp = Math.min(60, Math.max(0, Number(freeBackgroundSpUsed) || 0));
        const skillsCp = Math.max(0, totalBaseSkillRanks + totalSpecRanks - cappedFreeSp);
        const discountedRecFeatures = Math.min(4, Math.max(0, Number(recommendedFeatureCount) || 0));
        const overflowRecFeatures = Math.max(0, (Number(recommendedFeatureCount) || 0) - 4);
        const featuresCp =
          directFeaturesCp !== undefined
            ? Math.max(0, Number(directFeaturesCp) || 0)
            : discountedRecFeatures * 2 +
              (overflowRecFeatures + Math.max(0, Number(standardFeatureRanks) || 0)) * 3;
        const traitsCp = Math.max(0, Number(extraTraitCount) || 0) * 1;
        const vitalsCp = Math.max(0, Number(vitalityUpgradesCp) || 0);
        const cappedHindranceRebate = Math.min(10, Math.max(0, Number(personalHindranceCp) || 0));
        if ((Number(personalHindranceCp) || 0) > 10) {
          warnings.push(`Personal Hindrance rebate capped at +10 CP (submitted +${personalHindranceCp} CP; Species flaws & Stigmas exempt).`);
        }

        const earnedAp = Math.max(0, Number(awardPointsEarned) || 0);
        const effectiveCpCeiling = 150 + earnedAp;
        const netCpSpent =
          attributesCp + skillsCp + featuresCp + traitsCp + vitalsCp - cappedHindranceRebate;

        return {
          startingCpBudget: 150,
          awardPointsEarned: earnedAp,
          effectiveCpCeiling,
          netCpSpent,
          totalCpSpent: netCpSpent,
          remainingCp: effectiveCpCeiling - netCpSpent,
          isCompliant: netCpSpent <= effectiveCpCeiling && warnings.length === 0,
          activeTraitPolicy: {
            id: policyMap[String(traitPolicy)] ? String(traitPolicy) : 'origin_2_occupation_2',
            ...resolvedTraitPolicy,
          },
          breakdown: {
            attributesCp,
            totalSkillAndSpecRanks: totalBaseSkillRanks + totalSpecRanks,
            freeBackgroundSpApplied: cappedFreeSp,
            freeBackgroundTraitsGranted: resolvedTraitPolicy.totalFree,
            skillsCp,
            featuresCp,
            traitsCp,
            vitalsCp,
            personalHindranceRebateCp: cappedHindranceRebate,
          },
          warnings,
        };
      }

      case 'evaluate_economatrix_acquisition': {
        const rawCr = tool.args?.itemCr ?? tool.args?.itemCostDc ?? 10;
        const itemCr = Number(rawCr) || 0;
        const wealthScore = Number(tool.args?.wealthScore ?? 10) || 0;
        const hasFlaw = Boolean(tool.args?.hasFlaw);

        const itemCreditValue = calculateCreditValue(itemCr, { hasFlaw });
        const characterWealthValue = calculateCreditValue(wealthScore);
        const isAutoBuy = itemCr <= wealthScore;
        const liquidityGapCredits = isAutoBuy ? 0 : Math.max(0, itemCreditValue - characterWealthValue);
        const pristineMaterialCredits = Math.round(itemCreditValue * 0.5);
        const scavengedScrapValueCredits = Math.round(itemCreditValue * 0.1);

        return {
          itemCr,
          purchaseCr: itemCr,
          craftingCr: itemCr,
          // Legacy aliases preserved for backward compatibility
          itemCostDc: itemCr,
          purchaseDc: itemCr,
          craftingDc: itemCr,
          wealthScore,
          itemCreditValue,
          characterWealthValue,
          pristineMaterialCredits,
          scavengedScrapValueCredits,
          isAutoBuy,
          liquidityGapCredits,
          goldenRuleVerified: true,
          summary: isAutoBuy
            ? `Auto-Bought (0 Cr liquid cost — Item CR ${itemCr} <= Wealth Score ${wealthScore}).`
            : `Requires Liquidity Gap payment of ${liquidityGapCredits.toLocaleString()} Cr (Item Value ${itemCreditValue.toLocaleString()} Cr - WS Value ${characterWealthValue.toLocaleString()} Cr; Pristine Crafting Materials: ${pristineMaterialCredits.toLocaleString()} Cr).`
        };
      }

      case 'query_omnicortex_rag': {
        const { query = '2d10 combat resolution', topK = 3 } = tool.args || {};
        const vectorResults = queryOmnicortexRAG(query, { topK, role: normalizedRole });
        const ftsResults = queryRulebook(query, { topK, role: normalizedRole });
        return {
          query,
          roleApplied: normalizedRole || 'unrestricted',
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
        const { adversaryId, adversary, heroes = [], executeOnStage = false, diceOverride } = tool.args || {};
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
        const { tokens = [], roundNumber = 1, executeCardId } = tool.args || {};
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

      case 'evaluate_multi_group_encounter': {
        const { groups = [], threatTier = 'standard' } = tool.args || {};
        const tierOffsets: Record<string, number> = {
          skirmish: -2,
          standard: 0,
          hard: 3,
          boss_climax: 5,
        };
        const crOffset = tierOffsets[threatTier] ?? 0;

        const safeGroups = Array.isArray(groups) && groups.length > 0
          ? groups
          : [{ name: 'Primary Squad', partySize: 4, averageSkillRank: 6, averageAttrMod: 3, averageHpPct: 100 }];

        const groupBudgets = safeGroups.map((g: any, idx: number) => {
          const partySize = Math.max(1, Number(g.partySize ?? 4));
          const avgSkill = Number(g.averageSkillRank ?? 6);
          const avgAttr = Number(g.averageAttrMod ?? 3);
          const hpPct = Math.max(10, Math.min(100, Number(g.averageHpPct ?? 100)));
          const actionsPerHero = avgSkill >= 16 ? 4 : avgSkill >= 11 ? 3 : avgSkill >= 6 ? 2 : 1;
          const totalHeroActions = partySize * actionsPerHero;
          const fatigueMod = hpPct < 50 ? -2 : 0;
          const recommendedEncounterCr = Math.max(10, Math.round(11 + avgAttr + avgSkill + crOffset + fatigueMod));

          return {
            groupName: g.name || `Group ${idx + 1}`,
            partySize,
            estimatedHeroActionsPerRound: totalHeroActions,
            recommendedTargetCr: recommendedEncounterCr,
            recommendedAdversaryActions: Math.max(2, Math.round(totalHeroActions * (threatTier === 'boss_climax' ? 1.25 : 0.9))),
            readinessStatus: hpPct < 50 ? 'Depleted — recommend tactical breather or hazard pivot' : 'Combat Ready',
          };
        });

        return {
          threatTier,
          groupCount: groupBudgets.length,
          groupBudgets,
          synchronizationAdvice:
            groupBudgets.length > 1
              ? 'Use shared 4-segment Campaign Clocks so breakthroughs or alarms triggered by one group dynamically shift Defense CR or patrol density for parallel groups.'
              : 'Single-group encounter calibrated to Skill Tier action economy parity.',
        };
      }

      default:
        throw new Error(`Unknown tool call: ${tool.name}`);
    }
  }
}

export const DBMFunctionRegistry = new DBMFunctionRegistryService();
export default DBMFunctionRegistry;
