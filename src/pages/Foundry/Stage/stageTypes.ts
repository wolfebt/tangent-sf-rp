/**
 * @file stageTypes.ts
 * @description Core TypeScript contracts and schemas for the ADE STAGE compiler and runtime workspace.
 * Stage binds foundational assets (Maps, Stories, Elements) through manifest-only anchors, triggers,
 * encounters, environmental modifiers, and reactive automations.
 */

export type StageAnchorKind = 'waypoint' | 'object' | 'region' | 'spawn';

export interface StageAnchor {
  id: string;
  name?: string;
  kind: StageAnchorKind;
  ref?: string; // Optional pointer to an existing map waypoint or object ID
  pos?: {
    x: number;
    y: number;
    w?: number;
    h?: number;
  };
  elementIds: string[];
  beatRef?: {
    scenarioId: string;
    beatIndex: number;
  };
  note?: string;
}

export type StageTriggerEvent = 'enter' | 'leave' | 'interact' | 'beat' | 'flag' | 'timer';

export type StageTriggerAction =
  | { type: 'REVEAL_BEAT'; scenarioId?: string; beatIndex?: number; prompt?: string }
  | { type: 'ADVANCE_SCENARIO'; targetScenarioId: string }
  | { type: 'TRIGGER_AIME'; prompt?: string; readAloudText?: string }
  | { type: 'SET_FLAG'; key: string; value: any; scope?: 'global' | 'scenario' | 'operative' }
  | { type: 'SPAWN_ELEMENT' | 'DESPAWN_ELEMENT'; elementId: string; anchorId?: string; x?: number; y?: number }
  | { type: 'APPLY_MODIFIER'; modifierId: string }
  | { type: 'RUN_MACRO'; scriptId: string };

export interface StageTrigger {
  id: string;
  name?: string;
  anchorId: string;
  on: StageTriggerEvent;
  when?: string; // Condition expression evaluated via evaluateConditionExpression()
  actions: StageTriggerAction[];
  gmConfirm?: boolean; // Requires GM approval chip before execution
  isTriggered?: boolean;
}

export interface StageEnvironment {
  lighting?: any;
  weather?: string;
  atmosphericPresetId?: string;
  modifierIds: string[];
  ambientAudio?: string;
}

export interface StageEncounter {
  id: string;
  label: string;
  anchorId?: string;
  tokenElementIds: string[];
  active: boolean;
  notes?: string;
}

export interface StageMacroBinding {
  id: string;
  scriptId: string;
  on?: string;
}

export interface StageManifest {
  id: string;
  title: string;
  mapId: string; // Asset ref (Map Editor); multiple stages can share the same mapId
  storyId?: string; // Asset ref (Weaver scenario or universe story)
  scenarioIds: string[]; // Ordered scenario progression
  anchors: StageAnchor[]; // Manifest-only anchors; never mutated back to the underlying map asset
  triggers: StageTrigger[];
  environment: StageEnvironment;
  encounters: StageEncounter[];
  variables: Record<string, boolean | number | string>; // Seeds storyFlags in adeStore
  macros: StageMacroBinding[];
  createdAt: number;
  updatedAt: number;
}
