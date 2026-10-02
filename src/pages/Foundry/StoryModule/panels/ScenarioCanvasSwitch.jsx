import React, { useState } from 'react';
import Split from 'react-split';
import { 
  BookOpen, 
  Columns, 
  Plus, 
  Trash2, 
  PanelRightClose,
  Sparkles,
  Send,
  Flag,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { getTypePillStyle } from '../../ElementForge/elementSchemas';
import StoryWeaver from '../workspaces/StoryWeaver';
import OsrControlPanelDeck from '../workspaces/OsrControlPanelDeck';
import InteractiveStoryStudio from '../workspaces/InteractiveStoryStudio';
import TacticalStageViewport from './TacticalStageViewport';
import { useAdeStore } from '../../store/adeStore';
import { useShallow } from 'zustand/react/shallow';
import { VttEventBus } from '../../../../utils/vttEventBus';
import { AudioService } from '../../../../services/audioService';

export default function ScenarioCanvasSwitch({
  activeNode,
  scenarioWorkspaceTab,
  setScenarioWorkspaceTab,
  isSplitView,
  setIsSplitView,
  perspectiveMode,
  locationPath,
  handleTitleChange,
  handleOpenAddModal,
  handleDeleteElement,
  isRightDockOpen,
  onToggleRightDock,
  updateStory,
  universeState,
  setActiveScenarioId,
  linkedMap,
  allAvailableMaps,
  setActiveMapId,
  handleCreateNewMapForElement,
  onSwitchView,
  waypointPromptData,
  executeWaypointTrigger,
  setWaypointPromptData
}) {
  const {
    studioMode,
    viewportSplit,
    setViewportSplit
  } = useAdeStore(
    useShallow((state) => ({
      studioMode: state.studioMode,
      viewportSplit: state.viewportSplit,
      setViewportSplit: state.setViewportSplit
    }))
  );

  const [completedBeats, setCompletedBeats] = useState(() => new Set());
  const [broadcastedText, setBroadcastedText] = useState(false);

  if (!activeNode && scenarioWorkspaceTab !== 'interactive') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 select-none bg-[#090d16] font-mono">
        <BookOpen size={36} className="text-slate-700" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          No Element Selected
        </h3>
        <p className="text-xs text-slate-600 max-w-sm">
          Select an element from the left Outliner tree, or create a new one to begin drafting your story.
        </p>
        <button
          onClick={() => handleOpenAddModal(null)}
          className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          + Create Element
        </button>
      </div>
    );
  }

  if (!activeNode && scenarioWorkspaceTab === 'interactive') {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#080c14] font-mono">
        <InteractiveStoryStudio
          activeNode={null}
          onSelectScenario={(id) => setActiveScenarioId(id)}
        />
      </div>
    );
  }

  // Parse scene beats for Live Session mode
  const rawBeats = activeNode?.fields?.sceneBeats || activeNode?.fields?.beats || '';
  const beatsList = typeof rawBeats === 'string'
    ? rawBeats.split('\n').map(b => b.trim()).filter(b => b.length > 0)
    : [];

  const rawReadAloud = activeNode?.content ? activeNode.content.replace(/<[^>]+>/g, ' ').trim() : '';
  const readAloudSnippet = rawReadAloud.slice(0, 280);

  const handleBroadcastReadAloud = () => {
    AudioService.playCriticalChime(true);
    setBroadcastedText(true);
    VttEventBus.emit('chat-message', {
      sender: 'GM NARRATIVE',
      text: rawReadAloud || activeNode?.title || 'Sensory Read-Aloud dispatched.',
      type: 'narration',
      timestamp: new Date().toLocaleTimeString()
    });
    setTimeout(() => setBroadcastedText(false), 2000);
  };

  const handleToggleBeat = (idx) => {
    AudioService.playTerminalBeep(1200, 0.03);
    setCompletedBeats(prev => {
      const next = new Set(prev);
      const isNowCompleted = !next.has(idx);
      if (isNowCompleted) next.add(idx);
      else next.delete(idx);

      VttEventBus.emit('story-foundry-milestone-reached', {
        scenarioId: activeNode?.id,
        scenarioTitle: activeNode?.title,
        beatIndex: idx,
        beatText: beatsList[idx] || '',
        isCompleted: isNowCompleted,
        completedBeats: Array.from(next),
        timestamp: new Date().toLocaleTimeString()
      });
      return next;
    });
  };

  const splitSizes = viewportSplit === 'canvas_only' 
    ? [25, 75] 
    : viewportSplit === 'story_only' 
    ? [75, 25] 
    : [50, 50];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16] relative min-w-0 font-mono">
      {/* Top Stage Control Header */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${getTypePillStyle(activeNode.type)}`}>
            {activeNode.type}
          </span>
          <input 
            type="text" 
            value={activeNode.title || ''}
            onChange={handleTitleChange}
            className="text-sm md:text-base font-bold bg-transparent border-none outline-none text-white placeholder-slate-500 flex-1 truncate focus:bg-slate-900/60 rounded px-1 transition-colors"
            placeholder="Element Title..."
          />
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-500 truncate shrink-0">
            <span className="text-amber-400">📍</span>
            <span className="truncate max-w-[200px]">{locationPath ? locationPath.join(' ❯ ') : 'Root'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {studioMode === 'live_session' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-500/60 text-[10px] text-rose-300 font-mono font-bold tracking-wider shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>LIVE RUNNING</span>
            </div>
          )}

          {perspectiveMode === 'operator' && (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/60 text-[10px] text-amber-300 font-mono font-bold tracking-wider shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.25)] animate-in fade-in"
              title="Operator Perspective: Streamlined for live session GM running."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>OPERATOR MODE</span>
            </div>
          )}

          {/* Format switcher tabs */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => {
                setScenarioWorkspaceTab('weaver');
                setIsSplitView(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                scenarioWorkspaceTab === 'weaver' && !isSplitView
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Story Weaver: Consolidated Prose, Manuscript, Outline, Beats & Genesis"
            >
              <span>🌟</span>
              <span className="hidden sm:inline">Story Weaver</span>
            </button>

            <button
              onClick={() => {
                setScenarioWorkspaceTab('stage');
                setIsSplitView(false);
                if (activeNode?.mapId && setActiveMapId) {
                  setActiveMapId(activeNode.mapId);
                }
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                scenarioWorkspaceTab === 'stage' && !isSplitView
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tactical Stage: Live WebGPU Battlemap, Tokens, Waypoints & Dynamic Lights"
            >
              <span>⚔️</span>
              <span className="hidden sm:inline">Tactical Stage</span>
            </button>

            <button
              onClick={() => {
                setIsSplitView(prev => !prev);
                if (activeNode?.mapId && setActiveMapId) {
                  setActiveMapId(activeNode.mapId);
                }
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isSplitView
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dual-Pane Split: Side-by-Side Manuscript + Tactical Stage"
            >
              <Columns size={12} />
              <span className="hidden sm:inline">Split Stage</span>
            </button>

            {/* Split Ratio Selector (When Split View is active) */}
            {isSplitView && (
              <div className="flex items-center gap-0.5 bg-slate-950 px-1 py-0.5 rounded-lg border border-emerald-500/40 text-[9px] font-bold">
                <button
                  type="button"
                  onClick={() => setViewportSplit('story_only')}
                  className={`px-1.5 py-0.5 rounded ${viewportSplit === 'story_only' ? 'bg-emerald-500/30 text-emerald-300 font-extrabold' : 'text-slate-400 hover:text-white'}`}
                  title="Story Bias: 75% Story / 25% Stage"
                >
                  Story
                </button>
                <button
                  type="button"
                  onClick={() => setViewportSplit('side_by_side')}
                  className={`px-1.5 py-0.5 rounded ${viewportSplit === 'side_by_side' ? 'bg-emerald-500/30 text-emerald-300 font-extrabold' : 'text-slate-400 hover:text-white'}`}
                  title="Equal Bias: 50% Story / 50% Stage"
                >
                  50/50
                </button>
                <button
                  type="button"
                  onClick={() => setViewportSplit('canvas_only')}
                  className={`px-1.5 py-0.5 rounded ${viewportSplit === 'canvas_only' ? 'bg-emerald-500/30 text-emerald-300 font-extrabold' : 'text-slate-400 hover:text-white'}`}
                  title="Stage Bias: 25% Story / 75% Stage"
                >
                  Stage
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setScenarioWorkspaceTab('tactical');
                setIsSplitView(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                scenarioWorkspaceTab === 'tactical' && !isSplitView
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="OSR 2-Page Tactical Spread (Read-Aloud, Threats, DCs, Secrets)"
            >
              <span>🎛️</span>
              <span className="hidden sm:inline">Tactical Spread</span>
            </button>

            <button
              onClick={() => {
                setScenarioWorkspaceTab('interactive');
                setIsSplitView(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                scenarioWorkspaceTab === 'interactive' && !isSplitView
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Interactive Play: Play through this scenario with Folio Persona, Presets, or Narrative Script"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Interactive Play</span>
            </button>
          </div>

          {/* Sub-Element & Delete Actions */}
          <button
            type="button"
            onClick={() => handleOpenAddModal(activeNode.id)}
            title="Add Sub-Element inside this element"
            className="p-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus size={13} />
            <span className="hidden xl:inline text-[11px] font-bold">Sub-Element</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteElement(activeNode.id, activeNode.title)}
            title="Delete this element"
            className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>

          {/* Re-open Right Cockpit Dock Button (when dock is closed) */}
          {!isRightDockOpen && onToggleRightDock && (
            <button
              type="button"
              onClick={onToggleRightDock}
              title="Expand Cockpit Dock (])"
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer ml-1"
            >
              <PanelRightClose size={13} className="rotate-180" />
              <span className="hidden md:inline text-[10px] font-bold">Cockpit</span>
            </button>
          )}
        </div>
      </div>

      {/* ── LIVE SESSION COCKPIT HUD (Shown only in studioMode === 'live_session') ── */}
      {studioMode === 'live_session' && (
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-950 to-purple-950/40 border-b border-rose-500/40 p-2.5 px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 text-xs shadow-lg">
          {/* Left: GM Read-Aloud Prompt */}
          <div className="flex-1 min-w-0 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 shrink-0 mt-0.5">
              <Sparkles size={14} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Sensory Read-Aloud Prose
                </span>
                <button
                  type="button"
                  onClick={handleBroadcastReadAloud}
                  className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Send size={10} />
                  <span>{broadcastedText ? 'Dispatched!' : 'Broadcast to Stage'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 italic truncate max-w-xl font-sans mt-0.5">
                {readAloudSnippet || 'The air hums with anticipation as operatives advance into the sector...'}
              </p>
            </div>
          </div>

          {/* Right: Sequential Scene Beats Checklist */}
          {beatsList.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-3">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                <Flag size={11} />
                <span>Beats ({completedBeats.size}/{beatsList.length}):</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs scrollbar-none">
                {beatsList.map((beat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleBeat(idx)}
                    className={`px-2 py-0.5 rounded text-[10px] font-sans flex items-center gap-1 border transition-colors cursor-pointer ${
                      completedBeats.has(idx)
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 line-through'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                    title={beat}
                  >
                    {completedBeats.has(idx) ? (
                      <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Circle size={11} className="text-slate-500 shrink-0" />
                    )}
                    <span className="truncate max-w-[80px]">{beat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SPLIT VIEW: SIDE-BY-SIDE MANUSCRIPT + TACTICAL STAGE */}
      {isSplitView ? (
        <Split
          key={viewportSplit}
          sizes={splitSizes}
          minSize={[280, 280]}
          gutterSize={6}
          direction="horizontal"
          className="flex h-full w-full overflow-hidden split-horizontal flex-1 min-h-0"
        >
          {/* Left: Story Weaver */}
          <div className="h-full w-full overflow-hidden bg-[#090d16] flex flex-col min-w-0">
            <StoryWeaver
              activeNode={activeNode}
              updateStory={updateStory}
              guidanceGems={universeState?.creativeState?.gems?.join(', ') || ''}
              onSelectScenarioWorkspaceTab={setScenarioWorkspaceTab}
            />
          </div>

          {/* Right: Live Tactical Stage */}
          <div className="h-full w-full overflow-hidden bg-[#070b13] flex flex-col border-l border-slate-800 min-w-0 relative">
            <TacticalStageViewport
              activeNode={activeNode}
              linkedMap={linkedMap}
              allAvailableMaps={allAvailableMaps}
              universeState={universeState}
              updateStory={updateStory}
              setActiveMapId={setActiveMapId}
              handleCreateNewMapForElement={handleCreateNewMapForElement}
              onSwitchView={onSwitchView}
              waypointPromptData={waypointPromptData}
              executeWaypointTrigger={executeWaypointTrigger}
              setWaypointPromptData={setWaypointPromptData}
            />
          </div>
        </Split>
      ) : (
        <>
          {/* FORMAT VIEW 1: STORY WEAVER */}
          {scenarioWorkspaceTab === 'weaver' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#090d16]">
              <StoryWeaver
                activeNode={activeNode}
                updateStory={updateStory}
                guidanceGems={universeState?.creativeState?.gems?.join(', ') || ''}
                onSelectScenarioWorkspaceTab={setScenarioWorkspaceTab}
              />
            </div>
          )}

          {/* FORMAT VIEW 2: INTEGRATED TACTICAL STAGE */}
          {scenarioWorkspaceTab === 'stage' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#070b13] relative">
              <TacticalStageViewport
                activeNode={activeNode}
                linkedMap={linkedMap}
                allAvailableMaps={allAvailableMaps}
                universeState={universeState}
                updateStory={updateStory}
                setActiveMapId={setActiveMapId}
                handleCreateNewMapForElement={handleCreateNewMapForElement}
                onSwitchView={onSwitchView}
                waypointPromptData={waypointPromptData}
                executeWaypointTrigger={executeWaypointTrigger}
                setWaypointPromptData={setWaypointPromptData}
              />
            </div>
          )}

          {/* FORMAT VIEW 3: OSR TACTICAL SPREAD */}
          {scenarioWorkspaceTab === 'tactical' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0f18] scrollbar-thin">
              <OsrControlPanelDeck
                activeNode={activeNode}
                updateStory={updateStory}
                guidanceGems={universeState?.creativeState?.gems || []}
              />
            </div>
          )}

          {/* FORMAT VIEW 4: INTERACTIVE PLAY STUDIO */}
          {scenarioWorkspaceTab === 'interactive' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#080c14]">
              <InteractiveStoryStudio
                activeNode={activeNode}
                onSelectScenario={(id) => setActiveScenarioId(id)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
