/**
 * @file WeaverGraphTab.jsx
 * @description Asset Interconnection Graph for Story Weaver.
 * Visualizes the relationships between world elements (characters, factions, locations, lore)
 * and scenarios. Allows creating and editing links between assets with an OPTIONAL NOTE
 * attached to each link for additional narrative reference, secrets, and explanation.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Network, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info, 
  FileText, 
  Link2, 
  Sparkles, 
  Check, 
  X,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useStory } from '../../../../context/CampaignContext';
import { getTypePillStyle } from '../../ElementForge/elementSchemas';
import { AudioService } from '../../../../services/audioService';
import { v4 as uuidv4 } from 'uuid';

export default function WeaverGraphTab({ activeNode }) {
  const { 
    universeState, 
    setUniverseState, 
    elementsCatalog, 
    updateStory 
  } = useStory();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  // Selection state
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  // Link Creation Modal / Drawer State
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [newLinkSource, setNewLinkSource] = useState('');
  const [newLinkTarget, setNewLinkTarget] = useState('');
  const [newLinkType, setNewLinkType] = useState('allied');
  const [newLinkNote, setNewLinkNote] = useState('');

  // Editing existing link note
  const [editingEdgeNote, setEditingEdgeNote] = useState('');

  const svgRef = useRef(null);

  // Links store: stored in universeState.assetLinks or initialized
  const rawLinks = useMemo(() => {
    return universeState?.assetLinks || [];
  }, [universeState?.assetLinks]);

  // Available elements for nodes
  const allElements = useMemo(() => {
    return elementsCatalog || [];
  }, [elementsCatalog]);

  // Combine elements + active story scenario into node list
  const nodes = useMemo(() => {
    const list = [];
    
    // Add current scenario as special anchor node
    if (activeNode) {
      list.push({
        id: activeNode.id,
        title: activeNode.title || 'Current Scenario',
        type: 'Scenario',
        isScenario: true,
        description: activeNode.content?.slice(0, 100) || 'Active Story Scenario'
      });
    }

    // Add elements
    for (const elem of allElements) {
      if (selectedType === 'All' || elem.type?.toLowerCase() === selectedType.toLowerCase()) {
        if (!search || elem.title?.toLowerCase().includes(search.toLowerCase())) {
          list.push({
            id: elem.id,
            title: elem.title,
            type: elem.type || 'Object',
            isScenario: false,
            description: elem.fields?.description || elem.fields?.oneLinePitch || ''
          });
        }
      }
    }
    return list;
  }, [activeNode, allElements, selectedType, search]);

  // Compute circular or grid layout positions
  const nodePositions = useMemo(() => {
    const positions = {};
    const count = nodes.length;
    if (count === 0) return positions;

    const centerX = 450;
    const centerY = 320;
    const radius = Math.min(280, Math.max(160, count * 22));

    nodes.forEach((n, idx) => {
      if (n.isScenario) {
        positions[n.id] = { x: centerX, y: centerY };
      } else {
        // distribute in a circle around center
        const angle = (idx / (count > 1 ? count - (nodes.some(x => x.isScenario) ? 1 : 0) : 1)) * 2 * Math.PI;
        positions[n.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      }
    });
    return positions;
  }, [nodes]);

  // Filter links where both source and target exist in nodes
  const visibleLinks = useMemo(() => {
    const nodeIds = new Set(nodes.map(n => n.id));
    return rawLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
  }, [rawLinks, nodes]);

  const selectedEdge = useMemo(() => {
    return rawLinks.find(l => l.id === selectedEdgeId) || null;
  }, [rawLinks, selectedEdgeId]);

  useEffect(() => {
    if (selectedEdge) {
      setEditingEdgeNote(selectedEdge.note || '');
    }
  }, [selectedEdge]);

  // Pan interaction
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'graph-canvas-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleSaveLinks = (updatedLinks) => {
    setUniverseState(prev => ({
      ...prev,
      assetLinks: updatedLinks
    }));
  };

  const handleCreateLink = (e) => {
    if (e) e.preventDefault();
    if (!newLinkSource || !newLinkTarget || newLinkSource === newLinkTarget) {
      return;
    }

    const newLink = {
      id: uuidv4(),
      source: newLinkSource,
      target: newLinkTarget,
      type: newLinkType,
      note: newLinkNote.trim() || undefined,
      createdAt: Date.now()
    };

    const next = [...rawLinks, newLink];
    handleSaveLinks(next);
    setSelectedEdgeId(newLink.id);
    setIsCreateLinkOpen(false);
    setNewLinkNote('');
    AudioService.playCriticalChime(true);
  };

  const handleDeleteLink = (linkId) => {
    const next = rawLinks.filter(l => l.id !== linkId);
    handleSaveLinks(next);
    if (selectedEdgeId === linkId) setSelectedEdgeId(null);
    AudioService.playTerminalBeep(700, 0.04);
  };

  const handleUpdateEdgeNote = () => {
    if (!selectedEdgeId) return;
    const next = rawLinks.map(l => l.id === selectedEdgeId ? { ...l, note: editingEdgeNote.trim() || undefined } : l);
    handleSaveLinks(next);
    AudioService.playTerminalBeep(1100, 0.02);
  };

  const getRelationColor = (relType) => {
    switch (relType) {
      case 'allied': return '#10b981';
      case 'hostile': return '#ef4444';
      case 'located_in': return '#38bdf8';
      case 'member_of': return '#a855f7';
      case 'custodian_of': return '#f59e0b';
      case 'secret': return '#ec4899';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="flex-1 h-full w-full bg-[#070b13] flex flex-col overflow-hidden font-mono text-slate-100 select-none">
      {/* Top Header & Toolbar */}
      <div className="p-3 px-4 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Network size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Asset Interconnection Graph</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {visibleLinks.length} Connections
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Cross-asset narrative links with explanatory notes and secret relationships
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter graph nodes..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-36 sm:w-44"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setNewLinkSource(nodes[0]?.id || '');
              setNewLinkTarget(nodes[1]?.id || '');
              setIsCreateLinkOpen(true);
            }}
            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <Plus size={13} />
            <span>Connect Assets</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              className="p-1 hover:text-white text-slate-400 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] px-1 font-bold text-slate-400 min-w-8 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
              className="p-1 hover:text-white text-slate-400 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-1 hover:text-white text-slate-400 cursor-pointer border-l border-slate-800 ml-0.5"
              title="Reset View"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Viewport + In-Situ Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SVG Graph Canvas */}
        <div 
          className="flex-1 h-full w-full overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#050811]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Background grid dots */}
            <defs>
              <pattern id="graphGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="#1e293b" opacity="0.4" />
              </pattern>
              {/* Arrow marker for links */}
              <marker
                id="linkArrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
            </defs>

            <rect id="graph-canvas-bg" width="3000" height="3000" fill="url(#graphGrid)" />

            {/* Links / Edges */}
            <g className="links">
              {visibleLinks.map((link) => {
                const sPos = nodePositions[link.source];
                const tPos = nodePositions[link.target];
                if (!sPos || !tPos) return null;

                const isSelected = selectedEdgeId === link.id;
                const strokeColor = getRelationColor(link.type);
                const midX = (sPos.x + tPos.x) / 2;
                const midY = (sPos.y + tPos.y) / 2;

                return (
                  <g key={link.id} className="cursor-pointer group" onClick={() => setSelectedEdgeId(link.id)}>
                    {/* Line */}
                    <line
                      x1={sPos.x}
                      y1={sPos.y}
                      x2={tPos.x}
                      y2={tPos.y}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 3.5 : 2}
                      strokeDasharray={link.type === 'secret' ? '4 3' : 'none'}
                      opacity={isSelected ? 1 : 0.75}
                      markerEnd="url(#linkArrow)"
                      className="transition-all"
                    />

                    {/* Edge Label Pill (Shows Type + Note Indicator) */}
                    <foreignObject
                      x={midX - 55}
                      y={midY - 14}
                      width="110"
                      height="28"
                      className="overflow-visible pointer-events-auto"
                    >
                      <div 
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-white text-white scale-110 shadow-lg'
                            : 'bg-slate-950/90 border-slate-700 text-slate-300 hover:border-slate-400'
                        }`}
                        title={link.note ? `Note: "${link.note}"` : 'No attached note'}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: strokeColor }} />
                        <span className="truncate max-w-[65px]">{link.type}</span>
                        {link.note && (
                          <span className="text-amber-400 shrink-0" title="Has attached explanatory note">
                            📝
                          </span>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {nodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;

                const isSelected = selectedNodeId === node.id;
                const pill = getTypePillStyle(node.type);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer select-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                  >
                    {/* Circle halo on select */}
                    {isSelected && (
                      <circle
                        r={node.isScenario ? 32 : 26}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        className="animate-spin-slow"
                      />
                    )}

                    {/* Node Body */}
                    <circle
                      r={node.isScenario ? 24 : 18}
                      fill={node.isScenario ? '#0c4a6e' : '#0f172a'}
                      stroke={node.isScenario ? '#38bdf8' : (isSelected ? '#f8fafc' : '#334155')}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-all hover:scale-110"
                    />

                    {/* Node Title Label */}
                    <text
                      y={node.isScenario ? 38 : 30}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize={node.isScenario ? 11 : 9.5}
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow"
                    >
                      {node.title.length > 16 ? `${node.title.slice(0, 14)}...` : node.title}
                    </text>

                    {/* Type indicator text inside circle */}
                    <text
                      y={4}
                      textAnchor="middle"
                      fill={node.isScenario ? '#7dd3fc' : '#94a3b8'}
                      fontSize={8}
                      fontWeight="bold"
                      className="pointer-events-none font-mono uppercase"
                    >
                      {node.isScenario ? 'SCEN' : node.type.slice(0, 3)}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right Side: Link / Node Inspector Panel */}
        {(selectedEdge || selectedNodeId) && (
          <div className="w-80 sm:w-96 bg-[#0a0f1d]/95 border-l border-slate-800 p-4 flex flex-col justify-between shrink-0 shadow-2xl z-30 font-mono">
            {/* If an edge is selected: inspect and edit note */}
            {selectedEdge ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Link2 size={14} />
                    <span>Connection Inspector</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedEdgeId(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Relationship:</span>
                    <span 
                      className="px-2 py-0.5 rounded font-bold uppercase text-[10px]"
                      style={{ 
                        backgroundColor: `${getRelationColor(selectedEdge.type)}22`,
                        color: getRelationColor(selectedEdge.type)
                      }}
                    >
                      {selectedEdge.type}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-[11px]">
                    <div className="text-slate-400">From: <strong className="text-slate-200">{nodes.find(n => n.id === selectedEdge.source)?.title || selectedEdge.source}</strong></div>
                    <div className="text-slate-400">To: <strong className="text-slate-200">{nodes.find(n => n.id === selectedEdge.target)?.title || selectedEdge.target}</strong></div>
                  </div>

                  {/* Attached Explanatory Note (Core user requirement!) */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Attached Note / Explanation:</span>
                      <span className="text-[9px] text-amber-400">Optional</span>
                    </label>
                    <textarea
                      value={editingEdgeNote}
                      onChange={(e) => setEditingEdgeNote(e.target.value)}
                      placeholder="e.g., Operative Jax owes a debt to Sector Overseer Vane; secrets hidden in vault..."
                      className="w-full h-24 bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={handleUpdateEdgeNote}
                      className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-md"
                    >
                      <Check size={12} />
                      <span>Save Link Note</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(selectedEdge.id)}
                    className="w-full py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Sever Connection</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If a node is selected */
              <div className="space-y-4">
                {(() => {
                  const node = nodes.find(n => n.id === selectedNodeId);
                  if (!node) return null;
                  const nodeLinks = rawLinks.filter(l => l.source === node.id || l.target === node.id);

                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                          {node.isScenario ? 'Story Scenario' : 'Asset Node'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedNodeId(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-100">{node.title}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 uppercase font-bold">
                          {node.type}
                        </span>
                        <p className="text-xs text-slate-400 font-sans leading-relaxed pt-1">
                          {node.description || 'No description available for this element.'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                          Active Connections ({nodeLinks.length}):
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {nodeLinks.map((l) => {
                            const otherId = l.source === node.id ? l.target : l.source;
                            const otherNode = nodes.find(n => n.id === otherId);
                            return (
                              <div
                                key={l.id}
                                onClick={() => setSelectedEdgeId(l.id)}
                                className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex flex-col gap-1 text-[11px]"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-200 truncate">{otherNode?.title || otherId}</span>
                                  <span className="text-[9px] uppercase font-bold text-slate-400">{l.type}</span>
                                </div>
                                {l.note && (
                                  <span className="text-[10px] text-amber-300/90 italic font-sans truncate">
                                    "{l.note}"
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create New Connection with Optional Note */}
      {isCreateLinkOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f1d] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden font-mono text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 px-4 bg-[#070b13] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 size={14} />
                <span>Establish Interconnection Link</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCreateLinkOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Origin Asset (Source)</label>
                <select
                  value={newLinkSource}
                  onChange={(e) => setNewLinkSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.title} ({n.type})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Asset</label>
                <select
                  value={newLinkTarget}
                  onChange={(e) => setNewLinkTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.title} ({n.type})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Relationship Type</label>
                <select
                  value={newLinkType}
                  onChange={(e) => setNewLinkType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                >
                  <option value="allied">Allied / Cooperative</option>
                  <option value="hostile">Hostile / Rivalry</option>
                  <option value="located_in">Located In / Resident</option>
                  <option value="member_of">Member Of / Faction Affiliate</option>
                  <option value="custodian_of">Custodian Of / Possesses</option>
                  <option value="secret">Secret Connection / Hidden Motive</option>
                </select>
              </div>

              {/* Optional note attached to link (user specification) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Optional Explanatory Note / Context</span>
                  <span className="text-amber-400 text-[9px]">Optional</span>
                </label>
                <textarea
                  value={newLinkNote}
                  onChange={(e) => setNewLinkNote(e.target.value)}
                  placeholder="e.g., Hidden blood feud; knows the encryption cipher to Sector 7..."
                  className="w-full h-18 bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 placeholder-slate-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateLinkOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1"
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
