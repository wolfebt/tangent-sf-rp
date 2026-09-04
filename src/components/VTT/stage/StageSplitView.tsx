/**
 * @file StageSplitView.tsx
 * @description Resizable Split View for the VTT Center Zone.
 * Houses the WebGPU/Pixi Canvas on one side and a tabbed secondary workspace
 * [Folio Sheet | Team Roster | Story Tree | Bestiary] on the other.
 */

import React from 'react';
import Split from 'react-split';
import { 
  FileText, 
  Users, 
  BookOpen, 
  Skull, 
  X, 
  Columns 
} from 'lucide-react';
import { ConnectedFolioTab } from '../folio/ConnectedFolioTab';
import { useFolio } from '../../../context/FolioContext';
import { useCampaign } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';

export type SplitTabType = 'folio' | 'roster' | 'story' | 'bestiary';

interface StageSplitViewProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  activeTab: SplitTabType;
  onSelectTab: (tab: SplitTabType) => void;
}

export const StageSplitView: React.FC<StageSplitViewProps> = ({
  children,
  isOpen,
  onClose,
  activeTab,
  onSelectTab
}) => {
  const folio = (useFolio() || {}) as any;
  const { universeState } = useCampaign();
  const { personaRoster, characterData } = folio;

  const rosterList = Array.isArray(personaRoster) ? personaRoster : [];
  const scenarios = universeState?.scenarios || [];
  const storyCards = universeState?.creativeState?.storyCards || [];

  if (!isOpen) {
    return <div className="w-full h-full relative overflow-hidden">{children}</div>;
  }

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* Top Split Sub-Header Navigation Bar */}
      <div className="h-8 bg-[#090d15] border-b border-slate-800 flex items-center justify-between px-3 shrink-0 select-none z-10">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-cyan-400 font-bold flex items-center gap-1">
            <Columns size={12} />
            <span>SPLIT VIEW:</span>
          </span>

          {/* Tabs */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => {
                onSelectTab('folio');
                AudioService.playTerminalBeep(900, 0.03);
              }}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'folio'
                  ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Active Persona Folio Sheet"
            >
              <FileText size={11} />
              <span>Folio Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab('roster');
                AudioService.playTerminalBeep(900, 0.03);
              }}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Team Operative Roster"
            >
              <Users size={11} />
              <span>Team Roster ({rosterList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab('story');
                AudioService.playTerminalBeep(900, 0.03);
              }}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'story'
                  ? 'bg-purple-950 border border-purple-500/50 text-purple-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Campaign Story Acts & Cards"
            >
              <BookOpen size={11} />
              <span>Story Tree</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab('bestiary');
                AudioService.playTerminalBeep(900, 0.03);
              }}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'bestiary'
                  ? 'bg-amber-950 border border-amber-500/50 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Adversary & Threat Encounters"
            >
              <Skull size={11} />
              <span>Bestiary</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            AudioService.playTerminalBeep(700, 0.04);
          }}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
          title="Close Split View"
        >
          <X size={12} />
          <span>Close</span>
        </button>
      </div>

      {/* Resizable React-Split Pane */}
      <Split
        sizes={[58, 42]}
        minSize={[350, 320]}
        gutterSize={6}
        direction="horizontal"
        className="flex-1 flex overflow-hidden split-horizontal"
      >
        {/* Left Side: The Canvas / Stage */}
        <div className="h-full w-full overflow-hidden relative">
          {children}
        </div>

        {/* Right Side: Secondary Tabbed Content */}
        <div className="h-full w-full overflow-hidden bg-[#070b14] border-l border-slate-800 flex flex-col">
          {/* Folio Sheet Tab */}
          {activeTab === 'folio' && (
            <ConnectedFolioTab />
          )}

          {/* Team Roster Tab */}
          {activeTab === 'roster' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between pb-1 border-b border-slate-800">
                <span>Team Operatives ({rosterList.length})</span>
              </div>

              {rosterList.length === 0 ? (
                <div className="p-4 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No squad operatives in roster.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {rosterList.map((hero: any, idx: number) => {
                    const hId = hero['character-doc-id'] || hero.id;
                    const isActive = characterData && (characterData['character-doc-id'] === hId || characterData.id === hId);
                    return (
                      <div
                        key={hId || idx}
                        className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                          isActive 
                            ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                            : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                            <span>{hero['char-name'] || hero.name || 'Operative'}</span>
                            {isActive && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 border border-emerald-600 text-emerald-400 font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {hero.species || 'Human'} &bull; {hero.archetype || 'Operator'} &bull; HP: {hero.health || hero['hit-points']?.max || 30}
                          </div>
                        </div>

                        {!isActive && folio.switchRosterCharacter && (
                          <button
                            type="button"
                            onClick={() => {
                              folio.switchRosterCharacter(hId);
                              AudioService.playTerminalBeep(1100, 0.05);
                            }}
                            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[10px] cursor-pointer"
                          >
                            Switch To
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Story Tree Tab */}
          {activeTab === 'story' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 pb-1 border-b border-slate-800 flex items-center justify-between">
                <span>Story Acts & Narrative Beats ({scenarios.length})</span>
              </div>

              {scenarios.length === 0 && storyCards.length === 0 ? (
                <div className="p-4 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No story arcs or narrative cards in campaign module.
                </div>
              ) : (
                <div className="space-y-2">
                  {scenarios.map((sc: any, idx: number) => (
                    <div key={sc.id || idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850">
                      <div className="font-bold text-purple-300 text-xs">{sc.title || `Act ${idx + 1}`}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{sc.description || sc.summary || 'Scenario act details.'}</div>
                    </div>
                  ))}

                  {storyCards.map((c: any, idx: number) => (
                    <div key={c.id || idx} className="p-2 rounded-lg bg-slate-950/40 border border-slate-850">
                      <div className="font-bold text-amber-300 text-[11px]">{c.title || `Beat ${idx + 1}`}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.body || c.text || 'Narrative prompt card'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bestiary Tab */}
          {activeTab === 'bestiary' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-slate-800 flex items-center justify-between">
                <span>Tactical Bestiary & Threat Encounters</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-amber-950/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">Vanguard Shocktrooper</span>
                    <span className="text-[9.5px] px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">THREAT L3</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    HP: 35 &bull; Armor DR: 8 &bull; Plasma Rifle (2d10+4 Thermal, 60ft)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-red-950/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300 text-xs">Apex Cyber-Drone Swarm</span>
                    <span className="text-[9.5px] px-1 py-0.2 rounded bg-red-950 text-red-400 border border-red-800">ELITE L4</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    HP: 50 &bull; Armor DR: 12 &bull; Gatling Autocannon (2d12+6 Kinetic, 120ft)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-purple-950/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 text-xs">Void Siphon Aberration</span>
                    <span className="text-[9.5px] px-1 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800">NEXUS L5</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    HP: 75 &bull; Armor DR: 10 &bull; Mind Rend (2d10+8 Disruption, DC 18 Save)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Split>
    </div>
  );
};
