import React, { useState, useEffect } from 'react';
import {
  SIDEBAR_TOOLS,
  MAP_TYPES,
  PENCIL_COLORS,
  PENCIL_WIDTHS,
  TEXT_COLORS,
  MASTER_TERRAINS,
  MASTER_OBJECTS
} from './MapConstants';
import DraggablePanel from './DraggablePanel';
import {
  getTerrainsForScale,
  getObjectsForScale,
  getCategoriesForScale
} from './MapAssetCatalog';
import {
  MousePointer,
  Shield,
  DoorClosed,
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
  Package
} from 'lucide-react';

const MapToolsPanel = ({
  showToolsPanel, setShowToolsPanel,
  showSettingsPanel, setShowSettingsPanel,
  activeTool, setActiveTool,
  selectedTerrain, setSelectedTerrain,
  terrainWidth = 30, setTerrainWidth,
  selectedObjectType, setSelectedObjectType,
  pencilColor, setPencilColor,
  pencilWidth, setPencilWidth,
  tokenType, setTokenType,
  tokenLabelInput, setTokenLabelInput,
  tokenOmnicortexData,
  onOpenOmnicortexLink,
  textLabelInput, setTextLabelInput,
  textColor, setTextColor,
  textSize, setTextSize,
  fogEnabled, setFogEnabled,
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
  // Studio Drawer Launchers
  onOpenAssetManager,
  onOpenHeroDrawer,
  onOpenOmnicortexDrawer,
  onOpenLandmassGenerator,
  onOpenUvttImport,
  onOpenLayersPanel
}) => {
  const [selectedCatalogScale, setSelectedCatalogScale] = useState(currentMapScale);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);

  useEffect(() => {
    if (currentMapScale) {
      setSelectedCatalogScale(currentMapScale);
    }
  }, [currentMapScale]);

  const activeTerrains = getTerrainsForScale(selectedCatalogScale, customAssets?.terrains || []);
  const activeCategories = getCategoriesForScale(selectedCatalogScale, customAssets?.objects || []);
  const activeObjects = getObjectsForScale(selectedCatalogScale, selectedCategory, customAssets?.objects || []);

  const filteredTerrains = activeTerrains.filter(t =>
    !searchQuery || t.label.toLowerCase().includes(searchQuery.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredObjects = activeObjects.filter(o =>
    !searchQuery || o.label.toLowerCase().includes(searchQuery.toLowerCase()) || (o.desc && o.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderToolSubPanel = () => {
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
                  onClick={() => setSelectedWallType?.(w.id)}
                  className={`py-1.5 px-2 text-xs rounded border text-center font-bold transition-all ${
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
                  onClick={() => {
                    setSelectedObjectType({
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
                  className={`py-2 px-2.5 text-xs rounded border text-left transition-all ${
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
                { color: '#ef4444', label: 'Alarm' },
                { color: '#10b981', label: 'Bio' }
              ].map(c => (
                <button
                  key={c.color}
                  onClick={() => setSelectedLightColor?.(c.color)}
                  className={`py-1 rounded border text-[10px] font-bold text-center transition-all ${
                    selectedLightColor === c.color ? 'border-white text-white scale-105' : 'border-slate-800 text-slate-400'
                  }`}
                  style={{ backgroundColor: `${c.color}22`, borderColor: selectedLightColor === c.color ? c.color : undefined }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 italic">Click on map canvas to position dynamic point light emitter.</span>
          </div>
        );

      case 'ruler':
        return (
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">
              📏 Tactical Waypoint Ruler:
            </span>
            <div className="bg-[#0d1117] border border-[#0D5C63]/60 p-2.5 rounded-lg flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-cyan-400 font-bold uppercase text-[10px]">Max AP Pool:</span>
                <span className="text-cyan-300 font-mono font-bold bg-cyan-950 px-1.5 py-0.5 rounded border border-[#0D5C63]/60">
                  {rulerAvailableAp} AP
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={rulerAvailableAp}
                onChange={e => setRulerAvailableAp?.(Number(e.target.value))}
                className="accent-[#22d3ee] w-full cursor-pointer h-1.5 bg-[#161b22] rounded-lg"
              />
            </div>
            <div className="text-[10px] text-slate-400 space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
              <div>• <strong>Click + Drag</strong>: Measure direct distance & AP.</div>
              <div>• <strong>Space + Click</strong>: Drop intermediate waypoints.</div>
              <div>• <strong>Green</strong> = Standard Move ($\le$ AP).</div>
              <div>• <strong>Amber</strong> = Sprint / Overdrive ($2\times$ AP).</div>
            </div>
          </div>
        );

      case 'terrain':
        return (
          <div className="flex flex-col gap-2.5">
            {/* Quick Asset Manager Shortcut Button */}
            {onOpenAssetManager && (
              <button
                onClick={onOpenAssetManager}
                className="w-full py-1.5 px-2 bg-cyan-950/80 hover:bg-cyan-900 text-[#22d3ee] border border-[#22d3ee]/60 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(34,211,238,0.25)]"
              >
                <span>📦</span> Manage / Create Assets...
              </button>
            )}

            {/* Terrain Brush Size Adjuster */}
            <div className="bg-[#0d1117]/90 border border-[#0D5C63]/60 p-2.5 rounded-lg flex flex-col gap-1.5 shadow-md">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[#22d3ee] uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
                  <span>🖌️</span> Brush Size:
                </span>
                <span className="text-cyan-300 font-mono font-bold text-[11px] bg-cyan-950/80 px-1.5 py-0.5 rounded border border-[#0D5C63]/60">
                  {terrainWidth}px
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={terrainWidth}
                onChange={e => setTerrainWidth?.(Number(e.target.value))}
                className="accent-[#22d3ee] w-full cursor-pointer h-1.5 bg-[#161b22] rounded-lg"
              />
              <div className="flex gap-1 pt-0.5">
                {[15, 30, 60, 120].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setTerrainWidth?.(sz)}
                    className={`flex-1 py-1 text-[10px] rounded border font-bold transition-all ${
                      terrainWidth === sz
                        ? 'border-[#22d3ee] bg-cyan-950 text-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.3)]'
                        : 'border-[#0D5C63]/40 bg-[#0d1117] text-slate-400 hover:text-white hover:border-[#22d3ee]/50'
                    }`}
                  >
                    {sz === 15 ? 'Small' : sz === 30 ? 'Med' : sz === 60 ? 'Large' : 'Huge'}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">Catalog Scale:</label>
              <select
                value={selectedCatalogScale}
                onChange={e => setSelectedCatalogScale(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1 rounded text-xs outline-none focus:border-[#22d3ee] relative z-10"
              >
                {MAP_TYPES.map(st => (
                  <option key={st} value={st}>{st} Scale</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search terrains..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#0d1117] border border-[#0D5C63]/50 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
            />

            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]">
              Terrain Brushes ({filteredTerrains.length}):
            </span>

            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredTerrains.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTerrain(t)}
                  className={`py-2 px-2.5 text-xs rounded text-left flex flex-col gap-1 border transition-all ${
                    selectedTerrain.id === t.id
                      ? 'border-[#22d3ee] font-bold bg-cyan-950/90 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'border-[#0D5C63]/40 bg-[#0d1117]/70 text-slate-300 hover:border-[#22d3ee]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {t.textureUrl ? (
                      <div className="w-4 h-4 rounded overflow-hidden border border-cyan-500/60 shrink-0">
                        <img src={t.textureUrl} alt={t.label} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm shrink-0" style={{ backgroundColor: t.color }}></span>
                    )}
                    <span className="truncate">{t.label}</span>
                    {t.isCustom && (
                      <span className="text-[8px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 py-0.2 rounded font-mono uppercase ml-auto">
                        Custom
                      </span>
                    )}
                  </div>
                  {t.desc && (
                    <span className="text-[10px] text-slate-400 font-normal leading-tight line-clamp-2">
                      {t.desc}
                    </span>
                  )}
                  {t.engineProps && (
                    <span className="text-[9px] text-cyan-400 font-mono italic">
                      ⚙️ {t.engineProps}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'object':
        return (
          <div className="flex flex-col gap-2.5">
            {/* Quick Asset Manager Shortcut Button */}
            {onOpenAssetManager && (
              <button
                onClick={onOpenAssetManager}
                className="w-full py-1.5 px-2 bg-cyan-950/80 hover:bg-cyan-900 text-[#22d3ee] border border-[#22d3ee]/60 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(34,211,238,0.25)]"
              >
                <span>📦</span> Manage / Create Assets...
              </button>
            )}

            {/* Scale Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">Catalog Scale:</label>
              <select
                value={selectedCatalogScale}
                onChange={e => {
                  setSelectedCatalogScale(e.target.value);
                  setSelectedCategory('All');
                }}
                className="w-full bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1 rounded text-xs outline-none focus:border-[#22d3ee] relative z-10"
              >
                {MAP_TYPES.map(st => (
                  <option key={st} value={st}>{st} Scale</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">Category:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1 rounded text-xs outline-none focus:border-[#22d3ee]"
              >
                {activeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search objects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#0d1117] border border-[#0D5C63]/50 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
            />

            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]">
              Placeable Assets ({filteredObjects.length}):
            </span>

            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredObjects.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedObjectType(o)}
                  className={`py-2 px-2.5 text-xs rounded text-left flex flex-col gap-1 border transition-all ${
                    selectedObjectType.id === o.id
                      ? 'border-[#22d3ee] font-bold bg-cyan-950/90 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'border-[#0D5C63]/40 bg-[#0d1117]/70 text-slate-300 hover:border-[#22d3ee]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {o.imageUrl ? (
                        <div className="w-4 h-4 rounded overflow-hidden border border-cyan-500/60 p-0.5 shrink-0 bg-[#0d1117]">
                          <img src={o.imageUrl} alt={o.label} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <span className="w-3.5 h-3.5 rounded border border-white/40 shadow-sm shrink-0" style={{ backgroundColor: o.color }}></span>
                      )}
                      <span className="truncate">{o.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {o.isCustom && (
                        <span className="text-[8px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 py-0.2 rounded font-mono uppercase">
                          Custom
                        </span>
                      )}
                      {o.scaleTarget && (
                        <span className="text-[9px] bg-amber-950 text-amber-300 px-1 py-0.2 rounded border border-amber-800 shrink-0">
                          {o.scaleTarget}
                        </span>
                      )}
                    </div>
                  </div>
                  {o.desc && (
                    <span className="text-[10px] text-slate-400 font-normal leading-tight line-clamp-2">
                      {o.desc}
                    </span>
                  )}
                  {o.hazard && (
                    <span className="text-[9px] text-red-400 font-mono">
                      ⚠️ {o.hazard}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'pencil':
        return (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]">Color:</span>
            <div className="flex gap-1.5 flex-wrap">
              {PENCIL_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setPencilColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${pencilColor === c ? 'border-[#22d3ee] scale-110 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider mt-1 drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]">Width:</span>
            <div className="flex gap-1 flex-wrap">
              {PENCIL_WIDTHS.map(w => (
                <button
                  key={w}
                  onClick={() => setPencilWidth(w)}
                  className={`px-2 py-1 text-xs rounded border transition-all ${
                    pencilWidth === w
                      ? 'border-[#22d3ee] bg-cyan-950/80 text-[#22d3ee] font-bold shadow-[0_0_6px_rgba(34,211,238,0.3)]'
                      : 'border-[#0D5C63]/40 bg-[#0d1117]/60 text-slate-300 hover:border-[#22d3ee]/60'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>
        );

      case 'token':
        return (
          <div className="flex flex-col gap-2.5">
            {onOpenHeroDrawer && (
              <button
                type="button"
                onClick={onOpenHeroDrawer}
                className="w-full py-1.5 px-2 bg-cyan-950/80 hover:bg-cyan-900 text-[#22d3ee] border border-[#22d3ee]/60 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(34,211,238,0.25)]"
              >
                <span>📜</span> Summon Folio Hero...
              </button>
            )}

            {onOpenOmnicortexDrawer && (
              <button
                type="button"
                onClick={onOpenOmnicortexDrawer}
                className="w-full py-1.5 px-2 bg-blue-950/80 hover:bg-blue-900 text-cyan-300 border border-cyan-500/60 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
              >
                <span>🧠</span> Browse Omnicortex Codex...
              </button>
            )}

            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]">Token Type:</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setTokenType('standard')}
                className={`py-1.5 px-2 text-xs rounded text-center border transition-all ${
                  tokenType === 'standard'
                    ? 'border-[#22d3ee] bg-cyan-950/80 text-[#22d3ee] font-bold shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : 'border-[#0D5C63]/40 bg-[#0d1117]/60 text-slate-300 hover:border-[#22d3ee]/60'
                }`}
              >
                Standard Unit
              </button>
              <button
                onClick={() => setTokenType('link')}
                className={`py-1.5 px-2 text-xs rounded text-center border transition-all ${
                  tokenType === 'link'
                    ? 'border-[#22d3ee] bg-cyan-950/80 text-[#22d3ee] font-bold shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : 'border-[#0D5C63]/40 bg-[#0d1117]/60 text-slate-300 hover:border-[#22d3ee]/60'
                }`}
              >
                Map Portal
              </button>
            </div>

            <label className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider mt-1">Unit Label:</label>
            <input
              type="text"
              value={tokenLabelInput}
              onChange={e => setTokenLabelInput(e.target.value)}
              className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
            />
            <button
              onClick={onOpenOmnicortexLink}
              className={`mt-2 p-1.5 rounded text-xs font-bold transition-colors ${tokenOmnicortexData ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50' : 'bg-[#0F172A] text-slate-400 border border-slate-700 hover:bg-[#1E293B]'}`}
            >
              {tokenOmnicortexData ? 'Linked to OMNICORTEX' : 'Link OMNICORTEX Stats'}
            </button>
          </div>
        );

      case 'text':
        return (
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">Text Label:</label>
            <input
              type="text"
              value={textLabelInput}
              onChange={e => setTextLabelInput(e.target.value)}
              className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
            />
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider mt-1">Text Color:</span>
            <div className="flex gap-1.5 flex-wrap">
              {TEXT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setTextColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${textColor === c ? 'border-[#22d3ee] scale-110 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider mt-1">Font Size:</span>
            <div className="flex gap-1">
              {[18, 24, 36, 48].map(s => (
                <button
                  key={s}
                  onClick={() => setTextSize(s)}
                  className={`px-2 py-1 text-xs rounded border transition-all ${
                    textSize === s
                      ? 'border-[#22d3ee] bg-cyan-950/80 text-[#22d3ee] font-bold shadow-[0_0_6px_rgba(34,211,238,0.3)]'
                      : 'border-[#0D5C63]/40 bg-[#0d1117]/60 text-slate-300 hover:border-[#22d3ee]/60'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        );

      case 'fog':
        return (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">Fog Layer:</span>
            <button
              onClick={() => setFogEnabled(!fogEnabled)}
              className={`py-1.5 px-2.5 text-xs rounded border font-bold transition-all ${
                fogEnabled
                  ? 'bg-cyan-950 border-[#22d3ee] text-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                  : 'bg-[#0d1117]/60 border-[#0D5C63]/40 text-slate-300 hover:border-[#22d3ee]/60'
              }`}
            >
              {fogEnabled ? 'Global Fog ACTIVE' : 'Enable Global Fog'}
            </button>
            <span className="text-[11px] text-slate-400 italic">Click & drag on canvas to paint dark fog paths.</span>
          </div>
        );

      case 'eraser':
        return (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase text-red-400 font-bold tracking-wider">Eraser Active</span>
            <span className="text-[11px] text-slate-400 italic">Click any object, token, line, or text label to delete it instantly.</span>
          </div>
        );

      default:
        return <span className="text-[11px] text-slate-400 italic">Select tool to move objects or drag canvas to pan map.</span>;
    }
  };

  return (
    <aside className="h-full shrink-0 flex z-30 select-none font-sans" aria-label="Map Studio Tools">
      {/* 48px Vertical Icon Rail Matching VTT ModuleCatalogRail */}
      <nav
        className="w-12 shrink-0 h-full border-r border-slate-800/80 bg-[#090d13] flex flex-col items-center py-2.5 gap-1.5 z-20"
        aria-label="Map Tools Rail"
      >
        {/* Core Tools */}
        <div className="flex flex-col items-center gap-1.5 flex-1 overflow-y-auto scrollbar-none w-full px-1">
          {SIDEBAR_TOOLS.map((t) => {
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTool(t.id);
                  if (isDrawerCollapsed) setIsDrawerCollapsed(false);
                }}
                className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer group ${
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

                {/* Active Left Indicator Bar */}
                {isActive && (
                  <span className="absolute -left-1 top-1.5 bottom-1.5 w-1 rounded-r bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-6 h-px bg-slate-800 my-1 shrink-0" />

        {/* Studio Drawer Shortcuts */}
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

          {onOpenLayersPanel && (
            <button
              type="button"
              onClick={onOpenLayersPanel}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-950/40 hover:text-sky-300 border border-transparent hover:border-sky-500/40 transition-all cursor-pointer"
              title="Compositor Layers"
            >
              <Layers size={17} />
            </button>
          )}
        </div>
      </nav>

      {/* Docked Collapsible Drawer Column */}
      <div
        className={`h-full border-r border-slate-800/80 bg-[#0c1017] transition-all duration-200 flex flex-col overflow-hidden ${
          isDrawerCollapsed ? 'w-0 border-r-0' : 'w-72 sm:w-80'
        }`}
      >
        {/* Drawer Header with collapse toggle */}
        <div className="h-11 px-3 border-b border-slate-800/80 bg-[#0a0e14] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider capitalize">
              {SIDEBAR_TOOLS.find(t => t.id === activeTool)?.label || activeTool}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerCollapsed(true)}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Collapse Panel"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 text-slate-200 scrollbar-thin">
          {renderToolSubPanel()}
        </div>
      </div>

      {/* Floating Toggle Tab when collapsed */}
      {isDrawerCollapsed && (
        <button
          type="button"
          onClick={() => setIsDrawerCollapsed(false)}
          className="relative top-3 z-30 w-6 h-8 bg-slate-900/90 border border-l-0 border-slate-700 text-cyan-400 rounded-r-md flex items-center justify-center hover:bg-slate-800 transition-all cursor-pointer shadow-md"
          title="Expand Tool Options"
        >
          <ChevronRight size={15} />
        </button>
      )}
    </aside>
  );
};

export default MapToolsPanel;
