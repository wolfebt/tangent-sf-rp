/**
 * ════════════════════════════════════════════════════════════════════════════════
 * CODEX INGESTION ADAPTERS — TANGENT SF RP / OMNICORTEX
 * Bidirectional normalization between raw Spark / LLM JSON payloads (Prompts A-N)
 * and canonical Omnicortex Firestore database collections.
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
      const bpCost = parseNumericValue(sanitized.prerequisites, 0);
      const combinedLore = [
        sanitized.fullLore || '',
        sanitized.profileAndVisualSemiotics ? `### Visual Semiotics & Aesthetics\n${sanitized.profileAndVisualSemiotics}` : '',
        sanitized.disciplinesAndSpecialAbilities ? `### Disciplines & Special Abilities\n${sanitized.disciplinesAndSpecialAbilities}` : ''
      ].filter(Boolean).join('\n\n');

      adapted = {
        ...adapted,
        title: sanitized.formalTitle || sanitized.name,
        parent_species: sanitized.parentLineage || 'Independent',
        description: sanitized.summary || '',
        stigma: sanitized.socialStigma || 'None',
        homeworld: sanitized.homeworld || 'Various',
        tech_level: parseNumericValue(sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        type: sanitized.type ? [sanitized.type] : [],
        size: sanitized.size ? [sanitized.size] : ['Medium (5 to 6ft)'],
        movement: sanitized.movement ? [sanitized.movement] : ['30ft Groundspeed'],
        trait: sanitized.traits ? sanitized.traits.split(/[,;\n]+/).map(t => t.trim()).filter(Boolean) : [],
        body: combinedLore,
        costs: { bp: bpCost, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        modifiers: [
          ...parseModifiersString(sanitized.attributeModifiers, 'attribute', 'inherent'),
          ...parseModifiersString(sanitized.skillModifiers, 'skill', 'inherent'),
          ...parseModifiersString(sanitized.bonusFeatures, 'feature', 'inherent'),
          ...parseModifiersString(sanitized.recommendedFeatures, 'feature', 'recommended')
        ],
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FEATURES (Prompt B)
    // ─────────────────────────────────────────────────────────────────────────
    case 'features': {
      adapted = {
        ...adapted,
        type: (sanitized.type || 'general').toLowerCase(),
        description: sanitized.description || '',
        tech_level: sanitized.techLevel ? parseNumericValue(sanitized.techLevel, 0) : null,
        meta_level: sanitized.metaLevel ? parseNumericValue(sanitized.metaLevel, 0) : null,
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        modifiers_text: sanitized.modifiers || '',
        modifiers: parseModifiersString(sanitized.modifiers, 'feature', 'inherent'),
        mechanic: sanitized.gameMechanics || '',
        note: sanitized.notes || '',
        multi: Boolean(sanitized.isMultipleSelection),
        staged: Boolean(sanitized.isStaged),
        costs: { bp: 1, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
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
        is_specialization: Boolean(sanitized.isSpecialization),
        description: sanitized.description || '',
        tech_level: sanitized.techLevel ? parseNumericValue(sanitized.techLevel, 0) : null,
        meta_level: sanitized.metaLevel ? parseNumericValue(sanitized.metaLevel, 0) : null,
        mechanic: sanitized.gameMechanics || '',
        note: sanitized.notes || '',
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DISADVANTAGES (Prompt D)
    // ─────────────────────────────────────────────────────────────────────────
    case 'disadvantages': {
      const refund = parseNumericValue(sanitized.cpRefunded, 10);
      adapted = {
        ...adapted,
        description: sanitized.description || '',
        tech_level: sanitized.techLevel ? parseNumericValue(sanitized.techLevel, 0) : null,
        meta_level: sanitized.metaLevel ? parseNumericValue(sanitized.metaLevel, 0) : null,
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        modifiers: parseModifiersString(sanitized.modifiers, 'disadvantage', 'penalty'),
        cp: refund,
        costs: { bp: -refund, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        mechanic: sanitized.gameMechanics || '',
        note: sanitized.notes || '',
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FACTIONS (Prompt E)
    // ─────────────────────────────────────────────────────────────────────────
    case 'factions': {
      adapted = {
        ...adapted,
        description: sanitized.description || '',
        society: sanitized.society || 'Standard Planetary Society',
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        archetype: sanitized.socialArchetype || 'Militaristic',
        tech_level: parseNumericValue(sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        wealth_modifier: parseNumericValue(sanitized.wealthModifiers, 0),
        colloquialisms: sanitized.colloquialisms || '',
        symbol_sigil: sanitized.symbolSigil || '',
        driving_mandate: sanitized.drivingMandate || '',
        motto: sanitized.motto || '',
        core_beliefs: sanitized.coreBeliefs || '',
        social_structure: sanitized.socialStructure || '',
        outsider_view: sanitized.viewOfOutsiders || '',
        law_order: sanitized.lawAndOrder || '',
        government_type: sanitized.governmentType || '',
        leadership: sanitized.leadership || '',
        succession: sanitized.succession || '',
        primary_exports: sanitized.primaryExports || '',
        economic_model: sanitized.economicModel || '',
        military_doctrine: sanitized.militaryDoctrine || '',
        key_units: sanitized.keyUnits || '',
        naval_assets: sanitized.navalAssets || '',
        design_language: sanitized.designLanguage || '',
        architecture: sanitized.architecture || '',
        gear_aesthetic: sanitized.gearAesthetic || '',
        lighting_mood: sanitized.lightingMood || '',
        image_prompt: sanitized.imagePrompt || '',
        mechanic: sanitized.gameMechanicsAndNotes || '',
        attitude: sanitized.attitude || '',
        goals: sanitized.goals || '',
        social_strengths: sanitized.socialStrengths || '',
        social_weaknesses: sanitized.socialWeaknesses || '',
        modifiers: [
          ...parseModifiersString(sanitized.attributeModifiers, 'attribute', 'inherent'),
          ...parseModifiersString(sanitized.skillModifiers, 'skill', 'inherent'),
          ...parseModifiersString(sanitized.featureModifiers, 'feature', 'inherent'),
          ...parseModifiersString(sanitized.modifiers, 'faction', 'inherent')
        ],
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OCCUPATIONS (Prompt F)
    // ─────────────────────────────────────────────────────────────────────────
    case 'occupations': {
      adapted = {
        ...adapted,
        description: sanitized.description || '',
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        trait: sanitized.trait ? [sanitized.trait] : [],
        tech_level: parseNumericValue(sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        mechanic: sanitized.gameMechanics || '',
        note: sanitized.notes || '',
        modifiers: [
          ...parseModifiersString(sanitized.attributeModifiers, 'attribute', 'inherent'),
          ...parseModifiersString(sanitized.skillModifiers, 'skill', 'inherent'),
          ...parseModifiersString(sanitized.featureModifiers, 'feature', 'inherent'),
          ...parseModifiersString(sanitized.modifiers, 'occupation', 'inherent')
        ],
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INVOCATIONS & SPECIAL ABILITIES (Prompt G)
    // ─────────────────────────────────────────────────────────────────────────
    case 'invocations': {
      const designDc = parseNumericValue(sanitized.designDC, 15);
      const strainCost = parseNumericValue(sanitized.strainFocusCost, 0);
      adapted = {
        ...adapted,
        description: sanitized.description || '',
        discipline: sanitized.discipline || 'telekinesis',
        meta_skill: sanitized.metaSkill || 'Metaphysics',
        area: sanitized.area ? [sanitized.area] : ['SingleTarget'],
        effect: sanitized.effect ? [sanitized.effect] : ['Standard Manifestation'],
        range: sanitized.range ? [sanitized.range] : ['Medium (30ft)'],
        target: sanitized.target ? [sanitized.target] : ['Single Target'],
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        design_dc: designDc,
        craft_dc: designDc,
        mechanic: sanitized.gameMechanics || '',
        tech_level: parseNumericValue(sanitized.techLevel, 0),
        meta_level: parseNumericValue(sanitized.metaLevel, 2),
        cast_time: sanitized.castTime || sanitized.actionCost || 'Standard Action',
        duration: sanitized.duration || 'Instant',
        note: sanitized.notes || '',
        critical_details: {
          score: '20',
          effect: [],
          success_effect: sanitized.criticalSuccessEffect ? [sanitized.criticalSuccessEffect] : [],
          failure_effect: sanitized.criticalFailureEffect ? [sanitized.criticalFailureEffect] : []
        },
        costs: { bp: 0, credits: 0, nodes: 0, sockets: 0, strain: strainCost, focus: strainCost, ap: 2 },
        modifiers: parseModifiersString(sanitized.modifiers, 'invocation', 'inherent'),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUGMENTATIONS (Prompt H)
    // ─────────────────────────────────────────────────────────────────────────
    case 'augmentations': {
      const craftDc = parseNumericValue(sanitized.craftingDC, 20);
      const nodeCost = parseNumericValue(sanitized.nodeCost, 10);
      const socketCost = parseNumericValue(sanitized.socketCost, 1);
      const bpCost = parseNumericValue(sanitized.bpCost, 2);
      const sp = parseNumericValue(sanitized.structurePoints, 10);
      const dr = parseNumericValue(sanitized.damageResist, 0);

      adapted = {
        ...adapted,
        type: sanitized.augmentationCategory || 'Cybernetics',
        location: sanitized.location ? [sanitized.location] : ['Head'],
        description: sanitized.description || '',
        tech_level: parseNumericValue(sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        design_dc: craftDc,
        craft_dc: craftDc,
        sp,
        dr,
        stigma: sanitized.stigma || 'Minor',
        classification: sanitized.classification ? [sanitized.classification] : [],
        creator: sanitized.creator ? [sanitized.creator] : [],
        design: sanitized.design ? [sanitized.design] : [],
        component: sanitized.component ? [sanitized.component] : [],
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        mechanic: sanitized.gameMechanics || '',
        note: sanitized.notes || '',
        critical_details: {
          score: '20',
          effect: [],
          success_effect: sanitized.criticalSuccessEffect ? [sanitized.criticalSuccessEffect] : [],
          failure_effect: sanitized.criticalFailureEffect ? [sanitized.criticalFailureEffect] : []
        },
        costs: { bp: bpCost, credits: 0, nodes: nodeCost, sockets: socketCost, strain: 0, focus: 0, ap: 0 },
        modifiers: parseModifiersString(sanitized.modifiers, 'augmentation', 'inherent'),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GEAR (Prompt I)
    // ─────────────────────────────────────────────────────────────────────────
    case 'gear': {
      const craftDc = parseNumericValue(sanitized.craftingDC, 15);
      const creditCost = parseNumericValue(sanitized.creditCost, 150);
      const weight = parseNumericValue(sanitized.weight, 1.0);
      const totalSockets = parseNumericValue(sanitized.totalSockets, 2);

      adapted = {
        ...adapted,
        category: sanitized.gearCategory || 'Electronics',
        size: sanitized.sizeCategory || 'Small',
        faction_skin: sanitized.manufacturer || 'Standard',
        base_dc: parseNumericValue(sanitized.baseDC, 15),
        craft_dc: craftDc,
        tech_level: parseNumericValue(sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        weight,
        sp: parseNumericValue(sanitized.structurePoints, 10),
        dr: parseNumericValue(sanitized.damageResist, 0),
        workspace_scale: sanitized.workspaceScale || 'Belt',
        computer_pr: parseNumericValue(sanitized.processorRating, 1),
        software_level: parseNumericValue(sanitized.softwareLevel, 0),
        epr_rating: parseNumericValue(sanitized.eprRating, 0),
        supply_die: sanitized.supplyDie || 'None',
        enhancement_type: sanitized.metaTechType || 'Passive',
        invocation_rank: parseNumericValue(sanitized.invocationRank, 0),
        scale_tier: sanitized.scaleTier || 'Personal',
        daily_charges: parseNumericValue(sanitized.dailyCharges, 0),
        description: sanitized.description || '',
        availability: sanitized.availability || 'Common',
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        mechanic: sanitized.gameMechanics || '',
        note: sanitized.notes || '',
        costs: { bp: 0, credits: creditCost, nodes: 0, sockets: totalSockets, strain: 0, focus: 0, ap: 0 },
        sockets: { max: totalSockets, used: parseNumericValue(sanitized.socketsUsed, 1), tier: 'Socket', allocated: [] },
        modifiers: parseModifiersString(sanitized.modifiers || sanitized.passiveEnhancements, 'gear', 'inherent'),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WEAPONRY (Prompt J)
    // ─────────────────────────────────────────────────────────────────────────
    case 'weaponry': {
      const craftDc = parseNumericValue(sanitized.designDC, 18);
      const cost = parseNumericValue(sanitized.cost, 500);
      const socketsCount = parseNumericValue(sanitized.sockets || sanitized.componentSlots, 3);

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        tech_level: parseNumericValue(sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        availability: sanitized.availability || 'Common',
        design_dc: craftDc,
        craft_dc: craftDc,
        size: sanitized.size ? [sanitized.size] : ['Medium'],
        weight: parseNumericValue(sanitized.weight, 3),
        quality: sanitized.quality || 'Standard',
        durability: parseNumericValue(sanitized.durability, 30),
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        skill: sanitized.skill || 'Firearms',
        special: sanitized.special ? [sanitized.special] : [],
        area: sanitized.area ? [sanitized.area] : [],
        effect: sanitized.effect ? [sanitized.effect] : [],
        range: sanitized.range || '50/100/300',
        target: sanitized.target ? [sanitized.target] : ['Single Target'],
        origin: sanitized.origin ? [sanitized.origin] : [],
        creator: sanitized.creator ? [sanitized.creator] : [],
        classification: sanitized.classification || 'Ranged (Ballistic)',
        damage: sanitized.damage || '2d6',
        damage_type: sanitized.damageType || 'Kinetic',
        ap: parseNumericValue(sanitized.penetration, 0),
        ammunition: sanitized.ammunitionCapacity || '30 (Cell)',
        power_source: sanitized.powerSource || 'Standard Cell',
        faction_skin: sanitized.factionSkin || 'Standard',
        design: sanitized.design ? [sanitized.design] : [],
        accuracy: parseNumericValue(sanitized.accuracy, 0),
        modes: sanitized.modes ? [sanitized.modes] : ['Single'],
        attack_rate: sanitized.rateOfFire || '1',
        wielding: sanitized.wielding || 'Two-Handed',
        component: sanitized.components ? [sanitized.components] : [],
        mechanic: sanitized.gameMechanics || '',
        note: sanitized.notes || '',
        critical_details: {
          score: sanitized.criticalScore || '20',
          effect: sanitized.criticalEffect ? [sanitized.criticalEffect] : [],
          success_effect: sanitized.criticalSuccessEffect ? [sanitized.criticalSuccessEffect] : [],
          failure_effect: sanitized.criticalFailureEffect ? [sanitized.criticalFailureEffect] : []
        },
        costs: { bp: 0, credits: cost, nodes: 0, sockets: socketsCount, strain: 0, focus: 0, ap: 0 },
        sockets: { max: socketsCount, used: 0, tier: 'Socket', allocated: [] },
        modifiers: parseModifiersString(sanitized.modifiers, 'weapon', 'inherent'),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ARMORING (Prompt K)
    // ─────────────────────────────────────────────────────────────────────────
    case 'armoring': {
      const craftDc = parseNumericValue(sanitized.designDC, 15);
      const cost = parseNumericValue(sanitized.cost, 1000);
      const componentSlots = parseNumericValue(sanitized.componentSlots, 4);

      adapted = {
        ...adapted,
        description: sanitized.description || '',
        tech_level: parseNumericValue(sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        availability: sanitized.availability || 'Common',
        design_dc: craftDc,
        craft_dc: craftDc,
        size: sanitized.size ? [sanitized.size] : ['Medium'],
        weight: parseNumericValue(sanitized.weight, 10),
        quality: sanitized.quality || 'Standard',
        durability: parseNumericValue(sanitized.durability, 30),
        prerequisite: sanitized.prerequisite ? [sanitized.prerequisite] : [],
        skill: sanitized.skill || 'Light Armor',
        origin: sanitized.origin ? [sanitized.origin] : [],
        creator: sanitized.creator ? [sanitized.creator] : [],
        design: sanitized.design ? [sanitized.design] : [],
        classification: sanitized.classification ? [sanitized.classification] : ['Mediumweight'],
        material: sanitized.material ? [sanitized.material] : ['Plasteel'],
        body_locations: sanitized.bodyLocations ? [sanitized.bodyLocations] : ['Full Body'],
        coverage: sanitized.coverage || 'Standard',
        max_dex: parseNumericValue(sanitized.maxDexBonus, 2),
        mobility_penalty: parseNumericValue(sanitized.mobilityPenalty, 0),
        faction_skin: sanitized.factionSkin || 'Standard',
        carried_shield: sanitized.carriedShield || 'None',
        category: sanitized.category || 'Mediumweight',
        resistance: sanitized.resistance ? [sanitized.resistance] : [],
        modes: sanitized.modes ? [sanitized.modes] : [],
        mechanic: sanitized.gameMechanics || '',
        note: sanitized.notes || '',
        critical_details: {
          score: '20',
          effect: [],
          success_effect: sanitized.criticalSuccessEffect ? [sanitized.criticalSuccessEffect] : [],
          failure_effect: sanitized.criticalFailureEffect ? [sanitized.criticalFailureEffect] : []
        },
        costs: { bp: 0, credits: cost, nodes: 0, sockets: componentSlots, strain: 0, focus: 0, ap: 0 },
        sockets: { max: componentSlots, used: 0, tier: 'Socket', allocated: [] },
        modifiers: parseModifiersString(sanitized.modifiers, 'armor', 'inherent'),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MECHA (Prompt L)
    // ─────────────────────────────────────────────────────────────────────────
    case 'mecha': {
      const craftDc = parseNumericValue(sanitized.craftingDC, 30);
      const cost = parseNumericValue(sanitized.creditCost, 40000);
      const totalMounts = parseNumericValue(sanitized.totalMounts, 4);

      adapted = {
        ...adapted,
        domain: sanitized.operationDomain || 'Military Ground',
        size: sanitized.sizeCategory || 'Medium',
        frame: sanitized.bodyType || 'Humanoid',
        faction_skin: sanitized.manufacturer || 'Standard',
        tech_level: parseNumericValue(sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        craft_dc: craftDc,
        sp: parseNumericValue(sanitized.structurePoints, 100),
        dr: parseNumericValue(sanitized.damageResist, 10),
        propulsion: sanitized.primaryPropulsion || 'Bipedal Walker',
        armor_plating: sanitized.armorPlating ? [sanitized.armorPlating] : [],
        vft_mode: sanitized.variableForm || 'None',
        pilot_agility: parseNumericValue(sanitized.pilotMod, 0),
        handling: parseNumericValue(sanitized.handlingMod, 0),
        description: sanitized.description || '',
        availability: sanitized.availability || 'Military',
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        mechanic: sanitized.installedModules || '',
        note: sanitized.notes || '',
        costs: { bp: 0, credits: cost, nodes: 0, sockets: totalMounts, strain: 0, focus: 0, ap: 0 },
        sockets: { max: totalMounts, used: 0, tier: 'Hardpoint', allocated: [] },
        modifiers: parseModifiersString(sanitized.modifiers, 'mecha', 'inherent'),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ARCHITECTURE (Prompt M)
    // ─────────────────────────────────────────────────────────────────────────
    case 'architecture': {
      const craftDc = parseNumericValue(sanitized.craftingDC, 25);
      const cost = parseNumericValue(sanitized.creditCost, 500000);
      const totalModules = parseNumericValue(sanitized.totalModules, 16);

      adapted = {
        ...adapted,
        style: sanitized.architecturalStyle || 'Cyber-Industrial',
        footprint: sanitized.footprintSize || 'Large',
        height_class: sanitized.heightClass || 'Mid-Rise',
        stories: parseNumericValue(sanitized.stories, 5),
        frame: sanitized.frameConfiguration || 'Standard',
        environment: sanitized.environmentalModifiers || 'Standard',
        propulsion: sanitized.mobilityPropulsion || 'None (Static)',
        tech_level: parseNumericValue(sanitized.techLevel, 3),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        sp: parseNumericValue(sanitized.structurePoints, 1000),
        dr: parseNumericValue(sanitized.damageResist, 20),
        design_dc: craftDc,
        craft_dc: craftDc,
        security_level: sanitized.securityLevel || 'High Security',
        primary_purpose: sanitized.primaryPurpose || 'Operational Outpost',
        description: sanitized.description || '',
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        mechanic: sanitized.gameMechanics || '',
        note: [
          sanitized.notes || '',
          sanitized.installedFacilities ? `Facilities: ${sanitized.installedFacilities}` : '',
          sanitized.installedHardpoints ? `Hardpoints: ${sanitized.installedHardpoints}` : '',
          sanitized.coreInternals ? `Core: ${sanitized.coreInternals}` : ''
        ].filter(Boolean).join('\n\n'),
        costs: { bp: 0, credits: cost, nodes: 0, sockets: totalModules, strain: 0, focus: 0, ap: 0 },
        sockets: { max: totalModules, used: 0, tier: 'Module', allocated: [] },
        modifiers: parseModifiersString(sanitized.modifiers, 'architecture', 'inherent'),
        rawSparkData: sanitized
      };
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OTHER (Prompt N)
    // ─────────────────────────────────────────────────────────────────────────
    case 'other':
    default: {
      const cost = parseNumericValue(sanitized.cost, 50);
      adapted = {
        ...adapted,
        description: sanitized.description || '',
        weight: parseNumericValue(sanitized.weight, 1.0),
        tech_level: parseNumericValue(sanitized.techLevel, 2),
        meta_level: parseNumericValue(sanitized.metaLevel, 0),
        availability: sanitized.availability || 'Common',
        prerequisite: sanitized.prerequisites ? [sanitized.prerequisites] : [],
        mechanic: sanitized.gameMechanics || '',
        note: sanitized.notes || '',
        costs: { bp: 0, credits: cost, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
        modifiers: parseModifiersString(sanitized.modifiers, 'other', 'inherent'),
        rawSparkData: sanitized
      };
      break;
    }
  }

  // Final pass through the universal normalizer to guarantee costs map, modifiers list, sockets, and critical details
  return normalizeOmnicortexItem(adapted);
}
