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
  const { activePersona: folioActivePersona, personaRoster, roster } = useFolio();

  const [channels, setChannels] = useState(DEFAULT_PUBLIC_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('public_general');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isCommsDockOpen, setIsCommsDockOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [userDirectory, setUserDirectory] = useState([]);
  const [speakingMode, setSpeakingMode] = useState('OOC'); // 'OOC' | 'IC'
  const [selectedPersona, setSelectedPersona] = useState(null);

  // Auto-sync persona with Folio active persona if available
  useEffect(() => {
    if (folioActivePersona) {
      setSelectedPersona(folioActivePersona);
    } else {
      const allRoster = personaRoster || roster || [];
      if (allRoster.length > 0 && !selectedPersona) {
        setSelectedPersona(allRoster[0]);
      }
    }
  }, [folioActivePersona, personaRoster, roster]);

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

  const groupChannels = useMemo(() => {
    return channels.filter(c => c.type === 'group');
  }, [channels]);

  const customChannels = useMemo(() => {
    return channels.filter(c => c.type === 'custom' || (!c.id.startsWith('public_') && !c.id.startsWith('dm_') && c.type !== 'group'));
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
    if (!text && !customPayload.metadata) return;
    if (!activeChannelId) return;

    const senderHandle = userHandle || currentUser?.displayName || currentUser?.email || 'Anonymous Operator';
    const isIC = speakingMode === 'IC' && selectedPersona;

    const payload = {
      text: text || '',
      type: isIC ? 'ic_transmission' : 'text',
      senderId: currentUser?.uid || 'anon',
      senderHandle: isIC ? (selectedPersona.name || selectedPersona.identity?.name || senderHandle) : senderHandle,
      isIC: isIC,
      personaDetails: isIC ? {
        id: selectedPersona.id,
        name: selectedPersona.name || selectedPersona.identity?.name || 'Operative',
        species: selectedPersona.species || selectedPersona.identity?.species || 'Unknown',
        role: selectedPersona.role || selectedPersona.identity?.role || 'Agent'
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
    const displayName = isIC ? (selectedPersona.name || selectedPersona.identity?.name || senderHandle) : senderHandle;

    const checkLabel = diceRollData.label ? `${diceRollData.label} ` : '';
    const advTag = diceRollData.isAdvantage ? ' [Advantage]' : diceRollData.isDisadvantage ? ' [Disadvantage]' : '';
    const payload = {
      text: `${displayName} rolled ${checkLabel}(${diceRollData.expression || 'dice'})${advTag}: ${diceRollData.total ?? diceRollData.result}`,
      type: 'dice_roll',
      senderId: currentUser?.uid || 'anon',
      senderHandle: displayName,
      isIC: isIC,
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

  // Start or open a 1-on-1 Direct Message with target user
  const startDirectMessage = useCallback(async (targetUser) => {
    if (!currentUser) throw new Error('You must be logged in to send direct messages');
    const dmChannel = await ChatService.getOrCreateDirectMessageChannel(currentUser, targetUser);
    selectChannel(dmChannel.id);
    return dmChannel;
  }, [currentUser, selectChannel]);

  // Create a new custom or squad group channel
  const createNewChannel = useCallback(async ({ name, topic, isPublic, type, members }) => {
    if (!currentUser) throw new Error('You must be logged in to create a channel');
    const newChan = await ChatService.createCustomChannel({
      name,
      topic,
      isPublic,
      type,
      members,
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

  const value = {
    channels,
    publicChannels,
    directChannels,
    groupChannels,
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
    deleteChannel
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
