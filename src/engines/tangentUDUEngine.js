// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — UDU CALCULATION ENGINE
// Universal Displacement Unit (Node, Socket, Mount, Module)
// ═══════════════════════════════════════════════════════════

import {
  UDU_TIERS,
  BODY_SLOT_NODES,
  TOTAL_BODY_NODES,
  STIGMA_THRESHOLDS
} from './tangentConstants.js';

/**
 * Get internal node capacity for an anatomical body slot.
 * @param {'Head'|'Torso'|'LeftArm'|'RightArm'|'LeftLeg'|'RightLeg'} bodySlot
 * @returns {number} Node capacity for that slot
 */
export function getNodeCapacity(bodySlot) {
  return BODY_SLOT_NODES[bodySlot] || 0;
}

/**
 * Get total body node capacity for standard humanoid frame (200).
 * @returns {number} Total body nodes
 */
export function getTotalBodyNodes() {
  return TOTAL_BODY_NODES;
}

/**
 * Calculate maximum external Socket mounts allowed on a body slot (<= 50% of base node capacity).
 * @param {string} bodySlot
 * @returns {number} Max sockets allowed externally
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
