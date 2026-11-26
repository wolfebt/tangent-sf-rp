/**
 * @file ADETopToolbar.jsx
 * @description Streamlined Glass-Cockpit Top Navigation Toolbar for ADE.
 * Orchestrates:
 *   - Center: ToolbarBreadcrumb (Interactive Studio Context, Hierarchy & Scenario navigation)
 *   - Right: ToolbarQuickActions (Module Health, Dev/Live Session Mode, Architect/Operator Perspective, Split Stage, Cockpit Dock toggle)
 */

import React, { useEffect } from 'react';
import { useStory } from '../../../context/CampaignContext';
import { useAdeStore } from '../store/adeStore';
import { useShallow } from 'zustand/react/shallow';
import ToolbarBreadcrumb from './toolbar/ToolbarBreadcrumb';
import ToolbarQuickActions from './toolbar/ToolbarQuickActions';
import { useModuleHealth } from './toolbar/useModuleHealth';

export default function ADETopToolbar({
  activeView,
  scenarioWorkspaceTab = 'weaver',
  stageWorkspaceTab = 'setup',
  onSwitchView,
  onSelectScenarioWorkspaceTab,
  onSelectScenario,
  isPrintModalOpen = false,
  onTogglePrintModal,
  isArtistHubOpen = false,
  onToggleArtistHub,
  isCronicleOpen = false,
  onToggleCronicle,
  isCompilerOpen = false,
  onToggleCompiler,
  // Right Cockpit Dock
  isRightDockOpen = true,
  onToggleRightDock,
  activeCockpitDeck = 'aime',
  onSelectCockpitDeck,
  // Node level context
  activeNode,
  activeElement,
  onToggleGuide,
  onToggleSettings,
  onExportMarkdown,
  onExportPDF
}) {
  const { universeState, elementsCatalog, cronicle, activeMapId, isDirty, cloudSyncStatus } = useStory();
  const {
    studioMode,
    setStudioMode,
    perspectiveMode,
    togglePerspectiveMode,
    isSplitView,
    setIsSplitView,
    viewportSplit,
    setViewportSplit,
    isTreeExpanded,
    setIsTreeExpanded,
    setPreflightTelemetry
  } = useAdeStore(
    useShallow((s) => ({
      studioMode: s.studioMode,
      setStudioMode: s.setStudioMode,
      perspectiveMode: s.perspectiveMode,
      togglePerspectiveMode: s.togglePerspectiveMode,
      isSplitView: s.isSplitView,
      setIsSplitView: s.setIsSplitView,
      viewportSplit: s.viewportSplit,
      setViewportSplit: s.setViewportSplit,
      isTreeExpanded: s.isTreeExpanded,
      setIsTreeExpanded: s.setIsTreeExpanded,
      setPreflightTelemetry: s.setPreflightTelemetry
    }))
  );

  const moduleHealth = useModuleHealth(universeState, elementsCatalog);

  useEffect(() => {
    if (moduleHealth && setPreflightTelemetry) {
      setPreflightTelemetry(moduleHealth);
    }
  }, [moduleHealth, setPreflightTelemetry]);

  const storyTitle = universeState?.projectName || universeState?.storyTitle || universeState?.name || universeState?.title || 'Story Module';

  return (
    <header className="relative z-40 bg-slate-950/98 border-b border-cyan-500/30 px-2 sm:px-3 py-1.5 flex items-center justify-between gap-1.5 sm:gap-3 select-none shadow-xl backdrop-blur-2xl font-mono shrink-0 h-12 overflow-x-auto no-scrollbar">
      {/* ── ZONE 1: NODE EXPORT & STUDIO PREF SHORTCUTS ── */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {activeNode && onExportMarkdown && (
          <button
            type="button"
            onClick={onExportMarkdown}
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Export active node as Markdown (.md)"
          >
            MD
          </button>
        )}
        {activeNode && onExportPDF && (
          <button
            type="button"
            onClick={onExportPDF}
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Export active node as PDF"
          >
            PDF
          </button>
        )}
        {onToggleGuide && (
          <button
            type="button"
            onClick={() => onToggleGuide(true)}
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Open ADE Studio Guide"
          >
            Guide
          </button>
        )}
        {onToggleSettings && (
          <button
            type="button"
            onClick={() => onToggleSettings(true)}
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Open Studio Settings"
          >
            Settings
          </button>
        )}
      </div>

      {/* ── ZONE 2: INTERACTIVE BREADCRUMB & HIERARCHY NAVIGATION (Center) ── */}
      <div className="flex-1 flex items-center justify-start md:justify-center min-w-0 px-0.5 sm:px-2">
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
          isTreeExpanded={isTreeExpanded}
          onToggleTreeExpanded={() => setIsTreeExpanded(!isTreeExpanded)}
        />
      </div>

      {/* ── ZONE 3: QUICK ACTIONS & COCKPIT DOCK CONTROLS (Right) ── */}
      <ToolbarQuickActions
        activeView={activeView}
        moduleHealth={moduleHealth}
        onToggleCompiler={onToggleCompiler}
        isCompilerOpen={isCompilerOpen}
        studioMode={studioMode}
        setStudioMode={setStudioMode}
        perspectiveMode={perspectiveMode}
        togglePerspectiveMode={togglePerspectiveMode}
        isSplitView={isSplitView}
        setIsSplitView={setIsSplitView}
        viewportSplit={viewportSplit}
        setViewportSplit={setViewportSplit}
        targetMapId={activeNode?.mapId || activeMapId}
        universeState={universeState}
        activeNode={activeNode}
        pendingCronicleCount={cronicle?.pendingDeltas?.length || 0}
        isCronicleOpen={isCronicleOpen}
        onToggleCronicle={onToggleCronicle}
        isPrintModalOpen={isPrintModalOpen}
        onTogglePrintModal={onTogglePrintModal}
        isArtistHubOpen={isArtistHubOpen}
        onToggleArtistHub={onToggleArtistHub}
        isRightDockOpen={isRightDockOpen}
        onToggleRightDock={onToggleRightDock}
        activeCockpitDeck={activeCockpitDeck}
        onSelectCockpitDeck={onSelectCockpitDeck}
        isDirty={isDirty}
        cloudSyncStatus={cloudSyncStatus}
      />
    </header>
  );
}
