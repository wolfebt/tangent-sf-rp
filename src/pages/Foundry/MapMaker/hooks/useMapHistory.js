import { useState, useEffect, useCallback } from 'react';

export const useMapHistory = ({ currentMap, lines, tokens, terrains, objects, texts, walls = [], fog, mapLayers, updateMap, activeMapId }) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const recordHistory = useCallback(() => {
    if (!currentMap) return;
    const snapshot = {
      lines,
      tokens,
      terrains,
      objects,
      texts,
      walls,
      fog,
      layers: mapLayers
    };
    setUndoStack(prev => [...prev.slice(-30), snapshot]);
    setRedoStack([]);
  }, [currentMap, lines, tokens, terrains, objects, texts, walls, fog, mapLayers]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !currentMap) return;
    const previousState = undoStack[undoStack.length - 1];
    const currentSnapshot = { lines, tokens, terrains, objects, texts, walls, fog, layers: mapLayers };
    
    setRedoStack(prev => [...prev, currentSnapshot]);
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    updateMap(activeMapId, previousState);
  }, [undoStack, currentMap, lines, tokens, terrains, objects, texts, walls, fog, mapLayers, updateMap, activeMapId]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !currentMap) return;
    const nextState = redoStack[redoStack.length - 1];
    const currentSnapshot = { lines, tokens, terrains, objects, texts, walls, fog, layers: mapLayers };
    
    setUndoStack(prev => [...prev, currentSnapshot]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    updateMap(activeMapId, nextState);
  }, [redoStack, currentMap, lines, tokens, terrains, objects, texts, walls, fog, mapLayers, updateMap, activeMapId]);

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

  return { undoStack, redoStack, recordHistory, handleUndo, handleRedo };
};
