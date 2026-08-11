import React from 'react';
import { DEFAULT_LAYERS } from './MapConstants';
import DraggablePanel from './DraggablePanel';

const MapLayersPanel = ({
  showLayersPanel, setShowLayersPanel,
  mapLayers,
  toggleLayerVisibility,
  toggleLayerLock,
  deleteCustomLayer,
  newLayerNameInput,
  setNewLayerNameInput,
  addCustomLayer
}) => {
  if (!showLayersPanel) return null;

  return (
    <DraggablePanel id="layers" className="absolute top-4 right-4 z-30 w-64 bg-[#161b22]/90 backdrop-blur-md border border-[#0D5C63]/80 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.6)] p-3 flex flex-col gap-2 select-none">
      <div className="drag-handle cursor-grab active:cursor-grabbing flex justify-between items-center pb-1.5 border-b border-[#0D5C63]/50 mb-1">
        <h3 className="sci-fi-title-text font-bold text-xs uppercase tracking-wider drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] flex items-center gap-1.5 pointer-events-none">
          🥞 Layers
        </h3>
        <button 
          onClick={() => setShowLayersPanel(false)}
          className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1"
          title="Close Layers Box"
        >
          ×
        </button>
      </div>
      <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-0.5">
        <div className="flex flex-col gap-1.5">
          {mapLayers.map((layer) => (
            <div
              key={layer.id}
              className="flex items-center justify-between p-2 rounded bg-[#0d1117]/80 border border-[#0D5C63]/50 text-xs transition-all hover:border-[#22d3ee]/50"
            >
              <div className="flex items-center gap-2 truncate pr-1">
                <button
                  onClick={() => toggleLayerVisibility(layer.id)}
                  className={`text-sm transition-colors ${layer.visible ? 'text-[#22d3ee]' : 'text-slate-600'}`}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? '👁️' : '🙈'}
                </button>
                <button
                  onClick={() => toggleLayerLock(layer.id)}
                  className={`text-sm transition-colors ${layer.locked ? 'text-red-400' : 'text-slate-500'}`}
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </button>
                <span className={`font-semibold truncate ${layer.visible ? 'text-white' : 'text-slate-500 line-through'}`}>
                  {layer.name}
                </span>
              </div>

              {!DEFAULT_LAYERS.some(dl => dl.id === layer.id) && (
                <button
                  onClick={() => deleteCustomLayer(layer.id)}
                  className="text-slate-500 hover:text-red-400 font-bold px-1"
                  title="Delete Custom Layer"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Layer Form */}
        <form onSubmit={addCustomLayer} className="mt-1 flex flex-col gap-1.5 pt-3 border-t border-[#0D5C63]/40">
          <label className="text-[10px] text-[#22d3ee] uppercase font-bold tracking-wider">New Layer Name:</label>
          <input
            type="text"
            value={newLayerNameInput}
            onChange={e => setNewLayerNameInput(e.target.value)}
            placeholder="E.g. Upper Deck"
            className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
          />
          <button
            type="submit"
            className="py-1 bg-cyan-950 border border-[#22d3ee]/60 hover:bg-cyan-900 text-[#22d3ee] font-bold text-xs rounded uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(34,211,238,0.3)]"
          >
            + Add Layer
          </button>
        </form>
      </div>
    </DraggablePanel>
  );
};

export default MapLayersPanel;
