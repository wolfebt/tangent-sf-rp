import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Radio, 
  Users, 
  Shield, 
  Map, 
  Activity, 
  Settings, 
  Plus,
  Mic,
  MicOff
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { AudioService } from '../../services/audioService';

export const CommsNavRail = ({ onOpenCreateModal, onOpenSquadModal, onOpenTeamModal, isCompact = false }) => {
  const { 
    activeNavTab, 
    setActiveNavTab, 
    totalUnreadCount,
    pendingCharacterNotes,
    onlineOperators,
    teamChannels,
    activeChannel
  } = useChat();
  const [hoveredItem, setHoveredItem] = useState(null);

  const {
    isConnected: isVoiceConnected,
    isConnecting: isVoiceConnecting,
    currentRoomName,
    connectToVoiceRoom,
    disconnectVoiceRoom,
    isMuted
  } = useVoiceChat();

  const handleSelectTab = (tabId) => {
    AudioService.playTerminalBeep(1150, 0.02);
    setActiveNavTab(tabId);
  };

  const navItems = [
    {
      id: 'matrix',
      label: 'FREQS',
      sublabel: 'Channels Matrix',
      icon: Radio,
      badge: totalUnreadCount > 0 ? totalUnreadCount : null,
      badgeColor: 'bg-cyan-500 text-black animate-pulse'
    },
    {
      id: 'roster',
      label: 'ROSTER',
      sublabel: 'Operators & Personas',
      icon: Users,
      badge: onlineOperators.length > 0 ? `${onlineOperators.length}` : null,
      badgeColor: 'bg-emerald-500 text-black',
      badgeDot: true
    },
    {
      id: 'teams',
      label: 'TEAMS',
      sublabel: 'Active Team Comms',
      icon: Shield,
      badge: teamChannels.length > 0 ? teamChannels.length : null,
      badgeColor: 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
    },
    {
      id: 'vtt',
      label: 'STAGE',
      sublabel: 'Tactical Viewport',
      icon: Map,
      badge: 'VTT',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px]'
    },
    {
      id: 'logs',
      label: 'AUDIT',
      sublabel: 'Operative Telemetry',
      icon: Activity,
      badge: null
    }
  ];

  return (
    <nav
      aria-label="CommLink Navigation Rail"
      className="w-18 sm:w-20 shrink-0 h-full bg-[#070a12]/95 backdrop-blur-md border-r border-slate-800/90 flex flex-col items-center justify-between py-2.5 px-1 select-none z-20 font-sans shadow-lg"
    >
      {/* Top Brand Logo / Pulse */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div 
          onClick={() => handleSelectTab('matrix')}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border border-cyan-500/50 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 transition-all group"
          title="Tangent Commlink Terminal"
        >
          <Radio size={19} className="text-cyan-400 group-hover:animate-spin" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
        </div>

        <div className="w-8 h-px bg-slate-800/80 my-0.5" />

        {/* Primary Navigation Items with Visible Labels Under Icons */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                onMouseEnter={(e) => setHoveredItem({ item, rect: e.currentTarget.getBoundingClientRect() })}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative w-full py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-b from-cyan-500/25 to-blue-950/40 text-cyan-200 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
                }`}
                title={`${item.label} • ${item.sublabel}`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute -left-1 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}

                {/* Icon Container with Badge */}
                <div className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  <Icon
                    size={18}
                    className={isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400 transition-colors'}
                  />

                  {/* Top-Right Badge */}
                  {item.badge && (
                    <span className={`absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full font-mono text-[8.5px] font-bold flex items-center justify-center shadow-sm ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Visible Monospace Label */}
                <span
                  className={`font-mono text-[9px] uppercase tracking-wider text-center mt-0.5 truncate max-w-full px-0.5 leading-tight ${
                    isActive ? 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Section: Live Voice, Quick New Channel, Settings with Labels */}
      <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-slate-800/80 mt-auto">
        {/* Live Voice CommLink Quick-Action with Label */}
        <button
          type="button"
          onClick={() => {
            if (isVoiceConnected) {
              disconnectVoiceRoom();
            } else {
              const targetRoom = activeChannel ? `tangent_freq_${activeChannel.id}` : 'tangent_team_general';
              const targetName = activeChannel?.displayName || activeChannel?.name || 'HoloNet Voice Relay';
              connectToVoiceRoom(targetRoom, targetName);
            }
          }}
          className={`group relative w-full py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            isVoiceConnected
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400 animate-pulse'
              : isVoiceConnecting
              ? 'bg-amber-600 text-white border border-amber-400 animate-pulse'
              : 'bg-slate-900/90 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border border-slate-700/80'
          }`}
          title={
            isVoiceConnected
              ? `Disconnect Voice: ${currentRoomName}`
              : isVoiceConnecting
              ? 'Connecting Voice Comms...'
              : `Join Voice Freq: ${activeChannel?.displayName || 'General'}`
          }
        >
          <div className="relative w-7 h-7 rounded flex items-center justify-center shrink-0">
            {isVoiceConnected ? (
              isMuted ? <MicOff size={16} className="text-rose-200" /> : <Mic size={16} />
            ) : (
              <Radio size={16} />
            )}
            {isVoiceConnected && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-ping" />
            )}
          </div>
          <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold truncate mt-0.5">
            {isVoiceConnected ? 'LIVE' : isVoiceConnecting ? 'CONNECT' : 'VOICE'}
          </span>
        </button>

        {/* New Channel Button with Label */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1300, 0.03);
            if (onOpenCreateModal) onOpenCreateModal();
          }}
          className="group relative w-full py-1 px-1 rounded-xl bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white flex flex-col items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          title="Open New CommLink Frequency"
        >
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <Plus size={16} />
          </div>
          <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold truncate mt-0.5">
            NEW
          </span>
        </button>

        {/* Settings Button with Label */}
        <button
          type="button"
          onClick={() => handleSelectTab('settings')}
          className={`group relative w-full py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
            activeNavTab === 'settings'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
          title="Station Preferences & Audio"
        >
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <Settings size={15} />
          </div>
          <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold truncate mt-0.5">
            CONFIG
          </span>
        </button>
      </div>

      {/* Topmost Portal Tooltip */}
      {hoveredItem && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          className="fixed z-[999999] pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-slate-700 text-slate-100 font-mono text-[11px] font-bold whitespace-nowrap shadow-xl animate-in fade-in duration-100 hidden md:block"
          style={{
            left: `${hoveredItem.rect.right + 10}px`,
            top: `${hoveredItem.rect.top + hoveredItem.rect.height / 2}px`,
            transform: 'translateY(-50%)',
            zIndex: 999999
          }}
        >
          <div className="text-cyan-300 font-bold">{hoveredItem.item.label}</div>
          <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">{hoveredItem.item.sublabel}</div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default CommsNavRail;
