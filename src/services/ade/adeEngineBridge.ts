/**
 * @file adeEngineBridge.ts
 * @description Centralized Game Engine Integration Bridge for the Adventure Development Environment (ADE).
 * Bridges standalone engine services into ADE workflows:
 * - Rules Adjudicator -> Preflight telemetry validation
 * - Encounter Sim -> Monte Carlo survival forecasting for tactical spreads
 * - Session Recap -> CRONICLE living memory synthesis
 * - Scenario Engine -> Automated objective evaluations
 */

import { runMonteCarloEncounterSim } from '../encounterSimService.js';
import { SessionJournal } from '../sessionRecapService.js';
import { evaluateScenarioProgress, OBJECTIVE_TEMPLATES } from '../scenarioEngineService.js';
import { VttEventBus } from '../../utils/vttEventBus.ts';
import type { AdePreflightTelemetry, AdeElementRecord } from '../../types/ade.ts';
import type { 
  AdeStructuralMandate, 
  SystemIntent, 
  DiceRollSummary, 
  MechanicalOutcomes, 
  NarrativeBounds 
} from '../../types/adeMandate.ts';

export interface ActionCheckParams {
  actionText: string;
  operative?: any;
  targetEntity?: any;
  targetDC?: number;
  skillName?: string;
  subAttrKey?: string;
  activeModifiers?: any[];
  storyFlags?: Record<string, any>;
  diceOverride?: [number, number] | null;
}

export interface EncounterSimSummary {
  winRate: number;
  avgRounds: number;
  threatTier: string;
  threatColor: string;
  summary: string;
}

/**
 * Validates universe scenarios and element definitions against Tangent rules conventions.
 */
export function validateUniverseRules(
  universeState: any,
  elementsCatalog: AdeElementRecord[] = []
): AdePreflightTelemetry {
  let score = 100;
  const issues: string[] = [];
  const warnings: string[] = [];

  const scenarios = universeState?.scenarios || [];
  const maps = universeState?.maps || [];

  if (scenarios.length === 0) {
    score -= 35;
    issues.push('Module contains no scenario nodes.');
  }

  // Check for orphan scenarios or empty text
  scenarios.forEach((sc: any) => {
    if (!sc.title || sc.title.trim() === '') {
      score -= 5;
      warnings.push(`Scenario [${sc.id.slice(0, 6)}] has no title.`);
    }
    if (!sc.content || sc.content.trim().length < 10) {
      score -= 5;
      warnings.push(`Scenario "${sc.title || 'Untitled'}" has empty narrative content.`);
    }
  });

  // Check encounter and persona stat blocks
  const combatElements = elementsCatalog.filter(
    (e) => e.type === 'Encounter' || e.type === 'Persona'
  );

  combatElements.forEach((e) => {
    const fields = e.fields || {};
    if (e.type === 'Encounter' && !fields.threatMatrix && !fields.threatLevel) {
      warnings.push(`Encounter element "${e.title}" lacks a defined threat matrix.`);
    }
  });

  if (maps.length === 0 && scenarios.length > 0) {
    score -= 20;
    warnings.push('Tactical grid battlemaps have not been linked to module.');
  }

  const clampedScore = Math.max(0, Math.min(100, score));
  return {
    score: clampedScore,
    issues,
    warnings
  };
}

/**
 * Simulates a scenario encounter against a given or default party token roster.
 */
export function simulateScenarioEncounter(
  scenarioNode: any,
  partyTokens: any[] = []
): EncounterSimSummary {
  const defaultParty = partyTokens.length > 0 ? partyTokens : [
    { id: 'p1', label: 'Operative Vanguard', hp: 35, defense: 14, attackMod: 5, avgDamage: 12 },
    { id: 'p2', label: 'Tech Specialist', hp: 28, defense: 12, attackMod: 4, avgDamage: 10 },
    { id: 'p3', label: 'Biochem Medic', hp: 30, defense: 13, attackMod: 3, avgDamage: 8 }
  ];

  const enemies = scenarioNode?.fields?.adversaries || [
    { id: 'e1', label: 'Hostile Drone', hp: 18, defense: 11, tier: 1 },
    { id: 'e2', label: 'Security Enforcer', hp: 25, defense: 12, tier: 2 }
  ];

  const simResult = runMonteCarloEncounterSim(defaultParty, enemies, 300);

  return {
    winRate: simResult.winRate,
    avgRounds: simResult.avgRounds,
    threatTier: simResult.threatTier,
    threatColor: simResult.threatColor,
    summary: `Forecast: ${simResult.winRate}% party victory rate across ${simResult.avgRounds} estimated rounds (${simResult.threatTier} threat).`
  };
}

/**
 * Synthesizes a Markdown narrative debrief from historical CRONICLE deltas.
 */
export function synthesizeRecapFromCronicle(
  cronicleHistory: any[] = [],
  projectName: string = 'Active Operation'
): string {
  SessionJournal.clearEvents();
  SessionJournal.setCampaignName(projectName);

  cronicleHistory.forEach((entry: any) => {
    SessionJournal.logEvent({
      type: entry.action === 'state_override' ? 'crit' : 'strike',
      actor: entry.author || 'Operative',
      target: entry.target || 'Sector Context',
      details: entry.explanation || entry.title || 'Tactical update recorded.'
    });
  });

  return SessionJournal.generateMarkdownRecap();
}

/**
 * Evaluates active objectives for a scenario using scenarioEngineService.
 */
export function evaluateObjectivesForScenario(
  objectives: any[] = [],
  tokens: any[] = [],
  currentRound: number = 1
) {
  const activeObjs = objectives.length > 0 ? objectives : [OBJECTIVE_TEMPLATES[0]];
  return evaluateScenarioProgress(activeObjs, tokens, currentRound);
}

/**
 * Creates a normalized structural mandate object representing sealed mechanical authority.
 */
export function createStructuralMandate({
  systemIntent,
  actionName,
  initiatorName = 'Operative',
  targetEntity,
  diceSummary,
  mechanicalOutcomes = {},
  narrativeBounds
}: {
  systemIntent: SystemIntent;
  actionName: string;
  initiatorName?: string;
  targetEntity?: string;
  diceSummary?: DiceRollSummary;
  mechanicalOutcomes?: MechanicalOutcomes;
  narrativeBounds: NarrativeBounds;
}): AdeStructuralMandate {
  const mandate: AdeStructuralMandate = {
    mandateId: `mandate_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    systemIntent,
    actionName,
    initiatorName,
    targetEntity,
    diceSummary,
    mechanicalOutcomes,
    narrativeBounds
  };

  // Emit event on VttEventBus so stage and listeners update deterministically
  try {
    if (typeof window !== 'undefined' && VttEventBus && typeof VttEventBus.emit === 'function') {
      VttEventBus.emit('mechanical-mandate-executed', { mandate });
    }
  } catch (e) {
    // Non-blocking in headless/node environments
  }

  return mandate;
}

/**
 * Adjudicates an action check using canonical Tangent SFF RPG 2d10 rules,
 * pre-evaluating tech levels, damage, and status consequences, and subordinating
 * the generative model to a sealed structural mandate.
 */
export function adjudicateActionCheck({
  actionText,
  operative = null,
  targetEntity = null,
  targetDC = 12,
  skillName = '',
  subAttrKey = '',
  activeModifiers = [],
  storyFlags = {},
  diceOverride = null
}: ActionCheckParams): AdeStructuralMandate {
  const initiatorName = operative?.name || operative?.title || 'Operative';
  const lowerAction = (actionText || '').toLowerCase();

  // 1. Detect Skill & Attribute if not explicitly supplied
  let resolvedSkill = skillName;
  let resolvedSubAttr = subAttrKey;

  if (!resolvedSkill) {
    if (lowerAction.includes('hack') || lowerAction.includes('slice') || lowerAction.includes('terminal') || lowerAction.includes('bypass') || lowerAction.includes('override')) {
      resolvedSkill = 'Slicing';
      resolvedSubAttr = 'attr-logic';
    } else if (lowerAction.includes('shoot') || lowerAction.includes('fire') || lowerAction.includes('rifle') || lowerAction.includes('snipe') || lowerAction.includes('blaster')) {
      resolvedSkill = 'Ballistics';
      resolvedSubAttr = 'attr-reflex';
    } else if (lowerAction.includes('strike') || lowerAction.includes('blade') || lowerAction.includes('punch') || lowerAction.includes('kick') || lowerAction.includes('melee')) {
      resolvedSkill = 'Kinetics';
      resolvedSubAttr = 'attr-might';
    } else if (lowerAction.includes('stealth') || lowerAction.includes('sneak') || lowerAction.includes('shadow') || lowerAction.includes('infiltrate')) {
      resolvedSkill = 'Stealth';
      resolvedSubAttr = 'attr-reflex';
    } else if (lowerAction.includes('persuade') || lowerAction.includes('intimidate') || lowerAction.includes('interrogate') || lowerAction.includes('negotiate') || lowerAction.includes('bribe')) {
      resolvedSkill = 'Etiquette';
      resolvedSubAttr = 'attr-etiquette';
    } else if (lowerAction.includes('sense') || lowerAction.includes('detect') || lowerAction.includes('perceive') || lowerAction.includes('search') || lowerAction.includes('scan')) {
      resolvedSkill = 'Perception';
      resolvedSubAttr = 'attr-will';
    } else {
      resolvedSkill = 'General Action';
      resolvedSubAttr = 'attr-reflex';
    }
  }

  // 2. TECH LEVEL (TL 0-5) PRE-CHECK FOR ELECTRONIC / HACKING ACTIONS
  const isHackAction = 
    resolvedSkill.toLowerCase().includes('slic') || 
    resolvedSkill.toLowerCase().includes('hack') || 
    lowerAction.includes('slic') || 
    lowerAction.includes('hack') || 
    lowerAction.includes('cyber');

  if (isHackAction) {
    const opTL = Number(operative?.fields?.['tech-level'] ?? operative?.techLevel ?? 2);
    const targetTL = Number(targetEntity?.fields?.techLevel ?? targetEntity?.techLevel ?? (lowerAction.includes('precursor') ? 5 : (lowerAction.includes('hard-light') ? 4 : 3)));

    if (targetTL > opTL + 1) {
      // Tech Level Mismatch: Direct Refusal Mandate
      return createStructuralMandate({
        systemIntent: 'REFUSE_ACTION',
        actionName: actionText,
        initiatorName,
        targetEntity: targetEntity?.name || targetEntity?.title,
        mechanicalOutcomes: {
          shieldsDelta: -2,
          conditionsApplied: ['Cyberdeck Overheated'],
          flagUpdates: { terminal_security_locked: true }
        },
        narrativeBounds: {
          refusalReason: 'Tech_Level_Low',
          requiredSensoryCues: [
            'biometric cipher mismatch',
            'incompatible photonic waveband',
            'acrid smell of overheated optic buffers'
          ],
          forbiddenOutcomes: [
            'bulkhead opening',
            'access granted',
            'firewall disabled',
            'data downloaded'
          ],
          prescribedOutcome: `The slice attempt fails instantly due to incompatible sophistication. Operative deck is TL-${opTL}, but the target system is TL-${targetTL}. The deck capacitor discharges feedback, inflicting 2 shield strain.`
        }
      });
    }
  }

  // 3. CANONICAL 2D10 RESOLUTION
  const d1 = diceOverride ? diceOverride[0] : (Math.floor(Math.random() * 10) + 1);
  const d2 = diceOverride ? diceOverride[1] : (Math.floor(Math.random() * 10) + 1);
  const diceSum = d1 + d2;
  const isDouble = d1 === d2;

  // Extract modifiers
  let attrMod = 0;
  if (operative?.attributes) {
    const key = resolvedSubAttr.replace('attr-', '');
    attrMod = Number(operative.attributes[key] || 0);
  } else if (operative?.fields?.[resolvedSubAttr] !== undefined) {
    attrMod = Number(operative.fields[resolvedSubAttr] || 0);
  } else {
    attrMod = 2; // Baseline attribute bonus
  }

  let skillRank = 0;
  if (operative?.skills && operative.skills[resolvedSkill] !== undefined) {
    skillRank = Number(operative.skills[resolvedSkill]);
  } else {
    skillRank = 3; // Baseline trained rank
  }

  let miscMod = 0;
  if (Array.isArray(activeModifiers)) {
    activeModifiers.forEach(m => {
      if (typeof m.value === 'number') miscMod += m.value;
    });
  }

  // Active story flags dynamically modify target DC (e.g. raised alarms increase security check difficulty)
  let effectiveDC = targetDC;
  if (storyFlags?.alarm_triggered || storyFlags?.sector_alert || storyFlags?.security_lockdown) {
    effectiveDC += 2;
  }

  const totalCheck = diceSum + attrMod + skillRank + miscMod;
  const margin = totalCheck - effectiveDC;

  // Determine System Intent and Tier
  let systemIntent: SystemIntent = 'EXECUTE_SUCCESS';
  let tierLabel = 'Standard Success';

  if (d1 === 10 && d2 === 10) {
    systemIntent = 'CRITICAL_TRIUMPH';
    tierLabel = 'Critical Triumph (Natural 20)';
  } else if (d1 === 1 && d2 === 1) {
    systemIntent = 'CRITICAL_FUMBLE';
    tierLabel = 'Critical Fumble (Natural 2)';
  } else if (margin >= 10) {
    systemIntent = 'EXECUTE_SUCCESS';
    tierLabel = 'Masterful Success (+10 Margin)';
  } else if (margin >= 5) {
    systemIntent = 'EXECUTE_SUCCESS';
    tierLabel = 'Superior Success (+5 Margin)';
  } else if (margin >= 0) {
    systemIntent = 'EXECUTE_SUCCESS';
    tierLabel = 'Standard Success';
  } else if (margin >= -4) {
    systemIntent = 'EXECUTE_FAILURE';
    tierLabel = 'Marginal Failure (-1 to -4 Margin)';
  } else {
    systemIntent = 'EXECUTE_FAILURE';
    tierLabel = 'Severe Failure (<= -5 Margin)';
  }

  const diceSummary: DiceRollSummary = {
    dice1: d1,
    dice2: d2,
    diceSum,
    isDouble,
    skillName: resolvedSkill,
    skillRank,
    attrKey: resolvedSubAttr,
    attrMod,
    miscMod,
    totalCheck,
    targetDC: effectiveDC,
    margin,
    tierLabel,
    formula: `2d10 (${d1}+${d2}) + ${resolvedSkill}(${skillRank}) + Attr(${attrMod}) + Mod(${miscMod}) = ${totalCheck} vs DC ${effectiveDC}`
  };

  // 4. CALCULATE MECHANICAL OUTCOMES
  const outcomes: MechanicalOutcomes = {};
  const sensoryCues: string[] = [];
  const forbidden: string[] = [];

  if (systemIntent === 'CRITICAL_TRIUMPH') {
    if (isHackAction) {
      outcomes.bulkheadToggled = { id: targetEntity?.id || 'bulkhead_sec_4', state: 'unlocked' };
      outcomes.vttEventEmitted = 'stage-cyberdeck-breach';
      outcomes.flagUpdates = { alarm_suppressed: true, sector_breached: true };
    } else {
      outcomes.damageDealt = 24; // Max strike damage
      outcomes.conditionsApplied = ['Target Stunned', 'Armor Shredded'];
    }
    sensoryCues.push('flawless neural handshake', 'resonant harmonic chime', 'tactical momentum surge');
    forbidden.push('counter-attack', 'alarm triggering', 'terminal glitch');
  } else if (systemIntent === 'EXECUTE_SUCCESS') {
    if (isHackAction) {
      outcomes.bulkheadToggled = { id: targetEntity?.id || 'bulkhead_sec_4', state: 'unlocked' };
      outcomes.vttEventEmitted = 'stage-bulkhead-toggled';
      outcomes.flagUpdates = { sector_breached: true };
    } else {
      outcomes.damageDealt = 12 + Math.max(0, margin);
    }
    sensoryCues.push('pneumatic hiss of cycling locks', 'green confirmation telemetry', 'fluid transition');
    forbidden.push('operative failure', 'system lockdown', 'weapon misfire');
  } else if (systemIntent === 'CRITICAL_FUMBLE') {
    outcomes.shieldsDelta = -6;
    outcomes.hpDelta = -2;
    outcomes.conditionsApplied = ['Disoriented', 'Weapon Jammed'];
    outcomes.alarmRaised = true;
    outcomes.flagUpdates = { alarm_triggered: true };
    sensoryCues.push('violent electrical back-surge', 'strobe flash of emergency red claxons', 'acrid ozone');
    forbidden.push('any measure of success', 'door opening', 'unnoticed withdrawal');
  } else {
    // EXECUTE_FAILURE
    if (isHackAction) {
      outcomes.shieldsDelta = -3;
      if (margin <= -4) {
        outcomes.alarmRaised = true;
        outcomes.flagUpdates = { alarm_triggered: true };
      }
    } else {
      outcomes.conditionsApplied = ['Off-Balance'];
    }
    sensoryCues.push('harsh buzz of security rejection', 'ricochet spark', 'momentary stance disruption');
    forbidden.push('complete success', 'bypassing security', 'target neutralization');
  }

  let prescribedOutcome = '';
  if (systemIntent === 'CRITICAL_TRIUMPH') {
    prescribedOutcome = `${initiatorName} achieves a decisive, masterful triumph in "${actionText}". Describe the effortless tactical execution.`;
  } else if (systemIntent === 'EXECUTE_SUCCESS') {
    prescribedOutcome = `${initiatorName} successfully accomplishes "${actionText}" with positive margin (+${margin}). Describe direct sensory progression.`;
  } else if (systemIntent === 'CRITICAL_FUMBLE') {
    prescribedOutcome = `${initiatorName} catastrophically botches "${actionText}" (Double 1s). Systems backfire or defensive response overwhelms the position.`;
  } else {
    prescribedOutcome = `${initiatorName} fails "${actionText}" by ${Math.abs(margin)} margin. The objective is resisted or thwarted with complications.`;
  }

  return createStructuralMandate({
    systemIntent,
    actionName: actionText,
    initiatorName,
    targetEntity: targetEntity?.name || targetEntity?.title,
    diceSummary,
    mechanicalOutcomes: outcomes,
    narrativeBounds: {
      requiredSensoryCues: sensoryCues,
      forbiddenOutcomes: forbidden,
      prescribedOutcome
    }
  });
}

/**
 * Formats a structural mandate into an imperative prompt directive for AIME.
 */
export function formatMandateForPrompt(mandate: AdeStructuralMandate): string {
  const lines: string[] = [
    '=== [SYSTEM STRUCTURAL MANDATE — DETERMINISTIC GAME ENGINE MASTER] ===',
    'AUTHORITY NOTICE: The mechanical outcome of this action is ALREADY SEALED AND IMMUTABLE.',
    'You are strictly forbidden from altering whether this action succeeded or failed.',
    `• System Intent: ${mandate.systemIntent}`,
    `• Declared Action: "${mandate.actionName}" attempted by ${mandate.initiatorName}`,
  ];

  if (mandate.diceSummary) {
    lines.push(`• Mechanical Check: ${mandate.diceSummary.formula}`);
    lines.push(`• Resolution Tier: ${mandate.diceSummary.tierLabel} (Margin: ${mandate.diceSummary.margin >= 0 ? '+' : ''}${mandate.diceSummary.margin})`);
  }

  if (mandate.narrativeBounds.refusalReason) {
    lines.push(`• Mechanical Refusal Reason: ${mandate.narrativeBounds.refusalReason}`);
  }

  lines.push('• Applied Mechanical State Outcomes:');
  if (mandate.mechanicalOutcomes.shieldsDelta) lines.push(`  - Shields: ${mandate.mechanicalOutcomes.shieldsDelta}`);
  if (mandate.mechanicalOutcomes.hpDelta) lines.push(`  - Health: ${mandate.mechanicalOutcomes.hpDelta}`);
  if (mandate.mechanicalOutcomes.damageDealt) lines.push(`  - Damage Dealt to Target: ${mandate.mechanicalOutcomes.damageDealt}`);
  if (mandate.mechanicalOutcomes.conditionsApplied?.length) lines.push(`  - Conditions Inflicted: ${mandate.mechanicalOutcomes.conditionsApplied.join(', ')}`);
  if (mandate.mechanicalOutcomes.bulkheadToggled) lines.push(`  - Bulkhead State: ${mandate.mechanicalOutcomes.bulkheadToggled.id} is now ${mandate.mechanicalOutcomes.bulkheadToggled.state}`);
  if (mandate.mechanicalOutcomes.alarmRaised) lines.push(`  - Alarm Status: Sector Security Alert Raised`);

  lines.push('• Directorial Narrative Mandate:');
  lines.push(`  - Prescribed Narrative Outcome: ${mandate.narrativeBounds.prescribedOutcome}`);
  lines.push(`  - Mandatory Sensory Cues to Depict: ${mandate.narrativeBounds.requiredSensoryCues.join('; ')}`);
  lines.push(`  - STRICTLY FORBIDDEN NARRATIVE EVENTS: ${mandate.narrativeBounds.forbiddenOutcomes.join('; ')}`);
  lines.push('Your task is to write ONLY the sensory, atmospheric narration faithfully rendering this exact mandate.');

  return lines.join('\n');
}
