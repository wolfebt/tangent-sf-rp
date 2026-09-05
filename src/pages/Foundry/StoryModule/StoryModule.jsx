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
import ControlPanelStudio from './workspaces/ControlPanelStudio';
import ManuscriptStudio from './workspaces/ManuscriptStudio';
import InteractiveStoryStudio from './workspaces/InteractiveStoryStudio';
import AdventurePrintModal from './workspaces/AdventurePrintModal';
import FoundryLauncherModal from '../../../components/StoryFoundry/FoundryLauncherModal';
import { StoryFoundryGuideModal } from '../../../components/StoryFoundry/StoryFoundryGuideModal';
import { UserSettingsModal } from '../../../components/UserSettingsModal';
import AIMEChatBox from '../AIME/AIMEChatBox';
import InSituElementDrawer from './InSituElementDrawer';
import EditElementModal from '../ElementForge/EditElementModal';
import AIME from '../AIME/AIME';
import GuidanceGemsModal from './GuidanceGemsModal';
import ScratchbookModal from './ScratchbookModal';
import ADETopToolbar from './ADETopToolbar';
import { useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { exportElementMarkdown, exportElementPDF } from './exportUtils';
import { generateScratchbookMarkdown } from './scratchbookService';
import { v4 as uuidv4 } from 'uuid';

export default function StoryModule({ defaultView = 'scenarios' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storyIdParam = searchParams.get('storyId');
  const viewParam = searchParams.get('view');
  const { openStory, universeState, elementsCatalog, getActiveGemsText, updateSavedElement, deleteSavedElement } = useStory();
  const { currentUser, userHandle } = useAuth();

  // Mode switcher state: 'scenarios' | 'elements' | 'interactive' | 'aime' | 'control-panel' | 'manuscript'
  const [activeView, setActiveView] = useState(() => {
    return viewParam || defaultView || 'scenarios';
  });

  // Scenario workspace tab: 'canvas' | 'control-panel' | 'manuscript'
  const [scenarioWorkspaceTab, setScenarioWorkspaceTab] = useState('canvas');
  const [isTreeExpanded, setIsTreeExpanded] = useState(true);

  // Modals state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGemsOpen, setIsGemsOpen] = useState(false);
  const [isScratchbookOpen, setIsScratchbookOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // In-Situ Drawers
  const [isAimeChatOpen, setIsAimeChatOpen] = useState(false);
  const [isElementDrawerOpen, setIsElementDrawerOpen] = useState(false);
  const [activeDrawerElementId, setActiveDrawerElementId] = useState(null);
  const [isEditElementModalOpen, setIsEditElementModalOpen] = useState(false);
  const [editingModalElement, setEditingModalElement] = useState(null);

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

  const handleSwitchView = (newView) => {
    setActiveView(newView);
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

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden font-sans relative select-none">
      {/* ── UNIFIED 3-ZONE GLASS-COCKPIT ADE TOOLBAR ── */}
      <ADETopToolbar
        activeView={activeView}
        onSwitchView={handleSwitchView}
        isGemsOpen={isGemsOpen}
        onToggleGems={setIsGemsOpen}
        isScratchbookOpen={isScratchbookOpen}
        onToggleScratchbook={setIsScratchbookOpen}
        isPrintModalOpen={isPrintModalOpen}
        onTogglePrintModal={setIsPrintModalOpen}
        isCatalogOpen={isCatalogOpen}
        onToggleCatalog={setIsCatalogOpen}
        isGuideOpen={isGuideOpen}
        onToggleGuide={setIsGuideOpen}
        isSettingsOpen={isSettingsOpen}
        onToggleSettings={setIsSettingsOpen}
        isAimeChatOpen={isAimeChatOpen}
        onToggleAimeChat={setIsAimeChatOpen}
        isElementDrawerOpen={isElementDrawerOpen}
        onToggleElementDrawer={setIsElementDrawerOpen}
        scenarioWorkspaceTab={scenarioWorkspaceTab}
        onSelectScenarioWorkspaceTab={setScenarioWorkspaceTab}
        isTreeExpanded={isTreeExpanded}
        onToggleTreeExpanded={() => setIsTreeExpanded(prev => !prev)}
        activeNode={activeNode}
        onExportMarkdown={() => exportElementMarkdown(activeNode, universeState)}
        onExportPDF={() => exportElementPDF(activeNode, universeState, userHandle, currentUser)}
      />

      {/* ── MAIN WORKSPACE VIEWPORT ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: SCENARIOS & CANVAS */}
        {activeView === 'scenarios' && (
          <ScenarioPane
            onOpenCatalog={() => setIsCatalogOpen(true)}
            onSwitchView={handleSwitchView}
            onSwitchTab={(tab) => {
              if (tab === 'map') navigate('/map-maker');
            }}
            scenarioWorkspaceTab={scenarioWorkspaceTab}
            onSelectScenarioWorkspaceTab={setScenarioWorkspaceTab}
            isTreeExpanded={isTreeExpanded}
            onToggleTreeExpanded={() => setIsTreeExpanded(prev => !prev)}
            onOpenGems={() => setIsGemsOpen(true)}
            onOpenScratchbook={() => setIsScratchbookOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {/* VIEW 2: AIME CREATIVE STUDIO INTEGRATED INTO ADE */}
        {activeView === 'aime' && (
          <AIME />
        )}

        {/* VIEW 3: CONSOLIDATED ELEMENT FORGE */}
        {activeView === 'elements' && (
          <ElementForge
            onBackToStory={() => handleSwitchView('scenarios')}
          />
        )}

        {/* VIEW 4: GRANULAR INTERACTIVE STORY STUDIO */}
        {activeView === 'interactive' && (
          <InteractiveStoryStudio
            activeNode={activeNode}
          />
        )}

        {/* LEGACY COMPATIBILITY: CONTROL PANEL */}
        {activeView === 'control-panel' && (
          <ControlPanelStudio
            activeNode={activeNode}
          />
        )}

        {/* LEGACY COMPATIBILITY: MANUSCRIPT */}
        {activeView === 'manuscript' && (
          <ManuscriptStudio
            activeNode={activeNode}
          />
        )}

        {/* In-Situ Worldbuilding Element Drawer (Docked 3rd Column) */}
        {isElementDrawerOpen && (
          <InSituElementDrawer
            isOpen={isElementDrawerOpen}
            onClose={() => setIsElementDrawerOpen(false)}
            elementsCatalog={elementsCatalog || []}
            activeElementId={activeDrawerElementId}
            onSelectElement={(id) => setActiveDrawerElementId(id)}
            onOpenFullEditor={(elem) => {
              setEditingModalElement(elem);
              setIsEditElementModalOpen(true);
            }}
            onOpenFullForge={() => handleSwitchView('elements')}
            onCreateElement={() => {
              setEditingModalElement({
                id: uuidv4(),
                type: 'Persona',
                title: 'New World Element',
                fields: {},
                content: ''
              });
              setIsEditElementModalOpen(true);
            }}
            currentSceneLinkedIds={activeNode?.linkedElements || []}
          />
        )}
      </div>

      {/* Floating / Docked Movable AIME Co-Pilot Chat Window */}
      {isAimeChatOpen && (
        <AIMEChatBox
          onClose={() => setIsAimeChatOpen(false)}
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
            scratchbook: generateScratchbookMarkdown(universeState, elementsCatalog)
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

      {/* Print & Publishing Modal */}
      <AdventurePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        storyTitle={universeState?.projectName || activeNode?.title || 'ADE Adventure'}
      />

      {/* Guidance Gems Configuration Modal */}
      {isGemsOpen && (
        <GuidanceGemsModal
          isOpen={isGemsOpen}
          onClose={() => setIsGemsOpen(false)}
        />
      )}

      {/* Project Scratchbook Modal */}
      {isScratchbookOpen && (
        <ScratchbookModal
          isOpen={isScratchbookOpen}
          onClose={() => setIsScratchbookOpen(false)}
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
    </div>
  );
}
