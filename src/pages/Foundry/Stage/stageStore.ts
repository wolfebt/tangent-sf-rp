/**
 * @file stageStore.ts
 * @description Centralized Zustand state store for the ADE STAGE compiler workspace.
 * Manages manifest-only Stage architecture, linking foundational Map, Story, and Element assets
 * without mutating map sources.
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { 
  StageManifest, 
  StageAnchor, 
  StageTrigger, 
  StageEnvironment, 
  StageEncounter, 
  StageMacroBinding 
} from './stageTypes';

export type StageWorkspaceTab = 'setup' | 'anchors' | 'flow' | 'environment' | 'encounters' | 'scripts' | 'run';

export interface StageStoreState {
  activeStageTab: StageWorkspaceTab;
  activeStageId: string | null;
  stageManifest: StageManifest;
  isDirty: boolean;

  // Tab & Selection Actions
  setActiveStageTab: (tab: StageWorkspaceTab) => void;
  setActiveStageId: (stageId: string | null) => void;
  setStageManifest: (manifest: StageManifest) => void;
  updateStageManifest: (partial: Partial<StageManifest>) => void;

  // Anchor Actions (Manifest-Only; pristine maps)
  addAnchor: (anchor: StageAnchor) => void;
  updateAnchor: (anchorId: string, partial: Partial<StageAnchor>) => void;
  removeAnchor: (anchorId: string) => void;

  // Trigger Actions
  addTrigger: (trigger: StageTrigger) => void;
  updateTrigger: (triggerId: string, partial: Partial<StageTrigger>) => void;
  removeTrigger: (triggerId: string) => void;

  // Environment & Variables
  updateEnvironment: (partial: Partial<StageEnvironment>) => void;
  setStageVariable: (key: string, value: boolean | number | string) => void;
  removeStageVariable: (key: string) => void;

  // Encounters
  addEncounter: (encounter: StageEncounter) => void;
  updateEncounter: (encounterId: string, partial: Partial<StageEncounter>) => void;
  removeEncounter: (encounterId: string) => void;

  // Macros
  addMacro: (macro: StageMacroBinding) => void;
  removeMacro: (macroId: string) => void;

  // Lifecycle
  resetStageManifest: (defaultMapId?: string, defaultStoryId?: string) => void;
}

export const createDefaultManifest = (mapId = '', storyId = ''): StageManifest => ({
  id: `stage-${Date.now()}`,
  title: 'New Combat & Narrative Stage',
  mapId: mapId,
  storyId: storyId,
  scenarioIds: storyId ? [storyId] : [],
  anchors: [],
  triggers: [],
  environment: {
    lighting: { mode: 'normal', ambientIntensity: 1.0 },
    weather: 'clear',
    modifierIds: [],
    ambientAudio: ''
  },
  encounters: [],
  variables: {},
  macros: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
});

export const useStageStore = create<StageStoreState>()(
  devtools(
    persist(
      (set) => ({
        activeStageTab: 'setup',
        activeStageId: null,
        stageManifest: createDefaultManifest(),
        isDirty: false,

        setActiveStageTab: (tab) => set({ activeStageTab: tab }),

        setActiveStageId: (stageId) => set({ activeStageId: stageId }),

        setStageManifest: (manifest) => set({ 
          stageManifest: manifest, 
          activeStageId: manifest.id,
          isDirty: false 
        }),

        updateStageManifest: (partial) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            ...partial,
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        addAnchor: (anchor) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            anchors: [...state.stageManifest.anchors, anchor],
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        updateAnchor: (anchorId, partial) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            anchors: state.stageManifest.anchors.map(a => a.id === anchorId ? { ...a, ...partial } : a),
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        removeAnchor: (anchorId) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            anchors: state.stageManifest.anchors.filter(a => a.id !== anchorId),
            // Also remove any triggers tied to this anchor
            triggers: state.stageManifest.triggers.filter(t => t.anchorId !== anchorId),
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        addTrigger: (trigger) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            triggers: [...state.stageManifest.triggers, trigger],
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        updateTrigger: (triggerId, partial) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            triggers: state.stageManifest.triggers.map(t => t.id === triggerId ? { ...t, ...partial } : t),
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        removeTrigger: (triggerId) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            triggers: state.stageManifest.triggers.filter(t => t.id !== triggerId),
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        updateEnvironment: (partial) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            environment: {
              ...state.stageManifest.environment,
              ...partial
            },
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        setStageVariable: (key, value) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            variables: {
              ...state.stageManifest.variables,
              [key]: value
            },
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        removeStageVariable: (key) => set((state) => {
          const nextVars = { ...state.stageManifest.variables };
          delete nextVars[key];
          return {
            stageManifest: {
              ...state.stageManifest,
              variables: nextVars,
              updatedAt: Date.now()
            },
            isDirty: true
          };
        }),

        addEncounter: (encounter) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            encounters: [...state.stageManifest.encounters, encounter],
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        updateEncounter: (encounterId, partial) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            encounters: state.stageManifest.encounters.map(e => e.id === encounterId ? { ...e, ...partial } : e),
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        removeEncounter: (encounterId) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            encounters: state.stageManifest.encounters.filter(e => e.id !== encounterId),
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        addMacro: (macro) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            macros: [...state.stageManifest.macros, macro],
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        removeMacro: (macroId) => set((state) => ({
          stageManifest: {
            ...state.stageManifest,
            macros: state.stageManifest.macros.filter(m => m.id !== macroId),
            updatedAt: Date.now()
          },
          isDirty: true
        })),

        resetStageManifest: (defaultMapId = '', defaultStoryId = '') => set({
          stageManifest: createDefaultManifest(defaultMapId, defaultStoryId),
          activeStageId: null,
          isDirty: false
        })
      }),
      {
        name: 'tangent_ade_stage_manifest_v2',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          activeStageTab: state.activeStageTab,
          activeStageId: state.activeStageId,
          stageManifest: state.stageManifest
        })
      }
    ),
    { name: 'ADEStageStore' }
  )
);
