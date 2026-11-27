/**
 * @file ScriptsTab.jsx
 * @description Presets & Automation Scripts Tab for the STAGE compiler.
 * Allows binding saved scripts onto StageManifest.macros alongside the full PresetsAndScriptsDashboard.
 */

import React, { useState } from 'react';
import { Code2, Plus, Trash2 } from 'lucide-react';
import PresetsAndScriptsDashboard from '../../PresetsAndScripts/PresetsAndScriptsDashboard';
import { useStageStore } from '../stageStore';
import { useStory } from '../../../../context/CampaignContext';

export default function ScriptsTab({ onBackToStory }) {
  const { stageManifest, addMacro, removeMacro } = useStageStore();
  const { universeState } = useStory();
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [bindEvent, setBindEvent] = useState('manual');

  const savedScripts = Array.isArray(universeState?.scripts) ? universeState.scripts : [];
  const boundMacros = Array.isArray(stageManifest?.macros) ? stageManifest.macros : [];

  const handleBindScript = () => {
    const idOrTitle = selectedScriptId.trim();
    if (!idOrTitle) return;
    addMacro({
      id: `macro-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      scriptId: idOrTitle,
      on: bindEvent
    });
    setSelectedScriptId('');
  };

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] overflow-hidden flex flex-col font-mono text-slate-100">
      {/* Bound Stage Macros Strip */}
      <div className="p-2.5 px-4 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-emerald-300 uppercase flex items-center gap-1.5">
            <Code2 size={13} />
            <span>Stage Manifest Macros ({boundMacros.length}):</span>
          </span>
          {boundMacros.length === 0 ? (
            <span className="text-[10px] text-slate-500 italic">None bound yet</span>
          ) : (
            boundMacros.map((m) => {
              const matched = savedScripts.find((s) => s.id === m.scriptId || s.title === m.scriptId || s.name === m.scriptId);
              return (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-200"
                >
                  <span>{matched?.title || matched?.name || m.scriptId}</span>
                  {m.on && <span className="text-[9px] text-emerald-400/80 uppercase">[{m.on}]</span>}
                  <button
                    type="button"
                    onClick={() => removeMacro(m.id)}
                    className="text-slate-400 hover:text-red-300 cursor-pointer"
                    aria-label={`Unbind macro ${m.scriptId}`}
                  >
                    <Trash2 size={10} />
                  </button>
                </span>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {savedScripts.length > 0 ? (
            <select
              aria-label="Select Script to Bind to Stage"
              value={selectedScriptId}
              onChange={(e) => setSelectedScriptId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200"
            >
              <option value="">Bind Script to Stage...</option>
              {savedScripts.map((scr) => (
                <option key={scr.id} value={scr.id}>
                  {scr.title || scr.name || scr.id}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              aria-label="Macro Script ID"
              value={selectedScriptId}
              onChange={(e) => setSelectedScriptId(e.target.value)}
              placeholder="Script ID or Title..."
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 w-40"
            />
          )}
          <select
            aria-label="Macro Trigger Mode"
            value={bindEvent}
            onChange={(e) => setBindEvent(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
          >
            <option value="manual">Manual</option>
            <option value="round_start">Round Start</option>
            <option value="scene_enter">Scene Enter</option>
          </select>
          <button
            type="button"
            onClick={handleBindScript}
            disabled={!selectedScriptId.trim()}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
          >
            <Plus size={11} />
            <span>Bind Macro</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <PresetsAndScriptsDashboard onBackToStory={onBackToStory} />
      </div>
    </div>
  );
}
