import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Shield, 
  User, 
  Circle, 
  ChevronDown, 
  ChevronRight, 
  Radio, 
  Sparkles,
  ExternalLink,
  Clock,
  UserCheck,
  Activity,
  Heart
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';
import { getEffectiveUserHandle } from '../../utils/personaValidationUtils';

export const NetworkRosterView = ({ isCompact = false }) => {
  const { 
    userDirectory = [], 
    onlineOperators = [], 
    offlineOperators = [], 
    allNetworkPersonas = [],
    onlinePersonas = [],
    offlinePersonas = [],
    startDirectMessage 
  } = useChat();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'operators' | 'personas'
  const [expandedOperators, setExpandedOperators] = useState({});

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
  };

  const handleMessagePersona = (user, persona) => {
    AudioService.playTerminalBeep(1400, 0.03);
    startDirectMessage(user, persona);
  };

  // Filter helper for search query
  const matchesSearch = (str) => {
    if (!searchQuery.trim()) return true;
    return (str || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const formatLastSeen = (user) => {
    if (user.isOnline) return 'Active Now';
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
      return matchesSearch(handle) || hasMatchingPersona;
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
    const isExpanded = expandedOperators[user.uid] ?? true; // default open
    const charList = Array.isArray(user.characters) ? user.characters : [];

    return (
      <div 
        key={user.uid}
        className={`p-2.5 rounded-xl border transition-all ${
          isOnline
            ? 'bg-slate-900/80 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}
      >
        {/* Operator Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => toggleOperatorExpand(user.uid)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 transition-colors"
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
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
                title={isOnline ? 'Online' : 'Offline'}
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
                <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                  isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-[9.5px] font-mono text-slate-500 truncate">
                {formatLastSeen(user)} • {charList.length} Persona{charList.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {/* Action: Direct Message Operator (Player DM) */}
          {!isSelf && (
            <button
              type="button"
              onClick={() => handleMessageOperator(user)}
              className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
              title={`Open Player Operator DM with @${handle} (${isOnline ? 'Online' : 'Offline'})`}
            >
              <MessageSquare size={11} />
              <span>DM PLAYER</span>
            </button>
          )}
        </div>

        {/* Nested Personas List for this Operator */}
        {isExpanded && charList.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5 pl-3">
            <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider block">
              OPERATIVE PERSONAS ({charList.length})
            </span>

            <div className="space-y-1">
              {charList.map(c => {
                const cId = c.id || c['character-doc-id'] || c.name;
                return (
                  <div 
                    key={cId}
                    className="p-1.5 px-2 rounded-lg bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-2 text-xs font-mono transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">🎭</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-purple-200 truncate">
                            {c.name}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate">
                            ({c.species} • {c.role})
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => handleMessagePersona(user, c)}
                        className="px-2 py-0.8 rounded-md bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 text-[9.5px] font-mono font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        title={`Send In-Character Direct Message to ${c.name} (${isOnline ? 'Online' : 'Offline'})`}
                      >
                        <Shield size={10} />
                        <span>DM OPERATIVE</span>
                      </button>
                    )}
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
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-bold truncate ${isOnline ? 'text-purple-200' : 'text-slate-300'}`}>
                {persona.name}
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
            <span className="text-[10px] text-slate-400 block truncate">
              {persona.species} • {persona.role}
            </span>
          </div>
        </div>

        {!isSelf && persona.targetUser && (
          <button
            type="button"
            onClick={() => handleMessagePersona(persona.targetUser, persona)}
            className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer"
            title={`Message ${persona.name} (${isOnline ? 'Online' : 'Offline'})`}
          >
            <Shield size={11} />
            <span>WHISPER</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0b1019] text-slate-100 select-none overflow-hidden font-sans border-r border-slate-800/80">
      {/* Top Header & Fast Search */}
      <div className="p-3 border-b border-slate-800 space-y-2.5 bg-gradient-to-b from-slate-900/90 to-transparent shrink-0">
        <div className="flex items-center justify-between">
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
        </div>

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
            { id: 'all', label: `ALL (${userDirectory.length})` },
            { id: 'operators', label: `OPERATORS (${userDirectory.length})` },
            { id: 'personas', label: `PERSONAS (${allNetworkPersonas.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setFilterMode(tab.id);
              }}
              className={`flex-1 py-1 rounded-md font-bold transition-all cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Roster List: Online at the Top Section! */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4 no-scrollbar">
        {/* ── SECTION 1: ONLINE OPERATORS & PERSONAS (TOP OF LIST) ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1.5 py-1 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE NETWORK ENTITIES</span>
            </span>
            <span className="text-[9px] text-emerald-400/90 font-bold">
              {filterMode === 'personas' ? filteredOnlinePersonas.length : filteredOnlineOperators.length} ACTIVE
            </span>
          </div>

          <div className="space-y-2">
            {filterMode === 'personas' ? (
              filteredOnlinePersonas.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[10.5px] font-mono text-slate-500 italic text-center">
                  No personas online right now.
                </div>
              ) : (
                filteredOnlinePersonas.map(renderPersonaCard)
              )
            ) : (
              filteredOnlineOperators.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[10.5px] font-mono text-slate-500 italic text-center">
                  No other operators online right now.
                </div>
              ) : (
                filteredOnlineOperators.map(u => renderOperatorCard(u, true))
              )
            )}
          </div>
        </div>

        {/* ── SECTION 2: OFFLINE OPERATORS & PERSONAS (BELOW) ── */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-1.5 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40 border border-slate-800 rounded-lg">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>OFFLINE NETWORK ENTITIES</span>
            </span>
            <span className="text-[9px] text-slate-500 font-bold">
              {filterMode === 'personas' ? filteredOfflinePersonas.length : filteredOfflineOperators.length} REGISTERED
            </span>
          </div>

          <div className="space-y-2">
            {filterMode === 'personas' ? (
              filteredOfflinePersonas.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[10.5px] font-mono text-slate-500 italic text-center">
                  No offline personas found.
                </div>
              ) : (
                filteredOfflinePersonas.map(renderPersonaCard)
              )
            ) : (
              filteredOfflineOperators.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[10.5px] font-mono text-slate-500 italic text-center">
                  No offline operators registered.
                </div>
              ) : (
                filteredOfflineOperators.map(u => renderOperatorCard(u, false))
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="p-2 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <span className="flex items-center gap-1">
          <Radio size={11} className="text-emerald-400 animate-pulse" />
          <span>REAL-TIME PRESENCE SYNC</span>
        </span>
        <span className="text-cyan-400 font-bold">DIRECT LINK READY</span>
      </div>
    </div>
  );
};

export default NetworkRosterView;
