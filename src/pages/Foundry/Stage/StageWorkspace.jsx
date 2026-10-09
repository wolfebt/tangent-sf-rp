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

import React, { useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  GitBranch, 
  Sliders, 
  ShieldAlert, 
  Code, 
  Play,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStageStore } from './stageStore';
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

  if (isMobile) {
    return <MobileTacticalBlocker operation="stage" onBack={() => onSwitchView?.('scenarios')} />;
  }

  const { 
    activeStageTab, 
    setActiveStageTab, 
    stageManifest, 
    updateStageManifest 
  } = useStageStore();

  useEffect(() => {
    if (initialTab && initialTab !== activeStageTab) {
      setActiveStageTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (boundMapId && !stageManifest.mapId) {
      updateStageManifest({ mapId: boundMapId });
    }
    if (boundStoryId && !stageManifest.storyId) {
      updateStageManifest({ storyId: boundStoryId, scenarioIds: [boundStoryId] });
    }
  }, [boundMapId, boundStoryId]);

  const tabs = [
    { id: 'setup', label: 'Setup & Binding', icon: Compass, color: 'text-purple-400' },
    { id: 'anchors', label: 'Anchors & POIs', icon: MapPin, color: 'text-cyan-400' },
    { id: 'flow', label: 'Flow & Triggers', icon: GitBranch, color: 'text-pink-400' },
    { id: 'environment', label: 'Environmentals', icon: Sliders, color: 'text-amber-400' },
    { id: 'encounters', label: 'Encounters', icon: ShieldAlert, color: 'text-red-400' },
    { id: 'scripts', label: 'Scripts & Presets', icon: Code, color: 'text-emerald-400' },
    { id: 'run', label: 'VTT Event Runner', icon: Play, color: 'text-purple-300' }
  ];

  const handleTabChange = (tabId) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveStageTab(tabId);
  };

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] flex flex-col overflow-hidden font-mono text-slate-100">
      {/* ── STAGE WORKSPACE SUB-NAVIGATION BAR ── */}
      <div className="bg-[#0a0f1d] border-b border-slate-800 p-1.5 px-3 flex items-center justify-between gap-3 shrink-0 shadow-sm">
        {/* Left: Tab Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStageTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-purple-950/80 text-purple-200 border border-purple-500/60 shadow-md shadow-purple-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
                }`}
                title={tab.label}
              >
                <Icon size={12} className={isActive ? tab.color : 'text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Stage Title & Weaver Handoff */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-bold truncate max-w-xs hidden md:inline">
            Stage: <strong className="text-purple-300">{stageManifest.title || 'Untitled'}</strong>
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
