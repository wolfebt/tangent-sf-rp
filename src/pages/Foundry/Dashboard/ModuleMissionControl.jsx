/**
 * @file ModuleMissionControl.jsx
 * @description Master Mission Control & Configuration Dashboard for the Adventure Development Environment (ADE).
 * Primary default landing page (The Hub) for the ADE suite.
 * Features:
 * - Module Selection & Creation Notification with direct actions
 * - Consolidated Master Studio Control Bar (shifted from top toolbar)
 * - Module Telemetry & 4-Pillar Readiness Scorecard with Preflight Health Check
 * - Direct Launchers: Live Studio, Deploy to Stage, Story Weaver, Map Architect, Scripts, Asset Forge
 * - Universal Package Exporter (Architect Master vs. Sanitized Operator Editions)
 * - Standalone File & Module Drag-and-Drop Ingestion Zone
 * - 4 Pillar Quick-Navigation Cards (Weaver, Map, Stage VTT, Elements)
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  BookOpen, 
  Map, 
  Cpu, 
  Database, 
  Tv2, 
  Sparkles, 
  Upload, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Play, 
  Layers, 
  Eye, 
  EyeOff, 
  Sliders, 
  Plus, 
  FolderDown,
  Activity,
  Bot,
  FolderOpen,
  ChevronDown,
  FilePlus,
  Trash2,
  Save,
  Globe,
  Cloud,
  ExternalLink,
  Swords,
  Wrench,
  AlertCircle,
  X,
  Check,
  Edit3,
  Feather,
  Box
} from 'lucide-react';
import { useCampaign, useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { useADEStore } from '../store/adeStore';
import { useToast } from '../../../context/ToastContext';
import { AudioService } from '../../../services/audioService';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { 
  exportArchitectModuleToFile, 
  exportOperatorModuleToFile, 
  parseAndValidateModuleFile, 
  hydrateModuleIntoCampaign 
} from '../../../services/modulePackageService';
import { batchIngestElementFiles, parseElementMarkdown } from '../../../services/elementIngestionService.js';

export default function ModuleMissionControl({ 
  onSelectPillar,
  onSwitchView,
  activeNode,
  onOpenCronicle,
  onOpenScratchbook,
  onOpenPrintModal,
  onOpenCatalog,
  onOpenGuide,
  onOpenSettings,
  onOpenCompiler,
  onExportMarkdown,
  onExportPDF
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, userHandle } = useAuth();
  
  // Context state
  const { 
    universeState, 
    storyCatalog = [], 
    openStory, 
    createNewStory, 
    deleteStoryProject, 
    updateProjectName, 
    handleSaveStory, 
    handleLoadStory, 
    pushUniverseToCloud, 
    pullUniverseFromCloud, 
    cloudSyncStatus, 
    lastCloudSavedAt, 
    handleClearUniverse, 
    activeMapId,
    elementsCatalog = [],
    mapsCatalog = [],
    addMap, 
    updateMap, 
    addStory, 
    updateStory, 
    addSavedElement 
  } = useCampaign();

  const { savedElements = [] } = useStory();

  // ADE Store
  const { 
    perspectiveMode, 
    setPerspectiveMode, 
    togglePerspectiveMode, 
    activePillar, 
    setActivePillar,
    setModal 
  } = useADEStore();

  // Local state for Shifted Studio Bar functions
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(universeState?.projectName || 'Untitled Story');
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [isNotificationDismissed, setIsNotificationDismissed] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileMenuRef = useRef(null);
  const storyFileInputRef = useRef(null);
  const ingestionFileInputRef = useRef(null);

  useEffect(() => {
    setTitleInput(universeState?.projectName || 'Untitled Story');
  }, [universeState?.projectName]);

  // Click outside listener for project menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setIsFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Welcome notification toast on initial Hub mount if in default state
  useEffect(() => {
    const isDefault = !universeState?.projectName || universeState?.projectName === 'New Story Module';
    if (isDefault) {
      toast?.showInfo?.('Welcome to ADE Hub: Please select an existing module or create a new module.');
    }
  }, []);

  // Derived telemetry metrics
  const scenarios = universeState?.scenarios || [];
  const maps = universeState?.maps || [];
  const galleryModifiers = universeState?.galleryModifiers || [];
  
  // Telemetry computation
  const scenariosWithMaps = scenarios.filter(s => s.mapId || (s.fields && s.fields.mapId)).length;
  const scenariosWithBeats = scenarios.filter(s => (s.beats && s.beats.length > 0) || (s.fields && s.fields.beats)).length;
  const elementsCount = savedElements.length > 0 ? savedElements.length : (elementsCatalog?.length || 0);
  const scriptedNpcsCount = (savedElements.length > 0 ? savedElements : (elementsCatalog || [])).filter(
    e => e.fields?.vttScript || e.fields?.vttScriptActive === 'true'
  ).length;
  
  // Calculate readiness score
  let score = 0;
  if (scenarios.length > 0) score += 25;
  if (scenariosWithMaps > 0) score += 25;
  if (elementsCount > 0) score += 25;
  if (maps.some(m => m.walls && m.walls.length > 0)) score += 15;
  if (scriptedNpcsCount > 0) score += 10;
  const readinessScore = Math.min(score, 100);

  // Target IDs for Live Studio & Stage deployment
  const targetScenarioId = activeNode?.id || scenarios[0]?.id || '';
  const targetMapId = activeNode?.mapId || activeMapId || maps[0]?.id || '';

  // Module Health Preflight Computation (from Studio Bar)
  const moduleHealth = useMemo(() => {
    let healthScore = 100;
    const issues = [];
    const warnings = [];

    const scenariosList = universeState?.scenarios || [];
    const mapsList = universeState?.maps || [];
    const gemsList = universeState?.creativeState?.gems || [];
    const elementsList = savedElements?.length > 0 ? savedElements : (elementsCatalog || []);

    if (scenariosList.length === 0) {
      healthScore -= 35;
      issues.push('No scenario nodes found');
    } else {
      const emptyNodes = scenariosList.filter(s => !s.name && !s.title);
      if (emptyNodes.length > 0) {
        healthScore -= 10;
        warnings.push(`${emptyNodes.length} unnamed scenario node(s)`);
      }
    }

    if (mapsList.length === 0) {
      healthScore -= 25;
      warnings.push('No tactical maps bound to module');
    }

    if (elementsList.length === 0) {
      healthScore -= 20;
      warnings.push('World Elements Catalog is empty');
    }

    if (gemsList.length === 0) {
      healthScore -= 10;
      warnings.push('No Guidance Gems configured');
    }

    const clampedScore = Math.max(0, Math.min(100, healthScore));
    return {
      score: clampedScore,
      issues,
      warnings,
      color: clampedScore >= 80 
        ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' 
        : clampedScore >= 50 
        ? 'text-amber-400 border-amber-500/40 bg-amber-950/40' 
        : 'text-red-400 border-red-500/40 bg-red-950/40'
    };
  }, [universeState, savedElements, elementsCatalog]);

  // Title rename submission
  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput.trim() !== universeState?.projectName) {
      updateProjectName(titleInput.trim());
      AudioService.playTerminalBeep(1200, 0.03);
      toast?.showSuccess?.(`Module renamed to "${titleInput.trim()}"`);
    }
  };

  // Create new story module
  const handleCreateNewStory = () => {
    setIsFileMenuOpen(false);
    AudioService.playTerminalBeep(1200, 0.03);
    setNewStoryTitle('New Story Module');
    setIsNewStoryModalOpen(true);
  };

  // Delete active story module
  const handleDeleteActiveStory = async () => {
    setIsFileMenuOpen(false);
    AudioService.playTerminalBeep(800, 0.04);
    const currentTitle = universeState?.projectName || 'Untitled Story';
    if (await confirmTypedDeletion(currentTitle, 'story module project')) {
      if (universeState?.id) {
        deleteStoryProject(universeState.id);
      }
      createNewStory("New Story Module");
      toast?.showInfo?.("Active module reset to New Story Module");
    }
  };

  // Clear universe
  const handleClearStoryElements = async () => {
    setIsFileMenuOpen(false);
    AudioService.playTerminalBeep(800, 0.04);
    const currentTitle = universeState?.projectName || 'Untitled Story';
    if (await confirmTypedDeletion(currentTitle, 'story element content')) {
      if (handleClearUniverse) {
        handleClearUniverse();
        toast?.showInfo?.("Universe elements cleared");
      }
    }
  };

  // Load story JSON file
  const handleLoadStoryFile = (e) => {
    const file = e.target.files?.[0];
    if (file && handleLoadStory) {
      handleLoadStory(file);
      AudioService.playCriticalChime(true);
      toast?.showSuccess?.(`Loaded story module: ${file.name}`);
    }
    e.target.value = '';
  };

  // Pillar Quick Launch Actions
  const handleLaunchPillar = (pillarId, path) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (setActivePillar) setActivePillar(pillarId);
    if (onSelectPillar) {
      onSelectPillar(pillarId);
    } else if (path) {
      navigate(path);
    }
  };

  // Module Export Handlers
  const handleExportArchitectPackage = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    const res = exportArchitectModuleToFile(universeState, savedElements);
    if (res.success) {
      toast?.showSuccess?.(`Exported Architect Master Package: ${res.filename}`);
    } else {
      toast?.showError?.(`Export failed: ${res.error}`);
    }
  };

  const handleExportOperatorPackage = () => {
    AudioService.playTerminalBeep(980, 0.04);
    const res = exportOperatorModuleToFile(universeState, savedElements);
    if (res.success) {
      toast?.showSuccess?.(`Exported Sanitized Player Package: ${res.filename}`);
    } else {
      toast?.showError?.(`Export failed: ${res.error}`);
    }
  };

  // Module & Elements Import Process
  const handleProcessImportFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setIsImporting(true);
    AudioService.playTerminalBeep(1100, 0.04);

    try {
      const files = Array.from(fileList);
      const mdFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.markdown'));
      const jsonFiles = files.filter(f => f.name.endsWith('.json'));

      // 1. Process Markdown Elements (adhering strictly to ELEMENTS.md)
      if (mdFiles.length > 0) {
        const batchResults = await batchIngestElementFiles(mdFiles);
        let ingestedCount = 0;
        const types = new Set();

        for (const res of batchResults) {
          if (res.success && res.element) {
            const el = res.element;
            await addSavedElement({
              ...el,
              title: el.name || el.title,
              content: el.description || ''
            });
            ingestedCount++;
            types.add(el.type);
          }
        }

        if (ingestedCount > 0) {
          toast?.showSuccess?.(`Ingested ${ingestedCount} Element(s) [${Array.from(types).join(', ')}] adhering to ELEMENTS.md!`);
          AudioService.playCriticalChime(true);
        }
      }

      // 2. Process JSON Module Packages
      for (const file of jsonFiles) {
        const text = await file.text();
        const validation = parseAndValidateModuleFile(text);

        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid module file.');
        }

        const results = hydrateModuleIntoCampaign(validation.data, {
          addMap,
          updateMap,
          addStory,
          updateStory,
          addSavedElement,
          setActiveMapId: () => {},
          setActiveScenarioId: () => {},
          setGalleryModifiers: () => {}
        });

        toast?.showSuccess?.(`Module Hydrated: ${results.scenariosImported} scenarios, ${results.mapsImported} maps, ${results.elementsImported} assets.`);
        AudioService.playCriticalChime(true);
      }
    } catch (err) {
      console.error('[MissionControl] Import failed:', err);
      toast?.showError?.(`Import Error: ${err.message}`);
    } finally {
      setIsImporting(false);
      if (ingestionFileInputRef.current) ingestionFileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessImportFiles(e.dataTransfer.files);
    }
  };

  const isDefaultModuleName = !universeState?.projectName || universeState?.projectName === 'New Story Module';

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-y-auto bg-[#070b13] text-slate-100 p-3 sm:p-5 select-none font-sans">
      {/* Hidden File Input for Story JSON */}
      <input
        type="file"
        accept=".json"
        ref={storyFileInputRef}
        className="hidden"
        onChange={handleLoadStoryFile}
      />

      {/* ── SECTION 1: NOTIFICATION TO SELECT OR CREATE A MODULE ── */}
      {!isNotificationDismissed && (
        <div className={`mb-5 p-4 rounded-2xl border transition-all shadow-xl relative overflow-hidden backdrop-blur-xl shrink-0 ${
          isDefaultModuleName
            ? 'bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-amber-950/60 border-cyan-500/50 shadow-[0_0_24px_rgba(34,211,238,0.2)]'
            : 'bg-slate-900/80 border-slate-800 shadow-md'
        }`}>
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            {/* Notification Text & Icon */}
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                isDefaultModuleName 
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]' 
                  : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
              }`}>
                {isDefaultModuleName ? (
                  <Sparkles size={22} className="text-cyan-400 animate-pulse" />
                ) : (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    isDefaultModuleName 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' 
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}>
                    {isDefaultModuleName ? 'Action Required' : 'Module Loaded'}
                  </span>
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider font-mono text-white">
                    {isDefaultModuleName 
                      ? 'Select or Create a Story Module' 
                      : `Active Module: ${universeState?.projectName || 'Untitled Story'}`
                    }
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {isDefaultModuleName 
                    ? 'You are currently in the ADE Hub with an unconfigured module. Choose an existing story module from your roster, import a module package (.json), or initialize a new campaign module to begin authoring narrative arcs and battlemaps.'
                    : `Currently authoring "${universeState?.projectName}". You can switch to another project, initialize a new module, or load external story bundles below.`
                  }
                </p>
              </div>
            </div>

            {/* Direct Action Controls */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* Module Switcher Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-700 hover:border-cyan-500/60 rounded-xl px-2.5 py-1.5 shadow-sm transition-colors">
                <BookOpen size={13} className="text-cyan-400 shrink-0" />
                <select
                  value={universeState?.id || ''}
                  onChange={(e) => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    if (e.target.value) {
                      openStory(e.target.value);
                      toast?.showSuccess?.(`Switched to module: ${storyCatalog.find(s => s.id === e.target.value)?.projectName || 'Module'}`);
                    }
                  }}
                  className="bg-transparent text-xs font-mono text-slate-100 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate font-bold"
                  title="Select an Existing Story Module from Roster"
                >
                  {storyCatalog && storyCatalog.length > 0 ? (
                    storyCatalog.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                        {s.projectName || s.title || 'Untitled Story'}
                      </option>
                    ))
                  ) : (
                    <option value="" className="bg-slate-900 text-slate-400">
                      Default Universe
                    </option>
                  )}
                </select>
              </div>

              {/* Create New Module Button */}
              <button
                type="button"
                onClick={handleCreateNewStory}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
                title="Create a New Adventure Story Module"
              >
                <Plus size={14} />
                <span>Create New</span>
              </button>

              {/* Import Story File Button */}
              <button
                type="button"
                onClick={() => storyFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-400 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Load a Story Module JSON File"
              >
                <Download size={13} className="text-cyan-400" />
                <span className="hidden sm:inline">Import JSON</span>
              </button>

              {/* Open Project Roster Modal */}
              <button
                type="button"
                onClick={() => onOpenCatalog?.()}
                className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                title="Open Complete Story Project Roster & Catalog"
              >
                <FolderOpen size={13} className="text-amber-400" />
                <span className="hidden sm:inline">Roster</span>
              </button>

              {/* Dismiss / Minimize */}
              {!isDefaultModuleName && (
                <button
                  type="button"
                  onClick={() => setIsNotificationDismissed(true)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: CONSOLIDATED ADE MASTER COCKPIT BAR (Shifted from ADE Studio Bar) ── */}
      <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-[#0c121e] border border-cyan-500/30 shadow-2xl backdrop-blur-2xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 font-mono shrink-0">
        {/* Left Deck: Identity, Title, Project Menu, Cloud Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Brand Indicator */}
          <div className="flex items-center gap-1.5 font-mono shrink-0 mr-1">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-cyan-400 font-black text-xs tracking-widest uppercase">
              ADE HUB
            </span>
          </div>

          {/* Module Title Pill & Inline Editor */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 shadow-sm">
            <BookOpen size={13} className="text-cyan-400 shrink-0" />
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                autoFocus
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTitleInput(universeState?.projectName || 'Untitled Story');
                    setIsEditingTitle(false);
                  }
                }}
                className="bg-slate-950 text-xs font-mono text-cyan-200 border border-cyan-500/50 rounded px-1.5 py-0.5 outline-none max-w-[200px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="text-xs font-mono text-slate-100 hover:text-cyan-300 font-bold max-w-[180px] sm:max-w-[240px] truncate text-left cursor-pointer flex items-center gap-1"
                title="Click to rename active module"
              >
                <span>{universeState?.projectName || 'Untitled Story'}</span>
                <Edit3 size={11} className="text-slate-500 hover:text-cyan-400 opacity-60" />
              </button>
            )}
          </div>

          {/* Project Actions Dropdown Menu ([PROJECT v]) */}
          <div className="relative" ref={fileMenuRef}>
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setIsFileMenuOpen(prev => !prev);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                isFileMenuOpen
                  ? 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-400'
              }`}
              title="Story Module Project Operations (Save, Load, Export, Sync)"
            >
              <FolderOpen size={13} className="text-cyan-400" />
              <span>FILE</span>
              {currentUser && (
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    cloudSyncStatus === 'syncing'
                      ? 'bg-amber-400 animate-spin'
                      : cloudSyncStatus === 'synced'
                      ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]'
                      : cloudSyncStatus === 'error'
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-slate-500'
                  }`}
                  title={
                    cloudSyncStatus === 'syncing'
                      ? 'Syncing Cloud...'
                      : cloudSyncStatus === 'synced'
                      ? lastCloudSavedAt ? `Cloud Synced at ${lastCloudSavedAt}` : 'Cloud Synced'
                      : cloudSyncStatus === 'error'
                      ? 'Cloud Sync Error'
                      : 'Local Mode'
                  }
                />
              )}
              <ChevronDown size={11} className={`transition-transform duration-200 ${isFileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFileMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900/98 border border-cyan-500/40 rounded-xl shadow-2xl z-50 text-xs font-mono divide-y divide-slate-800/80 backdrop-blur-2xl">
                {/* Module Creation & Switcher */}
                <div className="py-1">
                  <button
                    onClick={handleCreateNewStory}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FilePlus size={13} className="text-cyan-400" />
                    <span>New Story Module...</span>
                  </button>
                </div>

                {/* Save, Load & Exports */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      if (handleSaveStory) handleSaveStory();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Save size={13} className="text-cyan-400" />
                    <span>Save Story File (.json)</span>
                  </button>
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      storyFileInputRef.current?.click();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download size={13} className="text-cyan-400" />
                    <span>Load Story File (.json)</span>
                  </button>
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      if (onExportMarkdown) onExportMarkdown();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileText size={13} className="text-amber-400" />
                    <span>Export Markdown (.md)</span>
                  </button>
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      if (onOpenPrintModal) onOpenPrintModal();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer size={13} className="text-cyan-300" />
                    <span>Print & Publish (PDF)</span>
                  </button>
                </div>

                {/* Catalogs & Help */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      if (onOpenCatalog) onOpenCatalog();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FolderOpen size={13} className="text-amber-400" />
                    <span>Story Project Roster</span>
                  </button>
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsFileMenuOpen(false);
                      if (onOpenGuide) onOpenGuide();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Compass size={13} className="text-cyan-400" />
                    <span>ADE User Guide & Manual</span>
                  </button>
                </div>

                {/* Cloud Synchronization */}
                {currentUser && (
                  <div className="py-1">
                    <button
                      onClick={() => {
                        AudioService.playTerminalBeep(1200, 0.03);
                        setIsFileMenuOpen(false);
                        pushUniverseToCloud({ showSuccessAlert: true, force: true });
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-sky-950/60 text-sky-300 hover:text-sky-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Cloud size={13} className="text-sky-400" />
                      <span>Push to Cloud DB</span>
                    </button>
                    <button
                      onClick={() => {
                        AudioService.playTerminalBeep(1200, 0.03);
                        setIsFileMenuOpen(false);
                        pullUniverseFromCloud();
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-sky-950/60 text-sky-300 hover:text-sky-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Globe size={13} className="text-sky-400" />
                      <span>Pull from Cloud DB</span>
                    </button>
                  </div>
                )}

                {/* Danger Zone */}
                <div className="py-1">
                  <button
                    onClick={handleDeleteActiveStory}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-red-950/80 text-rose-400 hover:text-rose-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} className="text-rose-400" />
                    <span>Delete Story Module...</span>
                  </button>
                  <button
                    onClick={handleClearStoryElements}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-red-950/80 text-rose-400 hover:text-rose-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShieldAlert size={13} className="text-rose-400" />
                    <span>Clear All Elements...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Deck: Health Badge, Perspective Switcher, Launchers & Modals */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Module Health Badge (Click opens Preflight / Compiler) */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.05);
              onOpenCompiler?.();
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${moduleHealth.color}`}
            title={`Module Health: ${moduleHealth.score}%\n${[...moduleHealth.issues, ...moduleHealth.warnings].join('\n') || 'All systems nominal'}\nClick to inspect in Preflight / Compiler`}
          >
            <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
            <span>{moduleHealth.score}%</span>
            <span className="text-[10px] opacity-75">HEALTH</span>
          </button>

          {/* Dual Perspective Mode Toggle: ARCHITECT vs OPERATOR */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(perspectiveMode === 'architect' ? 1400 : 900, 0.03);
              togglePerspectiveMode();
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
              perspectiveMode === 'operator'
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-indigo-950/80 border-indigo-400 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
            }`}
            title={perspectiveMode === 'operator' 
              ? "Operator Perspective: Player-safe session running. Click to switch to Architect." 
              : "Architect Perspective: Full GM authoring, structuring & secrets. Click to switch to Operator."}
          >
            <span>{perspectiveMode === 'operator' ? '🎮' : '📐'}</span>
            <span>{perspectiveMode === 'operator' ? 'OPERATOR' : 'ARCHITECT'}</span>
          </button>

          {/* Prep Stage VTT Package / Compiler Button */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.05);
              onOpenCompiler?.();
            }}
            className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Compile Story, Maps, and Elements into a prepped Stage VTT package"
          >
            <Wrench size={13} className="text-cyan-400" />
            <span>STAGE COMPILER</span>
          </button>

          {/* The Stage VTT In-Situ Launcher */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1400, 0.05);
              if (onSwitchView) {
                onSwitchView('stage', 'run');
              } else {
                navigate(`/foundry/live?scenarioId=${targetScenarioId}&mapId=${targetMapId}`);
              }
            }}
            className="px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 border border-cyan-400 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.4)] cursor-pointer"
            title="Open in-situ The Stage VTT (Stage Compiler & Live Session Director)"
          >
            <Sparkles size={13} />
            <span>THE STAGE VTT</span>
          </button>

          {/* Standalone Fullscreen VTT Launcher */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1400, 0.05);
              window.open(`/stage?mapId=${encodeURIComponent(targetMapId)}&scenarioId=${encodeURIComponent(targetScenarioId)}`, '_blank');
            }}
            className="px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-400 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Launch standalone full-screen VTT in new window/tab for live play"
          >
            <ExternalLink size={13} />
            <span>STANDALONE VTT</span>
          </button>

          {/* Tactical Utilities Cluster */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 gap-0.5 shadow-sm">
            {/* Cronicle Living Memory */}
            <button
              type="button"
              onClick={() => onOpenCronicle?.()}
              className="px-2 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer text-purple-400 hover:text-purple-200 hover:bg-slate-800/80"
              title="Open Cronicle Living Memory & Scenario State Tracker"
            >
              <span>📜</span>
              <span className="hidden 2xl:inline text-[10px]">CRONICLE</span>
            </button>

            {/* Scratchbook */}
            <button
              type="button"
              onClick={() => onOpenScratchbook?.()}
              className="px-2 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer text-cyan-400 hover:text-cyan-200 hover:bg-slate-800/80"
              title="Open ADE Scratchbook (Session Notes & Working Memory)"
            >
              <span>📝</span>
              <span className="hidden 2xl:inline text-[10px]">NOTES</span>
            </button>

            {/* Print Spread */}
            <button
              type="button"
              onClick={() => onOpenPrintModal?.()}
              className="px-2 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800/80"
              title="Selective Print & Publishing Studio"
            >
              <Printer size={13} className="text-cyan-400" />
            </button>

            {/* ADE User Guide */}
            <button
              type="button"
              onClick={() => onOpenGuide?.()}
              className="px-2 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800/80"
              title="ADE Master User Guide & Manual"
            >
              <Compass size={13} className="text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: TOP METRICS ROW: READINESS SCORE & STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        {/* Scorecard */}
        <div className="p-4 rounded-2xl bg-[#0e1422] border border-cyan-500/30 relative overflow-hidden shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Module Readiness</span>
            <Activity size={16} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-black text-white">{readinessScore}%</span>
            <span className="text-xs text-slate-400">Pre-Flight</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className={`h-full transition-all duration-500 ${
                readinessScore >= 80 ? 'bg-cyan-400' : readinessScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
              }`}
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>

        {/* Narrative Metric */}
        <div className="p-4 rounded-2xl bg-[#0e1422] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold">Scenarios & Beats</span>
            <BookOpen size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{scenarios.length} Nodes</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {scenariosWithBeats} with tactical beats ({scenariosWithMaps} mapped)
          </div>
        </div>

        {/* Spatial Maps Metric */}
        <div className="p-4 rounded-2xl bg-[#0e1422] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">Tactical Sectors</span>
            <Map size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{maps.length} Maps</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {maps.reduce((acc, m) => acc + (m.walls?.length || 0), 0)} vector wall loops active
          </div>
        </div>

        {/* Assets & Automation Metric */}
        <div className="p-4 rounded-2xl bg-[#0e1422] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">Assets & Scripts</span>
            <Cpu size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{elementsCount} Elements</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {scriptedNpcsCount} automated NPC routines configured
          </div>
        </div>
      </div>

      {/* ── SECTION 4: 4 PILLARS WORKSPACE CARDS ── */}
      <div className="mb-6 shrink-0">
        <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 mb-3 flex items-center gap-2">
          <Layers size={14} className="text-cyan-400" />
          Module Component Workspaces
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Narrative Foundry */}
          <div 
            onClick={() => {
              if (onSwitchView) onSwitchView('scenarios');
              else handleLaunchPillar('narrative', '/foundry/story');
            }}
            className="p-4 rounded-2xl bg-[#0c121e]/90 hover:bg-[#131b2c] border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen size={20} />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">1. Narrative Foundry</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Draft manuscripts, OSR tactical 2-page spreads, branching choice simulators & story webs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] font-mono text-purple-400 font-bold">
              <span>Enter Weaver ↗</span>
              <span className="text-[10px] text-slate-500">⌘1</span>
            </div>
          </div>

          {/* Pillar 2: Map Architect */}
          <div 
            onClick={() => {
              if (onSwitchView) onSwitchView('map');
              else handleLaunchPillar('maps', '/foundry/map');
            }}
            className="p-4 rounded-2xl bg-[#0c121e]/90 hover:bg-[#131b2c] border border-sky-500/30 hover:border-sky-400 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Map size={20} />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">2. Map Architect</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Design tactical sector grids, line-of-sight walls, dynamic lighting & auto-routed waypoints.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-sky-500/20 flex items-center justify-between text-[11px] font-mono text-sky-400 font-bold">
              <span>Enter Designer ↗</span>
              <span className="text-[10px] text-slate-500">⌘2</span>
            </div>
          </div>

          {/* Pillar 3: The Stage VTT */}
          <div 
            onClick={() => {
              if (onSwitchView) onSwitchView('stage');
              else handleLaunchPillar('stage', '/foundry/stage');
            }}
            className="p-4 rounded-2xl bg-[#0c121e]/90 hover:bg-[#131b2c] border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles size={20} />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">3. The Stage VTT</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Compile stage manifests, bind map anchors, wire trigger flow, and direct live tactical VTT sessions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] font-mono text-purple-400 font-bold">
              <span>Enter Stage VTT ↗</span>
              <span className="text-[10px] text-slate-500">⌘3</span>
            </div>
          </div>

          {/* Pillar 4: Asset & DBM Forge */}
          <div 
            onClick={() => {
              if (onSwitchView) onSwitchView('elements');
              else handleLaunchPillar('assets', '/foundry/elements');
            }}
            className="p-4 rounded-2xl bg-[#0c121e]/90 hover:bg-[#131b2c] border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Database size={20} />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">4. Asset & DBM Forge</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Ingest standalone ELEMENTS.md files, manage bestiaries, gear, factions & two-way DBM sync.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold">
              <span>Enter Forge ↗</span>
              <span className="text-[10px] text-slate-500">⌘4</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 5: PACKAGE EXPORTS & INGESTION DROPZONE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
        {/* Module Packaging Console */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Download size={18} className="text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Module Configuration Packaging</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Export the entire module configuration into a standalone bundle. Generates an Architect Master package with all dev assets and secrets, or a sanitized Operator edition safe for players.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleExportArchitectPackage}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              title="Export complete configuration with dev secrets, DC checks, and raw monster stat blocks"
            >
              <Eye size={15} />
              <span>Export Architect Package (.json)</span>
            </button>

            <button
              type="button"
              onClick={handleExportOperatorPackage}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              title="Export player-safe module with hidden complications, unrevealed coordinates, and secrets stripped"
            >
              <EyeOff size={15} />
              <span>Export Operator Package (.json)</span>
            </button>
          </div>
        </div>

        {/* Universal Ingestion & Import Dropzone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center shadow-lg relative cursor-pointer ${
            isDragging 
              ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
              : 'border-slate-800 bg-[#0c121e] hover:border-slate-700'
          }`}
          onClick={() => ingestionFileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={ingestionFileInputRef}
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleProcessImportFiles(e.target.files);
              }
            }}
            accept=".json,.md,.markdown"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-3">
            <Upload size={24} />
          </div>

          <h3 className="text-sm font-bold text-white mb-1">
            {isImporting ? 'Ingesting Package...' : 'Import Module Package or Standalone Elements'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-3">
            Drag and drop `.tangent-module.json` package bundles or standalone `ELEMENTS.md` files to ingest into this campaign.
          </p>

          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
            Browse File System ↗
          </span>
        </div>
      </div>

      {/* ── CREATE NEW STORY MODULE MODAL ── */}
      {isNewStoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl font-mono text-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FilePlus className="text-cyan-400" size={18} />
                <h3 className="font-bold text-sm text-cyan-300 uppercase tracking-wider">Create New Story Module</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewStoryModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Story Module Title
              </label>
              <input
                type="text"
                autoFocus
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newStoryTitle.trim()) {
                    createNewStory(newStoryTitle.trim());
                    setIsNewStoryModalOpen(false);
                    AudioService.playCriticalChime(true);
                    toast?.showSuccess?.(`Initialized module: "${newStoryTitle.trim()}"`);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 px-3 py-2 rounded-xl text-xs outline-none"
                placeholder="e.g. Operation Voidfall"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewStoryModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newStoryTitle.trim()}
                onClick={() => {
                  if (newStoryTitle.trim()) {
                    createNewStory(newStoryTitle.trim());
                    setIsNewStoryModalOpen(false);
                    AudioService.playCriticalChime(true);
                    toast?.showSuccess?.(`Initialized module: "${newStoryTitle.trim()}"`);
                  }
                }}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50"
              >
                Create Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
