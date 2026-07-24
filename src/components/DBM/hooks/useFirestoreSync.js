import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { categoryConfig } from '../categoryConfig';

export const useFirestoreSync = (currentKey) => {
  const [dbData, setDbData] = useState({});

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
    if (!config || config.isParent || config.viewType === 'guide') return;

    const unsubs = [];

    try {
      // 1. Primary real-time listener for current active category
      const colRef = collection(db, currentKey);
      const unsubCurrent = onSnapshot(colRef, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDbData(prev => ({ ...prev, [currentKey]: items }));
      }, (err) => {
        console.warn(`Firestore listener error for ${currentKey}:`, err.message);
      });
      unsubs.push(unsubCurrent);

      // 2. Pre-fetch reference collections in background for relational selector parity
      const allCatKeys = new Set();
      Object.keys(categoryConfig).forEach(parentK => {
        const parent = categoryConfig[parentK];
        // Always include top-level non-guide collections
        if (parent.viewType !== 'guide') {
          allCatKeys.add(parentK);
        }
        // Also include all subcategory collections (species_type, species_size, etc.)
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
              const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setDbData(prev => ({ ...prev, [catK]: items }));
            }, (err) => {
              // Silent fallback for permission or limit restrictions
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
    }
  }, [currentKey]);

  const saveEntry = useCallback(async (payload, key = currentKey) => {
    const docId = payload.id;
    
    // Update Local State Optimistically
    setDbData(prev => {
      const existing = prev[key] || [];
      const idx = existing.findIndex(i => i.id === docId);
      const updated = idx >= 0
        ? existing.map(i => i.id === docId ? payload : i)
        : [...existing, payload];
      return { ...prev, [key]: updated };
    });

    // Sync to Firestore
    try {
      await setDoc(doc(db, key, docId), payload);
      return true;
    } catch (err) {
      console.warn("Local update saved; Firestore sync requires permissions:", err.message);
      return false;
    }
  }, [currentKey]);

  const deleteEntry = useCallback(async (docId, key = currentKey) => {
    // Update Local State Optimistically
    setDbData(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(i => i.id !== docId)
    }));

    try {
      await deleteDoc(doc(db, key, docId));
      return true;
    } catch (err) {
      console.warn("Local delete processed; Firestore sync failed:", err.message);
      return false;
    }
  }, [currentKey]);

  const importJSON = useCallback(async (list, key = currentKey) => {
    if (!Array.isArray(list) || list.length === 0) return false;

    // Standardize IDs for all imported items
    const preparedList = list.map(item => {
      const docId = item.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return { ...item, id: docId, updatedAt: new Date().toISOString() };
    });

    // Optimistically update local React state
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

    // Batch-write items to Firestore in chunks of up to 500 (Firestore limit)
    try {
      const CHUNK_SIZE = 450;
      for (let i = 0; i < preparedList.length; i += CHUNK_SIZE) {
        const chunk = preparedList.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const docRef = doc(db, key, item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
      }
      return true;
    } catch (err) {
      console.warn("Local import applied; Firestore batch write requires write permissions:", err.message);
      return false;
    }
  }, [currentKey]);

  return {
    dbData,
    saveEntry,
    deleteEntry,
    importJSON
  };
};

