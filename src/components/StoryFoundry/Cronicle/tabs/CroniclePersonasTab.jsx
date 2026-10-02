import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function CroniclePersonasTab({
  personas,
  newPersonaName,
  setNewPersonaName,
  newPersonaRole,
  setNewPersonaRole,
  handleCreatePersona,
  handleDeletePersona,
  applyCronicleDelta,
  traitInputs,
  setTraitInputs,
  inventoryInputs,
  setInventoryInputs,
  handleAddPersonaTrait,
  handleRemovePersonaTrait,
  handleAddInventoryItem,
  handleRemoveInventoryItem,
  handleUpdateRelationship
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Add New Persona Bar */}
      <form onSubmit={handleCreatePersona} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={newPersonaName}
            onChange={(e) => setNewPersonaName(e.target.value)}
            placeholder="New Persona Name (e.g. Elara Vex)..."
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-cyan-400"
          />
        </div>
        <div className="w-48">
          <input
            type="text"
            value={newPersonaRole}
            onChange={(e) => setNewPersonaRole(e.target.value)}
            placeholder="Role (e.g. Frontier Marshal)..."
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-cyan-400"
          />
        </div>
        <button
          type="submit"
          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={13} />
          <span>Add Persona</span>
        </button>
      </form>

      {/* Personas Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(personas).map(p => (
          <div key={p.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{p.name}</span>
                  <span className="text-xs text-slate-400 font-normal">({p.role})</span>
                </h4>
                <span className="text-[10px] font-mono text-cyan-400">ID: {p.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={p.current_status || 'active'}
                  onChange={(e) => {
                    applyCronicleDelta({
                      id: `man_${Date.now()}`,
                      entityId: p.id,
                      action: 'update_status',
                      value: e.target.value
                    });
                  }}
                  className={`text-xs font-bold uppercase px-2 py-1 rounded border outline-none cursor-pointer ${
                    p.current_status === 'injured'
                      ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                      : p.current_status === 'deceased'
                      ? 'bg-red-950 text-red-300 border-red-500/60'
                      : p.current_status === 'unconscious'
                      ? 'bg-purple-950 text-purple-300 border-purple-500/60'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="injured">Injured</option>
                  <option value="unconscious">Unconscious</option>
                  <option value="deceased">Deceased</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleDeletePersona(p.id)}
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  title="Delete Persona"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Physical Traits / Injuries */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Physical Traits &amp; Injuries:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(p.acquired_physical_traits || []).map(t => (
                  <span key={t} className="px-2 py-0.5 bg-red-950/60 border border-red-500/40 text-red-300 text-[11px] rounded flex items-center gap-1 font-mono">
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemovePersonaTrait(p.id, t, 'physical')}
                      className="hover:text-red-100 cursor-pointer ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input
                  type="text"
                  value={traitInputs[`${p.id}_physical`] || ''}
                  onChange={(e) => setTraitInputs(prev => ({ ...prev, [`${p.id}_physical`]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPersonaTrait(p.id, 'physical')}
                  placeholder="+ Add physical injury / condition..."
                  className="flex-1 bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddPersonaTrait(p.id, 'physical')}
                  className="px-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Psychological Traits */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Psychological &amp; Behavioral Traits:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(p.dynamic_psychological_traits || []).map(t => (
                  <span key={t} className="px-2 py-0.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] rounded flex items-center gap-1 font-mono">
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemovePersonaTrait(p.id, t, 'psychological')}
                      className="hover:text-purple-100 cursor-pointer ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input
                  type="text"
                  value={traitInputs[`${p.id}_psychological`] || ''}
                  onChange={(e) => setTraitInputs(prev => ({ ...prev, [`${p.id}_psychological`]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPersonaTrait(p.id, 'psychological')}
                  placeholder="+ Add psychological state (e.g. Paranoia)..."
                  className="flex-1 bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddPersonaTrait(p.id, 'psychological')}
                  className="px-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Inventory Items */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Active Carried Inventory:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(p.active_inventory || []).map(item => (
                  <span key={item} className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[11px] rounded flex items-center gap-1 font-mono">
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveInventoryItem(p.id, item)}
                      className="hover:text-cyan-100 cursor-pointer ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input
                  type="text"
                  value={inventoryInputs[p.id] || ''}
                  onChange={(e) => setInventoryInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInventoryItem(p.id)}
                  placeholder="+ Add inventory item..."
                  className="flex-1 bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddInventoryItem(p.id)}
                  className="px-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Inter-character Relationships */}
            {Object.values(personas).filter(other => other.id !== p.id).length > 0 && (
              <div className="border-t border-slate-800 pt-2 flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Relational Web &amp; Affinity (-100 to +100):
                </span>
                {Object.values(personas)
                  .filter(other => other.id !== p.id)
                  .map(other => {
                    const score = p.relationship_matrix ? p.relationship_matrix[other.id] ?? 0 : 0;
                    return (
                      <div key={other.id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-300 truncate w-32">{other.name}:</span>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={score}
                          onChange={(e) => handleUpdateRelationship(p.id, other.id, e.target.value)}
                          className="flex-1 accent-amber-500 cursor-pointer"
                        />
                        <span className={`font-mono font-bold w-12 text-right ${score < 0 ? 'text-red-400' : score > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {score > 0 ? `+${score}` : score}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
