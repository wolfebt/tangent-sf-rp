/**
 * TANGENT SFF RP: Autonomous Reaction & Interrupt Service
 * Adjudicates opportunity strikes, kinetic shield overcharges, overwatch cones, and reactive interrupts.
 */

export const CANONICAL_REACTIONS = [
  {
    id: 'opportunity_strike',
    label: 'Melee Opportunity Strike',
    icon: '⚔️',
    trigger: 'Hostile combatant moves out of melee engagement reach (adjacent grid tile).',
    actionCost: '1 Reaction',
    effect: 'Execute an immediate standard melee weapon strike against the retreating target.',
    category: 'Offensive',
    rulebook: 'Operator’s Handbook, p. 32'
  },
  {
    id: 'kinetic_shield_overcharge',
    label: 'Kinetic Shield Overcharge',
    icon: '🛡️',
    trigger: 'Targeted by an incoming ranged kinetic, energy, or projectile attack.',
    actionCost: '1 Reaction',
    effect: 'Overcharge deflector matrix, gaining +4 Defense DR or +4 Shield Soak against this attack.',
    category: 'Defensive',
    rulebook: 'Tactical Combat Codex, p. 19'
  },
  {
    id: 'defensive_parry',
    label: 'Active Blade / Weapon Parry',
    icon: '🤺',
    trigger: 'Targeted by an incoming melee strike while wielding a melee weapon or energy blade.',
    actionCost: '1 Reaction',
    effect: 'Add +3 bonus to Defense DC vs. this melee attack. If attacker misses by >=5, riposte for 1d6 damage.',
    category: 'Defensive',
    rulebook: 'Operator’s Handbook, p. 33'
  },
  {
    id: 'dive_for_cover',
    label: 'Dive for Cover',
    icon: '🏃‍♂️',
    trigger: 'Area of Effect (AoE) explosive, grenade, or heavy plasma blast lands within blast radius.',
    actionCost: '1 Reaction',
    effect: 'Gain Advantage on Reflex Save vs. blast and drop Prone behind nearest partial cover to reduce damage by 50%.',
    category: 'Evasive',
    rulebook: 'Architect’s Field Manual, p. 45'
  },
  {
    id: 'overwatch_snapshot',
    label: 'Overwatch Intercept Snapshot',
    icon: '🎯',
    trigger: 'Adversary crosses an active Overwatch firing cone.',
    actionCost: '1 Reaction + Overwatch State',
    effect: 'Interrupt target movement with an immediate ranged snapshot at -2 check penalty.',
    category: 'Tactical',
    rulebook: 'Tactical Combat Codex, p. 22'
  },
  {
    id: 'cyber_counter_hack',
    label: 'Cyber-ICE Counter-Hack',
    icon: '💻',
    trigger: 'Hostile hacker attempts an electronic cyber-intrusion or firewall breach.',
    actionCost: '1 Reaction',
    effect: 'Roll Cybernetics vs. intruder DC; on success, reverse breach and lock out attacker’s cyberdeck for 1 round.',
    category: 'Electronic',
    rulebook: 'Savants & Cybernetics, p. 58'
  }
];

export const getReactionDefinition = (reactionId) => {
  if (!reactionId) return null;
  const target = String(reactionId).toLowerCase().replace(/[^a-z0-9]/g, '');
  return CANONICAL_REACTIONS.find(r => {
    const rid = r.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rlabel = r.label.toLowerCase().replace(/[^a-z0-9]/g, '');
    return rid === target || rlabel === target;
  }) || null;
};

/**
 * Checks if a token has an available Reaction in their turn action budget.
 */
export const canTokenReact = (token) => {
  if (!token) return false;
  if (token.isDead || (token.conditions || []).includes('Dead')) return false;
  if ((token.conditions || []).includes('Stunned') || (token.conditions || []).includes('Comatose')) return false;

  const actions = token.actions || {};
  // If reaction is explicitly marked spent false or undefined, it is available
  return actions.reaction !== false;
};

/**
 * Marks a token's Reaction as spent.
 */
export const spendTokenReaction = (token) => {
  if (!token) return token;
  const currentActions = token.actions || { standard: true, move: true, reaction: true, free: true };
  return {
    ...token,
    actions: {
      ...currentActions,
      reaction: false
    }
  };
};

/**
 * Restores a token's Reaction (e.g. at round reset).
 */
export const restoreTokenReaction = (token) => {
  if (!token) return token;
  const currentActions = token.actions || { standard: true, move: true, reaction: true, free: true };
  return {
    ...token,
    actions: {
      ...currentActions,
      reaction: true
    }
  };
};

/**
 * Evaluates proximity between tokens to detect if movement leaves a hostile melee threat zone.
 * @param {Object} movingToken - The token that moved
 * @param {Object} fromPos - { x, y } previous coordinate
 * @param {Object} toPos - { x, y } new coordinate
 * @param {Array} allTokens - All active map tokens
 * @param {number} meleeRangePx - Engagement distance threshold (default ~65px for standard grid)
 */
export const evaluateOpportunityTriggers = (movingToken, fromPos, toPos, allTokens = [], meleeRangePx = 65) => {
  if (!movingToken || !fromPos || !toPos || !Array.isArray(allTokens)) return [];

  const triggers = [];
  const movingIsAdversary = Boolean(movingToken.isEnemy || movingToken.type === 'adversary' || movingToken.type === 'enemy');

  allTokens.forEach(otherToken => {
    if (otherToken.id === movingToken.id) return;
    if (otherToken.isDead || (otherToken.conditions || []).includes('Dead')) return;

    // Check hostility: only opposing factions trigger opportunity strikes
    const otherIsAdversary = Boolean(otherToken.isEnemy || otherToken.type === 'adversary' || otherToken.type === 'enemy');
    const areHostile = movingIsAdversary !== otherIsAdversary;

    if (!areHostile) return;
    if (!canTokenReact(otherToken)) return;

    // Distance before move
    const distBefore = Math.hypot((otherToken.x || 0) - fromPos.x, (otherToken.y || 0) - fromPos.y);
    // Distance after move
    const distAfter = Math.hypot((otherToken.x || 0) - toPos.x, (otherToken.y || 0) - toPos.y);

    // If was inside melee range and is now outside melee range: opportunity trigger!
    if (distBefore <= meleeRangePx && distAfter > meleeRangePx) {
      triggers.push({
        reactorToken: otherToken,
        targetToken: movingToken,
        reactionType: 'opportunity_strike',
        distBefore: Math.round(distBefore),
        distAfter: Math.round(distAfter),
        description: `${otherToken.label || 'Combatant'} can take a Melee Opportunity Strike as ${movingToken.label || 'Target'} retreats from melee reach!`
      });
    }
  });

  return triggers;
};
