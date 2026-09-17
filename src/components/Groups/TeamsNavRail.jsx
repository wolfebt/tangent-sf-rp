import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Shield, 
  Users, 
  Globe, 
  UserPlus, 
  Radio, 
  Map, 
  Settings, 
  Plus,
  Volume2,
  VolumeX,
  HelpCircle
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';

/**
 * @file TeamsNavRail.jsx
 * @description Dedicated vertical navigation rail for the TEAMS & Game Squads workstation.
 * Adheres to the Tangent SF RP GuidanceRail styling standard with emerald accents,
 * badges for roster size and invites, portal tooltips, and audio feedback.
 */
export const TeamsNavRail = ({
  activeTab = 'roster',
  onSelectTab,
  onOpenCreateModal,
  onOpenGuideModal
}) => {
  const { 
    groups = [], 
    activeGroup, 
    pendingInvites = [], 
    outgoingInvites = [] 
  } = useGroup() || {};
  const { teamChannels = [] } = useChat() || {};

  const [hoveredItem, setHoveredItem] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);

  const toggleAudio = () => {
    const next = AudioService.toggleMute();
    setIsAudioMuted(next);
    if (!next) AudioService.playTerminalBeep(1100, 0.04);
  };

  const handleTabClick = (tabId) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (onSelectTab) {
      onSelectTab(tabId);
    }
  };

  const memberCount = activeGroup?.members?.length || 0;
  const inviteCount = pendingInvites.length;
  const groupCount = groups.length;

  const navItems = [
    {
      id: 'roster',
      label: 'ROSTER',
      sublabel: 'Active Squad Operatives',
      icon: Users,
      badge: memberCount > 0 ? `${memberCount}` : null,
      badgeColor: 'bg-emerald-500 text-black font-bold'
    },
    {
      id: 'directory',
      label: 'TEAMS',
      sublabel: 'Squads & Public Parties',
      icon: Globe,
      badge: groupCount > 0 ? `${groupCount}` : null,
      badgeColor: 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
    },
    {
      id: 'invites',
      label: 'INVITES',
      sublabel: 'Join Codes & Dispatch',
      icon: UserPlus,
      badge: inviteCount > 0 ? `${inviteCount}!` : null,
      badgeColor: 'bg-amber-500 text-black font-extrabold animate-pulse'
    },
    {
      id: 'comms',
      label: 'COMMS',
      sublabel: 'Encrypted Squad Frequency',
      icon: Radio,
      badge: activeGroup?.channelId ? 'LIVE' : null,
      badgeColor: 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-[8px]'
    },
    {
      id: 'tactical',
      label: 'STAGE',
      sublabel: 'Tactical VTT Deployment',
      icon: Map,
      badge: 'VTT',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px]'
    },
    {
      id: 'settings',
      label: 'CONFIG',
      sublabel: 'Squad Policies & Permissions',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <nav
      aria-label="Teams Navigation Rail"
      className="w-18 sm:w-20 shrink-0 h-full bg-[#070a12]/95 backdrop-blur-md border-r border-slate-800/90 flex flex-col items-center justify-between py-2.5 px-1 select-none z-20 font-sans shadow-lg"
    >
      {/* Top Brand / Squad Crest */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div 
          onClick={() => handleTabClick('roster')}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/50 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 transition-all group"
          title={activeGroup ? `Active Squad: ${activeGroup.name}` : "Tangent Game Teams Station"}
        >
          <Shield size={19} className="text-emerald-400 group-hover:animate-pulse" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
        </div>

        <div className="w-8 h-px bg-slate-800/80 my-0.5" />

        {/* Navigation Items with Monospace Labels */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                onMouseEnter={(e) => setHoveredItem({ item, rect: e.currentTarget.getBoundingClientRect() })}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative w-full py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-b from-emerald-500/25 to-teal-950/40 text-emerald-200 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
                }`}
                title={`${item.label} • ${item.sublabel}`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute -left-1 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                )}

                {/* Icon Container with Badge */}
                <div className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  <Icon
                    size={18}
                    className={isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-emerald-400 transition-colors'}
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
                    isActive ? 'text-emerald-300 font-extrabold [text-shadow:0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions: New Squad, Audio Mute, Guide */}
      <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-slate-800/80 mt-auto">
        {/* New Squad Quick Action */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1300, 0.03);
            if (onOpenCreateModal) onOpenCreateModal();
          }}
          className="group relative w-full py-1 px-1 rounded-xl bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white flex flex-col items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          title="Create New Tactical Squad"
        >
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <Plus size={16} />
          </div>
          <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold truncate mt-0.5">
            NEW
          </span>
        </button>

        {/* Audio Mute / Unmute Toggle */}
        <button
          type="button"
          onClick={toggleAudio}
          className={`group relative w-full py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isAudioMuted
              ? 'text-rose-400 hover:text-rose-300 hover:bg-slate-900'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
          }`}
          title={isAudioMuted ? "Unmute Tactical Audio" : "Mute Tactical Audio"}
        >
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </div>
          <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold truncate mt-0.5">
            {isAudioMuted ? 'MUTED' : 'AUDIO'}
          </span>
        </button>

        {/* Guide / Help Handbook */}
        {onOpenGuideModal && (
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              onOpenGuideModal();
            }}
            className="group relative w-full py-1 px-1 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
            title="Squad Operations Manual"
          >
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              <HelpCircle size={15} />
            </div>
            <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold truncate mt-0.5">
              MANUAL
            </span>
          </button>
        )}
      </div>

      {/* Topmost Portal Tooltip */}
      {hoveredItem && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          className="fixed z-[999999] pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-emerald-500/40 text-slate-100 font-mono text-[11px] font-bold whitespace-nowrap shadow-xl animate-in fade-in duration-100 hidden md:block"
          style={{
            left: `${hoveredItem.rect.right + 10}px`,
            top: `${hoveredItem.rect.top + hoveredItem.rect.height / 2}px`,
            transform: 'translateY(-50%)',
            zIndex: 999999
          }}
        >
          <div className="text-emerald-300 font-bold">{hoveredItem.item.label}</div>
          <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">{hoveredItem.item.sublabel}</div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default TeamsNavRail;
