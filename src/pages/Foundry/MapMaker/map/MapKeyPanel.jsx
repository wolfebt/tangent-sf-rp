import React, { useState } from 'react';
import { MASTER_TERRAINS } from './MapConstants';
import DraggablePanel from './DraggablePanel';

const MapKeyPanel = ({
  showKeyPanel, setShowKeyPanel,
  currentMap,
  setSelectedId,
  selectedId,
  setPosition,
  scale = 1,
  stageSize = { width: 800, height: 600 }
}) => {
  const [activeTab, setActiveTab] = useState('legend'); // 'legend' or 'objects'
  const [directoryCategory, setDirectoryCategory] = useState('All'); // 'All', 'Objects', 'Units', 'Portals'
  const [searchQuery, setSearchQuery] = useState('');

  if (!showKeyPanel) return null;

  const mapScale = currentMap?.type || 'Planetary';
  const terrains = currentMap?.terrains || [];
  const objects = currentMap?.objects || [];
  const tokens = currentMap?.tokens || [];

  // Compute terrain key (legend) items - only terrains present on the current map
  const activeTerrainMap = new Map();
  terrains.forEach(t => {
    if (t.label && t.color) {
      activeTerrainMap.set(t.label, { label: t.label, color: t.color });
    }
  });

  const legendItems = Array.from(activeTerrainMap.values());

  // Combine placed objects, units, and map portals into unified directory items
  const allMapEntities = [
    ...objects.map(o => ({
      id: o.id,
      x: o.x,
      y: o.y,
      label: o.label || o.type || 'Map Object',
      category: 'Objects',
      color: o.color || '#0284c7',
      icon: '🏢',
      badge: o.scaleTarget
    })),
    ...tokens.map(t => {
      const isPortal = t.type === 'link';
      return {
        id: t.id,
        x: t.x,
        y: t.y,
        label: t.label || (isPortal ? 'Map Portal' : 'Unit Token'),
        category: isPortal ? 'Portals' : 'Units',
        color: isPortal ? '#c026d3' : (t.color || '#eab308'),
        icon: isPortal ? '🌌' : '⚔️',
        badge: isPortal ? 'Portal' : 'Unit',
        details: isPortal ? (t.targetMapId ? 'Linked' : 'Unlinked') : (t.hp ? `HP ${t.hp.current}/${t.hp.max}` : undefined)
      };
    })
  ];

  // Filter entities by category and search query
  const filteredEntities = allMapEntities.filter(item => {
    const matchesCat = directoryCategory === 'All' || item.category === directoryCategory;
    const matchesSearch = !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectEntity = (item) => {
    setSelectedId(item.id);
    if (item.x !== undefined && item.y !== undefined && setPosition) {
      const targetX = stageSize.width / 2 - item.x * scale;
      const targetY = stageSize.height / 2 - item.y * scale;
      setPosition({ x: targetX, y: targetY });
    }
  };

  const objectCount = allMapEntities.filter(e => e.category === 'Objects').length;
  const unitCount = allMapEntities.filter(e => e.category === 'Units').length;
  const portalCount = allMapEntities.filter(e => e.category === 'Portals').length;

  return (
    <DraggablePanel id="key_panel" className="absolute bottom-4 left-4 z-30 w-80 bg-[#161b22]/95 backdrop-blur-md border border-[#0D5C63] rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] p-3 flex flex-col gap-2.5 select-none max-h-[480px]">
      {/* Header Tabs */}
      <div className="drag-handle cursor-grab active:cursor-grabbing flex justify-between items-center pb-2 border-b border-[#0D5C63]/50">
        <div className="flex items-center gap-1.5 bg-[#0d1117] p-1 rounded-full border border-[#0D5C63]/60">
          <button
            onClick={() => setActiveTab('legend')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all border ${
              activeTab === 'legend'
                ? 'bg-cyan-950/80 text-[#22d3ee] border-[#22d3ee]/80 shadow-[0_0_10px_rgba(34,211,238,0.25)] ring-1 ring-cyan-500/30'
                : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            🗺️ Terrain Key ({legendItems.length})
          </button>
          <button
            onClick={() => setActiveTab('objects')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all border ${
              activeTab === 'objects'
                ? 'bg-cyan-950/80 text-[#22d3ee] border-[#22d3ee]/80 shadow-[0_0_10px_rgba(34,211,238,0.25)] ring-1 ring-cyan-500/30'
                : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            📍 Directory ({allMapEntities.length})
          </button>
        </div>

        <button
          onClick={() => setShowKeyPanel(false)}
          className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1"
          title="Close Map Key Panel"
        >
          ×
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'legend' ? (
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[380px] pr-1">
          <span className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider mb-1">
            Active Terrains & Biomes:
          </span>
          {legendItems.length === 0 ? (
            <div className="text-slate-500 text-xs italic text-center py-4 bg-[#0d1117]/50 rounded border border-[#0D5C63]/30">
              No terrains painted on this map yet.
            </div>
          ) : (
            legendItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-1.5 rounded bg-[#0d1117]/80 border border-[#0D5C63]/40 text-xs text-slate-200"
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/50 shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold truncate">{item.label}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1">
          {/* Category Filter Pills */}
          <div className="flex gap-1 bg-[#0d1117]/80 p-1 rounded border border-[#0D5C63]/40 text-[10px] font-bold">
            {[
              { id: 'All', label: `All (${allMapEntities.length})` },
              { id: 'Objects', label: `Objects (${objectCount})` },
              { id: 'Units', label: `Units (${unitCount})` },
              { id: 'Portals', label: `Portals (${portalCount})` }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setDirectoryCategory(cat.id)}
                className={`flex-1 py-0.5 rounded transition-all text-center ${
                  directoryCategory === cat.id
                    ? 'bg-cyan-950 text-[#22d3ee] border border-[#22d3ee]/60'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search placed objects, units, portals..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
          />

          {filteredEntities.length === 0 ? (
            <div className="text-xs text-slate-500 italic text-center py-4">
              {allMapEntities.length === 0 ? 'No items placed on map.' : 'No items match filter.'}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filteredEntities.map(item => {
                const isSelected = selectedId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectEntity(item)}
                    className={`p-2 rounded text-xs text-left flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'border-[#22d3ee] bg-cyan-950 text-white font-bold shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                        : 'border-[#0D5C63]/40 bg-[#0d1117]/80 text-slate-300 hover:border-[#22d3ee]/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs shrink-0">{item.icon}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex flex-col truncate">
                        <span className="truncate">{item.label}</span>
                        {item.details && (
                          <span className="text-[9px] text-slate-400 font-mono leading-none">
                            {item.details}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 font-mono font-bold ${
                      item.category === 'Portals'
                        ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                        : item.category === 'Units'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : 'bg-cyan-950/80 text-cyan-300 border-[#0D5C63]/60'
                    }`}>
                      {item.badge || item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DraggablePanel>
  );
};

export default MapKeyPanel;
