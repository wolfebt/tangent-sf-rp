/**
 * @file adeMandate.ts
 * @description Structural Mandate & Constrained Decoding Protocol for Tangent ADE.
 * Grounded in Phase 2 Architectural Specs:
 * - Subordinates the generative model to the deterministic game engine (adeEngineBridge.ts).
 * - Enforces immutable mechanical arbitration (2d10 checks, called shots, tech levels).
 * - Defines strict JSON output schemas for StageView.tsx and CronicleService.
 */

export type SystemIntent = 
  | 'EXECUTE_SUCCESS'
  | 'EXECUTE_FAILURE'
  | 'CRITICAL_TRIUMPH'
  | 'CRITICAL_FUMBLE'
  | 'REFUSE_ACTION'
  | 'CONDITIONAL_BRANCH';

export type RefusalReason =
  | 'Tech_Level_Low'
  | 'Insufficient_Range'
  | 'Shield_Harmonic_Mismatch'
  | 'Karma_Exhausted'
  | 'Environmental_Hazard'
  | 'Prerequisite_Missing'
  | string;

export interface DiceRollSummary {
  dice1: number;
  dice2: number;
  diceSum: number;
  isDouble: boolean;
  skillName: string;
  skillRank: number;
  attrKey: string;
  attrMod: number;
  miscMod: number;
  totalCheck: number;
  targetDC: number;
  margin: number;
  tierLabel: string;
  formula: string;
}

export interface MechanicalOutcomes {
  hpDelta?: number;
  vpDelta?: number;
  shieldsDelta?: number;
  damageDealt?: number;
  conditionsApplied?: string[];
  bulkheadToggled?: { id: string; state: 'locked' | 'unlocked' };
  alarmRaised?: boolean;
  vttEventEmitted?: string;
  flagUpdates?: Record<string, boolean | number | string>;
}

export interface NarrativeBounds {
  refusalReason?: RefusalReason;
  requiredSensoryCues: string[];
  forbiddenOutcomes: string[];
  toneGuidance?: string;
  prescribedOutcome?: string;
}

export interface AdeStructuralMandate {
  mandateId: string;
  timestamp: number;
  systemIntent: SystemIntent;
  actionName: string;
  initiatorName: string;
  targetEntity?: string;
  diceSummary?: DiceRollSummary;
  mechanicalOutcomes: MechanicalOutcomes;
  narrativeBounds: NarrativeBounds;
}

export interface AdeStoryBeatOption {
  id: string;
  text: string;
  skillCheck: string;
}

export interface AdeStoryBeatDelta {
  entityId: string;
  property: string;
  newValue: string | number | boolean;
}

export interface AdeStoryBeatOutput {
  narrative: string;
  gate: {
    prompt: string;
    options: AdeStoryBeatOption[];
  };
  stageDeltas?: AdeStoryBeatDelta[];
}
