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
  PanelRight 
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
  isGemsOpen,
  onToggleGems,
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

  const gemsCount = (universeState?.creativeState?.gems || []).length;

  const isMapTabActive = (activeView === 'scenarios' && scenarioWorkspaceTab === 'stage') || activeView === 'stage';
  const isTreeTabActive = (activeView === 'scenarios' && scenarioWorkspaceTab !== 'stage') || activeView === 'elements';
  const isArchitectTabActive = activeView === 'map' || activeView === 'map-maker';

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
          {/* Tab 1: Map */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSelectScenarioWorkspaceTab) onSelectScenarioWorkspaceTab('stage');
              else if (onSwitchView) onSwitchView('scenarios', 'stage');
            }}
            className={`px-3 py-1 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              isMapTabActive
                ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
            title="Tactical Map & Battlemap Stage"
          >
            <MapIcon size={13} className={isMapTabActive ? 'text-purple-300' : 'text-purple-400'} />
            <span>Map</span>
          </button>

          {/* Tab 2: Module Tree */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSelectScenarioWorkspaceTab) onSelectScenarioWorkspaceTab('weaver');
              else if (onSwitchView) onSwitchView('scenarios', 'weaver');
            }}
            className={`px-3 py-1 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              isTreeTabActive
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
            title="Module Tree, Wiki Elements & Manuscript Canvas"
          >
            <FolderTree size={13} className={isTreeTabActive ? 'text-cyan-300' : 'text-cyan-400'} />
            <span>Module Tree <span className="opacity-75 text-[10px] hidden md:inline">(Elements)</span></span>
          </button>

          {/* Tab 3: Architect */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onSwitchView) onSwitchView('map');
            }}
            className={`px-3 py-1 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              isArchitectTabActive
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
            title="Map Architect & Cartographic Blueprint Studio"
          >
            <Hammer size={13} className={isArchitectTabActive ? 'text-indigo-300' : 'text-indigo-400'} />
            <span>Architect</span>
          </button>

          {/* Tab 4: Gems */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              if (onToggleGems) onToggleGems(true);
            }}
            className={`px-3 py-1 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              isGemsOpen
                ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 border border-transparent'
            }`}
            title="Guidance Gems (Genre, Tone, POV, Conflict tags)"
          >
            <span>💎</span>
            <span>Gems</span>
            {gemsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {gemsCount}
              </span>
            )}
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
