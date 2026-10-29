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
import WeaverWorkspace from '../../Weaver/WeaverWorkspace';
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
  addMap,
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
          linkedMap={linkedMap}
          allAvailableMaps={allAvailableMaps}
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

  const isFullStage = scenarioWorkspaceTab === 'stage' && !isSplitView;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16] relative min-w-0 font-mono">
      {/* ── LIVE SESSION COCKPIT HUD (Shown only in studioMode === 'live_session' when not in full stage) ── */}
      {!isFullStage && studioMode === 'live_session' && (
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
              guidanceGems={universeState?.creativeState?.gems?.map(g => g.name || g.label).join(', ') || ''}
              onSelectScenarioWorkspaceTab={setScenarioWorkspaceTab}
              isSplitView={isSplitView}
              setIsSplitView={setIsSplitView}
              viewportSplit={viewportSplit}
              setViewportSplit={setViewportSplit}
              handleOpenAddModal={handleOpenAddModal}
              handleDeleteElement={handleDeleteElement}
              locationPath={locationPath}
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
              addMap={addMap}
              handleCreateNewMapForElement={handleCreateNewMapForElement}
              onSwitchView={onSwitchView}
              waypointPromptData={waypointPromptData}
              executeWaypointTrigger={executeWaypointTrigger}
              setWaypointPromptData={setWaypointPromptData}
              onSwitchToWeaver={() => setScenarioWorkspaceTab('weaver')}
            />
          </div>
        </Split>
      ) : (
        <>
          {/* FORMAT VIEW 1: MASTER WEAVER WORKSPACE (Write, Brainstorm, Gems, Elements, Graph, Play) */}
          {scenarioWorkspaceTab !== 'stage' && (
            <WeaverWorkspace
              activeNode={activeNode}
              updateStory={updateStory}
              activeTab={scenarioWorkspaceTab}
              onSelectTab={setScenarioWorkspaceTab}
              onSwitchView={onSwitchView}
              linkedMap={linkedMap}
              allAvailableMaps={allAvailableMaps}
              setActiveScenarioId={setActiveScenarioId}
              handleOpenAddModal={handleOpenAddModal}
              handleDeleteElement={handleDeleteElement}
              locationPath={locationPath}
            />
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
                addMap={addMap}
                handleCreateNewMapForElement={handleCreateNewMapForElement}
                onSwitchView={onSwitchView}
                waypointPromptData={waypointPromptData}
                executeWaypointTrigger={executeWaypointTrigger}
                setWaypointPromptData={setWaypointPromptData}
                onSwitchToWeaver={() => setScenarioWorkspaceTab('write')}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
