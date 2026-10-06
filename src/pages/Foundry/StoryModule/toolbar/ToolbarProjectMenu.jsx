import React, { useRef, useState, useEffect } from 'react';
import { 
  BookOpen, 
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
  PanelLeftClose, 
  PanelLeft,
  Package,
  Upload
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';
import { confirmTypedDeletion } from '../../../../utils/confirmationUtils';

export default function ToolbarProjectMenu({
  activeView,
  isTreeExpanded,
  onToggleTreeExpanded,
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
  handleClearUniverse,
  currentUser,
  userHandle,
  onExportMarkdown,
  onTogglePrintModal,
  onToggleCatalog,
  onToggleGuide,
  onToggleSettings,
  onOpenNewStoryModal,
  onOpenModuleExport,
  onOpenModuleImport,
  onOpenCompiler
}) {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(universeState?.projectName || 'Untitled Story');
  const fileMenuRef = useRef(null);
  const storyFileInputRef = useRef(null);

  useEffect(() => {
    setTitleInput(universeState?.projectName || 'Untitled Story');
  }, [universeState?.projectName]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setIsFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoadStoryFile = (e) => {
    const file = e.target.files?.[0];
    if (file && handleLoadStory) {
      handleLoadStory(file);
    }
    e.target.value = '';
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput.trim() !== universeState?.projectName) {
      updateProjectName(titleInput.trim());
    }
  };

  const handleDeleteActiveStory = async () => {
    setIsFileMenuOpen(false);
    AudioService.playTerminalBeep(800, 0.04);
    const currentTitle = universeState?.projectName || 'Untitled Story';
    if (await confirmTypedDeletion(currentTitle, 'story module project')) {
      if (universeState?.id) {
        deleteStoryProject(universeState.id);
      }
      createNewStory("New Story Module");
    }
  };

  const handleClearStoryElements = async () => {
    setIsFileMenuOpen(false);
    AudioService.playTerminalBeep(800, 0.04);
    const currentTitle = universeState?.projectName || 'Untitled Story';
    if (await confirmTypedDeletion(currentTitle, 'story element content')) {
      if (handleClearUniverse) {
        handleClearUniverse();
      }
    }
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Hidden File Input */}
      <input
        type="file"
        accept=".json"
        ref={storyFileInputRef}
        className="hidden"
        onChange={handleLoadStoryFile}
      />

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
          <span className="hidden md:inline">FILE</span>
          {currentUser && (
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                cloudSyncStatus === 'syncing'
                  ? 'bg-amber-400 animate-ping'
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
                onClick={() => {
                  setIsFileMenuOpen(false);
                  onOpenNewStoryModal();
                }}
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
                  onOpenModuleExport?.();
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Package size={13} className="text-cyan-400" />
                <span>Export Package Bundle</span>
              </button>
              <button
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  setIsFileMenuOpen(false);
                  onOpenModuleImport?.();
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-purple-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload size={13} className="text-purple-400" />
                <span>Import Package Bundle</span>
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
              {onOpenCompiler && (
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsFileMenuOpen(false);
                    onOpenCompiler();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-cyan-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Package size={13} className="text-cyan-400" />
                  <span>Compile & Prep VTT Module</span>
                </button>
              )}
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
    </div>
  );
}
