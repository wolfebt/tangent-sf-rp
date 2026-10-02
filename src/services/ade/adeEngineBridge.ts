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
import type { AdePreflightTelemetry, AdeElementRecord } from '../../types/ade.ts';

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
