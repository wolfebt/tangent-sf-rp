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
  onOpenAssetManager,
  onOpenHeroDrawer
}) => {
  const [selectedCatalogScale, setSelectedCatalogScale] = useState(currentMapScale);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
    <>
      {/* Floating Toolbox: TOOLS */}
      {showToolsPanel && (
        <DraggablePanel id="tools" className="absolute top-4 left-4 z-30 w-44 bg-[#161b22]/90 backdrop-blur-md border border-[#0D5C63]/80 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.6)] p-3 flex flex-col gap-2 select-none">
          <div className="drag-handle cursor-grab active:cursor-grabbing flex justify-between items-center pb-1.5 border-b border-[#0D5C63]/50 mb-1">
            <h3 className="sci-fi-title-text font-bold text-xs uppercase tracking-wider drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] flex items-center gap-1.5 pointer-events-none">
              🛠️ Tools
            </h3>
            <button
              onClick={() => setShowToolsPanel(false)}
              className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1"
              title="Close Tools Box"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-0.5">
            {SIDEBAR_TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id);
                  setShowSettingsPanel(true);
                }}
                className={`w-full text-left py-2 px-3 rounded text-xs font-semibold transition-all border ${
                  activeTool === t.id
                    ? 'bg-cyan-950/90 border-[#22d3ee] text-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.3)] font-bold'
                    : 'bg-[#0d1117]/70 border-[#0D5C63]/40 text-slate-300 hover:border-[#22d3ee]/60 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </DraggablePanel>
      )}

      {/* Floating Toolbox: TOOL SETTINGS */}
      {showSettingsPanel && (
        <DraggablePanel
          id="tool_settings"
          className={`absolute top-4 ${showToolsPanel ? 'left-52' : 'left-4'} z-30 hover:z-40 focus-within:z-40 w-64 bg-[#161b22]/90 backdrop-blur-md border border-[#0D5C63]/80 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.6)] p-3 flex flex-col gap-2 select-none transition-all`}
        >
          <div className="drag-handle cursor-grab active:cursor-grabbing flex justify-between items-center pb-1.5 border-b border-[#0D5C63]/50 mb-1">
            <h3 className="sci-fi-title-text font-bold text-xs uppercase tracking-wider drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] flex items-center gap-1.5 pointer-events-none">
              ⚙️ Settings
            </h3>
            <button
              onClick={() => setShowSettingsPanel(false)}
              className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1"
              title="Close Settings Box"
            >
              ×
            </button>
          </div>
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-0.5">
            {renderToolSubPanel()}
          </div>
        </DraggablePanel>
      )}
    </>
  );
};

export default MapToolsPanel;
