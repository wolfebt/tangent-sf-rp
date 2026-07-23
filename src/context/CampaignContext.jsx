import React, { createContext, useContext, useState } from 'react';

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
  // Global Universe State with localStorage persistence
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

  // Auto-persist universe state to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('tangent_universe_state', JSON.stringify(universeState));
    } catch (e) {
      console.error('Failed to save universe state to localStorage:', e);
    }
  }, [universeState]);

  const handleClearUniverse = () => {
    localStorage.removeItem('tangent_universe_state');
    setUniverseState(DEFAULT_UNIVERSE_STATE);
    setActiveScenarioId(null);
    setActiveMapId(null);
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
    addMap,
    updateMap,
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
