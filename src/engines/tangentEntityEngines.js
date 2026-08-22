// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — PHASE 4 CHARACTER & CREATURE CALCULATION ENGINES
// Pure calculation helpers for Species, NPCs, Companions, Invocations, & Meta-Tech
// ═══════════════════════════════════════════════════════════

import {
  SPECIES_BUDGET_LEVELS,
  SPECIES_TYPES,
  SPECIES_SIZES,
  SPECIES_MOVEMENT_MODES,
  SPECIES_TRAITS_BASIC,
  SPECIES_TRAITS_ADVANCED,
  SPECIES_TRAITS_ELITE,
  SPECIES_DISADVANTAGES,
  THREAT_TIER_CHASSIS,
  COMPETENCY_ROLES,
  DESIGNATIONS,
  BOSS_TYPES,
  COMPANION_TYPES,
  COMPANION_FORM_PACKAGES,
  COMPANION_FUNCTION_PACKAGES,
  COMPANION_CONTROL_INTERFACES,
  COMPANION_BOND_FEATURES,
  INVOCATION_DISCIPLINES,
  INVOCATION_BASE_DIFFICULTIES,
  CASTING_TIME_MODIFIERS,
  INVOCATION_RANGE_MODIFIERS,
  INVOCATION_AOE_MODIFIERS,
  INVOCATION_DURATION_MODIFIERS,
  INVOCATION_OTHER_MODIFIERS,
  SKILL_STAGES,
  INVOCATION_SCALING_FORMULAS,
  META_TECH_ENHANCEMENT_TYPES,
  META_TECH_PASSIVE_CATALOG,
  META_TECH_SCALE_AMPLIFICATION,
  META_TECH_SOCKET_LIMITS
} from './tangentConstants.js';

import {
  calculateCreditValue,
  calculateMaterialCost,
  calculateAllCraftingTiers,
  getComplexityTier,
  getFinancialStatus
} from './tangentEconEngine.js';

// ═══════════════════════════════════════════════════════════
// 1. SPECIES FORGE ENGINE (PLAN 23)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates total Build Points (BP) used and budget remaining for a Species.
 * 
 * @param {object} params
 * @param {string} [params.type] - Species type ID (Aberration, Beast, etc.)
 * @param {string} [params.size] - Size category ID (Diminutive to Huge)
 * @param {Array<string>} [params.movementModes] - Selected movement mode IDs
 * @param {object} [params.attributes] - Attribute bonuses/penalties { str, agi, sta, int, wis, cha }
 * @param {number} [params.skillBundles] - Number of +5 Skill Point bundles (4 BP each)
 * @param {Array<string|object>} [params.traits] - Selected traits (Basic, Advanced, Elite)
 * @param {Array<string|object>} [params.disadvantages] - Selected disadvantages (refund BP)
 * @param {string} [params.budgetLevel] - Budget level ID ('Standard', 'Advanced', 'Monster')
 * @returns {object} Total BP breakdown and validation
 */
export function calculateSpeciesBP({
  type = 'Humanoid',
  size = 'Medium',
  movementModes = ['normal'],
  attributes = {},
  skillBundles = 0,
  traits = [],
  disadvantages = [],
  budgetLevel = 'Standard'
} = {}) {
  let bpTotal = 0;

  // 1. Species Type BP
  const typeDef = SPECIES_TYPES[type] || SPECIES_TYPES.Humanoid;
  const typeBP = Number(typeDef.bp || 0);
  bpTotal += typeBP;

  // 2. Size Category BP
  const sizeDef = SPECIES_SIZES[size] || SPECIES_SIZES.Medium;
  const sizeBP = Number(sizeDef.bp || 0);
  bpTotal += sizeBP;

  // 3. Movement Modes BP
  let movementBP = 0;
  if (Array.isArray(movementModes)) {
    for (const modeId of movementModes) {
      const mode = SPECIES_MOVEMENT_MODES.find(m => m.id === modeId || m.id === modeId?.id);
      if (mode) {
        movementBP += Number(mode.bp || 0);
      }
    }
  }
  bpTotal += movementBP;

  // 4. Attribute Modifiers (1 point = 4 BP, -1 point = -4 BP refund)
  let attributeBP = 0;
  if (attributes && typeof attributes === 'object') {
    for (const attr of ['str', 'agi', 'sta', 'int', 'wis', 'cha']) {
      const val = Number(attributes[attr] || 0);
      attributeBP += val * 4;
    }
  }
  bpTotal += attributeBP;

  // 5. Skill Points (Each +5 bundle costs 4 BP)
  const skillsBP = Math.max(0, Number(skillBundles || 0)) * 4;
  bpTotal += skillsBP;

  // 6. Traits Catalog (Basic 1 BP, Advanced 2 BP, Elite 4 BP)
  let traitsBP = 0;
  const allTraits = [...SPECIES_TRAITS_BASIC, ...SPECIES_TRAITS_ADVANCED, ...SPECIES_TRAITS_ELITE];
  if (Array.isArray(traits)) {
    for (const t of traits) {
      const traitId = typeof t === 'string' ? t : t?.id;
      const found = allTraits.find(item => item.id === traitId);
      if (found) {
        traitsBP += Number(found.bp || 1);
      } else if (typeof t === 'object' && t.bp) {
        traitsBP += Number(t.bp);
      }
    }
  }
  bpTotal += traitsBP;

  // 7. Disadvantages (Reduce BP)
  let disadvantagesRefund = 0;
  if (Array.isArray(disadvantages)) {
    for (const d of disadvantages) {
      const disId = typeof d === 'string' ? d : d?.id;
      const found = SPECIES_DISADVANTAGES.find(item => item.id === disId);
      if (found) {
        disadvantagesRefund += Number(found.refundBP || 0);
      } else if (typeof d === 'object' && d.refundBP) {
        disadvantagesRefund += Number(d.refundBP);
      }
    }
  }
  bpTotal -= disadvantagesRefund;

  // Ensure BP doesn't go below 0
  const finalBPUsed = Math.max(0, bpTotal);
  const budgetDef = SPECIES_BUDGET_LEVELS[budgetLevel] || SPECIES_BUDGET_LEVELS.Standard;
  const bpRemaining = budgetDef.maxBP - finalBPUsed;
  const isOverBudget = finalBPUsed > budgetDef.maxBP;

  return {
    totalBPUsed: finalBPUsed,
    bpRemaining,
    budgetMax: budgetDef.maxBP,
    budgetMin: budgetDef.minBP,
    budgetLevel,
    isOverBudget,
    breakdown: {
      typeBP,
      sizeBP,
      movementBP,
      attributeBP,
      skillsBP,
      traitsBP,
      disadvantagesRefund
    }
  };
}

/**
 * Calculates combat, defense, and mobility modifiers granted by size category.
 */
export function calculateSpeciesCombatModifiers(size = 'Medium') {
  const def = SPECIES_SIZES[size] || SPECIES_SIZES.Medium;
  return {
    size: def.id,
    strMod: def.strMod || 0,
    agiMod: def.agiMod || 0,
    combatMod: def.combatMod || 0,
    defMod: def.defMod || 0,
    stealthMod: def.stealthMod || 0,
    stabilityMod: def.stabilityMod || 0,
    dmgDieStep: def.dmgDieStep || 0,
    dmgDiceMult: def.dmgDiceMult || 1,
    speedMod: def.speedMod || 0,
    speedMult: def.speedMult || 1
  };
}

/**
 * Computes full persistent metadata for a Species document on save.
 */
export function computeSpeciesStats(formData) {
  const bpData = calculateSpeciesBP({
    type: formData.species_type || formData.type || 'Humanoid',
    size: formData.size || 'Medium',
    movementModes: formData.movement_modes || [formData.movement || 'normal'],
    attributes: formData.attributes || {
      str: formData.bonus_str || 0,
      agi: formData.bonus_agi || 0,
      sta: formData.bonus_sta || 0,
      int: formData.bonus_int || 0,
      wis: formData.bonus_wis || 0,
      cha: formData.bonus_cha || 0
    },
    skillBundles: formData.skill_bundles ?? Math.floor((formData.bonus_skills || 0) / 5),
    traits: formData.traits || [],
    disadvantages: formData.disadvantages || [],
    budgetLevel: formData.budget_level || 'Standard'
  });

  const combatMods = calculateSpeciesCombatModifiers(formData.size || 'Medium');
  const geneticDC = Math.max(10, Math.round(10 + bpData.totalBPUsed / 2));

  return {
    total_bp_used: bpData.totalBPUsed,
    bp_remaining: bpData.bpRemaining,
    budget_level: bpData.budgetLevel,
    is_over_budget: bpData.isOverBudget,
    bp_breakdown: bpData.breakdown,
    combat_modifiers: combatMods,
    genetic_dc: geneticDC,
    craft_dc: geneticDC,
    complexity_tier: getComplexityTier(geneticDC),
    computed_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════
// 2. MODULAR CHARACTER GENERATOR ENGINE (PLAN 24)
// ═══════════════════════════════════════════════════════════

/**
 * Computes base mathematical tier chassis and multipliers for an NPC.
 */
export function calculateThreatTierStats(tier = 3, role = 'Tank', bossType = 'Standard', size = 'Medium', isSynthetic = false) {
  const t = Math.min(20, Math.max(0, Math.round(Number(tier || 0))));
  const chassis = THREAT_TIER_CHASSIS[t] || THREAT_TIER_CHASSIS[3];
  const roleDef = COMPETENCY_ROLES[role] || COMPETENCY_ROLES.Tank;
  const bossDef = BOSS_TYPES[bossType] || BOSS_TYPES.Standard;

  // Base Vitality & Health (Base 30 + Tier Bonus)
  const basePool = 30 + chassis.vitHeaBonus;

  // Size Multiplier
  let sizeScale = 1.0;
  if (size === 'Diminutive') sizeScale = 0.1;
  else if (size === 'Tiny') sizeScale = 0.5;
  else if (size === 'Small') sizeScale = 0.8;
  else if (size === 'Large') sizeScale = 2.0;
  else if (size === 'Huge') sizeScale = 5.0;

  const scaledVitality = Math.round(basePool * sizeScale);
  const scaledHealth = Math.round(basePool * sizeScale);

  let finalVitality = 0;
  let finalHealth = 0;
  let isMinion = false;

  if (bossDef.isMinion) {
    isMinion = true;
    finalVitality = 0;
    finalHealth = 1; // 1 HP Rule
  } else {
    const multiplier = bossDef.multiplier || 1;
    finalVitality = scaledVitality * multiplier;
    finalHealth = scaledHealth * multiplier;
  }

  // Synthetics combine Vitality + Health into Structure Points (SP)
  let structurePoints = 0;
  if (isSynthetic) {
    structurePoints = finalVitality + finalHealth;
    finalVitality = 0;
    finalHealth = 0;
  }

  return {
    tier: t,
    narrativeRank: chassis.narrativeRank,
    attributeBonus: chassis.attrBonus,
    primarySkillRank: chassis.primarySkill,
    secondarySkillRank: chassis.secondarySkill,
    actionsPerRound: chassis.actions,
    expectedDR: chassis.dr,
    wealthScore: t,
    isMinion,
    isBoss: !!bossDef.isBoss,
    isMastermind: !!bossDef.isMastermind,
    vitality: finalVitality,
    health: finalHealth,
    structurePoints,
    sizeScale,
    role: roleDef.name,
    primaryAttributes: roleDef.primaryAttrs,
    keySkills: roleDef.keySkills,
    roleFeature: roleDef.feature
  };
}

/**
 * Derives full combat stat block for an NPC.
 */
export function calculateNPCCombatBlock({
  tier = 3,
  role = 'Tank',
  bossType = 'Standard',
  size = 'Medium',
  designation = 'Adversary',
  agility = null,
  isSynthetic = false
} = {}) {
  const tierStats = calculateThreatTierStats(tier, role, bossType, size, isSynthetic);
  const agiMod = agility !== null && agility !== undefined ? Number(agility) : tierStats.attributeBonus;
  
  // Defense DC = 10 + Agility Mod + Defense Skill Rank (Primary or Secondary based on role)
  const isDefPrimary = tierStats.keySkills.includes('Defense');
  const defSkillRank = isDefPrimary ? tierStats.primarySkillRank : tierStats.secondarySkillRank;
  const sizeCombatMods = calculateSpeciesCombatModifiers(size);
  const defenseDC = 10 + agiMod + defSkillRank + sizeCombatMods.defMod;

  // Attack Bonus = Primary Attribute Mod + Primary Combat Skill Rank + Size Combat Mod
  const attackBonus = tierStats.attributeBonus + tierStats.primarySkillRank + sizeCombatMods.combatMod;

  // Initiative = Agility Mod + Alertness Rank (Secondary skill rank)
  const initiative = agiMod + tierStats.secondarySkillRank;

  // Base Movement Speed (30 ft modified by size)
  let speed = 30 + sizeCombatMods.speedMod;
  if (sizeCombatMods.speedMult > 1) speed *= sizeCombatMods.speedMult;

  // Saves (10 + Attr Mod)
  const saves = {
    fortitude: 10 + tierStats.attributeBonus,
    reflex: 10 + agiMod,
    will: 10 + tierStats.attributeBonus
  };

  return {
    ...tierStats,
    designation,
    defenseDC,
    attackBonus,
    initiative,
    speed,
    saves
  };
}

/**
 * Computes full persistent metadata for a Modular Character on save.
 */
export function computeModularCharacterStats(formData) {
  const tier = Number(formData.threatTier ?? formData.threat_tier ?? formData.craft_dc ?? 3);
  const role = formData.competencyRole ?? formData.role ?? 'Tank';
  const bossType = formData.bossType ?? formData.boss_type ?? 'Standard';
  const size = formData.sizeCategory ?? formData.size ?? 'Medium';
  const designation = formData.designation || 'Adversary';
  const isSynthetic = !!(formData.isSynthetic || formData.species === 'Synthetic');

  const block = calculateNPCCombatBlock({
    tier,
    role,
    bossType,
    size,
    designation,
    isSynthetic
  });

  const encounterDC = Math.min(80, Math.max(10, Math.round(tier * 2.5 + (block.isBoss ? 5 : 0) + (block.isMastermind ? 10 : 0))));

  return {
    threat_tier: tier,
    narrative_rank: block.narrativeRank,
    designation: block.designation,
    competency_role: block.role,
    vitality: block.vitality,
    health: block.health,
    structure_points: block.structurePoints,
    defense_dc: block.defenseDC,
    attack_bonus: block.attackBonus,
    expected_dr: block.expectedDR,
    initiative_bonus: block.initiative,
    tactical_speed: `${block.speed} ft/rnd`,
    actions_per_round: block.actionsPerRound,
    saving_throws: block.saves,
    wealth_score: block.wealthScore,
    encounter_dc: encounterDC,
    craft_dc: encounterDC,
    complexity_tier: getComplexityTier(encounterDC),
    computed_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════
// 3. COMPANION FORGE ENGINE (PLAN 25)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates BP usage for a Companion based on packages and custom allocations.
 */
export function calculateCompanionBP({
  form = 'canine',
  functions = ['guardian_attack'],
  attributes = {},
  extraFeatures = [],
  size = 'Medium',
  companionRank = 1
} = {}) {
  let bpTotal = 0;

  // Base Budget: Rank 1 = 40 BP, +10 BP per additional rank
  const rank = Math.max(1, Number(companionRank || 1));
  const maxBP = 40 + (rank - 1) * 10;

  // 1. Form Package BP
  const formDef = COMPANION_FORM_PACKAGES.find(f => f.id === form) || COMPANION_FORM_PACKAGES[0];
  bpTotal += formDef.baseBP || 10;

  // 2. Function Packages BP
  if (Array.isArray(functions)) {
    for (const funcId of functions) {
      const funcDef = COMPANION_FUNCTION_PACKAGES.find(f => f.id === funcId);
      if (funcDef) {
        bpTotal += funcDef.bpCost || 8;
      }
    }
  }

  // 3. Custom Attributes (4 BP per +1)
  if (attributes && typeof attributes === 'object') {
    for (const attr of ['str', 'agi', 'sta', 'int', 'wis', 'cha']) {
      const val = Number(attributes[attr] || 0);
      bpTotal += val * 4;
    }
  }

  // 4. Extra Sub-features / Bonds (2-3 BP each)
  if (Array.isArray(extraFeatures)) {
    for (const feat of extraFeatures) {
      const featDef = COMPANION_BOND_FEATURES.find(b => b.id === feat || b.id === feat?.id);
      if (featDef) {
        bpTotal += featDef.bpCost || 3;
      } else if (typeof feat === 'object' && feat.bpCost) {
        bpTotal += feat.bpCost;
      }
    }
  }

  // 5. Size Modifier BP (Small/Tiny = 2 BP, Large = 2 BP)
  if (size === 'Small' || size === 'Tiny' || size === 'Large') {
    bpTotal += 2;
  }

  const bpRemaining = maxBP - bpTotal;
  const isOverBudget = bpTotal > maxBP;

  return {
    totalBPUsed: bpTotal,
    bpRemaining,
    maxBudget: maxBP,
    companionRank: rank,
    isOverBudget
  };
}

/**
 * Derives full combat statistics for a Companion scaling with Owner's Tier.
 */
export function calculateCompanionStats({
  ownerTier = 1,
  type = 'Biological',
  form = 'canine',
  functions = ['guardian_attack'],
  size = 'Medium',
  companionRank = 1
} = {}) {
  const oTier = Math.min(20, Math.max(1, Math.round(Number(ownerTier || 1))));
  const chassis = THREAT_TIER_CHASSIS[oTier] || THREAT_TIER_CHASSIS[1];
  const formDef = COMPANION_FORM_PACKAGES.find(f => f.id === form) || COMPANION_FORM_PACKAGES[0];
  const compType = COMPANION_TYPES[type] || COMPANION_TYPES.Biological;

  // Base pools scaling with owner tier
  const basePool = 20 + chassis.vitHeaBonus;
  let vitality = 0;
  let health = 0;
  let structurePoints = 0;
  let essence = 0;

  if (type === 'Synthetic') {
    structurePoints = Math.round(basePool * 1.5);
  } else if (type === 'Metaphysical') {
    essence = basePool;
    health = basePool;
  } else {
    vitality = basePool;
    health = basePool;
  }

  // Base combat attributes from form
  const str = (formDef.stats?.str || 0) + chassis.attrBonus;
  const agi = (formDef.stats?.agi || 0) + chassis.attrBonus;
  const sta = (formDef.stats?.sta || 0) + chassis.attrBonus;

  // Attack Bonus = Form Str/Agi + Owner Tier Primary Skill Rank / 2
  const attackBonus = Math.max(str, agi) + Math.round(chassis.primarySkill / 2);

  // Defense DC = 10 + Agi + Chassis DR baseline
  const sizeMods = calculateSpeciesCombatModifiers(size);
  const defenseDC = 10 + agi + sizeMods.defMod;
  const dr = chassis.dr + (size === 'Large' ? 2 : 0);

  // Sockets / Mounts
  const hardpoints = size === 'Large' ? { tier: 'Mount', count: 1 } : { tier: 'Socket', count: size === 'Medium' ? 2 : 1 };

  return {
    ownerTier: oTier,
    companionType: compType.name,
    integrityType: compType.integrityType,
    recoveryMethod: compType.recovery,
    vitality,
    health,
    structurePoints,
    essence,
    defenseDC,
    attackBonus,
    dr,
    actionsPerRound: chassis.actions,
    speed: `${30 + sizeMods.speedMod} ft/rnd`,
    hardpoints,
    formFeatures: formDef.bonusFeatures || []
  };
}

/**
 * Computes full persistent metadata for a Companion on save.
 */
export function computeCompanionStats(formData) {
  const bp = calculateCompanionBP({
    form: formData.form_package || formData.form || 'canine',
    functions: formData.function_packages || formData.functions || ['guardian_attack'],
    attributes: formData.attributes || {},
    extraFeatures: formData.extra_features || formData.bonds || [],
    size: formData.size || 'Medium',
    companionRank: formData.companion_rank || 1
  });

  const stats = calculateCompanionStats({
    ownerTier: formData.owner_tier || formData.ownerTier || 1,
    type: formData.companion_type || formData.type || 'Biological',
    form: formData.form_package || formData.form || 'canine',
    functions: formData.function_packages || formData.functions || ['guardian_attack'],
    size: formData.size || 'Medium',
    companionRank: formData.companion_rank || 1
  });

  const synthesisDC = Math.max(10, Math.round(15 + bp.totalBPUsed / 4 + stats.ownerTier));

  return {
    total_bp_used: bp.totalBPUsed,
    bp_remaining: bp.bpRemaining,
    is_over_budget: bp.isOverBudget,
    owner_tier: stats.ownerTier,
    companion_type: stats.companionType,
    integrity_type: stats.integrityType,
    vitality: stats.vitality,
    health: stats.health,
    structure_points: stats.structurePoints,
    essence: stats.essence,
    defense_dc: stats.defenseDC,
    attack_bonus: stats.attackBonus,
    dr_rating: stats.dr,
    actions: stats.actionsPerRound,
    speed: stats.speed,
    hardpoints: stats.hardpoints,
    form_features: stats.formFeatures,
    craft_dc: synthesisDC,
    complexity_tier: getComplexityTier(synthesisDC),
    computed_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════
// 4. INVOCATION FORGE ENGINE (PLAN 26)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates the Final Manifestation / Cast DC for an Invocation.
 */
export function calculateInvocationDC({
  baseDC = 15,
  time = 'StandardAction',
  range = 'Medium',
  aoe = 'SingleTarget',
  duration = 'Instant',
  otherMods = []
} = {}) {
  let dc = Number(baseDC || 15);

  // Time Modifier
  if (CASTING_TIME_MODIFIERS[time]) {
    dc += CASTING_TIME_MODIFIERS[time].dcMod;
  }

  // Range Modifier
  if (INVOCATION_RANGE_MODIFIERS[range]) {
    dc += INVOCATION_RANGE_MODIFIERS[range].dcMod;
  }

  // Area of Effect Modifier
  if (INVOCATION_AOE_MODIFIERS[aoe]) {
    dc += INVOCATION_AOE_MODIFIERS[aoe].dcMod;
  }

  // Duration Modifier
  if (INVOCATION_DURATION_MODIFIERS[duration]) {
    dc += INVOCATION_DURATION_MODIFIERS[duration].dcMod;
  }

  // Other Modifiers
  if (Array.isArray(otherMods)) {
    for (const mod of otherMods) {
      const modId = typeof mod === 'string' ? mod : mod?.id;
      const found = INVOCATION_OTHER_MODIFIERS.find(m => m.id === modId);
      if (found) {
        dc += found.dcMod;
      } else if (typeof mod === 'object' && mod.dcMod) {
        dc += Number(mod.dcMod);
      }
    }
  }

  return Math.max(5, Math.round(dc));
}

/**
 * Resolves Skill Stage from Skill Rank or DC.
 */
export function getSkillStageFromRank(rank = 1) {
  const r = Math.max(1, Number(rank || 1));
  if (r <= 5) return SKILL_STAGES[0]; // Stage 1 Novice
  if (r <= 10) return SKILL_STAGES[1]; // Stage 2 Trained
  if (r <= 15) return SKILL_STAGES[2]; // Stage 3 Expert
  if (r <= 20) return SKILL_STAGES[3]; // Stage 4 Master
  return SKILL_STAGES[4]; // Stage 5 Pinnacle
}

export function getSkillStageFromDC(dc = 15) {
  const d = Number(dc || 15);
  if (d < 15) return SKILL_STAGES[0];
  if (d < 20) return SKILL_STAGES[1];
  if (d < 25) return SKILL_STAGES[2];
  if (d < 30) return SKILL_STAGES[3];
  return SKILL_STAGES[4];
}

/**
 * Calculates Essence cost when pushing an Invocation beyond learned stage.
 */
export function calculateEssenceCost(targetStage = 2, casterStage = 2, sustainedEffectsCount = 1) {
  const pushStages = Math.max(0, Number(targetStage || 0) - Number(casterStage || 0));
  const sustainedCost = Math.max(0, Number(sustainedEffectsCount || 1) - 1);
  return {
    pushCostPerRound: pushStages,
    sustainedCostPerRound: sustainedCost,
    totalEssencePerRound: pushStages + sustainedCost,
    isPushed: pushStages > 0
  };
}

/**
 * Resolves standard scaling formula for an Invocation stage.
 */
export function calculateInvocationScaling(effectType = 'energyDamage', stageNum = 1) {
  const stage = Math.max(1, Math.min(5, Number(stageNum || 1)));
  const formulaDef = INVOCATION_SCALING_FORMULAS[effectType] || INVOCATION_SCALING_FORMULAS.energyDamage;
  return {
    effectType: formulaDef.name,
    stage,
    scaledOutput: formulaDef.formula(stage),
    scalingRule: formulaDef.scaling
  };
}

/**
 * Computes full persistent metadata for an Invocation on save.
 */
export function computeInvocationStats(formData) {
  const baseDC = Number(formData.baseDifficulty ?? formData.base_dc ?? formData.craft_dc ?? 15);
  const time = formData.time ?? formData.casting_time ?? 'StandardAction';
  const range = formData.range ?? 'Medium';
  const aoe = formData.area ?? formData.aoe ?? 'SingleTarget';
  const duration = formData.duration ?? 'Instant';
  const otherMods = formData.otherModifiers ?? formData.other_mods ?? [];

  const finalDC = calculateInvocationDC({
    baseDC,
    time,
    range,
    aoe,
    duration,
    otherMods
  });

  const skillStage = getSkillStageFromDC(finalDC);
  const essenceThresholds = {
    Stage1_Novice: 0,
    Stage2_Trained: finalDC >= 15 ? 0 : 1,
    Stage3_Expert: finalDC >= 20 ? 0 : (finalDC >= 15 ? 1 : 2),
    Stage4_Master: finalDC >= 25 ? 0 : (finalDC >= 20 ? 1 : 2),
    Stage5_Pinnacle: finalDC >= 30 ? 0 : (finalDC >= 25 ? 1 : 2)
  };

  return {
    base_dc: baseDC,
    final_cast_dc: finalDC,
    craft_dc: finalDC,
    skill_stage: skillStage.name,
    skill_stage_num: skillStage.stage,
    essence_cost_thresholds: essenceThresholds,
    complexity_tier: getComplexityTier(finalDC),
    computed_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════
// 5. META-TECH FORGE ENGINE (PLAN 27)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates Crafting / Synthesis DC for a Meta-Tech enchanted device.
 */
export function calculateMetaTechDC({
  enhancementType = 'Passive',
  baseItemDC = 15,
  invocationRank = 10,
  tl = 3,
  socketsUsed = 1,
  dailyCharges = null
} = {}) {
  const baseDC = Number(baseItemDC || 15);
  const rank = Math.max(1, Number(invocationRank || 10));
  const sockets = Math.max(1, Number(socketsUsed || 1));
  const techLevel = Math.max(0, Number(tl || 3));

  if (enhancementType === 'Passive') {
    // Passive: Base Item DC + (Sockets Used * 5)
    return Math.round(baseDC + sockets * 5);
  }

  if (enhancementType === 'Consumable') {
    // Consumable: 15 + Invocation Rank - 10 Consumable Discount
    return Math.max(5, Math.round(15 + rank - 10));
  }

  if (enhancementType === 'Amplifier') {
    // Amplifier: Base Item DC + 10
    return Math.round(baseDC + 10);
  }

  // Active Imbuement: Base 15 + Invocation Rank + TL Mod
  let activeDC = 15 + rank;
  if (techLevel > 3) {
    activeDC += (techLevel - 3) * 2;
  }
  if (dailyCharges !== null && dailyCharges !== undefined && Number(dailyCharges) <= 3) {
    activeDC = Math.round(15 + rank / 2); // Limited uses per day discount
  }

  return Math.max(10, Math.round(activeDC));
}

/**
 * Validates UDU Socket / Mount / Module capacity for Meta-Tech.
 */
export function calculateMetaTechCapacity({
  socketsUsed = 1,
  invocationRank = 10,
  scaleTier = 'Personal'
} = {}) {
  const sockets = Math.max(1, Number(socketsUsed || 1));
  const rank = Math.max(1, Number(invocationRank || 1));
  const scaleDef = META_TECH_SCALE_AMPLIFICATION[scaleTier] || META_TECH_SCALE_AMPLIFICATION.Personal;

  let maxAllowedRank = 10;
  if (scaleTier === 'Huge' || scaleTier === 'Gargantuan' || scaleTier === 'Titanic') {
    maxAllowedRank = 30; // Mounts and Modules support up to Rank 30
  } else {
    maxAllowedRank = sockets >= 3 ? 30 : (sockets >= 2 ? 20 : 10);
  }

  const isOverloaded = rank > maxAllowedRank;
  const capacityStatus = isOverloaded ? 'Overloaded' : 'Valid';

  return {
    socketsUsed: sockets,
    invocationRank: rank,
    maxAllowedRank,
    scaleTier: scaleDef.name,
    scaleMultiplier: scaleDef.multiplier,
    capacityUnit: scaleDef.unit,
    isOverloaded,
    capacityStatus
  };
}

/**
 * Computes full persistent metadata for a Meta-Tech device on save.
 */
export function computeMetaTechStats(formData) {
  const enhancementType = formData.enhancement_type || formData.enhancementType || 'Active';
  const baseItemDC = Number(formData.base_item_dc ?? formData.baseItemDC ?? 15);
  const invocationRank = Number(formData.invocation_rank ?? formData.invocationRank ?? 10);
  const tl = Number(formData.tech_level ?? formData.tl ?? 3);
  const socketsUsed = Number(formData.sockets_used ?? formData.socketsUsed ?? (invocationRank > 10 ? (invocationRank > 20 ? 3 : 2) : 1));
  const dailyCharges = formData.daily_charges ?? null;
  const scaleTier = formData.scale_tier || 'Personal';

  const finalDC = calculateMetaTechDC({
    enhancementType,
    baseItemDC,
    invocationRank,
    tl,
    socketsUsed,
    dailyCharges
  });

  const capacity = calculateMetaTechCapacity({
    socketsUsed,
    invocationRank,
    scaleTier
  });

  const creditValue = calculateCreditValue(finalDC);
  const materialCost = calculateMaterialCost(creditValue);
  const craftingDays = calculateAllCraftingTiers(creditValue);
  const status = getFinancialStatus(finalDC);
  const saveDC = 10 + Math.floor(invocationRank / 2);

  return {
    enhancement_type: enhancementType,
    final_dc: finalDC,
    craft_dc: finalDC,
    credit_value: creditValue,
    material_cost: materialCost,
    crafting_days: craftingDays,
    financial_status: status?.name || 'Affluent',
    save_dc: saveDC,
    capacity_validation: capacity,
    complexity_tier: getComplexityTier(finalDC),
    computed_at: new Date().toISOString()
  };
}
