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
  HelpCircle,
  Users,
  Database,
  Layers,
  ChevronDown,
  Tv2,
  Sparkles,
  Hammer,
  MapPin,
  Flame,
  Hash
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useDBM } from '../../context/DBMContext';
import { useFolio } from '../../context/FolioContext';
import { AudioService } from '../../services/audioService';
import { UserSettingsModal } from '../UserSettingsModal';
import { ComprehensiveUserGuideModal } from '../UI/ComprehensiveUserGuideModal';

export const GlobalHUD = ({ onOpenCommandPalette, onToggleDiceDock, isDiceDockOpen, onToggleCommsDock, isCommsDockOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userHandle, loginWithGoogle, confirmLogout, isAdmin, userRole, adminOverride, toggleAdminOverride } = useAuth();
  const { totalUnreadCount, toggleCommsDock } = useChat();
  const dbm = useDBM() || {};
  const folio = useFolio() || {};
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

  const {
    characterData,
    computeSpentCP,
    cloudSaveStatus,
    lastSavedTime,
    handleSaveLocal,
    handleExportAsStoryElement
  } = folio;

  const isDBM = location.pathname.startsWith('/dbm');
  const isCodex = location.pathname.startsWith('/codex');
  const isFolio = location.pathname.startsWith('/folio') || location.pathname.startsWith('/roster');
  const isFoundry = location.pathname.startsWith('/foundry') || location.pathname.startsWith('/story-foundry') || location.pathname.startsWith('/vtt-ops') || location.pathname.startsWith('/campaign-builder') || location.pathname.startsWith('/spectator');
  const isComms = location.pathname.startsWith('/comms') || location.pathname.startsWith('/chat');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState('hub');
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);
  const [isDbmMenuOpen, setIsDbmMenuOpen] = useState(false);
  const [isFolioMenuOpen, setIsFolioMenuOpen] = useState(false);
  const [isFoundryMenuOpen, setIsFoundryMenuOpen] = useState(false);
  const [isCommsMenuOpen, setIsCommsMenuOpen] = useState(false);

  const dbmMenuRef = useRef(null);
  const dbmFileInputRef = useRef(null);
  const folioMenuRef = useRef(null);
  const foundryMenuRef = useRef(null);
  const commsMenuRef = useRef(null);

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
      if (folioMenuRef.current && !folioMenuRef.current.contains(event.target)) {
        setIsFolioMenuOpen(false);
      }
      if (foundryMenuRef.current && !foundryMenuRef.current.contains(event.target)) {
        setIsFoundryMenuOpen(false);
      }
      if (commsMenuRef.current && !commsMenuRef.current.contains(event.target)) {
        setIsCommsMenuOpen(false);
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
    if (path === '/' || path === '/dashboard') return null; // Dashboard - no user-facing label needed
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
    return null;
  };

  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'OPERATOR');

  return (
    <>
      <header className="w-full bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800 px-2.5 sm:px-5 py-1.5 sm:py-2 flex items-center justify-between gap-3 z-[100] select-none shrink-0 font-sans shadow-md relative">
        {/* Left Section: Logo & Mobile menu */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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
            className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse select-none items-start hover:opacity-90 transition-opacity shrink-0 mr-1 sm:mr-2"
            title="Return to Operations Hub"
            onClick={() => AudioService.playTerminalBeep(1100, 0.03)}
          >
            <span className="text-[1.45rem] sm:text-[1.95rem] font-bold leading-none">TANGENT</span>
            <span className="text-[0.65rem] sm:text-[0.8rem] lg:text-[0.9rem] leading-none whitespace-nowrap">SCIENCE FANTASY ROLEPLAY</span>
          </NavLink>

          {/* DBM Undo / Redo navigation controls */}
          {isDBM && handleBack && handleForward && (
            <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-md border border-[#0D5C63]/40 ml-1 shrink-0">
              <button
                type="button"
                onClick={handleBack}
                disabled={!historyIndex || historyIndex === 0}
                className="p-1 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs font-bold text-slate-300 transition-colors"
                title="Back"
              >
                ◄
              </button>
              <button
                type="button"
                onClick={handleForward}
                disabled={!history || historyIndex >= history.length - 1}
                className="p-1 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs font-bold text-slate-300 transition-colors"
                title="Forward"
              >
                ►
              </button>
            </div>
          )}
        </div>

        {/* Center Section: Persistent Global Project Navigation Suite (Centered in Title Bar) */}
        <nav className="flex items-center justify-center gap-1.5 sm:gap-2.5 shrink-0 mx-auto">
          {/* 1. FOLIO Button */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.03);
              navigate('/folio');
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer select-none ${
              isFolio
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                : 'bg-slate-950/50 hover:bg-slate-900/90 border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 hover:shadow-[0_0_16px_rgba(34,211,238,0.25)]'
            }`}
            title="Open Persona Folio Character Sheet & Roster (/folio)"
          >
            <div className={`p-1 rounded-lg border shrink-0 ${isFolio ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
              <Users size={16} />
            </div>
            <span>FOLIO</span>
            {isFolio && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse hidden sm:inline-block shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
          </button>

          {/* 2. OMNICORTEX Button */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.03);
              navigate('/dbm');
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer select-none ${
              isDBM || isCodex
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                : 'bg-slate-950/50 hover:bg-slate-900/90 border-slate-700/80 hover:border-emerald-400 text-slate-200 hover:text-emerald-300 hover:shadow-[0_0_16px_rgba(52,211,153,0.25)]'
            }`}
            title="Open Omnicortex Database Master Rules (/dbm)"
          >
            <div className={`p-1 rounded-lg border shrink-0 ${isDBM || isCodex ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              <Database size={16} />
            </div>
            <span className="hidden xs:inline">OMNICORTEX</span>
            <span className="xs:hidden">OMNI</span>
            {(isDBM || isCodex) && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
          </button>

          {/* 3. STORY FOUNDRY Dropdown Button */}
          <div className="relative shrink-0" ref={foundryMenuRef}>
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.03);
                setIsFoundryMenuOpen(prev => !prev);
                setIsCommsMenuOpen(false);
                setIsDbmMenuOpen(false);
                setIsFolioMenuOpen(false);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer select-none ${
                isFoundry
                  ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-950/50 hover:bg-slate-900/90 border-slate-700/80 hover:border-purple-400 text-slate-200 hover:text-purple-300 hover:shadow-[0_0_16px_rgba(168,85,247,0.25)]'
              }`}
              title="Story Foundry VTT, Scenarios, Elements & AIME Studio Menu"
            >
              <div className={`p-1 rounded-lg border shrink-0 ${isFoundry ? 'bg-purple-500/25 border-purple-400/60 text-purple-300' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'}`}>
                <Layers size={16} />
              </div>
              <span>FOUNDRY</span>
              <ChevronDown size={14} className={`text-purple-400 transition-transform duration-200 ${isFoundryMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFoundryMenuOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-[#0e131f]/98 border border-purple-500/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(168,85,247,0.25)] p-2 z-[110] flex flex-col gap-1 backdrop-blur-2xl animate-fadeIn"
                onClick={() => setIsFoundryMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest border-b border-slate-800/90 flex items-center justify-between">
                  <span>Story Foundry Operations</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    navigate('/foundry');
                  }}
                  className="w-full text-left p-2.5 hover:bg-purple-950/60 rounded-xl text-xs font-mono text-slate-200 hover:text-purple-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 group-hover:bg-purple-500/25 transition-colors">
                      <Layers size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-purple-200">Foundry Hub</div>
                      <div className="text-[9.5px] text-slate-400">Overview & Module Launcher</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    navigate('/foundry/map-maker');
                  }}
                  className="w-full text-left p-2.5 hover:bg-purple-950/60 rounded-xl text-xs font-mono text-slate-200 hover:text-purple-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 group-hover:bg-purple-500/25 transition-colors">
                      <Tv2 size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-purple-200">Tactical Maps & VTT</div>
                      <div className="text-[9.5px] text-purple-400/90 font-mono">Battle Grid, Tokens & Fog</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    navigate('/foundry/vtt-options');
                  }}
                  className="w-full text-left p-2.5 hover:bg-purple-950/60 rounded-xl text-xs font-mono text-slate-200 hover:text-purple-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 group-hover:bg-purple-500/25 transition-colors">
                      <Compass size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-purple-200">VTT Operations</div>
                      <div className="text-[9.5px] text-slate-400">Scene Manager & Spectator</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    navigate('/foundry/story');
                  }}
                  className="w-full text-left p-2.5 hover:bg-purple-950/60 rounded-xl text-xs font-mono text-slate-200 hover:text-purple-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 group-hover:bg-purple-500/25 transition-colors">
                      <BookOpen size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-purple-200">Story Weaver</div>
                      <div className="text-[9.5px] text-slate-400">Campaign Arc & Scenarios</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    navigate('/foundry/elements');
                  }}
                  className="w-full text-left p-2.5 hover:bg-purple-950/60 rounded-xl text-xs font-mono text-slate-200 hover:text-purple-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 group-hover:bg-purple-500/25 transition-colors">
                      <Hammer size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-purple-200">Element Forge</div>
                      <div className="text-[9.5px] text-slate-400">Custom Gear & Blueprints</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    navigate('/foundry/aime');
                  }}
                  className="w-full text-left p-2.5 hover:bg-purple-950/60 rounded-xl text-xs font-mono text-slate-200 hover:text-purple-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 group-hover:bg-purple-500/25 transition-colors">
                      <Sparkles size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-purple-200">AIME Studio</div>
                      <div className="text-[9.5px] text-purple-400/90 font-mono">AI Creative Engine</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 4. COMMS Dropdown Button */}
          <div className="relative shrink-0" ref={commsMenuRef}>
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.03);
                setIsCommsMenuOpen(prev => !prev);
                setIsFoundryMenuOpen(false);
                setIsDbmMenuOpen(false);
                setIsFolioMenuOpen(false);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer select-none relative ${
                isComms
                  ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-950/50 hover:bg-slate-900/90 border-slate-700/80 hover:border-amber-400 text-slate-200 hover:text-amber-300 hover:shadow-[0_0_16px_rgba(245,158,11,0.25)]'
              }`}
              title="CommLink Relay, Floating Comms Dock & Dice Roller Menu"
            >
              <div className={`p-1 rounded-lg border shrink-0 ${isComms ? 'bg-amber-500/25 border-amber-400/60 text-amber-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                <Radio size={16} />
              </div>
              <span>COMMS</span>
              {totalUnreadCount > 0 && (
                <span className="w-4 h-4 bg-amber-500 text-black text-[9px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalUnreadCount}
                </span>
              )}
              <ChevronDown size={14} className={`text-amber-400 transition-transform duration-200 ${isCommsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCommsMenuOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-[#0e131f]/98 border border-amber-500/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.25)] p-2 z-[110] flex flex-col gap-1 backdrop-blur-2xl animate-fadeIn"
                onClick={() => setIsCommsMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest border-b border-slate-800/90 flex items-center justify-between">
                  <span>CommLink Operations</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    navigate('/comms');
                  }}
                  className="w-full text-left p-2.5 hover:bg-amber-950/60 rounded-xl text-xs font-mono text-slate-200 hover:text-amber-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 group-hover:bg-amber-500/25 transition-colors">
                      <MessageSquare size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-amber-200">CommLink Relay Matrix</div>
                      <div className="text-[9.5px] text-amber-400/90 font-mono">Full Channels & Broadcast</div>
                    </div>
                  </div>
                </button>

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
                  className="w-full text-left p-2.5 hover:bg-amber-950/60 rounded-xl text-xs font-mono text-slate-200 hover:text-amber-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 group-hover:bg-amber-500/25 transition-colors">
                      <Radio size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-amber-200">Floating CommLink Tray</div>
                      <div className="text-[9.5px] text-slate-400">Alt+C Dock Overlay</div>
                    </div>
                  </div>
                </button>

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
                  className="w-full text-left p-2.5 hover:bg-amber-950/60 rounded-xl text-xs font-mono text-slate-200 hover:text-amber-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 group-hover:bg-amber-500/25 transition-colors">
                      <Dices size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-amber-200">Quick Dice Roller Tray</div>
                      <div className="text-[9.5px] text-slate-400">Alt+D Dock Overlay</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Omnicortex/Folio/Codex Controls + User Account */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          {/* Persona Folio Title Bar Controls */}
          {isFolio && (
            <div className="flex items-center gap-1.5 sm:gap-2 pr-1.5 sm:pr-2 border-r border-slate-800 shrink-0">
              {/* Real-time CP Budget Bar */}
              {(() => {
                const startingCP = parseInt(characterData?.['starting-cp'] || 150, 10);
                const spentCP = computeSpentCP ? computeSpentCP() : 0;
                const remainingCP = startingCP - spentCP;
                const percent = Math.min(100, Math.max(0, (spentCP / startingCP) * 100));
                const isOver = spentCP > startingCP;

                return (
                  <div
                    onClick={() => window.dispatchEvent(new CustomEvent('open-folio-economy'))}
                    className={`cursor-pointer bg-slate-950 border rounded-lg px-2.5 py-1 flex flex-col min-w-[145px] sm:min-w-[160px] hover:border-cyan-400 transition-all ${
                      isOver
                        ? 'border-red-500 ring-2 ring-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                        : 'border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                    }`}
                    title="Click to view detailed CP Economy & Point Pools breakdown"
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase font-mono">
                      <span className="text-slate-400">CP BUDGET:</span>
                      <span className={isOver ? 'text-red-400 font-bold' : 'text-amber-400'}>
                        {spentCP} / {startingCP} CP
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                      <div
                        className={`h-full transition-all duration-300 ${isOver ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-amber-400'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className={`text-[8px] text-right font-mono font-bold mt-0.5 ${isOver ? 'text-red-400' : 'text-slate-400'}`}>
                      {isOver ? `OVER BUDGET (-${Math.abs(remainingCP)} CP)` : `${remainingCP} CP REMAINING`}
                    </span>
                  </div>
                );
              })()}

              {/* Bastion AI Top Bar Access */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-folio-bastion'))}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)] shrink-0"
                title="Toggle BASTION AI (Rules assistant & character generator)"
              >
                <span>🤖</span>
                <span className="hidden sm:inline">BASTION</span>
              </button>

              {/* Folio File Menu Dropdown */}
              <div className="relative shrink-0" ref={folioMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsFolioMenuOpen(prev => !prev)}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#161b22] hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 shadow-sm"
                  title="Folio System Tools & File Actions Menu"
                >
                  <span>File Menu</span>
                  <span className="text-[10px] text-cyan-400">▼</span>
                </button>

                {isFolioMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-[#161b22] border border-cyan-500/50 rounded-lg shadow-2xl p-1.5 z-50 text-xs flex flex-col gap-1 backdrop-blur-md"
                    onClick={() => setIsFolioMenuOpen(false)}
                  >
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-roster'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-amber-300 uppercase font-bold rounded"
                    >
                      Character Roster
                    </button>
                    <button
                      onClick={() => handleOpenGuide('folio')}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-slate-200 uppercase font-bold rounded"
                    >
                      User Guide & Manual
                    </button>
                    <div className="border-t border-slate-800 my-0.5" />
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-new-character'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-slate-200 uppercase font-bold rounded"
                    >
                      New Character (Manual)
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-guided-creator'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-cyan-300 uppercase font-bold rounded"
                    >
                      New Character (Guided)
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-delete-character'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-950/80 text-red-400 uppercase font-bold rounded"
                    >
                      Delete Character
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-clear-character'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-400 uppercase font-bold rounded"
                    >
                      Clear Sheet Data
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-preview'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-slate-200 uppercase font-bold rounded"
                    >
                      Preview Sheet
                    </button>
                    <div className="border-t border-slate-800 my-0.5" />
                    <button
                      onClick={handleSaveLocal}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-amber-300 uppercase font-bold rounded"
                    >
                      Save to File (.json)
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('trigger-folio-load-local'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-amber-300 uppercase font-bold rounded"
                    >
                      Load File / Story Element
                    </button>
                    <button
                      onClick={handleExportAsStoryElement}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-cyan-300 uppercase font-bold rounded flex items-center justify-between"
                    >
                      <span>Export Story Element</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Foundry</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Omnicortex-specific Title Bar Controls */}
          {isDBM && (
            <div className="flex items-center gap-1.5 sm:gap-2 pr-1.5 sm:pr-2 border-r border-slate-800 shrink-0">
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

                    {/* Switch to Rules Codex */}
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1100, 0.03);
                        setIsDbmMenuOpen(false);
                        navigate('/codex');
                      }}
                      className="w-full text-left px-3 py-2 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between"
                      title="Switch from Omnicortex DB to Rules Codex Matrices"
                    >
                      <div className="flex items-center gap-2">
                        <span>📖</span>
                        <span>Rules Codex</span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-mono">Codex</span>
                    </button>

                    {/* Bastion AI Assistant Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsBastionOpen && setIsBastionOpen(prev => !prev);
                        setIsDbmMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between"
                      title="Toggle BASTION AI (Rules assistant & entry generator)"
                    >
                      <div className="flex items-center gap-2">
                        <span>🤖</span>
                        <span>Bastion AI</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isBastionOpen ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'}`}>
                        {isBastionOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                    </button>

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

          {/* Codex-specific Title Bar Controls */}
          {isCodex && (
            <div className="flex items-center gap-1.5 sm:gap-2 pr-1.5 sm:pr-2 border-r border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.03);
                  navigate('/dbm');
                }}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Switch from Rules Codex to Omnicortex Database"
              >
                <span>🌐</span>
                <span className="hidden sm:inline">Omnicortex DB</span>
              </button>
            </div>
          )}

          {/* User Account Menu with Functional Cloud Sync Status */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1.5">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors shadow-sm cursor-pointer group"
                title={
                  cloudSaveStatus === 'saving'
                    ? 'Cloud Sync: Saving to Cloud...'
                    : cloudSaveStatus === 'saved'
                    ? lastSavedTime ? `Cloud Synced at ${lastSavedTime.toLocaleTimeString()}` : 'Cloud Synced'
                    : cloudSaveStatus === 'error'
                    ? 'Cloud Sync Failed (Click to open Settings)'
                    : 'Local Storage Mode (Click to open Settings)'
                }
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    cloudSaveStatus === 'saving'
                      ? 'bg-amber-400 animate-ping'
                      : cloudSaveStatus === 'saved'
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                      : cloudSaveStatus === 'error'
                      ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse'
                      : 'bg-slate-500'
                  }`}
                />
                <span className="max-w-[120px] truncate text-cyan-300 font-bold group-hover:text-cyan-200">{displayIdentity}</span>
                <Settings size={14} className="text-slate-400 ml-0.5 group-hover:text-slate-200" />
              </button>

              <button
                type="button"
                onClick={() => confirmLogout(navigate)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
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
