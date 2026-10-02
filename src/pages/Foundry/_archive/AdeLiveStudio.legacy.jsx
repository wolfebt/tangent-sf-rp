/**
 * @file AdeLiveStudio.jsx
 * @description Master Consolidated ADE Live Studio — Adventure Development & Tactical Stage Platform.
 * Unifies the Adventure Development Environment (Story Foundry, Story Weaver, Scenarios, Beats,
 * OSR Control Spread, Interactive Story, Story Gallery, and Element Forge) and the Virtual Tabletop
 * (The Stage, WebGPU Cartography, Token Simulation, Smart Props, Hazards, and Dynamic Lighting) into
 * a single cohesive live authoring and session play environment.
 * 
 * Features:
 * - Multilayered Guide Rails: Module Hierarchy, Scenario Outliner, Waypoints, Bestiary, Props, Environment, Memory, AIME.
 * - Mode Toggle: [DEVELOPMENT MODE (ARCHITECT)] ⇄ [RUNNING LIVE (SESSION PLAY)].
 * - Multi-Workspace Side-by-Side Live Environment:
 *     1. Story Weaver (Manuscript & Prose, Outline & Beats, Tactical Events, Genesis)
 *     2. OSR 2-Page Control Spread (Sensory Read-Aloud, DCs, Threats, Secrets)
 *     3. Interactive Play Studio (Branching Decisions, Persona Integration, Skill Checks)
 *     4. Story Asset Gallery (Elements, Maps, Situational & Environmental Modifiers, Element Forge)
 * - Prompt-Driven Waypoints: Interactive confirmation chip on objective arrival during live play.
 * - Smart Map Objects & Props: Bulkheads, Terminals, Loot Crates, and Hazard Vents with live stage sync.
 * - Complete Modal Suite: Project Catalog, Guidance Gems, Cronicle Living Memory, VTT Compiler,
 *   ADE Guide, User Settings, Element Extractor, and Element Forge Modals.
 * - Save, Import & Export: Complete .tangent-module.json portability and local snapshots.
 * - Selective Printability: Integrated SelectivePrintModal for custom book & module generation.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Split from 'react-split';
import { 
  BookOpen, 
  Map as MapIcon, 
  Flag, 
  Users, 
  Box, 
  CloudSun, 
  Scroll, 
  Sparkles, 
  Play, 
  ExternalLink,
  Layers, 
  Feather,
  Target,
  Wand2,
  Radio,
  FolderOpen,
  GitBranch
} from 'lucide-react';
import { useCampaign, useStory } from '../../../context/CampaignContext';
import { useEngineStore, selectAllFusedTokens } from '../../../engine/index';
import { useUILayoutStore } from '../../../components/VTT/store/uiLayoutStore';
import { AudioService } from '../../../services/audioService';
import { VttEventBus } from '../../../utils/vttEventBus';
import { StageViewportWrapper } from '../../../components/VTT/stage/StageViewportWrapper';
import StoryWeaver from '../StoryModule/workspaces/StoryWeaver';
import OsrControlPanelDeck from '../StoryModule/workspaces/OsrControlPanelDeck';
import InteractiveStoryStudio from '../StoryModule/workspaces/InteractiveStoryStudio';
import StoryGallery from '../StoryModule/workspaces/StoryGallery';
import VisualStoryGraph from '../StoryModule/workspaces/VisualStoryGraph';
import FoundryLauncherModal from '../../../components/StoryFoundry/FoundryLauncherModal';
import GuidanceGemsModal from '../StoryModule/GuidanceGemsModal';
import CronicleDeckModal from '../../../components/StoryFoundry/Cronicle/CronicleDeckModal';
import VttCompilerModal from '../../../components/StoryFoundry/VttCompilerModal';
import StoryFoundryGuideModal from '../../../components/StoryFoundry/StoryFoundryGuideModal';
import UserSettingsModal from '../../../components/UserSettingsModal';
import EditElementModal from '../ElementForge/EditElementModal';
import StoryElementExtractorModal from '../StoryModule/StoryElementExtractorModal';
import CreateScenarioModal from '../StoryModule/CreateScenarioModal';
import AIMEChatBox from '../AIME/AIMEChatBox';
import SelectivePrintModal from '../../../components/StoryFoundry/SelectivePrintModal';
import WaypointPromptChip from '../../../components/VTT/stage/WaypointPromptChip';
import { showToast } from '../../../context/ToastContext';
import { streamContent } from '../../../services/aimeService';
import { 
  exportModuleToFile, 
  parseAndValidateModuleFile, 
  hydrateModuleIntoCampaign, 
  saveLocalModuleSnapshot 
} from '../../../services/modulePackageService';
import { 
  createBlankCanvas, 
  createDerelictStarshipMap, 
  createResearchOutpostMap 
} from '../../../components/VTT/stage/defaultMaps';
import { ATMOSPHERIC_PRESETS } from '../../../engine/vision/LightSourceManager';
import { v4 as uuidv4 } from 'uuid';
import { useADEStore } from '../store/adeStore';
import { useWaypointEngine } from './hooks/useWaypointEngine';
import { AdeMasterControlBar } from './AdeMasterControlBar';
import { AdeGuideRailDrawer } from './AdeGuideRailDrawer';

export const AdeLiveStudio = ({ defaultSplit = null, defaultView = null }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlMapId = searchParams.get('mapId');
  const urlScenarioId = searchParams.get('scenarioId');
  const urlTab = searchParams.get('tab') || searchParams.get('view') || defaultView;
  const urlSplit = searchParams.get('split') || defaultSplit;

  // Campaign & Story Context
  const { 
    universeState, 
    activeMapId, 
    setActiveMapId, 
    updateMap, 
    addMap,
    deleteMap,
    addStory,
    updateStory,
    deleteStory,
    elementsCatalog,
    addSavedElement,
    updateSavedElement,
    deleteSavedElement,
    setGalleryModifiers
  } = useCampaign();

  const storyContext = useStory() || {};

  // ── CORE STATE: CENTRALIZED ADE STORE (Zustand) ──
  const {
    studioMode,
    setStudioMode,
    viewportSplit,
    setViewportSplit,
    activeGuideSection,
    setActiveGuideSection,
    isDrawerOpen,
    setIsDrawerOpen,
    storyWorkspaceTab,
    setStoryWorkspaceTab,
    cronicleInitialMode,
    setCronicleInitialMode,
    modals,
    setModal
  } = useADEStore();

  // Sync URL parameters / props with store
  useEffect(() => {
    if (urlSplit === 'story_only' || urlSplit === 'story') {
      setViewportSplit('story_only');
    } else if (urlSplit === 'canvas_only' || urlSplit === 'canvas') {
      setViewportSplit('canvas_only');
    } else if (urlSplit === 'side_by_side') {
      setViewportSplit('side_by_side');
    }
  }, [urlSplit, setViewportSplit]);

  useEffect(() => {
    if (urlTab === 'tactical' || urlTab === 'control-panel') setStoryWorkspaceTab('tactical');
    else if (urlTab === 'interactive') setStoryWorkspaceTab('interactive');
    else if (urlTab === 'gallery' || urlTab === 'elements') setStoryWorkspaceTab('gallery');
    else if (urlTab === 'graph') setStoryWorkspaceTab('graph');
    else if (urlTab === 'weaver') setStoryWorkspaceTab('weaver');
  }, [urlTab, setStoryWorkspaceTab]);

  // Active Scenario Resolution
  const scenarios = universeState?.scenarios || [];
  const [activeScenarioId, setActiveScenarioId] = useState(urlScenarioId || scenarios[0]?.id || null);

  const activeScenario = useMemo(() => {
    if (!scenarios || scenarios.length === 0) return null;
    const findNode = (nodes) => {
      for (const n of nodes) {
        if (n.id === activeScenarioId) return n;
        if (n.children && n.children.length > 0) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findNode(scenarios) || scenarios[0] || null;
  }, [scenarios, activeScenarioId]);

  // Flattened scenarios list for rapid dropdown lookups and target references
  const flatScenarios = useMemo(() => {
    const list = [];
    const walk = (nodes) => {
      (nodes || []).forEach(n => {
        list.push(n);
        if (n.children && n.children.length > 0) walk(n.children);
      });
    };
    walk(scenarios);
    return list;
  }, [scenarios]);

  // Active Map Resolution
  const availableMaps = universeState?.maps || [];
  const activeMap = useMemo(() => {
    if (!availableMaps || availableMaps.length === 0) return null;
    if (activeMapId) {
      const found = availableMaps.find(m => m.id === activeMapId);
      if (found) return found;
    }
    if (activeScenario?.mapId) {
      const linked = availableMaps.find(m => m.id === activeScenario.mapId);
      if (linked) return linked;
    }
    return availableMaps[0] || null;
  }, [availableMaps, activeMapId, activeScenario?.mapId]);

  // Sync URL parameters
  useEffect(() => {
    if (activeMap?.id && activeMap.id !== urlMapId) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('mapId', activeMap.id);
        if (activeScenario?.id) next.set('scenarioId', activeScenario.id);
        if (storyWorkspaceTab) next.set('tab', storyWorkspaceTab);
        return next;
      }, { replace: true });
    }
  }, [activeMap?.id, activeScenario?.id, storyWorkspaceTab]);

  // ── MODALS STATE (LINKED TO CENTRALIZED ADE STORE) ──
  const isPrintModalOpen = modals.print;
  const setIsPrintModalOpen = (open) => setModal('print', open);

  const isCatalogOpen = modals.catalog;
  const setIsCatalogOpen = (open) => setModal('catalog', open);

  const isGemsOpen = modals.gems;
  const setIsGemsOpen = (open) => setModal('gems', open);

  const isCronicleOpen = modals.cronicle;
  const setIsCronicleOpen = (open) => setModal('cronicle', open);

  const isCompilerOpen = modals.compiler;
  const setIsCompilerOpen = (open) => setModal('compiler', open);

  const isGuideOpen = modals.guide;
  const setIsGuideOpen = (open) => setModal('guide', open);

  const isSettingsOpen = modals.settings;
  const setIsSettingsOpen = (open) => setModal('settings', open);

  const isExtractorOpen = modals.extractor;
  const setIsExtractorOpen = (open) => setModal('extractor', open);
  const [extractorInitialText, setExtractorInitialText] = useState('');

  const isEditModalOpen = modals.editElement;
  const setIsEditModalOpen = (open) => setModal('editElement', open);
  const [editingElement, setEditingElement] = useState(null);

  const isFloatingAimeOpen = modals.floatingAime;
  const setIsFloatingAimeOpen = (open) => setModal('floatingAime', open);

  const [saveStatusText, setSaveStatusText] = useState('All changes saved');
  const [isImportExportMenuOpen, setIsImportExportMenuOpen] = useState(false);
  const [isCreateScenarioModalOpen, setIsCreateScenarioModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Deploy any Story Element onto the Active Tactical Map
  const handleDeployElementToMap = (elem) => {
    if (!elem) return;
    const targetMap = activeMap || availableMaps[0];
    if (!targetMap) {
      showToast('No active map found. Spawn a tactical grid first!', 'warning');
      return;
    }

    const isPersona = elem.type === 'Persona';
    const targetX = 500;
    const targetY = 500;

    if (isPersona) {
      const newId = `${elem.id || 'token'}-${Date.now()}`;
      const isSyn = !!elem.isSynthetic || String(elem.species || '').toLowerCase().includes('synthetic');
      const staticToken = {
        id: newId,
        character_doc_id: elem.id,
        name: elem.title || 'Operative',
        base_hp: elem.health || elem.hp || 30,
        base_vitality: elem.vitality || 30,
        base_health: elem.health || elem.hp || 30,
        base_structure: elem.structure || 60,
        is_synthetic: isSyn,
        tech_level: elem.tech_level || 3,
        armor_dr: elem.dr || elem.armor_dr || 8,
        stamina_dr: elem.stamina_dr || 2,
        size_modifier: 0,
        speed_ft: elem.speed_ft || 30,
        species: elem.species || 'Human',
        archetype: elem.archetype || 'Operative',
        is_persona: true
      };
      useEngineStore.getState().loadStaticEntity(staticToken);
      useEngineStore.getState().updatePosition(newId, targetX, targetY);
      updateMap(targetMap.id, {
        tokens: [...(targetMap.tokens || []), { ...staticToken, x: targetX, y: targetY }]
      });
    } else {
      const rawType = elem.type || 'Custom';
      let objType = 'sensor_beacon';
      if (rawType === 'Item') objType = 'loot_container';
      else if (rawType === 'Hazard') objType = 'hazard_emitter';
      else if (rawType === 'Technology') objType = 'terminal';
      else if (rawType === 'bulkhead' || rawType === 'Door') objType = 'bulkhead';

      const newMapObj = {
        id: `obj-${elem.id || Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: objType,
        name: elem.title || `Story ${rawType}`,
        storyElementId: elem.id,
        storyElementType: rawType,
        x: targetX,
        y: targetY,
        isOpen: false,
        omnicortexGearId: elem.fields?.gearId || elem.id,
        readAloudText: elem.content || elem.fields?.summary || ''
      };

      updateMap(targetMap.id, {
        objects: [...(targetMap.objects || []), newMapObj]
      });
    }
    AudioService.playCriticalChime(true);
    showToast(`Deployed "${elem.title}" to ${targetMap.title || 'Tactical Sector'}!`, 'success');
  };

  // ── INLINE AIME DRAWER STATE ──
  const [aimePromptInput, setAimePromptInput] = useState('');
  const [isAimeGenerating, setIsAimeGenerating] = useState(false);
  const [aimeGeneratedProse, setAimeGeneratedProse] = useState('');

  // Live Token Tracking for Waypoint Detection in Live Session Mode
  const liveTokens = useEngineStore(selectAllFusedTokens);

  // ── WAYPOINT PROMPT & TRIGGER LOGIC (Phase 2 Bi-Directional Trigger Engine) ──
  const {
    waypointPromptData,
    setWaypointPromptData,
    editingWaypointId,
    setEditingWaypointId,
    executeWaypointTrigger,
    handleResetAllWaypoints,
    handleConfirmWaypointBeat,
    handleToggleAutoTrigger,
    handleAddWaypoint,
    handleArmWaypointTool,
    handlePanToWaypoint,
    handleDeleteWaypoint,
    handleAutoRouteFromBeats
  } = useWaypointEngine({
    activeMap,
    updateMap,
    activeScenario,
    flatScenarios,
    setActiveScenarioId,
    storyContext,
    studioMode,
    liveTokens,
    setSaveStatusText,
    setIsFloatingAimeOpen,
    setAimePromptInput
  });

  // ── SAVE, EXPORT & IMPORT ACTIONS ──
  const handleQuickSaveSnapshot = () => {
    const res = saveLocalModuleSnapshot(universeState, elementsCatalog);
    if (res.success) {
      setSaveStatusText(`Snapshot saved at ${res.timestamp}`);
      AudioService.playTerminalBeep(1200, 0.04);
      setTimeout(() => setSaveStatusText('All changes saved'), 4000);
    }
  };

  const handleExportModule = () => {
    setIsImportExportMenuOpen(false);
    exportModuleToFile(universeState, elementsCatalog);
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = parseAndValidateModuleFile(event.target?.result);
      if (result.isValid) {
        hydrateModuleIntoCampaign(result.data, {
          addMap,
          updateMap,
          addStory,
          updateStory,
          addSavedElement,
          setActiveMapId,
          setActiveScenarioId,
          setGalleryModifiers
        });
        setSaveStatusText('Module imported successfully');
      } else {
        setSaveStatusText(`Failed to import module: ${result.error}`);
        AudioService.playTerminalBeep(600, 0.05);
        setTimeout(() => setSaveStatusText('All changes saved'), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setIsImportExportMenuOpen(false);
  };

  // ── ENVIRONMENTAL PRESET APPLIER ──
  const handleApplyWeatherPreset = (presetKey) => {
    if (!activeMap || !updateMap) return;
    const preset = ATMOSPHERIC_PRESETS[presetKey];
    if (!preset) return;

    updateMap(activeMap.id, {
      atmosphericWeather: presetKey,
      environmental: {
        ...(activeMap.environmental || {}),
        weatherPreset: presetKey,
        ambientLightColor: preset.tintHex ? `#${preset.tintHex.toString(16).padStart(6, '0')}` : '#090d16',
        fogDensity: preset.fogDensity || 0,
        tintAlpha: preset.tintAlpha || 0
      }
    });

    VttEventBus.emit('apply-atmospheric-preset', { presetKey });
    AudioService.playTerminalBeep(1100, 0.03);
  };

  // ── SMART MAP OBJECTS & PROPS CONTROLS ──
  const handleCreateSmartProp = (type) => {
    if (!activeMap || !updateMap) return;
    const labels = {
      bulkhead: 'Blast Bulkhead Door',
      terminal: 'Data Terminal',
      crate: 'Supply Container',
      hazard: 'Gas Vent Emitter'
    };
    const newProp = {
      id: `obj_${type}_${uuidv4().slice(0, 8)}`,
      name: labels[type] || 'Map Prop',
      type,
      category: 'Objects',
      x: 380 + Math.random() * 160,
      y: 380 + Math.random() * 160,
      isOpen: false,
      state: 'active'
    };
    const updated = [...(activeMap.objects || []), newProp];
    updateMap(activeMap.id, { objects: updated });
    AudioService.playCriticalChime(true);
  };

  const handleToggleSmartProp = (prop) => {
    if (!activeMap || !updateMap) return;
    const newIsOpen = !prop.isOpen;
    const updated = (activeMap.objects || []).map(o => o.id === prop.id ? { ...o, isOpen: newIsOpen } : o);
    updateMap(activeMap.id, { objects: updated });
    VttEventBus.emit('stage-bulkhead-toggled', {
      objectId: prop.id,
      isOpen: newIsOpen,
      operativeId: 'gm',
      storyElementId: prop.storyElementId
    });
    AudioService.playTerminalBeep(1200, 0.04);
  };

  const handlePanToProp = (prop) => {
    if (!prop) return;
    VttEventBus.emit('pan-stage-to', { x: prop.x, y: prop.y, zoom: 1.2 });
    AudioService.playTerminalBeep(1400, 0.02);
  };

  const handleDeleteSmartProp = (propId) => {
    if (!activeMap || !updateMap) return;
    const updated = (activeMap.objects || []).filter(o => o.id !== propId);
    updateMap(activeMap.id, { objects: updated });
    AudioService.playTerminalBeep(800, 0.04);
  };

  // ── INLINE AIME NARRATIVE CO-PILOT ACTIONS ──
  const handleRunAimePrompt = async (promptText) => {
    const p = promptText || aimePromptInput;
    if (!p || !p.trim() || isAimeGenerating) return;
    setIsAimeGenerating(true);
    setAimeGeneratedProse('');
    AudioService.playTerminalBeep(1200, 0.03);

    const contextData = {
      projectName: universeState?.projectName || 'Tangent Universe',
      activeScenario: activeScenario ? {
        title: activeScenario.title,
        summary: activeScenario.fields?.summary || '',
        content: activeScenario.content?.slice(0, 500) || ''
      } : null,
      weather: activeMap?.environmental?.weatherPreset || 'clear',
      tl: universeState?.techLevel || 3
    };

    try {
      let accumulated = '';
      await streamContent(p, contextData, (chunk) => {
        accumulated += chunk;
        setAimeGeneratedProse(accumulated);
      });
      AudioService.playCriticalChime(true);
    } catch (err) {
      console.error('AIME generation error:', err);
      setAimeGeneratedProse(`[AIME generation failed: ${err.message}]`);
    } finally {
      setIsAimeGenerating(false);
    }
  };

  const handleInsertAimeIntoScenario = () => {
    if (!aimeGeneratedProse || !activeScenario || !updateStory) return;
    const existing = activeScenario.content || '';
    const addition = `<p>${aimeGeneratedProse.replace(/\n/g, '<br/>')}</p>`;
    updateStory(activeScenario.id, { content: existing ? `${existing}<br/>${addition}` : addition });
    AudioService.playCriticalChime(false);
    setAimeGeneratedProse('');
  };

  // ── HAZARD PARTICLE CONTROLS ──
  const handleSpawnHazardField = (type) => {
    VttEventBus.emit('spawn-environmental-hazard', {
      type,
      x: 450 + Math.random() * 200,
      y: 350 + Math.random() * 200,
      radius: 120
    });
    AudioService.playCriticalChime(false);
  };

  const handleClearHazards = () => {
    VttEventBus.emit('clear-environmental-hazards');
    AudioService.playTerminalBeep(900, 0.03);
  };

  // ── GLOBAL HOTKEYS ([ toggles drawer, Ctrl+S saves snapshot) ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;

      if (e.key === '[') {
        e.preventDefault();
        setIsDrawerOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleQuickSaveSnapshot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [universeState, elementsCatalog]);

  // ── GUIDE RAILS ITEMS (LAYER 1) ──
  const guideRailItems = [
    { id: 'scenarios', label: 'SCENARIOS', icon: BookOpen, color: 'text-purple-400', count: scenarios.length },
    { id: 'maps', label: 'SECTORS', icon: MapIcon, color: 'text-cyan-400', count: availableMaps.length },
    { id: 'waypoints', label: 'WAYPOINTS', icon: Flag, color: 'text-amber-400', count: (activeMap?.waypoints || []).length },
    { id: 'elements', label: 'ELEMENTS', icon: Box, color: 'text-emerald-400', count: (elementsCatalog || []).length },
    { id: 'props', label: 'PROPS', icon: Box, color: 'text-blue-400', count: (activeMap?.objects || []).length },
    { id: 'environment', label: 'WEATHER', icon: CloudSun, color: 'text-teal-400' },
    { id: 'cronicle', label: 'MEMORY', icon: Scroll, color: 'text-amber-300', count: storyContext?.cronicle?.history?.length || 0 },
    { id: 'aime', label: 'AIME', icon: Sparkles, color: 'text-cyan-300' }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#070b13] text-slate-100 overflow-hidden font-sans select-none relative">
      
      {/* ── TOP MASTER BAR: PROJECT SWITCHER, MODE TOGGLE, SPLIT SWITCHER, UTILITIES ── */}
      <AdeMasterControlBar
        universeState={universeState}
        activeScenario={activeScenario}
        activeMap={activeMap}
        saveStatusText={saveStatusText}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        studioMode={studioMode}
        setStudioMode={setStudioMode}
        viewportSplit={viewportSplit}
        setViewportSplit={setViewportSplit}
        onOpenGems={() => setIsGemsOpen(true)}
        onOpenCronicle={() => {
          setCronicleInitialMode('living_memory');
          setIsCronicleOpen(true);
        }}
        cronicleCount={storyContext?.cronicle?.history?.length || 0}
        onOpenCompiler={() => setIsCompilerOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        isFloatingAimeOpen={isFloatingAimeOpen}
        onToggleFloatingAime={() => setIsFloatingAimeOpen(prev => !prev)}
        onQuickSaveSnapshot={handleQuickSaveSnapshot}
        isImportExportMenuOpen={isImportExportMenuOpen}
        setIsImportExportMenuOpen={setIsImportExportMenuOpen}
        fileInputRef={fileInputRef}
        onExportModule={handleExportModule}
        onImportFileChange={handleImportFileChange}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigateToClassic={() => navigate('/foundry/ade')}
      />

      {/* ── WORKSPACE BODY: MULTILAYERED GUIDE RAILS + DUAL-PANE VIEWPORT ── */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative">
        
        {/* ── LAYER 1 & 2: STRUCTURAL SLIM NAVIGATION RAIL + EXPANDABLE COMPONENT DRAWER ── */}
        <AdeGuideRailDrawer
          guideRailItems={guideRailItems}
          activeGuideSection={activeGuideSection}
          setActiveGuideSection={setActiveGuideSection}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}

          // Fast-Access Guide Rail Utilities
          onOpenGems={() => setIsGemsOpen(true)}
          gemsCount={universeState?.creativeState?.gems?.length || 0}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
          onOpenCompiler={() => setIsCompilerOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onNavigateToStoryFoundry={() => navigate('/foundry/story')}

          // 1. Scenarios
          scenarios={scenarios}
          activeScenario={activeScenario}
          setActiveScenarioId={setActiveScenarioId}
          onExtractProse={() => {
            setExtractorInitialText(activeScenario?.content || '');
            setIsExtractorOpen(true);
          }}
          onAddScenario={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            setIsCreateScenarioModalOpen(true);
          }}

          // 2. Maps
          availableMaps={availableMaps}
          activeMap={activeMap}
          setActiveMapId={setActiveMapId}
          onAddMap={() => {
            if (addMap) {
              const newMap = createBlankCanvas({ title: `Tactical Sector ${availableMaps.length + 1}` });
              addMap(newMap);
              if (setActiveMapId) setActiveMapId(newMap.id);
              AudioService.playCriticalChime(true);
            }
          }}

          // 3. Waypoints
          updateMap={updateMap}
          flatScenarios={flatScenarios}
          editingWaypointId={editingWaypointId}
          setEditingWaypointId={setEditingWaypointId}
          onResetAllWaypoints={handleResetAllWaypoints}
          onArmWaypointTool={handleArmWaypointTool}
          onAddWaypoint={handleAddWaypoint}
          onAutoRouteFromBeats={handleAutoRouteFromBeats}
          onPanToWaypoint={handlePanToWaypoint}
          onSimulateWaypointTrigger={(wp) => {
            const mockToken = liveTokens[0] || { id: 'sim_tok', name: 'Simulation Operative' };
            executeWaypointTrigger(wp, mockToken, wp.readAloudText);
          }}
          onDeleteWaypoint={handleDeleteWaypoint}

          // 4. Story Elements & Foundations
          elementsCatalog={elementsCatalog}
          onDeployElementToMap={handleDeployElementToMap}
          onNewElement={(type = 'Persona') => {
            setEditingElement({
              id: `elem_${Date.now()}`,
              title: type === 'Persona' ? 'New Operative' : `New ${type}`,
              type,
              content: '',
              fields: type === 'Persona' ? { mcmTier: 1, mcmRole: 'Operative' } : {}
            });
            setIsEditModalOpen(true);
          }}
          onEditElement={(element) => {
            setEditingElement(element);
            setIsEditModalOpen(true);
          }}
          onNewPersona={() => {
            setEditingElement({
              id: `elem_${Date.now()}`,
              title: 'New Operative',
              type: 'Persona',
              content: '',
              fields: { mcmTier: 1, mcmRole: 'Operative' }
            });
            setIsEditModalOpen(true);
          }}
          onEditPersona={(persona) => {
            setEditingElement(persona);
            setIsEditModalOpen(true);
          }}

          // 5. Smart Props
          onCreateSmartProp={handleCreateSmartProp}
          onToggleSmartProp={handleToggleSmartProp}
          onPanToProp={handlePanToProp}
          onDeleteSmartProp={handleDeleteSmartProp}

          // 6. Weather & Atmosphere
          onApplyWeatherPreset={handleApplyWeatherPreset}
          onClearHazards={handleClearHazards}
          onSpawnHazardField={handleSpawnHazardField}

          // 7. Cronicle Memory
          storyContext={storyContext}
          onOpenCronicleDeck={() => {
            setCronicleInitialMode('living_memory');
            setIsCronicleOpen(true);
          }}

          // 8. Inline AIME
          onUndockAime={() => setIsFloatingAimeOpen(true)}
          aimePromptInput={aimePromptInput}
          setAimePromptInput={setAimePromptInput}
          isAimeGenerating={isAimeGenerating}
          aimeGeneratedProse={aimeGeneratedProse}
          onRunAimePrompt={handleRunAimePrompt}
          onInsertAimeIntoScenario={handleInsertAimeIntoScenario}
        />

        {/* ── CENTER WORKSPACE: DUAL-PANE SPLIT VIEW ── */}
        <div className="flex-1 min-w-0 h-full overflow-hidden relative">
          
          {/* VIEWPORT MODE 1: SIDE-BY-SIDE SPLIT */}
          {viewportSplit === 'side_by_side' && (
            <Split
              sizes={[55, 45]}
              minSize={[350, 350]}
              gutterSize={6}
              direction="horizontal"
              className="flex h-full w-full overflow-hidden split-horizontal"
            >
              {/* Left Pane: WebGPU Tactical Stage Viewport */}
              <div className="h-full w-full overflow-hidden relative">
                <StageViewportWrapper
                  campaignId={universeState?.id}
                  sceneId={activeMap?.id}
                />
              </div>

              {/* Right Pane: Multi-Workspace Story Suite */}
              <div className="h-full w-full overflow-hidden bg-[#090d16] flex flex-col border-l border-slate-800">
                {/* Workspace Body */}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
                  {storyWorkspaceTab === 'weaver' && (
                    <StoryWeaver
                      activeNode={activeScenario}
                      updateStory={updateStory}
                      guidanceGems={universeState?.creativeState?.gems || ''}
                    />
                  )}

                  {storyWorkspaceTab === 'tactical' && (
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0f18] font-mono scrollbar-thin">
                      <OsrControlPanelDeck
                        activeNode={activeScenario}
                        updateStory={updateStory}
                        guidanceGems={universeState?.creativeState?.gems || []}
                      />
                    </div>
                  )}

                  {storyWorkspaceTab === 'interactive' && (
                    <div className="flex-1 overflow-hidden bg-[#080c14] font-mono">
                      <InteractiveStoryStudio
                        activeNode={activeScenario}
                        onSelectScenario={(id) => setActiveScenarioId(id)}
                      />
                    </div>
                  )}

                  {storyWorkspaceTab === 'graph' && (
                    <div className="flex-1 overflow-hidden">
                      <VisualStoryGraph
                        activeScenarioId={activeScenario?.id}
                        onSelectScenario={(id) => setActiveScenarioId(id)}
                        onOpenInWeaver={(node) => {
                          setActiveScenarioId(node.id);
                          setStoryWorkspaceTab('weaver');
                        }}
                        onPanStageToMap={(mapId) => {
                          setActiveMapId(mapId);
                        }}
                      />
                    </div>
                  )}

                  {storyWorkspaceTab === 'gallery' && (
                    <div className="flex-1 overflow-hidden">
                      <StoryGallery
                        onBackToStory={() => setStoryWorkspaceTab('weaver')}
                        onOpenCompiler={() => setIsCompilerOpen(true)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Split>
          )}

          {/* VIEWPORT MODE 2: CANVAS ONLY */}
          {viewportSplit === 'canvas_only' && (
            <div className="h-full w-full overflow-hidden relative">
              <StageViewportWrapper
                campaignId={universeState?.id}
                sceneId={activeMap?.id}
              />
            </div>
          )}

          {/* VIEWPORT MODE 3: STORY ONLY */}
          {viewportSplit === 'story_only' && (
            <div className="h-full w-full overflow-hidden bg-[#090d16] flex flex-col">
              {/* Workspace Body */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
                {storyWorkspaceTab === 'weaver' && (
                  <StoryWeaver
                    activeNode={activeScenario}
                    updateStory={updateStory}
                    guidanceGems={universeState?.creativeState?.gems || ''}
                  />
                )}

                {storyWorkspaceTab === 'tactical' && (
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0f18] font-mono scrollbar-thin">
                    <OsrControlPanelDeck
                      activeNode={activeScenario}
                      updateStory={updateStory}
                      guidanceGems={universeState?.creativeState?.gems || []}
                    />
                  </div>
                )}

                {storyWorkspaceTab === 'interactive' && (
                  <div className="flex-1 overflow-hidden bg-[#080c14] font-mono">
                    <InteractiveStoryStudio
                      activeNode={activeScenario}
                      onSelectScenario={(id) => setActiveScenarioId(id)}
                    />
                  </div>
                )}

                {storyWorkspaceTab === 'graph' && (
                  <div className="flex-1 overflow-hidden">
                    <VisualStoryGraph
                      activeScenarioId={activeScenario?.id}
                      onSelectScenario={(id) => setActiveScenarioId(id)}
                      onOpenInWeaver={(node) => {
                        setActiveScenarioId(node.id);
                        setStoryWorkspaceTab('weaver');
                      }}
                      onPanStageToMap={(mapId) => {
                        setActiveMapId(mapId);
                      }}
                    />
                  </div>
                )}

                {storyWorkspaceTab === 'gallery' && (
                  <div className="flex-1 overflow-hidden">
                    <StoryGallery
                      onBackToStory={() => setStoryWorkspaceTab('weaver')}
                      onOpenCompiler={() => setIsCompilerOpen(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FLOATING WAYPOINT PROMPT CHIP (1-CLICK CONFIRMATION PROTOCOL) ── */}
      <WaypointPromptChip
        promptData={waypointPromptData}
        onConfirm={handleConfirmWaypointBeat}
        onDismiss={() => setWaypointPromptData(null)}
        onToggleAutoTrigger={handleToggleAutoTrigger}
      />

      {/* ── ALL PREVIOUS ADE STUDIO MODALS INTEGRATED ── */}
      {/* 1. Project Catalog & Switcher Modal */}
      <FoundryLauncherModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        initialTab="stories"
      />

      {/* 2. Guidance Gems Configuration Modal */}
      {isGemsOpen && (
        <GuidanceGemsModal
          isOpen={isGemsOpen}
          onClose={() => setIsGemsOpen(false)}
        />
      )}

      {/* 3. Cronicle Living Memory & Scratchbook Deck Modal */}
      <CronicleDeckModal
        isOpen={isCronicleOpen}
        onClose={() => setIsCronicleOpen(false)}
        initialMode={cronicleInitialMode}
      />

      {/* 4. VTT Module Compiler & Runtime Packaging Modal */}
      <VttCompilerModal
        isOpen={isCompilerOpen}
        onClose={() => setIsCompilerOpen(false)}
        activeScenario={activeScenario}
      />

      {/* 5. ADE Master Documentation & User Guide Modal */}
      {isGuideOpen && (
        <StoryFoundryGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      )}

      {/* 6. User Profile & Settings Modal */}
      {isSettingsOpen && (
        <UserSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* 7. Story Element Natural Language Extractor Modal */}
      {isExtractorOpen && (
        <StoryElementExtractorModal
          isOpen={isExtractorOpen}
          onClose={() => setIsExtractorOpen(false)}
          initialText={extractorInitialText}
          activeNode={activeScenario}
          onCreated={() => AudioService.playCriticalChime(true)}
        />
      )}

      {/* 7b. Comprehensive Scenario & Narrative Node Creation Modal */}
      <CreateScenarioModal
        isOpen={isCreateScenarioModalOpen}
        onClose={() => setIsCreateScenarioModalOpen(false)}
        defaultParentId={activeScenario?.id || null}
        onScenarioCreated={(node) => {
          if (setActiveScenarioId) setActiveScenarioId(node.id);
        }}
      />

      {/* 8. Full Element Forge Modal for Personas, Items & Locations */}
      {isEditModalOpen && (
        <EditElementModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingElement(null);
          }}
          element={editingElement}
          onSave={(savedElem) => {
            if (typeof updateSavedElement === 'function' && savedElem?.id) {
              updateSavedElement(savedElem.id, savedElem);
            }
            setIsEditModalOpen(false);
            setEditingElement(null);
          }}
          onDelete={(elementId) => {
            if (typeof deleteSavedElement === 'function' && elementId) {
              deleteSavedElement(elementId);
            }
            setIsEditModalOpen(false);
            setEditingElement(null);
          }}
        />
      )}

      {/* 9. Floating AIME Co-Pilot Window */}
      {isFloatingAimeOpen && (
        <AIMEChatBox
          onClose={() => setIsFloatingAimeOpen(false)}
          activeNode={activeScenario}
          contextData={{
            projectName: universeState?.projectName || 'Tangent Universe',
            activeNode: activeScenario,
            guidanceGems: universeState?.creativeState?.gems || '',
            outline: universeState?.creativeState?.storyOutline || '',
            sceneBeats: universeState?.creativeState?.sceneBeats || '',
            draft: universeState?.creativeState?.storyDraft || '',
            customCatalog: elementsCatalog || []
          }}
        />
      )}

      {/* 10. Selective Print & Publishing Studio Modal */}
      <SelectivePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        universeState={universeState}
        elementsCatalog={elementsCatalog}
        activeScenario={activeScenario}
        activeMap={activeMap}
      />
    </div>
  );
};

export default AdeLiveStudio;
