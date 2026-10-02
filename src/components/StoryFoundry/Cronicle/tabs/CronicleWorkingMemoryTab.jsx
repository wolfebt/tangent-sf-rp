import React from 'react';
import { MapPin, Users, Sparkles } from 'lucide-react';

export default function CronicleWorkingMemoryTab({
  workingMemory,
  updateWorkingMemory,
  locations,
  personas,
  contextPreview
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full">
      {/* Left Column: Form Settings */}
      <div className="flex-1 flex flex-col gap-4 max-w-xl">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <MapPin size={14} /> Active Location for Current Scene
          </h3>
          <select
            value={workingMemory.activeLocationId || ''}
            onChange={(e) => updateWorkingMemory({ activeLocationId: e.target.value || null })}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">-- No Active Location Selected --</option>
            {Object.values(locations).map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} [{loc.current_geospatial_state?.toUpperCase() || 'THRIVING'}]
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Users size={14} /> Active Characters Present in Scene
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {Object.values(personas).map(p => {
              const isSelected = (workingMemory.activePersonaIds || []).includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const curr = workingMemory.activePersonaIds || [];
                      const next = e.target.checked ? [...curr, p.id] : curr.filter(id => id !== p.id);
                      updateWorkingMemory({ activePersonaIds: next });
                    }}
                    className="accent-cyan-500"
                  />
                  <span className="font-bold truncate">{p.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">({p.role})</span>
                </label>
              );
            })}
            {Object.keys(personas).length === 0 && (
              <p className="text-xs text-slate-500 italic col-span-2">
                No personas registered yet. Create one in the Persona Matrix tab or clone from Aggregated Elements.
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Immediate Quest Objective &amp; Conflicts
          </h3>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Immediate Objective:</label>
            <input
              type="text"
              value={workingMemory.immediateObjective || ''}
              onChange={(e) => updateWorkingMemory({ immediateObjective: e.target.value })}
              placeholder="e.g. Infiltrate the lower hangar and extract the VIP."
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-amber-400 mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Unresolved Conflicts:</label>
            <input
              type="text"
              value={workingMemory.unresolvedConflicts || ''}
              onChange={(e) => updateWorkingMemory({ unresolvedConflicts: e.target.value })}
              placeholder="e.g. Life support failing; rival bounty hunter is already inside."
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-amber-400 mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Ephemeral Tactical Notes / Scene Directives:</label>
            <textarea
              value={workingMemory.ephemeralNotes || ''}
              onChange={(e) => updateWorkingMemory({ ephemeralNotes: e.target.value })}
              placeholder="Quick tactical modifiers, player state reminders, or active scene hooks..."
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-amber-400 mt-1 min-h-[60px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Live Context Injection Preview */}
      <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Live AIME Context Injection Stream
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            3-Tier Mathematical Budget Preview
          </span>
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          {contextPreview || 'No active context elements selected.'}
        </div>
      </div>
    </div>
  );
}
