/**
 * @file ADETopToolbar.jsx
 * @description Glass-Cockpit Top Navigation Toolbar for the Adventure Development Environment (ADE).
 * Aligns the ADE menu system and layout with the Map Maker (MapToolbar) and Stage VTT (StageTopToolbar).
 * Provides a 3-zone architecture:
 *   - Zone A: Story Switcher, Categorized PROJECT dropdown, Cloud Sync status & User tag
 *   - Zone B: Segmented Studio Mode Switcher (Scenarios, AIME, Interactive, Elements) & Deploy to VTT
 *   - Zone C: PANELS overlay dropdown & Tactical Quick Drawers Cluster (Gems, Scratchbook, Print, AIME, Elements)
 */

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  Feather, 
  Box, 
  FolderOpen, 
  ChevronDown, 
  FilePlus, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  FileText, 
  Printer, 
  Layers, 
  Compass, 
  Globe, 
  Cloud, 
  Play, 
  ExternalLink,
  Settings,
  LayoutGrid,
  Scroll,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { useStory, formatExportFilename } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';

export default function ADETopToolbar({
  activeView,
  onSwitchView,
  // Modals & Panels
  isGemsOpen,
  onToggleGems,
  isScratchbookOpen,
  onToggleScratchbook,
  isPrintModalOpen,
  onTogglePrintModal,
  isCatalogOpen,
  onToggleCatalog,
  isGuideOpen,
  onToggleGuide,
  isSettingsOpen,
  onToggleSettings,
  isAimeChatOpen,
  onToggleAimeChat,
  isElementDrawerOpen,
  onToggleElementDrawer,
  // Workspace tabs in Scenarios view
  scenarioWorkspaceTab = 'canvas',
  onSelectScenarioWorkspaceTab,
  isTreeExpanded = true,
  onToggleTreeExpanded,
  // Node level exports
  activeNode,
  onExportMarkdown,
  onExportPDF
}) {
  const navigate = useNavigate();
  const {
    universeState,
    storyCatalog,
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
    elementsCatalog,
    handleClearUniverse,
    activeMapId
  } = useStory();

  const { currentUser, userHandle } = useAuth();

  // Dropdown states & refs
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isPanelsMenuOpen, setIsPanelsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(universeState?.projectName || 'Untitled Story');

  const projectMenuRef = useRef(null);
  const panelsMenuRef = useRef(null);
  const storyFileInputRef = useRef(null);

  useEffect(() => {
    setTitleInput(universeState?.projectName || 'Untitled Story');
  }, [universeState?.projectName]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target)) {
        setIsProjectMenuOpen(false);
      }
      if (panelsMenuRef.current && !panelsMenuRef.current.contains(e.target)) {
        setIsPanelsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Story file handlers
  const handleLoadStoryFile = (e) => {
    const file = e.target.files?.[0];
    if (file && handleLoadStory) {
      handleLoadStory(file);
    }
    e.target.value = '';
  };

  const handleCreateNewStory = () => {
    setIsProjectMenuOpen(false);
    AudioService.playTerminalBeep(1200, 0.03);
    const name = prompt("Enter title for new Story Module:", "New Story Module");
    if (name && name.trim()) {
      createNewStory(name.trim());
    }
  };

  const handleDeleteActiveStory = () => {
    setIsProjectMenuOpen(false);
    AudioService.playTerminalBeep(800, 0.04);
    const currentTitle = universeState?.projectName || 'Untitled Story';
    if (confirmTypedDeletion(currentTitle, 'story module project')) {
      if (universeState?.id) {
        deleteStoryProject(universeState.id);
      }
      createNewStory("New Story Module");
    }
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput.trim() !== universeState?.projectName) {
      updateProjectName(titleInput.trim());
    }
  };

  const handleClearStoryElements = () => {
    setIsProjectMenuOpen(false);
    AudioService.playTerminalBeep(800, 0.04);
    const currentTitle = universeState?.projectName || 'Untitled Story';
    if (confirmTypedDeletion(currentTitle, 'story element content')) {
      if (handleClearUniverse) {
        handleClearUniverse();
      }
    }
  };

  // Associated map for Deploy to VTT
  const targetMapId = activeNode?.mapId || activeMapId || universeState?.maps?.[0]?.id || '';

  const creatorInfo = extractCreatorInfo(universeState, userHandle, currentUser);

  return (
    <header className="relative z-40 bg-slate-950/95 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between gap-2 select-none shadow-xl backdrop-blur-xl flex-wrap font-mono shrink-0">
      {/* Hidden File Inputs */}
      <input
        type="file"
        accept=".json"
        ref={storyFileInputRef}
        className="hidden"
        onChange={handleLoadStoryFile}
      />

      {/* ── ZONE A: STORY & PROJECT HUB (Left) ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Brand Indicator */}
        <div className="flex items-center gap-1.5 mr-1 font-mono shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-cyan-400 font-bold text-xs tracking-widest uppercase hidden lg:inline">
            ADE STUDIO
          </span>
        </div>

        {/* Story Switcher Pill */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 shadow-sm">
          <BookOpen size={13} className="text-cyan-400 shrink-0" />
          
          {storyCatalog && storyCatalog.length > 1 ? (
            <select
              value={universeState?.id || ''}
              onChange={(e) => {
                AudioService.playTerminalBeep(1100, 0.02);
                if (e.target.value) openStory(e.target.value);
              }}
              className="bg-transparent text-xs font-mono text-slate-100 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate font-bold"
              title="Switch Active Story Project"
            >
              {storyCatalog.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                  {s.projectName || s.title || 'Untitled Story'}
                </option>
              ))}
            </select>
          ) : (
            isEditingTitle ? (
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
                className="bg-slate-950 text-xs font-bold font-mono text-amber-300 uppercase px-1.5 py-0.5 rounded outline-none border border-amber-500 max-w-[160px] sm:max-w-[200px]"
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                className="text-xs font-bold font-mono text-slate-100 hover:text-amber-400 cursor-pointer max-w-[130px] sm:max-w-[170px] truncate px-1 transition-colors"
                title="Click to rename Story Module"
              >
                {universeState?.projectName || 'Untitled Story'}
              </span>
            )
          )}

          <button
            onClick={handleCreateNewStory}
            className="p-1 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer"
            title="Create New Story Module"
          >
            <FilePlus size={13} />
          </button>

          <button
            onClick={handleDeleteActiveStory}
            className="p-1 hover:bg-red-950/60 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
            title="Delete Current Story Module"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Categorized Project & Tools Menu */}
        <div className="relative" ref={projectMenuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              AudioService.playTerminalBeep(1000, 0.02);
              setIsProjectMenuOpen(prev => !prev);
              setIsPanelsMenuOpen(false);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FolderOpen size={12} className="text-cyan-400" />
            <span>PROJECT</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isProjectMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProjectMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-slate-900/98 border border-cyan-500/40 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-2xl text-xs font-mono divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Group 1: File Storage & Export */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-cyan-400/70 tracking-wider">
                  File I/O & Export
                </div>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
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
                    setIsProjectMenuOpen(false);
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
                    setIsProjectMenuOpen(false);
                    if (onExportMarkdown) {
                      onExportMarkdown();
                    }
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText size={13} className="text-amber-400" />
                  <span>Export Markdown (.md)</span>
                </button>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    if (onTogglePrintModal) onTogglePrintModal(true);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer size={13} className="text-cyan-300" />
                  <span>Print & Publish (PDF)</span>
                </button>
              </div>

              {/* Group 2: Generators & Importers */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-emerald-400/70 tracking-wider">
                  Generators & Importers
                </div>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    onSwitchView('aime');
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-emerald-400" />
                  <span>AIME Creative Studio</span>
                </button>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    if (onToggleElementDrawer) onToggleElementDrawer(true);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Layers size={13} className="text-emerald-400" />
                  <span>In-Situ Elements Drawer</span>
                </button>
              </div>

              {/* Group 3: Catalogs & Manual */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-amber-400/70 tracking-wider">
                  Catalogs & Manual
                </div>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    if (onToggleCatalog) onToggleCatalog(true);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FolderOpen size={13} className="text-amber-400" />
                  <span>Story Project Roster</span>
                </button>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    onSwitchView('elements');
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Box size={13} className="text-amber-400" />
                  <span>Element Forge Catalog</span>
                </button>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsProjectMenuOpen(false);
                    if (onToggleGuide) onToggleGuide(true);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Compass size={13} className="text-cyan-400" />
                  <span>ADE User Guide & Manual</span>
                </button>
                <button
                  onClick={handleClearStoryElements}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-950/60 text-red-400 hover:text-red-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear Story Elements</span>
                </button>
              </div>

              {/* Group 4: Cloud Synchronization */}
              {currentUser && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-sky-400/70 tracking-wider">
                    Cloud Database
                  </div>
                  <button
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.03);
                      setIsProjectMenuOpen(false);
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
                      setIsProjectMenuOpen(false);
                      pullUniverseFromCloud();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-sky-950/60 text-sky-300 hover:text-sky-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Globe size={13} className="text-sky-400" />
                    <span>Pull from Cloud DB</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cloud Sync Status & User Tag */}
        {currentUser && (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                cloudSyncStatus === 'syncing'
                  ? 'bg-amber-400 animate-ping'
                  : cloudSyncStatus === 'synced'
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : cloudSyncStatus === 'error'
                  ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse'
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
            <span className="text-[11px] text-cyan-300 font-mono font-bold hidden sm:inline" title={currentUser.email || ''}>
              {userHandle ? `@${userHandle}` : (currentUser.displayName || 'Architect')}
            </span>
            <button
              type="button"
              onClick={() => onToggleSettings?.(true)}
              className="text-slate-500 hover:text-cyan-300 ml-1 transition-colors cursor-pointer"
              title="User Settings & Identity"
            >
              <Settings size={12} />
            </button>
          </div>
        )}
      </div>

      {/* ── ZONE B: PRIMARY STUDIO MODE SWITCHER (Center) ── */}
      <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-0.5 shadow-inner gap-1">
        {/* Scenarios Mode */}
        <button
          type="button"
          onClick={() => onSwitchView('scenarios')}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            activeView === 'scenarios'
              ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Consolidated Scenario Outline, OSR Control Panel Deck, & Connected Manuscript Studio"
        >
          <BookOpen size={12} />
          <span>Scenarios</span>
        </button>

        {/* AIME Studio Mode */}
        <button
          type="button"
          onClick={() => onSwitchView('aime')}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            activeView === 'aime'
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="AIME Creative Studio: 4-Stage Narrative Weaver, Outlining, & Prose Drafts"
        >
          <Sparkles size={12} className={activeView === 'aime' ? '' : 'text-amber-400'} />
          <span>AIME Studio</span>
        </button>

        {/* Interactive Story Mode */}
        <button
          type="button"
          onClick={() => onSwitchView('interactive')}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            activeView === 'interactive'
              ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Granular Interactive Story Mode with Gated 1-2 Paragraph AI Beats & Decision Gates"
        >
          <Feather size={12} />
          <span className="hidden md:inline">Interactive</span>
        </button>

        {/* Element Forge Mode */}
        <button
          type="button"
          onClick={() => onSwitchView('elements')}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            activeView === 'elements'
              ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Consolidated Element Forge & Compendium Database"
        >
          <Box size={12} />
          <span>Elements</span>
          <span className="text-[10px] px-1 py-0.2 rounded-full bg-slate-950/80 text-emerald-300 font-mono">
            {elementsCatalog?.length || 0}
          </span>
        </button>

        {/* Direct Deploy to Tactical Map / Stage VTT Button */}
        <a
          href={targetMapId ? `/foundry/map-maker?mapId=${targetMapId}` : '/foundry/map-maker'}
          onClick={() => AudioService.playTerminalBeep(1400, 0.05)}
          className="px-3 py-1 bg-gradient-to-r from-purple-900 via-cyan-900 to-slate-900 hover:from-purple-800 hover:to-cyan-800 border border-cyan-400 text-cyan-200 hover:text-white rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer ml-1"
          title="Launch scenario into Tactical Map Maker or The Stage VTT"
        >
          <Play size={12} fill="currentColor" className="text-amber-400" />
          <span className="hidden lg:inline">Deploy to VTT</span>
          <ExternalLink size={11} className="text-cyan-300 ml-0.5" />
        </a>
      </div>

      {/* ── ZONE C: CONTROLS, QUICK DRAWERS & TOOLS (Right) ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* PANELS Dropdown (Overlays & Views) */}
        <div className="relative" ref={panelsMenuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              AudioService.playTerminalBeep(1000, 0.02);
              setIsPanelsMenuOpen(prev => !prev);
              setIsProjectMenuOpen(false);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Layers size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">PANELS</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isPanelsMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPanelsMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-slate-900/98 border border-cyan-500/40 rounded-xl shadow-2xl py-1 z-50 backdrop-blur-xl text-xs divide-y divide-slate-800 font-mono">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Workspace & Overlays
              </div>

              {/* Scenarios Workspace Selection */}
              {activeView === 'scenarios' && (
                <div className="py-1">
                  <div className="px-3 py-0.5 text-[9px] uppercase font-bold text-cyan-400/80">
                    Scenario Format View
                  </div>
                  {[
                    { id: 'canvas', label: 'Standard Canvas', icon: '📝' },
                    { id: 'control-panel', label: 'OSR Control Panel', icon: '🎛️' },
                    { id: 'manuscript', label: 'Connected Manuscript', icon: '📜' }
                  ].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => {
                        onSelectScenarioWorkspaceTab?.(format.id);
                        setIsPanelsMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between transition-colors uppercase tracking-wider ${
                        scenarioWorkspaceTab === format.id
                          ? 'bg-cyan-950/80 text-[#22d3ee]'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{format.icon}</span>
                        <span>{format.label}</span>
                      </span>
                      {scenarioWorkspaceTab === format.id && <span className="text-cyan-400 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Tree & Drawer Toggles */}
              <div className="py-1">
                {onToggleTreeExpanded && activeView === 'scenarios' && (
                  <button
                    onClick={() => {
                      onToggleTreeExpanded();
                      setIsPanelsMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>🌳</span>
                      <span>Scenario Outliner Tree</span>
                    </span>
                    <span className={isTreeExpanded ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
                      {isTreeExpanded ? '✓' : '✗'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onToggleElementDrawer?.(prev => !prev);
                    setIsPanelsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>🧩</span>
                    <span>In-Situ Elements Drawer</span>
                  </span>
                  <span className={isElementDrawerOpen ? 'text-purple-400 font-bold' : 'text-slate-600'}>
                    {isElementDrawerOpen ? '✓' : '✗'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onToggleAimeChat?.(prev => !prev);
                    setIsPanelsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    <span>AIME Co-Pilot Drawer</span>
                  </span>
                  <span className={isAimeChatOpen ? 'text-amber-400 font-bold' : 'text-slate-600'}>
                    {isAimeChatOpen ? '✓' : '✗'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tactical Quick Drawers Cluster */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 gap-0.5 shadow-sm">
          {/* Guidance Gems Trigger */}
          <button
            type="button"
            onClick={() => onToggleGems?.(true)}
            className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isGemsOpen
                ? 'bg-amber-950 text-amber-200 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-amber-400 hover:text-amber-200 hover:bg-slate-800/80 border border-transparent'
            }`}
            title="Configure Guidance Gems (Mood, Genre, Tone, Pacing, POV, Theme, Conflict, Setting)"
          >
            <span>💎</span>
            <span className="hidden xl:inline">Gems</span>
            <span className="text-[10px] px-1 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {(universeState?.creativeState?.gems || []).length}
            </span>
          </button>

          {/* Project Scratchbook Trigger */}
          <button
            type="button"
            onClick={() => onToggleScratchbook?.(true)}
            className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isScratchbookOpen
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-emerald-400 hover:text-emerald-200 hover:bg-slate-800/80 border border-transparent'
            }`}
            title="Open Project Scratchbook & Elements Used Document (.md)"
          >
            <span>📓</span>
            <span className="hidden xl:inline">Scratchbook</span>
          </button>

          {/* Print & Publishing Trigger */}
          <button
            type="button"
            onClick={() => onTogglePrintModal?.(true)}
            className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isPrintModalOpen
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-cyan-400 hover:text-cyan-200 hover:bg-slate-800/80 border border-transparent'
            }`}
            title="Print Fiction Book or OSR Adventure Module"
          >
            <Printer size={12} />
            <span className="hidden xl:inline">Print</span>
          </button>

          {/* AIME Co-Pilot Drawer Trigger */}
          <button
            type="button"
            onClick={() => onToggleAimeChat?.(prev => !prev)}
            className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isAimeChatOpen
                ? 'bg-amber-950/80 border border-amber-500/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-amber-400 hover:text-amber-200 hover:bg-slate-800/80 border border-transparent'
            }`}
            title="Toggle AIME Co-Pilot (Story, lore & creative writing assistant)"
          >
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            <span className="hidden xl:inline">AIME</span>
          </button>

          {/* In-Situ Elements Drawer Trigger */}
          <button
            type="button"
            onClick={() => onToggleElementDrawer?.(prev => !prev)}
            className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isElementDrawerOpen
                ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'text-purple-400 hover:text-purple-200 hover:bg-slate-800/80 border border-transparent'
            }`}
            title="Toggle In-Situ Worldbuilding Elements Drawer (Personas, Factions, Items, Lore)"
          >
            <span>🧩</span>
            <span className="hidden xl:inline">Elements</span>
          </button>
        </div>
      </div>
    </header>
  );
}
