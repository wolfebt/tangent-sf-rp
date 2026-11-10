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
  ARMOR_DOWNGRADES,
  MANUFACTURER_SKINS
} from './tangentConstants.js';
import { 
  calculateCreditValue, 
  calculateCRFromCredits,
  calculateDCFromCredits,
  resolveItemCostCR,
  resolveItemCostDC,
  calculateMaterialCost, 
  calculateScrapMassRequired,
  calculateAllCraftingTiers, 
  getComplexityTier 
} from './tangentEconEngine.js';

export {
  calculateCreditValue,
  calculateCRFromCredits,
  calculateDCFromCredits,
  resolveItemCostCR,
  resolveItemCostDC,
  calculateScrapMassRequired
};

/**
 * Diminishing Returns Armor Stacking:
 * Base = highest DR layer. Each additional positive layer d_i adds ceil(d_i / 5), calculated separately per layer.
 * @param {Array<number|object>} [armorLayers=[]] - Array of DR values or layer objects
 * @returns {{ highestDR: number, bonusDR: number, totalDR: number, layerBreakdowns: Array<{ rawDR: number, effectiveDR: number, isPrimary: boolean }> }}
 */
export function calculateStackedArmorDR(armorLayers = []) {
  if (!Array.isArray(armorLayers) || armorLayers.length === 0) {
    return { highestDR: 0, bonusDR: 0, totalDR: 0, layerBreakdowns: [] };
  }

  const numericLayers = armorLayers
    .map(layer => {
      if (typeof layer === 'number') return layer;
      if (layer && typeof layer === 'object') {
        return Number(layer.totalDR ?? layer.dr ?? layer.dr_rating ?? layer.value ?? 0);
      }
      return Number(layer) || 0;
    })
    .filter(n => Number.isFinite(n) && n > 0)
    .sort((a, b) => b - a);

  if (numericLayers.length === 0) {
    return { highestDR: 0, bonusDR: 0, totalDR: 0, layerBreakdowns: [] };
  }

  const [highest, ...rest] = numericLayers;
  const layerBreakdowns = [
    { rawDR: highest, effectiveDR: highest, isPrimary: true }
  ];

  let bonusDR = 0;
  for (const d of rest) {
    const layerBonus = Math.ceil(d / 5);
    bonusDR += layerBonus;
    layerBreakdowns.push({ rawDR: d, effectiveDR: layerBonus, isPrimary: false });
  }

  return {
    highestDR: highest,
    bonusDR,
    totalDR: highest + bonusDR,
    layerBreakdowns
  };
}

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
  const hasComputerPR = computerPR !== undefined && computerPR !== null && computerPR !== '';
  const prNum = hasComputerPR ? Math.max(0, Math.min(4, Number(computerPR) || 0)) : null;

  let dc;
  if (baseDC !== undefined && baseDC !== null && !isNaN(baseDC)) {
    dc = Number(baseDC);
    if (hasComputerPR) {
      dc += 5 * prNum;
    }
  } else if (hasComputerPR) {
    // Canonical Computer PR base CR: size baseline defaultDC + 5 * PR
    dc = sizeDef.defaultDC + (5 * prNum);
  } else if (workspaceScale && WORKSPACE_SCALES[workspaceScale] && WORKSPACE_SCALES[workspaceScale].dc !== undefined) {
    dc = sizeDef.defaultDC + WORKSPACE_SCALES[workspaceScale].dcMod;
  } else {
    dc = sizeDef.defaultDC;
  }

  // Workspace scale modifier (Tools) when baseDC was explicitly provided or size baseline used
  if (workspaceScale && WORKSPACE_SCALES[workspaceScale] && (baseDC !== undefined && baseDC !== null && !isNaN(baseDC))) {
    dc += WORKSPACE_SCALES[workspaceScale].dcMod;
  }

  // Software bonuses (+5 CR per Rank, clamped <= Computer PR when PR is present)
  if (softwareLevel > 0) {
    const rawSoftRank = Number(softwareLevel) || 0;
    const effectiveSoftRank = hasComputerPR ? Math.min(rawSoftRank, prNum) : rawSoftRank;
    dc += effectiveSoftRank * 5;
  }

  // Environmental Protection Rating (Survival, EPR 0-3)
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

export const calculateEquipmentCR = calculateEquipmentDC;

/**
 * Computes the full persistent metadata for Equipment on save.
 */
export function computeEquipmentStats(formData) {
  const formulaDC = calculateEquipmentDC({
    baseDC: formData.base_cr ?? formData.base_dc ?? formData.craft_cr ?? formData.craft_dc,
    size: formData.size || 'Small',
    workspaceScale: formData.workspace_scale,
    computerPR: formData.computer_pr,
    softwareLevel: formData.software_level || 0,
    eprRating: formData.epr_rating || 0,
    skin: formData.skin || formData.faction_skin,
    metaSockets: formData.meta_sockets || 0,
    isRare: !!formData.is_rare
  });
  const finalDC = formulaDC;

  const creditValue = calculateCreditValue(finalDC, { hasFlaw: Array.isArray(formData.downgrades) && formData.downgrades.length > 0 });
  const materialCost = calculateMaterialCost(creditValue);
  const scrapMassRequired = calculateScrapMassRequired(creditValue);
  const sizeDef = EQUIPMENT_SIZES[formData.size || 'Small'] || EQUIPMENT_SIZES.Small;

  return {
    final_cr: finalDC,
    final_dc: finalDC,
    craft_cr: finalDC,
    craft_dc: finalDC,
    formula_dc: formulaDC,
    credit_value: creditValue,
    material_cost: materialCost,
    scrap_mass_required: scrapMassRequired,
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
  let dc = (baseDC !== undefined && baseDC !== null && baseDC !== '' && !Number.isNaN(Number(baseDC)))
    ? Number(baseDC)
    : 15;

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

  // Meta-Tech Imbuements (15 + Rank + TL Mod) without double-counting the 15 base weapon CR
  if (metaRanks > 0) {
    const tlMod = tl >= 5 ? 5 : (tl >= 4 ? 2 : 0);
    const metaCR = 15 + Number(metaRanks) + tlMod;
    dc = Math.max(dc, metaCR) + (dc > 15 ? dc - 15 : 0);
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
 * @param {string|number|object} sizeOrSockets - Size category name, numeric socket count, or options object
 * @param {Array<string|object>} [modifications=[]] - Applied modifications
 * @param {number} [metaRanks=0] - Meta-Tech invocation ranks (1 Socket per 10 Ranks, rounded up)
 * @returns {{ baseSockets: number, usedSockets: number, remainingSockets: number, isOverBudget: boolean }}
 */
export function calculateWeaponSockets(sizeOrSockets = 'Medium', modifications = [], metaRanks = 0) {
  let resolvedSize = sizeOrSockets;
  let resolvedMods = modifications;
  let resolvedMetaRanks = metaRanks;

  if (sizeOrSockets && typeof sizeOrSockets === 'object' && !Array.isArray(sizeOrSockets)) {
    resolvedSize = sizeOrSockets.size ?? sizeOrSockets.baseSockets ?? 'Medium';
    resolvedMods = sizeOrSockets.modifications ?? [];
    resolvedMetaRanks = sizeOrSockets.metaRanks ?? sizeOrSockets.meta_ranks ?? 0;
  }

  let baseSockets = 4;
  if (typeof resolvedSize === 'number') {
    baseSockets = resolvedSize;
  } else if (typeof resolvedSize === 'string') {
    if (WEAPON_SIZES[resolvedSize]) {
      baseSockets = WEAPON_SIZES[resolvedSize].sockets;
    } else if (EQUIPMENT_SIZES[resolvedSize]) {
      baseSockets = EQUIPMENT_SIZES[resolvedSize].sockets;
    }
  }

  let usedSockets = 0;
  if (Array.isArray(resolvedMods)) {
    resolvedMods.forEach(mod => {
      if (typeof mod === 'object' && mod !== null) {
        usedSockets += Number(mod.sockets ?? 0);
      } else if (typeof mod === 'string') {
        const found = WEAPON_MODIFICATIONS.find(m => m.id === mod || m.name === mod);
        if (found) usedSockets += found.sockets;
      }
    });
  }

  if (Number(resolvedMetaRanks) > 0) {
    usedSockets += Math.ceil(Number(resolvedMetaRanks) / 10);
  }

  return {
    baseSockets,
    usedSockets,
    remainingSockets: baseSockets - usedSockets,
    isOverBudget: usedSockets > baseSockets
  };
}

export const calculateWeaponCR = calculateWeaponDC;

/**
 * Computes persistent metadata for Weaponry on save.
 */
export function computeWeaponStats(formData) {
  const finalDC = calculateWeaponDC({
    baseDC: formData.base_cr ?? formData.craft_cr ?? formData.base_dc ?? formData.craft_dc ?? 15,
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
  const scrapMassRequired = calculateScrapMassRequired(creditValue);
  const socketStats = calculateWeaponSockets(
    formData.size || formData.component_slots || 4,
    formData.modifications || [],
    formData.meta_ranks || 0
  );

  return {
    final_cr: finalDC,
    final_dc: finalDC,
    craft_cr: finalDC,
    craft_dc: finalDC,
    formula_dc: finalDC,
    credit_value: creditValue,
    material_cost: materialCost,
    scrap_mass_required: scrapMassRequired,
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
  // Coalition skin reduces SP by 25% (x0.75 SP)
  if (skin === 'Coalition') {
    sp *= 0.75;
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

  // Downgrade DC reductions
  if (Array.isArray(downgrades)) {
    downgrades.forEach(dw => {
      if (typeof dw === 'object' && dw !== null) {
        dc += Number(dw.dcMod ?? dw.dc_modifier ?? -2);
      } else if (typeof dw === 'string') {
        const found = Array.isArray(ARMOR_DOWNGRADES)
          ? ARMOR_DOWNGRADES.find(d => d.id === dw || d.name === dw)
          : ARMOR_DOWNGRADES?.[dw];
        dc += found ? Number(found.dcMod ?? -2) : -5;
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
 * Calculates Armor Mobility impacts (Max Agi modifier and movement penalty).
 */
export function calculateArmorMobility({
  size = 'Mediumweight',
  coverage = 'Standard',
  skin
} = {}) {
  let baseMaxDex = 4;
  if (size === 'Jewelry' || size === 'Device' || size === 'Fine' || size === 'Diminutive') baseMaxDex = 6;
  else if (size === 'Lightweight' || size === 'Tiny') baseMaxDex = 5;
  else if (size === 'Mediumweight' || size === 'Small') baseMaxDex = 4;
  else if (size === 'Heavyweight' || size === 'Medium') baseMaxDex = 2;
  else if (size === 'Mecha') baseMaxDex = 0;

  const covDef = ARMOR_COVERAGE[coverage] || ARMOR_COVERAGE.Standard;
  let mobilityPenalty = Number(covDef.mobilityPenalty || 0);
  let movePenalty = Number(covDef.movePenalty || 0);

  // Kitin skin reduces mobilityPenalty by 1 step toward 0 without shifting the chassis baseMaxDex
  if (skin === 'Kitin') {
    if (mobilityPenalty < 0) {
      mobilityPenalty = Math.min(0, mobilityPenalty + 1);
    }
    if (movePenalty < 0) {
      movePenalty = Math.min(0, movePenalty + 5);
    }
  }

  let maxDex = baseMaxDex + mobilityPenalty;

  // Coalition skin is cumbersome (-1 Max Agi, -1 mobilityPenalty)
  if (skin === 'Coalition') {
    mobilityPenalty -= 1;
    maxDex = Math.max(0, maxDex - 1);
  }

  return {
    baseMaxDex,
    mobilityPenalty,
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

export const calculateArmorCR = calculateArmorDC;

/**
 * Computes persistent metadata for Armor on save.
 */
export function computeArmorStats(formData = {}) {
  const resolvedSize = formData.size || formData.category || 'Mediumweight';
  const resolvedCoverage = formData.coverage || 'Standard';
  const resolvedSkin = formData.faction_skin || formData.skin;
  const resolvedTL = Number(formData.tl ?? formData.tech_level ?? 3);

  const formulaDC = calculateArmorDC({
    baseDC: formData.base_cr ?? formData.base_dc ?? formData.baseDC,
    size: resolvedSize,
    coverage: resolvedCoverage,
    modules: formData.modules || [],
    downgrades: formData.downgrades || [],
    skin: resolvedSkin,
    isRare: !!(formData.is_rare ?? formData.isRare)
  });

  const hasExplicitBase = formData.base_cr !== undefined || formData.base_dc !== undefined || formData.baseDC !== undefined;
  const finalDC = (!hasExplicitBase && (formData.craft_dc !== undefined || formData.craft_cr !== undefined))
    ? Number(formData.craft_dc ?? formData.craft_cr)
    : formulaDC;

  const finalSP = calculateArmorSP({
    baseSP: formData.durability ?? formData.sp_rating ?? formData.baseSP,
    size: resolvedSize,
    coverage: resolvedCoverage,
    tl: resolvedTL,
    skin: resolvedSkin
  });

  const drStats = calculateArmorDR({
    baseDR: formData.dr_rating ?? formData.baseDR,
    tl: resolvedTL,
    skin: resolvedSkin
  });

  const mobilityStats = calculateArmorMobility({
    size: resolvedSize,
    coverage: resolvedCoverage,
    skin: resolvedSkin
  });

  const socketStats = calculateArmorSockets({
    size: resolvedSize,
    coverage: resolvedCoverage,
    modules: formData.modules || []
  });

  const creditValue = calculateCreditValue(finalDC);
  const materialCost = calculateMaterialCost(creditValue);
  const scrapMassRequired = calculateScrapMassRequired(creditValue);

  return {
    final_cr: finalDC,
    final_dc: finalDC,
    craft_cr: finalDC,
    craft_dc: finalDC,
    formula_dc: formulaDC,
    final_sp: finalSP,
    sp: finalSP,
    total_dr: drStats.totalDR,
    dr: drStats.totalDR,
    dr_percent: drStats.drPercent,
    max_dex: mobilityStats.maxDex,
    maxDex: mobilityStats.maxDex,
    mobility_penalty: mobilityStats.mobilityPenalty,
    mobilityPenalty: mobilityStats.mobilityPenalty,
    move_penalty: mobilityStats.movePenalty,
    movePenalty: mobilityStats.movePenalty,
    credit_value: creditValue,
    material_cost: materialCost,
    scrap_mass_required: scrapMassRequired,
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

export const calculateArmorStats = computeArmorStats;
