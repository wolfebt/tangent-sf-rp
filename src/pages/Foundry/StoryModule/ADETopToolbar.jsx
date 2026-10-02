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
import { useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { useAdeStore } from '../store/adeStore';
import { useShallow } from 'zustand/react/shallow';
import ToolbarProjectMenu from './toolbar/ToolbarProjectMenu';
import ToolbarBreadcrumb from './toolbar/ToolbarBreadcrumb';
import ToolbarQuickActions from './toolbar/ToolbarQuickActions';
import NewStoryModal from './toolbar/NewStoryModal';
import { useModuleHealth } from './toolbar/useModuleHealth';

export default function ADETopToolbar({
  activeView,
  onSwitchView,
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
    elementsCatalog,
    handleClearUniverse,
    activeMapId,
    cronicle
  } = useStory();

  const { currentUser, userHandle } = useAuth();
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);

  // Zustand Store selectors via useShallow
  const {
    studioMode,
    setStudioMode,
    perspectiveMode,
    togglePerspectiveMode,
    setModal
  } = useAdeStore(
    useShallow((state) => ({
      studioMode: state.studioMode,
      setStudioMode: state.setStudioMode,
      perspectiveMode: state.perspectiveMode,
      togglePerspectiveMode: state.togglePerspectiveMode,
      setModal: state.setModal
    }))
  );

  // Compute Module Health
  const moduleHealth = useModuleHealth(universeState, elementsCatalog);

  // Associated map for Deploy to VTT
  const targetMapId = activeNode?.mapId || activeMapId || universeState?.maps?.[0]?.id || '';
  const gemsCount = (universeState?.creativeState?.gems || []).length;
  const pendingCronicleCount = cronicle?.pendingDeltas?.length || 0;

  return (
    <>
      <header className="relative z-40 bg-slate-950/98 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between gap-2 select-none shadow-xl backdrop-blur-2xl font-mono shrink-0 h-12">
        {/* ── ZONE 1: PROJECT IDENTITY & FILE OPS (Left) ── */}
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
        />

        {/* ── ZONE 2: ACTIVE STUDIO CONTEXT BREADCRUMB ── */}
        <ToolbarBreadcrumb
          activeView={activeView}
          onSwitchView={onSwitchView}
          activeNode={activeNode}
        />

        {/* ── ZONE 3: TACTICAL HUB & COCKPIT CONTROLS (Right) ── */}
        <ToolbarQuickActions
          moduleHealth={moduleHealth}
          onToggleCompiler={onToggleCompiler}
          isCompilerOpen={isCompilerOpen}
          studioMode={studioMode}
          setStudioMode={setStudioMode}
          perspectiveMode={perspectiveMode}
          togglePerspectiveMode={togglePerspectiveMode}
          targetMapId={targetMapId}
          universeState={universeState}
          activeNode={activeNode}
          gemsCount={gemsCount}
          isGemsOpen={isGemsOpen}
          onToggleGems={onToggleGems}
          pendingCronicleCount={pendingCronicleCount}
          isCronicleOpen={isCronicleOpen}
          onToggleCronicle={onToggleCronicle}
          isScratchbookOpen={isScratchbookOpen}
          onToggleScratchbook={onToggleScratchbook}
          isPrintModalOpen={isPrintModalOpen}
          onTogglePrintModal={onTogglePrintModal}
          isRightDockOpen={isRightDockOpen}
          onToggleRightDock={onToggleRightDock}
        />
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
