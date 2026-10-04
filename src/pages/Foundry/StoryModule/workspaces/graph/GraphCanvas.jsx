/**
 * @file GraphCanvas.jsx
 * @description 2D Interactive Viewport Canvas for the ADE Story Graph.
 * Handles infinite pan/zoom with cursor anchoring, coordinate grid rendering,
 * SVG Bezier wire composition, connection rubberband drawing, and node positioning.
 */

import React, { useRef, useEffect } from 'react';
import { GitBranch, Plus } from 'lucide-react';
import GraphEdgeWire from './GraphEdgeWire';
import GraphNodeCard from './GraphNodeCard';

export const GraphCanvas = ({
  containerRef,
  transform = { x: 60, y: 80, zoom: 0.85 },
  setTransform,
  flatNodes = [],
  allLinks = [],
  allMaps = [],
  getNodePos,
  selectedNodeId,
  selectedEdgeId,
  playheadNodeId,
  traversedPath = [],
  isConnecting = false,
  connectingSourceId = null,
  connectingMousePos = null,
  filteredNodeIds = new Set(),
  searchActive = false,
  density = 'detailed',
  onSelectNode,
  onSelectEdge,
  onDeleteEdge,
  onEditEdge,
  onStartConnection,
  onCompleteConnection,
  onNodeMouseDown,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onWheel,
  onOpenWeaver,
  onOpenPlay,
  onPanStage,
  onAddBranch,
  onDeleteNode,
  onDuplicateNode,
  onOpenInspector,
  onAddInitialNode
}) => {
  const NODE_WIDTH = density === 'compact' ? 240 : 290;
  const NODE_HEIGHT = density === 'compact' ? 100 : 165;

  return (
    <div
      ref={containerRef}
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
      onWheel={onWheel}
      className="flex-1 w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#070a12] select-none"
      style={{
        backgroundImage: `radial-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px)`,
        backgroundSize: `${32 * transform.zoom}px ${32 * transform.zoom}px`,
        backgroundPosition: `${transform.x}px ${transform.y}px`
      }}
    >
      {/* ── TRANSFORM CONTAINER (PAN & ZOOM) ── */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none origin-top-left"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
        }}
      >
        {/* ── SVG LAYER: BEZIER WIRES & ARROWS ── */}
        <svg className="absolute top-0 left-0 overflow-visible w-[8000px] h-[8000px] pointer-events-none z-0">
          <defs>
            {/* Standard Progression Arrow */}
            <marker
              id="graph-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>

            {/* Selected Wire Arrow */}
            <marker
              id="graph-arrow-selected"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>

            {/* Choice / Decision Arrow */}
            <marker
              id="graph-arrow-choice"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>

            {/* Tactical Waypoint Arrow */}
            <marker
              id="graph-arrow-waypoint"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
            </marker>

            {/* Active Playhead Flow Arrow */}
            <marker
              id="graph-arrow-playhead"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>

            {/* Ambient Wire Glow Filter */}
            <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render All Graph Edge Wires */}
          {allLinks.map((link) => {
            const sourceNode = flatNodes.find(n => n.id === link.sourceId);
            const targetNode = flatNodes.find(n => n.id === link.targetId);
            if (!sourceNode || !targetNode) return null;

            const sourcePos = getNodePos(sourceNode);
            const targetPos = getNodePos(targetNode);
            const isSelected = selectedEdgeId === link.id;
            const isHighlighted = traversedPath.includes(link.sourceId) && traversedPath.includes(link.targetId);

            return (
              <GraphEdgeWire
                key={link.id}
                link={link}
                sourcePos={sourcePos}
                targetPos={targetPos}
                nodeWidth={NODE_WIDTH}
                nodeHeight={NODE_HEIGHT}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                onSelectEdge={onSelectEdge}
                onDeleteEdge={onDeleteEdge}
                onEditEdge={onEditEdge}
              />
            );
          })}

          {/* In-Progress Wire Drawing Rubberband */}
          {isConnecting && connectingSourceId && connectingMousePos && (() => {
            const srcNode = flatNodes.find(n => n.id === connectingSourceId);
            if (!srcNode) return null;
            const srcPos = getNodePos(srcNode);
            const x1 = srcPos.x + NODE_WIDTH;
            const y1 = srcPos.y + 75;
            const x2 = connectingMousePos.x;
            const y2 = connectingMousePos.y;
            const dx = Math.max(Math.abs(x2 - x1) * 0.5, 60);
            const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            return (
              <path
                d={pathD}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2.5}
                strokeDasharray="4,4"
                className="animate-pulse"
              />
            );
          })()}
        </svg>

        {/* ── HTML LAYER: NODE CARDS ── */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
          {flatNodes.map((node) => {
            const pos = getNodePos(node);
            const isSelected = node.id === selectedNodeId;
            const isPlayheadCurrent = node.id === playheadNodeId;
            const isPlayheadTraversed = traversedPath.includes(node.id);
            const linkedMap = allMaps.find(m => m.id === node.mapId);
            const isDimmed = searchActive && !filteredNodeIds.has(node.id);

            return (
              <GraphNodeCard
                key={node.id}
                node={node}
                pos={pos}
                nodeWidth={NODE_WIDTH}
                isSelected={isSelected}
                isPlayheadCurrent={isPlayheadCurrent}
                isPlayheadTraversed={isPlayheadTraversed}
                isConnecting={isConnecting && connectingSourceId !== node.id}
                linkedMap={linkedMap}
                density={density}
                isDimmed={isDimmed}
                onSelect={onSelectNode}
                onMouseDown={onNodeMouseDown}
                onStartConnection={onStartConnection}
                onCompleteConnection={onCompleteConnection}
                onOpenWeaver={onOpenWeaver}
                onOpenPlay={onOpenPlay}
                onPanStage={onPanStage}
                onAddBranch={onAddBranch}
                onDelete={onDeleteNode}
                onDuplicate={onDuplicateNode}
                onOpenInspector={onOpenInspector}
              />
            );
          })}
        </div>
      </div>

      {/* ── EMPTY STATE BANNER ── */}
      {flatNodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <div className="max-w-md p-6 rounded-2xl bg-slate-950/95 border border-slate-800 space-y-3 pointer-events-auto shadow-2xl font-mono">
            <GitBranch size={36} className="text-purple-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              No Scenarios in Adventure Graph
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Create your initial scenario node to begin designing interactive branching story webs,
              decision gates, and tactical battlemap vectors.
            </p>
            <button
              type="button"
              onClick={onAddInitialNode}
              className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs font-mono transition-colors cursor-pointer"
            >
              + Create Initial Scenario Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(GraphCanvas);
