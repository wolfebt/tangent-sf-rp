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
import { getEffectiveUserHandle } from '../utils/personaValidationUtils';

// Helper to generate a random 6-character alphanumeric squad invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'SQD-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Extract canonical enrolled character members from a group's memberDetails
const buildCharacterMembersFromGroup = (groupData) => {
  if (!groupData || !groupData.memberDetails) return [];
  const list = [];
  const seen = new Set();

  Object.entries(groupData.memberDetails).forEach(([uid, detail]) => {
    if (!detail || !detail.persona) return;
    const p = detail.persona;
    const pId = p.id || p['character-doc-id'] || p.docId || p.name;
    if (!pId || seen.has(`${uid}_${pId}`)) return;
    seen.add(`${uid}_${pId}`);

    list.push({
      id: pId,
      'character-doc-id': pId,
      name: p.name || p['char-name'] || 'Persona',
      species: p.species || p['char-species'] || 'Human',
      role: p.role || p['char-concept'] || p['char-occu'] || 'Specialist',
      avatar: p.avatar || null,
      health: p.health || 30,
      currentHealth: p.currentHealth ?? p.current_health ?? 30,
      vitality: p.vitality || 30,
      currentVitality: p.currentVitality ?? p.current_vitality ?? 30,
      locked: Boolean(p.locked || detail.isLockedForPlay),
      ownerUid: uid,
      ownerHandle: detail.handle || detail.userHandle || 'Operator',
      squadRole: detail.role || (groupData.creatorId === uid ? 'Architect' : 'Operator')
    });
  });

  return list;
};

// Sort Tactical Docket blocks: pinned items first, then newest first
const sortArchitectBlocks = (blocks = []) => {
  if (!Array.isArray(blocks)) return [];
  return [...blocks].sort((a, b) => {
    if (Boolean(a?.isPinned) !== Boolean(b?.isPinned)) {
      return a?.isPinned ? -1 : 1;
    }
    const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
};

export const SquadService = {
  // Synchronize squad members & enrolled character personas onto the linked group channel
  async syncChannelRoster(groupId, groupDataOverride = null) {
    if (!groupId || !db) return;
    try {
      let groupData = groupDataOverride;
      if (!groupData) {
        const groupRef = doc(db, 'game_groups', groupId);
        const snap = await getDoc(groupRef);
        if (snap.exists()) {
          groupData = { id: snap.id, ...snap.data() };
        }
      }
      if (!groupData) return;

      const channelId = groupData.channelId || `group_chan_${groupId}`;
      const channelRef = doc(db, 'channels', channelId);
      const memberUids = Array.from(new Set([
        ...(Array.isArray(groupData.members) ? groupData.members : []),
        groupData.creatorId,
        ...(groupData.memberDetails ? Object.keys(groupData.memberDetails) : [])
      ].filter(Boolean)));
      const characterMembers = buildCharacterMembersFromGroup(groupData);

      await updateDoc(channelRef, {
        members: memberUids,
        characterMembers,
        updatedAt: serverTimestamp()
      }).catch(() => {});
    } catch (err) {
      console.warn('[SquadService] syncChannelRoster warning:', err);
    }
  },

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
    if (!name || !name.trim()) throw new Error('Team name is required');
    if (!currentUser) throw new Error('You must be logged in to create a team');

    const groupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const inviteCode = generateInviteCode();
    const cleanName = name.trim();
    const userHandle = getEffectiveUserHandle(currentUser);

    // Channel ID for tied-in group comms
    const channelId = `group_chan_${groupId}`;

    // Persona representation for the creator
    const creatorMember = {
      userId: currentUser.uid,
      handle: userHandle,
      role: 'Architect', // Creator is the Lead Architect
      joinedAt: new Date().toISOString(),
      persona: persona ? {
        id: persona['character-doc-id'] || persona.id,
        name: persona['char-name'] || persona.name || 'Unnamed Persona',
        species: persona['char-species'] || persona.species || 'Human',
        role: persona['char-concept'] || persona['char-occu'] || persona.occupation || 'Specialist',
        avatar: persona.avatar || null,
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
          addressingMode: 'persona',
          groupId: groupId,
          groupName: cleanName,
          isPublic: false,
          createdById: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          members: [currentUser.uid],
          characterMembers: buildCharacterMembersFromGroup(groupData),
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

    const cleanName = group.name || 'Operator Team';
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
      const characterMembers = buildCharacterMembersFromGroup(group);

      if (!snap.exists()) {
        const channelData = {
          id: channelId,
          name: `team-${cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`,
          displayName: `🛡️ ${cleanName}`,
          topic: `Default Active Team frequency for: ${cleanName}`,
          type: 'group',
          addressingMode: 'persona',
          groupId: group.id,
          groupName: cleanName,
          isPublic: false,
          createdById: group.creatorId || currentUser?.uid || 'system',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          members: memberUids,
          characterMembers,
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
        const existingChars = Array.isArray(existingData.characterMembers) ? existingData.characterMembers : [];
        if (missing.length > 0 || (characterMembers.length > 0 && existingChars.length !== characterMembers.length)) {
          await updateDoc(channelRef, {
            members: Array.from(new Set([...existingMembers, ...missing])),
            characterMembers,
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
      // Ensure all teams where the current user is an enrolled member have a default active frequency provisioned
      combined.forEach(g => {
        const isEnrolledMember = Array.isArray(g.members) && g.members.includes(currentUser.uid);
        if (!g.channelId && isEnrolledMember) {
          SquadService.ensureTeamFrequency(g, currentUser);
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
    if (!groupId || !targetUserId) throw new Error('Missing team or target user ID');
    if (!currentUser) throw new Error('Must be logged in to send invite');

    const inviterHandle = getEffectiveUserHandle(currentUser);

    // Check if an active pending invite already exists for this group + targetUser
    let inviteId = `invite_${groupId}_${targetUserId}_${Date.now()}`;
    if (db) {
      try {
        const existingQ = query(
          collection(db, 'group_invites'),
          where('groupId', '==', groupId),
          where('toUserId', '==', targetUserId),
          where('status', '==', 'pending')
        );
        const existingSnap = await getDocs(existingQ);
        if (!existingSnap.empty) {
          inviteId = existingSnap.docs[0].id;
        }
      } catch (e) {
        // Proceed with new invite ID
      }
    }

    // Retrieve group snapshot to embed rich metadata in the invite
    let groupMeta = {
      name: groupName || 'Game Team',
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
            name: gData.name || groupName || 'Game Team',
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

        // Ensure parent DM channel document exists and deliver interactive squad_invite message card
        try {
          const dmChan = await ChatService.getOrCreateDirectMessageChannel(
            currentUser,
            {
              uid: targetUserId,
              userHandle: targetUserHandle || 'Operator'
            },
            { addressingMode: 'operator' }
          );

          const notifChannelId = dmChan?.id || `dm_player_${[currentUser.uid, targetUserId].sort().join('_')}`;
          const notifRef = collection(db, 'channels', notifChannelId, 'messages');
          await addDoc(notifRef, {
            text: `[TEAM INVITATION] You have been invited to join team "${groupMeta.name}" by @${inviterHandle}.`,
            type: 'squad_invite',
            inviteId: inviteId,
            groupId: groupId,
            groupName: groupMeta.name,
            groupMetadata: groupMeta,
            inviteStatus: 'pending',
            senderId: currentUser.uid,
            senderUid: currentUser.uid,
            senderHandle: inviterHandle,
            senderMode: 'OOC',
            createdAt: serverTimestamp(),
            createdLocalAt: new Date().toISOString()
          });

          const dmDocRef = doc(db, 'channels', notifChannelId);
          await updateDoc(dmDocRef, {
            updatedAt: serverTimestamp(),
            lastMessage: {
              text: `🛡️ Team Invitation: ${groupMeta.name}`,
              senderHandle: inviterHandle,
              senderId: currentUser.uid,
              senderUid: currentUser.uid,
              timestamp: new Date().toISOString()
            }
          }).catch(() => {});
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

  // 5. Respond to Invite (Accept or Decline) or Direct LFP Join
  async respondToInvite({
    inviteId,
    groupId,
    accept,
    currentUser,
    persona = null,
    isLockedForPlay = false
  }) {
    if (!inviteId || !currentUser) throw new Error('Invalid invite response payload');
    const isDirectJoin = String(inviteId).startsWith('direct_join_');

    if (db) {
      if (!isDirectJoin) {
        try {
          const inviteRef = doc(db, 'group_invites', inviteId);
          await updateDoc(inviteRef, {
            status: accept ? 'accepted' : 'declined',
            respondedAt: new Date().toISOString()
          });
        } catch (err) {
          console.warn('[SquadService] Invite doc update skipped or failed:', err);
        }
      }

      if (accept && groupId) {
        const userHandle = getEffectiveUserHandle(currentUser);
        const memberData = {
          userId: currentUser.uid,
          handle: userHandle,
          role: 'Operator', // All other members are Operators by default
          isLockedForPlay: Boolean(isLockedForPlay),
          joinedAt: new Date().toISOString(),
          persona: persona ? {
            id: persona['character-doc-id'] || persona.id,
            name: persona['char-name'] || persona.name || 'Persona',
            species: persona['char-species'] || persona.species || 'Human',
            role: persona['char-concept'] || persona['char-occu'] || persona.occupation || 'Specialist',
            avatar: persona.avatar || null,
            health: persona.health || 30,
            currentHealth: persona.current_health ?? (persona.current_hp ?? 30),
            vitality: persona.vitality || 30,
            currentVitality: persona.current_vitality ?? 30,
            locked: Boolean(isLockedForPlay)
          } : null
        };

        // Add member to group
        const groupRef = doc(db, 'game_groups', groupId);
        await updateDoc(groupRef, {
          members: arrayUnion(currentUser.uid),
          [`memberDetails.${currentUser.uid}`]: memberData,
          updatedAt: new Date().toISOString()
        });

        // Sync tied-in channel members & characterMembers
        await this.syncChannelRoster(groupId);
      }
    }

    // Update local invite cache
    if (!isDirectJoin) {
      try {
        const cachedInvites = (await StorageService.getItem('tangent_group_invites')) || [];
        const updatedInvites = cachedInvites.map(i =>
          i.id === inviteId ? { ...i, status: accept ? 'accepted' : 'declined' } : i
        );
        await StorageService.setItem('tangent_group_invites', updatedInvites);
      } catch (e) {}
    }
  },

  // 6. Join a group directly using an Invite Code (e.g. SQD-ABC123)
  async joinGroupByCode({
    inviteCode,
    currentUser,
    persona = null,
    isLockedForPlay = false
  }) {
    if (!inviteCode || !inviteCode.trim()) throw new Error('Invite code is required');
    if (!currentUser) throw new Error('Must be logged in to join a team');

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
      throw new Error(`No active team found for invite code "${cleanCode}".`);
    }

    if (groupData.members && groupData.members.includes(currentUser.uid)) {
      return groupData; // Already a member
    }

    if (groupData.members && groupData.maxMembers && groupData.members.length >= groupData.maxMembers) {
      throw new Error(`Team is at maximum capacity (${groupData.maxMembers} operators).`);
    }

    const userHandle = getEffectiveUserHandle(currentUser);
    const memberData = {
      userId: currentUser.uid,
      handle: userHandle,
      role: 'Operator', // All other members are Operators by default
      isLockedForPlay: Boolean(isLockedForPlay),
      joinedAt: new Date().toISOString(),
      persona: persona ? {
        id: persona['character-doc-id'] || persona.id,
        name: persona['char-name'] || persona.name || 'Persona',
        species: persona['char-species'] || persona.species || 'Human',
        role: persona['char-concept'] || persona['char-occu'] || persona.occupation || 'Specialist',
        avatar: persona.avatar || null,
        health: persona.health || 30,
        currentHealth: persona.current_health ?? (persona.current_hp ?? 30),
        vitality: persona.vitality || 30,
        currentVitality: persona.current_vitality ?? 30,
        locked: Boolean(isLockedForPlay)
      } : null
    };

    const updatedGroup = {
      ...groupData,
      members: [...(groupData.members || []), currentUser.uid],
      memberDetails: {
        ...(groupData.memberDetails || {}),
        [currentUser.uid]: memberData
      }
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

        // Grant access to tied-in channel & sync characterMembers
        await this.syncChannelRoster(groupDocId, updatedGroup);
      } catch (err) {
        console.warn('[GroupService] Firestore join update fallback to local cache:', err);
      }
    }

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
      avatar: persona.avatar || null,
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
      await this.syncChannelRoster(groupId);
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
              channelUpdates.topic = updates.description.trim() || `Tied-in Team frequency for: ${updates.name || data.name}`;
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

          await this.syncChannelRoster(groupId, {
            ...data,
            id: groupId,
            members: updatedMembers,
            memberDetails: updatedDetails
          });
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

  // 12. Update a member's operational role (Architect, Co-Architect, Operator)
  async updateMemberRole({ groupId, userId, role, currentUser }) {
    if (!groupId || !userId || !role) return;

    // Normalize legacy roles
    const normalizedRole = (role === 'GM' || role === 'Leader' || role === 'Lead Architect')
      ? 'Architect'
      : (role === 'Co-GM')
      ? 'Co-Architect'
      : (role === 'Player' || role === 'Spectator' || role === 'Observer')
      ? 'Operator'
      : role;

    // If handing off the primary Lead Architect role
    if (normalizedRole === 'Architect' && currentUser) {
      return this.transferArchitectRole({ groupId, newArchitectUserId: userId, currentUser });
    }

    if (normalizedRole === 'Co-Architect') {
      return this.setCoArchitect({ groupId, targetUserId: userId, isCoArchitect: true });
    }

    if (normalizedRole === 'Operator') {
      await this.setCoArchitect({ groupId, targetUserId: userId, isCoArchitect: false });
    }

    if (db) {
      try {
        const groupRef = doc(db, 'game_groups', groupId);
        await updateDoc(groupRef, {
          [`memberDetails.${userId}.role`]: normalizedRole,
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
              [userId]: { ...g.memberDetails[userId], role: normalizedRole }
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

        await this.syncChannelRoster(groupId, {
          ...data,
          id: groupId,
          members: updatedMembers,
          memberDetails: updatedDetails
        });
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
      if (!groupSnap.exists()) throw new Error('Team not found');
      const data = groupSnap.data();

      // Ensure caller is the current Architect / creator
      if (data.creatorId !== currentUser.uid) {
        throw new Error('Only the Lead Architect can transfer team leadership');
      }

      const targetDetail = data.memberDetails?.[newArchitectUserId];
      if (!targetDetail) throw new Error('Target operator is not enrolled in this team');
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
  async flagSquadLFP({ groupId, neededRoles = [], pitch = '', openSlots = 2, active = true, status: customStatus = null }) {
    if (!groupId) return;
    const lfpPayload = {
      active: Boolean(active),
      neededRoles: Array.isArray(neededRoles) ? neededRoles : [],
      pitch: pitch ? pitch.trim() : '',
      openSlots: Number(openSlots) || 2,
      updatedAt: new Date().toISOString()
    };
    const resolvedStatus = customStatus || (active ? 'Recruiting' : 'Active');

    if (db) {
      const groupRef = doc(db, 'game_groups', groupId);
      await updateDoc(groupRef, {
        lfp: lfpPayload,
        status: resolvedStatus,
        updatedAt: new Date().toISOString()
      }).catch(err => console.warn('[GroupService] Failed to flag squad LFP:', err));
    }

    try {
      const cached = (await StorageService.getItem('tangent_game_groups')) || [];
      const updated = cached.map(g => {
        if (g.id === groupId) {
          return { ...g, lfp: lfpPayload, status: resolvedStatus };
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
      try {
        const lftRef = doc(db, 'lft_personas', lftId);
        if (active) {
          await setDoc(lftRef, payload);
        } else {
          await deleteDoc(lftRef).catch(() => {});
        }
      } catch (err) {
        console.warn('[SquadService] Failed to persist LFT persona to Firestore (falling back to local cache):', err);
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

  // 22. Architect Docket: Save (Add / Update) Text Block, Checklist, or Image Handout
  async saveArchitectBlock({ channelId, groupId, block, currentUser }) {
    if (!channelId && !groupId) return;
    const targetId = channelId || `group_chan_${groupId}`;

    const blockId = block.id || `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBlock = {
      id: blockId,
      type: block.type || 'text', // 'text' | 'image' | 'checklist'
      title: block.title ? block.title.trim() : 'Tactical Briefing',
      tag: block.tag || 'Objective', // 'Objective' | 'Intel' | 'Hazard' | 'Lore' | 'Briefing' | 'Recon'
      content: block.content || '',
      imageUrl: block.imageUrl || '',
      caption: block.caption || '',
      status: block.status || 'active', // 'active' | 'completed' | 'failed'
      isPinned: Boolean(block.isPinned),
      checklist: Array.isArray(block.checklist) ? block.checklist : [],
      visibility: block.visibility || 'all', // 'all' | 'classified'
      visibleToPersonaIds: Array.isArray(block.visibleToPersonaIds) ? block.visibleToPersonaIds : [],
      visibleToUserIds: Array.isArray(block.visibleToUserIds) ? block.visibleToUserIds : [],
      acknowledgedBy: Array.isArray(block.acknowledgedBy) ? block.acknowledgedBy : [],
      createdById: block.createdById || currentUser?.uid || 'architect',
      createdByHandle: block.createdByHandle || getEffectiveUserHandle(currentUser),
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
          const existing = currentBlocks.find(b => b.id === blockId);
          if (existing && (!block.acknowledgedBy || block.acknowledgedBy.length === 0) && Array.isArray(existing.acknowledgedBy)) {
            newBlock.acknowledgedBy = existing.acknowledgedBy;
          }
          const updated = sortArchitectBlocks(
            existing
              ? currentBlocks.map(b => b.id === blockId ? newBlock : b)
              : [newBlock, ...currentBlocks]
          );
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
      const existing = cached.find(b => b.id === blockId);
      if (existing && (!block.acknowledgedBy || block.acknowledgedBy.length === 0) && Array.isArray(existing.acknowledgedBy)) {
        newBlock.acknowledgedBy = existing.acknowledgedBy;
      }
      const updated = sortArchitectBlocks(
        existing
          ? cached.map(b => b.id === blockId ? newBlock : b)
          : [newBlock, ...cached]
      );
      await StorageService.setItem(cacheKey, updated);
    } catch (e) {}

    return newBlock;
  },

  // 22b. Architect Docket: Toggle Operative / Character Acknowledgment (ACK) on a Block
  async toggleArchitectBlockAck({ channelId, groupId, blockId, currentUser, persona = null }) {
    if ((!channelId && !groupId) || !blockId || !currentUser?.uid) return;
    const targetId = channelId || `group_chan_${groupId}`;
    const uid = currentUser.uid;
    const handle = getEffectiveUserHandle(currentUser);
    const personaId = persona?.['character-doc-id'] || persona?.id || null;
    const personaName = persona?.['char-name'] || persona?.name || null;

    const applyAckToggle = (blocks = []) => {
      return blocks.map(b => {
        if (b.id !== blockId) return b;
        const currentAcks = Array.isArray(b.acknowledgedBy) ? b.acknowledgedBy : [];
        const hasAcked = currentAcks.some(a => a.uid === uid);
        const nextAcks = hasAcked
          ? currentAcks.filter(a => a.uid !== uid)
          : [
              ...currentAcks,
              {
                uid,
                handle,
                personaId,
                personaName,
                at: new Date().toISOString()
              }
            ];
        return {
          ...b,
          acknowledgedBy: nextAcks,
          updatedAt: new Date().toISOString()
        };
      });
    };

    if (db) {
      try {
        const channelRef = doc(db, 'channels', targetId);
        const snap = await getDoc(channelRef);
        if (snap.exists()) {
          const currentBlocks = Array.isArray(snap.data().architectBlocks) ? snap.data().architectBlocks : [];
          const updated = applyAckToggle(currentBlocks);
          await updateDoc(channelRef, {
            architectBlocks: updated,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.warn('[SquadService] Failed to toggle docket ACK:', err);
      }
    }

    try {
      const cacheKey = `tangent_architect_blocks_${targetId}`;
      const cached = (await StorageService.getItem(cacheKey)) || [];
      await StorageService.setItem(cacheKey, applyAckToggle(cached));
    } catch (e) {}
  },

  // 22c. Architect Docket: Toggle a Checklist Sub-Task Item or Block Status / Pin
  async toggleArchitectChecklistItem({ channelId, groupId, blockId, itemId }) {
    if ((!channelId && !groupId) || !blockId || !itemId) return;
    const targetId = channelId || `group_chan_${groupId}`;

    const applyChecklistToggle = (blocks = []) => {
      return blocks.map(b => {
        if (b.id !== blockId) return b;
        const checklist = (Array.isArray(b.checklist) ? b.checklist : []).map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return {
          ...b,
          checklist,
          updatedAt: new Date().toISOString()
        };
      });
    };

    if (db) {
      try {
        const channelRef = doc(db, 'channels', targetId);
        const snap = await getDoc(channelRef);
        if (snap.exists()) {
          const currentBlocks = Array.isArray(snap.data().architectBlocks) ? snap.data().architectBlocks : [];
          const updated = applyChecklistToggle(currentBlocks);
          await updateDoc(channelRef, {
            architectBlocks: updated,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.warn('[SquadService] Failed to toggle docket checklist item:', err);
      }
    }

    try {
      const cacheKey = `tangent_architect_blocks_${targetId}`;
      const cached = (await StorageService.getItem(cacheKey)) || [];
      await StorageService.setItem(cacheKey, applyChecklistToggle(cached));
    } catch (e) {}
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
        callback(sortArchitectBlocks(cached));
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
          const rawBlocks = Array.isArray(snap.data().architectBlocks) ? snap.data().architectBlocks : [];
          const blocks = sortArchitectBlocks(rawBlocks);
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
