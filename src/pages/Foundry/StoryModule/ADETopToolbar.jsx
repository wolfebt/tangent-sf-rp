/**
 * @file ADETopToolbar.jsx
 * @description Streamlined Glass-Cockpit Top Navigation Toolbar for ADE.
 * Orchestrates:
 *   - Center: ToolbarBreadcrumb (Interactive Studio Context, Hierarchy & Scenario navigation)
 *   - Right: Cockpit Dock toggle
 */

import React from 'react';
import { useStory } from '../../../context/CampaignContext';
import { Sliders, PanelRight, PanelRightClose } from 'lucide-react';
import ToolbarBreadcrumb from './toolbar/ToolbarBreadcrumb';

export default function ADETopToolbar({
  activeView,
  scenarioWorkspaceTab = 'weaver',
  stageWorkspaceTab = 'setup',
  onSwitchView,
  onSelectScenarioWorkspaceTab,
  onSelectScenario,
  // Right Cockpit Dock
  isRightDockOpen = true,
  onToggleRightDock,
  // Node level context
  activeNode,
  activeElement
}) {
  const { universeState } = useStory();

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

      {/* ── ZONE 3: COCKPIT DOCK CONTROLS (Right) ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 font-mono">
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
  );
}
