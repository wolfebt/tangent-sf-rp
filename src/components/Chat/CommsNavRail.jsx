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
  MicOff,
  Pin
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { useGroup } from '../../context/GroupContext';
import { AudioService } from '../../services/audioService';

/**
 * @file CommsNavRail.jsx
 * @description Dedicated vertical navigation rail for CommLink / Comms workstation.
 * Adheres to the collapsible drawer GuidanceRail standard:
 * - Partially collapsed by default (w-14 sm:w-16, horizontal rows, labels hidden)
 * - Expands smoothly on hover to w-56 sm:w-60 overlay drawer
 * - Pin lock option to lock the drawer permanently open without auto-collapsing
 * - Autocollapses immediately on mouse leave and on tab/action selection (when unpinned)
 * - In-flow sizing anchor reserves space when pinned and prevents layout shifts
 */
export const CommsNavRail = ({ onOpenCreateModal, onOpenSquadModal, onOpenTeamModal, isCompact = false }) => {
  const { 
    activeNavTab, 
    setActiveNavTab, 
    totalUnreadCount,
    hasUnseenMessages,
    hasNewOperatorLogins,
    newOperatorLogins,
    clearNewOperatorLogins,
    pendingCharacterNotes,
    onlineOperators = [],
    teamChannels = [],
    activeChannel
  } = useChat();

  const effectiveHasNewLogins = hasNewOperatorLogins ?? false;
  const effectiveNewLogins = newOperatorLogins ?? [];
  const effectiveClearLogins = clearNewOperatorLogins;
  const { pendingInvites = [] } = useGroup() || {};

  const [hoveredItem, setHoveredItem] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('tangent_comms_nav_pinned') === 'true';
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
      localStorage.setItem('tangent_comms_nav_pinned', String(next));
    } catch {}
  };

  const isExpanded = isPinned || isHovered;

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
    if (tabId === 'roster') {
      effectiveClearLogins?.();
    }
    setActiveNavTab(tabId);
    if (!isPinned) {
      setIsHovered(false);
      setHoveredItem(null);
    }
  };

  const navItems = [
    {
      id: 'matrix',
      label: 'FREQS',
      sublabel: 'Channels Matrix',
      icon: Radio,
      pulse: totalUnreadCount > 0,
      pulseClass: 'animate-nav-pulse-amber'
    },
    {
      id: 'roster',
      label: 'ROSTER',
      sublabel: 'Operators & Personas',
      icon: Users,
      badgeDot: true,
      pulse: effectiveHasNewLogins,
      pulseClass: 'animate-nav-pulse-emerald'
    },
    {
      id: 'teams',
      label: 'TEAMS',
      sublabel: 'Active Team Comms',
      icon: Shield,
      pulse: pendingInvites.length > 0,
      pulseClass: 'animate-nav-pulse-amber'
    },
    {
      id: 'vtt',
      label: 'STAGE',
      sublabel: 'Tactical Viewport',
      icon: Map
    },
    {
      id: 'logs',
      label: 'AUDIT',
      sublabel: 'Persona Telemetry',
      icon: Activity,
      badge: null
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
        aria-label="CommLink Navigation Rail"
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
        {/* Top Brand Logo / Pulse and Navigation Items */}
        <div className="flex flex-col items-stretch gap-0.5 sm:gap-1 w-full flex-1 min-h-0 overflow-y-auto no-scrollbar py-0.5">
          {/* Expanded Drawer Mini Header with Pin Option */}
          <div
            className={`w-full flex items-center justify-between px-2.5 py-1 mb-1 border-b border-cyan-500/20 shrink-0 transition-all duration-200 overflow-hidden ${
              isExpanded ? 'opacity-100 h-7' : 'opacity-0 h-0 p-0 mb-0 border-b-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest truncate">
                COMMLINK
              </span>
              {totalUnreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-soft-badge-glow shadow-[0_0_6px_#f59e0b] shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
                RELAYS
              </span>
              <button
                type="button"
                onClick={togglePin}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  isPinned
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                }`}
                title={isPinned ? "Unpin Rail (Auto-collapse on exit)" : "Pin Rail (Lock open)"}
                aria-label={isPinned ? "Unpin Rail" : "Pin Rail"}
              >
                <Pin size={11} className={`transition-transform duration-200 ${isPinned ? 'rotate-45 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`} />
              </button>
            </div>
          </div>

          {/* Top Brand Relay Button */}
          <button
            type="button"
            onClick={() => handleSelectTab('matrix')}
            className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 ${
              isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
            } ${
              totalUnreadCount > 0 && effectiveHasNewLogins
                ? 'animate-nav-pulse-hybrid'
                : totalUnreadCount > 0
                ? 'animate-nav-pulse-amber'
                : effectiveHasNewLogins
                ? 'animate-nav-pulse-emerald'
                : 'bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/80 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:scale-[1.02]'
            }`}
            title={isExpanded ? undefined : (
              effectiveHasNewLogins && totalUnreadCount > 0
                ? 'Unseen Messages & New Operators Online'
                : effectiveHasNewLogins
                ? `New Operators Online: ${effectiveNewLogins.map(o => o.userHandle || o.displayName).slice(0, 2).join(', ')}`
                : totalUnreadCount > 0
                ? `${totalUnreadCount} Unseen Messages`
                : 'Tangent Commlink Terminal'
            )}
          >
            <div className="relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border border-cyan-500/40 bg-cyan-950/60">
              <Radio size={16} className={`${totalUnreadCount > 0 || effectiveHasNewLogins ? 'text-current' : 'text-cyan-400'} group-hover:animate-spin`} />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black animate-soft-badge-glow ${
                effectiveHasNewLogins ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
              }`} />
            </div>

            <div
              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight text-cyan-300">
                  COMMLINK
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold shrink-0">
                  LIVE
                </span>
              </div>
              <span className="text-[9px] text-slate-400 truncate font-mono leading-tight mt-0.5">
                Terminal Relay
              </span>
            </div>
          </button>

          <div className="w-full h-px bg-slate-800/60 my-0.5 shrink-0" />

          {/* Primary Navigation Items with Labels to Right of Icon */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({ item, rect });
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer select-none border shrink-0 ${
                  isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-950/40 text-cyan-200 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                }`}
                title={isExpanded ? undefined : `${item.label} • ${item.sublabel}`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}

                {/* Icon Container with Badge */}
                <div className={`relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                  item.pulse
                    ? `${item.pulseClass} ${isActive ? 'bg-slate-900/60' : ''}`
                    : isActive
                    ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300'
                    : 'border-transparent text-slate-400 group-hover:text-cyan-400'
                }`}>
                  <Icon
                    size={16}
                    className={
                      item.pulse
                        ? 'text-current transition-colors'
                        : (isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400 transition-colors')
                    }
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
                        isActive 
                          ? 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.5)]' 
                          : item.pulse
                          ? 'text-cyan-300 font-bold [text-shadow:0_0_6px_rgba(34,211,238,0.6)]'
                          : 'text-slate-200 group-hover:text-white'
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

        {/* Bottom Action Section: Live Voice, Quick New Channel, Settings */}
        <div className="flex flex-col items-center gap-1 w-full pt-1.5 border-t border-slate-800/80 shrink-0">
          {/* Live Voice CommLink Quick-Action */}
          <button
            type="button"
            onClick={() => {
              if (!isPinned) {
                setIsHovered(false);
                setHoveredItem(null);
              }
              if (isVoiceConnected) {
                disconnectVoiceRoom();
              } else {
                const targetRoom = activeChannel ? `tangent_freq_${activeChannel.id}` : 'tangent_team_general';
                const targetName = activeChannel?.displayName || activeChannel?.name || 'HoloNet Voice Relay';
                connectToVoiceRoom(targetRoom, targetName);
              }
            }}
            className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 ${
              isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
            } ${
              isVoiceConnected
                ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-400'
                : isVoiceConnecting
                ? 'bg-amber-600 text-white border-amber-400 animate-pulse'
                : 'bg-slate-900/90 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border-slate-700/80'
            }`}
            title={isExpanded ? undefined : (
              isVoiceConnected
                ? `Disconnect Voice: ${currentRoomName}`
                : isVoiceConnecting
                ? 'Connecting Voice Comms...'
                : `Join Voice Freq: ${activeChannel?.displayName || 'General'}`
            )}
          >
            <div className="relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0">
              {isVoiceConnected ? (
                isMuted ? <MicOff size={16} className="text-rose-200" /> : <Mic size={16} />
              ) : (
                <Radio size={16} />
              )}
              {isVoiceConnected && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-soft-badge-glow" />
              )}
            </div>
            <div
              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider truncate leading-tight">
                  {isVoiceConnected ? 'LIVE VOICE' : isVoiceConnecting ? 'CONNECTING' : 'VOICE COMMS'}
                </span>
                {isVoiceConnected && (
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-400 text-black font-extrabold shrink-0">
                    ON AIR
                  </span>
                )}
              </div>
              <span className="text-[8.5px] text-slate-300/80 truncate font-mono leading-tight mt-0.5">
                {isVoiceConnected ? (currentRoomName || 'Connected') : isVoiceConnecting ? 'Dialing frequency...' : (activeChannel?.displayName || 'Join Channel')}
              </span>
            </div>
          </button>

          {/* New Channel Button */}
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
            className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 border-cyan-400/40 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] ${
              isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
            }`}
            title={isExpanded ? undefined : "Open New CommLink Frequency"}
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
                NEW CHANNEL
              </span>
              <span className="text-[8.5px] text-cyan-200/80 truncate font-mono leading-tight mt-0.5">
                Create Frequency
              </span>
            </div>
          </button>

          {/* Settings / Config Button */}
          <button
            type="button"
            onClick={() => handleSelectTab('settings')}
            className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 ${
              isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
            } ${
              activeNavTab === 'settings'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900 border-transparent'
            }`}
            title={isExpanded ? undefined : "Station Preferences & Audio"}
          >
            <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
              <Settings size={15} />
            </div>
            <div
              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider truncate leading-tight">
                CONFIG
              </span>
              <span className="text-[8.5px] text-slate-500 truncate font-mono leading-tight mt-0.5">
                Station Preferences
              </span>
            </div>
          </button>
        </div>

        {/* Topmost Portal Tooltip */}
        {hoveredItem && !isExpanded && typeof document !== 'undefined' && createPortal(
          <div
            role="tooltip"
            className="fixed pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-cyan-500/40 text-slate-100 font-mono text-[11px] font-bold whitespace-nowrap shadow-xl animate-in fade-in duration-100 hidden md:block select-none"
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
    </>
  );
};

export default CommsNavRail;
