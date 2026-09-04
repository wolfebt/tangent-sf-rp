/**
 * @file VolatileSharder.ts
 * @description Stage 1.2: Unifies static relational data with dynamic ephemeral state on the Stage.
 * Utilizes Zustand with Immer for immutable drafts, designed to bypass React reconciliation.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// --- DOMAIN MODELS ---

// Data pulled from Omnicortex DBM / OPFS (Static Rules & Base Stats)
export interface StaticEntity {
  id: string;
  name: string;
  base_hp: number;
  tech_level: number;
  armor_dr: number;
  size_modifier: number;
  speed_ft?: number;
  species?: string;
  archetype?: string;
  is_persona?: boolean;
  character_doc_id?: string;
}

// Data pulled from WebRTC/LiveKit/Yjs (Volatile Stage Session Data)
export interface EphemeralState {
  x: number;
  y: number;
  z: number;
  current_hp: number;
  active_conditions: string[];
  is_selected: boolean;
  elevation_ft?: number;
  facing_degrees?: number;
  is_hidden?: boolean;
}

// The unified object passed to the WebGPU Stage Renderer
export type FusedToken = StaticEntity & EphemeralState;

// --- STORE DEFINITION ---
export interface EngineState {
  // Sharded state containers
  staticData: Record<string, StaticEntity>;
  ephemeralData: Record<string, EphemeralState>;
  
  // Actions
  loadStaticEntity: (entity: StaticEntity) => void;
  loadStaticEntitiesBatch: (entities: StaticEntity[]) => void;
  updatePosition: (id: string, x: number, y: number, z?: number) => void;
  applyDamage: (id: string, netDamage: number) => void;
  healHP: (id: string, amount: number) => void;
  toggleCondition: (id: string, condition: string) => void;
  toggleHidden: (id: string) => void;
  setElevation: (id: string, elevation: number) => void;
  setSelection: (id: string, isSelected: boolean) => void;
  clearSelection: () => void;
  removeEntity: (id: string) => void;
}

export const useEngineStore = create<EngineState>()(
  subscribeWithSelector(
    immer((set) => ({
      staticData: {},
      ephemeralData: {},

      // --- ACTIONS ---
      loadStaticEntity: (entity) => set((draft) => {
        draft.staticData[entity.id] = entity;
        // Initialize ephemeral state if it doesn't exist
        if (!draft.ephemeralData[entity.id]) {
          draft.ephemeralData[entity.id] = {
            x: 0,
            y: 0,
            z: 0,
            current_hp: entity.base_hp,
            active_conditions: [],
            is_selected: false,
            elevation_ft: 0,
            facing_degrees: 0,
            is_hidden: false
          };
        }
      }),

      loadStaticEntitiesBatch: (entities) => set((draft) => {
        for (const entity of entities) {
          draft.staticData[entity.id] = entity;
          if (!draft.ephemeralData[entity.id]) {
            draft.ephemeralData[entity.id] = {
              x: 0,
              y: 0,
              z: 0,
              current_hp: entity.base_hp,
              active_conditions: [],
              is_selected: false,
              elevation_ft: 0,
              facing_degrees: 0,
              is_hidden: false
            };
          }
        }
      }),

      updatePosition: (id, x, y, z = 0) => set((draft) => {
        if (draft.ephemeralData[id]) {
          draft.ephemeralData[id].x = x;
          draft.ephemeralData[id].y = y;
          draft.ephemeralData[id].z = z;
        }
      }),

      applyDamage: (id, netDamage) => set((draft) => {
        if (draft.ephemeralData[id]) {
          const current = draft.ephemeralData[id].current_hp;
          draft.ephemeralData[id].current_hp = Math.max(0, current - netDamage);
        }
      }),

      healHP: (id, amount) => set((draft) => {
        if (draft.ephemeralData[id] && draft.staticData[id]) {
          const maxHP = draft.staticData[id].base_hp;
          const current = draft.ephemeralData[id].current_hp;
          draft.ephemeralData[id].current_hp = Math.min(maxHP, current + amount);
        }
      }),

      toggleCondition: (id, condition) => set((draft) => {
        const token = draft.ephemeralData[id];
        if (token) {
          const idx = token.active_conditions.indexOf(condition);
          if (idx === -1) token.active_conditions.push(condition);
          else token.active_conditions.splice(idx, 1);
        }
      }),

      toggleHidden: (id) => set((draft) => {
        const token = draft.ephemeralData[id];
        if (token) {
          token.is_hidden = !token.is_hidden;
        }
      }),

      setElevation: (id, elevation) => set((draft) => {
        const token = draft.ephemeralData[id];
        if (token) {
          token.elevation_ft = elevation;
        }
      }),

      setSelection: (id, isSelected) => set((draft) => {
        if (draft.ephemeralData[id]) {
          draft.ephemeralData[id].is_selected = isSelected;
        }
      }),

      clearSelection: () => set((draft) => {
        for (const key of Object.keys(draft.ephemeralData)) {
          draft.ephemeralData[key].is_selected = false;
        }
      }),

      removeEntity: (id) => set((draft) => {
        delete draft.staticData[id];
        delete draft.ephemeralData[id];
      })
    }))
  )
);

// --- TRANSIENT UPDATE HOOKS (Bypassing React DOM Re-renders) ---
/**
 * In performance-critical rendering modules (such as the PixiJS Stage bridge),
 * DO NOT use const state = useEngineStore() inside render loops.
 * Instead, attach transient subscriptions to mutate WebGPU sprites directly:
 *
 * useEngineStore.subscribe(
 *   (state) => state.ephemeralData['token-123']?.x,
 *   (newX) => { if (newX !== undefined) pixiSprite.x = newX; }
 * );
 */

// --- MEMOIZED SELECTORS ---
let lastStaticData: Record<string, StaticEntity> | null = null;
let lastEphemeralData: Record<string, EphemeralState> | null = null;
let cachedAllFusedTokens: FusedToken[] = [];
const tokenCache = new Map<string, { staticRef: StaticEntity; ephRef: EphemeralState; fused: FusedToken }>();

export const selectFusedToken = (state: EngineState, id: string): FusedToken | null => {
  const staticData = state.staticData[id];
  const ephemeralData = state.ephemeralData[id];
  
  if (!staticData || !ephemeralData) return null;
  
  const cached = tokenCache.get(id);
  if (cached && cached.staticRef === staticData && cached.ephRef === ephemeralData) {
    return cached.fused;
  }

  const fused: FusedToken = {
    ...staticData,
    ...ephemeralData
  };
  tokenCache.set(id, { staticRef: staticData, ephRef: ephemeralData, fused });
  return fused;
};

export const selectAllFusedTokens = (state: EngineState): FusedToken[] => {
  if (state.staticData === lastStaticData && state.ephemeralData === lastEphemeralData) {
    return cachedAllFusedTokens;
  }

  lastStaticData = state.staticData;
  lastEphemeralData = state.ephemeralData;

  const result: FusedToken[] = [];
  for (const id of Object.keys(state.staticData)) {
    const fused = selectFusedToken(state, id);
    if (fused) result.push(fused);
  }
  cachedAllFusedTokens = result;
  return result;
};
