import React, { useEffect } from 'react';
import { AudioService } from '../../../services/audioService';
import type { ArchitectDesignTool } from '../ArchitectDesignPalette';

export interface UseStageHotkeysProps {
  selectedAssetIds: string[];
  gridSnap: boolean;
  isDesignModeActive: boolean;
  wallConstructionMode: 'single' | 'chain' | 'room';
  wallChainPoints: { x: number; y: number }[];
  setWallChainPoints: (points: { x: number; y: number }[]) => void;
  setWallDrawStart: (point: { x: number; y: number } | null) => void;
  setWallDrawCurrent: (point: { x: number; y: number } | null) => void;
  setIsDrawingToolActive: (active: boolean) => void;
  setCombatLog: React.Dispatch<React.SetStateAction<string[]>>;
  handleBatchDelete: () => void;
  handleBatchDuplicate: () => void;
  handleBatchNudge: (dx: number, dy: number) => void;
  handleDeselectAll: () => void;
  handleToggleDesignMode: () => void;
  toggleGridSnap: () => void;
  setActiveDesignTool: (tool: ArchitectDesignTool) => void;
}

/**
 * Handles global keyboard shortcuts for Architect & Tactical Stage:
 * - Asset manipulation (Delete, Duplicate, Nudge, Deselect)
 * - Wall chain finalization (Enter, Escape)
 * - Mode and tool switching (M, G, V, W, T, P, L, F, E)
 */
export const useStageHotkeys = ({
  selectedAssetIds,
  gridSnap,
  isDesignModeActive,
  wallConstructionMode,
  wallChainPoints,
  setWallChainPoints,
  setWallDrawStart,
  setWallDrawCurrent,
  setIsDrawingToolActive,
  setCombatLog,
  handleBatchDelete,
  handleBatchDuplicate,
  handleBatchNudge,
  handleDeselectAll,
  handleToggleDesignMode,
  toggleGridSnap,
  setActiveDesignTool
}: UseStageHotkeysProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // 1. Delete Selected Assets (Delete / Backspace)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAssetIds.length > 0) {
        e.preventDefault();
        handleBatchDelete();
        return;
      }

      // 2. Duplicate Selected Assets (Ctrl+D / Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedAssetIds.length > 0) {
        e.preventDefault();
        handleBatchDuplicate();
        return;
      }

      // 3. Arrow Keys Nudge Selected Assets
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedAssetIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? (gridSnap ? 70 : 20) : (gridSnap ? 10 : 2);
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        handleBatchNudge(dx, dy);
        return;
      }

      // 4. Escape to Clear Selection
      if (e.key === 'Escape' && selectedAssetIds.length > 0) {
        e.preventDefault();
        handleDeselectAll();
        return;
      }

      // 5. Finalize Wall Chain (Enter or Escape)
      if ((e.key === 'Enter' || e.key === 'Escape') && wallConstructionMode === 'chain' && wallChainPoints.length > 0) {
        e.preventDefault();
        setWallChainPoints([]);
        setWallDrawStart(null);
        setWallDrawCurrent(null);
        setIsDrawingToolActive(false);
        AudioService.playTerminalBeep(1200, 0.03);
        setCombatLog(prev => [`[WALL CHAIN] Finalized polyline wall chain.`, ...prev.slice(0, 8)]);
        return;
      }

      // 6. Tool Shortcuts (M, G, V, W, T, P, L, F, E)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key.toLowerCase() === 'm') {
          handleToggleDesignMode();
        } else if (e.key.toLowerCase() === 'g') {
          toggleGridSnap();
          AudioService.playTerminalBeep(1000, 0.02);
        } else if (isDesignModeActive) {
          if (e.key.toLowerCase() === 'v') setActiveDesignTool('select');
          else if (e.key.toLowerCase() === 'w') setActiveDesignTool('wall');
          else if (e.key.toLowerCase() === 't') setActiveDesignTool('terrain');
          else if (e.key.toLowerCase() === 'f') setActiveDesignTool('fill');
          else if (e.key.toLowerCase() === 'p') setActiveDesignTool('pencil');
          else if (e.key.toLowerCase() === 'l') setActiveDesignTool('light');
          else if (e.key.toLowerCase() === 'e') setActiveDesignTool('eraser');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedAssetIds, 
    gridSnap, 
    isDesignModeActive, 
    wallConstructionMode, 
    wallChainPoints, 
    handleBatchDelete, 
    handleBatchDuplicate, 
    handleBatchNudge, 
    handleDeselectAll,
    handleToggleDesignMode,
    toggleGridSnap,
    setActiveDesignTool,
    setWallChainPoints,
    setWallDrawStart,
    setWallDrawCurrent,
    setIsDrawingToolActive,
    setCombatLog
  ]);
};
