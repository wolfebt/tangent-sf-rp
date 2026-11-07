/**
 * @file cortexAdeAssetBridge.js
 * @description Unified bidirectional projection & consolidation bridge connecting:
 *   1. OmniCortex Database (`DBMContext.dbData`) & Codex Studio (`CODEX_MATRICES`)
 *   2. Persona Folio (`FolioContext.roster` / `personaRoster` / `publicPersonas`)
 *   3. Modular Character Matrix (`dbData.modular_characters`)
 *   4. ADE Story Module (`CampaignContext.elementsCatalog`)
 *
 * Ensures Cortex assets have full, live representation in ADE (`ElementForge`, `ADENavRail`,
 * Weaver, MapMaker, Asset Hub, and VTT Stage) and consolidates ADE-authored fields directly
 * back into canonical OmniCortex collections without lossy duplication.
 */

import {
  PROPERTY_SUBCATEGORIES,
  PERSONA_SUBCATEGORIES,
  METAPHYSICS_SUBCATEGORIES,
  normalizeElementType,
  inferPropertySubcategory,
  inferMetaphysicsSubcategory
} from '../pages/Foundry/ElementForge/elementSchemas.js';
import { convertFolioToPersonaElement, convertPersonaElementToFolio } from './personaBridge.js';

export const CORTEX_PROPERTY_COLLECTIONS = PROPERTY_SUBCATEGORIES.map(s => s.dbmCollection);
export const CORTEX_METAPHYSICS_COLLECTIONS = METAPHYSICS_SUBCATEGORIES.map(s => s.dbmCollection);

export const COLLECTION_TO_ADE_TYPE = {
  species: 'Species',
  factions: 'Faction',
  weaponry: 'Property',
  armoring: 'Property',
  augmentations: 'Property',
  gear: 'Property',
  mecha: 'Property',
  architecture: 'Property',
  technology: 'Property',
  other: 'Property',
  modular_characters: 'Persona',
  archetypes: 'Persona',
  planetary_design: 'World',
  world: 'World',
  universe: 'Universe',
  setting: 'Setting',
  scene: 'Scene',
  philosophy: 'Philosophy',
  invocations: 'Metaphysics',
  disciplines: 'Metaphysics',
  special_abilities: 'Metaphysics',
  synthesis: 'Metaphysics'
};

export const ADE_TYPE_TO_CORTEX_COLLECTIONS = {
  Persona: ['modular_characters', 'archetypes'],
  Species: ['species'],
  Faction: ['factions'],
  Property: CORTEX_PROPERTY_COLLECTIONS,
  Metaphysics: CORTEX_METAPHYSICS_COLLECTIONS,
  World: ['planetary_design', 'world'],
  Universe: ['universe'],
  Setting: ['setting'],
  Scene: ['scene'],
  Philosophy: ['philosophy']
};

export const COLLECTION_TO_CODEX_MATRIX = {
  species: 'species',
  factions: 'factions',
  weaponry: 'weaponry',
  armoring: 'armor',
  augmentations: 'augmentations',
  gear: 'equipment',
  mecha: 'mecha',
  architecture: 'architecture',
  technology: 'technology',
  other: 'other',
  modular_characters: 'modular-characters',
  archetypes: 'archetypes',
  planetary_design: 'planetary-design',
  invocations: 'invocation',
  synthesis: 'meta-tech'
};

export const CORTEX_BACKED_ADE_TYPES = new Set(Object.keys(ADE_TYPE_TO_CORTEX_COLLECTIONS));

const toText = (val) => {
  if (val === undefined || val === null) return '';
  if (Array.isArray(val)) {
    return val
      .map(item => (typeof item === 'object' && item !== null ? (item.name || item.label || item.id || '') : String(item)))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch (_) {
      return '';
    }
  }
  return String(val);
};

const pickLorebookFieldsFromRecord = (record = {}) => ({
  oneLinePitch: record.oneLinePitch || '',
  primaryTriggers: toText(record.primaryTriggers),
  secondaryTriggers: toText(record.secondaryTriggers),
  triggerRegex: record.triggerRegex || '',
  loreSnippet: record.loreSnippet || '',
  loreScanPriority: record.loreScanPriority !== undefined ? String(record.loreScanPriority) : (record.injectionPriority !== undefined ? String(record.injectionPriority) : ''),
  loreBudgetTokens: record.loreBudgetTokens !== undefined ? String(record.loreBudgetTokens) : '',
  loreSuppressCondition: record.loreSuppressCondition || '',
  loreRequireCondition: record.loreRequireCondition || record.conditionExpression || '',
  keywords: toText(record.keywords),
  negative_keywords: toText(record.negative_keywords)
});

/**
 * Projects a single OmniCortex / Codex record into a canonical ADE ElementRecord.
 */
export function projectOmnicortexRecordToAdeElement(record, collectionKey) {
  if (!record || typeof record !== 'object' || !collectionKey) return null;

  const rawId = String(record.id || record.name || '').trim();
  if (!rawId) return null;

  const adeType = COLLECTION_TO_ADE_TYPE[collectionKey] || 'Custom';
  const title = String(record.name || record.title || 'Untitled Cortex Asset').trim();
  const codexMatrixId = COLLECTION_TO_CODEX_MATRIX[collectionKey] || null;
  const baseLorebook = pickLorebookFieldsFromRecord(record);

  let fields = {
    ...baseLorebook,
    dbmCategory: collectionKey,
    dbmId: rawId
  };

  let sourceOrigin = 'omnicortex';
  let propertySubcategory = undefined;
  let personaSubcategory = undefined;
  let metaphysicsSubcategory = undefined;

  if (collectionKey === 'species') {
    fields = {
      ...fields,
      speciesName: title,
      parent_species: toText(record.parent_species),
      classification: toText(record.type || record.species_type || 'Humanoid'),
      size: toText(record.size || 'Medium'),
      oneLinePitch: record.oneLinePitch || toText(record.stigma) || '',
      physicalDescription: record.physiologyBiology || record.description || record.body || '',
      abilitiesPowers: record.mechanic || toText(record.trait) || toText(record.inherent_features) || '',
      behaviorDiet: record.cultureSociety || record.dietaryLifecycle || '',
      habitatOrigin: record.homeworld || '',
      roleInWorld: record.roleInSetting || '',
      cp: String(record.cp ?? 0),
      tech_level: String(record.tech_level ?? 3),
      meta_level: String(record.meta_level ?? 0),
      movement: toText(record.movement),
      dbmSpeciesRef: rawId
    };
  } else if (collectionKey === 'factions') {
    fields = {
      ...fields,
      name: title,
      faction_type: toText(record.faction_type),
      archetype: toText(record.archetype),
      oneLinePitch: record.oneLinePitch || record.driving_mandate || '',
      motto: record.motto || record.symbol_sigil || '',
      description: record.description || '',
      ideology: record.core_beliefs || record.attitude || '',
      goals: record.publicAgenda || record.goals || record.driving_mandate || '',
      government: [record.government_type, record.leadership].filter(Boolean).join(' — '),
      alliesEnemies: record.alliesEnemies || record.relationship_to_others || record.outsider_view || '',
      territory: record.territoriesAssets || record.capital_world || '',
      resources: [record.primary_exports, record.economic_model].filter(Boolean).join(' | '),
      military_doctrine: record.military_doctrine || record.key_units || '',
      tech_level: String(record.tech_level ?? record.tl ?? 3),
      meta_level: String(record.meta_level ?? record.ml ?? 0),
      prominent_species: toText(record.prominent_species),
      mechanic: record.mechanic || '',
      dbmFactionRef: rawId
    };
  } else if (CORTEX_PROPERTY_COLLECTIONS.includes(collectionKey)) {
    propertySubcategory = collectionKey;
    const resolvedDc = record.craft_dc ?? record.design_dc ?? record.base_dc ?? '';
    const resolvedCost = record.costs?.credits ?? record.cost ?? '';
    fields = {
      ...fields,
      name: title,
      propertySubcategory: collectionKey,
      itemCategory: collectionKey,
      oneLinePitch: record.oneLinePitch || '',
      techLevel: String(record.tech_level ?? record.tl ?? 3),
      metaLevel: String(record.meta_level ?? record.ml ?? 0),
      rarity: toText(record.availability || record.quality || 'Standard'),
      functionPurpose: record.description || record.primary_purpose || '',
      aestheticForm: record.aestheticForm || toText(record.faction_skin || record.style || ''),
      craft_dc: resolvedDc !== '' ? String(resolvedDc) : '',
      cost: resolvedCost !== '' ? String(resolvedCost) : '',
      weight: record.weight !== undefined ? String(record.weight) : '',
      mechanic: record.mechanic || '',
      damage: toText(record.damage),
      range: toText(record.range),
      ap: record.ap !== undefined ? String(record.ap) : '',
      dr: (record.dr ?? record.dr_rating) !== undefined ? String(record.dr ?? record.dr_rating) : '',
      sp: (record.sp ?? record.durability) !== undefined ? String(record.sp ?? record.durability) : '',
      nodes_consumed: (record.nodes_consumed ?? record.nodes) !== undefined ? String(record.nodes_consumed ?? record.nodes) : '',
      location: toText(record.location || record.body_locations || record.coverage || record.footprint || record.frame),
      mechanismPowerSource: record.mechanismPowerSource || toText(record.power_source || record.propulsion),
      socialEconomicImpact: record.societalImpact || record.socialEconomicImpact || '',
      weaknesses: record.limitationsCosts || record.weaknesses || '',
      originContext: record.originHistory || toText(record.creator || record.origin),
      interactiveType: record.interactiveType || 'none',
      vttInteractionDC: record.vttInteractionDC !== undefined ? String(record.vttInteractionDC) : '',
      lootTable: record.lootTable || ''
    };
  } else if (collectionKey === 'modular_characters') {
    sourceOrigin = 'mcm';
    personaSubcategory = 'mcm';
    const tier = record.threatTier ?? record.threat_tier ?? 3;
    const role = record.competencyRole || record.role || 'Tank';
    const bossType = record.bossType || record.boss_type || 'Standard';
    const designation = record.designation || 'Adversary';
    fields = {
      ...fields,
      name: title,
      archetype: `${bossType} ${role}`.trim(),
      oneLinePitch: record.oneLinePitch || `${designation} • Tier ${tier} ${role}`,
      physicalDescription: record.appearance || record.description || '',
      personalityMannerisms: record.voiceMannerisms || '',
      goalsMotivations: record.motivationsGoals || '',
      roleInStory: designation,
      relationships: record.relationships || '',
      mcmTier: String(tier),
      mcmDesignation: designation,
      mcmChassis: bossType,
      mcmRole: role,
      isSynthetic: Boolean(record.isSynthetic),
      health: String(record.healthPoints ?? 30),
      vitality: String(record.vitalityPoints ?? 30),
      structure: String(record.structurePoints ?? 60),
      armorDR: String(record.armorDR ?? 0),
      'tech-level': String(record.tech_level ?? 3),
      'magic-level': String(record.meta_level ?? 1),
      vttScript: record.npcRoutine || '',
      mechanic: record.mechanic || ''
    };
  } else if (collectionKey === 'archetypes') {
    personaSubcategory = 'archetypes';
    fields = {
      ...fields,
      name: title,
      archetype: toText(record.sphere || 'Archetype Chassis'),
      oneLinePitch: record.oneLinePitch || record.core_concept || record.quote || '',
      physicalDescription: record.description || record.full_text || '',
      goalsMotivations: record.tactical_role || '',
      roleInStory: record.core_concept || 'Archetype Template',
      'starting-cp': String(record.cp_chassis ?? record.bp_chassis ?? 80)
    };
  } else if (collectionKey === 'planetary_design' || collectionKey === 'world') {
    fields = {
      ...fields,
      worldName: title,
      corePremise: record.highConcept || record.oneLinePitch || record.description || '',
      majorFactions: record.societiesGovernance || record.dominant_faction || record.factionArchetype || record.culture || '',
      historyTimeline: record.historicalTimeline || '',
      cosmologyPhysics: record.physicsMetaphysics || record.quirks || record.hazards || '',
      starSystem: record.starClass ? `Star Class ${record.starClass} • ${record.orbitalZone || 'BioZone'} • Starport ${record.starport || 'C'}` : '',
      continents: record.planetaryGeography || record.geography || record.settlements || '',
      themes: record.adventureHooks || ''
    };
  } else if (collectionKey === 'universe') {
    fields = {
      ...fields,
      designation: record.oneLinePitch || `${title}${record.scale ? ` (${record.scale})` : ''}`,
      ontological: record.cosmologyDimensions || record.description || '',
      lawsPhysics: record.fundamentalLaws || record.laws_of_physics || ''
    };
  } else if (collectionKey === 'setting') {
    fields = {
      ...fields,
      settingName: title,
      parentWorld: toText(record.world),
      geographyArchitecture: record.architecturalLayout || record.description || '',
      populationDemographics: record.inhabitantsDenizens || record.inhabitants || '',
      functionPurpose: record.oneLinePitch || '',
      sensoryDetails: record.sensoryAtmosphere || '',
      landmarksSecrets: [record.pointsOfInterest || record.points_of_interest, record.secretsPlotHooks].filter(Boolean).join('\n')
    };
  } else if (collectionKey === 'scene') {
    fields = {
      ...fields,
      sceneName: title,
      location: record.setting_location || '',
      sensoryDetails: record.sensoryDetails || '',
      moodAtmosphere: record.lightingAtmosphere || record.dramatic_hook || '',
      keyObjects: record.rewards_loot || record.participants || '',
      sceneBeats: record.sceneBeats || record.description || '',
      readAloud: record.readAloud || ''
    };
  } else if (collectionKey === 'philosophy') {
    fields = {
      ...fields,
      philosophyName: title,
      coreTenets: record.coreDogmaTenets || record.description || '',
      ritualsPractices: record.ritualsPractices || record.practices || '',
      symbolsIconography: record.symbolsIconography || '',
      influenceSociety: record.institutionalStructure || '',
      ethics: record.moralCodeTaboos || '',
      cosmology: record.cosmologyWorldview || record.origin || ''
    };
  } else if (CORTEX_METAPHYSICS_COLLECTIONS.includes(collectionKey)) {
    metaphysicsSubcategory = collectionKey;
    const costParts = [];
    if (record.costs && typeof record.costs === 'object') {
      if (record.costs.ap) costParts.push(`${record.costs.ap} AP`);
      if (record.costs.strain) costParts.push(`${record.costs.strain} Strain`);
      if (record.costs.focus) costParts.push(`${record.costs.focus} Focus`);
      if (record.costs.bp) costParts.push(`${record.costs.bp} BP`);
    }
    fields = {
      ...fields,
      name: title,
      metaphysicsSubcategory: collectionKey,
      discipline: toText(record.discipline || record.synthesis_type || ''),
      oneLinePitch: record.oneLinePitch || record.description || record.mechanic || '',
      description: record.description || '',
      meta_skill: toText(record.meta_skill || record.discipline_skills || ''),
      meta_level: String(record.meta_level ?? record.ml ?? 1),
      design_dc: record.design_dc !== undefined && record.design_dc !== null ? String(record.design_dc) : '',
      cast_time: record.cast_time || '',
      duration: record.duration || '',
      range: toText(record.range),
      area: toText(record.area),
      target: toText(record.target),
      effect: toText(record.effect),
      mechanic: record.mechanic || '',
      strainBacklash: record.strainBacklash || costParts.join(', ') || '',
      manifestationSensory: record.manifestationSensory || record.crisp_prompt || '',
      originLore: record.originLore || record.note || ''
    };
  }

  const summaryText =
    record.oneLinePitch ||
    record.description ||
    record.driving_mandate ||
    record.core_concept ||
    record.mechanic ||
    '';

  return {
    id: `cortex_${collectionKey}_${rawId}`,
    title,
    name: title,
    type: adeType,
    ...(propertySubcategory ? { propertySubcategory } : {}),
    ...(personaSubcategory ? { personaSubcategory } : {}),
    ...(metaphysicsSubcategory ? { metaphysicsSubcategory } : {}),
    sourceOrigin,
    isCortexAsset: true,
    isPinnedToModule: false,
    dbmCategory: collectionKey,
    dbmId: rawId,
    codexMatrixId,
    imageUrl: record.imageUrl || record.avatarUrl || '',
    content: record.body || record.full_text || (summaryText ? `<p>${summaryText}</p>` : ''),
    guidance: record.guidance || {
      genre: '',
      tone: '',
      pacing: '',
      pov: '',
      literaryDevices: [],
      structure: ''
    },
    fields,
    assetHub: Array.isArray(record.assetHub) ? record.assetHub : [],
    tags: Array.isArray(record.tags)
      ? record.tags
      : (record.keywords ? String(record.keywords).split(',').map(s => s.trim()).filter(Boolean) : []),
    cortexRaw: record,
    updatedAt: record.updatedAt || null
  };
}

/**
 * Projects a Persona Folio character record into a live ADE Persona element.
 */
export function projectFolioPersonaToAdeElement(folioChar) {
  if (!folioChar || typeof folioChar !== 'object') return null;
  const docId = String(folioChar['character-doc-id'] || folioChar.id || '').trim();
  const charName = String(folioChar['char-name'] || folioChar.name || folioChar.title || '').trim();
  if (!docId && !charName) return null;

  const stableId = `folio_persona_${docId || charName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  const converted = convertFolioToPersonaElement(folioChar, { id: stableId });
  if (!converted) return null;

  const species = folioChar['char-species'] || '';
  const occu = folioChar['char-occu'] || '';
  const faction = folioChar['char-faction'] || '';
  const archetype = folioChar['char-archetype'] || folioChar['char-concept'] || '';
  const autoPitch = [species, occu, faction ? `(${faction})` : ''].filter(Boolean).join(' • ');

  return {
    ...converted,
    id: stableId,
    title: charName || converted.title,
    name: charName || converted.title,
    type: 'Persona',
    personaSubcategory: 'folio',
    sourceOrigin: 'folio',
    isFolioPersona: true,
    isCortexAsset: false,
    isPinnedToModule: false,
    folioDocId: docId || stableId,
    isLockedForVtt: Boolean(folioChar.is_locked || folioChar.is_ready_for_vtt || folioChar.folio_phase === 'locked'),
    fields: {
      ...(converted.fields || {}),
      name: charName || converted.title,
      archetype: archetype || converted.fields?.archetype || 'Folio Operator',
      oneLinePitch: folioChar.summary || folioChar['char-concept'] || autoPitch || 'Persona Folio Character Sheet',
      physicalDescription: folioChar.appearance || folioChar['char-style'] || '',
      personalityMannerisms: folioChar.mannerisms || folioChar.personalityType || '',
      backgroundHistory: folioChar.backstory || '',
      goalsMotivations: folioChar['char-motive'] || folioChar.goals || '',
      roleInStory: folioChar.role || 'Operative / Protagonist',
      relationships: folioChar.keyRelationships || ''
    }
  };
}

/**
 * Normalizes a campaign-local ADE element (e.g. migrating legacy 'Item' or 'Technology' to 'Property').
 */
export function normalizeStoryModuleElement(el) {
  if (!el || typeof el !== 'object') return null;
  const rawType = el.type || 'Custom';
  const canonicalType = normalizeElementType(rawType);
  const next = {
    ...el,
    originalType: el.originalType || rawType,
    type: canonicalType,
    sourceOrigin: el.sourceOrigin || 'module',
    isPinnedToModule: true
  };

  if (canonicalType === 'Property') {
    const subcat = inferPropertySubcategory({ ...el, originalType: rawType });
    next.propertySubcategory = subcat;
    next.fields = {
      ...(el.fields || {}),
      propertySubcategory: el.fields?.propertySubcategory || subcat
    };
  } else if (canonicalType === 'Persona') {
    const inferredPersonaSub =
      el.personaSubcategory ||
      (el.folioDocId || el.personaData ? 'folio' : (el.dbmCategory === 'modular_characters' ? 'mcm' : (el.dbmCategory === 'archetypes' ? 'archetypes' : 'story')));
    next.personaSubcategory = inferredPersonaSub;
  } else if (canonicalType === 'Metaphysics') {
    const metaSub = inferMetaphysicsSubcategory({ ...el, originalType: rawType });
    next.metaphysicsSubcategory = metaSub;
    next.fields = {
      ...(el.fields || {}),
      metaphysicsSubcategory: el.fields?.metaphysicsSubcategory || metaSub
    };
  } else if (canonicalType === 'Philosophy' && CORTEX_METAPHYSICS_COLLECTIONS.includes(el.dbmCategory || el.fields?.dbmCategory)) {
    // Auto-migrate any previously pinned invocation/synthesis/discipline record out of Philosophy into Metaphysics
    const metaSub = el.dbmCategory || el.fields?.dbmCategory;
    next.type = 'Metaphysics';
    next.metaphysicsSubcategory = metaSub;
    next.fields = {
      ...(el.fields || {}),
      metaphysicsSubcategory: metaSub
    };
  }

  return next;
}

/**
 * Builds the deduplicated, unified ADE asset catalog combining:
 *   1. Story Module (`elementsCatalog`)
 *   2. OmniCortex / Codex (`dbData`)
 *   3. Persona Folio (`folioRoster` + `publicPersonas`)
 */
export function buildUnifiedAdeCatalog({
  elementsCatalog = [],
  dbData = {},
  folioRoster = [],
  publicPersonas = []
} = {}) {
  const normalizedModuleElements = (Array.isArray(elementsCatalog) ? elementsCatalog : [])
    .map(normalizeStoryModuleElement)
    .filter(Boolean);

  // Index Story Module pins by (dbmCategory:dbmId) and (folioDocId) and element ID
  const pinnedByCortexKey = new Map();
  const pinnedByFolioId = new Map();
  const consumedModuleIds = new Set();

  for (const modEl of normalizedModuleElements) {
    const dbmCat = modEl.dbmCategory || modEl.fields?.dbmCategory;
    const dbmId = modEl.dbmId || modEl.fields?.dbmId || modEl.fields?.dbmRef || modEl.dbmRef || modEl.fields?.dbmSpeciesRef || modEl.fields?.dbmFactionRef;
    if (dbmCat && dbmId) {
      pinnedByCortexKey.set(`${String(dbmCat).toLowerCase()}:${String(dbmId).toLowerCase()}`, modEl);
    }
    const fId = modEl.folioDocId || modEl.personaData?.['character-doc-id'];
    if (fId) {
      pinnedByFolioId.set(String(fId).toLowerCase(), modEl);
    }
  }

  const unified = [];

  // 1. Project Persona Folio characters (deduplicated across roster + publicPersonas)
  const seenFolioIds = new Set();
  const combinedFolio = [
    ...(Array.isArray(folioRoster) ? folioRoster : []),
    ...(Array.isArray(publicPersonas) ? publicPersonas : [])
  ];

  for (const folioChar of combinedFolio) {
    if (!folioChar || typeof folioChar !== 'object') continue;
    const fKey = String(folioChar['character-doc-id'] || folioChar.id || folioChar['char-name'] || '').trim().toLowerCase();
    if (!fKey || seenFolioIds.has(fKey)) continue;
    seenFolioIds.add(fKey);

    const projected = projectFolioPersonaToAdeElement(folioChar);
    if (!projected) continue;

    const pinned = pinnedByFolioId.get(String(projected.folioDocId).toLowerCase()) ||
      normalizedModuleElements.find(m => m.id === projected.id);

    if (pinned) {
      consumedModuleIds.add(pinned.id);
      unified.push({
        ...projected,
        ...pinned,
        id: pinned.id,
        moduleElementId: pinned.id,
        type: 'Persona',
        personaSubcategory: 'folio',
        sourceOrigin: 'folio',
        isFolioPersona: true,
        isPinnedToModule: true,
        folioDocId: projected.folioDocId,
        personaData: folioChar,
        fields: {
          ...projected.fields,
          ...(pinned.fields || {})
        }
      });
    } else {
      unified.push(projected);
    }
  }

  // 2. Project all OmniCortex / Codex collections mapped to ADE categories
  const cortexCollections = Object.keys(COLLECTION_TO_ADE_TYPE);
  for (const colKey of cortexCollections) {
    const records = Array.isArray(dbData?.[colKey]) ? dbData[colKey] : [];
    for (const rec of records) {
      const projected = projectOmnicortexRecordToAdeElement(rec, colKey);
      if (!projected) continue;

      const lookupKey = `${colKey.toLowerCase()}:${String(projected.dbmId).toLowerCase()}`;
      const pinned = pinnedByCortexKey.get(lookupKey) ||
        normalizedModuleElements.find(m => m.id === projected.id);

      if (pinned) {
        consumedModuleIds.add(pinned.id);
        unified.push({
          ...projected,
          ...pinned,
          id: pinned.id,
          moduleElementId: pinned.id,
          type: projected.type,
          ...(projected.propertySubcategory ? { propertySubcategory: projected.propertySubcategory } : {}),
          ...(projected.personaSubcategory ? { personaSubcategory: projected.personaSubcategory } : {}),
          sourceOrigin: projected.sourceOrigin,
          isCortexAsset: true,
          isPinnedToModule: true,
          dbmCategory: colKey,
          dbmId: projected.dbmId,
          codexMatrixId: projected.codexMatrixId,
          cortexRaw: rec,
          fields: {
            ...projected.fields,
            ...(pinned.fields || {})
          }
        });
      } else {
        unified.push(projected);
      }
    }
  }

  // 3. Append remaining Story Module elements (Story Arcs, Adventures, Encounters, Clues, Handouts, Maps, Custom, Story Personas, etc.)
  for (const modEl of normalizedModuleElements) {
    if (!consumedModuleIds.has(modEl.id)) {
      unified.push(modEl);
    }
  }

  return unified;
}

/**
 * Resolves the canonical OmniCortex collection key for an ADE element if it belongs to Cortex.
 * Returns null for purely campaign-scoped narrative structures (Story Arc, Adventure, Encounter, Clue, Handout, Map, Custom)
 * or Folio-backed Personas.
 */
export function resolveTargetCortexCollection(element) {
  if (!element || typeof element !== 'object') return null;
  const canonicalType = normalizeElementType(element.type || '');
  const fields = element.fields || {};

  if (canonicalType === 'Persona') {
    if (element.isFolioPersona || element.sourceOrigin === 'folio' || element.personaSubcategory === 'folio') {
      return null; // Managed via FolioContext / personaBridge
    }
    if (element.dbmCategory === 'archetypes' || element.personaSubcategory === 'archetypes') {
      return 'archetypes';
    }
    if (
      element.dbmCategory === 'modular_characters' ||
      element.sourceOrigin === 'mcm' ||
      element.personaSubcategory === 'mcm' ||
      fields.mcmTier !== undefined ||
      fields.mcmRole !== undefined
    ) {
      return 'modular_characters';
    }
    return null; // Narrative Story Persona stays in Story Module unless opted into MCM
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
  if (canonicalType === 'Scene') {
    return 'scene';
  }
  if (canonicalType === 'Philosophy') {
    return 'philosophy';
  }

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

  const commonConsolidated = {
    ...rawBase,
    id: resolvedId,
    name: cleanTitle,
    title: cleanTitle,
    imageUrl: element.imageUrl || rawBase.imageUrl || '',
    guidance: element.guidance || fields.guidance || rawBase.guidance || undefined,
    assetHub: Array.isArray(element.assetHub) ? element.assetHub : (rawBase.assetHub || []),
    oneLinePitch: fields.oneLinePitch ?? rawBase.oneLinePitch ?? '',
    primaryTriggers: fields.primaryTriggers ?? rawBase.primaryTriggers ?? '',
    secondaryTriggers: fields.secondaryTriggers ?? rawBase.secondaryTriggers ?? '',
    triggerRegex: fields.triggerRegex ?? rawBase.triggerRegex ?? '',
    loreSnippet: fields.loreSnippet ?? rawBase.loreSnippet ?? '',
    injectionPriority: Number(fields.loreScanPriority ?? fields.injectionPriority ?? rawBase.injectionPriority ?? 5) || 5,
    conditionExpression: fields.loreRequireCondition ?? fields.conditionExpression ?? rawBase.conditionExpression ?? '',
    keywords: fields.keywords ?? rawBase.keywords ?? '',
    negative_keywords: fields.negative_keywords ?? rawBase.negative_keywords ?? '',
    updatedAt: new Date().toISOString()
  };

  if (targetCollection === 'species') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        parent_species: fields.parent_species || rawBase.parent_species || 'Independent',
        stigma: fields.stigma || fields.oneLinePitch || rawBase.stigma || '',
        homeworld: fields.habitatOrigin || fields.homeworld || rawBase.homeworld || '',
        description: fields.physicalDescription || fields.description || rawBase.description || '',
        physiologyBiology: fields.physicalDescription || fields.physiologyBiology || rawBase.physiologyBiology || '',
        cultureSociety: fields.behaviorDiet || fields.cultureSociety || rawBase.cultureSociety || '',
        roleInSetting: fields.roleInWorld || fields.roleInSetting || rawBase.roleInSetting || '',
        mechanic: fields.abilitiesPowers || fields.mechanic || rawBase.mechanic || '',
        size: fields.size || rawBase.size || 'Medium',
        cp: Number(fields.cp ?? rawBase.cp ?? 0) || 0,
        tech_level: Number(fields.tech_level ?? rawBase.tech_level ?? 3) || 3,
        meta_level: Number(fields.meta_level ?? rawBase.meta_level ?? 0) || 0
      }
    };
  }

  if (targetCollection === 'factions') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        faction_type: fields.faction_type || rawBase.faction_type || 'Major Polity',
        archetype: fields.archetype || rawBase.archetype || '',
        driving_mandate: fields.oneLinePitch || fields.driving_mandate || rawBase.driving_mandate || '',
        motto: fields.motto || rawBase.motto || '',
        description: fields.description || rawBase.description || '',
        core_beliefs: fields.ideology || fields.core_beliefs || rawBase.core_beliefs || '',
        publicAgenda: fields.goals || fields.publicAgenda || rawBase.publicAgenda || '',
        goals: fields.goals || rawBase.goals || '',
        government_type: fields.government || fields.government_type || rawBase.government_type || '',
        alliesEnemies: fields.alliesEnemies || rawBase.alliesEnemies || '',
        relationship_to_others: fields.alliesEnemies || rawBase.relationship_to_others || '',
        capital_world: fields.territory || fields.capital_world || rawBase.capital_world || '',
        territoriesAssets: fields.territory || fields.territoriesAssets || rawBase.territoriesAssets || '',
        primary_exports: fields.resources || rawBase.primary_exports || '',
        military_doctrine: fields.military_doctrine || rawBase.military_doctrine || '',
        prominent_species: fields.prominent_species || rawBase.prominent_species || '',
        tech_level: Number(fields.tech_level ?? rawBase.tech_level ?? 3) || 3,
        meta_level: Number(fields.meta_level ?? rawBase.meta_level ?? 0) || 0,
        mechanic: fields.mechanic || rawBase.mechanic || ''
      }
    };
  }

  if (CORTEX_PROPERTY_COLLECTIONS.includes(targetCollection)) {
    const dcVal = Number(fields.craft_dc ?? rawBase.craft_dc ?? rawBase.design_dc ?? 15) || 15;
    const costVal = fields.cost !== undefined && fields.cost !== ''
      ? Number(fields.cost)
      : (rawBase.costs?.credits ?? rawBase.cost ?? 0);

    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        propertySubcategory: targetCollection,
        tech_level: Number(fields.techLevel ?? fields.tech_level ?? rawBase.tech_level ?? 3) || 0,
        meta_level: Number(fields.metaLevel ?? fields.meta_level ?? rawBase.meta_level ?? 0) || 0,
        availability: fields.rarity || fields.availability || rawBase.availability || 'Common',
        description: fields.functionPurpose || fields.description || rawBase.description || '',
        aestheticForm: fields.aestheticForm || rawBase.aestheticForm || '',
        craft_dc: dcVal,
        design_dc: dcVal,
        cost: costVal,
        costs: {
          ...(rawBase.costs || {}),
          credits: costVal
        },
        weight: fields.weight !== undefined && fields.weight !== '' ? Number(fields.weight) : (rawBase.weight ?? 1),
        mechanic: fields.mechanic || rawBase.mechanic || '',
        ...(fields.damage ? { damage: fields.damage } : {}),
        ...(fields.range ? { range: fields.range } : {}),
        ...(fields.ap !== undefined && fields.ap !== '' ? { ap: Number(fields.ap) } : {}),
        ...(fields.dr !== undefined && fields.dr !== '' ? { dr: Number(fields.dr) } : {}),
        ...(fields.sp !== undefined && fields.sp !== '' ? { sp: Number(fields.sp), durability: Number(fields.sp) } : {}),
        ...(fields.nodes_consumed !== undefined && fields.nodes_consumed !== '' ? { nodes_consumed: Number(fields.nodes_consumed), nodes: Number(fields.nodes_consumed) } : {}),
        ...(fields.location ? { location: fields.location } : {}),
        mechanismPowerSource: fields.mechanismPowerSource || rawBase.mechanismPowerSource || '',
        societalImpact: fields.socialEconomicImpact || fields.societalImpact || rawBase.societalImpact || '',
        limitationsCosts: fields.weaknesses || fields.limitationsCosts || rawBase.limitationsCosts || '',
        originHistory: fields.originContext || fields.originHistory || rawBase.originHistory || '',
        interactiveType: fields.interactiveType || rawBase.interactiveType || 'none',
        vttInteractionDC: fields.vttInteractionDC ? Number(fields.vttInteractionDC) : (rawBase.vttInteractionDC ?? undefined),
        lootTable: fields.lootTable || rawBase.lootTable || ''
      }
    };
  }

  if (targetCollection === 'modular_characters') {
    const tier = Number(fields.mcmTier ?? rawBase.threatTier ?? 3) || 1;
    const role = fields.mcmRole || rawBase.competencyRole || 'Tank';
    const bossType = fields.mcmChassis || rawBase.bossType || 'Standard';
    const designation = fields.mcmDesignation || fields.roleInStory || rawBase.designation || 'Adversary';
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        threatTier: tier,
        threat_tier: tier,
        competencyRole: role,
        role,
        designation,
        bossType,
        boss_type: bossType,
        isSynthetic: Boolean(fields.isSynthetic ?? rawBase.isSynthetic),
        vitalityPoints: Number(fields.vitality ?? rawBase.vitalityPoints ?? 30) || 30,
        healthPoints: Number(fields.health ?? rawBase.healthPoints ?? 30) || 30,
        structurePoints: Number(fields.structure ?? rawBase.structurePoints ?? 60) || 60,
        armorDR: Number(fields.armorDR ?? rawBase.armorDR ?? 0) || 0,
        tech_level: Number(fields['tech-level'] ?? rawBase.tech_level ?? 3) || 3,
        meta_level: Number(fields['magic-level'] ?? rawBase.meta_level ?? 1) || 0,
        appearance: fields.physicalDescription || rawBase.appearance || '',
        voiceMannerisms: fields.personalityMannerisms || rawBase.voiceMannerisms || '',
        motivationsGoals: fields.goalsMotivations || rawBase.motivationsGoals || '',
        relationships: fields.relationships || rawBase.relationships || '',
        npcRoutine: fields.vttScript || rawBase.npcRoutine || '',
        description: fields.physicalDescription || rawBase.description || '',
        mechanic: fields.mechanic || rawBase.mechanic || ''
      }
    };
  }

  if (targetCollection === 'planetary_design' || targetCollection === 'world') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        highConcept: fields.corePremise || fields.oneLinePitch || rawBase.highConcept || '',
        description: fields.corePremise || rawBase.description || '',
        planetaryGeography: fields.continents || rawBase.planetaryGeography || '',
        geography: fields.continents || rawBase.geography || '',
        societiesGovernance: fields.majorFactions || rawBase.societiesGovernance || '',
        culture: fields.majorFactions || rawBase.culture || '',
        historicalTimeline: fields.historyTimeline || rawBase.historicalTimeline || '',
        physicsMetaphysics: fields.cosmologyPhysics || rawBase.physicsMetaphysics || ''
      }
    };
  }

  if (targetCollection === 'universe') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        description: fields.ontological || rawBase.description || '',
        cosmologyDimensions: fields.ontological || rawBase.cosmologyDimensions || '',
        laws_of_physics: fields.lawsPhysics || rawBase.laws_of_physics || '',
        fundamentalLaws: fields.lawsPhysics || rawBase.fundamentalLaws || ''
      }
    };
  }

  if (targetCollection === 'setting') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        world: fields.parentWorld || rawBase.world || '',
        description: fields.geographyArchitecture || rawBase.description || '',
        architecturalLayout: fields.geographyArchitecture || rawBase.architecturalLayout || '',
        sensoryAtmosphere: fields.sensoryDetails || rawBase.sensoryAtmosphere || '',
        inhabitants: fields.populationDemographics || rawBase.inhabitants || '',
        inhabitantsDenizens: fields.populationDemographics || rawBase.inhabitantsDenizens || '',
        points_of_interest: fields.landmarksSecrets || rawBase.points_of_interest || '',
        pointsOfInterest: fields.landmarksSecrets || rawBase.pointsOfInterest || ''
      }
    };
  }

  if (targetCollection === 'scene') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        setting_location: fields.location || rawBase.setting_location || '',
        sensoryDetails: fields.sensoryDetails || rawBase.sensoryDetails || '',
        lightingAtmosphere: fields.moodAtmosphere || rawBase.lightingAtmosphere || '',
        rewards_loot: fields.keyObjects || rawBase.rewards_loot || '',
        sceneBeats: fields.sceneBeats || rawBase.sceneBeats || '',
        description: fields.sceneBeats || rawBase.description || '',
        readAloud: fields.readAloud || rawBase.readAloud || ''
      }
    };
  }

  if (targetCollection === 'philosophy') {
    return {
      targetCollection,
      payload: {
        ...commonConsolidated,
        description: fields.coreTenets || rawBase.description || '',
        coreDogmaTenets: fields.coreTenets || rawBase.coreDogmaTenets || '',
        practices: fields.ritualsPractices || rawBase.practices || '',
        ritualsPractices: fields.ritualsPractices || rawBase.ritualsPractices || '',
        moralCodeTaboos: fields.ethics || rawBase.moralCodeTaboos || '',
        origin: fields.cosmology || rawBase.origin || '',
        cosmologyWorldview: fields.cosmology || rawBase.cosmologyWorldview || ''
      }
    };
  }

  if (CORTEX_METAPHYSICS_COLLECTIONS.includes(targetCollection)) {
    const mlVal = Number(
      String(fields.meta_level ?? fields['meta-level'] ?? fields.metaLevel ?? rawBase.meta_level ?? 1).replace(/[^0-9.-]/g, '')
    ) || 0;
    const designDcVal =
      fields.design_dc !== undefined && fields.design_dc !== ''
        ? String(fields.design_dc)
        : (rawBase.design_dc !== undefined ? String(rawBase.design_dc) : '');
    const toListIfText = (val, fallback) => {
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
        description: fields.description || fields.oneLinePitch || rawBase.description || '',
        mechanic: fields.mechanic || rawBase.mechanic || '',
        ...(targetCollection === 'synthesis'
          ? {
              synthesis_type: fields.discipline || rawBase.synthesis_type || 'Resonance Synthesis',
              crisp_prompt: fields.manifestationSensory || rawBase.crisp_prompt || ''
            }
          : targetCollection === 'disciplines'
          ? {
              discipline_skills: toListIfText(fields.meta_skill, rawBase.discipline_skills)
            }
          : {
              discipline: fields.discipline || fields.meta_skill || rawBase.discipline || '',
              meta_skill: fields.meta_skill || fields.discipline || rawBase.meta_skill || '',
              meta_level: mlVal,
              design_dc: designDcVal,
              cast_time: fields.cast_time || rawBase.cast_time || '',
              duration: fields.duration || rawBase.duration || '',
              range: toListIfText(fields.range, rawBase.range),
              area: toListIfText(fields.area, rawBase.area),
              target: toListIfText(fields.target, rawBase.target),
              effect: toListIfText(fields.effect, rawBase.effect)
            }),
        strainBacklash: fields.strainBacklash || rawBase.strainBacklash || '',
        manifestationSensory: fields.manifestationSensory || rawBase.manifestationSensory || '',
        originLore: fields.originLore || rawBase.originLore || ''
      }
    };
  }

  return {
    targetCollection,
    payload: commonConsolidated
  };
}

export { convertPersonaElementToFolio };
