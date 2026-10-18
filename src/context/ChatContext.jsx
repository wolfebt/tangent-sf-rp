import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useFolio } from './FolioContext';
import { useSquad } from './SquadContext';
import { ChatService, DEFAULT_PUBLIC_CHANNELS } from '../services/chatService';
import { AudioService } from '../services/audioService';
import { rollDice } from '../services/diceService';
import { 
  getFolioTombstones, 
  isFolioPersonaDeleted, 
  isPersonaEmptyTemplate, 
  getEffectiveUserHandle 
} from '../utils/personaValidationUtils';
import { showToast } from './ToastContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const isTeamChannel = (channel) => {
  if (!channel) return false;
  return channel.type === 'group' || 
         Boolean(channel.groupId) || 
         (typeof channel.id === 'string' && channel.id.startsWith('group_')) || 
         (Array.isArray(channel.characterMembers) && channel.characterMembers.length > 0);
};

export const isStandardChannel = (channel) => {
  if (!channel) return false;
  return channel.type === 'public' || 
         (typeof channel.id === 'string' && channel.id.startsWith('public_')) ||
         channel.type === 'standard' ||
         (typeof channel.id === 'string' && channel.id.startsWith('standard_'));
};

export const getChannelAddressingMode = (channel) => {
  if (!channel) return 'operator';
  if (channel.addressingMode === 'persona' || channel.addressingMode === 'operator') {
    if (isTeamChannel(channel)) return 'persona';
    return channel.addressingMode;
  }
  if (isTeamChannel(channel)) return 'persona';
  if (channel.type === 'direct' || (typeof channel.id === 'string' && channel.id.startsWith('dm_'))) {
    if (channel.recipientType === 'character' || Boolean(channel.targetPersona) || (typeof channel.id === 'string' && channel.id.startsWith('dm_char_'))) {
      return 'persona';
    }
    return 'operator';
  }
  if (channel.type === 'persona_log' || (typeof channel.id === 'string' && channel.id.startsWith('persona_log_'))) {
    return 'persona';
  }
  return 'operator';
};

export const ChatProvider = ({ children }) => {
  const { currentUser, userHandle, openAuthModal } = useAuth() || {};
  const folio = useFolio() || {};
  const { activePersona: folioActivePersona, personaRoster, roster, togglePersonaNetworkEngaged, cloudSaveStatus } = folio;
  const { groups = [], activeGroup } = useSquad() || {};

  const [channels, setChannels] = useState(DEFAULT_PUBLIC_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('public_general');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isCommsDockOpen, setIsCommsDockOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [userDirectory, setUserDirectory] = useState([]);
  const [speakingMode, setSpeakingMode] = useState('OOC'); // 'OOC' | 'IC'
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [channelPersonaOverrides, setChannelPersonaOverrides] = useState({});
  const [directSortMode, setDirectSortMode] = useState('alphabetical'); // 'alphabetical' | 'recent'
  const [activeNavTab, setActiveNavTab] = useState('matrix'); // 'matrix' | 'roster' | 'teams' | 'vtt' | 'logs' | 'settings'
  const [broadcastToVtt, setBroadcastToVtt] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  // Operator Manual Presence State ('online' | 'idle' | 'dnd' | 'invisible') & Custom Status Message
  const [manualPresenceStatus, setManualPresenceStatusState] = useState(() => {
    try {
      return localStorage.getItem('tangent_manual_presence_status') || 'online';
    } catch {
      return 'online';
    }
  });

  const [customStatusMessage, setCustomStatusMessageState] = useState(() => {
    try {
      return localStorage.getItem('tangent_custom_status_message') || '';
    } catch {
      return '';
    }
  });

  const setManualPresenceStatus = useCallback((nextStatus) => {
    const clean = ['online', 'idle', 'dnd', 'invisible'].includes(nextStatus) ? nextStatus : 'online';
    setManualPresenceStatusState(clean);
    try {
      localStorage.setItem('tangent_manual_presence_status', clean);
    } catch {}
  }, []);

  const setCustomStatusMessage = useCallback((msg) => {
    const clean = String(msg || '').slice(0, 100);
    setCustomStatusMessageState(clean);
    try {
      localStorage.setItem('tangent_custom_status_message', clean);
    } catch {}
  }, []);

  // New operator logins & unseen message notifications
  const location = useLocation();
  const [hasNewOperatorLogins, setHasNewOperatorLogins] = useState(false);
  const [newOperatorLogins, setNewOperatorLogins] = useState([]);
  const knownOnlineUsersRef = useRef(new Set());
  const initialPresenceReceivedRef = useRef(false);
  const hiddenIdleTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const [lastReadTimestamps, setLastReadTimestamps] = useState(() => {
    try {
      const raw = localStorage.getItem('tangent_channel_last_read');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const markChannelAsRead = useCallback((channelId) => {
    if (!channelId) return;
    const now = Date.now();
    setLastReadTimestamps(prev => {
      const next = { ...prev, [channelId]: now };
      try {
        localStorage.setItem('tangent_channel_last_read', JSON.stringify(next));
      } catch {}
      return next;
    });
    setUnreadCounts(prev => {
      if (!prev[channelId]) return prev;
      const next = { ...prev };
      delete next[channelId];
      return next;
    });
  }, []);

  const clearNewOperatorLogins = useCallback(() => {
    setHasNewOperatorLogins(false);
    setNewOperatorLogins([]);
  }, []);

  // When on comms and activeChannelId changes or on route enter, mark active channel as read
  useEffect(() => {
    const isCommsRoute = location.pathname.startsWith('/network') || location.pathname.startsWith('/comms');
    if (isCommsRoute && activeChannelId) {
      markChannelAsRead(activeChannelId);
    }
  }, [location.pathname, activeChannelId, markChannelAsRead]);

  // When viewing Roster tab in comms, automatically clear operator login notification
  useEffect(() => {
    if (activeNavTab === 'roster' && hasNewOperatorLogins) {
      clearNewOperatorLogins();
    }
  }, [activeNavTab, hasNewOperatorLogins, clearNewOperatorLogins]);

  // All local personas for current user with network engagement flags
  const allUserPersonas = useMemo(() => {
    const tombstones = getFolioTombstones();
    const list = [];
    const seen = new Set();
    const source = Array.isArray(personaRoster) && personaRoster.length > 0
      ? personaRoster
      : (Array.isArray(roster) && roster.length > 0 ? roster : (folioActivePersona ? [folioActivePersona] : []));

    // Check if operator has explicitly set network flags on any persona
    const hasExplicitFlags = source.some(p => typeof p.networkEngaged === 'boolean' || typeof p.isNetworkEngaged === 'boolean');
    const activeDocId = folioActivePersona ? (folioActivePersona['character-doc-id'] || folioActivePersona.id) : null;

    source.forEach((p, idx) => {
      if (!p) return;
      const pId = p['character-doc-id'] || p.id;
      const pName = p['char-name'] || p.name;
      if (pId && pName && !seen.has(pId) && !isFolioPersonaDeleted(pId, tombstones) && !isPersonaEmptyTemplate(p) && !p.isDeleted) {
        seen.add(pId);

        const isEngaged = hasExplicitFlags
          ? Boolean(p.networkEngaged ?? p.isNetworkEngaged)
          : (activeDocId ? pId === activeDocId : idx === 0);

        list.push({
          id: pId,
          'character-doc-id': pId,
          name: pName,
          species: p['char-species'] || p.species || 'Human',
          role: p['char-concept'] || p.role || p['char-occu'] || 'Specialist',
          avatar: p.avatar || null,
          health: p.health || 30,
          current_health: p.current_health ?? p.currentHealth ?? 30,
          vitality: p.vitality || 30,
          current_vitality: p.current_vitality ?? p.currentVitality ?? 30,
          ownerUid: currentUser?.uid,
          ownerHandle: userHandle || getEffectiveUserHandle(currentUser),
          isOnline: true,
          networkEngaged: isEngaged,
          isNetworkEngaged: isEngaged
        });
      }
    });

    return list;
  }, [personaRoster, roster, folioActivePersona, currentUser, userHandle]);

  // Network-engaged personas: ONLY the personas flagged for the network to engage
  const currentUserCharacters = useMemo(() => {
    return allUserPersonas.filter(p => p.networkEngaged);
  }, [allUserPersonas]);

  // Resolve matched Squad for the currently active channel
  const activeChannelGroup = useMemo(() => {
    const ch = channels.find(c => c.id === activeChannelId);
    if (!ch) return null;
    return (groups || []).find(g =>
      (g.id && ch.groupId && g.id === ch.groupId) ||
      (g.channelId && g.channelId === ch.id) ||
      `group_chan_${g.id}` === ch.id
    ) || null;
  }, [channels, activeChannelId, groups]);

  // Enrolled character specifically assigned by currentUser to the active Team channel's squad
  const squadEnrolledPersona = useMemo(() => {
    if (!activeChannelGroup || !currentUser?.uid) return null;
    const enrolled = activeChannelGroup.memberDetails?.[currentUser.uid]?.persona;
    if (!enrolled) return null;
    const enrolledId = enrolled.id || enrolled['character-doc-id'] || enrolled.docId;
    const fullMatch = allUserPersonas.find(p =>
      (enrolledId && (p.id === enrolledId || p['character-doc-id'] === enrolledId)) ||
      (enrolled.name && p.name?.toLowerCase() === enrolled.name?.toLowerCase())
    );
    return fullMatch || {
      ...enrolled,
      id: enrolledId || enrolled.name,
      'character-doc-id': enrolledId || enrolled.name,
      'char-name': enrolled.name,
      'char-species': enrolled.species,
      'char-concept': enrolled.role
    };
  }, [activeChannelGroup, currentUser, allUserPersonas]);

  // Auto-bind speaking persona: in Team channels, default to the squad's enrolled persona (unless overridden for this channel)
  useEffect(() => {
    const override = activeChannelId ? channelPersonaOverrides[activeChannelId] : null;
    if (override) {
      setSelectedPersona(override);
      return;
    }
    if (squadEnrolledPersona) {
      setSelectedPersona(squadEnrolledPersona);
      return;
    }
    if (folioActivePersona && (!selectedPersona || selectedPersona.id === (folioActivePersona['character-doc-id'] || folioActivePersona.id))) {
      setSelectedPersona(folioActivePersona);
    } else if (!selectedPersona && currentUserCharacters.length > 0) {
      setSelectedPersona(currentUserCharacters[0]);
    }
  }, [activeChannelId, channelPersonaOverrides, squadEnrolledPersona, folioActivePersona, currentUserCharacters]);

  // Initialize default channels in Firestore once an authenticated user is connected or on mount
  useEffect(() => {
    ChatService.initDefaultChannels();
  }, [currentUser]);

  // Live Activity Telemetry descriptor for current user
  const currentActivity = useMemo(() => {
    const path = location?.pathname || '';
    const ch = channels.find(c => c.id === activeChannelId);
    const pName = selectedPersona?.name || selectedPersona?.['char-name'] || null;
    const pId = selectedPersona?.id || selectedPersona?.['character-doc-id'] || null;

    if (path.startsWith('/stage')) {
      return {
        type: 'vtt',
        label: activeGroup ? `VTT Stage: ${activeGroup.name}` : 'In Tactical VTT Stage',
        channelId: activeChannelId,
        squadId: activeGroup?.id || activeChannelGroup?.id || null,
        personaId: pId,
        personaName: pName
      };
    }
    if (path.startsWith('/folio')) {
      return {
        type: 'folio',
        label: pName ? `Folio Dossier: ${pName}` : 'Configuring Folio Dossier',
        channelId: activeChannelId,
        squadId: activeChannelGroup?.id || null,
        personaId: pId,
        personaName: pName
      };
    }
    if (activeChannelGroup) {
      return {
        type: 'squad',
        label: `Squad: ${activeChannelGroup.name}${pName ? ` (${pName})` : ''}`,
        channelId: activeChannelId,
        squadId: activeChannelGroup.id,
        personaId: pId,
        personaName: pName
      };
    }
    if (ch) {
      const isDirect = ch.type === 'direct' || String(ch.id).startsWith('dm_');
      return {
        type: isDirect ? 'dm' : 'channel',
        label: isDirect ? 'In Encrypted Direct Comms' : `HoloNet: ${ch.displayName || `#${ch.name}`}`,
        channelId: activeChannelId,
        squadId: null,
        personaId: pId,
        personaName: pName
      };
    }
    return {
      type: 'online',
      label: 'Connected to Terran Net',
      channelId: activeChannelId,
      squadId: null,
      personaId: pId,
      personaName: pName
    };
  }, [location?.pathname, channels, activeChannelId, activeGroup, activeChannelGroup, selectedPersona]);

  // Presence Heartbeat & Window Lifecycle Management (with 90s Tab-Blur Hysteresis)
  useEffect(() => {
    if (!currentUser) return;

    const currentPersona = selectedPersona || folioActivePersona;
    const isConfirmedEmpty = cloudSaveStatus === 'saved' && Array.isArray(personaRoster) && personaRoster.length === 0;
    const personasSummary = currentUserCharacters.map(c => ({
      id: c.id,
      'character-doc-id': c.id,
      name: c.name,
      species: c.species,
      role: c.role,
      avatar: c.avatar
    }));

    const buildExtra = () => ({
      userHandle,
      activePersona: selectedPersona || folioActivePersona,
      personasSummary,
      forceEmptyPersonas: isConfirmedEmpty,
      statusMessage: customStatusMessage,
      activity: currentActivity,
      activeSquadId: activeChannelGroup?.id || activeGroup?.id || null
    });

    const effectiveStatus = manualPresenceStatus || 'online';
    ChatService.updateUserPresence(currentUser, effectiveStatus, buildExtra());

    const interval = setInterval(() => {
      const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      const statusToSend = manualPresenceStatus !== 'online'
        ? manualPresenceStatus
        : (isHidden ? 'idle' : 'online');
      ChatService.updateUserPresence(currentUser, statusToSend, buildExtra());
    }, 60000);

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      if (isVisible) {
        if (hiddenIdleTimerRef.current) {
          clearTimeout(hiddenIdleTimerRef.current);
          hiddenIdleTimerRef.current = null;
        }
        ChatService.updateUserPresence(currentUser, manualPresenceStatus || 'online', buildExtra());
      } else {
        // 90-second hysteresis before marking tab-blurred operator as 'idle'
        if (hiddenIdleTimerRef.current) clearTimeout(hiddenIdleTimerRef.current);
        hiddenIdleTimerRef.current = setTimeout(() => {
          if (document.visibilityState === 'hidden' && manualPresenceStatus === 'online') {
            ChatService.updateUserPresence(currentUser, 'idle', buildExtra());
          }
        }, 90000);
      }
    };

    const handleOfflineExit = () => {
      ChatService.updateUserPresence(currentUser, 'offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleOfflineExit);
    window.addEventListener('beforeunload', handleOfflineExit);

    return () => {
      clearInterval(interval);
      if (hiddenIdleTimerRef.current) {
        clearTimeout(hiddenIdleTimerRef.current);
        hiddenIdleTimerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleOfflineExit);
      window.removeEventListener('beforeunload', handleOfflineExit);
    };
  }, [
    currentUser,
    userHandle,
    selectedPersona,
    folioActivePersona,
    currentUserCharacters,
    cloudSaveStatus,
    personaRoster,
    manualPresenceStatus,
    customStatusMessage,
    currentActivity,
    activeChannelGroup?.id,
    activeGroup?.id
  ]);

  // Subscribe to channels visible to current user
  useEffect(() => {
    const unsubscribe = ChatService.subscribeToUserChannels(currentUser, (updatedChannels) => {
      // Merge with default public channels if firestore is still populating
      const combined = [...updatedChannels];
      DEFAULT_PUBLIC_CHANNELS.forEach(def => {
        if (!combined.some(c => c.id === def.id)) {
          combined.unshift(def);
        }
      });
      setChannels(combined);

      // Reconcile unseen messages across channels using lastMessage timestamps
      setUnreadCounts(prev => {
        const next = { ...prev };
        const isOnComms = typeof window !== 'undefined' && 
          (window.location.pathname.startsWith('/network') || window.location.pathname.startsWith('/comms')) && 
          document.visibilityState === 'visible';

        combined.forEach(ch => {
          if (ch.id === activeChannelId && isOnComms) {
            delete next[ch.id];
            return;
          }

          if (ch.lastMessage && ch.lastMessage.timestamp) {
            const msgTime = new Date(ch.lastMessage.timestamp).getTime();
            const lastRead = lastReadTimestamps[ch.id] || 0;
            const isOwn = currentUser && ch.lastMessage.senderId === currentUser.uid;

            if (!isOwn && msgTime > lastRead) {
              next[ch.id] = (next[ch.id] || 0) > 0 ? next[ch.id] : 1;
            }
          }
        });

        return next;
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, activeChannelId, lastReadTimestamps]);

  // Real-time listener for entire network directory and presence (detects new operator logins)
  useEffect(() => {
    const unsubscribe = ChatService.subscribeToUsersPresence(currentUser?.uid, (users) => {
      setUserDirectory(users);

      const onlineUsers = (users || []).filter(u => ChatService.isUserOnline(u));
      const currentOnlineUids = new Set(onlineUsers.map(u => u.uid));

      if (!initialPresenceReceivedRef.current) {
        initialPresenceReceivedRef.current = true;
        knownOnlineUsersRef.current = currentOnlineUids;
      } else {
        // Detect newly online users other than local operator
        const newlyOnline = onlineUsers.filter(u => 
          u.uid !== currentUser?.uid && !knownOnlineUsersRef.current.has(u.uid)
        );

        if (newlyOnline.length > 0) {
          setNewOperatorLogins(prev => {
            const existingUids = new Set(prev.map(p => p.uid));
            const additions = newlyOnline.filter(u => !existingUids.has(u.uid)).map(u => ({
              uid: u.uid,
              userHandle: getEffectiveUserHandle(u),
              displayName: u.displayName || u.userHandle || 'Operator',
              characters: u.characters || [],
              loginTime: new Date().toISOString()
            }));
            return [...prev, ...additions];
          });
          setHasNewOperatorLogins(true);
          AudioService.playTerminalBeep(1600, 0.04);
        }

        knownOnlineUsersRef.current = currentOnlineUids;
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Manual refresh fallback
  const refreshUserDirectory = useCallback(async () => {
    if (currentUser) {
      const users = await ChatService.fetchUsersDirectory(currentUser.uid);
      setUserDirectory(users);
    }
  }, [currentUser]);

  // Subscribe to active channel messages
  useEffect(() => {
    if (!activeChannelId) return;

    setLoadingMessages(true);
    const unsubscribe = ChatService.subscribeToMessages(activeChannelId, (newMessages) => {
      setMessages(newMessages);
      setLoadingMessages(false);

      if (newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        const isNotOwn = currentUser && lastMsg.senderId && lastMsg.senderId !== currentUser.uid;

        // Play subtle chirp if a new message arrives and it's not our own
        if (isNotOwn) {
          AudioService.playTerminalBeep(1350, 0.03);
        }

        // If user is not currently viewing Comms or window is in background, track message as unseen
        const isViewing = typeof window !== 'undefined' && 
          (window.location.pathname.startsWith('/network') || window.location.pathname.startsWith('/comms')) && 
          document.visibilityState === 'visible';

        if (!isViewing && isNotOwn) {
          setUnreadCounts(prev => ({
            ...prev,
            [activeChannelId]: (prev[activeChannelId] || 0) + 1
          }));
        } else if (isViewing) {
          markChannelAsRead(activeChannelId);
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeChannelId, currentUser, markChannelAsRead]);

  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === activeChannelId) || DEFAULT_PUBLIC_CHANNELS[0];
  }, [channels, activeChannelId]);

  const publicChannels = useMemo(() => {
    return channels.filter(c => 
      c.type === 'public' || 
      c.id.startsWith('public_') || 
      (c.isPublic === true && c.type !== 'direct' && c.type !== 'group' && !c.id.startsWith('dm_') && !c.id.startsWith('group_'))
    );
  }, [channels]);

  const directChannels = useMemo(() => {
    return channels.filter(c => c.type === 'direct' || c.id.startsWith('dm_'));
  }, [channels]);

  // Separate Direct Comms: Player Operator Channels (OOC) vs. Persona Channels (IC)
  const playerDirectChannels = useMemo(() => {
    const list = channels.filter(c => 
      (c.type === 'direct' || c.id.startsWith('dm_')) && 
      (c.recipientType === 'player' || (!c.targetPersona && !c.id.startsWith('dm_char_')))
    );

    if (directSortMode === 'recent') {
      return [...list].sort((a, b) => {
        const timeA = new Date(a.lastMessage?.timestamp || a.updatedAt || 0).getTime();
        const timeB = new Date(b.lastMessage?.timestamp || b.updatedAt || 0).getTime();
        return timeB - timeA;
      });
    }

    return [...list].sort((a, b) => {
      const nameA = (a.displayName || a.name || '').toLowerCase();
      const nameB = (b.displayName || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [channels, directSortMode]);

  const characterDirectChannels = useMemo(() => {
    const list = channels.filter(c => 
      (c.type === 'direct' || c.id.startsWith('dm_')) && 
      (c.recipientType === 'character' || Boolean(c.targetPersona) || c.id.startsWith('dm_char_'))
    );

    if (directSortMode === 'recent') {
      return [...list].sort((a, b) => {
        const timeA = new Date(a.lastMessage?.timestamp || a.updatedAt || 0).getTime();
        const timeB = new Date(b.lastMessage?.timestamp || b.updatedAt || 0).getTime();
        return timeB - timeA;
      });
    }

    return [...list].sort((a, b) => {
      const nameA = (a.targetPersona?.name || a.displayName || a.name || '').toLowerCase();
      const nameB = (b.targetPersona?.name || b.displayName || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [channels, directSortMode]);

  // Aggregate pending message notes categorized per character and per player
  const pendingCharacterNotes = useMemo(() => {
    const notes = [];
    Object.entries(unreadCounts).forEach(([chanId, count]) => {
      if (!count || count <= 0) return;
      const chan = channels.find(c => c.id === chanId);
      if (!chan) return;

      const isChar = chan.recipientType === 'character' || Boolean(chan.targetPersona) || chan.id.startsWith('dm_char_');
      const isPlayer = chan.recipientType === 'player' || (chan.id.startsWith('dm_') && !isChar);

      if (isChar) {
        const charName = chan.targetPersona?.name || chan.displayName?.replace(/^🎭\s*/, '') || 'Persona';
        notes.push({
          channelId: chanId,
          type: 'character',
          characterId: chan.targetPersona?.id || chanId,
          name: charName,
          count,
          playerHandle: chan.targetPlayer?.handle || chan.targetPersona?.ownerHandle || '',
          lastSnippet: chan.lastMessage?.text || 'Incoming encrypted whisper'
        });
      } else if (isPlayer) {
        notes.push({
          channelId: chanId,
          type: 'player',
          characterId: null,
          name: chan.displayName || `@${chan.name}`,
          count,
          playerHandle: chan.displayName?.replace(/^@/, '') || chan.name,
          lastSnippet: chan.lastMessage?.text || 'Incoming operator message'
        });
      }
    });

    return notes;
  }, [unreadCounts, channels]);

  // Set of character IDs belonging to current user
  const userPersonaIds = useMemo(() => {
    const ids = new Set();
    (personaRoster || []).forEach(p => {
      const id = p['character-doc-id'] || p.id;
      if (id) ids.add(id);
    });
    (roster || []).forEach(p => {
      const id = p['character-doc-id'] || p.id;
      if (id) ids.add(id);
    });
    if (selectedPersona) {
      const id = selectedPersona['character-doc-id'] || selectedPersona.id;
      if (id) ids.add(id);
    }
    return ids;
  }, [personaRoster, roster, selectedPersona]);

  // Effective Network User Directory reconciling live Firestore directory with local user, squad members & tombstone filters
  const effectiveUserDirectory = useMemo(() => {
    const list = [];
    const seenUids = new Set();
    const tombstones = getFolioTombstones();

    (userDirectory || []).forEach(u => {
      if (!u || !u.uid) return;
      seenUids.add(u.uid);

      const isCurrent = currentUser && u.uid === currentUser.uid;
      const effectiveHandle = isCurrent 
        ? (userHandle || getEffectiveUserHandle(currentUser))
        : getEffectiveUserHandle(u);

      // If this is current user, always enforce canonical currentUserCharacters and live presence telemetry
      if (isCurrent) {
        list.push({
          ...u,
          userHandle: effectiveHandle,
          isOnline: manualPresenceStatus !== 'offline',
          presenceState: manualPresenceStatus || 'online',
          statusMessage: customStatusMessage || u.statusMessage || '',
          activity: currentActivity,
          activeSquadId: activeChannelGroup?.id || activeGroup?.id || null,
          currentPersona: selectedPersona ? {
            id: selectedPersona.id || selectedPersona['character-doc-id'],
            name: selectedPersona.name || selectedPersona['char-name'],
            species: selectedPersona.species || selectedPersona['char-species'] || 'Human',
            role: selectedPersona.role || selectedPersona['char-concept'] || 'Specialist',
            avatar: selectedPersona.avatar || null
          } : u.currentPersona,
          characters: currentUserCharacters
        });
      } else {
        // Filter other users' characters against tombstones and empty templates
        const filteredChars = (Array.isArray(u.characters) ? u.characters : []).filter(c => {
          const cId = c.id || c['character-doc-id'] || c.name;
          return cId && !isFolioPersonaDeleted(cId, tombstones) && !isPersonaEmptyTemplate(c) && !c.isDeleted;
        });

        list.push({
          ...u,
          userHandle: effectiveHandle,
          presenceState: u.presenceState || (u.isOnline ? 'online' : 'offline'),
          characters: filteredChars
        });
      }
    });

    // Ensure current user is ALWAYS present in the directory even before Firestore syncs
    if (currentUser && !seenUids.has(currentUser.uid)) {
      seenUids.add(currentUser.uid);
      list.unshift({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email || 'Operator',
        userHandle: userHandle || getEffectiveUserHandle(currentUser),
        isOnline: manualPresenceStatus !== 'offline',
        presenceState: manualPresenceStatus || 'online',
        statusMessage: customStatusMessage || '',
        activity: currentActivity,
        activeSquadId: activeChannelGroup?.id || activeGroup?.id || null,
        characters: currentUserCharacters,
        lastSeenLocal: new Date().toISOString()
      });
    }

    // Reconcile any offline squad members from groups so squad rosters always have complete member records
    (groups || []).forEach(g => {
      const memberIds = Array.isArray(g.members) ? g.members : [];
      memberIds.forEach(mUid => {
        if (!mUid || seenUids.has(mUid)) return;
        seenUids.add(mUid);
        const detail = g.memberDetails?.[mUid] || {};
        const handle = detail.handle || g.memberNames?.[mUid] || 'Operative';
        const enrolledP = detail.persona;
        const chars = enrolledP ? [{
          id: enrolledP.id || enrolledP['character-doc-id'] || enrolledP.name,
          'character-doc-id': enrolledP.id || enrolledP['character-doc-id'] || enrolledP.name,
          name: enrolledP.name || enrolledP['char-name'] || 'Operative',
          species: enrolledP.species || enrolledP['char-species'] || 'Human',
          role: enrolledP.role || enrolledP['char-concept'] || 'Specialist',
          avatar: enrolledP.avatar || null,
          ownerUid: mUid,
          ownerHandle: handle
        }] : [];
        list.push({
          uid: mUid,
          displayName: handle,
          userHandle: handle,
          status: 'offline',
          presenceState: 'offline',
          isOnline: false,
          lastSeenText: 'Offline',
          characters: chars
        });
      });
    });

    return list;
  }, [userDirectory, currentUser, userHandle, currentUserCharacters, manualPresenceStatus, customStatusMessage, currentActivity, activeChannelGroup, activeGroup, selectedPersona, groups]);

  // Flattened list of all discovered separate characters across registered players
  const charactersDirectory = useMemo(() => {
    const list = [];
    const seen = new Set();
    effectiveUserDirectory.forEach(u => {
      if (Array.isArray(u.characters)) {
        u.characters.forEach(c => {
          const id = c.id || c['character-doc-id'] || c.name;
          if (id && !seen.has(id)) {
            seen.add(id);
            list.push(c);
          }
        });
      }
    });
    return list;
  }, [effectiveUserDirectory]);

  // All network personas with owner handles, squad enrollments, and 3-tier character presence
  const allNetworkPersonas = useMemo(() => {
    const list = [];
    const seen = new Set();
    effectiveUserDirectory.forEach(u => {
      const uHandle = u.userHandle || getEffectiveUserHandle(u);
      if (Array.isArray(u.characters)) {
        u.characters.forEach(c => {
          const cId = c.id || c['character-doc-id'] || c.name;
          if (cId && !seen.has(cId)) {
            seen.add(cId);
            const enrolledSquads = (groups || []).filter(g => {
              const p = g.memberDetails?.[u.uid]?.persona;
              if (!p) return false;
              const pId = p.id || p['character-doc-id'] || p.name;
              return pId === cId || (p.name && c.name && p.name.toLowerCase() === c.name.toLowerCase());
            }).map(g => ({ id: g.id, name: g.name, faction: g.faction }));

            const isActivelyPiloted = Boolean(
              u.isOnline && (
                u.currentPersona?.id === cId ||
                u.activity?.personaId === cId ||
                (u.currentPersona?.name && c.name && u.currentPersona.name.toLowerCase() === c.name.toLowerCase())
              )
            );
            const characterPresence = !u.isOnline
              ? 'offline'
              : (isActivelyPiloted ? 'deployed' : 'on_call');

            list.push({
              ...c,
              targetUser: u,
              ownerUid: u.uid,
              ownerHandle: uHandle,
              isOnline: Boolean(u.isOnline),
              operatorPresenceState: u.presenceState || (u.isOnline ? 'online' : 'offline'),
              characterPresence,
              enrolledSquads
            });
          }
        });
      }
    });
    return list;
  }, [effectiveUserDirectory, groups]);

  // Online / Offline sorted sets (sorted by presence state priority then handle)
  const onlineOperators = useMemo(() => {
    const rank = { online: 0, dnd: 1, idle: 2, offline: 3 };
    return effectiveUserDirectory.filter(u => u.isOnline).sort((a, b) => {
      const rA = rank[a.presenceState] ?? 0;
      const rB = rank[b.presenceState] ?? 0;
      if (rA !== rB) return rA - rB;
      const nameA = getEffectiveUserHandle(a).toLowerCase();
      const nameB = getEffectiveUserHandle(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [effectiveUserDirectory]);

  const offlineOperators = useMemo(() => {
    return effectiveUserDirectory.filter(u => !u.isOnline).sort((a, b) => {
      const nameA = getEffectiveUserHandle(a).toLowerCase();
      const nameB = getEffectiveUserHandle(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [effectiveUserDirectory]);

  const onlinePersonas = useMemo(() => {
    const rank = { deployed: 0, on_call: 1, offline: 2 };
    return allNetworkPersonas.filter(p => p.isOnline).sort((a, b) => {
      const rA = rank[a.characterPresence] ?? 1;
      const rB = rank[b.characterPresence] ?? 1;
      if (rA !== rB) return rA - rB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [allNetworkPersonas]);

  const offlinePersonas = useMemo(() => {
    return allNetworkPersonas.filter(p => !p.isOnline).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [allNetworkPersonas]);

  // Team Channels (for teams the operator or any of their personas is enrolled in)
  const teamChannels = useMemo(() => {
    return channels.filter(c => {
      const isGroupType = c.type === 'group' || !!c.groupId || c.id.startsWith('group_') || (Array.isArray(c.characterMembers) && c.characterMembers.length > 0);
      if (!isGroupType) return false;
      if (!currentUser) return c.isPublic;
      const isUserMember = Array.isArray(c.members) && c.members.includes(currentUser.uid);
      const isPersonaMember = Array.isArray(c.characterMembers) && c.characterMembers.some(cm => 
        userPersonaIds.has(cm.id || cm['character-doc-id']) || cm.ownerUid === currentUser.uid
      );
      const isSquadMember = (groups || []).some(g =>
        (g.id === c.groupId || `group_chan_${g.id}` === c.id) &&
        Array.isArray(g.members) && g.members.includes(currentUser.uid)
      );
      return isUserMember || isPersonaMember || isSquadMember || c.createdById === currentUser.uid;
    });
  }, [channels, currentUser, userPersonaIds, groups]);

  const groupChannels = teamChannels;

  const personaLogChannels = useMemo(() => {
    return channels.filter(c => c.type === 'persona_log' || c.id.startsWith('persona_log_'));
  }, [channels]);

  const customChannels = useMemo(() => {
    return channels.filter(c => 
      c.type !== 'public' && 
      !c.id.startsWith('public_') && 
      c.type !== 'direct' && 
      !c.id.startsWith('dm_') && 
      c.type !== 'group' && 
      !c.groupId &&
      !c.id.startsWith('group_') &&
      !(Array.isArray(c.characterMembers) && c.characterMembers.length > 0) &&
      c.type !== 'persona_log' && 
      !c.id.startsWith('persona_log_')
    );
  }, [channels]);

  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadCounts).reduce((sum, c) => sum + (c || 0), 0);
  }, [unreadCounts]);

  const hasUnseenMessages = totalUnreadCount > 0;

  const toggleCommsDock = useCallback(() => {
    setIsCommsDockOpen(prev => !prev);
  }, []);

  const isCurrentTeamChannel = useMemo(() => isTeamChannel(activeChannel), [activeChannel]);
  const isCurrentStandardChannel = useMemo(() => isStandardChannel(activeChannel), [activeChannel]);
  const channelAddressingMode = useMemo(() => getChannelAddressingMode(activeChannel), [activeChannel]);

  // Channel participants tailored to channel context:
  // In Team channels, strictly addresses and lists ONLY the specific Character enrolled per member in that Squad,
  // plus Architect Command and Reserve Operators (members without an assigned character yet).
  // In Standard channels, addresses and lists Operators active across the HoloNet.
  const activeChannelUsers = useMemo(() => {
    if (!activeChannel) {
      return {
        mode: 'operator',
        group: null,
        personas: [],
        deployedPersonas: [],
        onCallPersonas: [],
        offlinePersonas: [],
        architectCommand: [],
        reserveOperators: [],
        operators: effectiveUserDirectory
      };
    }

    if (isTeamChannel(activeChannel)) {
      const grp = activeChannelGroup;
      const memberUids = new Set([
        ...(Array.isArray(activeChannel.members) ? activeChannel.members : []),
        ...(Array.isArray(grp?.members) ? grp.members : [])
      ]);
      if (activeChannel.createdById) memberUids.add(activeChannel.createdById);
      if (grp?.leaderId) memberUids.add(grp.leaderId);

      const personasList = [];
      const seenOwnerUids = new Set();
      const seenCharIds = new Set();

      const resolveCharacterPresence = (ownerUser, cId, cName) => {
        if (!ownerUser || !ownerUser.isOnline) return 'offline';
        const isCurrentSelf = currentUser && ownerUser.uid === currentUser.uid;
        if (isCurrentSelf) {
          const activePid = selectedPersona?.id || selectedPersona?.['character-doc-id'];
          if (activeChannelId === activeChannel.id || activePid === cId) {
            return 'deployed';
          }
        }
        const inThisSquad = (grp?.id && ownerUser.activeSquadId === grp.id) ||
          (ownerUser.activity?.channelId === activeChannel.id) ||
          (grp?.id && ownerUser.activity?.squadId === grp.id);
        const pilotingThisChar = (ownerUser.currentPersona?.id && ownerUser.currentPersona.id === cId) ||
          (ownerUser.activity?.personaId && ownerUser.activity.personaId === cId) ||
          (ownerUser.currentPersona?.name && cName && ownerUser.currentPersona.name.toLowerCase() === cName.toLowerCase());

        return (inThisSquad || pilotingThisChar) ? 'deployed' : 'on_call';
      };

      const addEnrolledPersona = (rawPersona, ownerUid, fallbackHandle, squadRole = 'Operative') => {
        if (!rawPersona) return;
        const cName = rawPersona.name || rawPersona['char-name'] || 'Operative';
        const cId = rawPersona.id || rawPersona['character-doc-id'] || rawPersona.docId || `${ownerUid || 'anon'}_${cName}`;
        if (seenCharIds.has(cId)) return;
        seenCharIds.add(cId);
        if (ownerUid) seenOwnerUids.add(ownerUid);

        const ownerUser = effectiveUserDirectory.find(u => u.uid === ownerUid) || null;
        // Enrich vitals/avatar from live user directory if available
        const liveChar = ownerUser?.characters?.find(c =>
          (c.id && c.id === cId) ||
          (c['character-doc-id'] && c['character-doc-id'] === cId) ||
          (c.name && c.name.toLowerCase() === cName.toLowerCase())
        );

        const characterPresence = resolveCharacterPresence(ownerUser, cId, cName);
        const effectiveHandle = ownerUser?.userHandle || fallbackHandle || getEffectiveUserHandle(ownerUser) || 'Operator';

        personasList.push({
          ...rawPersona,
          ...(liveChar || {}),
          id: cId,
          'character-doc-id': cId,
          name: cName,
          species: rawPersona.species || rawPersona['char-species'] || liveChar?.species || 'Human',
          role: rawPersona.role || rawPersona['char-concept'] || rawPersona['char-occu'] || liveChar?.role || 'Specialist',
          squadRole,
          avatar: rawPersona.avatar || liveChar?.avatar || null,
          health: liveChar?.health ?? rawPersona.health ?? 30,
          current_health: liveChar?.current_health ?? rawPersona.current_health ?? rawPersona.currentHealth ?? 30,
          vitality: liveChar?.vitality ?? rawPersona.vitality ?? 30,
          current_vitality: liveChar?.current_vitality ?? rawPersona.current_vitality ?? rawPersona.currentVitality ?? 30,
          ownerUid: ownerUid || null,
          ownerHandle: effectiveHandle,
          targetUser: ownerUser,
          isOnline: Boolean(ownerUser?.isOnline),
          operatorPresenceState: ownerUser?.presenceState || (ownerUser?.isOnline ? 'online' : 'offline'),
          operatorActivity: ownerUser?.activity || null,
          lastSeenText: ownerUser?.lastSeenText || 'Offline',
          characterPresence
        });
      };

      // 1. Primary authoritative source: Squad's memberDetails[uid].persona
      if (grp?.memberDetails && typeof grp.memberDetails === 'object') {
        Object.entries(grp.memberDetails).forEach(([uid, detail]) => {
          memberUids.add(uid);
          if (detail?.persona) {
            const sRole = uid === grp.leaderId
              ? 'Prime Architect'
              : (Array.isArray(grp.coArchitects) && grp.coArchitects.includes(uid) ? 'Co-Architect' : (detail.role || 'Operative'));
            addEnrolledPersona(detail.persona, uid, detail.handle || grp.memberNames?.[uid], sRole);
          }
        });
      }

      // 2. Secondary fallback: activeChannel.characterMembers (for any members not already resolved via grp.memberDetails)
      const charMembers = Array.isArray(activeChannel.characterMembers) ? activeChannel.characterMembers : [];
      charMembers.forEach(cm => {
        if (!cm) return;
        if (cm.ownerUid && seenOwnerUids.has(cm.ownerUid)) return;
        addEnrolledPersona(cm, cm.ownerUid, cm.ownerHandle, 'Operative');
      });

      const presenceRank = { deployed: 0, on_call: 1, offline: 2 };
      personasList.sort((a, b) => {
        const rA = presenceRank[a.characterPresence] ?? 2;
        const rB = presenceRank[b.characterPresence] ?? 2;
        if (rA !== rB) return rA - rB;
        return (a.name || '').localeCompare(b.name || '');
      });

      // Architect Command list (Leader + Co-Architects)
      const architectUids = new Set();
      if (grp?.leaderId) architectUids.add(grp.leaderId);
      if (Array.isArray(grp?.coArchitects)) grp.coArchitects.forEach(id => architectUids.add(id));
      if (architectUids.size === 0 && activeChannel.createdById) architectUids.add(activeChannel.createdById);

      const architectCommand = Array.from(architectUids).map(uid => {
        const u = effectiveUserDirectory.find(usr => usr.uid === uid);
        const detail = grp?.memberDetails?.[uid] || {};
        const handle = u?.userHandle || detail.handle || grp?.memberNames?.[uid] || (uid === grp?.leaderId ? grp?.leaderName : null) || 'Architect';
        const isPrime = uid === (grp?.leaderId || activeChannel.createdById);
        return {
          uid,
          userHandle: handle,
          displayName: handle,
          commandTitle: isPrime ? 'Prime Architect' : 'Co-Architect',
          isOnline: Boolean(u?.isOnline),
          presenceState: u?.presenceState || (u?.isOnline ? 'online' : 'offline'),
          activity: u?.activity || null,
          statusMessage: u?.statusMessage || '',
          lastSeenText: u?.lastSeenText || 'Offline',
          enrolledPersona: detail.persona || null,
          user: u || { uid, userHandle: handle, displayName: handle, isOnline: false }
        };
      });

      // Reserve Operators: Squad members who joined the squad but haven't assigned a character yet
      const reserveOperators = Array.from(memberUids)
        .filter(uid => !seenOwnerUids.has(uid))
        .map(uid => {
          const u = effectiveUserDirectory.find(usr => usr.uid === uid);
          const detail = grp?.memberDetails?.[uid] || {};
          const handle = u?.userHandle || detail.handle || grp?.memberNames?.[uid] || 'Operator';
          return u || {
            uid,
            userHandle: handle,
            displayName: handle,
            isOnline: false,
            presenceState: 'offline',
            lastSeenText: 'Offline',
            characters: []
          };
        });

      const operatorsList = effectiveUserDirectory.filter(u => memberUids.has(u.uid));

      return {
        mode: 'persona',
        group: grp || null,
        personas: personasList,
        deployedPersonas: personasList.filter(p => p.characterPresence === 'deployed'),
        onCallPersonas: personasList.filter(p => p.characterPresence === 'on_call'),
        offlinePersonas: personasList.filter(p => p.characterPresence === 'offline'),
        architectCommand,
        reserveOperators,
        operators: operatorsList.length > 0 ? operatorsList : effectiveUserDirectory
      };
    }

    // Standard / Public / Operator Channel
    return {
      mode: 'operator',
      group: null,
      personas: allNetworkPersonas,
      deployedPersonas: [],
      onCallPersonas: [],
      offlinePersonas: [],
      architectCommand: [],
      reserveOperators: [],
      operators: effectiveUserDirectory
    };
  }, [activeChannel, activeChannelGroup, effectiveUserDirectory, allNetworkPersonas, currentUser, selectedPersona, activeChannelId]);

  const selectChannel = useCallback((channelId) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveChannelId(channelId);
    setReplyingToMessage(null);
    markChannelAsRead(channelId);

    // Auto-adjust speaking mode based on channel addressing convention:
    // Team channels address Personas (IC). Standard channels address Operators (OOC).
    const targetChan = channels.find(c => c.id === channelId);
    if (targetChan) {
      const mode = getChannelAddressingMode(targetChan);
      if (mode === 'persona') {
        setSpeakingMode('IC');
      } else {
        setSpeakingMode('OOC');
      }
    }
  }, [channels, markChannelAsRead]);

  // Select persona with per-channel override memory
  const selectPersonaForChannel = useCallback((persona) => {
    setSelectedPersona(persona);
    if (activeChannelId && persona) {
      setChannelPersonaOverrides(prev => ({
        ...prev,
        [activeChannelId]: persona
      }));
    }
  }, [activeChannelId]);

  // Typing status notification (throttled to avoid excessive writes)
  const notifyTyping = useCallback(() => {
    if (!currentUser || !activeChannelId) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 2500) return;
    lastTypingSentRef.current = now;

    const isTeam = isTeamChannel(activeChannel);
    const effectiveIsIC = isTeam ? (speakingMode !== 'OOC') : (speakingMode === 'IC');
    const activeP = selectedPersona || squadEnrolledPersona || currentUserCharacters[0];
    const operatorHandle = userHandle || currentUser?.displayName || currentUser?.email || 'Operator';
    const displayName = (effectiveIsIC && activeP)
      ? (activeP.name || activeP['char-name'] || operatorHandle)
      : operatorHandle;

    ChatService.setChannelTypingStatus(activeChannelId, currentUser, displayName, true);
  }, [currentUser, activeChannelId, activeChannel, speakingMode, selectedPersona, squadEnrolledPersona, currentUserCharacters, userHandle]);

  // Active typing users in current channel (within last 6 seconds, excluding self)
  const activeTypingUsers = useMemo(() => {
    const map = activeChannel?.typingUsers;
    if (!map || typeof map !== 'object') return [];
    const now = Date.now();
    const list = [];
    Object.entries(map).forEach(([uid, info]) => {
      if (!info || uid === currentUser?.uid) return;
      const ts = typeof info.timestamp === 'number' ? info.timestamp : new Date(info.timestamp || 0).getTime();
      if (now - ts < 6500) {
        list.push({ uid, handle: info.handle || 'Operative' });
      }
    });
    return list;
  }, [activeChannel?.typingUsers, currentUser?.uid]);

  // Toggle emoji reaction on a message in the active channel
  const toggleMessageReaction = useCallback(async (messageId, emoji, targetChannelId = null) => {
    if (!currentUser) {
      openAuthModal?.();
      return;
    }
    const chanId = targetChannelId || activeChannelId;
    if (!chanId || !messageId || !emoji) return;
    const operatorHandle = userHandle || currentUser?.displayName || 'Operator';
    AudioService.playTerminalBeep(1350, 0.015);
    await ChatService.toggleMessageReaction(chanId, messageId, emoji, currentUser.uid, operatorHandle);
  }, [currentUser, activeChannelId, userHandle, openAuthModal]);

  // Send a dice roll transmission to the active or specified channel
  const sendDiceRoll = useCallback(async (diceRollData, targetChannelId = null) => {
    if (!currentUser) {
      AudioService.playTerminalBeep(450, 0.08);
      openAuthModal?.();
      showToast({
        type: 'error',
        title: 'Authentication Required',
        text: 'You must log into an authenticated Terran Net account to transmit dice rolls.'
      });
      return;
    }

    const channelId = targetChannelId || activeChannelId;
    if (!channelId) return;

    const targetChan = channels.find(c => c.id === channelId) || activeChannel;
    const channelMode = getChannelAddressingMode(targetChan);
    const isTeam = channelMode === 'persona';
    const effectiveIsIC = isTeam ? (speakingMode !== 'OOC') : (speakingMode === 'IC');
    const activeP = selectedPersona || squadEnrolledPersona || currentUserCharacters[0];
    const hasPersona = Boolean(activeP && (activeP.name || activeP['char-name']));

    const operatorHandle = userHandle || currentUser?.displayName || currentUser?.email || 'Operator';
    const isIC = Boolean(effectiveIsIC && hasPersona);
    const displayName = isIC 
      ? (activeP.name || activeP['char-name'] || activeP.identity?.name || operatorHandle) 
      : operatorHandle;

    const checkLabel = diceRollData.label ? `${diceRollData.label} ` : '';
    const advDiceCount = Number(diceRollData.advantageDice) || 0;
    const advTag = advDiceCount !== 0 
      ? ` [${advDiceCount > 0 ? `+${advDiceCount} Adv Pool` : `${advDiceCount} Disadv Pool`}]`
      : diceRollData.isAdvantage 
      ? ' [Advantage: I Got This]' 
      : diceRollData.isDisadvantage 
      ? ' [Disadvantage: Negative Karma]' 
      : '';
    const payload = {
      text: `${displayName} rolled ${checkLabel}(${diceRollData.expression || 'dice'})${advTag}: ${diceRollData.finalTotal ?? diceRollData.total ?? diceRollData.result}${diceRollData.outcome ? ` [${diceRollData.outcome}]` : ''}`,
      type: 'dice_roll',
      senderId: currentUser?.uid || 'anon',
      senderUid: currentUser?.uid || null,
      senderHandle: displayName,
      operatorHandle: operatorHandle,
      senderType: isIC ? 'persona' : 'operator',
      addressingMode: channelMode,
      isIC: isIC,
      broadcastToVtt: Boolean(broadcastToVtt),
      personaDetails: isIC ? {
        id: activeP['character-doc-id'] || activeP.id,
        name: activeP['char-name'] || activeP.name || 'Persona',
        species: activeP['char-species'] || activeP.species || 'Human',
        role: activeP['char-concept'] || activeP.role || activeP['char-occu'] || 'Specialist',
        operatorHandle: operatorHandle
      } : null,
      metadata: {
        ...diceRollData,
        result: diceRollData.finalTotal ?? diceRollData.total ?? diceRollData.result,
        finalTotal: diceRollData.finalTotal ?? diceRollData.total ?? diceRollData.result,
        naturalTotal: diceRollData.naturalTotal,
        dicePool: diceRollData.dicePool || diceRollData.rolls || [],
        keptDice: diceRollData.keptDice || [],
        appliedModifier: diceRollData.appliedModifier ?? diceRollData.modifier ?? 0,
        critThreshold: diceRollData.critThreshold ?? 20,
        fumbleThreshold: diceRollData.fumbleThreshold ?? 2,
        critRangeSize: diceRollData.critRangeSize ?? 1,
        fumbleRangeSize: diceRollData.fumbleRangeSize ?? 1,
        advantageDice: advDiceCount,
        flatModifier: diceRollData.flatModifier ?? diceRollData.appliedModifier ?? 0,
        targetDC: diceRollData.targetDC ?? diceRollData.targetNumber ?? null,
        outcome: diceRollData.outcome || null,
        margin: diceRollData.margin ?? null,
        expression: diceRollData.expression || 'Custom Roll',
        rolls: diceRollData.rolls || [],
        isCritical: diceRollData.isCritical || diceRollData.isCrit || false,
        isFumble: diceRollData.isFumble || false,
        broadcastToVtt: Boolean(broadcastToVtt)
      }
    };

    AudioService.playTerminalBeep(1550, 0.04);
    await ChatService.sendMessage(channelId, payload);
  }, [activeChannelId, channels, activeChannel, currentUser, userHandle, speakingMode, selectedPersona, squadEnrolledPersona, currentUserCharacters, broadcastToVtt, openAuthModal, showToast]);

  const sendMessage = useCallback(async (text, customPayload = {}) => {
    let rawText = text;
    let extra = customPayload;
    if (typeof text === 'object' && text !== null) {
      rawText = text.text || text.content || '';
      extra = { ...text, ...customPayload };
    }

    if (!currentUser) {
      AudioService.playTerminalBeep(450, 0.08);
      openAuthModal?.();
      showToast({
        type: 'error',
        title: 'Authentication Required',
        text: 'You must log into an authenticated Terran Net account to transmit messages.'
      });
      return;
    }

    if (!rawText && !extra.metadata && !extra.summary) return;
    const targetChannelId = extra.channelId || activeChannelId;
    if (!targetChannelId) return;

    const trimmed = (typeof rawText === 'string' ? rawText : '').trim();

    // 1. RPG command: /roll or /r
    if (trimmed.startsWith('/roll ') || trimmed.startsWith('/r ') || trimmed === '/roll' || trimmed === '/r') {
      const parts = trimmed.split(' ');
      const expr = parts[1] || '2d10';
      const label = parts.slice(2).join(' ') || 'Tactical Check';
      try {
        const rollResult = rollDice(expr, { label });
        await sendDiceRoll(rollResult, targetChannelId);
        return;
      } catch (err) {
        console.warn('Roll command error:', err);
      }
    }

    const targetChan = channels.find(c => c.id === targetChannelId) || activeChannel;
    const channelMode = getChannelAddressingMode(targetChan);
    const isTeam = channelMode === 'persona';
    const effectiveIsIC = extra.isIC !== undefined 
      ? Boolean(extra.isIC)
      : (isTeam ? (speakingMode !== 'OOC') : (speakingMode === 'IC'));

    const activeP = extra.persona || selectedPersona || squadEnrolledPersona || currentUserCharacters[0];
    const hasPersona = Boolean(activeP && (activeP.name || activeP['char-name']));
    const operatorHandle = userHandle || currentUser?.displayName || currentUser?.email || 'Anonymous Operator';
    const isIC = Boolean(effectiveIsIC && hasPersona);

    // 2. RPG command: /me or /act or /ooc
    let messageType = isIC ? 'ic_transmission' : 'text';
    let cleanText = rawText;
    if (trimmed.startsWith('/me ') || trimmed.startsWith('/act ')) {
      messageType = 'narrative_action';
      cleanText = trimmed.replace(/^\/(me|act)\s+/, '');
    } else if (trimmed.startsWith('/ooc ')) {
      messageType = 'ooc_remark';
      cleanText = trimmed.replace(/^\/ooc\s+/, '');
    }

    const activeReply = extra.replyTo !== undefined ? extra.replyTo : replyingToMessage;
    const replyPayload = activeReply ? {
      messageId: activeReply.id || activeReply.messageId,
      senderHandle: activeReply.senderHandle || activeReply.operatorHandle || 'Operative',
      snippet: String(activeReply.text || '').slice(0, 120)
    } : null;

    const payload = {
      text: cleanText || '',
      type: extra.type || messageType,
      senderId: currentUser?.uid || 'anon',
      senderUid: currentUser?.uid || null,
      senderHandle: isIC ? (activeP.name || activeP['char-name'] || activeP.identity?.name || operatorHandle) : operatorHandle,
      operatorHandle: operatorHandle,
      senderType: isIC ? 'persona' : 'operator',
      addressingMode: channelMode,
      isIC: isIC,
      replyTo: replyPayload,
      broadcastToVtt: Boolean(broadcastToVtt),
      personaDetails: isIC ? {
        id: activeP['character-doc-id'] || activeP.id,
        name: activeP['char-name'] || activeP.name || activeP.identity?.name || 'Persona',
        species: activeP['char-species'] || activeP.species || activeP.identity?.species || 'Human',
        role: activeP['char-concept'] || activeP.role || activeP['char-occu'] || activeP.identity?.role || 'Specialist',
        avatar: activeP.avatar || null,
        health: activeP.health || 30,
        currentHealth: activeP.current_health ?? (activeP.current_hp ?? 30),
        vitality: activeP.vitality || 30,
        currentVitality: activeP.current_vitality ?? 30,
        operatorHandle: operatorHandle
      } : null,
      ...extra
    };

    if (replyingToMessage) setReplyingToMessage(null);
    lastTypingSentRef.current = 0;
    ChatService.setChannelTypingStatus(targetChannelId, currentUser, operatorHandle, false);

    AudioService.playTerminalBeep(1450, 0.02);
    await ChatService.sendMessage(targetChannelId, payload);
  }, [activeChannelId, channels, activeChannel, currentUser, userHandle, speakingMode, selectedPersona, squadEnrolledPersona, currentUserCharacters, sendDiceRoll, broadcastToVtt, replyingToMessage, openAuthModal, showToast]);

  // Pulse an Architect Docket Block directive card directly into the Squad's Comms channel
  const pulseDocketBlockToChat = useCallback(async (block, groupObj = null) => {
    if (!block || !currentUser) return;
    const grp = groupObj || activeChannelGroup || activeGroup;
    const targetChannelId = grp?.channelId || (grp?.id ? `group_chan_${grp.id}` : activeChannelId);
    if (!targetChannelId) return;

    const operatorHandle = userHandle || currentUser?.displayName || 'Architect';
    const checklist = Array.isArray(block.checklist) ? block.checklist : [];
    const doneCount = checklist.filter(i => i.done).length;

    const payload = {
      text: `📋 [TACTICAL DOCKET // ${(block.category || 'INTEL').toUpperCase()}] ${block.title}: ${block.content || ''}`,
      type: 'docket_directive',
      senderId: currentUser.uid,
      senderUid: currentUser.uid,
      senderHandle: operatorHandle,
      operatorHandle,
      senderType: 'operator',
      isIC: false,
      metadata: {
        groupId: grp?.id || null,
        groupName: grp?.name || 'Squad',
        blockId: block.id,
        title: block.title,
        category: block.category || 'Intel',
        status: block.status || 'active',
        isPinned: Boolean(block.isPinned),
        visibility: block.visibility || 'all',
        content: block.content || '',
        checklist,
        checklistSummary: checklist.length > 0 ? `${doneCount}/${checklist.length}` : null,
        acknowledgedBy: Array.isArray(block.acknowledgedBy) ? block.acknowledgedBy : []
      }
    };

    AudioService.playTerminalBeep(1680, 0.05);
    await ChatService.sendMessage(targetChannelId, payload);
    showToast?.({
      type: 'info',
      title: 'Directive Pulsed to Comms',
      text: `"${block.title}" transmitted to ${grp?.name || 'Team'} frequency.`
    });
  }, [currentUser, activeChannelGroup, activeGroup, activeChannelId, userHandle, showToast]);

  // Start or open a 1-on-1 Direct Message with target user (and optional specific persona)
  const startDirectMessage = useCallback(async (targetUser, targetPersona = null) => {
    if (!currentUser) {
      openAuthModal?.();
      throw new Error('You must be logged in to send direct messages');
    }
    const dmChannel = await ChatService.getOrCreateDirectMessageChannel(currentUser, targetUser, targetPersona);
    selectChannel(dmChannel.id);
    return dmChannel;
  }, [currentUser, selectChannel, openAuthModal]);

  // Create a new custom or team group channel (supports characterMembers)
  const createNewChannel = useCallback(async ({ name, topic, isPublic, type, members, characterMembers }) => {
    const effectiveUser = currentUser || {
      uid: `local_${userHandle || 'operator'}`,
      displayName: userHandle || 'Local Operator',
      isLocal: true
    };
    const newChan = await ChatService.createCustomChannel({
      name,
      topic,
      isPublic,
      type,
      members,
      characterMembers,
      currentUser: effectiveUser
    });
    setChannels(prev => {
      const exists = prev.some(c => c.id === newChan.id);
      return exists ? prev : [newChan, ...prev];
    });
    selectChannel(newChan.id);
    return newChan;
  }, [currentUser, userHandle, selectChannel]);

  // Rename channel
  const renameChannel = useCallback(async (channelId, newDisplayName, newTopic) => {
    const res = await ChatService.renameChannel(channelId, newDisplayName, newTopic);
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        return {
          ...c,
          displayName: res.displayName || newDisplayName,
          name: res.name || c.name,
          topic: newTopic !== undefined ? newTopic : c.topic,
          updatedAt: res.updatedAt || new Date().toISOString()
        };
      }
      return c;
    }));
    AudioService.playTerminalBeep(1200, 0.02);
    return res;
  }, []);

  // Update channel properties (privacy, topic, etc.)
  const updateChannel = useCallback(async (channelId, updates) => {
    const res = await ChatService.updateChannel(channelId, updates);
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        return {
          ...c,
          ...updates,
          updatedAt: res?.updatedAt || new Date().toISOString()
        };
      }
      return c;
    }));
    AudioService.playTerminalBeep(1200, 0.02);
    return res;
  }, []);

  // Add member to channel
  const addChannelMember = useCallback(async (channelId, memberUid) => {
    await ChatService.addChannelMember(channelId, memberUid);
    AudioService.playTerminalBeep(1300, 0.02);
  }, []);

  // Remove member from channel
  const removeChannelMember = useCallback(async (channelId, memberUid) => {
    await ChatService.removeChannelMember(channelId, memberUid);
    AudioService.playTerminalBeep(1000, 0.02);
  }, []);

  // Delete channel
  const deleteChannel = useCallback(async (channelId) => {
    await ChatService.deleteChannel(channelId);
    setChannels(prev => prev.filter(c => c.id !== channelId));
    if (activeChannelId === channelId) {
      selectChannel('public_general');
    }
  }, [activeChannelId, selectChannel]);

  // Clear all messages in channel
  const clearChannelMessages = useCallback(async (channelId) => {
    const operator = userHandle || currentUser?.displayName || 'Operator';
    AudioService.playTerminalBeep(900, 0.05);
    await ChatService.clearChannelMessages(channelId, operator);
  }, [userHandle, currentUser]);

  const value = {
    channels,
    publicChannels,
    directChannels,
    playerDirectChannels,
    characterDirectChannels,
    teamChannels,
    groupChannels,
    directSortMode,
    setDirectSortMode,
    activeNavTab,
    setActiveNavTab,
    broadcastToVtt,
    setBroadcastToVtt,
    pendingCharacterNotes,
    charactersDirectory,
    allNetworkPersonas,
    onlineOperators,
    offlineOperators,
    onlinePersonas,
    offlinePersonas,
    personaLogChannels,
    customChannels,
    activeChannel,
    activeChannelId,
    activeChannelGroup,
    squadEnrolledPersona,
    selectChannel,
    messages,
    loadingMessages,
    isCommsDockOpen,
    setIsCommsDockOpen,
    toggleCommsDock,
    unreadCounts,
    totalUnreadCount,
    hasUnseenMessages,
    hasNewOperatorLogins,
    newOperatorLogins,
    clearNewOperatorLogins,
    hasNewOperativeLogins: hasNewOperatorLogins,
    newOperativeLogins: newOperatorLogins,
    clearNewOperativeLogins: clearNewOperatorLogins,
    markChannelAsRead,
    userDirectory: effectiveUserDirectory,
    refreshUserDirectory,
    speakingMode,
    setSpeakingMode,
    selectedPersona,
    setSelectedPersona: selectPersonaForChannel,
    manualPresenceStatus,
    setManualPresenceStatus,
    customStatusMessage,
    setCustomStatusMessage,
    currentActivity,
    replyingToMessage,
    setReplyingToMessage,
    notifyTyping,
    activeTypingUsers,
    toggleMessageReaction,
    pulseDocketBlockToChat,
    sendMessage,
    sendDiceRoll,
    startDirectMessage,
    createNewChannel,
    renameChannel,
    updateChannel,
    addChannelMember,
    removeChannelMember,
    deleteChannel,
    clearChannelMessages,
    isTeamChannel,
    isStandardChannel,
    getChannelAddressingMode,
    isCurrentTeamChannel,
    isCurrentStandardChannel,
    channelAddressingMode,
    activeChannelUsers,
    currentUserCharacters,
    allUserPersonas,
    togglePersonaNetworkEngaged
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;

