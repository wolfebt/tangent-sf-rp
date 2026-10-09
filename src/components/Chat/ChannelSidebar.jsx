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
  ChevronUp,
  Activity,
  ExternalLink,
  Sparkles,
  Crown
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';
import { AudioService } from '../../services/audioService';
import { useConfirm } from '../../context/ConfirmContext';
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
  onSwitchToTeams,
  onSelectChannel,
  isCompact = false 
}) => {
  const confirm = useConfirm();
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
    pendingCharacterNotes = [],
    userDirectory = [],
    startDirectMessage
  } = useChat();

  const { 
    isConnected: isVoiceConnected, 
    currentRoomName, 
    connectToVoiceRoom, 
    disconnectVoiceRoom 
  } = useVoiceChat();
  const { currentUser, isAdmin } = useAuth();
  const { groups = [], selectGroup } = useGroup() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [settingsChannel, setSettingsChannel] = useState(null);
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
  const [selectedInviteGroupId, setSelectedInviteGroupId] = useState(null);

  // Per-team roster collapse tracking (default is expanded / visible)
  const [collapsedRosters, setCollapsedRosters] = useState({});

  const toggleTeamRoster = (channelId, e) => {
    e?.stopPropagation();
    AudioService.playTerminalBeep(1100, 0.02);
    setCollapsedRosters(prev => ({
      ...prev,
      [channelId]: !prev[channelId]
    }));
  };

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

  // Sort tactical team channels: unread first, then recent message timestamp
  const sortedTeamChannels = useMemo(() => {
    const list = [...(teamChannels || [])];
    return list.sort((a, b) => {
      const unreadA = unreadCounts[a.id] || 0;
      const unreadB = unreadCounts[b.id] || 0;
      if (unreadA !== unreadB) return unreadB - unreadA;

      const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;

      return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
    });
  }, [teamChannels, unreadCounts]);

  // Sort public HoloNet channels: unread first, then recent message timestamp
  const sortedPublicChannels = useMemo(() => {
    const list = [...(publicChannels || [])];
    return list.sort((a, b) => {
      const unreadA = unreadCounts[a.id] || 0;
      const unreadB = unreadCounts[b.id] || 0;
      if (unreadA !== unreadB) return unreadB - unreadA;

      const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;

      return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
    });
  }, [publicChannels, unreadCounts]);

  // Sort persona audit log channels: unread first
  const sortedPersonaLogChannels = useMemo(() => {
    const list = [...(personaLogChannels || [])];
    return list.sort((a, b) => {
      const unreadA = unreadCounts[a.id] || 0;
      const unreadB = unreadCounts[b.id] || 0;
      if (unreadA !== unreadB) return unreadB - unreadA;
      return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
    });
  }, [personaLogChannels, unreadCounts]);

  // Section-level unread counts for prominent header badges
  const directUnreadCount = useMemo(() => {
    return allDirectChannels.reduce((sum, c) => sum + (unreadCounts[c.id] || 0), 0);
  }, [allDirectChannels, unreadCounts]);

  const teamsUnreadCount = useMemo(() => {
    return (teamChannels || []).reduce((sum, c) => sum + (unreadCounts[c.id] || 0), 0);
  }, [teamChannels, unreadCounts]);

  const publicUnreadCount = useMemo(() => {
    return (publicChannels || []).reduce((sum, c) => sum + (unreadCounts[c.id] || 0), 0);
  }, [publicChannels, unreadCounts]);

  const auditUnreadCount = useMemo(() => {
    return (personaLogChannels || []).reduce((sum, c) => sum + (unreadCounts[c.id] || 0), 0);
  }, [personaLogChannels, unreadCounts]);

  // Auto-collapse all channels except for current view
  useEffect(() => {
    if (!activeChannelId) return;

    const isDirect = allDirectChannels.some(c => c.id === activeChannelId);
    const isTeam = (teamChannels || []).some(c => c.id === activeChannelId);
    const isPublic = (publicChannels || []).some(c => c.id === activeChannelId);
    const isAudit = (personaLogChannels || []).some(c => c.id === activeChannelId);

    if (isDirect) {
      setCollapsedSections({
        direct: false,
        teams: true,
        public: true,
        audit: true
      });
    } else if (isTeam) {
      setCollapsedSections({
        direct: true,
        teams: false,
        public: true,
        audit: true
      });
      // Collapse all other team rosters, expand only the current active team
      setCollapsedRosters(prev => {
        const next = { ...prev };
        (teamChannels || []).forEach(tc => {
          next[tc.id] = tc.id !== activeChannelId;
        });
        return next;
      });
    } else if (isPublic) {
      setCollapsedSections({
        direct: true,
        teams: true,
        public: false,
        audit: true
      });
    } else if (isAudit) {
      setCollapsedSections({
        direct: true,
        teams: true,
        public: true,
        audit: false
      });
    }
  }, [activeChannelId, allDirectChannels, teamChannels, publicChannels, personaLogChannels]);

  // Filter channels based on search
  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(c => {
      const matchBasic = 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.displayName && c.displayName.toLowerCase().includes(q)) ||
        (c.topic && c.topic.toLowerCase().includes(q)) ||
        (c.targetPersona?.name && c.targetPersona.name.toLowerCase().includes(q)) ||
        (c.targetPlayer?.handle && c.targetPlayer.handle.toLowerCase().includes(q));
      if (matchBasic) return true;

      // Also search characterMembers / enrolled personas
      if (Array.isArray(c.characterMembers) && c.characterMembers.some(cm => 
        (cm?.name && cm.name.toLowerCase().includes(q)) ||
        (cm?.role && cm.role.toLowerCase().includes(q)) ||
        (cm?.species && cm.species.toLowerCase().includes(q)) ||
        (cm?.ownerHandle && cm.ownerHandle.toLowerCase().includes(q))
      )) {
        return true;
      }
      return false;
    });
  };

  const filteredDirect = filterList(allDirectChannels);
  const filteredTeams = filterList(sortedTeamChannels);
  const filteredPublic = filterList(sortedPublicChannels);
  const filteredAudit = filterList(sortedPersonaLogChannels);

  const renderChannelItem = (channel) => {
    const isActive = activeChannelId === channel.id;
    const unread = unreadCounts[channel.id] || 0;
    const isUnread = !isActive && unread > 0;
    const isCharacterDM = channel.recipientType === 'character' || Boolean(channel.targetPersona) || channel.id.startsWith('dm_char_');
    const isPlayerDM = channel.recipientType === 'player' || ((channel.type === 'direct' || channel.id.startsWith('dm_')) && !isCharacterDM);
    const isGroup = channel.type === 'group' || !!channel.groupId;
    const isPersonaLog = channel.type === 'persona_log' || channel.id.startsWith('persona_log_');
    const canDelete = !channel.id.startsWith('public_') && !isPersonaLog && (channel.createdById === currentUser?.uid || isAdmin);

    const charRole = channel.targetPersona?.role || channel.targetPersona?.species;
    const playerHandle = channel.targetPlayer?.handle;

    // Left border indicator for active channel or unread flagged channel
    const activeBorderClass = isActive 
      ? (isCharacterDM 
          ? 'bg-purple-950/40 border-l-4 border-l-purple-400 border-y border-r border-purple-500/40 text-purple-100 shadow-sm'
          : isGroup
          ? 'bg-emerald-950/40 border-l-4 border-l-emerald-400 border-y border-r border-emerald-500/40 text-emerald-100 shadow-sm'
          : 'bg-cyan-950/40 border-l-4 border-l-cyan-400 border-y border-r border-cyan-500/40 text-cyan-100 shadow-sm')
      : isUnread
      ? 'bg-amber-950/30 border-l-4 border-l-amber-400 border-y border-r border-amber-500/50 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:bg-amber-950/45 animate-soft-back-glow'
      : 'text-slate-300 hover:bg-slate-900/70 hover:text-slate-100 border border-transparent';

    return (
      <div
        key={channel.id}
        onClick={() => {
          selectChannel(channel.id);
          onSelectChannel?.();
        }}
        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${activeBorderClass}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Channel Icon */}
          <div className="shrink-0">
            {isUnread ? (
              <div className="p-1 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-soft-back-glow">
                {isPersonaLog ? (
                  <Activity size={13} />
                ) : isCharacterDM ? (
                  <span className="text-xs">🎭</span>
                ) : isPlayerDM ? (
                  <UserPlus size={13} />
                ) : isGroup ? (
                  <Shield size={13} />
                ) : (
                  <Hash size={13} />
                )}
              </div>
            ) : isPersonaLog ? (
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
              {isUnread && (
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-soft-badge-glow shadow-[0_0_6px_#f59e0b] shrink-0" 
                  title="Unseen Transmission"
                />
              )}
              <span className={`text-xs truncate font-mono ${
                isActive 
                  ? 'font-bold' 
                  : isUnread 
                  ? 'font-extrabold text-amber-200 [text-shadow:0_0_6px_rgba(245,158,11,0.4)]' 
                  : 'font-bold'
              }`}>
                {channel.displayName || `#${channel.name}`}
              </span>

              {isUnread && (
                <span className="px-1 py-0.2 bg-amber-400 text-black text-[8px] rounded font-mono font-black tracking-tight shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-soft-badge-glow">
                  NEW
                </span>
              )}

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
                <span className="px-1 py-0.1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] rounded font-mono font-bold uppercase" title="Addresses Squad Personas">
                  🎭 PERSONAS
                </span>
              )}
              {!isCharacterDM && !isPlayerDM && !isGroup && !isPersonaLog && (
                <span className="px-1 py-0.1 bg-cyan-500/10 text-cyan-300/90 border border-cyan-500/20 text-[8px] rounded font-mono font-bold uppercase" title="Addresses Operators">
                  👤 OPERATOR
                </span>
              )}
            </div>

            {isCharacterDM && (charRole || playerHandle) ? (
              <p className={`text-[9.5px] truncate mt-0.5 ${isUnread ? 'text-amber-200/90 font-medium' : 'text-slate-400'}`}>
                {charRole ? `${charRole} • ` : ''}@{playerHandle || 'operator'}
              </p>
            ) : channel.lastMessage?.text ? (
              <p className={`text-[9.5px] truncate mt-0.5 max-w-[170px] ${isUnread ? 'text-amber-200 font-medium' : 'text-slate-500'}`}>
                {channel.lastMessage.text}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right side: unread counter, settings, or delete */}
        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {unread > 0 && (
            <span className={`px-1.5 py-0.2 text-[9px] font-mono font-black rounded-full shadow-sm animate-soft-badge-glow ${
              isUnread 
                ? 'bg-amber-400 text-black shadow-[0_0_8px_rgba(245,158,11,0.7)]' 
                : 'bg-cyan-400 text-black'
            }`}>
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
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 shadow-sm animate-soft-back-glow'
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
              onClick={async (e) => {
                e.stopPropagation();
                const ok = await confirm({
                  title: 'Delete Frequency',
                  message: `Are you sure you want to delete channel "${channel.displayName || channel.name}"? This action cannot be undone.`,
                  danger: true,
                  confirmLabel: 'Delete Frequency'
                });
                if (ok) {
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

  // Resolve comprehensive roster for tactical teams
  const resolveTeamData = (channel) => {
    const matchedGroup = groups.find(g => 
      (g.id && channel.groupId && g.id === channel.groupId) || 
      (g.channelId && g.channelId === channel.id) ||
      (g.name && channel.name && g.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') === channel.name.toLowerCase()) ||
      (g.name && channel.displayName && channel.displayName.toLowerCase().includes(g.name.toLowerCase()))
    );

    const membersList = [];
    const seenKeys = new Set();

    // 1. Matched group member details (from GroupService / Firestore game_groups)
    if (matchedGroup?.memberDetails) {
      Object.keys(matchedGroup.memberDetails).forEach(uid => {
        const detail = matchedGroup.memberDetails[uid];
        if (!detail) return;
        const memberUid = detail.userId || detail.uid || uid;
        const userDoc = userDirectory.find(u => u.uid === memberUid);
        const isSelf = memberUid === currentUser?.uid;
        const isOnline = Boolean(userDoc?.isOnline || isSelf);
        const handle = detail.handle || detail.userHandle || userDoc?.userHandle || userDoc?.displayName || (isSelf ? (currentUser?.displayName || currentUser?.email?.split('@')[0]) : 'Operator');
        const role = detail.role || (memberUid === matchedGroup.creatorId ? 'GM' : 'Operator');
        const persona = detail.persona;

        const personaId = persona?.id || persona?.['character-doc-id'] || null;
        const personaName = persona?.name || persona?.['char-name'] || null;
        const key = personaId ? `persona-${personaId}` : `op-${memberUid}`;

        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          membersList.push({
            id: key,
            memberUid,
            personaId,
            name: personaName || handle,
            personaName,
            operatorHandle: handle,
            species: persona?.species || persona?.['char-species'] || null,
            concept: persona?.role || persona?.['char-concept'] || persona?.['char-occu'] || null,
            avatar: persona?.avatar || null,
            teamRole: role,
            isOnline,
            isSelf,
            hasPersona: Boolean(personaName)
          });
        }
      });
    }

    // 2. Channel characterMembers (from CreateChannelModal or chatService)
    if (Array.isArray(channel.characterMembers)) {
      channel.characterMembers.forEach(cm => {
        if (!cm) return;
        const personaId = cm.id || cm['character-doc-id'] || cm.name;
        const key = `persona-${personaId}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          const ownerUid = cm.ownerUid;
          const userDoc = ownerUid ? userDirectory.find(u => u.uid === ownerUid) : null;
          const isSelf = ownerUid === currentUser?.uid;
          const isOnline = Boolean(userDoc?.isOnline || isSelf);
          const handle = cm.ownerHandle || userDoc?.userHandle || userDoc?.displayName || (isSelf ? (currentUser?.displayName || currentUser?.email?.split('@')[0]) : 'Operator');
          const pName = cm.name || cm['char-name'] || 'Persona';

          membersList.push({
            id: key,
            memberUid: ownerUid,
            personaId,
            name: pName,
            personaName: pName,
            operatorHandle: handle,
            species: cm.species || cm['char-species'] || null,
            concept: cm.role || cm['char-concept'] || cm['char-occu'] || null,
            avatar: cm.avatar || null,
            teamRole: cm.teamRole || (ownerUid === channel.createdById ? 'Leader' : 'Operator'),
            isOnline,
            isSelf,
            hasPersona: true
          });
        }
      });
    }

    // 3. Fallback for UIDs in channel.members or matchedGroup.members
    const allUids = new Set([
      ...(Array.isArray(channel.members) ? channel.members : []),
      ...(matchedGroup && Array.isArray(matchedGroup.members) ? matchedGroup.members : [])
    ]);
    if (channel.createdById) allUids.add(channel.createdById);
    if (matchedGroup?.creatorId) allUids.add(matchedGroup.creatorId);

    allUids.forEach(uid => {
      const alreadyHasEntry = membersList.some(m => m.memberUid === uid);
      if (!alreadyHasEntry) {
        const userDoc = userDirectory.find(u => u.uid === uid);
        const isSelf = uid === currentUser?.uid;
        const isOnline = Boolean(userDoc?.isOnline || isSelf);
        const handle = userDoc?.userHandle || userDoc?.displayName || (isSelf ? (currentUser?.displayName || currentUser?.email?.split('@')[0]) : 'Operator');
        const role = (matchedGroup && uid === matchedGroup.creatorId) || uid === channel.createdById ? 'GM' : 'Operator';

        const userChars = Array.isArray(userDoc?.characters) ? userDoc.characters : [];
        if (userChars.length > 0) {
          userChars.forEach(uc => {
            const cId = uc.id || uc['character-doc-id'] || uc.name;
            const key = `persona-${cId}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              const pName = uc.name || uc['char-name'] || 'Persona';
              membersList.push({
                id: key,
                memberUid: uid,
                personaId: cId,
                name: pName,
                personaName: pName,
                operatorHandle: handle,
                species: uc.species || uc['char-species'] || null,
                concept: uc.role || uc['char-concept'] || uc['char-occu'] || null,
                avatar: uc.avatar || null,
                teamRole: role,
                isOnline,
                isSelf,
                hasPersona: true
              });
            }
          });
        } else {
          const key = `op-${uid}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            membersList.push({
              id: key,
              memberUid: uid,
              personaId: null,
              name: handle,
              personaName: null,
              operatorHandle: handle,
              species: null,
              concept: null,
              avatar: null,
              teamRole: role,
              isOnline,
              isSelf,
              hasPersona: false
            });
          }
        }
      }
    });

    return { matchedGroup, membersList };
  };

  // Dedicated Tactical Team Card with Member Roster
  const renderTeamCard = (channel) => {
    const isActive = activeChannelId === channel.id;
    const unread = unreadCounts[channel.id] || 0;
    const isUnread = !isActive && unread > 0;
    const canDelete = channel.createdById === currentUser?.uid || isAdmin;
    const { matchedGroup, membersList } = resolveTeamData(channel);
    const isRosterCollapsed = Boolean(collapsedRosters[channel.id]);

    return (
      <div
        key={channel.id}
        onClick={() => {
          selectChannel(channel.id);
          if (matchedGroup?.id && selectGroup) {
            selectGroup(matchedGroup.id);
          }
          onSelectChannel?.();
        }}
        className={`group relative rounded-xl transition-all cursor-pointer border ${
          isActive
            ? 'bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-[#081714] border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-emerald-100'
            : isUnread
            ? 'bg-gradient-to-br from-amber-950/35 via-slate-900/90 to-[#140f07] border-l-4 border-l-amber-400 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-amber-100 animate-soft-back-glow'
            : 'bg-slate-950/60 border-slate-800/90 hover:border-emerald-500/40 hover:bg-slate-900/70 text-slate-300'
        } p-2.5 space-y-2 mb-2`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`p-1.5 rounded-lg shrink-0 border ${
              isActive 
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-sm animate-soft-back-glow' 
                : isUnread
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm animate-soft-back-glow'
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
            }`}>
              <Shield size={13} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {isUnread && (
                  <span 
                    className="w-2 h-2 rounded-full bg-amber-400 animate-soft-badge-glow shadow-[0_0_6px_#f59e0b] shrink-0" 
                    title="Unseen Messages in Squad Frequency"
                  />
                )}
                <span className={`text-xs truncate font-mono tracking-wide ${
                  isUnread ? 'font-extrabold text-amber-200 [text-shadow:0_0_6px_rgba(245,158,11,0.4)]' : 'font-bold text-white'
                }`}>
                  {channel.displayName || `#${channel.name}`}
                </span>

                {isUnread ? (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-black border border-amber-400 text-[8px] rounded font-mono font-black tracking-tight shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-soft-badge-glow">
                    UNSEEN
                  </span>
                ) : (
                  <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] rounded font-mono font-bold tracking-tight">
                    🎭 PERSONAS
                  </span>
                )}

                {matchedGroup?.status && (
                  <span className={`px-1 py-0.2 text-[8px] rounded font-mono font-bold border ${
                    matchedGroup.status === 'Recruiting'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {matchedGroup.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons on right */}
          <div className="flex items-center gap-1 shrink-0">
            {unread > 0 && (
              <span className={`px-1.5 py-0.2 text-[9px] font-mono font-black rounded-full shadow-sm animate-soft-badge-glow ${
                isUnread 
                  ? 'bg-amber-400 text-black shadow-[0_0_8px_rgba(245,158,11,0.7)]' 
                  : 'bg-emerald-400 text-black'
              }`}>
                {unread}
              </span>
            )}

            {/* Voice Frequency Action */}
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
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 shadow-sm animate-soft-back-glow'
                  : 'opacity-0 group-hover:opacity-100 hover:bg-slate-800 text-slate-400 hover:text-emerald-300'
              }`}
              title="Voice Comms"
            >
              <Radio size={11} className={isVoiceConnected && currentRoomName === `tangent_freq_${channel.id}` ? 'animate-spin' : ''} />
            </button>

            {/* Quick Dispatch Invite */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInviteGroupId(matchedGroup?.id || channel.groupId || channel.id);
                setIsQuickInviteOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-300 transition-all cursor-pointer"
              title="Invite to Squad"
            >
              <UserPlus size={11} />
            </button>

            {/* Frequency Settings */}
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

            {/* Delete / Leave */}
            {canDelete && (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  const ok = await confirm({
                    title: 'Delete Team Frequency',
                    message: `Are you sure you want to delete "${channel.displayName || channel.name}"? This action cannot be undone.`,
                    danger: true,
                    confirmLabel: 'Delete Frequency'
                  });
                  if (ok) {
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

        {/* Recent Message / Topic Snippet */}
        {channel.lastMessage?.text ? (
          <div className="px-1 text-[10px] font-mono truncate flex items-center gap-1.5">
            <span className={`shrink-0 font-bold ${isUnread ? 'text-amber-300' : 'text-slate-500'}`}>
              {isUnread ? 'New Comms:' : 'Comms:'}
            </span>
            <span className={`truncate ${isUnread ? 'text-amber-100 font-medium' : 'text-slate-300'}`}>
              {channel.lastMessage.text}
            </span>
          </div>
        ) : channel.topic ? (
          <div className={`px-1 text-[10px] font-mono truncate ${isUnread ? 'text-amber-200/80' : 'text-slate-500'}`}>
            {channel.topic}
          </div>
        ) : null}

        {/* ── MEMBERS ROSTER IN TEAM CARD ── */}
        <div className="pt-1.5 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono px-0.5">
            <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users size={11} className="text-emerald-400" />
              <span>MEMBERS ROSTER</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8.5px] font-bold">
                {membersList.length}
              </span>
            </span>

            <button
              type="button"
              onClick={(e) => toggleTeamRoster(channel.id, e)}
              className="text-slate-400 hover:text-emerald-300 px-1 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[9px] font-bold"
              title={isRosterCollapsed ? "Expand Roster" : "Collapse Roster"}
            >
              <span>{isRosterCollapsed ? 'EXPAND' : 'COLLAPSE'}</span>
              {isRosterCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
            </button>
          </div>

          {!isRosterCollapsed && (
            <div className="space-y-1">
              {membersList.length === 0 ? (
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-900 text-center space-y-1">
                  <p className="text-[9.5px] text-slate-500 font-mono italic">
                    No personas enrolled in squad yet.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInviteGroupId(matchedGroup?.id || channel.groupId || channel.id);
                      setIsQuickInviteOpen(true);
                    }}
                    className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    <UserPlus size={10} />
                    <span>INVITE PERSONA</span>
                  </button>
                </div>
              ) : (
                membersList.map((member) => (
                  <div
                    key={member.id}
                    className={`p-1.5 rounded-lg border transition-all flex items-center justify-between text-xs ${
                      member.isSelf
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800/90 hover:border-emerald-500/30 text-slate-200'
                    }`}
                  >
                    {/* Left: Persona / Operator Identity */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Avatar / Token with Online Status Dot */}
                      <div className="relative shrink-0">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-6 h-6 rounded-md object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 flex items-center justify-center text-[9.5px] font-bold text-emerald-300 font-mono">
                            {member.name ? member.name.substring(0, 2).toUpperCase() : 'OP'}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-black ${
                            member.isOnline ? 'bg-emerald-400 shadow-[0_0_4px_#10b981]' : 'bg-slate-600'
                          }`}
                          title={member.isOnline ? 'Online' : 'Offline'}
                        />
                      </div>

                      {/* Name, Species, Concept & Operator Handle */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[11px] text-white truncate">
                            {member.name}
                          </span>
                          {member.isSelf && (
                            <span className="text-[7.5px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                              YOU
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 truncate">
                          {member.species && (
                            <span className="text-slate-300">{member.species}</span>
                          )}
                          {member.species && member.concept && <span>•</span>}
                          {member.concept && (
                            <span className="text-emerald-400/90 font-medium">{member.concept}</span>
                          )}
                          {member.operatorHandle && (
                            <span className="text-slate-500 truncate">
                              (@{member.operatorHandle})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Team Role badge & Whisper */}
                    <div className="flex items-center gap-1 shrink-0 ml-1.5">
                      {member.teamRole === 'GM' || member.teamRole === 'Leader' ? (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-mono font-bold flex items-center gap-0.5">
                          <Crown size={8} />
                          <span>{member.teamRole}</span>
                        </span>
                      ) : member.teamRole && member.teamRole !== 'Operator' ? (
                        <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 text-[8px] font-mono">
                          {member.teamRole}
                        </span>
                      ) : null}

                      {/* Direct Whisper Action */}
                      {!member.isSelf && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              AudioService.playTerminalBeep(1200, 0.02);
                              const targetUser = userDirectory.find(u => u.uid === member.memberUid) || {
                                uid: member.memberUid,
                                userHandle: member.operatorHandle,
                                displayName: member.operatorHandle
                              };
                              const targetPersona = member.personaId ? {
                                id: member.personaId,
                                'character-doc-id': member.personaId,
                                name: member.personaName || member.name,
                                species: member.species,
                                role: member.concept,
                                avatar: member.avatar
                              } : null;
                              if (startDirectMessage) {
                                await startDirectMessage(targetUser, targetPersona);
                                onSelectChannel?.();
                              }
                            } catch (err) {
                              console.warn('Failed to start whisper:', err);
                            }
                          }}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          title={`Direct Whisper to ${member.name}`}
                        >
                          <MessageSquare size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Fast Links */}
        <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
          <span className="truncate">Tuned: {channel.name}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              AudioService.playTerminalBeep(1150, 0.02);
              if (matchedGroup?.id && selectGroup) {
                selectGroup(matchedGroup.id);
              }
              if (onSwitchToTeams) {
                onSwitchToTeams();
              } else {
                navigate('/network?view=teams&tab=roster');
              }
            }}
            className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer font-bold"
            title="Open Full Squad Dossier in Teams"
          >
            <span>FULL DOSSIER</span>
            <ExternalLink size={9} />
          </button>
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
              <Radio size={14} className="animate-soft-back-glow" />
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
            className={`flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors ${
              directUnreadCount > 0 ? 'text-amber-300' : 'text-cyan-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {collapsedSections.direct ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <MessageSquare size={12} />
              <span>DIRECT COMMS</span>
              {directUnreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[8.5px] font-mono font-black rounded-full shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-soft-badge-glow">
                  {directUnreadCount} NEW
                </span>
              )}
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
            className={`flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors ${
              teamsUnreadCount > 0 ? 'text-amber-300' : 'text-emerald-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {collapsedSections.teams ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <Shield size={12} />
              <span>TACTICAL TEAMS</span>
              <span className="px-1 py-0.2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[8px] rounded font-mono font-bold tracking-tight">
                PERSONAS
              </span>
              {teamsUnreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[8.5px] font-mono font-black rounded-full shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-soft-badge-glow">
                  {teamsUnreadCount} NEW
                </span>
              )}
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
                    onClick={() => {
                      if (onSwitchToTeams) {
                        onSwitchToTeams();
                      } else {
                        navigate('/network?view=teams');
                      }
                    }}
                    className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[9.5px] font-bold font-mono transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>OPEN TEAMS WORKSTATION</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              ) : (
                filteredTeams.map(renderTeamCard)
              )}
            </div>
          )}
        </div>

        {/* 3. HOLONET FREQUENCIES (Public Global Rooms) */}
        <div className="space-y-1">
          <div 
            onClick={() => toggleSection('public')}
            className={`flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors ${
              publicUnreadCount > 0 ? 'text-amber-300' : 'text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {collapsedSections.public ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <Globe size={12} className={publicUnreadCount > 0 ? 'text-amber-400' : 'text-cyan-400'} />
              <span>HOLONET FREQUENCIES</span>
              <span className="px-1 py-0.2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[8px] rounded font-mono font-bold tracking-tight">
                OPERATORS
              </span>
              {publicUnreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[8.5px] font-mono font-black rounded-full shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-soft-badge-glow">
                  {publicUnreadCount} NEW
                </span>
              )}
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
              className={`flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors ${
                auditUnreadCount > 0 ? 'text-amber-300' : 'text-amber-400/80'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {collapsedSections.audit ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <Activity size={12} />
                <span>PERSONA AUDIT LOGS</span>
                {auditUnreadCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[8.5px] font-mono font-black rounded-full shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-soft-badge-glow">
                    {auditUnreadCount} NEW
                  </span>
                )}
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
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-soft-badge-glow shadow-[0_0_6px_#10b981]"></span>
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
