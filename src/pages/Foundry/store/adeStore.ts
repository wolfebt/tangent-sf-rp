/**
 * @file adeStore.ts
 * @description Centralized Zustand state store for the Adventure Development Environment (ADE).
 * Manages studio mode (Development vs Running Live), viewport split configuration,
 * guide rail sections, workspace views, tabs, cockpit decks, and active modal overlays.
 * Enhanced with devtools and persist middleware for persistent user layout preferences.
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { AdeElementRecord, AdePreflightTelemetry } from '../../../types/ade';
import { STORAGE_KEYS } from '../../../constants/storageKeys.ts';

export type StudioMode = 'development' | 'live_session';
export type PerspectiveMode = 'architect' | 'operator';
export type AdePillar = 'mission_control' | 'narrative' | 'stage' | 'maps' | 'scripts' | 'assets' | 'live_director';
export type AdeView = 'mission_control' | 'scenarios' | 'stage' | 'control-panel' | 'interactive' | 'graph' | 'gallery' | 'elements' | 'map' | 'scripts';
export type ViewportSplit = 'side_by_side' | 'canvas_only' | 'story_only';
export type GuideSection = 'scenarios' | 'sectors' | 'waypoints' | 'bestiary' | 'props' | 'weather' | 'memory' | 'aime';
export type WeaverWorkspaceTab = 'write' | 'brainstorm' | 'gems' | 'elements' | 'graph' | 'play' | 'weaver' | 'manuscript' | 'outline' | 'genesis' | 'tactical' | 'stage' | 'interactive' | 'gallery';
export type StoryWorkspaceTab = WeaverWorkspaceTab;
export type StageWorkspaceTab = 'setup' | 'anchors' | 'flow' | 'environment' | 'encounters' | 'scripts' | 'run';
export type CockpitDeck = 'inspector' | 'tactical' | 'elements' | 'aime';
export type CronicleDeckMode = 'living_memory' | 'scratchbook';

export type AdeModalKey = 
  | 'catalog'
  | 'gems'
  | 'cronicle'
  | 'compiler'
  | 'guide'
  | 'settings'
  | 'extractor'
  | 'editElement'
  | 'print'
  | 'floatingAime'
  | 'moduleExport'
  | 'moduleImport';

export type PreflightTelemetry = AdePreflightTelemetry;

export interface StoryFlagRecord {
  key: string;
  value: boolean | number | string;
  scope: 'global' | 'scenario' | 'operative';
  scenarioId?: string;
  lastUpdated: number;
}

export interface LorebookConfig {
  maxTokens: number;             // Configurable lore injection ceiling (default 1200)
  maxRecursionPasses: number;    // Capped at 1 to 3 passes (default 3)
  enableRecursiveScanning: boolean;
  enablePrefixCaching: boolean;
}

export interface ADEStoreState {
  studioMode: StudioMode;
  perspectiveMode: PerspectiveMode;
  activePillar: AdePillar;
  activeView: AdeView;
  storyWorkspaceTab: StoryWorkspaceTab;
  stageWorkspaceTab: StageWorkspaceTab;
  viewportSplit: ViewportSplit;
  activeGuideSection: GuideSection;
  activeCockpitDeck: CockpitDeck;
  isDrawerOpen: boolean;
  isTreeExpanded: boolean;
  isRightDockOpen: boolean;
  isSplitView: boolean;
  editingElement: AdeElementRecord | null;
  cronicleInitialMode: CronicleDeckMode;
  preflightTelemetry: PreflightTelemetry;
  modals: Record<AdeModalKey, boolean>;

  // Story Flag Ledger & Dynamic Lorebook Architecture
  storyFlags: Record<string, StoryFlagRecord>;
  lorebookConfig: LorebookConfig;

  // Actions
  setStudioMode: (mode: StudioMode) => void;
  setPerspectiveMode: (mode: PerspectiveMode) => void;
  togglePerspectiveMode: () => void;
  setActivePillar: (pillar: AdePillar) => void;
  setActiveView: (view: AdeView) => void;
  setStoryWorkspaceTab: (tab: StoryWorkspaceTab) => void;
  setStageWorkspaceTab: (tab: StageWorkspaceTab) => void;
  setViewportSplit: (split: ViewportSplit) => void;
  setActiveGuideSection: (section: GuideSection) => void;
  setActiveCockpitDeck: (deck: CockpitDeck) => void;
  setIsDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleDrawer: () => void;
  setIsTreeExpanded: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleTreeExpanded: () => void;
  setIsRightDockOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleRightDock: () => void;
  setIsSplitView: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleSplitView: () => void;
  setEditingElement: (element: AdeElementRecord | null) => void;
  setCronicleInitialMode: (mode: CronicleDeckMode) => void;
  setPreflightTelemetry: (telemetry: PreflightTelemetry) => void;
  setModal: (key: AdeModalKey, open: boolean) => void;
  toggleModal: (key: AdeModalKey) => void;
  closeAllModals: () => void;

  // Story Flag Ledger & Dynamic Lorebook Actions
  setStoryFlag: (key: string, value: boolean | number | string, scope?: 'global' | 'scenario' | 'operative', scenarioId?: string) => void;
  getStoryFlag: (key: string, defaultValue?: any) => any;
  incrementStoryFlag: (key: string, delta?: number) => void;
  removeStoryFlag: (key: string) => void;
  resetScenarioFlags: (scenarioId: string) => void;
  evaluateStoryCondition: (conditionExpr?: string) => boolean;
  setLorebookConfig: (config: Partial<LorebookConfig>) => void;
}

/**
 * Safely evaluates story condition expressions against active story flags without eval.
 */
export function evaluateConditionExpression(
  expr: string | undefined | null,
  flags: Record<string, StoryFlagRecord> | Record<string, any> = {}
): boolean {
  if (!expr || typeof expr !== 'string' || !expr.trim()) return true;

  const trimmed = expr.trim();

  // Logical disjunction (||)
  if (trimmed.includes('||')) {
    const parts = trimmed.split('||');
    return parts.some(p => evaluateConditionExpression(p, flags));
  }

  // Logical conjunction (&&)
  if (trimmed.includes('&&')) {
    const parts = trimmed.split('&&');
    return parts.every(p => evaluateConditionExpression(p, flags));
  }

  // Comparison operators: ===, ==, !==, !=, >=, <=, >, <
  const compRegex = /^\s*([a-zA-Z0-9_.-]+)\s*(===|==|!==|!=|>=|<=|>|<)\s*(.+?)\s*$/;
  const match = trimmed.match(compRegex);

  if (match) {
    const [, leftKey, op, rawRight] = match;
    const flagEntry = flags[leftKey];
    const leftVal = flagEntry !== undefined 
      ? (typeof flagEntry === 'object' && flagEntry !== null && 'value' in flagEntry ? flagEntry.value : flagEntry) 
      : undefined;

    let rightVal: any = rawRight.trim();
    if (rightVal === 'true') rightVal = true;
    else if (rightVal === 'false') rightVal = false;
    else if (rightVal === 'null' || rightVal === 'undefined') rightVal = undefined;
    else if (!isNaN(Number(rightVal)) && !rightVal.startsWith('"') && !rightVal.startsWith("'")) {
      rightVal = Number(rightVal);
    } else {
      rightVal = rightVal.replace(/^['"]|['"]$/g, '');
    }

    switch (op) {
      case '==':
      case '===':
        return leftVal == rightVal;
      case '!=':
      case '!==':
        return leftVal != rightVal;
      case '>':
        return Number(leftVal) > Number(rightVal);
      case '>=':
        return Number(leftVal) >= Number(rightVal);
      case '<':
        return Number(leftVal) < Number(rightVal);
      case '<=':
        return Number(leftVal) <= Number(rightVal);
      default:
        return false;
    }
  }

  // Negation: !flagKey
  if (trimmed.startsWith('!')) {
    const key = trimmed.slice(1).trim();
    const entry = flags[key];
    const val = entry !== undefined ? (typeof entry === 'object' && entry !== null && 'value' in entry ? entry.value : entry) : false;
    return !Boolean(val);
  }

  // Direct truthiness check: flagKey
  const entry = flags[trimmed];
  const val = entry !== undefined ? (typeof entry === 'object' && entry !== null && 'value' in entry ? entry.value : entry) : false;
  return Boolean(val);
}

export const useADEStore = create<ADEStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        studioMode: 'development',
        perspectiveMode: 'architect',
        activePillar: 'mission_control',
        activeView: 'mission_control',
        storyWorkspaceTab: 'weaver',
        stageWorkspaceTab: 'setup',
        viewportSplit: 'side_by_side',
        activeGuideSection: 'scenarios',
        activeCockpitDeck: 'inspector',
        isDrawerOpen: true,
        isTreeExpanded: true,
        isRightDockOpen: true,
        isSplitView: false,
        editingElement: null,
        cronicleInitialMode: 'living_memory',
        preflightTelemetry: {
          score: 100,
          issues: [],
          warnings: []
        },
        modals: {
          catalog: false,
          gems: false,
          cronicle: false,
          compiler: false,
          guide: false,
          settings: false,
          extractor: false,
          editElement: false,
          print: false,
          floatingAime: false,
          moduleExport: false,
          moduleImport: false
        },
        storyFlags: {},
        lorebookConfig: {
          maxTokens: 1200,
          maxRecursionPasses: 3,
          enableRecursiveScanning: true,
          enablePrefixCaching: true
        },

        // Studio mode: when transitioning to live_session, collapse outliner tree to maximize tactical canvas/stage area
        setStudioMode: (mode) => set({
          studioMode: mode,
          ...(mode === 'live_session' ? { isTreeExpanded: false } : {})
        }),

        setPerspectiveMode: (mode) => set({ perspectiveMode: mode }),
        togglePerspectiveMode: () => set((state) => ({ 
          perspectiveMode: state.perspectiveMode === 'architect' ? 'operator' : 'architect' 
        })),
        setActivePillar: (pillar) => set({ activePillar: pillar }),
        setActiveView: (view) => set({ activeView: view }),
        setStoryWorkspaceTab: (tab) => set({ storyWorkspaceTab: tab }),
        setStageWorkspaceTab: (tab) => set({ stageWorkspaceTab: tab }),
        setViewportSplit: (split) => set({ viewportSplit: split }),
        setActiveGuideSection: (section) => set({ activeGuideSection: section }),
        setActiveCockpitDeck: (deck) => set({ activeCockpitDeck: deck }),
        setIsDrawerOpen: (val) => set((state) => ({
          isDrawerOpen: typeof val === 'function' ? val(state.isDrawerOpen) : val
        })),
        toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
        setIsTreeExpanded: (val) => set((state) => ({
          isTreeExpanded: typeof val === 'function' ? val(state.isTreeExpanded) : val
        })),
        toggleTreeExpanded: () => set((state) => ({ isTreeExpanded: !state.isTreeExpanded })),
        setIsRightDockOpen: (val) => set((state) => ({
          isRightDockOpen: typeof val === 'function' ? val(state.isRightDockOpen) : val
        })),
        toggleRightDock: () => set((state) => ({ isRightDockOpen: !state.isRightDockOpen })),
        setIsSplitView: (val) => set((state) => ({
          isSplitView: typeof val === 'function' ? val(state.isSplitView) : val
        })),
        toggleSplitView: () => set((state) => ({ isSplitView: !state.isSplitView })),
        setEditingElement: (element) => set({ editingElement: element }),
        setCronicleInitialMode: (mode) => set({ cronicleInitialMode: mode }),
        setPreflightTelemetry: (telemetry) => set({ preflightTelemetry: telemetry }),

        setModal: (key, open) => set((state) => ({
          modals: { ...state.modals, [key]: open }
        })),

        toggleModal: (key) => set((state) => ({
          modals: { ...state.modals, [key]: !state.modals[key] }
        })),

        closeAllModals: () => set((state) => ({
          modals: Object.keys(state.modals).reduce((acc, k) => {
            acc[k as AdeModalKey] = false;
            return acc;
          }, {} as Record<AdeModalKey, boolean>)
        })),

        // Story Flag Ledger & Dynamic Lorebook Actions
        setStoryFlag: (key, value, scope = 'global', scenarioId) => set((state) => ({
          storyFlags: {
            ...state.storyFlags,
            [key]: {
              key,
              value,
              scope,
              scenarioId,
              lastUpdated: Date.now()
            }
          }
        })),

        getStoryFlag: (key, defaultValue = undefined) => {
          const entry = get().storyFlags[key];
          return entry !== undefined ? entry.value : defaultValue;
        },

        incrementStoryFlag: (key, delta = 1) => set((state) => {
          const current = state.storyFlags[key];
          const prevVal = typeof current?.value === 'number' ? current.value : 0;
          return {
            storyFlags: {
              ...state.storyFlags,
              [key]: {
                key,
                value: prevVal + delta,
                scope: current?.scope || 'global',
                scenarioId: current?.scenarioId,
                lastUpdated: Date.now()
              }
            }
          };
        }),

        removeStoryFlag: (key) => set((state) => {
          const next = { ...state.storyFlags };
          delete next[key];
          return { storyFlags: next };
        }),

        resetScenarioFlags: (scenarioId) => set((state) => {
          const next = { ...state.storyFlags };
          for (const [k, v] of Object.entries(next)) {
            if (v.scenarioId === scenarioId) {
              delete next[k];
            }
          }
          return { storyFlags: next };
        }),

        evaluateStoryCondition: (conditionExpr) => {
          return evaluateConditionExpression(conditionExpr, get().storyFlags);
        },

        setLorebookConfig: (cfg) => set((state) => ({
          lorebookConfig: {
            ...state.lorebookConfig,
            ...cfg
          }
        }))
      }),
      {
        name: STORAGE_KEYS.ADE_LAYOUT_PREFS,
        partialize: (state) => ({
          isDrawerOpen: state.isDrawerOpen,
          isTreeExpanded: state.isTreeExpanded,
          isRightDockOpen: state.isRightDockOpen,
          isSplitView: state.isSplitView,
          viewportSplit: state.viewportSplit,
          perspectiveMode: state.perspectiveMode,
          activeCockpitDeck: state.activeCockpitDeck,
          storyFlags: state.storyFlags,
          lorebookConfig: state.lorebookConfig,
        }),
        storage: createJSONStorage(() => {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
          }
          const memoryStore = new Map<string, string>();
          return {
            getItem: (name: string) => memoryStore.get(name) ?? null,
            setItem: (name: string, value: string) => { memoryStore.set(name, value); },
            removeItem: (name: string) => { memoryStore.delete(name); },
          };
        }),
      }
    ),
    { name: 'ADEStore' }
  )
);

export const useAdeStore = useADEStore;
