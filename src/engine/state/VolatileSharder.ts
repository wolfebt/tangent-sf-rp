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
  base_hp: number; // Retained for compatibility (= base_health)
  base_health?: number;
  base_vitality?: number;
  base_structure?: number;
  is_synthetic?: boolean;
  tech_level: number;
  armor_dr: number;
  stamina_dr?: number;
  size_modifier: number;
  speed_ft?: number;
  species?: string;
  archetype?: string;
  is_persona?: boolean;
  character_doc_id?: string;
  skills?: Record<string, number>;
  attributes?: Record<string, number>;
}

// Data pulled from WebRTC/LiveKit/Yjs (Volatile Stage Session Data)
export interface EphemeralState {
  x: number;
  y: number;
  z: number;
  current_hp: number; // Synchronized with current_health
  current_health?: number;
  current_vitality?: number;
  current_structure?: number;
  stability_points?: number;
  active_conditions: string[];
  is_selected: boolean;
  elevation_ft?: number;
  facing_degrees?: number;
  is_hidden?: boolean;
}

// The unified object passed to the WebGPU Stage Renderer
export type FusedToken = StaticEntity & EphemeralState;

// Damage payload options for applyDamage
export interface DamageApplicationPayload {
  amount: number;
  isLethal?: boolean;
  damageType?: string;
}

// --- STORE DEFINITION ---
export interface EngineState {
  // Sharded state containers
  staticData: Record<string, StaticEntity>;
  ephemeralData: Record<string, EphemeralState>;
  
  // Actions
  loadStaticEntity: (entity: StaticEntity) => void;
  loadStaticEntitiesBatch: (entities: StaticEntity[]) => void;
  updatePosition: (id: string, x: number, y: number, z?: number) => void;
  applyDamage: (id: string, payload: number | DamageApplicationPayload, isLethal?: boolean) => void;
  healHP: (id: string, amount: number) => void;
  healHealth: (id: string, amount: number) => void;
  healVitality: (id: string, amount: number) => void;
  healStructure: (id: string, amount: number) => void;
  setStabilityPoints: (id: string, points: number) => void;
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
        const isSynth = Boolean(
          entity.is_synthetic || 
          entity.species?.toLowerCase().includes('synthetic') ||
          entity.species?.toLowerCase().includes('automaton') ||
          entity.species?.toLowerCase().includes('mecha') ||
          entity.species?.toLowerCase().includes('construct')
        );

        const baseHealth = entity.base_health ?? (isSynth ? 0 : (entity.base_hp || 30));
        const baseVitality = entity.base_vitality ?? (isSynth ? 0 : (entity.base_hp || 30));
        const baseStructure = entity.base_structure ?? (isSynth ? (entity.base_hp || 45) : (baseHealth + baseVitality));
        const staminaDR = entity.stamina_dr ?? 0;

        const normalizedEntity: StaticEntity = {
          ...entity,
          is_synthetic: isSynth,
          base_health: baseHealth,
          base_vitality: baseVitality,
          base_structure: baseStructure,
          stamina_dr: staminaDR,
          base_hp: isSynth ? baseStructure : baseHealth
        };

        draft.staticData[entity.id] = normalizedEntity;

        // Initialize ephemeral state if it doesn't exist
        if (!draft.ephemeralData[entity.id]) {
          const staScore = entity.attributes?.sta ?? entity.attributes?.stamina ?? 0;
          draft.ephemeralData[entity.id] = {
            x: 0,
            y: 0,
            z: 0,
            current_hp: isSynth ? baseStructure : baseHealth,
            current_health: baseHealth,
            current_vitality: baseVitality,
            current_structure: isSynth ? baseStructure : undefined,
            stability_points: staScore + 5,
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
          const isSynth = Boolean(
            entity.is_synthetic || 
            entity.species?.toLowerCase().includes('synthetic') ||
            entity.species?.toLowerCase().includes('automaton') ||
            entity.species?.toLowerCase().includes('mecha') ||
            entity.species?.toLowerCase().includes('construct')
          );

          const baseHealth = entity.base_health ?? (isSynth ? 0 : (entity.base_hp || 30));
          const baseVitality = entity.base_vitality ?? (isSynth ? 0 : (entity.base_hp || 30));
          const baseStructure = entity.base_structure ?? (isSynth ? (entity.base_hp || 45) : (baseHealth + baseVitality));
          const staminaDR = entity.stamina_dr ?? 0;

          const normalizedEntity: StaticEntity = {
            ...entity,
            is_synthetic: isSynth,
            base_health: baseHealth,
            base_vitality: baseVitality,
            base_structure: baseStructure,
            stamina_dr: staminaDR,
            base_hp: isSynth ? baseStructure : baseHealth
          };

          draft.staticData[entity.id] = normalizedEntity;
          if (!draft.ephemeralData[entity.id]) {
            const staScore = entity.attributes?.sta ?? entity.attributes?.stamina ?? 0;
            draft.ephemeralData[entity.id] = {
              x: 0,
              y: 0,
              z: 0,
              current_hp: isSynth ? baseStructure : baseHealth,
              current_health: baseHealth,
              current_vitality: baseVitality,
              current_structure: isSynth ? baseStructure : undefined,
              stability_points: staScore + 5,
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

      applyDamage: (id, payload, isLethalOverride) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat) return;

        const amount = typeof payload === 'number' ? payload : (payload.amount || 0);
        const isLethal = isLethalOverride !== undefined
          ? isLethalOverride
          : (typeof payload === 'number' ? true : (payload.isLethal !== false));

        if (stat.is_synthetic) {
          // Synthetics and Constructs use Structure; immune to non-lethal damage
          if (!isLethal && typeof payload !== 'number') return;
          const currentStruct = eph.current_structure ?? eph.current_hp ?? 30;
          const nextStruct = Math.max(0, currentStruct - amount);
          eph.current_structure = nextStruct;
          eph.current_hp = nextStruct;
        } else {
          // Organics: Separate Vitality (non-lethal) and Health (lethal)
          const curVit = eph.current_vitality ?? stat.base_vitality ?? 30;
          const curHp = eph.current_health ?? eph.current_hp ?? stat.base_health ?? 30;

          if (!isLethal) {
            // Non-lethal damage applies to Vitality first
            if (amount <= curVit) {
              eph.current_vitality = curVit - amount;
            } else {
              // Excess spills over to Health as lethal damage
              const spillover = amount - curVit;
              eph.current_vitality = 0;
              const nextHp = Math.max(0, curHp - spillover);
              eph.current_health = nextHp;
              eph.current_hp = nextHp;
            }
          } else {
            // Lethal damage applies directly to Health
            const nextHp = Math.max(0, curHp - amount);
            eph.current_health = nextHp;
            eph.current_hp = nextHp;
          }

          // Check Mortality State (0 Health)
          if ((eph.current_health ?? 0) <= 0) {
            if (!eph.active_conditions.includes('status_incapacitated')) {
              eph.active_conditions.push('status_incapacitated');
            }
            if (!eph.active_conditions.includes('status_bleeding_out')) {
              eph.active_conditions.push('status_bleeding_out');
            }
          }
        }
      }),

      healVitality: (id, amount) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat || stat.is_synthetic) return;
        const maxVit = stat.base_vitality ?? 30;
        const current = eph.current_vitality ?? 30;
        eph.current_vitality = Math.min(maxVit, current + amount);
      }),

      healHealth: (id, amount) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat) return;
        if (stat.is_synthetic) {
          const maxStruct = stat.base_structure ?? stat.base_hp ?? 45;
          const current = eph.current_structure ?? eph.current_hp ?? 45;
          const next = Math.min(maxStruct, current + amount);
          eph.current_structure = next;
          eph.current_hp = next;
        } else {
          const maxHp = stat.base_health ?? stat.base_hp ?? 30;
          const current = eph.current_health ?? eph.current_hp ?? 30;
          const next = Math.min(maxHp, current + amount);
          eph.current_health = next;
          eph.current_hp = next;
          // Clear mortality conditions if brought above 0
          if (next > 0) {
            eph.active_conditions = eph.active_conditions.filter(
              c => c !== 'status_incapacitated' && c !== 'status_bleeding_out'
            );
          }
        }
      }),

      healStructure: (id, amount) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat) return;
        const maxStruct = stat.base_structure ?? stat.base_hp ?? 45;
        const current = eph.current_structure ?? eph.current_hp ?? 45;
        const next = Math.min(maxStruct, current + amount);
        eph.current_structure = next;
        eph.current_hp = next;
      }),

      healHP: (id, amount) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat) return;
        if (stat.is_synthetic) {
          const maxStruct = stat.base_structure ?? stat.base_hp ?? 45;
          const current = eph.current_structure ?? eph.current_hp ?? 45;
          const next = Math.min(maxStruct, current + amount);
          eph.current_structure = next;
          eph.current_hp = next;
        } else {
          // Heals Health first, then any remainder heals Vitality
          const maxHp = stat.base_health ?? stat.base_hp ?? 30;
          const curHp = eph.current_health ?? eph.current_hp ?? 30;
          const hpNeeded = maxHp - curHp;
          if (hpNeeded > 0) {
            const hpHeal = Math.min(hpNeeded, amount);
            eph.current_health = curHp + hpHeal;
            eph.current_hp = curHp + hpHeal;
            const remAmount = amount - hpHeal;
            if (remAmount > 0) {
              const maxVit = stat.base_vitality ?? 30;
              const curVit = eph.current_vitality ?? 30;
              eph.current_vitality = Math.min(maxVit, curVit + remAmount);
            }
          } else {
            const maxVit = stat.base_vitality ?? 30;
            const curVit = eph.current_vitality ?? 30;
            eph.current_vitality = Math.min(maxVit, curVit + amount);
          }
        }
      }),

      setStabilityPoints: (id, points) => set((draft) => {
        if (draft.ephemeralData[id]) {
          draft.ephemeralData[id].stability_points = points;
          if (points <= 0) {
            if (!draft.ephemeralData[id].active_conditions.includes('status_dead')) {
              draft.ephemeralData[id].active_conditions.push('status_dead');
            }
          }
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
