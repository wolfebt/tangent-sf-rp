import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useFolio } from './FolioContext';
import { ChatService, DEFAULT_PUBLIC_CHANNELS } from '../services/chatService';
import { AudioService } from '../services/audioService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { currentUser, userHandle } = useAuth();
  const folio = useFolio() || {};
  const { activePersona: folioActivePersona, personaRoster, roster } = folio;

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

  // Decoupled persona selection: support ad-hoc operative picking without globally forcing active character
  useEffect(() => {
    if (folioActivePersona) {
      setSelectedPersona(folioActivePersona);
    }
  }, [folioActivePersona]);

  // Initialize default channels in Firestore once
  useEffect(() => {
    ChatService.initDefaultChannels();
  }, []);

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
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Load user directory for direct messages / invites
  const refreshUserDirectory = useCallback(async () => {
    if (currentUser) {
      const users = await ChatService.fetchUsersDirectory(currentUser.uid);
      setUserDirectory(users);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshUserDirectory();
  }, [refreshUserDirectory]);

  // Subscribe to active channel messages
  useEffect(() => {
    if (!activeChannelId) return;

    setLoadingMessages(true);
    const unsubscribe = ChatService.subscribeToMessages(activeChannelId, (newMessages) => {
      setMessages(newMessages);
      setLoadingMessages(false);

      // Play subtle chirp if a new message arrives and it's not our own
      if (newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (currentUser && lastMsg.senderId && lastMsg.senderId !== currentUser.uid) {
          AudioService.playTerminalBeep(1350, 0.03);
        }
      }
    });

    // Reset unread count for the active channel
    setUnreadCounts(prev => {
      if (!prev[activeChannelId]) return prev;
      const next = { ...prev };
      delete next[activeChannelId];
      return next;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeChannelId, currentUser]);

  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === activeChannelId) || DEFAULT_PUBLIC_CHANNELS[0];
  }, [channels, activeChannelId]);

  const publicChannels = useMemo(() => {
    return channels.filter(c => c.type === 'public' || c.id.startsWith('public_'));
  }, [channels]);

  const directChannels = useMemo(() => {
    return channels.filter(c => c.type === 'direct' || c.id.startsWith('dm_'));
  }, [channels]);

  // Separate Direct Comms: Player Operator Channels (OOC) vs. Character Operative Channels (IC)
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
        const charName = chan.targetPersona?.name || chan.displayName?.replace(/^🎭\s*/, '') || 'Operative';
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

  // Flattened list of all discovered separate characters across registered players
  const charactersDirectory = useMemo(() => {
    const list = [];
    const seen = new Set();
    (userDirectory || []).forEach(u => {
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
  }, [userDirectory]);

  const groupChannels = useMemo(() => {
    return channels.filter(c => c.type === 'group' || !!c.groupId || c.id.startsWith('group_') || (Array.isArray(c.characterMembers) && c.characterMembers.length > 0));
  }, [channels]);

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

  const toggleCommsDock = useCallback(() => {
    setIsCommsDockOpen(prev => !prev);
  }, []);

  const selectChannel = useCallback((channelId) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveChannelId(channelId);
    setUnreadCounts(prev => {
      const next = { ...prev };
      delete next[channelId];
      return next;
    });
  }, []);

  // Send a regular or In-Character text transmission
  const sendMessage = useCallback(async (text, customPayload = {}) => {
    if (!text && !customPayload.metadata && !customPayload.summary) return;
    if (!activeChannelId) return;

    const senderHandle = userHandle || currentUser?.displayName || currentUser?.email || 'Anonymous Operator';
    const isIC = speakingMode === 'IC' && (customPayload.persona || selectedPersona);
    const activeP = customPayload.persona || selectedPersona;

    const payload = {
      text: text || '',
      type: isIC ? 'ic_transmission' : 'text',
      senderId: currentUser?.uid || 'anon',
      senderHandle: isIC ? (activeP.name || activeP['char-name'] || activeP.identity?.name || senderHandle) : senderHandle,
      isIC: Boolean(isIC),
      personaDetails: isIC ? {
        id: activeP['character-doc-id'] || activeP.id,
        name: activeP['char-name'] || activeP.name || activeP.identity?.name || 'Operative',
        species: activeP['char-species'] || activeP.species || activeP.identity?.species || 'Human',
        role: activeP['char-concept'] || activeP.role || activeP['char-occu'] || activeP.identity?.role || 'Specialist',
        health: activeP.health || 30,
        currentHealth: activeP.current_health ?? (activeP.current_hp ?? 30),
        vitality: activeP.vitality || 30,
        currentVitality: activeP.current_vitality ?? 30
      } : null,
      ...customPayload
    };

    AudioService.playTerminalBeep(1450, 0.02);
    await ChatService.sendMessage(activeChannelId, payload);
  }, [activeChannelId, currentUser, userHandle, speakingMode, selectedPersona]);

  // Send a dice roll transmission to the active or specified channel
  const sendDiceRoll = useCallback(async (diceRollData, targetChannelId = null) => {
    const channelId = targetChannelId || activeChannelId;
    if (!channelId) return;

    const senderHandle = userHandle || currentUser?.displayName || currentUser?.email || 'Operator';
    const isIC = speakingMode === 'IC' && selectedPersona;
    const displayName = isIC ? (selectedPersona.name || selectedPersona['char-name'] || selectedPersona.identity?.name || senderHandle) : senderHandle;

    const checkLabel = diceRollData.label ? `${diceRollData.label} ` : '';
    const advTag = diceRollData.isAdvantage ? ' [Advantage: I Got This]' : diceRollData.isDisadvantage ? ' [Disadvantage: Negative Karma]' : '';
    const payload = {
      text: `${displayName} rolled ${checkLabel}(${diceRollData.expression || 'dice'})${advTag}: ${diceRollData.total ?? diceRollData.result}`,
      type: 'dice_roll',
      senderId: currentUser?.uid || 'anon',
      senderHandle: displayName,
      isIC: isIC,
      personaDetails: isIC ? {
        id: selectedPersona['character-doc-id'] || selectedPersona.id,
        name: selectedPersona['char-name'] || selectedPersona.name || 'Operative',
        species: selectedPersona['char-species'] || selectedPersona.species || 'Human',
        role: selectedPersona['char-concept'] || selectedPersona.role || selectedPersona['char-occu'] || 'Specialist'
      } : null,
      metadata: {
        ...diceRollData,
        result: diceRollData.total ?? diceRollData.result,
        expression: diceRollData.expression || 'Custom Roll',
        rolls: diceRollData.rolls || [],
        isCritical: diceRollData.isCritical || false,
        isFumble: diceRollData.isFumble || false
      }
    };

    AudioService.playTerminalBeep(1550, 0.04);
    await ChatService.sendMessage(channelId, payload);
  }, [activeChannelId, currentUser, userHandle, speakingMode, selectedPersona]);

  // Start or open a 1-on-1 Direct Message with target user (and optional specific persona)
  const startDirectMessage = useCallback(async (targetUser, targetPersona = null) => {
    if (!currentUser) throw new Error('You must be logged in to send direct messages');
    const dmChannel = await ChatService.getOrCreateDirectMessageChannel(currentUser, targetUser, targetPersona);
    selectChannel(dmChannel.id);
    return dmChannel;
  }, [currentUser, selectChannel]);

  // Create a new custom or squad group channel (supports characterMembers)
  const createNewChannel = useCallback(async ({ name, topic, isPublic, type, members, characterMembers }) => {
    if (!currentUser) throw new Error('You must be logged in to create a channel');
    const newChan = await ChatService.createCustomChannel({
      name,
      topic,
      isPublic,
      type,
      members,
      characterMembers,
      currentUser
    });
    selectChannel(newChan.id);
    return newChan;
  }, [currentUser, selectChannel]);

  // Rename channel
  const renameChannel = useCallback(async (channelId, newDisplayName, newTopic) => {
    const res = await ChatService.renameChannel(channelId, newDisplayName, newTopic);
    AudioService.playTerminalBeep(1200, 0.02);
    return res;
  }, []);

  // Update channel properties (privacy, topic, etc.)
  const updateChannel = useCallback(async (channelId, updates) => {
    const res = await ChatService.updateChannel(channelId, updates);
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
    directSortMode,
    setDirectSortMode,
    pendingCharacterNotes,
    charactersDirectory,
    groupChannels,
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
    userDirectory,
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
    clearChannelMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
