import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { categoryConfig } from '../components/DBM/categoryConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { commitChunkedBatches, sanitizeFirestoreData } from '../utils/firestoreUtils';
import { validateDbmEntry } from '../utils/dbmValidators';

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
import { DEFAULT_GEAR } from '../data/gearData';
import { DEFAULT_MECHA } from '../data/mechaData';
import { DEFAULT_ARCHITECTURE } from '../data/architectureData';
import { DEFAULT_OTHER_PROPERTY } from '../data/otherPropertyData';
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
import { StorageService } from '../services/storageService';

const DBMContext = globalThis.__TANGENT_DBM_CONTEXT__ || (globalThis.__TANGENT_DBM_CONTEXT__ = createContext(null));

export const useDBM = () => useContext(DBMContext) || {};

export {
  TOMBSTONES_KEY,
  CUSTOM_ENTRIES_KEY,
  loadCompendiumCatalog,
  getOmnicortexCustomEntries,
  saveOmnicortexCustomEntry,
  removeOmnicortexCustomEntry,
  getOmnicortexTombstones,
  addOmnicortexTombstone,
  removeOmnicortexTombstones,
  clearOmnicortexTombstones,
  isOmnicortexDeleted,
  filterInitialData,
  mergeSeedsWithDocs,
  getFallbackSeedForCategory
} from '../utils/omnicortexPersistence.js';

import {
  TOMBSTONES_KEY,
  CUSTOM_ENTRIES_KEY,
  loadCompendiumCatalog,
  getOmnicortexCustomEntries,
  saveOmnicortexCustomEntry,
  removeOmnicortexCustomEntry,
  getOmnicortexTombstones,
  addOmnicortexTombstone,
  removeOmnicortexTombstones,
  clearOmnicortexTombstones,
  isOmnicortexDeleted,
  filterInitialData,
  mergeSeedsWithDocs,
  getFallbackSeedForCategory
} from '../utils/omnicortexPersistence.js';


export const DBMProvider = ({ children }) => {
  const [dbData, setDbData] = useState(() => ({
    compendium: filterInitialData(getFallbackSeedForCategory('compendium'), 'compendium'),
    archetypes: filterInitialData(DEFAULT_ARCHETYPES, 'archetypes'),
    species: filterInitialData(DEFAULT_SPECIES, 'species'),
    species_type: filterInitialData(DEFAULT_SPECIES_TYPES, 'species_type'),
    species_size: filterInitialData(DEFAULT_SPECIES_SIZES, 'species_size'),
    species_movement: filterInitialData(DEFAULT_SPECIES_MOVEMENT, 'species_movement'),
    occupations: filterInitialData(DEFAULT_OCCUPATIONS, 'occupations'),
    origins: filterInitialData(DEFAULT_ORIGINS, 'origins'),
    factions: filterInitialData(DEFAULT_FACTIONS, 'factions'),
    features: filterInitialData(DEFAULT_FEATURES, 'features'),
    trait: filterInitialData(ALL_CANONICAL_TRAITS, 'trait'),
    traits: filterInitialData(ALL_CANONICAL_TRAITS, 'traits'),
    skills: filterInitialData(ALL_CANONICAL_SKILLS, 'skills'),
    disadvantages: filterInitialData(DEFAULT_SPECIES_DISADVANTAGES, 'disadvantages'),
    weaponry: filterInitialData(DEFAULT_WEAPONRY, 'weaponry'),
    armoring: filterInitialData(DEFAULT_ARMORING, 'armoring'),
    gear: filterInitialData(DEFAULT_GEAR, 'gear'),
    mecha: filterInitialData(DEFAULT_MECHA, 'mecha'),
    architecture: filterInitialData(DEFAULT_ARCHITECTURE, 'architecture'),
    other: filterInitialData(DEFAULT_OTHER_PROPERTY, 'other'),
    augmentations: filterInitialData(DEFAULT_AUGMENTATIONS, 'augmentations'),
    invocations: filterInitialData(DEFAULT_INVOCATIONS, 'invocations'),
    augmentation_type: filterInitialData(DEFAULT_AUGMENTATION_TYPES, 'augmentation_type'),
    body_location: filterInitialData(DEFAULT_BODY_LOCATIONS, 'body_location'),
    area: filterInitialData(DEFAULT_AREA_PATTERNS, 'area'),
    effect: filterInitialData(DEFAULT_EFFECT_TYPES, 'effect'),
    range: filterInitialData(DEFAULT_RANGES, 'range'),
    target: filterInitialData(DEFAULT_TARGET_SPECIFICATIONS, 'target'),
    critical_effect: filterInitialData(DEFAULT_CRITICAL_EFFECTS, 'critical_effect'),
    critical_success_effect: filterInitialData(DEFAULT_CRITICAL_SUCCESS_EFFECTS, 'critical_success_effect'),
    critical_failure_effect: filterInitialData(DEFAULT_CRITICAL_FAILURE_EFFECTS, 'critical_failure_effect'),
    material: filterInitialData(DEFAULT_MATERIALS, 'material'),
    resistance: filterInitialData(DEFAULT_RESISTANCES, 'resistance'),
    mode: filterInitialData(DEFAULT_MODES, 'mode'),
    special: filterInitialData(DEFAULT_SPECIALS, 'special'),
    availability: filterInitialData(DEFAULT_AVAILABILITY, 'availability'),
    gear_category: filterInitialData(DEFAULT_GEAR_CATEGORIES, 'gear_category'),
    classification: filterInitialData(DEFAULT_CLASSIFICATIONS, 'classification'),
    creator: filterInitialData(DEFAULT_CREATORS, 'creator'),
    design: filterInitialData(DEFAULT_DESIGNS, 'design'),
    component: filterInitialData(DEFAULT_COMPONENTS, 'component'),
    prerequisite: filterInitialData(DEFAULT_PREREQUISITES, 'prerequisite'),
    modifier: filterInitialData(DEFAULT_MODIFIERS, 'modifier'),
    societies: filterInitialData(DEFAULT_SOCIETAL_ENTRIES, 'societies')
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
            const rawDocs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
            const items = mergeSeedsWithDocs(rawDocs, catK, tombstones);

            setDbData(prev => ({ ...prev, [catK]: items }));
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          },
          (err) => {
            console.warn(`[DBMContext] Listener notice for collection "${catK}":`, err.message);
            const tombstones = getOmnicortexTombstones();
            const items = mergeSeedsWithDocs([], catK, tombstones);
            setDbData(prev => ({ ...prev, [catK]: items }));
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          }
        );
        unsubs.push(unsubRef);
      } catch (e) {
        console.warn(`[DBMContext] Init error on collection "${catK}":`, e);
        const tombstones = getOmnicortexTombstones();
        const items = mergeSeedsWithDocs([], catK, tombstones);
        setDbData(prev => ({ ...prev, [catK]: items }));
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

  // Lazy-load compendium seed on demand
  const ensureCompendiumLoaded = useCallback(async () => {
    const seed = await loadCompendiumCatalog();
    if (latestDbDataRef.current.compendium?.length === seed.length && seed.length > 0) {
      return latestDbDataRef.current.compendium;
    }
    const tombstones = getOmnicortexTombstones();
    setDbData(prev => {
      const merged = mergeSeedsWithDocs(prev.compendium || [], 'compendium', tombstones);
      return { ...prev, compendium: merged };
    });
    return seed;
  }, []);

  // Sync all Canonical Compendium Articles to Firestore Cloud (and purge legacy non-canonical articles)
  const syncCanonicalCompendium = useCallback(async () => {
    try {
      const seed = await loadCompendiumCatalog();
      const canonicalIds = new Set(seed.map(item => item.id));
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${seed.length} canonical articles to cloud...` });
      const operations = seed.map(item => ({
        ref: doc(db, 'compendium', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      try {
        const snap = await getDocs(collection(db, 'compendium'));
        for (const d of snap.docs) {
          if (!canonicalIds.has(d.id)) {
            await deleteDoc(doc(db, 'compendium', d.id));
          }
        }
      } catch (cleanupErr) {
        console.warn('[DBMContext] Could not purge legacy compendium docs:', cleanupErr);
      }

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Compendium Synced',
        text: `All ${seed.length} canonical articles successfully synced to Firestore.`
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

  // Sync all Canonical Factions to Firestore Cloud
  const syncCanonicalFactions = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_FACTIONS.length} canonical factions to cloud...` });
      
      // Remove any tombstone records for canonical factions
      const canonicalIdentifiers = DEFAULT_FACTIONS.flatMap(f => [
        f.id,
        f.name,
        f.title
      ]).filter(Boolean);
      removeOmnicortexTombstones(canonicalIdentifiers);

      // Immediately ensure all canonical factions are present in local state
      setDbData(prev => {
        const existing = prev['factions'] || [];
        const existingIds = new Set(existing.map(i => (i.id || '').toString().toLowerCase().trim()));
        const missing = DEFAULT_FACTIONS.filter(f => !existingIds.has((f.id || '').toString().toLowerCase().trim()));
        return {
          ...prev,
          factions: [...existing, ...missing]
        };
      });

      const operations = DEFAULT_FACTIONS.map(item => ({
        ref: doc(db, 'factions', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Factions Synced',
        text: `All ${DEFAULT_FACTIONS.length} canonical factions successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalFactions failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync factions to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all Canonical Origins to Firestore Cloud
  const syncCanonicalOrigins = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_ORIGINS.length} canonical origins to cloud...` });
      const operations = DEFAULT_ORIGINS.map(item => ({
        ref: doc(db, 'origins', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Origins Synced',
        text: `All ${DEFAULT_ORIGINS.length} canonical origins successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalOrigins failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync origins to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all Canonical Occupations to Firestore Cloud
  const syncCanonicalOccupations = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_OCCUPATIONS.length} canonical occupations to cloud...` });
      const operations = DEFAULT_OCCUPATIONS.map(item => ({
        ref: doc(db, 'occupations', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Occupations Synced',
        text: `All ${DEFAULT_OCCUPATIONS.length} canonical occupations successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalOccupations failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync occupations to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all Canonical Invocations to Firestore Cloud
  const syncCanonicalInvocations = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing...', text: `Syncing ${DEFAULT_INVOCATIONS.length} canonical invocations to cloud...` });
      const operations = DEFAULT_INVOCATIONS.map(item => ({
        ref: doc(db, 'invocations', item.id),
        data: {
          ...item,
          updatedAt: new Date().toISOString()
        },
        merge: true
      }));

      await commitChunkedBatches(operations, 450);
      showToast({
        type: 'success',
        title: 'Invocations Synced',
        text: `All ${DEFAULT_INVOCATIONS.length} canonical invocations successfully synced to Firestore.`
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalInvocations failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not sync invocations to Firestore.'
      });
      return false;
    }
  }, [showToast]);

  // Sync all 5 foundational recommendation datasets to Firestore Cloud
  const syncCanonicalAllRecommendations = useCallback(async () => {
    try {
      showToast({ type: 'info', title: 'Syncing All Recommendations...', text: 'Syncing species, factions, origins, occupations, and invocations...' });
      await syncCanonicalSpecies();
      await syncCanonicalFactions();
      await syncCanonicalOrigins();
      await syncCanonicalOccupations();
      await syncCanonicalInvocations();
      showToast({
        type: 'success',
        title: 'Full Recommendations Synced',
        text: 'All canonical recommendation and guidance directives successfully synced to Firestore.'
      });
      return true;
    } catch (err) {
      console.error('[DBMContext] syncCanonicalAllRecommendations failed:', err);
      showToast({
        type: 'error',
        title: 'Sync Failed',
        text: err.message || 'Could not complete full recommendations sync.'
      });
      return false;
    }
  }, [showToast, syncCanonicalSpecies, syncCanonicalFactions, syncCanonicalOrigins, syncCanonicalOccupations, syncCanonicalInvocations]);

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

  // Safe Save Entry with Local Persistence, Schema Validation & Cloud Sync
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

    const sanitizedEntry = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    // 2. Persist locally to storage immediately so edits are NEVER lost
    saveOmnicortexCustomEntry(key, sanitizedEntry);

    // 3. Optimistic UI update
    setDbData(prev => {
      const existing = prev[key] || [];
      const idx = existing.findIndex(i => (i.id || '').toString().toLowerCase() === docId.toString().toLowerCase());
      const updated = idx >= 0
        ? existing.map(i => (i.id || '').toString().toLowerCase() === docId.toString().toLowerCase() ? sanitizedEntry : i)
        : [...existing, sanitizedEntry];
      return { ...prev, [key]: updated };
    });

    // 4. Firestore persistence if authenticated
    if (auth.currentUser || currentUser) {
      try {
        const docRef = doc(db, key, docId);
        const cleanPayload = sanitizeFirestoreData(sanitizedEntry);
        await setDoc(docRef, cleanPayload, { merge: true });
      } catch (err) {
        console.warn(`[DBMContext] Cloud sync notice for document "${docId}" in "${key}":`, err.message);
        // Do NOT rollback local state! Local storage and state have preserved the changes.
      }
    }

    return true;
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

    // Persist tombstone by docId so seed arrays and caches never resurrect this specific deleted entry
    addOmnicortexTombstone(docId);
    removeOmnicortexCustomEntry(key, docId);

    // 3. Optimistic local removal across collections (by docId ONLY)
    setDbData(prev => {
      const nextState = { ...prev };
      Object.keys(nextState).forEach(k => {
        if (Array.isArray(nextState[k])) {
          nextState[k] = nextState[k].filter(i =>
            i.id !== docId &&
            i.id?.toString().toLowerCase() !== docId.toString().toLowerCase()
          );
        }
      });
      return nextState;
    });

    // 4. Cloud delete execution across related reference collections (by docId ONLY)
    if (auth.currentUser || currentUser) {
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

        for (const scanKey of collectionsToScan) {
          try {
            const colRef = collection(db, scanKey);
            const allDocs = await getDocs(colRef);

            for (const d of allDocs.docs) {
              const data = d.data() || {};
              const dId = (d.id || '').toString().toLowerCase();
              const payloadId = (data.id || '').toString().toLowerCase();

              // Match ONLY by document ID to avoid deleting separate records that share a name!
              const isMatch =
                dId === docId.toString().toLowerCase() ||
                payloadId === docId.toString().toLowerCase();

              if (isMatch) {
                await deleteDoc(d.ref);
              }
            }
          } catch (scanErr) {
            console.warn(`[DBMContext deleteEntry] Scan error on collection "${scanKey}":`, scanErr.message);
          }
        }
      } catch (err) {
        console.warn(`[DBMContext] Cloud delete notice for "${docId}":`, err.message);
      }
    }

    setToastMessage({
      type: 'success',
      title: 'Deleted',
      text: `"${displayName}" successfully removed.`
    });
    return true;
  }, [currentUser]);

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

    // 2. Persist locally to storage immediately
    preparedList.forEach(item => {
      saveOmnicortexCustomEntry(key, item);
    });

    // 3. Optimistic UI update
    setDbData(prev => {
      const existing = prev[key] || [];
      const existingIds = new Set(existing.map(i => (i.id || '').toString().toLowerCase()));
      const newItems = preparedList.filter(i => !existingIds.has((i.id || '').toString().toLowerCase()));
      const updatedExisting = existing.map(item => {
        const match = preparedList.find(p => (p.id || '').toString().toLowerCase() === (item.id || '').toString().toLowerCase());
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

    // 4. Chunked cloud commit
    try {
      const operations = preparedList.map(item => ({
        ref: doc(db, key, item.id),
        data: sanitizeFirestoreData(item),
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
      console.warn('[DBMContext] importJSON batch write failed:', err);
      setToastMessage({
        type: 'info',
        title: 'Import Complete (Local)',
        text: `Imported ${preparedList.length} entries locally (cloud sync offline).`
      });
      return true;
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
      ensureCompendiumLoaded,
      loadCompendiumCatalog,
      syncCanonicalSpecies,
      syncCanonicalFactions,
      syncCanonicalOrigins,
      syncCanonicalOccupations,
      syncCanonicalInvocations,
      syncCanonicalAllRecommendations,
      syncMasterSpeciesMatrix,
      removeOmnicortexTombstones,
      clearOmnicortexTombstones,
      clearTombstonesForCategory: clearOmnicortexTombstones,
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
