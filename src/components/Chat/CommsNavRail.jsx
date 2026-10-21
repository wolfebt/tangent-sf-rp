import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Radio, 
  Users, 
  User,
  Sparkles,
  Shield, 
  Map, 
  Activity, 
  Settings, 
  Plus,
  Mic,
  MicOff,
  Pin,
  Globe,
  MessageSquare,
  ChevronDown,
  ChevronRight
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
    activeFreqBranch = 'all',
    setActiveFreqBranch,
    activeRosterBranch = 'all',
    setActiveRosterBranch,
    totalUnreadCount,
    unreadCounts = {},
    publicChannels = [],
    customChannels = [],
    playerDirectChannels = [],
    characterDirectChannels = [],
    hasUnseenMessages,
    hasNewOperatorLogins,
    newOperatorLogins,
    clearNewOperatorLogins,
    pendingCharacterNotes,
    userDirectory = [],
    onlineOperators = [],
    allNetworkPersonas = [],
    onlinePersonas = [],
    teamChannels = [],
    activeChannel
  } = useChat();

  const [freqsBranchesOpen, setFreqsBranchesOpen] = useState(true);
  const [rosterBranchesOpen, setRosterBranchesOpen] = useState(true);

  const onlineOperatorsCount = onlineOperators.length;
  const totalOperatorsCount = userDirectory.length || onlineOperatorsCount;
  const onlinePersonasCount = onlinePersonas.length;
  const totalPersonasCount = allNetworkPersonas.length || onlinePersonasCount;

  const holonetChannelsCount = (publicChannels?.length || 0) + (customChannels?.length || 0);
  const holonetUnreadCount = useMemo(() => {
    const pubUnread = (publicChannels || []).reduce((sum, c) => sum + (unreadCounts[c.id] || 0), 0);
    const custUnread = (customChannels || []).reduce((sum, c) => sum + (unreadCounts[c.id] || 0), 0);
    return pubUnread + custUnread;
  }, [publicChannels, customChannels, unreadCounts]);

  const directWhispersCount = useMemo(() => {
    const ids = new Set([
      ...(playerDirectChannels || []).map(c => c.id),
      ...(characterDirectChannels || []).map(c => c.id)
    ]);
    return ids.size;
  }, [playerDirectChannels, characterDirectChannels]);

  const directUnreadCount = useMemo(() => {
    const ids = new Set([
      ...(playerDirectChannels || []).map(c => c.id),
      ...(characterDirectChannels || []).map(c => c.id)
    ]);
    let sum = 0;
    ids.forEach(id => {
      sum += unreadCounts[id] || 0;
    });
    return sum;
  }, [playerDirectChannels, characterDirectChannels, unreadCounts]);

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
      setActiveRosterBranch?.('all');
    }
    if (tabId === 'matrix') {
      setActiveFreqBranch?.('all');
    }
    setActiveNavTab(tabId);
    if (!isPinned) {
      setIsHovered(false);
      setHoveredItem(null);
    }
  };

  const handleSelectFreqBranch = (branchKey, e) => {
    e?.stopPropagation?.();
    AudioService.playTerminalBeep(1200, 0.02);
    setActiveNavTab('matrix');
    setActiveFreqBranch?.(branchKey);
    if (!isPinned) {
      setIsHovered(false);
      setHoveredItem(null);
    }
  };

  const handleSelectRosterBranch = (branchKey, e) => {
    e?.stopPropagation?.();
    AudioService.playTerminalBeep(1200, 0.02);
    effectiveClearLogins?.();
    setActiveNavTab('roster');
    setActiveRosterBranch?.(branchKey);
    if (!isPinned) {
      setIsHovered(false);
      setHoveredItem(null);
    }
  };

  const navItems = [
    {
      id: 'matrix',
      label: 'FREQS',
      sublabel: 'HoloNet & Direct Whispers',
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
              <div key={item.id} className="flex flex-col w-full">
                <button
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
                      {item.id === 'matrix' && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            AudioService.playTerminalBeep(1050, 0.02);
                            setFreqsBranchesOpen(prev => !prev);
                          }}
                          className="p-0.5 rounded hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                          title={freqsBranchesOpen ? 'Collapse FREQS Branches' : 'Expand FREQS Branches'}
                        >
                          {freqsBranchesOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </span>
                      )}
                      {item.id === 'roster' && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            AudioService.playTerminalBeep(1050, 0.02);
                            setRosterBranchesOpen(prev => !prev);
                          }}
                          className="p-0.5 rounded hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                          title={rosterBranchesOpen ? 'Collapse ROSTER Branches' : 'Expand ROSTER Branches'}
                        >
                          {rosterBranchesOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400/80 truncate font-mono leading-tight mt-0.5">
                      {item.sublabel}
                    </span>
                  </div>
                </button>

                {/* Hierarchical Tree Branches under FREQS */}
                {item.id === 'matrix' && isExpanded && freqsBranchesOpen && (
                  <div className="ml-4 pl-2.5 border-l-2 border-cyan-500/35 mt-1 mb-0.5 space-y-1">
                    {/* Branch 1: HoloNet Frequencies */}
                    <button
                      type="button"
                      onClick={(e) => handleSelectFreqBranch('holonet', e)}
                      className={`relative w-full px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 text-left font-mono transition-all cursor-pointer border before:content-[''] before:absolute before:-left-2.5 before:top-1/2 before:w-2 before:h-[2px] before:bg-cyan-500/35 ${
                        isActive && activeFreqBranch === 'holonet'
                          ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 font-bold shadow-sm'
                          : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-cyan-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Globe size={12} className="text-cyan-400 shrink-0" />
                        <span className="text-[10px] truncate">HoloNet Frequencies</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-bold shrink-0 ${
                        holonetUnreadCount > 0
                          ? 'bg-amber-400 text-black'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {holonetUnreadCount > 0 ? `${holonetUnreadCount}!` : holonetChannelsCount}
                      </span>
                    </button>

                    {/* Branch 2: Direct Whispers */}
                    <button
                      type="button"
                      onClick={(e) => handleSelectFreqBranch('whispers', e)}
                      className={`relative w-full px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 text-left font-mono transition-all cursor-pointer border before:content-[''] before:absolute before:-left-2.5 before:top-1/2 before:w-2 before:h-[2px] before:bg-cyan-500/35 ${
                        isActive && activeFreqBranch === 'whispers'
                          ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 font-bold shadow-sm'
                          : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-purple-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MessageSquare size={12} className="text-purple-400 shrink-0" />
                        <span className="text-[10px] truncate">Direct Whispers</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-bold shrink-0 ${
                        directUnreadCount > 0
                          ? 'bg-amber-400 text-black'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {directUnreadCount > 0 ? `${directUnreadCount}!` : directWhispersCount}
                      </span>
                    </button>
                  </div>
                )}

                {/* Hierarchical Tree Branches under ROSTER */}
                {item.id === 'roster' && isExpanded && rosterBranchesOpen && (
                  <div className="ml-4 pl-2.5 border-l-2 border-cyan-500/35 mt-1 mb-0.5 space-y-1">
                    {/* Branch 1: Operators */}
                    <button
                      type="button"
                      onClick={(e) => handleSelectRosterBranch('operators', e)}
                      className={`relative w-full px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 text-left font-mono transition-all cursor-pointer border before:content-[''] before:absolute before:-left-2.5 before:top-1/2 before:w-2 before:h-[2px] before:bg-cyan-500/35 ${
                        isActive && activeRosterBranch === 'operators'
                          ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 font-bold shadow-sm'
                          : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-cyan-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User size={12} className="text-cyan-400 shrink-0" />
                        <span className="text-[10px] truncate">Operators</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-bold shrink-0 bg-cyan-500/20 text-cyan-300">
                        {onlineOperatorsCount}/{totalOperatorsCount}
                      </span>
                    </button>

                    {/* Branch 2: Personas */}
                    <button
                      type="button"
                      onClick={(e) => handleSelectRosterBranch('personas', e)}
                      className={`relative w-full px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 text-left font-mono transition-all cursor-pointer border before:content-[''] before:absolute before:-left-2.5 before:top-1/2 before:w-2 before:h-[2px] before:bg-cyan-500/35 ${
                        isActive && activeRosterBranch === 'personas'
                          ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 font-bold shadow-sm'
                          : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-purple-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Sparkles size={12} className="text-purple-400 shrink-0" />
                        <span className="text-[10px] truncate">Personas</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-bold shrink-0 bg-purple-500/20 text-purple-300">
                        {onlinePersonasCount}/{totalPersonasCount}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── ADD BUTTON SET DIRECTLY UNDER THE LIST ── */}
          <div className="pt-1 mt-0.5 border-t border-slate-800/70 flex flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1300, 0.03);
                if (!isPinned) {
                  setIsHovered(false);
                  setHoveredItem(null);
                }
                if (activeNavTab === 'teams' && (onOpenSquadModal || onOpenTeamModal)) {
                  (onOpenSquadModal || onOpenTeamModal)();
                } else if (onOpenCreateModal) {
                  onOpenCreateModal();
                } else if (onOpenSquadModal || onOpenTeamModal) {
                  (onOpenSquadModal || onOpenTeamModal)();
                }
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  item: {
                    label: activeNavTab === 'teams' ? 'COMMISSION TEAM' : 'NEW FREQUENCY / TEAM',
                    sublabel: activeNavTab === 'teams' ? 'Launch a New Tactical Team' : 'Create Frequency or Commission Team'
                  },
                  rect
                });
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group relative w-full h-9 rounded-xl flex items-center transition-all cursor-pointer select-none border border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/50 hover:bg-emerald-950/30 text-slate-400 hover:text-emerald-300 shrink-0 ${
                isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
              }`}
              title={isExpanded ? undefined : 'Create Frequency or Commission Team'}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-800 group-hover:border-emerald-500/40 bg-slate-950/60 group-hover:bg-emerald-950/40 transition-colors">
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200 text-emerald-400" />
              </div>
              <div
                className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                }`}
              >
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider truncate leading-tight text-emerald-300">
                  {activeNavTab === 'teams' ? 'NEW TEAM' : 'ADD RELAY'}
                </span>
                <span className="text-[8.5px] text-slate-400 truncate font-mono leading-tight mt-0.5">
                  {activeNavTab === 'teams' ? 'Commission Team' : 'New Freq or Team'}
                </span>
              </div>
            </button>

            {isExpanded && onOpenCreateModal && (onOpenSquadModal || onOpenTeamModal) && (
              <div className="grid grid-cols-2 gap-1 px-0.5">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1300, 0.02);
                    if (!isPinned) setIsHovered(false);
                    onOpenCreateModal();
                  }}
                  className="px-1.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={10} /> FREQ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1300, 0.02);
                    if (!isPinned) setIsHovered(false);
                    (onOpenSquadModal || onOpenTeamModal)();
                  }}
                  className="px-1.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={10} /> TEAM
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Section: Live Voice & Settings */}
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
