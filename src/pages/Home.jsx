import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LandingDrawerArea } from '../components/Hub/LandingDrawerArea';
import { UserSettingsModal } from '../components/UserSettingsModal';
import { WelcomeBriefing } from '../components/Hub/WelcomeBriefing';
import { HomeMessageBanner } from '../components/Hub/HomeMessageBanner';
import { 
  X, 
  Globe, 
  HelpCircle
} from 'lucide-react';
import { AudioService } from '../services/audioService';

// Module-scoped flag: resets whenever the page is refreshed/reloaded in the browser.
// Ensures tactical briefing opens by default on homepage load, and stays closed once dismissed until refresh.
let briefingDismissedUntilRefresh = false;

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, openAuthModal } = useAuth() || {};

  // Viewport breakpoint detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 1024;
    return false;
  });

  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showWelcomeBriefing, setShowWelcomeBriefing] = useState(() => {
    return !briefingDismissedUntilRefresh;
  });
  const joinCodeHandled = useRef(false);

  // Clear legacy persistent localStorage item so briefing is open by default on reload
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('tangent_welcome_briefing_dismissed')) {
      localStorage.removeItem('tangent_welcome_briefing_dismissed');
    }
  }, []);

  const handleDismissBriefing = () => {
    briefingDismissedUntilRefresh = true;
    setShowWelcomeBriefing(false);
  };

  useEffect(() => {
    const handleOpenBriefing = () => setShowWelcomeBriefing(true);
    window.addEventListener('open-welcome-briefing', handleOpenBriefing);
    return () => window.removeEventListener('open-welcome-briefing', handleOpenBriefing);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check URL query parameters for direct team invite join (?join=GRP-XXXXXX)
  useEffect(() => {
    if (joinCodeHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      joinCodeHandled.current = true;
      setActiveDrawer('game-groups');
    }
  }, []);

  const displayIdentity = userHandle
    ? `@${userHandle}`
    : currentUser?.displayName || currentUser?.email || 'OPERATOR';

  const handleSelectDrawer = (drawerId) => {
    setActiveDrawer(prev => prev === drawerId ? null : drawerId);
  };

  return (
    <div
      onClick={() => setActiveDrawer(null)}
      className="h-full w-full relative bg-[#060a12] bg-cover bg-center bg-no-repeat text-slate-100 font-sans flex flex-col overflow-hidden select-none"
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >

      {/* ── Main Workspace Body with Center Workspace ── */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden no-scrollbar relative z-10">
        {/* Center Workspace Area */}
        <div className="flex-1 min-h-0 w-full p-2.5 sm:p-4 lg:p-5 flex flex-col gap-2 sm:gap-3 overflow-hidden">
          {/* ── Top Admin Broadcast Banner ── */}
          <HomeMessageBanner className="shrink-0" />

          {/* Mobile: active drawer dismiss bar */}
          {isMobile && activeDrawer && (
            <div className="flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-lg shrink-0 z-30">
              <span className="text-[11px] font-mono font-bold text-cyan-300 truncate uppercase">
                {activeDrawer.replace('foundry-', '').replace('-', ' ')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  AudioService.playTerminalBeep(900, 0.02);
                  setActiveDrawer(null);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 border border-slate-700 cursor-pointer"
              >
                <X size={13} />
                <span>Dismiss</span>
              </button>
            </div>
          )}

          {/* ── Center Drawer Area ── */}
          {!isMobile ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {activeDrawer ? (
                <div
                  className="flex-1 min-h-0 flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LandingDrawerArea
                    activeDrawer={activeDrawer}
                    onCloseDrawer={() => setActiveDrawer(null)}
                    onOpenDrawer={(drawerKey) => handleSelectDrawer(drawerKey)}
                  />
                </div>
              ) : showWelcomeBriefing ? (
                <div className="flex-1 min-h-0 flex flex-col items-center justify-start p-2 sm:p-4 pt-1 sm:pt-2 pb-6 sm:pb-8 overflow-y-auto w-full max-h-full">
                  <WelcomeBriefing onDismiss={handleDismissBriefing} />
                </div>
              ) : (
                /* Idle state — guidance prompt */
                <div className="flex-1 flex flex-col items-center justify-start pt-12 sm:pt-16 lg:pt-20 p-8 text-center font-mono space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shifting-wb-box-shadow">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shifting-wb-drop-shadow">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div className="space-y-1.5 max-w-lg">
                    <h3 className="text-sm sm:text-base font-bold tracking-widest text-cyan-300 uppercase shifting-wb-text-shadow">
                      UNIFIED OPERATIONS HUB READY
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto shifting-wb-text-shadow leading-relaxed">
                      Select any module from the guidance rail to launch an active workspace.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowWelcomeBriefing(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 font-mono text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        <HelpCircle size={13} className="text-cyan-400" />
                        <span>OPEN TACTICAL BRIEFING</span>
                      </button>
                      {!currentUser && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openAuthModal) openAuthModal();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)] inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Globe size={13} className="text-cyan-400" />
                          <span>CONNECT TO TERRAN DATA NET</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mobile: drawer content when open, or idle prompt */
            activeDrawer ? (
              <div
                className="w-full flex-1 min-h-0 flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <LandingDrawerArea
                  activeDrawer={activeDrawer}
                  onCloseDrawer={() => setActiveDrawer(null)}
                  onOpenDrawer={(drawerKey) => handleSelectDrawer(drawerKey)}
                />
              </div>
            ) : showWelcomeBriefing ? (
              <div className="flex-1 min-h-0 flex flex-col items-center justify-start p-2 sm:p-3 pt-1 pb-6 overflow-y-auto w-full max-h-full">
                <WelcomeBriefing isMobile onDismiss={handleDismissBriefing} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-start pt-10 sm:pt-14 p-6 text-center font-mono space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shifting-wb-box-shadow">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shifting-wb-drop-shadow">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-xs sm:text-sm font-bold tracking-widest text-cyan-300 uppercase shifting-wb-text-shadow">
                    UNIFIED OPERATIONS HUB READY
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 shifting-wb-text-shadow leading-relaxed">
                    Select any module below to launch an active workspace.
                  </p>
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowWelcomeBriefing(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 font-mono text-[11px] uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle size={12} className="text-cyan-400" />
                      <span>OPEN TACTICAL BRIEFING</span>
                    </button>
                    {!currentUser && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openAuthModal) openAuthModal();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Globe size={12} className="text-cyan-400" />
                        <span>CONNECT TO TERRAN DATA NET</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Global Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full shrink-0 pt-2 pb-2.5 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-500 gap-2 px-4 relative z-10">
        <span className="font-light text-[10px] sm:text-[11px] text-cyan-400 tracking-wider select-none shrink-0">
          Wolfe.BT@TangentLLC
        </span>
        <span className="shrink-0">CYBERNETIC INTERFACE INITIALIZED</span>
      </footer>
    </div>
  );
};

export default Home;
