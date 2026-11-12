/**
 * BASTION Unified Session, Role, Multi-Group Campaign & Epistemic Visibility Engine
 *
 * Pure ESM service (zero React/DOM hard dependencies) powering:
 *  1. Multi-Group Campaign & Session resolution (multiple squads/parties in one active campaign).
 *  2. Strict Role & Linguistic Framing Contract:
 *     - Operators (players): 1st/2nd-person direct address ("you" / "your").
 *     - Architects (game masters): plural partnered address ("we" / "us" / "our").
 *  3. Development Operator Preview lens (lets Architects/devs preview BASTION as "you" scoped
 *     to any specific campaign group and/or enrolled persona without leaking GM state).
 *  4. Epistemic Visibility Scopes ('public', 'group:<id>', 'persona:<id>', 'architect') for
 *     RAG chunks, Tactical Dockets, VTT tokens, and multi-group isolation.
 */

export const BASTION_ROLES = Object.freeze({
  OPERATOR: 'operator',
  ARCHITECT: 'architect',
});

export const BASTION_VOICE_CONTRACTS = Object.freeze({
  operator: Object.freeze({
    role: 'operator',
    pronounMode: 'you',
    pronouns: 'you / your',
    userAddress: 'you / your',
    assistantFraming: 'Direct Tactical Advisor & Build Copilot',
    badgeLabel: 'OPERATOR ("YOU")',
    previewBadgeLabel: 'OPERATOR PREVIEW ("YOU")',
    directiveSummary:
      'Address the player strictly as "you" / "your". Frame tactical options, build trade-offs, and rules rulings around your character, your squad, and your decisions. NEVER address the user as "Architect" and NEVER use partnered GM "we / us / our" framing.',
  }),
  architect: Object.freeze({
    role: 'architect',
    pronounMode: 'we',
    pronouns: 'we / us / our',
    userAddress: 'we / us / our',
    assistantFraming: 'Partnered Co-Architect, Rules Co-Arbiter & Encounter Engineer',
    badgeLabel: 'ARCHITECT ("WE")',
    previewBadgeLabel: 'ARCHITECT ("WE")',
    directiveSummary:
      'Include the Game Master in the plural partnered "we" / "us" / "our" category (e.g., "we can tune this CR", "our pacing budget", "let us check how Group Alpha and Group Bravo intersect"). Frame rulings, encounter math, worldbuilding, and multi-group orchestration as collaborative co-design.',
  }),
});

export const DEFAULT_PREVIEW_CONFIG = Object.freeze({
  enabled: false,
  mode: 'auto', // 'auto' | 'operator_preview' | 'architect'
  focusGroupId: 'all', // 'all' | '<groupId>'
  previewGroupId: null, // '<groupId>' | null
  previewPersonaId: null, // '<personaId>' | null
});

const ARCHITECT_ROLE_TOKENS = new Set([
  'architect',
  'lead architect',
  'co-architect',
  'gm',
  'game master',
  'admin',
]);

function normalizeRoleToken(raw) {
  return String(raw || '').trim().toLowerCase();
}

/**
 * Extract canonical character personas enrolled in a group.
 */
export function extractGroupPersonas(group) {
  if (!group || typeof group !== 'object') return [];
  const results = [];
  const seen = new Set();

  const pushPersona = (p, fallbackOwnerUid = null, fallbackHandle = 'Operator', fallbackSquadRole = 'Operator') => {
    if (!p || typeof p !== 'object') return;
    const id = String(p.id || p.personaId || p['character-doc-id'] || p.docId || p.name || '').trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    const archetype = p.archetype || p['char-archetype'] || '';
    results.push({
      id,
      personaId: id,
      name: p.name || p['char-name'] || 'Persona',
      archetype,
      species: p.species || p['char-species'] || 'Human',
      role: p.role || archetype || p['char-concept'] || p['char-occu'] || 'Specialist',
      ownerUid: p.ownerUid || fallbackOwnerUid || null,
      ownerHandle: p.ownerHandle || fallbackHandle || 'Operator',
      squadRole: p.squadRole || fallbackSquadRole || 'Operator',
      health: Number(p.health ?? 30),
      currentHealth: Number(p.currentHealth ?? p.current_health ?? p.health ?? 30),
      vitality: Number(p.vitality ?? 30),
      currentVitality: Number(p.currentVitality ?? p.current_vitality ?? p.vitality ?? 30),
      groupId: group.id || null,
      groupName: group.name || 'Squad',
    });
  };

  if (Array.isArray(group.characterMembers)) {
    for (const member of group.characterMembers) {
      pushPersona(member);
    }
  }

  if (group.enrolledPersonas) {
    if (Array.isArray(group.enrolledPersonas)) {
      for (const p of group.enrolledPersonas) {
        pushPersona(p);
      }
    } else if (typeof group.enrolledPersonas === 'object') {
      for (const [keyId, p] of Object.entries(group.enrolledPersonas)) {
        if (!p || typeof p !== 'object') continue;
        pushPersona({ id: p.id || p.personaId || keyId, ...p });
      }
    }
  }

  if (group.memberDetails && typeof group.memberDetails === 'object') {
    for (const [uid, detail] of Object.entries(group.memberDetails)) {
      const p = detail?.persona;
      if (!p) continue;
      pushPersona(
        p,
        uid,
        detail.handle || detail.userHandle || 'Operator',
        detail.role || (group.creatorId === uid ? 'Architect' : 'Operator')
      );
    }
  }

  return results;
}

/**
 * Determine a specific user's role inside a single group ('architect' | 'operator' | null).
 */
export function resolveUserRoleInGroup(group, uid) {
  if (!group || !uid) return null;
  if (group.creatorId && group.creatorId === uid) return BASTION_ROLES.ARCHITECT;
  if (Array.isArray(group.architectIds) && group.architectIds.includes(uid)) return BASTION_ROLES.ARCHITECT;
  if (Array.isArray(group.coArchitectIds) && group.coArchitectIds.includes(uid)) return BASTION_ROLES.ARCHITECT;

  const memberDetail = group.memberDetails?.[uid];
  if (memberDetail) {
    const token = normalizeRoleToken(memberDetail.role);
    if (ARCHITECT_ROLE_TOKENS.has(token)) return BASTION_ROLES.ARCHITECT;
    return BASTION_ROLES.OPERATOR;
  }

  if (Array.isArray(group.members) && group.members.includes(uid)) {
    return BASTION_ROLES.OPERATOR;
  }

  if (group.members && !Array.isArray(group.members) && typeof group.members === 'object') {
    const memberObj = group.members[uid];
    if (memberObj) {
      const token = normalizeRoleToken(typeof memberObj === 'string' ? memberObj : memberObj.role);
      if (ARCHITECT_ROLE_TOKENS.has(token)) return BASTION_ROLES.ARCHITECT;
      return BASTION_ROLES.OPERATOR;
    }
  }

  return null;
}

/**
 * Partition groups into active campaign groups vs other groups, preserving multi-group campaign support.
 */
export function resolveCampaignGroups({ universeState = null, groups = [] } = {}) {
  const safeGroups = Array.isArray(groups) ? groups.filter(Boolean) : [];
  const campaignId = universeState?.id && universeState.id !== 'proj_default_universe'
    ? String(universeState.id)
    : (universeState?.id ? String(universeState.id) : null);
  const campaignTitle = String(universeState?.projectName || universeState?.title || '').trim().toLowerCase();

  const linkedGroups = safeGroups.filter((g) => {
    if (campaignId && g.campaignId && String(g.campaignId) === campaignId) return true;
    if (
      campaignTitle &&
      campaignTitle !== 'tangent universe' &&
      g.campaignTitle &&
      String(g.campaignTitle).trim().toLowerCase() === campaignTitle
    ) {
      return true;
    }
    return false;
  });

  // If explicit campaign-linked groups exist, those form the multi-group campaign roster;
  // otherwise fall back to available groups so standalone/dev sessions still expose squad selection.
  const sessionGroups = linkedGroups.length > 0 ? linkedGroups : safeGroups;

  return {
    campaignId,
    campaignName: universeState?.projectName || universeState?.title || 'Tangent Universe',
    linkedGroups,
    sessionGroups,
    hasMultipleGroups: sessionGroups.length > 1,
  };
}

/**
 * Resolve the complete BASTION session, role, linguistic contract, multi-group focus, and epistemic scope.
 */
export function resolveBastionSessionState({
  currentUser = null,
  authState = {},
  universeState = null,
  isStoryReadOnly = false,
  groups = [],
  activeGroupId = null,
  activePersona = null,
  personaRoster = [],
  routePath = '',
  defaultRouteRole = null,
  previewConfig = DEFAULT_PREVIEW_CONFIG,
} = {}) {
  const uid = currentUser?.uid || authState?.currentUser?.uid || null;
  const safePreview = { ...DEFAULT_PREVIEW_CONFIG, ...(previewConfig || {}) };
  const {
    campaignId,
    campaignName,
    linkedGroups,
    sessionGroups,
    hasMultipleGroups,
  } = resolveCampaignGroups({ universeState, groups });

  const userGroupMemberships = sessionGroups.map((group) => ({
    group,
    role: resolveUserRoleInGroup(group, uid),
    personas: extractGroupPersonas(group),
  }));

  const architectGroups = userGroupMemberships
    .filter((entry) => entry.role === BASTION_ROLES.ARCHITECT)
    .map((entry) => entry.group);
  const operatorOnlyGroups = userGroupMemberships
    .filter((entry) => entry.role === BASTION_ROLES.OPERATOR)
    .map((entry) => entry.group);

  const safeAllGroups = Array.isArray(groups) ? groups.filter(Boolean) : [];
  const ownsUniverse = Boolean(
    uid &&
    universeState &&
    ((universeState.creatorId && universeState.creatorId === uid) ||
      (universeState.ownerId && universeState.ownerId === uid) ||
      (universeState.authorUid && universeState.authorUid === uid) ||
      (Array.isArray(universeState.architectIds) && universeState.architectIds.includes(uid)))
  );

  const foreignOwnedUniverse = Boolean(
    (universeState?.creatorId || universeState?.authorUid) &&
    uid &&
    (universeState.creatorId || universeState.authorUid) !== uid &&
    !ownsUniverse
  );

  const normalizedRoute = String(routePath || '').toLowerCase();
  const normalizedRouteDefaultRole = normalizeRoleToken(defaultRouteRole);
  const isVttOperativeRoute =
    normalizedRoute.startsWith('/vtt') ||
    normalizedRoute.startsWith('/spectator') ||
    normalizedRouteDefaultRole === 'operative' ||
    normalizedRouteDefaultRole === 'operator';
  const isArchitectStudioRoute =
    normalizedRoute.startsWith('/foundry') ||
    normalizedRoute.startsWith('/stage') ||
    normalizedRoute.startsWith('/dbm');

  const isAuthArchitect = Boolean(
    authState?.isGM ||
    authState?.isAdmin ||
    authState?.hasCloudAdminAccess ||
    normalizeRoleToken(authState?.userRole) === 'architect'
  );

  // Determine whether the user genuinely holds Architect authority in this session/workspace.
  // Security guardrail: if the user is strictly enrolled as an Operator in a foreign-owned campaign/group
  // without cloud admin privileges, they cannot escalate to Architect.
  let hasArchitectAuthority = false;
  if (architectGroups.length > 0 || ownsUniverse || Boolean(authState?.hasCloudAdminAccess)) {
    hasArchitectAuthority = true;
  } else if (operatorOnlyGroups.length > 0 && (foreignOwnedUniverse || isStoryReadOnly)) {
    hasArchitectAuthority = false;
  } else if (isAuthArchitect || isArchitectStudioRoute) {
    hasArchitectAuthority = true;
  }

  // Base role before Development Operator Preview override
  let baseRole = hasArchitectAuthority ? BASTION_ROLES.ARCHITECT : BASTION_ROLES.OPERATOR;
  if (isVttOperativeRoute && !safePreview.enabled && safePreview.mode === 'auto' && operatorOnlyGroups.length > 0 && architectGroups.length === 0) {
    baseRole = BASTION_ROLES.OPERATOR;
  }

  // Apply Development Operator Preview when enabled by an Architect/Developer
  const isOperatorPreview = Boolean(
    hasArchitectAuthority &&
    (safePreview.enabled === true || safePreview.mode === 'operator_preview')
  );

  const effectiveRole = isOperatorPreview
    ? BASTION_ROLES.OPERATOR
    : (hasArchitectAuthority && safePreview.mode === 'architect'
        ? BASTION_ROLES.ARCHITECT
        : baseRole);

  // Resolve Multi-Group Focus & Active Operator Group
  const fallbackGroupId = activeGroupId || sessionGroups[0]?.id || null;
  let focusGroupId = 'all';
  let activeTargetGroup = null;

  if (effectiveRole === BASTION_ROLES.OPERATOR) {
    const candidateGroupId = isOperatorPreview
      ? (safePreview.previewGroupId || (safePreview.focusGroupId !== 'all' ? safePreview.focusGroupId : null) || fallbackGroupId)
      : (activeGroupId || operatorOnlyGroups[0]?.id || fallbackGroupId);

    activeTargetGroup =
      sessionGroups.find((g) => g.id === candidateGroupId) ||
      operatorOnlyGroups[0] ||
      sessionGroups[0] ||
      null;
    focusGroupId = activeTargetGroup?.id || candidateGroupId || null;
  } else {
    // Architect can inspect 'all' groups in the campaign simultaneously or focus on one group
    const requestedFocus = safePreview.focusGroupId || 'all';
    if (requestedFocus !== 'all' && sessionGroups.some((g) => g.id === requestedFocus)) {
      focusGroupId = requestedFocus;
      activeTargetGroup = sessionGroups.find((g) => g.id === requestedFocus) || null;
    } else {
      focusGroupId = 'all';
      activeTargetGroup = activeGroupId
        ? sessionGroups.find((g) => g.id === activeGroupId) || null
        : null;
    }
  }

  // Build available personas across session groups + local roster for preview / operator lens
  const groupPersonasByGroupId = {};
  const allCampaignPersonas = [];
  for (const group of sessionGroups) {
    const gPersonas = extractGroupPersonas(group);
    groupPersonasByGroupId[group.id] = gPersonas;
    for (const p of gPersonas) {
      allCampaignPersonas.push(p);
    }
  }

  const safeRoster = Array.isArray(personaRoster) ? personaRoster.filter(Boolean) : [];
  let effectivePersona = activePersona || null;

  if (effectiveRole === BASTION_ROLES.OPERATOR) {
    const scopedGroupPersonas = activeTargetGroup ? (groupPersonasByGroupId[activeTargetGroup.id] || []) : [];
    if (isOperatorPreview && safePreview.previewPersonaId) {
      effectivePersona =
        scopedGroupPersonas.find((p) => p.id === safePreview.previewPersonaId) ||
        safeRoster.find((p) => (p.id || p['character-doc-id']) === safePreview.previewPersonaId) ||
        allCampaignPersonas.find((p) => p.id === safePreview.previewPersonaId) ||
        effectivePersona;
    } else if (isOperatorPreview && scopedGroupPersonas.length > 0 && !safePreview.previewPersonaId) {
      // Default preview persona to the first Operator persona in the previewed squad if available
      const firstSquadOperator =
        scopedGroupPersonas.find((p) => normalizeRoleToken(p.squadRole) !== 'architect') ||
        scopedGroupPersonas[0];
      const fullSheetMatch = safeRoster.find(
        (r) => (r.id || r['character-doc-id']) === firstSquadOperator?.id
      );
      effectivePersona = fullSheetMatch || firstSquadOperator || effectivePersona;
    } else if (!effectivePersona && uid && scopedGroupPersonas.length > 0) {
      const ownSquadPersona = scopedGroupPersonas.find((p) => p.ownerUid === uid);
      if (ownSquadPersona) {
        effectivePersona =
          safeRoster.find((r) => (r.id || r['character-doc-id']) === ownSquadPersona.id) ||
          ownSquadPersona;
      }
    }
  }

  const effectivePersonaId = effectivePersona
    ? String(effectivePersona.id || effectivePersona['character-doc-id'] || effectivePersona.docId || effectivePersona.name || '').trim() || null
    : null;

  // Compute Epistemic Visibility Scopes
  const allowedScopes =
    effectiveRole === BASTION_ROLES.ARCHITECT
      ? ['architect', 'public', 'group:*', 'persona:*']
      : [
          'public',
          ...(focusGroupId ? [`group:${focusGroupId}`] : []),
          ...(effectivePersonaId ? [`persona:${effectivePersonaId}`] : []),
        ];

  const voiceContract = BASTION_VOICE_CONTRACTS[effectiveRole] || BASTION_VOICE_CONTRACTS.operator;

  return {
    campaignId,
    campaignName,
    allGroups: safeAllGroups,
    linkedGroups,
    sessionGroups,
    operatorGroups: operatorOnlyGroups,
    hasMultipleGroups,
    isMultiGroupSession: hasMultipleGroups,
    groupPersonasByGroupId,
    allCampaignPersonas,
    hasArchitectAuthority,
    baseRole,
    effectiveRole,
    isArchitect: effectiveRole === BASTION_ROLES.ARCHITECT,
    isOperator: effectiveRole === BASTION_ROLES.OPERATOR,
    isOperatorPreview,
    canToggleOperatorPreview: hasArchitectAuthority,
    focusGroupId,
    activeTargetGroup,
    focusedGroup: activeTargetGroup,
    effectivePersona,
    activePersona: effectivePersona,
    effectivePersonaId,
    allowedScopes,
    epistemicScopes: allowedScopes,
    voiceContract,
    voice: voiceContract,
    badgeLabel: isOperatorPreview ? voiceContract.previewBadgeLabel : voiceContract.badgeLabel,
  };
}

/**
 * Determine whether a single record/chunk/docket/token is visible under the resolved session state.
 */
export function isRecordVisibleToSession(record, sessionState = {}) {
  if (!record || typeof record !== 'object') return false;
  const effectiveRole = sessionState?.effectiveRole === BASTION_ROLES.ARCHITECT
    ? BASTION_ROLES.ARCHITECT
    : BASTION_ROLES.OPERATOR;

  // Architect sees everything unless an explicit group focus filter is requested by caller
  if (effectiveRole === BASTION_ROLES.ARCHITECT) {
    if (
      sessionState?.strictGroupFilter &&
      sessionState?.focusGroupId &&
      sessionState.focusGroupId !== 'all'
    ) {
      const recGroupId = record.groupId || record.squadId || null;
      const recGroupList = Array.isArray(record.visibleToGroupIds) ? record.visibleToGroupIds : null;
      if (recGroupId && recGroupId !== sessionState.focusGroupId) return false;
      if (recGroupList && recGroupList.length > 0 && !recGroupList.includes(sessionState.focusGroupId)) {
        return false;
      }
    }
    return true;
  }

  // --- Operator Epistemic Gate (Fail-Closed on Architect-Only Material) ---
  const visibility = normalizeRoleToken(record.visibility || record.scope);
  const perspective = normalizeRoleToken(record.perspective);
  const citation = String(record.citation || record.sourcePath || record.path || '').toLowerCase();
  const chunkId = String(record.id || '');
  const textSample = String(record.text || record.title || '');

  if (
    record.architectOnly === true ||
    record.gmOnly === true ||
    record.isHidden === true ||
    record.fogHidden === true ||
    visibility === 'architect' ||
    visibility === 'gm' ||
    perspective === 'architect' ||
    chunkId.endsWith('-note') ||
    citation.includes('/architect/') ||
    citation.startsWith('architect/') ||
    textSample.includes('[Architect Notes & Railguards]')
  ) {
    return false;
  }

  // Group-level isolation (prevents Squad Alpha intel from leaking to Squad Bravo)
  const activeGroupId = sessionState?.focusGroupId || sessionState?.activeTargetGroup?.id || null;
  const recordGroupId = record.groupId || record.squadId || (visibility.startsWith('group:') ? visibility.slice(6) : null);
  if (recordGroupId) {
    if (!activeGroupId || String(recordGroupId) !== String(activeGroupId)) {
      return false;
    }
  }
  if (Array.isArray(record.visibleToGroupIds) && record.visibleToGroupIds.length > 0) {
    if (!activeGroupId || !record.visibleToGroupIds.map(String).includes(String(activeGroupId))) {
      return false;
    }
  }

  // Persona-level isolation (e.g., classified ArchitectDocketBlock visibleToPersonaIds)
  const activePersonaId = sessionState?.effectivePersonaId || null;
  const personaScopeId = visibility.startsWith('persona:') ? visibility.slice(8) : (record.personaId || null);
  if (personaScopeId) {
    if (!activePersonaId || String(personaScopeId) !== String(activePersonaId)) {
      return false;
    }
  }
  if (Array.isArray(record.visibleToPersonaIds) && record.visibleToPersonaIds.length > 0) {
    if (!activePersonaId || !record.visibleToPersonaIds.map(String).includes(String(activePersonaId))) {
      return false;
    }
  }

  return true;
}

/**
 * Filter an array of records (RAG chunks, Tactical Dockets, tokens, notes) through the epistemic gate.
 */
export function filterEpistemicRecords(records = [], sessionState = {}) {
  if (!Array.isArray(records)) return [];
  return records.filter((item) => isRecordVisibleToSession(item, sessionState));
}

/**
 * Build a concise, role-safe Multi-Group & Session Context Envelope for BASTION prompts.
 */
export function buildMultiGroupPromptEnvelope(sessionState = {}) {
  if (!sessionState || typeof sessionState !== 'object') return '';
  const {
    campaignName = 'Tangent Universe',
    sessionGroups = [],
    effectiveRole = BASTION_ROLES.OPERATOR,
    isOperatorPreview = false,
    focusGroupId = 'all',
    activeTargetGroup = null,
    effectivePersona = null,
    groupPersonasByGroupId = {},
  } = sessionState;

  if (effectiveRole === BASTION_ROLES.ARCHITECT) {
    const lines = [
      `[CAMPAIGN & MULTI-GROUP CO-ARCHITECT ENVELOPE]`,
      `Active Campaign: ${campaignName}`,
      `Active Squads / Groups in Campaign: ${sessionGroups.length}`,
      `Group Focus Lens: ${
        focusGroupId === 'all'
          ? 'ALL CAMPAIGN GROUPS (synchronize cross-squad timelines, shared threat clocks, and per-group CR budgets)'
          : `FOCUSED GROUP -> ${activeTargetGroup?.name || focusGroupId}`
      }`,
    ];

    if (sessionGroups.length > 0) {
      sessionGroups.forEach((group, idx) => {
        const gPersonas = groupPersonasByGroupId[group.id] || extractGroupPersonas(group);
        const operatorPersonas = gPersonas.filter(
          (p) => normalizeRoleToken(p.squadRole) !== 'architect'
        );
        const rosterSummary = operatorPersonas.length > 0
          ? operatorPersonas
              .map((p) => `${p.name} (${p.species} ${p.role}, HP ${p.currentHealth}/${p.health}, VP ${p.currentVitality}/${p.vitality})`)
              .join('; ')
          : 'No locked Operator personas yet';
        const focusMarker = focusGroupId === group.id ? ' [FOCUSED]' : '';
        lines.push(
          `  - Group ${idx + 1}${focusMarker}: "${group.name || group.id}" [${group.status || 'Active'}] -> ${rosterSummary}`
        );
      });
    }
    return lines.join('\n');
  }

  // Operator / Operator Preview Envelope — strictly isolated to YOUR squad and YOUR persona!
  const lines = [
    `[YOUR ACTIVE FIELD SESSION ENVELOPE${isOperatorPreview ? ' — DEV OPERATOR PREVIEW' : ''}]`,
    `Campaign Sector: ${campaignName}`,
  ];

  if (activeTargetGroup) {
    const squadPersonas = (groupPersonasByGroupId[activeTargetGroup.id] || extractGroupPersonas(activeTargetGroup))
      .filter((p) => normalizeRoleToken(p.squadRole) !== 'architect');
    const teammates = squadPersonas
      .filter((p) => !effectivePersona || (p.id !== (effectivePersona.id || effectivePersona['character-doc-id'])))
      .map((p) => `${p.name} (${p.species} ${p.role})`)
      .join(', ');

    lines.push(`Your Assigned Group / Squad: ${activeTargetGroup.name || activeTargetGroup.id}`);
    if (teammates) {
      lines.push(`Your Squadmates: ${teammates}`);
    }
  }

  if (effectivePersona) {
    const pName = effectivePersona['char-name'] || effectivePersona.name || 'Your Operator';
    const pSpecies = effectivePersona['char-species'] || effectivePersona.species || 'Human';
    const pRole = effectivePersona['char-concept'] || effectivePersona['char-occu'] || effectivePersona.role || 'Specialist';
    lines.push(`Your Active Persona: ${pName} (${pSpecies} — ${pRole})`);
  }

  return lines.join('\n');
}

/**
 * Resolve an isolated conversation thread key so Architect ("we") and Operator / Operator Preview ("you")
 * chat histories never cross-contaminate or leak GM spoilers across roles or groups.
 */
export function resolveBastionThreadKey(sessionState = {}) {
  const campaignPart = sessionState?.campaignId || 'global';
  if (sessionState?.effectiveRole === BASTION_ROLES.ARCHITECT) {
    const focusPart = sessionState?.focusGroupId || 'all';
    return `architect:${campaignPart}:group:${focusPart}`;
  }
  const groupPart = sessionState?.focusGroupId || 'solo';
  const personaPart = sessionState?.effectivePersonaId || 'default';
  const previewPrefix = sessionState?.isOperatorPreview ? 'operator_preview' : 'operator';
  return `${previewPrefix}:${campaignPart}:group:${groupPart}:persona:${personaPart}`;
}
