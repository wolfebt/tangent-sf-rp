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
  ARCHITECTURE_MATERIALS,
  ENVIRONMENTAL_MODIFIERS,
  SPECIALIZED_MODULE_CATALOG,
  MANUFACTURER_SKINS,
  TOOL_TIERS
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
// 3. ARCHITECTURE FORGE ENGINE (PLAN 22)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates total Structure Points (SP) for an architectural blueprint.
 * Formula: Base_SP * Stories * Material_Multiplier + Bulwark_Bonus
 */
export function calculateArchitectureSP({
  footprint = 'Large',
  heightClass = 'Single',
  customStories = null,
  tl = 3,
  bulwarkBonus = 0
} = {}) {
  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;
  const heightDef = HEIGHT_CLASSES[heightClass] || HEIGHT_CLASSES.Single;
  const matDef = ARCHITECTURE_MATERIALS[tl] || ARCHITECTURE_MATERIALS[3];

  const stories = customStories !== null && customStories !== undefined && !isNaN(customStories)
    ? Number(customStories)
    : heightDef.stories;

  const baseSP = footprintDef.baseSP;
  const calculated = Math.round(baseSP * stories * matDef.spMult + Number(bulwarkBonus || 0));

  return Math.max(1, calculated);
}

/**
 * Calculates total Module capacity for an architectural structure.
 */
export function calculateArchitectureModules({
  footprint = 'Large',
  heightClass = 'Single',
  customStories = null,
  mastercraftBonus = 0
} = {}) {
  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;
  const heightDef = HEIGHT_CLASSES[heightClass] || HEIGHT_CLASSES.Single;

  const stories = customStories !== null && customStories !== undefined && !isNaN(customStories)
    ? Number(customStories)
    : heightDef.stories;

  const totalModules = Number((footprintDef.baseModules * stories + Number(mastercraftBonus || 0)).toFixed(2));
  return Math.max(0.001, totalModules);
}

/**
 * Calculates the final Crafting/Engineering DC for Architecture.
 * Applies the Highest Complexity Rule: if any specialized module has DC higher
 * than the building's base DC, the total base DC is raised to match that module.
 */
export function calculateArchitectureDC({
  footprint = 'Large',
  heightClass = 'Single',
  customStories = null,
  tl = 3,
  environment = 'Standard',
  specializedModules = [],
  mastercraftBonus = 0,
  uduCompression = null,
  isRare = false,
  baseDC = null
} = {}) {
  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;
  const heightDef = HEIGHT_CLASSES[heightClass] || HEIGHT_CLASSES.Single;
  const matDef = ARCHITECTURE_MATERIALS[tl] || ARCHITECTURE_MATERIALS[3];
  const envDef = ENVIRONMENTAL_MODIFIERS[environment] || ENVIRONMENTAL_MODIFIERS.Standard;

  let heightCraftMod = heightDef.craftMod;
  if (environment === 'LowGravity') {
    heightCraftMod = Math.floor(heightCraftMod / 2);
  } else if (environment === 'HighGravity') {
    heightCraftMod = heightCraftMod * 2;
  }

  let runningDC = Number(baseDC !== null && baseDC !== undefined && !isNaN(baseDC) ? baseDC : footprintDef.baseDC);
  runningDC += heightCraftMod + matDef.dcMod + envDef.dcMod;

  // Highest Complexity Rule
  let highestModuleDC = 0;
  if (Array.isArray(specializedModules)) {
    for (const mod of specializedModules) {
      const modId = typeof mod === 'string' ? mod : mod.id;
      const modDef = SPECIALIZED_MODULE_CATALOG.find(m => m.id === modId || m.name === modId);
      if (modDef && modDef.dc > highestModuleDC) {
        highestModuleDC = modDef.dc;
      }
    }
  }

  if (highestModuleDC > runningDC) {
    runningDC = highestModuleDC;
  }

  // UDU Compression modifiers
  if (uduCompression === 'Efficient') runningDC += 5;
  else if (uduCompression === 'Miniaturized') runningDC += 10;
  else if (uduCompression === 'Integrated') runningDC += 5;

  // Regional rarity
  if (isRare) runningDC += 5;

  return Math.max(0, Math.round(runningDC));
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
 * Computes full persistent metadata for Architecture on save.
 */
export function computeArchitectureStats(formData) {
  const footprint = formData.footprint || formData.scale || 'Large';
  const heightClass = formData.height_class || 'Single';
  const tl = formData.tl ?? 3;
  const environment = formData.environment || 'Standard';
  const matDef = ARCHITECTURE_MATERIALS[tl] || ARCHITECTURE_MATERIALS[3];
  const envDef = ENVIRONMENTAL_MODIFIERS[environment] || ENVIRONMENTAL_MODIFIERS.Standard;

  const totalSP = calculateArchitectureSP({
    footprint,
    heightClass,
    customStories: formData.stories,
    tl,
    bulwarkBonus: formData.bulwark_bonus || 0
  });

  const totalModules = calculateArchitectureModules({
    footprint,
    heightClass,
    customStories: formData.stories,
    mastercraftBonus: formData.mastercraft_bonus || 0
  });

  const specializedModules = formData.specialized_modules || formData.modules || [];
  let usedModules = 0;
  if (Array.isArray(specializedModules)) {
    for (const mod of specializedModules) {
      const modId = typeof mod === 'string' ? mod : mod.id;
      const count = typeof mod === 'object' && mod.count ? Number(mod.count) : 1;
      const modDef = SPECIALIZED_MODULE_CATALOG.find(m => m.id === modId || m.name === modId);
      if (modDef) {
        usedModules += modDef.modules * count;
      }
    }
  }

  const finalDC = calculateArchitectureDC({
    footprint,
    heightClass,
    customStories: formData.stories,
    tl,
    environment,
    specializedModules,
    uduCompression: formData.udu_compression,
    isRare: !!formData.is_rare,
    baseDC: formData.base_dc ?? formData.craft_dc
  });

  const baseCreditValue = calculateCreditValue(finalDC);
  const adjustedCreditValue = Math.round(baseCreditValue * (envDef.costMult || 1.0));
  const materialCost = calculateMaterialCost(adjustedCreditValue);

  const cooperativeTimeline = calculateCooperativeConstructionDays({
    creditValue: adjustedCreditValue,
    workforceWorkers: formData.workforce_workers || 10,
    avgSkillCheck: formData.workforce_skill || 15,
    toolTier: formData.tool_tier || 'Industrial'
  });

  return {
    final_dc: finalDC,
    credit_value: adjustedCreditValue,
    material_cost: materialCost,
    ws_threshold: finalDC,
    complexity_tier: getComplexityTier(finalDC),
    total_sp: totalSP,
    dr_rating: matDef.dr,
    total_modules: totalModules,
    used_modules: usedModules,
    remaining_modules: Number((totalModules - usedModules).toFixed(2)),
    is_module_overbudget: usedModules > totalModules,
    single_crafter_days: calculateAllCraftingTiers(adjustedCreditValue),
    cooperative_construction: cooperativeTimeline,
    udu_displacement: {
      tier: 'Module',
      count: totalModules
    },
    computed_at: new Date().toISOString()
  };
}
