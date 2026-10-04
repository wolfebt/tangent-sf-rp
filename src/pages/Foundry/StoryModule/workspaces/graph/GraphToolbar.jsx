/**
 * @file GraphToolbar.jsx
 * @description Glass-cockpit top toolbar for the ADE Story Graph.
 * Houses graph search, type/map filters, auto-layout algorithms, snap-to-grid,
 * display density toggles, interactive playhead simulator toggle, continuity health,
 * and Mermaid/JSON export actions.
 */

import React, { useState } from 'react';
import { 
  GitBranch, 
  Plus, 
  Sliders, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Search, 
  Filter, 
  Map as MapIcon, 
  Layers, 
  Play, 
  Sparkles, 
  Download, 
  Share2, 
  ShieldAlert, 
  Grid, 
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Copy,
  Check
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
  showHierarchy = true,
  onToggleHierarchy,
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
  onExportJson
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  const handleCopyMermaid = () => {
    if (onExportMermaid) {
      onExportMermaid();
      setCopiedMermaid(true);
      AudioService.playCriticalChime(true);
      setTimeout(() => setCopiedMermaid(false), 2500);
    }
  };

  return (
    <div className="h-11 bg-[#090d16] border-b border-slate-800 flex items-center justify-between px-3 shrink-0 gap-2 z-20 font-mono text-xs select-none">
      
      {/* ── LEFT CLUSTER: TITLE, SEARCH & FILTERS ── */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Title & Telemetry Pill */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <GitBranch size={15} className="text-purple-400" />
          <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
            Story Graph
          </span>
          <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/60 text-[9.5px]">
            {flatNodes.length}N • {allLinks.length}L
          </span>
        </div>

        {/* Real-Time Search Bar */}
        <div className="relative max-w-xs w-36 sm:w-48 lg:w-56 shrink-0">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search scenes..."
            className="w-full pl-7 pr-2 py-1 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-200 text-xs font-mono outline-none"
          />
        </div>

        {/* Node Type Filter */}
        <div className="hidden sm:flex items-center gap-1">
          <select
            value={selectedTypeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="px-2 py-1 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-300 text-[11px] font-mono outline-none cursor-pointer"
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
        </div>

        {/* Map Sector Filter */}
        {allMaps.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            <select
              value={selectedMapFilter}
              onChange={(e) => onMapFilterChange(e.target.value)}
              className="px-2 py-1 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-300 text-[11px] font-mono outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="ALL">All Sectors</option>
              {allMaps.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── CENTER CLUSTER: ACTIONS & PLAYHEAD ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Add Scenario Node */}
        <button
          type="button"
          onClick={onAddNode}
          className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          title="Create root scenario node (+)"
        >
          <Plus size={12} />
          <span className="hidden sm:inline">Add Node</span>
        </button>

        {/* AIME Co-Pilot Generator */}
        <button
          type="button"
          onClick={onOpenAime}
          className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          title="Launch AIME Narrative Co-Pilot & Branch Generator"
        >
          <Sparkles size={12} />
          <span className="hidden md:inline">AIME</span>
        </button>

        {/* Playhead Simulator Mode Toggle */}
        <button
          type="button"
          onClick={onTogglePlaySimulator}
          className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
            isPlaySimulatorActive
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse'
              : 'bg-slate-900 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border-slate-750'
          }`}
          title="Toggle Story Walkthrough / Decision Simulator"
        >
          <Play size={11} />
          <span className="hidden sm:inline">{isPlaySimulatorActive ? 'Simulating' : 'Play Walk'}</span>
        </button>

        {/* Auto Layout Selector */}
        <div className="hidden xl:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onAutoLayout('horizontal')}
            className="px-2 py-0.5 rounded text-[10px] text-slate-300 hover:text-white cursor-pointer"
            title="Auto-organize Horizontal Flow (Left-to-Right)"
          >
            Horizontal
          </button>
          <button
            type="button"
            onClick={() => onAutoLayout('vertical')}
            className="px-2 py-0.5 rounded text-[10px] text-slate-300 hover:text-white cursor-pointer"
            title="Auto-organize Vertical Timeline (Top-to-Bottom)"
          >
            Vertical
          </button>
        </div>

        {/* Snap-to-Grid Toggle */}
        <button
          type="button"
          onClick={onToggleSnapToGrid}
          className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
            snapToGridEnabled
              ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-900 border-slate-750 text-slate-400 hover:text-slate-200'
          }`}
          title={snapToGridEnabled ? 'Snap-to-Grid: ON (20px)' : 'Snap-to-Grid: OFF'}
        >
          <Grid size={12} />
        </button>
      </div>

      {/* ── RIGHT CLUSTER: VIEWPORT & EXPORT TOOLS ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={onZoomIn}
            className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            type="button"
            onClick={onFitToView}
            className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Fit All to View"
          >
            <Maximize2 size={12} />
          </button>
          <span className="text-[10px] text-slate-400 font-mono px-1.5">
            {Math.round(transform.zoom * 100)}%
          </span>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExportMenuOpen(prev => !prev)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white cursor-pointer flex items-center gap-1"
            title="Export Graph Diagram & Schema"
          >
            <Share2 size={12} />
            <ChevronDown size={10} />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 top-9 w-48 bg-[#090e1a] border border-slate-800 rounded-xl shadow-2xl p-1 z-50 text-[11px] font-mono space-y-0.5 animate-in fade-in duration-100">
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
          className={`p-1.5 px-2 rounded-lg border cursor-pointer font-bold text-[10px] flex items-center gap-1 transition-colors ${
            isInspectorOpen
              ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-900 border-slate-750 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Properties Inspector (])"
        >
          <SlidersHorizontal size={12} />
          <span className="hidden xl:inline">Dock</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(GraphToolbar);
