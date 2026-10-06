/**
 * @file SetupTab.jsx
 * @description Setup & Asset Binding Tab for the STAGE compiler.
 * Allows binding a foundational Map asset and Story Scenario asset to the Stage manifest.
 * Enforces manifest-only architecture: maps remain pristine and reusable across multiple stages.
 */

import React from 'react';
import { 
  Compass, 
  Map as MapIcon, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';
import { useMapAssets, useStoryAssets } from '../../assetContracts';
import { useStageStore } from '../stageStore';
import { AudioService } from '../../../../services/audioService';

export default function SetupTab() {
  const { stageManifest, updateStageManifest } = useStageStore();
  const { list: mapsList, openInEditor: openMapInEditor } = useMapAssets();
  const { list: scenariosList, openInEditor: openStoryInWeaver } = useStoryAssets();

  const boundMap = mapsList.find(m => m.id === stageManifest.mapId) || null;
  const boundScenario = scenariosList.find(s => s.id === stageManifest.storyId) || null;

  const handleSelectMap = (mapId) => {
    updateStageManifest({ mapId });
    AudioService.playTerminalBeep(1000, 0.02);
  };

  const handleSelectStory = (storyId) => {
    updateStageManifest({ 
      storyId, 
      scenarioIds: storyId ? [storyId] : [] 
    });
    AudioService.playTerminalBeep(1000, 0.02);
  };

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] overflow-y-auto p-4 md:p-6 space-y-6 font-mono text-slate-100">
      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-cyan-950/40 border border-purple-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold text-xs uppercase tracking-wider">
              Compiler Setup & Foundation
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
              Manifest-Only Isolation
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-wide">
            {stageManifest.title || 'Untitled Stage Manifest'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
            The Stage compiles a Map asset with Story scenarios, element anchors, triggers, and live variables. Map assets remain pristine and can back multiple independent Stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={stageManifest.title}
            onChange={(e) => updateStageManifest({ title: e.target.value })}
            placeholder="Stage Manifest Title..."
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 w-56 sm:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── CARD 1: BOUND MAP ASSET ── */}
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapIcon size={14} />
                <span>1. Foundational Map Asset</span>
              </span>
              {boundMap && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
                  Bound
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 font-sans">
              Select the battlemap or sector map asset that serves as the visual and spatial foundation.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Map Asset</label>
              <select
                value={stageManifest.mapId || ''}
                onChange={(e) => handleSelectMap(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-purple-500 outline-none"
              >
                <option value="">-- Choose a Map Asset --</option>
                {mapsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title || 'Untitled Map'} ({m.gridType || 'hex'}, {m.tokens?.length || 0} tokens)
                  </option>
                ))}
              </select>
            </div>

            {boundMap ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{boundMap.title}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{boundMap.gridType || 'hex'} grid</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>Lines: {boundMap.lines?.length || 0}</span>
                  <span>Tokens: {boundMap.tokens?.length || 0}</span>
                  <span>Objects: {boundMap.objects?.length || 0}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-500 text-center">
                No map bound yet. Choose a map above to activate the stage viewport.
              </div>
            )}
          </div>

          {/* Deep link button to Map Maker */}
          <div className="pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => openMapInEditor(stageManifest.mapId)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ExternalLink size={12} />
              <span>Open in Map Maker</span>
            </button>
          </div>
        </div>

        {/* ── CARD 2: BOUND STORY SCENARIO ── */}
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} />
                <span>2. Foundational Story Scenario</span>
              </span>
              {boundScenario && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                  Bound
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 font-sans">
              Select the primary story scenario or narrative chapter that feeds sensory read-aloud and scene beats.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Story Scenario</label>
              <select
                value={stageManifest.storyId || ''}
                onChange={(e) => handleSelectStory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="">-- Choose a Story Scenario --</option>
                {scenariosList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || 'Untitled Scenario'}
                  </option>
                ))}
              </select>
            </div>

            {boundScenario ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{boundScenario.title}</span>
                  <span className="text-[10px] text-cyan-400 font-bold">Active Story</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">
                  {boundScenario.content?.replace(/<[^>]+>/g, ' ') || 'No prose content.'}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-500 text-center">
                No scenario bound yet. Choose a story scenario to link narrative beats.
              </div>
            )}
          </div>

          {/* Deep link button to Weaver */}
          <div className="pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => openStoryInWeaver(stageManifest.storyId)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ExternalLink size={12} />
              <span>Open in Story Weaver</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
