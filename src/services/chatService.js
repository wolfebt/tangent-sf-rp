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
import { db } from '../firebase';
import { StorageService } from './storageService';
import { 
  getFolioTombstones, 
  isFolioPersonaDeleted, 
  isPersonaEmptyTemplate, 
  getEffectiveUserHandle 
} from '../utils/personaValidationUtils';

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
    topic: 'Looking for Group, operative recruitment, and squad assembly dispatch.',
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
  // Ensure default public channels exist in Firestore
  async initDefaultChannels() {
    try {
      for (const ch of DEFAULT_PUBLIC_CHANNELS) {
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
      console.warn('[ChatService] Error verifying default channels:', err);
    }
  },

  // Subscribe to all channels visible to current user (with instant cache hydration)
  subscribeToUserChannels(currentUser, callback) {
    // 1. Instantly emit cached channels from IndexedDB if available
    StorageService.getItem('tangent_channels_cache', null).then(cached => {
      if (Array.isArray(cached) && cached.length > 0) {
        callback(cached);
      }
    }).catch(() => {});

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
        console.warn('[ChatService] Error listening to public channels:', err);
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
      console.warn('[ChatService] Error listening to public channels:', err);
    });

    const qMember = query(
      collection(db, 'channels'),
      where('members', 'array-contains', currentUser.uid)
    );
    const unsubMember = onSnapshot(qMember, (snap) => {
      memberList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      emitCombined();
    }, (err) => {
      console.warn('[ChatService] Error listening to member channels:', err);
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
      console.warn(`[ChatService] Error subscribing to channel ${channelId} messages:`, err);
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
      await updateDoc(channelDocRef, {
        updatedAt: serverTimestamp(),
        lastMessage: {
          text: messagePayload.type === 'dice_roll' 
            ? `🎲 ${messagePayload.senderHandle} rolled ${messagePayload.metadata?.result || 'dice'}` 
            : messagePayload.type === 'persona_log_entry'
            ? `📋 ${messagePayload.summary || 'Telemetry recorded'}`
            : (messagePayload.text?.substring(0, 80) || 'Transmission'),
          senderHandle: messagePayload.senderHandle || 'Unknown',
          senderId: messagePayload.senderId || '',
          timestamp: now.toISOString()
        }
      });
    } catch (err) {
      console.warn('[ChatService] Failed to update channel lastMessage:', err);
    }

    return docRef.id;
  },

  // Create or retrieve a 1-on-1 Direct Message Channel (supports separate Player vs Character commlines)
  async getOrCreateDirectMessageChannel(currentUser, targetUser, targetPersona = null) {
    if (!currentUser || !targetUser) throw new Error('Both users are required for DM');

    const sortedUids = [currentUser.uid, targetUser.uid].sort();
    const currentHandle = getEffectiveUserHandle(currentUser);
    const targetHandle = getEffectiveUserHandle(targetUser);

    let channelId = '';
    let isCharacterDM = Boolean(targetPersona);

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

    const personaName = targetPersona?.name || targetPersona?.['char-name'] || 'Operative';
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
          ? `Direct CommLink established with operative ${personaName}.`
          : `Direct CommLink established with operator @${targetHandle}.`,
        senderHandle: 'SYSTEM',
        timestamp: new Date().toISOString()
      }
    };

    await setDoc(channelRef, newChannel);
    return newChannel;
  },

  // Create a Custom Channel or Group Chat
  async createCustomChannel({ name, topic, isPublic = true, type = 'custom', members = [], characterMembers = [], currentUser }) {
    if (!name) throw new Error('Channel name is required');
    if (!currentUser) throw new Error('Must be logged in to create channel');

    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const channelId = `${type === 'group' ? 'group_chat' : 'custom'}_${Date.now()}_${cleanName.substring(0, 20)}`;

    const memberList = Array.from(new Set([currentUser.uid, ...members]));
    const channelRef = doc(db, 'channels', channelId);

    const displayName = type === 'group' 
      ? (name.startsWith('🛡️') || name.startsWith('👥') ? name : `🛡️ ${name}`)
      : `#${cleanName}`;

    const channelData = {
      id: channelId,
      name: cleanName,
      displayName: displayName,
      topic: topic || (type === 'group' ? 'Tactical Operative Group Frequency' : 'Custom operations channel'),
      type: type, // 'custom' | 'group'
      isPublic: isPublic,
      createdById: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      members: memberList,
      characterMembers: Array.isArray(characterMembers) ? characterMembers : [],
      lastMessage: {
        text: `Frequency opened: ${displayName}`,
        senderHandle: currentUser.displayName || 'Architect',
        timestamp: new Date().toISOString()
      }
    };

    await setDoc(channelRef, channelData);
    return channelData;
  },

  // Check if a user document represents an active online state
  isUserOnline(uData) {
    if (!uData) return false;
    if (uData.status === 'offline') return false;
    if (uData.status === 'online') {
      const lastSeenMs = uData.lastSeen?.toDate 
        ? uData.lastSeen.toDate().getTime() 
        : uData.lastSeenLocal 
        ? new Date(uData.lastSeenLocal).getTime() 
        : 0;
      // Active within last 5 minutes (300,000 ms) or freshly set
      if (!lastSeenMs || (Date.now() - lastSeenMs < 300000)) return true;
    }
    return false;
  },

  // Update online presence status in Firestore
  async updateUserPresence(currentUser, status = 'online', extra = {}) {
    if (!currentUser?.uid || !db) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const now = new Date();
      const effectiveHandle = getEffectiveUserHandle({
        userHandle: extra.userHandle || localStorage.getItem('userHandle'),
        displayName: currentUser.displayName,
        email: currentUser.email
      });

      const payload = {
        status: status, // 'online' | 'offline' | 'idle'
        lastSeen: serverTimestamp(),
        lastSeenLocal: now.toISOString(),
        displayName: currentUser.displayName || currentUser.email || 'Operator',
        userHandle: effectiveHandle,
        photoURL: currentUser.photoURL || null
      };

      if (extra.activePersona) {
        payload.currentPersona = {
          id: extra.activePersona['character-doc-id'] || extra.activePersona.id,
          name: extra.activePersona['char-name'] || extra.activePersona.name || 'Operative',
          species: extra.activePersona['char-species'] || extra.activePersona.species || 'Human',
          role: extra.activePersona['char-concept'] || extra.activePersona.role || extra.activePersona['char-occu'] || 'Specialist',
          avatar: extra.activePersona.avatar || null
        };
      }

      if (Array.isArray(extra.personasSummary)) {
        payload.personas = extra.personasSummary;
      }

      await setDoc(userDocRef, payload, { merge: true });
    } catch (err) {
      console.warn('[ChatService] Error updating user presence:', err);
    }
  },

  // Real-time listener for user directory and presence
  subscribeToUsersPresence(currentUserId, callback) {
    // 1. Immediately emit cached directory if available
    StorageService.getItem('tangent_users_presence_cache', null).then(cached => {
      if (Array.isArray(cached) && cached.length > 0) {
        callback(cached);
      }
    }).catch(() => {});

    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, async (snapshot) => {
      const userMap = new Map();
      const tombstones = getFolioTombstones();

      snapshot.forEach(d => {
        const uData = d.data();
        const online = ChatService.isUserOnline(uData);
        const effectiveHandle = getEffectiveUserHandle({ ...uData, uid: d.id });

        const userChars = [];
        // Priority 1: If user doc has explicit clean personas array, use it
        if (Array.isArray(uData.personas) && uData.personas.length > 0) {
          uData.personas.forEach(p => {
            const pId = p.id || p['character-doc-id'] || p.name;
            if (p.name && !isFolioPersonaDeleted(pId, tombstones) && !isPersonaEmptyTemplate(p) && !p.isDeleted) {
              userChars.push({
                id: pId,
                name: p.name || p['char-name'] || 'Operative',
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

      // Discover any missing users from game groups to ensure ALL users in the system are listed
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
      } catch (e) {
        // Safe fallback
      }

      // For users without characters in user doc, check subcollections (skipping current user to avoid stale overwrite)
      const userList = Array.from(userMap.values());
      await Promise.all(userList.map(async (u) => {
        // If user already has characters or is current user (who gets active folio in context), skip subcollection crawl
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
        } catch (err) {
          // Subcollection read may be restricted if not public; gracefully ignored
        }
      }));

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
                name: p.name || p['char-name'] || 'Operative',
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
    const channelRef = doc(db, 'channels', channelId);
    const payload = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    await updateDoc(channelRef, payload);
  },

  // Specific helper to rename channel & topic
  async renameChannel(channelId, newDisplayName, newTopic) {
    if (!channelId) throw new Error('Channel ID is required');
    const trimmed = (newDisplayName || '').trim();
    if (!trimmed) throw new Error('Channel name cannot be empty');

    const cleanSlug = trimmed.replace(/^[#🛡️👥\s]+/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const isGroup = trimmed.startsWith('🛡️') || trimmed.startsWith('👥');
    const displayName = isGroup ? trimmed : (trimmed.startsWith('#') || trimmed.startsWith('@') ? trimmed : `#${trimmed}`);

    const updates = {
      displayName: displayName,
      name: cleanSlug,
      updatedAt: serverTimestamp()
    };
    if (newTopic !== undefined) {
      updates.topic = newTopic.trim();
    }

    const channelRef = doc(db, 'channels', channelId);
    await updateDoc(channelRef, updates);
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
    const channelRef = doc(db, 'channels', channelId);
    await deleteDoc(channelRef);
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
  }
};

export default ChatService;
