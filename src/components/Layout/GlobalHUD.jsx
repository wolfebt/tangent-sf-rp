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
  Tv2,
  Hammer,
  Shield,
  X,
  Command
} from 'lucide-react';
import { 
  FolioHUDBar, 
  DBMHUDBar, 
  CompendiumHUDBar, 
  ADEHUDBar, 
  CodexHUDBar, 
  CommsHUDBar 
} from './hud';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useDBM } from '../../context/DBMContext';
import { useFolio } from '../../context/FolioContext';
import { useAudio } from '../../context/AudioContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { AudioService } from '../../services/audioService';
import { UserSettingsModal } from '../UserSettingsModal';
import { ComprehensiveUserGuideModal } from '../UI/ComprehensiveUserGuideModal';
import { GameGroupModal } from '../Groups/GameGroupModal';

export const GlobalHUD = ({ onOpenCommandPalette, onToggleDiceDock, isDiceDockOpen, onToggleCommsDock, isCommsDockOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const confirm = useConfirm();
  const { currentUser, userHandle, loginWithGoogle, openAuthModal, triggerBootSplash, confirmLogout, isAdmin, userRole, adminOverride, toggleAdminOverride } = useAuth();
  const { totalUnreadCount, toggleCommsDock, pendingCharacterNotes } = useChat();
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
    isCharacterSelected,
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
  const isTeams = location.pathname.startsWith('/teams') || location.pathname.startsWith('/groups') || location.pathname.startsWith('/squads');
  const isStage = location.pathname.startsWith('/stage') || location.pathname === '/vtt';
  
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState('hub');
  const { isMuted: isAudioMuted, toggleMute: toggleAudio } = useAudio();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Global custom event listeners for Team Management
  useEffect(() => {
    const handleOpenTeamModal = () => setIsTeamModalOpen(true);
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

  const getRouteGuideTab = () => {
    const path = location.pathname;
    if (path.startsWith('/teams') || path.startsWith('/groups') || path.startsWith('/squads')) return 'squads';
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

  const triggerMasterImport = () => {
    if (!isAdmin) {
      toast({ 
        type: 'warning', 
        title: 'ACCESS RESTRICTED', 
        text: 'Administrator or GM access required to import Master Database backups.' 
      });
      return;
    }
    if (dbmFileInputRef.current) {
      dbmFileInputRef.current.click();
    }
  };

  const handleClearDbmCache = async () => {
    const ok = await confirm({
      title: 'Clear Omnicortex Cache',
      message: 'Are you sure you want to clear your local Omnicortex temporary cache and search filters? The page will reload.',
      danger: true,
      confirmLabel: 'Clear Cache'
    });
    if (ok) {
      localStorage.removeItem('tangent_dbm_cache');
      window.location.reload();
    }
  };

  const getActivePageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return null; // Dashboard - no user-facing label needed
    if (path.startsWith('/teams') || path.startsWith('/groups') || path.startsWith('/squads')) return 'GAME TEAMS & SQUADS';
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
    if (path.startsWith('/foundry') || path.startsWith('/campaign-builder') || path.startsWith('/ade')) return 'ADE STUDIO';
    return null;
  };

  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'OPERATOR');

  return (
    <>
      <header className="w-full h-[52px] min-h-[52px] bg-[#12161f]/95 backdrop-blur-md border-b border-cyan-500/30 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 z-[100] select-none shrink-0 font-sans shadow-md relative">
        {/* Left Section: Brand Logo & Primary Navigation Group */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <NavLink 
            to="/" 
            className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse select-none items-start hover:opacity-90 transition-opacity shrink-0 mr-1 sm:mr-2"
            title="Return to Operations Hub"
            onClick={() => AudioService.playTerminalBeep(1100, 0.03)}
          >
            <span className="text-[1.1rem] sm:text-[1.55rem] font-bold leading-none">TANGENT</span>
            <span className="hidden sm:inline text-[0.55rem] sm:text-[0.7rem] leading-none whitespace-nowrap text-cyan-400/80 mt-0.5">Science-Fantasy</span>
            <span className="hidden sm:inline text-[0.55rem] sm:text-[0.7rem] leading-none whitespace-nowrap text-cyan-400/80 mt-0.5">Role Playing Engine</span>
          </NavLink>

        </div>

        {/* Center Section: Dynamic Contextual Header Options for Active Page */}
        <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 min-w-0 px-2 overflow-visible relative">
          {/* Dynamic Controls: PERSONA FOLIO */}
          {isFolio && (
            <FolioHUDBar
              characterData={characterData}
              computeSpentCP={computeSpentCP}
              isCharacterSelected={isCharacterSelected}
              isBastionOpen={isBastionOpen}
              setIsBastionOpen={setIsBastionOpen}
              cloudSaveStatus={cloudSaveStatus}
              isLocked={isLocked}
              isPlayerOverride={isPlayerOverride}
              isInActiveGame={isInActiveGame}
              allowPlayerOverride={allowPlayerOverride}
              lockPersona={lockPersona}
              unlockPersona={unlockPersona}
              clonePersonaVariant={clonePersonaVariant}
              handleSaveLocal={handleSaveLocal}
              handleExportAsStoryElement={handleExportAsStoryElement}
              handleOpenGuide={handleOpenGuide}
              confirm={confirm}
            />
          )}

          {/* Dynamic Controls: OMNICORTEX */}
          {isDBM && (
            <DBMHUDBar
              setIsSidebarOpen={setIsSidebarOpen}
              handleBack={handleBack}
              handleForward={handleForward}
              historyIndex={historyIndex}
              history={history}
              activeCategory={activeCategory}
              adminOverride={adminOverride}
              toggleAdminOverride={toggleAdminOverride}
              isBastionOpen={isBastionOpen}
              setIsBastionOpen={setIsBastionOpen}
              handleOpenGuide={handleOpenGuide}
              handleClearDbmCache={handleClearDbmCache}
              syncMasterSpeciesMatrix={syncMasterSpeciesMatrix}
              syncCanonicalCompendium={syncCanonicalCompendium}
              handleExportMasterJSON={handleExportMasterJSON}
              handleImportMasterJSON={handleImportMasterJSON}
              triggerMasterImport={triggerMasterImport}
              isAdmin={isAdmin}
            />
          )}

          {/* Dynamic Controls: COMPENDIUM */}
          {isCompendium && (
            <CompendiumHUDBar
              location={location}
              navigate={navigate}
              isAdmin={isAdmin}
              syncCanonicalCompendium={syncCanonicalCompendium}
              handleOpenGuide={handleOpenGuide}
            />
          )}

          {/* Dynamic Controls: ADE STUDIO */}
          {isFoundry && (
            <ADEHUDBar
              location={location}
              navigate={navigate}
              isStage={isStage}
            />
          )}

          {/* Dynamic Controls: CODEX */}
          {isCodex && (
            <CodexHUDBar
              navigate={navigate}
            />
          )}

          {/* Dynamic Controls: COMMS */}
          {isComms && (
            <CommsHUDBar
              setIsTeamModalOpen={setIsTeamModalOpen}
              onToggleCommsDock={onToggleCommsDock}
              toggleCommsDock={toggleCommsDock}
              onToggleDiceDock={onToggleDiceDock}
            />
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
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#12161f] hover:bg-[#161922] border border-cyan-500/50 hover:border-cyan-400 text-slate-200 text-xs font-mono transition-colors cursor-pointer group cyan-shadow-thin"
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
              onClick={openAuthModal}
              className="px-2.5 sm:px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-1.5 font-mono cursor-pointer cyan-shadow-thin"
              title="Access Terran Data Net"
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
                {/* Core Navigation Rail Modules */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block px-1">Modules</span>
                  
                  {/* FOLIO */}
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
                      <div className="font-bold text-xs">FOLIO</div>
                      <div className="text-[10px] text-slate-400">Persona Roster & Dossiers</div>
                    </div>
                  </button>

                  {/* RULES */}
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
                      <div className="font-bold text-xs">RULES</div>
                      <div className="text-[10px] text-slate-400">Compendium & BASTION Rules Wiki</div>
                    </div>
                  </button>

                  {/* CORTEX */}
                  <button
                    type="button"
                    onClick={() => { navigate('/dbm'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isDBM ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                      <Database size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">CORTEX</div>
                      <div className="text-[10px] text-slate-400">Omnicortex Master Database</div>
                    </div>
                  </button>

                  {/* ADE */}
                  <button
                    type="button"
                    onClick={() => { navigate('/foundry'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isFoundry && !isStage ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                      <Layers size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">ADE</div>
                      <div className="text-[10px] text-slate-400">Adventure Dev & Scenarios</div>
                    </div>
                  </button>

                  {/* VTT */}
                  <button
                    type="button"
                    onClick={() => { navigate('/stage'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isStage ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                      <MapPin size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">VTT</div>
                      <div className="text-[10px] text-slate-400">Tactical Maps & The Stage</div>
                    </div>
                  </button>

                  {/* TEAMS */}
                  <button
                    type="button"
                    onClick={() => { navigate('/teams'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isTeams ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                      <Shield size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">TEAMS</div>
                      <div className="text-[10px] text-slate-400">Game Squads & Tactical Groups</div>
                    </div>
                  </button>

                  {/* COMMS */}
                  <button
                    type="button"
                    onClick={() => { navigate('/comms'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isComms ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                      <Radio size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">COMMS</div>
                      <div className="text-[10px] text-slate-400">CommLink Relay & Voice Channels</div>
                    </div>
                  </button>
                </div>

                {/* Quick Tools */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block px-1">Quick Tools</span>
                  <div className="grid grid-cols-2 gap-1.5">
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
                        setIsTeamModalOpen(true);
                      }}
                      className="p-2 bg-slate-900/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Users size={13} className="text-emerald-400" /> Teams
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
                  onClick={() => { openAuthModal(); setIsMobileNavOpen(false); }}
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

      {/* Global Team Management Modal */}
      <GameGroupModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        initialTab="roster"
      />
    </>
  );
};

export default GlobalHUD;
