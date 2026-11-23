import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, onSnapshot, collection, query, where, getDocs, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { attachCreatorTag } from '../utils/creatorUtils';
import { getEffectiveUserHandle } from '../utils/personaValidationUtils';
import { createDebouncedSaver } from '../utils/debounceUtils';
import { commitChunkedBatches, sanitizeFirestoreData } from '../utils/firestoreUtils';
import { StorageService } from '../services/storageService';
import { sanitizeMapForSpectator } from '../utils/spectatorSanitizer';
import { offloadMapBinaryFields } from '../services/adeMediaStorageService';
import { normalizeElementType } from '../pages/Foundry/ElementForge/elementSchemas';
import {
  createDefaultCronicleState,
  applyCronicleDelta,
  applyBatchDeltas,
  cloneToWorkingCopy
} from '../services/cronicleService.js';
import { initCronicleVttBridge } from '../services/cronicleVttBridge.js';
import { showToast } from './ToastContext';
import { showConfirm } from './ConfirmContext';
import {
  moveNodeInTree,
  reorderNodeSiblings,
  reorderRelativeNode,
  flattenTree,
  TreeHistoryManager
} from '../utils/scenarioTreeEngine.js';

const StoryContext = globalThis.__TANGENT_STORY_CONTEXT__ || (globalThis.__TANGENT_STORY_CONTEXT__ = createContext({}));

export const useStory = () => useContext(StoryContext) || {};
export const useCampaign = useStory;

// Helper to format filenames as {name}-{type}.{ext}
export const formatExportFilename = (name, type, ext) => {
  const cleanName = (name || 'untitled')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_');
  const cleanType = (type || 'file')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_');
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
  return `${cleanName}-${cleanType}${cleanExt}`;
};

const DEFAULT_UNIVERSE_STATE = {
  id: 'proj_default_universe',
  projectName: 'Tangent Universe',
  description: 'Default Story Project',
  scenarios: [
    {
      id: 'elem_default_overview',
      title: 'Universe Overview',
      type: 'Scenario',
      content: '',
      children: []
    }
  ],
  maps: [],
  customAssets: { terrains: [], objects: [], chunks: [] },
  creativeState: {
    gems: [],
    storyCards: [],
    storyOutline: '',
    sceneBeats: '',
    storyDraft: '',
    linkedElements: []
  },
  cronicle: createDefaultCronicleState('Tangent Universe'),
  galleryModifiers: [],
  updatedAt: new Date().toISOString()
};

const DELETED_STORY_IDS_KEY = 'tangent_deleted_story_ids';

const getDeletedStoryIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_STORY_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

const markStoryIdDeleted = (storyId) => {
  if (!storyId) return;
  try {
    const set = getDeletedStoryIds();
    set.add(storyId);
    localStorage.setItem(DELETED_STORY_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
};

const unmarkStoryIdDeleted = (storyId) => {
  if (!storyId) return;
  try {
    const set = getDeletedStoryIds();
    if (set.has(storyId)) {
      set.delete(storyId);
      localStorage.setItem(DELETED_STORY_IDS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch {}
};

export const StoryProvider = ({ children }) => {
  // Global Universe State — primary source is Firestore; StorageService/IndexedDB is secondary offline cache
  const [universeState, setUniverseState] = useState(() => {
    try {
      const saved = localStorage.getItem('tangent_universe_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.id) parsed.id = 'proj_default_universe';
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved universe state from localStorage:', e);
    }
    return DEFAULT_UNIVERSE_STATE;
  });

  // Story Catalog List State
  const [storyCatalog, setStoryCatalog] = useState(() => {
    try {
      const saved = localStorage.getItem('tangent_story_catalog');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse story catalog from localStorage:', e);
    }
    return [DEFAULT_UNIVERSE_STATE];
  });

  // Independent Maps Library Catalog State
  const [mapsCatalog, setMapsCatalog] = useState(() => {
    try {
      const saved = localStorage.getItem('tangent_maps_catalog');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse maps catalog from localStorage:', e);
    }
    return [];
  });

  // Independent Elements Library Catalog State
  const [elementsCatalog, setElementsCatalog] = useState(() => {
    try {
      const saved = localStorage.getItem('tangent_elements_catalog');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(e => (e && e.type ? { ...e, type: normalizeElementType(e.type) } : e));
        }
      }
    } catch (e) {
      console.warn('Failed to parse elements catalog from localStorage:', e);
    }
    return [];
  });
  const elementsCatalogRef = useRef(elementsCatalog);
  elementsCatalogRef.current = elementsCatalog;

  // Asynchronous StorageService hydration on initial mount
  useEffect(() => {
    let isMounted = true;
    async function hydrateCacheFromStorage() {
      try {
        const [cachedUniverse, cachedStories, cachedMaps, cachedElements] = await Promise.all([
          StorageService.getItem('tangent_universe_state'),
          StorageService.getItem('tangent_story_catalog'),
          StorageService.getItem('tangent_maps_catalog'),
          StorageService.getItem('tangent_elements_catalog')
        ]);

        if (!isMounted) return;

        if (cachedUniverse && cachedUniverse.id && !getDeletedStoryIds().has(cachedUniverse.id)) {
          isSyncingFromFirestore.current = true;
          if (cachedUniverse.updatedAt) {
            lastSyncedCloudUpdatedAtRef.current = cachedUniverse.updatedAt;
          }
          setUniverseState(prev => {
            if (!prev || prev.id === 'proj_default_universe' || !prev.scenarios?.length) {
              return cachedUniverse;
            }
            return prev;
          });
        }

        if (Array.isArray(cachedStories) && cachedStories.length > 0) {
          const deletedIds = getDeletedStoryIds();
          const filteredCachedStories = cachedStories.filter(s => s && !deletedIds.has(s.id));
          if (filteredCachedStories.length > 0) {
            setStoryCatalog(filteredCachedStories);
          }
        }

        if (Array.isArray(cachedMaps) && cachedMaps.length > 0) {
          setMapsCatalog(cachedMaps);
        }

        if (Array.isArray(cachedElements) && cachedElements.length > 0) {
          setElementsCatalog(cachedElements.map(e => (e && e.type ? { ...e, type: normalizeElementType(e.type) } : e)));
        }
      } catch (err) {
        console.warn('[CampaignContext] Failed to hydrate local cache from StorageService:', err);
      }
    }

    hydrateCacheFromStorage();
    return () => {
      isMounted = false;
    };
  }, []);

  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [activeMapId, setActiveMapId] = useState(null);

  // Unsaved / Dirty Fields tracking
  const [isDirty, setIsDirty] = useState(false);
  const [isStoryReadOnly, setIsStoryReadOnly] = useState(false);
  const [publicStoryCatalog, setPublicStoryCatalog] = useState([]);

  // Helper to confirm action when active workspace has unsaved / dirty changes
  const confirmIfDirty = useCallback(async (actionCallback, customMsg) => {
    if (isDirty) {
      const msg = customMsg || `Warning: You have unsaved or modified fields in your current story project ("${universeState.projectName || 'Untitled'}"). Creating or opening a new story will clear out the current active workspace. Do you want to proceed?`;
      const ok = await showConfirm({
        title: 'Unsaved Changes',
        message: msg,
        confirmLabel: 'Proceed',
        danger: true
      });
      if (!ok) {
        return false;
      }
    }
    if (typeof actionCallback === 'function') {
      actionCallback();
    }
    return true;
  }, [isDirty, universeState.projectName]);

  // Track auth & Cloud DB connection state & sync conflict handling
  const isInitialMount = useRef(true);
  const isSyncingFromFirestore = useRef(false);
  const lastSyncedCloudUpdatedAtRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('offline'); // 'synced' | 'syncing' | 'conflict' | 'offline' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'unsaved' | 'saving' | 'saved' | 'error' | 'offline'
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState(null);
  const [syncConflict, setSyncConflict] = useState(null); // { type, cloudData, localData, cloudUpdatedAt, localUpdatedAt }

  const isDirtyRef = useRef(isDirty);
  const isStoryReadOnlyRef = useRef(isStoryReadOnly);
  const universeStateRef = useRef(universeState);
  const storyCatalogRef = useRef(storyCatalog);
  const mapsCatalogRef = useRef(mapsCatalog);
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    isDirtyRef.current = isDirty;
    isStoryReadOnlyRef.current = isStoryReadOnly;
    universeStateRef.current = universeState;
    storyCatalogRef.current = storyCatalog;
    mapsCatalogRef.current = mapsCatalog;
    currentUserRef.current = currentUser;
  }, [isDirty, isStoryReadOnly, universeState, storyCatalog, mapsCatalog, currentUser]);

  const setStoryReadOnlyState = useCallback((val) => {
    const resolved = typeof val === 'function' ? Boolean(val(isStoryReadOnlyRef.current)) : Boolean(val);
    isStoryReadOnlyRef.current = resolved;
    setIsStoryReadOnly(resolved);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setCloudSyncStatus('offline');
        setSaveStatus('offline');
      }
    });
    return () => unsub();
  }, []);

  // Helper to ensure all elements in a tree have valid names/titles
  const enforceElementNames = useCallback((nodes) => {
    if (!Array.isArray(nodes)) return [];
    return nodes.map(node => {
      const cleanTitle = (node.title && node.title.trim()) 
        ? node.title.trim() 
        : `Untitled ${node.type || 'Element'}`;
      return {
        ...node,
        title: cleanTitle,
        children: node.children ? enforceElementNames(node.children) : []
      };
    });
  }, []);

  // Recursively extract and save all elements independently into the elements catalog & Firestore
  const saveAllElementsIndependently = useCallback(async (scenariosTree, user) => {
    if (!Array.isArray(scenariosTree) || scenariosTree.length === 0) return;

    const flattened = flattenTree(scenariosTree);
    const extractedElements = flattened.map(node => {
      const cleanTitle = (node.title && node.title.trim()) ? node.title.trim() : `Untitled ${node.type || 'Element'}`;
      return {
        ...node,
        title: cleanTitle,
        updatedAt: new Date().toISOString(),
        authorHandle: user ? getEffectiveUserHandle(user) : 'Local User',
        authorUid: user?.uid || 'local',
        creatorId: user?.uid || 'local',
        storyId: universeStateRef.current?.id || 'proj_default_universe'
      };
    });

    // Update local elements catalog state (merging/upserting by ID)
    setElementsCatalog(prev => {
      const map = new Map(prev.map(item => [item.id, item]));
      extractedElements.forEach(item => map.set(item.id, item));
      const updatedList = Array.from(map.values());
      StorageService.setItem('tangent_elements_catalog', updatedList);
      return updatedList;
    });

    // Write individual elements to Firestore 'story_elements' collection in safe chunks if authenticated
    if (user && db) {
      try {
        const operations = extractedElements.map(elem => ({
          ref: doc(db, 'story_elements', elem.id),
          data: elem,
          merge: true
        }));
        await commitChunkedBatches(operations, 450);
      } catch (err) {
        console.warn('Chunked independent element write to Firestore failed:', err.message);
      }
    }
  }, []);

  // Recursively extract and save all maps independently into the maps catalog & Firestore
  const saveAllMapsIndependently = useCallback(async (maps, user) => {
    if (!Array.isArray(maps) || maps.length === 0) return;

    const extractedMaps = maps.map(m => ({
      ...m,
      updatedAt: new Date().toISOString(),
      authorHandle: user ? getEffectiveUserHandle(user) : 'Local User',
      authorUid: user?.uid || 'local',
      creatorId: user?.uid || 'local',
      storyId: universeStateRef.current?.id || 'proj_default_universe'
    }));

    setMapsCatalog(prev => {
      const map = new Map(prev.map(item => [item.id, item]));
      extractedMaps.forEach(item => map.set(item.id, item));
      const updatedList = Array.from(map.values());
      StorageService.setItem('tangent_maps_catalog', updatedList);
      return updatedList;
    });

    if (user && db) {
      try {
        const preparedMaps = await Promise.all(
          extractedMaps.map(m => offloadMapBinaryFields(m, { userId: user.uid }))
        );
        const operations = [];
        preparedMaps.forEach(m => {
          operations.push({
            ref: doc(db, 'story_maps', m.id),
            data: m,
            merge: true
          });
          if (m.isSpectatorLive === true) {
            const sanitizedSpectator = sanitizeMapForSpectator(m, user);
            if (sanitizedSpectator) {
              operations.push({
                ref: doc(db, 'spectator_maps', m.id),
                data: sanitizedSpectator,
                merge: true
              });
            }
          }
        });
        await commitChunkedBatches(operations, 450);
      } catch (err) {
        console.warn('Chunked independent map write to Firestore failed:', err.message);
      }
    }
  }, []);

  // Fetch all Cloud DB Story Projects & Elements Catalog on Auth
  useEffect(() => {
    if (!currentUser) {
      setCloudSyncStatus('offline');
      return;
    }
    setCloudSyncStatus('syncing');

    // Fetch user stories owned by the current user from Cloud DB
    const storiesQuery = query(collection(db, 'user_stories'), where('ownerId', '==', currentUser.uid));
    getDocs(storiesQuery).then((snap) => {
      const deletedIds = getDeletedStoryIds();
      const stories = snap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter(s => !deletedIds.has(s.id));
      if (stories.length > 0) {
        setStoryCatalog(prev => {
          const map = new Map(prev.filter(s => !deletedIds.has(s.id)).map(s => [s.id, s]));
          stories.forEach(s => map.set(s.id, s));
          const merged = Array.from(map.values());
          StorageService.setItem('tangent_story_catalog', merged);
          return merged;
        });
      }
    }).catch(e => console.warn('Failed to load user stories from cloud:', e));

    // Fetch user elements library from Cloud DB
    const elementsQuery = query(collection(db, 'story_elements'), where('authorUid', '==', currentUser.uid));
    getDocs(elementsQuery).then((snap) => {
      const elems = snap.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, ...(data?.type ? { type: normalizeElementType(data.type) } : {}) };
      });
      if (elems.length > 0) {
        setElementsCatalog(prev => {
          const map = new Map(prev.map(e => [e.id, e]));
          elems.forEach(e => map.set(e.id, e));
          const merged = Array.from(map.values());
          StorageService.setItem('tangent_elements_catalog', merged);
          return merged;
        });
      }
    }).catch(e => console.warn('Failed to load elements catalog from cloud:', e));

    // Fetch user maps library from Cloud DB
    const mapsQuery = query(collection(db, 'story_maps'), where('authorUid', '==', currentUser.uid));
    getDocs(mapsQuery).then((snap) => {
      const maps = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      if (maps.length > 0) {
        setMapsCatalog(prev => {
          const map = new Map(prev.map(e => [e.id, e]));
          maps.forEach(e => map.set(e.id, e));
          const merged = Array.from(map.values());
          StorageService.setItem('tangent_maps_catalog', merged);
          return merged;
        });
      }
    }).catch(e => console.warn('Failed to load maps catalog from cloud:', e));

  }, [currentUser]);

  // Real-time Firestore Subscription for the Active Story Project
  useEffect(() => {
    if (!currentUser || !universeState?.id) {
      if (!currentUser) setCloudSyncStatus('offline');
      return;
    }

    const activeStoryId = universeState.id;
    if (activeStoryId === 'proj_default_universe' && universeState?.ownerId && universeState.ownerId !== currentUser.uid) {
      return;
    }
    if (activeStoryId === 'proj_default_universe' && !universeState?.ownerId) {
      return;
    }
    const storyDocRef = doc(db, 'user_stories', activeStoryId);

    const unsub = onSnapshot(storyDocRef, (snap) => {
      // 1. Ignore local optimistic writes in flight to avoid false conflict loops
      if (snap.metadata.hasPendingWrites) {
        return;
      }

      if (snap.exists()) {
        const firestoreData = snap.data();

        // 2. Ignore if local state was updated by a pull/switch
        if (isSyncingFromFirestore.current) {
          return;
        }

        // 3. Echo check: if remote timestamp matches our last synced cloud write, acknowledge sync
        if (lastSyncedCloudUpdatedAtRef.current && firestoreData.updatedAt === lastSyncedCloudUpdatedAtRef.current) {
          setCloudSyncStatus('synced');
          return;
        }

        // 4. If remote timestamp matches current local state timestamp, acknowledge sync
        if (universeStateRef.current?.updatedAt && firestoreData.updatedAt === universeStateRef.current.updatedAt) {
          lastSyncedCloudUpdatedAtRef.current = firestoreData.updatedAt;
          setCloudSyncStatus('synced');
          return;
        }

        const remoteTime = firestoreData.updatedAt ? new Date(firestoreData.updatedAt).getTime() : 0;
        const lastSyncedTime = lastSyncedCloudUpdatedAtRef.current ? new Date(lastSyncedCloudUpdatedAtRef.current).getTime() : 0;

        // 5. If remote timestamp is older than or equal to last synced write, treat as already up to date
        if (remoteTime <= lastSyncedTime && lastSyncedTime > 0) {
          setCloudSyncStatus('synced');
          return;
        }

        // 6. If local state has unsaved modifications (isDirty is true) and remote document is genuinely newer from another session
        if (isDirtyRef.current) {
          if (lastSyncedTime > 0 && remoteTime > lastSyncedTime) {
            console.warn('[StoryFoundry] Remote story document updated while local edits exist:', activeStoryId);
            setCloudSyncStatus('conflict');
            setSyncConflict({
              type: 'remote_update',
              cloudData: firestoreData,
              localData: universeStateRef.current,
              cloudUpdatedAt: firestoreData.updatedAt || 'Unknown',
              localUpdatedAt: universeStateRef.current?.updatedAt || 'Unknown'
            });
            return;
          }
        }

    // 7. Clean remote sync from Firestore
    debouncedSaveRef.current?.cancel();
    isSyncingFromFirestore.current = true;
    lastSyncedCloudUpdatedAtRef.current = firestoreData.updatedAt || new Date().toISOString();
    setUniverseState(firestoreData);
        setIsDirty(false);
        setCloudSyncStatus('synced');
        setLastCloudSavedAt(new Date().toLocaleTimeString());
      } else {
        setCloudSyncStatus('synced');
      }
    }, (err) => {
      console.warn('[StoryFoundry] Firestore story listener error:', err.message);
      setCloudSyncStatus('error');
    });

    return () => unsub();
  }, [currentUser, universeState?.id]);

  // Check URL query parameters for direct story view (?storyId=STORY_ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetStoryId = params.get('storyId');

    if (targetStoryId) {
      const docRef = doc(db, 'user_stories', targetStoryId);
      getDoc(docRef).then((snap) => {
        if (snap.exists()) {
          const storyData = snap.data();
          const isLocalDoc = !storyData.ownerId || storyData.ownerId === 'local';
          const isOwner = currentUser ? (isLocalDoc || storyData.ownerId === currentUser.uid) : isLocalDoc;
          if (storyData.isPublic || isOwner) {
            debouncedSaveRef.current?.cancel();
            treeHistoryRef.current?.reset(storyData.scenarios || []);
            setUniverseState(storyData);
            setIsDirty(false);
            setStoryReadOnlyState(!isOwner);
            if (storyData.scenarios?.length > 0) {
              setActiveScenarioId(storyData.scenarios[0].id);
            }
          } else {
            showToast({ type: 'warning', text: 'This story project is private.' });
          }
        } else {
          showToast({ type: 'warning', text: 'Requested story project was not found.' });
        }
      }).catch((err) => {
        console.warn('Failed to load public story project:', err);
      });
    }
  }, [currentUser]);

  const toggleStoryVisibility = useCallback(async (storyId, targetIsPublic) => {
    if (isStoryReadOnlyRef.current) return false;
    const target =
      storyCatalogRef.current.find(s => s.id === storyId) ||
      (universeStateRef.current?.id === storyId ? universeStateRef.current : null);
    if (target?.ownerId && target.ownerId !== 'local' && (!currentUser || target.ownerId !== currentUser.uid)) {
      return false;
    }

    setStoryCatalog(prev => {
      const updated = prev.map(s => s.id === storyId ? { ...s, isPublic: targetIsPublic } : s);
      StorageService.setItem('tangent_story_catalog', updated);
      return updated;
    });

    if (universeState.id === storyId) {
      setUniverseState(prev => ({ ...prev, isPublic: targetIsPublic }));
    }

    if (currentUser) {
      try {
        const userStoryDoc = doc(db, 'user_stories', storyId);
        await setDoc(userStoryDoc, sanitizeFirestoreData({ isPublic: targetIsPublic, ownerId: currentUser.uid }), { merge: true });
      } catch (err) {
        console.warn('Failed to update story visibility in cloud:', err);
      }
    }
    return true;
  }, [currentUser, universeState.id]);

  const loadPublicStories = useCallback(async () => {
    try {
      const publicStoriesQuery = query(collection(db, 'user_stories'), where('isPublic', '==', true));
      const snap = await getDocs(publicStoriesQuery);
      const publicStories = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => s.isPublic === true);
      setPublicStoryCatalog(publicStories);
      return publicStories;
    } catch (err) {
      console.warn('Failed to fetch public community stories:', err);
      return [];
    }
  }, []);

  const clonePublicStory = useCallback((storyToClone) => {
    const source = storyToClone || universeState;
    const newId = `proj_${Date.now()}`;
    const ownerUid = currentUser ? currentUser.uid : 'local';
    const rawStory = {
      ...source,
      id: newId,
      projectName: `${source.projectName || 'Untitled Story'} (Copy)`,
      isPublic: false,
      ownerId: ownerUid,
      createdBy: ownerUid,
      authorId: ownerUid,
      gmId: ownerUid,
      scenarios: Array.isArray(source.scenarios)
        ? source.scenarios.map(sc => sc ? { ...sc, ownerId: ownerUid, createdBy: ownerUid } : sc)
        : [],
      maps: Array.isArray(source.maps)
        ? source.maps.map(m => m ? { ...m, ownerId: ownerUid, createdBy: ownerUid, creatorId: ownerUid, authorUid: ownerUid } : m)
        : [],
      updatedAt: new Date().toISOString()
    };
    const newStory = attachCreatorTag(rawStory, localStorage.getItem('userHandle'), currentUser);

    debouncedSaveRef.current?.cancel();
    treeHistoryRef.current?.reset(newStory.scenarios || []);
    isSyncingFromFirestore.current = false;
    setUniverseState(newStory);
    setStoryReadOnlyState(false);
    setIsDirty(false);

    setStoryCatalog(prev => {
      const updated = [newStory, ...prev.filter(s => s.id !== newId)];
      StorageService.setItem('tangent_story_catalog', updated);
      return updated;
    });

    if (currentUser) {
      setDoc(doc(db, 'user_stories', newId), sanitizeFirestoreData(newStory)).catch(e => console.warn(e));
    }

    if (window.history.replaceState) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    showToast({ type: 'success', text: `Successfully cloned "${source.projectName}" to your ADE Studio catalog.` });
  }, [universeState, currentUser, setStoryReadOnlyState]);

  // Actual Cloud Persistence Worker
  const executeCloudSave = useCallback(async (stateToSave) => {
    if (isStoryReadOnlyRef.current) return false;
    if (!stateToSave?.id) return false;
    if (stateToSave.ownerId && stateToSave.ownerId !== 'local' && currentUser && stateToSave.ownerId !== currentUser.uid) {
      return false;
    }
    if (!currentUser) {
      setCloudSyncStatus('offline');
      setSaveStatus('offline');
      return false;
    }

    setSaveStatus('saving');
    setCloudSyncStatus('syncing');
    setSaveError(null);

    try {
      const currentProjectId = stateToSave.id || 'proj_default_universe';
      const savedUpdatedAt = stateToSave.updatedAt || new Date().toISOString();
      const payload = {
        ...stateToSave,
        id: currentProjectId,
        updatedAt: savedUpdatedAt
      };
      const payloadWithOwner = { ...payload, ownerId: currentUser.uid };

      // Set the ref so the onSnapshot echo check passes when this timestamp broadcasts
      lastSyncedCloudUpdatedAtRef.current = payload.updatedAt;

      const userStoryDoc = doc(db, 'user_stories', currentProjectId);

      await Promise.all([
        setDoc(userStoryDoc, sanitizeFirestoreData(payloadWithOwner), { merge: true }),
        saveAllElementsIndependently(stateToSave.scenarios, currentUser),
        saveAllMapsIndependently(stateToSave.maps, currentUser)
      ]);

      lastSyncedCloudUpdatedAtRef.current = payload.updatedAt;
      setSaveStatus('saved');
      setCloudSyncStatus('synced');
      const now = Date.now();
      setLastSavedTimestamp(now);
      setLastCloudSavedAt(new Date(now).toLocaleTimeString());

      // Only mark clean if no newer debounced saves were queued while this save was executing
      if (!debouncedSaveRef.current?.isPending()) {
        setIsDirty(false);
      }
    } catch (err) {
      console.error('[CampaignContext] Cloud save failure:', err);
      setSaveStatus('error');
      setCloudSyncStatus('error');
      setSaveError(err.message || 'Failed to sync with cloud.');
      throw err;
    }
  }, [currentUser, saveAllElementsIndependently, saveAllMapsIndependently]);

  // Instantiate Debounced Saver Instance (1500ms delay)
  const debouncedSaveRef = useRef(null);
  useEffect(() => {
    debouncedSaveRef.current = createDebouncedSaver(executeCloudSave, 1500);
    return () => {
      debouncedSaveRef.current?.cancel();
    };
  }, [executeCloudSave]);

  // Trigger Save helper for external components
  const triggerSave = useCallback((overrideImmediate = false) => {
    if (isStoryReadOnlyRef.current || !universeStateRef.current?.id) return Promise.resolve();
    setSaveStatus('unsaved');
    setIsDirty(true);

    if (overrideImmediate) {
      return debouncedSaveRef.current?.flush();
    } else {
      return debouncedSaveRef.current?.(universeStateRef.current);
    }
  }, []);

  // Force Save helper for explicit button clicks
  const forceSaveNow = useCallback(async () => {
    if (isStoryReadOnlyRef.current) return false;
    if (debouncedSaveRef.current?.isPending()) {
      return await debouncedSaveRef.current.flush();
    } else if (universeStateRef.current) {
      return await executeCloudSave(universeStateRef.current);
    }
  }, [executeCloudSave]);

  // Auto-persist active universe state: StorageService immediately, Firestore debounced (1500ms)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isSyncingFromFirestore.current) {
      isSyncingFromFirestore.current = false;
      return;
    }

    if (isStoryReadOnly) return; // Prevent auto-save when viewing a read-only public story

    // Pause auto-save writes if a conflict is currently active
    if (syncConflict) {
      return;
    }

    const currentProjectId = universeState.id || 'proj_default_universe';
    unmarkStoryIdDeleted(currentProjectId);
    const updatedState = {
      ...universeState,
      id: currentProjectId,
      updatedAt: new Date().toISOString()
    };

    // Mirror to StorageService cache immediately
    StorageService.setItem('tangent_universe_state', updatedState);

    // Update story catalog entry locally immediately
    setStoryCatalog(prev => {
      const exists = prev.some(s => s.id === currentProjectId);
      const updatedCatalog = exists
        ? prev.map(s => s.id === currentProjectId ? updatedState : s)
        : [...prev, updatedState];
      storyCatalogRef.current = updatedCatalog;
      StorageService.setItem('tangent_story_catalog', updatedCatalog);
      return updatedCatalog;
    });

    // Only queue debounced write if user is authenticated
    if (!currentUser) {
      setCloudSyncStatus('offline');
      setSaveStatus('offline');
      return;
    }

    setSaveStatus('unsaved');
    setIsDirty(true);
    debouncedSaveRef.current?.(updatedState);
  }, [universeState, isStoryReadOnly, currentUser, syncConflict]);

  // Lifecycle Listener for Window Unload / Route Exit
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (debouncedSaveRef.current?.isPending()) {
        debouncedSaveRef.current.flush();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      debouncedSaveRef.current?.flush();
    };
  }, []);

  // Manual Push to Cloud DB — declared before triggerStorySave to avoid stale closure
  const pushUniverseToCloud = useCallback(async (options = {}) => {
    if (isStoryReadOnlyRef.current) return false;
    if (!currentUser) {
      if (options.showSuccessAlert !== false) showToast({ type: 'warning', text: "Please login to push data to Cloud DB." });
      return false;
    }
    try {
      setCloudSyncStatus('syncing');
      setSaveStatus('saving');
      const currentProjectId = universeStateRef.current?.id || 'proj_default_universe';
      const userStoryDoc = doc(db, 'user_stories', currentProjectId);

      // Pre-push conflict check: Fetch current cloud document's updatedAt timestamp
      if (!options.force) {
        const snap = await getDoc(userStoryDoc);
        if (snap.exists()) {
          const cloudData = snap.data();
          const cloudUpdatedAt = cloudData.updatedAt;

          // If cloud document is newer than local base timestamp, trigger conflict resolution
          if (cloudUpdatedAt && lastSyncedCloudUpdatedAtRef.current) {
            const cloudTime = new Date(cloudUpdatedAt).getTime();
            const localBaseTime = new Date(lastSyncedCloudUpdatedAtRef.current).getTime();

            if (cloudTime > localBaseTime) {
              const conflictInfo = {
                type: 'push_conflict',
                cloudData,
                localData: universeStateRef.current,
                cloudUpdatedAt,
                localUpdatedAt: universeStateRef.current?.updatedAt || new Date().toISOString()
              };
              setSyncConflict(conflictInfo);
              setCloudSyncStatus('conflict');
              setSaveStatus('unsaved');
              return false;
            }
          }
        }
      }

      const updatedTime = new Date().toISOString();
      const currentState = universeStateRef.current;
      const updatedState = {
        ...currentState,
        id: currentProjectId,
        updatedAt: updatedTime
      };
      const payloadWithOwner = { ...updatedState, ownerId: currentUser.uid };

      await Promise.all([
        setDoc(userStoryDoc, sanitizeFirestoreData(payloadWithOwner), { merge: true }),
        saveAllElementsIndependently(currentState.scenarios, currentUser),
        saveAllMapsIndependently(currentState.maps, currentUser)
      ]);

      lastSyncedCloudUpdatedAtRef.current = updatedTime;
      setSyncConflict(null);
      setSaveStatus('saved');
      setCloudSyncStatus('synced');
      setIsDirty(false);
      const now = Date.now();
      setLastSavedTimestamp(now);
      setLastCloudSavedAt(new Date(now).toLocaleTimeString());
      if (options.showSuccessAlert !== false) {
        showToast({ type: 'success', text: "Story project successfully pushed to Cloud DB." });
      }
      return true;
    } catch (err) {
      console.error("Failed to push to Cloud DB:", err);
      setSaveStatus('error');
      setCloudSyncStatus('error');
      setSaveError(err.message || 'Failed to push to Cloud DB');
      showToast({ type: 'error', text: `Cloud DB Push failed: ${err.message}` });
      return false;
    }
  }, [currentUser, saveAllElementsIndependently, saveAllMapsIndependently]);

  const triggerStorySave = useCallback(() => {
    if (isStoryReadOnlyRef.current) return;
    if (debouncedSaveRef.current?.isPending()) {
      debouncedSaveRef.current.flush();
    } else if (isDirtyRef.current) {
      pushUniverseToCloud({ showSuccessAlert: false, force: false });
    }
  }, [pushUniverseToCloud]);

  // Manual Pull from Cloud DB
  const pullUniverseFromCloud = async () => {
    if (!currentUser) {
      showToast({ type: 'warning', text: "Please login to pull data from Cloud DB." });
      return false;
    }
    try {
      setCloudSyncStatus('syncing');
      const currentProjectId = universeStateRef.current?.id || 'proj_default_universe';
      const userStoryDoc = doc(db, 'user_stories', currentProjectId);
      const snap = await getDoc(userStoryDoc);
      if (snap.exists()) {
        const firestoreData = snap.data();
        debouncedSaveRef.current?.cancel();
        treeHistoryRef.current?.reset(firestoreData.scenarios || []);
        isSyncingFromFirestore.current = true;
        lastSyncedCloudUpdatedAtRef.current = firestoreData.updatedAt || new Date().toISOString();
        setUniverseState(firestoreData);
        setSyncConflict(null);
        setIsDirty(false);
        setCloudSyncStatus('synced');
        setLastCloudSavedAt(new Date().toLocaleTimeString());
        showToast({ type: 'success', text: "Story project successfully pulled from Cloud DB." });
        return true;
      } else {
        showToast({ type: 'warning', text: "No Cloud DB document found for this story project." });
        setCloudSyncStatus('synced');
        return false;
      }
    } catch (err) {
      console.error("Failed to pull from Cloud DB:", err);
      setCloudSyncStatus('error');
      showToast({ type: 'error', text: `Cloud DB Pull failed: ${err.message}` });
      return false;
    }
  };

  // Conflict Resolution Handlers
  const resolveConflictOverwrite = async () => {
    return await pushUniverseToCloud({ force: true, showSuccessAlert: true });
  };

  const resolveConflictPull = async () => {
    return await pullUniverseFromCloud();
  };

  const resolveConflictCancel = () => {
    setSyncConflict(null);
    setCloudSyncStatus('offline');
  };

  // Save individual Story Element to Cloud DB collection ('story_elements')
  const saveElementToCloud = async (elementNode) => {
    if (!currentUser) {
      showToast({ type: 'warning', text: "Please login to save elements to Cloud DB." });
      return false;
    }
    if (!elementNode || !elementNode.id) return false;
    if (
      elementNode.authorUid &&
      elementNode.authorUid !== 'local' &&
      elementNode.authorUid !== currentUser.uid &&
      elementNode.creatorId !== currentUser.uid
    ) {
      return false;
    }
    try {
      setCloudSyncStatus('syncing');
      const taggedNode = attachCreatorTag(elementNode, localStorage.getItem('userHandle'), currentUser);
      const payload = {
        ...taggedNode,
        updatedAt: new Date().toISOString(),
        authorHandle: getEffectiveUserHandle(currentUser),
        authorUid: currentUser.uid,
        creatorId: taggedNode.creatorId || currentUser.uid
      };
      await setDoc(doc(db, 'story_elements', elementNode.id), sanitizeFirestoreData(payload));
      setCloudSyncStatus('synced');
      showToast({ type: 'success', text: `Story Element "${elementNode.title || 'Untitled'}" saved to Cloud DB collection.` });
      return true;
    } catch (err) {
      console.error("Save element to Cloud DB failed:", err);
      setCloudSyncStatus('error');
      showToast({ type: 'error', text: `Failed to save element to Cloud DB: ${err.message}` });
      return false;
    }
  };

  // Fetch all Cloud DB Story Elements from collection ('story_elements')
  const loadElementsFromCloud = async () => {
    if (!currentUser) {
      showToast({ type: 'warning', text: "Please login to access Cloud DB elements library." });
      return [];
    }
    try {
      setCloudSyncStatus('syncing');
      const colQuery = query(collection(db, 'story_elements'), where('authorUid', '==', currentUser.uid));
      const snap = await getDocs(colQuery);
      const elements = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setCloudSyncStatus('synced');
      return elements;
    } catch (err) {
      console.error("Failed to load elements from Cloud DB:", err);
      setCloudSyncStatus('error');
      showToast({ type: 'error', text: `Failed to fetch Cloud DB elements: ${err.message}` });
      return [];
    }
  };

  const handleClearUniverse = async () => {
    if (isStoryReadOnlyRef.current) return false;
    const currentProjectId = universeStateRef.current?.id || 'proj_default_universe';
    debouncedSaveRef.current?.cancel();
    treeHistoryRef.current?.reset(DEFAULT_UNIVERSE_STATE.scenarios || []);
    await StorageService.removeItem('tangent_universe_state');
    setUniverseState(DEFAULT_UNIVERSE_STATE);
    setActiveScenarioId(null);
    setActiveMapId(null);
    setIsDirty(false);
    // Reset Firestore story document if authenticated
    if (currentUser) {
      try {
        const docRef = doc(db, 'user_stories', currentProjectId);
        const payloadWithOwner = { ...DEFAULT_UNIVERSE_STATE, id: currentProjectId, ownerId: currentUser.uid, updatedAt: new Date().toISOString() };
        await setDoc(docRef, sanitizeFirestoreData(payloadWithOwner));
      } catch (err) {
        console.warn('Firestore universe clear failed:', err.message);
      }
    }
    return true;
  };

  // Master Unified Save/Load logic
  const handleSaveLocal = () => {
    const unifiedProject = {
      type: "TangentUniverse",
      version: "2.0",
      data: universeState
    };
    
    const dataStr = JSON.stringify(unifiedProject, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(universeState.projectName, 'universe', 'json');
    a.click();
    URL.revokeObjectURL(url);
    setIsDirty(false);
  };

  const handleLoadLocal = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.type === "TangentUniverse" || data.type === "TangentStory" || data.type === "TangentCampaign" || data.type === "TangentStoryProject") {
          const loadedData = data.data || data;
          const loadedStories = loadedData.scenarios || loadedData.stories || [];
          const projectTitle = loadedData.projectName || 'Tangent Universe';
          const custom = loadedData.customAssets || {};
          const nextUniverse = {
            id: loadedData.id || `proj_${Date.now()}`,
            projectName: projectTitle,
            description: loadedData.description || '',
            scenarios: loadedStories,
            maps: loadedData.maps || [],
            customAssets: {
              terrains: Array.isArray(custom.terrains) ? custom.terrains : [],
              objects: Array.isArray(custom.objects) ? custom.objects : [],
              chunks: Array.isArray(custom.chunks) ? custom.chunks : []
            },
            creativeState: loadedData.creativeState || {
              gems: [],
              storyCards: [],
              storyOutline: '',
              sceneBeats: '',
              storyDraft: '',
              linkedElements: []
            },
            cronicle: loadedData.cronicle || createDefaultCronicleState(projectTitle),
            galleryModifiers: Array.isArray(loadedData.galleryModifiers) ? loadedData.galleryModifiers : [],
            scripts: Array.isArray(loadedData.scripts) ? loadedData.scripts : [],
            isPublic: Boolean(loadedData.isPublic),
            updatedAt: loadedData.updatedAt || new Date().toISOString()
          };
          debouncedSaveRef.current?.cancel();
          treeHistoryRef.current?.reset(loadedStories);
          setUniverseState(nextUniverse);
          setStoryReadOnlyState(false);
          if (loadedData.maps?.length > 0) setActiveMapId(loadedData.maps[0].id);
          if (loadedStories.length > 0) setActiveScenarioId(loadedStories[0].id);
          setIsDirty(false);
        } else {
          showToast({ type: 'error', text: "Invalid project file format." });
        }
      } catch (error) {
        console.error("Failed to load project:", error);
        showToast({ type: 'error', text: "Invalid project file." });
      }
    };
    reader.readAsText(file);
  };

  // Dedicated Story Save / Load
  const handleSaveStory = () => {
    const storyData = {
      type: "TangentStoryModule",
      version: "2.0",
      scenarios: universeState.scenarios
    };
    const dataStr = JSON.stringify(storyData, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(universeState.projectName, 'story', 'json');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadStory = (file) => {
    if (isStoryReadOnlyRef.current) return;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (isStoryReadOnlyRef.current) return;
      try {
        const data = JSON.parse(event.target.result);
        let loadedStories = [];
        if (data.type === "TangentStoryModule" || data.type === "TangentScenarioModule") {
          loadedStories = data.scenarios || data.stories || [];
        } else if (Array.isArray(data)) {
          loadedStories = data;
        } else if (data.scenarios || data.stories) {
          loadedStories = data.scenarios || data.stories;
        }

        if (loadedStories.length > 0) {
          treeHistoryRef.current?.reset(loadedStories);
          setUniverseState(prev => ({
            ...prev,
            scenarios: loadedStories
          }));
          setActiveScenarioId(loadedStories[0].id);
        } else {
          showToast({ type: 'warning', text: "No stories found in file." });
        }
      } catch (error) {
        console.error("Failed to load story file:", error);
        showToast({ type: 'error', text: "Invalid story file." });
      }
    };
    reader.readAsText(file);
  };

  // Dedicated Map Save / Load
  const handleSaveActiveMap = () => {
    const currentMap = universeState.maps.find(m => m.id === activeMapId);
    if (!currentMap) return showToast({ type: 'warning', text: "No active map to save!" });
    
    const mapData = {
      type: "TangentMap",
      version: "2.0",
      map: currentMap
    };
    const dataStr = JSON.stringify(mapData, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(currentMap.title, 'map', 'json');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadMap = (file) => {
    if (isStoryReadOnlyRef.current) return;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (isStoryReadOnlyRef.current) return;
      try {
        const data = JSON.parse(event.target.result);
        let mapToLoad = null;
        
        if (data.type === "TangentMap" && data.map) {
          mapToLoad = data.map;
        } else if (data.id && data.title) {
          mapToLoad = data;
        }

        if (mapToLoad) {
          setUniverseState(prev => {
            const exists = prev.maps.some(m => m.id === mapToLoad.id);
            const updatedMaps = exists
              ? prev.maps.map(m => m.id === mapToLoad.id ? mapToLoad : m)
              : [...prev.maps, mapToLoad];
            return {
              ...prev,
              maps: updatedMaps
            };
          });
          setActiveMapId(mapToLoad.id);
        } else {
          showToast({ type: 'error', text: "Invalid map file format." });
        }
      } catch (error) {
        console.error("Failed to load map file:", error);
        showToast({ type: 'error', text: "Invalid map file." });
      }
    };
    reader.readAsText(file);
  };

  // Helpers for Scenarios
  const addScenario = (rawScenario, parentId = null) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    const newScenario = attachCreatorTag(rawScenario, localStorage.getItem('userHandle'), currentUser);
    setIsDirty(true);
    setUniverseState(prev => {
      if (!parentId) {
        return {
          ...prev,
          scenarios: [...prev.scenarios, newScenario]
        };
      }
      const insertRecursive = (nodes) => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), newScenario]
            };
          }
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: insertRecursive(node.children)
            };
          }
          return node;
        });
      };
      return {
        ...prev,
        scenarios: insertRecursive(prev.scenarios)
      };
    });
    setActiveScenarioId(newScenario.id);
  };

  const updateScenario = (id, updates) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    setIsDirty(true);
    setUniverseState(prev => {
      const updateRecursive = (nodes) => {
        return nodes.map(node => {
          if (node.id === id) {
            return { ...node, ...updates };
          }
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: updateRecursive(node.children)
            };
          }
          return node;
        });
      };
      return {
        ...prev,
        scenarios: updateRecursive(prev.scenarios)
      };
    });
  };

  const deleteScenario = (id) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    setIsDirty(true);
    setUniverseState(prev => {
      const deleteRecursive = (nodes) => {
        return nodes
          .filter(node => node.id !== id)
          .map(node => ({
            ...node,
            children: node.children ? deleteRecursive(node.children) : []
          }));
      };
      return {
        ...prev,
        scenarios: deleteRecursive(prev.scenarios)
      };
    });
    if (activeScenarioId === id) {
      setActiveScenarioId(null);
    }
  };

  const treeHistoryRef = useRef(new TreeHistoryManager([]));

  // Sync tree history on first universeState load
  useEffect(() => {
    if (universeState?.scenarios && universeState.scenarios.length > 0) {
      if (treeHistoryRef.current.present.length === 0) {
        treeHistoryRef.current.reset(universeState.scenarios);
      }
    }
  }, [universeState?.scenarios]);

  const undoScenarioTree = () => {
    if (isStoryReadOnlyRef.current) return;
    if (!treeHistoryRef.current.canUndo) {
      showToast('No undo history available for scenario hierarchy.', 'info');
      return;
    }
    const previous = treeHistoryRef.current.undo();
    if (previous) {
      setUniverseState(prev => ({
        ...prev,
        scenarios: previous
      }));
      showToast('Undid scenario hierarchy change.', 'success');
    }
  };

  const redoScenarioTree = () => {
    if (isStoryReadOnlyRef.current) return;
    if (!treeHistoryRef.current.canRedo) {
      showToast('No redo history available for scenario hierarchy.', 'info');
      return;
    }
    const next = treeHistoryRef.current.redo();
    if (next) {
      setUniverseState(prev => ({
        ...prev,
        scenarios: next
      }));
      showToast('Redid scenario hierarchy change.', 'success');
    }
  };

  // Move scenario node to a new parent (or root if targetParentId is null)
  const moveScenario = (nodeId, targetParentId) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    if (nodeId === targetParentId) return;

    setUniverseState(prev => {
      treeHistoryRef.current.push(prev.scenarios);
      const updated = moveNodeInTree(prev.scenarios, nodeId, targetParentId);
      return {
        ...prev,
        scenarios: updated
      };
    });
  };

  // Reorder scenario node up or down among its siblings
  const reorderScenario = (nodeId, direction) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    setUniverseState(prev => {
      treeHistoryRef.current.push(prev.scenarios);
      const updated = reorderNodeSiblings(prev.scenarios, nodeId, direction);
      return {
        ...prev,
        scenarios: updated
      };
    });
  };

  const reorderRelativeScenario = (draggedId, targetId, pos) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    setUniverseState(prev => {
      treeHistoryRef.current.push(prev.scenarios);
      const updated = reorderRelativeNode(prev.scenarios, draggedId, targetId, pos);
      return {
        ...prev,
        scenarios: updated
      };
    });
  };

  // Helpers for Maps
  const addMap = (rawMap) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    const newMap = attachCreatorTag(rawMap, localStorage.getItem('userHandle'), currentUser);
    setUniverseState(prev => {
      const existing = Array.isArray(prev.maps) ? prev.maps : [];
      if (newMap.id && existing.some(m => m.id === newMap.id)) {
        return prev;
      }
      return {
        ...prev,
        maps: [...existing, newMap]
      };
    });
    setActiveMapId(newMap.id);
  };

  const updateMap = (id, updates) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    const nowIso = new Date().toISOString();
    setUniverseState(prev => {
      const existingMaps = Array.isArray(prev.maps) ? prev.maps : [];
      const found = existingMaps.some(m => m.id === id);
      if (!found && updates && typeof updates === 'object') {
        const seedFromCatalog = mapsCatalogRef?.current?.find(m => m.id === id) || {};
        return {
          ...prev,
          maps: [...existingMaps, { ...seedFromCatalog, ...updates, id, updatedAt: nowIso }]
        };
      }
      return {
        ...prev,
        maps: existingMaps.map(m => {
          if (m.id !== id) return m;
          const resolved = typeof updates === 'function' ? updates(m) : updates;
          return {
            ...m,
            ...(resolved || {}),
            updatedAt: nowIso
          };
        })
      };
    });
  };

  const deleteMap = (id) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    setUniverseState(prev => ({
      ...prev,
      maps: prev.maps.filter(m => m.id !== id)
    }));
    setActiveMapId(prev => (prev === id ? null : prev));
  };

  const addCustomTerrain = (terrain) => {
    if (isStoryReadOnly) return;
    const taggedTerrain = attachCreatorTag(terrain, localStorage.getItem('userHandle'), currentUser);
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [] };
      return {
        ...prev,
        customAssets: {
          ...custom,
          terrains: [...custom.terrains, { ...taggedTerrain, isCustom: true }]
        }
      };
    });
  };

  const updateCustomTerrain = (terrainId, updates) => {
    if (isStoryReadOnly) return;
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [] };
      return {
        ...prev,
        customAssets: {
          ...custom,
          terrains: custom.terrains.map(t => t.id === terrainId ? { ...t, ...updates } : t)
        }
      };
    });
  };

  const deleteCustomTerrain = (terrainId) => {
    if (isStoryReadOnly) return;
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [] };
      return {
        ...prev,
        customAssets: {
          ...custom,
          terrains: custom.terrains.filter(t => t.id !== terrainId)
        }
      };
    });
  };

  const addCustomObject = (obj) => {
    if (isStoryReadOnly) return;
    const taggedObj = attachCreatorTag(obj, localStorage.getItem('userHandle'), currentUser);
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [] };
      return {
        ...prev,
        customAssets: {
          ...custom,
          objects: [...custom.objects, { ...taggedObj, isCustom: true }]
        }
      };
    });
  };

  const updateCustomObject = (objectId, updates) => {
    if (isStoryReadOnly) return;
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [] };
      return {
        ...prev,
        customAssets: {
          ...custom,
          objects: custom.objects.map(o => o.id === objectId ? { ...o, ...updates } : o)
        }
      };
    });
  };

  const deleteCustomObject = (objectId) => {
    if (isStoryReadOnly) return;
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [] };
      return {
        ...prev,
        customAssets: {
          ...custom,
          objects: custom.objects.filter(o => o.id !== objectId)
        }
      };
    });
  };

  const addCustomChunk = (chunk) => {
    if (isStoryReadOnly) return;
    const taggedChunk = attachCreatorTag(chunk, localStorage.getItem('userHandle'), currentUser);
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [], chunks: [] };
      const existingChunks = custom.chunks || [];
      return {
        ...prev,
        customAssets: {
          ...custom,
          chunks: [...existingChunks, { ...taggedChunk, isCustom: true }]
        }
      };
    });
  };

  const updateCustomChunk = (chunkId, updates) => {
    if (isStoryReadOnly) return;
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [], chunks: [] };
      const existingChunks = custom.chunks || [];
      return {
        ...prev,
        customAssets: {
          ...custom,
          chunks: existingChunks.map(c => (c.chunkId === chunkId || c.id === chunkId) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
        }
      };
    });
  };

  const deleteCustomChunk = (chunkId) => {
    if (isStoryReadOnly) return;
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [], chunks: [] };
      const existingChunks = custom.chunks || [];
      return {
        ...prev,
        customAssets: {
          ...custom,
          chunks: existingChunks.filter(c => c.chunkId !== chunkId && c.id !== chunkId)
        }
      };
    });
  };

  const updateCreativeState = (updates) => {
    if (isStoryReadOnly) return;
    setIsDirty(true);
    setUniverseState(prev => ({
      ...prev,
      creativeState: {
        ...(prev.creativeState || { gems: [], storyCards: [], storyOutline: '', sceneBeats: '', storyDraft: '', linkedElements: [] }),
        ...updates
      }
    }));
  };

  const updateGems = (gems) => updateCreativeState({ gems });
  const updateStoryCards = (storyCards) => updateCreativeState({ storyCards });
  const updateOutline = (storyOutline) => updateCreativeState({ storyOutline });
  const updateSceneBeats = (sceneBeats) => updateCreativeState({ sceneBeats });
  const updateDraft = (storyDraft) => updateCreativeState({ storyDraft });
  const updateLinkedElements = (linkedElements) => updateCreativeState({ linkedElements });
  const getActiveGemsText = () => {
    return universeState?.creativeState?.gems?.join(', ') || '';
  };

  const updateProjectName = (name) => {
    if (isStoryReadOnly) return;
    setIsDirty(true);
    setUniverseState(prev => ({
      ...prev,
      projectName: name
    }));
  };

  const updateUniverseMetadata = (patch) => {
    if (isStoryReadOnly || !patch || typeof patch !== 'object') return;
    setIsDirty(true);
    setUniverseState(prev => ({
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString()
    }));
  };

  // ── CRONICLE PERSISTENT MEMORY STATE MANAGEMENT ──
  const cronicle = universeState?.cronicle || createDefaultCronicleState(universeState?.projectName);

  const updateCronicle = (updates) => {
    if (isStoryReadOnly) return;
    setIsDirty(true);
    setUniverseState(prev => {
      const currentCronicle = prev.cronicle || createDefaultCronicleState(prev.projectName);
      return {
        ...prev,
        cronicle: {
          ...currentCronicle,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  const updateWorkingMemory = (wmUpdates) => {
    if (isStoryReadOnly) return;
    setIsDirty(true);
    setUniverseState(prev => {
      const currentCronicle = prev.cronicle || createDefaultCronicleState(prev.projectName);
      return {
        ...prev,
        cronicle: {
          ...currentCronicle,
          workingMemory: {
            ...(currentCronicle.workingMemory || {}),
            ...wmUpdates
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  const applyCronicleDeltaAction = (delta) => {
    if (isStoryReadOnly) return;
    setIsDirty(true);
    setUniverseState(prev => {
      const currentCronicle = prev.cronicle || createDefaultCronicleState(prev.projectName);
      const nextCronicle = applyCronicleDelta(currentCronicle, delta);
      return {
        ...prev,
        cronicle: nextCronicle
      };
    });
  };

  const stageCronicleDeltas = (newDeltas) => {
    if (isStoryReadOnly) return;
    if (!Array.isArray(newDeltas) || newDeltas.length === 0) return;
    setIsDirty(true);
    setUniverseState(prev => {
      const currentCronicle = prev.cronicle || createDefaultCronicleState(prev.projectName);
      const existing = currentCronicle.pendingDeltas || [];
      return {
        ...prev,
        cronicle: {
          ...currentCronicle,
          pendingDeltas: [...existing, ...newDeltas],
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  const stageCronicleDeltasRef = useRef(stageCronicleDeltas);
  stageCronicleDeltasRef.current = stageCronicleDeltas;

  useEffect(() => {
    const cleanup = initCronicleVttBridge({
      stageCronicleDeltas: (deltas) => stageCronicleDeltasRef.current(deltas),
      onDeltaStaged: (delta) => {
        showToast(`⚡ CRONICLE Delta Proposed: ${delta.explanation || delta.action}`);
      }
    });
    return cleanup;
  }, []);

  const acceptPendingDelta = (deltaId) => {
    if (isStoryReadOnly) return;
    setIsDirty(true);
    setUniverseState(prev => {
      const currentCronicle = prev.cronicle || createDefaultCronicleState(prev.projectName);
      const targetDelta = (currentCronicle.pendingDeltas || []).find(d => d.id === deltaId);
      if (!targetDelta) return prev;
      const nextCronicle = applyCronicleDelta(currentCronicle, targetDelta);
      return {
        ...prev,
        cronicle: nextCronicle
      };
    });
  };

  const acceptAllPendingDeltas = () => {
    if (isStoryReadOnly) return;
    setIsDirty(true);
    setUniverseState(prev => {
      const currentCronicle = prev.cronicle || createDefaultCronicleState(prev.projectName);
      const deltas = currentCronicle.pendingDeltas || [];
      if (deltas.length === 0) return prev;
      const nextCronicle = applyBatchDeltas(currentCronicle, deltas);
      return {
        ...prev,
        cronicle: {
          ...nextCronicle,
          pendingDeltas: []
        }
      };
    });
  };

  const rejectPendingDelta = (deltaId) => {
    if (isStoryReadOnly) return;
    setIsDirty(true);
    setUniverseState(prev => {
      const currentCronicle = prev.cronicle || createDefaultCronicleState(prev.projectName);
      return {
        ...prev,
        cronicle: {
          ...currentCronicle,
          pendingDeltas: (currentCronicle.pendingDeltas || []).filter(d => d.id !== deltaId),
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  const clearPendingDeltas = () => {
    if (isStoryReadOnly) return;
    setIsDirty(true);
    setUniverseState(prev => {
      const currentCronicle = prev.cronicle || createDefaultCronicleState(prev.projectName);
      return {
        ...prev,
        cronicle: {
          ...currentCronicle,
          pendingDeltas: [],
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  const cloneElementToCronicle = (element) => {
    if (isStoryReadOnly || !element) return;
    setIsDirty(true);
    setUniverseState(prev => {
      const currentCronicle = prev.cronicle || createDefaultCronicleState(prev.projectName);
      const copy = cloneToWorkingCopy(element, prev.projectName);
      if (!copy) return prev;

      const personas = { ...(currentCronicle.personas || {}) };
      const locations = { ...(currentCronicle.locations || {}) };
      const workingCopies = { ...(currentCronicle.workingCopies || {}) };

      workingCopies[copy.id] = copy;
      if (copy.personaState) {
        personas[copy.id] = copy.personaState;
      }
      if (copy.locationState) {
        locations[copy.id] = copy.locationState;
      }

      return {
        ...prev,
        cronicle: {
          ...currentCronicle,
          personas,
          locations,
          workingCopies,
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  // Story Project Catalog Lifecycle Helpers
  const createNewStory = (name, description = '') => {
    const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    unmarkStoryIdDeleted(newId);
    const overviewElem = attachCreatorTag({
      id: `elem_${Date.now()}_1`,
      title: `${name || 'Story'} Overview`,
      type: 'Scenario',
      content: '<p>Welcome to your new story project. Add elements to build your narrative universe.</p>',
      children: []
    }, localStorage.getItem('userHandle'), currentUser);

    const rawStory = {
      id: newId,
      projectName: name || 'Untitled Story Project',
      description: description || '',
      scenarios: [overviewElem],
      maps: [],
      customAssets: { terrains: [], objects: [], chunks: [] },
      cronicle: createDefaultCronicleState(name || 'Untitled Story Project'),
      updatedAt: new Date().toISOString()
    };
    const newStory = attachCreatorTag(rawStory, localStorage.getItem('userHandle'), currentUser);

    debouncedSaveRef.current?.cancel();
    treeHistoryRef.current?.reset([overviewElem]);
    isSyncingFromFirestore.current = true;
    lastSyncedCloudUpdatedAtRef.current = newStory.updatedAt;
    universeStateRef.current = newStory;
    setUniverseState(newStory);
    setStoryReadOnlyState(false);
    StorageService.setItem('tangent_universe_state', newStory);
    setActiveScenarioId(overviewElem.id);
    setActiveMapId(null);
    setIsDirty(false);
    setSyncConflict(null);

    setStoryCatalog(prev => {
      const updated = [newStory, ...prev.filter(s => s.id !== newId)];
      storyCatalogRef.current = updated;
      StorageService.setItem('tangent_story_catalog', updated);
      return updated;
    });

    if (currentUser) {
      const payloadWithOwner = { ...newStory, ownerId: currentUser.uid };
      setDoc(doc(db, 'user_stories', newId), sanitizeFirestoreData(payloadWithOwner)).catch(e => console.warn(e));
    }
    return newStory;
  };

  const openStory = useCallback((storyId) => {
    const currentCatalog = Array.isArray(storyCatalogRef.current) ? storyCatalogRef.current : storyCatalog;
    const target = currentCatalog.find(s => s.id === storyId) || publicStoryCatalog.find(s => s.id === storyId);
    if (target) {
      const user = currentUserRef.current;
      const isLocalDoc = !target.ownerId || target.ownerId === 'local';
      const isOwner = user ? (isLocalDoc || target.ownerId === user.uid) : isLocalDoc;
      debouncedSaveRef.current?.cancel();
      treeHistoryRef.current?.reset(target.scenarios || []);
      isSyncingFromFirestore.current = true;
      lastSyncedCloudUpdatedAtRef.current = target.updatedAt || null;
      universeStateRef.current = target;
      setUniverseState(target);
      StorageService.setItem('tangent_universe_state', target);
      setIsDirty(false);
      setSyncConflict(null);
      setStoryReadOnlyState(!isOwner);
      if (target.scenarios?.length > 0) {
        setActiveScenarioId(target.scenarios[0].id);
      } else {
        setActiveScenarioId(null);
      }
      if (target.maps?.length > 0) {
        setActiveMapId(target.maps[0].id);
      } else {
        setActiveMapId(null);
      }
      return true;
    }
    return false;
  }, [publicStoryCatalog, storyCatalog, setStoryReadOnlyState]);

  const closeStory = () => {
    if (isStoryReadOnlyRef.current) return true;
    // Perform final backup save of current working story
    if (universeState && universeState.scenarios) {
      saveAllElementsIndependently(universeState.scenarios, currentUser);
      saveAllMapsIndependently(universeState.maps, currentUser);
    }
    return true;
  };

  const deleteStoryProject = async (storyId) => {
    if (!storyId) return false;
    const currentCatalog = Array.isArray(storyCatalogRef.current) ? storyCatalogRef.current : storyCatalog;
    const target = currentCatalog.find(s => s.id === storyId) || publicStoryCatalog.find(s => s.id === storyId);
    const user = currentUserRef.current;
    if (target?.ownerId && target.ownerId !== 'local' && (!user || target.ownerId !== user.uid)) {
      showToast({ type: 'warning', text: 'Only the story owner can delete this project.' });
      return false;
    }

    // 1. Mark storyId as deleted so it won't resurrect from cache or cloud sync
    markStoryIdDeleted(storyId);

    const isDeletingActive = universeStateRef.current?.id === storyId;

    // 2. Cancel any pending debounced auto-save if deleting the currently active story
    if (isDeletingActive) {
      debouncedSaveRef.current?.cancel();
    }

    // 3. Remove from storyCatalog and handle active story fallback
    const remaining = currentCatalog.filter(s => s.id !== storyId);

    if (isDeletingActive) {
      if (remaining.length > 0) {
        const nextStory = remaining[0];
        const isNextLocal = !nextStory.ownerId || nextStory.ownerId === 'local';
        const isOwner = user ? (isNextLocal || nextStory.ownerId === user.uid) : isNextLocal;
        treeHistoryRef.current?.reset(nextStory.scenarios || []);
        isSyncingFromFirestore.current = true;
        lastSyncedCloudUpdatedAtRef.current = nextStory.updatedAt || null;
        universeStateRef.current = nextStory;
        setUniverseState(nextStory);
        StorageService.setItem('tangent_universe_state', nextStory);
        setIsDirty(false);
        setSyncConflict(null);
        setStoryReadOnlyState(!isOwner);
        setActiveScenarioId(nextStory.scenarios?.length > 0 ? nextStory.scenarios[0].id : null);
        setActiveMapId(nextStory.maps?.length > 0 ? nextStory.maps[0].id : null);
        storyCatalogRef.current = remaining;
        setStoryCatalog(remaining);
        StorageService.setItem('tangent_story_catalog', remaining);
      } else {
        const freshDefaultId = storyId === 'proj_default_universe'
          ? `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
          : 'proj_default_universe';
        unmarkStoryIdDeleted(freshDefaultId);
        const fallback = {
          ...DEFAULT_UNIVERSE_STATE,
          id: freshDefaultId,
          updatedAt: new Date().toISOString()
        };
        treeHistoryRef.current?.reset(fallback.scenarios || []);
        isSyncingFromFirestore.current = true;
        lastSyncedCloudUpdatedAtRef.current = fallback.updatedAt;
        universeStateRef.current = fallback;
        setUniverseState(fallback);
        StorageService.setItem('tangent_universe_state', fallback);
        setIsDirty(false);
        setSyncConflict(null);
        setStoryReadOnlyState(false);
        setActiveScenarioId(fallback.scenarios?.[0]?.id || null);
        setActiveMapId(null);
        storyCatalogRef.current = [fallback];
        setStoryCatalog([fallback]);
        StorageService.setItem('tangent_story_catalog', [fallback]);
      }

      if (typeof window !== 'undefined' && window.location.search.includes(storyId) && window.history.replaceState) {
        try {
          const url = new URL(window.location.href);
          if (url.searchParams.get('storyId') === storyId) {
            url.searchParams.delete('storyId');
            window.history.replaceState({}, '', url.pathname + url.search);
          }
        } catch {}
      }
    } else {
      storyCatalogRef.current = remaining;
      setStoryCatalog(remaining);
      StorageService.setItem('tangent_story_catalog', remaining);
    }

    // 4. Delete from Firestore user_stories collection
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'user_stories', storyId));
      } catch (e) {
        console.warn('Failed to delete story doc from Firestore:', e);
      }
    }
  };

  const deleteSavedMap = useCallback(async (mapId) => {
    const targetMap = (mapsCatalogRef.current || []).find(m => m.id === mapId);
    if (
      targetMap &&
      ((targetMap.authorUid && targetMap.authorUid !== 'local' && targetMap.authorUid !== currentUser?.uid) ||
        (targetMap.ownerId && targetMap.ownerId !== 'local' && targetMap.ownerId !== currentUser?.uid))
    ) {
      return false;
    }

    setMapsCatalog(prev => {
      const updated = prev.filter(m => m.id !== mapId);
      StorageService.setItem('tangent_maps_catalog', updated);
      return updated;
    });

    if (currentUser && db) {
      try {
        await deleteDoc(doc(db, 'story_maps', mapId));
      } catch (e) {
        console.warn('Failed to delete map from cloud:', e);
      }
      deleteDoc(doc(db, 'spectator_maps', mapId)).catch(() => {});
    }
    return true;
  }, [currentUser]);

  const publishSpectatorMap = useCallback(async (mapId, mapOverride = null) => {
    if (!mapId) return false;
    const localMaps = universeStateRef.current?.maps || [];
    const catalogMaps = mapsCatalogRef.current || [];
    const inLocalOnly = localMaps.some(m => m.id === mapId) && !catalogMaps.some(m => m.id === mapId);
    if (isStoryReadOnlyRef.current && inLocalOnly) {
      return false;
    }
    const targetMap = mapOverride || localMaps.find(m => m.id === mapId) || catalogMaps.find(m => m.id === mapId);
    if (!targetMap) return false;
    if (
      targetMap.authorUid &&
      targetMap.authorUid !== 'local' &&
      (!currentUser || targetMap.authorUid !== currentUser.uid)
    ) {
      return false;
    }

    const liveFlaggedMap = { ...targetMap, isSpectatorLive: true };
    if (localMaps.some(m => m.id === mapId) && !targetMap.isSpectatorLive && !isStoryReadOnlyRef.current) {
      setUniverseState(prev => ({
        ...prev,
        maps: (prev.maps || []).map(m => (m.id === mapId ? { ...m, isSpectatorLive: true } : m))
      }));
    }
    if (!catalogMaps.find(m => m.id === mapId)?.isSpectatorLive) {
      setMapsCatalog(prev => {
        const updated = prev.map(m => (m.id === mapId ? { ...m, isSpectatorLive: true } : m));
        StorageService.setItem('tangent_maps_catalog', updated);
        return updated;
      });
    }

    if (currentUser && db) {
      try {
        const sanitized = sanitizeMapForSpectator(liveFlaggedMap, currentUser);
        if (sanitized) {
          await setDoc(doc(db, 'spectator_maps', mapId), sanitizeFirestoreData(sanitized), { merge: true });
        }
        return true;
      } catch (err) {
        console.warn('Failed to publish sanitized spectator map:', err);
        return false;
      }
    }
    return true;
  }, [currentUser]);

  const lastSpectatorPublishSigRef = useRef(new Map());
  useEffect(() => {
    if (isStoryReadOnly || !currentUser || !db) return;
    const liveMaps = (universeState?.maps || []).filter(m => m?.id && m.isSpectatorLive);
    if (liveMaps.length === 0) return;

    const timer = setTimeout(() => {
      liveMaps.forEach((m) => {
        try {
          const sig = JSON.stringify({
            t: m.title,
            w: m.walls,
            o: m.objects,
            tok: m.tokens,
            ter: m.terrains,
            l: m.lights,
            f: m.fog,
            fe: m.fogEnabled,
            ln: m.lines,
            txt: m.texts,
            u: m.underlay,
            g: m.gridSize,
            gm: m.gridMode
          });
          if (lastSpectatorPublishSigRef.current.get(m.id) !== sig) {
            lastSpectatorPublishSigRef.current.set(m.id, sig);
            publishSpectatorMap(m.id, m);
          }
        } catch {
          // Ignore non-serializable map draft
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [universeState?.maps, isStoryReadOnly, currentUser, publishSpectatorMap]);

  const deleteSavedElement = useCallback(async (elementId) => {
    const targetEl = (elementsCatalogRef.current || []).find(e => e.id === elementId);
    if (
      targetEl &&
      targetEl.authorUid &&
      targetEl.authorUid !== 'local' &&
      (!currentUser || (targetEl.authorUid !== currentUser.uid && targetEl.creatorId !== currentUser.uid))
    ) {
      return false;
    }

    setElementsCatalog(prev => {
      const updated = prev.filter(e => e.id !== elementId);
      StorageService.setItem('tangent_elements_catalog', updated);
      return updated;
    });

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'story_elements', elementId));
      } catch (e) {
        console.warn('Failed to delete element from Firestore:', e);
      }
    }
    return true;
  }, [currentUser]);

  const updateSavedElement = async (elementId, updates) => {
    const existingElem = (elementsCatalogRef.current || []).find(e => e.id === elementId);
    if (
      existingElem &&
      existingElem.authorUid &&
      existingElem.authorUid !== 'local' &&
      (!currentUser || (existingElem.authorUid !== currentUser.uid && existingElem.creatorId !== currentUser.uid))
    ) {
      return null;
    }
    const taggedUpdates = attachCreatorTag(updates, localStorage.getItem('userHandle'), currentUser);
    const updatedElem = existingElem
      ? attachCreatorTag({
          ...existingElem,
          ...taggedUpdates,
          updatedAt: new Date().toISOString()
        }, localStorage.getItem('userHandle'), currentUser)
      : attachCreatorTag({
          id: elementId,
          ...taggedUpdates,
          updatedAt: new Date().toISOString(),
          authorHandle: currentUser ? getEffectiveUserHandle(currentUser) : 'Local User',
          authorUid: currentUser?.uid || 'local',
          creatorId: taggedUpdates.creatorId || currentUser?.uid || 'local'
        }, localStorage.getItem('userHandle'), currentUser);

    setElementsCatalog(prev => {
      const exists = prev.some(e => e.id === elementId);
      const updated = exists
        ? prev.map(e => (e.id === elementId ? updatedElem : e))
        : [updatedElem, ...prev];
      StorageService.setItem('tangent_elements_catalog', updated);
      return updated;
    });

    // If element exists in current working story, sync updates there too (unless read-only)
    if (!isStoryReadOnlyRef.current) {
      const containsId = (nodes) => {
        for (let n of nodes) {
          if (n.id === elementId) return true;
          if (n.children && containsId(n.children)) return true;
        }
        return false;
      };
      const hasMatchInCurrent = containsId(universeStateRef.current?.scenarios || []);
      if (hasMatchInCurrent) {
        setUniverseState(prev => {
          const updateTree = (nodes) => {
            return nodes.map(node => {
              if (node.id === elementId) {
                return { ...node, ...updates };
              }
              if (node.children && node.children.length > 0) {
                return { ...node, children: updateTree(node.children) };
              }
              return node;
            });
          };
          if (prev.scenarios && containsId(prev.scenarios)) {
            return { ...prev, scenarios: updateTree(prev.scenarios) };
          }
          return prev;
        });
        setIsDirty(true);
      }
    }

    if (currentUser && updatedElem) {
      try {
        await setDoc(doc(db, 'story_elements', elementId), sanitizeFirestoreData(updatedElem), { merge: true });
      } catch (e) {
        console.warn('Failed to update element in Firestore:', e);
      }
    }
    return updatedElem;
  };

  // Story Gallery Situational & Temporary Modifier Management
  const addGalleryModifier = (modifier) => {
    if (isStoryReadOnlyRef.current) return;
    setUniverseState(prev => {
      const current = prev.galleryModifiers || [];
      const updated = [...current, modifier];
      return { ...prev, galleryModifiers: updated, updatedAt: new Date().toISOString() };
    });
    setIsDirty(true);
  };

  const updateGalleryModifier = (modifierId, patch) => {
    if (isStoryReadOnlyRef.current) return;
    setUniverseState(prev => {
      const current = prev.galleryModifiers || [];
      const updated = current.map(m => (m.id === modifierId ? { ...m, ...patch } : m));
      return { ...prev, galleryModifiers: updated, updatedAt: new Date().toISOString() };
    });
    setIsDirty(true);
  };

  const deleteGalleryModifier = (modifierId) => {
    if (isStoryReadOnlyRef.current) return;
    setUniverseState(prev => {
      const current = prev.galleryModifiers || [];
      const updated = current.filter(m => m.id !== modifierId);
      return { ...prev, galleryModifiers: updated, updatedAt: new Date().toISOString() };
    });
    setIsDirty(true);
  };

  const toggleGalleryModifier = (modifierId) => {
    if (isStoryReadOnlyRef.current) return;
    setUniverseState(prev => {
      const current = prev.galleryModifiers || [];
      const updated = current.map(m => (m.id === modifierId ? { ...m, isActive: !m.isActive } : m));
      return { ...prev, galleryModifiers: updated, updatedAt: new Date().toISOString() };
    });
    setIsDirty(true);
  };

  const setGalleryModifiers = (modifiers) => {
    if (isStoryReadOnlyRef.current) return;
    setUniverseState(prev => ({
      ...prev,
      galleryModifiers: Array.isArray(modifiers) ? modifiers : [],
      updatedAt: new Date().toISOString()
    }));
    setIsDirty(true);
  };

  const value = useMemo(() => ({
    universeState,
    setUniverseState,
    galleryModifiers: universeState?.galleryModifiers || [],
    addGalleryModifier,
    updateGalleryModifier,
    deleteGalleryModifier,
    toggleGalleryModifier,
    setGalleryModifiers,
    storyCatalog,
    elementsCatalog,
    mapsCatalog,
    lastCloudSavedAt,
    isDirty,
    setIsDirty,
    confirmIfDirty,
    createNewStory,
    openStory,
    closeStory,
    deleteStoryProject,
    deleteSavedElement,
    updateSavedElement,
    enforceElementNames,
    saveAllElementsIndependently,
    saveAllMapsIndependently,
    deleteSavedMap,
    updateProjectName,
    updateUniverseMetadata,
    handleClearUniverse,
    updateCreativeState,
    updateGems,
    updateStoryCards,
    updateOutline,
    updateSceneBeats,
    updateDraft,
    updateLinkedElements,
    getActiveGemsText,
    cronicle,
    updateCronicle,
    updateWorkingMemory,
    applyCronicleDelta: applyCronicleDeltaAction,
    stageCronicleDeltas,
    acceptPendingDelta,
    acceptAllPendingDeltas,
    rejectPendingDelta,
    clearPendingDeltas,
    cloneElementToCronicle,
    cloudSyncStatus,
    syncConflict,
    setSyncConflict,
    resolveConflictOverwrite,
    resolveConflictPull,
    resolveConflictCancel,
    pushUniverseToCloud,
    pullUniverseFromCloud,
    saveElementToCloud,
    loadElementsFromCloud,
    activeScenarioId,
    setActiveScenarioId,
    activeMapId,
    setActiveMapId,
    handleSaveLocal,
    handleLoadLocal,
    triggerStorySave,
    handleSaveStory,
    handleLoadStory,
    handleSaveScenario: handleSaveStory,
    handleLoadScenario: handleLoadStory,
    handleSaveActiveMap,
    handleLoadMap,
    addStory: addScenario,
    addScenario,
    updateStory: updateScenario,
    updateScenario,
    deleteStory: deleteScenario,
    deleteScenario,
    moveStory: moveScenario,
    moveScenario,
    reorderStory: reorderScenario,
    reorderScenario,
    reorderRelativeScenario,
    undoScenarioTree,
    redoScenarioTree,
    canUndoScenarioTree: treeHistoryRef.current.canUndo,
    canRedoScenarioTree: treeHistoryRef.current.canRedo,
    addMap,
    updateMap,
    deleteMap,
    addCustomTerrain,
    updateCustomTerrain,
    deleteCustomTerrain,
    addCustomObject,
    updateCustomObject,
    deleteCustomObject,
    addCustomChunk,
    updateCustomChunk,
    deleteCustomChunk,
    isStoryReadOnly,
    setIsStoryReadOnly: setStoryReadOnlyState,
    publicStoryCatalog,
    toggleStoryVisibility,
    loadPublicStories,
    clonePublicStory,
    saveStatus,
    setSaveStatus,
    lastSavedTimestamp,
    saveError,
    triggerSave,
    forceSaveNow,
    publishSpectatorMap
  }), [
    universeState,
    storyCatalog,
    elementsCatalog,
    mapsCatalog,
    lastCloudSavedAt,
    isDirty,
    confirmIfDirty,
    openStory,
    deleteSavedElement,
    enforceElementNames,
    saveAllElementsIndependently,
    saveAllMapsIndependently,
    deleteSavedMap,
    cloudSyncStatus,
    syncConflict,
    pushUniverseToCloud,
    activeScenarioId,
    activeMapId,
    isStoryReadOnly,
    setStoryReadOnlyState,
    publicStoryCatalog,
    toggleStoryVisibility,
    loadPublicStories,
    clonePublicStory,
    saveStatus,
    lastSavedTimestamp,
    saveError,
    triggerSave,
    forceSaveNow,
    publishSpectatorMap,
    currentUser
  ]);

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};

export const CampaignProvider = StoryProvider;
