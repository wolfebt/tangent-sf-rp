import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  Dices, 
  Volume2, 
  VolumeX, 
  Settings, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';
import { UserSettingsModal } from '../UserSettingsModal';

export const GlobalHUD = ({ onOpenCommandPalette, onToggleDiceDock, isDiceDockOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userHandle, loginWithGoogle, confirmLogout } = useAuth();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);

  // Generate dynamic breadcrumb segments
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return [{ label: 'COMMAND HUB', path: '/' }];
    
    const crumbs = [{ label: 'HUB', path: '/' }];
    if (path.startsWith('/dbm')) crumbs.push({ label: 'OMNICORTEX', path: '/dbm' });
    if (path.startsWith('/folio') || path.startsWith('/roster')) crumbs.push({ label: 'PERSONA FOLIO', path: '/folio' });
    if (path.startsWith('/foundry') || path.startsWith('/story-foundry') || path.startsWith('/campaign-builder')) {
      crumbs.push({ label: 'FOUNDRY', path: '/foundry' });
      if (path.includes('/story') || path.startsWith('/story-foundry')) crumbs.push({ label: 'STORY WEAVER', path: '/foundry/story' });
      if (path.includes('/elements')) crumbs.push({ label: 'ELEMENT FORGE', path: '/foundry/elements' });
      if (path.includes('/map-maker')) crumbs.push({ label: 'TACTICAL MAP', path: '/foundry/map-maker' });
      if (path.includes('/aime')) crumbs.push({ label: 'AIME SUITE', path: '/foundry/aime' });
    }
    return crumbs;
  };

  const toggleAudio = () => {
    const newMuteState = AudioService.toggleMute();
    setIsAudioMuted(newMuteState);
    if (!newMuteState) {
      AudioService.playTerminalBeep(1000, 0.05);
    }
  };

  const breadcrumbs = getBreadcrumbs();
  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'Guest');

  return (
    <>
      <header className="h-[56px] w-full bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between z-50 select-none shrink-0 font-sans shadow-md">
        {/* Left Section: Brand & Dynamic Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <NavLink 
            to="/" 
            className="flex items-center gap-2 text-cyan-400 hover:opacity-90 transition-opacity group shrink-0"
            title="Return to Game Hub"
          >
            <Compass className="text-cyan-400 group-hover:rotate-45 transition-transform duration-300" size={22} />
            <span className="font-bold font-mono tracking-widest text-sm text-slate-100 hidden sm:inline">
              TANGENT <span className="text-cyan-400">SFF</span>
            </span>
          </NavLink>

          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block mx-1 shrink-0"></div>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs font-mono truncate">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <ChevronRight size={12} className="text-slate-600 shrink-0" />}
                <NavLink
                  to={crumb.path}
                  className={({ isActive }) => 
                    `hover:text-cyan-300 transition-colors uppercase truncate ${
                      isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'
                    }`
                  }
                >
                  {crumb.label}
                </NavLink>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center Section: Quick Search Trigger */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(900, 0.02);
            if (onOpenCommandPalette) onOpenCommandPalette();
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner group"
          title="Open Command Palette (Ctrl+K)"
        >
          <Search size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Search rules, heroes, maps...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-[10px] text-slate-300 font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Right Section: Tools, Audio, User Account */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Dice Roller Toggle */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              if (onToggleDiceDock) onToggleDiceDock();
            }}
            className={`p-2 rounded-lg border transition-all ${
              isDiceDockOpen 
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
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
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors"
                title="Account & System Settings"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="max-w-[110px] truncate text-cyan-300 font-bold">{displayIdentity}</span>
                <Settings size={14} className="text-slate-400 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => confirmLogout(navigate)}
                className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-colors shadow"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Global Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default GlobalHUD;
