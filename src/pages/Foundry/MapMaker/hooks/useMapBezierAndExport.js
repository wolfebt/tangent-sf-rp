/**
 * @file useMapBezierAndExport.js
 * @description Extracted helper hook for curved Bezier wall geometry previews
 * and non-blocking PNG / OffscreenCanvas Worker map export in MapMaker.
 */

import { useCallback, useEffect } from 'react';
import { tessellateBezierWall } from '../../../../schemas/vttWallSchema';
import { MapGraphicsCompiler } from '../../../../engine/compilers/MapGraphicsCompiler';
import { exportMapWithWorker } from '../../../../services/mapWorkerExportService';
import { formatExportFilename } from '../../../../context/CampaignContext';

export function computeBezierControlPoint(start, end) {
  if (!start || !end) return null;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= 1) return null;
  return {
    x: Math.round((start.x + end.x) / 2 - (dy / dist) * (dist * 0.25)),
    y: Math.round((start.y + end.y) / 2 + (dx / dist) * (dist * 0.25))
  };
}

export function computeWallPreviewPoints(start, end, isCurved = false) {
  if (!start || !end) return [];
  const straight = [start.x, start.y, end.x, end.y];
  if (!isCurved) return straight;
  const ctrl = computeBezierControlPoint(start, end);
  if (!ctrl) return straight;
  const segs = tessellateBezierWall(start, ctrl, end, 12);
  if (segs.length === 0) return straight;
  return [segs[0].p1.x, segs[0].p1.y, ...segs.flatMap((s) => [s.p2.x, s.p2.y])];
}

export function useMapBezierAndExport({
  currentMap,
  stageRef,
  setSelectedId,
  showToast,
  mapExportPngRef
}) {
  const handleExportPNG = useCallback(() => {
    if (!currentMap) return;
    setSelectedId(null);
    setTimeout(() => {
      try {
        let dataURL = '';
        try {
          const gridSz = currentMap.gridSize || 50;
          const widthCells = currentMap.gridWidth || Math.max(1, Math.round((currentMap.width || 1500) / gridSz));
          const heightCells = currentMap.gridHeight || Math.max(1, Math.round((currentMap.height || 1000) / gridSz));
          dataURL = MapGraphicsCompiler.compileToDataUrl({
            widthCells,
            heightCells,
            pixelsPerGrid: gridSz,
            sourceGridSize: gridSz,
            enableWallShadows: currentMap.enableWallShadows !== false,
            terrains: currentMap.terrains || [],
            underlays: (Array.isArray(currentMap?.underlays) && currentMap.underlays.length > 0)
              ? currentMap.underlays
              : (currentMap?.underlay ? [currentMap.underlay] : []),
            objects: currentMap.objects || [],
            tokens: currentMap.tokens || [],
            texts: currentMap.texts || [],
            walls: currentMap.walls || [],
            lights: currentMap.lights || []
          }, 'image/png', 1) || '';
        } catch {
          dataURL = '';
        }

        if (!dataURL && stageRef.current && typeof stageRef.current.toDataURL === 'function') {
          try {
            dataURL = stageRef.current.toDataURL({ pixelRatio: 2 }) || '';
          } catch {
            dataURL = '';
          }
        }
        const link = document.createElement('a');
        link.download = formatExportFilename(currentMap.title || 'map', 'map', 'png');
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('PNG export error:', err);
        showToast?.({ type: 'error', text: 'Failed to export PNG map image.' });
      }
    }, 50);
  }, [currentMap, stageRef, setSelectedId, showToast]);

  const handleWorkerExportPNG = useCallback(async () => {
    if (!currentMap) return;
    const gridSz = currentMap.gridSize || 50;
    const widthCells = currentMap.gridWidth || Math.max(1, Math.round((currentMap.width || 1500) / gridSz));
    const heightCells = currentMap.gridHeight || Math.max(1, Math.round((currentMap.height || 1000) / gridSz));
    const res = await exportMapWithWorker({
      widthCells,
      heightCells,
      pixelsPerGrid: gridSz,
      sourceGridSize: gridSz,
      enableWallShadows: currentMap.enableWallShadows !== false,
      terrains: currentMap.terrains || [],
      underlays: (Array.isArray(currentMap?.underlays) && currentMap.underlays.length > 0)
        ? currentMap.underlays
        : (currentMap?.underlay ? [currentMap.underlay] : []),
      objects: currentMap.objects || [],
      tokens: currentMap.tokens || [],
      texts: currentMap.texts || [],
      walls: currentMap.walls || [],
      lights: currentMap.lights || [],
      format: 'image/png',
      quality: 0.94
    });
    const link = document.createElement('a');
    link.download = formatExportFilename(currentMap.title || 'map', 'map', 'png');
    link.href = res.dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentMap]);

  useEffect(() => {
    if (mapExportPngRef) {
      mapExportPngRef.current = handleExportPNG;
    }
  }, [mapExportPngRef, handleExportPNG]);

  return {
    handleExportPNG,
    handleWorkerExportPNG,
    computeWallPreviewPoints
  };
}
