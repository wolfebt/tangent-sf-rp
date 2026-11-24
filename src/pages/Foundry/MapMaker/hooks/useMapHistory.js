import { useState, useEffect, useCallback, useRef } from 'react';

export const useMapHistory = ({ currentMap, lines, tokens, terrains, objects, texts, walls = [], lights = [], regions = [], fog, mapLayers, updateMap, activeMapId, enabled = true }) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [lastActionDescription, setLastActionDescription] = useState('Initial Sector State');
  const prevMapIdRef = useRef(activeMapId);

  useEffect(() => {
    if (prevMapIdRef.current !== activeMapId) {
      prevMapIdRef.current = activeMapId;
      setUndoStack([]);
      setRedoStack([]);
      setLastActionDescription('Initial Sector State');
    }
  }, [activeMapId]);

  const recordHistory = useCallback((actionDescription = 'Edit Sector') => {
    if (!currentMap) return;
    const snapshot = {
      lines: lines || [],
      tokens: tokens || [],
      terrains: terrains || [],
      objects: objects || [],
      texts: texts || [],
      walls: walls || [],
      lights: lights || [],
      regions: regions || [],
      fog: fog || [],
      chunkInstances: currentMap?.chunkInstances || [],
      layers: mapLayers,
      description: actionDescription,
      timestamp: Date.now()
    };
    setUndoStack(prev => [...prev.slice(-50), snapshot]);
    setRedoStack([]);
    setLastActionDescription(actionDescription);
  }, [currentMap, lines, tokens, terrains, objects, texts, walls, lights, regions, fog, mapLayers]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !currentMap) return;
    const previousState = undoStack[undoStack.length - 1];
    const currentSnapshot = { 
      lines: lines || [], 
      tokens: tokens || [], 
      terrains: terrains || [], 
      objects: objects || [], 
      texts: texts || [], 
      walls: walls || [], 
      lights: lights || [], 
      regions: regions || [], 
      fog: fog || [], 
      chunkInstances: currentMap?.chunkInstances || [],
      layers: mapLayers,
      description: lastActionDescription,
      timestamp: Date.now()
    };
    
    setRedoStack(prev => [...prev, currentSnapshot]);
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setLastActionDescription(previousState.description || 'Undo');
    const { description: _desc, timestamp: _ts, ...mapPatch } = previousState;
    updateMap(activeMapId, mapPatch);
  }, [undoStack, currentMap, lines, tokens, terrains, objects, texts, walls, lights, regions, fog, mapLayers, updateMap, activeMapId, lastActionDescription]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !currentMap) return;
    const nextState = redoStack[redoStack.length - 1];
    const currentSnapshot = { 
      lines: lines || [], 
      tokens: tokens || [], 
      terrains: terrains || [], 
      objects: objects || [], 
      texts: texts || [], 
      walls: walls || [], 
      lights: lights || [], 
      regions: regions || [], 
      fog: fog || [], 
      chunkInstances: currentMap?.chunkInstances || [],
      layers: mapLayers,
      description: lastActionDescription,
      timestamp: Date.now()
    };
    
    setUndoStack(prev => [...prev, currentSnapshot]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setLastActionDescription(nextState.description || 'Redo');
    const { description: _desc, timestamp: _ts, ...mapPatch } = nextState;
    updateMap(activeMapId, mapPatch);
  }, [redoStack, currentMap, lines, tokens, terrains, objects, texts, walls, lights, regions, fog, mapLayers, updateMap, activeMapId, lastActionDescription]);

  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleUndo, handleRedo]);

  return { undoStack, redoStack, recordHistory, handleUndo, handleRedo, lastActionDescription };
};
