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
  Menu, X, ChevronRight, ChevronLeft, Activity, ShieldAlert,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen
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

  // Active Center View Drawer state: null | 'persona-folio' | 'persona-sheet' | 'omnicortex' | 'codex' | 'game-groups' | 'foundry-scenarios' | 'foundry-elements' | 'foundry-maps' | 'foundry-aime' | 'overview'
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);

  // Left & Right Collapsible Column Drawers (Open by default)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

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
        isActive={activeDrawer === 'persona-folio' || activeDrawer === 'persona-sheet'}
        onClick={() => handleSelectDrawer('persona-folio')}
      />

      {/* 2. COMPENDIUM & MATRICES (OMNICORTEX & CODEX) */}
      <div className="rounded-xl border-2 border-slate-700/80 bg-slate-950/20 hover:bg-slate-950/80 hover:shadow-[0_0_24px_rgba(52,211,153,0.25)] backdrop-blur-md p-2 space-y-1.5 relative transition-all duration-200">
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

        {/* OMNICORTEX */}
        <ModuleLauncherCard
          title="OMNICORTEX"
          subtitle="Rules & DBM"
          description="Database manager for species, cyberware, disciplines, and rules."
          badge={dbmTotalItems > 0 ? `${dbmTotalItems.toLocaleString()} Entries` : 'Active Codex'}
          icon={Database}
          theme="emerald"
          frequency={1050}
          compact={isCompact}
          small={true}
          isActive={activeDrawer === 'omnicortex' || activeDrawer === 'dbm'}
          onClick={() => handleSelectDrawer('omnicortex')}
        />

        {/* CODEX */}
        <ModuleLauncherCard
          title="CODEX"
          subtitle="Matrix Suite"
          description="Development tools across 14 matrices to create and commit rules."
          badge="14 Matrices"
          icon={BookOpen}
          theme="amber"
          frequency={1400}
          compact={isCompact}
          small={true}
          isActive={activeDrawer === 'codex'}
          onClick={() => handleSelectDrawer('codex')}
        />
      </div>

      {/* 3. STORY FOUNDRY with 4 Sub-Options */}
      <ModuleLauncherCard
        title="STORY FOUNDRY"
        subtitle="Campaigns & World Engine"
        description="Scenario trees, element database, tactical battlemaps, and AIME."
        badge={`${scenarioCount} Scenarios`}
        icon={BookOpen}
        theme="purple"
        frequency={1350}
        compact={isCompact}
        isActive={['foundry-scenarios', 'foundry-elements', 'foundry-maps', 'foundry-aime', 'foundry-scenarios-workspace', 'foundry-elements-workspace', 'foundry-maps-workspace', 'foundry-aime-workspace'].includes(activeDrawer)}
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

      {/* Transparent Page Container */}
      <div className="min-h-full w-full bg-transparent p-3 sm:p-4 lg:p-5 flex flex-col justify-between">
        <div className="w-full space-y-3 sm:space-y-4 px-1 sm:px-2 lg:px-4">
          
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

          {/* Desktop 3-Column Layout with Collapsible Side Drawers */}
          {!isMobile ? (
            <div className="flex flex-row justify-between items-start gap-3 xl:gap-5 w-full pt-1 relative min-h-[580px]">
              
              {/* Left Floating Slide-out Trigger Tab (When Left Modules Drawer is Collapsed) */}
              {isLeftCollapsed && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    AudioService.playTerminalBeep(1100, 0.03);
                    setIsLeftCollapsed(false);
                  }}
                  className="fixed left-2 top-1/2 -translate-y-1/2 z-40 px-2 py-4 bg-slate-950/95 hover:bg-slate-900 border-2 border-cyan-500/70 hover:border-cyan-400 text-cyan-300 rounded-r-xl shadow-[0_0_25px_rgba(34,211,238,0.4)] flex flex-col items-center gap-2 transition-all group backdrop-blur-md cursor-pointer"
                  title="Expand Left Modules Drawer (▶)"
                >
                  <PanelLeftOpen size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono font-bold uppercase [writing-mode:vertical-lr] tracking-widest text-slate-300 group-hover:text-cyan-200">
                    MODULES
                  </span>
                </button>
              )}

              {/* Left Collapsible Drawer: System Modules */}
              {!isLeftCollapsed && (
                <div 
                  className="w-[24%] xl:w-[22%] min-w-[280px] max-w-[390px] 2xl:max-w-[430px] shrink-0 relative flex flex-col animate-fadeIn" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drawer Frame with Slight Border & Glass Blur */}
                  <div className="rounded-2xl border border-cyan-500/30 bg-[#0b0f17]/90 backdrop-blur-xl p-3 shadow-[0_0_25px_rgba(0,0,0,0.6)] space-y-2.5 relative flex flex-col">
                    
                    {/* Inner Edge Collapse Trigger Button */}
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(900, 0.02);
                        setIsLeftCollapsed(true);
                      }}
                      className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 px-1 py-3.5 bg-slate-950/95 hover:bg-slate-900 border-y border-r border-cyan-500/60 hover:border-cyan-400 text-cyan-300 rounded-r-lg shadow-[0_0_15px_rgba(34,211,238,0.25)] flex flex-col items-center justify-center transition-all group cursor-pointer"
                      title="Collapse System Modules Drawer (◀)"
                    >
                      <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>

                    {/* Left Drawer Header Accent */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-900/90 border border-cyan-500/40 rounded-xl backdrop-blur-md transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                          SYSTEM MODULES
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(900, 0.02);
                          setIsLeftCollapsed(true);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
                        title="Collapse Drawer"
                      >
                        <PanelLeftClose size={14} />
                      </button>
                    </div>

                    {/* Module Cards Stack */}
                    {renderModuleCards(false)}
                  </div>
                </div>
              )}

              {/* Center Dynamic View Area / In-Page Drawers */}
              <div 
                className="flex-1 min-w-0 min-h-[560px] flex flex-col self-stretch transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {activeDrawer ? (
                  <LandingDrawerArea
                    activeDrawer={activeDrawer}
                    onCloseDrawer={() => setActiveDrawer(null)}
                    onOpenDrawer={(drawerKey) => handleSelectDrawer(drawerKey)}
                  />
                ) : (
                  /* Empty state when both drawers are collapsed */
                  isLeftCollapsed && isRightCollapsed && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono space-y-4 animate-fadeIn">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.2)] animate-pulse">
                        <Activity size={28} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold tracking-widest text-cyan-300 uppercase">
                          UNIFIED DASHBOARD WORKSPACE READY
                        </h3>
                        <p className="text-xs text-slate-500 max-w-md">
                          Click the edge tabs to expand System Modules or Operations Drawers.
                        </p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            AudioService.playTerminalBeep(1100, 0.02);
                            setIsLeftCollapsed(false);
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
                        >
                          Expand Modules (◀)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            AudioService.playTerminalBeep(1100, 0.02);
                            setIsRightCollapsed(false);
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
                        >
                          Expand Operations (▶)
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Right Collapsible Drawer: Operations & Squads */}
              {!isRightCollapsed && (
                <div 
                  className="w-[24%] xl:w-[22%] min-w-[280px] max-w-[390px] 2xl:max-w-[430px] shrink-0 relative flex flex-col animate-fadeIn" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drawer Frame with Slight Border & Glass Blur */}
                  <div className="rounded-2xl border border-cyan-500/30 bg-[#0b0f17]/90 backdrop-blur-xl p-3 shadow-[0_0_25px_rgba(0,0,0,0.6)] space-y-2.5 relative flex flex-col">
                    
                    {/* Inner Edge Collapse Trigger Button */}
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(900, 0.02);
                        setIsRightCollapsed(true);
                      }}
                      className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-30 px-1 py-3.5 bg-slate-950/95 hover:bg-slate-900 border-y border-l border-cyan-500/60 hover:border-cyan-400 text-cyan-300 rounded-l-lg shadow-[0_0_15px_rgba(34,211,238,0.25)] flex flex-col items-center justify-center transition-all group cursor-pointer"
                      title="Collapse Operations Drawer (▶)"
                    >
                      <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Right Drawer Header Accent */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-900/90 border border-cyan-500/40 rounded-xl backdrop-blur-md transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                          OPERATIONS &amp; SQUADS
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(900, 0.02);
                          setIsRightCollapsed(true);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
                        title="Collapse Drawer"
                      >
                        <PanelRightClose size={14} />
                      </button>
                    </div>

                    {/* Operations Widgets Stack */}
                    <CampaignOpsWidget onShowOverview={() => handleSelectDrawer('overview')} />
                    <GameSquadsWidget onOpenSquadsDrawer={() => handleSelectDrawer('game-groups')} />
                    <CommCenterWidget 
                      onOpenCommsDrawer={() => handleSelectDrawer('comms')}
                      onOpenSquadsDrawer={() => handleSelectDrawer('game-groups')}
                      onOpenCampaignOps={() => handleSelectDrawer('overview')}
                    />
                  </div>
                </div>
              )}

              {/* Right Floating Slide-out Trigger Tab (When Right Operations Drawer is Collapsed) */}
              {isRightCollapsed && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    AudioService.playTerminalBeep(1100, 0.03);
                    setIsRightCollapsed(false);
                  }}
                  className="fixed right-2 top-1/2 -translate-y-1/2 z-40 px-2 py-4 bg-slate-950/95 hover:bg-slate-900 border-2 border-cyan-500/70 hover:border-cyan-400 text-cyan-300 rounded-l-xl shadow-[0_0_25px_rgba(34,211,238,0.4)] flex flex-col items-center gap-2 transition-all group backdrop-blur-md cursor-pointer"
                  title="Expand Right Operations Drawer (◀)"
                >
                  <PanelRightOpen size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono font-bold uppercase [writing-mode:vertical-lr] tracking-widest text-slate-300 group-hover:text-cyan-200">
                    OPERATIONS
                  </span>
                </button>
              )}

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
        <footer className="w-full pt-4 pb-2 border-t border-slate-900/80 mt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2 px-1 sm:px-2 lg:px-4">
          <span>TANGENT SCIENCE FANTASY ROLE PLAYING SYSTEM • UNIFIED DASHBOARD V2.0</span>
          <span>CYBERNETIC INTERFACE INITIALIZED</span>
        </footer>
      </div>
    </div>
  );
};

export default Home;
