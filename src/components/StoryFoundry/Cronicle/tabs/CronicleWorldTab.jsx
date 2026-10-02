import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function CronicleWorldTab({
  locations,
  personas,
  newLocationName,
  setNewLocationName,
  newLocationState,
  setNewLocationState,
  newLocationFaction,
  setNewLocationFaction,
  handleCreateLocation,
  handleDeleteLocation,
  applyCronicleDelta,
  hazardInputs,
  setHazardInputs,
  handleAddHazard,
  handleRemoveHazard
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Add New Location Form */}
      <form onSubmit={handleCreateLocation} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="New Location Name (e.g. The Ruined Citadel)..."
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-emerald-400"
          />
        </div>
        <div className="w-40">
          <select
            value={newLocationState || 'thriving'}
            onChange={(e) => setNewLocationState(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="thriving">Thriving</option>
            <option value="under_siege">Under Siege</option>
            <option value="ruined">Ruined</option>
            <option value="rebuilding">Rebuilding</option>
          </select>
        </div>
        <div className="w-48">
          <input
            type="text"
            value={newLocationFaction}
            onChange={(e) => setNewLocationFaction(e.target.value)}
            placeholder="Faction / Sovereignty..."
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-emerald-400"
          />
        </div>
        <button
          type="submit"
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={13} />
          <span>Add Location</span>
        </button>
      </form>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(locations).map(loc => (
          <div key={loc.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{loc.name}</span>
                  <span className="text-xs text-slate-400 font-normal">[{loc.faction_control}]</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">ID: {loc.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={loc.current_geospatial_state || 'thriving'}
                  onChange={(e) => {
                    applyCronicleDelta({
                      id: `man_${Date.now()}`,
                      entityId: loc.id,
                      action: 'update_location_state',
                      value: e.target.value
                    });
                  }}
                  className={`text-xs font-bold uppercase px-2 py-1 rounded border outline-none cursor-pointer ${
                    loc.current_geospatial_state === 'ruined'
                      ? 'bg-red-950 text-red-300 border-red-500/60'
                      : loc.current_geospatial_state === 'under_siege'
                      ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                      : loc.current_geospatial_state === 'rebuilding'
                      ? 'bg-purple-950 text-purple-300 border-purple-500/60'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                  }`}
                >
                  <option value="thriving">Thriving</option>
                  <option value="under_siege">Under Siege</option>
                  <option value="ruined">Ruined</option>
                  <option value="rebuilding">Rebuilding</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleDeleteLocation(loc.id)}
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  title="Delete Location"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Environmental Hazards */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Active Environmental Hazards:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(loc.environmental_hazards || []).map(h => (
                  <span key={h} className="px-2 py-0.5 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] rounded flex items-center gap-1 font-mono">
                    {h}
                    <button
                      type="button"
                      onClick={() => handleRemoveHazard(loc.id, h)}
                      className="hover:text-amber-100 cursor-pointer ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input
                  type="text"
                  value={hazardInputs[loc.id] || ''}
                  onChange={(e) => setHazardInputs(prev => ({ ...prev, [loc.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHazard(loc.id)}
                  placeholder="+ Add hazard (e.g. Acid Rain, Radiation Leak)..."
                  className="flex-1 bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddHazard(loc.id)}
                  className="px-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Current Occupants */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Present Occupant Entities:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(loc.occupant_lists || []).map(occId => {
                  const occName = personas[occId]?.name || occId;
                  return (
                    <span key={occId} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded font-mono">
                      {occName}
                    </span>
                  );
                })}
                {(!loc.occupant_lists || loc.occupant_lists.length === 0) && (
                  <span className="text-xs text-slate-500 italic">No occupants currently recorded here.</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
