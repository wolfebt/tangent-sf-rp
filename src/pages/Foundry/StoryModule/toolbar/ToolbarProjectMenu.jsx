import React, { useRef, useState, useEffect } from 'react';
import { 
  BookOpen, 
  FolderOpen, 
  ChevronDown, 
  Check,
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
import { useStory } from '../../../../context/CampaignContext';
import { useAuth } from '../../../../context/AuthContext';
import { useAdeStore } from '../../store/adeStore';
import NewStoryModal from './NewStoryModal';

export default function ToolbarProjectMenu({
  activeView,
  universeState: propUniverseState,
  storyCatalog: propStoryCatalog,
  openStory: propOpenStory,
  createNewStory: propCreateNewStory,
  deleteStoryProject: propDeleteStoryProject,
  updateProjectName: propUpdateProjectName,
  handleSaveStory: propHandleSaveStory,
  handleLoadStory: propHandleLoadStory,
  pushUniverseToCloud: propPushUniverseToCloud,
  pullUniverseFromCloud: propPullUniverseFromCloud,
  cloudSyncStatus: propCloudSyncStatus,
  lastCloudSavedAt: propLastCloudSavedAt,
  handleClearUniverse: propHandleClearUniverse,
  currentUser: propCurrentUser,
  userHandle: propUserHandle,
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
  const storyCtx = useStory() || {};
  const authCtx = useAuth() || {};

  const universeState = propUniverseState || storyCtx.universeState;
  const storyCatalog = propStoryCatalog || storyCtx.storyCatalog || [];
  const openStory = propOpenStory || storyCtx.openStory;
  const createNewStory = propCreateNewStory || storyCtx.createNewStory;
  const deleteStoryProject = propDeleteStoryProject || storyCtx.deleteStoryProject;
  const updateProjectName = propUpdateProjectName || storyCtx.updateProjectName;
  const handleSaveStory = propHandleSaveStory || storyCtx.handleSaveStory;
  const handleLoadStory = propHandleLoadStory || storyCtx.handleLoadStory;
  const pushUniverseToCloud = propPushUniverseToCloud || storyCtx.pushUniverseToCloud;
  const pullUniverseFromCloud = propPullUniverseFromCloud || storyCtx.pullUniverseFromCloud;
  const cloudSyncStatus = propCloudSyncStatus || storyCtx.cloudSyncStatus || 'idle';
  const lastCloudSavedAt = propLastCloudSavedAt || storyCtx.lastCloudSavedAt;
  const handleClearUniverse = propHandleClearUniverse || storyCtx.handleClearUniverse;
  const currentUser = propCurrentUser || authCtx.currentUser;
  const userHandle = propUserHandle || authCtx.userHandle;

  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);
  const handleOpenNew = onOpenNewStoryModal || (() => setIsNewStoryModalOpen(true));
  const handleOpenExport = onOpenModuleExport || (() => useAdeStore.getState().setModal('moduleExport', true));
  const handleOpenImport = onOpenModuleImport || (() => useAdeStore.getState().setModal('moduleImport', true));
  const handleOpenCompilerAction = onOpenCompiler || (() => useAdeStore.getState().setModal('compiler', true));
  const handleTogglePrint = onTogglePrintModal || (() => window.dispatchEvent(new CustomEvent('open-ade-print')));
  const handleExportMd = onExportMarkdown || (() => window.dispatchEvent(new CustomEvent('export-scenario-markdown')));
  const handleToggleCatalogAction = onToggleCatalog || (() => useAdeStore.getState().setModal('catalog', true));
  const handleToggleGuideAction = onToggleGuide || (() => window.dispatchEvent(new CustomEvent('open-guide-modal')));
  const handleToggleSettingsAction = onToggleSettings || (() => window.dispatchEvent(new CustomEvent('open-settings-modal')));
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
    window.addEventListener('pointerdown', handleClickOutside, true);
    return () => window.removeEventListener('pointerdown', handleClickOutside, true);
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

      {/* Consolidated Story Module & File Pulldown */}
      <div className="relative" ref={fileMenuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            AudioService.playTerminalBeep(1000, 0.02);
            setIsFileMenuOpen(prev => !prev);
          }}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Story Module Actions, File I/O, and Project Settings"
        >
          <BookOpen size={12} className="text-cyan-400 shrink-0" />
          <span className="max-w-[130px] md:max-w-[190px] truncate text-slate-100">
            {universeState?.projectName || 'New Story Module'}
          </span>
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
          <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 ${isFileMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
        </button>

        {isFileMenuOpen && (
          <div className="absolute left-0 mt-1.5 w-72 bg-slate-900/98 border border-cyan-500/40 rounded-2xl shadow-2xl py-1.5 z-50 backdrop-blur-2xl text-xs font-mono divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Active Module Header & Rename Input */}
            <div className="px-3 py-2 bg-slate-950/70 rounded-t-2xl">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">
                  Active Story Module
                </span>
                {currentUser && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
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
                    />
                    <span className="capitalize">{cloudSyncStatus || 'local'}</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                }}
                className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 text-xs font-mono text-amber-300 font-bold px-2 py-1 rounded-lg outline-none transition-colors"
                title="Edit module name (press Enter to save)"
                placeholder="Story Module Name..."
              />
            </div>

            {/* Switch Story Module (if multiple) */}
            {storyCatalog && storyCatalog.length > 1 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-cyan-400/70 tracking-wider flex items-center justify-between">
                  <span>Switch Module</span>
                  <span className="text-slate-500">{storyCatalog.length} modules</span>
                </div>
                <div className="max-h-36 overflow-y-auto custom-scrollbar my-0.5">
                  {storyCatalog.map(s => {
                    const isActive = s.id === universeState?.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          AudioService.playTerminalBeep(1100, 0.02);
                          if (s.id) openStory(s.id);
                          setIsFileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isActive 
                            ? 'bg-cyan-950/80 text-cyan-300 font-bold border-l-2 border-cyan-400' 
                            : 'hover:bg-slate-800/70 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <BookOpen size={12} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                          <span className="truncate">{s.projectName || s.title || 'Untitled Story'}</span>
                        </div>
                        {isActive && <Check size={12} className="text-cyan-400 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* File Storage & Formats */}
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">
                Story File Actions
              </div>
              <button
                onClick={() => {
                  setIsFileMenuOpen(false);
                  handleOpenNew();
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
                  handleOpenExport();
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
                  handleOpenImport();
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
                  handleExportMd();
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
                  handleTogglePrint(true);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer size={13} className="text-cyan-300" />
                <span>Print & Publish (PDF)</span>
              </button>
              <button
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  setIsFileMenuOpen(false);
                  handleOpenCompilerAction();
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-cyan-950/60 text-cyan-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Package size={13} className="text-cyan-400" />
                <span>Compile & Prep VTT Module</span>
              </button>
            </div>

            {/* Catalogs & Help */}
            <div className="py-1">
              <button
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  setIsFileMenuOpen(false);
                  handleToggleCatalogAction(true);
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
                  handleToggleGuideAction(true);
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

      {/* Self-contained New Story Module Modal */}
      <NewStoryModal
        isOpen={isNewStoryModalOpen}
        onClose={() => setIsNewStoryModalOpen(false)}
        onCreateStory={createNewStory}
      />
    </div>
  );
}
