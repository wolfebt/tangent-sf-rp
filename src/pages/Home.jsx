import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LandingDrawerArea } from '../components/Hub/LandingDrawerArea';
import { WelcomeBriefing } from '../components/Hub/WelcomeBriefing';
import { HomeMessageBanner } from '../components/Hub/HomeMessageBanner';
import { 
  X, 
  Globe, 
  HelpCircle
} from 'lucide-react';
import { AudioService } from '../services/audioService';
import { getEffectiveUserHandle } from '../utils/personaValidationUtils';

// Module-scoped flag: resets whenever the page is refreshed/reloaded in the browser.
// Ensures tactical briefing opens by default on homepage load, and stays closed once dismissed until refresh.
let briefingDismissedUntilRefresh = false;

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, openAuthModal } = useAuth() || {};

  // Viewport breakpoint detection (matches sm: 640px where GlobalSideRail and MobileBottomNav switch)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 640;
    return false;
  });

  const [activeDrawer, setActiveDrawer] = useState(null);
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
    const handleOpenBriefing = () => {
      briefingDismissedUntilRefresh = false;
      setActiveDrawer(null);
      setShowWelcomeBriefing(true);
    };
    window.addEventListener('open-welcome-briefing', handleOpenBriefing);
    return () => window.removeEventListener('open-welcome-briefing', handleOpenBriefing);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
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
    : currentUser
    ? `@${getEffectiveUserHandle(currentUser)}`
    : 'OPERATOR';

  const handleSelectDrawer = (drawerId) => {
    setActiveDrawer(prev => prev === drawerId ? null : drawerId);
  };

  return (
    <div
      onClick={() => setActiveDrawer(null)}
      className="h-full w-full relative tangent-grid-bg text-slate-100 font-sans flex flex-col overflow-hidden select-none"
    >

      {/* ── Main Workspace Body with Center Workspace ── */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden no-scrollbar relative z-10">
        {/* Center Workspace Area */}
        <div className="flex-1 min-h-0 w-full p-2.5 sm:p-4 lg:p-5 flex flex-col gap-2 sm:gap-3 overflow-hidden">
          {/* ── Top Admin Broadcast Banner (Top-anchored, expanding downward) ── */}
          <HomeMessageBanner position="top" className="shrink-0 self-start origin-top" />

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
              ) : null}
            </div>
          ) : (
            /* Mobile: drawer content when open, or welcome briefing */
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
              <div className="flex-1 min-h-0" />
            )
          )}

          {/* ── Bottom Admin Broadcast Banner (Bottom-anchored, expanding upward) ── */}
          <HomeMessageBanner position="bottom" className="shrink-0 mt-auto self-end origin-bottom" />
        </div>
      </div>



      {/* Footer */}
      <footer className="w-full shrink-0 py-2 bg-[#080d14]/90 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 gap-2 px-4 relative z-10">
        <span className="font-light text-[10px] sm:text-[11px] text-cyan-400 tracking-wider select-none shrink-0">
          Wolfe.BT@TangentLLC
        </span>
        <span className="shrink-0">CYBERNETIC INTERFACE INITIALIZED</span>
      </footer>
    </div>
  );
};

export default Home;
