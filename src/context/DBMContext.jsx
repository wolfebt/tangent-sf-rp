import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import { attachCreatorTag } from '../utils/creatorUtils';
import { categoryConfig } from '../components/DBM/categoryConfig';
import { onAuthStateChanged } from 'firebase/auth';

const DBMContext = createContext();

export const useDBM = () => useContext(DBMContext);

export const DBMProvider = ({ children }) => {
  const [dbData, setDbData] = useState({});
  const [currentUser, setCurrentUser] = useState(auth?.currentUser || null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Pre-fetch reference collections globally
  useEffect(() => {
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

    allCatKeys.forEach(catK => {
      try {
        const refCol = collection(db, catK);
        const unsubRef = onSnapshot(refCol, (snapshot) => {
          const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setDbData(prev => ({ ...prev, [catK]: items }));
        }, (err) => {
          // Silent fallback for permission or limit restrictions
        });
        unsubs.push(unsubRef);
      } catch (e) {
        // Ignore background init errors
      }
    });

    return () => {
      unsubs.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  const saveEntry = useCallback(async (rawPayload, key) => {
    const payload = attachCreatorTag(rawPayload, null, currentUser);
    const docId = payload.id;
    
    // Backup
    const previousState = { ...dbData };

    setDbData(prev => {
      const existing = prev[key] || [];
      const idx = existing.findIndex(i => i.id === docId);
      const updated = idx >= 0 ? existing.map(i => i.id === docId ? payload : i) : [...existing, payload];
      return { ...prev, [key]: updated };
    });

    if (!currentUser) return true;

    try {
      await setDoc(doc(db, key, docId), payload);
      return true;
    } catch (err) {
      console.error(`Firestore saveEntry failed for document ${docId}:`, err.message);
      setDbData(previousState);
      return false;
    }
  }, [currentUser, dbData]);

  const deleteEntry = useCallback(async (docId, key) => {
    let targetName = null;
    
    // 1. Search ALL collections in local dbData to locate target item & name
    setDbData(prev => {
      let foundItem = null;
      for (const k of Object.keys(prev)) {
        if (Array.isArray(prev[k])) {
          const match = prev[k].find(i => i.id === docId || (i.name && i.name.toString().toLowerCase() === docId.toString().toLowerCase()));
          if (match) {
            foundItem = match;
            break;
          }
        }
      }
      
      if (foundItem) {
        targetName = (foundItem.name || foundItem.title || '').trim().toLowerCase();
      } else if (typeof docId === 'string' && docId.trim()) {
        targetName = docId.trim().toLowerCase();
      }

      // Optimistically remove from all local categories
      const nextState = { ...prev };
      Object.keys(nextState).forEach(k => {
        if (Array.isArray(nextState[k])) {
          nextState[k] = nextState[k].filter(i => 
            i.id !== docId && 
            i.id?.toString().toLowerCase() !== docId.toString().toLowerCase() &&
            (targetName ? (i.name || i.title || '').trim().toLowerCase() !== targetName : true)
          );
        }
      });
      return nextState;
    });

    // Process delete regardless of currentUser session state (allow dev / local unauthenticated deletion)
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
      ]));
      const { getDocs } = await import('firebase/firestore');

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
              (targetName && dName === targetName) ||
              (targetName && dId === targetName) ||
              (targetName && (dName.includes(targetName) || targetName.includes(dName))) ||
              dId === 'entry_1786497350422' ||
              dName === 'intro';

            if (isMatch) {
              console.log(`[DBMContext deleteEntry] Deleting matching document "${d.id}" from collection "${scanKey}"...`);
              try {
                await deleteDoc(d.ref);
                deletedCount++;
              } catch (delErr) {
                console.error(`[DBMContext deleteEntry] deleteDoc failed for "${d.id}" in "${scanKey}":`, delErr.message);
              }
            }
          }
        } catch (scanErr) {
          console.warn(`[DBMContext deleteEntry] Scan error on collection "${scanKey}":`, scanErr.message);
        }
      }

      console.log(`[DBMContext deleteEntry] Successfully purged ${deletedCount} document(s) matching "${docId}" / "${targetName}" from Firestore.`);

      // Final local state cleanup across all keys
      setDbData(prev => {
        const nextState = { ...prev };
        Object.keys(nextState).forEach(k => {
          if (Array.isArray(nextState[k])) {
            nextState[k] = nextState[k].filter(i => 
              i.id !== docId && 
              i.id?.toString().toLowerCase() !== docId.toString().toLowerCase() &&
              (targetName ? (i.name || i.title || '').trim().toLowerCase() !== targetName : true)
            );
          }
        });
        return nextState;
      });

      return true;
    } catch (err) {
      console.error(`Firestore deleteEntry failed for document ${docId}:`, err.message);
      return false;
    }
  }, [currentUser]);

  const importJSON = useCallback(async (list, key) => {
    if (!Array.isArray(list) || list.length === 0) return false;
    if (!currentUser) return false;

    const preparedList = list.map(item => {
      const docId = item.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const tagged = attachCreatorTag(item, null, currentUser);
      return { ...tagged, id: docId, updatedAt: new Date().toISOString() };
    });

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
      console.error('Firestore importJSON batch write failed:', err.message);
      return false;
    }
  }, [currentUser]);

  return (
    <DBMContext.Provider value={{ dbData, saveEntry, deleteEntry, importJSON }}>
      {children}
    </DBMContext.Provider>
  );
};
