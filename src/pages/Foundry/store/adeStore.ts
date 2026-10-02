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
export type AdePillar = 'mission_control' | 'narrative' | 'maps' | 'scripts' | 'assets' | 'live_director';
export type AdeView = 'mission_control' | 'scenarios' | 'control-panel' | 'interactive' | 'graph' | 'gallery' | 'map' | 'scripts';
export type ViewportSplit = 'side_by_side' | 'canvas_only' | 'story_only';
export type GuideSection = 'scenarios' | 'sectors' | 'waypoints' | 'bestiary' | 'props' | 'weather' | 'memory' | 'aime';
export type StoryWorkspaceTab = 'weaver' | 'stage' | 'tactical' | 'interactive' | 'graph' | 'gallery';
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

export interface ADEStoreState {
  studioMode: StudioMode;
  perspectiveMode: PerspectiveMode;
  activePillar: AdePillar;
  activeView: AdeView;
  storyWorkspaceTab: StoryWorkspaceTab;
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

  // Actions
  setStudioMode: (mode: StudioMode) => void;
  setPerspectiveMode: (mode: PerspectiveMode) => void;
  togglePerspectiveMode: () => void;
  setActivePillar: (pillar: AdePillar) => void;
  setActiveView: (view: AdeView) => void;
  setStoryWorkspaceTab: (tab: StoryWorkspaceTab) => void;
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
}

export const useADEStore = create<ADEStoreState>()(
  devtools(
    persist(
      (set) => ({
        studioMode: 'development',
        perspectiveMode: 'architect',
        activePillar: 'mission_control',
        activeView: 'mission_control',
        storyWorkspaceTab: 'weaver',
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
