// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — UDU CALCULATION ENGINE
// Universal Displacement Unit (Node, Socket, Mount, Module)
// ═══════════════════════════════════════════════════════════

import {
  UDU_TIERS,
  BODY_SLOT_NODES,
  TOTAL_BODY_NODES,
  STIGMA_THRESHOLDS,
  MECHA_GARAGING_RULES
} from './tangentConstants.js';

/**
 * Get internal node capacity for an anatomical body slot.
 * @param {'Head'|'Torso'|'LeftArm'|'RightArm'|'LeftLeg'|'RightLeg'} bodySlot
 * @returns {number} Node capacity for that slot
 */
export function getNodeCapacity(bodySlot) {
  if (!bodySlot) return 0;
  if (BODY_SLOT_NODES[bodySlot] !== undefined) return BODY_SLOT_NODES[bodySlot];
  const compact = String(bodySlot).replace(/\s+/g, '');
  if (BODY_SLOT_NODES[compact] !== undefined) return BODY_SLOT_NODES[compact];
  if (/arm/i.test(compact)) return BODY_SLOT_NODES.LeftArm || 30;
  if (/leg/i.test(compact)) return BODY_SLOT_NODES.LeftLeg || 40;
  return 0;
}

/**
 * Get total body node capacity for standard humanoid frame (200).
 * @returns {number} Total body nodes
 */
export function getTotalBodyNodes() {
  return TOTAL_BODY_NODES;
}

/**
 * Calculate maximum external Socket mounts allowed on a body slot (<= 50% of base socket capacity, where 10 Nodes = 1 Socket).
 * @param {string} bodySlot
 * @returns {number} Max sockets allowed externally (Head: 0, Torso: 2, Arm: 1, Leg: 2)
 */
export function getExternalSocketMax(bodySlot) {
  const baseNodes = getNodeCapacity(bodySlot);
  return Math.floor((baseNodes / 10) * 0.5);
}

/**
 * Convert values across the UDU scale hierarchy.
 * Scale: 10 Nodes = 1 Socket, 10 Sockets = 1 Mount, 10 Mounts = 1 Module
 * @param {'Node'|'Socket'|'Mount'|'Module'} fromTier
 * @param {'Node'|'Socket'|'Mount'|'Module'} toTier
 * @param {number} count - Amount in fromTier
 * @returns {number} Converted amount in toTier
 */
export function convertUDUScale(fromTier, toTier, count) {
  const tiers = ['Node', 'Socket', 'Mount', 'Module'];
  const fromIdx = tiers.indexOf(fromTier);
  const toIdx = tiers.indexOf(toTier);
  const amount = Number(count) || 0;

  if (fromIdx === -1 || toIdx === -1) return amount;
  const powerDiff = toIdx - fromIdx;
  return amount / Math.pow(10, powerDiff);
}

/**
 * Validate a set of installed augmentations or sub-components against a body slot's node budget.
 * @param {string} slot - Body slot name
 * @param {Array<{ name: string, nodes?: number, nodeCost?: number }>} items - Installed components
 * @returns {{ valid: boolean, used: number, max: number, remaining: number, percentUsed: number }}
 */
export function validateNodeAllocation(slot, items = []) {
  const max = getNodeCapacity(slot);
  const used = (Array.isArray(items) ? items : []).reduce((sum, it) => {
    const cost = Number(it?.nodes ?? it?.nodeCost ?? it?.cost_nodes ?? 0);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  const remaining = max - used;
  const percentUsed = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;

  return {
    valid: remaining >= 0,
    used,
    max,
    remaining,
    percentUsed
  };
}

/**
 * Calculate budget and utilization for Tier 1 Sockets (personal weapons, equipment, armor mods).
 * @param {number} maxSlots - Maximum socket capacity
 * @param {number|Array} usedOrItems - Used count or array of installed modifications
 * @returns {{ max: number, used: number, remaining: number, percentUsed: number, isOverBudget: boolean }}
 */
export function calculateSocketBudget(maxSlots, usedOrItems = 0) {
  const max = Math.max(0, Number(maxSlots) || 0);
  const used = Array.isArray(usedOrItems)
    ? usedOrItems.reduce((acc, it) => acc + (Number(it?.sockets ?? it?.socketCost ?? 1) || 1), 0)
    : Math.max(0, Number(usedOrItems) || 0);

  const remaining = max - used;
  const percentUsed = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;

  return {
    max,
    used,
    remaining,
    percentUsed,
    isOverBudget: used > max
  };
}

/**
 * Calculate budget for Tier 2 Mounts (Mecha hardpoints, vehicle weapon mounts).
 * @param {number} maxMounts - Hardpoint mount capacity
 * @param {number|Array} usedOrItems - Mount count or list of mounted subsystems
 * @returns {{ max: number, used: number, remaining: number, percentUsed: number, isOverBudget: boolean }}
 */
export function calculateMountBudget(maxMounts, usedOrItems = 0) {
  const max = Math.max(0, Number(maxMounts) || 0);
  const used = Array.isArray(usedOrItems)
    ? usedOrItems.reduce((acc, it) => acc + (Number(it?.mounts ?? it?.mountCost ?? 1) || 1), 0)
    : Math.max(0, Number(usedOrItems) || 0);

  const remaining = max - used;
  const percentUsed = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;

  return {
    max,
    used,
    remaining,
    percentUsed,
    isOverBudget: used > max
  };
}

/**
 * Calculate budget for Tier 3 Modules (Architecture & Starship facilities).
 * @param {number} maxModules - Total module capacity
 * @param {number|Array} usedOrItems - Installed modules count or list
 * @returns {{ max: number, used: number, remaining: number, percentUsed: number, isOverBudget: boolean }}
 */
export function calculateModuleBudget(maxModules, usedOrItems = 0) {
  const max = Math.max(0, Number(maxModules) || 0);
  const used = Array.isArray(usedOrItems)
    ? usedOrItems.reduce((acc, it) => acc + (Number(it?.modules ?? it?.moduleCost ?? 1) || 1), 0)
    : Math.max(0, Number(usedOrItems) || 0);

  const remaining = max - used;
  const percentUsed = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;

  return {
    max,
    used,
    remaining,
    percentUsed,
    isOverBudget: used > max
  };
}

/**
 * Look up social cybernetic stigma penalty based on total visible modifications.
 * @param {number} totalVisibleMods - Count of visible cybernetic/prosthetic implants
 * @returns {typeof STIGMA_THRESHOLDS[0]} Stigma threshold record
 */
export function getStigmaLevel(totalVisibleMods) {
  const count = Math.max(0, Number(totalVisibleMods) || 0);
  const found = STIGMA_THRESHOLDS.find(s => count >= s.minMods && count <= s.maxMods);
  return found || STIGMA_THRESHOLDS[STIGMA_THRESHOLDS.length - 1];
}

/**
 * Calculate canonical Mecha Garaging UDU requirements (5.04 MECHA.md / 5.07 ARCHITECTURE.md).
 * 1 Module = 10 Mounts:
 * - Medium: 1 Mount (0.1 Mod)
 * - Large: 2 Mounts (0.2 Mod)
 * - Huge: 5 Mounts (0.5 Mod)
 * - Gargantuan: 10 Mounts (1.0 Mod)
 * - Colossal: 20 Mounts (2.0 Mod)
 *
 * @param {'Medium'|'Large'|'Huge'|'Gargantuan'|'Colossal'} size
 * @param {number} count
 * @returns {{ size: string, count: number, mountsRequired: number, modulesRequired: number, unitsPerModule: number, description: string }}
 */
export function calculateMechaGaragingUDU(size = 'Medium', count = 1) {
  const rule = MECHA_GARAGING_RULES[size] || MECHA_GARAGING_RULES.Medium;
  const qty = Math.max(0, Number(count) || 0);
  const mountsRequired = Number((rule.mountsPerUnit * qty).toFixed(2));
  const modulesRequired = Number((rule.modulesPerUnit * qty).toFixed(2));

  return {
    size: rule.size,
    count: qty,
    mountsRequired,
    modulesRequired,
    unitsPerModule: rule.unitsPerModule,
    description: rule.description
  };
}

/**
 * Validate Meta-Tech Socket-to-Invocation Rank capacity (5.06 META-TECH.md).
 * - 10 Nodes / 1 Socket: Max Invocation Rank 10 (Novice/Trained)
 * - 2 Sockets (20 Nodes): Max Invocation Rank 20 (Expert/Master)
 * - 3+ Sockets / 1 Mount / 1 Module: Max Invocation Rank 30 (Grand Master/Pinnacle)
 *
 * @param {object} params
 * @param {number} [params.nodesAllocated=0]
 * @param {number} [params.socketsAllocated=0]
 * @param {number} [params.mountsAllocated=0]
 * @param {number} [params.modulesAllocated=0]
 * @param {number} [params.invocationRank=1]
 */
export function validateMetaTechSocketInvocationCapacity({
  nodesAllocated = 0,
  socketsAllocated = 0,
  mountsAllocated = 0,
  modulesAllocated = 0,
  invocationRank = 1
} = {}) {
  const socketEquivalents =
    (Number(nodesAllocated || 0) / 10) +
    Number(socketsAllocated || 0) +
    (Number(mountsAllocated || 0) * 10) +
    (Number(modulesAllocated || 0) * 100);

  let maxInvocationRank = 0;
  if (socketEquivalents >= 3) {
    maxInvocationRank = 30;
  } else if (socketEquivalents >= 2) {
    maxInvocationRank = 20;
  } else if (socketEquivalents >= 1) {
    maxInvocationRank = 10;
  }

  const reqRank = Math.max(0, Math.round(Number(invocationRank) || 0));
  const requiredSockets = reqRank <= 0 ? 0 : (reqRank <= 10 ? 1 : (reqRank <= 20 ? 2 : 3));

  return {
    valid: reqRank <= maxInvocationRank,
    invocationRank: reqRank,
    socketEquivalents: Number(socketEquivalents.toFixed(2)),
    maxInvocationRank,
    requiredSockets
  };
}
