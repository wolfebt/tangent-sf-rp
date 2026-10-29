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
  activeElement
}) {
  const { universeState, elementsCatalog, cronicle, activeMapId } = useStory();
  const {
    studioMode,
    setStudioMode,
    perspectiveMode,
    togglePerspectiveMode,
    isSplitView,
    setIsSplitView,
    viewportSplit,
    setViewportSplit,
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
      setPreflightTelemetry: s.setPreflightTelemetry
    }))
  );

  const moduleHealth = useModuleHealth(universeState, elementsCatalog);

  useEffect(() => {
    if (moduleHealth && setPreflightTelemetry) {
      setPreflightTelemetry(moduleHealth);
    }
  }, [moduleHealth, setPreflightTelemetry]);

  const storyTitle = universeState?.storyTitle || universeState?.name || universeState?.title || 'Story Module';

  return (
    <header className="relative z-40 bg-slate-950/98 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between gap-2 sm:gap-3 select-none shadow-xl backdrop-blur-2xl font-mono shrink-0 h-12">
      {/* ── ZONE 1: LEFT BALANCING SPACER ── */}
      <div className="flex items-center shrink-0" />

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
        pendingCronicleCount={cronicle?.history?.length || 0}
        isCronicleOpen={isCronicleOpen}
        onToggleCronicle={onToggleCronicle}
        isPrintModalOpen={isPrintModalOpen}
        onTogglePrintModal={onTogglePrintModal}
        isRightDockOpen={isRightDockOpen}
        onToggleRightDock={onToggleRightDock}
        activeCockpitDeck={activeCockpitDeck}
        onSelectCockpitDeck={onSelectCockpitDeck}
      />
    </header>
  );
}
