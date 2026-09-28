/**
 * @file adeStore.ts
 * @description Centralized Zustand state store for the Adventure Development Environment (ADE).
 * Manages studio mode (Development vs Running Live), viewport split configuration,
 * guide rail sections, workspace tabs, and active modal overlays.
 */

import { create } from 'zustand';

export type StudioMode = 'development' | 'live_session';
export type ViewportSplit = 'side_by_side' | 'canvas_only' | 'story_only';
export type GuideSection = 'scenarios' | 'sectors' | 'waypoints' | 'bestiary' | 'props' | 'weather' | 'memory' | 'aime';
export type StoryWorkspaceTab = 'weaver' | 'tactical' | 'interactive' | 'graph' | 'gallery';
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
  | 'floatingAime';

export interface ADEStoreState {
  studioMode: StudioMode;
  viewportSplit: ViewportSplit;
  activeGuideSection: GuideSection;
  isDrawerOpen: boolean;
  storyWorkspaceTab: StoryWorkspaceTab;
  cronicleInitialMode: CronicleDeckMode;
  modals: Record<AdeModalKey, boolean>;

  // Actions
  setStudioMode: (mode: StudioMode) => void;
  setViewportSplit: (split: ViewportSplit) => void;
  setActiveGuideSection: (section: GuideSection) => void;
  setIsDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleDrawer: () => void;
  setStoryWorkspaceTab: (tab: StoryWorkspaceTab) => void;
  setCronicleInitialMode: (mode: CronicleDeckMode) => void;
  setModal: (key: AdeModalKey, open: boolean) => void;
  toggleModal: (key: AdeModalKey) => void;
  closeAllModals: () => void;
}

export const useADEStore = create<ADEStoreState>((set) => ({
  studioMode: 'development',
  viewportSplit: 'side_by_side',
  activeGuideSection: 'scenarios',
  isDrawerOpen: true,
  storyWorkspaceTab: 'weaver',
  cronicleInitialMode: 'living_memory',
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
    floatingAime: false
  },

  setStudioMode: (mode) => set({ studioMode: mode }),
  setViewportSplit: (split) => set({ viewportSplit: split }),
  setActiveGuideSection: (section) => set({ activeGuideSection: section }),
  setIsDrawerOpen: (val) => set((state) => ({
    isDrawerOpen: typeof val === 'function' ? val(state.isDrawerOpen) : val
  })),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setStoryWorkspaceTab: (tab) => set({ storyWorkspaceTab: tab }),
  setCronicleInitialMode: (mode) => set({ cronicleInitialMode: mode }),

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
}));
