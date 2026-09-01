/**
 * @file VolatileSharder.ts
 * @description Stage 1.2: Unifies static relational data with dynamic ephemeral state.
 * Utilizes Zustand with Immer for immutable drafts, designed to bypass React reconciliation.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// --- DOMAIN MODELS ---

// Data pulled from OPFS (Static Rules & Base Stats)
export interface StaticEntity {
  id: string;
  name: string;
  base_hp: number;
  tech_level: number;
  armor_dr: number;
  size_modifier: number;
}

// Data pulled from WebRTC/LiveKit/Yjs (Volatile Session Data)
export interface EphemeralState {
  x: number;
  y: number;
  z: number;
  current_hp: number;
  active_conditions: string[];
  is_selected: boolean;
}

// The unified object passed to the WebGPU Renderer
export type FusedToken = StaticEntity & EphemeralState;

// --- STORE DEFINITION ---
interface EngineState {
  // Sharded state containers
  staticData: Record<string, StaticEntity>;
  ephemeralData: Record<string, EphemeralState>;
  
  // Actions
  loadStaticEntity: (entity: StaticEntity) => void;
  updatePosition: (id: string, x: number, y: number, z: number) => void;
  applyDamage: (id: string, netDamage: number) => void;
  toggleCondition: (id: string, condition: string) => void;
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
            x: 0, y: 0, z: 0,
            current_hp: entity.base_hp,
            active_conditions: [],
            is_selected: false
          };
        }
      }),

      updatePosition: (id, x, y, z) => set((draft) => {
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

      toggleCondition: (id, condition) => set((draft) => {
        const token = draft.ephemeralData[id];
        if (token) {
          const idx = token.active_conditions.indexOf(condition);
          if (idx === -1) token.active_conditions.push(condition);
          else token.active_conditions.splice(idx, 1);
        }
      })
    }))
  )
);

// --- TRANSIENT UPDATE HOOKS (Bypassing React) ---
/**
 * In React components (like the PixiJS canvas bridge), we DO NOT use 
 * const state = useEngineStore(). This causes global re-renders.
 * Instead, we use transient subscriptions to push mutations directly to the GPU:
 * 
 * useEngineStore.subscribe(
 *   (state) => state.ephemeralData['token-123'].x,
 *   (newX) => pixiSprite.x = newX 
 * );
 */

// --- MEMOIZED SELECTORS ---
export const selectFusedToken = (state: EngineState, id: string): FusedToken | null => {
  const staticData = state.staticData[id];
  const ephemeralData = state.ephemeralData[id];
  
  if (!staticData || !ephemeralData) return null;
  
  return {
    ...staticData,
    ...ephemeralData
  };
};