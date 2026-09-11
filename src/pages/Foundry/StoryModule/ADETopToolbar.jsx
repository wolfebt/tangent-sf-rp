/**
 * @file ADETopToolbar.jsx
 * @description Streamlined Glass-Cockpit Top Navigation Toolbar for the Adventure Development Environment (ADE).
 * Aligns ADE with the high-efficiency glass cockpit design of The Stage VTT and Map Maker:
 *   - Left: Project Switcher & Title, Focused File/Project Dropdown, Cloud Sync Badge
 *   - Center: Segmented Studio Workspace Switcher (Scenarios, OSR Control Panel, Manuscript, Interactive, Element Forge, AIME Studio)
 *   - Right: Deploy to VTT, Tactical Modals Hub (Gems, Cronicle, Scratchbook, Print), and Master Cockpit Dock Toggle
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
  FileText, 
  Printer, 
  Compass, 
  Globe, 
  Cloud, 
  Play, 
  ExternalLink,
  Settings,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Sliders,
  Target
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
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
  isCronicleOpen,
  onToggleCronicle,
  // Outliner toggle
  isTreeExpanded = true,
  onToggleTreeExpanded,
  // Right Cockpit Dock
  isRightDockOpen = true,
  onToggleRightDock,
  activeCockpitDeck = 'inspector',
  onSelectCockpitDeck,
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
    activeMapId,
    cronicle
  } = useStory();

  const { currentUser, userHandle } = useAuth();

  // Dropdown states & refs
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(universeState?.projectName || 'Untitled Story');

  const fileMenuRef = useRef(null);
  const storyFileInputRef = useRef(null);

  useEffect(() => {
    setTitleInput(universeState?.projectName || 'Untitled Story');
  }, [universeState?.projectName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setIsFileMenuOpen(false);
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
    setIsFileMenuOpen(false);
    AudioService.playTerminalBeep(1200, 0.03);
    const name = prompt("Enter title for new Story Module:", "New Story Module");
    if (name && name.trim()) {
      createNewStory(name.trim());
    }
  };

  const handleDeleteActiveStory = () => {
    setIsFileMenuOpen(false);
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
    setIsFileMenuOpen(false);
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

  const gemsCount = (universeState?.creativeState?.gems || []).length;
  const pendingCronicleCount = cronicle?.pendingDeltas?.length || 0;

  return (
    <header className="relative z-40 bg-slate-950/98 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between gap-2 select-none shadow-xl backdrop-blur-2xl font-mono shrink-0 h-12">
      {/* Hidden File Input */}
      <input
        type="file"
        accept=".json"
        ref={storyFileInputRef}
        className="hidden"
        onChange={handleLoadStoryFile}
      />

      {/* ── ZONE 1: PROJECT IDENTITY & FILE OPS (Left) ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Outliner Sidebar Toggle (when on scenarios) */}
        {onToggleTreeExpanded && activeView === 'scenarios' && (
          <button
            type="button"
            onClick={onToggleTreeExpanded}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isTreeExpanded 
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isTreeExpanded ? "Collapse Outliner Tree (Ctrl+[)" : "Expand Outliner Tree (Ctrl+[)"}
          >
            {isTreeExpanded ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
          </button>
        )}

        {/* Brand Indicator */}
        <div className="flex items-center gap-1.5 font-mono shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-cyan-400 font-bold text-xs tracking-widest uppercase hidden sm:inline">
            ADE STUDIO
          </span>
        </div>

        {/* Story Project Pill */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 shadow-sm">
          <BookOpen size={12} className="text-cyan-400 shrink-0" />
          
          {storyCatalog && storyCatalog.length > 1 ? (
            <select
              value={universeState?.id || ''}
              onChange={(e) => {
                AudioService.playTerminalBeep(1100, 0.02);
                if (e.target.value) openStory(e.target.value);
              }}
              className="bg-transparent text-xs font-mono text-slate-100 focus:outline-none cursor-pointer max-w-[120px] md:max-w-[160px] truncate font-bold"
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
                className="bg-slate-950 text-xs font-bold font-mono text-amber-300 uppercase px-1.5 py-0.5 rounded outline-none border border-amber-500 max-w-[140px]"
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                className="text-xs font-bold font-mono text-slate-100 hover:text-amber-400 cursor-pointer max-w-[120px] md:max-w-[160px] truncate px-1 transition-colors"
                title="Click to rename Story Module"
              >
                {universeState?.projectName || 'Untitled Story'}
              </span>
            )
          )}
        </div>

        {/* Focused File & Project Dropdown */}
        <div className="relative" ref={fileMenuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              AudioService.playTerminalBeep(1000, 0.02);
              setIsFileMenuOpen(prev => !prev);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="File I/O, Project Roster, and Cloud Sync"
          >
            <FolderOpen size={12} className="text-cyan-400" />
            <span className="hidden md:inline">PROJECT</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isFileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFileMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-slate-900/98 border border-cyan-500/40 rounded-2xl shadow-2xl py-1.5 z-50 backdrop-blur-2xl text-xs font-mono divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* File Storage & Formats */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">
                  Story File Actions
                </div>
                <button
                  onClick={handleCreateNewStory}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FilePlus size={13} className="text-cyan-400" />
                  <span>New Story Module</span>
                </button>
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
                    if (onTogglePrintModal) onTogglePrintModal(true);
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
                    setIsFileMenuOpen(false);
                    if (onToggleGuide) onToggleGuide(true);
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
                  onClick={handleClearStoryElements}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-950/60 text-red-400 hover:text-red-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear Story Elements</span>
                </button>
                <button
                  onClick={handleDeleteActiveStory}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-950/60 text-red-400 hover:text-red-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete Story Project</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cloud Sync Status Indicator */}
        {currentUser && (
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                cloudSyncStatus === 'syncing'
                  ? 'bg-amber-400 animate-ping'
                  : cloudSyncStatus === 'synced'
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
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
            <span className="text-[10px] text-cyan-300 font-mono font-bold truncate max-w-[90px]">
              {userHandle ? `@${userHandle}` : 'Architect'}
            </span>
            <button
              type="button"
              onClick={() => onToggleSettings?.(true)}
              className="text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings size={11} />
            </button>
          </div>
        )}
      </div>

      {/* ── ZONE 2: PRIMARY STUDIO WORKSPACE SWITCHER (Center) ── */}
      <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-0.5 shadow-inner gap-1 overflow-x-auto scrollbar-none">
        {/* 1. Story Weaver Workspace */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            onSwitchView('scenarios');
          }}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeView === 'scenarios'
              ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Story Weaver: Outliner hierarchy, rich prose drafting, word telemetry, POV lock, and plot beats"
        >
          <BookOpen size={13} />
          <span>Story Weaver</span>
        </button>

        {/* 2. Interactive Play Studio */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            onSwitchView('interactive');
          }}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeView === 'interactive'
              ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Interactive Play: Play through foundry scenarios with Folio personas, presets, and decision gates"
        >
          <span>⚡</span>
          <span>Interactive Play</span>
        </button>

        {/* 3. OSR Tactical Spread */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            onSwitchView('control-panel');
          }}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeView === 'control-panel'
              ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="OSR 2-Page Tactical Control Panel Spread (Read-Aloud, DCs, Threats, Secrets)"
        >
          <Target size={13} className={activeView === 'control-panel' ? '' : 'text-amber-400'} />
          <span className="hidden sm:inline">Tactical Spread</span>
          <span className="sm:hidden">Tactical</span>
        </button>

        {/* 4. Element Forge Database */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            onSwitchView('elements');
          }}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeView === 'elements'
              ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Element Forge: Worldbuilding Database (Personas, Factions, Items, Lore)"
        >
          <Box size={13} className={activeView === 'elements' ? '' : 'text-emerald-400'} />
          <span>Element Forge</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/80 text-emerald-300 font-mono">
            {elementsCatalog?.length || 0}
          </span>
        </button>
      </div>

      {/* ── ZONE 3: TACTICAL HUB & COCKPIT CONTROLS (Right) ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Deploy to VTT Button */}
        <a
          href={targetMapId ? `/foundry/map-maker?mapId=${targetMapId}` : '/foundry/map-maker'}
          onClick={() => AudioService.playTerminalBeep(1400, 0.05)}
          className="px-2.5 py-1 bg-gradient-to-r from-purple-900/80 via-cyan-950/80 to-slate-900 hover:from-purple-800 hover:to-cyan-800 border border-cyan-400/80 text-cyan-200 hover:text-white rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer"
          title="Launch linked tactical encounter map in Map Maker or The Stage VTT"
        >
          <Play size={11} fill="currentColor" className="text-amber-400 shrink-0" />
          <span className="hidden xl:inline">Deploy VTT</span>
          <ExternalLink size={10} className="text-cyan-300 shrink-0" />
        </a>

        {/* Fast-Access Modals Cluster */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 gap-0.5 shadow-sm">
          {/* Gems */}
          <button
            type="button"
            onClick={() => onToggleGems?.(true)}
            className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isGemsOpen
                ? 'bg-amber-950 text-amber-200 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'text-amber-400 hover:text-amber-200 hover:bg-slate-800/80 border border-transparent'
            }`}
            title="Guidance Gems (Genre, Tone, POV, Conflict tags)"
          >
            <span>💎</span>
            <span className="text-[10px] px-1 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {gemsCount}
            </span>
          </button>

          {/* Cronicle */}
          <button
            type="button"
            onClick={() => onToggleCronicle?.(true)}
            className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isCronicleOpen
                ? 'bg-amber-950 text-amber-200 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'text-amber-400/90 hover:text-amber-200 hover:bg-slate-800/80 border border-transparent'
            }`}
            title="Cronicle Living Memory Deck"
          >
            <span>📜</span>
            {pendingCronicleCount > 0 && (
              <span className="text-[10px] px-1 rounded-full bg-amber-500 text-black font-mono font-bold animate-pulse">
                {pendingCronicleCount}
              </span>
            )}
          </button>

          {/* Scratchbook */}
          <button
            type="button"
            onClick={() => onToggleScratchbook?.(true)}
            className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isScratchbookOpen
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'text-emerald-400 hover:text-emerald-200 hover:bg-slate-800/80 border border-transparent'
            }`}
            title="Project Scratchbook & Aggregated Elements Document"
          >
            <span>📓</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={() => onTogglePrintModal?.(true)}
            className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isPrintModalOpen
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'text-cyan-400 hover:text-cyan-200 hover:bg-slate-800/80 border border-transparent'
            }`}
            title="Print & PDF Publishing Spread"
          >
            <Printer size={12} />
          </button>
        </div>

        {/* Master Right Cockpit Dock Toggle */}
        {onToggleRightDock && (
          <button
            type="button"
            onClick={onToggleRightDock}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
              isRightDockOpen
                ? 'bg-cyan-950/80 border-cyan-400/80 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
            title={isRightDockOpen ? "Collapse Right Cockpit Dock (])" : "Expand Right Cockpit Dock (])"}
          >
            <Sliders size={12} className={isRightDockOpen ? 'text-cyan-400' : 'text-slate-400'} />
            <span className="hidden md:inline">COCKPIT</span>
            {isRightDockOpen ? <PanelRightClose size={13} /> : <PanelRight size={13} />}
          </button>
        )}
      </div>
    </header>
  );
}
