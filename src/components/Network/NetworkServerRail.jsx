import React, { useState, useMemo } from 'react';
import {
  Radio,
  Shield,
  Users,
  User,
  Sparkles,
  Map,
  Activity,
  Plus,
  HelpCircle,
  Pin,
  Globe,
  MessageSquare,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useSquad } from '../../context/SquadContext';
import { AudioService } from '../../services/audioService';

/**
 * @component NetworkServerRail
 * @description Consolidated Zone 1 Navigation Rail for the SOTA Gaming Comm Center.
 * Places FREQS, ROSTER, TEAMS, STAGE, and AUDIT directly under the top COMMLINK symbol,
 * with the '+' Add button set directly under the list.
 */
export const NetworkServerRail = ({
  activeContext,
  serverContext: serverContextProp,
  squads: squadsProp,
  onSelectContext,
  onSelectHolonet,
  onSelectSquad,
  onSelectDirectory,
  onOpenCreateChannel,
  onOpenCreateSquad,
  onOpenGuide
}) => {
  const {
    activeNavTab,
    setActiveNavTab,
    totalUnreadCount = 0,
    unreadCounts = {},
    publicChannels = [],
    customChannels = [],
    playerDirectChannels = [],
    characterDirectChannels = [],
    activeFreqBranch = 'all',
    setActiveFreqBranch,
    activeRosterBranch = 'all',
    setActiveRosterBranch,
    userDirectory = [],
    onlineOperators = [],
    allNetworkPersonas = [],
    onlinePersonas = [],
    hasNewOperatorLogins = false,
    newOperatorLogins = [],
    clearNewOperatorLogins
  } = useChat() || {};

  const {
    squads: ctxSquads = [],
    groups: ctxGroups = [],
    pendingInvites = []
  } = useSquad() || {};

  const serverContext = activeContext || serverContextProp || 'holonet';
  const squads = Array.isArray(squadsProp) && squadsProp.length > 0
    ? squadsProp
    : (ctxSquads.length > 0 ? ctxSquads : ctxGroups);
  const pendingInvitesCount = pendingInvites.length;
  const onlineOperatorsCount = onlineOperators.length;
  const totalOperatorsCount = userDirectory.length || onlineOperatorsCount;
  const onlinePersonasCount = onlinePersonas.length;
  const totalPersonasCount = allNetworkPersonas.length || onlinePersonasCount;

  const [freqsBranchesOpen, setFreqsBranchesOpen] = useState(true);
  const [rosterBranchesOpen, setRosterBranchesOpen] = useState(true);

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

  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('tangent_network_rail_pinned') === 'true';
    } catch {
      return false;
    }
  });

  const isExpanded = isPinned || isHovered;

  const togglePin = (e) => {
    e?.stopPropagation?.();
    const next = !isPinned;
    AudioService.playTerminalBeep(next ? 1250 : 950, 0.02);
    setIsPinned(next);
    try {
      localStorage.setItem('tangent_network_rail_pinned', String(next));
    } catch {}
  };

  const collapseIfUnpinned = () => {
    if (!isPinned) {
      setIsHovered(false);
    }
  };

  const handleSelectMode = (modeKey) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (modeKey === 'holonet') {
      setActiveNavTab?.('matrix');
      setActiveFreqBranch?.('all');
    } else if (modeKey === 'directory') {
      clearNewOperatorLogins?.();
      setActiveNavTab?.('roster');
      setActiveRosterBranch?.('all');
    } else if (modeKey === 'squad') {
      setActiveNavTab?.('teams');
    } else if (modeKey === 'stage') {
      setActiveNavTab?.(activeNavTab === 'vtt' ? 'matrix' : 'vtt');
    } else if (modeKey === 'audit') {
      setActiveNavTab?.(activeNavTab === 'logs' ? 'matrix' : 'logs');
    }

    collapseIfUnpinned();
    if (onSelectContext) {
      onSelectContext(modeKey);
      return;
    }
    if (modeKey === 'holonet' || modeKey === 'stage' || modeKey === 'audit') onSelectHolonet?.();
    else if (modeKey === 'squad') onSelectSquad?.(squads[0] || null);
    else if (modeKey === 'directory') onSelectDirectory?.();
  };

  const handleSelectFreqBranch = (branchKey, e) => {
    e?.stopPropagation?.();
    AudioService.playTerminalBeep(1200, 0.02);
    setActiveNavTab?.('matrix');
    setActiveFreqBranch?.(branchKey);
    collapseIfUnpinned();
    if (onSelectContext) {
      onSelectContext('holonet');
    } else {
      onSelectHolonet?.();
    }
  };

  const handleSelectRosterBranch = (branchKey, e) => {
    e?.stopPropagation?.();
    AudioService.playTerminalBeep(1200, 0.02);
    clearNewOperatorLogins?.();
    setActiveNavTab?.('roster');
    setActiveRosterBranch?.(branchKey);
    collapseIfUnpinned();
    if (onSelectContext) {
      onSelectContext('directory');
    } else {
      onSelectDirectory?.();
    }
  };

  const handleAddAction = () => {
    AudioService.playTerminalBeep(1300, 0.025);
    collapseIfUnpinned();
    if (serverContext === 'squad') {
      if (onOpenCreateSquad) onOpenCreateSquad();
      else if (onOpenCreateChannel) onOpenCreateChannel();
    } else {
      if (onOpenCreateChannel) onOpenCreateChannel();
      else if (onOpenCreateSquad) onOpenCreateSquad();
    }
  };

  // Determine which of the 5 items is currently active
  const resolvedActiveId = useMemo(() => {
    if (activeNavTab === 'vtt') return 'stage';
    if (activeNavTab === 'logs') return 'audit';
    if (serverContext === 'squad') return 'squad';
    if (serverContext === 'directory') return 'directory';
    return 'holonet';
  }, [serverContext, activeNavTab]);

  // Consolidated 5-item list under the Comms Symbol: FREQS, ROSTER, TEAMS, STAGE, AUDIT
  const navItems = [
    {
      id: 'holonet',
      label: 'FREQS',
      sublabel: 'Channels Matrix',
      icon: Radio,
      badge: totalUnreadCount > 0 ? (totalUnreadCount > 99 ? '99+' : totalUnreadCount) : null,
      badgeClass: 'bg-amber-400 text-black',
      pulse: totalUnreadCount > 0
    },
    {
      id: 'directory',
      label: 'ROSTER',
      sublabel: 'Operators & Personas',
      icon: Users,
      badge: onlineOperatorsCount > 0 ? onlineOperatorsCount : null,
      badgeClass: 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40',
      pulse: hasNewOperatorLogins
    },
    {
      id: 'squad',
      label: 'TEAMS',
      sublabel: 'Active Team Comms',
      icon: Shield,
      badge: pendingInvitesCount > 0 ? `${pendingInvitesCount}!` : (squads.length > 0 ? squads.length : null),
      badgeClass: pendingInvitesCount > 0 ? 'bg-amber-400 text-black' : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40',
      pulse: pendingInvitesCount > 0
    },
    {
      id: 'stage',
      label: 'STAGE',
      sublabel: 'Tactical Viewport',
      icon: Map,
      badge: null
    },
    {
      id: 'audit',
      label: 'AUDIT',
      sublabel: 'Persona Telemetry',
      icon: Activity,
      badge: null
    }
  ];

  return (
    <div className="relative h-full shrink-0 select-none z-30">
      {/* Desktop In-Flow Sizing Anchor (reserves 64px when unpinned, 240px when pinned) */}
      <div
        className={`hidden md:block shrink-0 h-full pointer-events-none transition-all duration-200 ease-out ${
          isPinned ? 'w-56 sm:w-60' : 'w-14 sm:w-16'
        }`}
        aria-hidden="true"
      />

      <aside
        aria-label="CommLink Consolidated Navigation Rail"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed md:absolute top-0 bottom-0 left-0 h-full bg-[#070a12]/98 backdrop-blur-xl border-r border-slate-800/90 flex flex-col justify-between py-2 px-1.5 select-none z-40 font-sans transition-all duration-200 ease-out ${
          isExpanded
            ? 'w-56 sm:w-60 shadow-[14px_0_40px_rgba(0,0,0,0.9)] border-slate-700/80'
            : 'w-14 sm:w-16 shadow-xl'
        }`}
      >
        {/* Top Section: Header Pin + Comms Symbol + Consolidated List (FREQS, ROSTER, TEAMS, STAGE, AUDIT) + Add Button */}
        <div className="flex flex-col items-stretch gap-1 w-full flex-1 min-h-0 overflow-y-auto no-scrollbar py-0.5">
          {/* Expanded Header with Pin Lock */}
          <div
            className={`w-full flex items-center justify-between px-2.5 py-1 mb-0.5 border-b border-cyan-500/20 shrink-0 transition-all duration-200 overflow-hidden ${
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
                title={isPinned ? 'Unpin Rail (Auto-collapse on exit)' : 'Pin Rail (Lock open)'}
              >
                <Pin size={11} className={`transition-transform duration-200 ${isPinned ? 'rotate-45 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`} />
              </button>
            </div>
          </div>

          {/* ── TOP COMMS SYMBOL (COMMLINK // Terminal Relay) ── */}
          <button
            type="button"
            onClick={() => handleSelectMode('holonet')}
            className={`group relative w-full h-10 sm:h-11 rounded-2xl flex items-center transition-all cursor-pointer border shrink-0 ${
              isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
            } ${
              totalUnreadCount > 0 && hasNewOperatorLogins
                ? 'animate-nav-pulse-hybrid'
                : totalUnreadCount > 0
                ? 'animate-nav-pulse-amber'
                : hasNewOperatorLogins
                ? 'animate-nav-pulse-emerald'
                : 'bg-gradient-to-br from-cyan-950/85 via-slate-900 to-blue-950/85 border-cyan-500/50 shadow-[0_0_14px_rgba(6,182,212,0.25)] hover:border-cyan-400'
            }`}
            title={
              isExpanded
                ? undefined
                : hasNewOperatorLogins && totalUnreadCount > 0
                ? 'Unseen Messages & New Operators Online'
                : hasNewOperatorLogins
                ? `New Operators Online: ${newOperatorLogins.map(o => o.userHandle || o.displayName).slice(0, 2).join(', ')}`
                : totalUnreadCount > 0
                ? `${totalUnreadCount} Unseen Messages`
                : 'CommLink Terminal Relay'
            }
          >
            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-cyan-500/40 bg-cyan-950/60">
              <Radio size={17} className="text-cyan-400" />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black ${
                  hasNewOperatorLogins ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                }`}
              />
            </div>

            <div
              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                isExpanded ? 'opacity-100 ml-2.5 max-w-[175px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight text-cyan-300">
                  COMMLINK
                </span>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold shrink-0">
                  LIVE
                </span>
              </div>
              <span className="text-[9px] text-slate-400 truncate font-mono leading-tight mt-0.5">
                Terminal Relay
              </span>
            </div>
          </button>

          <div className="w-full h-px bg-slate-800/70 my-0.5 shrink-0" />

          {/* ── CONSOLIDATED LIST UNDER COMMS SYMBOL: FREQS, ROSTER, TEAMS, STAGE, AUDIT ── */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = resolvedActiveId === item.id;

            return (
              <div key={item.id} className="flex flex-col w-full">
                <button
                  type="button"
                  onClick={() => handleSelectMode(item.id)}
                  className={`group relative w-full h-9 sm:h-9.5 rounded-xl flex items-center transition-all cursor-pointer select-none border shrink-0 ${
                    isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-950/40 text-cyan-200 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                  }`}
                  title={isExpanded ? undefined : `${item.label} • ${item.sublabel}`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}

                  <div
                    className={`relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isActive
                        ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300'
                        : 'border-transparent text-slate-400 group-hover:text-cyan-400'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400 transition-colors'} />
                    {!isExpanded && item.badge && (
                      <span
                        className={`absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full font-mono font-black text-[8px] flex items-center justify-center shadow-sm ${item.badgeClass}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.pulse && !item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-soft-badge-glow shadow-[0_0_6px_#f59e0b]" />
                    )}
                  </div>

                  <div
                    className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                      isExpanded ? 'opacity-100 ml-2.5 max-w-[175px]' : 'opacity-0 max-w-0 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span
                          className={`font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight ${
                            isActive
                              ? 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.5)]'
                              : 'text-slate-200 group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.id === 'holonet' && (
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
                        {item.id === 'directory' && (
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
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded-full font-mono font-bold text-[8.5px] shrink-0 ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400/80 truncate font-mono leading-tight mt-0.5">
                      {item.sublabel}
                    </span>
                  </div>
                </button>

                {/* Hierarchical Tree Branches under FREQS */}
                {item.id === 'holonet' && isExpanded && freqsBranchesOpen && (
                  <div className="ml-4 pl-2.5 border-l-2 border-cyan-500/35 mt-1 mb-0.5 space-y-1">
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
                {item.id === 'directory' && isExpanded && rosterBranchesOpen && (
                  <div className="ml-4 pl-2.5 border-l-2 border-cyan-500/35 mt-1 mb-0.5 space-y-1">
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

          <div className="w-full h-px bg-slate-800/70 my-0.5 shrink-0" />

          {/* ── '+' ADD BUTTON SET DIRECTLY UNDER THE LIST ── */}
          <div className="flex flex-col items-center w-full shrink-0 pt-0.5">
            <button
              type="button"
              onClick={handleAddAction}
              className={`group relative flex items-center transition-all duration-200 cursor-pointer border border-dashed ${
                isExpanded
                  ? 'w-full h-10 px-2 justify-start rounded-xl bg-slate-900/70 hover:bg-emerald-950/40 border-slate-700 hover:border-emerald-500/60 text-emerald-400'
                  : 'w-11 h-11 justify-center rounded-2xl hover:rounded-xl bg-slate-900/70 hover:bg-emerald-950/50 border-slate-700 hover:border-emerald-500/60 text-emerald-400'
              }`}
              title={
                isExpanded
                  ? undefined
                  : serverContext === 'squad'
                  ? 'Create or Join Tactical Team'
                  : 'Create New Frequency or Team'
              }
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>

              {isExpanded && (
                <div className="flex items-center justify-between flex-1 min-w-0 ml-2 text-left">
                  <div className="min-w-0">
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-emerald-300 block truncate leading-tight">
                      {serverContext === 'squad' ? 'NEW TEAM' : 'NEW FREQUENCY'}
                    </span>
                    <span className="text-[8.5px] text-slate-400 truncate font-mono block leading-tight mt-0.5">
                      {serverContext === 'squad' ? 'Create / Join Team' : 'Create Channel / Team'}
                    </span>
                  </div>
                </div>
              )}
            </button>

            {/* Quick dual-create pills when expanded so both + Freq and + Team are 1-click accessible */}
            {isExpanded && onOpenCreateChannel && onOpenCreateSquad && (
              <div className="grid grid-cols-2 gap-1 w-full mt-1">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1250, 0.02);
                    collapseIfUnpinned();
                    onOpenCreateChannel();
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 font-mono font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={10} />
                  <span>FREQ</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1250, 0.02);
                    collapseIfUnpinned();
                    onOpenCreateSquad();
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 font-mono font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={10} />
                  <span>TEAM</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Operations Guide */}
        <div className="pt-1.5 border-t border-slate-800/80 flex flex-col items-stretch w-full shrink-0">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.02);
              collapseIfUnpinned();
              onOpenGuide?.();
            }}
            className={`w-full h-9 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-cyan-300 flex items-center transition-colors cursor-pointer ${
              isExpanded ? 'px-2.5 justify-start gap-2' : 'justify-center'
            }`}
            title="Network Operations Guide"
          >
            <HelpCircle size={15} />
            {isExpanded && (
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                OPERATIONS GUIDE
              </span>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default NetworkServerRail;
