import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, onSnapshot, collection, getDocs, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { attachCreatorTag } from '../utils/creatorUtils';
import { createDebouncedSaver } from '../utils/debounceUtils';
import { commitChunkedBatches } from '../utils/firestoreUtils';
import { StorageService } from '../services/storageService';

const StoryContext = createContext();

export const useStory = () => useContext(StoryContext);
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
  customAssets: { terrains: [], objects: [] },
  creativeState: {
    gems: [],
    storyCards: [],
    storyOutline: '',
    sceneBeats: '',
    storyDraft: '',
    linkedElements: []
  },
  updatedAt: new Date().toISOString()
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
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse elements catalog from localStorage:', e);
    }
    return [];
  });

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

        if (cachedUniverse && cachedUniverse.id) {
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
          setStoryCatalog(cachedStories);
        }

        if (Array.isArray(cachedMaps) && cachedMaps.length > 0) {
          setMapsCatalog(cachedMaps);
        }

        if (Array.isArray(cachedElements) && cachedElements.length > 0) {
          setElementsCatalog(cachedElements);
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
  const confirmIfDirty = useCallback((actionCallback, customMsg) => {
    if (isDirty) {
      const msg = customMsg || `Warning: You have unsaved or modified fields in your current story project ("${universeState.projectName || 'Untitled'}"). Creating or opening a new story will clear out the current active workspace.\n\nDo you want to proceed?`;
      if (!window.confirm(msg)) {
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
  const universeStateRef = useRef(universeState);
  useEffect(() => {
    isDirtyRef.current = isDirty;
    universeStateRef.current = universeState;
  }, [isDirty, universeState]);

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

    const extractedElements = [];
    const flattenNodes = (nodes, parentPath = '') => {
      nodes.forEach(node => {
        const cleanTitle = (node.title && node.title.trim()) ? node.title.trim() : `Untitled ${node.type || 'Element'}`;
        const elemCopy = {
          ...node,
          title: cleanTitle,
          updatedAt: new Date().toISOString(),
          authorEmail: user?.email || 'Local User',
          authorUid: user?.uid || 'local',
          creatorId: user?.uid || 'local',
          storyId: universeStateRef.current?.id || 'proj_default_universe',
          parentPath: parentPath
        };
        extractedElements.push(elemCopy);
        if (node.children && node.children.length > 0) {
          flattenNodes(node.children, parentPath ? `${parentPath} ❯ ${cleanTitle}` : cleanTitle);
        }
      });
    };

    flattenNodes(scenariosTree);

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
      authorEmail: user?.email || 'Local User',
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
        const operations = extractedMaps.map(m => ({
          ref: doc(db, 'story_maps', m.id),
          data: m,
          merge: true
        }));
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

    // Fetch user stories from Cloud DB
    const storiesCol = collection(db, 'user_stories');
    getDocs(storiesCol).then((snap) => {
      const stories = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      if (stories.length > 0) {
        setStoryCatalog(prev => {
          const map = new Map(prev.map(s => [s.id, s]));
          stories.forEach(s => map.set(s.id, s));
          const merged = Array.from(map.values());
          StorageService.setItem('tangent_story_catalog', merged);
          return merged;
        });
      }
    }).catch(e => console.warn('Failed to load user stories from cloud:', e));

    // Fetch elements library from Cloud DB
    const elementsCol = collection(db, 'story_elements');
    getDocs(elementsCol).then((snap) => {
      const elems = snap.docs.map(d => ({ ...d.data(), id: d.id }));
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

    // Fetch maps library from Cloud DB
    const mapsCol = collection(db, 'story_maps');
    getDocs(mapsCol).then((snap) => {
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
          const isOwner = currentUser && storyData.ownerId === currentUser.uid;
          if (storyData.isPublic || isOwner) {
            setUniverseState(storyData);
            setIsDirty(false);
            setIsStoryReadOnly(!isOwner);
            if (storyData.scenarios?.length > 0) {
              setActiveScenarioId(storyData.scenarios[0].id);
            }
          } else {
            alert('This story project is private.');
          }
        } else {
          alert('Requested story project was not found.');
        }
      }).catch((err) => {
        console.warn('Failed to load public story project:', err);
      });
    }
  }, [currentUser]);

  const toggleStoryVisibility = useCallback(async (storyId, targetIsPublic) => {
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
        await setDoc(userStoryDoc, { isPublic: targetIsPublic, ownerId: currentUser.uid }, { merge: true });
      } catch (err) {
        console.warn('Failed to update story visibility in cloud:', err);
      }
    }
  }, [currentUser, universeState.id]);

  const loadPublicStories = useCallback(async () => {
    try {
      const storiesCol = collection(db, 'user_stories');
      const snap = await getDocs(storiesCol);
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
    const rawStory = {
      ...source,
      id: newId,
      projectName: `${source.projectName || 'Untitled Story'} (Copy)`,
      isPublic: false,
      ownerId: currentUser ? currentUser.uid : 'local',
      updatedAt: new Date().toISOString()
    };
    const newStory = attachCreatorTag(rawStory, localStorage.getItem('userHandle'), currentUser);

    setUniverseState(newStory);
    setIsStoryReadOnly(false);
    setIsDirty(false);

    setStoryCatalog(prev => {
      const updated = [newStory, ...prev.filter(s => s.id !== newId)];
      StorageService.setItem('tangent_story_catalog', updated);
      return updated;
    });

    if (currentUser) {
      setDoc(doc(db, 'user_stories', newId), newStory).catch(e => console.warn(e));
    }

    if (window.history.replaceState) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    alert(`Successfully cloned "${source.projectName}" to your Story Foundry catalog!`);
  }, [universeState, currentUser]);

  // Actual Cloud Persistence Worker
  const executeCloudSave = useCallback(async (stateToSave) => {
    if (!stateToSave?.id) return;
    if (!currentUser) {
      setCloudSyncStatus('offline');
      setSaveStatus('offline');
      return;
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
        setDoc(userStoryDoc, payloadWithOwner, { merge: true }),
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
    if (!universeStateRef.current?.id) return Promise.resolve();
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
    if (debouncedSaveRef.current?.isPending()) {
      return await debouncedSaveRef.current.flush();
    } else if (universeStateRef.current) {
      return await executeCloudSave(universeStateRef.current);
    }
  }, [executeCloudSave]);

  // Auto-persist active universe state: StorageService immediately, Firestore debounced (1500ms)
  useEffect(() => {
    if (isStoryReadOnly) return; // Prevent auto-save when viewing a read-only public story

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isSyncingFromFirestore.current) {
      isSyncingFromFirestore.current = false;
      return;
    }

    // Pause auto-save writes if a conflict is currently active
    if (syncConflict) {
      return;
    }

    const currentProjectId = universeState.id || 'proj_default_universe';
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
  }, [universeState, isStoryReadOnly]);

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
    if (!currentUser) {
      if (options.showSuccessAlert !== false) alert("Please login to push data to Cloud DB.");
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
        setDoc(userStoryDoc, payloadWithOwner, { merge: true }),
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
        alert("Story project successfully pushed to Cloud DB!");
      }
      return true;
    } catch (err) {
      console.error("Failed to push to Cloud DB:", err);
      setSaveStatus('error');
      setCloudSyncStatus('error');
      setSaveError(err.message || 'Failed to push to Cloud DB');
      alert(`Cloud DB Push failed: ${err.message}`);
      return false;
    }
  }, [currentUser, saveAllElementsIndependently, saveAllMapsIndependently]);

  const triggerStorySave = useCallback(() => {
    if (debouncedSaveRef.current?.isPending()) {
      debouncedSaveRef.current.flush();
    } else {
      pushUniverseToCloud({ showSuccessAlert: false, force: true });
    }
  }, [pushUniverseToCloud]);

  // Manual Pull from Cloud DB
  const pullUniverseFromCloud = async () => {
    if (!currentUser) {
      alert("Please login to pull data from Cloud DB.");
      return false;
    }
    try {
      setCloudSyncStatus('syncing');
      const currentProjectId = universeStateRef.current?.id || 'proj_default_universe';
      const userStoryDoc = doc(db, 'user_stories', currentProjectId);
      const snap = await getDoc(userStoryDoc);
      if (snap.exists()) {
        const firestoreData = snap.data();
        isSyncingFromFirestore.current = true;
        lastSyncedCloudUpdatedAtRef.current = firestoreData.updatedAt || new Date().toISOString();
        setUniverseState(firestoreData);
        setSyncConflict(null);
        setIsDirty(false);
        setCloudSyncStatus('synced');
        setLastCloudSavedAt(new Date().toLocaleTimeString());
        alert("Story project successfully pulled from Cloud DB!");
        return true;
      } else {
        alert("No Cloud DB document found for this story project.");
        setCloudSyncStatus('synced');
        return false;
      }
    } catch (err) {
      console.error("Failed to pull from Cloud DB:", err);
      setCloudSyncStatus('error');
      alert(`Cloud DB Pull failed: ${err.message}`);
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
      alert("Please login to save elements to Cloud DB.");
      return false;
    }
    if (!elementNode || !elementNode.id) return false;
    try {
      setCloudSyncStatus('syncing');
      const taggedNode = attachCreatorTag(elementNode, localStorage.getItem('userHandle'), currentUser);
      const payload = {
        ...taggedNode,
        updatedAt: new Date().toISOString(),
        authorEmail: currentUser.email || 'Anonymous',
        authorUid: currentUser.uid
      };
      await setDoc(doc(db, 'story_elements', elementNode.id), payload);
      setCloudSyncStatus('synced');
      alert(`Story Element "${elementNode.title || 'Untitled'}" saved to Cloud DB collection!`);
      return true;
    } catch (err) {
      console.error("Save element to Cloud DB failed:", err);
      setCloudSyncStatus('error');
      alert(`Failed to save element to Cloud DB: ${err.message}`);
      return false;
    }
  };

  // Fetch all Cloud DB Story Elements from collection ('story_elements')
  const loadElementsFromCloud = async () => {
    if (!currentUser) {
      alert("Please login to access Cloud DB elements library.");
      return [];
    }
    try {
      setCloudSyncStatus('syncing');
      const colRef = collection(db, 'story_elements');
      const snap = await getDocs(colRef);
      const elements = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setCloudSyncStatus('synced');
      return elements;
    } catch (err) {
      console.error("Failed to load elements from Cloud DB:", err);
      setCloudSyncStatus('error');
      alert(`Failed to fetch Cloud DB elements: ${err.message}`);
      return [];
    }
  };

  const handleClearUniverse = async () => {
    const currentProjectId = universeStateRef.current?.id || 'proj_default_universe';
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
        await setDoc(docRef, payloadWithOwner);
      } catch (err) {
        console.warn('Firestore universe clear failed:', err.message);
      }
    }
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
        if (data.type === "TangentUniverse" || data.type === "TangentStory" || data.type === "TangentCampaign") {
          const loadedData = data.data || data;
          const loadedStories = loadedData.scenarios || loadedData.stories || [];
          setUniverseState({
            projectName: loadedData.projectName || 'Tangent Universe',
            scenarios: loadedStories,
            maps: loadedData.maps || [],
            customAssets: loadedData.customAssets || { terrains: [], objects: [] }
          });
          if (loadedData.maps?.length > 0) setActiveMapId(loadedData.maps[0].id);
          if (loadedStories.length > 0) setActiveScenarioId(loadedStories[0].id);
          setIsDirty(false);
        } else {
          alert("Invalid project file format.");
        }
      } catch (error) {
        console.error("Failed to load project:", error);
        alert("Invalid project file.");
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
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
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
          setUniverseState(prev => ({
            ...prev,
            scenarios: loadedStories
          }));
          setActiveScenarioId(loadedStories[0].id);
        } else {
          alert("No stories found in file.");
        }
      } catch (error) {
        console.error("Failed to load story file:", error);
        alert("Invalid story file.");
      }
    };
    reader.readAsText(file);
  };

  // Dedicated Map Save / Load
  const handleSaveActiveMap = () => {
    const currentMap = universeState.maps.find(m => m.id === activeMapId);
    if (!currentMap) return alert("No active map to save!");
    
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
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
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
          alert("Invalid map file format.");
        }
      } catch (error) {
        console.error("Failed to load map file:", error);
        alert("Invalid map file.");
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

  // Move scenario node to a new parent (or root if targetParentId is null)
  const moveScenario = (nodeId, targetParentId) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    if (nodeId === targetParentId) return;

    setUniverseState(prev => {
      const isDescendant = (nodes, searchId) => {
        for (let n of nodes) {
          if (n.id === searchId) return true;
          if (n.children && isDescendant(n.children, searchId)) return true;
        }
        return false;
      };

      const findSubtree = (nodes, id) => {
        for (let n of nodes) {
          if (n.id === id) return n;
          if (n.children) {
            const found = findSubtree(n.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const movingNode = findSubtree(prev.scenarios, nodeId);
      if (!movingNode) return prev;

      if (targetParentId && movingNode.children && isDescendant(movingNode.children, targetParentId)) {
        console.warn("Cannot move a parent component into its own descendant.");
        return prev;
      }

      // Step 1: Remove nodeId from current location
      const removeRecursive = (nodes) => {
        return nodes
          .filter(node => node.id !== nodeId)
          .map(node => ({
            ...node,
            children: node.children ? removeRecursive(node.children) : []
          }));
      };

      const cleanedScenarios = removeRecursive(prev.scenarios);

      // Step 2: Insert into new parent or root
      if (!targetParentId) {
        return {
          ...prev,
          scenarios: [...cleanedScenarios, movingNode]
        };
      }

      const insertRecursive = (nodes) => {
        return nodes.map(node => {
          if (node.id === targetParentId) {
            return {
              ...node,
              children: [...(node.children || []), movingNode]
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
        scenarios: insertRecursive(cleanedScenarios)
      };
    });
  };

  // Reorder scenario node up or down among its siblings
  const reorderScenario = (nodeId, direction) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    setUniverseState(prev => {
      const reorderInArray = (nodes) => {
        const idx = nodes.findIndex(n => n.id === nodeId);
        if (idx !== -1) {
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= nodes.length) return nodes;
          const newNodes = [...nodes];
          const [moved] = newNodes.splice(idx, 1);
          newNodes.splice(targetIdx, 0, moved);
          return newNodes;
        }
        return nodes.map(node => {
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: reorderInArray(node.children)
            };
          }
          return node;
        });
      };

      return {
        ...prev,
        scenarios: reorderInArray(prev.scenarios)
      };
    });
  };

  const reorderRelativeScenario = (draggedId, targetId, pos) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    setUniverseState(prev => {
      // Remove the dragged node from wherever it lives and collect it
      let draggedNode = null;
      const removeNode = (nodes) => {
        const idx = nodes.findIndex(n => n.id === draggedId);
        if (idx !== -1) {
          draggedNode = nodes[idx];
          const result = [...nodes];
          result.splice(idx, 1);
          return result;
        }
        return nodes.map(n => ({
          ...n,
          children: n.children ? removeNode(n.children) : n.children
        }));
      };

      // Insert the dragged node above or below the target node
      const insertNode = (nodes) => {
        const idx = nodes.findIndex(n => n.id === targetId);
        if (idx !== -1) {
          const insertAt = pos === 'above' ? idx : idx + 1;
          const result = [...nodes];
          result.splice(insertAt, 0, draggedNode);
          return result;
        }
        return nodes.map(n => ({
          ...n,
          children: n.children ? insertNode(n.children) : n.children
        }));
      };

      const withoutDragged = removeNode(prev.scenarios);
      if (!draggedNode) return prev;
      const reordered = insertNode(withoutDragged);
      return { ...prev, scenarios: reordered };
    });
  };

  // Helpers for Maps
  const addMap = (rawMap) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    const newMap = attachCreatorTag(rawMap, localStorage.getItem('userHandle'), currentUser);
    setUniverseState(prev => ({
      ...prev,
      maps: [...prev.maps, newMap]
    }));
    setActiveMapId(newMap.id);
  };

  const updateMap = (id, updates) => {
    if (isStoryReadOnly) return; // Guard: prevent mutation of read-only stories
    setUniverseState(prev => ({
      ...prev,
      maps: prev.maps.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
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

  const updateCreativeState = (updates) => {
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
    setIsDirty(true);
    setUniverseState(prev => ({
      ...prev,
      projectName: name
    }));
  };

  // Story Project Catalog Lifecycle Helpers
  const createNewStory = (name, description = '') => {
    const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
      customAssets: { terrains: [], objects: [] },
      updatedAt: new Date().toISOString()
    };
    const newStory = attachCreatorTag(rawStory, localStorage.getItem('userHandle'), currentUser);

    isSyncingFromFirestore.current = true;
    lastSyncedCloudUpdatedAtRef.current = newStory.updatedAt;
    setUniverseState(newStory);
    setActiveScenarioId(`elem_${Date.now()}_1`);
    setActiveMapId(null);
    setIsDirty(false);
    setSyncConflict(null);

    setStoryCatalog(prev => {
      const updated = [newStory, ...prev.filter(s => s.id !== newId)];
      StorageService.setItem('tangent_story_catalog', updated);
      return updated;
    });

    if (currentUser) {
      const payloadWithOwner = { ...newStory, ownerId: currentUser.uid };
      setDoc(doc(db, 'user_stories', newId), payloadWithOwner).catch(e => console.warn(e));
    }
    return newStory;
  };

  const openStory = (storyId) => {
    const target = storyCatalog.find(s => s.id === storyId) || publicStoryCatalog.find(s => s.id === storyId);
    if (target) {
      const isOwner = !currentUser || target.ownerId === currentUser.uid;
      isSyncingFromFirestore.current = true;
      lastSyncedCloudUpdatedAtRef.current = target.updatedAt || null;
      setUniverseState(target);
      setIsDirty(false);
      setSyncConflict(null);
      setIsStoryReadOnly(!isOwner);
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
  };

  const closeStory = () => {
    // Perform final backup save of current working story
    if (universeState && universeState.scenarios) {
      saveAllElementsIndependently(universeState.scenarios, currentUser);
      saveAllMapsIndependently(universeState.maps, currentUser);
    }
    return true;
  };

  const deleteStoryProject = async (storyId) => {
    setStoryCatalog(prev => {
      const updated = prev.filter(s => s.id !== storyId);
      StorageService.setItem('tangent_story_catalog', updated);
      return updated;
    });

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'user_stories', storyId));
      } catch (e) {
        console.warn('Failed to delete story doc from Firestore:', e);
      }
    }
  };

  const deleteSavedMap = useCallback(async (mapId) => {
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
    }
  }, [currentUser]);

  const deleteSavedElement = useCallback(async (elementId) => {
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
  }, [currentUser]);

  const updateSavedElement = async (elementId, updates) => {
    let updatedElem = null;
    const taggedUpdates = attachCreatorTag(updates, localStorage.getItem('userHandle'), currentUser);
    setElementsCatalog(prev => {
      const updated = prev.map(e => {
        if (e.id === elementId) {
          updatedElem = attachCreatorTag({
            ...e,
            ...taggedUpdates,
            updatedAt: new Date().toISOString()
          }, localStorage.getItem('userHandle'), currentUser);
          return updatedElem;
        }
        return e;
      });
      if (!updatedElem) {
        updatedElem = attachCreatorTag({
          id: elementId,
          ...taggedUpdates,
          updatedAt: new Date().toISOString(),
          authorEmail: currentUser?.email || 'Local User',
          authorUid: currentUser?.uid || 'local'
        }, localStorage.getItem('userHandle'), currentUser);
        updated.unshift(updatedElem);
      }
      StorageService.setItem('tangent_elements_catalog', updated);
      return updated;
    });

    // If element exists in current working story, sync updates there too
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
      const containsId = (nodes) => {
        for (let n of nodes) {
          if (n.id === elementId) return true;
          if (n.children && containsId(n.children)) return true;
        }
        return false;
      };
      if (prev.scenarios && containsId(prev.scenarios)) {
        setIsDirty(true);
        return { ...prev, scenarios: updateTree(prev.scenarios) };
      }
      return prev;
    });

    if (currentUser && updatedElem) {
      try {
        await setDoc(doc(db, 'story_elements', elementId), updatedElem, { merge: true });
      } catch (e) {
        console.warn('Failed to update element in Firestore:', e);
      }
    }
    return updatedElem;
  };

  const value = {
    universeState,
    setUniverseState,
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
    handleClearUniverse,
    updateCreativeState,
    updateGems,
    updateStoryCards,
    updateOutline,
    updateSceneBeats,
    updateDraft,
    getActiveGemsText,
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
    addMap,
    updateMap,
    deleteMap,
    addCustomTerrain,
    updateCustomTerrain,
    deleteCustomTerrain,
    addCustomObject,
    updateCustomObject,
    deleteCustomObject,
    isStoryReadOnly,
    publicStoryCatalog,
    toggleStoryVisibility,
    loadPublicStories,
    clonePublicStory,
    saveStatus,
    setSaveStatus,
    lastSavedTimestamp,
    saveError,
    triggerSave,
    forceSaveNow
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};

export const CampaignProvider = StoryProvider;
