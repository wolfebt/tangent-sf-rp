import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, onSnapshot, collection, getDocs, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { attachCreatorTag } from '../utils/creatorUtils';

const StoryContext = createContext();

export const useStory = () => useContext(StoryContext);
export const useCampaign = useStory;

const UNIVERSE_DOC_ID = 'main';

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
      content: '<p>Welcome to Tangent Story Foundry. Build your world using interactive elements.</p>',
      children: []
    }
  ],
  maps: [],
  customAssets: { terrains: [], objects: [] },
  creativeState: {
    gems: [],
    storyCards: [],
    storyOutline: '',
    storyDraft: '',
    linkedElements: []
  },
  updatedAt: new Date().toISOString()
};

export const StoryProvider = ({ children }) => {
  // Global Universe State — primary source is Firestore; localStorage is secondary offline cache
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
  const isSyncingFromFirestore = React.useRef(false);
  const lastSyncedCloudUpdatedAtRef = React.useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('offline'); // 'synced' | 'syncing' | 'conflict' | 'offline' | 'error'
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState(null);
  const [syncConflict, setSyncConflict] = useState(null); // { type, cloudData, localData, cloudUpdatedAt, localUpdatedAt }

  const isDirtyRef = React.useRef(isDirty);
  const universeStateRef = React.useRef(universeState);
  useEffect(() => {
    isDirtyRef.current = isDirty;
    universeStateRef.current = universeState;
  }, [isDirty, universeState]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) setCloudSyncStatus('offline');
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
      try {
        localStorage.setItem('tangent_elements_catalog', JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Failed to cache elements catalog to localStorage:', e);
      }
      return updatedList;
    });

    // Write individual elements to Firestore 'story_elements' collection if authenticated
    if (user && db) {
      try {
        const batch = writeBatch(db);
        extractedElements.forEach(elem => {
          const docRef = doc(db, 'story_elements', elem.id);
          batch.set(docRef, elem, { merge: true });
        });
        await batch.commit();
      } catch (err) {
        console.warn('Batch independent element write to Firestore failed:', err.message);
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
      const stories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (stories.length > 0) {
        setStoryCatalog(prev => {
          const map = new Map(prev.map(s => [s.id, s]));
          stories.forEach(s => map.set(s.id, s));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('tangent_story_catalog', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    }).catch(e => console.warn('Failed to load user stories from cloud:', e));

    // Fetch elements library from Cloud DB
    const elementsCol = collection(db, 'story_elements');
    getDocs(elementsCol).then((snap) => {
      const elems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (elems.length > 0) {
        setElementsCatalog(prev => {
          const map = new Map(prev.map(e => [e.id, e]));
          elems.forEach(e => map.set(e.id, e));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('tangent_elements_catalog', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    }).catch(e => console.warn('Failed to load elements catalog from cloud:', e));

    const mainDocRef = doc(db, 'universe', UNIVERSE_DOC_ID);
    const unsub = onSnapshot(mainDocRef, (snap) => {
      if (snap.exists()) {
        const firestoreData = snap.data();
        
        // Echo check: if timestamp matches our last synced cloud write, acknowledge sync
        if (lastSyncedCloudUpdatedAtRef.current && firestoreData.updatedAt === lastSyncedCloudUpdatedAtRef.current) {
          setCloudSyncStatus('synced');
          return;
        }

        // If local state has unsaved modifications (isDirty is true), flag a conflict instead of overwriting
        if (isDirtyRef.current) {
          console.warn('Remote cloud doc updated while local edits exist.');
          setCloudSyncStatus('conflict');
          setSyncConflict({
            type: 'remote_update',
            cloudData: firestoreData,
            localData: universeStateRef.current,
            cloudUpdatedAt: firestoreData.updatedAt || 'Unknown',
            localUpdatedAt: universeStateRef.current.updatedAt || 'Unknown'
          });
          return;
        }

        // Standard clean sync from Firestore
        isSyncingFromFirestore.current = true;
        lastSyncedCloudUpdatedAtRef.current = firestoreData.updatedAt || new Date().toISOString();
        setUniverseState(firestoreData);
        setCloudSyncStatus('synced');
        setLastCloudSavedAt(new Date().toLocaleTimeString());
      } else {
        setCloudSyncStatus('synced');
      }
    }, (err) => {
      console.warn('Firestore universe listener error:', err.message);
      setCloudSyncStatus('error');
    });
    return () => unsub();
  }, [currentUser]);

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
      try {
        localStorage.setItem('tangent_story_catalog', JSON.stringify(updated));
      } catch (e) {}
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
      try {
        localStorage.setItem('tangent_story_catalog', JSON.stringify(updated));
      } catch (e) {}
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

  // Auto-persist active universe state to Firestore & Local Storage on mutation
  useEffect(() => {
    if (isStoryReadOnly) return; // Prevent auto-save when viewing a read-only public story

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

    // Synchronously set the ref so the onSnapshot echo check passes when this timestamp broadcasts
    lastSyncedCloudUpdatedAtRef.current = updatedState.updatedAt;

    // Mirror to localStorage cache
    try {
      localStorage.setItem('tangent_universe_state', JSON.stringify(updatedState));
    } catch (e) {}

    // Update story catalog entry
    setStoryCatalog(prev => {
      const exists = prev.some(s => s.id === currentProjectId);
      const updatedCatalog = exists
        ? prev.map(s => s.id === currentProjectId ? updatedState : s)
        : [...prev, updatedState];
      try {
        localStorage.setItem('tangent_story_catalog', JSON.stringify(updatedCatalog));
      } catch (e) {}
      return updatedCatalog;
    });

    // Save all story elements independently automatically
    saveAllElementsIndependently(universeState.scenarios, currentUser);

    // Only write to Firestore when authenticated
    if (!currentUser) {
      setCloudSyncStatus('offline');
      return;
    }

    setCloudSyncStatus('syncing');
    const userStoryDoc = doc(db, 'user_stories', currentProjectId);
    const mainDoc = doc(db, 'universe', UNIVERSE_DOC_ID);
    const payloadWithOwner = { ...updatedState, ownerId: currentUser.uid };

    Promise.all([
      setDoc(userStoryDoc, payloadWithOwner),
      setDoc(mainDoc, payloadWithOwner)
    ]).then(() => {
      lastSyncedCloudUpdatedAtRef.current = updatedState.updatedAt;
      setCloudSyncStatus('synced');
      setLastCloudSavedAt(new Date().toLocaleTimeString());
    }).catch(err => {
      console.warn('Firestore auto-save failed:', err.message);
      setCloudSyncStatus('error');
    });
  }, [universeState, currentUser, saveAllElementsIndependently, syncConflict]);

  // Manual Push to Cloud DB (Recommendation #5: Conflict handling before cloud push)
  const pushUniverseToCloud = async (options = {}) => {
    if (!currentUser) {
      alert("Please login to push data to Cloud DB.");
      return false;
    }
    try {
      setCloudSyncStatus('syncing');
      const docRef = doc(db, 'universe', UNIVERSE_DOC_ID);

      // Pre-push conflict check: Fetch current cloud document's updatedAt timestamp
      if (!options.force) {
        const snap = await getDoc(docRef);
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
                localData: universeState,
                cloudUpdatedAt,
                localUpdatedAt: universeState.updatedAt || new Date().toISOString()
              };
              setSyncConflict(conflictInfo);
              setCloudSyncStatus('conflict');
              return false;
            }
          }
        }
      }

      const updatedTime = new Date().toISOString();
      const updatedState = {
        ...universeState,
        updatedAt: updatedTime
      };
      const payloadWithOwner = { ...updatedState, ownerId: currentUser.uid };

      const currentProjectId = universeState.id || 'proj_default_universe';
      const userStoryDoc = doc(db, 'user_stories', currentProjectId);

      await Promise.all([
        setDoc(userStoryDoc, payloadWithOwner),
        setDoc(docRef, payloadWithOwner)
      ]);

      lastSyncedCloudUpdatedAtRef.current = updatedTime;
      setSyncConflict(null);
      setCloudSyncStatus('synced');
      setIsDirty(false);
      setLastCloudSavedAt(new Date().toLocaleTimeString());
      if (options.showSuccessAlert !== false) {
        alert("Universe state successfully pushed to Cloud DB!");
      }
      return true;
    } catch (err) {
      console.error("Failed to push to Cloud DB:", err);
      setCloudSyncStatus('error');
      alert(`Cloud DB Push failed: ${err.message}`);
      return false;
    }
  };

  // Manual Pull from Cloud DB
  const pullUniverseFromCloud = async () => {
    if (!currentUser) {
      alert("Please login to pull data from Cloud DB.");
      return false;
    }
    try {
      setCloudSyncStatus('syncing');
      const docRef = doc(db, 'universe', UNIVERSE_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const firestoreData = snap.data();
        isSyncingFromFirestore.current = true;
        lastSyncedCloudUpdatedAtRef.current = firestoreData.updatedAt || new Date().toISOString();
        setUniverseState(firestoreData);
        setSyncConflict(null);
        setIsDirty(false);
        setCloudSyncStatus('synced');
        setLastCloudSavedAt(new Date().toLocaleTimeString());
        alert("Universe state successfully pulled from Cloud DB!");
        return true;
      } else {
        alert("No Cloud DB universe document found.");
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
      const elements = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    localStorage.removeItem('tangent_universe_state');
    setUniverseState(DEFAULT_UNIVERSE_STATE);
    setActiveScenarioId(null);
    setActiveMapId(null);
    setIsDirty(false);
    // Clear Firestore universe document
    if (currentUser) {
      try {
        const docRef = doc(db, 'universe', UNIVERSE_DOC_ID);
        const payloadWithOwner = { ...DEFAULT_UNIVERSE_STATE, ownerId: currentUser.uid };
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
    const newMap = attachCreatorTag(rawMap, localStorage.getItem('userHandle'), currentUser);
    setUniverseState(prev => ({
      ...prev,
      maps: [...prev.maps, newMap]
    }));
    setActiveMapId(newMap.id);
  };

  const updateMap = (id, updates) => {
    setUniverseState(prev => ({
      ...prev,
      maps: prev.maps.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const deleteMap = (id) => {
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
        ...(prev.creativeState || { gems: [], storyCards: [], storyOutline: '', storyDraft: '', linkedElements: [] }),
        ...updates
      }
    }));
  };

  const updateGems = (gems) => updateCreativeState({ gems });
  const updateStoryCards = (storyCards) => updateCreativeState({ storyCards });
  const updateOutline = (storyOutline) => updateCreativeState({ storyOutline });
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

    setUniverseState(newStory);
    setActiveScenarioId(`elem_${Date.now()}_1`);
    setActiveMapId(null);
    setIsDirty(false);

    setStoryCatalog(prev => {
      const updated = [newStory, ...prev.filter(s => s.id !== newId)];
      try {
        localStorage.setItem('tangent_story_catalog', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (currentUser) {
      setDoc(doc(db, 'user_stories', newId), newStory).catch(e => console.warn(e));
    }
    return newStory;
  };

  const openStory = (storyId) => {
    const target = storyCatalog.find(s => s.id === storyId) || publicStoryCatalog.find(s => s.id === storyId);
    if (target) {
      const isOwner = !currentUser || target.ownerId === currentUser.uid;
      setUniverseState(target);
      setIsDirty(false);
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
    }
    return true;
  };

  const deleteStoryProject = async (storyId) => {
    setStoryCatalog(prev => {
      const updated = prev.filter(s => s.id !== storyId);
      try {
        localStorage.setItem('tangent_story_catalog', JSON.stringify(updated));
      } catch (e) {}
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

  const deleteSavedElement = async (elementId) => {
    setElementsCatalog(prev => {
      const updated = prev.filter(e => e.id !== elementId);
      try {
        localStorage.setItem('tangent_elements_catalog', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'story_elements', elementId));
      } catch (e) {
        console.warn('Failed to delete element from Firestore:', e);
      }
    }
  };

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
      try {
        localStorage.setItem('tangent_elements_catalog', JSON.stringify(updated));
      } catch (e) {}
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
    updateProjectName,
    handleClearUniverse,
    updateCreativeState,
    updateGems,
    updateStoryCards,
    updateOutline,
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
    clonePublicStory
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};

export const CampaignProvider = StoryProvider;
