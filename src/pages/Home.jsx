import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStory } from '../context/CampaignContext';
import { useFolio } from '../context/FolioContext';
import { useDBM } from '../context/DBMContext';
import { useGroup } from '../context/GroupContext';
import { CampaignOpsWidget } from '../components/Hub/CampaignOpsWidget';
import { GameSquadsWidget } from '../components/Hub/GameSquadsWidget';
import { CommCenterWidget } from '../components/Hub/CommCenterWidget';
import { ModuleLauncherCard } from '../components/Hub/ModuleLauncherCard';
import { LandingDrawerArea } from '../components/Hub/LandingDrawerArea';
import { UserSettingsModal } from '../components/UserSettingsModal';
import { 
  Database, Users, Map, Key, Shield,
  BookOpen, Sparkles, Layers, Dices, Volume2, VolumeX, Settings, LogOut,
  Menu, X, ChevronRight, Activity, ShieldAlert
} from 'lucide-react';
import { AudioService } from '../services/audioService';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, loginWithGoogle, confirmLogout } = useAuth();
  const { universeState, mapsCatalog, elementsCatalog } = useStory();
  const { personaRoster, roster } = useFolio();
  const { groups, pendingInvites } = useGroup();
  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};

  // Viewport breakpoint detection (Desktop vs Mobile)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check URL query parameters for direct squad invite join (?join=GRP-XXXXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setActiveDrawer('game-groups');
    }
  }, []);

  // Active Center View Drawer state: null | 'persona-folio' | 'game-groups' | 'foundry-scenarios' | 'foundry-elements' | 'foundry-maps' | 'foundry-aime' | 'overview'
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);

  // Live Metrics
  const heroCount = (personaRoster || roster || []).length;
  const squadCount = (groups || []).length;
  const inviteCount = (pendingInvites || []).length;
  const dbmTotalItems = Object.values(dbData).reduce((sum, categoryItems) => {
    return sum + (Array.isArray(categoryItems) ? categoryItems.length : 0);
  }, 0);
  const scenarioCount = universeState?.scenarios?.length || 0;
  const mapCount = (mapsCatalog?.length || 0) + (universeState?.maps?.length || 0);
  const elementCount = elementsCatalog?.length || 0;
  const aimeCardsCount = universeState?.creativeState?.storyCards?.length || 0;

  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'OPERATOR');

  const handleSelectDrawer = (drawerId) => {
    setActiveDrawer(prev => prev === drawerId ? null : drawerId);
    if (isMobile) {
      setIsMobileDrawerOpen(false); // slide back drawer on mobile selection
    }
  };

  const handleSelectFoundry = () => {
    setActiveDrawer(prev => ['foundry-scenarios', 'foundry-elements', 'foundry-maps', 'foundry-aime'].includes(prev) ? null : 'foundry-scenarios');
    if (isMobile) {
      setIsMobileDrawerOpen(false);
    }
  };

  const toggleAudio = () => {
    const newMuteState = AudioService.toggleMute();
    setIsAudioMuted(newMuteState);
    if (!newMuteState) {
      AudioService.playTerminalBeep(1000, 0.05);
    }
  };

  const renderModuleCards = (isCompact = false) => (
    <div className="space-y-2.5 flex flex-col">
      {/* 1. PERSONA FOLIO */}
      <ModuleLauncherCard
        title="PERSONA FOLIO"
        subtitle="Hero Builder & Roster"
        description="Character creation, augmentations, and operative roster management."
        badge={`${heroCount} ${heroCount === 1 ? 'Operative' : 'Operatives'}`}
        icon={Users}
        theme="cyan"
        frequency={1200}
        compact={isCompact}
        isActive={activeDrawer === 'persona-folio'}
        onClick={() => handleSelectDrawer('persona-folio')}
      />

      {/* 2. STORY FOUNDRY with 4 Sub-Options */}
      <ModuleLauncherCard
        title="STORY FOUNDRY"
        subtitle="Campaigns & World Engine"
        description="Scenario trees, element database, tactical battlemaps, and AIME."
        badge={`${scenarioCount} Scenarios`}
        icon={BookOpen}
        theme="purple"
        frequency={1350}
        compact={isCompact}
        isActive={['foundry-scenarios', 'foundry-elements', 'foundry-maps', 'foundry-aime'].includes(activeDrawer)}
        onClick={handleSelectFoundry}
        activeSubOptionId={activeDrawer}
        subOptions={[
          {
            id: 'foundry-scenarios',
            label: 'Scenarios & Story Trees',
            icon: Layers,
            badge: `${scenarioCount}`,
            onClick: () => handleSelectDrawer('foundry-scenarios')
          },
          {
            id: 'foundry-elements',
            label: 'Element Forge Database',
            icon: Database,
            badge: `${elementCount}`,
            onClick: () => handleSelectDrawer('foundry-elements')
          },
          {
            id: 'foundry-maps',
            label: 'Tactical Maps & VTT',
            icon: Map,
            badge: `${mapCount}`,
            onClick: () => handleSelectDrawer('foundry-maps')
          },
          {
            id: 'foundry-aime',
            label: 'AIME Creative Engine',
            icon: Sparkles,
            badge: `${aimeCardsCount}`,
            onClick: () => handleSelectDrawer('foundry-aime')
          }
        ]}
      />

      {/* 3 & 4. RULES & MATRICES COMPILATION FRAME */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-950/40 backdrop-blur-md p-2 space-y-1.5 relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {/* Frame Header Accent */}
        <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800/70">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              COMPENDIUM & MATRICES
            </span>
          </div>
          <span className="text-[8px] font-mono text-slate-500 uppercase">
            ARCHIVE
          </span>
        </div>

        {/* 3. OMNICORTEX */}
        <ModuleLauncherCard
          title="OMNICORTEX"
          subtitle="Rules & DBM"
          description="Database manager for species, cyberware, disciplines, and rules."
          badge={dbmTotalItems > 0 ? `${dbmTotalItems.toLocaleString()} Entries` : 'Active Codex'}
          icon={Database}
          path="/dbm"
          theme="emerald"
          frequency={1050}
          compact={isCompact}
          small={true}
          onClick={() => {
            if (isMobile) setIsMobileDrawerOpen(false);
            AudioService.playTerminalBeep(1050, 0.03);
            navigate('/dbm');
          }}
        />

        {/* 4. CODEX */}
        <ModuleLauncherCard
          title="CODEX"
          subtitle="Matrix Suite"
          description="Development tools across 14 matrices to create and commit rules."
          badge="14 Matrices"
          icon={BookOpen}
          path="/codex"
          theme="amber"
          frequency={1400}
          compact={isCompact}
          small={true}
          onClick={() => {
            if (isMobile) setIsMobileDrawerOpen(false);
            AudioService.playTerminalBeep(1400, 0.03);
            navigate('/codex');
          }}
        />
      </div>
    </div>
  );

  return (
    <div 
      onClick={() => setActiveDrawer(null)}
      className="h-full w-full relative bg-cover bg-center bg-no-repeat bg-fixed text-slate-100 font-sans overflow-y-auto"
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >
      {/* Mobile Slide-Out Drawer Backdrop */}
      {isMobile && isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileDrawerOpen(false);
          }}
        />
      )}

      {/* Mobile Slide-Out Drawer Panel */}
      {isMobile && (
        <div 
          className={`fixed top-0 left-0 bottom-0 w-[90%] max-w-[360px] bg-[#0b0f17]/98 border-r border-cyan-500/30 backdrop-blur-2xl p-4 z-50 flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out overflow-y-auto ${
            isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                  <Menu size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">SYSTEM MODULES & OPS</h2>
                  <span className="text-[10px] font-mono text-cyan-400">Select to load view</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(900, 0.02);
                  setIsMobileDrawerOpen(false);
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Close Drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* 1. All Module Launcher Cards */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">
                Core Modules
              </span>
              {renderModuleCards(true)}
            </div>

            {/* 2. Campaign Operations Widget */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">
                Tactical & VTT Ops
              </span>
              <CampaignOpsWidget onShowOverview={() => handleSelectDrawer('overview')} />
            </div>

            {/* 3. Game Squads Widget */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">
                Game Squads & Parties
              </span>
              <GameSquadsWidget onOpenSquadsDrawer={() => handleSelectDrawer('game-groups')} />
            </div>

            {/* 4. Comm Center Widget */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">
                Comms Relay
              </span>
              <CommCenterWidget 
                onOpenCommsDrawer={() => {
                  setIsMobileDrawerOpen(false);
                  handleSelectDrawer('comms');
                }}
                onOpenSquadsDrawer={() => {
                  setIsMobileDrawerOpen(false);
                  handleSelectDrawer('game-groups');
                }}
                onOpenCampaignOps={() => {
                  setIsMobileDrawerOpen(false);
                  handleSelectDrawer('overview');
                }}
              />
            </div>
          </div>

          {/* Drawer Footer Info */}
          <div className="pt-3 mt-4 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span className="truncate max-w-[160px]">{displayIdentity}</span>
            <span className="text-cyan-400/90 font-bold">HUB V2.0</span>
          </div>
        </div>
      )}

      {/* Dark Overlay Gradient */}
      <div className="min-h-full w-full bg-gradient-to-b from-[#0d1117]/85 via-[#0d1117]/65 to-[#0d1117]/90 backdrop-blur-[1px] p-3 sm:p-4 lg:p-5 flex flex-col justify-between">
        <div className="max-w-[1580px] w-full mx-auto space-y-3 sm:space-y-4">
          
          {/* Mobile View Header & Action Bar */}
          {isMobile && (
            <div className="flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-lg sticky top-1 z-30">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  AudioService.playTerminalBeep(1100, 0.03);
                  setIsMobileDrawerOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:bg-cyan-500/30 active:scale-95 transition-all"
              >
                <Menu size={16} />
                <span>MODULES & OPS</span>
              </button>

              {activeDrawer && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-300 truncate max-w-[130px] uppercase">
                    {activeDrawer.replace('foundry-', '').replace('-', ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      AudioService.playTerminalBeep(900, 0.02);
                      setActiveDrawer(null);
                    }}
                    className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 border border-slate-700"
                  >
                    <X size={13} />
                    <span>Dismiss</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Desktop 3-Column Layout */}
          {!isMobile ? (
            <div className="grid grid-cols-12 gap-4 items-start pt-1">
              
              {/* Left Column (3 cols): Vertical Navigation Stack */}
              <div className="col-span-3 space-y-2.5 flex flex-col" onClick={(e) => e.stopPropagation()}>
                {renderModuleCards(false)}
              </div>

              {/* Center Column (6 cols): Dynamic Open View Area / In-Page Drawers */}
              <div 
                className="col-span-6 min-h-[540px] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <LandingDrawerArea
                  activeDrawer={activeDrawer}
                  onCloseDrawer={() => setActiveDrawer(null)}
                  onOpenDrawer={(drawerKey) => handleSelectDrawer(drawerKey)}
                />
              </div>

              {/* Right Column (3 cols): Campaign Ops + Game Squads + Comm Center */}
              <div className="col-span-3 space-y-3.5 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <CampaignOpsWidget onShowOverview={() => handleSelectDrawer('overview')} />
                <GameSquadsWidget onOpenSquadsDrawer={() => handleSelectDrawer('game-groups')} />
                <CommCenterWidget 
                  onOpenCommsDrawer={() => handleSelectDrawer('comms')}
                  onOpenSquadsDrawer={() => handleSelectDrawer('game-groups')}
                  onOpenCampaignOps={() => handleSelectDrawer('overview')}
                />
              </div>

            </div>
          ) : (
            /* Mobile View: Render Center Area ONLY when activeDrawer is open */
            activeDrawer && (
              <div 
                className="w-full min-h-[460px] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <LandingDrawerArea
                  activeDrawer={activeDrawer}
                  onCloseDrawer={() => setActiveDrawer(null)}
                  onOpenDrawer={(drawerKey) => handleSelectDrawer(drawerKey)}
                />
              </div>
            )
          )}

        </div>

        {/* Global Settings Modal */}
        <UserSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Footer info */}
        <footer className="max-w-[1580px] w-full mx-auto pt-4 pb-2 border-t border-slate-900/80 mt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
          <span>TANGENT SCIENCE FANTASY ROLE PLAYING SYSTEM • HUB V2.0</span>
          <span>CYBERNETIC INTERFACE INITIALIZED</span>
        </footer>
      </div>
    </div>
  );
};

export default Home;
