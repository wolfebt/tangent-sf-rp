import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Shield, 
  User, 
  ChevronDown, 
  ChevronRight, 
  Radio, 
  Activity,
  UserPlus
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';
import { AudioService } from '../../services/audioService';
import { getEffectiveUserHandle } from '../../utils/personaValidationUtils';
import { QuickTeamInviteModal } from './QuickTeamInviteModal';

const PRESENCE_BADGE = {
  online: {
    label: 'ONLINE',
    dot: 'bg-emerald-400 animate-soft-badge-glow shadow-[0_0_6px_#10b981]',
    pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  idle: {
    label: 'IDLE',
    dot: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
    pill: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  dnd: {
    label: 'DND',
    dot: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]',
    pill: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  },
  offline: {
    label: 'OFFLINE',
    dot: 'bg-slate-600',
    pill: 'bg-slate-800 text-slate-500 border-slate-700'
  }
};

const CHAR_PRESENCE_BADGE = {
  deployed: {
    label: 'DEPLOYED',
    dot: 'bg-emerald-400 animate-soft-badge-glow shadow-[0_0_6px_#10b981]',
    pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  on_call: {
    label: 'ON-CALL',
    dot: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
    pill: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  offline: {
    label: 'STASIS',
    dot: 'bg-slate-600',
    pill: 'bg-slate-800 text-slate-500 border-slate-700'
  }
};

export const NetworkRosterView = ({ isCompact = false, fullStageMode = false, onSelectChannel }) => {
  const { 
    userDirectory = [], 
    onlineOperators = [], 
    offlineOperators = [], 
    allNetworkPersonas = [],
    onlinePersonas = [],
    offlinePersonas = [],
    startDirectMessage,
    hasNewOperatorLogins = false,
    newOperatorLogins = [],
    clearNewOperatorLogins,
    allUserPersonas = [],
    togglePersonaNetworkEngaged,
    manualPresenceStatus = 'online',
    setManualPresenceStatus,
    customStatusMessage = '',
    setCustomStatusMessage
  } = useChat();
  const { currentUser } = useAuth();
  const { groups = [] } = useGroup() || {};

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedInviteUser, setSelectedInviteUser] = useState(null);
  const [inspectedOperator, setInspectedOperator] = useState(null);
  const [statusInput, setStatusInput] = useState(customStatusMessage || '');

  useEffect(() => {
    setStatusInput(customStatusMessage || '');
  }, [customStatusMessage]);

  useEffect(() => {
    // Auto-clear new operator login banner after viewing roster
    const timer = setTimeout(() => {
      clearNewOperatorLogins?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [clearNewOperatorLogins]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'operators' | 'personas'
  const [expandedOperators, setExpandedOperators] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    online: false,
    offline: true
  });

  const toggleSection = (key) => {
    AudioService.playTerminalBeep(1050, 0.02);
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleOperatorExpand = (uid) => {
    AudioService.playTerminalBeep(1050, 0.02);
    setExpandedOperators(prev => ({
      ...prev,
      [uid]: !prev[uid]
    }));
  };

  const handleMessageOperator = (user) => {
    AudioService.playTerminalBeep(1350, 0.03);
    startDirectMessage(user, null);
    onSelectChannel?.();
  };

  const handleMessagePersona = (user, persona) => {
    AudioService.playTerminalBeep(1400, 0.03);
    startDirectMessage(user, persona);
    onSelectChannel?.();
  };

  // Filter helper for search query
  const matchesSearch = (str) => {
    if (!searchQuery.trim()) return true;
    return (str || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const formatLastSeen = (user) => {
    if (user.isOnline) {
      if (user.activity?.label) return user.activity.label;
      return 'Active Now';
    }
    if (user.lastSeenText) return user.lastSeenText;
    if (user.lastSeen?.toDate) {
      return user.lastSeen.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (user.lastSeenLocal) {
      return new Date(user.lastSeenLocal).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return 'Offline';
  };

  // Filtered operators
  const filteredOnlineOperators = useMemo(() => {
    return onlineOperators.filter(u => {
      const handle = getEffectiveUserHandle(u);
      const hasMatchingPersona = Array.isArray(u.characters) && u.characters.some(c => 
        matchesSearch(c.name) || matchesSearch(c.role) || matchesSearch(c.species)
      );
      return matchesSearch(handle) || matchesSearch(u.statusMessage) || matchesSearch(u.activity?.label) || hasMatchingPersona;
    });
  }, [onlineOperators, searchQuery]);

  const filteredOfflineOperators = useMemo(() => {
    return offlineOperators.filter(u => {
      const handle = getEffectiveUserHandle(u);
      const hasMatchingPersona = Array.isArray(u.characters) && u.characters.some(c => 
        matchesSearch(c.name) || matchesSearch(c.role) || matchesSearch(c.species)
      );
      return matchesSearch(handle) || hasMatchingPersona;
    });
  }, [offlineOperators, searchQuery]);

  // Filtered personas
  const filteredOnlinePersonas = useMemo(() => {
    return onlinePersonas.filter(p => 
      matchesSearch(p.name) || matchesSearch(p.role) || matchesSearch(p.species) || matchesSearch(p.ownerHandle)
    );
  }, [onlinePersonas, searchQuery]);

  const filteredOfflinePersonas = useMemo(() => {
    return offlinePersonas.filter(p => 
      matchesSearch(p.name) || matchesSearch(p.role) || matchesSearch(p.species) || matchesSearch(p.ownerHandle)
    );
  }, [offlinePersonas, searchQuery]);

  const renderOperatorCard = (user, isOnline) => {
    const isSelf = currentUser && currentUser.uid === user.uid;
    const handle = getEffectiveUserHandle(user);
    const isExpanded = expandedOperators[user.uid] ?? false;
    const charList = isSelf 
      ? (allUserPersonas.length > 0 ? allUserPersonas : (Array.isArray(user.characters) ? user.characters : []))
      : (Array.isArray(user.characters) ? user.characters : []);
    const engagedCount = isSelf 
      ? charList.filter(p => p.networkEngaged || p.isNetworkEngaged).length 
      : charList.length;

    const pState = isOnline ? (user.presenceState || 'online') : 'offline';
    const badge = PRESENCE_BADGE[pState] || PRESENCE_BADGE.offline;
    const isInspected = fullStageMode && inspectedOperator?.uid === user.uid;

    return (
      <div 
        key={user.uid}
        onClick={() => {
          if (fullStageMode) {
            setInspectedOperator(user);
          }
        }}
        className={`p-2.5 rounded-xl border transition-all ${
          fullStageMode ? 'cursor-pointer' : ''
        } ${
          isInspected
            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
            : isOnline
            ? 'bg-slate-900/80 border-emerald-500/40 hover:border-emerald-400/70 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
        }`}
      >
        {/* Operator Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => toggleOperatorExpand(user.uid)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
              title="Expand/Collapse Personas"
            >
              {charList.length > 0 ? (
                isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
              ) : (
                <User size={14} className={isOnline ? 'text-emerald-400' : 'text-slate-500'} />
              )}
            </button>

            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-200">
                {handle.substring(0, 2).toUpperCase()}
              </div>
              <span 
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${badge.dot}`}
                title={badge.label}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-mono font-bold truncate ${isOnline ? 'text-slate-100' : 'text-slate-300'}`}>
                  @{handle}
                </span>
                {isSelf && (
                  <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[8.5px] rounded font-mono font-bold">
                    YOU
                  </span>
                )}
                <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border font-bold ${badge.pill}`}>
                  {badge.label}
                </span>
              </div>

              {user.statusMessage && (
                <p className="text-[9.5px] font-sans italic text-cyan-300/90 truncate">
                  "{user.statusMessage}"
                </p>
              )}

              <p className="text-[9.5px] font-mono text-slate-400 truncate flex items-center gap-1">
                {isOnline && user.activity?.label && (
                  <Activity size={9} className="text-cyan-400 shrink-0" />
                )}
                <span className="truncate">{formatLastSeen(user)}</span>
                <span>•</span>
                <span className="shrink-0">
                  {isSelf ? `${engagedCount}/${charList.length} Engaged` : `${charList.length} Persona${charList.length === 1 ? '' : 's'}`}
                </span>
              </p>
            </div>
          </div>

          {/* Action: Direct Message Operator & Invite to Squad */}
          {!isSelf && (
            <div className="flex items-center gap-1 shrink-0">
              {groups.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInviteUser(user);
                    setIsInviteModalOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                  title={`Invite @${handle} to Tactical Squad`}
                >
                  <UserPlus size={11} />
                  <span>INVITE</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleMessageOperator(user)}
                className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 text-[10px] font-mono font-bold flex items-center gap-1 transition-all shadow-sm shrink-0 cursor-pointer"
                title={`Open Player Operator DM with @${handle} (${badge.label})`}
              >
                <MessageSquare size={11} />
                <span>DM</span>
              </button>
            </div>
          )}
        </div>

        {/* Nested Personas List for this Operator */}
        {isExpanded && charList.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5 pl-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider block">
                {isSelf ? `YOUR PERSONAS (${engagedCount} of ${charList.length} Network-Engaged)` : `PERSONAS (${charList.length})`}
              </span>
              {isSelf && (
                <span className="text-[8.5px] font-mono text-slate-500 hidden sm:inline">
                  Flag personas to engage the network
                </span>
              )}
            </div>

            <div className="space-y-1">
              {charList.map(c => {
                const cId = c.id || c['character-doc-id'] || c.name;
                const isEngaged = Boolean(c.networkEngaged ?? c.isNetworkEngaged);
                return (
                  <div 
                    key={cId}
                    className={`p-1.5 px-2 rounded-lg border flex items-center justify-between gap-2 text-xs font-mono transition-colors ${
                      isEngaged
                        ? 'bg-purple-950/20 hover:bg-purple-950/40 border-purple-500/40'
                        : 'bg-slate-950/40 hover:bg-slate-900/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">🎭</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-bold truncate ${isEngaged ? 'text-purple-200' : 'text-slate-400'}`}>
                            {c.name}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate">
                            ({c.species} • {c.role})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelf ? (
                        <button
                          type="button"
                          onClick={() => togglePersonaNetworkEngaged && togglePersonaNetworkEngaged(cId, !isEngaged)}
                          className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border ${
                            isEngaged
                              ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-300'
                          }`}
                          title={
                            isEngaged
                              ? "Network Engaged: Visible to other operators on the network. Click to disengage and make private."
                              : "Standby: Private to you. Click to engage and broadcast to the network."
                          }
                        >
                          <Radio size={10} className={isEngaged ? "text-emerald-400 animate-soft-back-glow" : "text-slate-500"} />
                          <span>{isEngaged ? 'ENGAGED' : 'STANDBY'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMessagePersona(user, c)}
                          className="px-2 py-0.8 rounded-md bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 text-[9.5px] font-mono font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                          title={`Send In-Character Direct Message to ${c.name} (${isOnline ? 'Online' : 'Offline'})`}
                        >
                          <Shield size={10} />
                          <span>DM PERSONA</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPersonaCard = (persona) => {
    const isSelf = currentUser && currentUser.uid === persona.ownerUid;
    const isOnline = Boolean(persona.isOnline);
    const charPresence = persona.characterPresence || (isOnline ? 'on_call' : 'offline');
    const cBadge = CHAR_PRESENCE_BADGE[charPresence] || CHAR_PRESENCE_BADGE.offline;
    const squads = Array.isArray(persona.enrolledSquads) ? persona.enrolledSquads : [];

    return (
      <div 
        key={persona.id || persona.name}
        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-mono transition-all ${
          isOnline
            ? 'bg-slate-900/80 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.1)]'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-950 to-slate-900 border border-purple-500/40 flex items-center justify-center text-sm">
              🎭
            </div>
            <span 
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${cBadge.dot}`}
              title={cBadge.label}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-bold truncate ${isOnline ? 'text-purple-200' : 'text-slate-300'}`}>
                {persona.name}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${cBadge.pill}`}>
                {cBadge.label}
              </span>
              <span className="text-[9.5px] text-slate-400 truncate">
                by @{persona.ownerHandle}
              </span>
              {isSelf && (
                <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[8px] rounded font-bold">
                  YOURS
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-[10px] text-slate-400 truncate">
                {persona.species} • {persona.role}
              </span>
              {squads.map(sq => (
                <span
                  key={sq.id}
                  className="px-1.5 py-0.1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[8.5px] font-bold"
                >
                  🛡 {sq.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {isSelf && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                const pId = persona.id || persona['character-doc-id'];
                if (pId) togglePersonaNetworkEngaged && togglePersonaNetworkEngaged(pId);
              }}
              className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
              title="Network Engaged. Click to disengage."
            >
              <Radio size={10} className="text-emerald-400 animate-soft-back-glow" />
              <span>ENGAGED</span>
            </button>
          </div>
        )}

        {!isSelf && persona.targetUser && (
          <div className="flex items-center gap-1 shrink-0">
            {groups.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedInviteUser(persona.targetUser);
                  setIsInviteModalOpen(true);
                }}
                className="px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                title="Invite to Tactical Squad"
              >
                <UserPlus size={11} />
                <span>INVITE</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleMessagePersona(persona.targetUser, persona)}
              className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title={`Message ${persona.name} (${cBadge.label})`}
            >
              <Shield size={11} />
              <span>WHISPER</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0b1019] text-slate-100 select-none overflow-hidden font-sans border-r border-slate-800/80">
      {/* Top Header & Fast Search */}
      <div className="p-3 border-b border-slate-800 space-y-2.5 bg-gradient-to-b from-slate-900/90 to-transparent shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <Users size={15} />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-100 block">
                NETWORK ROSTER
              </h3>
              <span className="text-[9.5px] font-mono text-emerald-400 block">
                {onlineOperators.length} OPERATORS ACTIVE NOW
              </span>
            </div>
          </div>

          {/* Operator Self-Status Selector */}
          {currentUser && setManualPresenceStatus && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['online', 'idle', 'dnd']).map(st => {
                const cfg = PRESENCE_BADGE[st];
                const active = manualPresenceStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1200, 0.02);
                      setManualPresenceStatus(st);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      active ? cfg.pill + ' border' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={`Set your Operator Presence to ${cfg.label}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Operator Status Note Input */}
        {currentUser && setCustomStatusMessage && (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              onBlur={() => setCustomStatusMessage(statusInput.trim())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              maxLength={60}
              placeholder="Set custom status note (e.g. LFG Sector 7 / AFK 5m)..."
              className="w-full px-2.5 py-1 bg-slate-950/70 border border-slate-800/90 rounded-lg text-[10.5px] font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        )}

        {/* New Operator Login Alert Banner */}
        {hasNewOperatorLogins && newOperatorLogins.length > 0 && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-[10.5px] font-mono animate-soft-back-glow shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-soft-badge-glow shadow-[0_0_6px_#10b981] shrink-0" />
              <span className="font-bold truncate">
                OPERATOR CHECK-IN: {newOperatorLogins.map(o => `@${o.userHandle}`).join(', ')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => clearNewOperatorLogins?.()}
              className="text-emerald-300 hover:text-white px-2 py-0.5 rounded bg-emerald-800/60 hover:bg-emerald-700/80 text-[9px] font-bold border border-emerald-500/40 cursor-pointer shrink-0 ml-2"
            >
              ACKNOWLEDGE
            </button>
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operators, personas, roles..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 text-[9.5px] font-mono">
          {[
            { id: 'all', label: `ALL (${userDirectory.length})`, shortLabel: `ALL (${userDirectory.length})` },
            { id: 'operators', label: `OPERATORS (${userDirectory.length})`, shortLabel: `OPS (${userDirectory.length})` },
            { id: 'personas', label: `PERSONAS (${allNetworkPersonas.length})`, shortLabel: `FOLIO (${allNetworkPersonas.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setFilterMode(tab.id);
              }}
              className={`flex-1 py-1 px-1 rounded-md font-bold transition-all cursor-pointer truncate text-center ${
                filterMode === tab.id
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Roster Body (Grid + Optional Right Dossier Inspector in fullStageMode) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left/Center Scrollable Entity Grid */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-4 no-scrollbar">
          {/* ── SECTION 1: ONLINE OPERATORS & PERSONAS (TOP OF LIST) ── */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => toggleSection('online')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer text-left"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-soft-badge-glow shadow-[0_0_6px_#10b981]" />
                <span>ONLINE NETWORK ENTITIES</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[9px] text-emerald-400/90 font-bold">
                  {filterMode === 'personas' ? filteredOnlinePersonas.length : filteredOnlineOperators.length} ACTIVE
                </span>
                <ChevronDown 
                  size={12} 
                  className={`transition-transform duration-200 text-emerald-400 ${collapsedSections.online ? '-rotate-90' : ''}`} 
                />
              </span>
            </button>

            {!collapsedSections.online && (
              <div className={fullStageMode ? 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2.5' : 'space-y-2'}>
                {filterMode === 'personas' ? (
                  filteredOnlinePersonas.length === 0 ? (
                    <div className="col-span-full p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-[10.5px] font-mono text-slate-500 italic text-center">
                      No personas online right now.
                    </div>
                  ) : (
                    filteredOnlinePersonas.map(renderPersonaCard)
                  )
                ) : (
                  filteredOnlineOperators.length === 0 ? (
                    <div className="col-span-full p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-[10.5px] font-mono text-slate-500 italic text-center">
                      No other operators online right now.
                    </div>
                  ) : (
                    filteredOnlineOperators.map(u => renderOperatorCard(u, true))
                  )
                )}
              </div>
            )}
          </div>

          {/* ── SECTION 2: OFFLINE OPERATORS & PERSONAS (BELOW) ── */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => toggleSection('offline')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-mono font-bold text-slate-400 hover:text-slate-300 uppercase tracking-wider bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 rounded-lg transition-colors cursor-pointer text-left"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>OFFLINE NETWORK ENTITIES</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-500 font-bold">
                  {filterMode === 'personas' ? filteredOfflinePersonas.length : filteredOfflineOperators.length} REGISTERED
                </span>
                <ChevronDown 
                  size={12} 
                  className={`transition-transform duration-200 text-slate-500 ${collapsedSections.offline ? '-rotate-90' : ''}`} 
                />
              </span>
            </button>

            {!collapsedSections.offline && (
              <div className={fullStageMode ? 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2.5' : 'space-y-2'}>
                {filterMode === 'personas' ? (
                  filteredOfflinePersonas.length === 0 ? (
                    <div className="col-span-full p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-[10.5px] font-mono text-slate-500 italic text-center">
                      No offline personas found.
                    </div>
                  ) : (
                    filteredOfflinePersonas.map(renderPersonaCard)
                  )
                ) : (
                  filteredOfflineOperators.length === 0 ? (
                    <div className="col-span-full p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-[10.5px] font-mono text-slate-500 italic text-center">
                      No offline operators registered.
                    </div>
                  ) : (
                    filteredOfflineOperators.map(u => renderOperatorCard(u, false))
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right-Hand Operator & Persona Dossier Inspector (Full Stage Mode on Desktop) */}
        {fullStageMode && (
          <aside className="hidden lg:flex w-[320px] shrink-0 border-l border-slate-800/90 bg-slate-950/90 flex-col overflow-y-auto p-4 space-y-4 font-mono">
            {inspectedOperator ? (() => {
              const handle = getEffectiveUserHandle(inspectedOperator);
              const isSelf = currentUser && currentUser.uid === inspectedOperator.uid;
              const isOnline = Boolean(inspectedOperator.isOnline);
              const pState = isOnline ? (inspectedOperator.presenceState || 'online') : 'offline';
              const badge = PRESENCE_BADGE[pState] || PRESENCE_BADGE.offline;
              const charList = isSelf
                ? (allUserPersonas.length > 0 ? allUserPersonas : (Array.isArray(inspectedOperator.characters) ? inspectedOperator.characters : []))
                : (Array.isArray(inspectedOperator.characters) ? inspectedOperator.characters : []);

              return (
                <>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/40 flex items-center justify-center font-bold text-sm text-cyan-200">
                          {handle.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${badge.dot}`} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">@{handle}</h4>
                        <span className={`inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded border font-bold ${badge.pill}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {inspectedOperator.statusMessage && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-sans italic text-cyan-200">
                      "{inspectedOperator.statusMessage}"
                    </div>
                  )}

                  <div className="space-y-1 text-[10.5px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">TELEMETRY:</span>
                      <span className="text-slate-200 font-bold">{formatLastSeen(inspectedOperator)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">REGISTERED PERSONAS:</span>
                      <span className="text-purple-300 font-bold">{charList.length}</span>
                    </div>
                  </div>

                  {/* Direct Actions */}
                  {!isSelf && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleMessageOperator(inspectedOperator)}
                        className="py-2 px-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <MessageSquare size={12} />
                        <span>PLAYER DM</span>
                      </button>
                      {groups.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInviteUser(inspectedOperator);
                            setIsInviteModalOpen(true);
                          }}
                          className="py-2 px-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <UserPlus size={12} />
                          <span>SQUAD INVITE</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Registered Folio Personas */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                      REGISTERED FOLIO PERSONAS ({charList.length})
                    </span>
                    {charList.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[10px] text-slate-500 italic">
                        No public personas broadcast by this operator.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {charList.map(c => {
                          const cId = c.id || c['character-doc-id'] || c.name;
                          return (
                            <div key={cId} className="p-2.5 rounded-xl bg-slate-900/70 border border-purple-500/30 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-purple-200 block truncate">🎭 {c.name}</span>
                                  <span className="text-[9.5px] text-slate-400 block truncate">{c.species} • {c.role}</span>
                                </div>
                                {!isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => handleMessagePersona(inspectedOperator, c)}
                                    className="px-2 py-1 rounded-lg bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-100 text-[9.5px] font-bold shrink-0 cursor-pointer"
                                  >
                                    WHISPER IC
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              );
            })() : (
              <div className="my-auto text-center space-y-2 p-4">
                <Users size={28} className="mx-auto text-cyan-500/40" />
                <p className="text-xs font-bold text-slate-300">OPERATOR DOSSIER INSPECTOR</p>
                <p className="text-[10.5px] text-slate-500 font-sans leading-relaxed">
                  Select any Operator card on the left to inspect their live telemetry, registered Folio Personas, and initiate direct OOC or In-Character Whispers.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Bottom Status bar */}
      <div className="p-2 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <span className="flex items-center gap-1">
          <Radio size={11} className="text-emerald-400 animate-soft-back-glow" />
          <span>REAL-TIME PRESENCE SYNC</span>
        </span>
        <span className="text-cyan-400 font-bold">DIRECT LINK READY</span>
      </div>

      {/* Quick Team Invite Modal */}
      {isInviteModalOpen && (
        <QuickTeamInviteModal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setSelectedInviteUser(null);
          }}
          preselectedUser={selectedInviteUser}
        />
      )}
    </div>
  );
};

export default NetworkRosterView;
