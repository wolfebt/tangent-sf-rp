/**
 * @file vttPackage.ts
 * @description Type definitions for compiled VTT Packages produced by VttModuleCompilerService.
 * Incorporates the Story Gallery (maps, elements, situational & temporary modifiers),
 * narrative triggers, and runtime entity automations.
 */

import type { StoryModifier } from './storyModifier';

export interface CompiledVttManifest {
  title: string;
  version?: string;
  author?: string;
  scenarioId: string | null;
  mapId: string | null;
  techLevel: number;
  magicLevel: number;
  stats: {
    totalTokens: number;
    scriptedNpcs: number;
    totalObjects: number;
    reactiveTraps: number;
    wallVectors: number;
    totalMaps?: number;
    totalElements?: number;
    totalModifiers?: number;
  };
}

export interface CompiledVttStoryTrigger {
  id: string;
  type: string;
  triggerOn?: string;
  clueId?: string;
  title?: string;
  information?: string;
  triggerDistance?: number;
  payload?: any;
}

export interface CompiledVttStory {
  id: string;
  title: string;
  summary: string;
  pov?: string;
  stakes?: string;
  triggers: CompiledVttStoryTrigger[];
}

export interface CompiledVttWall {
  id: string;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  blocksMovement: boolean;
  blocksVision: boolean;
  doorState?: 'open' | 'closed' | 'locked' | null;
}

export interface CompiledVttToken {
  id: string;
  name?: string;
  label?: string;
  x?: number;
  y?: number;
  size?: number;
  radius?: number;
  fill?: string;
  avatarUrl?: string | null;
  color?: string;
  faction?: string;
  role?: string;
  designation?: string;
  behaviorProfile?: string;
  moraleThreshold?: number;
  defense?: number;
  armor?: string;
  weapon?: string;
  health?: { current: number; max: number };
  vitality?: { current: number; max: number };
  script?: {
    type: 'patrol' | 'sentry' | 'wander' | 'ambush' | 'dialogue_bark' | 'combat' | 'none';
    behaviorProfile?: string;
    moraleThreshold?: number;
    alertBark?: string;
    waypoints?: Array<{ x: number; y: number }>;
    facingAngleDeg?: number;
    fovAngleDeg?: number;
    detectionRadiusPx?: number;
    alertReaction?: string;
  };
  storyElementId?: string | null;
  relations?: {
    stance?: string;
    vipTarget?: string | null;
    rivalTarget?: string | null;
  };
  [key: string]: any;
}

export interface CompiledVttMap {
  id: string;
  title: string;
  width: number;
  height: number;
  gridSize: number;
  walls: CompiledVttWall[];
  objects: any[];
  tokens: CompiledVttToken[];
  backgroundUrl?: string | null;
}

export interface CompiledVttAutomations {
  scriptedNpcs: CompiledVttToken[];
  reactiveTraps: any[];
  storyTriggers: CompiledVttStoryTrigger[];
  activeModifiers?: StoryModifier[];
}

export interface CompiledVttGallery {
  maps: CompiledVttMap[];
  elements: any[];
  modifiers: StoryModifier[];
}

export interface CompiledVttPackage {
  packageId: string;
  compiledAt: string;
  manifest: CompiledVttManifest;
  gallery: CompiledVttGallery;
  story: CompiledVttStory;
  map: CompiledVttMap;
  automations: CompiledVttAutomations;
}

export interface CompiledVttResult {
  package: CompiledVttPackage;
  diagnostics: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}
