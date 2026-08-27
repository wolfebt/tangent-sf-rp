// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — PHASE 3 COMPLEX ENTITY CALCULATION ENGINES
// Pure calculation helpers for Augmentations, Mecha, & Architecture
// ═══════════════════════════════════════════════════════════

import {
  ANATOMICAL_BODY_SLOTS,
  AUGMENTATION_CATEGORIES,
  FBC_PACKAGES,
  STIGMA_LEVELS_DETAILED,
  MECHA_SIZES,
  MECHA_FRAMES,
  MECHA_PROPULSION,
  MECHA_ARMOR_TYPES,
  MECHA_MODULES,
  MECHA_COMPONENTS,
  VFT_MODES,
  ARCHITECTURE_FOOTPRINTS,
  HEIGHT_CLASSES,
  ARCHITECTURE_FRAME_TYPES,
  ARCHITECTURE_MATERIALS,
  ENVIRONMENTAL_MODIFIERS,
  ARCHITECTURE_HARDPOINTS_ARMOR,
  ARCHITECTURE_HARDPOINTS_WEAPONS,
  ARCHITECTURE_HARDPOINTS_SENSORS,
  ARCHITECTURE_FACILITIES,
  ARCHITECTURE_CORE_INTERNALS,
  ARCHITECTURE_PROPULSION,
  FACTION_ARCHITECTURAL_PARADIGMS,
  MECHA_GARAGING_RULES,
  MANUFACTURER_SKINS,
  TOOL_TIERS,
  MOVEMENT_MODES_AND_PACES,
  MOVEMENT_FATIGUE_SYSTEM,
  FLYING_COMBAT_RULES,
  SPECIALIZED_MODULE_CATALOG
} from './tangentConstants.js';

import {
  calculateCreditValue,
  calculateMaterialCost,
  calculateAllCraftingTiers,
  getComplexityTier
} from './tangentEconEngine.js';

// ═══════════════════════════════════════════════════════════
// 1. AUGMENTATIONS FORGE ENGINE (PLAN 20)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates the comprehensive Crafting/Surgical DC for an augmentation.
 * 
 * @param {object} params
 * @param {number} [params.baseDC] - Base starting DC
 * @param {string} [params.category] - Category ID
 * @param {string} [params.location] - Anatomical slot ID
 * @param {number} [params.tl] - Tech Level (0-5)
 * @param {number} [params.ml] - Meta Level (0-5)
 * @param {string} [params.skin] - Manufacturer cultural skin
 * @param {boolean} [params.isFBC] - Full Body Conversion flag
 * @param {string} [params.fbcPackage] - FBC package tier
 * @param {boolean} [params.isPseudo] - Pseudo-cybernetics wearable flag
 * @param {Array<object|string>} [params.subMods] - Sub-modifications or upgrades
 * @returns {number} Final Crafting/Surgical DC
 */
export function calculateAugmentationDC({
  baseDC,
  category = 'body_mod',
  location = 'Torso',
  tl = 3,
  ml = 0,
  skin,
  isFBC = false,
  fbcPackage = 'Civilian',
  isPseudo = false,
  subMods = []
} = {}) {
  let dc = 15;

  if (isFBC && FBC_PACKAGES[fbcPackage]) {
    dc = FBC_PACKAGES[fbcPackage].baseDC;
  } else if (baseDC !== undefined && baseDC !== null && !isNaN(baseDC)) {
    dc = Number(baseDC);
  } else if (AUGMENTATION_CATEGORIES[category]) {
    if (category === 'fashionware') dc = 10;
    else if (category === 'synth_limb') dc = 20;
    else if (category === 'hand_foot' || category === 'limb_upgrade') dc = 15;
    else if (category === 'exotic_limb') dc = 25;
    else if (category === 'body_mod' || category === 'sensory' || category === 'brain') dc = 20;
    else if (category === 'tl4_bioware') dc = 25;
    else if (category === 'tl5_nanotech') dc = 30;
    else if (category === 'meta_aug') dc = 20 + Number(ml || 0) * 2;
    else dc = 15;
  }

  // Sub-modifications
  if (Array.isArray(subMods)) {
    for (const mod of subMods) {
      if (typeof mod === 'object' && mod.dcMod) {
        dc += Number(mod.dcMod);
      }
    }
  }

  // Manufacturer Skin DC modifier
  if (skin && MANUFACTURER_SKINS[skin]) {
    dc += MANUFACTURER_SKINS[skin].dcMod;
  }

  return Math.max(0, Math.round(dc));
}

/**
 * Calculates node displacement and checks body slot capacity.
 */
export function calculateAugmentationNodes({
  location = 'Torso',
  category = 'body_mod',
  nodeCost = null,
  isPseudo = false,
  isFBC = false
} = {}) {
  const slotDef = ANATOMICAL_BODY_SLOTS[location] || ANATOMICAL_BODY_SLOTS.Torso;
  let maxCapacity = slotDef.maxNodes;

  if (isPseudo) {
    // Pseudo-cybernetics provides half node capacity
    if (location === 'Head') maxCapacity = 5;
    else if (location === 'Torso') maxCapacity = 25;
    else if (location === 'LeftArm' || location === 'RightArm') maxCapacity = 8;
    else if (location === 'LeftLeg' || location === 'RightLeg') maxCapacity = 10;
    else maxCapacity = 100;
  } else if (isFBC) {
    maxCapacity = 200;
  }

  let nodesConsumed = 0;
  if (isFBC) {
    nodesConsumed = 200;
  } else if (nodeCost !== null && nodeCost !== undefined && !isNaN(nodeCost)) {
    nodesConsumed = Number(nodeCost);
  } else if (AUGMENTATION_CATEGORIES[category]) {
    nodesConsumed = AUGMENTATION_CATEGORIES[category].defaultNodes;
  }

  const isOverBudget = nodesConsumed > maxCapacity;
  const remainingNodes = maxCapacity - nodesConsumed;

  return {
    location,
    maxCapacity,
    nodesConsumed,
    remainingNodes,
    isOverBudget,
    isHardened: !!slotDef.isHardened
  };
}

/**
 * Calculates Build Points (BP) biological tolerance cost.
 */
export function calculateAugmentationBP({
  category = 'body_mod',
  customBP = null,
  tl = 3,
  isFBC = false,
  fbcPackage = 'Civilian'
} = {}) {
  if (isFBC && FBC_PACKAGES[fbcPackage]) {
    return FBC_PACKAGES[fbcPackage].bpCost;
  }

  if (customBP !== null && customBP !== undefined && !isNaN(customBP)) {
    return Number(customBP);
  }

  if (category === 'fashionware' || category === 'pseudo' || category === 'synth_limb') {
    return 0;
  }

  if (category === 'hand_foot' || category === 'limb_upgrade') {
    return 1;
  }

  if (category === 'tl5_nanotech') {
    return 1; // 1/2 BP rounded up, min 1
  }

  return AUGMENTATION_CATEGORIES[category]?.defaultBP ?? 2;
}

/**
 * Calculates Structure Points (SP) for the augmented limb/body.
 */
export function calculateAugmentationSP({
  location = 'Torso',
  nodes = 10,
  isHardened = null,
  isFBC = false,
  fbcPackage = 'Civilian'
} = {}) {
  if (isFBC && FBC_PACKAGES[fbcPackage]) {
    return FBC_PACKAGES[fbcPackage].totalSP;
  }

  const slotDef = ANATOMICAL_BODY_SLOTS[location] || ANATOMICAL_BODY_SLOTS.Torso;
  const hardened = isHardened !== null && isHardened !== undefined ? !!isHardened : !!slotDef.isHardened;
  const nodeCount = Number(nodes || 0);

  // 1 SP per Node; Cranium and Torso get x2 Hardening
  return hardened ? nodeCount * 2 : nodeCount;
}

/**
 * Calculates social Stigma Level from total installed mods.
 */
export function calculateStigmaLevel(modCount = 0, isFBC = false) {
  if (isFBC) {
    return STIGMA_LEVELS_DETAILED.Severe;
  }

  const count = Number(modCount || 0);
  if (count <= 0) return STIGMA_LEVELS_DETAILED.None;
  if (count <= 3) return STIGMA_LEVELS_DETAILED.Minor;
  if (count <= 6) return STIGMA_LEVELS_DETAILED.Moderate;
  return STIGMA_LEVELS_DETAILED.Severe;
}

/**
 * Computes full persistent metadata for Augmentations on save.
 */
export function computeAugmentationStats(formData) {
  const isFBC = !!(formData.is_fbc || formData.category === 'fbc');
  const fbcPackage = formData.fbc_package || 'Civilian';
  const isPseudo = !!(formData.is_pseudo || formData.category === 'pseudo');

  const finalDC = calculateAugmentationDC({
    baseDC: formData.base_dc ?? formData.craft_dc,
    category: formData.category || 'body_mod',
    location: formData.location || 'Torso',
    tl: formData.tech_level ?? formData.tl ?? 3,
    ml: formData.meta_level ?? formData.ml ?? 0,
    skin: formData.skin || formData.faction_skin,
    isFBC,
    fbcPackage,
    isPseudo,
    subMods: formData.sub_mods || []
  });

  const nodeStats = calculateAugmentationNodes({
    location: formData.location || 'Torso',
    category: formData.category || 'body_mod',
    nodeCost: formData.nodes_consumed,
    isPseudo,
    isFBC
  });

  const bpCost = calculateAugmentationBP({
    category: formData.category || 'body_mod',
    customBP: formData.bp_cost ?? formData.cp,
    tl: formData.tech_level ?? formData.tl ?? 3,
    isFBC,
    fbcPackage
  });

  const sp = calculateAugmentationSP({
    location: formData.location || 'Torso',
    nodes: nodeStats.nodesConsumed,
    isHardened: nodeStats.isHardened,
    isFBC,
    fbcPackage
  });

  const creditValue = isFBC && FBC_PACKAGES[fbcPackage] ? FBC_PACKAGES[fbcPackage].credits : calculateCreditValue(finalDC);
  const materialCost = calculateMaterialCost(creditValue);
  const stigma = calculateStigmaLevel(formData.installed_mods_count || 1, isFBC);

  return {
    final_dc: finalDC,
    credit_value: creditValue,
    material_cost: materialCost,
    ws_threshold: finalDC,
    complexity_tier: getComplexityTier(finalDC),
    crafting_days: calculateAllCraftingTiers(creditValue),
    node_stats: nodeStats,
    bp_cost: bpCost,
    sp_total: sp,
    stigma_level: stigma.level,
    stigma_penalty: stigma.penalty,
    stigma_description: stigma.description,
    udu_displacement: {
      tier: 'Node',
      count: nodeStats.nodesConsumed
    },
    computed_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════
// 2. MECHA & VEHICLES FORGE ENGINE (PLAN 21)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates Base Defense DC for Mecha.
 * Formula: 10 + Pilot Agility + Size Combat Mod + Frame Handling Mod
 */
export function calculateMechaDefenseDC({
  pilotAgility = 0,
  size = 'Medium',
  frame = 'Humanoid'
} = {}) {
  const sizeDef = MECHA_SIZES[size] || MECHA_SIZES.Medium;
  const frameDef = MECHA_FRAMES[frame] || MECHA_FRAMES.Humanoid;

  return 10 + Number(pilotAgility || 0) + (sizeDef.defMod ?? 0) + (frameDef.handlingMod ?? 0);
}

/**
 * Calculates the comprehensive Crafting DC for Mecha chassis.
 */
export function calculateMechaDC({
  baseDC,
  size = 'Medium',
  frame = 'Humanoid',
  propulsion = 'wheels',
  armor = [],
  modules = [],
  components = [],
  vftMode = 'None',
  tl = 3,
  skin
} = {}) {
  const sizeDef = MECHA_SIZES[size] || MECHA_SIZES.Medium;
  const frameDef = MECHA_FRAMES[frame] || MECHA_FRAMES.Humanoid;

  let dc = Number(baseDC !== undefined && baseDC !== null && !isNaN(baseDC) ? baseDC : sizeDef.baseDC);

  // Add Frame complexity DC
  dc += frameDef.complexityDC;

  // Add Propulsion DC
  if (propulsion) {
    const propDef = MECHA_PROPULSION.find(p => p.id === propulsion || p.name === propulsion);
    if (propDef) dc += propDef.dcMod;
  }

  // Add Armor DC mods
  if (Array.isArray(armor)) {
    for (const armItem of armor) {
      const armId = typeof armItem === 'string' ? armItem : armItem.id;
      const armDef = MECHA_ARMOR_TYPES.find(a => a.id === armId || a.name === armId);
      if (armDef) dc += armDef.dcMod;
    }
  }

  // Add Modules DC mods
  if (Array.isArray(modules)) {
    for (const modItem of modules) {
      const modId = typeof modItem === 'string' ? modItem : modItem.id;
      const modDef = MECHA_MODULES.find(m => m.id === modId || m.name === modId);
      if (modDef) dc += modDef.dcMod;
    }
  }

  // Add Components DC mods
  if (Array.isArray(components)) {
    for (const compItem of components) {
      const compId = typeof compItem === 'string' ? compItem : compItem.id;
      const compDef = MECHA_COMPONENTS.find(c => c.id === compId || c.name === compId);
      if (compDef) dc += compDef.dcMod;
    }
  }

  // Add VFT mode DC
  if (vftMode && VFT_MODES[vftMode]) {
    dc += VFT_MODES[vftMode].dcMod;
  }

  // Manufacturer cultural skin modifier
  if (skin && MANUFACTURER_SKINS[skin]) {
    dc += MANUFACTURER_SKINS[skin].dcMod;
  }

  return Math.max(0, Math.round(dc));
}

/**
 * Calculates Mount displacement and capacity budget for Mecha.
 */
export function calculateMechaMounts({
  size = 'Medium',
  propulsion = null,
  armor = [],
  modules = [],
  weapons = []
} = {}) {
  const sizeDef = MECHA_SIZES[size] || MECHA_SIZES.Medium;
  const totalMounts = sizeDef.mounts;
  const scaleMult = Math.max(1, Math.round(sizeDef.scaleMult));

  let usedMounts = 0;

  // Propulsion Mounts
  if (propulsion) {
    const propDef = MECHA_PROPULSION.find(p => p.id === propulsion || p.name === propulsion);
    if (propDef) usedMounts += propDef.mounts;
  }

  // Scaled Armor Plating & Shields Mount Cost (baseMountMult * Scale Modifier)
  if (Array.isArray(armor)) {
    for (const armItem of armor) {
      const armId = typeof armItem === 'string' ? armItem : armItem.id;
      const armDef = MECHA_ARMOR_TYPES.find(a => a.id === armId || a.name === armId);
      if (armDef && armDef.baseMountMult > 0) {
        usedMounts += armDef.baseMountMult * scaleMult;
      }
    }
  }

  // Modules Mounts
  if (Array.isArray(modules)) {
    for (const modItem of modules) {
      const modId = typeof modItem === 'string' ? modItem : modItem.id;
      const modDef = MECHA_MODULES.find(m => m.id === modId || m.name === modId);
      if (modDef) usedMounts += modDef.mounts;
    }
  }

  // Weapons Mounts
  if (Array.isArray(weapons)) {
    for (const wpn of weapons) {
      const mountCost = typeof wpn === 'object' ? (wpn.mounts ?? 1) : 1;
      usedMounts += Number(mountCost);
    }
  }

  const remainingMounts = totalMounts - usedMounts;
  const isOverBudget = usedMounts > totalMounts;

  return {
    totalMounts,
    usedMounts,
    remainingMounts,
    isOverBudget,
    scaleMult
  };
}

/**
 * Calculates Crew Capacity requirement based on vehicle scale.
 */
export function calculateCrewRequired(size = 'Medium', hasAiTargeting = false) {
  let baseCrew = 1;

  if (size === 'Miniscule' || size === 'Fine' || size === 'Diminutive' || size === 'Tiny') {
    baseCrew = 0; // Drones / Remote
  } else if (size === 'Small' || size === 'Medium') {
    baseCrew = 1;
  } else if (size === 'Large') {
    baseCrew = 2;
  } else if (size === 'Huge') {
    baseCrew = 5;
  } else if (size === 'Gargantuan') {
    baseCrew = 10;
  } else if (size === 'Colossal') {
    baseCrew = 20;
  } else if (size === 'Enormous') {
    baseCrew = 50;
  } else if (size === 'Titanic') {
    baseCrew = 100;
  } else {
    baseCrew = 200;
  }

  // AI targeting / Pilot computer mitigates crew requirement
  if (hasAiTargeting && baseCrew > 1) {
    baseCrew = Math.max(1, Math.ceil(baseCrew / 2));
  }

  return baseCrew;
}

/**
 * Computes full persistent metadata for Mecha on save.
 */
export function computeMechaStats(formData) {
  const size = formData.size || 'Medium';
  const frame = formData.frame || formData.frame_type || 'Humanoid';
  const sizeDef = MECHA_SIZES[size] || MECHA_SIZES.Medium;
  const frameDef = MECHA_FRAMES[frame] || MECHA_FRAMES.Humanoid;

  const finalDC = calculateMechaDC({
    baseDC: formData.base_dc ?? formData.craft_dc,
    size,
    frame,
    propulsion: formData.propulsion,
    armor: formData.armor_plating || formData.armor || [],
    modules: formData.installed_modules || formData.modules || [],
    components: formData.components || [],
    vftMode: formData.vft_mode || (formData.vft_capable ? 'TL3_HardShift' : 'None'),
    tl: formData.tl ?? 3,
    skin: formData.skin || formData.faction_skin
  });

  const mountBudget = calculateMechaMounts({
    size,
    propulsion: formData.propulsion,
    armor: formData.armor_plating || formData.armor || [],
    modules: formData.installed_modules || formData.modules || [],
    weapons: formData.linked_weapons || []
  });

  const defenseDC = calculateMechaDefenseDC({
    pilotAgility: formData.pilot_agility || 0,
    size,
    frame
  });

  const hasAi = (formData.installed_modules || []).some(m => (typeof m === 'string' ? m : m.id) === 'targeting_ai');
  const crewRequired = calculateCrewRequired(size, hasAi);

  const creditValue = calculateCreditValue(finalDC);
  const materialCost = calculateMaterialCost(creditValue);

  let tacticalSpeed = '40 ft/rnd';
  if (formData.propulsion) {
    const propDef = MECHA_PROPULSION.find(p => p.id === formData.propulsion || p.name === formData.propulsion);
    if (propDef) tacticalSpeed = propDef.speed;
  }

  return {
    final_dc: finalDC,
    credit_value: creditValue,
    is_megacredit: creditValue >= 1000000,
    megacredit_value: creditValue >= 1000000 ? (creditValue / 1000000).toFixed(2) + ' MCr' : null,
    material_cost: materialCost,
    ws_threshold: finalDC,
    complexity_tier: getComplexityTier(finalDC),
    crafting_days: calculateAllCraftingTiers(creditValue),
    total_sp: sizeDef.structure,
    defense_dc: defenseDC,
    handling_mod: frameDef.handlingMod,
    tactical_speed: tacticalSpeed,
    crew_required: crewRequired,
    mount_budget: mountBudget,
    udu_displacement: {
      tier: 'Mount',
      count: sizeDef.mounts
    },
    computed_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════
// 3. ARCHITECTURE FORGE ENGINE (99 - ARCHITECTURAL MATRIX)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates total Structure Points (SP) for an architectural blueprint.
 * Formula: Base_SP * Stories * Material_Multiplier * Frame_SP_Multiplier + Bulwark_Bonus
 */
export function calculateArchitectureSP({
  footprint = 'Large',
  heightClass = 'Single',
  customStories = null,
  tl = 3,
  frame = 'Standard',
  bulwarkBonus = 0
} = {}) {
  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;
  const heightDef = HEIGHT_CLASSES[heightClass] || HEIGHT_CLASSES.Single;
  const matDef = ARCHITECTURE_MATERIALS[tl] || ARCHITECTURE_MATERIALS[3];
  const frameDef = ARCHITECTURE_FRAME_TYPES[frame] || ARCHITECTURE_FRAME_TYPES.Standard;

  const stories = customStories !== null && customStories !== undefined && !isNaN(customStories)
    ? Number(customStories)
    : heightDef.stories;

  const baseSP = footprintDef.baseSP;
  const frameSPMult = frameDef.spMult ?? 1.0;
  const calculated = Math.round(baseSP * stories * matDef.spMult * frameSPMult + Number(bulwarkBonus || 0));

  return Math.max(1, calculated);
}

/**
 * Calculates total Module capacity for an architectural structure.
 * Includes Frame module multipliers (Elevated +25%, Subterranean -15%),
 * Mastercraft bonus capacity, and deductions for Mobile 20% Chassis Tax.
 */
export function calculateArchitectureModules({
  footprint = 'Large',
  heightClass = 'Single',
  customStories = null,
  frame = 'Standard',
  isMobile = false,
  mastercraftBonus = 0
} = {}) {
  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;
  const heightDef = HEIGHT_CLASSES[heightClass] || HEIGHT_CLASSES.Single;
  const frameDef = ARCHITECTURE_FRAME_TYPES[frame] || ARCHITECTURE_FRAME_TYPES.Standard;

  const stories = customStories !== null && customStories !== undefined && !isNaN(customStories)
    ? Number(customStories)
    : heightDef.stories;

  const frameModMult = frameDef.moduleMult ?? 1.0;
  const rawModules = footprintDef.baseModules * stories * frameModMult + Number(mastercraftBonus || 0);

  // 20% Chassis Tax for Mobile Structures (min 1 Module if total >= 1, or 20% of capacity)
  const mobileTax = isMobile 
    ? (rawModules >= 1 ? Math.max(1, Math.ceil(rawModules * 0.20)) : Number((rawModules * 0.20).toFixed(3)))
    : 0;

  const usableModules = Number(Math.max(0.001, rawModules - mobileTax).toFixed(3));

  return {
    rawModules: Number(rawModules.toFixed(3)),
    mobileTax,
    totalModules: usableModules
  };
}

/**
 * Calculates the Mount budget and allocation using the 10:1 UDU Integration Rule (1 Module = 10 Mounts).
 * Scales Armor Plating and Energy Shields by the Structure's Scale Modifier.
 */
export function calculateArchitectureMounts({
  footprint = 'Large',
  totalModules = 1,
  usedModules = 0,
  armorPlating = [],
  energyShields = [],
  structuralWeapons = [],
  sensorsAndAux = []
} = {}) {
  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;
  const scaleMod = footprintDef.scaleMod || 1.0;

  // Unspent modules converted to mounts (1 Module = 10 Mounts)
  const unspentModules = Math.max(0, totalModules - usedModules);
  const totalMounts = Number((unspentModules * 10).toFixed(2));

  let usedMounts = 0;

  // Scaled Armor Plating (mountBaseMult * scaleMod)
  if (Array.isArray(armorPlating)) {
    for (const item of armorPlating) {
      const id = typeof item === 'string' ? item : item.id;
      const count = typeof item === 'object' && item.count ? Number(item.count) : 1;
      const def = ARCHITECTURE_HARDPOINTS_ARMOR.find(a => a.id === id || a.name === id);
      if (def) {
        usedMounts += (def.mountBaseMult * scaleMod) * count;
      }
    }
  }

  // Scaled Energy Shields (mountBaseMult * scaleMod)
  if (Array.isArray(energyShields)) {
    for (const item of energyShields) {
      const id = typeof item === 'string' ? item : item.id;
      const count = typeof item === 'object' && item.count ? Number(item.count) : 1;
      const def = ARCHITECTURE_HARDPOINTS_ARMOR.find(a => a.id === id || a.name === id);
      if (def) {
        usedMounts += (def.mountBaseMult * scaleMod) * count;
      }
    }
  }

  // Structural Weapon Emplacements
  if (Array.isArray(structuralWeapons)) {
    for (const item of structuralWeapons) {
      const id = typeof item === 'string' ? item : item.id;
      const count = typeof item === 'object' && item.count ? Number(item.count) : 1;
      const def = ARCHITECTURE_HARDPOINTS_WEAPONS.find(w => w.id === id || w.name === id);
      if (def) {
        usedMounts += (def.mounts || 1) * count;
      } else if (typeof item === 'object' && item.mounts) {
        usedMounts += Number(item.mounts) * count;
      }
    }
  }

  // Sensors & Auxiliary Systems
  if (Array.isArray(sensorsAndAux)) {
    for (const item of sensorsAndAux) {
      const id = typeof item === 'string' ? item : item.id;
      const count = typeof item === 'object' && item.count ? Number(item.count) : 1;
      const def = ARCHITECTURE_HARDPOINTS_SENSORS.find(s => s.id === id || s.name === id);
      if (def) {
        usedMounts += (def.mounts || 1) * count;
      }
    }
  }

  const remainingMounts = Number((totalMounts - usedMounts).toFixed(2));
  const isOverBudget = usedMounts > totalMounts;

  return {
    totalMounts,
    usedMounts: Number(usedMounts.toFixed(2)),
    remainingMounts,
    isOverBudget,
    scaleMod
  };
}

/**
 * Calculates the final Crafting/Engineering DC for Architecture.
 * Applies the Highest Complexity Rule (DC Stacking):
 * If any installed module, hardpoint, propulsion system, or generator has a DC
 * higher than the building's calculated baseline DC, the base DC is elevated to match.
 */
export function calculateArchitectureDC({
  footprint = 'Large',
  heightClass = 'Single',
  customStories = null,
  frame = 'Standard',
  tl = 3,
  environment = 'Standard',
  specializedModules = [],
  armorPlating = [],
  energyShields = [],
  structuralWeapons = [],
  sensorsAndAux = [],
  propulsion = null,
  generators = [],
  uduCompression = null,
  isRare = false,
  baseDC = null
} = {}) {
  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;
  const heightDef = HEIGHT_CLASSES[heightClass] || HEIGHT_CLASSES.Single;
  const frameDef = ARCHITECTURE_FRAME_TYPES[frame] || ARCHITECTURE_FRAME_TYPES.Standard;
  const matDef = ARCHITECTURE_MATERIALS[tl] || ARCHITECTURE_MATERIALS[3];
  const envDef = ENVIRONMENTAL_MODIFIERS[environment] || ENVIRONMENTAL_MODIFIERS.Standard;

  let heightCraftMod = heightDef.craftMod;
  if (environment === 'LowGravity') {
    heightCraftMod = Math.floor(heightCraftMod / 2);
  } else if (environment === 'HighGravity') {
    heightCraftMod = heightCraftMod * 2;
  }

  let runningDC = Number(baseDC !== null && baseDC !== undefined && !isNaN(baseDC) ? baseDC : footprintDef.baseDC);
  runningDC += heightCraftMod + (frameDef.dcMod || 0) + matDef.dcMod + envDef.dcMod;

  // Track Highest Component DC across all installed systems
  let highestComponentDC = 0;
  let highestComponentSource = null;

  const checkComponent = (compDef) => {
    if (compDef && typeof compDef.dc === 'number' && compDef.dc > highestComponentDC) {
      highestComponentDC = compDef.dc;
      highestComponentSource = compDef.name;
    }
  };

  // Facilities
  if (Array.isArray(specializedModules)) {
    for (const mod of specializedModules) {
      const modId = typeof mod === 'string' ? mod : mod.id;
      const modDef = ARCHITECTURE_FACILITIES.find(m => m.id === modId || m.name === modId);
      checkComponent(modDef);
    }
  }

  // Armor Plating & Shields
  const combinedArmor = [...(Array.isArray(armorPlating) ? armorPlating : []), ...(Array.isArray(energyShields) ? energyShields : [])];
  for (const arm of combinedArmor) {
    const armId = typeof arm === 'string' ? arm : arm.id;
    const armDef = ARCHITECTURE_HARDPOINTS_ARMOR.find(a => a.id === armId || a.name === armId);
    checkComponent(armDef);
  }

  // Weapons
  if (Array.isArray(structuralWeapons)) {
    for (const wpn of structuralWeapons) {
      const wpnId = typeof wpn === 'string' ? wpn : wpn.id;
      const wpnDef = ARCHITECTURE_HARDPOINTS_WEAPONS.find(w => w.id === wpnId || w.name === wpnId);
      checkComponent(wpnDef);
    }
  }

  // Sensors & Aux
  if (Array.isArray(sensorsAndAux)) {
    for (const sens of sensorsAndAux) {
      const sensId = typeof sens === 'string' ? sens : sens.id;
      const sensDef = ARCHITECTURE_HARDPOINTS_SENSORS.find(s => s.id === sensId || s.name === sensId);
      checkComponent(sensDef);
    }
  }

  // Propulsion System
  if (propulsion) {
    const propId = typeof propulsion === 'string' ? propulsion : propulsion.id;
    const propDef = ARCHITECTURE_PROPULSION.find(p => p.id === propId || p.name === propId);
    checkComponent(propDef);
  }

  // Core Generators
  if (Array.isArray(generators)) {
    for (const gen of generators) {
      const genId = typeof gen === 'string' ? gen : gen.id;
      const genDef = ARCHITECTURE_CORE_INTERNALS.find(g => g.id === genId || g.name === genId);
      checkComponent(genDef);
    }
  }

  const highestRuleApplied = highestComponentDC > runningDC;
  if (highestRuleApplied) {
    runningDC = highestComponentDC;
  }

  // UDU Compression modifiers
  if (uduCompression === 'Efficient') runningDC += 5;
  else if (uduCompression === 'Miniaturized') runningDC += 10;
  else if (uduCompression === 'Integrated') runningDC += 5;

  // Regional rarity
  if (isRare) runningDC += 5;

  const finalDC = Math.max(0, Math.round(runningDC));

  return {
    finalDC,
    highestRuleApplied,
    highestComponentDC,
    highestComponentSource
  };
}

/**
 * Calculates workforce cooperative construction timeline based on Workforce Productivity Points (PP).
 * Daily PP = Workforce Workers * Math.max(1, (Avg Skill Check - 10) * Tool Multiplier)
 * Days = Credit Value / Daily PP
 */
export function calculateCooperativeConstructionDays({
  creditValue = 1000,
  workforceWorkers = 1,
  avgSkillCheck = 15,
  toolTier = 'industrial'
} = {}) {
  const tierKey = String(toolTier || 'industrial').toLowerCase();
  const tierDef = Array.isArray(TOOL_TIERS)
    ? TOOL_TIERS.find(t => t.id.toLowerCase() === tierKey || t.name.toLowerCase().includes(tierKey))
    : TOOL_TIERS[toolTier];
  const multiplier = tierDef?.multiplier ?? 200;

  const workers = Math.max(1, Number(workforceWorkers || 1));
  const check = Number(avgSkillCheck || 15);
  const netSkill = Math.max(1, check - 10);
  const dailyPPPerWorker = netSkill * multiplier;
  const totalDailyPP = workers * dailyPPPerWorker;

  const totalDays = Number((creditValue / Math.max(1, totalDailyPP)).toFixed(2));
  const workMonths = (totalDays / 30).toFixed(1);
  const workYears = (totalDays / 365).toFixed(2);

  let formattedTimeline = `${totalDays} Days`;
  if (totalDays > 365) {
    formattedTimeline = `${workYears} Years (${totalDays} Days)`;
  } else if (totalDays > 60) {
    formattedTimeline = `${workMonths} Months (${totalDays} Days)`;
  }

  return {
    totalDays,
    workMonths: Number(workMonths),
    workYears: Number(workYears),
    totalDailyPP,
    formattedTimeline
  };
}

/**
 * Computes tactical combat & integrity metrics.
 */
export function calculateArchitectureCombatMetrics({
  totalSP = 100,
  baseSP = 100,
  tl = 3,
  armorPlating = [],
  creditValue = 1000
} = {}) {
  const matDef = ARCHITECTURE_MATERIALS[tl] || ARCHITECTURE_MATERIALS[3];

  // Base Damage Resistance from Material
  let totalDR = matDef.dr || 20;

  // Additional DR from installed armor plating
  if (Array.isArray(armorPlating)) {
    for (const arm of armorPlating) {
      const id = typeof arm === 'string' ? arm : arm.id;
      const def = ARCHITECTURE_HARDPOINTS_ARMOR.find(a => a.id === id || a.name === id);
      if (def && def.dr > 0) {
        totalDR += def.dr;
      }
    }
  }

  // Section Integrity: A 10x10ft section of wall has roughly 10% of the Building's Base SP
  const sectionIntegrity = Math.max(1, Math.round(baseSP * 0.10));
  const breachThreshold = `${sectionIntegrity} SP (after DR)`;

  // Annual Upkeep: 2% of Total Value per year
  const annualUpkeep = Math.round(creditValue * 0.02);

  // Field Repair: 10% SP restored per hour, costing 10% of building value in materials
  const fieldRepairRate = `${Math.round(totalSP * 0.10)} SP / hr`;
  const fieldRepairMaterialCost = Math.round(creditValue * 0.10);

  return {
    total_sp: totalSP,
    total_dr: totalDR,
    section_integrity: sectionIntegrity,
    breach_threshold: breachThreshold,
    annual_upkeep: annualUpkeep,
    field_repair_rate: fieldRepairRate,
    field_repair_material_cost: fieldRepairMaterialCost
  };
}

/**
 * Validates an architectural blueprint against the 99 - Architectural Matrix rules.
 */
export function validateArchitectureBlueprint(formData) {
  const errors = [];
  const warnings = [];

  const footprint = formData.footprint || formData.scale || 'Large';
  const heightClass = formData.height_class || 'Single';
  const frame = formData.frame_type || formData.frame || 'Standard';
  const tl = Number(formData.tl ?? 3);
  const environment = formData.environment || 'Standard';

  const moduleCalc = calculateArchitectureModules({
    footprint,
    heightClass,
    customStories: formData.stories,
    frame,
    isMobile: !!formData.is_mobile,
    mastercraftBonus: formData.mastercraft_bonus || 0
  });

  const totalModules = moduleCalc.totalModules;

  // Compute used modules
  const specializedModules = formData.specialized_modules || formData.modules || [];
  let usedModules = 0;
  for (const mod of specializedModules) {
    const modId = typeof mod === 'string' ? mod : mod.id;
    const count = typeof mod === 'object' && mod.count ? Number(mod.count) : 1;
    const modDef = ARCHITECTURE_FACILITIES.find(m => m.id === modId || m.name === modId);
    if (modDef) {
      usedModules += modDef.modules * count;
    }
  }

  if (usedModules > totalModules) {
    errors.push(`Module capacity exceeded: Using ${usedModules} of ${totalModules} available Modules.`);
  }

  // Mount Budget Validation
  const mountCalc = calculateArchitectureMounts({
    footprint,
    totalModules,
    usedModules,
    armorPlating: formData.armor_plating || formData.armor || [],
    energyShields: formData.energy_shields || formData.shields || [],
    structuralWeapons: formData.structural_weapons || formData.weapons || [],
    sensorsAndAux: formData.sensors_and_aux || formData.sensors || []
  });

  if (mountCalc.isOverBudget) {
    errors.push(`Mount hardpoint budget exceeded: Using ${mountCalc.usedMounts} of ${mountCalc.totalMounts} converted Mounts.`);
  }

  // Environmental Hazards Check
  if (environment === 'VacuumToxic') {
    const hasLifeSupport = specializedModules.some(m => {
      const id = typeof m === 'string' ? m : m.id;
      return id === 'life_support' || id === 'enviro_dome';
    });
    if (!hasLifeSupport && tl < 3) {
      warnings.push('Environmental Hazard: Vacuum / Toxic worlds require a Life Support module on TL 0-2 structures.');
    }
  }

  if (environment === 'AquaticPressure') {
    warnings.push('Sub-Aquatic Hazard: Pressure Hull reinforcement required (+5 DC, +50% cost).');
  }

  // Tech Level Gating Warnings
  for (const mod of specializedModules) {
    const modId = typeof mod === 'string' ? mod : mod.id;
    const modDef = ARCHITECTURE_FACILITIES.find(m => m.id === modId || m.name === modId);
    if (modDef && modDef.tl > tl) {
      warnings.push(`Tech Level Notice: "${modDef.name}" is TL${modDef.tl}, exceeding structure's TL${tl}.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    moduleCalc,
    mountCalc
  };
}

/**
 * Computes full persistent metadata for Architecture on save.
 */
export function computeArchitectureStats(formData) {
  const footprint = formData.footprint || formData.scale || 'Large';
  const heightClass = formData.height_class || 'Single';
  const frame = formData.frame_type || formData.frame || 'Standard';
  const tl = Number(formData.tl ?? 3);
  const environment = formData.environment || 'Standard';
  const matDef = ARCHITECTURE_MATERIALS[tl] || ARCHITECTURE_MATERIALS[3];
  const envDef = ENVIRONMENTAL_MODIFIERS[environment] || ENVIRONMENTAL_MODIFIERS.Standard;
  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;

  const totalSP = calculateArchitectureSP({
    footprint,
    heightClass,
    customStories: formData.stories,
    tl,
    frame,
    bulwarkBonus: formData.bulwark_bonus || 0
  });

  const moduleCalc = calculateArchitectureModules({
    footprint,
    heightClass,
    customStories: formData.stories,
    frame,
    isMobile: !!formData.is_mobile,
    mastercraftBonus: formData.mastercraft_bonus || 0
  });

  const totalModules = moduleCalc.totalModules;

  const specializedModules = formData.specialized_modules || formData.modules || [];
  let usedModules = 0;
  if (Array.isArray(specializedModules)) {
    for (const mod of specializedModules) {
      const modId = typeof mod === 'string' ? mod : mod.id;
      const count = typeof mod === 'object' && mod.count ? Number(mod.count) : 1;
      const modDef = ARCHITECTURE_FACILITIES.find(m => m.id === modId || m.name === modId);
      if (modDef) {
        usedModules += modDef.modules * count;
      }
    }
  }

  const armorPlating = formData.armor_plating || formData.armor || [];
  const energyShields = formData.energy_shields || formData.shields || [];
  const structuralWeapons = formData.structural_weapons || formData.weapons || [];
  const sensorsAndAux = formData.sensors_and_aux || formData.sensors || [];
  const generators = formData.generators || formData.power_generators || [];
  const propulsion = formData.propulsion || formData.propulsion_type || null;

  const mountCalc = calculateArchitectureMounts({
    footprint,
    totalModules,
    usedModules,
    armorPlating,
    energyShields,
    structuralWeapons,
    sensorsAndAux
  });

  const dcResult = calculateArchitectureDC({
    footprint,
    heightClass,
    customStories: formData.stories,
    frame,
    tl,
    environment,
    specializedModules,
    armorPlating,
    energyShields,
    structuralWeapons,
    sensorsAndAux,
    propulsion,
    generators,
    uduCompression: formData.udu_compression,
    isRare: !!formData.is_rare,
    baseDC: formData.base_dc ?? formData.craft_dc
  });

  const finalDC = dcResult.finalDC;

  // If the user checked VacuumToxic and TL < 3, or Aquatic, cost multipliers apply
  let costMult = envDef.costMult || 1.0;
  if (environment === 'VacuumToxic' && tl >= 3) {
    costMult = 1.0; // Free at TL3+
  }

  const baseCreditValue = calculateCreditValue(finalDC);
  const adjustedCreditValue = Math.round(baseCreditValue * costMult);
  const materialCost = calculateMaterialCost(adjustedCreditValue);

  const cooperativeTimeline = calculateCooperativeConstructionDays({
    creditValue: adjustedCreditValue,
    workforceWorkers: formData.workforce_workers || 10,
    avgSkillCheck: formData.workforce_skill || 15,
    toolTier: formData.tool_tier || 'industrial'
  });

  const combatMetrics = calculateArchitectureCombatMetrics({
    totalSP,
    baseSP: footprintDef.baseSP,
    tl,
    armorPlating,
    creditValue: adjustedCreditValue
  });

  const validation = validateArchitectureBlueprint(formData);

  // Tactical Speed for Mobile Structures
  let tacticalSpeed = null;
  if (formData.is_mobile && propulsion) {
    const propId = typeof propulsion === 'string' ? propulsion : propulsion.id;
    const propDef = ARCHITECTURE_PROPULSION.find(p => p.id === propId || p.name === propId);
    if (propDef) {
      const scaledSpeed = Math.round(propDef.baseSpeed * (footprintDef.scaleMod || 1.0));
      tacticalSpeed = `${scaledSpeed} ft/rnd (${propDef.handling})`;
    }
  }

  return {
    final_dc: finalDC,
    highest_rule_applied: dcResult.highestRuleApplied,
    highest_component_source: dcResult.highestComponentSource,
    credit_value: adjustedCreditValue,
    material_cost: materialCost,
    ws_threshold: finalDC,
    complexity_tier: getComplexityTier(finalDC),
    total_sp: totalSP,
    dr_rating: combatMetrics.total_dr,
    total_modules: totalModules,
    raw_modules: moduleCalc.rawModules,
    mobile_tax_modules: moduleCalc.mobileTax,
    used_modules: usedModules,
    remaining_modules: Number((totalModules - usedModules).toFixed(2)),
    is_module_overbudget: usedModules > totalModules,
    mount_budget: mountCalc,
    tactical_speed: tacticalSpeed,
    combat_metrics: combatMetrics,
    validation_status: {
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings
    },
    single_crafter_days: calculateAllCraftingTiers(adjustedCreditValue),
    cooperative_construction: cooperativeTimeline,
    udu_displacement: {
      tier: 'Module',
      count: totalModules
    },
    computed_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════
// 4. MOVEMENT MODES, PACES & COMBAT DYNAMICS ENGINE
// ═══════════════════════════════════════════════════════════

/**
 * Calculates effective movement speed (in feet per round) given a mode, pace, and character traits.
 * 
 * @param {object} params
 * @param {string} [params.mode='ground'] - 'ground' | 'flying' | 'swimming' | 'climbing' | 'burrowing'
 * @param {string} [params.pace='walk'] - Specific pace ID within the mode
 * @param {number} [params.baseWalkSpeed=30] - Base ground walking speed (typically 30 ft)
 * @param {boolean} [params.hasRunner=false] - Possesses the Runner feature (5x Run / 7x Sprint)
 * @param {boolean} [params.hasSwimmer=false] - Possesses the Swimmer feature (1x Swim / 2x Glide / 3x Stroke)
 * @param {boolean} [params.hasClimber=false] - Possesses the Climber feature (1x Climb / 2x Scale / 3x Ascent / 6x Descent)
 * @param {boolean} [params.hasSoar=false] - Possesses the Soar feature (5x Surge / 9x Dive)
 * @param {boolean} [params.isExhausted=false] - Subject to the Exhausted condition (halves all speeds)
 * @returns {object} Calculated movement metrics
 */
export function calculateMovementPace({
  mode = 'ground',
  pace = 'walk',
  baseWalkSpeed = 30,
  hasRunner = false,
  hasSwimmer = false,
  hasClimber = false,
  hasSoar = false,
  isExhausted = false
} = {}) {
  const modeData = MOVEMENT_MODES_AND_PACES[mode] || MOVEMENT_MODES_AND_PACES.ground;
  const paceData = modeData.paces[pace] || Object.values(modeData.paces)[0];

  let multiplier = paceData.multiplier;

  // Apply feature multiplier boosts
  if (mode === 'ground' && hasRunner && (pace === 'running' || pace === 'sprinting')) {
    multiplier = paceData.featureMultiplier || multiplier;
  } else if (mode === 'flying' && hasSoar && (pace === 'surge' || pace === 'diving')) {
    multiplier = paceData.featureMultiplier || multiplier;
  } else if (mode === 'swimming' && hasSwimmer) {
    if (pace === 'swimming') multiplier = 1.0;
    else if (pace === 'glide') multiplier = 2.0;
    else if (pace === 'stroke') multiplier = 3.0;
  } else if (mode === 'climbing' && hasClimber) {
    if (pace === 'easy' || pace === 'moderate' || pace === 'difficult') multiplier = 1.0;
    else if (pace === 'scaling') multiplier = 2.0;
    else if (pace === 'fast_ascent') multiplier = 3.0;
    else if (pace === 'fast_descent') multiplier = 6.0;
  }

  // Base speed for the mode
  let baseSpeedForMode = baseWalkSpeed;
  if (mode === 'flying') baseSpeedForMode = baseWalkSpeed * 2.0;
  else if (mode === 'swimming' || mode === 'climbing') baseSpeedForMode = baseWalkSpeed * 0.5;
  else if (mode === 'burrowing') baseSpeedForMode = baseWalkSpeed * 0.25;

  // Raw speed before condition debuffs
  let rawSpeed = Math.round(baseSpeedForMode * multiplier);

  // Apply Exhausted condition if active
  let finalSpeed = isExhausted ? Math.floor(rawSpeed * 0.5) : rawSpeed;

  return {
    mode: modeData.id,
    mode_name: modeData.name,
    pace: paceData.id,
    pace_name: paceData.name,
    base_walk_speed: baseWalkSpeed,
    multiplier,
    raw_speed_ft: rawSpeed,
    final_speed_ft: finalSpeed,
    speed_mph: Number(((finalSpeed * 10) / 88).toFixed(2)),
    speed_kph: Number((((finalSpeed * 10) / 88) * 1.60934).toFixed(2)),
    action_penalty: paceData.actionPenalty || 0,
    check_dc: paceData.checkDC || null,
    check_skill: paceData.checkSkill || null,
    check_penalty: paceData.checkPenalty || 0,
    stealth_bonus: paceData.stealthBonus || 0,
    condition: isExhausted ? 'Exhausted' : (paceData.condition || null),
    description: paceData.description
  };
}

/**
 * Calculates Aerial Ramming damage and kinetic impact for flyers colliding with targets.
 * 
 * @param {object} params
 * @param {number} [params.flightStage=1] - 1 (Flight) | 2 (Sail) | 3 (Surge/Soar) | 4 (Dive)
 * @param {number} [params.speedFt=60] - Velocity in feet per round
 * @returns {object} Aerial ram collision damage details
 */
export function calculateAerialRamDamage({
  flightStage = 1,
  speedFt = 60
} = {}) {
  const stage = Math.max(1, Math.min(4, Math.round(flightStage)));
  const stageName = FLYING_COMBAT_RULES.flightStages[stage - 1] || 'Flight';
  const stageBonusDice = stage * FLYING_COMBAT_RULES.ramDicePerStage;
  const impactFlatDamage = Math.floor(speedFt / 10) * FLYING_COMBAT_RULES.ramImpactDamagePer10Ft;

  return {
    flight_stage: stage,
    stage_name: stageName,
    speed_ft: speedFt,
    bonus_dice_str: `+${stageBonusDice}d`,
    impact_flat_damage: impactFlatDamage,
    formula: `+${stageBonusDice}d damage + ${impactFlatDamage} kinetic impact damage`,
    applies_to_all_involved: true,
    crash_rules_apply: true
  };
}

/**
 * Evaluates movement fatigue checks and calculates non-lethal vitality loss.
 * 
 * @param {object} params
 * @param {number} params.checkTotal - Total result of Fortitude/Athletics check
 * @param {number} [params.targetDC=15] - Target DC for the fatigue check
 * @returns {object} Fatigue check resolution outcome
 */
export function evaluateMovementFatigue({
  checkTotal,
  targetDC = 15
} = {}) {
  const success = checkTotal >= targetDC;
  const missMargin = success ? 0 : targetDC - checkTotal;
  const damagePerMiss = Math.floor(missMargin / 5) * MOVEMENT_FATIGUE_SYSTEM.vitalityDamagePerMissOf5;
  const baseVitalityDamage = success ? 0 : MOVEMENT_FATIGUE_SYSTEM.vitalityDamageFail;
  const totalVitalityLoss = success ? 0 : Math.max(baseVitalityDamage, 1 + damagePerMiss);

  return {
    success,
    check_total: checkTotal,
    target_dc: targetDC,
    miss_margin: missMargin,
    vitality_damage: totalVitalityLoss,
    exhaustion_risk: !success,
    consequence: success
      ? 'Fatigue warded off successfully. Pacing maintained.'
      : `Failed by ${missMargin}. Suffer ${totalVitalityLoss} non-lethal Vitality damage. If Vitality reaches 0, suffer 2 Health damage and become Exhausted (-2 checks, 1/2 speed).`
  };
}

