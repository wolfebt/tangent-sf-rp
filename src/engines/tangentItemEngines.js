// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — PHASE 2 ITEM CALCULATION ENGINES
// Pure calculation helpers for Equipment, Weaponry, and Armor
// ═══════════════════════════════════════════════════════════

import {
  EQUIPMENT_SIZES,
  WORKSPACE_SCALES,
  COMPUTER_PR_RATINGS,
  EPR_RATINGS,
  WEAPON_SIZES,
  WEAPON_MODIFICATIONS,
  WEAPON_CAPACITY_UPGRADES,
  WEAPON_DOWNGRADES,
  ARMOR_COVERAGE,
  ARMOR_MATERIALS,
  ARMOR_MODULES,
  MANUFACTURER_SKINS
} from './tangentConstants.js';
import { calculateCreditValue, calculateMaterialCost, calculateAllCraftingTiers, getComplexityTier } from './tangentEconEngine.js';

// ═══════════════════════════════════════════════════════════
// 1. EQUIPMENT FORGE ENGINE (PLAN 17)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates the comprehensive Crafting DC for an equipment item.
 * 
 * @param {object} params
 * @param {number} [params.baseDC] - Base starting DC (defaults to size defaultDC or 10)
 * @param {string} [params.size] - Size category (Fine to Structure)
 * @param {string} [params.workspaceScale] - Tool workspace scale (Belt to Campus)
 * @param {number} [params.computerPR] - Processor rating (0 to 4)
 * @param {number} [params.softwareLevel] - Cumulative software bonuses/ranks
 * @param {number} [params.eprRating] - Environmental Protection Rating (0 to 4)
 * @param {string} [params.skin] - Manufacturer cultural skin
 * @param {number} [params.metaSockets] - Sockets allocated to meta-enhancements
 * @param {boolean} [params.isRare] - Regional rarity modifier (+5 DC)
 * @returns {number} Final Crafting DC (minimum 0)
 */
export function calculateEquipmentDC({
  baseDC,
  size = 'Small',
  workspaceScale,
  computerPR,
  softwareLevel = 0,
  eprRating = 0,
  skin,
  metaSockets = 0,
  isRare = false
} = {}) {
  const sizeDef = EQUIPMENT_SIZES[size] || EQUIPMENT_SIZES.Small;
  let dc = Number(baseDC !== undefined && baseDC !== null && !isNaN(baseDC) ? baseDC : sizeDef.defaultDC);

  // Workspace scale modifier (Tools)
  if (workspaceScale && WORKSPACE_SCALES[workspaceScale]) {
    dc += WORKSPACE_SCALES[workspaceScale].dcMod;
  }

  // Computer Processor Rating (Electronics / Data)
  if (computerPR !== undefined && computerPR !== null && COMPUTER_PR_RATINGS[computerPR]) {
    dc += COMPUTER_PR_RATINGS[computerPR].dcMod;
  }

  // Software bonuses (+5 DC per level)
  if (softwareLevel > 0) {
    dc += Number(softwareLevel) * 5;
  }

  // Environmental Protection Rating (Survival)
  if (eprRating && EPR_RATINGS[eprRating]) {
    dc += EPR_RATINGS[eprRating].dcMod;
  }

  // Meta-Tech Enhancement (+5 DC per allocated socket)
  if (metaSockets > 0) {
    dc += Number(metaSockets) * 5;
  }

  // Manufacturer Cultural Skin DC modifier (e.g. Coalition -5)
  if (skin && MANUFACTURER_SKINS[skin]) {
    dc += MANUFACTURER_SKINS[skin].dcMod;
  }

  // Regional rarity
  if (isRare) {
    dc += 5;
  }

  return Math.max(0, Math.round(dc));
}

/**
 * Calculates base sockets and UDU displacement for equipment.
 */
export function calculateEquipmentSockets(size = 'Small', customSlots = null) {
  const sizeDef = EQUIPMENT_SIZES[size] || EQUIPMENT_SIZES.Small;
  const sockets = customSlots !== null && customSlots !== undefined ? Number(customSlots) : sizeDef.sockets;
  return {
    baseSockets: sizeDef.sockets,
    effectiveSockets: sockets,
    capacityDisplay: sizeDef.capacityDisplay,
    mass: sizeDef.mass
  };
}

/**
 * Computes the full persistent metadata for Equipment on save.
 */
export function computeEquipmentStats(formData) {
  const finalDC = calculateEquipmentDC({
    baseDC: formData.base_dc ?? formData.craft_dc,
    size: formData.size || 'Small',
    workspaceScale: formData.workspace_scale,
    computerPR: formData.computer_pr,
    softwareLevel: formData.software_level || 0,
    eprRating: formData.epr_rating || 0,
    skin: formData.skin || formData.faction_skin,
    metaSockets: formData.meta_sockets || 0,
    isRare: !!formData.is_rare
  });

  const creditValue = calculateCreditValue(finalDC);
  const materialCost = calculateMaterialCost(creditValue);
  const sizeDef = EQUIPMENT_SIZES[formData.size || 'Small'] || EQUIPMENT_SIZES.Small;

  return {
    final_dc: finalDC,
    credit_value: creditValue,
    material_cost: materialCost,
    ws_threshold: finalDC,
    complexity_tier: getComplexityTier(finalDC),
    crafting_days: calculateAllCraftingTiers(creditValue),
    udu_displacement: {
      tier: sizeDef.mounts ? 'Mount' : (sizeDef.modules ? 'Module' : (sizeDef.sockets === 0 ? 'Node' : 'Socket')),
      count: sizeDef.sockets || sizeDef.nodes || 1
    },
    computed_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════
// 2. WEAPONRY FORGE ENGINE (PLAN 18)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates the comprehensive final Crafting DC for Weaponry.
 * 
 * @param {object} params
 * @param {number} [params.baseDC] - Base starting DC (default 15 for weapon)
 * @param {Array<string|object>} [params.modifications] - List of applied mod IDs or objects
 * @param {Array<string|object>} [params.downgrades] - List of applied flaw/downgrade IDs or objects
 * @param {string} [params.capacityUpgrade] - Capacity tier (typical, double, triple, pack, canister, hopper)
 * @param {string} [params.skin] - Manufacturer cultural skin
 * @param {number} [params.metaRanks] - Invocation ranks or passive sockets
 * @param {number} [params.tl] - Tech Level
 * @param {boolean} [params.isRare] - Regional rarity modifier (+5 DC)
 * @returns {number} Final weapon Crafting DC
 */
export function calculateWeaponDC({
  baseDC = 15,
  modifications = [],
  downgrades = [],
  capacityUpgrade = 'typical',
  skin,
  metaRanks = 0,
  tl = 3,
  isRare = false
} = {}) {
  let dc = Number(baseDC ?? 15) || 15;

  // Add Modification DCs
  if (Array.isArray(modifications)) {
    modifications.forEach(mod => {
      if (typeof mod === 'object' && mod !== null) {
        dc += Number(mod.dcMod ?? mod.dc_modifier ?? 0);
      } else if (typeof mod === 'string') {
        const found = WEAPON_MODIFICATIONS.find(m => m.id === mod || m.name === mod);
        if (found) dc += found.dcMod;
      }
    });
  }

  // Add Downgrades (reduces DC)
  if (Array.isArray(downgrades)) {
    downgrades.forEach(dw => {
      if (typeof dw === 'object' && dw !== null) {
        dc += Number(dw.dcMod ?? dw.dc_modifier ?? 0);
      } else if (typeof dw === 'string') {
        const found = WEAPON_DOWNGRADES.find(d => d.id === dw || d.name === dw);
        if (found) dc += found.dcMod;
      }
    });
  }

  // Capacity upgrade DC
  if (capacityUpgrade) {
    const capDef = WEAPON_CAPACITY_UPGRADES.find(c => c.id === capacityUpgrade || c.name === capacityUpgrade);
    if (capDef) {
      dc += capDef.dcMod;
    }
  }

  // Meta-Tech Imbuements (15 + Rank + TL Mod) or Enhancements (+5 per socket)
  if (metaRanks > 0) {
    const tlMod = tl >= 5 ? 5 : (tl >= 4 ? 2 : 0);
    dc += (15 + Number(metaRanks) + tlMod);
  }

  // Manufacturer Cultural Skin DC modifier
  if (skin && MANUFACTURER_SKINS[skin]) {
    dc += MANUFACTURER_SKINS[skin].dcMod;
  }

  // Regional rarity
  if (isRare) {
    dc += 5;
  }

  return Math.max(0, Math.round(dc));
}

/**
 * Calculates Weapon Socket budget usage.
 * 
 * @param {string|number} sizeOrSockets - Size category name or numeric socket count
 * @param {Array<string|object>} modifications - Applied modifications
 * @returns {{ baseSockets: number, usedSockets: number, remainingSockets: number, isOverBudget: boolean }}
 */
export function calculateWeaponSockets(sizeOrSockets = 'Medium', modifications = []) {
  let baseSockets = 4;
  if (typeof sizeOrSockets === 'number') {
    baseSockets = sizeOrSockets;
  } else if (typeof sizeOrSockets === 'string') {
    if (WEAPON_SIZES[sizeOrSockets]) {
      baseSockets = WEAPON_SIZES[sizeOrSockets].sockets;
    } else if (EQUIPMENT_SIZES[sizeOrSockets]) {
      baseSockets = EQUIPMENT_SIZES[sizeOrSockets].sockets;
    }
  }

  let usedSockets = 0;
  if (Array.isArray(modifications)) {
    modifications.forEach(mod => {
      if (typeof mod === 'object' && mod !== null) {
        usedSockets += Number(mod.sockets ?? 0);
      } else if (typeof mod === 'string') {
        const found = WEAPON_MODIFICATIONS.find(m => m.id === mod || m.name === mod);
        if (found) usedSockets += found.sockets;
      }
    });
  }

  return {
    baseSockets,
    usedSockets,
    remainingSockets: baseSockets - usedSockets,
    isOverBudget: usedSockets > baseSockets
  };
}

/**
 * Computes persistent metadata for Weaponry on save.
 */
export function computeWeaponStats(formData) {
  const finalDC = calculateWeaponDC({
    baseDC: formData.base_dc ?? formData.craft_dc ?? 15,
    modifications: formData.modifications || [],
    downgrades: formData.downgrades || [],
    capacityUpgrade: formData.capacity_upgrade || 'typical',
    skin: formData.faction_skin || formData.skin,
    metaRanks: formData.meta_ranks || 0,
    tl: Number(formData.tl ?? 3),
    isRare: !!formData.is_rare
  });

  const creditValue = calculateCreditValue(finalDC);
  const materialCost = calculateMaterialCost(creditValue);
  const socketStats = calculateWeaponSockets(formData.size || formData.component_slots || 4, formData.modifications || []);

  return {
    final_dc: finalDC,
    credit_value: creditValue,
    material_cost: materialCost,
    ws_threshold: finalDC,
    complexity_tier: getComplexityTier(finalDC),
    crafting_days: calculateAllCraftingTiers(creditValue),
    socket_budget: socketStats,
    udu_displacement: {
      tier: 'Socket',
      count: socketStats.baseSockets
    },
    computed_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════
// 3. ARMOR FORGE ENGINE (PLAN 19)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates the total Structure Points (SP) for Armor.
 * Formula: (Base SP * Coverage SP Mult) * Material SP Mult * Skin SP Multiplier
 * 
 * @param {object} params
 * @param {number} [params.baseSP] - Base SP from size category
 * @param {string} [params.size] - Armor size tier (Lightweight, Mediumweight, Heavyweight, Mecha)
 * @param {string} [params.coverage] - Coverage mode (Partial, Standard, Sealed, Reinforced, Bulwark)
 * @param {number} [params.tl] - Tech Level (0-5)
 * @param {string} [params.skin] - Manufacturer cultural skin
 * @returns {number} Final computed SP
 */
export function calculateArmorSP({
  baseSP,
  size = 'Mediumweight',
  coverage = 'Standard',
  tl = 3,
  skin
} = {}) {
  let startingSP = 20;
  if (baseSP !== undefined && baseSP !== null && !isNaN(baseSP)) {
    startingSP = Number(baseSP);
  } else if (size) {
    if (size === 'Jewelry' || size === 'Fine') startingSP = 2;
    else if (size === 'Device' || size === 'Diminutive') startingSP = 5;
    else if (size === 'Lightweight' || size === 'Tiny') startingSP = 10;
    else if (size === 'Mediumweight' || size === 'Small') startingSP = 20;
    else if (size === 'Heavyweight' || size === 'Medium') startingSP = 40;
    else if (size === 'Mecha') startingSP = 100;
  }

  const covDef = ARMOR_COVERAGE[coverage] || ARMOR_COVERAGE.Standard;
  const matDef = ARMOR_MATERIALS[tl] || ARMOR_MATERIALS[3];

  let sp = (startingSP * covDef.spMult) * matDef.spMult;

  // Dracon Dynasty skin grants +20% SP (+1 inherent DR)
  if (skin === 'Dracon') {
    sp *= 1.2;
  }
  // Coalition Rig skin grants Rugged (+1 SP multiplier)
  if (skin === 'Coalition') {
    sp += startingSP;
  }

  return Math.max(1, Math.round(sp));
}

/**
 * Calculates effective Damage Resistance (DR) for Armor.
 * 
 * @param {object} params
 * @param {number} [params.baseDR] - Base DR value (default 0 or standard per tier)
 * @param {number} [params.tl] - Tech Level (0-5)
 * @param {string} [params.skin] - Manufacturer cultural skin
 * @returns {{ drPercent: number, totalDR: number, description: string }}
 */
export function calculateArmorDR({
  baseDR = 0,
  tl = 3,
  skin
} = {}) {
  const matDef = ARMOR_MATERIALS[tl] || ARMOR_MATERIALS[3];
  let flatDR = Number(baseDR || 0);

  // Skin DR bonuses
  if (skin === 'Impyrium') {
    flatDR += 2; // Archeotech +2 DR
  } else if (skin === 'Dracon') {
    flatDR += 1; // Bulwark +1 DR
  }

  return {
    drPercent: matDef.drPercent,
    flatBonus: flatDR,
    totalDR: flatDR,
    passiveTrait: matDef.passive
  };
}

/**
 * Calculates the comprehensive final Crafting DC for Armor.
 * 
 * @param {object} params
 * @param {number} [params.baseDC] - Base starting DC
 * @param {string} [params.size] - Armor size tier
 * @param {string} [params.coverage] - Coverage mode
 * @param {Array<string|object>} [params.modules] - Installed socket modules
 * @param {Array<string|object>} [params.downgrades] - Applied flaws / downgrades
 * @param {string} [params.skin] - Manufacturer cultural skin
 * @param {boolean} [params.isRare] - Regional rarity modifier (+5 DC)
 * @returns {number} Final armor Crafting DC
 */
export function calculateArmorDC({
  baseDC,
  size = 'Mediumweight',
  coverage = 'Standard',
  modules = [],
  downgrades = [],
  skin,
  isRare = false
} = {}) {
  let dc = 15;
  if (baseDC !== undefined && baseDC !== null && !isNaN(baseDC)) {
    dc = Number(baseDC);
  } else if (size) {
    if (size === 'Jewelry' || size === 'Fine') dc = 5;
    else if (size === 'Device' || size === 'Diminutive') dc = 5;
    else if (size === 'Lightweight' || size === 'Tiny') dc = 10;
    else if (size === 'Mediumweight' || size === 'Small') dc = 15;
    else if (size === 'Heavyweight' || size === 'Medium') dc = 20;
    else if (size === 'Mecha') dc = 30;
  }

  // Coverage DC modifier
  const covDef = ARMOR_COVERAGE[coverage] || ARMOR_COVERAGE.Standard;
  dc += covDef.dcMod;

  // Module DC modifiers
  if (Array.isArray(modules)) {
    modules.forEach(mod => {
      if (typeof mod === 'object' && mod !== null) {
        dc += Number(mod.dcMod ?? mod.dc_modifier ?? 0);
      } else if (typeof mod === 'string') {
        const found = ARMOR_MODULES.find(m => m.id === mod || m.name === mod);
        if (found) dc += found.dcMod;
      }
    });
  }

  // Downgrade DC reductions (-5 per voluntary flaw)
  if (Array.isArray(downgrades)) {
    downgrades.forEach(dw => {
      if (typeof dw === 'object' && dw !== null) {
        dc += Number(dw.dcMod ?? -5);
      } else if (typeof dw === 'string') {
        dc -= 5;
      }
    });
  }

  // Manufacturer Cultural Skin DC modifier
  if (skin && MANUFACTURER_SKINS[skin]) {
    dc += MANUFACTURER_SKINS[skin].dcMod;
  }

  // Regional rarity
  if (isRare) {
    dc += 5;
  }

  return Math.max(0, Math.round(dc));
}

/**
 * Calculates Armor Mobility impacts (Max Dex modifier and movement penalty).
 */
export function calculateArmorMobility({
  size = 'Mediumweight',
  coverage = 'Standard',
  skin
} = {}) {
  let baseMaxDex = 4;
  if (size === 'Jewelry' || size === 'Device') baseMaxDex = 6;
  else if (size === 'Lightweight') baseMaxDex = 5;
  else if (size === 'Mediumweight') baseMaxDex = 4;
  else if (size === 'Heavyweight') baseMaxDex = 2;
  else if (size === 'Mecha') baseMaxDex = 0;

  const covDef = ARMOR_COVERAGE[coverage] || ARMOR_COVERAGE.Standard;
  let maxDex = baseMaxDex + covDef.mobilityPenalty;
  let movePenalty = covDef.movePenalty;

  // Kitin skin makes armor count as 1 category lighter
  if (skin === 'Kitin') {
    maxDex = Math.min(6, maxDex + 1);
    movePenalty = Math.min(0, movePenalty + 5);
  }
  // Coalition skin is cumbersome (-1 Max Dex)
  if (skin === 'Coalition') {
    maxDex = Math.max(0, maxDex - 1);
  }

  return {
    maxDex: Math.max(0, maxDex),
    movePenalty
  };
}

/**
 * Calculates Armor Sockets budget.
 */
export function calculateArmorSockets({
  size = 'Mediumweight',
  coverage = 'Standard',
  modules = []
} = {}) {
  let baseSockets = 4;
  if (size === 'Jewelry') baseSockets = 0;
  else if (size === 'Device') baseSockets = 1;
  else if (size === 'Lightweight') baseSockets = 2;
  else if (size === 'Mediumweight') baseSockets = 4;
  else if (size === 'Heavyweight') baseSockets = 8;
  else if (size === 'Mecha') baseSockets = 10;

  const covDef = ARMOR_COVERAGE[coverage] || ARMOR_COVERAGE.Standard;
  const totalSockets = Math.max(1, Math.floor(baseSockets * covDef.socketMult));

  let usedSockets = 0;
  if (Array.isArray(modules)) {
    modules.forEach(mod => {
      if (typeof mod === 'object' && mod !== null) {
        usedSockets += Number(mod.sockets ?? 0);
      } else if (typeof mod === 'string') {
        const found = ARMOR_MODULES.find(m => m.id === mod || m.name === mod);
        if (found) usedSockets += found.sockets;
      }
    });
  }

  return {
    baseSockets: totalSockets,
    usedSockets,
    remainingSockets: totalSockets - usedSockets,
    isOverBudget: usedSockets > totalSockets
  };
}

/**
 * Computes persistent metadata for Armor on save.
 */
export function computeArmorStats(formData) {
  const finalDC = calculateArmorDC({
    baseDC: formData.base_dc ?? formData.craft_dc,
    size: formData.size || formData.category || 'Mediumweight',
    coverage: formData.coverage || 'Standard',
    modules: formData.modules || [],
    downgrades: formData.downgrades || [],
    skin: formData.faction_skin || formData.skin,
    isRare: !!formData.is_rare
  });

  const finalSP = calculateArmorSP({
    baseSP: formData.durability ?? formData.sp_rating,
    size: formData.size || formData.category || 'Mediumweight',
    coverage: formData.coverage || 'Standard',
    tl: Number(formData.tl ?? 3),
    skin: formData.faction_skin || formData.skin
  });

  const drStats = calculateArmorDR({
    baseDR: formData.dr_rating,
    tl: Number(formData.tl ?? 3),
    skin: formData.faction_skin || formData.skin
  });

  const mobilityStats = calculateArmorMobility({
    size: formData.size || formData.category || 'Mediumweight',
    coverage: formData.coverage || 'Standard',
    skin: formData.faction_skin || formData.skin
  });

  const socketStats = calculateArmorSockets({
    size: formData.size || formData.category || 'Mediumweight',
    coverage: formData.coverage || 'Standard',
    modules: formData.modules || []
  });

  const creditValue = calculateCreditValue(finalDC);
  const materialCost = calculateMaterialCost(creditValue);

  return {
    final_dc: finalDC,
    final_sp: finalSP,
    total_dr: drStats.totalDR,
    dr_percent: drStats.drPercent,
    max_dex: mobilityStats.maxDex,
    move_penalty: mobilityStats.movePenalty,
    credit_value: creditValue,
    material_cost: materialCost,
    ws_threshold: finalDC,
    complexity_tier: getComplexityTier(finalDC),
    crafting_days: calculateAllCraftingTiers(creditValue),
    socket_budget: socketStats,
    udu_displacement: {
      tier: 'Socket',
      count: socketStats.baseSockets
    },
    computed_at: new Date().toISOString()
  };
}
