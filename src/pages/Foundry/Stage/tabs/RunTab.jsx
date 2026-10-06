/**
 * @file RunTab.jsx
 * @description In-Situ VTT Event Runner & Compiler Execution Tab for STAGE.
 * Allows the architect to compile the manifest, adjust story environmentals and variables live,
 * dispatch sensory read-alouds, and interact with the embedded WebGPU stage canvas.
 */

import React, { useState, Suspense, lazy } from 'react';
import { 
  Play, 
  Sparkles, 
  Send, 
  Sun, 
  Moon, 
  CloudRain, 
  Volume2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Radio,
  Sliders,
  Maximize2
} from 'lucide-react';
import { useStageStore } from '../stageStore';
import { useMapAssets, useStoryAssets, useElementAssets } from '../../assetContracts';
import { compileStage } from '../vttModuleCompilerService';
import { useStory } from '../../../../context/CampaignContext';
import { AudioService } from '../../../../services/audioService';
import { VttEventBus } from '../../../../utils/vttEventBus';

// Lazy load TripartiteStageView
const TripartiteStageView = lazy(() => import('../../../../components/VTT/TripartiteStageView'));

export default function RunTab() {
  const { stageManifest, updateEnvironment, setStageVariable } = useStageStore();
  const { list: mapsList } = useMapAssets();
  const { list: scenariosList } = useStoryAssets();
  const { list: elementsList } = useElementAssets();
  const { universeState, activeScenarioId } = useStory();

  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledPayload, setCompiledPayload] = useState(null);
  const [compilerStatus, setCompilerStatus] = useState(null);
  const [broadcasted, setBroadcasted] = useState(false);

  const boundMap = mapsList.find(m => m.id === stageManifest.mapId) || mapsList[0] || null;
  const boundScenario = scenariosList.find(s => s.id === stageManifest.storyId) || scenariosList[0] || null;

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
        warnings: compiled.validation?.warnings || []
      });
      AudioService.playCriticalChime(true);
    } catch (err) {
      console.error('Stage Compilation failed:', err);
      setCompilerStatus({
        success: false,
        warnings: [err.message]
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
      text: text,
      type: 'narration',
      timestamp: new Date().toLocaleTimeString()
    });

    setTimeout(() => setBroadcasted(false), 2200);
  };

  const handleLiveLighting = (mode) => {
    updateEnvironment({ lighting: { mode } });
    AudioService.playTerminalBeep(980, 0.02);
    VttEventBus.emit('change-lighting-mode', { mode });
  };

  return (
    <div className="flex-1 h-full w-full bg-[#050811] flex flex-col overflow-hidden font-mono text-slate-100 relative">
      {/* ── ARCHITECT LIVE CONTROLS STRIP ── */}
      <div className="p-2 px-4 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 shadow-md">
        {/* Left: Compile & Broadcast */}
        <div className="flex items-center gap-2">
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
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              compilerStatus.success
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-red-950 text-red-300 border border-red-500/40'
            }`}>
              {compilerStatus.success ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
              <span>{compilerStatus.success ? 'Bundle Ready' : 'Compile Warning'}</span>
            </span>
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
            href={`/stage?mapId=${encodeURIComponent(stageManifest.mapId || '')}&scenarioId=${encodeURIComponent(stageManifest.storyId || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            title="Open in standalone /stage window"
          >
            <Maximize2 size={12} />
            <span>Launch Standalone Stage</span>
          </a>
        </div>
      </div>

      {/* ── EMBEDDED VTT BATTLEMAP RUNTIME (TripartiteStageView) ── */}
      <div className="flex-1 w-full h-full overflow-hidden relative">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full w-full bg-[#050811] text-purple-400 font-mono text-xs gap-2">
            <RefreshCw size={14} className="animate-spin" />
            <span>Initializing Stage WebGPU Canvas...</span>
          </div>
        }>
          <TripartiteStageView
            defaultRole="architect"
            mapId={stageManifest.mapId}
            scenarioId={stageManifest.storyId}
          />
        </Suspense>
      </div>
    </div>
  );
}
