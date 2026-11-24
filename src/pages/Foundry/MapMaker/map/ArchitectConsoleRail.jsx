import React, { useState, useEffect } from 'react';
import {
  SIDEBAR_TOOLS,
  DEFAULT_LAYERS
} from './MapConstants';
import {
  getTerrainsForScale,
  getObjectsForScale,
  getCategoriesForScale
} from './MapAssetCatalog';
import {
  MousePointer,
  Hand,
  Shield,
  Eye,
  Paintbrush,
  Sparkles,
  Flame,
  Sun,
  Box,
  Layers,
  Terminal,
  FolderOpen,
  Upload,
  Users,
  Compass,
  Edit3,
  Type,
  ChevronLeft,
  ChevronRight,
  Pin,
  PinOff,
  CloudMoon,
  Sliders,
  Scissors,
  Cpu,
  Blocks,
  PenTool,
  MapPin
} from 'lucide-react';
import AudioService from '../../../../services/audioService';
import { VttEventBus } from '../../../../utils/vttEventBus';
import {
  ArchitectLayersPanel,
  ArchitectEnvironmentPanel
} from './console/ArchitectLayersAndEnvPanels';
import { ArchitectToolOptionsPanels } from './console/ArchitectToolOptionsPanels';

export const ArchitectConsoleRail = ({
  // Core Tool State
  activeTool = 'select',
  setActiveTool,
  isCollapsed = false,
  onToggleCollapse,
  isPinned = false,
  onTogglePin,
  // Cartography Tool Options
  selectedTerrain,
  setSelectedTerrain,
  terrainWidth = 30,
  setTerrainWidth,
  selectedObjectType,
  setSelectedObjectType,
  pencilColor,
  setPencilColor,
  pencilWidth,
  setPencilWidth,
  tokenType,
  setTokenType,
  tokenLabelInput,
  setTokenLabelInput,
  tokenOmnicortexData,
  onOpenOmnicortexLink,
  textLabelInput,
  setTextLabelInput,
  textColor,
  setTextColor,
  textSize,
  setTextSize,
  fogEnabled,
  setFogEnabled,
  currentMapScale = 'Planetary',
  customAssets = { terrains: [], objects: [] },
  selectedWallType = 'solid',
  setSelectedWallType,
  doorLockDc = 14,
  setDoorLockDc,
  selectedRegionType = 'roof_zone',
  setSelectedRegionType,
  enableWallShadows = true,
  onToggleWallShadows,
  paintRoofLayer = false,
  onTogglePaintRoofLayer,
  rulerSelectedPace = 'walk',
  setRulerSelectedPace,
  measurementUnit = 'meters',
  setMeasurementUnit,
  activeSensorMode = 'standard_optical',
  setActiveSensorMode,
  // Lighting options
  selectedLightColor = '#f59e0b',
  setSelectedLightColor,
  selectedLightRadius = 180,
  setSelectedLightRadius,
  selectedLightAnimation = 'flicker',
  setSelectedLightAnimation,
  // Embedded Layers Management
  mapLayers = DEFAULT_LAYERS,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onDeleteCustomLayer,
  newLayerNameInput = '',
  setNewLayerNameInput,
  onAddCustomLayer,
  // Embedded Environment & Director Controls
  onApplyEnvironmentPreset,
  onBatchTokenAction,
  onBroadcastMessage,
  // Studio Drawer Launchers
  onOpenAssetManager,
  onOpenHeroDrawer,
  onOpenOmnicortexDrawer,
  onOpenLandmassGenerator,
  onOpenPcgStudio,
  onOpenAssetStudio,
  onOpenAssetIngestion,
  onOpenSpriteSheetCutter,
  onOpenUvttImport,
  // Map Chunk / Prefab Stamp Tool Props
  selectedChunk,
  setSelectedChunk,
  chunkRotationDeg = 0,
  setChunkRotationDeg,
  chunkFlipX = false,
  setChunkFlipX,
  chunkFlipY = false,
  setChunkFlipY,
  chunkSettings,
  setChunkSettings,
  chunkSlotOverrides,
  setChunkSlotOverrides,
  magneticSnapEnabled = true,
  setMagneticSnapEnabled,
  onOpenChunkStudio
}) => {
  const [selectedCatalogScale, setSelectedCatalogScale] = useState(currentMapScale);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpecialTab, setActiveSpecialTab] = useState(null); // 'layers' | 'environment' | null

  const [railWidth, setRailWidth] = useState(() => {
    try {
      const stored = localStorage.getItem('tangent_architect_rail_width');
      return stored ? Number(stored) : 380;
    } catch {
      return 380;
    }
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleStartResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = railWidth;

    const onMouseMove = (moveEvt) => {
      // Dragging left increases width, dragging right decreases width
      const delta = startX - moveEvt.clientX;
      const nextWidth = Math.max(280, Math.min(startWidth + delta, 650));
      setRailWidth(nextWidth);
      try {
        localStorage.setItem('tangent_architect_rail_width', String(nextWidth));
      } catch {}
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (currentMapScale) {
      setSelectedCatalogScale(currentMapScale);
    }
  }, [currentMapScale]);

  const activeTerrains = getTerrainsForScale(selectedCatalogScale, customAssets?.terrains || []);
  const activeCategories = getCategoriesForScale(selectedCatalogScale, customAssets?.objects || []);

  useEffect(() => {
    if (activeCategories.length > 0 && (!selectedCategory || !activeCategories.includes(selectedCategory))) {
      setSelectedCategory(activeCategories[0]);
    }
  }, [selectedCatalogScale, activeCategories]);

  const activeObjects = getObjectsForScale(selectedCatalogScale, selectedCategory, customAssets?.objects || []);

  const filteredTerrains = activeTerrains.filter(t =>
    !searchQuery || t.label.toLowerCase().includes(searchQuery.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredObjects = activeObjects.filter(o =>
    !searchQuery || o.label.toLowerCase().includes(searchQuery.toLowerCase()) || (o.desc && o.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Environment apply handler
  const handleApplyEnv = (preset) => {
    AudioService.playTerminalBeep(980, 0.1);
    if (onApplyEnvironmentPreset) {
      onApplyEnvironmentPreset(preset.id);
    } else {
      VttEventBus.emit('apply-atmospheric-preset', { presetKey: preset.id });
    }
    if (onBroadcastMessage) {
      onBroadcastMessage(`[ENVIRONMENT UPDATE]: ${preset.icon} ${preset.label} engaged — ${preset.desc}`);
    }
  };

  const handleBatch = (action) => {
    AudioService.playTerminalBeep(1100, 0.1);
    if (onBatchTokenAction) onBatchTokenAction(action);
    if (onBroadcastMessage) {
      onBroadcastMessage(`[ARCHITECT DIRECTIVE]: Batch token directive: ${action.toUpperCase()}`);
    }
  };

  const renderToolSubPanel = () => {
    if (activeSpecialTab === 'layers') {
      return (
        <ArchitectLayersPanel
          mapLayers={mapLayers}
          onToggleLayerVisibility={onToggleLayerVisibility}
          onToggleLayerLock={onToggleLayerLock}
          onDeleteCustomLayer={onDeleteCustomLayer}
          newLayerNameInput={newLayerNameInput}
          setNewLayerNameInput={setNewLayerNameInput}
          onAddCustomLayer={onAddCustomLayer}
          enableWallShadows={enableWallShadows}
          onToggleWallShadows={onToggleWallShadows}
          paintRoofLayer={paintRoofLayer}
          onTogglePaintRoofLayer={onTogglePaintRoofLayer}
        />
      );
    }

    if (activeSpecialTab === 'environment') {
      return (
        <ArchitectEnvironmentPanel
          onApplyEnv={handleApplyEnv}
          onBatchAction={handleBatch}
        />
      );
    }

    return (
      <ArchitectToolOptionsPanels
        activeTool={activeTool}
        currentMapScale={currentMapScale}
        customAssets={customAssets}
        selectedWallType={selectedWallType}
        setSelectedWallType={setSelectedWallType}
        doorLockDc={doorLockDc}
        setDoorLockDc={setDoorLockDc}
        selectedRegionType={selectedRegionType}
        setSelectedRegionType={setSelectedRegionType}
        selectedObjectType={selectedObjectType}
        setSelectedObjectType={setSelectedObjectType}
        selectedLightColor={selectedLightColor}
        setSelectedLightColor={setSelectedLightColor}
        selectedLightRadius={selectedLightRadius}
        setSelectedLightRadius={setSelectedLightRadius}
        selectedLightAnimation={selectedLightAnimation}
        setSelectedLightAnimation={setSelectedLightAnimation}
        selectedTerrain={selectedTerrain}
        setSelectedTerrain={setSelectedTerrain}
        terrainWidth={terrainWidth}
        setTerrainWidth={setTerrainWidth}
        filteredTerrains={filteredTerrains}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredObjects={filteredObjects}
        pencilColor={pencilColor}
        setPencilColor={setPencilColor}
        pencilWidth={pencilWidth}
        setPencilWidth={setPencilWidth}
        textLabelInput={textLabelInput}
        setTextLabelInput={setTextLabelInput}
        textColor={textColor}
        setTextColor={setTextColor}
        textSize={textSize}
        setTextSize={setTextSize}
        tokenType={tokenType}
        setTokenType={setTokenType}
        tokenLabelInput={tokenLabelInput}
        setTokenLabelInput={setTokenLabelInput}
        onOpenOmnicortexLink={onOpenOmnicortexLink}
        rulerSelectedPace={rulerSelectedPace}
        setRulerSelectedPace={setRulerSelectedPace}
        measurementUnit={measurementUnit}
        setMeasurementUnit={setMeasurementUnit}
        fogEnabled={fogEnabled}
        setFogEnabled={setFogEnabled}
        onOpenAssetManager={onOpenAssetManager}
        onOpenHeroDrawer={onOpenHeroDrawer}
        onOpenOmnicortexDrawer={onOpenOmnicortexDrawer}
        onOpenLandmassGenerator={onOpenLandmassGenerator}
        selectedChunk={selectedChunk}
        setSelectedChunk={setSelectedChunk}
        chunkRotationDeg={chunkRotationDeg}
        setChunkRotationDeg={setChunkRotationDeg}
        chunkFlipX={chunkFlipX}
        setChunkFlipX={setChunkFlipX}
        chunkFlipY={chunkFlipY}
        setChunkFlipY={setChunkFlipY}
        chunkSettings={chunkSettings}
        setChunkSettings={setChunkSettings}
        chunkSlotOverrides={chunkSlotOverrides}
        setChunkSlotOverrides={setChunkSlotOverrides}
        magneticSnapEnabled={magneticSnapEnabled}
        setMagneticSnapEnabled={setMagneticSnapEnabled}
        onOpenChunkStudio={onOpenChunkStudio}
      />
    );
  };

  return (
    <aside
      className={`h-full flex flex-row justify-end z-20 select-none font-sans relative shrink-0 ${
        isResizing ? '' : 'transition-[width] duration-150'
      }`}
      style={{ width: isCollapsed ? '48px' : `${railWidth}px` }}
      aria-label="Architect Console Right Rail"
    >
      {/* Draggable Adjustment Slider Splitter (Left Edge of Right Rail) */}
      {!isCollapsed && (
        <div
          onMouseDown={handleStartResize}
          className="w-2 hover:w-2.5 -ml-1 h-full cursor-col-resize z-40 relative group flex items-center justify-center transition-all select-none hover:bg-amber-500/20 active:bg-amber-500/40 shrink-0"
          title="Drag adjustment slider to resize Architect Console"
        >
          <div className="w-0.5 h-16 rounded bg-slate-700 group-hover:bg-amber-400 group-hover:h-24 transition-all" />
          {/* Prominent floating collapse tab */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            className="absolute top-1/2 -translate-y-1/2 -left-3.5 z-50 w-7 h-14 rounded-l-xl bg-slate-900/95 border-y border-l border-amber-500/70 hover:border-amber-400 text-amber-400 hover:text-black hover:bg-amber-400 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer group/btn"
            title="Collapse Architect Console"
          >
            <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-0.5" />
            <span className="text-[7px] font-mono font-black uppercase tracking-tighter [writing-mode:vertical-lr] text-amber-300 group-hover/btn:text-black">HIDE</span>
          </button>
        </div>
      )}

      {/* Docked Collapsible Drawer Column (Extends to the left of the rail icon bar) */}
      <div
        className={`h-full border-l border-slate-800/90 bg-[#0c1017]/95 backdrop-blur-md flex flex-col overflow-hidden shadow-2xl flex-1 min-w-0 ${
          isCollapsed ? 'hidden' : ''
        }`}
      >
        {/* Drawer Header with Width Slider & Collapse Button */}
        <div className="h-12 px-3 border-b border-slate-800/80 bg-[#0a0e14] flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider capitalize truncate">
              {activeSpecialTab === 'layers'
                ? 'Compositor Layers'
                : activeSpecialTab === 'environment'
                ? 'Environment & Director'
                : (SIDEBAR_TOOLS.find(t => t.id === activeTool)?.label || activeTool)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                isPinned ? 'text-purple-400 bg-purple-950/60' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={isPinned ? 'Unpin Right Rail' : 'Pin Right Rail Open'}
            >
              {isPinned ? <Pin size={13} /> : <PinOff size={13} />}
            </button>

            {/* PROMINENT COLLAPSE BUTTON */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="px-2.5 py-1 rounded-lg bg-amber-950 hover:bg-amber-500 border border-amber-500/70 hover:border-amber-300 text-amber-300 hover:text-black font-mono font-bold text-xs flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)] cursor-pointer"
              title="Collapse Architect Drawer (▶)"
            >
              <span className="text-[10px] hidden sm:inline">COLLAPSE</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 text-slate-200 scrollbar-thin scrollbar-thumb-slate-800">
          {renderToolSubPanel()}
        </div>
      </div>

      {/* 48px Vertical Icon Rail on Right Edge */}
      <nav
        className="w-12 shrink-0 h-full border-l border-slate-800/80 bg-[#090d13] flex flex-col items-center py-2 gap-1.5 z-20 shadow-[-2px_0_15px_rgba(0,0,0,0.5)]"
        aria-label="Architect Tools Rail"
      >
        {/* PROMINENT EXPAND BUTTON (when collapsed) */}
        {isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-10 py-2 rounded-xl bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-mono font-bold flex flex-col items-center justify-center gap-0.5 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse hover:animate-none transition-all cursor-pointer border border-amber-300 shrink-0 mb-1"
            title="Expand Architect Tools & Console"
          >
            <ChevronLeft size={18} />
            <span className="text-[8px] tracking-wider uppercase">TOOLS</span>
          </button>
        )}
        {/* Core Cartography Tools */}
        <div className="flex flex-col items-center gap-1.5 flex-1 overflow-y-auto scrollbar-none w-full px-1">
          {/* Embedded Layers Special Tab */}
          <button
            type="button"
            onClick={() => {
              if (activeSpecialTab === 'layers') {
                setActiveSpecialTab(null);
              } else {
                setActiveSpecialTab('layers');
                if (isCollapsed) onToggleCollapse?.();
              }
            }}
            className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
              activeSpecialTab === 'layers' && !isCollapsed
                ? 'bg-sky-950 text-sky-300 border border-sky-500/60 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-sky-300 hover:bg-slate-900'
            }`}
            title="Layer Compositor"
          >
            <Layers size={18} />
          </button>

          {/* Embedded Environment & Director Special Tab */}
          <button
            type="button"
            onClick={() => {
              if (activeSpecialTab === 'environment') {
                setActiveSpecialTab(null);
              } else {
                setActiveSpecialTab('environment');
                if (isCollapsed) onToggleCollapse?.();
              }
            }}
            className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
              activeSpecialTab === 'environment' && !isCollapsed
                ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
            }`}
            title="Environment & Director Deck"
          >
            <CloudMoon size={18} />
          </button>

          <div className="w-6 h-px bg-slate-800 my-1 shrink-0" />

          {/* Regular Sidebar Tools */}
          {SIDEBAR_TOOLS.map((t) => {
            const isActive = activeTool === t.id && activeSpecialTab === null && !isCollapsed;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveSpecialTab(null);
                  setActiveTool?.(t.id);
                  if (isCollapsed) onToggleCollapse?.();
                }}
                className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title={t.label}
              >
                {t.id === 'wall' && <Shield size={18} />}
                {t.id === 'curved_wall' && <PenTool size={18} />}
                {t.id === 'region' && <MapPin size={18} />}
                {t.id === 'terrain' && <Paintbrush size={18} />}
                {t.id === 'object' && <Box size={18} />}
                {t.id === 'hazard' && <Flame size={18} />}
                {t.id === 'light' && <Sun size={18} />}
                {t.id === 'token' && <Users size={18} />}
                {t.id === 'pencil' && <Edit3 size={18} />}
                {t.id === 'text' && <Type size={18} />}
                {t.id === 'ruler' && <Compass size={18} />}
                {t.id === 'fog' && <Eye size={18} />}
                {t.id === 'eraser' && <Sparkles size={18} />}
                {t.id === 'select' && <MousePointer size={18} />}
                {t.id === 'pan' && <Hand size={18} />}
                {t.id === 'chunk' && <Blocks size={18} />}

                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute -right-1 top-1.5 bottom-1.5 w-1 rounded-l bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-6 h-px bg-slate-800 my-1 shrink-0" />

        {/* Studio Drawer Launchers */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 px-1">
          {onOpenHeroDrawer && (
            <button
              type="button"
              onClick={onOpenHeroDrawer}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-950/40 hover:text-amber-300 border border-transparent hover:border-amber-500/40 transition-all cursor-pointer"
              title="Folio Heroes Roster"
            >
              <Users size={17} />
            </button>
          )}

          {onOpenOmnicortexDrawer && (
            <button
              type="button"
              onClick={onOpenOmnicortexDrawer}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-300 border border-transparent hover:border-cyan-500/40 transition-all cursor-pointer"
              title="Omnicortex Codex"
            >
              <Terminal size={17} />
            </button>
          )}

          {(onOpenPcgStudio || onOpenLandmassGenerator) && (
            <button
              type="button"
              onClick={onOpenPcgStudio || onOpenLandmassGenerator}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 border border-transparent hover:border-emerald-500/40 transition-all cursor-pointer"
              title="PCG & AI Co-Pilot Studio"
            >
              <Cpu size={17} />
            </button>
          )}

          {onOpenAssetStudio && (
            <button
              type="button"
              onClick={onOpenAssetStudio}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-950/40 hover:text-amber-300 border border-transparent hover:border-amber-500/40 transition-all cursor-pointer"
              title="Asset Studio & Property Forge"
            >
              <Sliders size={17} />
            </button>
          )}

          {onOpenAssetIngestion && (
            <button
              type="button"
              onClick={onOpenAssetIngestion}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-950/40 hover:text-blue-300 border border-transparent hover:border-blue-500/40 transition-all cursor-pointer"
              title="External Asset Ingestion"
            >
              <FolderOpen size={17} />
            </button>
          )}

          {onOpenSpriteSheetCutter && (
            <button
              type="button"
              onClick={onOpenSpriteSheetCutter}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-teal-400 hover:bg-teal-950/40 hover:text-teal-300 border border-transparent hover:border-teal-500/40 transition-all cursor-pointer"
              title="Sprite Sheet & Tile Slicer"
            >
              <Scissors size={17} />
            </button>
          )}

          {onOpenUvttImport && (
            <button
              type="button"
              onClick={onOpenUvttImport}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-purple-400 hover:bg-purple-950/40 hover:text-purple-300 border border-transparent hover:border-purple-500/40 transition-all cursor-pointer"
              title="Import Universal VTT"
            >
              <Upload size={17} />
            </button>
          )}
        </div>

        {/* Pin & Collapse Action Buttons */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onTogglePin}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isPinned
                ? 'bg-purple-600 text-black shadow-[0_0_10px_rgba(168,85,247,0.5)] font-bold'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title={isPinned ? 'Unpin Right Rail' : 'Pin Right Rail Open'}
          >
            {isPinned ? <Pin size={15} /> : <PinOff size={15} />}
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
              isCollapsed
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.8)] animate-pulse'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-300 hover:bg-amber-500 hover:text-black'
            }`}
            title={isCollapsed ? 'Expand Architect Console' : 'Collapse Architect Console'}
          >
            {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default ArchitectConsoleRail;
