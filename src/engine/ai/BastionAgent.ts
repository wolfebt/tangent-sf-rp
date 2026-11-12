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
  specializations?: Array<{ name: string; parentSkill: string; rank: number }>;
  freeBackgroundSp?: number;
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
    freeBackgroundSpApplied?: number;
    featuresCp?: number;
    traitsCp?: number;
    traitsBp: number;
    augmentationsCp?: number;
    augmentationsBp: number;
  };
  errors: string[];
  correctedDraft?: TangentCharacterDraft;
}

const CANONICAL_FILL_SKILLS = [
  'Alertness',
  'Athletics',
  'Firearms',
  'Melee',
  'Stealth',
  'Tactics',
  'Electronics',
  'Computers',
  'Engineering',
  'Medicine',
  'Piloting',
  'Survival',
  'Security',
  'Insight',
  'Persuasion',
  'Resolve',
  'Endurance',
  'Mechanics',
];

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
      prompt: concept || 'Tactical Operator',
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
- Three Background Skill Pools grant 60 Free Skill Points (20 Faction + 20 Origin + 20 Occupation = 0 CP).
- Base Skill Ranks span 0–20 at 1 SP/CP per rank (Character Creation cap is Rank 11 [Stage 3: Expert]; Base Skill ceiling is Rank 20 [Stage 4: Master]). Specializations (Rank 1–10, prerequisite Base Rank 6+) add directly to Base Skill to unlock Ranks 21–30.
- 4 Background Traits are free (1 Origin + 1 Faction + 2 Occupation); extra traits cost 1 CP. First 4 Recommended Features cost 2 CP each (standard Features 3 CP).
- Base Vitals: 30 Vitality, 30 Health (60 Structure for Synthetics/Mecha; 1 CP = +5 points). Stamina provides Toughness DR (min 0 damage floor), never flat VP/HP.
- Total net CP spent must equal 150 CP.
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
      model: 'gemini-2.5-flash',
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
        name: response.data.name || synthChar['char-name'] || 'Operator',
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
          Alertness: 4,
          Electronics: 4,
          Stealth: 4,
          Computers: 4,
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
   * Validates CP math (150-CP Character Economy, 60 Free Background SP, Base Skill Creation Cap 11,
   * 4 Free Background Traits, Recommended Features 2 CP / Standard 3 CP) and self-balances deviations
   * to exact 150-CP compliance without ever violating the Rank 11 creation skill ceiling.
   */
  public validateAndBalanceBp(draft: TangentCharacterDraft): BastionValidationResult {
    const CREATION_SKILL_CAP = 11;
    let attributesBp = 0;
    const attrs = draft.attributes || ({} as TangentAttributeStats);
    const keys: Array<keyof TangentAttributeStats> = ['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'];

    for (const key of keys) {
      const val = attrs[key] ?? this.ATTR_BASE;
      if (val > this.ATTR_BASE) {
        attributesBp += (val - this.ATTR_BASE) * this.ATTR_COST_PER_POINT;
      }
    }

    let rawSkillRanks = 0;
    const errors: string[] = [];
    for (const skillName of Object.keys(draft.skills || {})) {
      const rank = Math.max(0, Number(draft.skills[skillName] ?? 0));
      rawSkillRanks += rank;
      if (rank > CREATION_SKILL_CAP) {
        errors.push(`Skill "${skillName}" (${rank}) exceeds Character Creation cap of Rank ${CREATION_SKILL_CAP} (Stage 3: Expert).`);
      }
    }

    const specRanks = Array.isArray(draft.specializations)
      ? draft.specializations.reduce((sum, s) => sum + Math.max(0, Number(s?.rank || 0)), 0)
      : 0;

    const freeBackgroundSp =
      draft.freeBackgroundSp !== undefined
        ? Math.min(60, Math.max(0, Number(draft.freeBackgroundSp) || 0))
        : (draft.pillars ? 60 : 0);

    const skillsBp = Math.max(0, (rawSkillRanks + specRanks - freeBackgroundSp) * this.SKILL_COST_PER_RANK);

    // 4 Background Traits are free (1 Origin + 1 Faction + 2 Occupation); extra traits cost 1 CP each
    const traitCount = Array.isArray(draft.traits) ? draft.traits.length : 0;
    const traitsBp = Math.max(0, traitCount - 4) * 1;

    // First 4 Recommended Features cost 2 CP each; additional standard features cost 3 CP each
    const featureCount = Array.isArray(draft.features) ? draft.features.length : 0;
    const discountedFeatures = Math.min(4, featureCount);
    const standardFeatures = Math.max(0, featureCount - 4);
    const featuresCp = discountedFeatures * 2 + standardFeatures * 3;

    // Augmentation tier unlocks cost 3 CP per tier feature
    const augmentationsBp = (draft.augmentations || []).length * 3;

    const totalBpSpent = attributesBp + skillsBp + featuresCp + traitsBp + augmentationsBp;

    if (totalBpSpent > this.MAX_BP) {
      errors.push(`Statblock exceeded CP limit: spent ${totalBpSpent} CP out of ${this.MAX_BP} max.`);
    } else if (totalBpSpent < this.MAX_BP) {
      errors.push(`Statblock unspent CP: spent ${totalBpSpent} CP out of ${this.MAX_BP} available.`);
    }

    // Self-balancing middleware: clamp skills to Rank 11 creation cap & distribute delta evenly
    let correctedDraft: TangentCharacterDraft | undefined;
    if (errors.length > 0) {
      correctedDraft = JSON.parse(JSON.stringify(draft)) as TangentCharacterDraft;
      if (!correctedDraft.skills || typeof correctedDraft.skills !== 'object') {
        correctedDraft.skills = {};
      }

      // 1. Clamp any skill exceeding CREATION_SKILL_CAP (11)
      for (const sk of Object.keys(correctedDraft.skills)) {
        const r = Math.max(0, Math.round(Number(correctedDraft.skills[sk]) || 0));
        correctedDraft.skills[sk] = Math.min(CREATION_SKILL_CAP, r);
      }

      // Ensure enough canonical general skills exist in the map to absorb freeBackgroundSp + remaining CP without exceeding Rank 11
      const currentSkillCount = Object.keys(correctedDraft.skills).length;
      if (currentSkillCount < CANONICAL_FILL_SKILLS.length) {
        for (const fillSk of CANONICAL_FILL_SKILLS) {
          if (correctedDraft.skills[fillSk] === undefined) {
            correctedDraft.skills[fillSk] = 0;
          }
        }
      }

      // Recompute required total skill ranks so skillsBp + fixedCosts === 150
      const fixedCp = attributesBp + featuresCp + traitsBp + augmentationsBp;
      const targetSkillsCp = Math.max(0, this.MAX_BP - fixedCp);
      const targetTotalSkillRanks = Math.max(0, freeBackgroundSp + targetSkillsCp - specRanks);

      let currentTotalRanks = Object.values(correctedDraft.skills).reduce((s, v) => s + (v || 0), 0);
      const orderedSkillKeys = Object.keys(correctedDraft.skills);

      // If fixedCp alone exceeded 150 CP, reduce highest attributes by 5 CP steps first
      if (fixedCp > this.MAX_BP && correctedDraft.attributes) {
        let overFixed = fixedCp - this.MAX_BP;
        for (const attrKey of [...keys].reverse()) {
          while (overFixed >= 5 && (correctedDraft.attributes[attrKey] || 0) > 0) {
            correctedDraft.attributes[attrKey] -= 1;
            overFixed -= 5;
          }
        }
      }

      // 2. Round-robin add ranks up to CREATION_SKILL_CAP (11)
      let guard = 0;
      while (currentTotalRanks < targetTotalSkillRanks && guard < 500) {
        guard++;
        let progressed = false;
        for (const sk of orderedSkillKeys) {
          if (currentTotalRanks >= targetTotalSkillRanks) break;
          const cur = correctedDraft.skills[sk] || 0;
          if (cur < CREATION_SKILL_CAP) {
            correctedDraft.skills[sk] = cur + 1;
            currentTotalRanks++;
            progressed = true;
          }
        }
        if (!progressed) break;
      }

      // 3. Round-robin trim ranks if above targetTotalSkillRanks
      guard = 0;
      while (currentTotalRanks > targetTotalSkillRanks && guard < 500) {
        guard++;
        let progressed = false;
        for (const sk of [...orderedSkillKeys].reverse()) {
          if (currentTotalRanks <= targetTotalSkillRanks) break;
          const cur = correctedDraft.skills[sk] || 0;
          if (cur > 0) {
            correctedDraft.skills[sk] = cur - 1;
            currentTotalRanks--;
            progressed = true;
          }
        }
        if (!progressed) break;
      }

      // Prune 0-rank filler skills for a clean character sheet
      for (const sk of Object.keys(correctedDraft.skills)) {
        if ((correctedDraft.skills[sk] || 0) <= 0) {
          delete correctedDraft.skills[sk];
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
        freeBackgroundSpApplied: freeBackgroundSp,
        featuresCp,
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
      targetName: heroes[0]?.name || 'Operator',
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
    const effectiveDiceScore = isCriticalTriumph ? (d1 + d2 + 10) : isCriticalFumble ? -10 : (d1 + d2);
    const totalAttack = effectiveDiceScore + baseAttackBonus;
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
