import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScenarioPane from '../components/StoryFoundry/ScenarioPane';
import MapPane from '../components/StoryFoundry/MapPane';
import BastionDrawer from '../components/StoryFoundry/BastionDrawer';
import { useStory, useCampaign } from '../context/CampaignContext';
import { useAuth } from '../context/AuthContext';
import { exportElementJSON, exportElementMarkdown, exportElementPDF, deleteElementConfirm } from '../components/StoryFoundry/exportUtils';
import './StoryFoundry.css';

const StoryFoundry = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, confirmLogout, loginWithGoogle } = useAuth();
  const { universeState, activeScenarioId, deleteStory, handleSaveLocal, handleLoadLocal, updateProjectName, updateStory, handleClearUniverse } = useStory();
  const { activeMapId, handleLoadMap, handleSaveActiveMap, updateMap } = useCampaign();
  
  const fileInputRef = useRef(null);
  const mapFileInputRef = useRef(null);
  const mapExportPngRef = useRef(null);
  
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const fileMenuRef = useRef(null);

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
        
        {/* User Auth Indicator / ID Tag */}
        <div className="flex items-center gap-2">
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
            <div className="absolute right-0 mt-1.5 w-56 bg-[#161b22] border border-[#0D5C63] rounded-lg shadow-2xl py-1.5 z-50 backdrop-blur-xl max-h-[85vh] overflow-y-auto">
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
      </div>
    </div>
  );
};

export default StoryFoundry;
