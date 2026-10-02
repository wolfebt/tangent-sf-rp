/**
 * @file useStageTools.ts
 * @description Hook managing Stage viewport navigation, pan/zoom controls,
 * keyboard shortcuts, and VttEventBus tool integration.
 */

import { useState, useEffect, useCallback } from 'react';
import { VttEventBus } from '../../../utils/vttEventBus';
import { AudioService } from '../../../services/audioService';

export interface UseStageToolsProps {
  setActiveDesignTool?: (tool: any) => void;
  setIsDesignModeActive?: (setter: (prev: boolean) => boolean) => void;
  rendererContextRef?: React.MutableRefObject<any>;
}

export function useStageTools({
  setActiveDesignTool,
  setIsDesignModeActive,
  rendererContextRef
}: UseStageToolsProps = {}) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'combat' | 'spawner' | 'turns' | 'objects' | 'dice'>('combat');

  // Listen to navigation and tool events across VttEventBus
  useEffect(() => {
    const unsubPan = VttEventBus.on('pan-stage-to', (payload) => {
      if (payload) {
        const renderer = rendererContextRef?.current;
        const app = renderer?.getApp?.();
        const canvasWidth = app?.renderer?.width || 1200;
        const canvasHeight = app?.renderer?.height || 800;
        const targetZoom = payload.zoom || zoom;
        setPan({
          x: Math.round(canvasWidth / 2 - payload.x * targetZoom),
          y: Math.round(canvasHeight / 2 - payload.y * targetZoom)
        });
        if (payload.zoom) setZoom(payload.zoom);
        AudioService.playTerminalBeep(1200, 0.03);
      }
    });

    const unsubTool = VttEventBus.on('arm-stage-tool', (payload) => {
      if (payload?.tool && setActiveDesignTool && setIsDesignModeActive) {
        setActiveDesignTool(payload.tool);
        setIsDesignModeActive(() => true);
      }
    });

    const unsubToggleDesign = VttEventBus.on('toggle-stage-design-mode', (payload) => {
      if (setIsDesignModeActive) {
        setIsDesignModeActive(prev => payload?.active !== undefined ? payload.active : !prev);
      }
    });

    return () => {
      unsubPan();
      unsubTool();
      unsubToggleDesign();
    };
  }, [zoom, setActiveDesignTool, setIsDesignModeActive]);

  const handleZoomIn = useCallback(() => {
    AudioService.playTerminalBeep(1200, 0.02);
    setZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)));
  }, []);

  const handleZoomOut = useCallback(() => {
    AudioService.playTerminalBeep(900, 0.02);
    setZoom(z => Math.max(0.25, +(z - 0.15).toFixed(2)));
  }, []);

  const handleResetView = useCallback(() => {
    AudioService.playTerminalBeep(1000, 0.03);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    isDraggingPan,
    setIsDraggingPan,
    dragStartPos,
    setDragStartPos,
    activeTab,
    setActiveTab,
    handleZoomIn,
    handleZoomOut,
    handleResetView
  };
}
