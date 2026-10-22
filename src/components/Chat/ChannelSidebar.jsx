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
  Edit3,
  ChevronDown, 
  ChevronRight, 
  ChevronUp,
  Activity,
  ExternalLink,
  Sparkles,
  Crown,
  Copy,
  Check,
  Play,
  Map,
  Compass,
  Volume2,
  Mic,
  MicOff
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';
import { AudioService } from '../../services/audioService.js';
import { getEffectiveUserHandle } from '../../utils/personaValidationUtils';
import { useConfirm } from '../../context/ConfirmContext';
import { ChannelSettingsModal } from './ChannelSettingsModal';
import { QuickTeamInviteModal } from './QuickTeamInviteModal';
import { TransceiverDeck } from '../Network/TransceiverDeck';

/**
 * @component ChannelSidebar
 * @description Zone 2 (280px-320px Left Context Tree) of the 4-Zone SOTA Gaming Comm Center.
 * Supports Dual-Context Modes:
 *  - HoloNet Home Mode: Direct Whispers, Public HoloNet Relays, Live Voice Lounges, Tactical Teams, Custom Channels
 *  - Squad Server Mode: Squad Banner Header (with Squad Switcher, Invite Code & VTT Launch), Squad Command Views, Squad Channels & Squad Voice Lounge
 * Anchors the persistent <TransceiverDeck /> at the bottom.
 */
export const ChannelSidebar = ({ 
  onOpenCreateModal, 
  onOpenSquadModal, 
  onOpenTeamModal, 
  onOpenCreateSquad,
  onSwitchToTeams,
  onSelectChannel,
  serverContext = 'holonet', // 'holonet' | 'squad'
  activeStageMode = 'comms', // 'comms' | 'squad_command'
  activeSquadTab = 'roster', // 'roster' | 'tactical' | 'lfg' | 'invites' | 'settings' | 'directory'
  onSelectSquadCommandTab,
  onReturnToCommsStream,
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
    customChannels = [],
    activeChannelId, 
    selectChannel, 
    activeFreqBranch = 'all',
    setActiveFreqBranch,
    unreadCounts = {},
    deleteChannel,
    pendingCharacterNotes = [],
    userDirectory = [],
    startDirectMessage
  } = useChat();

  const { 
    isConnected: isVoiceConnected, 
    currentRoomName, 
    roomDisplayName,
    participants: voiceParticipants = [],
    activeSpeakers = [],
    isSpeaking,
    connectToVoiceRoom, 
    disconnectVoiceRoom 
  } = useVoiceChat();
  const { currentUser, userHandle, isAdmin } = useAuth();
  const { groups = [], activeGroup, selectGroup, pendingInvites = [] } = useGroup() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [settingsChannel, setSettingsChannel] = useState(null);
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
  const [selectedInviteGroupId, setSelectedInviteGroupId] = useState(null);
  const [copiedSquadCode, setCopiedSquadCode] = useState(false);

  const handleCopySquadCode = (code, e) => {
    e?.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedSquadCode(true);
    setTimeout(() => setCopiedSquadCode(false), 2000);
  };

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

  // Directory section collapse state
  const [freqsRootCollapsed, setFreqsRootCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    direct: false,
    teams: false,
    public: false,
    custom: false,
    audit: true
  });

  useEffect(() => {
    setFreqsRootCollapsed(false);
    if (activeFreqBranch === 'holonet') {
      setCollapsedSections(prev => ({ ...prev, public: false, custom: false }));
    } else if (activeFreqBranch === 'whispers') {
      setCollapsedSections(prev => ({ ...prev, direct: false }));
    }
  }, [activeFreqBranch]);

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

  // Sort custom operator channels: unread first, then recent message timestamp
  const sortedCustomChannels = useMemo(() => {
    const list = [...(customChannels || [])];
    return list.sort((a, b) => {
      const unreadA = unreadCounts[a.id] || 0;
      const unreadB = unreadCounts[b.id] || 0;
      if (unreadA !== unreadB) return unreadB - unreadA;

      const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;

      return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
    });
  }, [customChannels, unreadCounts]);

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

  const customUnreadCount = useMemo(() => {
    return (customChannels || []).reduce((sum, c) => sum + (unreadCounts[c.id] || 0), 0);
  }, [customChannels, unreadCounts]);

  const auditUnreadCount = useMemo(() => {
    return (personaLogChannels || []).reduce((sum, c) => sum + (unreadCounts[c.id] || 0), 0);
  }, [personaLogChannels, unreadCounts]);

  // Auto-collapse all channels except for current view
  useEffect(() => {
    if (!activeChannelId) return;

    const isDirect = allDirectChannels.some(c => c.id === activeChannelId);
    const isTeam = (teamChannels || []).some(c => c.id === activeChannelId);
    const isPublic = (publicChannels || []).some(c => c.id === activeChannelId);
    const isCustom = (customChannels || []).some(c => c.id === activeChannelId);
    const isAudit = (personaLogChannels || []).some(c => c.id === activeChannelId);

    if (isDirect) {
      setCollapsedSections(prev => ({ ...prev, direct: false }));
    } else if (isTeam) {
      setCollapsedSections(prev => ({ ...prev, teams: false }));
      // Collapse all other team rosters, expand only the current active team
      setCollapsedRosters(prev => {
        const next = { ...prev };
        (teamChannels || []).forEach(tc => {
          next[tc.id] = tc.id !== activeChannelId;
        });
        return next;
      });
    } else if (isPublic) {
      setCollapsedSections(prev => ({ ...prev, public: false }));
    } else if (isCustom) {
      setCollapsedSections(prev => ({ ...prev, custom: false }));
    } else if (isAudit) {
      setCollapsedSections(prev => ({ ...prev, audit: false }));
    }
  }, [activeChannelId, allDirectChannels, teamChannels, publicChannels, customChannels, personaLogChannels]);

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
  const filteredCustom = filterList(sortedCustomChannels);
  const filteredAudit = filterList(sortedPersonaLogChannels);

  const renderChannelItem = (channel) => {
    const isActive = activeChannelId === channel.id;
    const unread = unreadCounts[channel.id] || 0;
    const isUnread = !isActive && unread > 0;
    const isCharacterDM = channel.recipientType === 'character' || Boolean(channel.targetPersona) || channel.id.startsWith('dm_char_');
    const isPlayerDM = channel.recipientType === 'player' || ((channel.type === 'direct' || channel.id.startsWith('dm_')) && !isCharacterDM);
    const isGroup = channel.type === 'group' || !!channel.groupId;
    const isPersonaLog = channel.type === 'persona_log' || channel.id.startsWith('persona_log_');
    const canDelete = !channel.id.startsWith('public_') && !isPersonaLog && (channel.createdById === currentUser?.uid || isAdmin || channel.createdById?.startsWith('local_') || channel.type === 'custom');
    const canEdit = !channel.id.startsWith('public_') && !isPersonaLog && (channel.createdById === currentUser?.uid || isAdmin || channel.createdById?.startsWith('local_') || channel.type === 'custom');

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

          {/* Edit / Settings */}
          {!isPersonaLog && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                AudioService.playTerminalBeep(1100, 0.02);
                setSettingsChannel(channel);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
              title={canEdit ? "Edit Frequency Configurations & Name" : "Frequency Settings"}
            >
              {canEdit ? <Edit3 size={11} /> : <Settings size={11} />}
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
    const seenUids = new Set();

    const computeCharPresence = (userDoc, isSelf, personaId) => {
      const isOnline = Boolean(userDoc?.isOnline || isSelf);
      if (!isOnline) return 'offline';
      const activeCharId = userDoc?.activePersona?.id || userDoc?.currentActivity?.personaId;
      const inThisSquad =
        (matchedGroup?.id && userDoc?.currentActivity?.groupId === matchedGroup.id) ||
        userDoc?.currentActivity?.channelId === channel.id ||
        (personaId && activeCharId === personaId);
      return inThisSquad ? 'deployed' : 'on_call';
    };

    // 1. Matched group member details (strictly the enrolled persona per member)
    if (matchedGroup?.memberDetails) {
      Object.keys(matchedGroup.memberDetails).forEach(uid => {
        const detail = matchedGroup.memberDetails[uid];
        if (!detail) return;
        const memberUid = detail.userId || detail.uid || uid;
        if (seenUids.has(memberUid)) return;
        seenUids.add(memberUid);

        const userDoc = userDirectory.find(u => u.uid === memberUid);
        const isSelf = memberUid === currentUser?.uid;
        const isOnline = Boolean(userDoc?.isOnline || isSelf);
        const handle = detail.handle || detail.userHandle || (userDoc ? getEffectiveUserHandle(userDoc) : (isSelf ? getEffectiveUserHandle(currentUser) : 'Operator'));
        const isGM = memberUid === matchedGroup.creatorId || (Array.isArray(matchedGroup.coArchitects) && matchedGroup.coArchitects.includes(memberUid));
        const role = detail.role || (isGM ? 'GM' : 'Operative');
        const persona = detail.persona;

        const personaId = persona?.id || persona?.['character-doc-id'] || null;
        const personaName = persona?.name || persona?.['char-name'] || null;
        const characterPresence = computeCharPresence(userDoc, isSelf, personaId);

        membersList.push({
          id: personaId ? `persona-${personaId}-${memberUid}` : `op-${memberUid}`,
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
          characterPresence,
          isSelf,
          hasPersona: Boolean(personaName)
        });
      });
    }

    // 2. Channel characterMembers (from CreateChannelModal or squadService.syncChannelRoster)
    if (Array.isArray(channel.characterMembers)) {
      channel.characterMembers.forEach(cm => {
        if (!cm) return;
        const ownerUid = cm.ownerUid;
        if (ownerUid && seenUids.has(ownerUid)) return;
        if (ownerUid) seenUids.add(ownerUid);

        const personaId = cm.id || cm['character-doc-id'] || cm.name;
        const userDoc = ownerUid ? userDirectory.find(u => u.uid === ownerUid) : null;
        const isSelf = ownerUid === currentUser?.uid;
        const isOnline = Boolean(userDoc?.isOnline || isSelf);
        const handle = cm.ownerHandle || (userDoc ? getEffectiveUserHandle(userDoc) : (isSelf ? getEffectiveUserHandle(currentUser) : 'Operator'));
        const pName = cm.name || cm['char-name'] || 'Persona';
        const characterPresence = computeCharPresence(userDoc, isSelf, personaId);

        membersList.push({
          id: `persona-${personaId}-${ownerUid || pName}`,
          memberUid: ownerUid,
          personaId,
          name: pName,
          personaName: pName,
          operatorHandle: handle,
          species: cm.species || cm['char-species'] || null,
          concept: cm.role || cm['char-concept'] || cm['char-occu'] || null,
          avatar: cm.avatar || null,
          teamRole: cm.teamRole || (ownerUid === channel.createdById ? 'GM' : 'Operative'),
          isOnline,
          characterPresence,
          isSelf,
          hasPersona: true
        });
      });
    }

    // 3. Fallback for UIDs in channel.members or matchedGroup.members without an assigned persona (Reserve Operators / GM)
    const allUids = new Set([
      ...(Array.isArray(channel.members) ? channel.members : []),
      ...(matchedGroup && Array.isArray(matchedGroup.members) ? matchedGroup.members : [])
    ]);
    if (channel.createdById) allUids.add(channel.createdById);
    if (matchedGroup?.creatorId) allUids.add(matchedGroup.creatorId);

    allUids.forEach(uid => {
      if (!seenUids.has(uid)) {
        seenUids.add(uid);
        const userDoc = userDirectory.find(u => u.uid === uid);
        const isSelf = uid === currentUser?.uid;
        const isOnline = Boolean(userDoc?.isOnline || isSelf);
        const handle = userDoc ? getEffectiveUserHandle(userDoc) : (isSelf ? getEffectiveUserHandle(currentUser) : 'Operator');
        const isGM = (matchedGroup && uid === matchedGroup.creatorId) || uid === channel.createdById;
        const role = isGM ? 'GM' : 'Reserve';
        const characterPresence = computeCharPresence(userDoc, isSelf, null);

        membersList.push({
          id: `op-${uid}`,
          memberUid: uid,
          personaId: null,
          name: handle,
          personaName: null,
          operatorHandle: handle,
          species: null,
          concept: isGM ? 'Architect Command' : 'Unassigned Operative',
          avatar: null,
          teamRole: role,
          isOnline,
          characterPresence,
          isSelf,
          hasPersona: false
        });
      }
    });

    return { matchedGroup, membersList };
  };

  // Dedicated Tactical Team Card with Member Roster
  const renderTeamCard = (channel) => {
    const isActive = activeChannelId === channel.id;
    const unread = unreadCounts[channel.id] || 0;
    const isUnread = !isActive && unread > 0;
    const { matchedGroup, membersList } = resolveTeamData(channel);
    const canDelete = channel.createdById === currentUser?.uid || isAdmin || channel.createdById?.startsWith('local_') || Boolean(matchedGroup?.creatorId === currentUser?.uid);
    const canEdit = canDelete;
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
                    title="Unseen Messages in Team Frequency"
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
              title="Invite to Team"
            >
              <UserPlus size={11} />
            </button>

            {/* Frequency Edit / Settings */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                AudioService.playTerminalBeep(1100, 0.02);
                setSettingsChannel(channel);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
              title={canEdit ? "Edit Frequency Configurations & Team Roster" : "Frequency Settings & Team Roster"}
            >
              {canEdit ? <Edit3 size={11} /> : <Settings size={11} />}
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
                    No personas enrolled in team yet.
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
                            member.characterPresence === 'deployed'
                              ? 'bg-emerald-400 shadow-[0_0_4px_#10b981]'
                              : member.characterPresence === 'on_call'
                              ? 'bg-amber-400 shadow-[0_0_4px_#f59e0b]'
                              : 'bg-slate-600'
                          }`}
                          title={
                            member.characterPresence === 'deployed'
                              ? 'DEPLOYED (Active in Team)'
                              : member.characterPresence === 'on_call'
                              ? 'ON-CALL (Operator Online)'
                              : 'STASIS (Offline)'
                          }
                        />
                      </div>

                      {/* Name, Species, Concept & Operator Handle */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[11px] text-white truncate">
                            {member.name}
                          </span>
                          <span className={`text-[7px] px-1 py-0.1 rounded font-mono font-bold uppercase shrink-0 ${
                            member.characterPresence === 'deployed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : member.characterPresence === 'on_call'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                          }`}>
                            {member.characterPresence === 'deployed'
                              ? 'DEPLOYED'
                              : member.characterPresence === 'on_call'
                              ? 'ON-CALL'
                              : 'STASIS'}
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
            title="Open Full Team Dossier in Teams"
          >
            <span>FULL DOSSIER</span>
            <ExternalLink size={9} />
          </button>
        </div>
      </div>
    );
  };

  // Resolve active team's primary channel when in Team Server Mode
  const activeSquadChannel = useMemo(() => {
    if (!activeGroup) return null;
    const chanId = activeGroup.channelId || `group_chan_${activeGroup.id}`;
    return (
      teamChannels.find(
        (c) =>
          c.id === chanId ||
          c.groupId === activeGroup.id ||
          c.name?.toLowerCase() ===
            activeGroup.name?.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      ) || {
        id: chanId,
        name: activeGroup.name?.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'team-comms',
        displayName: `${activeGroup.name} Comms`,
        type: 'group',
        groupId: activeGroup.id
      }
    );
  }, [activeGroup, teamChannels]);

  const activeSquadVoiceRoom = activeSquadChannel
    ? `tangent_freq_${activeSquadChannel.id}`
    : activeGroup
    ? `tangent_squad_${activeGroup.id}`
    : 'tangent_freq_public_general';

  const isSquadVoiceConnected =
    isVoiceConnected && currentRoomName === activeSquadVoiceRoom;

  return (
    <div className="h-full flex flex-col bg-[#080c14] border-r border-slate-800 text-slate-200 select-none">
      {/* ══════════════════════════════════════════════════════════════════════
          MODE B: TEAM SERVER COMMAND & FREQUENCY TREE
          ══════════════════════════════════════════════════════════════════════ */}
      {serverContext === 'squad' ? (
        <>
          {/* 1. Team Server Banner Header (with Team Switcher, Invite Code & VTT Launch) */}
          <div className="p-3 border-b border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-[#0a131c] to-[#080c14] space-y-2.5 shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {groups.length > 1 && activeGroup ? (
                  <div className="relative">
                    <select
                      value={activeGroup.id}
                      onChange={(e) => {
                        AudioService.playTerminalBeep(1150, 0.02);
                        selectGroup?.(e.target.value);
                      }}
                      className="w-full bg-slate-950/90 border border-emerald-500/50 text-emerald-200 font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg appearance-none pr-6 cursor-pointer focus:outline-none focus:border-emerald-400 truncate"
                      title="Switch Active Tactical Team"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id} className="bg-slate-950 text-slate-100">
                          🛡️ {g.name} ({g.members?.length || 1})
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
                    />
                  </div>
                ) : activeGroup ? (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shrink-0">
                      <Shield size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-extrabold text-white truncate block">
                        {activeGroup.name}
                      </span>
                      <span className="text-[9.5px] font-mono text-emerald-400 block">
                        {activeGroup.status || 'Active Team'} • {activeGroup.members?.length || 1} Ops
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shrink-0">
                      <Shield size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-extrabold text-white truncate block">
                        TEAMS COMMAND
                      </span>
                      <span className="text-[9.5px] font-mono text-emerald-400 block">
                        Tactical Teams & Stage VTT
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 1-Click Invite Code Badge & + New Team */}
              <div className="flex items-center gap-1 shrink-0">
                {activeGroup?.inviteCode && (
                  <button
                    type="button"
                    onClick={(e) => handleCopySquadCode(activeGroup.inviteCode, e)}
                    className="px-2 py-1 rounded-lg bg-slate-950/90 border border-emerald-500/40 hover:border-emerald-400 text-[9.5px] font-mono font-bold text-emerald-300 flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                    title="Copy 6-Character Team Invite Code"
                  >
                    <span>{activeGroup.inviteCode}</span>
                    {copiedSquadCode ? (
                      <Check size={10} className="text-emerald-400" />
                    ) : (
                      <Copy size={10} />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1300, 0.03);
                    (onOpenCreateSquad || onOpenTeamModal || onOpenSquadModal)?.();
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[9.5px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors shadow-sm"
                  title="Commission New Tactical Team"
                >
                  <Plus size={11} />
                  <span>NEW TEAM</span>
                </button>
              </div>
            </div>

            {/* Quick Launch Stage VTT & Invite Action Row */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1400, 0.04);
                  navigate('/stage');
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-amber-600/90 to-amber-500/90 hover:from-amber-500 hover:to-amber-400 text-black font-mono font-extrabold text-[10px] flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                title="Deploy Team to Stage VTT"
              >
                <Play size={11} className="fill-current" />
                <span>DEPLOY TO VTT STAGE</span>
              </button>

              {activeGroup && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInviteGroupId(activeGroup.id);
                    setIsQuickInviteOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 cursor-pointer transition-colors"
                  title="Invite Operator to Team"
                >
                  <UserPlus size={13} />
                </button>
              )}
            </div>
          </div>

          {/* 2. Team Server Navigation Tree */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3.5 no-scrollbar font-mono">
            {/* Section A: TEAM COMMAND & OPERATIONS */}
            <div className="space-y-1">
              <div className="px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-emerald-400/90 flex items-center justify-between">
                <span>TEAM COMMAND</span>
                <span className="text-[8.5px] text-slate-500">OPERATIONS</span>
              </div>

              {[
                {
                  id: 'roster',
                  label: 'Team Roster & Loadouts',
                  icon: Users,
                  badge: activeGroup?.members?.length || null
                },
                {
                  id: 'tactical',
                  label: 'Tactical Briefing & VTT',
                  icon: Map,
                  badge: 'STAGE'
                },
                {
                  id: 'lfg',
                  label: 'Recruitment & LFT Hub',
                  icon: Compass,
                  badge: 'LFT'
                },
                {
                  id: 'directory',
                  label: 'Teams & Public Parties',
                  icon: Globe,
                  badge: groups.length > 0 ? groups.length : null
                },
                {
                  id: 'invites',
                  label: 'Invites & Dispatch',
                  icon: UserPlus,
                  badge: pendingInvites.length > 0 ? `${pendingInvites.length}!` : null,
                  isAlert: pendingInvites.length > 0
                },
                {
                  id: 'settings',
                  label: 'Team Configuration',
                  icon: Settings
                }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected =
                  activeStageMode === 'squad_command' && activeSquadTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1150, 0.02);
                      onSelectSquadCommandTab?.(item.id);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-950/60 border-l-4 border-l-emerald-400 border-emerald-500/50 text-emerald-100 font-bold shadow-sm'
                        : 'border-transparent text-slate-300 hover:bg-slate-900/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        size={13}
                        className={isSelected ? 'text-emerald-400' : 'text-slate-400'}
                      />
                      <span className="truncate text-[11.5px]">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.1 rounded-full text-[8.5px] font-bold ${
                          item.isAlert
                            ? 'bg-amber-400 text-black animate-soft-badge-glow'
                            : item.badge === 'STAGE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : item.badge === 'LFT'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Section B: TEAM TEXT FREQUENCIES & ROSTER CARDS */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                <span>TEAM FREQUENCIES</span>
                <span className="px-1 py-0.1 rounded bg-emerald-500/15 text-emerald-300 text-[8px]">
                  🎭 IC PERSONAS
                </span>
              </div>

              {filteredTeams.length === 0 ? (
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 text-center space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-mono">
                    No active team frequencies yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1300, 0.03);
                      (onOpenCreateSquad || onOpenTeamModal || onOpenSquadModal)?.();
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[9.5px] font-bold font-mono transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus size={10} />
                    <span>CREATE NEW TEAM</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredTeams.map((channel) => {
                    const matchedTeam = groups.find(
                      (g) =>
                        (g.id && channel.groupId && g.id === channel.groupId) ||
                        (g.channelId && g.channelId === channel.id) ||
                        (g.name &&
                          channel.name &&
                          g.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') ===
                            channel.name.toLowerCase()) ||
                        (g.name &&
                          channel.displayName &&
                          channel.displayName.toLowerCase().includes(g.name.toLowerCase()))
                    );
                    const isActiveChannel =
                      activeStageMode === 'comms' && activeChannelId === channel.id;
                    return (
                      <div key={channel.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (matchedTeam?.id && activeGroup?.id !== matchedTeam.id) {
                              selectGroup?.(matchedTeam.id);
                            }
                            selectChannel(channel.id);
                            onReturnToCommsStream?.();
                            onSelectChannel?.();
                          }}
                          className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-all cursor-pointer border ${
                            isActiveChannel
                              ? 'bg-emerald-950/50 border-l-4 border-l-emerald-400 border-emerald-500/50 text-emerald-100 font-bold shadow-sm'
                              : 'border-slate-800/70 bg-slate-950/60 text-slate-200 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Hash size={14} className="text-emerald-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs truncate">
                                {channel.displayName || `#${channel.name}`}
                              </div>
                              <div className="text-[9.5px] text-slate-400 truncate">
                                {matchedTeam?.name
                                  ? `${matchedTeam.name} • Encrypted Team Relay`
                                  : 'Encrypted Team Relay'}
                              </div>
                            </div>
                          </div>
                          {(unreadCounts[channel.id] || 0) > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                              {unreadCounts[channel.id]}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section C: TEAM VOICE LOUNGE (Always Visible with Live Occupancy!) */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Volume2 size={12} />
                  <span>VOICE LOUNGE</span>
                </span>
                <span className="text-[8.5px] text-slate-400">
                  {isSquadVoiceConnected
                    ? `${voiceParticipants.length + 1} Connected`
                    : 'Standby'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        isSquadVoiceConnected
                          ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300 animate-soft-back-glow'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Radio size={13} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-100 truncate">
                        {activeGroup?.name || 'Team'} Tactical Radio
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {isSquadVoiceConnected ? 'Connected • Live Opus' : 'Click Join to connect voice'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isSquadVoiceConnected) {
                        disconnectVoiceRoom();
                      } else {
                        connectToVoiceRoom(
                          activeSquadVoiceRoom,
                          `${activeGroup?.name || 'Team'} Radio`
                        );
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all shrink-0 border ${
                      isSquadVoiceConnected
                        ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/60 text-rose-200'
                        : 'bg-emerald-600/25 hover:bg-emerald-600/40 border-emerald-500/50 text-emerald-300'
                    }`}
                  >
                    {isSquadVoiceConnected ? 'LEAVE' : 'JOIN VOICE'}
                  </button>
                </div>

                {/* Live Voice Participants Tree */}
                {isSquadVoiceConnected && (
                  <div className="pl-2 pt-1.5 border-t border-slate-800/80 space-y-1">
                    {/* Self */}
                    <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-900/70 text-[10.5px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSpeaking
                              ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                              : 'bg-cyan-400'
                          }`}
                        />
                        <span className="font-bold text-white truncate">
                          @{userHandle || currentUser?.displayName || 'You'}
                        </span>
                      </div>
                      <span className="text-[8.5px] text-emerald-400">
                        {isSpeaking ? 'SPEAKING' : 'LIVE'}
                      </span>
                    </div>

                    {/* Remote Participants */}
                    {voiceParticipants.map((vp) => {
                      const speaking =
                        activeSpeakers.includes(vp.identity) || vp.isSpeaking;
                      return (
                        <div
                          key={vp.identity}
                          className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-900/70 text-[10.5px]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                speaking
                                  ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                                  : 'bg-slate-500'
                              }`}
                            />
                            <span className="font-bold text-slate-200 truncate">
                              {vp.name}
                            </span>
                          </div>
                          {speaking && (
                            <span className="text-[8.5px] text-emerald-400 font-bold">
                              SPEAKING
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Section D: ACTIVE FIRETEAM ROSTER PREVIEW */}
            {activeSquadChannel && (
              <div className="pt-1 border-t border-slate-800/80">
                {renderTeamCard(activeSquadChannel)}
              </div>
            )}
          </div>
        </>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════
           MODE A: FREQS TREE (HOLONET FREQUENCIES & DIRECT WHISPERS BRANCHES)
           ══════════════════════════════════════════════════════════════════════ */
        <>
          {/* ── Top Header & Fast Search ── */}
          <div className="p-3 border-b border-slate-800 space-y-2 bg-[#0a0f1a] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                  <Radio size={14} className="animate-soft-back-glow" />
                </div>
                <div>
                  <span className="text-xs font-mono font-extrabold tracking-wider text-slate-100 uppercase block">
                    FREQS
                  </span>
                  <span className="text-[9.5px] font-mono text-cyan-400 block font-bold">
                    HOLONET & DIRECT WHISPERS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenCreateModal}
                className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                title="Create Custom Frequency or Direct Whisper"
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
                placeholder="Search HoloNet frequencies or whispers..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* ── FREQS Hierarchical Branch Tree ── */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2.5 no-scrollbar">
            {/* Root Node: FREQS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1050, 0.02);
                    setFreqsRootCollapsed(prev => !prev);
                  }}
                  className="flex items-center gap-1.5 text-[10.5px] font-mono font-extrabold uppercase tracking-wider text-cyan-300 cursor-pointer"
                >
                  {freqsRootCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  <Radio size={12} className="text-cyan-400" />
                  <span>FREQS</span>
                </button>

                {/* Branch Quick Filter Pills */}
                <div className="flex items-center gap-1 font-mono text-[8.5px]">
                  {[
                    { id: 'all', label: 'ALL' },
                    { id: 'holonet', label: 'HOLONET' },
                    { id: 'whispers', label: 'WHISPERS' }
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1150, 0.02);
                        setActiveFreqBranch?.(pill.id);
                      }}
                      className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors border ${
                        activeFreqBranch === pill.id
                          ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-200'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tree Trunk & Branches under FREQS */}
              {!freqsRootCollapsed && (
                <div className="ml-2.5 pl-2.5 border-l-2 border-cyan-500/35 space-y-3 pt-0.5">
                  {/* ── BRANCH 1: HOLONET FREQUENCIES ── */}
                  {(activeFreqBranch === 'all' || activeFreqBranch === 'holonet') && (
                    <div className="relative space-y-1 before:content-[''] before:absolute before:-left-2.5 before:top-3.5 before:w-2 before:h-[2px] before:bg-cyan-500/35">
                      <div
                        onClick={() => toggleSection('public')}
                        className={`flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-colors ${
                          publicUnreadCount + customUnreadCount > 0 ? 'text-amber-300' : 'text-cyan-300'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          {collapsedSections.public ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                          <Globe size={12} className={publicUnreadCount + customUnreadCount > 0 ? 'text-amber-400' : 'text-cyan-400'} />
                          <span className="truncate">HOLONET FREQUENCIES</span>
                          {publicUnreadCount + customUnreadCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[8.5px] font-mono font-black rounded-full shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-soft-badge-glow shrink-0">
                              {publicUnreadCount + customUnreadCount} NEW
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCreateModal?.();
                            }}
                            className="px-1.5 py-0.2 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[8.5px] font-bold flex items-center gap-0.5 cursor-pointer"
                            title="Create New HoloNet Frequency"
                          >
                            <Plus size={9} />
                            <span>FREQ</span>
                          </button>
                          <span className="text-slate-400 text-[9.5px]">
                            {publicChannels.length + customChannels.length}
                          </span>
                        </div>
                      </div>

                      {!collapsedSections.public && (
                        <div className="ml-2.5 pl-2 border-l border-cyan-500/25 space-y-1 pt-0.5">
                          {filteredPublic.map(renderChannelItem)}

                          {customChannels.length > 0 && (
                            <div className="pt-1 space-y-0.5">
                              <div className="px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
                                <span>CUSTOM FREQUENCIES</span>
                                <span>{filteredCustom.length}</span>
                              </div>
                              {filteredCustom.map(renderChannelItem)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── BRANCH 2: DIRECT WHISPERS ── */}
                  {(activeFreqBranch === 'all' || activeFreqBranch === 'whispers') && (
                    <div className="relative space-y-1 before:content-[''] before:absolute before:-left-2.5 before:top-3.5 before:w-2 before:h-[2px] before:bg-cyan-500/35">
                      <div
                        onClick={() => toggleSection('direct')}
                        className={`flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition-colors ${
                          directUnreadCount > 0 ? 'text-amber-300' : 'text-purple-300'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          {collapsedSections.direct ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                          <MessageSquare size={12} className={directUnreadCount > 0 ? 'text-amber-400' : 'text-purple-400'} />
                          <span className="truncate">DIRECT WHISPERS</span>
                          {directUnreadCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[8.5px] font-mono font-black rounded-full shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-soft-badge-glow shrink-0">
                              {directUnreadCount} NEW
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCreateModal?.();
                            }}
                            className="px-1.5 py-0.2 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-[8.5px] font-bold flex items-center gap-0.5 cursor-pointer"
                            title="Start New Direct Whisper"
                          >
                            <Plus size={9} />
                            <span>WHISPER</span>
                          </button>
                          <span className="text-slate-400 text-[9.5px]">{allDirectChannels.length}</span>
                        </div>
                      </div>

                      {!collapsedSections.direct && (
                        <div className="ml-2.5 pl-2 border-l border-purple-500/25 space-y-0.5 pt-0.5">
                          {filteredDirect.length === 0 ? (
                            <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-900 text-[10px] text-slate-500 font-mono italic">
                              {searchQuery ? 'No matching direct whispers.' : 'No direct whispers open. Click + WHISPER to message an operator or persona.'}
                            </div>
                          ) : (
                            filteredDirect.map(renderChannelItem)
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. AUDIT TELEMETRY LOGS (Optional Collapsed) */}
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
        </>
      )}

      {/* ── Persistent Operator, Persona & Voice Transceiver Deck ── */}
      <TransceiverDeck />

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
