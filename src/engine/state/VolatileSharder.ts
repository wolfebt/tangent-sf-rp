/**
 * @file VolatileSharder.ts
 * @description Stage 1.2: Unifies static relational data with dynamic ephemeral state on the Stage.
 * Utilizes Zustand with Immer for immutable drafts, designed to bypass React reconciliation.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  MechaSocketManager, 
  type VehicleEntity, 
  type ChildedPassengerPosition 
} from '../rules/MechaSocketManager.ts';

// --- DOMAIN MODELS ---

// Data pulled from Omnicortex DBM / OPFS (Static Rules & Base Stats)
export interface StaticEntity {
  id: string;
  unit_id?: string;
  source_persona_id?: string;
  character_doc_id?: string;
  name: string;
  image_url?: string;
  icon?: string;
  designation?: string;
  threat_tier?: number;
  competency_role?: string;
  boss_type?: string;
  base_hp: number; // Retained for compatibility (= base_health)
  base_health?: number;
  base_vitality?: number;
  base_structure?: number;
  is_synthetic?: boolean;
  tech_level: number;
  armor_dr: number;
  stamina_dr?: number;
  defense_dc?: number;
  attack_bonus?: number;
  actions_per_round?: number;
  initiative_mod?: number;
  size_modifier: number;
  speed_ft?: number;
  species?: string;
  archetype?: string;
  occupation?: string;
  origin?: string;
  faction?: string;
  is_persona?: boolean;
  is_mcm_persona?: boolean;
  skills?: Record<string, number>;
  attributes?: Record<string, number>;
  saves?: Record<string, number>;
  attacks?: Array<Record<string, any>>;
  weapons?: Array<Record<string, any>>;
  armor?: Array<Record<string, any>>;
  gear?: Array<Record<string, any>>;
  features?: Array<Record<string, any>>;
  traits?: Array<Record<string, any>>;
  augmentations?: Array<Record<string, any>>;
  invocations?: Array<Record<string, any>>;
  tactical_behaviors?: string[];
}

// Turn-based duration effect tracking
export interface ActiveEffectRecord {
  id: string;
  name: string;
  icon?: string;
  remainingRounds: number;
  tickDamage?: number;
  isLethal?: boolean;
  modifierBonus?: number;
  sourceTokenId?: string;
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
  active_effects?: ActiveEffectRecord[];
  is_selected: boolean;
  elevation_ft?: number;
  facing_degrees?: number;
  is_hidden?: boolean;
  sensor_mode?: 'standard_optical' | 'night_vision' | 'thermal_infrared' | 'cyber_motion_radar' | 'meta_attunement';
  parent_vehicle_id?: string;
  vehicle_node_id?: string;
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
  vehicles: Record<string, VehicleEntity>;
  
  // Actions
  loadStaticEntity: (entity: StaticEntity) => void;
  loadStaticEntitiesBatch: (entities: StaticEntity[]) => void;
  updatePosition: (id: string, x: number, y: number, z?: number) => void;
  applyDamage: (id: string, payload: number | DamageApplicationPayload, isLethal?: boolean) => void;
  healHP: (id: string, amount: number) => void;
  healHealth: (id: string, amount: number) => void;
  healVitality: (id: string, amount: number) => void;
  healStructure: (id: string, amount: number) => void;
  setHealth: (id: string, value: number) => void;
  setVitality: (id: string, value: number) => void;
  setStructure: (id: string, value: number) => void;
  setStabilityPoints: (id: string, points: number) => void;
  stabilizeEntity: (id: string) => void;
  addCondition: (id: string, condition: string) => void;
  toggleCondition: (id: string, condition: string) => void;
  addActiveEffect: (id: string, effect: ActiveEffectRecord) => void;
  removeActiveEffect: (id: string, effectId: string) => void;
  tickActiveEffectsForToken: (id: string) => {
    ticked: ActiveEffectRecord[];
    expired: ActiveEffectRecord[];
    totalDamage: number;
  };
  toggleHidden: (id: string) => void;
  setElevation: (id: string, elevation: number) => void;
  setSensorMode: (id: string, mode: NonNullable<EphemeralState['sensor_mode']>) => void;
  setSelection: (id: string, isSelected: boolean) => void;
  clearSelection: () => void;
  removeEntity: (id: string) => void;
  clearAllEntities: () => void;

  // Vehicle & Passenger Logistics
  registerVehicle: (vehicle: VehicleEntity) => void;
  removeVehicle: (vehicleId: string) => void;
  mountPassenger: (vehicleId: string, nodeId: string, tokenId: string, cellSizePx?: number) => boolean;
  dismountPassenger: (vehicleId: string, tokenId: string) => boolean;
  translateVehicle: (vehicleId: string, deltaCols: number, deltaRows: number, cellSizePx?: number) => ChildedPassengerPosition[];
}

export const useEngineStore = create<EngineState>()(
  subscribeWithSelector(
    immer((set) => ({
      staticData: {},
      ephemeralData: {},
      vehicles: {},

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
        // Synthetics have Structure = Vitality + Health
        const baseStructure = entity.base_structure ?? (isSynth ? ((entity.base_health || 30) + (entity.base_vitality || 30)) : (baseHealth + baseVitality));
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
            ...(isSynth ? { current_structure: baseStructure } : {}),
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
          // Synthetics have Structure = Vitality + Health
          const baseStructure = entity.base_structure ?? (isSynth ? ((entity.base_health || 30) + (entity.base_vitality || 30)) : (baseHealth + baseVitality));
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
              ...(isSynth ? { current_structure: baseStructure } : {}),
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
        const eph = draft.ephemeralData[id];
        if (eph) {
          eph.x = x;
          eph.y = y;
          eph.z = z;
        }

        // If updated entity is a registered vehicle, translate childed passengers synchronously
        const veh = draft.vehicles[id];
        if (veh) {
          const cellSizePx = 50;
          const targetCol = Math.round((x - (veh.gridFootprint[0] * cellSizePx) / 2) / cellSizePx);
          const targetRow = Math.round((y - (veh.gridFootprint[1] * cellSizePx) / 2) / cellSizePx);
          const deltaCols = targetCol - veh.col;
          const deltaRows = targetRow - veh.row;
          if (deltaCols !== 0 || deltaRows !== 0) {
            const socketMgr = new MechaSocketManager();
            const positions = socketMgr.translateVehicle(veh, deltaCols, deltaRows, cellSizePx);
            for (const p of positions) {
              const pEph = draft.ephemeralData[p.tokenId];
              if (pEph) {
                pEph.x = p.x;
                pEph.y = p.y;
              }
            }
          }
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
          // Synthetics only have Structure and do NOT suffer non-lethal damage
          if (!isLethal) return;
          const currentStruct = eph.current_structure ?? eph.current_hp ?? 60;
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
          const maxStruct = stat.base_structure ?? stat.base_hp ?? 60;
          const current = eph.current_structure ?? eph.current_hp ?? 60;
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
        const maxStruct = stat.base_structure ?? stat.base_hp ?? 60;
        const current = eph.current_structure ?? eph.current_hp ?? 60;
        const next = Math.min(maxStruct, current + amount);
        eph.current_structure = next;
        eph.current_hp = next;
      }),

      stabilizeEntity: (id) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat) return;
        if (stat.is_synthetic) {
          const maxStruct = stat.base_structure ?? stat.base_hp ?? 60;
          const current = eph.current_structure ?? eph.current_hp ?? 0;
          const next = Math.min(maxStruct, Math.max(1, current));
          eph.current_structure = next;
          eph.current_hp = next;
        } else {
          const maxHp = stat.base_health ?? stat.base_hp ?? 30;
          const current = eph.current_health ?? eph.current_hp ?? 0;
          const next = Math.min(maxHp, Math.max(1, current));
          eph.current_health = next;
          eph.current_hp = next;
        }
        eph.active_conditions = (eph.active_conditions || []).filter(
          (c) =>
            c !== 'status_bleeding_out' &&
            c !== 'status_incapacitated' &&
            c !== 'status_unconscious'
        );
        if (!eph.active_conditions.includes('status_stabilized')) {
          eph.active_conditions.push('status_stabilized');
        }
      }),

      setHealth: (id, value) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat) return;
        if (stat.is_synthetic) {
          const maxStruct = stat.base_structure ?? stat.base_hp ?? 60;
          const next = Math.max(0, Math.min(maxStruct, Number(value) || 0));
          eph.current_structure = next;
          eph.current_hp = next;
          return;
        }
        const maxHp = stat.base_health ?? stat.base_hp ?? 30;
        const next = Math.max(0, Math.min(maxHp, Number(value) || 0));
        eph.current_health = next;
        eph.current_hp = next;
        if (next <= 0) {
          if (!eph.active_conditions.includes('status_incapacitated')) {
            eph.active_conditions.push('status_incapacitated');
          }
          if (!eph.active_conditions.includes('status_bleeding_out')) {
            eph.active_conditions.push('status_bleeding_out');
          }
        } else {
          eph.active_conditions = eph.active_conditions.filter(
            c => c !== 'status_incapacitated' && c !== 'status_bleeding_out'
          );
        }
      }),

      setVitality: (id, value) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat || stat.is_synthetic) return;
        const maxVit = stat.base_vitality ?? 30;
        eph.current_vitality = Math.max(0, Math.min(maxVit, Number(value) || 0));
      }),

      setStructure: (id, value) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat || !stat.is_synthetic) return;
        const maxStruct = stat.base_structure ?? stat.base_hp ?? 60;
        const next = Math.max(0, Math.min(maxStruct, Number(value) || 0));
        eph.current_structure = next;
        eph.current_hp = next;
      }),

      healHP: (id, amount) => set((draft) => {
        const eph = draft.ephemeralData[id];
        const stat = draft.staticData[id];
        if (!eph || !stat) return;
        if (stat.is_synthetic) {
          const maxStruct = stat.base_structure ?? stat.base_hp ?? 60;
          const current = eph.current_structure ?? eph.current_hp ?? 60;
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
          if ((eph.current_health ?? 0) > 0) {
            eph.active_conditions = eph.active_conditions.filter(
              c => c !== 'status_incapacitated' && c !== 'status_bleeding_out'
            );
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

      addCondition: (id, condition) => set((draft) => {
        const token = draft.ephemeralData[id];
        if (token && !token.active_conditions.includes(condition)) {
          token.active_conditions.push(condition);
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

      addActiveEffect: (id, effect) => set((draft) => {
        const token = draft.ephemeralData[id];
        if (!token || !effect) return;
        if (!Array.isArray(token.active_effects)) {
          token.active_effects = [];
        }
        const existingIdx = token.active_effects.findIndex((e) => e.id === effect.id);
        if (existingIdx >= 0) {
          token.active_effects[existingIdx] = { ...effect };
        } else {
          token.active_effects.push({ ...effect });
        }
      }),

      removeActiveEffect: (id, effectId) => set((draft) => {
        const token = draft.ephemeralData[id];
        if (!token || !Array.isArray(token.active_effects)) return;
        token.active_effects = token.active_effects.filter((e) => e.id !== effectId);
      }),

      tickActiveEffectsForToken: (id) => {
        const ticked: ActiveEffectRecord[] = [];
        const expired: ActiveEffectRecord[] = [];
        let totalDamage = 0;
        set((draft) => {
          const eph = draft.ephemeralData[id];
          const stat = draft.staticData[id];
          if (!eph || !stat || !Array.isArray(eph.active_effects) || eph.active_effects.length === 0) {
            return;
          }
          const remaining: ActiveEffectRecord[] = [];
          for (const effect of eph.active_effects) {
            const dmg = Math.max(0, Number(effect.tickDamage || 0));
            if (dmg > 0) {
              totalDamage += dmg;
              if (stat.is_synthetic) {
                const curStruct = eph.current_structure ?? eph.current_hp ?? 60;
                const nextStruct = Math.max(0, curStruct - dmg);
                eph.current_structure = nextStruct;
                eph.current_hp = nextStruct;
              } else if (effect.isLethal) {
                const curHp = eph.current_health ?? eph.current_hp ?? 30;
                const nextHp = Math.max(0, curHp - dmg);
                eph.current_health = nextHp;
                eph.current_hp = nextHp;
              } else {
                const curVit = eph.current_vitality ?? 30;
                if (curVit >= dmg) {
                  eph.current_vitality = curVit - dmg;
                } else {
                  const spill = dmg - curVit;
                  eph.current_vitality = 0;
                  const curHp = eph.current_health ?? eph.current_hp ?? 30;
                  const nextHp = Math.max(0, curHp - spill);
                  eph.current_health = nextHp;
                  eph.current_hp = nextHp;
                }
              }
              if (!stat.is_synthetic && (eph.current_health ?? 0) <= 0) {
                if (!eph.active_conditions.includes('status_incapacitated')) {
                  eph.active_conditions.push('status_incapacitated');
                }
                if (!eph.active_conditions.includes('status_bleeding_out')) {
                  eph.active_conditions.push('status_bleeding_out');
                }
              }
            }
            const nextRounds = Number(effect.remainingRounds || 0) - 1;
            const updated: ActiveEffectRecord = { ...effect, remainingRounds: nextRounds };
            ticked.push(updated);
            if (nextRounds <= 0) {
              expired.push(updated);
            } else {
              remaining.push(updated);
            }
          }
          eph.active_effects = remaining;
        });
        return { ticked, expired, totalDamage };
      },

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

      setSensorMode: (id, mode) => set((draft) => {
        const token = draft.ephemeralData[id];
        if (token) {
          token.sensor_mode = mode;
        }
      }),

      setSelection: (id, isSelected) => set((draft) => {
        if (draft.ephemeralData[id]) {
          draft.ephemeralData[id].is_selected = isSelected;
        }
      }),

      clearSelection: () => set((draft) => {
        for (const key of Object.keys(draft.ephemeralData)) {
          const eph = draft.ephemeralData[key];
          if (eph) {
            eph.is_selected = false;
          }
        }
      }),

      removeEntity: (id) => set((draft) => {
        delete draft.staticData[id];
        delete draft.ephemeralData[id];
        tokenCache.delete(id);

        // Clean up vehicle if id was a vehicle
        const veh = draft.vehicles[id];
        if (veh) {
          for (const node of veh.passengerNodes) {
            const passengerEph = node.seatedTokenId ? draft.ephemeralData[node.seatedTokenId] : undefined;
            if (passengerEph) {
              delete passengerEph.parent_vehicle_id;
              delete passengerEph.vehicle_node_id;
            }
          }
          delete draft.vehicles[id];
        }

        // If id was a seated passenger in any vehicle, unseat it
        for (const vId of Object.keys(draft.vehicles)) {
          const v = draft.vehicles[vId];
          if (!v) continue;
          for (const node of v.passengerNodes) {
            if (node.seatedTokenId === id) {
              delete node.seatedTokenId;
            }
          }
        }
      }),

      clearAllEntities: () => set((draft) => {
        draft.staticData = {};
        draft.ephemeralData = {};
        draft.vehicles = {};
        tokenCache.clear();
      }),

      // --- VEHICLE & PASSENGER ACTIONS ---
      registerVehicle: (vehicle) => set((draft) => {
        draft.vehicles[vehicle.id] = vehicle;
        for (const node of vehicle.passengerNodes) {
          const passengerEph = node.seatedTokenId ? draft.ephemeralData[node.seatedTokenId] : undefined;
          if (passengerEph) {
            passengerEph.parent_vehicle_id = vehicle.id;
            passengerEph.vehicle_node_id = node.id;
          }
        }
      }),

      removeVehicle: (vehicleId) => set((draft) => {
        const veh = draft.vehicles[vehicleId];
        if (veh) {
          for (const node of veh.passengerNodes) {
            const passengerEph = node.seatedTokenId ? draft.ephemeralData[node.seatedTokenId] : undefined;
            if (passengerEph) {
              delete passengerEph.parent_vehicle_id;
              delete passengerEph.vehicle_node_id;
            }
          }
          delete draft.vehicles[vehicleId];
        }
      }),

      mountPassenger: (vehicleId, nodeId, tokenId, cellSizePx = 50) => {
        let success = false;
        set((draft) => {
          const veh = draft.vehicles[vehicleId];
          if (!veh) return;
          const socketMgr = new MechaSocketManager();
          success = socketMgr.mountPassenger(veh, nodeId, tokenId);
          const tokenEph = draft.ephemeralData[tokenId];
          if (success && tokenEph) {
            tokenEph.parent_vehicle_id = vehicleId;
            tokenEph.vehicle_node_id = nodeId;
            const positions = socketMgr.calculatePassengerPositions(veh, cellSizePx);
            const pPos = positions.find(p => p.tokenId === tokenId);
            if (pPos) {
              tokenEph.x = pPos.x;
              tokenEph.y = pPos.y;
            }
          }
        });
        return success;
      },

      dismountPassenger: (vehicleId, tokenId) => {
        let success = false;
        set((draft) => {
          const veh = draft.vehicles[vehicleId];
          if (!veh) return;
          const socketMgr = new MechaSocketManager();
          success = socketMgr.dismountPassenger(veh, tokenId);
          const tokenEph = draft.ephemeralData[tokenId];
          if (success && tokenEph) {
            delete tokenEph.parent_vehicle_id;
            delete tokenEph.vehicle_node_id;
          }
        });
        return success;
      },

      translateVehicle: (vehicleId, deltaCols, deltaRows, cellSizePx = 50) => {
        let positions: ChildedPassengerPosition[] = [];
        set((draft) => {
          const veh = draft.vehicles[vehicleId];
          if (!veh) return;
          const socketMgr = new MechaSocketManager();
          positions = socketMgr.translateVehicle(veh, deltaCols, deltaRows, cellSizePx);
          for (const p of positions) {
            const pEph = draft.ephemeralData[p.tokenId];
            if (pEph) {
              pEph.x = p.x;
              pEph.y = p.y;
            }
          }
          const vehEph = draft.ephemeralData[vehicleId];
          if (vehEph) {
            vehEph.x = veh.col * cellSizePx + (veh.gridFootprint[0] * cellSizePx) / 2;
            vehEph.y = veh.row * cellSizePx + (veh.gridFootprint[1] * cellSizePx) / 2;
          }
        });
        return positions;
      }
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

export const selectVehicle = (state: EngineState, id: string): VehicleEntity | null => {
  return state.vehicles[id] || null;
};

export const selectAllVehicles = (state: EngineState): VehicleEntity[] => {
  return Object.values(state.vehicles);
};
