import React, { useState, useEffect } from 'react';
import {
  SIDEBAR_TOOLS,
  MAP_TYPES,
  PENCIL_COLORS,
  PENCIL_WIDTHS,
  TEXT_COLORS,
  MASTER_TERRAINS,
  MASTER_OBJECTS,
  DEFAULT_LAYERS
} from './MapConstants';
import {
  getTerrainsForScale,
  getObjectsForScale,
  getCategoriesForScale
} from './MapAssetCatalog';
import {
  MousePointer,
  Plus,
  Map,
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
  Globe,
  Users,
  Compass,
  Edit3,
  Type,
  ChevronLeft,
  ChevronRight,
  Pin,
  PinOff,
  CloudMoon,
  Lock,
  Unlock,
  Radio,
  Sliders,
  Moon
} from 'lucide-react';
import AudioService from '../../../../services/audioService';
import { VttEventBus } from '../../../../utils/vttEventBus';

const ENV_PRESETS = [
  { id: 'zero_g', label: 'Zero-G Drift', icon: '🌌', desc: 'Floating inertia / Acrobatics CR 12' },
  { id: 'smoke_fog', label: 'Dense Smoke', icon: '💨', desc: 'Heavy obscurement / +4 Cover DC' },
  { id: 'radiation_leak', label: 'High Radiation', icon: '☢️', desc: '1d6 Lethal tick per turn' },
  { id: 'vacuum_decomp', label: 'Vacuum Breach', icon: '🕳️', desc: 'Requires sealed EVA suits' },
  { id: 'plasma_surge', label: 'Thermal Plasma', icon: '🔥', desc: '4d10 thermal hazard damage' }
];

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
  rulerAvailableAp = 4,
  setRulerAvailableAp,
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
  onOpenUvttImport
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
    if (onApplyEnvironmentPreset) onApplyEnvironmentPreset(preset.id);
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
    // 1. Embedded Layers Tab
    if (activeSpecialTab === 'layers') {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#0D5C63]/50">
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-[#22d3ee]" />
              <span>Layer Compositor:</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400">{mapLayers.length} Layers</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-0.5">
            {mapLayers.map((layer) => (
              <div
                key={layer.id}
                className="flex items-center justify-between p-2 rounded bg-[#0d1117]/90 border border-[#0D5C63]/50 text-xs transition-all hover:border-[#22d3ee]/50"
              >
                <div className="flex items-center gap-2 truncate pr-1">
                  <button
                    type="button"
                    onClick={() => onToggleLayerVisibility?.(layer.id)}
                    className={`text-sm transition-colors cursor-pointer ${layer.visible ? 'text-[#22d3ee]' : 'text-slate-600'}`}
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? '👁️' : '🙈'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleLayerLock?.(layer.id)}
                    className={`text-sm transition-colors cursor-pointer ${layer.locked ? 'text-red-400' : 'text-slate-500'}`}
                    title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {layer.locked ? '🔒' : '🔓'}
                  </button>
                  <span className={`font-semibold text-xs truncate ${layer.visible ? 'text-white' : 'text-slate-500 line-through'}`}>
                    {layer.name}
                  </span>
                </div>

                {!DEFAULT_LAYERS.some(dl => dl.id === layer.id) && (
                  <button
                    type="button"
                    onClick={() => onDeleteCustomLayer?.(layer.id)}
                    className="text-slate-500 hover:text-red-400 font-bold px-1 cursor-pointer"
                    title="Delete Custom Layer"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Layer Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddCustomLayer?.(e);
            }}
            className="flex flex-col gap-1.5 pt-2 border-t border-[#0D5C63]/40 mt-1"
          >
            <label className="text-[10px] text-[#22d3ee] uppercase font-bold tracking-wider">New Layer Name:</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newLayerNameInput}
                onChange={e => setNewLayerNameInput?.(e.target.value)}
                placeholder="E.g. Upper Deck"
                className="flex-1 bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-cyan-950 border border-[#22d3ee]/60 hover:bg-cyan-900 text-[#22d3ee] font-bold text-xs rounded uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.3)]"
              >
                + Add
              </button>
            </div>
          </form>
        </div>
      );
    }

    // 2. Embedded Environment & Director Deck
    if (activeSpecialTab === 'environment') {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1 border-b border-purple-900/60">
            <span className="text-[10px] uppercase text-purple-300 font-bold tracking-wider flex items-center gap-1.5">
              <CloudMoon size={13} className="text-purple-400" />
              <span>Environment & Hazards:</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800 font-bold">
              GM DECK
            </span>
          </div>

          {/* Environmental Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase font-bold text-slate-400">Dynamic Atmospheric Presets:</span>
            <div className="grid grid-cols-1 gap-1.5">
              {ENV_PRESETS.map(env => (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => handleApplyEnv(env)}
                  className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-purple-900/50 text-left flex items-start gap-2 transition-all cursor-pointer group"
                >
                  <span className="text-base shrink-0">{env.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300">
                      {env.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{env.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Batch Token Director Actions */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[9px] uppercase font-bold text-slate-400">Batch Token Directives:</span>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px]">
              <button
                type="button"
                onClick={() => handleBatch('reveal_all')}
                className="py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-center"
                title="Reveal all hidden tokens to players"
              >
                👁️ Reveal All
              </button>
              <button
                type="button"
                onClick={() => handleBatch('stealth_all')}
                className="py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-center"
                title="Conceal enemy tokens into stealth"
              >
                🕶️ Stealth
              </button>
              <button
                type="button"
                onClick={() => handleBatch('heal_party')}
                className="py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold transition-all cursor-pointer text-center"
                title="Restore party Vitality & Health"
              >
                💖 Rest Party
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. Cartography Sub-Panels based on activeTool
    switch (activeTool) {
      case 'wall':
        return (
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">
              🧱 Wall & Barrier Type:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'solid', label: 'Solid Wall', color: 'border-slate-500 bg-slate-900 text-slate-200' },
                { id: 'door', label: 'Bulkhead Door', color: 'border-amber-500 bg-amber-950 text-amber-300' },
                { id: 'window', label: 'Window (LoS)', color: 'border-cyan-500 bg-cyan-950 text-cyan-300' },
                { id: 'ethereal', label: 'Ethereal / Meta', color: 'border-purple-500 bg-purple-950 text-purple-300' }
              ].map(w => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWallType?.(w.id)}
                  className={`py-1.5 px-2 text-xs rounded border text-center font-bold transition-all cursor-pointer ${
                    selectedWallType === w.id
                      ? `${w.color} shadow-[0_0_8px_rgba(34,211,238,0.4)] border-[#22d3ee]`
                      : 'border-[#0D5C63]/40 bg-[#0d1117] text-slate-400 hover:text-white'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {selectedWallType === 'door' && (
              <div className="bg-[#0d1117] border border-[#0D5C63]/60 p-2 rounded-lg flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-400 font-bold uppercase text-[10px]">Cyber Hack DC:</span>
                  <span className="text-white font-mono font-bold">{doorLockDc}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="24"
                  step="1"
                  value={doorLockDc}
                  onChange={e => setDoorLockDc?.(Number(e.target.value))}
                  className="accent-amber-400 w-full cursor-pointer h-1.5 bg-[#161b22] rounded-lg"
                />
              </div>
            )}

            <span className="text-[10px] text-slate-400 italic mt-1">
              Click and drag on the canvas to place wall and barrier segments.
            </span>
          </div>
        );

      case 'hazard':
        return (
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] uppercase text-orange-400 font-bold tracking-wider flex items-center gap-1.5">
              <Flame size={12} className="text-orange-400" />
              <span>Environmental Hazards:</span>
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { id: 'hazard_plasma', label: 'Plasma Eruption', desc: '4d10 thermal burst hazard zone', color: '#f97316' },
                { id: 'hazard_gas', label: 'Corrosive Acid Gas', desc: 'Dissolves armor & forces Stamina saves', color: '#10b981' },
                { id: 'hazard_void', label: 'Void Mist Anomaly', desc: 'Slows movement and jams sensors', color: '#8b5cf6' },
                { id: 'hazard_radiation', label: 'Ionizing Radiation', desc: 'Persistent vitality degradation zone', color: '#eab308' }
              ].map(h => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setSelectedObjectType?.({
                      id: h.id,
                      label: h.label,
                      color: h.color,
                      shape: 'circle',
                      radius: 35,
                      hazard: h.label,
                      category: 'Hazards',
                      desc: h.desc
                    });
                  }}
                  className={`py-2 px-2.5 text-xs rounded border text-left transition-all cursor-pointer ${
                    selectedObjectType?.id === h.id
                      ? 'border-orange-400 bg-orange-950/80 text-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                      : 'border-slate-800 bg-[#0d1117]/80 text-slate-300 hover:border-orange-500/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                    <span className="font-bold">{h.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{h.desc}</div>
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 italic">Click on map canvas to stamp environmental hazard zone.</span>
          </div>
        );

      case 'light':
        return (
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] uppercase text-amber-400 font-bold tracking-wider flex items-center gap-1.5">
              <Sun size={12} className="text-amber-400" />
              <span>Dynamic Light Source:</span>
            </span>
            <div className="bg-[#0d1117] border border-slate-800 p-2.5 rounded-lg flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-300 font-bold uppercase text-[10px]">Light Radius:</span>
                <span className="text-amber-200 font-mono font-bold">{selectedLightRadius}px</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={selectedLightRadius}
                onChange={e => setSelectedLightRadius?.(Number(e.target.value))}
                className="accent-amber-400 w-full cursor-pointer h-1.5 bg-[#161b22] rounded-lg"
              />
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Animation:</span>
                <select
                  value={selectedLightAnimation}
                  onChange={e => setSelectedLightAnimation?.(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-amber-300 rounded p-1"
                >
                  <option value="none">Static Steady</option>
                  <option value="flicker">Flicker Torch</option>
                  <option value="pulse">Pulse Glow</option>
                  <option value="strobe">Strobe Alert</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { color: '#f59e0b', label: 'Torch' },
                { color: '#38bdf8', label: 'Cyan' },
                { color: '#ef4444', label: 'Red Alert' },
                { color: '#10b981', label: 'Emerald' }
              ].map(c => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setSelectedLightColor?.(c.color)}
                  className={`py-1.5 px-1 rounded text-[10px] font-bold text-center border transition-all cursor-pointer ${
                    selectedLightColor === c.color ? 'border-white text-white shadow-sm' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                  style={{ backgroundColor: `${c.color}25` }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 italic">Click on map canvas to drop an illuminated dynamic light node.</span>
          </div>
        );

      case 'terrain':
        return (
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">
              Biome & Texture Palette:
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">Brush Width:</span>
              <span className="font-mono text-cyan-300 font-bold">{terrainWidth}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={terrainWidth}
              onChange={e => setTerrainWidth?.(Number(e.target.value))}
              className="accent-cyan-400 w-full cursor-pointer h-1.5 bg-[#161b22] rounded-lg"
            />
            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredTerrains.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTerrain?.(t)}
                  className={`p-1.5 rounded border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedTerrain?.id === t.id
                      ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-sm'
                      : 'border-slate-800 bg-[#0d1117]/80 text-slate-300 hover:border-cyan-500/50 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="text-[11px] font-bold truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'object':
        return (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">
              Props & Structures:
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="bg-[#0d1117] border border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-cyan-400"
            />
            <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto pr-1">
              {filteredObjects.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelectedObjectType?.(o)}
                  className={`p-1.5 rounded border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                    selectedObjectType?.id === o.id
                      ? 'border-cyan-400 bg-cyan-950 text-cyan-200'
                      : 'border-slate-800 bg-[#0d1117] text-slate-300 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="font-bold truncate">{o.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{o.category || 'Prop'}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'token':
        return (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Token Stamp Tool:</span>
            <label className="text-[10px] text-slate-400 font-bold uppercase">Token Label:</label>
            <input
              type="text"
              value={tokenLabelInput}
              onChange={e => setTokenLabelInput?.(e.target.value)}
              className="bg-[#0d1117] border border-slate-800 text-white p-1.5 rounded text-xs outline-none focus:border-cyan-400"
            />
            {onOpenOmnicortexLink && (
              <button
                type="button"
                onClick={onOpenOmnicortexLink}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs rounded font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Terminal size={13} />
                <span>Link Omnicortex Statblock</span>
              </button>
            )}
            <span className="text-[10px] text-slate-400 italic">Click on map canvas to place new token.</span>
          </div>
        );

      case 'fog':
        return (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">Fog of War:</span>
            <button
              type="button"
              onClick={() => setFogEnabled?.(!fogEnabled)}
              className={`py-1.5 px-2.5 text-xs rounded border font-bold transition-all cursor-pointer ${
                fogEnabled
                  ? 'bg-cyan-950 border-[#22d3ee] text-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                  : 'bg-[#0d1117]/60 border-[#0D5C63]/40 text-slate-300 hover:border-[#22d3ee]/60'
              }`}
            >
              {fogEnabled ? 'Global Fog ACTIVE' : 'Enable Global Fog'}
            </button>
            <span className="text-[11px] text-slate-400 italic">Click & drag on canvas to paint darkness / revealed areas.</span>
          </div>
        );

      case 'eraser':
        return (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase text-red-400 font-bold tracking-wider">Eraser Active</span>
            <span className="text-[11px] text-slate-400 italic">Click any object, token, line, or text label to delete it instantly.</span>
          </div>
        );

      case 'select':
        return (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
                <MousePointer size={12} className="text-cyan-400" />
                <span>Selection & Transform</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-bold">
                READY
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                <span>🎯 Direct Canvas Inspector</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Click any token, wall, prop, or light on the canvas to inspect and modify. Click and drag across empty grid space to create a marquee selection box.
              </p>
            </div>

            {/* SECTOR MAP MANAGEMENT & SCENE CREATION HUB */}
            <div className="bg-slate-950/90 border border-cyan-500/40 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-cyan-300 font-bold tracking-wider flex items-center gap-1.5">
                  <FolderOpen size={12} className="text-cyan-400" />
                  <span>Map & Scene Controls</span>
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">
                  {currentMapScale}
                </span>
              </div>

              <button
                type="button"
                onClick={() => VttEventBus.emit('open-new-map-modal')}
                className="w-full py-2 px-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>+ NEW SCENE / BLANK CANVAS</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => VttEventBus.emit('load-preset-starship')}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🚀</span>
                  <span className="font-bold truncate">Starship Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => VttEventBus.emit('load-preset-outpost')}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🔬</span>
                  <span className="font-bold truncate">Outpost Map</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Canvas Shortcuts:</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="text-cyan-400 font-bold block">Marquee Box</span>
                  <span className="text-slate-400 font-sans">Drag on empty space</span>
                </div>
                <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="text-amber-400 font-bold block">Duplicate</span>
                  <span className="text-slate-400 font-sans">Ctrl + D</span>
                </div>
                <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="text-red-400 font-bold block">Delete Asset</span>
                  <span className="text-slate-400 font-sans">Delete / Backspace</span>
                </div>
                <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="text-emerald-400 font-bold block">Nudge Grid</span>
                  <span className="text-slate-400 font-sans">Arrow Keys (Shift: 50px)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Cartography Catalogs:</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {onOpenAssetManager && (
                  <button
                    type="button"
                    onClick={onOpenAssetManager}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📦</span>
                    <span className="font-bold truncate">Asset Vault</span>
                  </button>
                )}
                {onOpenHeroDrawer && (
                  <button
                    type="button"
                    onClick={onOpenHeroDrawer}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>👤</span>
                    <span className="font-bold truncate">Folio Heroes</span>
                  </button>
                )}
                {onOpenOmnicortexDrawer && (
                  <button
                    type="button"
                    onClick={onOpenOmnicortexDrawer}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🤖</span>
                    <span className="font-bold truncate">Bestiary</span>
                  </button>
                )}
                {onOpenLandmassGenerator && (
                  <button
                    type="button"
                    onClick={onOpenLandmassGenerator}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 text-slate-200 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🏔️</span>
                    <span className="font-bold truncate">Landmass Gen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col gap-2 text-[11px] text-slate-400 italic">
            <span>Select a cartography tool or layer from the rail to begin editing the map.</span>
          </div>
        );
    }
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

          {onOpenLandmassGenerator && (
            <button
              type="button"
              onClick={onOpenLandmassGenerator}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 border border-transparent hover:border-emerald-500/40 transition-all cursor-pointer"
              title="Procedural Landmass Gen"
            >
              <Globe size={17} />
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
