/**
 * @file VisualStoryGraph.jsx
 * @description Master Production Orchestrator for the ADE Visual Story Graph Workspace.
 * Integrates interactive 2D canvas, SVG Bezier edges, slide-out properties inspector,
 * radar minimap, multi-directional auto-layout, playhead story walkthrough simulator,
 * AIME AI branch generator, and Mermaid/JSON export tooling.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useCampaign, useStory } from '../../../../context/CampaignContext';
import { useConfirm } from '../../../../context/ConfirmContext';
import { AudioService } from '../../../../services/audioService';
import { VttEventBus } from '../../../../utils/vttEventBus';
import { v4 as uuidv4 } from 'uuid';

import { 
  flattenScenarios, 
  extractAllLinks, 
  calculateAutoLayout, 
  snapPosition, 
  calculateBoundingBox, 
  auditGraphContinuity, 
  exportGraphToMermaid, 
  exportGraphToJson 
} from './graph/graphUtils';

import GraphToolbar from './graph/GraphToolbar';
import GraphCanvas from './graph/GraphCanvas';
import GraphInspectorDrawer from './graph/GraphInspectorDrawer';
import GraphMinimap from './graph/GraphMinimap';
import GraphPlaySimulator from './graph/GraphPlaySimulator';
import GraphAimeTools from './graph/GraphAimeTools';

export const VisualStoryGraph = ({
  activeScenarioId: propActiveScenarioId,
  onSelectScenario,
  onOpenInWeaver,
  onPanStageToMap,
  onSwitchView
}) => {
  const confirm = useConfirm();
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

  const containerRef = useRef(null);

  // ── CANVAS TRANSFORM (PAN & ZOOM) ──
  const [transform, setTransform] = useState({ x: 80, y: 100, zoom: 0.85 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  // ── NODE DRAGGING STATE ──
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, nodeInitialX: 0, nodeInitialY: 0 });
  const [localNodePositions, setLocalNodePositions] = useState({});
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(false);

  // ── CONNECTION WIRE DRAWING STATE ──
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingSourceId, setConnectingSourceId] = useState(null);
  const [connectingMousePos, setConnectingMousePos] = useState(null);

  // ── SELECTION STATE ──
  const [selectedNodeId, setSelectedNodeId] = useState(propActiveScenarioId || null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  // ── DISPLAY & WORKSPACE TOGGLES ──
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isMinimapOpen, setIsMinimapOpen] = useState(true);
  const [density, setDensity] = useState('detailed'); // 'detailed' | 'compact'
  const [showHierarchy, setShowHierarchy] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [isAimeOpen, setIsAimeOpen] = useState(false);

  // ── SEARCH & FILTER STATE ──
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [selectedMapFilter, setSelectedMapFilter] = useState('ALL');

  // ── PLAYHEAD STORY SIMULATOR STATE ──
  const [isPlaySimulatorActive, setIsPlaySimulatorActive] = useState(false);
  const [playheadNodeId, setPlayheadNodeId] = useState(null);
  const [historyTrail, setHistoryTrail] = useState([]);

  // All available maps
  const allMaps = useMemo(() => {
    const list = mapsCatalog || [];
    const projMaps = (universeState?.maps || []).filter(m => !list.some(cm => cm.id === m.id));
    return [...list, ...projMaps];
  }, [mapsCatalog, universeState?.maps]);

  // Synchronize activeScenarioId prop
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
        setSelectedNodeId(targetId);
        AudioService.playCriticalChime(true);
      }
    });
    return unsub;
  }, []);

  // ── FLATTEN SCENARIOS & EXTRACT LINKS ──
  const { flatNodes, hierarchyLinks } = useMemo(() => {
    return flattenScenarios(universeState?.scenarios || []);
  }, [universeState?.scenarios]);

  const allLinks = useMemo(() => {
    return extractAllLinks(flatNodes, hierarchyLinks, allMaps, {
      showHierarchy,
      showWaypoints
    });
  }, [flatNodes, hierarchyLinks, allMaps, showHierarchy, showWaypoints]);

  // ── CONTINUITY AUDIT TELEMETRY ──
  const continuityHealth = useMemo(() => {
    return auditGraphContinuity(flatNodes, allLinks);
  }, [flatNodes, allLinks]);

  // ── NODE POSITION RESOLVER ──
  const getNodePos = useCallback((node) => {
    if (!node) return { x: 0, y: 0 };
    if (localNodePositions[node.id]) {
      return localNodePositions[node.id];
    }
    if (node.fields?.graphPosition?.x !== undefined && node.fields?.graphPosition?.y !== undefined) {
      return node.fields.graphPosition;
    }
    // Auto-layout fallback: column-based on depth & sibling rank
    const defaultX = 80 + (node.depth || 0) * 380;
    const defaultY = 100 + (node.siblingIndex || 0) * 280;
    return { x: defaultX, y: defaultY };
  }, [localNodePositions]);

  // ── FILTERED NODE IDS ──
  const filteredNodeIds = useMemo(() => {
    const matching = new Set();
    const query = searchQuery.trim().toLowerCase();

    flatNodes.forEach(node => {
      // Type filter
      if (selectedTypeFilter !== 'ALL' && (node.type || '').toLowerCase() !== selectedTypeFilter.toLowerCase()) {
        return;
      }
      // Map filter
      if (selectedMapFilter !== 'ALL' && node.mapId !== selectedMapFilter) {
        return;
      }
      // Query filter
      if (query) {
        const titleMatch = (node.title || '').toLowerCase().includes(query);
        const contentMatch = (node.content || '').toLowerCase().includes(query);
        const beatsMatch = (node.fields?.sceneBeats || '').toLowerCase().includes(query);
        if (!titleMatch && !contentMatch && !beatsMatch) return;
      }
      matching.add(node.id);
    });

    return matching;
  }, [flatNodes, searchQuery, selectedTypeFilter, selectedMapFilter]);

  const searchActive = searchQuery.trim().length > 0 || selectedTypeFilter !== 'ALL' || selectedMapFilter !== 'ALL';

  // ── AUTO-LAYOUT HANDLER ──
  const handleAutoLayout = (direction = 'horizontal') => {
    AudioService.playTerminalBeep(1250, 0.04);
    const newPositions = calculateAutoLayout(flatNodes, allLinks, direction);

    setLocalNodePositions(newPositions);

    // Persist positions to scenarios
    if (updateStory) {
      flatNodes.forEach(node => {
        if (newPositions[node.id]) {
          updateStory(node.id, {
            fields: {
              ...(node.fields || {}),
              graphPosition: newPositions[node.id]
            }
          });
        }
      });
    }

    handleFitToView();
  };

  // ── FIT TO VIEW HANDLER ──
  const handleFitToView = () => {
    if (flatNodes.length === 0 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const bbox = calculateBoundingBox(flatNodes, getNodePos, density === 'compact' ? 240 : 290, 160, 140);

    const scaleX = rect.width / bbox.width;
    const scaleY = rect.height / bbox.height;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.25);

    const centerX = rect.width / 2 - bbox.centerX * newZoom;
    const centerY = rect.height / 2 - bbox.centerY * newZoom;

    setTransform({
      x: Math.round(centerX),
      y: Math.round(centerY),
      zoom: Number(newZoom.toFixed(2))
    });
    AudioService.playTerminalBeep(1100, 0.02);
  };

  // ── ZOOM CONTROLS WITH CURSOR ANCHORING ──
  const handleZoom = (factor, anchorClientX, anchorClientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = anchorClientX !== undefined ? anchorClientX : rect.left + rect.width / 2;
    const clientY = anchorClientY !== undefined ? anchorClientY : rect.top + rect.height / 2;

    setTransform(prev => {
      const newZoom = Math.min(Math.max(prev.zoom * factor, 0.25), 2.2);
      // Anchor zoom around cursor position
      const mouseGraphX = (clientX - rect.left - prev.x) / prev.zoom;
      const mouseGraphY = (clientY - rect.top - prev.y) / prev.zoom;

      const newX = clientX - rect.left - mouseGraphX * newZoom;
      const newY = clientY - rect.top - mouseGraphY * newZoom;

      return { x: Math.round(newX), y: Math.round(newY), zoom: Number(newZoom.toFixed(2)) };
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    handleZoom(factor, e.clientX, e.clientY);
  };

  // ── CANVAS MOUSE PAN & DRAG HANDLERS ──
  const handleCanvasMouseDown = (e) => {
    // If clicking on node, port, or pill, don't pan canvas
    if (e.target.closest('.node-card') || e.target.closest('.node-port') || e.target.closest('.graph-edge-group')) {
      return;
    }

    // Canvas background clicked: deselect
    setSelectedNodeId(null);
    setSelectedEdgeId(null);

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
      let rawPos = {
        x: Math.round(dragStartRef.current.nodeInitialX + dx),
        y: Math.round(dragStartRef.current.nodeInitialY + dy)
      };

      if (snapToGridEnabled) {
        rawPos = snapPosition(rawPos, 20);
      }

      setLocalNodePositions(prev => ({
        ...prev,
        [draggingNodeId]: rawPos
      }));
    } else if (isConnecting && connectingSourceId && containerRef.current) {
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

    if (isConnecting) {
      setIsConnecting(false);
      setConnectingSourceId(null);
      setConnectingMousePos(null);
    }
  };

  // ── NODE MOUSE DOWN (DRAG START) ──
  const handleNodeMouseDown = (e, node) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
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

  // ── CONNECTION WIRE DRAWING HANDLERS ──
  const handleStartConnection = (e, sourceNodeId) => {
    e.stopPropagation();
    setIsConnecting(true);
    setConnectingSourceId(sourceNodeId);
    const sourceNode = flatNodes.find(n => n.id === sourceNodeId);
    const pos = getNodePos(sourceNode);
    const nodeWidth = density === 'compact' ? 240 : 290;
    setConnectingMousePos({ x: pos.x + nodeWidth, y: pos.y + 75 });
    AudioService.playTerminalBeep(1300, 0.03);
  };

  const handleCompleteConnection = (e, targetNodeId) => {
    e.stopPropagation();
    if (!connectingSourceId || connectingSourceId === targetNodeId) {
      setIsConnecting(false);
      setConnectingSourceId(null);
      setConnectingMousePos(null);
      return;
    }

    const sourceNode = flatNodes.find(n => n.id === connectingSourceId);
    if (!sourceNode || !updateStory) return;

    const existingConnections = sourceNode.fields?.connections || [];
    const alreadyConnected = existingConnections.some(c => c.targetId === targetNodeId);

    if (!alreadyConnected) {
      const newConnId = `conn_${uuidv4().slice(0, 8)}`;
      const newConn = {
        id: newConnId,
        targetId: targetNodeId,
        label: 'Branch Path',
        type: 'branch'
      };

      updateStory(connectingSourceId, {
        fields: {
          ...(sourceNode.fields || {}),
          connections: [...existingConnections, newConn]
        }
      });

      setSelectedEdgeId(newConnId);
      setIsInspectorOpen(true);
      AudioService.playCriticalChime(true);
    }

    setIsConnecting(false);
    setConnectingSourceId(null);
    setConnectingMousePos(null);
  };

  // ── EDGE SELECTION & EDITING ──
  const handleSelectEdge = (link) => {
    setSelectedEdgeId(link.id);
    setSelectedNodeId(null);
    setIsInspectorOpen(true);
    AudioService.playTerminalBeep(1150, 0.02);
  };

  const handleUpdateEdge = (link, updates) => {
    if (!updateStory) return;
    const sourceNode = flatNodes.find(n => n.id === link.sourceId);
    if (!sourceNode) return;

    // 1. If choice edge
    if (link.type === 'choice' && link.choiceId) {
      const choices = sourceNode.fields?.choices || [];
      const updatedChoices = choices.map(c => {
        if (c.id === link.choiceId) {
          return {
            ...c,
            ...(updates.label !== undefined ? { text: updates.label } : {}),
            ...(updates.checkDc !== undefined ? { checkDc: updates.checkDc } : {}),
            ...(updates.attribute !== undefined ? { attribute: updates.attribute } : {}),
            ...(updates.condition !== undefined ? { condition: updates.condition } : {})
          };
        }
        return c;
      });
      updateStory(sourceNode.id, {
        fields: { ...(sourceNode.fields || {}), choices: updatedChoices }
      });
      return;
    }

    // 2. Custom connection edge
    const conns = sourceNode.fields?.connections || [];
    const updatedConns = conns.map(c => {
      if (c.id === link.id || c.targetId === link.targetId) {
        return { ...c, ...updates };
      }
      return c;
    });

    updateStory(sourceNode.id, {
      fields: { ...(sourceNode.fields || {}), connections: updatedConns }
    });
  };

  const handleDeleteEdge = async (link) => {
    if (!updateStory) return;
    const ok = await confirm({
      title: 'Delete Connection Wire',
      message: `Remove branch connection from "${link.label || 'Branch'}"?`,
      danger: true,
      confirmLabel: 'Delete Wire'
    });
    if (!ok) return;

    const sourceNode = flatNodes.find(n => n.id === link.sourceId);
    if (!sourceNode) return;

    if (link.type === 'choice' && link.choiceId) {
      const choices = (sourceNode.fields?.choices || []).filter(c => c.id !== link.choiceId);
      updateStory(sourceNode.id, {
        fields: { ...(sourceNode.fields || {}), choices }
      });
    } else {
      const conns = (sourceNode.fields?.connections || []).filter(c => c.id !== link.id && c.targetId !== link.targetId);
      updateStory(sourceNode.id, {
        fields: { ...(sourceNode.fields || {}), connections: conns }
      });
    }

    setSelectedEdgeId(null);
    AudioService.playTerminalBeep(900, 0.05);
  };

  // ── ADD / DUPLICATE / DELETE NODES ──
  const handleAddBranchNode = (parentNode) => {
    if (!addStory) return;
    const parentPos = parentNode ? getNodePos(parentNode) : { x: 100, y: 100 };
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
          x: parentPos.x + 380,
          y: parentPos.y + (Math.random() * 60 - 30)
        },
        choices: [],
        connections: []
      },
      children: []
    };

    addStory(newScenario);

    if (parentNode && updateStory) {
      const parentConns = parentNode.fields?.connections || [];
      updateStory(parentNode.id, {
        fields: {
          ...(parentNode.fields || {}),
          connections: [...parentConns, { id: `conn_${uuidv4().slice(0, 8)}`, targetId: newId, label: 'Advance ❯', type: 'branch' }]
        }
      });
    }

    setSelectedNodeId(newId);
    if (setActiveScenarioId) setActiveScenarioId(newId);
    AudioService.playCriticalChime(true);
  };

  const handleDuplicateNode = (node) => {
    if (!addStory) return;
    const pos = getNodePos(node);
    const newId = uuidv4();
    const cloned = {
      ...node,
      id: newId,
      title: `${node.title || 'Scenario'} (Copy)`,
      fields: {
        ...(node.fields || {}),
        graphPosition: {
          x: pos.x + 40,
          y: pos.y + 40
        }
      },
      children: []
    };
    addStory(cloned);
    setSelectedNodeId(newId);
    AudioService.playCriticalChime(true);
  };

  const handleDeleteNode = async (node) => {
    if (!deleteStory) return;
    const ok = await confirm({
      title: 'Delete Scenario Node',
      message: `Delete scenario "${node.title}" and its sub-elements?`,
      danger: true,
      confirmLabel: 'Delete Scenario'
    });
    if (ok) {
      deleteStory(node.id);
      setSelectedNodeId(null);
    }
  };

  // ── AIME GENERATED BRANCHES INJECTION ──
  const handleAddGeneratedBranches = (sourceNode, branches) => {
    if (!addStory || !updateStory || !sourceNode) return;
    const srcPos = getNodePos(sourceNode);
    const newChoices = [...(sourceNode.fields?.choices || [])];

    branches.forEach((b, idx) => {
      const newId = uuidv4();
      const nodeX = srcPos.x + 380;
      const nodeY = srcPos.y + (idx - Math.floor(branches.length / 2)) * 260;

      const newScenario = {
        id: newId,
        title: b.title,
        type: b.type || 'Scene',
        content: b.readAloud || '',
        fields: {
          sceneBeats: b.beats || '',
          graphPosition: { x: nodeX, y: nodeY },
          choices: [],
          connections: []
        },
        children: []
      };

      addStory(newScenario);

      newChoices.push({
        id: `choice_${uuidv4().slice(0, 8)}`,
        text: b.choiceLabel || b.title,
        targetScenarioId: newId,
        attribute: b.attribute || 'agility',
        checkDc: b.checkDc
      });
    });

    updateStory(sourceNode.id, {
      fields: {
        ...(sourceNode.fields || {}),
        choices: newChoices
      }
    });

    handleFitToView();
  };

  // ── STORY PLAYHEAD SIMULATOR HANDLERS ──
  const handleTogglePlaySimulator = () => {
    setIsPlaySimulatorActive(prev => {
      const next = !prev;
      if (next) {
        // Start simulation from selected node or first root
        const startId = selectedNodeId || flatNodes[0]?.id;
        setPlayheadNodeId(startId);
        setHistoryTrail(startId ? [startId] : []);
        AudioService.playCriticalChime(true);
      } else {
        setPlayheadNodeId(null);
        setHistoryTrail([]);
      }
      return next;
    });
  };

  const handleAdvancePlayhead = (targetNodeId) => {
    setPlayheadNodeId(targetNodeId);
    setHistoryTrail(prev => [...prev, targetNodeId]);
    setSelectedNodeId(targetNodeId);

    // Pan camera smoothly to center on new node
    const targetNode = flatNodes.find(n => n.id === targetNodeId);
    if (targetNode && containerRef.current) {
      const pos = getNodePos(targetNode);
      const rect = containerRef.current.getBoundingClientRect();
      const newX = rect.width / 2 - (pos.x + 140) * transform.zoom;
      const newY = rect.height / 2 - (pos.y + 80) * transform.zoom;
      setTransform(prev => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
    }
  };

  const handleRewindToStep = (index) => {
    const targetId = historyTrail[index];
    if (targetId) {
      setPlayheadNodeId(targetId);
      setHistoryTrail(prev => prev.slice(0, index + 1));
      setSelectedNodeId(targetId);
    }
  };

  const handleResetSimulation = () => {
    const rootId = flatNodes[0]?.id || null;
    setPlayheadNodeId(rootId);
    setHistoryTrail(rootId ? [rootId] : []);
    if (rootId) setSelectedNodeId(rootId);
  };

  // ── CROSS-STUDIO TRANSITIONS ──
  const handlePanStage = (node) => {
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

  const handleOpenPlay = (node) => {
    if (onSelectScenario) onSelectScenario(node.id);
    if (setActiveScenarioId) setActiveScenarioId(node.id);
    if (onSwitchView) onSwitchView('interactive');
  };

  // ── KEYBOARD SHORTCUTS (DELETE, ESCAPE, DOCK) ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEdgeId) {
          const edge = allLinks.find(l => l.id === selectedEdgeId);
          if (edge) handleDeleteEdge(edge);
        } else if (selectedNodeId) {
          const node = flatNodes.find(n => n.id === selectedNodeId);
          if (node) handleDeleteNode(node);
        }
      } else if (e.key === 'Escape') {
        if (isConnecting) {
          setIsConnecting(false);
          setConnectingSourceId(null);
          setConnectingMousePos(null);
        } else {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }
      } else if (e.key === ']') {
        e.preventDefault();
        setIsInspectorOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId, selectedNodeId, allLinks, flatNodes, isConnecting]);

  const selectedNode = flatNodes.find(n => n.id === selectedNodeId) || null;
  const selectedEdge = allLinks.find(l => l.id === selectedEdgeId) || null;
  const playheadNode = flatNodes.find(n => n.id === playheadNodeId) || null;

  return (
    <div className="flex flex-col h-full w-full bg-[#070b13] text-slate-100 overflow-hidden font-sans select-none relative">
      
      {/* ── TOP GLASS-COCKPIT CONTROL TOOLBAR ── */}
      <GraphToolbar
        flatNodes={flatNodes}
        allLinks={allLinks}
        continuityHealth={continuityHealth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTypeFilter={selectedTypeFilter}
        onTypeFilterChange={setSelectedTypeFilter}
        selectedMapFilter={selectedMapFilter}
        onMapFilterChange={setSelectedMapFilter}
        allMaps={allMaps}
        density={density}
        onToggleDensity={() => setDensity(d => d === 'detailed' ? 'compact' : 'detailed')}
        showHierarchy={showHierarchy}
        onToggleHierarchy={() => setShowHierarchy(h => !h)}
        snapToGridEnabled={snapToGridEnabled}
        onToggleSnapToGrid={() => setSnapToGridEnabled(s => !s)}
        onAutoLayout={handleAutoLayout}
        transform={transform}
        onZoomIn={() => handleZoom(1.18)}
        onZoomOut={() => handleZoom(0.82)}
        onFitToView={handleFitToView}
        isPlaySimulatorActive={isPlaySimulatorActive}
        onTogglePlaySimulator={handleTogglePlaySimulator}
        onAddNode={() => handleAddBranchNode(null)}
        onOpenAime={() => setIsAimeOpen(true)}
        onOpenInspector={() => setIsInspectorOpen(prev => !prev)}
        isInspectorOpen={isInspectorOpen}
        onExportMermaid={() => {
          const md = exportGraphToMermaid(flatNodes, allLinks, 'LR', universeState?.projectName);
          navigator.clipboard.writeText(md);
        }}
        onExportJson={() => {
          const jsonStr = exportGraphToJson(flatNodes, allLinks, universeState);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${(universeState?.projectName || 'campaign').toLowerCase().replace(/\s+/g, '_')}_graph.json`;
          a.click();
        }}
      />

      {/* ── MAIN WORKSPACE BODY: CANVAS + SLIDE-OUT INSPECTOR ── */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* 2D Infinite Graph Canvas */}
        <GraphCanvas
          containerRef={containerRef}
          transform={transform}
          setTransform={setTransform}
          flatNodes={flatNodes}
          allLinks={allLinks}
          allMaps={allMaps}
          getNodePos={getNodePos}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          playheadNodeId={playheadNodeId}
          traversedPath={historyTrail}
          isConnecting={isConnecting}
          connectingSourceId={connectingSourceId}
          connectingMousePos={connectingMousePos}
          filteredNodeIds={filteredNodeIds}
          searchActive={searchActive}
          density={density}
          onSelectNode={(node) => {
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
            setIsInspectorOpen(true);
            if (onSelectScenario) onSelectScenario(node.id);
            if (setActiveScenarioId) setActiveScenarioId(node.id);
          }}
          onSelectEdge={handleSelectEdge}
          onDeleteEdge={handleDeleteEdge}
          onEditEdge={(link) => {
            setSelectedEdgeId(link.id);
            setSelectedNodeId(null);
            setIsInspectorOpen(true);
          }}
          onStartConnection={handleStartConnection}
          onCompleteConnection={handleCompleteConnection}
          onNodeMouseDown={handleNodeMouseDown}
          onCanvasMouseDown={handleCanvasMouseDown}
          onCanvasMouseMove={handleCanvasMouseMove}
          onCanvasMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
          onOpenWeaver={onOpenInWeaver}
          onOpenPlay={handleOpenPlay}
          onPanStage={handlePanStage}
          onAddBranch={handleAddBranchNode}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onOpenInspector={(node) => {
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
            setIsInspectorOpen(true);
          }}
          onAddInitialNode={() => handleAddBranchNode(null)}
        />

        {/* Radar Minimap HUD in Bottom-Right */}
        <GraphMinimap
          flatNodes={flatNodes}
          getNodePos={getNodePos}
          transform={transform}
          containerRect={containerRef.current ? containerRef.current.getBoundingClientRect() : { width: 1000, height: 700 }}
          onPanTo={(newX, newY) => setTransform(prev => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }))}
          isOpen={isMinimapOpen}
          onToggle={() => setIsMinimapOpen(prev => !prev)}
        />

        {/* Interactive Story Playhead Simulator HUD */}
        <GraphPlaySimulator
          isActive={isPlaySimulatorActive}
          currentNode={playheadNode}
          allNodes={flatNodes}
          historyTrail={historyTrail}
          onSelectNode={setSelectedNodeId}
          onAdvanceNode={handleAdvancePlayhead}
          onRewindToStep={handleRewindToStep}
          onResetSimulation={handleResetSimulation}
          onClose={() => setIsPlaySimulatorActive(false)}
        />

        {/* Slide-Out Properties Inspector Dock */}
        <GraphInspectorDrawer
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          allNodes={flatNodes}
          allMaps={allMaps}
          continuityHealth={continuityHealth}
          onUpdateNode={(nodeId, updates) => updateStory && updateStory(nodeId, updates)}
          onDeleteNode={handleDeleteNode}
          onUpdateEdge={handleUpdateEdge}
          onDeleteEdge={handleDeleteEdge}
          onOpenWeaver={onOpenInWeaver}
          onOpenPlay={handleOpenPlay}
          onPanStage={handlePanStage}
          onAddBranchNode={handleAddBranchNode}
          onAutoLayout={() => handleAutoLayout('horizontal')}
          onOpenAime={() => setIsAimeOpen(true)}
        />
      </div>

      {/* AIME AI Narrative Co-Pilot Modal */}
      <GraphAimeTools
        isOpen={isAimeOpen}
        onClose={() => setIsAimeOpen(false)}
        activeNode={selectedNode || flatNodes[0]}
        allNodes={flatNodes}
        allLinks={allLinks}
        continuityHealth={continuityHealth}
        onAddGeneratedBranches={handleAddGeneratedBranches}
        onUpdateScenario={(id, up) => updateStory && updateStory(id, up)}
      />
    </div>
  );
};

export default VisualStoryGraph;
