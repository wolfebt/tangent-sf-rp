/**
 * @file WeaverWorkspace.jsx
 * @description Consolidated Master Weaver Workspace for ADE Studio.
 * Focuses on narrative construction, granular interactive story play (Fable / Character.ai style),
 * dual-scope brainstorming, guidance gems, elements palette, and asset interconnection graph.
 *
 * Tabs:
 *   1. Write: Rich text manuscript canvas with paired AIME assistant, telemetry, and element drag-and-drop.
 *   2. Brainstorm: Dual-scope ideation for both the active story scenario AND world elements.
 *   3. Gems: Embedded Guidance Gems directive suite (genre, mood, tone, custom directives).
 *   4. Elements: World elements palette with quick drag-and-drop tokens to story prose.
 *   5. Graph: Asset interconnection graph showing relationships between elements with optional link notes.
 *   6. Play: Granular interactive story studio driven by Folio personas, decision matrix, and dice checks.
 */

import React, { useMemo } from 'react';
import { 
  ArrowRight
} from 'lucide-react';
import StoryWeaver from '../StoryModule/workspaces/StoryWeaver';
import InteractiveStoryStudio from '../StoryModule/workspaces/InteractiveStoryStudio';
import BrainstormTab from './tabs/BrainstormTab';
import GemsTab from './tabs/GemsTab';
import ElementsTab from './tabs/ElementsTab';
import WeaverGraphTab from './tabs/WeaverGraphTab';
import { useStory } from '../../../context/CampaignContext';

export default function WeaverWorkspace({
  activeNode,
  updateStory,
  activeTab = 'write',
  onSelectTab,
  onSwitchView,
  linkedMap,
  allAvailableMaps,
  setActiveScenarioId,
  handleOpenAddModal,
  handleDeleteElement,
  locationPath
}) {
  const { getActiveGemsText } = useStory();

  // Normalize legacy tab names
  const currentTab = useMemo(() => {
    if (activeTab === 'manuscript' || activeTab === 'weaver' || activeTab === 'outline' || activeTab === 'genesis') return 'write';
    if (activeTab === 'gems') return 'brainstorm';
    if (activeTab === 'interactive') return 'play';
    return activeTab || 'write';
  }, [activeTab]);

  const renderStageHandoff = () => (
    onSwitchView ? (
      <button
        type="button"
        onClick={() => onSwitchView('stage', 'setup')}
        className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
        title="Compile and launch this scenario in Stage"
      >
        <span>Compile in Stage</span>
        <ArrowRight size={11} />
      </button>
    ) : null
  );

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] flex flex-col overflow-hidden font-mono text-slate-100">
      {/* ── TAB VIEWPORTS (Switched via WEAVER branches in the left Guide Rail) ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* TAB 1: WRITE & AUTHOR (Text Canvas with AIME Co-Pilot & Drag-and-Drop) */}
        {currentTab === 'write' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#090d16]">
            <StoryWeaver
              activeNode={activeNode}
              updateStory={updateStory}
              guidanceGems={typeof getActiveGemsText === 'function' ? getActiveGemsText() : ''}
              onSelectScenarioWorkspaceTab={onSelectTab}
              handleOpenAddModal={handleOpenAddModal}
              handleDeleteElement={handleDeleteElement}
              locationPath={locationPath}
              stageHandoff={renderStageHandoff()}
            />
          </div>
        )}

        {/* TAB 2: BRAINSTORM (Dual Scope: Story Scenario & World Elements) */}
        {currentTab === 'brainstorm' && (
          <BrainstormTab
            activeNode={activeNode}
            updateStory={updateStory}
          />
        )}

        {/* TAB 3: GUIDANCE GEMS (Narrative Directives, Genre, Tone, Custom Gems) */}
        {currentTab === 'gems' && (
          <GemsTab />
        )}

        {/* TAB 4: ELEMENTS (World Elements Palette with Drag-and-Drop to Prose) */}
        {currentTab === 'elements' && (
          <ElementsTab
            activeNode={activeNode}
          />
        )}

        {/* TAB 5: ASSET GRAPH (Interconnections with Optional Link Notes) */}
        {currentTab === 'graph' && (
          <WeaverGraphTab
            activeNode={activeNode}
          />
        )}

        {/* TAB 6: INTERACTIVE PLAY (Fable / Character.ai style Interactive Story) */}
        {currentTab === 'play' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#080c14]">
            <InteractiveStoryStudio
              activeNode={activeNode}
              onSelectScenario={(id) => {
                if (typeof setActiveScenarioId === 'function') setActiveScenarioId(id);
              }}
              linkedMap={linkedMap}
              allAvailableMaps={allAvailableMaps}
              stageHandoff={renderStageHandoff()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
