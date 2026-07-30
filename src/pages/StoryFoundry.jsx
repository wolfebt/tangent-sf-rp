import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScenarioPane from '../components/StoryFoundry/ScenarioPane';
import MapPane from '../components/StoryFoundry/MapPane';
import BastionDrawer from '../components/StoryFoundry/BastionDrawer';
import FoundryLauncherModal from '../components/StoryFoundry/FoundryLauncherModal';
import { useStory, useCampaign } from '../context/CampaignContext';
import { useAuth } from '../context/AuthContext';
import { exportElementJSON, exportElementMarkdown, exportElementPDF, deleteElementConfirm } from '../components/StoryFoundry/exportUtils';
import './StoryFoundry.css';

const StoryFoundry = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, confirmLogout, loginWithGoogle } = useAuth();
  const { 
    universeState, 
    activeScenarioId, 
    deleteStory, 
    handleSaveLocal, 
    handleLoadLocal, 
    updateProjectName, 
    updateStory, 
    handleClearUniverse,
    cloudSyncStatus,
    lastCloudSavedAt,
    pushUniverseToCloud,
    pullUniverseFromCloud,
    saveElementToCloud,
    loadElementsFromCloud,
    addStory,
    closeStory,
    createNewStory,
    confirmIfDirty,
    isDirty
  } = useStory();
  const { activeMapId, handleLoadMap, handleSaveActiveMap, updateMap } = useCampaign();
  
  const fileInputRef = useRef(null);
  const mapFileInputRef = useRef(null);
  const mapExportPngRef = useRef(null);
  
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const fileMenuRef = useRef(null);

  // New Story Modal State
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);
  const [newStoryTitleInput, setNewStoryTitleInput] = useState('');
  const [newStoryDescInput, setNewStoryDescInput] = useState('');

  const handleInitiateNewStory = () => {
    confirmIfDirty(() => {
      setIsNewStoryModalOpen(true);
    });
  };

  // Tabbed Launcher & Catalog Modal State — defaults to true on initial load
  const [isLauncherOpen, setIsLauncherOpen] = useState(true);
  const [launcherInitialTab, setLauncherInitialTab] = useState('stories');

  // Cloud Elements Library Modal State
  const [isCloudLibraryOpen, setIsCloudLibraryOpen] = useState(false);
  const [cloudLibraryElements, setCloudLibraryElements] = useState([]);
  const [isLoadingCloudLibrary, setIsLoadingCloudLibrary] = useState(false);

  // Tab State: 'story' | 'map'
  const [activeTab, setActiveTab] = useState('story');

  // BASTION AI State
  const [isBastionOpen, setIsBastionOpen] = useState(false);
  const [bastionMode, setBastionMode] = useState('chat');

  const activeMap = universeState?.maps?.find(m => m.id === activeMapId);

  // Find active element for FILE menu actions
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
  if (activeScenarioId && universeState?.scenarios) {
    findNode(universeState.scenarios);
  }

  const handleOpenCloudLibrary = async () => {
    setIsCloudLibraryOpen(true);
    setIsLoadingCloudLibrary(true);
    const elements = await loadElementsFromCloud();
    setCloudLibraryElements(elements);
    setIsLoadingCloudLibrary(false);
  };

  const handleImportCloudElement = (cloudElem) => {
    if (!cloudElem) return;
    const importedNode = {
      ...cloudElem,
      id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      children: cloudElem.children || []
    };
    addStory(importedNode);
    setIsCloudLibraryOpen(false);
    alert(`Imported "${cloudElem.title || 'Untitled'}" from Cloud DB!`);
  };

  const handleOpenBastion = (mode = 'chat') => {
    setBastionMode(mode);
    setIsBastionOpen(true);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleLoadLocal(file);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target)) {
        setIsFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="story-foundry-container bg-[#0d1117] overflow-hidden flex flex-col h-screen w-screen flex-1">
      {/* Top Navigation & Action Bar */}
      <div className="relative z-50 bg-[#0d1117] p-2 border-b border-[#0D5C63]/50 flex gap-3 items-center px-4 backdrop-blur-md flex-wrap">
        <div 
          onClick={() => navigate('/')}
          className="flex flex-col mr-2 uppercase text-[#22d3ee] tangent-title-pulse cursor-pointer hover:opacity-80 transition-opacity"
          title="Return to Home"
        >
          <span className="text-[1.8rem] font-bold leading-none">TANGENT</span>
          <span className="text-[0.85rem] leading-none">SCIENCE FANTASY ROLEPLAY</span>
          <span className="text-[1.25rem] font-bold leading-none">STORY FOUNDRY</span>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-[#161b22]/80 rounded-lg p-1 border border-[#0D5C63]/60 shadow-inner">
          <button 
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              activeTab === 'story' 
                ? 'bg-cyan-950 text-[#22d3ee] border border-[#22d3ee]/60 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            onClick={() => setActiveTab('story')}
          >
            Story Module
          </button>
          <button 
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              activeTab === 'map' 
                ? 'bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/60 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            onClick={() => setActiveTab('map')}
          >
            Map Maker
          </button>
        </div>

        {/* Story & Map Active Context Names Display */}
        <div className="flex items-center gap-2.5 bg-[#161b22]/90 border border-[#0D5C63]/80 px-3 py-1 rounded-lg backdrop-blur-sm shadow-inner shrink max-w-xl">
          {/* Story Module / Campaign Name */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs">📖</span>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0">Story:</span>
            <input
              type="text"
              value={universeState.projectName || ''}
              onChange={(e) => updateProjectName(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-100 hover:text-white focus:bg-slate-900 px-1 rounded outline-none truncate max-w-[130px] sm:max-w-[160px] transition-colors border-b border-transparent focus:border-amber-500"
              placeholder="Story Name..."
              title="Click to edit Story Module Name"
            />
          </div>

          <span className="text-slate-600 font-mono">|</span>

          {/* Active Map Name */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs">🗺️</span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider shrink-0">Map:</span>
            {activeMap ? (
              <input
                type="text"
                value={activeMap.title || ''}
                onChange={(e) => updateMap(activeMapId, { title: e.target.value })}
                className="bg-transparent text-xs font-bold text-[#22d3ee] hover:text-white focus:bg-slate-900 px-1 rounded outline-none truncate max-w-[130px] sm:max-w-[160px] transition-colors border-b border-transparent focus:border-cyan-400"
                placeholder="Map Name..."
                title="Click to edit Map Name"
              />
            ) : (
              <span className="text-xs text-slate-500 italic truncate">No Active Map</span>
            )}
          </div>

          {activeNode && (
            <>
              <span className="text-slate-600 font-mono hidden lg:inline">|</span>
              <div className="hidden lg:flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] font-bold uppercase text-amber-500 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded shrink-0">
                  {activeNode.type}
                </span>
                <span className="text-xs font-semibold text-slate-300 truncate max-w-[110px]" title={activeNode.title}>
                  {activeNode.title || 'Untitled'}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex-1"></div>
        {/* Story Launcher & Close Story Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleInitiateNewStory}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-900 to-amber-900 hover:from-cyan-800 hover:to-amber-800 border border-cyan-400/80 text-cyan-200 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(34,211,238,0.3)] flex items-center gap-1.5"
            title="Start a new story project (clears active workspace)"
          >
            <span>✨ New Story</span>
          </button>

          <button
            onClick={() => {
              setLauncherInitialTab('stories');
              setIsLauncherOpen(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-950 to-amber-950 hover:from-cyan-900 hover:to-amber-900 border border-cyan-500/60 text-cyan-300 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(34,211,238,0.25)] flex items-center gap-1.5"
            title="Open Story & Element Catalogs Launcher"
          >
            <span>📚 Catalog & Launcher</span>
          </button>

          <button
            onClick={() => {
              closeStory();
              setLauncherInitialTab('stories');
              setIsLauncherOpen(true);
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 text-slate-300 hover:text-amber-300 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            title="Save and Close working story project, returning to catalog"
          >
            <span>❌ Close Story</span>
          </button>
        </div>

        {/* User Auth Indicator & Cloud DB Status Badge */}
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono font-bold uppercase tracking-wider transition-all"
            style={{
              borderColor: cloudSyncStatus === 'synced' ? 'rgba(34, 211, 238, 0.6)' : cloudSyncStatus === 'syncing' ? 'rgba(245, 158, 11, 0.6)' : cloudSyncStatus === 'error' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(100, 116, 139, 0.5)',
              backgroundColor: cloudSyncStatus === 'synced' ? 'rgba(8, 145, 178, 0.2)' : cloudSyncStatus === 'syncing' ? 'rgba(217, 119, 6, 0.2)' : cloudSyncStatus === 'error' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(30, 41, 59, 0.6)',
              color: cloudSyncStatus === 'synced' ? '#22d3ee' : cloudSyncStatus === 'syncing' ? '#fbbf24' : cloudSyncStatus === 'error' ? '#f87171' : '#94a3b8'
            }}
            title={`Cloud DB Connection State: ${cloudSyncStatus}${lastCloudSavedAt ? ` (Last Backup: ${lastCloudSavedAt})` : ''}`}
          >
            <span>{cloudSyncStatus === 'synced' ? `☁️ Saved ${lastCloudSavedAt || ''}` : cloudSyncStatus === 'syncing' ? '🔄 Syncing' : cloudSyncStatus === 'error' ? '⚠️ DB Error' : '📡 Local Mode'}</span>
          </div>

          {currentUser ? (
            <div className="flex items-center bg-slate-800/80 px-3 py-1 rounded border border-slate-700">
              <span className="text-xs text-cyan-300 font-mono font-bold" title={currentUser.email || ''}>
                {userHandle ? `@${userHandle}` : (currentUser.displayName || currentUser.email)}
              </span>
            </div>
          ) : (
            <button onClick={loginWithGoogle} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-bold uppercase tracking-wider transition-colors">
              Login with Google
            </button>
          )}
        </div>

        {/* FILE Dropdown Menu */}
        <div className="relative" ref={fileMenuRef}>
          <button
            onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
            className="px-4 py-1.5 bg-[#161b22] hover:bg-slate-800 text-[#22d3ee] border border-[#0D5C63]/80 hover:border-[#22d3ee] rounded text-xs uppercase font-bold tracking-wider transition-all shadow-[0_0_8px_rgba(34,211,238,0.2)] flex items-center gap-1.5"
          >
            <span>📁 FILE</span>
            <span className="text-[9px]">▼</span>
          </button>

          {isFileMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-[#161b22] border border-[#0D5C63] rounded-lg shadow-2xl py-1.5 z-50 backdrop-blur-xl max-h-[85vh] overflow-y-auto">
              <div className="px-3 py-1 text-[9px] uppercase font-bold text-cyan-400 tracking-wider">
                Story Launcher & Catalogs
              </div>
              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-cyan-300 hover:bg-cyan-950/80 font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
                onClick={() => {
                  setIsFileMenuOpen(false);
                  handleInitiateNewStory();
                }}
              >
                <span>✨</span> New Story Project
              </button>
              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-[#22d3ee] hover:bg-cyan-950/80 font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
                onClick={() => {
                  setLauncherInitialTab('stories');
                  setIsLauncherOpen(true);
                  setIsFileMenuOpen(false);
                }}
              >
                <span>📖</span> Story Files Catalog
              </button>
              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-amber-300 hover:bg-amber-950/80 font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
                onClick={() => {
                  setLauncherInitialTab('elements');
                  setIsLauncherOpen(true);
                  setIsFileMenuOpen(false);
                }}
              >
                <span>🏛️</span> Saved Elements Catalog
              </button>
              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-slate-800 font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
                onClick={() => {
                  closeStory();
                  setLauncherInitialTab('stories');
                  setIsLauncherOpen(true);
                  setIsFileMenuOpen(false);
                }}
              >
                <span>❌</span> Close Working Story
              </button>

              <div className="border-t border-[#0D5C63]/50 my-1"></div>
              <div className="px-3 py-1 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Local Project File Operations
              </div>
              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-cyan-950/80 hover:text-[#22d3ee] font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsFileMenuOpen(false);
                }}
              >
                <span>📥</span> Load Story Module
              </button>
              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-cyan-950/80 hover:text-[#22d3ee] font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                onClick={() => {
                  handleSaveLocal();
                  setIsFileMenuOpen(false);
                }}
              >
                <span>💾</span> Save Story Module
              </button>

              <div className="border-t border-[#0D5C63]/50 my-1"></div>
              <div className="px-3 py-1 text-[9px] uppercase font-bold text-cyan-400 tracking-wider">
                Cloud DB Sync & Operations
              </div>

              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-cyan-200 hover:bg-cyan-950/80 hover:text-cyan-300 font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                onClick={() => {
                  pushUniverseToCloud();
                  setIsFileMenuOpen(false);
                }}
              >
                <span>☁️</span> Push to Cloud DB
              </button>

              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-cyan-200 hover:bg-cyan-950/80 hover:text-cyan-300 font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                onClick={() => {
                  pullUniverseFromCloud();
                  setIsFileMenuOpen(false);
                }}
              >
                <span>☁️</span> Pull from Cloud DB
              </button>

              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-amber-200 hover:bg-amber-950/80 hover:text-amber-300 font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                onClick={() => {
                  handleOpenCloudLibrary();
                  setIsFileMenuOpen(false);
                }}
              >
                <span>🏛️</span> Cloud Elements Library
              </button>

              <div className="border-t border-[#0D5C63]/50 my-1"></div>

              <button 
                className="w-full px-3 py-1.5 text-xs text-left text-red-300 hover:bg-red-950/80 font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                onClick={() => {
                  setIsFileMenuOpen(false);
                  if (window.confirm("Are you sure you want to clear all Story Module data? This will reset all current scenarios and maps.")) {
                    handleClearUniverse();
                  }
                }}
              >
                <span>🗑️</span> CLEAR Story Data
              </button>

              {/* Element Specific Actions when an element is selected */}
              {activeNode && (
                <>
                  <div className="border-t border-[#0D5C63]/50 my-1"></div>
                  <div className="px-3 py-1 text-[9px] uppercase font-bold text-amber-400 tracking-wider truncate">
                    Element: {activeNode.title || 'Untitled'}
                  </div>

                  <button 
                    className="w-full px-3 py-1.5 text-xs text-left text-cyan-200 hover:bg-cyan-950/80 hover:text-cyan-300 font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                    onClick={() => {
                      saveElementToCloud(activeNode);
                      setIsFileMenuOpen(false);
                    }}
                  >
                    <span>☁️</span> Save Element to Cloud DB
                  </button>

                  <button 
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-amber-950/80 hover:text-amber-300 font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                    onClick={() => {
                      exportElementJSON(activeNode, universeState);
                      setIsFileMenuOpen(false);
                    }}
                  >
                    <span>📤</span> Export Element JSON
                  </button>

                  <button 
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-cyan-950/80 hover:text-cyan-300 font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                    onClick={() => {
                      exportElementMarkdown(activeNode, universeState);
                      setIsFileMenuOpen(false);
                    }}
                  >
                    <span>📄</span> Export Markdown (.md)
                  </button>

                  <button 
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-emerald-950/80 hover:text-emerald-300 font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                    onClick={() => {
                      exportElementPDF(activeNode, universeState);
                      setIsFileMenuOpen(false);
                    }}
                  >
                    <span>🖨️</span> Export PDF
                  </button>

                  <button 
                    className="w-full px-3 py-1.5 text-xs text-left text-red-400 hover:bg-red-950/80 hover:text-red-200 font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                    onClick={() => {
                      deleteElementConfirm(activeNode, deleteStory);
                      setIsFileMenuOpen(false);
                    }}
                  >
                    <span>🗑️</span> Delete Element
                  </button>
                </>
              )}

              {activeTab === 'map' && (
                <>
                  <div className="border-t border-[#0D5C63]/50 my-1"></div>
                  <button 
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-cyan-950/80 hover:text-[#22d3ee] font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                    onClick={() => {
                      mapFileInputRef.current?.click();
                      setIsFileMenuOpen(false);
                    }}
                  >
                    <span>🗺️</span> Load Map
                  </button>
                  <button 
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-cyan-950/80 hover:text-[#22d3ee] font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                    onClick={() => {
                      handleSaveActiveMap();
                      setIsFileMenuOpen(false);
                    }}
                  >
                    <span>💾</span> Save Map
                  </button>
                  <button 
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-cyan-950/80 hover:text-[#22d3ee] font-medium flex items-center gap-2 transition-colors uppercase tracking-wider font-bold"
                    onClick={() => {
                      mapExportPngRef.current?.();
                      setIsFileMenuOpen(false);
                    }}
                  >
                    <span>📷</span> Export PNG
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={onFileChange} 
        />
        <input 
          type="file" 
          accept=".json" 
          ref={mapFileInputRef} 
          style={{ display: 'none' }} 
          onChange={(e) => {
            if (e.target.files[0]) {
              handleLoadMap(e.target.files[0]);
            }
          }} 
        />
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'story' ? (
          <div className="h-full w-full">
            <ScenarioPane onOpenBastion={handleOpenBastion} onSwitchTab={setActiveTab} />
          </div>
        ) : (
          <div className="h-full w-full relative">
            <MapPane mapExportPngRef={mapExportPngRef} />
            {/* Bottom-left Bastion toggle button in Map Maker view */}
            <div className="fixed bottom-4 left-4 z-40">
              <button
                onClick={() => handleOpenBastion('chat')}
                className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] flex items-center gap-2"
              >
                <span>🤖</span> BASTION AI
              </button>
            </div>
          </div>
        )}

        {/* BASTION AI Drawer */}
        <BastionDrawer 
          isOpen={isBastionOpen} 
          onClose={() => setIsBastionOpen(false)} 
          initialTab={bastionMode}
        />

        {/* Cloud Elements Library Modal */}
        {isCloudLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans">
            <div className="bg-[#161b22] border border-[#0D5C63] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 bg-slate-950 border-b border-cyan-900/60 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                    Cloud DB Story Elements Library
                  </h3>
                </div>
                <button
                  onClick={() => setIsCloudLibraryOpen(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold px-2"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {isLoadingCloudLibrary ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-cyan-400">
                    <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">Fetching Cloud DB Elements...</span>
                  </div>
                ) : cloudLibraryElements.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No elements found in Cloud DB library. Select an element and use <span className="text-cyan-300 font-bold">"Save Element to Cloud DB"</span> from the FILE menu to publish to the cloud.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cloudLibraryElements.map((elem) => (
                      <div 
                        key={elem.id} 
                        className="bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/80 rounded-lg p-3 flex flex-col justify-between transition-all shadow-md group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[9px] font-bold uppercase text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded">
                              {elem.type || 'Element'}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono truncate" title={elem.authorEmail}>
                              {elem.authorEmail ? `@${elem.authorEmail.split('@')[0]}` : 'Cloud'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate mb-1">
                            {elem.title || 'Untitled Element'}
                          </h4>
                          {elem.content && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {elem.content.replace(/<[^>]+>/g, '')}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleImportCloudElement(elem)}
                          className="mt-3 w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-[10px] font-bold uppercase tracking-wider rounded transition-colors shadow-sm"
                        >
                          📥 Import to Story
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsCloudLibraryOpen(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Story Creation Modal */}
        {isNewStoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
            <div className="bg-[#161b22] border border-[#0D5C63] rounded-2xl p-6 w-full max-w-md flex flex-col shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-amber-600 flex items-center justify-center text-lg shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  ✨
                </div>
                <div>
                  <h3 className="text-base font-bold text-cyan-300 uppercase tracking-wider">
                    Create New Story Project
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Clear active workspace & start a fresh story
                  </p>
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newStoryTitleInput.trim()) {
                    alert("Please enter a valid story title.");
                    return;
                  }
                  createNewStory(newStoryTitleInput.trim(), newStoryDescInput.trim());
                  setNewStoryTitleInput('');
                  setNewStoryDescInput('');
                  setIsNewStoryModalOpen(false);
                }} 
                className="space-y-4 mt-2"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Story Title
                  </label>
                  <input 
                    type="text"
                    value={newStoryTitleInput}
                    onChange={(e) => setNewStoryTitleInput(e.target.value)}
                    placeholder="E.g., Derelict Sector Operation..."
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2.5 rounded-lg text-xs outline-none focus:border-cyan-400 font-semibold"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Description (Optional)
                  </label>
                  <textarea 
                    rows={3}
                    value={newStoryDescInput}
                    onChange={(e) => setNewStoryDescInput(e.target.value)}
                    placeholder="Brief premise, campaign notes, or background..."
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2.5 rounded-lg text-xs outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewStoryModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-xs font-bold uppercase rounded-lg transition-all shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                  >
                    ✨ Create Story
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Story Foundry Launcher & Catalogs Tabbed Modal */}
        <FoundryLauncherModal
          isOpen={isLauncherOpen}
          onClose={() => setIsLauncherOpen(false)}
          initialTab={launcherInitialTab}
        />
      </div>
    </div>
  );
};

export default StoryFoundry;
