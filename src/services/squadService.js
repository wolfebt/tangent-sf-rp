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
import { ChatService } from './chatService';

// Helper to generate a random 6-character alphanumeric squad invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'SQD-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const SquadService = {
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
    const userHandle = currentUser.displayName || currentUser.email || 'Operator';

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
        name: persona['char-name'] || persona.name || 'Unnamed Persona',
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
          name: `team-${cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`,
          displayName: `🛡️ ${cleanName}`,
          topic: `Default Active Team frequency for: ${cleanName}`,
          type: 'group',
          groupId: groupId,
          groupName: cleanName,
          isPublic: false,
          createdById: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          members: [currentUser.uid],
          lastMessage: {
            text: `Active Team Frequency initialized for ${cleanName}.`,
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

  // 1c. Ensure a team has a default active frequency in Firestore
  async ensureTeamFrequency(group, currentUser) {
    if (!group || !group.id) return null;

    const cleanName = group.name || 'Operator Squad';
    const channelId = group.channelId || `group_chan_${group.id}`;

    if (!db) {
      group.channelId = channelId;
      return channelId;
    }

    try {
      const channelRef = doc(db, 'channels', channelId);
      const snap = await getDoc(channelRef);
      const memberUids = Array.from(new Set([
        ...(Array.isArray(group.members) ? group.members : []),
        group.creatorId,
        currentUser?.uid
      ].filter(Boolean)));

      if (!snap.exists()) {
        const channelData = {
          id: channelId,
          name: `team-${cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`,
          displayName: `🛡️ ${cleanName}`,
          topic: `Default Active Team frequency for: ${cleanName}`,
          type: 'group',
          groupId: group.id,
          groupName: cleanName,
          isPublic: false,
          createdById: group.creatorId || currentUser?.uid || 'system',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          members: memberUids,
          lastMessage: {
            text: `Default Active Team Frequency initialized for ${cleanName}.`,
            senderHandle: 'SYSTEM RELAY',
            timestamp: new Date().toISOString()
          }
        };
        await setDoc(channelRef, channelData);
      } else {
        const existingData = snap.data();
        const existingMembers = Array.isArray(existingData.members) ? existingData.members : [];
        const missing = memberUids.filter(u => !existingMembers.includes(u));
        if (missing.length > 0) {
          await updateDoc(channelRef, {
            members: [...existingMembers, ...missing],
            updatedAt: serverTimestamp()
          });
        }
      }

      if (!group.channelId) {
        group.channelId = channelId;
        const groupRef = doc(db, 'game_groups', group.id);
        await updateDoc(groupRef, { channelId: channelId });
      }

      return channelId;
    } catch (err) {
      console.warn('[GroupService] Error ensuring team frequency:', err);
      return channelId;
    }
  },

  // 2. Subscribe to all game groups for the current user (as owner, GM, or player member)
  subscribeToUserGroups(currentUser, callback) {
    if (!currentUser || !db) {
      if (db) {
        try {
          const q = query(collection(db, 'game_groups'), where('isPublic', '==', true));
          return onSnapshot(q, (snapshot) => {
            const pubGroups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            StorageService.setItem('tangent_game_groups', pubGroups);
            callback(pubGroups);
          }, () => {
            StorageService.getItem('tangent_game_groups').then(cached => callback(Array.isArray(cached) ? cached : []));
          });
        } catch (e) {
          // Fallback to local
        }
      }
      StorageService.getItem('tangent_game_groups').then(cached => {
        callback(Array.isArray(cached) ? cached : []);
      });
      return () => {};
    }

    // Two safe queries combined in memory: public groups + user's member groups
    let publicGroups = [];
    let memberGroups = [];

    const emitCombined = () => {
      const map = new Map();
      [...publicGroups, ...memberGroups].forEach(g => {
        map.set(g.id, g);
      });
      const combined = Array.from(map.values());
      // Ensure all enrolled teams have a default active frequency provisioned
      combined.forEach(g => {
        if (!g.channelId) {
          GroupService.ensureTeamFrequency(g, currentUser);
        }
      });
      StorageService.setItem('tangent_game_groups', combined);
      callback(combined);
    };

    const qPublic = query(
      collection(db, 'game_groups'),
      where('isPublic', '==', true)
    );
    const unsubPublic = onSnapshot(qPublic, (snapshot) => {
      publicGroups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      emitCombined();
    }, (err) => {
      console.warn('[GroupService] Error listening to public groups:', err);
    });

    const qMember = query(
      collection(db, 'game_groups'),
      where('members', 'array-contains', currentUser.uid)
    );
    const unsubMember = onSnapshot(qMember, (snapshot) => {
      memberGroups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      emitCombined();
    }, (err) => {
      console.warn('[GroupService] Error listening to member groups:', err);
    });

    return () => {
      if (unsubPublic) unsubPublic();
      if (unsubMember) unsubMember();
    };
  },

  // 3. Send direct in-app invite to another user with rich metadata & parent DM provisioning
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
    const inviterHandle = currentUser.displayName || currentUser.email || 'Operator';

    // Retrieve group snapshot to embed rich metadata in the invite
    let groupMeta = {
      name: groupName || 'Game Squad',
      description: '',
      campaignTitle: '',
      status: 'Recruiting',
      maxMembers: 6,
      currentMembersCount: 1,
      creatorHandle: inviterHandle
    };

    if (db) {
      try {
        const groupRef = doc(db, 'game_groups', groupId);
        const gSnap = await getDoc(groupRef);
        if (gSnap.exists()) {
          const gData = gSnap.data();
          groupMeta = {
            name: gData.name || groupName || 'Game Squad',
            description: gData.description || '',
            campaignTitle: gData.campaignTitle || '',
            status: gData.status || 'Recruiting',
            maxMembers: gData.maxMembers || 6,
            currentMembersCount: (gData.members || []).length,
            creatorHandle: gData.creatorHandle || inviterHandle
          };
        }
      } catch (err) {
        console.warn('[GroupService] Failed to snapshot group metadata for invite:', err);
      }
    }

    const inviteData = {
      id: inviteId,
      groupId: groupId,
      groupName: groupMeta.name,
      channelId: channelId || `group_chan_${groupId}`,
      fromUserId: currentUser.uid,
      fromUserHandle: inviterHandle,
      toUserId: targetUserId,
      toUserHandle: targetUserHandle || 'Operator',
      status: 'pending', // 'pending' | 'accepted' | 'declined' | 'revoked'
      createdAt: new Date().toISOString(),
      groupMetadata: groupMeta
    };

    // Save to local cache
    try {
      const cached = (await StorageService.getItem('tangent_group_invites')) || [];
      const updated = [inviteData, ...cached.filter(i => i.id !== inviteId)];
      await StorageService.setItem('tangent_group_invites', updated);
    } catch (e) {
      console.warn('[GroupService] Local cache save invite failed:', e);
    }

    if (db) {
      try {
        const inviteRef = doc(db, 'group_invites', inviteId);
        await setDoc(inviteRef, inviteData);

        // Ensure parent DM channel document exists prior to writing transmission
        try {
          await ChatService.getOrCreateDirectMessageChannel(currentUser, {
            uid: targetUserId,
            userHandle: targetUserHandle || 'Operator'
          });

          const notifChannelId = `dm_${[currentUser.uid, targetUserId].sort().join('_')}`;
          const notifRef = collection(db, 'channels', notifChannelId, 'messages');
          await addDoc(notifRef, {
            text: `[SQUAD INVITATION] You have been invited to join fireteam "${groupMeta.name}" by @${inviterHandle}. Check your Game Squads drawer to review and confirm.`,
            type: 'system',
            senderId: 'system',
            senderHandle: 'SYSTEM RELAY',
            createdAt: serverTimestamp(),
            createdLocalAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('[GroupService] DM invite message delivery fallback:', e);
        }
      } catch (err) {
        console.warn('[GroupService] Firestore invite write fallback to local cache:', err);
      }
    }

    return inviteData;
  },

  // 4. Subscribe to pending invites for current user
  subscribeToIncomingInvites(currentUser, callback) {
    if (!currentUser) {
      callback([]);
      return () => {};
    }

    const deliverLocalFallback = async () => {
      try {
        const cached = (await StorageService.getItem('tangent_group_invites')) || [];
        const myInvites = cached.filter(i => 
          (i.toUserId === currentUser.uid || i.toUserHandle === currentUser.displayName) && 
          i.status === 'pending'
        );
        callback(myInvites);
      } catch (e) {
        callback([]);
      }
    };

    if (!db) {
      deliverLocalFallback();
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'group_invites'),
        where('toUserId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const invites = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sync local cache
        StorageService.setItem('tangent_group_invites', invites).catch(() => {});
        callback(invites);
      }, (err) => {
        console.warn('[GroupService] Error listening to invites, using local cache:', err);
        deliverLocalFallback();
      });

      return unsub;
    } catch (err) {
      deliverLocalFallback();
      return () => {};
    }
  },

  // 5. Respond to Invite (Accept or Decline)
  async respondToInvite({
    inviteId,
    groupId,
    accept,
    currentUser,
    persona = null,
    isLockedForPlay = false
  }) {
    if (!inviteId || !currentUser) throw new Error('Invalid invite response payload');

    if (db) {
      const inviteRef = doc(db, 'group_invites', inviteId);
      await updateDoc(inviteRef, {
        status: accept ? 'accepted' : 'declined',
        respondedAt: new Date().toISOString()
      });

      if (accept && groupId) {
        const userHandle = currentUser.displayName || currentUser.email || 'Operator';
        const memberData = {
          userId: currentUser.uid,
          handle: userHandle,
          role: 'Player',
          isLockedForPlay: Boolean(isLockedForPlay),
          joinedAt: new Date().toISOString(),
          persona: persona ? {
            id: persona['character-doc-id'] || persona.id,
            name: persona['char-name'] || persona.name || 'Persona',
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
    persona = null,
    isLockedForPlay = false
  }) {
    if (!inviteCode || !inviteCode.trim()) throw new Error('Invite code is required');
    if (!currentUser) throw new Error('Must be logged in to join a group');

    const cleanCode = inviteCode.trim().toUpperCase();

    let groupData = null;
    let groupDocId = null;

    if (db) {
      try {
        const q = query(
          collection(db, 'game_groups'),
          where('inviteCode', '==', cleanCode)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const groupDoc = snapshot.docs[0];
          groupDocId = groupDoc.id;
          groupData = { id: groupDoc.id, ...groupDoc.data() };
        }
      } catch (err) {
        console.warn('[GroupService] Firestore join query error, falling back to cache:', err);
      }
    }

    // Fallback to local storage if not found in Firestore
    if (!groupData) {
      try {
        const cachedGroups = (await StorageService.getItem('tangent_game_groups')) || [];
        const found = cachedGroups.find(g => g.inviteCode?.toUpperCase() === cleanCode);
        if (found) {
          groupData = found;
          groupDocId = found.id;
        }
      } catch (e) {
        // Ignored
      }
    }

    if (!groupData) {
      throw new Error(`No active game squad found for invite code "${cleanCode}".`);
    }

    if (groupData.members && groupData.members.includes(currentUser.uid)) {
      return groupData; // Already a member
    }

    if (groupData.members && groupData.maxMembers && groupData.members.length >= groupData.maxMembers) {
      throw new Error(`Squad is at maximum capacity (${groupData.maxMembers} operators).`);
    }

    const userHandle = currentUser.displayName || currentUser.email || 'Operator';
    const memberData = {
      userId: currentUser.uid,
      handle: userHandle,
      role: 'Player',
      isLockedForPlay: Boolean(isLockedForPlay),
      joinedAt: new Date().toISOString(),
      persona: persona ? {
        id: persona['character-doc-id'] || persona.id,
        name: persona['char-name'] || persona.name || 'Persona',
        species: persona['char-species'] || persona.species || 'Human',
        role: persona['char-concept'] || persona['char-occu'] || persona.occupation || 'Specialist',
        health: persona.health || 30,
        currentHealth: persona.current_health ?? (persona.current_hp ?? 30),
        vitality: persona.vitality || 30,
        currentVitality: persona.current_vitality ?? 30
      } : null
    };

    // Update group document in Firestore if possible
    if (db && groupDocId) {
      try {
        const groupRef = doc(db, 'game_groups', groupDocId);
        await updateDoc(groupRef, {
          members: arrayUnion(currentUser.uid),
          [`memberDetails.${currentUser.uid}`]: memberData,
          updatedAt: new Date().toISOString()
        });

        // Grant access to tied-in channel
        const channelId = groupData.channelId || `group_chan_${groupDocId}`;
        const channelRef = doc(db, 'channels', channelId);
        await updateDoc(channelRef, {
          members: arrayUnion(currentUser.uid)
        }).catch(() => {});
      } catch (err) {
        console.warn('[GroupService] Firestore join update fallback to local cache:', err);
      }
    }

    const updatedGroup = {
      ...groupData,
      members: [...(groupData.members || []), currentUser.uid],
      memberDetails: {
        ...(groupData.memberDetails || {}),
        [currentUser.uid]: memberData
      }
    };

    // Update local cache
    try {
      const cached = (await StorageService.getItem('tangent_game_groups')) || [];
      const updated = [updatedGroup, ...cached.filter(g => g.id !== updatedGroup.id)];
      await StorageService.setItem('tangent_game_groups', updated);
    } catch (e) {
      console.warn('[GroupService] Local cache save joined group failed:', e);
    }

    return updatedGroup;
  },

  // 7. Update assigned Persona for a member in a group
  async updateMemberPersona({ groupId, userId, persona }) {
    if (!groupId || !userId) return;

    const personaPayload = persona ? {
      id: persona['character-doc-id'] || persona.id,
      name: persona['char-name'] || persona.name || 'Persona',
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

  // 8. Update Group details (name, description, status, campaignId) and sync tied-in channel
  async updateGroup(groupId, updates) {
    if (!groupId) return;
    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // Synchronize tied-in squad channel if name or description changed
      if (updates.name || updates.description !== undefined) {
        try {
          const snap = await getDoc(groupRef);
          if (snap.exists()) {
            const data = snap.data();
            const channelId = data.channelId || `group_chan_${groupId}`;
            const channelRef = doc(db, 'channels', channelId);
            const channelUpdates = {
              updatedAt: serverTimestamp()
            };
            if (updates.name) {
              channelUpdates.displayName = `🛡️ ${updates.name.trim()}`;
              channelUpdates.groupName = updates.name.trim();
            }
            if (updates.description !== undefined) {
              channelUpdates.topic = updates.description.trim() || `Tied-in Squad frequency for Game Group: ${updates.name || data.name}`;
            }
            await updateDoc(channelRef, channelUpdates).catch(() => {});
          }
        } catch (e) {
          console.warn('[GroupService] Tied-in channel sync failed:', e);
        }
      }
    }
  },

  // 9. Subscribe to outgoing pending invites for a specific group (GM monitoring)
  subscribeToGroupOutgoingInvites(groupId, callback) {
    if (!groupId) {
      callback([]);
      return () => {};
    }

    const deliverLocalFallback = async () => {
      try {
        const cached = (await StorageService.getItem('tangent_group_invites')) || [];
        const groupInvites = cached.filter(i => i.groupId === groupId && i.status === 'pending');
        callback(groupInvites);
      } catch (e) {
        callback([]);
      }
    };

    if (!db) {
      deliverLocalFallback();
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'group_invites'),
        where('groupId', '==', groupId),
        where('status', '==', 'pending')
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const invites = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(invites);
      }, (err) => {
        console.warn('[GroupService] Error listening to outgoing invites, using cache:', err);
        deliverLocalFallback();
      });

      return unsub;
    } catch (err) {
      deliverLocalFallback();
      return () => {};
    }
  },

  // 10. Revoke a pending invite (GM action)
  async revokeInvite({ inviteId }) {
    if (!inviteId) return;

    if (db) {
      try {
        const inviteRef = doc(db, 'group_invites', inviteId);
        await updateDoc(inviteRef, {
          status: 'revoked',
          revokedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[GroupService] Firestore revoke invite fallback:', err);
      }
    }

    try {
      const cached = (await StorageService.getItem('tangent_group_invites')) || [];
      const updated = cached.map(i => i.id === inviteId ? { ...i, status: 'revoked' } : i);
      await StorageService.setItem('tangent_group_invites', updated);
    } catch (e) {
      // Ignored
    }
  },

  // 11. Discharge / Kick a member from the group (GM action)
  async kickMember({ groupId, userId }) {
    if (!groupId || !userId) return;

    if (db) {
      try {
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
      } catch (err) {
        console.warn('[GroupService] Failed to discharge member:', err);
      }
    }

    try {
      const cached = (await StorageService.getItem('tangent_game_groups')) || [];
      const updated = cached.map(g => {
        if (g.id === groupId) {
          const mems = (g.members || []).filter(id => id !== userId);
          const details = { ...(g.memberDetails || {}) };
          delete details[userId];
          return { ...g, members: mems, memberDetails: details };
        }
        return g;
      });
      await StorageService.setItem('tangent_game_groups', updated);
    } catch (e) {
      // Ignored
    }
  },

  // 12. Update a member's operational role (GM, Co-GM, Player, Spectator)
  async updateMemberRole({ groupId, userId, role }) {
    if (!groupId || !userId || !role) return;

    if (db) {
      try {
        const groupRef = doc(db, 'game_groups', groupId);
        await updateDoc(groupRef, {
          [`memberDetails.${userId}.role`]: role,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[GroupService] Failed to update member role:', err);
      }
    }

    try {
      const cached = (await StorageService.getItem('tangent_game_groups')) || [];
      const updated = cached.map(g => {
        if (g.id === groupId && g.memberDetails?.[userId]) {
          return {
            ...g,
            memberDetails: {
              ...g.memberDetails,
              [userId]: { ...g.memberDetails[userId], role }
            }
          };
        }
        return g;
      });
      await StorageService.setItem('tangent_game_groups', updated);
    } catch (e) {
      // Ignored
    }
  },

  // 13. Leave Group
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

  // 14. Delete Group (Creator or Admin)
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
  },

  // 15. Transfer Primary Lead Architect Role to another Operator
  async transferArchitectRole({ groupId, newArchitectUserId, currentUser }) {
    if (!groupId || !newArchitectUserId || !currentUser) {
      throw new Error('Invalid role transfer parameters');
    }

    let targetUserHandle = 'Operator';
    let prevCreatorId = currentUser.uid;

    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) throw new Error('Squad not found');
      const data = groupSnap.data();

      // Ensure caller is the current Architect / creator
      if (data.creatorId !== currentUser.uid) {
        throw new Error('Only the Lead Architect can transfer team leadership');
      }

      const targetDetail = data.memberDetails?.[newArchitectUserId];
      if (!targetDetail) throw new Error('Target operator is not enrolled in this squad');
      targetUserHandle = targetDetail.handle || targetDetail.userHandle || 'Architect';

      const updatedDetails = { ...(data.memberDetails || {}) };
      // Promote new architect
      updatedDetails[newArchitectUserId] = {
        ...updatedDetails[newArchitectUserId],
        role: 'Architect'
      };
      // Step down previous architect to Co-Architect
      if (updatedDetails[prevCreatorId]) {
        updatedDetails[prevCreatorId] = {
          ...updatedDetails[prevCreatorId],
          role: 'Co-Architect'
        };
      }

      const coArchitects = Array.from(new Set([
        ...(Array.isArray(data.coArchitects) ? data.coArchitects.filter(id => id !== newArchitectUserId) : []),
        prevCreatorId
      ]));

      await updateDoc(groupRef, {
        creatorId: newArchitectUserId,
        creatorHandle: targetUserHandle,
        coArchitects,
        memberDetails: updatedDetails,
        updatedAt: new Date().toISOString()
      });

      // Update tied-in channel ownership
      if (data.channelId) {
        const channelRef = doc(db, 'channels', data.channelId);
        await updateDoc(channelRef, {
          createdById: newArchitectUserId,
          updatedAt: serverTimestamp()
        }).catch(() => {});
      }
    }

    // Update local cache
    try {
      const cached = (await StorageService.getItem('tangent_game_groups')) || [];
      const updated = cached.map(g => {
        if (g.id === groupId) {
          const details = { ...(g.memberDetails || {}) };
          if (details[newArchitectUserId]) {
            details[newArchitectUserId] = { ...details[newArchitectUserId], role: 'Architect' };
          }
          if (details[prevCreatorId]) {
            details[prevCreatorId] = { ...details[prevCreatorId], role: 'Co-Architect' };
          }
          return {
            ...g,
            creatorId: newArchitectUserId,
            creatorHandle: targetUserHandle,
            memberDetails: details
          };
        }
        return g;
      });
      await StorageService.setItem('tangent_game_groups', updated);
    } catch (e) {
      console.warn('[GroupService] Local cache transfer role failed:', e);
    }
  },

  // 16. Assign / Remove Co-Architect designation
  async setCoArchitect({ groupId, targetUserId, isCoArchitect }) {
    if (!groupId || !targetUserId) return;
    const newRole = isCoArchitect ? 'Co-Architect' : 'Operator';

    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const data = groupSnap.data();
        let coArchitects = Array.isArray(data.coArchitects) ? [...data.coArchitects] : [];
        if (isCoArchitect) {
          if (!coArchitects.includes(targetUserId)) coArchitects.push(targetUserId);
        } else {
          coArchitects = coArchitects.filter(id => id !== targetUserId);
        }

        await updateDoc(groupRef, {
          coArchitects,
          [`memberDetails.${targetUserId}.role`]: newRole,
          updatedAt: new Date().toISOString()
        });
      }
    }

    try {
      const cached = (await StorageService.getItem('tangent_game_groups')) || [];
      const updated = cached.map(g => {
        if (g.id === groupId && g.memberDetails?.[targetUserId]) {
          return {
            ...g,
            memberDetails: {
              ...g.memberDetails,
              [targetUserId]: { ...g.memberDetails[targetUserId], role: newRole }
            }
          };
        }
        return g;
      });
      await StorageService.setItem('tangent_game_groups', updated);
    } catch (e) {
      console.warn('[GroupService] Local cache co-architect toggle failed:', e);
    }
  },

  // 17. Toggle Persona "Lock for Play" Status
  async togglePersonaPlayLock({ groupId, userId, isLocked }) {
    if (!groupId || !userId) return;

    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      await updateDoc(groupRef, {
        [`memberDetails.${userId}.persona.locked`]: Boolean(isLocked),
        [`memberDetails.${userId}.persona.lockedAt`]: isLocked ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      }).catch(err => console.warn('[GroupService] Failed to update persona lock in DB:', err));
    }

    try {
      const cached = (await StorageService.getItem('tangent_game_groups')) || [];
      const updated = cached.map(g => {
        if (g.id === groupId && g.memberDetails?.[userId]?.persona) {
          const persona = {
            ...g.memberDetails[userId].persona,
            locked: Boolean(isLocked),
            lockedAt: isLocked ? new Date().toISOString() : null
          };
          return {
            ...g,
            memberDetails: {
              ...g.memberDetails,
              [userId]: { ...g.memberDetails[userId], persona }
            }
          };
        }
        return g;
      });
      await StorageService.setItem('tangent_game_groups', updated);
    } catch (e) {
      // Ignored
    }
  },

  // 18. LFP: Flag Squad as Looking For Persons
  async flagSquadLFP({ groupId, neededRoles = [], pitch = '', openSlots = 2, active = true }) {
    if (!groupId) return;
    const lfpPayload = {
      active: Boolean(active),
      neededRoles: Array.isArray(neededRoles) ? neededRoles : [],
      pitch: pitch ? pitch.trim() : '',
      openSlots: Number(openSlots) || 2,
      updatedAt: new Date().toISOString()
    };

    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      await updateDoc(groupRef, {
        lfp: lfpPayload,
        status: active ? 'Recruiting' : 'Active',
        updatedAt: new Date().toISOString()
      }).catch(err => console.warn('[GroupService] Failed to flag squad LFP:', err));
    }

    try {
      const cached = (await StorageService.getItem('tangent_game_groups')) || [];
      const updated = cached.map(g => {
        if (g.id === groupId) {
          return { ...g, lfp: lfpPayload, status: active ? 'Recruiting' : 'Active' };
        }
        return g;
      });
      await StorageService.setItem('tangent_game_groups', updated);
    } catch (e) {}
  },

  // 19. LFP: Subscribe to squads actively looking for persons
  subscribeToLFPGroups(callback) {
    const deliverCache = async () => {
      try {
        const cached = (await StorageService.getItem('tangent_game_groups')) || [];
        const lfpList = cached.filter(g => g.lfp?.active || g.status === 'Recruiting');
        callback(lfpList);
      } catch (e) {
        callback([]);
      }
    };

    if (!db) {
      deliverCache();
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'game_groups'),
        where('isPublic', '==', true)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const allGroups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const lfpList = allGroups.filter(g => g.lfp?.active || g.status === 'Recruiting');
        callback(lfpList);
      }, (err) => {
        console.warn('[GroupService] Error listening to LFP groups:', err);
        deliverCache();
      });

      return unsub;
    } catch (e) {
      deliverCache();
      return () => {};
    }
  },

  // 20. LFT: Flag a Persona as Looking For Team
  async flagPersonaLFT({ personaId, personaData, operatorUid, operatorHandle, preferredRoles = [], pitch = '', active = true }) {
    if (!personaId || !operatorUid) return;

    const lftId = `lft_${personaId}`;
    const payload = {
      id: lftId,
      personaId,
      name: personaData?.['char-name'] || personaData?.name || 'Persona',
      species: personaData?.['char-species'] || personaData?.species || 'Human',
      concept: personaData?.['char-concept'] || personaData?.['char-occu'] || personaData?.role || 'Specialist',
      avatar: personaData?.avatar || null,
      health: personaData?.health || 30,
      vitality: personaData?.vitality || 30,
      operatorUid,
      operatorHandle: operatorHandle || 'Operator',
      preferredRoles: Array.isArray(preferredRoles) ? preferredRoles : [],
      pitch: pitch ? pitch.trim() : '',
      active: Boolean(active),
      updatedAt: new Date().toISOString()
    };

    if (db) {
      const lftRef = doc(db, 'lft_personas', lftId);
      if (active) {
        await setDoc(lftRef, payload);
      } else {
        await deleteDoc(lftRef).catch(() => {});
      }
    }

    try {
      const cached = (await StorageService.getItem('tangent_lft_personas')) || [];
      const updated = active 
        ? [payload, ...cached.filter(p => p.personaId !== personaId)]
        : cached.filter(p => p.personaId !== personaId);
      await StorageService.setItem('tangent_lft_personas', updated);
    } catch (e) {}

    return payload;
  },

  // 21. LFT: Subscribe to personas seeking a team/mission
  subscribeToLFTPersonas(callback) {
    const deliverCache = async () => {
      try {
        const cached = (await StorageService.getItem('tangent_lft_personas')) || [];
        callback(cached.filter(p => p.active !== false));
      } catch (e) {
        callback([]);
      }
    };

    if (!db) {
      deliverCache();
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'lft_personas'),
        where('active', '==', true)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        StorageService.setItem('tangent_lft_personas', list).catch(() => {});
        callback(list);
      }, (err) => {
        console.warn('[GroupService] Error listening to LFT personas:', err);
        deliverCache();
      });

      return unsub;
    } catch (e) {
      deliverCache();
      return () => {};
    }
  },

  // 22. Architect Docket: Save (Add / Update) Text Block or Image Handout
  async saveArchitectBlock({ channelId, groupId, block, currentUser }) {
    if (!channelId && !groupId) return;
    const targetId = channelId || `group_chan_${groupId}`;

    const blockId = block.id || `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBlock = {
      id: blockId,
      type: block.type || 'text', // 'text' | 'image'
      title: block.title ? block.title.trim() : 'Tactical Briefing',
      tag: block.tag || 'Objective', // 'Objective' | 'Intel' | 'Hazard' | 'Lore' | 'Briefing'
      content: block.content || '',
      imageUrl: block.imageUrl || '',
      caption: block.caption || '',
      createdById: currentUser?.uid || 'architect',
      createdByHandle: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Architect',
      createdAt: block.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update in Firestore channel document
    if (db) {
      try {
        const channelRef = doc(db, 'channels', targetId);
        const snap = await getDoc(channelRef);
        if (snap.exists()) {
          const currentBlocks = Array.isArray(snap.data().architectBlocks) ? snap.data().architectBlocks : [];
          const exists = currentBlocks.some(b => b.id === blockId);
          const updated = exists 
            ? currentBlocks.map(b => b.id === blockId ? newBlock : b)
            : [newBlock, ...currentBlocks];
          await updateDoc(channelRef, {
            architectBlocks: updated,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.warn('[GroupService] Failed to save architect block in DB:', err);
      }
    }

    // Cache locally
    try {
      const cacheKey = `tangent_architect_blocks_${targetId}`;
      const cached = (await StorageService.getItem(cacheKey)) || [];
      const updated = cached.some(b => b.id === blockId)
        ? cached.map(b => b.id === blockId ? newBlock : b)
        : [newBlock, ...cached];
      await StorageService.setItem(cacheKey, updated);
    } catch (e) {}

    return newBlock;
  },

  // 23. Architect Docket: Delete Text Block or Image Handout
  async deleteArchitectBlock({ channelId, groupId, blockId }) {
    if ((!channelId && !groupId) || !blockId) return;
    const targetId = channelId || `group_chan_${groupId}`;

    if (db) {
      try {
        const channelRef = doc(db, 'channels', targetId);
        const snap = await getDoc(channelRef);
        if (snap.exists()) {
          const currentBlocks = Array.isArray(snap.data().architectBlocks) ? snap.data().architectBlocks : [];
          const updated = currentBlocks.filter(b => b.id !== blockId);
          await updateDoc(channelRef, {
            architectBlocks: updated,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.warn('[GroupService] Failed to delete architect block in DB:', err);
      }
    }

    try {
      const cacheKey = `tangent_architect_blocks_${targetId}`;
      const cached = (await StorageService.getItem(cacheKey)) || [];
      const updated = cached.filter(b => b.id !== blockId);
      await StorageService.setItem(cacheKey, updated);
    } catch (e) {}
  },

  // 24. Architect Docket: Subscribe to Blocks for Current Channel / Group
  subscribeToArchitectBlocks({ channelId, groupId }, callback) {
    const targetId = channelId || (groupId ? `group_chan_${groupId}` : null);
    if (!targetId) {
      callback([]);
      return () => {};
    }

    const deliverCache = async () => {
      try {
        const cacheKey = `tangent_architect_blocks_${targetId}`;
        const cached = (await StorageService.getItem(cacheKey)) || [];
        callback(cached);
      } catch (e) {
        callback([]);
      }
    };

    if (!db) {
      deliverCache();
      return () => {};
    }

    try {
      const channelRef = doc(db, 'channels', targetId);
      const unsub = onSnapshot(channelRef, (snap) => {
        if (snap.exists()) {
          const blocks = Array.isArray(snap.data().architectBlocks) ? snap.data().architectBlocks : [];
          StorageService.setItem(`tangent_architect_blocks_${targetId}`, blocks).catch(() => {});
          callback(blocks);
        } else {
          deliverCache();
        }
      }, (err) => {
        console.warn('[GroupService] Error listening to architect blocks:', err);
        deliverCache();
      });

      return unsub;
    } catch (e) {
      deliverCache();
      return () => {};
    }
  }
};

export const GroupService = SquadService;
export default SquadService;
