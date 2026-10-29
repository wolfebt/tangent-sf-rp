/**
 * @file BastionAgent.ts
 * @description Stage 7 BASTION Rules Agent.
 * Executes Gemini Structured Outputs (JSON Schema) and enforces Tangent SF RP rules:
 * 150 BP character generation validation middleware, Tech Level parameters, and combat math.
 */

import { VertexAIGateway } from './VertexAIGateway.ts';
import { AimeAgent } from './AimeAgent.ts';
import { synthesizeCharacterWithBastion } from '../../services/bastionCharacterEngine.js';
import { synthesizeAdversaryTactic } from '../../services/adversaryAiService.js';
import { analyzeCombatPacing } from '../../services/bastionWhisperService.js';
import { getTacticalBark } from '../../services/tacticalBarksService.js';
import { useEngineStore, selectAllFusedTokens } from '../state/VolatileSharder.ts';
import { DamagePipeline } from '../rules/DamagePipeline.ts';

export interface AdversaryTurnExecutionReport {
  success: boolean;
  adversaryId: string;
  adversaryName: string;
  roleKey: string;
  roleLabel: string;
  tacticAction: string;
  tacticDescription: string;
  targetId: string | null;
  targetName: string;
  movement: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    distanceMovedFt: number;
  };
  attackRoll: {
    d1: number;
    d2: number;
    attackBonus: number;
    totalAttack: number;
    targetDefenseDC: number;
    isHit: boolean;
    isCriticalTriumph: boolean;
    isCriticalFumble: boolean;
  };
  damageDealt: number;
  appliedConditions: string[];
  tacticalBark: string;
  aimeNarration: string;
}

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

  /**
   * Executes an autonomous, deterministic Stage 7 Adversary Tactical Turn directly on useEngineStore (VolatileSharder),
   * combining role doctrine selection, 5ft-grid movement, 2d10 Dual Resolution strike (Defender Wins Ties),
   * DamagePipeline trauma calculation, and synchronized AIME combat narration.
   */
  public executeAdversaryTurn(
    adversaryId: string,
    options: {
      diceOverride?: [number, number] | { d1: number; d2: number };
      rollOverride?: [number, number] | { d1: number; d2: number };
      rawDamageOverride?: number;
      baseRawDamage?: number;
      weaponType?: string;
      cellSizePx?: number;
    } = {}
  ): AdversaryTurnExecutionReport {
    const storeState = useEngineStore.getState();
    const allTokens = selectAllFusedTokens(storeState);
    const adversary = allTokens.find(t => t.id === adversaryId);

    if (!adversary) {
      throw new Error(`Adversary token "${adversaryId}" not found on The Stage.`);
    }

    const heroes = allTokens.filter(t => t.is_persona && (t.current_hp ?? t.base_hp ?? 30) > 0);
    const tactic: any = synthesizeAdversaryTactic(adversary, heroes, {}) || {
      roleKey: 'skirmisher',
      roleLabel: 'Skirmisher (Hit-and-Run)',
      doctrine: 'Mobile ranged harassment.',
      action: 'Tactical Burst',
      targetId: heroes[0]?.id || null,
      targetName: heroes[0]?.name || 'Operative',
      description: 'Execute standard tactical engagement.',
      moveMode: 'hold_position',
      appliedCondition: null,
      attackBonusDelta: 0
    };

    const targetToken = heroes.find(h => h.id === tactic.targetId) || heroes[0] || null;
    const cellSizePx = options.cellSizePx || 70;
    const maxCellsMove = Math.max(1, Math.floor((adversary.speed_ft || 30) / 5));
    const maxMovePx = maxCellsMove * cellSizePx;

    const fromX = adversary.x ?? 0;
    const fromY = adversary.y ?? 0;
    let nextX = fromX;
    let nextY = fromY;

    if (targetToken && tactic.moveMode !== 'hold_position') {
      const dx = (targetToken.x ?? 0) - fromX;
      const dy = (targetToken.y ?? 0) - fromY;
      const dist = Math.hypot(dx, dy);

      if (tactic.moveMode === 'advance_melee' && dist > cellSizePx) {
        const moveDist = Math.min(maxMovePx, Math.max(0, dist - cellSizePx));
        const ratio = dist > 0 ? moveDist / dist : 0;
        nextX = Math.round((fromX + dx * ratio) / cellSizePx) * cellSizePx;
        nextY = Math.round((fromY + dy * ratio) / cellSizePx) * cellSizePx;
      } else if (tactic.moveMode === 'kite_range' && dist < cellSizePx * 4) {
        const retreatPx = Math.min(maxMovePx, cellSizePx * 2);
        const dirX = dist > 0 ? -dx / dist : -1;
        const dirY = dist > 0 ? -dy / dist : 0;
        nextX = Math.round((fromX + dirX * retreatPx) / cellSizePx) * cellSizePx;
        nextY = Math.round((fromY + dirY * retreatPx) / cellSizePx) * cellSizePx;
      }
    }

    if (nextX !== fromX || nextY !== fromY) {
      useEngineStore.getState().updatePosition(adversaryId, nextX, nextY);
    }

    const distanceMovedFt = Math.round((Math.hypot(nextX - fromX, nextY - fromY) / cellSizePx) * 5);
    const appliedConditions: string[] = [];

    if (tactic.appliedCondition) {
      const currentConds = useEngineStore.getState().ephemeralData[adversaryId]?.active_conditions || [];
      if (!currentConds.includes(tactic.appliedCondition)) {
        useEngineStore.getState().toggleCondition(adversaryId, tactic.appliedCondition);
      }
      appliedConditions.push(tactic.appliedCondition);
    }

    if (tactic.healAmount && tactic.healAmount > 0) {
      useEngineStore.getState().healHP(adversaryId, tactic.healAmount);
    }

    // Resolve 2d10 Attack Roll (Defender Wins Ties)
    const dice = options.diceOverride || options.rollOverride;
    let d1 = Math.floor(Math.random() * 10) + 1;
    let d2 = Math.floor(Math.random() * 10) + 1;
    if (Array.isArray(dice)) {
      d1 = dice[0];
      d2 = dice[1];
    } else if (dice && typeof dice === 'object') {
      d1 = (dice as any).d1 ?? d1;
      d2 = (dice as any).d2 ?? d2;
    }
    const isCriticalTriumph = d1 === 10 && d2 === 10;
    const isCriticalFumble = d1 === 1 && d2 === 1;

    const baseAttackBonus = (adversary.tech_level || 3) * 2 + (tactic.attackBonusDelta || 0);
    const totalAttack = d1 + d2 + baseAttackBonus + (isCriticalTriumph ? 10 : isCriticalFumble ? -10 : 0);
    const targetDefenseBonus = targetToken
      ? ((targetToken.active_conditions || []).includes('Cover') ? 2 : 0) +
        ((targetToken.active_conditions || []).includes('Total Defense') ? 4 : 0)
      : 0;
    const targetDefenseDC = 15 + targetDefenseBonus;

    // Canonical v6: Defender wins ties -> attacker must strictly exceed targetDefenseDC (or roll Nat 20)
    const isHit = Boolean(targetToken) && !isCriticalFumble && (isCriticalTriumph || totalAttack > targetDefenseDC);
    let damageDealt = 0;

    if (isHit && targetToken) {
      const rawDamage = options.rawDamageOverride ?? options.baseRawDamage;
      const rawBase = rawDamage ?? (14 + (adversary.tech_level || 3) * 2 + (d1 === d2 ? 4 : 0));
      const damagePipeline = new DamagePipeline();
      const strikeRes = damagePipeline.resolveStrike(
        {
          rawDamage: isCriticalTriumph ? Math.round(rawBase * 1.5) : rawBase,
          armorPenetration: adversary.tech_level || 3,
          damageType: (options.weaponType || 'kinetic') as any,
          isCalledShot: Boolean(tactic.calledShotLocation),
          targetLocation: (tactic.calledShotLocation || 'torso') as any
        },
        targetToken as any,
        [targetToken.armor_dr || 0]
      );

      damageDealt = strikeRes.netDamage;
      useEngineStore.getState().applyDamage(targetToken.id, damageDealt);

      for (const status of strikeRes.appliedStatuses) {
        const targetConds = useEngineStore.getState().ephemeralData[targetToken.id]?.active_conditions || [];
        if (!targetConds.includes(status)) {
          useEngineStore.getState().toggleCondition(targetToken.id, status);
        }
        appliedConditions.push(status);
      }
    }

    const updatedTarget = targetToken
      ? selectAllFusedTokens(useEngineStore.getState()).find(t => t.id === targetToken.id)
      : null;
    const isDowned = Boolean(updatedTarget && (updatedTarget.current_hp ?? 30) <= 0);

    const narrationObj = AimeAgent.narrateCombatStrike({
      attackerName: adversary.name,
      targetName: targetToken?.name || tactic.targetName,
      weaponName: tactic.action,
      targetedLimb: tactic.calledShotLocation || 'torso',
      netDamage: damageDealt,
      isHit,
      isCriticalTriumph,
      isCriticalFumble,
      isDowned,
      appliedStatuses: appliedConditions
    });

    const barkObj = getTacticalBark(
      isCriticalTriumph ? 'critical' : isHit ? 'engaging' : 'suppressed',
      adversary.name
    );

    return {
      success: true,
      adversaryId: adversary.id,
      adversaryName: adversary.name,
      roleKey: tactic.roleKey,
      roleLabel: tactic.roleLabel,
      tacticAction: tactic.action,
      tacticDescription: tactic.description,
      targetId: targetToken?.id || null,
      targetName: targetToken?.name || tactic.targetName,
      movement: {
        from: { x: fromX, y: fromY },
        to: { x: nextX, y: nextY },
        distanceMovedFt
      },
      attackRoll: {
        d1,
        d2,
        attackBonus: baseAttackBonus,
        totalAttack,
        targetDefenseDC,
        isHit,
        isCriticalTriumph,
        isCriticalFumble
      },
      damageDealt,
      appliedConditions,
      tacticalBark: barkObj.quote,
      aimeNarration: narrationObj.narrativeText
    };
  }

  /**
   * Evaluates live VTT encounter balance and returns BASTION Whisper Co-GM pacing telemetry.
   */
  public evaluateEncounterBalance(roundNumber: number = 1) {
    const allTokens = selectAllFusedTokens(useEngineStore.getState());
    const normalizedForWhisper = allTokens.map(t => ({
      id: t.id,
      name: t.name,
      linkedHeroId: t.is_persona ? t.id : undefined,
      isEnemy: !t.is_persona,
      health: {
        current: t.current_hp ?? t.base_hp ?? 30,
        max: t.base_hp ?? 30
      }
    }));
    return analyzeCombatPacing(normalizedForWhisper, roundNumber);
  }
}

export const BastionAgent = new BastionRulesAgent();
export default BastionAgent;
