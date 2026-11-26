/**
 * @file StoryModule.jsx
 * @description Adventure Development Environment (ADE) - Master Unified Story & Narrative Suite.
 * Uses ADETopToolbar with a 3-zone glass-cockpit layout aligned with Map Maker and The Stage VTT.
 * Consolidates Scenario Drafting, full-screen Element Editor & Forge, Granular Interactive Story Mode,
 * OSR Two-Page Control Panel, and Fiction Manuscript Studio.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ScenarioPane from './ScenarioPane';
import StoryGallery from './workspaces/StoryGallery';
import ADETopToolbar from './ADETopToolbar';
import ADENavRail from './ADENavRail';
import ModuleMissionControl from '../Dashboard/ModuleMissionControl';
import StageWorkspace from '../Stage/StageWorkspace';
import FoundryModalHost from './FoundryModalHost';
import { MobileTacticalBlocker } from '../../../components/StoryFoundry/MobileTacticalBlocker';
import { useIsMobile } from '../../../hooks/useIsMobile';
const MapMaker = React.lazy(() => import('../MapMaker/MapMaker'));
import { useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { useDBM } from '../../../context/DBMContext';
import { useFolio } from '../../../context/FolioContext';
import { useBastion } from '../../../context/BastionContext';
import { showToast } from '../../../context/ToastContext';
import { exportElementMarkdown, exportElementPDF } from './exportUtils';
import { buildUnifiedAdeCatalog } from '../../../utils/cortexAdeAssetBridge';
import { normalizeElementType } from '../ElementForge/elementSchemas';
import { useAdeStore } from '../store/adeStore';
import { useShallow } from 'zustand/react/shallow';
import { v4 as uuidv4 } from 'uuid';

export default function StoryModule({ defaultView = 'mission_control', defaultWorkspaceTab = 'weaver' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storyIdParam = searchParams.get('storyId');
  const scenarioIdParam = searchParams.get('scenarioId');
  const mapIdParam = searchParams.get('mapId');
  const elementIdParam = searchParams.get('elementId') || searchParams.get('id');
  const typeParam = searchParams.get('type') || searchParams.get('elementType');
  const createParam = searchParams.get('create');
  const viewParam = searchParams.get('view');
  const tabParam = searchParams.get('tab') || searchParams.get('workspaceTab');
  const returnToParam = searchParams.get('returnTo');
  const subParam = searchParams.get('subcategory') || searchParams.get('sub');
  const { 
    openStory, 
    universeState, 
    elementsCatalog, 
    getActiveGemsText, 
    updateSavedElement, 
    deleteSavedElement, 
    updateStory,
    activeScenarioId,
    setActiveScenarioId,
    cronicle,
    mapsCatalog,
    activeMapId,
    setActiveMapId,
    addMap,
    updateMap,
    addStory,
    setGalleryModifiers,
    updateCreativeState,
    updateCronicle,
    acceptPendingDelta,
    acceptAllPendingDeltas,
    rejectPendingDelta,
    clearPendingDeltas,
    isStoryReadOnly = false
  } = useStory();
  const { currentUser, userHandle, isAdmin = false } = useAuth();
  const { dbData = {}, saveEntry, deleteEntry } = useDBM() || {};
  const {
    roster: folioRoster = [],
    personaRoster = [],
    publicPersonas = [],
    publicCatalog = [],
    saveCurrentToRoster
  } = useFolio() || {};
  const { registerSurfaceContext, unregisterSurfaceContext } = useBastion() || {};
  const isMobile = useIsMobile();

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
    stageWorkspaceTab,
    setStageWorkspaceTab,
    activeElementType,
    setActiveElementType,
    modals,
    setModal,
    cronicleInitialMode,
    setCronicleInitialMode,
    editingModalElement,
    setEditingModalElement,
    elementEditorMode,
    elementEditorInitialSeed,
    isSplitView,
    perspectiveMode
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
      stageWorkspaceTab: state.stageWorkspaceTab,
      setStageWorkspaceTab: state.setStageWorkspaceTab,
      activeElementType: state.activeElementType,
      setActiveElementType: state.setActiveElementType,
      modals: state.modals,
      setModal: state.setModal,
      cronicleInitialMode: state.cronicleInitialMode,
      setCronicleInitialMode: state.setCronicleInitialMode,
      editingModalElement: state.editingElement,
      setEditingModalElement: state.setEditingElement,
      elementEditorMode: state.elementEditorMode,
      elementEditorInitialSeed: state.elementEditorInitialSeed,
      isSplitView: state.isSplitView,
      perspectiveMode: state.perspectiveMode
    }))
  );

  // Modals state bridges
  const isCatalogOpen = modals.catalog;
  const setIsCatalogOpen = (val) => setModal('catalog', val);
  const isPrintModalOpen = modals.print;
  const setIsPrintModalOpen = (val) => setModal('print', val);
  const isArtistHubOpen = modals.artistHub;
  const setIsArtistHubOpen = (val) => setModal('artistHub', val);
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

  const lastOpenedStoryIdRef = useRef(null);

  useEffect(() => {
    if (!storyIdParam) {
      lastOpenedStoryIdRef.current = null;
      return;
    }
    if (lastOpenedStoryIdRef.current === storyIdParam && universeState?.id === storyIdParam) {
      return;
    }
    const opened = openStory(storyIdParam);
    if (opened) {
      lastOpenedStoryIdRef.current = storyIdParam;
    }
  }, [storyIdParam, openStory, universeState?.id]);

  // Synchronize scenarioId and mapId from URL params if present
  useEffect(() => {
    if (scenarioIdParam && setActiveScenarioId && activeScenarioId !== scenarioIdParam) {
      setActiveScenarioId(scenarioIdParam);
    }
  }, [scenarioIdParam, activeScenarioId, setActiveScenarioId]);

  // Global AIME Co-Pilot toggle listener
  useEffect(() => {
    const handleAimeToggle = () => {
      setModal('floatingAime', true);
    };
    window.addEventListener('toggle-aime-copilot', handleAimeToggle);
    return () => window.removeEventListener('toggle-aime-copilot', handleAimeToggle);
  }, [setModal]);

  useEffect(() => {
    if (mapIdParam && setActiveMapId && activeMapId !== mapIdParam) {
      setActiveMapId(mapIdParam);
    }
  }, [mapIdParam, activeMapId, setActiveMapId]);

  // Deep-link support for Element Forge (?view=elements&elementId=...&type=...&create=1)
  useEffect(() => {
    if (!elementIdParam && !typeParam && createParam !== '1') return;
    if (typeParam && setActiveElementType) {
      setActiveElementType(normalizeElementType(typeParam));
    }
    const openCreator = useAdeStore.getState().openGuidedElementCreator;
    if (elementIdParam && typeof openCreator === 'function') {
      const liveFolio = Array.isArray(folioRoster) && folioRoster.length > 0 ? folioRoster : personaRoster;
      const livePublic = Array.isArray(publicPersonas) && publicPersonas.length > 0 ? publicPersonas : publicCatalog;
      const catalog = buildUnifiedAdeCatalog({
        elementsCatalog: elementsCatalog || [],
        dbData: dbData || {},
        folioRoster: liveFolio || [],
        publicPersonas: livePublic || []
      });
      const match = catalog.find(
        (el) =>
          el &&
          (el.id === elementIdParam ||
            el.moduleElementId === elementIdParam ||
            el.dbmId === elementIdParam ||
            el.folioDocId === elementIdParam)
      );
      if (match) {
        setActiveElementType?.(normalizeElementType(match.type));
        openCreator({ element: match, mode: 'sheet' });
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('elementId');
        nextParams.delete('id');
        setSearchParams(nextParams, { replace: true });
      }
    } else if (createParam === '1' && !isStoryReadOnly && typeof openCreator === 'function') {
      const nextType = normalizeElementType(typeParam || activeElementType || 'Persona');
      setActiveElementType?.(nextType);
      const adeSnapshot = useAdeStore.getState();
      const seededFields = {};
      if (nextType === 'Property') {
        const sub = subParam || (adeSnapshot.activePropertySubcategory && adeSnapshot.activePropertySubcategory !== 'all' ? adeSnapshot.activePropertySubcategory : 'gear');
        seededFields.propertySubcategory = sub;
        seededFields.itemCategory = sub;
      } else if (nextType === 'Persona') {
        const sub = subParam || (adeSnapshot.activePersonaSource && adeSnapshot.activePersonaSource !== 'all' ? adeSnapshot.activePersonaSource : 'story');
        seededFields.personaSubcategory = sub;
      } else if (nextType === 'Metaphysics') {
        const sub = subParam || (adeSnapshot.activeMetaphysicsSubcategory && adeSnapshot.activeMetaphysicsSubcategory !== 'all' ? adeSnapshot.activeMetaphysicsSubcategory : 'invocations');
        seededFields.metaphysicsSubcategory = sub;
      }
      openCreator({
        element: {
          id: `elem_${Date.now()}`,
          title: '',
          type: nextType,
          ...(seededFields.propertySubcategory ? { propertySubcategory: seededFields.propertySubcategory } : {}),
          ...(seededFields.personaSubcategory ? { personaSubcategory: seededFields.personaSubcategory } : {}),
          ...(seededFields.metaphysicsSubcategory ? { metaphysicsSubcategory: seededFields.metaphysicsSubcategory } : {}),
          content: '',
          fields: seededFields
        },
        mode: 'guided'
      });
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('create');
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    elementIdParam,
    typeParam,
    createParam,
    elementsCatalog,
    dbData,
    folioRoster,
    personaRoster,
    publicPersonas,
    publicCatalog,
    activeElementType,
    isStoryReadOnly,
    searchParams,
    setSearchParams,
    setActiveElementType
  ]);

  // Two-way synchronization between URL search parameters and central adeStore
  useEffect(() => {
    let resolvedView = 'mission_control';
    const v = viewParam || defaultView;
    if (v) {
      if (v === 'mission_control' || v === 'dashboard' || v === 'mission-control' || v === 'hub') resolvedView = 'mission_control';
      else if (v === 'map' || v === 'map-maker' || v === 'mapmaker') resolvedView = 'map';
      else if (v === 'elements' || v === 'gallery' || v === 'assets') resolvedView = 'elements';
      else if (v === 'stage' || v === 'live' || v === 'live-studio' || v === 'ade-stage' || v === 'vtt' || v === 'director' || v === 'live_director') {
        resolvedView = 'stage';
        if (v === 'vtt' || v === 'director' || v === 'live_director' || v === 'live' || v === 'live-studio' || v === 'ade-stage') {
          setStageWorkspaceTab(tabParam || 'run');
        } else if (tabParam) {
          setStageWorkspaceTab(tabParam);
        }
      }
      else if (v === 'scripts' || v === 'presets' || v === 'automation') {
        resolvedView = 'stage';
        setStageWorkspaceTab('scripts');
      }
      else if (v === 'control-panel' || v === 'tactical') {
        resolvedView = 'stage';
        setStageWorkspaceTab('encounters');
      }
      else if (v === 'interactive') {
        resolvedView = 'scenarios';
        setScenarioWorkspaceTab('play');
      }
      else if (v === 'gems') {
        resolvedView = 'scenarios';
        setScenarioWorkspaceTab('gems');
      }
      else if (v === 'graph') {
        resolvedView = 'scenarios';
        setScenarioWorkspaceTab('graph');
      }
      else if (v === 'scenarios' || v === 'weaver' || v === 'story' || v === 'narrative') {
        resolvedView = 'scenarios';
        if (tabParam) {
          const resolvedTab = (tabParam === 'canvas' || tabParam === 'manuscript' || tabParam === 'weaver') ? 'write' : tabParam;
          setScenarioWorkspaceTab(resolvedTab);
        }
      }
    }
    setActiveView(resolvedView);
  }, [viewParam, tabParam, defaultView, setActiveView, setStageWorkspaceTab, setScenarioWorkspaceTab]);

  // Workspace tab synchronization: update tab from URL param only for scenario views & scenario tabs
  useEffect(() => {
    const v = viewParam?.toLowerCase();
    const t = tabParam?.toLowerCase();
    const isNonScenarioView = v && ['stage', 'live', 'vtt', 'map', 'elements', 'gallery', 'mission_control', 'dashboard', 'aime', 'presets', 'scripts', 'encounters'].includes(v);
    const isStageOnlyTab = t && ['run', 'setup', 'encounters', 'loot', 'audio', 'assets', 'scripts', 'presets'].includes(t);
    if (tabParam && !isNonScenarioView && !isStageOnlyTab) {
      const resolvedTab = (tabParam === 'canvas' || tabParam === 'manuscript' || tabParam === 'weaver') ? 'write' : tabParam;
      setScenarioWorkspaceTab(resolvedTab);
    } else if (!tabParam && defaultWorkspaceTab && defaultWorkspaceTab !== 'weaver') {
      setScenarioWorkspaceTab(defaultWorkspaceTab);
    }
  }, [viewParam, tabParam, defaultWorkspaceTab, setScenarioWorkspaceTab]);

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

  const handleSelectScenarioWorkspaceTab = (tab) => {
    const resolvedTab = (tab === 'canvas' || tab === 'manuscript' || tab === 'weaver') ? 'write' : tab;
    setScenarioWorkspaceTab(resolvedTab);
    setActiveView('scenarios');

    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', 'scenarios');
    if (resolvedTab === 'write') {
      newParams.delete('tab');
      newParams.delete('workspaceTab');
    } else {
      newParams.set('tab', resolvedTab);
    }
    const searchStr = newParams.toString();
    if (searchStr !== searchParams.toString()) {
      navigate(`/foundry${searchStr ? `?${searchStr}` : ''}`);
    }
  };

  const handleSwitchView = (newView, targetTab) => {
    let resolvedView = newView;
    let resolvedTargetTab = targetTab;

    if (newView === 'vtt' || newView === 'director' || newView === 'live_director') {
      resolvedView = 'stage';
      resolvedTargetTab = targetTab || 'run';
    } else if (newView === 'stage' || newView === 'live' || newView === 'live-studio' || newView === 'ade-stage') {
      resolvedView = 'stage';
      resolvedTargetTab = (newView === 'live' || newView === 'live-studio' || newView === 'ade-stage') ? (targetTab || 'run') : (targetTab || 'setup');
    } else if (newView === 'scripts' || newView === 'presets' || newView === 'automation') {
      resolvedView = 'stage';
      resolvedTargetTab = 'scripts';
    } else if (newView === 'control-panel' || newView === 'tactical') {
      resolvedView = 'stage';
      resolvedTargetTab = 'encounters';
    } else if (newView === 'interactive') {
      resolvedView = 'scenarios';
      resolvedTargetTab = 'play';
    } else if (newView === 'gems' || newView === 'brainstorm') {
      resolvedView = 'scenarios';
      resolvedTargetTab = 'brainstorm';
    } else if (newView === 'graph') {
      resolvedView = 'scenarios';
      resolvedTargetTab = 'graph';
    } else if (newView === 'elements' || newView === 'gallery' || newView === 'assets') {
      resolvedView = 'elements';
    } else if (newView === 'scenarios' || newView === 'weaver' || newView === 'manuscript' || newView === 'aime') {
      resolvedView = 'scenarios';
      resolvedTargetTab = targetTab || 'write';
    }

    setActiveView(resolvedView);
    if (resolvedView === 'stage' && resolvedTargetTab) {
      setStageWorkspaceTab(resolvedTargetTab);
    } else if (resolvedView === 'scenarios' && resolvedTargetTab) {
      setScenarioWorkspaceTab(resolvedTargetTab);
    }

    const newParams = new URLSearchParams(searchParams);
    if (resolvedView === 'mission_control') {
      newParams.delete('view');
      newParams.delete('tab');
      newParams.delete('workspaceTab');
    } else {
      newParams.set('view', resolvedView);
      if (resolvedTargetTab && resolvedTargetTab !== 'write' && resolvedTargetTab !== 'setup') {
        newParams.set('tab', resolvedTargetTab);
      } else {
        newParams.delete('tab');
        newParams.delete('workspaceTab');
      }
    }

    const searchStr = newParams.toString();
    if (searchStr !== searchParams.toString()) {
      navigate(`/foundry${searchStr ? `?${searchStr}` : ''}`);
    }
  };

  const handleSelectScenario = (id) => {
    if (setActiveScenarioId) setActiveScenarioId(id);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('scenarioId', id);
    const searchStr = newParams.toString();
    if (searchStr !== searchParams.toString()) {
      navigate(`/foundry${searchStr ? `?${searchStr}` : ''}`);
    }
  };

  // Find active scenario node for format studios
  const activeNode = useMemo(() => {
    const scenarios = universeState?.scenarios || [];
    const activeId = activeScenarioId || universeState?.activeScenarioId;

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
  }, [universeState, activeScenarioId]);

  const activeMap = useMemo(() => {
    const allMaps = [...(mapsCatalog || []), ...(universeState?.maps || [])];
    if (activeNode?.mapId) {
      return allMaps.find(m => m.id === activeNode.mapId) || allMaps[0] || null;
    }
    return allMaps.find(m => m.id === activeMapId) || allMaps[0] || null;
  }, [activeNode, mapsCatalog, universeState?.maps, activeMapId]);

  useEffect(() => {
    const handleExportMdEvent = () =>
      exportElementMarkdown(activeNode, universeState, { operatorSafe: perspectiveMode === 'operator' });
    window.addEventListener('export-scenario-markdown', handleExportMdEvent);
    return () => window.removeEventListener('export-scenario-markdown', handleExportMdEvent);
  }, [activeNode, universeState, perspectiveMode]);

  // Register Foundry ADE workspace context with BASTION so Alt+B rules/canon queries know the active scenario
  useEffect(() => {
    if (typeof registerSurfaceContext !== 'function') return undefined;
    registerSurfaceContext('foundry-workspace', {
      surfaceType: 'foundry',
      activeView,
      activeScenarioId: activeNode?.id || null,
      activeNode: activeNode
        ? { id: activeNode.id, title: activeNode.title, type: activeNode.type }
        : null,
      projectName: universeState?.projectName || '',
      updateScenario: updateStory
    });
    return () => unregisterSurfaceContext?.('foundry-workspace');
  }, [
    registerSurfaceContext,
    unregisterSurfaceContext,
    activeView,
    activeNode?.id,
    activeNode?.title,
    activeNode?.type,
    universeState?.projectName,
    updateStory
  ]);

  return (
    <div className="flex flex-col h-full w-full tangent-grid-bg text-slate-100 overflow-hidden font-sans relative select-none">
      {/* ── UNIFIED 3-ZONE GLASS-COCKPIT ADE TOOLBAR WITH BREADCRUMBS ── */}
      {activeView !== 'mission_control' && (
        <ADETopToolbar
          activeView={activeView}
          scenarioWorkspaceTab={scenarioWorkspaceTab}
          stageWorkspaceTab={stageWorkspaceTab}
          onSwitchView={handleSwitchView}
          onSelectScenarioWorkspaceTab={handleSelectScenarioWorkspaceTab}
          onSelectScenario={handleSelectScenario}
          isPrintModalOpen={isPrintModalOpen}
          onTogglePrintModal={setIsPrintModalOpen}
          isArtistHubOpen={isArtistHubOpen}
          onToggleArtistHub={setIsArtistHubOpen}
          onToggleGuide={setIsGuideOpen}
          onToggleSettings={setIsSettingsOpen}
          isCronicleOpen={isCronicleOpen}
          onToggleCronicle={(open) => {
            if (open) setCronicleInitialMode('living_memory');
            setIsCronicleOpen(open);
          }}
          isCompilerOpen={isCompilerOpen}
          onToggleCompiler={setIsCompilerOpen}
          isTreeExpanded={isTreeExpanded}
          onToggleTreeExpanded={() => setIsTreeExpanded(prev => !prev)}
          isRightDockOpen={isRightDockOpen}
          onToggleRightDock={(next) => setIsRightDockOpen(prev => (typeof next === 'boolean' ? next : !prev))}
          activeCockpitDeck={activeCockpitDeck}
          onSelectCockpitDeck={setActiveCockpitDeck}
          activeNode={activeNode}
          activeElement={editingModalElement}
          onExportMarkdown={() =>
            exportElementMarkdown(activeNode, universeState, { operatorSafe: perspectiveMode === 'operator' })
          }
          onExportPDF={() =>
            exportElementPDF(activeNode, universeState, { operatorSafe: perspectiveMode === 'operator', userHandle, currentUser })
          }
        />
      )}

      {returnToParam === 'stage' && (
        <div className="px-3 py-1 bg-purple-950/70 border-b border-purple-500/40 flex items-center justify-between text-xs font-mono shrink-0 z-30">
          <button
            type="button"
            onClick={() => navigate(`/stage${mapIdParam ? `?mapId=${encodeURIComponent(mapIdParam)}` : ''}`)}
            className="px-2.5 py-0.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-400/50 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>← Return to Stage</span>
          </button>
          <span className="text-[10px] text-purple-300/80 hidden sm:inline">
            Opened from Tactical Stage deep-link
          </span>
        </div>
      )}

      {/* ── MAIN WORKSPACE VIEWPORT ── */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Dedicated ADE Studio Guidance Navigation Rail */}
        <ADENavRail
          activeView={activeView}
          onSwitchView={handleSwitchView}
          activeScenarioWorkspaceTab={scenarioWorkspaceTab}
          onSelectScenarioWorkspaceTab={handleSelectScenarioWorkspaceTab}
          activeElementType={activeElementType}
          onSelectElementType={(elType) => {
            if (setActiveElementType) setActiveElementType(elType);
            if (activeView !== 'elements' && activeView !== 'gallery') {
              handleSwitchView('elements');
            }
          }}
          elementsCatalog={elementsCatalog}
          elementsCount={elementsCatalog?.length || 0}
          mapsCount={universeState?.maps?.length || 0}
          modifiersCount={universeState?.galleryModifiers?.length || 0}
          pendingCronicleCount={cronicle?.pendingDeltas?.length || 0}
          onOpenCronicle={() => {
            setCronicleInitialMode('living_memory');
            setIsCronicleOpen(true);
          }}
          onOpenArtistHub={() => setIsArtistHubOpen(true)}
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
                  handleSwitchView('elements');
                } else if (pillar === 'stage' || pillar === 'live_director') {
                  handleSwitchView('stage', pillar === 'live_director' ? 'run' : 'setup');
                }
              }}
              onSwitchView={handleSwitchView}
              activeNode={activeNode}
              onOpenCronicle={() => {
                setCronicleInitialMode('living_memory');
                setIsCronicleOpen(true);
              }}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              onOpenCatalog={() => setIsCatalogOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenCompiler={() => setIsCompilerOpen(true)}
              onExportMarkdown={() =>
                exportElementMarkdown(activeNode, universeState, { operatorSafe: perspectiveMode === 'operator' })
              }
              onExportPDF={() =>
                exportElementPDF(activeNode, universeState, { operatorSafe: perspectiveMode === 'operator', userHandle, currentUser })
              }
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
                  handleSwitchView('stage', 'setup');
                }
              }}
              scenarioWorkspaceTab={scenarioWorkspaceTab}
              onSelectScenarioWorkspaceTab={handleSelectScenarioWorkspaceTab}
              isTreeExpanded={isTreeExpanded}
              onToggleTreeExpanded={() => setIsTreeExpanded(prev => !prev)}
              isRightDockOpen={isRightDockOpen}
              onToggleRightDock={() => setIsRightDockOpen(prev => !prev)}
              activeCockpitDeck={activeCockpitDeck}
              onSelectCockpitDeck={setActiveCockpitDeck}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              onSelectScenario={handleSelectScenario}
            />
          </div>
        )}

        {/* VIEW 1.5: THE STAGE VTT (Stage Compiler & Live VTT Runtime) */}
        {activeView === 'stage' && (
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            {isMobile ? (
              <MobileTacticalBlocker operation="vtt" onBack={() => handleSwitchView('scenarios')} />
            ) : (
              <StageWorkspace
                initialTab={stageWorkspaceTab || 'setup'}
                onSwitchView={handleSwitchView}
                boundMapId={activeMap?.id || activeMapId}
                boundStoryId={activeNode?.id || activeScenarioId}
              />
            )}
          </div>
        )}

        {/* VIEW 4: STORY ELEMENTS (Elements, Maps, Situational Modifiers) */}
        {(activeView === 'gallery' || activeView === 'elements') && (
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <StoryGallery
              onBackToStory={() => handleSwitchView('scenarios')}
              onOpenCompiler={() => setIsCompilerOpen(true)}
              activeElementType={activeElementType}
              onSelectElementType={setActiveElementType}
            />
          </div>
        )}

        {/* VIEW 6: MAP ARCHITECT (Pillar 2) */}
        {activeView === 'map' && (
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            {isMobile ? (
              <MobileTacticalBlocker operation="map" onBack={() => handleSwitchView('scenarios')} />
            ) : (
              <React.Suspense fallback={
                <div className="flex items-center justify-center h-full bg-[#070b13] text-cyan-400 font-mono text-xs">
                  <span>Loading Map Architect Studio...</span>
                </div>
              }>
                <MapMaker onBackToStory={() => handleSwitchView('scenarios')} />
              </React.Suspense>
            )}
          </div>
        )}
      </div>

      <FoundryModalHost
        modals={modals}
        setModal={setModal}
        cronicleInitialMode={cronicleInitialMode}
        editingModalElement={editingModalElement}
        setEditingModalElement={setEditingModalElement}
        elementEditorMode={elementEditorMode}
        elementEditorInitialSeed={elementEditorInitialSeed}
        activeNode={activeNode}
        activeMap={activeMap}
        universeState={universeState}
        elementsCatalog={elementsCatalog}
        dbData={dbData}
        folioRoster={folioRoster?.length ? folioRoster : personaRoster}
        publicPersonas={publicPersonas?.length ? publicPersonas : publicCatalog}
        cronicle={cronicle}
        getActiveGemsText={getActiveGemsText}
        updateSavedElement={updateSavedElement}
        deleteSavedElement={deleteSavedElement}
        saveEntry={saveEntry}
        deleteEntry={deleteEntry}
        saveCurrentToRoster={saveCurrentToRoster}
        isAdmin={Boolean(isAdmin)}
        showToast={showToast}
        addMap={addMap}
        updateMap={updateMap}
        addStory={addStory}
        updateStory={updateStory}
        setActiveMapId={setActiveMapId}
        setActiveScenarioId={setActiveScenarioId}
        setGalleryModifiers={setGalleryModifiers}
        updateCreativeState={updateCreativeState}
        updateCronicle={updateCronicle}
        acceptPendingDelta={acceptPendingDelta}
        acceptAllPendingDeltas={acceptAllPendingDeltas}
        rejectPendingDelta={rejectPendingDelta}
        clearPendingDeltas={clearPendingDeltas}
        onSwitchView={handleSwitchView}
        onToggleSplitView={() => useAdeStore.getState().toggleSplitView()}
        isStoryReadOnly={isStoryReadOnly}
      />
    </div>
  );
}
