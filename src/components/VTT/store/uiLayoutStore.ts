/**
 * @file uiLayoutStore.ts
 * @description Reactive layout state store for the Tripartite VTT interface.
 * Manages responsive panel collapse states, drag-resizable widths,
 * active catalog taxonomies, cockpit tabs, and multi-window popout tracking.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type CatalogCategory = 
  | 'story' 
  | 'scenes' 
  | 'personae' 
  | 'encounters' 
  | 'factions' 
  | 'lore' 
  | 'armory'
  | 'assets';

export type CockpitTab = 
  | 'vitals' 
  | 'actions' 
  | 'mecha' 
  | 'inventory' 
  | 'notes' 
  | 'inspector' 
  | 'multiselect'
  | 'aime';

export type UserVttRole = 'player' | 'gm';

export interface VttLayoutPreferences {
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
  leftWidth: number;
  rightWidth: number;
  activeCategory: CatalogCategory;
  activeCockpitTab: CockpitTab;
  userRole: UserVttRole;
}

const STORAGE_KEY = 'tangent_vtt_layout_prefs';

const DEFAULT_PREFS: VttLayoutPreferences = {
  isLeftCollapsed: false,
  isRightCollapsed: false,
  leftWidth: 300,
  rightWidth: 360,
  activeCategory: 'scenes',
  activeCockpitTab: 'vitals',
  userRole: 'gm',
};

function loadStoredPrefs(): VttLayoutPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('[uiLayoutStore] Failed to load layout preferences:', e);
  }
  return DEFAULT_PREFS;
}

function savePrefs(prefs: Partial<VttLayoutPreferences>) {
  try {
    const current = loadStoredPrefs();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch (e) {
    console.warn('[uiLayoutStore] Failed to save layout preferences:', e);
  }
}

export interface UILayoutState extends VttLayoutPreferences {
  isZenMode: boolean;
  leftPopoutOpen: boolean;
  rightPopoutOpen: boolean;

  // Actions
  toggleLeftCollapse: () => void;
  setLeftCollapsed: (collapsed: boolean) => void;
  toggleRightCollapse: () => void;
  setRightCollapsed: (collapsed: boolean) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
  toggleZenMode: () => void;
  setZenMode: (zen: boolean) => void;
  setLeftWidth: (width: number) => void;
  setRightWidth: (width: number) => void;
  setActiveCategory: (category: CatalogCategory) => void;
  setActiveCockpitTab: (tab: CockpitTab) => void;
  setUserRole: (role: UserVttRole) => void;
  setLeftPopoutOpen: (open: boolean) => void;
  setRightPopoutOpen: (open: boolean) => void;
  resetLayout: () => void;
}

const initialPrefs = loadStoredPrefs();

export const useUILayoutStore = create<UILayoutState>()(
  subscribeWithSelector(
    immer((set) => ({
      ...initialPrefs,
      isZenMode: false,
      leftPopoutOpen: false,
      rightPopoutOpen: false,

      toggleLeftCollapse: () => set((draft) => {
        draft.isLeftCollapsed = !draft.isLeftCollapsed;
        savePrefs({ isLeftCollapsed: draft.isLeftCollapsed });
      }),

      setLeftCollapsed: (collapsed) => set((draft) => {
        draft.isLeftCollapsed = collapsed;
        savePrefs({ isLeftCollapsed: collapsed });
      }),

      toggleRightCollapse: () => set((draft) => {
        draft.isRightCollapsed = !draft.isRightCollapsed;
        savePrefs({ isRightCollapsed: draft.isRightCollapsed });
      }),

      setRightCollapsed: (collapsed) => set((draft) => {
        draft.isRightCollapsed = collapsed;
        savePrefs({ isRightCollapsed: collapsed });
      }),

      get isRightPanelOpen() {
        return !this.isRightCollapsed;
      },

      setIsRightPanelOpen: (open: boolean) => set((draft) => {
        draft.isRightCollapsed = !open;
        savePrefs({ isRightCollapsed: !open });
      }),

      toggleZenMode: () => set((draft) => {
        const next = !draft.isZenMode;
        draft.isZenMode = next;
        if (next) {
          draft.isLeftCollapsed = true;
          draft.isRightCollapsed = true;
        } else {
          draft.isLeftCollapsed = false;
          draft.isRightCollapsed = false;
        }
      }),

      setZenMode: (zen) => set((draft) => {
        draft.isZenMode = zen;
        if (zen) {
          draft.isLeftCollapsed = true;
          draft.isRightCollapsed = true;
        }
      }),

      setLeftWidth: (width) => set((draft) => {
        const clamped = Math.max(240, Math.min(500, Math.round(width)));
        draft.leftWidth = clamped;
        savePrefs({ leftWidth: clamped });
      }),

      setRightWidth: (width) => set((draft) => {
        const clamped = Math.max(280, Math.min(560, Math.round(width)));
        draft.rightWidth = clamped;
        savePrefs({ rightWidth: clamped });
      }),

      setActiveCategory: (category) => set((draft) => {
        draft.activeCategory = category;
        savePrefs({ activeCategory: category });
      }),

      setActiveCockpitTab: (tab) => set((draft) => {
        draft.activeCockpitTab = tab;
        savePrefs({ activeCockpitTab: tab });
      }),

      setUserRole: (role) => set((draft) => {
        draft.userRole = role;
        savePrefs({ userRole: role });
      }),

      setLeftPopoutOpen: (open) => set((draft) => {
        draft.leftPopoutOpen = open;
      }),

      setRightPopoutOpen: (open) => set((draft) => {
        draft.rightPopoutOpen = open;
      }),

      resetLayout: () => set((draft) => {
        Object.assign(draft, DEFAULT_PREFS, {
          isZenMode: false,
          leftPopoutOpen: false,
          rightPopoutOpen: false
        });
        savePrefs(DEFAULT_PREFS);
      })
    }))
  )
);
