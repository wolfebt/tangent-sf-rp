import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Dices, 
  Volume2, 
  VolumeX, 
  Settings, 
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
  Layers,
  X,
  Command,
  Sparkles
} from 'lucide-react';
import { useAdeStore } from '../../pages/Foundry/store/adeStore';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useDBM, loadCompendiumCatalog } from '../../context/DBMContext';
import { useFolio } from '../../context/FolioContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useDice } from '../../context/DiceContext';
import { useAudio } from '../../context/AudioContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { AudioService } from '../../services/audioService';
import { UserSettingsModal } from '../UserSettingsModal';
import { ComprehensiveUserGuideModal } from '../UI/ComprehensiveUserGuideModal';
import { GameGroupModal } from '../Groups/GameGroupModal';
import { TwoD10Icon } from '../UI/TwoD10Icon';
import ToolbarProjectMenu from '../../pages/Foundry/StoryModule/toolbar/ToolbarProjectMenu';

const formatSavedTime = (val) => {
  if (!val) return '';
  try {
    if (val instanceof Date && !isNaN(val.getTime())) {
      return val.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (typeof val === 'string') {
      if (/^\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?$/i.test(val.trim())) {
        return val.trim();
      }
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return val;
    }
    if (typeof val === 'number') {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
    if (val && typeof val.toDate === 'function') {
      const parsed = val.toDate();
      if (parsed instanceof Date && !isNaN(parsed.getTime())) {
        return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
  } catch {
    // Return empty string safely on failure
  }
  return '';
};

export const GlobalHUD = ({ onOpenCommandPalette, onToggleDiceDock, isDiceDockOpen, onToggleCommsDock, isCommsDockOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const confirm = useConfirm();
  const { currentUser, userHandle, openAuthModal, confirmLogout, isAdmin } = useAuth();
  const { totalUnreadCount, toggleCommsDock } = useChat();
  const { handleImportMasterJSON } = useDBM() || {};
  const folio = useFolio() || {};
  const { cloudSaveStatus, lastSavedTime } = folio;
  const { pendingInvites = [] } = useGroup() || {};
  const { isDiceOpen, toggleDiceRoller } = useDice() || {};

  const isDBM = location.pathname.startsWith('/dbm');
  const isCompendium = location.pathname.startsWith('/compendium') || location.pathname.startsWith('/rules');
  const isCodex = location.pathname.startsWith('/codex');
  const isCortex = isDBM || isCodex;
  const isFolio = location.pathname.startsWith('/folio') || location.pathname.startsWith('/roster');
  const isFoundry = location.pathname.startsWith('/foundry') || 
                    location.pathname.startsWith('/story-foundry') || 
                    location.pathname.startsWith('/live-studio') || 
                    location.pathname.startsWith('/ade-stage') || 
                    location.pathname.startsWith('/vtt-ops') || 
                    location.pathname.startsWith('/campaign-builder') || 
                    location.pathname.startsWith('/spectator') || 
                    location.pathname.startsWith('/stage') || 
                    location.pathname === '/vtt';
  const isComms = location.pathname.startsWith('/comms') || location.pathname.startsWith('/chat');
  const isTeams = location.pathname.startsWith('/teams') || location.pathname.startsWith('/groups') || location.pathname.startsWith('/squads');
  const isNetwork = location.pathname.startsWith('/network') || isComms || isTeams;
  const isDiceActive = isDiceDockOpen !== undefined ? isDiceDockOpen : !!isDiceOpen;

  const heroCount = Array.isArray(folio?.personaRoster) && folio.personaRoster.length > 0 
    ? folio.personaRoster.length 
    : (Array.isArray(folio?.roster) ? folio.roster.length : 0);
  const networkBadge = totalUnreadCount > 0 ? `${totalUnreadCount}` : (pendingInvites.length > 0 ? `${pendingInvites.length}!` : null);
  const hasNetworkPulse = totalUnreadCount > 0 || pendingInvites.length > 0;

  const handleToggleDice = () => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (onToggleDiceDock) {
      onToggleDiceDock();
    } else if (toggleDiceRoller) {
      toggleDiceRoller();
    } else {
      window.dispatchEvent(new CustomEvent('toggle-dice-roller'));
    }
  };
  
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState('hub');
  const { isMuted: isAudioMuted, toggleMute: toggleAudio } = useAudio();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const dbmFileInputRef = useRef(null);

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
    if (path.startsWith('/network')) {
      const search = new URLSearchParams(location.search);
      const view = search.get('view');
      return (view === 'teams' || view === 'squads') ? 'squads' : 'comms';
    }
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

  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'OPERATOR');

  return (
    <>
      <header className="w-full h-[52px] min-h-[52px] bg-[#12161f]/95 backdrop-blur-md border-b border-cyan-500/30 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 z-[100] select-none shrink-0 font-sans shadow-md relative">
        {/* Left Section: Brand Logo & Title */}
        <div className="flex items-center shrink-0">
          <NavLink 
            to="/" 
            className="flex items-center gap-1.5 sm:gap-2 uppercase text-[#22d3ee] tangent-title-pulse select-none hover:opacity-90 transition-opacity shrink-0 mr-1 sm:mr-2"
            title="Return to Operations Hub"
            onClick={() => AudioService.playTerminalBeep(1100, 0.03)}
          >
            <span className="text-[1.3rem] sm:text-[1.6rem] font-black leading-none tracking-tight">
              TANGENT
            </span>
            <div className="flex flex-col justify-between self-stretch py-[2px] text-[0.48rem] sm:text-[0.56rem] font-bold uppercase tracking-wider leading-none">
              <span className="whitespace-nowrap leading-none text-cyan-300">Science-Fantasy</span>
              <span className="whitespace-nowrap leading-none text-cyan-400/80">Role Playing Engine</span>
            </div>
          </NavLink>

          {/* Tactical Mode Switcher (Relocated beside Title Block) */}
          {isFolio && (
            <div className="inline-flex rounded-lg bg-slate-950/90 p-0.5 border border-slate-800 shrink-0 shadow-inner ml-0.5 sm:ml-1.5">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  folio.setViewMode?.('builder');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                  folio.viewMode === 'builder'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Folio Dossier Builder Mode"
              >
                <span>🛠️</span>
                <span className="hidden md:inline">Build</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  folio.setViewMode?.('play');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                  (folio.viewMode === 'play' || folio.viewMode === 'preview')
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Live Tactical Sheet (VTT)"
              >
                <span>⚔️</span>
                <span className="hidden md:inline">Tactical</span>
              </button>
            </div>
          )}

          {/* ADE Story Module Pulldown (Relocated beside Title Block) */}
          {isFoundry && (
            <div className="ml-1 sm:ml-2 shrink-0">
              <ToolbarProjectMenu />
            </div>
          )}
        </div>

        {/* Center Section: Primary Navigation Suite (Persona, Network, Cortex, ADE, Rules, Dice) */}
        <nav className="hidden sm:flex flex-1 items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0" aria-label="Primary Navigation">
          {/* PERSONA */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              if (isFolio) {
                if (folio?.activeTab === 'catalog') {
                  folio.setActiveTab?.('identity');
                } else {
                  folio.triggerSave?.();
                  folio.setActiveTab?.('catalog');
                }
              } else {
                navigate('/folio');
              }
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              isFolio
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/70 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border-slate-700/80 hover:border-cyan-500/50'
            }`}
            title={isFolio ? "Persona Folio (Click to toggle Catalog / Dossier)" : "Persona Folio & Roster (/folio)"}
          >
            <Users size={14} className={isFolio ? 'text-cyan-300' : 'text-cyan-400'} />
            <span className="font-bold text-xs uppercase tracking-wider whitespace-nowrap max-w-[130px] truncate">
              {isFolio && folio?.characterData?.['char-name'] ? folio.characterData['char-name'] : 'PERSONA'}
            </span>
            {heroCount > 0 && (
              <span className={`px-1 py-0.2 rounded text-[10px] font-mono leading-none ${
                isFolio ? 'bg-cyan-400/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
              }`}>
                {heroCount}
              </span>
            )}
          </button>

          {/* NETWORK */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              navigate('/network');
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 relative ${
              isNetwork
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/70 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border-slate-700/80 hover:border-emerald-500/50'
            }`}
            title="Tactical Squads & Operator Network (/network)"
          >
            <Radio size={14} className={isNetwork ? 'text-emerald-300' : 'text-emerald-400'} />
            <span className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">NETWORK</span>
            {networkBadge && (
              <span className={`px-1 py-0.2 rounded text-[10px] font-mono leading-none ${
                hasNetworkPulse ? 'bg-amber-500 text-black font-extrabold animate-pulse' : 'bg-slate-800 text-slate-300'
              }`}>
                {networkBadge}
              </span>
            )}
          </button>

          {/* CORTEX */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              navigate('/dbm');
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              isCortex
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border-slate-700/80 hover:border-amber-500/50'
            }`}
            title="Omnicortex Master Database (/dbm)"
          >
            <Database size={14} className={isCortex ? 'text-amber-300' : 'text-amber-400'} />
            <span className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">CORTEX</span>
          </button>

          {/* ADE */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              navigate('/foundry');
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              isFoundry
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/70 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-purple-300 border-slate-700/80 hover:border-purple-500/50'
            }`}
            title="ADE Studio & Story Foundry (/foundry)"
          >
            <Layers size={14} className={isFoundry ? 'text-purple-300' : 'text-purple-400'} />
            <span className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">ADE</span>
          </button>

          {/* RULES */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              navigate('/compendium');
            }}
            onMouseEnter={() => {
              loadCompendiumCatalog();
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              isCompendium
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/70 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border-slate-700/80 hover:border-sky-500/50'
            }`}
            title="Open Compendium & BASTION Rules Wiki (/compendium)"
          >
            <BookOpen size={14} className={isCompendium ? 'text-sky-300' : 'text-sky-400'} />
            <span className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">RULES</span>
          </button>

          {/* DICE */}
          <button
            type="button"
            onClick={handleToggleDice}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              isDiceActive
                ? 'bg-rose-500/25 text-rose-300 border-rose-400/80 shadow-[0_0_14px_rgba(244,63,94,0.4)]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-rose-300 border-slate-700/80 hover:border-rose-500/50'
            }`}
            title="Toggle Holographic Dice Tray"
          >
            <TwoD10Icon className={`w-3.5 h-3.5 ${isDiceActive ? 'text-rose-300' : 'text-rose-400'}`} />
            <span className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">DICE</span>
          </button>
        </nav>

        {/* Right Section: Settings Button with User ID & Relocated CP Budget */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          {/* Starting CP Budget Indicator (Relocated beside User Settings) */}
          {isFolio && folio?.characterData && (() => {
            const startingCP = parseInt(folio.characterData['starting-cp'] || 150, 10);
            const spentCP = typeof folio.computeSpentCP === 'function' ? folio.computeSpentCP() : 0;
            const isOver = spentCP > startingCP;
            return (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  window.dispatchEvent(new CustomEvent('open-folio-economy'));
                }}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95 ${
                  isOver
                    ? 'bg-red-950/80 hover:bg-red-900 border-red-500/80 text-red-200 animate-pulse'
                    : 'bg-[#12161f] hover:bg-[#181d28] border-cyan-500/40 hover:border-cyan-400 text-slate-300'
                }`}
                title={`Character Points Budget: ${spentCP}/${startingCP} CP spent. Click to modify starting budget or inspect economy breakdown.`}
              >
                <span className="text-[10px] text-slate-500 hidden md:inline">CP:</span>
                <span className={isOver ? 'text-red-300 font-extrabold' : 'text-cyan-300 font-bold'}>
                  {spentCP}/{startingCP}
                </span>
                <span className="text-[10px] text-cyan-400/80">⚙️</span>
              </button>
            );
          })()}

          {/* AIME Narrative Co-Pilot Button (Top Bar beside User Settings) */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1400, 0.03);
              const isFoundry = location.pathname.startsWith('/foundry') || 
                                location.pathname.startsWith('/story-foundry') || 
                                location.pathname.startsWith('/live-studio') || 
                                location.pathname.startsWith('/ade-stage') || 
                                location.pathname.startsWith('/campaign-builder');
              
              useAdeStore.getState().setModal('floatingAime', true);
              window.dispatchEvent(new CustomEvent('toggle-aime-copilot'));

              if (!isFoundry) {
                navigate('/foundry');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/80 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-100 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] active:scale-95 shrink-0"
            title="Launch AIME Narrative Co-Pilot AI Assistant"
          >
            <Sparkles size={13} className="text-amber-400 animate-pulse shrink-0" />
            <span className="font-bold">AIME</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#12161f] hover:bg-[#181d28] border border-cyan-500/50 hover:border-cyan-400 text-slate-200 text-xs font-mono transition-colors cursor-pointer group shadow-[0_0_10px_rgba(34,211,238,0.15)]"
            title={
              currentUser
                ? (cloudSaveStatus === 'saving'
                    ? 'Cloud Sync: Saving to Cloud...'
                    : cloudSaveStatus === 'saved'
                    ? (formatSavedTime(lastSavedTime) ? `Cloud Synced at ${formatSavedTime(lastSavedTime)}` : 'Cloud Synced')
                    : cloudSaveStatus === 'error'
                    ? 'Cloud Sync Failed (Click for Settings)'
                    : 'Local Storage Mode (Click for Settings)')
                : 'Application Settings'
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
                  : currentUser ? 'bg-cyan-400' : 'bg-slate-500'
              }`}
            />
            <span className="max-w-[110px] sm:max-w-[150px] truncate text-cyan-300 font-bold group-hover:text-cyan-200">
              {displayIdentity}
            </span>
            <Settings size={14} className="text-slate-400 group-hover:text-cyan-300 transition-colors shrink-0" />
          </button>

          {/* Mobile Navigation Drawer Toggle */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setIsMobileNavOpen(true);
            }}
            className="sm:hidden p-1.5 rounded-lg bg-[#12161f] hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-200 transition-colors cursor-pointer"
            title="Open System Matrix Menu"
            aria-label="Open System Matrix Menu"
          >
            <Compass size={16} />
          </button>
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
                    onClick={() => {
                      if (folio?.activeTab === 'catalog') {
                        folio.setActiveTab?.('identity');
                      }
                      navigate('/folio');
                      setIsMobileNavOpen(false);
                    }}
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
                    onClick={() => { navigate('/foundry/live-studio'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isFoundry ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                      <Layers size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">ADE</div>
                      <div className="text-[10px] text-slate-400">Consolidated Story, Maps & Stage</div>
                    </div>
                  </button>

                  {/* NETWORK */}
                  <button
                    type="button"
                    onClick={() => { navigate('/network'); setIsMobileNavOpen(false); }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      isNetwork ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                      <Radio size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs flex items-center gap-2">
                        <span>NETWORK</span>
                        {(totalUnreadCount > 0 || (pendingInvites && pendingInvites.length > 0)) && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black font-extrabold text-[9px] animate-pulse">
                            {totalUnreadCount > 0 ? `${totalUnreadCount} MSG` : `${pendingInvites.length} INV`}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Tactical Squads, CommLink & Operator Relay</div>
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
                      className="p-2 bg-slate-900/60 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Dices size={13} className="text-rose-400" /> Dice Tray
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
                <button
                  type="button"
                  onClick={() => { setIsSettingsOpen(true); setIsMobileNavOpen(false); }}
                  className="flex items-center justify-between w-full p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        cloudSaveStatus === 'saved' ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`}
                    />
                    <span className="truncate font-bold">{displayIdentity}</span>
                  </div>
                  <Settings size={14} className="text-slate-400 shrink-0" />
                </button>
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

      <input
        type="file"
        ref={dbmFileInputRef}
        onChange={handleImportMasterJSON}
        accept=".json"
        className="hidden"
      />
    </>
  );
};

export default GlobalHUD;
