/**
 * TANGENT SFF RP: VTT Team & Permissions Management Service
 * Manages squads/teams, Lead Architect & Co-Architect grants, and multi-character bindings per player.
 */

export const VTT_ROLES = {
  ARCHITECT_LEAD: 'lead_architect', // Full authoritative GM
  CO_ARCHITECT: 'co_architect',       // Assistant GM (moves OpFor, runs hazards, initiative)
  SQUAD_LEAD: 'squad_lead',           // Player Squad Leader (tactical pings, focus targets)
  OPERATIVE: 'operative',             // Standard Player with assigned unit(s)
  SPECTATOR: 'spectator'              // Read-only spectator
};

export const CANONICAL_TEAMS = [
  {
    id: 'team_alpha',
    name: 'Alpha Strike Squad',
    color: '#06b6d4', // Cyan
    badge: '🔷',
    type: 'player_squad',
    description: 'Primary operative strike team.'
  },
  {
    id: 'team_bravo',
    name: 'Bravo Support Unit',
    color: '#3b82f6', // Blue
    badge: '🔹',
    type: 'player_squad',
    description: 'Secondary tactical fireteam.'
  },
  {
    id: 'team_opfor',
    name: 'OpFor Syndicate Forces',
    color: '#ef4444', // Red
    badge: '🔺',
    type: 'hostile_opfor',
    description: 'Hostile mercenaries, drones, and adversary units.'
  },
  {
    id: 'team_neutral',
    name: 'Neutral / Civilians',
    color: '#a855f7', // Purple
    badge: '⚪',
    type: 'neutral_npc',
    description: 'Non-combatant researchers, bystanders, and mission assets.'
  }
];

export const createDefaultTeamRoster = () => {
  return {
    teams: [...CANONICAL_TEAMS],
    // Map userId -> { role: string, teamId: string, assignedTokenIds: string[] }
    userAssignments: {
      gm_host: {
        role: VTT_ROLES.ARCHITECT_LEAD,
        teamId: 'team_opfor',
        assignedTokenIds: []
      }
    }
  };
};

/**
 * Checks if a user has Architect (Lead or Co-Architect) privileges.
 */
export const isUserArchitect = (userAssignment) => {
  if (!userAssignment) return false;
  return userAssignment.role === VTT_ROLES.ARCHITECT_LEAD || userAssignment.role === VTT_ROLES.CO_ARCHITECT;
};

/**
 * Determines if a user can control / move a specific token.
 * Lead Architects and Co-Architects can move any token.
 * Operatives can only move tokens assigned to their user ID or tokens with matching linkedHeroId.
 */
export const canUserControlToken = (userAssignment, token, currentUserId) => {
  if (!token) return false;
  if (!userAssignment) return true; // Default permissive in local single-user mode

  if (userAssignment.role === VTT_ROLES.ARCHITECT_LEAD || userAssignment.role === VTT_ROLES.CO_ARCHITECT) {
    return true;
  }

  // Check explicit assigned tokens array
  if (Array.isArray(userAssignment.assignedTokenIds) && userAssignment.assignedTokenIds.includes(token.id)) {
    return true;
  }

  // Check linked hero ID
  if (token.linkedHeroId && userAssignment.assignedTokenIds?.includes(token.linkedHeroId)) {
    return true;
  }

  // If token is owner-stamped with currentUserId
  if (token.ownerId && token.ownerId === currentUserId) {
    return true;
  }

  return false;
};

/**
 * Binds one or more character / token IDs to a user.
 */
export const bindCharactersToUser = (roster, userId, tokenIds) => {
  const current = roster.userAssignments[userId] || {
    role: VTT_ROLES.OPERATIVE,
    teamId: 'team_alpha',
    assignedTokenIds: []
  };

  const updatedIds = Array.from(new Set([...current.assignedTokenIds, ...tokenIds]));

  return {
    ...roster,
    userAssignments: {
      ...roster.userAssignments,
      [userId]: {
        ...current,
        assignedTokenIds: updatedIds
      }
    }
  };
};

/**
 * Sets user role (e.g. promotes to CO_ARCHITECT or SQUAD_LEAD).
 */
export const setUserRole = (roster, userId, newRole) => {
  const current = roster.userAssignments[userId] || {
    role: VTT_ROLES.OPERATIVE,
    teamId: 'team_alpha',
    assignedTokenIds: []
  };

  return {
    ...roster,
    userAssignments: {
      ...roster.userAssignments,
      [userId]: {
        ...current,
        role: newRole
      }
    }
  };
};
