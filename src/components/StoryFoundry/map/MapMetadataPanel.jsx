import React from 'react';
import { MAP_TYPES, SCALE_METADATA_SCHEMAS } from './MapConstants';

const MapMetadataPanel = ({
  showPanel,
  setShowPanel,
  currentMap,
  updateMap,
  universeState,
  setActiveMapId
}) => {
  if (!showPanel || !currentMap) return null;

  const currentScale = currentMap.type || 'Planetary';
  const schema = SCALE_METADATA_SCHEMAS[currentScale] || SCALE_METADATA_SCHEMAS['Planetary'];
  const metadata = currentMap.metadata || {};

  const handleFieldChange = (key, value) => {
    const nextMetadata = { ...metadata, [key]: value };
    updateMap(currentMap.id, { metadata: nextMetadata });
  };

  const handleParentLinkChange = (parentId) => {
    updateMap(currentMap.id, { parentMapId: parentId });
  };

  const parentMap = universeState.maps.find(m => m.id === currentMap.parentMapId);

  return (
    <div className="absolute top-4 right-16 z-30 hover:z-40 focus-within:z-40 w-72 bg-[#161b22]/95 backdrop-blur-md border border-[#0D5C63]/80 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.7)] p-3 flex flex-col gap-3 select-none text-slate-200">
      <div className="flex justify-between items-center pb-2 border-b border-[#0D5C63]/50">
        <h3 className="sci-fi-title-text font-bold text-xs uppercase tracking-wider text-[#22d3ee] drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] flex items-center gap-1.5">
          🌐 {schema?.title || 'Scale System Properties'}
        </h3>
        <button
          onClick={() => setShowPanel(false)}
          className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1"
          title="Close Metadata Box"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 text-xs">
        {/* Scale Identity Badge */}
        <div className="bg-[#0d1117] p-2 rounded border border-[#0D5C63]/40 flex justify-between items-center">
          <span className="text-slate-400 font-semibold">Active Scale:</span>
          <span className="font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            {currentScale}
          </span>
        </div>

        {/* Parent Map Anchor Reference */}
        <div className="flex flex-col gap-1 bg-[#0d1117]/80 p-2 rounded border border-[#0D5C63]/40">
          <label className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            Parent Scale Link (Anchor):
          </label>
          <select
            value={currentMap.parentMapId || ''}
            onChange={(e) => handleParentLinkChange(e.target.value)}
            className="w-full bg-[#161b22] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee] relative z-10"
          >
            <option value="">None (Root Node)</option>
            {universeState.maps.filter(m => m.id !== currentMap.id).map(m => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.type || 'Map'})
              </option>
            ))}
          </select>
          {parentMap && (
            <button
              onClick={() => setActiveMapId(parentMap.id)}
              className="mt-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline text-left"
            >
              ↖️ Traverse Up to Parent: {parentMap.title}
            </button>
          )}
        </div>

        {/* Dynamic Scale Fields */}
        {schema?.fields?.map(field => {
          const val = metadata[field.key] !== undefined ? metadata[field.key] : field.default;

          return (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">
                {field.label}:
              </label>

              {field.type === 'boolean' ? (
                <button
                  onClick={() => handleFieldChange(field.key, !val)}
                  className={`py-1.5 px-2.5 rounded border text-xs font-bold text-left transition-all ${
                    val
                      ? 'bg-cyan-950 border-[#22d3ee] text-[#22d3ee] shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                      : 'bg-[#0d1117] border-[#0D5C63]/40 text-slate-400'
                  }`}
                >
                  {val ? 'ACTIVE / TRUE' : 'INACTIVE / FALSE'}
                </button>
              ) : field.type === 'select' ? (
                <select
                  value={val}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee] relative z-10"
                >
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step || 1}
                  value={val}
                  onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
                />
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapMetadataPanel;
