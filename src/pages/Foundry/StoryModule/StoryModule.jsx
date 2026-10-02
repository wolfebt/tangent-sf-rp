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
import ModuleMissionControl from '../Dashboard/ModuleMissionControl';
import PresetsAndScriptsDashboard from '../PresetsAndScripts/PresetsAndScriptsDashboard';
import CronicleDeckModal from '../../../components/StoryFoundry/Cronicle/CronicleDeckModal';
import VttCompilerModal from '../../../components/StoryFoundry/VttCompilerModal';
import ModulePackageModal from '../../../components/StoryFoundry/ModulePackageModal';
const MapMaker = React.lazy(() => import('../MapMaker/MapMaker'));
import { useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { exportElementMarkdown, exportElementPDF } from './exportUtils';
import { generateScratchbookMarkdown } from './scratchbookService';
import { useAdeStore } from '../store/adeStore';
import { useShallow } from 'zustand/react/shallow';
import { v4 as uuidv4 } from 'uuid';

export default function StoryModule({ defaultView = 'mission_control', defaultWorkspaceTab = 'weaver' }) {
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

  // Centralized ADE Store State & Actions via a single useShallow subscription
  const {
    activeView,
    setActiveView,
    isTreeExpanded,
    setIsTreeExpanded,
    isRightDockOpen,
    setIsRightDockOpen,
    activeCockpitDeck,
    setActiveCockpitDeck,
    scenarioWorkspaceTab,
    setScenarioWorkspaceTab,
    modals,
    setModal,
    cronicleInitialMode,
    setCronicleInitialMode,
    editingModalElement,
    setEditingModalElement
  } = useAdeStore(
    useShallow((state) => ({
      activeView: state.activeView,
      setActiveView: state.setActiveView,
      isTreeExpanded: state.isTreeExpanded,
      setIsTreeExpanded: state.setIsTreeExpanded,
      isRightDockOpen: state.isRightDockOpen,
      setIsRightDockOpen: state.setIsRightDockOpen,
      activeCockpitDeck: state.activeCockpitDeck,
      setActiveCockpitDeck: state.setActiveCockpitDeck,
      scenarioWorkspaceTab: state.storyWorkspaceTab,
      setScenarioWorkspaceTab: state.setStoryWorkspaceTab,
      modals: state.modals,
      setModal: state.setModal,
      cronicleInitialMode: state.cronicleInitialMode,
      setCronicleInitialMode: state.setCronicleInitialMode,
      editingModalElement: state.editingElement,
      setEditingModalElement: state.setEditingElement,
    }))
  );

  // Modals state bridges
  const isCatalogOpen = modals.catalog;
  const setIsCatalogOpen = (val) => setModal('catalog', val);
  const isPrintModalOpen = modals.print;
  const setIsPrintModalOpen = (val) => setModal('print', val);
  const isGemsOpen = modals.gems;
  const setIsGemsOpen = (val) => setModal('gems', val);
  const isGuideOpen = modals.guide;
  const setIsGuideOpen = (val) => setModal('guide', val);
  const isSettingsOpen = modals.settings;
  const setIsSettingsOpen = (val) => setModal('settings', val);
  const isCronicleOpen = modals.cronicle;
  const setIsCronicleOpen = (val) => setModal('cronicle', val);
  const isCompilerOpen = modals.compiler;
  const setIsCompilerOpen = (val) => setModal('compiler', val);
  const isEditElementModalOpen = modals.editElement;
  const setIsEditElementModalOpen = (val) => setModal('editElement', val);
  const isFloatingAimeOpen = modals.floatingAime;
  const setIsFloatingAimeOpen = (val) => setModal('floatingAime', val);
  const isModuleExportOpen = modals.moduleExport;
  const isModuleImportOpen = modals.moduleImport;

  useEffect(() => {
    if (storyIdParam) {
      openStory(storyIdParam);
    }
  }, [storyIdParam, openStory]);

  // Two-way synchronization between URL search parameters and central adeStore
  useEffect(() => {
    const v = viewParam || defaultView;
    if (v) {
      let resolvedView = 'mission_control';
      if (v === 'mission_control' || v === 'dashboard' || v === 'mission-control' || v === 'hub') resolvedView = 'mission_control';
      else if (v === 'map' || v === 'map-maker' || v === 'mapmaker') resolvedView = 'map';
      else if (v === 'scripts' || v === 'presets') resolvedView = 'scripts';
      else if (v === 'elements' || v === 'gallery') resolvedView = 'gallery';
      else if (v === 'graph') resolvedView = 'graph';
      else if (v === 'interactive') resolvedView = 'interactive';
      else if (v === 'control-panel' || v === 'tactical') resolvedView = 'control-panel';
      else if (v === 'scenarios' || v === 'weaver' || v === 'story' || v === 'narrative') resolvedView = 'scenarios';

      if (activeView !== resolvedView) {
        setActiveView(resolvedView);
      }
    }
  }, [viewParam, defaultView, activeView, setActiveView]);

  useEffect(() => {
    const t = tabParam || defaultWorkspaceTab;
    if (t && scenarioWorkspaceTab !== t) {
      setScenarioWorkspaceTab(t);
    }
  }, [tabParam, defaultWorkspaceTab, scenarioWorkspaceTab, setScenarioWorkspaceTab]);

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
    if (newView === 'mission_control') {
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
      {/* ── UNIFIED 3-ZONE GLASS-COCKPIT ADE TOOLBAR (Only shown in sub-studios, functions shifted to Hub page) ── */}
      {activeView !== 'mission_control' && (
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
      )}

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

        {/* VIEW 0: MISSION CONTROL DASHBOARD (THE HUB) */}
        {activeView === 'mission_control' && (
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <ModuleMissionControl
              onSelectPillar={(pillar) => {
                if (pillar === 'narrative') {
                  handleSwitchView('scenarios');
                } else if (pillar === 'maps') {
                  handleSwitchView('map');
                } else if (pillar === 'scripts') {
                  handleSwitchView('scripts');
                } else if (pillar === 'assets') {
                  handleSwitchView('gallery');
                } else if (pillar === 'live_director') {
                  navigate('/stage');
                }
              }}
              onSwitchView={handleSwitchView}
              activeNode={activeNode}
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
              onOpenCatalog={() => setIsCatalogOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenCompiler={() => setIsCompilerOpen(true)}
              onExportMarkdown={() => exportElementMarkdown(activeNode, universeState)}
              onExportPDF={() => exportElementPDF(activeNode, universeState, userHandle, currentUser)}
            />
          </div>
        )}

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
                navigate(`/foundry/live?mapId=${mapId}`);
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

        {/* VIEW 5: PRESETS & SCRIPTS STUDIO (Pillar 3) */}
        {(activeView === 'scripts' || activeView === 'presets') && (
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <PresetsAndScriptsDashboard
              onBackToStory={() => handleSwitchView('scenarios')}
            />
          </div>
        )}

        {/* VIEW 6: MAP ARCHITECT (Pillar 2) */}
        {activeView === 'map' && (
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <React.Suspense fallback={
              <div className="flex items-center justify-center h-full bg-[#070b13] text-cyan-400 font-mono text-xs">
                <span>Loading Map Architect Studio...</span>
              </div>
            }>
              <MapMaker onBackToStory={() => handleSwitchView('scenarios')} />
            </React.Suspense>
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

      {/* Standalone Module Package Export / Import Modal */}
      {(isModuleExportOpen || isModuleImportOpen) && (
        <ModulePackageModal
          isOpen={isModuleExportOpen || isModuleImportOpen}
          onClose={() => {
            setModal('moduleExport', false);
            setModal('moduleImport', false);
          }}
          initialMode={isModuleExportOpen ? 'export' : 'import'}
          universeState={universeState}
          elementsCatalog={elementsCatalog}
          onImportPackage={(pkg) => {
            if (typeof handleLoadStory === 'function' && pkg) {
              handleLoadStory(pkg);
            }
          }}
        />
      )}
    </div>
  );
}
