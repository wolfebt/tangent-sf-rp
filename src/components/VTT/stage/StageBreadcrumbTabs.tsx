/**
 * @file StageBreadcrumbTabs.tsx
 * @description Consolidated Single-Row Breadcrumb & Scene Tab Bar for the Center Stage Viewport.
 * Combines Macro Hierarchy (Universe > Campaign), Micro Scene Tabs, Tactical Quick Actions,
 * and Viewport/Zen Layout toggles into a single sleek, unified bar.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Map, 
  ChevronRight, 
  Users, 
  Swords, 
  Layers, 
  Settings, 
  Plus, 
  X, 
  Columns, 
  Box, 
  Maximize2, 
  Minimize2, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen, 
  Grid, 
  Sun, 
  Radio, 
  Sparkles, 
  ChevronDown, 
  Check,
  FolderOpen,
  Save,
  Download,
  Upload,
  FilePlus,
  Trash2,
  Camera,
  ImageIcon
} from 'lucide-react';
import { useCampaign, formatExportFilename } from '../../../context/CampaignContext';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { GridType, GridScaleTier } from '../../../engine/index';
import { AudioService } from '../../../services/audioService';
import { v4 as uuidv4 } from 'uuid';
import { NewMapModal } from './NewMapModal';
import { 
  getStarterMapsCollection, 
  createBlankCanvas, 
  createDerelictStarshipMap, 
  createResearchOutpostMap 
} from './defaultMaps';

export interface StageBreadcrumbTabsProps {
  currentMapId: string;
  onSelectMap: (mapId: string) => void;
  onOpenMapMaker?: () => void;
  onOpenUnderlayModal?: () => void;
  isSplitOpen?: boolean;
  onToggleSplit?: () => void;
  is3DActive?: boolean;
  onToggle3D?: () => void;
}

export const StageBreadcrumbTabs: React.FC<StageBreadcrumbTabsProps> = ({
  currentMapId,
  onSelectMap,
  onOpenMapMaker,
  onOpenUnderlayModal,
  isSplitOpen = false,
  onToggleSplit,
  is3DActive = false,
  onToggle3D
}) => {
  const { universeState, setActiveMapId, addMap, updateMap, deleteMap } = useCampaign();
  const {
    isZenMode,
    toggleZenMode,
    isLeftCollapsed,
    toggleLeftCollapse,
    isRightCollapsed,
    toggleRightCollapse,
    isRightPanelOpen,
    setIsRightPanelOpen,
    activeCockpitTab,
    setActiveCockpitTab,
    isGridVisible,
    toggleGridVisible,
    gridSnap,
    toggleGridSnap,
    gridType,
    setGridType,
    scaleTier,
    setScaleTier,
    isDynamicLightingEnabled,
    toggleDynamicLighting,
    isMultiplayerSimActive,
    toggleMultiplayerSim,
    isSplitOpen: storeIsSplitOpen,
    toggleSplitOpen,
    is3DActive: storeIs3DActive,
    toggle3DActive
  } = useUILayoutStore();

  const effectiveIsSplitOpen = onToggleSplit ? isSplitOpen : storeIsSplitOpen;
  const handleToggleSplit = onToggleSplit || (() => {
    toggleSplitOpen();
    AudioService.playTerminalBeep(!storeIsSplitOpen ? 1100 : 700, 0.04);
  });

  const effectiveIs3DActive = onToggle3D ? is3DActive : storeIs3DActive;
  const handleToggle3D = onToggle3D || (() => {
    toggle3DActive();
    AudioService.playTerminalBeep(!storeIs3DActive ? 880 : 440, 0.05);
  });

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isNewMapModalOpen, setIsNewMapModalOpen] = useState(false);

  const gridMenuRef = useRef<HTMLDivElement | null>(null);
  const projectMenuRef = useRef<HTMLDivElement | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (gridMenuRef.current && !gridMenuRef.current.contains(e.target as Node)) {
        setIsGridMenuOpen(false);
      }
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableMaps = universeState?.maps || [];
  const campaignName = universeState?.projectName || 'Tangent Universe';
  const activeMap = availableMaps.find((m: any) => m.id === currentMapId) || availableMaps[0] || null;

  // Handle Double-Click Inline Rename
  const handleStartRename = (map: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(map.id);
    setEditingTitle(map.name || map.title || 'Untitled Sector');
  };

  const handleCommitRename = (mapId: string) => {
    if (!editingTitle.trim() || !updateMap) {
      setEditingTabId(null);
      return;
    }
    updateMap(mapId, { name: editingTitle.trim(), title: editingTitle.trim() });
    setEditingTabId(null);
  };

  const handleKeyDownRename = (e: React.KeyboardEvent, mapId: string) => {
    if (e.key === 'Enter') {
      handleCommitRename(mapId);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  // Handle Tab Close
  const handleCloseTab = (mapId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (availableMaps.length <= 1) {
      alert('Cannot close the last remaining scene in the module.');
      return;
    }
    if (window.confirm('Remove this tactical scene from the active campaign tabs?')) {
      if (deleteMap) deleteMap(mapId);
      const remaining = availableMaps.filter((m: any) => m.id !== mapId);
      if (remaining.length > 0 && mapId === currentMapId) {
        onSelectMap(remaining[0].id);
        if (setActiveMapId) setActiveMapId(remaining[0].id);
      }
    }
  };

  // Handle Save Map JSON
  const handleSaveMapJson = () => {
    if (!activeMap) return;
    const exportPayload = {
      type: 'TangentMap',
      version: '1.0',
      map: activeMap
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(activeMap.title || activeMap.name || 'map', 'map', 'json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    AudioService.playCriticalChime(true);
  };

  // Handle Load Map JSON
  const handleLoadMapJson = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const mapToLoad = data.type === 'TangentMap' && data.map ? data.map : (data.id && (data.title || data.name) ? data : null);
        if (mapToLoad && addMap) {
          const newId = uuidv4();
          const newMap = { ...mapToLoad, id: newId };
          addMap(newMap);
          onSelectMap(newId);
          if (setActiveMapId) setActiveMapId(newId);
          AudioService.playCriticalChime(true);
        } else {
          alert('Invalid map JSON file format.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse map JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Handle Image File Input (Upload Background Map)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const w = Math.max(1400, Math.round(img.width));
        const h = Math.max(1050, Math.round(img.height));
        const mapName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        const newMap = createBlankCanvas({
          title: mapName,
          gridType: 'hex',
          gridSize: 70,
          width: w,
          height: h,
          scaleTier: 'Encounter',
          backgroundUrl: dataUrl
        });

        if (addMap) {
          addMap(newMap);
          onSelectMap(newMap.id);
          if (setActiveMapId) setActiveMapId(newMap.id);
          AudioService.playCriticalChime(true);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Auto-initialize starter maps collection if no scenes exist in universe
  useEffect(() => {
    if (availableMaps.length === 0 && addMap) {
      const starters = getStarterMapsCollection();
      starters.forEach((m) => addMap(m));
      if (starters[0]) {
        onSelectMap(starters[0].id);
        if (setActiveMapId) setActiveMapId(starters[0].id);
      }
    }
  }, [availableMaps.length, addMap, onSelectMap, setActiveMapId]);

  // Listen for open-new-map-modal and preset loading events from Architect Console
  useEffect(() => {
    const handleOpenModal = () => setIsNewMapModalOpen(true);
    const handleLoadStarship = () => {
      if (addMap) {
        const newMap = createDerelictStarshipMap();
        addMap(newMap);
        onSelectMap(newMap.id);
        if (setActiveMapId) setActiveMapId(newMap.id);
        AudioService.playCriticalChime(true);
      }
    };
    const handleLoadOutpost = () => {
      if (addMap) {
        const newMap = createResearchOutpostMap();
        addMap(newMap);
        onSelectMap(newMap.id);
        if (setActiveMapId) setActiveMapId(newMap.id);
        AudioService.playCriticalChime(true);
      }
    };

    window.addEventListener('open-new-map-modal', handleOpenModal);
    window.addEventListener('load-preset-starship', handleLoadStarship);
    window.addEventListener('load-preset-outpost', handleLoadOutpost);

    return () => {
      window.removeEventListener('open-new-map-modal', handleOpenModal);
      window.removeEventListener('load-preset-starship', handleLoadStarship);
      window.removeEventListener('load-preset-outpost', handleLoadOutpost);
    };
  }, [addMap, onSelectMap, setActiveMapId]);

  return (
    <div className="w-full h-10 px-2 flex items-center justify-between gap-1.5 bg-[#080c13] border-b border-slate-800/90 select-none font-sans shrink-0">
      {/* Left & Center: Consolidated Breadcrumbs + Micro Scene Tabs */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
        {/* Macro Campaign Breadcrumbs - only on large unobstructed screens */}
        <div className="hidden 2xl:flex items-center gap-1.5 shrink-0 text-xs font-mono text-slate-400">
          <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            UNIVERSE
          </span>
          <ChevronRight size={11} className="text-slate-600 shrink-0" />
          <span className="text-slate-300 font-bold hover:text-cyan-300 transition-colors cursor-pointer truncate max-w-[110px] sm:max-w-[160px]">
            {campaignName}
          </span>
        </div>

        {/* PROJECT & MAP MANAGEMENT HUB DROPDOWN */}
        <div className="relative shrink-0 z-20" ref={projectMenuRef}>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setIsProjectMenuOpen(prev => !prev);
              setIsGridMenuOpen(false);
            }}
            className={`px-2 py-1 rounded border text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isProjectMenuOpen
                ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:text-cyan-300'
            }`}
            title="Stage Map & Project Operations (New, Load, Save, Presets)"
          >
            <FolderOpen size={12} className="text-cyan-400" />
            <span>MAP HUB</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isProjectMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProjectMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-slate-900/98 border border-cyan-500/40 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-2xl text-xs font-mono divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Group 1: New & Presets */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">
                  Create & Templates
                </div>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    setIsNewMapModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FilePlus size={13} className="text-cyan-400" />
                  <span className="font-bold">New Scene / Blank Canvas...</span>
                </button>
              </div>

              {/* Group 2: File I/O & Export */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  File I/O & Storage
                </div>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    handleSaveMapJson();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save size={13} className="text-cyan-400" />
                  <span>Save Map File (.json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    jsonFileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download size={13} className="text-cyan-400" />
                  <span>Load Map File (.json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    imageFileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ImageIcon size={13} className="text-sky-400" />
                  <span>Import Battlemap Image...</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('export-stage-png'));
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Camera size={13} className="text-amber-400" />
                  <span>Export Viewport Snapshot (PNG)</span>
                </button>
              </div>

              {/* Group 3: Procedural & VTT Formats */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-emerald-400/80 tracking-wider">
                  Generators & VTT
                </div>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open-uvtt-modal'));
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload size={13} className="text-cyan-400" />
                  <span>Import Universal VTT (.uvtt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open-landmass-modal'));
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-emerald-400" />
                  <span>Procedural Landmass Gen</span>
                </button>
              </div>

              {/* Group 4: Scene Actions */}
              {activeMap && (
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectMenuOpen(false);
                      handleCloseTab(activeMap.id, { stopPropagation: () => {} } as any);
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-red-950/60 text-slate-400 hover:text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} className="text-red-400" />
                    <span>Delete Current Sector</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={jsonFileInputRef}
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleLoadMapJson(file);
            e.target.value = '';
          }}
          className="hidden"
        />
        <input
          ref={imageFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Separator Divider */}
        <div className="w-px h-4 bg-slate-800 shrink-0 mx-0.5" />

        {/* Micro Scene Tabs Inline */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0 py-0.5">
          {availableMaps.length === 0 ? (
            <div className="text-[11px] font-mono text-slate-500 px-2 flex items-center gap-2">
              <span>NO ACTIVE SCENES.</span>
              <button
                type="button"
                onClick={() => setIsNewMapModalOpen(true)}
                className="text-cyan-400 hover:underline font-bold cursor-pointer flex items-center gap-1"
              >
                <Plus size={11} />
                <span>Create Scene / Blank Canvas</span>
              </button>
            </div>
          ) : (
            <>
              {availableMaps.map((map: any, idx: number) => {
                const isCurrent = map.id === currentMapId;
                const hasParty = isCurrent || idx === 0;
                const isCombat = !!map.isCombatActive;
                const isEditing = editingTabId === map.id;

                return (
                  <div
                    key={map.id || idx}
                    onClick={() => {
                      onSelectMap(map.id);
                      if (setActiveMapId) setActiveMapId(map.id);
                      const isSquare = map.gridType === 'square' || map.gridMode === 'square';
                      setGridType(isSquare ? GridType.Square : GridType.HexFlatTop);
                    }}
                    onDoubleClick={(e) => handleStartRename(map, e)}
                    className={`group relative h-7 px-2 rounded border text-xs font-mono font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 max-w-[200px] ${
                      isCurrent
                        ? 'bg-[#131b26] border-cyan-500/50 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)] z-10'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Double-click to rename tab"
                  >
                    {/* Active Accent Indicator */}
                    {isCurrent && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-amber-400 rounded-t-sm" />
                    )}

                    {/* Preload Ready Dot */}
                    <span 
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" 
                      title="WebGL GPU Texture Preloaded" 
                    />

                    <Map size={11} className={isCurrent ? 'text-cyan-400 shrink-0' : 'text-slate-500 group-hover:text-slate-400 shrink-0'} />

                    {/* Title / Inline Rename Input */}
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        autoFocus
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleCommitRename(map.id)}
                        onKeyDown={(e) => handleKeyDownRename(e, map.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-950 border border-cyan-400 text-cyan-200 px-1 py-0.5 rounded text-[11px] font-mono outline-none w-24"
                      />
                    ) : (
                      <span className="truncate max-w-[100px]">
                        {map.name || map.title || `Sector ${idx + 1}`}
                      </span>
                    )}

                    {/* Badges: Party Pin & Combat Pulse */}
                    <div className="flex items-center gap-1 ml-auto shrink-0">
                      {hasParty && (
                        <span 
                          className="p-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                          title="Player Party Present"
                        >
                          <Users size={9} />
                        </span>
                      )}
                      {isCombat && (
                        <span 
                          className="p-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse"
                          title="Tactical Combat Active"
                        >
                          <Swords size={9} />
                        </span>
                      )}

                      {/* Close Tab Button (Hover) */}
                      <button
                        type="button"
                        onClick={(e) => handleCloseTab(map.id, e)}
                        className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Close Scene Tab"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Quick Add New Scene Tab Button */}
              <button
                type="button"
                onClick={() => setIsNewMapModalOpen(true)}
                className="h-6 px-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center shrink-0 ml-0.5 cursor-pointer"
                title="Add New Tactical Scene / Blank Canvas"
              >
                <Plus size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right: Tactical Stage Actions & Consolidated Layout Controls */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1">
        {/* Tactical Grid & Scale Popover */}
        <div className="relative" ref={gridMenuRef}>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setIsGridMenuOpen(prev => !prev);
            }}
            className={`px-2 py-1 border rounded text-[10.5px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
              isGridVisible || isGridMenuOpen
                ? 'bg-slate-900 border-cyan-500/50 text-cyan-300 shadow-sm'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Configure Coordinate Grid & Scale Tier (Hotkey: G)"
          >
            <Grid size={11} className="text-cyan-400" />
            <span className="hidden sm:inline">GRID</span>
            <span className="text-[9.5px] text-cyan-400/80 uppercase">
              {gridType === GridType.Square ? 'SQ' : 'HEX'}
            </span>
            {gridSnap && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Snap Active" />
            )}
            <ChevronDown size={10} className={`text-slate-400 transition-transform ${isGridMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isGridMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-slate-900/98 border border-cyan-500/40 rounded-xl shadow-2xl p-3 z-50 backdrop-blur-2xl text-xs font-mono space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span>Coordinate Grid & Scale</span>
                <span className="text-slate-500 text-[9px]">Shortcut: [G]</span>
              </div>

              {/* Grid Visibility & Snap Toggles */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    toggleGridVisible();
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-colors cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                    isGridVisible
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Grid size={11} />
                  <span>{isGridVisible ? 'Grid Shown' : 'Grid Hidden'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    toggleGridSnap();
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-colors cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                    gridSnap
                      ? 'bg-amber-950 border-amber-600 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Check size={11} className={gridSnap ? 'opacity-100' : 'opacity-0'} />
                  <span>{gridSnap ? 'Snap ON' : 'Snap Free'}</span>
                </button>
              </div>

              {/* Grid Geometry (Square vs Hex) */}
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Grid Geometry
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setGridType(GridType.Square);
                      if (currentMapId && updateMap) {
                        updateMap(currentMapId, { gridType: 'square', gridMode: 'square' });
                      }
                    }}
                    className={`py-1 rounded border text-center transition-colors cursor-pointer text-[10px] ${
                      gridType === GridType.Square
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Square
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setGridType(GridType.HexFlatTop);
                      if (currentMapId && updateMap) {
                        updateMap(currentMapId, { gridType: 'hex', gridMode: 'hex' });
                      }
                    }}
                    className={`py-1 rounded border text-center transition-colors cursor-pointer text-[10px] ${
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
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Scale Tier
                </label>
                <select
                  value={scaleTier || GridScaleTier.Encounter}
                  onChange={(e) => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    setScaleTier(e.target.value as GridScaleTier);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
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
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            toggleDynamicLighting();
          }}
          className={`p-1.5 rounded border text-xs transition-all cursor-pointer ${
            isDynamicLightingEnabled
              ? 'bg-amber-950/70 border-amber-500/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/90 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={isDynamicLightingEnabled ? 'Dynamic Lighting & Shadows: ACTIVE' : 'Dynamic Lighting: DISABLED'}
        >
          <Sun size={12} />
        </button>

        {/* Multiplayer Telemetry Toggle / Indicator */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            toggleMultiplayerSim();
          }}
          className={`px-1.5 py-1 rounded border text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
            isMultiplayerSimActive
              ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              : 'bg-slate-900/90 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={isMultiplayerSimActive ? 'LiveKit Telemetry: 3 PEERS CONNECTED' : 'Standalone Simulation Mode'}
        >
          <Radio size={11} className={isMultiplayerSimActive ? 'text-emerald-400' : 'text-slate-500'} />
          <span className="text-[9.5px] hidden xl:inline">
            {isMultiplayerSimActive ? 'PEERS' : 'LOCAL'}
          </span>
        </button>

        {/* AIME Tactical Co-Pilot Launcher */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1400, 0.03);
            setIsRightPanelOpen(true);
            setActiveCockpitTab('aime');
          }}
          className={`px-2 py-1 rounded border text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
            isRightPanelOpen && activeCockpitTab === 'aime'
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900/90 border-slate-800 text-amber-400 hover:bg-slate-800'
          }`}
          title="Toggle AIME Tactical Co-Pilot"
        >
          <Sparkles size={11} className="text-amber-400 animate-pulse" />
          <span className="hidden md:inline font-bold">AIME</span>
        </button>

        {/* Separator Divider */}
        <div className="w-px h-4 bg-slate-800 shrink-0 mx-0.5" />

        {onOpenUnderlayModal && (
          <button
            type="button"
            onClick={onOpenUnderlayModal}
            className="px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[10.5px] transition-colors flex items-center gap-1 cursor-pointer font-mono"
            title="Calibrate Map Underlay Image & Grid Scale"
          >
            <Settings size={11} />
            <span className="hidden md:inline">Underlay</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleToggle3D}
          className={`px-2 py-1 rounded text-[10.5px] transition-colors flex items-center gap-1 cursor-pointer font-mono font-bold border ${
            effectiveIs3DActive
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
          }`}
          title="Toggle 2D Blueprint vs 3D Holographic Stage (Hotkey: V)"
        >
          <Box size={11} className={effectiveIs3DActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'} />
          <span>{effectiveIs3DActive ? '3D HOLO' : '2D PLAN'}</span>
        </button>

        {/* Studio (Map Maker Launcher) */}
        <a
          href={`/foundry/map-maker?mapId=${currentMapId || ''}`}
          onClick={(e) => {
            if (onOpenMapMaker) {
              e.preventDefault();
              onOpenMapMaker();
            }
          }}
          className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-[10.5px] transition-colors flex items-center gap-1 cursor-pointer font-mono"
          title="Open Map in 2D Map Maker (Architect Suite)"
        >
          <Layers size={11} />
          <span className="hidden md:inline">Studio</span>
        </a>

        <button
          type="button"
          onClick={handleToggleSplit}
          className={`px-2 py-1 rounded text-[10.5px] transition-colors flex items-center gap-1 cursor-pointer font-mono font-bold border ${
            effectiveIsSplitOpen
              ? 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
          }`}
          title="Toggle Split Workspace (Folio, Roster, Bestiary)"
        >
          <Columns size={11} />
          <span className="hidden lg:inline">Split</span>
        </button>

        {/* Separator Divider */}
        <div className="w-px h-4 bg-slate-800 shrink-0 mx-0.5" />

        {/* Integrated Layout & Zen Toggles (Replaces the floating overlay pill) */}
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800/80 rounded-md p-0.5">
          <button
            type="button"
            onClick={toggleZenMode}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
              isZenMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isZenMode ? "Exit Zen (F)" : "Enter Zen Mode (F)"}
          >
            {isZenMode ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span className="hidden xl:inline">{isZenMode ? 'EXIT ZEN' : 'ZEN (F)'}</span>
          </button>

          <button
            type="button"
            onClick={toggleLeftCollapse}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              !isLeftCollapsed ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Left Catalog ([)"
          >
            {!isLeftCollapsed ? <PanelLeftClose size={12} /> : <PanelLeftOpen size={12} />}
          </button>

          <button
            type="button"
            onClick={toggleRightCollapse}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              !isRightCollapsed ? 'text-amber-400 bg-amber-950/50' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Right Cockpit (])"
          >
            {!isRightCollapsed ? <PanelRightClose size={12} /> : <PanelRightOpen size={12} />}
          </button>
        </div>
      </div>

      {/* New Scene / Blank Canvas / Import Modal */}
      <NewMapModal
        isOpen={isNewMapModalOpen}
        onClose={() => setIsNewMapModalOpen(false)}
        onCreateMap={(newMapObj) => {
          if (addMap) {
            addMap(newMapObj);
            onSelectMap(newMapObj.id);
            if (setActiveMapId) setActiveMapId(newMapObj.id);
            if (newMapObj.gridType === 'square') {
              setGridType(GridType.Square);
            } else {
              setGridType(GridType.HexFlatTop);
            }
          }
        }}
        onOpenUvttModal={() => window.dispatchEvent(new CustomEvent('open-uvtt-modal'))}
        onLoadMapJson={handleLoadMapJson}
      />
    </div>
  );
};

export default StageBreadcrumbTabs;
