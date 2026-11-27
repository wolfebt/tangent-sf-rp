/**
 * @file stageStore.ts
 * @description Centralized Zustand state store for the ADE STAGE compiler workspace.
 * Manages manifest-only Stage architecture, linking foundational Map, Story, and Element assets
 * without mutating map sources.
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '../../../constants/storageKeys.ts';
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
  activeStoryScopeId: string | null;
  manifestsByStory: Record<string, StageManifest[]>;
  stageManifest: StageManifest;
  isDirty: boolean;

  // Scope & Multi-Stage Actions
  setStoryScope: (storyId: string, cloudStages?: StageManifest[]) => void;
  selectStage: (stageId: string) => void;
  createStage: (mapId?: string, storyId?: string, title?: string) => StageManifest;
  duplicateStage: (stageId: string) => StageManifest | null;
  deleteStage: (stageId: string) => void;

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
  markClean: () => void;
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

const upsertManifestInBuckets = (
  manifestsByStory: Record<string, StageManifest[]>,
  scopeId: string | null,
  manifest: StageManifest
): Record<string, StageManifest[]> => {
  const key = scopeId || manifest.storyId || 'default';
  const existing = Array.isArray(manifestsByStory[key]) ? manifestsByStory[key] : [];
  const idx = existing.findIndex((m) => m && m.id === manifest.id);
  const nextList =
    idx >= 0
      ? existing.map((m) => (m && m.id === manifest.id ? manifest : m))
      : [...existing, manifest];
  return {
    ...manifestsByStory,
    [key]: nextList,
  };
};

export const useStageStore = create<StageStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        activeStageTab: 'setup',
        activeStageId: null,
        activeStoryScopeId: null,
        manifestsByStory: {},
        stageManifest: createDefaultManifest(),
        isDirty: false,

        setStoryScope: (storyId, cloudStages) =>
          set((state) => {
            const nextScope = storyId || 'default';
            const prevScope = state.activeStoryScopeId;
            let nextBuckets = { ...(state.manifestsByStory || {}) };

            if (prevScope === nextScope && state.isDirty) {
              return state;
            }

            if (prevScope && state.stageManifest?.id) {
              nextBuckets = upsertManifestInBuckets(nextBuckets, prevScope, state.stageManifest);
            }

            let scopedList: StageManifest[] = [];
            if (Array.isArray(cloudStages) && cloudStages.length > 0) {
              scopedList = cloudStages.map((s) => ({
                ...createDefaultManifest(s.mapId || '', nextScope),
                ...s,
                storyId: s.storyId || nextScope,
              }));
            } else if (Array.isArray(nextBuckets[nextScope]) && nextBuckets[nextScope].length > 0) {
              scopedList = nextBuckets[nextScope];
            } else {
              scopedList = [createDefaultManifest('', nextScope)];
            }

            nextBuckets[nextScope] = scopedList;
            const targetManifest =
              (prevScope === nextScope && state.activeStageId
                ? scopedList.find((s) => s.id === state.activeStageId)
                : null) || scopedList[0];

            if (
              prevScope === nextScope &&
              state.stageManifest?.id === targetManifest?.id &&
              state.stageManifest?.updatedAt === targetManifest?.updatedAt
            ) {
              return state;
            }

            return {
              activeStoryScopeId: nextScope,
              manifestsByStory: nextBuckets,
              stageManifest: targetManifest,
              activeStageId: targetManifest?.id || null,
              isDirty: false,
            };
          }),

        selectStage: (stageId) =>
          set((state) => {
            const scopeKey = state.activeStoryScopeId || state.stageManifest?.storyId || 'default';
            const list = state.manifestsByStory[scopeKey] || [];
            const found = list.find((s) => s.id === stageId);
            if (!found) return state;
            return {
              stageManifest: found,
              activeStageId: found.id,
              isDirty: false,
            };
          }),

        createStage: (mapId = '', storyId = '', title) => {
          const state = get();
          const scopeKey = storyId || state.activeStoryScopeId || 'default';
          const created: StageManifest = {
            ...createDefaultManifest(mapId, scopeKey),
            ...(title ? { title } : {}),
          };
          set((curr) => ({
            activeStoryScopeId: scopeKey,
            stageManifest: created,
            activeStageId: created.id,
            manifestsByStory: upsertManifestInBuckets(curr.manifestsByStory, scopeKey, created),
            isDirty: true,
          }));
          return created;
        },

        duplicateStage: (stageId) => {
          const state = get();
          const scopeKey = state.activeStoryScopeId || state.stageManifest?.storyId || 'default';
          const list = state.manifestsByStory[scopeKey] || [];
          const source =
            list.find((s) => s && s.id === stageId) ||
            (state.stageManifest?.id === stageId ? state.stageManifest : null);
          if (!source) return null;
          const now = Date.now();
          const cloned: StageManifest = {
            ...JSON.parse(JSON.stringify(source)),
            id: `stage-${now}-${Math.random().toString(36).slice(2, 6)}`,
            title: `${source.title || 'Stage'} (Copy)`,
            createdAt: now,
            updatedAt: now
          };
          set((curr) => ({
            activeStoryScopeId: scopeKey,
            stageManifest: cloned,
            activeStageId: cloned.id,
            manifestsByStory: upsertManifestInBuckets(curr.manifestsByStory, scopeKey, cloned),
            isDirty: true
          }));
          return cloned;
        },

        deleteStage: (stageId) =>
          set((state) => {
            const scopeKey = state.activeStoryScopeId || state.stageManifest?.storyId || 'default';
            const existing = state.manifestsByStory[scopeKey] || [];
            const filtered = existing.filter((s) => s && s.id !== stageId);
            const resolvedList = filtered.length > 0 ? filtered : [createDefaultManifest('', scopeKey)];
            const nextActive =
              state.stageManifest?.id === stageId ? resolvedList[0] : state.stageManifest;
            return {
              manifestsByStory: {
                ...state.manifestsByStory,
                [scopeKey]: resolvedList,
              },
              stageManifest: nextActive,
              activeStageId: nextActive?.id || null,
              isDirty: true,
            };
          }),

        setActiveStageTab: (tab) => set({ activeStageTab: tab }),

        setActiveStageId: (stageId) => set({ activeStageId: stageId }),

        setStageManifest: (manifest) => set((state) => ({ 
          stageManifest: manifest, 
          activeStageId: manifest.id,
          manifestsByStory: upsertManifestInBuckets(
            state.manifestsByStory || {},
            state.activeStoryScopeId || manifest.storyId || null,
            manifest
          ),
          isDirty: false 
        })),

        updateStageManifest: (partial) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            ...partial,
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        addAnchor: (anchor) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            anchors: [...state.stageManifest.anchors, anchor],
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        updateAnchor: (anchorId, partial) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            anchors: state.stageManifest.anchors.map(a => a.id === anchorId ? { ...a, ...partial } : a),
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        removeAnchor: (anchorId) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            anchors: state.stageManifest.anchors.filter(a => a.id !== anchorId),
            // Also remove any triggers tied to this anchor
            triggers: state.stageManifest.triggers.filter(t => t.anchorId !== anchorId),
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        addTrigger: (trigger) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            triggers: [...state.stageManifest.triggers, trigger],
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        updateTrigger: (triggerId, partial) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            triggers: state.stageManifest.triggers.map(t => t.id === triggerId ? { ...t, ...partial } : t),
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        removeTrigger: (triggerId) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            triggers: state.stageManifest.triggers.filter(t => t.id !== triggerId),
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        updateEnvironment: (partial) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            environment: {
              ...state.stageManifest.environment,
              ...partial
            },
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        setStageVariable: (key, value) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            variables: {
              ...state.stageManifest.variables,
              [key]: value
            },
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        removeStageVariable: (key) => set((state) => {
          const nextVars = { ...state.stageManifest.variables };
          delete nextVars[key];
          const nextManifest = {
            ...state.stageManifest,
            variables: nextVars,
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        addEncounter: (encounter) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            encounters: [...state.stageManifest.encounters, encounter],
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        updateEncounter: (encounterId, partial) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            encounters: state.stageManifest.encounters.map(e => e.id === encounterId ? { ...e, ...partial } : e),
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        removeEncounter: (encounterId) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            encounters: state.stageManifest.encounters.filter(e => e.id !== encounterId),
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        addMacro: (macro) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            macros: [...state.stageManifest.macros, macro],
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        removeMacro: (macroId) => set((state) => {
          const nextManifest = {
            ...state.stageManifest,
            macros: state.stageManifest.macros.filter(m => m.id !== macroId),
            updatedAt: Date.now()
          };
          return {
            stageManifest: nextManifest,
            manifestsByStory: upsertManifestInBuckets(
              state.manifestsByStory || {},
              state.activeStoryScopeId || nextManifest.storyId || null,
              nextManifest
            ),
            isDirty: true
          };
        }),

        markClean: () => set({ isDirty: false }),

        resetStageManifest: (defaultMapId = '', defaultStoryId = '') => set({
          stageManifest: createDefaultManifest(defaultMapId, defaultStoryId),
          activeStageId: null,
          isDirty: false
        })
      }),
      {
        name: STORAGE_KEYS.STAGE_MANIFEST,
        storage: createJSONStorage(() => {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
          }
          const memoryStore = new Map<string, string>();
          return {
            getItem: (key: string) => memoryStore.get(key) ?? null,
            setItem: (key: string, value: string) => { memoryStore.set(key, value); },
            removeItem: (key: string) => { memoryStore.delete(key); }
          };
        }),
        partialize: (state) => ({
          activeStageTab: state.activeStageTab,
          activeStageId: state.activeStageId,
          activeStoryScopeId: state.activeStoryScopeId,
          manifestsByStory: state.manifestsByStory,
          stageManifest: state.stageManifest
        })
      }
    ),
    { name: 'ADEStageStore' }
  )
);
