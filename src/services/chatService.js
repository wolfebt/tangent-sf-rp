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

  // Subscribe to all channels visible to current user
  subscribeToUserChannels(currentUser, callback) {
    if (!currentUser) {
      const q = query(
        collection(db, 'channels'),
        where('isPublic', '==', true)
      );
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(list);
      }, (err) => {
        console.warn('[ChatService] Error listening to public channels:', err);
      });
    }

    const channelsRef = collection(db, 'channels');
    return onSnapshot(channelsRef, (snapshot) => {
      const allChannels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const userChannels = allChannels.filter(ch => {
        if (ch.isPublic) return true;
        if (Array.isArray(ch.members) && ch.members.includes(currentUser.uid)) return true;
        if (ch.createdById === currentUser.uid) return true;
        return false;
      });
      callback(userChannels);
    }, (err) => {
      console.warn('[ChatService] Error listening to user channels:', err);
    });
  },

  // Subscribe to live messages in a specific channel
  subscribeToMessages(channelId, callback, maxLimit = 100) {
    if (!channelId) return () => {};
    const messagesRef = collection(db, 'channels', channelId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(maxLimit));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    }, (err) => {
      console.warn(`[ChatService] Error subscribing to channel ${channelId} messages:`, err);
    });
  },

  // Send a message
  async sendMessage(channelId, messagePayload) {
    if (!channelId) throw new Error('Channel ID is required');

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

  // Create or retrieve a 1-on-1 Direct Message Channel
  async getOrCreateDirectMessageChannel(currentUser, targetUser) {
    if (!currentUser || !targetUser) throw new Error('Both users are required for DM');

    const sortedUids = [currentUser.uid, targetUser.uid].sort();
    const channelId = `dm_${sortedUids[0]}_${sortedUids[1]}`;

    const channelRef = doc(db, 'channels', channelId);
    const snap = await getDoc(channelRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    const currentHandle = currentUser.displayName || currentUser.email || 'Operator';
    const targetHandle = targetUser.userHandle || targetUser.displayName || targetUser.email || 'Operator';

    const newChannel = {
      id: channelId,
      name: `dm-${targetHandle}`,
      displayName: `@${targetHandle}`,
      topic: `Encrypted 1-on-1 Comms between @${currentHandle} and @${targetHandle}`,
      type: 'direct',
      isPublic: false,
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
          photoURL: targetUser.photoURL || null
        }
      },
      lastMessage: {
        text: 'Direct CommLink established.',
        senderHandle: 'SYSTEM',
        timestamp: new Date().toISOString()
      }
    };

    await setDoc(channelRef, newChannel);
    return newChannel;
  },

  // Create a Custom Channel or Group Chat
  async createCustomChannel({ name, topic, isPublic = true, type = 'custom', members = [], currentUser }) {
    if (!name) throw new Error('Channel name is required');
    if (!currentUser) throw new Error('Must be logged in to create channel');

    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const channelId = `custom_${Date.now()}_${cleanName.substring(0, 20)}`;

    const memberList = Array.from(new Set([currentUser.uid, ...members]));
    const channelRef = doc(db, 'channels', channelId);

    const channelData = {
      id: channelId,
      name: cleanName,
      displayName: `#${cleanName}`,
      topic: topic || 'Custom operations channel',
      type: type, // 'custom' | 'group'
      isPublic: isPublic,
      createdById: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      members: memberList,
      lastMessage: {
        text: `Frequency opened: #${cleanName}`,
        senderHandle: currentUser.displayName || 'Architect',
        timestamp: new Date().toISOString()
      }
    };

    await setDoc(channelRef, channelData);
    return channelData;
  },

  // Fetch registered users directory for DM & Squad member selection
  async fetchUsersDirectory(currentUserId) {
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      const list = [];
      snap.forEach(d => {
        if (d.id !== currentUserId) {
          list.push({
            uid: d.id,
            ...d.data()
          });
        }
      });
      return list;
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

    const cleanSlug = trimmed.replace(/^#/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const displayName = trimmed.startsWith('#') || trimmed.startsWith('@') ? trimmed : `#${trimmed}`;

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
  }
};

export default ChatService;
