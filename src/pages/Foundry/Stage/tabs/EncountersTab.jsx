/**
 * @file EncountersTab.jsx
 * @description Encounters & Tactical Threat Roster Tab for the STAGE compiler.
 * Consolidates the OSR Two-Page tactical spread and Stage encounter rosters into the compiler workspace.
 */

import React from 'react';
import { 
  ShieldAlert, 
  Target, 
  Users, 
  Plus, 
  Sparkles, 
  Zap, 
  Activity,
  Layers
} from 'lucide-react';
import OsrControlPanelDeck from '../../StoryModule/workspaces/OsrControlPanelDeck';
import { useStageStore } from '../stageStore';
import { useStoryAssets, useElementAssets } from '../../assetContracts';
import { useStory } from '../../../../context/CampaignContext';

export default function EncountersTab() {
  const { stageManifest, addEncounter, updateEncounter, removeEncounter } = useStageStore();
  const { list: scenariosList } = useStoryAssets();
  const { updateStory, universeState } = useStory();

  const boundScenario = scenariosList.find(s => s.id === stageManifest.storyId) || scenariosList[0] || null;

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] overflow-y-auto p-4 md:p-6 space-y-6 font-mono text-slate-100">
      {/* Header bar */}
      <div className="p-3 px-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Encounters & Tactical Threat Matrix</span>
              {boundScenario && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {boundScenario.title}
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-400">
              OSR tactical spread, enemy statblocks, DCs, and classified discoveries
            </p>
          </div>
        </div>
      </div>

      {boundScenario ? (
        <OsrControlPanelDeck
          activeNode={boundScenario}
          updateStory={updateStory}
          guidanceGems={universeState?.creativeState?.gems || []}
        />
      ) : (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-2">
          <ShieldAlert size={28} className="mx-auto text-slate-700" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
            No scenario bound to this Stage.
          </p>
          <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
            Please bind a Story Scenario in the Setup tab to activate the Tactical Threat Matrix and OSR Control Spread.
          </p>
        </div>
      )}
    </div>
  );
}
