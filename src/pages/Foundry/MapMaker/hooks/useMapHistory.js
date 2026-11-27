import { useState, useEffect, useCallback, useRef } from 'react';

export const useMapHistory = ({ currentMap, lines, tokens, terrains, objects, texts, walls = [], lights = [], regions = [], fog, mapLayers, updateMap, activeMapId, enabled = true }) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [lastActionDescription, setLastActionDescription] = useState('Initial Sector State');
  const prevMapIdRef = useRef(activeMapId);
  const lastCoalesceRef = useRef({ key: null, ts: 0 });

  useEffect(() => {
    if (prevMapIdRef.current !== activeMapId) {
      prevMapIdRef.current = activeMapId;
      setUndoStack([]);
      setRedoStack([]);
      setLastActionDescription('Initial Sector State');
      lastCoalesceRef.current = { key: null, ts: 0 };
    }
  }, [activeMapId]);

  const buildSnapshot = useCallback((description) => ({
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
    gridSize: currentMap?.gridSize || 50,
    underlay: currentMap?.underlay ? JSON.parse(JSON.stringify(currentMap.underlay)) : (currentMap?.underlay ?? null),
    underlays: Array.isArray(currentMap?.underlays) ? JSON.parse(JSON.stringify(currentMap.underlays)) : (currentMap?.underlays ?? []),
    videoBackgroundUrl: currentMap?.videoBackgroundUrl || '',
    fogEnabled: Boolean(currentMap?.fogEnabled),
    lighting: currentMap?.lighting ? JSON.parse(JSON.stringify(currentMap.lighting)) : (currentMap?.lighting ?? null),
    ambientLight: currentMap?.ambientLight ?? null,
    weatherFx: currentMap?.weatherFx ?? null,
    metadata: currentMap?.metadata ? JSON.parse(JSON.stringify(currentMap.metadata)) : {},
    environment: currentMap?.environment ? JSON.parse(JSON.stringify(currentMap.environment)) : (currentMap?.environment ?? null),
    gridMode: currentMap?.gridMode || 'hex',
    description,
    timestamp: Date.now()
  }), [currentMap, lines, tokens, terrains, objects, texts, walls, lights, regions, fog, mapLayers]);

  const recordHistory = useCallback((actionDescription = 'Edit Sector', options = {}) => {
    if (!currentMap) return;
    const now = Date.now();
    const coalesceKey = options?.coalesceKey || null;
    const coalesceMs = Number.isFinite(options?.coalesceMs) ? options.coalesceMs : 800;

    if (
      coalesceKey &&
      lastCoalesceRef.current.key === coalesceKey &&
      (now - lastCoalesceRef.current.ts) < coalesceMs
    ) {
      lastCoalesceRef.current.ts = now;
      setRedoStack([]);
      return;
    }

    lastCoalesceRef.current = { key: coalesceKey, ts: now };
    const snapshot = buildSnapshot(actionDescription);
    setUndoStack(prev => [...prev.slice(-50), snapshot]);
    setRedoStack([]);
    setLastActionDescription(actionDescription);
  }, [currentMap, buildSnapshot]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !currentMap) return;
    lastCoalesceRef.current = { key: null, ts: 0 };
    const previousState = undoStack[undoStack.length - 1];
    const currentSnapshot = buildSnapshot(lastActionDescription);

    setRedoStack(prev => [...prev, currentSnapshot]);
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setLastActionDescription(previousState.description || 'Undo');
    const { description: _desc, timestamp: _ts, ...mapPatch } = previousState;
    updateMap(activeMapId, mapPatch);
  }, [undoStack, currentMap, buildSnapshot, updateMap, activeMapId, lastActionDescription]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !currentMap) return;
    lastCoalesceRef.current = { key: null, ts: 0 };
    const nextState = redoStack[redoStack.length - 1];
    const currentSnapshot = buildSnapshot(lastActionDescription);

    setUndoStack(prev => [...prev, currentSnapshot]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setLastActionDescription(nextState.description || 'Redo');
    const { description: _desc, timestamp: _ts, ...mapPatch } = nextState;
    updateMap(activeMapId, mapPatch);
  }, [redoStack, currentMap, buildSnapshot, updateMap, activeMapId, lastActionDescription]);

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
