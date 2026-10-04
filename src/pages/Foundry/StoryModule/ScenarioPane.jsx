/**
 * @file ScenarioPane.jsx
 * @description Master 3-Zone Glass-Cockpit Scenario Workspace for the Adventure Development Environment (ADE).
 * Orchestrates:
 *   - Zone 1 (Left Outliner Rail): ScenarioOutlinerRail (Scenarios hierarchy & World Elements dual-tab)
 *   - Zone 2 (Center Stage): ScenarioCanvasSwitch (Weaver, Tactical Stage, Split Stage, OSR Spread, Interactive)
 *   - Zone 3 (Right Cockpit Dock): ScenarioCockpitDockPanel (Inspector, Tactical, Elements, AIME)
 *   - Modals: AddElementModal, CreateScenarioModal, EditElementModal
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStory } from '../../../context/CampaignContext';
import { useToast } from '../../../context/ToastContext';
import EditElementModal from '../ElementForge/EditElementModal';
import CreateScenarioModal from './CreateScenarioModal';
import { AddElementModal, getBreadcrumbPath, ScenarioOutlinerRail } from './ScenarioOutlinerTree';
import { ScenarioCockpitDockPanel } from './ScenarioCockpitDock';
import { useAdeStore } from '../store/adeStore';
import { useShallow } from 'zustand/react/shallow';
import { useWaypointEngine } from '../hooks/useWaypointEngine';
import { createBlankCanvas, getStarterMapsCollection } from '../../../components/VTT/stage/defaultMaps';
import { useEngineStore, selectAllFusedTokens } from '../../../engine/index';
import { v4 as uuidv4 } from 'uuid';
import { useScenarioOperations } from './panels/useScenarioOperations';
import ScenarioCanvasSwitch from './panels/ScenarioCanvasSwitch';

export default function ScenarioPane({ 
  onSwitchTab, 
  onSwitchView, 
  onOpenCatalog,
  scenarioWorkspaceTab: propWorkspaceTab,
  onSelectScenarioWorkspaceTab: propSetWorkspaceTab,
  isTreeExpanded = true,
  onToggleTreeExpanded,
  isRightDockOpen = true,
  onToggleRightDock,
  activeCockpitDeck = 'inspector',
  onSelectCockpitDeck,
  onOpenGems,
  onOpenPrintModal
}) {
  const { 
    universeState, 
    setUniverseState, 
    activeScenarioId, 
    setActiveScenarioId, 
    addStory, 
    updateStory, 
    deleteStory, 
    moveStory, 
    reorderRelativeScenario, 
    triggerStorySave, 
    addMap, 
    activeMapId,
    setActiveMapId, 
    elementsCatalog, 
    mapsCatalog,
    updateSavedElement,
    deleteSavedElement
  } = useStory();

  const { toast } = useToast();

  // Internal modal & content state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState(null);
  const [localContent, setLocalContent] = useState('');
  const [isEditElementModalOpen, setIsEditElementModalOpen] = useState(false);
  const [editingModalElement, setEditingModalElement] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [outlinerTab, setOutlinerTab] = useState('scenarios');
  const [outlinerElementTypeFilter, setOutlinerElementTypeFilter] = useState('All');
  const [elementSearch, setElementSearch] = useState('');
  const [selectedElementTypeFilter, setSelectedElementTypeFilter] = useState('Persona');

  const mapFileInputRef = useRef(null);

  // Zustand Store selectors via useShallow
  const {
    storeWorkspaceTab,
    setStoreWorkspaceTab,
    storeCockpitDeck,
    setStoreCockpitDeck,
    isSplitView,
    setIsSplitView,
    perspectiveMode
  } = useAdeStore(
    useShallow((state) => ({
      storeWorkspaceTab: state.storyWorkspaceTab,
      setStoreWorkspaceTab: state.setStoryWorkspaceTab,
      storeCockpitDeck: state.activeCockpitDeck,
      setStoreCockpitDeck: state.setActiveCockpitDeck,
      isSplitView: state.isSplitView,
      setIsSplitView: state.setIsSplitView,
      perspectiveMode: state.perspectiveMode
    }))
  );

  const dockTab = activeCockpitDeck || storeCockpitDeck || 'inspector';
  const setDockTab = (tab) => {
    setStoreCockpitDeck(tab);
    if (onSelectCockpitDeck) onSelectCockpitDeck(tab);
  };

  const rawWorkspaceTab = propWorkspaceTab || storeWorkspaceTab;
  const scenarioWorkspaceTab = (rawWorkspaceTab === 'canvas' || rawWorkspaceTab === 'manuscript')
    ? 'weaver'
    : (rawWorkspaceTab === 'control-panel' ? 'tactical' : (rawWorkspaceTab === 'map' || rawWorkspaceTab === 'stage' ? 'stage' : rawWorkspaceTab));
  const setScenarioWorkspaceTab = (tab) => {
    setStoreWorkspaceTab(tab);
    if (propSetWorkspaceTab) propSetWorkspaceTab(tab);
  };

  // Unified Map Catalog access
  const allAvailableMaps = useMemo(() => {
    const catalog = mapsCatalog || [];
    const projectMaps = (universeState?.maps || []).filter(m => !catalog.some(cm => cm.id === m.id));
    return [...catalog, ...projectMaps];
  }, [mapsCatalog, universeState?.maps]);

  // Bootstrap starter maps if both universeState.maps and mapsCatalog are empty
  useEffect(() => {
    if (universeState && (!universeState.maps || universeState.maps.length === 0) && (!mapsCatalog || mapsCatalog.length === 0)) {
      const starters = getStarterMapsCollection();
      setUniverseState(prev => ({
        ...prev,
        maps: starters
      }));
      if (starters.length > 0 && setActiveMapId && !activeMapId) {
        setActiveMapId(starters[0].id);
      }
    }
  }, [universeState, mapsCatalog, setUniverseState, setActiveMapId, activeMapId]);

  // Locate active node
  let activeNode = null;
  const findNode = (nodes) => {
    for (let n of nodes) {
      if (n.id === activeScenarioId) {
        activeNode = n;
        return;
      }
      if (n.children) findNode(n.children);
    }
  };
  if (activeScenarioId && universeState?.scenarios) findNode(universeState.scenarios);

  useEffect(() => {
    if (!activeScenarioId && universeState?.scenarios?.length > 0) {
      setActiveScenarioId(universeState.scenarios[0].id);
    }
  }, [activeScenarioId, universeState?.scenarios, setActiveScenarioId]);

  const locationPath = activeNode ? getBreadcrumbPath(universeState.scenarios, activeNode.id) : null;
  const linkedMap = activeNode?.mapId ? (allAvailableMaps.find(m => m.id === activeNode.mapId) || null) : null;

  // Sync activeMapId when linkedMap is present
  useEffect(() => {
    if (activeNode?.mapId && setActiveMapId && activeMapId !== activeNode.mapId) {
      setActiveMapId(activeNode.mapId);
    }
  }, [activeNode?.mapId, setActiveMapId, activeMapId]);

  // Live Token Tracking for Waypoint Detection in Stage
  const liveTokens = useEngineStore(selectAllFusedTokens);

  // Flat scenarios list for waypoint target routing
  const flatScenarios = useMemo(() => {
    const list = [];
    const recurse = (nodes) => {
      for (const n of nodes) {
        list.push(n);
        if (n.children && n.children.length > 0) recurse(n.children);
      }
    };
    if (universeState?.scenarios) recurse(universeState.scenarios);
    return list;
  }, [universeState?.scenarios]);

  // Bi-directional Waypoint Engine for Tactical Stage
  const {
    waypointPromptData,
    setWaypointPromptData,
    executeWaypointTrigger
  } = useWaypointEngine({
    activeMap: linkedMap,
    updateMap: (mapId, updates) => {
      if (universeState?.maps?.some(m => m.id === mapId)) {
        setUniverseState(prev => ({
          ...prev,
          maps: (prev.maps || []).map(m => m.id === mapId ? { ...m, ...updates } : m)
        }));
      }
    },
    activeScenario: activeNode,
    flatScenarios,
    setActiveScenarioId,
    storyContext: { universeState, activeScenario: activeNode, linkedMap },
    studioMode: 'development',
    liveTokens
  });

  // Extract scenario operations
  const {
    handleTitleChange,
    handleAddElement,
    handleDeleteElement,
    handleInsertMention,
    handleToggleLinkElement
  } = useScenarioOperations({
    activeScenarioId,
    activeNode,
    updateStory,
    deleteStory,
    addStory,
    setActiveScenarioId,
    localContent,
    setLocalContent
  });

  const handleOpenAddModal = (targetParentId = null) => {
    setModalParentId(targetParentId);
    if (outlinerTab === 'scenarios') {
      setIsScenarioModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleMapFileImport = (e) => {
    const file = e.target.files[0];
    if (!file || !activeNode) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          let mapToLoad = data.type === "TangentMap" && data.map ? data.map : (data.id && data.title ? data : null);
          if (mapToLoad) {
            const mapId = mapToLoad.id || uuidv4();
            const newMap = { ...mapToLoad, id: mapId };
            addMap(newMap);
            updateStory(activeNode.id, { mapId });
            setActiveMapId(mapId);
          }
        } catch (err) {
          console.error(err);
          toast({ type: 'error', text: 'Failed to parse map JSON file.' });
        }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        const newMap = {
          id: uuidv4(),
          title: `${activeNode.title || 'Map'} (Image)`,
          gridMode: 'hex',
          gridType: 'hex',
          lines: [],
          tokens: [],
          terrains: [],
          objects: [
            {
              id: uuidv4(),
              shape: 'rect',
              color: '#3b82f6',
              label: file.name,
              x: 400,
              y: 300,
              width: 800,
              height: 600,
              imageUrl: imageUrl
            }
          ],
          texts: [],
          fog: []
        };
        addMap(newMap);
        updateStory(activeNode.id, { mapId: newMap.id });
        setActiveMapId(newMap.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateNewMapForElement = () => {
    if (!activeNode) return;
    const newMap = createBlankCanvas({
      title: `${activeNode.title || 'Untitled'} Encounter Sector`,
      gridType: 'hex'
    });
    addMap(newMap);
    updateStory(activeNode.id, { mapId: newMap.id });
    setActiveMapId(newMap.id);
  };

  // Filtered elements catalog for In-Situ dock
  const filteredCatalog = useMemo(() => {
    return (elementsCatalog || []).filter(elem => {
      const matchesSearch = !elementSearch ||
        (elem.title || '').toLowerCase().includes(elementSearch.toLowerCase()) ||
        (elem.type || '').toLowerCase().includes(elementSearch.toLowerCase());
      const matchesType = selectedElementTypeFilter === 'All' || elem.type === selectedElementTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [elementsCatalog, elementSearch, selectedElementTypeFilter]);

  // Filtered elements for Left Outliner Rail
  const filteredOutlinerElements = useMemo(() => {
    return (elementsCatalog || []).filter(elem => {
      const matchesSearch = !searchFilter ||
        (elem.title || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        (elem.type || '').toLowerCase().includes(searchFilter.toLowerCase());
      const matchesType = outlinerElementTypeFilter === 'All' || elem.type === outlinerElementTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [elementsCatalog, searchFilter, outlinerElementTypeFilter]);

  return (
    <div className="h-full w-full bg-slate-950 flex overflow-hidden relative font-mono" onBlur={triggerStorySave}>
      {/* Hidden Map File Input */}
      <input
        type="file"
        accept=".json,image/*"
        ref={mapFileInputRef}
        className="hidden"
        onChange={handleMapFileImport}
      />

      <AddElementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddElement} 
        defaultParentId={modalParentId}
      />

      <CreateScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        defaultParentId={modalParentId}
        onScenarioCreated={(node) => {
          if (setActiveScenarioId) setActiveScenarioId(node.id);
        }}
      />

      {/* ── ZONE 1: DUAL-MODE OUTLINER RAIL (Left Column: Scenarios & World Elements) ── */}
      <ScenarioOutlinerRail
        isTreeExpanded={isTreeExpanded}
        outlinerTab={outlinerTab}
        setOutlinerTab={setOutlinerTab}
        elementsCatalog={elementsCatalog}
        activeScenarioId={activeScenarioId}
        setActiveScenarioId={setActiveScenarioId}
        handleOpenAddModal={handleOpenAddModal}
        setEditingModalElement={setEditingModalElement}
        setIsEditElementModalOpen={setIsEditElementModalOpen}
        outlinerElementTypeFilter={outlinerElementTypeFilter}
        setOutlinerElementTypeFilter={setOutlinerElementTypeFilter}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        scenarios={universeState.scenarios}
        handleDeleteElement={handleDeleteElement}
        moveStory={moveStory}
        reorderRelativeScenario={reorderRelativeScenario}
        filteredOutlinerElements={filteredOutlinerElements}
        activeNode={activeNode}
        handleInsertMention={handleInsertMention}
        handleToggleLinkElement={handleToggleLinkElement}
        onSwitchView={onSwitchView}
      />

      {/* ── ZONE 2: PRIMARY CREATIVE STAGE (Center Column) ── */}
      <ScenarioCanvasSwitch
        activeNode={activeNode}
        scenarioWorkspaceTab={scenarioWorkspaceTab}
        setScenarioWorkspaceTab={setScenarioWorkspaceTab}
        isSplitView={isSplitView}
        setIsSplitView={setIsSplitView}
        perspectiveMode={perspectiveMode}
        locationPath={locationPath}
        handleTitleChange={handleTitleChange}
        handleOpenAddModal={handleOpenAddModal}
        handleDeleteElement={handleDeleteElement}
        isRightDockOpen={isRightDockOpen}
        onToggleRightDock={onToggleRightDock}
        updateStory={updateStory}
        universeState={universeState}
        setActiveScenarioId={setActiveScenarioId}
        linkedMap={linkedMap}
        allAvailableMaps={allAvailableMaps}
        setActiveMapId={setActiveMapId}
        addMap={addMap}
        handleCreateNewMapForElement={handleCreateNewMapForElement}
        onSwitchView={onSwitchView}
        waypointPromptData={waypointPromptData}
        executeWaypointTrigger={executeWaypointTrigger}
        setWaypointPromptData={setWaypointPromptData}
      />

      {/* ── ZONE 3: MASTER COCKPIT DOCK (Right Column) ── */}
      <ScenarioCockpitDockPanel
        isRightDockOpen={isRightDockOpen}
        onToggleRightDock={onToggleRightDock}
        dockTab={dockTab}
        setDockTab={setDockTab}
        activeNode={activeNode}
        updateStory={updateStory}
        elementsCatalog={elementsCatalog}
        handleToggleLinkElement={handleToggleLinkElement}
        linkedMap={linkedMap}
        allAvailableMaps={allAvailableMaps}
        setActiveMapId={setActiveMapId}
        setScenarioWorkspaceTab={setScenarioWorkspaceTab}
        mapFileInputRef={mapFileInputRef}
        handleCreateNewMapForElement={handleCreateNewMapForElement}
        elementSearch={elementSearch}
        setElementSearch={setElementSearch}
        selectedElementTypeFilter={selectedElementTypeFilter}
        setSelectedElementTypeFilter={setSelectedElementTypeFilter}
        filteredCatalog={filteredCatalog}
        handleInsertMention={handleInsertMention}
        setEditingModalElement={setEditingModalElement}
        setIsEditElementModalOpen={setIsEditElementModalOpen}
        onSwitchView={onSwitchView}
        universeState={universeState}
      />

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
    </div>
  );
}
