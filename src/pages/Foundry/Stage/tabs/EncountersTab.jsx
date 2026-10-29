/**
 * @file EncountersTab.jsx
 * @description Encounters & Tactical Threat Roster Tab for the STAGE compiler.
 * Consolidates the OSR Two-Page tactical spread and Stage encounter rosters into the compiler workspace.
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Target, 
  Users, 
  Plus, 
  Trash2,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import OsrControlPanelDeck from '../../StoryModule/workspaces/OsrControlPanelDeck';
import { useStageStore } from '../stageStore';
import { useStoryAssets, useElementAssets } from '../../assetContracts';
import { useStory } from '../../../../context/CampaignContext';

export default function EncountersTab() {
  const { stageManifest, addEncounter, updateEncounter, removeEncounter } = useStageStore();
  const { list: scenariosList } = useStoryAssets();
  const { list: elementsList } = useElementAssets();
  const { updateStory, universeState } = useStory();

  const [encName, setEncName] = useState('');
  const [selectedAnchorId, setSelectedAnchorId] = useState('');
  const [selectedElementId, setSelectedElementId] = useState('');

  const boundScenario = scenariosList.find(s => s.id === stageManifest.storyId) || scenariosList[0] || null;
  const personasAndThreats = (elementsList || []).filter(
    e => e.type === 'Persona' || e.type === 'Encounter' || e.type === 'Hazard'
  );

  const handleCreateEncounter = () => {
    if (!encName.trim()) return;
    addEncounter({
      id: `enc-${Date.now()}`,
      name: encName.trim(),
      anchorId: selectedAnchorId || stageManifest.anchors?.[0]?.id || '',
      tokenElementIds: selectedElementId ? [selectedElementId] : [],
      active: true
    });
    setEncName('');
    setSelectedElementId('');
  };

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] overflow-y-auto p-4 md:p-6 space-y-6 font-mono text-slate-100">
      {/* Header bar */}
      <div className="p-3 px-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Encounters & Tactical Threat Matrix</span>
              {boundScenario && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {boundScenario.title}
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-400">
              Manifest-isolated Stage encounter spawners + OSR tactical spread, enemy statblocks, and DCs
            </p>
          </div>
        </div>
      </div>

      {/* Stage Manifest Encounter Spawner Roster */}
      <div className="p-4 rounded-2xl bg-[#0b1220] border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Stage Manifest Encounter Groups ({(stageManifest.encounters || []).length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">
            Synthesized as tokens at Anchor coordinates during Stage compilation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            type="text"
            value={encName}
            onChange={(e) => setEncName(e.target.value)}
            placeholder="Encounter squad title..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
          />
          <select
            value={selectedAnchorId}
            onChange={(e) => setSelectedAnchorId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
          >
            <option value="">Spawn Anchor (Default Center)</option>
            {(stageManifest.anchors || []).map(a => (
              <option key={a.id} value={a.id}>
                📍 {a.name} ({a.pos?.x ?? 0}, {a.pos?.y ?? 0})
              </option>
            ))}
          </select>
          <select
            value={selectedElementId}
            onChange={(e) => setSelectedElementId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
          >
            <option value="">Bind Persona / Threat Element...</option>
            {personasAndThreats.map(el => (
              <option key={el.id} value={el.id}>
                [{el.type}] {el.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCreateEncounter}
            disabled={!encName.trim()}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus size={13} />
            <span>Add Stage Encounter</span>
          </button>
        </div>

        {(stageManifest.encounters || []).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {(stageManifest.encounters || []).map(enc => {
              const anchor = (stageManifest.anchors || []).find(a => a.id === enc.anchorId);
              return (
                <div
                  key={enc.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                    enc.active
                      ? 'bg-slate-900/80 border-amber-500/40'
                      : 'bg-slate-950/50 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                      <span>{enc.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                        {(enc.tokenElementIds || []).length} units
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-purple-400" />
                      <span>{anchor ? anchor.name : 'Default Sector Coordinates'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateEncounter(enc.id, { active: !enc.active })}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer border ${
                        enc.active
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                      title="Toggle whether this encounter spawns during Stage compilation"
                    >
                      {enc.active ? 'Active' : 'Dormant'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEncounter(enc.id)}
                      className="p-1.5 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                      title="Remove Encounter"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {boundScenario ? (
        <OsrControlPanelDeck
          activeNode={boundScenario}
          updateStory={updateStory}
          guidanceGems={universeState?.creativeState?.gems || []}
        />
      ) : (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-2">
          <ShieldAlert size={28} className="mx-auto text-slate-700" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
            No scenario bound to this Stage.
          </p>
          <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
            Please bind a Story Scenario in the Setup tab to activate the Tactical Threat Matrix and OSR Control Spread.
          </p>
        </div>
      )}
    </div>
  );
}
