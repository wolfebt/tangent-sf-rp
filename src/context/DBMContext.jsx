import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { categoryConfig } from '../components/DBM/categoryConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { commitChunkedBatches } from '../utils/firestoreUtils';
import { validateDbmEntry } from '../utils/dbmValidators';
import compendiumSeedData from '../data/compendiumSeed.json';
import { DEFAULT_ARCHETYPES } from '../data/archetypesData';
import { DEFAULT_SPECIES } from '../data/speciesData';
import { DEFAULT_SPECIES_TYPES } from '../data/speciesTypesData';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData';
import { DEFAULT_ORIGINS } from '../data/originsData';
import { DEFAULT_FACTIONS } from '../data/factionsData';
import { DEFAULT_FEATURES } from '../data/featuresData';
import { ALL_CANONICAL_TRAITS } from '../data/speciesTraitsData';
import { ALL_CANONICAL_SKILLS } from '../data/skillsData';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../data/speciesDisadvantagesData';
import { DEFAULT_WEAPONRY } from '../data/weaponryData';
import { DEFAULT_ARMORING } from '../data/armoringData';
import { DEFAULT_AUGMENTATIONS } from '../data/augmentationsData';
import { DEFAULT_INVOCATIONS } from '../data/invocationsData';
import { DEFAULT_SPECIES_SIZES } from '../data/speciesSizeData';
import { DEFAULT_SPECIES_MOVEMENT } from '../data/speciesMovementData';
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
} from '../data/supportingCatalogsData';

const DBMContext = createContext(null);

export const useDBM = () => useContext(DBMContext);

const TOMBSTONES_KEY = 'omnicortex_deleted_entries';

export const getOmnicortexTombstones = () => {
  try {
    const raw = localStorage.getItem(TOMBSTONES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addOmnicortexTombstone = (docId, name) => {
  try {
    const current = getOmnicortexTombstones();
    const set = new Set(current);
    if (docId) set.add(docId.toString().toLowerCase().trim());
    if (name) set.add(name.toString().toLowerCase().trim());
    const updated = Array.from(set);
    localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(updated));
    StorageService.setItem(TOMBSTONES_KEY, updated);
  } catch (e) {}
};

export const isOmnicortexDeleted = (item, tombstones = null) => {
  if (!item) return false;
  const list = tombstones || getOmnicortexTombstones();
  if (!list || list.length === 0) return false;
  const set = new Set(list);
  const id = (item.id || '').toString().toLowerCase().trim();
  const name = (item.name || item.title || '').toString().toLowerCase().trim();
  return (id && set.has(id)) || (name && set.has(name));
};

const filterInitialData = (dataList) => {
  const tombstones = getOmnicortexTombstones();
  return (dataList || []).filter(item => !isOmnicortexDeleted(item, tombstones));
};

const getFallbackSeedForCategory = (catK) => {
  if (catK === 'compendium' || catK === 'rules_codex') return compendiumSeedData;
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
  if (catK.startsWith('society_')) {
    return DEFAULT_SOCIETAL_ENTRIES.filter(e => e.category === catK || e.sphere_key === catK);
  }
  if (catK === 'societies') return DEFAULT_SOCIETAL_ENTRIES;

  return [];
};

export const DBMProvider = ({ children }) => {
  const [dbData, setDbData] = useState(() => ({
    compendium: filterInitialData(compendiumSeedData),
    archetypes: filterInitialData(DEFAULT_ARCHETYPES),
    species: filterInitialData(DEFAULT_SPECIES),
    species_type: filterInitialData(DEFAULT_SPECIES_TYPES),
    species_size: filterInitialData(DEFAULT_SPECIES_SIZES),
    species_movement: filterInitialData(DEFAULT_SPECIES_MOVEMENT),
    occupations: filterInitialData(DEFAULT_OCCUPATIONS),
    origins: filterInitialData(DEFAULT_ORIGINS),
    factions: filterInitialData(DEFAULT_FACTIONS),
    features: filterInitialData(DEFAULT_FEATURES),
    trait: filterInitialData(ALL_CANONICAL_TRAITS),
    traits: filterInitialData(ALL_CANONICAL_TRAITS),
    skills: filterInitialData(ALL_CANONICAL_SKILLS),
    disadvantages: filterInitialData(DEFAULT_SPECIES_DISADVANTAGES),
    weaponry: filterInitialData(DEFAULT_WEAPONRY),
    armoring: filterInitialData(DEFAULT_ARMORING),
    augmentations: filterInitialData(DEFAULT_AUGMENTATIONS),
    invocations: filterInitialData(DEFAULT_INVOCATIONS),
    augmentation_type: filterInitialData(DEFAULT_AUGMENTATION_TYPES),
    body_location: filterInitialData(DEFAULT_BODY_LOCATIONS),
    area: filterInitialData(DEFAULT_AREA_PATTERNS),
    effect: filterInitialData(DEFAULT_EFFECT_TYPES),
    range: filterInitialData(DEFAULT_RANGES),
    target: filterInitialData(DEFAULT_TARGET_SPECIFICATIONS),
    critical_effect: filterInitialData(DEFAULT_CRITICAL_EFFECTS),
    critical_success_effect: filterInitialData(DEFAULT_CRITICAL_SUCCESS_EFFECTS),
    critical_failure_effect: filterInitialData(DEFAULT_CRITICAL_FAILURE_EFFECTS),
    material: filterInitialData(DEFAULT_MATERIALS),
    resistance: filterInitialData(DEFAULT_RESISTANCES),
    mode: filterInitialData(DEFAULT_MODES),
    special: filterInitialData(DEFAULT_SPECIALS),
    availability: filterInitialData(DEFAULT_AVAILABILITY),
    gear_category: filterInitialData(DEFAULT_GEAR_CATEGORIES),
    classification: filterInitialData(DEFAULT_CLASSIFICATIONS),
    creator: filterInitialData(DEFAULT_CREATORS),
    design: filterInitialData(DEFAULT_DESIGNS),
    component: filterInitialData(DEFAULT_COMPONENTS),
    prerequisite: filterInitialData(DEFAULT_PREREQUISITES),
    modifier: filterInitialData(DEFAULT_MODIFIERS),
    societies: filterInitialData(DEFAULT_SOCIETAL_ENTRIES)
  }));
  const [currentUser, setCurrentUser] = useState(auth?.currentUser || null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Maintain resilient ref for rollbacks without re-creating callbacks
  const latestDbDataRef = useRef(dbData);
  useEffect(() => {
    latestDbDataRef.current = dbData;
  }, [dbData]);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const showToast = useCallback((toast) => {
    if (typeof toast === 'string') {
      setToastMessage({ type: 'info', text: toast });
    } else {
      setToastMessage(toast);
    }
  }, []);

  // Listen to Auth state changes
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Real-time Firestore Subscriptions for all reference collections
  useEffect(() => {
    setIsLoading(true);
    const unsubs = [];
    const allCatKeys = new Set(['rules_codex', 'compendium', 'lore', 'rules']);

    Object.keys(categoryConfig).forEach(parentK => {
      const parent = categoryConfig[parentK];
      if (parent.viewType !== 'guide') allCatKeys.add(parentK);
      if (parent.subcategories) {
        Object.keys(parent.subcategories).forEach(subK => {
          if (parent.subcategories[subK].viewType !== 'guide') {
            allCatKeys.add(subK);
          }
        });
      }
    });

    let pendingCount = allCatKeys.size;

    allCatKeys.forEach(catK => {
      try {
        const refCol = collection(db, catK);
        const unsubRef = onSnapshot(
          refCol,
          (snapshot) => {
            const tombstones = getOmnicortexTombstones();
            let items = snapshot.docs.map(d => ({ ...d.data(), id: d.id })).filter(i => !isOmnicortexDeleted(i, tombstones));
            
            // If collection is completely unpopulated in Firestore, fall back to seed data only if not deleted
            if (items.length === 0 && snapshot.docs.length === 0) {
              const fallbackSeeds = getFallbackSeedForCategory(catK);
              items = fallbackSeeds.filter(s => !isOmnicortexDeleted(s, tombstones));
            }

            setDbData(prev => ({ ...prev, [catK]: items }));
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          },
          (err) => {
            console.warn(`[DBMContext] Listener notice for collection "${catK}":`, err.message);
            const tombstones = getOmnicortexTombstones();
            const fallbackSeeds = getFallbackSeedForCategory(catK);
            setDbData(prev => ({ ...prev, [catK]: fallbackSeeds.filter(s => !isOmnicortexDeleted(s, tombstones)) }));
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          }
        );
        unsubs.push(unsubRef);
      } catch (e) {
        console.warn(`[DBMContext] Init error on collection "${catK}":`, e);
        const fallbackSeeds = getFallbackSeedForCategory(catK);
        setDbData(prev => ({ ...prev, [catK]: fallbackSeeds }));
        pendingCount--;
        if (pendingCount <= 0) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      unsubs.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  // Sync all Canonical Compendium Articles to Firestore Cloud
  const syncCanonicalCompendium = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${compendiumSeedData.length} canonical articles to cloud...` });
      const operations = compendiumSeedData.map(item => ({
        ref: doc(db, 'compendium', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Compendium Synced',
        text: `All ${compendiumSeedData.length} canonical articles successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalCompendium failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync compendium to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all Canonical Species to Firestore Cloud
  const syncCanonicalSpecies = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_SPECIES.length} canonical species to cloud...` });
      const operations = DEFAULT_SPECIES.map(item => ({
        ref: doc(db, 'species', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Species Synced',
        text: `All ${DEFAULT_SPECIES.length} canonical species successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalSpecies failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync species to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync Master Species Matrix (Types, Sizes, Movements, Traits, Disadvantages, Species) to Firestore Cloud
  const syncMasterSpeciesMatrix = useCallback(async () => {
    try {
      showToast({
        type: 'info',
        title: 'Syncing Species Matrix...',
        text: 'Syncing complete Canonical Species Matrix (Types, Sizes, Movement, Traits, Disadvantages, Species) to cloud...'
      });

      const operations = [];

      // 1. Species Types
      DEFAULT_SPECIES_TYPES.forEach(item => {
        operations.push({
          ref: doc(db, 'species_type', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 2. Species Sizes
      DEFAULT_SPECIES_SIZES.forEach(item => {
        operations.push({
          ref: doc(db, 'species_size', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 3. Species Movement
      DEFAULT_SPECIES_MOVEMENT.forEach(item => {
        operations.push({
          ref: doc(db, 'species_movement', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 4. Species Traits (sync to both 'trait' and 'traits' collections)
      ALL_CANONICAL_TRAITS.forEach(item => {
        operations.push({
          ref: doc(db, 'trait', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
        operations.push({
          ref: doc(db, 'traits', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 5. Species Disadvantages
      DEFAULT_SPECIES_DISADVANTAGES.forEach(item => {
        operations.push({
          ref: doc(db, 'disadvantages', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      // 6. Species
      DEFAULT_SPECIES.forEach(item => {
        operations.push({
          ref: doc(db, 'species', item.id),
          data: { ...item, updatedAt: new Date().toISOString() },
          merge: true
        });
      });

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Species Matrix Synced',
        text: `Successfully synced ${operations.length} species matrix records to Firestore Cloud!`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncMasterSpeciesMatrix failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync species matrix to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Safe Save Entry with Schema Validation & Ref Snapshot Rollback
  const saveEntry = useCallback(async (rawPayload, key) => {
    if (!rawPayload || !key) {
      const errorMsg = 'Cannot save DBM entry: missing payload or category key.';
      console.warn(`[DBMContext] ${errorMsg}`);
      setToastMessage({ type: 'error', text: errorMsg });
      return false;
    }

    const payload = { ...rawPayload };
    const docId = payload.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    payload.id = docId;

    // 1. Schema Validation
    const validation = validateDbmEntry(key, payload);
    if (!validation.valid) {
      const errorSummary = validation.errors.join(' ');
      console.warn(`[DBMContext] Validation failed for entry "${docId}":`, errorSummary);
      setToastMessage({
        type: 'error',
        title: 'Validation Error',
        text: errorSummary
      });
      return false;
    }

    // 2. Snapshot current state from resilient ref before local update
    const previousSnapshot = latestDbDataRef.current;
    const sanitizedEntry = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    // 3. Optimistic UI update
    setDbData(prev => {
      const existing = prev[key] || [];
      const idx = existing.findIndex(i => i.id === docId);
      const updated = idx >= 0
        ? existing.map(i => i.id === docId ? sanitizedEntry : i)
        : [...existing, sanitizedEntry];
      return { ...prev, [key]: updated };
    });

    // If no authenticated user, keep optimistic local state and succeed
    if (!auth.currentUser && !currentUser) {
      return true;
    }

    // 4. Firestore persistence with precision rollback
    try {
      const docRef = doc(db, key, docId);
      await setDoc(docRef, sanitizedEntry, { merge: true });
      return true;
    } catch (err) {
      console.error(`[DBMContext] saveEntry failed for document "${docId}" in "${key}":`, err);
      // Precision rollback to ref snapshot
      setDbData(previousSnapshot);
      setToastMessage({
        type: 'error',
        title: 'Save Failed',
        text: `Failed to save "${sanitizedEntry.name || sanitizedEntry.title || docId}". Changes reverted.`
      });
      return false;
    }
  }, [currentUser]);

  // Safe Delete Entry with Multi-Collection Scan & Tombstone Persistence
  const deleteEntry = useCallback(async (docId, key) => {
    if (!docId) return false;

    // 1. Capture snapshot from resilient ref
    const previousSnapshot = latestDbDataRef.current;
    let targetName = null;

    // 2. Search local dbData to locate target item name
    for (const k of Object.keys(previousSnapshot)) {
      if (Array.isArray(previousSnapshot[k])) {
        const match = previousSnapshot[k].find(
          i => i.id === docId || (i.name && i.name.toString().toLowerCase() === docId.toString().toLowerCase())
        );
        if (match) {
          targetName = (match.name || match.title || '').trim();
          break;
        }
      }
    }
    if (!targetName && typeof docId === 'string' && docId.trim()) {
      targetName = docId.trim();
    }

    const displayName = targetName || docId;

    // Persist tombstone so seed arrays and caches never resurrect this entry
    addOmnicortexTombstone(docId, targetName);

    // 3. Optimistic local removal across collections
    setDbData(prev => {
      const nextState = { ...prev };
      Object.keys(nextState).forEach(k => {
        if (Array.isArray(nextState[k])) {
          nextState[k] = nextState[k].filter(i =>
            i.id !== docId &&
            i.id?.toString().toLowerCase() !== docId.toString().toLowerCase() &&
            (targetName ? (i.name || i.title || '').trim().toLowerCase() !== targetName.toLowerCase() : true)
          );
        }
      });
      return nextState;
    });

    // 4. Cloud delete execution across related reference collections
    try {
      const collectionsToScan = Array.from(new Set([
        key,
        'rules_codex',
        'rules',
        'lore',
        'compendium',
        'compendium_rules',
        'omnicortex',
        'articles',
        'wiki'
      ])).filter(Boolean);

      let deletedCount = 0;

      for (const scanKey of collectionsToScan) {
        try {
          const colRef = collection(db, scanKey);
          const allDocs = await getDocs(colRef);

          for (const d of allDocs.docs) {
            const data = d.data() || {};
            const dId = (d.id || '').toString().toLowerCase();
            const payloadId = (data.id || '').toString().toLowerCase();
            const dName = (data.name || data.title || '').trim().toLowerCase();

            const isMatch =
              dId === docId.toString().toLowerCase() ||
              payloadId === docId.toString().toLowerCase() ||
              (targetName && dName === targetName.toLowerCase()) ||
              (targetName && dId === targetName.toLowerCase());

            if (isMatch) {
              await deleteDoc(d.ref);
              deletedCount++;
            }
          }
        } catch (scanErr) {
          console.warn(`[DBMContext deleteEntry] Scan error on collection "${scanKey}":`, scanErr.message);
        }
      }

      setToastMessage({
        type: 'success',
        title: 'Deleted',
        text: `"${displayName}" successfully removed.`
      });
      return true;
    } catch (err) {
      console.warn(`[DBMContext] Cloud delete notice for "${docId}":`, err.message);
      // Even if Firestore fails (e.g., offline or unauthenticated), local tombstone and removal succeed
      setToastMessage({
        type: 'info',
        title: 'Removed Locally',
        text: `"${displayName}" removed locally.`
      });
      return true;
    }
  }, []);

  // Safe Batch JSON Import with Schema Validation & Chunking
  const importJSON = useCallback(async (list, key) => {
    if (!Array.isArray(list) || list.length === 0 || !key) {
      setToastMessage({ type: 'warning', text: 'No entries to import.' });
      return false;
    }

    // 1. Prepare and validate each item
    const preparedList = [];
    const validationErrors = [];

    list.forEach((item, index) => {
      const docId = item.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const candidate = {
        ...item,
        id: docId,
        updatedAt: new Date().toISOString()
      };
      const validation = validateDbmEntry(key, candidate);
      if (!validation.valid) {
        validationErrors.push(`Item #${index + 1} (${candidate.name || 'Unnamed'}): ${validation.errors.join(', ')}`);
      } else {
        preparedList.push(candidate);
      }
    });

    if (preparedList.length === 0) {
      setToastMessage({
        type: 'error',
        title: 'Import Validation Failed',
        text: validationErrors.slice(0, 3).join(' | ')
      });
      return false;
    }

    const previousSnapshot = latestDbDataRef.current;

    // 2. Optimistic UI update
    setDbData(prev => {
      const existing = prev[key] || [];
      const existingIds = new Set(existing.map(i => i.id));
      const newItems = preparedList.filter(i => !existingIds.has(i.id));
      const updatedExisting = existing.map(item => {
        const match = preparedList.find(p => p.id === item.id);
        return match || item;
      });
      return { ...prev, [key]: [...updatedExisting, ...newItems] };
    });

    // If no authenticated user, keep optimistic state
    if (!auth.currentUser && !currentUser) {
      setToastMessage({
        type: 'success',
        text: `Imported ${preparedList.length} item(s) locally.`
      });
      return true;
    }

    // 3. Chunked cloud commit
    try {
      const operations = preparedList.map(item => ({
        ref: doc(db, key, item.id),
        data: item,
        merge: true
      }));
      await commitChunkedBatches(operations, 450);
      setToastMessage({
        type: 'success',
        title: 'Import Complete',
        text: `Successfully imported ${preparedList.length} entry/entries.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] importJSON batch write failed:', err);
      // Precision rollback to ref snapshot
      setDbData(previousSnapshot);
      setToastMessage({
        type: 'error',
        title: 'Import Failed',
        text: `Failed to save imported entries to cloud: ${err.message}. Changes reverted.`
      });
      return false;
    }
  }, [currentUser]);

  // Master Database Backup Export & Restore Import
  const handleExportMasterJSON = useCallback(async () => {
    try {
      const allKeys = Object.keys(categoryConfig).filter(
        k => !categoryConfig[k].isParent && categoryConfig[k].viewType !== 'guide'
      );
      const masterCollections = {};
      
      for (const colKey of allKeys) {
        if (dbData[colKey] && dbData[colKey].length > 0) {
          masterCollections[colKey] = dbData[colKey];
        } else {
          try {
            const snap = await getDocs(collection(db, colKey));
            masterCollections[colKey] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
          } catch (e) {
            masterCollections[colKey] = [];
          }
        }
      }

      const backup = {
        type: "OmnicortexMasterDatabase",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        collections: masterCollections
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omnicortex_universe_master_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast({ type: 'success', text: 'Master Database backup exported successfully.' });
    } catch (err) {
      console.error("Master Export error:", err);
      showToast({ type: 'error', text: "Failed to export Master Database: " + err.message });
    }
  }, [dbData, showToast]);

  const handleImportMasterJSON = useCallback((e) => {
    const file = e?.target?.files?.[0] || e;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const collections = parsed.collections || (parsed.type === "OmnicortexMasterDatabase" ? parsed : null);
        if (!collections) {
          showToast({ type: 'error', text: "Invalid master database format. Expected 'collections' map." });
          return;
        }
        let totalCount = 0;
        for (const [colKey, items] of Object.entries(collections)) {
          if (Array.isArray(items) && items.length > 0) {
            await importJSON(items, colKey);
            totalCount += items.length;
          }
        }
        showToast({ type: 'success', text: `Successfully imported Master Backup (${totalCount} entries across ${Object.keys(collections).length} collections)!` });
      } catch (err) {
        console.error("Master Import error:", err);
        showToast({ type: 'error', text: "Invalid Master JSON file format." });
      }
    };
    reader.readAsText(file);
    if (e?.target) e.target.value = '';
  }, [importJSON, showToast]);

  // Omnicortex Navigation History & Global State
  const [activeCategory, setActiveCategory] = useState('species');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [history, setHistory] = useState(['species']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sidebar Menu Drawer State (Open by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBastionOpen, setIsBastionOpen] = useState(false);
  const [isArchitectModalOpen, setIsArchitectModalOpen] = useState(false);

  const navigateToCategory = useCallback((catKey, subKey = null) => {
    setActiveCategory(catKey);
    setActiveSubcategory(subKey);

    setHistory(prevHistory => {
      const nextHistory = prevHistory.slice(0, historyIndex + 1);
      nextHistory.push(subKey ? `${catKey}:${subKey}` : catKey);
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
  }, [historyIndex]);

  const handleBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const target = history[prevIdx];
      setHistoryIndex(prevIdx);
      if (target.includes(':')) {
        const [cat, sub] = target.split(':');
        setActiveCategory(cat);
        setActiveSubcategory(sub);
      } else {
        setActiveCategory(target);
        setActiveSubcategory(null);
      }
    }
  }, [history, historyIndex]);

  const handleForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const target = history[nextIdx];
      setHistoryIndex(nextIdx);
      if (target.includes(':')) {
        const [cat, sub] = target.split(':');
        setActiveCategory(cat);
        setActiveSubcategory(sub);
      } else {
        setActiveCategory(target);
        setActiveSubcategory(null);
      }
    }
  }, [history, historyIndex]);

  return (
    <DBMContext.Provider value={{
      dbData,
      isLoading,
      loadError,
      toastMessage,
      clearToast,
      showToast,
      saveEntry,
      deleteEntry,
      importJSON,
      syncCanonicalCompendium,
      syncCanonicalSpecies,
      syncMasterSpeciesMatrix,
      handleExportMasterJSON,
      handleImportMasterJSON,
      activeCategory,
      setActiveCategory,
      activeSubcategory,
      setActiveSubcategory,
      history,
      historyIndex,
      navigateToCategory,
      handleBack,
      handleForward,
      isSidebarOpen,
      setIsSidebarOpen,
      isBastionOpen,
      setIsBastionOpen,
      isArchitectModalOpen,
      setIsArchitectModalOpen
    }}>
      {children}
    </DBMContext.Provider>
  );
};
