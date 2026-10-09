/**
 * @file ADETopToolbar.jsx
 * @description Streamlined Glass-Cockpit Top Navigation Toolbar for ADE.
 * Orchestrates:
 *   - Left: ToolbarProjectMenu (Project Switcher, File I/O, Cloud Sync)
 *   - Center: ToolbarBreadcrumb (Studio Context & Scenario navigation)
 *   - Right: ToolbarQuickActions (Studio Mode, Perspective, Deployment, Fast-Access Modals, Dock toggle)
 *   - Modal: NewStoryModal
 */

import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  FolderTree, 
  Hammer, 
  Sparkles, 
  Sliders, 
  PanelRightClose, 
  PanelRight,
  Tv2
} from 'lucide-react';
import { useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { useAdeStore } from '../store/adeStore';
import { useShallow } from 'zustand/react/shallow';
import { AudioService } from '../../../services/audioService';
import ToolbarProjectMenu from './toolbar/ToolbarProjectMenu';
import NewStoryModal from './toolbar/NewStoryModal';

export default function ADETopToolbar({
  activeView,
  scenarioWorkspaceTab = 'weaver',
  onSwitchView,
  onSelectScenarioWorkspaceTab,
  // Modals & Panels
  isScratchbookOpen,
  onToggleScratchbook,
  isPrintModalOpen,
  onTogglePrintModal,
  isCatalogOpen,
  onToggleCatalog,
  isGuideOpen,
  onToggleGuide,
  isSettingsOpen,
  onToggleSettings,
  isCronicleOpen,
  onToggleCronicle,
  isCompilerOpen,
  onToggleCompiler,
  // Outliner toggle
  isTreeExpanded = true,
  onToggleTreeExpanded,
  // Right Cockpit Dock
  isRightDockOpen = true,
  onToggleRightDock,
  activeCockpitDeck,
  onSelectCockpitDeck,
  // Node level exports
  activeNode,
  onExportMarkdown,
  onExportPDF
}) {
  const {
    universeState,
    storyCatalog,
    openStory,
    createNewStory,
    deleteStoryProject,
    updateProjectName,
    handleSaveStory,
    handleLoadStory,
    pushUniverseToCloud,
    pullUniverseFromCloud,
    cloudSyncStatus,
    lastCloudSavedAt,
    handleClearUniverse
  } = useStory();

  const { currentUser, userHandle } = useAuth();
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);

  // Zustand Store selectors via useShallow
  const { setModal } = useAdeStore(
    useShallow((state) => ({
      setModal: state.setModal
    }))
  );

  const isWeaverTabActive = activeView === 'scenarios' && scenarioWorkspaceTab !== 'stage';
  const isMapTabActive = activeView === 'map' || activeView === 'map-maker';
  const isStageTabActive = activeView === 'stage' || (activeView === 'scenarios' && scenarioWorkspaceTab === 'stage');
  const isElementsTabActive = activeView === 'elements' || activeView === 'gallery';
  const isVttTabActive = activeView === 'vtt' || activeView === 'live_director';

  return (
    <>
      <header className="relative z-40 bg-slate-950/98 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between gap-3 select-none shadow-xl backdrop-blur-2xl font-mono shrink-0 h-12">
        {/* ── ZONE 1: PROJECT IDENTITY & SINGLE FILE PULLDOWN (Left) ── */}
        <ToolbarProjectMenu
          activeView={activeView}
          isTreeExpanded={isTreeExpanded}
          onToggleTreeExpanded={onToggleTreeExpanded}
          universeState={universeState}
          storyCatalog={storyCatalog}
          openStory={openStory}
          createNewStory={createNewStory}
          deleteStoryProject={deleteStoryProject}
          updateProjectName={updateProjectName}
          handleSaveStory={handleSaveStory}
          handleLoadStory={handleLoadStory}
          pushUniverseToCloud={pushUniverseToCloud}
          pullUniverseFromCloud={pullUniverseFromCloud}
          cloudSyncStatus={cloudSyncStatus}
          lastCloudSavedAt={lastCloudSavedAt}
          handleClearUniverse={handleClearUniverse}
          currentUser={currentUser}
          userHandle={userHandle}
          onExportMarkdown={onExportMarkdown}
          onTogglePrintModal={onTogglePrintModal}
          onToggleCatalog={onToggleCatalog}
          onToggleGuide={onToggleGuide}
          onToggleSettings={onToggleSettings}
          onOpenNewStoryModal={() => setIsNewStoryModalOpen(true)}
          onOpenModuleExport={() => setModal('moduleExport', true)}
          onOpenModuleImport={() => setModal('moduleImport', true)}
          onOpenCompiler={() => onToggleCompiler?.(true)}
        />

        {/* ── ZONE 2: TOP HORIZONTAL TABS (Center) ── */}
        <nav aria-label="ADE Studio Top Tabs" className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1 shadow-inner font-mono text-xs shrink-0">
          {/* Tab 1: Weaver */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSelectScenarioWorkspaceTab) onSelectScenarioWorkspaceTab('write');
              else if (onSwitchView) onSwitchView('scenarios', 'write');
            }}
            className={`px-3 py-1 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              isWeaverTabActive
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
            title="Story Weaver Narrative Canvas & Prose Studio"
          >
            <FolderTree size={13} className={isWeaverTabActive ? 'text-cyan-300' : 'text-cyan-400'} />
            <span>Weaver</span>
          </button>

          {/* Tab 2: Map (Desktop Workstation Only) */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSwitchView) onSwitchView('map');
            }}
            className={`hidden md:flex px-3 py-1 rounded-xl font-bold uppercase tracking-wider transition-all items-center gap-1.5 cursor-pointer ${
              isMapTabActive
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
            title="Map Architect & Cartographic Blueprint Studio (Desktop Workstation Required)"
          >
            <MapIcon size={13} className={isMapTabActive ? 'text-indigo-300' : 'text-indigo-400'} />
            <span>Map</span>
          </button>

          {/* Tab 3: Stage (Desktop Workstation Only) */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSwitchView) onSwitchView('stage', 'setup');
              else if (onSelectScenarioWorkspaceTab) onSelectScenarioWorkspaceTab('stage');
            }}
            className={`hidden md:flex px-3 py-1 rounded-xl font-bold uppercase tracking-wider transition-all items-center gap-1.5 cursor-pointer ${
              isStageTabActive
                ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
            title="Stage Compiler, Map Anchors, Triggers & Live Simulation (Desktop Workstation Required)"
          >
            <Sparkles size={13} className={isStageTabActive ? 'text-purple-300' : 'text-purple-400'} />
            <span>Stage</span>
          </button>

          {/* Tab 4: Elements */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSwitchView) onSwitchView('elements');
            }}
            className={`px-3 py-1 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              isElementsTabActive
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
            title="Story Elements Repository & Asset Forge"
          >
            <Hammer size={13} className={isElementsTabActive ? 'text-emerald-300' : 'text-emerald-400'} />
            <span>Elements</span>
          </button>

          {/* Tab 5: VTT (Desktop Workstation Only) */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSwitchView) onSwitchView('vtt');
            }}
            className={`hidden md:flex px-3 py-1 rounded-xl font-bold uppercase tracking-wider transition-all items-center gap-1.5 cursor-pointer ${
              isVttTabActive
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
            title="VTT Live Director Runtime (Desktop Workstation Required)"
          >
            <Tv2 size={13} className={isVttTabActive ? 'text-cyan-300' : 'text-cyan-400'} />
            <span>VTT</span>
          </button>
        </nav>

        {/* ── ZONE 3: DEDICATED AIME & COCKPIT CONTROLS (Right) ── */}
        <div className="flex items-center gap-2 shrink-0 font-mono">
          {/* AIME Narrative Co-Pilot Button */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1400, 0.03);
              if (activeView === 'scenarios') {
                if (onSelectCockpitDeck) onSelectCockpitDeck('aime');
                if (onToggleRightDock) onToggleRightDock(true);
              } else {
                setModal('floatingAime', true);
              }
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
              isRightDockOpen && activeCockpitDeck === 'aime'
                ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900/90 text-amber-400 hover:text-amber-200 border-amber-500/50 hover:border-amber-400 shadow-sm'
            }`}
            title="Launch AIME Narrative Co-Pilot"
          >
            <Sparkles size={13} className="text-amber-400 animate-pulse" />
            <span>AIME</span>
          </button>

          {/* Master Right Cockpit Dock Toggle */}
          {onToggleRightDock && (
            <button
              type="button"
              onClick={onToggleRightDock}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                isRightDockOpen
                  ? 'bg-cyan-950/80 border-cyan-400/80 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
              title={isRightDockOpen ? "Collapse Right Cockpit Dock (])" : "Expand Right Cockpit Dock (])"}
            >
              <Sliders size={12} className={isRightDockOpen ? 'text-cyan-400' : 'text-slate-400'} />
              <span className="hidden md:inline">COCKPIT</span>
              {isRightDockOpen ? <PanelRightClose size={13} /> : <PanelRight size={13} />}
            </button>
          )}
        </div>
      </header>

      {/* Styled New Story Module Creation Modal */}
      <NewStoryModal
        isOpen={isNewStoryModalOpen}
        onClose={() => setIsNewStoryModalOpen(false)}
        onCreateStory={createNewStory}
      />
    </>
  );
}
