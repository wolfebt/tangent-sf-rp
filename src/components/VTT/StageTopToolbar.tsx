/**
 * @file StageTopToolbar.tsx
 * @description Glass-Cockpit Tactical & Map Management Top Toolbar for The Stage.
 * Provides live map switching, new map creation, JSON save/load, high-res snapshot export,
 * UVTT import, Landmass generator, Undo/Redo stack triggers, and Mode switching.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Hammer, 
  Undo2, 
  Redo2, 
  Save, 
  FolderOpen, 
  FilePlus, 
  Trash2, 
  Camera, 
  Grid, 
  Layers, 
  Sun, 
  Radio, 
  Sparkles, 
  Download, 
  Upload, 
  ChevronDown,
  Globe,
  ImageIcon,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { GridScaleTier, GridType } from '../../engine/index.ts';
import { AudioService } from '../../services/audioService';

export interface StageTopToolbarProps {
  currentMap?: any;
  availableMaps: any[];
  activeMapId: string;
  onSelectMap: (mapId: string) => void;
  onAddNewMap: (title: string, mapType: string) => void;
  onDeleteCurrentMap: () => void;
  isDesignModeActive: boolean;
  onToggleDesignMode: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  lastActionDescription?: string;
  onSaveMapJson: () => void;
  onLoadMapJson: (file: File) => void;
  onExportPng: () => void;
  onOpenUvttModal: () => void;
  onOpenLandmassModal: () => void;
  onOpenAssetManager: () => void;
  onOpenLayersPanel: () => void;
  onOpenUnderlayModal?: () => void;
  isGridVisible: boolean;
  onToggleGridVisible: () => void;
  gridSnap: boolean;
  onToggleGridSnap: () => void;
  gridType: GridType;
  onChangeGridType: (type: GridType) => void;
  scaleTier: GridScaleTier;
  onChangeScaleTier: (tier: GridScaleTier) => void;
  isDynamicLightingEnabled: boolean;
  onToggleDynamicLighting: () => void;
  isMultiplayerSimActive: boolean;
  onToggleMultiplayerSim: () => void;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
}

export const StageTopToolbar: React.FC<StageTopToolbarProps> = ({
  availableMaps,
  activeMapId,
  onSelectMap,
  onAddNewMap,
  onDeleteCurrentMap,
  isDesignModeActive,
  onToggleDesignMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  lastActionDescription = 'Edit Sector',
  onSaveMapJson,
  onLoadMapJson,
  onExportPng,
  onOpenUvttModal,
  onOpenLandmassModal,
  onOpenAssetManager,
  onOpenLayersPanel,
  onOpenUnderlayModal,
  isGridVisible,
  onToggleGridVisible,
  gridSnap,
  onToggleGridSnap,
  gridType,
  onChangeGridType,
  scaleTier,
  onChangeScaleTier,
  isDynamicLightingEnabled,
  onToggleDynamicLighting,
  isMultiplayerSimActive,
  onToggleMultiplayerSim,
  isZenMode = false,
  onToggleZenMode
}) => {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [isNewMapModalOpen, setIsNewMapModalOpen] = useState(false);
  const [newMapTitle, setNewMapTitle] = useState('');
  const [newMapType, setNewMapType] = useState('Tactical');

  const projectMenuRef = useRef<HTMLDivElement | null>(null);
  const gridMenuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setIsProjectMenuOpen(false);
      }
      if (gridMenuRef.current && !gridMenuRef.current.contains(e.target as Node)) {
        setIsGridMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateMapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapTitle.trim()) return;
    AudioService.playTerminalBeep(1400, 0.04);
    onAddNewMap(newMapTitle.trim(), newMapType);
    setNewMapTitle('');
    setIsNewMapModalOpen(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadMapJson(file);
    }
    e.target.value = '';
  };

  return (
    <header className="relative z-40 bg-slate-950/95 backdrop-blur-md border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between gap-2 select-none shadow-xl flex-wrap">
      {/* ── ZONE A: MAP & PROJECT HUB (Left) ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Brand Indicator */}
        <div className="flex items-center gap-1.5 mr-1 font-mono shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-cyan-400 font-bold text-xs tracking-widest uppercase hidden lg:inline">
            STAGE VTT
          </span>
        </div>

        {/* Sector Switcher Pill */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 shadow-sm">
          <Globe size={13} className="text-cyan-400 shrink-0" />
          <select
            value={activeMapId}
            onChange={(e) => {
              AudioService.playTerminalBeep(1100, 0.02);
              onSelectMap(e.target.value);
            }}
            className="bg-transparent text-xs font-mono text-slate-100 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate"
            title="Switch Active Sector Map"
          >
            {availableMaps.map((m: any) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                {m.title || m.name || 'Untitled Sector'}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              setIsNewMapModalOpen(true);
            }}
            className="p-1 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer"
            title="Create New Tactical Map"
          >
            <FilePlus size={13} />
          </button>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(800, 0.03);
              onDeleteCurrentMap();
            }}
            className="p-1 hover:bg-red-950/60 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
            title="Delete Current Map"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Categorized Project & Tools Menu */}
        <div className="relative" ref={projectMenuRef}>
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setIsProjectMenuOpen(prev => !prev);
              setIsGridMenuOpen(false);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FolderOpen size={12} className="text-cyan-400" />
            <span>PROJECT</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isProjectMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProjectMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-slate-900/98 border border-cyan-500/40 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-2xl text-xs font-mono divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Group 1: File Storage & Export */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-cyan-400/70 tracking-wider">
                  File I/O & Export
                </div>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    onSaveMapJson();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save size={13} className="text-cyan-400" />
                  <span>Save Map File (.json)</span>
                </button>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download size={13} className="text-cyan-400" />
                  <span>Load Map File (.json)</span>
                </button>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    onExportPng();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Camera size={13} className="text-amber-400" />
                  <span>Export Viewport Snapshot (PNG)</span>
                </button>
              </div>

              {/* Group 2: Procedural & Ingestion */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-emerald-400/70 tracking-wider">
                  Generators & Importers
                </div>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    onOpenLandmassModal();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-emerald-400" />
                  <span>Procedural Landmass Gen</span>
                </button>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    onOpenUvttModal();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload size={13} className="text-cyan-400" />
                  <span>Import Universal VTT (.uvtt)</span>
                </button>
              </div>

              {/* Group 3: Catalogs & Schematics */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-amber-400/70 tracking-wider">
                  Catalogs & Layers
                </div>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    onOpenAssetManager();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FolderOpen size={13} className="text-amber-400" />
                  <span>Asset & Texture Catalog</span>
                </button>

                {onOpenUnderlayModal && (
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsProjectMenuOpen(false);
                      onOpenUnderlayModal();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-sky-950/60 text-sky-300 hover:text-sky-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ImageIcon size={13} className="text-sky-400" />
                    <span>Blueprint Underlay Calibration</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    onOpenLayersPanel();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Layers size={13} className="text-cyan-400" />
                  <span>Compositor Layers Manager</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input for Map JSON Loading */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* History Stack (Undo / Redo) */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 cursor-pointer ${
              canUndo
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 shadow-sm'
                : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
            title={`Undo (Ctrl+Z)${canUndo ? ` • ${lastActionDescription}` : ''}`}
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 cursor-pointer ${
              canRedo
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 shadow-sm'
                : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
            title={`Redo (Ctrl+Y / Ctrl+Shift+Z)`}
          >
            <Redo2 size={13} />
          </button>
        </div>
      </div>

      {/* ── ZONE B: PRIMARY MODE SWITCHER (Center) ── */}
      <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-0.5 shadow-inner">
        <button
          onClick={() => {
            if (isDesignModeActive) onToggleDesignMode();
          }}
          className={`px-3.5 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            !isDesignModeActive
              ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Engage live tactical combat simulation, action economy, and LoS raycasting [M]"
        >
          <Play size={12} fill={!isDesignModeActive ? 'currentColor' : 'none'} />
          <span>Tactical Play</span>
        </button>

        <button
          onClick={() => {
            if (!isDesignModeActive) onToggleDesignMode();
          }}
          className={`px-3.5 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            isDesignModeActive
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Enter In-Situ Map Design Mode: terrain painting, wall drawing, token & object stamping [M]"
        >
          <Hammer size={12} />
          <span>Architect Design</span>
        </button>
        <span className="text-[9px] font-mono text-slate-500 px-1 hidden md:inline">
          [M]
        </span>
      </div>

      {/* ── ZONE C: VIEWPORT, GRID & ENVIRONMENT HUB (Right) ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Consolidated Grid & Scale Popover */}
        <div className="relative" ref={gridMenuRef}>
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setIsGridMenuOpen(prev => !prev);
              setIsProjectMenuOpen(false);
            }}
            className={`px-2.5 py-1 border rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isGridVisible || isGridMenuOpen
                ? 'bg-slate-900 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
            title="Configure Coordinate Grid & Scale Tier"
          >
            <Grid size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">GRID</span>
            <span className="text-[10px] text-cyan-400/80 uppercase">
              {gridType === GridType.Square ? 'SQ' : 'HEX'}
            </span>
            {gridSnap && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Snap Active" />
            )}
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isGridMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isGridMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-slate-900/98 border border-cyan-500/40 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-2xl text-xs font-mono space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex justify-between items-center">
                <span>Coordinate Grid & Scale</span>
                <span className="text-slate-400 text-[9px]">Shortcut: [G]</span>
              </div>

              {/* Grid Visibility & Snap Toggles */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    onToggleGridVisible();
                  }}
                  className={`p-1.5 rounded-xl border text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    isGridVisible
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Grid size={12} />
                  <span>{isGridVisible ? 'Grid Shown' : 'Grid Hidden'}</span>
                </button>

                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    onToggleGridSnap();
                  }}
                  className={`p-1.5 rounded-xl border text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    gridSnap
                      ? 'bg-amber-950 border-amber-600 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Check size={12} className={gridSnap ? 'opacity-100' : 'opacity-0'} />
                  <span>{gridSnap ? 'Snap ON' : 'Snap Free'}</span>
                </button>
              </div>

              {/* Grid Geometry (Square vs Hex) */}
              <div>
                <label className="text-[9.5px] uppercase font-bold text-slate-400 block mb-1">
                  Grid Geometry
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      onChangeGridType(GridType.Square);
                    }}
                    className={`py-1 rounded-lg border text-center transition-colors cursor-pointer text-[10.5px] ${
                      gridType === GridType.Square
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Square Grid
                  </button>
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      onChangeGridType(GridType.HexFlatTop);
                    }}
                    className={`py-1 rounded-lg border text-center transition-colors cursor-pointer text-[10.5px] ${
                      gridType === GridType.HexFlatTop
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Hexagonal
                  </button>
                </div>
              </div>

              {/* Scale Tier Switcher */}
              <div>
                <label className="text-[9.5px] uppercase font-bold text-slate-400 block mb-1">
                  Scale Tier (Unit Budget)
                </label>
                <select
                  value={scaleTier}
                  onChange={(e) => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    onChangeScaleTier(e.target.value as GridScaleTier);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value={GridScaleTier.Encounter}>Encounter (5ft / 1.5m)</option>
                  <option value={GridScaleTier.Overland}>Overland (50ft / 15m)</option>
                  <option value={GridScaleTier.Planetary}>Planetary (10km)</option>
                  <option value={GridScaleTier.Interplanetary}>Interplanetary (10k km)</option>
                  <option value={GridScaleTier.StarSystem}>Star System (1AU)</option>
                  <option value={GridScaleTier.Sector}>Sector (1LY)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Lighting Toggle */}
        <button
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            onToggleDynamicLighting();
          }}
          className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer shadow-sm ${
            isDynamicLightingEnabled
              ? 'bg-amber-950/70 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={isDynamicLightingEnabled ? 'Dynamic Radial Lighting & Shadows: ACTIVE' : 'Dynamic Lighting: DISABLED'}
        >
          <Sun size={14} />
        </button>

        {/* Multiplayer Telemetry Toggle */}
        <button
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            onToggleMultiplayerSim();
          }}
          className={`px-2 py-1 rounded-xl border text-xs font-mono transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
            isMultiplayerSimActive
              ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={isMultiplayerSimActive ? 'LiveKit Multiplayer Telemetry: SIMULATED PEERS CONNECTED' : 'Local Standalone Simulation Mode'}
        >
          <Radio size={12} className={isMultiplayerSimActive ? 'text-emerald-400' : 'text-slate-500'} />
          <span className="text-[10px] hidden md:inline">
            {isMultiplayerSimActive ? 'PEERS (3)' : 'LOCAL'}
          </span>
        </button>

        {/* Layers Panel Opener */}
        <button
          onClick={() => {
            AudioService.playTerminalBeep(1200, 0.03);
            onOpenLayersPanel();
          }}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-cyan-400 hover:text-cyan-300 text-xs transition-colors cursor-pointer shadow-sm"
          title="Stage Compositor Layers Manager"
        >
          <Layers size={14} />
        </button>

        {/* Zen Mode / Cinematic HUD Toggle */}
        {onToggleZenMode && (
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              onToggleZenMode();
            }}
            className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer shadow-sm ${
              isZenMode 
                ? 'bg-purple-950 border-purple-500 text-purple-300' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={isZenMode ? 'Exit Zen Mode (Show All HUDs)' : 'Enter Zen Mode (Hide Floating HUD Overlays)'}
          >
            {isZenMode ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>

      {/* ── New Map Creation Modal ── */}
      {isNewMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-5 max-w-md w-full shadow-2xl font-mono text-slate-200">
            <h3 className="text-base font-bold text-cyan-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <FilePlus size={18} /> Create New Tactical Sector Map
            </h3>

            <form onSubmit={handleCreateMapSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">
                  Sector Title / Map Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newMapTitle}
                  onChange={(e) => setNewMapTitle(e.target.value)}
                  placeholder="e.g. Orbital Station Delta"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">
                  Map Scale / Sector Type
                </label>
                <select
                  value={newMapType}
                  onChange={(e) => setNewMapType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Tactical">Tactical Encounter (5ft / 1.5m)</option>
                  <option value="Deckplan">Ship / Station Deckplan</option>
                  <option value="Planetary">Planetary Surface</option>
                  <option value="Orbital">Orbital Sector</option>
                  <option value="System">Solar System / Hyperlane</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMapModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg cursor-pointer"
                >
                  Initialize Sector Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
