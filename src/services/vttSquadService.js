/**
 * TANGENT SFF RP: VTT Squad & Permissions Management Service
 * Manages squads, Lead Architect & Co-Architect grants, and multi-persona bindings per operator.
 */

export const VTT_ROLES = {
  ARCHITECT_LEAD: 'lead_architect', // Full authoritative GM
  CO_ARCHITECT: 'co_architect',       // Assistant GM (moves OpFor, runs hazards, initiative)
  SQUAD_LEAD: 'squad_lead',           // Operator Squad Leader (tactical pings, focus targets)
  TEAM_LEAD: 'squad_lead',            // Backward compatibility alias
  OPERATOR: 'operator',               // Standard Operator (Player) with assigned unit(s)
  OPERATIVE: 'operator',              // Backward compatibility alias
  SPECTATOR: 'spectator'              // Read-only spectator
};

export const CANONICAL_SQUADS = [
  {
    id: 'squad_alpha',
    name: 'Alpha Strike Squad',
    color: '#06b6d4', // Cyan
    badge: '🔷',
    type: 'player_squad',
    description: 'Primary operator strike squad.'
  },
  {
    id: 'squad_bravo',
    name: 'Bravo Support Squad',
    color: '#3b82f6', // Blue
    badge: '🔹',
    type: 'player_squad',
    description: 'Secondary tactical fireteam.'
  },
  {
    id: 'squad_opfor',
    name: 'OpFor Syndicate Forces',
    color: '#ef4444', // Red
    badge: '🔺',
    type: 'hostile_opfor',
    description: 'Hostile mercenaries, drones, and adversary units.'
  },
  {
    id: 'squad_neutral',
    name: 'Neutral / Civilians',
    color: '#a855f7', // Purple
    badge: '⚪',
    type: 'neutral_npc',
    description: 'Non-combatant researchers, bystanders, and mission assets.'
  }
];

export const CANONICAL_TEAMS = CANONICAL_SQUADS.map(s => ({
  ...s,
  id: s.id.replace('squad_', 'team_'),
  name: s.name.replace('Squad', 'Team'),
  type: s.type.replace('player_squad', 'player_team'),
  description: s.description.replace('squad', 'team')
}));

export const createDefaultSquadRoster = () => {
  return {
    squads: [...CANONICAL_SQUADS],
    teams: [...CANONICAL_TEAMS],
    allowPlayerOverride: true, // Architect policy: whether operators can engage player override on locked folios during active game
    // Map userId -> { role: string, squadId: string, teamId: string, assignedTokenIds: string[] }
    userAssignments: {
      gm_host: {
        role: VTT_ROLES.ARCHITECT_LEAD,
        squadId: 'squad_opfor',
        teamId: 'team_opfor',
        assignedTokenIds: []
      }
    }
  };
};

export const createDefaultTeamRoster = createDefaultSquadRoster;

/**
 * Sets whether player override is allowed for operators in the VTT / Squad session.
 */
export const setAllowPlayerOverride = (roster, allowed) => {
  return {
    ...roster,
    allowPlayerOverride: Boolean(allowed)
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
 * Operators can only move tokens assigned to their user ID or tokens with matching linkedHeroId.
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
    role: VTT_ROLES.OPERATOR,
    squadId: 'squad_alpha',
    teamId: 'team_alpha',
    assignedTokenIds: []
  };

  const updatedIds = Array.from(new Set([...(current.assignedTokenIds || []), ...tokenIds]));

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
    role: VTT_ROLES.OPERATOR,
    squadId: 'squad_alpha',
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

export default {
  VTT_ROLES,
  CANONICAL_SQUADS,
  CANONICAL_TEAMS,
  createDefaultSquadRoster,
  createDefaultTeamRoster,
  setAllowPlayerOverride,
  isUserArchitect,
  canUserControlToken,
  bindCharactersToUser,
  setUserRole
};
