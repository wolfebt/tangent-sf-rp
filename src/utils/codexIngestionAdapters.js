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
        species_type: sanitized.species_type || (Array.isArray(sanitized.type) && sanitized.type[0]) || 'Humanoid',
        description: sanitized.description || sanitized.summary || '',
        stigma: sanitized.stigma || sanitized.socialStigma || 'None',
        homeworld: sanitized.homeworld || 'Various',
        lifespan: sanitized.lifespan || 'Standard (80-120 Solar Years)',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        type: ensureArray(sanitized.type, ['species_type-humanoid']),
        size: ensureArray(sanitized.size, ['species_size-medium']),
        movement: ensureArray(sanitized.movement, ['species_movement-bipedal']),
        traits: ensureArray(sanitized.traits ?? sanitized.trait),
        features: ensureArray(sanitized.features ?? sanitized.feature),
        disadvantages: ensureArray(sanitized.disadvantages ?? sanitized.disadvantage),
        trait: ensureArray(sanitized.trait ?? sanitized.traits),
        body: combinedLore,
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: bpCost, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: bpCost, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        modifiers: modernModifiers,
        tags: ensureArray(sanitized.tags, ['species']),
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

      const apCost = parseNumericValue(sanitized.ap_cost ?? sanitized.costs?.ap ?? sanitized.costs?.bp ?? sanitized.bp ?? sanitized.cp, 1);
      const combinedMechanic = [
        sanitized.mechanic || sanitized.gameMechanics || '',
        sanitized.passive_effect ? `Passive: ${sanitized.passive_effect}` : '',
        sanitized.activated_effect ? `Active: ${sanitized.activated_effect}` : ''
      ].filter(Boolean).join('\n\n');

      adapted = {
        ...adapted,
        type: (sanitized.type || sanitized.feature_category || 'general').toLowerCase(),
        tier: parseNumericValue(sanitized.tier, 1),
        description: sanitized.description || '',
        tech_level: sanitized.tech_level !== undefined || sanitized.techLevel !== undefined
          ? parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 0)
          : null,
        meta_level: sanitized.meta_level !== undefined || sanitized.metaLevel !== undefined
          ? parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0)
          : null,
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        prerequisites: ensureArray(sanitized.prerequisites ?? sanitized.prerequisite),
        passive_effect: sanitized.passive_effect || '',
        activated_effect: sanitized.activated_effect || '',
        modifiers: modernModifiers,
        mechanic: combinedMechanic,
        note: sanitized.note || sanitized.notes || '',
        multi: sanitized.multi !== undefined ? Boolean(sanitized.multi) : Boolean(sanitized.isMultipleSelection),
        staged: sanitized.staged !== undefined ? Boolean(sanitized.staged) : Boolean(sanitized.isStaged),
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: apCost, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: apCost, ...sanitized.costs }
          : { bp: apCost, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: apCost },
        tags: ensureArray(sanitized.tags, ['features']),
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
        governing_attribute: (sanitized.governing_attribute || sanitized.governingAttribute || 'intellect').toLowerCase(),
        untrained_allowed: sanitized.untrained_allowed !== undefined ? Boolean(sanitized.untrained_allowed) : (sanitized.untrained !== undefined ? Boolean(sanitized.untrained) : true),
        is_specialization: sanitized.is_specialization !== undefined ? Boolean(sanitized.is_specialization) : Boolean(sanitized.isSpecialization),
        specializations: ensureArray(sanitized.specializations ?? sanitized.specialization),
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
        tags: ensureArray(sanitized.tags, ['skills']),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DISADVANTAGES (Prompt D)
    // ─────────────────────────────────────────────────────────────────────────
    case 'disadvantages': {
      const refund = parseNumericValue(sanitized.cp_refund ?? sanitized.cp ?? sanitized.cpRefunded, 10);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'disadvantage', 'penalty');

      adapted = {
        ...adapted,
        severity: sanitized.severity || 'Minor',
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
        cp_refund: refund,
        penalty_condition: sanitized.penalty_condition || sanitized.mechanic || '',
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: -refund, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: -refund, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        mechanic: sanitized.penalty_condition || sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        tags: ensureArray(sanitized.tags, ['disadvantages']),
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
        alignment: sanitized.alignment || 'Neutral',
        influence_level: parseNumericValue(sanitized.influence_level ?? sanitized.influenceLevel, 3),
        hq_location: sanitized.hq_location ?? sanitized.hqLocation ?? 'Various',
        hostile_factions: ensureArray(sanitized.hostile_factions ?? sanitized.hostileFactions),
        allied_factions: ensureArray(sanitized.allied_factions ?? sanitized.alliedFactions),
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
        tags: ensureArray(sanitized.tags, ['factions']),
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

      const stipend = parseNumericValue(sanitized.credits_stipend ?? sanitized.creditsStipend, 0);

      adapted = {
        ...adapted,
        tier: parseNumericValue(sanitized.tier, 1),
        description: sanitized.description || '',
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        prerequisites: ensureArray(sanitized.prerequisites ?? sanitized.prerequisite),
        trait: ensureArray(sanitized.trait ?? sanitized.traits),
        occupational_traits: ensureArray(sanitized.occupational_traits ?? sanitized.occupationalTraits ?? sanitized.trait ?? sanitized.traits),
        skill_proficiencies: ensureArray(sanitized.skill_proficiencies ?? sanitized.skillProficiencies),
        starting_gear: ensureArray(sanitized.starting_gear ?? sanitized.startingGear),
        credits_stipend: stipend,
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        costs: { bp: 0, credits: stipend, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...(sanitized.costs || {}) },
        modifiers: modernModifiers,
        tags: ensureArray(sanitized.tags, ['occupations']),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INVOCATIONS & SPECIAL ABILITIES (Prompt G)
    // ─────────────────────────────────────────────────────────────────────────
    case 'invocations': {
      const designDc = parseNumericValue(sanitized.design_dc ?? sanitized.designDC ?? sanitized.craft_dc, 18);
      const strainCost = parseNumericValue(sanitized.cost_essence ?? sanitized.strain_cost ?? sanitized.strainFocusCost ?? sanitized.strain, 0);
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
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel ?? sanitized.ml, 2),
        cast_time: sanitized.cast_time || sanitized.castTime || sanitized.action_type || sanitized.actionType || sanitized.actionCost || '1 Action',
        action_type: sanitized.action_type || sanitized.cast_time || 'Standard Action',
        duration: sanitized.duration || 'Instant',
        saving_throw: sanitized.saving_throw || sanitized.savingThrow || sanitized.save || '',
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
        tags: ensureArray(sanitized.tags, ['invocations']),
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
      const essenceCost = parseNumericValue(sanitized.essence_cost ?? sanitized.essenceCost ?? sanitized.strain, 0);
      const powerDrain = parseNumericValue(sanitized.power_drain ?? sanitized.powerDrain, 0);
      const sp = parseNumericValue(sanitized.sp ?? sanitized.structurePoints, 15);
      const dr = parseNumericValue(sanitized.dr ?? sanitized.damageResist, 1);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'augmentation', 'inherent');

      adapted = {
        ...adapted,
        type: sanitized.type || sanitized.augmentation_type || sanitized.augmentationCategory || 'Cybernetics',
        augmentation_type: sanitized.augmentation_type || sanitized.type || 'Cybernetic',
        location: ensureArray(sanitized.location ?? sanitized.body_location, ['Head']),
        body_location: (Array.isArray(sanitized.location) && sanitized.location[0]) || sanitized.body_location || 'Head',
        essence_cost: essenceCost,
        power_drain: powerDrain,
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
          ? { bp: bpCost, credits: 0, nodes: nodeCost, sockets: socketCost, strain: essenceCost, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: bpCost, credits: parseNumericValue(sanitized.cost ?? sanitized.creditCost, 2500), nodes: nodeCost, sockets: socketCost, strain: essenceCost, focus: 0, ap: 0 },
        sockets: sanitized.sockets && typeof sanitized.sockets === 'object'
          ? sanitized.sockets
          : { max: socketCost, used: socketCost, tier: 'Socket', allocated: [] },
        modifiers: modernModifiers,
        tags: ensureArray(sanitized.tags, ['augmentations']),
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
        category: sanitized.category || sanitized.gear_category || sanitized.gearCategory || 'Electronics',
        gear_category: sanitized.gear_category || sanitized.category || 'Electronics',
        size: sanitized.size || sanitized.sizeCategory || 'Small',
        faction_skin: sanitized.faction_skin || sanitized.manufacturer || 'Standard',
        base_dc: parseNumericValue(sanitized.base_dc ?? sanitized.baseDC, 12),
        craft_dc: craftDc,
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        weight,
        charges: parseNumericValue(sanitized.charges ?? sanitized.daily_charges, 0),
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
        daily_charges: parseNumericValue(sanitized.daily_charges ?? sanitized.dailyCharges ?? sanitized.charges, 0),
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
        tags: ensureArray(sanitized.tags, ['gear']),
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
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel ?? sanitized.tl, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel ?? sanitized.ml, 0),
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
        ammo: sanitized.ammo || sanitized.ammunition || sanitized.ammunitionCapacity || '30',
        ammunition: sanitized.ammunition || sanitized.ammo || '30 (Standard Magazine)',
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
        tags: ensureArray(sanitized.tags, ['weaponry']),
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
      const baseDr = parseNumericValue(sanitized.dr ?? sanitized.dr_kinetic, 4);
      const drKinetic = parseNumericValue(sanitized.dr_kinetic ?? sanitized.drKinetic, baseDr);
      const drEnergy = parseNumericValue(sanitized.dr_energy ?? sanitized.drEnergy, baseDr);
      const drEnvironmental = parseNumericValue(sanitized.dr_environmental ?? sanitized.drEnvironmental, 0);
      const encumbrance = parseNumericValue(sanitized.encumbrance_penalty ?? sanitized.mobility_penalty ?? sanitized.mobilityPenalty, 0);

      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'armor', 'inherent');

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        armor_type: sanitized.armor_type || sanitized.category || 'Medium',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel ?? sanitized.tl, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel ?? sanitized.ml, 0),
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
        body_locations: ensureArray(sanitized.body_locations ?? sanitized.bodyLocations ?? sanitized.coverage, ['Torso']),
        coverage: ensureArray(sanitized.coverage, ['Head', 'Torso', 'Arms', 'Legs']),
        dr: baseDr,
        dr_kinetic: drKinetic,
        dr_energy: drEnergy,
        dr_environmental: drEnvironmental,
        encumbrance_penalty: encumbrance,
        power_requirements: sanitized.power_requirements || sanitized.powerRequirements || 'None',
        max_dex: parseNumericValue(sanitized.max_dex ?? sanitized.maxDexBonus, 4),
        mobility_penalty: encumbrance,
        faction_skin: sanitized.faction_skin || sanitized.factionSkin || 'Standard',
        carried_shield: sanitized.carried_shield || sanitized.carriedShield || null,
        category: sanitized.category || 'Mediumweight',
        resistance: ensureArray(sanitized.resistance, ['Kinetic', 'Energy']),
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
        tags: ensureArray(sanitized.tags, ['armoring']),
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
      const sp = parseNumericValue(sanitized.structure_points ?? sanitized.sp ?? sanitized.structurePoints, 150);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'mecha', 'inherent');

      adapted = {
        ...adapted,
        frame_class: sanitized.frame_class || sanitized.frame || 'Medium Striker',
        domain: sanitized.domain || sanitized.operationDomain || 'Ground',
        size: sanitized.size || sanitized.sizeCategory || 'Large',
        frame: sanitized.frame || sanitized.frame_class || 'Humanoid',
        faction_skin: sanitized.faction_skin || sanitized.manufacturer || 'Standard',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        craft_dc: craftDc,
        sp,
        structure_points: sp,
        dr: parseNumericValue(sanitized.dr ?? sanitized.damageResist, 15),
        hardpoints: sanitized.hardpoints || { max: totalMounts, used: 0 },
        power_core: sanitized.power_core || sanitized.powerCore || 'Standard Fusion Core',
        speed_tactical: parseNumericValue(sanitized.speed_tactical ?? sanitized.speedTactical ?? sanitized.speed, 6),
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
        tags: ensureArray(sanitized.tags, ['mecha']),
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
        tags: ensureArray(sanitized.tags, ['architecture']),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ORIGINS (Prompt O)
    // ─────────────────────────────────────────────────────────────────────────
    case 'origins': {
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'origin', 'inherent');

      adapted = {
        ...adapted,
        origin_type: sanitized.origin_type || sanitized.type || 'Planetary',
        description: sanitized.description || '',
        origin_traits: ensureArray(sanitized.origin_traits ?? sanitized.traits ?? sanitized.trait),
        native_languages: ensureArray(sanitized.native_languages ?? sanitized.languages ?? sanitized.language),
        environmental_adaptation: sanitized.environmental_adaptation || sanitized.adaptation || 'Standard',
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 0, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: 0, credits: parseNumericValue(sanitized.stipend ?? sanitized.credits, 0), nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        modifiers: modernModifiers,
        tags: ensureArray(sanitized.tags, ['origins']),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ARCHETYPES (Prompt P)
    // ─────────────────────────────────────────────────────────────────────────
    case 'archetypes': {
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'archetype', 'inherent');

      adapted = {
        ...adapted,
        role: sanitized.role || 'Combat',
        sphere: sanitized.sphere || 'Sentinels',
        description: sanitized.description || '',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        primary_attributes: ensureArray(sanitized.primary_attributes ?? sanitized.primaryAttributes),
        suggested_skills: ensureArray(sanitized.suggested_skills ?? sanitized.suggestedSkills),
        essential_skills: ensureArray(sanitized.essential_skills ?? sanitized.essentialSkills ?? sanitized.suggested_skills),
        suggested_traits: ensureArray(sanitized.suggested_traits ?? sanitized.suggestedTraits),
        suggested_features: ensureArray(sanitized.suggested_features ?? sanitized.suggestedFeatures),
        starting_gear: ensureArray(sanitized.starting_gear ?? sanitized.startingGear),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 0, credits: 1000, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: 0, credits: 1000, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        modifiers: modernModifiers,
        tags: ensureArray(sanitized.tags, ['archetypes']),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRAITS (Prompt Q)
    // ─────────────────────────────────────────────────────────────────────────
    case 'traits': {
      const cpCost = parseNumericValue(sanitized.cost_cp ?? sanitized.costCp ?? sanitized.cp ?? sanitized.costs?.bp, 5);
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'trait', 'inherent');

      adapted = {
        ...adapted,
        trait_type: sanitized.trait_type || sanitized.type || 'General Trait',
        cost_cp: cpCost,
        origin_association: sanitized.origin_association || sanitized.origin || null,
        occupation_association: sanitized.occupation_association || sanitized.occupation || null,
        species_association: sanitized.species_association || sanitized.species || null,
        description: sanitized.description || '',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 0),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 0),
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: cpCost, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: cpCost, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        modifiers: modernModifiers,
        tags: ensureArray(sanitized.tags, ['traits']),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DISCIPLINES (Prompt R)
    // ─────────────────────────────────────────────────────────────────────────
    case 'disciplines': {
      const modernModifiers = Array.isArray(sanitized.modifiers) && sanitized.modifiers.length > 0 && typeof sanitized.modifiers[0] === 'object'
        ? sanitized.modifiers
        : parseModifiersString(sanitized.modifiers, 'discipline', 'inherent');

      adapted = {
        ...adapted,
        governing_attribute: (sanitized.governing_attribute || sanitized.governingAttribute || 'metaphysics').toLowerCase(),
        description: sanitized.description || '',
        tech_level: parseNumericValue(sanitized.tech_level ?? sanitized.techLevel, 0),
        meta_level: parseNumericValue(sanitized.meta_level ?? sanitized.metaLevel, 1),
        prerequisite: ensureArray(sanitized.prerequisite ?? sanitized.prerequisites),
        tier_progression: Array.isArray(sanitized.tier_progression) ? sanitized.tier_progression : [],
        mechanic: sanitized.mechanic || sanitized.gameMechanics || '',
        note: sanitized.note || sanitized.notes || '',
        costs: sanitized.costs && typeof sanitized.costs === 'object'
          ? { bp: 10, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...sanitized.costs }
          : { bp: 10, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        modifiers: modernModifiers,
        tags: ensureArray(sanitized.tags, ['disciplines']),
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
        tags: ensureArray(sanitized.tags, ['other']),
        rawSparkData: sanitized
      };
      break;
    }
  }

  // Final pass through the universal normalizer to guarantee costs map, modifiers list, sockets, and critical details
  return normalizeOmnicortexItem(adapted);
}
