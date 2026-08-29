import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStory } from '../context/CampaignContext';
import { useFolio } from '../context/FolioContext';
import { useDBM } from '../context/DBMContext';
import { useGroup } from '../context/GroupContext';
import { LandingDrawerArea } from '../components/Hub/LandingDrawerArea';
import { TopNavBar } from '../components/Hub/TopNavBar';
import { GameSquadsWidget } from '../components/Hub/GameSquadsWidget';
import { CommCenterWidget } from '../components/Hub/CommCenterWidget';
import { UserSettingsModal } from '../components/UserSettingsModal';
import { Menu, X } from 'lucide-react';
import { AudioService } from '../services/audioService';

const Home = () => {
  const { currentUser, userHandle } = useAuth();
  const { universeState, mapsCatalog, elementsCatalog } = useStory();
  const { personaRoster, roster } = useFolio();
  const { groups, pendingInvites } = useGroup();
  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};

  // Viewport breakpoint detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 1024;
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check URL query parameters for direct team invite join (?join=GRP-XXXXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setActiveDrawer('game-groups');
    }
  }, []);

  // Active center drawer state
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Live metrics
  const heroCount = (personaRoster || roster || []).length;
  const teamCount = (groups || []).length;
  const inviteCount = (pendingInvites || []).length;
  const dbmTotalItems = Object.values(dbData).reduce((sum, categoryItems) => {
    return sum + (Array.isArray(categoryItems) ? categoryItems.length : 0);
  }, 0);
  const scenarioCount = universeState?.scenarios?.length || 0;
  const mapCount = (mapsCatalog?.length || 0) + (universeState?.maps?.length || 0);
  const aimeCardsCount = universeState?.creativeState?.storyCards?.length || 0;

  const displayIdentity = userHandle
    ? `@${userHandle}`
    : currentUser?.displayName || currentUser?.email || 'OPERATOR';

  const handleSelectDrawer = (drawerId) => {
    setActiveDrawer(prev => prev === drawerId ? null : drawerId);
    if (isMobile) setIsMobileDrawerOpen(false);
  };

  return (
    <div
      onClick={() => setActiveDrawer(null)}
      className="h-full w-full relative bg-cover bg-center bg-no-repeat bg-fixed text-slate-100 font-sans flex flex-col overflow-hidden"
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >
      {/* ── Mobile Slide-Out Backdrop ── */}
      {isMobile && isMobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={(e) => { e.stopPropagation(); setIsMobileDrawerOpen(false); }}
        />
      )}

      {/* ── Mobile Slide-Out Drawer Panel ── */}
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
                  <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">SYSTEM MODULES</h2>
                  <span className="text-[10px] font-mono text-cyan-400">Select to load view</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { AudioService.playTerminalBeep(900, 0.02); setIsMobileDrawerOpen(false); }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mobile nav shortcuts */}
            <div className="space-y-1.5 text-[10.5px] font-mono">
              {[
                { label: 'PERSONA FOLIO', id: 'persona-folio', color: 'text-cyan-300 border-cyan-500/40 hover:border-cyan-400' },
                { label: 'OMNICORTEX', id: 'omnicortex', color: 'text-emerald-300 border-emerald-500/40 hover:border-emerald-400' },
                { label: 'VTT & MAPS', id: 'foundry-maps', color: 'text-purple-300 border-purple-500/40 hover:border-purple-400' },
                { label: 'SCENARIOS', id: 'foundry-scenarios', color: 'text-purple-300 border-purple-500/40 hover:border-purple-400' },
                { label: 'AIME STUDIO', id: 'foundry-aime', color: 'text-purple-300 border-purple-500/40 hover:border-purple-400' },
                { label: 'GAME TEAMS', id: 'game-groups', color: 'text-amber-300 border-amber-500/40 hover:border-amber-400' },
                { label: 'CHANNELS', id: 'comms', color: 'text-amber-300 border-amber-500/40 hover:border-amber-400' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectDrawer(item.id)}
                  className={`w-full px-3 py-2 rounded-lg bg-slate-900/60 border font-bold uppercase tracking-wider transition-all text-left ${item.color} ${activeDrawer === item.id ? 'bg-slate-800/80' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Comm Center quick widget */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">Game Teams</span>
              <GameSquadsWidget onOpenSquadsDrawer={() => handleSelectDrawer('game-groups')} />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">Comms Relay</span>
              <CommCenterWidget
                onOpenCommsDrawer={() => { setIsMobileDrawerOpen(false); handleSelectDrawer('comms'); }}
                onOpenSquadsDrawer={() => { setIsMobileDrawerOpen(false); handleSelectDrawer('game-groups'); }}
                onOpenCampaignOps={() => { setIsMobileDrawerOpen(false); handleSelectDrawer('foundry-maps'); }}
              />
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="pt-3 mt-4 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span className="truncate max-w-[160px]">{displayIdentity}</span>
            <span className="text-cyan-400/90 font-bold">HUB V3.0</span>
          </div>
        </div>
      )}

      {/* ── Horizontal Top Nav Bar (desktop only, under GlobalHUD) ── */}
      {!isMobile && (
        <div onClick={(e) => e.stopPropagation()}>
          <TopNavBar
            activeDrawer={activeDrawer}
            onSelectDrawer={handleSelectDrawer}
            heroCount={heroCount}
            dbmTotalItems={dbmTotalItems}
            scenarioCount={scenarioCount}
            mapCount={mapCount}
            aimeCardsCount={aimeCardsCount}
            teamCount={teamCount}
            inviteCount={inviteCount}
          />
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="w-full p-3 sm:p-4 lg:p-5 flex flex-col gap-3 min-h-full">

          {/* Mobile: top action bar */}
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
                <span>MODULES</span>
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

          {/* ── Center Drawer Area ── */}
          {!isMobile ? (
            <div
              className="flex-1 min-h-[560px] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {activeDrawer ? (
                <LandingDrawerArea
                  activeDrawer={activeDrawer}
                  onCloseDrawer={() => setActiveDrawer(null)}
                  onOpenDrawer={(drawerKey) => handleSelectDrawer(drawerKey)}
                />
              ) : (
                /* Idle state — prompt to select a module */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.2)] animate-pulse">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold tracking-widest text-cyan-300 uppercase">
                      UNIFIED DASHBOARD WORKSPACE READY
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md">
                      Select a module from the navigation bar above to load a workspace.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mobile: drawer content when open */
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

        {/* Footer */}
        <footer className="w-full pt-4 pb-2 border-t border-slate-900/80 mt-auto flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2 px-4">
          <span>TANGENT SCIENCE FANTASY ROLE PLAY ENGINE BY WOLFE.BT@TANGENTLLC</span>
          <span>CYBERNETIC INTERFACE INITIALIZED</span>
        </footer>
      </div>
    </div>
  );
};

export default Home;
