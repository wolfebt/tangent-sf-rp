/**
 * @file WeaverGraphTab.jsx
 * @description Intelligent Connection-First Asset Interconnection Graph & Scenario Flowchart Studio.
 * Displays active cross-asset relationships (manual links with explanatory/secret notes, AIME Asset Hub links,
 * story prose [[wiki]] mentions, and relational fields) without dumping unconnected catalog items onto the canvas.
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Network,
  GitBranch,
  Plus,
  Trash2,
  Edit3,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Link2,
  Sparkles,
  Check,
  X,
  Layers,
  Crosshair,
  ArrowRight,
  ArrowUpDown,
  LayoutGrid,
  Pin,
  BookOpen
} from 'lucide-react';
import { useStory } from '../../../../context/CampaignContext';
import { getTypePillStyle } from '../../ElementForge/elementSchemas';
import { useAdeStore } from '../../store/adeStore';
import { AudioService } from '../../../../services/audioService';
import VisualStoryGraph from '../../StoryModule/workspaces/VisualStoryGraph';
import { v4 as uuidv4 } from 'uuid';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CATEGORY_META,
  MANUAL_RELATIONSHIP_OPTIONS,
  getRelationshipMeta,
  buildCatalogAssets,
  extractConfirmedConnections,
  discoverSmartLoreSuggestions,
  filterVisibleGraph,
  computeIntelligentAssetLayout,
  computeAssetGraphBounds
} from './assetGraphUtils';

/**
 * Searchable Asset Picker used inside the Establish Connection modal so users can
 * quickly locate any asset among 50+ catalog items without scrolling a giant raw <select>.
 */
function SearchableAssetSelect({ label, assets, value, onChange, excludeId = null }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === value) || null,
    [assets, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets
      .filter((a) => a.id !== excludeId)
      .filter((a) => {
        if (!q) return true;
        return (
          a.title.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
        );
      })
      .slice(0, 40);
  }, [assets, excludeId, query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  return (
    <div className="space-y-1 relative" ref={wrapperRef}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-slate-950 border border-slate-700 hover:border-emerald-500/60 rounded-xl px-3 py-2 text-xs text-left text-slate-100 flex items-center justify-between gap-2 cursor-pointer transition-colors"
      >
        {selectedAsset ? (
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase shrink-0 ${getTypePillStyle(
                selectedAsset.type
              )}`}
            >
              {selectedAsset.isScenario ? 'Scenario' : selectedAsset.type}
            </span>
            <span className="font-bold text-slate-100 truncate">{selectedAsset.title}</span>
          </div>
        ) : (
          <span className="text-slate-500">Select an asset...</span>
        )}
        <Search size={12} className="text-slate-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-14 z-50 bg-[#0b1120] border border-slate-700 rounded-xl shadow-2xl p-2 space-y-1.5">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type asset name or category..."
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
          </div>
          <div className="max-h-44 overflow-y-auto space-y-0.5 pr-0.5">
            {filtered.length === 0 ? (
              <div className="p-2.5 text-center text-[11px] text-slate-500">
                No matching assets found.
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`w-full px-2 py-1.5 rounded-lg text-left text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    item.id === value
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                      : 'hover:bg-slate-900 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase shrink-0 ${getTypePillStyle(
                        item.type
                      )}`}
                    >
                      {item.isScenario ? 'Scenario' : item.type}
                    </span>
                    <span className="truncate font-semibold">{item.title}</span>
                  </div>
                  {item.id === value && <Check size={12} className="text-emerald-400 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeaverGraphTab({ activeNode, onSelectTab, onSwitchView }) {
  const {
    universeState,
    setUniverseState,
    elementsCatalog,
    mapsCatalog,
    setActiveScenarioId
  } = useStory();

  // ── PRIMARY MODE: ASSET NETWORK vs SCENARIO FLOWCHART ──
  const [graphMode, setGraphMode] = useState('assets'); // 'assets' | 'flowchart'

  // ── INTELLIGENT GRAPH SCOPE & FILTER STATE ──
  const [scopeMode, setScopeMode] = useState('connected'); // 'connected' | 'focus'
  const [focusNodeId, setFocusNodeId] = useState(null);
  const [hopDepth, setHopDepth] = useState(2); // 1 | 2
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pinnedNodeIds, setPinnedNodeIds] = useState([]);

  // ── SIDE DRAWERS: CATALOG TRAY & SMART SUGGESTIONS ──
  const [isCatalogTrayOpen, setIsCatalogTrayOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  // ── VIEWPORT & NODE DRAG STATE ──
  const canvasRef = useRef(null);
  const [transform, setTransform] = useState({ x: 80, y: 60, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, initX: 0, initY: 0 });

  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragNodeRef = useRef({ startMouseX: 0, startMouseY: 0, initNodeX: 0, initNodeY: 0, moved: false });
  const [localDragPositions, setLocalDragPositions] = useState({});

  // ── DRAG-TO-CONNECT WIRE STATE ──
  const [connectingSourceId, setConnectingSourceId] = useState(null);
  const [connectingCursor, setConnectingCursor] = useState(null);

  // ── SELECTION & INSPECTOR STATE ──
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  // ── LINK CREATION MODAL STATE ──
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [newLinkSource, setNewLinkSource] = useState('');
  const [newLinkTarget, setNewLinkTarget] = useState('');
  const [newLinkType, setNewLinkType] = useState('allied');
  const [newLinkNote, setNewLinkNote] = useState('');

  // ── EDITING EXISTING / PROMOTED EDGE STATE ──
  const [editingEdgeType, setEditingEdgeType] = useState('allied');
  const [editingEdgeNote, setEditingEdgeNote] = useState('');

  const rawLinks = useMemo(() => universeState?.assetLinks || [], [universeState?.assetLinks]);
  const savedPositions = useMemo(
    () => universeState?.assetGraphPositions || {},
    [universeState?.assetGraphPositions]
  );

  // 1. Build clean, deduplicated catalog (scenarios of current project + elements + maps)
  const { catalogAssets, scenariosFlat } = useMemo(
    () =>
      buildCatalogAssets({
        scenariosTree: universeState?.scenarios || [],
        elementsCatalog: elementsCatalog || [],
        mapsCatalog: mapsCatalog || [],
        universeMaps: universeState?.maps || [],
        rawLinks,
        activeNode
      }),
    [universeState?.scenarios, universeState?.maps, elementsCatalog, mapsCatalog, rawLinks, activeNode]
  );

  const catalogById = useMemo(
    () => new Map(catalogAssets.map((a) => [a.id, a])),
    [catalogAssets]
  );

  // 2. Synthesize all confirmed connections (Manual + Asset Hub + Prose [[Mentions]] + Schema Relations)
  const confirmedConnections = useMemo(
    () =>
      extractConfirmedConnections({
        catalogAssets,
        rawLinks,
        scenariosFlat
      }),
    [catalogAssets, rawLinks, scenariosFlat]
  );

  // 3. Discover optional high-confidence lore references (never auto-dumped onto canvas)
  const suggestedLinks = useMemo(
    () =>
      discoverSmartLoreSuggestions({
        catalogAssets,
        confirmedConnections
      }),
    [catalogAssets, confirmedConnections]
  );

  const effectiveFocusId = focusNodeId || activeNode?.id || catalogAssets[0]?.id || null;

  // 4. Filter to strictly connection-first visible nodes & edges
  const { visibleNodes, visibleLinks, totalDegreeMap } = useMemo(
    () =>
      filterVisibleGraph({
        catalogAssets,
        confirmedConnections,
        scopeMode,
        focusNodeId: effectiveFocusId,
        hopDepth,
        selectedCategory,
        searchQuery: search,
        pinnedNodeIds
      }),
    [
      catalogAssets,
      confirmedConnections,
      scopeMode,
      effectiveFocusId,
      hopDepth,
      selectedCategory,
      search,
      pinnedNodeIds
    ]
  );

  // 5. Intelligent non-overlapping multi-island radial layout + manual drag overrides
  const computedPositions = useMemo(() => {
    const mergedSaved = { ...savedPositions, ...localDragPositions };
    return computeIntelligentAssetLayout({
      nodes: visibleNodes,
      links: visibleLinks,
      focalNodeId: scopeMode === 'focus' ? effectiveFocusId : activeNode?.id,
      savedPositions: mergedSaved
    });
  }, [visibleNodes, visibleLinks, scopeMode, effectiveFocusId, activeNode?.id, savedPositions, localDragPositions]);

  // Fit viewport cleanly around visible connected nodes
  const handleFitToView = useCallback(
    (customPositions = null) => {
      if (!canvasRef.current || visibleNodes.length === 0) return;
      const rect = canvasRef.current.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 80) return;

      const posMap = customPositions || computedPositions;
      const bounds = computeAssetGraphBounds(visibleNodes, posMap, 90);
      const scaleX = rect.width / bounds.width;
      const scaleY = rect.height / bounds.height;
      const zoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.42), 1.15);

      const x = Math.round(rect.width / 2 - bounds.centerX * zoom);
      const y = Math.round(rect.height / 2 - bounds.centerY * zoom);
      setTransform({ x, y, zoom: Number(zoom.toFixed(2)) });
    },
    [visibleNodes, computedPositions]
  );

  // Auto-fit when first entering Asset Network or when node count changes from 0 -> N
  const prevVisibleCountRef = useRef(0);
  useEffect(() => {
    if (graphMode !== 'assets') return;
    if (visibleNodes.length > 0 && prevVisibleCountRef.current === 0) {
      const id = requestAnimationFrame(() => handleFitToView());
      prevVisibleCountRef.current = visibleNodes.length;
      return () => cancelAnimationFrame(id);
    }
    prevVisibleCountRef.current = visibleNodes.length;
  }, [graphMode, visibleNodes.length, handleFitToView]);

  const selectedEdge = useMemo(
    () => confirmedConnections.find((l) => l.id === selectedEdgeId) || null,
    [confirmedConnections, selectedEdgeId]
  );

  const selectedNode = useMemo(
    () => (selectedNodeId ? catalogById.get(selectedNodeId) || null : null),
    [catalogById, selectedNodeId]
  );

  useEffect(() => {
    if (selectedEdge) {
      setEditingEdgeType(
        MANUAL_RELATIONSHIP_OPTIONS.some((o) => o.id === selectedEdge.type)
          ? selectedEdge.type
          : 'allied'
      );
      setEditingEdgeNote(selectedEdge.note || '');
    }
  }, [selectedEdge]);

  // ── PERSISTENCE HELPERS ──
  const saveLinksToUniverse = useCallback(
    (updatedLinks) => {
      setUniverseState((prev) => ({
        ...prev,
        assetLinks: updatedLinks
      }));
    },
    [setUniverseState]
  );

  const savePositionsToUniverse = useCallback(
    (updatedPositions) => {
      setUniverseState((prev) => ({
        ...prev,
        assetGraphPositions: updatedPositions
      }));
    },
    [setUniverseState]
  );

  // ── AUTO-ORGANIZE LAYOUT ──
  const handleAutoOrganize = () => {
    setLocalDragPositions({});
    savePositionsToUniverse({});
    const freshLayout = computeIntelligentAssetLayout({
      nodes: visibleNodes,
      links: visibleLinks,
      focalNodeId: scopeMode === 'focus' ? effectiveFocusId : activeNode?.id,
      savedPositions: {}
    });
    requestAnimationFrame(() => handleFitToView(freshLayout));
    AudioService.playTerminalBeep(1200, 0.03);
  };

  // ── OPEN CREATE LINK MODAL ──
  const openConnectModal = (prefillSourceId = '', prefillTargetId = '') => {
    const defaultSrc =
      prefillSourceId ||
      selectedNodeId ||
      activeNode?.id ||
      catalogAssets[0]?.id ||
      '';
    const fallbackTarget =
      prefillTargetId ||
      catalogAssets.find((a) => a.id !== defaultSrc)?.id ||
      '';

    setNewLinkSource(defaultSrc);
    setNewLinkTarget(fallbackTarget);
    setNewLinkType('allied');
    setNewLinkNote('');
    setIsCreateLinkOpen(true);
  };

  const handleCreateLink = (e) => {
    if (e) e.preventDefault();
    if (!newLinkSource || !newLinkTarget || newLinkSource === newLinkTarget) return;

    const newLink = {
      id: uuidv4(),
      source: newLinkSource,
      target: newLinkTarget,
      type: newLinkType,
      note: newLinkNote.trim() || undefined,
      createdAt: Date.now()
    };

    const next = [...rawLinks, newLink];
    saveLinksToUniverse(next);
    setSelectedEdgeId(newLink.id);
    setSelectedNodeId(null);
    setIsCreateLinkOpen(false);
    setNewLinkNote('');
    AudioService.playCriticalChime(true);
  };

  // Pin a smart lore suggestion directly as a confirmed link
  const handleConfirmSuggestion = (suggestion) => {
    const newLink = {
      id: uuidv4(),
      source: suggestion.source,
      target: suggestion.target,
      type: suggestion.type || 'allied',
      note: suggestion.reason,
      createdAt: Date.now()
    };
    saveLinksToUniverse([...rawLinks, newLink]);
    setSelectedEdgeId(newLink.id);
    AudioService.playCriticalChime(true);
  };

  const handleConfirmAllSuggestions = () => {
    if (suggestedLinks.length === 0) return;
    const additions = suggestedLinks.map((s) => ({
      id: uuidv4(),
      source: s.source,
      target: s.target,
      type: s.type || 'allied',
      note: s.reason,
      createdAt: Date.now()
    }));
    saveLinksToUniverse([...rawLinks, ...additions]);
    setIsSuggestionsOpen(false);
    AudioService.playCriticalChime(true);
  };

  // Save edits to a selected link (or promote an auto-detected link into universeState.assetLinks!)
  const handleSaveEdgeDetails = () => {
    if (!selectedEdge) return;
    const trimmedNote = editingEdgeNote.trim() || undefined;

    if (selectedEdge.isManual) {
      const next = rawLinks.map((l) =>
        l.id === selectedEdge.id
          ? { ...l, type: editingEdgeType, note: trimmedNote }
          : l
      );
      saveLinksToUniverse(next);
    } else {
      const promoted = {
        id: uuidv4(),
        source: selectedEdge.source,
        target: selectedEdge.target,
        type: editingEdgeType,
        note: trimmedNote,
        createdAt: Date.now()
      };
      saveLinksToUniverse([...rawLinks, promoted]);
      setSelectedEdgeId(promoted.id);
    }
    AudioService.playTerminalBeep(1100, 0.03);
  };

  const handleReverseEdgeDirection = () => {
    if (!selectedEdge || !selectedEdge.isManual) return;
    const next = rawLinks.map((l) =>
      l.id === selectedEdge.id ? { ...l, source: l.target, target: l.source } : l
    );
    saveLinksToUniverse(next);
    AudioService.playTerminalBeep(1050, 0.02);
  };

  const handleDeleteLink = (linkId) => {
    const next = rawLinks.filter((l) => l.id !== linkId);
    saveLinksToUniverse(next);
    if (selectedEdgeId === linkId) setSelectedEdgeId(null);
    AudioService.playTerminalBeep(700, 0.04);
  };

  // ── CANVAS INTERACTION: ZOOM, PAN, NODE DRAG & PORT WIRING ──
  const handleZoomByFactor = (factor, clientX, clientY) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = clientX !== undefined ? clientX : rect.left + rect.width / 2;
    const cy = clientY !== undefined ? clientY : rect.top + rect.height / 2;

    setTransform((prev) => {
      const nextZoom = Math.min(Math.max(prev.zoom * factor, 0.35), 2.2);
      const gx = (cx - rect.left - prev.x) / prev.zoom;
      const gy = (cy - rect.top - prev.y) / prev.zoom;
      return {
        x: Math.round(cx - rect.left - gx * nextZoom),
        y: Math.round(cy - rect.top - gy * nextZoom),
        zoom: Number(nextZoom.toFixed(2))
      };
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    handleZoomByFactor(e.deltaY < 0 ? 1.09 : 0.91, e.clientX, e.clientY);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target.closest('.asset-graph-card') || e.target.closest('.asset-edge-pill')) {
      return;
    }
    setSelectedEdgeId(null);
    setSelectedNodeId(null);
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initX: transform.x,
      initY: transform.y
    };
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setTransform((prev) => ({
        ...prev,
        x: panStartRef.current.initX + dx,
        y: panStartRef.current.initY + dy
      }));
      return;
    }

    if (draggingNodeId) {
      const dx = (e.clientX - dragNodeRef.current.startMouseX) / transform.zoom;
      const dy = (e.clientY - dragNodeRef.current.startMouseY) / transform.zoom;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragNodeRef.current.moved = true;
      }
      setLocalDragPositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: Math.round(dragNodeRef.current.initNodeX + dx),
          y: Math.round(dragNodeRef.current.initNodeY + dy)
        }
      }));
      return;
    }

    if (connectingSourceId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectingCursor({
        x: (e.clientX - rect.left - transform.x) / transform.zoom,
        y: (e.clientY - rect.top - transform.y) / transform.zoom
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (isPanning) setIsPanning(false);

    if (draggingNodeId) {
      const draggedPos = localDragPositions[draggingNodeId];
      if (draggedPos && dragNodeRef.current.moved) {
        savePositionsToUniverse({
          ...savedPositions,
          [draggingNodeId]: draggedPos
        });
      }
      setDraggingNodeId(null);
    }

    if (connectingSourceId) {
      setConnectingSourceId(null);
      setConnectingCursor(null);
    }
  };

  const handleCardMouseDown = (e, node) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const pos = computedPositions[node.id] || { x: 0, y: 0 };
    setDraggingNodeId(node.id);
    dragNodeRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      initNodeX: pos.x,
      initNodeY: pos.y,
      moved: false
    };
  };

  const handleCardMouseUp = (e, node) => {
    if (connectingSourceId && connectingSourceId !== node.id) {
      e.stopPropagation();
      const src = connectingSourceId;
      setConnectingSourceId(null);
      setConnectingCursor(null);
      openConnectModal(src, node.id);
      return;
    }
    if (!dragNodeRef.current.moved) {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
    }
  };

  const handleStartWireFromNode = (e, node) => {
    e.stopPropagation();
    const pos = computedPositions[node.id] || { x: 0, y: 0 };
    setConnectingSourceId(node.id);
    setConnectingCursor({ x: pos.x + CARD_WIDTH / 2 + 24, y: pos.y });
  };

  const handleFocusNodeWeb = (nodeId) => {
    setFocusNodeId(nodeId);
    setScopeMode('focus');
    setSelectedNodeId(nodeId);
    AudioService.playTerminalBeep(1200, 0.02);
  };

  const handlePinCatalogAsset = (assetId) => {
    setPinnedNodeIds((prev) => (prev.includes(assetId) ? prev : [...prev, assetId]));
    setSelectedNodeId(assetId);
    AudioService.playTerminalBeep(1150, 0.02);
  };

  const filteredCatalogTrayItems = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return catalogAssets.filter((item) => {
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [catalogAssets, catalogSearch]);

  const categories = ['All', 'Scenario', 'Persona', 'Faction', 'Location', 'Item', 'Lore'];

  return (
    <div className="flex-1 h-full w-full bg-[#070b13] flex flex-col overflow-hidden font-mono text-slate-100 select-none">
      {/* ── UNIFIED MODE-AWARE STUDIO HEADER ── */}
      <div className="py-2.5 px-4 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {graphMode === 'assets' ? (
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shrink-0">
              <Network size={16} />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
              <GitBranch size={16} />
            </div>
          )}

          <div className="min-w-0">
            {graphMode === 'assets' ? (
              <>
                <h2 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex flex-wrap items-center gap-1.5">
                  <span>Asset Interconnection Graph</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    {visibleLinks.length} {visibleLinks.length === 1 ? 'Connection' : 'Connections'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                    {visibleNodes.length} Active / {catalogAssets.length} Catalog
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400 truncate">
                  Connection-first narrative web — displaying linked assets, prose mentions, and secret notes
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex flex-wrap items-center gap-1.5">
                  <span>Scenario Branching Flowchart</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    {scenariosFlat.length} {scenariosFlat.length === 1 ? 'Scene' : 'Scenes'}
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400 truncate">
                  Interactive scene progression, choice branches, walkthrough simulator &amp; AIME continuity
                </p>
              </>
            )}
          </div>
        </div>

        {/* Persistent Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[10px] font-bold shrink-0">
          <button
            type="button"
            onClick={() => setGraphMode('assets')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              graphMode === 'assets'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Asset Interconnection Network (Personas, Factions, Locations, Lore)"
          >
            <Network size={12} />
            <span>Asset Network</span>
          </button>
          <button
            type="button"
            onClick={() => setGraphMode('flowchart')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              graphMode === 'flowchart'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Scenario Branching Flowchart, Play Simulator & AIME Continuity Audit"
          >
            <GitBranch size={12} />
            <span>Scenario Flowchart</span>
          </button>
        </div>
      </div>

      {/* ── MODE 2: SCENARIO FLOWCHART WORKSPACE ── */}
      {graphMode === 'flowchart' ? (
        <div className="flex-1 flex overflow-hidden relative min-h-0">
          <VisualStoryGraph
            embedded={true}
            activeScenarioId={activeNode?.id}
            onSelectScenario={(id) => {
              if (typeof setActiveScenarioId === 'function') setActiveScenarioId(id);
            }}
            onOpenInWeaver={(node) => {
              if (typeof setActiveScenarioId === 'function' && node?.id) {
                setActiveScenarioId(node.id);
              }
              if (typeof onSelectTab === 'function') {
                onSelectTab('write');
              }
            }}
            onSwitchView={(targetView) => {
              if (targetView === 'interactive' && typeof onSelectTab === 'function') {
                onSelectTab('play');
              } else if (typeof onSwitchView === 'function') {
                onSwitchView(targetView);
              }
            }}
          />
        </div>
      ) : (
        /* ── MODE 1: INTELLIGENT ASSET INTERCONNECTION NETWORK ── */
        <>
          {/* Asset Network Cockpit Sub-Toolbar (matches GraphToolbar proportions & wrap safety) */}
          <div className="min-h-11 py-1.5 px-3 bg-[#090d16] border-b border-slate-800 flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1.5 shrink-0 z-20 text-xs">
            {/* Left Cluster: Scope Mode, Search & Category Filter */}
            <div className="flex items-center flex-wrap gap-1.5">
              {/* Scope Selector: Connected Web vs Ego Focus */}
              <div className="flex items-center h-7 bg-slate-950/90 border border-slate-700/80 rounded-lg p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setScopeMode('connected')}
                  className={`h-full px-2.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                    scopeMode === 'connected'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Show all connected asset clusters (unconnected catalog items stay hidden)"
                >
                  <Link2 size={11} />
                  <span>Connected Web</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!focusNodeId && activeNode?.id) setFocusNodeId(activeNode.id);
                    setScopeMode('focus');
                  }}
                  className={`h-full px-2.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                    scopeMode === 'focus'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Isolate 1-hop or 2-hop neighborhood around the focused Scenario or Asset"
                >
                  <Crosshair size={11} />
                  <span>Focus Hub</span>
                </button>
              </div>

              {scopeMode === 'focus' && (
                <div className="flex items-center h-7 bg-slate-950/90 border border-cyan-800/60 rounded-lg p-0.5 text-[10px] shrink-0">
                  {[1, 2].map((depth) => (
                    <button
                      key={depth}
                      type="button"
                      onClick={() => setHopDepth(depth)}
                      className={`h-full px-2 rounded font-bold cursor-pointer ${
                        hopDepth === depth
                          ? 'bg-cyan-900/70 text-cyan-200'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title={`Show ${depth}-hop neighborhood around ${catalogById.get(effectiveFocusId)?.title || 'Focus Hub'}`}
                    >
                      {depth}-Hop
                    </button>
                  ))}
                </div>
              )}

              {/* Search Connected Nodes */}
              <div className="relative w-36 sm:w-44 shrink-0">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter web..."
                  className="w-full h-7 pl-7 pr-2 bg-slate-950/90 border border-slate-700/80 focus:border-emerald-400 rounded-lg text-slate-200 placeholder-slate-500 text-[11px] outline-none"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter asset category"
                className="h-7 px-2 bg-slate-950/90 border border-slate-700/80 focus:border-emerald-400 rounded-lg text-slate-300 text-[11px] outline-none cursor-pointer shrink-0"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Right Cluster: Connect, Discover, Tray, Layout & Viewport */}
            <div className="flex items-center flex-wrap gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => openConnectModal()}
                className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 cursor-pointer shadow-xs transition-colors shrink-0 whitespace-nowrap"
              >
                <Plus size={12} />
                <span>Connect Assets</span>
              </button>

              {suggestedLinks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsSuggestionsOpen((prev) => !prev)}
                  className={`h-7 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap ${
                    isSuggestionsOpen
                      ? 'bg-amber-950 border-amber-400 text-amber-200'
                      : 'bg-amber-950/40 hover:bg-amber-950/80 border-amber-500/40 text-amber-300'
                  }`}
                  title="Review high-confidence cross-asset lore references detected in your world catalog"
                >
                  <Sparkles size={12} />
                  <span>Suggestions ({suggestedLinks.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsCatalogTrayOpen((prev) => !prev)}
                className={`h-7 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap ${
                  isCatalogTrayOpen
                    ? 'bg-indigo-950 border-indigo-400 text-indigo-200'
                    : 'bg-slate-950/90 hover:bg-slate-900 border-slate-700/80 text-slate-300'
                }`}
                title="Browse unlinked catalog assets to pin or connect without cluttering the graph"
              >
                <Layers size={12} />
                <span>Catalog ({catalogAssets.length})</span>
              </button>

              <div className="w-px h-4 bg-slate-800 mx-0.5 hidden sm:block shrink-0" />

              <button
                type="button"
                onClick={handleAutoOrganize}
                disabled={visibleNodes.length === 0}
                className="h-7 px-2 rounded-lg bg-slate-950/90 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                title="Auto-organize connected clusters into a non-overlapping layout"
              >
                <LayoutGrid size={12} className="text-emerald-400" />
                <span className="hidden lg:inline">Organize</span>
              </button>

              {/* Zoom & Fit Controls */}
              <div className="flex items-center h-7 bg-slate-950/90 border border-slate-700/80 rounded-lg p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleZoomByFactor(0.85)}
                  className="h-full px-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer flex items-center justify-center"
                  title="Zoom Out"
                >
                  <ZoomOut size={12} />
                </button>
                <span className="text-[10px] px-1 font-bold text-slate-300 min-w-9 text-center">
                  {Math.round(transform.zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => handleZoomByFactor(1.18)}
                  className="h-full px-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer flex items-center justify-center"
                  title="Zoom In"
                >
                  <ZoomIn size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFitToView()}
                  className="h-full px-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 border-l border-slate-800 ml-0.5 cursor-pointer flex items-center justify-center"
                  title="Fit Connected Graph to View"
                >
                  <Maximize2 size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* ── MAIN GRAPH BODY: COLLAPSIBLE CATALOG TRAY + INTERACTIVE CANVAS + INSPECTOR ── */}
          <div className="flex-1 flex overflow-hidden relative min-h-0">
            {/* Optional Left Drawer: Clean Unlinked / All Catalog Asset Browser */}
            {isCatalogTrayOpen && (
              <aside className="w-72 bg-[#090e1a]/98 border-r border-slate-800 flex flex-col shrink-0 z-20">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={13} />
                      <span>World &amp; Story Catalog</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Connect or pin individual assets onto the board
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCatalogTrayOpen(false)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="p-2.5 border-b border-slate-800/80">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search Personas, Factions, Worlds..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredCatalogTrayItems.map((asset) => {
                    const deg = totalDegreeMap.get(asset.id) || 0;
                    const isPinned = pinnedNodeIds.includes(asset.id);
                    return (
                      <div
                        key={asset.id}
                        className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 flex items-center justify-between gap-2 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase shrink-0 ${getTypePillStyle(
                                asset.type
                              )}`}
                            >
                              {asset.isScenario ? 'Scenario' : asset.type}
                            </span>
                            {deg > 0 && (
                              <span className="text-[9px] text-emerald-400 font-bold">
                                {deg}🔗
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-200 truncate mt-1" title={asset.title}>
                            {asset.title}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePinCatalogAsset(asset.id)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              isPinned
                                ? 'bg-indigo-950 border-indigo-500/60 text-indigo-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                            title="Pin asset card to graph workspace"
                          >
                            <Pin size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openConnectModal(asset.id)}
                            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 cursor-pointer transition-colors"
                            title={`Establish connection from ${asset.title}`}
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>
            )}

            {/* Smart Lore Suggestions Floating Popover */}
            {isSuggestionsOpen && suggestedLinks.length > 0 && (
              <div className="absolute top-3 right-4 z-30 w-96 max-w-[calc(100%-2rem)] bg-[#0a1020]/98 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} />
                      <span>Discovered Lore References ({suggestedLinks.length})</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Pin detected worldbuilding links onto your connection graph
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleConfirmAllSuggestions}
                      className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Pin All
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSuggestionsOpen(false)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto p-2.5 space-y-1.5">
                  {suggestedLinks.map((s) => {
                    const relMeta = getRelationshipMeta(s.type);
                    return (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                            <span className="truncate max-w-[115px]">{s.sourceAsset.title}</span>
                            <ArrowRight size={11} style={{ color: relMeta.color }} className="shrink-0" />
                            <span className="truncate max-w-[115px]">{s.targetAsset.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans truncate">
                            <span
                              className="uppercase font-mono font-bold text-[9px] mr-1.5"
                              style={{ color: relMeta.color }}
                            >
                              [{relMeta.shortLabel}]
                            </span>
                            {s.reason}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleConfirmSuggestion(s)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus size={11} />
                          <span>Pin</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── INTERACTIVE CONNECTION GRAPH VIEWPORT ── */}
            <div
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onWheel={handleWheel}
              className="flex-1 h-full w-full overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#050811]"
              style={{
                backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px)',
                backgroundSize: `${30 * transform.zoom}px ${30 * transform.zoom}px`,
                backgroundPosition: `${transform.x}px ${transform.y}px`
              }}
            >
              {/* CLEAN GUIDED EMPTY STATE WHEN ZERO CONNECTIONS ARE ACTIVE */}
              {visibleNodes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                  <div className="w-full max-w-lg bg-[#0a101f]/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 pointer-events-auto text-center">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                      <Network size={22} />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                        {search || selectedCategory !== 'All'
                          ? 'No Matching Connected Assets'
                          : 'Clean Connection-First Canvas'}
                      </h3>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-md mx-auto">
                        {search || selectedCategory !== 'All' ? (
                          'No active connections match your current search or category filter.'
                        ) : (
                          <>
                            Unconnected library items ({catalogAssets.length} available in your catalog) are kept off the board so you only see meaningful narrative, faction, and location relationships.
                          </>
                        )}
                      </p>
                    </div>

                    {activeNode && !search && selectedCategory === 'All' && (
                      <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex items-center justify-between gap-3 text-left">
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                            Active Story Anchor
                          </div>
                          <div className="text-xs font-bold text-slate-100 truncate">
                            {activeNode.title || 'Current Scenario'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openConnectModal(activeNode.id)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus size={12} />
                          <span>Link to Scenario</span>
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openConnectModal()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                      >
                        <Plus size={14} />
                        <span>Connect Two Assets</span>
                      </button>

                      {suggestedLinks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsSuggestionsOpen(true)}
                          className="px-3.5 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/50 text-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Sparkles size={14} />
                          <span>Review {suggestedLinks.length} Smart Lore Links</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsCatalogTrayOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Layers size={14} />
                        <span>Browse Catalog</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* TRANSFORM LAYER: CURVED SVG BEZIER WIRES + DRAGGABLE ASSET CARDS */
                <div
                  className="absolute top-0 left-0 w-full h-full pointer-events-none origin-top-left"
                  style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
                  }}
                >
                  {/* 1. SVG Wire Layer */}
                  <svg className="absolute top-0 left-0 overflow-visible w-[6000px] h-[6000px] pointer-events-none z-0">
                    <defs>
                      {Object.values({
                        allied: '#10b981',
                        hostile: '#ef4444',
                        located_in: '#38bdf8',
                        member_of: '#a855f7',
                        custodian_of: '#f59e0b',
                        patron_of: '#06b6d4',
                        secret: '#ec4899',
                        asset_hub: '#818cf8',
                        mentioned: '#2dd4bf',
                        sector_map: '#38bdf8',
                        default: '#94a3b8'
                      }).map((hex, i) => (
                        <marker
                          key={i}
                          id={`asset-arrow-${hex.replace('#', '')}`}
                          viewBox="0 0 10 10"
                          refX="8"
                          refY="5"
                          markerWidth="5.5"
                          markerHeight="5.5"
                          orient="auto-start-reverse"
                        >
                          <path d="M 0 1 L 10 5 L 0 9 z" fill={hex} />
                        </marker>
                      ))}
                    </defs>

                    {visibleLinks.map((link) => {
                      const sPos = computedPositions[link.source];
                      const tPos = computedPositions[link.target];
                      if (!sPos || !tPos) return null;

                      const isSelected = selectedEdgeId === link.id;
                      const meta = getRelationshipMeta(link.type);
                      const strokeColor = meta.color;

                      const dx = tPos.x - sPos.x;
                      const dy = tPos.y - sPos.y;
                      const dist = Math.hypot(dx, dy) || 1;
                      const nx = -dy / dist;
                      const ny = dx / dist;

                      // Trim line endpoints cleanly to card boundary so arrowheads stay visible
                      const startPad = 42;
                      const endPad = 52;
                      const x1 = dist > startPad + endPad ? sPos.x + (dx / dist) * startPad : sPos.x;
                      const y1 = dist > startPad + endPad ? sPos.y + (dy / dist) * startPad : sPos.y;
                      const x2 = dist > startPad + endPad ? tPos.x - (dx / dist) * endPad : tPos.x;
                      const y2 = dist > startPad + endPad ? tPos.y - (dy / dist) * endPad : tPos.y;

                      const curvature = link.curveOffset || 18;
                      const ctrlX = (x1 + x2) / 2 + nx * curvature;
                      const ctrlY = (y1 + y2) / 2 + ny * curvature;

                      // Quadratic Bezier midpoint at t = 0.5
                      const midX = 0.25 * x1 + 0.5 * ctrlX + 0.25 * x2;
                      const midY = 0.25 * y1 + 0.5 * ctrlY + 0.25 * y2;
                      const pathD = `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
                      const markerId = `asset-arrow-${strokeColor.replace('#', '')}`;

                      return (
                        <g key={link.id} className="pointer-events-auto">
                          {/* Wide invisible hit stroke for easy clicking */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="transparent"
                            strokeWidth="16"
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEdgeId(link.id);
                              setSelectedNodeId(null);
                            }}
                          />
                          <path
                            d={pathD}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={isSelected ? 3.2 : 2}
                            strokeDasharray={meta.dashed ? '5 4' : 'none'}
                            opacity={isSelected ? 1 : 0.78}
                            markerEnd={`url(#${markerId})`}
                            className="transition-opacity pointer-events-none"
                          />

                          {/* Midpoint Relationship Badge */}
                          <foreignObject
                            x={midX - 64}
                            y={midY - 13}
                            width="128"
                            height="26"
                            className="overflow-visible pointer-events-auto asset-edge-pill"
                          >
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEdgeId(link.id);
                                  setSelectedNodeId(null);
                                }}
                                title={
                                  link.note
                                    ? `${meta.label}: "${link.note}"`
                                    : `${meta.label} (Click to inspect or add note)`
                                }
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 shadow-md transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-slate-900 border-white text-white scale-105 shadow-lg'
                                    : 'bg-[#090e1a]/95 border-slate-700/90 text-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: strokeColor }}
                                />
                                <span className="truncate max-w-[78px]">{meta.shortLabel}</span>
                                {link.note && (
                                  <span className="text-amber-400 shrink-0" title={link.note}>
                                    📝
                                  </span>
                                )}
                              </button>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}

                    {/* Live Rubberband Connection Wire when dragging from a Card's + port */}
                    {connectingSourceId && connectingCursor && computedPositions[connectingSourceId] && (
                      <line
                        x1={computedPositions[connectingSourceId].x + CARD_WIDTH / 2}
                        y1={computedPositions[connectingSourceId].y}
                        x2={connectingCursor.x}
                        y2={connectingCursor.y}
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeDasharray="5 4"
                      />
                    )}
                  </svg>

                  {/* 2. Draggable Tactical Asset Cards */}
                  {visibleNodes.map((node) => {
                    const pos = computedPositions[node.id];
                    if (!pos) return null;

                    const isSelected = selectedNodeId === node.id;
                    const isFocused = scopeMode === 'focus' && effectiveFocusId === node.id;
                    const catMeta = CATEGORY_META[node.category] || CATEGORY_META.Lore;

                    return (
                      <div
                        key={node.id}
                        onMouseDown={(e) => handleCardMouseDown(e, node)}
                        onMouseUp={(e) => handleCardMouseUp(e, node)}
                        style={{
                          width: `${CARD_WIDTH}px`,
                          height: `${CARD_HEIGHT}px`,
                          transform: `translate(${pos.x - CARD_WIDTH / 2}px, ${pos.y - CARD_HEIGHT / 2}px)`,
                          borderLeftColor: catMeta.accent,
                          borderLeftWidth: '3px'
                        }}
                        className={`asset-graph-card absolute top-0 left-0 pointer-events-auto rounded-xl bg-[#0c1322]/95 border p-2.5 flex flex-col justify-between shadow-lg transition-shadow cursor-grab active:cursor-grabbing group z-10 ${
                          isSelected
                            ? 'border-emerald-400 ring-2 ring-emerald-400/35 shadow-[0_0_22px_rgba(16,185,129,0.28)]'
                            : isFocused
                            ? 'border-cyan-400 ring-1 ring-cyan-400/30'
                            : 'border-slate-800 hover:border-slate-600'
                        } ${node.isDimmed ? 'opacity-45' : 'opacity-100'}`}
                      >
                        {/* Top Metadata Row */}
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[8.5px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider truncate max-w-[115px] ${catMeta.badge}`}
                          >
                            {node.isScenario ? 'Scenario' : node.type}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold"
                              title={`${node.degree} total connections`}
                            >
                              {node.degree}🔗
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFocusNodeWeb(node.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-opacity cursor-pointer"
                              title="Focus 1-2 hop neighborhood around this asset"
                            >
                              <Crosshair size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Asset Title & 1-Line Pitch */}
                        <div className="min-w-0">
                          <div
                            className="text-xs font-bold text-slate-100 truncate leading-tight"
                            title={node.title}
                          >
                            {node.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                            {node.description || (node.isScenario ? 'Active story node' : 'World asset')}
                          </div>
                        </div>

                        {/* Right-Edge Quick-Connect Port (Drag to another card or click to open Connect Modal) */}
                        <button
                          type="button"
                          onMouseDown={(e) => handleStartWireFromNode(e, node)}
                          onClick={(e) => {
                            e.stopPropagation();
                            openConnectModal(node.id);
                          }}
                          title="Drag to another card or click to connect this asset"
                          className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 hover:bg-emerald-600 border border-slate-600 hover:border-emerald-300 text-slate-300 hover:text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-crosshair"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom-Left Compact Legend Pill */}
              {visibleNodes.length > 0 && (
                <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-xl bg-[#090e1a]/90 border border-slate-800/90 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pointer-events-none">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Allied
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Hostile
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400" /> Located
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Member
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-pink-500" /> Secret
                  </span>
                  <span className="text-slate-500 hidden md:inline">
                    • Drag cards to arrange • Drag + port to link
                  </span>
                </div>
              )}
            </div>

            {/* ── RIGHT SIDE: CONNECTION / ASSET INSPECTOR DRAWER ── */}
            {(selectedEdge || selectedNode) && (
              <aside className="w-80 sm:w-96 bg-[#0a0f1d]/98 border-l border-slate-800 p-4 flex flex-col justify-between shrink-0 shadow-2xl z-30 overflow-y-auto">
                {selectedEdge ? (
                  /* 1. CONNECTION INSPECTOR */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Link2 size={14} />
                        <span>Connection Inspector</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedEdgeId(null)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Source Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold text-[11px]">Link Source:</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase text-slate-300">
                          {selectedEdge.origin === 'manual'
                            ? 'Authored Graph Link'
                            : selectedEdge.origin === 'asset_hub'
                            ? 'AIME Asset Hub'
                            : selectedEdge.origin === 'prose'
                            ? 'Story Prose [[Mention]]'
                            : 'Element Schema Field'}
                        </span>
                      </div>

                      {/* Endpoints Card */}
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNodeId(selectedEdge.source);
                              setSelectedEdgeId(null);
                            }}
                            className="text-left truncate font-bold text-cyan-300 hover:underline cursor-pointer"
                          >
                            {catalogById.get(selectedEdge.source)?.title || selectedEdge.source}
                          </button>
                          {selectedEdge.isManual && (
                            <button
                              type="button"
                              onClick={handleReverseEdgeDirection}
                              className="p-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer shrink-0"
                              title="Reverse relationship direction"
                            >
                              <ArrowUpDown size={11} />
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                          ↓ {getRelationshipMeta(selectedEdge.type).label}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNodeId(selectedEdge.target);
                            setSelectedEdgeId(null);
                          }}
                          className="text-left truncate font-bold text-emerald-300 hover:underline cursor-pointer block w-full"
                        >
                          {catalogById.get(selectedEdge.target)?.title || selectedEdge.target}
                        </button>
                      </div>

                      {/* Editable Relationship Type */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Relationship Classification
                        </label>
                        <select
                          value={editingEdgeType}
                          onChange={(e) => setEditingEdgeType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-400 rounded-xl p-2 text-xs text-slate-100 outline-none cursor-pointer"
                        >
                          {MANUAL_RELATIONSHIP_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Explanatory / Secret Note */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                          <span>Attached Note / Explanation</span>
                          <span className="text-[9px] text-amber-400">Optional</span>
                        </label>
                        <textarea
                          value={editingEdgeNote}
                          onChange={(e) => setEditingEdgeNote(e.target.value)}
                          placeholder="e.g., Owes a blood debt; secret informant inside Sector 7 command..."
                          className="w-full h-24 bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                        />
                        <button
                          type="button"
                          onClick={handleSaveEdgeDetails}
                          className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-md"
                        >
                          <Check size={13} />
                          <span>
                            {selectedEdge.isManual ? 'Save Link & Note' : 'Pin & Save Custom Note'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {selectedEdge.isManual && (
                      <div className="pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(selectedEdge.id)}
                          className="w-full py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Sever Connection</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. SELECTED ASSET NODE INSPECTOR */
                  <div className="space-y-4">
                    {(() => {
                      const nodeLinks = confirmedConnections.filter(
                        (l) => l.source === selectedNode.id || l.target === selectedNode.id
                      );
                      const isFocusedHere =
                        scopeMode === 'focus' && effectiveFocusId === selectedNode.id;

                      return (
                        <>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                              {selectedNode.isScenario ? 'Scenario Hub' : 'Asset Dossier'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedNodeId(null)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${getTypePillStyle(
                                  selectedNode.type
                                )}`}
                              >
                                {selectedNode.isScenario ? 'Scenario' : selectedNode.type}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {nodeLinks.length}{' '}
                                {nodeLinks.length === 1 ? 'Connection' : 'Connections'}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-slate-100 leading-snug">
                              {selectedNode.title}
                            </h3>

                            <p className="text-xs text-slate-400 font-sans leading-relaxed">
                              {selectedNode.description ||
                                'No summary description recorded for this asset yet.'}
                            </p>
                          </div>

                          {/* Quick Node Actions */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => openConnectModal(selectedNode.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus size={12} />
                              <span>Connect</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isFocusedHere) {
                                  setScopeMode('connected');
                                } else {
                                  handleFocusNodeWeb(selectedNode.id);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                                isFocusedHere
                                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                              }`}
                            >
                              <Crosshair size={12} />
                              <span>{isFocusedHere ? 'Exit Focus' : 'Focus Web'}</span>
                            </button>

                            {selectedNode.isScenario ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof setActiveScenarioId === 'function') {
                                    setActiveScenarioId(selectedNode.id);
                                  }
                                  if (typeof onSelectTab === 'function') {
                                    onSelectTab('write');
                                  }
                                }}
                                className="col-span-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <BookOpen size={12} />
                                <span>Open Scenario in Write</span>
                              </button>
                            ) : (
                              !selectedNode.isMap && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    useAdeStore.getState().setEditingElement(selectedNode.raw)
                                  }
                                  className="col-span-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <Edit3 size={12} />
                                  <span>Edit in Element Forge</span>
                                </button>
                              )
                            )}
                          </div>

                          {/* Connected Neighbors List */}
                          <div className="space-y-2 pt-3 border-t border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Active Relationships ({nodeLinks.length})
                            </span>

                            {nodeLinks.length === 0 ? (
                              <p className="text-xs text-slate-500 font-sans italic">
                                Not connected yet. Click &ldquo;Connect&rdquo; above to link this asset.
                              </p>
                            ) : (
                              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                                {nodeLinks.map((l) => {
                                  const otherId =
                                    l.source === selectedNode.id ? l.target : l.source;
                                  const otherNode = catalogById.get(otherId);
                                  const meta = getRelationshipMeta(l.type);

                                  return (
                                    <div
                                      key={l.id}
                                      onClick={() => {
                                        setSelectedEdgeId(l.id);
                                        setSelectedNodeId(null);
                                      }}
                                      className="p-2.5 rounded-xl bg-slate-900/75 border border-slate-800 hover:border-emerald-500/50 cursor-pointer flex flex-col gap-1 text-[11px] transition-colors"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-slate-200 truncate">
                                          {otherNode?.title || otherId}
                                        </span>
                                        <span
                                          className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0"
                                          style={{
                                            backgroundColor: `${meta.color}22`,
                                            color: meta.color
                                          }}
                                        >
                                          {meta.shortLabel}
                                        </span>
                                      </div>
                                      {l.note && (
                                        <span className="text-[10px] text-amber-300/90 italic font-sans line-clamp-2">
                                          &ldquo;{l.note}&rdquo;
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </aside>
            )}
          </div>
        </>
      )}

      {/* ── MODAL: ESTABLISH INTERCONNECTION LINK WITH SEARCHABLE ASSET PICKERS ── */}
      {isCreateLinkOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f1d] border border-slate-700 rounded-2xl shadow-2xl overflow-visible font-mono text-slate-100">
            <div className="p-3 px-4 bg-[#070b13] border-b border-slate-800 rounded-t-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 size={14} />
                <span>Establish Interconnection Link</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCreateLinkOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="p-4 space-y-3.5">
              <SearchableAssetSelect
                label="Origin Asset (Source)"
                assets={catalogAssets}
                value={newLinkSource}
                onChange={setNewLinkSource}
              />

              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={() => {
                    const prevSrc = newLinkSource;
                    setNewLinkSource(newLinkTarget);
                    setNewLinkTarget(prevSrc);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Swap Origin and Target"
                >
                  <ArrowUpDown size={11} />
                  <span>Swap Direction</span>
                </button>
              </div>

              <SearchableAssetSelect
                label="Target Asset"
                assets={catalogAssets}
                value={newLinkTarget}
                onChange={setNewLinkTarget}
                excludeId={newLinkSource}
              />

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Relationship Type
                </label>
                <select
                  value={newLinkType}
                  onChange={(e) => setNewLinkType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none cursor-pointer"
                >
                  {MANUAL_RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Optional Explanatory Note / Secret Context</span>
                  <span className="text-amber-400 text-[9px]">Optional</span>
                </label>
                <textarea
                  value={newLinkNote}
                  onChange={(e) => setNewLinkNote(e.target.value)}
                  placeholder="e.g., Hidden blood feud; holds the encryption cipher to Sector 7..."
                  className="w-full h-20 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 font-sans outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateLinkOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newLinkSource || !newLinkTarget || newLinkSource === newLinkTarget}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus size={13} />
                  <span>Establish Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
