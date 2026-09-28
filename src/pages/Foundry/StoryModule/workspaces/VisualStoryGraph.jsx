/**
 * @file VisualStoryGraph.jsx
 * @description Visual Narrative Node Graph & Flowchart Workspace for ADE Studio.
 * Renders an interactive 2D canvas displaying scenarios, acts, scenes, and branching beats
 * as connected cards with cubic Bezier curves, decision condition pills, and direct Stage map linking.
 * 
 * Features:
 * - Infinite Pan & Zoom Canvas with background dot grid and mini-controls.
 * - Dynamic Node Cards with Map badges, Waypoint counters, and Scene Beat summaries.
 * - Bezier Curved Connection Lines with condition labels, directional arrows, and flow animations.
 * - Interactive Port Linking: Drag connection wires from node to node to create narrative branches.
 * - 1-Click Bi-Directional Stage Sync: Pan directly to linked map sectors and spatial waypoints.
 * - Auto-Layout Engine: Arranges complex branching scenario webs into clean hierarchical columns.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Crosshair, 
  Plus, 
  Trash2, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ExternalLink, 
  GitBranch, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Sliders, 
  Search, 
  ArrowRight,
  Shield,
  Zap,
  Map as MapIcon,
  Flag,
  Move
} from 'lucide-react';
import { useCampaign, useStory } from '../../../../context/CampaignContext';
import { AudioService } from '../../../../services/audioService';
import { VttEventBus } from '../../../../utils/vttEventBus';
import { v4 as uuidv4 } from 'uuid';

export const VisualStoryGraph = ({
  activeScenarioId: propActiveScenarioId,
  onSelectScenario,
  onOpenInWeaver,
  onPanStageToMap
}) => {
  const { 
    universeState, 
    updateStory, 
    addStory, 
    deleteStory, 
    setActiveScenarioId,
    activeMapId,
    setActiveMapId,
    mapsCatalog
  } = useCampaign();

  const storyContext = useStory() || {};

  // ── CANVAS TRANSFORM (PAN & ZOOM) ──
  const [transform, setTransform] = useState({ x: 60, y: 80, zoom: 0.85 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });
  const containerRef = useRef(null);

  // ── NODE DRAGGING STATE ──
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, nodeInitialX: 0, nodeInitialY: 0 });
  const [localNodePositions, setLocalNodePositions] = useState({});

  // ── CONNECTION WIRE DRAWING STATE ──
  const [connectingSourceId, setConnectingSourceId] = useState(null);
  const [connectingMousePos, setConnectingMousePos] = useState(null);

  // ── SELECTED / HIGHLIGHTED NODE ──
  const [selectedNodeId, setSelectedNodeId] = useState(propActiveScenarioId || null);
  const [trippedNodeId, setTrippedNodeId] = useState(null);

  useEffect(() => {
    if (propActiveScenarioId && propActiveScenarioId !== selectedNodeId) {
      setSelectedNodeId(propActiveScenarioId);
    }
  }, [propActiveScenarioId]);

  // Listen to live tactical waypoint triggers
  useEffect(() => {
    const unsub = VttEventBus.on('story-waypoint-tripped', (evt) => {
      const targetId = evt?.targetScenarioId || evt?.scenarioId;
      if (targetId) {
        setTrippedNodeId(targetId);
        setSelectedNodeId(targetId);
        AudioService.playCriticalChime(true);
        setTimeout(() => setTrippedNodeId(null), 3500);
      }
    });
    return unsub;
  }, []);

  // All available maps in catalog & universe
  const allMaps = useMemo(() => {
    const list = mapsCatalog || [];
    const projMaps = (universeState?.maps || []).filter(m => !list.some(cm => cm.id === m.id));
    return [...list, ...projMaps];
  }, [mapsCatalog, universeState?.maps]);

  // ── FLATTEN SCENARIO HIERARCHY INTO GRAPH NODES ──
  const { flatNodes, hierarchyLinks } = useMemo(() => {
    const nodes = [];
    const hLinks = [];

    const traverse = (nodeList, parentId = null, depth = 0, siblingIndex = 0) => {
      if (!Array.isArray(nodeList)) return;
      nodeList.forEach((node, idx) => {
        nodes.push({
          ...node,
          depth,
          siblingIndex: idx,
          parentId
        });

        if (parentId) {
          hLinks.push({
            id: `link_${parentId}_${node.id}`,
            sourceId: parentId,
            targetId: node.id,
            type: 'hierarchy'
          });
        }

        if (node.children && node.children.length > 0) {
          traverse(node.children, node.id, depth + 1, idx);
        }
      });
    };

    traverse(universeState?.scenarios || []);
    return { flatNodes: nodes, hierarchyLinks: hLinks };
  }, [universeState?.scenarios]);

  // ── EXTRACT EXPLICIT CHOICE & CUSTOM BRANCH LINKS ──
  const allLinks = useMemo(() => {
    const customLinks = [];

    flatNodes.forEach(node => {
      // 1. Explicit choice connections
      const choices = node.fields?.choices || [];
      if (Array.isArray(choices)) {
        choices.forEach((choice, cIdx) => {
          if (choice.targetScenarioId && flatNodes.some(n => n.id === choice.targetScenarioId)) {
            customLinks.push({
              id: `choice_${node.id}_${choice.targetScenarioId}_${cIdx}`,
              sourceId: node.id,
              targetId: choice.targetScenarioId,
              label: choice.text || choice.label || `Choice #${cIdx + 1}`,
              condition: choice.checkDc ? `CR ${choice.checkDc}` : choice.condition,
              type: 'choice'
            });
          }
        });
      }

      // 2. Custom node connections array
      const conns = node.fields?.connections || [];
      if (Array.isArray(conns)) {
        conns.forEach((conn, cIdx) => {
          if (conn.targetId && flatNodes.some(n => n.id === conn.targetId)) {
            customLinks.push({
              id: `conn_${node.id}_${conn.targetId}_${cIdx}`,
              sourceId: node.id,
              targetId: conn.targetId,
              label: conn.label || '',
              type: conn.type || 'branch'
            });
          }
        });
      }

      // 3. Tactical waypoint scenario triggers
      const mapId = node.mapId;
      if (mapId) {
        const linkedMap = allMaps.find(m => m.id === mapId);
        if (linkedMap?.waypoints) {
          linkedMap.waypoints.forEach((wp, wIdx) => {
            if (wp.triggerAction === 'ADVANCE_SCENARIO' && wp.targetScenarioId && flatNodes.some(n => n.id === wp.targetScenarioId)) {
              customLinks.push({
                id: `wp_link_${node.id}_${wp.targetScenarioId}_${wIdx}`,
                sourceId: node.id,
                targetId: wp.targetScenarioId,
                label: `🚩 ${wp.name || 'Waypoint Vector'}`,
                condition: 'Tactical Waypoint',
                type: 'waypoint'
              });
            }
          });
        }
      }
    });

    // Merge hierarchy links and custom branch links (deduplicating identical pairs)
    const linkMap = new Map();
    [...hierarchyLinks, ...customLinks].forEach(l => {
      const key = `${l.sourceId}->${l.targetId}`;
      if (!linkMap.has(key) || l.type === 'choice') {
        linkMap.set(key, l);
      }
    });

    return Array.from(linkMap.values());
  }, [flatNodes, hierarchyLinks]);

  // ── POSITION RESOLVER (Saved vs Auto-Layout) ──
  const getNodePos = useCallback((node) => {
    if (localNodePositions[node.id]) {
      return localNodePositions[node.id];
    }
    if (node.fields?.graphPosition?.x !== undefined && node.fields?.graphPosition?.y !== undefined) {
      return node.fields.graphPosition;
    }
    // Auto layout fallback: depth determines X column, sibling determines Y row
    const defaultX = 80 + (node.depth || 0) * 360;
    const defaultY = 100 + (node.siblingIndex || 0) * 260 + (node.depth % 2) * 40;
    return { x: defaultX, y: defaultY };
  }, [localNodePositions]);

  // ── AUTO-LAYOUT ALGORITHM (Clean Hierarchical Tree Sort) ──
  const handleAutoLayout = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    const newPositions = {};
    const depthCounts = {};

    flatNodes.forEach(node => {
      const d = node.depth || 0;
      depthCounts[d] = depthCounts[d] || 0;
      const x = 80 + d * 360;
      const y = 80 + depthCounts[d] * 280;
      depthCounts[d] += 1;

      newPositions[node.id] = { x, y };

      if (updateStory) {
        updateStory(node.id, {
          fields: {
            ...(node.fields || {}),
            graphPosition: { x, y }
          }
        });
      }
    });

    setLocalNodePositions(newPositions);
    handleFitToView();
  };

  // ── FIT TO VIEW ──
  const handleFitToView = () => {
    if (flatNodes.length === 0 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    flatNodes.forEach(n => {
      const pos = getNodePos(n);
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x + 280);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y + 200);
    });

    const graphWidth = maxX - minX + 160;
    const graphHeight = maxY - minY + 160;

    const scaleX = rect.width / graphWidth;
    const scaleY = rect.height / graphHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.2);

    const centerX = (rect.width - graphWidth * newZoom) / 2 - minX * newZoom + 80 * newZoom;
    const centerY = (rect.height - graphHeight * newZoom) / 2 - minY * newZoom + 80 * newZoom;

    setTransform({
      x: centerX,
      y: centerY,
      zoom: newZoom
    });
    AudioService.playTerminalBeep(1000, 0.02);
  };

  // ── MOUSE PAN HANDLERS ──
  const handleCanvasMouseDown = (e) => {
    if (e.target.closest('.node-card') || e.target.closest('.node-port')) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: transform.x,
      initialY: transform.y
    };
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setTransform(prev => ({
        ...prev,
        x: panStartRef.current.initialX + dx,
        y: panStartRef.current.initialY + dy
      }));
    } else if (draggingNodeId) {
      const dx = (e.clientX - dragStartRef.current.mouseX) / transform.zoom;
      const dy = (e.clientY - dragStartRef.current.mouseY) / transform.zoom;
      const newPos = {
        x: Math.round(dragStartRef.current.nodeInitialX + dx),
        y: Math.round(dragStartRef.current.nodeInitialY + dy)
      };

      setLocalNodePositions(prev => ({
        ...prev,
        [draggingNodeId]: newPos
      }));
    } else if (connectingSourceId) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseGraphX = (e.clientX - rect.left - transform.x) / transform.zoom;
      const mouseGraphY = (e.clientY - rect.top - transform.y) / transform.zoom;
      setConnectingMousePos({ x: mouseGraphX, y: mouseGraphY });
    }
  };

  const handleCanvasMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (draggingNodeId) {
      const finalPos = localNodePositions[draggingNodeId];
      if (finalPos && updateStory) {
        const targetNode = flatNodes.find(n => n.id === draggingNodeId);
        updateStory(draggingNodeId, {
          fields: {
            ...(targetNode?.fields || {}),
            graphPosition: finalPos
          }
        });
      }
      setDraggingNodeId(null);
    }
    if (connectingSourceId) {
      setConnectingSourceId(null);
      setConnectingMousePos(null);
    }
  };

  // ── WHEEL ZOOM ──
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setTransform(prev => {
      const newZoom = Math.min(Math.max(prev.zoom * zoomFactor, 0.25), 2.2);
      return { ...prev, zoom: newZoom };
    });
  };

  // ── NODE DRAG START ──
  const handleNodeMouseDown = (e, node) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    if (onSelectScenario) onSelectScenario(node.id);
    if (setActiveScenarioId) setActiveScenarioId(node.id);

    const pos = getNodePos(node);
    setDraggingNodeId(node.id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeInitialX: pos.x,
      nodeInitialY: pos.y
    };
  };

  // ── CONNECTING PORT HANDLERS ──
  const handleStartConnection = (e, sourceNodeId) => {
    e.stopPropagation();
    setConnectingSourceId(sourceNodeId);
    const sourceNode = flatNodes.find(n => n.id === sourceNodeId);
    const pos = getNodePos(sourceNode);
    setConnectingMousePos({ x: pos.x + 280, y: pos.y + 70 });
    AudioService.playTerminalBeep(1300, 0.03);
  };

  const handleCompleteConnection = (e, targetNodeId) => {
    e.stopPropagation();
    if (!connectingSourceId || connectingSourceId === targetNodeId) {
      setConnectingSourceId(null);
      setConnectingMousePos(null);
      return;
    }

    const sourceNode = flatNodes.find(n => n.id === connectingSourceId);
    if (!sourceNode || !updateStory) return;

    const existingConnections = sourceNode.fields?.connections || [];
    const alreadyConnected = existingConnections.some(c => c.targetId === targetNodeId);

    if (!alreadyConnected) {
      const label = prompt('Enter decision / branch label (e.g. "Hack Terminal", "Direct Assault"):', 'Branch Path');
      const newConn = {
        id: `conn_${uuidv4().slice(0, 8)}`,
        targetId: targetNodeId,
        label: label || 'Branch',
        type: 'branch'
      };

      updateStory(connectingSourceId, {
        fields: {
          ...(sourceNode.fields || {}),
          connections: [...existingConnections, newConn]
        }
      });
      AudioService.playCriticalChime(true);
    }

    setConnectingSourceId(null);
    setConnectingMousePos(null);
  };

  // ── ADD NEW BRANCH SCENARIO NODE ──
  const handleAddBranchNode = (parentNode) => {
    if (!addStory) return;
    const parentPos = parentNode ? getNodePos(parentNode) : { x: 120, y: 120 };
    const newId = uuidv4();
    const newScenario = {
      id: newId,
      title: `Branch Scene: ${flatNodes.length + 1}`,
      type: 'Scene',
      content: '',
      fields: {
        'tech-level': 3,
        sceneBeats: '',
        graphPosition: {
          x: parentPos.x + 360,
          y: parentPos.y + (Math.random() * 80 - 40)
        },
        connections: []
      },
      children: []
    };

    addStory(newScenario);

    // If spawned from parent, automatically connect
    if (parentNode && updateStory) {
      const parentConns = parentNode.fields?.connections || [];
      updateStory(parentNode.id, {
        fields: {
          ...(parentNode.fields || {}),
          connections: [...parentConns, { targetId: newId, label: 'Advance ❯', type: 'branch' }]
        }
      });
    }

    setSelectedNodeId(newId);
    if (setActiveScenarioId) setActiveScenarioId(newId);
    AudioService.playCriticalChime(true);
  };

  // ── PAN STAGE TO LINKED MAP ──
  const handlePanStageToLinkedMap = (node) => {
    if (!node?.mapId) return;
    if (setActiveMapId) setActiveMapId(node.mapId);
    if (onPanStageToMap) onPanStageToMap(node.mapId);

    const linkedMap = allMaps.find(m => m.id === node.mapId);
    if (linkedMap?.waypoints && linkedMap.waypoints.length > 0) {
      const firstWp = linkedMap.waypoints[0];
      VttEventBus.emit('pan-stage-to', { x: firstWp.x, y: firstWp.y, zoom: 1.1 });
    } else {
      VttEventBus.emit('pan-stage-to', { x: 500, y: 500, zoom: 1.0 });
    }
    AudioService.playTerminalBeep(1400, 0.03);
  };

  // Node dimensions
  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 160;

  return (
    <div className="flex flex-col h-full w-full bg-[#070b13] text-slate-100 overflow-hidden font-sans select-none relative">
      
      {/* ── TOP CONTROL TOOLBAR ── */}
      <div className="h-10 bg-[#090d16] border-b border-slate-800 flex items-center justify-between px-3 shrink-0 gap-2 z-20 font-mono text-xs">
        
        {/* Left: Title & Node Counts */}
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-purple-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Visual Narrative Graph
          </span>
          <span className="px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[10px]">
            {flatNodes.length} Nodes • {allLinks.length} Links
          </span>
        </div>

        {/* Center: Actions & Spawn Nodes */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAddBranchNode(null)}
            className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Create root scenario node"
          >
            <Plus size={11} />
            <span>Add Node</span>
          </button>

          <button
            type="button"
            onClick={handleAutoLayout}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Auto-organize graph nodes into clean hierarchical columns"
          >
            <Sliders size={11} />
            <span>Auto Layout</span>
          </button>
        </div>

        {/* Right: Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTransform(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.15, 2.2) }))}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={() => setTransform(prev => ({ ...prev, zoom: Math.max(prev.zoom * 0.85, 0.25) }))}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            type="button"
            onClick={handleFitToView}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 cursor-pointer"
            title="Fit to Screen"
          >
            <Maximize2 size={12} />
          </button>
          <span className="text-[10px] text-slate-400 font-mono px-1">
            {Math.round(transform.zoom * 100)}%
          </span>
        </div>
      </div>

      {/* ── 2D INTERACTIVE GRAPH CANVAS ── */}
      <div 
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={handleWheel}
        className="flex-1 w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#070a12]"
        style={{
          backgroundImage: `radial-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px)`,
          backgroundSize: `${32 * transform.zoom}px ${32 * transform.zoom}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`
        }}
      >
        {/* Transform Layer for Pan & Zoom */}
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none origin-top-left"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
          }}
        >
          {/* ── SVG LAYER: BEZIER CONNECTION WIRES ── */}
          <svg className="absolute top-0 left-0 overflow-visible w-[5000px] h-[5000px] pointer-events-none z-0">
            <defs>
              <marker
                id="graph-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
              </marker>

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

              <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Links */}
            {allLinks.map((link) => {
              const sourceNode = flatNodes.find(n => n.id === link.sourceId);
              const targetNode = flatNodes.find(n => n.id === link.targetId);
              if (!sourceNode || !targetNode) return null;

              const sourcePos = getNodePos(sourceNode);
              const targetPos = getNodePos(targetNode);

              const x1 = sourcePos.x + NODE_WIDTH;
              const y1 = sourcePos.y + 75;
              const x2 = targetPos.x;
              const y2 = targetPos.y + 75;

              const dx = Math.max(Math.abs(x2 - x1) * 0.5, 60);
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              const isChoice = link.type === 'choice';
              const isWaypoint = link.type === 'waypoint';
              const isSelected = selectedNodeId === link.sourceId || selectedNodeId === link.targetId;

              const linkStrokeColor = isWaypoint ? '#06b6d4' : (isChoice ? '#f59e0b' : (isSelected ? '#38bdf8' : '#64748b'));
              const linkMarker = isWaypoint ? 'url(#graph-arrow-waypoint)' : (isChoice ? 'url(#graph-arrow-choice)' : 'url(#graph-arrow)');

              return (
                <g key={link.id} className="transition-all">
                  {/* Glow Backdrop */}
                  {isSelected && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={linkStrokeColor}
                      strokeWidth={6}
                      strokeOpacity={0.3}
                      filter="url(#wire-glow)"
                    />
                  )}

                  {/* Main Bezier Wire */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={linkStrokeColor}
                    strokeWidth={isSelected ? 2.5 : (isWaypoint ? 2.0 : 1.8)}
                    strokeDasharray={isWaypoint ? '6,3' : (isChoice ? '5,4' : undefined)}
                    markerEnd={linkMarker}
                    className={isSelected || isWaypoint ? 'animate-pulse' : ''}
                  />

                  {/* Midpoint Condition Badge */}
                  {link.label && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x={-45}
                        y={-10}
                        width={90}
                        height={20}
                        rx={6}
                        fill="#090d16"
                        stroke={isWaypoint ? '#06b6d4' : (isChoice ? '#f59e0b' : '#475569')}
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={3}
                        textAnchor="middle"
                        fill={isWaypoint ? '#67e8f9' : (isChoice ? '#fcd34d' : '#cbd5e1')}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {link.label.length > 12 ? `${link.label.slice(0, 11)}…` : link.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* In-Progress Wire Drawing Rubberband */}
            {connectingSourceId && connectingMousePos && (() => {
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

          {/* ── HTML NODE CARDS LAYER ── */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
            {flatNodes.map((node) => {
              const pos = getNodePos(node);
              const isSelected = node.id === selectedNodeId;
              const linkedMap = allMaps.find(m => m.id === node.mapId);
              const rawBeats = node.fields?.sceneBeats || '';
              const beatsArr = rawBeats.split('\n').map(b => b.trim()).filter(Boolean);

              return (
                <div
                  key={node.id}
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    width: `${NODE_WIDTH}px`
                  }}
                  className={`node-card absolute pointer-events-auto rounded-2xl border transition-all cursor-default flex flex-col backdrop-blur-md shadow-2xl ${
                    trippedNodeId === node.id
                      ? 'bg-cyan-950/95 border-cyan-300 ring-4 ring-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.8)] animate-pulse'
                      : isSelected
                      ? 'bg-[#0f172a]/95 border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400'
                      : 'bg-[#090e1a]/90 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* Card Header (Drag Handle) */}
                  <div
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    className="p-2.5 px-3 border-b border-slate-800/80 bg-slate-950/60 rounded-t-2xl flex items-center justify-between cursor-move"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${trippedNodeId === node.id ? 'bg-cyan-300 animate-ping' : 'bg-cyan-400'}`} />
                      <span className="text-[11px] font-mono font-bold text-slate-200 truncate uppercase">
                        {node.title || 'Untitled Scenario'}
                      </span>
                    </div>

                    <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase">
                      {node.type || 'Scene'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 space-y-2.5 font-mono text-xs flex-1">
                    
                    {/* Linked Tactical Map Sector Badge */}
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapIcon size={11} className="text-cyan-400" />
                        <span className="truncate max-w-[130px]">
                          {linkedMap?.title || 'No Linked Sector'}
                        </span>
                      </span>

                      {linkedMap && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePanStageToLinkedMap(node);
                          }}
                          className="px-1.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold flex items-center gap-1 text-[9px] cursor-pointer"
                          title="Center Stage canvas on this sector"
                        >
                          <Crosshair size={9} />
                          <span>Pan Stage</span>
                        </button>
                      )}
                    </div>

                    {/* Waypoints & Beats Telemetry */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Flag size={10} className="text-amber-400" />
                        <span>{linkedMap?.waypoints?.length || 0} Waypoints</span>
                        {linkedMap?.waypoints?.some(w => w.isTriggered) && (
                          <span className="text-emerald-400 font-bold ml-0.5" title="Has triggered waypoints">✓</span>
                        )}
                      </span>
                      <span>•</span>
                      <span>{beatsArr.length} Beats</span>
                    </div>

                    {/* Beats Preview Snippet */}
                    <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-850 text-[10px] text-slate-300 line-clamp-2 italic leading-relaxed">
                      {beatsArr[0] || node.content?.replace(/<[^>]*>/g, '').slice(0, 75) || 'No narrative beats defined yet...'}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-2 px-3 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl flex items-center justify-between text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenInWeaver) onOpenInWeaver(node);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
                      title="Open in Story Weaver Editor"
                    >
                      <BookOpen size={11} />
                      <span>Weaver</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddBranchNode(node);
                        }}
                        className="p-1 rounded bg-slate-900 hover:bg-purple-950 text-slate-400 hover:text-purple-300 border border-slate-750 transition-colors cursor-pointer"
                        title="Add connected branch node"
                      >
                        <Plus size={11} />
                      </button>

                      {flatNodes.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (deleteStory && confirm(`Delete scenario "${node.title}"?`)) {
                              deleteStory(node.id);
                            }
                          }}
                          className="p-1 rounded bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-750 transition-colors cursor-pointer"
                          title="Delete node"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Output Connection Port (Right Edge) */}
                  <div
                    onMouseDown={(e) => handleStartConnection(e, node.id)}
                    className="node-port absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform shadow-[0_0_8px_rgba(6,182,212,0.5)] z-20"
                    title="Drag connection wire to another node"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-300" />
                  </div>

                  {/* Input Connection Receiver Target (Left Edge) */}
                  {connectingSourceId && connectingSourceId !== node.id && (
                    <div
                      onClick={(e) => handleCompleteConnection(e, node.id)}
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center cursor-pointer animate-ping hover:scale-125 transition-transform z-20"
                      title="Click to connect branch here"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State Banner */}
        {flatNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="max-w-md p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 pointer-events-auto">
              <GitBranch size={32} className="text-purple-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                No Scenario Nodes in Graph
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create your first story node to begin constructing branching narrative paths, scene beats, and decision gates.
              </p>
              <button
                type="button"
                onClick={() => handleAddBranchNode(null)}
                className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs font-mono transition-colors cursor-pointer"
              >
                + Create Initial Scenario Node
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualStoryGraph;
