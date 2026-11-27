/**
 * @file adeToCortexConsolidator.js
 * @description Consolidates ADE-authored elements back into canonical OmniCortex collection payloads.
 */

import {
  normalizeElementType,
  inferPropertySubcategory,
  inferMetaphysicsSubcategory
} from '../../pages/Foundry/ElementForge/elementSchemas.js';
import {
  convertPersonaElementToFolio,
  convertMcmToFolioPersona,
  convertFolioToMcmRecord
} from '../personaBridge.js';
import {
  CORTEX_PROPERTY_COLLECTIONS,
  CORTEX_METAPHYSICS_COLLECTIONS,
  preferField,
  parseNumericLevel,
  parseOptionalFiniteNumber
} from './cortexCollectionMaps.js';

/**
 * Resolves the canonical OmniCortex collection key for an ADE element if it belongs to Cortex.
 * Returns null for purely campaign-scoped narrative structures (Story Arc, Adventure, Encounter, Clue, Handout, Map, Custom)
 * or Folio-backed Personas.
 */
export function resolveTargetCortexCollection(element) {
  if (!element || typeof element !== 'object' || element.isScenarioNode) return null;
  const canonicalType = normalizeElementType(element.type || '');
  const fields = element.fields || {};

  if (canonicalType === 'Persona') {
    if (element.isFolioPersona || element.sourceOrigin === 'folio' || element.personaSubcategory === 'folio') {
      return null;
    }
    const personaTrack = fields.personaSubcategory || element.personaSubcategory;
    if (personaTrack === 'story' && element.dbmCategory !== 'modular_characters' && !element.dbmId) {
      return null;
    }
    if (
      element.dbmCategory === 'modular_characters' ||
      element.sourceOrigin === 'mcm' ||
      personaTrack === 'mcm' ||
      fields.mcmTier !== undefined ||
      fields.mcmRole !== undefined
    ) {
      return 'modular_characters';
    }
    return null;
  }

  if (canonicalType === 'Species') return 'species';
  if (canonicalType === 'Faction') return 'factions';
  if (canonicalType === 'Property') return inferPropertySubcategory(element);
  if (canonicalType === 'Metaphysics') return inferMetaphysicsSubcategory(element);
  if (canonicalType === 'World') {
    return element.dbmCategory === 'planetary_design' || fields.starClass ? 'planetary_design' : 'world';
  }
  if (canonicalType === 'Universe') return 'universe';
  if (canonicalType === 'Setting') return 'setting';
  if (canonicalType === 'Scene') return 'scene';
  if (canonicalType === 'Philosophy') return 'philosophy';

  return null;
}

/**
 * Consolidates an ADE element (including all AIME 3-Tier, Lorebook, and tactical fields)
 * into a lossless OmniCortex entry payload ready for `DBMContext.saveEntry(payload, targetCollection)`.
 */
export function consolidateAdeElementToCortexPayload(element, options = {}) {
  if (!element || typeof element !== 'object') return null;

  const targetCollection = options.targetCollection || resolveTargetCortexCollection(element);
  if (!targetCollection) return null;

  const fields = element.fields || {};
  const rawBase = element.cortexRaw && typeof element.cortexRaw === 'object' ? element.cortexRaw : {};
  const cleanTitle = String(
    element.title ||
    element.name ||
    fields.name ||
    fields.speciesName ||
    fields.worldName ||
    fields.settingName ||
    fields.philosophyName ||
    fields.sceneName ||
    rawBase.name ||
    'Untitled Asset'
  ).trim();

  const resolvedId = String(
    element.dbmId ||
    fields.dbmId ||
    rawBase.id ||
    (String(element.id || '').startsWith(`cortex_${targetCollection}_`)
      ? String(element.id).slice(`cortex_${targetCollection}_`.length)
      : '') ||
    element.id ||
    `cortex_${Date.now()}`
  ).trim();

  const resolvedScanPriority = parseNumericLevel(
    fields.loreScanPriority ?? fields.injectionPriority ?? rawBase.loreScanPriority ?? rawBase.injectionPriority,
    50
  );
  const resolvedRequireCond =
    fields.loreRequireCondition ?? fields.conditionExpression ?? rawBase.loreRequireCondition ?? rawBase.conditionExpression ?? '';

  const commonConsolidated = {
    ...rawBase,
    id: resolvedId,
    name: cleanTitle,
    title: cleanTitle,
    ...(element.isPublic !== undefined ? { isPublic: Boolean(element.isPublic) } : {}),
    content: element.content ?? rawBase.content ?? '',
    customFields: Array.isArray(element.customFields) ? element.customFields : (rawBase.customFields || []),
    imageUrl: element.imageUrl !== undefined ? element.imageUrl : (rawBase.imageUrl || ''),
    guidance: element.guidance || fields.guidance || rawBase.guidance || undefined,
    assetHub: Array.isArray(element.assetHub) ? element.assetHub : (rawBase.assetHub || []),
    oneLinePitch: preferField(fields.oneLinePitch, rawBase.oneLinePitch, ''),
    primaryTriggers: preferField(fields.primaryTriggers, rawBase.primaryTriggers, ''),
    secondaryTriggers: preferField(fields.secondaryTriggers, rawBase.secondaryTriggers, ''),
    triggerRegex: preferField(fields.triggerRegex, rawBase.triggerRegex, ''),
    loreSnippet: preferField(fields.loreSnippet, rawBase.loreSnippet, ''),
    injectionPriority: resolvedScanPriority,
    loreScanPriority: resolvedScanPriority,
    conditionExpression: resolvedRequireCond,
    loreRequireCondition: resolvedRequireCond,
    triggerLogic: fields.triggerLogic ?? rawBase.triggerLogic ?? undefined,
    speakerFilter: fields.speakerFilter ?? rawBase.speakerFilter ?? undefined,
    loreBudgetTokens: parseOptionalFiniteNumber(fields.loreBudgetTokens ?? rawBase.loreBudgetTokens),
    loreSuppressCondition: preferField(fields.loreSuppressCondition, rawBase.loreSuppressCondition, undefined),
    loreAutoInject: fields.loreAutoInject ?? rawBase.loreAutoInject ?? undefined,
    loreAlwaysActive: fields.loreAlwaysActive ?? rawBase.loreAlwaysActive ?? undefined,
    loreCaseSensitive: fields.loreCaseSensitive ?? rawBase.loreCaseSensitive ?? undefined,
    ...((fields.pairedMapId ?? rawBase.pairedMapId) !== undefined && (fields.pairedMapId ?? rawBase.pairedMapId) !== '' ? { pairedMapId: fields.pairedMapId ?? rawBase.pairedMapId } : {}),
    ...((fields.weatherPreset ?? rawBase.weatherPreset) !== undefined && (fields.weatherPreset ?? rawBase.weatherPreset) !== '' ? { weatherPreset: fields.weatherPreset ?? rawBase.weatherPreset } : {}),
    ...((fields.hazardCr ?? rawBase.hazardCr) !== undefined && (fields.hazardCr ?? rawBase.hazardCr) !== '' ? { hazardCr: fields.hazardCr ?? rawBase.hazardCr } : {}),
    ...((fields.clockGoal ?? rawBase.clockGoal) !== undefined && (fields.clockGoal ?? rawBase.clockGoal) !== '' ? { clockGoal: fields.clockGoal ?? rawBase.clockGoal } : {}),
    ...((fields.disposition ?? rawBase.disposition) !== undefined && (fields.disposition ?? rawBase.disposition) !== '' ? { disposition: fields.disposition ?? rawBase.disposition } : {}),
    ...((fields.factionStanding ?? rawBase.factionStanding) !== undefined && (fields.factionStanding ?? rawBase.factionStanding) !== '' ? { factionStanding: fields.factionStanding ?? rawBase.factionStanding } : {}),
    ...((fields.sensoryTag ?? rawBase.sensoryTag) !== undefined && (fields.sensoryTag ?? rawBase.sensoryTag) !== '' ? { sensoryTag: fields.sensoryTag ?? rawBase.sensoryTag } : {}),
    ...((fields.threatLevel ?? rawBase.threatLevel) !== undefined && (fields.threatLevel ?? rawBase.threatLevel) !== '' ? { threatLevel: fields.threatLevel ?? rawBase.threatLevel } : {}),
    ...(fields.costCr ?? rawBase.costCr ? { costCr: parseOptionalFiniteNumber(fields.costCr ?? rawBase.costCr) } : {}),
    ...(fields.creditValue ?? rawBase.creditValue ? { creditValue: parseOptionalFiniteNumber(fields.creditValue ?? rawBase.creditValue) } : {}),
    keywords: preferField(fields.keywords, rawBase.keywords, ''),
    negative_keywords: preferField(fields.negative_keywords, rawBase.negative_keywords, ''),
    updatedAt: new Date().toISOString()
  };
  for (const k of ['pairedMapId', 'weatherPreset', 'hazardCr', 'clockGoal', 'disposition', 'factionStanding', 'sensoryTag', 'threatLevel']) {
    if (fields[k] === '') delete commonConsolidated[k];
  }

  if (targetCollection === 'species') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        parent_species: preferField(fields.parent_species, rawBase.parent_species, 'Independent'),
        type: preferField(fields.classification, rawBase.type ?? rawBase.species_type, 'Humanoid'),
        species_type: preferField(fields.classification, rawBase.species_type ?? rawBase.type, 'Humanoid'),
        movement: preferField(fields.movement, rawBase.movement, ''),
        stigma: preferField(fields.oneLinePitch, preferField(fields.stigma, rawBase.stigma, ''), ''),
        homeworld: preferField(fields.habitatOrigin, preferField(fields.homeworld, rawBase.homeworld, ''), ''),
        description: preferField(fields.physicalDescription, preferField(fields.description, rawBase.description, ''), ''),
        physiologyBiology: preferField(fields.physicalDescription, preferField(fields.physiologyBiology, rawBase.physiologyBiology, ''), ''),
        cultureSociety: preferField(fields.behaviorDiet, preferField(fields.cultureSociety, rawBase.cultureSociety, ''), ''),
        roleInSetting: preferField(fields.roleInWorld, preferField(fields.roleInSetting, rawBase.roleInSetting, ''), ''),
        mechanic: preferField(fields.abilitiesPowers, preferField(fields.mechanic, rawBase.mechanic, ''), ''),
        size: preferField(fields.size, rawBase.size, 'Medium'),
        cp: parseNumericLevel(fields.cp ?? rawBase.cp, 0),
        tech_level: parseNumericLevel(fields.techLevel ?? fields['tech-level'] ?? fields.tech_level ?? rawBase.tech_level, 3),
        meta_level: parseNumericLevel(fields.metaLevel ?? fields['meta-level'] ?? fields.meta_level ?? rawBase.meta_level, 0)
      }
    };
  }

  if (targetCollection === 'factions') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        faction_type: preferField(fields.faction_type, rawBase.faction_type, 'Major Polity'),
        archetype: preferField(fields.archetype, rawBase.archetype, ''),
        driving_mandate: preferField(fields.oneLinePitch, preferField(fields.driving_mandate, rawBase.driving_mandate, ''), ''),
        motto: preferField(fields.motto, rawBase.motto, ''),
        description: preferField(fields.description, rawBase.description, ''),
        core_beliefs: preferField(fields.ideology, preferField(fields.core_beliefs, rawBase.core_beliefs, ''), ''),
        publicAgenda: preferField(fields.goals, preferField(fields.publicAgenda, rawBase.publicAgenda, ''), ''),
        goals: preferField(fields.goals, rawBase.goals, ''),
        government_type: preferField(fields.government, preferField(fields.government_type, rawBase.government_type, ''), ''),
        ...(fields.government !== undefined ? { leadership: '' } : {}),
        alliesEnemies: preferField(fields.alliesEnemies, rawBase.alliesEnemies, ''),
        relationship_to_others: preferField(fields.alliesEnemies, rawBase.relationship_to_others, ''),
        capital_world: preferField(fields.territory, preferField(fields.capital_world, rawBase.capital_world, ''), ''),
        territoriesAssets: preferField(fields.territory, preferField(fields.territoriesAssets, rawBase.territoriesAssets, ''), ''),
        primary_exports: preferField(fields.resources, rawBase.primary_exports, ''),
        ...(fields.resources !== undefined ? { economic_model: '' } : {}),
        military_doctrine: preferField(fields.military_doctrine, rawBase.military_doctrine, ''),
        architecture: preferField(fields.architecture, rawBase.architecture, ''),
        gear_aesthetic: preferField(fields.gear_aesthetic, rawBase.gear_aesthetic, ''),
        design_language: preferField(fields.design_language, rawBase.design_language, ''),
        prominent_species: preferField(fields.prominent_species, rawBase.prominent_species, ''),
        tech_level: parseNumericLevel(fields.techLevel ?? fields['tech-level'] ?? fields.tech_level ?? rawBase.tech_level, 3),
        meta_level: parseNumericLevel(fields.metaLevel ?? fields['meta-level'] ?? fields.meta_level ?? rawBase.meta_level, 0),
        mechanic: preferField(fields.mechanic, rawBase.mechanic, '')
      }
    };
  }

  if (CORTEX_PROPERTY_COLLECTIONS.includes(targetCollection)) {
    const dcVal = parseNumericLevel(fields.craft_dc ?? fields.costCr ?? rawBase.craft_dc ?? rawBase.design_dc, 15);
    const parsedCost = parseOptionalFiniteNumber(fields.cost ?? fields.creditValue);
    const costVal = parsedCost !== undefined ? parsedCost : (rawBase.costs?.credits ?? rawBase.cost ?? 0);
    const rawDrStr = typeof fields.dr === 'string' ? fields.dr : '';
    const drFromCombined = rawDrStr.match(/DR\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i);
    const apFromCombined = rawDrStr.match(/AP\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i);
    const drNum = drFromCombined ? Number(drFromCombined[1]) : parseOptionalFiniteNumber(fields.dr);
    const apNum = (fields.ap !== undefined && fields.ap !== '')
      ? parseOptionalFiniteNumber(fields.ap)
      : (apFromCombined ? Number(apFromCombined[1]) : undefined);
    const weightNum = parseOptionalFiniteNumber(fields.weight);
    const spNum = parseOptionalFiniteNumber(fields.sp);
    const nodesNum = parseOptionalFiniteNumber(fields.nodes_consumed);
    const vttDcNum = parseOptionalFiniteNumber(fields.vttInteractionDC);

    const propPayload = {
      ...commonConsolidated,
      propertySubcategory: targetCollection,
      tech_level: parseNumericLevel(fields.techLevel ?? fields['tech-level'] ?? fields.tech_level ?? rawBase.tech_level, 3),
      meta_level: parseNumericLevel(fields.metaLevel ?? fields['meta-level'] ?? fields.meta_level ?? rawBase.meta_level, 0),
      availability: preferField(fields.rarity, preferField(fields.availability, rawBase.availability, 'Common'), 'Common'),
      description: preferField(fields.functionPurpose, preferField(fields.description, rawBase.description, ''), ''),
      aestheticForm: preferField(fields.aestheticForm, rawBase.aestheticForm, ''),
      craft_dc: dcVal,
      design_dc: dcVal,
      cost: costVal,
      costs: {
        ...(rawBase.costs || {}),
        credits: costVal
      },
      weight: weightNum !== undefined ? weightNum : (rawBase.weight ?? 1),
      mechanic: preferField(fields.mechanic, rawBase.mechanic, ''),
      mechanismPowerSource: preferField(fields.mechanismPowerSource, rawBase.mechanismPowerSource, ''),
      societalImpact: preferField(fields.socialEconomicImpact, preferField(fields.societalImpact, rawBase.societalImpact, ''), ''),
      limitationsCosts: preferField(fields.weaknesses, preferField(fields.limitationsCosts, rawBase.limitationsCosts, ''), ''),
      originHistory: preferField(fields.originContext, preferField(fields.originHistory, rawBase.originHistory, ''), ''),
      interactiveType: preferField(fields.interactiveType, rawBase.interactiveType, 'none'),
      vttInteractionDC: vttDcNum !== undefined ? vttDcNum : (rawBase.vttInteractionDC ?? undefined),
      lootTable: preferField(fields.lootTable, rawBase.lootTable, '')
    };
    if (fields.damage !== undefined) {
      if (fields.damage) propPayload.damage = fields.damage;
      else delete propPayload.damage;
    }
    if (fields.range !== undefined) {
      if (fields.range) propPayload.range = fields.range;
      else delete propPayload.range;
    }
    if (fields.location !== undefined) {
      if (fields.location) propPayload.location = fields.location;
      else delete propPayload.location;
    }
    if (apNum !== undefined) {
      propPayload.ap = apNum;
    } else if (fields.ap !== undefined) {
      delete propPayload.ap;
    }
    if (drNum !== undefined) {
      propPayload.dr = drNum;
    } else if (fields.dr !== undefined) {
      delete propPayload.dr;
    }
    if (spNum !== undefined) {
      propPayload.sp = spNum;
      propPayload.durability = spNum;
    } else if (fields.sp !== undefined) {
      delete propPayload.sp;
      delete propPayload.durability;
    }
    if (nodesNum !== undefined) {
      propPayload.nodes_consumed = nodesNum;
      propPayload.nodes = nodesNum;
    } else if (fields.nodes_consumed !== undefined) {
      delete propPayload.nodes_consumed;
      delete propPayload.nodes;
    }
    return {
      targetCollection,
      payload: propPayload
    };
  }

  if (targetCollection === 'modular_characters') {
    const folioEquivalent = convertPersonaElementToFolio(element) || convertMcmToFolioPersona({ ...rawBase, ...fields, title: cleanTitle });
    const fullMcmPayload = convertFolioToMcmRecord(folioEquivalent, { id: resolvedId }) || {};
    const tier = parseNumericLevel(fields.mcmTier ?? fullMcmPayload.threatTier ?? rawBase.threatTier, 3);
    const role = fields.mcmRole || fullMcmPayload.competencyRole || rawBase.competencyRole || 'Tank';
    const bossType = fields.mcmBossType || fields.mcmChassis || fullMcmPayload.bossType || rawBase.bossType || 'Standard';
    const designation = fields.mcmDesignation || fields.roleInStory || fullMcmPayload.designation || rawBase.designation || 'Adversary';
    const numOr = (candidate, fallback) => {
      if (candidate === undefined || candidate === null || candidate === '') return fallback;
      const parsed = parseOptionalFiniteNumber(candidate);
      return parsed !== undefined ? parsed : fallback;
    };
    const resolvedVit = numOr(fields.vitality ?? fullMcmPayload.vitality ?? rawBase.vitalityPoints, 30);
    const resolvedHp = numOr(fields.health ?? fullMcmPayload.health ?? rawBase.healthPoints, 30);
    const resolvedSp = numOr(fields.structurePoints ?? fields.structure ?? fullMcmPayload.structure_points ?? rawBase.structurePoints, 60);
    const resolvedDr = numOr(fields.armorDR ?? fullMcmPayload.expected_dr ?? rawBase.armorDR, 0);
    const resolvedDefenseDc = numOr(fields.defense_dc ?? fields.defense ?? fullMcmPayload.defense_dc ?? rawBase.defense_dc, 12);
    const resolvedAttackBonus = numOr(fields.attack_bonus ?? fields.attackBonus ?? fullMcmPayload.attack_bonus ?? rawBase.attack_bonus, 4);
    const resolvedActions = numOr(fields.actions ?? fields.actionsPerRound ?? fullMcmPayload.actions_per_round ?? rawBase.actions_per_round, 2);

    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        ...fullMcmPayload,
        id: commonConsolidated.id,
        name: commonConsolidated.name,
        title: commonConsolidated.title,
        content: commonConsolidated.content,
        customFields: commonConsolidated.customFields,
        imageUrl: commonConsolidated.imageUrl,
        guidance: commonConsolidated.guidance,
        assetHub: commonConsolidated.assetHub,
        oneLinePitch: commonConsolidated.oneLinePitch,
        primaryTriggers: commonConsolidated.primaryTriggers,
        secondaryTriggers: commonConsolidated.secondaryTriggers,
        triggerRegex: commonConsolidated.triggerRegex,
        loreSnippet: commonConsolidated.loreSnippet,
        injectionPriority: commonConsolidated.injectionPriority,
        loreScanPriority: commonConsolidated.loreScanPriority,
        conditionExpression: commonConsolidated.conditionExpression,
        loreRequireCondition: commonConsolidated.loreRequireCondition,
        triggerLogic: commonConsolidated.triggerLogic,
        speakerFilter: commonConsolidated.speakerFilter,
        loreBudgetTokens: commonConsolidated.loreBudgetTokens,
        loreSuppressCondition: commonConsolidated.loreSuppressCondition,
        loreAutoInject: commonConsolidated.loreAutoInject,
        loreAlwaysActive: commonConsolidated.loreAlwaysActive,
        loreCaseSensitive: commonConsolidated.loreCaseSensitive,
        keywords: commonConsolidated.keywords,
        negative_keywords: commonConsolidated.negative_keywords,
        updatedAt: commonConsolidated.updatedAt,
        threatTier: Number.isFinite(tier) ? tier : 3,
        threat_tier: Number.isFinite(tier) ? tier : 3,
        competencyRole: role,
        competency_role: role,
        role,
        designation,
        bossType,
        boss_type: bossType,
        isSynthetic: Boolean(fields.isSynthetic ?? fullMcmPayload.isSynthetic ?? rawBase.isSynthetic),
        vitality: resolvedVit,
        vitalityPoints: resolvedVit,
        health: resolvedHp,
        healthPoints: resolvedHp,
        structure_points: resolvedSp,
        structurePoints: resolvedSp,
        expected_dr: resolvedDr,
        armorDR: resolvedDr,
        defense_dc: resolvedDefenseDc,
        attack_bonus: resolvedAttackBonus,
        actions_per_round: resolvedActions,
        tech_level: parseNumericLevel(fields.techLevel ?? fields['tech-level'] ?? fields.tech_level ?? fullMcmPayload.tech_level ?? rawBase.tech_level, 3),
        meta_level: parseNumericLevel(fields.metaLevel ?? fields['meta-level'] ?? fields['magic-level'] ?? fields.meta_level ?? fullMcmPayload.meta_level ?? rawBase.meta_level, 0),
        appearance: preferField(fields.physicalDescription, preferField(fields.appearance, fullMcmPayload.appearance || rawBase.appearance || '', ''), ''),
        voiceMannerisms: preferField(fields.personalityMannerisms, preferField(fields.mannerisms, fullMcmPayload.mannerisms || rawBase.voiceMannerisms || '', ''), ''),
        motivationsGoals: preferField(fields.goalsMotivations, preferField(fields['char-motive'], fullMcmPayload['char-motive'] || rawBase.motivationsGoals || '', ''), ''),
        relationships: preferField(fields.relationships, preferField(fields.keyRelationships, fullMcmPayload.keyRelationships || rawBase.relationships || '', ''), ''),
        npcRoutine: preferField(fields.vttScript, preferField(fields.npcRoutine, rawBase.npcRoutine || '', ''), ''),
        description: preferField(fields.summary, preferField(fields.physicalDescription, rawBase.description || '', ''), ''),
        mechanic: preferField(fields.mechanic, rawBase.mechanic, ''),
        personaData: folioEquivalent,
        vttUnitData: fullMcmPayload.vttUnitData
      }
    };
  }

  if (targetCollection === 'planetary_design' || targetCollection === 'world') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        highConcept: preferField(fields.corePremise, preferField(fields.oneLinePitch, rawBase.highConcept, ''), ''),
        description: preferField(fields.corePremise, rawBase.description, ''),
        planetaryGeography: preferField(fields.continents, rawBase.planetaryGeography, ''),
        geography: preferField(fields.continents, rawBase.geography, ''),
        societiesGovernance: preferField(fields.majorFactions, rawBase.societiesGovernance, ''),
        culture: preferField(fields.majorFactions, rawBase.culture, ''),
        historicalTimeline: preferField(fields.historyTimeline, rawBase.historicalTimeline, ''),
        physicsMetaphysics: preferField(fields.cosmologyPhysics, rawBase.physicsMetaphysics, ''),
        adventureHooks: preferField(fields.themes, rawBase.adventureHooks, ''),
        starSystem: preferField(fields.starSystem, rawBase.starSystem, ''),
        cataclysms: preferField(fields.cataclysms, rawBase.cataclysms, ''),
        demographics: preferField(fields.demographics, rawBase.demographics, ''),
        techLevel: preferField(fields.techLevel, rawBase.techLevel ?? rawBase.tech_level, ''),
        magic: preferField(fields.magic, rawBase.magic, ''),
        pantheons: preferField(fields.pantheons, rawBase.pantheons, ''),
        inspirations: preferField(fields.inspirations, rawBase.inspirations, ''),
        gmNotes: preferField(fields.gmNotes, rawBase.gmNotes, '')
      }
    };
  }

  if (targetCollection === 'universe') {
    const resolvedTech = fields['tech-level'] ?? fields.techLevel ?? rawBase['tech-level'] ?? rawBase.tech_level;
    const resolvedMeta = fields['meta-level'] ?? fields.metaLevel ?? rawBase['meta-level'] ?? rawBase.meta_level;
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        description: preferField(fields.ontological, rawBase.description, ''),
        cosmologyDimensions: preferField(fields.ontological, rawBase.cosmologyDimensions, ''),
        laws_of_physics: preferField(fields.lawsPhysics, rawBase.laws_of_physics, ''),
        fundamentalLaws: preferField(fields.lawsPhysics, rawBase.fundamentalLaws, ''),
        natureMagic: preferField(fields.natureMagic, rawBase.natureMagic, ''),
        cosmological: preferField(fields.cosmological, rawBase.cosmological, ''),
        creation: preferField(fields.creation, rawBase.creation, ''),
        entities: preferField(fields.entities, rawBase.entities, ''),
        interplanar: preferField(fields.interplanar, rawBase.interplanar, ''),
        centralQuestion: preferField(fields.centralQuestion, rawBase.centralQuestion, ''),
        ...(resolvedTech !== undefined && resolvedTech !== '' ? { 'tech-level': resolvedTech } : {}),
        ...(resolvedMeta !== undefined && resolvedMeta !== '' ? { 'meta-level': resolvedMeta } : {}),
        ...(fields.storyFlagKey !== undefined || rawBase.storyFlagKey !== undefined
          ? { storyFlagKey: preferField(fields.storyFlagKey, rawBase.storyFlagKey, '') }
          : {})
      }
    };
  }

  if (targetCollection === 'setting') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        world: preferField(fields.parentWorld, rawBase.world || ''),
        scale: preferField(fields.scale, rawBase.scale || ''),
        genreTech: preferField(fields.genreTech, rawBase.genreTech || ''),
        description: preferField(fields.geographyArchitecture, rawBase.description || ''),
        architecturalLayout: preferField(fields.geographyArchitecture, rawBase.architecturalLayout || ''),
        climateWeather: preferField(fields.climateWeather, rawBase.climateWeather ?? ''),
        oneLinePitch: preferField(fields.functionPurpose, commonConsolidated.oneLinePitch || ''),
        functionPurpose: preferField(fields.functionPurpose, rawBase.functionPurpose ?? ''),
        primaryConflict: preferField(fields.primaryConflict, rawBase.primaryConflict || ''),
        sensoryAtmosphere: preferField(fields.sensoryDetails, rawBase.sensoryAtmosphere || ''),
        inhabitants: preferField(fields.populationDemographics, rawBase.inhabitants || ''),
        inhabitantsDenizens: preferField(fields.populationDemographics, rawBase.inhabitantsDenizens || ''),
        points_of_interest: preferField(fields.landmarksSecrets, rawBase.points_of_interest || ''),
        pointsOfInterest: preferField(fields.landmarksSecrets, rawBase.pointsOfInterest || ''),
        gmNotes: preferField(fields.gmNotes, rawBase.gmNotes || ''),
        ...(fields.landmarksSecrets !== undefined ? { secretsPlotHooks: '' } : {})
      }
    };
  }

  if (targetCollection === 'scene') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        scenePurpose: preferField(fields.scenePurpose, rawBase.scenePurpose, ''),
        stateChange: preferField(fields.stateChange, rawBase.stateChange, ''),
        setting_location: preferField(fields.location, rawBase.setting_location, ''),
        sensoryDetails: preferField(fields.sensoryDetails, rawBase.sensoryDetails, ''),
        lightingAtmosphere: preferField(fields.moodAtmosphere, rawBase.lightingAtmosphere, ''),
        rewards_loot: preferField(fields.keyObjects, rawBase.rewards_loot, ''),
        sceneBeats: preferField(fields.sceneBeats, rawBase.sceneBeats, ''),
        description: preferField(fields.sceneBeats, rawBase.description, ''),
        readAloud: preferField(fields.readAloud, rawBase.readAloud, ''),
        gmNotes: preferField(fields.gmNotes, rawBase.gmNotes, '')
      }
    };
  }

  if (targetCollection === 'philosophy') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        coreQuestion: preferField(fields.coreQuestion, rawBase.coreQuestion, ''),
        description: preferField(fields.coreTenets, rawBase.description, ''),
        coreDogmaTenets: preferField(fields.coreTenets, rawBase.coreDogmaTenets, ''),
        coreTenet: preferField(fields.coreTenets, fields.coreTenet ?? rawBase.coreTenet ?? rawBase.coreDogmaTenets ?? '', ''),
        symbolsIconography: preferField(fields.symbolsIconography, rawBase.symbolsIconography, ''),
        institutionalStructure: preferField(fields.influenceSociety, rawBase.institutionalStructure, ''),
        practices: preferField(fields.ritualsPractices, rawBase.practices, ''),
        ritualsPractices: preferField(fields.ritualsPractices, rawBase.ritualsPractices, ''),
        freeWill: preferField(fields.freeWill, rawBase.freeWill, ''),
        truthEpistemology: preferField(fields.truthEpistemology, rawBase.truthEpistemology, ''),
        moralCodeTaboos: preferField(fields.ethics, rawBase.moralCodeTaboos, ''),
        origin: preferField(fields.cosmology, rawBase.origin, ''),
        cosmologyWorldview: preferField(fields.cosmology, rawBase.cosmologyWorldview, ''),
        ...(fields.disposition !== undefined || rawBase.disposition !== undefined
          ? { disposition: preferField(fields.disposition, rawBase.disposition, '') }
          : {}),
        gmNotes: preferField(fields.gmNotes, rawBase.gmNotes, '')
      }
    };
  }

  if (CORTEX_METAPHYSICS_COLLECTIONS.includes(targetCollection)) {
    const mlVal = parseNumericLevel(
      fields.meta_level ?? fields['meta-level'] ?? fields.metaLevel ?? rawBase.meta_level,
      1
    );
    const designDcVal =
      fields.design_dc !== undefined
        ? String(fields.design_dc)
        : (rawBase.design_dc !== undefined ? String(rawBase.design_dc) : '');
    const toListIfText = (val, fallback) => {
      if (val === '') return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim()) {
        return val.split(',').map(s => s.trim()).filter(Boolean);
      }
      return fallback ?? [];
    };

    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        metaphysicsSubcategory: targetCollection,
        description: preferField(fields.description, preferField(fields.oneLinePitch, rawBase.description, ''), ''),
        mechanic: preferField(fields.mechanic, rawBase.mechanic, ''),
        ...(targetCollection === 'disciplines'
          ? {
              discipline_skills: toListIfText(fields.meta_skill, rawBase.discipline_skills)
            }
          : {}),
        discipline: preferField(fields.discipline, preferField(fields.meta_skill, rawBase.discipline, ''), ''),
        meta_skill: preferField(fields.meta_skill, preferField(fields.discipline, rawBase.meta_skill, ''), ''),
        meta_level: mlVal,
        design_dc: designDcVal,
        cast_time: preferField(fields.cast_time, rawBase.cast_time, ''),
        duration: preferField(fields.duration, rawBase.duration, ''),
        range: toListIfText(fields.range, rawBase.range),
        area: toListIfText(fields.area, rawBase.area),
        target: toListIfText(fields.target, rawBase.target),
        effect: toListIfText(fields.effect, rawBase.effect),
        strainBacklash: preferField(fields.strainBacklash, rawBase.strainBacklash, ''),
        manifestationSensory: preferField(fields.manifestationSensory, rawBase.manifestationSensory, ''),
        originLore: preferField(fields.originLore, rawBase.originLore, '')
      }
    };
  }

  return {
    targetCollection,
    payload: commonConsolidated
  };
}
