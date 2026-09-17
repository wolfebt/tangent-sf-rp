/**
 * @file uiLayoutStore.ts
 * @description Reactive layout state store for the Tripartite VTT interface.
 * Manages responsive panel collapse states, drag-resizable widths,
 * active catalog taxonomies, cockpit tabs, and multi-window popout tracking.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { GridType, GridScaleTier } from '../../../engine/index';

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
  | 'bastion' 
  | 'inspector'
  | 'aime' 
  | 'notes';

export type UserVttRole = 'player' | 'gm' | 'operative' | 'architect' | 'spectator';

export interface VttLayoutPreferences {
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
  leftWidth: number;
  rightWidth: number;
  activeCategory: CatalogCategory;
  activeCockpitTab: CockpitTab;
  userRole: UserVttRole;
}

const STORAGE_KEY = 'tangent_vtt_layout_prefs_v2';

const DEFAULT_PREFS: VttLayoutPreferences = {
  isLeftCollapsed: false,
  isRightCollapsed: false,
  leftWidth: 320,
  rightWidth: 380,
  activeCategory: 'armory',
  activeCockpitTab: 'inspector',
  userRole: 'architect',
};

function loadStoredPrefs(): VttLayoutPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch (e) {
    console.warn('[uiLayoutStore] Failed to load stored layout preferences:', e);
    return DEFAULT_PREFS;
  }
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

  // Tactical Stage Viewport Controls
  isGridVisible: boolean;
  gridSnap: boolean;
  gridType: GridType;
  scaleTier: GridScaleTier;
  isDynamicLightingEnabled: boolean;
  isMultiplayerSimActive: boolean;

  // Tactical Token Selection
  selectedTokenId: string | null;
  targetTokenId: string | null;

  // Architect Cartography State
  activeArchitectTool: 'select' | 'wall' | 'terrain' | 'fill' | 'light' | 'pencil' | 'text' | 'eraser' | 'object' | 'hazard' | 'token' | 'ruler';
  selectedWallType: string;
  doorLockDc: number;
  selectedTerrain: string;
  terrainBrushWidth: number;
  selectedObjectType: string;
  selectedLightColor: string;
  selectedLightRadius: number;
  selectedLightAnimation: string;
  pencilColor: string;
  pencilWidth: number;
  rulerAvailableAp: number;
  rulerSelectedPace: 'walk' | 'jog' | 'run' | 'sprint';
  activeLeftTab: 'cockpit' | 'catalog' | 'scenario';
  isLeftWideMode: boolean;

  // Actions
  toggleLeftWideMode: () => void;
  setLeftWideMode: (wide: boolean) => void;
  setRulerSelectedPace: (pace: 'walk' | 'jog' | 'run' | 'sprint') => void;
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

  // Tactical Actions
  toggleGridVisible: () => void;
  setGridVisible: (visible: boolean) => void;
  toggleGridSnap: () => void;
  setGridSnap: (snap: boolean) => void;
  setGridType: (type: GridType) => void;
  setScaleTier: (tier: GridScaleTier) => void;
  toggleDynamicLighting: () => void;
  setDynamicLightingEnabled: (enabled: boolean) => void;
  toggleMultiplayerSim: () => void;
  setMultiplayerSimActive: (active: boolean) => void;
  setSelectedTokenId: (id: string | null) => void;
  setTargetTokenId: (id: string | null) => void;

  // Cartography Tool Actions
  setActiveArchitectTool: (tool: 'select' | 'wall' | 'terrain' | 'fill' | 'light' | 'pencil' | 'text' | 'eraser' | 'object' | 'hazard' | 'token' | 'ruler') => void;
  setSelectedWallType: (type: string) => void;
  setDoorLockDc: (dc: number) => void;
  setSelectedTerrain: (terrain: string) => void;
  setTerrainBrushWidth: (width: number) => void;
  setSelectedObjectType: (type: string) => void;
  setSelectedLightColor: (color: string) => void;
  setSelectedLightRadius: (radius: number) => void;
  setSelectedLightAnimation: (anim: string) => void;
  setPencilColor: (color: string) => void;
  setPencilWidth: (width: number) => void;
  setRulerAvailableAp: (ap: number) => void;
  setActiveLeftTab: (tab: 'cockpit' | 'catalog' | 'scenario') => void;

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

      // Tactical Stage Viewport Defaults
      isGridVisible: true,
      gridSnap: true,
      gridType: GridType.HexFlatTop,
      scaleTier: GridScaleTier.Encounter,
      isDynamicLightingEnabled: true,
      isMultiplayerSimActive: false,

      // Tactical Viewport Actions
      toggleGridVisible: () => set((draft) => {
        draft.isGridVisible = !draft.isGridVisible;
      }),
      setGridVisible: (visible: boolean) => set((draft) => {
        draft.isGridVisible = visible;
      }),
      toggleGridSnap: () => set((draft) => {
        draft.gridSnap = !draft.gridSnap;
      }),
      setGridSnap: (snap: boolean) => set((draft) => {
        draft.gridSnap = snap;
      }),
      setGridType: (type: GridType) => set((draft) => {
        draft.gridType = type;
      }),
      setScaleTier: (tier: GridScaleTier) => set((draft) => {
        draft.scaleTier = tier;
      }),
      // Tactical Token Selection Defaults
      selectedTokenId: 'op-jax',
      targetTokenId: 'mech-vanguard',

      // Architect Cartography Defaults
      activeArchitectTool: 'select',
      selectedWallType: 'solid',
      doorLockDc: 14,
      selectedTerrain: 'grassland',
      terrainBrushWidth: 30,
      selectedObjectType: 'crate_heavy',
      selectedLightColor: '#f59e0b',
      selectedLightRadius: 180,
      selectedLightAnimation: 'flicker',
      pencilColor: '#22d3ee',
      pencilWidth: 4,
      rulerAvailableAp: 4,
      rulerSelectedPace: 'walk',
      activeLeftTab: 'cockpit',
      isLeftWideMode: false,

      // Tactical Actions
      toggleLeftWideMode: () => set((draft) => {
        draft.isLeftWideMode = !draft.isLeftWideMode;
      }),
      setLeftWideMode: (wide: boolean) => set((draft) => {
        draft.isLeftWideMode = wide;
      }),
      setRulerSelectedPace: (pace) => set((draft) => {
        draft.rulerSelectedPace = pace;
      }),
      setSelectedTokenId: (id) => set((draft) => {
        draft.selectedTokenId = id;
      }),
      setTargetTokenId: (id) => set((draft) => {
        draft.targetTokenId = id;
      }),

      // Cartography Tool Actions
      setActiveArchitectTool: (tool) => set((draft) => {
        draft.activeArchitectTool = tool;
      }),
      setSelectedWallType: (type) => set((draft) => {
        draft.selectedWallType = type;
      }),
      setDoorLockDc: (dc) => set((draft) => {
        draft.doorLockDc = dc;
      }),
      setSelectedTerrain: (terrain) => set((draft) => {
        draft.selectedTerrain = terrain;
      }),
      setTerrainBrushWidth: (width) => set((draft) => {
        draft.terrainBrushWidth = width;
      }),
      setSelectedObjectType: (type) => set((draft) => {
        draft.selectedObjectType = type;
      }),
      setSelectedLightColor: (color) => set((draft) => {
        draft.selectedLightColor = color;
      }),
      setSelectedLightRadius: (radius) => set((draft) => {
        draft.selectedLightRadius = radius;
      }),
      setSelectedLightAnimation: (anim) => set((draft) => {
        draft.selectedLightAnimation = anim;
      }),
      setPencilColor: (color) => set((draft) => {
        draft.pencilColor = color;
      }),
      setPencilWidth: (width) => set((draft) => {
        draft.pencilWidth = width;
      }),
      setRulerAvailableAp: (ap) => set((draft) => {
        draft.rulerAvailableAp = ap;
      }),
      setActiveLeftTab: (tab) => set((draft) => {
        draft.activeLeftTab = tab;
      }),
      toggleDynamicLighting: () => set((draft) => {
        draft.isDynamicLightingEnabled = !draft.isDynamicLightingEnabled;
      }),
      setDynamicLightingEnabled: (enabled: boolean) => set((draft) => {
        draft.isDynamicLightingEnabled = enabled;
      }),
      toggleMultiplayerSim: () => set((draft) => {
        draft.isMultiplayerSimActive = !draft.isMultiplayerSimActive;
      }),
      setMultiplayerSimActive: (active: boolean) => set((draft) => {
        draft.isMultiplayerSimActive = active;
      }),

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
        const clamped = Math.max(240, Math.min(1100, Math.round(width)));
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
