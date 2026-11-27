/**
 * @file RunTab.jsx
 * @description In-Situ VTT Event Runner & Compiler Execution Tab for STAGE.
 * Allows the architect to compile the manifest, inspect diagnostics, adjust story environmentals
 * and variables live, dispatch sensory read-alouds, and interact with TripartiteStageView.
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Sparkles,
  Send,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Flag
} from 'lucide-react';
import { useStageStore } from '../stageStore';
import { useAdeStore } from '../../store/adeStore';
import { useMapAssets, useStoryAssets, useElementAssets } from '../../assetContracts';
import { compileStage } from '../vttModuleCompilerService';
import { useStory } from '../../../../context/CampaignContext';
import { AudioService } from '../../../../services/audioService';
import { VttEventBus } from '../../../../utils/vttEventBus';

// Lazy load TripartiteStageView
const TripartiteStageView = lazy(() => import('../../../../components/VTT/TripartiteStageView'));

export default function RunTab() {
  const { stageManifest, updateEnvironment, setStageVariable, removeStageVariable } = useStageStore();
  const { list: mapsList } = useMapAssets();
  const { list: scenariosList } = useStoryAssets();
  const { list: elementsList } = useElementAssets();
  const { universeState, saveStageManifest } = useStory();

  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledPayload, setCompiledPayload] = useState(null);
  const [compilerStatus, setCompilerStatus] = useState(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [broadcasted, setBroadcasted] = useState(false);
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarVal, setNewVarVal] = useState('true');

  const boundMap = mapsList.find((m) => m.id === stageManifest.mapId) || mapsList[0] || null;
  const boundScenario = scenariosList.find((s) => s.id === stageManifest.storyId) || scenariosList[0] || null;

  // Auto-compile manifest into runtime bundle on mount or manifest updates
  useEffect(() => {
    try {
      const compiled = compileStage({
        manifest: stageManifest,
        mapAsset: boundMap,
        storyAsset: boundScenario,
        elementsCatalog: elementsList,
        universeState
      });
      setCompiledPayload(compiled);
      setCompilerStatus({
        success: compiled.validation?.valid ?? true,
        errors: compiled.validation?.errors || [],
        warnings: compiled.validation?.warnings || []
      });
    } catch (err) {
      setCompilerStatus({
        success: false,
        errors: [err?.message || 'Compilation error'],
        warnings: []
      });
    }
  }, [stageManifest, boundMap, boundScenario, elementsList, universeState]);

  const handleCompile = () => {
    setIsCompiling(true);
    AudioService.playTerminalBeep(1200, 0.04);

    try {
      const compiled = compileStage({
        manifest: stageManifest,
        mapAsset: boundMap,
        storyAsset: boundScenario,
        elementsCatalog: elementsList,
        universeState
      });
      setCompiledPayload(compiled);
      setCompilerStatus({
        success: compiled.validation?.valid ?? true,
        errors: compiled.validation?.errors || [],
        warnings: compiled.validation?.warnings || []
      });
      AudioService.playCriticalChime(true);
    } catch (err) {
      console.error('Stage Compilation failed:', err);
      setCompilerStatus({
        success: false,
        errors: [err?.message || 'Compilation failed'],
        warnings: []
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleBroadcastReadAloud = () => {
    if (!boundScenario) return;
    const text = boundScenario.content?.replace(/<[^>]+>/g, ' ').trim() || boundScenario.title;
    AudioService.playCriticalChime(true);
    setBroadcasted(true);

    VttEventBus.emit('chat-message', {
      sender: 'ARCHITECT DIRECTIVE',
      text,
      type: 'narration',
      timestamp: new Date().toLocaleTimeString()
    });

    setTimeout(() => setBroadcasted(false), 2200);
  };

  const handleLiveLighting = (mode) => {
    updateEnvironment({
      lighting: {
        ...(stageManifest.environment?.lighting || {}),
        mode
      }
    });
    AudioService.playTerminalBeep(980, 0.02);
    VttEventBus.emit('change-lighting-mode', { mode });
  };

  const handleSetVariable = (e) => {
    e.preventDefault();
    const key = newVarKey.trim().toUpperCase().replace(/\s+/g, '_');
    if (!key) return;
    let parsed = newVarVal.trim();
    if (parsed.toLowerCase() === 'true') parsed = true;
    else if (parsed.toLowerCase() === 'false') parsed = false;
    else if (parsed !== '' && !isNaN(Number(parsed))) parsed = Number(parsed);
    setStageVariable(key, parsed);
    useAdeStore.getState().setStoryFlag?.(key, parsed);
    setNewVarKey('');
    setNewVarVal('true');
  };

  const errorsCount = compilerStatus?.errors?.length || 0;
  const warningsCount = compilerStatus?.warnings?.length || 0;
  const hasDiagnostics = errorsCount > 0 || warningsCount > 0;
  const stageVariables = stageManifest.variables || {};

  return (
    <div className="flex-1 h-full w-full bg-[#050811] flex flex-col overflow-hidden font-mono text-slate-100 relative">
      {/* ── ARCHITECT LIVE CONTROLS STRIP ── */}
      <div className="p-2 px-4 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 shadow-md">
        {/* Left: Compile, Diagnostics & Broadcast */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCompile}
            disabled={isCompiling}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            {isCompiling ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            <span>{isCompiling ? 'Compiling...' : 'Compile Stage'}</span>
          </button>

          {boundScenario && (
            <button
              type="button"
              onClick={handleBroadcastReadAloud}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Broadcast active scenario prose to VTT narrative chat"
            >
              <Send size={12} />
              <span>{broadcasted ? 'Dispatched!' : 'Broadcast Read-Aloud'}</span>
            </button>
          )}

          {compilerStatus && (
            <button
              type="button"
              onClick={() => hasDiagnostics && setIsDiagnosticsOpen((o) => !o)}
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border cursor-pointer ${
                !compilerStatus.success || errorsCount > 0
                  ? 'bg-red-950 text-red-300 border-red-500/40'
                  : warningsCount > 0
                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
              }`}
              title="Toggle compiler diagnostics"
            >
              {compilerStatus.success && warningsCount === 0 ? (
                <CheckCircle2 size={11} />
              ) : (
                <AlertCircle size={11} />
              )}
              <span>
                {errorsCount > 0
                  ? `${errorsCount} Error${errorsCount > 1 ? 's' : ''}`
                  : warningsCount > 0
                    ? `${warningsCount} Warning${warningsCount > 1 ? 's' : ''}`
                    : 'Bundle Ready'}
              </span>
              {hasDiagnostics && (isDiagnosticsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
            </button>
          )}
        </div>

        {/* Center: Live Environmentals Quick Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-bold px-1 hidden sm:inline">Lighting:</span>
          <button
            type="button"
            onClick={() => handleLiveLighting('normal')}
            className="p-1 px-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 text-xs cursor-pointer"
            title="Normal Light"
          >
            <Sun size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleLiveLighting('dim')}
            className="p-1 px-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-300 text-xs cursor-pointer"
            title="Dim Twilight"
          >
            <Moon size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleLiveLighting('pitch_black')}
            className="p-1 px-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-purple-300 text-xs cursor-pointer"
            title="Pitch Black"
          >
            <Moon size={13} className="text-purple-400" />
          </button>
        </div>

        {/* Right: Fullscreen Launch to Standalone /stage */}
        <div className="flex items-center gap-2">
          <a
            href={`/stage?mapId=${encodeURIComponent(stageManifest.mapId || '')}&scenarioId=${encodeURIComponent(stageManifest.storyId || '')}&stageId=${encodeURIComponent(stageManifest.id || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => saveStageManifest?.(stageManifest)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            title="Open in standalone /stage window"
          >
            <Maximize2 size={12} />
            <span>Launch Standalone Stage</span>
          </a>
        </div>
      </div>

      {/* Collapsible Compiler Diagnostics Banner */}
      {isDiagnosticsOpen && hasDiagnostics && (
        <div className="px-4 py-2 bg-[#0d1324] border-b border-slate-800 text-[11px] space-y-1 shrink-0 z-10">
          {compilerStatus.errors?.map((err, idx) => (
            <div key={`err-${idx}`} className="text-red-300 flex items-center gap-1.5">
              <AlertCircle size={12} className="shrink-0" />
              <span>ERROR: {err}</span>
            </div>
          ))}
          {compilerStatus.warnings?.map((warn, idx) => (
            <div key={`warn-${idx}`} className="text-amber-300 flex items-center gap-1.5">
              <AlertCircle size={12} className="shrink-0" />
              <span>WARNING: {warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Live Stage Variables Strip */}
      <div className="px-4 py-1.5 bg-[#080d1a] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0 text-[10px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-cyan-400 font-bold uppercase flex items-center gap-1">
            <Flag size={11} />
            <span>Live Stage Vars:</span>
          </span>
          {Object.keys(stageVariables).length === 0 ? (
            <span className="text-slate-500 italic">None set</span>
          ) : (
            Object.entries(stageVariables).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200"
              >
                <span className="text-cyan-300 font-bold">{k}:</span>
                <span>{String(v)}</span>
                <button
                  type="button"
                  onClick={() => {
                    removeStageVariable(k);
                    useAdeStore.getState().removeStoryFlag?.(k);
                  }}
                  className="text-slate-500 hover:text-red-400 cursor-pointer"
                  aria-label={`Remove variable ${k}`}
                >
                  <Trash2 size={9} />
                </button>
              </span>
            ))
          )}
        </div>

        <form onSubmit={handleSetVariable} className="flex items-center gap-1.5">
          <input
            type="text"
            aria-label="Live Variable Key"
            value={newVarKey}
            onChange={(e) => setNewVarKey(e.target.value)}
            placeholder="FLAG_KEY"
            className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-slate-100 uppercase"
          />
          <input
            type="text"
            aria-label="Live Variable Value"
            value={newVarVal}
            onChange={(e) => setNewVarVal(e.target.value)}
            placeholder="Value"
            className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-slate-100"
          />
          <button
            type="submit"
            className="px-2 py-0.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold uppercase flex items-center gap-1 cursor-pointer"
          >
            <Plus size={10} />
            <span>Set Var</span>
          </button>
        </form>
      </div>

      {/* ── EMBEDDED VTT BATTLEMAP RUNTIME (TripartiteStageView) ── */}
      <div className="flex-1 w-full h-full overflow-hidden relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full w-full bg-[#050811] text-purple-400 font-mono text-xs gap-2">
              <RefreshCw size={14} className="animate-spin" />
              <span>Initializing Stage WebGPU Canvas...</span>
            </div>
          }
        >
          <TripartiteStageView
            defaultRole="architect"
            mapId={stageManifest.mapId || boundMap?.id}
            scenarioId={stageManifest.storyId || boundScenario?.id}
            compiledStage={compiledPayload}
          />
        </Suspense>
      </div>
    </div>
  );
}
