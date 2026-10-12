// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — OMNICORTEX PERSISTENCE & MERGE ENGINE
// Authoritative local persistence and seed-merge mechanics
// for Omnicortex DBM, Asset Studio, and offline resilience.
// ═══════════════════════════════════════════════════════════

import { StorageService } from '../services/storageService.js';
import { DEFAULT_ARCHETYPES } from '../data/archetypesData.js';
import { DEFAULT_SPECIES } from '../data/speciesData.js';
import { DEFAULT_SPECIES_TYPES } from '../data/speciesTypesData.js';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData.js';
import { DEFAULT_ORIGINS } from '../data/originsData.js';
import { DEFAULT_FACTIONS } from '../data/factionsData.js';
import { DEFAULT_FEATURES } from '../data/featuresData.js';
import { ALL_CANONICAL_TRAITS } from '../data/speciesTraitsData.js';
import { ALL_CANONICAL_SKILLS } from '../data/skillsData.js';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../data/speciesDisadvantagesData.js';
import { DEFAULT_WEAPONRY } from '../data/weaponryData.js';
import { DEFAULT_ARMORING } from '../data/armoringData.js';
import { DEFAULT_AUGMENTATIONS } from '../data/augmentationsData.js';
import { DEFAULT_INVOCATIONS } from '../data/invocationsData.js';
import { DEFAULT_SPECIES_SIZES } from '../data/speciesSizeData.js';
import { DEFAULT_SPECIES_MOVEMENT } from '../data/speciesMovementData.js';
import {
  DEFAULT_AUGMENTATION_TYPES,
  DEFAULT_BODY_LOCATIONS,
  DEFAULT_AREA_PATTERNS,
  DEFAULT_EFFECT_TYPES,
  DEFAULT_RANGES,
  DEFAULT_TARGET_SPECIFICATIONS,
  DEFAULT_CRITICAL_EFFECTS,
  DEFAULT_CRITICAL_SUCCESS_EFFECTS,
  DEFAULT_CRITICAL_FAILURE_EFFECTS,
  DEFAULT_MATERIALS,
  DEFAULT_RESISTANCES,
  DEFAULT_MODES,
  DEFAULT_SPECIALS,
  DEFAULT_AVAILABILITY,
  DEFAULT_GEAR_CATEGORIES,
  DEFAULT_CLASSIFICATIONS,
  DEFAULT_CREATORS,
  DEFAULT_DESIGNS,
  DEFAULT_COMPONENTS,
  DEFAULT_PREREQUISITES,
  DEFAULT_MODIFIERS,
  DEFAULT_SOCIETAL_ENTRIES
} from '../data/supportingCatalogsData.js';

let cachedCompendiumSeed = null;
let compendiumSeedPromise = null;

export const loadCompendiumCatalog = async () => {
  if (cachedCompendiumSeed) return cachedCompendiumSeed;
  if (!compendiumSeedPromise) {
    compendiumSeedPromise = import('../data/compendiumSeed.json', { with: { type: 'json' } })
      .then(mod => {
        cachedCompendiumSeed = mod.default || mod;
        return cachedCompendiumSeed;
      })
      .catch(err => {
        console.warn('[omnicortexPersistence] Failed to load compendium seed dynamically:', err);
        compendiumSeedPromise = null;
        return [];
      });
  }
  return compendiumSeedPromise;
};

export const TOMBSTONES_KEY = 'omnicortex_deleted_entries';
export const CUSTOM_ENTRIES_KEY = 'omnicortex_custom_entries_v1';

export const getOmnicortexCustomEntries = () => {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(CUSTOM_ENTRIES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch (e) {
    return {};
  }
};

export const saveOmnicortexCustomEntry = (catKey, item) => {
  if (!catKey || !item) return;
  const docId = (item.id || '').toString().trim();
  if (!docId) return;

  try {
    const all = getOmnicortexCustomEntries();
    const catMap = all[catKey] || {};
    catMap[docId.toLowerCase()] = item;
    all[catKey] = catMap;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CUSTOM_ENTRIES_KEY, JSON.stringify(all));
    }
    if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
      StorageService.setItem(CUSTOM_ENTRIES_KEY, all);
    }
  } catch (e) {
    console.warn('[omnicortexPersistence] Failed to persist custom entry to local storage:', e);
  }
};

export const removeOmnicortexCustomEntry = (catKey, docId) => {
  if (!docId) return;
  const idStr = docId.toString().trim().toLowerCase();
  try {
    const all = getOmnicortexCustomEntries();
    if (catKey && all[catKey]) {
      delete all[catKey][idStr];
    } else {
      Object.keys(all).forEach(k => {
        if (all[k] && all[k][idStr]) {
          delete all[k][idStr];
        }
      });
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CUSTOM_ENTRIES_KEY, JSON.stringify(all));
    }
    if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
      StorageService.setItem(CUSTOM_ENTRIES_KEY, all);
    }
  } catch (e) {}
};

export const getOmnicortexTombstones = () => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(TOMBSTONES_KEY);
    if (!raw) return [];
    let list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    // Auto-heal: Purge any accidental tombstone for Coalition of Independent Worlds or canonical names
    const purged = list.filter(item => {
      const lower = (item || '').toString().toLowerCase().trim();
      return lower !== 'coalition of independent worlds' && lower !== 'faction-coalition';
    });
    if (purged.length !== list.length) {
      localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(purged));
      if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
        StorageService.setItem(TOMBSTONES_KEY, purged);
      }
    }
    return purged;
  } catch (e) {
    return [];
  }
};

export const addOmnicortexTombstone = (docId) => {
  try {
    if (!docId) return;
    const current = getOmnicortexTombstones();
    const set = new Set(current);
    set.add(docId.toString().toLowerCase().trim());
    const updated = Array.from(set);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(updated));
    }
    if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
      StorageService.setItem(TOMBSTONES_KEY, updated);
    }
  } catch (e) {}
};

export const removeOmnicortexTombstones = (identifiers) => {
  try {
    const toRemove = Array.isArray(identifiers) ? identifiers : [identifiers];
    const toRemoveSet = new Set(toRemove.map(x => (x || '').toString().toLowerCase().trim()).filter(Boolean));
    if (toRemoveSet.size === 0) return;
    const current = getOmnicortexTombstones();
    const updated = current.filter(item => !toRemoveSet.has((item || '').toString().toLowerCase().trim()));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(updated));
    }
    if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
      StorageService.setItem(TOMBSTONES_KEY, updated);
    }
  } catch (e) {}
};

export const clearOmnicortexTombstones = (catKey = null) => {
  try {
    if (!catKey) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(TOMBSTONES_KEY);
      }
      if (typeof StorageService !== 'undefined' && StorageService?.removeItem) {
        StorageService.removeItem(TOMBSTONES_KEY);
      }
    } else {
      const seeds = getFallbackSeedForCategory(catKey);
      if (seeds && seeds.length > 0) {
        const identifiers = seeds.flatMap(s => [s.id, s.name, s.title]).filter(Boolean);
        removeOmnicortexTombstones(identifiers);
      }
    }
  } catch (e) {}
};

export const isOmnicortexDeleted = (item, tombstones = null) => {
  if (!item) return false;
  const list = tombstones || getOmnicortexTombstones();
  if (!list || list.length === 0) return false;
  const set = new Set(list);
  const id = (item.id || '').toString().toLowerCase().trim();
  return Boolean(id && set.has(id));
};

export const filterInitialData = (dataList, catKey = null) => {
  const tombstones = getOmnicortexTombstones();
  if (!catKey) {
    return (dataList || []).filter(item => !isOmnicortexDeleted(item, tombstones));
  }
  return mergeSeedsWithDocs(dataList, catKey, tombstones);
};

export const mergeSeedsWithDocs = (docsList, catKey, tombstones = null) => {
  const currentTombstones = tombstones || getOmnicortexTombstones();
  let items = (docsList || []).filter(i => !isOmnicortexDeleted(i, currentTombstones));

  // Retrieve locally saved custom entries / modifications for this category
  const customEntries = catKey ? (getOmnicortexCustomEntries()[catKey] || {}) : {};
  const customEntryMap = new Map();
  Object.values(customEntries).forEach(entry => {
    if (entry && !isOmnicortexDeleted(entry, currentTombstones)) {
      if (entry.id) {
        customEntryMap.set(entry.id.toString().toLowerCase().trim(), entry);
      }
      if (entry.name) {
        customEntryMap.set(entry.name.toString().toLowerCase().trim(), entry);
      }
    }
  });

  // If a document was modified locally, prioritize the local custom entry
  items = items.map(doc => {
    if (!doc || typeof doc !== 'object') return doc;
    const docId = (doc.id || '').toString().toLowerCase().trim();
    if (docId && customEntryMap.has(docId)) {
      const customDoc = customEntryMap.get(docId);
      const docTime = doc.updatedAt ? new Date(doc.updatedAt).getTime() : 0;
      const customTime = customDoc.updatedAt ? new Date(customDoc.updatedAt).getTime() : 0;
      return (customTime >= docTime) ? customDoc : doc;
    }
    const docName = (doc.name || '').toString().toLowerCase().trim();
    if (docName && customEntryMap.has(docName)) {
      const customDoc = customEntryMap.get(docName);
      const docTime = doc.updatedAt ? new Date(doc.updatedAt).getTime() : 0;
      const customTime = customDoc.updatedAt ? new Date(customDoc.updatedAt).getTime() : 0;
      return (customTime >= docTime) ? customDoc : doc;
    }
    return doc;
  });

  const fallbackSeeds = getFallbackSeedForCategory(catKey);
  if (fallbackSeeds && fallbackSeeds.length > 0) {
    const seedMap = new Map();
    fallbackSeeds.forEach(seed => {
      if (seed.id) seedMap.set(seed.id.toString().toLowerCase().trim(), seed);
      if (seed.name) seedMap.set(seed.name.toString().toLowerCase().trim(), seed);
      if (seed.title) seedMap.set(seed.title.toString().toLowerCase().trim(), seed);
    });

    // Hydrate existing docs with newly added schema fields and recommendations if missing or empty in Firestore/local storage
    items = items.map(doc => {
      if (!doc || typeof doc !== 'object') return doc;
      const docId = (doc.id || '').toString().toLowerCase().trim();
      // If doc is a local custom entry, preserve user's exact customized content without seed backfills
      if (docId && customEntryMap.has(docId)) return doc;

      const docName = (doc.name || '').toString().toLowerCase().trim();
      const docTitle = (doc.title || '').toString().toLowerCase().trim();
      const matchingSeed = seedMap.get(docId) || (docName ? seedMap.get(docName) : null) || (docTitle ? seedMap.get(docTitle) : null);
      if (!matchingSeed) return doc;

      let enriched = { ...doc };

      // Array fields to backfill if empty or missing in the doc
      const arrayFields = [
        'recommended_factions',
        'recommended_origins',
        'recommended_occupations',
        'recommended_species',
        'recommended_skills',
        'recommended_features',
        'recommended_tl',
        'recommended_ml'
      ];

      for (const field of arrayFields) {
        const docVal = doc[field];
        const seedVal = matchingSeed[field];
        const hasDocVal = Array.isArray(docVal) ? docVal.length > 0 : Boolean(docVal);
        const hasSeedVal = Array.isArray(seedVal) ? seedVal.length > 0 : Boolean(seedVal);
        if (!hasDocVal && hasSeedVal) {
          enriched[field] = seedVal;
        }
      }

      // String fields to backfill if empty or missing in the doc
      const stringFields = [
        'keywords',
        'negative_keywords',
        'discipline',
        'sphere',
        'subdiscipline',
        'stigma',
        'homeworld'
      ];

      for (const field of stringFields) {
        const docVal = (doc[field] !== undefined && doc[field] !== null) ? String(doc[field]).trim() : '';
        const seedVal = (matchingSeed[field] !== undefined && matchingSeed[field] !== null) ? String(matchingSeed[field]).trim() : '';
        if (!docVal && seedVal) {
          enriched[field] = matchingSeed[field];
        }
      }

      if (catKey === 'compendium' && matchingSeed) {
        enriched.description = matchingSeed.description;
        enriched.name = matchingSeed.name || enriched.name;
        enriched.parent = matchingSeed.parent || enriched.parent;
        enriched.order = matchingSeed.order ?? enriched.order;
        enriched.mechanic = matchingSeed.mechanic || enriched.mechanic;
        enriched.guide = matchingSeed.guide || enriched.guide;
        enriched.note = matchingSeed.note || enriched.note;
        enriched.tags = matchingSeed.tags || enriched.tags;
        enriched.updatedAt = matchingSeed.updatedAt || enriched.updatedAt;
      }

      return enriched;
    });

    if (catKey === 'compendium' && fallbackSeeds.length > 0) {
      const allowedSeedIds = new Set(fallbackSeeds.map(s => (s.id || '').toString().toLowerCase().trim()));
      items = items.filter(item => {
        const id = (item.id || '').toString().toLowerCase().trim();
        return allowedSeedIds.has(id);
      });
    }

    const existingIds = new Set(items.map(i => (i.id || '').toString().toLowerCase().trim()));
    const missingSeeds = fallbackSeeds.filter(seed => {
      if (isOmnicortexDeleted(seed, currentTombstones)) return false;
      const sId = (seed.id || '').toString().toLowerCase().trim();
      if (sId && existingIds.has(sId)) return false;
      return true;
    }).map(seed => {
      const sId = (seed.id || '').toString().toLowerCase().trim();
      if (sId && customEntryMap.has(sId)) {
        return customEntryMap.get(sId);
      }
      const sName = (seed.name || '').toString().toLowerCase().trim();
      if (sName && customEntryMap.has(sName)) {
        return customEntryMap.get(sName);
      }
      return seed;
    });

    if (missingSeeds.length > 0) {
      items = [...items, ...missingSeeds];
    }
  }

  // Any custom entries that were not in docsList or seeds (e.g. brand new custom species created by user)
  const allCurrentIds = new Set(items.map(i => (i.id || '').toString().toLowerCase().trim()));
  Object.values(customEntries).forEach(entry => {
    if (!entry || isOmnicortexDeleted(entry, currentTombstones)) return;
    const entryId = (entry.id || '').toString().toLowerCase().trim();
    if (entryId && !allCurrentIds.has(entryId)) {
      items.push(entry);
      allCurrentIds.add(entryId);
    }
  });

  return items;
};

export const getFallbackSeedForCategory = (catK) => {
  if (catK === 'compendium' || catK === 'rules_codex') return cachedCompendiumSeed || [];
  if (catK === 'archetypes') return DEFAULT_ARCHETYPES;
  if (catK === 'species') return DEFAULT_SPECIES;
  if (catK === 'species_type') return DEFAULT_SPECIES_TYPES;
  if (catK === 'species_size') return DEFAULT_SPECIES_SIZES;
  if (catK === 'species_movement') return DEFAULT_SPECIES_MOVEMENT;
  if (catK === 'occupations') return DEFAULT_OCCUPATIONS;
  if (catK === 'origins') return DEFAULT_ORIGINS;
  if (catK === 'factions') return DEFAULT_FACTIONS;
  if (catK === 'features') return DEFAULT_FEATURES;
  if (catK === 'traits' || catK === 'trait') return ALL_CANONICAL_TRAITS;
  if (catK === 'skills') return ALL_CANONICAL_SKILLS;
  if (catK === 'disadvantages') return DEFAULT_SPECIES_DISADVANTAGES;
  if (catK === 'weaponry') return DEFAULT_WEAPONRY;
  if (catK === 'armoring') return DEFAULT_ARMORING;
  if (catK === 'augmentations') return DEFAULT_AUGMENTATIONS;
  if (catK === 'invocations') return DEFAULT_INVOCATIONS;

  // Supporting & Developer Reference Categories
  if (catK === 'augmentation_type') return DEFAULT_AUGMENTATION_TYPES;
  if (catK === 'body_location') return DEFAULT_BODY_LOCATIONS;
  if (catK === 'area') return DEFAULT_AREA_PATTERNS;
  if (catK === 'effect') return DEFAULT_EFFECT_TYPES;
  if (catK === 'range') return DEFAULT_RANGES;
  if (catK === 'target') return DEFAULT_TARGET_SPECIFICATIONS;
  if (catK === 'critical_effect') return DEFAULT_CRITICAL_EFFECTS;
  if (catK === 'critical_success_effect') return DEFAULT_CRITICAL_SUCCESS_EFFECTS;
  if (catK === 'critical_failure_effect') return DEFAULT_CRITICAL_FAILURE_EFFECTS;
  if (catK === 'material') return DEFAULT_MATERIALS;
  if (catK === 'resistance') return DEFAULT_RESISTANCES;
  if (catK === 'mode') return DEFAULT_MODES;
  if (catK === 'special') return DEFAULT_SPECIALS;
  if (catK === 'availability') return DEFAULT_AVAILABILITY;
  if (catK === 'gear_category') return DEFAULT_GEAR_CATEGORIES;
  if (catK === 'classification') return DEFAULT_CLASSIFICATIONS;
  if (catK === 'creator') return DEFAULT_CREATORS;
  if (catK === 'design') return DEFAULT_DESIGNS;
  if (catK === 'component') return DEFAULT_COMPONENTS;
  if (catK === 'prerequisite' || catK === 'prerequisites') return DEFAULT_PREREQUISITES;
  if (catK === 'modifier' || catK === 'modifiers') return DEFAULT_MODIFIERS;
  if (catK && typeof catK === 'string' && catK.startsWith('society_')) {
    return DEFAULT_SOCIETAL_ENTRIES.filter(e => e.category === catK || e.sphere_key === catK);
  }
  if (catK === 'societies') return DEFAULT_SOCIETAL_ENTRIES;

  return [];
};
