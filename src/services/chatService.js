import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, isFirestoreQuotaExhausted, handleFirestoreQuotaError } from '../firebase.js';
import { StorageService } from './storageService.js';
import { 
  getFolioTombstones, 
  addFolioTombstone,
  isFolioPersonaDeleted, 
  isPersonaEmptyTemplate, 
  getEffectiveUserHandle 
} from '../utils/personaValidationUtils.js';

export const DEFAULT_PUBLIC_CHANNELS = [
  {
    id: 'public_general',
    name: 'general-holonet',
    displayName: '#general-holonet',
    topic: 'Main holonet frequency for open chatter, mission chatter, and operational comms.',
    type: 'public',
    isPublic: true,
    createdById: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'public_lfg',
    name: 'lfg-recruitment',
    displayName: '#lfg-recruitment',
    topic: 'Looking for Group, operator recruitment, and squad assembly dispatch.',
    type: 'public',
    isPublic: true,
    createdById: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'public_codex',
    name: 'codex-lore',
    displayName: '#codex-lore',
    topic: 'Lore discussions, matrix queries, and system mechanics inquiry.',
    type: 'public',
    isPublic: true,
    createdById: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'public_cantina',
    name: 'orbital-cantina',
    displayName: '#orbital-cantina',
    topic: 'In-Character (IC) open tavern roleplay & station transmissions.',
    type: 'public',
    isPublic: true,
    createdById: 'system',
    createdAt: new Date().toISOString()
  }
];

export const ChatService = {
  // Ensure default public channels exist in Firestore (runs at most once per session)
  _channelsInitialized: false,
  async initDefaultChannels() {
    if (!db || !auth?.currentUser || this._channelsInitialized || isFirestoreQuotaExhausted()) return;
    this._channelsInitialized = true;
    try {
      for (const ch of DEFAULT_PUBLIC_CHANNELS) {
        if (isFirestoreQuotaExhausted()) break;
        const docRef = doc(db, 'channels', ch.id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          await setDoc(docRef, {
            ...ch,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: {
              text: `Frequency opened: ${ch.displayName}`,
              senderHandle: 'HOLONET RELAY',
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    } catch (err) {
      handleFirestoreQuotaError(err);
    }
  },

  // Subscribe to all channels visible to current user (with instant cache hydration)
  subscribeToUserChannels(currentUser, callback) {
    // 1. Instantly emit cached channels from IndexedDB if available
    StorageService.getItem('tangent_channels_cache', null).then(cached => {
      if (Array.isArray(cached) && cached.length > 0) {
        callback(cached);
      } else {
        callback(DEFAULT_PUBLIC_CHANNELS);
      }
    }).catch(() => {
      callback(DEFAULT_PUBLIC_CHANNELS);
    });

    if (isFirestoreQuotaExhausted()) {
      return () => {};
    }

    if (!currentUser) {
      const q = query(
        collection(db, 'channels'),
        where('isPublic', '==', true)
      );
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(list);
        StorageService.setItem('tangent_channels_cache', list).catch(() => {});
      }, (err) => {
        handleFirestoreQuotaError(err);
      });
    }

    // Two safe queries combined in memory: public channels + channels user is a member of
    let publicList = [];
    let memberList = [];

    const emitCombined = () => {
      const map = new Map();
      [...publicList, ...memberList].forEach(ch => {
        map.set(ch.id, ch);
      });
      const combined = Array.from(map.values());
      callback(combined);
      StorageService.setItem('tangent_channels_cache', combined).catch(() => {});
    };

    const qPublic = query(
      collection(db, 'channels'),
      where('isPublic', '==', true)
    );
    const unsubPublic = onSnapshot(qPublic, (snap) => {
      publicList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      emitCombined();
    }, (err) => {
      handleFirestoreQuotaError(err);
    });

    const qMember = query(
      collection(db, 'channels'),
      where('members', 'array-contains', currentUser.uid)
    );
    const unsubMember = onSnapshot(qMember, (snap) => {
      memberList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      emitCombined();
    }, (err) => {
      handleFirestoreQuotaError(err);
    });

    return () => {
      if (unsubPublic) unsubPublic();
      if (unsubMember) unsubMember();
    };
  },

  // Subscribe to live messages in a specific channel (with instant cache hydration)
  subscribeToMessages(channelId, callback, maxLimit = 100) {
    if (!channelId) return () => {};

    // 1. Immediately hydrate cached messages for this channel
    StorageService.getItem(`tangent_messages_cache_${channelId}`, null).then(cached => {
      if (Array.isArray(cached) && cached.length > 0) {
        callback(cached);
      }
    }).catch(() => {});

    if (isFirestoreQuotaExhausted()) {
      return () => {};
    }

    const messagesRef = collection(db, 'channels', channelId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(maxLimit));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
      StorageService.setItem(`tangent_messages_cache_${channelId}`, messages).catch(() => {});
    }, (err) => {
      handleFirestoreQuotaError(err);
    });
  },

  // Fetch all channel messages snapshot (e.g. for printing or export)
  async fetchChannelMessages(channelId, maxLimit = 300) {
    if (!channelId) return [];
    try {
      const messagesRef = collection(db, 'channels', channelId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(maxLimit));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.warn(`[ChatService] Error fetching channel ${channelId} messages:`, err);
      return [];
    }
  },

  // Send a message
  async sendMessage(channelId, messagePayload) {
    if (!channelId) throw new Error('Channel ID is required');

    // If channel is marked as read-only (like persona telemetry logs), reject non-log chatter
    if (db && !messagePayload.isReadOnlyLog) {
      try {
        const channelDocRef = doc(db, 'channels', channelId);
        const cSnap = await getDoc(channelDocRef);
        if (cSnap.exists() && cSnap.data().isReadOnly) {
          throw new Error('This frequency is a read-only audit stream. Messages cannot be transmitted here.');
        }
      } catch (err) {
        if (err.message && err.message.includes('read-only')) throw err;
      }
    }

    const messagesRef = collection(db, 'channels', channelId, 'messages');
    const now = new Date();
    const docData = {
      ...messagePayload,
      createdAt: serverTimestamp(),
      createdLocalAt: now.toISOString()
    };

    const docRef = await addDoc(messagesRef, docData);

    // Update parent channel's lastMessage and updatedAt
    try {
      const channelDocRef = doc(db, 'channels', channelId);
      const defaultMeta = DEFAULT_PUBLIC_CHANNELS.find(c => c.id === channelId);
      await setDoc(channelDocRef, {
        ...(defaultMeta || {}),
        updatedAt: serverTimestamp(),
        lastMessage: {
          text: messagePayload.type === 'dice_roll' 
            ? `🎲 ${messagePayload.senderHandle} rolled ${messagePayload.metadata?.result || 'dice'}` 
            : messagePayload.type === 'persona_log_entry'
            ? `📋 ${messagePayload.summary || 'Telemetry recorded'}`
            : messagePayload.type === 'docket_directive'
            ? `📌 [DOCKET DIRECTIVE] ${messagePayload.docketBlock?.title || 'Briefing'}`
            : messagePayload.type === 'squad_invite'
            ? `🛡️ [SQUAD INVITE] ${messagePayload.groupName || 'Fireteam'}`
            : (messagePayload.text?.substring(0, 80) || 'Transmission'),
          senderHandle: messagePayload.senderHandle || 'Unknown',
          senderId: messagePayload.senderId || '',
          timestamp: now.toISOString()
        }
      }, { merge: true });
    } catch (err) {
      console.warn('[ChatService] Failed to update channel lastMessage:', err);
    }

    return docRef.id;
  },

  // Create or retrieve a 1-on-1 Direct Message Channel (supports separate Player vs Character commlines)
  async getOrCreateDirectMessageChannel(currentUser, targetUser, targetPersonaOrOptions = null) {
    if (!currentUser || !targetUser) throw new Error('Both users are required for DM');

    const sortedUids = [currentUser.uid, targetUser.uid].sort();
    const currentHandle = getEffectiveUserHandle(currentUser);
    const targetHandle = getEffectiveUserHandle(targetUser);

    const targetPersona = (
      targetPersonaOrOptions &&
      typeof targetPersonaOrOptions === 'object' &&
      !targetPersonaOrOptions.addressingMode &&
      (targetPersonaOrOptions.name || targetPersonaOrOptions['char-name'] || targetPersonaOrOptions['character-doc-id'] || targetPersonaOrOptions.id)
    )
      ? targetPersonaOrOptions
      : (targetPersonaOrOptions?.persona || null);

    let channelId = '';
    const isCharacterDM = Boolean(targetPersona) && targetPersonaOrOptions?.addressingMode !== 'operator';

    if (isCharacterDM) {
      const pRawId = targetPersona['character-doc-id'] || targetPersona.id || targetPersona.name || 'char';
      const cleanPId = String(pRawId).toLowerCase().replace(/[^a-z0-9_-]/g, '-').substring(0, 32);
      channelId = `dm_char_${sortedUids[0]}_${sortedUids[1]}_${cleanPId}`;
    } else {
      channelId = `dm_player_${sortedUids[0]}_${sortedUids[1]}`;
    }

    let channelRef = doc(db, 'channels', channelId);
    let snap = await getDoc(channelRef);

    // Fallback: Check for legacy dm_{uid1}_{uid2} format if player channel doc does not exist yet
    if (!snap.exists() && !isCharacterDM) {
      const legacyId = `dm_${sortedUids[0]}_${sortedUids[1]}`;
      const legacyRef = doc(db, 'channels', legacyId);
      const legacySnap = await getDoc(legacyRef);
      if (legacySnap.exists() && !legacySnap.data().targetPersona) {
        channelId = legacyId;
        channelRef = legacyRef;
        snap = legacySnap;
      }
    }

    const personaName = targetPersona?.name || targetPersona?.['char-name'] || 'Persona';
    const personaSpecies = targetPersona?.species || targetPersona?.['char-species'] || 'Human';
    const personaRole = targetPersona?.role || targetPersona?.['char-concept'] || targetPersona?.['char-occu'] || 'Specialist';

    if (snap.exists()) {
      const existing = { id: snap.id, ...snap.data() };
      return existing;
    }

    const newChannel = {
      id: channelId,
      name: isCharacterDM ? `dm-${personaName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}` : `dm-${targetHandle}`,
      displayName: isCharacterDM ? `🎭 ${personaName}` : `@${targetHandle}`,
      topic: isCharacterDM 
        ? `In-Character Direct Comms with ${personaName} (${personaSpecies} ${personaRole} • Played by @${targetHandle})`
        : `Direct Operator Comms with @${targetHandle} (Player / OOC Comms)`,
      type: 'direct',
      addressingMode: isCharacterDM ? 'persona' : 'operator',
      recipientType: isCharacterDM ? 'character' : 'player', // 'player' | 'character'
      isPublic: false,
      targetPersona: isCharacterDM ? {
        id: targetPersona['character-doc-id'] || targetPersona.id || personaName,
        name: personaName,
        species: personaSpecies,
        role: personaRole,
        avatar: targetPersona.avatar || null,
        ownerUid: targetUser.uid,
        ownerHandle: targetHandle
      } : null,
      targetPlayer: {
        uid: targetUser.uid,
        handle: targetHandle
      },
      createdById: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      members: [currentUser.uid, targetUser.uid],
      memberDetails: {
        [currentUser.uid]: {
          handle: currentHandle,
          photoURL: currentUser.photoURL || null
        },
        [targetUser.uid]: {
          handle: targetHandle,
          photoURL: targetUser.photoURL || null,
          persona: targetPersona || null
        }
      },
      lastMessage: {
        text: isCharacterDM 
          ? `Direct CommLink established with persona ${personaName}.`
          : `Direct CommLink established with operator @${targetHandle}.`,
        senderHandle: 'SYSTEM',
        timestamp: new Date().toISOString()
      }
    };

    await setDoc(channelRef, newChannel);
    return newChannel;
  },

  // Create a Custom Channel or Group Chat
  async createCustomChannel({ name, topic, isPublic = true, type = 'custom', addressingMode = 'operator', members = [], characterMembers = [], currentUser }) {
    if (!name || !name.trim()) throw new Error('Channel name is required');

    const effectiveUser = currentUser || {
      uid: `local_${localStorage.getItem('userHandle') || 'operator'}`,
      displayName: localStorage.getItem('userHandle') || 'Local Operator'
    };

    const rawClean = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const cleanName = rawClean || `freq-${Math.random().toString(36).substring(2, 6)}`;
    const channelId = `${type === 'group' ? 'group_chat' : 'custom'}_${Date.now()}_${cleanName.substring(0, 20)}`;

    const memberList = Array.from(new Set([effectiveUser.uid, ...members]));

    const displayName = type === 'group' 
      ? (name.startsWith('🛡️') || name.startsWith('👥') ? name : `🛡️ ${name}`)
      : `#${cleanName}`;

    const nowIso = new Date().toISOString();
    const channelData = {
      id: channelId,
      name: cleanName,
      displayName: displayName,
      topic: topic || (type === 'group' ? 'Tactical Operator Group Frequency' : 'Custom operations channel'),
      type: type, // 'custom' | 'group'
      addressingMode: type === 'group' ? 'persona' : (addressingMode || 'operator'),
      isPublic: Boolean(isPublic),
      createdById: effectiveUser.uid,
      createdAt: nowIso,
      updatedAt: nowIso,
      members: memberList,
      characterMembers: Array.isArray(characterMembers) ? characterMembers : [],
      lastMessage: {
        text: `Frequency opened: ${displayName}`,
        senderHandle: effectiveUser.displayName || 'Architect',
        timestamp: nowIso
      }
    };

    // Save to Firestore if available and user is authenticated
    if (db && auth?.currentUser && !effectiveUser.uid.startsWith('local_')) {
      try {
        const channelRef = doc(db, 'channels', channelId);
        await setDoc(channelRef, {
          ...channelData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('[ChatService] Firestore channel write fallback to local cache:', err);
      }
    }

    // Always update local IndexedDB cache so channels persist immediately and offline
    try {
      const cached = (await StorageService.getItem('tangent_channels_cache', [])) || [];
      const updated = [channelData, ...cached.filter(c => c.id !== channelId)];
      await StorageService.setItem('tangent_channels_cache', updated);
    } catch (e) {
      console.warn('[ChatService] Local cache save failed:', e);
    }

    return channelData;
  },

  // Evaluate 4-state Operator presence ('online' | 'idle' | 'dnd' | 'offline')
  getUserPresenceState(uData) {
    if (!uData) return 'offline';
    const rawStatus = uData.presenceState || uData.status || 'offline';
    if (rawStatus === 'offline' || rawStatus === 'invisible') return 'offline';

    const lastSeenMs = uData.lastSeen?.toDate
      ? uData.lastSeen.toDate().getTime()
      : uData.lastSeenLocal
      ? new Date(uData.lastSeenLocal).getTime()
      : 0;

    // Stale heartbeat beyond 5 minutes (300,000 ms) -> offline
    if (lastSeenMs && Date.now() - lastSeenMs > 300000) {
      return 'offline';
    }

    if (rawStatus === 'dnd') return 'dnd';
    if (rawStatus === 'idle') return 'idle';
    if (rawStatus === 'online') {
      // If no heartbeat update in 3.5 minutes, show as idle
      if (lastSeenMs && Date.now() - lastSeenMs > 210000) {
        return 'idle';
      }
      return 'online';
    }
    return 'offline';
  },

  // Check if a user document represents an active online state (includes 'online', 'idle', and 'dnd')
  isUserOnline(uData) {
    const state = ChatService.getUserPresenceState(uData);
    return state === 'online' || state === 'idle' || state === 'dnd';
  },

  // Format relative last-seen time for offline/idle telemetry
  formatLastSeen(uData) {
    if (!uData) return 'Offline';
    const lastSeenMs = uData.lastSeen?.toDate
      ? uData.lastSeen.toDate().getTime()
      : uData.lastSeenLocal
      ? new Date(uData.lastSeenLocal).getTime()
      : 0;
    if (!lastSeenMs) return 'Offline';
    const diffSec = Math.max(0, Math.floor((Date.now() - lastSeenMs) / 1000));
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  },

  // Update online presence status & live activity telemetry in Firestore
  _lastPresenceWriteTime: 0,
  _lastPresenceSignature: '',
  async updateUserPresence(currentUser, status = 'online', extra = {}) {
    if (!currentUser?.uid || !db || isFirestoreQuotaExhausted()) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const now = new Date();
      const effectiveHandle = getEffectiveUserHandle({
        userHandle: extra.userHandle || localStorage.getItem('userHandle'),
        displayName: currentUser.displayName,
        email: currentUser.email
      });

      const effectiveStatus = status === 'invisible' ? 'offline' : status;

      const safeDisplayName = (currentUser.displayName && !currentUser.displayName.includes('@'))
        ? currentUser.displayName
        : effectiveHandle;

      const payload = {
        status: effectiveStatus, // 'online' | 'idle' | 'dnd' | 'offline'
        presenceState: effectiveStatus,
        lastSeen: serverTimestamp(),
        lastSeenLocal: now.toISOString(),
        displayName: safeDisplayName,
        userHandle: effectiveHandle,
        photoURL: currentUser.photoURL || null
      };

      if (extra.statusMessage !== undefined) {
        payload.statusMessage = String(extra.statusMessage || '').slice(0, 100);
      }

      if (extra.activity !== undefined) {
        payload.activity = extra.activity;
      }

      if (extra.activeSquadId !== undefined) {
        payload.activeSquadId = extra.activeSquadId;
      }

      const tombstones = getFolioTombstones();
      if (extra.activePersona && !isPersonaEmptyTemplate(extra.activePersona) && !isFolioPersonaDeleted(extra.activePersona, tombstones)) {
        payload.currentPersona = {
          id: extra.activePersona['character-doc-id'] || extra.activePersona.id,
          name: extra.activePersona['char-name'] || extra.activePersona.name || 'Persona',
          species: extra.activePersona['char-species'] || extra.activePersona.species || 'Human',
          role: extra.activePersona['char-concept'] || extra.activePersona.role || extra.activePersona['char-occu'] || 'Specialist',
          avatar: extra.activePersona.avatar || null
        };
      } else if (extra.activePersona === null || extra.clearActivePersona) {
        payload.currentPersona = null;
      }

      if (Array.isArray(extra.personasSummary)) {
        const validPersonas = extra.personasSummary.filter(p => !isFolioPersonaDeleted(p, tombstones) && !isPersonaEmptyTemplate(p));
        if (validPersonas.length > 0 || extra.forceEmptyPersonas) {
          payload.personas = validPersonas;
        }
      }

      // Deduplicate rapid identical presence writes within 30s to conserve Firestore write quota
      const sig = JSON.stringify({
        uid: currentUser.uid,
        status: effectiveStatus,
        statusMessage: payload.statusMessage,
        activity: payload.activity,
        activeSquadId: payload.activeSquadId,
        currentPersona: payload.currentPersona,
        personasCount: payload.personas?.length
      });
      if (sig === this._lastPresenceSignature && (Date.now() - this._lastPresenceWriteTime) < 30000) {
        return;
      }
      this._lastPresenceSignature = sig;
      this._lastPresenceWriteTime = Date.now();

      await setDoc(userDocRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreQuotaError(err);
    }
  },

  // Real-time listener for user directory and presence (Zero Read-Amplification)
  subscribeToUsersPresence(currentUserId, callback) {
    // 1. Immediately emit cached directory if available
    StorageService.getItem('tangent_users_presence_cache', null).then(cached => {
      if (Array.isArray(cached) && cached.length > 0) {
        callback(cached);
      }
    }).catch(() => {});

    if (isFirestoreQuotaExhausted()) {
      return () => {};
    }

    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const userList = [];
      const tombstones = getFolioTombstones();

      snapshot.forEach(d => {
        const uData = d.data();
        if (Array.isArray(uData.deletedPersonaIds) && uData.deletedPersonaIds.length > 0) {
          addFolioTombstone(uData.deletedPersonaIds);
        }
        const presenceState = ChatService.getUserPresenceState(uData);
        const online = presenceState === 'online' || presenceState === 'idle' || presenceState === 'dnd';
        const effectiveHandle = getEffectiveUserHandle({ ...uData, uid: d.id });
        const activePersonaId = uData.currentPersona?.id || uData.currentPersona?.['character-doc-id'] || null;
        const activePersonaName = uData.currentPersona?.name || null;

        const userChars = [];
        if (Array.isArray(uData.personas) && uData.personas.length > 0) {
          uData.personas.forEach(p => {
            const pId = p.id || p['character-doc-id'] || p.name;
            if (p.name && !isFolioPersonaDeleted(pId, tombstones) && !isPersonaEmptyTemplate(p) && !p.isDeleted) {
              const isActivelyPiloted = Boolean(
                online && (
                  (activePersonaId && pId === activePersonaId) ||
                  (activePersonaName && p.name === activePersonaName)
                )
              );
              userChars.push({
                id: pId,
                name: p.name || p['char-name'] || 'Persona',
                species: p.species || p['char-species'] || 'Human',
                role: p.role || p['char-concept'] || p['char-occu'] || 'Specialist',
                avatar: p.avatar || null,
                ownerUid: d.id,
                ownerHandle: effectiveHandle,
                isOnline: online,
                ownerPresenceState: presenceState,
                isActivelyPiloted,
                characterPresence: !online ? 'offline' : isActivelyPiloted ? 'deployed' : 'on_call'
              });
            }
          });
        }

        userList.push({
          uid: d.id,
          ...uData,
          userHandle: effectiveHandle,
          presenceState,
          isOnline: online,
          lastSeenFormatted: ChatService.formatLastSeen(uData),
          statusMessage: uData.statusMessage || '',
          activity: uData.activity || null,
          characters: userChars
        });
      });

      callback(userList);
      StorageService.setItem('tangent_users_presence_cache', userList).catch(() => {});
    }, (err) => {
      console.warn('[ChatService] Error listening to user presence:', err);
    });
  },

  // Fetch registered users directory and discover associated separate characters across squads and profiles
  async fetchUsersDirectory(currentUserId) {
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      const userMap = new Map();
      const tombstones = getFolioTombstones();

      snap.forEach(d => {
        const uData = d.data();
        const online = ChatService.isUserOnline(uData);
        const effectiveHandle = getEffectiveUserHandle({ ...uData, uid: d.id });

        const userChars = [];
        if (Array.isArray(uData.personas) && uData.personas.length > 0) {
          uData.personas.forEach(p => {
            const pId = p.id || p['character-doc-id'] || p.name;
            if (p.name && !isFolioPersonaDeleted(pId, tombstones) && !isPersonaEmptyTemplate(p) && !p.isDeleted) {
              userChars.push({
                id: pId,
                name: p.name || p['char-name'] || 'Persona',
                species: p.species || p['char-species'] || 'Human',
                role: p.role || p['char-concept'] || p['char-occu'] || 'Specialist',
                avatar: p.avatar || null,
                ownerUid: d.id,
                ownerHandle: effectiveHandle,
                isOnline: online
              });
            }
          });
        }

        userMap.set(d.id, {
          uid: d.id,
          ...uData,
          userHandle: effectiveHandle,
          isOnline: online,
          characters: userChars
        });
      });

      // Discover any missing users from game groups
      try {
        const groupsRef = collection(db, 'game_groups');
        const groupsSnap = await getDocs(groupsRef);
        groupsSnap.forEach(gDoc => {
          const gData = gDoc.data();
          const allGroupUids = [
            ...(Array.isArray(gData.members) ? gData.members : []),
            gData.creatorId,
            ...(gData.memberDetails ? Object.keys(gData.memberDetails) : [])
          ].filter(Boolean);

          allGroupUids.forEach(uid => {
            if (!userMap.has(uid)) {
              const mDetail = gData.memberDetails?.[uid];
              const effectiveHandle = getEffectiveUserHandle({
                userHandle: mDetail?.userHandle,
                displayName: mDetail?.displayName,
                uid
              });
              userMap.set(uid, {
                uid: uid,
                displayName: mDetail?.displayName || 'Operator',
                userHandle: effectiveHandle,
                isOnline: false,
                status: 'offline',
                characters: []
              });
            }
          });
        });
      } catch (e) {}

      const userList = Array.from(userMap.values());
      await Promise.all(userList.map(async (u) => {
        if (u.characters.length > 0 || (currentUserId && u.uid === currentUserId)) {
          return;
        }

        try {
          const personasRef = collection(db, `users/${u.uid}/personas`);
          const pSnap = await getDocs(personasRef);
          pSnap.forEach(pDoc => {
            const p = pDoc.data();
            const pId = pDoc.id || p['character-doc-id'] || p.name;
            const pName = p['char-name'] || p.name;
            if (pName && !isFolioPersonaDeleted(pId, tombstones) && !isPersonaEmptyTemplate(p) && !p.isDeleted) {
              if (!u.characters.some(c => (c.id || c['character-doc-id'] || c.name) === pId)) {
                u.characters.push({
                  id: pId,
                  name: pName,
                  species: p['char-species'] || p.species || 'Human',
                  role: p['char-concept'] || p.role || p['char-occu'] || 'Specialist',
                  avatar: p.avatar || null,
                  ownerUid: u.uid,
                  ownerHandle: u.userHandle || 'Operator',
                  isOnline: u.isOnline
                });
              }
            }
          });
        } catch (err) {}
      }));

      return userList;
    } catch (err) {
      console.warn('[ChatService] Error fetching user directory:', err);
      return [];
    }
  },

  // Update Channel details (rename, topic, privacy, etc.)
  async updateChannel(channelId, updates) {
    if (!channelId) throw new Error('Channel ID is required');
    const nowIso = new Date().toISOString();
    const payload = {
      ...updates,
      updatedAt: nowIso
    };

    if (db && auth?.currentUser && !channelId.startsWith('local_')) {
      try {
        const channelRef = doc(db, 'channels', channelId);
        await updateDoc(channelRef, {
          ...payload,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('[ChatService] Firestore updateChannel fallback to local cache:', err);
      }
    }

    try {
      const cached = (await StorageService.getItem('tangent_channels_cache', [])) || [];
      const updatedCache = cached.map(c => c.id === channelId ? { ...c, ...payload } : c);
      await StorageService.setItem('tangent_channels_cache', updatedCache);
    } catch (e) {
      console.warn('[ChatService] Error updating channels cache on updateChannel:', e);
    }

    return payload;
  },

  // Specific helper to rename channel & topic
  async renameChannel(channelId, newDisplayName, newTopic) {
    if (!channelId) throw new Error('Channel ID is required');
    const trimmed = (newDisplayName || '').trim();
    if (!trimmed) throw new Error('Channel name cannot be empty');

    const rawSlug = trimmed.replace(/^[#🛡️👥\s]+/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const cleanSlug = rawSlug || `freq-${Math.random().toString(36).substring(2, 6)}`;
    const isGroup = trimmed.startsWith('🛡️') || trimmed.startsWith('👥');
    const displayName = isGroup 
      ? trimmed 
      : (trimmed.startsWith('#') || trimmed.startsWith('@') ? trimmed : `#${cleanSlug}`);

    const nowIso = new Date().toISOString();
    const updates = {
      displayName: displayName,
      name: cleanSlug,
      updatedAt: nowIso
    };
    if (newTopic !== undefined) {
      updates.topic = newTopic.trim();
    }

    if (db && auth?.currentUser && !channelId.startsWith('local_')) {
      try {
        const channelRef = doc(db, 'channels', channelId);
        await updateDoc(channelRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('[ChatService] Firestore renameChannel fallback to local cache:', err);
      }
    }

    try {
      const cached = (await StorageService.getItem('tangent_channels_cache', [])) || [];
      const updatedCache = cached.map(c => c.id === channelId ? { ...c, ...updates } : c);
      await StorageService.setItem('tangent_channels_cache', updatedCache);
    } catch (e) {
      console.warn('[ChatService] Error updating channels cache on rename:', e);
    }

    return updates;
  },

  // Add member to channel
  async addChannelMember(channelId, memberUid) {
    if (!channelId || !memberUid) return;
    const channelRef = doc(db, 'channels', channelId);
    const snap = await getDoc(channelRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentMembers = Array.isArray(data.members) ? data.members : [];
      if (!currentMembers.includes(memberUid)) {
        await updateDoc(channelRef, {
          members: [...currentMembers, memberUid],
          updatedAt: serverTimestamp()
        });
      }
    }
  },

  // Remove member from channel
  async removeChannelMember(channelId, memberUid) {
    if (!channelId || !memberUid) return;
    const channelRef = doc(db, 'channels', channelId);
    const snap = await getDoc(channelRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentMembers = Array.isArray(data.members) ? data.members : [];
      const updated = currentMembers.filter(m => m !== memberUid);
      await updateDoc(channelRef, {
        members: updated,
        updatedAt: serverTimestamp()
      });
    }
  },

  // Delete channel (creator or admin only)
  async deleteChannel(channelId) {
    if (channelId.startsWith('public_')) {
      throw new Error('Default public channels cannot be deleted');
    }
    if (db && auth?.currentUser && !channelId.startsWith('local_')) {
      try {
        const channelRef = doc(db, 'channels', channelId);
        await deleteDoc(channelRef);
      } catch (e) {
        console.warn('[ChatService] Firestore deleteDoc warning:', e);
      }
    }
    try {
      const cached = (await StorageService.getItem('tangent_channels_cache', [])) || [];
      const updated = cached.filter(c => c.id !== channelId);
      await StorageService.setItem('tangent_channels_cache', updated);
    } catch (e) {
      console.warn('[ChatService] Error updating channels cache on delete:', e);
    }
  },

  // Clear all messages in a channel
  async clearChannelMessages(channelId, operatorHandle = 'Operator') {
    if (!channelId) throw new Error('Channel ID is required');

    const messagesRef = collection(db, 'channels', channelId, 'messages');
    const snap = await getDocs(messagesRef);

    const deletePromises = snap.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);

    // Update parent channel's lastMessage notice
    try {
      const channelDocRef = doc(db, 'channels', channelId);
      await updateDoc(channelDocRef, {
        updatedAt: serverTimestamp(),
        lastMessage: {
          text: `[Logs purged by ${operatorHandle}]`,
          senderHandle: 'SYSTEM RELAY',
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      console.warn('[ChatService] Failed to update lastMessage after clearing:', err);
    }
  },

  // Broadcast or clear real-time typing status on a channel
  async setChannelTypingStatus(channelId, currentUser, speakingPersona = null, isTyping = true) {
    if (!channelId || !currentUser?.uid || !db) return;
    try {
      const channelRef = doc(db, 'channels', channelId);
      const handle = getEffectiveUserHandle(currentUser);
      const personaName = speakingPersona?.['char-name'] || speakingPersona?.name || null;

      await updateDoc(channelRef, {
        [`typingUsers.${currentUser.uid}`]: isTyping
          ? {
              uid: currentUser.uid,
              handle,
              personaName,
              isTyping: true,
              updatedAt: Date.now()
            }
          : null
      }).catch(() => {});
    } catch (e) {
      // Non-critical ephemeral state
    }
  },

  // Toggle an emoji reaction on a channel message
  async toggleMessageReaction(channelId, messageId, emoji, currentUser) {
    if (!channelId || !messageId || !emoji || !currentUser?.uid || !db) return;
    try {
      const msgRef = doc(db, 'channels', channelId, 'messages', messageId);
      const snap = await getDoc(msgRef);
      if (!snap.exists()) return;
      const data = snap.data();
      const reactions = { ...(data.reactions || {}) };
      const existingUsers = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
      const hasReacted = existingUsers.includes(currentUser.uid);

      if (hasReacted) {
        const nextUsers = existingUsers.filter(id => id !== currentUser.uid);
        if (nextUsers.length === 0) {
          delete reactions[emoji];
        } else {
          reactions[emoji] = nextUsers;
        }
      } else {
        reactions[emoji] = [...existingUsers, currentUser.uid];
      }

      await updateDoc(msgRef, {
        reactions,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('[ChatService] Failed to toggle reaction:', err);
    }
  },

  // Update status on an interactive squad_invite message card in a DM channel
  async updateInviteMessageStatus(channelId, messageId, inviteStatus) {
    if (!channelId || !messageId || !inviteStatus || !db) return;
    try {
      const msgRef = doc(db, 'channels', channelId, 'messages', messageId);
      await updateDoc(msgRef, {
        inviteStatus,
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {}
  }
};

export default ChatService;
