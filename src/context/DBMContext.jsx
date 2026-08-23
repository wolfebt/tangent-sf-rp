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

const DBMContext = createContext(null);

export const useDBM = () => useContext(DBMContext);

export const DBMProvider = ({ children }) => {
  const [dbData, setDbData] = useState({
    compendium: compendiumSeedData,
    archetypes: DEFAULT_ARCHETYPES,
    species: DEFAULT_SPECIES
  });
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
            let items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
            // If compendium, archetypes, or species is empty or smaller than the canonical seed, ensure all seed items are available locally
            if ((catK === 'compendium' || catK === 'rules_codex') && items.length < compendiumSeedData.length) {
              const existingIds = new Set(items.map(i => i.id || (i.name || '').toLowerCase()));
              const missingSeeds = compendiumSeedData.filter(s => !existingIds.has(s.id) && !existingIds.has(s.name.toLowerCase()));
              items = [...items, ...missingSeeds];
            } else if (catK === 'archetypes' && items.length < DEFAULT_ARCHETYPES.length) {
              const existingIds = new Set(items.map(i => i.id || (i.name || '').toLowerCase()));
              const missingSeeds = DEFAULT_ARCHETYPES.filter(s => !existingIds.has(s.id) && !existingIds.has(s.name.toLowerCase()));
              items = [...items, ...missingSeeds];
            } else if (catK === 'species' && items.length < DEFAULT_SPECIES.length) {
              const existingIds = new Set(items.map(i => i.id || (i.name || '').toLowerCase()));
              const missingSeeds = DEFAULT_SPECIES.filter(s => !existingIds.has(s.id) && !existingIds.has(s.name.toLowerCase()));
              items = [...items, ...missingSeeds];
            }
            setDbData(prev => ({ ...prev, [catK]: items }));
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          },
          (err) => {
            console.warn(`[DBMContext] Listener notice for collection "${catK}":`, err.message);
            // Fallback for compendium, archetypes, and species if listener fails
            if (catK === 'compendium' || catK === 'rules_codex') {
              setDbData(prev => ({ ...prev, [catK]: compendiumSeedData }));
            } else if (catK === 'archetypes') {
              setDbData(prev => ({ ...prev, [catK]: DEFAULT_ARCHETYPES }));
            } else if (catK === 'species') {
              setDbData(prev => ({ ...prev, [catK]: DEFAULT_SPECIES }));
            }
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          }
        );
        unsubs.push(unsubRef);
      } catch (e) {
        console.warn(`[DBMContext] Init error on collection "${catK}":`, e);
        if (catK === 'compendium' || catK === 'rules_codex') {
          setDbData(prev => ({ ...prev, [catK]: compendiumSeedData }));
        } else if (catK === 'archetypes') {
          setDbData(prev => ({ ...prev, [catK]: DEFAULT_ARCHETYPES }));
        } else if (catK === 'species') {
          setDbData(prev => ({ ...prev, [catK]: DEFAULT_SPECIES }));
        }
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

  // Safe Delete Entry with Multi-Collection Scan & Rollback
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
      console.error(`[DBMContext] deleteEntry failed for "${docId}":`, err);
      // Precision rollback to ref snapshot
      setDbData(previousSnapshot);
      setToastMessage({
        type: 'error',
        title: 'Delete Failed',
        text: `Failed to delete "${displayName}". Reverted.`
      });
      return false;
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
  const [activeCategory, setActiveCategory] = useState('compendium');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [history, setHistory] = useState(['compendium']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
