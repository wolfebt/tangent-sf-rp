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
  onSnapshot, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { StorageService } from './storageService';

// Helper to generate a random 6-character alphanumeric invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'GRP-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const GroupService = {
  // 1. Create a new Game Group and automatically provision a tied-in channel
  async createGroup({
    name,
    description = '',
    gameSystem = 'Tangent SF RP',
    campaignId = null,
    campaignTitle = '',
    maxMembers = 6,
    isPublic = true,
    currentUser,
    persona = null
  }) {
    if (!name || !name.trim()) throw new Error('Game group name is required');
    if (!currentUser) throw new Error('You must be logged in to create a game group');

    const groupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const inviteCode = generateInviteCode();
    const cleanName = name.trim();
    const userHandle = currentUser.displayName || currentUser.email || 'Operative';

    // Channel ID for tied-in group comms
    const channelId = `group_chan_${groupId}`;

    // Persona representation for the creator
    const creatorMember = {
      userId: currentUser.uid,
      handle: userHandle,
      role: 'GM', // 'GM' | 'Player' | 'Spectator'
      joinedAt: new Date().toISOString(),
      persona: persona ? {
        id: persona['character-doc-id'] || persona.id,
        name: persona['char-name'] || persona.name || 'Unnamed Operative',
        species: persona['char-species'] || persona.species || 'Human',
        role: persona['char-concept'] || persona['char-occu'] || persona.occupation || 'Specialist',
        health: persona.health || 30,
        currentHealth: persona.current_health ?? (persona.current_hp ?? 30),
        vitality: persona.vitality || 30,
        currentVitality: persona.current_vitality ?? 30
      } : null
    };

    const groupData = {
      id: groupId,
      name: cleanName,
      description: description.trim(),
      gameSystem: gameSystem || 'Tangent SF RP',
      campaignId: campaignId || null,
      campaignTitle: campaignTitle || '',
      inviteCode: inviteCode,
      creatorId: currentUser.uid,
      creatorHandle: userHandle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      maxMembers: Number(maxMembers) || 6,
      isPublic: Boolean(isPublic),
      status: 'Recruiting', // 'Recruiting' | 'In Session' | 'Hiatus' | 'Completed'
      channelId: channelId,
      members: [currentUser.uid],
      memberDetails: {
        [currentUser.uid]: creatorMember
      }
    };

    // 1a. Store group in Firestore
    if (db) {
      try {
        const groupRef = doc(db, 'game_groups', groupId);
        await setDoc(groupRef, groupData);
      } catch (err) {
        console.warn('[GroupService] Firestore group write fallback to local cache:', err);
      }
    }

    // 1b. Provision the tied-in channel in 'channels' collection
    if (db) {
      try {
        const channelRef = doc(db, 'channels', channelId);
        const channelData = {
          id: channelId,
          name: `squad-${cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`,
          displayName: `🛡️ ${cleanName}`,
          topic: `Tied-in Squad frequency for Game Group: ${cleanName}`,
          type: 'group',
          groupId: groupId,
          groupName: cleanName,
          isPublic: false,
          createdById: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          members: [currentUser.uid],
          lastMessage: {
            text: `Squad Comms Link Established for ${cleanName}.`,
            senderHandle: 'SYSTEM RELAY',
            timestamp: new Date().toISOString()
          }
        };
        await setDoc(channelRef, channelData);
      } catch (err) {
        console.warn('[GroupService] Failed to create tied-in channel:', err);
      }
    }

    // Cache locally
    try {
      const cached = await StorageService.getItem('tangent_game_groups') || [];
      const updated = [groupData, ...cached.filter(g => g.id !== groupId)];
      await StorageService.setItem('tangent_game_groups', updated);
    } catch (e) {
      console.warn('[GroupService] Storage cache write failed:', e);
    }

    return groupData;
  },

  // 2. Subscribe to all game groups for the current user (as owner, GM, or player member)
  subscribeToUserGroups(currentUser, callback) {
    if (!currentUser) {
      StorageService.getItem('tangent_game_groups').then(cached => {
        callback(Array.isArray(cached) ? cached : []);
      });
      return () => {};
    }

    if (!db) {
      StorageService.getItem('tangent_game_groups').then(cached => {
        callback(Array.isArray(cached) ? cached : []);
      });
      return () => {};
    }

    const groupsRef = collection(db, 'game_groups');
    const unsub = onSnapshot(groupsRef, (snapshot) => {
      const allGroups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const userGroups = allGroups.filter(g => {
        if (g.creatorId === currentUser.uid) return true;
        if (Array.isArray(g.members) && g.members.includes(currentUser.uid)) return true;
        if (g.isPublic) return true;
        return false;
      });

      // Update storage cache
      StorageService.setItem('tangent_game_groups', userGroups);
      callback(userGroups);
    }, (err) => {
      console.warn('[GroupService] Error listening to user groups:', err);
      StorageService.getItem('tangent_game_groups').then(cached => {
        callback(Array.isArray(cached) ? cached : []);
      });
    });

    return unsub;
  },

  // 3. Send direct in-app invite to another user
  async sendGroupInvite({
    groupId,
    groupName,
    channelId,
    targetUserId,
    targetUserHandle,
    currentUser
  }) {
    if (!groupId || !targetUserId) throw new Error('Missing group or target user ID');
    if (!currentUser) throw new Error('Must be logged in to send invite');

    const inviteId = `invite_${groupId}_${targetUserId}_${Date.now()}`;
    const inviterHandle = currentUser.displayName || currentUser.email || 'Operative';

    const inviteData = {
      id: inviteId,
      groupId: groupId,
      groupName: groupName || 'Game Squad',
      channelId: channelId || `group_chan_${groupId}`,
      fromUserId: currentUser.uid,
      fromUserHandle: inviterHandle,
      toUserId: targetUserId,
      toUserHandle: targetUserHandle || 'Operator',
      status: 'pending', // 'pending' | 'accepted' | 'declined'
      createdAt: new Date().toISOString()
    };

    if (db) {
      const inviteRef = doc(db, 'group_invites', inviteId);
      await setDoc(inviteRef, inviteData);

      // Post an automated DM notification if possible
      try {
        const notifChannelId = `dm_${[currentUser.uid, targetUserId].sort().join('_')}`;
        const notifRef = collection(db, 'channels', notifChannelId, 'messages');
        await addDoc(notifRef, {
          text: `[SQUAD INVITATION] You have been invited to join "${groupName}" by @${inviterHandle}. Check your Game Squads drawer to accept.`,
          type: 'system',
          senderId: 'system',
          senderHandle: 'SYSTEM RELAY',
          createdAt: serverTimestamp(),
          createdLocalAt: new Date().toISOString()
        });
      } catch (e) {
        // Ignored
      }
    }

    return inviteData;
  },

  // 4. Subscribe to pending invites for current user
  subscribeToIncomingInvites(currentUser, callback) {
    if (!currentUser || !db) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'group_invites'),
      where('toUserId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const invites = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(invites);
    }, (err) => {
      console.warn('[GroupService] Error listening to invites:', err);
      callback([]);
    });

    return unsub;
  },

  // 5. Respond to Invite (Accept or Decline)
  async respondToInvite({
    inviteId,
    groupId,
    accept,
    currentUser,
    persona = null
  }) {
    if (!inviteId || !currentUser) throw new Error('Invalid invite response payload');

    if (db) {
      const inviteRef = doc(db, 'group_invites', inviteId);
      await updateDoc(inviteRef, {
        status: accept ? 'accepted' : 'declined',
        respondedAt: new Date().toISOString()
      });

      if (accept && groupId) {
        const userHandle = currentUser.displayName || currentUser.email || 'Operative';
        const memberData = {
          userId: currentUser.uid,
          handle: userHandle,
          role: 'Player',
          joinedAt: new Date().toISOString(),
          persona: persona ? {
            id: persona['character-doc-id'] || persona.id,
            name: persona['char-name'] || persona.name || 'Operative',
            species: persona['char-species'] || persona.species || 'Human',
            role: persona['char-concept'] || persona['char-occu'] || persona.occupation || 'Specialist',
            health: persona.health || 30,
            currentHealth: persona.current_health ?? (persona.current_hp ?? 30),
            vitality: persona.vitality || 30,
            currentVitality: persona.current_vitality ?? 30
          } : null
        };

        // Add member to group
        const groupRef = doc(db, 'game_groups', groupId);
        await updateDoc(groupRef, {
          members: arrayUnion(currentUser.uid),
          [`memberDetails.${currentUser.uid}`]: memberData,
          updatedAt: new Date().toISOString()
        });

        // Add member to tied-in channel
        const groupSnap = await getDoc(groupRef);
        if (groupSnap.exists()) {
          const groupInfo = groupSnap.data();
          const channelId = groupInfo.channelId || `group_chan_${groupId}`;
          const channelRef = doc(db, 'channels', channelId);
          await updateDoc(channelRef, {
            members: arrayUnion(currentUser.uid)
          }).catch(() => {});
        }
      }
    }
  },

  // 6. Join a group directly using an Invite Code (e.g. GRP-ABC123)
  async joinGroupByCode({
    inviteCode,
    currentUser,
    persona = null
  }) {
    if (!inviteCode || !inviteCode.trim()) throw new Error('Invite code is required');
    if (!currentUser) throw new Error('Must be logged in to join a group');

    const cleanCode = inviteCode.trim().toUpperCase();

    if (!db) throw new Error('Database connection required to join by code');

    const q = query(
      collection(db, 'game_groups'),
      where('inviteCode', '==', cleanCode)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error(`No active game squad found for invite code "${cleanCode}".`);
    }

    const groupDoc = snapshot.docs[0];
    const groupData = { id: groupDoc.id, ...groupDoc.data() };

    if (groupData.members && groupData.members.includes(currentUser.uid)) {
      return groupData; // Already a member
    }

    if (groupData.members && groupData.maxMembers && groupData.members.length >= groupData.maxMembers) {
      throw new Error(`Squad is at maximum capacity (${groupData.maxMembers} operatives).`);
    }

    const userHandle = currentUser.displayName || currentUser.email || 'Operative';
    const memberData = {
      userId: currentUser.uid,
      handle: userHandle,
      role: 'Player',
      joinedAt: new Date().toISOString(),
      persona: persona ? {
        id: persona['character-doc-id'] || persona.id,
        name: persona['char-name'] || persona.name || 'Operative',
        species: persona['char-species'] || persona.species || 'Human',
        role: persona['char-concept'] || persona['char-occu'] || persona.occupation || 'Specialist',
        health: persona.health || 30,
        currentHealth: persona.current_health ?? (persona.current_hp ?? 30),
        vitality: persona.vitality || 30,
        currentVitality: persona.current_vitality ?? 30
      } : null
    };

    // Update group document
    const groupRef = doc(db, 'game_groups', groupDoc.id);
    await updateDoc(groupRef, {
      members: arrayUnion(currentUser.uid),
      [`memberDetails.${currentUser.uid}`]: memberData,
      updatedAt: new Date().toISOString()
    });

    // Grant access to tied-in channel
    const channelId = groupData.channelId || `group_chan_${groupDoc.id}`;
    try {
      const channelRef = doc(db, 'channels', channelId);
      await updateDoc(channelRef, {
        members: arrayUnion(currentUser.uid)
      });
    } catch (e) {
      console.warn('[GroupService] Channel member update skipped:', e);
    }

    return {
      ...groupData,
      members: [...(groupData.members || []), currentUser.uid],
      memberDetails: {
        ...(groupData.memberDetails || {}),
        [currentUser.uid]: memberData
      }
    };
  },

  // 7. Update assigned Operative Persona for a member in a group
  async updateMemberPersona({ groupId, userId, persona }) {
    if (!groupId || !userId) return;

    const personaPayload = persona ? {
      id: persona['character-doc-id'] || persona.id,
      name: persona['char-name'] || persona.name || 'Operative',
      species: persona['char-species'] || persona.species || 'Human',
      role: persona['char-concept'] || persona['char-occu'] || persona.occupation || 'Specialist',
      health: persona.health || 30,
      currentHealth: persona.current_health ?? (persona.current_hp ?? 30),
      vitality: persona.vitality || 30,
      currentVitality: persona.current_vitality ?? 30
    } : null;

    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      await updateDoc(groupRef, {
        [`memberDetails.${userId}.persona`]: personaPayload,
        updatedAt: new Date().toISOString()
      });
    }
  },

  // 8. Update Group details (name, description, status, campaignId)
  async updateGroup(groupId, updates) {
    if (!groupId) return;
    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    }
  },

  // 9. Leave Group
  async leaveGroup({ groupId, userId }) {
    if (!groupId || !userId) return;
    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const data = groupSnap.data();
        const updatedMembers = (data.members || []).filter(id => id !== userId);
        const updatedDetails = { ...(data.memberDetails || {}) };
        delete updatedDetails[userId];

        await updateDoc(groupRef, {
          members: updatedMembers,
          memberDetails: updatedDetails,
          updatedAt: new Date().toISOString()
        });

        if (data.channelId) {
          const channelRef = doc(db, 'channels', data.channelId);
          await updateDoc(channelRef, {
            members: arrayRemove(userId)
          }).catch(() => {});
        }
      }
    }
  },

  // 10. Delete Group (Creator or Admin)
  async deleteGroup({ groupId }) {
    if (!groupId) return;
    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const data = groupSnap.data();
        if (data.channelId) {
          const channelRef = doc(db, 'channels', data.channelId);
          await deleteDoc(channelRef).catch(() => {});
        }
      }
      await deleteDoc(groupRef);
    }
  }
};

export default GroupService;
