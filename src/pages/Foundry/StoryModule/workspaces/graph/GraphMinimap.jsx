/**
 * @file GraphMinimap.jsx
 * @description Floating Radar Minimap HUD for ADE Story Graph.
 * Visualizes the entire campaign node cluster in a compact 2D overview,
 * shows current camera viewport frustum, and supports 1-click drag-to-pan.
 */

import React, { useRef, useMemo } from 'react';
import { MapPin, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';
import { getNodeTypeConfig } from './graphUtils';

export const GraphMinimap = ({
  flatNodes = [],
  getNodePos,
  transform = { x: 0, y: 0, zoom: 1 },
  containerRect = { width: 1000, height: 700 },
  onPanTo,
  isOpen = true,
  onToggle
}) => {
  const minimapRef = useRef(null);
  const MINIMAP_WIDTH = 180;
  const MINIMAP_HEIGHT = 110;

  // Calculate overall graph bounding box
  const bounds = useMemo(() => {
    if (flatNodes.length === 0) {
      return { minX: 0, maxX: 1000, minY: 0, maxY: 600, spanX: 1000, spanY: 600 };
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    flatNodes.forEach(n => {
      const pos = getNodePos(n);
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x + 300);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y + 180);
    });

    const padding = 200;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    return {
      minX,
      maxX,
      minY,
      maxY,
      spanX: Math.max(maxX - minX, 600),
      spanY: Math.max(maxY - minY, 400)
    };
  }, [flatNodes, getNodePos]);

  // Transform graph coordinates into minimap coordinates
  const scaleX = MINIMAP_WIDTH / bounds.spanX;
  const scaleY = MINIMAP_HEIGHT / bounds.spanY;
  const scale = Math.min(scaleX, scaleY);

  const toMinimapX = (gx) => (gx - bounds.minX) * scale;
  const toMinimapY = (gy) => (gy - bounds.minY) * scale;

  // Viewport in graph coordinates
  const viewGraphW = containerRect.width / transform.zoom;
  const viewGraphH = containerRect.height / transform.zoom;
  const viewGraphX = -transform.x / transform.zoom;
  const viewGraphY = -transform.y / transform.zoom;

  const viewportRect = {
    x: Math.max(toMinimapX(viewGraphX), 0),
    y: Math.max(toMinimapY(viewGraphY), 0),
    w: Math.min(viewGraphW * scale, MINIMAP_WIDTH),
    h: Math.min(viewGraphH * scale, MINIMAP_HEIGHT)
  };

  const handleMinimapClick = (e) => {
    if (!minimapRef.current || !onPanTo) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const clickMx = e.clientX - rect.left;
    const clickMy = e.clientY - rect.top;

    // Convert click back to graph coordinates
    const targetGraphX = bounds.minX + clickMx / scale;
    const targetGraphY = bounds.minY + clickMy / scale;

    // Center camera on this graph point
    const newCanvasX = containerRect.width / 2 - targetGraphX * transform.zoom;
    const newCanvasY = containerRect.height / 2 - targetGraphY * transform.zoom;

    onPanTo(newCanvasX, newCanvasY);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute bottom-4 right-4 p-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 shadow-2xl z-20 cursor-pointer transition-colors"
        title="Show Radar Minimap"
      >
        <Eye size={14} />
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-1 font-mono select-none">
      {/* Mini Bar with Title & Close */}
      <div className="flex items-center justify-between w-full px-2 py-0.5 bg-slate-950/90 border border-slate-800 rounded-t-lg text-[9px] text-slate-400 font-bold">
        <span className="flex items-center gap-1 text-cyan-400">
          <span>RADAR</span>
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="text-slate-500 hover:text-slate-200 cursor-pointer"
          title="Hide Minimap"
        >
          <EyeOff size={11} />
        </button>
      </div>

      {/* Minimap Canvas Container */}
      <div
        ref={minimapRef}
        onClick={handleMinimapClick}
        style={{ width: `${MINIMAP_WIDTH}px`, height: `${MINIMAP_HEIGHT}px` }}
        className="relative bg-[#050810]/95 border-x border-b border-slate-800 rounded-b-xl overflow-hidden cursor-crosshair shadow-2xl backdrop-blur-md"
      >
        {/* Dot Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '12px 12px'
          }}
        />

        {/* Nodes Dots */}
        {flatNodes.map(node => {
          const pos = getNodePos(node);
          const mx = toMinimapX(pos.x);
          const my = toMinimapY(pos.y);
          const typeConf = getNodeTypeConfig(node.type);

          return (
            <div
              key={node.id}
              style={{
                left: `${mx}px`,
                top: `${my}px`,
                backgroundColor: typeConf.dotColor
              }}
              className="absolute w-2 h-1.5 rounded-xs shadow-xs pointer-events-none"
              title={node.title}
            />
          );
        })}

        {/* Viewport Frustum Box */}
        <div
          style={{
            left: `${viewportRect.x}px`,
            top: `${viewportRect.y}px`,
            width: `${viewportRect.w}px`,
            height: `${viewportRect.h}px`
          }}
          className="absolute border border-cyan-400 bg-cyan-400/15 rounded-xs shadow-[0_0_8px_rgba(6,182,212,0.4)] pointer-events-none transition-all duration-75"
        />
      </div>
    </div>
  );
};

export default React.memo(GraphMinimap);
