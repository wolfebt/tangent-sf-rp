/**
 * @file ScenarioPane.jsx
 * @description Master 3-Zone Glass-Cockpit Scenario Workspace for the Adventure Development Environment (ADE).
 * Features:
 *   - Zone 1 (Left): Collapsible, searchable scenario hierarchy tree with depth drag-and-drop.
 *   - Zone 2 (Center Stage): Focused, full-height creative canvas switching seamlessly between
 *     Prose Drafting (ReactQuill), OSR 2-Page Tactical Spread (OsrControlPanelDeck), and Connected Manuscript.
 *   - Zone 3 (Right Cockpit Dock): Resizable, collapsible master inspector housing 4 tabbed decks:
 *     1. 📋 Inspector: Compact Image Uploader/Preview, Type-Specific Schema Fields, Custom Fields.
 *     2. ⚔️ Tactical: Connected Map Asset Card (Map Maker & VTT launch) & Encounter Stats Glance.
 *     3. 🧩 World Elements: In-Situ searchable worldbuilding catalog with 1-click mention insertion.
 *     4. ✨ AIME Co-Pilot: Embedded conversational AI narrative assistant & dice roller.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory, formatExportFilename } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import Split from 'react-split';
import { v4 as uuidv4 } from 'uuid';
import { ELEMENT_TYPES, getTypePillStyle } from '../ElementForge/elementSchemas';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { useToast, showToast } from '../../../context/ToastContext';
import EditElementModal from '../ElementForge/EditElementModal';
import CreateScenarioModal from './CreateScenarioModal';
import OsrControlPanelDeck from './workspaces/OsrControlPanelDeck';
import StoryWeaver from './workspaces/StoryWeaver';
import InteractiveStoryStudio from './workspaces/InteractiveStoryStudio';
import AIMEChatBox from '../AIME/AIMEChatBox';
import { TreeNode, AddElementModal, getBreadcrumbPath } from './ScenarioOutlinerTree';
import { ElementFieldsEditor, ElementImageUploader, AutoResizingTextarea } from './ScenarioCockpitDock';
import { StageViewportWrapper } from '../../../components/VTT/stage/StageViewportWrapper';
import { WaypointPromptChip } from '../../../components/VTT/stage/WaypointPromptChip';
import { useWaypointEngine } from '../LiveStudio/hooks/useWaypointEngine';
import { createBlankCanvas } from '../../../components/VTT/stage/defaultMaps';
import { useEngineStore, selectAllFusedTokens } from '../../../engine/index';
import { 
  Search, 
  Plus, 
  Trash2, 
  X, 
  ExternalLink, 
  Sliders, 
  Play, 
  ChevronRight, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Target, 
  Compass, 
  Box,
  MapPin,
  FileText,
  Upload,
  Link,
  ChevronDown,
  Swords,
  PanelRightClose,
  Columns,
  Maximize2,
  Hammer,
  Flag,
  Shield,
  Map as MapIcon
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

// ── MAIN SCENARIO PANE WORKSPACE ──
export default function ScenarioPane({ 
  onSwitchTab, 
  onSwitchView, 
  onOpenCatalog,
  scenarioWorkspaceTab: propWorkspaceTab,
  onSelectScenarioWorkspaceTab: propSetWorkspaceTab,
  isTreeExpanded = true,
  onToggleTreeExpanded,
  // Right Cockpit Dock props
  isRightDockOpen = true,
  onToggleRightDock,
  activeCockpitDeck = 'inspector',
  onSelectCockpitDeck,
  onOpenGems,
  onOpenPrintModal
}) {
  const navigate = useNavigate();
  const { 
    universeState, 
    setUniverseState, 
    activeScenarioId, 
    setActiveScenarioId, 
    addStory, 
    updateStory, 
    deleteStory, 
    moveStory, 
    reorderStory, 
    reorderRelativeScenario, 
    triggerStorySave, 
    handleSaveStory, 
    handleLoadStory, 
    addMap, 
    activeMapId,
    setActiveMapId, 
    updateProjectName, 
    isStoryReadOnly, 
    clonePublicStory,
    createNewStory,
    deleteStoryProject,
    elementsCatalog,
    mapsCatalog,
    updateSavedElement,
    deleteSavedElement
  } = useStory();

  const { currentUser, userHandle } = useAuth();
  const { toast } = useToast();

  // Internal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState(null);
  const [localContent, setLocalContent] = useState('');
  const [isEditElementModalOpen, setIsEditElementModalOpen] = useState(false);
  const [editingModalElement, setEditingModalElement] = useState(null);
  const [localWorkspaceTab, setLocalWorkspaceTab] = useState('weaver'); // 'weaver' | 'stage' | 'tactical' | 'interactive'
  const [isSplitView, setIsSplitView] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Outliner left-column dual-mode tab: 'scenarios' | 'elements'
  const [outlinerTab, setOutlinerTab] = useState('scenarios');
  const [outlinerElementTypeFilter, setOutlinerElementTypeFilter] = useState('All');

  // Right Dock Tab state: 'inspector' | 'tactical' | 'elements' | 'aime'
  const [localDockTab, setLocalDockTab] = useState(activeCockpitDeck || 'inspector');
  const dockTab = activeCockpitDeck || localDockTab;
  const setDockTab = (tab) => {
    setLocalDockTab(tab);
    if (onSelectCockpitDeck) onSelectCockpitDeck(tab);
  };

  // World Elements search in Cockpit Dock
  const [elementSearch, setElementSearch] = useState('');
  const [selectedElementTypeFilter, setSelectedElementTypeFilter] = useState('Persona');

  const rawWorkspaceTab = propWorkspaceTab || localWorkspaceTab;
  const scenarioWorkspaceTab = (rawWorkspaceTab === 'canvas' || rawWorkspaceTab === 'manuscript')
    ? 'weaver'
    : (rawWorkspaceTab === 'control-panel' ? 'tactical' : (rawWorkspaceTab === 'map' || rawWorkspaceTab === 'stage' ? 'stage' : rawWorkspaceTab));
  const setScenarioWorkspaceTab = propSetWorkspaceTab || setLocalWorkspaceTab;

  const mapFileInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Unified Map Catalog access (global mapsCatalog + project maps)
  const allAvailableMaps = useMemo(() => {
    const catalog = mapsCatalog || [];
    const projectMaps = (universeState?.maps || []).filter(m => !catalog.some(cm => cm.id === m.id));
    return [...catalog, ...projectMaps];
  }, [mapsCatalog, universeState?.maps]);

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

  useEffect(() => {
    if (activeNode && activeNode.content !== localContent) {
      setLocalContent(activeNode.content || '');
    } else if (!activeNode) {
      setLocalContent('');
    }
  }, [activeScenarioId, activeNode?.content]);

  const handleContentChange = (val) => {
    setLocalContent(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (activeScenarioId) {
        updateStory(activeScenarioId, { content: val });
      }
    }, 300);
  };

  const handleTitleChange = (e) => {
    if (activeScenarioId) {
      updateStory(activeScenarioId, { title: e.target.value });
    }
  };

  const handleOpenAddModal = (targetParentId = null) => {
    setModalParentId(targetParentId);
    if (outlinerTab === 'scenarios') {
      setIsScenarioModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleAddElement = ({ type, title, parentId, customFields, fields, imageUrl }) => {
    const newNode = {
      id: uuidv4(),
      type,
      title,
      content: '',
      fields: fields || {},
      imageUrl: imageUrl || '',
      customFields: customFields || [],
      children: []
    };
    addStory(newNode, parentId);
    setActiveScenarioId(newNode.id);
  };

  const handleDeleteElement = async (id, title) => {
    const ok = await confirmTypedDeletion(title || 'story element', 'story element');
    if (ok) {
      deleteStory(id);
    }
  };

  const handleInsertMention = (elem) => {
    if (!elem) return;
    const cleanTitle = (elem.title || 'Untitled').replace(/["'<>]/g, '');
    const chipHtml = `<span class="tangent-entity-chip bg-cyan-900/60 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40 font-semibold" data-entity-id="${elem.id}" data-entity-type="${elem.type || 'Custom'}">@${cleanTitle}</span>&nbsp;`;
    const updatedContent = localContent ? `${localContent} ${chipHtml}` : chipHtml;
    setLocalContent(updatedContent);
    if (activeScenarioId) {
      const currentLinked = Array.isArray(activeNode?.linkedElements) ? activeNode.linkedElements : [];
      updateStory(activeScenarioId, { 
        content: updatedContent,
        linkedElements: Array.from(new Set([...currentLinked, elem.id]))
      });
    }
  };

  const handleToggleLinkElement = (elemId) => {
    if (!activeScenarioId) return;
    const currentLinked = Array.isArray(activeNode?.linkedElements) ? activeNode.linkedElements : [];
    const updated = currentLinked.includes(elemId)
      ? currentLinked.filter(id => id !== elemId)
      : [...currentLinked, elemId];
    updateStory(activeScenarioId, { linkedElements: updated });
  };

  // Map file handlers
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

  // Render tactical WebGPU Stage viewport with sector picker, architect tools, and waypoint HUD
  const renderTacticalStage = () => {
    return (
      <div className="flex-1 flex flex-col h-full w-full min-h-0 overflow-hidden bg-[#070b13] relative">
        {/* Tactical Stage Header Bar */}
        <div className="h-10 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 z-20 gap-2">
          {/* Left: Map status and selector */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold shrink-0">
              <Swords size={14} className="text-purple-400" />
              <span className="hidden sm:inline">Tactical Stage</span>
            </div>

            <div className="h-4 w-px bg-slate-800 shrink-0" />

            {/* Map Selector */}
            <div className="flex items-center gap-1.5 min-w-0">
              <MapIcon size={12} className="text-slate-400 shrink-0" />
              <select
                value={activeNode?.mapId || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  if (activeNode) {
                    updateStory(activeNode.id, { mapId: val });
                    if (val && setActiveMapId) setActiveMapId(val);
                  }
                }}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 max-w-[200px] truncate"
                title="Select linked map for this scenario node"
              >
                <option value="">-- No Map Linked --</option>
                {allAvailableMaps.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title || m.name || `Sector ${m.id.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* New Sector Button */}
            <button
              type="button"
              onClick={handleCreateNewMapForElement}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Spawn a new blank tactical grid sector for this scenario"
            >
              <Plus size={11} />
              <span className="hidden sm:inline">New Sector</span>
            </button>

            {/* Architect / Map Maker button if linked */}
            {(activeNode?.mapId || linkedMap?.id) && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const targetMapId = activeNode?.mapId || linkedMap?.id;
                    navigate(`/map-maker?mapId=${targetMapId}`);
                  }}
                  className="px-2 py-1 bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Launch Map Maker / Architect for this tactical grid"
                >
                  <Hammer size={11} />
                  <span className="hidden sm:inline">Sector Architect</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeNode) {
                      updateStory(activeNode.id, { mapId: null });
                    }
                  }}
                  className="p-1 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded text-xs transition-colors cursor-pointer"
                  title="Unlink map from this scenario"
                >
                  <X size={13} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tactical Stage Viewport or Empty State */}
        <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-[#050810]">
          {activeNode?.mapId || linkedMap?.id ? (
            <>
              <StageViewportWrapper
                campaignId={universeState?.id}
                sceneId={activeNode?.mapId || linkedMap?.id}
              />
              <WaypointPromptChip
                promptData={waypointPromptData}
                onExecute={executeWaypointTrigger}
                onClose={() => setWaypointPromptData(null)}
              />
            </>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 mb-4 shadow-xl">
                <Swords size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-1">No Tactical Sector Linked</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Connect a tactical battlemap to this scenario node to unlock live WebGPU rendering, token management, dynamic lighting, and narrative waypoints.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateNewMapForElement}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create New Sector</span>
                </button>
                {allAvailableMaps.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && activeNode) {
                        updateStory(activeNode.id, { mapId: e.target.value });
                        if (setActiveMapId) setActiveMapId(e.target.value);
                      }
                    }}
                    className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-xs cursor-pointer focus:outline-none focus:border-purple-500"
                  >
                    <option value="" disabled>Link existing sector...</option>
                    {allAvailableMaps.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.title || m.name || `Sector ${m.id.slice(0, 6)}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
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
      <style>{`
        .quill-dark-wrapper .ql-toolbar.ql-snow {
          position: relative;
          z-index: 10;
          background-color: #0c1017;
          border-color: #1e293b;
          border-top: none;
          border-left: none;
          border-right: none;
          padding: 6px 12px;
        }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-stroke { stroke: #94a3b8; }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-fill { fill: #94a3b8; }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-picker { color: #94a3b8; font-family: inherit; font-size: 11px; }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-picker-options {
          background-color: #1e293b;
          border-color: #334155;
          color: #f1f5f9;
          z-index: 100 !important;
        }
        .quill-dark-wrapper .ql-container.ql-snow {
          border: none;
          background-color: #090d16;
          color: #e2e8f0;
          font-size: 0.95rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .quill-dark-wrapper .ql-editor {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          line-height: 1.7;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
        .quill-dark-wrapper .ql-editor.ql-blank::before {
          color: #475569;
          font-style: italic;
        }
      `}</style>

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
      <div className={`h-full flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 z-10 shrink-0 ${
        isTreeExpanded ? 'w-64 xl:w-72' : 'w-0 hidden'
      }`}>
        {/* Outliner Dual-Tab Header */}
        <div className="p-2 border-b border-slate-800 flex justify-between items-center bg-slate-950/90 shrink-0 gap-1 font-mono">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                setOutlinerTab('scenarios');
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                outlinerTab === 'scenarios'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Story Outliner: Acts, chapters, scenes, and narrative hierarchy"
            >
              <Layers size={11} />
              <span>Scenarios</span>
            </button>
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                setOutlinerTab('elements');
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                outlinerTab === 'elements'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="World Elements: Personas, factions, items, locations, tech, and lore"
            >
              <Box size={11} />
              <span>Elements</span>
              <span className="text-[8px] px-1 py-0.1 rounded-full bg-slate-950/60 text-emerald-300 font-mono">
                {elementsCatalog?.length || 0}
              </span>
            </button>
          </div>

          {outlinerTab === 'scenarios' ? (
            <button 
              type="button"
              onClick={() => handleOpenAddModal(activeScenarioId)}
              className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold rounded-lg uppercase transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Add Root or Sub-Scenario Node"
            >
              <Plus size={11} />
              <span>Add</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => {
                setEditingModalElement({
                  id: uuidv4(),
                  type: outlinerElementTypeFilter !== 'All' ? outlinerElementTypeFilter : 'Persona',
                  title: 'New World Element',
                  fields: {},
                  content: ''
                });
                setIsEditElementModalOpen(true);
              }}
              className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold rounded-lg uppercase transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Create New World Element"
            >
              <Plus size={11} />
              <span>New</span>
            </button>
          )}
        </div>

        {/* Filter Input & Element Type Pills */}
        <div className="px-2 py-1.5 border-b border-slate-800 bg-slate-950/40 shrink-0 space-y-1.5 font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <Search size={12} className="text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={outlinerTab === 'scenarios' ? "Filter scenarios..." : "Filter elements..."}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none w-full font-mono"
            />
            {searchFilter && (
              <button onClick={() => setSearchFilter('')} className="text-slate-500 hover:text-slate-300 text-[10px] cursor-pointer">
                ✕
              </button>
            )}
          </div>

          {outlinerTab === 'elements' && (
            <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
              {['All', 'Persona', 'Faction', 'Location', 'Item', 'Lore', 'Clue', 'Tech', 'Species'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOutlinerElementTypeFilter(t)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    outlinerElementTypeFilter === t
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Outliner Body */}
        {outlinerTab === 'scenarios' ? (
          /* Scenario Tree Feed */
          <div className="flex-1 overflow-auto py-2 px-1.5 scrollbar-thin">
            {universeState.scenarios.length === 0 ? (
              <div className="text-slate-500 text-xs text-center italic mt-10 p-4 font-mono">
                No scenarios yet.<br/>Click "+ Add" to begin your campaign outline.
              </div>
            ) : (
              <>
                {universeState.scenarios.map(node => (
                  <TreeNode 
                    key={node.id} 
                    node={node} 
                    activeId={activeScenarioId} 
                    onSelect={setActiveScenarioId} 
                    onDelete={handleDeleteElement}
                    onMove={moveStory}
                    onReorderRelative={reorderRelativeScenario}
                    onAddChild={handleOpenAddModal}
                    filterQuery={searchFilter}
                  />
                ))}

                {/* Drop to Root Area */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId) moveStory(draggedId, null);
                  }}
                  className="mt-6 p-2.5 border border-dashed border-slate-800/80 hover:border-cyan-500/60 rounded-xl text-center text-[10px] text-slate-500 uppercase tracking-wider hover:text-cyan-400 transition-colors font-mono"
                >
                  📥 Drop here to move to Root
                </div>
              </>
            )}
          </div>
        ) : (
          /* World Elements Feed */
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin flex flex-col font-mono">
            {filteredOutlinerElements.length === 0 ? (
              <div className="text-slate-500 text-xs text-center italic mt-10 p-4">
                No world elements found.<br/>Click "+ New" to forge one.
              </div>
            ) : (
              filteredOutlinerElements.map(elem => {
                const isLinked = (activeNode?.linkedElements || []).includes(elem.id);

                return (
                  <div
                    key={elem.id}
                    className={`p-2 rounded-xl border transition-all space-y-1 group ${
                      isLinked 
                        ? 'bg-cyan-950/40 border-cyan-500/50' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0 ${getTypePillStyle(elem.type)}`}>
                        {elem.type || 'Custom'}
                      </span>
                      <span 
                        className="text-xs font-bold text-slate-200 truncate flex-1 ml-1 cursor-pointer hover:text-cyan-300"
                        title="Click to edit element details"
                        onClick={() => {
                          setEditingModalElement(elem);
                          setIsEditElementModalOpen(true);
                        }}
                      >
                        {elem.title || 'Untitled'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingModalElement(elem);
                          setIsEditElementModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-[9px] text-slate-400 hover:text-cyan-300 transition-opacity cursor-pointer shrink-0"
                        title="Edit Element"
                      >
                        ✏️
                      </button>
                    </div>

                    {elem.content && (
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                        {elem.content.replace(/<[^>]+>/g, '')}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-850 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleInsertMention(elem)}
                        className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer text-[9px]"
                        title="Insert @Mention chip into active scenario prose"
                      >
                        @Mention
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleLinkElement(elem.id)}
                        className={`font-bold transition-colors cursor-pointer text-[9px] ${
                          isLinked ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-white'
                        }`}
                        title={isLinked ? 'Unlink from active scenario node' : 'Link to active scenario node'}
                      >
                        {isLinked ? '✓ Linked' : '+ Link'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Bottom Open Full Forge Launcher */}
            {onSwitchView && (
              <div className="mt-auto pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    onSwitchView('elements');
                  }}
                  className="w-full py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  title="Open full Element Forge database studio workspace"
                >
                  <Box size={12} />
                  <span>Open Full Element Forge ↗</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ZONE 2: PRIMARY CREATIVE STAGE (Center Column) ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16] relative min-w-0">
        {!activeNode && scenarioWorkspaceTab !== 'interactive' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 select-none">
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
        ) : !activeNode && scenarioWorkspaceTab === 'interactive' ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#080c14]">
            <InteractiveStoryStudio
              activeNode={null}
              onSelectScenario={(id) => setActiveScenarioId(id)}
            />
          </div>
        ) : (
          <>
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

            {/* SPLIT VIEW: SIDE-BY-SIDE MANUSCRIPT + TACTICAL STAGE */}
            {isSplitView ? (
              <Split
                sizes={[50, 50]}
                minSize={[320, 320]}
                gutterSize={6}
                direction="horizontal"
                className="flex h-full w-full overflow-hidden split-horizontal flex-1 min-h-0"
              >
                {/* Left: Story Weaver (Manuscript, Beats, Genesis) */}
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
                  {renderTacticalStage()}
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
                    {renderTacticalStage()}
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
          </>
        )}
      </div>

      {/* ── ZONE 3: MASTER COCKPIT DOCK (Right Column) ── */}
      {isRightDockOpen && (
        <aside className="w-80 xl:w-96 flex-shrink-0 bg-slate-900/98 border-l border-slate-800 flex flex-row h-full z-20 backdrop-blur-xl shadow-2xl transition-all">
          {/* Main Content Column of Right Dock */}
          <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-slate-900/90">
            {/* Dock Content Header */}
            <div className="p-2 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-1 shrink-0 font-mono">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                {dockTab === 'inspector' && (
                  <span className="text-cyan-300 flex items-center gap-1">
                    <FileText size={13} className="text-cyan-400" />
                    <span>Inspector &amp; Fields</span>
                  </span>
                )}
                {dockTab === 'tactical' && (
                  <span className="text-amber-300 flex items-center gap-1">
                    <Swords size={13} className="text-amber-400" />
                    <span>Tactical Encounter</span>
                  </span>
                )}
                {dockTab === 'elements' && (
                  <span className="text-purple-300 flex items-center gap-1">
                    <Box size={13} className="text-purple-400" />
                    <span>World Elements</span>
                  </span>
                )}
                {dockTab === 'aime' && (
                  <span className="text-amber-300 flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>AIME Co-Pilot</span>
                  </span>
                )}
              </div>
              {onToggleRightDock && (
                <button
                  type="button"
                  onClick={onToggleRightDock}
                  className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-850 rounded transition-colors cursor-pointer"
                  title="Close Cockpit Dock (])"
                >
                  <X size={13} />
                </button>
              )}
            </div>

          {/* DOCK TAB 1: INSPECTOR & FIELDS */}
          {dockTab === 'inspector' && (
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {activeNode ? (
                <>
                  {/* Image Uploader Card */}
                  <ElementImageUploader activeNode={activeNode} updateStory={updateStory} />

                  {/* Linked Entities Pill Bar */}
                  <div className="p-3 bg-slate-950/40 border-b border-slate-800 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span>🧩</span> Linked Entities:
                      </span>
                      <button
                        type="button"
                        onClick={() => setDockTab('elements')}
                        className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        + Link from Catalog
                      </button>
                    </div>

                    {(!activeNode.linkedElements || activeNode.linkedElements.length === 0) ? (
                      <p className="text-[10px] text-slate-500 italic">No entities linked to this scene yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {activeNode.linkedElements.map(elemId => {
                          const elem = (elementsCatalog || []).find(e => e.id === elemId);
                          if (!elem) return null;
                          return (
                            <span
                              key={elem.id}
                              className={`text-[9px] px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${getTypePillStyle(elem.type)}`}
                            >
                              <span>{elem.title || 'Untitled'}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleLinkElement(elem.id)}
                                className="text-slate-400 hover:text-red-400 font-bold ml-1 cursor-pointer"
                                title="Unlink element"
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Type-Specific Structured Fields */}
                  <ElementFieldsEditor activeNode={activeNode} updateStory={updateStory} />
                </>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  Select an element to inspect its fields
                </div>
              )}
            </div>
          )}

          {/* DOCK TAB 2: TACTICAL & MAP DECK */}
          {dockTab === 'tactical' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono scrollbar-thin">
              {/* Linked Tactical Map Asset Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🗺️</span> Tactical Map Asset
                  </span>
                  {linkedMap && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                      Linked
                    </span>
                  )}
                </div>

                {linkedMap ? (
                  <div className="space-y-2.5">
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-xs font-bold text-cyan-300 truncate">{linkedMap.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Grid: <strong>{linkedMap.gridMode || 'Square'}</strong></span>
                        <span>•</span>
                        <span>Objects: <strong>{(linkedMap.objects?.length || 0) + (linkedMap.tokens?.length || 0)}</strong></span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setActiveMapId(linkedMap.id);
                          setScenarioWorkspaceTab('weaver');
                        }}
                        className="w-full p-2.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/60 text-cyan-200 text-xs font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        title="Open tactical map and events in Story Weaver"
                      >
                        <span>🌟</span> Open in Story Weaver
                      </button>
                    </div>

                    <button
                      onClick={() => updateStory(activeNode.id, { mapId: null })}
                      className="w-full py-1 text-slate-500 hover:text-red-400 text-[10px] font-bold uppercase transition-colors"
                    >
                      Unlink Map ✕
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="p-2.5 bg-slate-950 border border-dashed border-slate-800 rounded-xl text-center text-[10px] text-slate-500 italic">
                      No tactical map linked to this scenario.
                    </div>

                    {/* Select existing map from unified catalog */}
                    {allAvailableMaps && allAvailableMaps.length > 0 && (
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                          Link Map from Catalog:
                        </label>
                        <select
                          value={activeNode?.mapId || ''}
                          onChange={(e) => updateStory(activeNode.id, { mapId: e.target.value || null })}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs p-2 rounded-xl outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="">-- Select Map from Catalog ({allAvailableMaps.length}) --</option>
                          {allAvailableMaps.map(m => (
                            <option key={m.id} value={m.id}>
                              🗺️ {m.title || 'Untitled Map'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => mapFileInputRef.current?.click()}
                        className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>📥</span> Import
                      </button>

                      <button
                        onClick={handleCreateNewMapForElement}
                        className="p-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/60 text-amber-300 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>➕</span> New Map
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OSR Tactical Quick Glance */}
              {activeNode && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎛️</span> Tactical Overview
                    </span>
                    <button
                      onClick={() => setScenarioWorkspaceTab('control-panel')}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Open Spread ❯
                    </button>
                  </div>

                  {/* Read-Aloud Preview */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sensory Read-Aloud:</span>
                    <p className="p-2 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] text-amber-100 italic leading-relaxed">
                      {activeNode.fields?.readAloud || 'No read-aloud GM script drafted yet.'}
                    </p>
                  </div>

                  {/* Threat Count */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Encounter Threats:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {(activeNode.fields?.threats || []).length} Entities
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DOCK TAB 3: IN-SITU WORLD ELEMENTS DECK */}
          {dockTab === 'elements' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden font-mono">
              {/* Search & Actions Header */}
              <div className="p-2.5 border-b border-slate-800 bg-slate-950/60 space-y-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
                  <Search size={12} className="text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={elementSearch}
                    onChange={(e) => setElementSearch(e.target.value)}
                    placeholder="Search world elements..."
                    className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none w-full font-mono"
                  />
                  {elementSearch && (
                    <button onClick={() => setElementSearch('')} className="text-slate-500 hover:text-slate-300 text-[10px]">
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
                  {['Persona', 'Faction', 'Item', 'Location', 'Lore', 'All'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedElementTypeFilter(t)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                        selectedElementTypeFilter === t
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Elements List Feed */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                {filteredCatalog.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic">
                    No matching world elements found.
                  </div>
                ) : (
                  filteredCatalog.map(elem => {
                    const isLinked = (activeNode?.linkedElements || []).includes(elem.id);

                    return (
                      <div
                        key={elem.id}
                        className={`p-2 rounded-xl border transition-all space-y-1.5 ${
                          isLinked 
                            ? 'bg-cyan-950/40 border-cyan-500/50' 
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getTypePillStyle(elem.type)}`}>
                            {elem.type || 'Custom'}
                          </span>
                          <span className="text-xs font-bold text-slate-200 truncate flex-1 ml-1.5">
                            {elem.title || 'Untitled'}
                          </span>
                        </div>

                        {elem.content && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                            {elem.content.replace(/<[^>]+>/g, '')}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-850 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleInsertMention(elem)}
                            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
                            title="Insert @Mention into active story prose"
                          >
                            @Mention
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleLinkElement(elem.id)}
                            className={`font-bold transition-colors cursor-pointer ${
                              isLinked ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {isLinked ? '✓ Linked' : '+ Link'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom New Element Button */}
              <div className="p-2 border-t border-slate-800 bg-slate-950/80 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingModalElement({
                      id: uuidv4(),
                      type: 'Persona',
                      title: 'New World Element',
                      fields: {},
                      content: ''
                    });
                    setIsEditElementModalOpen(true);
                  }}
                  className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow cursor-pointer"
                >
                  <Plus size={13} />
                  <span>New Element</span>
                </button>

                {onSwitchView && (
                  <button
                    type="button"
                    onClick={() => onSwitchView('elements')}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
                    title="Open Full Element Forge Database"
                  >
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DOCK TAB 4: AIME CO-PILOT DECK */}
          {dockTab === 'aime' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0d14]">
              <AIMEChatBox
                onClose={() => setDockTab('inspector')}
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
                  customCatalog: elementsCatalog || []
                }}
              />
            </div>
          )}
          </div>

          {/* Dedicated Right-Side Cockpit Navigation Rail */}
          <div className="w-14 shrink-0 bg-slate-950 border-l border-slate-800 flex flex-col items-center py-2 gap-2 select-none z-10">
            {/* Top Close / Collapse Indicator */}
            {onToggleRightDock && (
              <button
                type="button"
                onClick={onToggleRightDock}
                className="w-10 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 transition-colors cursor-pointer mb-1"
                title="Collapse Cockpit Dock (])"
              >
                <PanelRightClose size={14} />
              </button>
            )}

            {/* TAB 1: Inspector */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setDockTab('inspector');
              }}
              className={`w-11 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative cursor-pointer ${
                dockTab === 'inspector'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
              title="Element Fields & Image Inspector"
            >
              {dockTab === 'inspector' && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-l shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}
              <FileText size={16} className={dockTab === 'inspector' ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-300'} />
              <span className="text-[9px] font-bold tracking-tight uppercase leading-none font-mono">
                Inspect
              </span>
            </button>

            {/* TAB 2: Tactical */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setDockTab('tactical');
              }}
              className={`w-11 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative cursor-pointer ${
                dockTab === 'tactical'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
              title="Tactical Map & Encounter Integration"
            >
              {dockTab === 'tactical' && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-l shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
              <Swords size={16} className={dockTab === 'tactical' ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-300'} />
              <span className="text-[9px] font-bold tracking-tight uppercase leading-none font-mono">
                Tactical
              </span>
            </button>

            {/* TAB 3: World Elements */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setDockTab('elements');
              }}
              className={`w-11 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative cursor-pointer ${
                dockTab === 'elements'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
              title="In-Situ Worldbuilding Elements"
            >
              {dockTab === 'elements' && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-400 rounded-l shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
              <Box size={16} className={dockTab === 'elements' ? 'text-purple-300' : 'text-slate-400 group-hover:text-purple-300'} />
              <span className="text-[9px] font-bold tracking-tight uppercase leading-none font-mono">
                World
              </span>
            </button>

            {/* TAB 4: AIME Assistant */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setDockTab('aime');
              }}
              className={`w-11 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative cursor-pointer ${
                dockTab === 'aime'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
              title="AI Story Assistant & Overseer"
            >
              {dockTab === 'aime' && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-l shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
              <Sparkles size={16} className={dockTab === 'aime' ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-300'} />
              <span className="text-[9px] font-bold tracking-tight uppercase leading-none font-mono">
                AIME
              </span>
            </button>
          </div>
        </aside>
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
    </div>
  );
}
