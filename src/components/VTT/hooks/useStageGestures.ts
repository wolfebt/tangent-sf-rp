import React, { useEffect } from 'react';

export interface UseStageGesturesProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setIsDraggingPan: (dragging: boolean) => void;
  setIsMarqueeActive: (active: boolean) => void;
  setIsDrawingToolActive: (active: boolean) => void;
}

/**
 * Handles stage gestures: smooth zoom with mouse wheel and global drag safety listeners
 */
export const useStageGestures = ({
  canvasRef,
  setZoom,
  setIsDraggingPan,
  setIsMarqueeActive,
  setIsDrawingToolActive
}: UseStageGesturesProps) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Ignore wheel click / middle click or zero/negligible delta to prevent zoom jump on click
      if ((e.buttons & 4) || !e.deltaY || Math.abs(e.deltaY) < 1) return;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(prev => Math.max(0.4, Math.min(2.5, prev * zoomFactor)));
    };

    // Global listener ensures map never sticks to cursor if mouse leaves canvas or context menu closes
    const handleGlobalMouseUp = () => {
      setIsDraggingPan(false);
      setIsMarqueeActive(false);
      setIsDrawingToolActive(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('blur', handleGlobalMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('blur', handleGlobalMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [canvasRef, setZoom, setIsDraggingPan, setIsMarqueeActive, setIsDrawingToolActive]);
};
