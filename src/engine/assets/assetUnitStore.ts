/**
 * @file assetUnitStore.ts
 * @description Centralized Zustand catalog store for all VTT AssetUnits across
 * Asset Studio, MapMaker, Chunk Forge Studio, and The Stage VTT.
 * Guarantees deduplicated seed-override merging, preset edit persistence,
 * legacy customAssets migration, and explicit QuotaExceededError reporting.
 */

import { create } from 'zustand';
import coreSeedUnitsJson from '../../data/seed_units/science_fantasy_core.json' with { type: 'json' };
import {
  type AssetUnit,
  type AssetCategory,
  createDefaultAssetUnit,
  validateAssetUnit
} from '../../schemas/assetUnitSchema.ts';
import { AssetIngestionPipeline } from './AssetIngestionPipeline.ts';
import { TangentPackager } from './TangentPackager.ts';

export const ASSET_UNITS_STORAGE_KEY = 'tangent_custom_asset_units';
export const ASSET_UNITS_UPDATED_EVENT = 'tangent-vtt-assets-updated';

const CORE_SEED_UNITS: AssetUnit[] = (coreSeedUnitsJson as AssetUnit[]).map((u) => ({
  ...u,
  provenance: {
    ...(u.provenance || {}),
    source: 'preset',
    dateAdded: u.provenance?.dateAdded || '2026-10-07T00:00:00.000Z'
  }
}));

const CORE_SEED_MAP = new Map<string, AssetUnit>(
  CORE_SEED_UNITS.map((u) => [u.unit_id, u])
);

const CORE_SEED_IDS = new Set<string>(CORE_SEED_UNITS.map((u) => u.unit_id));

function deepCloneUnit<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Merges canonical seed units with stored custom units / seed overrides,
 * deduplicating strictly by `unit_id` (overrides replace seed records in-place).
 */
export function mergeAssetCatalog(
  seedUnits: AssetUnit[],
  storedCustomOrOverrides: AssetUnit[]
): AssetUnit[] {
  const overrideMap = new Map<string, AssetUnit>();
  const customTail: AssetUnit[] = [];
  const seedIdSet = new Set(seedUnits.map((s) => s.unit_id));

  for (const raw of storedCustomOrOverrides || []) {
    if (!raw || typeof raw !== 'object' || !raw.unit_id) continue;
    if (seedIdSet.has(raw.unit_id)) {
      overrideMap.set(raw.unit_id, raw);
    } else {
      const existingIdx = customTail.findIndex((c) => c.unit_id === raw.unit_id);
      if (existingIdx >= 0) {
        customTail[existingIdx] = raw;
      } else {
        customTail.push(raw);
      }
    }
  }

  const mergedSeeds = seedUnits.map((seed) => {
    const override = overrideMap.get(seed.unit_id);
    if (!override) return deepCloneUnit(seed);
    return {
      ...deepCloneUnit(override),
      provenance: {
        ...(seed.provenance || {}),
        ...(override.provenance || {}),
        source: override.provenance?.source || 'preset'
      }
    };
  });

  return [...mergedSeeds, ...customTail.map((c) => deepCloneUnit(c))];
}

/**
 * Extracts only custom units and modified preset overrides for localStorage persistence.
 */
export function serializePersistedUnits(
  allUnits: AssetUnit[],
  seedIds: Set<string> = CORE_SEED_IDS,
  modifiedSeedIds: Set<string> = new Set()
): AssetUnit[] {
  const out: AssetUnit[] = [];
  const seen = new Set<string>();
  for (const unit of allUnits || []) {
    if (!unit || !unit.unit_id || seen.has(unit.unit_id)) continue;
    const isSeed = seedIds.has(unit.unit_id);
    if (!isSeed || modifiedSeedIds.has(unit.unit_id) || unit.provenance?.source !== 'preset') {
      seen.add(unit.unit_id);
      out.push(unit);
    }
  }
  return out;
}

/**
 * Converts a legacy MapMaker custom asset (`universeState.customAssets.terrains|objects`)
 * into a canonical AssetUnit so legacy projects migrate seamlessly.
 */
export function convertLegacyCustomAssetToUnit(
  legacyAsset: any,
  kind: 'terrain' | 'object'
): AssetUnit {
  const rawId = String(legacyAsset?.id || `legacy_${kind}_${Date.now()}`).trim();
  const unitId = rawId.startsWith('ter_') || rawId.startsWith('prop_')
    ? rawId
    : `${kind === 'terrain' ? 'ter' : 'prop'}_${rawId.replace(/[^a-zA-Z0-9_-]+/g, '_')}`;
  const label = String(legacyAsset?.label || legacyAsset?.name || 'Migrated Custom Asset').trim();
  const textureUrl = String(legacyAsset?.textureUrl || legacyAsset?.imageUrl || '').trim();
  const category: AssetCategory = kind === 'terrain' ? 'terrain_brush' : 'doodad';

  return createDefaultAssetUnit({
    unit_id: unitId,
    name: label,
    category,
    tree_path: kind === 'terrain'
      ? ['Custom Uploads', 'Legacy Terrains']
      : ['Custom Uploads', legacyAsset?.category || 'Legacy Objects'],
    tags: ['legacy_migrated', kind, ...(legacyAsset?.category ? [String(legacyAsset.category).toLowerCase()] : [])],
    dimensions: [1, 1],
    provenance: {
      source: 'custom_upload',
      author: 'Legacy MapMaker',
      dateAdded: new Date().toISOString()
    },
    visuals: {
      thumbnail: textureUrl,
      baseTexture: textureUrl,
      variants: [],
      auto_tile: kind === 'terrain' ? 'marching_squares_4bit' : 'none'
    },
    vtt_properties: {
      blocks_movement: kind !== 'terrain' && Boolean(legacyAsset?.blocksMovement),
      blocks_vision: kind !== 'terrain' && Boolean(legacyAsset?.blocksVision),
      z_index_layer: kind === 'terrain' ? 'background_map' : 'interactive_objects',
      ...(kind === 'terrain'
        ? {
            terrain: {
              material: 'metal_deck',
              movementCost: 1,
              slipperyFriction: 1,
              footstepSfxCategory: 'footstep_metal'
            }
          }
        : {
            doodad: {
              cover: 'half_cover',
              isDestructible: false,
              isContainer: false
            }
          })
    }
  });
}

function readStoredUnitsFromLocalStorage(): { units: AssetUnit[]; modifiedSeedIds: string[] } {
  try {
    if (typeof localStorage === 'undefined') return { units: [], modifiedSeedIds: [] };
    const raw = localStorage.getItem(ASSET_UNITS_STORAGE_KEY);
    if (!raw) return { units: [], modifiedSeedIds: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { units: [], modifiedSeedIds: [] };
    const valid: AssetUnit[] = [];
    const modifiedSeeds: string[] = [];
    for (const item of parsed) {
      const check = validateAssetUnit(item);
      const unit = check.success && check.data ? check.data : (item?.unit_id && item?.name ? item : null);
      if (unit) {
        valid.push(unit);
        if (CORE_SEED_IDS.has(unit.unit_id)) {
          modifiedSeeds.push(unit.unit_id);
        }
      }
    }
    return { units: valid, modifiedSeedIds: modifiedSeeds };
  } catch {
    return { units: [], modifiedSeedIds: [] };
  }
}

function writeUnitsToLocalStorage(
  allUnits: AssetUnit[],
  modifiedSeedIds: Set<string>
): { saved: boolean; quotaExceeded?: boolean; error?: string } {
  if (typeof localStorage === 'undefined') {
    return { saved: true };
  }
  const payload = serializePersistedUnits(allUnits, CORE_SEED_IDS, modifiedSeedIds);
  try {
    localStorage.setItem(ASSET_UNITS_STORAGE_KEY, JSON.stringify(payload));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ASSET_UNITS_UPDATED_EVENT));
    }
    return { saved: true };
  } catch (err: any) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.code === 22 ||
      /quota/i.test(String(err?.message || ''));
    return {
      saved: false,
      quotaExceeded: isQuota,
      error: err?.message || 'Failed to persist custom asset units.'
    };
  }
}

export interface PersistOutcome {
  saved: boolean;
  quotaExceeded?: boolean;
  error?: string;
}

export interface AssetUnitStoreState {
  assets: AssetUnit[];
  modifiedSeedIds: string[];
  lastStorageWarning: string | null;
  upsertAssetUnit: (unit: AssetUnit) => PersistOutcome;
  ingestAssetUnits: (units: AssetUnit[]) => PersistOutcome;
  duplicateAssetUnit: (unitId: string) => AssetUnit | null;
  deleteAssetUnit: (unitId: string) => boolean;
  resetPresetAssetUnit: (unitId: string) => AssetUnit | null;
  importTangentPack: (jsonText: string) => { success: boolean; count: number; error?: string; quotaExceeded?: boolean };
  migrateLegacyCustomAssets: (customAssets?: { terrains?: any[]; objects?: any[] }) => number;
  reloadFromStorage: () => void;
  clearStorageWarning: () => void;
}

const initialStored = readStoredUnitsFromLocalStorage();

export const useAssetUnitStore = create<AssetUnitStoreState>((set, get) => ({
  assets: mergeAssetCatalog(CORE_SEED_UNITS, initialStored.units),
  modifiedSeedIds: initialStored.modifiedSeedIds,
  lastStorageWarning: null,

  upsertAssetUnit: (unit) => {
    if (!unit || !unit.unit_id) return { saved: false, error: 'Missing unit_id.' };
    const state = get();
    const isSeed = CORE_SEED_IDS.has(unit.unit_id);
    const nextModified = new Set(state.modifiedSeedIds);
    if (isSeed) nextModified.add(unit.unit_id);

    const exists = state.assets.some((a) => a.unit_id === unit.unit_id);
    const nextAssets = exists
      ? state.assets.map((a) => (a.unit_id === unit.unit_id ? deepCloneUnit(unit) : a))
      : [...state.assets, deepCloneUnit(unit)];

    const persistRes = writeUnitsToLocalStorage(nextAssets, nextModified);
    set({
      assets: nextAssets,
      modifiedSeedIds: Array.from(nextModified),
      lastStorageWarning: persistRes.quotaExceeded
        ? 'Browser localStorage quota exceeded while saving asset units. Offload heavy textures or remove unused custom assets.'
        : null
    });
    return persistRes;
  },

  ingestAssetUnits: (units) => {
    const incoming = Array.isArray(units) ? units.filter((u) => u && u.unit_id) : [];
    if (incoming.length === 0) return { saved: true };

    const state = get();
    const nextModified = new Set(state.modifiedSeedIds);
    const mapById = new Map<string, AssetUnit>(state.assets.map((a) => [a.unit_id, a]));
    const orderedIds = state.assets.map((a) => a.unit_id);

    for (const unit of incoming) {
      if (CORE_SEED_IDS.has(unit.unit_id)) {
        nextModified.add(unit.unit_id);
      }
      if (!mapById.has(unit.unit_id)) {
        orderedIds.push(unit.unit_id);
      }
      mapById.set(unit.unit_id, deepCloneUnit(unit));
    }

    const nextAssets = orderedIds.map((id) => mapById.get(id)!).filter(Boolean);
    const persistRes = writeUnitsToLocalStorage(nextAssets, nextModified);
    set({
      assets: nextAssets,
      modifiedSeedIds: Array.from(nextModified),
      lastStorageWarning: persistRes.quotaExceeded
        ? 'Browser localStorage quota exceeded while saving ingested assets.'
        : null
    });
    return persistRes;
  },

  duplicateAssetUnit: (unitId) => {
    const state = get();
    const source = state.assets.find((a) => a.unit_id === unitId);
    if (!source) return null;

    const copyName = `${source.name} (Copy)`;
    const cloned: AssetUnit = {
      ...deepCloneUnit(source),
      unit_id: AssetIngestionPipeline.generateUnitId(copyName, source.category),
      name: copyName,
      provenance: {
        ...deepCloneUnit(source.provenance || {}),
        source: 'custom_upload',
        dateAdded: new Date().toISOString()
      }
    };
    const nextAssets = [...state.assets, cloned];
    const nextModified = new Set(state.modifiedSeedIds);
    const persistRes = writeUnitsToLocalStorage(nextAssets, nextModified);
    set({
      assets: nextAssets,
      lastStorageWarning: persistRes.quotaExceeded
        ? 'Browser localStorage quota exceeded while duplicating asset.'
        : null
    });
    return cloned;
  },

  deleteAssetUnit: (unitId) => {
    if (CORE_SEED_IDS.has(unitId)) {
      return false;
    }
    const state = get();
    const exists = state.assets.some((a) => a.unit_id === unitId);
    if (!exists) return false;
    const nextAssets = state.assets.filter((a) => a.unit_id !== unitId);
    const nextModified = new Set(state.modifiedSeedIds);
    const persistRes = writeUnitsToLocalStorage(nextAssets, nextModified);
    set({
      assets: nextAssets,
      lastStorageWarning: persistRes.quotaExceeded
        ? 'Browser localStorage quota exceeded while updating catalog.'
        : null
    });
    return true;
  },

  resetPresetAssetUnit: (unitId) => {
    const canonical = CORE_SEED_MAP.get(unitId);
    if (!canonical) return null;
    const state = get();
    const restored = deepCloneUnit(canonical);
    const nextModified = new Set(state.modifiedSeedIds);
    nextModified.delete(unitId);
    const nextAssets = state.assets.map((a) => (a.unit_id === unitId ? restored : a));
    const persistRes = writeUnitsToLocalStorage(nextAssets, nextModified);
    set({
      assets: nextAssets,
      modifiedSeedIds: Array.from(nextModified),
      lastStorageWarning: persistRes.quotaExceeded
        ? 'Browser localStorage quota exceeded while resetting preset.'
        : null
    });
    return restored;
  },

  importTangentPack: (jsonText) => {
    const unpacked = TangentPackager.unpackPack(jsonText);
    if (!unpacked.success || !unpacked.validAssets) {
      return { success: false, count: 0, error: unpacked.error || 'Invalid pack file.' };
    }
    const validCustom = unpacked.validAssets.map((u) => ({
      ...u,
      provenance: {
        ...(u.provenance || {}),
        source: CORE_SEED_IDS.has(u.unit_id) ? 'preset' : (u.provenance?.source || 'custom_upload')
      }
    })) as AssetUnit[];
    const persistRes = get().ingestAssetUnits(validCustom);
    return {
      success: true,
      count: validCustom.length,
      quotaExceeded: persistRes.quotaExceeded
    };
  },

  migrateLegacyCustomAssets: (customAssets) => {
    if (!customAssets) return 0;
    const terrains = Array.isArray(customAssets.terrains) ? customAssets.terrains : [];
    const objects = Array.isArray(customAssets.objects) ? customAssets.objects : [];
    if (terrains.length === 0 && objects.length === 0) return 0;

    const state = get();
    const existingIds = new Set(state.assets.map((a) => a.unit_id));
    const toImport: AssetUnit[] = [];

    for (const t of terrains) {
      const converted = convertLegacyCustomAssetToUnit(t, 'terrain');
      if (!existingIds.has(converted.unit_id) && !existingIds.has(String(t?.id || ''))) {
        existingIds.add(converted.unit_id);
        toImport.push(converted);
      }
    }
    for (const o of objects) {
      const converted = convertLegacyCustomAssetToUnit(o, 'object');
      if (!existingIds.has(converted.unit_id) && !existingIds.has(String(o?.id || ''))) {
        existingIds.add(converted.unit_id);
        toImport.push(converted);
      }
    }

    if (toImport.length > 0) {
      get().ingestAssetUnits(toImport);
    }
    return toImport.length;
  },

  reloadFromStorage: () => {
    const stored = readStoredUnitsFromLocalStorage();
    set({
      assets: mergeAssetCatalog(CORE_SEED_UNITS, stored.units),
      modifiedSeedIds: stored.modifiedSeedIds
    });
  },

  clearStorageWarning: () => set({ lastStorageWarning: null })
}));

export function isCorePresetUnitId(unitId: string): boolean {
  return CORE_SEED_IDS.has(unitId);
}
