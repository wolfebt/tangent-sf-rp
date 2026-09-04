import { useState, useEffect, useCallback } from 'react';

export const useMapHistory = ({ currentMap, lines, tokens, terrains, objects, texts, walls = [], lights = [], fog, mapLayers, updateMap, activeMapId }) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [lastActionDescription, setLastActionDescription] = useState('Initial Sector State');

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
      fog: fog || [],
      layers: mapLayers,
      description: actionDescription,
      timestamp: Date.now()
    };
    setUndoStack(prev => [...prev.slice(-50), snapshot]);
    setRedoStack([]);
    setLastActionDescription(actionDescription);
  }, [currentMap, lines, tokens, terrains, objects, texts, walls, lights, fog, mapLayers]);

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
      fog: fog || [], 
      layers: mapLayers,
      description: lastActionDescription,
      timestamp: Date.now()
    };
    
    setRedoStack(prev => [...prev, currentSnapshot]);
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setLastActionDescription(previousState.description || 'Undo');
    updateMap(activeMapId, previousState);
  }, [undoStack, currentMap, lines, tokens, terrains, objects, texts, walls, lights, fog, mapLayers, updateMap, activeMapId, lastActionDescription]);

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
      fog: fog || [], 
      layers: mapLayers,
      description: lastActionDescription,
      timestamp: Date.now()
    };
    
    setUndoStack(prev => [...prev, currentSnapshot]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setLastActionDescription(nextState.description || 'Redo');
    updateMap(activeMapId, nextState);
  }, [redoStack, currentMap, lines, tokens, terrains, objects, texts, walls, lights, fog, mapLayers, updateMap, activeMapId, lastActionDescription]);

  useEffect(() => {
    const handleKeyDown = (e) => {
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
  }, [handleUndo, handleRedo]);

  return { undoStack, redoStack, recordHistory, handleUndo, handleRedo, lastActionDescription };
};
