import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { categoryConfig } from '../components/DBM/categoryConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { commitChunkedBatches } from '../utils/firestoreUtils';
import { validateDbmEntry } from '../utils/dbmValidators';

const DBMContext = createContext(null);

export const useDBM = () => useContext(DBMContext);

export const DBMProvider = ({ children }) => {
  const [dbData, setDbData] = useState({});
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
            const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
            setDbData(prev => ({ ...prev, [catK]: items }));
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          },
          (err) => {
            console.warn(`[DBMContext] Listener notice for collection "${catK}":`, err.message);
            pendingCount--;
            if (pendingCount <= 0) {
              setIsLoading(false);
            }
          }
        );
        unsubs.push(unsubRef);
      } catch (e) {
        console.warn(`[DBMContext] Init error on collection "${catK}":`, e);
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
      importJSON
    }}>
      {children}
    </DBMContext.Provider>
  );
};
