/**
 * @file ADETopToolbar.jsx
 * @description Streamlined Glass-Cockpit Top Navigation Toolbar for ADE.
 * Orchestrates:
 *   - Left: ToolbarProjectMenu (Project Switcher, File I/O, Cloud Sync)
 *   - Center: ToolbarBreadcrumb (Interactive Studio Context, Hierarchy & Scenario navigation)
 *   - Right: Quick Actions (AIME Narrative Co-Pilot & Cockpit Dock toggle)
 *   - Modal: NewStoryModal
 */

import React, { useState } from 'react';
import { useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { useAdeStore } from '../store/adeStore';
import { useShallow } from 'zustand/react/shallow';
import { AudioService } from '../../../services/audioService';
import { Sparkles, Sliders, PanelRight, PanelRightClose } from 'lucide-react';
import ToolbarProjectMenu from './toolbar/ToolbarProjectMenu';
import ToolbarBreadcrumb from './toolbar/ToolbarBreadcrumb';
import NewStoryModal from './toolbar/NewStoryModal';

export default function ADETopToolbar({
  activeView,
  scenarioWorkspaceTab = 'weaver',
  stageWorkspaceTab = 'setup',
  onSwitchView,
  onSelectScenarioWorkspaceTab,
  onSelectScenario,
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
  activeElement,
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

  const storyTitle = universeState?.storyTitle || universeState?.name || universeState?.title || 'Story Module';

  return (
    <>
      <header className="relative z-40 bg-slate-950/98 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between gap-2 sm:gap-3 select-none shadow-xl backdrop-blur-2xl font-mono shrink-0 h-12">
        {/* ── ZONE 1: PROJECT IDENTITY & SINGLE FILE PULLDOWN (Left) ── */}
        <div className="flex items-center shrink-0">
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
        </div>

        {/* ── ZONE 2: INTERACTIVE BREADCRUMB & HIERARCHY NAVIGATION (Center) ── */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-1 sm:px-2">
          <ToolbarBreadcrumb
            activeView={activeView}
            scenarioWorkspaceTab={scenarioWorkspaceTab}
            stageWorkspaceTab={stageWorkspaceTab}
            activeNode={activeNode}
            activeElement={activeElement}
            storyTitle={storyTitle}
            scenarios={universeState?.scenarios}
            onSwitchView={onSwitchView}
            onSelectScenarioWorkspaceTab={onSelectScenarioWorkspaceTab}
            onSelectScenario={onSelectScenario}
          />
        </div>

        {/* ── ZONE 3: COCKPIT ACTIONS & DOCK CONTROLS (Right) ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 font-mono">
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
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
              isRightDockOpen && activeCockpitDeck === 'aime'
                ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900/90 text-amber-400 hover:text-amber-200 border-amber-500/50 hover:border-amber-400 shadow-sm'
            }`}
            title="Launch AIME Narrative Co-Pilot"
          >
            <Sparkles size={13} className="text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">AIME</span>
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
