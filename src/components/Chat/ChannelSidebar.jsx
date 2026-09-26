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
  Radio,
  UserPlus, 
  Shield, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Activity,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';
import { AudioService } from '../../services/audioService';
import { ChannelSettingsModal } from './ChannelSettingsModal';
import { QuickTeamInviteModal } from './QuickTeamInviteModal';

/**
 * @component ChannelSidebar
 * @description Flat 3-Section Comms Directory (Organization A):
 * 1. DIRECT COMMS (Player Commlines & Character Whispers)
 * 2. TACTICAL TEAMS (Enrolled Squads & Quick Invites)
 * 3. HOLONET RELAYS (Public Community Channels)
 */
export const ChannelSidebar = ({ 
  onOpenCreateModal, 
  onOpenSquadModal, 
  onOpenTeamModal, 
  isCompact = false 
}) => {
  const { 
    publicChannels = [], 
    directChannels = [], 
    playerDirectChannels = [],
    characterDirectChannels = [],
    teamChannels = [],
    groupChannels = [],
    personaLogChannels = [],
    activeChannelId, 
    selectChannel, 
    unreadCounts = {},
    deleteChannel,
    pendingCharacterNotes = []
  } = useChat();

  const { 
    isConnected: isVoiceConnected, 
    currentRoomName, 
    connectToVoiceRoom, 
    disconnectVoiceRoom 
  } = useVoiceChat();
  const { currentUser, isAdmin } = useAuth();
  const { groups = [] } = useGroup() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [settingsChannel, setSettingsChannel] = useState(null);
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
  const [selectedInviteGroupId, setSelectedInviteGroupId] = useState(null);

  // Flat 3-Section collapse state
  const [collapsedSections, setCollapsedSections] = useState({
    direct: false,
    teams: false,
    public: false,
    audit: true
  });

  const toggleSection = (sectionKey) => {
    AudioService.playTerminalBeep(1050, 0.02);
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Combine player and character direct channels into a single sorted list
  const allDirectChannels = useMemo(() => {
    const list = [...playerDirectChannels, ...characterDirectChannels];
    const seen = new Set();
    const unique = [];
    list.forEach(c => {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        unique.push(c);
      }
    });

    // Sort by unread first, then recent message timestamp, then display name
    return unique.sort((a, b) => {
      const unreadA = unreadCounts[a.id] || 0;
      const unreadB = unreadCounts[b.id] || 0;
      if (unreadA !== unreadB) return unreadB - unreadA;

      const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;

      return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
    });
  }, [playerDirectChannels, characterDirectChannels, unreadCounts]);

  // Filter channels based on search
  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.displayName && c.displayName.toLowerCase().includes(q)) ||
      (c.topic && c.topic.toLowerCase().includes(q)) ||
      (c.targetPersona?.name && c.targetPersona.name.toLowerCase().includes(q)) ||
      (c.targetPlayer?.handle && c.targetPlayer.handle.toLowerCase().includes(q))
    );
  };

  const filteredDirect = filterList(allDirectChannels);
  const filteredTeams = filterList(teamChannels);
  const filteredPublic = filterList(publicChannels);
  const filteredAudit = filterList(personaLogChannels);

  const renderChannelItem = (channel) => {
    const isActive = activeChannelId === channel.id;
    const unread = unreadCounts[channel.id] || 0;
    const isCharacterDM = channel.recipientType === 'character' || Boolean(channel.targetPersona) || channel.id.startsWith('dm_char_');
    const isPlayerDM = channel.recipientType === 'player' || ((channel.type === 'direct' || channel.id.startsWith('dm_')) && !isCharacterDM);
    const isGroup = channel.type === 'group' || !!channel.groupId;
    const isPersonaLog = channel.type === 'persona_log' || channel.id.startsWith('persona_log_');
    const canDelete = !channel.id.startsWith('public_') && !isPersonaLog && (channel.createdById === currentUser?.uid || isAdmin);

    const charRole = channel.targetPersona?.role || channel.targetPersona?.species;
    const playerHandle = channel.targetPlayer?.handle;

    // Left border indicator for active channel
    const activeBorderClass = isActive 
      ? (isCharacterDM 
          ? 'bg-purple-950/40 border-l-4 border-l-purple-400 border-y border-r border-purple-500/40 text-purple-100 shadow-sm'
          : isGroup
          ? 'bg-emerald-950/40 border-l-4 border-l-emerald-400 border-y border-r border-emerald-500/40 text-emerald-100 shadow-sm'
          : 'bg-cyan-950/40 border-l-4 border-l-cyan-400 border-y border-r border-cyan-500/40 text-cyan-100 shadow-sm')
      : 'text-slate-300 hover:bg-slate-900/70 hover:text-slate-100 border border-transparent';

    return (
      <div
        key={channel.id}
        onClick={() => selectChannel(channel.id)}
        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${activeBorderClass}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Channel Icon */}
          <div className="shrink-0">
            {isPersonaLog ? (
              <div className={`p-1 rounded ${isActive ? 'bg-amber-500/20 text-amber-300' : 'text-amber-400/80'}`}>
                <Activity size={13} />
              </div>
            ) : isCharacterDM ? (
              <div className={`p-1 rounded ${isActive ? 'bg-purple-500/25 text-purple-300' : 'text-purple-400'}`}>
                <span className="text-xs">🎭</span>
              </div>
            ) : isPlayerDM ? (
              <div className={`p-1 rounded ${isActive ? 'bg-cyan-500/25 text-cyan-300' : 'text-cyan-400'}`}>
                <UserPlus size={13} />
              </div>
            ) : isGroup ? (
              <div className={`p-1 rounded ${isActive ? 'bg-emerald-500/25 text-emerald-300' : 'text-emerald-400'}`}>
                <Shield size={13} />
              </div>
            ) : (
              <div className={`p-1 rounded ${isActive ? 'bg-cyan-500/25 text-cyan-300' : 'text-slate-400'}`}>
                <Hash size={13} />
              </div>
            )}
          </div>

          {/* Name & Snippet */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs truncate font-mono font-bold">
                {channel.displayName || `#${channel.name}`}
              </span>

              {isCharacterDM && (
                <span className="px-1 py-0.1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[8px] rounded font-mono font-bold uppercase">
                  PERSONA
                </span>
              )}
              {isPlayerDM && (
                <span className="px-1 py-0.1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[8px] rounded font-mono font-bold uppercase">
                  OPERATOR
                </span>
              )}
              {isGroup && (
                <span className="px-1 py-0.1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] rounded font-mono font-bold uppercase">
                  SQUAD
                </span>
              )}
            </div>

            {isCharacterDM && (charRole || playerHandle) ? (
              <p className="text-[9.5px] text-slate-400 truncate mt-0.5">
                {charRole ? `${charRole} • ` : ''}@{playerHandle || 'operator'}
              </p>
            ) : channel.lastMessage?.text ? (
              <p className="text-[9.5px] text-slate-500 truncate mt-0.5 max-w-[170px]">
                {channel.lastMessage.text}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right side: unread counter, settings, or delete */}
        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {unread > 0 && (
            <span className="px-1.5 py-0.2 bg-cyan-400 text-black text-[9px] font-mono font-black rounded-full shadow-sm">
              {unread}
            </span>
          )}

          {/* Voice Frequency Action */}
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
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 shadow-sm animate-pulse'
                  : 'opacity-0 group-hover:opacity-100 hover:bg-slate-800 text-slate-400 hover:text-emerald-300'
              }`}
              title="Voice Comms"
            >
              <Radio size={11} className={isVoiceConnected && currentRoomName === `tangent_freq_${channel.id}` ? 'animate-spin' : ''} />
            </button>
          )}

          {/* Settings */}
          {!isPersonaLog && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                AudioService.playTerminalBeep(1100, 0.02);
                setSettingsChannel(channel);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
              title="Frequency Settings"
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
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
              title="Delete Frequency"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#080c14] border-r border-slate-800 text-slate-200 select-none">
      {/* ── Top Header & Fast Search ── */}
      <div className="p-3 border-b border-slate-800 space-y-2 bg-[#0a0f1a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Radio size={14} className="animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase block">
                COMMLINK RELAY
              </span>
              <span className="text-[9.5px] font-mono text-cyan-400 block font-bold">
                TACTICAL MATRIX
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
            title="Create Custom Frequency or Direct Message"
          >
            <Plus size={13} />
            <span>NEW</span>
          </button>
        </div>

        {/* Unified Search Input */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search comms, operators, or squads..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* ── Flat 3-Section Directory (Organization A) ── */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 no-scrollbar">
        {/* 1. DIRECT COMMS (Player & Character Whispers) */}
        <div className="space-y-1">
          <div 
            onClick={() => toggleSection('direct')}
            className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              {collapsedSections.direct ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <MessageSquare size={12} />
              <span>DIRECT COMMS</span>
            </span>
            <span className="text-slate-500 text-[10px]">{allDirectChannels.length}</span>
          </div>

          {!collapsedSections.direct && (
            <div className="space-y-0.5 pl-1.5">
              {filteredDirect.length === 0 ? (
                <div className="px-2.5 py-1 text-[10px] text-slate-500 font-mono italic">
                  {searchQuery ? 'No matching direct comms.' : 'No direct whispers open. Click NEW to message an operator or persona.'}
                </div>
              ) : (
                filteredDirect.map(renderChannelItem)
              )}
            </div>
          )}
        </div>

        {/* 2. TACTICAL TEAMS (Enrolled Squads & Invite Access) */}
        <div className="space-y-1">
          <div 
            onClick={() => toggleSection('teams')}
            className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              {collapsedSections.teams ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <Shield size={12} />
              <span>TACTICAL TEAMS</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQuickInviteOpen(true);
                }}
                className="px-1.5 py-0.2 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold flex items-center gap-1"
                title="Dispatch Team Invite"
              >
                <UserPlus size={10} />
                <span>INVITE</span>
              </button>
              <span className="text-slate-500 text-[10px]">{teamChannels.length}</span>
            </div>
          </div>

          {!collapsedSections.teams && (
            <div className="space-y-0.5 pl-1.5">
              {filteredTeams.length === 0 ? (
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-900 text-center space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-mono">No tactical fireteams active.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/teams')}
                    className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[9.5px] font-bold font-mono transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>OPEN TEAMS WORKSTATION</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              ) : (
                filteredTeams.map(renderChannelItem)
              )}
            </div>
          )}
        </div>

        {/* 3. HOLONET FREQUENCIES (Public Global Rooms) */}
        <div className="space-y-1">
          <div 
            onClick={() => toggleSection('public')}
            className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              {collapsedSections.public ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <Globe size={12} className="text-cyan-400" />
              <span>HOLONET FREQUENCIES</span>
            </span>
            <span className="text-slate-500 text-[10px]">{publicChannels.length}</span>
          </div>

          {!collapsedSections.public && (
            <div className="space-y-0.5 pl-1.5">
              {filteredPublic.map(renderChannelItem)}
            </div>
          )}
        </div>

        {/* 4. AUDIT TELEMETRY LOGS (Optional Collapsed) */}
        {filteredAudit.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <div 
              onClick={() => toggleSection('audit')}
              className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-amber-400/80 uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {collapsedSections.audit ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <Activity size={12} />
                <span>PERSONA AUDIT LOGS</span>
              </span>
              <span className="text-slate-500 text-[10px]">{filteredAudit.length}</span>
            </div>

            {!collapsedSections.audit && (
              <div className="space-y-0.5 pl-1.5">
                {filteredAudit.map(renderChannelItem)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status bar */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 font-bold">QUANTUM RELAY ACTIVE</span>
        </div>
        <span className="text-cyan-400 font-bold">AES-GCM-256</span>
      </div>

      {/* Settings Modal */}
      {settingsChannel && (
        <ChannelSettingsModal
          isOpen={!!settingsChannel}
          onClose={() => setSettingsChannel(null)}
          channel={settingsChannel}
        />
      )}

      {/* Quick Team Invite Modal */}
      {isQuickInviteOpen && (
        <QuickTeamInviteModal
          isOpen={isQuickInviteOpen}
          onClose={() => setIsQuickInviteOpen(false)}
          defaultGroupId={selectedInviteGroupId}
        />
      )}
    </div>
  );
};

export default ChannelSidebar;
