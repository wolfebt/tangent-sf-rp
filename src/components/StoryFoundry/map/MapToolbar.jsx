import React, { useRef, useState, useEffect } from 'react';
import { useCampaign } from '../../../context/CampaignContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';

const MapToolbar = ({
  setIsModalOpen,
  undoStack,
  redoStack,
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
  onSaveMapToFile,
  onLoadMapFromFile,
  onDeleteActiveMap,
  onOpenGuide
}) => {
  const { universeState, activeMapId, setActiveMapId, updateMap } = useCampaign();

  // Dropdown states & refs
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isMapMenuOpen, setIsMapMenuOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

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
    <div className="relative z-50 bg-[#161b22]/95 border-b border-[#0D5C63]/60 px-3 py-1.5 flex items-center gap-2 select-none shadow-md backdrop-blur-md flex-wrap">

      {/* FILE Menu Dropdown */}
      <div className="relative" ref={fileMenuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFileMenuOpen(prev => !prev);
            setIsMapMenuOpen(false);
            setIsGridMenuOpen(false);
            setIsViewMenuOpen(false);
          }}
          className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-[#22d3ee] rounded text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 h-8 cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.15)]"
        >
          <span>File Menu</span>
          <span className="text-[10px] text-slate-400 pointer-events-none">▼</span>
        </button>
        {isFileMenuOpen && (
          <div className="absolute left-0 mt-1.5 w-56 bg-[#161b22] border border-[#0D5C63] rounded-lg shadow-2xl py-1 z-50 backdrop-blur-xl text-xs">
            {onOpenAssetManager && (
              <button
                onClick={() => { onOpenAssetManager(); setIsFileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-amber-300 uppercase font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>📁</span> Map Catalog & Assets
              </button>
            )}
            {onOpenGuide && (
              <button
                onClick={() => { onOpenGuide(); setIsFileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-slate-200 uppercase font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>📖</span> User Guide & Manual
              </button>
            )}

            <div className="border-t border-[#0D5C63]/40 my-1" />

            {onSaveMapToFile && (
              <button
                onClick={() => { onSaveMapToFile(); setIsFileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-amber-300 uppercase font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>💾</span> Save Map to File
              </button>
            )}
            {onLoadMapFromFile && (
              <button
                onClick={() => { onLoadMapFromFile(); setIsFileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-amber-300 uppercase font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>📥</span> Load Map from File
              </button>
            )}

            <div className="border-t border-[#0D5C63]/40 my-1" />

            <button
              onClick={() => { onExportPNG(); setIsFileMenuOpen(false); }}
              className="w-full text-left px-4 py-2 hover:bg-cyan-950 text-cyan-300 uppercase font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>📸</span> Export Image (PNG)
            </button>
          </div>
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

      {/* Map Name Input Badge */}
      {currentMap && (
        <div className="flex items-center gap-1.5 bg-[#0d1117]/90 border border-[#0D5C63]/80 rounded px-2 py-0.5 h-8 shadow-inner">
          <span className="text-xs">🗺️</span>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider hidden sm:inline">Map Name:</span>
          <input
            type="text"
            value={currentMap.title || ''}
            onChange={(e) => updateMap(activeMapId, { title: e.target.value })}
            className="bg-transparent text-xs font-bold text-[#22d3ee] hover:text-white focus:bg-slate-900 px-1 rounded outline-none w-32 sm:w-44 transition-all truncate border-b border-transparent focus:border-cyan-400"
            placeholder="Untitled Map..."
            title="Click to rename Map"
          />
        </div>
      )}

      <div className="w-px h-6 bg-slate-700 mx-1"></div>

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

      {/* Map Name Input Badge */}
      {currentMap && (
        <div className="flex items-center gap-1.5 bg-[#0d1117]/90 border border-[#0D5C63]/80 rounded px-2 py-0.5 h-8 shadow-inner">
          <span className="text-xs">🗺️</span>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider hidden sm:inline">Map Name:</span>
          <input
            type="text"
            value={currentMap.title || ''}
            onChange={(e) => updateMap(activeMapId, { title: e.target.value })}
            className="bg-transparent text-xs font-bold text-[#22d3ee] hover:text-white focus:bg-slate-900 px-1 rounded outline-none w-32 sm:w-44 transition-all truncate border-b border-transparent focus:border-cyan-400"
            placeholder="Untitled Map..."
            title="Click to rename Map"
          />
        </div>
      )}

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

      <div className="flex-1"></div>

      {/* Right Side: Undo / Redo Buttons */}
      <div className="flex items-center gap-1">
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
      
      <button 
        className="px-3 py-1 bg-slate-800 hover:bg-red-950 text-red-400 border border-slate-700 hover:border-red-500 text-xs font-bold uppercase rounded tracking-wider h-8 ml-2 flex items-center gap-1 transition-colors" 
        onClick={() => {
          if (window.confirm("Are you sure you want to clear the entire map? This cannot be undone.")) {
            onClearMap();
          }
        }}
        title="Clear entire map canvas"
      >
        <span>🗑️</span> Clear
      </button>
    </div>
  );
};

export default MapToolbar;
