// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — PHASE 4 CHARACTER & CREATURE CALCULATION ENGINES
// Pure calculation helpers for Species, NPCs, Companions, Invocations, & Meta-Tech
// ═══════════════════════════════════════════════════════════

import {
  SPECIES_BUDGET_LEVELS,
  SPECIES_TYPES,
  SPECIES_SIZES,
  SPECIES_MOVEMENT_MODES,
  SPECIES_MOVEMENT_BASE_MODES,
  SPECIES_MOVEMENT_ADJUSTERS,
  SPECIES_MOVEMENT_GROUPS,
  SPECIES_MOVEMENT_MODIFICATIONS,
  SPECIES_TRAITS_BASIC,
  SPECIES_TRAITS_ADVANCED,
  SPECIES_TRAITS_ELITE,
  SPECIES_DISADVANTAGES,
  SPECIES_ATTRIBUTE_MODIFIERS,
  SPECIES_SKILL_MODIFIERS,
  SPECIES_COMPONENT_RULES,
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

import { DEFAULT_SPECIES } from '../data/speciesData.js';

import {
  calculateCreditValue,
  calculateMaterialCost,
  calculateAllCraftingTiers,
  getComplexityTier,
  getFinancialStatus
} from './tangentEconEngine.js';

import {
  resolveCatalogItem,
  normalizeTraitString
} from './tangentIdentityEngine.js';

/**
 * Calculates additive movement speeds and derived tactical paces for a species or entity.
 * Associates speed adjusters with their respective base modes (Ground, Flying, Swimming, Climbing, Burrowing).
 * 
 * @param {Array<string|object>} movementSelections - List of movement IDs/objects
 * @param {string|object} [size='Medium'] - Size category
/**
 * Formats an asset's cost string for the BP/CP economy.
 * If the asset is granted by a package (e.g. species), its used cost is 0,
 * and we display both the 0 used cost and the standalone/unbundled cost as "0 [3] CP" or "0 [3]".
 * 
 * @param {number} usedCost - The actual points charged to the character (0 if included in package)
 * @param {number} standaloneCost - What the asset would have cost without being included in the package
 * @param {string} [unit='CP'] - Cost unit ('CP', 'BP', or empty)
 * @returns {string} Formatted cost string e.g. "0 [3] CP", "5 CP", "0 CP", "-3 CP"
 */
export function formatGrantedCost(usedCost = 0, standaloneCost = 0, unit = 'CP') {
  const unitSuffix = unit ? ` ${unit}` : '';
  if (usedCost === 0 && standaloneCost > 0) {
    return `0 [${standaloneCost}]${unitSuffix}`;
  }
  if (usedCost === 0 && standaloneCost < 0) {
    return `0 [${standaloneCost}]${unitSuffix}`;
  }
  if (usedCost < 0) {
    return `${usedCost}${unitSuffix}`;
  }
  return `${usedCost}${unitSuffix}`;
}

/**
 * Calculates additive movement speeds and derived tactical paces for a species or entity.
 * Associates speed adjusters with their respective base modes (Ground, Flying, Swimming, Climbing, Burrowing).
 * 
 * @param {Array<string|object>} movementSelections - List of movement IDs/objects
 * @param {string|object} [size='Medium'] - Size category
 * @returns {object} Calculated additive speeds, formatted string, itemized breakdowns, and total movement BP
 */
export function calculateSpeciesSpeeds(movementSelections = ['normal'], size = 'Medium') {
  const modesList = Array.isArray(movementSelections) ? movementSelections : [movementSelections];
  const sizeMultiplier = typeof size === 'object' ? (size.speedMult || 1) : (SPECIES_SIZES[size]?.speedMult || 1);

  const activeBaseModes = new Map(); // target_mode -> base mode def
  const activeAdjusters = [];

  for (const mItem of modesList) {
    if (!mItem) continue;
    const rawId = typeof mItem === 'object' ? (mItem.id || mItem.name) : String(mItem);
    const cleanId = rawId.toLowerCase().replace(/^species_movement-/, '').replace(/^movement-/, '').replace(/-/g, '_');
    const rawLower = rawId.toLowerCase().trim();

    // 1. Check BASE_MODES
    const baseMatch = SPECIES_MOVEMENT_BASE_MODES.find(b => {
      const bId = b.id.toLowerCase();
      const bName = b.name.toLowerCase();
      const bBaseName = bName.replace(/\s*\(.*\)/, '').trim();
      return b.id === rawId || b.id === `species_movement-${cleanId}` || b.id === `movement-${cleanId}` ||
        bId === cleanId || bName === rawLower || bBaseName === rawLower ||
        bName.startsWith(rawLower) || (rawLower.length > 3 && bBaseName.startsWith(rawLower));
    });

    // 2. Check ADJUSTERS
    const adjMatch = SPECIES_MOVEMENT_ADJUSTERS.find(a => {
      const aId = a.id.toLowerCase();
      const aName = a.name.toLowerCase();
      const aBaseName = aName.replace(/\s*\(.*\)/, '').trim();
      return a.id === rawId || a.id === `species_movement-${cleanId}` || a.id === `movement-${cleanId}` ||
        aId === cleanId || aName === rawLower || aBaseName === rawLower ||
        aName.startsWith(rawLower) || (rawLower.length > 3 && aBaseName.startsWith(rawLower));
    });

    if (baseMatch) {
      const target = baseMatch.target_mode || 'Ground';
      if (!activeBaseModes.has(target) || (baseMatch.base_speed || 0) > (activeBaseModes.get(target).base_speed || 0)) {
        activeBaseModes.set(target, baseMatch);
      }
    } else if (adjMatch) {
      activeAdjusters.push(adjMatch);
    } else {
      const fallback = SPECIES_MOVEMENT_MODES.find(f => {
        const fId = f.id.toLowerCase();
        const fName = f.name.toLowerCase();
        const fBaseName = fName.replace(/\s*\(.*\)/, '').trim();
        return f.id === rawId || fId === cleanId || fName === rawLower || fBaseName === rawLower || fName.startsWith(rawLower);
      });
      if (fallback) {
        if (fallback.category === 'Mode' || fallback.base_speed !== undefined) {
          activeBaseModes.set(fallback.target_mode || 'Ground', fallback);
        } else {
          activeAdjusters.push(fallback);
        }
      }
    }
  }

  // Ensure default Ground mode if none specified
  if (activeBaseModes.size === 0) {
    activeBaseModes.set('Ground', SPECIES_MOVEMENT_BASE_MODES[0]);
  }

  const speeds = {};
  const formattedParts = [];
  const itemized = [];
  let totalMovementBP = 0;

  activeBaseModes.forEach((baseMode, targetMode) => {
    let baseSpeed = Number(baseMode.base_speed || baseMode.speed || 30);
    const modeBP = Number(baseMode.bp || 0);
    totalMovementBP += modeBP;

    // Filter adjusters targeting this mode
    const modeAdjusters = activeAdjusters.filter(a => (a.target_mode || 'Ground') === targetMode);
    let speedDelta = 0;
    const appliedNotes = [];

    modeAdjusters.forEach(adj => {
      const delta = Number(adj.speed_modifier ?? adj.speedMod ?? 0);
      speedDelta += delta;
      const adjBP = Number(adj.bp || 0);
      totalMovementBP += adjBP;
      if (delta !== 0) {
        appliedNotes.push(`${adj.name.replace(/\s*\(\+?\-?\d+\s*ft.*\)/i, '')} ${delta > 0 ? `+${delta}` : delta} ft`);
      } else {
        appliedNotes.push(adj.name);
      }
    });

    let finalSpeed = Math.max(5, baseSpeed + speedDelta);
    if (sizeMultiplier > 1 && (targetMode === 'Ground' || targetMode === 'Flying')) {
      finalSpeed *= sizeMultiplier;
    }

    const key = targetMode.toLowerCase();
    speeds[key] = finalSpeed;

    const breakdownText = appliedNotes.length > 0 
      ? ` (${baseMode.name.replace(/\s*\(.*\)/, '')} ${baseSpeed} ft + ${appliedNotes.join(', ')})`
      : '';
    formattedParts.push(`${targetMode} ${finalSpeed} ft${breakdownText}`);

    itemized.push({
      mode: targetMode,
      id: baseMode.id,
      name: baseMode.name,
      baseSpeed,
      speedDelta,
      finalSpeed,
      adjusters: modeAdjusters.map(a => ({ id: a.id, name: a.name, speedMod: a.speed_modifier ?? a.speedMod ?? 0, bp: a.bp })),
      bp: modeBP + modeAdjusters.reduce((s, a) => s + Number(a.bp || 0), 0),
      description: baseMode.description || ''
    });
  });

  // Include general unassigned adjusters
  const unassignedAdjusters = activeAdjusters.filter(a => !activeBaseModes.has(a.target_mode || 'Ground'));
  unassignedAdjusters.forEach(ua => {
    totalMovementBP += Number(ua.bp || 0);
    itemized.push({
      mode: ua.target_mode || 'General',
      id: ua.id,
      name: ua.name,
      bp: Number(ua.bp || 0),
      isUtility: true,
      description: ua.description || ''
    });
  });

  return {
    speeds,
    speedsFormatted: formattedParts.join(', '),
    itemized,
    totalMovementBP
  };
}

// ═══════════════════════════════════════════════════════════
// 1. SPECIES FORGE & BUILD ENGINE (PLAN 23 & CANONICAL CODEX)
// ═══════════════════════════════════════════════════════════

/**
 * Calculates total Build Points (BP) used and budget remaining for a Species.
 * Handles both parameter objects and raw catalog/custom species documents.
 * 
 * @param {object} params
 * @param {string|Array<string>} [params.type] - Species type ID (Aberration, Beast, etc.)
 * @param {string|Array<string>} [params.size] - Size category ID (Diminutive to Huge)
 * @param {Array<string|object>} [params.movementModes] - Selected movement mode IDs
 * @param {object} [params.attributes] - Attribute bonuses/penalties { str, agi, sta, int, wis, cha }
 * @param {number} [params.skillBundles] - Number of +5 Skill Point bundles (5 BP each)
 * @param {Array<string|object>} [params.traits] - Selected traits (Basic 1 BP, Advanced 2 BP, Elite 4 BP)
 * @param {Array<string|object>} [params.disadvantages] - Selected disadvantages (refund BP)
 * @param {string} [params.budgetLevel] - Budget level ID ('Standard', 'Advanced', 'Monster')
 * @returns {object} Total BP breakdown, itemized components, and budget validation
 */
export function calculateSpeciesBP(params = {}) {
  // Normalize parameters
  let type = params.type || params.species_type || 'Humanoid';
  let size = params.size || params.species_size || 'Medium';
  let movementModes = params.movementModes || params.movement_modes || params.movement || ['normal'];
  let attributes = {};
  let skillBundles = params.skillBundles ?? params.skill_bundles ?? 0;
  let traits = [
    ...(Array.isArray(params.traits) ? params.traits : []),
    ...(Array.isArray(params.inherent_features) ? params.inherent_features : []),
    ...(Array.isArray(params.inherent_traits) ? params.inherent_traits : [])
  ];
  let disadvantages = [
    ...(Array.isArray(params.disadvantages) ? params.disadvantages : []),
    ...(Array.isArray(params.inherent_disadvantages) ? params.inherent_disadvantages : [])
  ];
  let budgetLevel = params.budgetLevel || params.budget_level || 'Standard';

  // Normalize type
  if (Array.isArray(type) && type.length > 0) {
    type = type[0];
  }
  if (typeof type === 'string') {
    type = type.replace(/^species_type-/, '').trim();
    type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  // Normalize size
  if (Array.isArray(size) && size.length > 0) {
    size = size[0];
  }
  if (typeof size === 'string') {
    size = size.replace(/^species_size-/, '').trim();
    size = size.charAt(0).toUpperCase() + size.slice(1).toLowerCase();
  }

  // Normalize movement modes
  if (!Array.isArray(movementModes)) {
    movementModes = [movementModes];
  }
  movementModes = movementModes.map(m => {
    if (typeof m === 'string') {
      const clean = m.replace(/^species_movement-/, '').replace(/-trait$/, '').trim().toLowerCase();
      if (clean === 'bipedal' || clean === 'normal' || clean === 'standard') return 'normal';
      if (clean === 'flight_basic' || clean === 'basic flight') return 'flight_basic';
      if (clean === 'swim' || clean === 'swimming') return 'swim';
      if (clean === 'burrow' || clean === 'burrowing') return 'burrow';
      if (clean === 'climb' || clean === 'climber') return 'climber';
      if (clean === 'gliding' || clean === 'gliding_wings' || clean === 'gliding wings') return 'gliding';
      return m;
    }
    return m?.id || 'normal';
  });

  // Normalize attributes from object (supporting con/dex aliases and full names)
  if (params.attributes && typeof params.attributes === 'object') {
    Object.entries(params.attributes).forEach(([k, v]) => {
      const key = String(k).toLowerCase();
      const val = Number(v || 0);
      if (key.startsWith('str')) attributes.str = (attributes.str || 0) + val;
      else if (key.startsWith('agi') || key.startsWith('dex')) attributes.agi = (attributes.agi || 0) + val;
      else if (key.startsWith('sta') || key.startsWith('con')) attributes.sta = (attributes.sta || 0) + val;
      else if (key.startsWith('int')) attributes.int = (attributes.int || 0) + val;
      else if (key.startsWith('wis')) attributes.wis = (attributes.wis || 0) + val;
      else if (key.startsWith('cha')) attributes.cha = (attributes.cha || 0) + val;
    });
  }

  // Support skill points directly
  if (params.skillPoints || params.skill_points) {
    const rawPoints = Number(params.skillPoints || params.skill_points);
    if (!skillBundles) {
      skillBundles = Math.floor(rawPoints / 5);
    }
  }

  // Inherent attributes from species modifiers array
  if (Array.isArray(params.inherent_attribute_modifiers)) {
    params.inherent_attribute_modifiers.forEach(mod => {
      const attr = String(mod.attribute || mod.attr || '').toLowerCase();
      const bonus = Number(mod.bonus || mod.value || 0);
      if (attr.startsWith('str')) attributes.str = (attributes.str || 0) + bonus;
      else if (attr.startsWith('agi') || attr.startsWith('dex')) attributes.agi = (attributes.agi || 0) + bonus;
      else if (attr.startsWith('sta') || attr.startsWith('con')) attributes.sta = (attributes.sta || 0) + bonus;
      else if (attr.startsWith('int')) attributes.int = (attributes.int || 0) + bonus;
      else if (attr.startsWith('wis')) attributes.wis = (attributes.wis || 0) + bonus;
      else if (attr.startsWith('cha')) attributes.cha = (attributes.cha || 0) + bonus;
    });
  }

  // Bonus attributes flat fields
  if (params.bonus_str) attributes.str = (attributes.str || 0) + Number(params.bonus_str);
  if (params.bonus_agi) attributes.agi = (attributes.agi || 0) + Number(params.bonus_agi);
  if (params.bonus_sta) attributes.sta = (attributes.sta || 0) + Number(params.bonus_sta);
  if (params.bonus_int) attributes.int = (attributes.int || 0) + Number(params.bonus_int);
  if (params.bonus_wis) attributes.wis = (attributes.wis || 0) + Number(params.bonus_wis);
  if (params.bonus_cha) attributes.cha = (attributes.cha || 0) + Number(params.bonus_cha);

  // 1. Species Type BP (Multi-Type Support & Duplicate Trait Refund)
  const rawTypes = Array.isArray(type) ? type : (type ? [type] : ['Humanoid']);
  let grossTypeBP = 0;
  let typeDuplicateRefundBP = 0;
  const seenTypeTraits = new Set();
  const itemizedTypes = [];

  for (const tItem of rawTypes) {
    const cleanTypeName = String(typeof tItem === 'object' ? (tItem?.name || tItem?.id) : tItem)
      .replace(/^species_type-/, '')
      .toLowerCase();
    const typeDef = Object.values(SPECIES_TYPES).find(t => 
      t.id.toLowerCase() === cleanTypeName || 
      t.name.toLowerCase() === cleanTypeName
    ) || SPECIES_TYPES.Humanoid;

    const bpVal = Number(typeDef.bp || 0);
    grossTypeBP += bpVal;
    itemizedTypes.push({ id: typeDef.id, name: typeDef.name, bp: bpVal });

    // Check for duplicate inherent traits between types
    let rawTraits = [];
    if (Array.isArray(typeDef.traits)) {
      rawTraits = typeDef.traits;
    } else if (typeof typeDef.traits === 'string' && typeDef.traits.trim()) {
      rawTraits = typeDef.traits.split(',').map(s => s.trim()).filter(Boolean);
    }

    rawTraits.forEach(tr => {
      const trKey = String(tr).toLowerCase().trim();
      if (seenTypeTraits.has(trKey)) {
        typeDuplicateRefundBP += 1; // Refund duplicate trait BP
      } else {
        seenTypeTraits.add(trKey);
      }
    });
  }
  const typeBP = Math.max(0, grossTypeBP - typeDuplicateRefundBP);

  // 2. Size Category BP (Single Selection)
  const singleSize = Array.isArray(size) ? size[0] : size;
  const cleanSizeName = String(typeof singleSize === 'object' ? (singleSize?.name || singleSize?.id) : singleSize)
    .replace(/^species_size-/, '')
    .toLowerCase();
  const sizeDef = Object.values(SPECIES_SIZES).find(s => 
    s.id.toLowerCase() === cleanSizeName || 
    s.name.toLowerCase() === cleanSizeName
  ) || SPECIES_SIZES.Medium;
  const sizeBP = Number(sizeDef.bp || 0);

  // 3. Movement Modes & Additive Speed Adjusters BP
  const speedData = calculateSpeciesSpeeds(movementModes, sizeDef);
  const movementBP = speedData.totalMovementBP;
  const itemizedMovement = speedData.itemized;
  const calculatedSpeeds = speedData.speeds;
  const speedsFormatted = speedData.speedsFormatted;

  // 4. Attribute Modifiers (1 point = 5 BP, -1 point = -5 BP refund)
  let attributeBP = 0;
  const itemizedAttributes = [];
  for (const attr of ['str', 'agi', 'sta', 'int', 'wis', 'cha']) {
    const val = Number(attributes[attr] || 0);
    if (val !== 0) {
      const bpVal = val * 5;
      attributeBP += bpVal;
      itemizedAttributes.push({ attr: attr.toUpperCase(), value: val, bp: bpVal });
    }
  }

  // 5. Skill Points (Each +5 bundle costs 5 BP / 1 BP per point)
  const skillsBP = Math.max(0, Number(skillBundles || 0)) * 5;

  // 6. Traits Catalog (Basic 1 BP, Advanced 2 BP, Elite 4 BP)
  let traitsBP = 0;
  const itemizedTraits = [];
  const allTraits = [...SPECIES_TRAITS_BASIC, ...SPECIES_TRAITS_ADVANCED, ...SPECIES_TRAITS_ELITE];
  if (Array.isArray(traits)) {
    for (const t of traits) {
      const traitId = typeof t === 'string' ? t : (t?.id || t?.code || t?.name);
      const cleanTraitId = (traitId || '').toString().toLowerCase().replace(/^trait-species-/, '').replace(/^trait-/, '').replace(/-/g, '_');
      const rawQuery = (traitId || '').toString().trim().toLowerCase();
      const normQuery = rawQuery.replace(/[^a-z0-9]/g, '').replace(/options$/, 'opts').replace(/opts$/, 'opt');

      // 1. Exact ID or Exact Name Match
      let found = allTraits.find(item => {
        if (!item) return false;
        if (item.id === traitId || item.code === traitId || item.id === cleanTraitId) return true;
        const itemName = (item.name || '').toLowerCase();
        return itemName === rawQuery;
      });

      // 2. Normalized Name Match (handling Opts vs Options, punctuation differences)
      if (!found) {
        found = allTraits.find(item => {
          if (!item || !item.name) return false;
          const itemNorm = item.name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/options$/, 'opts').replace(/opts$/, 'opt');
          return itemNorm === normQuery;
        });
      }

      // 3. Substring / Prefix match (prefer longest name match to prevent 'Tail' swallowing 'Prehensile Tail')
      if (!found) {
        const candidates = allTraits.filter(item => {
          if (!item || !item.name) return false;
          const itemName = item.name.toLowerCase();
          return itemName.includes(rawQuery) || rawQuery.includes(itemName);
        });
        if (candidates.length > 0) {
          candidates.sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));
          found = candidates[0];
        }
      }

      if (found) {
        const bpVal = Number(found.bp || 1);
        traitsBP += bpVal;
        itemizedTraits.push({ id: found.id, name: found.name, bp: bpVal, tier: found.trait_tier || (found.bp === 4 ? 'Elite' : (found.bp === 2 ? 'Advanced' : 'Basic')), type: found.type });
      } else if (typeof t === 'object' && t.bp) {
        const bpVal = Number(t.bp);
        traitsBP += bpVal;
        itemizedTraits.push({ id: t.id || 'custom_trait', name: t.name || 'Custom Trait', bp: bpVal, tier: 'Custom', type: t.type || 'Physical' });
      } else if (typeof t === 'string' && t.trim()) {
        traitsBP += 1;
        itemizedTraits.push({ id: cleanTraitId, name: t, bp: 1, tier: 'Basic', type: 'Physical' });
      }
    }
  }

  // 7. Disadvantages (Reduce BP)
  let disadvantagesRefund = 0;
  const itemizedDisadvantages = [];
  if (Array.isArray(disadvantages)) {
    for (const d of disadvantages) {
      const disId = typeof d === 'string' ? d : (d?.id || d?.code || d?.name);
      const cleanDisId = (disId || '').toString().toLowerCase().replace(/^disadvantage-species-/, '').replace(/^disadvantage-/, '').replace(/-/g, '_');
      const rawQuery = (disId || '').toString().trim().toLowerCase();
      const normQuery = rawQuery.replace(/[^a-z0-9]/g, '');

      // 1. Exact ID or Exact Name Match
      let found = SPECIES_DISADVANTAGES.find(item => {
        if (!item) return false;
        if (item.id === disId || item.code === disId || item.id === cleanDisId) return true;
        const itemName = (item.name || '').toLowerCase();
        return itemName === rawQuery;
      });

      // 2. Normalized Name Match
      if (!found) {
        found = SPECIES_DISADVANTAGES.find(item => {
          if (!item || !item.name) return false;
          const itemNorm = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return itemNorm === normQuery;
        });
      }

      // 3. Substring match
      if (!found) {
        const candidates = SPECIES_DISADVANTAGES.filter(item => {
          if (!item || !item.name) return false;
          const itemName = item.name.toLowerCase();
          return itemName.includes(rawQuery) || rawQuery.includes(itemName);
        });
        if (candidates.length > 0) {
          candidates.sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));
          found = candidates[0];
        }
      }

      if (found) {
        const refVal = Number(found.refundBP || Math.abs(found.costBP) || 0);
        disadvantagesRefund += refVal;
        itemizedDisadvantages.push({ id: found.id, name: found.name, refundBP: refVal, type: found.type });
      } else if (typeof d === 'object' && (d.refundBP || d.costBP)) {
        const refVal = Number(d.refundBP || Math.abs(d.costBP));
        disadvantagesRefund += refVal;
        itemizedDisadvantages.push({ id: d.id || 'custom_dis', name: d.name || 'Custom Disadvantage', refundBP: refVal, type: d.type || 'Physical' });
      }
    }
  }

  let calculatedNetBP = typeBP + sizeBP + movementBP + attributeBP + skillsBP + traitsBP - disadvantagesRefund;

  // If explicit cost is given and calculated components were empty
  if (params.costs?.bp !== undefined && calculatedNetBP === 0 && Number(params.costs.bp) > 0) {
    calculatedNetBP = Number(params.costs.bp);
  } else if (params.cp !== undefined && calculatedNetBP === 0 && Number(params.cp) > 0) {
    calculatedNetBP = Number(params.cp);
  }

  const finalBPUsed = Math.max(0, calculatedNetBP);
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
    speeds: calculatedSpeeds,
    speedsFormatted,
    breakdown: {
      typeBP,
      sizeBP,
      movementBP,
      attributeBP,
      skillsBP,
      traitsBP,
      disadvantagesRefund
    },
    itemized: {
      type: itemizedTypes.length === 1 ? itemizedTypes[0] : { id: itemizedTypes.map(t => t.id).join(', '), name: itemizedTypes.map(t => t.name).join(', '), bp: typeBP, types: itemizedTypes },
      size: { id: sizeDef.id, name: sizeDef.name, bp: sizeBP },
      movement: itemizedMovement,
      speeds: calculatedSpeeds,
      attributes: itemizedAttributes,
      skills: { bundles: skillBundles, bp: skillsBP },
      traits: itemizedTraits,
      disadvantages: itemizedDisadvantages
    }
  };
}

/**
 * Calculates the full Build Point (BP) / Character Point (CP) cost of a species,
 * resolving it against the canonical species database or evaluating its raw components.
 * 
 * @param {string|object} speciesInput - Species name, ID, or object
 * @param {object} [dbData={}] - Database cache
 * @returns {object} Comprehensive species cost and itemized breakdown
 */
export function calculateFullSpeciesCost(speciesInput, dbData = {}) {
  if (!speciesInput) {
    return {
      speciesName: '',
      totalCost: 0,
      bp: 0,
      cp: 0,
      speeds: { ground: 30 },
      speedsFormatted: 'Ground 30 ft',
      breakdown: {
        typeBP: 0,
        sizeBP: 0,
        movementBP: 0,
        attributeBP: 0,
        skillsBP: 0,
        traitsBP: 0,
        disadvantagesRefund: 0
      },
      itemizedList: [],
      summaryText: 'No Species (0 CP)'
    };
  }

  // Resolve species object
  let speciesObj = speciesInput;
  if (typeof speciesInput === 'string') {
    const list = (dbData.species && dbData.species.length > 0) ? dbData.species : DEFAULT_SPECIES;
    const query = speciesInput.trim().toLowerCase();
    speciesObj = list.find(s => 
      (s.name || '').toLowerCase() === query || 
      (s.title || '').toLowerCase() === query || 
      (s.id || '').toLowerCase() === query
    ) || { name: speciesInput };
  }

  const speciesName = speciesObj.name || speciesObj.title || (typeof speciesInput === 'string' ? speciesInput : 'Unknown Species');

  // Compute BP/CP breakdown
  const bpData = calculateSpeciesBP(speciesObj);

  // If explicit cp/cost is specified in catalog, use document standard or computed total
  const explicitCost = (speciesObj.costs?.bp !== undefined && speciesObj.costs?.bp !== null)
    ? Number(speciesObj.costs.bp)
    : ((speciesObj.cp !== undefined && speciesObj.cp !== null) ? Number(speciesObj.cp) : null);
  const finalCost = explicitCost !== null && !isNaN(explicitCost) ? explicitCost : bpData.totalBPUsed;

  const itemizedList = [];
  if (bpData.breakdown.typeBP > 0) {
    itemizedList.push({ category: 'Species Type', name: bpData.itemized.type.name, bp: bpData.breakdown.typeBP, cp: bpData.breakdown.typeBP });
  }
  if (bpData.breakdown.sizeBP > 0) {
    itemizedList.push({ category: 'Species Size', name: bpData.itemized.size.name, bp: bpData.breakdown.sizeBP, cp: bpData.breakdown.sizeBP });
  }
  if (bpData.breakdown.movementBP > 0) {
    itemizedList.push({ category: 'Movement Modes', name: `${bpData.breakdown.movementBP} CP Modes`, bp: bpData.breakdown.movementBP, cp: bpData.breakdown.movementBP });
  }
  if (bpData.breakdown.attributeBP !== 0) {
    itemizedList.push({ category: 'Attribute Modifiers', name: `${bpData.breakdown.attributeBP >= 0 ? '+' : ''}${bpData.breakdown.attributeBP} CP`, bp: bpData.breakdown.attributeBP, cp: bpData.breakdown.attributeBP });
  }
  if (bpData.breakdown.skillsBP > 0) {
    itemizedList.push({ category: 'Skill Points', name: `${bpData.breakdown.skillsBP} CP`, bp: bpData.breakdown.skillsBP, cp: bpData.breakdown.skillsBP });
  }
  if (bpData.breakdown.traitsBP > 0) {
    itemizedList.push({ category: 'Species Traits', name: `${bpData.itemized.traits.length} Traits (${bpData.breakdown.traitsBP} CP)`, bp: bpData.breakdown.traitsBP, cp: bpData.breakdown.traitsBP });
  }
  if (bpData.breakdown.disadvantagesRefund > 0) {
    itemizedList.push({ category: 'Disadvantages (Refund)', name: `-${bpData.breakdown.disadvantagesRefund} CP`, bp: -bpData.breakdown.disadvantagesRefund, cp: -bpData.breakdown.disadvantagesRefund });
  }

  const summaryParts = [];
  if (bpData.breakdown.typeBP) summaryParts.push(`Type: ${bpData.breakdown.typeBP} CP`);
  if (bpData.breakdown.sizeBP) summaryParts.push(`Size: ${bpData.breakdown.sizeBP} CP`);
  if (bpData.breakdown.movementBP) summaryParts.push(`Move: ${bpData.breakdown.movementBP} CP`);
  if (bpData.breakdown.attributeBP) summaryParts.push(`Attr: ${bpData.breakdown.attributeBP} CP`);
  if (bpData.breakdown.skillsBP) summaryParts.push(`Skills: ${bpData.breakdown.skillsBP} CP`);
  if (bpData.breakdown.traitsBP) summaryParts.push(`Traits: ${bpData.breakdown.traitsBP} CP`);
  if (bpData.breakdown.disadvantagesRefund) summaryParts.push(`Refund: -${bpData.breakdown.disadvantagesRefund} CP`);

  return {
    speciesName,
    speciesObj,
    totalCost: finalCost,
    bp: finalCost,
    cp: finalCost,
    speeds: bpData.speeds,
    speedsFormatted: bpData.speedsFormatted,
    breakdown: bpData.breakdown,
    itemized: bpData.itemized,
    itemizedList,
    summaryText: summaryParts.length > 0 ? summaryParts.join(' • ') : 'Standard (0 CP)',
    isOverBudget: bpData.isOverBudget,
    budgetLevel: bpData.budgetLevel
  };
}

/**
 * Returns the canonical dataset of all species components.
 */
export function getSpeciesComponentDataset() {
  const typeList = Array.isArray(SPECIES_TYPES) ? SPECIES_TYPES : Object.values(SPECIES_TYPES || {});
  const sizeList = Array.isArray(SPECIES_SIZES) ? SPECIES_SIZES : Object.values(SPECIES_SIZES || {});
  const movementList = Array.isArray(SPECIES_MOVEMENT_MODES) ? SPECIES_MOVEMENT_MODES : Object.values(SPECIES_MOVEMENT_MODES || {});
  const basicList = Array.isArray(SPECIES_TRAITS_BASIC) ? SPECIES_TRAITS_BASIC : [];
  const advancedList = Array.isArray(SPECIES_TRAITS_ADVANCED) ? SPECIES_TRAITS_ADVANCED : [];
  const eliteList = Array.isArray(SPECIES_TRAITS_ELITE) ? SPECIES_TRAITS_ELITE : [];
  const allTraitsList = [...basicList, ...advancedList, ...eliteList];
  const disList = Array.isArray(SPECIES_DISADVANTAGES) ? SPECIES_DISADVANTAGES : Object.values(SPECIES_DISADVANTAGES || {});

  return {
    types: typeList,
    typesMap: SPECIES_TYPES,
    sizes: sizeList,
    sizesMap: SPECIES_SIZES,
    baseMovement: SPECIES_MOVEMENT_BASE_MODES,
    movementModifications: SPECIES_MOVEMENT_MODIFICATIONS,
    movementModes: movementList,
    attributeModifiers: SPECIES_ATTRIBUTE_MODIFIERS,
    skillModifiers: SPECIES_SKILL_MODIFIERS,
    basicTraits: basicList,
    advancedTraits: advancedList,
    eliteTraits: eliteList,
    allTraits: allTraitsList,
    traits: {
      basic: basicList,
      advanced: advancedList,
      elite: eliteList,
      all: allTraitsList
    },
    disadvantages: disList,
    budgetLevels: SPECIES_BUDGET_LEVELS,
    rules: SPECIES_COMPONENT_RULES
  };
}

/**
 * Validates a species build against canonical Tangent construction rules.
 */
export function validateSpeciesBuild(speciesData = {}) {
  const bpData = calculateSpeciesBP(speciesData);
  const issues = [];
  const warnings = [];

  if (bpData.isOverBudget) {
    issues.push(`Total CP used (${bpData.totalBPUsed} CP) exceeds the ${bpData.budgetLevel} budget limit of ${bpData.budgetMax} CP.`);
  }

  // Check Attribute maximums during creation
  const attrs = bpData.itemized.attributes;
  attrs.forEach(a => {
    if (a.value > 4) {
      warnings.push(`${a.attr} modifier (+${a.value}) exceeds standard starting creation cap of +4.`);
    }
    if (a.value < -4) {
      warnings.push(`${a.attr} penalty (${a.value}) exceeds standard starting penalty floor of -4.`);
    }
  });

  return {
    isValid: issues.length === 0,
    totalBPUsed: bpData.totalBPUsed,
    bpRemaining: bpData.bpRemaining,
    budgetMax: bpData.budgetMax,
    issues,
    warnings,
    breakdown: bpData.breakdown
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
    total_cp_used: bp.totalBPUsed,
    cp_remaining: bp.bpRemaining,
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

// ═══════════════════════════════════════════════════════════
// IDENTITY TRANSITION & TRAIT SYNCHRONIZATION RE-EXPORTS
// ═══════════════════════════════════════════════════════════
export {
  applySpeciesTransition,
  applyArchetypeTransition,
  applyOccupationTransition,
  applyOriginTransition,
  applyFactionTransition,
  applyIdentityFieldTransition,
  resolveCatalogItem,
  normalizeTraitString
} from './tangentIdentityEngine.js';

/**
 * Computes comprehensive character point (CP) economy breakdown, ensuring that all
 * attribute modifiers, features, skills, and traits picked from selection pools granted
 * from Species, Occupation, Origin, or Faction are never charged CP in the 150 CP pool.
 *
 * @param {object} characterData - Current persona sheet data
 * @param {object} [options={}] - Calculation options
 * @param {object} [options.derivedStats={}] - Derived stats including purchased health/vitality
 * @param {object} [options.dbData={}] - Ingested database cache
 * @param {object} [options.identityPools=null] - Precomputed identity pools metadata
 * @returns {object} Full economy metrics and itemized accounting
 */
export function computeEconomyBreakdown(characterData = {}, options = {}) {
  const { derivedStats = {}, dbData = {}, identityPools = null } = options;
  const startingCP = parseInt(characterData['starting-cp'] || 150, 10);
  const itemizedList = [];

  // Helper for safe CP extraction
  const getItemCP = (item, defaultCost = 0) => {
    if (typeof item === 'object' && item !== null) {
      if (item.cp !== undefined && item.cp !== null && item.cp !== '') {
        return parseInt(item.cp, 10) || 0;
      }
      if (item.cost !== undefined && item.cost !== null && item.cost !== '') {
        return parseInt(item.cost, 10) || 0;
      }
      if (item.cost_cp !== undefined && item.cost_cp !== null && item.cost_cp !== '') {
        return parseInt(item.cost_cp, 10) || 0;
      }
    }
    if (typeof item === 'number') return item;
    return defaultCost;
  };

  const normTrait = (t) => normalizeTraitString(t).toLowerCase().trim();

  // 1. Identity Selections (Species, Occupation, Origin, Faction, Archetype)
  let identityCost = 0;
  let speciesCostBreakdown = null;

  // Species Package
  const speciesRaw = characterData['char-species'];
  if (speciesRaw) {
    const spCost = calculateFullSpeciesCost(speciesRaw, dbData);
    speciesCostBreakdown = spCost;
    identityCost += spCost.totalCost;
    itemizedList.push({
      category: 'Species Package',
      item: spCost.speciesName || String(speciesRaw),
      val: spCost.summaryText || `${spCost.totalCost} CP Package`,
      costVal: spCost.totalCost,
      cost: `${spCost.totalCost} CP`,
      breakdown: spCost.breakdown,
      itemized: spCost.itemized
    });
  } else {
    itemizedList.push({
      category: 'Species Package',
      item: 'None Selected',
      val: '0 CP Baseline',
      costVal: 0,
      cost: '0 CP'
    });
  }

  // Other Identity selections (Archetype, Occupation, Origin, Faction)
  const otherIdentities = [
    { key: 'char-archetype', label: 'Archetype', defaultVal: 'Archetype Chassis (80 CP Blueprint)' },
    { key: 'char-occu', label: 'Occupation', defaultVal: 'Career Package (20 SP Pool - Supplemental)' },
    { key: 'char-origin', label: 'Origin', defaultVal: 'Homeworld Package (20 SP Pool - Supplemental)' },
    { key: 'char-faction', label: 'Faction', defaultVal: 'Allegiance Package (20 SP Pool - Supplemental)' }
  ];

  otherIdentities.forEach(({ key, label, defaultVal }) => {
    const val = characterData[key];
    const name = typeof val === 'object' ? (val.name || val.title || '') : String(val || '');
    // Origin, Occupation, and Faction are supplemental and separate from the 150 CP pool. They cost 0 CP.
    const isSupplemental = ['char-occu', 'char-origin', 'char-faction'].includes(key);
    const cost = isSupplemental ? 0 : (val ? getItemCP(val, 0) : 0);
    identityCost += cost;
    itemizedList.push({
      category: label,
      item: name || 'None Selected',
      val: name ? (typeof val === 'object' && val.summary ? val.summary : defaultVal) : 'Optional Selection',
      costVal: cost,
      cost: `${cost} CP`
    });
  });

  // Secondary Origin & Occupation if present
  const secOrigin = characterData['char-secondary-origin'] || characterData['char-origin-secondary'];
  if (secOrigin) {
    itemizedList.push({
      category: 'Secondary Origin',
      item: String(secOrigin),
      val: 'Expanded Homeworld Heritage (0 CP Supplemental)',
      costVal: 0,
      cost: '0 CP'
    });
  }
  const secOccu = characterData['char-secondary-occu'] || characterData['char-background-occu'] || characterData['char-occu-secondary'];
  if (secOccu) {
    itemizedList.push({
      category: 'Secondary Occupation',
      item: String(secOccu),
      val: 'Dual Career Background (0 CP Supplemental)',
      costVal: 0,
      cost: '0 CP'
    });
  }

  // 2. Primary Attributes & Species/Pool Granted Attribute Modifiers
  let primaryAttrCost = 0;
  const primaryAttrs = [
    { name: 'Strength', id: 'attr-strength', code: 'STR' },
    { name: 'Agility', id: 'attr-agility', code: 'AGI' },
    { name: 'Stamina', id: 'attr-stamina', code: 'STA' },
    { name: 'Intellect', id: 'attr-intellect', code: 'INT' },
    { name: 'Wisdom', id: 'attr-wisdom', code: 'WIS' },
    { name: 'Charisma', id: 'attr-charisma', code: 'CHA' }
  ];

  const identityPoolAttrKeys = [
    { key: 'speciesAllocations', label: 'Species Pool' },
    { key: 'occuAllocations', label: 'Occupation Pool' },
    { key: 'originAllocations', label: 'Origin Pool' },
    { key: 'factionAllocations', label: 'Faction Pool' }
  ];

  // Track purchased attribute points & deduct points granted from identity pools
  primaryAttrs.forEach(({ name, id }) => {
    const totalVal = parseInt(characterData[id] || 0, 10);

    let totalGrantedPoolPts = 0;
    identityPoolAttrKeys.forEach(({ key: pKey, label: pLabel }) => {
      const pPts = parseInt(characterData[pKey]?.attributes?.[id] || 0, 10);
      if (pPts > 0) {
        totalGrantedPoolPts += pPts;
        itemizedList.push({
          category: 'Granted Attr Mod',
          item: `${name} (+${pPts})`,
          val: `Granted by ${pLabel} (0 CP Included/Supplemental)`,
          costVal: 0,
          cost: formatGrantedCost(0, pPts * 5, 'CP'),
          standaloneCost: pPts * 5
        });
      }
    });

    const purchasedPoints = Math.max(0, totalVal - totalGrantedPoolPts);
    const cost = purchasedPoints * 5;
    primaryAttrCost += cost;
    itemizedList.push({
      category: 'Primary Attr',
      item: `${name} (Purchased)`,
      val: purchasedPoints > 0 ? `${purchasedPoints} Purchased Point${purchasedPoints > 1 ? 's' : ''}` : '0 Base Purchased',
      costVal: cost,
      cost: `${cost} CP`
    });
  });

  // Inherent Attribute Modifiers granted by Species Package
  if (speciesCostBreakdown?.itemized?.attributes && Array.isArray(speciesCostBreakdown.itemized.attributes)) {
    speciesCostBreakdown.itemized.attributes.forEach(attrMod => {
      const attrCode = (attrMod.attr || '').toUpperCase();
      const attrObj = primaryAttrs.find(p => p.code === attrCode || p.name.toUpperCase() === attrCode) || { name: attrMod.attr };
      const bonus = attrMod.value || 1;
      const standalone = Math.abs(attrMod.bp !== undefined ? attrMod.bp : (bonus * 5));
      itemizedList.push({
        category: 'Species Granted Attr',
        item: `${attrObj.name} (${bonus > 0 ? `+${bonus}` : bonus})`,
        val: `Granted by ${speciesCostBreakdown.speciesName} (Included in Package)`,
        costVal: 0,
        cost: formatGrantedCost(0, standalone, 'CP'),
        standaloneCost: standalone
      });
    });
  }

  // 3. Attribute Checks / Sub-Attributes (Base = Primary * 2 + 2; 1 CP per purchased point above/below base)
  let subAttrCost = 0;
  const subAttrs = [
    { name: 'Might', id: 'attr-might', primaryId: 'attr-strength' },
    { name: 'Reflex', id: 'attr-reflex', primaryId: 'attr-agility' },
    { name: 'Fortitude', id: 'attr-fortitude', primaryId: 'attr-stamina' },
    { name: 'Reason', id: 'attr-logic', aliasId: 'attr-reason', primaryId: 'attr-intellect' },
    { name: 'Willpower', id: 'attr-will', aliasId: 'attr-willpower', primaryId: 'attr-wisdom' },
    { name: 'Etiquette', id: 'attr-etiquette', primaryId: 'attr-charisma' }
  ];

  subAttrs.forEach(({ name, id, aliasId, primaryId }) => {
    const pVal = parseInt(characterData[primaryId] || 0, 10);
    const calculatedBase = (pVal * 2) + 2;

    const hasExplicitVal = (characterData[id] !== undefined && characterData[id] !== null && characterData[id] !== '') ||
                          (aliasId && characterData[aliasId] !== undefined && characterData[aliasId] !== null && characterData[aliasId] !== '');
    const rawVal = characterData[id] !== undefined && characterData[id] !== null && characterData[id] !== ''
      ? parseInt(characterData[id], 10)
      : (aliasId ? parseInt(characterData[aliasId], 10) : 0);

    const val = (hasExplicitVal && rawVal !== 0 && !isNaN(rawVal)) ? rawVal : calculatedBase;
    const extra = val - calculatedBase;

    if (extra !== 0) {
      const cost = extra * 1;
      subAttrCost += cost;
      itemizedList.push({
        category: 'Attribute Check',
        item: `${name} (${extra >= 0 ? '+' : ''}${extra})`,
        val: `${extra >= 0 ? '+' : ''}${extra} rel. Base (${calculatedBase})`,
        costVal: cost,
        cost: `${cost} CP`
      });
    } else {
      itemizedList.push({
        category: 'Attribute Check',
        item: `${name} (Base)`,
        val: `Base Check Score (${calculatedBase})`,
        costVal: 0,
        cost: '0 CP'
      });
    }
  });

  // 4. Movement Modes & Species Locomotion
  const groundWalk = characterData['move-walk'] !== undefined && characterData['move-walk'] !== null && characterData['move-walk'] !== ''
    ? parseInt(characterData['move-walk'], 10)
    : 30;
  itemizedList.push({
    category: 'Movement Mode',
    item: `Ground Walk (${groundWalk} ft)`,
    val: 'Standard Ground Locomotion',
    costVal: 0,
    cost: '0 CP'
  });

  const otherMovementKeys = [
    { key: 'move-swim', name: 'Swim', baseBP: 2 },
    { key: 'move-climb', name: 'Climb', baseBP: 2 },
    { key: 'move-fly', name: 'Fly', baseBP: 4 },
    { key: 'move-burrow', name: 'Burrow', baseBP: 2 },
    { key: 'move-flicker', name: 'Flicker', baseBP: 2 }
  ];

  otherMovementKeys.forEach(({ key, name, baseBP }) => {
    const spd = parseInt(characterData[key] || 0, 10);
    if (spd > 0) {
      const isFromSpecies = speciesCostBreakdown && (
        (speciesCostBreakdown.speeds && speciesCostBreakdown.speeds[name.toLowerCase()] > 0) ||
        (speciesCostBreakdown.breakdown?.movementBP > 0) ||
        (Array.isArray(speciesCostBreakdown.speciesObj?.movement) && speciesCostBreakdown.speciesObj.movement.some(m => String(m).toLowerCase().includes(name.toLowerCase())))
      );
      if (isFromSpecies) {
        itemizedList.push({
          category: 'Species Movement',
          item: `${name} (${spd} ft)`,
          val: `Granted by ${speciesCostBreakdown.speciesName} (Included in Package)`,
          costVal: 0,
          cost: formatGrantedCost(0, baseBP, 'CP'),
          standaloneCost: baseBP
        });
      } else {
        itemizedList.push({
          category: 'Movement Mode',
          item: `${name} (${spd} ft)`,
          val: `${name} Locomotion Mode`,
          costVal: 0,
          cost: '0 CP'
        });
      }
    }
  });

  // 5. Hindrances / Disadvantages (Yields CP Refunds unless from Species Package)
  let disadvantageRefund = 0;
  const hindrancesList = (Array.isArray(characterData.hindrances) && characterData.hindrances.length > 0)
    ? characterData.hindrances
    : (Array.isArray(characterData.disadvantages) ? characterData.disadvantages : []);

  hindrancesList.forEach((dis) => {
    const name = typeof dis === 'object' ? (dis.name || dis.title || 'Unnamed Hindrance') : String(dis);
    const isSpeciesDis = typeof dis === 'object' && (
      dis.source === 'species' || 
      dis.category === 'Species Disadvantage' || 
      dis.category === 'Species' ||
      (speciesCostBreakdown?.itemized?.disadvantages?.some(sd => (sd.name || '').toLowerCase() === name.toLowerCase()))
    );
    const isFactionDis = typeof dis === 'object' && (
      dis.source === 'faction' ||
      dis.category === 'Faction Hindrance' ||
      dis.category === 'Faction Disadvantage' ||
      dis.category === 'Faction'
    );

    if (isSpeciesDis) {
      const refVal = typeof dis === 'object' ? (dis.refundBP || dis.bp || 3) : 3;
      itemizedList.push({
        category: 'Species Disadvantage',
        item: name,
        val: `Inherent to ${speciesCostBreakdown?.speciesName || 'Species'} (Refund included in species cost)`,
        costVal: 0,
        cost: formatGrantedCost(0, -Math.abs(refVal), 'CP'),
        standaloneCost: -Math.abs(refVal)
      });
    } else {
      const defaultRefund = (typeof dis === 'object' && (dis.refundBP || dis.bp)) ? (dis.refundBP || dis.bp) : 3;
      const cpVal = getItemCP(dis, defaultRefund);
      disadvantageRefund += cpVal;
      itemizedList.push({
        category: isFactionDis ? 'Faction Hindrance' : 'Hindrance',
        item: name,
        val: isFactionDis ? 'Faction Allegiance Restriction (CP Refund)' : 'Character Hindrance Refund',
        costVal: -cpVal,
        cost: `-${cpVal} CP`
      });
    }
  });

  // 6. Features & Perks (Standard 3 CP; Occupation Recommended Features get -1 CP discount = 2 CP; Identity Granted Features = 0 CP [standalone])
  let featuresCost = 0;
  const occuName = characterData['char-occu'];
  const occuItem = occuName ? resolveCatalogItem('occupations', occuName, dbData) : null;
  const occuRecFeatNames = new Set(
    (Array.isArray(occuItem?.recommended_features) ? occuItem.recommended_features : (Array.isArray(occuItem?.features) ? occuItem.features : []))
      .map(f => (typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f)).toLowerCase().trim())
  );

  const speciesPoolFeats = new Set((characterData.speciesAllocations?.features || []).map(f => normTrait(typeof f === 'object' ? (f.name || f.title || f.id) : f)));
  const occuPoolFeats = new Set((characterData.occuAllocations?.features || []).map(f => normTrait(typeof f === 'object' ? (f.name || f.title || f.id) : f)));
  const originPoolFeats = new Set((characterData.originAllocations?.features || []).map(f => normTrait(typeof f === 'object' ? (f.name || f.title || f.id) : f)));
  const factionPoolFeats = new Set((characterData.factionAllocations?.features || []).map(f => normTrait(typeof f === 'object' ? (f.name || f.title || f.id) : f)));

  const poolTraitNames = new Set([
    ...(characterData.speciesAllocations?.traits || []),
    ...(characterData.occuAllocations?.traits || []),
    ...(characterData.originAllocations?.traits || []),
    ...(characterData.factionAllocations?.traits || [])
  ].map(t => normTrait(typeof t === 'object' ? (t.name || t.title || t.id) : t)));

  const features = Array.isArray(characterData.features) ? characterData.features : [];
  features.forEach((feat) => {
    const name = typeof feat === 'object' ? (feat.name || feat.title || 'Unnamed Feature') : String(feat);
    const cleanName = normTrait(name);
    const fCat = typeof feat === 'object' ? (feat.category || '') : '';
    const fSource = typeof feat === 'object' ? (feat.source || '') : '';
    const isExplicitlyGranted = typeof feat === 'object' && (feat.isGranted === true || feat.cp === 0);

    const isFromSpecies = speciesPoolFeats.has(cleanName) || fSource === 'species' || fCat.includes('Species') || (speciesCostBreakdown?.itemized?.traits?.some(st => normTrait(st.name) === cleanName));
    const isFromOccu = occuPoolFeats.has(cleanName) || fSource === 'occupation' || fSource === 'occu' || fCat.includes('Occupation');
    const isFromOrigin = originPoolFeats.has(cleanName) || fSource === 'origin' || fCat.includes('Origin');
    const isFromFaction = factionPoolFeats.has(cleanName) || fSource === 'faction' || fCat.includes('Faction');
    const isPoolTrait = poolTraitNames.has(cleanName);

    const isGrantedIdentityFeat = isFromSpecies || isFromOccu || isFromOrigin || isFromFaction || isPoolTrait || isExplicitlyGranted;

    if (isGrantedIdentityFeat) {
      const standalone = (typeof feat === 'object' && (feat.standaloneCp !== undefined || feat.standaloneBp !== undefined))
        ? (feat.standaloneCp !== undefined ? feat.standaloneCp : feat.standaloneBp)
        : ((typeof feat === 'object' && feat.cp) ? feat.cp : ((typeof feat === 'object' && feat.cost) ? feat.cost : 3));

      let categoryLabel = 'Species Inherent Feature';
      let sourceName = speciesCostBreakdown?.speciesName || 'Species';
      if (isFromSpecies) {
        categoryLabel = 'Species Granted Feature';
        sourceName = speciesCostBreakdown?.speciesName || 'Species';
      } else if (isFromOccu) {
        categoryLabel = 'Occupation Granted Feature';
        sourceName = 'Occupation';
      } else if (isFromOrigin) {
        categoryLabel = 'Origin Granted Feature';
        sourceName = 'Origin';
      } else if (isFromFaction) {
        categoryLabel = 'Faction Granted Feature';
        sourceName = 'Faction';
      } else if (isPoolTrait) {
        categoryLabel = 'Identity Granted Trait';
        sourceName = 'Identity Pool';
      }

      itemizedList.push({
        category: categoryLabel,
        item: name,
        val: `Granted by ${sourceName} (0 CP Included/Supplemental)`,
        costVal: 0,
        cost: formatGrantedCost(0, standalone, 'CP'),
        standaloneCost: standalone
      });
    } else {
      const isOccuRecommended = occuRecFeatNames.has(cleanName);
      const defaultCost = isOccuRecommended ? 2 : 3;
      const cost = getItemCP(feat, defaultCost);
      featuresCost += cost;
      itemizedList.push({
        category: isOccuRecommended ? 'Recommended Feature' : 'Feature',
        item: name,
        val: isOccuRecommended ? 'Occupation Recommended (-1 CP Discount)' : ((typeof feat === 'object' && feat.type) ? feat.type : 'Perk'),
        costVal: cost,
        cost: `${cost} CP`
      });
    }
  });

  // 7. Traits (characterData.traits)
  let traitsCost = 0;
  const speciesPoolTraits = new Set((characterData.speciesAllocations?.traits || []).map(t => normTrait(typeof t === 'object' ? (t.name || t.title || t.id) : t)));
  const occuPoolTraits = new Set([
    ...(characterData.occuAllocations?.traits || []),
    ...(Array.isArray(characterData['char-occu-traits']) ? characterData['char-occu-traits'] : []),
    ...(Array.isArray(characterData.occu_traits) ? characterData.occu_traits : [])
  ].map(t => normTrait(typeof t === 'object' ? (t.name || t.title || t.id) : t)));
  const originPoolTraits = new Set([
    ...(characterData.originAllocations?.traits || []),
    ...(Array.isArray(characterData['char-origin-traits']) ? characterData['char-origin-traits'] : []),
    ...(Array.isArray(characterData.origin_traits) ? characterData.origin_traits : [])
  ].map(t => normTrait(typeof t === 'object' ? (t.name || t.title || t.id) : t)));
  const factionPoolTraits = new Set((characterData.factionAllocations?.traits || []).map(t => normTrait(typeof t === 'object' ? (t.name || t.title || t.id) : t)));

  const traitsList = Array.isArray(characterData.traits) ? characterData.traits : [];
  traitsList.forEach((trait) => {
    const name = typeof trait === 'object' ? (trait.name || trait.title || 'Unnamed Trait') : String(trait);
    const cleanName = normTrait(name);
    const tCat = typeof trait === 'object' ? (trait.category || '') : '';
    const tSource = typeof trait === 'object' ? (trait.source || '') : '';
    const isExplicitlyGranted = typeof trait === 'object' && (trait.isGranted === true || trait.cp === 0);

    const isFromSpecies = speciesPoolTraits.has(cleanName) || tSource === 'species' || tCat.includes('Species');
    const isFromOccu = occuPoolTraits.has(cleanName) || tSource === 'occupation' || tSource === 'occu' || tCat.includes('Occupation');
    const isFromOrigin = originPoolTraits.has(cleanName) || tSource === 'origin' || tCat.includes('Origin');
    const isFromFaction = factionPoolTraits.has(cleanName) || tSource === 'faction' || tCat.includes('Faction');

    const isGrantedTrait = isFromSpecies || isFromOccu || isFromOrigin || isFromFaction || isExplicitlyGranted;

    if (isGrantedTrait) {
      const standalone = (typeof trait === 'object' && (trait.standaloneBp !== undefined || trait.standaloneCp !== undefined))
        ? (trait.standaloneBp !== undefined ? trait.standaloneBp : trait.standaloneCp)
        : ((typeof trait === 'object' && trait.bp) ? trait.bp : 1);

      let categoryLabel = 'Species Trait';
      let sourceName = speciesCostBreakdown?.speciesName || 'Species';
      if (isFromSpecies) {
        categoryLabel = 'Species Trait';
        sourceName = speciesCostBreakdown?.speciesName || 'Species';
      } else if (isFromOccu) {
        categoryLabel = 'Occupation Trait';
        sourceName = 'Occupation';
      } else if (isFromOrigin) {
        categoryLabel = 'Origin Trait';
        sourceName = 'Origin';
      } else if (isFromFaction) {
        categoryLabel = 'Faction Trait';
        sourceName = 'Faction';
      }

      itemizedList.push({
        category: categoryLabel,
        item: name,
        val: `Granted by ${sourceName} (0 CP Included/Supplemental)`,
        costVal: 0,
        cost: formatGrantedCost(0, standalone, 'CP'),
        standaloneCost: standalone
      });
    } else {
      const cost = getItemCP(trait, 1);
      traitsCost += cost;
      itemizedList.push({
        category: 'Trait',
        item: name,
        val: (typeof trait === 'object' && trait.type) ? trait.type : 'Trait Purchase',
        costVal: cost,
        cost: `${cost} CP`
      });
    }
  });

  // 8. Special Abilities
  let specialAbilitiesCost = 0;
  const specAbilities = Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [];
  specAbilities.forEach((sa) => {
    const name = typeof sa === 'object' ? (sa.name || 'Unnamed Ability') : sa;
    const isSpeciesSA = typeof sa === 'object' && (sa.source === 'species' || sa.category?.includes('Species'));
    if (isSpeciesSA) {
      itemizedList.push({
        category: 'Species Special Ability',
        item: name,
        val: `Granted by ${speciesCostBreakdown?.speciesName || 'Species'} (Included in Package)`,
        costVal: 0,
        cost: formatGrantedCost(0, 5, 'CP'),
        standaloneCost: 5
      });
    } else {
      const cost = getItemCP(sa, 5);
      specialAbilitiesCost += cost;
      itemizedList.push({
        category: 'Special Ability',
        item: name,
        val: 'Innate Power',
        costVal: cost,
        cost: `${cost} CP`
      });
    }
  });

  // 9. Awakened Disciplines
  let awakenedCost = 0;
  const awakenedList = Array.isArray(characterData.awakened) ? characterData.awakened : [];
  awakenedList.forEach((awk) => {
    const name = typeof awk === 'object' ? (awk.name || 'Unnamed Discipline') : awk;
    const isSpeciesAwk = typeof awk === 'object' && (awk.source === 'species' || awk.category?.includes('Species'));
    if (isSpeciesAwk) {
      itemizedList.push({
        category: 'Species Awakened Discipline',
        item: name,
        val: `Granted by ${speciesCostBreakdown?.speciesName || 'Species'} (Included in Package)`,
        costVal: 0,
        cost: formatGrantedCost(0, 3, 'CP'),
        standaloneCost: 3
      });
    } else {
      const cost = getItemCP(awk, 5);
      awakenedCost += cost;
      itemizedList.push({
        category: 'Awakened Discipline',
        item: name,
        val: 'Magic Domain',
        costVal: cost,
        cost: `${cost} CP`
      });
    }
  });

  // 10. Invocations (1 CP Skill Specialization adding to relative meta skill)
  let invocationsCost = 0;
  const invocationsList = Array.isArray(characterData.invocations) ? characterData.invocations : [];
  invocationsList.forEach((inv) => {
    const name = typeof inv === 'object' ? (inv.name || 'Unnamed Invocation') : inv;
    const cost = getItemCP(inv, 1);
    const rank = typeof inv === 'object' && inv.rank !== undefined ? Math.max(1, parseInt(inv.rank, 10)) : 1;
    const metaSkillName = typeof inv === 'object' ? (inv.subSkill || inv.discipline || 'Meta Skill') : 'Meta Skill';
    invocationsCost += cost;
    itemizedList.push({
      category: 'Invocation',
      item: name,
      val: `1 CP Specialization (+${rank} to ${metaSkillName})`,
      costVal: cost,
      cost: `${cost} CP`
    });
  });

  // 11. Augmentations
  let augmentationsCost = 0;
  const augmentationsList = Array.isArray(characterData.augmentations) ? characterData.augmentations : [];
  augmentationsList.forEach((aug) => {
    const name = typeof aug === 'object' ? (aug.name || 'Unnamed Augmentation') : aug;
    const cost = getItemCP(aug, 0);
    augmentationsCost += cost;
    itemizedList.push({
      category: 'Augmentation',
      item: name,
      val: (typeof aug === 'object' && aug.type) ? aug.type : 'Cyberware',
      costVal: cost,
      cost: `${cost} CP`
    });
  });

  // 12. Personal Property / Gear / Weapons / Armor / Mecha / Other
  let equipmentCost = 0;
  const equipCategories = [
    { key: 'gear', category: 'Gear' },
    { key: 'weapons', category: 'Weaponry' },
    { key: 'armor', category: 'Armoring' },
    { key: 'mecha', category: 'Mecha' },
    { key: 'other', category: 'Other Property' }
  ];

  equipCategories.forEach(({ key, category }) => {
    const list = Array.isArray(characterData[key]) ? characterData[key] : [];
    list.forEach((item) => {
      const name = typeof item === 'object' ? (item.name || 'Unnamed Item') : item;
      const cost = getItemCP(item, 0);
      equipmentCost += cost;
      itemizedList.push({
        category,
        item: name,
        val: 'Item Purchase',
        costVal: cost,
        cost: `${cost} CP`
      });
    });
  });

  // 13. Skills: Species Granted Bonuses & General Point Buy
  if (speciesCostBreakdown?.speciesObj?.specific_skill_bonuses && Array.isArray(speciesCostBreakdown.speciesObj.specific_skill_bonuses)) {
    speciesCostBreakdown.speciesObj.specific_skill_bonuses.forEach(b => {
      const sName = typeof b === 'object' ? (b.skill || b.name || '') : String(b).split(/[:+(]/)[0].trim();
      const sBonus = typeof b === 'object' ? (b.bonus ?? b.value ?? 1) : 1;
      if (sName) {
        itemizedList.push({
          category: 'Species Skill Bonus',
          item: `${sName} (+${sBonus})`,
          val: `Granted by ${speciesCostBreakdown.speciesName} (Included in Package)`,
          costVal: 0,
          cost: formatGrantedCost(0, sBonus, 'CP'),
          standaloneCost: sBonus
        });
      }
    });
  }

  let skillRanksCost = 0;
  const getPoolSkillRank = (pool, sId, sName) => {
    if (!pool || !pool.skills) return 0;
    const targetNormId = sId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetNormName = (sName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [sKey, sRank] of Object.entries(pool.skills)) {
      const kNorm = sKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (kNorm === targetNormId || kNorm === targetNormName) {
        return parseInt(sRank, 10) || 0;
      }
    }
    return 0;
  };

  Object.keys(characterData).forEach((key) => {
    if (key.startsWith('skill-') && key.endsWith('-rank')) {
      const rawRank = parseInt(characterData[key] || 0, 10);
      const rank = Math.min(20, Math.max(0, rawRank)); // Max level 20 cap
      if (rank > 0) {
        const skillId = key.replace('skill-', '').replace('-rank', '');
        const storedName = characterData[`skill-${skillId}-name`];
        const skillName = storedName || skillId.replace(/-/g, ' ');

        const specRanks = getPoolSkillRank(characterData.speciesAllocations, skillId, skillName);
        const occuRanks = getPoolSkillRank(characterData.occuAllocations, skillId, skillName);
        const origRanks = getPoolSkillRank(characterData.originAllocations, skillId, skillName);
        const facRanks = getPoolSkillRank(characterData.factionAllocations, skillId, skillName);

        const totalGrantedPoolRanks = specRanks + occuRanks + origRanks + facRanks;
        const effectiveGrantedRanks = Math.min(rank, totalGrantedPoolRanks);
        const purchasedRanks = Math.max(0, rank - effectiveGrantedRanks);

        [
          { ranks: specRanks, label: 'Species Granted Skill', source: 'Species' },
          { ranks: occuRanks, label: 'Occupation Granted Skill', source: 'Occupation' },
          { ranks: origRanks, label: 'Origin Granted Skill', source: 'Origin' },
          { ranks: facRanks, label: 'Faction Granted Skill', source: 'Faction' }
        ].forEach(({ ranks, label, source }) => {
          if (ranks > 0) {
            itemizedList.push({
              category: label,
              item: `${skillName} (+${ranks} Rank${ranks > 1 ? 's' : ''})`,
              val: `Granted by ${source} Package (0 CP Included/Supplemental)`,
              costVal: 0,
              cost: formatGrantedCost(0, ranks, 'CP'),
              standaloneCost: ranks
            });
          }
        });

        if (purchasedRanks > 0) {
          const cost = purchasedRanks * 1; // 1 CP per rank default
          skillRanksCost += cost;
          itemizedList.push({
            category: 'Skill Rank',
            item: skillName,
            val: `${purchasedRanks} Purchased Rank${purchasedRanks > 1 ? 's' : ''}`,
            costVal: cost,
            cost: `${cost} CP`
          });
        }
      }
    }
  });

  let specializationRanksCost = 0;
  const specializations = Array.isArray(characterData.specializations) ? characterData.specializations : [];
  specializations.forEach((spec) => {
    const rawRank = typeof spec === 'object' ? parseInt(spec.rank || 0, 10) : 0;
    const rank = Math.min(10, Math.max(0, rawRank)); // Max level 10 cap
    if (rank > 0) {
      const specName = typeof spec === 'object' ? (spec.name || 'Unnamed Spec') : 'Unnamed Spec';
      const cost = typeof spec === 'object' && spec.cp !== undefined ? parseInt(spec.cp, 10) : rank * 1;
      specializationRanksCost += cost;
      itemizedList.push({
        category: 'Specialization',
        item: specName,
        val: `${rank} Levels`,
        costVal: cost,
        cost: `${cost} CP`
      });
    }
  });

  // 14. Purchased Stats Cost (Health & Vitality)
  let purchasedStatsCost = 0;
  if (derivedStats.purchasedHealth > 0) {
    const cost = Math.ceil(derivedStats.purchasedHealth / 5);
    purchasedStatsCost += cost;
    itemizedList.push({
      category: 'Purchased Stat',
      item: 'Bonus Health',
      val: `+${derivedStats.purchasedHealth} Health`,
      costVal: cost,
      cost: `${cost} CP`
    });
  }

  if (derivedStats.purchasedVitality > 0) {
    const cost = Math.ceil(derivedStats.purchasedVitality / 5);
    purchasedStatsCost += cost;
    itemizedList.push({
      category: 'Purchased Stat',
      item: 'Bonus Vitality',
      val: `+${derivedStats.purchasedVitality} Vitality`,
      costVal: cost,
      cost: `${cost} CP`
    });
  }

  // Calculate Total Spent CP
  const spentCP = (
    identityCost +
    primaryAttrCost +
    subAttrCost +
    featuresCost +
    traitsCost +
    specialAbilitiesCost +
    awakenedCost +
    invocationsCost +
    augmentationsCost +
    equipmentCost +
    skillRanksCost +
    specializationRanksCost +
    purchasedStatsCost -
    disadvantageRefund
  );

  const earnedAP = Math.max(0, parseInt(characterData.earned_ap || 0, 10));
  const experienceDebt = Math.max(0, parseInt(characterData.experience_debt || 0, 10));
  const totalBudget = startingCP + earnedAP;
  const remainingCP = totalBudget - spentCP;
  const availableAP = Math.max(0, earnedAP - Math.max(0, spentCP - startingCP));

  return {
    startingCP,
    earnedAP,
    totalBudget,
    spentCP,
    remainingCP,
    availableAP,
    experienceDebt,
    experienceAwards: Array.isArray(characterData.experience_awards) ? characterData.experience_awards : [],
    experienceSpends: Array.isArray(characterData.experience_spends) ? characterData.experience_spends : [],
    primaryAttrCost,
    subAttrCost,
    skillRanksCost,
    specializationRanksCost,
    featuresCost,
    traitsCost,
    disadvantageRefund,
    specialAbilitiesCost,
    awakenedCost,
    invocationsCost,
    identityPools,
    speciesCostBreakdown,
    itemizedList
  };
}


