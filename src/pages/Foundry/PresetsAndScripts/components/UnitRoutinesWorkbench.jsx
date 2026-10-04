/**
 * @file UnitRoutinesWorkbench.jsx
 * @description Pillar 3: Unit Behavioral Routines Workbench.
 * Configures autonomous VTT unit scripts (waypoint patrols, sentry vision cones, ambush stalkers, comms barks)
 * and relational dynamics for Persona assets with 1-click AIME AI synthesis.
 */

import React from 'react';
import { Bot, Sparkles, MapPin, Eye, Radio, Shield, Swords, AlertCircle } from 'lucide-react';
import { NpcScriptBuilder } from '../../ElementForge/components/NpcScriptBuilder';
import { AudioService } from '../../../../services/audioService';

export const UnitRoutinesWorkbench = ({
  selectedAsset = null,
  allPersonas = [],
  onSelectPersona,
  onUpdatePersonaScript,
  onNavigateToForge
}) => {
  // Determine active persona: either selectedAsset (if type === 'Persona') or the first persona available
  const activePersona = selectedAsset?.type === 'Persona' 
    ? selectedAsset.raw 
    : (allPersonas.find(p => p.id === selectedAsset?.id) || allPersonas[0] || null);

  const handleFieldChange = async (fieldName, value) => {
    if (!activePersona) return;
    const updatedFields = {
      ...(activePersona.fields || {}),
      [fieldName]: value
    };
    onUpdatePersonaScript?.(activePersona.id, updatedFields);
  };

  if (!activePersona) {
    return (
      <div className="h-full rounded-2xl bg-[#0c121e] border border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center text-2xl">
          🤖
        </div>
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          No Persona Selected
        </h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Select a Persona from the Module Assets catalog on the left to configure autonomous patrol loops, sentry vision cones, and voice barks.
        </p>
        {onNavigateToForge && (
          <button
            type="button"
            onClick={onNavigateToForge}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
          >
            Create Persona in Forge ↗
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 font-sans select-none overflow-y-auto pr-1">
      {/* ── WORKBENCH BANNER ── */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.25)] text-lg">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {activePersona.title || activePersona.name || 'Operative Unit'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">
                Tier {activePersona.fields?.mcmTier || '1'} · {activePersona.fields?.mcmRole || 'Tactical'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Program autonomous patrol waypoints, sentry vision cones, and relational directives for the live VTT.
            </p>
          </div>
        </div>

        {/* Persona Quick Switcher if multiple exist */}
        {allPersonas.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Switch Unit:</span>
            <select
              value={activePersona.id}
              onChange={(e) => {
                const target = allPersonas.find(p => p.id === e.target.value);
                if (target) onSelectPersona?.(target);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-400"
            >
              {allPersonas.map(p => (
                <option key={p.id} value={p.id}>{p.title || p.name || 'Unit'}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── CORE NPC SCRIPT BUILDER ── */}
      <div className="flex-1">
        <NpcScriptBuilder
          fields={activePersona.fields || {}}
          onFieldChange={handleFieldChange}
          elementTitle={activePersona.title || activePersona.name}
        />
      </div>
    </div>
  );
};

export default UnitRoutinesWorkbench;
