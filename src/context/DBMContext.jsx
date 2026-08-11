import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
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
    const allCatKeys = new Set();
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
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    if (!currentUser) return false;
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
    if (!currentUser) return false;
    const previousState = { ...dbData };

    setDbData(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(i => i.id !== docId)
    }));

    try {
      await deleteDoc(doc(db, key, docId));
      return true;
    } catch (err) {
      console.error(`Firestore deleteEntry failed for document ${docId}:`, err.message);
      setDbData(previousState);
      return false;
    }
  }, [currentUser, dbData]);

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
