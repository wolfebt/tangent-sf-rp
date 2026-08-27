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
  META_TECH_SOCKET_LIMITS,
  VITALITY_HEALTH_STRUCTURE_RULES,
  DEATH_AND_DYING_RULES,
  EXPERIENCE_RULES
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

  // 4. Attribute Modifiers (1 point = 5 BP, -1 point = -5 BP refund)
  let attributeBP = 0;
  if (attributes && typeof attributes === 'object') {
    for (const attr of ['str', 'agi', 'sta', 'int', 'wis', 'cha']) {
      const val = Number(attributes[attr] || 0);
      attributeBP += val * 5;
    }
  }
  bpTotal += attributeBP;

  // 5. Skill Points (Each +5 bundle costs 5 BP)
  const skillsBP = Math.max(0, Number(skillBundles || 0)) * 5;
  bpTotal += skillsBP;

  // 6. Traits Catalog (Basic 1 BP, Advanced 2 BP, Elite 4 BP)
  let traitsBP = 0;
  const allTraits = [...SPECIES_TRAITS_BASIC, ...SPECIES_TRAITS_ADVANCED, ...SPECIES_TRAITS_ELITE];
  if (Array.isArray(traits)) {
    for (const t of traits) {
      const traitId = typeof t === 'string' ? t : (t?.id || t?.code || t?.name);
      const cleanTraitId = (traitId || '').toString().toLowerCase().replace(/^trait-species-/, '').replace(/^trait-/, '').replace(/-/g, '_');
      const found = allTraits.find(item => 
        item.id === traitId || 
        item.code === traitId ||
        item.id === cleanTraitId ||
        (item.name && item.name.toLowerCase() === traitId.toLowerCase())
      );
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
      const disId = typeof d === 'string' ? d : (d?.id || d?.code || d?.name);
      const cleanDisId = (disId || '').toString().toLowerCase().replace(/^disadvantage-species-/, '').replace(/^disadvantage-/, '').replace(/-/g, '_');
      const found = SPECIES_DISADVANTAGES.find(item => 
        item.id === disId || 
        item.code === disId ||
        item.id === cleanDisId ||
        (item.name && item.name.toLowerCase() === disId.toLowerCase())
      );
      if (found) {
        disadvantagesRefund += Number(found.refundBP || Math.abs(found.costBP) || 0);
      } else if (typeof d === 'object' && (d.refundBP || d.costBP)) {
        disadvantagesRefund += Number(d.refundBP || Math.abs(d.costBP));
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
    finalHealth = 1; // 1 Health Rule
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
    structurePoints = basePool * 2; // Vitality + Health combined for Structure score
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
  const socketsUsed = Number(formData.sockets?.used ?? formData.sockets_used ?? formData.socketsUsed ?? (invocationRank > 10 ? (invocationRank > 20 ? 3 : 2) : 1));
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

// ═══════════════════════════════════════════════════════════
// 6. VITALITY, HEALTH & STRUCTURE ENGINES
// ═══════════════════════════════════════════════════════════

/**
 * Derives base Toughness from the character's Stamina Ability Score.
 * Toughness reduces incoming wound damage on a point-for-point basis.
 * 
 * @param {number} staminaScore - Raw or modified Stamina Ability Score
 * @returns {number} Toughness value
 */
export function calculateBaseToughness(staminaScore = 0) {
  return Number(staminaScore) || 0;
}

/**
 * Computes starting and maximum pools for Vitality, Health, or Structure.
 * - Starting base: 30 Vitality and 30 Health
 * - BP Cost: 1 BP = +5 Vitality or +5 Health (suggested max 60 each at creation)
 * - Structure = Vitality + Health for Synthetics, Mecha, Oozes, Undead, Golems, Elementals, etc.
 * 
 * @param {object} params
 * @param {number} [params.vitalityBP=0] - Number of BP spent on Vitality
 * @param {number} [params.healthBP=0] - Number of BP spent on Health
 * @param {boolean} [params.isSynthetic=false] - Whether entity uses Structure instead of Vitality/Health
 * @param {number} [params.staminaScore=0] - Stamina score for Toughness derivation
 * @returns {object} Calculated pools and resilience stats
 */
export function calculateVitalityHealthPools({
  vitalityBP = 0,
  healthBP = 0,
  isSynthetic = false,
  staminaScore = 0
} = {}) {
  const baseVitality = VITALITY_HEALTH_STRUCTURE_RULES.startingBaseVitality + (Math.max(0, Number(vitalityBP || 0)) * 5);
  const baseHealth = VITALITY_HEALTH_STRUCTURE_RULES.startingBaseHealth + (Math.max(0, Number(healthBP || 0)) * 5);
  const toughness = calculateBaseToughness(staminaScore);

  if (isSynthetic) {
    const structurePoints = baseVitality + baseHealth;
    return {
      vitality: 0,
      health: 0,
      structure: structurePoints,
      maxVitality: 0,
      maxHealth: 0,
      maxStructure: structurePoints,
      toughness,
      isSynthetic: true,
      purchasedVitality: Math.max(0, Number(vitalityBP || 0)) * 5,
      purchasedHealth: Math.max(0, Number(healthBP || 0)) * 5,
      vitalityBPCost: Math.max(0, Number(vitalityBP || 0)),
      healthBPCost: Math.max(0, Number(healthBP || 0)),
      suggestedMax: VITALITY_HEALTH_STRUCTURE_RULES.suggestedStartingMax
    };
  }

  return {
    vitality: baseVitality,
    health: baseHealth,
    structure: 0,
    maxVitality: baseVitality,
    maxHealth: baseHealth,
    maxStructure: 0,
    toughness,
    isSynthetic: false,
    purchasedVitality: Math.max(0, Number(vitalityBP || 0)) * 5,
    purchasedHealth: Math.max(0, Number(healthBP || 0)) * 5,
    vitalityBPCost: Math.max(0, Number(vitalityBP || 0)),
    healthBPCost: Math.max(0, Number(healthBP || 0)),
    suggestedMax: VITALITY_HEALTH_STRUCTURE_RULES.suggestedStartingMax
  };
}

/**
 * Calculates Concussive Damage distribution (falls, explosions, crashes).
 * Traumatic damage dispersed over the entire body. If character attempts to reduce
 * damage (Reflex save, defensive action), damage is divided equally between
 * Vitality and Health, regardless of whether the reduction attempt was successful.
 * 
 * @param {number} incomingDamage - Raw incoming concussive damage
 * @param {boolean} [attemptedReduction=true] - Whether the character attempted to mitigate/reduce
 * @returns {object} Split allocation { vitalityDamage, healthDamage, wasSplit }
 */
export function calculateConcussiveDamageSplit(incomingDamage = 0, attemptedReduction = true) {
  const dmg = Math.max(0, Number(incomingDamage) || 0);
  if (attemptedReduction && dmg > 0) {
    const vitDmg = Math.ceil(dmg / 2);
    const heaDmg = Math.floor(dmg / 2);
    return {
      vitalityDamage: vitDmg,
      healthDamage: heaDmg,
      totalDamage: dmg,
      wasSplit: true
    };
  }

  return {
    vitalityDamage: dmg,
    healthDamage: 0,
    totalDamage: dmg,
    wasSplit: false
  };
}

/**
 * Canonical Damage Resolution Engine according to Tangent rules:
 * 1. Health vs. Vitality:
 *    - Vitality represents stamina, luck, and minor bruising. This is a track of nonlethal damage.
 *    - Health represents physical trauma and structural integrity. It is lost from lethal damage
 *      or after Vitality is depleted.
 *    - Nonlethal damage directly depletes Vitality. When Vitality is 0, excess spills into Health.
 *    - Lethal damage (including Critical Hits) directly depletes Health. Any excess damage beyond
 *      0 Health is applied to Vitality (if any remains).
 *    - Synthetics / non-standard anatomies take damage directly to Structure (no Vitality buffer).
 *    - Concussive damage with attempted reduction splits 50/50 between Vitality and Health.
 * 
 * 2. Threshold of Death & Death's Door:
 *    - 0 Health (Incapacitated): The character falls unconscious immediately, drops anything
 *      they are holding, and falls Prone. Excess damage applied to Vitality.
 *    - Death's Door: Reached when Health is 0 AND Vitality is depleted (0).
 *      - Condition: Comatose and severely wounded.
 *      - The Clock: Character has a number of rounds equal to Stamina Score (min 1 round) to receive aid.
 *      - Stabilization: DC 15 Medicine check or healing magic/tech stops the clock. Remains unconscious.
 *      - Death: Permanent death when clock expires.
 *      - Massive Damage: Single hit >= STA score while at Death's Door causes instant death.
 * 
 * @param {object} params
 * @param {number} [params.currentVitality=30]
 * @param {number} [params.currentHealth=30]
 * @param {number} [params.currentStructure=60]
 * @param {boolean} [params.isSynthetic=false]
 * @param {number} [params.incomingDamage=0]
 * @param {boolean} [params.isNonLethal=false]
 * @param {boolean} [params.isCritical=false]
 * @param {boolean} [params.isConcussive=false]
 * @param {boolean} [params.attemptedReduction=true]
 * @param {number} [params.toughness=0]
 * @param {number} [params.armorDR=0]
 * @param {number} [params.staminaScore=0]
 * @param {boolean} [params.isAtDeathsDoor=false]
 * @param {number} [params.deathClockCurrent=undefined]
 * @returns {object} Damage resolution state
 */
export function applyDamageToEntity({
  currentVitality = 30,
  currentHealth = 30,
  currentStructure = 60,
  isSynthetic = false,
  incomingDamage = 0,
  isNonLethal = false,
  isCritical = false,
  isConcussive = false,
  attemptedReduction = true,
  toughness = 0,
  armorDR = 0,
  staminaScore = 0,
  isAtDeathsDoor = false,
  deathClockCurrent = undefined
} = {}) {
  const rawDmg = Math.max(0, Number(incomingDamage) || 0);
  const effectiveToughness = (toughness !== undefined && toughness !== null)
    ? Math.max(0, Number(toughness) || 0)
    : Math.max(0, Number(staminaScore) || 0);
  const totalReduction = Math.max(0, Number(armorDR) || 0) + effectiveToughness;
  const netDamage = Math.max(0, rawDmg - totalReduction);
  const damageSoaked = rawDmg - netDamage;
  const sta = Math.max(1, Number(staminaScore) || 1);

  if (isSynthetic) {
    // Structure damage directly, no Vitality buffer
    const newStructure = Math.max(0, currentStructure - netDamage);
    const destroyed = newStructure <= 0;
    const conditions = destroyed ? ['Dead'] : [];
    return {
      newVitality: 0,
      newHealth: 0,
      newStructure,
      damageSoaked,
      netDamage,
      spillover: 0,
      excessToVitality: 0,
      incapacitated: destroyed,
      unconscious: destroyed,
      prone: destroyed,
      droppedHeldItems: destroyed,
      atDeathsDoor: false,
      isAtDeathsDoor: false,
      comatose: false,
      isComatose: false,
      deathClock: null,
      deathClockRemaining: null,
      deathClockMax: null,
      massiveDamageDeath: false,
      instantDeath: false,
      dead: destroyed,
      isDead: destroyed,
      conditions,
      isSynthetic: true
    };
  }

  // Biological / living targets
  // Check if character was already at Death's Door before this incoming hit
  const wasAtDeathsDoor = Boolean(isAtDeathsDoor || (currentHealth <= 0 && currentVitality <= 0));
  let massiveDamageDeath = false;
  if (wasAtDeathsDoor && netDamage >= sta) {
    massiveDamageDeath = true;
  }

  let newVitality = currentVitality;
  let newHealth = currentHealth;
  let spillover = 0;
  let excessToVitality = 0;
  let concussiveSplit = null;

  if (isConcussive && attemptedReduction) {
    concussiveSplit = calculateConcussiveDamageSplit(netDamage, true);
    let remVit = currentVitality - concussiveSplit.vitalityDamage;
    let remHealth = currentHealth - concussiveSplit.healthDamage;

    // If Vitality depleted, excess spills into Health
    if (remVit < 0) {
      remHealth -= Math.abs(remVit);
      spillover = Math.abs(remVit);
      remVit = 0;
    }

    // If Health depleted, excess applies to remaining Vitality
    if (remHealth < 0) {
      excessToVitality = Math.abs(remHealth);
      remHealth = 0;
      remVit = Math.max(0, remVit - excessToVitality);
    }

    newVitality = remVit;
    newHealth = remHealth;
  } else if (isNonLethal) {
    // Nonlethal damage track: Vitality is depleted first.
    // Only after Vitality is completely depleted does excess spill into Health.
    let remVit = currentVitality - netDamage;
    if (remVit < 0) {
      spillover = Math.abs(remVit);
      remVit = 0;
    }
    newVitality = remVit;
    newHealth = Math.max(0, currentHealth - spillover);
  } else {
    // Lethal attack (or Critical Hit): Damages Health directly.
    // When reduced to 0 Health: falls unconscious, drops items, falls prone.
    // Any excess damage is applied to Vitality (if any remains).
    let remHealth = currentHealth - netDamage;
    let remVit = currentVitality;
    if (remHealth < 0) {
      excessToVitality = Math.abs(remHealth);
      remHealth = 0;
      remVit = Math.max(0, currentVitality - excessToVitality);
    }
    newHealth = remHealth;
    newVitality = remVit;
  }

  const zeroHealth = newHealth <= 0;
  const zeroVitality = newVitality <= 0;
  const incapacitated = zeroHealth;
  const unconscious = zeroHealth;
  const prone = zeroHealth;
  const droppedHeldItems = zeroHealth;
  const atDeathsDoor = zeroHealth && zeroVitality;
  const comatose = atDeathsDoor;
  const deathClockMax = sta;

  let deathClock = null;
  if (atDeathsDoor) {
    deathClock = deathClockCurrent !== undefined ? Math.min(deathClockCurrent, deathClockMax) : deathClockMax;
  }

  const dead = massiveDamageDeath || (deathClock !== null && deathClock <= 0);

  const conditions = [];
  if (dead) {
    conditions.push('Dead');
  } else {
    if (incapacitated) {
      conditions.push('Incapacitated', 'Unconscious', 'Prone');
    }
    if (atDeathsDoor) {
      conditions.push("Death's Door", 'Comatose');
    }
  }

  return {
    newVitality,
    newHealth,
    newStructure: 0,
    damageSoaked,
    netDamage,
    vitalityDamageTaken: currentVitality - newVitality,
    healthDamageTaken: currentHealth - newHealth,
    spillover,
    excessToVitality,
    incapacitated,
    unconscious,
    prone,
    droppedHeldItems,
    atDeathsDoor,
    isAtDeathsDoor: atDeathsDoor,
    comatose,
    isComatose: comatose,
    deathClock,
    deathClockRemaining: deathClock,
    deathClockMax,
    massiveDamageDeath,
    instantDeath: massiveDamageDeath,
    dead,
    isDead: dead,
    conditions,
    isSynthetic: false,
    concussiveSplit
  };
}

/**
 * Calculates Death's Door clock rounds based on character Stamina score (minimum 1 round).
 * 
 * @param {number} staminaScore
 * @returns {number}
 */
export function calculateDeathClock(staminaScore) {
  return Math.max(1, Number(staminaScore) || 1);
}

/**
 * Checks if a single hit at Death's Door meets or exceeds STA score for massive damage instant death.
 * 
 * @param {number} incomingDamage Net damage after soak
 * @param {number} staminaScore
 * @returns {boolean}
 */
export function checkMassiveDamage(incomingDamage, staminaScore) {
  const dmg = Math.max(0, Number(incomingDamage) || 0);
  const sta = Math.max(1, Number(staminaScore) || 1);
  return dmg >= sta;
}

/**
 * Resolves stabilization attempt for a dying character at Death's Door:
 * A successful Medicine (DC 15) check or healing magic/tech stops the clock.
 * The character remains unconscious but is no longer dying.
 * 
 * @param {object} params
 * @param {number} [params.medicineCheckRoll=0]
 * @param {boolean} [params.isMedicineSuccess=false]
 * @param {boolean} [params.hasHealingEffect=false]
 * @returns {object}
 */
export function stabilizeEntity({
  medicineCheckRoll = 0,
  isMedicineSuccess = false,
  hasHealingEffect = false
} = {}) {
  const isStabilized = Boolean(hasHealingEffect || isMedicineSuccess || (Number(medicineCheckRoll) >= 15));
  return {
    stabilized: isStabilized,
    targetDC: 15,
    roll: Number(medicineCheckRoll) || 0,
    hasHealingEffect: Boolean(hasHealingEffect),
    remainsUnconscious: true,
    noLongerDying: isStabilized,
    conditions: isStabilized
      ? ['Incapacitated', 'Unconscious', 'Prone', 'Stabilized']
      : ['Incapacitated', 'Unconscious', 'Prone', 'Comatose', 'Death\'s Door']
  };
}

/**
 * Advances the Death's Door clock by 1 round (turn step).
 * If the clock reaches 0, the character dies permanently.
 * 
 * @param {object} params
 * @param {number} params.currentClock Current rounds remaining on death clock
 * @param {boolean} [params.isStabilized=false]
 * @returns {object}
 */
export function advanceDeathClock({ currentClock = 1, isStabilized = false } = {}) {
  if (isStabilized) {
    return {
      currentClock: Number(currentClock) || 1,
      isStabilized: true,
      dead: false
    };
  }
  const next = Math.max(0, (Number(currentClock) || 0) - 1);
  return {
    currentClock: next,
    isStabilized: false,
    dead: next <= 0
  };
}

/**
 * Revivification ("The High Cost of Dying"):
 * Return from the dead option (high-level Metaphysics or Tech TL5).
 * Penalties:
 * - Loses ALL remaining Karma Points (reset to 0).
 * - Suffer a -5 Experience Debt due to the trauma (trait reduction or accumulated/future XP reduction).
 * 
 * @param {object} params
 * @param {object} params.characterData
 * @param {number} [params.revivedHealth=1] Initial Health restored on revivification
 * @returns {object}
 */
export function revivifyEntity({ characterData = {}, revivedHealth = 1 } = {}) {
  const currentDebt = Number(characterData.experience_debt || 0);
  const karmaLost = Math.max(0, Number(characterData.karma || 0));
  const updatedData = {
    ...characterData,
    current_health: Math.max(1, Number(revivedHealth) || 1),
    is_dead: false,
    is_at_deaths_door: false,
    death_clock: null,
    is_stabilized: true,
    is_comatose: false,
    karma: 0,
    experience_debt: currentDebt + 5
  };
  return {
    success: true,
    updatedData,
    penalties: {
      karmaLost,
      karmaRemaining: 0,
      experienceDebtAdded: 5,
      totalExperienceDebt: currentDebt + 5
    }
  };
}

// ═══════════════════════════════════════════════════════════
// EXPERIENCE & ADVANCEMENT CALCULATION ENGINES
// Pure rule helpers for Award Points (AP), Increment Rule, and Debt
// ═══════════════════════════════════════════════════════════

/**
 * Calculates the overall Character Point and Award Point pool status.
 *
 * @param {object} params
 * @param {number} [params.startingCP=150] Base creation budget (BP/CP)
 * @param {number} [params.earnedAP=0] Cumulative lifetime AP awarded
 * @param {number} [params.spentCP=0] Total points spent across all traits
 * @param {number} [params.experienceDebt=0] Outstanding revivification trauma debt
 * @returns {object}
 */
export function calculateExperiencePool({ startingCP = 150, earnedAP = 0, spentCP = 0, experienceDebt = 0 } = {}) {
  const startingBudget = Math.max(0, Number(startingCP) || 150);
  const totalEarnedAP = Math.max(0, Number(earnedAP) || 0);
  const totalBudget = startingBudget + totalEarnedAP;
  const totalSpent = Math.max(0, Number(spentCP) || 0);
  const availableAP = Math.max(0, totalEarnedAP - Math.max(0, totalSpent - startingBudget));
  const remainingBudget = totalBudget - totalSpent;
  const activeDebt = Math.max(0, Number(experienceDebt) || 0);

  return {
    startingBudget,
    totalEarnedAP,
    totalBudget,
    totalSpent,
    availableAP,
    remainingBudget,
    activeDebt,
    isOverBudget: totalSpent > totalBudget,
    deficit: Math.max(0, totalSpent - totalBudget)
  };
}

/**
 * Applies an experience award to a character sheet.
 * Records the award into the experience_awards log and increases earned_ap.
 * Optionally settles active experience debt if requested.
 *
 * @param {object} characterData
 * @param {object} awardDetails
 * @param {number} awardDetails.amount Number of AP awarded (must be >= 1)
 * @param {string} awardDetails.category 'story' | 'session' | 'epic' | 'custom'
 * @param {string} [awardDetails.awardId] Subcategory ID
 * @param {string} [awardDetails.reason] Human-readable description
 * @param {string} [awardDetails.notes] Additional notes
 * @param {number} [awardDetails.sessionNumber]
 * @param {boolean} [awardDetails.autoPayDebt=false] Automatically dedicate AP to pay off debt
 * @returns {object} { updatedData, awardEntry, newEarnedAP, remainingDebt, debtPaid }
 */
export function applyExperienceAward(characterData = {}, awardDetails = {}) {
  const amount = Math.max(1, parseInt(awardDetails.amount, 10) || 1);
  const currentEarnedAP = Math.max(0, Number(characterData.earned_ap || 0));
  const currentDebt = Math.max(0, Number(characterData.experience_debt || 0));
  const existingAwards = Array.isArray(characterData.experience_awards) ? [...characterData.experience_awards] : [];

  let debtPaid = 0;
  let remainingDebt = currentDebt;

  if (awardDetails.autoPayDebt && currentDebt > 0) {
    debtPaid = Math.min(amount, currentDebt);
    remainingDebt = currentDebt - debtPaid;
  }

  const awardEntry = {
    id: `award-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    amount,
    category: awardDetails.category || 'session',
    awardId: awardDetails.awardId || 'general_award',
    reason: awardDetails.reason || 'Experience Award',
    notes: awardDetails.notes || '',
    sessionNumber: awardDetails.sessionNumber || null,
    debtPaid
  };

  existingAwards.unshift(awardEntry);

  const updatedData = {
    ...characterData,
    earned_ap: currentEarnedAP + amount,
    experience_awards: existingAwards,
    experience_debt: remainingDebt
  };

  return {
    success: true,
    updatedData,
    awardEntry,
    newEarnedAP: currentEarnedAP + amount,
    debtPaid,
    remainingDebt
  };
}

/**
 * Validates whether a requested progression spend satisfies the critical Increment Rule:
 * "Abilities, skills or other traits may ONLY HAVE A 1 POINT INCREMENT OF ANY SCORE PER EXPERIENCE AWARD."
 *
 * @param {object} params
 * @param {object} params.characterData Current character sheet data
 * @param {string} params.targetType 'skill' | 'primary_attr' | 'sub_attr' | 'feature' | 'vitality' | 'health' | 'discipline'
 * @param {string} params.targetKey Key identifier of the trait (e.g., 'skill-athletics-rank')
 * @param {number} [params.increment=1] The point increment attempted
 * @param {number} [params.costAP=1] Point cost in AP
 * @param {string} [params.awardId=null] ID of the award event this spend is tied to
 * @returns {object} { valid: boolean, error?: string, costAP: number }
 */
export function validateExperienceSpend({
  characterData = {},
  targetType = 'skill',
  targetKey = '',
  increment = 1,
  costAP = 1,
  awardId = null
} = {}) {
  const inc = Number(increment) || 1;

  // 1. Vitality & Health scale by 5 points per 1 AP, so max increment per award is +5 points
  if (targetType === 'vitality' || targetType === 'health') {
    if (inc > 5) {
      return {
        valid: false,
        error: `The Increment Rule: Vitals may only be increased by +5 points (1 AP) per experience award event. Attempted +${inc}.`,
        costAP
      };
    }
  } else {
    // 2. All other abilities, skills, and traits may only have a 1-point increment per award
    if (inc > 1) {
      return {
        valid: false,
        error: `The Increment Rule (CRITICAL): Abilities, skills, or other traits may only have a 1-point increment of any score per experience award event. Attempted +${inc}.`,
        costAP
      };
    }
  }

  // 3. If tied to a specific awardId, verify whether this targetKey was already incremented for this awardId
  if (awardId && Array.isArray(characterData.experience_spends)) {
    const priorSpendForAward = characterData.experience_spends.find(
      s => s.awardId === awardId && s.targetKey === targetKey
    );
    if (priorSpendForAward) {
      return {
        valid: false,
        error: `The Increment Rule: Trait "${targetKey}" has already been incremented for this experience award event (${awardId}). You must wait for a subsequent award event to increase it again.`,
        costAP
      };
    }
  }

  return {
    valid: true,
    costAP: Math.max(1, Number(costAP) || 1),
    increment: inc
  };
}

/**
 * Settles outstanding Experience Debt using Award Points (AP) or direct debt reduction.
 *
 * @param {object} params
 * @param {object} params.characterData
 * @param {number} [params.apAmount=1] Amount of AP dedicated to paying debt
 * @returns {object} { updatedData, previousDebt, debtPaid, remainingDebt }
 */
export function settleExperienceDebt({ characterData = {}, apAmount = 1 } = {}) {
  const currentDebt = Math.max(0, Number(characterData.experience_debt || 0));
  const toPay = Math.min(currentDebt, Math.max(1, Number(apAmount) || 1));
  const remainingDebt = Math.max(0, currentDebt - toPay);

  const updatedData = {
    ...characterData,
    experience_debt: remainingDebt
  };

  return {
    success: true,
    updatedData,
    previousDebt: currentDebt,
    debtPaid: toPay,
    remainingDebt
  };
}

