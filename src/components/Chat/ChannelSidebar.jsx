import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hash, 
  MessageSquare, 
  Users, 
  Plus, 
  Globe, 
  Lock, 
  Search, 
  Trash2, 
  Sparkles, 
  Radio,
  UserPlus,
  Shield,
  Settings,
  Edit3,
  ChevronDown,
  ChevronRight,
  Activity, 
  FileText,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { useAuth } from '../../context/AuthContext';
import { useFolio } from '../../context/FolioContext';
import { AudioService } from '../../services/audioService';
import { ChannelSettingsModal } from './ChannelSettingsModal';

export const ChannelSidebar = ({ onOpenCreateModal, onOpenSquadModal, onOpenTeamModal, isCompact = false, defaultCategoryFilter = null }) => {
  const { 
    publicChannels = [], 
    directChannels = [], 
    playerDirectChannels = [],
    characterDirectChannels = [],
    teamChannels = [],
    directSortMode = 'alphabetical',
    setDirectSortMode,
    pendingCharacterNotes = [],
    groupChannels = [], 
    personaLogChannels = [],
    customChannels = [], 
    activeChannelId, 
    selectChannel, 
    unreadCounts = {},
    deleteChannel
  } = useChat();

  const { 
    isConnected: isVoiceConnected, 
    currentRoomName, 
    connectToVoiceRoom, 
    disconnectVoiceRoom 
  } = useVoiceChat();
  const { currentUser, isAdmin } = useAuth();
  const { personaRoster, roster } = useFolio();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(defaultCategoryFilter || 'all');
  const [settingsChannel, setSettingsChannel] = useState(null);

  useEffect(() => {
    if (defaultCategoryFilter) {
      setActiveCategoryFilter(defaultCategoryFilter);
    }
  }, [defaultCategoryFilter]);

  // Section collapse states (default open)
  const [collapsedSections, setCollapsedSections] = useState({
    teams: false,
    squads: false,
    logs: false,
    direct: false,
    directPlayers: false,
    directCharacters: false,
    public: false,
    custom: false
  });

  const toggleSection = (sectionKey) => {
    AudioService.playTerminalBeep(1050, 0.02);
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const filterChannels = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.displayName && c.displayName.toLowerCase().includes(q)) ||
      (c.topic && c.topic.toLowerCase().includes(q)) ||
      (c.personaName && c.personaName.toLowerCase().includes(q)) ||
      (c.targetPersona?.name && c.targetPersona.name.toLowerCase().includes(q)) ||
      (c.targetPlayer?.handle && c.targetPlayer.handle.toLowerCase().includes(q))
    );
  };

  const renderChannelItem = (channel) => {
    const isActive = activeChannelId === channel.id;
    const unread = unreadCounts[channel.id] || 0;
    const isCharacterDM = channel.recipientType === 'character' || Boolean(channel.targetPersona) || channel.id.startsWith('dm_char_');
    const isPlayerDM = channel.recipientType === 'player' || ((channel.type === 'direct' || channel.id.startsWith('dm_')) && !isCharacterDM);
    const isGroup = channel.type === 'group' || !!channel.groupId;
    const isPersonaLog = channel.type === 'persona_log' || channel.id.startsWith('persona_log_');
    const canDelete = !channel.id.startsWith('public_') && !isPersonaLog && (channel.createdById === currentUser?.uid || isAdmin);

    const charName = channel.targetPersona?.name || (isCharacterDM ? channel.displayName?.replace(/^🎭\s*/, '') : null);
    const charRole = channel.targetPersona?.role || channel.targetPersona?.species;
    const playerHandle = channel.targetPlayer?.handle;

    return (
      <div
        key={channel.id}
        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
          isActive 
            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-semibold' 
            : 'text-slate-300 hover:bg-slate-900/80 hover:text-slate-100 border border-transparent'
        }`}
        onClick={() => selectChannel(channel.id)}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Channel Icon */}
          <div className="shrink-0 transition-colors">
            {isPersonaLog ? (
              <div className={`p-1 rounded-md border ${isActive ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-900 text-amber-400/80 border-amber-500/30'}`}>
                <Activity size={12} />
              </div>
            ) : isCharacterDM ? (
              <div className={`p-1 rounded-md border ${isActive ? 'bg-purple-500/25 text-purple-300 border-purple-500/60' : 'bg-slate-900 text-purple-400/90 border-purple-500/40'}`} title="Operative Comms (In-Character)">
                <Shield size={12} className="text-purple-400" />
              </div>
            ) : isPlayerDM ? (
              <div className={`p-1 rounded-md border ${isActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-cyan-400/80 border-cyan-500/30'}`} title="Operator Comms (Player / OOC)">
                <UserPlus size={12} />
              </div>
            ) : isGroup ? (
              <div className={`p-1 rounded-md border ${isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-900 text-emerald-400/80 border-emerald-500/30'}`}>
                <Shield size={12} />
              </div>
            ) : (
              <div className={`p-1 rounded-md border ${isActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                <Hash size={12} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs truncate font-mono">
                {channel.displayName || `#${channel.name}`}
              </span>
              {isCharacterDM && (
                <span className="px-1 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[8px] rounded font-mono font-bold">
                  OPERATIVE
                </span>
              )}
              {isPlayerDM && (
                <span className="px-1 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[8px] rounded font-mono font-bold">
                  PLAYER
                </span>
              )}
              {isGroup && (
                <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] rounded font-mono font-bold">
                  {channel.characterMembers?.length ? `GROUP (${channel.characterMembers.length} CHARS)` : 'TEAM'}
                </span>
              )}
              {isPersonaLog && (
                <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] rounded font-mono font-bold">
                  AUDIT
                </span>
              )}
            </div>
            {isCharacterDM && (charRole || playerHandle) ? (
              <p className="text-[9px] text-slate-400 truncate mt-0.5">
                {charRole ? `${charRole} • ` : ''}@{playerHandle || 'operator'}
              </p>
            ) : isGroup && Array.isArray(channel.characterMembers) && channel.characterMembers.length > 0 ? (
              <p className="text-[9.5px] text-emerald-400/80 truncate mt-0.5 max-w-[170px]">
                👥 {channel.characterMembers.map(c => c.name).join(', ')}
              </p>
            ) : channel.lastMessage?.text ? (
              <p className="text-[9.5px] text-slate-500 truncate mt-0.5 max-w-[170px]">
                {channel.lastMessage.text}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right side: unread badge, settings gear, or delete option */}
        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {unread > 0 && (
            <span className="px-1.5 py-0.2 bg-cyan-500 text-black text-[9px] font-mono font-bold rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]">
              {unread}
            </span>
          )}

          {/* Quick Voice Frequency Connect / Disconnect */}
          {!isPersonaLog && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const targetRoom = `tangent_freq_${channel.id}`;
                if (isVoiceConnected && currentRoomName === targetRoom) {
                  disconnectVoiceRoom();
                } else {
                  connectToVoiceRoom(targetRoom, channel.displayName || channel.name);
                }
              }}
              className={`p-1 rounded transition-all cursor-pointer ${
                isVoiceConnected && currentRoomName === `tangent_freq_${channel.id}`
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'
                  : 'opacity-0 group-hover:opacity-100 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300'
              }`}
              title={
                isVoiceConnected && currentRoomName === `tangent_freq_${channel.id}`
                  ? 'Leave Voice Frequency'
                  : `Join Voice: ${channel.displayName || channel.name}`
              }
            >
              <Radio size={11} className={isVoiceConnected && currentRoomName === `tangent_freq_${channel.id}` ? 'animate-spin' : ''} />
            </button>
          )}

          {/* Quick Settings & Rename Button */}
          {!isPersonaLog && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                AudioService.playTerminalBeep(1100, 0.02);
                setSettingsChannel(channel);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
              title="Frequency Settings & Rename"
            >
              <Settings size={11} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete channel "${channel.displayName || channel.name}"?`)) {
                  deleteChannel(channel.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
              title="Delete Channel"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0b1019] border-r border-slate-800/80 text-slate-200 select-none">
      {/* Top Header & Fast Search */}
      <div className="p-3 border-b border-slate-800/80 space-y-2.5 bg-gradient-to-b from-slate-900/90 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Radio className="animate-pulse" size={14} />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase block">
                COMMLINK RELAY
              </span>
              <span className="text-[9.5px] font-mono text-cyan-400 block">
                QUANTUM FREQUENCIES
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-[11px] font-mono font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer"
            title="Create Custom Channel or Direct Message"
          >
            <Plus size={13} />
            <span>NEW</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter frequencies or operatives..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 text-[9.5px] font-mono">
          {[
            { id: 'all', label: 'ALL' },
            { id: 'teams', label: `TEAMS (${teamChannels.length})` },
            { id: 'players', label: `OPERATORS (${playerDirectChannels.length})` },
            { id: 'characters', label: `PERSONAS (${characterDirectChannels.length})` },
            { id: 'public', label: `HOLONET (${publicChannels.length})` },
            { id: 'logs', label: 'AUDIT' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setActiveCategoryFilter(chip.id);
              }}
              className={`px-2 py-0.8 rounded-md shrink-0 font-bold transition-all cursor-pointer ${
                activeCategoryFilter === chip.id
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Categories List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3.5 no-scrollbar">
        {/* ── Pending Transmissions Alert Note (Characters & Players) ── */}
        {pendingCharacterNotes && pendingCharacterNotes.length > 0 && (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-purple-950/60 to-slate-950/80 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Radio size={12} className="text-amber-400 animate-pulse" />
                <span>PENDING TRANSMISSIONS NOTE</span>
              </span>
              <span className="text-[9px] text-amber-400/80 uppercase font-bold">
                {pendingCharacterNotes.reduce((s, n) => s + n.count, 0)} UNREAD
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-mono">
              Unread comms waiting for operative personas &amp; operators:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {pendingCharacterNotes.map((note) => (
                <button
                  key={note.channelId}
                  type="button"
                  onClick={() => selectChannel(note.channelId)}
                  className={`px-2 py-0.8 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
                    note.type === 'character'
                      ? 'bg-purple-950/90 text-purple-200 border-purple-500/70 hover:bg-purple-900 hover:border-purple-400'
                      : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/70 hover:bg-cyan-900 hover:border-cyan-400'
                  }`}
                  title={`Open frequency: ${note.name} (${note.count} unread)`}
                >
                  <span>{note.type === 'character' ? '🎭' : '👤'}</span>
                  <span className="truncate max-w-[120px]">{note.name}</span>
                  <span className="px-1.5 py-0.2 bg-amber-400 text-black rounded-full text-[9px] font-black">
                    {note.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 1. Direct Comms: Separate Operator (Player) and Operative (Character) Frequencies */}
        {(activeCategoryFilter === 'all' || activeCategoryFilter === 'direct' || activeCategoryFilter === 'players' || activeCategoryFilter === 'characters') && (
          <div className="space-y-2">
            <div 
              onClick={() => toggleSection('direct')}
              className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {collapsedSections.direct ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <MessageSquare size={11} />
                <span>DIRECT COMMS MATRIX</span>
              </span>
              <div className="flex items-center gap-1.5">
                {/* Sort mode toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    AudioService.playTerminalBeep(1100, 0.02);
                    if (setDirectSortMode) {
                      setDirectSortMode(prev => prev === 'alphabetical' ? 'recent' : 'alphabetical');
                    }
                  }}
                  className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-slate-900 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                  title="Toggle Sorting: Alphabetical (A-Z) vs Recent Transmissions"
                >
                  SORT: {directSortMode === 'recent' ? 'RECENT' : 'A-Z'}
                </button>
                <span className="text-slate-500">{(playerDirectChannels.length + characterDirectChannels.length)}</span>
              </div>
            </div>

            {!collapsedSections.direct && (
              <div className="space-y-3 pl-1.5 border-l border-cyan-500/20 ml-2">
                {/* 1A. Character Operative Transmissions (IC) */}
                {(activeCategoryFilter === 'all' || activeCategoryFilter === 'direct' || activeCategoryFilter === 'characters') && (
                  <div className="space-y-1">
                    <div 
                      onClick={() => toggleSection('directCharacters')}
                      className="flex items-center justify-between px-1.5 py-0.8 text-[9.5px] font-mono font-bold text-purple-400 uppercase tracking-wider rounded hover:bg-slate-900/40 cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        {collapsedSections.directCharacters ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                        <span>🎭 OPERATIVE COMMS (CHARACTERS)</span>
                      </span>
                      <span className="text-slate-500 text-[9px]">{characterDirectChannels.length}</span>
                    </div>

                    {!collapsedSections.directCharacters && (
                      <div className="space-y-0.5 pl-1 border-l border-purple-500/20 ml-1.5">
                        {characterDirectChannels.length === 0 ? (
                          <div className="px-2.5 py-1 text-[10px] text-slate-500 font-mono italic">
                            No operative whispers open. Click NEW to message a character.
                          </div>
                        ) : (
                          filterChannels(characterDirectChannels).map(renderChannelItem)
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 1B. Player Operator Transmissions (OOC) */}
                {(activeCategoryFilter === 'all' || activeCategoryFilter === 'direct' || activeCategoryFilter === 'players') && (
                  <div className="space-y-1">
                    <div 
                      onClick={() => toggleSection('directPlayers')}
                      className="flex items-center justify-between px-1.5 py-0.8 text-[9.5px] font-mono font-bold text-cyan-300 uppercase tracking-wider rounded hover:bg-slate-900/40 cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        {collapsedSections.directPlayers ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                        <span>👤 OPERATOR COMMS (PLAYERS)</span>
                      </span>
                      <span className="text-slate-500 text-[9px]">{playerDirectChannels.length}</span>
                    </div>

                    {!collapsedSections.directPlayers && (
                      <div className="space-y-0.5 pl-1 border-l border-cyan-500/20 ml-1.5">
                        {playerDirectChannels.length === 0 ? (
                          <div className="px-2.5 py-1 text-[10px] text-slate-500 font-mono italic">
                            No player commlines open. Click NEW to direct message an operator.
                          </div>
                        ) : (
                          filterChannels(playerDirectChannels).map(renderChannelItem)
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Teams & Character Groups Channels */}
        {(activeCategoryFilter === 'all' || activeCategoryFilter === 'teams') && (
          <div className="space-y-1">
            <div 
              onClick={() => toggleSection('teams')}
              className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {collapsedSections.teams ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <Shield size={11} />
                <span>TEAM FREQUENCIES</span>
              </span>
              <span className="text-slate-500">{teamChannels.length}</span>
            </div>

            {activeCategoryFilter === 'teams' && (
              <div className="p-2 my-1 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-950/80 border border-emerald-500/30 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-emerald-300 truncate">
                  Tactical squads &amp; fireteams
                </span>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1150, 0.02);
                    navigate('/teams');
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[9.5px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  title="Open dedicated Teams & Squads page"
                >
                  <span>TEAMS PAGE</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            )}

            {!collapsedSections.teams && (
              <div className="space-y-0.5 pl-1.5 border-l border-emerald-500/20 ml-2">
                {teamChannels.length === 0 ? (
                  <div className="px-2.5 py-1 text-[10px] text-slate-500 font-mono italic">
                    No team frequencies enrolled. Click NEW &gt; TEAM GROUP to build a team frequency.
                  </div>
                ) : (
                  filterChannels(teamChannels).map(renderChannelItem)
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. Public Holonet Channels */}
        {(activeCategoryFilter === 'all' || activeCategoryFilter === 'public') && (
          <div className="space-y-1">
            <div 
              onClick={() => toggleSection('public')}
              className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {collapsedSections.public ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <Globe size={11} className="text-cyan-400" />
                <span>HOLONET FREQUENCIES</span>
              </span>
              <span className="text-slate-500">{publicChannels.length}</span>
            </div>

            {!collapsedSections.public && (
              <div className="space-y-0.5 pl-1.5 border-l border-slate-700/40 ml-2">
                {filterChannels(publicChannels).map(renderChannelItem)}
              </div>
            )}
          </div>
        )}

        {/* 5. Custom Channels */}
        {(activeCategoryFilter === 'all' || activeCategoryFilter === 'custom') && customChannels.length > 0 && (
          <div className="space-y-1">
            <div 
              onClick={() => toggleSection('custom')}
              className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {collapsedSections.custom ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <Users size={11} />
                <span>CUSTOM FREQUENCIES</span>
              </span>
              <span className="text-slate-500">{customChannels.length}</span>
            </div>

            {!collapsedSections.custom && (
              <div className="space-y-0.5 pl-1.5 border-l border-purple-500/20 ml-2">
                {filterChannels(customChannels).map(renderChannelItem)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status bar */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 font-bold">QUANTUM RELAY ACTIVE</span>
        </div>
        <span className="text-cyan-400/90 font-bold">AES-256</span>
      </div>

      {/* Channel Settings & Rename Modal */}
      {settingsChannel && (
        <ChannelSettingsModal
          isOpen={!!settingsChannel}
          onClose={() => setSettingsChannel(null)}
          channel={settingsChannel}
        />
      )}
    </div>
  );
};

export default ChannelSidebar;
