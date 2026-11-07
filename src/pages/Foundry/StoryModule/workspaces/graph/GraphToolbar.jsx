/**
 * @file GraphToolbar.jsx
 * @description Glass-cockpit top toolbar for the ADE Story Graph.
 * Houses graph search, type/map filters, auto-layout algorithms, snap-to-grid,
 * interactive playhead simulator toggle, continuity health indicator,
 * and Mermaid/JSON export actions in a wrap-safe, non-overlapping layout.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  GitBranch,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Play,
  Sparkles,
  Download,
  Share2,
  Grid,
  SlidersHorizontal,
  ChevronDown,
  Copy,
  Check,
  ArrowRightLeft,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import { AudioService } from '../../../../../services/audioService';

export const GraphToolbar = ({
  flatNodes = [],
  allLinks = [],
  continuityHealth = null,
  searchQuery = '',
  onSearchChange,
  selectedTypeFilter = 'ALL',
  onTypeFilterChange,
  selectedMapFilter = 'ALL',
  onMapFilterChange,
  allMaps = [],
  density = 'detailed',
  onToggleDensity,
  snapToGridEnabled = false,
  onToggleSnapToGrid,
  onAutoLayout,
  transform = { x: 0, y: 0, zoom: 1 },
  onZoomIn,
  onZoomOut,
  onFitToView,
  isPlaySimulatorActive = false,
  onTogglePlaySimulator,
  onAddNode,
  onOpenAime,
  onOpenInspector,
  isInspectorOpen = false,
  onExportMermaid,
  onExportJson,
  embedded = false
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [copiedMermaid, setCopiedMermaid] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    if (!isExportMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isExportMenuOpen]);

  const handleCopyMermaid = () => {
    if (onExportMermaid) {
      onExportMermaid();
      setCopiedMermaid(true);
      AudioService.playCriticalChime(true);
      setTimeout(() => setCopiedMermaid(false), 2500);
    }
  };

  const orphanTotal = continuityHealth?.orphanCount ?? continuityHealth?.orphanNodes?.length ?? 0;
  const deadEndTotal = continuityHealth?.deadEndCount ?? continuityHealth?.deadEndNodes?.length ?? 0;
  const warningCount = orphanTotal + deadEndTotal;

  return (
    <div className="min-h-11 py-1.5 px-3 bg-[#090d16] border-b border-slate-800 flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1.5 shrink-0 z-20 font-mono text-xs select-none">
      {/* ── LEFT GROUP: TELEMETRY, SEARCH & FILTERS ── */}
      <div className="flex items-center flex-wrap gap-1.5">
        {!embedded ? (
          <div className="flex items-center gap-1.5 shrink-0 mr-1">
            <GitBranch size={14} className="text-purple-400 shrink-0" />
            <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px] whitespace-nowrap">
              Story Graph
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-purple-950/90 text-purple-300 border border-purple-700/50 text-[10px] font-bold whitespace-nowrap">
              {flatNodes.length}N • {allLinks.length}L
            </span>
          </div>
        ) : (
          <span
            className="px-2 py-0.5 h-7 inline-flex items-center rounded-lg bg-purple-950/70 text-purple-300 border border-purple-700/40 text-[10px] font-bold whitespace-nowrap shrink-0"
            title={`${flatNodes.length} Scenario Nodes • ${allLinks.length} Flow Links`}
          >
            {flatNodes.length}N • {allLinks.length}L
          </span>
        )}

        {/* Real-Time Search Bar */}
        <div className="relative w-36 sm:w-44 shrink-0">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search scenes..."
            className="w-full h-7 pl-7 pr-2 bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-lg text-slate-200 placeholder-slate-500 text-[11px] font-mono outline-none transition-colors"
          />
        </div>

        {/* Node Type Filter */}
        <select
          value={selectedTypeFilter}
          onChange={(e) => onTypeFilterChange?.(e.target.value)}
          aria-label="Filter scenario node type"
          className="h-7 px-2 bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-lg text-slate-300 text-[11px] font-mono outline-none cursor-pointer shrink-0"
        >
          <option value="ALL">All Types</option>
          <option value="Act">Acts</option>
          <option value="Scene">Scenes</option>
          <option value="Encounter">Encounters</option>
          <option value="Choice">Choices</option>
          <option value="Climax">Climaxes</option>
          <option value="Resolution">Resolutions</option>
          <option value="Secret">Secrets</option>
        </select>

        {/* Map Sector Filter */}
        {allMaps.length > 0 && (
          <select
            value={selectedMapFilter}
            onChange={(e) => onMapFilterChange?.(e.target.value)}
            aria-label="Filter linked map sector"
            className="h-7 px-2 bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-lg text-slate-300 text-[11px] font-mono outline-none cursor-pointer max-w-[130px] truncate shrink-0"
          >
            <option value="ALL">All Sectors</option>
            {allMaps.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        )}

        {warningCount > 0 && (
          <span
            className="h-7 px-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold inline-flex items-center gap-1 shrink-0"
            title={`${orphanTotal} orphan scenes, ${deadEndTotal} unlinked terminal scenes`}
          >
            <AlertTriangle size={11} />
            <span>{warningCount}</span>
          </span>
        )}
      </div>

      {/* ── RIGHT GROUP: AUTHORING, LAYOUT & VIEWPORT CONTROLS ── */}
      <div className="flex items-center flex-wrap gap-1.5 ml-auto">
        {/* Add Scenario Node */}
        <button
          type="button"
          onClick={onAddNode}
          className="h-7 px-2.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
          title="Create root scenario node (+)"
        >
          <Plus size={12} className="shrink-0" />
          <span>Add Node</span>
        </button>

        {/* AIME Co-Pilot Generator */}
        <button
          type="button"
          onClick={onOpenAime}
          className="h-7 px-2.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
          title="Launch AIME Narrative Co-Pilot & Branch Generator"
        >
          <Sparkles size={12} className="shrink-0" />
          <span>AIME</span>
        </button>

        {/* Playhead Simulator Mode Toggle */}
        <button
          type="button"
          onClick={onTogglePlaySimulator}
          className={`h-7 px-2.5 rounded-lg border font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shrink-0 whitespace-nowrap ${
            isPlaySimulatorActive
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'bg-slate-900 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border-slate-700/80 hover:border-emerald-500/50'
          }`}
          title="Toggle Story Walkthrough / Decision Simulator"
        >
          <Play size={11} className="shrink-0" />
          <span>{isPlaySimulatorActive ? 'Simulating' : 'Play Walk'}</span>
        </button>

        <div className="w-px h-4 bg-slate-800 mx-0.5 hidden sm:block shrink-0" />

        {/* Auto Layout Selector */}
        <div className="flex items-center h-7 bg-slate-950/90 border border-slate-700/80 rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onAutoLayout?.('horizontal')}
            className="h-full px-2 rounded-md text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
            title="Auto-organize Horizontal Flow (Left-to-Right)"
          >
            <ArrowRightLeft size={11} className="text-cyan-400 shrink-0" />
            <span className="hidden lg:inline">Horiz</span>
          </button>
          <button
            type="button"
            onClick={() => onAutoLayout?.('vertical')}
            className="h-full px-2 rounded-md text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
            title="Auto-organize Vertical Timeline (Top-to-Bottom)"
          >
            <ArrowUpDown size={11} className="text-purple-400 shrink-0" />
            <span className="hidden lg:inline">Vert</span>
          </button>
        </div>

        {/* Snap-to-Grid & Compact Density */}
        <button
          type="button"
          onClick={onToggleSnapToGrid}
          className={`h-7 w-7 rounded-lg border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
            snapToGridEnabled
              ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-950/90 border-slate-700/80 text-slate-400 hover:text-slate-200'
          }`}
          title={snapToGridEnabled ? 'Snap-to-Grid: ON (20px)' : 'Snap-to-Grid: OFF'}
        >
          <Grid size={12} />
        </button>

        {onToggleDensity && (
          <button
            type="button"
            onClick={onToggleDensity}
            className={`h-7 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors shrink-0 whitespace-nowrap hidden xl:inline-flex items-center ${
              density === 'compact'
                ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-950/90 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Detailed vs Compact Node Cards"
          >
            {density === 'compact' ? 'Compact' : 'Detailed'}
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center h-7 bg-slate-950/90 border border-slate-700/80 rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            onClick={onZoomOut}
            className="h-full px-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <span className="text-[10px] text-slate-300 font-bold font-mono px-1 min-w-9 text-center">
            {Math.round((transform?.zoom || 1) * 100)}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            className="h-full px-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={onFitToView}
            className="h-full px-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 border-l border-slate-800 ml-0.5 cursor-pointer flex items-center justify-center"
            title="Fit All to View"
          >
            <Maximize2 size={11} />
          </button>
        </div>

        {/* Export Dropdown */}
        <div className="relative shrink-0" ref={exportMenuRef}>
          <button
            type="button"
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            className="h-7 px-2 rounded-lg bg-slate-950/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white cursor-pointer flex items-center gap-1"
            title="Export Graph Diagram & Schema"
          >
            <Share2 size={12} />
            <ChevronDown size={10} />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-[#090e1a] border border-slate-700 rounded-xl shadow-2xl p-1 z-50 text-[11px] font-mono space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  handleCopyMermaid();
                  setIsExportMenuOpen(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between cursor-pointer"
              >
                <span>{copiedMermaid ? 'Copied Mermaid!' : 'Copy Mermaid (MD)'}</span>
                {copiedMermaid ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onExportJson) onExportJson();
                  setIsExportMenuOpen(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between cursor-pointer"
              >
                <span>Export JSON Schema</span>
                <Download size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Inspector Toggle Button */}
        <button
          type="button"
          onClick={onOpenInspector}
          className={`h-7 px-2.5 rounded-lg border cursor-pointer font-bold text-[10px] flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap ${
            isInspectorOpen
              ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-950/90 border-slate-700/80 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Properties Inspector (])"
        >
          <SlidersHorizontal size={12} />
          <span>Dock</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(GraphToolbar);
