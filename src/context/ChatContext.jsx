import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useFolio } from './FolioContext';
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
  const { activePersona: folioActivePersona, personaRoster, roster, togglePersonaNetworkEngaged } = folio;

  const [channels, setChannels] = useState(DEFAULT_PUBLIC_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('public_general');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isCommsDockOpen, setIsCommsDockOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [userDirectory, setUserDirectory] = useState([]);
  const [speakingMode, setSpeakingMode] = useState('OOC'); // 'OOC' | 'IC'
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [directSortMode, setDirectSortMode] = useState('alphabetical'); // 'alphabetical' | 'recent'
  const [activeNavTab, setActiveNavTab] = useState('matrix'); // 'matrix' | 'roster' | 'teams' | 'vtt' | 'logs' | 'settings'
  const [broadcastToVtt, setBroadcastToVtt] = useState(false);

  // New operator logins & unseen message notifications
  const location = useLocation();
  const [hasNewOperatorLogins, setHasNewOperatorLogins] = useState(false);
  const [newOperatorLogins, setNewOperatorLogins] = useState([]);
  const knownOnlineUsersRef = useRef(new Set());
  const initialPresenceReceivedRef = useRef(false);

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

        // If operator has explicitly set flags on any persona, strictly respect that flag.
        // If no personas have ever been flagged yet, default to engaging the single active persona.
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

  // Decoupled persona selection: support ad-hoc persona picking without globally forcing active character
  useEffect(() => {
    if (folioActivePersona && (!selectedPersona || selectedPersona.id === (folioActivePersona['character-doc-id'] || folioActivePersona.id))) {
      setSelectedPersona(folioActivePersona);
    } else if (!selectedPersona && currentUserCharacters.length > 0) {
      setSelectedPersona(currentUserCharacters[0]);
    }
  }, [folioActivePersona, selectedPersona, currentUserCharacters]);

  // Initialize default channels in Firestore once an authenticated user is connected or on mount
  useEffect(() => {
    ChatService.initDefaultChannels();
  }, [currentUser]);

  // Presence Heartbeat & Window Lifecyle Management
  useEffect(() => {
    if (!currentUser) return;

    const currentPersona = selectedPersona || folioActivePersona;
    const personasSummary = currentUserCharacters.map(c => ({
      id: c.id,
      'character-doc-id': c.id,
      name: c.name,
      species: c.species,
      role: c.role,
      avatar: c.avatar
    }));

    ChatService.updateUserPresence(currentUser, 'online', {
      userHandle,
      activePersona: currentPersona,
      personasSummary
    });

    const interval = setInterval(() => {
      ChatService.updateUserPresence(currentUser, 'online', {
        userHandle,
        activePersona: selectedPersona || folioActivePersona,
        personasSummary
      });
    }, 60000);

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      ChatService.updateUserPresence(currentUser, isVisible ? 'online' : 'idle', {
        userHandle,
        activePersona: selectedPersona || folioActivePersona,
        personasSummary
      });
    };

    const handleBeforeUnload = () => {
      ChatService.updateUserPresence(currentUser, 'offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, userHandle, selectedPersona, folioActivePersona, currentUserCharacters]);

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

  // Effective Network User Directory reconciling live Firestore directory with local user & tombstone filters
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

      // If this is current user, always enforce canonical currentUserCharacters
      if (isCurrent) {
        list.push({
          ...u,
          userHandle: effectiveHandle,
          isOnline: true,
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
          characters: filteredChars
        });
      }
    });

    // Ensure current user is ALWAYS present in the directory even before Firestore syncs
    if (currentUser && !seenUids.has(currentUser.uid)) {
      list.unshift({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email || 'Operator',
        userHandle: userHandle || getEffectiveUserHandle(currentUser),
        isOnline: true,
        characters: currentUserCharacters,
        lastSeenLocal: new Date().toISOString()
      });
    }

    return list;
  }, [userDirectory, currentUser, userHandle, currentUserCharacters]);

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

  // All network personas with owner handles and online status
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
            list.push({
              ...c,
              targetUser: u,
              ownerHandle: uHandle,
              isOnline: Boolean(u.isOnline)
            });
          }
        });
      }
    });
    return list;
  }, [effectiveUserDirectory]);

  // Online / Offline sorted sets (always sorted cleanly by effective user handle)
  const onlineOperators = useMemo(() => {
    return effectiveUserDirectory.filter(u => u.isOnline).sort((a, b) => {
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
    return allNetworkPersonas.filter(p => p.isOnline).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
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
      return isUserMember || isPersonaMember || c.createdById === currentUser.uid;
    });
  }, [channels, currentUser, userPersonaIds]);

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
  // In Team channels, addresses and lists Personas enrolled in the squad.
  // In Standard channels, addresses and lists Operators active across the HoloNet.
  const activeChannelUsers = useMemo(() => {
    if (!activeChannel) {
      return { mode: 'operator', personas: [], operators: effectiveUserDirectory };
    }

    if (isTeamChannel(activeChannel)) {
      const charMembers = Array.isArray(activeChannel.characterMembers) ? activeChannel.characterMembers : [];
      const memberUids = new Set(Array.isArray(activeChannel.members) ? activeChannel.members : []);
      if (activeChannel.createdById) memberUids.add(activeChannel.createdById);

      const personasList = [];
      const seenCharIds = new Set();

      charMembers.forEach(cm => {
        if (!cm) return;
        const cId = cm.id || cm['character-doc-id'] || cm.name;
        if (cId && !seenCharIds.has(cId)) {
          seenCharIds.add(cId);
          personasList.push({
            id: cId,
            'character-doc-id': cId,
            name: cm.name || cm['char-name'] || 'Persona',
            species: cm.species || cm['char-species'] || 'Human',
            role: cm.role || cm['char-concept'] || cm['char-occu'] || 'Specialist',
            avatar: cm.avatar || null,
            ownerUid: cm.ownerUid || null,
            ownerHandle: cm.ownerHandle || 'Operator',
            isOnline: Boolean(effectiveUserDirectory.find(u => u.uid === cm.ownerUid)?.isOnline)
          });
        }
      });

      effectiveUserDirectory.forEach(u => {
        if (memberUids.has(u.uid) && Array.isArray(u.characters)) {
          u.characters.forEach(c => {
            const cId = c.id || c['character-doc-id'] || c.name;
            if (cId && !seenCharIds.has(cId)) {
              seenCharIds.add(cId);
              personasList.push({
                ...c,
                ownerUid: u.uid,
                ownerHandle: u.userHandle || getEffectiveUserHandle(u),
                isOnline: Boolean(u.isOnline)
              });
            }
          });
        }
      });

      const operatorsList = effectiveUserDirectory.filter(u => memberUids.has(u.uid));

      return {
        mode: 'persona',
        personas: personasList,
        operators: operatorsList.length > 0 ? operatorsList : effectiveUserDirectory
      };
    }

    // Standard / Public Channel
    return {
      mode: 'operator',
      personas: allNetworkPersonas,
      operators: effectiveUserDirectory
    };
  }, [activeChannel, effectiveUserDirectory, allNetworkPersonas]);

  const selectChannel = useCallback((channelId) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveChannelId(channelId);
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
    const activeP = selectedPersona || currentUserCharacters[0];
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
  }, [activeChannelId, channels, activeChannel, currentUser, userHandle, speakingMode, selectedPersona, currentUserCharacters, broadcastToVtt]);

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
    const effectiveIsIC = customPayload.isIC !== undefined 
      ? Boolean(customPayload.isIC)
      : (isTeam ? (speakingMode !== 'OOC') : (speakingMode === 'IC'));

    const activeP = customPayload.persona || selectedPersona || currentUserCharacters[0];
    const hasPersona = Boolean(activeP && (activeP.name || activeP['char-name']));
    const operatorHandle = userHandle || currentUser?.displayName || currentUser?.email || 'Anonymous Operator';
    const isIC = Boolean(effectiveIsIC && hasPersona);

    // 2. RPG command: /me or /act or /ooc
    let messageType = isIC ? 'ic_transmission' : 'text';
    let cleanText = text;
    if (trimmed.startsWith('/me ') || trimmed.startsWith('/act ')) {
      messageType = 'narrative_action';
      cleanText = trimmed.replace(/^\/(me|act)\s+/, '');
    } else if (trimmed.startsWith('/ooc ')) {
      messageType = 'ooc_remark';
      cleanText = trimmed.replace(/^\/ooc\s+/, '');
    }

    const payload = {
      text: cleanText || '',
      type: customPayload.type || messageType,
      senderId: currentUser?.uid || 'anon',
      senderUid: currentUser?.uid || null,
      senderHandle: isIC ? (activeP.name || activeP['char-name'] || activeP.identity?.name || operatorHandle) : operatorHandle,
      operatorHandle: operatorHandle,
      senderType: isIC ? 'persona' : 'operator',
      addressingMode: channelMode,
      isIC: isIC,
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
      ...customPayload
    };

    AudioService.playTerminalBeep(1450, 0.02);
    await ChatService.sendMessage(targetChannelId, payload);
  }, [activeChannelId, channels, activeChannel, currentUser, userHandle, speakingMode, selectedPersona, currentUserCharacters, sendDiceRoll, broadcastToVtt]);

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
    setSelectedPersona,
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
