import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useFolio } from './FolioContext';
import { GroupService } from '../services/groupService';
import { AudioService } from '../services/audioService';

const GroupContext = createContext();

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { activePersona, personaRoster, roster } = useFolio();

  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [outgoingInvites, setOutgoingInvites] = useState([]);
  const [reviewingInvite, setReviewingInvite] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Subscribe to user groups
  useEffect(() => {
    setLoadingGroups(true);
    const unsubscribe = GroupService.subscribeToUserGroups(currentUser, (userGroups) => {
      setGroups(userGroups);
      setLoadingGroups(false);

      // Default active group to the first group if not set
      if (userGroups.length > 0 && !activeGroupId) {
        setActiveGroupId(userGroups[0].id);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Subscribe to incoming pending invites for current user
  useEffect(() => {
    if (!currentUser) {
      setPendingInvites([]);
      return;
    }

    const unsubscribe = GroupService.subscribeToIncomingInvites(currentUser, (invites) => {
      if (invites.length > pendingInvites.length && invites.length > 0) {
        AudioService.playTerminalBeep(1400, 0.05);
      }
      setPendingInvites(invites);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === activeGroupId) || (groups.length > 0 ? groups[0] : null);
  }, [groups, activeGroupId]);

  // Subscribe to outgoing pending invites if current user is GM / creator of active group
  useEffect(() => {
    if (!activeGroup || !currentUser || activeGroup.creatorId !== currentUser.uid) {
      setOutgoingInvites([]);
      return;
    }

    const unsubscribe = GroupService.subscribeToGroupOutgoingInvites(activeGroup.id, (invites) => {
      setOutgoingInvites(invites);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeGroup?.id, currentUser]);

  const selectGroup = useCallback((groupId) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveGroupId(groupId);
  }, []);

  // Modal inspection triggers for invite confirmation
  const openInviteConfirmation = useCallback((invite) => {
    AudioService.playTerminalBeep(1200, 0.03);
    setReviewingInvite(invite);
  }, []);

  const closeInviteConfirmation = useCallback(() => {
    setReviewingInvite(null);
  }, []);

  // Create a new Game Group
  const createGroup = useCallback(async ({
    name,
    description,
    gameSystem,
    campaignId,
    campaignTitle,
    maxMembers,
    isPublic,
    persona
  }) => {
    if (!currentUser) throw new Error('You must be logged in to create a game group.');
    
    const chosenPersona = persona || activePersona || (personaRoster?.[0] || roster?.[0]);
    
    AudioService.playTerminalBeep(1450, 0.04);
    const newGroup = await GroupService.createGroup({
      name,
      description,
      gameSystem,
      campaignId,
      campaignTitle,
      maxMembers,
      isPublic,
      currentUser,
      persona: chosenPersona
    });

    setActiveGroupId(newGroup.id);
    return newGroup;
  }, [currentUser, activePersona, personaRoster, roster]);

  // Send Direct Invite to an Operative
  const sendInvite = useCallback(async ({ groupId, targetUserId, targetUserHandle }) => {
    const targetGroup = groups.find(g => g.id === groupId) || activeGroup;
    if (!targetGroup) throw new Error('Game group not found');

    AudioService.playTerminalBeep(1300, 0.03);
    return await GroupService.sendGroupInvite({
      groupId: targetGroup.id,
      groupName: targetGroup.name,
      channelId: targetGroup.channelId,
      targetUserId,
      targetUserHandle,
      currentUser
    });
  }, [groups, activeGroup, currentUser]);

  // Revoke an outgoing invite (GM action)
  const revokeInvite = useCallback(async ({ inviteId }) => {
    if (!inviteId) return;
    AudioService.playTerminalBeep(950, 0.03);
    await GroupService.revokeInvite({ inviteId });
    setOutgoingInvites(prev => prev.filter(i => i.id !== inviteId));
  }, []);

  // Discharge / Kick a member from active group (GM action)
  const kickMember = useCallback(async ({ groupId, userId }) => {
    if (!groupId || !userId) return;
    AudioService.playTerminalBeep(900, 0.04);
    await GroupService.kickMember({ groupId, userId });
  }, []);

  // Update member role (GM action)
  const updateMemberRole = useCallback(async ({ groupId, userId, role }) => {
    if (!groupId || !userId || !role) return;
    AudioService.playTerminalBeep(1200, 0.02);
    await GroupService.updateMemberRole({ groupId, userId, role });
  }, []);

  // Accept Invite with explicit selected persona
  const acceptInvite = useCallback(async (inviteId, groupId, persona) => {
    const chosenPersona = persona || activePersona || (personaRoster?.[0] || roster?.[0]);
    AudioService.playTerminalBeep(1500, 0.05);
    await GroupService.respondToInvite({
      inviteId,
      groupId,
      accept: true,
      currentUser,
      persona: chosenPersona
    });
    setReviewingInvite(null);
    if (groupId) {
      setActiveGroupId(groupId);
    }
  }, [currentUser, activePersona, personaRoster, roster]);

  // Decline Invite
  const declineInvite = useCallback(async (inviteId) => {
    AudioService.playTerminalBeep(900, 0.03);
    await GroupService.respondToInvite({
      inviteId,
      groupId: null,
      accept: false,
      currentUser
    });
    setReviewingInvite(null);
  }, [currentUser]);

  // Join Group via Code
  const joinByCode = useCallback(async (inviteCode, persona) => {
    const chosenPersona = persona || activePersona || (personaRoster?.[0] || roster?.[0]);
    AudioService.playTerminalBeep(1400, 0.04);
    const joined = await GroupService.joinGroupByCode({
      inviteCode,
      currentUser,
      persona: chosenPersona
    });
    if (joined?.id) {
      setActiveGroupId(joined.id);
    }
    return joined;
  }, [currentUser, activePersona, personaRoster, roster]);

  // Update persona for current user in active group
  const updateMemberPersona = useCallback(async (groupId, persona) => {
    if (!currentUser || !groupId) return;
    await GroupService.updateMemberPersona({
      groupId,
      userId: currentUser.uid,
      persona
    });
  }, [currentUser]);

  // Update Group details
  const updateGroup = useCallback(async (groupId, updates) => {
    await GroupService.updateGroup(groupId, updates);
  }, []);

  // Leave Group
  const leaveGroup = useCallback(async (groupId) => {
    if (!currentUser || !groupId) return;
    AudioService.playTerminalBeep(1000, 0.03);
    await GroupService.leaveGroup({
      groupId,
      userId: currentUser.uid
    });
    if (activeGroupId === groupId) {
      const remaining = groups.filter(g => g.id !== groupId);
      setActiveGroupId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [currentUser, activeGroupId, groups]);

  // Delete Group (Creator only)
  const deleteGroup = useCallback(async (groupId) => {
    if (!groupId) return;
    AudioService.playTerminalBeep(900, 0.04);
    await GroupService.deleteGroup({ groupId });
    if (activeGroupId === groupId) {
      const remaining = groups.filter(g => g.id !== groupId);
      setActiveGroupId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeGroupId, groups]);

  const value = {
    groups,
    activeGroup,
    activeGroupId,
    selectGroup,
    pendingInvites,
    outgoingInvites,
    reviewingInvite,
    openInviteConfirmation,
    closeInviteConfirmation,
    loadingGroups,
    createGroup,
    sendInvite,
    revokeInvite,
    kickMember,
    updateMemberRole,
    acceptInvite,
    declineInvite,
    joinByCode,
    updateMemberPersona,
    updateGroup,
    leaveGroup,
    deleteGroup
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};

export default GroupContext;
