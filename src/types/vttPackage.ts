/**
 * @file vttPackage.ts
 * @description Type definitions for compiled VTT Packages produced by VttModuleCompilerService.
 */

export interface CompiledVttManifest {
  title: string;
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
  };
}

export interface CompiledVttStoryTrigger {
  id: string;
  type: string;
  triggerOn: string;
  payload: any;
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
  avatarUrl?: string | null;
  color?: string;
  faction?: string;
  role?: string;
  health?: { current: number; max: number };
  vitality?: { current: number; max: number };
  defense?: number;
  script?: {
    type: 'patrol' | 'sentry' | 'wander' | 'ambush' | 'none';
    waypoints?: Array<{ x: number; y: number }>;
    facingAngleDeg?: number;
    fovAngleDeg?: number;
    detectionRadiusPx?: number;
    alertReaction?: string;
  };
  storyElementId?: string | null;
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
}

export interface CompiledVttAutomations {
  scriptedNpcs: CompiledVttToken[];
  reactiveTraps: any[];
  storyTriggers: CompiledVttStoryTrigger[];
}

export interface CompiledVttPackage {
  packageId: string;
  compiledAt: string;
  manifest: CompiledVttManifest;
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
