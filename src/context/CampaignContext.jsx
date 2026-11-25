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
import { offloadMapBinaryFields, offloadElementBinaryFields } from '../services/adeMediaStorageService';
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
import { sanitizeElementDocId } from '../utils/adeElementPersistence';
import { useAdeStore } from '../pages/Foundry/store/adeStore';
import {
  moveNodeInTree,
  reorderNodeSiblings,
  reorderRelativeNode,
  flattenTree,
  TreeHistoryManager
} from '../utils/scenarioTreeEngine.js';

const StoryContext = globalThis.__TANGENT_STORY_CONTEXT__ || (globalThis.__TANGENT_STORY_CONTEXT__ = createContext({}));
const StoryActionsContext = globalThis.__TANGENT_STORY_ACTIONS_CONTEXT__ || (globalThis.__TANGENT_STORY_ACTIONS_CONTEXT__ = createContext({}));

export const useStory = () => useContext(StoryContext) || {};
export const useCampaign = useStory;
export const useStoryActions = () => useContext(StoryActionsContext) || {};
export const useCampaignActions = useStoryActions;

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

export const LEGACY_DEFAULT_PROJECT_ID = 'proj_default_universe';

export const getDefaultProjectId = (user) =>
  (user?.uid ? `proj_default_${user.uid}` : LEGACY_DEFAULT_PROJECT_ID);

export const resolveProjectId = (rawId, user) => {
  const trimmed = typeof rawId === 'string' ? rawId.trim() : '';
  if (!trimmed || (trimmed === LEGACY_DEFAULT_PROJECT_ID && user?.uid)) {
    return getDefaultProjectId(user);
  }
  return trimmed;
};

const DEFAULT_UNIVERSE_STATE = {
  id: LEGACY_DEFAULT_PROJECT_ID,
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
  customTemplates: [],
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
        if (!parsed.id) parsed.id = LEGACY_DEFAULT_PROJECT_ID;
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

  // Independent Elements Library Catalog State (raw store; derived `elementsCatalog` below is project-scoped + public)
  const [allElementsCatalog, setAllElementsCatalog] = useState(() => {
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
  const [publicElementsCatalog, setPublicElementsCatalog] = useState([]);
  const allElementsCatalogRef = useRef(allElementsCatalog);
  allElementsCatalogRef.current = allElementsCatalog;
  const activeStoryScopeId = universeState?.id || null;
  const elementsCatalog = useMemo(() => {
    const merged = new Map();
    for (const el of allElementsCatalog || []) {
      if (!el || !el.id) continue;
      if (!el.storyId || el.storyId === activeStoryScopeId || el.isPublic === true) {
        merged.set(el.id, el);
      }
    }
    for (const pub of publicElementsCatalog || []) {
      if (pub && pub.id && pub.isPublic === true && !merged.has(pub.id)) {
        merged.set(pub.id, pub);
      }
    }
    return Array.from(merged.values());
  }, [allElementsCatalog, publicElementsCatalog, activeStoryScopeId]);

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
          const activeUser = currentUserRef.current;
          const resolvedId = resolveProjectId(cachedUniverse.id, activeUser);
          const normalizedCached =
            resolvedId !== cachedUniverse.id &&
            (!cachedUniverse.ownerId || cachedUniverse.ownerId === 'local' || cachedUniverse.ownerId === activeUser?.uid)
              ? { ...cachedUniverse, id: resolvedId, ...(activeUser?.uid ? { ownerId: activeUser.uid } : {}) }
              : cachedUniverse;
          isSyncingFromFirestore.current = true;
          if (normalizedCached.updatedAt) {
            lastSyncedCloudUpdatedAtRef.current = normalizedCached.updatedAt;
          }
          setUniverseState(prev => {
            if (
              !prev ||
              prev.id === LEGACY_DEFAULT_PROJECT_ID ||
              prev.id === getDefaultProjectId(activeUser) ||
              !prev.scenarios?.length
            ) {
              return normalizedCached;
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
          setAllElementsCatalog(cachedElements.map(e => (e && e.type ? { ...e, type: normalizeElementType(e.type) } : e)));
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
  const [isLocalOnlyPaused, setIsLocalOnlyPaused] = useState(false);

  const isDirtyRef = useRef(isDirty);
  const isStoryReadOnlyRef = useRef(isStoryReadOnly);
  const isLocalOnlyPausedRef = useRef(isLocalOnlyPaused);
  const lastAutoSaveErrorToastRef = useRef({ at: 0, msg: '' });
  const universeStateRef = useRef(universeState);
  const storyCatalogRef = useRef(storyCatalog);
  const mapsCatalogRef = useRef(mapsCatalog);
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    isDirtyRef.current = isDirty;
    isStoryReadOnlyRef.current = isStoryReadOnly;
    isLocalOnlyPausedRef.current = isLocalOnlyPaused;
    universeStateRef.current = universeState;
    storyCatalogRef.current = storyCatalog;
    mapsCatalogRef.current = mapsCatalog;
    currentUserRef.current = currentUser;
  }, [isDirty, isStoryReadOnly, isLocalOnlyPaused, universeState, storyCatalog, mapsCatalog, currentUser]);

  useEffect(() => {
    const scopeId = universeState?.id || 'default';
    try {
      useAdeStore.getState()?.setStoryScope?.(scopeId);
    } catch {}
  }, [universeState?.id]);

  const setLocalOnlyPausedState = useCallback((val) => {
    const resolved = Boolean(val);
    isLocalOnlyPausedRef.current = resolved;
    setIsLocalOnlyPaused(resolved);
  }, []);

  const setStoryReadOnlyState = useCallback((val) => {
    const resolved = typeof val === 'function' ? Boolean(val(isStoryReadOnlyRef.current)) : Boolean(val);
    isStoryReadOnlyRef.current = resolved;
    setIsStoryReadOnly(resolved);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setLocalOnlyPausedState(false);
        setCloudSyncStatus('offline');
        setSaveStatus('offline');
        return;
      }

      const targetDefaultId = getDefaultProjectId(user);
      const curr = universeStateRef.current;
      if (
        curr &&
        curr.id === LEGACY_DEFAULT_PROJECT_ID &&
        (!curr.ownerId || curr.ownerId === 'local' || curr.ownerId === user.uid)
      ) {
        const migrated = {
          ...curr,
          id: targetDefaultId,
          ownerId: user.uid
        };
        isSyncingFromFirestore.current = true;
        universeStateRef.current = migrated;
        setUniverseState(migrated);
        StorageService.setItem('tangent_universe_state', migrated);
      }

      setStoryCatalog((prev) => {
        if (!Array.isArray(prev)) return prev;
        let changed = false;
        const next = prev.map((entry) => {
          if (
            entry &&
            entry.id === LEGACY_DEFAULT_PROJECT_ID &&
            (!entry.ownerId || entry.ownerId === 'local' || entry.ownerId === user.uid)
          ) {
            changed = true;
            return { ...entry, id: targetDefaultId, ownerId: user.uid };
          }
          return entry;
        });
        if (changed) {
          storyCatalogRef.current = next;
          StorageService.setItem('tangent_story_catalog', next);
          return next;
        }
        return prev;
      });
    });
    return () => unsub();
  }, [setLocalOnlyPausedState]);

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
    let extractedElements = flattened.map(node => {
      const cleanTitle = (node.title && node.title.trim()) ? node.title.trim() : `Untitled ${node.type || 'Element'}`;
      return {
        ...node,
        title: cleanTitle,
        updatedAt: new Date().toISOString(),
        authorHandle: user ? getEffectiveUserHandle(user) : 'Local User',
        authorUid: user?.uid || 'local',
        creatorId: user?.uid || 'local',
        storyId: resolveProjectId(universeStateRef.current?.id, user)
      };
    });

    if (user && db) {
      extractedElements = await Promise.all(
        extractedElements.map(elem => offloadElementBinaryFields(elem, { userId: user.uid }))
      );
    }

    // Update local elements catalog state (merging/upserting by ID)
    setAllElementsCatalog(prev => {
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
      storyId: resolveProjectId(universeStateRef.current?.id, user)
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
        setAllElementsCatalog(prev => {
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
    if (activeStoryId === LEGACY_DEFAULT_PROJECT_ID && (!universeState?.ownerId || universeState.ownerId !== currentUser.uid)) {
      return;
    }
    const storyDocRef = doc(db, 'user_stories', activeStoryId);

    const unsub = onSnapshot(storyDocRef, (snap) => {
      if (isLocalOnlyPausedRef.current) {
        return;
      }
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
            isSyncingFromFirestore.current = true;
            lastSyncedCloudUpdatedAtRef.current = storyData.updatedAt || null;
            universeStateRef.current = storyData;
            setUniverseState(storyData);
            StorageService.setItem('tangent_universe_state', storyData);
            setIsDirty(false);
            setLocalOnlyPausedState(false);
            setSyncConflict(null);
            setStoryReadOnlyState(!isOwner);
            if (storyData.scenarios?.length > 0) {
              setActiveScenarioId(storyData.scenarios[0].id);
            } else {
              setActiveScenarioId(null);
            }
            setActiveMapId(storyData.maps?.length > 0 ? storyData.maps[0].id : null);
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

  const loadPublicElements = useCallback(async () => {
    try {
      const publicElemsQuery = query(collection(db, 'story_elements'), where('isPublic', '==', true));
      const snap = await getDocs(publicElemsQuery);
      const publicElems = snap.docs
        .map(d => {
          const data = d.data();
          return { ...data, id: d.id, ...(data?.type ? { type: normalizeElementType(data.type) } : {}) };
        })
        .filter(e => e.isPublic === true);
      setPublicElementsCatalog(publicElems);
      return publicElems;
    } catch (err) {
      console.warn('Failed to fetch public community elements:', err);
      return [];
    }
  }, []);

  const toggleElementVisibility = useCallback(async (elementId, targetIsPublic) => {
    if (isStoryReadOnlyRef.current || !elementId) return false;
    const safeId = sanitizeElementDocId(elementId);
    const existing = (allElementsCatalogRef.current || []).find(e => e.id === safeId || e.id === elementId);
    if (!existing) return false;
    if (
      existing.authorUid &&
      existing.authorUid !== 'local' &&
      (!currentUser || (existing.authorUid !== currentUser.uid && existing.creatorId !== currentUser.uid))
    ) {
      return false;
    }
    const nextPublic = Boolean(targetIsPublic);
    const updatedElem = {
      ...existing,
      id: safeId,
      isPublic: nextPublic,
      storyId: existing.storyId ?? universeStateRef.current?.id ?? null,
      updatedAt: new Date().toISOString()
    };
    setAllElementsCatalog(prev => {
      const updated = prev.map(e => (e.id === safeId || e.id === elementId ? updatedElem : e));
      StorageService.setItem('tangent_elements_catalog', updated);
      return updated;
    });
    if (currentUser && db) {
      try {
        await setDoc(doc(db, 'story_elements', safeId), sanitizeFirestoreData({ isPublic: nextPublic, storyId: updatedElem.storyId, updatedAt: updatedElem.updatedAt }), { merge: true });
      } catch (err) {
        console.warn('Failed to update element visibility in cloud:', err);
      }
    }
    return true;
  }, [currentUser]);

  const clonePublicStory = useCallback((storyToClone) => {
    const source = storyToClone || universeState;
    const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const ownerUid = currentUser ? currentUser.uid : 'local';
    const scenarioIdMap = {};
    const elementIdMap = {};

    // Clone project-scoped or embedded elements into new project scope with private default
    const sourceElems = [
      ...(Array.isArray(source.elements) ? source.elements : []),
      ...(allElementsCatalogRef.current || []).filter(e => e && e.storyId && e.storyId === source.id)
    ];
    const clonedElements = [];
    const seenSourceElIds = new Set();
    for (const el of sourceElems) {
      if (!el || !el.id || seenSourceElIds.has(el.id)) continue;
      seenSourceElIds.add(el.id);
      const clonedElId = `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      elementIdMap[el.id] = clonedElId;
      clonedElements.push(attachCreatorTag({
        ...el,
        id: clonedElId,
        storyId: newId,
        isPublic: false,
        authorUid: ownerUid,
        creatorId: ownerUid,
        updatedAt: new Date().toISOString()
      }, localStorage.getItem('userHandle'), currentUser));
    }

    const remapHubEntry = (entry) => {
      if (typeof entry === 'string') return elementIdMap[entry] || entry;
      if (entry && typeof entry === 'object') {
        const mapped = elementIdMap[entry.assetId] || entry.assetId;
        return { ...entry, assetId: mapped };
      }
      return entry;
    };

    const cloneScenarioTree = (nodes) => {
      if (!Array.isArray(nodes)) return [];
      return nodes.map(sc => {
        if (!sc) return sc;
        const clonedScId = `scen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        scenarioIdMap[sc.id] = clonedScId;
        return {
          ...sc,
          id: clonedScId,
          storyId: newId,
          ownerId: ownerUid,
          createdBy: ownerUid,
          ...(Array.isArray(sc.linkedElements)
            ? { linkedElements: sc.linkedElements.map(id => elementIdMap[id] || id) }
            : {}),
          ...(Array.isArray(sc.assetHub)
            ? { assetHub: sc.assetHub.map(remapHubEntry) }
            : {}),
          ...(Array.isArray(sc.children)
            ? { children: cloneScenarioTree(sc.children) }
            : {})
        };
      });
    };

    const clonedScenarios = cloneScenarioTree(source.scenarios);
    const clonedMaps = Array.isArray(source.maps)
      ? source.maps.map(m => m ? {
          ...m,
          id: `map_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          storyId: newId,
          ownerId: ownerUid,
          createdBy: ownerUid,
          creatorId: ownerUid,
          authorUid: ownerUid
        } : m)
      : [];

    const sourceCreative = source.creativeState || {};
    const clonedCreative = {
      ...sourceCreative,
      ...(Array.isArray(sourceCreative.linkedElements)
        ? { linkedElements: sourceCreative.linkedElements.map(remapHubEntry) }
        : {})
    };

    const rawStory = {
      ...source,
      id: newId,
      projectName: `${source.projectName || 'Untitled Story'} (Copy)`,
      isPublic: false,
      ownerId: ownerUid,
      createdBy: ownerUid,
      authorId: ownerUid,
      gmId: ownerUid,
      scenarios: clonedScenarios,
      maps: clonedMaps,
      creativeState: clonedCreative,
      updatedAt: new Date().toISOString()
    };
    delete rawStory.elements;
    const newStory = attachCreatorTag(rawStory, localStorage.getItem('userHandle'), currentUser);

    if (clonedElements.length > 0) {
      setAllElementsCatalog(prev => {
        const updated = [...clonedElements, ...prev];
        StorageService.setItem('tangent_elements_catalog', updated);
        return updated;
      });
    }

    debouncedSaveRef.current?.cancel();
    treeHistoryRef.current?.reset(newStory.scenarios || []);
    isSyncingFromFirestore.current = false;
    lastSyncedCloudUpdatedAtRef.current = newStory.updatedAt;
    universeStateRef.current = newStory;
    setUniverseState(newStory);
    StorageService.setItem('tangent_universe_state', newStory);
    setStoryReadOnlyState(false);
    setIsDirty(false);
    setLocalOnlyPausedState(false);
    setSyncConflict(null);
    setActiveScenarioId(clonedScenarios[0]?.id || null);
    setActiveMapId(clonedMaps[0]?.id || null);
    try {
      const store = useAdeStore.getState();
      store?.closeAllModals?.();
      store?.setEditingElement?.(null);
      store?.setStoryScope?.(newId);
    } catch {}

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
  }, [universeState, currentUser, setStoryReadOnlyState, setLocalOnlyPausedState]);

  const offloadScenarioTree = useCallback(async (nodes = [], userId) => {
    return Promise.all(
      (nodes || []).map(async (node) => {
        const offloadedNode = await offloadElementBinaryFields(node, { userId });
        if (Array.isArray(offloadedNode.children) && offloadedNode.children.length > 0) {
          return { ...offloadedNode, children: await offloadScenarioTree(offloadedNode.children, userId) };
        }
        return offloadedNode;
      })
    );
  }, []);

  // Write back offloaded Storage URLs once so future auto-saves do not re-upload inline binaries
  const patchOffloadedUrlsIntoUniverseState = useCallback((preparedMaps, preparedScenarios, rawMaps = [], rawScenarios = []) => {
    if (isStoryReadOnlyRef.current) return;
    const mapsChanged = JSON.stringify(preparedMaps) !== JSON.stringify(rawMaps || []);
    const scenariosChanged = JSON.stringify(preparedScenarios) !== JSON.stringify(rawScenarios || []);
    if (!mapsChanged && !scenariosChanged) return;

    const mapById = new Map((preparedMaps || []).map(m => [m.id, m]));
    const urlMapFromTree = new Map();
    const collectUrls = (nodes = []) => {
      nodes.forEach(n => {
        if (n?.id) urlMapFromTree.set(n.id, n);
        if (Array.isArray(n?.children)) collectUrls(n.children);
      });
    };
    collectUrls(preparedScenarios);
    const patchTreeUrls = (nodes = []) =>
      nodes.map(n => {
        const p = urlMapFromTree.get(n.id);
        const patchedChildren = Array.isArray(n.children) ? patchTreeUrls(n.children) : [];
        if (!p) return { ...n, children: patchedChildren };
        const patchedFields = (n.fields && typeof n.fields === 'object' && p.fields && typeof p.fields === 'object')
          ? {
              ...n.fields,
              ...(typeof p.fields.imageUrl === 'string' && p.fields.imageUrl.startsWith('http') ? { imageUrl: p.fields.imageUrl } : {}),
              ...(typeof p.fields.portraitUrl === 'string' && p.fields.portraitUrl.startsWith('http') ? { portraitUrl: p.fields.portraitUrl } : {}),
              ...(typeof p.fields.tokenUrl === 'string' && p.fields.tokenUrl.startsWith('http') ? { tokenUrl: p.fields.tokenUrl } : {})
            }
          : n.fields;
        return {
          ...n,
          ...(typeof p.imageUrl === 'string' && p.imageUrl.startsWith('http') ? { imageUrl: p.imageUrl } : {}),
          ...(typeof p.portraitUrl === 'string' && p.portraitUrl.startsWith('http') ? { portraitUrl: p.portraitUrl } : {}),
          ...(typeof p.avatarUrl === 'string' && p.avatarUrl.startsWith('http') ? { avatarUrl: p.avatarUrl } : {}),
          ...(typeof p.tokenUrl === 'string' && p.tokenUrl.startsWith('http') ? { tokenUrl: p.tokenUrl } : {}),
          ...(patchedFields !== undefined ? { fields: patchedFields } : {}),
          children: patchedChildren
        };
      });
    setUniverseState(prev => ({
      ...prev,
      ...(mapsChanged ? { maps: (prev.maps || []).map(m => mapById.get(m.id) || m) } : {}),
      ...(scenariosChanged ? { scenarios: patchTreeUrls(prev.scenarios || []) } : {})
    }));
  }, []);

  // Actual Cloud Persistence Worker
  const executeCloudSave = useCallback(async (stateToSave) => {
    if (isStoryReadOnlyRef.current) return false;
    if (isLocalOnlyPausedRef.current) {
      setCloudSyncStatus('offline');
      setSaveStatus('offline');
      return false;
    }
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
      const currentProjectId = resolveProjectId(stateToSave.id, currentUser);
      const savedUpdatedAt = stateToSave.updatedAt || new Date().toISOString();
      const [preparedMaps, preparedScenarios] = await Promise.all([
        Promise.all((stateToSave.maps || []).map(m => offloadMapBinaryFields(m, { userId: currentUser.uid }))),
        offloadScenarioTree(stateToSave.scenarios || [], currentUser.uid)
      ]);
      patchOffloadedUrlsIntoUniverseState(preparedMaps, preparedScenarios, stateToSave.maps, stateToSave.scenarios);

      const payload = {
        ...stateToSave,
        maps: preparedMaps,
        scenarios: preparedScenarios,
        id: currentProjectId,
        updatedAt: savedUpdatedAt
      };
      const payloadWithOwner = { ...payload, ownerId: currentUser.uid };

      // Set the ref so the onSnapshot echo check passes when this timestamp broadcasts
      lastSyncedCloudUpdatedAtRef.current = payload.updatedAt;

      const userStoryDoc = doc(db, 'user_stories', currentProjectId);

      await Promise.all([
        setDoc(userStoryDoc, sanitizeFirestoreData(payloadWithOwner), { merge: true }),
        saveAllElementsIndependently(preparedScenarios, currentUser),
        saveAllMapsIndependently(preparedMaps, currentUser)
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
      const msg = err?.message || 'Failed to sync with cloud.';
      setSaveStatus('error');
      setCloudSyncStatus('error');
      setSaveError(msg);
      const now = Date.now();
      if (now - lastAutoSaveErrorToastRef.current.at > 30000 || lastAutoSaveErrorToastRef.current.msg !== msg) {
        lastAutoSaveErrorToastRef.current = { at: now, msg };
        showToast({ type: 'error', text: `Cloud auto-save failed: ${msg}. Local copy preserved.` });
      }
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
    if (isStoryReadOnlyRef.current || isLocalOnlyPausedRef.current || !universeStateRef.current?.id) return Promise.resolve();
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

    // Pause auto-save cloud writes if a conflict is currently active
    if (syncConflict) {
      return;
    }

    const currentProjectId = resolveProjectId(universeState.id, currentUser);
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

    // Only queue debounced write if user is authenticated and not in conflict-paused local-only mode
    if (!currentUser || isLocalOnlyPaused) {
      setCloudSyncStatus('offline');
      setSaveStatus('offline');
      return;
    }

    setSaveStatus('unsaved');
    setIsDirty(true);
    debouncedSaveRef.current?.(updatedState);
  }, [universeState, isStoryReadOnly, currentUser, syncConflict, isLocalOnlyPaused]);

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
      const currentProjectId = resolveProjectId(universeStateRef.current?.id, currentUser);
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

      setLocalOnlyPausedState(false);
      const updatedTime = new Date().toISOString();
      const currentState = universeStateRef.current;
      const [preparedMaps, preparedScenarios] = await Promise.all([
        Promise.all((currentState.maps || []).map(m => offloadMapBinaryFields(m, { userId: currentUser.uid }))),
        offloadScenarioTree(currentState.scenarios || [], currentUser.uid)
      ]);
      patchOffloadedUrlsIntoUniverseState(preparedMaps, preparedScenarios, currentState.maps, currentState.scenarios);
      const updatedState = {
        ...currentState,
        maps: preparedMaps,
        scenarios: preparedScenarios,
        id: currentProjectId,
        updatedAt: updatedTime
      };
      const payloadWithOwner = { ...updatedState, ownerId: currentUser.uid };

      await Promise.all([
        setDoc(userStoryDoc, sanitizeFirestoreData(payloadWithOwner), { merge: true }),
        saveAllElementsIndependently(preparedScenarios, currentUser),
        saveAllMapsIndependently(preparedMaps, currentUser)
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
      const currentProjectId = resolveProjectId(universeStateRef.current?.id, currentUser);
      const userStoryDoc = doc(db, 'user_stories', currentProjectId);
      const snap = await getDoc(userStoryDoc);
      if (snap.exists()) {
        const firestoreData = snap.data();
        debouncedSaveRef.current?.cancel();
        treeHistoryRef.current?.reset(firestoreData.scenarios || []);
        isSyncingFromFirestore.current = true;
        lastSyncedCloudUpdatedAtRef.current = firestoreData.updatedAt || new Date().toISOString();
        setUniverseState(firestoreData);
        setLocalOnlyPausedState(false);
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
    debouncedSaveRef.current?.cancel();
    setLocalOnlyPausedState(true);
    setSyncConflict(null);
    setCloudSyncStatus('offline');
    setSaveStatus('offline');
    showToast({ type: 'info', text: 'Cloud sync paused (local-only mode). Use Push or Pull to resume.' });
  };

  // Save individual Story Element to Cloud DB collection ('story_elements')
  const saveElementToCloud = async (elementNode) => {
    if (isStoryReadOnlyRef.current) {
      showToast({ type: 'warning', text: 'Read-only story: unlock or clone this project before saving elements to Cloud DB.' });
      return false;
    }
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
      const safeId = sanitizeElementDocId(elementNode.id);
      const taggedNode = attachCreatorTag(
        {
          ...elementNode,
          id: safeId,
          storyId: elementNode.storyId !== undefined ? elementNode.storyId : (universeStateRef.current?.id || null),
          isPublic: Boolean(elementNode.isPublic)
        },
        localStorage.getItem('userHandle'),
        currentUser
      );
      const offloadedNode = await offloadElementBinaryFields(taggedNode, { userId: currentUser.uid });
      const payload = {
        ...offloadedNode,
        updatedAt: new Date().toISOString(),
        authorHandle: getEffectiveUserHandle(currentUser),
        authorUid: currentUser.uid,
        creatorId: offloadedNode.creatorId || currentUser.uid
      };
      await setDoc(doc(db, 'story_elements', safeId), sanitizeFirestoreData(payload));
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
    const currentProjectId = resolveProjectId(universeStateRef.current?.id, currentUser);
    debouncedSaveRef.current?.cancel();
    setLocalOnlyPausedState(false);
    treeHistoryRef.current?.reset(DEFAULT_UNIVERSE_STATE.scenarios || []);
    await StorageService.removeItem('tangent_universe_state');
    const resetState = {
      ...DEFAULT_UNIVERSE_STATE,
      id: currentProjectId,
      ...(currentUser ? { ownerId: currentUser.uid } : {}),
      updatedAt: new Date().toISOString()
    };
    setUniverseState(resetState);
    setActiveScenarioId(null);
    setActiveMapId(null);
    setIsDirty(false);
    // Reset Firestore story document if authenticated
    if (currentUser) {
      try {
        const docRef = doc(db, 'user_stories', currentProjectId);
        const payloadWithOwner = { ...resetState, ownerId: currentUser.uid };
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
            customTemplates: Array.isArray(loadedData.customTemplates) ? loadedData.customTemplates : [],
            scripts: Array.isArray(loadedData.scripts) ? loadedData.scripts : [],
            isPublic: Boolean(loadedData.isPublic),
            updatedAt: loadedData.updatedAt || new Date().toISOString()
          };
          debouncedSaveRef.current?.cancel();
          treeHistoryRef.current?.reset(loadedStories);
          setSyncConflict?.(null);
          if (typeof isLocalOnlyPausedRef !== 'undefined') isLocalOnlyPausedRef.current = false;
          if (typeof lastSyncedCloudUpdatedAtRef !== 'undefined') {
            lastSyncedCloudUpdatedAtRef.current = loadedData.updatedAt || null;
          }
          setUniverseState(nextUniverse);
          setStoryReadOnlyState(false);
          const embeddedElements = Array.isArray(loadedData.elements)
            ? loadedData.elements
            : (Array.isArray(loadedData.elementsCatalog) ? loadedData.elementsCatalog : []);
          if (embeddedElements.length > 0 && typeof setAllElementsCatalog === 'function') {
            setAllElementsCatalog((prev) => {
              const map = new Map((prev || []).map((el) => [el.id, el]));
              embeddedElements.forEach((el) => {
                if (!el || typeof el !== 'object') return;
                const eid = sanitizeElementDocId(el.id || `elem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
                map.set(eid, { ...el, id: eid, storyId: nextUniverse.id });
              });
              return Array.from(map.values());
            });
          }
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

  const activeCronicleLocationIdRef = useRef('');
  activeCronicleLocationIdRef.current = universeState?.cronicle?.workingMemory?.activeLocationId || '';

  useEffect(() => {
    const cleanup = initCronicleVttBridge({
      stageCronicleDeltas: (deltas) => stageCronicleDeltasRef.current(deltas),
      getActiveLocationId: () => activeCronicleLocationIdRef.current,
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
      linkedElements: [],
      assetHub: [],
      children: []
    }, localStorage.getItem('userHandle'), currentUser);

    const rawStory = {
      id: newId,
      projectName: name || 'Untitled Story Project',
      description: description || '',
      scenarios: [overviewElem],
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
      cronicle: createDefaultCronicleState(name || 'Untitled Story Project'),
      galleryModifiers: [],
      scripts: [],
      customTemplates: [],
      isPublic: false,
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
    setLocalOnlyPausedState(false);
    setSyncConflict(null);
    try {
      const store = useAdeStore.getState();
      store?.closeAllModals?.();
      store?.setEditingElement?.(null);
      store?.setStoryScope?.(newId);
    } catch {}

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
      setLocalOnlyPausedState(false);
      setSyncConflict(null);
      setStoryReadOnlyState(!isOwner);
      try {
        const store = useAdeStore.getState();
        store?.closeAllModals?.();
        store?.setEditingElement?.(null);
        store?.setStoryScope?.(target.id);
      } catch {}
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

    // 3. Remove project-owned elements & remove project from storyCatalog
    setAllElementsCatalog(prev => {
      const next = (prev || []).filter(el => el?.storyId !== storyId && el?.projectId !== storyId);
      StorageService.setItem('tangent_elements_catalog', next);
      return next;
    });

    const remaining = currentCatalog.filter(s => s.id !== storyId);

    if (isDeletingActive) {
      useAdeStore.getState().closeAllModals?.();
      if (remaining.length > 0) {
        const nextStory = remaining[0];
        const isNextLocal = !nextStory.ownerId || nextStory.ownerId === 'local';
        const isOwner = user ? (isNextLocal || nextStory.ownerId === user.uid) : isNextLocal;
        treeHistoryRef.current?.reset(nextStory.scenarios || []);
        useAdeStore.getState().setStoryScope?.(nextStory.id);
        isSyncingFromFirestore.current = true;
        lastSyncedCloudUpdatedAtRef.current = nextStory.updatedAt || null;
        universeStateRef.current = nextStory;
        setUniverseState(nextStory);
        StorageService.setItem('tangent_universe_state', nextStory);
        setIsDirty(false);
        setLocalOnlyPausedState(false);
        setSyncConflict(null);
        setStoryReadOnlyState(!isOwner);
        setActiveScenarioId(nextStory.scenarios?.length > 0 ? nextStory.scenarios[0].id : null);
        setActiveMapId(nextStory.maps?.length > 0 ? nextStory.maps[0].id : null);
        storyCatalogRef.current = remaining;
        setStoryCatalog(remaining);
        StorageService.setItem('tangent_story_catalog', remaining);
      } else {
        const defaultIdForUser = getDefaultProjectId(user);
        const freshDefaultId =
          storyId === LEGACY_DEFAULT_PROJECT_ID || storyId === defaultIdForUser
            ? `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
            : defaultIdForUser;
        unmarkStoryIdDeleted(freshDefaultId);
        useAdeStore.getState().setStoryScope?.(freshDefaultId);
        const fallback = {
          ...DEFAULT_UNIVERSE_STATE,
          id: freshDefaultId,
          ...(user ? { ownerId: user.uid } : {}),
          updatedAt: new Date().toISOString()
        };
        treeHistoryRef.current?.reset(fallback.scenarios || []);
        isSyncingFromFirestore.current = true;
        lastSyncedCloudUpdatedAtRef.current = fallback.updatedAt;
        universeStateRef.current = fallback;
        setUniverseState(fallback);
        StorageService.setItem('tangent_universe_state', fallback);
        setIsDirty(false);
        setLocalOnlyPausedState(false);
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
    if (isStoryReadOnlyRef.current) return false;
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
        const preparedSpectatorMap = await offloadMapBinaryFields(liveFlaggedMap, { userId: currentUser.uid });
        const sanitized = sanitizeMapForSpectator(preparedSpectatorMap, currentUser);
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
    if (isStoryReadOnlyRef.current) {
      return false;
    }
    const safeId = sanitizeElementDocId(elementId);
    const targetEl = (allElementsCatalogRef.current || []).find(e => e.id === safeId || e.id === elementId);
    if (
      targetEl &&
      targetEl.authorUid &&
      targetEl.authorUid !== 'local' &&
      (!currentUser || (targetEl.authorUid !== currentUser.uid && targetEl.creatorId !== currentUser.uid))
    ) {
      return false;
    }

    const removedIds = new Set([elementId, safeId].filter(Boolean));

    setAllElementsCatalog(prev => {
      const updated = prev.filter(e => !removedIds.has(e.id));
      StorageService.setItem('tangent_elements_catalog', updated);
      return updated;
    });
    setPublicElementsCatalog(prev => prev.filter(e => !removedIds.has(e.id)));

    // Clean up dangling references from the active story's scenarios & creativeState
    if (!isStoryReadOnlyRef.current) {
      let modifiedUniverse = false;
      const stripHubEntries = (arr) => {
        if (!Array.isArray(arr)) return arr;
        const filtered = arr.filter(entry => {
          const eid = typeof entry === 'string' ? entry : entry?.assetId;
          return !removedIds.has(eid);
        });
        if (filtered.length !== arr.length) modifiedUniverse = true;
        return filtered;
      };
      const stripNodeLinks = (nodes) => {
        if (!Array.isArray(nodes)) return nodes;
        return nodes.map(node => {
          if (!node) return node;
          const nextLinked = Array.isArray(node.linkedElements) ? stripHubEntries(node.linkedElements) : node.linkedElements;
          const nextHub = Array.isArray(node.assetHub) ? stripHubEntries(node.assetHub) : node.assetHub;
          const nextChildren = Array.isArray(node.children) ? stripNodeLinks(node.children) : node.children;
          return {
            ...node,
            ...(nextLinked !== undefined ? { linkedElements: nextLinked } : {}),
            ...(nextHub !== undefined ? { assetHub: nextHub } : {}),
            ...(nextChildren !== undefined ? { children: nextChildren } : {})
          };
        });
      };

      setUniverseState(prev => {
        if (!prev) return prev;
        const nextScenarios = Array.isArray(prev.scenarios) ? stripNodeLinks(prev.scenarios) : prev.scenarios;
        const prevCreative = prev.creativeState || {};
        const nextCreativeLinked = Array.isArray(prevCreative.linkedElements)
          ? stripHubEntries(prevCreative.linkedElements)
          : prevCreative.linkedElements;
        const nextAssetLinks = Array.isArray(prev.assetLinks)
          ? prev.assetLinks.filter(l => l && !removedIds.has(l.source || l.fromId) && !removedIds.has(l.target || l.toId))
          : prev.assetLinks;
        if (Array.isArray(prev.assetLinks) && nextAssetLinks.length !== prev.assetLinks.length) {
          modifiedUniverse = true;
        }
        if (!modifiedUniverse) return prev;
        return {
          ...prev,
          scenarios: nextScenarios,
          ...(nextCreativeLinked !== prevCreative.linkedElements
            ? { creativeState: { ...prevCreative, linkedElements: nextCreativeLinked } }
            : {}),
          ...(nextAssetLinks !== prev.assetLinks ? { assetLinks: nextAssetLinks } : {}),
          updatedAt: new Date().toISOString()
        };
      });
      if (modifiedUniverse) setIsDirty(true);
    }

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'story_elements', safeId));
      } catch (e) {
        console.warn('Failed to delete element from Firestore:', e);
      }
    }
    return true;
  }, [currentUser]);

  const updateSavedElement = async (elementId, updates) => {
    if (isStoryReadOnlyRef.current || !elementId || !updates) {
      return null;
    }
    const safeId = sanitizeElementDocId(elementId);
    const existingElem = (allElementsCatalogRef.current || []).find(e => e.id === safeId || e.id === elementId);
    if (
      existingElem &&
      existingElem.authorUid &&
      existingElem.authorUid !== 'local' &&
      (!currentUser || (existingElem.authorUid !== currentUser.uid && existingElem.creatorId !== currentUser.uid))
    ) {
      return null;
    }
    const resolvedStoryId =
      updates.storyId !== undefined
        ? updates.storyId
        : (existingElem?.storyId !== undefined ? existingElem.storyId : (universeStateRef.current?.id || null));
    const resolvedIsPublic =
      updates.isPublic !== undefined ? Boolean(updates.isPublic) : Boolean(existingElem?.isPublic);

    const taggedUpdates = attachCreatorTag(updates, localStorage.getItem('userHandle'), currentUser);
    const updatedElem = existingElem
      ? attachCreatorTag({
          ...existingElem,
          ...taggedUpdates,
          id: safeId,
          storyId: resolvedStoryId,
          isPublic: resolvedIsPublic,
          updatedAt: new Date().toISOString()
        }, localStorage.getItem('userHandle'), currentUser)
      : attachCreatorTag({
          ...taggedUpdates,
          id: safeId,
          storyId: resolvedStoryId,
          isPublic: resolvedIsPublic,
          updatedAt: new Date().toISOString(),
          authorHandle: currentUser ? getEffectiveUserHandle(currentUser) : 'Local User',
          authorUid: currentUser?.uid || 'local',
          creatorId: taggedUpdates.creatorId || currentUser?.uid || 'local'
        }, localStorage.getItem('userHandle'), currentUser);

    setAllElementsCatalog(prev => {
      const exists = prev.some(e => e.id === safeId || e.id === elementId);
      const updated = exists
        ? prev.map(e => (e.id === safeId || e.id === elementId ? updatedElem : e))
        : [updatedElem, ...prev];
      StorageService.setItem('tangent_elements_catalog', updated);
      return updated;
    });

    // If element exists in current working story, sync updates there too (unless read-only)
    if (!isStoryReadOnlyRef.current) {
      const containsId = (nodes) => {
        for (let n of nodes) {
          if (n.id === safeId || n.id === elementId) return true;
          if (n.children && containsId(n.children)) return true;
        }
        return false;
      };
      const hasMatchInCurrent = containsId(universeStateRef.current?.scenarios || []);
      if (hasMatchInCurrent) {
        setUniverseState(prev => {
          const updateTree = (nodes) => {
            return nodes.map(node => {
              if (node.id === safeId || node.id === elementId) {
                return { ...node, ...updates, id: safeId };
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
        const preparedElem = await offloadElementBinaryFields(updatedElem, { userId: currentUser.uid });
        await setDoc(doc(db, 'story_elements', safeId), sanitizeFirestoreData(preparedElem), { merge: true });
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

  const guardedSetUniverseState = useCallback((updater) => {
    if (isStoryReadOnlyRef.current) return;
    setUniverseState(updater);
  }, []);

  const actionsRef = useRef({});
  actionsRef.current = {
    setUniverseState: guardedSetUniverseState,
    addGalleryModifier,
    updateGalleryModifier,
    deleteGalleryModifier,
    toggleGalleryModifier,
    setGalleryModifiers,
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
    updateCronicle,
    updateWorkingMemory,
    applyCronicleDelta: applyCronicleDeltaAction,
    stageCronicleDeltas,
    acceptPendingDelta,
    acceptAllPendingDeltas,
    rejectPendingDelta,
    clearPendingDeltas,
    cloneElementToCronicle,
    setSyncConflict,
    resolveConflictOverwrite,
    resolveConflictPull,
    resolveConflictCancel,
    pushUniverseToCloud,
    pullUniverseFromCloud,
    saveElementToCloud,
    loadElementsFromCloud,
    setActiveScenarioId,
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
    setIsStoryReadOnly: setStoryReadOnlyState,
    toggleStoryVisibility,
    loadPublicStories,
    clonePublicStory,
    loadPublicElements,
    toggleElementVisibility,
    setSaveStatus,
    triggerSave,
    forceSaveNow,
    publishSpectatorMap
  };

  const stableActions = useMemo(() => ({
    setUniverseState: (...args) => actionsRef.current.setUniverseState(...args),
    addGalleryModifier: (...args) => actionsRef.current.addGalleryModifier(...args),
    updateGalleryModifier: (...args) => actionsRef.current.updateGalleryModifier(...args),
    deleteGalleryModifier: (...args) => actionsRef.current.deleteGalleryModifier(...args),
    toggleGalleryModifier: (...args) => actionsRef.current.toggleGalleryModifier(...args),
    setGalleryModifiers: (...args) => actionsRef.current.setGalleryModifiers(...args),
    setIsDirty: (...args) => actionsRef.current.setIsDirty(...args),
    confirmIfDirty: (...args) => actionsRef.current.confirmIfDirty(...args),
    createNewStory: (...args) => actionsRef.current.createNewStory(...args),
    openStory: (...args) => actionsRef.current.openStory(...args),
    closeStory: (...args) => actionsRef.current.closeStory(...args),
    deleteStoryProject: (...args) => actionsRef.current.deleteStoryProject(...args),
    deleteSavedElement: (...args) => actionsRef.current.deleteSavedElement(...args),
    updateSavedElement: (...args) => actionsRef.current.updateSavedElement(...args),
    enforceElementNames: (...args) => actionsRef.current.enforceElementNames(...args),
    saveAllElementsIndependently: (...args) => actionsRef.current.saveAllElementsIndependently(...args),
    saveAllMapsIndependently: (...args) => actionsRef.current.saveAllMapsIndependently(...args),
    deleteSavedMap: (...args) => actionsRef.current.deleteSavedMap(...args),
    updateProjectName: (...args) => actionsRef.current.updateProjectName(...args),
    updateUniverseMetadata: (...args) => actionsRef.current.updateUniverseMetadata(...args),
    handleClearUniverse: (...args) => actionsRef.current.handleClearUniverse(...args),
    updateCreativeState: (...args) => actionsRef.current.updateCreativeState(...args),
    updateGems: (...args) => actionsRef.current.updateGems(...args),
    updateStoryCards: (...args) => actionsRef.current.updateStoryCards(...args),
    updateOutline: (...args) => actionsRef.current.updateOutline(...args),
    updateSceneBeats: (...args) => actionsRef.current.updateSceneBeats(...args),
    updateDraft: (...args) => actionsRef.current.updateDraft(...args),
    updateLinkedElements: (...args) => actionsRef.current.updateLinkedElements(...args),
    getActiveGemsText: (...args) => actionsRef.current.getActiveGemsText(...args),
    updateCronicle: (...args) => actionsRef.current.updateCronicle(...args),
    updateWorkingMemory: (...args) => actionsRef.current.updateWorkingMemory(...args),
    applyCronicleDelta: (...args) => actionsRef.current.applyCronicleDelta(...args),
    stageCronicleDeltas: (...args) => actionsRef.current.stageCronicleDeltas(...args),
    acceptPendingDelta: (...args) => actionsRef.current.acceptPendingDelta(...args),
    acceptAllPendingDeltas: (...args) => actionsRef.current.acceptAllPendingDeltas(...args),
    rejectPendingDelta: (...args) => actionsRef.current.rejectPendingDelta(...args),
    clearPendingDeltas: (...args) => actionsRef.current.clearPendingDeltas(...args),
    cloneElementToCronicle: (...args) => actionsRef.current.cloneElementToCronicle(...args),
    setSyncConflict: (...args) => actionsRef.current.setSyncConflict(...args),
    resolveConflictOverwrite: (...args) => actionsRef.current.resolveConflictOverwrite(...args),
    resolveConflictPull: (...args) => actionsRef.current.resolveConflictPull(...args),
    resolveConflictCancel: (...args) => actionsRef.current.resolveConflictCancel(...args),
    pushUniverseToCloud: (...args) => actionsRef.current.pushUniverseToCloud(...args),
    pullUniverseFromCloud: (...args) => actionsRef.current.pullUniverseFromCloud(...args),
    saveElementToCloud: (...args) => actionsRef.current.saveElementToCloud(...args),
    loadElementsFromCloud: (...args) => actionsRef.current.loadElementsFromCloud(...args),
    setActiveScenarioId: (...args) => actionsRef.current.setActiveScenarioId(...args),
    setActiveMapId: (...args) => actionsRef.current.setActiveMapId(...args),
    handleSaveLocal: (...args) => actionsRef.current.handleSaveLocal(...args),
    handleLoadLocal: (...args) => actionsRef.current.handleLoadLocal(...args),
    triggerStorySave: (...args) => actionsRef.current.triggerStorySave(...args),
    handleSaveStory: (...args) => actionsRef.current.handleSaveStory(...args),
    handleLoadStory: (...args) => actionsRef.current.handleLoadStory(...args),
    handleSaveScenario: (...args) => actionsRef.current.handleSaveScenario(...args),
    handleLoadScenario: (...args) => actionsRef.current.handleLoadScenario(...args),
    handleSaveActiveMap: (...args) => actionsRef.current.handleSaveActiveMap(...args),
    handleLoadMap: (...args) => actionsRef.current.handleLoadMap(...args),
    addStory: (...args) => actionsRef.current.addStory(...args),
    addScenario: (...args) => actionsRef.current.addScenario(...args),
    updateStory: (...args) => actionsRef.current.updateStory(...args),
    updateScenario: (...args) => actionsRef.current.updateScenario(...args),
    deleteStory: (...args) => actionsRef.current.deleteStory(...args),
    deleteScenario: (...args) => actionsRef.current.deleteScenario(...args),
    moveStory: (...args) => actionsRef.current.moveStory(...args),
    moveScenario: (...args) => actionsRef.current.moveScenario(...args),
    reorderStory: (...args) => actionsRef.current.reorderStory(...args),
    reorderScenario: (...args) => actionsRef.current.reorderScenario(...args),
    reorderRelativeScenario: (...args) => actionsRef.current.reorderRelativeScenario(...args),
    undoScenarioTree: (...args) => actionsRef.current.undoScenarioTree(...args),
    redoScenarioTree: (...args) => actionsRef.current.redoScenarioTree(...args),
    addMap: (...args) => actionsRef.current.addMap(...args),
    updateMap: (...args) => actionsRef.current.updateMap(...args),
    deleteMap: (...args) => actionsRef.current.deleteMap(...args),
    addCustomTerrain: (...args) => actionsRef.current.addCustomTerrain(...args),
    updateCustomTerrain: (...args) => actionsRef.current.updateCustomTerrain(...args),
    deleteCustomTerrain: (...args) => actionsRef.current.deleteCustomTerrain(...args),
    addCustomObject: (...args) => actionsRef.current.addCustomObject(...args),
    updateCustomObject: (...args) => actionsRef.current.updateCustomObject(...args),
    deleteCustomObject: (...args) => actionsRef.current.deleteCustomObject(...args),
    addCustomChunk: (...args) => actionsRef.current.addCustomChunk(...args),
    updateCustomChunk: (...args) => actionsRef.current.updateCustomChunk(...args),
    deleteCustomChunk: (...args) => actionsRef.current.deleteCustomChunk(...args),
    setIsStoryReadOnly: (...args) => actionsRef.current.setIsStoryReadOnly(...args),
    toggleStoryVisibility: (...args) => actionsRef.current.toggleStoryVisibility(...args),
    loadPublicStories: (...args) => actionsRef.current.loadPublicStories(...args),
    clonePublicStory: (...args) => actionsRef.current.clonePublicStory(...args),
    loadPublicElements: (...args) => actionsRef.current.loadPublicElements(...args),
    toggleElementVisibility: (...args) => actionsRef.current.toggleElementVisibility(...args),
    setSaveStatus: (...args) => actionsRef.current.setSaveStatus(...args),
    triggerSave: (...args) => actionsRef.current.triggerSave(...args),
    forceSaveNow: (...args) => actionsRef.current.forceSaveNow(...args),
    publishSpectatorMap: (...args) => actionsRef.current.publishSpectatorMap(...args)
  }), []);

  const canUndoScenarioTree = treeHistoryRef.current.canUndo;
  const canRedoScenarioTree = treeHistoryRef.current.canRedo;
  const galleryModifiers = universeState?.galleryModifiers || [];

  const value = useMemo(() => ({
    ...stableActions,
    universeState,
    galleryModifiers,
    storyCatalog,
    elementsCatalog,
    allElementsCatalog,
    publicElementsCatalog,
    mapsCatalog,
    lastCloudSavedAt,
    isDirty,
    cronicle,
    cloudSyncStatus,
    syncConflict,
    activeScenarioId,
    activeMapId,
    canUndoScenarioTree,
    canRedoScenarioTree,
    isStoryReadOnly,
    publicStoryCatalog,
    saveStatus,
    lastSavedTimestamp,
    saveError,
    isLocalOnlyPaused
  }), [
    stableActions,
    universeState,
    galleryModifiers,
    storyCatalog,
    elementsCatalog,
    allElementsCatalog,
    publicElementsCatalog,
    mapsCatalog,
    lastCloudSavedAt,
    isDirty,
    cronicle,
    cloudSyncStatus,
    syncConflict,
    activeScenarioId,
    activeMapId,
    canUndoScenarioTree,
    canRedoScenarioTree,
    isStoryReadOnly,
    publicStoryCatalog,
    saveStatus,
    lastSavedTimestamp,
    saveError,
    isLocalOnlyPaused
  ]);

  return (
    <StoryActionsContext.Provider value={stableActions}>
      <StoryContext.Provider value={value}>
        {children}
      </StoryContext.Provider>
    </StoryActionsContext.Provider>
  );
};

export const CampaignProvider = StoryProvider;
