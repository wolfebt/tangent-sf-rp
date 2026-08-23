import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Dices, 
  Volume2, 
  VolumeX, 
  Settings, 
  LogOut, 
  Key,
  MessageSquare,
  Radio,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useDBM } from '../../context/DBMContext';
import { AudioService } from '../../services/audioService';
import { UserSettingsModal } from '../UserSettingsModal';
import { ComprehensiveUserGuideModal } from '../UI/ComprehensiveUserGuideModal';

export const GlobalHUD = ({ onOpenCommandPalette, onToggleDiceDock, isDiceDockOpen, onToggleCommsDock, isCommsDockOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userHandle, loginWithGoogle, confirmLogout, isAdmin, userRole, adminOverride, toggleAdminOverride } = useAuth();
  const { totalUnreadCount, toggleCommsDock } = useChat();
  const dbm = useDBM() || {};
  const {
    history,
    historyIndex,
    handleBack,
    handleForward,
    isSidebarOpen,
    setIsSidebarOpen,
    isBastionOpen,
    setIsBastionOpen,
    setIsArchitectModalOpen,
    handleExportMasterJSON,
    handleImportMasterJSON,
    navigateToCategory
  } = dbm;

  const isDBM = location.pathname.startsWith('/dbm');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState('hub');
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);
  const [isDbmMenuOpen, setIsDbmMenuOpen] = useState(false);

  const dbmMenuRef = useRef(null);
  const dbmFileInputRef = useRef(null);

  const getRouteGuideTab = () => {
    const path = location.pathname;
    if (path.startsWith('/comms') || path.startsWith('/chat')) return 'comms';
    if (path.startsWith('/folio') || path.startsWith('/roster')) return 'folio';
    if (path.startsWith('/dbm')) return 'dbm';
    if (path.startsWith('/codex')) return 'codex';
    if (path.includes('/map-maker') || path.includes('/vtt') || path.startsWith('/vtt-ops') || path.includes('/spectator')) return 'maps';
    if (path.includes('/aime') || path.includes('/elements')) return 'aime';
    if (path.startsWith('/foundry') || path.startsWith('/story-foundry') || path.startsWith('/campaign-builder')) return 'story';
    return 'hub';
  };

  const handleOpenGuide = (tabOverride) => {
    AudioService.playTerminalBeep(1200, 0.03);
    setGuideInitialTab(tabOverride || getRouteGuideTab());
    setIsGuideOpen(true);
  };

  useEffect(() => {
    const handleCustomOpenGuide = (e) => {
      const targetTab = e?.detail?.tab || getRouteGuideTab();
      handleOpenGuide(targetTab);
    };
    window.addEventListener('open-user-guide', handleCustomOpenGuide);
    return () => window.removeEventListener('open-user-guide', handleCustomOpenGuide);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dbmMenuRef.current && !dbmMenuRef.current.contains(event.target)) {
        setIsDbmMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerMasterImport = () => {
    if (!isAdmin) {
      alert('Administrator or GM access required to import Master Database backups.');
      return;
    }
    if (dbmFileInputRef.current) {
      dbmFileInputRef.current.click();
    }
  };

  const handleClearDbmCache = () => {
    if (window.confirm('Are you sure you want to clear your local Omnicortex temporary cache and search filters?')) {
      localStorage.removeItem('tangent_dbm_cache');
      window.location.reload();
    }
  };

  const toggleAudio = () => {
    const newMuteState = AudioService.toggleMute();
    setIsAudioMuted(newMuteState);
    if (!newMuteState) {
      AudioService.playTerminalBeep(1000, 0.05);
    }
  };

  const getActivePageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/comms')) return 'COMMLINK RELAY';
    if (path.startsWith('/folio') || path.startsWith('/roster')) return 'PERSONA FOLIO';
    if (path.startsWith('/dbm')) return 'OMNICORTEX';
    if (path.startsWith('/codex')) return 'CODEX';
    if (path.includes('/story') || path.startsWith('/story-foundry')) return 'STORY WEAVER';
    if (path.includes('/elements')) return 'ELEMENT FORGE';
    if (path.includes('/map-maker')) return 'TACTICAL MAPS & VTT';
    if (path.includes('/aime')) return 'AIME CREATIVE ENGINE';
    if (path.includes('/vtt-options') || path.startsWith('/vtt-ops')) return 'VTT OPERATIONS';
    if (path.startsWith('/foundry') || path.startsWith('/campaign-builder')) return 'STORY FOUNDRY';
    return 'OPERATIONS HUB';
  };

  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'OPERATOR');

  return (
    <>
      <header className="w-full bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 z-50 select-none shrink-0 font-sans shadow-md">
        {/* Left Section: Logo & (on /dbm) Mobile Menu + Undo/Redo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {isDBM && (
            <button
              type="button"
              id="dbm-mobile-menu-btn"
              onClick={() => setIsSidebarOpen && setIsSidebarOpen(prev => !prev)}
              className="md:hidden p-1.5 bg-slate-900 border border-cyan-900/60 rounded text-cyan-400 text-sm font-bold shrink-0"
              title="Toggle Navigation Menu"
            >
              &#9776;
            </button>
          )}

          <NavLink 
            to="/" 
            className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse select-none items-start hover:opacity-90 transition-opacity shrink-0"
            title="Return to Operations Hub"
          >
            <span className="text-[1.65rem] sm:text-[2.25rem] font-bold leading-none">TANGENT</span>
            <span className="text-[0.75rem] sm:text-[1rem] lg:text-[1.125rem] leading-none whitespace-nowrap">SCIENCE FANTASY ROLEPLAY</span>
          </NavLink>

          {/* DBM Undo / Redo navigation controls */}
          {isDBM && handleBack && handleForward && (
            <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-md border border-[#0D5C63]/40 ml-1 sm:ml-2 shrink-0">
              <button
                type="button"
                onClick={handleBack}
                disabled={!historyIndex || historyIndex === 0}
                className="p-1 px-2 sm:px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs font-bold text-slate-300 transition-colors"
                title="Back"
              >
                ◄
              </button>
              <button
                type="button"
                onClick={handleForward}
                disabled={!history || historyIndex >= history.length - 1}
                className="p-1 px-2 sm:px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs font-bold text-slate-300 transition-colors"
                title="Forward"
              >
                ►
              </button>
            </div>
          )}
        </div>

        {/* Center Section: Centered Active Page Title */}
        <div className="hidden lg:flex items-center justify-center uppercase text-[#22d3ee] tangent-title-pulse select-none text-center">
          <span className="text-[1.35rem] sm:text-[1.5rem] lg:text-[1.65rem] font-bold leading-none tracking-wide whitespace-nowrap">
            {getActivePageTitle()}
          </span>
        </div>

        {/* Right Section: Omnicortex Controls + Comms, Dice, Audio, User Account */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          {/* Omnicortex-specific Title Bar Controls */}
          {isDBM && (
            <div className="flex items-center gap-1.5 sm:gap-2 pr-1.5 sm:pr-2 border-r border-slate-800 shrink-0">
              {/* Role Indicator Flag / Architect Dev Fields Trigger */}
              {currentUser && (
                isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setIsArchitectModalOpen && setIsArchitectModalOpen(true)}
                    className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold border uppercase tracking-wider bg-gradient-to-r from-amber-950/90 to-amber-900/80 hover:from-amber-900 hover:to-amber-800 border-amber-500/70 hover:border-amber-400 text-amber-300 hover:text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-all cursor-pointer group active:scale-95 shrink-0"
                    title="Manage Development & Reference Fields (Dev Mode)"
                  >
                    <span className="group-hover:scale-110 transition-transform">🛡️</span>
                    <span className="hidden md:inline">{userRole || 'ARCHITECT'}</span>
                    <span className="text-[9px] bg-amber-950/90 text-amber-200 px-1.5 py-0.2 rounded border border-amber-500/40 font-mono">
                      FIELDS
                    </span>
                  </button>
                ) : (
                  <div 
                    className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold border uppercase tracking-wide bg-slate-800/80 border-slate-600 text-slate-400 shrink-0"
                    title="Read-only access mode"
                  >
                    <span>👁️</span>
                    <span className="hidden md:inline">{userRole || 'OPERATOR'}</span>
                  </div>
                )
              )}

              {/* Bastion AI Top Bar Access */}
              <button
                type="button"
                onClick={() => setIsBastionOpen && setIsBastionOpen(prev => !prev)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isBastionOpen
                    ? 'bg-cyan-900/90 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                    : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                }`}
                title="Toggle BASTION AI (Rules assistant & entry generator)"
              >
                <span>🤖</span>
                <span className="hidden sm:inline">BASTION</span>
              </button>

              {/* System Actions Dropdown Menu */}
              <div className="relative shrink-0" ref={dbmMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsDbmMenuOpen(prev => !prev)}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#161b22] hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 shadow-sm"
                  title="System Tools & Actions Menu"
                >
                  <span>⚙️</span>
                  <span className="hidden md:inline">System Tools</span>
                  <span className="text-[10px] text-cyan-400">▼</span>
                </button>

                {isDbmMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#161b22] border border-cyan-500/40 rounded-lg shadow-2xl p-2 z-50 flex flex-col gap-1.5 backdrop-blur-md">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-0.5">
                      System Options
                    </div>

                    {/* User Guide */}
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenGuide('dbm');
                        setIsDbmMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                      title="User Guide & System Documentation"
                    >
                      <span>📖</span>
                      <span>User Guide</span>
                    </button>

                    {/* Dev Mode / Admin Override Toggle */}
                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          toggleAdminOverride && toggleAdminOverride();
                          setIsDbmMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-cyan-300 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between"
                        title="Toggle Local Admin / Architect Override"
                      >
                        <div className="flex items-center gap-2">
                          <span>⚡</span>
                          <span>Admin Override</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${adminOverride ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'}`}>
                          {adminOverride ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    )}

                    {/* Clear Local Cache */}
                    <button
                      type="button"
                      onClick={() => {
                        handleClearDbmCache();
                        setIsDbmMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                      title="Clear local search filter and Omnicortex cache"
                    >
                      <span>🧹</span>
                      <span>Clear Cache</span>
                    </button>

                    <div className="border-t border-slate-800 my-1"></div>

                    {/* Master Export */}
                    <button
                      type="button"
                      onClick={() => {
                        handleExportMasterJSON && handleExportMasterJSON();
                        setIsDbmMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                      title="Download full Omnicortex Master Database Backup JSON"
                    >
                      <span>💾</span>
                      <span>Master Export</span>
                    </button>

                    {/* Master Import */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerMasterImport();
                        setIsDbmMenuOpen(false);
                      }}
                      disabled={!isAdmin}
                      className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 ${
                        isAdmin
                          ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300'
                          : 'bg-slate-800/30 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                      title={isAdmin ? "Import Master Database Backup" : "Requires GM/Admin access to import data"}
                    >
                      <span>📂</span>
                      <span>Master Import</span>
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  ref={dbmFileInputRef}
                  onChange={handleImportMasterJSON}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* CommLink Comms Dock Toggle */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              if (onToggleCommsDock) {
                onToggleCommsDock();
              } else {
                toggleCommsDock();
              }
            }}
            className={`p-2 rounded-lg border transition-all relative ${
              isCommsDockOpen 
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]' 
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Toggle CommLink Comms (Alt+C)"
          >
            <MessageSquare size={17} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-black text-[9px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
                {totalUnreadCount}
              </span>
            )}
          </button>

          {/* Quick Guide Manual Button */}
          <button
            type="button"
            onClick={() => handleOpenGuide()}
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white transition-all shadow-sm"
            title="Open Comprehensive User Guide & System Manual"
          >
            <BookOpen size={17} />
          </button>

          {/* Quick Dice Roller Toggle */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              if (onToggleDiceDock) {
                onToggleDiceDock();
              } else {
                window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
              }
            }}
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Toggle Dice Roller Tray (Alt+D)"
          >
            <Dices size={17} />
          </button>

          {/* Audio Immersion Switch */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`p-2 rounded-lg border transition-all ${
              !isAudioMuted 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={isAudioMuted ? 'Unmute Sci-Fi Audio FX' : 'Mute Sci-Fi Audio FX'}
          >
            {isAudioMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* User Account Menu */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors shadow-sm"
                title="Account & System Settings"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="max-w-[120px] truncate text-cyan-300 font-bold">{displayIdentity}</span>
                <Settings size={14} className="text-slate-400 ml-0.5" />
              </button>

              <button
                type="button"
                onClick={() => confirmLogout(navigate)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-1.5 font-mono"
            >
              <Key size={13} /> Login
            </button>
          )}
        </div>
      </header>

      {/* Global Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Comprehensive System User Guide Modal */}
      <ComprehensiveUserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialTab={guideInitialTab}
      />
    </>
  );
};

export default GlobalHUD;
