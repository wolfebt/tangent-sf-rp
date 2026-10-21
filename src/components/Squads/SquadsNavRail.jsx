import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Shield, 
  Users, 
  Globe, 
  UserPlus, 
  Radio, 
  Settings, 
  Plus,
  Volume2,
  VolumeX,
  HelpCircle,
  Pin,
  Map,
  Compass
} from 'lucide-react';
import { useSquad, useGroup } from '../../context/SquadContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';

/**
 * @file SquadsNavRail.jsx
 * @description Dedicated vertical navigation rail for the SQUADS workstation.
 * Adheres to the collapsible drawer GuidanceRail standard:
 * - Partially collapsed by default (w-14 sm:w-16, horizontal rows, labels hidden)
 * - Expands smoothly on hover to w-56 sm:w-60 overlay drawer
 * - Pin lock option to lock the drawer permanently open without auto-collapsing
 * - Autocollapses immediately on mouse leave and on tab/action selection (when unpinned)
 * - In-flow sizing anchor reserves space when pinned and prevents layout shifts
 * - Emerald theme accents, badges for roster size and invites, portal tooltips, and audio feedback.
 */
export const SquadsNavRail = ({
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
  const { teamChannels = [], unreadCounts = {} } = useChat() || {};

  const [hoveredItem, setHoveredItem] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('tangent_squads_nav_pinned') === 'true';
    } catch {
      return false;
    }
  });

  const togglePin = (e) => {
    e?.stopPropagation?.();
    const next = !isPinned;
    AudioService.playTerminalBeep(next ? 1250 : 950, 0.02);
    setIsPinned(next);
    try {
      localStorage.setItem('tangent_squads_nav_pinned', String(next));
    } catch {}
  };

  const isExpanded = isPinned || isHovered;
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);

  const toggleAudio = () => {
    const next = AudioService.toggleMute();
    setIsAudioMuted(next);
    if (!next) AudioService.playTerminalBeep(1100, 0.04);
  };

  const handleTabClick = (tabId) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (!isPinned) {
      setIsHovered(false);
      setHoveredItem(null);
    }
    if (onSelectTab) {
      onSelectTab(tabId);
    }
  };

  const memberCount = activeGroup?.members?.length || 0;
  const inviteCount = pendingInvites.length;
  const groupCount = groups.length;
  const squadUnread = activeGroup?.channelId ? (unreadCounts[activeGroup.channelId] || 0) : 0;

  const navItems = [
    {
      id: 'roster',
      label: 'ROSTER',
      sublabel: 'Active Team Operators',
      icon: Users
    },
    {
      id: 'tactical',
      label: 'STAGE VTT',
      sublabel: 'Tactical Briefing & VTT',
      icon: Map
    },
    {
      id: 'lfg',
      label: 'RECRUIT LFT',
      sublabel: 'Recruitment & LFT Hub',
      icon: Compass
    },
    {
      id: 'directory',
      label: 'TEAMS',
      sublabel: 'Teams & Public Parties',
      icon: Globe
    },
    {
      id: 'invites',
      label: 'INVITES',
      sublabel: 'Join Codes & Dispatch',
      icon: UserPlus,
      pulse: inviteCount > 0,
      pulseClass: 'animate-nav-pulse-amber'
    },
    {
      id: 'comms',
      label: 'COMMS',
      sublabel: 'Encrypted Team Frequency',
      icon: Radio,
      pulse: squadUnread > 0,
      pulseClass: 'animate-nav-pulse-amber'
    },
    {
      id: 'settings',
      label: 'CONFIG',
      sublabel: 'Team Policies & Permissions',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Desktop In-Flow Sizing Anchor (prevents center workspace layout shifts while hovering, reserves space when pinned) */}
      <div
        className={`hidden md:block shrink-0 h-full pointer-events-none transition-all duration-200 ease-out ${
          isPinned ? 'w-56 sm:w-60' : 'w-14 sm:w-16'
        }`}
        aria-hidden="true"
      />

      <nav
        aria-label="Squads Navigation Rail"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredItem(null);
        }}
        className={`fixed md:absolute top-0 bottom-0 left-0 h-full bg-[#070a12]/98 backdrop-blur-xl border-r border-slate-800/90 flex flex-col justify-between py-2 px-1 select-none z-30 font-sans transition-all duration-200 ease-out ${
          isExpanded 
            ? 'w-56 sm:w-60 shadow-[12px_0_35px_rgba(0,0,0,0.85)] border-slate-700/80' 
            : 'w-14 sm:w-16 shadow-lg'
        }`}
      >
        {/* Top Brand / Squad Crest and Navigation Items */}
        <div className="flex flex-col items-stretch gap-0.5 sm:gap-1 w-full flex-1 min-h-0 overflow-y-auto no-scrollbar py-0.5">
          {/* Expanded Drawer Mini Header with Pin Option */}
          <div
            className={`w-full flex items-center justify-between px-2.5 py-1 mb-1 border-b border-emerald-500/20 shrink-0 transition-all duration-200 overflow-hidden ${
              isExpanded ? 'opacity-100 h-7' : 'opacity-0 h-0 p-0 mb-0 border-b-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest truncate">
                TEAMS
              </span>
              {inviteCount > 0 && (
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-black font-extrabold animate-pulse">
                  {inviteCount}!
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
                COMMAND
              </span>
              <button
                type="button"
                onClick={togglePin}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  isPinned
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                }`}
                title={isPinned ? "Unpin Rail (Auto-collapse on exit)" : "Pin Rail (Lock open)"}
                aria-label={isPinned ? "Unpin Rail" : "Pin Rail"}
              >
                <Pin size={11} className={`transition-transform duration-200 ${isPinned ? 'rotate-45 text-emerald-300' : 'text-slate-400 hover:text-slate-200'}`} />
              </button>
            </div>
          </div>

          {/* Top Brand Team Crest Button */}
          <button
            type="button"
            onClick={() => handleTabClick('roster')}
            className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/80 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:scale-[1.02] ${
              isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
            }`}
            title={isExpanded ? undefined : (activeGroup ? `Active Team: ${activeGroup.name}` : "Tangent Game Teams Station")}
          >
            <div className="relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/40 bg-emerald-950/60">
              <Shield size={16} className="text-emerald-400 group-hover:animate-soft-badge-glow" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-soft-badge-glow" />
            </div>

            <div
              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight text-emerald-300">
                  {activeGroup ? activeGroup.name : 'TEAM STATION'}
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-bold shrink-0">
                  NET
                </span>
              </div>
              <span className="text-[9px] text-slate-400 truncate font-mono leading-tight mt-0.5">
                {activeGroup ? `${memberCount} Operatives` : 'Tactical Units'}
              </span>
            </div>
          </button>

          <div className="w-full h-px bg-slate-800/60 my-0.5 shrink-0" />

          {/* Navigation Items with Labels to Right of Icon */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({ item, rect });
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer select-none border shrink-0 ${
                  isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-950/40 text-emerald-200 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                }`}
                title={isExpanded ? undefined : `${item.label} • ${item.sublabel}`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                )}

                {/* Icon Container with Badge */}
                <div className={`relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                  isActive
                    ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
                    : 'border-transparent text-slate-400 group-hover:text-emerald-400'
                }`}>
                  <Icon
                    size={16}
                    className={isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-emerald-400 transition-colors'}
                  />

                  {/* Top-Right Pulse Indicator */}
                  {item.pulse && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-soft-badge-glow shadow-[0_0_6px_#f59e0b]" />
                  )}
                </div>

                {/* Label to Right of Icon (Hidden when collapsed, smoothly revealed on hover or when pinned) */}
                <div
                  className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                    isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight ${
                        isActive ? 'text-emerald-300 font-extrabold [text-shadow:0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400/80 truncate font-mono leading-tight mt-0.5">
                    {item.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions: New Squad, Audio Mute, Guide */}
        <div className="flex flex-col items-center gap-1 w-full pt-1.5 border-t border-slate-800/80 shrink-0">
          {/* New Squad Quick Action */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1300, 0.03);
              if (!isPinned) {
                setIsHovered(false);
                setHoveredItem(null);
              }
              if (onOpenCreateModal) onOpenCreateModal();
            }}
            className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/40 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] ${
              isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
            }`}
            title={isExpanded ? undefined : "Create New Tactical Team"}
          >
            <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
              <Plus size={16} />
            </div>
            <div
              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider truncate leading-tight">
                NEW TEAM
              </span>
              <span className="text-[8.5px] text-emerald-200/80 truncate font-mono leading-tight mt-0.5">
                Create Team
              </span>
            </div>
          </button>

          {/* Audio Mute / Unmute Toggle */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-colors cursor-pointer border shrink-0 ${
              isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
            } ${
              isAudioMuted
                ? 'text-rose-400 hover:text-rose-300 hover:bg-slate-900 border-transparent'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900 border-transparent'
            }`}
            title={isExpanded ? undefined : (isAudioMuted ? "Unmute Tactical Audio" : "Mute Tactical Audio")}
          >
            <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
              {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </div>
            <div
              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider truncate leading-tight">
                {isAudioMuted ? 'AUDIO MUTED' : 'AUDIO ACTIVE'}
              </span>
              <span className="text-[8.5px] text-slate-500 truncate font-mono leading-tight mt-0.5">
                Tactical Sound FX
              </span>
            </div>
          </button>

          {/* Guide / Help Handbook */}
          {onOpenGuideModal && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                if (!isPinned) {
                  setIsHovered(false);
                  setHoveredItem(null);
                }
                onOpenGuideModal();
              }}
              className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-colors cursor-pointer border border-transparent text-slate-500 hover:text-slate-200 hover:bg-slate-900 shrink-0 ${
                isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
              }`}
              title={isExpanded ? undefined : "Team Operations Manual"}
            >
              <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                <HelpCircle size={15} />
              </div>
              <div
                className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                }`}
              >
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider truncate leading-tight">
                  MANUAL
                </span>
                <span className="text-[8.5px] text-slate-500 truncate font-mono leading-tight mt-0.5">
                  Operations Guide
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Topmost Portal Tooltip */}
        {hoveredItem && !isExpanded && typeof document !== 'undefined' && createPortal(
          <div
            role="tooltip"
            className="fixed pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-emerald-500/40 text-slate-100 font-mono text-[11px] font-bold whitespace-nowrap shadow-xl animate-in fade-in duration-100 hidden md:block select-none"
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
    </>
  );
};

export { SquadsNavRail as TeamsNavRail };
export default SquadsNavRail;
