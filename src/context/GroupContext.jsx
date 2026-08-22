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

  // Subscribe to incoming pending invites
  useEffect(() => {
    if (!currentUser) {
      setPendingInvites([]);
      return;
    }

    const unsubscribe = GroupService.subscribeToIncomingInvites(currentUser, (invites) => {
      // Play chirp if new invite arrives
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

  const selectGroup = useCallback((groupId) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveGroupId(groupId);
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
    
    // Default to active persona if none explicitly passed
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

  // Accept Invite
  const acceptInvite = useCallback(async (inviteId, groupId, persona) => {
    const chosenPersona = persona || activePersona || (personaRoster?.[0] || roster?.[0]);
    AudioService.playTerminalBeep(1500, 0.04);
    await GroupService.respondToInvite({
      inviteId,
      groupId,
      accept: true,
      currentUser,
      persona: chosenPersona
    });
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
    loadingGroups,
    createGroup,
    sendInvite,
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
