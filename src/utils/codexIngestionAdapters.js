/**
 * ════════════════════════════════════════════════════════════════════════════════
 * CODEX INGESTION ADAPTERS — TANGENT SF RP / OMNICORTEX
 * Bidirectional normalization between raw Spark / LLM JSON payloads (Prompts A-N)
 * and canonical Omnicortex Firestore database collections.
 * Supports both modern canonical nested schemas and legacy flat string schemas.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { sanitizeMathAndMarkdown, sanitizePayloadStrings } from '../pages/Codex/codexPromptRegistry.js';
import { normalizeOmnicortexItem } from './tangentSchemaAdapters.js';

/**
 * Generates a clean, URL-safe and Firestore-safe document ID from a string name.
 */
export function sanitizeDocumentId(name) {
  if (!name || typeof name !== 'string') {
    return `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return clean || `item-${Date.now()}`;
}

/**
 * Extracts a clean integer from strings like "TL 3+", "25 BP", "DR 15", or numbers.
 */
export function parseNumericValue(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const match = val.match(/-?\d+(\.\d+)?/);
    if (match) {
      const parsed = parseFloat(match[0]);
      return isNaN(parsed) ? fallback : parsed;
    }
  }
  return fallback;
}

/**
 * Parses comma or newline separated modifier strings into structured modifier arrays.
 */
export function parseModifiersString(modStr, type = 'general', mode = 'inherent') {
  if (!modStr || typeof modStr !== 'string') return [];
  const parts = modStr.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
  return parts.map(part => {
    const cleaned = sanitizeMathAndMarkdown(part);
    const num = parseNumericValue(cleaned, 1);
    const target = cleaned.replace(/[+-]?\d+/g, '').replace(/[:=]/g, '').trim() || cleaned;
    return {
      target,
      type,
      value: num,
      mode,
      raw: cleaned
    };
  });
}

/**
 * Normalizes array fields that might be passed as arrays or comma-delimited strings.
 */
function ensureArray(val, fallback = []) {
  if (Array.isArray(val)) return val.map(x => typeof x === 'string' ? sanitizeMathAndMarkdown(x) : x).filter(Boolean);
  if (typeof val === 'string' && val.trim()) {
    return val.split(/[,;\n]+/).map(x => sanitizeMathAndMarkdown(x.trim())).filter(Boolean);
  }
  return fallback;
}

/**
 * Main dispatcher: Adapts an item from a specific Spark dataset into a Firestore-ready Omnicortex document.
 */
export function adaptSparkItemToFirestore(datasetKey, rawItem) {
  if (!rawItem || typeof rawItem !== 'object') return null;

  // First, sanitize all string fields from LaTeX math and markdown styling
  const sanitized = sanitizePayloadStrings(rawItem);
  const baseId = sanitized.id || sanitizeDocumentId(sanitized.name);

  let adapted = {
    id: baseId,
    name: sanitized.name || 'Unnamed Record',
    _ingested_at: new Date().toISOString(),
    _spark_dataset: datasetKey
  };

  switch (datasetKey) {
    // ─────────────────────────────────────────────────────────────────────────
    // SPECIES (Prompt A)
    // ─────────────────────────────────────────────────────────────────────────
    case 'species': {
      const bpCost = sanitized.costs && typeof sanitized.costs === 'object' && sanitized.costs.bp !== undefined
        ? parseNumericValue(sanitized.costs.bp, 0)
        : parseNumericValue(sanitized.prerequisites ?? sanitized.bp ?? sanitized.cp, 0);

      const combinedLore = sanitized.body || [
        sanitized.fullLore || '',
        sanitized.profileAndVisualSemiotics ? `### Visual Semiotics & Aesthetics\n${sanitized.profileAndVisualSemiotics}` : '',
        sanitized.disciplinesAndSpecialAbilities ? `### Disciplines & Special Abilities\n${sanitized.disciplinesAndSpecialAbilities}` : ''
      ].filter(Boolean).join('\n\n');

      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : [
            ...parseModifiersString(sanitized.attributeModifiers, 'attribute', 'inherent'),
            ...parseModifiersString(sanitized.skillModifiers, 'skill', 'inherent'),
            ...parseModifiersString(sanitized.bonusFeatures, 'feature', 'inherent'),
            ...parseModifiersString(sanitized.recommendedFeatures, 'feature', 'recommended')
          ];

      adapted = {
        ...adapted,
        title: sanitized.title || sanitized.formalTitle || sanitized.name,
        parent_species: sanitized.parent_species || sanitized.parentLineage || 'Independent',
        description: sanitized.description || sanitized.summary || '',
        stigma: sanitized.stigma || sanitized.socialStigma || 'None',
        homeworld: sanitized.homeworld || 'Various',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        type: ensureArray(sanitized.type, ['species_type-humanoid']),
        size: ensureArray(sanitized.size, ['species_size-medium']),
        movement: ensureArray(sanitized.movement, ['species_movement-bipedal']),
        trait: ensureArray(sanitized.trait ?? sanitized.traits),
        body: combinedLore,
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: bpCost, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: bpCost, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        modifiers: modernModifiers,
        note: sanitized.note || null,
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FEATURES (Prompt B)
    // ─────────────────────────────────────────────────────────────────────────
    case 'features': {
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'feature', 'inherent');

      adapted = {
        ...adapted,
        type: (sanitized.type || 'general').toLowerCase(),
        description: sanitized.description || '',
        tech_level: sanitized.tech_level !== undefined || sanitized.techLevel !== undefined
          ? parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 0)
          : null,
        meta_level: sanitized.meta_level !== undefined || sanitized.metaLevel !== undefined
          ? parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0)
          : null,
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        modifiers: modernModifiers,
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        multi: sanitized.multi !== undefined ? Boolean(sanitized.multi) : Boolean(sanitized.isMultipleSelection),
        staged: sanitized.staged !== undefined ? Boolean(sanitized.staged) : Boolean(sanitized.isStaged),
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 1, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: parseNumericValue(sanitized.bp ?? sanitized.cp, 1), credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SKILLS (Prompt C)
    // ─────────────────────────────────────────────────────────────────────────
    case 'skills': {
      adapted = {
        ...adapted,
        type: (sanitized.type || 'mental').toLowerCase(),
        subtype: sanitized.subtype ? sanitized.subtype.toLowerCase() : null,
        is_specialization: sanitized.is_specialization !== undefined ? Boolean(sanitized.is_specialization) : Boolean(sanitized.isSpecialization),
        base_skill: sanitized.base_skill ?? sanitized.baseSkill ?? null,
        description: sanitized.description || '',
        tech_level: sanitized.tech_level !== undefined || sanitized.techLevel !== undefined
          ? parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 0)
          : null,
        meta_level: sanitized.meta_level !== undefined || sanitized.metaLevel !== undefined
          ? parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0)
          : null,
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DISADVANTAGES (Prompt D)
    // ─────────────────────────────────────────────────────────────────────────
    case 'disadvantages': {
      const refund = parseNumericValue(sanitized.cp ?? sanitized.cpRefunded, 10);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'disadvantage', 'penalty');

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        tech_level: sanitized.tech_level !== undefined || sanitized.techLevel !== undefined
          ? parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 0)
          : null,
        meta_level: sanitized.meta_level !== undefined || sanitized.metaLevel !== undefined
          ? parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0)
          : null,
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        modifiers: modernModifiers,
        cp: refund,
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: -refund, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: -refund, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FACTIONS (Prompt E)
    // ─────────────────────────────────────────────────────────────────────────
    case 'factions': {
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : [
            ...parseModifiersString(sanitized.attributeModifiers, 'attribute', 'inherent'),
            ...parseModifiersString(sanitized.skillModifiers, 'skill', 'inherent'),
            ...parseModifiersString(sanitized.featureModifiers, 'feature', 'inherent'),
            ...parseModifiersString(sanitized.modifiers, 'faction', 'inherent')
          ];

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        society: sanitized.society || 'Standard Planetary Society',
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        archetype: sanitized.archetype || sanitized.socialArchetype || 'Militaristic',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        colloquialisms: sanitized.colloquialisms || '',
        symbol_sigil: sanitized.symbol_sigil || sanitized.symbolSigil || '',
        driving_mandate: sanitized.driving_mandate || sanitized.drivingMandate || '',
        motto: sanitized.motto || '',
        core_beliefs: sanitized.core_beliefs || sanitized.coreBeliefs || '',
        social_structure: sanitized.social_structure || sanitized.socialStructure || '',
        outsider_view: sanitized.outsider_view || sanitized.viewOfOutsiders || '',
        law_order: sanitized.law_order || sanitized.lawAndOrder || '',
        government_type: sanitized.government_type || sanitized.governmentType || '',
        leadership: sanitized.leadership || '',
        succession: sanitized.succession || '',
        primary_exports: sanitized.primary_exports || sanitized.primaryExports || '',
        economic_model: sanitized.economic_model || sanitized.economicModel || '',
        military_doctrine: sanitized.military_doctrine || sanitized.militaryDoctrine || '',
        key_units: sanitized.key_units || sanitized.keyUnits || '',
        naval_assets: sanitized.naval_assets || sanitized.navalAssets || '',
        design_language: sanitized.design_language || sanitized.designLanguage || '',
        architecture: sanitized.architecture || '',
        gear_aesthetic: sanitized.gear_aesthetic || sanitized.gearAesthetic || '',
        lighting_mood: sanitized.lighting_mood || sanitized.lightingMood || '',
        image_prompt: sanitized.image_prompt || sanitized.imagePrompt || '',
        attitude: sanitized.attitude || '',
        goals: sanitized.goals || '',
        social_strengths: sanitized.social_strengths || sanitized.socialStrengths || '',
        social_weaknesses: sanitized.social_weaknesses || sanitized.socialWeaknesses || '',
        modifiers: modernModifiers,
        mechanic: sanitized.mechanic || sanitized.gameMechanicsAndNotes || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OCCUPATIONS (Prompt F)
    // ─────────────────────────────────────────────────────────────────────────
    case 'occupations': {
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : [
            ...parseModifiersString(sanitized.attributeModifiers, 'attribute', 'inherent'),
            ...parseModifiersString(sanitized.skillModifiers, 'skill', 'inherent'),
            ...parseModifiersString(sanitized.featureModifiers, 'feature', 'inherent'),
            ...parseModifiersString(sanitized.modifiers, 'occupation', 'inherent')
          ];

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        trait: ensureArray(sanitized.trait ?? sanitized.traits),
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        modifiers: modernModifiers,
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INVOCATIONS & SPECIAL ABILITIES (Prompt G)
    // ─────────────────────────────────────────────────────────────────────────
    case 'invocations': {
      const designDc = parseNumericValue(sanitized.design_dc ?? sanitized.designDC ?? sanitized.craft_dc, 18);
      const strainCost = parseNumericValue(sanitized.strain_cost ?? sanitized.strainFocusCost ?? sanitized.strain, 0);
      const focusCost = parseNumericValue(sanitized.focus_cost ?? sanitized.strainFocusCost ?? sanitized.focus, strainCost);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'invocation', 'inherent');

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        discipline: (sanitized.discipline || 'telekinesis').toLowerCase(),
        meta_skill: sanitized.meta_skill || sanitized.metaSkill || 'Metaphysics',
        area: ensureArray(sanitized.area, ['Single Target']),
        effect: ensureArray(sanitized.effect, ['Direct Damage']),
        range: ensureArray(sanitized.range, ['Medium (30ft)']),
        target: ensureArray(sanitized.target, ['Single Target']),
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        design_dc: designDc,
        craft_dc: designDc,
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 0),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 2),
        cast_time: sanitized.cast_time || sanitized.castTime || sanitized.actionCost || '1 Action',
        duration: sanitized.duration || 'Instant',
        note: sanitized.note || sanitized.notes || '',
        critical_details: sanitized.critical_details && typeof sanitized.critical_details === 'object'
          ? sanitized.critical_details
          : {
              score: sanitized.critical_score || sanitized.criticalScore || '20',
              effect: ensureArray(sanitized.critical_effect ?? sanitized.criticalEffect),
              success_effect: ensureArray(sanitized.critical_success_effect ?? sanitized.criticalSuccessEffect),
              failure_effect: ensureArray(sanitized.critical_failure_effect ?? sanitized.criticalFailureEffect)
            },
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 0, credits: 0, nodes: 0, sockets: 0, strain: strainCost, focus: focusCost, ap: 2, ...sanitized.costs }
          : { bp: 0, credits: 0, nodes: 0, sockets: 0, strain: strainCost, focus: focusCost, ap: 2 },
        sockets: sanitized.sockets && typeof sanitized.sockets === 'object'
          ? sanitized.sockets
          : { max: 0, used: 0, tier: 'Socket', allocated: [] },
        modifiers: modernModifiers,
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUGMENTATIONS (Prompt H)
    // ─────────────────────────────────────────────────────────────────────────
    case 'augmentations': {
      const craftDc = parseNumericValue(sanitized.craft_dc ?? sanitized.design_dc ?? sanitized.craftingDC, 20);
      const nodeCost = parseNumericValue(sanitized.node_cost ?? sanitized.nodeCost, 1);
      const socketCost = parseNumericValue(sanitized.socket_cost ?? sanitized.socketCost, 1);
      const bpCost = parseNumericValue(sanitized.bp_cost ?? sanitized.bpCost ?? sanitized.bp, 2);
      const sp = parseNumericValue(sanitized.sp ?? sanitized.structurePoints, 15);
      const dr = parseNumericValue(sanitized.dr ?? sanitized.damageResist, 1);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'augmentation', 'inherent');

      adapted = {
        ...adapted,
        type: sanitized.type || sanitized.augmentationCategory || 'Cybernetics',
        location: ensureArray(sanitized.location, ['Head']),
        description: sanitized.description || '',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        design_dc: craftDc,
        craft_dc: craftDc,
        sp,
        dr,
        stigma: sanitized.stigma || 'Minor',
        classification: ensureArray(sanitized.classification),
        creator: ensureArray(sanitized.creator),
        design: ensureArray(sanitized.design),
        component: ensureArray(sanitized.component),
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        critical_details: sanitized.critical_details && typeof sanitized.critical_details === 'object'
          ? sanitized.critical_details
          : {
              score: '20',
              effect: [],
              success_effect: ensureArray(sanitized.critical_success_effect ?? sanitized.criticalSuccessEffect),
              failure_effect: ensureArray(sanitized.critical_failure_effect ?? sanitized.criticalFailureEffect)
            },
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: bpCost, credits: 0, nodes: nodeCost, sockets: socketCost, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: bpCost, credits: parseNumericValue(sanitized.cost ?? sanitized.creditCost, 2500), nodes: nodeCost, sockets: socketCost, strain: 0, focus: 0, ap: 0 },
        sockets: sanitized.sockets && typeof sanitized.sockets === 'object'
          ? sanitized.sockets
          : { max: socketCost, used: socketCost, tier: 'Socket', allocated: [] },
        modifiers: modernModifiers,
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GEAR (Prompt I)
    // ─────────────────────────────────────────────────────────────────────────
    case 'gear': {
      const craftDc = parseNumericValue(sanitized.craft_dc ?? sanitized.craftingDC, 15);
      const creditCost = parseNumericValue(sanitized.credits ?? sanitized.cost ?? sanitized.creditCost, 150);
      const weight = parseNumericValue(sanitized.weight, 1.0);
      const totalSockets = parseNumericValue(sanitized.sockets?.max ?? sanitized.totalSockets, 2);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers || sanitized.passiveEnhancements, 'gear', 'inherent');

      adapted = {
        ...adapted,
        category: sanitized.category || sanitized.gearCategory || 'Electronics',
        size: sanitized.size || sanitized.sizeCategory || 'Small',
        faction_skin: sanitized.faction_skin || sanitized.manufacturer || 'Standard',
        base_dc: parseNumericValue(sanitized.base_dc ?? sanitized.baseDC, 12),
        craft_dc: craftDc,
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        weight,
        sp: parseNumericValue(sanitized.sp ?? sanitized.structurePoints, 10),
        dr: parseNumericValue(sanitized.dr ?? sanitized.damageResist, 0),
        workspace_scale: sanitized.workspace_scale || sanitized.workspaceScale || 'Belt',
        computer_pr: parseNumericValue(sanitized.computer_pr ?? sanitized.processorRating, 1),
        software_level: parseNumericValue(sanitized.software_level ?? sanitized.softwareLevel, 0),
        epr_rating: parseNumericValue(sanitized.epr_rating ?? sanitized.eprRating, 0),
        supply_die: sanitized.supply_die || sanitized.supplyDie || 'None',
        enhancement_type: sanitized.enhancement_type || sanitized.metaTechType || 'Passive',
        invocation_rank: parseNumericValue(sanitized.invocation_rank ?? sanitized.invocationRank, 0),
        scale_tier: sanitized.scale_tier || sanitized.scaleTier || 'Personal',
        daily_charges: parseNumericValue(sanitized.daily_charges ?? sanitized.dailyCharges, 0),
        description: sanitized.description || '',
        availability: sanitized.availability || 'Common',
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 0, credits: creditCost, nodes: 0, sockets: totalSockets, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: 0, credits: creditCost, nodes: 0, sockets: totalSockets, strain: 0, focus: 0, ap: 0 },
        sockets: sanitized.sockets && typeof sanitized.sockets === 'object'
          ? sanitized.sockets
          : { max: totalSockets, used: parseNumericValue(sanitized.socketsUsed, 0), tier: 'Socket', allocated: [] },
        modifications: Array.isArray(sanitized.modifications) ? sanitized.modifications : [],
        modifiers: modernModifiers,
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WEAPONRY (Prompt J)
    // ─────────────────────────────────────────────────────────────────────────
    case 'weaponry': {
      const craftDc = parseNumericValue(sanitized.design_dc ?? sanitized.craft_dc ?? sanitized.designDC, 18);
      const cost = parseNumericValue(sanitized.credits ?? sanitized.cost, 500);
      const socketsCount = parseNumericValue(sanitized.sockets?.max ?? sanitized.sockets ?? sanitized.componentSlots, 3);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'weapon', 'inherent');

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        availability: sanitized.availability || 'Common',
        design_dc: craftDc,
        craft_dc: craftDc,
        size: ensureArray(sanitized.size, ['species_size-medium']),
        weight: parseNumericValue(sanitized.weight, 3.0),
        quality: sanitized.quality || 'Standard',
        durability: parseNumericValue(sanitized.durability, 30),
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        skill: sanitized.skill || 'Firearms',
        special: ensureArray(sanitized.special),
        area: ensureArray(sanitized.area),
        effect: ensureArray(sanitized.effect),
        range: sanitized.range || '30/60/150',
        target: ensureArray(sanitized.target, ['Single Target']),
        origin: ensureArray(sanitized.origin),
        creator: ensureArray(sanitized.creator),
        classification: sanitized.classification || 'Ranged (Ballistic)',
        damage: sanitized.damage || '2d6',
        damage_type: sanitized.damage_type || sanitized.damageType || 'Kinetic',
        ap: parseNumericValue(sanitized.ap ?? sanitized.penetration, 0),
        ammunition: sanitized.ammunition || sanitized.ammunitionCapacity || '30 (Standard Magazine)',
        power_source: sanitized.power_source || sanitized.powerSource || 'Standard Magazine',
        faction_skin: sanitized.faction_skin || sanitized.factionSkin || 'Standard',
        design: ensureArray(sanitized.design),
        accuracy: parseNumericValue(sanitized.accuracy, 0),
        modes: ensureArray(sanitized.modes, ['Single']),
        attack_rate: sanitized.attack_rate || sanitized.rateOfFire || '1',
        wielding: sanitized.wielding || 'Two-Handed',
        component: ensureArray(sanitized.component ?? sanitized.components),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        critical_details: sanitized.critical_details && typeof sanitized.critical_details === 'object'
          ? sanitized.critical_details
          : {
              score: sanitized.critical_score || sanitized.criticalScore || '20',
              effect: ensureArray(sanitized.critical_effect ?? sanitized.criticalEffect),
              success_effect: ensureArray(sanitized.critical_success_effect ?? sanitized.criticalSuccessEffect, ['Double Damage']),
              failure_effect: ensureArray(sanitized.critical_failure_effect ?? sanitized.criticalFailureEffect, ['Weapon Jam / Misfire'])
            },
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 0, credits: cost, nodes: 0, sockets: socketsCount, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: 0, credits: cost, nodes: 0, sockets: socketsCount, strain: 0, focus: 0, ap: 0 },
        sockets: sanitized.sockets && typeof sanitized.sockets === 'object'
          ? sanitized.sockets
          : { max: socketsCount, used: 0, tier: 'Socket', allocated: [] },
        modifications: Array.isArray(sanitized.modifications) ? sanitized.modifications : [],
        modifiers: modernModifiers,
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ARMORING (Prompt K)
    // ─────────────────────────────────────────────────────────────────────────
    case 'armoring': {
      const craftDc = parseNumericValue(sanitized.design_dc ?? sanitized.craft_dc ?? sanitized.designDC, 16);
      const cost = parseNumericValue(sanitized.credits ?? sanitized.cost, 1000);
      const componentSlots = parseNumericValue(sanitized.sockets?.max ?? sanitized.sockets ?? sanitized.componentSlots, 4);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'armor', 'inherent');

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        availability: sanitized.availability || 'Common',
        design_dc: craftDc,
        craft_dc: craftDc,
        size: ensureArray(sanitized.size, ['species_size-medium']),
        weight: parseNumericValue(sanitized.weight, 7.5),
        quality: sanitized.quality || 'Standard',
        durability: parseNumericValue(sanitized.durability, 45),
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        skill: sanitized.skill || 'Armor Handling',
        origin: ensureArray(sanitized.origin),
        creator: ensureArray(sanitized.creator),
        design: ensureArray(sanitized.design),
        classification: ensureArray(sanitized.classification, ['Ballistic']),
        material: ensureArray(sanitized.material, ['Ceramite', 'Ballistic Weave']),
        body_locations: ensureArray(sanitized.body_locations ?? sanitized.bodyLocations, ['Torso']),
        coverage: sanitized.coverage || 'Standard',
        max_dex: parseNumericValue(sanitized.max_dex ?? sanitized.maxDexBonus, 4),
        mobility_penalty: parseNumericValue(sanitized.mobility_penalty ?? sanitized.mobilityPenalty, 0),
        faction_skin: sanitized.faction_skin || sanitized.factionSkin || 'Standard',
        carried_shield: sanitized.carried_shield || sanitized.carriedShield || null,
        category: sanitized.category || 'Mediumweight',
        resistance: ensureArray(sanitized.resistance, ['Kinetic']),
        modes: ensureArray(sanitized.modes, ['Passive']),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        critical_details: sanitized.critical_details && typeof sanitized.critical_details === 'object'
          ? sanitized.critical_details
          : {
              score: '20',
              effect: [],
              success_effect: ensureArray(sanitized.critical_success_effect ?? sanitized.criticalSuccessEffect, ['Deflection']),
              failure_effect: ensureArray(sanitized.critical_failure_effect ?? sanitized.criticalFailureEffect, ['Compromised Seal'])
            },
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 0, credits: cost, nodes: 0, sockets: componentSlots, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: 0, credits: cost, nodes: 0, sockets: componentSlots, strain: 0, focus: 0, ap: 0 },
        sockets: sanitized.sockets && typeof sanitized.sockets === 'object'
          ? sanitized.sockets
          : { max: componentSlots, used: 0, tier: 'Socket', allocated: [] },
        modifications: Array.isArray(sanitized.modifications) ? sanitized.modifications : [],
        modifiers: modernModifiers,
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MECHA (Prompt L)
    // ─────────────────────────────────────────────────────────────────────────
    case 'mecha': {
      const craftDc = parseNumericValue(sanitized.craft_dc ?? sanitized.craftingDC, 24);
      const cost = parseNumericValue(sanitized.credits ?? sanitized.creditCost, 250000);
      const totalMounts = parseNumericValue(sanitized.sockets?.max ?? sanitized.totalMounts, 6);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'mecha', 'inherent');

      adapted = {
        ...adapted,
        domain: sanitized.domain || sanitized.operationDomain || 'Ground',
        size: sanitized.size || sanitized.sizeCategory || 'Large',
        frame: sanitized.frame || sanitized.bodyType || 'Humanoid',
        faction_skin: sanitized.faction_skin || sanitized.manufacturer || 'Standard',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        craft_dc: craftDc,
        sp: parseNumericValue(sanitized.sp ?? sanitized.structurePoints, 150),
        dr: parseNumericValue(sanitized.dr ?? sanitized.damageResist, 15),
        propulsion: sanitized.propulsion || sanitized.primaryPropulsion || 'Bipedal Walker',
        armor_plating: ensureArray(sanitized.armor_plating ?? sanitized.armorPlating),
        vft_mode: sanitized.vft_mode || sanitized.variableForm || 'None',
        pilot_agility: parseNumericValue(sanitized.pilot_agility ?? sanitized.pilotMod, 0),
        handling: parseNumericValue(sanitized.handling ?? sanitized.handlingMod, 0),
        description: sanitized.description || '',
        availability: sanitized.availability || 'Military License',
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        mechanic: sanitized.mechanic || sanitized.installedModules || '',
        note: sanitized.note || sanitized.notes || '',
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 0, credits: cost, nodes: 0, sockets: totalMounts, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: 0, credits: cost, nodes: 0, sockets: totalMounts, strain: 0, focus: 0, ap: 0 },
        sockets: sanitized.sockets && typeof sanitized.sockets === 'object'
          ? sanitized.sockets
          : { max: totalMounts, used: 0, tier: 'Hardpoint', allocated: [] },
        modifications: Array.isArray(sanitized.modifications) ? sanitized.modifications : [],
        modifiers: modernModifiers,
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ARCHITECTURE (Prompt M)
    // ─────────────────────────────────────────────────────────────────────────
    case 'architecture': {
      const craftDc = parseNumericValue(sanitized.craft_dc ?? sanitized.design_dc ?? sanitized.craftingDC, 22);
      const cost = parseNumericValue(sanitized.credits ?? sanitized.creditCost, 1500000);
      const totalModules = parseNumericValue(sanitized.sockets?.max ?? sanitized.totalModules, 16);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'architecture', 'inherent');

      adapted = {
        ...adapted,
        style: sanitized.style || sanitized.architecturalStyle || 'Modular High-Tech',
        footprint: sanitized.footprint || sanitized.footprintSize || 'Large',
        height_class: sanitized.height_class || sanitized.heightClass || 'Mid-Rise',
        stories: parseNumericValue(sanitized.stories, 4),
        frame: sanitized.frame || sanitized.frameConfiguration || 'Standard',
        environment: sanitized.environment || sanitized.environmentalModifiers || 'Standard',
        propulsion: sanitized.propulsion || sanitized.mobilityPropulsion || 'None (Static)',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        sp: parseNumericValue(sanitized.sp ?? sanitized.structurePoints, 1000),
        dr: parseNumericValue(sanitized.dr ?? sanitized.damageResist, 25),
        design_dc: craftDc,
        craft_dc: craftDc,
        security_level: sanitized.security_level || sanitized.securityLevel || 'High Security',
        primary_purpose: sanitized.primary_purpose || sanitized.primaryPurpose || 'Operational Outpost',
        description: sanitized.description || '',
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: [
          sanitized.note || sanitized.notes || '',
          sanitized.installedFacilities ? `Facilities: ${sanitized.installedFacilities}` : '',
          sanitized.installedHardpoints ? `Hardpoints: ${sanitized.installedHardpoints}` : '',
          sanitized.coreInternals ? `Core: ${sanitized.coreInternals}` : ''
        ].filter(Boolean).join('\n\n'),
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 0, credits: cost, nodes: 0, sockets: totalModules, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: 0, credits: cost, nodes: 0, sockets: totalModules, strain: 0, focus: 0, ap: 0 },
        sockets: sanitized.sockets && typeof sanitized.sockets === 'object'
          ? sanitized.sockets
          : { max: totalModules, used: 0, tier: 'Module', allocated: [] },
        modifications: Array.isArray(sanitized.modifications) ? sanitized.modifications : [],
        modifiers: modernModifiers,
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OTHER (Prompt N)
    // ─────────────────────────────────────────────────────────────────────────
    case 'other':
    default: {
      const cost = parseNumericValue(sanitized.credits ?? sanitized.cost, 50);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'other', 'inherent');

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        weight: parseNumericValue(sanitized.weight, 1.0),
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 2),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        availability: sanitized.availability || 'Common',
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 0, credits: cost, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: 0, credits: cost, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        modifiers: modernModifiers,
        rawSparkData: sanitized
      };
      break;
    }
  }

  // Final pass through the universal normalizer to guarantee costs map, modifiers list, sockets, and critical details
  return normalizeOmnicortexItem(adapted);
}
