import React, { useState } from 'react';
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
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';
import { UserSettingsModal } from '../UserSettingsModal';

export const GlobalHUD = ({ onOpenCommandPalette, onToggleDiceDock, isDiceDockOpen, onToggleCommsDock, isCommsDockOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userHandle, loginWithGoogle, confirmLogout } = useAuth();
  const { totalUnreadCount, toggleCommsDock } = useChat();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);

  const toggleAudio = () => {
    const newMuteState = AudioService.toggleMute();
    setIsAudioMuted(newMuteState);
    if (!newMuteState) {
      AudioService.playTerminalBeep(1000, 0.05);
    }
  };

  const getActivePageTitle = () => {
    const path = location.pathname;
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
    return 'OPERATIONS HUB';
  };

  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'OPERATOR');

  return (
    <>
      <header className="w-full bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5 grid grid-cols-1 md:grid-cols-3 items-center gap-3 z-50 select-none shrink-0 font-sans shadow-md">
        {/* Left Section: TANGENT SCIENCE FANTASY ROLEPLAY */}
        <div className="flex items-center gap-3 min-w-0">
          <NavLink 
            to="/" 
            className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse select-none items-start hover:opacity-90 transition-opacity shrink-0"
            title="Return to Operations Hub"
          >
            <span className="text-[1.85rem] sm:text-[2.25rem] font-bold leading-none">TANGENT</span>
            <span className="text-[0.875rem] sm:text-[1rem] lg:text-[1.125rem] leading-none whitespace-nowrap">SCIENCE FANTASY ROLEPLAY</span>
          </NavLink>
        </div>

        {/* Center Section: Centered Active Page Title */}
        <div className="flex items-center justify-center uppercase text-[#22d3ee] tangent-title-pulse select-none text-center">
          <span className="text-[1.35rem] sm:text-[1.5rem] lg:text-[1.65rem] font-bold leading-none tracking-wide whitespace-nowrap">
            {getActivePageTitle()}
          </span>
        </div>

        {/* Right Section: Tools, Audio, User Account */}
        <div className="flex items-center justify-start md:justify-end gap-2 shrink-0">
          {/* CommLink Comms Dock Toggle */}
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
            className={`p-2 rounded-lg border transition-all relative ${
              isCommsDockOpen 
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]' 
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Toggle CommLink Comms (Alt+C)"
          >
            <MessageSquare size={17} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-black text-[9px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
                {totalUnreadCount}
              </span>
            )}
          </button>

          {/* Quick Dice Roller Toggle */}
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
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
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
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors shadow-sm"
                title="Account & System Settings"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="max-w-[120px] truncate text-cyan-300 font-bold">{displayIdentity}</span>
                <Settings size={14} className="text-slate-400 ml-0.5" />
              </button>

              <button
                type="button"
                onClick={() => confirmLogout(navigate)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
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
    </>
  );
};

export default GlobalHUD;
