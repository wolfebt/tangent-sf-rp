/**
 * @file guidedForge.ts
 * @description Shared TypeScript contracts for the Adventure Development Environment (ADE)
 * Guided Asset Creation Engine ("GuidedForgeShell").
 * Designed to power Phase 1 (Element Forge Dual-Mode Studio) and Phase 2 (Weaver Scenarios & Adventure Modules).
 */

import type { AimeGuidanceSettings, LinkedAssetRef } from './ade';

export type GuidedAssetKind = 'element' | 'scenario' | 'map' | 'modifier';

export type GuidedEditorMode = 'guided' | 'sheet';

export type GuidedStageId = 'spark' | 'lens' | 'traits' | 'tactical' | 'web';

export type GuidedStageStatus = 'complete' | 'partial' | 'empty' | 'optional';

export type ElementPlaybookFamily =
  | 'entity'
  | 'location'
  | 'relic'
  | 'macro'
  | 'epistemic';

export interface GuidedElementDraft {
  id: string;
  type: string;
  title: string;
  content: string;
  imageUrl?: string;
  dbmSyncStatus?: 'synced' | 'local_override' | 'standalone' | string;
  fields: Record<string, any>;
  customFields: Array<{ id: string; label: string; value: string }>;
  guidance: AimeGuidanceSettings;
  assetHub: LinkedAssetRef[];
}

export interface GuidedFieldDiff {
  key: string;
  label: string;
  currentValue: string;
  proposedValue: string;
}

export interface GuidedStageSummary {
  id: GuidedStageId;
  num: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  status: GuidedStageStatus;
}

export interface GuidedReadinessReport {
  score: number;
  stages: Record<GuidedStageId, GuidedStageStatus>;
  completedPillars: string[];
  suggestions: string[];
  resonantKeywords: string[];
  railguardConflicts: string[];
}

export interface BlueprintTemplateConfig {
  id: string;
  name: string;
  category: string;
  elementType: string;
  icon: string;
  summary: string;
  promptTemplate: string;
  seedGuidance?: Partial<AimeGuidanceSettings>;
  seedFields?: Record<string, string>;
  seedTags?: string;
}

export interface ElementPlaybookConfig {
  family: ElementPlaybookFamily;
  familyLabel: string;
  elementType: string;
  pitchKey: string;
  pitchLabel: string;
  pitchPlaceholder: string;
  stage3Title: string;
  stage3Subtitle: string;
  stage4Title: string;
  stage4Subtitle: string;
  dbmCategories: string[];
  supportsSituationalModifier?: boolean;
}

export interface ResonantAssetSuggestion {
  assetId: string;
  assetTitle: string;
  assetType: string;
  suggestedImportance: 'high' | 'typical' | 'low';
  suggestedAnnotation: string;
  matchReason: string;
}
