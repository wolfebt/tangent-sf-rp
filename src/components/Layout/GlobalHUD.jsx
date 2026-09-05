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
  Hash,
  Menu,
  X,
  Command,
  Save,
  Lock,
  Unlock,
  Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useDBM } from '../../context/DBMContext';
import { useFolio } from '../../context/FolioContext';
import { AudioService } from '../../services/audioService';
import { UserSettingsModal } from '../UserSettingsModal';
import { ComprehensiveUserGuideModal } from '../UI/ComprehensiveUserGuideModal';
import { GameGroupModal } from '../Groups/GameGroupModal';

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
    navigateToCategory,
    activeCategory,
    syncCanonicalCompendium,
    syncCanonicalSpecies,
    syncMasterSpeciesMatrix
  } = dbm;

  const {
    characterData,
    computeSpentCP,
    cloudSaveStatus,
    lastSavedTime,
    saveCurrentToRoster,
    handleSaveLocal,
    handleExportAsStoryElement,
    isLocked,
    isPlayerOverride,
    allowPlayerOverride,
    lockPersona,
    unlockPersona,
    clonePersonaVariant,
    isInActiveGame
  } = folio;

  const isDBM = location.pathname.startsWith('/dbm');
  const isCompendium = location.pathname.startsWith('/compendium');
  const isCodex = location.pathname.startsWith('/codex');
  const isFolio = location.pathname.startsWith('/folio') || location.pathname.startsWith('/roster');
  const isFoundry = location.pathname.startsWith('/foundry') || location.pathname.startsWith('/story-foundry') || location.pathname.startsWith('/vtt-ops') || location.pathname.startsWith('/campaign-builder') || location.pathname.startsWith('/spectator') || location.pathname.startsWith('/stage') || location.pathname === '/vtt';
  const isComms = location.pathname.startsWith('/comms') || location.pathname.startsWith('/chat');
  const isStage = location.pathname.startsWith('/stage') || location.pathname === '/vtt';
  
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState('hub');
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);
  const [isDbmMenuOpen, setIsDbmMenuOpen] = useState(false);
  const [isFolioMenuOpen, setIsFolioMenuOpen] = useState(false);
  const [isFoundryMenuOpen, setIsFoundryMenuOpen] = useState(false);
  const [isCommsMenuOpen, setIsCommsMenuOpen] = useState(false);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);

  // Global custom event listeners for Team Management
  useEffect(() => {
    const handleOpenTeamModal = () => setIsSquadModalOpen(true);
    window.addEventListener('open-team-management', handleOpenTeamModal);
    window.addEventListener('open-squad-modal', handleOpenTeamModal);
    return () => {
      window.removeEventListener('open-team-management', handleOpenTeamModal);
      window.removeEventListener('open-squad-modal', handleOpenTeamModal);
    };
  }, []);

  // Close mobile nav drawer when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

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
    if (path.startsWith('/stage') || path === '/vtt') return 'THE STAGE VTT';
    if (path.includes('/map-maker')) return 'TACTICAL MAPS & VTT';
    if (path.includes('/aime')) return 'AIME CREATIVE ENGINE';
    if (path.includes('/vtt-options') || path.startsWith('/vtt-ops')) return 'VTT OPERATIONS';
    if (path.startsWith('/foundry') || path.startsWith('/campaign-builder')) return 'STORY FOUNDRY';
    return null;
  };

  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'OPERATOR');

  return (
    <>
      <header className="w-full bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 z-[100] select-none shrink-0 font-sans shadow-md relative">
        {/* Left Section: Brand Logo & Primary Navigation Group */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <NavLink 
            to="/" 
            className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse select-none items-start hover:opacity-90 transition-opacity shrink-0 mr-1 sm:mr-2"
            title="Return to Operations Hub"
            onClick={() => AudioService.playTerminalBeep(1100, 0.03)}
          >
            <span className="text-[1.15rem] sm:text-[1.55rem] font-bold leading-none">TANGENT</span>
            <span className="text-[0.55rem] sm:text-[0.7rem] leading-none whitespace-nowrap text-cyan-400/80 mt-0.5">Science-Fantasy</span>
            <span className="text-[0.55rem] sm:text-[0.7rem] leading-none whitespace-nowrap text-cyan-400/80 mt-0.5">Role Playing Engine</span>
          </NavLink>

          {/* Primary Navigation Suite (Positioned on the Left, Sleek & Narrow with Full Labels) */}
          <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-nowrap">
            {/* 1. FOLIO Button */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1150, 0.03);
                navigate('/folio');
              }}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.2 rounded-md sm:rounded-lg border text-[10px] sm:text-[11.5px] font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap cyan-shadow-thin ${
                isFolio
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                  : 'bg-slate-950/60 hover:bg-slate-900/90 border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300'
              }`}
              title="Open Persona Folio Operative Catalog & Sheet (/folio)"
            >
              <div className={`p-0.5 rounded border shrink-0 ${isFolio ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
                <Users size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
              <span>FOLIO</span>
              {isFolio && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block shadow-[0_0_6px_rgba(34,211,238,0.8)]" />}
            </button>

            {/* 2. COMPENDIUM Button (Separated Wiki Window) */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1150, 0.03);
                navigate('/compendium');
              }}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.2 rounded-md sm:rounded-lg border text-[10px] sm:text-[11.5px] font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap cyan-shadow-thin ${
                isCompendium
                  ? 'bg-sky-950/70 border-sky-400 text-sky-200'
                  : 'bg-slate-950/60 hover:bg-slate-900/90 border-slate-700/80 hover:border-sky-400 text-slate-200 hover:text-sky-300'
              }`}
              title="Open Compendium Lore & Rules Wiki (/compendium)"
            >
              <div className={`p-0.5 rounded border shrink-0 ${isCompendium ? 'bg-sky-500/25 border-sky-400/60 text-sky-300' : 'bg-sky-500/10 border-sky-500/30 text-sky-400'}`}>
                <BookOpen size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
              <span>COMPENDIUM</span>
              {isCompendium && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse inline-block shadow-[0_0_6px_rgba(56,189,248,0.8)]" />}
            </button>

            {/* 3. OMNICORTEX Button */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1150, 0.03);
                navigate('/dbm');
              }}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.2 rounded-md sm:rounded-lg border text-[10px] sm:text-[11.5px] font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap cyan-shadow-thin ${
                isDBM || isCodex
                  ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200'
                  : 'bg-slate-950/60 hover:bg-slate-900/90 border-slate-700/80 hover:border-emerald-400 text-slate-200 hover:text-emerald-300'
              }`}
              title="Open Omnicortex Master Database (/dbm)"
            >
              <div className={`p-0.5 rounded border shrink-0 ${isDBM || isCodex ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                <Database size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
              <span>OMNICORTEX</span>
              {(isDBM || isCodex) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block shadow-[0_0_6px_rgba(52,211,153,0.8)]" />}
            </button>

            {/* 4. FOUNDRY Button (Opens to Catalog/Dashboard) */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1150, 0.03);
                navigate('/foundry');
              }}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.2 rounded-md sm:rounded-lg border text-[10px] sm:text-[11.5px] font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap cyan-shadow-thin ${
                isFoundry
                  ? 'bg-purple-950/70 border-purple-400 text-purple-200'
                  : 'bg-slate-950/60 hover:bg-slate-900/90 border-slate-700/80 hover:border-purple-400 text-slate-200 hover:text-purple-300'
              }`}
              title="Open Story Foundry Catalog & VTT Dashboard (/foundry)"
            >
              <div className={`p-0.5 rounded border shrink-0 ${isFoundry ? 'bg-purple-500/25 border-purple-400/60 text-purple-300' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'}`}>
                <Layers size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
              <span>FOUNDRY</span>
              {isFoundry && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block shadow-[0_0_6px_rgba(168,85,247,0.8)]" />}
            </button>

            {/* 5. COMMS Button */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1150, 0.03);
                if (onToggleCommsDock) {
                  onToggleCommsDock();
                } else {
                  navigate('/comms');
                }
              }}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.2 rounded-md sm:rounded-lg border text-[10px] sm:text-[11.5px] font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none relative whitespace-nowrap cyan-shadow-thin ${
                isComms || isCommsDockOpen
                  ? 'bg-amber-950/70 border-amber-400 text-amber-200'
                  : 'bg-slate-950/60 hover:bg-slate-900/90 border-slate-700/80 hover:border-amber-400 text-slate-200 hover:text-amber-300'
              }`}
              title="Open CommLink Relay Matrix Modal (Alt+C)"
            >
              <div className={`p-0.5 rounded border shrink-0 ${isComms || isCommsDockOpen ? 'bg-amber-500/25 border-amber-400/60 text-amber-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                <Radio size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
              <span>COMMS</span>
              {totalUnreadCount > 0 && (
                <span className="w-3.5 h-3.5 bg-amber-500 text-black text-[8.5px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalUnreadCount}
                </span>
              )}
              {(isComms || isCommsDockOpen) && totalUnreadCount === 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block shadow-[0_0_6px_rgba(245,158,11,0.8)]" />}
            </button>
          </nav>
        </div>

        {/* Center Section: Dynamic Contextual Header Options for Active Page */}
        <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 min-w-0 px-2 overflow-visible relative">
          {/* Dynamic Controls: PERSONA FOLIO */}
          {isFolio && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Real-time CP Budget Bar (Desktop) & Compact Badge (Mobile) */}
              {(() => {
                const startingCP = parseInt(characterData?.['starting-cp'] || 150, 10);
                const spentCP = computeSpentCP ? computeSpentCP() : 0;
                const remainingCP = startingCP - spentCP;
                const percent = Math.min(100, Math.max(0, (spentCP / startingCP) * 100));
                const isOver = spentCP > startingCP;

                return (
                  <>
                    {/* Desktop Bar */}
                    <div
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-economy'))}
                      className={`hidden lg:flex cursor-pointer bg-slate-950 border rounded-lg px-2.5 py-1 flex-col min-w-[130px] sm:min-w-[150px] hover:border-cyan-400 transition-all cyan-shadow-thin ${
                        isOver
                          ? 'border-red-500 ring-2 ring-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                          : 'border-cyan-500/50'
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
                    </div>

                    {/* Compact CP Badge */}
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-economy'))}
                      className={`lg:hidden flex items-center gap-1.5 px-2 py-1 bg-slate-950 border rounded-lg font-mono text-[10px] cursor-pointer shrink-0 cyan-shadow-thin ${
                        isOver
                          ? 'border-red-500 text-red-300 ring-1 ring-red-500/80 animate-pulse'
                          : 'border-cyan-500/40 text-cyan-300'
                      }`}
                      title="Click to inspect CP Economy"
                    >
                      <span className="text-slate-400 text-[9px]">CP:</span>
                      <span className={`font-bold ${isOver ? 'text-red-400' : 'text-amber-400'}`}>{spentCP}/{startingCP}</span>
                    </button>
                  </>
                );
              })()}

              {/* Operative Catalog Navigation Trigger */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1150, 0.03);
                  window.dispatchEvent(new CustomEvent('open-folio-catalog'));
                }}
                className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 cyan-shadow-thin shrink-0 max-w-[140px] sm:max-w-[200px]"
                title={characterData?.['char-name'] ? `Operative: ${characterData['char-name']} (Click to switch operative or open catalog)` : "Open Operative Catalog & Persona Roster"}
              >
                <Users size={13} className="text-cyan-400 shrink-0" />
                <span className="truncate">{characterData?.['char-name'] || 'Operative Catalog'}</span>
              </button>

              {/* Bastion AI Trigger */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-folio-bastion'))}
                className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 cyan-shadow-thin shrink-0"
                title="Toggle BASTION AI (Rules assistant & character generator)"
              >
                <span>🤖</span>
                <span className="hidden sm:inline">BASTION</span>
              </button>

              {/* Direct Save Folio Button */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  window.dispatchEvent(new CustomEvent('trigger-folio-save'));
                }}
                className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 cyan-shadow-thin shrink-0"
                title="Save current persona sheet to Operative Roster and Cloud Storage"
              >
                <Save size={13} className="text-emerald-400" />
                <span className="hidden sm:inline">
                  {cloudSaveStatus === 'saving' ? 'Saving...' : 'Save'}
                </span>
                {cloudSaveStatus === 'saved' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                )}
              </button>

              {/* Folio File Menu Dropdown */}
              <div className="relative shrink-0" ref={folioMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsFolioMenuOpen(prev => !prev)}
                  className="px-2 sm:px-2.5 py-1 bg-[#161b22] hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cyan-shadow-thin"
                  title="Folio System Tools & File Actions Menu"
                >
                  <span className="hidden xs:inline">File Menu</span>
                  <span className="xs:hidden">Files</span>
                  <span className="text-[10px] text-cyan-400">▼</span>
                </button>

                {isFolioMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-[#161b22] border border-cyan-500/50 rounded-lg shadow-2xl p-1.5 z-50 text-xs flex flex-col gap-1 backdrop-blur-md"
                    onClick={() => setIsFolioMenuOpen(false)}
                  >
                    {/* Primary Folio Actions: Save, Lock/Unlock for VTT, Clone Variant */}
                    <button
                      onClick={() => {
                        AudioService.playTerminalBeep(1200, 0.03);
                        window.dispatchEvent(new CustomEvent('trigger-folio-save'));
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-emerald-950/80 text-emerald-300 uppercase font-bold rounded flex items-center justify-between"
                      title="Save current persona sheet to Operative Roster and Cloud Storage"
                    >
                      <span className="flex items-center gap-1.5">
                        <Save size={13} className="text-emerald-400" />
                        <span>Save Folio</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {cloudSaveStatus === 'saving' ? 'Saving...' : cloudSaveStatus === 'saved' ? 'Saved' : 'Ready'}
                      </span>
                    </button>

                    {!isLocked ? (
                      <button
                        onClick={() => {
                          AudioService.playTerminalBeep(1100, 0.03);
                          if (lockPersona) lockPersona();
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-cyan-300 uppercase font-bold rounded flex items-center gap-1.5"
                        title="Lock and set persona ready for VTT deployment"
                      >
                        <Lock size={13} className="text-cyan-400" />
                        <span>Lock &amp; Set for VTT</span>
                      </button>
                    ) : !isPlayerOverride ? (
                      !isInActiveGame ? (
                        <button
                          onClick={() => {
                            AudioService.playTerminalBeep(1100, 0.03);
                            if (unlockPersona) {
                              unlockPersona();
                            }
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-amber-950/80 text-amber-300 uppercase font-bold rounded flex items-center gap-1.5"
                          title="Unlock folio to return to Development Phase"
                        >
                          <Unlock size={13} className="text-amber-400" />
                          <span>Unlock Sheet (Edit Mode)</span>
                        </button>
                      ) : allowPlayerOverride ? (
                        <button
                          onClick={() => {
                            AudioService.playTerminalBeep(1100, 0.03);
                            const reason = prompt("Enter player reason/note for this sheet modification override during active VTT session (optional, logged for GM review):");
                            if (reason !== null && unlockPersona) {
                              unlockPersona(reason);
                            }
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-amber-950/80 text-amber-300 uppercase font-bold rounded flex items-center gap-1.5"
                          title="Unlock folio via player override to make changes during active VTT session"
                        >
                          <Unlock size={13} className="text-amber-400" />
                          <span>Player Override (Unlock)</span>
                        </button>
                      ) : (
                        <div
                          className="w-full text-left px-3 py-1.5 text-slate-500 uppercase font-bold rounded flex items-center gap-1.5 opacity-60 cursor-not-allowed"
                          title="Player Override is disabled by the GM for this session. Direct sheet modifications are locked."
                        >
                          <Lock size={13} className="text-slate-500" />
                          <span>Locked (Override Disallowed)</span>
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          AudioService.playTerminalBeep(1100, 0.03);
                          if (lockPersona) lockPersona();
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-cyan-200 uppercase font-bold rounded flex items-center gap-1.5"
                        title="Lock sheet again and return to Set/Locked status"
                      >
                        <Lock size={13} className="text-cyan-400" />
                        <span>Relock Sheet for VTT</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        AudioService.playTerminalBeep(1100, 0.03);
                        if (clonePersonaVariant) clonePersonaVariant();
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 uppercase font-bold rounded flex items-center gap-1.5"
                      title="Branch an unlocked development variant of this persona without modifying the set version"
                    >
                      <Copy size={13} className="text-cyan-400" />
                      <span>Clone Variant</span>
                    </button>

                    <div className="border-t border-slate-800 my-0.5" />
                    <button
                      onClick={() => handleOpenGuide('folio')}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-slate-200 uppercase font-bold rounded"
                    >
                      User Guide &amp; Manual
                    </button>
                    <div className="border-t border-slate-800 my-0.5" />
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-new-character'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-slate-200 uppercase font-bold rounded"
                    >
                      New Operative (Manual)
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-guided-creator'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-cyan-300 uppercase font-bold rounded"
                    >
                      New Operative (Guided)
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-folio-delete-character'))}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-950/80 text-red-400 uppercase font-bold rounded"
                    >
                      Delete Operative
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
                      Preview Dossier
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

          {/* Dynamic Controls: OMNICORTEX */}
          {isDBM && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* DBM Undo / Redo controls */}
              {handleBack && handleForward && (
                <div className="flex items-center gap-1 bg-[#161b22] p-0.5 rounded-md border border-[#0D5C63]/40 shrink-0 cyan-shadow-thin">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={!historyIndex || historyIndex === 0}
                    className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-[11px] font-bold text-slate-300 transition-colors"
                    title="Back"
                  >
                    ◄
                  </button>
                  <button
                    type="button"
                    onClick={handleForward}
                    disabled={!history || historyIndex >= history.length - 1}
                    className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-[11px] font-bold text-slate-300 transition-colors"
                    title="Forward"
                  >
                    ►
                  </button>
                </div>
              )}

              {/* Active Category Indicator */}
              <div className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 rounded-md text-[11px] font-mono text-emerald-300 font-bold uppercase hidden sm:block cyan-shadow-thin">
                {activeCategory ? activeCategory.toUpperCase() : 'DATABASE'}
              </div>

              {/* System Actions Dropdown Menu */}
              <div className="relative shrink-0" ref={dbmMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsDbmMenuOpen(prev => !prev)}
                  className="px-2 sm:px-2.5 py-1 bg-[#161b22] hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cyan-shadow-thin"
                  title="System Tools & Actions Menu"
                >
                  <span>⚙️</span>
                  <span className="hidden md:inline">Tools</span>
                  <span className="text-[10px] text-emerald-400">▼</span>
                </button>

                {isDbmMenuOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-[#161b22] border border-emerald-500/40 rounded-lg shadow-2xl p-2 z-50 flex flex-col gap-1.5 backdrop-blur-md">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-0.5">
                      Omnicortex Options
                    </div>

                    {/* Bastion AI Assistant Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsBastionOpen && setIsBastionOpen(prev => !prev);
                        setIsDbmMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between"
                      title="Toggle BASTION AI (Rules assistant & entry generator)"
                    >
                      <div className="flex items-center gap-2">
                        <span>🤖</span>
                        <span>Bastion AI</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isBastionOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
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

          {/* Dynamic Controls: COMPENDIUM */}
          {isCompendium && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-sky-500/40 text-[10px] font-mono cyan-shadow-thin">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    navigate('/compendium?tab=rules');
                  }}
                  className={`px-2 py-0.5 rounded font-bold uppercase transition-colors ${
                    !location.search.includes('tab=omnicortex') && !location.search.includes('tab=split')
                      ? 'bg-sky-950 text-sky-300 border border-sky-500/60'
                      : 'text-slate-400 hover:text-sky-300'
                  }`}
                  title="Switch to Game Rules"
                >
                  Rules
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    navigate('/compendium?tab=omnicortex');
                  }}
                  className={`px-2 py-0.5 rounded font-bold uppercase transition-colors flex items-center gap-1 ${
                    location.search.includes('tab=omnicortex')
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                      : 'text-slate-400 hover:text-emerald-300'
                  }`}
                  title="Switch to Omnicortex Asset Catalog"
                >
                  <span>🌐</span>
                  <span>Omnicortex</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    navigate('/compendium?tab=split');
                  }}
                  className={`hidden sm:inline-block px-2 py-0.5 rounded font-bold uppercase transition-colors ${
                    location.search.includes('tab=split')
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/60'
                      : 'text-slate-400 hover:text-purple-300'
                  }`}
                  title="Switch to Side-by-Side Split Reference"
                >
                  Split
                </button>
              </div>

              {/* User Guide */}
              <button
                type="button"
                onClick={() => handleOpenGuide('dbm')}
                className="px-2 sm:px-2.5 py-1 bg-[#161b22] hover:bg-slate-800 border border-sky-500/40 text-sky-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
                title="Compendium User Guide"
              >
                <span>📖</span>
                <span className="hidden sm:inline">Guide</span>
              </button>

              {/* Sync Compendium to Cloud (Admin) */}
              {isAdmin && syncCanonicalCompendium && (
                <button
                  type="button"
                  onClick={syncCanonicalCompendium}
                  className="px-2 sm:px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-400 text-sky-200 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
                  title="Sync Canonical Compendium to Cloud"
                >
                  <span>☁️</span>
                  <span className="hidden sm:inline">Sync Cloud</span>
                </button>
              )}
            </div>
          )}

          {/* Dynamic Controls: STORY FOUNDRY */}
          {isFoundry && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/foundry'); }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cyan-shadow-thin ${
                  location.pathname === '/foundry' ? 'bg-purple-600 text-white' : 'bg-slate-900/80 text-slate-300 hover:text-purple-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
                title="Foundry Catalog & Dashboard"
              >
                <span>📊</span>
                <span className="hidden sm:inline">Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/stage'); }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cyan-shadow-thin ${
                  isStage ? 'bg-amber-600 text-white' : 'bg-slate-900/80 text-amber-300 hover:text-amber-200 hover:bg-slate-800 border border-amber-500/40'
                }`}
                title="The Stage Tactical VTT"
              >
                <span>⚔️</span>
                <span className="hidden sm:inline">Stage VTT</span>
              </button>

              <button
                type="button"
                onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/foundry/story'); }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cyan-shadow-thin ${
                  location.pathname.includes('/story') ? 'bg-purple-600 text-white' : 'bg-slate-900/80 text-slate-300 hover:text-purple-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
                title="Story Weaver Arc & Scenarios"
              >
                <span>📖</span>
                <span className="hidden md:inline">Stories</span>
              </button>

              <button
                type="button"
                onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/foundry/elements'); }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cyan-shadow-thin ${
                  location.pathname.includes('/elements') ? 'bg-purple-600 text-white' : 'bg-slate-900/80 text-slate-300 hover:text-purple-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
                title="Element Forge Blueprints"
              >
                <span>🔨</span>
                <span className="hidden md:inline">Elements</span>
              </button>

              <button
                type="button"
                onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/foundry/aime'); }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cyan-shadow-thin ${
                  location.pathname.includes('/aime') ? 'bg-purple-600 text-white' : 'bg-slate-900/80 text-slate-300 hover:text-purple-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
                title="AIME Creative Engine"
              >
                <span>✨</span>
                <span className="hidden md:inline">AIME</span>
              </button>

              <button
                type="button"
                onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/foundry/map-maker'); }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cyan-shadow-thin ${
                  location.pathname.includes('/map-maker') ? 'bg-purple-600 text-white' : 'bg-slate-900/80 text-slate-300 hover:text-purple-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
                title="Tactical Map Maker"
              >
                <span>🗺️</span>
                <span className="hidden md:inline">Maps</span>
              </button>
            </div>
          )}

          {/* Dynamic Controls: CODEX */}
          {isCodex && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="px-2 py-0.5 bg-purple-950/60 border border-purple-500/40 rounded-md text-[11px] font-mono text-purple-300 font-bold uppercase hidden sm:block cyan-shadow-thin">
                RULES CODEX
              </div>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.03);
                  navigate('/dbm');
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/60 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 cyan-shadow-thin"
                title="Switch from Rules Codex to Omnicortex Database"
              >
                <span>🌐</span>
                <span className="hidden sm:inline">Omnicortex DB</span>
              </button>
            </div>
          )}

          {/* Dynamic Controls: COMMS */}
          {isComms && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  setIsSquadModalOpen(true);
                }}
                className="px-2 sm:px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
                title="Team & Squad Management"
              >
                <Users size={13} />
                <span className="hidden sm:inline">Squads</span>
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
                className="px-2 sm:px-2.5 py-1 bg-[#161b22] hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
                title="Toggle Floating CommLink Tray (Alt+C)"
              >
                <Radio size={13} />
                <span className="hidden sm:inline">Tray (Alt+C)</span>
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
                className="px-2 sm:px-2.5 py-1 bg-[#161b22] hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
                title="Toggle Quick Dice Roller Tray (Alt+D)"
              >
                <Dices size={13} />
                <span className="hidden sm:inline">Dice (Alt+D)</span>
              </button>
            </div>
          )}

          {/* Dynamic Controls: DASHBOARD / DEFAULT */}
          {!isFolio && !isDBM && !isCompendium && !isFoundry && !isCodex && !isComms && (
            <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>OPERATIONS HUB</span>
            </div>
          )}
        </div>

        {/* Right Section: User Account & Settings */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          {/* User Account Menu with Functional Cloud Sync Status */}
          {currentUser ? (
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-1.5">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer group cyan-shadow-thin"
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
                <span className="hidden md:inline max-w-[120px] truncate text-cyan-300 font-bold group-hover:text-cyan-200">{displayIdentity}</span>
                <Settings size={14} className="text-slate-400 group-hover:text-slate-200" />
              </button>

              <button
                type="button"
                onClick={() => confirmLogout(navigate)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer cyan-shadow-thin"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-2.5 sm:px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-1.5 font-mono cursor-pointer cyan-shadow-thin"
            >
              <Key size={13} /> <span className="hidden xs:inline">Login</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Slide-Out Mobile Navigation Drawer ── */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] transition-opacity duration-300 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-[#0c1018]/98 border-r border-cyan-500/40 p-4 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-y-auto animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                    <Compass size={18} />
                  </div>
                  <div>
                    <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">SYSTEM MATRIX</h2>
                    <span className="text-[10px] font-mono text-cyan-400">Navigation Hub</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { AudioService.playTerminalBeep(900, 0.02); setIsMobileNavOpen(false); }}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-3 font-mono text-xs">
                {/* 1. Core Modules */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block px-1">Core Modules</span>
                  <button
                    type="button"
                    onClick={() => { navigate('/folio'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isFolio ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                      <Users size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">Persona Folio</div>
                      <div className="text-[10px] text-slate-400">Operative Sheet & Roster</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { navigate('/compendium'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isCompendium ? 'bg-sky-950/60 border-sky-400 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300">
                      <BookOpen size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">Compendium Wiki</div>
                      <div className="text-[10px] text-slate-400">Lore, Rules & Game Mechanics</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { navigate('/dbm'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isDBM ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                      <Database size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">Omnicortex Database</div>
                      <div className="text-[10px] text-slate-400">RPG System Entities & Reference</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { navigate('/codex'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isCodex ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                      <BookOpen size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">Rules Codex</div>
                      <div className="text-[10px] text-slate-400">System Matrices & Rules</div>
                    </div>
                  </button>
                </div>

                {/* 2. THE STAGE VTT */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block px-1">Tactical Combat</span>
                  <button
                    type="button"
                    onClick={() => { navigate('/stage'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isStage ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                      <Tv2 size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>THE STAGE VTT</span>
                        <span className="px-1 py-0.2 bg-amber-500/30 text-amber-300 rounded text-[8px]">WEBGPU</span>
                      </div>
                      <div className="text-[10px] text-slate-400">5ft Encounter Grid, LoS & Combat</div>
                    </div>
                  </button>
                </div>

                {/* 3. Story Foundry */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold block px-1">Story Foundry</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => { navigate('/foundry/story'); setIsMobileNavOpen(false); }}
                      className="p-2 bg-slate-900/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <BookOpen size={13} className="text-purple-400" /> Scenarios
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { navigate('/foundry/elements'); setIsMobileNavOpen(false); }}
                      className="p-2 bg-slate-900/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Hammer size={13} className="text-purple-400" /> Elements
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { navigate('/foundry/aime'); setIsMobileNavOpen(false); }}
                      className="p-2 bg-slate-900/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-purple-400" /> AIME
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Communications & Quick Tools */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block px-1">Comms & Quick Docks</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => { navigate('/comms'); setIsMobileNavOpen(false); }}
                      className="p-2 bg-slate-900/60 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-amber-400" /> Channels
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        if (onToggleDiceDock) onToggleDiceDock();
                        else window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
                      }}
                      className="p-2 bg-slate-900/60 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Dices size={13} className="text-amber-400" /> Dice Tray
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        if (onToggleCommsDock) onToggleCommsDock();
                        else toggleCommsDock();
                      }}
                      className="p-2 bg-slate-900/60 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Radio size={13} className="text-amber-400" /> Comms Dock
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        setIsSquadModalOpen(true);
                      }}
                      className="p-2 bg-slate-900/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Users size={13} className="text-emerald-400" /> Team &amp; Squads
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        if (onOpenCommandPalette) onOpenCommandPalette();
                      }}
                      className="p-2 bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Command size={13} className="text-cyan-400" /> Command
                      </div>
                    </button>
                  </div>
                </div>

                {/* 4. Global System Utilities */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => { handleOpenGuide(); setIsMobileNavOpen(false); }}
                      className="flex-1 p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-400 text-xs text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <HelpCircle size={14} className="text-cyan-400" />
                      <span>User Manual</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleAudio}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${
                        isAudioMuted ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
                      }`}
                      title={isAudioMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
                    >
                      {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Account Area */}
            <div className="pt-3 mt-4 border-t border-slate-800 text-xs font-mono flex items-center justify-between">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setIsSettingsOpen(true); setIsMobileNavOpen(false); }}
                    className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 truncate max-w-[200px]"
                  >
                    <Settings size={14} />
                    <span className="truncate">{displayIdentity}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmLogout(navigate)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { loginWithGoogle(); setIsMobileNavOpen(false); }}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Key size={14} /> Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Global Team & Squad Management Modal */}
      <GameGroupModal
        isOpen={isSquadModalOpen}
        onClose={() => setIsSquadModalOpen(false)}
        initialTab="roster"
      />
    </>
  );
};

export default GlobalHUD;
