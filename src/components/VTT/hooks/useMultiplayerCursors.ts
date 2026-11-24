import { useEffect, type RefObject } from 'react';
import { Container } from 'pixi.js';
import { clearPixiContainer } from '../utils/pixiCleanup';

export interface UseMultiplayerCursorsOptions {
  containerRef: RefObject<Container | null>;
  isMultiplayerSimActive: boolean;
  isSimulationPaused: boolean;
  canvasGeneration?: number;
}

/**
 * Manages remote collaborator cursor layer clearing without spawning fake local bot cursors.
 */
export function useMultiplayerCursors({
  containerRef,
  isMultiplayerSimActive,
  isSimulationPaused,
  canvasGeneration = 0
}: UseMultiplayerCursorsOptions) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || (container as any).destroyed) return undefined;

    clearPixiContainer(container);
    return () => {
      if (!(container as any).destroyed) {
        clearPixiContainer(container);
      }
    };
  }, [containerRef, isMultiplayerSimActive, isSimulationPaused, canvasGeneration]);
}
