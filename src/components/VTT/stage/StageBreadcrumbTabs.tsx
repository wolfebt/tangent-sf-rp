/**
 * @file StageBreadcrumbTabs.tsx
 * @description Consolidated Single-Row Breadcrumb & Scene Tab Bar for the Center Stage Viewport.
 * Combines Macro Hierarchy (Universe > Campaign), Micro Scene Tabs, Tactical Quick Actions,
 * and Viewport/Zen Layout toggles into a single sleek, unified bar.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Map, 
  Plus, 
  Box, 
  Maximize2, 
  Minimize2, 
  Grid, 
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
  ImageIcon, 
  Cpu,
  FolderTree,
  Hammer,
  ArrowLeft
} from 'lucide-react';
import { useCampaign, formatExportFilename } from '../../../context/CampaignContext';
import { showToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { GridType, GridScaleTier } from '../../../engine/index';
import { AudioService } from '../../../services/audioService';
import { v4 as uuidv4 } from 'uuid';
import { NewMapModal } from './NewMapModal';
import { VttEventBus } from '../../../utils/vttEventBus';
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
  onOpenStageOptions?: () => void;
  isSplitOpen?: boolean;
  onToggleSplit?: () => void;
  is3DActive?: boolean;
  onToggle3D?: () => void;
  activeStageTab?: 'map' | 'tree' | 'architect';
  onSelectStageTab?: (tab: 'map' | 'tree' | 'architect') => void;
  onSwitchToWeaver?: () => void;
}

export const StageBreadcrumbTabs: React.FC<StageBreadcrumbTabsProps> = ({
  currentMapId,
  onSelectMap,
  is3DActive = false,
  onToggle3D,
  activeStageTab = 'map',
  onSelectStageTab,
  onSwitchToWeaver
}) => {
  const { universeState, setActiveMapId, addMap, updateMap, deleteMap } = useCampaign();
  const confirm = useConfirm();
  const {
    isZenMode,
    toggleZenMode,
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
    is3DActive: storeIs3DActive,
    toggle3DActive
  } = useUILayoutStore();

  const effectiveIs3DActive = onToggle3D ? is3DActive : storeIs3DActive;
  const handleToggle3D = onToggle3D || (() => {
    toggle3DActive();
    AudioService.playTerminalBeep(!storeIs3DActive ? 880 : 440, 0.05);
  });

  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isMapListOpen, setIsMapListOpen] = useState(false);
  const [isNewMapModalOpen, setIsNewMapModalOpen] = useState(false);

  const gridMenuRef = useRef<HTMLDivElement | null>(null);
  const projectMenuRef = useRef<HTMLDivElement | null>(null);
  const mapListRef = useRef<HTMLDivElement | null>(null);
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
      if (mapListRef.current && !mapListRef.current.contains(e.target as Node)) {
        setIsMapListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableMaps = universeState?.maps || [];
  const activeMap = availableMaps.find((m: any) => m.id === currentMapId) || availableMaps[0] || null;

  // Handle Delete Active Map with Confirmation
  const handleDeleteActiveMap = async () => {
    if (!activeMap) return;
    if (availableMaps.length <= 1) {
      showToast({ type: 'warn', title: 'Cannot Delete Map', text: 'Cannot delete the only remaining map on the stage.' });
      return;
    }
    const ok = await confirm({
      title: 'Delete Tactical Map',
      message: `Are you sure you want to permanently delete "${activeMap.title || activeMap.name || 'Current Scene'}"? This action cannot be undone.`,
      confirmLabel: 'Delete Map',
      danger: true
    });
    if (!ok) return;

    if (deleteMap) deleteMap(activeMap.id);
    const remaining = availableMaps.filter((m: any) => m.id !== activeMap.id);
    if (remaining.length > 0) {
      onSelectMap(remaining[0].id);
      if (setActiveMapId) setActiveMapId(remaining[0].id);
    }
    showToast({ type: 'info', title: 'Map Deleted', text: 'Tactical map deleted.' });
  };

  // Handle Delete Specific Map from Dropdown with Confirmation
  const handleDeleteSpecificMap = async (mapToDelete: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mapToDelete) return;
    if (availableMaps.length <= 1) {
      showToast({ type: 'warn', title: 'Cannot Delete Map', text: 'Cannot delete the only remaining map on the stage.' });
      return;
    }
    const ok = await confirm({
      title: 'Delete Tactical Map',
      message: `Are you sure you want to permanently delete "${mapToDelete.title || mapToDelete.name || 'Untitled Map'}"? This action cannot be undone.`,
      confirmLabel: 'Delete Map',
      danger: true
    });
    if (!ok) return;

    if (deleteMap) deleteMap(mapToDelete.id);
    if (mapToDelete.id === currentMapId) {
      const remaining = availableMaps.filter((m: any) => m.id !== mapToDelete.id);
      if (remaining.length > 0) {
        onSelectMap(remaining[0].id);
        if (setActiveMapId) setActiveMapId(remaining[0].id);
      }
    }
    showToast({ type: 'info', title: 'Map Deleted', text: `Tactical map "${mapToDelete.name || mapToDelete.title || 'Untitled'}" deleted.` });
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
          showToast({ type: 'success', title: 'Map Loaded', text: `Tactical map "${newMap.title || newMap.name || 'Scene'}" imported successfully.` });
        } else {
          showToast({ type: 'error', title: 'Import Failed', text: 'Invalid map JSON file format.' });
        }
      } catch (err) {
        console.error(err);
        showToast({ type: 'error', title: 'Parse Failed', text: 'Failed to parse map JSON file.' });
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

    const offModal = VttEventBus.on('open-new-map-modal', handleOpenModal);
    const offStarship = VttEventBus.on('load-preset-starship', handleLoadStarship);
    const offOutpost = VttEventBus.on('load-preset-outpost', handleLoadOutpost);

    return () => {
      offModal();
      offStarship();
      offOutpost();
    };
  }, [addMap, onSelectMap, setActiveMapId]);

  return (
    <div className="w-full h-11 px-3 flex items-center justify-between gap-2 bg-[#080c13] border-b border-slate-800/90 select-none font-sans shrink-0">
      {/* LEFT: Weaver back button + Single FILE Pulldown + Scene Selector Pill */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onSwitchToWeaver && (
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.02);
              onSwitchToWeaver();
            }}
            className="px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Return to Story Weaver Book"
          >
            <ArrowLeft size={12} />
            <span className="hidden sm:inline">WEAVER</span>
          </button>
        )}

        {/* SINGLE FILE PULLDOWN */}
        <div className="relative shrink-0 z-20" ref={projectMenuRef}>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setIsProjectMenuOpen(prev => !prev);
              setIsGridMenuOpen(false);
              setIsMapListOpen(false);
            }}
            className={`px-2 py-1 rounded border text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isProjectMenuOpen
                ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:text-cyan-300'
            }`}
            title="Single File Menu (New, Save, Load, Import, Export, Delete)"
          >
            <FolderOpen size={12} className="text-cyan-400" />
            <span>FILE</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isProjectMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProjectMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-slate-900/98 border border-cyan-500/40 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-2xl text-xs font-mono divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Create & Templates */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">
                  Create & Presets
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
                  <span className="font-bold">New Canvas / Scene...</span>
                </button>
              </div>

              {/* File I/O & Storage */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  File Storage & I/O
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
                    VttEventBus.emit('export-stage-png');
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Camera size={13} className="text-amber-400" />
                  <span>Export Snapshot (PNG)</span>
                </button>
              </div>

              {/* Generators & Ingestion */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-emerald-400/80 tracking-wider">
                  VTT Formats & Ingestion
                </div>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    VttEventBus.emit('open-uvtt-modal');
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
                    VttEventBus.emit('open-landmass-modal');
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-emerald-400" />
                  <span>Procedural Landmass Gen</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    VttEventBus.emit('open-module-ingestion-modal');
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-purple-950/60 text-purple-300 hover:text-purple-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Cpu size={13} className="text-purple-400" />
                  <span>Ingest VTT Story Module (.json)</span>
                </button>
              </div>

              {/* Delete Option */}
              {activeMap && (
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectMenuOpen(false);
                      handleDeleteActiveMap();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-red-950/60 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} className="text-red-400" />
                    <span className="font-bold">Delete Current Map...</span>
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

        {/* SCENE PICKER PILL */}
        <div className="relative shrink-0" ref={mapListRef}>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setIsMapListOpen(prev => !prev);
              setIsProjectMenuOpen(false);
              setIsGridMenuOpen(false);
            }}
            className={`h-7 px-2 rounded border text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer max-w-[160px] md:max-w-[200px] truncate ${
              isMapListOpen
                ? 'bg-slate-900 border-cyan-400 text-cyan-200'
                : 'bg-slate-900/70 border-slate-700/70 text-slate-300 hover:text-cyan-300'
            }`}
            title="Select Active Scene / Sector"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">{activeMap?.name || activeMap?.title || 'Sector'}</span>
            <ChevronDown size={11} className={`text-slate-400 shrink-0 transition-transform ${isMapListOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMapListOpen && (
            <div className="absolute left-0 mt-1.5 w-60 bg-slate-900/98 border border-cyan-500/40 rounded-xl shadow-2xl py-1 z-50 backdrop-blur-2xl text-xs font-mono max-h-64 overflow-y-auto divide-y divide-slate-800">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                <span>Sectors / Maps ({availableMaps.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsMapListOpen(false);
                    setIsNewMapModalOpen(true);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus size={10} />
                  <span>New</span>
                </button>
              </div>
              {availableMaps.map((m: any) => {
                const isSelected = m.id === currentMapId;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectMap(m.id);
                      if (setActiveMapId) setActiveMapId(m.id);
                      const isSquare = m.gridType === 'square' || m.gridMode === 'square';
                      setGridType(isSquare ? GridType.Square : GridType.HexFlatTop);
                      setIsMapListOpen(false);
                    }}
                    className={`px-3 py-1.5 flex items-center justify-between gap-2 cursor-pointer transition-colors group ${
                      isSelected ? 'bg-cyan-950/70 text-cyan-200 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate flex-1">{m.name || m.title || 'Untitled Map'}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && <span className="text-[10px] text-cyan-400">ACTIVE</span>}
                      {availableMaps.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSpecificMap(m, e)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-70 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Delete this map"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CENTER: Top Horizontal Tabs: Map, Module Tree (Elements), Architect, Gems */}
      <nav aria-label="Stage Navigation Tabs" className="flex items-center bg-[#070b12] border border-cyan-500/30 rounded-xl p-0.5 shadow-md shrink-0">
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            if (onSelectStageTab) onSelectStageTab('map');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
            activeStageTab === 'map'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
          title="Tactical Map Viewport (Pristine WebGPU Canvas)"
        >
          <Map size={13} className={activeStageTab === 'map' ? 'text-white' : 'text-slate-400'} />
          <span>Map</span>
        </button>

        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            if (onSelectStageTab) onSelectStageTab('tree');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
            activeStageTab === 'tree'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
          title="Module Tree & Elements Outliner"
        >
          <FolderTree size={13} className={activeStageTab === 'tree' ? 'text-white' : 'text-slate-400'} />
          <span>Module Tree <span className="opacity-80 text-[11px] font-normal">(Elements)</span></span>
        </button>

        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            if (onSelectStageTab) onSelectStageTab('architect');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
            activeStageTab === 'architect'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
          title="Architect Builder & Map Tools"
        >
          <Hammer size={13} className={activeStageTab === 'architect' ? 'text-white' : 'text-slate-400'} />
          <span>Architect</span>
        </button>

      </nav>

      {/* RIGHT: Grid Menu, 3D Holo, AIME, Zen Fullscreen */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Tactical Grid & Scale Popover */}
        <div className="relative" ref={gridMenuRef}>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setIsGridMenuOpen(prev => !prev);
              setIsProjectMenuOpen(false);
              setIsMapListOpen(false);
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

        {/* 3D Holo Stage Toggle */}
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

        {/* AIME Tactical Co-Pilot Launcher */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1400, 0.03);
            setIsRightPanelOpen(true);
            setActiveCockpitTab('aime');
          }}
          className={`px-2.5 py-1 rounded-xl border text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
            isRightPanelOpen && activeCockpitTab === 'aime'
              ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900/90 border-slate-800 text-amber-400 hover:bg-slate-800'
          }`}
          title="Launch AIME Tactical Co-Pilot"
        >
          <Sparkles size={12} className="text-amber-400 animate-pulse" />
          <span className="font-bold">AIME</span>
        </button>

        {/* Zen Mode Toggle */}
        <button
          type="button"
          onClick={toggleZenMode}
          className={`p-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
            isZenMode
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isZenMode ? "Exit Zen Fullscreen (F)" : "Enter Zen Fullscreen (F)"}
        >
          {isZenMode ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
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
        onOpenUvttModal={() => VttEventBus.emit('open-uvtt-modal')}
        onLoadMapJson={handleLoadMapJson}
      />
    </div>
  );
};

export default StageBreadcrumbTabs;
