/**
 * @file useMapHistory.test.jsx
 * @description Vitest + React Testing Library suite for MapMaker undo/redo snapshot stack and keyboard shortcuts.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMapHistory } from '../useMapHistory.js';

describe('useMapHistory Hook — Undo/Redo Stack & Keyboard Shortcuts', () => {
  const createProps = (overrides = {}) => ({
    currentMap: { id: 'sector-alpha', name: 'Sector Alpha' },
    lines: [{ id: 'l1' }],
    tokens: [{ id: 'tok-1', name: 'Vance' }],
    terrains: [],
    objects: [],
    texts: [],
    walls: [{ id: 'w1', p1: { x: 0, y: 0 }, p2: { x: 100, y: 0 } }],
    lights: [],
    fog: [],
    mapLayers: { grid: true },
    updateMap: vi.fn(),
    activeMapId: 'sector-alpha',
    ...overrides
  });

  it('records snapshots into undoStack, clears redoStack, and updates lastActionDescription', () => {
    const props = createProps();
    const { result } = renderHook((p) => useMapHistory(p), { initialProps: props });

    expect(result.current.undoStack).toHaveLength(0);
    expect(result.current.lastActionDescription).toBe('Initial Sector State');

    act(() => {
      result.current.recordHistory('Add Blast Door');
    });

    expect(result.current.undoStack).toHaveLength(1);
    expect(result.current.undoStack[0].description).toBe('Add Blast Door');
    expect(result.current.redoStack).toHaveLength(0);
    expect(result.current.lastActionDescription).toBe('Add Blast Door');
  });

  it('caps undoStack at 51 entries (50 retained + latest snapshot) and supports handleUndo / handleRedo', () => {
    const updateMap = vi.fn();
    const props = createProps({ updateMap });
    const { result, rerender } = renderHook((p) => useMapHistory(p), { initialProps: props });

    for (let i = 1; i <= 55; i++) {
      act(() => {
        result.current.recordHistory(`Action ${i}`);
      });
    }

    expect(result.current.undoStack.length).toBeLessThanOrEqual(51);

    // Rerender with mutated tokens before undoing
    rerender({ ...props, tokens: [{ id: 'tok-1' }, { id: 'tok-2' }] });

    act(() => {
      result.current.handleUndo();
    });

    expect(updateMap).toHaveBeenCalledTimes(1);
    expect(result.current.redoStack).toHaveLength(1);

    act(() => {
      result.current.handleRedo();
    });

    expect(updateMap).toHaveBeenCalledTimes(2);
    expect(result.current.redoStack).toHaveLength(0);
  });

  it('responds to window Ctrl+Z (Undo), Ctrl+Shift+Z (Redo), and Ctrl+Y (Redo) keyboard events', () => {
    const updateMap = vi.fn();
    const props = createProps({ updateMap });
    const { result } = renderHook((p) => useMapHistory(p), { initialProps: props });

    act(() => {
      result.current.recordHistory('Place Turret');
    });
    expect(result.current.undoStack).toHaveLength(1);

    // Dispatch Ctrl+Z -> Undo
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
    });
    expect(result.current.undoStack).toHaveLength(0);
    expect(result.current.redoStack).toHaveLength(1);
    expect(updateMap).toHaveBeenCalledTimes(1);

    // Dispatch Ctrl+Shift+Z -> Redo
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Z', ctrlKey: true, shiftKey: true }));
    });
    expect(result.current.undoStack).toHaveLength(1);
    expect(result.current.redoStack).toHaveLength(0);
    expect(updateMap).toHaveBeenCalledTimes(2);

    // Undo again then Ctrl+Y -> Redo
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true }));
    });
    expect(result.current.redoStack).toHaveLength(0);
    expect(updateMap).toHaveBeenCalledTimes(4);
  });
});
