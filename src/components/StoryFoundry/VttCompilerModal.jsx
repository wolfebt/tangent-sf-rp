import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../context/CampaignContext';
import { useDBM } from '../../context/DBMContext';
import { AudioService } from '../../services/audioService';
import { VttModuleCompiler } from '../../services/vttModuleCompilerService';
import { deployCompiledPackage } from '../../utils/deployVttPackage';
import { useUILayoutStore } from '../VTT/store/uiLayoutStore';
import { AimeGuidanceButton } from './AimeGuidanceButton';
import { AimeGuidanceFlyout } from './AimeGuidanceFlyout';
import { 
  Cpu, Play, Download, CheckCircle, AlertTriangle, 
  X, RefreshCw, Shield, Swords, Flame, MapPin, Eye, Sparkles 
} from 'lucide-react';

export const VttCompilerModal = ({
  isOpen,
  onClose,
  activeScenario = null
}) => {
  const navigate = useNavigate();
  const { universeState, elementsCatalog, mapsCatalog, updateMap } = useStory();
  const { dbData } = useDBM() || { dbData: {} };

  const [compiledResult, setCompiledResult] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isAimeAuditOpen, setIsAimeAuditOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [deployStatus, setDeployStatus] = useState('');

  // Identify active map linked to scenario or default to first map
  const activeMap = useMemo(() => {
    const allMaps = [...(mapsCatalog || []), ...(universeState?.maps || [])];
    if (activeScenario?.mapId) {
      return allMaps.find(m => m.id === activeScenario.mapId) || allMaps[0] || null;
    }
    return allMaps[0] || null;
  }, [activeScenario, mapsCatalog, universeState?.maps]);

  // Execute compilation
  const runCompilation = () => {
    setIsCompiling(true);
    AudioService.playTerminalBeep(1050, 0.06);

    try {
      const result = VttModuleCompiler.compileScenarioForVtt({
        scenario: activeScenario,
        activeMap,
        elementsCatalog,
        dbData
      });
      setCompiledResult(result);
    } catch (err) {
      console.error('VTT Compilation Error:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runCompilation();
    }
  }, [isOpen, activeScenario, activeMap]);

  if (!isOpen) return null;

  const pkg = compiledResult?.package;
  const diagnostics = compiledResult?.diagnostics || { isValid: true, errors: [], warnings: [] };

  // 1-Click Launch & Deploy on Tactical Stage
  const handleLaunchToVtt = () => {
    if (!pkg || !activeMap) return;
    if (!diagnostics?.isValid) return;

    AudioService.playCriticalChime(true);

    // Deploy compiled tokens and objects directly into engine state and map
    const { tokensDeployed, objectsDeployed } = deployCompiledPackage(
      pkg,
      updateMap,
      activeMap.id
    );

    // Also populate store for stage auto-sync if re-mounting
    useUILayoutStore.getState().setLastCompiledPackage(pkg);

    setDeployStatus(`✅ Deployed ${tokensDeployed} tokens & ${objectsDeployed} objects to Stage`);

    setTimeout(() => {
      onClose();
      navigate(`/stage?mapId=${activeMap.id}&scenarioId=${activeScenario?.id || ''}`);
    }, 1000);
  };

  // Export JSON Bundle
  const handleExportJson = () => {
    if (!pkg) return;
    AudioService.playTerminalBeep(980, 0.08);

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pkg, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${pkg.manifest.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_vtt_bundle.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none font-sans">
      <div className="bg-[#0b0f19] border border-cyan-500/60 rounded-2xl shadow-[0_0_45px_rgba(6,182,212,0.3)] w-full max-w-3xl max-h-[90vh] flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-base shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              ⚙️
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-2">
                <span>VTT Module Compiler & Runtime Prep</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  Zero Mock Data
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Synthesizing Story automations, Map vectors, and Element scripts into an executable VTT bundle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AimeGuidanceButton
              onClick={() => setIsAimeAuditOpen(true)}
              label="AIME Audit"
              size="sm"
            />
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-sm transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Diagnostic Telemetry Strip */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
              <Swords size={12} className="text-purple-400" />
              <span>Staged Tokens</span>
            </div>
            <p className="text-base font-extrabold text-purple-300 font-mono">
              {pkg?.manifest.stats.totalTokens || 0}
            </p>
          </div>

          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
              <Eye size={12} className="text-cyan-400" />
              <span>Scripted NPCs</span>
            </div>
            <p className="text-base font-extrabold text-cyan-300 font-mono">
              {pkg?.manifest.stats.scriptedNpcs || 0}
            </p>
          </div>

          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
              <Flame size={12} className="text-rose-400" />
              <span>Reactive Traps</span>
            </div>
            <p className="text-base font-extrabold text-rose-300 font-mono">
              {pkg?.manifest.stats.reactiveTraps || 0}
            </p>
          </div>

          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
              <Shield size={12} className="text-amber-400" />
              <span>Wall LOS Vectors</span>
            </div>
            <p className="text-base font-extrabold text-amber-300 font-mono">
              {pkg?.manifest.stats.wallVectors || 0}
            </p>
          </div>
        </div>

        {/* Content Body: Compiler Review */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#080c14]/80 font-mono text-xs scrollbar-thin">
          {/* Active Context Details */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-cyan-300 font-bold uppercase text-[11px]">
              <span>Scenario: {activeScenario?.title || 'Standalone Tactical Sector'}</span>
              <span className="text-slate-400 text-[10px]">Map: {activeMap?.title || 'None Linked'}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              {activeScenario?.summary || activeScenario?.fields?.summary || 'Tactical mission prepped directly from authored scenarios, modular characters, and live Omnicortex compendium records.'}
            </p>
          </div>

          {/* Warnings & Diagnostics */}
          {diagnostics.warnings.length > 0 && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-1.5 text-amber-200 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold uppercase">
                <AlertTriangle size={13} className="text-amber-400" />
                <span>Compiler Diagnostics & Recommendations</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-300 text-[10px]">
                {diagnostics.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Scripted Units Inspection List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-slate-400">
              Compiled Scripted Combatants ({pkg?.automations.scriptedNpcs.length || 0})
            </h4>

            {pkg?.automations.scriptedNpcs.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-500 text-[11px]">
                No scripted NPCs detected. Open Element Forge to assign autonomous patrol or sentry routines.
              </div>
            ) : (
              pkg?.automations.scriptedNpcs.map((tok, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{tok.script.type === 'patrol' ? '🚶' : (tok.script.type === 'sentry' ? '👁️' : '🤖')}</span>
                    <div>
                      <span className="font-bold text-slate-200 block">{tok.label}</span>
                      <span className="text-[10px] text-slate-400">
                        Routine: {tok.script.type?.toUpperCase()} • Profile: {tok.behaviorProfile?.toUpperCase()} • Stance: {tok.relations?.stance || 'Hostile'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-cyan-400">
                    <span>HP {tok.health?.max} / DC {tok.defense}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
          {deployStatus && (
            <div className="w-full text-center text-xs font-mono text-emerald-400 py-1.5 px-3 bg-emerald-950/50 rounded-lg border border-emerald-500/40 animate-pulse">
              {deployStatus}
            </div>
          )}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={runCompilation}
              disabled={isCompiling}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} className={isCompiling ? 'animate-spin' : ''} />
              <span>Re-Compile</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} className={downloadSuccess ? 'text-emerald-400' : 'text-slate-400'} />
                <span>{downloadSuccess ? 'Exported!' : 'Export JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleLaunchToVtt}
                disabled={!diagnostics?.isValid || isCompiling || !pkg}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title={!diagnostics?.isValid ? 'Fix compiler errors before deploying to Stage' : 'Deploy compiled module to tactical Stage'}
              >
                <Play size={13} className="fill-slate-950" />
                <span>Deploy to Tactical Stage</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Pre-Flight AIME Scenario Audit Modal */}
      {isAimeAuditOpen && (
        <AimeGuidanceFlyout
          isOpen={isAimeAuditOpen}
          onClose={() => setIsAimeAuditOpen(false)}
          targetType="Compiler"
          contextData={{
            title: pkg?.manifest.title || 'Compiled VTT Scenario',
            fields: pkg?.manifest
          }}
        />
      )}
    </div>
  );
};

export default VttCompilerModal;
