import { useState, useEffect, useCallback, useRef } from 'react';
import { db, auth } from '../../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { categoryConfig } from '../categoryConfig';
import { commitChunkedBatches } from '../../../utils/firestoreUtils';
import { validateDbmEntry } from '../../../utils/dbmValidators';

export const useFirestoreSync = (currentKey, currentUser = auth?.currentUser) => {
  const [dbData, setDbData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const dbDataRef = useRef(dbData);
  useEffect(() => {
    dbDataRef.current = dbData;
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

  useEffect(() => {
    if (!currentKey) return;
    
    let config = categoryConfig[currentKey];
    if (!config) {
      for (const parentKey of Object.keys(categoryConfig)) {
        if (categoryConfig[parentKey]?.subcategories?.[currentKey]) {
          config = categoryConfig[parentKey].subcategories[currentKey];
          break;
        }
      }
    }
    if (!config || config.isParent || config.viewType === 'guide') {
      setIsLoading(false);
      return;
    }

    const unsubs = [];

    try {
      // 1. Primary real-time listener for current active category
      const colRef = collection(db, currentKey);
      const unsubCurrent = onSnapshot(colRef, (snapshot) => {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setDbData(prev => ({ ...prev, [currentKey]: items }));
        setIsLoading(false);
      }, (err) => {
        console.warn(`Firestore listener error for ${currentKey}:`, err.message);
        setLoadError(`Failed to load ${currentKey}.`);
        setIsLoading(false);
      });
      unsubs.push(unsubCurrent);

      // 2. Pre-fetch reference collections in background for relational selector parity
      const allCatKeys = new Set(['rules_codex', 'compendium']);
      Object.keys(categoryConfig).forEach(parentK => {
        const parent = categoryConfig[parentK];
        if (parent.viewType !== 'guide') {
          allCatKeys.add(parentK);
        }
        if (parent.subcategories) {
          Object.keys(parent.subcategories).forEach(subK => {
            if (parent.subcategories[subK].viewType !== 'guide') {
              allCatKeys.add(subK);
            }
          });
        }
      });

      // Background subscribe to non-active reference collections if unpopulated
      allCatKeys.forEach(catK => {
        if (catK !== currentKey) {
          try {
            const refCol = collection(db, catK);
            const unsubRef = onSnapshot(refCol, (snapshot) => {
              const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
              setDbData(prev => ({ ...prev, [catK]: items }));
            }, (err) => {
              // Silent fallback for background listeners
            });
            unsubs.push(unsubRef);
          } catch (e) {
            // Ignore background init errors
          }
        }
      });

      return () => {
        unsubs.forEach(unsub => {
          if (typeof unsub === 'function') unsub();
        });
      };
    } catch (e) {
      console.warn(`Firestore listener init error for ${currentKey}:`, e);
      setIsLoading(false);
    }
  }, [currentKey]);

  // Safe Save Entry with Schema Validation & Snapshot Rollback
  const saveEntry = useCallback(async (rawPayload, key = currentKey) => {
    if (!rawPayload || !key) {
      const errorMsg = 'Cannot save DBM entry: missing payload or category key.';
      console.warn(`[useFirestoreSync] ${errorMsg}`);
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
      console.warn(`[useFirestoreSync] Validation failed for entry "${docId}":`, errorSummary);
      setToastMessage({
        type: 'error',
        title: 'Validation Error',
        text: errorSummary
      });
      return false;
    }

    // 2. Snapshot current state using ref for rollback
    const previousState = { ...dbDataRef.current };
    const sanitizedEntry = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    // 3. Update Local State Optimistically
    setDbData(prev => {
      const existing = prev[key] || [];
      const idx = existing.findIndex(i => i.id === docId);
      const updated = idx >= 0
        ? existing.map(i => i.id === docId ? sanitizedEntry : i)
        : [...existing, sanitizedEntry];
      return { ...prev, [key]: updated };
    });

    if (!auth.currentUser && !currentUser) {
      return true;
    }

    // 4. Sync to Firestore with precision rollback
    try {
      const docRef = doc(db, key, docId);
      await setDoc(docRef, sanitizedEntry, { merge: true });
      return true;
    } catch (err) {
      console.error(`Firestore saveEntry failed for document ${docId}:`, err.message);
      // Precision rollback to ref snapshot
      setDbData(previousState);
      setToastMessage({
        type: 'error',
        title: 'Save Failed',
        text: `Failed to save "${sanitizedEntry.name || sanitizedEntry.title || docId}". Changes reverted.`
      });
      return false;
    }
  }, [currentKey, currentUser]);

  // Safe Delete Entry with Multi-Collection Scan & Rollback
  const deleteEntry = useCallback(async (docId, key = currentKey) => {
    if (!docId) return false;

    const previousState = { ...dbDataRef.current };
    let targetName = null;

    // 1. Search ALL collections in local dbData to locate target item & name
    for (const k of Object.keys(previousState)) {
      if (Array.isArray(previousState[k])) {
        const match = previousState[k].find(
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

    // 2. Optimistically remove from all local categories
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

    // 3. Process delete in cloud across collections
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
          console.warn(`[useFirestoreSync deleteEntry] Scan error on collection "${scanKey}":`, scanErr.message);
        }
      }

      setToastMessage({
        type: 'success',
        title: 'Deleted',
        text: `"${displayName}" successfully deleted.`
      });
      return true;
    } catch (err) {
      console.error(`Firestore deleteEntry failed for document ${docId}:`, err.message);
      // Precision rollback to ref snapshot
      setDbData(previousState);
      setToastMessage({
        type: 'error',
        title: 'Delete Failed',
        text: `Failed to delete "${displayName}". Reverted.`
      });
      return false;
    }
  }, [currentKey]);

  // Safe Batch JSON Import
  const importJSON = useCallback(async (list, key = currentKey) => {
    if (!Array.isArray(list) || list.length === 0 || !key) {
      setToastMessage({ type: 'warning', text: 'No entries to import.' });
      return false;
    }

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
        validationErrors.push(`Item #${index + 1}: ${validation.errors.join(', ')}`);
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

    const previousState = { ...dbDataRef.current };

    // Optimistic UI update
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

    if (!auth.currentUser && !currentUser) {
      setToastMessage({
        type: 'success',
        text: `Imported ${preparedList.length} item(s) locally.`
      });
      return true;
    }

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
      console.error('Firestore importJSON batch write failed:', err.message);
      // Precision rollback to ref snapshot
      setDbData(previousState);
      setToastMessage({
        type: 'error',
        title: 'Import Failed',
        text: `Batch import failed: ${err.message}. Changes reverted.`
      });
      return false;
    }
  }, [currentKey, currentUser]);

  return {
    dbData,
    isLoading,
    loadError,
    toastMessage,
    clearToast,
    showToast,
    saveEntry,
    deleteEntry,
    importJSON
  };
};
