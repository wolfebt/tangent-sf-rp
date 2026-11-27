/**
 * @file StageWorkspace.jsx
 * @description Consolidated Master STAGE Compiler Workspace for ADE Studio.
 * Replaces the fragmented tactical/graph/scripts views into a unified intelligent stage compiler.
 * Binds Map assets, Story scenarios, Element points, and Triggers to set interactions with users and map.
 * Allows the architect to adjust story environmentals, assets, encounters, and variables live,
 * and launch an in-situ or standalone VTT event.
 *
 * Tabs:
 *   1. Setup: Map and Story Scenario asset binding with manifest-only isolation.
 *   2. Anchors: Coordinates, regions, and element anchors on map.
 *   3. Flow: Scenario flow & trigger wiring graph (absorbed from VisualStoryGraph).
 *   4. Environment: Lighting, weather, soundscapes, situational modifiers, and state variables.
 *   5. Encounters: Tactical threat matrix and combat roster (absorbed from OsrControlPanelDeck).
 *   6. Scripts: Presets and QuickJS macro automations (absorbed from PresetsAndScriptsDashboard).
 *   7. Run: Live compiler execution and embedded WebGPU TripartiteStageView runtime.
 */

import React, { useEffect, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  GitBranch, 
  Sliders, 
  ShieldAlert, 
  Code, 
  Play,
  Sparkles,
  ArrowRight,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useStageStore } from './stageStore';
import { useStory } from '../../../context/CampaignContext';
import { useMapAssets, useStoryAssets } from '../assetContracts';
import { validateStageManifest } from './vttModuleCompilerService';
import { showConfirm } from '../../../context/ConfirmContext';
import SetupTab from './tabs/SetupTab';
import AnchorsTab from './tabs/AnchorsTab';
import FlowTab from './tabs/FlowTab';
import EnvironmentTab from './tabs/EnvironmentTab';
import EncountersTab from './tabs/EncountersTab';
import ScriptsTab from './tabs/ScriptsTab';
import RunTab from './tabs/RunTab';
import { AudioService } from '../../../services/audioService';
import { MobileTacticalBlocker } from '../../../components/StoryFoundry/MobileTacticalBlocker';
import { useIsMobile } from '../../../hooks/useIsMobile';

export default function StageWorkspace({
  initialTab = 'setup',
  onSwitchView,
  boundMapId,
  boundStoryId
}) {
  const isMobile = useIsMobile();

  const {
    activeStageTab,
    setActiveStageTab,
    activeStoryScopeId,
    manifestsByStory,
    stageManifest,
    isDirty,
    markClean,
    selectStage,
    createStage,
    duplicateStage,
    deleteStage,
    updateStageManifest
  } = useStageStore();
  const { saveStageManifest, universeState } = useStory();
  const { list: mapsList } = useMapAssets();
  const { list: scenariosList } = useStoryAssets();
  const scopedStages = manifestsByStory?.[activeStoryScopeId || universeState?.id || stageManifest?.storyId || 'default'] || [stageManifest];

  const validation = useMemo(() => {
    const boundMap = (mapsList || []).find((m) => m.id === stageManifest?.mapId) || null;
    const boundScenario = (scenariosList || []).find((s) => s.id === stageManifest?.storyId) || null;
    return validateStageManifest(stageManifest, boundMap, boundScenario);
  }, [stageManifest, mapsList, scenariosList]);

  useEffect(() => {
    if (isMobile) return;
    if (initialTab && initialTab !== activeStageTab) {
      setActiveStageTab(initialTab);
    }
  }, [isMobile, initialTab]);

  useEffect(() => {
    if (isMobile) return;
    if (boundMapId && !stageManifest.mapId) {
      updateStageManifest({ mapId: boundMapId });
    }
    if (boundStoryId && !stageManifest.storyId) {
      updateStageManifest({ storyId: boundStoryId, scenarioIds: [boundStoryId] });
    }
  }, [isMobile, boundMapId, boundStoryId, stageManifest.mapId, stageManifest.storyId, updateStageManifest]);

  // Auto-persist dirty StageManifest changes back into story stages collection
  useEffect(() => {
    if (!isDirty || !saveStageManifest || !stageManifest?.id) return undefined;
    const timer = setTimeout(() => {
      saveStageManifest(stageManifest);
      markClean?.();
    }, 400);
    return () => clearTimeout(timer);
  }, [isDirty, stageManifest, saveStageManifest, markClean]);

  if (isMobile) {
    return <MobileTacticalBlocker operation="stage" onBack={() => onSwitchView?.('scenarios')} />;
  }

  const tabs = [
    { id: 'setup', label: 'Setup & Binding', icon: Compass, color: 'text-purple-400' },
    { id: 'anchors', label: 'Anchors & POIs', icon: MapPin, color: 'text-cyan-400' },
    { id: 'flow', label: 'Flow & Triggers', icon: GitBranch, color: 'text-pink-400' },
    { id: 'environment', label: 'Environmentals', icon: Sliders, color: 'text-amber-400' },
    { id: 'encounters', label: 'Encounters', icon: ShieldAlert, color: 'text-red-400' },
    { id: 'scripts', label: 'Scripts & Presets', icon: Code, color: 'text-emerald-400' },
    { id: 'run', label: 'Live VTT Director', icon: Play, color: 'text-purple-300' }
  ];

  const handleTabChange = (tabId) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveStageTab(tabId);
  };

  return (
    <div className="flex-1 h-full w-full tangent-grid-bg flex flex-col overflow-hidden font-mono text-slate-100">
      {/* ── STAGE WORKSPACE SUB-NAVIGATION BAR ── */}
      <div className="bg-[#0a0f1d] border-b border-slate-800 p-1.5 px-3 flex items-center justify-between gap-3 shrink-0 shadow-sm">
        {/* Left: Tab Switcher (Staging Prep vs Live VTT Director) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStageTab === tab.id;
            const isRun = tab.id === 'run';

            return (
              <React.Fragment key={tab.id}>
                {isRun && <div className="w-px h-4 bg-purple-500/40 mx-1 shrink-0" />}
                <button
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? (isRun
                          ? 'bg-gradient-to-r from-purple-950 to-cyan-950 text-cyan-200 border border-cyan-400 shadow-md shadow-cyan-950/40'
                          : 'bg-purple-950/80 text-purple-200 border border-purple-500/60 shadow-md shadow-purple-950/40')
                      : (isRun
                          ? 'text-cyan-400/90 hover:text-cyan-200 hover:bg-cyan-950/40 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent')
                  }`}
                  title={isRun ? "Switch to Live VTT Battlemap & Director" : tab.label}
                >
                  <Icon size={12} className={isActive ? (isRun ? 'text-cyan-300' : tab.color) : (isRun ? 'text-cyan-400' : 'text-slate-500')} />
                  <span>{tab.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Stage Selector, + New, Title & Weaver Handoff */}
        <div className="flex items-center gap-2 shrink-0">
          {scopedStages.length > 0 && (
            <select
              aria-label="Active Stage Manifest"
              value={stageManifest?.id || ''}
              onChange={(e) => selectStage?.(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-purple-200 max-w-[160px]"
            >
              {scopedStages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title || s.id}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => {
              const created = createStage?.(boundMapId || stageManifest?.mapId || '', boundStoryId || universeState?.id || '');
              if (created) saveStageManifest?.(created);
            }}
            className="px-2 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-[10px] font-bold uppercase cursor-pointer"
            title="Create new Stage Manifest for this story"
          >
            + Stage
          </button>
          <button
            type="button"
            onClick={() => {
              if (!stageManifest?.id) return;
              const cloned = duplicateStage?.(stageManifest.id);
              if (cloned) saveStageManifest?.(cloned);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 cursor-pointer"
            title="Duplicate active Stage Manifest"
            aria-label="Duplicate Stage"
          >
            <Copy size={12} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!stageManifest?.id) return;
              const ok = await showConfirm({
                title: 'Delete Stage Manifest',
                message: `Delete Stage "${stageManifest.title || stageManifest.id}"?`,
                confirmText: 'Delete Stage',
                danger: true
              });
              if (ok) {
                deleteStage?.(stageManifest.id);
              }
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-300 cursor-pointer"
            title="Delete active Stage Manifest"
            aria-label="Delete Stage"
          >
            <Trash2 size={12} />
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('run')}
            className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border cursor-pointer transition-colors ${
              validation.errors.length > 0
                ? 'bg-red-950/70 border-red-500/50 text-red-300'
                : validation.warnings.length > 0
                  ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
            }`}
            title="View compiler diagnostics in Live VTT Director"
          >
            {validation.errors.length > 0 || validation.warnings.length > 0 ? (
              <AlertTriangle size={11} />
            ) : (
              <CheckCircle2 size={11} />
            )}
            <span>
              {validation.errors.length > 0
                ? `${validation.errors.length}E`
                : validation.warnings.length > 0
                  ? `${validation.warnings.length}W`
                  : 'Valid'}
            </span>
          </button>
          <span className="text-[11px] text-slate-400 font-bold truncate max-w-xs hidden lg:inline">
            The Stage VTT: <strong className="text-purple-300">{stageManifest.title || 'Untitled'}</strong>
          </span>

          {onSwitchView && (
            <button
              type="button"
              onClick={() => onSwitchView('scenarios', 'write')}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              title="Return to Story Weaver"
            >
              <span>Story Weaver</span>
              <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ── TAB VIEWPORTS ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {activeStageTab === 'setup' && <SetupTab />}
        {activeStageTab === 'anchors' && <AnchorsTab />}
        {activeStageTab === 'flow' && <FlowTab />}
        {activeStageTab === 'environment' && <EnvironmentTab />}
        {activeStageTab === 'encounters' && <EncountersTab />}
        {activeStageTab === 'scripts' && <ScriptsTab onBackToStory={() => onSwitchView?.('scenarios', 'write')} />}
        {activeStageTab === 'run' && <RunTab />}
      </div>
    </div>
  );
}
