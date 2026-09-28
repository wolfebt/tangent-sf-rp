/**
 * @file StoryModule.jsx
 * @description Adventure Development Environment (ADE) - Master Unified Story & Narrative Suite.
 * Uses ADETopToolbar with a 3-zone glass-cockpit layout aligned with Map Maker and The Stage VTT.
 * Consolidates Scenario Drafting, full-screen Element Editor & Forge, Granular Interactive Story Mode,
 * OSR Two-Page Control Panel, and Fiction Manuscript Studio.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ScenarioPane from './ScenarioPane';
import ElementForge from '../ElementForge/ElementForge';
import StoryGallery from './workspaces/StoryGallery';
import InteractiveStoryStudio from './workspaces/InteractiveStoryStudio';
import VisualStoryGraph from './workspaces/VisualStoryGraph';
import OsrControlPanelDeck from './workspaces/OsrControlPanelDeck';
import SelectivePrintModal from '../../../components/StoryFoundry/SelectivePrintModal';
import FoundryLauncherModal from '../../../components/StoryFoundry/FoundryLauncherModal';
import { StoryFoundryGuideModal } from '../../../components/StoryFoundry/StoryFoundryGuideModal';
import { UserSettingsModal } from '../../../components/UserSettingsModal';
import AIMEChatBox from '../AIME/AIMEChatBox';
import EditElementModal from '../ElementForge/EditElementModal';
import GuidanceGemsModal from './GuidanceGemsModal';
import ADETopToolbar from './ADETopToolbar';
import ADENavRail from './ADENavRail';
import CronicleDeckModal from '../../../components/StoryFoundry/Cronicle/CronicleDeckModal';
import VttCompilerModal from '../../../components/StoryFoundry/VttCompilerModal';
import { useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { exportElementMarkdown, exportElementPDF } from './exportUtils';
import { generateScratchbookMarkdown } from './scratchbookService';
import { v4 as uuidv4 } from 'uuid';

export default function StoryModule({ defaultView = 'scenarios', defaultWorkspaceTab = 'weaver' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storyIdParam = searchParams.get('storyId');
  const viewParam = searchParams.get('view');
  const tabParam = searchParams.get('tab') || searchParams.get('workspaceTab');
  const { 
    openStory, 
    universeState, 
    elementsCatalog, 
    getActiveGemsText, 
    updateSavedElement, 
    deleteSavedElement, 
    updateStory,
    setActiveScenarioId,
    cronicle,
    mapsCatalog,
    activeMapId
  } = useStory();
  const { currentUser, userHandle } = useAuth();

  // Mode switcher state: 'scenarios' | 'interactive' | 'graph' | 'control-panel' | 'gallery'
  const [activeView, setActiveView] = useState(() => {
    const v = viewParam || defaultView;
    if (v === 'elements' || v === 'gallery') return 'gallery';
    if (v === 'graph') return 'graph';
    if (v === 'interactive') return 'interactive';
    if (v === 'control-panel' || v === 'tactical') return 'control-panel';
    return 'scenarios';
  });

  // Outliner and Right Cockpit Dock states
  const [isTreeExpanded, setIsTreeExpanded] = useState(true);
  const [isRightDockOpen, setIsRightDockOpen] = useState(true);
  const [activeCockpitDeck, setActiveCockpitDeck] = useState('inspector'); // 'inspector' | 'tactical' | 'elements' | 'aime'
  const [scenarioWorkspaceTab, setScenarioWorkspaceTab] = useState(() => {
    const v = viewParam || defaultView;
    const t = tabParam || defaultWorkspaceTab;
    if (v === 'stage' || v === 'live-studio' || t === 'stage') return 'stage';
    if (v === 'control-panel' || v === 'tactical') return 'tactical';
    if (v === 'interactive') return 'interactive';
    if (v === 'graph') return 'graph';
    return t || 'weaver';
  });

  // Modals state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGemsOpen, setIsGemsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCronicleOpen, setIsCronicleOpen] = useState(false);
  const [cronicleInitialMode, setCronicleInitialMode] = useState('living_memory');
  const [isCompilerOpen, setIsCompilerOpen] = useState(false);

  // Edit element modal
  const [isEditElementModalOpen, setIsEditElementModalOpen] = useState(false);
  const [editingModalElement, setEditingModalElement] = useState(null);

  // Floating AIME chat box (when undocked or outside scenarios)
  const [isFloatingAimeOpen, setIsFloatingAimeOpen] = useState(false);

  useEffect(() => {
    if (storyIdParam) {
      openStory(storyIdParam);
    }
  }, [storyIdParam, openStory]);

  useEffect(() => {
    if (viewParam && viewParam !== activeView) {
      setActiveView(viewParam);
    }
  }, [viewParam]);

  // Global hotkeys for glass cockpit: ] toggles right dock, [ toggles left outliner
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;

      if (e.key === ']') {
        e.preventDefault();
        setIsRightDockOpen(prev => !prev);
      } else if (e.key === '[') {
        e.preventDefault();
        setIsTreeExpanded(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSwitchView = (newView) => {
    setActiveView(newView);
    if (newView === 'stage' || newView === 'live-studio') {
      setActiveView('scenarios');
      setScenarioWorkspaceTab('stage');
    } else if (newView === 'control-panel' || newView === 'tactical') {
      setActiveView('control-panel');
      setScenarioWorkspaceTab('tactical');
    } else if (newView === 'interactive') {
      setActiveView('interactive');
      setScenarioWorkspaceTab('interactive');
    } else if (newView === 'graph') {
      setActiveView('graph');
      setScenarioWorkspaceTab('graph');
    } else if (newView === 'elements' || newView === 'gallery') {
      setActiveView('gallery');
    } else if (newView === 'scenarios' || newView === 'weaver' || newView === 'manuscript' || newView === 'aime') {
      setActiveView('scenarios');
      setScenarioWorkspaceTab('weaver');
    }

    const newParams = new URLSearchParams(searchParams);
    if (newView === 'scenarios') {
      newParams.delete('view');
    } else {
      newParams.set('view', newView);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Find active scenario node for format studios
  const activeNode = useMemo(() => {
    const scenarios = universeState?.scenarios || [];
    const activeId = universeState?.activeScenarioId;

    const findNode = (nodes) => {
      if (!Array.isArray(nodes)) return null;
      for (const n of nodes) {
        if (n.id === activeId) return n;
        if (n.children && n.children.length > 0) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findNode(scenarios) || scenarios[0] || null;
  }, [universeState]);

  const activeMap = useMemo(() => {
    const allMaps = [...(mapsCatalog || []), ...(universeState?.maps || [])];
    if (activeNode?.mapId) {
      return allMaps.find(m => m.id === activeNode.mapId) || allMaps[0] || null;
    }
    return allMaps.find(m => m.id === activeMapId) || allMaps[0] || null;
  }, [activeNode, mapsCatalog, universeState?.maps, activeMapId]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden font-sans relative select-none">
      {/* ── UNIFIED 3-ZONE GLASS-COCKPIT ADE TOOLBAR ── */}
      <ADETopToolbar
        activeView={activeView}
        onSwitchView={handleSwitchView}
        isGemsOpen={isGemsOpen}
        onToggleGems={setIsGemsOpen}
        isPrintModalOpen={isPrintModalOpen}
        onTogglePrintModal={setIsPrintModalOpen}
        isCatalogOpen={isCatalogOpen}
        onToggleCatalog={setIsCatalogOpen}
        isGuideOpen={isGuideOpen}
        onToggleGuide={setIsGuideOpen}
        isSettingsOpen={isSettingsOpen}
        onToggleSettings={setIsSettingsOpen}
        isCronicleOpen={isCronicleOpen && cronicleInitialMode === 'living_memory'}
        onToggleCronicle={(open) => {
          if (open) setCronicleInitialMode('living_memory');
          setIsCronicleOpen(open);
        }}
        isScratchbookOpen={isCronicleOpen && cronicleInitialMode === 'scratchbook'}
        onToggleScratchbook={(open) => {
          if (open) setCronicleInitialMode('scratchbook');
          setIsCronicleOpen(open);
        }}
        isCompilerOpen={isCompilerOpen}
        onToggleCompiler={setIsCompilerOpen}
        // Outliner Tree Toggle
        isTreeExpanded={isTreeExpanded}
        onToggleTreeExpanded={() => setIsTreeExpanded(prev => !prev)}
        // Right Cockpit Dock
        isRightDockOpen={isRightDockOpen}
        onToggleRightDock={() => setIsRightDockOpen(prev => !prev)}
        activeCockpitDeck={activeCockpitDeck}
        onSelectCockpitDeck={setActiveCockpitDeck}
        // Exports
        activeNode={activeNode}
        onExportMarkdown={() => exportElementMarkdown(activeNode, universeState)}
        onExportPDF={() => exportElementPDF(activeNode, universeState, userHandle, currentUser)}
      />

      {/* ── MAIN WORKSPACE VIEWPORT ── */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Dedicated ADE Studio Navigation Rail */}
        <ADENavRail
          activeView={activeView}
          onSwitchView={handleSwitchView}
          activeScenarioWorkspaceTab={scenarioWorkspaceTab}
          onSelectScenarioWorkspaceTab={setScenarioWorkspaceTab}
          elementsCount={elementsCatalog?.length || 0}
          mapsCount={universeState?.maps?.length || 0}
          modifiersCount={universeState?.galleryModifiers?.length || 0}
          gemsCount={universeState?.creativeState?.gems?.length || 0}
          pendingCronicleCount={cronicle?.history?.length || 0}
          onOpenGems={() => setIsGemsOpen(true)}
          onOpenCronicle={() => {
            setCronicleInitialMode('living_memory');
            setIsCronicleOpen(true);
          }}
          onOpenScratchbook={() => {
            setCronicleInitialMode('scratchbook');
            setIsCronicleOpen(true);
          }}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          isTreeExpanded={isTreeExpanded}
          onToggleTreeExpanded={() => setIsTreeExpanded(prev => !prev)}
        />

        {/* VIEW 1: STORY WEAVER & SCENARIOS WORKSPACE */}
        {activeView === 'scenarios' && (
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <ScenarioPane
              onOpenCatalog={() => setIsCatalogOpen(true)}
              onSwitchView={handleSwitchView}
              onSwitchTab={(tab) => {
                if (tab === 'map' || tab === 'stage') {
                  setScenarioWorkspaceTab('stage');
                }
              }}
              scenarioWorkspaceTab={scenarioWorkspaceTab}
              onSelectScenarioWorkspaceTab={setScenarioWorkspaceTab}
              isTreeExpanded={isTreeExpanded}
              onToggleTreeExpanded={() => setIsTreeExpanded(prev => !prev)}
              isRightDockOpen={isRightDockOpen}
              onToggleRightDock={() => setIsRightDockOpen(prev => !prev)}
              activeCockpitDeck={activeCockpitDeck}
              onSelectCockpitDeck={setActiveCockpitDeck}
              onOpenGems={() => setIsGemsOpen(true)}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 2: DEDICATED INTERACTIVE STORY MODULE */}
        {activeView === 'interactive' && (
          <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[#080c14] font-mono">
            <InteractiveStoryStudio
              activeNode={activeNode}
              onSelectScenario={(id) => {
                if (typeof setActiveScenarioId === 'function') setActiveScenarioId(id);
              }}
            />
          </div>
        )}

        {/* VIEW 2.5: DEDICATED VISUAL STORY GRAPH FLOWCHART */}
        {activeView === 'graph' && (
          <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[#070a12] font-mono">
            <VisualStoryGraph
              activeScenarioId={activeNode?.id}
              onSelectScenario={(id) => {
                if (typeof setActiveScenarioId === 'function') setActiveScenarioId(id);
              }}
              onOpenInWeaver={(node) => {
                if (typeof setActiveScenarioId === 'function') setActiveScenarioId(node.id);
                handleSwitchView('scenarios');
              }}
              onPanStageToMap={(mapId) => {
                navigate(`/foundry/live-studio?mapId=${mapId}`);
              }}
            />
          </div>
        )}

        {/* VIEW 3: DEDICATED TACTICAL SPREAD (OSR 2-PAGE SPREAD) */}
        {activeView === 'control-panel' && (
          <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[#0a0f18] font-mono">
            <div className="p-2 px-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <span>🎛️</span> OSR 2-Page Tactical Control Panel Spread • {activeNode?.title || 'Tactical Sector'}
              </span>
              <button
                onClick={() => handleSwitchView('scenarios')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg uppercase cursor-pointer"
              >
                Story Weaver ❯
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
              <OsrControlPanelDeck
                activeNode={activeNode}
                updateStory={updateStory}
                guidanceGems={universeState?.creativeState?.gems || []}
              />
            </div>
          </div>
        )}

        {/* VIEW 4: THE STORY GALLERY (Elements, Maps, Situational Modifiers) */}
        {(activeView === 'gallery' || activeView === 'elements') && (
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <StoryGallery
              onBackToStory={() => handleSwitchView('scenarios')}
              onOpenCompiler={() => setIsCompilerOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Floating Movable AIME Co-Pilot Chat Window (For views other than Scenarios) */}
      {isFloatingAimeOpen && activeView !== 'scenarios' && (
        <AIMEChatBox
          onClose={() => setIsFloatingAimeOpen(false)}
          activeNode={activeNode}
          contextData={{
            projectName: universeState?.projectName || 'Tangent Universe',
            activeNode: activeNode ? {
              id: activeNode.id,
              title: activeNode.title,
              type: activeNode.type,
              content: activeNode.content,
              fields: activeNode.fields
            } : null,
            guidanceGems: typeof getActiveGemsText === 'function' ? getActiveGemsText() : '',
            outline: universeState?.creativeState?.storyOutline || '',
            sceneBeats: universeState?.creativeState?.sceneBeats || '',
            draft: universeState?.creativeState?.storyDraft || '',
            customCatalog: elementsCatalog || [],
            scratchbook: generateScratchbookMarkdown(universeState, elementsCatalog),
            cronicle: universeState?.cronicle || cronicle || null
          }}
        />
      )}

      {/* Full Element Forge Modal inside Story Module */}
      {isEditElementModalOpen && (
        <EditElementModal
          isOpen={isEditElementModalOpen}
          onClose={() => {
            setIsEditElementModalOpen(false);
            setEditingModalElement(null);
          }}
          element={editingModalElement}
          onSave={(savedElem) => {
            if (typeof updateSavedElement === 'function' && savedElem?.id) {
              updateSavedElement(savedElem.id, savedElem);
            }
            setIsEditElementModalOpen(false);
            setEditingModalElement(null);
          }}
          onDelete={(elementId) => {
            if (typeof deleteSavedElement === 'function' && elementId) {
              deleteSavedElement(elementId);
            }
            setIsEditElementModalOpen(false);
            setEditingModalElement(null);
          }}
        />
      )}

      {/* Story Project Catalog / Dashboard Modal */}
      <FoundryLauncherModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        initialTab="stories"
      />

      {/* Selective Print & Publishing Studio Modal */}
      <SelectivePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        universeState={universeState}
        elementsCatalog={elementsCatalog}
        activeScenario={activeNode}
        activeMap={activeMap}
      />

      {/* Guidance Gems Configuration Modal */}
      {isGemsOpen && (
        <GuidanceGemsModal
          isOpen={isGemsOpen}
          onClose={() => setIsGemsOpen(false)}
        />
      )}


      {/* ADE Master User Guide Modal */}
      {isGuideOpen && (
        <StoryFoundryGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      )}

      {/* User Settings & Identity Modal */}
      {isSettingsOpen && (
        <UserSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Master Cronicle Living Memory & Scratchbook Deck Modal */}
      <CronicleDeckModal
        isOpen={isCronicleOpen}
        onClose={() => setIsCronicleOpen(false)}
        initialMode={cronicleInitialMode}
      />

      {/* VTT Module Compiler & Runtime Prep Modal */}
      <VttCompilerModal
        isOpen={isCompilerOpen}
        onClose={() => setIsCompilerOpen(false)}
        activeScenario={activeNode}
      />
    </div>
  );
}
