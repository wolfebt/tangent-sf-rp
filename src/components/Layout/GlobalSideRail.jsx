import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GuidanceRail } from '../UI/GuidanceRail';
import { useFolio } from '../../context/FolioContext';
import { useDBM } from '../../context/DBMContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';
import { UserSettingsModal } from '../UserSettingsModal';
import {
  Compass,
  Users,
  BookOpen,
  Database,
  Boxes,
  Layers,
  MapPin,
  Shield,
  Radio,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';

/**
 * @file GlobalSideRail.jsx
 * @description Persistent primary navigation guidance rail rendered across all app pages.
 * Displays color-coded items with labels and icons matching former top buttons.
 */
export const GlobalSideRail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Telemetry Contexts
  const { personaRoster = [], roster = [] } = useFolio() || {};
  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};
  const { universeState, mapsCatalog } = useStory() || {};
  const { groups = [], pendingInvites = [] } = useGroup() || {};
  const { totalUnreadCount = 0 } = useChat() || {};

  // Badge calculations
  const heroCount = Array.isArray(personaRoster) && personaRoster.length > 0 
    ? personaRoster.length 
    : (Array.isArray(roster) ? roster.length : 0);
  const dbmTotalItems = Object.keys(dbData).reduce((sum, key) => {
    return sum + (Array.isArray(dbData[key]) ? dbData[key].length : 0);
  }, 0);
  const scenarioCount = universeState?.scenarios?.length || 0;
  const mapsCount = mapsCatalog?.length || universeState?.maps?.length || 0;
  const teamCount = groups?.length || 0;
  const inviteCount = pendingInvites?.length || 0;

  // Audio mute state
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleAudio = () => {
    const next = AudioService.toggleMute();
    setIsAudioMuted(next);
    if (!next) AudioService.playTerminalBeep(1100, 0.04);
  };

  // Do not render side rail on pure spectator / projector displays
  if (
    location.pathname.includes('/spectator') || 
    location.pathname.startsWith('/foundry/view/')
  ) {
    return null;
  }

  // Determine active item from current route
  const getActiveId = () => {
    const path = location.pathname;
    if (path.startsWith('/folio') || path.startsWith('/roster')) return 'folio';
    if (path.startsWith('/compendium')) return 'rules';
    if (path.startsWith('/dbm')) return 'cortex';
    if (path.startsWith('/codex')) return 'codex';
    if (path.startsWith('/foundry') || path.startsWith('/ade') || path.startsWith('/campaign-builder')) return 'ade';
    if (path.startsWith('/stage') || path === '/vtt' || path.startsWith('/vtt-ops')) return 'vtt';
    if (path.startsWith('/comms') || path.startsWith('/chat')) return 'comms';
    if (path === '/' || path === '/dashboard') return 'hub';
    return null;
  };

  const activeId = getActiveId();
  const isHubActive = activeId === 'hub';

  // Persistent navigation items with color themes matching top buttons
  const globalNavItems = [
    {
      id: 'folio',
      label: 'FOLIO',
      sublabel: 'Persona Roster & Dossiers',
      icon: Users,
      colorTheme: 'cyan',
      badge: heroCount > 0 ? `${heroCount}` : null,
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/folio');
      }
    },
    {
      id: 'rules',
      label: 'RULES',
      sublabel: 'Compendium & BASTION Rules Wiki',
      icon: BookOpen,
      colorTheme: 'blue',
      badge: null,
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/compendium');
      }
    },
    {
      id: 'cortex',
      label: 'CORTEX',
      sublabel: 'Omnicortex Master Database',
      icon: Database,
      colorTheme: 'amber',
      badge: dbmTotalItems > 0 ? `${dbmTotalItems}` : null,
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/dbm');
      }
    },
    {
      id: 'codex',
      label: 'CODEX',
      sublabel: 'Asset Builders & Rules Matrices',
      icon: Boxes,
      colorTheme: 'amber',
      badge: null,
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/codex');
      }
    },
    {
      id: 'ade',
      label: 'ADE',
      sublabel: 'Adventure Dev & Scenarios',
      icon: Layers,
      colorTheme: 'purple',
      badge: scenarioCount > 0 ? `${scenarioCount}` : null,
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/foundry');
      }
    },
    {
      id: 'vtt',
      label: 'VTT',
      sublabel: 'Tactical Maps & The Stage',
      icon: MapPin,
      colorTheme: 'cyan',
      badge: mapsCount > 0 ? `${mapsCount}` : null,
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/stage');
      }
    },
    {
      id: 'teams',
      label: 'TEAMS',
      sublabel: 'Game Squads & Tactical Groups',
      icon: Shield,
      colorTheme: 'emerald',
      badge: teamCount > 0 ? `${teamCount}` : (inviteCount > 0 ? `${inviteCount}!` : null),
      badgeColor: inviteCount > 0 ? 'bg-amber-500 text-black animate-pulse' : undefined,
      onClick: () => {
        AudioService.playTerminalBeep(1200, 0.02);
        window.dispatchEvent(new CustomEvent('open-team-management'));
      }
    },
    {
      id: 'comms',
      label: 'COMMS',
      sublabel: 'CommLink Relay & Voice Channels',
      icon: Radio,
      colorTheme: 'amber',
      badge: totalUnreadCount > 0 ? `${totalUnreadCount}` : null,
      badgeColor: 'bg-amber-500 text-black animate-pulse',
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/comms');
      }
    }
  ];

  return (
    <>
      <div className="hidden sm:flex h-full shrink-0 z-30 select-none">
        <GuidanceRail
          items={globalNavItems}
          activeId={activeId}
          headerSlot={
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.03);
                navigate('/');
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all group ${
                isHubActive
                  ? 'bg-cyan-950 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.5)]'
                  : 'bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/40 text-cyan-400 hover:border-cyan-400 hover:scale-105 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              }`}
              title="Return to Operations Hub"
            >
              <Compass size={19} className={`transition-transform duration-300 ${isHubActive ? 'text-cyan-300' : 'group-hover:rotate-45'}`} />
            </button>
          }
          footerSlot={
            <div className="flex flex-col items-center gap-1 w-full">
              {/* Audio Mute / Unmute Toggle */}
              <button
                type="button"
                onClick={toggleAudio}
                className={`group relative w-full py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  isAudioMuted
                    ? 'text-rose-400 hover:text-rose-300 hover:bg-slate-900'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
                }`}
                title={isAudioMuted ? "Unmute Global Audio" : "Mute Global Audio"}
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </div>
                <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold truncate mt-0.5">
                  {isAudioMuted ? 'MUTED' : 'AUDIO'}
                </span>
              </button>

              {/* User Settings & Configuration */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setIsSettingsOpen(true);
                }}
                className="group relative w-full py-1 px-1 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors cursor-pointer"
                title="System Configuration & Preferences"
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <Settings size={16} className="group-hover:rotate-45 transition-transform duration-300" />
                </div>
                <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold truncate mt-0.5">
                  CONFIG
                </span>
              </button>
            </div>
          }
        />
      </div>

      {/* User Settings Modal */}
      {isSettingsOpen && (
        <UserSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
};
