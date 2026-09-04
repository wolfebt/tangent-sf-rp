import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCampaign } from '../../../../context/CampaignContext';
import { useAuth } from '../../../../context/AuthContext';
import { extractCreatorInfo } from '../../../../utils/creatorUtils';
import { ArtistHubModal } from '../../../../components/StoryFoundry/ArtistHubModal';
import { 
  Tv, Palette, Copy, Check, ExternalLink, X, Compass, Shield,
  Globe, FolderOpen, Save, Download, Camera, Sparkles, Upload,
  Layers, ChevronDown, FilePlus, Trash2, Grid, Sun, Radio, Play, Hammer
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

const MapToolbar = ({
  setIsModalOpen,
  undoStack = [],
  redoStack = [],
  handleUndo,
  handleRedo,
  gridMode,
  setGridMode,
  terrainRenderMode = 'organic',
  setTerrainRenderMode,
  showToolsPanel,
  setShowToolsPanel,
  showSettingsPanel,
  setShowSettingsPanel,
  showLayersPanel,
  setShowLayersPanel,
  showHeroDrawer,
  setShowHeroDrawer,
  showOmnicortexDrawer,
  setShowOmnicortexDrawer,
  showCombatTracker,
  setShowCombatTracker,
  showMetadataPanel,
  setShowMetadataPanel,
  showKeyPanel,
  setShowKeyPanel,
  selectedId,
  eraseElement,
  onClearMap,
  onResetView,
  onExportPNG,
  onOpenLandmassGenerator,
  onOpenAssetManager,
  onOpenUvttImport,
  onSaveMapToFile,
  onLoadMapFromFile,
  onDeleteActiveMap,
  onOpenGuide,
  onOpenShortcuts,
  onAddNewMapTab,
  onDeleteMapTab,
  isVttDrawerOpen,
  onToggleVttDrawer,
  onOpenHazmatModal,
  onOpenUnderlayModal
}) => {
  const { universeState, activeMapId, setActiveMapId, updateMap } = useCampaign();

  // Dropdown states & refs
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isMapMenuOpen, setIsMapMenuOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [isArtistHubOpen, setIsArtistHubOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileMenuRef = useRef(null);
  const mapMenuRef = useRef(null);
  const gridMenuRef = useRef(null);
  const viewMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setIsFileMenuOpen(false);
      }
      if (mapMenuRef.current && !mapMenuRef.current.contains(e.target)) {
        setIsMapMenuOpen(false);
      }
      if (gridMenuRef.current && !gridMenuRef.current.contains(e.target)) {
        setIsGridMenuOpen(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) {
        setIsViewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMap = universeState.maps.find(m => m.id === activeMapId);

  return (
    <div className="relative z-30 bg-slate-950/95 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between gap-2 select-none shadow-xl backdrop-blur-xl flex-wrap font-mono">
      
      {/* ── ZONE A: MAP & PROJECT HUB (Left) ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Brand Indicator */}
        <div className="flex items-center gap-1.5 mr-1 font-mono shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-cyan-400 font-bold text-xs tracking-widest uppercase hidden lg:inline">
            MAP MAKER
          </span>
        </div>

        {/* Sector Switcher Pill */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 shadow-sm">
          <Globe size={13} className="text-cyan-400 shrink-0" />
          <select
            value={activeMapId}
            onChange={(e) => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveMapId(e.target.value);
            }}
            className="bg-transparent text-xs font-mono text-slate-100 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate"
            title="Switch Active Sector Map"
          >
            {(universeState.maps || []).map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                {m.title || m.name || 'Untitled Sector'}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              setIsModalOpen(true);
            }}
            className="p-1 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer"
            title="Create New Tactical Map"
          >
            <FilePlus size={13} />
          </button>

          {onDeleteActiveMap && (
            <button
              onClick={() => {
                AudioService.playTerminalBeep(800, 0.03);
                onDeleteActiveMap();
              }}
              className="p-1 hover:bg-red-950/60 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
              title="Delete Active Map"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Categorized Project & Tools Menu */}
        <div className="relative" ref={fileMenuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFileMenuOpen(prev => !prev);
              setIsGridMenuOpen(false);
              setIsViewMenuOpen(false);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FolderOpen size={12} className="text-cyan-400" />
            <span>PROJECT</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isFileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFileMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-slate-900/98 border border-cyan-500/40 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-2xl text-xs font-mono divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Group 1: File Storage & Export */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-cyan-400/70 tracking-wider">
                  File I/O & Export
                </div>
                {onSaveMapToFile && (
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      onSaveMapToFile();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Save size={13} className="text-cyan-400" />
                    <span>Save Map File (.json)</span>
                  </button>
                )}
                {onLoadMapFromFile && (
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      onLoadMapFromFile();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download size={13} className="text-cyan-400" />
                    <span>Load Map File (.json)</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsFileMenuOpen(false);
                    onExportPNG();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Camera size={13} className="text-amber-400" />
                  <span>Export Image (PNG)</span>
                </button>
              </div>

              {/* Group 2: Generators & Importers */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-emerald-400/70 tracking-wider">
                  Generators & Importers
                </div>
                {onOpenLandmassGenerator && (
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      onOpenLandmassGenerator();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} className="text-emerald-400" />
                    <span>Procedural Landmass Gen</span>
                  </button>
                )}
                {onOpenUvttImport && (
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      onOpenUvttImport();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload size={13} className="text-cyan-400" />
                    <span>Import Universal VTT (.uvtt)</span>
                  </button>
                )}
              </div>

              {/* Group 3: Catalogs & Reset */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-amber-400/70 tracking-wider">
                  Catalogs & Manual
                </div>
                {onOpenAssetManager && (
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      onOpenAssetManager();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FolderOpen size={13} className="text-amber-400" />
                    <span>Asset & Texture Catalog</span>
                  </button>
                )}
                {onOpenGuide && (
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      onOpenGuide();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Compass size={13} className="text-cyan-400" />
                    <span>Map Maker User Guide</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(800, 0.04);
                    setIsFileMenuOpen(false);
                    onClearMap();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-950/60 text-red-400 hover:text-red-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear Map Canvas</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={handleUndo}
            disabled={!undoStack || undoStack.length === 0}
            className={`px-2 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
              undoStack && undoStack.length > 0
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 shadow-sm'
                : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            ↩ Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={!redoStack || redoStack.length === 0}
            className={`px-2 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
              redoStack && redoStack.length > 0
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 shadow-sm'
                : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            ↪ Redo
          </button>
        </div>
      </div>

      {/* ── ZONE B: MODE & DEPLOY TO VTT (Center) ── */}
      <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-0.5 shadow-inner gap-1">
        <div className="px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
          <Hammer size={12} className="text-amber-400" />
          <span>2D Cartography Studio</span>
        </div>

        {/* Prominent Direct Deploy to The Stage VTT Button */}
        <a
          href={`/stage?mapId=${activeMapId || currentMap?.id || ''}`}
          onClick={() => AudioService.playTerminalBeep(1400, 0.05)}
          className="px-3.5 py-1 bg-gradient-to-r from-purple-900 via-cyan-900 to-slate-900 hover:from-purple-800 hover:to-cyan-800 border border-cyan-400 text-cyan-200 hover:text-white rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
          title="Launch this Map into The Stage (Next-Gen WebGPU VTT Simulation Engine)"
        >
          <Play size={12} fill="currentColor" className="text-amber-400" />
          <span>Deploy to The Stage</span>
          <ExternalLink size={11} className="text-cyan-300 ml-0.5" />
        </a>
      </div>

      {/* ── ZONE C: CONTROLS, QUICK DRAWERS & TOOLS (Right) ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Grid Geometry Dropdown */}
        <div className="relative" ref={gridMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsGridMenuOpen(prev => !prev);
              setIsFileMenuOpen(false);
              setIsViewMenuOpen(false);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Grid size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">GRID</span>
            <span className="text-[10px] text-cyan-400/80 uppercase">({gridMode})</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isGridMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isGridMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-slate-900/98 border border-cyan-500/40 rounded-xl shadow-2xl py-1 z-50 backdrop-blur-xl text-xs">
              {[
                { id: 'hex', label: 'Hexagonal' },
                { id: 'square', label: 'Square Grid' },
                { id: 'none', label: 'No Grid (Free)' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setGridMode(mode.id);
                    setIsGridMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between transition-colors uppercase tracking-wider ${
                    gridMode === mode.id
                      ? 'bg-cyan-950 text-[#22d3ee]'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{mode.label}</span>
                  {gridMode === mode.id && <span className="text-cyan-400 font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View / Panels Dropdown */}
        <div className="relative" ref={viewMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsViewMenuOpen(prev => !prev);
              setIsFileMenuOpen(false);
              setIsGridMenuOpen(false);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Layers size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">PANELS</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isViewMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-slate-900/98 border border-cyan-500/40 rounded-xl shadow-2xl py-1 z-50 backdrop-blur-xl text-xs">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
                Toggle Workspace Overlays
              </div>
              {[
                { id: 'tools', label: 'Design Palette', active: showToolsPanel, toggle: () => setShowToolsPanel(prev => !prev), icon: '🛠️' },
                { id: 'settings', label: 'Tool Options', active: showSettingsPanel, toggle: () => setShowSettingsPanel(prev => !prev), icon: '⚙️' },
                { id: 'layers', label: 'Compositor Layers', active: showLayersPanel, toggle: () => setShowLayersPanel(prev => !prev), icon: '🥞' },
                { id: 'combat', label: 'Combat Tracker', active: showCombatTracker, toggle: () => setShowCombatTracker?.(prev => !prev), icon: '⚔️' },
                { id: 'key', label: 'Map Key & Index', active: showKeyPanel, toggle: () => setShowKeyPanel?.(prev => !prev), icon: '🗺️' },
                { id: 'metadata', label: 'Scale Properties', active: showMetadataPanel, toggle: () => setShowMetadataPanel?.(prev => !prev), icon: '🌐' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.toggle();
                  }}
                  className={`w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between transition-colors uppercase tracking-wider ${
                    item.active
                      ? 'bg-cyan-950/80 text-[#22d3ee]'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 pointer-events-none">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className={`text-xs pointer-events-none ${item.active ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                    {item.active ? '✓' : '✗'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Omnicortex Compendium Trigger */}
        <button
          type="button"
          onClick={() => setShowOmnicortexDrawer?.(prev => !prev)}
          className={`px-2.5 py-1 border rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 h-8 cursor-pointer ${
            showOmnicortexDrawer
              ? 'bg-cyan-600 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-cyan-300'
          }`}
          title="Open Omnicortex Codex (Bestiary, Equipment, Hazards, Vehicles)"
        >
          <span>🧠</span>
          <span className="hidden md:inline">Omnicortex</span>
        </button>

        {/* Folio Hero Spawner Trigger */}
        <button
          type="button"
          onClick={() => setShowHeroDrawer?.(prev => !prev)}
          className={`px-2.5 py-1 border rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 h-8 cursor-pointer ${
            showHeroDrawer
              ? 'bg-amber-600 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-amber-300'
          }`}
          title="Open Folio Hero & Squad Spawner Drawer"
        >
          <span>📜</span>
          <span className="hidden md:inline">Folio Heroes</span>
        </button>

        {/* Unified VTT Tactical Console Drawer Button */}
        <button
          type="button"
          onClick={onToggleVttDrawer}
          className={`px-2.5 py-1 border rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 h-8 cursor-pointer ${
            isVttDrawerOpen
              ? 'bg-emerald-600 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-emerald-300'
          }`}
          title="Open Unified Tactical VTT Command Drawer (Grid, Teams, Hazards, Pings)"
        >
          <span>🎮</span>
          <span className="hidden md:inline">VTT Console</span>
        </button>

        {/* Live Spectator / Cast Button */}
        <button
          type="button"
          onClick={() => setIsCastModalOpen(true)}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 rounded-xl transition-all cursor-pointer"
          title="Live Player Spectator Screen (TV / Dual Monitor Casting)"
        >
          <Tv size={14} />
        </button>

        {/* Artist Hub Button */}
        <button
          type="button"
          onClick={() => setIsArtistHubOpen(true)}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-purple-400 rounded-xl transition-all cursor-pointer"
          title="Artist Hub Visual Prompt Synthesis"
        >
          <Palette size={14} />
        </button>

        {/* Reset Camera */}
        <button
          type="button"
          onClick={onResetView}
          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          title="Reset Camera View to Origin"
        >
          🎯
        </button>

        {selectedId && (
          <button 
            className="px-2.5 py-1 bg-red-900 hover:bg-red-800 border border-red-600 text-white text-xs font-bold uppercase rounded-xl tracking-wider transition-colors cursor-pointer" 
            onClick={() => eraseElement(selectedId)}
          >
            Delete
          </button>
        )}
      </div>

      {/* MAP Menu Dropdown */}
      <div className="relative" ref={mapMenuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMapMenuOpen(prev => !prev);
            setIsFileMenuOpen(false);
            setIsGridMenuOpen(false);
            setIsViewMenuOpen(false);
          }}
          className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-[#22d3ee] border border-[#22d3ee]/60 rounded text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 h-8 shadow-[0_0_8px_rgba(34,211,238,0.3)]"
        >
          <span className="pointer-events-none">🗺️ MAP</span>
          <span className="text-[10px] text-cyan-300 font-mono pointer-events-none">({currentMap?.type || 'Sector'})</span>
          <span className="text-[9px] pointer-events-none">▼</span>
        </button>
        {isMapMenuOpen && (
          <div className="absolute left-0 mt-1.5 w-56 bg-[#161b22] border border-[#0D5C63] rounded-lg shadow-2xl py-1 z-50 backdrop-blur-xl">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-[#0D5C63]/40 tracking-wider">
              Map Actions
            </div>
            <button
              onClick={() => { setIsModalOpen(true); setIsMapMenuOpen(false); }}
              className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-slate-800 hover:text-[#22d3ee] font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
            >
              <span>➕</span> New Map...
            </button>

            {onOpenAssetManager && (
              <button
                onClick={() => { onOpenAssetManager(); setIsMapMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-xs text-left text-[#22d3ee] hover:bg-cyan-950 font-bold flex items-center gap-2 transition-colors uppercase tracking-wider border-t border-[#0D5C63]/30"
              >
                <span>📦</span> Asset Manager...
              </button>
            )}

            {onOpenLandmassGenerator && (
              <button
                onClick={() => { onOpenLandmassGenerator(); setIsMapMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-xs text-left text-cyan-300 hover:bg-cyan-950 font-bold flex items-center gap-2 transition-colors uppercase tracking-wider border-t border-b border-[#0D5C63]/30"
              >
                <span>🌍</span> World Generator...
              </button>
            )}

            {universeState.maps.length > 1 && (
              <>
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-t border-b border-[#0D5C63]/40 mt-1 tracking-wider">
                  Switch Map
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {universeState.maps.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setActiveMapId(m.id); setIsMapMenuOpen(false); }}
                      className={`w-full px-3 py-1 text-xs text-left flex items-center justify-between transition-colors ${
                        m.id === activeMapId ? 'bg-cyan-950 text-[#22d3ee] font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{m.title}</span>
                      <span className="text-[9px] text-slate-500 font-mono ml-2">[{m.type}]</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-[#0D5C63]/40 mt-1 pt-1">
              <button
                onClick={() => { onExportPNG(); setIsMapMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-slate-800 hover:text-white font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
              >
                <span>📸</span> Export Image (PNG)
              </button>
              <button
                onClick={() => { onResetView(); setIsMapMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-slate-800 hover:text-white font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
              >
                <span>🎯</span> Reset Camera
              </button>
              {onDeleteActiveMap && (
                <button
                  onClick={() => { onDeleteActiveMap(); setIsMapMenuOpen(false); }}
                  className="w-full px-3 py-1.5 text-xs text-left text-red-400 hover:bg-red-950 font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
                >
                  <span>🗑️</span> Delete Active Map
                </button>
              )}
              <button
                onClick={() => { onClearMap(); setIsMapMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-xs text-left text-slate-400 hover:bg-slate-800 hover:text-white font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
              >
                <span>🧹</span> Clear Canvas
              </button>
            </div>
          </div>
        )}
      </div>



      {/* GRID Menu Dropdown */}
      <div className="relative" ref={gridMenuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsGridMenuOpen(prev => !prev);
            setIsMapMenuOpen(false);
            setIsViewMenuOpen(false);
          }}
          className="px-3 py-1 bg-[#161b22] hover:bg-slate-800 text-slate-200 border border-[#0D5C63]/60 hover:border-[#22d3ee] rounded text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 h-8"
        >
          <span className="pointer-events-none">🌐 GRID</span>
          <span className="text-[10px] text-cyan-400 pointer-events-none">({gridMode})</span>
          <span className="text-[9px] pointer-events-none">▼</span>
        </button>
        {isGridMenuOpen && (
          <div className="absolute left-0 mt-1.5 w-36 bg-[#161b22] border border-[#0D5C63] rounded-lg shadow-2xl py-1 z-50 backdrop-blur-xl">
            {[
              { id: 'hex', label: 'Hex' },
              { id: 'square', label: 'Square' },
              { id: 'none', label: 'None' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setGridMode(mode.id);
                  setIsGridMenuOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between transition-colors uppercase tracking-wider ${
                  gridMode === mode.id
                    ? 'bg-cyan-950 text-[#22d3ee]'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="pointer-events-none">{mode.label}</span>
                {gridMode === mode.id && <span className="text-cyan-400 font-bold pointer-events-none">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW Menu Dropdown */}
      <div className="relative" ref={viewMenuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsViewMenuOpen(prev => !prev);
            setIsMapMenuOpen(false);
            setIsGridMenuOpen(false);
          }}
          className="px-3 py-1 bg-[#161b22] hover:bg-slate-800 text-slate-200 border border-[#0D5C63]/60 hover:border-[#22d3ee] rounded text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 h-8"
        >
          <span className="pointer-events-none">👁️ VIEW</span>
          <span className="text-[9px] pointer-events-none">▼</span>
        </button>
        {isViewMenuOpen && (
          <div className="absolute left-0 mt-1.5 w-52 bg-[#161b22] border border-[#0D5C63] rounded-lg shadow-2xl py-1 z-50 backdrop-blur-xl">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-[#0D5C63]/40 tracking-wider">
              Toggle Panels
            </div>
            {[
              { id: 'tools', label: 'Tools', active: showToolsPanel, toggle: () => setShowToolsPanel(prev => !prev), icon: '🛠️' },
              { id: 'settings', label: 'Settings', active: showSettingsPanel, toggle: () => setShowSettingsPanel(prev => !prev), icon: '⚙️' },
              { id: 'heroes', label: 'Folio Hero Roster', active: showHeroDrawer, toggle: () => setShowHeroDrawer?.(prev => !prev), icon: '📜' },
              { id: 'omnicortex', label: 'Omnicortex Codex', active: showOmnicortexDrawer, toggle: () => setShowOmnicortexDrawer?.(prev => !prev), icon: '🧠' },
              { id: 'layers', label: 'Layers', active: showLayersPanel, toggle: () => setShowLayersPanel(prev => !prev), icon: '🥞' },
              { id: 'key', label: 'Map Key & Directory', active: showKeyPanel, toggle: () => setShowKeyPanel?.(prev => !prev), icon: '🗺️' },
              { id: 'metadata', label: 'Scale Properties', active: showMetadataPanel, toggle: () => setShowMetadataPanel?.(prev => !prev), icon: '🌐' },
              { id: 'combat', label: 'Combat Tracker', active: showCombatTracker, toggle: () => setShowCombatTracker?.(prev => !prev), icon: '⚔️' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  item.toggle();
                }}
                className={`w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between transition-colors uppercase tracking-wider ${
                  item.active
                    ? 'bg-cyan-950/80 text-[#22d3ee]'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2 pointer-events-none">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <span className={`text-xs pointer-events-none ${item.active ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                  {item.active ? '✓' : '✗'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-slate-700 mx-1"></div>

      {/* Multi-Map Campaign Tabs Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 shrink-0">
        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mr-0.5 shrink-0 flex items-center gap-1">
          <span>🗺️</span>
          <span className="hidden sm:inline">Campaign Maps:</span>
        </span>
        {(universeState.maps || []).map(m => {
          const isActive = m.id === activeMapId;
          return (
            <div
              key={m.id}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase transition-all shrink-0 border h-8 ${
                isActive
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveMapId(m.id)}
                className="truncate max-w-[120px] text-left cursor-pointer"
                title={m.title || 'Untitled Map'}
              >
                {m.title || 'Untitled Map'}
              </button>
              {universeState.maps.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteMapTab) {
                      onDeleteMapTab(m.id, m.title);
                    }
                  }}
                  className="text-slate-500 hover:text-red-400 font-bold ml-1 cursor-pointer"
                  title="Delete map element"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
        {onAddNewMapTab && (
          <button
            type="button"
            onClick={onAddNewMapTab}
            className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/60 border border-amber-500/50 text-amber-300 rounded text-xs font-bold uppercase shrink-0 transition-colors h-8 flex items-center cursor-pointer shadow-sm"
            title="Add new map element to campaign"
          >
            + New Map Tab
          </button>
        )}
      </div>

      {/* Map Creator & Contributor Badge */}
      {currentMap && (() => {
        const creatorInfo = extractCreatorInfo(currentMap);
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-1 bg-[#0d1117]/90 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono font-bold flex items-center gap-1 shadow-sm" title="Original Creator">
              <span>🏷️</span>
              <span>{creatorInfo.creatorTag}</span>
            </span>
            {creatorInfo.contributorTags && creatorInfo.contributorTags.length > 0 && (
              <span className="px-2 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded text-[11px] font-mono font-bold" title={`Contributors: ${creatorInfo.contributorTags.join(', ')}`}>
                Contrib: {creatorInfo.contributorTags.join(', ')}
              </span>
            )}
          </div>
        );
      })()}

      {/* Live Spectator / Cast Button */}
      <button
        type="button"
        onClick={() => setIsCastModalOpen(true)}
        className="px-3 py-1 bg-gradient-to-r from-emerald-950 to-slate-900 hover:from-emerald-900 hover:to-slate-800 border border-emerald-500/60 text-emerald-300 rounded text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 h-8 shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer"
        title="Live Player Spectator Screen (TV / Dual Monitor Casting)"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Tv size={13} />
        <span className="hidden md:inline">Cast / Spectator</span>
      </button>

      {/* Deploy to The Stage Button */}
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1400, 0.05);
          window.location.href = `/stage?mapId=${activeMapId || currentMap?.id || ''}`;
        }}
        className="px-3.5 py-1 bg-gradient-to-r from-purple-950 via-cyan-950 to-slate-900 hover:from-purple-900 hover:to-cyan-900 border border-cyan-400 text-cyan-300 rounded text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 h-8 shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
        title="Deploy Active Map to The Stage (Next-Gen WebGPU Tactical Simulation Engine)"
      >
        <span className="text-amber-400 font-bold">⚔️</span>
        <span>THE STAGE</span>
        <ExternalLink size={12} className="text-cyan-400" />
      </button>

      {/* Omnicortex Asset Compendium Button */}
      <button
        type="button"
        onClick={() => setShowOmnicortexDrawer?.(prev => !prev)}
        className={`px-3 py-1 border rounded text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 h-8 cursor-pointer ${
          showOmnicortexDrawer
            ? 'bg-cyan-600 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            : 'bg-gradient-to-r from-blue-950 to-slate-900 hover:from-blue-900 hover:to-slate-800 border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
        }`}
        title="Open Omnicortex Compendium (Spawn Bestiary, Weapons, Armor, Hazards, Vehicles)"
      >
        <span>🧠</span>
        <span className="hidden md:inline">Omnicortex Codex</span>
      </button>

      {/* Artist Hub Button */}
      <button
        type="button"
        onClick={() => setIsArtistHubOpen(true)}
        className="px-3 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-300 rounded text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 h-8 shadow-[0_0_10px_rgba(168,85,247,0.2)] cursor-pointer"
        title="Artist Hub Visual Prompt Synthesis"
      >
        <Palette size={13} />
        <span className="hidden md:inline">Artist Hub</span>
      </button>

      {/* Unified VTT Tactical Console Drawer Button */}
      <button
        type="button"
        onClick={onToggleVttDrawer}
        className={`px-3 py-1 border rounded text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 h-8 cursor-pointer ${
          isVttDrawerOpen
            ? 'bg-cyan-600 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            : 'bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 hover:to-slate-800 border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
        }`}
        title="Open Unified Tactical VTT Command Drawer (Grid, Teams, Hazards, Pings)"
      >
        <span>🎮</span>
        <span className="hidden md:inline">VTT Console</span>
      </button>

      <div className="flex-1"></div>

      {/* Right Side: Hotkeys & Undo / Redo Buttons */}
      <div className="flex items-center gap-1.5">
        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-400 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 h-8 transition-colors cursor-pointer"
            title="View Canvas Keyboard Shortcuts Legend"
          >
            <span>⌨️</span>
            <span className="hidden sm:inline">Hotkeys</span>
          </button>
        )}

        <button
          disabled={undoStack.length === 0}
          onClick={handleUndo}
          title="Undo (Ctrl+Z)"
          className={`px-2.5 py-1 text-xs font-bold rounded border h-8 transition-colors ${
            undoStack.length > 0
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white cursor-pointer'
              : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          ↩ Undo
        </button>
        <button
          disabled={redoStack.length === 0}
          onClick={handleRedo}
          title="Redo (Ctrl+Y)"
          className={`px-2.5 py-1 text-xs font-bold rounded border h-8 transition-colors ${
            redoStack.length > 0
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white cursor-pointer'
              : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          ↪ Redo
        </button>
      </div>

      {selectedId && (
        <button className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white text-xs font-bold uppercase rounded tracking-wider h-8 ml-2" onClick={() => eraseElement(selectedId)}>Delete Selected</button>
      )}

      {/* Cast / Spectator Modal */}
      {isCastModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
          <div className="w-full max-w-lg bg-[#0d1117] border border-emerald-500/50 rounded-2xl p-6 shadow-[0_0_35px_rgba(16,185,129,0.25)] flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-300">
                  <Tv size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-sm font-mono uppercase tracking-wider text-emerald-300">
                    Live Player Spectator Stream
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Dual-screen tabletop view for TV screens, projectors, and remote players.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCastModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Player View URL:
                </span>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-xs text-emerald-300">
                  <span className="truncate flex-1">
                    {window.location.origin}/foundry/view/{activeMapId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/foundry/view/${activeMapId}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-xs font-bold rounded flex items-center gap-1 transition-all"
                  >
                    {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="font-bold text-slate-200 flex items-center gap-1.5 text-emerald-400 mb-1">
                  <Shield size={14} /> Built-in GM Confidentiality:
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  • Hidden ambush tokens and DM notes are stripped from this screen.<br/>
                  • Unrevealed fog of war remains pitch black for players.<br/>
                  • Moves made in GM mode sync to this display in real time.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCastModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-xl transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(`/foundry/view/${activeMapId}`, '_blank', 'width=1280,height=800');
                  setIsCastModalOpen(false);
                }}
                className="flex-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <ExternalLink size={15} />
                <span>Open Player Screen in New Window</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Artist Hub Modal */}
      {isArtistHubOpen && (
        <ArtistHubModal
          isOpen={isArtistHubOpen}
          onClose={() => setIsArtistHubOpen(false)}
          initialPrompt={currentMap?.title ? `Tactical battlemap for ${currentMap.title}` : 'Tactical battlemap'}
        />
      )}
    </div>
  );
};

export default MapToolbar;

