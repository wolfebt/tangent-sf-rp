import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, onSnapshot, collection, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
  projectName: 'Tangent Universe',
  scenarios: [],
  maps: [],
  customAssets: { terrains: [], objects: [] }
};

export const StoryProvider = ({ children }) => {
  // Global Universe State — primary source is Firestore; localStorage is secondary offline cache
  const [universeState, setUniverseState] = useState(() => {
    try {
      const saved = localStorage.getItem('tangent_universe_state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved universe state from localStorage:', e);
    }
    return DEFAULT_UNIVERSE_STATE;
  });

  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [activeMapId, setActiveMapId] = useState(null);

  // Track auth & Cloud DB connection state
  const UNIVERSE_DOC_ID = 'main';
  const isSyncingFromFirestore = React.useRef(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('offline'); // 'synced' | 'syncing' | 'offline' | 'error'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) setCloudSyncStatus('offline');
    });
    return () => unsub();
  }, []);

  // Real-time Firestore listener for shared universe document — only when signed in
  useEffect(() => {
    if (!currentUser) {
      setCloudSyncStatus('offline');
      return;
    }
    setCloudSyncStatus('syncing');
    const docRef = doc(db, 'universe', UNIVERSE_DOC_ID);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const firestoreData = snap.data();
        isSyncingFromFirestore.current = true;
        setUniverseState(firestoreData);
        setCloudSyncStatus('synced');
        // Mirror to localStorage as offline cache
        try {
          localStorage.setItem('tangent_universe_state', JSON.stringify(firestoreData));
        } catch (e) {
          console.warn('Failed to cache universe state to localStorage:', e);
        }
      } else {
        setCloudSyncStatus('synced');
      }
    }, (err) => {
      console.warn('Firestore universe listener error (using localStorage fallback):', err.message);
      setCloudSyncStatus('error');
    });
    return () => unsub();
  }, [currentUser]);

  // Auto-persist universe state to Firestore and localStorage on every local mutation
  useEffect(() => {
    // Skip if this state update came FROM Firestore (prevent write-back loop)
    if (isSyncingFromFirestore.current) {
      isSyncingFromFirestore.current = false;
      return;
    }
    // Always mirror to localStorage cache
    try {
      localStorage.setItem('tangent_universe_state', JSON.stringify(universeState));
    } catch (e) {
      console.warn('Failed to cache universe state to localStorage:', e);
    }
    // Only write to Firestore when authenticated
    if (!currentUser) {
      setCloudSyncStatus('offline');
      return;
    }
    setCloudSyncStatus('syncing');
    const docRef = doc(db, 'universe', UNIVERSE_DOC_ID);
    setDoc(docRef, universeState)
      .then(() => setCloudSyncStatus('synced'))
      .catch(err => {
        console.warn('Firestore universe write failed (localStorage cache applied):', err.message);
        setCloudSyncStatus('error');
      });
  }, [universeState, currentUser]);

  // Manual Push to Cloud DB
  const pushUniverseToCloud = async () => {
    if (!currentUser) {
      alert("Please login to push data to Cloud DB.");
      return false;
    }
    try {
      setCloudSyncStatus('syncing');
      const docRef = doc(db, 'universe', UNIVERSE_DOC_ID);
      await setDoc(docRef, universeState);
      setCloudSyncStatus('synced');
      alert("Universe state successfully pushed to Cloud DB!");
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
      const snap = await getDocs(collection(db, 'universe'));
      const mainDoc = snap.docs.find(d => d.id === UNIVERSE_DOC_ID);
      if (mainDoc && mainDoc.exists()) {
        const firestoreData = mainDoc.data();
        isSyncingFromFirestore.current = true;
        setUniverseState(firestoreData);
        setCloudSyncStatus('synced');
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

  // Save individual Story Element to Cloud DB collection ('story_elements')
  const saveElementToCloud = async (elementNode) => {
    if (!currentUser) {
      alert("Please login to save elements to Cloud DB.");
      return false;
    }
    if (!elementNode || !elementNode.id) return false;
    try {
      setCloudSyncStatus('syncing');
      const payload = {
        ...elementNode,
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
    // Clear Firestore universe document
    try {
      const docRef = doc(db, 'universe', UNIVERSE_DOC_ID);
      await setDoc(docRef, DEFAULT_UNIVERSE_STATE);
    } catch (err) {
      console.warn('Firestore universe clear failed:', err.message);
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
  const addScenario = (newScenario, parentId = null) => {
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
  const addMap = (newMap) => {
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
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [] };
      return {
        ...prev,
        customAssets: {
          ...custom,
          terrains: [...custom.terrains, { ...terrain, isCustom: true }]
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
    setUniverseState(prev => {
      const custom = prev.customAssets || { terrains: [], objects: [] };
      return {
        ...prev,
        customAssets: {
          ...custom,
          objects: [...custom.objects, { ...obj, isCustom: true }]
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

  const updateProjectName = (name) => {
    setUniverseState(prev => ({
      ...prev,
      projectName: name
    }));
  };

  const value = {
    universeState,
    setUniverseState,
    updateProjectName,
    handleClearUniverse,
    cloudSyncStatus,
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
    deleteCustomObject
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};

export const CampaignProvider = StoryProvider;
