import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useFolio } from './FolioContext';
import { SquadService } from '../services/squadService';
import { AudioService } from '../services/audioService';

export const SquadContext = globalThis.__TANGENT_SQUAD_CONTEXT__ || (globalThis.__TANGENT_SQUAD_CONTEXT__ = createContext({}));

export const useSquad = () => {
  const context = useContext(SquadContext);
  return context || {};
};

export const useGroup = useSquad;

export const SquadProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const folio = useFolio() || {};
  const { activePersona, personaRoster, roster } = folio;

  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [outgoingInvites, setOutgoingInvites] = useState([]);
  const [reviewingInvite, setReviewingInvite] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Subscribe to user groups
  useEffect(() => {
    setLoadingGroups(true);
    const unsubscribe = SquadService.subscribeToUserGroups(currentUser, (userGroups) => {
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

    const unsubscribe = SquadService.subscribeToIncomingInvites(currentUser, (invites) => {
      setPendingInvites(prev => {
        if (invites.length > prev.length && invites.length > 0) {
          AudioService.playTerminalBeep(1400, 0.05);
        }
        return invites;
      });
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

    const unsubscribe = SquadService.subscribeToGroupOutgoingInvites(activeGroup.id, (invites) => {
      setOutgoingInvites(invites);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeGroup?.id, currentUser]);

  const selectGroup = useCallback((groupId) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveGroupId(groupId);
    const targetGroup = groups.find(g => g.id === groupId);
    if (targetGroup) {
      SquadService.ensureTeamFrequency(targetGroup, currentUser);
    }
  }, [groups, currentUser]);

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
    if (!currentUser) throw new Error('You must be logged in to create a team.');
    
    const chosenPersona = persona || activePersona || (personaRoster?.[0] || roster?.[0]);
    
    AudioService.playTerminalBeep(1450, 0.04);
    const newGroup = await SquadService.createGroup({
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

  // Send Direct Invite to an Operator (supports both object payload and positional (groupId, targetUser) args)
  const sendInvite = useCallback(async (groupIdOrParams, maybeTargetUser) => {
    let resolvedGroupId = null;
    let resolvedTargetUserId = null;
    let resolvedTargetUserHandle = 'Operator';

    if (typeof groupIdOrParams === 'object' && groupIdOrParams !== null) {
      resolvedGroupId = groupIdOrParams.groupId;
      resolvedTargetUserId = groupIdOrParams.targetUserId || groupIdOrParams.targetUser?.uid || groupIdOrParams.uid;
      resolvedTargetUserHandle = groupIdOrParams.targetUserHandle || groupIdOrParams.targetUser?.userHandle || groupIdOrParams.targetUser?.displayName || 'Operator';
    } else {
      resolvedGroupId = groupIdOrParams;
      if (typeof maybeTargetUser === 'object' && maybeTargetUser !== null) {
        resolvedTargetUserId = maybeTargetUser.uid || maybeTargetUser.userId || maybeTargetUser.id;
        resolvedTargetUserHandle = maybeTargetUser.userHandle || maybeTargetUser.handle || maybeTargetUser.displayName || 'Operator';
      } else if (typeof maybeTargetUser === 'string') {
        resolvedTargetUserId = maybeTargetUser;
      }
    }

    const targetGroup = groups.find(g => g.id === resolvedGroupId) || activeGroup;
    if (!targetGroup) throw new Error('Team not found');

    AudioService.playTerminalBeep(1300, 0.03);
    return await SquadService.sendGroupInvite({
      groupId: targetGroup.id,
      groupName: targetGroup.name,
      channelId: targetGroup.channelId,
      targetUserId: resolvedTargetUserId,
      targetUserHandle: resolvedTargetUserHandle,
      currentUser
    });
  }, [groups, activeGroup, currentUser]);

  // Revoke an outgoing invite (GM action — supports both { inviteId } and string inviteId)
  const revokeInvite = useCallback(async (inviteIdOrParams) => {
    const inviteId = (typeof inviteIdOrParams === 'object' && inviteIdOrParams !== null)
      ? inviteIdOrParams.inviteId
      : inviteIdOrParams;
    if (!inviteId) return;
    AudioService.playTerminalBeep(950, 0.03);
    await SquadService.revokeInvite({ inviteId });
    setOutgoingInvites(prev => prev.filter(i => i.id !== inviteId));
  }, []);

  // Discharge / Kick a member from active group (GM action — supports both { groupId, userId } and positional args)
  const kickMember = useCallback(async (groupIdOrParams, maybeUserId) => {
    const groupId = (typeof groupIdOrParams === 'object' && groupIdOrParams !== null)
      ? groupIdOrParams.groupId
      : groupIdOrParams;
    const userId = (typeof groupIdOrParams === 'object' && groupIdOrParams !== null)
      ? groupIdOrParams.userId
      : maybeUserId;
    if (!groupId || !userId) return;
    AudioService.playTerminalBeep(900, 0.04);
    await SquadService.kickMember({ groupId, userId });
  }, []);

  // Update member role (Architect action)
  const updateMemberRole = useCallback(async (groupIdOrParams, maybeUserId, maybeRole) => {
    const payload = (typeof groupIdOrParams === 'object' && groupIdOrParams !== null)
      ? groupIdOrParams
      : { groupId: groupIdOrParams, userId: maybeUserId, role: maybeRole };
    if (!payload.groupId || !payload.userId || !payload.role) return;
    AudioService.playTerminalBeep(1200, 0.02);
    await SquadService.updateMemberRole({ ...payload, currentUser });
  }, [currentUser]);

  // Accept Invite with explicit selected persona (respects explicit null for Reserve/Spectator)
  const acceptInvite = useCallback(async (inviteId, groupId, persona, isLockedForPlay = false) => {
    const chosenPersona = persona !== undefined
      ? persona
      : (activePersona || (personaRoster?.[0] || roster?.[0]));
    AudioService.playTerminalBeep(1500, 0.05);
    await SquadService.respondToInvite({
      inviteId,
      groupId,
      accept: true,
      currentUser,
      persona: chosenPersona,
      isLockedForPlay
    });
    setReviewingInvite(null);
    if (groupId) {
      setActiveGroupId(groupId);
    }
  }, [currentUser, activePersona, personaRoster, roster]);

  // Decline Invite
  const declineInvite = useCallback(async (inviteId) => {
    AudioService.playTerminalBeep(900, 0.03);
    await SquadService.respondToInvite({
      inviteId,
      groupId: null,
      accept: false,
      currentUser
    });
    setReviewingInvite(null);
  }, [currentUser]);

  // Join Group via Code
  const joinByCode = useCallback(async (inviteCode, persona, isLockedForPlay = false) => {
    const chosenPersona = persona || activePersona || (personaRoster?.[0] || roster?.[0]);
    AudioService.playTerminalBeep(1400, 0.04);
    const joined = await SquadService.joinGroupByCode({
      inviteCode,
      currentUser,
      persona: chosenPersona,
      isLockedForPlay
    });
    if (joined?.id) {
      setActiveGroupId(joined.id);
    }
    return joined;
  }, [currentUser, activePersona, personaRoster, roster]);

  // Update persona for current user in active group
  const updateMemberPersona = useCallback(async (groupId, persona) => {
    if (!currentUser || !groupId) return;
    await SquadService.updateMemberPersona({
      groupId,
      userId: currentUser.uid,
      persona
    });
  }, [currentUser]);

  // Update Group details
  const updateGroup = useCallback(async (groupId, updates) => {
    await SquadService.updateGroup(groupId, updates);
  }, []);

  // Leave Group
  const leaveGroup = useCallback(async (groupId) => {
    if (!currentUser || !groupId) return;
    AudioService.playTerminalBeep(1000, 0.03);
    await SquadService.leaveGroup({
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
    await SquadService.deleteGroup({ groupId });
    if (activeGroupId === groupId) {
      const remaining = groups.filter(g => g.id !== groupId);
      setActiveGroupId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeGroupId, groups]);

  // Transfer Primary Lead Architect Role
  const transferArchitectRole = useCallback(async (newArchitectUserId) => {
    if (!activeGroup || !currentUser) return;
    AudioService.playTerminalBeep(1400, 0.04);
    await SquadService.transferArchitectRole({
      groupId: activeGroup.id,
      newArchitectUserId,
      currentUser
    });
  }, [activeGroup, currentUser]);

  // Designate or remove Co-Architect status
  const setCoArchitect = useCallback(async (targetUserId, isCoArchitect) => {
    if (!activeGroup) return;
    AudioService.playTerminalBeep(1200, 0.02);
    await SquadService.setCoArchitect({
      groupId: activeGroup.id,
      targetUserId,
      isCoArchitect
    });
  }, [activeGroup]);

  // Toggle Persona Play Lock
  const togglePersonaPlayLock = useCallback(async (groupId, userId, isLocked) => {
    const targetGroupId = groupId || activeGroup?.id;
    const targetUserId = userId || currentUser?.uid;
    if (!targetGroupId || !targetUserId) return;
    AudioService.playTerminalBeep(1250, 0.03);
    await SquadService.togglePersonaPlayLock({
      groupId: targetGroupId,
      userId: targetUserId,
      isLocked
    });
  }, [activeGroup, currentUser]);

  // Role resolution helpers
  const currentMemberDetail = useMemo(() => {
    if (!activeGroup || !currentUser) return null;
    return activeGroup.memberDetails?.[currentUser.uid] || 
      (Array.isArray(activeGroup.members) ? activeGroup.members.find(m => (typeof m === 'object' && (m?.userId === currentUser.uid || m?.uid === currentUser.uid || m?.id === currentUser.uid))) : null);
  }, [activeGroup, currentUser]);

  const isUserArchitect = Boolean(
    activeGroup && currentUser && (
      activeGroup.creatorId === currentUser.uid ||
      currentMemberDetail?.role === 'Architect' ||
      currentMemberDetail?.role === 'GM' ||
      currentMemberDetail?.role === 'Leader'
    )
  );

  const isUserCoArchitect = Boolean(
    activeGroup && currentUser && (
      (Array.isArray(activeGroup.coArchitects) && activeGroup.coArchitects.includes(currentUser.uid)) ||
      currentMemberDetail?.role === 'Co-Architect' ||
      currentMemberDetail?.role === 'Co-GM'
    )
  );

  const canManageTeam = isUserArchitect || isUserCoArchitect;

  const canUserManageGroup = useCallback((groupObj = activeGroup) => {
    const uid = currentUser?.uid;
    if (!groupObj || !uid) return false;
    if (groupObj.creatorId === uid || groupObj.leaderId === uid || groupObj.architectId === uid || groupObj.coArchitectId === uid) {
      return true;
    }
    if (Array.isArray(groupObj.coArchitects) && groupObj.coArchitects.includes(uid)) {
      return true;
    }
    const detail = groupObj.memberDetails?.[uid] ||
      (Array.isArray(groupObj.members)
        ? groupObj.members.find(m => typeof m === 'object' && (m?.userId === uid || m?.uid === uid || m?.id === uid))
        : null);
    const role = detail?.role;
    return role === 'Architect' || role === 'GM' || role === 'Leader' || role === 'Co-Architect' || role === 'Co-GM';
  }, [activeGroup, currentUser?.uid]);

  const value = {
    // Standardized Squad Names
    squads: groups,
    activeSquad: activeGroup,
    activeSquadId: activeGroupId,
    selectSquad: selectGroup,
    createSquad: createGroup,
    updateSquad: updateGroup,
    leaveSquad: leaveGroup,
    deleteSquad: deleteGroup,
    canManageSquad: canManageTeam,

    // Legacy Aliases for Seamless Backward Compatibility
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
    deleteGroup,
    transferArchitectRole,
    setCoArchitect,
    togglePersonaPlayLock,
    flagSquadLFP: SquadService.flagSquadLFP,
    subscribeToLFPGroups: SquadService.subscribeToLFPGroups,
    flagPersonaLFT: SquadService.flagPersonaLFT,
    subscribeToLFTPersonas: SquadService.subscribeToLFTPersonas,
    saveArchitectBlock: (params) => SquadService.saveArchitectBlock({ ...params, currentUser }),
    deleteArchitectBlock: SquadService.deleteArchitectBlock,
    toggleArchitectBlockAck: (params) => SquadService.toggleArchitectBlockAck({ ...params, currentUser, persona: params?.persona || activePersona }),
    toggleArchitectChecklistItem: SquadService.toggleArchitectChecklistItem,
    subscribeToArchitectBlocks: SquadService.subscribeToArchitectBlocks,
    isUserArchitect,
    isUserCoArchitect,
    canManageTeam,
    canUserManageGroup,
    ensureTeamFrequency: (targetGroup) => SquadService.ensureTeamFrequency(targetGroup, currentUser)
  };

  return (
    <SquadContext.Provider value={value}>
      {children}
    </SquadContext.Provider>
  );
};

export const GroupProvider = SquadProvider;
export const GroupContext = SquadContext;
export default SquadContext;
