/**
 * TANGENT SFF RP: Unified Tactical Initiative System
 * Manages 2d10 + Reflex Check initiative rolling, tie-breakers, turn order,
 * and integration for Player Characters (PCs), Non-Player Characters (NPCs),
 * and Environmental Hazards / Lair Actions.
 */

import { rollDice } from './diceService';
import { resolveSubAttrScore, calculateSubAttrBase } from '../utils/attributeUtils';
import { AdventureLogService, ACTOR_TYPES } from './adventureLogService';

/**
 * Standard environmental hazard and lair action presets
 */
export const ENVIRONMENT_PRESETS = [
  {
    id: 'env_lair_action',
    name: 'Lair / Station Phase Event',
    icon: '⚡',
    type: 'environment',
    defaultCount: 20,
    rollable: false,
    description: 'Acts on Initiative count 20 (losing initiative ties). Triggers station environmental changes or boss lair mechanics.'
  },
  {
    id: 'env_hazmat_tick',
    name: 'Hazmat Volume Contamination Tick',
    icon: '☣️',
    type: 'environment',
    defaultCount: 10,
    rollable: false,
    description: 'Acts on Initiative count 10. Triggers periodic exposure saves and damage for all units inside active Hazmat zones.'
  },
  {
    id: 'env_plasma_vent',
    name: 'Superheated Plasma Flare Venting',
    icon: '🔥',
    type: 'environment',
    defaultCount: 15,
    rollable: true,
    bonusMod: 2,
    description: 'Unstable plasma exhaust venting. Rolls 2d10+2 Reflex or fixed count 15.'
  },
  {
    id: 'env_decompression',
    name: 'Hard Vacuum Decompression Surge',
    icon: '🕳️',
    type: 'environment',
    defaultCount: 12,
    rollable: true,
    bonusMod: 0,
    description: 'Atmospheric venting cycle. Forces Fortitude saves against vacuum exposure.'
  },
  {
    id: 'env_turret_grid',
    name: 'Automated Station Defense Turrets',
    icon: '🎯',
    type: 'environment',
    defaultCount: 14,
    rollable: true,
    bonusMod: 4,
    description: 'Ceiling automated tracking turrets lock on and fire at unauthorized combatants.'
  }
];

/**
 * Classifies a token or combatant into PC, NPC, or Environment
 * @param {object} combatant 
 * @returns {'pc' | 'npc' | 'environment'}
 */
export function classifyCombatant(combatant = {}) {
  if (!combatant) return ACTOR_TYPES.NPC;
  if (combatant.actorType === ACTOR_TYPES.ENVIRONMENT || combatant.type === 'environment' || combatant.isEnvironment) {
    return ACTOR_TYPES.ENVIRONMENT;
  }
  if (combatant.type === 'hero' || Boolean(combatant.linkedHeroId) || combatant.isPlayer || combatant.actorType === ACTOR_TYPES.PC) {
    return ACTOR_TYPES.PC;
  }
  return ACTOR_TYPES.NPC;
}

/**
 * Resolves the canonical Reflex check bonus / modifier for a combatant.
 * Tangent SF RP Rules: Sub-Attribute Base Reflex = 2 + (Agility * 2)
 */
export function getCombatantReflexBonus(combatant = {}, heroData = null) {
  const cType = classifyCombatant(combatant);

  if (cType === ACTOR_TYPES.ENVIRONMENT) {
    return parseInt(combatant.bonusMod || 0, 10);
  }

  // If heroData sheet is passed or linked
  if (heroData) {
    return resolveSubAttrScore('attr-reflex', heroData);
  }

  // If token explicitly has a reflex score
  if (combatant.reflex !== undefined && combatant.reflex !== null && !isNaN(parseInt(combatant.reflex, 10))) {
    return parseInt(combatant.reflex, 10);
  }

  // Derive from agility attribute if present: 2 + (Agility * 2)
  if (combatant.agility !== undefined && combatant.agility !== null && !isNaN(parseInt(combatant.agility, 10))) {
    const agi = parseInt(combatant.agility, 10);
    return calculateSubAttrBase(agi);
  }

  // Fallback default reflex modifier for standard trained operative/unit
  return cType === ACTOR_TYPES.PC ? 4 : 2;
}

/**
 * Rolls initiative for an individual combatant using 2d10 + Reflex check.
 * Environment combatants can either use their fixed count or roll 2d10 + hazard mod.
 */
export function rollCombatantInitiative(combatant, heroData = null, options = {}) {
  const actorType = classifyCombatant(combatant);
  const name = combatant.label || combatant.name || (actorType === ACTOR_TYPES.ENVIRONMENT ? 'Environmental Hazard' : 'Combatant');
  const reflexBonus = getCombatantReflexBonus(combatant, heroData);

  // If Environment and options.useFixedCount is true (or combatant is fixed by default)
  if (actorType === ACTOR_TYPES.ENVIRONMENT && (!options.rollEnvironment && combatant.defaultCount !== undefined)) {
    const fixedVal = parseInt(combatant.defaultCount || 10, 10);
    return {
      combatantId: combatant.id,
      name,
      actorType,
      rollSubtotal: fixedVal,
      modifier: 0,
      total: fixedVal,
      tieBreaker: reflexBonus,
      isCritSuccess: false,
      isCritFail: false,
      details: `Designated Initiative Count #${fixedVal}`
    };
  }

  // Standard Tangent SF RP 2d10 Reflex Check
  const diceRoll = rollDice('2d10', options);
  const total = diceRoll.total + reflexBonus;

  const details = diceRoll.isCritSuccess
    ? `Natural Dual 10s! (Subtotal 30) + ${reflexBonus} Reflex = #${total}`
    : diceRoll.isCritFail
    ? `Natural Dual 1s Fumble! (Subtotal -10) + ${reflexBonus} Reflex = #${total}`
    : `Rolled 2d10 [${diceRoll.rolls.map(r => r.value).join(', ')}] + ${reflexBonus} Reflex = #${total}`;

  return {
    combatantId: combatant.id,
    name,
    actorType,
    rollSubtotal: diceRoll.rawSubtotal,
    modifier: reflexBonus,
    total,
    tieBreaker: reflexBonus,
    isCritSuccess: diceRoll.isCritSuccess,
    isCritFail: diceRoll.isCritFail,
    details
  };
}

/**
 * Sorts combatants according to canonical Tangent SF RP initiative rules:
 * 1. Higher Initiative Total goes first.
 * 2. If tied, higher Reflex modifier goes first.
 * 3. If still tied, PCs win ties over NPCs/Environment.
 * 4. Remaining ties broken by random d10 sub-roll.
 */
export function sortInitiativeOrder(combatantList = []) {
  return [...combatantList].sort((a, b) => {
    const initA = a.initiative !== undefined && a.initiative !== null ? a.initiative : -99;
    const initB = b.initiative !== undefined && b.initiative !== null ? b.initiative : -99;

    if (initB !== initA) return initB - initA;

    // Tie Breaker 1: Reflex Bonus
    const refA = a.reflex !== undefined ? a.reflex : (a.tieBreaker || 0);
    const refB = b.reflex !== undefined ? b.reflex : (b.tieBreaker || 0);
    if (refB !== refA) return refB - refA;

    // Tie Breaker 2: PC Priority
    const isPcA = classifyCombatant(a) === ACTOR_TYPES.PC;
    const isPcB = classifyCombatant(b) === ACTOR_TYPES.PC;
    if (isPcA && !isPcB) return -1;
    if (!isPcA && isPcB) return 1;

    return 0;
  });
}

/**
 * Rolls initiative for ALL active combatants (PCs, NPCs, and Environment)
 */
export function rollAllInitiatives(tokens = [], environmentCombatants = [], heroMap = {}, round = 1, options = {}) {
  const results = [];
  const updatedTokens = [];
  const updatedEnv = [];

  // 1. Roll PC and NPC tokens
  tokens.forEach(tok => {
    if (tok.type === 'link') {
      updatedTokens.push(tok);
      return;
    }

    const hero = tok.linkedHeroId ? heroMap[tok.linkedHeroId] : null;
    const rollData = rollCombatantInitiative(tok, hero, options);

    results.push(rollData);
    updatedTokens.push({
      ...tok,
      initiative: rollData.total,
      initiativeRollDetails: rollData.details,
      tieBreaker: rollData.tieBreaker
    });

    // Log individual roll
    AdventureLogService.logInitiativeRoll({
      actor: rollData.name,
      actorType: rollData.actorType,
      rollSubtotal: rollData.rollSubtotal,
      modifier: rollData.modifier,
      total: rollData.total,
      details: rollData.details,
      round
    });
  });

  // 2. Roll or set Environment initiatives
  environmentCombatants.forEach(env => {
    const rollData = rollCombatantInitiative(env, null, options);
    results.push(rollData);
    updatedEnv.push({
      ...env,
      initiative: rollData.total,
      initiativeRollDetails: rollData.details,
      tieBreaker: rollData.tieBreaker
    });

    AdventureLogService.logInitiativeRoll({
      actor: rollData.name,
      actorType: ACTOR_TYPES.ENVIRONMENT,
      rollSubtotal: rollData.rollSubtotal,
      modifier: rollData.modifier,
      total: rollData.total,
      details: rollData.details,
      round
    });
  });

  // Log overall established turn order summary
  const combinedAll = [...updatedTokens.filter(t => t.type !== 'link'), ...updatedEnv];
  const sorted = sortInitiativeOrder(combinedAll);
  const summaryOrder = sorted.map((c, i) => `${i + 1}. ${c.label || c.name} (#${c.initiative})`).join('  ➔  ');

  AdventureLogService.log({
    category: 'initiative',
    type: 'initiative_order',
    actor: 'Tactical Director',
    actorType: ACTOR_TYPES.SYSTEM,
    round,
    badge: '🏆',
    summary: `Tactical Initiative Order Established (${sorted.length} Combatants)`,
    details: summaryOrder
  });

  return {
    updatedTokens,
    updatedEnv,
    sorted,
    results
  };
}

/**
 * Rolls initiative for PCs only
 */
export function rollPcInitiatives(tokens = [], heroMap = {}, round = 1, options = {}) {
  const updatedTokens = tokens.map(tok => {
    if (classifyCombatant(tok) !== ACTOR_TYPES.PC) return tok;
    const hero = tok.linkedHeroId ? heroMap[tok.linkedHeroId] : null;
    const rollData = rollCombatantInitiative(tok, hero, options);

    AdventureLogService.logInitiativeRoll({
      actor: rollData.name,
      actorType: ACTOR_TYPES.PC,
      rollSubtotal: rollData.rollSubtotal,
      modifier: rollData.modifier,
      total: rollData.total,
      details: rollData.details,
      round
    });

    return {
      ...tok,
      initiative: rollData.total,
      initiativeRollDetails: rollData.details,
      tieBreaker: rollData.tieBreaker
    };
  });

  return updatedTokens;
}

/**
 * Rolls initiative for NPCs only
 */
export function rollNpcInitiatives(tokens = [], round = 1, options = {}) {
  const updatedTokens = tokens.map(tok => {
    if (classifyCombatant(tok) !== ACTOR_TYPES.NPC || tok.type === 'link') return tok;
    const rollData = rollCombatantInitiative(tok, null, options);

    AdventureLogService.logInitiativeRoll({
      actor: rollData.name,
      actorType: ACTOR_TYPES.NPC,
      rollSubtotal: rollData.rollSubtotal,
      modifier: rollData.modifier,
      total: rollData.total,
      details: rollData.details,
      round
    });

    return {
      ...tok,
      initiative: rollData.total,
      initiativeRollDetails: rollData.details,
      tieBreaker: rollData.tieBreaker
    };
  });

  return updatedTokens;
}

export default {
  ENVIRONMENT_PRESETS,
  classifyCombatant,
  getCombatantReflexBonus,
  rollCombatantInitiative,
  sortInitiativeOrder,
  rollAllInitiatives,
  rollPcInitiatives,
  rollNpcInitiatives
};
